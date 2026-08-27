# Engine Audit — cyber_synth vs. Dubstep Requirements

Maps the dubstep DSP requirements (see [00_index.md](00_index.md) gap list) against the current `cyber/` engine. Verdicts: **HAVE** / **PARTIAL** / **MISSING**.

There is already a `dubstep` genre preset (`cyber/genres.js`): 140 BPM, `halfTime` drums, phrygian/andalusian, `reese` bass with the wobble engaged, gated reverb, diode drive, bitcrush, multiband glue, and an FFT-balanced channel mix. So the genre boots today — this audit is about how close it gets to *modern* (brostep / riddim / tearout) dubstep and what's worth adding.

## Scorecard

| Requirement | Verdict | Where |
|---|---|---|
| 140 BPM half-time drums | **HAVE** | `genres.js` dubstep + `patterns.js halfTime()` |
| Kick (layered sub+click), snare, hats | **HAVE** | `voices.js kick/snare/hat`; tuned per genre |
| Tempo-synced wobble LFO on bass filter | **HAVE** | `engine.js _applyWobble`, `wobbleHz`, `bass.wobble{sync,depth,base,shape}` |
| Sub bass (mono sine) | **HAVE** | `voices.js subBass`; `bass.sub` layer on acid/reese |
| Reese bass (detuned saws) | **HAVE** | `voices.js reeseBass` (3 saws) |
| FM / audio-rate growl | **HAVE** | `voices.js fmBass` (2-op + soft-clip) |
| Resonant ladder filter w/ growl | **HAVE** | `ladder-worklet.js` (cubic soft-clip feedback) |
| LP / HP / BP filter types on bass | **HAVE** | `bass.filterType`, `buildFilter` |
| Sidechain pump (kick-keyed) | **HAVE** | `config.sidechain`, `fx.makeSidechain` |
| Ghost pump + trance gate | **HAVE** | `config.pump`, `config.gate` |
| Mod matrix (LFO / S&H / slewed S&H / kick-env → any param) | **HAVE** | `engine.js` routes, `fx.makeModMatrix` |
| Drive palette (tanh/clip/diode), wavefolder, bitcrush, ringmod | **HAVE** | `config.drive/fold/bitcrush/ringmod` |
| Tempo-synced ping-pong dub-delay (filtered feedback, tape sat) | **HAVE** | `config.delay`, `fx` delay |
| Reverb incl. gated (snare) / reverse / freeze | **HAVE** | `config.reverb.mode` |
| Mastering EQ + multiband + brickwall limiter + headroom trim | **HAVE** | `config.eq/mbc/limiter/master`; dubstep `master.volume 0.37` leaves pre-limiter headroom |
| Arrangement Markov: intro/build/**drop**/peak/breakdown/outro + filter sweep | **HAVE** | `config.arrangement`, `cutoffByState` |
| Riser / uplift FX | **HAVE** | `EXTRA_VOICES.riser` |
| Per-strip parametric EQ + mono-friendly HP on bass | **HAVE** | `fx.makeChannelEq`; dubstep bass HP@55 |
| **Formant / "talking" bass** (vowel filter on the bass chain) | **PARTIAL** | `formantVox` exists but is a *choir* voice, not a bass-chain option |
| **Wavetable-position morph** (Serum/Vital core growl) | **MISSING** | only saw/square/sine/`PeriodicWave`(hoover); no scannable wavetable |
| **Rhythmic / patterned wobble** (LFO rate or shape varying per step within a bar) | **MISSING** | wobble is one fixed `sync` rate + one native shape per section |
| **Custom LFO shapes** (multi-step designer shapes) | **PARTIAL** | LFO limited to native sine/tri/saw/square (`oscType`) |
| **OTT / upward compression** | **PARTIAL** | `mbc` is downward-only; no upward expansion for the "slammed" mid |
| **Pitch-dive / sub-drop / impact / downlifter** transition FX | **MISSING** | riser only; no downlifter, impact, sub-drop, or "drop dive" pitch automation |
| Reese phase/detune movement over time | **PARTIAL** | reese saws are static; no slow evolving detune/phase |

## What actually matters (ranked)

The engine covers the **classic / Knife-Party wobble** end of dubstep well today. To reach **modern brostep / riddim / tearout**, in priority order:

1. **Patterned wobble** — let `bass.wobble` take a per-step rhythm (a 16-step rate or on/off pattern) instead of one fixed `sync`. This is the single biggest "sounds like dubstep" lever and rides entirely on existing wiring (`_applyWobble` already retargets the LFO live). *Low effort, high payoff.*
2. **Talking/formant bass** — expose the existing formant bandpass bank as a bass-chain insert (vowel sweep driven by an LFO/S&H), giving the riddim "wob–wob–talk" character. *Reuses `formantVox` filters.*
3. **OTT / upward compression** — add upward makeup to `mbc` (or a dedicated 3-band OTT) for the slammed mid-bass timbre. *Medium effort.*
4. **Transition FX kit** — a `downlifter`, `impact`, and `subDrop` to sit alongside `riser`, plus a pitch-dive automation on the drop entry and the deliberate pre-drop silence gap. *Medium effort; arrangement already has the state machine to fire them.*
5. **Wavetable oscillator** — the authentic growl source. *High effort; the FM-bass + ladder cubic clip is a serviceable stand-in, so this is optional.*

Resampling (bounce→re-pitch→re-process) is intentionally **out of scope** — this is a generative real-time engine, not sample-based; the equivalent here is layering voices + the mod matrix.

## Bottom line

Nothing structural is missing — the role table, mod matrix, FX bus, and arrangement Markov already express dubstep. The gaps are **expressiveness within the bass** (patterned wobble, formant talk, wavetable) and a **fuller transition-FX kit**. Items 1–2 are small, additive, and reuse existing nodes; 3–4 are modest; 5 is the only large build and is optional.
