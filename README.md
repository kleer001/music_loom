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

That gets you a page on the first free port, with a start button that opens an `AudioContext` — the browser's audio engine — and a `TODO` where your sound goes. Everything around the sound is already done: the server, the click-to-start a browser insists on, the test runner, the licence.

After that you take equipment as you need it, by copying it in: a shared audio core, an effects rack, a library of voices and samplers, a harness for measuring what you built. Nothing arrives that you did not ask for.

## Why it is built this way

**A new instrument starts empty. The tools that made it stay behind.** This repo runs on Python, Node and bash — a scaffolder, a script that tells an instrument when the studio's conventions have moved on, and the offline tools that trimmed the sample library and prepared the sound banks. None of that goes with you. What the scaffolder hands you is `devDependencies: {}`, a test command that passes on a plain Node install, and JavaScript the browser runs as written: no bundler, no framework, nothing fetched from a CDN. Copy in the measuring harness and that becomes one development dependency. What you add after that is your call — the stack described here is what has worked, not a limit on what you can build with it.

**The same graph can run without a browser, writing a file instead of a sound.** That holds as long as nothing in the signal path is browser-only — the effects here that reach for an `AudioWorklet` fall back to ordinary nodes for exactly this reason. What it buys is numbers — how loud, how bright, how wide, how much energy in the bass against the top. None of that says whether it sounds good; ears do that. What it says is *how far the thing moved when you changed something*, which is the question ears are worst at. A change you predicted and then measured is a change you understand.

**Research before code.** A constant somebody guessed is a constant nobody can defend six months later. The digests in `research/` cover dub techno, psytrance flute, wavetable and frequency-modulation synthesis, dubstep down to the anatomy of a drop, jazz voice leading, and a long survey of world and historical traditions — raga, gamelan, maqam, Tuvan overtone singing, medieval mensuration canon — each read for what it actually specifies about tuning, instrumentation and form.

**A stocked pantry.** Recorded percussion and pitched loops, machine noise, public-domain tunes as MIDI, and the tools that indexed them. Every file traces to a release that states its terms, tracked in `pantry/PROVENANCE.md`, because an instrument you might publish should not carry material whose licence nobody read.

**Instruments grow up and move out.** When one is finished it is split off into a repository of its own, keeping its full history and a note of which version of the studio it grew up in — so when something here improves, it can come back and ask what changed. That whole mechanism is built and tested, and no instrument has used it for real yet.

## Where to look

`CLAUDE.md` is the studio brief — the working method, the house stack, and what has tended to break. `RESEARCH.md` is how a musical claim earns its place. `RIGHTS.md` is what a shipped recording carries with it. `rack/` holds the equipment, `research/` the reading, `pantry/` the sound.

MIT.
