# Texture-bed synthesis — technique digest

The stationary layer of a field recording: crowd murmur, HVAC rumble, room tone,
distant hubbub. No event you point at; statistically uniform over moderate
timescales. This is what "sound texture" means in the literature, and it is the
half of the mall that classical statistics-matching reproduces well.

Source: McDermott & Simoncelli, *Neuron* 71(5):926–940 (2011), plus a 2023 two-
stage simplification, Bruna & Mallat's scattering moments (2013), and classical
LPC/granular fallbacks. **The McDermott–Simoncelli figures are verified against
the primary** — the paper's own PDF and its supplementary (the definitive
parameter tables) were opened and read on 2026-09-11 (see [`BLOCKED.md`](BLOCKED.md)).
Three search-attested figures were **wrong** and are corrected below: the cochlear
range (52–8844 Hz, not 20 Hz–10 kHz), the modulation spacing (constant-Q, not
half-octave), and the excerpt bit depth (not stated in the paper — dropped). Two
conflicts are now settled: the coefficient total is **1515** exactly, and the
modulation-filter count is **20**. The two-stage (2023) and scattering (2013)
alternatives in §3 are not yet primary-verified.

## 1. The numbers — McDermott–Simoncelli (2011)

The core method. "Sound Texture Perception via Statistics of the Auditory
Periphery: Evidence from Sound Synthesis," doi:10.1016/j.neuron.2011.06.032.
Open author PDF and supplementary at mcdermottlab.mit.edu and cns.nyu.edu; open
mirror at PMC4143345. Three representational stages: waveform → cochlear subbands
→ compressed envelopes → modulation bands.

- **Excerpts:** **7 s** measurement segments, resampled to **20 kHz**, normalized.
  *(verified 2026-09-11: "We used 7 sec segments to measure statistics. All sounds
  were resampled with a sampling rate of 20 kHz and normalized.")* No excerpt bit
  depth is stated — the paper's only bit figure is a **24-bit D/A** on the playback
  side. The earlier "16-bit" was unsupported; dropped.
- **Cochlear filterbank:** **30 bandpass filters**, centre frequencies equally
  spaced on an **ERBN scale (Glasberg & Moore 1990), spanning 52–8844 Hz**;
  3 dB bandwidths ≈ human ERBs. A **lowpass + highpass** on each end assure perfect
  tiling → **32 subbands** total. *(verified 2026-09-11: "a bank of 30 such filters
  … spanning 52–8844 Hz"; supp: "lowpass and highpass filters on each end … to
  assure perfect tiling." The earlier ~20 Hz–10 kHz range was a guess; the real
  centre-frequency span is 52–8844 Hz.)*
- **Envelope + compression:** analytic (Hilbert) envelope per subband, downsampled
  (after lowpass) to **400 Hz**, then a compressive nonlinearity — each envelope
  sample raised to the power **0.3** (models basilar-membrane compression).
  *(verified 2026-09-11: "envelopes downsampled … to a rate of 400 Hz"; supp:
  "Subband envelopes were raised to a power of 0.3 to simulate basilar membrane
  compression.")*
- **Modulation filterbank:** **20 bandpass modulation filters**, **constant-Q**
  (half-cosine on a log scale), centres spanning **~0.5–200 Hz** — 200 Hz being the
  Nyquist of the 400 Hz envelope. A **separate, smaller set** feeds the C1/C2
  correlations: **octave-spaced, Q = √2, 1.5625–100 Hz, 7 filters**. *(verified
  2026-09-11: "a bank of 20 bandpass modulation filters"; "center frequencies in
  octave steps from 1.5625 to 100 Hz, yielding seven filters." This resolves the
  count conflict — the 2011 original is **20**; McWalter & Dau's 19 is a later
  variant. "Half-octave" was wrong — the word never appears; the bank is constant-Q.)*
- **Statistic classes** and their exact counts *(verified 2026-09-11, main text
  p. 937: "In total, there are 128 cochlear marginal statistics, 189 cochlear
  cross-correlations, 640 modulation band variances, 366 C1 correlations, and 192
  C2 correlations, for a total of 1515 statistics.")*:
  1. **Marginal moments** of each compressed envelope — the **first four normalized
     moments**: mean, variance (as coefficient of variation), skew, **and kurtosis**.
     *(Kurtosis is confirmed in — supp: cochlear marginals "included each of the
     first four normalized moments." The earlier "unconfirmed" is resolved.)*
     **128** = 32 subbands × 4 moments.
  2. **Cross-band envelope correlations** — each subband against **8 neighbours**
     (offsets [1,2,3,5,8,11,16,21]). **189**.
  3. **Modulation power** per modulation band — **variance only** (the other moments
     were dropped as uninformative/redundant). **640** = 32 subbands × 20 filters.
  4. **C1 correlations** — across cochlear channels sharing a modulation band. **366**.
  5. **C2 correlations** — across modulation bands of one cochlear channel, complex
     (phase-adjusted). **192**.
- **Total coefficients: 1515 — settled.** The "~1500 vs several thousand" conflict
  is resolved; the authoritative figure is **exactly 1515**. The counts also confirm
  the **32-subband** total independently: 128 = 32×4 and 640 = 32×20 only work with
  30 bandpass + 2 end filters. *(verified 2026-09-11)*

## 2. The mechanism

**Synthesis by statistic imposition.** Start from **Gaussian white noise**;
iteratively adjust the waveform so its measured statistics match the target
recording's, via **gradient-based optimization** over the statistic set. **The
budget and stop criterion are now verified** *(2026-09-11, main text)*: convergence
is monitored per statistic class as an **SNR** (ratio of summed squared statistic
error to summed squared statistic values); the run **halts once every class reaches
30 dB SNR, or at 60 iterations**, and is **"considered to have converged if the
average SNR of all statistic classes was 20 dB or higher."** So: **60 iterations
max, 30 dB-per-class target, 20 dB average = converged.** It can settle into a local
minimum on simple artificial signals (stated caveat).

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

**Resolved 2026-09-11 against the primary** (main text + supplementary): total
coefficient count (**1515**), cochlear filter endpoints (**52–8844 Hz**, ERBN,
30 + 2 = 32 subbands), kurtosis in the marginal set (**yes — first four moments**),
synthesis budget (**60 iterations, 30 dB/class, 20 dB avg**), and the modulation
count/spacing (**20, constant-Q, 0.5–200 Hz**; C1/C2 on 7 octave-spaced filters).

Still open — these need sources not yet read to their primary:

1. **Two-stage model internals** (Maruyama et al. 2023) — the **structure** is
   confirmed from the open-access paper (a 1-D amplitude spectrum of the waveform plus
   a **2-D spectrum of each subband envelope: temporal-frequency Ft × frequency**;
   recommended parameters include subband variance and envelope mean/variance), but
   the exact FFT sizes and energy-spectrum subband count did not extract cleanly and
   are still open. *(partially resolved 2026-09-11)*
2. **Scattering (arXiv:1311.0407) exact params and coefficient count** vs McDermott —
   the "far fewer" claim is plausible, the number is not confirmed (paper not yet read).
