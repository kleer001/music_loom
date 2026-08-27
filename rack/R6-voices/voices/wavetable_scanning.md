# Wavetable scanning

Gives the wavetable engine a **modulatable scan position** (`wtPos`) — the morph that
defines modern wavetable leads and bass (the Knife Party "Internet Friends" LFO→position
sweep, the dubstep growl/"talking" bass). It is the one modulation destination from the
patch schema (`docs/design/patch_schema.md`) that needs real DSP rather than a wire.

Two phases: a **procedural scanner first** (no download, no license, ships the `wtPos`
target immediately), then a **build-time CC0 importer** for rich named tables.

## What exists

`cyber/voices.js wavetableWave(ctx, position, warp)` builds **one** `PeriodicWave` from 32
Fourier coefficients, morphing saw→square→formant by `position`, tilted by `warp`. The
`engineVoice` wavetable branch calls it **once per note**, so `wtPos` is frozen at note-on —
there is no live scan. `core/dsp.js fft(re, im)` is available for the importer.

## The constraint that shapes the design

`PeriodicWave` is immutable and is **not an `AudioParam`** — you cannot sweep it with a
control signal. The usual fix (an `AudioWorklet` doing sample-accurate table interpolation)
is **barred**: the offline render path (`node-web-audio-api`) must run the same graph, and
worklets are not dependable there (offline-render is a hard requirement; worklet-only FX are
rejected). So scanning must be built from **ordinary nodes that also render offline**:
oscillators on prebuilt `PeriodicWave`s, `GainNode`s, and `WaveShaperNode`s. PeriodicWave
also **band-limits per playback frequency for free** (the UA renders an appropriately
band-limited wave for the note), which is exactly why it stays the frame primitive — no
per-note anti-aliasing of our own.

## Model

A **wavetable** is an ordered list of **frames**; each frame is a set of harmonic
coefficients (`{real, imag}` Float32Arrays) → one `PeriodicWave`. `wtPos` ∈ [0,1] maps to a
fractional frame index. Position is read two ways at once: a **base** value (the patch's
`wtPos`, sampled at note-on) picks the working neighborhood, and a **modulation** signal
(LFO / env / macro → `wtPos`, from the matrix) morphs continuously around it.

```
wtTable: "basic"        // bank name; default reproduces today's saw→square→formant morph
wtPos:   0.3            // base scan position 0..1 (a MOD_TARGETS destination)
wtWarp:  0              // spectral tilt: >0 darkens, <0 brightens (applied to coefficients)
```

### Phase 1 — two-frame equal-power crossfade (the scanner)

The minimal node graph that gives a *param-driven, offline-safe, band-limited* morph:

1. Resolve `wtTable` → its frame coefficient sets (procedural generator, below).
2. At note-on, `wtPos` selects the bracketing frames `(A, B)` and the fractional blend `p`.
   Build/fetch their two `PeriodicWave`s (cached per `(table, frame)`).
3. Run **two oscillators** (× unison voices), one on `A`, one on `B`, summed through a
   crossfade: equal-power `gainA = cos(p·π/2)`, `gainB = sin(p·π/2)`.
4. **Make the crossfade the `wtPos` mod destination.** A control signal `pos` (a
   `ConstantSource` at the base blend + the matrix's mod sources summed in) drives the two
   crossfade gains through fixed `WaveShaper` curves (the cos / sin quarter-waves) — so an
   LFO, envelope, or macro sweeps the morph live, fully in the signal graph.

This covers the canonical "morph between a dark and a bright timbre" sound — define a table
whose two frames are the endpoints and an LFO→`wtPos` is the growl/sweep. Modulation that
would push `pos` outside the loaded `(A,B)` bracket is **clamped to the bracket** (the
documented Phase-1 limit): the base position picks the neighborhood, modulation morphs
within it.

### Frame generators (procedural, Phase 1)

Each generator returns `N` frames (default `N = 16` — smooth under crossfade without the
fuss of Serum's 256) of `{real, imag}` over `H` harmonics (default 32). `wtWarp` multiplies
coefficient `n` by `n^(−warp)` at build, as today.

- **`basic`** — the current saw→square→formant morph as a frame bank (back-compat default;
  existing `wtPos`/`wtWarp` patches sound unchanged).
- **`harmonic-sweep`** — frame `k` includes harmonics `1..(H·(k+1)/N)`: a saw that opens up
  across the table (the classic "filter-like" scan, but spectral not subtractive).
- **`pwm`** — square with duty cycle swept across frames (the Juno/Reese pulse-width morph;
  pairs with the `pulseWidth` target).
- **`sync`** — a formant peak that climbs in harmonic index across frames (hard-sync-like
  vowel sweep).
- **`fold`** — a sine progressively wavefolded across frames (West-Coast timbre ramp;
  `core/dsp.js foldCurve` is the reference shape).

### Phase 2 — build-time CC0 importer (rich named tables)

Reuse the `mined_preset_stats.json` pattern: vendor **derived coefficient data, never the
raw audio**.

- A script reads a CC0 wavetable WAV (WaveEdit Online banks — CC0 1.0 — are authored as
  coherent multi-frame morph tables; AKWF single cycles — public domain — for one-off osc
  waves), slices it into single-cycle frames, **`fft()`s each frame**, keeps the first `H`
  harmonics, and writes a JSON table:

  ```jsonc
  { "name": "...", "harmonics": 32, "source": "...", "license": "CC0-1.0",
    "frames": [ { "real": [...], "imag": [...] }, ... ] }
  ```

- Tables live in `data/wavetables/`. The raw WAVs are **not** committed (zero-dep,
  license-clean). The scanner consumes procedural and imported tables through the **same**
  frame interface.

## Determinism

Coefficients are fixed data (math or baked FFT); the crossfade is driven by deterministic
LFO/envelope sources or a static macro. Nothing in the wavetable path reads a seed or calls
`Math.random` — so offline renders stay bit-reproducible, except where the patch routes the
(intentionally non-deterministic) sample-and-hold source at `wtPos`, the same known carve-out
as elsewhere in the matrix.

## Beyond Phase 1 (only if a sound demands it)

Full continuous sweep across **all** `N` frames (not just a loaded bracket) is still
worklet-free: a "scan rail" of `N` oscillators, each gated by a triangular window of
`(pos − frameIndex/(N−1))` computed by a per-frame `WaveShaper` on the shared `pos` signal.
It costs `N × unison` oscillators per note, so it is the documented upgrade for a specific
sound, not the default.
