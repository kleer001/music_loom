# World and historical musical forms

Twenty-three traditions read along three axes: **tuning** (how pitch is specified), **instrumentation** (what makes the sound), and **performance structure** (how a piece unfolds and who plays what when). The aim is a map of what a procedural instrument can and cannot express, not a buildable spec for any one tradition.

Every file uses the same three numbered sections, so a citation is stable: `world_forms/gamelan.md §2`.

## Method and limits

The traditions were chosen because they break different assumptions. Gamelan breaks the pitch table, raga breaks the note, the maqam family breaks the semitone, aksak breaks the beat, West African timelines break the grid, medieval polyphony breaks the idea that one cycle governs a piece, Tuvan singing breaks the idea that melody lives in the source, and steel pan breaks the assumption that a partial structure is given rather than chosen.

Sources are accessible online only — encyclopaedias, university course materials, open-access papers, tuning-project documentation. Where a claim rests on a single secondary source, the file says so. Three are genuinely primary and freely readable: Toussaint on African ternary timelines, the eLife paper on Tuvan overtone focusing, and the Ableton Tuning project's measured interval tables.

Two limits stated plainly. This is a survey by someone reading about these traditions rather than playing them, and every one is a living practice whose participants would draw the lines differently. And "accessible sources only" bites hardest exactly where the measurements are: gamelan tuning studies, Georgian interval data, Ethiopian pitch measurements and Arom's Banda-Linda transcriptions are in journals and print, and what is freely readable is often a summary.

## The traditions

| File | Breaks | Carries |
|---|---|---|
| [`gamelan.md`](gamelan.md) | the pitch table | irama density levels, ombak paired beating, colotomic form, inharmonic bronze |
| [`raga.md`](raga.md) | the note | asymmetric ascent/descent, note weighting, pakad phrases, gamaka, jivari drone |
| [`carnatic_tala.md`](carnatic_tala.md) | the bar | 35 talas from angas and jatis, ×5 gatis = 175, additive avartana |
| [`maqam_arabic.md`](maqam_arabic.md) | the semitone | ajnas as melodic atoms, sayr as route, 24-TET as notation not sound |
| [`turkish_makam.md`](turkish_makam.md) | the semitone, differently | 53 Holdrian commas, kanun mandal levers, seyir |
| [`persian_dastgah.md`](persian_dastgah.md) | the idea of a scale | 250+ gusheh in 12 dastgah, shahed/ist/forud, neutral seconds at 135 **and** 165 cents |
| [`ethiopian_qenet.md`](ethiopian_qenet.md) | scale as a lookup | four modal frameworks, kiñit as both scale and instrument tuning |
| [`balkan_aksak.md`](balkan_aksak.md) | the even beat | long:short at 3:2, non-isochronous meter, 7/9/11/13/15/22/25 |
| [`flamenco_compas.md`](flamenco_compas.md) | the even accent | 12 pulses accented 3-6-8-10-12, amalgama 6/8+3/4, palmas in sixes |
| [`korean_sanjo.md`](korean_sanjo.md) | fixed cycle length | jangdan 24→12→4 beats, cycle length **is** the form's single parameter |
| [`west_african_timelines.md`](west_african_timelines.md) | the metric grid | Bembé as `[x.x.xx.x.x.x]`, rhythmic oddity, off-beatness, swap distance |
| [`central_african_hocket.md`](central_african_hocket.md) | the melodic voice | 5–18 players, one pitch each, melody as emergent |
| [`andean_siku.md`](andean_siku.md) | the soloist | ira/arca interlock, 10–30 cent detune for 2–5 Hz beating |
| [`inuit_katajjaq.md`](inuit_katajjaq.md) | the part you hear | identical motifs at a half-beat offset, streams nobody sings |
| [`medieval_polyphony.md`](medieval_polyphony.md) | one cycle per piece | talea and color at coprime lengths, cantus firmus, rhythmic modes |
| [`mensuration_canon.md`](mensuration_canon.md) | one line, one speed | same notation read at 3:2, four voices notated as two |
| [`georgian_polyphony.md`](georgian_polyphony.md) | the consonance hierarchy | seconds and fourths as points of rest, non-tempered, three voices |
| [`sardinian_cantu_a_tenore.md`](sardinian_cantu_a_tenore.md) | one voice per part | quintina as emergent fifth voice, false-fold sub-octave |
| [`irish_sean_nos.md`](irish_sean_nos.md) | expression spread thin | ornament as the sole expressive channel, placed by poetic stress |
| [`gagaku.md`](gagaku.md) | root-and-quality harmony | eleven fixed aitake clusters, continuous sustain, very slow motion |
| [`shakuhachi_honkyoku.md`](shakuhachi_honkyoku.md) | the grid, and the rest | breath as phrase length, ma as valued duration, meri/kari |
| [`tuvan_overtone_singing.md`](tuvan_overtone_singing.md) | melody in the source | linear source/filter biphonation, merged formants at 1–2 kHz |
| [`steel_pan.md`](steel_pan.md) | partials as given | partials tuned individually by hammer, skirt resonance fighting the octave |

