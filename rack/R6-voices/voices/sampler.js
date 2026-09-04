// Source: ferine_town/web/sampler.js
// Sampled-instrument playback — a loader over a vendored soundfont subset held as
// per-note base64 MP3 and fetched offline, never at runtime. Browser-only, and
// outside any determinism contract: it observes, it does not perturb.
//
// FluidR3 samples every semitone, so a note plays from its own (or an adjacent)
// sample with playbackRate doing at most a ~1-semitone shift — clean timbre, no
// looping needed for the combo's short notes. Decode is lazy: an instrument's
// notes are decoded the first time it's selected, so a broad audition pool does
// not stall startup. The shared gain envelope (attack/sustain/release) is passed
// in by the caller so sampled and synth voices shape identically.

import { pitchRatio } from "../core/dsp.js";
import { centsToRatio } from "../core/music.js";

const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

// Eased pitch-inflection curves for scoops/falls. A straight pitch glide (a
// linear ramp in semitones) reads as a robotic portamento; real horn gestures
// curve. EASE_OUT decelerates (a scoop settling into the target pitch); EASE_IN
// accelerates (a fall smearing away, picking up speed as it dies).
const EASE_OUT = (x) => 1 - (1 - x) ** 3;
const EASE_IN = (x) => x * x;
// A playbackRate curve from `fromSemis` to `toSemis` (relative to `rate`), shaped
// by `ease`. Returned as the Float32Array setValueCurveAtTime wants.
function bendCurve(rate, fromSemis, toSemis, ease, n = 32) {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = fromSemis + (toSemis - fromSemis) * ease(i / (n - 1));
    a[i] = rate * Math.pow(2, s / 12);
  }
  return a;
}

// Note name ("Bb3", "C#4", "C4") → MIDI number (C4 = 60).
function noteToMidi(s) {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(s);
  if (!m) return null;
  const pc = PC[m[1].toLowerCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return (Number(m[3]) + 1) * 12 + pc;
}

// Peak-normalize gain for a decoded note: FluidR3 samples sit well below full
// scale (pianos especially), so without this they play far quieter than the
// synth voices at the same `peak`. Returns a multiplier that lifts the loudest
// sample to ~0.95, clamped so a near-silent buffer isn't blown up.
function normGain(buffer) {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
  }
  return peak > 1e-4 ? Math.min(12, 0.95 / peak) : 1;
}

