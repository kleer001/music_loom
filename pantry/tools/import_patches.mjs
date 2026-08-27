// import_patches.mjs — Vital preset → cyber_synth patch importer.
//
// Walks a directory of `.vital` presets (plain JSON), maps each to a patch in our schema
// (cyber/patches.js / docs/design/patch_schema.md), normalizes + clamps via loadPatch, groups
// by the preset's own `preset_style`, and writes one patch per file:
//   data/patches/<style>/<name>.json   ({ schema:1, name, ...flat poly fields })
// Then prints a count-per-style summary. Build-time, deterministic (no randomness).
//
// SOURCE (CC-BY-4.0 — attribute): clone the patch archive, then point this at its Vital folder:
//   git clone --depth 1 https://github.com/instatetragrammaton/Patches.git /tmp/Patches
//   node scripts/import_patches.mjs "/tmp/Patches/Matt Tytel Vital"
// (atsushieno/open-vital-resources is CC0 if you want a public-domain set.) Raw `.vital` files
// are NOT vendored into this repo — only the derived patch JSON is committed.
//
// Vital → patch field mapping (lossy — our engine is a simplified subtractive/fm/wavetable):
//   engine     ← "wavetable" (Vital is a wavetable synth)
//   peak       ← osc_1_level, capped at 0.6 to keep master headroom
//   uni        ← osc_1_unison_voices
//   uniDetune  ← range·100·(detune/10)^power cents  (the mine_presets.mjs approximation)
//   osc2/oct2  ← osc_2_on ? osc_2_level / round(osc_2_transpose/12)
//   wtPos      ← osc_1_spectral_morph_amount ;  wtWarp ← (osc_1_distortion_amount-0.5)·2
//   filterType ← filter_1_blend  (0 lp · ~1 bp · 2 hp — Vital analog blend morph)
//   cutoff     ← midiToHz(filter_1_cutoff)        resonance ← filter_1_resonance·20
//   drive      ← filter_1_drive(dB)/20            A/D/S/R   ← env_1_attack/decay/sustain/release
//   filterEnv  ← |amount| of any env_N → filter cutoff modulation
//   lfos[0]    ← first lfo_N modulation: rate 2^lfo_N_frequency Hz, dest mapped from its target
// DROPPED (no engine equivalent): sample/wavetable identity, distortion/spectral types, second
//   filter, full mod matrix beyond one LFO + filter-env, macros, per-osc effects, FX, keytrack.

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPatch } from "../../rack/R6-voices/voices/patches.js";

const HERE = dirname(fileURLToPath(import.meta.url));

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e.endsWith(".vital")) out.push(p);
  }
  return out;
}

const midiToHz = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Reused from mine_presets.mjs: Vital unison detune → cents (approx; Vital skews this).
function detuneCents(s, i) {
  const d = s[`osc_${i}_unison_detune`] ?? 0, range = s[`osc_${i}_detune_range`] ?? 2, pow = s[`osc_${i}_detune_power`] ?? 1;
  return range * 100 * Math.pow(Math.max(0, d) / 10, pow);
}

// Vital analog filter `blend` morphs lp → bp → hp across 0..2.
function filterTypeOf(s) {
  const b = s.filter_1_blend ?? 0;
  return b > 1.34 ? "hp" : b > 0.67 ? "bp" : "lp";
}

// Vital modulation destination string → our note-scope MOD_TARGETS name.
function mapDest(d) {
  if (/cutoff/.test(d)) return "cutoff";
  if (/resonance/.test(d)) return "resonance";
  if (/pan/.test(d)) return "pan";
  if (/(tune|transpose|pitch)/.test(d)) return "pitch";
  if (/(level|amplitude|amp)/.test(d)) return "amp";
  return "cutoff";
}

// Vital stores the amount of modulation route i (0-based in `modulations`) as
// settings.modulation_<i+1>_amount; pair them up and keep the wired routes.
function activeMods(s) {
  return (s.modulations || [])
    .map((m, i) => ({ source: m.source, destination: m.destination, amount: s[`modulation_${i + 1}_amount`] ?? 0 }))
    .filter((m) => m.source && m.destination);
}

