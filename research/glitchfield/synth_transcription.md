# Synth voice transcription — all 24 cells

Working doc to track and improve the melodic lines. Pulled live from `index.html` `LIB[]`.

- **Key:** C major, root 0, base MIDI 48. Loop = **64 steps = 4 bars** (bars split by `|`).
- **Degrees:** 0=root, 2=3rd, 3=4th, 4=5th, 5=6th, 7=octave, 9/10/12/14=upper octave; `-2`=6th below.
- **Cadence:** `Q→` = last note of bars 1-2 (steps 0-31), `A→` = last note of bars 3-4.

## The finding

Everything is **diatonic to C major** (nothing out of key) and register is cleanly tiered, so
nothing hard-clashes. The one coherence issue is **two tonal dialects**:

| dialect | scale degrees | pitch classes | chord it implies | count |
|---|---|---|---|---|
| **suspended** | 0,3,5,7,10,12 | C · F · A | open / modal (no 3rd, no 5th) | 13 |
| **major** | 0,2,4,5,7,9 | C · E · G · A | tonic major | 7 |
| **mixed** | uses both F and E/G | C·E·F·G·A | — | 3 |
| **pedal** | 0 (+ -2) | C (+ A) | root only | 1 |

They share **C** and **A**; they disagree on **F (suspended) vs E/G (major)**. The rub is F↔E (a
semitone) when a suspended pad sits under a major lead — in key, but the mood flips between
"open/modal" and "resolved major" depending on which cells cluster. The suspended set is most of
the original library; the major set is mostly the recent rewrites (DR-04, CB-07, SD-08, CL-14,
VO-10, VO-22 + the original SW-24).

**Decision to make:** unify toward one dialect, or keep the contrast on purpose.

---

## SUSPENDED (C–F–A) — 13 cells

```
AC-01  acid rush    acid  · 40 notes · Q→5 A→0
   0 . 3 0 . 0 7 . 3 0 . 10 0 . 7 . |  0 . 7 0 . 3 5 . 7 0 . 3 10 . 5 . |  0 . 5 0 . 3 10 . 5 0 . 12 0 . 10 . |  0 . 10 0 . 7 12 . 5 0 . 3 7 . 0 .

SD-02  sid stab     sid   · 40 notes · Q→12 A→0
   0 . 0 12 . 7 0 . 3 . 0 5 . 0 10 . |  0 . 0 10 . 5 0 . 7 . 0 3 . 0 12 . |  0 . 0 14 . 10 0 . 5 . 0 7 . 0 12 . |  0 . 0 7 . 3 0 . 12 . 0 5 . 0 0 .

FM-03  fm rattle    fm    · 40 notes · Q→3 A→0
   0 3 . 7 0 . 3 5 . 0 7 . 3 . 10 . |  0 5 . 7 0 . 5 3 . 0 10 . 7 . 3 . |  0 7 . 10 0 . 7 5 . 0 12 . 5 . 3 . |  0 10 . 5 0 . 3 7 . 0 5 . 3 . 0 .

RE-05  reese roll   reese · 33 notes · Q→0 A→0
   0 . 0 3 . 0 . 7 . 0 .-2 . 0 . . |  0 . 0 5 . 0 . 3 . 0 . 7 . 0 . . |  0 . 0 7 . 0 . 5 . 0 . 3 . 0 . . |  0 . 0 3 . 0 .-2 . 0 . 5 . 3 0 .

AC-06  acid glide   acid  · 32 notes · Q→0 A→0
   0 . 3 . 0 . 7 . 0 . 5 . 3 . 0 . |  0 . 5 . 0 . 10 . 0 . 7 . 5 . 0 . |  0 . 7 . 0 . 12 . 0 . 10 . 7 . 0 . |  0 . 10 . 0 . 5 . 0 . 3 . 5 . 0 .

AC-12  acid ghost   acid  · 20 notes · Q→7 A→0
   0 . . 3 . . . 7 . . 0 . . 5 . . |  0 . . 5 . . . 10 . . 0 . . 7 . . |  0 . . 7 . . . 12 . . 0 . . 10 . . |  0 . . 3 . . . 5 . . 0 . . 0 . .

SB-13  sub pop      sub   · 20 notes · Q→0 A→0
   0 . . 5 . . 0 . . . 3 . . 0 . . |  0 . . 7 . . 0 . . . 5 . . 0 . . |  0 . . 3 . . 0 . . . 7 . . 0 . . |  0 . . 5 . . 0 . . .-2 . . 0 . .

VO-15  formant air  vo    · 12 notes · Q→3 A→0
   7 . . . 5 . . . 3 . . . 10 . . . |  7 . . . 10 . . . 5 . . . 3 . . . |  5 . . . . . . . 3 . . . . . . . |  7 . . . . . . . 0 . . . . . . .

SB-16  deep sub     sub   · 12 notes · Q→0 A→0
   0 . . . . . 3 . . . . . 0 . . . |  0 . . . . . 5 . . . . . 0 . . . |  0 . . . . . 7 . . . . . 0 . . . |  0 . . . . .-2 . . . . . 0 . . .

FM-17  fm haze      fm    · 16 notes · Q→10 A→0
   0 . . . 7 . . . 5 . . . 3 . . . |  0 . . . 5 . . . 7 . . . 10 . . . |  0 . . . 10 . . . 7 . . . 5 . . . |  0 . . . 3 . . . 5 . . . 0 . . .

PL-18  pluck rain   bell  · 8 notes · Q→3 A→0
   0 . . . . . . . 5 . . . . . . . |  7 . . . . . . . 3 . . . . . . . |  10 . . . . . . . 7 . . . . . . . |  5 . . . . . . . 0 . . . . . . .

RE-19  reese fog    reese · 8 notes · Q→0 A→0
   0 . . . . . . . 3 . . . . . . . |  5 . . . . . . . 0 . . . . . . . |  5 . . . . . . . 7 . . . . . . . |  3 . . . . . . . 0 . . . . . . .

FM-09  fm bells     bell  · 12 notes · Q→0 A→0  (very high: MIDI 94–111)
   0 . . . . . 3 . . . . . 0 . . . |  7 . . . . . 5 . . . . . 0 . . . |  5 . . . . . 7 . . . . . 3 . . . |  10 . . . . . 7 . . . . . 0 . . .
```

