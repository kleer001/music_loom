// Source: cyber_synth/cyber/fx.js
// Noise and hiss atmosphere bed.

import { ramp } from "./fx-common.js";

// ---- Noise / hiss atmosphere bed ---------------------------------------------

// A persistent pink-noise layer through a slowly-swept bandpass — dub techno's "wind
// across a tundra" / tape-hiss bed. Always built (gain 0 when off) so a live genre switch
// can bring it in; the engine routes its output dry + into the reverb send.
export function makeNoiseBed(ctx) {
  const output = ctx.createGain(); output.gain.value = 0;
  const len = Math.max(1, (ctx.sampleRate * 2) | 0);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0; // Paul Kellet pink-noise filter
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
  }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 1.5;
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.05;
  const lfoD = ctx.createGain(); lfoD.gain.value = 600;
  lfo.connect(lfoD).connect(bp.frequency);
  src.connect(bp).connect(output);
  try { src.start(); lfo.start(); } catch (_) {}
  return {
    output,
    set(p = {}) {
      if (p.color !== undefined) bp.frequency.setTargetAtTime(Math.max(80, p.color), ctx.currentTime, 0.2);
      if (p.q !== undefined) bp.Q.setTargetAtTime(Math.max(0.1, p.q), ctx.currentTime, 0.2);
      if (p.sweep !== undefined) lfo.frequency.setTargetAtTime(Math.max(0.001, p.sweep), ctx.currentTime, 0.2);
      if (p.gain !== undefined) ramp(output.gain, Math.max(0, p.gain), 0.3, ctx);
    },
  };
}
