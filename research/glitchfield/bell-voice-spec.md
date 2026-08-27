# The `bell` machine — tuned percussion (glockenspiel ↔ tubular bell)

`bell` is a bass-machine character: a 2-operator FM voice with an inharmonic ratio and a decaying
modulation index, tuned to read as struck metal rather than a generic FM ping. One normalized
parameter, `belltone`, sweeps the whole character from **glockenspiel** (bright, short) to
**tubular bell** (hollow, long).

It is the "tuned percussion as a harmonic voice" color described in `docs/plaid-voicing-notes.md`.

---

## `belltone` (0..1)

One value drives ratio, strike brightness, partial mix, and ring length together:

| belltone | modulator ratio | strike index | 2nd partial | ring length | reads as |
|---|---|---|---|---|---|
| 0.0 | 3.5 | brighter (`freq*3.0`) | 5.4× | short | **glockenspiel / celesta** |
| 1.0 | 1.4 | purer (`freq*1.6`) | 2.76× | ~3.2× longer | **tubular / church bell** |

The per-voice value is summed at trigger time in `fireStep`:

```js
bell: clamp((c.bass.belltone||0) + (c._mBell||0) + (lk&&lk.bell||0), 0, 1)
```

static value + LFO accumulator + p-lock — the same shape as `cutoff` (`filter.cutoff` + `_mCut`)
and `timbre` (`bass` static + `_mTim`).

The p-lock term is inert: `lockSet` emits only `cut`, `dec`, `pit`, `tim`, `vow` for the `bass`
kind, so `lk.bell` is never populated. Locks reach the bell through `dec` and `cut` like any other
machine.

## DSP — the `bell` branch of `buildTone`

Sine carrier, sine modulator at an inharmonic ratio, modulation index ramped down so the strike is
bright and the tail settles toward a pure tone. A second inharmonic sine sits underneath for the
metallic shimmer; it switches ratio at the midpoint of the morph (5.4× below, 2.76× above), which is
what makes the glock end sparkle and the tubular end read as a struck tube. The technique is the
same one the `efm` drum uses.

## Envelope — the `bell` branch of `bassVoice`

Two deviations from the shared bass path, both necessary:

- **No pluck-gate lowpass.** The shared path ramps a lowpass down over the note, which chokes a ring.
  `bell` connects straight to the amp with `env(amp.gain, t, 0.002, dec, g, 0)` — instant strike,
  long tail. `west` takes the same escape.
- **belltone-scaled decay.** `dec *= (1 + opts.bell*2.2)` is applied *before* `buildTone`, so the
  oscillator stop time (`endT = t+dec+0.35`) and the voice-count release both stretch with it and
  the tubular ring is never truncated.

## Defaults — the `BASS` entry

```js
bell: {machine:'bell', oct:+1, belltone:0.4, decay:0.6, reso:0.2, cutoff:0.8, gain:0.3}
```

An octave up, mid morph, long base decay, low gain (bells ring long and stack). `reso` and `cutoff`
are unused by the bell path — it skips the LPG entirely — and are kept for schema uniformity.

## Controls

- **Third macro slider.** `defMacros` maps the `bell` char to `['bass.belltone', 0, 1]`, so a bell
  cell's third macro sweeps the full morph. It starts at 0.5 (mid) unless the blueprint sets
  `voice.m3`; `applyMacros` writes over the `BASS` default, so a static `belltone` override alone
  cannot win.
- **LFO target.** `belltone` is in the `T_NOTE` pool, accumulating via
  `case 'belltone': c._mBell += v*0.5`, zeroed each frame in `resetAcc`. Any of a cell's six latent
  LFOs can bind to it and sweep glock↔tubular in time — waking on links and spiking under CHAOS like
  every other target.

## Where it is used

Four blueprints carry `char:'bell'`:

| cell | name | octShift | voicing |
|---|---|---|---|
| SD-08 | chip melody | +1 | oct |
| FM-09 | fm bells | +2 | fifth |
| PL-18 | pluck rain | +2 | oct |
| SW-24 | saw wash | +1 | triadOpen |

None sets `voice.m3`, so all four open at the mid morph. `family` is `BELL` (label only — heat-map
color still comes from `d`/`g`/`s`). `KINGDOM_OF` puts `bell` in `artifice`, which high-passes those
cells at 300 Hz so they stay out of the bass mud.

## What it does not touch

- **`TYPES`** — that registry is field nodes (comet/wave/crawler/out); machines are unrelated.
- **Save/load** — `bell` rides the cell `code`→blueprint path, so a saved patch reloads identically.
- **Drums, drawing** — bell cells render like any other.

## Checking this voice by ear

```sh
python3 -m http.server 8000   # http://127.0.0.1:8000/
```

1. Drop **FM-09**. Sweep its **third macro** 0→1: bright short glockenspiel → dark long tubular bell.
2. The bell should **ring**, not thunk — no lowpass "pluck" choke.
3. Link two bell cells so their LFOs wake; an LFO bound to `belltone` audibly sweeps the character
   over time, and spikes harder under CHAOS.
4. At macro = 1 the long ring should not be cut short.
5. Change key/scale: bell pitches track the degree sequencer (it is just `freq` from `degToMidi`).
6. Save a patch with bell cells and reload — identical.
7. Watch the meter and console: no runaway voice count, no errors.
