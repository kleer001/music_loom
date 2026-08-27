// Source: cyber_synth/cyber/wavetables.js
// cyber/wavetables.js — a tiny registry for imported (CC0) wavetables.
//
// A wavetable is an ordered list of frames; each frame is a harmonic spectrum
// `{ real: Float32Array, imag: Float32Array }` (index n = the nth harmonic), the same
// shape the procedural generator in voices.js (`wavetableFrames`) produces and that the
// scanner (`wtScan`) turns into `PeriodicWave`s. This module just holds named frame sets
// so the scanner can resolve a `wtTable` name to imported frames before falling back to a
// procedural generator. See voices/wavetable_scanning.md (Phase 2).
//
// Pure + headless: no fs, no DOM, no AudioContext. Build-time importers
// (scripts/import_wavetables.mjs) write derived coefficient JSON to data/wavetables/; the
// browser and tests read that JSON and feed it here via `loadWavetableData` →
// `registerWavetable`. Deterministic: fixed data in, fixed frames out, no Math.random.

const REGISTRY = new Map();

// Coerce a frame's real/imag (plain Array or Float32Array, possibly absent) to Float32Array.
function toFrame(frame) {
  const real = frame.real || [];
  const imag = frame.imag || [];
  return {
    real: real instanceof Float32Array ? real : Float32Array.from(real),
    imag: imag instanceof Float32Array ? imag : Float32Array.from(imag),
  };
}

// Register a wavetable under `name`. `frames` is an array of { real, imag } (plain Arrays
// or Float32Arrays). Stored frames are normalized to Float32Array so the scanner can pass
// them straight to ctx.createPeriodicWave. Overwrites any table already under `name`.
export function registerWavetable(name, frames) {
  if (!name || !Array.isArray(frames) || frames.length === 0) {
    throw new Error("registerWavetable(name, frames): need a name and a non-empty frame array");
  }
  REGISTRY.set(name, frames.map(toFrame));
}

// Return the registered frame array for `name`, or null if none is registered.
export function getWavetable(name) {
  return REGISTRY.get(name) || null;
}

// Convert an imported table JSON's `data` array (see scripts/import_wavetables.mjs:
// [{ real: [...], imag: [...] }, ...]) into the { real:Float32Array, imag:Float32Array }
// frame array that registerWavetable expects. Does not register — the caller decides the
// name (typically json.name): registerWavetable(json.name, loadWavetableData(json)).
export function loadWavetableData(json) {
  if (!json || !Array.isArray(json.data)) {
    throw new Error("loadWavetableData(json): json.data must be an array of { real, imag } frames");
  }
  return json.data.map(toFrame);
}
