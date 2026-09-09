// Source: cyber_synth/cyber/fx.js
// Bitcrush: AudioWorklet preferred, WaveShaper fallback.

import { bitCurve } from "../core/dsp.js";
import { ramp } from "./fx-common.js";

// ---- Bitcrush (AudioWorklet preferred, WaveShaper fallback) -------------------

// Tries the AudioWorklet module; on failure falls back to a WaveShaper bitCurve()
// (bit-depth only — no true SR reduction without the worklet; commented as such).
export function makeBitcrush(ctx) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 1;
  const wet = ctx.createGain(); wet.gain.value = 0;
  input.connect(dry).connect(output);

  const frag = {
    input, output,
    ready: false,
    _node: null,
    _shaper: null,
    set(p = {}) {
      // mix: crossfade dry/wet.
      if (p.mix !== undefined) {
        ramp(wet.gain, p.mix, 0.05, ctx);
        ramp(dry.gain, 1 - p.mix, 0.05, ctx);
      }
      if (frag._node) {
        if (p.bits !== undefined) frag._node.parameters.get("bits").setTargetAtTime(p.bits, ctx.currentTime, 0.02);
        if (p.srDiv !== undefined) frag._node.parameters.get("srDiv").setTargetAtTime(p.srDiv, ctx.currentTime, 0.02);
      } else if (frag._shaper && p.bits !== undefined) {
        frag._shaper.curve = bitCurve(p.bits);
      }
    },
    async init() {
      try {
        await ctx.audioWorklet.addModule(new URL("./bitcrush-worklet.js", import.meta.url));
        const node = new AudioWorkletNode(ctx, "bitcrush", { numberOfInputs: 1, numberOfOutputs: 1 });
        input.connect(node).connect(wet).connect(output);
        frag._node = node;
        frag.ready = true;
      } catch (e) {
        // Fallback: WaveShaper bit-depth quantization (no sample-rate reduction).
        const shaper = ctx.createWaveShaper();
        shaper.curve = bitCurve(8); shaper.oversample = "none";
        input.connect(shaper).connect(wet).connect(output);
        frag._shaper = shaper;
        frag.ready = true;
        console.warn("[fx] bitcrush worklet unavailable; using WaveShaper fallback:", e?.message || e);
      }
    },
  };
  return frag;
}
