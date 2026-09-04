# music_loom

A workbench for building instruments that play themselves.

An idea starts as something you heard — a record, a technique, an instrument you can't stop thinking about. It gets read about properly, written down as something you could build from, prototyped until it makes sound, measured to find out whether it makes the sound you meant, and then it leaves: its own repository, its own life, its own name.

Nothing ships from here. The instruments that leave do.

## What it is like to use

Open a session at the repo root and name an inspiration. Dub techno's echo, the way a shakuhachi phrase is exactly one breath long, the inharmonic ring of a steel pan. The studio goes and reads about it — real sources, cited, with the numbers kept — and writes that up. From the write-up comes a spec: what the sound is, how it is made, and what would count as having made it. Then you build against the spec.

```sh
python3 scripts/new_instrument.py my-instrument
cd bench/my-instrument && ./run.sh
```

That is a working instrument in a browser, immediately, on the first free port. From there the studio hands over apparatus as you need it — a shared audio core, an effects rack, a library of voices, a harness that renders your graph offline and tells you what it actually sounds like. You take what you reach for and nothing else.

## Why it is built this way

**Plain Web Audio, no build step, no dependencies.** The browser loads the source as written. An instrument that leaves here has nothing to install and nothing to keep up with.

**The same graph renders headlessly.** Which means you can measure it. Ears catch that something changed; a spectrum tells you how much, and whether it changed the way you predicted. A studio where you can be wrong on purpose is worth more than one where everything sounds fine.

**Research before code.** A constant somebody guessed is a constant nobody can defend six months later. The digests in `research/` cover dub techno, psytrance flute, wavetable and FM synthesis, dubstep down to the anatomy of a drop, and a long survey of world and historical traditions — raga, gamelan, maqam, Tuvan overtone singing, medieval mensuration canon — read for what they actually specify about tuning, instrumentation and form.

**A stocked pantry.** Recorded percussion and pitched loops, machine noise, public-domain tunes as MIDI, and the tools that indexed them. All of it accounted for in `pantry/PROVENANCE.md`, because an instrument you might publish should not carry material whose terms nobody checked.

**Instruments grow up and move out.** A budded instrument keeps a stamp saying which version of the studio it descends from, so when a convention here gets better it can come and find out what changed.

## Where to look

`CLAUDE.md` is the studio brief — the working method, the house stack, and what has tended to break. `RESEARCH.md` is how a musical claim earns its place. `RIGHTS.md` is what a shipped recording carries with it. `rack/` holds the apparatus, `research/` the reading, `pantry/` the sound.

MIT.
