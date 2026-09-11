# Event layer — extraction & endless recirculation — technique digest

The sparse, recognizable half of the field: footsteps, shouts, laughs, door slams,
a dropped tray. The stationary bed model smears these away, so they are their own
mechanism — **extract** the user's own events from the recording, build a labeled
corpus, and **recirculate** them by a stochastic scheduler so the class
distribution returns forever without literal repetition.

Source: Bello et al. onset-detection tutorial (2005); Schwarz's concatenative
synthesis (CataRT, 2006–2007); Roads' *Microsound* (2001); filtered-Poisson /
shot-noise scheduling; and the montage/foreground-background texture literature.
**All figures search-attested only** — primaries unreachable this session
([`BLOCKED.md`](BLOCKED.md)); load-bearing numbers flagged.

## 1. The numbers

**Onset detection** (chop the recording into event grains). Bello, Daudet,
Abdallah, Duxbury, Davies & Sandler, "A Tutorial on Onset Detection in Music
Signals," *IEEE TSAP* 13(5):1035–1047 (2005). Detection-function families:

- **Energy / local energy** — frame RMS and its first difference. Cheapest; weak on
  soft onsets.
- **High-Frequency Content (HFC)** — Masri weighting, `E(n)=Σ_k k·|X(n,k)|²`.
  Emphasizes percussive/transient events → directly suited to footsteps, tray
  drops, door slams.
- **Spectral flux / spectral difference** — half-wave-rectified frame-to-frame
  magnitude change, `SF(n)=Σ_k H(|X(n,k)|−|X(n−1,k)|)`, `H(x)=(x+|x|)/2`. The
  workhorse (L1 → flux, L2 → difference, Masri 1996).
- **Phase deviation**, **complex domain** (magnitude + expected-phase; best all-
  round in the tutorial's comparison), **wavelet regularity**, **neg-log-likelihood**.
- **Peak-picking:** normalize → low-pass smooth → **adaptive threshold =
  offset δ + λ·(median over a sliding window)** → local maxima above it. Median/
  dynamic thresholding is the robustness trick.
- **Evaluation audio 44.1 kHz.** FFT window/hop/window-type are **not confirmed
  from the primary** — community defaults (1024 ≈ 23 ms / 512 hop / Hamming) are a
  value to pin, not Bello's stated number. *(→ Gaps)* Pull real constants from
  Essentia `OnsetDetection` and Böck "Onset Detection Revisited" (DAFx-06).

**Grain-size boundary** — Roads, *Microsound* (MIT Press, 2001). Grain duration
**~1–100 ms** is the defining band: below ~1 ms sub-perceptual, above ~100 ms
crosses into the note/"sound object" scale. This is the falsifiable line between
**granular** (short unlabeled fixed-window fragments) and **concatenative**
(event-length units selected by descriptor). Windows: Gaussian/Hann/Tukey/
Blackman-Harris (never rectangular — clicks). Density: hundreds–thousands of
grains/sec for continuous clouds; sparse for events.

## 2. The mechanism — corpus + stochastic scheduling

**Corpus-based concatenative synthesis** — Schwarz, "Corpus-Based Concatenative
Synthesis," *IEEE Signal Processing Magazine* 24(2):92–104 (2007, paywalled); and
Schwarz et al., "Real-Time Corpus-Based Concatenative Synthesis with CataRT,"
DAFx-06 (open PDF). Framed as a "content-based extension to granular synthesis":
grains are played from a corpus by proximity to a target in **descriptor space**.

- **Per-unit descriptors** (attested-typical set): fundamental frequency,
  periodicity, loudness/energy, spectral centroid, sharpness, spectral flatness,
  zero-crossing rate; plus metadata (duration, source file, MIDI note). *(exact
  CataRT set → Gaps)*
- **Selection:** k-nearest-neighbour in normalized descriptor space to a target
  position; CataRT's interactive default is a 2-D plane (commonly centroid ×
  periodicity). The thesis model minimizes **target cost + concatenation cost** via
  a Viterbi path search.
- **Segmentation modes:** onset-based, blind/fixed-size, beat, imported markers.

