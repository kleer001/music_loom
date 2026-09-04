# Video Game Music Structure: Laws, Recipes & Best-in-Class Breakdowns

The wise-old-Internet mentoring for **song structure** — written for a
procedural engine, not a listener. Where [`edm_theory.md`](./edm_theory.md)
codifies the *vocabulary* of each genre (mode, progression, bassline, the
intro→build→drop→breakdown curve), this doc codifies the layer above it: how a
*game* score is **structured over time** when the timeline is no longer fixed —
because the thing playing it is interactive, and the music has to survive
hundreds of loops without the player wanting to mute it.

> **Foundation note.** The "wandering" failure this doc keeps returning to (§4,
> §8) is a special case of how *all* music works — that first-principles charter
> (tension/release, unity/variety, expectation/surprise, climax & proportion,
> Gestalt grouping), plus the universal song-construction basics, is written up in
> [`song_construction_basics.md`](./song_construction_basics.md) Part I.

> **The one throughline.** Almost every "law" below is one idea wearing
> different hats: **game music is not a song, it is a *state machine that emits
> music*.** Linear song form (a fixed intro→…→outro timeline) and
> interactive/state-driven form (music selected by what the game is doing
> *now*) are the two poles, and the entire discipline is about blending them
> without losing musical coherence. If the song-structure direction feels like
> it's "getting out of hand," it's almost always because the design is reaching
> for *more linear timeline* (more states, more automation lanes, more
> Markov edges) when the game-music canon says the answer is *less timeline,
> more state* — fewer, stronger building blocks selected by an intensity/tension
> signal. Section 8 turns that into concrete guidance for an arrangement
> state machine.

> **Scope & method.** This is a *sourced* reference: every claim carries a live,
> authoritative URL. **Verification caveat:** compiled by fan-out web
> research where `WebFetch` returned **HTTP 403 on essentially every host**
> (FMOD, Audiokinetic, Game Developer, MIT Press, Wikipedia, GDC Vault, academic
> PDFs all blocked identically — an anti-bot wall on the fetch tool, *not* dead
> links). So each claim is **search-attested** (drawn from search-engine extracts
> of the cited page) rather than page-fetched. The URLs are correct and the
> facts are cross-checked across multiple independent sources, but before
> quoting anything *verbatim* — especially the primary GDC talks, the exact
> FMOD/Wwise transition-option names, and the RDR/DOOM numbers — open the page
> in a real browser. Single-source or approximate figures are flagged inline.

---

## 1. The two forms (the law everything else serves)

Karen Collins' *Game Sound* (MIT Press) is the foundational academic text, and
it gives the field its core taxonomy:

