# Jazz Improvisation — Curated Lessons for a Procedural Generator

Research notes for ferine_town's live, generative jazz engine (Web Audio, fully
procedural — chord progressions, walking bass, comping, melodic improv generated
at runtime). Each resource below is chosen for *mechanical* content that maps to
rules, tables, and algorithms. A "rules distilled for a code generator" section
at the end consolidates the implementable parts.

Music-theory shorthand used throughout: scale degrees `1 2 b3 3 4 #4 5 b6 6 b7 7`;
chord qualities `maj7`, `m7`, `7` (dominant), `m7b5` (half-diminished). Notes are
treated as pitch classes 0–11 for the code mapping.

---

## 1. Chord-Scale Theory — Open Music Theory

- **URL:** https://viva.pressbooks.pub/openmusictheory/chapter/chord-scale-theory/
- **Teaches:** Every chord is "colored" by a parent scale, and in a major key the
  Roman-numeral position of the chord equals the mode number to use over it.
  Canonical beginner mapping: Dorian over `m7` (the ii), Mixolydian over `7` (the
  V), Ionian/major over `maj7` (the I). A `Dm7` extended to the 13th (D F A C E G B)
  *is* the D Dorian collection — chord and scale are the same note set, which is
  why the mapping works.
- **Maps to a generator:** This is the central **chord-quality → scale lookup
  table**. For the melodic-improv and bass voices, pick notes from
  `scaleForChord(quality, root)`:
  - `maj7` → Ionian `[0,2,4,5,7,9,11]` (or Lydian `[0,2,4,6,7,9,11]` to avoid the
    "avoid note" 4 over a tonic major)
  - `m7` → Dorian `[0,2,3,5,7,9,10]`
  - `7` → Mixolydian `[0,2,4,5,7,9,10]`
  - `m7b5` → Locrian `[0,1,3,5,6,8,10]`
  - altered `7alt` → altered scale `[0,1,3,4,6,8,10]`
  The Roman-numeral = mode-number rule means you can derive scales straight from
  the progression degree without a per-chord annotation.

## 2. The Bebop Scale — Learn Jazz Standards

- **URL:** https://www.learnjazzstandards.com/blog/learning-jazz/jazz-theory/use-bebop-scales-like-pro/
- **Teaches:** Bebop scales are 7-note scales with one inserted chromatic passing
  tone, making them 8 notes so they cycle per octave/bar.
  - **Dominant bebop:** Mixolydian + passing tone between `b7` and `1`
    → `1 2 3 4 5 6 b7 7` (over `7` chords).
  - **Major bebop:** major scale + passing tone between `5` and `6`
    → `1 2 3 4 5 b6 6 7` (over `maj7`).
  - **Minor (Dorian) bebop:** Dorian + passing tone between `b3` and `4`
    → `1 2 b3 3 4 5 6 b7` (over `m7`).
  - **The downbeat rule:** start on a chord tone on a strong beat, run the scale in
    straight 8th notes, and every chord tone lands on a downbeat while non-chord
    tones land on upbeats. Seven-note scales drift by an 8th note per bar; the
    extra chromatic note resets the alignment.
- **Maps to a generator:** This is the single most code-friendly improv rule.
  Algorithm: emit 8th-note runs from the bebop scale for the current chord; when
  the line starts on a chord tone (1/3/5/7) on beat 1, 2, 3, or 4, chord tones
  auto-fall on beats. Concretely — index the 8-note scale by 8th-note position in
  the bar; positions {0,2,4,6} are chord tones, {1,3,5,7} are passing/color tones.
  No beat-by-beat note picking needed; pick a start note + direction and let the
  scale do the alignment.

## 3. Guide Tones & Voice Leading — Piano With Jonny

- **URL:** https://pianowithjonny.com/piano-lessons/how-to-use-guide-tones-for-jazz-piano/
- **Teaches:** The **3rd and 7th** are the "guide tones" — they alone define chord
  quality (maj7 vs dom7 vs m7), so root+3rd+7th ("shell voicing") fully states the
  harmony. Voice-leading rules: **7ths resolve down by step**, **common tones are
  held**, and across a ii-V-I you alternate (invert) the 3rd/7th pair each chord so
  only one voice moves a half/whole step at a time. Rootless voicings drop the root
  (covered by the bass) and free room for 9ths/13ths.
