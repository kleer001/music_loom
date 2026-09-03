// Source: cyber_synth/industrial/voices.js
// playback voices that turn analyzed AudioBuffers into music.
//
// Four ways a recording becomes sound, from literal to abstract:
//   • slicer       — chop a loop into N slices and trigger them on the grid (the machine
//                    IS the beat). AudioBufferSourceNode per slice with a start offset.
//   • granular     — clouds of short overlapping windowed grains from a buffer at a
//                    playhead; drones/textures.
//   • oneShotKit   — map corpus one-shots to kick/snare/hat and play them on the grid.
//   • loopEnsemble — layer several loops, each playbackRate-nudged toward a common BPM.
//
// Every voice is fire-and-forget Web Audio: it builds its own nodes at time `t`, connects
// to a passed destination, and starts/stops them — no shared mutable graph. Real-time
// humanization may use Math.random (outside the seeded path; the *analysis* is the
// deterministic part). Envelopes mirror the rest of the project: exponential ramps floor
// at 0.0001 rather than hitting exact 0.

const FLOOR = 0.0001;

/** Short equal-power-ish window gain node, returned for the caller to route a source in. */
function grainEnv(ctx, t, dur, peak = 1) {
  const g = ctx.createGain();
  const a = Math.min(dur * 0.5, Math.max(0.002, dur * 0.2));
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.exponentialRampToValueAtTime(Math.max(FLOOR, peak), t + a);     // fade in
  g.gain.setValueAtTime(Math.max(FLOOR, peak), t + dur - a);             // hold
  g.gain.exponentialRampToValueAtTime(FLOOR, t + dur);                   // fade out
  return g;
}

// ---- slicer ------------------------------------------------------------------

/**
 * Slicer / step-player. Chops `buffer` into slices and triggers one per grid step. If
 * `slicePoints` (seconds, ascending) are given (e.g. from analyze.detectOnsets) they define
 * the slices; otherwise the buffer is divided evenly into `steps` slices. The direct
 * realization of found-rhythm extraction — the washing machine IS the beat.
 *
 * Returns a controller with `trigger(t, step, {gain, rate})` the scheduler calls per step,
 * plus the resolved slice table.
 *
 * @param {BaseAudioContext} ctx
 * @param {AudioBuffer} buffer
 * @param {AudioNode} dest
 * @param {{steps?:number, slicePoints?:number[]}} [opts]
 */
export function slicer(ctx, buffer, dest, { steps = 16, slicePoints = null } = {}) {
  const dur = buffer.duration;
  // Build the slice table: [start, length] pairs in seconds.
  /** @type {{start:number, len:number}[]} */
  let slices;
  if (slicePoints && slicePoints.length) {
    const pts = slicePoints.filter((p) => p >= 0 && p < dur).sort((a, b) => a - b);
    slices = pts.map((p, i) => {
      const next = i + 1 < pts.length ? pts[i + 1] : dur;
      return { start: p, len: Math.max(0.01, next - p) };
    });
  } else {
    const sl = dur / steps;
    slices = Array.from({ length: steps }, (_, i) => ({ start: i * sl, len: sl }));
  }

  return {
    slices,
    /**
     * Play the slice for a grid step. By default step i → slice (i % nSlices), so a 16-step
     * grid walks the loop in order — the machine's own rhythm, re-clocked to the BPM.
     */
    trigger(t, step, { gain = 1, rate = 1, slice = step } = {}) {
      if (!slices.length) return;
      const sl = slices[((slice % slices.length) + slices.length) % slices.length];
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = rate;
      const g = ctx.createGain();
      g.gain.value = Math.max(FLOOR, gain);
      src.connect(g).connect(dest);
      // start at the slice offset, play exactly the slice length (scaled by rate)
      const playLen = sl.len / Math.max(0.01, rate);
      src.start(t, sl.start, sl.len);
      src.stop(t + playLen + 0.01);
    },
  };
}

// ---- granular ----------------------------------------------------------------

