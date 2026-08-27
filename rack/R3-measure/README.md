# R3 — render and measure

Ears catch that something changed; a spectrum says how much, and in which band.

Graft this when the instrument makes sound and a change needs checking against what it was supposed to do.

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

The page calls `build` to play and the harness calls it to measure, so it runs against both a real `AudioContext` and an `OfflineAudioContext`. One builder means what gets measured is what gets heard.

That is where the worklet question comes from: an `OfflineAudioContext` has no `audioWorklet`, so a worklet in a required path takes the harness out with it. A worklet that degrades to native nodes keeps both.

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

**peak** near 0 dBFS with **rms** far below it means a spiky mix — a transient is eating the headroom the sustained material needs.

**dc** sits at the noise floor on a clean render. Above about 1e-3 there is an asymmetric waveform or an envelope that does not return to zero, stealing headroom while being inaudible.

**width** at 0 dB is mono. Strongly positive means the sides dominate, and a mix like that loses most of its level when summed.

**centroid** is the most useful single number for "is this too bright", read as a delta across a change rather than absolutely.

**bands** catch the mistakes ears forgive: a low-end buildup that only shows on big speakers, a scooped midrange, hiss nobody notices until it is summed across eight voices.

## Working method

**A prediction written down first.** A measurement that confirms a prediction teaches something; the same number read afterwards and rationalised teaches nothing, because any number can be rationalised.

**Relative deltas travel; absolute levels sometimes do not.** Under `node-web-audio-api` some nodes — dynamics compression especially — do not behave identically to a browser. A/B of the same graph with a feature on and off is real either way. An absolute loudness claim holds up better after a browser has seen it.

**The harness can be wrong too.** When a number is surprising, a known signal — a sine at a known level — says whether it reads back right.

**Bisection after one failed attempt.** Muting voices until the artifact goes away localises it. `--sweep` across seeds separates "this seed is unlucky" from "this is broken".

## The regression tests

`regression.test.js` covers the four things that break without saying so:

- The output is audible and not clipping.
- No DC offset.
- Same seed produces byte-identical samples.
- Different seeds produce different samples.

The determinism test is byte-identity rather than approximate equality. A render that is only nearly reproducible has an unseeded source in it — usually `Math.random` in an impulse or a noise buffer — and every later A/B inherits the ambiguity.

Instrument-specific assertions sit beside these. The claim written in the spec sheet under *How you will know it worked* is already in the right shape for one.
