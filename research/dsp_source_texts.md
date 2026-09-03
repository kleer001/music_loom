# Primary sources for the signal-processing side

Where the numbers would come from. Each section names one text, what it settles, and whether it can be read for free — so that a constant landing in `core/` or `dsp/` has a citation with a section number behind it rather than a plausible value.

`learning_resources.md` is the wider index of free material for learning the craft. This is narrower: the specific papers and books behind capabilities the rack either has without a citation, or does not have yet. Access status in section 11.

## 1. Why a source, and not a good value

`research/README.md` puts it directly: a constant with no citation is one nobody can account for six months later. Two places in the rack are in that position today. `dsp/ladder-worklet.js` implements a ladder filter and cites nothing. `core/scheduler.js` has one linear swing parameter and cites nothing. Neither is wrong; both are unaccountable.

The sections below are ordered by what the studio would reach for first, not by importance.

## 2. Reverberation

**Jon Dattorro, "Effect Design, Part 1: Reverberator and Other Filters", JAES 45(9), September 1997.** Free from the author at <https://ccrma.stanford.edu/~dattorro/EffectDesignPart1.pdf>.

The plate topology that most software plate reverbs descend from: an input diffusion chain of allpasses feeding a figure-of-eight tank of allpasses and delays, with output taps read from fixed positions in the loop. Dattorro wrote it as internal documentation for the Ensoniq ESP2 in 1995, having reverse-engineered a Lexicon 224, and published it two years later. The paper prints the delay lengths and coefficients, which is what makes it directly implementable rather than merely descriptive.

**Manfred Schroeder, "Natural Sounding Artificial Reverberation", JAES 10(3), 1962.** The comb-and-allpass ancestor of everything in this section, and the design behind Freeverb.

**Jean-Marc Jot and Antoine Chaigne, "Digital Delay Networks for Designing Artificial Reverberators", AES 90th Convention, 1991.** The feedback delay network with a unitary feedback matrix and per-line frequency-dependent decay — the structure that lets decay time be set per band instead of emerging from a fixed impulse.

Faust's [`reverbs.lib`](https://faustlibraries.grame.fr/libs/reverbs/) implements fifteen of these in a readable few lines each and is the fastest way to see how they differ. It is LGPL-with-exception, so it is a reading, not a source of code.

What this would settle: the rack's `makePlate`, `makeSpring` and `makeShimmer` are all convolution over a synthesised impulse, which fixes decay and diffusion at impulse-generation time. Any of the topologies above builds from `DelayNode`, `BiquadFilterNode` and `GainNode`, renders offline unchanged, and exposes decay as a parameter that can move during a piece.

## 3. Dynamic range compression

**Dimitrios Giannoulis, Michael Massberg and Joshua D. Reiss, "Digital Dynamic Range Compressor Design — A Tutorial and Analysis", JAES 60(6), pp. 399–408, July 2012.** <https://aes2.org/publications/elibrary-page/?id=16354>

The paper that compares the design space rather than presenting one compressor: peak against RMS detection, feed-forward against feedback, linear against log-domain level detection, and the placement of the smoothing detector relative to the gain computer. Its conclusion is specific enough to build from — feed-forward, with the detector in the log domain *after* the gain computer, which yields a smooth envelope, no attack lag, and a knee whose width is a free parameter.

What this would settle: `dsp/master.js` records that `node-web-audio-api`'s `DynamicsCompressorNode` does not limit, and `dsp/masterbus.js` keeps one out of the chain for that reason. A compressor written from this paper is deterministic, identical in both runtimes, and measurable — which turns a documented divergence into a non-issue.

The same authors' 2013 follow-up on parameter automation is a different paper — automation of an existing compressor, not its design — and is free from Reiss's own publication list at <https://webspace.eecs.qmul.ac.uk/joshua.reiss/>.

## 4. Virtual-analog filters

**Vadim Zavalishin, *The Art of VA Filter Design*, rev. 2.1.2, February 2020.** Published free by Native Instruments. The NI download path has moved; live copies sit at <https://www.discodsp.net/VAFilterDesign_2.1.2.pdf> and <https://archive.org/details/the-art-of-va-filter-design-rev.-2.1.2>.

