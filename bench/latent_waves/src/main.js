// Audition page for the bench renders. Reads the manifest latent.py writes and
// lays out one model's renders at a time, with the numbers each render logged.

const STORE_KEY = "latent_waves.audition";

// What each operation is, in the words of the spec sheet.
const OP_NOTES = {
  roundtrip_a: "encode → decode, no change",
  stretch_x2: "latent resampled to twice the frames",
  "meld_0.5": "A and B latents mixed half and half",
  meld_sweep: "balance swept from all A to all B",
};

const select = document.querySelector("#model");
const rendersEl = document.querySelector("#renders");
const sourcesEl = document.querySelector("#sources");

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Private windows can refuse storage; the page still works without it.
  }
}

function describe(entry) {
  if (entry.op.startsWith("tour_dim")) {
    return `dimension ${entry.dim} swept −${entry.depth} → +${entry.depth}: ` +
      `RMS ${entry.rms_swing_db >= 0 ? "+" : ""}${entry.rms_swing_db} dB, ` +
      `centroid ${(entry.centroid_swing * 100).toFixed(0)}%`;
  }
  if (entry.op.startsWith("bend_")) return `decoder weights ${entry.param}: ${entry.bend_op} ${entry.amount}`;
  return OP_NOTES[entry.op] ?? entry.op;
}

function card(entry) {
  const div = document.createElement("div");
  div.className = "render";
  const head = document.createElement("div");
  head.className = "render-head";
  head.innerHTML = `<b>${entry.op}</b> <span>${entry.seconds} s · raw peak ${entry.peak_dbfs_raw} dBFS</span>`;
  const note = document.createElement("div");
  note.className = "render-note";
  note.textContent = describe(entry);
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = entry.file;
  div.append(head, note, audio);
  return div;
}

function show(model, manifest) {
  rendersEl.replaceChildren(...manifest.filter((e) => e.model === model).map(card));
}

async function main() {
  const manifest = await (await fetch("tmp/renders/manifest.json", { cache: "no-store" })).json();
  const models = [...new Set(manifest.filter((e) => e.model !== "sources").map((e) => e.model))].sort();
  select.replaceChildren(...models.map((m) => new Option(m, m)));

  const sources = manifest.filter((e) => e.model === "sources");
  if (sources.length) {
    const h = document.createElement("h2");
    h.textContent = "sources";
    sourcesEl.replaceChildren(h, ...sources.map(card));
  }

  const state = loadState();
  if (models.includes(state.model)) select.value = state.model;
  show(select.value, manifest);

  select.addEventListener("change", () => {
    saveState({ ...loadState(), model: select.value });
    show(select.value, manifest);
  });
}

main();
