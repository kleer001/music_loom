// Pure logic for the live page: slider steps and readouts, pad coordinates and
// trail recording. No DOM, so node --test runs it.

// Keys match live.py's DEFAULTS; ranges match its RANGES.
export const SLIDERS = [
  { key: "speed", label: "speed", min: -2, max: 4, step: 0.05, digits: 2, unit: "×" },
  { key: "window", label: "window", min: 0, max: 64, step: 1, digits: 0, unit: " steps", zero: "off" },
  { key: "swirl", label: "swirl", min: 0, max: 1, step: 0.01, digits: 2 },
  { key: "drift", label: "drift", min: 0, max: 2, step: 0.02, digits: 2, unit: " σ" },
  { key: "seed", label: "seed", min: 1, max: 999, step: 1, digits: 0 },
  { key: "bend", label: "bend", min: 0.8, max: 1.2, step: 0.005, digits: 3, unit: "×" },
  { key: "trim", label: "level trim", min: -12, max: 12, step: 0.5, digits: 1, unit: " dB" },
];

export function snap(spec, value) {
  const clamped = Math.min(spec.max, Math.max(spec.min, value));
  const steps = Math.round((clamped - spec.min) / spec.step);
  return Number((spec.min + steps * spec.step).toFixed(spec.digits));
}

export function nudge(spec, value, dir) {
  return snap(spec, value + dir * spec.step);
}

export function readout(spec, value) {
  if (spec.zero && value === 0) return spec.zero;
  return `${value.toFixed(spec.digits)}${spec.unit ?? ""}`;
}

// Pointer position as pad coordinates, 0–1 on each axis, clamped to the pad.
export function padPoint(rect, clientX, clientY) {
  const clamp = (v) => Math.min(1, Math.max(0, v));
  return [clamp((clientX - rect.left) / rect.width), clamp((clientY - rect.top) / rect.height)];
}

// Pointer events arrive only on movement. A gap longer than HOLD_S was the puck
// held still, so the recorder writes the held position just before the new one;
// without it the replay would glide across the pause.
export const MIN_GAP_S = 0.015;
export const HOLD_S = 0.05;

export function addPoint(points, t, x, y) {
  const last = points[points.length - 1];
  if (last && t - last[0] < MIN_GAP_S) return points;
  if (last && t - last[0] > HOLD_S) points.push([t - MIN_GAP_S, last[1], last[2]]);
  points.push([t, x, y]);
  return points;
}

// A loop that ends away from where it began would jump on every pass, so the
// trail closes with a glide back to its first point.
export const CLOSE_GLIDE_S = 0.3;

export function closeTrail(points) {
  if (points.length < 2) return [];
  const t0 = points[0][0];
  const trail = points.map(([t, x, y]) => [t - t0, x, y]);
  const [, x0, y0] = trail[0];
  trail.push([trail[trail.length - 1][0] + CLOSE_GLIDE_S, x0, y0]);
  return trail;
}
