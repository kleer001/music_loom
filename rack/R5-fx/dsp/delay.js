// Source: cyber_synth/cyber/fx.js
// Tempo-synced delay with filtered feedback and ping-pong.

import { satCurve } from "../core/dsp.js";
import { FLOOR, ramp, dipAndRewire, makeShaper } from "./fx-common.js";

// ---- Delay (tempo-synced, filtered feedback, ping-pong) ----------------------

// time16 = delay time in 16th-note steps; the engine pushes sps (seconds per 16th)
// via set({sps}). Feedback runs through a lowpass (darkening dub repeats). Ping-pong
// cross-feeds two L/R delays. `throw(t, amount, beats)` spikes the wet send.
export function makeDelay(ctx) {
  const input = ctx.createGain();
  const wet = ctx.createGain(); wet.gain.value = 0.16;
  const output = ctx.createGain();

  // Two delays (L/R) for ping-pong; merge to stereo.
  const dL = ctx.createDelay(2.0);
  const dR = ctx.createDelay(2.0);
  const fbL = ctx.createGain(); fbL.gain.value = 0.34;
  const fbR = ctx.createGain(); fbR.gain.value = 0.34;
  const lpL = ctx.createBiquadFilter(); lpL.type = "lowpass"; lpL.frequency.value = 3800;
  const lpR = ctx.createBiquadFilter(); lpR.type = "lowpass"; lpR.frequency.value = 3800;
  const panL = ctx.createStereoPanner(); panL.pan.value = -0.8;
  const panR = ctx.createStereoPanner(); panR.pan.value = 0.8;

  // Dub character: a saturation crossfade in each feedback path — a dry/wet blend so sat 0 is
  // transparent (existing genres unchanged). node-web-audio-api forbids reassigning a WaveShaper
  // curve, so we crossfade into a FIXED tanh shaper rather than rebuild the curve on set().
  const mkSat = () => ({
    dry: Object.assign(ctx.createGain(), {}), wet: Object.assign(ctx.createGain(), {}),
    shaper: (() => { const s = makeShaper(ctx, 4); s.curve = satCurve(0.8); return s; })(),
    sum: ctx.createGain(),
  });
  const stL = mkSat(), stR = mkSat();
  stL.dry.gain.value = stR.dry.gain.value = 1; stL.wet.gain.value = stR.wet.gain.value = 0;
  // Tape wow: a slow LFO on both delay times. `drift` (seconds) sets depth; 0 = none.
  const wow = ctx.createOscillator(); wow.type = "sine"; wow.frequency.value = 0.3;
  const wowD = ctx.createGain(); wowD.gain.value = 0;
  wow.connect(wowD); wowD.connect(dL.delayTime); wowD.connect(dR.delayTime);
  try { wow.start(); } catch (_) {}

  let pingpong = true;
  let sps = 60 / 128 / 4;
  let time16 = 3;
  let synced = true;   // false → use freeSec (a fixed, non-tempo-locked delay time)
  let freeSec = 0.3;

  function rewire() {
    // Disconnect feedback returns then rebuild per the ping-pong toggle.
    try {
      lpL.disconnect(); lpR.disconnect(); fbL.disconnect(); fbR.disconnect();
      for (const st of [stL, stR]) { st.dry.disconnect(); st.wet.disconnect(); st.shaper.disconnect(); st.sum.disconnect(); }
    } catch (_) {}
    input.connect(dL);
    if (pingpong) input.connect(dR);
    // dL → lp → saturation crossfade → fb; cross-feed to the opposite delay for ping-pong, else self-feed.
    dL.connect(lpL); lpL.connect(stL.dry).connect(stL.sum); lpL.connect(stL.wet).connect(stL.shaper).connect(stL.sum); stL.sum.connect(fbL);
    dR.connect(lpR); lpR.connect(stR.dry).connect(stR.sum); lpR.connect(stR.wet).connect(stR.shaper).connect(stR.sum); stR.sum.connect(fbR);
    fbL.connect(pingpong ? dR : dL);
    fbR.connect(pingpong ? dL : dR);
    // Wet taps → pan → wet → output.
    dL.connect(panL).connect(wet);
    dR.connect(panR).connect(wet);
    wet.connect(output);
  }
  function applyTime() {
    const t = Math.max(0.001, synced ? time16 * sps : freeSec);
    dL.delayTime.setTargetAtTime(t, ctx.currentTime, 0.02);
    dR.delayTime.setTargetAtTime(t, ctx.currentTime, 0.02);
  }
  rewire(); applyTime();

  return {
    input, output, wet, fbL, fbR, // fbL/fbR exposed as modulation destinations
    set(p = {}) {
      if (p.sync !== undefined) synced = p.sync;
      if (p.timeMs !== undefined) freeSec = Math.max(0.001, p.timeMs / 1000);
      if (p.sps !== undefined) { sps = p.sps; applyTime(); }
      if (p.time16 !== undefined) { time16 = p.time16; applyTime(); }
      if (p.sync !== undefined || p.timeMs !== undefined) applyTime();
      if (p.feedback !== undefined) {
        const f = Math.min(0.95, p.feedback); // < unity: feedback stays controlled, never runaway
        ramp(fbL.gain, f, 0.05, ctx); ramp(fbR.gain, f, 0.05, ctx);
      }
      if (p.lpf !== undefined) { ramp(lpL.frequency, p.lpf, 0.05, ctx); ramp(lpR.frequency, p.lpf, 0.05, ctx); }
      if (p.sat !== undefined) { const s = Math.max(0, Math.min(1, p.sat)); for (const st of [stL, stR]) { ramp(st.wet.gain, s, 0.05, ctx); ramp(st.dry.gain, 1 - s, 0.05, ctx); } }
      if (p.drift !== undefined) ramp(wowD.gain, Math.max(0, p.drift), 0.1, ctx);
      if (p.mix !== undefined) ramp(wet.gain, p.mix, 0.08, ctx);
      if (p.pingpong !== undefined && p.pingpong !== pingpong) {
        pingpong = p.pingpong;
        const restore = p.mix !== undefined ? p.mix : wet.gain.value;
        dipAndRewire(wet, ctx, restore, () => { rewire(); applyTime(); });
      }
    },
    // Dub "throw": spike the wet send for `beats` quarter-notes, then release.
    throw(t, amount = 0.6, beats = 1) {
      const back = wet.gain.value;
      wet.gain.cancelScheduledValues(t);
      wet.gain.setValueAtTime(Math.max(FLOOR, amount), t);
      wet.gain.setTargetAtTime(back, t + beats * sps * 4, (beats * sps * 4) / 3);
    },
  };
}
