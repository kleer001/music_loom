# music_loom — studio brief

This is a **mother repo and workbench, not an instrument**. Musical ideas are
researched against real sources, written up as a spec sheet, prototyped to
something that plays, measured, then **budded** into their own repo.

Nothing here ships. The instruments that leave here ship.

## The flow

1. **Name the inspiration.** An artist, a record, a genre, a technique, an
   acoustic instrument, a piece of gear.
2. **Research it** — `RESEARCH.md` is the gate. Produce a technique digest in
   `research/`, sourced and sectioned, or extend one that already exists.
3. **Write the spec sheet** — copy `template/`, fill `SPEC-SHEET.md` from the
   digest. The spec names the sound, the mechanism, and how you will know it
   worked.
4. **Prototype on the house stack** — build the smallest thing that plays, in
   `bench/<slug>/`. Graft rack units as the work reaches them.
5. **Measure it** — `rack/R3-measure`. Render offline, read the numbers.
   Ears are low-resolution; a spectrum is exact.
6. **Clear the rights gate** — `RIGHTS.md`. Every sample, tune and transcription
   accounted for before anything is published.
7. **Bud it** — `BUDDING.md`. The instrument leaves with its history, then gets
   pruned from here.

## House stack

Constant across every instrument. Deviating from it is a decision to argue for,
not a default.

- **Vanilla JavaScript, ES modules, no build step.** No bundler, no CDN, no
  framework. The browser loads the source you wrote.
- **Web Audio API. Zero runtime dependencies.**
- **`node-web-audio-api` is the one audio devDependency**, and only so the same
  graph can be rendered headlessly through `OfflineAudioContext`.
- **Served over HTTP, never `file://`** — ES modules and `AudioWorklet` do not
  load from the filesystem. `run.sh` scans upward from its default port for the
  first free one.
- **`node --test test/`** for pure logic. No test framework.
- **MIT.**

## Load-bearing constraints

Break one of these and something that currently works will quietly stop.

- **Offline-renderable is non-negotiable.** No browser-only node sits in a
  required path. A worklet may be *preferred*, but it must degrade to native
  nodes, because an `OfflineAudioContext` has no `audioWorklet`.
- **Determinism.** Same seed, same bytes. Generation flows from seeded RNG
  (`core/rng.js`), with independent streams per layer so editing one does not
  reshuffle the others. Real-time humanisation may sit outside the seeded
  contract — if it does, say so where it happens.
- **Sequencers store scale degrees, never absolute pitch.** Key and mode then
  become free to change, and everything already written retunes with them.
- **Never express a repeating part as a stream of events.** Persistent graphs
  with retriggered envelopes, or a bar-length buffer looped by one node. Per-hit
  scheduling grows without bound; the cost shows up minutes in, not seconds in.
- **Sample rates are converted, never assumed.** Resample on the way in, or
  throw. Do not accept a mismatched buffer.
- **Reverb impulses are normalised to unit energy** with
  `ConvolverNode.normalize = false`. Web Audio's own flag rescales by impulse
  energy, which makes a return fader track decay time instead of level.

## Working method

- **Measure, don't guess.** When the artifact is a signal, build an objective
  read and look at the numbers before forming a theory. 16k–32k FFT, amplitude
  envelope, band-energy split.
- **Distrust the instrument before the output.** Confirm the harness measures
  what you think it measures.
- **After one failed attempt, stop guessing and bisect.** Reduce to a minimal
  reproduction and diff against a known-good reference.
- **Cite the source at the point of use.** When a value comes from a technique
  digest, name the doc and section in a comment beside it. A number with no
  provenance is a number nobody can defend later.
- **A clean test subject exposes latent bugs in shared code.** New code
  misbehaving often surfaces a pre-existing fault in `core/`.

## Normativity

- **LAW** — one only: *the instrument must play.* An idea that does not make
  sound is not yet a prototype, however good the document is.
- **RULE** — the load-bearing constraints above. Break only with the reason
  written down.
- **SUGGESTION** — everything in the rack units. Advisory; wave off freely.
- **GENRE** — silent until a genre is declared in the spec sheet. Once it is,
  the technique digest for that genre is a contract with the listener.

## Panel on disk

The listening panel in `rack/R1-spec/personas.md` is a set of lenses for
thinking. A lens definition belongs in a file; a verdict never does. Do not
write a persona's words down and do not cite one as authority — an opinion
parked in a file reads back next session as specification. Say why the thing
is true on its own merits.

## Repo layout

- `template/` — what a new instrument is born as. `scripts/new_instrument.py`
  copies it; do not copy it by hand.
- `rack/` — the apparatus, by rung. Grafted by copy when the work reaches it.
  The listening panel is `rack/R1-spec/personas.md`.
- `research/` — technique digests. Sourced, sectioned, cited from code.
- `scripts/` — the delivery mechanism and the scaffolder.
- `bench/` — instruments under construction. Tracked, because budding splits
  their history out of this repo.
- `tmp/` — scratch. Gitignored. Promote anything that turns out to be evidence.

## Boundaries

- Do not edit a daughter's `.music_loom.toml` by hand.
- Validate at boundaries (CLI args, file inputs, decoded buffers). Trust
  internal functions.
- One path, no fallbacks. Fail loudly.