## MAJOR (C–E–G–A) — 7 cells

```
DR-04  broken kit   sub   · 30 notes · Q→4 A→0
   0 . . 2 . 0 .-2 0 . . 2 . 4 . . |  . 0 . 5 . 4 . 2 0 .-2 . 0 . . 4 |  0 . . 2 . 0 .-2 0 . . 5 . 4 . 2 |  . 0 . 4 . 2 .-2 0 .-2 . 0 . . .

CB-07  cowbell funk sub   · 13 notes · Q→4 A→0
   0 . . . . . 4 . . . 0 . . . . . |  . . 2 . 4 . . . . . 4 . . . . . |  0 . . . . . 4 . . . 5 4 . . . . |  . . 2 .-2 . . . 0 . . . . . . .

CL-14  clap groove  sub   · 11 notes · Q→4 A→0
   0 . . . . . . . 4 . . . 0 . . . |  . . . . 2 . . . 4 . . . . . . . |  0 . . . . . . . 5 . . . 4 . . . |  2 . . .-2 . . . 0 . . . . . . .

VO-10  vox chop     vo    · 18 notes · Q→4 A→0
   7 . . . 5 . 4 . 7 . . . 9 . . . |  7 . . . 5 . . . 4 . . . . . . . |  7 . . . 9 . 7 . 5 . . . 7 . . . |  5 . . . 4 . 2 . 4 . . . 0 . . .

SD-08  chip melody  bell  · 14 notes · Q→4 A→0
   0 . . . . . . . 7 . . . . . . . |  4 . . . . . 5 . 4 . . . . . . . |  0 . . . . . . . 7 . 9 7 . . . . |  5 . 4 2 . . 4 . . . . . 0 . . .

VO-22  choir        vo    · 5 notes · Q→4 A→0
   0 . . . . . . . . . . . . . . . |  . . . . . . . . 4 . . . . . . . |  5 . . . . . . . . . . . . . . . |  . . . . 4 . . . 0 . . . . . . .

SW-24  saw wash     bell  · 8 notes · Q→0 A→0
   0 . . . . . . . . . 7 . . . . . |  4 . . . . . . . . . 0 . . . . . |  5 . . . . . . . . . 2 . . . . . |  7 . . . . . . . . . 0 . . . . .
```

## MIXED (both F and E/G) — 3 cells

```
PL-11  pluck dot    pluck · 24 notes · Q→5 A→0  (uses 2,3 — E and F)
   0 . 7 . . 5 . . 3 . . 0 . 7 . . |  0 . 5 . . 3 . . 7 . . 0 . 5 . . |  0 . 10 . . 7 . . 5 . . 0 . 3 . . |  0 . 7 . . 5 . . 3 . . 2 . 0 . .

PD-20  string pad   pad   · 15 notes · Q→4 A→0  (uses 2,3,4 — E,F,G)
   0 . . . 4 . . . 5 . . . 3 . . . |  0 . . . 5 . . . 7 . . . 4 . . . |  2 . . . 4 . . . 5 . . . 3 . . . |  4 . . . 3 . . . 0 . . . . . . .

PD-21  wide drone   pad   · 8 notes · Q→0 A→0  (uses 3,4 — F,G)
   0 . . . . . . . 5 . . . . . . . |  3 . . . . . . . 0 . . . . . . . | -2 . . . . . . . 3 . . . . . . . |  4 . . . . . . . 0 . . . . . . .
```

## PEDAL — 1 cell

```
SB-23  sub drone    reese · 4 notes · Q→0 A→0
   0 . . . . . . . . . . . . . . . |  0 . . . . . . . . . . . . . . . | -2 . . . . . . . . . . . . . . . |  0 . . . . . . . . . . . . . . .
```
