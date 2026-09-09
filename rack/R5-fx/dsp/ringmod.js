// Source: cyber_synth/cyber/fx.js
// Ring modulator.

import { ramp } from "./fx-common.js";

// ---- Ring modulator ----------------------------------------------------------

// Gain modulated by an oscillator: the carrier osc drives a gain whose audio input
// is the signal → classic AM/ring timbre.
export function makeRingmod(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const ring = ctx.createGain(); ring.gain.value = 0; // modulated by the osc
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = 0;
  const depth = ctx.createGain(); depth.gain.value = 1;
  osc.connect(depth).connect(ring.gain);
  input.connect(dry).connect(output);
  input.connect(ring).connect(wet).connect(output);
  let started = false;
  return {
    input, output,
    set(p = {}) {
      if (p.freq !== undefined) {
        osc.frequency.setTargetAtTime(Math.max(0, p.freq), ctx.currentTime, 0.02);
        if (!started && p.freq > 0) { try { osc.start(); started = true; } catch (_) {} }
      }
      if (p.mix !== undefined) { ramp(wet.gain, p.mix, 0.05, ctx); ramp(dry.gain, 1 - p.mix, 0.05, ctx); }
    },
  };
}
