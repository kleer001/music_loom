# R3 — render and measure

Ears catch that something changed; a spectrum says how much, and in which band.

Graft this when the instrument makes sound and a change needs checking against what it was supposed to do.

## Copy

```sh
cp <music_loom>/rack/R3-measure/render.mjs      <instrument>/render.mjs
cp <music_loom>/rack/R3-measure/confirm.html    <instrument>/confirm.html
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

That is where the worklet question comes from, and the answer has moved: `node-web-audio-api` 2.x does support `audioWorklet` on an `OfflineAudioContext`, so a worklet in a required path no longer takes the harness with it. Its `addModule` wants a path rather than a `URL`, and its loader wants `Promise.withResolvers` — Node 22, or a polyfill; `dsp/comp.js` carries both. The reverse now matters more: a *native* node is the thing that may not agree between a render and a browser, so anything whose job is to agree is better written as a worklet.

## Use

```sh
npm run render                                  # 8 s, seed 1, print measurements
npm run render -- --seconds=30 --out=tmp/a.wav  # bounce to disk
npm run render -- --sweep=1,2,3,4,5             # every seed, compare
npm run render -- --headroom                    # sustained level, and the gain that fixes it
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

**Relative deltas travel; absolute levels sometimes do not.** Under `node-web-audio-api` some nodes do not behave identically to a browser — dynamics compression is the usual suspect, but a bare oscillator is enough to do it. A/B of the same graph with a feature on and off is real either way. An absolute loudness or brightness claim holds up after a browser has seen it, which is what `confirm.html` is for.

**The harness can be wrong too.** When a number is surprising, a known signal — a sine at a known level — says whether it reads back right.

**Bisection after one failed attempt.** Muting voices until the artifact goes away localises it. `--sweep` across seeds separates "this seed is unlucky" from "this is broken".

## Confirming in a browser

`confirm.html` renders the same graph through the browser's own
`OfflineAudioContext` and prints the same line `render.mjs` prints. Serve the
instrument and open it:

```sh
./run.sh                        # prints the port it found
# then open  http://127.0.0.1:<port>/confirm.html?seed=1&seconds=8
```

Defaults match `render.mjs` — seed 1, 8 seconds. Compare the two outputs line by
line on the same seed.

To read it without a person at the keyboard, the page sets `window.__measure`
with every field and `window.__measureDone` once the render resolves. Wait on the
flag, then read the object; the `<pre>` is filled before the flag is set, so the
flag is the one to poll.

### What a difference means

An `OfflineAudioContext` in a browser has a real `audioWorklet`, so a worklet
that fell back to native nodes under Node runs as itself here. That alone can
move the numbers, and it is the intended reading: the page shows what the
instrument actually sounds like.

Underneath that, the two runtimes give an oscillator measurably different
harmonics. A bare oscillator with nothing else in the graph is enough to show it
— 8 s at 440 Hz, 48 kHz, no processing:

```
              node-web-audio-api 2.2.0     Chrome 151
sine          rms  -9.03  centroid  440    rms  -9.03  centroid  440
triangle      rms -10.79  centroid 1039    rms -10.79  centroid  907
sawtooth      rms -10.90  centroid 4748    rms -12.28  centroid 4355
```

The sine agrees to the digit in both level and centroid, which is the control:
the FFT, the metrics and the render path all read a known signal back correctly
in both places. What diverges is the harmonic content the oscillator was given
in the first place — up to 15% on the triangle's centroid, and 1.4 dB of level
on the sawtooth, with no dynamics processing anywhere.

It is not that one runtime keeps more harmonics than the other. Counted at
bin-aligned frequencies, the two land close, and which one reaches higher
changes with pitch: for a sawtooth at 750 Hz the last harmonic above 1% of the
fundamental is the 27th under Node and the 25th in Chrome, and at 187.5 Hz it is
the 72nd under Node and the 99th in Chrome. What separates them is accuracy
rather than reach. Chrome tracks the ideal 1/n spectrum until it is nearly at
its band limit — first departing by more than 10% at the 26th harmonic of 32,
and at the 102nd of 128. Node-web-audio-api departs a third to a half of the way
up: the 12th of 32, and the 45th of 128.

Two things make a small energy difference read as a large one here. `spectrum()`
weights each bin by magnitude rather than power, which gives the weak upper
harmonics far more influence on the centroid than their energy alone would; and
the upper harmonics are exactly where the runtimes disagree. So a centroid gap
of a few hundred Hz can sit on top of an audible difference much smaller than it
looks. The level figures carry no such amplification — the sawtooth's 1.4 dB is
a real energy difference.

So a brightness or loudness figure quoted from an offline render is a figure
about `node-web-audio-api`. A delta between two offline renders is a figure
about the change. Quote the second freely; confirm the first here before it goes
in a spec sheet or a release note.

## The regression tests

`regression.test.js` covers the four things that break without saying so:

- The output is audible and not clipping.
- No DC offset.
- Same seed produces byte-identical samples.
- Different seeds produce different samples.

The determinism test is byte-identity rather than approximate equality. A render that is only nearly reproducible has an unseeded source in it — usually `Math.random` in an impulse or a noise buffer — and every later A/B inherits the ambiguity.

Instrument-specific assertions sit beside these. The claim written in the spec sheet under *How you will know it worked* is already in the right shape for one.
