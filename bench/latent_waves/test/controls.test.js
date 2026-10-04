import { test } from "node:test";
import assert from "node:assert/strict";
import { SLIDERS, snap, nudge, readout, padPoint, addPoint, closeTrail, MIN_GAP_S, CLOSE_GLIDE_S } from "../src/controls.js";

const spec = (key) => SLIDERS.find((s) => s.key === key);

test("snap clamps to the range and lands on a step", () => {
  assert.equal(snap(spec("speed"), 9), 4);
  assert.equal(snap(spec("speed"), -9), -2);
  assert.equal(snap(spec("speed"), 1.03), 1.05);
  assert.equal(snap(spec("bend"), 1.0024), 1.0);
  assert.equal(snap(spec("window"), 7.6), 8);
});

test("nudge moves one step and stops at the ends", () => {
  assert.equal(nudge(spec("trim"), 0, 1), 0.5);
  assert.equal(nudge(spec("trim"), 12, 1), 12);
  assert.equal(nudge(spec("bend"), 0.8, -1), 0.8);
  assert.equal(nudge(spec("bend"), 1, 1), 1.005);
});

test("readout names the off state and carries the unit", () => {
  assert.equal(readout(spec("window"), 0), "off");
  assert.equal(readout(spec("window"), 8), "8 steps");
  assert.equal(readout(spec("trim"), -1.5), "-1.5 dB");
});

test("padPoint maps to 0–1 and clamps outside the pad", () => {
  const rect = { left: 100, top: 50, width: 200, height: 200 };
  assert.deepEqual(padPoint(rect, 200, 150), [0.5, 0.5]);
  assert.deepEqual(padPoint(rect, 0, 400), [0, 1]);
});

test("addPoint drops points closer than the minimum gap", () => {
  const pts = addPoint(addPoint([], 0, 0, 0), MIN_GAP_S / 2, 1, 1);
  assert.equal(pts.length, 1);
});

test("addPoint writes the held position before a point after a pause", () => {
  const pts = addPoint(addPoint([], 0, 0.2, 0.3), 1.0, 0.9, 0.9);
  assert.deepEqual(pts, [[0, 0.2, 0.3], [1.0 - MIN_GAP_S, 0.2, 0.3], [1.0, 0.9, 0.9]]);
});

test("closeTrail starts at zero and glides back to the first point", () => {
  const trail = closeTrail([[5, 0.1, 0.2], [6, 0.8, 0.9]]);
  assert.deepEqual(trail, [[0, 0.1, 0.2], [1, 0.8, 0.9], [1 + CLOSE_GLIDE_S, 0.1, 0.2]]);
  assert.deepEqual(closeTrail([[0, 0.5, 0.5]]), []);
});
