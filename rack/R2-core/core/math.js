// Small math/util helpers shared across the engines (Math.random-based; for seeded
// generation use core/rng.js).

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const chance = (p) => Math.random() < p;
export const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/** Arithmetic mean of an array (0 for an empty array). */
export const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

// ---- pure similarity measures (deterministic; used by the analysis extractors) ----

/** Pearson correlation of two equal-length sequences (offset/scale invariant). */
export function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  return num / Math.sqrt(da * db || 1e-12);
}

/** Cosine similarity of two equal-length non-negative-ish vectors ∈ [-1,1]. */
export function cosineSim(a, b) {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / Math.sqrt((na || 1e-12) * (nb || 1e-12));
}

