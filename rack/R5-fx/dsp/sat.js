// Source: cyber_synth/cyber/fx.js
// Waveshaper saturation: drive, fuzz, asymmetric, wavefold. One topology,
// four voicings of it.

import { satCurve, clipCurve, foldCurve, diodeCurve } from "../core/dsp.js";
import { ramp } from "./fx-common.js";

// ---- Drive / saturation ------------------------------------------------------

// WaveShaper (sat/clip) + tone lowpass + makeup gain. The parallel-grit core.
export function makeDrive(ctx) {
  const input = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  shaper.curve = satCurve(0.001); shaper.oversample = "4x"; // anti-alias the saturation harmonics
  const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 6500;
  const makeup = ctx.createGain(); makeup.gain.value = 0.7;
  const output = ctx.createGain();
  input.connect(shaper).connect(tone).connect(makeup).connect(output);
  // mode: "tanh" (symmetric, odd harmonics) | "clip" (hard) | "diode" (asymmetric, +even
  // harmonics, warmer). The curve is rebuilt when mode OR amount changes.
  let mode = "tanh", amt = 0.001;
  const curveFor = () =>
    mode === "clip" ? clipCurve(1 + amt * 6)
    : mode === "diode" ? diodeCurve(Math.max(0.001, amt))
    : satCurve(Math.max(0.001, amt));
  return {
    input, output,
    set(p = {}) {
      const wasMode = mode, wasAmt = amt;
      if (p.mode !== undefined) mode = p.mode;
      if (p.kind !== undefined) mode = p.kind; // back-compat alias
      if (p.amount !== undefined) amt = p.amount;
      if (mode !== wasMode || amt !== wasAmt) shaper.curve = curveFor();
      if (p.tone !== undefined) ramp(tone.frequency, p.tone, 0.05, ctx);
      if (p.makeup !== undefined) ramp(makeup.gain, p.makeup, 0.05, ctx);
    },
  };
}

// ---- Per-channel fuzz (Big-Muff / Devilfish-303) -----------------------------
// A pre-gain stage drives the signal HOT into a saturator, then a tone lowpass and a makeup
// gain tame it. The pre-gain is the difference from makeDrive (which shapes the bus at its
// natural, modest level): fuzz needs the signal slammed into the curve. amount 0 = transparent
// (unity pre-gain, near-linear curve, unity makeup), so every channel can carry one for free.
export function makeFuzz(ctx) {
  const input = ctx.createGain();
  const pre = ctx.createGain(); pre.gain.value = 1;
  const shaper = ctx.createWaveShaper(); shaper.curve = satCurve(0.001); shaper.oversample = "4x";
  const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 7000;
  const makeup = ctx.createGain(); makeup.gain.value = 1;
  input.connect(pre).connect(shaper).connect(tone).connect(makeup);
  let mode = "tanh";
  return {
    input, output: makeup,
    set({ amount = 0, mode: m, tone: tn } = {}) {
      if (m !== undefined) mode = m;
      const a = Math.max(0, amount);
      pre.gain.setTargetAtTime(1 + a * 9, ctx.currentTime, 0.02);            // slam it into the curve
      const steep = Math.max(0.001, a * 5);
      shaper.curve = mode === "diode" ? diodeCurve(steep) : satCurve(steep); // diode = asymmetric/buzzier
      makeup.gain.setTargetAtTime(1 / (1 + a * 4), ctx.currentTime, 0.02);   // tame the level boost
      if (tn !== undefined) tone.frequency.setTargetAtTime(tn, ctx.currentTime, 0.02);
    },
  };
}

// Pre-baked asymmetric saturator — the analog "warmth"/meat. Unlike makeFuzz, the (asymmetric,
// diode-shaped) curve is set ONCE at construction and never reassigned, so it survives offline
// rendering (node-web-audio-api forbids WaveShaperNode.curve reassignment; the render shim swallows
// it, which leaves makeFuzz stuck on its initial symmetric curve and unable to make even harmonics).
// Asymmetry => even-order harmonics => warmth. Drive is the pre-gain (a freely-automatable GainNode):
// only the level INTO the fixed curve changes, never the curve. A DC-blocker removes the offset the
// asymmetry introduces. amount 0 = transparent, so every channel can carry one for free.
export function makeAsymSat(ctx) {
  const input = ctx.createGain();
  const pre = ctx.createGain(); pre.gain.value = 1;
  const shaper = ctx.createWaveShaper(); shaper.curve = diodeCurve(0.6); shaper.oversample = "4x"; // fixed asymmetric curve
  const dc = ctx.createBiquadFilter(); dc.type = "highpass"; dc.frequency.value = 18; dc.Q.value = 0.5; // block the DC the asymmetry adds
  const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 6000;
  const makeup = ctx.createGain(); makeup.gain.value = 1;
  // TRUE bypass via a dry/wet crossfade. The shaper curve is FIXED (node-web-audio-api forbids
  // WaveShaperNode.curve reassignment offline — the render shim only swallows the error, it doesn't
  // apply the new curve), so amount can't ride the curve; it must ride a parallel mix instead.
  // diodeCurve(0.6) is a real saturation (maps 0.2→0.43), NOT a unity slope — leaving it permanently
  // in-circuit coloured EVERY channel even at warmth 0. Start fully DRY so warmth 0 is truly clean.
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  const out = ctx.createGain();
  input.connect(dry).connect(out);
  input.connect(pre).connect(shaper).connect(dc).connect(tone).connect(makeup).connect(wet).connect(out);
  return {
    input, output: out,
    set({ amount = 0, tone: tn } = {}) {
      const a = Math.max(0, amount);
      const mix = Math.min(1, a);                                          // crossfade dry↔wet by warmth
      pre.gain.setTargetAtTime(1 + a * 9, ctx.currentTime, 0.02);          // drive = level into the fixed curve
      makeup.gain.setTargetAtTime(1 / (1 + a * 3.5), ctx.currentTime, 0.02);
      wet.gain.setTargetAtTime(mix, ctx.currentTime, 0.02);
      dry.gain.setTargetAtTime(1 - mix, ctx.currentTime, 0.02);
      if (tn !== undefined) tone.frequency.setTargetAtTime(tn, ctx.currentTime, 0.02);
    },
  };
}

// ---- Wavefold (West-Coast) ---------------------------------------------------

export function makeFold(ctx) {
  const input = ctx.createGain();
  const shaper = ctx.createWaveShaper();
  shaper.curve = foldCurve(1); shaper.oversample = "4x";
  const output = ctx.createGain();
  input.connect(shaper).connect(output);
  return {
    input, output,
    set(p = {}) { if (p.amount !== undefined) shaper.curve = foldCurve(1 + p.amount * 4); },
  };
}
