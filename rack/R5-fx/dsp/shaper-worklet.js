// A waveshaper that oversamples with a filter we specify, so a render and a
// browser produce the same samples.
//
// WaveShaperNode.oversample is the problem it exists to solve. The spec says
// what oversampling is for and not how to do it, so each implementation picks
// its own resampling filter. Measured on one tanh curve at 300 Hz, node against
// Chrome: "none" agrees to -150 dB, "2x" to -88 dB, and "4x" not at all — the
// difference comes out larger than the signal. Anything shaped through 4x is a
// different sound offline than in a browser.
//
// The filter here is a 17-tap windowed sinc at half the base Nyquist, applied
// before and after the curve, at the oversampled rate. Modest by design: short
// enough to stay cheap per sample, and fixed so that every runtime and every
// render agrees on it.

const TAPS = 17;

function lowpass(cutoffFrac, n) {
  // Windowed sinc, Hann. cutoffFrac is a fraction of the sample rate it runs at.
  const h = new Float32Array(n), mid = (n - 1) / 2;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = i - mid;
    const sinc = x === 0 ? 2 * cutoffFrac : Math.sin(2 * Math.PI * cutoffFrac * x) / (Math.PI * x);
    const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    h[i] = sinc * w;
    sum += h[i];
  }
  for (let i = 0; i < n; i++) h[i] /= sum;   // unity at DC
  return h;
}

class Shaper extends AudioWorkletProcessor {
  constructor(opts) {
    super();
    const o = opts?.processorOptions || {};
    this.N = Math.max(1, o.oversample || 4);
    this.curve = o.curve ? Float32Array.from(o.curve) : null;
    this.h = lowpass(0.5 / this.N, TAPS);
    this.up = [];    // per-channel FIR state, upsampling side
    this.dn = [];    // per-channel FIR state, downsampling side
    this.port.onmessage = (e) => {
      if (e.data?.curve) this.curve = Float32Array.from(e.data.curve);
    };
  }

  shape(x) {
    const c = this.curve;
    if (!c || c.length === 0) return x;
    if (c.length === 1) return c[0];
    const t = (Math.max(-1, Math.min(1, x)) + 1) * 0.5 * (c.length - 1);
    const i = Math.floor(t), f = t - i;
    return i >= c.length - 1 ? c[c.length - 1] : c[i] + f * (c[i + 1] - c[i]);
  }

  process(inputs, outputs) {
    const inp = inputs[0], out = outputs[0];
    if (!out || !out.length) return true;
    if (!inp || !inp.length || !inp[0]) { for (const ch of out) ch.fill(0); return true; }

    const N = this.N, h = this.h, taps = h.length;
    for (let c = 0; c < out.length; c++) {
      const src = inp[c] || inp[0], dst = out[c];
      if (!this.up[c]) { this.up[c] = new Float32Array(taps); this.dn[c] = new Float32Array(taps); }
      const su = this.up[c], sd = this.dn[c];
      for (let i = 0; i < dst.length; i++) {
        let acc = 0;
        for (let k = 0; k < N; k++) {
          // zero-stuff, scaled by N so the band-limited copy keeps its level
          su.copyWithin(1, 0); su[0] = k === 0 ? src[i] * N : 0;
          let y = 0;
          for (let t = 0; t < taps; t++) y += h[t] * su[t];
          const shaped = this.shape(y);
          sd.copyWithin(1, 0); sd[0] = shaped;
          if (k === 0) {
            let z = 0;
            for (let t = 0; t < taps; t++) z += h[t] * sd[t];
            acc = z;
          }
        }
        dst[i] = acc;
      }
    }
    return true;
  }
}

registerProcessor("oversampled-shaper", Shaper);
