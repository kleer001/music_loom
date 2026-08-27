# Game-Music Reference Corpus — analyses & study MIDI

A curated, sourced index of two things the song-structure work asked the
"wise old Internet" for: **(1) substantive musical *analyses* of famous game
music** (form, harmony, leitmotif — the *how it's built*), and **(2) where to
find reference *MIDI*** of that music to study voicing/structure. Companion to
the theory in [`game_music_structure.md`](./game_music_structure.md) and the
applied plan in
[`../docs/design/song_structure_migration.md`](../docs/design/song_structure_migration.md).

> **The rights rule — read first (this repo's standing ethos).** Just as
> `data/spoken_word.json` ships **no vendored audio** and
> [`spoken_word_sources.md`](./spoken_word_sources.md) only *points at*
> rights-vetted material, **nothing here is vendored and the famous-game MIDI is
> reference-only.** A MIDI transcription is a *derivative work*; the underlying
> composition stays under copyright
> ([US Copyright Office Circular 14](https://www.copyright.gov/circs/circ14.pdf),
> [Wikimedia Wikilegal: MIDI Files](https://meta.wikimedia.org/wiki/Wikilegal/MIDI_Files)).
> Downloading a VGMusic transcription to **study structure privately is the
> tolerated use; redistributing, bundling, or training-then-shipping is not** —
> Nintendo's 2024 takedowns hit even *licensed* fan sheet music
> ([Nintendo Life](https://www.nintendolife.com/news/2024/06/random-welp-now-nintendos-going-after-sheet-music)).
> **For anything we ship, use the CC0 / public-domain / research-licensed tier in
> §2.B — never a famous-game transcription.**

> **Verification caveat (as in [`VERIFICATION_NOTES.md`](./VERIFICATION_NOTES.md)).**
> Compiled by fan-out web research where `WebFetch` returned **HTTP 403 on
> essentially every host** — so links are **search-attested, not page-fetched.**
> URLs are live and cross-checked; spot-check load-bearing items (and especially
> **confirm the VGMIDI repo license in-repo**) in a browser before relying on
> them.

---

## 1. Musical analyses (the *how it's built*)

### Best general sources (start here)
- **8-bit Music Theory (YouTube)** — the single most rigorous *free* piece-by-piece
  resource: roman numerals + sheet music on screen, covering Mario, Zelda, FF,
  Sonic, Mega Man, **Hollow Knight leitmotif**, Undertale. https://www.youtube.com/c/8bitMusicTheory
  ([Hollow Knight leitmotif video](https://www.youtube.com/watch?v=5IZ6ObjdkPA))
- **Hooktheory — TheoryTab DB** — free interactive chord+melody+roman-numeral
  analyses for nearly every named piece below (SMB, Zelda, Corridors of Time,
  Wet Hands, Sweden, Megalovania). https://www.hooktheory.com
- **gamemusictheory.blogspot.com ("8-Bit Analysis")** — older but genuinely
  analytical, with sheet music (coins the "Mario cadence," dissects SMB2
  progressions, compares all 8-bit Zelda title themes).
  http://gamemusictheory.blogspot.com/
- **Ludomusicology.org** + the peer-reviewed **Journal of Sound and Music in
  Games** (UC Press, several open-access) — the academic field's hub.
  https://www.ludomusicology.org · https://online.ucpress.edu/jsmg
- **MuseScore "Daily Score" / Features** — solid editorial harmonic walkthroughs
  (the best free deep-dives on C418). https://musescore.com/news

### Per-piece structural findings (each a falsifiable claim + source)

**Super Mario Bros. (Koji Kondo).** Overworld theme in **C major**, its A-section
resolving *deceptively to vi rather than I*, syncopated melody driving motion;
the Underworld theme is its "musical negative" — chordless, hollow. The recurring
**"Mario cadence"** is a series signature; SMB2's B-section runs I–V/V–V7–I.
— Schartmann, *Koji Kondo's Super Mario Bros. Soundtrack* (33⅓, Bloomsbury 2015),
the first videogame title in the 33⅓ series
([review w/ analysis](https://www.criticsatlarge.ca/2015/05/bleeps-and-bloops-no-more-33-13-koji.html));
the cadence + SMB2 reading at
[gamemusictheory](http://gamemusictheory.blogspot.com/2011/04/mario-cadence.html).

**The Legend of Zelda (Koji Kondo).** Overworld theme: heroic descending pattern,
chords changing once per measure, Phrase A using **♭VII as a dominant-functioning
chord**, Phrase B alternating ♭VI and V.
— [Splice: "How the overworld theme … takes us on a harmonic adventure"](https://splice.com/blog/legend-of-zelda-overworld-harmony/);
[8-bit Zelda title-theme comparison](http://gamemusictheory.blogspot.com/2011/10/8-bit-zelda-title-themes-comparative.html).

**Minecraft (C418).** "Wet Hands" — A major, I–IV with maj7/maj9 color, pivoting
on a **Mixolydian shift** (non-diatonic G♮) that breaks the loop in bar 5.
"Sweden" — D major but *opens on E-minor*, loops Bm–E–A–Gmaj7 and **withholds the
V→I**, resting on a wistful IV.
— MuseScore features:
[Wet Hands](https://musescore.com/news/daily-score/pure-nostalgia-of-minecrafts-wet-hands-how-c418-turned-one-chord-change-into-an-emotional-gut-punch/) ·
[Sweden](https://musescore.com/news/features/unlocking-the-secrets-of-c418s-sweden-the-minimalist-masterpiece-at-the-heart-of-minecrafts-soundtrack/).
*(Directly relevant to our ambient genres — the "withhold resolution to loop
forever" trick is exactly the non-fatiguing-loop device in
`game_music_structure.md` §2–3.)*

**Chrono Trigger (Yasunori Mitsuda).** "Corridors of Time" — notated 4/4 but
floating between **F♯-minor and D major** (deliberate tonal ambiguity) over a
4-bar bell ostinato that steps upward each phrase.
— [VGM Daily close reading](https://vgmdaily.wordpress.com/2010/11/21/what-makes-it-memorable-chrono-trigger-corridors-of-time-yasunori-mitsuda/) ·
[Hooktheory tab](https://www.hooktheory.com/theorytab/view/yasunori-mitsuda/corridors-of-time).

**Undertale (Toby Fox).** A deliberate **leitmotif system** — themes
recontextualized across characters to steer emotion; "Megalovania" was rewritten
from an A-minor blues-scale original into the faster **D-minor** Undertale
version.
— [Film Music Theory: Fox & Soule](https://filmmusictheory.com/article/two-visionaries-of-video-game-music-toby-fox-and-jeremy-soule/) ·
[leitmotif-by-leitmotif community analysis](https://www.resetera.com/threads/an-appreciation-for-undertales-masterful-soundtrack-music-theory-examination-of-its-leitmotifs.79598/).

**Final Fantasy (Nobuo Uematsu).** Summers reads FFVII's score through Wagnerian
**leitmotif theory** (pp. 158–76). "One-Winged Angel" models Stravinsky's *Rite
of Spring* fused with Hendrix, text assembled from Orff's *Carmina Burana*.
— Tim Summers, *Understanding Video Game Music* (Cambridge UP, 2016), a landmark
methods text ([Ludomusicology announcement](https://www.ludomusicology.org/2016/09/12/just-published-understanding-video-game-music-tim-summers/));
[Kiwi Hellenist on the Carmina Burana sources](http://kiwihellenist.blogspot.com/2021/02/final-fantasy-vii.html).

**Hollow Knight (Christopher Larkin).** Built on two principal leitmotifs (the
~4-second main-theme cell foremost), reorchestrated/intensified across tracks to
track narrative.
— [PlayLab! Magazine (Tampere Univ.)](https://www.tuni.fi/playlab/when-the-music-shapes-half-of-your-experience-leitmotif-in-hollow-knights-soundtrack/) ·
8-bit Music Theory video (above).

**Tetris / "Korobeiniki" (arr. Hirokazu Tanaka).** The theme is the 19th-c.
Russian folk song "Korobeiniki" — a minor-mode accelerating dance tune.
— [Wikipedia (well-sourced origin)](https://en.wikipedia.org/wiki/Korobeiniki) ·
[mfiles annotated score](https://www.mfiles.co.uk/scores/korobeiniki.htm).
*(Gap: no rigorous free modal/voice-leading analysis surfaced — weakest-covered
of the set, alongside Celeste/Katamari.)*

### Canonical books (not free, cite for authority)
Schartmann, *Koji Kondo's SMB Soundtrack* (33⅓) · Summers, *Understanding Video
Game Music* (Cambridge) · William Gibbons, *Unlimited Replays* (Oxford) · Karen
Collins, *Game Sound* (MIT) · Andrew Schartmann's wider game-music writing.

---

## 2. Reference MIDI — where, and under what rights

### The copyright reality (the one paragraph that governs §2.A)
A MIDI of a song is a **fixed reproduction of the musical composition**
([Wikimedia Wikilegal](https://meta.wikimedia.org/wiki/Wikilegal/MIDI_Files)); a
transcriber holds at most a thin copyright in their sequencing, **not** in the
underlying work ([Circular 14](https://www.copyright.gov/circs/circ14.pdf)).
Translation: fan-archive game MIDI is **fine to download and study privately,
copyrighted to ship.**

### A. Copyrighted fan transcriptions — REFERENCE-ONLY, do **not** vendor
- **VGMusic.com** — the canonical archive: **~31,800 hand-sequenced** transcriptions
  across ~47 platforms (NES → current); free web download by platform. (It *bans*
  ROM-rips — NSF→MID, SPC→MID — for copyright reasons, so its holdings are
  transcriptions of still-copyrighted compositions.) Unbeatable breadth of
  *famous* tunes for private study. https://www.vgmusic.com/
- **Khinsider** — mostly ripped **audio** OSTs, not MIDI; explicitly a gray area.
  Less useful for symbolic study. https://downloads.khinsider.com/
- **Zophar's Domain (Music)** — ROM-ripped **native chip formats** (NSF/SPC/GBS) —
  direct copies of game audio code, the least-clean tier. https://www.zophar.net/music
- **BitMidi** (~113k general MIDI) / **FreeMidi.org** — community uploads; "free to
  download" ≠ free of the composition's copyright. https://bitmidi.com/

### B. Genuinely free / open — usable (mind the per-source terms)
**Game-music research datasets (the cleanest legit symbolic VGM):**
- ★ **NES-MDB (NES Music Database)** — **5,278 pieces from 397 NES games** in
  MIDI/score, with expressive attributes; the **packaging is MIT-licensed**. The
  cleanest legit way to study *real* VGM structure/voicing (caveat: the MIT
  license covers the tooling/format, not an affirmative clearance of the
  underlying NES compositions — study/research use). https://github.com/chrisdonahue/nesmdb
  ([paper](https://arxiv.org/abs/1806.04278))
- **VGMIDI** — 200 emotion-labeled + 3,850 piano-arrangement game-soundtrack MIDIs
  for research. **License unconfirmed (404 on the raw path this session) — verify
  in-repo before any non-research use.** https://github.com/lucasnfe/vgmidi
- **NES-VMDB** (FDG 2024) — 98,940 gameplay videos paired with NES-MDB symbolic
  music. https://github.com/rubensolv/NES-VMDB

**General symbolic datasets (for studying form/voicing):**
- **Lakh MIDI Dataset** — 176,581 files; the **compilation is CC-BY 4.0** (cite
  Raffel 2016) — but CC-BY covers the *compilation*, not the underlying songs, so
  individual files may still embed third-party copyright. Mostly pop.
  https://colinraffel.com/projects/lmd/
- **MAESTRO** (Google Magenta) — ~200 h of virtuoso piano (mostly PD classical),
  finely aligned MIDI, **CC BY-NC-SA 4.0**. Great for classical form/voicing;
  non-commercial. https://magenta.withgoogle.com/datasets/maestro

**Public-domain classical MIDI (free to study form):**
- **Mutopia Project** — 2,124+ pieces, **all PD or Creative Commons**, PDF+MIDI+LilyPond.
  https://www.mutopiaproject.org/
- **Kunst der Fuge** — ~19,300 classical MIDI, many **CC (incl. BY-NC-SA)**;
  check per-file terms. https://www.kunstderfuge.com/

**CC0 / CC-BY game-*style* music you can actually ship (original works, not
transcriptions):**
- **OpenGameArt.org — CC0 music** — original chiptune/game music tagged CC0 (no
  attribution) / CC-BY. https://opengameart.org/content/cc0-music-0
- **Incompetech / Kevin MacLeod** — 2,000+ tracks **CC BY 4.0** (credit, commercial
  OK). https://incompetech.com/music/royalty-free/

### Ranked recommendation for *this* repo
1. **NES-MDB** — real famous VGM, in MIDI, MIT-packaged, academically standard:
   the best legit *study* corpus. (Don't redistribute the music.)
2. **MAESTRO + Mutopia** — cleanest rights for studying form/voicing (classical).
3. **VGMIDI** — game arrangements with emotion labels; **confirm license first.**
4. **VGMusic.com** — unmatched breadth of *famous* tunes for **private reference
   only**; avoid the rip sites for anything beyond private listening.
5. **OpenGameArt CC0 / Incompetech CC-BY** — when you need music to **ship**, not
   just study. If we ever vendor reference material, it comes from *here*, logged
   with provenance the way `industrial/samples/LICENSE.txt` does — never from §2.A.

---

## 3. How this feeds the engine work
The analyses in §1 are *ear-training and validation* for the migration in
[`../docs/design/song_structure_migration.md`](../docs/design/song_structure_migration.md):
the recurring findings — **loop-friendly withheld resolutions** (C418), **single
chord-per-measure harmonic rhythm** (Zelda), **small leitmotif sets reorchestrated
by state** (Hollow Knight, Undertale, FF) — are the same levers our arc templates
and (eventual) intensity-tier selector pull. The MIDI in §2.B is reference for
*phrase length and voicing*, studied privately, never vendored — consistent with
the repo's audio-free, rights-first sourcing.

---

*Compiled 2026-06 by fan-out web research. Links search-attested, not
page-fetched — see the verification caveat above and
[`VERIFICATION_NOTES.md`](./VERIFICATION_NOTES.md). No audio or MIDI is vendored
in this repo.*
