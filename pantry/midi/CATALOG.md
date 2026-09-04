# Public-Domain Jazz/Reharm Reference MIDIs

Public-domain melodies in MIDI form, chosen because they "jazz up" easily —
strong, simple melodies over clear chord changes that take well to swing, bebop
or lounge reharmonisation. They are seeds for melodic and harmonic ideas rather
than audio: an instrument that reads them still synthesises everything it plays.

Files live beside this one. All twelve are verified valid Standard MIDI data
(`file` reports `Standard MIDI data (format 1)`), and the two most recently
added were checked against their written key signatures and final cadences as
well — see the verification note below.

## Public-domain rationale (general)

- **US public domain by publication date.** Under US copyright law, musical
  *compositions* published before 1929 are in the public domain. Every Scott
  Joplin rag below was published 1899–1914; Joplin died in 1917. Greensleeves
  (16th c.) and Scarborough Fair (trad., 17th c. or earlier) long predate any
  copyright term.
- **MIDI sourcing.** The *composition* being PD does not automatically make a
  given recording/sequence PD — a modern sequenced arrangement can carry its own
  thin copyright. Each file below is sourced from a repository that explicitly
  states the file's status:
  - **Mutopia Project** marks each piece "Public Domain — CC: No rights reserved"
    (CC0), except where a specific arrangement is noted otherwise.
  - **Wikimedia Commons** files carry per-file license tags; the Scarborough Fair
    file is an explicit author PD dedication ("released into the public domain by
    the copyright holder").
- **One exception to pure CC0:** the Greensleeves file is a Mutopia *guitar
  arrangement* released under **CC-BY-SA 4.0** (the melody is PD; Mutopia's
  arrangement adds an attribution+sharealike condition). Usable as reference;
  attribute Mutopia if any derived arrangement is distributed.

## Catalog

| # | Tune | Composer | Year | File | Source | License | Why it jazzes up |
|---|------|----------|------|------|--------|---------|------------------|
| 1 | Maple Leaf Rag | Scott Joplin | 1899 | `maple_leaf_rag.mid` | Mutopia (id 23) | PD / CC0 | Iconic syncopated A/B strains over I–IV–V; ragtime is the literal root of swing — drops straight into a stride/swing feel. |
| 2 | The Entertainer | Scott Joplin | c. 1902 | `the_entertainer.mid` | Mutopia (id 263) | PD / CC0 | Bright stepwise melody with clear sectional cadences; trivially reharmonized with ii–V turnarounds. |
| 3 | Elite Syncopations | Scott Joplin | 1902 | `elite_syncopations.mid` | Mutopia (id 1540) | PD / CC0 | Lively syncopation and a singable trio; swings naturally at a lounge tempo. |
| 4 | Pineapple Rag | Scott Joplin | 1908 | `pineapple_rag.mid` | Mutopia (id 1899) | PD / CC0 | Strong riff-like phrases; the repeated motifs make good comping/head material. |
| 5 | Bethena (A Concert Waltz) | Scott Joplin | 1905 | `bethena_concert_waltz.mid` | Mutopia (id 463) | PD / CC0 | 3/4 ragtime waltz with a wistful melody — reharmonizes beautifully as a jazz waltz. |
| 6 | Magnetic Rag | Scott Joplin | c. 1914 | `magnetic_rag.mid` | Mutopia (id 441) | PD / CC0 | Joplin's late, harmonically richer rag (minor strain, chromaticism) — already half-jazz. |
| 7 | Something Doing | Scott Joplin (w/ Scott Hayden) | 1903 | `something_doing.mid` | Mutopia (id 1541) | PD / CC0 | Punchy two-step strains; tight, danceable phrasing that maps onto a swing groove. |
| 8 | Wall Street Rag | Scott Joplin | 1909 | `wall_street_rag.mid` | Mutopia (id 1543) | PD / CC0 | Programmatic, mood-shifting strains ("panic" to "good times") — ready-made for dynamic/contextual scoring. |
| 9 | Greensleeves | Traditional (English, 16th c.) | trad. | `greensleeves.mid` | Mutopia (id 1943, guitar arr.) | CC-BY-SA 4.0 (melody PD) | Modal (Dorian/Aeolian) tune that voice-leads into lush minor-key jazz changes; a lounge-ballad staple. |
| 10 | Scarborough Fair | Traditional (English, ballad) | trad. | `scarborough_fair.mid` | Wikimedia Commons | PD (author dedication) | Dorian-mode melody with open harmony — perfect for modal reharm and a smoky, slow-swing reading. |
| 11 | The Easy Winners | Scott Joplin | c. 1901 | `easy_winners.mid` | Mutopia (JoplinS/winners) | PD / CC0 | Bright Ab two-step whose A-strain turns home on its own I7 into the V-of-V chain — a different lift from the other Ab rag here. |
| 12 | Solace (A Mexican Serenade) | Scott Joplin | 1909 | `solace.mid` | Mutopia (JoplinS/solace) | PD / CC0 | Habanera rhythm and a chromatic melody — the "Spanish tinge"; the one latin-feel entry among the rags. |

## Verification

Every file reports `Standard MIDI data (format 1)`. The two Joplin rags added
last were checked further, because a valid MIDI file is not proof it holds the
piece it is named for:

| File | Written key signatures | Final cadence | Reading |
|---|---|---|---|
| `easy_winners.mid` | A♭ major, D♭ major | D♭–F–A♭ | A♭ two-step with the trio in the subdominant, ending there — the standard rag form |
| `solace.mid` | F major | F–A–C, opening on C | Opens in C and resolves in F, matching the published description of the piece |

Both were fetched from the Mutopia paths listed below and are LilyPond-generated,
as Mutopia's engravings are.

## Source URLs

- Maple Leaf Rag — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=23 · file: https://www.mutopiaproject.org/ftp/JoplinS/maple/maple.mid
- The Entertainer — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=263 · file: https://www.mutopiaproject.org/ftp/JoplinS/entertainer/entertainer.mid
- Elite Syncopations — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1540 · file: https://www.mutopiaproject.org/ftp/JoplinS/EliteSyncopations/EliteSyncopations.mid
- Pineapple Rag — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1899 · file: https://www.mutopiaproject.org/ftp/JoplinS/PineappleRag/PineappleRag.mid
- Bethena — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=463 · file: https://www.mutopiaproject.org/ftp/JoplinS/bethena/bethena.mid
- Magnetic Rag — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=441 · file: https://www.mutopiaproject.org/ftp/JoplinS/magnetic/magnetic.mid
- Something Doing — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1541 · file: https://www.mutopiaproject.org/ftp/JoplinS/SomethingDoing/SomethingDoing.mid
- Wall Street Rag — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1543 · file: https://www.mutopiaproject.org/ftp/JoplinS/WallStreetRag/WallStreetRag.mid
- Greensleeves — https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1943 · file: https://www.mutopiaproject.org/ftp/Traditional/greensleeves_guitar/greensleeves_guitar.mid
- Scarborough Fair — https://commons.wikimedia.org/wiki/File:Scarborough-fair.mid · file: https://upload.wikimedia.org/wikipedia/commons/7/77/Scarborough-fair.mid
- The Easy Winners — file: https://www.mutopiaproject.org/ftp/JoplinS/winners/winners.mid
- Solace — file: https://www.mutopiaproject.org/ftp/JoplinS/solace/solace.mid

## Strong candidates NOT downloaded (and why)

- **St. Louis Blues — W. C. Handy (1914).** Composition is PD in the US (pre-1929).
  But IMSLP hosts only a synthesized MP3, not a MIDI, and the readily-found MIDI
  versions (mfiles, 8notes) are proprietary sequenced arrangements with no PD
  statement on the *file*. No repository offered a MIDI with a verifiable PD/CC0
  status, so it was skipped. A clean PD MIDI would be a top pick (12-bar blues —
  the canonical jazz form). IMSLP: https://imslp.org/wiki/St._Louis_Blues_(Handy,_W._C.)
- **Frog Legs Rag — James Scott (1906).** Composition is PD (Scott d. 1938, pub.
  1906). The available MIDI (BitMidi) carries no license statement on the file,
  and Mutopia has no James Scott entry. Skipped pending a PD-verified MIDI source.
  IMSLP score (PD): https://imslp.org/wiki/Frog_Legs_Rag_(Scott,_James)
- **Shenandoah (trad. American).** PD melody, but no MIDI found on Wikimedia
  Commons or Mutopia with a verifiable per-file PD status (Commons had only an
  `.ogg` recording). Skipped.
- **St. James Infirmary / House of the Rising Sun (trad.).** Melodies are trad./PD,
  but Wikimedia Commons had no PD MIDI (only recordings), and these tunes have a
  tangled arrangement-copyright history. Skipped — verify any specific
  arrangement before use.
- **mfiles.co.uk ragtime/folk MIDIs (Maple Leaf, Entertainer, Scarborough Fair,
  etc.).** Good sequences, but the site asserts a blanket "© Music Files Ltd, all
  rights reserved" over its content. The underlying tunes are PD, but the *files*
  are not offered as PD. Preferred Mutopia/Wikimedia equivalents instead.

## Notes for the engine

- Ragtime is the direct ancestor of swing; any of the Joplin heads above can be
  fed through ii–V turnaround substitution and a swung 8th-note feel for the
  indoor jazz combo. Magnetic Rag and Bethena are the most harmonically advanced
  (chromaticism, minor strains) and the least "stiff" to reharmonize.
- The two folk tunes (Greensleeves, Scarborough Fair) are modal and sparse —
  ideal seeds for slow, smoky lounge/ballad contexts rather than up-tempo swing.
- Reminder: these are *reference* inputs for composing the procedural engine's
  patterns; the engine ships no audio files and remains zero-dependency.
