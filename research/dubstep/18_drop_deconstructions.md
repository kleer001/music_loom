# Bar-by-Bar Deconstructions of Famous Dubstep Drops

Concrete, source-cited breakdowns of what literally happens across the drops of iconic
dubstep tracks. Goal: structural data an engine developer can model — drop length in bars,
bass-sound switch points, first-half vs. second-half difference, fills and switch-ups, and
any "how it was made" insight.

## Honesty note on source availability

Bar-accurate, measure-by-measure transcriptions of these specific drops mostly **do not
exist in public sources**. Producers rarely release stems, MIDI, or project files, and
tutorial channels teach the *sound* (synth patch) far more often than the *arrangement*
(what changes on which bar). What *is* well documented:

1. The **sound-design recipe** for each signature bass (synth, oscillators, modulation rate).
2. The **genre-standard drop skeleton** (16-bar drop, 8-bar build, half-time snare on 3).
3. Producer **interview anecdotes** about how a track was built.

Where a bar map below is reconstructed from the genre skeleton plus the documented
sound rather than a literal transcription, it is **labelled as inferred**. Treat inferred
maps as a model template, not as a claim that the original producer did exactly this.

Standard reference skeleton used throughout (all tracks are 140 BPM unless noted):

- Drop = **16 bars**, half-time feel: snare/clap lands on beat 3 of each bar.
- A drop almost always splits **8 + 8**: bars 1–8 establish the riff, bars 9–16 vary or
  intensify it. A fill/turnaround commonly lands at the end of bar 8 and bar 16.
