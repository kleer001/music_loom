# Stereo imaging & the moving field — technique digest

Two problems the other axes don't cover: giving a synthesized bed genuine stereo
**width** (mono-safe), placing discrete **events** across the image, and the fact
that the user's recordings are often made with the **microphone moving through** the
space — which breaks the stationarity the bed model assumes and reframes what
"seamless loop" even means.

Source: standard stereo-capture geometry; Kendall (1995) and velvet-noise
decorrelation; constant-power pan law; McDermott–Simoncelli stationarity + McWalter
& McDermott (2018) on the averaging window; locally-stationary process theory and
optimal-transport texture interpolation. **VND (DAFx-2017) and McWalter & McDermott
(2018) are verified against their primaries** (read 2026-09-11): the VND transparent
length is **30 ms** (§2), and the averaging window is confirmed **multi-second and
adaptive** (§4). **Kendall (1995) is genuinely paywalled** — still blocked. The pan
laws (§3) are textbook constant-power identities. The optimal-transport morpher
remains a **candidate original contribution**, not a citation.

## 1. The numbers — capture geometry dictates re-synthesis

What a technique encodes — inter-channel **level** (ILD), **time** (ITD), or both —
determines how a synthesized bed must be built to match it.

| Technique | Spacing | Angle | Cue | Mono-compat | Image |
|---|---|---|---|---|---|
| XY (coincident) | 0 cm | 90–135° | **ILD only** | excellent | narrow, stable |
| ORTF | **17 cm** | **110°** | ILD + ITD | good | ear-like, realistic |
| NOS | 30 cm | 90° | ILD + ITD | fair | wider |
| DIN | 20 cm | 90° | ILD + ITD | fair | between ORTF/NOS |
| Spaced AB | 40 cm–3 m | 0° | **ITD only** | poor (comb) | widest, diffuse |
| M/S | 0 cm | — | ILD via matrix | **perfect** | width tunable post |
| Binaural | ~17–18 cm | — | ILD+ITD+**HRTF** | poor | 3D, headphones only |

Canonical figures: **ORTF = 17 cm / 110° / cardioid** (17 cm ≈ ear spacing, 110°
emulates head shadow); NOS 30 cm/90°; DIN 20 cm/90°; spaced AB omnis 40 cm–3 m under
the **3:1 rule** (mic spacing ≥ 3× mic-to-source distance).

**Implication:** the bed's target width must match how the original was captured.
XY/M-S → pure ILD → level-panned events over a near-mono diffuse bed, mono-safe for
free. **ORTF/spaced AB (most handheld walking rigs)** → width in inter-channel
time/phase → the synthesized bed must be **genuinely L/R decorrelated** (§2), not a
mono bed panned, or it reads flat and in-the-head against the real sections.
**Binaural** cannot be reproduced as a speaker-target stereo bed without HRTF cues —
flag out of scope.

## 2. The mechanism — decorrelation for width (mono-safe)

Goal: two channels that **sound identical** but have **different waveforms**, so
they widen into an enveloping image **without collapsing in mono**.

- **Independent-RNG stereo (the cheap, house-native path).** Generate the two
  channels of a *stochastic* bed from **independent RNG streams**, not one stream
  copied. Genuine decorrelation, naturally wide, and (being statistically
  independent) it **sums to stable mono** — uncorrelated signals add in power
  (~+3 dB), no comb notches. Maps straight onto `core/rng.js`'s independent-stream-
  per-layer convention. **Only works for stochastic content**; discrete events must
  be single-source and panned (§3), or they smear.
- **Velvet-Noise Decorrelator (VND)** — Alary, Politis & Välimäki, DAFx-2017 —
  the modern, cheap choice for a bed derived from a single mono generator. Sparse FIR
  (velvet noise = mostly zeros, ±1 impulses), one per channel → broadband
  decorrelation with **minimal coloration**. *(verified 2026-09-11 against the DAFx-2017
  PDF:* density **1000 impulses/s**, example filter length **1024 samples**, and the
  **transparent length is 30 ms** — "1323 samples for a sampling rate of 44.1 kHz,"
  segmented into 2048-sample windows. The paper's headline efficiency claim is
  **"87% less operations"** than a dense white-noise FIR; the earlier "~76%/~88%"
  range was imprecise — 87% is the stated figure. The **30 ms transparent length
  answers the former Gap.**)*
