# Bibliography

Prior art this studio's conventions descend from or grade against. Entries are checked against the publisher, archive or project documentation rather than recalled, and carry their access status.

An entry arrives when a convention here starts leaning on an outside source, and leaves when nothing leans on it any more.

## Method

- **[M1]** Copier — template-to-daughter update mechanism. Records the source commit in the generated project and replays template changes as an update rather than a re-copy. The version tie in `CONTRIBUTING.md` is this shape, diverging on one point: this studio delivers a *proposal* a session interprets, not a patch a merge algorithm computes, because the payload is mostly prose and no merge algorithm reconciles two paragraphs that nearly agree. — Open source, docs online.

## Audio and DSP

Entries belong here when a `core/` module or something the rack rests on leans on them — filter cookbooks, synthesis texts, psychoacoustic measurements, loudness standards. Each entry names what in this repo depends on it.

- **[A1]** Robert Bristow-Johnson, *Audio EQ Cookbook* — the biquad coefficient formulas. `research/audio_eq_biquads.md` identifies Web Audio's `BiquadFilterNode` as implementing them, which is what `rack/R5-fx/dsp/fx.js` builds its EQ, filter and phaser stages from. Reached through a secondary source rather than the original; the primary belongs here once it is read. — Free, widely mirrored.

Two more the code leans on without a citation: the FFT in `rack/R2-core/core/dsp.js` is radix-2 Cooley–Tukey, and the mastering targets in `rack/R5-fx/dsp/master.js` (−1 dBFS ceiling, 9 dB crest floor) come from `research/audio_checklist.md`, which states them as this studio's own targets rather than deriving them from a loudness standard. ITU-R BS.1770 would be the reference if a LUFS gate is ever added.

## Technique digests

The sources behind `research/` are cited inside each digest, not duplicated here. This section lists only sources that shape studio-wide conventions rather than one genre's digest.

## Access status

One of: **Free** (with link), **Paywalled** (with link, noting an archive copy if one exists), **Print only**, **Offline archive**. Links are resolved at the time of writing. Some publishers refuse plain HTTP clients while serving a real browser normally, which is a fetch problem rather than a dead source.
