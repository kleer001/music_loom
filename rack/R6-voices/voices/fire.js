// Source: cyber_synth/cyber/voices.js
// synthesis voice functions for the cyberpunk engine.
//
// Every voice is a self-contained scheduler: `(ctx, t, dest, params, extras) => void`.
// It creates its own Web Audio nodes at time `t`, connects them to the passed `dest`
// GainNode, and starts/stops them — fire-and-forget, with no shared mutable graph beyond
// `dest`. This mirrors web/audio.js's _kick/_snare/_hit idioms (a sine + downward
// pitch-env + amp-env kick, noise-through-biquad percussion), generalized to the
// 808/909/303/supersaw electronic lineage.
//
// Determinism: generation/sequencing is seeded upstream (engine passes the chosen
// params). These functions use Math.random just for real-time humanization (a noise
// buffer's contents, a hair of detune) — outside the seeded path, like web/audio.js
// does. They don't read game state.
//
// Envelopes (web/audio.js _envGain): exponential ramps avoid exact 0 — we floor at
// 0.0001 and only setValueAtTime(0.0001) to silence.

import { getWavetable } from "./wavetables.js";

const FLOOR = 0.0001;

// Build a resonant lowpass with a UNIFORM { in, out, cutoff, resonance, dispose }
// interface: the engine injects `extras.makeFilter` (the analog 4-pole ladder worklet)
// when available; otherwise we fall back to a 2-pole BiquadFilter inline. `cutoff` and
// `resonance` are AudioParams the voice automates (the per-note 303 sweep). This keeps
// voices.js dependency-free — it never imports fx.js, the factory is passed in.
function buildFilter(ctx, extras, { cutoff, resonance, drive, type = "lp" }) {
  // The 4-pole ladder worklet is lowpass-only; use it for "lp", else a biquad of the
  // requested type ("bp" = the Benassi nasal band-pass honk, "hp" = thinned).
  if (type === "lp" && extras && extras.makeFilter) {
    const f = extras.makeFilter(ctx, { cutoff, resonance, drive });
    if (f) return f;
  }
  const bq = ctx.createBiquadFilter();
  bq.type = type === "bp" ? "bandpass" : type === "hp" ? "highpass" : "lowpass";
  bq.frequency.value = cutoff;
  bq.Q.value = resonance;
  return { in: bq, out: bq, cutoff: bq.frequency, resonance: bq.Q, dispose() {} };
}

// Connect the engine's per-voice modulation taps to a note's live params (pitch→osc.detune,
// notecutoff→filter.frequency, fm→FM modulator gain). Taps are persistent source nodes whose
// signal rides additively on the param; the connection drops when the per-note node is GC'd.
function applyVoiceMods(extras, { detune = [], cutoff = null, fm = null } = {}) {
  const m = extras && extras.modTaps;
  if (!m) return;
  if (m.pitch) for (const d of detune) { if (d) try { m.pitch.connect(d); } catch (_) {} }
  if (m.notecutoff && cutoff) try { m.notecutoff.connect(cutoff); } catch (_) {}
  if (m.fm && fm) try { m.fm.connect(fm); } catch (_) {}
}

// Tear down a per-note ladder worklet node once the note has finished (worklets don't
// auto-stop — without this they'd process silence forever). Biquads no-op (GC handles).
function disposeAt(ctx, filt, endTime) {
  if (!filt.dispose) return;
  const ms = Math.max(0, (endTime - ctx.currentTime) * 1000) + 80;
  setTimeout(() => filt.dispose(), ms);
}

// The Roland TR-808 "metal" oscillator bank: six square waves at these fixed inharmonic
// frequencies (Hz) form the cymbal/hi-hat cluster — the source of that metallic ring
// (filtered white noise can't reproduce it).
const METAL_808 = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];

// Sum the six-square TR-808 metal cluster (scaled by `tune`) into `dest`, started at `t`
// and stopped at `stop`. Shared by the hi-hat and the ride/cymbal.
function metalCluster(ctx, t, dest, tune, stop) {
  const sum = ctx.createGain();
  sum.gain.value = 1 / METAL_808.length;
  sum.connect(dest);
  for (const f of METAL_808) {
    const o = ctx.createOscillator();
    o.type = "square"; o.frequency.value = f * tune;
    o.connect(sum);
    o.start(t); o.stop(stop);
  }
}

// Roland JP-8000 supersaw: the reverse-engineered (Adam Szabo) 7-oscillator detune
// offsets and the center/side mix curves — the un-even spread + mix is what gives the
// supersaw its character (vs naive equal-gain symmetric detune).
const SZ_DETUNE = [-0.11002313, -0.06288439, -0.01952356, 0, 0.01991221, 0.06216538, 0.10745242];
const szCenterGain = (mix) => -0.55366 * mix + 0.99785;
const szSideGain = (mix) => -0.73764 * mix * mix + 1.2841 * mix + 0.044372;

// Named super-saw "gear" bundles (proposed_features;).
// A pattern/genre sets `voices.lead.profile` instead of hand-tuning voices/detune/mix:
//   nord   = the narrow 2-3-osc VA (Fragma "Toca's Miracle"; ~8¢) — drops into the symmetric model,
//   jp8000 = the canonical 7-saw Szabo curve, bigroom = wider + hotter sides (the festival stab).
export const SUPERSAW_PROFILES = {
  nord: { voices: 3, detune: 8, mix: 0.7 },
  jp8000: { voices: 7, detune: 18, mix: 0.8 },
  bigroom: { voices: 7, detune: 20, mix: 0.85 },
};

// Analog tuning drift: real VCOs are never perfectly in tune. A few cents of per-note
// jitter adds warmth/beating (and decorrelates oscillators that Web Audio would otherwise
// start at identical phase). Humanization only — outside the seeded path.
const drift = (cents = 3) => (Math.random() * 2 - 1) * cents;

// Shared ADSR gain node (mirrors web/audio.js _envGain). Returns a GainNode the
// caller routes a source into; the caller is responsible for stopping its source
// after t + attack + hold + decay + release.
export function adsr(ctx, t, { peak = 0.3, attack = 0.008, hold = 0.0, decay = 0.2, release = 0.0, sustain = 0.0 } = {}) {
  const a = Math.max(0.001, attack);
  const g = ctx.createGain();
  const sus = Math.max(FLOOR, peak * sustain);
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), t + a); // attack
  if (hold > 0) g.gain.setValueAtTime(Math.max(FLOOR, peak), t + a + hold); // hold the peak
  const decayEnd = t + a + hold + Math.max(0.001, decay);
  g.gain.exponentialRampToValueAtTime(sustain > 0 ? sus : FLOOR, decayEnd); // decay to sustain (or silence)
  if (release > 0 && sustain > 0) {
    g.gain.setValueAtTime(sus, decayEnd);
    g.gain.exponentialRampToValueAtTime(FLOOR, decayEnd + release); // release tail
  }
  return g;
}

// Reusable short white-noise buffer (cached per-ctx so we don't realloc on every hit).
const _noiseCache = new WeakMap();
function noiseBuf(ctx, secs = 1) {
  let cached = _noiseCache.get(ctx);
  if (cached && cached.duration >= secs) return cached;
  const buf = ctx.createBuffer(1, Math.max(1, (ctx.sampleRate * secs) | 0), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  _noiseCache.set(ctx, buf);
  return buf;
}

function noiseSource(ctx, t) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, 1);
  src.loop = true;
  // random read offset so successive hats/snares aren't bit-identical (humanize)
  const off = Math.random() * Math.max(0.001, src.buffer.duration - 0.4);
  src.start(t, off);
  return src;
}

// Per-layer narrowband EQ (deadmau5's "EQ each stacked layer to a slice"): if `band` is set,
// return a bandpass connected to `dest` (so the voice plays through it); else `dest` itself.
// band = center Hz; q defaults to 1.2. Lets stacked leads/pads occupy distinct bands.
function bandTo(ctx, dest, band, q = 1.2) {
  if (!band) return dest;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = band; bp.Q.value = q;
  bp.connect(dest);
  return bp;
}

// Per-note filter-envelope sweep on a lead's cutoff (the thing that turns a static buzz into a
// living lead — the trance cutoff-open, the acid "rise", the pluck snap). When `envMod` is set,
// ramp the cutoff param from `cutoff*(1+envMod*(1+accent))` toward `cutoff` over `envDecay`;
// `envMod<0` swells UP into the note instead. `cutoffParam` is biquad.frequency or ladder.cutoff.
// Numbers grounded in the 303 and Nightcall lead presets.
function leadFilterEnv(ctx, cutoffParam, t, { cutoff, envMod = 0, envDecay = 0.12, accent = 0 } = {}) {
  if (!envMod || !cutoffParam) return;
  const start = Math.max(20, cutoff * (1 + envMod * (1 + accent)));
  cutoffParam.setValueAtTime(start, t);
  cutoffParam.exponentialRampToValueAtTime(Math.max(20, cutoff), t + Math.max(0.005, envDecay));
}

// Delayed pitch-LFO vibrato added to an oscillator's `detune` (cents) — the held-note soloist
// gesture. `vib` = {rate Hz≈5.5, depth cents, delay s≈0.25}. Juno LFO range. No-op if depth≤0.
function applyVibrato(ctx, detuneParam, t, vib, stop) {
  if (!vib || !detuneParam) return;
  const { rate = 5.5, depth = 0, delay = 0.25 } = vib;
  if (!(depth > 0)) return;
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = rate;
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.setValueAtTime(FLOOR, t + delay); // hold flat through the onset
  g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, depth), t + delay + 0.15); // fade vibrato in
  lfo.connect(g).connect(detuneParam);
  lfo.start(t); lfo.stop(stop);
}

// Delayed amplitude tremolo — an LFO on a gain param (the audible wobble on a sustained flute note,
// distinct from pitch vibrato). `trem` = {rate Hz≈5, depth 0..1, delay s}. Adds ±depth around the
// gain's base value, faded in after the onset so attacks stay clean. No-op if depth≤0.
function applyTremolo(ctx, gainParam, t, trem, stop) {
  if (!trem || !gainParam) return;
  const { rate = 5, depth = 0, delay = 0.12 } = trem;
  if (!(depth > 0)) return;
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = rate;
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.setValueAtTime(FLOOR, t + delay);
  g.gain.linearRampToValueAtTime(depth, t + delay + 0.15); // fade the wobble in
  lfo.connect(g).connect(gainParam);
  lfo.start(t); lfo.stop(stop);
}

// A WaveShaper soft-clip (tanh) for analog body saturation. Curves cached per (ctx, k).
const _satCache = new WeakMap();
function softClip(ctx, k = 2.2) {
  let byK = _satCache.get(ctx);
  if (!byK) _satCache.set(ctx, (byK = new Map()));
  const key = k.toFixed(2);
  let curve = byK.get(key);
  if (!curve) {
    const n = 1024;
    curve = new Float32Array(n);
    const norm = Math.tanh(k);
    for (let i = 0; i < n; i++) curve[i] = Math.tanh(k * ((i / (n - 1)) * 2 - 1)) / norm;
    byK.set(key, curve);
  }
  const ws = ctx.createWaveShaper();
  ws.curve = curve;
  ws.oversample = "2x";
  return ws;
}

// ---- Drums (808/909 lineage) -------------------------------------------------

