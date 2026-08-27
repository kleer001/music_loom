# Cyberpunk Audio Engine — Song Sourcing & Notation

> Companion to [`cyberpunk_audio_spec.md`](./cyberpunk_audio_spec.md). Where the
> spec covers the *engine*, this covers the **content**: where the "songs" come
> from when the genre has no Real Book.

**Status:** exploration note (no code yet). **Home:** the engine targets a new repo;
this lives in ferine_town as a design reference, alongside the engine spec.

---

## 0. The question

ferine_town's jazz engine digests *tunes* — its `SONGS` table is built from lead
sheets: a chord chart + a motif, the fake-book model. Electronic genres don't have
fake books. So: **what is the source material for techno/trance/industrial "songs",
and how do we notate them?**

Short answer, and it's a happy one:

> There is **no Real Book** for these genres — and we don't need one. The part of
> jazz that *is* notated (specific, copyrighted melodies) is exactly the part the
> cyber engine doesn't require. Everything these genres are made of — progressions,
> scales, drum grids, bassline rhythms — is uncopyrightable **idiom**. We encode the
> idiom and **generate**, rather than transcribe. That's *cleaner* than the jazz
> path, not harder.

---

## 1. How these genres are actually notated

Research (sources at end) lands on a clear picture:

- **The native format is the DAW grid, not the score.** Producers work in the
  **piano roll** (MIDI notes as bars on a time×pitch grid) and the **step
  sequencer** (16-step on/off grids for drums and basslines). These *are* the
  notation. They map **directly** onto our `PATTERN` digest (spec §6): 16-step rows
  per voice + a scale/mode + a phrase arrangement.
- **Sheet music exists only at the edges.** Hal Leonard's *EDM Sheet Music
  Collection* and Musicnotes EDM transcriptions exist for **performance/transcription**,
  not production. No producer authors a track as staff notation. Irrelevant to us.
- **The closest thing to a "fake book" is the MIDI pack.** A large commercial (and
  partly free) ecosystem sells **MIDI construction kits**: chord progressions, bass-
  lines, arps, leads, stabs as `.mid` files — e.g. MIDI Klowd, Dance MIDI Samples,
  Transmission Samples, Big Fish. Free packs exist (35+ free trance progression MIDIs
  from Dance MIDI Samples; a 45-file free trance pack from Transmission). These are
  the genre's nearest analog to the Real Book — but they're **royalty-free product,
  not public-domain canon**, and licensing matters (see §4).
- **There is no comprehensive transcription database** of famous tracks the way
  iReal Pro catalogs standards. Track knowledge lives in **tutorials and forum
  breakdowns** ("how Deadmau5 'I Remember' is built"), which teach *idiom*, not a
  reusable corpus.

**Implication:** the jazz "digest a lead sheet" pipeline has no direct input here.
The native input — grid patterns — is something we **author or generate**, not
harvest from a canonical book.

---

## 2. The liberating insight: idiom isn't copyrightable

A happy side-benefit shapes the whole strategy — the parts we lean on are the free ones:

- **Chord progressions are not copyrightable.** Courts treat them as "the common
  stock of musical raw material" — too fundamental and un-original to protect. The
  same goes for **scales/modes**, **rhythms**, and **drum-grid patterns** (four-on-
  the-floor, off-beat hats, backbeat clap).
- **What *is* protected** is a distinctive **melody / voice-leading line** — the
  specific tune on top, if original enough.

So the genre's entire skeleton — `i–VI–III–VII` in Aeolian, a rolling sidechained
off-beat 16th bass, a 303 line with slide+accent, an arp climbing the Phrygian — is
**free to encode**. The one thing we skip is a *specific famous melodic hook* — and we
wouldn't want it anyway: the engine **generates** its leads procedurally, in idiom, the
way the jazz engine improvises rather than replaying a recording. It's more fun, and it
happens to sidestep the one part that carries copyright.

That makes it a cleaner story than the jazz engine, which digests named tunes.

---

## 3. The jazz-engine precedent (and how ours differs)

The jazz engine already avoids copyrighted material: its shipped `SONGS`/contexts
use **public-domain traditionals** — *Greensleeves*, *House of the Rising Sun*,
*Maple Leaf Rag* (Joplin, 1899) — plus **generic forms** like a bare `ii–V–I`. It
never ships a Real Book standard.

The cyber engine takes the same principle one step further:

| | Jazz engine | Cyber engine |
|---|---|---|
| Unit | A digested *tune* (chords + motif) | A `PATTERN` (drum grid + progression + bass/arp template) |
| Melody | Quotes a PD motif, then improvises | **No quoted hook** — leads generated in idiom |
| Source | PD lead sheets + originals | **Idiom archetypes** (progressions/grids) + originals |
| Legal surface | Relies on tunes being PD | Relies on idiom being uncopyrightable (stronger) |

