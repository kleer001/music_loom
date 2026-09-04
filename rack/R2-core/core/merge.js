// Deep config merge + sparse diff.
// Only keys present in `base` survive a merge, so a partial/unknown override can never
// corrupt the config shape.

export function mergeConfig(base, over) {
  if (Array.isArray(base)) return over !== undefined ? over.slice() : base.slice();
  if (base && typeof base === "object") {
    const out = {};
    for (const k of Object.keys(base)) {
      const b = base[k];
      if (b && typeof b === "object" && !Array.isArray(b)) {
        out[k] = mergeConfig(b, (over && over[k]) || {});
      } else if (Array.isArray(b)) {
        out[k] = over && k in over ? over[k].slice() : b.slice();
      } else {
        out[k] = over && k in over ? over[k] : b;
      }
    }
    return out;
  }
  return over !== undefined ? over : base;
}

// Keep only the leaves of `full` that differ from `base` (prunes empty branches).
export function sparseDiff(base, full) {
  const out = {};
  for (const k of Object.keys(base)) {
    const b = base[k];
    const f = full ? full[k] : undefined;
    if (b && typeof b === "object" && !Array.isArray(b)) {
      const d = sparseDiff(b, f || {});
      if (Object.keys(d).length) out[k] = d;
    } else if (Array.isArray(b)) {
      if (JSON.stringify(b) !== JSON.stringify(f)) out[k] = f;
    } else if (f !== undefined && f !== b) {
      out[k] = f;
    }
  }
  return out;
}
