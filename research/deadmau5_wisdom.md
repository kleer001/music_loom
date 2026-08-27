# deadmau5 (Joel Zimmerman) — production wisdom, hot takes & counter-opinions

Mined from his livestreams, MasterClass, interviews/AMAs, and his (in)famous blog
rants, for electronic-music-production nuggets — especially the bits that map onto
the procedural cyber engine. Gathered by fan-out web research, 2026.

> **Sourcing & honesty.** `WebFetch` was **HTTP 403-blocked** on every primary page
> this session, so everything below is **paraphrased from search-result snippets**,
> not full pages/VODs. Confidence is flagged: **[his own]** (MasterClass / a verified
> quote) · **[corroborated]** (multiple reputable sources) · **[style]** (community
> "deadmau5-style" recreation, not a verified statement by him). Verify load-bearing
> quotes against the originals (Wayback Machine works where direct fetch 403s).
> His **MasterClass** ("deadmau5 Teaches Electronic Music Production", 2016, 23
> lessons) is the highest-confidence teaching source and overlaps his stream content.

## Engine-actionable highlights (for `neo_cyber_music`)

The bits that translate directly to our levers:

- **The pump is a *volume* LFO, not a compressor** → matches our `gate`/sidechain volume-modulation approach over a true compressor. Classic rate **1/8-note**, fast drop + curved recovery `[corroborated]`.
- **Leave ~−6 dB headroom; master is light-touch** (gain + dynamics + a little EQ) → vindicates the hot-bus trim work; aim the mix below 0 dBFS, not into the limiter `[his own]`.
- **8 bars that loop forever, then *vary* — don't formula-drop** → our arrangement/`buildArrangement` + the "strip all drums in the breakdown, same key" move `[his own]`.
- **Supersaw = unison + detune + stereo spread; layer multiple instances**, each slightly different, **each EQ'd to a narrow band** so they don't fight → our `supersaw` voices/detune + per-source profiles + `voiceUnder` ducking `[his own]`.
- **Rolling 16th bass between root notes + ~30–50% swing**; quick fills/octave-jumps before transitions → our `rolling16` bass template + `tempo.swing` `[corroborated/style]`.
- **Minor i/iv/v mode-mixing** for the wistful color (Some Chords = G#m/C#m/D#m) → mode/voicing choices `[corroborated]`.
- **Reverb → delay chain; un-synced ping-pong** for less grid-locked space → our delay/reverb FX `[style]`.
- **Grit comes from leaving the box** — all-soft-synth "sounds like a MIDI file"; he wants hardware character → our drive/tape coloration is the in-engine stand-in `[corroborated]`.

---

## 1 · Production techniques

### Sidechain / "the pump" (corrected)
- **His actual move is Xfer LFOTool (a tempo-synced *volume* LFO keyed to the kick), not a sidechain compressor.** A drawable duck — fast initial drop, slow curved recovery — at a **1/8-note** rate is the classic deadmau5/Kaskade feel; "everything else gets piped into one or more LFOTool sidechain busses to feed off the kick." `[corroborated]` (Gearspace "Kick Insight"; Hyperbits)
- The widely-taught **compressor** version (kick → key input; attack ~10–20 ms to keep the kick transient, release ~50–100 ms, ratio 4:1+) is the *generic approximation* of his sound, not what he does. `[style]`
- **Ghost/dummy-trigger** sidechain: drive the duck from a muted trigger track so you can swap/retune the audible kick without changing the pump (or create ducking that isn't in the drum part). `[corroborated]`
- Audible proof: in **"Ghosts 'n' Stuff,"** Rob Swire's vocal ducks on every kick. `[corroborated]`

### Harmony / bass
- **Minor i/iv/v mode-mixing** — the chords on the 1st/4th/5th degrees rendered minor (Some Chords: G#m, C#m, D#m). `[corroborated]`
- **"Strobe"** ≈ A♭ minor, 128 BPM; recurring F#, G#m, C#m, E. **"I Remember"** ≈ B minor (B/D/G/F#). `[corroborated]` (spellings vary by transcription)
- **Reuse a progression by swapping one chord** on the repeat so it reads new; **hold the bassline unchanged** under the changing chords. `[style]`
- **Rolling 16th bass**: keep roots, insert syncopated 16th movement for momentum; **~30–50% swing** so off-beat 16ths sit late; quick rolls/octave-jumps before breakdowns. `[corroborated/style]`
- **Suspended/unresolved chords** under a soaring melody for hypnotic build tension (Strobe). `[style]`

### Sound design
- **Saw + square are the backbone** (saw for bright, harmonic-rich aggression); a humming bass drone = a few saw/square oscs → low-pass, played low. `[his own]` (MasterClass)
- **Unison + detune + stereo spread** for the supersaw; **layer multiple instances** of the same synth, each with slightly different detune/envelope/waveform (offset layers to avoid phase issues). `[his own]`
- **"A synth is all the same"** — oscillators + filter + envelopes; load a saw, filter it, you understand any synth. Build patches from scratch over presets. `[his own]`
- **Sound design is disposable** — the April 25 2016 stream shows him crafting an elaborate patch then *junking it* because the idea matters more than the sound. `[corroborated]`
- **Multi-source leads** ("Some Chords" = squares + saws + electric-guitar samples, each narrow-EQ'd). **"Ghosts 'n' Stuff"** = organ layered with a synth to cut through, lead deliberately ~3 notes (counter-melodies were removed for the groove). `[corroborated]`
- **Pluck envelope**: super-fast attack, very short decay, with a low-pass filter envelope. `[style]`
- **Hardware palette**: Moog Voyager ("the last good Moog"), a ~30-ft modular wall (Moog DFAM×2, Mother-32, Subharmonicon; Behringer Neutron/Pro-1/K-2), an EMS-Synthi-style "Colossus" pin-matrix; software: Sylenth1, Massive, Serum, Arturia, Ableton as the DAW. `[corroborated]` *(the prompt's "Cirklon" sequencer was **not found** in any source — treat as unverified.)*

### Mixing / mastering
- **Leave ~−6 dB headroom** before mastering; "make it as good as possible before you touch mastering." `[his own]`
- **Self-masters everything** for ownership ("just another thing… that was mine"), conceding a pro might do better; mastering is just "volume gain, change in dynamics, and a bit of EQ tweaking." `[his own]`
- **Anti-loudness-war / pro-dynamics** — his tracks measure more dynamic than brick-walled peers ("Ghosts 'n' Stuff" high PSR). `[corroborated]`
- **Low-end trade**: kick keeps the sub (saturated/warmed); the bass's sub is EQ-carved to leave room. **Narrow-band carve each layer** of a stacked lead so the composite stays clear. `[corroborated]`
- **Bus chain (from his streams)**: drum bus → Waves API 2500 doing *minimal* (~0.5–1 dB) glue → UAD Shadow Hills on the master to set level/balance. `[corroborated]`

### Arrangement / workflow
- **Write 8 bars that loop indefinitely**; grow everything from that loop. `[his own]`
- **Vary, don't drop** — evolve the 8 bars with swells/dips/variations; the breakdown **strips all drums/percussion** and becomes "something completely different" in the same key. He names the intro/breakdown/hook formula and tries to depart from it. `[his own]`
- **Long, patient builds** — "Strobe" is ~10:33 with a >4-min intro that starts under-tempo and slides into the first chorus; reduces to just Drums/Bass/Lead/Square-melody. `[corroborated]`
- **Compose in pieces, not linearly** — root notes first, counter-melody layered after ("always in little pieces here and there"). **"Ghosts 'n' Stuff"** went through ~10 structural versions; note *placement/timing* (not new notes) drove the groove. `[his own]`
- **"Raise Your Weapon"** = a prog-house half later spliced to a separately-made dubstep half. `[corroborated]`

---

## 2 · Livestream & where the archives live

deadmau5 streamed studio sessions heavily (~2013–2018), building tracks from scratch, mostly solo — "a window… so you can look in and watch the process."

- **Live channels**: `twitch.tv/deadmau5` (`/clips`, `/videos`); old VODs by ID (e.g. `twitch.tv/videos/62852951` = the April 25 2016 "makes the synth and junks it" session). `[corroborated]`
- **Fan archives**: Internet Archive **"deadmau5 Livestream Tunes (2013–2015)"** (`archive.org/details/deadmau5livestream`, dated WIP .ogg captures); a YouTube "deadmau5 livestream archive" channel; the fan index `deadmau5archive.github.io`. `[corroborated existence]`
- **His paid archive**: `live.deadmau5.com`, the **"suckscription"** ($4.99/mo) — livestream content, WIP/early/unreleased tracks. `[corroborated]`
- **Stream → release pipeline**: "Midas' Heel" (built live, July 2017, fan-named) became **"Drama Free" (feat. Lights)**. `[corroborated]`
- **DAW gripes on stream**: criticized Bitwig's recording latency / missing plug-in delay compensation for *hardware* tracking — argues DAWs are built for VST users, not hybrid hardware rigs (he'd record hardware separately and import). `[corroborated]`
- **"The problem with music-production feedback"** clip — live viewer comments rarely change the real output (don't over-index on the chat / crowd-pleasing). `[medium]`
- **Monitors over the years**: Genelec 1035B (soffit-mounted), KRK VXT, latterly his own Telegrapher "RHINO" mau5head monitors. `[corroborated]`

---

## 3 · Interviews, AMAs & MasterClass

### Mindset / craft
- **"Experimentation, not inspiration"** — don't wait for the muse; mess with sounds. `[his own]` (named MasterClass chapter)
- **"Every producer copies — good ones copy in *new* ways"** — originality is *transforming* what you borrow, not avoiding borrowing; build sounds/processes "that can't be recreated" or found in a cookie-cutter sample pack. `[his own]`
- **Doubts & mistakes make you better** — his MasterClass is deliberately unprepared; he shows errors and the recovery. `[corroborated]`
- **Make music for your peers, not your fans** ("If I made music for my fans I'd still be writing shit like 'Faxing Berlin'"). `[verified-quote]` (NME 2016)
- A working method: **sleep-deprive into a less self-critical state** (works 9 PM–7 AM; ideas hit ~3–4 AM). `[verified-quote]`

### Technical
- **Mastering is demystified** — mostly gain, dynamics, a touch of EQ; he self-masters for ownership. `[his own]`
- **MIDI is obsolete; he wants OSC-native DAWs** — "an antiquated 60-year-old protocol… just have OSC!"; built a VST to bridge OSC/DMX because no DAW supports them natively. `[verified-quote]` (MusicRadar 2022)
- **Grit comes from leaving the box** — pure soft-synth tracks "sound like a MIDI file"; he wants real hardware in the chain. `[corroborated]`
- **Learn your tools cold; gear isn't the gate** — heard amazing work off "a little kid's laptop"; become "super familiar with the tools you're using." `[his own]`

### Gear (the "why")
- **Analog = tactile feel + *performing* a sound**, not just tone ("tiny nuances controllerism resolution can't achieve"); digital is "close enough" but never identical. `[verified-quote]` (AMA 2015)
- Beginner rec: a **small modular** (Pittsburgh Modular 1U) as a springboard. `[corroborated]`
- Owns the obsession: **"I have a severe gear acquisition syndrome"**; built the Modcan modular to "one-up Daft Punk." Computer is for **editing/arranging only** — sound design/performance happen in hardware. `[verified-quote]`

### Career / industry
- **Originality is your moat**; **don't anchor identity to a scene** ("I don't think I've ever really felt a part of any group"). `[verified-quote]`

---

## 4 · Hot takes & counter-opinions (with rebuttals)

His value here is provocation + the strongest pushback against each.

1. **"We all hit play"** (2012 Tumblr essay) — live EDM is largely pre-baked sequences (SMPTE-locked to lights); "anyone with minimal knowledge of Ableton… could DO what I'm doing"; the real skill is "in the goddamned studio." `[corroborated]`
   - **Counter (Peter Kirn / CDM)**: honest about *himself* but wrongly generalizes — plenty of artists sing/play/improvise live over enough bed to keep people dancing; he's "missing out on" that scene.
2. **"Beatmatching isn't a skill"** — and self-implicates ("I just… 'select' tracks and hit a spacebar").
   - **Counter**: DJ-craft is *selection/reading the room*, not counting to four; A Guy Called Gerald accused him of exploiting "the DJ system… nurtured for 25 years."
3. **Guetta "has two iPods and a mixer"**.
   - **Counter (Guetta — the strongest rebuttal)**: learned it "the hard way," six nights/week, eight-hour sets, reading crowds; "I've never played a pre-recorded set… I can teach a 10-year-old to beatmatch in a couple of hours" — i.e., the craft is crowd-reading.
4. **Against the formula** — "just 120 bpm with a kick on every quarter note"; finding good tracks is itself a chore.
   - **Counter (A-Trak, constructive)**: the answer isn't dismissing DJs but "a live performance with the flexibility to integrate true improvisation… give your audience something new every night."
5. **"EDM is dying because producers play it safe"** (+ "WOULD IT FUCKING KILL YOU to add modularity/showmanship beyond a fist in the air"). `[corroborated]`
   - **Counter**: irony — his own shows are heavily pre-programmed/timecoded.
6. **"Ghost production is a cancer"** — "if you want to be called an artist, produce your own music"; accused The Chainsmokers.
   - **Counters**: (a) hypocrisy — he's ghost-produced ~15 uncredited tracks; (b) Armin van Buuren — collaboration with ghost producers "can bring fresh ideas"; Garrix/Kaskade — fine *if you're honest with fans*.
7. **"I am not a DJ"** — "an engineer first, producer second, performer third"; audiences should hear *his* music ("you wouldn't expect Mötley Crüe to play Warrant covers").
   - **Counter**: selection/curation *is* the art he's dismissing; convenient self-exemption.
8. **Skrillex "isn't doing anything too technical… laptop and a MIDI recorder"** + the Bieber "tool" jab.
   - **Counter (Skrillex)**: "Stop being a fucking bully… a real friend would come to me rather than blowing it up online" — reframes critique as bullying.
9. **Spotify are "vultures"** — "the cost of creating content was 25+ years of my life… going to your company" (after Ek said cost was "almost zero"); threatened to pull his catalog. `[corroborated]`
   - **Counter (structural)**: Spotify pays record aggregate sums; big-catalog stars are far better positioned than the independents who'd need ~5M streams for minimum wage.
10. **Beatport's genres are meaningless** (after it re-tagged his "Electro House" as "Big Room").
    - **Counter**: Beatport framed it as taxonomy-for-discovery, not an insult.

---

## Corrections & gaps (don't propagate these errors)
- **The pump is LFOTool (volume LFO), not a sidechain compressor** — the compressor ms/ratio numbers are the generic tutorial version.
- **Cirklon sequencer**: *unverified* — appeared in no source; do not state he uses one.
- **Joe Rogan** appearance is **#184 (2012)**, not #1339; **no Red Bull Music Academy** lecture exists — his structured teaching is the **MasterClass**.
- Several "teaching" nuggets (8-bar loop, −6 dB headroom, "synths are all the same," EQ carving) most likely originate in the **paid MasterClass**, which overlaps stream content — flagged medium where a free-stream origin couldn't be confirmed.
- Unconfirmed: a direct **Madeon** reply to "we all hit play"; a specific **Kaskade "human jukeboxes"** post.

*Compiled by fan-out web research, 2026. All snippet-derived (WebFetch 403); confidence-flagged. The MasterClass + the Gearspace "Kick Insight" thread are the most load-bearing technical sources.*
