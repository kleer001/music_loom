#!/usr/bin/env node
// Bounce the instrument's graph through an OfflineAudioContext, write a WAV,
// and print what it measured.
//
//   node render.mjs --seconds=8 --seed=7 --out=tmp/take.wav
//   node render.mjs --sweep                  every seed in a small set
//   node render.mjs --headroom               pre-limiter level, and the gain that fixes it
//
// The graph is built by src/graph.js, which must run against a plain
// AudioContext and an OfflineAudioContext alike. That is the whole reason the
// no-browser-only-node rule exists.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as nwa from "node-web-audio-api";

// node-web-audio-api exposes the constructors as module exports; the graph
// builder expects them as globals, exactly as in a browser.
for (const name of [
  "AudioContext", "OfflineAudioContext", "AudioWorkletNode",
  "AudioBuffer", "GainNode", "OscillatorNode", "BiquadFilterNode",
]) {
  if (nwa[name] && !globalThis[name]) globalThis[name] = nwa[name];
}

const { build, SAMPLE_RATE = 48000 } = await import("./src/graph.js");
const { stats, spectrum } = await import("./core/metrics.js");
const { encodeWav } = await import("./core/wav.js");

const argv = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v === undefined ? true : v];
  }),
);

const num = (k, d) => (argv[k] === undefined ? d : Number(argv[k]));

async function render({ seed = 1, seconds = 8 } = {}) {
  const frames = Math.ceil(seconds * SAMPLE_RATE);
  const ctx = new OfflineAudioContext(2, frames, SAMPLE_RATE);
  await build(ctx, { seed, seconds });
  const buf = await ctx.startRendering();
  return {
    L: buf.getChannelData(0),
    R: buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0),
  };
}

const dB = (x) => (20 * Math.log10(Math.max(1e-12, x))).toFixed(2);

function report(label, r) {
  const s = stats(r);
  const f = spectrum(r, SAMPLE_RATE);
  const total = f.lo + f.md + f.hi || 1;
  const pct = (x) => ((100 * x) / total).toFixed(0).padStart(3);
  console.log(
    `${label.padEnd(14)} peak ${dB(s.peak).padStart(7)} dBFS   ` +
      `rms ${s.rmsDb.toFixed(2).padStart(7)} dB   ` +
      `dc ${s.dc.toExponential(1).padStart(9)}   ` +
      `width ${s.widthDb.toFixed(1).padStart(6)} dB`,
  );
  console.log(
    `${"".padEnd(14)} centroid ${f.centroid.toFixed(0).padStart(5)} Hz   ` +
      `bands lo ${pct(f.lo)}%  mid ${pct(f.md)}%  hi ${pct(f.hi)}%`,
  );
  return { ...s, ...f };
}

// p99.9 — the sustained loud level, ignoring the handful of transient peaks a
// limiter would catch anyway. This is what the master gain should be set against.
function percentile(r, p = 0.999) {
  const a = Float32Array.from(r.L, Math.abs).sort();
  return a[Math.min(a.length - 1, Math.floor(a.length * p))];
}

const seconds = num("seconds", 8);

if (argv.sweep) {
  const seeds = String(argv.sweep === true ? "1,2,3,4,5" : argv.sweep)
    .split(",")
    .map(Number);
  for (const seed of seeds) report(`seed ${seed}`, await render({ seed, seconds }));
} else if (argv.headroom) {
  // Render long enough to reach steady state, then say what gain would put the
  // sustained level just under a limiter's reach. A quiet graph needs a boost,
  // so the figure is above 1 as often as below it — which is why it is not
  // called a trim.
  const r = await render({ seed: num("seed", 1), seconds: Math.max(seconds, 12) });
  const p = percentile(r);
  report("headroom", r);
  const gain = 0.9 / Math.max(1e-6, p);
  const gainDb = 20 * Math.log10(gain);
  console.log(
    `\n  p99.9 ${dB(p)} dBFS  ->  master gain ${gain.toFixed(3)}x ` +
      `(${gainDb >= 0 ? "+" : ""}${gainDb.toFixed(2)} dB ${gainDb >= 0 ? "boost" : "cut"})`,
  );
  console.log("  (aim for p99.9 near 0.9 so the limiter catches transients, not everything)");
} else {
  const seed = num("seed", 1);
  const r = await render({ seed, seconds });
  report(`seed ${seed}`, r);
  if (argv.out) {
    const out = String(argv.out);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(encodeWav([r.L, r.R], SAMPLE_RATE)));
    console.log(`\n  wrote ${out}`);
  }
}
