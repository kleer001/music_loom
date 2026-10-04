// The live page: a control surface for live.py. Sound is made in Python; the page
// sends control changes to api/control and shows the engine's state from api/state.

import { SLIDERS, snap, nudge, readout, padPoint, addPoint, closeTrail } from "./controls.js";

const STORE_KEY = "latent_waves.live";
const POLL_MS = 100;
const SLOTS = ["A", "B", "C", "D"];
// Everything but `playing`: a reload never starts or stops the sound.
const SAVED = ["model", "sources", "x", "y", "speed", "freeze", "window", "swirl",
  "seed", "drift", "bend", "trim", "trail", "trail_on"];

const $ = (s) => document.querySelector(s);
const pad = $("#pad");
const puck = $("#puck");
const statusEl = $("#status");

let controls = {};
let playing = false;
let dragging = false;
let armed = false;
let recording = null;
let recStart = 0;
const show = {};      // control key → function that shows a value without sending it

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(SAVED.map((k) => [k, controls[k]]))));
  } catch {
    // Private windows can refuse storage; the page still works without it.
  }
}

// One request in flight; changes made meanwhile merge and go in the next one.
let queued = null;
let inFlight = false;

function send(partial) {
  Object.assign(controls, partial);
  save();
  queued = { ...queued, ...partial };
  if (!inFlight) flush();
}

async function flush() {
  inFlight = true;
  while (queued) {
    const body = queued;
    queued = null;
    try {
      await fetch("api/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      statusEl.textContent = "engine not reachable — start it with live.py serve";
    }
  }
  inFlight = false;
}

// ---------------------------------------------------------------- sliders

function buildSliders() {
  const box = $("#controls");
  for (const spec of SLIDERS) {
    const row = document.createElement("div");
    row.className = "slider";
    row.innerHTML = `<span class="name">${spec.label}</span><button class="step" data-dir="-1">−</button>` +
      `<input type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}">` +
      `<button class="step" data-dir="1">+</button><output></output>`;
    const input = row.querySelector("input");
    const out = row.querySelector("output");
    show[spec.key] = (v) => {
      input.value = v;
      out.textContent = readout(spec, v);
    };
    const set = (v) => {
      v = snap(spec, v);
      show[spec.key](v);
      send({ [spec.key]: v });
    };
    input.addEventListener("input", () => set(Number(input.value)));
    for (const b of row.querySelectorAll(".step")) {
      b.addEventListener("click", () => set(nudge(spec, Number(input.value), Number(b.dataset.dir))));
    }
    box.append(row);
    if (spec.key === "speed") box.append(freezeRow());
  }
}

function freezeRow() {
  const row = document.createElement("div");
  row.className = "slider";
  row.innerHTML = `<span class="name">freeze</span><button id="freeze">hold</button>`;
  const b = row.querySelector("button");
  show.freeze = (v) => b.classList.toggle("on", v);
  b.addEventListener("click", () => {
    show.freeze(!controls.freeze);
    send({ freeze: !controls.freeze });
  });
  return row;
}

// ---------------------------------------------------------------- sources

function buildSources(sources) {
  const box = $("#sources");
  const groups = Map.groupBy(sources, (s) => s.slice(0, s.lastIndexOf("/")));
  SLOTS.forEach((slot, i) => {
    const row = document.createElement("div");
    row.className = "source";
    const select = document.createElement("select");
    select.append(new Option("(empty)", ""));
    for (const [dir, files] of groups) {
      const og = document.createElement("optgroup");
      og.label = dir;
      og.append(...files.map((f) => new Option(f.slice(dir.length + 1), f)));
      select.append(og);
    }
    select.addEventListener("change", () => {
      const next = [...controls.sources];
      next[i] = select.value;
      showSources(next);
      send({ sources: next });
    });
    const track = document.createElement("div");
    track.className = "track";
    track.innerHTML = `<div class="win"></div><div class="win"></div><div class="head"></div>`;
    row.append(Object.assign(document.createElement("b"), { textContent: slot }), select, track);
    box.append(row);
  });
}

function showSources(sources) {
  document.querySelectorAll(".source select").forEach((s, i) => (s.value = sources[i]));
  document.querySelectorAll(".corner").forEach((c, i) => {
    const s = sources[i];
    c.textContent = `${SLOTS[i]} ${s ? s.slice(s.lastIndexOf("/") + 1).replace(/\.\w+$/, "") : "(empty)"}`;
  });
}

function showHeads(heads) {
  document.querySelectorAll(".source .track").forEach((track, i) => {
    const h = heads[i];
    track.classList.toggle("empty", !h);
    const [w1, w2] = track.querySelectorAll(".win");
    const head = track.querySelector(".head");
    if (!h) return;
    head.style.left = `${h.pos * 100}%`;
    const [start, len] = h.window ?? [0, 0];
    // A window that runs past the end of the source wraps to its start.
    w1.style.left = `${start * 100}%`;
    w1.style.width = `${Math.min(len, 1 - start) * 100}%`;
    w2.style.left = "0%";
    w2.style.width = `${Math.max(0, start + len - 1) * 100}%`;
  });
}

// ---------------------------------------------------------------- pad and trail

function movePuck(x, y) {
  puck.style.left = `${x * 100}%`;
  puck.style.top = `${y * 100}%`;
}

function drawTrail(trail) {
  $("#trail-line polyline").setAttribute("points", trail.map(([, x, y]) => `${x},${y}`).join(" "));
}

function showTrailButtons() {
  $("#rec").classList.toggle("on", armed);
  $("#loop").classList.toggle("on", controls.trail_on);
  $("#loop").disabled = !(controls.trail?.length >= 2);
}

pad.addEventListener("pointerdown", (e) => {
  dragging = true;
  pad.setPointerCapture(e.pointerId);
  const [x, y] = padPoint(pad.getBoundingClientRect(), e.clientX, e.clientY);
  if (armed) {
    recording = addPoint([], 0, x, y);
    recStart = performance.now();
  }
  movePuck(x, y);
  send({ x, y, trail_on: false });
  showTrailButtons();
});

pad.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const [x, y] = padPoint(pad.getBoundingClientRect(), e.clientX, e.clientY);
  if (recording) addPoint(recording, (performance.now() - recStart) / 1000, x, y);
  movePuck(x, y);
  send({ x, y });
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  if (!recording) return;
  const trail = closeTrail(recording);
  recording = null;
  armed = false;
  if (trail.length) {
    drawTrail(trail);
    send({ trail, trail_on: true });
  }
  showTrailButtons();
}
pad.addEventListener("pointerup", endDrag);
pad.addEventListener("pointercancel", endDrag);

