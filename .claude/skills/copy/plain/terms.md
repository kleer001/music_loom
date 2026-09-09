# Jargon decisions — music_loom

Audience for public copy (README.md and any page a stranger lands on): someone
comfortable with JavaScript, curious about making sound, who has never used the
Web Audio API and does not know this repo's vocabulary.

Internal documents — CLAUDE.md, RESEARCH.md, the rack unit READMEs, the research
digests — have a different audience and are not held to this list. A digest is
written for someone building the thing it describes.

## Domain terms

Words no dictionary holds, or ordinary words this project uses as terms. Listed
so the detector raises them; each still needs a decision.

- riddim
- colotomic
- gamaka
- jangdan
- ajnas
- irama

## Decided - keep and gloss

- AudioContext: the browser's audio engine, created on a click because browsers
  will not start audio without one
- bud: to split a finished instrument into its own repository, keeping its
  history and a note of the studio version it grew up in
- rack: the equipment the studio keeps until an instrument wants it, copied in
  rather than depended on
- FFT: keep, and say at first use what it is for — "an FFT for reading a sound
  as the frequencies inside it". A plain substitute would name a different thing

## Decided - replace

Slogans and terms of art that were standing where a plain fact belonged.

- travels clean: say what actually leaves with the instrument
- renders headlessly: runs without a browser, writing a file instead of a sound
- spectral centroid: how bright it is
- DC offset: (drop it from public copy; it belongs in the harness docs)
- RMS: how loud it is
- band energy: how much energy in the bass against the top
- devDependency: development dependency, spelled out on first use
- apparatus: equipment
- grafting: copying it in
- graft: say what happens instead — copied into your project rather than
  installed as a dependency
- rung: unit. The ladder is internal, and the order it implies is explicitly not
  a sequence of gates
- FM: spell out frequency-modulation. The acronym is only obvious to someone who
  already knows the synthesis
- psychoacoustics: describe the question instead — a reason for where one
  frequency band should end and the next begin

## Decided - fine as-is

Genre and tradition names are the payload, not a leak — a reader who does not
know `maqam` still learns that the research goes wide. Glossing all of them
would cost a paragraph and buy nothing.

- dubstep
- gamelan
- maqam
- psytrance
- shakuhachi
- tuvan
- techno
- techno's
- mensuration
- inharmonic
- wavetable
- raga

Instrument names, unglossed inside the list of percussion they belong to. The
company they keep says they are instruments, which is all the sentence needs
them to say:

- cabasa
- guiro

Transparent compounds for a reader curious about making sound:

- microtiming

Known to the audience by assumption:

- repo
- CDN
- ES modules
- MIDI
- MIT
- Node
- WAV

Ordinary English the frequency check raises because the document is about it:

- sound

Not acronyms — filenames the detector cannot tell apart from initialisms:

- CLAUDE
- RIGHTS
- INDEX
