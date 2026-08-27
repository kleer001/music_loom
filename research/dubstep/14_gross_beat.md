# Gross Beat — the time + volume manipulation model (and how to port it)

Gross Beat (Image-Line, FL Studio) is the tool behind a huge share of dubstep/trap stutter,
glitch, reverse, tape-stop, half-time, scratch and gating effects. Its model is simple,
tempo-synced, and directly portable to a real-time engine. Source: Image-Line official tutorial
(youtube.com/watch?v=STXb8TsKPmo).

## The core model

- Incoming audio is written into a **rolling buffer** (1 bar by default, can be longer).
- Two tempo-synced **envelopes** read/shape that buffer, drawn over one bar:
  - **Time envelope** — sets the *playhead position within the buffer* over the bar.
  - **Volume envelope** — sets the *level* over the bar.
- **36 slots** hold preset envelope pairs, pre-assigned to MIDI keys and **switchable live /
  step-sequenced per bar** — this is the "different effect every bar/beat" cutting mechanism.
- Time and volume envelopes can be **linked** and automated; sequences can span >1 bar.

## Time envelope — angle = playback speed = pitch

The y-axis is buffer position, x-axis is bar time. The **slope of the line is everything**:

| Line shape | Result |
|---|---|
| Horizontal | normal 100% playback (forward, original pitch) |
| Parallel to the "safety line" diagonal | **stopped** (0% speed) |
| Top-left↔bottom-right diagonal | **reverse** (−100%, original pitch) |
| Halfway to horizontal | **50% speed** = forward, one octave down |
| Mirror of the safety line | **200%** forward (must start later in the buffer) |
| Curved (increasing angle) | **pitch bend up**; decreasing angle = bend down |
| **Stairs** curve | **stutter** (playhead jumps/relocates) |
| **Smooth stairs** | **scratching** (rapid speed up/down) |

**Safety line** = the diagonal marking how much audio has buffered so far; you can't read ahead
of it (above+behind the playhead = buffered; below = silence). Right-click a breakpoint → ±1
semitone for precise pitch. Settings: click-reduction (off/subtle/strong — low-pitched audio
needs it), attack-compensation (nudges volume ahead a few samples so relocated transients
survive), HQ resampling (sinc interpolation).

## Volume envelope — gating & ducking

Edited the same way; global **attack** (0–500 ms, smooth rising edges), **release** (0–1 s),
**tension** (variable slope). Uses: rhythmic **gating** of sustained sounds; per-kick **volume
ducking** (draw the duck on beat 1, copy/paste across the bar — a hand-drawn sidechain). You can
**drag a drum loop onto the volume envelope** to convert its amplitude into gating points.

## Signature presets / techniques

- **Tape/vinyl stop** — a time-envelope ramp to stop + automate the time-mix up; add a volume
  envelope to mute as pitch drops.
- **Half-speed octave-down layer** — the trap/dubstep "drag" on melodic elements (50% line).
- **Rhythmic gating** — the EDM mute/unmute groove on pads/bass.
- **Jungle/DnB break re-slicing** — emulate early-sampler timestretch artifacts on breakbeats.
- **Flanger trick** — a tiny vertical change → near-horizontal angle → a slightly detuned copy
  mixed via time-mix.

## Porting to cyber_synth

We now have a sample voice + per-role buffers ([[10_free_samples_oneshots]] workflow, engine
`_roleSample`). A "Gross Beat"-style insert would be a **bar-length rolling buffer effect** with:

- a **time-warp envelope** (per-bar breakpoints; slope → playbackRate, so reverse / 0.5×
  octave-down / 2× / stutter-stairs / scratch all fall out of one curve),
- a **volume envelope** (the same per-bar breakpoints → tremolo-gate + hand-drawn kick duck),
- a **slot bank** the arrangement can switch per bar/step.

This subsumes several wishlist items into one module: stutter/glitch edits, reverse, tape-stop,
the half-speed layer, rhythmic gating, and an alternative to sidechain ducking — and the
per-bar slot switching is the engine-level form of the "quick cutting between sounds" goal.
Tempo-synced breakpoints map cleanly onto the existing 16-step grid; `setValueCurveAtTime` /
playbackRate automation on a BufferSource covers the DSP without a worklet.
