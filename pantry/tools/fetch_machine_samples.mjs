// One-time sample setup for the industrial engine. Mirrors scripts/fetch_soundfont.js.
//
//   node fetch_samples.mjs   (or: npm run samples)
//
// 1. Downloads a few CC0 rhythmic loops from the Sonic Pi sample library (which are
//    explicitly public-domain / CC0 — see their etc/samples/README.md). Two are literal
//    machine recordings (a 3D printer, an industrial loop) — perfect "found rhythm".
// 2. Renders two local WAV loops (our own output, CC0-by-authorship) so the headless
//    Node pipeline test can decode real audio without a FLAC decoder.
// 3. Writes industrial/samples/LICENSE.txt.
//
// Network is best-effort: if a download fails (offline/blocked), the engine still has
// the rendered WAV loops + the synthesized machine corpus, so nothing blocks.

import { writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { encodeWav } from "../../rack/R2-core/core/wav.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "industrial", "samples");

// CC0 loops from the Sonic Pi sample library (CC0 / public domain per their README).
const CC0_BASE = "https://raw.githubusercontent.com/sonic-pi-net/sonic-pi/dev/etc/samples";
const REMOTE = [
  { file: "loop_3d_printer.flac", note: "field recording of a 3D printer — a machine rhythm" },
  { file: "loop_industrial.flac", note: "industrial machine texture loop" },
  { file: "loop_compus.flac", note: "musical drum/beat loop" },
];

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function download(file) {
  const dest = join(OUT, file);
  if (await exists(dest)) { console.log(`  ✓ ${file} (already present)`); return true; }
  try {
    const res = await fetch(`${CC0_BASE}/${file}`, { headers: { "user-agent": "cyber_synth/0.1" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const bytes = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, bytes);
    console.log(`  ✓ ${file} (${bytes.length} bytes)`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${file} — ${e.message} (skipping; local WAVs cover the pipeline)`);
    return false;
  }
}

// --- local WAV renderers (real audio, CC0-by-authorship) ---

const SR = 22050;

function render(seconds, fn) {
  const n = (SR * seconds) | 0;
  const d = new Float32Array(n);
  fn(d, n);
  // peak-normalize to -1 dBFS
  let max = 1e-6;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.abs(d[i]));
  const g = 0.89 / max;
  for (let i = 0; i < n; i++) d[i] *= g;
  return d;
}

function addKick(d, t0) {
  const start = (t0 * SR) | 0;
  for (let i = 0; i < SR * 0.3 && start + i < d.length; i++) {
    const tt = i / SR;
    const f = 120 * Math.exp(-tt * 28) + 48;
    const env = Math.exp(-tt * 9);
    d[start + i] += Math.sin(2 * Math.PI * f * tt) * env * 0.9;
  }
}
function addSnare(d, t0) {
  const start = (t0 * SR) | 0;
  for (let i = 0; i < SR * 0.18 && start + i < d.length; i++) {
    const tt = i / SR;
    const env = Math.exp(-tt * 22);
    const tone = Math.sin(2 * Math.PI * 185 * tt) * 0.4;
    d[start + i] += (Math.random() * 2 - 1) * env * 0.5 + tone * env;
  }
}
function addHat(d, t0, open = false) {
  const start = (t0 * SR) | 0;
  const dur = open ? 0.12 : 0.04;
  let hp = 0;
  for (let i = 0; i < SR * dur && start + i < d.length; i++) {
    const tt = i / SR;
    const w = Math.random() * 2 - 1;
    hp = w - (hp * 0.0 + 0); // crude HP via difference
    const env = Math.exp(-tt * (open ? 16 : 55));
    d[start + i] += (w - 0.5 * Math.random()) * env * 0.22;
  }
}

function technoLoop() {
  const bpm = 128, beat = 60 / bpm, step = beat / 4; // 16ths
  const bars = 2, steps = 16 * bars;
  const seconds = steps * step + 0.2;
  return render(seconds, (d) => {
    for (let s = 0; s < steps; s++) {
      const t = s * step;
      if (s % 4 === 0) addKick(d, t); // four-on-the-floor
      if (s % 8 === 4) addSnare(d, t); // backbeat (2 & 4)
      if (s % 2 === 1) addHat(d, t, s % 8 === 7); // off-beat hats, open on the "and of 4"
    }
  });
}

function machineLoop() {
  // a synthetic "machine": periodic clank + motor hum + hiss, ~140 BPM-ish cycle
  const seconds = 3.0;
  return render(seconds, (d, n) => {
    for (let i = 0; i < n; i++) {
      const tt = i / SR;
      d[i] += Math.sin(2 * Math.PI * 60 * tt) * 0.12; // motor hum
      d[i] += (Math.random() * 2 - 1) * 0.04; // hiss
    }
    const period = 0.3; // clank every 300ms
    for (let t = 0; t < seconds; t += period) {
      const start = (t * SR) | 0;
      for (let i = 0; i < SR * 0.08 && start + i < n; i++) {
        const tt = i / SR;
        const env = Math.exp(-tt * 40);
        d[start + i] += Math.sin(2 * Math.PI * 320 * tt) * env * 0.6 + (Math.random() * 2 - 1) * env * 0.3;
      }
    }
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("Downloading CC0 loops (Sonic Pi sample library):");
  for (const r of REMOTE) await download(r.file);

  console.log("Rendering local WAV loops (CC0-by-authorship):");
  await writeFile(join(OUT, "synth_techno_loop.wav"), Buffer.from(encodeWav([technoLoop()], SR)));
  await writeFile(join(OUT, "synth_machine_loop.wav"), Buffer.from(encodeWav([machineLoop()], SR)));
  console.log("  ✓ synth_techno_loop.wav, synth_machine_loop.wav");

  const license = `Sample sources — cyber_synth / industrial engine
======================================================

LOCAL (rendered by fetch_samples.mjs):
  synth_techno_loop.wav, synth_machine_loop.wav
  — generated by this project; dedicated to the public domain (CC0).

DOWNLOADED — Sonic Pi sample library (CC0 / public domain):
  loop_3d_printer.flac, loop_industrial.flac, loop_compus.flac
  Source: https://github.com/sonic-pi-net/sonic-pi (etc/samples)
  Per their etc/samples/README.md, all samples are placed in the public domain
  via the Creative Commons 0 license (https://creativecommons.org/publicdomain/zero/1.0/),
  sourced from freesound.org / donated by Uwe Zahn (Arovane). No attribution required;
  credited here as a courtesy.

Everything here is CC0 — free for any use, commercial or not, no attribution required.
`;
  await writeFile(join(OUT, "LICENSE.txt"), license);
  console.log("  ✓ LICENSE.txt");
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
