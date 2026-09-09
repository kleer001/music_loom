// A compressor whose offline render matches what a browser plays, because both
// run the same JS: the DSP lives in comp-worklet.js and neither runtime is
// asked to supply a detector.
//
// The native-node version this replaces is not recoverable. Measured against
// Chrome, node-web-audio-api's BiquadFilterNode agrees to -128 dB at a 1 kHz
// corner and not at all by 1 Hz, where the disagreement is the size of the
// signal — and an envelope release of 150 ms wants a 1.06 Hz corner. A
// DelayNode one-pole fails differently: the implicit latency inside a feedback
// cycle is about a quantum longer in Chrome, so the same coefficients give
// noticeably different time constants. Both put the detector, the one part that
// has to agree, exactly where the runtimes do not.
//
// The algorithm is the one master.js `glue()` runs offline over a finished
// buffer. An instrument can compress live and master afterwards without the two
// stages disagreeing about what a threshold means.
//
// Parameters, all k-rate AudioParams on the returned node:
//   thresholdDb  ratio  kneeDb  attackMs  releaseMs  makeupDb

const WORKLET = "./comp-worklet.js";
const NAME = "music-loom-comp";
const loaded = new WeakMap();   // ctx -> Promise<boolean>

// Browsers take a URL. node-web-audio-api takes a filesystem path, and on Node
// below 22 its loader also reaches for Promise.withResolvers.
async function addModule(ctx) {
  const url = new URL(WORKLET, import.meta.url);
  if (url.protocol !== "file:") return ctx.audioWorklet.addModule(url);
  if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    };
  }
  const { fileURLToPath } = await import("node:url");
  return ctx.audioWorklet.addModule(fileURLToPath(url));
}

// Call once per context before makeComp. Returns false if the worklet could not
// be loaded, in which case makeComp will throw rather than quietly pass audio
// through uncompressed — a compressor that silently does nothing is worse than
// one that is absent.
export function loadComp(ctx) {
  if (!loaded.has(ctx)) {
    loaded.set(ctx, addModule(ctx).then(() => true).catch((e) => {
      console.warn("[comp] worklet unavailable:", e?.message || e);
      return false;
    }));
  }
  return loaded.get(ctx);
}

export function makeComp(ctx, {
  thresholdDb = -18,
  ratio = 4,
  kneeDb = 6,
  attackMs = 10,
  releaseMs = 150,
  makeupDb = 0,
} = {}) {
  const node = new AudioWorkletNode(ctx, NAME, {
    numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2],
  });
  const P = node.parameters;
  P.get("thresholdDb").value = thresholdDb;
  P.get("ratio").value = ratio;
  P.get("kneeDb").value = kneeDb;
  P.get("attackMs").value = attackMs;
  P.get("releaseMs").value = releaseMs;
  P.get("makeupDb").value = makeupDb;

  return {
    input: node, output: node, node,
    // Detector state carries across a render; reset it when reusing a graph for
    // an A/B, or the second take starts wherever the first one left off.
    reset() { node.port.postMessage("reset"); },
    set(p = {}) {
      for (const k of ["thresholdDb","ratio","kneeDb","attackMs","releaseMs","makeupDb"]) {
        if (p[k] !== undefined) P.get(k).setTargetAtTime(p[k], ctx.currentTime, 0.01);
      }
    },
  };
}
