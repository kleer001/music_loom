# Shpongle / psy-dub — production & mix technique (Posford + Ott)

How the *clean, warm, lush psybient* sound is actually built, sourced from the people who make
it: **Simon Posford** (Hallucinogen; the studio half of Shpongle) and **Ott** (Andrew Ottley —
mix/master engineer on several Shpongle records, and a psy-dub artist in his own right). Gathered
from studio interviews (auto-captioned → wording approximate; primary-source quotes flagged vs
third-party style-studies). Pairs with `edm_theory.md` §Psytrance for the deep-bass / liquid-psy
("wubba") deconstruction.

## Simon Posford — "reverb is the magic dust"

Source: two-part studio tour (Alex Lytvyn) — youtube `B2NF_J56rFs`, `MorP_bYYHVg`. [primary]

- **Reverb & echo are the core colour, on sends.** Big **Eventide** reverbs ("the posh-sounding
  ones, the big one") and **Roland Space Echo** (UAD), routed via aux sends — "the magic dust you
  put on stuff." Signature move: **feed the echo back into itself** for runaway, self-oscillating
  tails. Notably he does *not* mention high-passing the reverb (most engineers do religiously).
- **Bass is removed from individual sounds.** "There's not a lot of bass on it 'cause I've taken a
  lot of the bass off" — high-pass the *sources* so the sub owns the low end uncluttered.
- **The "transy" EQ move:** pick a *low* frequency, **boost it, then sweep it** — a resonant
  low-frequency sweep, "a sound you hear on many trance tracks." (A deliberate low boost — but on a
  swept EQ, not the reverb.)
- **Distressor** for tightness: "compress the waveform so it sounds really tight," and to shape
  "the initial buck of the kick" (transient/attack design).
- **Gear character:** Korg MS-20 (the Hallucinogen squelch), OSCar (bubbles), Roland SH-5 ("squidgy
  filter"), tube EQ + guitar amp/pedals for grit.
- **Room:** mixes in an untreated bedroom — "you can mix in any room as long as you're used to the
  sound."

## Ott — the mix engineer's craft

Sources: Warp Academy producer interview `7W1pipOd8X4` [primary]; studio talk (Solstice Music)
`DqHkCgDFvmA` [primary]; style-study `FtCaZXXbk4A` (Psybur — a recreation of Ott's method, not Ott)
[third-party, corroborative].

- **He is a trained mixing engineer first.** "You learn techniques for making bad drummers sound
  good, weak bass players sound solid, poorly arranged instruments fit together — a lot of mixing
  is that." The polish is desk-engineering craft.
- **Warmth comes from hardware, not reverb.** The **Roland Dimension D** (stereo chorus/ensemble)
  is the prized warmth tool — "a feeling of warmth like a roaring fire." Tape origins, a 64-input
  desk, "tactile and warm."
- **Dub delay is the signature space:** a **dotted-16th delay, offset left/right** for stereo —
  "gotta have that dotted 16th," "everything super wet and dub."
- **Reverb placement — the crux:** **keep the sub DRY** ("you don't want reverb" on the sub).
  Reverb (plate — Soundtoys; spring — on rimshots/snares for a "lasery" tail) and **stereo
  wideners / phaser-flanger live on the HIGHS** to "spread it and make it softer." Width and verb
  are a *top-end* treatment; the bottom stays tight and centred.
- **Sub-bass control:** layer a sine sub under a mid/"slap" bass; roll the mid-bass off below
  ~200 Hz to make room; because "sub frequencies are sluggish and decay slower than mid-range,"
  use **multiband downward expansion** (hard knee) sidechained off the faster low-mids to "push the
  sub down and keep everything snappy."
- **Bass saturation, split by frequency:** **Saturn** — below 100 Hz just a little warmth; drive
  *above* 100 Hz harder. Tube saturation on bass ("warm tube").
- **Live = stems, not stereo files:** four stereo stems (drums / bass / music-1 rhythmic / music-2
  lead), mixed live — openly critical of acts who "play stereo files and mime."

## The reverb-low-boost question — measured, then corrected

A per-band probe on a Shpongle reference groove shows the **low/low-mid bands stay ~1.6× more
"lit" between hits than the mids/highs** (median-envelope "fill": sub 0.38, low-mid 0.39, mid 0.24,
high 0.25). The perception of a low-heavy, sustained space is therefore real in the spectrum.

But the technique sources point away from a low-boosted reverb. The documented practice is the
opposite — **sub kept dry; reverb and width applied to the highs.** The low-end fullness is
**warmth + sustain, not a reverb tail**, produced by:
- the **Dimension D** chorus (warm, wide low-mid),
- **tube/tape saturation** on the bass (harmonic warmth + perceived sustain),
- a **fat, dry, tight sub** (kept mono/dry and snappy via multiband expansion).

A literal "boost the reverb's low end" would miss the method. To reproduce the impression: warm and
saturate and sustain the low *sources*, and keep the reverb itself off the sub.

## Maps to the engine (liquid-psy / "wubba")

- **Reverb high-passed, not low.** Keep the bass channel reverb send at/near zero; put reverb on
  lead/arp/perc.
- **Warmth via saturation, not EQ.** Low-end warmth wants harmonic saturation on the bass plus a
  chorus-style widener — a high shelf cannot lift air a deep sub bass does not generate (a sub has
  almost no energy above ~1.5 kHz for a shelf to act on).
- **Dub delay:** a dotted-16th ping-pong on lead/arp is the psy-dub signature (`delay.time16` at a
  dotted feel + `pingpong`).
- **Sub: dry, tight, high-crest** — not a sustained wall; the reference's sub is dry and controlled.
- **Width on the highs:** stereo spread belongs on hats/lead; the bass stays mono/centred.

## Sources
- Simon Posford — "Interview in the Studio // Hallucinogen" Pt 1/2, Alex Lytvyn — `B2NF_J56rFs`, `MorP_bYYHVg`
- Ott — "Producer Interview with Ott," Warp Academy — `7W1pipOd8X4`
- Ott — "Studio Talk: Ott @ Ott's place," Solstice Music — `DqHkCgDFvmA`
- "Style Study: Ott — Psydub Tutorial," Psybur (third-party recreation) — `FtCaZXXbk4A`

Auto-captions → quotes are approximate. Primary = Posford/Ott's own words; style-study = a
producer's reverse-engineering, corroborative not authoritative.
