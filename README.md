# music_loom

A workbench for procedural instruments. Musical ideas get researched, specced,
prototyped to something that plays, measured, then budded into their own repo.

This repo is not an instrument. It holds the apparatus that instruments are
built from, and the process that gets them out the door.

## The flow

```
inspiration ──▶ research digest ──▶ spec sheet ──▶ prototype ──▶ measure ──▶ bud
                 research/            SPEC-SHEET.md   bench/<slug>/  rack/R3   BUDDING.md
```

Open a Claude Code session at the repo root — `CLAUDE.md` loads automatically
and turns the session into the studio.

Name a musical inspiration. It gets researched against real sources under the
gate in `RESEARCH.md`, written up as a technique digest, and turned into a spec
sheet. You prototype against that spec on the house stack. When it plays and
measures clean, it buds out.

## Start an instrument

```sh
python3 scripts/new_instrument.py my-instrument
cd bench/my-instrument
./run.sh              # serves on the first free port from 8000
```

The instrument is born with nine files. Everything else — the shared core, the
render harness, the release checklist — arrives by grafting the rack unit for
the rung you have reached.

## The rack

Apparatus held here until an instrument needs it. Grafted by copy, not by
generator or dependency.

| Unit | Rung | Graft when |
|---|---|---|
| `rack/R1-spec` | Spec and panel | Shaping the idea, and again once it plays |
| `rack/R2-core` | Shared core library | Real audio code is being written |
| `rack/R3-measure` | Offline render and metrics | Something makes sound and needs verifying |
| `rack/R4-release` | Publishing and release gate | Heading for a page someone else will read |

`rack/R2-core/core/` is the library that already appears, byte-identical, in
more than one instrument: seeded RNG, pitch and harmony, FFT and noise, WAV and
AIFF codecs, measurement, and the sixteenth-grid lookahead scheduler. It has no
dependencies and runs unchanged in Node and the browser.

## House stack

Vanilla JavaScript, ES modules, no build step. Web Audio API, zero runtime
dependencies. `node-web-audio-api` as the only audio devDependency, so the same
graph renders headlessly through `OfflineAudioContext`. `node --test` for pure
logic. Served over HTTP, never `file://`. MIT.

The full set of constraints, and what breaks when you ignore one, is in
`CLAUDE.md`.

## Verification

Ears are low-resolution. Every instrument carries a render-and-measure harness:
bounce the graph offline to WAV and read peak, RMS, DC, stereo width, spectral
centroid and band energy. A change is verified when the numbers move the way you
predicted, not when it sounds fine.

## The daughters

An instrument that buds out carries a `.music_loom.toml` stamp recording the
studio version it descends from. When a convention here improves, running

```sh
python3 /path/to/music_loom/scripts/check_updates.py .
```

from the daughter prints every directive logged since that stamp. The daughter's
session proposes the changes; it never applies them silently. `CONTRIBUTING.md`
covers the tie, `BUDDING.md` covers the split.

## Gates

- `RESEARCH.md` — how a musical claim earns its place. No invented history, no
  fabricated gear specs, no half-remembered quotes.
- `RIGHTS.md` — every sample, tune and transcription accounted for before
  anything is published.
- `BIBLIOGRAPHY.md` — the prior art this studio's conventions descend from.
