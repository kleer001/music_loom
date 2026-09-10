# music_loom

A workbench for building things that make sound in a browser.

An idea starts as something you heard — a record, a technique, an instrument you can't stop thinking about. It gets read about properly, and written down as something you could build from. You prototype it until it makes sound. You measure, to find out whether it makes the sound you meant. Then it leaves, into a repository of its own.

Nothing ships from here. The instruments that leave do.

## What it is like to use

Open a session at the repo root and name an inspiration. Dub techno's echo. A shakuhachi phrase that runs the length of one breath. A steel pan hammered until its partials fall into tune. The studio goes and reads about it, from real sources, with the numbers kept, and writes that up. From the write-up comes a spec: what the sound is, how it's made, and what would count as having made it. You build against the spec.

```sh
python3 scripts/new_instrument.py my-instrument
cd bench/my-instrument && ./run.sh
```

That gets you a page on the first free port, with a start button that opens an `AudioContext` — the browser's audio engine — and a `TODO` where your sound goes. Everything around the sound is already done: the server, the click-to-start a browser insists on, the test runner, the licence.

After that you copy in equipment as you need it: a shared audio core, an effects rack, voices, samplers, a harness for measuring what you built. Nothing arrives that you didn't ask for.

<details>
<summary><b>What's already on the shelves</b></summary>

<br>

**The reading**

- **Technique digests.** Dub techno's echo, psytrance flute, wavetable and frequency-modulation synthesis, dubstep drop anatomy, jazz voice leading.
- **A couple of dozen world and historical traditions.** Indian raga, Javanese gamelan, Irish sean-nós, Tuvan overtone singing, and more.
- **One schema across all of them.** Tuning, instrumentation, performance structure. Every tradition, the same three sections.
- **The primary papers for the signal work.** A table says which ones you can read for free.

**The equipment.** Six units. You copy them in; you don't depend on them.

- **Core.** Seeded random numbers, scales and MIDI conversion, note scheduling, an FFT.
- **Effects.** Delay, reverb, filters, a mix bus, a master chain.
- **Voices and samplers.** Wavetable voices, sample playback, patch definitions.
- **Render and measure.** Runs the whole graph without a browser. Prints what it measured.
- **Spec sheet and release checklist.** One at each end of the work.

**The sound**

- **Fifty-odd percussion one-shots.** Frame drum, rattle, cabasa, guiro, rain stick, at several force levels.
- **Pitched sustain loops.** Two octaves. Loop points written into the file itself.
- **Machine noise.** A 3D printer, an industrial texture, a drum loop.
- **Ragtime and traditional melodies.** Scott Joplin and older, as MIDI.
- **Every file traced to its licence.** Including the date somebody read it at the source.

You start with a floor, not an empty room. Not a finished library either: groove and microtiming are missing, and so is any reason for where one frequency band should end and the next begin. Both are listed as gaps at the end of `research/INDEX.md`.

</details>

## Why it is built this way

**A new instrument starts empty. The tools that made it stay behind.** This repo runs on Python, Node and bash. A scaffolder. A script that tells an instrument when the studio's conventions have moved on. Offline tools that trimmed the sample library and prepared the sound banks. None of that goes with you. What the scaffolder hands you is `devDependencies: {}` and a test command that passes on a plain Node install. The JavaScript is what the browser runs, as written: no bundler, no framework, nothing fetched from a CDN. Copy in the measuring harness and that becomes one development dependency. What you add after that is your call — the stack described here is what has worked, not a limit on what you can build with it.

**The same graph can run without a browser, writing a file instead of a sound.** What it buys is numbers — how loud, how bright, how wide, how much energy in the bass against the top. Numbers don't say whether it sounds good; ears do that. They say *how far the thing moved when you changed something*, which is the question ears are worst at. A change you predicted and then measured is a change you understand.

**Research before code.** A constant somebody guessed is a constant nobody can defend six months later. So the reading comes first, and the number that comes out of it carries its reason written beside it.

**A stocked pantry.** Every file traces to a release that states its terms, because an instrument you might publish shouldn't carry material whose licence nobody read. `pantry/PROVENANCE.md` is the ledger.

**Instruments grow up and move out.** When one is finished it splits off into a repository of its own. It keeps its full history, and a note of which version of the studio it grew up in. So when something here improves, the instrument can come back and ask what changed. The split is `git subtree split`, so nothing is lost; the channel back has tests. No instrument has used either for real yet.

## Where to look

`CLAUDE.md` is the studio brief — the working method, the house stack, and what has tended to break. `RESEARCH.md` is how a musical claim earns its place. `RIGHTS.md` is what a shipped recording carries with it. `rack/` holds the equipment, `research/` the reading, `pantry/` the sound.

MIT.
