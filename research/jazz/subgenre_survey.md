# Jazz subgenre survey & context map

Research backing the procedural-audio music engine: vary the indoor generative
jazz combo by location/context in a noir murder-mystery city of civilized
animals. The engine synthesizes live (Web Audio API, no audio files), so these
notes are about *feel* and *parameters* (tempo, density, instrumentation,
harmonic color) more than about reproducing specific recordings.

Three parts: (1) a survey of jazz subgenres, (2) a context -> feel mapping with
proposed tags, (3) a compact controlled-vocabulary tag taxonomy for the engine.

---

## TASK 1 — Subgenre survey

BPM bands (corroborated): under ~100 = cool/ballad/spiritual; ~100-180 swinging =
swing/hard bop/modal/soul jazz; above ~180 with dense changes = bebop. Free jazz
is tempo-agnostic (often pulseless). Latin/bossa sit ~120-160 but with even
(non-swung) eighths.

| Subgenre | Era | Feel / mood | Tempo (BPM) | Typical instrumentation | Harmonic character | Adjectives |
|---|---|---|---|---|---|---|
| New Orleans / Dixieland | 1900s-1920s | Festive, communal, rollicking | ~110-200 | Cornet/trumpet, clarinet, trombone, banjo, tuba/string bass, drums, piano | Simple diatonic, I-IV-V, blues sevenths; collective polyphony | rollicking, jubilant, old-timey, polyphonic |
| Stride / ragtime piano | 1900s-1930s | Bouncy, virtuosic, parlor showpiece | ~90-200 | Solo piano (left-hand stride bass + right-hand melody) | Diatonic with chromatic passing chords, ragtime syncopation | bouncy, jaunty, ornate, syncopated |
| Swing / big band | 1930s-1945 | Danceable, confident, glossy | ~120-200 | Big band (sax/brass sections), rhythm section; or small swing combo | Functional changes, riffs, section voicings, blues turnarounds | swinging, exuberant, polished, propulsive |
| Gypsy jazz (jazz manouche) | 1930s- | Romantic, hot, restless | ~140-240 | Two acoustic guitars (lead + rhythm "la pompe"), violin, double bass | Diminished/minor-major color, fast arpeggios, minor-key drama | fiery, romantic, nimble, acoustic |
| Bebop | mid-1940s-1950s | Cerebral, urgent, virtuosic | ~180-300+ | Small combo: trumpet, alto/tenor sax, piano, bass, drums | Dense ii-V-I, extensions (9/11/13), tritone subs, rapid changes | frantic, intricate, brainy, angular |
| Cool jazz | late 1940s-1950s | Relaxed, cerebral, airy | ~70-130 | Smaller combos, often with French horn/tuba/flute; light drums | Counterpoint, classical color, unusual meters, softer dynamics | mellow, restrained, breezy, lyrical |
| Hard bop | mid-1950s-1960s | Earthy, soulful, driving | ~110-200 | Trumpet + tenor sax front line, piano, bass, hard-swinging drums | Bebop changes + gospel/blues/R&B directness, bluesy minor | gritty, soulful, punchy, bluesy |
| Modal jazz | late 1950s-1960s | Spacious, contemplative, hypnotic | ~80-160 | Sax/trumpet, piano (open voicings), bass, drums | Modes (Dorian/Mixolydian) over static harmony; few chord changes | spacious, brooding, hypnotic, open |
| Soul jazz / organ trio | late 1950s-1960s | Greasy, groovy, joyful | ~90-160 | Hammond B3 organ, guitar, drums (+ tenor sax); organ covers bass | Blues/gospel, vamps, 12-bar, dominant 9ths | greasy, funky, groovy, churchy |
| Free jazz | 1960s- | Chaotic, intense, abstract | tempo-agnostic / pulseless | Sax(es), trumpet, bass, drums; no fixed roles | Atonal/pantonal, no fixed changes, collective improv | abstract, abrasive, searching, untethered |
| Latin / bossa / Afro-Cuban | 1940s- (bossa late 1950s) | Sultry, warm; bossa = cool & intimate | bossa ~120-160; Afro-Cuban ~150-220 | Nylon guitar/piano, bass, light percussion (bossa); congas/timbales/montuno (Afro-Cuban) | Lush extended chords (bossa); clave-driven, modal vamps (Afro-Cuban) | sultry, warm, breezy, rhythmic |
| Lounge / easy-listening | 1950s-1960s | Pleasant, suave, background | ~80-130 | Vibraphone, light piano, brushed drums, strings, muted horns | Pretty, consonant, soft extensions, little tension | suave, plush, unobtrusive, cocktail |
| Smooth jazz | 1980s- | Slick, mellow, polished | ~90-120 | Electric piano, sax lead, synth pads, electric bass, soft drums | Pop/R&B changes, clean major 7ths, predictable | slick, glossy, mellow, radio-friendly |
| Noir / film-noir jazz | 1940s-1950s (filmic) | Tense, shadowy, sensual, melancholy | ~60-120 | Muted/plunger trumpet, breathy sax, brushed drums, walking bass, vibraphone, piano | Minor keys, chromatic tension, suspended/unresolved chords, sparse | smoky, shadowy, tense, sultry, melancholy |
| Jazz ballad | timeless | Tender, intimate, aching | ~45-75 | Piano + bass + brushed drums; solo horn or voice | Rich extended chords, rubato, lush ii-V resolutions | tender, aching, intimate, slow |

