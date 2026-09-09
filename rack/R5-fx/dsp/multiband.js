// Source: cyber_synth/cyber/fx.js
// Three-band compressor for master glue.

import { ramp } from "./fx-common.js";
import { loadComp, makeComp } from "./comp.js";

// The bands are comp.js, not DynamicsCompressorNode. Measured against Chrome, a
// DynamicsCompressorNode does not agree with itself across the two runtimes —
// masterbus.js keeps one out of its chain for the same reason, and this file
// used three. Call loadMultiband(ctx) before makeMultiband(ctx).
export const loadMultiband = (ctx) => loadComp(ctx);

// ---- Multiband compressor (master glue) --------------------------------------

// Split the master into 3 bands (low/mid/high) with Linkwitz-Riley-4 crossovers (two
// cascaded Butterworth biquads per edge, so the bands sum flat), compress each band
// independently with a DynamicsCompressorNode, then recombine. Per-band compression is
// the genre "glue" a single full-band compressor can't give — it tames the kick/sub
// without pumping the hats, etc. `set({ on })` cross-fades a clean bypass.
export function makeMultiband(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1; // bypass path (on:false)
  const wet = ctx.createGain(); wet.gain.value = 0;
  input.connect(dry).connect(output);
  wet.connect(output);

  // LR4 edge = two cascaded Butterworth (Q=0.707) biquads of the same type.
  const edge = (type, freq) => {
    const a = ctx.createBiquadFilter(), b = ctx.createBiquadFilter();
    a.type = b.type = type;
    a.frequency.value = b.frequency.value = freq;
    a.Q.value = b.Q.value = 0.7071;
    a.connect(b);
    return { in: a, out: b, freqs: [a.frequency, b.frequency] };
  };
  // Defaults chosen to match what a DynamicsCompressorNode did here: its own
  // defaults, with the knee this file always set to 6.
  const band = () => {
    const comp = makeComp(ctx, {
      thresholdDb: -24, ratio: 12, kneeDb: 6, attackMs: 3, releaseMs: 250, makeupDb: 0,
    });
    const g = ctx.createGain();
    comp.output.connect(g).connect(wet);
    return { comp, g };
  };

  const low = band(), mid = band(), high = band();
  const lowLP = edge("lowpass", 250);
  const midHP = edge("highpass", 250), midLP = edge("lowpass", 3000);
  const highHP = edge("highpass", 3000);
  input.connect(lowLP.in); lowLP.out.connect(low.comp.input);
  input.connect(midHP.in); midHP.out.connect(midLP.in); midLP.out.connect(mid.comp.input);
  input.connect(highHP.in); highHP.out.connect(high.comp.input);

  const ramp = (param, v) => param.setTargetAtTime(v, ctx.currentTime, 0.06);
  // Parameter names are the DynamicsCompressorNode ones this file has always
  // taken — threshold in dB, attack and release in seconds — mapped onto comp.js.
  const setBand = (b, p) => {
    if (!p) return;
    const next = {};
    if (p.threshold !== undefined) next.thresholdDb = p.threshold;
    if (p.ratio !== undefined) next.ratio = p.ratio;
    if (p.attack !== undefined) next.attackMs = p.attack * 1000;
    if (p.release !== undefined) next.releaseMs = p.release * 1000;
    if (Object.keys(next).length) b.comp.set(next);
    if (p.gain !== undefined) ramp(b.g.gain, Math.pow(10, p.gain / 20)); // dB → linear makeup
  };

  return {
    input, output,
    set(p = {}) {
      if (p.on !== undefined) { ramp(wet.gain, p.on ? 1 : 0); ramp(dry.gain, p.on ? 0 : 1); }
      if (p.xoverLow !== undefined) { ramp(lowLP.freqs[0], p.xoverLow); ramp(lowLP.freqs[1], p.xoverLow); ramp(midHP.freqs[0], p.xoverLow); ramp(midHP.freqs[1], p.xoverLow); }
      if (p.xoverHigh !== undefined) { ramp(midLP.freqs[0], p.xoverHigh); ramp(midLP.freqs[1], p.xoverHigh); ramp(highHP.freqs[0], p.xoverHigh); ramp(highHP.freqs[1], p.xoverHigh); }
      setBand(low, p.low); setBand(mid, p.mid); setBand(high, p.high);
    },
  };
}