// Kick: sine body with a fast downward pitch-env + a short HPF noise/clicky transient.
// `layered` adds a separate low sub sine for techno weight.
export function kick(ctx, t, dest, p = {}) {
  const { peak = 0.95, tune = 70, click = 0.5, decay = 0.34, sub = 0.6, layered = true, punch = 0.6, pitchDecay = 0.11 } = p;
  // Body: sine swooping from ~3.4x tune down to tune over pitchDecay (80–150 ms typical),
  // through a soft-clip for analog punch (adds harmonics for body/weight).
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(tune * 3.4, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, tune), t + pitchDecay);
  const sat = softClip(ctx, 1.4 + punch * 2.6);
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t); // kick wants an instant attack
  g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  osc.connect(sat).connect(g).connect(dest);
  osc.start(t); osc.stop(t + decay + 0.02);

  // Click transient: a tonal beater blip (the 909 "snap") + a short HPF noise tick.
  if (click > 0) {
    const co = ctx.createOscillator();
    co.type = "triangle";
    co.frequency.setValueAtTime(tune * 16, t);
    co.frequency.exponentialRampToValueAtTime(tune * 4, t + 0.012);
    const cog = ctx.createGain();
    cog.gain.setValueAtTime(Math.max(FLOOR, click * peak * 0.4), t);
    cog.gain.exponentialRampToValueAtTime(FLOOR, t + 0.014);
    co.connect(cog).connect(dest);
    co.start(t); co.stop(t + 0.03);

    const src = noiseSource(ctx, t);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 1800;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(Math.max(FLOOR, click * peak * 0.5), t);
    cg.gain.exponentialRampToValueAtTime(FLOOR, t + 0.018);
    src.connect(hp).connect(cg).connect(dest);
    src.stop(t + 0.04);
  }

  // Layered sub: a deeper, longer sine an octave-ish under the body for weight.
  if (layered && sub > 0) {
    const so = ctx.createOscillator();
    so.type = "sine";
    so.frequency.setValueAtTime(tune * 1.4, t);
    so.frequency.exponentialRampToValueAtTime(Math.max(20, tune * 0.8), t + 0.05);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(Math.max(FLOOR, sub * peak), t);
    sg.gain.exponentialRampToValueAtTime(FLOOR, t + decay * 1.25);
    so.connect(sg).connect(dest);
    so.start(t); so.stop(t + decay * 1.25 + 0.02);
  }
}

// Snare: tone oscillator(s) + noise burst through a bandpass; "snappy" mixes the two.
export function snare(ctx, t, dest, p = {}) {
  const { peak = 0.5, tune = 185, snappy = 0.6, decay = 0.18 } = p;
  // Tone body: two detuned triangles for a fuller 909-ish shell.
  const toneG = ctx.createGain();
  const toneLvl = peak * (1 - snappy * 0.6);
  toneG.gain.setValueAtTime(Math.max(FLOOR, toneLvl), t);
  toneG.gain.exponentialRampToValueAtTime(FLOOR, t + decay * 0.6);
  toneG.connect(dest);
  for (const mult of [1, 1.6]) {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = tune * mult;
    o.connect(toneG);
    o.start(t); o.stop(t + decay * 0.6 + 0.02);
  }
  // Noise: bandpass burst — the "snap".
  const src = noiseSource(ctx, t);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 2000; bp.Q.value = 0.7;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(Math.max(FLOOR, peak * (0.4 + snappy * 0.6)), t);
  ng.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  src.connect(bp).connect(ng).connect(dest);
  src.stop(t + decay + 0.02);
}

// Clap: 3–4 retriggered noise bursts ~8ms apart into a short decay tail (the classic
// "spread" that gives a clap its texture).
export function clap(ctx, t, dest, p = {}) {
  const { peak = 0.5, spread = 0.009, count = 4 } = p;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.9;
  const out = ctx.createGain();
  out.gain.value = 1;
  bp.connect(out).connect(dest);
  // Retriggered bursts.
  for (let i = 0; i < count; i++) {
    const tt = t + i * spread;
    const src = noiseSource(ctx, tt);
    const g = ctx.createGain();
    const isLast = i === count - 1;
    g.gain.setValueAtTime(Math.max(FLOOR, peak * (isLast ? 1 : 0.7)), tt);
    // Last burst rings out as the body; the rest are tight ticks.
    g.gain.exponentialRampToValueAtTime(FLOOR, tt + (isLast ? 0.12 : 0.012));
    src.connect(g).connect(bp);
    src.stop(tt + (isLast ? 0.14 : 0.03));
  }
}

// Hi-hat: the TR-808 metal cluster — six square oscillators at fixed inharmonic
// frequencies, highpassed hard so only the metallic upper harmonics ring (this is the
// authentic 808 method; filtered white noise can't make that sound). Closed (short) or
// open (long) per `open`. `tune` scales the whole cluster.
export function hat(ctx, t, dest, p = {}) {
  const { peak = 0.32, decayClosed = 0.045, decayOpen = 0.26, hpf = 7200, open = false, tune = 1 } = p;
  const dur = open ? decayOpen : decayClosed;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = hpf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 10000; bp.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + dur); // VCA decay = closed/open length
  hp.connect(bp).connect(g).connect(dest);
  metalCluster(ctx, t, hp, tune, t + dur + 0.02);
}

// Rim / clave: a short tuned pulse — a fast clicky triangle blip.
export function rim(ctx, t, dest, p = {}) {
  const { peak = 0.3, freq = 1700 } = p;
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + 0.03);
  o.connect(g).connect(dest);
  o.start(t); o.stop(t + 0.05);
}

// Ride / cymbal: the same TR-808 metal cluster (six squares) as the hat but with a
// longer decay and a gentler highpass so the body rings, plus a breath of HPF noise for
// air. `freq` scales the cluster up toward a bell register.
export function ride(ctx, t, dest, p = {}) {
  const { peak = 0.18, freq = 5200, decay = 0.5 } = p;
  const tune = freq / 1600; // scale the ~200–800 Hz bank up toward the bell
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 5000;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 2.5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  hp.connect(bp).connect(g).connect(dest);
  metalCluster(ctx, t, hp, tune, t + decay + 0.02);
  // a little noise air over the metal
  const nsrc = noiseSource(ctx, t);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(Math.max(FLOOR, peak * 0.3), t);
  ng.gain.exponentialRampToValueAtTime(FLOOR, t + decay * 0.6);
  nsrc.connect(hp); nsrc.connect(ng).connect(dest);
  nsrc.stop(t + decay + 0.02);
}

// ---- Bass --------------------------------------------------------------------

// TB-303 acid bass: single osc (saw/square) → resonant lowpass with a filter
// envelope. ACCENT raises env depth + amp; SLIDE = portamento via
// frequency.setTargetAtTime with NO env retrigger across the tie. `extras.slideFrom`
// (a previous frequency) drives the glide; `extras.tied` suppresses the env retrigger.
function acidBass(ctx, t, dest, p, extras = {}) {
  const {
    peak = 0.7, cutoff = 700, resonance = 13, env = 0.75, accent = 0.45,
    glide = 0.06, wave = "saw", sub = 0.3, dur = 0.2, filterType = "lp",
  } = p;
  const accented = !!extras.accent;
  const slide = !!extras.slide;
  const tied = !!extras.tied;
  const freq = extras.freq || 110;

  const osc = ctx.createOscillator();
  osc.type = wave === "square" ? "square" : "sawtooth";
  osc.detune.value = drift(4); // analog VCO tuning drift
  if (slide && extras.slideFrom) {
    osc.frequency.setValueAtTime(extras.slideFrom, t);
    osc.frequency.setTargetAtTime(freq, t, glide); // portamento glide
  } else {
    osc.frequency.setValueAtTime(freq, t);
  }

  // Filter envelope: accent deepens it. Skip the retrigger on a tied/slid note so the
  // filter stays open and "liquid" across the slide (the 303 signature). The filter is
  // the analog 4-pole ladder (with its growl) when the engine injects it, else a biquad.
  const envDepth = env * (accented ? 1 + accent : 1);
  const base = cutoff;
  const topRaw = base + envDepth * 6000 * (accented ? 1.5 : 1);
  const top = Math.min(16000, topRaw);
  const filt = buildFilter(ctx, extras, { cutoff: top, resonance, drive: accented ? 1.6 : 1.2, type: filterType });
  if (tied) {
    filt.cutoff.setValueAtTime(top * 0.6, t); // no full retrigger across the tie
  } else {
    filt.cutoff.setValueAtTime(top, t);
    filt.cutoff.exponentialRampToValueAtTime(Math.max(40, base), t + Math.min(dur, 0.18));
  }

  const amp = ctx.createGain();
  const lvl = peak * (accented ? 1.25 : 1);
  amp.gain.setValueAtTime(FLOOR, t);
  amp.gain.exponentialRampToValueAtTime(Math.max(FLOOR, lvl), t + 0.005);
  if (tied) {
    amp.gain.setValueAtTime(Math.max(FLOOR, lvl), t + dur); // sustain through the tie
  }
  amp.gain.exponentialRampToValueAtTime(FLOOR, t + dur + (tied ? 0.02 : 0.04));
  osc.connect(filt.in); filt.out.connect(amp).connect(dest);
  applyVoiceMods(extras, { detune: [osc.detune], cutoff: filt.cutoff });
  osc.start(t); osc.stop(t + dur + 0.06);
  disposeAt(ctx, filt, t + dur + 0.06);

  // Optional sub sine an octave under for body.
  if (sub > 0) {
    const so = ctx.createOscillator();
    so.type = "sine"; so.frequency.setValueAtTime(freq / 2, t); so.detune.value = drift(4);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(FLOOR, t);
    sg.gain.exponentialRampToValueAtTime(Math.max(FLOOR, lvl * sub), t + 0.008);
    sg.gain.exponentialRampToValueAtTime(FLOOR, t + dur + 0.04);
    so.connect(sg).connect(dest);
    so.start(t); so.stop(t + dur + 0.06);
  }
}

// Reese bass: 2–3 detuned saws → lowpass (the DnB/dark staple).
function reeseBass(ctx, t, dest, p, extras = {}) {
  const { peak = 0.7, cutoff = 700, resonance = 4, dur = 0.2 } = p;
  const freq = extras.freq || 55;
  const filt = buildFilter(ctx, extras, { cutoff: Math.min(8000, cutoff * 2.5), resonance, drive: 1.3 });
  const amp = adsr(ctx, t, { peak, attack: 0.01, hold: dur * 0.7, decay: 0.06, sustain: 0.8, release: 0.05 });
  filt.out.connect(amp).connect(dest);
  const detunes = [-14, 0, 13];
  const oscDetunes = [];
  for (const d of detunes) {
    const o = ctx.createOscillator();
    o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = d + drift(3);
    o.connect(filt.in);
    o.start(t); o.stop(t + dur + 0.12);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: filt.cutoff });
  disposeAt(ctx, filt, t + dur + 0.12);
}

// EBM/rolling driving bass: saw/square with mid drive, gated short notes, mono.
function ebmBass(ctx, t, dest, p, extras = {}) {
  const { peak = 0.7, cutoff = 700, resonance = 6, wave = "square", dur = 0.16 } = p;
  const freq = extras.freq || 55;
  const o = ctx.createOscillator();
  o.type = wave === "saw" ? "sawtooth" : "square";
  o.frequency.value = freq;
  o.detune.value = drift(3); // analog VCO tuning drift
  const filt = buildFilter(ctx, extras, { cutoff: Math.min(9000, cutoff * 3), resonance, drive: 1.4 });
  const amp = adsr(ctx, t, { peak, attack: 0.004, hold: dur * 0.4, decay: 0.05, sustain: 0.6, release: 0.02 });
  o.connect(filt.in); filt.out.connect(amp).connect(dest);
  applyVoiceMods(extras, { detune: [o.detune], cutoff: filt.cutoff });
  o.start(t); o.stop(t + dur + 0.1);
  disposeAt(ctx, filt, t + dur + 0.1);
}

// FM bass: 2-op growl (carrier sine + sine modulator) through a soft-clip — metallic,
// mid-forward; accent deepens the modulation index. The psy/industrial growl.
function fmBass(ctx, t, dest, p, extras = {}) {
  const { peak = 0.7, ratio = 1, index = 2.5, dur = 0.18, drive = 1.8 } = p;
  const freq = extras.freq || 55;
  const accented = !!extras.accent;
  const carrier = ctx.createOscillator(); carrier.type = "sine"; carrier.frequency.value = freq; carrier.detune.value = drift(3);
  const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = freq * ratio;
  const mg = ctx.createGain();
  const depth = freq * index * (accented ? 1.6 : 1);
  mg.gain.setValueAtTime(Math.max(FLOOR, depth), t);
  mg.gain.exponentialRampToValueAtTime(Math.max(FLOOR, depth * 0.15), t + dur);
  mod.connect(mg).connect(carrier.frequency);
  const amp = adsr(ctx, t, { peak: peak * (accented ? 1.2 : 1), attack: 0.004, hold: dur * 0.5, decay: 0.05, sustain: 0.7, release: 0.03 });
  carrier.connect(softClip(ctx, drive)).connect(amp).connect(dest);
  applyVoiceMods(extras, { detune: [carrier.detune], fm: mg.gain });
  const stop = t + dur + 0.06;
  mod.start(t); mod.stop(stop); carrier.start(t); carrier.stop(stop);
}