// Decode a "data:audio/mp3;base64,…" URI to an ArrayBuffer.
function dataUriToBytes(uri) {
  const b64 = uri.slice(uri.indexOf(",") + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export class Sampler {
  /**
   * @param {AudioContext} ctx
   * @param {(t:number, dur:number, opts:object)=>GainNode} makeEnv shared envelope
   *   factory: returns a GainNode shaped attack/sustain/release.
   */
  constructor(ctx, makeEnv) {
    this.ctx = ctx;
    this.makeEnv = makeEnv;
    /** @type {Array<{id:string,name:string,file:string}>} */
    this.manifest = [];
    this._byId = null;          // id -> manifest entry (set by loadManifest)
    this._raw = new Map();      // id -> { noteName: dataUri }  (fetched, not yet decoded)
    this._buffers = new Map();  // id -> Map<midi, AudioBuffer>  (decoded)
    this._range = new Map();    // id -> [loMidi, hiMidi]  (sampled span, for octave-folding)
    this._loading = new Map();  // id -> Promise (in-flight decode)
    this._announced = new Set();
  }

  /**
   * Fetch just the manifest (tiny — the list of available instruments). The raw
   * note tables and decode happen lazily per instrument on first use, so a game
   * with no sampled voice selected never downloads the (large) sample data.
   */
  async loadManifest(url) {
    let list;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      list = await res.json();
    } catch (err) {
      console.info("[sampler] no sample manifest — staying on synth voices", err?.message ?? err);
      return;
    }
    this.manifest = Array.isArray(list) ? list : [];
    this._byId = new Map(this.manifest.map((e) => [e.id, e]));
    console.info(`[sampler] manifest: ${this.manifest.length} instruments available (loaded on demand)`);
  }

  /** Available instruments for the UI: [{id, name, kit}] in manifest order. */
  instruments() { return this.manifest.map((e) => ({ id: e.id, name: e.name, kit: !!e.kit })); }

  has(id) { return !!this._byId && this._byId.has(id); }
  isReady(id) { return this._buffers.has(id); }

  // Lazily fetch one instrument's raw note table (cached).
  async _fetchRaw(id) {
    if (this._raw.has(id)) return this._raw.get(id);
    const entry = this._byId?.get(id);
    if (!entry) return null;
    // Resolve relative to this module's URL so the per-note tables load from the
    // dev-server root or a Pages project subpath alike (see loadManifest above).
    const res = await fetch(new URL(`samples/${entry.file}`, import.meta.url), { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status}`);
    const raw = await res.json();
    this._raw.set(id, raw);
    return raw;
  }

  /** Begin (or return) the lazy fetch+decode of one instrument's notes. */
  ensure(id) {
    if (this._buffers.has(id)) return Promise.resolve();
    if (this._loading.has(id)) return this._loading.get(id);
    const t0 = performance.now();
    const p = (async () => {
      let raw;
      try { raw = await this._fetchRaw(id); } catch (err) {
        console.warn(`[sampler] ${id} FAILED to fetch — staying on synth`, err?.message ?? err);
        this._loading.delete(id); return;
      }
      if (!raw) { this._loading.delete(id); return; }
      const map = new Map();
      await Promise.all(Object.entries(raw).map(async ([note, uri]) => {
        const midi = noteToMidi(note);
        if (midi == null) return;
        try {
          const buffer = await this.ctx.decodeAudioData(dataUriToBytes(uri));
          map.set(midi, { buffer, gain: normGain(buffer) });
        } catch { /* skip bad note */ }
      }));
      this._buffers.set(id, map);
      const keys = [...map.keys()];
      if (keys.length) this._range.set(id, [Math.min(...keys), Math.max(...keys)]);
      this._loading.delete(id);
      console.info(`[sampler] ${id} ready: ${map.size} notes, ${(performance.now() - t0) | 0}ms`);
    })();
    this._loading.set(id, p);
    return p;
  }

  // Nearest decoded sample to a target MIDI note.
  _nearest(map, midi) {
    let best = null, bestD = Infinity;
    for (const m of map.keys()) {
      const d = Math.abs(m - midi);
      if (d < bestD) { bestD = d; best = m; }
    }
    return best;
  }

  /**
   * Play `id` at `midi` for `dur` seconds at time `t`, through the shared envelope.
   * Returns false if the instrument isn't decoded yet (caller falls back to synth).
   */
  play(t, id, midi, dur, opts) {
    const map = this._buffers.get(id);
    if (!map || !map.size) { this.ensure(id); return false; } // not ready → kick decode, synth this note
    // Fold notes outside the sampled span into it by octaves, so the nearest
    // sample is never pitch-shifted more than ~6 semitones (above that a sample
    // turns thin/aliased — the "screech"). An occasional octave fold is benign
    // for a background combo; an unbounded upward shift is not.
    const range = this._range.get(id);
    let m = midi;
    if (range) { while (m < range[0]) m += 12; while (m > range[1]) m -= 12; }
    const sampleMidi = this._nearest(map, m);
    const entry = map.get(sampleMidi);
    const src = this.ctx.createBufferSource();
    src.buffer = entry.buffer;
    // Pitch inflection (a horn scoop/fall) rides playbackRate as an EASED curve.
    // Scoop: ease UP into the note from `semis` below and settle (decelerating) —
    // the note START. Fall: hold, then a descending gliss "to nowhere" that
    // accelerates downward and runs on THROUGH the note's release tail, so it
    // trails off and dies instead of landing on a fixed lower pitch — the note END.
    const rate = pitchRatio(m - sampleMidi), bend = opts.bend;
    const pr = src.playbackRate;
    if (bend && bend.kind === "scoop") {
      const st = Math.max(0.03, Math.min(0.1, dur * 0.4));
      pr.setValueCurveAtTime(bendCurve(rate, -bend.semis, 0, EASE_OUT), t, st);
    } else if (bend && bend.kind === "fall") {
      const rel = opts.release ?? 0;
      const hold = Math.max(0, dur - Math.min(0.1, dur * 0.4));   // play straight, then let go
      pr.setValueAtTime(rate, t);
      pr.setValueCurveAtTime(bendCurve(rate, 0, -bend.semis, EASE_IN), t + hold, dur - hold + rel);
    } else pr.value = rate;
    // Fold the per-note normalization into the shared envelope's peak (so the
    // sample lands at the loudness `peak` implies). attack/release ride through in
    // `opts`; the source must keep playing through the release tail.
    const g = this.makeEnv(t, dur, { ...opts, peak: (opts.peak ?? 0.12) * entry.gain });
    const end = t + dur + (opts.release ?? 0) + 0.05;
    this._chain(src, g, t, end, opts);   // wire the optional per-note timbre chain
    src.start(t);
    src.stop(end);
    if (!this._announced.has(id)) { this._announced.add(id); console.info(`[sampler] ${id} now playing from samples`); }
    return true;
  }

  /**
   * Wire the optional per-note timbre chain around an already-pitched source `src`
   * and its envelope gain `g`:
   *   src -> [velocity lowpass] -> [EQ…] -> [tremolo] -> g -> [pan] -> dest
   * plus a parallel saturation SEND and a delayed pitch+amplitude vibrato. Every
   * stage is optional — with none set this is exactly `src -> g -> dest` as before.
   */
  _chain(src, g, t, end, opts) {
    const ctx = this.ctx;
    let head = src;
    if (opts.lpfHz) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = opts.lpfHz; f.Q.value = 0.5;
      head.connect(f); head = f;
    }
    for (const e of opts.eq || []) {
      const f = ctx.createBiquadFilter();
      f.type = e.type; f.frequency.value = e.freq;
      if (e.gain != null) f.gain.value = e.gain;
      if (e.q != null) f.Q.value = e.q;
      head.connect(f); head = f;
    }
    const vib = opts.vibrato;
    // Amplitude tremolo rides a unity gain node (base 1, the LFO sums ±trem on top).
    let tremGain = null;
    if (vib && vib.cents > 0 && vib.trem > 0) {
      tremGain = ctx.createGain(); tremGain.gain.value = 1;
      head.connect(tremGain); head = tremGain;
    }
    head.connect(g);
    let out = g;
    if (opts.pan) {
      const pn = ctx.createStereoPanner();
      pn.pan.value = Math.max(-1, Math.min(1, opts.pan));
      g.connect(pn); out = pn;
    }
    out.connect(opts.dest);
    // Parallel exciter send (post-envelope, so the generated harmonics track the
    // note's level the way a real horn brightens as it's pushed).
    if (opts.satSend && opts.satSend.node && opts.satSend.gain > 0) {
      const s = ctx.createGain(); s.gain.value = opts.satSend.gain;
      out.connect(s).connect(opts.satSend.node);
    }
    // Delayed vibrato: a pitch LFO on src.detune (cents) that fades in after
    // `delay` (a held note settles, then sings), with a matching amplitude tremolo.
    if (vib && vib.cents > 0) {
      const lfo = ctx.createOscillator(); lfo.frequency.value = vib.rate;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(vib.cents, t + (vib.delay ?? 0.25));
      lfo.connect(depth).connect(src.detune);
      lfo.start(t); lfo.stop(end);
      if (tremGain) {
        const tg = ctx.createGain();
        tg.gain.setValueAtTime(0, t);
        tg.gain.linearRampToValueAtTime(vib.trem, t + (vib.delay ?? 0.25));
        lfo.connect(tg).connect(tremGain.gain);
      }
    }
  }

  /**
   * Play a drum kit's `midi` piece as a one-shot at time `t`: no octave folding
   * (each note is a distinct drum, not a pitch), the recorded hit rings out at
   * its native length, and `detune` (cents) adds a touch of per-hit variation.
   * Returns false if the kit isn't decoded yet (caller falls back to synth).
   */
  playDrum(t, id, midi, opts) {
    const map = this._buffers.get(id);
    if (!map || !map.size) { this.ensure(id); return false; }
    const sampleMidi = map.has(midi) ? midi : this._nearest(map, midi);
    const entry = map.get(sampleMidi);
    const src = this.ctx.createBufferSource();
    src.buffer = entry.buffer;
    src.playbackRate.value = pitchRatio(midi - sampleMidi) * centsToRatio(opts.detune ?? 0);
    const dur = entry.buffer.duration;
    const peak = Math.max(0.0001, (opts.peak ?? 0.12) * entry.gain);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
    g.gain.setValueAtTime(peak, t + Math.max(0.002, dur - 0.03));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(g).connect(opts.dest);
    src.start(t);
    src.stop(t + dur + 0.03);
    if (!this._announced.has(id)) { this._announced.add(id); console.info(`[sampler] ${id} now playing from samples`); }
    return true;
  }
}
