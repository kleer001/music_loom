# Web Audio and music code outside this repo

A survey of JavaScript, TypeScript and Web Audio code that a daughter instrument could draw on, read against what the rack already holds. Licences and versions were checked at the registry and in-repo rather than recalled; section 14 records what was checked and how.

This is not a reading list. `learning_resources.md` is that. This one answers a narrower question: for a capability the studio does not have, is there code worth taking, and on what terms.

## 1. What the rack already covers

`rack/R2-core/core/` holds eleven modules: FFT and spectra, seeded RNG, WAV and AIFF codecs, resampling, scales and modes, chord and progression helpers, a step scheduler, measurement statistics.

`rack/R5-fx/dsp/` holds twenty-nine effect and bus builders — filters, delays, three reverbs, drive and fold and fuzz, chorus, flanger, phaser, ring modulation, multiband compression, sidechain, a dub mixer, a master bus — plus three worklets that degrade to native nodes.

`rack/R6-voices/voices/` holds forty-one fire-and-forget voices, a persistent-graph set, a sampler pair, wavetables and patch loading.

`rack/R3-measure/` renders offline through `OfflineAudioContext` and prints numbers.

Against that, the survey below is about the edges.

## 2. Three gaps this survey found

### 2.1 Loudness

Nothing in the studio computes loudness. `core/metrics.js` reports peak, RMS in dB, DC offset, stereo width, spectral centroid and three band energies; `dsp/masterbus.js` adds crest factor and true peak. There is no K-weighting and no gated integration anywhere, so two renders can be compared for peak and crest but not for how loud they are.

This matters more here than it would elsewhere. `dsp/master.js` records that `DynamicsCompressorNode` under-limits under `node-web-audio-api`, and `dsp/masterbus.js` keeps one out of the chain for that reason. A loudness figure is the measurement that would make the browser-versus-offline difference a number rather than a caveat.

### 2.2 Tuning

`core/music.js` line 22 is `centsToRatio`, and it is the entire microtonal surface of the studio. `core/scales.js` holds twelve modes as semitone-offset arrays, all of them subsets of 12-TET.

Fifteen of the twenty-six traditions in `world_forms/` describe a pitch system that will not fit that — Javanese slendro and pelog, the quarter-tones of Arabic maqam, the Holdrian commas and 53-tone frame of Turkish makam, Persian koron and sori, Pythagorean thirds in medieval polyphony, the harmonic series in Tuvan overtone singing, the inharmonic partials of a steel pan. `raga.md` section 1 states it plainly: not primarily a tuning problem, but not 12-TET either.

### 2.3 Rhythm

There is no Euclidean or additive rhythm generator. `core/scheduler.js` is a step scheduler with a single linear swing parameter and no citation, because there was nothing to cite. `world_forms/west_african_timelines.md`, `balkan_aksak.md`, `flamenco_compas.md` and `carnatic_tala.md` all describe cycles it cannot express.

## 3. The four verdicts

**Write from spec.** The algorithm is published, the implementation is small, and writing it keeps the studio at zero runtime dependencies. A reference implementation gets read for cross-checking, not copied.

**Vendor a file.** A single permissively-licensed module, copied with a `// Source:` stamp, the way `dsp/fx.js` and the three worklets already arrived. Not a dependency — a file.

**Read-only reference.** The licence forbids taking the code into an MIT project, or the language is wrong, but the design is worth understanding.

**Not this stack.** A framework, a copyleft licence, or a capability nothing here needs.

The distinction that keeps coming up: a *runtime* dependency changes what a daughter ships and how it loads in a browser. A *development* dependency does not — `rack/checks/` already carries `node-web-audio-api` and nothing about that is unusual. Most of what follows is about the first kind.

## 4. Tuning and scale

### 4.1 The Scala file formats

`.scl` describes a scale; `.kbm` maps it onto a keyboard. The `.scl` format is small enough to read in an afternoon: lines beginning with `!` are comments and ignored; the first non-comment line is a free-text description; the second is an integer count of the pitches that follow; each remaining line is one pitch. A pitch containing a period is a cents value, anything else is a ratio, and a bare integer means that integer over one. **The 1/1 is implicit and does not appear in the file** — the commonest way to get a scale wrong by one degree.