// Sub bass: a near-pure sine through a gentle soft-clip, with a faint 2nd-harmonic
// triangle so it reads on small speakers. No filter env — the deep dub/house foundation.
function subBass(ctx, t, dest, p, extras = {}) {
  const { peak = 0.8, dur = 0.22, drive = 1.3, harm = 0.15, glide = 0.05 } = p;
  const freq = extras.freq || 55;
  const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
  if (extras.slide && extras.slideFrom) { o.frequency.setValueAtTime(extras.slideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
  const amp = adsr(ctx, t, { peak, attack: 0.006, hold: dur * 0.6, decay: 0.08, sustain: 0.85, release: 0.04 });
  o.connect(softClip(ctx, drive)).connect(amp).connect(dest);
  applyVoiceMods(extras, { detune: [o.detune] }); // sine sub: pitch only (no filter)
  o.start(t); o.stop(t + dur + 0.1);
  if (harm > 0) {
    const h = ctx.createOscillator(); h.type = "triangle"; h.frequency.value = freq * 2;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(FLOOR, t); hg.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak * harm), t + 0.01);
    hg.gain.exponentialRampToValueAtTime(FLOOR, t + dur + 0.04);
    h.connect(hg).connect(dest); h.start(t); h.stop(t + dur + 0.06);
  }
}

// Hoover bass: a 5-saw detuned stack through the ladder with a downward filter sweep —
// the rave/"mentasm" low end.
function hooverBass(ctx, t, dest, p, extras = {}) {
  const { peak = 0.7, cutoff = 800, resonance = 8, dur = 0.24 } = p;
  const freq = extras.freq || 55;
  const top = Math.min(14000, cutoff * 6);
  const filt = buildFilter(ctx, extras, { cutoff: top, resonance, drive: 1.6 });
  filt.cutoff.setValueAtTime(top, t);
  filt.cutoff.exponentialRampToValueAtTime(Math.max(60, cutoff), t + dur * 0.8);
  const amp = adsr(ctx, t, { peak, attack: 0.01, hold: dur * 0.5, decay: 0.08, sustain: 0.7, release: 0.05 });
  filt.out.connect(amp).connect(dest);
  const oscDetunes = [];
  for (const d of [-18, -7, 0, 7, 18]) {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = d + drift(3);
    o.connect(filt.in); o.start(t); o.stop(t + dur + 0.1);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: filt.cutoff });
  disposeAt(ctx, filt, t + dur + 0.1);
}

// One bass entry point; dispatch on params.kind.
export function bass(ctx, t, dest, p = {}, extras = {}) {
  switch (p.kind) {
    case "reese": return reeseBass(ctx, t, dest, p, extras);
    case "ebm": return ebmBass(ctx, t, dest, p, extras);
    case "rolling": return acidBass(ctx, t, dest, { ...p, sub: p.sub ?? 0.4 }, extras);
    case "fmbass": return fmBass(ctx, t, dest, p, extras);
    case "sub": return subBass(ctx, t, dest, p, extras);
    case "hoover": return hooverBass(ctx, t, dest, p, extras);
    case "pluck": return acidBass(ctx, t, dest, { ...p, dur: 0.1, sub: p.sub ?? 0.2, resonance: Math.max(14, p.resonance || 13) }, { ...extras, slide: false, tied: false });
    case "poly": return engineVoice(ctx, t, dest, p, extras);
    case "acid":
    default: return acidBass(ctx, t, dest, p, extras);
  }
}

// ---- Synths ------------------------------------------------------------------

// Supersaw: N detuned saws summed → lowpass → amp env. Drives BOTH pad (poly,
// slow env) and lead (mono, fast env). `extras.freqs` = an array of chord
// frequencies (one stack per freq) for pads; `extras.freq` for a mono lead.
export function supersaw(ctx, t, dest, p = {}, extras = {}) {
  if (p.profile && SUPERSAW_PROFILES[p.profile]) p = { ...SUPERSAW_PROFILES[p.profile], ...p }; // gear bundle under explicit params
  const {
    peak = 0.4, voices = 7, detune = 18, cutoff = 2200,
    attack = 0.6, release = 1.2, hold = 0.4, decay = 0.3, glide = 0, mix = 0.8, spread = 0,
  } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = p.resonance || 0.7;
  leadFilterEnv(ctx, lp.frequency, t, p); // per-note cutoff sweep when envMod set (no-op otherwise)
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.85, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;

  // Exact JP-8000 model for the canonical 7 voices; symmetric fallback otherwise.
  const useSz = voices === 7;
  const detuneKnob = Math.min(1, detune / 50); // cents knob → 0..1 spread
  const cGain = szCenterGain(mix);
  const sGain = szSideGain(mix);
  const centerV = Math.round((voices - 1) / 2);
  const oscDetunes = [];

  for (const f of freqs) {
    // The JP-8000 tracks a highpass at the played note (thins the detuned low pileup).
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = f * 0.5;
    hp.connect(lp);
    for (let v = 0; v < voices; v++) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      const isCenter = useSz ? v === 3 : v === centerV;
      if (useSz) {
        o.frequency.value = f * (1 + SZ_DETUNE[v] * detuneKnob);
      } else {
        o.frequency.value = f;
        o.detune.value = voices > 1 ? (v / (voices - 1) - 0.5) * 2 * detune : 0;
      }
      o.detune.value += drift(2); // analog drift + decorrelates the phase-aligned starts
      applyVibrato(ctx, o.detune, t, p.vibrato, stop);
      oscDetunes.push(o.detune);
      if (glide > 0 && extras.glideFrom) {
        const ratio = o.frequency.value / f;
        o.frequency.setValueAtTime(extras.glideFrom * ratio, t);
        o.frequency.setTargetAtTime(f * ratio, t, glide);
      }
      // Center saw vs detuned-side saws follow the Szabo mix curve (sides ≈ louder).
      const og = ctx.createGain();
      og.gain.value = (isCenter ? cGain : sGain) / voices;
      // Stereo unison spread: pan each saw by its detune position so the stack widens.
      if (spread > 0 && voices > 1) {
        const pos = useSz ? SZ_DETUNE[v] / 0.11 : (v / (voices - 1) - 0.5) * 2;
        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.max(-1, Math.min(1, spread * pos));
        o.connect(og).connect(pan).connect(hp);
      } else {
        o.connect(og).connect(hp);
      }
      o.start(t); o.stop(stop);
    }
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// 2-op FM: a modulator OscillatorNode → gain (= modIndex in Hz) → carrier.frequency.
// Bell/pluck depending on the env. `params.ratio` sets mod:carrier; `index` the depth.
export function fm(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.3, ratio = 2, index = 3, indexEnv = 0, decay = 0.45, attack = 0.004 } = p;
  const freq = extras.freq || 330;
  const carrier = ctx.createOscillator();
  carrier.type = "sine"; carrier.frequency.value = freq;
  const mod = ctx.createOscillator();
  mod.type = "sine"; mod.frequency.value = freq * ratio;
  const modGain = ctx.createGain();
  // modIndex in Hz; decays with the note for a bell-like spectral evolution. indexEnv adds extra
  // index at onset (Chowning brass-swell: brighter when louder); 0 = the original decay.
  const modDepth = freq * index;
  modGain.gain.setValueAtTime(Math.max(FLOOR, modDepth * (1 + indexEnv)), t);
  modGain.gain.exponentialRampToValueAtTime(Math.max(FLOOR, modDepth * 0.05), t + decay);
  mod.connect(modGain).connect(carrier.frequency);
  const amp = adsr(ctx, t, { peak, attack, hold: 0, decay, sustain: 0 });
  carrier.connect(amp).connect(dest);
  applyVoiceMods(extras, { detune: [carrier.detune], fm: modGain.gain });
  mod.start(t); mod.stop(t + decay + 0.05);
  carrier.start(t); carrier.stop(t + decay + 0.05);
}

// Formant vox: a saw/pulse through 3 parallel bandpass filters tuned to vowel
// formants, with a slow amp env — a synthesized choir "aah/ooh/ee".
const VOWELS = {
  aah: [700, 1220, 2600],
  ooh: [300, 870, 2240],
  ee: [270, 2300, 3000],
};
export function formantVox(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.22, vowel = "aah", voices = 3, attack = 0.5, release = 1.4, detune = 8 } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const formants = VOWELS[vowel] || VOWELS.aah;
  const amp = adsr(ctx, t, { peak, attack, hold: 0.6, decay: 0.4, sustain: 0.85, release });
  amp.connect(dest);
  // Source: a few detuned saws (gives the formant filters harmonics to carve).
  const src = ctx.createGain();
  src.gain.value = 1 / Math.max(1, freqs.length);
  const oscDetunes = [];
  for (const f of freqs) {
    for (let v = 0; v < voices; v++) {
      const o = ctx.createOscillator();
      o.type = "sawtooth"; o.frequency.value = f;
      o.detune.value = (v - (voices - 1) / 2) * detune;
      o.connect(src);
      const stop = t + attack + 0.6 + 0.4 + release + 0.05;
      o.start(t); o.stop(stop);
      oscDetunes.push(o.detune);
    }
  }
  applyVoiceMods(extras, { detune: oscDetunes });
  // 3 parallel formant bandpasses summed into the amp env.
  for (let i = 0; i < formants.length; i++) {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = formants[i]; bp.Q.value = 8 - i * 1.5;
    const fg = ctx.createGain();
    fg.gain.value = 1 / (i + 1); // higher formants quieter
    src.connect(bp).connect(fg).connect(amp);
  }
}

// Spoken-word / sample vox (D5): play a slice of a decoded spoken-word clip (an AudioBuffer)
// through a short anti-click amp env into `dest` — the historically-accurate "a voice reciting
// over the machines" texture. Because it fires into the vox channel, the clip rides the same
// channel → chords group → synth bus → FX rack (drive/bitcrush/ringmod/delay/reverb + the 0.6
// reverb send + sidechain) as any other voice; that grit/space IS the effect.
//
// The engine injects the buffer + this hit's slice + a playback rate via `extras` (the engine
// walks a clip's slice table per vox hit, so the phrase progresses across hits — see
// engine.voxSlices / _voxSampleExtras). With no buffer (a tribute names sampleVox before its
// clip loads, or no buffer support) it no-ops — silent, never a fault. `rate` is varispeed
// (pitch + speed together, like a turntable); `fadeIn/fadeOut` taper the slice edges.
export function sampleVox(ctx, t, dest, p = {}, extras = {}) {
  const buf = extras.buffer;
  if (!buf || typeof ctx.createBufferSource !== "function") return;
  const { peak = 0.8, fadeIn = 0.008, fadeOut = 0.06 } = p;
  const rate = Math.max(0.05, extras.rate || p.rate || 1);
  const dur = buf.duration || 0;
  if (!(dur > 0)) return;
  const sl = extras.slice || { start: 0, len: dur };
  const start = Math.max(0, Math.min(dur - 0.001, sl.start || 0));
  const len = Math.max(0.02, Math.min(dur - start, sl.len || dur));
  const playLen = len / rate; // wall-clock length once varispeed is applied
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  // Anti-click taper: fade in, hold, fade out around the slice; the clip's own dynamics carry
  // the body between. Clamp the fades so a very short slice still has a hold point.
  const a = Math.min(playLen * 0.45, Math.max(0.002, fadeIn));
  const r = Math.min(playLen * 0.45, Math.max(0.002, fadeOut));
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), t + a);
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t + Math.max(a, playLen - r));
  g.gain.exponentialRampToValueAtTime(FLOOR, t + playLen);
  src.connect(g).connect(dest);
  applyVoiceMods(extras, { detune: [src.detune] }); // pitch mod taps ride the source's detune (cents)
  src.start(t, start, len);
  src.stop(t + playLen + 0.02);
}

