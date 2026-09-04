# INSTRUMENT_SLUG

TODO: one line — what it plays, and what makes it worth hearing.

```sh
./run.sh
```

Serves on the first free port from 8000 and prints the URL. Click once to start audio; a browser will not run an `AudioContext` without a gesture. Opening `index.html` directly gets a blank page — ES modules and `AudioWorklet` do not load over `file://`.

Plain Web Audio, ES modules, no build step and nothing to install.

```sh
npm test
```

Pure logic only. Audio is verified by rendering it offline and measuring the output, not by asserting on the shape of the graph.

## Lineage

Built from [music_loom](https://github.com/kleer001/music_loom), a workbench for procedural instruments. The version this descends from is stamped in `.music_loom.toml`; `check_updates.py` in the studio reports what has changed since. Apparatus this instrument has not needed yet — a render-and-measure harness, an effects rack, a library of voices — is waiting there.
