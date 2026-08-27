# INSTRUMENT_SLUG

TODO: one line — what it plays and how.

Built from music_loom. `.music_loom.toml` records the studio version this
descends from.

## Commands

```sh
./run.sh          # serve, first free port from 8000
npm test          # node --test test/ — pure logic, no AudioContext
```

## What always applies

- **Vanilla ES modules, no build step.** No bundler, no CDN, no framework.
- **Zero runtime dependencies.** `node-web-audio-api` is the only audio
  devDependency, and only so the graph can render headlessly.
- **Offline-renderable.** No browser-only node in a required path. A worklet may
  be preferred but must degrade to native nodes — an `OfflineAudioContext` has
  no `audioWorklet`.
- **Determinism.** Same seed, same output. Seeded RNG, independent streams per
  layer. If anything sits outside the seeded contract, say so where it happens.
- **Scale degrees, not absolute pitch,** in anything sequenced. Key and mode stay
  free to change.
- **No per-hit scheduling of a repeating part.** Persistent graphs with
  retriggered envelopes, or one looped bar-length buffer.
- **Sample rates converted on the way in, never assumed.**
- **Reverb impulses normalised to unit energy**, `ConvolverNode.normalize =
  false`.
- **Served over HTTP, never `file://`.**

## Working method

- **Measure, don't guess.** Render offline and read the numbers before forming a
  theory. Ears are low-resolution.
- **Distrust the harness before the output.** Confirm it measures what you think.
- **After one failed attempt, bisect.** Minimal repro, diff against known-good.
- **Cite the digest section beside the number.** A constant that came from
  research carries `// §N — <what it is>` next to it.

## Code style

- `camelCase` functions and variables, `PascalCase` classes, `UPPER_SNAKE`
  module constants.
- Parameters normalised 0–1 at the UI boundary, mapped to real ranges on use.
- Comments explain *why*. Skip them on self-evident code.
- Validate at boundaries — decoded buffers, file inputs, CLI args. Trust
  internal functions.
- One path, no fallbacks. Fail loudly.

## Panel on disk

The listening panel is a lens for thinking, not an authority a file can cite.
Never write a persona's verdict to disk — an opinion parked in a file reads back
next session as specification. Say why the thing is true on its own merits.

## Studio updates

```sh
python3 <music_loom>/scripts/check_updates.py .
```

Prints every convention directive logged since the stamp in `.music_loom.toml`.
Propose them to the user; never auto-apply. `--mark-read` advances the stamp,
and only after the directives are actually resolved.