// ---- More melodic voices (leads / pads / plucks / stabs) --------------------

// Square lead: two detuned squares → lowpass, fast env, glide. Hard mono solo.
export function squareLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 3200, resonance = 3, attack = 0.005, hold = 0.1, decay = 0.12, release = 0.15, glide = 0.02, detune = 8 } = p;
  const freq = extras.freq || 330;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p });
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.7, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  const oscDetunes = [];
  for (const d of [-detune / 2, detune / 2]) {
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = freq; o.detune.value = d + drift(2);
    applyVibrato(ctx, o.detune, t, p.vibrato, stop);
    if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
    o.connect(lp); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// Saw lead: single saw → lowpass, optional pitch "scoop" up into the note. The
// synthwave/trance solo.
export function sawLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 3200, resonance = 2, attack = 0.006, hold = 0.1, decay = 0.12, release = 0.18, glide = 0.02, scoop = 0 } = p;
  const freq = extras.freq || 330;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p });
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.7, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = drift(2);
  applyVibrato(ctx, o.detune, t, p.vibrato, stop);
  if (scoop > 0) { o.frequency.setValueAtTime(freq * (1 - scoop * 0.06), t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.05); }
  else if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
  o.connect(lp); o.start(t); o.stop(stop);
  applyVoiceMods(extras, { detune: [o.detune], cutoff: lp.frequency });
}

// FM lead: 2-op with sustain + glide — the glassy/metallic DX solo. The connected
// modulator ADDS to carrier.frequency, so the glide (intrinsic value) still works under it.
export function fmLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.45, ratio = 2, index = 4, indexEnv = 0, attack = 0.005, hold = 0.12, decay = 0.1, release = 0.18, glide = 0, cutoff = 4500, resonance = 1, breath = 0, sustain = 0.7 } = p;
  const freq = extras.freq || 330;
  const stop = t + attack + hold + decay + release + 0.05;
  const carrier = ctx.createOscillator(); carrier.type = "sine"; carrier.frequency.value = freq; carrier.detune.value = drift(2);
  applyVibrato(ctx, carrier.detune, t, p.vibrato, stop);
  if (glide > 0 && extras.glideFrom) { carrier.frequency.setValueAtTime(extras.glideFrom, t); carrier.frequency.setTargetAtTime(freq, t, glide); }
  const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = freq * ratio;
  // Scale the FM index DOWN as pitch rises — a real flute is nearly a pure sine in its high
  // register, so high notes get far fewer sidebands. Without this, sustained high notes pile up
  // FM partials at 4-8 kHz and SCREECH; this keeps the low/mid rich and the top clean.
  const effIndex = index * Math.max(0.32, Math.min(1.25, 520 / freq));
  const mg = ctx.createGain(); const depth = freq * effIndex;
  mg.gain.setValueAtTime(Math.max(FLOOR, depth * (1 + indexEnv)), t); // indexEnv = brass-swell brightness at onset
  // The FM brightness eases back after the onset (0.42) so a held note settles toward a purer tone
  // (a real flute is brightest on the breath-attack, then sings clean) — keeps tone without the
  // sustained upper-sideband SCREECH that a high floor (0.55) produced. The AMP env carries the
  // sustain; the timbre needn't stay maximally bright to ring.
  mg.gain.exponentialRampToValueAtTime(Math.max(FLOOR, depth * 0.42), t + attack + hold + decay);
  mod.connect(mg).connect(carrier.frequency);
  // A lowpass so fmLead honors the genre's lead `cutoff` like every sibling lead. It was the
  // lone unfiltered lead: wide-open FM sidebands read as a piercing "blown-out" tone, and a
  // genre setting cutoff:2500 had no effect. Same filter-env shaping as squareLead/sawLead.
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p });
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain, release });
  // Amplitude tremolo on sustained notes — the audible flute wobble (pairs with pitch vibrato).
  const tremG = ctx.createGain(); tremG.gain.value = 1;
  applyTremolo(ctx, tremG.gain, t, p.tremolo, stop);
  carrier.connect(lp).connect(amp).connect(tremG).connect(dest);
  applyVoiceMods(extras, { detune: [carrier.detune], fm: mg.gain, cutoff: lp.frequency });
  // Breath/air bed: filtered noise under the tone, articulated with the amp env — the flute's
  // airy "chiff" quality. 0 = pure FM tone (back-compat).
  if (breath > 0) {
    const air = noiseSource(ctx, t);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = Math.min(6000, Math.max(1600, freq * 3)); bp.Q.value = 0.7;
    const ag = adsr(ctx, t, { peak: peak * breath, attack: attack * 3, hold, decay, sustain: 0.4, release });
    air.connect(bp).connect(ag).connect(dest);
    air.start(t); air.stop(stop);
  }
  mod.start(t); mod.stop(stop); carrier.start(t); carrier.stop(stop);
}

// Hoover: the Alpha-Juno "Hoover" — a rich PeriodicWave saw, detuned ×3, with the
// signature downward portamento into the note. The rave lead.
const _hooverWave = new WeakMap();
function hooverWave(ctx) {
  let w = _hooverWave.get(ctx);
  if (w) return w;
  const n = 16, real = new Float32Array(n), imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = (1 / k) * (k % 2 ? 1 : 0.6); // saw-ish, boosted odds
  w = ctx.createPeriodicWave(real, imag);
  _hooverWave.set(ctx, w);
  return w;
}
export function hoover(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 4000, resonance = 2, attack = 0.01, hold = 0.15, decay = 0.15, release = 0.2, detune = 14 } = p;
  const freq = extras.freq || 330;
  const wave = hooverWave(ctx);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.7, release });
  lp.connect(amp).connect(dest);
  const stop = t + attack + hold + decay + release + 0.05;
  const oscDetunes = [];
  for (const d of [-detune, 0, detune]) {
    const o = ctx.createOscillator(); o.setPeriodicWave(wave); o.frequency.value = freq; o.detune.value = d + drift(3);
    o.frequency.setValueAtTime(freq * 1.06, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.08);
    o.connect(lp); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// PWM lead: true pulse-width modulation — saw(f) minus a delayed saw(f); the delay time = the
// duty cycle, swept by an LFO → a moving pulse width (the hollow Juno/Strobe breath). WebAudio has
// no pulse osc, so this saw-subtraction is the correct construction..5 (Juno PWM, LFO 0.3-5 Hz).
export function pwmLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 3000, resonance = 3, attack = 0.006, hold = 0.1, decay = 0.12, release = 0.18, glide = 0.02, detune = 6, pwmRate = 1.5, pwmDepth = 0.6 } = p;
  const freq = extras.freq || 330;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p });
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.7, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  // Two slightly-detuned PWM "pulses"; each pulse = saw − delayed-saw, the delay LFO'd for width.
  const oscDetunes = [];
  for (const dt of [-detune / 2, detune / 2]) {
    const base = 1 / Math.max(20, freq); // one period (s)
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = dt + drift(2);
    applyVibrato(ctx, o.detune, t, p.vibrato, stop);
    if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
    const pg = ctx.createGain(); pg.gain.value = 0.5; pg.connect(lp); // trim the 2-pulse sum
    const inv = ctx.createGain(); inv.gain.value = -1; // the subtracted copy
    const dly = ctx.createDelay(0.05);
    dly.delayTime.value = base * 0.5; // 50% duty at rest
    // LFO sweeps the delay (duty cycle) → PWM.
    const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = pwmRate;
    const lg = ctx.createGain(); lg.gain.value = base * 0.4 * pwmDepth;
    lfo.connect(lg).connect(dly.delayTime); lfo.start(t); lfo.stop(stop);
    o.connect(pg); o.connect(inv).connect(dly).connect(pg);
    o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// Acid lead: a 303 screamer through the real 4-pole ladder (when the engine injects makeFilter),
// with a strong per-note cutoff envelope + accent and a fixed-time slide..3 (decay 0.2-2s,
// slide 60ms, accent→cutoff). The psy/acid topline; sibling of acidBass.
export function acidLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 900, resonance = 16, env = 1.4, accent = 0.4, attack = 0.004, decay = 0.22, release = 0.12, glide = 0.06, wave = "sawtooth" } = p;
  const freq = extras.freq || 220;
  const filt = buildFilter(ctx, extras, { cutoff, resonance, type: "lp" }); // 4-pole ladder if available
  const amp = adsr(ctx, t, { peak, attack, hold: 0, decay, sustain: 0.35, release });
  filt.out.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + decay + release + 0.08;
  // 303 cutoff blip: open to cutoff*(1+env*(1+accent)) then snap down — the squelch.
  leadFilterEnv(ctx, filt.cutoff, t, { cutoff, envMod: env, envDecay: decay, accent });
  const o = ctx.createOscillator(); o.type = wave; o.frequency.value = freq; o.detune.value = drift(2);
  if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
  o.connect(filt.in); o.start(t); o.stop(stop);
  applyVoiceMods(extras, { detune: [o.detune], cutoff: filt.cutoff });
  disposeAt(ctx, filt, stop);
}

// Reese lead: 2-3 detuned saws beating against each other (Kevin Saunderson, 1988) + a slow filter
// LFO + light overdrive → the hollow metallic growl.. Lead-register sibling of the reese bass.
export function reeseLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 2200, resonance = 4, attack = 0.01, hold = 0.2, decay = 0.2, release = 0.2, detune = 22, lfoRate = 0.8, lfoDepth = 600 } = p;
  const freq = extras.freq || 165;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  // Slow filter LFO = the moving, vowel-like neuro motion.
  const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = lfoRate;
  const lg = ctx.createGain(); lg.gain.value = lfoDepth; lfo.connect(lg).connect(lp.frequency);
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p });
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.8, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  lfo.start(t); lfo.stop(stop);
  const og = ctx.createGain(); og.gain.value = 0.34; og.connect(lp); // trim the 3-saw sum
  const oscDetunes = [];
  for (const d of [-detune, 0, detune]) {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = d + drift(3);
    o.connect(og); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// Sync lead: a hard-sync-style screamer approximation — a bright PeriodicWave through a resonant
// filter swept by a fast envelope (the sync formant). True sample-accurate sync needs a worklet;
// this captures the aggressive electro/big-room honk without one. `type:"bp"` = the Benassi bend.
const _syncWave = new WeakMap();
function syncWave(ctx) {
  let w = _syncWave.get(ctx);
  if (w) return w;
  const n = 24, real = new Float32Array(n), imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = 1 / Math.pow(k, 0.7); // bright, slowly-rolling harmonics
  w = ctx.createPeriodicWave(real, imag); _syncWave.set(ctx, w); return w;
}
export function syncLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 2400, resonance = 8, attack = 0.005, hold = 0.1, decay = 0.14, release = 0.16, glide = 0.02, detune = 8, sweep = 1.6, type = "lp" } = p;
  const freq = extras.freq || 330;
  const f = ctx.createBiquadFilter();
  f.type = type === "bp" ? "bandpass" : "lowpass"; f.frequency.value = cutoff; f.Q.value = resonance;
  // The "sync sweep": open the resonant filter hard, then snap down — the screaming formant.
  f.frequency.setValueAtTime(Math.max(40, cutoff * (1 + sweep)), t);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, cutoff), t + Math.max(0.01, decay));
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.6, release });
  f.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  const wave = syncWave(ctx);
  const og = ctx.createGain(); og.gain.value = 0.5; og.connect(f); // trim the 2-osc sum
  const oscDetunes = [];
  for (const d of [-detune / 2, detune / 2]) {
    const o = ctx.createOscillator(); o.setPeriodicWave(wave); o.frequency.value = freq; o.detune.value = d + drift(2);
    applyVibrato(ctx, o.detune, t, p.vibrato, stop);
    if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom, t); o.frequency.setTargetAtTime(freq, t, glide); }
    o.connect(og); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: f.frequency });
}

