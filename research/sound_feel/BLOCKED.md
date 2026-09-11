# BLOCKED — the capture queue

Every source behind the `sound_feel` digest was reached through search-engine
**extraction only**. This session's egress proxy returned 403 at the proxy for all
non-registry hosts, so **no primary PDF or page was opened directly** (`WebFetch`
and `curl` both blocked). Every number in the digest is therefore *search-attested*,
not *verified*.

This file is the queue to run on a machine with open internet. For each source:
open it, confirm the flagged figures, and where a digest number is confirmed,
change its "search-attested" mark to "verified <date>" in the relevant file.

Two status kinds:
- **EGRESS** — freely readable, just unreachable from this session. Should confirm
  cleanly once opened.
- **PAYWALL** — genuinely gated; needs a library, institutional access, or an
  author preprint. Note the free route where one is known.

## Priority 1 — load-bearing parameters

- **PAYWALL / EGRESS** — McDermott & Simoncelli 2011, *Neuron* 71(5):926–940.
  ScienceDirect (paywall): https://www.sciencedirect.com/science/article/pii/S0896627311005629
  Author PDF (egress): https://mcdermottlab.mit.edu/papers/McDermott_Simoncelli_2011_sound_texture_synthesis.pdf
  Open mirror (egress): https://pmc.ncbi.nlm.nih.gov/articles/PMC4143345/
  **Supplementary — the definitive parameter tables** (egress): https://www.cns.nyu.edu/pub/lcv/mcdermott10-supplementary.pdf
  → Confirm: total coefficient count (1500 vs "several thousand"); cochlear filter
  edges & count; whether kurtosis is in the marginal set; modulation-filter count
  (20 vs 19) & spacing; synthesis iteration count & convergence threshold.
- **EGRESS** — Bello et al. 2005, onset-detection tutorial, *IEEE TSAP* 13(5).
  https://hajim.rochester.edu/ece/sites/zduan/teaching/ece472/reading/Bello_2005.pdf
  http://www.eecs.qmul.ac.uk/former/people/jbc/Documents/Bello-TSAP-2005.pdf
  → Confirm: FFT size, hop, window type, peak-pick constants (δ, λ, smoothing, min
  inter-onset gap).
- **EGRESS** — Välimäki, Rämö & Esqueda, "Creating Endless Sounds," DAFx-18.
  https://aaltodoc.aalto.fi/items/380f0215-7a05-4943-a57e-ece797f035c9
  Project page: http://research.spa.aalto.fi/publications/papers/dafx18-endless/
  → Confirm: chosen LP order, FFT length, sample rate; the exact random-phase IFFT
  seamless-loop claim.
- **EGRESS** — Schlecht, "Endless Sounds and Circular Convolution."
  https://www.sebastianjiroschlecht.com/post/endlesssounds/
  → Confirm the circular-boundary-condition seam property, cleanly stated.
- **CODE (read for exact constants)** — PyMusicLooper: https://github.com/arkrow/PyMusicLooper
  → Confirm loop-finder thresholds (0.0875, 0.5 dB, 0.35× length, ±12-beat window).
- **CODE** — LoopAuditioneer: https://loopauditioneer.sourceforge.io/userguide.html ,
  https://github.com/GrandOrgue/LoopAuditioneer

## Priority 2 — method detail

- **PAYWALL** — Schwarz, "Corpus-Based Concatenative Synthesis," *IEEE SP Magazine*
  24(2), 2007: https://ieeexplore.ieee.org/document/4117932/
  Free preprint to try: http://articles.ircam.fr/textes/Schwarz06b/index.pdf
- **EGRESS** — CataRT, DAFx-06: https://www.dafx.de/paper-archive/2006/papers/p_279.pdf
  → Confirm: exact descriptor list & selection distance weighting.
- **EGRESS** — Schwarz, "State of the Art in Sound Texture Synthesis," DAFx-2011:
  https://dafx.de/paper-archive/2011/Papers/30_e.pdf
- **EGRESS** — Böck, "Onset Detection Revisited," DAFx-06:
  https://www.dafx.de/paper-archive/2006/papers/p_133.pdf
- **EGRESS** — Rosão, peak-picking comparison, ISMIR 2012:
  https://ismir2012.ismir.net/event/papers/517_ISMIR_2012.pdf
- **EGRESS** — Maruyama, Okada & Motoyoshi, two-stage spectral model, *i-Perception*
  2023 (open access): https://journals.sagepub.com/doi/full/10.1177/20416695231157349 ,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9950610/
  → Confirm: FFT sizes, energy-spectrum subband count, synthesis weighting.
- **EGRESS** — Bruna & Mallat, scattering moments, arXiv:1311.0407:
  https://arxiv.org/pdf/1311.0407  → Confirm Q per octave, T, coefficient count.
