# Recurring comp figures

A structural layer for a generative jazz combo: the piano restates a short stored phrase every few bars, **transposed onto whatever chord is current**, so the same shape re-colours as the changes move under it. It gives the combo a recognisable recurring motif instead of purely per-beat-random comping.

## Provenance

The "periodic transposed pattern" idea is the core technique of harmonic *procedural sequencers* such as Scaler: treat a stored phrase as data and re-derive its concrete notes against the live harmony, rather than authoring notes directly. Narrative emerges from patterns that retrigger at different bar periods drifting against the progression. Here the bass walks every bar and the comp figure restates every few bars; their interplay over the changes is the narration.

## Data model

A figure is a pair of arrays:

```js
{ steps: [0, 2, 4, 6], rhythm: [0, 1, 2, 3] }
```

- `steps` — indices into the **current chord's bebop scale** (see `improv_lessons.md`, the bebop-scale section). Even indices land on chord tones, because the eight-note bebop scale puts chord tones on even slots; a figure built from even-ish steps therefore sits on the harmony however it transposes. Index `0` is the chord root, and indices may exceed the scale length — they wrap with an octave shift.
- `rhythm` — each note's onset in beats within the bar. An integer is on the beat; a non-integer rides the swung "and", offset by `swing − spb/2`. Note duration is the gap to the next onset, times 0.9, with the last note defaulting to one beat.

Figures are one-bar phrases. One figure is chosen per playing session rather than per bar, so the ostinato stays recognisable.

## Realisation

For the active figure and the bar's chord:

1. Take the bebop scale for the chord's quality.
2. Turn each step into a MIDI note: `chord.root + 12 + scale[step mod len] + 12·floor(step/len)`, then fold the result into the piano's comp register — **MIDI 60–79**, above the bass — so the octave is robust regardless of where the chord's root sits.
3. Play through the piano patch at the comp layer's peak level, humanised.
4. Mark the figure's end time, reserving the piano until then.

Because the root and scale are read from the *current* chord on every restatement, the identical figure voices differently on each chord. That is the whole point.

## What an implementation needs

- **Session state** — one figure picked for the session, a monotonic bar counter, and an "occupied until" timestamp for the piano.
- **A bar clock that does not wrap.** The restatement period keys off a monotonic count, not a bar index that wraps at song length — otherwise the period stutters at every loop boundary.
- **A downbeat trigger** — on beat 0, when the bar count is a multiple of the period and a probability check passes, fire the figure. This has to run *before* the ordinary comping decisions so the reservation is set first.
- **Voice reservation** — ordinary block-comping checks the reservation and yields while a figure is sounding, so the figure is the piano's statement for that bar. Off-bars fall back to probabilistic comping, and the contrast between the two is the call-and-space.

The figure shares the piano with block-comping and is mutually exclusive with it. It overlaps freely with the bass, which has its own register, and with the lead on a separate horn voice.

## The two knobs

- **Probability** (around 0.5) — the chance the figure speaks on a scheduled bar. The rest of the time it gives the bar air. Zero disables the layer.
- **Period** (around 2) — bars between scheduled restatements.

Both are plain numbers, so a tuning UI can expose them as sliders and a per-context override can vary them by scene: sparse in a ballad, denser up-tempo.

## Extending and tuning

- **New figures** are data, not code. Keep steps on even indices for consonance; use odd indices deliberately for passing colour.
- **Too busy or clashy on a tune**: thin the figure — drop a step, widen a rhythm gap — or lower the probability and raise the period.

## Verification

There is no useful automated check for this. Listen: a recurring piano phrase should restate on its period and re-voice as the changes turn. If it sounds identical over two different chords, the transposition is reading a stale chord.
