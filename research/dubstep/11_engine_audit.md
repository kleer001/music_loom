# Engine Requirements — what dubstep demands of a synthesis engine

The gap list from [`00_index.md`](00_index.md), turned into a checklist an engine can be measured against. The first table is the baseline — a genre preset that boots without these is not playing dubstep. The second is what separates a competent classic-wobble engine from one that reaches modern brostep, riddim and tearout.

## Baseline

| Requirement | What it is for |
|---|---|
| 140 BPM half-time drum grid | Kick on 1, snare on 3. The space between them is what the bass fills |
| Layered kick (sub + click), snare, hats | The click carries through a small speaker; the sub carries the weight |
| Tempo-synced wobble LFO on the bass filter | The genre's signature. Rate as a note division, not Hz |
| Mono sub bass, sine, 20–70 Hz | Held separate from the mid bass so it can stay mono and clean |
| Reese bass — detuned saws | Phase movement between the saws is the sound, not the detune amount |
| FM / audio-rate cross-modulation | The growl source |
| Resonant ladder filter with a nonlinearity in the feedback path | Growl needs the filter to distort, not just cut |
| LP / HP / BP selectable on the bass chain | Wobble on a high-pass is a different animal from wobble on a low-pass |
| Kick-keyed sidechain, plus a ghost pump and a trance gate | Pump is rhythm here, not glue |
| Mod matrix — LFO, sample-and-hold, slewed S&H, kick envelope → any parameter | The thing that makes modulation compositional rather than decorative |
| Drive palette: tanh, hard clip, diode, wavefolder, bitcrush, ring mod | Grit is layered, so one distortion is never enough |
| Tempo-synced ping-pong delay with filtered feedback and tape saturation | Inherited straight from dub |
| Reverb with gated, reverse and freeze modes | Gated reverb on the snare is period-correct and still used |
| Mastering chain: EQ → multiband → glue → saturation → brickwall limiter | With enough pre-limiter headroom that the render is not hot |
| Arrangement state machine: intro / build / drop / peak / breakdown / outro | With a filter sweep tied to the state |
| Riser and uplift FX | The build is half the drop |
| Per-strip parametric EQ, mono-friendly high-pass on the bass | The bass HP sits around 55 Hz so the sub owns everything below |

## What actually separates the eras

Ranked by how much each one moves a render toward modern dubstep, against how much work it is.

1. **Patterned wobble.** Let the wobble take a per-step rhythm — a 16-step rate or on/off pattern — instead of one fixed division held for a whole section. This is the single biggest "sounds like dubstep" lever, and it is cheap wherever the LFO can already be retargeted live. *Low effort, high payoff.*
2. **Talking / formant bass.** A vowel-filter bank as an insert on the bass chain, its position swept by an LFO or sample-and-hold. This is the riddim "wob–wob–talk" character. Engines often already have formant filters built for a choir or vox voice; the work is exposing them on the bass chain rather than building them.
3. **OTT / upward compression.** Downward multiband compression alone does not produce the slammed mid-bass timbre — the upward half is what pulls the quiet detail up into the wall. *Medium effort.*
4. **A fuller transition kit.** A riser on its own is not enough: a downlifter, an impact, a sub-drop, a pitch-dive on the drop entry, and the deliberate silence gap immediately before it. An arrangement state machine already knows when to fire these.
5. **Wavetable oscillator with position morph.** The authentic growl source, and the only large build on this list. FM plus a nonlinear ladder is a serviceable stand-in, which is why this ranks last despite being the "real" answer.

## Out of scope for a generative engine

Resampling — bounce, re-pitch, re-process, repeat — is central to how the genre is made in a DAW and does not transfer to a real-time generative engine. The equivalent is layering voices through the mod matrix. Worth naming rather than leaving as an unexplained absence, because a reader coming from the production literature will look for it.

## Bottom line

Nothing structural is exotic. A role table, a mod matrix, an FX bus and an arrangement state machine already express dubstep. What separates eras is **expressiveness inside the bass** — patterned wobble, formant talk, wavetable morph — and a **complete transition kit**. The first two items are small and additive; the last is the only one that is a real build.
