# Cyberpunk Audio Engine — Design Spec

> A procedural, real-time soundtrack engine for a neo-cyberpunk game — the
> trance/techno/industrial sibling of ferine_town's procedural jazz combo
> (`web/audio.js`). Same paradigm, same interface, different DNA.

**Status:** a working draft (no engine code yet — we iterate on paper first).
**Home:** the engine will live in its own **new, separate repo** (the cyberpunk
game is its own project). This document lives in ferine_town only as a design
reference, because ferine_town's jazz engine is the proven blueprint we are mutating.

**Reference build:** `web/audio.js` (~2,850 lines), `web/sampler.js`,
`web/audio_editor.js`, `src/web/server.js`, `web/audio_suite.json`,
`scripts/fetch_soundfont.js`, and the "Procedural audio" / "Web interfaces"
sections of `CLAUDE.md`.

**Companion docs:** [`cyberpunk_audio_songs.md`](./cyberpunk_audio_songs.md)
(notation, idiom & pattern sourcing) and
[`cyberpunk_audio_fx.md`](./cyberpunk_audio_fx.md) (effects, the performance/
knob-riding layer, modular synthesis & resampling).

---

## 1. Vision & relationship to the jazz engine

The jazz engine's value is **not the jazz** — it's the scaffolding. The genius
moves are reusable wholesale; only the *content* (voices, harmony, structure) is
genre-specific. The thesis of this spec:

> **Inherit the scaffolding. Swap the content.**

This is a **sibling, not a fork.** It is not a new mode bolted onto ferine_town —
it is the same architecture re-grown for a different game and a different musical
world. Where the jazz engine renders an acoustic combo over a chord chart, this
one renders an electronic stack over a 16-step grid.

What stays identical in spirit:

| Jazz engine asset | Reused as |
|---|---|
| Lookahead scheduler (`_jazzTick` / `_scheduleBeat`) | 16th-note step clock |
| Context system (`contextKey` / `mergeConfig` / `_resolveContext`) | `district × time × tension` mix map |
| Style presets (`STYLE_DEFAULTS`, `web/audio.js:1055`) | **Genre presets** (techno/trance/…) |
| Focus Markov (`FOCUS_STATES`/`FOCUS_MATRIX`, `:240`/`:249`) | **Arrangement Markov** (intro/build/drop/breakdown) |
| Door-bleed + muffle rings (`_apply`) | Club bass leaking through a door |
| `temperature`, humanization, mixer strips, saturation bus | Same roles, retuned |
| Context-grid tuning editor + `{base,contexts}` suite | Ported verbatim |
| `web/sampler.js` + `scripts/fetch_soundfont.js` | Hybrid texture/foley/vox layer |

What is genuinely **new** (electronic music demands it): a **sidechain pump**,
**filter-sweep / riser automation**, and a beefed-up **distortion / bitcrush bus** —
the three *genre-defining* additions to the signal path. Everything else is a
re-skin. (A fuller performance/FX layer — the dub "moves" system, a modulation
matrix, reverb/delay modules, resampling — grows on top of these; see the
[FX companion](./cyberpunk_audio_fx.md).)

---

## 2. Research basis

Condensed from production research conducted during planning (sources at the end).

### Techno
- **16-bar phrase** structure; something enters or leaves every 16 bars, larger
  shifts every 32/64. Movement comes from **automation** (filter sweeps, sends),
  not new notes — the genre is built on **hypnotic repetition**.
- **Layered kick:** sub (sine, 30–80 Hz, ~300 ms decay) + thump (80–150 Hz) + a
  short clicky transient (noise burst / clipped square). Mono-compatible.
- Strict quantization with **intentional micro-timing** so it doesn't fatigue.
- Lineage: the Roland TR-808/909 16-step sequencer and analog drum voices.

### Trance
- Arc: **Intro → Build-up → Breakdown → Drop/Climax → Outro**, each 16–32 bars
  (drop 32–64). The breakdown is the emotional core (drums out, pads/melody bare);
  the build reintroduces rhythm and tension (risers, filter opens).
- **Supersaw lead** is the signature: 6–12 detuned saws, LPF with automated cutoff,
  a touch of saturation. **Rolling off-beat bass**, crisp hats, layered claps.
  **Arpeggios** drive motion. 128–150 BPM. Euphoric minor harmony.

### Industrial / EBM
- Palette: distorted drum machines, **metallic/mechanical percussion**, feedback,
  found-object/foley recordings (chains, sheet metal, hydraulics), tape loops.
- **Distortion/saturation** chains (tanh, wavefolding, clip), bitcrush, ring-mod,
  gated reverb, heavy **rhythmic gating**. Driving repetitive basslines.
- Trick: blend a real transient with a distorted electronic tail.

### Synthesis primitives (how to voice it)
- **TB-303 acid bass:** single osc (saw *or* square) → **24 dB/oct resonant LPF**
  → envelope. **Accent** = louder + more filter-env. **Slide** = glide into the
  next note *without* retriggering the env (the liquid, vocal phrasing). Real-time
  cutoff/resonance automation is the performance.
- **TR-808/909 drums:** analog synthesis — kick = sine + fast downward pitch-env +
  click; snare = tone osc(s) + noise + "snappy" amount; hats/cymbals = filtered
  noise / pulse-oscillator banks (909 hats were samples — relevant to our hybrid).
- **Supersaw:** N detuned sawtooth voices summed; detune width + voice count set the
  richness; LPF + drive shape it.
- **Reese bass:** 2–3 detuned saws through a LPF (the DnB/neuro staple).
- **Harmony:** minor modes — **Aeolian / Dorian / Phrygian**; Phrygian gives the
  psychedelic/menacing drive (intros, arps). **Pedal tones**, locked to the kick.
- **Sidechain pumping:** bass/pads/lead ducked on every kick — *the* four-on-the-
  floor signature.

---

## 3. Architecture (new repo layout)

Mirror ferine_town's audio surface, genre-generalized:

