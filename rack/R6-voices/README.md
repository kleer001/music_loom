# R6 — voices

**Copy `voices/` into the instrument.** `persistent.js` reaches `../core/` and `../dsp/`, so R2 and R5 come first if you take that one.

```sh
cp -r <music_loom>/rack/R6-voices/voices <instrument>/voices
```

Sound sources, gathered from several instruments: voices across three ways of making one, plus the readers that feed the buffer-driven kinds from the pantry.

| File | From | Holds |
|---|---|---|
| `fire.js` | cyber_synth `cyber/voices.js` | Fire-and-forget voices: drums, basses, leads, pads, plucks, stabs, risers, flutes, and `engineVoice` |
| `persistent.js` | dub_synth `engine/voices.js` | `makeVoices` — kick, sampleKick, bass, stab, snare, hat, shaker, perc, pad as retriggered graphs |
| `buffer.js` | cyber_synth `industrial/voices.js` | `slicer` `granular` `oneShotKit` `loopEnsemble` — buffer-driven, tempo-matched with pitch-lock |
| `wavetables.js` | cyber_synth | `registerWavetable` `getWavetable` — what `fire.js` imports |
| `patches.js` | cyber_synth | The patch schema `engineVoice` reads, and what the Vital importer writes to |
| `samples.js` | drone_flute_synth `engine/samples.js` | RIFF loop-point parsing, manifest reader, `SampleSet` by pitch, `StrokeSet` by stroke |
| `sampler.js` | ferine_town `web/sampler.js` | `Sampler` — per-note base64-MP3 soundfont playback |

## Three contracts

**Fire-and-forget** (`fire.js`) — `(ctx, t, dest, params, extras) => void`. The voice builds its own nodes at time `t`, connects to `dest`, starts and stops them. Nothing is shared but `dest`. The filter arrives through `extras.makeFilter`, which is why this file imports no effects.

```js
V.acidLead(ctx, t, dest, { cutoff: 900 }, { freq: 110, accent: true, makeFilter });
```

**Persistent** (`persistent.js`) — `makeVoices(ctx, { rng, seconds, beat }) → { kick(dest, opts) → { at(t, opts) } }`. The graph is built once and its envelope retriggered.

```js
const voices = makeVoices(ctx, { rng, seconds, beat });
const kick = voices.kick(dest);
for (let i = 0; i < bars * 4; i++) kick.at(i * beat);
```

**Buffer-driven** (`buffer.js`) — `(ctx, buffer, dest, params)`. Plays and manipulates an `AudioBuffer` rather than synthesising one.

## What each costs

The two synthesis contracts are not interchangeable, and the difference is measurable rather than stylistic.

**Cost over time.** Nothing frees a source that has finished, so a graph built per note keeps every node it was ever given. Measured in dub_synth at 125 BPM, in ms of CPU per audio second:

```
              30 s    120 s    300 s
persistent    1.15     1.18     1.14     flat
per hit       4.99    19.84    40.74     ~36x by five minutes
```

Chrome shows the same shape. A piece that ends before the divergence never sees it; an engine meant to run without end does.

**Determinism.** Rendering the same graph twice and comparing bytes:

```
deterministic      persistent.js
NON-DETERMINISTIC  fire.js  (including the bare kick)
```

`fire.js` calls `Math.random` at four points, all of them the real-time humanisation its own header describes: a detune drift, the fill of a cached noise buffer, a random read offset into that buffer per hit, and one sample-and-hold LFO. The kick reaches two of them through `noiseSource`, which is why even a lone kick renders differently each time. Threading a seeded source through those four points would close it; nothing else in the file needs changing.

**What follows.** A repeating part in a long-running engine, or a render that has to be byte-identical, is what `persistent.js` was built for. `fire.js` has far more voices and a much wider palette, and suits one-shots, fills, and parts that genuinely vary per hit. `sampleKick` in `persistent.js` is the third answer: stamp a fixed pattern into a bar-length buffer and loop one node over it.

## Feeding the buffer voices

`samples.js` reads `pantry/acoustic/manifest.json` and gives back pools by pitch and by stroke. `sampler.js` reads per-note base64 MP3 and needs no manifest. Both are what `buffer.js`, `fire.js`'s `sample`/`sampleVox`, and `persistent.js`'s `sampleKick` want handed to them.

`samples.js` imports `midiOf` from `../core/scales.js` and `round` from `../core/math.js`.

## engineVoice and the patch schema

`engineVoice` reads a flat patch object — engine kind, oscillator and filter settings, envelope, drive, and a list of LFO routes. `patches.js` holds that schema along with `mergePatch` and `loadPatch`, which clamp and normalise. The 83 Vital-derived patches in cyber_synth are written to it, and `pantry/tools/import_patches.mjs` imports against it.

Without `patches.js`, `engineVoice` has nothing well-formed to read. They travel together.

## Names

Three files were called `voices.js` where they came from. The origin of each is stamped at the top of the file and listed in the table above.