**The recirculation engine — filtered Poisson (shot noise).** Onsets at Poisson-
distributed times, random amplitudes, each convolved with a grain kernel. A
homogeneous Poisson process (rate λ) gives **exponential inter-onset intervals**,
mean 1/λ. This is the standard texture device (Bruna & Mallat note replacing
Gaussian noise with a Poisson process randomizes phase while preserving the
kernel's power spectrum). It is the machine for "endless": repeatedly draw an event
from the corpus and place it, so the *class distribution* is reproduced without a
loop.

**Estimating the schedule from the recording** (the "match the source density"
recipe): run onset detection → cluster events by descriptor → **λ̂ = event count /
duration, per class**; **amplitude distribution** = histogram of detected peak
amplitudes (often log-normal/exponential); the inter-onset-interval histogram tests
the Poisson assumption via an exponential fit.

## 3. The grammar — what the events do together

Real crowds are **not pure Poisson.** Footsteps are near-periodic; laughs cluster.
Pure homogeneous Poisson will read as too uniform and betray the "generated"
quality the user wants to escape. The upgrades:

- **Non-homogeneous Poisson** — time-varying λ(t) to shape density (busier here,
  quieter there).
- **Self-exciting (Hawkes) / renewal processes** — for clustering (a laugh triggers
  more laughs) and for near-periodicity (footsteps). The workers did not surface a
  direct audio application of Hawkes to texture events — a search to run and
  possibly original work. *(→ Gaps)*

**Foreground/background separation** is the closest published framing of the user's
whole goal:
- O'Leary & Röbel, "A Montage Approach to Sound Texture Synthesis" (IRCAM) —
  explicitly separates foreground transient sequences from the background din and
  reschedules the foreground. The nearest match to this project.
- Saint-Arnaud & Popat, "Analysis and Synthesis of Sound Textures" (1995/1998) —
  two-level model: low-level **atoms** + a cluster-based probability model of their
  arrangement (periodic, random, or both). The original event-corpus +
  stochastic-scheduling idea.
- Schwarz, "State of the Art in Sound Texture Synthesis," DAFx-2011 — the taxonomy
  (subtractive / granular / concatenative / wavelet / statistical / physical) and
  who does background-vs-foreground.
- Verron et al. — environmental-sound synth via a sinusoids+noise+transients
  decomposition with per-event stochastic control (rain, fire, crowd), driven by a
  high-level density knob.

## 4. The engineering — per-hit cost, pooling, voice-stealing

This is precisely the CLAUDE.md per-hit scheduling trap (dub_synth: ~1.15 ms/s flat
persistent vs ~40.7 ms/s per-hit at 300 s). The fix, confirmed across game-audio
and Web Audio practice:

- **Fixed-size voice pool + steal-oldest** (or steal-quietest) on overflow. Standard
  for frequently-fired one-shots — footsteps, gunshots — i.e. this exact layer.
  (RNBO `poly~`, Pd `[poly]`, game-audio sound pools.)
- **Web Audio specifics:** `AudioBufferSourceNode` is **single-use** — `start()`
  once, discarded after it ends, never freed early, so a naive scheduler leaks one
  node per hit. Pool and reuse the **`GainNode`/`PannerNode`** downstream; keep a
  **persistent sub-graph** and route short-lived source nodes into it; use
  `copyToChannel`/`copyFromChannel` to avoid buffer copies. (Paul Adenot's Web Audio
  performance notes; W3C spec.)
- **Consequence:** the source node is the unavoidable per-event allocation, so cap
  concurrency with a hard voice count and steal rather than scheduling unboundedly
  ahead. When events are dense enough, precompute a **window-length pre-mixed
  buffer looped by one node** (the CLAUDE.md "flat" case).

## 5. Lineage

Xenakis' granular density (late 1950s) and Roads' *Microsound* underpin the grain
model; Schwarz's IRCAM thesis (2004) and CataRT (2006) formalize corpus-based
concatenation; Saint-Arnaud & Popat (1995) and O'Leary & Röbel are the
foreground/background line; shot-noise/filtered-Poisson is the classical stochastic
texture generator, with the image-texture "dead leaves" model (Matheron;
Bordenave/Gousseau/Roueff) as its visual cousin — no direct audio adaptation found,
so a dead-leaves *audio* model (occlusion/layering by amplitude) would be original.

## Gaps

1. **Bello's actual analysis parameters** — FFT size, hop, window, peak-pick
   constants (δ, λ, smoothing cutoff, min inter-onset gap). Load-bearing for
   segmentation; only 44.1 kHz is confirmed.
2. **CataRT's exact descriptor list and selection-distance weighting** — the set
   here is attested-typical, not read off the paper.
3. **A turnkey per-class λ and amplitude estimator with published constants** —
   assembled here from onset detection + Poisson theory; check O'Leary & Röbel and
   texture-montage papers for their actual clustering + rate-fit.
4. **Hawkes/renewal for crowd clustering** — not surfaced; the realism upgrade to
   avoid obvious uniformity. Search next; possibly original for audio.
5. **Dead-leaves audio model** — appears unpublished for audio; original if wanted.
6. **Seamless-loop rendering of a stochastic event layer** — the core tension:
   Poisson never repeats, but the deliverable is a finite seamless loop. Unresolved
   in the literature; see [`seamless_looping.md`](seamless_looping.md) — an
   engineering decision to prototype and measure, not cite.
