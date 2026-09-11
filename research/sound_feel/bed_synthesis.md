# Texture-bed synthesis — technique digest

The stationary layer of a field recording: crowd murmur, HVAC rumble, room tone,
distant hubbub. No event you point at; statistically uniform over moderate
timescales. This is what "sound texture" means in the literature, and it is the
half of the mall that classical statistics-matching reproduces well.

Source: McDermott & Simoncelli, *Neuron* 71(5):926–940 (2011), plus a 2023 two-
stage simplification, Bruna & Mallat's scattering moments (2013), and classical
LPC/granular fallbacks. **All figures below are search-attested only** — the
primary PDFs were unreachable this session (see [`BLOCKED.md`](BLOCKED.md)); every
load-bearing number is flagged for verification.

## 1. The numbers — McDermott–Simoncelli (2011)

The core method. "Sound Texture Perception via Statistics of the Auditory
Periphery: Evidence from Sound Synthesis," doi:10.1016/j.neuron.2011.06.032.
Open author PDF and supplementary at mcdermottlab.mit.edu and cns.nyu.edu; open
mirror at PMC4143345. Three representational stages: waveform → cochlear subbands
→ compressed envelopes → modulation bands.

- **Excerpts:** ~7 s, 20 kHz sample rate, 16-bit. *(search-attested)*
- **Cochlear filterbank:** 30 bandpass filters, bandwidths widening with centre
  frequency (≈constant on an ERB/log scale), plus a lowpass + highpass for perfect
  reconstruction → **32 subbands** total. Range roughly the audible band
  (~20 Hz–~10 kHz for the audio used). *(search-attested; exact edges → Gaps)*
- **Envelope + compression:** analytic (Hilbert) envelope per subband, resampled
  to **400 Hz**, then a compressive nonlinearity — each envelope sample raised to
  the power **0.3** (models cochlear compression). *(search-attested)*
- **Modulation filterbank:** **20 modulation filters**, roughly half-octave-spaced,
  centres spanning ~**0.5 Hz–200 Hz**. *(20 attested from the 2011 paper; the
  0.5–200 Hz figure comes from McWalter & Dau's follow-up, which states 19 filters
  — a conflict to resolve on capture, see Gaps.)*
- **Statistic classes** ("seven sets of time-averaged statistics"):
  1. **Marginal moments** of each compressed envelope — mean, variance (as
     coefficient of variation), skew (3rd), and — unconfirmed — kurtosis (4th).
  2. **Envelope autocorrelation** within a channel, at a set of time lags.
  3. **Cross-band envelope correlations** across the 30 cochlear channels.
  4. **Modulation power** per modulation band, normalized.
  5. **C1 correlations** — across cochlear channels sharing a modulation filter.
  6. **C2 correlations** — across modulation bands of the same cochlear channel
     (phase-adjusted / complex).
- **Total coefficients:** **~1500** in one extraction; "up to several thousand"
  in another, because the count scales with channels chosen and the set is highly
  redundant. **This is a conflict, not a settled number** — the authoritative sum
  is in the supplementary PDF. *(→ Gaps)*

## 2. The mechanism

**Synthesis by statistic imposition.** Start from **Gaussian white noise**;
iteratively adjust the waveform so its measured statistics match the target
recording's, via **gradient-based optimization (conjugate-gradient / gradient
projection)** over the statistic set. Convergence judged by the SNR between
synthetic and target statistics, run to a low-error criterion — not a single pass.
The exact default iteration budget and stop threshold were not recoverable by
search (→ Gaps); read from the toolbox `run_synthesis`-type source.

**Why the correlations matter:** marginal statistics of individual channels alone
fail to produce compelling textures; it is the **cross-band and modulation
correlations** that make rain, fire, and crowds read as real rather than as
filtered noise. This is the paper's central empirical claim.

**Public code:** the MATLAB "Sound Texture Synthesis Toolbox" (McDermott lab); a
maintained GitHub mirror (`hackerekcah/Sound_Texture_Synthesis_Toolbox`, v1.7); a
Python reimplementation of the statistics (`wil-j-wil/texture_stats`). Read for the
exact statistic definitions and defaults, not vendored — the house builds from
spec.

## 3. The alternatives (cheaper or different statistic sets)

