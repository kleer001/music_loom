# World and historical musical forms

Fifteen traditions read along three axes: **tuning** (how pitch is specified), **instrumentation** (what makes the sound), and **performance structure** (how a piece unfolds and who plays what when). The aim is a map of what a procedural instrument can and cannot express, not a buildable spec for any one tradition.

Every file uses the same three numbered sections, so a citation is stable: `world_forms/gamelan.md §2`.

## Method and limits

The traditions were chosen because they break different assumptions. Gamelan breaks the pitch table, raga breaks the note, maqam breaks the semitone, aksak breaks the beat, West African timelines break the grid, medieval polyphony breaks the idea that one cycle governs a piece, and Tuvan singing breaks the idea that melody lives in the source.

Sources are accessible online only — encyclopaedias, university course materials, open-access papers, tuning-project documentation. Where a claim rests on a single secondary source, the file says so. Two exceptions are genuinely primary and freely readable: Toussaint on African ternary timelines, and the eLife paper on Tuvan overtone focusing.

Two limits stated plainly. This is a survey by someone reading about these traditions rather than playing them, and every one is a living practice whose participants would draw the lines differently. And "accessible sources only" bites hardest exactly where the measurements are: gamelan tuning studies, Georgian interval data, and Arom's Banda-Linda transcriptions are in journals and print, and what is freely readable is often a summary of that work.

## The traditions

| File | Breaks | Carries |
|---|---|---|
| [`gamelan.md`](gamelan.md) | the pitch table | irama (density levels), ombak (paired beating), colotomic form, inharmonic bronze |
| [`raga.md`](raga.md) | the note | asymmetric ascent/descent, note weighting, pakad phrases, gamaka, jivari drone |
| [`maqam_arabic.md`](maqam_arabic.md) | the semitone | ajnas as melodic atoms, sayr as route, 24-TET as notation not sound |
| [`turkish_makam.md`](turkish_makam.md) | the semitone, differently | 53 Holdrian commas, kanun mandal levers, seyir |
| [`carnatic_tala.md`](carnatic_tala.md) | the bar | 35 talas from angas and jatis, ×5 gatis = 175, additive avartana |
| [`balkan_aksak.md`](balkan_aksak.md) | the even beat | long:short at 3:2, non-isochronous meter, 7/9/11/13/15/22/25 |
| [`west_african_timelines.md`](west_african_timelines.md) | the metric grid | Bembé as `[x.x.xx.x.x.x]`, rhythmic oddity, off-beatness, swap distance |
| [`central_african_hocket.md`](central_african_hocket.md) | the idea of a melodic voice | 5–18 players, one pitch each, melody as emergent |
| [`andean_siku.md`](andean_siku.md) | the idea of a soloist | ira/arca interlock, 10–30 cent detune for 2–5 Hz beating |
| [`medieval_polyphony.md`](medieval_polyphony.md) | one cycle per piece | talea and color at coprime lengths, cantus firmus, rhythmic modes |
| [`georgian_polyphony.md`](georgian_polyphony.md) | the consonance hierarchy | seconds and fourths as points of rest, non-tempered, three voices |
| [`gagaku.md`](gagaku.md) | root-and-quality harmony | eleven fixed aitake clusters, continuous sustain, very slow motion |
| [`shakuhachi_honkyoku.md`](shakuhachi_honkyoku.md) | the grid, and the rest | breath as phrase length, ma as valued duration, meri/kari |
| [`tuvan_overtone_singing.md`](tuvan_overtone_singing.md) | melody living in the source | linear source/filter biphonation, merged formants at 1–2 kHz |
| [`sardinian_cantu_a_tenore.md`](sardinian_cantu_a_tenore.md) | one voice per part | quintina as emergent fifth voice, false-fold sub-octave |

## Four convergences

The strongest thing in the survey is not any single tradition. It is that unconnected traditions arrive at the same structural device, which suggests these are properties of the problem rather than of a culture.

**Hocket is everywhere.** Imbal in Java, kotekan in Bali, ira/arca in the Andes, hocket at Notre Dame, and the Banda-Linda horn ensembles where each player holds exactly one pitch. Five traditions, no shared lineage, one idea: a line that no single player performs. The Banda-Linda case is the limit — melody as an emergent property of an assignment rather than a thing anyone plays.

**Density is an axis separate from tempo.** Javanese irama has five levels (1:1 to 16:1 elaborating notes per skeletal beat) with tempo as an independent control called laya. Carnatic gati subdivides each beat into 3, 4, 5, 7 or 9 and multiplies the 35 talas to 175. Two traditions, two formalisations, same insight — and it is the one most cleanly missing from a conventional sequencer, where tempo is the only knob and density is whatever you happened to write.

**A specified beat rate is a timbral goal.** Gamelan ombak pairs every instrument a few Hz off its twin: ~7 Hz for gong kebyar, ~5 Hz for gender wayang, 8–9 Hz for angklung. Andean sikus detune the two halves by 10–30 cents for 2–5 Hz. Both name the *beat rate* as the parameter. A unison-detune control in cents with random spread is a different instrument.

