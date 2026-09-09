// Source: cyber_synth/cyber/fx.js
// Three-band compressor for master glue.

import { ramp } from "./fx-common.js";

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
  const band = () => {
    const comp = ctx.createDynamicsCompressor();
    comp.knee.value = 6;
    const g = ctx.createGain();
    comp.connect(g).connect(wet);
    return { comp, g };
  };

  const low = band(), mid = band(), high = band();
  const lowLP = edge("lowpass", 250);
  const midHP = edge("highpass", 250), midLP = edge("lowpass", 3000);
  const highHP = edge("highpass", 3000);
  input.connect(lowLP.in); lowLP.out.connect(low.comp);
  input.connect(midHP.in); midHP.out.connect(midLP.in); midLP.out.connect(mid.comp);
  input.connect(highHP.in); highHP.out.connect(high.comp);

  const ramp = (param, v) => param.setTargetAtTime(v, ctx.currentTime, 0.06);
  const setBand = (b, p) => {
    if (!p) return;
    if (p.threshold !== undefined) ramp(b.comp.threshold, p.threshold);
    if (p.ratio !== undefined) ramp(b.comp.ratio, p.ratio);
    if (p.attack !== undefined) ramp(b.comp.attack, p.attack);
    if (p.release !== undefined) ramp(b.comp.release, p.release);
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
