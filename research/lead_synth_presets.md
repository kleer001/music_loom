# Lead-synth presets & real settings — the synth-geek reference

Concrete, *sourced* synthesizer settings for electronic-music **lead/signature** sounds, gathered to
ground the cyber engine's lead voices in real numbers instead of guesswork. Every entry is tiered:

- **[HARD]** — measured/reverse-engineered coefficients, factory-preset panel dumps, or manual specs.
- **[RECIPE]** — a published how-to with numbers, but for a recreation (not the original session).
- **[LORE]** — broad tutorial/forum consensus; technique solid, exact numbers unverified.
- **[GEAR]** — the original gear is documented but no settings were published.

> Fetch caveat: in this environment WebFetch is HTTP-403 on most non-GitHub hosts, so the numbers
> below came from search snippets + GitHub-hosted source code. GitHub raw URLs are fetchable; the
> Szabo PDF / ReverbMachine / Syntorial are not (their values are quoted second-hand where noted).

---

## 0. Yes — there *is* a synth-geek preset library. Several. (Ranked by parseability.)

The cleanest path to *real* numbers is **Vital presets, which are literally JSON** (`osc_*`,
`filter_*_cutoff`, `env_*_attack…release`, `lfos[]`, `modulations[]`). You can `JSON.parse` them
straight into a voice model.