// Stack lead: the deadmau5 layering doctrine as one voice — a small stack of sub-voices, each on
// its own waveform/octave/detune and EQ'd to its own narrow band (bandTo), panned for width, so
// the composite stays clear — stack, then EQ each layer to a slice; lead band 500Hz-5kHz + HPF.
const STACK_DEFAULT = [
  { wave: "sawtooth", octave: 0, detune: 8, band: 1500, bandQ: 0.9, gain: 1.0, pan: -0.3 },
  { wave: "square", octave: -1, detune: -6, band: 700, bandQ: 1.0, gain: 0.7, pan: 0.3 },
  { wave: "sawtooth", octave: 1, detune: 4, band: 3500, bandQ: 1.2, gain: 0.5, pan: 0.0 },
];
export function stackLead(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, cutoff = 3000, resonance = 1.5, attack = 0.006, hold = 0.12, decay = 0.14, release = 0.2, glide = 0.02, drive = 0 } = p;
  const layers = p.layers || STACK_DEFAULT;
  const freq = extras.freq || 330;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff, ...p }); // the slow Strobe cutoff swell
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.75, release });
  const tail = drive > 0 ? softClip(ctx, 1 + drive * 3) : null;
  if (tail) { lp.connect(amp).connect(tail); tail.connect(dest); }
  else lp.connect(amp).connect(dest);
  const stop = t + attack + hold + decay + release + 0.05;
  const oscDetunes = [];
  for (const L of layers) {
    const lf = freq * Math.pow(2, L.octave || 0);
    const og = ctx.createGain(); og.gain.value = (L.gain ?? 1) / layers.length;
    const pan = ctx.createStereoPanner(); pan.pan.value = Math.max(-1, Math.min(1, L.pan || 0));
    const slot = bandTo(ctx, lp, L.band, L.bandQ); // per-layer narrowband EQ → shared filter
    og.connect(pan).connect(slot);
    const o = ctx.createOscillator(); o.type = L.wave || "sawtooth"; o.frequency.value = lf; o.detune.value = (L.detune || 0) + drift(2);
    applyVibrato(ctx, o.detune, t, p.vibrato, stop);
    if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom * Math.pow(2, L.octave || 0), t); o.frequency.setTargetAtTime(lf, t, glide); }
    o.connect(og); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// Pluck: two detuned saws with a fast filter+amp decay — a tight, leak-free pluck (no
// feedback comb, so nothing keeps running on the audio thread).
export function pluck(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.5, decay = 0.35, cutoff = 4000, resonance = 6 } = p;
  const freq = extras.freq || 330;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = resonance;
  lp.frequency.setValueAtTime(cutoff, t); lp.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 2), t + decay * 0.6);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(Math.max(FLOOR, peak), t); amp.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  lp.connect(amp).connect(dest);
  const oscDetunes = [];
  for (const d of [-6, 6]) { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq; o.detune.value = d + drift(2); o.connect(lp); o.start(t); o.stop(t + decay + 0.05); oscDetunes.push(o.detune); }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// PWM pad: two detuned squares per chord note → lowpass, slow env. Warm analog pad.
export function pwmPad(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.4, cutoff = 2000, resonance = 0.7, attack = 0.6, hold = 0.4, decay = 0.4, release = 1.2, detune = 14 } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.85, release });
  lp.connect(amp).connect(dest);
  const stop = t + attack + hold + decay + release + 0.05;
  const oscDetunes = [];
  for (const f of freqs) for (const d of [-detune / 2, detune / 2]) {
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = f; o.detune.value = d + drift(3);
    const og = ctx.createGain(); og.gain.value = 0.5 / Math.max(1, freqs.length);
    o.connect(og).connect(lp); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// FM pad: low-index 2-op per chord note, slow attack. Glassy DX7 pad.
export function fmPad(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.4, ratio = 2, index = 1.2, attack = 0.8, hold = 0.4, decay = 0.5, release = 1.6 } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.85, release });
  amp.connect(dest);
  const stop = t + attack + hold + decay + release + 0.05;
  const lvl = 1 / Math.max(1, freqs.length);
  const oscDetunes = [], fmGains = [];
  for (const f of freqs) {
    const carrier = ctx.createOscillator(); carrier.type = "sine"; carrier.frequency.value = f; carrier.detune.value = drift(3);
    const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = f * ratio;
    const mg = ctx.createGain(); mg.gain.value = f * index;
    mod.connect(mg).connect(carrier.frequency);
    const cg = ctx.createGain(); cg.gain.value = lvl;
    carrier.connect(cg).connect(amp);
    mod.start(t); mod.stop(stop); carrier.start(t); carrier.stop(stop);
    oscDetunes.push(carrier.detune); fmGains.push(mg.gain);
  }
  for (const fg of fmGains) applyVoiceMods(extras, { fm: fg });
  applyVoiceMods(extras, { detune: oscDetunes });
}

// Glass pad: slightly-inharmonic sine partials an octave up — airy bell shimmer.
export function glassPad(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.35, attack = 0.5, hold = 0.5, decay = 0.6, release = 2.0 } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.8, release });
  amp.connect(dest);
  const stop = t + attack + hold + decay + release + 0.05;
  const partials = [1, 2, 3.01, 4.2];
  const lvl = 1 / (Math.max(1, freqs.length) * partials.length);
  const oscDetunes = [];
  for (const f of freqs) for (let i = 0; i < partials.length; i++) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * partials[i] * 2; o.detune.value = drift(2);
    const og = ctx.createGain(); og.gain.value = lvl / (i + 1);
    o.connect(og).connect(amp); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes });
}

// Stab: a short detuned-saw chord hit (the dub-techno chord, engine throws it to delay).
export function stab(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.45, cutoff = 2600, resonance = 1, attack = 0.004, hold = 0.05, decay = 0.12, release = 0.2, detune = 16, voices = 3 } = p;
  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; lp.Q.value = resonance;
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.4, release });
  lp.connect(amp).connect(bandTo(ctx, dest, p.band, p.bandQ));
  const stop = t + attack + hold + decay + release + 0.05;
  const oscDetunes = [];
  for (const f of freqs) for (let v = 0; v < voices; v++) {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
    o.detune.value = (voices > 1 ? (v / (voices - 1) - 0.5) * 2 * detune : 0) + drift(2);
    const og = ctx.createGain(); og.gain.value = 0.7 / (voices * Math.max(1, freqs.length));
    o.connect(og).connect(lp); o.start(t); o.stop(stop);
    oscDetunes.push(o.detune);
  }
  applyVoiceMods(extras, { detune: oscDetunes, cutoff: lp.frequency });
}

// ---- Riser / uplift FX (build → drop) ----------------------------------------

// A noise sweep + a tonal pitch-ramp that swell over the build phrase and choke at the
// drop — the "build that makes the drop hit twice as hard". `dur` is the phrase length in
// seconds; the engine fires it on the build entry. Fire-and-forget (self-stops).
export function riser(ctx, t, dest, p = {}) {
  const { peak = 0.35, dur = 2.0, noiseColor = 800, sweepOct = 4, tonal = 0.4 } = p;
  const d = Math.max(0.2, dur);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(FLOOR, t);
  amp.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), t + d); // long swell
  amp.gain.exponentialRampToValueAtTime(FLOOR, t + d + 0.08);          // choke at the downbeat
  amp.connect(dest);
  // Noise sweep: a highpass climbing several octaves (the white-noise riser).
  const src = noiseSource(ctx, t);
  const hp = ctx.createBiquadFilter(); hp.type = "highpass";
  hp.frequency.setValueAtTime(noiseColor, t);
  hp.frequency.exponentialRampToValueAtTime(Math.min(16000, noiseColor * Math.pow(2, sweepOct)), t + d);
  const ng = ctx.createGain(); ng.gain.value = 1 - tonal;
  src.connect(hp).connect(ng).connect(amp);
  src.stop(t + d + 0.12);
  // Tonal uplift: a saw ramping up ~an octave under the noise.
  if (tonal > 0) {
    const o = ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(220 * Math.pow(2, Math.max(1, sweepOct - 1)), t + d);
    const og = ctx.createGain(); og.gain.value = tonal * 0.5;
    o.connect(og).connect(amp); o.start(t); o.stop(t + d + 0.12);
  }
}

// ---- Drum articulation variants (round-robined per genre) --------------------
// Tighter 909-style kick: shorter, less sub, more click.
export function kick909(ctx, t, dest, p = {}) {
  return kick(ctx, t, dest, { ...p, decay: (p.decay ?? 0.34) * 0.7, sub: 0.25, click: Math.max(0.6, p.click ?? 0.6), tune: p.tune ?? 75, pitchDecay: (p.pitchDecay ?? 0.11) * 0.8 });
}
// Distorted gabber/industrial kick: heavy soft-clip on body + click.
export function kickGabber(ctx, t, dest, p = {}) {
  const { peak = 0.95, tune = 80, decay = 0.3 } = p;
  const o = ctx.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(tune * 4, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, tune), t + 0.05);
  const g = ctx.createGain(); g.gain.setValueAtTime(Math.max(FLOOR, peak), t); g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  o.connect(softClip(ctx, 6)).connect(g).connect(dest); o.start(t); o.stop(t + decay + 0.02);
  const src = noiseSource(ctx, t); const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
  const cg = ctx.createGain(); cg.gain.setValueAtTime(Math.max(FLOOR, peak * 0.6), t); cg.gain.exponentialRampToValueAtTime(FLOOR, t + 0.02);
  src.connect(hp).connect(softClip(ctx, 4)).connect(cg).connect(dest); src.stop(t + 0.04);
}
// Deep dub kick: long sine, minimal click.
export function kickDub(ctx, t, dest, p = {}) {
  return kick(ctx, t, dest, { ...p, decay: (p.decay ?? 0.4) * 1.3, sub: 0.8, click: 0.15, tune: p.tune ?? 55, pitchDecay: (p.pitchDecay ?? 0.11) * 1.2 });
}
// Noise-forward 909 snare; tight rimshot; brighter/tighter metal hat.
export function snareNoise(ctx, t, dest, p = {}) { return snare(ctx, t, dest, { ...p, snappy: 0.9, decay: (p.decay ?? 0.18) * 1.1 }); }
export function rimshot(ctx, t, dest, p = {}) { return rim(ctx, t, dest, { ...p, freq: p.freq ?? 2200 }); }
export function hatMetal(ctx, t, dest, p = {}) { return hat(ctx, t, dest, { ...p, hpf: (p.hpf ?? 7200) * 1.15, decayClosed: (p.decayClosed ?? 0.045) * 0.8 }); }

