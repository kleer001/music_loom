# music_loom — studio brief

A mother repo and workbench rather than an instrument. Musical ideas get researched against real sources, written up as a spec sheet, prototyped to something that plays, measured, then **budded** into their own repo.

Nothing here ships. The instruments that leave here do.

## When the ask is a song, not an instrument

The flow below builds an **instrument** to bud out. A different ask is a finished **song** in a
genre. When the user wants a full track or a musical bed in an electronic or algorithmic genre —
techno, house, drum & bass, trance, acid, ambient, chiptune, generative — reach for the
`strudel-music` skill and suggest it. Strudel writes the track as code you paste into
[strudel.cc](https://strudel.cc); its `references/song-structure.md` arranges loops into a full
song. This is a separate deliverable from a house-stack instrument: do not scaffold a `bench/`
prototype for it. Strudel does not fit sung songs or live-played acoustic genres — say so when
the target does not fit. A rendered Strudel song ships under sample provenance, the same gate
`RIGHTS.md` sets for any shipped recording.

## The flow

The path from an idea to a repo. Steps get skipped and reordered; this is the shape they tend to take.

1. **An inspiration.** An artist, a record, a genre, a technique, an acoustic instrument, a piece of gear.
2. **Research.** A technique digest in `research/`, sourced and sectioned, or an extension of one already there. `RESEARCH.md` describes what a digest is made of.
3. **A spec sheet.** `scripts/new_instrument.py` copies `template/`. The spec names the sound, the mechanism, and what would count as it working.
4. **A prototype** in `bench/<slug>/`, on the house stack. Rack units get grafted as the work reaches them.
5. **Measurement** — `rack/R3-measure` renders offline and prints numbers. Ears catch that something changed; a spectrum says how much.
6. **Rights** — `RIGHTS.md` covers what a shipped recording, tune or transcription carries with it.
7. **Budding** — the `/bud` skill, vendored at `.claude/skills/bud/`. The instrument leaves with its history and is pruned from the current tree here.

## House stack

What the instruments built here have run on.

- **Vanilla JavaScript, ES modules, no build step.** No bundler, no CDN, no framework. The browser loads the source as written.
- **Web Audio API, zero runtime dependencies.**
- **`node-web-audio-api`** as the one audio devDependency, so the same graph renders headlessly through `OfflineAudioContext`.
- **Served over HTTP.** ES modules and `AudioWorklet` do not load from a `file://` path. `run.sh` scans upward from its default port for a free one.
- **`node --test test/`** for pure logic. No test framework.
- **MIT.**

Something else may suit a given instrument better. This is the set that has worked so far, not a boundary around what can.

## What has tended to break

Each of these cost time at least once. They are consequences rather than rules — an instrument that wants the trade is free to take it.

- **Assuming a worklet cannot render offline.** It can. `node-web-audio-api` 2.x
  supports `audioWorklet` on an `OfflineAudioContext`, verified by rendering one
  and comparing the samples against Chrome. Two things differ from a browser:
  `addModule` wants a filesystem path rather than a `URL`, and the loader reaches
  for `Promise.withResolvers`, which needs Node 22 or a four-line polyfill.
  `dsp/comp.js` carries both shims. A native fallback is still worth having for
  older setups, but it is no longer the price of being measurable.
- **Native nodes that do not agree between the two runtimes.** A
  `BiquadFilterNode` matches Chrome to −128 dB at a 1 kHz corner, −69 dB at
  10 Hz, −46 dB at 5 Hz, and not at all by 1 Hz, where the disagreement is the
  size of the signal. A `DelayNode` inside a feedback loop carries about a
  quantum more implicit latency in Chrome, so identical coefficients give
  different time constants. Anything whose job is to agree — an envelope
  follower, a detector, a control signal — belongs in a worklet, where the
  arithmetic is yours and both runtimes run the same JS.
- **Unseeded sources.** Seeded RNG (`core/rng.js`) with an independent stream per layer gives byte-identical renders, and lets one layer be edited without reshuffling the others. A stray `Math.random` in an impulse or a noise buffer makes every later A/B ambiguous. Real-time humanisation often sits outside the seeded path deliberately; saying so where it happens saves the next reader a hunt.
- **Absolute pitch in a sequencer.** Sequences stored as scale degrees retune when key or mode changes. Stored as MIDI numbers they do not, and converting afterwards is a rewrite.
- **Per-hit scheduling of a repeating part.** Measured in dub_synth at 125 BPM, in ms of CPU per audio second:

  ```
                30 s    120 s    300 s
  persistent    1.15     1.18     1.14     flat
  per hit       4.99    19.84    40.74     ~36x by five minutes
  ```

  Chrome shows the same shape, so it is not an artefact of the offline renderer. Nothing frees a source that has finished, so the graph keeps every node it was ever given. A persistent graph with retriggered envelopes holds flat; so does a bar-length buffer looped by one node. A part that genuinely varies per hit is a different case, and short pieces never reach the divergence.
- **Assumed sample rates.** A buffer decoded at one rate and played at another is off in both pitch and length. Resampling on the way in is where that gets caught.
- **`ConvolverNode.normalize` at its default.** Web Audio rescales the impulse by its own energy, so a return fader tracks decay time instead of level. Normalising the impulse to unit energy and setting `normalize = false` separates the two.

## Working method

- **Measuring settles what guessing proposes.** When the artifact is a signal, an objective read — 16k-32k FFT, amplitude envelope, band-energy split — says which theory survives.
- **The harness can be wrong too.** A surprising number is worth checking against a known signal before it is believed.
- **Bisection tends to beat a second guess.** A minimal reproduction diffed against a known-good reference finds it; another theory usually does not.
- **A number carries its reason.** A value that came from research reads better with the reason written out beside it than with a pointer to where the reason lives.
- **A clean test subject exposes latent bugs in shared code.** New code misbehaving often turns out to be a pre-existing fault in `core/`.

## The panel

The listening panel in `rack/R1-spec/personas.md` is a set of lenses for thinking. A lens definition sits in a file well; a verdict sits badly — an opinion parked in a file reads back next session as specification. What survives a panel is a decision in your own voice, argued on its own merits.

## Repo layout

- `template/` — what a new instrument is born as. `scripts/new_instrument.py` copies it and substitutes the slug.
- `rack/` — the apparatus, by rung. Grafted by copy when the work reaches it.
- `research/` — technique digests. Sourced and sectioned.
- `scripts/` — the delivery mechanism and the scaffolder.
- `pantry/` — sound material and the tools that index it. `PROVENANCE.md` accounts for every file.
- `bench/` — instruments under construction. Tracked, because budding splits their history out of this repo.
- `tmp/` — scratch. Gitignored. Anything that turns out to be evidence gets promoted out of it.

`.music_loom.toml` in a budded instrument is the state `check_updates.py` reads and writes. Hand-editing it desynchronises the stamp from what the daughter has actually resolved.
