# Candidates — material considered, not held

`PROVENANCE.md` accounts for every file in the pantry. This is its counterpart: material that would suit an instrument built here, with its licence status as far as it has been checked, and the reason it has not been taken.

A row moves from here to `PROVENANCE.md` when the files are actually in the tree and the licence has been read at its source. Nothing on this page has been downloaded.

## 1. What the pantry holds now, and what it does not

Thirteen pitched sustain loops and fifty-two percussion one-shots from VCSL, five machine loops, ten public-domain MIDI tunes. All CC0 apart from one Mutopia arrangement.

Against `research/world_forms/`, that covers frame drum, rattle, cabasa, guiro, rain stick and a flute. Twenty-six traditions are described there and the pantry has recorded material for almost none of the instruments they name — no siku or quena, no steel pan, no gamelan metallophone, no shakuhachi, no oud or ney, no sitar or tanpura, no morin khuur, no overtone or throat singing, no Georgian or Sardinian vocal ensemble.

## 2. Sampled instruments

| Source | What it is | Licence | Status |
|---|---|---|---|
| [VCSL](https://github.com/sgossner/VCSL) — the rest of it | Dozens of orchestral, world and experimental instruments, professionally recorded | CC0 | **Best first move.** The pantry already draws on it, the tools in `pantry/tools/py/` already process it, and the licence is settled |
| [VSCO 2 Community Edition](https://versilian-studios.com/vsco-community/) | Open chamber orchestra from the same studio | CC0 | Clean. Orchestral rather than world |
| [University of Iowa Electronic Music Studios](https://theremin.music.uiowa.edu/) | Chromatic single-note recordings of orchestral instruments | Stated as free to use; **terms not read at source** | Verify before taking |
| [Sonatina Symphonic Orchestra](https://github.com/peastman/sso) | SFZ orchestral library | Reported as permitting commercial use with attribution. GitHub reads the repository licence as unrecognised, so the terms live in the distribution rather than in a standard file | Read the distribution's own terms before taking |
| [Philharmonia](https://philharmonia.co.uk/resources/sound-samples/) | Thousands of orchestral, world and percussion samples, multiple dynamics and articulations | CC-BY-SA 3.0 | **Rejected** — see §6 |
| [Freesound](https://freesound.org/), CC0 filter only | Field and instrument recordings, per-file licensed | CC0 where filtered | The realistic route to the world-forms instruments above. Per-file verification, one row each |

## 3. Impulse responses

The rack's three reverbs convolve a synthesised impulse from `core/dsp.js` — `impulse()` and `springImpulse()`. Nothing here has ever convolved a recorded space.

| Source | What it is | Licence | Status |
|---|---|---|---|
| [OpenAIR](https://www.openair.hosted.york.ac.uk/) | Community library of measured acoustic spaces, University of York | Creative Commons, **varying per file** | Per-file check; several are CC-BY with named contributors |
| [EchoThief](http://www.echothief.com/) | Over a hundred real spaces sampled across North America | Offered free; **terms not read at source** | Verify before taking |
| [Voxengo](https://www.voxengo.com/impulses/) | Assorted free IRs | **Terms not read at source** | Verify before taking |

Whatever arrives, the impulse wants normalising to unit energy with `ConvolverNode.normalize = false`, for the reason recorded in `CLAUDE.md`: at its default, Web Audio rescales by the impulse's own energy, so a return fader ends up tracking decay time instead of level.

## 4. Tuning tables

| Source | What it is | Licence | Status |
|---|---|---|---|
| [Scala scale archive](https://www.huygens-fokker.org/scala/downloads.html) | Version 94, March 2026, roughly 5,350 `.scl` files covering equal temperaments, just intonation, historical and traditional scales | **None stated** | **Unresolved** |

Freely downloadable for two decades and widely mirrored, but the archive states no licence and free download is not a grant. `RIGHTS.md` treats an absent licence as unresolved.

The practical split: reading a handful of scales to check a `.scl` parser is a private act with no distribution attached, and shipping five thousand files inside an instrument is not. A small hand-authored set of tunings — pelog, slendro, a 53-tone frame, Pythagorean, a few maqam ajnas — written from the numbers in `research/world_forms/` would carry the studio's own provenance and sidestep the question. That is more work and fewer scales, and it is defensible.

## 5. Notated and symbolic material

`pantry/midi/` holds ten tunes with a full public-domain determination each, and `midi/CATALOG.md` records four strong candidates that were skipped because no repository offered the *file* with a verifiable status — St. Louis Blues, Frog Legs Rag, Shenandoah, St. James Infirmary. Those remain open.

Beyond ragtime and jazz, [Mutopia](https://www.mutopiaproject.org/) and [IMSLP](https://imslp.org/) hold public-domain scores across the European tradition, including the medieval and Renaissance repertory `world_forms/medieval_polyphony.md` and `mensuration_canon.md` describe. A composition being public domain does not make a given modern edition or sequence public domain — that distinction is what `midi/CATALOG.md` already works through, and it applies again here.

## 6. Rejected, with reasons

**Philharmonia.** CC-BY-SA 3.0, and the terms permit commercial use but state the samples must not be sold or made available *as is*, that is, as samples or as a sampler instrument. A pantry is precisely a set of samples made available as is, so the restriction bites the use rather than a corner of it. Share-alike would also propagate into every daughter that touched them. Excellent material, wrong shape.

**mfiles.co.uk MIDI.** Good sequences of public-domain tunes under a blanket all-rights-reserved assertion over the site's content. Already recorded in `midi/CATALOG.md`.

**Anything with an unread licence.** Four rows above are marked "terms not read at source". They are candidates, not approvals, and the marking is the point.

## 7. What a row needs before it moves

`RIGHTS.md` sets the format. In practice: the licence read at the source rather than from a summary or a search result; the date it was read; the three clocks — composition, recording, transcription — tracked separately wherever they differ; and any attribution or share-alike obligation stated where it will be seen by whoever ships an instrument, not only here.

The four skipped MIDI candidates in `midi/CATALOG.md` are the worked example of the standard: the compositions were confirmed public domain and the files were still skipped, because no repository stated a status for the file.
