# myNoise — the reference we pay tribute to — technique digest

Stéphane Pigeon's myNoise is the north star for **style and spirit**, not a thing to
copy. This file documents its **public** architecture from its creator's own words,
so the tribute is built on understood ground — and draws the borrow-nothing line
explicitly.

Source: Pigeon's own pages (mynoise.net faq/calibration/help/blog/microphones;
stephanepigeon.com biography) and his interviews. **The primary pages were fetched
and read verbatim on 2026-09-11** ([`BLOCKED.md`](BLOCKED.md)). Three of the four
strongest anchors confirmed cleanly (frequency-ordered slider layers; Web Audio, no
proprietary tech; two-mode calibration). Two claims moved: the "no AI" line is
stronger and lives on the **blog**, not the FAQ ("I have never used generative AI to
create sound for myNoise"); and the **188,027,101-year figure was not on any fetched
page** — treat it as unconfirmed until the specific generator page is captured. The
20 Hz–20 kHz span is an inference, not stated wording.

## 1. The numbers — the slider architecture

**The central design fact:** the "10 sliders" are **10 separately-recorded /
independent audio LAYERS**, ordered by dominant frequency — a mixer that *behaves*
like an EQ, **not** a true EQ filtering one source.

- Each slider controls the **volume of one separate loop**, mixed like an engineer
  at a desk — not a filter on one source.
- **Verbatim (help.php, verified 2026-09-11):** the sliders "are like a 10-band
  equalizer, tied to specific frequencies when the generator is calibrated, with
  each slider representing one octave." So: **frequency-tied only when calibrated;
  one octave per slider.**
- **Verbatim (help.php):** "sliders remain ordered by frequency, as far as it makes
  sense" even uncalibrated — rumble at the first slider, highs at the last. This
  ordering is what makes a volume stack *behave* like a graphic EQ.
- **Exact per-band centre frequencies:** not published. The **20 Hz–20 kHz span is
  an inference** from "one octave per slider × ~10 sliders," **not stated wording** —
  the page does not give a band table. **Gap.**

So: physically 10 recorded layers, arranged by dominant frequency so riding the
sliders approximates a coarse ~one-octave-per-band graphic EQ across the audible
range. Not a filter on one source — a mixer over frequency-ordered stems.

## 2. Calibration

- **Per-user hearing/equipment calibration is central.** Generators "can be shaped
  to your personal hearing thresholds and compensate for your audio equipment and
  listening environment deficiencies, including background noise." *(faq.php /
  calibration.php)*
- **Hearing-threshold variant — verbatim (calibration.php, verified 2026-09-11):**
  you raise each "slider until the corresponding sound is just audible to you (in the
  case of the hearing-threshold variant)." The wording's own "in the case of…" marks
  a **second variant** (equal-loudness), so the two-mode framing holds. This measures
  your per-band curve and reshapes the noise so a neutral slider sounds even **to you**.
- **Why pink:** the neutral state targets a perceptually even spectrum (pink = equal
  energy per octave, matching logarithmic hearing). Pigeon's exact "why pink" wording
  was **not located** on the fetched calibration page — either phrased differently or
  elsewhere. **Still a gap.**

## 3. Never-repeating / animation

- **No true loop:** soundscapes "have no true end, being repetitive but
  ever-changing." *(faq.php)*
- **Loop-length recombination:** the emblematic figure — the Waterfall generator's
  audio "will repeat in exactly **188,027,101 years and 193 days**." **Unconfirmed:
  this figure was NOT on the faq or blog** (both fetched and searched 2026-09-11), so
  the earlier "faq/blog" attribution is wrong; it must live on the Waterfall
  generator's own page, or be stale. Capture that page before quoting it. The *idea*
  is sound and independently attested (Eno's incommensurable tape loops,
  [`seamless_looping.md`](seamless_looping.md) §4): several loops of differing
  near-coprime lengths whose combined phase realigns only at their LCM. Per-loop
  lengths and the coprime scheme are **not published**. **Gap.**
- **"Animate!":** a random automation that slowly, continuously moves the sliders
  themselves, so the *mix* keeps drifting — slow random-walk automation of layer
  gains on top of already-non-repeating audio. Maps cleanly onto seeded RNG.