function mapPreset(j) {
  const s = j.settings;
  const mods = activeMods(s);
  const lfoMod = mods.find((m) => /^lfo_\d/.test(m.source));
  const envCut = mods.find((m) => /^env_\d/.test(m.source) && /cutoff/.test(m.destination));
  const fOn = !!s.filter_1_on;

  const patch = {
    schema: 1,
    engine: "wavetable",
    peak: Math.min(0.6, s.osc_1_level ?? 0.7),
    uni: s.osc_1_unison_voices ?? 1,
    uniDetune: detuneCents(s, 1),
    osc2: s.osc_2_on ? (s.osc_2_level ?? 0) : 0,
    oct2: s.osc_2_on ? Math.round((s.osc_2_transpose ?? 0) / 12) : 0,
    wtPos: s.osc_1_spectral_morph_amount ?? 0.3,
    wtWarp: ((s.osc_1_distortion_amount ?? 0.5) - 0.5) * 2,
    filterType: filterTypeOf(s),
    cutoff: fOn ? midiToHz(s.filter_1_cutoff ?? 60) : 2000,
    resonance: fOn ? (s.filter_1_resonance ?? 0) * 20 : 0.8,
    drive: fOn ? (s.filter_1_drive ?? 0) / 20 : 0,
    attack: s.env_1_attack ?? 0.01,
    decay: s.env_1_decay ?? 0.2,
    sustain: s.env_1_sustain ?? 0.8,
    release: s.env_1_release ?? 0.3,
    filterEnv: envCut ? Math.abs(envCut.amount) : 0,
  };

  if (lfoMod) {
    const i = lfoMod.source.match(/^lfo_(\d)/)[1];
    patch.lfos = [{
      shape: "tri",
      rate: Math.pow(2, s[`lfo_${i}_frequency`] ?? 1),
      sync: false, div: 4,
      dest: mapDest(lfoMod.destination),
      amount: Math.abs(lfoMod.amount),
    }];
  }
  return patch;
}

// Lowercase, hyphen-separated, filesystem-safe slug; collapses runs and trims edges.
const slug = (s) => String(s || "").trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "untitled";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/import_patches.mjs <vital-presets-dir>"); process.exit(1); }

const outRoot = join(HERE, "..", "data", "patches");
const files = walk(dir);
const counts = {};
const bank = {}; // style → [nameSlug, ...] for the browser manifest
const usedNames = new Set(); // (styleSlug/nameSlug) → dedupe filename collisions

for (const f of files) {
  let j;
  try { j = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
  if (!j.settings) continue;

  const style = slug(j.preset_style || "other");
  const name = j.preset_name || "untitled";
  let nameSlug = slug(name);
  let key = `${style}/${nameSlug}`;
  for (let n = 2; usedNames.has(key); n++) key = `${style}/${(nameSlug = `${slug(name)}-${n}`)}`;
  usedNames.add(key);

  const patch = loadPatch(mapPreset(j));
  patch.name = name;

  const styleDir = join(outRoot, style);
  mkdirSync(styleDir, { recursive: true });
  writeFileSync(join(styleDir, `${nameSlug}.json`), JSON.stringify(patch, null, 2) + "\n");
  counts[style] = (counts[style] || 0) + 1;
  (bank[style] ||= []).push(nameSlug);
}

// Manifest the patch browser (pages/cyber-synth-app.js) fetches: { <style>: [name, ...] }.
const index = {};
for (const style of Object.keys(bank).sort()) index[style] = bank[style].sort();
writeFileSync(join(outRoot, "index.json"), JSON.stringify(index, null, 2) + "\n");

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log(`\nImported ${total} Vital presets → ${outRoot}\n`);
for (const [style, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${style.padEnd(16)} ${String(n).padStart(4)}`);
}
console.log("");