- **Maps to a generator:** The **comping voicing engine**. For each chord, build a
  shell `[3rd, 7th]` (+optional 9/13). Voice-lead by keeping the previous voicing's
  pitch classes and moving each to the nearest tone of the new chord — implement as
  a nearest-pitch-class search constrained to a register window, with the explicit
  rule "7→3 of next chord resolves down a half step" over dominant motion. Over
  `ii-V-I` the 7th of ii becomes (or steps to) the 3rd of V, the 7th of V steps
  down to the 3rd of I — a deterministic 2-voice trajectory.

## 4. Walking Bass Line in 4 Steps — Learn Jazz Standards

- **URL:** https://www.learnjazzstandards.com/blog/learning-jazz/bass/write-walking-bass-line/
- **Teaches:** Four quarter notes per bar. Step method:
  1. Lay out the chord progression (7th chords).
  2. **Beat 1 = root** of the current chord (harmonic anchor).
  3. **Beat 4 = approach tone** to the next chord's root — choose one of: the 5th
     of the next root, a half step *below* it, or a half step *above* it.
  4. **Beats 2–3 = chord tones / scale tones** (root, 3rd, 5th, 7th) chosen for
     smooth, mostly stepwise motion.
  Lines are built from three ingredients: scale runs, arpeggios, chromatic approach.
  Smooth-transition constraint: limit the interval from a bar's last note to the
  next root to a half step, whole step, or perfect 5th.
- **Maps to a generator:** The **walking-bass algorithm**, almost literally a
  per-beat state machine:
  - `beat[0] = chordRoot`
  - `beat[3] = pick(next.root + 7 semitones [the 5th approach], next.root ± 1
    [chromatic approach])`
  - `beat[1], beat[2] = chord/scale tones of current chord, biased to step toward
    beat[3]`
  Seed the random pick so it stays deterministic if the engine ever needs it
  (ferine_town's audio is outside the determinism contract, but a salted chooser
  keeps it reproducible for tuning).

## 5. ii-V-I, 12-Bar Blues & Form — Learn Jazz Standards / Wikipedia

- **URLs:** https://www.learnjazzstandards.com/blog/jazz-chord-progressions/ ·
  https://en.wikipedia.org/wiki/Twelve-bar_blues
- **Teaches:** The structural skeletons improv runs over.
  - **ii-V-I (major):** `iim7 – V7 – Imaj7` (key of C: `Dm7 – G7 – Cmaj7`). Minor
    variant: `iim7b5 – V7(alt) – im7`. The most common harmonic cell in jazz; long
    tunes are chains of ii-V-I's in shifting keys.
  - **12-bar blues:** three 4-bar phrases, chords I/IV/V, all dominant 7ths in jazz
    blues. Basic grid (bars 1–12): `I I I I | IV IV I I | V IV I V`. "Quick change"
    swaps bar 2 to IV. Jazz blues adds ii-V's (e.g. bar 9–10 `iim7 V7`, bar 12 turnaround).
  - **Rhythm changes:** the 32-bar AABA form from "I Got Rhythm"; A-section is a
    repeated I-vi-ii-V turnaround cycle, B-section (bridge) is a cycle of dominant
    7ths (III7-VI7-II7-V7).
- **Maps to a generator:** The **form/progression layer** that feeds chords to the
  other four voices. Represent forms as arrays of `{degree, quality, bars}`; a
  transposer turns degrees into roots for the current key. The blues grid and
  rhythm-changes turnaround are fixed templates; ii-V-I is a reusable cell you can
  insert as a cadence or chain across keys. Everything downstream (scale lookup,
  bebop runs, walking bass, guide-tone comping) consumes this chord stream.

---

## Rules Distilled for a Code Generator

### A. Form / progression layer (drives everything)
- Store progressions as degree+quality+duration, transpose per key:
  - `ii-V-I major`: `[(2,m7,1),(5,dom7,1),(1,maj7,2)]` bars.
  - `ii-V-i minor`: `[(2,m7b5,1),(5,alt7,1),(1,m7,2)]`.
  - `12-bar blues (jazz)`: `I7 IV7 I7 I7 | IV7 IV7 I7 I7 | iim7 V7 I7 V7`.
  - `rhythm changes A`: repeated `I vi ii V` turnaround; `B` (bridge): `III7 VI7 II7 V7`.
