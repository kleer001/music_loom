# R2 — the shared core

**Copy `core/` into the instrument.** Add `node-web-audio-api` as a devDependency if the instrument will render offline (see R3).

```sh
cp -r <music_loom>/rack/R2-core/core <instrument>/core
```

Eleven modules, no dependencies, no build step. They run unchanged in the browser and in Node, which is what lets the same graph be auditioned live and rendered headlessly.

This is not a hypothetical library. Most of it already appears byte-identical in more than one instrument built here — which is the reason the studio exists.

## What is in it

| Module | Holds |
|---|---|
| `rng.js` | `mulberry32`, `makeRng` — seeded RNG. One stream per layer. |
| `music.js` | `MODES`, `PROGRESSIONS`, `degreeToMidi`, `chordTones`, `midiToFreq`, `centsToRatio`, `voiceUnder` |
| `dsp.js` | FFT and `magnitude`; saturation curves (`sat`, `fold`, `clip`, `bit`, `diode`); seeded `whiteNoise`/`pinkNoise`; `impulse` and `springImpulse` reverb tails; pitch-shift ramp helpers |
| `metrics.js` | `stats` (peak, RMS dB, DC, stereo width dB), `spectrum` (centroid + lo/mid/hi band energy) |
| `wav.js` | `encodeWav`, `decodeWav`, `toMono` — 8/16/24/32-bit and float PCM |
| `aiff.js` | AIFF decode, for sample libraries that ship it |
| `audio.js` | `decodeAudio`, `resample`, `toAudioBuffer` — the seam a recording comes in through |
| `scheduler.js` | `StepScheduler` — sixteenth-grid lookahead clock, 25 ms tick, 120 ms lookahead |
| `math.js` | `clamp01`, `lerp`, `pearson`, `cosineSim`, `round` (half to even), `mod` (non-negative) |
| `scales.js` | `MODES`, `midiOf`, `nameOf`, `pitchClass`, `pitches`, `dronePitches` — note names and spans |
| `merge.js` | `mergeConfig`, `sparseDiff` — deep merge where only base keys survive |

## How it has been used

**A seed per layer.** Four independent streams — plan, timbre, notes, impulses — so retuning one does not reshuffle the others. On a single shared stream every edit is a full reroll, and two renders stop being comparable.

**Impulses seeded too.** `impulse` and `springImpulse` take a seed, so the same reverb tail comes back every run. Unseeded, renders differ for no musical reason and byte-identity goes with them.

**Scale degrees over MIDI numbers.** `degreeToMidi(root, mode, degree)` resolves at play time. Sequences written in degrees retune when key or mode changes; sequences written in absolute pitch do not, and converting them afterwards is a rewrite.

**Config as a merge chain.** `DEFAULT_CONFIG` → sparse override → sparse override. `mergeConfig` keeps only keys present in the base, so an override with a typo cannot silently introduce a parameter nothing reads.

**One measurement implementation.** `metrics.js` is what the render CLI prints *and* what a regression test asserts on. Two implementations drift, and then a passing test and a printed number disagree about the same audio.

**`spectrum` reads the buffer midpoint at 16k FFT.** Large window for clean harmonic separation, midpoint to skip the attack and the tail. Another window can be passed; a note beside the call says why it was.

**`music.js` and `scales.js` both export `MODES` and `NOTE_NAMES`.** One set of numbers under two vocabularies: `scales.js` holds the intervals and the note-name parsing, and `music.js` names a working subset of them the way its own callers do, so `MODES.aeolian` and `MODES["minor"]` are the same array. Both files still export both names, so either import path works; importing both under one identifier still collides, and an instrument that wants both aliases one. `pitchClass` is the trap in the pair — `music.js` takes a MIDI number, `scales.js` takes a note name.

**`audio.js` is where a recording enters.** `decodeAudio` sniffs WAV or AIFF, `resample` converts, `toAudioBuffer` hands the result to a context. The pantry has material at 22050 Hz and material at 48000 Hz; a buffer given to an `AudioContext` at the wrong rate plays at the wrong pitch and length.

## Divergence

A module improved inside an instrument can come back through `please_add_me.md`. A copy that quietly diverges is how two instruments end up with the same function computing different numbers.