- **Layer count:** 10 loops per generator (one per slider) is the consistent
  implication.

## 4. Source material & tech

- **Real field recordings, then engineered.** *(verbatim faq.php, verified
  2026-09-11: "Nature sounds are recorded in the field, and musical soundscapes are
  played by [musicians].")* On AI, the strongest and current statement is on the
  **blog**, verbatim: **"I have never used generative AI to create sound for myNoise."**
  (The earlier "the soundscapes never use AI" attributed to the FAQ was a paraphrase;
  use the blog line.) Pigeon is sole creator — records, designs, codes, runs the site.
- **Recording gear** *(microphones.php, verified 2026-09-11):* he "personally use[s]"
  the **Sony ICD-SX1000** Dictaphone, with a professional setup of a **Fostex F2-2LE**
  and **Audio Technica AT-3032**, plus the myNoise microphones; windshields "made of
  acoustic foam." The binaural "both sides of the head" phrasing was not re-located
  this pass — treat that specific wording as unconfirmed.
- **Resynthesis:** branded on at least one generator ("Xenobiota — Nature,
  resynthesized"). The pattern (record real material, then loop/resynthesize into
  seamless layers) is stated; the DSP details are **not public**. **Gap.**
- **Tech — verbatim (faq.php, verified 2026-09-11):** "The myNoise audio player does
  not rely on any proprietary technology, but requires a browser that is compatible
  with the Web Audio API." So: **Web Audio, buffer/sample playback of pre-recorded
  loops through gain nodes, mixed in real time.** No worklet detail stated. This is
  already the house stack.

## 5. Lineage & the tribute boundary

Pigeon (PhD, signal processing; background at UCLouvain / Roland / NATO; also runs
audiocheck.net) built and maintains the whole system solo since 2013. Conceptual
ancestors for the non-repetition idea trace to Eno's generative ambient work (1978).

**Freely re-implementable** (general, non-protectable design concepts — our own
tribute is built on these, with our recordings, our layout, our voice):
- N frequency-ordered recorded layers, each with a volume slider, behaving like a
  graphic EQ.
- Coprime loop lengths for non-repetition.
- Slow seeded random-walk of layer gains ("animate").
- Per-user hearing/equipment calibration to a perceptually even (pink) baseline.
- Starting from real field recordings; caring about recording quality; binaural
  capture.
- Web Audio buffer-source + gain-node graph, zero deps — already our stack.

**Avoid entirely** (his specific expression / identity):
- His actual audio, recordings, resynthesized loops — none.
- His specific soundscape designs, generator names, and branding (myNoise,
  "Animate!", "Xenobiota", the palette/UI).
- His calibration UI copy and exact procedure wording, and any verbatim FAQ/manual
  text — express calibration in our own words and flow.
- Any implication of affiliation. Tribute-in-spirit only, argued in our own voice
  per the studio's panel/verdict rule.

## Gaps

**Verbatim pass done 2026-09-11.** Of the four strongest anchors: (a) frequency-
ordered slider layers = the "10-band equalizer … one octave" wording — **confirmed**;
(b) Web Audio, no proprietary tech — **confirmed verbatim**, and the no-AI line
confirmed in stronger blog wording; (d) two-mode calibration — **confirmed** (the
hearing-threshold variant is explicit). Only (c), the 188,027,101-year figure, is
**not confirmed** — it was on none of the fetched pages. Lineage (signal-processing
PhD, UCLouvain, Roland, AudioCheck.net, myNoise BV since 2013) also confirmed.

Still open:

1. **Exact per-slider band centre frequencies** — not published; even the 20 Hz–20 kHz
   span is inferred, not stated (sliders are layers, not fixed filters).
2. **The 188,027,101-year figure and the loop-recombination scheme** — the figure
   itself now needs the Waterfall generator page (not on faq/blog); loops per layer,
   lengths, and coprime choice remain unpublished.
3. **Pigeon's exact "why pink" wording** — not located on the calibration page this pass.
4. **Resynthesis DSP** — what "resynthesized" concretely means (granular? spectral?
   loop-morph?) is not disclosed.
5. **AudioWorklet / graph specifics** — only "Web Audio, no proprietary tech" stated.
