# Audio analysis — render & measure, don't guess

The procedural audio (`web/audio.js`) is tuned by ear in the editor (`npm run
audio`), but ears alone stall on questions like *"is there a low rumble?"*,
*"why does that filter sound stepped?"*, *"is this clipping?"*. The fix is to
**render the sound to a WAV and measure its spectrum** — turning "I think I hear
X" into a number you can act on and then verify the fix against.

It isn't an MCP server, but it's the same spirit: a repeatable tool you reach for
to answer a question with evidence instead of a hunch.

## When to reach for it

- A suspected artifact you can't localize by ear — rumble, hum, buzz,
  "rasterization"/zipper, aliasing, harshness.
- Confirming a fix actually changed the spectrum (before/after band energies),
  not just that it *feels* better.
- Checking DC offset, clipping, or overall level.

## 1 · Render a WAV

Two ways; pick by how faithful you need to be. Either produces a mono 16-bit WAV.

### A. Throwaway re-implementation (fast — never commit)

Write a short Node script in `/tmp` that mirrors the **relevant synth path** —
copy the exact constants and filter math from `web/audio.js` (the Kellet pink
generator, the gust one-pole, the biquads), render N seconds, write the WAV,
analyze, delete. Dependency-free and quick.

It is a *measurement, not a fixture*: write it fresh each time against the
current code, keep it in `/tmp`, and **never commit it** — a committed second
copy of the synthesis silently drifts from the engine and becomes a lie.

Filter math: Web Audio's `BiquadFilterNode` uses the standard Audio-EQ-Cookbook
(RBJ) biquads, so a direct-form JS port of lowpass/highpass/bandpass matches the
engine's filters bit-closely enough for spectral work.

### B. Drive the real engine (faithful)

Render the actual `GameAudio` graph through an `OfflineAudioContext`, so there's
no reimplementation to drift:

- `const a = new GameAudio()`, then inject the offline context as `a.ctx`, set up
  the minimal prerequisites the layer needs (`a.config`, `a.pinkBuf`/`a.gustBuf`,
  `a.outBus → destination`), call the real private builders (e.g. `a._buildWind()`
  / `a._windMod(a.config)`), `await a.ctx.startRendering()`, and encode the
  returned buffer to a WAV.
- This is browser code, so run it in Chrome. **Caveat:** headless
  `--virtual-time-budget` (and `--screenshot`) can hang `OfflineAudioContext`
  rendering and `audio.js`'s top-level `await fetch`. Use a real-time keep-alive
  page that POSTs the encoded WAV to a tiny local HTTP sink, rather than the
  one-shot screenshot path.
- A dev-only Node Web-Audio library is a fair alternative if one is ever added —
  "zero **runtime** deps" still holds; dev tooling is allowed (minimize, don't be
  religious).

Prefer (B) when the conclusion is about the engine's real output; (A) is the
fast first look.

## 2 · Measure (engine-agnostic — works on any WAV)

```bash
sox in.wav -n stat                              # Mean amplitude (DC offset), RMS, Max/Min (clipping)
sox in.wav -n spectrogram -z 90 -o spec.png     # visual; an agent can Read the PNG
```

The decisive one is a band-energy table from a Welch PSD — it shows *where the
energy actually sits*:

```python
import numpy as np, scipy.io.wavfile as wav, scipy.signal as sig
sr, x = wav.read('in.wav'); x = x.astype(float) / 32768
f, P = sig.welch(x, sr, nperseg=32768); tot = P.sum()
print('DC', round(x.mean(), 5), 'peak Hz', round(float(f[P.argmax()]), 1))
for lo, hi in [(0,20),(20,40),(40,80),(80,160),(160,320),(320,640),(640,1280),(1280,4000),(4000,24000)]:
    m = (f >= lo) & (f < hi); print(f'{lo:>5}-{hi:<5} Hz : {100*P[m].sum()/tot:5.1f}%')
```

Tools available: `sox`, `ffmpeg`/`ffprobe`, `python3` + `numpy` + `scipy`.
(Audacity works for a manual look — Import, then *Analyze ▸ Plot Spectrum* — but
the CLI path is scriptable and lets an agent Read the spectrogram itself.)

## Reading the numbers

- **Energy piled below ~40 Hz, spectral peak at a few Hz** → inaudible sub-bass
  rumble (felt, not heard; can rattle speakers). Usually unwanted. Filtered
  pink/brown noise is the classic source: it rises toward DC and a lowpass alone
  removes none of it — add a fixed **high-pass (~80–120 Hz)** before the body
  filter. Example shape: a noise bed peaking near a few Hz with most energy under
  40 Hz, fixed by a high-pass, then peaks back up in the audible ~150–300 Hz
  "rush" band.
- **Nonzero Mean amplitude** → DC offset; a high-pass removes it.
- **A stepped / "zippery" / rasterized quality** → almost always a *resonant
  (high-Q) biquad being frequency-modulated*. Web Audio recomputes biquad
  coefficients only once per 128-sample render block (~2.7 ms), so a swept sharp
  peak jumps in audible steps. Fix: don't FM a high-Q filter — hold its pitch
  fixed and modulate level instead, or drop the Q.
- **Energy above the intended band that isn't in the source** → aliasing (a
  buffer played back faster than 1×, or a `WaveShaper` without `oversample`).

## Determinism

The audio engine uses its own `Math.random` and sits **outside the game's
determinism contract**, so two renders differ sample-for-sample. The spectral
*shape* (band split, peak, slope) is stable — analyze the shape, not exact bin
values; Welch already averages, and you can lengthen the render to tighten it.