- **Randomized allpass (Kendall 1995)** — "The Decorrelation of Audio Signals and
  Its Impact on Spatial Imagery," *CMJ* 19(4):71–87 (paywalled). Independent random
  allpass filters per channel (flat magnitude, scrambled phase); dynamic version
  interpolates between random coefficient sets so phase varies slowly. Names the five
  pitfalls: **timbral coloration/combing**, diffuse field (the goal), externalization,
  image shift, precedence failure. *(section count → Gaps)*
- **Avoid for width:** inter-channel **delay** and **complementary comb** filters —
  both create phase differences that **cancel/comb on mono fold-down**. Allpass/
  velvet-noise avoid the delay form.

**Recommendation:** independent-RNG stereo for stochastic layers; velvet-noise (or
randomized allpass) for anything from a single mono generator; never delay/comb.
**Verify mono fold-down at measurement time** (`rack/R3-measure`): sum L+R, confirm
no spectral notching and no level collapse — a first-class in-bench check, since no
source gives measured mono-correlation numbers for these methods (→ Gaps).

## 3. Placing events — the pan law

For dropping a single event (footstep, voice, cart) at a stereo position, with
θ ∈ [0, π/2]:

- **Constant-power (−3 dB):** `L = cos θ, R = sin θ`; `cos²θ + sin²θ = 1`. Centre
  both 0.707 (−3 dB). Correct for **stereo speakers / uncorrelated** material;
  centre sums **+3 dB hot** in mono.
- **Linear (−6 dB):** `L = 1−p, R = p`; channels add in **amplitude**, centre sums
  to unity — **correct for mono summing** / correlated material.
- **−4.5 dB compromise:** geometric mean, centre 0.59; the common DAW default,
  because real signals fall between correlated and uncorrelated.

**Guidance:** since these loops are stereo-target with a mono-safety requirement and
events are single-source, **−4.5 dB is the safe default**; −3 dB for a purely
uncorrelated layer, −6 dB for anything that must survive mono cleanly. For a moving
source (mic walking past a fixed sound), **automate θ over time** — a smooth cos/sin
sweep is the ITD-free intensity trajectory of a source passing an XY pair.

## 4. The non-stationarity problem (the important one)

**Stated precisely:** McDermott–Simoncelli *defines* a texture by stationarity —
properties constant over moderate timescales, captured by **time-averaged
statistics**. A moving mic violates this by construction: the scene changes as you
walk (food-court → corridor → atrium). Averaging stats over the whole walk yields a
**blurred chimera of every room at once** — synthesis of the average sounds like
*none* of the places, because the long window smears the transitions the ear uses to
know it is moving.

**The averaging window — perceptual evidence.** McWalter & McDermott (2018),
"Adaptive and Selective Time-Averaging of Auditory Scenes," *Current Biology*: the
ear's texture-averaging window is **multi-second** and **adaptive** (lengthens for
more variable textures; selectively restricted to a common source). A principled
window: **a few seconds** — long enough to average detail, short enough to track the
walk. *(verified 2026-09-11 against the primary: "steps occurring in the previous
several seconds biased texture judgments, indicative of a multi-second averaging
window"; "longer integration times for temporally variable textures"; integration
"restricted to sound elements attributed to a common source." Experiments used 1 s
and 2.5 s steps and morph durations of 0.2–7.5 s — consistent with the ~2–5 s window
proposed below.)*

**Local stationarity — the framework.** Segment the walk into **locally-stationary
chunks** and let statistics be **time-varying** across them. Tools: Locally
Stationary Wavelet (LSW) processes; time-varying spectral analysis for non-stationary
audio; and "deformed stationary process" models that treat a walk as a *deformation*
of a stationary process (directly on-point for "same texture, slowly evolving").
Statistical-completion work (Nature Comms 2019) shows the ear fills textures across
gaps — support for a chunk-and-crossfade-statistics model.

