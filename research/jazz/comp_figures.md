# Recurring comp figures — integration spec

A structural layer for the indoor jazz combo: the piano restates a short stored
phrase every few bars, **transposed onto whatever chord is current**, so the same
shape re-colors as the changes move under it. It gives the combo a recognizable
recurring motif instead of purely per-beat-random comping.

Lives entirely in `web/audio.js` (the `GameAudio` engine). Like the rest of the
combo it is **outside the determinism contract** — real-time, its own
`Math.random`, browser-only, observe-only. Not typechecked or tested (`web/` is
outside `tsconfig` and the test runner); verify by ear.

## Provenance

The "periodic transposed pattern" idea is the core technique of harmonic
*procedural sequencers* (e.g. Scaler): treat a stored phrase as data and
re-derive its concrete notes against the live harmony, rather than authoring
notes directly. Narrative emerges from patterns that retrigger at different bar
periods drifting against the progression. Here: the bass walks every bar; the
comp figure restates every `figPeriod` bars; their interplay over the changes is
the "narration."

## Data model — `COMP_FIGURES`

A module-level array of figures. Each figure:

```js
{ steps: [0, 2, 4, 6], rhythm: [0, 1, 2, 3] }
```

- `steps` — indices into the **current chord's bebop scale** (`bebopScaleFor(qual)`,
  see `improv_lessons.md` §C). Even indices land on chord tones (the 8-note bebop
  scale puts chord tones on even slots), so a figure built from even-ish steps
  always sits on the harmony however it transposes. Index `0` is the chord root;
  indices may exceed the scale length (they wrap with an octave shift).
- `rhythm` — each note's onset in beats within the bar. An integer is on the beat;
  a non-integer rides the swung "and" (offset by `swing − spb/2`). Note duration
  is the gap to the next onset (last note defaults to one beat), times `0.9`.

Figures are 1-bar phrases. One figure is chosen per playing session (not per bar),
so the ostinato stays recognizable within a room.

## Realization — `_compFigure(t, spb, swing, chord, hum)`

For the active figure and the bar's `chord`:

1. `scale = bebopScaleFor(chord.qual)`.
2. Each step → MIDI: `chord.root + 12 + scale[step mod len] + 12·floor(step/len)`,
   then folded into the piano register **60–79** (above the bass, in the comp
   zone) so the octave is robust regardless of the chord's root register.
3. Played through `_voice` with the piano patch (`_patch("piano")`) at
   `jazz.compPeak`, humanized via `hum`.
4. Sets `this._figUntil` to the figure's end time, reserving the piano.

Because the root and scale are read from the *current* chord every restatement,
the identical figure voices differently on each chord — the whole point.

## Integration points (all in `web/audio.js`)

- **Session state** — `_setJazz` picks `this._fig = pick(COMP_FIGURES)`, and
  initializes `this._barCount = 0` and `this._figUntil = 0`.
- **Bar clock** — `_jazzTick` increments `this._barCount` each time the bar
  advances (alongside the existing `_bar` wrap). `_barCount` is monotonic;
  `_bar` wraps at song length, so the period must key off `_barCount`.
- **Trigger** — in `_scheduleBeat`, on the downbeat (`beat === 0`) when
  `_barCount % figPeriod === 0` and `chance(figProb)`, call `_compFigure`.
  This runs *before* the block-comp lines so `_figUntil` is set first.
- **Piano reservation** — the random block-comp conditions are gated on
  `free = t >= this._figUntil`. While a figure is sounding the block-comp yields,
  so the figure is the piano's statement that bar; off-bars fall back to normal
  probabilistic comping (the call-and-space contrast).

The figure shares the piano voice with block-comp (mutually exclusive via
`_figUntil`); it overlaps freely with the bass (own register) and the lead
(separate horn voice).

## Config — `DEFAULT_AUDIO_CONFIG.jazz`

- `figProb` (default `0.5`) — chance the figure speaks on a scheduled bar; the
  rest gives it air. `0` disables the layer entirely.
- `figPeriod` (default `2`) — bars between scheduled restatements.

Both are plain numbers, so the audio editor (`npm run audio`) exposes them as
sliders automatically and they participate in per-context overrides like every
other jazz knob.

## Extending / tuning

- **New figures**: append `{ steps, rhythm }` to `COMP_FIGURES`. Keep steps on
  even indices for consonance; use odd indices deliberately for passing color.
  No code change — figures are data.
- **Too busy or clashy on a tune**: thin a figure (drop a step, widen a rhythm
  gap) or lower `figProb` / raise `figPeriod` for that context in the editor.
- **Per-location feel**: override `figProb`/`figPeriod` in `web/audio_suite.json`
  contexts (e.g. sparse in a ballad room, denser in an up-tempo club).

## Verification

`node --check web/audio.js` covers syntax. There is no automated coverage of the
audio engine. By-ear check: `npm run audio`, pick an indoor context — a recurring
piano phrase should restate every `figPeriod` bars and re-voice as the changes
turn. Tune `figProb` / `figPeriod` live and the figures in `COMP_FIGURES`.
