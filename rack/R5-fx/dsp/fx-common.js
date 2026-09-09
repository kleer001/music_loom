// Source: cyber_synth/cyber/fx.js
// Shared by the effect builders beside it: the ramp every `set()` uses, the
// click-free rewire, and the once-per-context AudioWorklet loader. Split out of
// fx.js, which held every effect in one file.
//
// makeWorkletLoader resolves its module with `new URL(file, import.meta.url)`.
// That is this file's URL now, which is the same directory as the worklets, so
// the paths it is given are unchanged.

// no imports: these helpers touch only AudioParams and the context

export const FLOOR = 0.0001;
export const ramp = (param, to, tc, ctx) => param.setTargetAtTime(to, ctx.currentTime, Math.max(0.001, tc) / 3);

// Click-free topology change: dip a wet send to silence, run the (dis/re)connect under
// cover, then restore to the target level. Disconnecting a live node clicks; this masks
// it. Shared by every FX that rewires a feedback graph (reverb mode, delay ping-pong).
export function dipAndRewire(wet, ctx, restore, rewireFn) {
  wet.gain.cancelScheduledValues(ctx.currentTime);
  ramp(wet.gain, FLOOR, 0.004, ctx);
  setTimeout(() => { rewireFn(); ramp(wet.gain, restore, 0.012, ctx); }, 15);
}


// Build a once-per-context AudioWorklet module loader as a { load(ctx), ready() } pair,
// so the phase-vocoder and ladder loaders aren't copy-pasted singletons.
// Load an AudioWorklet module, in a browser or under node-web-audio-api.
//
// A browser takes a URL. node-web-audio-api takes a filesystem path and, below
// Node 22, its loader reaches for Promise.withResolvers. Passing a URL there
// throws "path must be of type string", which a caller that swallows load
// failures reads as "no worklet here" — so every worklet effect quietly took
// its fallback offline while a browser took the worklet, and the same graph
// rendered as one thing and played as another.
export async function addWorkletModule(ctx, url) {
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

// A once-per-context loader as a { load(ctx), ready(ctx) } pair, so the
// phase-vocoder and ladder loaders aren't copy-pasted singletons.
//
// State is per context, not per module. A process that renders twice builds two
// contexts, and a module-level "already tried" would report the first context's
// answer for the second one.
export function makeWorkletLoader(file, warn) {
  const pending = new WeakMap();    // ctx -> Promise<boolean>
  const settled = new WeakMap();    // ctx -> boolean, once the promise resolves
  const start = async (ctx) => {
    if (!ctx || !ctx.audioWorklet) return false;
    try { await addWorkletModule(ctx, new URL(file, import.meta.url)); return true; }
    catch (e) { console.warn(warn, e?.message || e); return false; }
  };
  return {
    load(ctx) {
      if (!pending.has(ctx)) {
        pending.set(ctx, start(ctx).then((ok) => { settled.set(ctx, ok); return ok; }));
      }
      return pending.get(ctx);
    },
    // Synchronous, for a builder choosing its topology. False until load(ctx)
    // has resolved true for this same context.
    ready(ctx) { return settled.get(ctx) === true; },
  };
}
