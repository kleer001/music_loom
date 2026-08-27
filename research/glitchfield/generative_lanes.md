# Generative lanes — design

A direction that replaces the authored per-cell note grids (`LIB` seq strings, `P()`, `arrSeqs`,
and the melodic half of `fireStep`) with three self-generating lanes. **A node is one lane:**
`lead`, `pad`, or `bass`. Notes are produced by a per-lane generator seeded deterministically, not
typed. Compose by placing and connecting nodes on the field — several leads next to each other is a
valid choice (they trade phrases).

## Frame

- A lane generates its **64-step buffer** (4 bars, 16th resolution) at **phrase boundaries** and
  when it relinks / retunes / its temp changes. `fireStep` reads the buffer exactly as it reads an
  authored sequence today. Nothing regenerates per frame.
- Seed = `id ⊕ phraseIndex ⊕ stateHash(temp, links)`. A frozen field holds still; re-wiring re-rolls
  — consistent with the rule that anything that looks random is derived from id / position / phase.
- Generation is in **scale-degree space**, reading the live chord (`HARM_OFF` / `HARM_MODE`) through
  the chord-tone lock (`HARMLOCK`). All lanes share the current chord, so the field is harmonically
  coherent by construction and a key/mode change retunes every lane at once.

## Temp

`temp` is internal (0–1) and derived — not a user control. Roughly `temp = clamp(d + 0.12·links, 0, 1)`:
density plus how wired-up the node is. The three sliders `d / g / s` stay as the hands-on surface —
`d` feeds temp, `g` is grit/drive, `s` is space/register height. Connecting a node raises its temp
(embellishments wake, range widens) and tightens it (chord-lock strength + pocket lock rise);
isolating it cools and simplifies it.

## Loop length

Connections also grow the loop. An isolated node loops its 4-bar buffer. Linking doubles the length
(4 → 8 → 16 bars, capped): the buffer becomes several 4-bar blocks where **block 0 is the stable
home** and later blocks are re-rolled **variations** of it. So bringing nodes together lengthens the
phrase *by adding variation*, not by stretching — density (temp) and length grow together. Each node
holds its own loop length and re-rolls its variation blocks at its own phrase boundary.

## LEAD

A through-composed gesture machine (after cyber_synth `cyber/solo.js`). A gesture pool weighted by
`energy = temp · arch(step)`, where `arch` is one late-climax curve across the phrase:

- **low energy** → held/breathing gestures (sing, sigh, motif), wide rests, narrow range
- **mid energy** → developing variation (noodle, motif, motif-head)
- **high energy** → flurries plus one altissimo peak ("a change of kind"), wide range

Inherited behaviours: every phrase ends on a held note + a real rest; note-values are weighted
(quarters/8ths dominant, 16ths and triplets as spice); the motif is restated at least every ~4 bars;
phrases start near where the last ended. The mode's characteristic colour tone (the ♭2/♭6 analogue)
is leaned on and used for the cadential sigh.

Two lead nodes seed differently → different motifs and climax timing; register-spread plus a
third-of-a-bar answer offset stagger them so they trade rather than collide.

## PAD

A chord-hold generator, not a melody. Each bar: `chordTones(chordRoot, mode, size)` with `size` a
triad below ~0.5 temp and a 7th above, voiced under the lead (`voiceUnder`) so it never collides.
Harmonic rhythm scales with temp: one chord per phrase (a drone) at low temp → per bar → per beat
with passing voicings at high temp. `s` drives reverb, register height, and a long release.

## BASS

A template selected by temp, root motion following the chord:

- `< .25` drone / reese — one held root
- `< .55` tresillo (3+3+2) / bounce — syncopated pedal
- `< .8`  rolling-16ths that skip the kick downbeats — the kick interlock
- `≥ .8`  303-style wander — slides and an octave jump after a slide

Stays in the sub frequency slot via the role high-pass. `g` drives distortion/resonance.

## Together

- **Register**: bass low / pad voiced-under / lead on top; the role high-pass keeps the slots apart.
- **Harmony**: all three read the same chord each bar; the progression steps on the bar interval.
- **Connection**: a link raises energy (wake embellishments, widen range) and tightens (chord-lock +
  pocket); spreading nodes apart cools and simplifies them.
- **Call-and-response**: the lead breathes, leaving gaps the pad/bass fill; two leads stagger via
  turn-taking slots; a third-of-a-bar echo makes one line answer another.

## Drums — the Amen, chopped the way it's actually done

The break is the kit, sliced and resequenced (jungle technique), not played through.

