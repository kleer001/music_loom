# R3 — render and measure

**Ears are low-resolution. A spectrum is exact.**

Graft this when the instrument makes sound and you need to know whether a change
did what you predicted.

## Copy

```sh
cp <music_loom>/rack/R3-measure/render.mjs      <instrument>/render.mjs
cp <music_loom>/rack/R3-measure/regression.test.js <instrument>/test/
```

Then, in the instrument's `package.json`:

```json
"scripts": {
  "test": "node --test test/",
  "render": "node render.mjs"
},
"devDependencies": { "node-web-audio-api": "^2.0.0" }
```

Requires R2 (`core/metrics.js` and `core/wav.js`).

## The contract it needs

`src/graph.js` exports:

```js
export const SAMPLE_RATE = 48000;
export async function build(ctx, { seed, seconds }) { /* wire to ctx.destination */ }
```

`build` must run against a real `AudioContext` *and* an `OfflineAudioContext`.
The page calls it to play; the harness calls it to measure. One builder, so what
you measure is what you hear.

This is why no browser-only node may sit in a required path — an
`OfflineAudioContext` has no `audioWorklet`, so a worklet has to degrade to
native nodes or the harness cannot run at all.

## Use

```sh
npm run render                                  # 8 s, seed 1, print measurements
npm run render -- --seconds=30 --out=tmp/a.wav  # bounce to disk
npm run render -- --sweep=1,2,3,4,5             # every seed, compare
npm run render -- --headroom                    # sustained level, suggested trim
```

Output:

```
seed 1         peak   -1.20 dBFS   rms  -18.34 dB   dc   1.2e-6   width  -15.3 dB
               centroid  1840 Hz   bands lo  62%  mid  28%  hi  10%
```

## Reading the numbers

**peak** near 0 dBFS with **rms** far below it means a spiky mix — a transient
is eating the headroom the sustained material needs.

**dc** should be at the noise floor. Anything above about 1e-3 is an
asymmetric waveform or an envelope that does not return to zero, and it steals
headroom while being inaudible.

**width** at 0 dB is mono. Strongly positive means the sides dominate, which
collapses badly when summed — check it before assuming a wide mix is a good one.

**centroid** is the single most useful number for "is this too bright". Track it
across a change rather than reading it absolutely.

**bands** catch the mistakes ears forgive: a low-end buildup that only shows on
big speakers, a scooped midrange, hiss nobody notices until it is summed across
eight voices.

## Working method

**Predict, then measure.** Write down what the number should do before running.
A measurement that confirms a prediction teaches something; one that is read
afterward and rationalised teaches nothing.

**Relative deltas are trustworthy; absolute levels sometimes are not.** Under
`node-web-audio-api` some nodes — dynamics compression especially — do not
behave identically to a browser. A/B the same graph with a feature on and off
and the difference is real. Take an absolute loudness claim to a browser before
believing it.

**Distrust the harness before the output.** When a number is surprising, first
confirm the harness measures what you think. Render a known signal — a sine at a
known level — and check it reads back right.

**Bisect after one failed attempt.** Mute voices until the artifact goes away.
`--sweep` across seeds separates "this seed is unlucky" from "this is broken".

## The regression tests

`regression.test.js` asserts the four things that break silently:

- The output is audible and not clipping.
- No DC offset.
- Same seed produces byte-identical samples.
- Different seeds produce different samples.

The determinism test is byte-identity, not approximate equality. A render that
is only nearly reproducible has an unseeded source in it — usually `Math.random`
in an impulse or a noise buffer — and that will make every future A/B ambiguous.

Add instrument-specific assertions beside these: the claim written in the spec
sheet under *How you will know it worked* is exactly what belongs here.