## Seven convergences

The strongest thing here is not any single tradition. It is that unconnected traditions arrive at the same device, which suggests properties of the problem rather than of a culture.

**Hocket is everywhere.** Imbal in Java, kotekan in Bali, ira/arca in the Andes, hocket at Notre Dame, katajjaq in the Arctic, and Banda-Linda horn ensembles where each of 5–18 players holds exactly one pitch. Six traditions, no shared lineage, one idea: a line that no single player performs. Banda-Linda is the limit — melody as an emergent property of an assignment.

**Density is an axis separate from tempo — and the split can go the other way.** Javanese irama holds cycle length fixed and varies density (1:1 to 16:1) against an independently-set tempo. Carnatic gati subdivides each beat into 3/4/5/7/9, multiplying 35 talas to 175. Korean sanjo inverts it: cycle length shortens monotonically from 24 beats to 4 across a performance and tempo follows it, so one parameter drives a forty-minute arc. Three traditions, three ways of choosing which of {cycle length, density, tempo} are dependent.

**A specified beat rate is a timbral goal.** Gamelan ombak pairs every instrument a few Hz off its twin — ~7 Hz gong kebyar, ~5 Hz gender wayang, 8–9 Hz angklung. Andean sikus detune the two halves 10–30 cents for 2–5 Hz. Both name the *rate*. A unison-detune control in cents with random spread is a different instrument.

**Repertoire as an enumerable space with a selection criterion.** Toussaint shows the ten West African seven-stroke timelines lie within a few swaps of two canonical patterns, and that Bembé has maximum rhythmic oddity. The suladi sapta scheme derives 175 cycles from three nested choices. Neither tradition stores a list; both store a way to generate and choose. That is what `PROGRESSIONS` and `DRUM_PATTERNS`, stored as literals, are not.

**One specification, several readings.** Talea and color run at coprime lengths so one voice never repeats. A mensuration canon reads one notated line at 3:2 and sounds four voices from two written parts. Katajjaq offsets identical motifs by half a beat. In each, the composing is done by phase or rate applied to shared material, not by writing more material.

**Emergence is often the goal, not a by-product.** The Sardinian quintina is a fifth voice nobody sings, and the ensemble's technique exists to produce it. Katajjaq's low and high streams belong to neither singer. Banda-Linda's melody has no performer. These traditions organise parts so that something appears which is in none of them.

**The scale is a property of an instrument.** A gamelan's embat is the tuning of that physical set, and two sets built alike differ by ~79 cents. Ethiopian kiñit names both the mode and the retuning of the krar's strings. *Dastgāh* means "the position of the hand". Where instruments are retuned per mode, "what scale is this" and "how is this instrument tuned" are one question — which is not what a shared `MODES` table models.

**A note on grids.** Three neighbouring traditions formalised overlapping practice onto incompatible grids, all in the modern era: Arabic theory on 24 equal quarter tones, Turkish on 53 Holdrian commas, Persian on Vaziri's 24. Farhat's measured Persian intervals give **two** neutral seconds, 135 and 165 cents, where the quarter-tone grid offers one at 150. The grid is a description imposed afterward, and in at least one case it is demonstrably coarser than the practice.

## What this maps onto

Read against the studio's apparatus. Each row is what a daughter would build for itself; nothing here proposes a change to `core/`.

