# Song Construction Basics — the Arithmetic Before the Calculus

The **foundation layer** the rest of this repo's music research was quietly
standing on. [`edm_theory.md`](./edm_theory.md) codifies each EDM genre's
*vocabulary* (mode, progression, bassline, the intro→build→drop curve);
[`game_music_structure.md`](./game_music_structure.md) codifies the *interactive*
layer above it (state machines, vertical layering, anti-wandering). Both jumped
straight to the genre/PhD work. This doc is the **arithmetic and calculus
underneath all of it** — the universal, genre-agnostic craft of building a song:
*why* structure works at all (the philosophy), the *forms* songs take, the
*phrase* as the basic unit, how a *melody* is made and developed, the *harmony*
and *rhythm* primitives, and the working songwriter's *tried-and-true recipes*.

> **The one throughline.** **Music is a temporal art, so its structure is not
> decoration — it is the listener's only handhold.** A painting hangs in space;
> you can re-scan it. Music exists only in the vanishing present, reconstructed
> from memory and projected forward by expectation. **Form is the management of
> memory and attention over time.** Tension/release, unity/variety,
> expectation/surprise, contrast, climax, grouping — every principle below is a
> technique for keeping a listener *oriented* in a medium that never holds still.
> A generator that emits note-to-note or state-to-state with no higher plan isn't
> "free" — it has abandoned the listener's handhold. That is exactly the
> **"wandering"** failure `game_music_structure.md` §4 already diagnosed; this doc
> is its first-principles charter.

> **Scope & method.** A *sourced* reference written **for a generator, not a
> listener** — every section ends in a codifiable rule. Compiled by fan-out web
> research (5 angles). **Verification caveat (same as
> [`VERIFICATION_NOTES.md`](./VERIFICATION_NOTES.md)):** `WebFetch` returns
> **HTTP 403 on essentially every host** in this environment (Wikipedia,
> archive.org, the Pressbooks/Open Music Theory hosts, hooktheory.com,
> coursera.org, MIT Press — all blocked identically, an anti-bot wall on the
> fetch tool, *not* dead links). So every external link is **search-attested**,
> not page-fetched. The URLs are correct and cross-checked, but spot-check
> load-bearing ones in a real browser — or run
> [`scripts/check-links.mjs`](../scripts/check-links.mjs) locally, where your
> IP/UA clears the wall.

---

## 0. Why this matters here

The repo's own diagnosis — generative music "wanders" without higher-level form
and needs *a planned arc + a tonal home + tension steering*
([`game_music_structure.md`](./game_music_structure.md) §4, §8) — is not a
game-audio quirk. It is a special case of how **all** music works. The genres in
`edm_theory.md` are *dialects*; this doc is the *grammar* they are spoken in. Get
the grammar and the genre dialects become variations on a theme you understand,
not 30 disconnected recipes. That is the cure for "we jumped to the PhD without
the arithmetic."

---

# Part I — The Philosophy (why structure works at all)

Seven grand principles. Each is a facet of the throughline above, and each
*justifies* a rule the repo already adopted — flagged **→ repo** inline.

### 1. Tension & release — the fundamental dynamic

Tension and release is the **breath of music**: instability accumulating, then
resolving to stability, repeated at every scale from a single suspension to a
whole piece. It is not one device among many — it is *the* dynamic the others
serve, and it operates across **every** dimension at once, stackable or set
against each other:

- **Harmony** — dissonance seeking consonance (the V→I pull is the archetype).
- **Melody** — a line rising to a peak / falling to a low pulls and demands a counter-move.
- **Rhythm** — playing off the beat creates tension; landing on it resolves.
- **Dynamics & texture** — louder/denser/higher builds; thinning releases.
- **Arrangement** — adding/removing layers *is* tension/release as orchestration.

