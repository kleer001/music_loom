// Source: cyber_synth/cyber/fx.js
// Tape character: wow, flutter, saturation.

import { satCurve } from "../core/dsp.js";
import { ramp } from "./fx-common.js";

// ---- Tape character (wow / flutter / saturation) -----------------------------

// A modulated delay (varispeed pitch instability) + soft saturation — the "warm analog
// imperfection" of synthwave/Boards-of-Canada. wow = slow pitch drift Hz, flutter = fast
// Hz, depth = seconds of modulation, drive = soft-clip amount, mix = dry/wet (0 = bypass).
// Real-time texture only (its LFOs never read the seed/clock — like the shimmer warble).
export function makeTape(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  const d = ctx.createDelay(0.05); d.delayTime.value = 0.006;
  const wow = ctx.createOscillator(); wow.type = "sine"; wow.frequency.value = 0.6;
  const flutter = ctx.createOscillator(); flutter.type = "sine"; flutter.frequency.value = 6;
  const wowD = ctx.createGain(); wowD.gain.value = 0.0015;
  const flD = ctx.createGain(); flD.gain.value = 0.0003;
  wow.connect(wowD).connect(d.delayTime);
  flutter.connect(flD).connect(d.delayTime);
  const sat = ctx.createWaveShaper(); sat.curve = satCurve(0.001); sat.oversample = "2x";
  input.connect(dry).connect(output);
  input.connect(d).connect(sat).connect(wet).connect(output);
  try { wow.start(); flutter.start(); } catch (_) {}
  return {
    input, output,
    set(p = {}) {
      if (p.wow !== undefined) wow.frequency.setTargetAtTime(Math.max(0.01, p.wow), ctx.currentTime, 0.1);
      if (p.flutter !== undefined) flutter.frequency.setTargetAtTime(Math.max(0.1, p.flutter), ctx.currentTime, 0.1);
      if (p.depth !== undefined) { wowD.gain.setTargetAtTime(Math.max(0, p.depth), ctx.currentTime, 0.1); flD.gain.setTargetAtTime(Math.max(0, p.depth) * 0.2, ctx.currentTime, 0.1); }
      if (p.drive !== undefined) sat.curve = satCurve(Math.max(0.001, p.drive));
      if (p.mix !== undefined) { ramp(wet.gain, p.mix, 0.1, ctx); ramp(dry.gain, 1 - p.mix, 0.1, ctx); }
    },
  };
}