```
web/
  audio.js          GameAudio engine: scheduler, context, zones, mixer,
                    sidechain, FX bus, voice synth, arrangement Markov
  sampler.js        (ported) hybrid sample playback for foley/vox/breaks
  audio_suite.json  { base, contexts } sparse tuning suite
  audio_editor.*    context-grid + slider tuning tool (ported)
  sequencer.*       NEW: step-sequencer "pattern" authoring tool (jukebox analog)
  samples/          curated hybrid one-shots (see §11)
scripts/
  fetch_soundfont.js  (ported) offline sample fetch for the hybrid layer
src/web/server.js     dev server + /__save_audio, /__save_patterns POST
```

**Core/engine split.** Factor the engine as a **genre-agnostic core** + **pluggable
genre presets**, exactly as the jazz engine layers `STYLE_DEFAULTS` over
`DEFAULT_AUDIO_CONFIG` (`web/audio.js:1349`):

- **Core (genre-agnostic):** AudioContext graph, lookahead scheduler, context
  resolution + sparse merge (`mergeConfig`, `web/audio.js:1118`), zone cross-fade +
  door bleed (`_apply`), mixer strips, sidechain bus, FX bus, humanization.
- **Genre presets (`GENRES`):** one entry per genre = tempo range + swing/shuffle +
  pattern bank + voice assignment + FX preset + arrangement bias. This is the
  direct analog of `STYLE_DEFAULTS` — *a genre is a word that pulls a bundle of
  feel defaults*, and a context/pattern can still override any field.

`update({...})` keeps the jazz engine's read-only relationship with scene state
(`web/app.js` passes `{indoor, location, weather, phase, temperature, door,
doorOpen}`): the cyber engine reads `{district, indoor, time, tension, door,
doorOpen}` and doesn't write game state.

---

## 4. Voice synthesis catalog

All recipes are **stock Web Audio** (oscillators, noise buffers, biquad filters,
gain envelopes, `WaveShaperNode`) — no libraries, keeping it dependency-light.
Voices are parameterized so genre presets and the editor can reshape them.

### Drums (synth, 808/909 lineage)
- **Kick** — sine osc, frequency env from ~120→45 Hz over 30–60 ms, amp env
  ~300 ms; optional click layer (1-cycle noise/square through HPF). *Layered kick*
  mode adds a separate sub sine for techno weight.
- **Snare/clap** — tone (2 detuned square/triangle, ~180 Hz) + noise burst through
  BPF; "snappy" = noise/tone mix. Clap = 3–4 retriggered noise bursts ~8 ms apart
  into a short verb.
- **Hats** — HPF'd noise (closed ~40 ms, open ~250 ms); or pulse-oscillator bank for
  the metallic 808 timbre. Off-beat open hat is a house/trance staple.
- **Rim / clave / cowbell / ride** — short tuned pulses; ride = noise + resonant BPF.
- Round-robin articulations per piece (port `DRUM_KITS`, `web/audio.js:792`) for
  variety; humanized velocity + micro-timing.

### Bass
- **303 acid** — saw/square → resonant LPF (high Q) → amp+filter env, with **accent**
  (env depth + gain) and **slide** (portamento via `setTargetAtTime` on frequency,
  no env retrigger). The cutoff is the main automation target.
- **Rolling off-beat bass** — short plucky notes on the 8th/16th off-beats,
  sidechained hard to the kick (trance/psy).
- **EBM driving bass** — saw/square, mid drive, gated 16ths, mono.
- **Reese** — 2–3 detuned saws → LPF (DnB/neuro/dark).

### Synths
- **Supersaw pad** — N detuned saws (per `detune`/`voices` params) → LPF → slow
  amp env; chord voicing from the pattern's scale.
- **Supersaw lead** — same engine, mono/legato, automated cutoff, optional unison
  width; the trance anthem.
- **Stab** — short supersaw/FM chord hit, often with delay send (dub techno).
- **FM bell/pluck** — 2-op FM (`OscillatorNode` modulating another's frequency via
  a gain) for chiptune/glitch/synthwave color.
- **Formant vox pad** — a *synthesized* choir "aah/ooh": a saw/pulse through **3
  parallel bandpass filters** tuned to vowel formants (ah ≈ 700/1220/2600 Hz, ooh ≈
  300/870/2240 Hz, ee ≈ 270/2300/3000 Hz), slow amp env + light chorus/detune.
  Keeps sustained vox license-free and on the synth-first philosophy — samples are
  reserved for rhythmic *chops*, not pads (see §11).
- **Spoken-word sample voice** (`sampleVox`, *implemented*) — the chop counterpart to the
  formant pad: a real spoken-word clip, sliced and walked across the `vox` row, played
  through that channel's full FX rack (drive/bitcrush/delay/reverb + sidechain) — the
  period-correct "voice reciting over the machines". A tribute opts in via
  `voices.vox.synth:"sampleVox"` + `voices.vox.sample:"<key>"` (+ `slices`/`rate`); clips
  load from the audio-free manifest `data/spoken_word.json`. This is the **sample the chops**
  half of §11a — sourcing + rights vetted in `research/spoken_word_sources.md`.
- **Arpeggiator** — drives any pitched voice; params: rate (1/8…1/16…1/32),
  pattern (up/down/updown/random/as-played), octave range, gate; tempo-synced to
  the scheduler.

### Pitched-voice scale model
Patterns carry `{ tonic, mode }` (Aeolian/Dorian/Phrygian/HarmonicMinor/…) and
optional chord cells; voices resolve degrees → MIDI → frequency, just as the jazz
engine realizes chord tones — but over minor modes and pedal tones instead of
ii-V-I changes.

---

## 5. New signal-path elements

Beyond the jazz graph, three additions (each small):

1. **Sidechain pump.** A `pumpGain` node on the synth bus (bass + pads + lead).
   On every scheduled kick, write a ducking envelope: drop to `1 - depth` at the
   kick, recover over `release` (≈ one 8th note). Params: `depth`, `release`,
   `curve`, and *which* buses subscribe. This single node delivers the genre's
   breathing four-on-the-floor feel.
2. **Filter-sweep / riser automation.** Per-bus master cutoff with an automation
   layer driven by the **arrangement state** (§6): builds ramp cutoff open + add a
   noise **riser**; drops slam it open + an **impact**; breakdowns close it down.
   Reuses the engine's existing param-ramping helpers (`_ramp`).
