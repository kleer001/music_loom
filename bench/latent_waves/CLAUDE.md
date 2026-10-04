# latent_waves

Recordings encoded with pretrained RAVE models, changed in latent space (dials, meld, stretch, decoder bends), and decoded — a Python bench with an audition page.

Built from music_loom. `.music_loom.toml` records the studio version this descends from.

## Commands

```sh
./fetch_models.sh                          # pretrained models → ~/.cache, symlinked as models/
.venv/bin/python latent.py info MODEL      # sample rate, latent size, decoder layers
.venv/bin/python latent.py proof MODEL A B # render and check SPEC-SHEET predictions
./run.sh                                   # audition page over tmp/renders/manifest.json
.venv/bin/python live.py serve             # live instrument at /live.html, audition at /index.html
.venv/bin/python live.py render S.json OUT.wav   # the live block loop offline, from timed control changes
.venv/bin/python live.py proof MODEL       # live predictions: corner, level, decode time
.venv/bin/python live.py check MODEL       # live run into a temporary null sink: underruns, control delay
node --test test/                          # page logic (src/controls.js)
```

The bench takes the trade the house stack describes below: Python and PyTorch rather than Web Audio, because the models ship as TorchScript. Two facts about the exports cost time and are handled in `latent.py`:

- **Exports are stateful.** Streaming caches and `last_z` carry over between calls, and older exports rebind some buffers to larger tensors on the first call. `Model.reset()` rebinds every buffer, by name, to its load-time value before each encode and decode.
- **Encoding is random too.** The encoder samples its posterior: two unseeded encodes of one file differ, in some models by more than the latent's own spread. `Model.encode` seeds, like `Model.decode`.
- **Call size changes the noise.** The decoder's noise synthesizer draws a different random sequence for a different number of steps per call, so a block-wise decode never nulls against a whole-file decode of the same latent. Timing agrees; compare block-wise against block-wise.
- **The stored frame ratio can be wrong.** `ircam_darbouka_onnx` stores 128 samples per latent frame and decodes 2048. `Model` counts the ratio from a decode of zero frames instead of reading it.
- **The sample rate is not always at the top.** Older exports wrap the model in `_rave` and store `sampling_rate` there; `_sample_rate()` checks both, then a `_r48000` tag in the file name, then `CONFIG_SR` (one model, rate taken from its training config), and fails if none is found.

The live engine (`live.py`) adds three facts:

- **Encoding resets the stream.** An encode or a whole-file decode rebinds the model's buffers, so the `Library` encodes with a worker copy of the model and never touches the copy that plays.
- **Decode cost is mostly per call.** One latent step per call runs at 35–144% of real time; a block of 8192 samples (four steps for most models) at 9–50% (99th percentile, `RESULTS.md`). `BLOCK_SAMPLES` sets the block; the `Player` decodes a block only when the audio not yet written has fallen to the slowest recent decode plus a margin, and keeps the pipe to `pw-cat` at one page, so the control delay stays near the decoder's own.
- **The page does not make sound.** `live.html` posts control changes to `/api/control` and polls `/api/state`; the trail is replayed by the engine, so it keeps time when the tab is in the background.

## House stack

- **Vanilla ES modules, no build step.** No bundler, no CDN, no framework.
- **Zero runtime dependencies.** `node-web-audio-api` is the only audio devDependency, and only so the graph can render headlessly.
- **Served over HTTP.** ES modules and `AudioWorklet` do not load from a `file://` path.

## What has tended to break

Consequences rather than rules. An instrument that wants the trade can take it, and a note here saying so keeps the next reader from treating it as a slip.

- **Worklets do render offline.** `node-web-audio-api` 2.x supports
  `audioWorklet` on an `OfflineAudioContext`. Its `addModule` wants a filesystem
  path rather than a `URL`, and its loader needs `Promise.withResolvers` — Node 22,
  or a small polyfill. `dsp/comp.js` shows both shims if you graft R5.
- **Anything that must agree between a render and a browser belongs in a worklet.**
  A `BiquadFilterNode` diverges from Chrome as its corner drops, completely by
  about 1 Hz, and a `DelayNode` in a feedback loop has different implicit latency
  in each. JS you wrote runs the same in both.
- **Unseeded sources.** Seeded RNG with an independent stream per layer gives the same output from the same seed, and lets one layer be edited without reshuffling the others. Real-time humanisation often sits outside that deliberately; saying so where it happens saves a hunt later.
- **Absolute pitch in a sequencer.** Scale degrees retune when key or mode changes. MIDI numbers do not, and converting afterwards is a rewrite.
- **Per-hit scheduling of a repeating part.** Nothing frees a source that has finished, so CPU per audio second climbs with length — measured at ~36x by five minutes, against flat for a persistent graph with retriggered envelopes or a bar-length buffer looped by one node. A part that genuinely varies per hit is a different case.
- **Assumed sample rates.** A buffer decoded at one rate and played at another is off in both pitch and length.
- **`ConvolverNode.normalize` at its default.** Web Audio rescales the impulse by its own energy, so a return fader tracks decay time instead of level. Normalising to unit energy with `normalize = false` separates them.

## Working method

- **Measuring settles what guessing proposes.** Render offline and read the numbers. Ears catch that something changed; a spectrum says how much.
- **The harness can be wrong too.** A surprising number is worth checking against a known signal.
- **Bisection after one failed attempt.** Minimal repro, diff against known-good.
- **A number carries its reason.** A constant that came from research carries the reason next to it, written out rather than pointed at.

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
