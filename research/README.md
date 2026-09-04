# Research

Before an instrument gets built here, the sound gets read about.

A digest is what that reading turns into: not a description of how a genre feels, but its measurable layer — the parameters, the ranges, the structures, and the sources they came from. When a constant later shows up in code, it can be defended, because somebody found it rather than guessed it.

The shelf runs from dub techno's echo to the anatomy of a dubstep drop, from wavetable and FM synthesis to jazz voice leading, and out through a long survey of world and historical traditions — raga, gamelan, Arabic maqam, Tuvan overtone singing, Georgian polyphony, medieval mensuration canon — each read for what it actually specifies about tuning, instrumentation and form rather than for atmosphere.

`INDEX.md` is the map of it. `RESEARCH.md` at the repo root is how a claim earns its place, and why invented history and half-remembered gear specs are the failure it exists to catch.

## Why the reading lives here and not in the instrument

The same digest gets used more than once. A description of dub echo informs a dub instrument, and also the delay on something else entirely. Held in the studio, the second instrument starts from the research instead of redoing it, and a correction lands in one place.

## What a number needs

A value that came from research carries its reason beside it, written out:

```js
// Feedback rides a 4.26 Hz random-waveshape LFO — a hand riding the knob in
// time with the track, deliberately off the grid so the motion never repeats.
feedbackLfo.frequency.value = 4.26;
```

Code does not point back into this directory. A reader of the code should not have to open another file to learn why a constant is what it is, and a digest that gets edited should not quietly change the meaning of a line somewhere else.
