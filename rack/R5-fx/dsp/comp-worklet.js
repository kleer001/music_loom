// Feedforward compressor, sample by sample, from Giannoulis, Massberg & Reiss,
// "Digital Dynamic Range Compressor Design — A Tutorial and Analysis", JAES
// 60(6) 2012 — digested in research/dsp_source_texts.md §3.
//
// This is the same algorithm master.js `glue()` runs offline over a whole
// buffer: peak detection with a smoothed release, a quadratic-knee gain
// computer in dB, and separate attack and release coefficients on the gain
// reduction itself. One algorithm, two places to run it.
//
// It is a worklet rather than a graph of native nodes because the arithmetic
// has to be ours. Measured against Chrome, node-web-audio-api's BiquadFilter
// diverges as its corner drops — inaudible at 1 kHz, total by 1 Hz — and a
// DelayNode inside a feedback loop carries a different implicit latency in the
// two runtimes. Either one makes an envelope follower that reads differently
// offline than it sounds. JS run in both places does not.

const dB = (x) => 20 * Math.log10(Math.max(1e-7, x));
const fromDb = (d) => Math.pow(10, d / 20);

class Comp extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "thresholdDb", defaultValue: -18, minValue: -80, maxValue: 0,   automationRate: "k-rate" },
      { name: "ratio",       defaultValue: 4,   minValue: 1,   maxValue: 40,  automationRate: "k-rate" },
      { name: "kneeDb",      defaultValue: 6,   minValue: 0,   maxValue: 40,  automationRate: "k-rate" },
      { name: "attackMs",    defaultValue: 10,  minValue: 0.1, maxValue: 500, automationRate: "k-rate" },
      { name: "releaseMs",   defaultValue: 150, minValue: 1,   maxValue: 5000, automationRate: "k-rate" },
      { name: "makeupDb",    defaultValue: 0,   minValue: -24, maxValue: 24,  automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    this.env = 0;   // detector state
    this.gr = 0;    // gain reduction in dB, always >= 0
    this.port.onmessage = (e) => { if (e.data === "reset") { this.env = 0; this.gr = 0; } };
  }

  process(inputs, outputs, p) {
    const inp = inputs[0], out = outputs[0];
    if (!out || out.length === 0) return true;
    const n = out[0].length;
    if (!inp || inp.length === 0 || !inp[0]) {
      for (const ch of out) ch.fill(0);
      return true;
    }

    const thresholdDb = p.thresholdDb[0], ratio = p.ratio[0], kneeDb = p.kneeDb[0];
    const aAtt = Math.exp(-1 / (sampleRate * p.attackMs[0] / 1000));
    const aRel = Math.exp(-1 / (sampleRate * p.releaseMs[0] / 1000));
    const makeupLin = fromDb(p.makeupDb[0]);

    const computeDb = (levelDb) => {
      const over = levelDb - thresholdDb;
      if (over <= -kneeDb / 2) return 0;
      if (over >= kneeDb / 2) return over - over / ratio;
      const x = over + kneeDb / 2;
      return (1 - 1 / ratio) * (x * x) / (2 * kneeDb);
    };

    for (let i = 0; i < n; i++) {
      // One detector across all channels, so unequal gain reduction cannot pull
      // the stereo image apart — the same reason glue() uses one.
      let peak = 0;
      for (let c = 0; c < inp.length; c++) {
        const a = Math.abs(inp[c][i]);
        if (a > peak) peak = a;
      }
      this.env = peak > this.env ? peak : this.env * aRel + peak * (1 - aRel);
      const target = computeDb(dB(this.env));
      // Fast onto more reduction, slow off it.
      this.gr = target > this.gr
        ? this.gr * aAtt + target * (1 - aAtt)
        : this.gr * aRel + target * (1 - aRel);
      const g = fromDb(-this.gr) * makeupLin;
      for (let c = 0; c < out.length; c++) {
        const src = inp[c] || inp[0];
        out[c][i] = src[i] * g;
      }
    }
    return true;
  }
}

registerProcessor("music-loom-comp", Comp);
