// Source: cyber_synth/cyber/fx.js
// Modulation matrix.

import { ramp } from "./fx-common.js";

// ---- Modulation matrix -------------------------------------------------------

// Modulation matrix. Three source kinds, each producing an ADDITIVE signal that is either
// connected to a destination AudioParam (persistent dests, resolved by the engine) or exposed
// via tap() for a voice to connect to a per-note param at note-on (per-voice dests):
//   lfo     OscillatorNode → depth gain   (shapes sine|tri|square|saw|ramp)
//   sh      ConstantSourceNode.offset re-randomized on the scheduler grid; `slew` is the lag
//           (≈0.005 snappy step ↔ ≈0.12 smoothed West-Coast S&H)
//   kickenv ConstantSourceNode.offset pulsed on each kick (sidechain-as-modulation)
// Determinism: LFOs are oscillators (no RNG); S&H uses Math.random (real-time
// humanization, allowed); kick-env keys off the audible kick. Nothing reads/perturbs a seed.
export function makeModMatrix(ctx) {
  const lfos = {};     // name -> { osc, depth, target }
  const shList = [];   // i -> { node, depth, target, slew }
  const kickList = []; // i -> { node, depth, target, release, down }

  const oscType = (s) => s === "tri" ? "triangle" : s === "square" ? "square"
    : (s === "saw" || s === "ramp") ? "sawtooth" : "sine";

  function ensureLfo(name) {
    if (lfos[name]) return lfos[name];
    const osc = ctx.createOscillator(); osc.type = "sine";
    const depth = ctx.createGain(); depth.gain.value = 0;
    osc.connect(depth);
    try { osc.start(); } catch (_) {}
    return (lfos[name] = { osc, depth, target: null });
  }
  function ensureConst(list, i, extra) {
    if (list[i]) return list[i];
    const node = ctx.createConstantSource(); node.offset.value = 0;
    try { node.start(); } catch (_) {}
    return (list[i] = { node, target: null, depth: 0, ...extra });
  }
  // Re-point a source's additive output at a new destination AudioParam (or detach with null).
  function retarget(h, target) {
    if (target === h.target) return;
    const out = h.node || h.depth;
    try { out.disconnect(); } catch (_) {}
    if (target) out.connect(target);
    h.target = target;
  }

  return {
    // Wire an LFO: shape sine|tri|square|saw|ramp, rate Hz, depth in param units, target param.
    setLfo(name, { rate, depth, shape, target } = {}) {
      const l = ensureLfo(name);
      if (shape !== undefined) l.osc.type = oscType(shape);
      if (rate !== undefined) l.osc.frequency.setTargetAtTime(Math.max(0.001, rate), ctx.currentTime, 0.05);
      if (depth !== undefined) l.depth.gain.setTargetAtTime(depth, ctx.currentTime, 0.05);
      if (target !== undefined) retarget(l, target);
    },
    // Patterned wobble: schedule an abrupt LFO rate/depth change at the absolute time `t`
    // (not currentTime — so per-step changes land on the grid, not collapsed at render start).
    // The LFO must already exist (setLfo created it). No glide: the step boundary is hard so
    // the wobble rhythm reads as distinct cells (the dubstep "talking" wobble).
    setLfoAt(name, { rate, depth } = {}, t) {
      const l = lfos[name]; if (!l) return;
      if (rate !== undefined) l.osc.frequency.setValueAtTime(Math.max(0.001, rate), t);
      if (depth !== undefined) l.depth.gain.setValueAtTime(Math.max(0, depth), t);
    },
    // Sample & hold #i: tickSH writes a new random value (±depth) onto its ConstantSource offset,
    // glided over `slew` seconds; the source's output rides additively on the target param.
    setSHAt(i, { depth, target, slew } = {}) {
      const s = ensureConst(shList, i, { slew: 0.006 });
      if (depth !== undefined) s.depth = depth;
      if (slew !== undefined) s.slew = slew;
      if (target !== undefined) retarget(s, target);
    },
    setSH(p) { this.setSHAt(0, p); }, // legacy single-S&H shim
    // Kick envelope #i: kickPulse spikes the offset to ±depth on each kick, decaying back to 0.
    setKickEnv(i, { target, depth, release, down } = {}) {
      const k = ensureConst(kickList, i, { release: 0.12, down: false });
      if (depth !== undefined) k.depth = depth;
      if (release !== undefined) k.release = release;
      if (down !== undefined) k.down = down;
      if (target !== undefined) retarget(k, target);
    },
    // The additive signal node for a per-voice destination — a voice connect()s it at note-on.
    tap(kind, i) {
      if (kind === "lfo") return lfos[i] ? lfos[i].depth : null;
      if (kind === "sh") return shList[i] ? shList[i].node : null;
      if (kind === "kick") return kickList[i] ? kickList[i].node : null;
      return null;
    },
    tickSH(t) {
      for (const s of shList) if (s && s.depth) s.node.offset.setTargetAtTime((Math.random() * 2 - 1) * s.depth, t, Math.max(0.001, s.slew / 3));
    },
    kickPulse(t) {
      for (const k of kickList) {
        if (!k || !k.depth) continue;
        k.node.offset.cancelScheduledValues(t);
        k.node.offset.setValueAtTime(k.down ? -k.depth : k.depth, t);
        k.node.offset.setTargetAtTime(0, t + 0.005, Math.max(0.005, k.release) / 3);
      }
    },
    // Zero/detach any source not in `keep` (routes can shrink on a genre swap — no stale mod).
    pruneLfos(keep) { for (const name of Object.keys(lfos)) if (!keep.includes(name)) { const l = lfos[name]; try { l.depth.disconnect(); } catch (_) {} l.depth.gain.setTargetAtTime(0, ctx.currentTime, 0.05); l.target = null; } },
    pruneSH(keep) { shList.forEach((s, i) => { if (s && !keep.includes(i)) { s.depth = 0; retarget(s, null); } }); },
    pruneKick(keep) { kickList.forEach((k, i) => { if (k && !keep.includes(i)) { k.depth = 0; retarget(k, null); } }); },
    dispose() {
      for (const k of Object.keys(lfos)) { try { lfos[k].osc.stop(); } catch (_) {} }
      for (const s of shList) if (s) { try { s.node.stop(); } catch (_) {} }
      for (const k of kickList) if (k) { try { k.node.stop(); } catch (_) {} }
    },
  };
}
