// Offline dev tool — fetch jazz instruments from public soundfonts
// (gleitz/midi-js-soundfonts) and vendor each as a trimmed JSON of per-note base64
// MP3, for a sampler to load. Zero-dep Node (uses the global fetch, Node 18+).
// An offline tool, run by hand and never at runtime: an instrument reads the
// vendored files, it does not fetch them.
//
//   node pantry/tools/fetch_soundfont.mjs                 # fetch the built-in jazz preset
//   node pantry/tools/fetch_soundfont.mjs <inst> [<inst>…] [--lo=<note|midi>] [--hi=<note|midi>]
//   node pantry/tools/fetch_soundfont.mjs --soundfont=MusyngKite <inst> …   # alt library
//   node pantry/tools/fetch_soundfont.mjs --drums         # fetch the FluidR3 acoustic drum kit
//   node pantry/tools/fetch_soundfont.mjs --list          # print the preset and exit
//
// Per-host courtesy: a 6-second delay between requests to a host.
// FluidR3_GM is MIT (Frank Wen); MusyngKite is CC-BY-SA 3.0. The drum kit comes
// from Surikov's webaudiofont (per-note MP3 of the same FluidR3_GM standard kit,
// MIT). A LICENSE.txt travels with the fetched set.

import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "soundfonts");
const HOST_DELAY_MS = 6000;

// Soundfont sources on gleitz.github.io (same per-note MP3 format). The `tag`
// prefixes the vendored id/file so two libraries' versions of the same instrument
// don't collide; `label` annotates the display name. FluidR3_GM is the bare default.
const SOURCES = {
  FluidR3_GM: { tag: "", label: "" },
  MusyngKite: { tag: "musyng", label: "Musyng" },
};
const sfBase = (sf) => `https://gleitz.github.io/midi-js-soundfonts/${sf}`;

// A broad jazz-combo starting set (cull by ear later). Slugs are the canonical
// MIDI.js / FluidR3_GM instrument names.
const PRESET = [
  "acoustic_bass", "fretless_bass", "electric_bass_finger",
  "acoustic_grand_piano", "electric_piano_1", "vibraphone", "drawbar_organ",
  "electric_guitar_jazz",
  "trumpet", "muted_trumpet", "trombone",
  "tenor_sax", "alto_sax", "soprano_sax", "clarinet", "flute",
];

// The FluidR3 acoustic drum kit (GM percussion), vendored as one "kit" sample
// file: each role lists the GM note numbers the engine round-robins through for
// same-kind variety, from a kit table. Stored by note NAME so
// web/sampler.js parses them like any pitched table.
const DRUM_KIT = {
  id: "fluid_kit",
  name: "Acoustic Kit (FluidR3)",
  source: "webaudiofont FluidR3_GM",
  // The union of notes across all roles — what gets fetched.
  notes: [35, 36, 37, 38, 40, 42, 44, 46, 49, 51, 53, 59, 45, 47, 48, 50],
};
const wafBase = "https://surikov.github.io/webaudiofontdata/sound";

const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const midiToName = (m) => NOTE_NAMES[m % 12] + (Math.floor(m / 12) - 1);

// Note name ("Bb3", "C#4", "C4") or bare MIDI int → MIDI number (C4 = 60).
function toMidi(s) {
  if (/^\d+$/.test(s)) return Number(s);
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(s);
  if (!m) throw new Error(`bad note: ${s}`);
  const pc = PC[m[1].toLowerCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return (Number(m[3]) + 1) * 12 + pc;
}

// Default trim by role: basses sit low, everything else covers comp+lead.
function defaultRange(inst) {
  return /bass/.test(inst) ? { lo: 28, hi: 55 } : { lo: 48, hi: 84 };
}

const humanize = (id) => id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const out = { insts: [], lo: null, hi: null, list: false, drums: false, soundfont: "FluidR3_GM" };
  for (const a of argv) {
    if (a === "--list") out.list = true;
    else if (a === "--drums") out.drums = true;
    else if (a.startsWith("--lo=")) out.lo = a.slice(5);
    else if (a.startsWith("--hi=")) out.hi = a.slice(5);
    else if (a.startsWith("--soundfont=")) out.soundfont = a.slice(12);
    else if (!a.startsWith("--")) out.insts.push(a);
  }
  return out;
}

// Pull "note": "data:audio/mp3;base64,…" pairs out of the gleitz JS without
// eval-ing remote code.
function extractNotes(js) {
  const re = /"([A-Ga-g][#b]?-?\d+)"\s*:\s*"(data:audio\/mp3;base64,[A-Za-z0-9+/=]+)"/g;
  const notes = {};
  let m;
  while ((m = re.exec(js))) notes[m[1]] = m[2];
  return notes;
}

