# The capture queue — worked 2026-09-11

This file was written because the `sound_feel` digest was first sourced by
search-engine **extraction only**: an egress block kept every primary PDF and page
unopened, so every number was *search-attested*, not *verified*.

**On 2026-09-11 the block was lifted and this queue was worked.** The primaries were
opened and read; the load-bearing figures are now verified against the source text,
and the corrections are folded into the per-axis files (each carries a
`verified 2026-09-11` mark next to the figure). This file is now the **log** of that
pass: what confirmed, what was wrong, and what remains genuinely unreachable.

The residue is unverifiable by fetching, and is labelled so below: **PAYWALL** (needs
institutional access), **IN-BENCH** (a number this studio must measure, never cite),
**ORIGINAL** (candidate original DSP work, nothing to confirm), and **NOT-FETCHED**
(a lower-priority secondary not yet opened).

## Priority 1 — load-bearing parameters — VERIFIED

- **VERIFIED — McDermott & Simoncelli 2011**, *Neuron* 71(5):926–940. Read the author
  PDF (mcdermottlab.mit.edu) and the supplementary (cns.nyu.edu). Confirmed and, where
  needed, corrected in [`bed_synthesis.md`](bed_synthesis.md):
  - Coefficient total = **1515** (128 marginal + 189 cross-band + 640 modulation-power
    + 366 C1 + 192 C2). The "several thousand" was wrong.
  - Cochlear bank = **30 bandpass, ERBN, 52–8844 Hz**, + lowpass/highpass ends = **32
    subbands** (the guessed 20 Hz–10 kHz range was wrong).
  - Envelopes downsampled to **400 Hz**; compression exponent **0.3**.
  - Modulation bank = **20 constant-Q filters, 0.5–200 Hz** (resolves 20-vs-19: the
    2011 original is 20). C1/C2 use **7 octave-spaced filters, 1.5625–100 Hz**.
    "Half-octave" never appears in the paper.
  - Cochlear marginals = **first four normalized moments** — kurtosis **is** included.
  - Synthesis: Gaussian-noise start, **60 iterations max, 30 dB/class, 20 dB avg = converged**.
  - **Dropped:** the "16-bit" excerpt figure — not stated (only a 24-bit playback D/A).
- **VERIFIED — Bello et al. 2005**, onset-detection tutorial, *IEEE TSAP* 13(5). Read
  the Rochester PDF. Corrected in [`event_layer.md`](event_layer.md): best detector in
  the comparison was **negative log-likelihood (90.6%) / HFC (90%)**, not the complex
  domain; **44.1 kHz mono**, 1065 onsets; FFT/hop/window are **free variables** (no
  fixed numbers); peak-pick = **moving-median adaptive threshold**, ~100 ms smoothing,
  δ/λ tuned per detector (no universal constants).
- **VERIFIED — Välimäki, Rämö & Esqueda, "Creating Endless Sounds," DAFx-18.** Read the
  Aalto PDF. In [`seamless_looping.md`](seamless_looping.md): LP orders 100/1k/10k,
  **working order 1000**; IFFT **N = 4096** (= zero-padded segment length); random phase
  **uniform in [−π, π]**; verbatim — the segment "can be repeated by concatenating copies
  of itself without the need of windowing or crossfading" (circular convolution).
- **VERIFIED — PyMusicLooper** (source read). All constants held in
  [`seamless_looping.md`](seamless_looping.md): `ACCEPTABLE_NOTE_DEVIATION = 0.0875`,
  `ACCEPTABLE_LOUDNESS_DIFFERENCE = 0.5` dB, `min_duration_multiplier = 0.35`,
  `num_test_beats = 12`, prune at ≥100, `keep_top_notes = 75` / `keep_top_loudness = 50`,
  cosine-similarity scoring, `beat_track ∪ plp` grid.
- **VERIFIED — the `smpl` chunk**, against this repo's own reader (`loop_qa.py`) and
  writer (`loopfind.py`). Start/end are **sample-frames, not bytes** (the teragonaudio
  "bytes" page is wrong). **Live off-by-one found:** the writer emits `dwEnd` **exclusive**
  (`2*len(loop)`), a mismatch to the RIFF/SoundFont inclusive convention — harmless
  in-repo, an interop bug for a standard sampler. Detail in
  [`seamless_looping.md`](seamless_looping.md) §5.
- **VERIFIED (framing) — Circular boundary conditions.** The Välimäki paper states the
  circular-convolution seam property directly; Schlecht's blog is the same framing and
  was not separately needed.
- **NOT-FETCHED — LoopAuditioneer** knobs (GrandOrgue). Lower priority; the concrete
  loop-finder constants this studio needs are already covered by PyMusicLooper.

