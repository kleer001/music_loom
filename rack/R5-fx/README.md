# R5 — effects

**Copy `dsp/` into the instrument.** It expects `core/` beside it, so R2 comes first.

```sh
cp -r <music_loom>/rack/R5-fx/dsp <instrument>/dsp
```

Everything here resolves `../core/dsp.js` and `../core/rng.js`, which is what that layout gives it. Thirty-odd effect builders, uniform enough to chain and specific enough to be worth keeping.

## Where it came from

The effect builders and the worklets appear byte-identical in more than one instrument built here — the same duplication `core/` shows, one layer up. They arrived as a single thousand-line `fx.js` and are kept here as a file per effect. The modules beside them were written for a single instrument and have no counterpart in the others.

| File | Holds |
|---|---|
| `fx-common.js` | `ramp` `dipAndRewire` `makeWorkletLoader` — the helpers the builders share |
| `sat.js` | `makeDrive` `makeFuzz` `makeAsymSat` `makeFold` — one waveshaper topology, four voicings |
| `delay.js` | `makeDelay` — tempo-synced, filtered feedback, ping-pong |
| `reverb.js` | `makeReverb` — convolver with switchable modes |
| `filter.js` | `makeFilter` — ladder worklet, or a BiquadFilter fallback |
| `eq.js` | `makeEq` `makeChannelEq` |
| `multiband.js` | `makeMultiband` — three-band glue, on `DynamicsCompressorNode` |
| `comp.js` | `loadComp` `makeComp` — single-band compressor. The DSP is in `comp-worklet.js`, so a render and a browser produce the same samples |
| `pitch.js` | `makePitchShifter` `makeBestPitchShifter` |
| `sidechain.js` | `makeSidechain` `makePump` |
| `chorus.js` `flanger.js` `phaser.js` | `makeChorus` `makeFlanger` `makePhaser` |
| `bitcrush.js` `ringmod.js` `tape.js` | `makeBitcrush` `makeRingmod` `makeTape` |
| `noise.js` `modmatrix.js` | `makeNoiseBed` `makeModMatrix` |
| `echo.js` | `makeDubEcho` — feedback into a filter, the dub delay. `makeFilterDelay` — one delay per band |
| `space.js` | `makeSpring` `makePlate` `makeShimmer` — generated impulses, normalised to unit energy |
| `mixer.js` | `makeDubMixer` — named channels, named buses, post-fader pre-mute sends |
| `masterbus.js` | `makeMasterBus` — mud/sub/air shelves, trim, glue clipper, and a `neutral()` bypass for measurement |
| `lfo.js` | `attachLfo` `metaModulate` `rollLfos` `divToHz` — tempo-synced modulation |
| `knob.js` | `ride` `randomWalk` `sineLfo` — performance gestures on an `AudioParam` |
| `master.js` | Offline mastering on Float32 channels: `truePeak` `measure` `glue` `limit` `normalize` `masterChain` |
| `*-worklet.js` | Ladder filter, bitcrush, phase vocoder, compressor |

## Two contracts, and where they differ

**Graph blocks** — every effect file, plus `echo.js`, `space.js`, `mixer.js`, `masterbus.js` — return objects with `input` and `output` nodes. They chain, and `makeDubMixer`'s `insert(busName, fx)` takes any of them.

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

`loadLadderWorklet`, `loadPitchWorklet` and the bitcrush loader resolve their module with `new URL(file, import.meta.url)`, so the worklets travel correctly as long as they stay in the same directory as the modules that load them. Each has a native fallback: `makeFilter` drops to a `BiquadFilter`, `makeBestPitchShifter` to the `makePitchShifter` overlap-add. These fallbacks date from a time when an `OfflineAudioContext` could not run a worklet at all. `node-web-audio-api` 2.x can, so a render need not take the fallback path — but these three still declare one, and a graph that leans on them renders as the fallback unless it loads the worklet first. `comp.js` takes the other approach and refuses to run without its worklet, on the grounds that a compressor silently doing nothing is worse than one that is absent.

`phase-vocoder-core.js` in cyber_synth is a test-side mirror of the worklet, not a runtime dependency. It is not copied here.

## Determinism

Measured by rendering the same graph twice and comparing bytes: `makeReverb`, `makeChorus`, and the seeded `makePlate` are byte-identical run to run. The impulse builders take a seed for exactly that reason.

## Reverb impulses

`space.js` normalises its impulses to unit energy and sets `ConvolverNode.normalize = false`. Left at its default, Web Audio rescales by the impulse's own energy, and a return fader ends up tracking decay time instead of level.
