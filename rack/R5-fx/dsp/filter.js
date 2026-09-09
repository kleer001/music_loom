// Source: cyber_synth/cyber/fx.js
// Resonant lowpass: the 4-pole ladder worklet, or a BiquadFilter fallback.

import { makeWorkletLoader } from "./fx-common.js";

// ---- Ladder filter (analog 4-pole) -------------------------------------------

// The moog-ladder AudioWorklet (./ladder-worklet.js) — a nonlinear 24 dB/oct
// resonant lowpass, the analog character a 2-pole BiquadFilter can't give. Loaded once
// per context; makeFilter() returns it, or a BiquadFilter handle as the fallback.
const _ladderLoader = makeWorkletLoader("./ladder-worklet.js", "[fx] ladder worklet unavailable; using a 2-pole biquad:");
export const loadLadderWorklet = (ctx) => _ladderLoader.load(ctx);
export const ladderWorkletReady = () => _ladderLoader.ready();

// A resonant-lowpass handle { in, out, cutoff, resonance, dispose } with a UNIFORM
// interface: the 4-pole ladder worklet if loaded, else a BiquadFilter. `resonance` is the
// engine's biquad-style Q number; the ladder maps it into its own feedback range.
// `cutoff`/`resonance` are AudioParams the caller automates (the per-note 303 sweep).
export function makeFilter(ctx, { cutoff = 1000, resonance = 8, drive = 1.2 } = {}) {
  if (_ladderLoader.ready()) {
    try {
      const node = new AudioWorkletNode(ctx, "moog-ladder", { channelCount: 1, channelCountMode: "explicit" });
      const cut = node.parameters.get("cutoff");
      const res = node.parameters.get("resonance");
      cut.value = Math.max(20, Math.min(18000, cutoff));
      res.value = Math.max(0, Math.min(1.22, resonance / 16)); // Q≈8→0.5, Q≈16→1.0 (near self-osc)
      node.parameters.get("drive").value = drive;
      // The ladder model has a drooping passband (~ -7 dB); makeup gain so swapping it in
      // for the biquad doesn't drop the level.
      const makeup = ctx.createGain();
      makeup.gain.value = 1.7;
      node.connect(makeup);
      // Teardown: tell the processor to retire (return false) so it stops running on the
      // audio thread, THEN disconnect. Disconnect alone leaves the worklet processing.
      return { in: node, out: makeup, cutoff: cut, resonance: res, dispose() { try { node.port.postMessage(0); node.disconnect(); makeup.disconnect(); } catch (_) {} } };
    } catch (e) {
      console.warn("[fx] ladder node failed; biquad fallback:", e?.message || e);
    }
  }
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = cutoff;
  lp.Q.value = resonance;
  return { in: lp, out: lp, cutoff: lp.frequency, resonance: lp.Q, dispose() {} };
}