Spec: <https://www.huygens-fokker.org/scala/scl_format.html>

### 4.2 The scale archive

Version 94, dated March 2026, roughly 5,350 scale files, freely downloadable as `scales.zip` from <https://www.huygens-fokker.org/scala/downloads.html>. A mirror sits at <https://github.com/narenratan/scala_scale_archive>.

The archive states no licence. It is offered for free download and has been redistributed widely for two decades, but "freely downloadable" is not a grant, and `RIGHTS.md` treats an absent licence as unresolved rather than permissive. Reading a scale to check an implementation is a different act from shipping five thousand of them.

### 4.3 The xenharmonic-devs ecosystem

The most active body of microtonal code in TypeScript, all MIT:

| Package | What it is |
|---|---|
| `sonic-weave` 0.14.1 | A DSL for frequency, ratio and equal-temperament manipulation. Runtime deps: `moment-of-symmetry`, `xen-dev-utils` |
| `xen-dev-utils` | The arithmetic underneath — cents, ratios, approximation |
| `temperaments` | Regular temperament mappings |
| `moment-of-symmetry` | MOS scale generation |
| `harmonic-entropy` | Interval consonance as a number |
| `ji-lattice` | Just-intonation lattice projection, for drawing |
| `aperiodic-oscillator` | A non-periodic replacement for `OscillatorNode` |
| `xen-midi` | Free-pitch polyphonic MIDI via multi-channel pitch bend |

Org: <https://github.com/xenharmonic-devs>. Scale Workshop, the application on top, is at <https://github.com/xenharmonic-devs/scale-workshop>.

`aperiodic-oscillator` and `xen-midi` are the two that would be doing something the rack cannot already do; the rest is arithmetic that a `core/tuning.js` would duplicate in far less code than three packages and their transitive tree.

### 4.4 tonal

`tonal` 6.4.3, MIT, at <https://github.com/tonaljs/tonal>. Pure functions over notes, intervals, chords, scales, modes and keys, published as roughly twenty small packages under one umbrella.

It is well-made and 12-TET throughout, which puts it on the wrong side of section 2.2. `core/scales.js` and `core/music.js` already cover what a daughter has needed from that space.

### 4.5 Tune.js

A JavaScript library that brings the Scala archive to Web Audio, described in a Georgia Tech paper by Benjamin Taylor: <https://repository.gatech.edu/server/api/core/bitstreams/83281242-6b5a-4d44-bb21-05259533dc54/content>. Its licence was not verified in this survey.

### 4.6 Verdict

**Write from spec.** A `core/tuning.js` that parses `.scl` and `.kbm`, converts cents and ratios to frequency ratios, and produces a per-degree table is a small module, and it is the piece the world-forms shelf has been waiting on. Cross-check the parse against `xen-dev-utils`; read `sonic-weave` for how it models an interval.

The Surge synthesiser's `tuning-library` is the most-tested C++ implementation and is GPL — **read-only reference**, and the Go port at <https://github.com/chinenual/go-scala> is a more legible read of the same semantics.

## 5. Rhythm

Toussaint's 2005 paper *The Euclidean Algorithm Generates Traditional Musical Rhythms* is the source: <https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf>. It distributes *k* onsets as evenly as possible across *n* steps using Bjorklund's algorithm, and the results land on rhythms that already exist — E(3,8) is the Cuban tresillo, E(5,8) the cinquillo, and the paper works through Persian, South African and Turkish cases.

The paper is honest about the limit, and so is the name: the connection to Euclid's GCD is real but the algorithm is Bjorklund's, and some Indian talas are outside what it generates. That limit is exactly where `world_forms/carnatic_tala.md` picks up, so the two are complements rather than one covering the other.

**Verdict: write from spec.** Bjorklund is around forty lines. The additive-cycle helper that `balkan_aksak.md` and `flamenco_compas.md` want is arithmetic on a list of group lengths and is smaller still.

## 6. Loudness metering

