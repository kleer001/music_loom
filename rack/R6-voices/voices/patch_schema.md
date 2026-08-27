# Patch schema

A **patch** is the first-class, serializable unit of *timbre*: the complete parameter
set for one `engineVoice` (the multi-engine synth in `cyber/voices.js`). It is the "what
it sounds like" axis, orthogonal to the pattern ("what notes") and the arrangement ("how
it unfolds"). A genre, DAW flavor, or tribute assigns a patch to a role (bass / pad /
lead); the cyber_synth surface edits one directly.

It replaces the loose, flat `poly` block that lived inline in `config.js` / `daw_flavors.js`.

## Design rules

1. **Robust — sparse override on a versioned base.** A stored patch is a *sparse diff*;
   it is merged onto the complete default base `PATCH_BASE` via `core/merge.js`
   `mergeConfig` before it reaches the engine — the same chain genres already use.
   `mergeConfig` keeps only keys present in the base, so:
   - a patch *missing* a field (old patch, newer engine) → the base default fills it in;
   - a patch carrying a *retired* field (old patch, field dropped) → the merge silently
     drops it, no crash.

   This is MIDI's "ignore what you don't understand" rule applied to serialization, and it
   is the whole of requirement (1): an old patch always plays to the best ability of the
   current engine.

2. **Extensible — modulators are a list, destinations are named, sources are shared.**
   `lfos`/`mods` are **arrays**, not `lfo1`/`lfo2`. Adding a third modulator is appending an
   element; the engine loops over whatever it finds and caps at what it supports. Every
   modulator routes to a **destination addressed by a canonical name** drawn from one
   registry (`MOD_TARGETS`); an unknown target name is **skipped, not defaulted and not
   fatal**. The name registry is the portability contract: a patch authored against one
   engine version keeps meaning against the next.

   **Two modulation scopes, one vocabulary.** The engine already runs a *free-running,
   bus-wide* modulation matrix (`cyber/fx.js makeModMatrix`, driven by `config.mod.routes`):
   persistent LFO / S&H / slewed-S&H / kick-env sources `connect()`-ed to bus params, with
   per-voice "taps" a voice grabs at note-on. That matrix is **genre/arrangement scope** —
   8-bar filter swells, the global wobble, the kick-env pump; it is *not* note-retriggered.
   The patch's own `lfos`/`mods` are the **note scope** sibling: born and killed with each
   note (retriggered vibrato, the bell attack, per-note filter sweep). They are the same
   concept at two scopes and **share one vocabulary** — the same source kinds
   (`lfo`/`sh`/`shslew`/`kickenv`/`env`/`vel`/`macro`) and the same `MOD_TARGETS` names — so
   nothing is bolted on. In particular **sample-and-hold is a patch LFO `shape`**
   (`sample-hold`, `shslew`), not a separate mechanism: that alone covers the S&H-pitch and
   S&H-filter sounds the research names, with no per-patch matrix needed.

3. **Not too fussy — a param registry with perceptual curves.** Continuous params are
   described once in `PARAM_SPECS` as `{min, max, curve, unit}` where `curve` ∈
   `lin|exp|log`. The UI exposes **256 steps (8-bit)** by default; "fine" params (filter
   `cutoff`, `tune.cents`) get more resolution and an `exp`/`log` curve so the 256 steps
   are *perceptually* even rather than bunched. Stored values are real musical units (Hz,
   cents, seconds) — human-readable, git-diffable, and clamped to `[min,max]` on load
   (another graceful-degradation lever: an out-of-range value from an old patch clamps, it
   does not crash).

4. **Music-forward — intervals, not frequencies; expression, not just on/off.**
   - Pitch is expressed in **semitones + cents** (`tune`, `osc2.interval`), never Hz —
     microtone-ready and transposition-safe.
   - **Velocity routes to expression** (`vel.toAmp`, `vel.toCutoff`, `vel.toFmIndex`):
     a harder-struck note is louder *and* brighter, the universal acoustic default.
   - **Filter keytrack** keeps timbre consistent up the keyboard.
   - **Filter env is bipolar** (opens or closes).
   - LFO rate is **tempo-synced by musical division** (`1/4`, `1/8`, `1/8.`, `1/8T`) or
     free Hz.
   - Defaults are seeded from `research/mined_preset_stats.json` (real Vital p25/p50/p75),
     so a fresh patch sits in a pro-sounding pocket, not at zeros.

## Shape