The payoff is an **energy arc**: build anticipation, deliver resolution — "akin
to storytelling."
([School of Composition](https://www.schoolofcomposition.com/what-is-tension-and-release-in-music/),
[MasterClass](https://www.masterclass.com/articles/ways-to-create-tension-and-release-in-music))
**→ repo:** the deep justification for "steer with tension, not dice"
(`game_music_structure.md` §4/§6). An intensity signal isn't a control scheme
bolted on — it is the engine participating in *the* core dynamic of music.

### 2. Unity & variety / repetition & contrast — the central balancing act

Enough **repetition** to cohere and be memorable; enough **variety** to avoid
boredom. The whole craft is the balance. **Belkin** sharpens it: unity and
variety are not two things but **two ends of one continuum of similarity** —
"between literal repetition and extreme variation there is a continuum of
similarity between motivic variants"; too little variation "quickly loses the
listener's interest," too much "becomes incoherent."
([Belkin, *A Practical Guide to Musical Composition* — free PDF](https://unitus.org/FULL/Belkin.pdf))
**Schoenberg**: repetition serves *comprehensibility*, but "simple repetition
alone leads to monotony," and **"the larger the piece, the more types of
contrast"** it needs.
([*Fundamentals of Musical Composition* — archive.org](https://archive.org/details/fundamentalsofmu0000scho))

**"Repetition legitimizes."** Bare repetition — with *no other change* —
measurably confers musical *status*: Diana Deutsch's **speech-to-song illusion**
(a spoken phrase looped unchanged is *heard as music*) and Elizabeth Margulis's
mere-exposure work show repetition "shifts your perceptual circuitry such that
the segment is heard as music."
([Margulis, Aeon](https://aeon.co/essays/why-repetition-can-turn-almost-anything-into-music),
[Speech-to-song illusion](https://en.wikipedia.org/wiki/Speech-to-song_illusion))
*(The pithy "repetition legitimizes" is a paraphrase, not a verbatim Eno/Margulis
quote — Eno's actual card is "Repetition is a form of change." The rigorous
backing is Deutsch/Margulis.)*
**→ repo:** the charter for "earn variety from **recombination**, not new
material" (`game_music_structure.md` §6) — move *along* Belkin's continuum (vary
the familiar), don't leap off it. A small library of repeated blocks reads as
*coherent music*, not poverty.

### 3. Expectation & surprise — the psychology of meaning

The "why" beneath tension/release: **musical emotion is the felt experience of
expectations set up, then confirmed, delayed, or denied.** Three pillars:

- **Meyer**, *Emotion and Meaning in Music* (1956) — the founding text: emotion
  arises *internally*, when events **deviate from a learned stylistic norm**.
  Inhibiting/delaying/violating an expected tendency *is* the affect.
  ([archive.org borrow](https://archive.org/details/emotionmeaningin0000meye_y9x1))
- **Narmour** — the **Implication-Realization** model: a melodic interval sets up
  expectations for the next note; size/direction predict what feels likely. Made
  expectation *computable*.
  ([author page](https://web.sas.upenn.edu/enarmour/the-implication-realization-model/),
  [Melodic expectation](https://en.wikipedia.org/wiki/Melodic_expectation))
- **Huron**, *Sweet Anticipation* (2006) — the **ITPRA** synthesis: Imagination +
  Tension (pre-outcome), Prediction + Reaction + Appraisal (post-outcome). Two
  load-bearing ideas: (1) the **prediction effect** — notes sound "right" largely
  *because* the brain predicted them and **rewards itself**; (2) **surprise
  asymmetry** — a pleasant surprise beats a merely-met expectation.
  ([MIT Press](https://mitpress.mit.edu/9780262083454/sweet-anticipation/),
  [free Pearce review PDF](https://www.marcus-pearce.com/assets/papers/huron06-review.pdf))

**→ repo:** *why* a tonal home you always resolve to (`game_music_structure.md`
§4/§6) produces pleasure — it lets the listener predict, and prediction is
rewarded. And *why* a free Markov over states feels empty: it emits events but
sets up no expectations, so there is nothing to confirm or deny, hence no
emotion. A planned arc is what *creates* the expectations the payoff satisfies.

### 4. Form = management of memory & attention over time

Because music is temporal, **structure exists to orient the listener** — the
evolving map, not a container. Belkin states the composer's "first and most
fundamental problem is to ensure the overall **flow** of the piece," that
"intensity must gradually accumulate as the listener builds up a coherent web of
musical associations and expectations," and names the danger in the repo's own
word — **"wandering"** — when material "goes far afield" unconnected to processes
already underway. His three watchwords: **balance, direction, momentum**.
([Belkin — On Musical Ideas](https://alanbelkinmusic.com/site/en/index.php/on-musical-ideas/),
[free PDF](https://unitus.org/FULL/Belkin.pdf))
**→ repo:** the philosophical core of `game_music_structure.md`'s whole thesis.
Direction and momentum are not luxuries; they are **what distinguishes music from
a sequence.**

### 5. Contrast as the engine of sectional form — "departure & return"

Why does a chorus *need* a verse? Why does a bridge exist? **A return only lands
if you left.** Large-scale form runs on **home-and-away**: a section earns impact
by *contrast*, and home earns satisfaction by *having been withheld*. Open Music
Theory on the bridge: its job is to "generate heightened expectation for the
return of A by contrasting with A and temporarily **withholding** it."
([OMT — AABA & Strophic Form](https://viva.pressbooks.pub/openmusictheory/chapter/aaba-and-strophic-form/))
This is Schoenberg's "more contrast" at the sectional level and Huron's
*withholding* across minutes instead of beats.
**→ repo:** justifies the `intro→build→drop→breakdown` curve and "distinct strong
blocks selected by state." The breakdown exists *to make the drop land*. A
generator that never leaves home (pure modal stasis, no away-section) is as
broken as one that never comes home (the wanderer): both kill contrast.

### 6. Climax & proportion — the single high point, placed late

Coherent pieces build to **one principal climax**, and it tends to fall **late —
near the golden section (~61.8%)** — giving the longest run-up and a shorter
resolution tail (Bartók's *Music for Strings, Percussion and Celesta* mvt. I
peaks at bar 55 of 89, a Fibonacci split).
([goldennumber.net](https://www.goldennumber.net/music/))
Huron supplies the *why*: climax is a manufactured maximal-prediction/maximal-
reward event.
**→ repo:** the first-principles case for "give the chain a plan **and a
payoff**." A generator shouldn't step intensity up/down at random — it should
**aim the arc at one high point ~two-thirds through the planned span**. That
single decision most cleanly converts a wandering Markov into a directed piece.

### 7. Gestalt grouping — how the ear builds shapes from sound

Underneath everything: the ear doesn't perceive isolated notes, it
**auto-groups** sound into shapes (Bregman's *auditory scene analysis*). The core
laws: **proximity** (close-in-pitch tones group; big leaps spawn a second
stream), **similarity** (similar timbre/register groups), **good continuation**
(smooth trajectories are followed as one line), **closure** (the mind completes
implied patterns — a cadence "closes"), **common fate** (synced onsets / shared
movement fuse into one source).
([Deutsch — "Grouping Mechanisms in Music" PDF](https://deutsch.ucsd.edu/pdf/PsychMus_Ch9.pdf))
**→ repo:** the *reason* the engineering rules work. One key/clock for stacked
stems (the RDR2 rule, `game_music_structure.md` §5)? **Common fate** fuses
synced, compatible layers into one texture; mismatched stems shatter the mix.
Quantize transitions to bar/cue (§6)? **Good continuation** operates on phrase
units — a mid-phrase cut violates the shape the ear is mid-build. "Fill harmonic
gaps, don't add conflicting chords"? **Similarity/proximity** keeps the addition
inside the stream.

> **The philosopher's one-liner:** *music structure works because a listener can
> only hold a vanishing present — so every rule is a way to keep them oriented,
> predicting, and rewarded.* A generator "wanders" exactly when it stops doing
> that. The cure is not more notes or more states — it is **a plan that creates
> expectation, a tension arc that creates momentum, contrast that earns a return,
> and a single proportioned payoff.**

---

# Part II — Song Form (the shapes songs take)

Form is the top-level arrangement of repeating and contrasting sections
([Song structure](https://en.wikipedia.org/wiki/Song_structure)).

| Form | What it is | Use | Example | Codifiable rule |
|---|---|---|---|---|
| **Strophic (AAA)** | One multi-phrase strophe repeated whole; only lyrics change | folk, hymns, ballads | "Blowin' in the Wind" | `A × N`; melody/harmony fixed, no contrasting section |
| **AABA / 32-bar** | Four ~8-bar sections: two A's, a contrasting B (bridge/"middle-8"), return to A | Tin Pan Alley, jazz standards, early pop | "Over the Rainbow" | `A(8) A(8) B(8) A(8)`; B contrasts; A often ends on the title |
| **Verse–chorus** | Alternating verse (changing lyric, lower energy) and chorus (fixed lyric, hook, title) | rock since the '60s, all modern pop | "Smells Like Teen Spirit" | `[V C] × N`; chorus = highest energy, most-repeated, holds the title |
| **Verse–pre-chorus–chorus** | Adds a transitional "lift" ramping into the chorus | standard contemporary pop | "I Want It That Way" | `[V PC C] × N`; PC raises energy but never peaks |
| **12-bar blues** | 12 bars / three 4-bar phrases over I–IV–V | blues, R&B, rock'n'roll | "Sweet Home Chicago" | `I I I I / IV IV I I / V IV I I`; last 4 = turnaround; lyric often AAB |
| **Binary (AB)** | Two related-but-contrasting sections, no return | Baroque dances | Bach minuets | `A B`; B contrasts (key/cadence) |
| **Ternary (ABA)** | Statement, contrast, return | da capo arias, song bridges | Minuet & Trio | `A B A`; final A restates the opening |
| **Rondo (ABACA…)** | A refrain alternating with contrasting episodes | classical finales | "Für Elise" | `A B A C A …`; A returns between every episode |
| **Through-composed** | Continuously new material; no large-scale section repeat | art song, prog | "Erlkönig", "Bohemian Rhapsody" | `A B C D…`; use when narrative demands constant forward motion |

([AABA/Strophic](https://viva.pressbooks.pub/openmusictheory/chapter/aaba-and-strophic-form/),
[Verse-Chorus](https://viva.pressbooks.pub/openmusictheory/chapter/verse-chorus-form/),
[Thirty-two-bar form](https://en.wikipedia.org/wiki/Thirty-two-bar_form),
[Twelve-bar blues](https://en.wikipedia.org/wiki/Twelve-bar_blues),
[Ternary/Rondo (OER)](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/37-ternary-and-rondo-forms/))

### The sections and their jobs

The reliable arc: **verse pulls in → pre-chorus lifts → chorus delivers.**

- **Intro** — establishes key/tempo/groove/signature hook; often built from
  chorus material to pre-seed the hook.
- **Verse** — carries the narrative; **lyric changes, music fixed**; lower energy
  *by design* so the chorus can pop.
- **Pre-chorus ("lift"/"climb")** — connects verse to chorus; **energy gain
  without peaking** ("the top of the roller coaster before the drop").
- **Chorus / hook section** — the **payload**: highest energy, most repeated,
  lyric-invariant, contains the title; sharply contrasts the verse.
- **Bridge / middle-8** — a deliberate "left turn," usually once, late, to relieve
  repetition before the final chorus (it's the B of AABA).
- **Instrumental / solo** — sustains/varies energy without new lyric.
- **Breakdown** — strips the arrangement down to reset tension before re-entry.
- **Outro / coda** — winds down (fade, hook vamp, tag) for closure.

([Song structure](https://en.wikipedia.org/wiki/Song_structure),
[Verse–chorus form](https://en.wikipedia.org/wiki/Verse%E2%80%93chorus_form),
[pre-chorus](https://producerhive.com/songwriting/what-is-a-pre-chorus/))

**→ generator:** chorus = max energy + max repetition + the title; verse =
variable lyric / fixed music; pre-chorus = strictly monotonic energy ramp;
bridge = appears once, maximally contrasting, before the last chorus.

---

# Part III — The Phrase (the arithmetic)

The bar is not the basic unit of musical thought — the **phrase** is.

- **Phrase** — a relatively complete musical thought with trajectory toward a
  **cadence** (its goal). The basic grammatical unit of melody.
- **Antecedent / consequent (question / answer)** — a phrase pair: the
  **antecedent** ends on a *weak* cadence (usually a Half Cadence — a harmonic
  question); the **consequent** restates the opening but ends on a *stronger*
  cadence (usually a Perfect Authentic Cadence — the answer).
- **The PERIOD** — a phrase-level form = antecedent + consequent; matched length,
  related openings, **weak cadence then stronger**. Often `4 + 4` bars.
- **The SENTENCE (Schoenberg)** — *one* phrase shaped internally as
  **presentation** (a basic idea stated, then immediately repeated/varied) +
  **continuation** that fragments/accelerates and **drives to a cadence**.
  - **Period vs sentence:** a *period* balances two phrases (question ⇄ answer,
    two cadences); a *sentence* is one phrase as state → repeat → spin-out →
    cadence.
- **Call-and-response** — the structural generalization: one part calls, another
  answers; the engine of blues, gospel, and much pop.

([The Period](https://openmusictheory.github.io/period.html),
[Phrase archetypes](https://viva.pressbooks.pub/openmusictheory/chapter/phrase-archetypes-unique-forms/),
[Call and response](https://en.wikipedia.org/wiki/Call_and_response_(music)))

### Hypermeter — the "power of four"

**Hypermeter** is meter above the bar: bars act as beats. Grouping defaults to
**twos → fours → eights**. The nested fourfold recurs at every level: 4
sixteenths → a beat; 4 beats → a bar; 4 bars → a hypermeasure; 4 hypermeasures →
a section. Sections, harmonic shifts, and arrivals align to **hyperdownbeats**,
so the idiomatic grid is **2-, 4-, 8-, 16-bar** blocks; off-grid changes read as
deliberate disruption. Variation comes from bending the grid: **expansion/
extension** (longer than expected; the "one more time" repeat), **truncation**
(shorter), **elision** (one phrase's end *is* the next's beginning).

([Hypermeter](https://viva.pressbooks.pub/openmusictheory/chapter/hypermeter2/),
[Expansion & contraction](https://viva.pressbooks.pub/openmusictheory/chapter/expansion-and-contraction/))

**→ generator:** this is the *theory under* the repo's existing 8/16/32-bar
phrase-block rule (`edm_theory.md` "Arrangement"). Generate on power-of-two
blocks by default; apply extension/truncation/elision **sparingly** as
*intentional* variation. Author toplines as periods: a weak cadence at bar 4, a
strong one at bar 8.

---

# Part IV — Melody & Motivic Development

### Contour & range

A melody's **contour** is the shape its pitch line traces; the most natural is
the **arch** (rise to a peak, fall to the cadence). Give a phrase/song **one**
primary **climax** — the point of greatest tension, often the highest pitch —
and place it in the **back half** (echoing Part I §6's proportion). Keep most
material within ~an octave (**range**), biased toward a comfortable center
(**tessitura**); after a large leap the line tends to **regress toward the
middle**. Ascending builds tension/excitement; descending releases.
([OMT — 16th-c. counterpoint](https://pressbooks.nebraska.edu/openmusictheory/chapter/16th-century-contrapuntal-style/),
[Belkin (free PDF)](https://unitus.org/FULL/Belkin.pdf))

### Step vs leap

**Conjunct** (step, a 2nd) vs **disjunct** (leap, &gt; a 2nd). Most melodies —
especially vocal — are **mostly stepwise with a smaller amount of leaps**; steps
are easiest to sing. Leaps mark emphasis (often into the chorus). **Gap-fill:** a
large leap opens a gap the ear expects **filled by stepwise motion in the
opposite direction**.
([Melodic motion](https://en.wikipedia.org/wiki/Melodic_motion),
[Conjunct & disjunct](https://mymusictheory.com/voice-leading/conjunct-and-disjunct-motion/))
**→ generator:** weight intervals ~70–80% steps / 20–30% leaps; after a leap &gt;
a 3rd, bias the next 1–2 notes to step *back*; reserve an unfilled upward leap for
hook/emphasis points.

### Motivic development — the engine of unity + variety

A **motif** is the smallest memorable idea (~3–5 notes), repeated *and varied*; a
**theme** a fuller statement. Schoenberg's **developing variation**: a piece
"resembles a photo album displaying the life of its basic motive." These
transformations are **pure functions over a motif's `(pitch, duration)` list** —
the cheapest, most principled way to "earn variety from recombination" (Part I §2;
`game_music_structure.md` §6):

| Transformation | One-line spec |
|---|---|
| **Exact repetition** | emit the motif unchanged |
| **Sequence** | restate immediately at a different pitch level (≥2 statements) |
| → real (chromatic) | transpose by the same *exact* interval (may leave the key) |
| → tonal (diatonic) | transpose along the scale (stays in key; intervals flex a semitone) |
| → modulating | successive statements traverse new keys |
| **Transposition** | shift every pitch by a fixed interval (one-off) |
| **Inversion** | mirror contour: each up-interval becomes the same down-interval |
| **Retrograde** | reverse the note order |
| **Retrograde-inversion** | invert, then reverse |
| **Augmentation** | multiply every duration by a constant (×2); pitches unchanged |
| **Diminution** | divide every duration (×½); pitches unchanged |
| **Fragmentation** | keep only a sub-segment; repeat/vary that fragment |
| **Extension** | append new material on restatement |
| **Ornamentation** | insert NCTs/ornaments around the structural pitches |
| **Rhythmic displacement** | start the motif on a different beat (pitches kept) |
| **Truncation** | remove notes from the motif |
| **Interpolation** | insert new note(s) *inside* the motif |

([Thematic transformation](https://en.wikipedia.org/wiki/Thematic_transformation),
[Sequence](https://en.wikipedia.org/wiki/Sequence_(music)),
[Toby Rush — Motivic Development PDF](https://tobyrush.com/theorypages/pdf/en-us/motivic-development.pdf),
[Soundfly — 7 techniques](https://flypaper.soundfly.com/write/7-melody-writing-and-motivic-development-techniques-for-songwriters/))

### Melodic tension & resolution

- **Non-chord tones** (tension against the current harmony): **passing** (step,
  same direction, fills a gap), **neighbor** (step away and back), **suspension**
  (held over a chord change, resolves *down* by step), **appoggiatura** (leapt
  into, resolved by step opposite), **anticipation** (sounded before its harmony).
- **Stable vs tendency degrees:** **1/3/5 (do/mi/sol)** are rest points;
  **2/4/6/7** are active. Tendencies: **ti(7)→do(1)** up (the leading-tone pull,
  strongest), **fa(4)→mi(3)** down, 2→1, 6→5. A **melodic cadence** lands tendency
  tones on stable degrees (most conclusively on **do**).

([Embellishing tones](https://openmusictheory.github.io/embellishingTones.html),
[Stable/unstable scale degree](https://www.hooktheory.com/support/musicreference?concept=music-concepts-stable-unstable-scale-degree))

### Prosody & repetition (for songwriting)

**Prosody** = the marriage of words and music: align **stressed syllables to
strong beats**, and put the **most important word on the phrase's peak note**
(especially when reached by a leap — "the higher you go, the more emphasized the
word"). **Repetition is the engine of memorability** — the "rule of three"
(state a hook ~3×, then vary on the 4th; working memory holds ~3–4 elements), with
*varied*, not literal, repetition to fight monotony.
([Berklee — Prosody](https://online.berklee.edu/takenote/prosody-in-music-and-songwriting/),
[Power of three](https://songtown.com/on-songwriting/melody-and-the-power-of-three/))

**→ generator:** tag each scale degree with a stability weight + resolution
vector; place NCTs on weak positions resolving per type; force 7→1 at cadence for
closure (or leave unresolved to keep momentum). Schedule a motif as repeat×~3
then a varied/extended payoff; apply a transformation between restatements.

---

# Part V — Harmony & Rhythm (the primitives)

### Functional harmony — the engine of harmonic tension/release

Tonal music sorts chords into **three functions**: **Tonic** (rest: I, iii, vi),
**Predominant/subdominant** (departure: ii, IV), **Dominant** (tension: V, vii°).
The universal cycle is **T → PD → D → T** — leave home, build tension, release.
Roman numerals label a chord by scale degree (UPPER = major, lower = minor, ° =
diminished). Minor keys almost always borrow a **major V (or V7)** from harmonic
minor so the dominant can pull.
([Harmonic functions](https://openmusictheory.github.io/harmonicFunctions.html),
[Function (music)](https://en.wikipedia.org/wiki/Function_(music)))

**Cadences** (harmonic punctuation ending phrases):

| Cadence | Motion | Effect |
|---|---|---|
| **Perfect Authentic (PAC)** | V→I, root position, tonic on top | strongest close — final/section ends |
| **Imperfect Authentic (IAC)** | V→I inverted / 3rd–5th on top | softer close — internal |
| **Half (HC)** | ends *on* V | a "question" — antecedent ends |
| **Plagal** | IV→I | "Amen," gentle tag/coda |
| **Deceptive** | V→vi | surprise; prolongs, frustrates closure |

([Cadence](https://en.wikipedia.org/wiki/Cadence))

**The tried-and-true progression canon** (Roman numerals · C/Am example · character):

| Name | Numerals | In C / Am | Character |
|---|---|---|---|
| Three-chord | I–IV–V | C–F–G | foundational rock/country/folk |
| **Axis / "four-chord"** | I–V–vi–IV | C–G–Am–F | the ubiquitous pop loop; anthemic |
| "Sensitive female" (rotation) | vi–IV–I–V | Am–F–C–G | melancholy-then-lift; ballads |
| 50s / doo-wop | I–vi–IV–V | C–Am–F–G | nostalgic, sweet |
| **ii–V–I (jazz)** | ii7–V7–Imaj7 | Dm7–G7–Cmaj7 | the jazz cadence; smooth resolution |
| Circle | vi–ii–V–I | Am–Dm–G–C | strongest forward pull |
| 12-bar blues | I–IV–V (dom7s) | C7…F7…G7 | call-and-response, earthy |
| **Andalusian** | i–♭VII–♭VI–V | Am–G–F–E | descending, dramatic, "Spanish" |
| "Pachelbel" | I–V–vi–iii–IV–I–IV–V | C–G–Am–Em–F–C–F–G | Baroque cascade, serene |

The four-chord **rotations** (I–V–vi–IV, vi–IV–I–V, IV–I–V–vi, V–vi–IV–I) are the
*same four chords* at different starting points — one chord-set + a rotation
index.
([I–V–vi–IV](https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression),
[List of chord progressions](https://en.wikipedia.org/wiki/List_of_chord_progressions),
[Andalusian cadence](https://en.wikipedia.org/wiki/Andalusian_cadence))

**Harmonic rhythm** = the *rate* of chord change. Faster = more energy/drive;
slower = spacious. As a device it **accelerates toward cadences**, and a section
can be lifted just by doubling its rate (one chord/bar in the verse → two
approaching the chorus).
([Harmonic rhythm](https://en.wikipedia.org/wiki/Harmonic_rhythm))

**Tension chords** (spice over the diatonic base): **7ths** (the dom7 tritone
drives V7→I), **sus2/sus4** (replace the 3rd, resolve into it), **secondary
dominants** (V7/x aimed at a non-tonic — e.g. D7→G in C), **borrowed/modal
interchange** (♭VII, iv, ♭VI lifted from the parallel minor).

### Rhythm & groove

- **Meter / metric hierarchy** — beats are **strong/weak** within the bar; 4/4
  dominates pop as **S–w–M–w** (beat 1 strongest, 3 secondary, 2 & 4 weak). The
  **backbeat** accents the weak **2 & 4** (the snare) — the engine of rock/funk
  drive.
- **Syncopation** — accenting off-beats / "ands," disturbing the flow to create
  anticipation released on the next strong beat.
- **Swing / shuffle** — uneven (long–short, triplet-based) beat division
  (50% = straight, ~66% = hard swing).
- **Pocket / groove** — micro-timing: playing slightly **behind** (relaxed) or
  **ahead** (urgent) while staying locked.
- **Clave / tresillo — the universal rhythmic cell:** **tresillo** is a 3-stroke
  cell over 8 eighths — **onsets at 1, 4, 7** (the "3+3+2"), the most reusable
  non-straight cell across African/Afro-Cuban/Latin and modern pop/EDM. **Son
  clave** answers the tresillo (3-side) with a 2-side.

([Beat](https://en.wikipedia.org/wiki/Beat_(music)),
[Syncopation](https://en.wikipedia.org/wiki/Syncopation),
[Swing](https://en.wikipedia.org/wiki/Swing_time),
[Tresillo](https://en.wikipedia.org/wiki/Tresillo_(rhythm)),
[Clave](https://en.wikipedia.org/wiki/Clave_(rhythm)))

**→ generator:** harmony reduces to *key+mode → diatonic triad table →
function-tagged sequence honoring T→PD→D→T → cadence type at phrase ends →
optional 7th/sus/secondary-dominant coloration*. Rhythm reduces to *meter +
per-beat accent weights → backbeat overlay → onset cell (straight or
tresillo 1-4-7 mask) → swing % → per-instrument micro-timing offset*.

---

# Part VI — The Hook & the Working Recipes

### The hook

The most memorable, repeatable unit — engineered to lodge in memory. It can be
**melodic**, **lyrical** (usually the title), **rhythmic** (a riff/groove), or
**harmonic**. By nature short, catchy, repeated — *not* profound. The **chorus is
its canonical home** (fused with the title). A song can carry 3–4 hooks; the
strongest arrange them in a **hierarchy with one dominant hook**. It must repeat
(≥2×, ideally many); pre-seeding it in the intro primes recognition.
([Hook (music)](https://en.wikipedia.org/wiki/Hook_(music)),
[Hooktheory — What is a hook](https://www.hooktheory.com/blog/what-is-a-hook-in-a-song/))

### The energy/arrangement arc as a recipe

Energy must constantly **move** — never stagnant — via instrumentation, density,
register, dynamics. Core moves:

- **Build by addition, contrast by subtraction.** Fill channels first to escape
  the "loop phase," then chip elements away so each section feels purposeful; the
  biggest section plays everything.
- **"Drop one thing to add another"** — trade elements to keep density roughly
  constant, so the ear hears *change*, not just *more*.
- **Gate the low end before a lift** — strip kick/bass 1–4 bars before the chorus,
  slam it back on the downbeat; the chorus reads bigger by contrast.
- **The final-chorus lift** — the **Truck Driver's Gear Change** (key up a
  semitone/whole-tone into the last chorus; effective but clichéd), or no-
  modulation lifts: double the chorus, add an octave/harmony stack, widen the
  stereo image, add a high element (tambourine/shaker) above the verse's ceiling.

([Soundfly — Scaffolding](https://flypaper.soundfly.com/write/scaffolding-song-structure/),
[Waves — Huge Choruses](https://www.waves.com/top-tips-for-huge-choruses),
[Truck Driver's Gear Change](https://tvtropes.org/pmwiki/pmwiki.php/Main/TruckDriversGearChange))

### Section-contrast recipes (making the chorus pop)

Contrast against the section *before* it, not absolute loudness: **register lift**
(chorus melody higher), **harmonic-rhythm change** (chords move faster), **fuller
arrangement** (stacked vocals/reintroduced instruments), **melodic-range jump +
the title at the peak**, **rhythmic-feel change**. The **pre-chorus ramps**; the
**bridge** (after the 2nd chorus, ~8–16 bars) should change at least **two of
four** elements — harmony, melody, rhythm, dynamics — so the returning chorus reads
as release.
([iZotope — verse/chorus contrast](https://www.izotope.com/en/learn/music-production-tips-to-create-contrast-between-verse-and-chorus),
[Orphiq — bridge](https://orphiq.com/resources/how-to-write-a-bridge))

### Named methodologies (the canon, distilled)

- **Pat Pattison (Berklee)** — *prosody* ("the right relationship between form and
  content"); **stability via line-count/length**: even groups & matched lengths
  feel **resolved**, odd groups & unmatched lengths feel **unstable** and spin
  forward; *object writing* (timed, sense-bound free-association for non-clichéd
  imagery). ([Pattison — Structure Creates Expectations](https://www.patpattison.com/structure-creates-expectations))
- **Holistic Songwriting — Friedemann Findeisen, *The Addiction Formula*** —
  structure as **lyric-less storytelling**; tools of **hype / tension / implied
  tension** shaped into rising-falling curves; the **energy curve & "the lift"**;
  **front-load** craft (the first ~15 s is judged before the hook lands).
  ([Holistic Songwriting](https://www.holistic-songwriting.com/the-addiction-formula))
- **Gary Ewer — *Essential Secrets of Songwriting*** — chord-progression formulas,
  melody-from-chords, manipulating melodic direction/range for effect.
  ([blog](https://www.secretsofsongwriting.com/))
- **Jack Perricone — *Melody in Songwriting*** — melody is *learnable*: range,
  contour, rhythm; development by sequence/variation/expansion; the **independent
  melody** (memorable without accompaniment). ([Berklee Press](https://berkleepress.com/songwriting/melody-in-songwriting/))

### Concrete formulas & heuristics (priors, not laws)

- **The four-chord song** (I–V–vi–IV) — near-ubiquitous (Axis of Awesome's "Four
  Chords"); trick: a static melody note over the moving harmony. *The progression
  isn't copyrightable; the melody is.*
- **Call-and-response / question-and-answer** phrasing = tension/release as
  phrase-pairs (verse low/tense, chorus high/resolved).
- **The 80/20 rule** — ~20% (hook/chorus) carries the payload; spend most polish
  there.
- **"Tension and release every X bars"** — periodic build→resolve cycling.
- **Hook every ~6–7 seconds** (Molly-Ann Leikin) — a modern-attention heuristic.

> *Caveat for an engine:* these are commercial conventions to **parametrize and
> deliberately violate**, not laws (Findeisen's whole brand is breaking them once
> internalized).
([4-chord](https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression),
[80/20](https://speedsongwriting.com/applying-the-80-20-rule-to-your-songwriting/),
[tension/release primer](https://www.cliffgoldmacher.com/a-primer-on-tension-and-release-in-your-songwriting/))

---

# Part VII — How this intersects the repo's current model

The engine already encodes the *genre dialects* (`core/music.js` `MODES` /
`PROGRESSIONS` / `BASS_TEMPLATES`; `cyber/genres.js`; `cyber/patterns.js`) and the
*arrangement* layer (`cyber/arrangement.js` `ARC_TEMPLATES` / `ENERGY_LADDER` /
`setIntensity`; `cyber/song.js` `SONG`). The fundamentals above mostly *validate*
and *connect* those; the concrete gaps the basics expose:

1. **Melody is authored-only, never *developed*.** A banked tribute's `topline`/
   `arpLine`/`counterLine` are played **verbatim and cycled per bar**
   ([`README.md`](../README.md) "The `PATTERN` interchange"), and the arp's
   default is a chord-climb. There is **no motivic-development engine** — none of
   Part IV's transformation table (sequence, inversion, augmentation,
   fragmentation…), no contour model, no climax placement, no gap-fill, no
   tendency-tone resolution. This is the single biggest "we skipped the
   arithmetic" gap. The **theme-breeder** (`cyber/breed.js`, the GA over lead
   hooks) is the natural home: make Part IV's transformations the *mutation
   operators*, and score candidates on contour + repetition-vs-variety balance.

2. **Phrase structure isn't modeled.** Patterns are 16-step one-bar grids looped;
   there is no period/sentence/antecedent–consequent and no hypermeter beyond the
   arrangement's `phraseBars`. Cheapest win: author toplines as **periods** — a
   weak (half) cadence at bar 4, a strong (PAC) at bar 8 — so the lead asks and
   answers instead of merely repeating (Part III).

3. **Harmony has no function/cadence semantics.** `PROGRESSIONS` are bare degree
   lists. For the genres that *do* move (trance/house/synthwave per
   `edm_theory.md`), tagging each chord's **T/PD/D function** and marking **cadence
   types** at section ends (HC to open, PAC to close) would let the arranger place
   tension/release deliberately instead of looping a degree array (Part V).

4. **The climax-proportion principle can seed the default arc.** `arrangement.js`
   already has the energy ladder + `setIntensity` + named templates; Part I §6
   says aim the arc at **one payoff ~two-thirds through** the planned span. Make
   that the default target the templates bend toward — the cleanest cure for the
   "wandering" the migration plan is already fighting
   ([`docs/design/song_structure_migration.md`](../docs/design/song_structure_migration.md)).

5. **Groove primitives are partly there.** `swing` exists; the **tresillo 1-4-7
   onset mask** (Part V) is a reusable bass/perc cell worth adding alongside the
   existing `BASS_TEMPLATES`, and per-instrument micro-timing (pocket) is a small
   humanization extension.

> **The bridge to the existing docs:** `edm_theory.md` is *what each genre says*;
> this doc is *the language they say it in*; `game_music_structure.md` is *how to
> deploy it interactively*. Read in that order, the repo stops feeling like it
> "jumped to the PhD" — the arithmetic is now written down underneath the rest.

---

# Source index (best-of, for fast re-verification)

**The free spine (highest value — read these first)**
- **Alan Belkin — *Musical Composition: Craft and Art*** (free PDF + essays +
  YouTube): https://unitus.org/FULL/Belkin.pdf ·
  https://alanbelkinmusic.com/musical-composition-craft-and-art/ — *free* — the
  best single free composition resource; it literally uses "wandering" for the
  repo's failure mode and frames craft as **balance/direction/momentum** + a
  unity/variety **continuum**.
- **Open Music Theory** (CC, *free*; Pressbooks/`.github.io` hosts 403 fetchers):
  [The Period](https://openmusictheory.github.io/period.html) ·
  [Phrase archetypes](https://viva.pressbooks.pub/openmusictheory/chapter/phrase-archetypes-unique-forms/) ·
  [Hypermeter](https://viva.pressbooks.pub/openmusictheory/chapter/hypermeter2/) ·
  [Harmonic functions](https://openmusictheory.github.io/harmonicFunctions.html) ·
  [Embellishing tones](https://openmusictheory.github.io/embellishingTones.html) ·
  [AABA/Strophic](https://viva.pressbooks.pub/openmusictheory/chapter/aaba-and-strophic-form/) ·
  [Verse-Chorus](https://viva.pressbooks.pub/openmusictheory/chapter/verse-chorus-form/)
- **musictheory.net** — *free* interactive lessons/exercises:
  https://www.musictheory.net/lessons
- **Toby Rush — theory posters** (CC BY-NC, *free*; tobyrush.com usually fetchable):
  https://tobyrush.com/theorypages/ ·
  [Motivic Development PDF](https://tobyrush.com/theorypages/pdf/en-us/motivic-development.pdf)
- **Hooktheory** — TheoryTab DB + blog *free* (books/Hookpad paid; host 403s):
  https://www.hooktheory.com/theorytab ·
  [What is a hook](https://www.hooktheory.com/blog/what-is-a-hook-in-a-song/)

**Philosophy / psychology of expectation**
- Meyer, *Emotion and Meaning in Music* — *borrow*: https://archive.org/details/emotionmeaningin0000meye_y9x1
- Narmour, Implication-Realization — *free*: https://web.sas.upenn.edu/enarmour/the-implication-realization-model/
- Huron, *Sweet Anticipation* (ITPRA) — book *paid* (https://mitpress.mit.edu/9780262083454/sweet-anticipation/);
  *free* Pearce review PDF: https://www.marcus-pearce.com/assets/papers/huron06-review.pdf
- Margulis, *On Repeat* — *free* Aeon essay: https://aeon.co/essays/why-repetition-can-turn-almost-anything-into-music ·
  [Speech-to-song illusion](https://en.wikipedia.org/wiki/Speech-to-song_illusion)
- Deutsch, "Grouping Mechanisms in Music" — *free PDF*: https://deutsch.ucsd.edu/pdf/PsychMus_Ch9.pdf
- Tension/release (free practitioner): https://www.schoolofcomposition.com/what-is-tension-and-release-in-music/ ·
  https://www.masterclass.com/articles/ways-to-create-tension-and-release-in-music
- Climax/golden-section: https://www.goldennumber.net/music/

**Form, melody, harmony, rhythm (reference)**
- Schoenberg, *Fundamentals of Musical Composition* — *borrow* + *free full text*:
  https://archive.org/details/fundamentalsofmu0000scho ·
  https://archive.org/stream/SchoenbergArnoldFundamentalsOfMusicalComposition/Schoenberg%20Arnold_Fundamentals%20of%20Musical%20Composition_djvu.txt
- Wikipedia (*free*): [Song structure](https://en.wikipedia.org/wiki/Song_structure) ·
  [Thirty-two-bar form](https://en.wikipedia.org/wiki/Thirty-two-bar_form) ·
  [Verse–chorus form](https://en.wikipedia.org/wiki/Verse%E2%80%93chorus_form) ·
  [Twelve-bar blues](https://en.wikipedia.org/wiki/Twelve-bar_blues) ·
  [Thematic transformation](https://en.wikipedia.org/wiki/Thematic_transformation) ·
  [Sequence](https://en.wikipedia.org/wiki/Sequence_(music)) ·
  [Melodic motion](https://en.wikipedia.org/wiki/Melodic_motion) ·
  [Nonchord tone](https://en.wikipedia.org/wiki/Nonchord_tone) ·
  [Function (music)](https://en.wikipedia.org/wiki/Function_(music)) ·
  [Cadence](https://en.wikipedia.org/wiki/Cadence) ·
  [I–V–vi–IV](https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression) ·
  [Harmonic rhythm](https://en.wikipedia.org/wiki/Harmonic_rhythm) ·
  [Syncopation](https://en.wikipedia.org/wiki/Syncopation) ·
  [Tresillo](https://en.wikipedia.org/wiki/Tresillo_(rhythm)) ·
  [Clave](https://en.wikipedia.org/wiki/Clave_(rhythm))
- Berklee Online blog (*free*): [Prosody](https://online.berklee.edu/takenote/prosody-in-music-and-songwriting/) ·
  [Common chord progressions](https://online.berklee.edu/takenote/common-chord-progressions-and-how-to-make-them-your-own/)

**Songwriting craft (methodologies & recipes)**
- Pat Pattison — *free* essays: https://www.patpattison.com/structure-creates-expectations ·
  Coursera "Songwriting: Writing the Lyrics" (*free-to-audit*): https://www.coursera.org/learn/songwriting-lyrics
- Holistic Songwriting / Findeisen — https://www.holistic-songwriting.com/the-addiction-formula
- Gary Ewer — https://www.secretsofsongwriting.com/
- Perricone, *Melody in Songwriting* (*paid*): https://berkleepress.com/songwriting/melody-in-songwriting/
- Dennis DeSantis, *Making Music: 74 Creative Strategies* — *free PDF*:
  https://cdn-resources.ableton.com/resources/uploads/makingmusic/MakingMusic_DennisDeSantis.pdf
- Coursera Berklee "Developing Your Musicianship" (*free-to-audit*):
  https://www.coursera.org/learn/develop-your-musicianship

**YouTube — song analysis & writing** (not synthesis; all *free*): Holistic
Songwriting, Rick Beato ("What Makes This Song Great"), Adam Neely, 12tone,
**8-bit Music Theory** (game-music structural analysis — closest to this repo's
domain), David Bennett, Signals Music Studio, Nahre Sol, Charles Cornell.

**Free lead-sheet / corpus data (for analysis, mind the rights):**
- OpenEWLD — public-domain subset of the Wikifonia/EWLD lead-sheet corpus
  (MusicXML): https://github.com/00sapo/OpenEWLD —
  *(⚠ "The Real Book" and most musescore.com uploads are copyright-questionable;
  prefer public-domain or original works.)*

---

*Compiled 2026-06 by fan-out web research (5 angles: form · melody/motif ·
harmony/rhythm · philosophy · songwriting craft). Links are **search-attested**,
not page-fetched — see the verification caveat at top and
[`VERIFICATION_NOTES.md`](./VERIFICATION_NOTES.md). Run
[`scripts/check-links.mjs`](../scripts/check-links.mjs) locally to clear the 403s.
Two things to flag before quoting verbatim: "repetition legitimizes" is a
**paraphrase** (rigorously, Deutsch/Margulis), and the "climax in the back ~⅔"
and "hook every 6 s" figures are **heuristics**, not hard statistics.*
