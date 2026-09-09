// Source: cyber_synth/cyber/fx.js
// Modulated short-delay comb flanger.

import { ramp } from "./fx-common.js";

// ---- Flanger (modulated short-delay comb) ------------------------------------

// A short (~1-5 ms) DelayNode whose delay time is LFO-swept, with feedback and dry/wet mix —
// the jet-sweep comb filter. Per Ott: widens/softens the
// highs. DelayNode + osc + gain (all faithful offline). Stereo width via ANTI-PHASE L/R sweep
// (right channel depth inverted), NOT detune. depth = delay-sweep amount in seconds, rate = LFO
// Hz, feedback = comb resonance, mix = dry/wet.
export function makeFlanger(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  input.connect(dry).connect(output);
  wet.connect(output);
  const split = ctx.createChannelSplitter(2);
  const merge = ctx.createChannelMerger(2);
  // Force a stereo up-mix before the splitter (see makePhaser): a mono bus into a discrete
  // ChannelSplitter leaves output 1 (R) silent, so the right comb gets no signal.
  const up = ctx.createGain(); up.channelCount = 2; up.channelCountMode = "explicit"; up.channelInterpretation = "speakers";
  input.connect(up).connect(split);
  const base = 0.0025; // 2.5 ms base delay (center of the 1-5 ms sweep)
  // Decorrelate L/R with two genuinely different SUB-AUDIO rates (R = 1.27× L), NOT anti-phase.
  // The comb notch lands at 1/delayTime — a NONLINEAR map — so pure anti-phase (base±Δ) biases
  // high-band energy to one channel. Independent slow rates sweep each channel's notch
  // separately; their time-averaged spectra match, so L/R stay energy-balanced while still
  // decorrelated for width. Both rates are sub-audio (no FM artifacts) — phase/rate, NOT detune
  // (see makeChorus for the detune-FM hazard).
  const RATIO = 1.27;
  let rate0 = 0.25;
  const lfoL = ctx.createOscillator(); lfoL.type = "sine"; lfoL.frequency.value = rate0;
  const lfoR = ctx.createOscillator(); lfoR.type = "sine"; lfoR.frequency.value = rate0 * RATIO;
  try { lfoL.start(); lfoR.start(); } catch (_) {}
  const sides = [];
  for (let ch = 0; ch < 2; ch++) {
    const d = ctx.createDelay(0.05); d.delayTime.value = base;
    const depth = ctx.createGain(); depth.gain.value = 0.0015;
    (ch === 0 ? lfoL : lfoR).connect(depth).connect(d.delayTime);
    const fb = ctx.createGain(); fb.gain.value = 0.3;
    const tap = ctx.createGain();
    split.connect(tap, ch);
    tap.connect(d);
    d.connect(fb).connect(d);          // comb feedback
    d.connect(merge, 0, ch);
    sides.push({ d, depth, fb });
  }
  merge.connect(wet);
  return {
    input, output,
    set(p = {}) {
      if (p.rate !== undefined) {
        rate0 = Math.max(0.01, p.rate);
        lfoL.frequency.setTargetAtTime(rate0, ctx.currentTime, 0.05);
        lfoR.frequency.setTargetAtTime(rate0 * RATIO, ctx.currentTime, 0.05); // R kept decorrelated
      }
      if (p.depth !== undefined) for (const s of sides) s.depth.gain.setTargetAtTime(Math.max(0, p.depth), ctx.currentTime, 0.05);
      if (p.feedback !== undefined) for (const s of sides) s.fb.gain.setTargetAtTime(Math.max(0, Math.min(0.95, p.feedback)), ctx.currentTime, 0.05);
      if (p.mix !== undefined) { ramp(wet.gain, p.mix, 0.08, ctx); ramp(dry.gain, 1 - 0.5 * p.mix, 0.08, ctx); }
    },
  };
}
