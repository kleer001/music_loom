# The pantry

Sound material an instrument can draw on, held in the studio so a new one starts with something to play rather than something to source. Every file traces to a release that states its terms — `PROVENANCE.md` is the ledger, and it is the first real content for the gate `RIGHTS.md` describes.

Roughly 11 MB, all CC0 or public domain except one MIDI arrangement that asks for attribution.

## What is here

| Directory | Holds | Licence |
|---|---|---|
| `acoustic/loops/` | 13 pitched sustain loops, C4–C6, whole-tone spaced, loop points in the RIFF `smpl` chunk | CC0 (VCSL) |
| `acoustic/strokes/` | 52 percussion one-shots — frame drum, rattle, cabasa, guiro, rain stick — named `<pool>-<stroke>-l<level>-v<variant>` | CC0 (VCSL) |
| `acoustic/manifest.json` | Generated index of both, with per-stroke loudness and peak | CC0 |
| `machine/` | 5 machine loops: a 3D printer, an industrial texture, a drum loop, and two rendered here | CC0 (Sonic Pi + local) |
| `midi/` | 10 public-domain tunes as Standard MIDI, with `CATALOG.md` giving per-file status | PD / CC0, one CC-BY-SA |
| `tools/` | The offline scripts that index, author and import sample material | MIT |

## Reading it

`rack/R6-voices/voices/samples.js` reads `acoustic/manifest.json` and gives back two pools: `SampleSet` keyed by pitch, `StrokeSet` keyed by stroke and force layer. `readLoopPoints` pulls the loop markers straight out of the RIFF chunk.

```js
import { parseManifest, SampleSet } from "./voices/samples.js";
const man = parseManifest(JSON.parse(readFileSync("pantry/acoustic/manifest.json", "utf8")));
const set = new SampleSet(man.loops.files, 0);
set.voiceFor(midiOf("A4"));   // -> ["G#4_loop.wav", 100]  nearest recording, cents to shift
```

The recordings are whole-tone spaced, so anything inside C4–C6 is at most 100 cents from one of them, and anything outside is a whole number of octaves further. That is what lets a drone sit far below anything anyone played.

## Sample rates vary

`machine/synth_techno_loop.wav` is 22050 Hz mono. `acoustic/loops/` is 48000 Hz. `core/audio.js` (`decodeAudio` → `resample` → `toAudioBuffer`) converts on the way in; a buffer handed to an `AudioContext` at the wrong rate plays at the wrong pitch and length.

```js
const dec = decodeAudio(bytes);                              // 22050 Hz, 1 ch
const up  = resample(dec.channels, dec.sampleRate, ctx.sampleRate);
const buf = toAudioBuffer(ctx, { sampleRate: ctx.sampleRate, channels: up });
```

## Tools

Offline scripts, run by hand from the studio root. The Node ones import from `rack/R2-core/core/`, so they run here rather than inside a daughter.

| Tool | Does |
|---|---|
| `tools/scan_kicks.mjs` | Ranks kick one-shots in a mounted library by energy under 350 Hz and tail length. Writes a manifest; the audio stays where it is. |
| `tools/scan_samples.mjs` | Indexes noise material by the gates that hold up — long enough, loud enough, no strong envelope — and records the contested metrics as advisory. Its header explains why filename and flatness classifiers both failed on a hand-labelled set. |
| `tools/fetch_machine_samples.mjs` | Downloads the CC0 Sonic Pi loops and renders the two local ones. |
| `tools/fetch_soundfont.js` | Fetches per-note base64 MP3 from public soundfonts. Carries a 6-second host delay. |
| `tools/midi_to_motif.js` | Turns a Standard MIDI File into a scale-degree motif. Melody skeleton only — MIDI has no chords. |
| `tools/import_patches.mjs` | Vital preset → patch JSON, against the schema in `rack/R6-voices/voices/patches.js`. |
| `tools/import_wavetables.mjs` | Single-cycle WAV bank → harmonic-coefficient JSON. |
| `tools/py/` | The authoring chain behind `acoustic/`: `loopfind.py` finds loop points, `oneshot.py` cuts and levels strokes, `manifest.py` writes the index, `loop_qa.py` and `stroke_qa.py` check the results, `analyze_samples.py` measures a source set. |

The two scanners index a mounted sample library rather than vendoring it. dub_synth's `data/kicks.json` points at a commercial library on an external drive: the manifest travels with the repo and the audio does not, which keeps a scan reproducible without redistributing anything.

## Adding to it

A new asset needs a row in `PROVENANCE.md` before it is useful to anyone else — source, licence, the date the licence was traced to its original release rather than to an aggregator, and the jurisdiction if the claim is public domain. `RIGHTS.md` covers why those three come apart.