3. **Distortion / bitcrush bus.** Extend the jazz **parallel saturation/exciter
   bus** into a full grit chain: `WaveShaperNode` (tanh/wavefold/clip curves),
   a bitcrush stage (sample-rate reduce + quantize via an **`AudioWorklet`** —
   preferred; `ScriptProcessorNode` is deprecated and runs on the main thread),
   and optional ring-mod (gain modulated by an osc). Industrial leans on it; other
   genres dial it to near-zero. The full FX/performance treatment lives in the
   [FX companion](./cyberpunk_audio_fx.md).

---

## 6. Structure & arrangement

**`PATTERN` digest** (the `SONG` analog). Each pattern:

```
{ name, genre, tonic, mode, meter:{steps:16}, bpm:{min,max},
  rows: { kick:[…16], snare:[…], hat:[…], bass:[…], … },  // step on/off + accent/slide
  chords?: [cell…],        // optional harmonic movement per phrase
  arrangement: ["intro","build","drop","breakdown",…]  // 16-bar phrase plan
}
```

Rows are 16-step on/off with per-step **accent** and **slide** flags (303-style).
A pattern is authored in the sequencer tool (§10), then baked into a context — the
same design-time flow as jazz songs (`AUDIO_SONGS`, baked via `setConfig`,
`web/audio.js:1099`).