// ---- Percussion (tom / shaker / clave / perc) --------------------------------
// Tom: pitch-enveloped sine + a little bandpass-noise body. Drives drum fills.
export function tom(ctx, t, dest, p = {}) {
  const { peak = 0.5, tune = 180, decay = 0.22 } = p;
  const o = ctx.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(tune * 1.8, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, tune), t + decay * 0.6);
  const g = ctx.createGain(); g.gain.setValueAtTime(Math.max(FLOOR, peak), t); g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  o.connect(g).connect(dest); o.start(t); o.stop(t + decay + 0.02);
  const src = noiseSource(ctx, t); const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = tune * 2; bp.Q.value = 1.5;
  const ng = ctx.createGain(); ng.gain.setValueAtTime(Math.max(FLOOR, peak * 0.2), t); ng.gain.exponentialRampToValueAtTime(FLOOR, t + decay * 0.5);
  src.connect(bp).connect(ng).connect(dest); src.stop(t + decay * 0.5 + 0.02);
}
// Shaker: short HPF noise burst with a soft attack — the steady 16th texture.
export function shaker(ctx, t, dest, p = {}) {
  const { peak = 0.25, decay = 0.05, hpf = 6000 } = p;
  const src = noiseSource(ctx, t);
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = hpf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t); g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), t + 0.004); g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  src.connect(hp).connect(g).connect(dest); src.stop(t + decay + 0.02);
}
// Clave: a tight high tuned triangle tick (latin/tribal).
export function clave(ctx, t, dest, p = {}) {
  const { peak = 0.3, freq = 2500, decay = 0.04 } = p;
  const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
  const g = ctx.createGain(); g.gain.setValueAtTime(Math.max(FLOOR, peak), t); g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  o.connect(g).connect(dest); o.start(t); o.stop(t + decay + 0.02);
}
// Perc: a metallic FM ping (psy/tribal color).
// Authentic TR-808 cowbell: two square oscillators a beating detuned-fifth apart (540 + 800 Hz
// at the default) summed into a narrow band-pass (~880 Hz), with a two-stage amp decay — a fast
// transient snap into a clangorous ringing tail. `freq` is the low osc; `ratio` the interval
// (800/540 ≈ 1.48). Recipe: outputchannel.com TR-808 cowbell / Sound on Sound "cowbells & claves".
export function perc(ctx, t, dest, p = {}) {
  const { peak = 0.3, freq = 540, ratio = 800 / 540, decay = 0.18 } = p;
  const f1 = freq, f2 = freq * ratio;
  const stop = t + decay + 0.05;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = (f1 + f2) * 0.66; bp.Q.value = 2.4; // centre ~880 Hz
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(peak, t + 0.002);                          // fast snap
  amp.gain.exponentialRampToValueAtTime(Math.max(1e-4, peak * 0.4), t + 0.04); // initial decay
  amp.gain.exponentialRampToValueAtTime(1e-4, t + decay);                      // ringing tail
  bp.connect(amp).connect(dest);
  for (const f of [f1, f2]) {
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = f; o.detune.value = drift(2);
    o.connect(bp); o.start(t); o.stop(stop);
  }
}

// ---- voice registry / dispatch ---------------------------------------------
// Name → voice fn. The engine dispatches per role via pickVoice(role, params), so a
// One-shot sampler: play a pre-decoded AudioBuffer (passed as extras.buffer) at time t, with
// gain (peak), optional pitch (rate = playbackRate), start offset, and choke (truncate to
// Drop impact / sub-drop: the slammed entry hit at a drop's downbeat. A sine pitch-DIVES from
// `top` Hz down to `low` Hz (the "808 sub drop") through a soft-clip for weight, plus a short
// low-passed noise burst (the slam transient). Fired once when the drop lands.
export function impact(ctx, t, dest, p = {}) {
  const { peak = 0.9, top = 180, low = 38, dive = 0.45, decay = 0.95, noise = 0.5, drive = 1.6 } = p;
  const o = ctx.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(top, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, low), t + dive); // the dive
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + decay);
  o.connect(softClip(ctx, drive)).connect(g).connect(dest);
  o.start(t); o.stop(t + decay + 0.05);
  if (noise > 0) { // the slam transient
    const src = noiseSource(ctx, t);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(Math.max(FLOOR, peak * noise), t);
    ng.gain.exponentialRampToValueAtTime(FLOOR, t + 0.12);
    src.connect(lp).connect(ng).connect(dest);
    src.stop(t + 0.16);
  }
}

// `choke` seconds with a 5 ms fade — tight hits / hat chokes). No file I/O here: the engine
// injects the ready buffer per role (browser decodeAudioData or offline core/wav.js both pass
// an AudioBuffer), so this stays environment-agnostic like every other voice.
export function sample(ctx, t, dest, p = {}, extras = {}) {
  const buf = extras.buffer;
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const rate = p.rate || 1;
  if (rate !== 1) src.playbackRate.value = rate;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(Math.max(FLOOR, p.peak ?? 1), t);
  const natural = buf.duration / rate;
  const end = p.choke ? Math.min(p.choke, natural) : natural;
  if (p.choke && p.choke < natural) amp.gain.exponentialRampToValueAtTime(FLOOR, t + p.choke + 0.005);
  src.connect(amp).connect(dest);
  src.start(t, p.offset || 0);
  src.stop(t + end + 0.03);
}

// genre roster or pattern can name ANY synth here for a role. Bass keeps its own
// kind-dispatch inside bass() (it owns the 303 slide/tie state), so pickVoice("bass")
// returns bass() regardless of params.
// Flute (subtractive, breathy bansuri lineage). A near-triangle tone low-passed at the orchestral
// ~2kHz ceiling — Sound on Sound "Practical Flute Synthesis": flute spectra truncate ~2kHz, and
// brightness (not loudness) tracks blowing pressure, so accent lifts the cutoff (not the level). A
// whisper of 2nd harmonic for the hollow body; a subtle band-passed BREATH layer + an onset CHIFF
// (the air/tonguing that makes it a Raja Ram / Shpongle flute, not a sterile orchestral one); a
// delayed 5–6Hz pitch vibrato. `breath` 0..1 = air mix, `chiff` 0..1 = onset puff.
export function flute(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.4, cutoff = 2000, resonance = 1, attack = 0.05, hold = 0.05, decay = 0.12,
          release = 0.22, glide = 0, breath = 0.16, chiff = 0.3,
          vibrato = { rate: 5.5, depth: 22, delay: 0.22 } } = p;
  const freq = extras.freq || 440;
  const accented = !!extras.accent;
  const out = bandTo(ctx, dest, p.band, p.bandQ);
  const amp = adsr(ctx, t, { peak, attack, hold, decay, sustain: 0.85, release });
  const stop = t + attack + hold + decay + release + 0.06;

  // Tone → lowpass at the ~2kHz ceiling, pitch-tracked a touch + brighter on accent (pressure→brightness).
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
  const ceil = Math.min(8000, cutoff + freq * 0.5 + (accented ? 800 : 0));
  lp.frequency.value = ceil; lp.Q.value = resonance;
  leadFilterEnv(ctx, lp.frequency, t, { cutoff: ceil, envMod: 0.4, envDecay: Math.max(0.05, attack) });
  // Amplitude tremolo on the tone (the singing-flute wobble; pairs with the pitch vibrato).
  const trem = ctx.createGain(); trem.gain.value = 1; applyTremolo(ctx, trem.gain, t, p.tremolo, stop);
  lp.connect(amp).connect(trem).connect(out);

  const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = freq; osc.detune.value = drift(2);
  applyVibrato(ctx, osc.detune, t, vibrato, stop);
  if (glide > 0 && extras.glideFrom) { osc.frequency.setValueAtTime(extras.glideFrom, t); osc.frequency.setTargetAtTime(freq, t, glide); }
  const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = freq * 2; osc2.detune.value = drift(3);
  const h2 = ctx.createGain(); h2.gain.value = 0.12;
  osc.connect(lp); osc2.connect(h2).connect(lp);
  osc.start(t); osc.stop(stop); osc2.start(t); osc2.stop(stop);
  applyVoiceMods(extras, { detune: [osc.detune], cutoff: lp.frequency });

  // Breath: band-passed air under the tone, sharing the amp shape (subtle — SOS warns against overdoing it).
  if (breath > 0) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(ctx, Math.min(2, stop - t + 0.1)); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = Math.min(6000, freq * 2.5); bp.Q.value = 0.7;
    const ng = adsr(ctx, t, { peak: peak * breath, attack: Math.max(0.01, attack), hold, decay, sustain: 0.8, release: release * 0.6 });
    src.connect(bp).connect(ng).connect(out);
    src.start(t); src.stop(stop);
  }
  // Chiff: a brief noise puff at the onset (the tonguing transient).
  if (chiff > 0) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(ctx, 0.1);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = Math.min(7000, freq * 4); bp.Q.value = 0.6;
    const cg = adsr(ctx, t, { peak: peak * chiff * 0.5, attack: 0.004, decay: 0.05, sustain: 0 });
    src.connect(bp).connect(cg).connect(out);
    src.start(t); src.stop(t + 0.12);
  }
}

// Additive flute (Spectral-Modeling / DDSP model): a small set of harmonic SINE partials whose
// upper-harmonic levels fall with pitch (a real flute is near-pure up high) and swell on the
// attack then settle (the Casio-CZ "DCW" brightness sweep) — plus a filtered-noise BREATH residual
// with a louder "chiff" consonant at the onset over a subtle airy bed. This is the rebuild: no FM
// sidebands (the screech), no fixed-waveform subtractive approximation — the spectrum is placed
// directly. Cheap (high notes drop their negligible partials) and renders offline (no worklet).
// Lineage: SMS (Serra), DDSP, Chowning low-index, Casio CZ DCW.
export function fluteAdd(ctx, t, dest, p = {}, extras = {}) {
  const { peak = 0.4, attack = 0.06, hold = 0.05, release = 0.28, breath = 0.04, chiff = 0.1, glide = 0,
          vibrato = { rate: 5.5, depth: 22, delay: 0.25 } } = p;
  const freq = extras.freq || 440;
  // Floor the attack ~22ms — a flute can't speak instantly. (A fast attack from silence is a
  // plucked transient; even for legato the onset must stay gentle. Legato is the PORTAMENTO +
  // the previous note's overlap, NOT a faster attack.)
  const a = Math.max(0.022, attack);
  const susEnd = t + a + Math.max(0, hold);             // end of the flat sustain; release follows
  const rel = Math.max(0.04, release);
  const stop = susEnd + rel + 0.08;
  const out = bandTo(ctx, dest, p.band, p.bandQ);

  // Sum bus: a 1.4 kHz body FORMANT (repurposed from the old dead low-pass) → a gentle air-tame
  // low-pass → out. The formant glues the partials + breath into one instrument (Morgan).
  const form = ctx.createBiquadFilter(); form.type = "peaking"; form.frequency.value = 1400; form.Q.value = 1.0; form.gain.value = 4;
  const tame = ctx.createBiquadFilter(); tame.type = "lowpass"; tame.frequency.value = 6500; tame.Q.value = 0.5;
  form.connect(tame).connect(out);

  // Master amp: a BLOWN onset — an RC rise (setTarget), NOT an exponential-from-floor ramp, and
  // HOLD DEAD FLAT (no peak-then-decay step). That exp-attack + peak-decay shape IS a plucked
  // string; killing it is the single biggest fix for the "guitar"/"struck" character.
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(FLOOR, t);
  amp.gain.setTargetAtTime(peak, t + 0.006, a / 3);     // gentle blown rise to (near) peak, holds there
  // ANCHOR before the release. Two back-to-back setTargetAtTime events on one param hit a
  // node-web-audio-api numerical bug that corrupts the value of the FIRST target's interval
  // (it runs away to ~20×, audibly a long-note explosion the limiter then clips). Pinning the
  // value with setValueAtTime at the boundary breaks the target→target adjacency and fixes it.
  amp.gain.setValueAtTime(peak, susEnd);
  amp.gain.setTargetAtTime(FLOOR, susEnd, rel / 3);      // smooth release — no decay step
  // Tremolo LOCKED to the vibrato rate (real flute vibrato modulates loudness + pitch together).
  const trem = ctx.createGain(); trem.gain.value = 1;
  applyTremolo(ctx, trem.gain, t, p.tremolo || { rate: vibrato.rate, depth: 0.06, delay: vibrato.delay }, stop);
  amp.connect(trem).connect(form);

  // Partials LOCKED to k·f0 (no inter-partial detune — flute partials are phase-locked, not a
  // chorus). Register-limited (near-pure up high). h2/h3 BLOOM (rise slower than the fundamental)
  // so the onset starts pure and brightens — "louder/onset = brighter", the flute tell.
  const drift0 = drift(2);
  const mkPartial = (mult, lvl, bloom) => {
    // Upper partials thin out as pitch rises — a real flute is near-pure sine up high.
    const rl = mult === 1 ? lvl : lvl * Math.max(0.4, Math.min(1, 600 / freq));
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * mult; o.detune.value = mult === 1 ? drift0 : 0;
    if (mult === 1) applyVibrato(ctx, o.detune, t, vibrato, stop);
    if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom * mult, t); o.frequency.setTargetAtTime(freq * mult, t, glide); }
    const g = ctx.createGain();
    const start = bloom ? t + 0.02 : t + 0.012;          // tone lags the breath; harmonics lag the fundamental
    g.gain.setValueAtTime(FLOOR, t);
    g.gain.setValueAtTime(FLOOR, start);
    g.gain.setTargetAtTime(rl, start, bloom ? a / 2.2 : a / 3); // bloom in a touch slower than h1 (was way too slow at `a`)
    o.connect(g).connect(amp);                            // the amp env carries the overall shape + release
    o.start(t); o.stop(stop);
  };
  mkPartial(1, 1.0, false);                              // fundamental always
  mkPartial(2, 0.35, true);                              // 2nd always (blooms)
  if (freq < 1000) mkPartial(3, 0.12, true);             // 3 partials below ~1kHz
  if (freq < 600) mkPartial(4, 0.05, false);             // 4 partials low; near-pure sine up high

  // Breath: PINK-ish air (low-pass the white noise — the old high-pass threw away the low-mid air
  // that reads as breath, leaving hiss), tracking the FUNDAMENTAL + a broad air band, amplitude-
  // following, low level. A chiff "consonant" on the onset, then a quiet bed that dies with the note.
  if (breath > 0 || chiff > 0) {
    const air = ctx.createBufferSource(); air.buffer = noiseBuf(ctx, Math.min(2, stop - t + 0.1)); air.loop = true;
    const pink = ctx.createBiquadFilter(); pink.type = "lowpass"; pink.frequency.value = 1800; pink.Q.value = 0.7;
    const track = ctx.createBiquadFilter(); track.type = "bandpass"; track.frequency.value = Math.min(4000, Math.max(280, freq)); track.Q.value = 1.5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(FLOOR, t);
    ng.gain.linearRampToValueAtTime(Math.max(FLOOR, peak * (breath + chiff)), t + 0.04); // chiff: lower + slower (no click)
    ng.gain.setTargetAtTime(Math.max(FLOOR, peak * breath), t + 0.04, a);                // settle to a quiet bed
    ng.gain.setValueAtTime(Math.max(FLOOR, peak * breath), susEnd);                       // anchor (see amp note — avoids the nwa setTarget→setTarget runaway)
    ng.gain.setTargetAtTime(FLOOR, susEnd, rel / 3);                                      // follow the release (no lingering hiss)
    air.connect(pink).connect(track).connect(ng).connect(form);
    const airBand = ctx.createBiquadFilter(); airBand.type = "bandpass"; airBand.frequency.value = 2800; airBand.Q.value = 0.8; // broad "air"
    const ag = ctx.createGain(); ag.gain.value = 0.4;
    air.connect(airBand).connect(ag).connect(ng);
    air.start(t); air.stop(stop);
  }
}

