# Index of the research shelf

What is here, and what each one is for. `README.md` is the way in; this is the map.

**Genre and technique**

- `dub_techno_technique.md` — echo parameters and modulation rates, the riddim substrate, the dry-frame rule, the low-dominant mix, section timing. Digested from a musicology thesis.
- `shpongle_technique.md` — Posford and Ott on reverb and mix craft, with a measured correction to the reverb-low-boost question. The reverb and spring-impulse work draws on it.
- `raja_ram_flute.md` — breath, chiff and phrasing behind the two flute voices.
- `edm_theory.md`, `deadmau5_wisdom.md` — harmony, arrangement and production practice.
- `dubstep/` — genre structure, drums, bass sound design, FX and mixing, mastering and loudness, drop anatomy and deconstructions, and sample and stem sources. `04_synthesis_techniques.md` is not here because it was byte-identical to `synthesis_techniques.md`.
- `jazz/` — chord-scale theory, guide tones and voice leading, walking bass, comping figures, lead sheets, and a subgenre survey. The public-domain MIDI these were assembled around is in `pantry/midi/`, with its own catalogue.
- `glitchfield/` — Autechre and Plaid voicing notes, Machinedrum p-lock decoding, a bell-voice spec, generative lanes, synth transcription.

**World and historical forms**

- `world_forms/` — world and historical traditions, each read along the same three numbered sections: tuning, instrumentation, performance structure. `world_forms/SURVEY.md` holds the method, the cross-tradition convergences, a map against the studio's apparatus, and the gaps.

**Synthesis and signal**

- `synthesis_techniques.md` — wavetable, FM, subtractive and granular, concretely.
- `lead_synth_presets.md` — lead patch parameters with their ranges.
- `audio_eq_biquads.md` — EQ in the context of a mix. Names Web Audio's biquads as RBJ-cookbook, which is the provenance behind `fx.js`'s filters.
- `audio_checklist.md` — the mixing and mastering targets `dsp/master.js` and `dsp/masterbus.js` enforce: the −1 dBFS ceiling, the 9 dB crest floor, the 0.6 tanh drive.

**Tooling and sources**

- `web_audio_toolchain.md` — JavaScript, TypeScript and Web Audio code outside this repo, read against what the rack already holds. Licences and versions checked at the registry rather than recalled, and a verdict on each: write from spec, vendor a file, read-only reference, or not this stack. It records the three capabilities the rack turned out not to have — loudness, tuning beyond 12-TET, and non-isochronous rhythm.
- `dsp_source_texts.md` — the primary papers and books behind those capabilities, with what each one settles and whether it can be read for free. `pantry/CANDIDATES.md` is the equivalent list for sound material.

**Form and structure**

- `song_construction_basics.md` — tension and release, unity and variety, expectation and surprise.
- `game_music_structure.md` — vertical layering and horizontal re-sequencing, with the field vocabulary.
- `game_music_reference_corpus.md`, `learning_resources.md` — worked examples and where the craft is documented.

**Two that began as one instrument's design spec**

`cyberpunk_audio_spec.md` and `cyberpunk_audio_songs.md` began as another project's internal design and have been rewritten to stand on their own. They describe an engine that was never built, so read them as a design worked out on paper: the 808/909/303 lineage, the worklet rationale, the stock idiom progressions, and a genre-preset architecture argued through in detail.

## Where the gaps are

`world_forms/SURVEY.md` covers what non-12-TET pitch and non-metric form would need, and lists what it could not reach. Beyond that, nothing here covers groove and microtiming in the traditions the studio actually builds in, or psychoacoustic band definitions. `core/scheduler.js` has one linear swing parameter and `core/metrics.js` splits bands at 200 Hz and 2 kHz; neither value has a stated reason, because there is nothing yet that would give it one.

One thing the survey settled: hocketing — a melody split between players so no one person sounds it — turns up under its own name in four of the traditions here. It is imbal in Javanese gamelan, kotekan in Balinese, ira and arca in the Andes, and hocket in medieval polyphony. `shakuhachi_honkyoku.md` describes a second device of the same kind, where a phrase is as long as one breath.
