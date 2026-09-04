# music_loom

A workbench for building things that make sound in a browser.

An idea starts as something you heard — a record, a technique, an instrument you can't stop thinking about. It gets read about properly, written down as something you could build from, prototyped until it makes sound, measured to find out whether it makes the sound you meant, and then it leaves: its own repository, its own life, its own name.

Nothing ships from here. The instruments that leave do.

## What it is like to use

Open a session at the repo root and name an inspiration. Dub techno's echo, the way a shakuhachi phrase is exactly one breath long, the inharmonic ring of a steel pan. The studio goes and reads about it — real sources, cited, with the numbers kept — and writes that up. From the write-up comes a spec: what the sound is, how it is made, and what would count as having made it. Then you build against the spec.

```sh
python3 scripts/new_instrument.py my-instrument
cd bench/my-instrument && ./run.sh
```

That gets you a page served on the first free port, with a live `AudioContext` behind a start button and a `TODO` where the graph goes. The scaffolding is done — the server, the gesture handling, the test runner, the licence, the stamp — so the first thing you write is the sound.

From there the studio hands over apparatus as you reach for it: a shared audio core, an effects rack, a library of voices and samplers, a harness that renders your graph offline so you can measure it. You take what you want and nothing else.

## Why it is built this way

**The tooling stays behind; the instrument travels clean.** The studio itself is Python, Node and bash — a scaffolder, a version-stamp checker, and the offline tools that trimmed the samples and derived the wavetable and patch banks. None of that leaves with the instrument. What leaves is plain Web Audio and ES modules the browser loads as written: no bundler, no framework, no CDN, zero dependencies, and tests that pass on a bare Node install. Grafting the measurement harness adds one devDependency, and it is the only one the house stack has ever needed.

**The same graph renders headlessly.** Which means you can measure it: peak and RMS, DC offset, stereo width, spectral centroid, band energy. That does not tell you whether it sounds good — ears do that. It tells you *what changed, and by how much*, which is how you find out whether it changed the way you predicted.

**Research before code.** A constant somebody guessed is a constant nobody can defend six months later. The digests in `research/` cover dub techno, psytrance flute, wavetable and FM synthesis, dubstep down to the anatomy of a drop, jazz voice leading, and a long survey of world and historical traditions — raga, gamelan, maqam, Tuvan overtone singing, medieval mensuration canon — each read for what it actually specifies about tuning, instrumentation and form.

**A stocked pantry.** Recorded percussion and pitched loops, machine noise, public-domain tunes as MIDI, and the tools that indexed them. Every file traces to a release that states its terms, tracked in `pantry/PROVENANCE.md`, because an instrument you might publish should not carry material whose licence nobody read.

**Instruments grow up and move out.** A budded instrument keeps a stamp naming the studio version it descends from, so when a convention here improves it can ask what changed. The mechanism is built and tested; no instrument has used it in anger yet.

## Where to look

`CLAUDE.md` is the studio brief — the working method, the house stack, and what has tended to break. `RESEARCH.md` is how a musical claim earns its place. `RIGHTS.md` is what a shipped recording carries with it. `rack/` holds the apparatus, `research/` the reading, `pantry/` the sound.

MIT.