- **Two-stage spectral model** — Maruyama, Okada & Motoyoshi, *i-Perception*
  14(1) (2023), open access (SAGE / PMC9950610). A radical *simplification*:
  perceived texture is claimed captured by just **two amplitude spectra** — a 1-D
  spectrum of the raw waveform (linear) and a 2-D spectrum of the cochlear-subband
  envelopes (energy) — discarding the large redundant correlation set. Psychophysics
  on 120 real-world events found it **comparable** to McDermott–Simoncelli output.
  Attractive for a no-ML browser tool: far cheaper. FFT sizes/band counts not
  exposed by search (→ Gaps). A 2025 JASA extension exists (paywalled).
- **Scattering moments** — Bruna & Mallat, arXiv:1311.0407 (2013). A scattering
  transform (cascaded complex-wavelet filterbanks + envelopes); **first- and
  second-order scattering moments** as the descriptor, computable from a single
  realization, claimed sufficient with **far fewer coefficients** than McDermott.
  Better on transients/broadband because frequency scattering correlates amplitude
  variation across bands. Stronger variant: Andén, Lostanlen et al., DAFx 2019,
  adds joint time–frequency scattering. Heavier to implement; still stationary, so
  pitched/rhythmic content is still a weak point. Typical params (Q≈8 first order,
  Q≈1 second, T≈0.5–1 s) are standard-practice, **not verbatim** from the paper.
- **LPC / spectral noise-shaping** (classical fallback). Source–filter: white noise
  through an all-pole filter fit to the recording's long-term average spectrum.
  Speech uses order p≈10–20; a full-band room-tone/HVAC bed wants **p≈30–100**, or
  an equivalent FFT overlap-add "shape white noise to a measured magnitude spectrum
  with randomized phase." Cheap, real-time, seamless-loopable. Refs: Julius Smith
  (CCRMA). Fails on anything structured — a static colored-noise timbre only.
- **Granular "clouds"** (classical fallback). Overlapping short windowed grains;
  **asynchronous granular synthesis** uses a **density** parameter (grains/sec)
  rather than a fixed period. Grain length **10–100 ms** (>~50 ms starts to be
  heard as separate events; <~50 ms fuses into texture). Curtis Roads, *Microsound*.
  Realism depends on grain material; metallic at wrong sizes/low density.

## 4. Where it fails (the load-bearing caveat)

Every method here is a **stationary** model — "texture as wallpaper." The paper's
own discussion states pitched tones, reverberation, and rhythmic structure are not
captured; more generally, **discrete transient events and any evolving structure
get averaged/smeared out.** For the mall: the murmur/HVAC/hubbub floor is exactly
what these do well; **individual footsteps, shouts, laughs are what they destroy.**
This is why the event layer ([`event_layer.md`](event_layer.md)) exists as a
separate mechanism, and why the moving-mic non-stationarity
([`stereo_field.md`](stereo_field.md)) needs windowing rather than a single global
statistic vector.

For this studio, the recommended core is McDermott–Simoncelli (or the cheaper
two-stage spectral model) for the bed, with LPC/granular as lightweight fallbacks,
and the seamless-loop closing step handled in [`seamless_looping.md`](seamless_looping.md).

## 5. Lineage

McDermott, Oxenham & Simoncelli, "Sound Texture Synthesis via Filter Statistics,"
WASPAA 2009, is the precursor. The 2011 *Neuron* paper is the canonical statement.
McWalter & Dau extend the modulation analysis; McWalter & McDermott (2018) measure
the perceptual averaging window (relevant to windowing the walk). The two-stage
spectral model (2023–2025) is a Tokyo-group simplification; scattering moments
(2013) a Mallat-lineage alternative. A 2025 differentiable reimplementation
(arXiv:2506.04073) is a reference for the statistic definitions, **not** a no-ML
drop-in.

## Gaps

1. **Exact total coefficient count** for the standard config — "1500" vs "several
   thousand." Sum it from the supplementary PDF (moments × 32 subbands, autocorr
   lags, ½·32·31 cross-band pairs, 20 modulation-power terms, C1 + C2).
2. **Cochlear filter frequency endpoints** and exact filter count/shape.
3. **Whether kurtosis (4th moment)** is in the standard marginal set, or only
   mean/CV/skew — extractions disagree.
4. **Synthesis default iteration count and convergence threshold** — method
   confirmed, budget not.
5. **Modulation-filter count** — 20 (2011) vs 19 (McWalter–Dau). Confirm the 2011
   original's spacing and edges.
6. **Two-stage model internals** — FFT sizes, energy-spectrum subband count, how
   linear/energy spectra are weighted in synthesis.
7. **Scattering (1311.0407) exact params and coefficient count** vs McDermott — the
   "far fewer" claim is confirmed, the number is not.