/**
 * Granular voice — schedules many short overlapping windowed grains from a buffer around a
 * playhead `position` (0..1 of the buffer), giving drones, beds, smears, time-freeze.
 *
 * `schedule(t, dur)` lays down a cloud spanning `dur` seconds starting at time `t`; the
 * scheduler can call it per step (short clouds) or once for a long pad. Params are mutated
 * live via the setters.
 *
 * @param {BaseAudioContext} ctx
 * @param {AudioBuffer} buffer
 * @param {AudioNode} dest
 * @param {object} [params]
 *   grainSize (s), density (grains/s), spray (s of random read-offset), position (0..1),
 *   pitch (playbackRate), gain.
 */
export function granular(ctx, buffer, dest, params = {}) {
  const p = {
    grainSize: 0.08,
    density: 24,
    spray: 0.05,
    position: 0.3,
    pitch: 1,
    gain: 0.6,
    ...params,
  };
  const out = ctx.createGain();
  out.gain.value = p.gain;
  out.connect(dest);

  function schedule(t, dur) {
    const dens = Math.max(1, p.density);
    const count = Math.max(1, Math.round(dur * dens));
    const bufDur = buffer.duration;
    for (let i = 0; i < count; i++) {
      const gt = t + (i / count) * dur + (Math.random() - 0.5) * (1 / dens); // jittered onset
      // read position = playhead ± spray, clamped to leave room for the grain
      const basePos = p.position * bufDur;
      const sprayOff = (Math.random() * 2 - 1) * p.spray;
      let off = basePos + sprayOff;
      const gsize = Math.max(0.01, p.grainSize);
      off = Math.max(0, Math.min(bufDur - gsize - 0.001, off));
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = Math.max(0.05, p.pitch * (1 + (Math.random() - 0.5) * 0.01));
      const env = grainEnv(ctx, gt, gsize, 1 / Math.sqrt(Math.max(1, dens) / 12));
      src.connect(env).connect(out);
      src.start(gt, off, gsize / src.playbackRate.value + 0.005);
      src.stop(gt + gsize + 0.02);
    }
  }

  return {
    schedule,
    setPosition(v) { p.position = Math.max(0, Math.min(1, v)); },
    setPitch(v) { p.pitch = Math.max(0.05, v); },
    setDensity(v) { p.density = Math.max(1, v); },
    setGrainSize(v) { p.grainSize = Math.max(0.01, v); },
    setSpray(v) { p.spray = Math.max(0, v); },
    output: out,
  };
}

// ---- one-shot kit ------------------------------------------------------------

/**
 * One-shot kit — map corpus one-shot buffers to drum roles and trigger them on a grid, an
 * 808 made of metal and steam. `kit` is { kick, snare, hat } AudioBuffers; extra
 * named buffers can be passed for round-robin variety per role.
 *
 * @param {BaseAudioContext} ctx
 * @param {{kick:AudioBuffer, snare:AudioBuffer, hat:AudioBuffer}} kit
 * @param {AudioNode} dest
 */
export function oneShotKit(ctx, kit, dest) {
  function hit(t, role, vel = 1, rate = 1) {
    const buffer = kit[role];
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    // a hair of pitch humanization so repeated hits aren't bit-identical
    src.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 0.02);
    const g = ctx.createGain();
    g.gain.value = Math.max(FLOOR, vel);
    src.connect(g).connect(dest);
    src.start(t);
    src.stop(t + buffer.duration / src.playbackRate.value + 0.02);
  }
  return {
    hit,
    kick: (t, v = 1) => hit(t, "kick", v),
    snare: (t, v = 1) => hit(t, "snare", v),
    hat: (t, v = 1) => hit(t, "hat", v, 1.4),
  };
}

// ---- loop ensemble -----------------------------------------------------------

/**
 * Loop ensemble — play several loops layered, each `playbackRate`-adjusted toward a common
 * target BPM. Each layer needs its *native* BPM (from analyze.estimateTempo); the
 * ratio targetBpm/nativeBpm sets playbackRate.
 *
 * NOTE — time-stretch side effect: adjusting playbackRate stretches time AND shifts pitch
 * together (a resampling, not a phase-vocoder). A true tempo-lock that preserves pitch
 * needs a WASM stretch lib (Rubber Band / Signalsmith), which is out of scope
 * here; playbackRate is the honest zero-dependency Web-Audio approach and is musically fine
 * for machine loops (a motor pitched up is still a motor).
 *
 * @param {BaseAudioContext} ctx
 * @param {{buffer:AudioBuffer, nativeBpm:number, gain?:number}[]} layers
 * @param {AudioNode} dest
 * @param {{targetBpm?:number}} [opts]
 */