- **EGRESS** — Andén, Lostanlen et al., time-frequency scattering, DAFx 2019:
  https://www.dafx.de/paper-archive/2019/DAFx2019_paper_58.pdf
- **CODE** — Bencina, "Implementing Real-Time Granular Synthesis," 2001:
  http://www.rossbencina.com/static/code/granular-synthesis/BencinaAudioAnecdotes310801.pdf
- **EGRESS** — Roads, *Microsound* (MIT Press, 2001), scan:
  https://monoskop.org/images/d/d1/Roads_Curtis_Microsound.pdf
- **CODE** — Sound Texture Synthesis Toolbox (MATLAB):
  https://github.com/hackerekcah/Sound_Texture_Synthesis_Toolbox ;
  Python stats: https://github.com/wil-j-wil/texture_stats

## Priority 3 — stereo, decorrelation, non-stationarity

- **PAYWALL** — Kendall 1995, "The Decorrelation of Audio Signals…," *CMJ* 19(4).
  https://www.semanticscholar.org/paper/c97a6d0ca2fd6fee5a619f73082341a74f626cf6
  Free routes to try: https://www.researchgate.net/publication/240294548 (login wall)
  → Confirm: allpass section count, coefficient interpolation rate.
- **EGRESS** — Velvet-Noise Decorrelator, DAFx-2017:
  http://www.dafx17.eca.ed.ac.uk/papers/DAFx17_paper_96.pdf ;
  Optimized VND (Aalto): https://research.aalto.fi/en/publications/optimized-velvet-noise-decorrelator/ ;
  AudioLabs page: https://www.audiolabs-erlangen.de/resources/2018-DAFx-VND
  → Confirm: transparent filter length in ms at 44.1/48 kHz.
- **EGRESS** — CCRMA, "Signal Decorrelation using Perceptually Informed Allpass
  Filters," DAFx-2016: https://ccrma.stanford.edu/~kermit/website/papers/decorrelation_DAFx2016.pdf
- **EGRESS** — pan-law equations (primary): http://www.cs.cmu.edu/~music/icm-online/readings/panlaws/panlaws.pdf
- **EGRESS** — McWalter & McDermott 2018, "Adaptive and Selective Time-Averaging of
  Auditory Scenes," *Current Biology*: https://pmc.ncbi.nlm.nih.gov/articles/PMC5940576/
  → Confirm: the multi-second, adaptive averaging window figures.
- **PAYWALL** — Xia, Ferradans, Peyré & Aujol, "Static and Dynamic Texture Mixing
  Using Optimal Transport": https://link.springer.com/chapter/10.1007/978-3-642-38267-3_12
  (author preprints usually on their pages) — the covariance-interpolation method.
- **EGRESS** — non-stationary audio spectral analysis: https://arxiv.org/pdf/1712.10252 ;
  deformed-stationary modeling: https://arxiv.org/pdf/1510.08240 ;
  LSW processes: https://arxiv.org/pdf/1809.09729
- **EGRESS** — capture geometry: https://en.wikipedia.org/wiki/ORTF_stereo_technique ,
  https://www.dpamicrophones.com/mic-university/audio-production/stereo-recording-techniques-and-setups/

## Priority 4 — myNoise primary pages (verbatim before quoting)

All **EGRESS**-blocked; all Pigeon's own words — capture before any quote is treated
as verbatim.
- https://mynoise.net/faq.php — Web Audio, never-repeats, no-AI, field recordings.
- https://mynoise.net/calibration.php — calibration modes; "why pink."
- https://mynoise.net/NoiseMachines/help.php — Quick Manual: "10-band EQ," octave/
  slider, 20 Hz–20 kHz, ordered by frequency.
- https://mynoise.net/blog.php — likely holds the 188,027,101-year figure & engine.
- https://mynoise.net/microphones.php — gear, binaural, windshields.
- https://mynoise.net/Interviews/interview_reform.php — "The Noises I Hear."
- https://mynoise.net/NoiseMachines/xenobiotaGenerativeNoise.php — "resynthesized."
- https://stephanepigeon.com/biography.php — background.

## RIFF `smpl` chunk — resolve the byte-vs-frame conflict

- **EGRESS** — https://ccrma.stanford.edu/courses/422-winter-2014/projects/WaveFormat ;
  http://midi.teragonaudio.com/tech/wave.htm (says "bytes" — suspect) ;
  https://www.recordingblogs.com/wiki/sample-chunk-of-a-wave-file ;
  https://wavref.til.cafe/chunk/smpl/
- **CODE** — reference implementations that treat start/end as sample-frames:
  https://github.com/go-audio/wav/blob/master/smpl_chunk.go (libsndfile `SF_INSTRUMENT`,
  SoundFont wording agree).
  → Resolve: sample-frames (near-certain) vs bytes; `dwEnd` inclusive vs exclusive;
  and check what this repo's own WAV writer currently emits.