| Rank | Source | Format | License | Notes |
|---|---|---|---|---|
| 1 | [atsushieno/open-vital-resources](https://github.com/atsushieno/open-vital-resources) | `.vital`/`.vitaltable` (JSON) | **CC0** | Cleanest license; mostly wavetables/LFOs. |
| 1 | [Miserlou/VitalPresets](https://github.com/Miserlou/VitalPresets) | `.vital` (JSON) | unstated | 1,124+ full presets — best *volume* of lead/bass JSON to mine. |
| 2 | [instatetragrammaton/Patches](https://github.com/instatetragrammaton/Patches) | per-synth (Vital JSON, Surge, DX7, Synth1, Sylenth1…) | **CC-BY-4.0** | One licensed, original-work archive across many synths. |
| 3 | [surge-synthesizer/surge](https://github.com/surge-synthesizer/surge) `resources/data/patches/` | `.fxp` (binary hdr + **XML** body) | GPL-3 | Named params; parser to crib: [surgeon](https://github.com/ToddHartmann/surgeon). |
| 4 | DX7 `.syx`: [csantinc/DX7-repo](https://github.com/csantinc/DX7-repo) (AllTheWeb set), [jphaenlin/DX7-patches](https://github.com/jphaenlin/DX7-patches) | `.syx` (32 voices, 155 params, bit-packed) | unclear | Layout bible: [dexed `Documentation/sysex-format.txt`](https://github.com/asb2m10/dexed). Decoders: [DX7Sheet](https://github.com/Banana71/DX7Sheet), [NeuralDX7](https://github.com/Nintorac/NeuralDX7) loader. |
| 5 | Synth1 (Nord-Lead-style VA): [archive.org synth1_202202](https://archive.org/details/synth1_202202) (~25k presets) | `.sy1` | murky | Off-GitHub megapack; `.sy1` decoder ref: [Synth1GAN](https://github.com/jskripchuk/Synth1GAN). |

**Recommendation:** mine **Vital JSON** (CC0 `open-vital-resources` + CC-BY `instatetragrammaton`)
for distributions; use **DX7 AllTheWeb** (decoded via DX7Sheet) for authentic FM ratio/index/EG data.
Two plug-ready Szabo implementations in C: [house-of-houses/ubersaw `supersaw.cpp`](https://github.com/house-of-houses/ubersaw/blob/main/src/supersaw.cpp)
and [whistlegraph/aesthetic-computer `gm_synth.c`](https://github.com/whistlegraph/aesthetic-computer/blob/main/fedac/native/src/gm_synth.c).

---

## 1. Canonical archetype recipes (numbers we can plug in)

### 1.1 JP-8000 "Super Saw" — Adam Szabo thesis **[HARD]**
7 saws (1 center + 6 sides). The engine already vendors these (`SZ_DETUNE`, `szCenterGain`,
`szSideGain`, the note-tracking HPF in `voices.js`). Recorded here for completeness.

- **7 detune offset multipliers** (played-freq × `1 ± off·detune`): center = 0;
  `±0.01952356, ±0.06288439/0.06216538, ±0.11002313/0.10745242` (asymmetric — Szabo's measured set).
- **Detune knob → spread**: an **11th-order polynomial** (musical: gentle low, aggressive top).
  Full coefficients in `ubersaw/supersaw.cpp` if we ever want the exact knob curve.
- **Mix curves**: `centerGain = -0.55366·m + 0.99785`; `sideGain = -0.73764·m² + 1.2841·m + 0.044372`
  (center fades, sides rise super-linearly as mix↑). Engine matches.
- **HPF** at the playing fundamental thins the detuned low pile-up. Engine does `hp = f*0.5`.
- Per-family detune scalar (from `gm_synth.c`): **ensemble/lead 0.6, pad 0.5**.
- Sources: [Szabo PDF](https://www.adamszabo.com/internet/adam_szabo_how_to_emulate_the_super_saw.pdf) ·
  [Shore analysis](https://static1.squarespace.com/static/519a384ee4b0079d49c8a1f2/t/592c9030a5790abc03d9df21/1496092742864/An+Analysis+of+Roland's+Super+Saw+Oscillator...pdf) · the two GitHub ports above.

### 1.2 Alpha Juno "What The…!" Hoover / Mentasm — factory preset **[HARD]**
Eric Persing's factory patch (Beltram "Mentasm", Human Resource "Dominator"). Panel dump (widely
reproduced, consistent across two sources):
```
DCO RNG 32 | DCO LFO 0 | DCO ENV 127 (downward pitch dive) | DCO BEND 05
PULSE 03 + SAWTOOTH 03 (PWM pulse AND PWM saw mixed) | SUB 05, SUB LEVEL 03 | NOISE 01
PW/PWM 127 (max) | PWM RATE ~100–102 | VCF FREQ 77, VCF ENV 75, VCF LFO 75
CHORUS ON, CRS RATE ~90–92 (extreme swirl) | LFO RATE ~39
```
Defining moves: `DCO ENV 127` = the downward portamento dive; `PW/PWM 127 @ rate ~100` = the
screaming modulated-pulse; extreme chorus = the swirl. **2 PWM waves (saw+pulse) + sub + noise.**
→ grounds the (currently orphaned) `hoover` voice **and** validates `pwmLead` (PWM-saw is the signature).
Sources: [Sonicstate](https://sonicstate.com/news/2026/03/03/the-hoover-a-joke-preset-which-defined-an-era/) ·
[Wikipedia Alpha Juno](https://en.wikipedia.org/wiki/Roland_Alpha_Juno) · [DOA hoover thread](https://www.dogsonacid.com/threads/tutorial-hoover-synthesis.356821/).

### 1.3 TB-303 acid **[HARD on dynamics]**
- **Filter:** diode ladder behaving as **~18 dB/oct (3-pole)** (physically 4-pole; pole interaction).
- **Decay:** non-accented **200 ms – 2 s**; **accented = fixed 200 ms** (fast). Slide = **60 ms**.
- **Accent → filter:** accent simultaneously raises level **and** adds a fast filter-env kick via the
  Accent Sweep (cutoff depth scaled by resonance) — the per-step "squelch."
- **Calibration datum:** C1, cutoff 50%, saw, res 100% → resonant peak ≈ **500 Hz**. Lows (30–60 Hz) rolled off.
→ grounds `acidLead` (use the engine's 4-pole ladder via `extras.makeFilter`; accent multiplier on env depth; 60 ms glide).
Sources: [Whittle/firstpr](https://www.firstpr.com.au/rwi/dfish/303-unique.html) ·
[Stinchcombe diode ladder](https://www.timstinchcombe.co.uk/index.php?pge=diode) · [Devil Fish manual](https://www.firstpr.com.au/rwi/dfish/Devil-Fish-Manual.pdf).

### 1.4 FM brass/lead — Chowning **[HARD theory]**
- Carrier:modulator **1:1** (harmonic). **Modulation index env 0 → ~5**, run **parallel to the amp
  envelope** (index ∝ amplitude = the "brass swell" brightening as it gets louder).
- Sideband rule: significant pairs ≈ **I + 1** (I=5 → ~6 pairs). Non-integer ratios → metallic/bell.
- DX7 "BRASS 1" = **Algorithm 22** (3 carriers); exact per-operator bytes live in patch DBs, not memory.
→ grounds an **index-envelope** upgrade to `fmLead`/`fm` (the defining FM expressive param the engine lacks).
Sources: [Chowning 1973 (CCRMA)](https://ccrma.stanford.edu/sites/default/files/user/jc/fm_synthesis_paper.pdf) ·
[Cycling74 FM](https://docs.cycling74.com/learn/articles/06_synthesischapter05/) · [DSPRelated FM](https://www.dsprelated.com/freebooks/sasp/Frequency_Modulation_FM_Synthesis.html).

### 1.5 PWM analog lead — Juno-106/60 manuals **[HARD]**
- LFO range: **106 = 0.1–30 Hz**, **60 = 0.3–20 Hz** (single delayed-triangle LFO → pitch / VCF / pulse-width).
- PWM modes: MANUAL (fixed width) or LFO (depth slider). Lead/pad sweet spot **~0.3–5 Hz**.
- Fatten by combining the PWM pulse with a slightly-detuned saw + the built-in chorus.
→ grounds `pwmLead` LFO defaults (rate ~0.3–5 Hz, depth = width swing). Sources: [Juno-106 specs](https://support.roland.com/hc/en-us/articles/201966419-Juno-106-Technical-Specifications) ·
[Juno-60 specs](https://support.roland.com/hc/en-us/articles/201955179-Juno-60-Technical-Specifications) · [KMM PWM](https://keithmcmillen.com/blog/simple-synthesis-part-6-pulse-width-modulation/).

### 1.6 Reese bass/lead **[LORE, consistent]**
2+ saws phase-cancelling; detune **±10¢** (subtle) to **±25¢** (classic); 4–8 unison voices; the
neuro signature is a **swept midrange parametric notch**, filter kept fairly open.
→ grounds `reeseLead` (detuned saws beating + slow filter LFO + light drive).

### 1.7 Unison detune in cents **[LORE]**
Tight/pro **~10–30¢**; lush **~15–25¢ with 5–8 voices**; **>40¢ = washy** (failure mode). Stereo width
is a *pan-spread* parameter, separate from cents. (If we implement Szabo's polynomial the knob picks cents for us.)

---

## 2. Per-song settings — our tribute set

| Tribute (song) | Gear / preset | Settings | Tier |
|---|---|---|---|
| **Trance_1** Fragma "Toca's Miracle" | **Clavia Nord Lead** arp + panning delay (prod. Ramon Zenker; TR-909, Waldorf Pulse bass, Access Virus) | gear only — narrow VA saw, not a JP-8000 | **[GEAR]** ([SOS](https://www.soundonsound.com/people/ramon-zenker-recording-fragmas-tocas-miracle)) |
| **Trance_3** iio "Rapture" | — (prod. Markus Moser) | no settings; canonical = pluck + dotted-8th delay | **[LORE]** |
| **ElectroHouse_2** Calvin Harris "Feel So Close" | — | G major, 128 BPM; "plucked synth + reverb + delay" | **[LORE]** |
| **BigRoom_1** SHM "One" | Sylenth1 (recreations) | **square, 5 voices, 45% detune, pitch-drop envelope**; intro lead = sped-up kick blurred to a tone | **[RECIPE]** ([KVR](https://www.kvraudio.com/forum/viewtopic.php?t=291512)) |
| **Dubstep_1** Knife Party "Internet Friends" | **NI Massive** growl | LFO (Curve1) → wavetable position of OSC1+OSC2; **Hard Clipper**; **Frequency Shifter** for formants | **[RECIPE]** ([ADSR](https://www.adsrsounds.com/ni-massive-tutorials/ni-massive-vocal-growl-bass/)) |
| **Synthwave_1** Kavinsky "Nightcall" (sibling of "Testarossa") | **TAL-U-NO-LX** (Juno-60) + Arturia Mini V4 bass + Prophet V | saw, plucked env; **filter-env amt 5.16, attack 68 ms, decay ~1.2 s, sustain 7.4**; 80s chorus, light distortion; **bass LPF 216 Hz** | **[RECIPE+]** ([ReverbMachine](https://reverbmachine.com/blog/how-kavinsky-created-nightcall/)) |
| **Synthwave_2** College "Teenage Color" | plugin synthwave (sibling "A Real Hero" = Prophet-5 V + Mini V4) | use the Juno/Prophet chorus-pad lineage | **[GEAR]** ([ReverbMachine Drive](https://reverbmachine.com/blog/drive-synth-sounds/)) |
| **Psy_2** 1200 Micrograms / Infected Mushroom | 303-style acid + FM screamers | high resonance + automated cutoff (see §1.3); FM index 4–6 metallic | **[LORE]** ([IDM Mag](https://idmmag.com/tech/tutorials/how-to-create-the-classic-acid-main-lead/)) |
| **ElectroHouse_1** Benny Benassi "Satisfaction" | saw → **band-pass**, modulated cutoff (3-osc) | the bend = modulating BPF cutoff (engine has `type:"bp"`) | **[RECIPE]** ([transient.studio](https://www.transient.studio/tutorials/satisfaction-benny-benassi)) |

---

## 3. deadmau5 specifics

- **Rig (DIRECT):** Sylenth1 (his tweet: "last four albums"); **FXpansion Strobe** (the synth the track
  is named after); **Xfer Cthulhu** for chords/arps; hardware **Access Virus / Nord Lead 3 / Moog Voyager
  / Prophet 12** into Ableton. Nord Lead 3 patch reported: **2 squares + mod-env on cutoff + LFO on the
  square *shape* (PWM) + unison** → again validates `pwmLead`.
- **"Strobe" lead [RECIPE]:** dual **saw**, 2nd osc **+5/+7 st or +1 octave**, **4–16 unison + small
  detune**, **low resonance + high filter drive**, a **slow LFO on cutoff + long manual cutoff
  automation** (the swell *is* the patch), minimal delay. → `stackLead`.
- **"Some Chords" stab [RECIPE]:** layered saws, **attack 0, ~4.5 ms decay, no sustain**, filter-env on a LP.
- **Sidechain [DIRECT doctrine]:** **LFOTool**, **1/8 rate**, drawn curve (volume LFO, not a comp). On
  pads he uses a real comp with **~50 ms attack** to a ghost kick. (Engine already has `makePump`.)
- **Per-layer EQ [DIRECT, with bands]:** lead **boost 500 Hz–5 kHz**, **high-pass the lows**; layer by
  role (growl / high-end / sub). → grounds `stackLead`'s per-layer `band` slices.
- **Headroom [DIRECT]:** master ≈ **−6 dB**; mastering = gain + dynamics + EQ.
- Sources: [Equipboard](https://equipboard.com/pros/deadmau5?gear=software-plugins-and-vsts) ·
  [Gearspace rig](https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1012532-deadmau5-live-setup-midi-syncing-synths.html) ·
  [MasterClass mixing](https://www.masterclass.com/articles/how-to-mix-tracks-with-deadmau5-the-musician-behind-i-remember) ·
  [Syntorial Strobe](https://www.syntorial.com/preset-recipe/deadmau5-strobe-lead/) · [edmtips Some Chords](https://edmtips.com/how-to-make-music-like-deadmau5-in-under-10-minutes/).

---

## 4. How these map onto the engine (numbers → voice)

| Engine voice / profile | Real settings it adopts |
|---|---|
| `SUPERSAW_PROFILES.nord` | Toca's Nord = narrow VA: **3 osc, ~8¢, mix 0.7** (engine's `voices≠7` symmetric model). |
| `SUPERSAW_PROFILES.jp8000` / `.bigroom` | Szabo 7-osc; bigroom wider (~20¢, hotter side gain). SHM "One" = square/5/45% as an alt. |
| `hoover` (orphaned → wire in) | Alpha Juno sheet §1.2: PWM saw+pulse, sub −2 oct, **DCO ENV 127 pitch-dive**, extreme chorus. |
| `pwmLead` (new) | Juno PWM §1.5: LFO **0.3–5 Hz** on pulse width; + detuned saw + chorus. (Strobe/Nord-3/Feel-So-Close.) |
| `acidLead` (new) | TB-303 §1.3: 4-pole ladder, **accent→cutoff**, decay 200 ms–2 s, **slide 60 ms**. (Speed Freak.) |
| `reeseLead` (new) | §1.6: 2–3 saws **±10–25¢** beating + slow filter LFO + light drive + mid notch. (Internet Friends.) |
| `fmLead` (index-env upgrade) | Chowning §1.4: ratio 1:1, **index env 0→~5 tracking amp**; index 4–6 = psy metallic. |
| `stackLead` (new) | deadmau5 §3: dual saw + square (+oct), **per-layer band 500 Hz–5 kHz + HPF lows**, small detune, slow cutoff LFO. |
| synthwave `sawLead` | Nightcall §2: **filter-env amt 5.16, A 68 ms, D 1.2 s, S 7.4**, chorus + light drive. |

---

## 5. Mined preset statistics (measured, not lore)

Derived by `scripts/mine_presets.mjs` from **82 Vital presets** (the CC-BY-4.0
[instatetragrammaton/Patches](https://github.com/instatetragrammaton/Patches) `Matt Tytel Vital`
folder — JSON, so the numbers are read straight from real sound-design work). Full output in
`research/mined_preset_stats.json`. Vital→musical unit conversions (cutoff MIDI→Hz, lfo log2→Hz,
detune `range·(d/10)^power`, env≈seconds) are documented in the script header; detune/env are
**approximate**.

**Honest caveat:** Vital ships strong defaults (detune ≈ 59.8¢, decay 1.0 s, sustain 1.0, attack
0.15 s, release 0.55 s, LFO 2 Hz), and many designers leave a field untouched — so medians that
equal those defaults are weak signal. The **deviations from default** are the real findings.

| Field | **Lead** (n=14) | **Bass** (n=9) | **Pad** (n=10) | Reading |
|---|---|---|---|---|
| osc count | **med 3** (p25 1 – p75 3) | 2–3 | 2 | **Leads layer** — confirms the `stackLead` premise (multi-osc is the norm). |
| unison voices | 1 (p75 **3**) | 1 (p75 3) | 2 | Modest unison + detune, not always huge stacks. |
| detune ¢ | **p25 16 → p75 60** | (defaults) | p25 18 → p75 60 | Matches the §1.7 tiers: tight 16¢ … lush 60¢. `nord`≈8¢ sits just below "tight." |
| cutoff Hz | med 368 (p75 **1968**) | 540 | 282 | Leads run brighter/wider than pads; big spread (the filter *moves*, so the static value varies). |
| resonance | **0.14** | 0.0 | 0.38 | Leads carry mild resonance; pads more. |
| attack s | **0.15** | 0.15 | 0.83 | Leads/bass fast; pads slow — as expected. |
| release s | **0.55** | 0.55 | 1.22 | Leads medium tail; pads long. |
| LFO Hz | med 2 (p75 **5.2**) | 2 | med 2 (p25 **0.36**) | Lead modulation ~2–5 Hz (vibrato/PWM band, §1.5); pads slower. |

**What this changes in the build:** corroborates (a) `stackLead` as default (leads really are
multi-osc), (b) the detune range (tight≈16¢ for `nord`-ish, lush≈60¢ for wide profiles), (c) the
vibrato/PWM LFO defaults (~2–5 Hz), (d) lead filter resonance ~0.14 and a fast attack / medium
release baseline. Where the canonical §1–§2 numbers are sharper (Nightcall env, 303 decay/slide,
Alpha-Juno sheet, Szabo coefficients) those win; the mine fills the gaps and confirms the ranges.
</content>
