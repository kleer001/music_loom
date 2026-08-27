# Electronic Dance Music: Codifiable Theory for a Procedural Engine

A practical, sourced reference for the melodic, harmonic, rhythmic, and
arrangement theory behind nine EDM genre families — techno, trance,
industrial/EBM, house, acid, dub techno, psytrance, ambient, synthwave —
written for a generator, not a listener. The goal is concrete rules: scales,
Roman-numeral progressions with named-key examples, harmonic rhythm, melody and
bass templates, and the arrangement/tension structure each genre leans on.

> **Foundation first.** This doc is the genre *dialects*; the universal *grammar*
> beneath them — song form, the phrase, melody/motif development, functional
> harmony, tension/release and the rest of the "arithmetic before the calculus" —
> lives in [`song_construction_basics.md`](./song_construction_basics.md). Read
> that if the genre rules here feel like they skipped a step.

## What is codifiable vs. genuinely by-feel

**Codifiable (rules a generator can apply directly):**

- **Scale/mode choice per genre.** Almost every EDM genre is *modal and static*
  — it picks one scale and stays in it. The mode is the single biggest lever and
  is well documented per genre.
- **Roman-numeral progressions.** A small, recurring vocabulary (Andalusian
  descent, i–VI–III–VII, vi–IV–I–V, single-chord pedal). These are named and
  reusable.
- **Harmonic rhythm.** How many bars a chord holds is a per-genre constant
  (4 bars in hypnotic techno, ~2 bars in trance, ~1 bar/chord in house).
- **Bassline templates.** Off-beat house bounce, rolling 16th techno, psy
  offbeat-roll, root–fifth EBM pedal, 303 wander with slides/accents — these are
  step-grid patterns.
- **Arrangement.** 8/16/32-bar phrase blocks, intro→build→drop→breakdown→outro,
  the energy curve, the filter-sweep/riser, sidechain pumping as a rhythmic
  device. All quantized to powers of two.
- **The kick–bass sidechain relationship.** Per-genre duck depth and whether
  bass sits four-on-the-floor or rolls in the kick's gaps.

