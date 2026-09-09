// Source: cyber_synth/cyber/fx.js
// Allpass notch-sweep phaser.

import { ramp } from "./fx-common.js";

// ---- Phaser (allpass notch-sweep) --------------------------------------------

// A chain of allpass BiquadFilters whose `frequency` is swept by a shared LFO, with feedback
// and dry/wet mix — the classic moving-notch phaser. Per Ott/Shpongle: a phaser
// on the HIGHS spreads and softens hats/leads. Built from
// allpass biquads + delay + osc + gain (all faithful offline — no WaveShaper). Stereo width via
// ANTI-PHASE L/R modulation (right channel's depth inverted), NOT detune — see makeChorus for the
// detune-FM hazard. depth is the sweep amount in Hz, rate the LFO Hz, mix crossfades dry/wet.
export function makePhaser(ctx, stages = 6) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  input.connect(dry).connect(output);
  wet.connect(output);
  const split = ctx.createChannelSplitter(2);
  const merge = ctx.createChannelMerger(2);
  // Force a stereo up-mix BEFORE the splitter. A ChannelSplitter uses discrete channel
  // interpretation — feed it a mono bus and output 1 (R) is SILENT (no up-mix), so the right
  // allpass chain would process nothing and only dry-R survives (a hard L/R imbalance). An
  // explicit 2-channel "speakers" gain copies mono → L+R so both sides get real signal.
  const up = ctx.createGain(); up.channelCount = 2; up.channelCountMode = "explicit"; up.channelInterpretation = "speakers";
  input.connect(up).connect(split);
  const base = 800; // center frequency the notches sweep around (Hz)
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.4;
  try { lfo.start(); } catch (_) {}
  const sides = [];
  for (let ch = 0; ch < 2; ch++) {
    const inv = ch === 1; // right side runs anti-phase for stereo decorrelation
    const fb = ctx.createGain(); fb.gain.value = 0.4;
    const depth = ctx.createGain(); depth.gain.value = inv ? -800 : 800;
    lfo.connect(depth);
    const aps = [];
    const head = ctx.createGain(); // per-side input tap + feedback summing node
    split.connect(head, ch);
    let node = head;
    for (let i = 0; i < stages; i++) {
      const ap = ctx.createBiquadFilter();
      ap.type = "allpass";
      ap.frequency.value = base;
      ap.Q.value = 0.7;
      depth.connect(ap.frequency);
      node.connect(ap);
      node = ap;
      aps.push(ap);
    }
    // feedback: last allpass output → fb gain → back into the chain head
    node.connect(fb).connect(head);
    node.connect(merge, 0, ch);
    sides.push({ aps, fb, depth, inv });
  }
  merge.connect(wet);
  return {
    input, output,
    set(p = {}) {
      if (p.rate !== undefined) lfo.frequency.setTargetAtTime(Math.max(0.01, p.rate), ctx.currentTime, 0.05);
      if (p.depth !== undefined) for (const s of sides) s.depth.gain.setTargetAtTime((s.inv ? -1 : 1) * Math.max(0, p.depth), ctx.currentTime, 0.05);
      if (p.feedback !== undefined) for (const s of sides) s.fb.gain.setTargetAtTime(Math.max(0, Math.min(0.95, p.feedback)), ctx.currentTime, 0.05);
      if (p.stages !== undefined) {
        // engage only the first `stages` allpass sections; neutralize the rest (Q→0 = flat).
        const n = Math.max(1, Math.min(sides[0].aps.length, Math.round(p.stages)));
        for (const s of sides) for (let i = 0; i < s.aps.length; i++) s.aps[i].Q.setTargetAtTime(i < n ? 0.7 : 0.0001, ctx.currentTime, 0.05);
      }
      if (p.mix !== undefined) { ramp(wet.gain, p.mix, 0.08, ctx); ramp(dry.gain, 1 - p.mix, 0.08, ctx); }
    },
  };
}