// ---- General multi-engine synth (the "poly" instrument) --------------------
// One voice, switchable oscillator engine (subtractive | fm | wavetable) feeding a
// shared filter → amp-ADSR → LFO → drive. The classic-synth control surface (osc/
// filter/env/lfo) as a single parametric instrument, replacing fixed-recipe voices for
// Bass/Chords/Lead. Default ranges are anchored to measured Vital preset
// distributions.

const WAVE = { saw: "sawtooth", square: "square", pulse: "square", tri: "triangle", triangle: "triangle", sine: "sine" };

// The per-note (patch-scope) modulation destinations engineVoice's LFOs can address — the
// note-scoped sibling of the genre matrix's bus-scoped registry (cyber/engine.js _modRegistry).
// A route to a name not in this set is skipped, not fatal (voices/patch_schema.md rule 2),
// so an old patch authored against a newer/other engine still plays.
export const MOD_TARGETS = new Set(["cutoff", "resonance", "pitch", "amp", "pan", "fmIndex", "wtPos"]);
const MAX_LFOS = 4; // per-note LFO cap — a runaway patch can't spawn unbounded oscillators

// A 1024-sample drive curve: tanh (smooth), clip (hard), diode (asymmetric/warm).
function driveCurve(mode = "tanh", amount = 0) {
  const n = 1024, c = new Float32Array(n), k = 1 + amount * 24;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = mode === "clip" ? Math.max(-1, Math.min(1, x * (1 + amount * 6)))
      : mode === "diode" ? Math.tanh(k * (x + 0.18 * amount)) - Math.tanh(k * 0.18 * amount)
      : Math.tanh(k * x);
  }
  return c;
}

// Wavetable frames: a table is N single-cycle frames, each a harmonic spectrum (imag coeffs).
// `wtPos` scans across them; the scanner (wtScan) crossfades the two bracketing frames so the
// position is *modulatable* (voices/wavetable_scanning.md). Procedural generators only —
// no sampled audio. `warp` tilts the spectrum (brighter/darker). Cached per table+warp.
const WT_FRAMES = new Map();
function wavetableFrames(table = "basic", warp = 0, N = 16, H = 32) {
  const key = `${table}|${warp}|${N}|${H}`;
  const hit = WT_FRAMES.get(key);
  if (hit) return hit;
  // Imported CC0 tables (cyber/wavetables.js, registered from data/wavetables/*.json) win
  // over the procedural generators (voices/wavetable_scanning.md Phase 2). They carry
  // their own frame count + harmonic resolution; we apply the same `warp` spectral tilt the
  // procedural path does (harmonic n × n^-warp) without mutating the registered originals.
  const registered = getWavetable(table);
  if (registered) {
    const tilted = registered.map(({ real, imag }) => {
      const r = new Float32Array(real.length), im = new Float32Array(imag.length);
      const L = Math.max(real.length, imag.length);
      for (let n = 0; n < L; n++) {
        const g = n === 0 ? 1 : Math.pow(n, -warp);
        if (n < real.length) r[n] = real[n] * g;
        if (n < imag.length) im[n] = imag[n] * g;
      }
      return { real: r, imag: im };
    });
    WT_FRAMES.set(key, tilted);
    return tilted;
  }
  const frames = [];
  for (let k = 0; k < N; k++) {
    const pos = N > 1 ? k / (N - 1) : 0;
    const real = new Float32Array(H), imag = new Float32Array(H);
    for (let n = 1; n < H; n++) {
      let a;
      if (table === "harmonic-sweep") {           // a saw that opens up across the table
        a = n <= 1 + (H - 2) * pos ? 1 / n : 0;
      } else if (table === "pwm") {               // pulse-width morph (duty 0.5 → thin)
        a = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * (0.5 - 0.45 * pos));
      } else if (table === "sync") {              // a formant peak climbing the harmonic axis
        a = Math.exp(-((n - (2 + pos * 12)) ** 2) / 6);
      } else if (table === "fold") {              // sine gaining harmonics as it "folds"
        a = Math.sin(n * (1 + pos * 4)) / n;
      } else {                                    // basic — the saw→square→formant morph
        const saw = 1 / n, square = n % 2 ? 1 / n : 0, formant = Math.exp(-((n - 4) ** 2) / 6) / 2;
        a = pos < 0.5 ? saw * (1 - 2 * pos) + square * (2 * pos)
                      : square * (2 - 2 * pos) + formant * (2 * pos - 1);
      }
      imag[n] = a * Math.pow(n, -warp);
    }
    frames.push({ real, imag });
  }
  WT_FRAMES.set(key, frames);
  return frames;
}

// Equal-power crossfade curves for a WaveShaper: input position (clamped 0..1) → cos/sin·π/2.
// Module-level (the curve is ctx-independent); a WaveShaper clamps input to [-1,1] for free.
function xfadeCurve(fn) {
  const n = 1025, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = Math.min(1, Math.max(0, (i / (n - 1)) * 2 - 1)); c[i] = fn(x * Math.PI / 2); }
  return c;
}
const WT_XFADE_COS = xfadeCurve(Math.cos), WT_XFADE_SIN = xfadeCurve(Math.sin);

// Two-frame equal-power crossfade scanner. wtPos picks the bracketing frames + the base blend;
// `posParam` (a ConstantSource offset) is the live `wtPos` mod destination — an LFO/env sweeps
// the morph within the loaded bracket (full range for a 2-frame table). Both frame gains feed
// `into` (the voice filter input). voices/wavetable_scanning.md.
function wtScan(ctx, { table, wtPos, warp, t, stop, into }) {
  const frames = wavetableFrames(table, warp);
  const N = frames.length;
  const ff = Math.min(1, Math.max(0, wtPos)) * (N - 1);
  const i0 = Math.min(N - 1, Math.floor(ff)), i1 = Math.min(N - 1, i0 + 1);
  const wave = (i) => ctx.createPeriodicWave(frames[i].real, frames[i].imag, { disableNormalization: false });
  const gainA = ctx.createGain(), gainB = ctx.createGain();
  gainA.gain.value = 0; gainB.gain.value = 0;
  gainA.connect(into); gainB.connect(into);
  const posCS = ctx.createConstantSource(); posCS.offset.value = ff - i0;
  const wsA = ctx.createWaveShaper(); wsA.curve = WT_XFADE_COS;
  const wsB = ctx.createWaveShaper(); wsB.curve = WT_XFADE_SIN;
  posCS.connect(wsA).connect(gainA.gain);
  posCS.connect(wsB).connect(gainB.gain);
  posCS.start(t); posCS.stop(stop);
  return { wA: wave(i0), wB: wave(i1), gainA, gainB, posParam: posCS.offset };
}

