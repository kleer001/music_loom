// Source: cyber_synth/cyber/patches.js
// Patch loader and normaliser. Pure, headless, no DOM.
//
// A stored patch (data/patches/**/*.json, or a genre/DAW/UI override) is validated here
// before it reaches the engine: unknown keys are dropped, missing keys are filled from
// defaults, and every value is clamped to the range the engine / UI imply. `loadPatch`
// returns the flat `poly` object ready to merge as `voices.<role>.poly` via core/merge.js.
//
// This is the serialization half of voices/patch_schema.md (the "ignore what you don't
// understand" / clamp-on-load rules). Defaults and ranges match the synth's own base config
// and its UI sliders; they are kept here rather than imported so the loader stays a
// self-contained, engine-free normalizer with no AudioContext / config-graph dependency.

export const ENGINES = ["subtractive", "fm", "wavetable"];
export const WAVES = ["saw", "square", "tri", "sine"];
export const WT_TABLES = ["basic", "harmonic-sweep", "pwm", "sync", "fold"];
export const FILTER_TYPES = ["lp", "hp", "bp"];
export const DRIVE_MODES = ["tanh", "diode", "clip"];
export const LFO_SHAPES = ["tri", "sine", "square", "saw", "sample-hold", "shslew"];
// The note-scope modulation destinations. A route to a name
// outside this set is dropped, not defaulted and not fatal (voices/patch_schema.md rule 2).
export const MOD_TARGETS = ["cutoff", "resonance", "pitch", "amp", "pan", "fmIndex", "wtPos"];
// Tempo-synced LFO divisions in 16th-steps per cycle. dsp/lfo.js exports an
// LFO_DIVS too, as {label, beats} objects for a different consumer — same idea,
// incompatible shape, so the two are not interchangeable.
export const LFO_DIVS = [32, 16, 8, 6, 4, 8 / 3, 2, 4 / 3, 1];
// The canonical default LFO route — the normalizer's fallback AND what the editors pad a
// route list with before setting one field.
export const DEFAULT_LFO = { shape: "tri", rate: 4, sync: false, div: 4, dest: "cutoff", amount: 0 };

// The one patch-merge rule (voices/patch_schema.md): a sparse patch lays shallowly over
// a poly block, EXCEPT `vel` (a small fixed object — merge fieldwise) while `lfos` stays
// wholesale-replace. NOT core/merge.js mergeConfig: that chain drops keys absent from the
// base, but a patch must survive over a SPARSE base (an authored config poly), so patch keys
// always win here. Used by rack projection, the engine's extra-instance path, and the editors.
export function mergePatch(basePoly, patch) {
  if (!patch || !Object.keys(patch).length) return basePoly;
  const out = { ...(basePoly || {}), ...patch };
  if (patch.vel && basePoly && basePoly.vel) out.vel = { ...basePoly.vel, ...patch.vel };
  return out;
}

const MAX_LFOS = 4;
const MAX_MODS = 8;   // voices/patch_schema.md "≤8 slots"
const MAX_MACROS = 4;

// Scalar fields and their defaults. lfos/vel/mods/macros are
// structured and handled separately.
const SCALAR_DEFAULTS = {
  peak: 0.4, engine: "subtractive", wave1: "saw", wave2: "square",
  osc2: 0, oct2: 0, detune2: 12, sub: 0, uni: 1, uniDetune: 14,
  filterType: "lp", cutoff: 2000, resonance: 0.8, filterEnv: 0, keytrack: 0,
  attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.3, glide: 0,
  fmRatioA: 1, fmRatioB: 2, fmIndex: 3, fmIndexEnv: 0,
  wtPos: 0.3, wtWarp: 0, wtTable: "basic", drive: 0, driveMode: "tanh",
};

