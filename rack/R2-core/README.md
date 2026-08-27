# R2 — the shared core

**Copy `core/` into the instrument.** Add `node-web-audio-api` as a
devDependency if the instrument will render offline (it should — see R3).

```sh
cp -r <music_loom>/rack/R2-core/core <instrument>/core
```

Nine modules, no dependencies, no build step. They run unchanged in the browser
and in Node, which is what lets the same graph be auditioned live and rendered
headlessly.

This is not a hypothetical library. Most of it already appears byte-identical in
more than one instrument built here — which is the reason the studio exists.

## What is in it

| Module | Holds |
|---|---|
| `rng.js` | `mulberry32`, `makeRng` — seeded RNG. One stream per layer. |
| `music.js` | `MODES`, `PROGRESSIONS`, `degreeToMidi`, `chordTones`, `midiToFreq`, `centsToRatio`, `voiceUnder` |
| `dsp.js` | FFT and `magnitude`; saturation curves (`sat`, `fold`, `clip`, `bit`, `diode`); seeded `whiteNoise`/`pinkNoise`; `impulse` and `springImpulse` reverb tails; pitch-shift ramp helpers |
| `metrics.js` | `stats` (peak, RMS dB, DC, stereo width dB), `spectrum` (centroid + lo/mid/hi band energy) |
| `wav.js` | `encodeWav`, `decodeWav`, `toMono` — 8/16/24/32-bit and float PCM |
| `aiff.js` | AIFF decode, for sample libraries that ship it |
| `scheduler.js` | `StepScheduler` — sixteenth-grid lookahead clock, 25 ms tick, 120 ms lookahead |
| `math.js` | `clamp01`, `lerp`, `pearson`, `cosineSim` |
| `merge.js` | `mergeConfig`, `sparseDiff` — deep merge where only base keys survive |

## Conventions that come with it

**Seed per layer, not per instrument.** Four independent streams — plan, timbre,
notes, impulses — so retuning one does not reshuffle the others. Sharing one
stream means every edit is a full reroll and nothing can be compared to anything.

**Impulses are seeded too.** `impulse` and `springImpulse` take a seed, so the
same reverb tail is generated every run. An unseeded impulse makes renders
differ for no musical reason and destroys byte-identity.

**Store scale degrees, not MIDI numbers.** `degreeToMidi(root, mode, degree)`
resolves at play time. Sequences written in degrees retune when key or mode
changes; sequences written in absolute pitch do not, and retrofitting them is a
rewrite.

**Config is a merge chain.** `DEFAULT_CONFIG` → sparse override → sparse
override. `mergeConfig` keeps only keys present in the base, so an override with
a typo cannot silently introduce a parameter nothing reads.

**One measurement implementation.** `metrics.js` is what the render CLI prints
*and* what any regression test asserts on. Two implementations drift, and then a
passing test and a printed number disagree about the same audio.

**`spectrum` reads the buffer midpoint at 16k FFT.** Large window for clean
harmonic separation; midpoint to avoid the attack and the tail. If an instrument
needs a different window, pass it — but say why beside the call.

## Divergence

If a module gets improved inside an instrument, send it back through
`please_add_me.md`. A copy that quietly diverges is how two instruments end up
with the same function computing different numbers.