**The design fork — frozen moment vs re-wandering.**
- **Frozen moment:** pick one locally-stationary window, extract its stats,
  synthesize a seamless *stationary* loop. Simplest; loses the walk. Right for "that
  one room, forever."
- **Re-wandering:** extract stats at successive windows (S₁…Sₙ) and synthesize while
  **interpolating the target statistics** between adjacent states, re-walking the
  evolution. And this reframes seamless looping itself: build a **closed loop in
  statistic-space** (…S₁→S₂→…→Sₙ→S₁…) so the seam becomes **statistic-space
  continuity**, not waveform splicing.

  Interpolating statistics correctly is where **optimal transport** enters:
  Xia, Ferradans, Peyré & Aujol, "Synthesizing and Mixing Stationary Gaussian Texture
  Models" / "Static and Dynamic Texture Mixing Using Optimal Transport" — define a
  distance between texture models, the geodesic, and the **Wasserstein barycenter**,
  then navigate it. This interpolates **covariances** correctly, where naïve linear
  blending `S(t) = (1−α)Sᵢ + αSᵢ₊₁` can produce **invalid (non-PSD) correlation
  matrices** — the reason the OT formulation exists.

  Explicit **audio** texture morphing exists but is mostly **neural** (out of scope).
  The workers found the visual/video OT literature and the neural audio-morph
  literature but **no published pure-DSP OT-on-McDermott-stats audio morpher** — a
  genuine open niche this studio could claim. Recorded as a gap, not a fact.

**Practical recipe to propose:** segment the walk into ~2–5 s locally-stationary
windows (boundaries by stat-vector or LSW-spectrum change), extract stats per window,
then for an endless loop either freeze one window or build a **closed loop in
statistic-space** with OT/barycentric interpolation between neighbours.

## 5. Ambisonics — worth it?

Higher-Order Ambisonics represents the 3D field via spherical harmonics; channels =
(N+1)² (1st order = 4-ch B-format, 2nd = 9, 3rd = 16…). **Verdict: not the
representation here.** The deliverable is a stereo loop; the source is a portable
stereo rig, not a spherical array; HOA needs special capture and multi-speaker/HRTF
decode (re-introducing the binaural problem stereo avoids). The one transferable
idea: ambisonic **"navigable field by interpolating between capture points"** is the
*spatial* analogue of §4's statistic-space interpolation — both re-wander an evolving
field by interpolating sampled states. If a headphone/VR target ever matters,
revisit 1st-order (4-channel) as the minimum viable richer representation; for a
stereo loop, stay in stereo.

## Gaps

1. **Velvet-noise transparent filter length — resolved 2026-09-11: 30 ms** (1323
   samples at 44.1 kHz), from the DAFx-2017 paper. Still worth an in-bench mono
   fold-down check on the repo's own material.
2. **Kendall's own allpass section count / interpolation rate** — **still blocked**:
   the 1995 CMJ paper is paywalled (no free author copy found). Figures in circulation
   are from later replications, not the primary. A genuine paywall, not an oversight.
3. **A pure-DSP McDermott-statistics OT/Gaussian-barycenter audio morpher** — appears
   unpublished; possible original contribution. Search "Wasserstein barycenter
   auditory summary statistics."
4. **Locally-stationary segmentation of a *walk*** — LSW/change-point machinery is
   generic; no worked field-recording example. Pick the detector (stat-vector
   distance vs LSW spectral change vs BIC) empirically against the user's own audio.
5. **Whether McDermott stats interpolate stably under naïve lerp** (covariance PSD) —
   theory says use OT; no direct audio empirical comparison found.
6. **Mono fold-down numbers** for independent-RNG vs velvet-noise vs allpass beds —
   no source measures these; generate in-house via `rack/R3-measure`.