- Sources for the skeleton: @palsen dubstep song-structure note
  (https://www.tumblr.com/palsen/42835014077/about-dubstep-song-structure), EDMProd
  "How to Make Dubstep" 8-bar-increment convention (https://www.edmprod.com/how-to-make-dubstep/),
  DJ Trauma "something of interest every 4–8 bars"
  (https://djtrauma.wordpress.com/2012/07/17/dubstep-song-structure/).

---

## 1. Skrillex — "Scary Monsters and Nice Sprites" (the drop)

**Tempo / key:** 140 BPM, B♭ major. Built in Ableton Live; the lead began as an FM8 test
patch ("FM8 Test" was the working title).
Source: https://en.wikipedia.org/wiki/Scary_Monsters_and_Nice_Sprites_(song)

### The signature sound (well documented)

The famous "wubbing" lead is **FM, not a filtered-LFO wobble**. Recipe (Envato Tuts+,
recreated in FL Sytrus, applies to any FM synth — archived copy):

- **Carrier:** sawtooth. **Modulator:** sine, held at a *static* 100 Hz with frequency
  ratio 0.000× (so it does not track the note).
- Because the modulator frequency is fixed while the carrier pitch moves, the **amount of
  dissonance changes with every note** — "this is what really makes the Scary Monsters
  sound so random and harsh."
- Modulation depth ~5% (sine modulates saw by about 5%).
- Unison (2nd order, phase offset ~10%, mix 100/75) acts like a comb filter; 4th-order
  chorus, depth 50%, spread 100%, speed ~75%.
- **Portamento/slide 4–6 s** between notes — the catchy glide is part of the hook.
- In the final mix everything but the drums is dulled so the drums punch through.

Source: https://web.archive.org/web/2018/https://music.tutsplus.com/sound-design-scary-monsters-and-nice-sprites--cms-24887t

### Drop structure (partly inferred)

The defining structural trait, noted by reviewers, is that the drop is **rhythmically
irregular** — the lead phrases are placed almost conversationally rather than locked to a
steady wobble grid ("throws the bass into the song with no structure or flow"). The growl
"revs up and winds down toward a more guttural sound," i.e. the *pitch and FM dissonance*
move, not a metronomic filter LFO.

Inferred 16-bar map (genre skeleton + documented behaviour):

| Bars | What happens |
|------|--------------|
| 1–4 | Lead riff statement A — mid-register FM stabs with the 4–6 s portamento glide between notes; half-time drums, snare on 3. |
| 5–8 | Riff A repeats with the FM growl pitched/revved up; dissonance increases as carrier pitch climbs against the static 100 Hz modulator. Bar 8 = short fill/turnaround. |
| 9–12 | Riff B — the "guttural" wind-down variant; lower notes, harsher FM. First clear timbre switch from the first half. |
| 13–16 | Builds to the most chaotic statement; final-bar fill into the next section. |

Honest gap: no public bar-accurate transcription exists; the *sound* recipe is solid, the
*per-bar arrangement* above is a model, not a transcription.

---

## 2. Skrillex — "Bangarang"

**Tempo:** ~110 BPM (notably slower than 140 dubstep; half-time feel still applies).
Built in Ableton with NI Massive / FM8 / Reaktor as the core soft synths.
Source: https://en.wikipedia.org/wiki/Scary_Monsters_and_Nice_Sprites (EP production note);
sample lineage via https://www.whosampled.com/Skrillex/Bangarang/

### Structural insight

"Bangarang" is the clearest example of Skrillex's **vocal-chop-as-rhythm** drop design: the
"Bangarang!" vocal stab and pitched vocal fragments *are* the riff, retriggered on the grid,
rather than a continuous wobble bass. The drop alternates the vocal hook with short
mid-bass growls. This is the same FM-growl family as Scary Monsters but the lead role is
handed to the chopped vocal.

Honest gap: no public bar map. Documented at the level of "vocal chop drives the drop,
growl bass answers it" (call-and-response), which is itself the modelable structural fact.

---

## 3. Flux Pavilion — "Bass Cannon" / "I Can't Stop"

**Tempo / DAW:** 140 BPM; produced by Joshua Steele in Cubase, NI Massive as the lead synth.
Source: https://en.wikipedia.org/wiki/Flux_Pavilion_discography (and the 2025 "Bass Cannon"
Massive re-edit confirming Massive lineage: https://edm.com/music-releases/flux-pavilion-bass-cannon-2025-edit/)

### The signature sound (well documented)

From the ADSR "How to Make Flux Pavilion's Bass Cannon in NI Massive" breakdown:

- **Only two oscillators**, very little FX.
- **Camel Crusher** distortion across the patch for grit.
- Specific high-frequency band is **boosted to get the "high-pitched appeal"** of the Flux
  bass — the bass sits unusually high in the spectrum, not a deep sub.
- The **sub was removed from the Massive patch entirely** and a **clean sine sub-bass was
  layered back in underneath** for low-end support (split-band design).
- The growl movement comes from **MIDI pitch automation in the DAW**, not just an LFO —
  the note pitches glide/step, which is what makes it "talk."

Source: https://www.adsrsounds.com/ni-massive-tutorials/flux-pavilions-bass-cannon-ni/
"I Can't Stop" uses the same talking-bass family (Massive, detuned saws, drive/glide),
covered by the same tutorial lineage: https://www.adsrsounds.com/ni-massive-tutorials/flux-pavilion-synth-ni-massive/

### Structural insight for modelling

The modelable Flux structure is the **split bass**: (a) clean sine sub on the root, locked,
plus (b) a distorted high-mid "talking" layer whose pitch is automated bar-to-bar to spell
out the hook. First half states the phrase; second half typically transposes or doubles it.
The wobble is slow (around 1/4-note half-time pulse), leaving the *pitch melody* as the
hook rather than fast filter shredding.

Honest gap: no public bar-accurate transcription; the split-layer + pitch-automation design
is the documented, modelable fact.

---

## 4. Doctor P — "Sweet Shop"

**Tempo:** 140 BPM. The track that "set the benchmark" for the UK brostep wobble wave.
Source: https://en.wikipedia.org/wiki/Doctor_P

### The signature sound (technique documented, not the exact patch)

"Sweet Shop" is the canonical **mid-range wobble** (not sub-wobble): an LFO sweeps a
band-pass/low-pass filter on a detuned, distorted saw stack, synced to note divisions so the
wobble rate **changes per bar** (e.g. 1/4 → 1/8 → 1/16 → triplet). The generic Massive
wobble recipe that reproduces this:

- Three pitched-down, slightly detuned, distorted oscillators (harmonic blend).
- LFO on the filter, **Sync on**, ratio set to the desired wobble division.
- "Restart via Gate" so the oscillator phase resets on each new note (stable wobble).
- Triangle/sine LFO shape for a smooth wub.

Source: https://www.adsrsounds.com/ni-massive-tutorials/designing-a-ni-massive-grimy-dubstep-wobble/
and the wobble-rate-via-sync technique: https://www.adsrsounds.com/ni-massive-tutorials/quick-easy-series-nasty-wobble-bass-ni-massive/

### Structural insight for modelling

The hallmark of "Sweet Shop"-style drops is **wobble-rate as the variable**: the *notes*
can stay almost static while the LFO rate accelerates across the 16 bars — bars 1–8 at a
slower division, bars 9–16 doubling/tripling the rate (the "switch-up"). This is the most
directly modelable dubstep drop pattern: one bass note, a synced LFO, and an automation lane
that steps the LFO division every 2–4 bars.

Honest gap: this is the documented genre technique that the track exemplifies, not a stem-level
transcription of "Sweet Shop" specifically.

---

## 5. Excision — "X Rated" / "The Paradox" (growl/dubstep)

**Tempo:** 140 BPM. Excision's signature is the **screaming mid-range growl**, the most
distortion- and FM-heavy of the producers here.
Source (sound character): https://www.adsrsounds.com/serum-tutorials/making-a-skrillex-growl-in-serum/

### The signature sound (well documented)

Growl-bass recipe (Serum), with concrete values from the Rocket Powered Sound guide:

- Complex/harmonically rich wavetable on OSC A (e.g. a "growl"/"formant" table), **WT Pos
  ≈ 40–45%**, modulated by an LFO for movement.
- **FM from OSC B** into A, depth ~30%, for the metallic scream.
- **LFO 1 → detune/WT-pos at Rate 1/4** for the rhythmic growl pulse (half-time).
- **Formant/EQ** voicing: HPF 24 dB at ~34 Hz, resonance 70%; EQ peaks at **210 Hz and
  2924 Hz** create the vowel/"speaking" quality.
- A **synced delay** (length ~25, feedback ~51%) creates cyclic re-pulsing — lower delay
  length = faster growl cycling, an alternate way to set growl rhythm.

Source: https://rocketpoweredsound.com/blogs/production/5-ways-to-make-growl-bass-in-serum

### Structural insight for modelling

Excision drops are built from a **bank of distinct growl "shots"** (each a different
wavetable-position / formant pose) sequenced like syllables. The drop is a
**call-and-response of these shots** rather than one continuous wobble: bars 1–8 set the
phrase, bars 9–16 answer it with new growl poses and faster sub-divisions. The sub sits
underneath as a separate locked sine layer (same split-band logic as Flux).

Honest gap: no public bar map of "X Rated"/"The Paradox" specifically; the growl-shot
sequencing model is reconstructed from the documented sound design and the genre skeleton.

---

## 6. Virtual Riot — "Idols" (+ his public drop-design teaching)

### "Idols" is a mashup — that *is* the structural fact

"Idols" (2013) samples **20+ tracks** (WhoSampled lists 26+), cutting up famous drops
including Skrillex "Bangarang," "Scary Monsters," "Kill EVERYBODY," "WEEKENDS!!!,"
"Rock N' Roll," Nero "Innocence," Zedd "Spectrum," Knife Party "Internet Friends,"
Kill the Noise "Jump Ya Body," and his own "Evil Gameboy."
Source: https://www.whosampled.com/Virtual-Riot/Idols/samples/

So the modelable insight is **collage drop construction**: the 16-bar drop is assembled by
splicing 1–2-bar fragments of other producers' drops back-to-back, each retuned to the host
key. The "switch-up" happens every 1–2 bars because the *source* changes. This is a
different generative model from a single-patch drop — it's a sampler arrangement.

### Virtual Riot's documented drop-design method (his own teaching)

From his tutorials (Serum) and courses:

- Start from an init Serum patch, pick a wavetable, then **automate wavetable-position volume
  and the sub with a single LFO** — that LFO is "the foundation for most of the sound's
  movement."
- Filter-automation + modulation create the bar-to-bar movement that makes a drop
  "ever-evolving" rather than looping.
- Glitch-hop variant: detuned saws, low-pass filtered, drive + glide for note slides.

Sources: https://www.toolify.ai/ai-news/master-virtual-riots-genrebending-techniques-203462,
https://blog.waproduction.com/how-to-create-virtual-riot-bass,
course outline (arranging basses into an evolving drop):
https://letsynthesize.teachable.com/p/start-to-finish-virtual-riot-style-riddim

### Structural insight for modelling

Two distinct, modelable drop strategies sit side by side in Virtual Riot's work:
**(a) collage** (Idols — splice external drop fragments every 1–2 bars), and
**(b) one-LFO evolving bass** (his teaching — a single modulation source drives wavetable +
sub, and *filter automation* makes each 2-bar block different). Both reject the static
loop; the engine takeaway is "change something every 1–2 bars."

---

## 7. Skream — "Midnight Request Line" (classic UK dubstep, contrast with brostep)

**Tempo / DAW:** 140 BPM; made in **FruityLoops (FL Studio 3)** with "probably four plugins"
— **Junglist (Synapse Audio)** for most sounds, **Absynth**, and the **TS404** for the
bassline. Originally a grime track titled "Minus C," Christmas 2003.
Sources: https://www.musicradar.com/artists/thats-all-i-had-fl-studio-and-four-plugins-made-midnight-request-line-skream...,
https://ra.co/reviews/23709

### What literally happens (best-documented of the set)

- The hook is the **built-in FL arpeggiator** clicked on over a synth — "it was literally
  hitting **two keys**. It was the simplest thing." A **two-note bassline**, **unusually
  high-pitched** for dubstep.
- **Gunshot samples as percussion** (a grime staple carried over).
- The **intro samples Rock Master Scott & The Dynamic Three's "Request Line"** (the source
  of the rename).
- **A key change halfway through the track adds tension** — this is the documented
  structural switch-up, and it is the contrast point with brostep: the energy lift comes from
  a **harmonic/melodic key change**, not from a heavier or faster bass.

Source for all four points: https://ra.co/reviews/23709 and the MusicRadar interview above.

### Contrast with brostep (the modelable difference)

| | Skream "Midnight Request Line" (2005 UK) | Skrillex/Flux/Doctor P (2010+ brostep) |
|---|---|---|
| Hook source | Arpeggiator + 2-note bassline, high-pitched, melodic | FM growl / mid-range wobble, low-mid, abrasive |
| Drop "switch-up" | **Key change** (harmonic) mid-track | **Timbre/LFO-rate change** (wobble doubles, new growl pose) |
| Density | Sparse — space between hits, gunshots, dub sub | Dense "wall of sound," drums punch through dulled bass |
| Emotion | Colourful, playful melody over dark sub | Aggression / chaos |

This is the cleanest documented structural contrast in the whole set: classic dubstep moves
energy with **harmony**, brostep moves it with **timbre and rhythm subdivision**.

---

## 8. Riddim / tearout (Subtronics, Svdden Death) — representative drop

**Tempo:** 140 BPM, half-time.
Sources: https://edm.fandom.com/wiki/Riddim, Subtronics interview
https://edm.com/interviews/subtronics-on-bass-music/

### Documented structural traits

- Riddim is **minimalist and repetitive** — "stripped back to a few hard-hitting drums, a
  sub layer, and a small palette of highly articulated bass shots."
- **Triplet percussion** (swung/triplet hi-hats), **snare on beat 3**, **call-and-response
  bass phrases**, **formant/comb/phase-filtered growls**, strong sub reinforcement.
- Subtronics frames it explicitly as **"a re-hashing of wonky UK dubstep"** with "loads more
  mid-range," "bassline-driven repetitive, almost techno-esque." Drops are built for stacked
  **"double drops"** in DJ sets.
- Production reality: "**200-lane, 90% CPU** post-processing" project files — i.e. the single
  growl note is the product of a deep serial-processing chain, not one synth.

Source for the trait list: https://edm.fandom.com/wiki/Riddim (triplet percussion, repetition,
chorus/flanger/delay); Subtronics quotes from the EDM.com interview.

### Inferred 16-bar riddim drop map (genre skeleton + documented traits)

| Bars | What happens |
|------|--------------|
| 1–2 | Two-bar bass phrase A established: a short articulated growl "shot" on beat 1, answered by a second pose — call-and-response. Snare on 3, triplet hats. |
| 3–8 | Phrase A repeats with **micro-edits** (pitch flicks, formant shifts) every 2 bars; sub locked under it. Almost no melody — variation is timbral. |
| 8 (end) | Fill / drum turnaround. |
| 9–16 | Phrase B: new growl poses, often a faster/triplet sub-division or a pitched bass run; second half is the "switch-up." |
| 16 (end) | Fill into next section, or hard cut for a double-drop. |

The defining riddim rule for an engine: **one or two bass notes, a small bank of articulated
growl poses, swap the pose every 1–2 bars, never change the harmony.** This is the polar
opposite of Skream's harmony-driven drop.

Honest gap: no stem-level transcription of a specific Subtronics/Svdden Death drop is public;
the map is the documented riddim convention applied to the 16-bar skeleton.

---

## Cross-track summary: what an engine can model

1. **Drop = 16 bars, split 8 + 8**, half-time snare on beat 3, fill at the end of bars 8 and 16.
2. **Two families of "switch-up":**
   - *Harmonic* (Skream): key change / melodic lift drives energy.
   - *Timbral-rhythmic* (everyone post-2010): wobble-rate doubles, or a new growl pose /
     wavetable-position appears, every 1–2 bars.
3. **Split-band bass is near-universal in brostep:** a clean locked sine sub + a distorted
   mid/high "talking" layer whose *pitch or filter* is automated per bar (Flux explicitly
   removes Massive's sub and re-adds a sine; growl recipes keep sub separate).
4. **Movement source differs by era/sub-genre:**
   - FM dissonance vs. note pitch (Skrillex Scary Monsters — static 100 Hz modulator).
   - Synced filter-LFO whose *division* steps up across bars (Doctor P wobble).
   - Wavetable-position / formant poses sequenced like syllables (Excision, riddim).
   - Vocal chops or spliced sample fragments as the riff (Bangarang; Virtual Riot Idols).
5. **"Change something every 1–2 bars"** is the one rule every source agrees on
   (DJ Trauma, Virtual Riot, riddim micro-edit convention).

## Sources

- Skrillex "Scary Monsters" sound design (archived Envato Tuts+): https://web.archive.org/web/2018/https://music.tutsplus.com/sound-design-scary-monsters-and-nice-sprites--cms-24887t
- Scary Monsters song / FM8 origin (Wikipedia): https://en.wikipedia.org/wiki/Scary_Monsters_and_Nice_Sprites_(song)
- Skrillex EP production (Massive/FM8/Reaktor, Ableton): https://en.wikipedia.org/wiki/Scary_Monsters_and_Nice_Sprites
- Flux Pavilion "Bass Cannon" in Massive (ADSR): https://www.adsrsounds.com/ni-massive-tutorials/flux-pavilions-bass-cannon-ni/
- Flux Pavilion synth (ADSR): https://www.adsrsounds.com/ni-massive-tutorials/flux-pavilion-synth-ni-massive/
- Bass Cannon 2025 Massive re-edit (EDM.com): https://edm.com/music-releases/flux-pavilion-bass-cannon-2025-edit/
- Doctor P / grimy Massive wobble (ADSR): https://www.adsrsounds.com/ni-massive-tutorials/designing-a-ni-massive-grimy-dubstep-wobble/
- Wobble-rate via LFO sync (ADSR): https://www.adsrsounds.com/ni-massive-tutorials/quick-easy-series-nasty-wobble-bass-ni-massive/
- Excision-style growl, concrete Serum values (Rocket Powered Sound): https://rocketpoweredsound.com/blogs/production/5-ways-to-make-growl-bass-in-serum
- Skrillex growl in Serum (ADSR): https://www.adsrsounds.com/serum-tutorials/making-a-skrillex-growl-in-serum/
- Virtual Riot "Idols" sample list (WhoSampled): https://www.whosampled.com/Virtual-Riot/Idols/samples/
- Virtual Riot bass/drop method: https://www.toolify.ai/ai-news/master-virtual-riots-genrebending-techniques-203462 ; https://blog.waproduction.com/how-to-create-virtual-riot-bass ; https://letsynthesize.teachable.com/p/start-to-finish-virtual-riot-style-riddim
- Skream "Midnight Request Line" interview (MusicRadar): https://www.musicradar.com/artists/thats-all-i-had-fl-studio-and-four-plugins-made-midnight-request-line-skream-on-how-he-made-his-biggest-track-why-he-doesnt-mix-his-own-music-and-dropping-his-13-year-old-sons-tune-in-a-boiler-room-set
- Skream "Midnight Request Line" history/structure (Resident Advisor): https://ra.co/reviews/23709
- Riddim genre traits (EDM Wiki): https://edm.fandom.com/wiki/Riddim
- Subtronics on riddim/sound design (EDM.com): https://edm.com/interviews/subtronics-on-bass-music/
- Dubstep song-structure skeleton: https://www.tumblr.com/palsen/42835014077/about-dubstep-song-structure ; https://www.edmprod.com/how-to-make-dubstep/ ; https://djtrauma.wordpress.com/2012/07/17/dubstep-song-structure/
