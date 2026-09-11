# sound_feel — the survey

Reproducing the sonic quality of an ambient **field recording** — a busy mall, a
school corridor, footsteps and shouts and laughter — and generating it endlessly.
A tribute in **spirit** to Stéphane Pigeon's myNoise: layered loops under
per-band sliders, "never repeats." Built as **original** offline DSP tools on the
house stack that emit seamless **stereo** loop files. No neural / ML — out of
scope by decision, not by accident.

## Answer first

A field recording is not one signal to clone; it is **two signals that need
different mathematics, plus a third problem that is neither.**

1. **The stationary bed** — crowd murmur, HVAC rumble, room tone, distant hubbub.
   This is *texture*: statistically uniform over moderate timescales, no event you
   would point at. Reproduced by **matching auditory summary statistics**
   (McDermott–Simoncelli) and re-synthesizing from noise. → [`bed_synthesis.md`](bed_synthesis.md)
2. **The discrete events** — footsteps, shouts, laughs, door slams, a dropped tray.
   Sparse, individually recognizable *impacts*. The stationary model **smears these
   into mush**; they must be handled separately — **extracted** from the recording
   (onset detection → a labeled grain corpus) and **recirculated** by a stochastic
   scheduler so the class distribution returns forever without literal repetition.
   → [`event_layer.md`](event_layer.md)
3. **Seamless looping** — the crux of "a *pile of loop files*." Statistical texture
   synthesis produces endless non-repeating noise but **not a closed loop**; a
   distinct loop-closing step is required. → [`seamless_looping.md`](seamless_looping.md)

On top of all three sits **stereo, and the fact that the mic was moving** —
recorded by walking through the space, which breaks the stationarity the bed model
assumes. → [`stereo_field.md`](stereo_field.md)

The reference we are paying tribute to, documented from its creator's own public
words, with an explicit borrow-nothing boundary. → [`mynoise_reference.md`](mynoise_reference.md)

This maps onto the agreed build order: **A** (bed) → **B** (events) → **C** (the
combined slider instrument). A and C's looping live in `seamless_looping.md`; B in
`event_layer.md`; the stereo/moving-field treatment threads through all of them.

## The five axes

| File | Reproduces | Core method | Where it fails |
|---|---|---|---|
| [`bed_synthesis.md`](bed_synthesis.md) | the stationary bed | McDermott–Simoncelli auditory statistics; two-stage spectral; scattering moments; LPC/granular fallbacks | smears transients, pitch, rhythm — anything non-stationary |
| [`event_layer.md`](event_layer.md) | discrete events, forever | onset detection → concatenative corpus → filtered-Poisson scheduling | pure Poisson under-clusters real crowds; per-hit scheduling cost |
| [`seamless_looping.md`](seamless_looping.md) | a finite file that loops | circular-convolution (random-phase IFFT) "torus"; loop-point search + equal-power crossfade | Poisson event layer *cannot* be both endless and a finite loop — an open decision |
| [`stereo_field.md`](stereo_field.md) | width, and the walk | independent-RNG / velvet-noise decorrelation; locally-stationary windows; statistic-space trajectory | naïve stat interpolation can break covariance validity; mono fold-down of wrong decorrelators |
| [`mynoise_reference.md`](mynoise_reference.md) | the tribute's north star | 10 frequency-ordered layers; coprime loop lengths; pink calibration | (reference, not a build) |

## Method, and the verification pass

Five research workers ran in parallel, one per axis, each instructed to chase
**primary** sources, extract falsifiable parameters, triangulate, and log every
unreachable URL. `RESEARCH.md` asks for a fan-out on a genuine research question;
this was one.

The digest was first written **search-attested** — every number extracted from
search-engine summaries, because an egress block kept the primaries unopened. That
is the `RESEARCH.md` fabrication hazard: a plausible number with no traced origin
behaves like a measured one until someone checks. So every load-bearing figure was
marked, and [`BLOCKED.md`](BLOCKED.md) was written as the capture queue.