- A "turnaround" = a short ii-V (or I-vi-ii-V) inserted in the last 1–2 bars to
  loop back to the top — use it to stitch repeats seamlessly.

### B. Chord-quality → scale table (for melody + bass note pools)
| Quality   | Scale (mode)     | Degrees (semitones from root) |
|-----------|------------------|-------------------------------|
| maj7      | Ionian / Lydian  | `0 2 4 5 7 9 11` / `0 2 4 6 7 9 11` |
| m7        | Dorian           | `0 2 3 5 7 9 10` |
| 7 (dom)   | Mixolydian       | `0 2 4 5 7 9 10` |
| m7b5      | Locrian          | `0 1 3 5 6 8 10` |
| 7alt      | Altered          | `0 1 3 4 6 8 10` |
| diminished| Whole-half dim   | `0 2 3 5 6 8 9 11` |

### C. Bebop melodic engine (8th-note runs)
- Bebop scales = base scale + 1 chromatic passing tone, 8 notes total:
  - dom: `0 2 4 5 7 9 10 11` (pass between b7 and 1)
  - maj: `0 2 4 5 7 8 9 11` (pass between 5 and 6)
  - dorian/min: `0 2 3 4 5 7 9 10` (pass between b3 and 4)
- Run rule: start on a chord tone (`0/3or4/7/10or11`) on a strong 8th-note slot;
  emit straight 8ths along the scale. Index by 8th-note position: even slots land
  chord tones, odd slots land passing/color tones — no per-note harmony check needed.
- Phrasing: chunk runs into 2–4 beat phrases with rests between (call-and-response);
  end phrases on a chord tone, preferably 3rd or root.

### D. Walking bass (4 quarter notes/bar) — per-beat state machine
- Beat 1: root of current chord.
- Beats 2–3: chord/scale tones (root, 3rd, 5th, 7th), biased to stepwise motion
  toward the beat-4 target.
- Beat 4: approach to next root — pick from {next-root +7 (the 5th), next-root −1,
  next-root +1}.
- Smoothness constraint: interval from beat 4 to next beat 1 ≤ whole step, or a P5.
- Ingredient mix per bar: scale fragment, arpeggio, or chromatic approach.

### E. Comping voicings + voice leading
- Shell = `[root, 3rd, 7th]`; rootless = `[3rd, 7th, +9th/13th]` (bass covers root).
- Voice-lead by nearest pitch class within a fixed register window; hold common
  tones; resolve 7th down by step into the next chord's 3rd.
- ii-V-I deterministic trajectory: 7th(ii)→3rd(V), 7th(V)↓half-step→3rd(I); only
  one or two voices move per change.

### F. Comping rhythm templates (one-bar patterns, 4/4)
- Charleston: hit on beat 1 and the "and" of 2 (the canonical syncopated stab).
- Sparse/anticipation: play chords on off-beats ("ands"), leave downbeats to bass.
- Vary density by section: thinner under a soloist's space, denser at phrase ends.
- Pick patterns from a small weighted table per bar; rests are as important as hits.

### G. Glue rules
- Determinism: ferine_town's audio is real-time and outside the seed contract, but
  for the tuning editor a salted chooser (`stableChooser`) keeps voicings/lines
  reproducible.
- All voices read the same chord stream from layer A; tempo (bpm) and swing ratio
  (~2:1 long-short 8ths) are global tunables alongside the existing
  `DEFAULT_AUDIO_CONFIG` jazz settings.

---

## Sources
- Chord-Scale Theory — Open Music Theory: https://viva.pressbooks.pub/openmusictheory/chapter/chord-scale-theory/
- The Bebop Scale — Learn Jazz Standards: https://www.learnjazzstandards.com/blog/learning-jazz/jazz-theory/use-bebop-scales-like-pro/
- Guide Tones for Jazz Piano — Piano With Jonny: https://pianowithjonny.com/piano-lessons/how-to-use-guide-tones-for-jazz-piano/
- Write a Walking Bass Line in 4 Steps — Learn Jazz Standards: https://www.learnjazzstandards.com/blog/learning-jazz/bass/write-walking-bass-line/
- Jazz Chord Progressions / ii-V-I — Learn Jazz Standards: https://www.learnjazzstandards.com/blog/jazz-chord-progressions/
- Twelve-bar blues — Wikipedia: https://en.wikipedia.org/wiki/Twelve-bar_blues