ITU-R BS.1770-4 defines K-weighting — a high-shelf plus a high-pass — followed by mean-square per channel, a channel-weighted sum, and a two-stage gate at −70 LUFS absolute and −10 LU relative. EBU R 128 sets the target and EBU Tech 3341 and 3342 define momentary, short-term and loudness range on top.

| Implementation | Language | Licence | Note |
|---|---|---|---|
| [libebur128](https://github.com/jiixyj/libebur128) | C | MIT (verified in-repo) | The reference other implementations are checked against |
| [@domchristie/needles](https://github.com/domchristie/needles) | JS | MIT | Version 0.0.2-1 — early, and browser-oriented |
| [pyloudnorm](https://pypi.org/project/pyloudnorm/) | Python | MIT | Useful as a second opinion on a rendered WAV |
| [audiojs/loudness](https://github.com/audiojs/loudness) | JS | — | Umbrella for BS.1770 LUFS, true peak, LRA, ReplayGain |

**Verdict: write from spec into `R3-measure`.** The filters are two biquads whose coefficients the standard prints, the gating is a mean over a windowed list, and `core/metrics.js` already owns the one implementation that both the render CLI and the regression harness measure through. Adding a package would put a second implementation next to it.

Cross-check the result against `pyloudnorm` on the same WAV before believing it. A measurement harness that has not been checked against a known signal is a theory, and the studio has had that turn out wrong before.

## 7. Pitch and feature analysis

| Package | Version | Licence | Runtime deps | Note |
|---|---|---|---|---|
| [pitchy](https://github.com/ianprime0509/pitchy) | 4.1.0 | MIT | `fft.js` | McLeod Pitch Method; pure ES module since v4 |
| [pitchfinder](https://github.com/peterkhayes/pitchfinder) | — | MIT | — | YIN, AMDF, dynamic wavelet, macleod |
| [Meyda](https://github.com/meyda/meyda) | 5.6.3 | MIT | `dct`, `fftjs`, `wav`, `node-getopt` | Broad feature set, offline and real-time |
| essentia.js | — | AGPL-3.0 | — | Large and capable; the licence rules it out |
| aubio | — | GPL-3.0 | — | Same |

`pitchy`'s single dependency is an FFT, and `core/dsp.js` already exports one. Vendoring the McLeod normalised-square-difference function against the local FFT is a smaller change than adding the package.

What this would buy: a measurement that can say whether an instrument built from `maqam_arabic.md` or `raga.md` actually lands within *n* cents of its intended degrees. Right now nothing in `R3-measure` can check pitch at all, so a tuning claim is unfalsifiable in the harness.

**Verdict: vendor a file** — the MPM core, wired to `core/dsp.js`. Meyda is **not this stack** while `core/dsp.js` covers centroid and band energy.

## 8. MIDI

| Package | Version | Licence | Deps | Note |
|---|---|---|---|---|
| [midi-file](https://github.com/carter-thaxton/midi-file) | 1.2.4 | MIT | none | Parses and writes SMF; arrays rather than strings |
| [@tonejs/midi](https://github.com/Tonejs/Midi) | — | MIT | `midi-file` | A friendlier object model over the same parser |
| [midi-parser-js](https://github.com/colxi/midi-parser-js) | 4.0.4 | **GPL** | none | Frequently described as the light dependency-free option; the licence is the thing to check, not the dependency count |

The studio already has a partial parser. `pantry/tools/midi_to_motif.js` reads a Standard MIDI File to pull a melodic skeleton out of the public-domain tunes in `pantry/midi/`, and it is a one-way offline tool with no writer.

**Verdict: write from spec, reusing what is here.** Promoting that parser into a `core/midi.js` with a writer alongside it costs less than a dependency and makes the ten tunes in the pantry addressable from an instrument rather than from a script. `midi-file` is the **read-only reference** for the parts the existing tool skips — running status, tempo maps, meta events.

### 8.1 Web MIDI

Chromium desktop and mobile, Samsung Internet and Firefox 108+ ship it; Safari on macOS and iOS do not, and neither does Firefox for Android. Global support sits near 78 per cent, and WebKit has declined to ship it over fingerprinting for years with no published roadmap. Support table: <https://caniuse.com/midi>.

The offline consequence matters more here than the browser one. `OfflineAudioContext` has no MIDI access, exactly as it has no `audioWorklet` — so a graph that requires live MIDI cannot render headlessly, and the measurement harness goes with it. The pattern that already works for worklets works here: an optional input path, with the same graph reachable from a stored sequence.

## 9. Samplers and instrument formats

[smplr](https://github.com/danigb/smplr) is MIT and covers Soundfont, SoundFont2 from `.sf2` directly, SFZ-style presets, drum machines including a large classic-machine collection, several pianos and electric pianos, mallets, and VCSL. Its SF2 path needs the separate `soundfont2` package. Related: [soundfont-player](https://github.com/danigb/soundfont-player), [sf2-parser](https://github.com/colinbdclark/sf2-parser), and the index at [awesome-soundfonts](https://github.com/ad-si/awesome-soundfonts).

`R6-voices` already has `Sampler`, `SampleSet` and `StrokeSet` reading `pantry/acoustic/manifest.json`, with loop points from the RIFF `smpl` chunk. What it does not have is any notion of General MIDI, `.sf2`, or SFZ region mapping.

**Verdict: not yet.** No instrument built here has wanted a General MIDI bank; the pantry is a small curated set, not a bank. If one does, smplr is the thing to read first, and the SFZ region model is the piece worth borrowing rather than the loader.

## 10. Effects, filters and reverberation

Faust's [`reverbs.lib`](https://faustlibraries.grame.fr/libs/reverbs/) is the densest single catalogue of reverb topologies in a readable form — fifteen algorithms including Schroeder's `jcrev` and `satrev`, `mono_freeverb` and `stereo_freeverb`, a plain FDN, `zita_rev1` in stereo and ambisonic modes, `dattorro_rev`, `jpverb` and `greyhole`, a Keith Barr FV-1 allpass loop, and a spring model.

It is **LGPL with an exception** — readable, not copyable into an MIT repo. The `freeverb.dsp` in older Faust distributions was BSD, which is the one piece with different terms.

The rack's three reverbs — `makePlate`, `makeSpring`, `makeShimmer` — are all `ConvolverNode` over a synthesised impulse from `core/dsp.js`. That gives a plausible tail and no handle on it: decay, density and diffusion are baked into the impulse at generation time and cannot be modulated during a render. An allpass-and-delay topology built from native Web Audio nodes would give per-parameter control and would render offline unchanged, which convolution also does.

**Verdict: digest, then a native-node FDN.** Section 2 of `dsp_source_texts.md` lists the primary sources.

One thing already learned here belongs beside any of that: `ConvolverNode.normalize` at its default rescales the impulse by its own energy, so a return fader tracks decay time instead of level. Normalising the impulse to unit energy and setting `normalize = false` separates the two.

## 11. Time-stretch and pitch-shift

[SoundTouchJS](https://github.com/cutterbl/SoundTouchJS) is a port of Olli Parviainen's SoundTouch, relicensed from LGPL to **MPL-2.0**, with WSOLA and a newer FFT-based phase-vocoder stage, and runtime-tunable sequence, seek-window and overlap parameters. [Kali](https://github.com/Infinity/Kali) is a smaller JavaScript time-stretcher.

MPL-2.0 is file-level copyleft: a vendored file stays MPL and its modifications must be published, which is compatible with shipping but not with the flat MIT the studio has been.

`dsp/phase-vocoder-worklet.js` already exists and `makeBestPitchShifter` already chooses between it and a native fallback.

**Verdict: not this stack.**

## 12. Pattern languages and frameworks

[Tone.js](https://github.com/Tonejs/Tone.js) is MIT and is the most-used Web Audio library there is. It is also a framework — a transport, a signal graph abstraction, its own scheduling and its own instrument classes — and adopting it would mean the daughters run on it rather than on Web Audio. That is a different studio, not an addition to this one.

[Strudel](https://codeberg.org/uzu/strudel) is the official JavaScript port of the TidalCycles pattern language, by Felix Roos and Alex McLean, **AGPL-3.0**. TidalCycles itself is GPL-3.0. The licence puts the code out of reach, but the pattern algebra — patterns as functions of time, composed by `fast`, `slow`, `stack`, `euclid`, degradation — is a genuinely different model from a step sequencer and is the strongest candidate on this page for a digest with no code attached.

**Verdict: not this stack**, and a pattern-algebra digest is the part worth having.

## 13. Notation

[VexFlow](https://github.com/vexflow/vexflow) (MIT, TypeScript, SVG and Canvas) and [abcjs](https://www.abcjs.net/) (MIT, ABC notation with its own renderer and audio) are both mature and both solve a problem no instrument here has had. `world_forms/` includes traditions that are notated — gagaku, medieval polyphony, mensuration canon — so this could become real, but it has not yet.

**Verdict: not yet.**

## 14. The build-step question

Nothing in sections 4 through 8 needs a bundler. The cases where a build step would buy something, and what it actually costs:

| Want | What it really costs |
|---|---|
| Use `sonic-weave` or `xen-dev-utils` rather than writing `core/tuning.js` | They ship ESM `dist/`, loadable in a browser through an **import map** with no bundler. The cost is a `node_modules` in every daughter and a transitive tree, not a build |
| WASM DSP — Glicol, essentia.js, a compiled Faust unit | No build step as such, but a binary artifact per instrument and `OfflineAudioContext` compatibility to prove before the measurement harness can see it |
| TypeScript across the studio | This is the one that is actually a build step, and it lands on every daughter and on `scripts/new_instrument.py` |

Import maps are the quiet answer to most of it. They are baseline in current browsers and turn "add a dependency" into "add a path", which keeps the no-bundler property while giving up the zero-`node_modules` one.

## 15. Licences and versions, as checked

Registry fields read with `npm view <pkg> version license dependencies`; repository licences read from the repository. Checked while compiling this survey.

| Item | Version | Licence | Verdict |
|---|---|---|---|
| `midi-file` | 1.2.4 | MIT | Read-only reference |
| `midi-parser-js` | 4.0.4 | GPL | Not this stack |
| `pitchy` | 4.1.0 | MIT (one dep, `fft.js`) | Vendor a file |
| `meyda` | 5.6.3 | MIT (four deps) | Not this stack |
| `tonal` | 6.4.3 | MIT | Not this stack — 12-TET |
| `@domchristie/needles` | 0.0.2-1 | MIT | Read-only reference |
| `sonic-weave` | 0.14.1 | MIT | Read-only reference |
| `xen-dev-utils` | — | MIT | Read-only reference |
| `scale-workshop` | — | MIT | Read-only reference |
| `smplr` | — | MIT | Read-only reference |
| `libebur128` | — | MIT | Read-only reference |
| STK | — | MIT-like, with a request to send modifications upstream | Read-only reference |
| Faust `reverbs.lib` | — | LGPL with exception | Read-only reference |
| SoundTouchJS | — | MPL-2.0 | Not this stack |
| Tone.js | — | MIT | Not this stack — framework |
| Strudel | — | AGPL-3.0 | Not this stack |
| TidalCycles | — | GPL-3.0 | Not this stack |
| essentia.js | — | AGPL-3.0 | Not this stack |
| aubio | — | GPL-3.0 | Not this stack |
| VexFlow, abcjs | — | MIT | Not yet |
| Scala scale archive | v94, Mar 2026 | **None stated** | Unresolved — see `pantry/CANDIDATES.md` |

A licence read once is a licence as of that reading. Anything that gets vendored earns a row in `pantry/PROVENANCE.md` or a `// Source:` stamp, with the date it was checked.

## 16. What this survey did not reach

Spatial audio — ambisonics, binaural, HRTF — beyond the `PannerNode` the rack does not use. MPE and per-note expression, which is where Section 4.3's `xen-midi` would matter. OSC. Interchange with DAW project formats. Neural synthesis and DDSP-style models. WebCodecs and browser-side encoding to anything other than WAV. Mobile and iOS audio behaviour, which differs from desktop in ways that would bite an instrument published to the open web.
