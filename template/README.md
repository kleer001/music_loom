# INSTRUMENT_SLUG

TODO: one line — what it plays and how.

## Run

```sh
./run.sh
```

Serves on the first free port from 8000 and prints the URL. Click once to start
audio; browsers do not run an AudioContext without a gesture.

Never open `index.html` as a `file://` path — ES modules and `AudioWorklet` do
not load from the filesystem.

## Test

```sh
npm test
```

Pure logic only. Audio is verified by rendering it offline and measuring the
output, not by asserting on the graph.

## Layout

```
index.html     entry point
styles.css
run.sh         dev server
src/main.js    graph construction and scheduling
test/          node --test, no AudioContext
SPEC-SHEET.md  the sketch; delete once it plays
```

Everything else — the shared core library, the render-and-measure harness, the
release checklist — lives in music_loom and arrives when this instrument reaches
the rung that wants it.

## Lineage

Built from [music_loom](https://github.com/kleer001/music_loom). The version it
descends from is stamped in `.music_loom.toml`; `check_updates.py` in the studio
reports conventions that have changed since.
