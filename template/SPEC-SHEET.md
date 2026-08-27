# INSTRUMENT_SLUG — spec sheet

A sketch to get from an idea to the first thing that plays. An afternoon's
thinking, not a design document.

**Delete this file once the instrument plays.** A running instrument answers
everything this page asks, and a page kept past that point becomes a second copy
of the code with nothing checking it against the first.

## The sound

One paragraph. What does a listener hear? Name the reference — the record, the
player, the machine — and say what specifically about it you are after.

## The digest it rests on

Which technique digest in `research/` does this draw from, and which sections?
If there is none yet, that research comes first — see `RESEARCH.md`.

If a number in this spec has no section behind it, mark it as a guess. Guesses
are allowed here. Guesses that quietly become constants in the code are not.

## The mechanism

How is the sound actually made? Signal path, roughly. Which parts are
synthesised, which are sampled, which are recorded.

- Voices:
- Effects:
- Sequencing:

## The smallest thing that proves it

What is the one-afternoon version? Usually a single voice with the
characteristic gesture, over a fixed pattern, with no UI beyond a start button.
If that does not sound like the reference, nothing built on top of it will.

## What it is made of

- Scales, modes, tuning:
- Tempo and meter:
- Structure:
- Samples needed (and where they come from — see `RIGHTS.md`):

## How you will know it worked

The measurable claim. Not "sounds right" — something the render harness can
read. Spectral centre in a band, a modulation depth at a period, a decay time, a
level relationship between two layers, a pitch within cents of a target.

Write it before building. It is the difference between verifying and hoping.

## Open questions

What you do not know yet, and what would settle it.
