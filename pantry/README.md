# The pantry

Sound to build with, so a new instrument starts with something to play rather than something to source.

Frame drum, rattle, cabasa, guiro and rain stick, recorded as individual strokes at several force levels. Pitched sustain loops spaced across two octaves with their loop points written into the file, so a drone can sit far below anything anyone actually played. A 3D printer, an industrial texture, a drum loop. Ragtime and traditional melodies as MIDI, chosen because they take well to being pulled apart and put back together.

All of it free to use and all of it accounted for. `PROVENANCE.md` is the ledger: what each file is, where it came from, the licence it arrived under, and the date somebody read that licence at its source. `CANDIDATES.md` is the other half — material worth having that has not been taken yet, and the reason why.

## Reading it

`voices/samples.js` in the rack turns the manifest into two pools: one keyed by pitch, one keyed by stroke and force layer.

```js
import { parseManifest, SampleSet } from "./voices/samples.js";
const man = parseManifest(JSON.parse(readFileSync("pantry/acoustic/manifest.json", "utf8")));
const set = new SampleSet(man.loops.files, 0);
set.voiceFor(midiOf("A4"));   // -> ["G#4_loop.wav", 100]  nearest recording, cents to shift
```

The recordings are whole-tone spaced from C4 up to F#5, then G5, A#5, C6 — one semitone step and one minor third where the pattern would have put G#5. Any equal-tempered note inside the range is still at most a semitone from a real recording, because the minor third's two interior notes each sit a semitone from one of its ends. Anything outside the range is a whole number of octaves further.

## Sample rates vary

Not every file was recorded at the same rate, and a buffer handed to an `AudioContext` at the wrong one plays at the wrong pitch and the wrong length. `core/audio.js` converts on the way in — `decodeAudio` to `resample` to `toAudioBuffer` — which is where that gets caught.

## Tools

`tools/` holds the offline scripts that authored and indexed this material: loop-point finders, one-shot trimmers, quality checks, manifest generation, and importers for wavetables and patches. They run by hand and are not part of any instrument's runtime.