export function engineVoice(ctx, t, dest, p = {}, extras = {}) {
  if (p.poly) p = { ...p, ...p.poly }; // nested control surface (config/UI) overrides role defaults
  const {
    peak = 0.4, engine = "subtractive",
    filterType = "lp", cutoff = 2000, resonance = 0.8, filterEnv = 0, keytrack = 0,
    attack = 0.01, hold = 0, decay = 0.2, sustain = 0.8, release = 0.3, glide = 0,
    // subtractive
    wave1 = "saw", wave2 = "saw", osc2 = 0, oct2 = 0, detune2 = 12, sub = 0, uni = 1, uniDetune = 14,
    // fm
    fmRatioA = 1, fmRatioB = 2, fmIndex = 3, fmIndexEnv = 0,
    // wavetable
    wtPos = 0.3, wtWarp = 0, wtTable = "basic",
    // drive
    drive = 0, driveMode = "tanh",
  } = p;

  // Per-note modulators (note-scoped). `lfos` is a list (voices/patch_schema.md): each
  // route is { shape, rate, sync, div, dest, amount }, rate free-run Hz or — when `sync` —
  // a period of `div` 16th-steps × extras.sps. Back-compat: an old patch's flat lfo* keys are
  // coerced into a single route so it still plays.
  let lfos = Array.isArray(p.lfos) ? p.lfos : null;
  if (!lfos) {
    lfos = (p.lfoAmount > 0)
      ? [{ shape: p.lfoShape, rate: p.lfoRate, sync: p.lfoSync, div: p.lfoDiv, dest: p.lfoDest, amount: p.lfoAmount }]
      : [];
  }

  // Velocity → expression (voices/patch_schema.md rule 4): a harder-struck note is louder
  // and brighter. extras.vel (0..1, default 1) comes from the pattern's per-note `vel`; `vel.to*`
  // set sensitivity (0 = none, 1 = full). An absent `vel` block (legacy patch) = no sensitivity,
  // so behavior is unchanged until a note actually carries velocity.
  const velR = p.vel || {};
  const vel = extras.vel != null ? extras.vel : 1;
  const velScale = (amt) => 1 - (amt || 0) * (1 - vel);
  const effPeak = peak * velScale(velR.toAmp);
  let effCutoff = cutoff * velScale(velR.toCutoff);
  const effFmIndex = fmIndex * velScale(velR.toFmIndex);

  const freqs = extras.freqs || (extras.freq ? [extras.freq] : [220]);
  // Filter keytrack: cutoff follows pitch (keytrack 1 = one octave of cutoff per octave played),
  // so timbre stays consistent up the keyboard. Reference C4 (261.63 Hz). Music-forward, off by 0.
  if (keytrack) effCutoff *= Math.pow((freqs[0] || 220) / 261.63, keytrack);
  // Sustain-time comes from the note (engine passes `hold` for lead/pad, `dur` for bass),
  // not the panel — so note lengths still vary; the panel sets only A/D/S/R shape.
  const holdTime = hold || (p.dur != null ? Math.max(0.02, p.dur - attack - decay) : 0);
  const stop = t + attack + holdTime + decay + release + 0.08;

  // Shared filter (+ optional per-note env sweep toward the base cutoff).
  const filt = buildFilter(ctx, extras, { cutoff: effCutoff, resonance, drive: 1.2, type: filterType });
  if (filterEnv > 0) {
    filt.cutoff.setValueAtTime(Math.min(16000, effCutoff + filterEnv * 6000), t);
    filt.cutoff.exponentialRampToValueAtTime(Math.max(40, effCutoff), t + attack + decay + 0.05);
  }

  // Shared amp ADSR, then optional drive waveshaper, then (for the pan-LFO) a stereo panner.
  const amp = adsr(ctx, t, { peak: effPeak, attack, hold: holdTime, decay, sustain, release });
  filt.out.connect(amp);
  let tail = amp;
  if (drive > 0) {
    const ws = ctx.createWaveShaper(); ws.curve = driveCurve(driveMode, drive); ws.oversample = "2x";
    amp.connect(ws); tail = ws;
  }
  let panNode = null;
  const needPan = lfos.some((l) => l && l.dest === "pan" && l.amount > 0);
  if (needPan) { panNode = ctx.createStereoPanner(); tail.connect(panNode); panNode.connect(dest); }
  else tail.connect(dest);

  const detuneParams = [], fmGains = [];
  const startOsc = (type, freq, gainVal, periodic, into = filt.in) => {
    const o = ctx.createOscillator();
    if (periodic) o.setPeriodicWave(periodic); else o.type = WAVE[type] || "sawtooth";
    o.frequency.value = freq;
    o.detune.value = drift(3); // analog tuning drift
    // Per-note SLIDE (the 303 portamento contract: extras.slide + extras.slideFrom) — honored here so
    // the poly voice glides too (the editor forces bass→poly). Falls back to the patch-level glideFrom
    // portamento. Uses the patch glide time, or a 303-ish 0.06s when the patch has none.
    if (extras.slide && extras.slideFrom) { o.frequency.setValueAtTime(extras.slideFrom * (freq / freqs[0]), t); o.frequency.setTargetAtTime(freq, t, glide > 0 ? glide : 0.06); }
    else if (glide > 0 && extras.glideFrom) { o.frequency.setValueAtTime(extras.glideFrom * (freq / freqs[0]), t); o.frequency.setTargetAtTime(freq, t, glide); }
    const g = ctx.createGain(); g.gain.value = gainVal;
    o.connect(g).connect(into);
    o.start(t); o.stop(stop);
    detuneParams.push(o.detune);
    return o;
  };

  // Wavetable scan rig (built once per note; the two frames crossfade into the filter).
  const scan = engine === "wavetable" ? wtScan(ctx, { table: wtTable, wtPos, warp: wtWarp, t, stop, into: filt.in }) : null;

  for (const f of freqs) {
    if (engine === "fm") {
      // 2-operator FM: modulator → carrier.frequency, with a decaying index envelope.
      const car = ctx.createOscillator(); car.type = "sine"; car.frequency.value = f * fmRatioA;
      const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = f * fmRatioB;
      const mg = ctx.createGain();
      const depth = effFmIndex * f * fmRatioB;
      mg.gain.setValueAtTime(depth * (1 + fmIndexEnv), t);
      if (fmIndexEnv > 0) mg.gain.exponentialRampToValueAtTime(Math.max(1, depth), t + attack + decay + 0.05);
      mod.connect(mg).connect(car.frequency);
      const g = ctx.createGain(); g.gain.value = 1 / freqs.length;
      car.connect(g).connect(filt.in);
      mod.start(t); car.start(t); mod.stop(stop); car.stop(stop);
      detuneParams.push(car.detune); fmGains.push(mg.gain);
      applyVoiceMods(extras, { fm: mg.gain });
    } else if (engine === "wavetable") {
      // Two frames per unison voice, crossfaded by the scan rig (scan.gainA/gainB).
      const n = Math.max(1, uni | 0);
      for (let v = 0; v < n; v++) {
        const detv = n > 1 ? (v / (n - 1) - 0.5) * 2 * uniDetune : 0;
        const oa = startOsc(null, f, 1 / (freqs.length * n), scan.wA, scan.gainA); oa.detune.value += detv;
        const ob = startOsc(null, f, 1 / (freqs.length * n), scan.wB, scan.gainB); ob.detune.value += detv;
      }
      if (sub > 0) startOsc("sine", f / 2, sub / freqs.length, null);
    } else {
      // Subtractive: osc1 (+ unison stack), optional osc2 an interval away, optional sub.
      const n = Math.max(1, uni | 0);
      for (let v = 0; v < n; v++) {
        const o = startOsc(wave1, f, 1 / (freqs.length * n), null);
        if (n > 1) o.detune.value += (v / (n - 1) - 0.5) * 2 * uniDetune;
      }
      if (osc2 > 0) { const o = startOsc(wave2, f * Math.pow(2, oct2), osc2 / freqs.length, null); o.detune.value += detune2; }
      if (sub > 0) startOsc("sine", f / 2, sub / freqs.length, null);
    }
  }

  // Per-note LFO routing → cutoff | resonance | pitch | amp | pan | fmIndex. Free-run Hz
  // (rate), or tempo-synced when `sync` && extras.sps (period = div 16th-steps × sps). One
  // gain node (la) per route sets the depth and fans out to the destination param(s).
  const applyLfo = (spec) => {
    const { shape = "tri", rate = 4, sync = false, div = 4, dest = "cutoff", amount = 0 } = spec || {};
    if (!(amount > 0)) return;
    if (!MOD_TARGETS.has(dest)) return; // unknown dest → skip, not fatal
    const hz = sync ? (extras.sps ? 1 / (div * extras.sps) : 0) : rate;
    if (!(hz > 0)) return;
    // sample-hold / shslew: a ConstantSource re-randomized each period (shslew glides between
    // steps). WebAudio oscillators have no S&H wave; this matches the genre matrix's S&H. Uses
    // Math.random — the same real-time-humanization carve-out from the determinism contract.
    let source;
    if (shape === "sample-hold" || shape === "shslew") {
      const cs = ctx.createConstantSource(); cs.offset.value = 0;
      const period = 1 / hz, slew = shape === "shslew" ? Math.min(period * 0.4, 0.08) : 0;
      for (let tt = t; tt < stop; tt += period) {
        const val = Math.random() * 2 - 1;
        if (slew > 0) cs.offset.setTargetAtTime(val, tt, slew / 3); else cs.offset.setValueAtTime(val, tt);
      }
      cs.start(t); cs.stop(stop); source = cs;
    } else {
      const osc = ctx.createOscillator(); osc.type = WAVE[shape] || "triangle"; osc.frequency.value = hz;
      osc.start(t); osc.stop(stop); source = osc;
    }
    const la = ctx.createGain(); source.connect(la);
    const drive1 = (param, depth) => { la.gain.value = depth; la.connect(param); };
    const driveAll = (params, depth) => { la.gain.value = depth; for (const pr of params) la.connect(pr); };
    if (dest === "pitch") driveAll(detuneParams, amount * 100);               // ±cents
    else if (dest === "amp") drive1(amp.gain, amount * 0.5);                  // tremolo
    else if (dest === "pan" && panNode) drive1(panNode.pan, amount);         // auto-pan ±1
    else if (dest === "resonance" && filt.resonance) drive1(filt.resonance, amount * Math.max(2, resonance) * 0.5);
    else if (dest === "fmIndex" && fmGains.length) driveAll(fmGains, amount * freqs[0] * fmRatioB * effFmIndex);
    else if (dest === "wtPos" && scan) drive1(scan.posParam, amount);        // live wavetable scan
    else if (dest === "wtPos") return;                                       // wtPos on a non-WT engine: skip
    else drive1(filt.cutoff, amount * effCutoff * 0.8);                      // cutoff (default)
  };
  for (const spec of lfos.slice(0, MAX_LFOS)) applyLfo(spec);

  // General mod routes (voices/patch_schema.md): a shared mod-envelope or a macro value →
  // any MOD_TARGETS dest. `routeFor` maps a dest name → its param(s) + depth scale (the same
  // targets applyLfo drives); null = target unavailable on this engine → skip, not fatal.
  const routeFor = (dest, amount) => {
    if (dest === "pitch") return { params: detuneParams, depth: amount * 100 };
    if (dest === "amp") return { params: [amp.gain], depth: amount * 0.5 };
    if (dest === "pan" && panNode) return { params: [panNode.pan], depth: amount };
    if (dest === "resonance" && filt.resonance) return { params: [filt.resonance], depth: amount * Math.max(2, resonance) * 0.5 };
    if (dest === "fmIndex" && fmGains.length) return { params: fmGains, depth: amount * freqs[0] * fmRatioB * effFmIndex };
    if (dest === "wtPos") return scan ? { params: [scan.posParam], depth: amount } : null;
    if (dest === "cutoff") return { params: [filt.cutoff], depth: amount * effCutoff * 0.8 };
    return null;
  };
  const routeSignal = (src, dest, amount) => {
    if (!(amount > 0) || !MOD_TARGETS.has(dest)) return;
    const r = routeFor(dest, amount); if (!r) return;
    const g = ctx.createGain(); g.gain.value = r.depth; src.connect(g); for (const pr of r.params) g.connect(pr);
  };
  // The shared mod-envelope, built lazily — an A/D/S/R-shaped ConstantSource (reuses the amp
  // envelope's shape) any `source:"env"` route taps.
  let modEnv = null;
  const getModEnv = () => {
    if (modEnv) return modEnv;
    const cs = ctx.createConstantSource(); cs.offset.value = 0;
    cs.offset.setValueAtTime(0, t);
    cs.offset.linearRampToValueAtTime(1, t + attack + 0.001);
    cs.offset.linearRampToValueAtTime(sustain, t + attack + decay + 0.002);
    cs.offset.setValueAtTime(sustain, t + attack + holdTime + decay);
    cs.offset.linearRampToValueAtTime(0, stop);
    cs.start(t); cs.stop(stop); modEnv = cs; return cs;
  };
  for (const m of (Array.isArray(p.mods) ? p.mods : []).slice(0, 8)) {
    if (m && m.source === "env") routeSignal(getModEnv(), m.dest, m.amount || 0);
  }
  for (const mac of (Array.isArray(p.macros) ? p.macros : []).slice(0, 4)) {
    if (!mac || !Array.isArray(mac.routes) || !(mac.value > 0)) continue;
    const cs = ctx.createConstantSource(); cs.offset.value = mac.value; cs.start(t); cs.stop(stop);
    for (const r of mac.routes) if (r) routeSignal(cs, r.dest, r.amount || 0);
  }

  applyVoiceMods(extras, { detune: detuneParams, cutoff: filt.cutoff });
  disposeAt(ctx, filt, stop);
}

export const SYNTHS = {
  flute, fluteAdd,
  engineVoice,
  poly: engineVoice,
  kick, snare, clap, hat, rim, ride,
  kick909, kickGabber, kickDub, snareNoise, rimshot, hatMetal,
  tom, shaker, clave, perc,
  bass, supersaw, fm, formantVox, sampleVox,
  squareLead, sawLead, fmLead, hoover, pluck,
  pwmLead, acidLead, reeseLead, syncLead, stackLead,
  pwmPad, fmPad, glassPad, stab, riser, sample, impact,
};

// Each role's historical voice — the fallback when no `synth` is named, so defaults
// reproduce the original wiring exactly.
const ROLE_DEFAULT = {
  kick: "kick", snare: "snare", clap: "clap", hat: "hat", rim: "rim", ride: "ride",
  tom: "tom", shaker: "shaker", clave: "clave", perc: "perc",
  bass: "bass", pad: "supersaw", lead: "supersaw", arp: "supersaw", counter: "supersaw",
  vox: "formantVox", fm: "fm",
};

export function pickVoice(role, p) {
  if (role === "bass") return bass;
  const name = (p && p.synth) || ROLE_DEFAULT[role] || "supersaw";
  return SYNTHS[name] || SYNTHS[ROLE_DEFAULT[role]] || supersaw;
}
