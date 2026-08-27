# Shakuhachi honkyoku

## 1. Tuning

Pitch is continuously variable by playing technique rather than fixed by the instrument. **Meri** lowers a pitch by dropping the chin and shading finger holes; **kari** raises it by lifting the chin. Notation marks these with small arrows ([Shakuhachi musical notation](https://en.wikipedia.org/wiki/Shakuhachi_musical_notation); [*The Gentle Art of Meri*](http://shakuhachi.wikidot.com/meri)).

Meri and kari are not ornaments applied to a fixed pitch — they are how several of the instrument's pitches are produced at all. A given fingering has a meri and a kari version with different timbre as well as different pitch, so pitch and colour move together.

## 2. Instrumentation

End-blown bamboo flute, five holes. The breath is the envelope: attack, sustain, decay and the noise component all follow one air stream, and techniques like *muraiki* (a deliberate over-blown breath noise) put the noise floor in the foreground.

## 3. Performance structure

**Honkyoku** pieces are made of short phrases — often a few tones, sometimes one — separated by obligatory breaths and silences. **Most pieces have no beat and no imposed linear rhythmic structure**, only a slow, irregular meditative pulse ([The Sound Atlas](https://thesoundatlas.org/discover/shakuhachi-music); [Josen Shakuhachi](https://josenshakuhachi.com/shakuhachi-guides/shakuhachi-honkyoku-kyorei)).

**Ma** (間) — silence, or negative space — is treated as a musical element equal in weight to sound. A rest is not an absence of note; it is a duration with its own value.

Notation is vertical, katakana-based, and specifies **fingering and timing relative to the breath** rather than absolute duration. It functions as a mnemonic within a semi-oral transmission rather than as a complete specification.

The structural consequence: **phrase length is set by the breath, not by a grid**, and the piece is a sequence of breaths rather than a sequence of bars. `drone_flute_synth/engine/breath.js` models exactly this — a Performer handing out one breath at a time, with inhale as a first-class duration — and was written without a source. This is the source it never had.
