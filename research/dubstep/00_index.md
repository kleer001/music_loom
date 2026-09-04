# Dubstep Production Research — Index

Research compiled to guide a from-scratch dubstep deconstruction. Each page is numbers-first and source-cited.

| # | Page | Scope |
|---|------|-------|
| 01 | [Genre & Structure](01_genre_structure.md) | 140 BPM half-time, subgenres, song map, keys, the drop |
| 02 | [Drums](02_drums.md) | Kick-1 / snare-3 half-time grid, layering, hat rolls, builds |
| 03 | [Bass Sound Design](03_bass_sound_design.md) | Sub/mid split, wobble (LFO→filter), growl (FM+formant), Reese |
| 04 | *(see [`../synthesis_techniques.md`](../synthesis_techniques.md))* | Wavetable/FM/granular, resampling, distortion, OTT, risers, pitch dives. Was byte-identical to that file, so it is held once |
| 05 | [FX & Mixing](05_fx_mixing.md) | Sidechain pump, mono bass, EQ carving, dub-delay, transitions, glue |
| 06 | [Mastering & Loudness](06_mastering_loudness.md) | LUFS targets, chain order, air band, **headroom/punch preservation** |
| 07 | [Classic & Brostep Breakdowns](07_song_breakdowns_classic_brostep.md) | Track-by-track technical breakdowns of the early and brostep canon |
| 08 | [Riddim & Modern Breakdowns](08_song_breakdowns_riddim_modern.md) | The same, for riddim and current dubstep |
| 09 | [Free MIDI & Stems](09_free_midi_stems.md) | Sourced MIDI, stems and construction kits, with licence status |
| 10 | [Free Samples & One-Shots](10_free_samples_oneshots.md) | Public-domain and freely-licensed sample sources |
| 11 | [Engine Requirements](11_engine_audit.md) | What the genre demands of a synthesis engine, as a checklist |
| 12 | [FL Studio Project Files](12_flp_project_files.md) | Legally available `.flp` projects to study |
| 13 | [FL Studio Techniques](13_fl_studio_techniques.md) | Signal chains and technique reference from the genre's house DAW |
| 14 | [Gross Beat](14_gross_beat.md) | The time-and-volume manipulation model, and how to port it |
| 15 | [Drop Anatomy](15_drop_anatomy.md) | Bar-by-bar structure of the drop |
| 16 | [Drop Arrangement](16_drop_arrangement.md) | Macro structure around the drop |
| 17 | [Drop Sound Design](17_drop_sound_design.md) | Energy, timbre and layering through the drop |
| 18 | [Drop Deconstructions](18_drop_deconstructions.md) | Bar-by-bar readings of famous drops |

## The genre in one paragraph

Dubstep lives at **140 BPM felt as 70 BPM half-time** — kick on beat 1, snare on beat 3, leaving wide space the bass fills. The identity is the **bass**: a clean mono **sub sine (20–70 Hz)** layered under a **mid/growl bass (70–200 Hz+)** whose *rhythm is modulation*, not notes — an LFO sweeping a filter cutoff (wobble, 1/4–1/16 sync), FM + resonant high-pass formants (growl/"talking"), or detuned saws with phase movement (Reese). Drops are built from **contrast**: silence and risers into weight. Everything below ~100 Hz stays mono; grit comes from distortion/waveshaping/OTT and serial **resampling**.

## What an engine has to provide

The recurring demands across these pages, and the things worth checking an engine against:

- **Tempo-synced LFO** with note divisions (1/2, 1/4, 1/8, 1/8T, 1/16) and shapes (sine, tri, saw, ramp-down, random) → the wobble. *(03, 04)*
- **FM / audio-rate cross-modulation** between oscillators → growl/talking bass. *(03, 04)*
- **Resonant filters**: LP and HP, 24-pole, high resonance, cutoff modulatable by LFO *and* envelope; band-pass/notch; **formant filter** for vowel character. *(03)*
- **Unison/detune** (semitone + cent), phase offset & randomization → Reese. *(03)*
- **Sub/mid bass split** with independent processing chains, mono below ~100 Hz. *(03, 05)*
- **Waveshaping/distortion** palette: soft clip, hard clip, foldback, bitcrush. *(04)*
- **Multiband / OTT** (upward+downward compression per band). *(04, 05, 06)*
- **Tempo-synced dub-delay** (ping-pong, filtered feedback) and reverb tails. *(05)*
- **Sidechain ducking** keyed off the kick. *(05)*
- **Risers/downlifters/impacts/sub-drop** and the **pre-drop silence gap**; pitch-dive automation. *(04, 05)*
- **Mastering**: master-bus chain (EQ → multiband → glue → saturation → limiter), air band, true-peak ceiling, and headroom preservation — must not render "too hot". *(06)*

See each page's "engine checklist" / summary table for parameter ranges.