The book on the topology-preserving transform, also called zero-delay feedback: analogue one-pole filters, time discretisation, state-variable and ladder structures, nonlinearities, and state-space form. The TPT ladder is four cascaded TPT one-poles with the feedback path resolved rather than delayed, which is what stops a resonant ladder from detuning as cutoff moves.

The copyright holder grants free copying of the book so long as it is copied whole and unmodified, so it can travel with an instrument that cites it.

Will Pirkle's application notes cover the same ground from a different angle and are free: <http://www.willpirkle.com/Downloads/>.

What this would settle: `dsp/ladder-worklet.js` gets a citation, and the worklet's native-node fallback gets a stated reason for how far it diverges.

## 5. Loudness

**ITU-R BS.1770-4, "Algorithms to measure audio programme loudness and true-peak audio level".** Free from the ITU at <https://www.itu.int/rec/R-REC-BS.1770>.

Defines K-weighting as a high-shelf followed by a high-pass, both with printed coefficients; mean-square per channel; a channel-weighted sum; and true-peak by 4× oversampling. The gating that makes an integrated figure stable — an absolute gate at −70 LUFS and a relative gate 10 LU below the ungated mean — is part of the same recommendation.

**EBU R 128** sets the delivery target and **EBU Tech 3341 / 3342** define momentary, short-term and loudness range. <https://tech.ebu.ch/docs/r/r128.pdf>