**On 2026-09-11 the primaries were opened and the queue was worked.** The
load-bearing figures are now verified against the source text — and the check earned
its keep, because several search-attested numbers were **wrong**:

- **McDermott–Simoncelli:** the coefficient total is **1515** exactly (not "several
  thousand"); the modulation bank is **20** filters (resolving the 20-vs-19 conflict);
  the cochlear centres span **52–8844 Hz** (not the guessed 20 Hz–10 kHz); "half-octave"
  was never in the paper; kurtosis **is** in the marginal set; synthesis runs **60
  iterations / 20 dB avg SNR**.
- **Bello (2005):** the tutorial's best detector was **negative log-likelihood / HFC**,
  not the complex domain; Bello fixes **no** FFT/hop/window numbers.
- **`smpl` chunk:** start/end are **sample-frames, not bytes** — and this repo's own
  writer emits `dwEnd` **exclusive**, a live off-by-one against the inclusive
  convention (see [`seamless_looping.md`](seamless_looping.md) §5).
- **myNoise:** three of four anchors confirmed verbatim; the **188,027,101-year figure
  was on none of the fetched pages** — unconfirmed, not faq/blog as attested.

What is **still** unverified is unverifiable by fetching: Kendall (1995) is paywalled,
several figures are **in-bench measurements** by design, and three items are candidate
**original DSP work**. [`BLOCKED.md`](BLOCKED.md) now records which is which.

## Cross-cutting findings

These surfaced in more than one axis and shape the whole instrument.

- **Bed and events are different problems.** McDermott–Simoncelli *defines* a
  texture by stationarity and captures it with time-averaged statistics; by
  construction it averages transient events away. Confirmed in the paper's own
  discussion (pitched tones, reverberation, rhythm are lost) and every follow-up.
  The mall's murmur is what it does well; the footsteps are what it destroys. The
  two-layer split is therefore forced, not stylistic.

- **Seamless looping is a separate, under-documented step.** The clean, on-axis,
  pure-DSP solution is **synthesizing on a torus**: Välimäki, Rämö & Esqueda,
  *Creating Endless Sounds* (DAFx-18) keep a segment's magnitude spectrum, replace
  its phase with uniform random values, and IFFT — because fast convolution is
  **circular**, the result "can be repeated by concatenating copies of itself
  without windowing or crossfading." For splicing recorded material instead, the
  rule is **equal-power crossfade for decorrelated/texture seams** (`gA²+gB²=1`),
  equal-gain only for phase-locked copies.

- **The moving mic reframes both stationarity and looping.** Averaging McDermott
  stats over a whole walk yields a blurred chimera of every room at once. The fix
  is **locally-stationary windows** (~2–5 s, matching the ear's adaptive averaging
  window per McWalter & McDermott 2018) → a **trajectory through statistic-space**.
  This makes a seam a matter of **statistic continuity**, not waveform splicing:
  build a closed loop S₁→…→Sₙ→S₁ and interpolate the target statistics between
  neighbours (optimal-transport / Gaussian-barycenter interpolation keeps the
  covariance matrices valid where naïve lerp does not). The workers found the
  visual/video OT-texture-mixing literature and the *neural* audio-morph
  literature but **no published pure-DSP OT-on-McDermott-stats audio morpher** —
  a genuine open niche this studio could claim. Flagged as a gap, not a fact.

- **Non-repetition is the incommensurable-length trick, and it is old.** Brian Eno's
  *Music for Airports* (1978) layered tape loops of ~23.5 s, ~25.875 s, ~29.9375 s
  — "not likely to come back into sync again." myNoise's stated 188,027,101-year
  Waterfall repeat is the same idea at scale: several coprime-length loops whose
  phases realign only at their LCM. For a **bounced file**, render length = the LCM
  (or a long round number) so every layer's own loop lands exactly on the file
  boundary. This sits directly on `core/rng.js`'s independent-stream-per-layer model.

- **The per-hit scheduling trap is real here.** An endless event scheduler is
  exactly the CLAUDE.md ~36×-by-five-minutes case. The fix from game-audio and
  Web Audio practice: a **fixed voice pool with steal-oldest**, pooled gain/pan/bus
  downstream; only the `AudioBufferSourceNode` itself is unavoidably per-event
  (single-use, never freed early). When events are dense, precompute a bar/window
  buffer looped by one node instead — the CLAUDE.md "flat" case.

- **Stereo width can be free and mono-safe.** Generating the two channels of a
  stochastic bed from **independent RNG streams** (not one stream copied) gives
  genuine decorrelation that sums to stable mono (uncorrelated signals add in
  power, no comb notches). That is the same `core/rng.js` discipline that already
  buys byte-identical renders. Single-source *events* must instead be placed by
  panning (−4.5 dB mono-safe default), never independent-noise'd.

## Map against the house stack

- **Bed and events synthesize as a persistent Web Audio graph** with seeded,
  retriggered envelopes — the flat-cost pattern, not per-hit allocation.
- **Offline render + measure** through `node-web-audio-api` / `OfflineAudioContext`,
  with `rack/R3-measure` scoring the results. Several claimed numbers here
  (crossfade length for texture, mono fold-down of each decorrelator) are things
  the sources give only as blog consensus; they are **in-bench measurements**, not
  citations, and should be generated here rather than trusted.
- **Anything whose job is to agree** across the two runtimes — a texture-statistic
  extractor, an envelope follower, an onset detector — belongs in a worklet or
  pure JS, per the CLAUDE.md native-node divergence note.
- **WAV `smpl` chunk** loop points already exist in the pantry authoring path;
  `seamless_looping.md` records a silent-bug hazard there (sample-frames vs bytes).
- **The user's recordings** land in `pantry/` with `PROVENANCE.md` rows. They are
  the user's own, so the licence question is trivial — but they still get accounted.

## Where the gaps are

Each file ends with its own Gaps section. After the 2026-09-11 verification pass, the
parameters that once "lived in the unopened PDFs" are read off the primaries:
McDermott's coefficient breakdown (**1515**) and synthesis budget (**60 iterations,
20 dB**), Bello's constants (they are free variables, not fixed), CataRT's descriptors
(f0/aperiodicity/loudness + 230 MPEG-7), Välimäki's LP order (**1000**) and FFT length
(**N = 4096**), the velvet-noise transparent length (**30 ms**). The former conflicts
are settled: coefficient count **1515** (not "several thousand"), modulation-filter
count **20** (the 2011 original; 19 is the later McWalter–Dau variant), and `smpl`
start/end in **sample-frames** (not bytes).

