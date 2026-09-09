// Offline dev tool — turn a Standard MIDI File into a digest-ready melodic
// motif (the "hook") a song table can use. Zero-dep Node; NOT part of an
// instrument's runtime or the determinism path. Run by hand and paste the suggested
// `motif:` block into a song digest.
//
//   node pantry/tools/midi_to_motif.mjs <file.mid> [--tonic=<pitch-class 0-11|note>] [--mode=ionian] [--notes=8] [--track=N]
//
// MIDI gives notes, not chords — so this extracts only the melody skeleton.
// Chord progression / form still come from the lead-sheet catalog by hand.
//
// Needs Node 20.19+ or 22.7+. It reads the mode intervals out of the rack
// rather than restating them, and `core/scales.js` is a bare `.js` with no
// package.json above it — the rack modules keep that extension because
// instruments and browser pages import them under it. Older Node refuses to
// load such a file as a module.

import { readFileSync } from "node:fs";
import { MODES as SCALE_MODES } from "../../rack/R2-core/core/scales.js";

const PC_NAMES = { c: 0, "c#": 1, db: 1, d: 2, "d#": 3, eb: 3, e: 4, f: 5, "f#": 6, gb: 6, g: 7, "g#": 8, ab: 8, a: 9, "a#": 10, bb: 10, b: 11 };
// The church-mode names this tool takes on the command line, over the intervals
// scales.js already holds.
const MODES = {
  ionian: SCALE_MODES["major"], dorian: SCALE_MODES["dorian"], phrygian: SCALE_MODES["phrygian"],
  mixolydian: SCALE_MODES["mixolydian"], aeolian: SCALE_MODES["minor"],
};

function parseArgs(argv) {
  const out = { file: null, tonic: null, mode: "ionian", notes: 8, track: null };
  for (const a of argv) {
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (k === "tonic") out.tonic = v;
      else if (k === "mode") out.mode = v;
      else if (k === "notes") out.notes = Number(v);
      else if (k === "track") out.track = Number(v);
    } else out.file = a;
  }
  return out;
}

// --- minimal SMF reader -------------------------------------------------
function readChunks(buf) {
  let p = 0;
  const u32 = () => { const v = buf.readUInt32BE(p); p += 4; return v; };
  const u16 = () => { const v = buf.readUInt16BE(p); p += 2; return v; };
  if (buf.toString("ascii", 0, 4) !== "MThd") throw new Error("not a MIDI file (no MThd)");
  p = 4; u32(); // header length
  const format = u16(), ntracks = u16(), division = u16();
  const tracks = [];
  while (p < buf.length && tracks.length < ntracks) {
    const id = buf.toString("ascii", p, p + 4); p += 4;
    const len = u32();
    const end = p + len;
    if (id === "MTrk") tracks.push(readTrack(buf, p, end));
    p = end;
  }
  return { format, division, tracks };
}

// A track → { notes: [{pitch, tick}], tempo } (first set-tempo seen).
function readTrack(buf, start, end) {
  let p = start, tick = 0, status = 0, tempo = 500000;
  const notes = [];
  const varlen = () => { let v = 0, b; do { b = buf[p++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; };
  while (p < end) {
    tick += varlen();
    let b = buf[p];
    if (b & 0x80) { status = b; p++; } // else running status
    const type = status & 0xf0;
    if (status === 0xff) { // meta
      const meta = buf[p++]; const len = varlen();
      if (meta === 0x51) tempo = (buf[p] << 16) | (buf[p + 1] << 8) | buf[p + 2];
      p += len;
    } else if (status === 0xf0 || status === 0xf7) { // sysex
      const len = varlen(); p += len;
    } else if (type === 0x90) { // note on
      const pitch = buf[p++], vel = buf[p++];
      if (vel > 0) notes.push({ pitch, tick });
    } else if (type === 0x80) { p += 2; } // note off
    else if (type === 0xc0 || type === 0xd0) { p += 1; } // program / channel pressure
    else { p += 2; } // 2-data-byte channel messages
  }
  return { notes, tempo };
}

// --- motif extraction ---------------------------------------------------
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) { console.error("usage: node pantry/tools/midi_to_motif.mjs <file.mid> [--tonic=] [--mode=] [--notes=] [--track=]"); process.exit(1); }
  const { division, tracks } = readChunks(readFileSync(args.file));
  const tpq = division & 0x8000 ? 24 : division; // ignore SMPTE; assume PPQ

  // Melody = the candidate track with the highest median pitch (melodies sit on
  // top), unless one is pinned with --track.
  const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] ?? 0; };
  const cands = tracks.map((t, i) => ({ i, t, score: t.notes.length ? median(t.notes.map((n) => n.pitch)) : -1 }));
  const mel = args.track != null ? tracks[args.track] : cands.filter((c) => c.t.notes.length > 3).sort((a, b) => b.score - a.score)[0]?.t;
  if (!mel || !mel.notes.length) { console.error("no melodic track found"); process.exit(1); }

  const phrase = mel.notes.slice(0, Math.max(2, args.notes));
  const t0 = phrase[0].tick;
  const beats = phrase.map((n) => +((n.tick - t0) / tpq).toFixed(3));

  // Tonic: explicit, else the lowest pitch-class in the phrase (a decent guess
  // for folk tunes that open and close on the tonic).
  const tonicPc = args.tonic != null
    ? (/^\d+$/.test(args.tonic) ? Number(args.tonic) % 12 : PC_NAMES[args.tonic.toLowerCase()])
    : Math.min(...phrase.map((n) => n.pitch)) % 12;
  const scale = MODES[args.mode] || MODES.ionian;

  // Pitch → scale degree (1-based, octave-extended). Nearest scale slot.
  const toDegree = (pitch) => {
    const rel = pitch - (tonicPc + 12 * Math.floor((Math.min(...phrase.map((n) => n.pitch)) - tonicPc) / 12));
    const oct = Math.floor(rel / 12), pc = ((rel % 12) + 12) % 12;
    let idx = scale.indexOf(pc);
    if (idx < 0) idx = scale.reduce((best, s, k) => (Math.abs(s - pc) < Math.abs(scale[best] - pc) ? k : best), 0);
    return oct * 7 + idx + 1;
  };
  const degrees = phrase.map((n) => toDegree(n.pitch));

  console.log(`file:    ${args.file}`);
  console.log(`ppq:     ${tpq}   tracks: ${tracks.length}   melody notes: ${mel.notes.length}`);
  console.log(`tonic:   pc ${tonicPc}   mode: ${args.mode}`);
  console.log(`pitches: ${phrase.map((n) => n.pitch).join(", ")}`);
  console.log(`\nmotif: { degrees: [${degrees.join(", ")}], rhythm: [${beats.join(", ")}] },`);
}

main();