export function loopEnsemble(ctx, layers, dest, { targetBpm = 128, makeShifter = null } = {}) {
  const sources = [];
  let target = targetBpm;
  const pitchLock = !!makeShifter; // preserve pitch while resampling for tempo lock

  function rateFor(nativeBpm) {
    if (!(nativeBpm > 0)) return 1;
    let r = target / nativeBpm;
    // keep the resample within ±1 octave so a wildly-off native estimate stays musical
    while (r > 2) r /= 2;
    while (r < 0.5) r *= 2;
    return r;
  }

  function start(t = ctx.currentTime + 0.05) {
    stop();
    for (const layer of layers) {
      const src = ctx.createBufferSource();
      src.buffer = layer.buffer;
      src.loop = true;
      const rate = rateFor(layer.nativeBpm);
      src.playbackRate.value = rate;
      const g = ctx.createGain();
      g.gain.value = layer.gain ?? 0.6;
      // Pitch-preserving time-stretch: resampling by `rate` locks the tempo but moves the
      // pitch by the same factor; a phase-vocoder shift by the INVERSE ratio
      // (pitchLockSemitones) cancels it, so the loop keeps its key while it follows the
      // bar. Without makeShifter we fall back to plain varispeed (tempo+pitch coupled).
      let shifter = null;
      if (pitchLock) {
        shifter = makeShifter(ctx, { semitones: pitchLockSemitones(rate) });
        src.connect(shifter.input);
        shifter.output.connect(g).connect(dest);
      } else {
        src.connect(g).connect(dest);
      }
      src.start(t);
      sources.push({ src, g, layer, shifter });
    }
  }

  function stop(t = ctx.currentTime) {
    for (const s of sources) {
      try { s.src.stop(t); } catch (_) {}
      if (s.shifter) { try { s.shifter.dispose(); } catch (_) {} }
    }
    sources.length = 0;
  }

  function setTargetBpm(bpm) {
    target = bpm;
    for (const s of sources) {
      const rate = rateFor(s.layer.nativeBpm);
      s.src.playbackRate.setTargetAtTime(rate, ctx.currentTime, 0.1);
      if (s.shifter) s.shifter.setSemitones(pitchLockSemitones(rate)); // re-compensate pitch
    }
  }

  function setGain(i, v) {
    if (sources[i]) sources[i].g.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
  }

  return { start, stop, setTargetBpm, setGain, get pitchLocked() { return pitchLock; }, get sources() { return sources; } };
}

// Semitones a phase vocoder must apply to undo the pitch change from resampling at
// `playbackRate` (so a tempo-locked loop keeps its original key). rate 2 → -12 st.
export function pitchLockSemitones(rate) {
  return rate > 0 ? -12 * Math.log2(rate) : 0;
}

// ---- C2: sample-mangling verbs (Strudel chop / slice / loopAt) -----------------
// The slicer above already CHOPS a buffer into N slices and plays slice i at step i. These pure
// helpers add the re-sequencing + time-fit verbs on top, so a found-rhythm loop can be re-cut
// from a pattern. Drive the slicer with: slicer.trigger(t, step, { slice: seq[step % seq.length] }).

// slice(n, seq): parse a slice sequence ("0 1 2 ~ 3", "~"/"." = rest) → a flat array of slice
// indices (null = rest). The caller chops into n slices and plays seq[step] each step. Pure.
export function sliceSeq(seq) {
  if (Array.isArray(seq)) return seq.slice();
  const out = [];
  for (const tok of String(seq).trim().split(/\s+/)) {
    if (tok === "~" || tok === "." || tok === "") out.push(null);
    else if (/^\d+$/.test(tok)) out.push(+tok);
  }
  return out;
}

// loopAt(bars): the playback `rate` that fits a buffer of `bufSec` into `bars` 4/4 bars at `bpm`
// (rate > 1 = play faster/shorter). Pair with pitchLockSemitones(rate) to keep the key. Pure.
export function loopAtRate(bufSec, bars, bpm) {
  const targetSec = Math.max(1e-6, bars) * 4 * (60 / Math.max(1, bpm));
  return bufSec > 0 ? bufSec / targetSec : 1;
}