- **Slice on transients, not a grid.** Cutting on a rigid 16th grid chops each hit mid-decay and
  destroys Gregory Coleman's microtiming ("resequencing on a strict 16th grid loses the groove").
  Detect the onsets, slice hit-to-hit so every kick/snare/hat stays whole with its tail; classify
  each slice (kick / snare / hat) by spectral centroid.
- **Resequence into a new pattern.** Reassemble the slices into a fresh 4-bar break — bar-shuffle,
  reversed slices, a snare roll into the drop (bar 4), dropped hats for space. The field drives how
  far it strays from the source: grit/energy = chop intensity (calm = near the original, hot =
  heavy edits). Each hit triggers as a one-shot repitched to tempo, ringing its natural length.
- Reverse-slices play from a pre-reversed copy of the buffer at the mirrored offset.
- Classic moves worth having: ghost snares (soft snare on the 16th after a hat), the signature
  delayed snare on beat 4, retrigger/roll fills, per-hit pitch.

The onset table + rough roles are precomputed offline (spectral-flux onset detection) and inlined
alongside the base64 sample, so the runtime just decodes, slices, and resequences.

## The 24 — palette

The rack is **3 lanes × 8 temperature rungs**. Code = lane letter + rung; `d` sets the base
temp (rung 1 coolest/calmest, rung 8 hottest), `g` grit, `s` space. Every existing synthesis
machine (`buildTone` + `drumVoice`) is retained and distributed along the ladders — the note
*source* changes (generator, not authored grid), the *timbre* does not. Rung voices cluster the
machine changes mid-ladder where a player dwells.

Node faces are emoji, one family per lane, hue-ordered warm→cool (average-hue measured off the
rendered glyph). Rung 1 = the cool/blue end, rung 8 = the warm/red end, so the face reads a
node's heat at a glance. Lane = the family (shape); rung = the color.

| code | name | voice | d | g | s | generator | face |
|---|---|---|---|---|---|---|---|
| **B1** | sub drone | sub | .08 | .10 | .30 | one held root | 🚙 |
| **B2** | deep sub | sub | .20 | .15 | .28 | sparse root pulses | 🚲 |
| **B3** | reese fog | reese | .34 | .30 | .32 | held reese, slow motion | 🚈 |
| **B4** | reese grind | reese | .46 | .55 | .30 | tresillo (3+3+2) | 🚜 |
| **B5** | sid bounce | sid | .56 | .45 | .30 | bounce / syncopated pedal | 🚕 |
| **B6** | acid roll | acid | .66 | .55 | .35 | rolling-16s, kick interlock | 🚚 |
| **B7** | acid drive | acid | .80 | .70 | .40 | rolling-16s + slides | 🏍️ |
| **B8** | 303 wander | acid | .94 | .85 | .45 | 303 wander, octave jumps | 🚒 |
| **L1** | pluck rain | pluck | .10 | .10 | .40 | sing / sigh, wide rests | 🐬 |
| **L2** | pluck echo | pluck | .26 | .15 | .50 | motif, breathing | 🐟 |
| **L3** | chime | bell | .38 | .20 | .55 | motif + motif-head | 🐋 |
| **L4** | bell fm | bell | .48 | .35 | .55 | noodle | 🦎 |
| **L5** | fm lead | fm | .58 | .45 | .50 | noodle + flurry | 🐢 |
| **L6** | vox chop | vo | .68 | .40 | .50 | flurry, syncopated | 🐸 |
| **L7** | sid lead | sid | .80 | .55 | .55 | flurry, wide range | 🐯 |
| **L8** | fm flurry | fm | .94 | .65 | .60 | flurry + altissimo peak | 🦊 |
| **P1** | sub wash | pad | .08 | .05 | .55 | one chord / phrase (drone) | 🫐 |
| **P2** | wide drone | pad | .20 | .10 | .65 | one chord, wide voicing | 🍇 |
| **P3** | vox choir | vo | .34 | .15 | .60 | chord / phrase | 🍆 |
| **P4** | choir wide | vo | .46 | .20 | .70 | triad / bar | 🥦 |
| **P5** | string pad | pad | .56 | .30 | .65 | 7ths / bar | 🌽 |
| **P6** | bright pad | pad | .66 | .35 | .70 | passing voicings / bar | 🥕 |
| **P7** | glass pad | west | .78 | .30 | .75 | chord / beat (lowpass-gate) | 🍅 |
| **P8** | shimmer | pad | .90 | .40 | .80 | passing / beat, high register | 🍊 |