$("#rec").addEventListener("click", () => {
  armed = !armed;
  showTrailButtons();
});
$("#loop").addEventListener("click", () => {
  send({ trail_on: !controls.trail_on });
  showTrailButtons();
});
$("#clear").addEventListener("click", () => {
  drawTrail([]);
  send({ trail: [], trail_on: false });
  showTrailButtons();
});

// ---------------------------------------------------------------- transport and status

$("#play").addEventListener("click", () => send({ playing: !playing }));
$("#model").addEventListener("change", (e) => send({ model: e.target.value }));

function showStatus(s) {
  playing = s.controls.playing;
  $("#play").textContent = playing ? "■ stop" : "▶ play";
  $("#play").classList.toggle("on", playing);
  if (!dragging) movePuck(...s.puck);
  // Another tab can start or stop the trail; the engine's value is the one shown.
  controls.trail_on = s.controls.trail_on;
  showTrailButtons();
  showHeads(s.heads);
  const parts = [];
  if (s.error) parts.push(s.error);
  if (s.building) parts.push("encoding…");
  if (s.sr) parts.push(`${s.dims} dims · ${s.sr / 1000} kHz`);
  if (s.load != null) parts.push(`load ${Math.round(s.load * 100)}%`);
  if (playing && s.level_db != null) parts.push(`level ${s.level_db.toFixed(0)} dB`);
  parts.push(`underruns ${s.underruns}`);
  statusEl.textContent = parts.join(" · ");
  statusEl.classList.toggle("error", Boolean(s.error));
}

async function poll() {
  try {
    showStatus(await (await fetch("api/state", { cache: "no-store" })).json());
  } catch {
    statusEl.textContent = "engine not reachable — start it with live.py serve";
  }
  setTimeout(poll, POLL_MS);
}

async function main() {
  buildSliders();
  const options = await (await fetch("api/options")).json();
  const state = await (await fetch("api/state", { cache: "no-store" })).json();

  // Saved values win where they still apply; anything new keeps the engine's value.
  const saved = loadSaved();
  controls = { ...state.controls, trail: [] };
  for (const k of SAVED) if (k in saved) controls[k] = saved[k];
  if (!options.models.includes(controls.model)) controls.model = state.controls.model;
  controls.sources = SLOTS.map((_, i) => (options.sources.includes(controls.sources?.[i]) ? controls.sources[i] : ""));
  delete controls.playing;

  $("#model").replaceChildren(...options.models.map((m) => new Option(m, m)));
  $("#model").value = controls.model;
  buildSources(options.sources);
  showSources(controls.sources);
  for (const spec of SLIDERS) show[spec.key](snap(spec, controls[spec.key]));
  show.freeze(controls.freeze);
  movePuck(controls.x, controls.y);
  drawTrail(controls.trail);
  showTrailButtons();

  send(controls);
  poll();
}

main();