---

## TASK 2 — Context -> feel mapping (with proposed tags)

Noir-appropriate indoor contexts. Each lists the fitting subgenre(s), the target
mood, suggested tempo/instrumentation, and the tag set drawn from the Task 3
vocabulary. Tags are lowercase snake_case.

### Player's home
- **Subgenre:** jazz ballad / cool jazz
- **Mood:** intimate, reflective, safe haven
- **Tempo/instrumentation:** slow (~55-75), piano + brushed drums + bass; sparse
- **Tags:** `subgenre:ballad`, `tempo:slow`, `mood:intimate`, `density:sparse`, `instr:piano_trio`, `era:1950s`

### Flophouse
- **Subgenre:** noir jazz / jazz ballad (worn, lonely)
- **Mood:** desolate, broke, melancholy
- **Tempo/instrumentation:** slow (~55-70), lone muted horn or piano, very thin
- **Tags:** `subgenre:noir`, `tempo:slow`, `mood:melancholy`, `density:sparse`, `instr:solo_horn`, `era:1950s`

### Police station
- **Subgenre:** hard bop (procedural, businesslike) with noir tension
- **Mood:** tense, busy, no-nonsense
- **Tempo/instrumentation:** medium (~120-150), tenor + piano + walking bass + crisp drums
- **Tags:** `subgenre:hard_bop`, `tempo:medium`, `mood:tense`, `density:busy`, `instr:combo`, `era:1950s`

### Jazz club
- **Subgenre:** hard bop / swing (the real thing, live)
- **Mood:** vibrant, alive, the genre showcase
- **Tempo/instrumentation:** medium-fast (~140-180), full combo, front-line horns, soloing
- **Tags:** `subgenre:hard_bop`, `tempo:fast`, `mood:vibrant`, `density:full`, `instr:full_combo`, `era:1950s`

### Low-rent apartment
- **Subgenre:** soul jazz / organ trio (radio playing down the hall)
- **Mood:** lived-in, warm-but-shabby, everyday
- **Tempo/instrumentation:** medium (~95-130), organ + guitar + drums, groove vamp
- **Tags:** `subgenre:soul_jazz`, `tempo:medium`, `mood:warm`, `density:medium`, `instr:organ_trio`, `era:1960s`

### Library
- **Subgenre:** modal jazz / cool jazz
- **Mood:** quiet, spacious, contemplative
- **Tempo/instrumentation:** slow-medium (~80-110), open piano voicings, bass, soft brushes
- **Tags:** `subgenre:modal`, `tempo:slow`, `mood:contemplative`, `density:sparse`, `instr:piano_trio`, `era:1960s`

### Smoky bar
- **Subgenre:** noir jazz / jazz ballad
- **Mood:** sultry, shadowy, late-night
- **Tempo/instrumentation:** slow-medium (~70-100), breathy sax, brushed drums, walking bass, vibes
- **Tags:** `subgenre:noir`, `tempo:slow`, `mood:sultry`, `density:medium`, `instr:combo`, `era:1950s`

### Diner
- **Subgenre:** swing / lounge (jukebox/easy)
- **Mood:** mundane, cheery, unhurried
- **Tempo/instrumentation:** medium (~110-140), light combo, vibraphone, brushed swing
- **Tags:** `subgenre:lounge`, `tempo:medium`, `mood:cheery`, `density:medium`, `instr:combo`, `era:1950s`

