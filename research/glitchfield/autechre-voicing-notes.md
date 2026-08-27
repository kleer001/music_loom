# Autechre — synth voicing research notes

Reference for GLITCHFIELD voicing work. Compiled from a five-agent web research pass
(album eras split across agents), then synthesized. **No code changes are implied by this
file** — it is background for deciding how faithful the instrument's voicing is.

Confidence tags: **HIGH** = band-stated or strong technical source · **MED** = credible
secondary / community reconstruction · **LOW** = fan speculation. Autechre are famously
secretive about patch specifics, so exact parameters are rarely HIGH.

Primary sources that recur below: Sound on Sound "Techno-logical" (Nov 1997), Fact Magazine
"7 pieces of gear…" (2017), the WATMM "Ask Autechre Anything" threads (2013), Sean Booth
interview (Mar 2005), and the Elektron/Nord Sysex + patch files Autechre released (2018).

---

## Why this matters / the headline correction

An earlier quick pass gave generic-IDM advice ("add triads, lift the register") that fits
Plaid or Aphex pads better than Autechre. The deeper pass shows Autechre voice harmony
**very differently**:

- Harmony is **generative and scale-constrained**, not chords played by hand.
- They favor **counterpoint (independent voices following a chord outline)** over block triads.
- They **deliberately leave 12-TET** (detuning, inharmonic tuning).
- **FM** is the melodic/bell core from ~1997 on.
- A signature trick is **"reverb-as-harmony."**

So for Autechre specifically, "more triads" is the wrong move; detuning, FM bells,
counterpoint, and reverb-ghosting are the right ones.

---

## Gear & method timeline

| Era | Albums | Core gear | Method | Conf. |
|---|---|---|---|---|
| Early | Incunabula '93, Amber '94, Tri Repetae '95 | Roland Juno-106, MC-202, Korg MS-10, circuit-bent Casio SK-1, Ensoniq EPS-16+ w/ Waveboy (granular/bitcrush/formant), TR-606→R-8 | Subtractive + sampling; 4-track tape, one-shot-to-DAT. Warm. | HIGH (gear/workflow) |
| Mid | Chiastic Slide '97, LP5 '98 | Nord Lead, Yamaha DX100 (FM), RY30, circuit-bent Boss RSD-10, Alesis Quadraverb | Atari→Mac Logic transition; early Max/MSP for FM drums; LP5 → Logic-Environment arpeggiators. Metallic → electroacoustic. | HIGH |
| Glitch/generative | Confield '01, Draft 7.30 '03, Untilted '05 | Nord Modular G2 arrives; Elektron; Max/MSP | Confield = first Max, but only ~10% "properly generative," 3 tracks Max-sequenced (MED). Draft/Untilted = deliberate return to hardware sequencing, NOT generative (HIGH). | Mixed |
| Late | Quaristice '08, Oversteps '10, Exai '13 | Elektron Machinedrum/Monomachine, Nord G2, Yamaha FS1R, MPC1000; NI FM8, u-he Zebra | Quaristice = live hardware jams chopped/edited (HIGH). Oversteps = melody/harmony/counterpoint pivot (HIGH). Exai = "The System," almost all in Max, dropped MIDI for a custom protocol. | HIGH |
| Recent | elseq '16, NTS Sessions '18, SIGN '20, PLUS '20 | All Max/MSP + gen~ codebox custom oscillators/DSP | Fully generative "System"; FM-forward (elseq). SIGN = granular + return to tonality / held open chords; PLUS = same system, harsher/dissonant. | HIGH |

---

## Per-album synth/voicing notes

### Incunabula (1993)
- Gear: Casio SK-1 (opened up, two chip points cross-connected for ring-mod/flange/delay —
  "one of their oldest tricks"), Juno-106 (chorus = pad width), MC-202, TR-606, Ensoniq
  EPS-16+ (late, "Eggshell" only). Tascam 244 4-track, Atari ST. [HIGH — SoS 1997]
