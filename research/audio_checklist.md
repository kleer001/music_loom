# Audio pre-flight checklist

**Run this before presenting ANY render. Never hand over audio you haven't measured.**
The user rejects "hot" (slammed/clipped) renders on sight — catching that is the engine's job,
not theirs. Distilled from the psytrance + house deconstructions (`data/*_labnotes.md`).

## 1. The hard gate — `node check_audio.mjs <wav>`
Must exit 0 (no `FAIL`). It measures:

| Check | Threshold | Why |
|---|---|---|
| **true-peak** | ≤ −1 dBFS | inter-sample clipping |
| **clipped samples** | 0 | hard clipping |
| **crest factor** (peak − RMS) | **≥ 9 dB** (FAIL < 7) | **the "too hot" detector** — slammed/over-saturated audio has low crest; a healthy mix is ~9–13 |
| **DC offset** | < 0.003 | a render bug / asymmetric drive |
| **width** (side/mid) | full mix ~−10…−20 dB | near-mono mix reads thin; >−2 is phasey. A solo mono stem (bass) reading near-mono is fine |

Run it on **every stem and every full take**. A WARN you understand (e.g. a mono bass stem) is ok;
a FAIL is not.

## 2. Don't out-slam the reference
Measure the reference track too (`check_audio.mjs data/refs/<ref>.wav`) and match its crest, don't
beat it. WYHA's real master is crest ~10.5 dB — our renders should sit near that, not below 7.

## 3. Mastering = glue, not a brickwall
`render_ph.mjs` `SAT` (tanh master) defaults to **0.6** (healthy crest). A `SAT 2.0` slams crest to
~5 dB — that was shipping hot on every take. Genuinely saturated genres may pass `SAT=` higher, but
then **re-check crest**. Keep master headroom (genre `master.volume` is a pre-limiter trim).

## 4. Offline-render caveats (absolute levels lie)
`node-web-audio-api` under-limits and the gated-reverb convolver runs away → absolute peaks read
hot. **Relative A/B deltas are faithful; absolute level needs a browser confirm** or the limiter
bypassed (`render_ph` already bypasses it). Don't trust an offline peak as final.

## 5. Level-match before A/B
Normalize compared takes to the same peak (−3 dBFS) so "louder" doesn't masquerade as "better."

## Spectral / sound-design sanity (learned the hard way)
- **Kick owns the sub; the bass sits above it.** HP the bass above the kick's sub band (~55 Hz) or
  it reads as "kick at full sustain." Measure the bass at an **exposed section** (where drums drop
  out) — whole-track demucs stems carry kick bleed in the bass stem.
- **One energy-weighted metric (centroid/rolloff) is blind to low-energy harmonic shifts.** A filter
  change can be inaudible to centroid yet very audible. Read the **band table** (sub/low/loMid/hiMid),
  not just one number.
- **Width lives in the synth/stab layer, not the bass.** Bass is mono/centered.

## Process discipline
- After **one** failed tuning attempt, **instrument/measure** — don't blind-iterate. (Cost us several
  muddy passes.)
- **Verify the param reaches the render** before concluding a knob is dead: check the *merged* config
  (`e.config…`) and that the value survives the merge chain. A failed `sed` against linter-reformatted
  code silently no-ops — confirm the change took.
