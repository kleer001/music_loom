import { test } from "node:test";
import assert from "node:assert/strict";
import * as nwa from "node-web-audio-api";

for (const name of ["AudioContext", "OfflineAudioContext", "AudioWorkletNode"]) {
  if (nwa[name] && !globalThis[name]) globalThis[name] = nwa[name];
}

const { build, SAMPLE_RATE = 48000 } = await import("../src/graph.js");
const { stats } = await import("../core/metrics.js");

async function render(seed, seconds = 4) {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * SAMPLE_RATE), SAMPLE_RATE);
  await build(ctx, { seed, seconds });
  const b = await ctx.startRendering();
  return { L: b.getChannelData(0), R: b.getChannelData(b.numberOfChannels > 1 ? 1 : 0) };
}

test("renders audible signal", async () => {
  const s = stats(await render(1));
  assert.ok(s.peak > 0.001, `silent output (peak ${s.peak})`);
  assert.ok(s.peak <= 1.0, `clipping (peak ${s.peak})`);
});

test("no DC offset", async () => {
  const s = stats(await render(1));
  assert.ok(Math.abs(s.dc) < 1e-3, `DC offset ${s.dc}`);
});

// Determinism is a load-bearing constraint, so it gets a test rather than a
// convention. Byte-identity, not approximate equality: a render that is only
// nearly reproducible has an unseeded source somewhere.
test("same seed, same samples", async () => {
  const a = await render(7);
  const b = await render(7);
  assert.deepEqual(Array.from(a.L.slice(0, 4096)), Array.from(b.L.slice(0, 4096)));
});

test("different seeds differ", async () => {
  const a = await render(7);
  const b = await render(8);
  assert.notDeepEqual(Array.from(a.L.slice(0, 4096)), Array.from(b.L.slice(0, 4096)));
});