**Repertoire as an enumerable space with a selection criterion.** Toussaint shows the ten West African seven-stroke timelines are within a few swap operations of two canonical patterns, and that Bembé is the one with maximum rhythmic oddity. Carnatic tala derives 175 cycles from three small choices. Neither tradition stores a list of patterns; both store a way of generating and choosing them. That is what a generative instrument wants and what `PROGRESSIONS` and `DRUM_PATTERNS` — stored as literals — are not.

## What this maps onto

Read against the studio's apparatus. Each row is what a daughter would build for itself; nothing here proposes a change to `core/`.

| Idea | Where it stands |
|---|---|
| **Density levels separate from tempo** (irama, gati) | `core/scheduler.js` has tempo and a swing fraction. A density multiplier over a fixed skeleton is not expressible in it and is small to write. |
| **Talea / color** — coprime rhythm and pitch cycles | Nothing implements this. Two cursors of different length over one voice. The nearest existing idea is the per-layer RNG streams in `core/rng.js`, which are about isolation rather than phase. |
| **Pattern enumeration with a scoring function** | Rhythmic oddity and off-beatness are computable over a binary onset vector; the suladi sapta scheme is three nested choices. `PROGRESSIONS` and `DRUM_PATTERNS` are literals — nothing generates or scores. |
| **Beat-rate detuning** (ombak, siku) | `voices/fire.js` has unison detune in cents with random spread. Pairing a voice with a twin a specified number of Hz away is a different parameterisation. |
| **Hocket / one-pitch-per-voice** | Already here: `drone_flute_synth/engine/percussion.js` has a `hocket` function written with no source. This is the source. The Banda-Linda limiting case — N voices, one fixed pitch each — is not implemented anywhere. |
| **Non-isochronous meter** (aksak) | Not expressible. `scheduler.js` is a sixteenth grid with a swing offset; aksak needs beats of two different durations at 3:2, with subdivisions inheriting the inequality. |
| **Breath-length phrases, ma as duration** | Already here, unsourced: `drone_flute_synth/engine/breath.js` hands out one breath at a time with inhale as a first-class duration. `shakuhachi_honkyoku.md` §3 is its citation. |
| **Source/filter biphonation** (khoomei) | Directly buildable in Web Audio today — rich source, two high-Q bandpasses converging at 1–2 kHz, melody by sweeping the merged centre across harmonics. The eLife paper establishes a linear model suffices, so no worklet is needed. |
| **Fixed cluster vocabulary** (aitake) | `core/music.js` builds chords from root and quality via `chordTones`. Eleven named shapes with transitions between them is a different structure, not a chord table with different contents. |
| **Seconds and fourths as stable** (Georgian) | `chordTones` and `PROGRESSIONS` encode a consonance hierarchy that treats these as needing resolution. A generator built on it cannot produce this music. |
| **Amplitude-dependent spectrum** (jivari) | Not present. Waveshapers in `dsp/fx.js` are static transfer curves; drive is a parameter, not a function of the envelope. An envelope follower into shaper drive points the right way. |
| **Inharmonic partials** | `core/dsp.js` builds from harmonic wavetables and FM. Nothing generates a struck-bronze partial set. `springImpulse` is the nearest and it is a reverb tail. |
| **Emergent combination tones** (quintina) | The inverse of the usual arrangement problem: tune and blend parts so a sum becomes audible. A question about spectral alignment between voices, not voice-leading. |
| **Continuous pitch as the norm** (meri/kari, gamaka) | `degreeToMidi` resolves a degree to a fixed pitch. Motion between notes has nowhere to live. |
| **Non-12-TET pitch** | `centsToRatio` exists, used for vocal detune. Scales are integer semitone arrays in `core/music.js` and `core/scales.js`. A gamelan set — tuning a property of the physical instruments, ~79 cents apart between two sets built alike — has no representation. |

Cheapest relative to what they buy: **density levels**, **talea/color**, and **khoomei biphonation**. None needs a tuning change; the first two generate long-form variation from short specifications, and the third is a handful of native nodes.

## Gaps

- **Georgian interval values.** Every accessible source asserts non-tempered tuning; none gives cents. The Tbilisi research centre's own publications are where this lives.
- **The gamelan octave figure (~1210 cents)** rests on one encyclopaedia line. Stretching is well attested; the number needs measured data.
- **Maqam intervals conflict between sources** — 350 cents in 24-TET against 347/355/359 in just-intonation accounts, with regional variation. Left as a disagreement rather than resolved.
- **Arom's Banda-Linda analysis was not read.** The Cambridge chapter is paywalled, and it holds the transcriptions.
- **The Balkan timing study was not read in full** — the abstract is the basis for the line about performed departures from 3:2.
- **Instrumentation is thin** for maqam, Carnatic, aksak and medieval; **tuning is thin** for Carnatic, aksak, Banda-Linda, gagaku and Sardinian. The three-axis frame makes the holes visible, which is most of its value.
- **Balinese and Javanese gamelan are treated together** where they differ; kotekan and gong kebyar are Balinese, irama and balungan as described are Javanese.
- **Still unsurveyed**, each breaking something else: Persian dastgah and the radif, Korean sanjo and jangdan, flamenco compás, Irish sean-nós ornamentation, Inuit katajjaq, steel pan, Ethiopian qñit, Ockeghem-era mensuration canons, ars subtilior proportional notation.