- Voicing: sparse, mostly **monophonic melodic layers at different registers**, not chordal
  blocks. Juno chorus for width. [MED]
- "Basscadet" samples Jean-Michel Jarre. [HIGH — WhoSampled]

### Amber (1994)
- Gear adds Korg MS-10, EPS-16+ with **Waveboy** disks (granular, Soniq Demolition
  bitcrusher, resonant/formant filters, Voder). Custom EPS OS by "a nerd in America" enabling
  elaborate multi-LFO patches. [HIGH]
- **Reverb-as-harmony** (Booth, HIGH): two melodies with slightly different notes; the muted
  one sent only to reverb, mixed low — "you almost can't tell." Fake polyphony from a mono line.
- "Glitch" (the track): MC-202 through Quadraverb → "eerie, stretched-out synth." [HIGH — Fact]
- Related: Anti EP (1994, adds Yamaha DX100 FM), Garbage EP (1995, same sessions).

### Tri Repetae (1995)
- Gear: Roland R-8, Juno-106, MC-202, MS-10, EPS-16+, Quadraverb, Atari + C-Lab Creator.
  Korg Prophecy and Nord Lead arrive very late (mid-95 release), presence reported but not
  track-attributed. [HIGH core / MED Prophecy+Nord]
- Workflow: **one-shot takes straight to DAT** (no real multitrack), which shaped the
  continuous, dense texture aesthetic. [HIGH]
- Philosophy: *"We'll have a handful of sounds and they'll dictate what kind of rhythm we use.
  Rhythm is everything."* Sound-first. [HIGH]

### Chiastic Slide (1997)
- Gear: Nord Lead, Yamaha RY30, circuit-bent Boss RSD-10, DX100, Juno-106, MS-20/MC-202,
  Quadraverb. Mid-production Atari→Mac Logic shift (~90% still Atari-tracked). [HIGH — SoS 1997]
- Sound: turn toward "gnawing and metallic"; homebrew FM drums in Max; short damped delay giving
  drums an elastic "ring." [HIGH]

### LP5 (1998)
- Gear: Logic + Max/MSP (adopted 1997), Nord Lead 1 (gritty aliased 4-voice), DX100 (FM), custom
  EPS OS. [HIGH]
- Method: **algorithmic sequencing** via Logic Environment arpeggiators → Max probabilistic
  patterns; "building their own little machines." Non-repeating patterns, tempo drift. Warmth
  abandoned for electroacoustic abstraction (name-checks Parmegiani, Xenakis). [HIGH concept /
  MED specifics]

### Confield (2001)
- **First Max/MSP album, but the "generative" label is overstated:** only ~10% "properly
  generative," ~3 tracks used Max sequencing; the rest was Logic + complex hardware sequencer
  feedback. [MED — community/leaked-patch analysis]
- Booth: *"Even when the beats sound like they are moving around… they're not random. They're
  based on sets of rules."* Markov chains + conditionals forcing scales/harmonies. [HIGH quote]
- "Voicing" here is **emergent from the rule set**, not hand-arranged.

### Draft 7.30 (2003)
- **Deliberate move away from generative:** *"straight-up normal sequencers and samplers"* —
  drum machines, old MIDI/analog sequencers, MPCs. Linear (elements vanish/transform by track
  end) rather than layered. Woody/metallic percussion. [HIGH]

### Untilted (2005)
- **No generative music**; hands-on hardware, "playing beats then editing." [HIGH]
- Booth interested in **physical modeling** but prefers it non-real-time / with very limited
  parameter access. Nord Modular G2 confirmed. [HIGH statement]

### Quaristice (2008)
- **Live hardware jams** (hour-long) chopped into 3–4 min tracks, ~6 months editing in MOTU
  Digital Performer. [HIGH]
- Rig: Elektron Machinedrum + Monomachine (FM), Nord Modular G2/Rack, **Yamaha FS1R (formant +
  FM)**, Akai MPC1000, Quadraverb/Lexicon. (Sysex released 2018.) [HIGH]

