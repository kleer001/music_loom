// Source: cyber_synth/cyber/fx.js
// Juno-style BBD chorus.

import { ramp } from "./fx-common.js";

// ---- Chorus (Juno-style BBD) -------------------------------------------------

// Two LFO-modulated delay lines panned hard L/R — the lush, slightly-detuned 80s/
// synthwave widener a single supersaw can't give. `mix` crossfades dry/wet (0 = bypass);
// depth is the delay-time modulation in seconds, rate the LFO Hz, spread the stereo pan.
export function makeChorus(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  input.connect(dry).connect(output);
  wet.connect(output);
  const base = 0.007; // 7 ms base delay
  const voices = [];
  for (const pan of [-0.7, 0.7]) {
    const inv = pan > 0; // right voice runs anti-phase for stereo width
    const d = ctx.createDelay(0.05); d.delayTime.value = base;
    const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.6;
    // Decorrelate L/R by INVERTING the right voice's modulation depth (anti-phase) — NOT by
    // detuning the LFO. `detune` shifts frequency, not phase: the old `detune = 90*100` (9000
    // cents = 90 semitones) ran the right LFO at ~108 Hz (audio-rate), spraying FM sidebands /
    // high-freq buzz into the right channel only. Anti-phase depth gives wide stereo with both
    // LFOs at the chorus rate and no artifacts.
    const depth = ctx.createGain(); depth.gain.value = inv ? -0.003 : 0.003;
    lfo.connect(depth).connect(d.delayTime);
    const p = ctx.createStereoPanner(); p.pan.value = pan;
    input.connect(d).connect(p).connect(wet);
    try { lfo.start(); } catch (_) {}
    voices.push({ d, lfo, depth, pan: p, inv });
  }
  return {
    input, output,
    set(p = {}) {
      if (p.rate !== undefined) for (const v of voices) v.lfo.frequency.setTargetAtTime(Math.max(0.01, p.rate), ctx.currentTime, 0.05);
      if (p.depth !== undefined) for (const v of voices) v.depth.gain.setTargetAtTime((v.inv ? -1 : 1) * Math.max(0, p.depth), ctx.currentTime, 0.05);
      if (p.spread !== undefined) { voices[0].pan.pan.setTargetAtTime(-p.spread, ctx.currentTime, 0.05); voices[1].pan.pan.setTargetAtTime(p.spread, ctx.currentTime, 0.05); }
      if (p.mix !== undefined) { ramp(wet.gain, p.mix, 0.08, ctx); ramp(dry.gain, 1 - 0.5 * p.mix, 0.08, ctx); }
    },
  };
}