**Genuinely by-feel (where the literature is thin or explicitly says "don't
overthink it"):**

- **303/acid note choice.** The canonical Chicago method is *deliberate
  randomness* — "enter sixteen steps of notes quickly... Don't think about it too
  much" — and detuning the pattern length to 13/15 steps so it cycles
  "uncoupled" and "woozy." A generator can mimic the *mechanism* (slides,
  accents, octave jumps, odd loop length) but the exact notes are not formulaic.
  ([MusicTech](https://musictech.com/guides/essential-guide/how-to-create-a-chicago-style-acid-house-bassline/))
- **Sound design / timbre.** Filter movement, detune, reverb tails, the dub
  delay — these carry the genre as much as the notes, and are tuning, not theory.
- **Micro-groove.** Swing amount, ghost-note velocity, "rolling feel" via
  velocity rather than pitch — directionally documented, exact values by-feel.
- **Melodic contour of leads.** Beyond register, motif length, and
  call-and-response, the actual anthem hook is composed by ear; the literature
  gives structure (phrasing, repetition) but not a note generator.

A useful framing: **EDM harmony is mostly *static modal colour + a bassline
groove + an arrangement curve*, not functional tonal motion.** The genres that
*do* move harmonically (trance, house, synthwave) reuse a handful of pop/minor
loops. Get the mode, the harmonic rhythm, the bass template, and the arrangement
curve right, and you have 80% of the identity; the rest is timbre and feel.

---

## Per-genre theory

### Techno

- **Scale/mode.** Minor, overwhelmingly. Attack Magazine's working rule: "99.9%
  of techno is minor" — natural minor (Aeolian) as the default palette (E minor:
  E F# G A B C D). Melodic/dark techno leans minor "for darker mood, more
  tension." Phrygian appears in harder/darker variants.
  ([Attack — Theory of Techno Pads](https://www.attackmagazine.com/technique/tutorials/the-theory-of-techno-pads-part-1/),
  [Chordoo](https://www.chordoo.com/blog/melodic-techno-chord-progressions-for-dark-atmosphere))
- **Progressions.** Often *near-static*: one chord, or a slow two/three-chord
  move. A **pedal tone** — a held root note under shifting upper voices — is the
  signature hypnotic device. When chords move, they follow the minor diatonic
  qualities (i°… in minor: minor–dim–major–minor–minor–major–major).
  *Concrete:* in E minor, hold Em as a pedal for 4 bars, then drop a secondary
  chord (e.g. C or G) into bars 3 and 7 of an 8-bar phrase.
  ([Attack](https://www.attackmagazine.com/technique/tutorials/the-theory-of-techno-pads-part-1/))
- **Harmonic rhythm.** Very slow. Chords "sustain four bars each"; variation by
  inserting a passing chord into the 3rd and 7th bars of an 8-bar loop.
  Hypnotic/peak-time techno can hold **one chord for 8–16 bars**.
- **Melody.** Minimal. Motifs are short and develop by *subtraction/shift* — move
  a note by a 16th, or swap root for fifth, every 8–16 bars; "hypnotically
  repetitive but never completely static."
  ([Myloops](https://www.myloops.net/melodic-techno-production-complete-guide-from-start-to-finish))
- **Bass.** Root-note driven ("basslines almost always come from the root notes
  of your chords"). The **rolling 16th** bass: 16th-note grid, groove from
  velocity and note selection — ghost notes (same pitch, lower velocity) between
  the 8th notes for the roll. Often a single sustained/rolled root following the
  pedal tone.
- **Arrangement / sidechain.** Four-on-the-floor kick (0,4,8,12). Long intros,
  tension by layering/filtering rather than chord change. Moderate sidechain duck
  of bass and pads to the kick for the steady pump.

### Trance

- **Scale/mode.** Minor-leaning, **natural minor (Aeolian)** for "haunting
  melodies and rich harmonies," with shifts to the relative major for euphoric
  lift. Harmonic minor appears for the "epic" raised-7th tension.
  ([Unison](https://unison.audio/trance-chord-progressions/),
  [Theory Helper](https://www.theoryhelper.com/genres/trance/scales))
- **Progressions (Roman numerals + named-key examples):**
  - **i–VI–III–VII** — the canonical uplifting-trance loop (A minor: Am–F–C–G).
  - **vi–IV–I–V** — anthem cadence (C major / A minor: Am–F–C–G again, framed in
    the major; e.g. Dash Berlin "Till The Sky Falls Down").
  - **I–V–vi–IV** — the pop-trance axis (Above & Beyond "Sun & Moon").
  - **vi–V–IV–III** — descending minor (Andrew Rayel "My Reflection").
  - **ii–V–I**, **vi–ii–V–I** — functional cadences for classic/uplifting trance
    (Tiësto "Adagio for Strings"; Deadmau5 "Strobe" uses vi–ii–V–I).
  ([Unison](https://unison.audio/trance-chord-progressions/))
- **Harmonic rhythm.** Typically **1 chord per bar or per 2 bars**, looping over a
  4-chord cycle (so 4 or 8 bars per cycle). The breakdown often slows harmony and
  features the chord cycle under a pad before the anthem.
- **Melody / lead.** The **supersaw anthem lead**: 5–7 detuned saw oscillators,
  unison spread, low-pass with automated cutoff sweeps, chorus + ping-pong delay
  + reverb. Phrased as a long, singable hook stated in the breakdown, then
  restated full-energy after the drop — call-and-response between a short
  rhythmic motif and a sustained answer. Sits in a mid-high register (roughly
  C5–C6) so it cuts over the pads.
  ([Unison/Lyric Assistant supersaw notes](https://lyricassistant.com/how-to-write-trance-music-songs/))
- **Bass.** Off-beat or rolling root, sidechained hard to the kick so the bass
  "breathes" with the four-on-the-floor. Follows the chord roots.
- **Arrangement.** The most structured genre: long intro, **breakdown** (strip to
  pad + lead hook), **build** (riser + snare-roll + filter open), **drop** to the
  full anthem. 16/32-bar blocks throughout.

### Industrial / EBM

- **Scale/mode.** Minor, often **Phrygian** for the b2 menace; "monotonous"
  modal basslines over a static centre. Melody is secondary to rhythm — EBM
  "emphasiz[es] rhythmic physicality over traditional melody."
  ([DJ Mag](https://djmag.com/content/unstoppable-influence-ebm),
  [Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Electronic_Body_Music))
- **Progressions.** Minimal/static. Frequently a **single tonal centre** with a
  root–fifth–octave pedal; when it moves it's the **Andalusian descent**
  (i–VII–VI–V in Aeolian / iv–III–II–I in Phrygian) for the dark stepwise pull
  (see cross-cutting section). *Concrete:* A Phrygian pedal on A, or the Por
  Arriba descent Am–G–F–E.
- **Harmonic rhythm.** Static to slow; the bassline *sequence* carries motion,
  not chord changes.
- **Melody / bass.** The bass *is* the hook. **Root–fifth / octave** muscular
  monophonic sequences, gated short like a step sequencer, distorted/FM for
  metallic bite, velocity variation to avoid monotony, layered across octaves
  (sub + mid + +12). "Dry muscular minimalism."
  ([Studio Brootle EBM bassline](https://www.studiobrootle.com/ebm-bassline-tutorial-ableton/))
- **Arrangement / sidechain.** Programmed 4/4 drum-machine patterns, hard
  mechanical beat. Bass sidechained to the kick "so the kick and bassline don't
  overcrowd." Aggression built by stacking distortion and adding layers, not by
  harmonic development.

### House

- **Scale/mode.** **Dorian** (minor with a *raised 6th*) is the soulful-house
  signature — gives the major IV chord that distinguishes it from plain Aeolian.
  Also natural minor and major. Deep/soulful house is jazz-influenced.
  ([Splice — Dorian](https://splice.com/blog/music-modes-dorian/),
  [Hack Music Theory — Dorian progression](https://hackmusictheory.com/home/blog/014-how-to-write-a-dorian-chord-progression))
- **Progressions (Roman numerals + named-key examples):**
  - **vi–IV–I–V** — anthem/vocal-house loop.
  - **ii–V–I** and **ii7–V7–Imaj7** — the soulful/jazz cadence.
  - **Dorian vamps** — i7 ⇄ IV (the major-IV is the Dorian tell), e.g. a two-chord
    A Dorian vamp Am7 ⇄ D7.
  - **Deep-house 7th/9th loops:** Fmaj7 ⇄ Em7; or the Masters At Work move
    Fm7–Abmaj7–Cm7; or a Rhodes loop Am7–Em7–Dm7.
  ([Attack — Deep House Chords](https://www.attackmagazine.com/technique/passing-notes/passing-notes-deep-house-chords/),
  [Ben Rainey](https://www.benrainey.co.uk/blog/house-music-chord-progressions))
- **Voicing.** Two characteristic voicings: **sustained jazzy 7th/9th pads/Rhodes**
  (deep house) and **off-beat piano/organ stabs** (the classic house "stab" on
  the off-beat 8ths — the &-of-each-beat). Chord tones move freely across octaves
  to keep the loop flowing.
- **Harmonic rhythm.** Roughly **1 chord per bar**, often a 2- or 4-chord loop;
  deep-house vamps can be 2 bars per chord.
- **Bass.** The **house bounce** — bass on the **off-beat 8th notes** (between the
  four-on-the-floor kicks), giving the rolling, bouncing groove. Follows chord
  roots; walks toward the next root in disco/soulful house.
- **Arrangement / sidechain.** Four-on-the-floor with swung 16th hats and a
  backbeat clap (beats 2 and 4). Moderate sidechain. Builds by filtering the
  pad/stab and dropping the bass in/out.

### Acid

- **Scale/mode.** Minor / **Phrygian** for the dark squelch; pentatonic-minor
  also common because the 303 lives on one octave and a small note set reads
  clearly. The mode matters less than the *behaviour* — acid is timbre and
  sequencer-articulation first.
- **Progressions.** Usually static — one tonal centre under a moving 303 line; or
  the **Andalusian descent** (i–VII–VI–V) when there is harmonic motion. Acid is
  essentially a *one-chord drone with a wandering bass*.
- **The 303 mechanism (the codifiable part).** The TB-303's accent links to
  filter cutoff + resonance and notes have a fixed slide time, which is the whole
  "squelch." Rules a generator can encode:
  - Stay within **one octave** of one scale (the hardware constraint that
    defined the sound).
  - **Slides (portamento)** between adjacent steps; slides "work particularly
    well combined with **octave jumps**" — slide a note, then shift the next note
    up or down an octave for the signature bend.
  - **Accents** raise volume + filter-envelope depth on chosen steps.
  - **Stepwise wander** within the scale with occasional leaps; ~60% step
    density.
  - For instability, run an **odd pattern length (13 or 15 steps)** so the line
    cycles uncoupled from the 16-step bar — "woozy and unstable."
  ([DJ TechTools — 303 history](https://djtechtools.com/2015/12/02/history-tb-303-rolands-accidental-legend/),
  [MusicRadar — 303 guide](https://www.musicradar.com/news/producers-guide-to-the-roland-tb-303-and-clones),
  [MusicTech — Chicago acid bassline](https://musictech.com/guides/essential-guide/how-to-create-a-chicago-style-acid-house-bassline/))
- **Harmonic rhythm.** Static; the 303 line is the content. *By-feel flag:* exact
  notes are deliberately near-random by tradition — encode the mechanism, not a
  melody.
- **Arrangement / sidechain.** Four-on-the-floor; tension built almost entirely
  by **opening the 303 filter cutoff and resonance** over many bars (the acid
  "rise") rather than by harmony. Light-to-moderate sidechain.

### Dub Techno

- **Scale/mode.** Minor. The chord stab is "most often voiced as a **minor
  chord** to create a moody and emotional feel" — minor triad, sometimes a minor
  7th.
  ([Attack — Dub Techno Synth Chords](https://www.attackmagazine.com/technique/synth-secrets/dub-techno-synth-chords/),
  [Audiotent](https://www.audiotent.com/blogs/production-tips/dub-techno-chord-sound-design))
- **Progressions.** Maximally static — **a single sustained/stabbed minor chord**
  repeating hypnotically, occasionally a 1–2-chord shift. "Tracks are long and
  spacious with often just a few elements repeating." Pioneered by Basic
  Channel / Rhythm & Sound (Moritz von Oswald + Mark Ernestus), where processing
  > synthesis. *Concrete:* one chord, e.g. a Cm stab on the off-beat, for the
  whole section.
- **Harmonic rhythm.** Essentially none — harmony is a texture, motion comes from
  **delay**, not chord changes.
- **The chord stab.** Short snappy envelope (fast attack, medium decay, low
  sustain, medium release) OR a slow filter-attack swell; placed off-beat;
  forward motion generated by **dotted-eighth tape delay** (the dub-delay
  signature; some add 5/16 echoes), so the single chord becomes a rhythmic cloud.
- **Bass.** Deep sustained sub root under the stab — a held/long bass on the chord
  root (Reese-adjacent detuned-saw or pure sub-sine), slow and minimal.
- **Arrangement / sidechain.** Sparse kit, four-on-the-floor or just an open-hat
  pulse. Deep, slow low-end glue. Sidechain present but gentle; the *space*
  between hits is the point.

### Psytrance

- **Scale/mode.** **Phrygian** is the signature ("mystery, tension, and an
  instantly recognizable psychedelic drive" — the b2 is the tell), then
  **harmonic minor** and **Phrygian dominant** for darker/exotic textures. Plain
  minor for fuller-on/uplifting. Harmony is "sparse and modal."
  ([Outerverse](https://outerverse.fm/blogs/tutorials/understanding-scales-modes-in-psytrance),
  [Melodigging — Psytrance](https://www.melodigging.com/genre/psytrance))
- **Progressions.** Largely static-modal over a Phrygian centre; the **Andalusian
  descent** (i–VII–VI–V) and short Phrygian moves supply what motion there is.
- **Harmonic rhythm.** Slow/static; energy comes from the bass roll and lead
  interlock, not chord change.
- **Melody / lead.** Rolling, modal motifs interlocking with the bass; leads sit
  mid-high and are often arpeggiated. Keep leads, melodies, and bass
  "harmonically aligned" in the chosen mode.
- **Bass (the defining feature).** The **rolling 1/16th-note bass**: a
  single-note pattern, "two to three 16th bass notes per bar" hitting **in the
  gaps of the four-on-the-floor kick**, with a filter cutoff envelope following
  each kick. Tightly tuned start times and note lengths "to avoid flab." The
  kick-on-1, bass-on-everything-else interlock is the genre's core.
  ([Melodigging](https://www.melodigging.com/genre/psytrance))
- **Arrangement / sidechain.** **Hardest sidechain in EDM** — make the kick
  *first*, then tune the bass to it and duck the bass aggressively so the kick
  punches through every beat (the offbeat-roll + hard-duck interlock). 147 BPM
  range; long hypnotic builds, layered psychedelic FX risers.

### Ambient

- **Scale/mode.** Single tonal centre or one mode; "static or slowly shifting,
  often centered on a single tonal center or mode," avoiding dense changes.
  Minor or **suspended** voicings for a dark drone; major/Lydian for serene.
  ([The Music Theory Professor — Eno/Budd](https://themusictheoryprofessor.com/waveform-analysis-in-ambient-music-the-techniques-of-brian-eno-and-harold-budd/),
  [Abducted Android — ambient chords](https://abductedandroid.vuilniszak.be/insights/the-art-of-chord-progressions-in-ambient-music))
- **Progressions.** Often **no progression** — a sustained drone/pedal, or two
  pads cross-fading. "Harmony can be powerful even in stillness." Suspended (sus2/
  sus4) and minor add chords avoid committing to a strong cadence.
- **Harmonic rhythm.** Near-zero; a chord may hold for many bars or the entire
  piece. Motion is *timbral* (filter, reverb, layered clusters), per Eno's
  generative/looping approach.
- **Melody / bass.** Sparse, optional. A low drone/pedal root grounds the
  harmony; melodic fragments are slow, register-spread, non-rhythmic.
- **Arrangement.** No beat (or a very sparse one); no drop. Tension via slow
  swells, evolving texture, and layered timbral variation rather than the
  build/drop curve.

### Synthwave / Outrun

- **Scale/mode.** Natural **minor (Aeolian)** for the moody retro core;
  **Phrygian** and **harmonic minor** for darkwave/outrun darkness; **Mixolydian**
  for the brighter 80s-pop lift.
  ([Unison — Synthwave](https://unison.audio/synthwave-chord-progressions/),
  [Synthwave Pro](https://synthwavepro.com/how-to-learn-synthwave-music-with-limited-knowledge-of-music-theory/))
- **Progressions (Roman numerals + named-key examples):**
  - **i–VI–III–VII** — the classic "80s" minor loop ("Dreamy Dystopia"; A minor:
    Am–F–C–G).
  - **i–VI–VII** — three-chord minor outrun loop (Am–F–G).
  - **vi–IV–I–V** — "Retro Futuristic," minor-into-major (Am–F–C–G framed in C).
  - **I–V–vi–IV** — "Neon Nights," major axis for upbeat tracks.
  - **ii–IV–I–V**, **I–vi–ii–V** — warmer/pop-oriented variants.
  ([Unison](https://unison.audio/synthwave-chord-progressions/),
  [eMastered](https://emastered.com/blog/synthwave-chord-progressions))
- **Voicing.** Lush sustained analog-style pads under the progression; chord
  **inversions** to smooth voice leading; a separate **arpeggiator** spelling the
  chord tones (up / down / up-down) as the rhythmic engine.
- **Harmonic rhythm.** ~**1 chord per bar** over a 4-chord (or 3-chord) loop;
  occasionally 2 bars per chord under a slow ballad.
- **Bass.** Distinctive: **the bass often carries the melody** and plays a
  **rhythmic, arpeggiated role** — steady 8th- or 16th-note root/arp pulses
  interplaying with the drums (the "driving" outrun bass), not just root pads.
- **Arrangement / drums.** **Gated-reverb snare** on the backbeat (2 and 4),
  sparse kick (often beats 1 and 3), steady closed hats, slapback delay. Tension
  via arpeggio layering and filter opens; softer/optional sidechain.

---

## Cross-cutting: harmonic movement & tension

### The recurring progression vocabulary

| Name | Aeolian (minor) RN | Phrygian RN | Example (A minor / A Phrygian) | Used by |
|---|---|---|---|---|
| **Andalusian descent** | i–VII–VI–V | iv–III–II–I | Am–G–F–E | acid, psytrance, industrial, flamenco-tinged |
| **80s minor loop** | i–VI–III–VII | — | Am–F–C–G | trance, synthwave |
| **Anthem cadence** | vi–IV–I–V | — | Am–F–C–G (in C) | trance, house, synthwave |
| **Pop axis** | I–V–vi–IV | — | C–G–Am–F | trance, synthwave |
| **Soulful cadence** | ii–V–I (often 7ths) | — | Dm7–G7–Cmaj7 | house, deep house |
| **Dorian vamp** | i7 ⇄ IV (maj) | — | Am7 ⇄ D7 | house |
| **Pedal / drone** | i (held) | i (held) | Am held | techno, dub techno, ambient, EBM |

The **Andalusian cadence** is worth singling out: it is *modal to the core* — in
A Phrygian, Am–G–F–E "aren't a minor progression, they're a descending line built
from stacked scale tones." The b2 of Phrygian (the half-step from the 2nd to the
root) is the dark, Spanish/psychedelic pull that acid, psy, and industrial all
exploit. ([Wikipedia — Andalusian cadence](https://en.wikipedia.org/wiki/Andalusian_cadence),
[John Moore — Flamenco/Phrygian PDF](https://idiom.ucsd.edu/~moore/solbul.pdf))

### Functional vs. modal/static

- **Functional motion** (real V→i pull, cadences): trance, house, synthwave —
  these reuse pop/minor loops and resolve.
- **Modal/static** (one centre, colour over motion): techno, acid, dub techno,
  psytrance, ambient, EBM — the bassline groove and timbre carry the track; the
  "progression" is often a single pedal chord.

### Harmonic rhythm summary

| Genre | Bars per chord (typical) |
|---|---|
| Hypnotic/peak techno | 4–16 (often 1 chord) |
| Dub techno | whole section (1 chord) |
| Ambient | whole piece / many bars |
| EBM/industrial | static centre (sequence moves, not chords) |
| Acid | static centre |
| Psytrance | slow/static (mode), bass carries motion |
| House | ~1 (deep-house vamps 2) |
| Synthwave | ~1 (ballads 2) |
| Trance | 1–2 over a 4-chord loop |

### Arrangement & tension (codifiable)

- **Phrase grid.** Everything is 4/4 and quantized to **8/16/32-bar** blocks;
  changes that don't land on an 8-bar boundary "lose momentum." Intros are a
  multiple of 16 bars; builds ~8 bars; drops 16–32; breakdowns 8–32.
  ([Mixed In Key](https://mixedinkey.com/captain-plugins/wiki/how-to-arrange-a-dance-music-track/),
  [edmtips](https://edmtips.com/edm-song-structure/))
- **Energy curve.** Intro adds a layer every 16/32 bars → breakdown strips to
  pad/lead → build (riser + snare-roll + filter open, often a +4–8 bar extension
  for "extra punch") → drop (full energy) → repeat → outro strips layers away.
  The payoff is predictability: listeners "predict what's coming... and when
  they're proved correct, it's satisfying."
- **Tension devices (apply at section boundaries):** filter-cutoff sweep up,
  white-noise **riser/uplifter**, **impact** hit on the downbeat of the drop,
  snare/drum roll accelerating into the drop, removing the kick during the
  breakdown, automating reverb size.
- **Sidechain pumping as rhythm.** Ducking bass (and pads/synths/whole bus) to
  the kick is itself a **rhythmic device** — "energetic and dynamic feel."
  Generalizes beyond bass to "every single element in the record."
  ([Slate Digital](https://slatedigital.com/what-is-sidechaining/),
  [Pro Audio Files](https://theproaudiofiles.com/sidechain-pumping-techniques-edm/))

### Kick–bass–sidechain per genre

| Genre | Kick | Bass placement | Duck depth |
|---|---|---|---|
| Techno | 4-on-floor | rolling 16th root | moderate, steady pump |
| Trance | 4-on-floor | off-beat/rolling root | hard (breathing bass) |
| Industrial/EBM | mechanical 4/4 | root–fifth pedal sequence | moderate, anti-clash |
| House | 4-on-floor + backbeat clap | **off-beat 8ths** (the bounce) | moderate |
| Acid | 4-on-floor | 303 wander (slides/accents) | light–moderate |
| Dub techno | sparse 4-on-floor | sustained sub root | gentle |
| Psytrance | 4-on-floor (kick first) | **offbeat rolling 16ths** in kick gaps | **hardest** |
| Ambient | none | drone root (optional) | none |
| Synthwave | sparse (1 & 3) + gated snare | arpeggiated/melodic root | soft/optional |

---

## Concrete rules a generator could apply (checklist)

**Mode selection (per genre default):**

- techno → Aeolian (Phrygian for dark variants)
- trance → Aeolian (relative major lift; harmonic minor for "epic")
- industrial/EBM → Phrygian or Aeolian
- house → **Dorian** (the raised-6th major-IV is the soulful tell), or Aeolian
- acid → Phrygian / minor pentatonic, one octave
- dub techno → Aeolian (minor triad / min7 stab)
- psytrance → **Phrygian** (then harmonic minor / Phrygian dominant)
- ambient → single centre; suspended/minor for dark, major/Lydian for serene
- synthwave → Aeolian (Phrygian/harmonic minor for outrun-dark; Mixolydian for bright)

**Progression selection:**

- Static/pedal genres (techno, dub, ambient, EBM, acid, psy) → default to a
  **single held chord / pedal**; optionally the **Andalusian descent** (i–VII–VI–V)
  for stepwise dark motion.
- Trance/synthwave → **i–VI–III–VII** as the workhorse; also vi–IV–I–V, I–V–vi–IV.
- House → **vi–IV–I–V** or a **Dorian i7 ⇄ IV vamp**; deep house → **ii7–V7–Imaj7**
  and 7th/9th loops (Fmaj7⇄Em7).

**Harmonic rhythm:** hold ≥4 bars/chord for techno/dub/EBM/psy/ambient/acid; ~1
bar/chord for house/trance/synthwave (2 for ballad/vamp). Loop the chord cycle on
4- or 8-bar boundaries.

**Bass template:**

- `rolling` (techno) → 16th grid, root, ghost notes between 8ths, velocity groove.
- `rolling16` (psy) → 16ths in the kick gaps (skip steps 0/4/8/12), hard duck.
- house bounce → **off-beat 8th-note** root (between the kicks).
- `acid303` → one-octave stepwise wander, ~60% density, slides + accents, octave
  jumps after slides, optional odd loop length (13/15).
- `ebm` → root–fifth/octave pedal sequence, gated short, velocity-varied, layered
  octaves.
- `reese`/dub → long sustained detuned-saw or sub-sine root, one per bar/section.
- `drone` (ambient) → single held root.
- `arp` (synthwave) → steady 8th/16th root/arp pulses; bass may carry the melody.

**Melody/lead:**

- Keep leads/arps strictly in the chosen mode and aligned with the bass.
- Trance: long supersaw hook in C5–C6, stated in breakdown, restated after drop;
  short-motif call + sustained answer.
- Techno: short motif, develop by shifting one note or swapping root↔fifth every
  8–16 bars.
- Synthwave: arpeggiate chord tones (up/down/up-down), 1–2 octave span.
- Psy: rolling modal motif interlocking with the 16th bass.

**Arrangement:**

- Quantize all sections to 8/16/32-bar blocks; never change off an 8-bar boundary.
- Curve: intro (layer in) → breakdown (strip) → build (riser + snare-roll + filter
  open, optional +4–8-bar extension) → drop (full) → repeat → outro (strip out).
- Drop tension kit: filter sweep, riser/uplifter, downbeat impact, accelerating
  drum roll, kick removal in breakdown.

**Sidechain (duck depth, kick→bass and optionally →pads/bus):** hardest for
psytrance; hard for trance; moderate for techno/house/EBM; light for acid;
gentle for dub; off for ambient; soft/optional for synthwave. Treat the pump as a
rhythmic feature, not just mix cleanup.

---

## How this intersects the repo's current model

The engine (`core/music.js`, `cyber/genres.js`,
`cyber/patterns.js`) already encodes named Roman-numeral `PROGRESSIONS`, a `MODES`
table, per-genre mode/progression assignment, and named `BASS_TEMPLATES`
(`rolling`/`rolling16`/`acid303`/`ebm`/`reese`/`arp`/`drone`). The theory above
mostly *validates* those choices; the concrete gaps and fixes:

**Progressions to add / correct:**

- The existing `andalusian: [1, 7, 6, 5]` is **exactly right** — it is the
  Aeolian i–VII–VI–V Andalusian descent. Keep it as the dark-genre default. (The
  Phrygian spelling iv–III–II–I is the same pitches; no change needed since the
  engine derives chords from the active mode.)
- Add **`ii-V-i` (or `ii7-V7-Imaj7`)** for soulful/deep house — currently house
  only has `vi-IV-I-V`. The jazz cadence with 7ths is the deep-house signature
  and is absent.
- Add a **Dorian vamp** option for house — a 2-chord `i7 ⇄ IV` (degrees `[1,4]`
  looping) — to exploit the raised-6th major-IV that *is* the Dorian tell. With
  `dorian` already assigned to house, the current `vi-IV-I-V` doesn't actually
  showcase the modal IV; a `i–IV` vamp does.
- Consider `i-VI-VII` (3-chord) as a synthwave/outrun alternative to the existing
  `i-VI-III-VII`.

**Mode fixes per genre (genres currently falling to random mode):**

- **techno** → pin to **Aeolian** (not random). "99.9% minor"; random Dorian/
  Phrygian misfires the mood.
- **trance** → pin to **Aeolian** (with optional harmonic-minor variant), not
  random.
- **dubtechno** → pin to **Aeolian** (minor triad/min7 stab is the genre tell).
- **ambient** → pin to a single centre (Aeolian or a suspended/major palette),
  not random.
- **synthwave** → **Aeolian** default (Phrygian/harmonic-minor for dark outrun;
  Mixolydian for bright), not random.
- **house** is correctly `dorian`; **acid/psytrance/industrial** correctly
  `phrygian`. Those are right per the literature.

**Harmonic-rhythm correction:** the current model uses ~1 chord per beat (4
cells/bar) for nearly all genres. That is **too fast** for the static genres.
Encode bars-per-chord: hold 4–16 bars for techno/dub/EBM/psy/acid, the whole
section for ambient, and reserve ~1 chord/bar for house/trance/synthwave only.
The `pedal` progression already gives a single chord; pair it with a slow
harmonic-rhythm clock rather than re-triggering per beat.

**Bass-template refinements:**

- `rolling16` (psy) correctly skips the kick downbeats — good. Tighten to "2–3
  notes per bar" density and ensure the **hard duck** (the engine's
  `psytrance.sidechain ≈ 0.85` depth aligns with the literature's "hardest
  sidechain").
- Add a **house off-beat-8th bass** template (notes on the &-of-each-beat, steps
  2,6,10,14) — house currently reuses `rolling`, which is the techno 16th roll,
  not the house *bounce*. This is the clearest concrete bass fix.
- `acid303` already wanders with accents/slides — add explicit **octave jumps
  paired with slides** and an optional **odd loop length (13/15 steps)** for the
  "woozy" cycle.
- `ebm` is a pedal/gated grid — add explicit **root–fifth/octave** motion (not
  just root) to match the muscular EBM sequence.

**Melodic rules worth encoding:**

- Trance lead: restate the breakdown motif after the drop (motif memory across
  arrangement sections), not just per-bar regeneration.
- Techno lead: "develop by subtraction" — shift one note or swap root↔fifth every
  8–16 bars rather than re-rolling the motif.
- Synthwave: let the **bass carry the arp/melody** (the genre's defining bass
  role), distinct from the lead.

---

## Sources

- Attack Magazine — [The Theory of Techno Pads (Part 1)](https://www.attackmagazine.com/technique/tutorials/the-theory-of-techno-pads-part-1/)
- Attack Magazine — [Deep House Chords](https://www.attackmagazine.com/technique/passing-notes/passing-notes-deep-house-chords/)
- Attack Magazine — [Dub Techno Synth Chords](https://www.attackmagazine.com/technique/synth-secrets/dub-techno-synth-chords/)
- Attack Magazine — [Basic Channel-Style Dub Techno](https://www.attackmagazine.com/technique/beat-dissected/basic-channel-style-dub-techno/)
- Unison — [Trance Chord Progressions](https://unison.audio/trance-chord-progressions/)
- Unison — [Synthwave Chord Progressions](https://unison.audio/synthwave-chord-progressions/)
- Unison — [Techno Chord Progressions](https://unison.audio/techno-chord-progressions/)
- Splice — [Dorian Mode](https://splice.com/blog/music-modes-dorian/)
- Hack Music Theory — [How to Write a Dorian Chord Progression](https://hackmusictheory.com/home/blog/014-how-to-write-a-dorian-chord-progression)
- Ben Rainey — [House Music Chord Progressions](https://www.benrainey.co.uk/blog/house-music-chord-progressions)
- Chordoo — [Melodic Techno Chord Progressions](https://www.chordoo.com/blog/melodic-techno-chord-progressions-for-dark-atmosphere)
- Myloops — [Melodic Techno Production Guide](https://www.myloops.net/melodic-techno-production-complete-guide-from-start-to-finish)
- Outerverse — [Understanding Scales & Modes in Psytrance](https://outerverse.fm/blogs/tutorials/understanding-scales-modes-in-psytrance)
- Melodigging — [Psytrance](https://www.melodigging.com/genre/psytrance)
- DJ TechTools — [History of the TB-303](https://djtechtools.com/2015/12/02/history-tb-303-rolands-accidental-legend/)
- MusicRadar — [Producer's Guide to the Roland TB-303](https://www.musicradar.com/news/producers-guide-to-the-roland-tb-303-and-clones)
- MusicTech — [How to Create a Chicago-Style Acid House Bassline](https://musictech.com/guides/essential-guide/how-to-create-a-chicago-style-acid-house-bassline/)
- Studio Brootle — [EBM Bassline Tutorial](https://www.studiobrootle.com/ebm-bassline-tutorial-ableton/)
- DJ Mag — [The Unstoppable Influence of EBM](https://djmag.com/content/unstoppable-influence-ebm)
- Aesthetics Wiki — [Electronic Body Music](https://aesthetics.fandom.com/wiki/Electronic_Body_Music)
- The Music Theory Professor — [Waveform Analysis in Ambient Music (Eno/Budd)](https://themusictheoryprofessor.com/waveform-analysis-in-ambient-music-the-techniques-of-brian-eno-and-harold-budd/)
- Abducted Android — [The Art of Chord Progressions in Ambient Music](https://abductedandroid.vuilniszak.be/insights/the-art-of-chord-progressions-in-ambient-music)
- Wikipedia — [Andalusian cadence](https://en.wikipedia.org/wiki/Andalusian_cadence)
- John Moore (UCSD) — [The Flamenco Key: Phrygian Mode, Andalusian Cadence](https://idiom.ucsd.edu/~moore/solbul.pdf)
- Mixed In Key — [How to Arrange a Dance Music Track](https://mixedinkey.com/captain-plugins/wiki/how-to-arrange-a-dance-music-track/)
- edmtips — [EDM Song Structure](https://edmtips.com/edm-song-structure/)
- Slate Digital — [What is Sidechaining](https://slatedigital.com/what-is-sidechaining/)
- Pro Audio Files — [Sidechain Pumping Techniques for EDM](https://theproaudiofiles.com/sidechain-pumping-techniques-edm/)
- Rick Snoman — *Dance Music Manual* (Focal Press); referenced for chord-construction fundamentals and dance-production theory.
