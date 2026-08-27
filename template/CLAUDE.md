# INSTRUMENT_SLUG

TODO: one line — what it plays and how.

Built from music_loom. `.music_loom.toml` records the studio version this descends from.

## Commands

```sh
./run.sh          # serve, first free port from 8000
npm test          # node --test test/ — pure logic, no AudioContext
```

## House stack

- **Vanilla ES modules, no build step.** No bundler, no CDN, no framework.
- **Zero runtime dependencies.** `node-web-audio-api` is the only audio devDependency, and only so the graph can render headlessly.
- **Served over HTTP.** ES modules and `AudioWorklet` do not load from a `file://` path.

## What has tended to break

Consequences rather than rules. An instrument that wants the trade can take it, and a note here saying so keeps the next reader from treating it as a slip.

- **Browser-only nodes in a required path.** An `OfflineAudioContext` has no `audioWorklet`, so a graph that needs one cannot render headlessly and the measurement harness goes with it. A worklet that degrades to native nodes keeps both.
- **Unseeded sources.** Seeded RNG with an independent stream per layer gives the same output from the same seed, and lets one layer be edited without reshuffling the others. Real-time humanisation often sits outside that deliberately; saying so where it happens saves a hunt later.
- **Absolute pitch in a sequencer.** Scale degrees retune when key or mode changes. MIDI numbers do not, and converting afterwards is a rewrite.
- **Per-hit scheduling of a repeating part.** Nothing frees a source that has finished, so CPU per audio second climbs with length — measured at ~36x by five minutes, against flat for a persistent graph with retriggered envelopes or a bar-length buffer looped by one node. A part that genuinely varies per hit is a different case.
- **Assumed sample rates.** A buffer decoded at one rate and played at another is off in both pitch and length.
- **`ConvolverNode.normalize` at its default.** Web Audio rescales the impulse by its own energy, so a return fader tracks decay time instead of level. Normalising to unit energy with `normalize = false` separates them.

## Working method

- **Measuring settles what guessing proposes.** Render offline and read the numbers. Ears catch that something changed; a spectrum says how much.
- **The harness can be wrong too.** A surprising number is worth checking against a known signal.
- **Bisection after one failed attempt.** Minimal repro, diff against known-good.
- **A number with a citation can be defended later.** A constant that came from research carries `// §N — <what it is>` next to it.

## Code style

- `camelCase` functions and variables, `PascalCase` classes, `UPPER_SNAKE` module constants.
- Parameters normalised 0–1 at the UI boundary, mapped to real ranges on use.
- Comments explain *why*. Self-evident code does without.

## The panel

The listening panel is a lens for thinking rather than an authority a file can cite. A verdict written to disk reads back next session as specification, so what survives a panel is a decision in your own voice, argued on its own merits.

## Studio updates

```sh
python3 <music_loom>/scripts/check_updates.py .
```

Prints every convention directive logged since the stamp in `.music_loom.toml`. They are proposals for the session to raise, not patches. `--mark-read` advances the stamp, once the directives have actually been resolved.