### Oversteps (2010) — the key album for harmony/voicing
- **Deliberate pivot to melody, harmony, counterpoint.** *"making algorithms with a view to
  using them repeatedly… concentrating on melody, harmony, counterpoint."* [HIGH]
- FM dominates: FS1R, NI FM8 (a Booth favorite), u-he Zebra; Nord Modular G2. [HIGH gear]
- Harmony is **algorithmic**: Markov chains + conditional interdependencies letting independent
  melodic voices evolve within forced scales. [MED]
- "known(1)": minor progression + **Karplus-Strong plucked-string counterpoint tuned
  deliberately "wrong"** with inharmonic overtones, following the chord outline. [MED — analysis]
- Character: spacey/harpsichordal FM, bell-like overtones, "soft edges," human feel. [MED]
- Booth: *"It isn't so much about writing a tune, it's more about using the sound at different
  pitches to create a feel."* [HIGH]

### Exai (2013)
- "The System": nearly everything in Max; entire tracks as big Max patches. Dropped MIDI for a
  custom audio/control protocol. Granular + FM. Dense 2-hr double album. [HIGH]

### elseq 1–5 (2016)
- FM-forward; they build their own oscillators/DSP in Max (gen~ codebox), no hardware synths
  as sources. Long-form algorithmic rhythm/texture. [HIGH]

### NTS Sessions 1–4 (2018)
- 8 hrs of real-time "System" jams; **Markov-chain sequencers forcing scales/harmonies**,
  feedback between sequencers, steered live via MIDI faders. [HIGH concept / MED internals]

### SIGN (2020)
- Granular + modular; **return to tonality** (first prominent since Oversteps): held, open
  chords as anchors for granular processing. Reverb **tuned to the chords/melody**. System
  described as built to escape the even-tempered scale. [HIGH reviews / HIGH Booth reverb quote]

### PLUS (2020)
- Same Max "System," different patch/parameter choices: percussive, dissonant, more autonomous
  (algorithm "winning" over hand-steering). [MED inference]

---

## Cross-cutting voicing principles (the payoff)

1. **Generative, scale-constrained note choice** — Markov chains + conditionals forcing scales
   and harmonies (Booth, HIGH). Pitch is chosen by rule-bounded randomness, not stacked chords.
2. **Counterpoint > block chords** — independent voices tracking a chord outline (Oversteps).
3. **Leave 12-TET on purpose** — pad detuning ("Eutow" −26c/−15c), "wrong"-tuned Karplus
   counterpoint, a system built to escape even temperament. (Parallels Aphex's microtuning.)
4. **Reverb-as-harmony** — a muted, slightly-repitched copy of a mono line sent only to reverb;
   and reverb tuned to the current chord/melody (Booth, HIGH).
5. **FM is the melodic/bell core** — DX100 → FS1R → FM8: metallic, harpsichordal, inharmonic.
6. **Sound-first** — timbre dictates rhythm and structure.

---

## Implications for GLITCHFIELD (spec-only, not built)

- The COLD-band **triads** I added in the voicing revamp are the *least* Autechre element —
  block triads read Plaid/BoC, not Autechre. The **open dyads (fifths/octaves)** I chose for the
  cool band are more on-target.
- Cheap + authentic Autechre moves the engine can already support: a **reverb-ghost voice**
  (detuned, alternate-pitch copy into the existing reverb), **slight detuning/inharmonicity**,
  leaning on the **`fm` machine** for bell/harpsichord leads.
- Missing for real Autechre: **Karplus-Strong** physical-modeling pluck (the Oversteps
  counterpoint signature; the `west` FM+wavefold voice is close-ish, not it), **generative /
  scale-forced note selection** (GLITCHFIELD's p-locks are deterministic), and **non-12-TET
  scale tables**.

## Caveats

Gear lists and workflow are well-sourced; per-track synthesis specifics are largely forum
reconstruction (WATMM, KVR, Cycling '74); exact Max patch internals are deliberately private.
Treat MED/LOW items as directional, not gospel.
