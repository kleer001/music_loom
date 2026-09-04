// import_wavetables.mjs — CC0 wavetable WAV bank → derived harmonic-coefficient JSON.
//
// Reads a directory of single-cycle wavetable WAV banks, slices each bank into fixed-length
// single-cycle frames, FFTs each frame (core/dsp.js), keeps the first H harmonics, downsamples
// to ~16 frames, and writes one derived table per bank to <bank>/<name>.json plus an
// index.json manifest. A wavetable scanner consumes these through the same frame interface
// as the procedural generators — see voices/wavetable_scanning.md.
//
// SOURCE (CC0-1.0 — public domain, no attribution required but credited): clone the WaveEdit
// Online bank archive, then point this at its sample folder:
//   git clone --depth 1 https://github.com/smpldsnds/wavedit-online.git /tmp/wavedit
//   node pantry/tools/import_wavetables.mjs /tmp/wavedit/samples ZAP VOXSYNTH VIRUS_SA WAVETABL
// A WaveEdit bank is 64 frames × 256 samples (mono 16-bit). Pass bank file stems (without
// .WAV) after the dir to import a chosen subset; omit them to import every WAV in the dir.
// Raw .wav files are NOT vendored — only the derived coefficient JSON is committed
// (zero-dep, license-clean). Build-time, deterministic (no randomness).
//
// Flags: --frame=256 (single-cycle length, samples) --frames=16 (output frame count)
//        --harmonics=32 (kept harmonic coefficients) --name=<slug> (override, single bank only)
//
// FFT → PeriodicWave coefficient mapping: for a real frame x, the radix-2 fft() returns bins
// re[k] = Σ x·cos(2πkt/F), im[k] = -Σ x·sin(2πkt/F). The Web Audio PeriodicWave reconstructs
// Σ (real[k]·cos + imag[k]·sin), so real[k] = re[k], imag[k] = -im[k] (scaled by 1/F to keep
// coefficients sane; createPeriodicWave renormalizes amplitude anyway). DC (k=0) imag is 0.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeWav, toMono } from "../../rack/R2-core/core/wav.js";
import { fft } from "../../rack/R2-core/core/dsp.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "data", "wavetables");

const SOURCE = "WaveEdit Online (github.com/smpldsnds/wavedit-online)";
const LICENSE = "CC0-1.0";

// Lowercase, hyphen-separated, filesystem-safe slug.
const slug = (s) => String(s || "").trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "table";

function parseArgs(argv) {
  const opts = { frame: 256, frames: 16, harmonics: 32, name: null };
  const positional = [];
  for (const a of argv) {
    const m = a.match(/^--(\w+)=(.+)$/);
    if (m) {
      const [, k, v] = m;
      if (k === "name") opts.name = v;
      else if (k in opts) opts[k] = parseInt(v, 10);
      else throw new Error(`unknown flag --${k}`);
    } else positional.push(a);
  }
  return { opts, positional };
}

// Single-cycle frame (Float32Array, length = pow2) → { real:[H], imag:[H] } harmonic coeffs.
function frameToHarmonics(samples, H) {
  const F = samples.length;
  const re = new Float32Array(F), im = new Float32Array(F);
  re.set(samples);
  fft(re, im);
  const real = new Array(H), imag = new Array(H);
  for (let k = 0; k < H; k++) {
    real[k] = re[k] / F;
    imag[k] = k === 0 ? 0 : -im[k] / F; // sine-coefficient sign; DC has no phase
  }
  return { real, imag };
}

// Pick `count` evenly-spaced indices from [0, total).
function pickIndices(total, count) {
  if (count >= total) return Array.from({ length: total }, (_, i) => i);
  const out = [];
  for (let k = 0; k < count; k++) out.push(Math.round((k * (total - 1)) / (count - 1)));
  return out;
}

// Decode one bank WAV → derived table object.
function importBank(path, opts, name) {
  const buf = readFileSync(path);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const { data } = toMono(decodeWav(ab));
  const F = opts.frame;
  const total = Math.floor(data.length / F);
  if (total < 1) throw new Error(`${path}: ${data.length} samples < one ${F}-sample frame`);
  const chosen = pickIndices(total, opts.frames);
  const tableData = chosen.map((fi) => frameToHarmonics(data.subarray(fi * F, fi * F + F), opts.harmonics));
  return {
    name,
    harmonics: opts.harmonics,
    frames: tableData.length,
    source: SOURCE,
    license: LICENSE,
    data: tableData,
  };
}

const { opts, positional } = parseArgs(process.argv.slice(2));
const dir = positional[0];
if (!dir) {
  console.error("usage: node pantry/tools/import_wavetables.mjs <wav-dir> [bankStem ...] [--frame=256 --frames=16 --harmonics=32]");
  process.exit(1);
}

// Resolve which bank files to import: explicit stems, else every .wav in the dir.
let files;
const stems = positional.slice(1);
if (stems.length) {
  files = stems.map((s) => {
    const direct = join(dir, s);
    const candidates = [direct, `${direct}.WAV`, `${direct}.wav`];
    const hit = candidates.find((c) => { try { readFileSync(c); return true; } catch { return false; } });
    if (!hit) throw new Error(`no WAV for "${s}" in ${dir}`);
    return hit;
  });
} else {
  files = readdirSync(dir).filter((e) => /\.wav$/i.test(e)).map((e) => join(dir, e));
}
if (opts.name && files.length > 1) throw new Error("--name applies to a single bank only");

mkdirSync(OUT_DIR, { recursive: true });
const index = [];
for (const f of files) {
  const name = opts.name || slug(basename(f).replace(/\.wav$/i, ""));
  const table = importBank(f, opts, name);
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(table) + "\n");
  index.push(name);
  console.log(`  ${name.padEnd(20)} ${table.frames} frames × ${table.harmonics} harmonics  ← ${basename(f)}`);
}
index.sort();
writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`\nWrote ${index.length} table(s) + index.json → ${OUT_DIR}\n`);