```jsonc
{
  "schema": 1,                      // semantic version; migrate(patch) bumps old → current
  "name": "fl-techno-wt-bass",      // stable id — the "program" address (see Stolen from MIDI)
  "engine": "subtractive",          // subtractive | fm | wavetable

  "peak": 0.4,                      // output trim 0..1

  "osc": {                          // union over engines; the active engine reads its keys
    "tune": { "semitones": 0, "cents": 0 },   // global, music-forward (replaces raw detune)
    // subtractive
    "wave1": "saw", "wave2": "square",
    "osc2": { "level": 0, "interval": 12, "cents": 0 },  // 2nd osc by INTERVAL, not oct2+detune2
    "sub": 0, "uni": 1, "uniDetune": 14,
    // fm
    "fmRatioA": 1, "fmRatioB": 2, "fmIndex": 3, "fmIndexEnv": 0,
    // wavetable
    "wtPos": 0.3, "wtWarp": 0
  },

  "filter": { "type": "lp", "cutoff": 2000, "resonance": 0.8, "env": 0, "keytrack": 0 },
  "amp":    { "attack": 0.01, "decay": 0.2, "sustain": 0.8, "release": 0.3 },
  "glide":  0,
  "drive":  { "amount": 0, "mode": "tanh" },

  "lfos": [                         // ARRAY — append to add; engine loops + caps
    // shape: tri|sine|square|saw|ramp|sample-hold|shslew   (S&H is a shape, not a subsystem)
    { "shape": "tri", "rate": 4, "sync": false, "div": 4, "dest": "cutoff", "amount": 0 }
  ],

  "mods": [                         // slot list — the per-note matrix; ≤8 slots, NOT an N×M grid
    // source: lfo0..N | env | vel | key | macro0..N    dest: a MOD_TARGETS name
    { "source": "env", "dest": "fmIndex", "amount": 0 }   // e.g. the DX7 bell attack
  ],

  "vel":    { "toAmp": 1, "toCutoff": 0, "toFmIndex": 0 },  // sugar; desugars into a mods[] slot
  "macros": [ { "name": "growl", "routes": [] } ]           // one knob → many dests (talking-bass)
}
```

`MOD_TARGETS` — the addressable destinations, shared with the genre matrix's `_modRegistry`
names. New engine versions append; they never renumber.

| Target | WebAudio backing | Status |
|---|---|---|
| `cutoff`, `resonance` | `BiquadFilterNode.frequency` / `.Q` | ✅ connect |
| `pitch` | `OscillatorNode.detune` (cents) | ✅ connect |
| `amp` | `GainNode.gain` (tremolo) | ✅ connect |
| `pan` | `StereoPannerNode.pan` | ✅ connect |
| `fmIndex` | the modulator-depth `GainNode.gain` | ✅ connect |
| `wtPos` | scannable wavetable | ✅ live — `docs/design/wavetable_scanning.md` |

Pulse-width morphing is delivered through the **`pwm` wavetable** (`wtTable:"pwm"` sweeps duty
0.5→thin across frames) modulated via `wtPos` — not a separate `pulseWidth` target, which would
duplicate the same sound on a second code path. Filter **keytrack** (cutoff follows pitch) is a
patch param, not a mod target.

**Build-vs-connect caveat.** Most targets are a-rate `AudioParam`s you simply `connect()` a
source to. Three are *not* params and need construction: **`wtPos`** (the wavetable osc sets
one `PeriodicWave` per note — true scanning means crossfading two+ waves driven by a param,
the one real new DSP job, and it is what the Knife Party / dubstep-growl sounds require);
**drive character** (`WaveShaperNode.curve` is not a param — modulate a pre-shaper gain
instead); and osc/filter **type** enums. `DynamicsCompressorNode` params are k-rate
(block-rate) — modulatable but coarse.

## Engine impact (deliberately small)

The stored schema groups params (`osc`/`filter`/`amp`/`drive`) for readability; the engine
keeps its flat destructuring via a one-line `flattenPatch()` adapter at load. The single
real code change in `engineVoice` is replacing the flat `lfo*` block (the `if (lfoDest ===
…)` dispatch) with a loop over `lfos[]`, the dispatch lifted into one `applyLfo(spec)`
helper. Unknown `dest` changes from "fall through to cutoff" to "skip + warn" so degradation
is predictable. `PATCH_BASE` is today's `POLY_BASE`; the `daw_flavors` `poly:{}` blocks
become named patches referenced by role.

## Stolen from MIDI's battle-tested soul

| MIDI principle | What it buys this schema |
|---|---|
| Ignore messages you don't understand | Sparse-merge + skip-unknown-target = graceful old-patch playback (rules 1, 2) |
| 7-bit CC → 14-bit hi-res CC → 32-bit (MIDI 2.0) | Coarse 256-step default, finer + perceptual curve where filter/pitch zipper is audible (rule 3) |
| Velocity is an expression axis, not a gate | `vel.to*` routing (rule 4) |
| Note pitch + pitch-bend in cents | `tune`/`osc2` in semitones+cents, microtone-ready (rule 4) |
| Stable CC numbers / General MIDI naming | `MOD_TARGETS` canonical-name registry = the cross-version portability contract (rule 2) |
| Program / Bank Select addressing | `name` is the program address; patches group into banks the selector browses |
| Note-on/off → gate/sustain | Patch already keys sustain off note duration, not the panel |
| Default-on-omission (RPN NULL, running status) | Omitted field = base default = the merge model |

**Why a matrix at all — not bizarre, load-bearing.** Four canonical sounds each *require* a
routing a single LFO→cutoff cannot express, and our own research demands them: The Who
"Won't Get Fooled Again" (**S&H → filter**), Vangelis/Blade Runner (**aftertouch → brightness
+ amp, per voice**), the DX7 e-piano (**envelope → FM index**), and the modern dubstep growl
(**LFO → wavetable position** + **macro → {wtPos, fmIndex, cutoff, drive}**). `daw_flavors.js`
already specs Bitwig techno as "Steps→S&H pitch." The slot-based `mods`/`macros` list above is
the *non-fussy* form of a matrix — assignable slots, as real synths ship — deliberately **not**
an every-source×every-dest grid.

**Horizon (not built — YAGNI):** **per-note expression** as a matrix *source* (MPE / polyphonic
aftertouch — the CS-80 ceiling) beyond per-patch `vel`; and **scannable wavetable** to give
`wtPos` a real destination. Both reuse `MOD_TARGETS` and the source vocabulary, so neither
breaks the contract when added.
