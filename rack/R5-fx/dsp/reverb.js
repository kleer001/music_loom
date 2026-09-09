// Source: cyber_synth/cyber/fx.js
// Convolver reverb with switchable modes.

import { impulse, springImpulse } from "../core/dsp.js";
import { FLOOR, ramp, dipAndRewire } from "./fx-common.js";

// ---- Reverb (convolver + switchable modes) -----------------------------------

// A ConvolverNode (core impulse()) with modes:
//  - "ducked":  wet ducked by the sidechain (engine routes wet through a duck gain).
//  - "shimmer": TRUE octave-up feedback — the wet tail runs through makePitchShifter
//               (+12 st) and a high-shelf lift, then back into the convolver: a real
//               rising sheen that re-pitches on every pass (the classic shimmer).
//  - "gated":   the wet is gated by a fast env on hits (engine calls gate()).
//  - "freeze":  hold the tail by sustaining the wet return (engine calls freeze()).
//  - "reverse": uses a reversed impulse so the wash swells INTO the hit.
//  - "spring":  a SYNTHESIZED dispersive spring impulse (core/dsp.js springImpulse) — the
//               chirpy "boing", bright/metallic, midrange-weighted tail Ott puts on rimshots/
//               snares. `springColor` sets the mid centre Hz.
export function makeReverb(ctx) {
  const input = ctx.createGain();   // sends arrive here
  const pre = ctx.createDelay(0.2); // pre-delay keeps transients clear
  pre.delayTime.value = 0.012;
  const conv = ctx.createConvolver();
  let decay = 1.8;
  conv.buffer = impulse(ctx, decay, { dark: 0.6, stereo: true });
  const wet = ctx.createGain(); wet.gain.value = 0.22;
  const duck = ctx.createGain(); duck.gain.value = 1; // sidechain-driven in "ducked"
  const output = ctx.createGain();

  // Shimmer feedback loop: tail → +12st pitch shifter → brighten → feed back.
  const shimFb = ctx.createGain(); shimFb.gain.value = 0;
  const shimShelf = ctx.createBiquadFilter();
  shimShelf.type = "highshelf"; shimShelf.frequency.value = 1800; shimShelf.gain.value = 6;
  let shifter = null; // lazily built on first shimmer use (its sources can't restart)

  let mode = "ducked";
  let springColor = 2000; // spring-mode mid centre Hz (brightness/metallic color)

  function rebuildImpulse(reverse) {
    const buf = mode === "spring"
      ? springImpulse(ctx, decay, { color: springColor, stereo: true })
      : impulse(ctx, decay, { dark: mode === "shimmer" ? 0.4 : 0.6, stereo: true });
    if (reverse) {
      for (let c = 0; c < buf.numberOfChannels; c++) buf.getChannelData(c).reverse();
    }
    conv.buffer = buf;
  }
  function wire() {
    try { conv.disconnect(); wet.disconnect(); duck.disconnect(); shimFb.disconnect(); shimShelf.disconnect(); if (shifter) shifter.output.disconnect(); } catch (_) {}
    input.connect(pre).connect(conv);
    conv.connect(wet).connect(duck).connect(output);
    if (mode === "shimmer") {
      // Tail → REAL +12st pitch shift → brighten → back into the convolver. Each pass
      // re-pitches an octave up, so the sheen rises — a genuine shimmer, not a fake.
      if (!shifter) shifter = makeBestPitchShifter(ctx, { semitones: 12 });
      conv.connect(shifter.input);
      shifter.output.connect(shimShelf).connect(shimFb).connect(conv);
    }
  }
  wire();

  return {
    input, output, duck, wet, // wet exposed as a modulation destination
    set(p = {}) {
      let needWire = false, needImpulse = false, reverse = mode === "reverse";
      if (p.decay !== undefined && p.decay !== decay) { decay = p.decay; needImpulse = true; }
      if (p.springColor !== undefined && p.springColor !== springColor) {
        springColor = p.springColor;
        if (mode === "spring") needImpulse = true; // color only affects the spring IR
      }
      if (p.mode !== undefined && p.mode !== mode) {
        mode = p.mode; needWire = true; needImpulse = true; reverse = mode === "reverse";
        shimFb.gain.value = mode === "shimmer" ? 0.45 : 0;
      }
      if (p.shimmer !== undefined) ramp(shimFb.gain, mode === "shimmer" ? p.shimmer : 0, 0.1, ctx);
      if (p.preDelay !== undefined) pre.delayTime.setTargetAtTime(p.preDelay, ctx.currentTime, 0.02);
      if (needWire) {
        // Rewire the convolver/shimmer-feedback under cover of a wet-send dip (engine
        // quantizes this to a downbeat too, but the dip protects any non-quantized call).
        const restore = p.mix !== undefined ? p.mix : wet.gain.value;
        dipAndRewire(wet, ctx, restore, () => { if (needImpulse) rebuildImpulse(reverse); wire(); });
      } else {
        if (p.mix !== undefined) ramp(wet.gain, p.mix, 0.1, ctx);
        if (needImpulse) rebuildImpulse(reverse);
      }
    },
    // "gated": clamp the wet with a fast env on a hit.
    gate(t, openMs = 90) {
      duck.gain.cancelScheduledValues(t);
      duck.gain.setValueAtTime(1, t);
      duck.gain.setTargetAtTime(FLOOR, t + openMs / 1000, 0.02);
    },
    // "freeze": hold the current wet return up (drone the tail).
    freeze(on, t = ctx.currentTime) {
      ramp(wet.gain, on ? Math.max(0.4, wet.gain.value) : 0.22, 0.2, ctx);
      // a high shimmer feedback also keeps the tail alive
      ramp(shimFb.gain, on ? 0.7 : (mode === "shimmer" ? 0.45 : 0), 0.2, ctx);
    },
    get mode() { return mode; },
  };
}
