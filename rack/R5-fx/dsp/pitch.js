// Source: cyber_synth/cyber/fx.js
// Real-time pitch shifting: granular delay-line, and the phase-vocoder worklet.

import { pitchPeriod, pitchRampSamples, hannSamples } from "../core/dsp.js";
import { ramp, makeWorkletLoader } from "./fx-common.js";

// ---- Real-time pitch shifter (granular delay-line / "varispeed") -------------

// A genuine pitch shifter on a LIVE signal, built entirely from native nodes — no
// AudioWorklet, no library. Two DelayNodes whose delayTime ramps linearly (descending =
// the read head drifts forward = pitch UP) are Hann-crossfaded; the window pair sums to
// exactly 1, so each ramp's reset jump lands where that grain's gain is 0 and is masked.
// Its main artifact is a granular warble at the grain period — which happens to be the
// lush, slightly-detuned texture a shimmer wants. Rebuild to change pitch.
export function makePitchShifter(ctx, { semitones = 12, window = 0.1 } = {}) {
  const input = ctx.createGain();
  const output = ctx.createGain();
  const up = semitones >= 0;
  const period = pitchPeriod(semitones, window);
  const n = Math.max(1, Math.round(period * ctx.sampleRate));

  const rampBuf = ctx.createBuffer(1, n, ctx.sampleRate);
  rampBuf.getChannelData(0).set(pitchRampSamples(n, window, up));
  const fadeBuf = ctx.createBuffer(1, n, ctx.sampleRate);
  fadeBuf.getChannelData(0).set(hannSamples(n));

  const srcs = [];
  // Two grains, half a period out of phase, summed into output.
  for (const offset of [0, period / 2]) {
    const delay = ctx.createDelay(window + 0.05);
    delay.delayTime.value = 0; // the mod source supplies the (additive) delay time
    const g = ctx.createGain();
    g.gain.value = 0; // the fade source supplies the (additive) 0..1 window
    const mod = ctx.createBufferSource(); mod.buffer = rampBuf; mod.loop = true;
    const fad = ctx.createBufferSource(); fad.buffer = fadeBuf; fad.loop = true;
    mod.connect(delay.delayTime);
    fad.connect(g.gain);
    input.connect(delay).connect(g).connect(output);
    const t0 = ctx.currentTime + 0.03 + offset;
    mod.start(t0); fad.start(t0);
    srcs.push(mod, fad);
  }
  return {
    input,
    output,
    kind: "granular",
    setSemitones() {}, // granular shifter is built fixed; rebuild for a new interval
    dispose() { for (const s of srcs) { try { s.stop(); } catch (_) {} } },
  };
}

// The phase-vocoder AudioWorklet (./phase-vocoder-worklet.js) — higher fidelity than
// the granular shifter. Loaded once per context; pitchWorkletReady() reports success so
// makeBestPitchShifter can pick the worklet synchronously afterwards.

const _pvLoader = makeWorkletLoader("./phase-vocoder-worklet.js", "[fx] phase-vocoder worklet unavailable; using the granular shifter:");
export const loadPitchWorklet = (ctx) => _pvLoader.load(ctx);
export const pitchWorkletReady = () => _pvLoader.ready();

// Best available real-time pitch shifter: the phase-vocoder worklet if loaded (clean, and
// the interval can be swept live via setSemitones), else the granular delay-line shifter.
export function makeBestPitchShifter(ctx, { semitones = 12 } = {}) {
  if (_pvLoader.ready()) {
    try {
      const node = new AudioWorkletNode(ctx, "phase-vocoder", {
        processorOptions: { fftFrameSize: 2048, osamp: 8 },
        channelCount: 2, channelCountMode: "explicit", channelInterpretation: "speakers",
      });
      const input = ctx.createGain();
      const output = ctx.createGain();
      input.connect(node).connect(output);
      const pitch = node.parameters.get("pitch");
      pitch.setValueAtTime(Math.pow(2, semitones / 12), ctx.currentTime);
      return {
        input, output, kind: "phasevocoder",
        setSemitones(s) { pitch.setTargetAtTime(Math.pow(2, s / 12), ctx.currentTime, 0.04); },
        dispose() { try { node.disconnect(); } catch (_) {} },
      };
    } catch (e) {
      console.warn("[fx] phase-vocoder node failed; granular fallback:", e?.message || e);
    }
  }
  return makePitchShifter(ctx, { semitones });
}