### Wealthy patron's parlor
- **Subgenre:** lounge / cool jazz (cocktail)
- **Mood:** suave, refined, moneyed
- **Tempo/instrumentation:** slow-medium (~85-120), vibraphone + light piano + plush strings, muted horn
- **Tags:** `subgenre:lounge`, `tempo:slow`, `mood:suave`, `density:medium`, `instr:vibes`, `era:1950s`

### Back-alley speakeasy
- **Subgenre:** New Orleans/Dixieland or hot gypsy jazz (illicit, old-world)
- **Mood:** clandestine, hot, conspiratorial
- **Tempo/instrumentation:** medium-fast (~140-200), banjo/guitar, clarinet, muted trumpet, upright bass
- **Tags:** `subgenre:dixieland`, `tempo:fast`, `mood:clandestine`, `density:busy`, `instr:trad_combo`, `era:1920s`

### Morgue / coroner
- **Subgenre:** modal / free jazz / noir (cold, eerie)
- **Mood:** cold, eerie, clinical dread
- **Tempo/instrumentation:** very slow or pulseless, sustained tones, sparse vibes, bowed bass, dissonance
- **Tags:** `subgenre:free`, `tempo:rubato`, `mood:eerie`, `density:sparse`, `instr:ambient`, `era:1960s`

### Newsroom
- **Subgenre:** bebop / hard bop (frantic, deadline)
- **Mood:** frantic, busy, clattering
- **Tempo/instrumentation:** fast (~190-260), trumpet + sax trading, driving drums, fast walking bass
- **Tags:** `subgenre:bebop`, `tempo:fast`, `mood:frantic`, `density:full`, `instr:combo`, `era:1940s`

---

## TASK 3 — Compact tag taxonomy (controlled vocabulary)

Six dimensions. Each context gets exactly one value per dimension (a tuple),
keeping selection deterministic and small. Each dimension maps to engine knobs:
`subgenre`/`instr` pick the patch/voicing set, `tempo` sets bpm, `density`/`mood`
scale event probability, layer gains, and harmonic tension; `era` is optional
flavor (tone color / reverb / processing).

### Dimension: `subgenre`
Picks the generative pattern family (changes, voicings, swing feel).
`dixieland` · `stride` · `swing` · `gypsy` · `bebop` · `cool` · `hard_bop` ·
`modal` · `soul_jazz` · `free` · `latin` · `lounge` · `smooth` · `noir` ·
`ballad`

### Dimension: `tempo`
Coarse bands -> bpm ranges the engine samples within.
`rubato` (pulseless / ~40-60) · `slow` (~55-90) · `medium` (~95-150) ·
`fast` (~150-220) · `frantic` (~220-300)

### Dimension: `mood`
Emotional target; scales tension/timbre.
`intimate` · `melancholy` · `tense` · `vibrant` · `warm` · `contemplative` ·
`sultry` · `cheery` · `suave` · `clandestine` · `eerie` · `frantic`

### Dimension: `density`
How many simultaneous voices / how busy the comping & event gaps are.
`sparse` · `medium` · `busy` · `full`

### Dimension: `instr`
The ensemble/patch set.
`solo_horn` · `piano_trio` · `organ_trio` · `vibes` · `combo` (front-line +
rhythm) · `full_combo` (combo + soloing/section) · `trad_combo` (banjo/clarinet/
muted brass) · `ambient` (sustained/textural)

### Dimension: `era`
Optional period flavor (tone color, reverb, lo-fi processing).
`1920s` · `1930s` · `1940s` · `1950s` · `1960s` · `1980s`

### Notes for the engine
- A context is described by one tuple, e.g. the jazz club =
  `{subgenre:hard_bop, tempo:fast, mood:vibrant, density:full, instr:full_combo, era:1950s}`.
- `mood` and `density` are the cheapest live knobs (gain/probability scaling);
  `subgenre` and `instr` are the heavier structural picks (which generators run).
- `tempo` bands map to bpm ranges so two contexts sharing a band still differ via
  the other dimensions.
- This vocabulary is intentionally small and reusable; add a value only when a
  needed context can't be expressed by an existing tuple.

---

### Sources
- [The Different Types of Jazz Explained — Jazzfuel](https://jazzfuel.com/types-of-jazz-music-styles/)
- [List of jazz genres — Wikipedia](https://en.wikipedia.org/wiki/List_of_jazz_genres)
- [Cool Jazz vs. Hard Bop — Musical Flora](https://www.musicalflora.com/genres/jazz/cool-jazz-vs-hard-bop-detailed-comparison-jazz-subgenres/)
- [Jazz Subgenres to Know — Fiveable](https://fiveable.me/lists/jazz-subgenres)
