# Technique digests

Sourced, sectioned write-ups of how a sound is actually made. A spec sheet draws
from a digest; code cites its section numbers at the point of use.

A digest is not a description of what a genre feels like. It is the measurable
layer — parameters, ranges, structures — and the sources they came from.
`RESEARCH.md` is the gate that gets one written.

## Why they live here and not in the instrument

The same digest gets used more than once. A dub echo description informs a dub
instrument and also the delay on something else entirely. Holding it in the
studio means the second instrument starts from the research rather than
redoing it, and means a correction lands in one place.

## Citing a digest

Number the sections. Code cites them where the number is used:

```js
// dub_techno_technique.md §2 — feedback rides a 4.26 Hz random-waveshape LFO
feedbackLfo.frequency.value = 4.26;
```

An uncited constant is a number nobody can defend when it is questioned six
months later. A digest whose sections are unnumbered cannot be cited at all.

## Travelling with an instrument

A digest an instrument cites travels with it when it buds, as a copy. The code
references section numbers, and those must not drift out from under it.

## Present

- `dub_techno_technique.md` — dub techno: echo parameters and modulation rates,
  the riddim substrate, the dry-frame rule, the low-dominant mix, section
  timing. Digested from a musicology thesis; §5 covers the sound, §7 structure.