- **"Dynamic audio"** is the umbrella for any changeable audio. It splits into
  **interactive** audio (responds to *player action*; plays the same way each
  time you do the same thing) and **adaptive** audio (responds to *game-state
  changes* the player doesn't directly drive — time running out, enemy count,
  zone). Collins' canonical example: *Super Mario Bros.* doubling its tempo when
  the timer runs low is **adaptive**, not interactive.
  ([DiVA thesis quoting Collins](https://www.diva-portal.org/smash/get/diva2:1446866/FULLTEXT01.pdf),
  [MIT Press](https://mitpress.mit.edu/9780262033787/game-sound/))
- The central compositional problem Collins frames: music is a **fundamentally
  linear art form being forced into a nonlinear/interactive format**, "forcing
  game audio professionals to look for technological solutions to artistic
  problems."
  ([Winifred Phillips](https://winifredphillips.wpcomstaging.com/2016/04/20/interactive-music-for-the-video-game-composer/))

Winifred Phillips (AAA composer, *A Composer's Guide to Game Music*, MIT Press)
makes the practitioner cut. A game composer must master **forms not taught in
the conservatory**, delivering music as one of **three concrete output types**:

1. **Linear loops** — a finished cue that repeats.
2. **Music "chunks"** — segments with defined entry/exit points, for
   *horizontal resequencing*.
3. **Compositional fragments** — raw material for a *generative framework*.

…and she splits interactive music into **"rendered"** (pre-composed pieces the
engine selects/blends) vs **"generative"** (assembled live from fragments). Her
GDC 2021 talk names the practical target a **"hybrid linear-dynamic"** form —
linear and dynamic are poles you *blend*, not a binary.
([MIT Press](https://mitpress.mit.edu/9780262534499/a-composers-guide-to-game-music/),
[Phillips blog](https://winifredphillips.wpcomstaging.com/2022/02/02/hybrid-linear-dynamic-music-for-game-composers-from-spyder-to-sackboy-gdc-2021/),
[Game Developer writeup](https://www.gamedeveloper.com/audio/horizontal-resequencing-and-dynamic-transitions-for-game-music-composers))

**Why this matters for a generator:** a fixed song format — a timeline of
patterns plus automation lanes — is the *linear* pole. A Markov chain over
arrangement states driven by RNG rather than by game state is a *primitive
interactive* pole. The canon says the powerful move is the **hybrid**: a small
library of strong chunks, selected by a **state or intensity signal**, and
neither a long authored timeline nor a free-wandering chain. See section 8.

---

## 2. The two structural techniques (and the exact field vocabulary)

Every adaptive score is built from two primitives. **Use the field's words** —
they map cleanly onto code.

### Vertical layering (a.k.a. "vertical remixing")
Stems that **add/remove on top of a continuously-playing cue** to scale
intensity. Preferred when state changes are *rapid*, because layering onto the
same cue is "less incongruous than switching between two different cues."
Requires the stems to be **identical length, tempo, and meter, started together
on one clock** and toggled by state.
([The Game Audio Co](https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing),
[Kit Varney](https://kitvarneycreativeblog.wordpress.com/2018/11/29/none-linear-soundtracks-horizontal-and-vertical-techniques/))

### Horizontal re-sequencing (branching)
Slice music into **segments with a defined entry point and exit point**, and
swap segments on a state change (exploration → combat → victory). Chunks are
often **short, 1–4 bars**, interchangeable. The strongest scores **hybridize**
both techniques.
([Game Developer](https://www.gamedeveloper.com/audio/horizontal-resequencing-and-dynamic-transitions-for-game-music-composers),
[Game Developer / competitive](https://www.gamedeveloper.com/audio/adaptive-music-in-competitive-games))

### The middleware model (FMOD & Wwise) — the canonical implementation
The two industry engines have converged on the same primitives; this is the
reference design any state-driven music system re-implements.

**Wwise (Audiokinetic):**
- A **Music Switch Container** maps game **States/Switches** to **Music
  Segments** via **transition rules**.
- A **Music Segment** is bounded by an **Entry Cue** and an **Exit Cue**;
  transitions are **quantized**: the source's *sync point* is the **next beat,
  bar, grid, or cue**, and the destination's sync point must be its **Entry
  Cue**. (Confirm the exact "Sync to" option list —
  Immediate / Next Grid / Next Bar / Next Beat / Next Cue / Exit Cue / Custom
  Cue / Last Exit Position — at the
  [musictransition library page](https://www.audiokinetic.com/en/library/edge/?id=wwiseobject_musictransition.html);
  could not fetch to quote verbatim.)
- **Pre-Entry** (pickup notes before the Entry Cue) and **Post-Exit** (reverb
  tails after the Exit Cue) handle seam-masking.
- A **Stinger** is a short Music Segment triggered to play *over* the current
  music, **synced to the grid/beat/bar/cue** (not immediate).
- **Transition Segments** are dedicated **bridge** segments inserted between
  source and destination when a simple rule can't join them (different key,
  tempo, mood).
  ([Wwise 201 course](https://www.audiokinetic.com/en/courses/wwise201/),
  [No Straight Roads dev blog](https://www.audiokinetic.com/en/blog/designing-the-musical-game-world-of-no-straight-roads/))

**FMOD Studio:**
- Adaptive behavior is driven by **Parameters** (Continuous float / Discrete int
  / Labeled named-value); every event instance carries **its own current
  parameter values — its "state."**
- **Transition Markers** make the playback position **jump instantaneously** to
  a Destination Marker. **Transition Regions** and **Magnet Regions** do the
  same over a *range* and **can be quantized** to fire only on specified
  beats/bars (plain transition markers and loop regions cannot be quantized).
- A **Transition Timeline** is a short timeline **inserted between** a jump's
  source and destination to bridge it with added content/automation/crossfades.
- **Sustain Points** hold the cursor in place **until a "key off"** — i.e. hold
  a musical state until a game event releases it.
- Default timeline absent tempo markers is **120 BPM, 4/4**.
  ([FMOD: authoring events](https://www.fmod.com/docs/2.03/studio/authoring-events.html),
  [FMOD: instruments](https://www.fmod.com/docs/2.03/studio/working-with-instruments.html),
  [FMOD: concepts](https://www.fmod.com/docs/2.03/studio/fmod-studio-concepts.html))

### Seamless looping (intro + loop)
The standard authoring pattern is **two files: an intro/entrance played once,
then a loop file that repeats** — the engine loops from any point while keeping a
distinct intro. When a loop seam is audible, the standard fix is a **reverb-tail
crossover**: overlay the audio decaying off the *end* onto the *start* on a
separate track to mask the discontinuity (formalized as Wwise Post-Exit /
Pre-Entry). Composers also deliberately **construct the form so the loop point
is hard to identify**, using **off-center / non-resolving progressions** so the
pattern doesn't announce its seam.
([MakeUseOf](https://www.makeuseof.com/how-to-create-music-loop-video-games/),
[Game Developer: rethinking the loop](https://www.gamedeveloper.com/audio/rethinking-the-audio-loop-in-games))

---

## 3. The laws & principles

### Koji Kondo's three principles (GDC 2007, "Painting an Interactive Musical Landscape")
Kondo's first US talk on interactive music names three:
- **Rhythm** — the music must conform to the gameplay's *intrinsic rhythms*.
  Canonical example: the length of Mario's jump maps to an eighth note, so the
  score is built around player motion.
- **Balance** — not just music-vs-SFX volume, but **uniting all of a game's
  audio into one composition** with a defined intro, bridge, and ending.
- **Interactivity** — can be **overt** (SMB tempo speeding up when time runs
  low) or **subtle** (slight phrasing changes each loop through the *Ocarina*
  overworld). Music can even **drive** gameplay (NSMB enemies/blocks moving in
  time with the music).

His overriding philosophy: **"fun music that makes playing the game even more
fun."**
([Game Developer](https://www.gamedeveloper.com/game-platforms/gdc-koji-kondo-s-interactive-musical-landscapes),
[Nintendo World Report transcript](https://www.nintendoworldreport.com/feature/13118/koji-kondos-gdc-2007-presentation),
[NWR: music affecting gameplay](http://www.nintendoworldreport.com/feature/13122/koji-kondos-gdc-2007-presentation-music-affecting-gameplay),
[Library of Congress interview](https://www.loc.gov/static/programs/national-recording-preservation-board/documents/koji-kondo-interview.pdf))

### Surviving hundreds of loops ("earworm vs. wallpaper")
The structural tension: too **repetitive** and the listener is bored; too
**complex/melodic** over hundreds of loops and they're *fatigued*. Earworms are
empirically produced by **short, simple, repeated** excerpts, and repeated
exposure measurably increases earworm formation — which is a double-edged sword
for a track that loops all day.
([Film Stories](https://filmstories.co.uk/features/making-an-earworm-the-hidden-magic-of-video-game-music/),
[peer-reviewed earworm study (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10585939/))

Mitigations the canon actually uses:
- **Alternate melodic / non-melodic versions** by sub-state — *Skyward Sword*
  plays the full melody in the main room, **mutes the melody** in smaller rooms.
  ([Intermittent Mechanism](https://intermittentmechanism.blog/2023/04/12/loops-in-video-game-music/))
- **Hide the loop seam** + non-resolving harmony (§2).
- **Sparse placement** — sometimes the best anti-fatigue tool is *not playing*
  (Minecraft, §7).

### Leitmotif & thematic economy
A **leitmotif** in games carries a **dual identity** — emotional meaning from
the music *plus* contextual meaning from gameplay — making it a uniquely
interactive narrative tool. **Thematic transformation** (permutation, inversion,
retrograde, augmentation, diminution, fragmentation) lets **a few themes cover
many states** — the engine of thematic economy. Two contrasting economies:
*Zelda* **transforms** a small familiar set across games; *Final Fantasy* uses
mostly non-transformative themes in a larger interrelated network.
([MTSU thesis](https://jewlscholar.mtsu.edu/bitstreams/212a9f9b-cbf4-4ce6-9257-a40ca8a964f3/download),
[Valparaiso: "Leveling Up the Leitmotif"](https://scholar.valpo.edu/cus/1254/),
[ResearchGate: Uematsu's leitmotivic strategy](https://www.researchgate.net/publication/372443387_Leitmotivic_Strategies_in_Nobuo_Uematsu's_Final_Fantasy_Soundtracks))

### Mix discipline: music sits *under* gameplay, and silence is a tool
- **Ducking** — attenuate music when a higher-priority track (dialogue, critical
  SFX) plays. AAA mixes use **side-chaining, ducking, HDR audio, and state
  mixing** to reallocate sonic space in real time (e.g. dynamic-EQ ducking
  specific frequencies of combat music to free room for dialogue).
  ([A Sound Effect](https://www.asoundeffect.com/game-audio-mixing-demystified/))
- **Compress dynamic range ("leveling")** so quiet ambient cues stay audible on
  consumer speakers without loud peaks dominating.
  ([AudioTechnology](https://www.audiotechnology.com/features/mixing-aaa-videogames))
- **Silence is structural** — absence builds tension and makes a sudden stinger
  land — but **"remove music without replacing it" is a named mistake**;
  environmental audio should fill the space, and *too much* silence fatigues
  equally. Balance, not absolutes.
  ([Wayline](https://www.wayline.io/blog/sound-of-silence-video-game-immersion),
  [Algoryte](https://medium.com/@algoryte/game-audio-design-the-silent-half-of-player-experience-9c9ebb4eb591))

---

## 4. The generative failure mode — and the documented fixes

This is the section that speaks directly to "the structure is getting out of
hand." The academic and practitioner literature names the exact failure a
Markov-over-states arrangement risks, and the exact fixes.

**The failure mode — "no sense of direction."** Most generative systems produce
music that **lacks the global organization (form)** human music has
(overture/allegro/finale; AABA; verse/refrain/bridge), so it **wanders** without
higher-level structure.
([Briot & Pachet, arXiv 1712.04371](https://arxiv.org/pdf/1712.04371))

**The fixes (all convergent):**
1. **Model structure explicitly** — recurring themes/variation give coherence;
   don't generate note-to-note without a plan.
   ([Briot & Pachet](https://arxiv.org/pdf/1712.04371))
2. **Hierarchical sub-task decomposition** — split generation into a high-level
   **structural-planning** stage and a separate content-creation stage, so
   output is unified within a defined framework. (*Plan first, fill second* — the
   antidote to a flat Markov.)
   ([Briot & Pachet](https://arxiv.org/pdf/1712.04371))
3. **Tension as the steering input** — take an abstracted **gameplay tension /
   intensity** signal and generate music to a *target* affect, turning wandering
   into **directed tension-and-release**. The Plut & Pasquier framework
   characterizes game generative music along **generative task, directionality,
   granularity, and grid/groove** — where **"directionality" is the explicit
   handle on the lack-of-direction problem.**
   ([Game Developer Deep Dive (Pasquier & Plut, SFU, 2023)](https://www.gamedeveloper.com/audio/deep-dive-generative-music-in-video-games),
   [Entertainment Computing survey](https://www.sciencedirect.com/science/article/abs/pii/S1875952119300795))
4. **Constrain the pitch material to a tonal home** — phrase generators should
   comply with a **defined scale, an explicit tonic, and a main chord**; drive
   change with a **tension curve modeled over time** to produce anticipation and
   resolution, adapting independently across **valence, arousal, and tension**.
   ([Game Developer Deep Dive](https://www.gamedeveloper.com/audio/deep-dive-generative-music-in-video-games))

**Empirical payoff:** Scirea's **MetaCompose** (real-time evolutionary generator,
FI-2POP + multi-objective, mood-driven) found in controlled study that
**adaptive music significantly increased players' reported tension** vs static
music — evidence that constraint + affect-targeting *delivers* the payoff a free
chain doesn't. A separate study found tension-input generation **increased
flow**.
([Scirea PhD thesis](https://marcoscirea.com/thesis/Scirea-Affective_Music_Generation.pdf),
[Game Studies: generative music & flow](https://gamestudies.org/1802/articles/sites_potter),
[Experience-Driven PCG (Plans & Morelli)](https://www.academia.edu/33522919/Experience_Driven_Procedural_Music_Generation_for_Games))

> **The takeaway:** a Markov chain is fine as the *mechanism*, but on its own it
> is exactly the "wandering" anti-pattern. Give it **(a)** a planning layer above
> it — a target arc, or a bias toward a payoff state — **(b)** a tension or
> intensity input instead of pure RNG, and **(c)** a tonal home it always
> resolves to.

---

## 5. Codifiable recipes (the numbers)

Concrete conventions a generator can apply. Treat as **defaults to start from**,
not hard limits.

**Loop & phrase lengths**
- Background loops typically run **~30 seconds to ~2 minutes**; **~30 s** is a
  workable *minimum*.
  ([Game Developer](https://www.gamedeveloper.com/audio/rethinking-the-audio-loop-in-games))
- Horizontal-resequencing chunks: **short 1–4 bar fragments**.
  ([Game Developer](https://www.gamedeveloper.com/audio/adaptive-music-in-competitive-games))
- Ostinato/background cells: **1–2 bar** repeated units.
  ([Midnight Music](https://midnightmusic.com/2016/06/the-guide-to-composing-music-for-video-games/))
- Teaching pattern for a battle theme: **a 4-bar loop in 3 intensity versions**
  (explore / approach-combat / battle).
  ([Midnight Music](https://midnightmusic.com/2016/06/the-guide-to-composing-music-for-video-games/))

**Layer count & intensity tiers**
- Canonical **3-tier intensity stack**: **exploration** (calm/ambient) →
  **tension** (low drums, tremolo strings) → **combat** (big drums, horns, full
  strings, melody), layers muted/unmuted by state.
  ([The Game Audio Co](https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing))
- DOOM (2016) runs **four** named tiers (§7). RDR2 settled on **~6 workable →
  11 final** stems after starting at ~15 (§7) — i.e. **single digits of stems is
  normal; >10 is a AAA stretch that costs real engineering.**
  ([RDR2 music (Wikipedia)](https://en.wikipedia.org/wiki/Music_of_Red_Dead_Redemption_2))

**Key / tempo constraints for seamless combining (the load-bearing rule)**
- **Stems/themes must share key, harmony, and tempo to crossfade or switch
  seamlessly.** The original *Red Dead Redemption* recorded **5 stems, all in the
  same key and tempo** (reported as **A minor, 130 BPM**); RDR2 expanded to 11
  and **lifted that constraint only at major engineering cost**, keeping
  narrative cues in a shared tempo/key to avoid clutter.
  ([RDR2 music (Wikipedia)](https://en.wikipedia.org/wiki/Music_of_Red_Dead_Redemption_2),
  [Game Developer: Elias](https://www.gamedeveloper.com/audio/composing-adaptive-music-for-video-games-using-elias))
- New layers should **fill harmonic gaps**, not introduce conflicting chords —
  the **modal-stasis** approach (which is *exactly* what
  [`edm_theory.md`](./edm_theory.md) already prescribes per genre).
  ([Berklee Online](https://online.berklee.edu/takenote/scoring-for-games-top-techniques-for-composing-music-for-interactive-media/))

**Transition & stinger conventions**
- **Quantize transitions** to the **next beat / bar / grid / cue** — never mid-
  phrase (§2). Destination lands on an **Entry Cue**.
- **Bridge ("transition") segments** are required when two sections differ in
  key/tempo/style and can't be butt-joined.
- **Stinger ≈ a short, resolved phrase (~1–5 s)** that plays over continuous
  music and ends on a "button" hit, synced to the underlying grid.
  ([Wwise 201](https://www.audiokinetic.com/en/courses/wwise201/),
  [FMOD instruments](https://www.fmod.com/docs/2.03/studio/working-with-instruments.html),
  [sting (Wikipedia)](https://en.wikipedia.org/wiki/Sting_(musical_phrase)))

**Ambient / long non-repeating beds**
- Make ambient beds **long stereo loops with very few recognizable details**
  (detail makes the seam audible); push detail into **separately-triggered,
  randomized-timing events** layered over the bed.
  ([Game Audio Learning](https://www.gameaudiolearning.com/knowledgebase/how-to-make-ambiences-for-games))
- A good recombination system can avoid audible repetition for **~27 days** of
  continuous play *(single-source, illustrative figure)*.
  ([Generative Music in Video Games survey](https://www.academia.edu/83151810/Generative_Music_in_Video_Games_State_of_the_Art_Challenges_and_Prospects))

---

## 6. Anti-wandering rules, distilled

A checklist a state-machine arrangement can be audited against:

1. **Plan before you wander.** Have a high-level arc/target the chain bends
   toward (payoff state), not just edge probabilities. *(Briot & Pachet; Plut &
   Pasquier — §4.)*
2. **Steer with tension, not dice.** Map an intensity/tension signal to
   section/layer choice **monotonically** — more intensity → more intense
   section, less → step down.
   ([The Game Audio Co](https://www.thegameaudioco.com/the-role-of-adaptive-music-in-creating-imersive-game-worlds))
3. **Keep a tonal home.** Fixed scale + explicit tonic + main chord; resolve to
   it. *(§4; mirrors `edm_theory.md` modal stasis.)*
4. **One clock, one key for anything that overlaps.** Shared tempo & key for
   combinable stems (RDR rule, §5).
5. **Change only on phrase boundaries.** Quantize every switch to bar/beat/cue
   (§2).
6. **Bridge incompatible jumps.** Use a transition segment when key/tempo/mood
   differ (§2/§5).
7. **Earn variety from recombination, not new material.** Variation > generation
   for fighting repetition; mute the melody, don't add a new one (§3).
8. **Budget silence.** Drop out deliberately; let stingers land (§3).
9. **Stay under the gameplay.** Compress range, duck for dialogue/SFX (§3).
10. **Fewer, stronger blocks.** The whole canon trends toward *small libraries of
    strong chunks selected by state*, not sprawling timelines.

---

## 7. Best-in-class breakdowns (the *how*, not the praise)

Named, attributable structural mechanisms worth stealing.

### DOOM (2016) — Mick Gordon — *modular intensity layering*
A modular stem system that **combines pre-recorded loops on the fly** rather than
playing fixed tracks, scaling through intensity tiers — reported as **Ambient
(synth-led, minimal drums) → Light Combat → Medium Combat → Heavy Combat**
*(tier names from a single aggregator — verify)*. Uses **both** vertical layering
and horizontal resequencing via middleware, with the composer involved in the
implementation. Much of the "instrumentation" is **sound design itself** (heavily
processed/synthesized) — sound design *as* composition.
([GDC Vault "DOOM: Behind the Music"](https://www.gdcvault.com/play/1024068/-DOOM-Behind-the),
[mechanism breakdown](https://ensigame.com/articles/gaming/secrets-of-dooms-music-mick-gordons-adaptive-soundtrack-and-its-impact-on-gameplay-2),
[Game Developer video writeup](https://www.gamedeveloper.com/audio/video-making-the-music-of-i-doom-i-),
[Vice/Waypoint](https://www.vice.com/en/article/how-the-doom-soundtrack-was-made-will-melt-your-puny-mortal-mind/))

### Red Dead Redemption 2 — Woody Jackson — *the single-key stem engine*
The cleanest illustration of the §5 key/tempo rule. RDR1 recorded **all stems at
130 BPM in A minor** so the engine could freely mix them by location/onscreen
action without clashing. RDR2 scaled **5 → 11 stem tracks** (~4–5 min each),
**relaxed** the strict single-key/tempo limit, and **paid for it** — Jackson kept
narrative cues in shared tempo/key, and seamlessness got harder once the
constraint was lifted. The lesson cuts both ways: the constraint is what *makes
it work*; relaxing it is a budget line item.
([RDR2 music (Wikipedia)](https://en.wikipedia.org/wiki/Music_of_Red_Dead_Redemption_2),
[Rockstar Newswire (primary)](https://www.rockstargames.com/newswire/article/9k1248838o535o/Creating-The-Score-of-Red-Dead-Redemption-2-with-Woody-Jackson-and-Vox))

### Hades / Transistor / Bastion — Darren Korb (Supergiant) — *tag-driven sections + FMOD*
Cues built in **distinct elongated sections**; on a **"progression tag"** from
the game the music **switches at the next appropriate beat marker**; during a
fight **every stem turns on**, and an **"ending tag"** is cued when the fight
clears. Runs on **FMOD Studio**, markers for section transitions, dynamic stems
on/off by state. *Transistor* exposes adaptivity to the player via a **"hum"
button** (two parallel soundtracks), and entering turn-based combat applies an
**EQ filter** + ethereal vocals to signal the state.
([Game Developer: Korb on middleware](https://www.gamedeveloper.com/game-platforms/composer-darren-korb-talks-audio-middleware-and-its-importance-to-game-developers),
[Hades mechanism breakdown](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/),
[PlayStation Blog: Transistor](https://blog.playstation.com/2014/05/23/behind-the-music-and-sounds-of-transistor/))

### Journey — Austin Wintory — *the avatar instrument & progressive layering*
The **cello is the player's avatar** — designed to "undergo a metamorphosis that
exactly mirrors what the player is going through," starting as soloist and
**expanding toward full orchestra** as the journey progresses. Genuinely
adaptive: adjusts to **player pace** (extending solo passages during slow
exploration, remixing loops to avoid repetition), layering motifs in response to
actions. The **first game soundtrack ever nominated for a Grammy** (55th
Grammys, Best Score Soundtrack for Visual Media).
([Classic FM](https://www.classicfm.com/composers/wintory/music/journey/),
[NME 10th-anniversary feature](https://www.nme.com/features/gaming-features/journey-anniversary-austin-wintory-traveler-soundtrack-3181421),
[Wintory's own primer](https://awintory.medium.com/from-journey-to-erica-214355002896),
[GameSpot: Grammy nom](https://www.gamespot.com/articles/journey-soundtrack-nominated-for-grammy-award/1100-6401149/))

### Mini Metro — Disasterpeace — *constraint-based coherence, no loops*
Pure data-sonification + serialism, **no looping tracks at all**: each metro line
is a sequence of pulses, **each station = one pulse**; gameplay shifts the
sequences (simpler network → sparser music; faster sim → faster music).
**Anti-wandering by hard constraint:** harmony is drawn from a predefined list of
"qualities," the system **randomly selects constrained scales and *retries until*
it meets harmonic-compatibility criteria**, staying in simple scales (e.g. major
pentatonic) to avoid sounding ominous. The clearest practitioner example of §4's
"constrain to a tonal home + reject incompatible draws."
([Designing Sound interview](https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace/))

### Fez — Disasterpeace — *aleatoric recombination*
Partly **aleatoric/spatial**: in certain areas instruments and layers
**recombine in non-linear, semi-random ways** so the mix differs each visit,
built from minimal pads + synth lead + optional arp/drum stems.
([game-audio analysis](https://audioandmusic.wordpress.com/2015/07/14/the-fez-soundtrack-and-sfx-composed-by-disasterpeace-gameaudio/),
[Vice: Disasterpeace resamples Fez](https://www.vice.com/en/article/layers-disasterpeace-resamples-his-soundtrack-for-ifezi-and-breaks-it-down-for-us/))

### Generative flagships
- **No Man's Sky — "Pulse" (Paul Weir + 65daysofstatic).** A generative engine
  Weir calls **"a glorified random file player"**: **instruments** (collections
  of sounds) placed on a **"canvas"** with playback logic (how often each can
  play, pitch/pan/volume). Crucially **gated by soundscape type** (planet, space,
  wanted, map) and **"higher-interest areas"** that trigger on game events
  (facing a planet, warping) — *game-state gating is the anti-wandering
  mechanism.* 65daysofstatic **"tore the album apart and reconstructed it inside
  the generative system, so it sounds like the album but never is the album."**
  ([A Sound Effect Q&A with Weir](https://www.asoundeffect.com/no-mans-sky-sound-procedural-audio/),
  [Audiokinetic Q&A](https://www.audiokinetic.com/en/blog/behind-the-sound-of-no-mans-sky-a-qa-with-paul-weir-on-procedural-audio/),
  [GDC "The Sound of No Man's Sky"](https://www.gdcvault.com/play/1024067/The-Sound-of-No-Man),
  [Music Week](https://www.musicweek.com/media/read/65daysofstatic-create-self-generating-soundtrack-for-no-man-s-sky/065607))
  Weir's working definitions worth adopting: **generative** = "a randomised
  process with some rules of logic to control the range of values" (need not be
  interactive); **procedural** = real-time synthesis driven by live game data.
- **Spore — Kent Jolly & Aaron McLeran, Brian Eno consultant.** Per-scene **Pure
  Data patches**; the **melody generator is based on Markov models**; McLeran
  framed it as **"composing in probabilities."** (Direct precedent — and warning
  — for a Markov arrangement.)
  ([GDC 2008 "Procedural Music in SPORE"](https://www.gdcvault.com/play/323/Procedural-Music-in),
  [Rolling Stone on Eno's Spore score](https://www.rollingstone.com/culture/culture-news/brian-enos-mutating-spore-score-reinventing-game-music-255336/))
- **Minecraft — C418 (Daniel Rosenfeld).** Deliberate **sparsity**: music plays
  only after **~15–20 minutes** of silence; long pauses produce a stronger
  emotional effect than frequent playback. **State-agnostic** by design — doesn't
  track night/battle, sidestepping adaptive problems by not tracking state at
  all. The minimalist counter-argument to over-engineering.
  ([Red Bull Music Academy interview](https://daily.redbullmusicacademy.com/2015/08/c418-interview/))
- **Vib-Ribbon (NanaOn-Sha, 1999).** Loads fully into RAM so the disc can be
  swapped for **any audio CD**, **generating a unique level from any track** —
  generativity from arbitrary audio input. (Plus Rez/Electroplankton at the
  toy/instrument end, where structure comes from the *player*, not a planner.)
  ([Vib-Ribbon (Wikipedia)](https://en.wikipedia.org/wiki/Vib-Ribbon))

### Honorable mentions (well-sourced, leitmotif/structure)
- **Halo — Marty O'Donnell:** interactive engine that **changes pace and
  repeats/loops based on player action**; "ancient feel" + Gregorian chant.
  ([Seattle Times](https://www.seattletimes.com/business/halo-wouldnt-be-the-same-without-evocative-music-of-marty-odonnell/))
- **God of War (2018/Ragnarök) — Bear McCreary:** leitmotif deployed for
  **narrative payoff** (final battle states Kratos' theme; "The Path" fuses Greek
  + Norse themes).
  ([composer's blog](https://bearmccreary.com/god-of-war-ragnarok/))
- **The Last of Us — Gustavo Santaolalla:** organized around **two timbral
  poles** (ronroco vs. Fender bass), motifs written abstract-first, then adapted
  to cues.
  ([Spitfire Audio interview](https://composer.spitfireaudio.com/en/articles/gustavo-santaolalla-on-the-enduring-power-of-the-last-of-us))
- **Final Fantasy XV — Sho Iwamoto (GDC 2017):** horizontal re-sequencing via a
  custom engine **"MAGI"** that adjusts tempo/time-signature and places sync
  points along the track to handle meter changes with cohesive transitions.
  ([Game Developer](https://www.gamedeveloper.com/audio/video-game-music-systems-at-gdc-2017-pros-and-cons-for-composers))

---

## 8. Mentoring `cyber_synth`: mapping the canon onto this engine

The "out of hand" feeling is a common one and the canon explains it. It happens
when a design grows a **linear timeline** — automation lanes, named voices,
per-section overrides — *and* a **free-wandering chain**, a biased Markov over
states like intro / build / drop / peak / breakdown / outro. Those are the two
hardest-to-tame poles, and growing both at once compounds them. The canon's
advice is to collapse toward the **hybrid middle**: a *small* library of strong
blocks, selected by a *state or intensity* signal, with a *planned* arc and a
*tonal home*.

Four concrete, low-risk moves:

1. **Re-label the Markov as a *tier* system and drive it with intensity, not
   RNG.** Per-state profiles governing pump, density and voice gating already
   amount to a vertical-intensity stack. Make the **primary driver a monotonic
   intensity or tension input** — a scene state, or a slow tension value — and
   keep RNG only for *humanisation within a tier*. This is the single biggest
   "rein it in" lever, because it converts wandering into directed
   tension and release.

2. **Give the chain a plan and a payoff.** A bias toward a favoured state is a
   start; strengthen it into a **planned arc**, a target such as
   build → drop → peak that the chain bends toward and resolves to. Plan first,
   fill second, so a session always reaches a payoff instead of meandering. The
   Markov then becomes the *variation* layer rather than the *structure* layer.

3. **Keep one clock and one key for anything that overlaps.** One tonic, one
   mode, one grid, reinforced by [`edm_theory.md`](./edm_theory.md)'s
   **modal-stasis** finding. Per-section key and tempo overrides are the RDR2
   "relax the constraint, pay the cost" move — use them **sparingly**, and
   **bridge** any key or tempo change with a transition section rather than a
   hard cut.

4. **Quantise every move to a phrase boundary.** Advance state per phrase and
   fire moves on state entry. Layer switches and automation snaps should land on
   bar or cue boundaries too, and one-shot gestures — a throw, a bloom, a freeze,
   a crush — work as **stingers**: short, resolved, grid-synced.

5. **Earn variety from recombination, not more material.** Before adding more
   automation lanes or melodic voices to `SONG`, reach for the cheaper canon
   tools first: **mute/unmute the melody by sub-state** (Skyward Sword, §3),
   alternate fills, the `FocusEnsemble` soloing you already have. Variation >
   generation (§6 rule 7).

6. **Budget silence and stay under the mix.** The engine has the FX rack and
   per-genre mastering to do this; the canon just says to *use* dropouts
   deliberately (§3) so the drop and the stingers land — a structural tool you
   already have the buttons for.

7. **Right-size the ambition per context.** Minecraft (§7) is the permission
   slip to *not* build a full state machine for ambient genres — long sparse beds
   + randomized one-shots (§5) is a legitimate, canonical structure, not a
   cop-out. Reserve the heavy hybrid machinery for the high-energy genres that
   actually pay it off.

> **The mentor's one-liner:** *stop authoring the song and start authoring the
> rules that select it.* Fewer, stronger blocks; an intensity signal that picks
> them; a planned arc that guarantees a payoff; one key and one clock under it
> all. That is the whole of game-music structure, and it's also how this design
> stops growing out of hand.

---

## 9. Source index (best-of, for fast re-verification)

**Foundational form & taxonomy**
- Karen Collins, *Game Sound* (MIT Press) — https://mitpress.mit.edu/9780262033787/game-sound/ · interactive/adaptive/dynamic definitions: https://www.diva-portal.org/smash/get/diva2:1446866/FULLTEXT01.pdf
- Winifred Phillips, *A Composer's Guide to Game Music* (MIT Press) — https://mitpress.mit.edu/9780262534499/a-composers-guide-to-game-music/ · blog: https://winifredphillips.wpcomstaging.com/2016/04/20/interactive-music-for-the-video-game-composer/
- Phillips, "Horizontal Resequencing & Dynamic Transitions" (GDC 2021) — https://www.gamedeveloper.com/audio/horizontal-resequencing-and-dynamic-transitions-for-game-music-composers

**Techniques & middleware (the implementation reference)**
- FMOD Studio docs — authoring events: https://www.fmod.com/docs/2.03/studio/authoring-events.html · instruments: https://www.fmod.com/docs/2.03/studio/working-with-instruments.html · concepts: https://www.fmod.com/docs/2.03/studio/fmod-studio-concepts.html
- Wwise 201 course — https://www.audiokinetic.com/en/courses/wwise201/ · No Straight Roads dev blog: https://www.audiokinetic.com/en/blog/designing-the-musical-game-world-of-no-straight-roads/
- Vertical vs horizontal (3-tier stack, identical-tempo stems) — https://www.thegameaudioco.com/making-your-game-s-music-more-dynamic-vertical-layering-vs-horizontal-resequencing

**Laws & principles**
- Kondo GDC 2007 — https://www.gamedeveloper.com/game-platforms/gdc-koji-kondo-s-interactive-musical-landscapes · transcript: https://www.nintendoworldreport.com/feature/13118/koji-kondos-gdc-2007-presentation
- Non-fatiguing loops — https://www.gamedeveloper.com/audio/rethinking-the-audio-loop-in-games · https://intermittentmechanism.blog/2023/04/12/loops-in-video-game-music/
- Leitmotif/economy — https://scholar.valpo.edu/cus/1254/ · https://www.researchgate.net/publication/372443387_Leitmotivic_Strategies_in_Nobuo_Uematsu's_Final_Fantasy_Soundtracks
- Mix discipline / silence — https://www.asoundeffect.com/game-audio-mixing-demystified/ · https://www.wayline.io/blog/sound-of-silence-video-game-immersion

**Generative: failure mode & fixes**
- Briot & Pachet, "no sense of direction" + structure/sub-task fixes — https://arxiv.org/pdf/1712.04371
- Plut & Pasquier deep dive (directionality, tension curve, valence/arousal/tension) — https://www.gamedeveloper.com/audio/deep-dive-generative-music-in-video-games · survey: https://www.sciencedirect.com/science/article/abs/pii/S1875952119300795
- Scirea MetaCompose (empirical tension increase) — https://marcoscirea.com/thesis/Scirea-Affective_Music_Generation.pdf · flow study: https://gamestudies.org/1802/articles/sites_potter

**Breakdowns**
- DOOM (GDC) — https://www.gdcvault.com/play/1024068/-DOOM-Behind-the
- RDR2 single-key stems — https://en.wikipedia.org/wiki/Music_of_Red_Dead_Redemption_2 · primary: https://www.rockstargames.com/newswire/article/9k1248838o535o/Creating-The-Score-of-Red-Dead-Redemption-2-with-Woody-Jackson-and-Vox
- Hades/Korb tag-driven sections — https://www.gamedeveloper.com/game-platforms/composer-darren-korb-talks-audio-middleware-and-its-importance-to-game-developers
- Journey/Wintory — https://www.classicfm.com/composers/wintory/music/journey/ · primer: https://awintory.medium.com/from-journey-to-erica-214355002896
- Mini Metro constraint-retry — https://designingsound.org/2016/02/18/the-programmed-music-of-mini-metro-interview-with-rich-vreeland-disasterpeace/
- No Man's Sky / Pulse — https://www.asoundeffect.com/no-mans-sky-sound-procedural-audio/ · https://www.gdcvault.com/play/1024067/The-Sound-of-No-Man
- Spore / Pd + Markov — https://www.gdcvault.com/play/323/Procedural-Music-in
- Minecraft / C418 sparsity — https://daily.redbullmusicacademy.com/2015/08/c418-interview/

---

*Compiled 2026-06 by fan-out web research (5 angles). Links are search-attested,
not page-fetched — see the verification caveat at the top. Spot-check load-bearing
primary sources (the GDC talks, the FMOD/Wwise option names, the RDR/DOOM
numbers) in a browser before quoting verbatim.*