**The cyber "song library" is a library of archetype generators, not transcriptions.**

---

## 4. Sourcing options (ranked)

### A. Procedural idiom generators — *recommended*
Encode the uncopyrightable archetypes (§5) as parameterized generators and let the
engine compose patterns deterministically from a seed (its own RNG, observe-only,
via its seeded RNG). This matches the engine's generate-don't-store leaning, keeps the
note data audio-file-free, and sits cleanly with copyright. A "genre" supplies the
archetype bank; `tension`/arrangement shape the realization (spec §6–7).

### B. Hand-authored originals in the sequencer tool
For signature, curated patterns (a specific club's anthem), author them by hand in
the **sequencer authoring tool** (spec §10) — our own IP, baked into a context like
a jukebox song. The cleanest *concrete* source: fully owned, fully original.

### C. Seed/reference from royalty-free MIDI packs — optional, with care
A royalty-free MIDI pack can be a **reference** for idiom or a starting point an
author reshapes. Cautions:
- **Royalty-free ≠ public domain.** Pack licenses typically let you *use the music
  in your productions* but **forbid redistributing the MIDI files themselves**. So
  we may study/adapt the *idea* (an uncopyrightable progression) but should not ship
  a vendored `.mid` from a pack as a data asset without a license that permits it.
- Prefer extracting the **uncopyrightable structure** (the progression, the rhythm)
  and re-encoding it as our own archetype, rather than embedding pack files.
- The vox sample layer now exists (the `sampleVox` voice — spec §4/§11a): real
  spoken-word clips chopped across the `vox` row through the FX rack. It's the place
  to be license-careful — audio, governed by the §11 sample-licensing story (and the
  per-source rights vetting in `research/spoken_word_sources.md`), not this note.

### D. Found-rhythm extraction — the machine as drummer
The most *industrial* idea of all: feed a machine recording (washing machine, dryer,
press, HVAC, engine) and **transcribe its rhythm into a `PATTERN`** that drives the
synth drums/voices — the musique-concrète / Einstürzende-Neubauten lineage, the
factory as a drum machine. The pipeline is standard MIR (music information retrieval):
1. **Onset detection** (spectral flux / energy) finds the transient hits.
2. **Tempo / period estimation** (autocorrelation / beat-tracking) finds the machine's
   cycle → BPM + a grid.
3. **Timbre clustering** (k-means / NMF on each onset's spectrum) buckets hits by
   low/mid/high → **kick / snare / hat** roles (this is exactly how drum-transcription
   research maps found percussion onto a drum-machine grid).
4. **Quantize** onsets to the 16-step grid → emit a `PATTERN` (spec §6).

Tools: **librosa** (`onset_detect` / `beat_track`), **aubio**, **Essentia**
(`RhythmExtractor2013`), **madmom** — all Python; **Meyda** (MIT, JS/Web Audio) for the
browser.

**Run it offline, bake the pattern** (recommended). Do the analysis at *authoring*
time and bake the resulting `PATTERN` into the engine, so the **runtime stays
zero-dependency and deterministic** — no analysis library ships, no per-play variance.
This makes it a feature of the **sequencer authoring tool** (spec §10): *import a loop →
get an editable pattern*. (A live in-browser extractor with Meyda is possible but adds a
runtime dep + non-determinism — keep it to authoring.)

Conceptually this is the **inverse of resampling** (FX doc §7): resampling bounces the
engine *to* audio; found-rhythm ingests audio *into* the engine's symbolic pattern
domain. And you can do both — transcribe the machine into a pattern *and* keep its
grind as an industrial audio layer (spec §11).

> This found-rhythm idea is developed in full into its **own standalone concrète
> engine** — the machine corpus as instrument — in
> [`industrial_sound_engine_spec.md`](./industrial_sound_engine_spec.md). That engine
> can *export* patterns back here, so the two interoperate via the `PATTERN` format.

**Recommendation:** ship on **A** (generators) + **B** (a few authored signatures) +
**D** (found-rhythm for industrial texture); treat **C** as inspiration rather than a
vendored corpus.

---

## 5. The idiom vocabulary (what we actually encode)

This is the cyber engine's "fake book" — a bank of uncopyrightable archetypes.
Roman numerals are scale degrees; lowercase = minor quality.

### Progression families (mostly Aeolian/Dorian/Phrygian)
- `i–VI–III–VII` — the canonical uplifting-trance loop (natural minor).
- `vi–IV–I–V` / `I–V–vi–IV` — the modal/major "anthem" cadence (euphoric trance).
- `i–VII–VI–VII` — rocking minor vamp (tech-trance, melodic techno).
- **Andalusian / Phrygian descent** `i–VII–VI–V` (or `bVI–bVII–i`) — the dark,
  psychedelic acid/psy/industrial color.
- **Pedal-tone / static** — one chord or droned root for hypnotic techno, dub
  techno, dark ambient (movement comes from filter automation, not harmony).

### Drum archetypes (16-step grids)
- **Four-on-the-floor** kick (steps 1,5,9,13).
- **Off-beat open hat** (the "&" — steps 3,7,11,15): house/trance signature.
- **Backbeat clap/snare** on 2 & 4 (steps 5,13).
- **16th closed-hat** roll with velocity accents; **ghost** snares.
- **Breakbeat** (syncopated, sliced) — post-launch, needs the breakbeat sequencer
  (spec §7, §12).

### Bass templates
- **Rolling off-beat 16ths**, sidechained to the kick (trance/psy) — the most
  important single texture.
- **303 acid line** — stepwise within the mode, with per-step **accent** and
  **slide** flags; live filter automation is the "performance."
- **Pedal-tone EBM** — driving mono root, gated 16ths.
- **Reese** — detuned-saw sustained note through a moving LPF (DnB/dark).

### Arp / lead shapes
- 16th **up / down / up-down / as-chord** arps over the active progression.
- Supersaw lead phrases: arch contours resolving to chord tones (generated, never a
  quoted hook), with the breakdown exposing the melody.

### Structure
- **16-bar phrases**; introduce/remove one element per phrase.
- Arrangement: **intro → build → drop → peak → breakdown → outro** (the arrangement
  Markov, spec §6), biased per genre (trance = long arcs; hypnotic techno dwells in
  `peak`; ambient lives in `breakdown`).

Each **genre preset** (spec §7) selects from these banks: a tempo/swing, a drum
archetype set, a bass template, an arp/lead style, a progression family, and an FX
preset. That selection *is* a genre.

---

## 6. How a PATTERN gets made, in practice

Tying §4–5 to the engine (spec §6, §10):

1. The **genre preset** points at archetype banks (progression family, drum set,
   bass/arp templates).
2. The engine **generates** a concrete `PATTERN` from a seed — or an author hand-
   draws one in the **sequencer tool** for a signature track.
3. The pattern (`{ tonic, mode, rows{…}, chords?, arrangement }`) is **baked into a
   context** (district × time × tension) in the audio editor, exactly as jazz songs
   bake into contexts via `setConfig`.
4. At play time the engine realizes it over the 16-step clock with sidechain,
   automation, and humanization — no canonical corpus ever consulted.

**Net:** we never needed a Real Book. The genre's notation is the grid, the grid is
our `PATTERN`, and the musical ideas that fill it are free idiom we encode once.

---

## Sources

- [Piano roll notation (Electronic Music Wiki)](https://electronicmusic.fandom.com/wiki/Piano_roll_notation)
- [EDM Sheet Music Collection (Hal Leonard)](https://www.halleonard.com/product/280949/edm-sheet-music-collection)
- [How to Write Epic EDM Chord Progressions (EDMProd)](https://www.edmprod.com/chordprogressions/)
- [Trance MIDI packs (MIDI Klowd)](https://midiklowd.com/trance-midi-packs)
- [Free MIDI packs (Dance MIDI Samples)](https://www.dancemidisamples.com/category/free-packs/free-midi-packs-download-free-samples/)
- [Free Trance Sample & MIDI pack (Transmission Samples)](https://www.transmissionsamples.com/free-trance-samples-midi)
- [9 Trance Chord Progressions (Unison)](https://unison.audio/trance-chord-progressions/)
- [Andalusian cadence (Wikipedia)](https://en.wikipedia.org/wiki/Andalusian_cadence)
- [librosa `beat_track` — onset/tempo/beat extraction](https://librosa.org/doc/main/generated/librosa.beat.beat_track.html)
- [Essentia — beat detection & BPM (`RhythmExtractor2013`)](https://essentia.upf.edu/tutorial_rhythm_beatdetection.html)
- [Meyda — audio feature extraction for JS/Web Audio (MIT)](https://meyda.js.org/)
- [Alternate Level Clustering for Drum Transcription (onset clustering → kick/snare/hat)](https://www.researchgate.net/publication/278746894_Alternate_Level_Clustering_for_Drum_Transcription)
- [Can you copyright a chord progression? (Local 802 AFM)](https://www.local802afm.org/allegro/articles/can-you-copyright-a-chord-progression/)
- [Chord Progressions Copyright Law (LegalClarity)](https://legalclarity.org/are-chord-progressions-protected-by-copyright-law/)
- [Using a chord progression from a copyrighted song (Easy Song)](https://support.easysong.com/hc/en-us/articles/1500011426701-Can-I-Use-a-Chord-Progression-From-Someone-s-Copyrighted-Song-to-Create-My-Own-Song)