// Pull the base64 MP3 out of a webaudiofont per-note file (a `var _drum_… = {
// zones:[{ …, file:'BASE64' }] }` JS blob). The payload is ID3/MP3 despite the
// extension — store it as a standard data URI. No eval of remote code.
function extractWebAudioFont(js) {
  const m = /file:\s*'([A-Za-z0-9+/=]+)'/.exec(js);
  return m ? `data:audio/mp3;base64,${m[1]}` : null;
}

// Fetch the drum kit as one vendored sample table keyed by note name.
async function fetchDrumKit() {
  const kept = {};
  for (let i = 0; i < DRUM_KIT.notes.length; i++) {
    const n = DRUM_KIT.notes[i];
    process.stdout.write(`[${i + 1}/${DRUM_KIT.notes.length}] drum note ${n} … `);
    try {
      const res = await fetch(`${wafBase}/128${n}_0_FluidR3_GM_sf2_file.js`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const uri = extractWebAudioFont(await res.text());
      if (!uri) throw new Error("no sample payload");
      kept[midiToName(n)] = uri;
      console.log("ok");
    } catch (err) {
      console.log(`SKIPPED (${err.message})`);
    }
    if (i < DRUM_KIT.notes.length - 1) await sleep(HOST_DELAY_MS); // per-host courtesy
  }
  const count = Object.keys(kept).length;
  if (!count) throw new Error("no drum notes fetched");
  const file = `${DRUM_KIT.id}.json`;
  writeFileSync(join(OUT_DIR, file), JSON.stringify(kept));
  return { count, file };
}

function loadManifest() {
  const p = join(OUT_DIR, "manifest.json");
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return []; }
}

async function fetchInstrument(inst, lo, hi, base, file) {
  const res = await fetch(`${base}/${inst}-mp3.js`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const all = extractNotes(await res.text());
  const kept = {};
  for (const [note, uri] of Object.entries(all)) {
    const midi = toMidi(note);
    if (midi >= lo && midi <= hi) kept[note] = uri;
  }
  const count = Object.keys(kept).length;
  if (!count) throw new Error(`no notes in range ${lo}-${hi} (instrument had ${Object.keys(all).length})`);
  writeFileSync(join(OUT_DIR, file), JSON.stringify(kept));
  return count;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) { console.log(PRESET.join("\n")); return; }
  mkdirSync(OUT_DIR, { recursive: true });

  if (args.drums) {
    const manifest = loadManifest();
    process.stdout.write(`fetching ${DRUM_KIT.name} (${DRUM_KIT.notes.length} notes)…\n`);
    const { count, file } = await fetchDrumKit();
    const entry = { id: DRUM_KIT.id, name: DRUM_KIT.name, file, kit: true, source: DRUM_KIT.source };
    const i = manifest.findIndex((e) => e.id === DRUM_KIT.id);
    if (i >= 0) manifest[i] = entry; else manifest.push(entry);
    manifest.sort((a, b) => a.id.localeCompare(b.id));
    const kb = statSync(join(OUT_DIR, file)).size / 1024;
    writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`\n${DRUM_KIT.id}: ${count} drum notes, ${kb.toFixed(0)} KB · manifest: ${manifest.length} entries`);
    return;
  }

  const src = SOURCES[args.soundfont];
  if (!src) { console.error(`unknown --soundfont (try: ${Object.keys(SOURCES).join(", ")})`); process.exit(1); }
  const base = sfBase(args.soundfont);
  const insts = args.insts.length ? args.insts : PRESET;

  const manifest = loadManifest();
  const upsert = (entry) => {
    const i = manifest.findIndex((e) => e.id === entry.id);
    if (i >= 0) manifest[i] = entry; else manifest.push(entry);
  };

  let total = 0, ok = 0;
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    const def = defaultRange(inst);
    const lo = args.lo != null ? toMidi(args.lo) : def.lo;
    const hi = args.hi != null ? toMidi(args.hi) : def.hi;
    const id = src.tag ? `${src.tag}_${inst}` : inst;
    const file = `${id}.json`;
    const name = humanize(inst) + (src.label ? ` (${src.label})` : "");
    process.stdout.write(`[${i + 1}/${insts.length}] ${args.soundfont}/${inst} (midi ${lo}-${hi}) … `);
    try {
      const count = await fetchInstrument(inst, lo, hi, base, file);
      const kb = statSync(join(OUT_DIR, file)).size / 1024;
      total += kb; ok++;
      upsert({ id, name, file, lo, hi, source: args.soundfont });
      console.log(`${count} notes, ${kb.toFixed(0)} KB`);
    } catch (err) {
      console.log(`SKIPPED (${err.message})`);
    }
    if (i < insts.length - 1) await sleep(HOST_DELAY_MS); // per-host courtesy
  }

  manifest.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n${ok}/${insts.length} instruments · ${(total / 1024).toFixed(2)} MB total · manifest: ${manifest.length} entries`);
}

main();
