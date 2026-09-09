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
export function makeWorkletLoader(file, warn) {
  let ready = false, tried = false;
  return {
    async load(ctx) {
      if (ready) return true;
      if (tried) return ready;
      tried = true;
      if (!ctx || !ctx.audioWorklet) return false;
      try { await ctx.audioWorklet.addModule(new URL(file, import.meta.url)); ready = true; }
      catch (e) { console.warn(warn, e?.message || e); }
      return ready;
    },
    ready: () => ready,
  };
}
