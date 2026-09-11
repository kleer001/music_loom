# Seamless looping — technique digest

Turning finite audio — recorded or synthesized — into a file that loops with no
audible seam. The crux of the deliverable: statistics-matching produces endless,
non-repeating noise but **not a closed loop**, so a distinct loop-closing step is
required. Two families: **(A) find + join** a loop point in existing audio, and
**(B) synthesize on a torus** so the material is seamless by construction. A third
practitioner move — **layering incommensurable-length loops** — makes the composite
period effectively endless.

Source: PyMusicLooper & LoopAuditioneer (open-source loop finders); Välimäki, Rämö
& Esqueda, *Creating Endless Sounds* (DAFx-18); the RIFF `smpl` chunk spec; Eno's
*Music for Airports* (1978). **PyMusicLooper (source), Välimäki (DAFx-18 PDF), and
the `smpl` chunk (this repo's own reader and writer) are verified — read
2026-09-11** ([`BLOCKED.md`](BLOCKED.md)). All PyMusicLooper constants held; the
`smpl` frames-vs-bytes conflict is settled (**frames**), and a live off-by-one
against the inclusive convention was found in this repo's writer (§5).
LoopAuditioneer's knobs and Eno's loop lengths are **not yet primary-verified**.

## 1. The numbers — finding a loop point

A seamless loop needs the audio *around* the end to match the audio *around* the
start. Similarity is **sum-of-squared-differences** (minimize) or **cross-
correlation** (maximize) over a window bracketing the two candidate points.

**PyMusicLooper** (arkrow, open source) — the most legible concrete algorithm,
built on librosa. *(All constants verified 2026-09-11 against `analysis.py`.)*
- **Chroma** for harmonic match + **perceptually-weighted power in dB** (`power_db`)
  for loudness match.
- Acceptance thresholds: note L2 distance **`ACCEPTABLE_NOTE_DEVIATION = 0.0875`**;
  **`ACCEPTABLE_LOUDNESS_DIFFERENCE = 0.5`** dB *(the source comment: "values higher
  than ~0.5 have a perceptible difference in loudness")*. Both are hand-tuned "magic
  constants … found through trial and error."
- Scoring: **cosine similarity** of the candidate regions over a **12-beat** test
  offset (`num_test_beats = 12`), weighted toward the boundary.
- **Minimum loop duration default 0.35 × track length** (`min_duration_multiplier`);
  candidate pruning triggers at **≥100** candidates and keeps the top **75th
  percentile by note distance** (`keep_top_notes = 75`), **50th by loudness**
  (`keep_top_loudness = 50`).
- Beat grid from `beat_track` **∪** `plp` (their union) so endpoints snap to beats.

**LoopAuditioneer** (Lars Palo / GrandOrgue, GPL) — correlation-based search with
exposed knobs: **quality** (correlation-error tolerance), **derivative threshold**
(candidate count), **loop pool multiple**, **minimum loop length**, **distance
between loops**; results sorted best-correlation-first.

**Zero-crossing alignment** (snap both points to upward zero crossings of matching
slope) is the cheap classical anti-click guard — necessary but **not sufficient**
for texture, where spectral/amplitude match matters more than a one-sample
discontinuity.

For **non-beat ambient** material there is no authoritative fixed-ms correlation-
window number; PyMusicLooper's window is beat-relative. A concrete ms window is an
open gap (→ Gaps).

## 2. The mechanism — joining the seam (crossfade)

Overlap the tail onto the head and crossfade. The math distinction is load-bearing:

- **Equal-gain / linear:** `gA + gB = 1`; midpoint both 0.5. For **uncorrelated**
  material the *powers* add, so two half-amplitude signals sum to only **−3 dB** →
  an audible **mid-dip**. Correct only for **correlated/identical, phase-aligned**
  material.
- **Equal-power / constant-power:** `gA = cos(t·π/2)`, `gB = sin(t·π/2)`, so
  **`gA²+gB² = 1`** everywhere; midpoint **0.707 (−3.01 dB)**. Keeps summed *power*
  (perceived loudness) constant for **decorrelated** signals — the right choice for
  texture/field-recording seams. On correlated material it peaks +3 dB and can
  phase-cancel.

**Rule:** decorrelated/texture → equal-power; correlated/identical copy →
equal-gain.

**Crossfade length** (practitioner consensus, *not* a measured primary — a Gap):
**20–50 ms** for rhythmic/music material; **~500 ms–2 s** for field-recording /
atmosphere beds. Longer fades hide a worse spectral match but blur transients — for
a stationary bed usually worth it. **Measure this in-bench** against the repo's own
material rather than trusting the blog figures.

## 3. Synthesizing on a torus (inherently seamless)

The clean, on-axis, pure-DSP answer. **Välimäki, Rämö & Esqueda, "Creating Endless
Sounds," DAFx-18** (open access, aaltodoc; reimplementation
`softcat477/Creating-Endless-Sound`). Three ways to extend a stationary excerpt:

1. **High-order LP:** fit all-pole coefficients to ~1 s of source, excite with white
   noise. *(verified 2026-09-11: the **paper itself** shows orders **100 / 1000 /
   10000** in Fig. 2 — order 100 is too coarse, and "a fairly high LP order" is
   needed; realism arrives by 1000. The timing comparison "used an LP filter of
   order 1000," so **1000 is the paper's working figure.**)*
2. **Velvet-noise** real-time variant (sparse ±1 convolution).
3. **IFFT random-phase — the seamless-loop method:** take the excerpt's FFT (zero-
   padded to output length N), **keep the magnitude spectrum, replace the phase with
   uniformly distributed random values between −π and π**, IFFT. *(verified
   2026-09-11, verbatim: "θr is a randomized phase with values between −π and π";
   the segment "can be repeated by concatenating copies of itself without the need
   of windowing or crossfading" because the operation "is circular, and is therefore
   also called circular convolution." Worked example: a **4000-sample** piano segment,
   **IFFT length N = 4096**, with **N set equal to the zero-padded signal length.**)*
   The buffer satisfies **circular boundary conditions**, so its end joins its start
   with no seam — the "torus": a finite buffer periodic by construction, playable on
   one loop node.

**Circular boundary conditions** are the general principle (also framed in
Schlecht's "Endless Sounds and Circular Convolution," and in ML loopable-generation
like LoopGen, cited only for the framing — ML is out of scope).

**Applying it to McDermott–Simoncelli:** the baseline statistics-matching algorithm
produces a **fixed-length excerpt (~5–7 s), not a loop** — temporal homogeneity
makes it *sound* endless without closing on itself. To make it a seamless loop,
either **impose the statistics on a circular buffer** or **post-process with the
IFFT random-phase trick**. This is the "distinct loop-closing step" the studio
brief anticipated.

**Granular clouds wrapping the boundary** (Roads' "Clouds"; Bencina, "Implementing
Real-Time Granular Synthesis," 2001): schedule grains on a **seeded periodic
schedule of period = loop length**; any grain whose onset falls near the loop end
**wraps** its tail to the start (read positions and schedule both taken **modulo the
loop length**). Grain envelopes (Hann/Tukey) stop individual clicks; the *periodic
schedule* closes the loop. This is a persistent-graph pattern, aligned with the
CLAUDE.md scheduling note. No single source gives a turnkey seamless-loop grain
scheduler — candidate original work (→ Gaps).

## 4. The composite — incommensurable lengths (the strongest practitioner idea)

Layer several loops of deliberately **different, mutually-prime-ish lengths** so
their realignment period is their LCM — effectively never within a session.

**Brian Eno, *Ambient 1: Music for Airports* (1978)**, his own words: one loop
repeats every **23.5 s**, the next **≈25.875 s**, a third **≈29.9375 s** —
"incommensurable … not likely to come back into sync again." myNoise's stated
**188,027,101-year** Waterfall repeat is the same idea at scale (coprime loop
lengths, phases realigning only at the LCM).

For a **bounced file:** set render length to the LCM (or a long round number) so
each layer's own loop lands exactly on the file boundary — each layer seam-clean
individually (via §1–3), the composite non-repeating until the LCM. This sits
directly on `core/rng.js`'s independent-stream-per-layer model.

**Practitioner seam-avoidance for beds:** join in a region of similar amplitude and
texture; **remove protruding events** from the looped bed (a bird call, a car pass
make repetition obvious) and layer standout one-shots separately, non-looped — which
is exactly the bed/event split of this whole digest. Ambient loop libraries ship
Full + Layer A/B/C stems for this reason.

## 5. The RIFF `smpl` chunk (the file-level loop record)

The chunk the pantry authoring path already writes. Header then `cSampleLoops` ×
24-byte SampleLoop records; all multi-byte fields **32-bit little-endian**:

```
smpl header: ckID 'smpl', ckSize, dwManufacturer, dwProduct,
  dwSamplePeriod (ns/sample = 1/Fs; 44100 Hz → 22675),
  dwMIDIUnityNote, dwMIDIPitchFraction, dwSMPTEFormat, dwSMPTEOffset,
  cSampleLoops, cbSamplerData
SampleLoop: dwIdentifier, dwType (0=fwd,1=alt,2=bwd), dwStart, dwEnd,
  dwFraction (0x80000000 = half a sample), dwPlayCount (0 = infinite)
```

**`dwStart`/`dwEnd` are in SAMPLE FRAMES, not bytes — settled 2026-09-11.** The
widely-copied teragonaudio page says "byte offset," but the canonical RIFF/SoundFont
wording and every real sampler (libsndfile `SF_INSTRUMENT`, SoundFont) treat them as
**sample-frame indices**, and **this repo's own reader and writer agree**:
`loopfind.py` packs `loop_start`/`loop_end` straight into the record, and
`loop_qa.py` reads them back and slices the sample array `sig[start:end]` by frame
index. So the byte reading is simply wrong. (The files are **16-bit mono**, where
frame index = sample index; a future stereo path would be off by 4× under a byte
reading, so the point still matters.)

**The live off-by-one — `dwEnd` is emitted EXCLUSIVE here.** `loopfind.py` writes a
two-tile buffer and calls `write_wav_with_loop(..., len(loop), 2*len(loop), …)`, so
`dwEnd = 2*len(loop) = len(out)` — **one past the last sample**. The repo's own
reader matches (`sig[start:end]` is end-exclusive), so it round-trips itself
correctly. But the RIFF/SoundFont convention is `dwEnd` = the **last sample of the
loop (inclusive)**. A conformant external sampler reading these files would take
`dwEnd` as a valid index and read one sample past the buffer, or clamp — an
off-by-one at the wrap. Harmless inside this repo, a real interop bug the moment
these WAVs are loaded by a standard sampler. Fix: write `dwEnd = 2*len(loop) − 1`.
Other fields as written: `dwType = 0` (forward), `dwPlayCount = 0` (infinite),
`dwFraction = 0` (no sub-sample precision). Players: play `0…dwEnd`, then repeat
`dwStart…dwEnd` (`dwPlayCount` times or forever).

## Gaps

**Resolved 2026-09-11:** the `smpl` units (**sample-frames**, and the repo emits
`dwEnd` exclusive — a real off-by-one against the inclusive convention, §5);
McDermott's synthesis budget (**60 iterations, 30 dB/class, 20 dB avg** — see
[`bed_synthesis.md`](bed_synthesis.md); there is **no** official circular/looping
variant, the IFFT trick is the add-on); and the "Creating Endless Sounds" numbers
(**LP order 1000; IFFT length N = 4096 = zero-padded segment length**).

Still open:

1. **Correlation-window size for non-beat ambient** loop-finding — no authoritative
   ms figure; PyMusicLooper's window is beat-relative (12 beats). Set in-bench.
2. **Equal-power crossfade length for texture** — the 20–50 ms / 500 ms–2 s figures
   are practitioner blogs, not measured. Measure in-bench.
3. **Turnkey seamless-loop grain scheduler** — synthesized here from Bencina/Roads
   primitives; no single source. Candidate original DSP work.
4. **The endless-vs-finite tension for the event layer** — Poisson never repeats,
   the deliverable is a finite loop. Candidate resolutions: loop the bed seamlessly
   while the event layer's period exceeds perception; or close the loop in
   **statistic-space** rather than waveform (see [`stereo_field.md`](stereo_field.md)
   §4). An engineering decision to prototype and measure.