What remains is unverifiable by fetching, and is now labelled as such in each file:
**paywalled** (Kendall 1995), **in-bench measurements** (crossfade length for texture,
mono fold-down of each decorrelator, correlation-window for non-beat ambient), and
candidate **original DSP work** — OT interpolation of auditory statistics for audio,
a turnkey seamless-loop grain scheduler, and reconciling endless-Poisson events with a
finite loop file. One quote stayed unconfirmed: myNoise's 188,027,101-year figure was
on none of the fetched pages.

## The tribute boundary

Freely re-implementable (general, non-protectable design): N frequency-ordered
recorded layers mixed like a desk; coprime loop lengths for non-repetition; slow
seeded random-walk of layer gains ("animate"); per-user hearing/equipment
calibration to a perceptually even (pink) baseline; starting from real field
recordings. **Avoid entirely:** his audio, his code, his soundscape designs and
names/branding, his UI and calibration copy, and any implication of affiliation.
Detail in [`mynoise_reference.md`](mynoise_reference.md).

## Sources

Attached to each claim in the per-axis files, and collected as a verification
queue in [`BLOCKED.md`](BLOCKED.md). Because nothing was read directly, treat the
per-axis inline URLs as *where the claim was attested*, and `BLOCKED.md` as *what
to open to confirm it*.