// [min, max] clamp ranges, matching the synth's UI sliders.
const RANGES = {
  peak: [0, 1], osc2: [0, 1], oct2: [-4, 4], detune2: [0, 24], sub: [0, 1],
  uni: [1, 7], uniDetune: [0, 40], cutoff: [40, 16000], resonance: [0, 20], filterEnv: [0, 1], keytrack: [0, 1],
  attack: [0, 2], decay: [0, 2], sustain: [0, 1], release: [0, 3], glide: [0, 0.3],
  fmRatioA: [0.5, 8], fmRatioB: [0.5, 12], fmIndex: [0, 12], fmIndexEnv: [0, 1],
  wtPos: [0, 1], wtWarp: [-1, 1], drive: [0, 1],
};
const INT_FIELDS = new Set(["oct2", "detune2", "uni", "uniDetune"]);
const ENUMS = {
  engine: ENGINES, wave1: WAVES, wave2: WAVES,
  filterType: FILTER_TYPES, wtTable: WT_TABLES, driveMode: DRIVE_MODES,
};

// Clamp a numeric value to [lo,hi]; null if it isn't a finite number (→ caller uses default).
function clampNum(v, [lo, hi], int = false) {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const n = Math.min(hi, Math.max(lo, v));
  return int ? Math.round(n) : n;
}

function normLfos(lfos) {
  if (!Array.isArray(lfos)) return [{ ...DEFAULT_LFO }];
  return lfos.slice(0, MAX_LFOS).map((raw) => {
    const l = raw && typeof raw === "object" ? raw : {};
    return {
      shape: LFO_SHAPES.includes(l.shape) ? l.shape : "tri",
      rate: clampNum(l.rate, [0.05, 30]) ?? 4,
      sync: !!l.sync,
      div: LFO_DIVS.includes(l.div) ? l.div : 4,
      dest: MOD_TARGETS.includes(l.dest) ? l.dest : "cutoff",
      amount: clampNum(l.amount, [0, 1]) ?? 0,
    };
  });
}

function normVel(vel) {
  const v = vel && typeof vel === "object" ? vel : {};
  return {
    toAmp: clampNum(v.toAmp, [0, 1]) ?? 1,
    toCutoff: clampNum(v.toCutoff, [0, 1]) ?? 0,
    toFmIndex: clampNum(v.toFmIndex, [0, 1]) ?? 0,
  };
}

function normMods(mods) {
  if (!Array.isArray(mods)) return [];
  return mods
    .filter((m) => m && typeof m === "object" && MOD_TARGETS.includes(m.dest))
    .slice(0, MAX_MODS)
    .map((m) => ({
      source: typeof m.source === "string" ? m.source : "env",
      dest: m.dest,
      amount: clampNum(m.amount, [-1, 1]) ?? 0,
    }));
}

function normMacros(macros) {
  if (!Array.isArray(macros)) return [];
  return macros.slice(0, MAX_MACROS).map((raw) => {
    const mc = raw && typeof raw === "object" ? raw : {};
    const routes = Array.isArray(mc.routes)
      ? mc.routes
          .filter((r) => r && typeof r === "object" && MOD_TARGETS.includes(r.dest))
          .map((r) => ({ dest: r.dest, amount: clampNum(r.amount, [-1, 1]) ?? 0 }))
      : [];
    return { value: clampNum(mc.value, [0, 1]) ?? 0, routes };
  });
}

// Validate + normalize a stored patch into the flat poly object the engine merges. Fills missing
// fields from defaults, drops unknown keys, clamps numbers, and validates enums (an invalid enum
// falls back to its default). `name` passes through when present (the merge drops it if the
// target base has no `name` key).
export function loadPatch(json) {
  const src = json && typeof json === "object" ? json : {};
  const out = { schema: 1 };
  for (const [k, dflt] of Object.entries(SCALAR_DEFAULTS)) {
    if (!(k in src)) { out[k] = dflt; continue; }
    if (k in ENUMS) {
      out[k] = ENUMS[k].includes(src[k]) ? src[k] : dflt;
    } else {
      const c = clampNum(src[k], RANGES[k], INT_FIELDS.has(k));
      out[k] = c == null ? dflt : c;
    }
  }
  out.lfos = normLfos(src.lfos);
  out.vel = normVel(src.vel);
  out.mods = normMods(src.mods);
  out.macros = normMacros(src.macros);
  if (typeof src.name === "string") out.name = src.name;
  return out;
}
