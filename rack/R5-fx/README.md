# R5 — effects

**Copy `dsp/` into the instrument.** It expects `core/` beside it, so R2 comes first.

```sh
cp -r <music_loom>/rack/R5-fx/dsp <instrument>/dsp
```

Everything here resolves `../core/dsp.js` and `../core/rng.js`, which is what that layout gives it. Thirty-odd effect builders, uniform enough to chain and specific enough to be worth keeping.

## Where it came from

`fx.js` and the three worklets appear byte-identical in cyber_synth and dub_synth — the same duplication `core/` shows, one layer up. The six modules beside them and `master.js` were written in dub_synth and have no counterpart in cyber_synth.

| File | Holds |
|---|---|
| `fx.js` | 26 builders: `makeSidechain` `makePump` `makeDelay` `makePitchShifter` `makeBestPitchShifter` `makeFilter` `makeEq` `makeChannelEq` `makeMultiband` `makeReverb` `makeDrive` `makeFuzz` `makeAsymSat` `makeFold` `makeBitcrush` `makeRingmod` `makeChorus` `makeTape` `makePhaser` `makeFlanger` `makeNoiseBed` `makeModMatrix` |
| `echo.js` | `makeDubEcho` — feedback into a filter, the dub delay. `makeFilterDelay` — one delay per band |
| `space.js` | `makeSpring` `makePlate` `makeShimmer` — generated impulses, normalised to unit energy |
| `mixer.js` | `makeDubMixer` — named channels, named buses, post-fader pre-mute sends |
| `masterbus.js` | `makeMasterBus` — mud/sub/air shelves, trim, glue clipper, and a `neutral()` bypass for measurement |
| `lfo.js` | `attachLfo` `metaModulate` `rollLfos` `divToHz` — tempo-synced modulation |
| `knob.js` | `ride` `randomWalk` `sineLfo` — performance gestures on an `AudioParam` |
| `master.js` | Offline mastering on Float32 channels: `truePeak` `measure` `glue` `limit` `normalize` `masterChain` |
| `*-worklet.js` | Ladder filter, bitcrush, phase vocoder |

## Two contracts, and where they differ

**Graph blocks** — `fx.js`, `echo.js`, `space.js`, `mixer.js`, `masterbus.js` — return objects with `input` and `output` nodes. They chain, and `makeDubMixer`'s `insert(busName, fx)` takes any of them.

**`master.js` is not a graph block.** It takes an array of `Float32Array` channels, **mutates them in place**, and returns a report rather than audio:

```js
const ch = [Float32Array.from(L), Float32Array.from(R)];
const report = masterChain(ch, { sampleRate: 48000 });
// ch is now mastered; report is { before, after, truePeakDb, glue, limit, ok, notes }
```

`report.notes` names what it had to do — a limiter pulling more than 6 dB, a crest under 9 dB, true peak above the ceiling. That makes it the one part of this rung that works under `OfflineAudioContext` without touching a `DynamicsCompressorNode`, whose behaviour there does not match a browser.

## The `random` argument

`makeDubEcho`, `makeSpring`, `makePlate` and `makeShimmer` take `random` — a **bare function returning 0–1**, not the rng object from `core/rng.js`:

```js
const rng = makeRng(seed);
makePlate(ctx, { decay: 2.4, random: rng.next });   // rng.next, not rng
```

Passing the object throws inside `impulse`. The voices on R6 take the object instead, so a graph that builds both passes `rng` to one and `rng.next` to the other.

## Worklets

`loadLadderWorklet`, `loadPitchWorklet` and the bitcrush loader resolve their module with `new URL(file, import.meta.url)`, so the worklets travel correctly as long as they stay beside `fx.js`. Each has a native fallback: `makeFilter` drops to a `BiquadFilter`, `makeBestPitchShifter` to the `makePitchShifter` overlap-add. An `OfflineAudioContext` has no `audioWorklet`, so a render takes the fallback path and a browser takes the worklet — the same graph sounds slightly different in each, which shows up as a delta when comparing a render against what you heard.

`phase-vocoder-core.js` in cyber_synth is a test-side mirror of the worklet, not a runtime dependency. It is not copied here.

## Determinism

Measured by rendering the same graph twice and comparing bytes: `makeReverb`, `makeChorus`, and the seeded `makePlate` are byte-identical run to run. The impulse builders take a seed for exactly that reason.

## Reverb impulses

`space.js` normalises its impulses to unit energy and sets `ConvolverNode.normalize = false`. Left at its default, Web Audio rescales by the impulse's own energy, and a return fader ends up tracking decay time instead of level.