[libebur128](https://github.com/jiixyj/libebur128) (C, MIT) is the implementation others are checked against; [pyloudnorm](https://pypi.org/project/pyloudnorm/) (MIT) is a convenient second opinion on a rendered WAV.

What this would settle: `core/metrics.js` reports peak, RMS, DC, width, centroid and band energies, and no loudness at all. Two renders can currently be compared for peak and crest but not for how loud they are.

## 6. Rhythm

**Godfried Toussaint, "The Euclidean Algorithm Generates Traditional Musical Rhythms", Banff 2005.** Free at <https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf>.

Distributes *k* onsets as evenly as possible over *n* steps, and the results coincide with rhythms that already exist — E(3,8) is the tresillo, E(5,8) the cinquillo, and the paper works through Cuban, Persian, South African and Turkish cases. The underlying algorithm is Bjorklund's, from a 2003 paper on spallation-neutron-source timing; the connection to Euclid's GCD is real, and the name came second.

**Toussaint, "The Distance Geometry of Music"** (<https://arxiv.org/pdf/0705.4085>) is the longer treatment, and **"On the Euclidean Algorithm: Rhythm Without Recursion"** (<https://arxiv.org/pdf/2206.12421>) gives a non-recursive construction that is easier to read than Bjorklund's original.

The papers are clear that some Indian talas fall outside what the algorithm generates, which is where `world_forms/carnatic_tala.md` continues rather than repeats.

## 7. Physical modelling

**Kevin Karplus and Alex Strong, "Digital Synthesis of Plucked-String and Drum Timbres", Computer Music Journal 7(2), 1983.** The delay line and one-zero averaging filter that everything else in this section extends.

**Julius O. Smith III, *Physical Audio Signal Processing*.** Free online at <https://ccrma.stanford.edu/~jos/pasp/>. Delay lines, digital waveguides, virtual analogue and physical models, with the derivations.

**The Synthesis ToolKit**, Perry Cook and Gary Scavone, <https://github.com/thestk/stk>. C++, under an MIT-like licence that adds a non-binding request to send modifications upstream. The `BandedWG` class models bowed bars, glasses and bowls; `Modal` covers struck resonators. Both are the shortest route to understanding what `world_forms/steel_pan.md`, `gamelan.md` and `andean_siku.md` describe physically.

**faust-stk**, <https://ccrma.stanford.edu/~rmichon/publications/doc/DAFx11-Faust-STK.pdf>, ports the STK models to Faust and prints them compactly.

### 7.1 The patent question

Digital waveguide synthesis was patented by Stanford — US 4,984,276, "Digital signal processing using waveguide networks", Julius O. Smith III, filed 27 September 1989, granted 8 January 1991. A patent in force in June 1995 ran for the longer of seventeen years from grant or twenty from filing, which puts expiry around September 2009. Related patents in the family — US 5,212,334, 5,448,010, 5,466,884, 5,528,726, 5,614,686 — were filed through the mid-1990s and follow the same twenty-year arithmetic.

That arithmetic is not a clearance. It has not been checked against USPTO status, maintenance-fee records, or any non-US family member, and this is not legal advice. It is recorded because STK's own documentation flags the question, and because `RIGHTS.md` treats an open question as open rather than settled.

## 8. Tuning file formats

**The Scala `.scl` and `.kbm` specifications**, Manuel Op de Coul, <https://www.huygens-fokker.org/scala/scl_format.html>.

`.scl` in full: `!` begins a comment line; the first non-comment line is a free-text description; the second is the count of pitches; each remaining line is one pitch, read as cents if it contains a period and as a ratio otherwise, with a bare integer meaning that integer over one. Numerators and denominators run to 2,147,483,647; negative ratios are an error; trailing text on a pitch line is ignored. **The 1/1 is implicit and absent from the file.**

`.kbm` maps scale degrees onto MIDI note numbers, with a reference note and reference frequency, so that a scale and its placement on a keyboard are separable.

The scale archive is version 94, March 2026, roughly 5,350 files, and states no licence — see `pantry/CANDIDATES.md`.

## 9. Scheduling

**Chris Wilson, "A Tale of Two Clocks — Scheduling Web Audio with Precision".** <https://web.dev/articles/audio-scheduling>

The `setTimeout` clock is accurate to the millisecond and skews by ten or more under layout, rendering, garbage collection and network work; the `AudioContext` clock is sample-accurate but cannot run arbitrary code. Combining them — a coarse timer that wakes periodically and schedules everything falling inside a lookahead window against the audio clock — is the pattern the API was designed around, by one of the specification's editors.

`core/scheduler.js` already implements this, with `LOOKAHEAD` at 0.12 s and `TICK_MS` at 25. The citation is what is missing, and this is it.

## 10. Equalisation

**Robert Bristow-Johnson, "Cookbook formulae for audio equalizer biquad filter coefficients".** Maintained by the W3C Audio Working Group at <https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html>, with a mirror at <https://www.musicdsp.org/en/latest/Filters/197-rbj-audio-eq-cookbook.html>.

The same formulae Web Audio's `BiquadFilterNode` is specified against. `audio_eq_biquads.md` already names this as the provenance behind the filters in `dsp/fx.js`; it is repeated here so this page is a complete list rather than a partial one.

## 11. Access status

| Source | Access |
|---|---|
| Dattorro 1997 | Free from the author at CCRMA |
| Schroeder 1962, Jot & Chaigne 1991 | AES E-Library, paywalled; widely summarised |
| Giannoulis et al. 2012 | **AES E-Library, $33 for non-members**, free to members. No open-access edition found |
| Giannoulis et al. 2013 (automation) | Free from Reiss's QMUL page. Note that host serves an incomplete certificate chain, so some fetchers fail where a browser succeeds |
| Zavalishin, *VA Filter Design* | Free, and redistributable whole and unmodified |
| ITU-R BS.1770-4 | Free from the ITU |
| EBU R 128, Tech 3341/3342 | Free from the EBU |
| Toussaint 2005 and later | Free from McGill and arXiv |
| Karplus & Strong 1983 | CMJ, paywalled; the algorithm is described everywhere |
| Smith, *Physical Audio Signal Processing* | Free online at CCRMA |
| STK, faust-stk | Free; STK is MIT-like |
| Scala format spec | Free |
| Wilson, "A Tale of Two Clocks" | Free on web.dev |
| RBJ EQ cookbook | Free, W3C Audio WG |

Several `.edu` and vendor hosts — CCRMA, Native Instruments, KVR — return HTTP 403 to automated fetchers while loading normally in a browser. A 403 from one of those is not a dead link.

## 12. What is not free, and what to do about it

Giannoulis et al. 2012 is the one entry here behind a real paywall that no free equivalent replaces. The design it recommends is described in enough secondary literature to implement, but a digest written from a summary is a digest with a weaker citation, and `RESEARCH.md` is explicit that a source read is different from a source cited from memory. Either the paper gets bought, or the digest says plainly which of its claims came from the paper and which from elsewhere.