| Idea | Where it stands |
|---|---|
| **Density levels separate from tempo** (irama, gati) | `core/scheduler.js` has tempo and a swing fraction. A density multiplier over a fixed skeleton is not expressible and is small to write. |
| **Cycle length as the form parameter** (sanjo) | Nothing sweeps cycle length. A single monotonic control driving a long arc is cheap and covers a structural need most generators fill with hand-written sections. |
| **One sequence, N rates** (mensuration canon) | Nothing implements this. One stored sequence, several playback rates at rational ratios, sounding together. Counterpoint as a consequence of the ratios. |
| **Talea / color** — coprime rhythm and pitch cycles | Nothing implements this either. Two cursors of different length over one voice. |
| **Canon at a sub-beat offset** (katajjaq) | Trivial to schedule; the interesting part is that the result is two perceptual streams rather than two copies, which is a reason to reach for it deliberately. |
| **Pattern enumeration with a scoring function** | Rhythmic oddity and off-beatness are computable over a binary onset vector. `PROGRESSIONS` and `DRUM_PATTERNS` are literals — nothing generates or scores. |
| **Non-isochronous meter** (aksak) | Not expressible. `scheduler.js` is a sixteenth grid with a swing offset; aksak needs beats of two durations at 3:2 with subdivisions inheriting the inequality. |
| **Asymmetric accents on an even cycle** (flamenco) | Expressible today — an accent set over twelve pulses. Worth separating from aksak, which is a different mechanism. |
| **Beat-rate detuning** (ombak, siku) | `voices/fire.js` has unison detune in cents with random spread. Pairing a voice with a twin a specified number of Hz away is a different parameterisation. |
| **Hocket, and one-pitch-per-voice** | `drone_flute_synth/engine/percussion.js` has `hocket`, written with no source; this is the source. The Banda-Linda limiting case is not implemented anywhere. |
| **Breath-length phrases, ma as duration** | `drone_flute_synth/engine/breath.js` implements it, also unsourced. [`shakuhachi_honkyoku.md`](shakuhachi_honkyoku.md) §3 is its citation. |
| **Source/filter biphonation** (khoomei) | Buildable in Web Audio today — rich source, two high-Q bandpasses converging at 1–2 kHz, melody by sweeping the merged centre across harmonics. The eLife paper establishes a linear model suffices, so no worklet. |
| **Per-partial tuning** (steel pan) | Additive synthesis with explicitly placed partials. `core/dsp.js` builds from harmonic wavetables and FM; placing partials individually — harmonic *or* inharmonic — covers both steel pan and gamelan bronze from one mechanism. |
| **Fixed cluster vocabulary** (aitake) | `core/music.js` builds chords from root and quality via `chordTones`. Eleven named shapes with transitions is a different structure, not a chord table with different contents. |
| **Seconds and fourths as stable** (Georgian) | `chordTones` and `PROGRESSIONS` encode a consonance hierarchy treating these as needing resolution. A generator built on it cannot produce this music. |
| **Ornament placed by text** (sean-nós) | Ornament density is usually a parameter. Placing ornaments by poetic stress — and on *unstressed* syllables — is a rule, and it needs a text model to have anything to consult. |
| **Amplitude-dependent spectrum** (jivari) | Not present. Waveshapers in `dsp/fx.js` are static transfer curves; drive is a parameter, not a function of the envelope. An envelope follower into shaper drive points the right way. |
| **Emergent combination tones** (quintina) | The inverse of the usual arrangement problem: tune and blend parts so a sum becomes audible. A question about spectral alignment between voices, not voice-leading. |
| **Continuous pitch as the norm** (meri/kari, gamaka) | `degreeToMidi` resolves a degree to a fixed pitch. Motion between notes has nowhere to live. |
| **Scale as instrument tuning** (embat, kiñit) | Scales are integer semitone arrays in `core/music.js` and `core/scales.js`, shared across an instrument. A per-set tuning that *is* the physical instrument has no representation. |

Cheapest relative to what they buy: **density levels**, **one-sequence-N-rates**, **talea/color**, and **khoomei biphonation**. None needs a tuning change; the first three generate long-form variation from short specifications, and the fourth is a handful of native nodes.

## Gaps

- **Georgian interval values.** Every accessible source asserts non-tempered tuning; none gives cents. The Tbilisi research centre's own publications are where this lives.
- **Ethiopian pitch measurements.** A kiñit-classification dataset paper exists and was not read; it is the likeliest accessible source of measured data.
- **The gamelan octave figure (~1210 cents)** rests on one encyclopaedia line. Stretching is well attested; the number needs measured data.
- **Maqam intervals conflict between sources** — 350 cents in 24-TET against 347/355/359 in just-intonation accounts, with regional variation. Left as a disagreement.
- **Bulerías accent sets conflict between sources** — 3-6-8-10-12 against 1-4-8-9. Also left open.
- **Arom's Banda-Linda analysis was not read.** The Cambridge chapter is paywalled and holds the transcriptions.
- **The Balkan timing study was not read in full**; the abstract is the basis for the line about departures from 3:2.
- **Ars subtilior mensuration signs** are contested in the literature and were not investigated.
- **Tuning is thin or absent** for Carnatic, aksak, flamenco, sean-nós, Korean, Banda-Linda, katajjaq, gagaku and Sardinian. **Instrumentation is thin** for maqam, Carnatic, aksak, Persian, medieval and mensuration canon. The three-axis frame makes the holes visible, which is most of its value.
- **Balinese and Javanese gamelan are treated together** where they differ; kotekan and gong kebyar are Balinese, irama and balungan as described are Javanese.
- **The flamenco / West African resemblance** is noted structurally in [`flamenco_compas.md`](flamenco_compas.md) §3 and deliberately not explained. The historical question is real, contested, and outside what was read.
- **Still unsurveyed:** Ghanaian gyil and xylophone tuning, Vietnamese ca trù, Thai and Cambodian 7-equal tuning, Mongolian long-song, Sámi joik, Bulgarian diaphonic *shoppe* singing, Hawaiian chant, Aboriginal Australian songlines, Byzantine chant and its own comma system.