**Arrangement Markov.** Repoint `FOCUS_STATES`/`FOCUS_MATRIX` (`web/audio.js:240`)
from solo-trading onto **arrangement states**: `intro · build · drop · peak ·
breakdown · outro`. Each state is an emphasis/automation profile (which voices
play, cutoff target, pump depth, density). The matrix biases transitions per genre
(trance favors long build→drop→breakdown arcs; hypnotic techno dwells in `peak`;
ambient lives in `breakdown`). Phrase length = 16 bars (vs jazz's `focusPeriod`).

**`tension` (= jazz `temperature`).** A single 0..1 intensity knob from game state
(danger/heat of the scene) drives: filter cutoff, distortion depth, layer count,
note density, pump depth. Calm zone → sparse ambient; firefight → dense distorted
peak. Determinism-free, observe-only, exactly like `temperature`.

---

## 7. Genre menu

Each genre is a **preset over shared primitives** = tempo + swing/shuffle + pattern
bank + voice assignment + FX preset + arrangement bias (the `STYLE_DEFAULTS`
pattern). **Launch lineup: all nine** of the following tiers' Core + Free-bonus
genres are in scope.

### Core (the three pillars)
- **Techno** — 125–135 BPM, four-on-floor, layered kick, hypnotic 16-bar phrases,
  off-beat hats, acid/stab color, automation-driven movement.
- **Trance** — 132–142 BPM, supersaw leads + arps, rolling off-beat bass, full
  build/drop/breakdown arc, lush delay/reverb, euphoric minor harmony.
- **Industrial / EBM** — 100–140 BPM, heavy distortion/bitcrush, metallic/mechanical
  percussion (hybrid foley), gated rhythms, driving mono bass, menacing Phrygian.

### Free bonus (reparametrize only — no new mechanism)
- **House / deep / tech-house** — 118–125 BPM, swung 16ths, off-beat open hat,
  organ/piano stabs, warm filter.
- **Acid** — techno/house skeleton centered on the 303 (already a core voice);
  performance = live cutoff/resonance/accent automation.
- **Dub techno** — sparse chord stabs through a long ping-pong delay + reverb,
  deep sub, minimal drums.
- **Psytrance** — 145–150 BPM, rolling 16th Phrygian bassline (kick-bass interlock),
  squelchy acid, hypnotic arps.
- **Ambient / dark ambient** — drums off (the `breakdown` state extended): evolving
  drones, pads, sparse FM bells. Perfect for safe/contemplative zones and menus.
- **Synthwave / outrun** — 80–110 BPM, gated-reverb snare, arpeggiated bass, analog
  saw lead, nostalgic minor/major. The Blade Runner / *Drive* sound — maximally
  on-brand for neo-cyberpunk, and free from the same primitives.

### Costs one new mechanism each (post-launch options)
- **DnB / breakbeat / trip-hop** — needs a **breakbeat sequencer** (sliced/syncopated
  drum rows instead of four-on-floor); the reese bass itself is already free.
- **IDM / glitch** — needs a **stutter/retrigger** engine (gate + buffer repeat);
  bitcrush/ring-mod already live on the FX bus.

---

## 8. Ambient beds (outdoor / non-combo layer)

Replace the jazz weather bed (rain/wind/birds/crickets) with an **urban-dystopia
bed**, synthesized the same way (filtered noise + drones + sparse events):

- **Rain on neon/asphalt** — keep rain (cyberpunk loves it), dirtier: harder hiss,
  electrical sizzle.
- **Neon / electrical hum** — 60/120 Hz drone + flicker.
- **Distant traffic drone** — low filtered noise swell.
- **Sirens / drones** — sparse, far-off pitch swells (the city's "birds").
- **HVAC / machine hum** — ventilation drone (the "wind").
- **Data blips** — sparse high-frequency events (the "crickets").

The **door-bleed system carries over unchanged** and is *more* iconic here: muffled
club bass thumping behind a door onto a wet street, opening up as you approach
(`_apply` bleed/muffle rings). This is the single best inherited effect.

---

## 9. Context map (districts as contexts)

Generalize `contextKey` (`web/audio.js:1150`) from `weather × time × location` to
**`district × time × tension`**:

| District / zone | Genre flavor |
|---|---|
| Neon nightclub (interior) | trance / acid / psytrance |
| Corporate lobby / arcology | clean melodic techno / ambient |
| Industrial underlevel / sewers | industrial / EBM |
| Street / alley (exterior) | dark ambient drone + club bass bleeding through doors |
| Hacker den / netrunner | synthwave / IDM |
| Market / sprawl | house / tech-house |

Day/night still buckets the cell; `tension` modulates intensity within it. Stored
as a sparse `{base, contexts}` suite (`web/audio_suite.json` format), authored in
the editor.

---

## 10. Editor & authoring tools

Two tools, both ported from ferine_town:

- **Context tuner** (port `web/audio_editor.js`) — the context grid (now district ×
  time × tension), the slider wall + voice radios feeding `setConfig()` live, Save
  to `audio_suite.json` via `/__save_audio`, "Return to default" deltas. New
  sliders for the new params: filter cutoff/resonance, drive/bitcrush, sidechain
  depth/release, detune/voices, arp rate/pattern, delay/reverb sends.
- **Sequencer / "pattern" authoring** (the jukebox analog) — a 16-step grid per
  voice with accent/slide toggles, scale/mode picker, per-genre voice assignment,
  and an arrangement strip (intro/build/drop/breakdown). Saves to
  `audio_patterns.json` via a `/__save_patterns` endpoint; patterns bake into
  contexts exactly as jazz songs do. It also offers **found-rhythm import** — drop
  in a machine/field recording and an offline onset + tempo + timbre-cluster pass
  extracts an editable `PATTERN` (the machine-as-drummer; see songs doc §4D).

Both served surfaces should ship the light/dark `◐` toggle persisted under
`localStorage['ferine-theme']` (CLAUDE.md "Web interfaces" — carry the pattern into
the new repo with its own key).

---

## 11. Determinism, boundaries & the hybrid sample story

Follow ferine_town's audio approach:

- **Reads, doesn't write.** The engine reads scene state; it stays clear of the
  game RNG, seed, clock, and saves, using its own `Math.random` for humanization
  and generative choice — so it can't shift a seed's world.
- **Browser-side.** Guard on a missing `AudioContext`; no Node path touches it.
- **Outside the determinism/test surface** — real-time, audited by spectrum when
  ears aren't enough (port the `docs/AUDIO_MCP.md` render-and-measure recipe).

**Hybrid sound source (the current call).** Core voices lean on synthesis
(303, 808/909, supersaw, reese, FM) — close to the genre's sound and keeping the
note data audio-file-free, the way the jazz engine started out. The **sampler is reused**
where synthesis falls short:

- **Foley / mechanical percussion** for industrial (metal hits, machinery,
  hydraulics).
- **Vocal chops / vox pads** (processed, robotic).
- **Breakbeat slices** if/when DnB/breaks land.

These ship as a small curated, permissively-licensed one-shot set under `samples/`
with a `LICENSE.txt` (mirror `web/samples/LICENSE.txt`), fetched/regenerated offline
by the ported `fetch_soundfont.js`. "Zero **runtime** dependencies" still holds (no
npm package); the "no audio files" claim is relaxed to this curated set, as in
ferine_town.

### 11a. Sample & vox sourcing

The make-or-break for vendoring audio into a (public, possibly commercial) game
repo is **license**, not availability. The safe tiers are **CC0 / public-domain**
and **permissive (MIT-style)**; **CC-BY** is fine *with* attribution kept in
`LICENSE.txt`; **anything -NC won't work** for a commercial game, and neither will "free
download" with credit/no-resale terms.

**The freebie already in hand.** The jazz engine vendors **FluidR3_GM (MIT)** via
`scripts/fetch_soundfont.js`, and FluidR3 is full of cyberpunk-ready patches — the
ported fetch script just requests different instrument IDs, **zero new licensing
work**:
- Vox: `choir_aahs`, `voice_oohs`, `synth_voice`, `lead_6_voice`
- Pads / atmos: `pad_4_choir`, `pad_7_halo`, `pad_8_sweep`, `pad_2_warm`,
  `fx_4_atmosphere`, `fx_8_sci_fi`, `fx_5_brightness`
- Synth lead / bass: `lead_1_square`, `lead_2_sawtooth`, `lead_5_charang`,
  `lead_8_bass_lead`, `synth_bass_*`

**External sources, ranked by license-for-a-game:**

| Source | License | Best for | Vendor? |
|---|---|---|---|
| **Freesound** (CC0 filter, 11k+ PD) | CC0 | Vocal one-shots (vowels/shouts/phonemes), metal/machine foley | ✅ cleanest |
| **Producer Space** (18 packs) | CC0 | Vocals + misc, no attribution | ✅ |
| **VCSL** (Versilian Community SL) | CC0 | Odd percussion, foley, some vocal | ✅ |
| **ccMixter / dig.ccMixter** | mixed CC (filter CC0/BY) | Full acapella stems for chops | ✅ if CC0/BY |
| **GeneralUser GS** soundfont | permissive (commercial + redistribution OK) | Alt GM choir/synth/voice | ✅ |
| **Sonniss GDC bundle** (200 GB+ archive, annual) | royalty-free, commercial, no attribution | **Industrial foley** — metal, machinery, hydraulics | ⚠️ see caveat |
| Looperman / FreeVocals acapellas | "free" + credit / no-resale | reference only | ❌ |

- **Sonniss caveat:** royalty-free + commercial + no-attribution covers *using
  sounds in a game*, but the license forbids redistributing them *as a standalone
  sound library*. Committing raw WAVs to a **public** repo flirts with that line —
  fine as baked-in game assets, not as a re-downloadable `samples/` pack. CC0
  sources sidestep this entirely; prefer them for anything vendored.
- **Synthesize the pads, sample the chops.** Sustained vox = the **formant vox pad**
  (§4), no files. Reserve samples for rhythmic vocal *chops/phrases* and real
  *foley* where synthesis can't deliver. The chop half is **implemented** — the
  `sampleVox` voice (§4) chops a clip across the `vox` row through the FX rack; clips
  register in `data/spoken_word.json`, none vendored.
- **Industrial machine foley.** The cheapest clean source for metal / machinery /
  HVAC is **Freesound (CC0 filter)** and **Pixabay** (royalty-free, no attribution) —
  mundane appliance / motor / factory recordings are abundant and almost always CC0.
  Cleanest of all: **record your own** washing machine, dryer, fan, or HVAC — your own
  IP, zero licensing, and literally the "nobody would care" recordings. (ZapSplat is
  huge but its *free tier requires attribution* — keep that out of a CC0 vendor set.)
  These same recordings double as **rhythm sources** → found-rhythm extraction
  (songs doc §4D), which transcribes a machine loop into a `PATTERN`.

### 11b. Public-domain spoken word (for chops & stutters)

A few minutes of low-fi multilingual speech to chop/stutter is very achievable and
very on-theme (radio chatter, glitched announcements, half-heard transmissions).

> **Playback is wired** (§4 `sampleVox`): register a clip in `data/spoken_word.json`
> and point a tribute's `voices.vox.sample` at it. The named-talk angle — chopping a
> *recognizable* speaker (Leary/McKenna) rather than anonymous CV/LibriVox clips — is
> researched, rights-checked, and per-source ruled in/out in
> [`research/spoken_word_sources.md`](../../research/spoken_word_sources.md): lead with
> the public-domain **Timothy Leary** material; **McKenna is replaceable**, not cleared
> for release. The CC0/PD sources below stay the safest default for vendored chops.

Ranked by cleanliness:

- **Mozilla Common Voice — the jackpot.** **CC0**, **129 languages**, made of short
  single-sentence clips — exactly the chop/stutter use case. Confirmed present:
  **German, Dutch, Japanese, Arabic, Urdu** (plus Pashto, Mandarin, Russian, …).
  CC0 means vendor freely, no attribution, no publicity worries (anonymous
  volunteer speakers). **Default recommendation for foreign-language vox.**
  - **Best single grab → "Common Voice — Single Word Target Segment" (CV 7.0).**
    It is literally **digits 0–9 plus "yes"/"no" in 34 languages** — the
    "counting in lots of languages" idea, pre-made. ~84 validated hours total, but
    we only want a couple MB, so pull a handful of clips per language (clips are
    small MP3s, tens of KB each). On the Mozilla Data Collective.
  - **Rehosting nuance:** the individual clips are **CC0** (use/transform/ship the
    *derived, chopped* audio freely, commercial included). The dataset *package*
    carries a "don't re-host the dataset" + "don't de-anonymize speakers" term — so
    don't mirror the raw tarball; extract + process the clips we use. Heavy
    processing (our whole aesthetic) puts it beyond any doubt.
- **LibriVox** — **public-domain dedication**, 90+ languages (German/Dutch/Japanese/
  Arabic and more). Longer-form readings of pre-1929 texts; grab a few seconds and
  chop. Clean to vendor.
- **NASA audio** — **US-government public domain** (17 U.S.C. §105): countdowns,
  mission-control chatter, "go/no-go" — iconic English radio texture. *Caveats:*
  third-party contractor content can carry copyright, and a **recognizable person's
  voice** may raise right-of-publicity issues for commercial use (NASA flags this).
  Low-friction, direct-download picks:
  - **NASA "Historical Sounds"** (`nasa.gov/historical-sounds`) — official, MP3 +
    M4R one-clicks: "We Have a Lift-Off", "The Eagle Has Landed", Apollo/Mercury
    clips. The cleanest official source.
  - **Internet Archive** — bulk PD: `NasaAudioHighlightReels` (Apollo 11 liftoff,
    Atlas countdown/liftoff), `NasaLaunchAudio` (KSC launches/landings),
    `Apollo11Audio` (full mission, digitized by JSC). Direct MP3 downloads.
  - **Public Domain Review** — *Apollo 11 Onboard Recordings (1969)*, flagged PD.
  - **Safest for commercial use:** anonymous **countdowns / mission-control
    chatter / static-laden comms** (no identifiable celebrity voice), processed.
    Treat famous astronaut quotes (e.g. Armstrong's "one small step") as
    likeness-sensitive — heavily process or skip in a commercial build.
  - **Starter pull-list (iconic clips):**
    - *Cleanest — texture / non-celebrity, grab freely:*
      - **Quindar tones** — the "beep" bracketing NASA transmissions. Pure tone,
        no voice, *instantly* reads as space-radio. Zero likeness issue. Ideal
        stutter/rhythm fodder.
      - **Launch countdown** — "10, 9, 8… ignition sequence start… 3, 2, 1, zero,
        all engines running — liftoff!" (Apollo 11; commentator Jack King, a NASA
        public-affairs officer on official duty → PD).
      - **"Liftoff, we have a liftoff."** / generic **"Go / no-go"** poll chatter,
        **"The clock is running,"** flight-director loop crosstalk + static.
    - *Iconic but likeness-sensitive (heavily process, or skip in commercial):*
      - **"Houston, Tranquility Base here. The Eagle has landed."** (Armstrong)
      - **"That's one small step for man, one giant leap for mankind."** (Armstrong)
      - **"Houston, we've had a problem."** (Apollo 13 — Swigert/Lovell; note: the
        actual phrasing is *"we've had,"* not "we have")
      - **"Godspeed, John Glenn."** (Mercury; Scott Carpenter)
      - Avoid Challenger/Columbia loss audio — tragic, not a fit.
- **Presidential speeches** — the *official federal recording* is US-gov PD, but a
  *news-network recording* of the same speech is a separate copyright, and a famous
  politician's voice carries **right-of-publicity/likeness** exposure in a
  commercial product. Use heavily processed/anonymized, or prefer anonymous CC0
  voices. Internet Archive / Miller Center host PD copies.
- **Internet Archive & Wikimedia Commons** — old-time radio, PD broadcasts (US
  sound recordings pre-1923 are PD under the Music Modernization Act; the PD line
  advances yearly), CC/PD speech files. Check each item's tag.

**Number stations — build, don't pillage.** Shortwave spy-station digit-speech is
the platonic cyberpunk vox (eerie, encoded, multilingual). The trap: the famous
compilation, **The Conet Project**, is *free to share* under Irdial-Discs' policy,
but Irdial **asserts copyright on its recordings** ("the distortions, nuances and
noises make it distinct") and **enforced it commercially** — Wilco's *Yankee Hotel
Foxtrot* sample ended in a paid settlement. So treat **Conet as reference/
inspiration only, not a commercial asset**; raw Archive.org number-station
uploads are murky for the same reason (copyright attaches to the *recording*, not
the unknowable broadcast).

The clean path is to **generate one from CC0 parts** — exactly what this engine is
for. It becomes a small **generative vox module**, not a pillaged sample:

- **Voice:** sequence the CC0 **Common Voice** digit clips in **groups of five**
  ("…drei · sieben · neun · zwei · fünf…"). Common Voice covers **German, Russian,
  and Mandarin Chinese** (and the single-word digit segment spans 34 languages); any
  language the segment lacks still has spoken digits to extract from the full CC0
  corpus. Multilingual by construction — and clean.
- **Interval signal:** synthesize a **public-domain folk melody** on a music-box /
  celesta patch — *The Lincolnshire Poacher* (English folk tune, PD) is the
  canonical one. *(Caution: "Swedish Rhapsody" = Hugo Alfvén, 1903, d. 1960 — may
  still be under copyright in life+70 territories; prefer a clearly-PD tune or an
  original motif.)*
- **The Buzzer (UVB-76):** literally a monotonous buzz tone — **synthesize it
  directly**; iconic, zero rights issue.
- **Shortwave bed:** filtered noise, slow fading (HF flutter), heterodyne whistles —
  all on the FX bus.
- **Ready-made shortcut:** **Freesound** hosts hobbyist number-station *recreations*;
  filter for **CC0** and drop them in (verify each clip's license).

**Vintage broadcast & pre-1926 public-domain audio.** A lovely idea — and both
halves of it land on the same punchline: **1926 is the birth year of commercial
broadcasting**, so the cutoff sits *just before* the thing being asked for.

- **The 2026 PD line:** published works (sheet music, compositions, scripts) from
  **≤1930** are PD; **sound recordings from ≤1925** are PD (Music Modernization
  Act's 100-year term; pre-1923 cylinders PD since 2022). So "pre-1926 *recordings*"
  is exactly right — they're unambiguously clear now.
- **The jingle irony:** the radio jingle was *invented in late 1926* — "Have You
  Tried Wheaties?", WCCO Minneapolis, **24 Dec 1926**, universally cited as the
  first-ever radio jingle. So **pre-1926 commercial jingles essentially don't exist
  as a category** (and the Wheaties recording itself isn't PD until 2027 — plus its
  tune borrowed the popular "Jazz Baby," separately ©). Same story for shows: **NBC
  (1926) / CBS (1927)** and most radio drama postdate the cutoff, so **pre-1926
  radio programming is nearly an empty set** too.
- **What *is* richly PD and on-texture:** early commercial *recordings* of 1901–1925
  — ragtime, hot jazz, dance bands, Tin Pan Alley, vaudeville, novelty, military
  bands (1925 Louis Armstrong / Bessie Smith sides are now PD). Exactly the crackly
  antique-broadcast color you want, chopped/glitched under a cyberpunk scene. Best
  sources:
  - **UCSB Cylinder Audio Archive** — states plainly that pre-1923 cylinders are PD
    and "can be freely downloaded and used for whatever purpose, commercial or
    non-commercial." Cleanest direct download.
  - **LoC Citizen DJ** — PD audio packaged *for sampling*, rights pre-cleared; built
    for precisely this use.
  - **LoC National Jukebox** — 10k+ Victor recordings 1901–1925; use the PD-cleared
    sets (the classical subset is flagged free to reuse without restriction).
  - **Great 78 Project (Internet Archive)** — digitized 78s; pre-1926 sides are PD
    (check each record's date).
- **Old-time radio (use with care):** the Internet Archive OTR collection circulates
  as "ostensibly PD," but post-MMA the old "pre-1972 = no copyright" rule is
  **outdated** — golden-age (1930s–50s) *recordings* are still protected on the MMA
  schedule (1947–56 → +110 yr; 1957–Feb 1972 → 2067), and **scripts + trademarked
  characters** (Superman, The Lone Ranger) carry separate rights regardless. Fine as
  reference / non-commercial flavor; for a commercial build, prefer the unambiguous
  **pre-1926 recordings** vein above.

**Early Bible / scripture spoken word.** Degraded scripture-reading is a potent
dystopian-prophet texture (King James cadence, Revelation / Ecclesiastes), and it's
very clearable — just keep **text** (the translation) and **recording** as two
separate copyright questions:

- **Text (translation):** the **KJV is public domain in the US** (the Revolution
  voided the Crown's printing patents) but sits under **perpetual Crown copyright in
  the UK** — only Cambridge UP may print it there — a wrinkle that bites only if you
  distribute in the UK. Sidestep it entirely with translations that are **PD
  worldwide / unambiguous**: **World English Bible** (explicitly *dedicated to the
  public domain*, modern English — the cleanest pick), **ASV 1901**, **Douay-Rheims
  1899**, **Young's Literal 1862**, **Darby 1867**, **JPS 1917** (Tanakh), **Luther**
  (German). Anything published ≤1925 is US-PD. Avoid modern © translations
  (NIV / ESV / NASB / NKJV).
- **Genuine antique recordings:** pre-1926 scripture cylinders & 78s (Lord's Prayer,
  Psalms, sermons) exist and are now PD — dig the **UCSB Cylinder Audio Archive**
  (cf. "Scripture via Phonograph"). Real crackle, but a thin, scattered corpus.
  *Note:* the first **complete** recorded Bibles are the 1944 / 1951 AFB "Talking
  Books" (KJV) — those recordings are still under copyright; don't use them.
- **Clean & abundant — the practical default:** **LibriVox** has the whole Bible in
  several PD translations (KJV 1769 Oxford, ASV, WEB, Douay…) plus passage and
  dramatized collections, all **public-domain-dedicated** and mirrored on
  archive.org — modern clean reads you **degrade / reverb / chop** to taste, and
  multilingual (e.g. the German Luther Bible).
- **Heads-up (non-legal):** scripture in a game is culturally/religiously sensitive —
  a creative-judgment call, not a rights one. Heavy processing + abstract passages
  keep it *texture*, not sermon.

**Two legal rules to carry:**
1. **US-gov PD (§105) does not extend to foreign governments** — Crown Copyright,
   Bundesregierung, etc. are *not* auto-PD. For foreign-language vox, prefer **CC0
   datasets (Common Voice)** and **LibriVox (PD dedication)**, not foreign state
   recordings.
2. **Recording ≠ likeness.** Even a PD recording can carry a **right of publicity**
   if a recognizable individual's voice is identifiable in a commercial game.
   Anonymous CC0/LibriVox speakers + heavy processing (bitcrush, stutter, formant
   shift — all already on the FX bus) keep us clean and fit the aesthetic anyway.

**Net:** Common Voice (CC0) + LibriVox (PD) for multilingual chops; NASA for English
radio color (processed); FluidR3/synth-formant for pads. Skip recognizable-voice
politician audio in anything commercial unless heavily anonymized.

---

## 12. Suggested build phases (for when code starts)

1. **Skeleton + one genre.** Port the core (scheduler, context, mixer, zones) and
   ship techno: synth kick/bass/hat/clap + one pattern. Prove the step clock.
2. **The pump + arrangement.** Add sidechain + the arrangement Markov + filter
   automation. Now it *moves*.
3. **Voices out.** Supersaw pad/lead, arp, 303 accent/slide, reese, FM → unlock
   trance + acid + psytrance + synthwave.
4. **Grit + hybrid.** Distortion/bitcrush bus + the sampler foley layer → industrial.
5. **Editors.** Port the context tuner; build the sequencer authoring tool.
6. **Free genres.** House, dub techno, ambient via presets only.
7. **Mechanism genres (optional).** Breakbeat sequencer (DnB/breaks); stutter
   engine (IDM/glitch).

---

## 13. Open questions & risks (resolve during the build)

- **CPU / polyphony budget — the main technical risk.** The jazz engine is *one*
  combo; this stacks many synth voices (supersaws are 6–12 oscillators *each*) plus
  the FX bus, sidechain, and modulation, live in the browser. Plan for **voice
  pooling / polyphony caps**, reuse of `AudioWorklet`/`OscillatorNode`s, and moving
  heavy DSP (bitcrush, the modulation matrix) off the main thread. Validate the
  worst case (industrial + full FX) early — ideally in build Phase 2 — and let it
  bound how lavish the modulation matrix and per-genre layer counts get.
- **District taxonomy is game-dependent.** The §9 districts are *illustrative*; the
  real set comes from the actual cyberpunk game's map and zones. Treat the
  context-key scheme as fixed and the district list as TBD.
- **MVP vs. the full performance layer.** The FX companion's full feature set
  (moves system, modulation matrix, all reverb/delay modes, resampling) is the
  *destination*, not the MVP. Keep the early phases lean (§12); add performance
  features once the core mix holds up under the CPU budget.
- **Demo/bounce determinism.** Bounced demo tracks want to **pin a seed** to stay
  reproducible (renders otherwise differ sample-for-sample; the spectral *shape* is
  stable — see the FX companion §7 and `docs/AUDIO_MCP.md`).
- **Hybrid sample footprint.** Decide a size ceiling for `samples/` (the jazz
  engine's curated set is a precedent) so the "relaxed no-audio-files" claim stays
  honest; favour synthesis + self-resampling over vendored audio where either will
  do.

---

## 14. GPU acceleration & audio-reactive visuals

**Short verdict: don't synthesize the *audio* on the GPU — but do drive the
*visuals* from the audio on the GPU.**

### Why not GPU audio synthesis (here)
- **Latency vs. throughput.** GPUs are throughput machines; real-time audio needs
  *low-latency*, sample-accurate, 128-sample-block processing on a dedicated
  high-priority thread. The dominant 2026 browser stack is **Web Audio (native
  nodes) + WebAssembly (DSP) + `AudioWorklet` (the RT thread)** — not compute
  shaders.
- **No browser bridge.** There's no zero-copy path between **WebGPU** (its own
  context/thread) and `AudioWorklet`; you'd ferry buffers across threads, adding
  latency and jitter — the enemy of glitch-free audio. WebGPU-for-audio is
  experimental, not a production pattern, and **Safari still lacks WebGPU compute
  shaders** (as of mid-2025) — a portability hole for a browser game.
- **Our load is tiny by GPU standards.** A handful of supersaws (6–12 osc each) + a
  few drum voices + the FX bus is exactly what native Web Audio + a couple of
  `AudioWorklet`s handle trivially on CPU (§13). GPU would add complexity and a
  Safari gap to solve a problem we don't have.
- **"Drivers"?** In a browser you don't write GPU drivers — the API is **WebGPU**
  (WGSL compute) / WebGL. For audio here, you simply wouldn't reach for it.

### Where GPU audio *is* real (just not our profile)
GPUs do real-time audio well for **massively parallel, throughput-heavy** jobs:
million-sinusoid additive synthesis, multi-million-point FFTs, huge FIR, big
**partitioned convolution reverb**. If the engine ever wanted *enormous*
granular/additive clouds or very long convolution, GPU (or WASM-SIMD) would be the
lever. Today our voice counts don't need it, and Web Audio's native `ConvolverNode`
already covers convolution.

### The real GPU win: audio-reactive shaders (the cyberpunk look)
The GPU's natural home is the **visuals**, driven *by* the music — and a neon /
glitch / scanline aesthetic begs for it. The mature, well-supported pattern:

1. Tap the engine with an **`AnalyserNode`** (FFT + time-domain) — a tiny,
   **read-only** addition that fits the engine's stance: the renderer *watches*
   the audio; nothing flows back into game logic or the seed.
2. Feed the FFT bins to a **fragment shader** as uniforms or an FFT-as-texture
   (Shadertoy-style); render a full-screen quad per frame reacting to bass/mid/high
   energy, onsets, and the sidechain pulse.
3. **WebGL** is the safe universal baseline; **WebGPU/WGSL** where available.

"Shaders for that," done right: **shaders for the look, CPU for the sound.** GPU
float nondeterminism is a non-issue here (visuals and audio both sit outside the
determinism surface) — as long as the GPU stays clear of the game RNG.

---

## Sources

- [The definitive guide to producing techno (MusicRadar)](https://www.musicradar.com/news/techno-guide-2023)
- [How to Produce Techno — step-by-step](https://electronics.alibaba.com/question/techno-production-guide-how-to-start-improve)
- [Trance Music Production (LANDR)](https://blog.landr.com/trance-music-production/)
- [Trance Song Structure: Breakdown Basics (Myloops)](https://www.myloops.net/trance-song-structure-breakdown-basics)
- [What is Trance Music? (Splice)](https://splice.com/blog/what-is-trance-music/)
- [Electronic body music (Wikipedia)](https://en.wikipedia.org/wiki/Electronic_body_music)
- [Roland TB-303 (Wikipedia)](https://en.wikipedia.org/wiki/Roland_TB-303)
- [How To Make a TB-303 Bassline (Syntorial)](https://www.syntorial.com/tutorials/roland-tb-303-bassline/)
- [Roland TR-808 (Wikipedia)](https://en.wikipedia.org/wiki/Roland_TR-808)
- [Roland TR-909 (Wikipedia)](https://en.wikipedia.org/wiki/Roland_TR-909)
- [Recreate classic analogue drum sounds (MusicRadar)](https://www.musicradar.com/how-to/how-to-recreate-classic-analogue-drum-sounds-in-your-daw-and-with-hardware)
- [9 Trance Chord Progressions (Unison)](https://unison.audio/trance-chord-progressions/)
- [Understanding Scales & Modes in Psytrance (Outerverse)](https://outerverse.fm/blogs/tutorials/understanding-scales-modes-in-psytrance)

**Sample, vox & spoken-word sourcing (§11):**

- [Freesound (CC0/CC sounds database)](https://freesound.org/)
- [Pixabay — royalty-free sound effects (machinery/industrial, no attribution)](https://pixabay.com/sound-effects/search/industrial/)
- [Producer Space — CC0 sample packs](https://producerspace.com/)
- [Sonniss #GameAudioGDC bundle license](https://sonniss.com/gdc-bundle-license/) · [archive](https://sonniss.com/gameaudiogdc/)
- [GeneralUser GS soundfont (S. Christian Collins)](https://www.schristiancollins.com/generaluser.php)
- [NASA images & media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- [U.S. Copyright Act §105 — works of the US government (Wikipedia: Copyright status of works by the federal government)](https://en.wikipedia.org/wiki/Copyright_status_of_works_by_the_federal_government_of_the_United_States)
- [Mozilla Common Voice — CC0 multilingual speech corpus](https://commonvoice.mozilla.org/en/datasets) · [languages](https://commonvoice.mozilla.org/languages)
- [Common Voice 7.0 — Single Word Target Segment (digits 0–9 + yes/no, 34 languages)](https://datacollective.mozillafoundation.org/datasets/cmkzhp64p00wlno07elrmt20y)
- [LibriVox — public-domain audiobooks (multilingual)](https://librivox.org/pages/public-domain/)
- [NASA Historical Sounds (official MP3/M4R)](https://www.nasa.gov/historical-sounds/)
- [NASA Audio Highlight Reels (Internet Archive)](https://archive.org/details/NasaAudioHighlightReels) · [NASA Launch Audio](https://archive.org/details/NasaLaunchAudio) · [Apollo 11 Audio](https://archive.org/details/Apollo11Audio)
- [Apollo 11 Onboard Recordings, 1969 (Public Domain Review)](https://publicdomainreview.org/collection/apollo-11-onboard-recordings-1969/)
- [The Conet Project (Wikipedia — free-share policy + Irdial copyright claim)](https://en.wikipedia.org/wiki/The_Conet_Project)
- [Wilco settle Conet sample suit (Rolling Stone)](https://www.rollingstone.com/music/music-news/wilco-settle-sample-suit-244171/)
- [Lincolnshire Poacher numbers station (Wikipedia)](https://en.wikipedia.org/wiki/Lincolnshire_Poacher_(numbers_station))
- [Public Domain Day 2026 — works from 1930, recordings from 1925 (Duke CSPD)](https://web.law.duke.edu/cspd/publicdomainday/2026/)
- ["Have You Tried Wheaties?" — first radio jingle, 24 Dec 1926 (Library of American Broadcasting)](https://exhibitions.lib.umd.edu/libraryofamericanbroadcasting/featured/jingles)
- [UCSB Cylinder Audio Archive — copyright & licensing (pre-1923 cylinders PD)](https://cylinders.library.ucsb.edu/licensing.php)
- [LoC Citizen DJ — public-domain audio for sampling](https://citizen-dj.labs.loc.gov/)
- [LoC National Jukebox — early commercial recordings 1901–1925](https://www.loc.gov/collections/national-jukebox/about-this-collection/)
- [Old Time Radio Researchers — copyright policy](https://otrrlibrary.org/copyright.html)
- [Which Bible versions are in the public domain (ASV/WEB/Douay/Young's…)](https://inspiringtips.com/which-bible-versions-are-in-the-public-domain/)
- [World English Bible — dedicated to the public domain (Wikipedia)](https://en.wikipedia.org/wiki/World_English_Bible)
- [Bible (KJV), Complete — LibriVox (PD audio)](https://librivox.org/bible-complete-king-james-version/)
- [Scripture via Phonograph (American Bible Society)](https://news.americanbible.org/article/scripture-via-phonograph)

**GPU & audio-reactive visuals (§14):**

- [AudioWorklet — low-latency audio on a dedicated thread (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet)
- [Audio processing in WebGPU (experimental)](https://www.webgpusound.com/docs/category/audio-processing-in-webgpu)
- [Realtime GPU Audio — finite-difference synthesis on GPUs (ACM Queue)](https://dl.acm.org/doi/10.1145/2466486.2484010)
- [Real-time additive synthesis with one million sinusoids on a GPU](https://www.researchgate.net/publication/239443436_Real-time_additive_synthesis_with_one_million_sinusoids_using_a_GPU)
- [Build a music visualizer with the Web Audio API (AnalyserNode FFT → shader)](https://noisehack.com/build-music-visualizer-web-audio-api/)
- [Audio-Shader-Studio — WebGL audio-reactive shaders](https://github.com/sandner-art/Audio-Shader-Studio)
