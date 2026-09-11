# sound_feel

A myNoise-style ambient shaper built from a single field recording. One 60-second
morning capture becomes a seamless bed loop, split live into **ten frequency layers**
you ride like a graphic EQ, with the discrete events (footsteps, voices, clatter)
extracted and sprinkled back on a clustered schedule.

Zero runtime dependencies — vanilla JavaScript and the Web Audio API, served over HTTP.

## Run it

```sh
./run.sh            # serves on the first free port from 8000, prints the URL
```

Open the URL and press **Play**. `fetch()` needs a real server, so `file://` will not work.

## What it does

- **Ten frequency faders** (31.5 Hz – 16 kHz, one octave each), ordered low → high,
  tinted along a frequency ramp. Each has mute / solo and a live level meter.
  Faders are audio-taper (linear-in-dB), like a mixer's.
- **Animate** — slow random drift of the faders.
- **Raw loop** — A/B the unfiltered bed against the ten-band mix.
- **Events** — the extracted grains, fired on a clustered (super-Poisson) schedule;
  Density scales the rate.
- **Detail panel** — per-band centre, octave span, energy share, crest, kurtosis, and
  the whole-file read.

The low end is **resynthesized**: the source recording carried mic wind (broadband,
gusty, under ~120 Hz), so `tools/build.py` high-passes it away and mixes a clean seeded
low floor under the bed. The bottom three faders ride that synthetic floor.

## Layout

```
index.html        the instrument (page + inline Web Audio graph)
data.js           window.LOOM — band stats, grain index, file info (built)
assets/
  bed.wav         the seamless bed loop (built)
  grains.wav      concatenated event grains (built)
  source/         the source recording + its provenance
tools/
  build.py        source -> bed.wav, grains.wav, data.js  (reproducible)
  find_loop.py    re-derive the loop bounds if the source changes
research/          the technique digest this instrument implements
run.sh            serve over HTTP
```

Regenerate the built assets from the source: `python3 tools/build.py`.

## State, and what's next

Working prototype. It is honestly a **graphic EQ on one loop**, not yet myNoise's
engine: all ten bands are frequency views of the *same* recording, so they are
correlated and share one 48.7 s period. The real version renders each band as its
**own** seamless loop at a different **coprime length** (and synthesizes the floor
bands outright), so the layers are decorrelated and the mix effectively never repeats.

A tribute in spirit to Stéphane Pigeon's [myNoise](https://mynoise.net) — its
architecture, not its audio, palette, or names. Not affiliated.
