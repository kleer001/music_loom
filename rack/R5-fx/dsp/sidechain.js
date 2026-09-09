// Source: cyber_synth/cyber/fx.js
// The sidechain pump and the ghost-trigger duck.

import { FLOOR, ramp } from "./fx-common.js";

// ---- Sidechain pump ----------------------------------------------------------

// A GainNode the pumped buses route through. `trigger(t, depth, release)` writes a
// ducking envelope: drop to (1-depth) at the kick, recover via setTargetAtTime over
// ~release. The engine calls trigger() on every kick step — the four-on-the-floor
// breathing signature.
export function makeSidechain(ctx) {
  const gain = ctx.createGain();
  gain.gain.value = 1;
  return {
    input: gain,
    output: gain,
    node: gain,
    trigger(t, depth = 0.7, release = 0.18) {
      const d = Math.max(0, Math.min(1, depth));
      const floor = Math.max(FLOOR, 1 - d);
      // Cancel any in-flight recovery, slam down at the kick, ease back up.
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(floor, t);
      gain.gain.setTargetAtTime(1, t + 0.005, Math.max(0.01, release) / 3);
    },
  };
}

// ---- Pump (ghost-trigger volume duck — the deadmau5/LFOTool move) -------------

// A GainNode the pumped buses route through, ducked on a GRID independent of the audible kick
// (vs makeSidechain which keys off the kick). `trigger(t, depth, release, curve)` slams to
// (1-depth) then recovers — exp (the classic compressor-ish curve) or lin (a more "drawn",
// LFOTool-flat ramp). The engine fires it every `pump.sync` 16ths, so the bass "breathes" on a
// fixed 1/8 (or 1/4) cycle even with no kick there — the signature deadmau5 pump.
export function makePump(ctx) {
  const gain = ctx.createGain();
  gain.gain.value = 1;
  return {
    input: gain,
    output: gain,
    node: gain,
    trigger(t, depth = 0.7, release = 0.18, curve = "exp") {
      const d = Math.max(0, Math.min(1, depth));
      const floor = Math.max(FLOOR, 1 - d);
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(floor, t);
      if (curve === "lin") gain.gain.linearRampToValueAtTime(1, t + Math.max(0.01, release));
      else gain.gain.setTargetAtTime(1, t + 0.005, Math.max(0.01, release) / 3);
    },
    reset(t) { gain.gain.cancelScheduledValues(t); gain.gain.setTargetAtTime(1, t, 0.02); },
  };
}