## Priority 2 — method detail

- **VERIFIED — CataRT, DAFx-06.** Read the DAFx PDF. Descriptors = in-patch
  **f0 / aperiodicity / loudness** plus up to **230 imported MPEG-7** descriptors
  ([`event_layer.md`](event_layer.md)). The per-descriptor selection-distance weighting
  is still not extracted.
- **PARTIAL — Maruyama, Okada & Motoyoshi 2023**, *i-Perception* (open access). Read the
  PMC page: the two-stage **structure** is confirmed (a 1-D waveform amplitude spectrum
  + a **2-D subband-envelope spectrum, Ft × frequency**), but the exact FFT sizes and
  subband count did not extract cleanly. ([`bed_synthesis.md`](bed_synthesis.md) §3.)
- **NOT-FETCHED** — Schwarz, "Corpus-Based Concatenative Synthesis," *IEEE SP Mag* 24(2)
  (paywalled; try the IRCAM preprint); Schwarz, "State of the Art in Sound Texture
  Synthesis," DAFx-2011; Böck, "Onset Detection Revisited," DAFx-06; Rosão peak-picking,
  ISMIR 2012; Bruna & Mallat scattering moments, arXiv:1311.0407 (Q/T/coefficient count
  still open); Andén & Lostanlen, time-frequency scattering, DAFx 2019; Bencina granular
  (2001); Roads, *Microsound* (2001); the texture-stats toolboxes. These support framing
  already well-attested elsewhere; open them only if a specific constant is needed.

## Priority 3 — stereo, decorrelation, non-stationarity

- **VERIFIED — Velvet-Noise Decorrelator, DAFx-2017.** Read the DAFx-17 PDF. Density
  **1000 impulses/s**, filter length **1024 samples**, transparent length **30 ms**
  (1323 samples @ 44.1 kHz), **"87% less operations"** ([`stereo_field.md`](stereo_field.md)
  §2). The 30 ms answers the former ms-length gap.
- **VERIFIED — McWalter & McDermott 2018**, *Current Biology* (PMC). The averaging window
  is **multi-second and adaptive**, "restricted to sound elements attributed to a common
  source"; steps 1 s / 2.5 s, morphs 0.2–7.5 s ([`stereo_field.md`](stereo_field.md) §4).
- **PAYWALL — Kendall 1995**, "The Decorrelation of Audio Signals…," *CMJ* 19(4). No free
  author copy found; the allpass section count / interpolation rate stay unverified. A
  genuine paywall.
- **TEXTBOOK — pan-law equations.** Constant-power cos/sin, −4.5 dB compromise — standard
  identities, no primary needed.
- **ORIGINAL / NOT-FETCHED** — Xia et al. optimal-transport texture mixing (the
  covariance-interpolation method — the pure-DSP OT-on-McDermott-stats morpher is a
  candidate **original** contribution, nothing to confirm); non-stationary / LSW /
  deformed-stationary modelling; capture-geometry references (ORTF etc. — uncontroversial).

## Priority 4 — myNoise primary pages — CAPTURED

All fetched and read verbatim 2026-09-11 (paced ≥6 s/host). In
[`mynoise_reference.md`](mynoise_reference.md):

- **CONFIRMED verbatim** — sliders "are like a 10-band equalizer … each slider representing
  one octave," "ordered by frequency, as far as it makes sense" (help.php); "does not rely
  on any proprietary technology, but requires a browser … compatible with the Web Audio
  API" (faq.php); "Nature sounds are recorded in the field" (faq.php); the hearing-threshold
  calibration variant (calibration.php); lineage — signal-processing PhD, UCLouvain, Roland,
  AudioCheck.net, "© 2013-2026 myNoise BV." Gear: Sony ICD-SX1000 (endorsed), Fostex F2-2LE,
  Audio Technica AT-3032, acoustic-foam windshields (microphones.php).
- **MOVED** — the "no AI" line lives on the **blog**, stronger: "I have never used
  generative AI to create sound for myNoise." Not the FAQ paraphrase.
- **UNCONFIRMED** — the **188,027,101-year** figure was on **none** of the fetched pages
  (faq, blog, help, calibration, microphones, xenobiota, bio). Needs the Waterfall
  generator's own page, or it is stale. The **20 Hz–20 kHz** span is inferred, not stated.
  Pigeon's exact "why pink" wording was not located this pass.

## RIFF `smpl` chunk — resolved

Sample-frames, not bytes — confirmed against this repo's reader **and** writer, and the
libsndfile/SoundFont convention. `dwEnd` is emitted **exclusive** here (off-by-one vs the
inclusive convention). Full detail in [`seamless_looping.md`](seamless_looping.md) §5.
