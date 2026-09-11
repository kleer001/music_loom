# myNoise — the reference we pay tribute to — technique digest

Stéphane Pigeon's myNoise is the north star for **style and spirit**, not a thing to
copy. This file documents its **public** architecture from its creator's own words,
so the tribute is built on understood ground — and draws the borrow-nothing line
explicitly.

Source: Pigeon's own pages (mynoise.net faq/calibration/help/blog/microphones;
stephanepigeon.com biography) and his interviews. **All quotes and figures are
search-attested only** — every mynoise.net and stephanepigeon.com page returned an
egress block this session, so wording is paraphrase until captured verbatim
([`BLOCKED.md`](BLOCKED.md)). The primary pages are the highest-priority captures.

## 1. The numbers — the slider architecture

**The central design fact:** the "10 sliders" are **10 separately-recorded /
independent audio LAYERS**, ordered by dominant frequency — a mixer that *behaves*
like an EQ, **not** a true EQ filtering one source.

- Each slider controls the **volume of one separate loop** ("ten distinct tracks,"
  like an engineer at a mixing desk). *(secondary restatement of the per-generator
  Quick Manual, help.php)*
- myNoise's own Quick Manual calls them "like a 10-band equalizer," tied to specific
  frequencies **only when calibrated**, "each slider representing one octave,"
  spanning **20 Hz–20 kHz**. *(faq.php / help.php, search-attested)*
- Even uncalibrated, sliders "remain ordered by frequency, as far as it makes sense"
  — distant thunder (rumble) at the first slider, insect chirps (highs) at the last.
  This frequency ordering is what makes a volume stack *behave* like a graphic EQ.
- **Exact per-band centre frequencies:** not published beyond "10 octave-ish bands,
  20 Hz–20 kHz." A secondary usage example mentions boosting "~300 Hz," cutting
  "~1 kHz," boosting ">4 kHz" — illustrative, not a band table. **Gap.**

So: physically 10 recorded layers, arranged by dominant frequency so riding the
sliders approximates a coarse ~one-octave-per-band graphic EQ across the audible
range. Not a filter on one source — a mixer over frequency-ordered stems.

## 2. Calibration

- **Per-user hearing/equipment calibration is central.** Generators "can be shaped
  to your personal hearing thresholds and compensate for your audio equipment and
  listening environment deficiencies, including background noise." *(faq.php /
  calibration.php)*
- **Two variants:** a *hearing-threshold* method (raise each slider until just
  audible) and an *equal-loudness* method (adjust until all sliders sound equally
  loud). This measures your per-band curve and reshapes the noise so a neutral
  slider position sounds perceptually even **to you**.
- **Why pink:** the aligned/neutral state targets a perceptually even spectrum;
  pink = equal energy per octave, matching logarithmic hearing. Pigeon's exact
  wording wasn't recoverable by search (generic pink-noise theory came back instead)
  — **Gap**; likely on calibration.php.

## 3. Never-repeating / animation

- **No true loop:** soundscapes "have no true end, being repetitive but
  ever-changing." *(faq.php)*
- **Loop-length recombination:** the emblematic figure — the Waterfall generator's
  audio "will repeat in exactly **188,027,101 years and 193 days**, based on the
  parameters of the sound engine." *(attributed to faq/blog)* The signature of
  several independent loops of differing (near-coprime) lengths whose combined phase
  realigns only at their LCM — the same trick as Eno's incommensurable tape loops
  (see [`seamless_looping.md`](seamless_looping.md) §4). Per-loop lengths and the
  coprime scheme are **not published**. **Gap.**
- **"Animate!":** a random automation that slowly, continuously moves the sliders
  themselves, so the *mix* keeps drifting — slow random-walk automation of layer
  gains on top of already-non-repeating audio. Maps cleanly onto seeded RNG.
- **Layer count:** 10 loops per generator (one per slider) is the consistent
  implication.

## 4. Source material & tech

- **Real field recordings, then engineered.** Nature sounds "recorded in the field";
  **"the soundscapes never use AI"**; Pigeon travels to record "unspoiled nature
  sounds," and is sole creator (records, designs, codes, runs the site).
- **Recording stance:** binaural-style capture ("microphones placed on both sides of
  the head"); he uses a Sony ICD-SX1000 and endorses prosumer recorders; custom
  acoustic-foam windshields with "acoustic chambers [as] pressure buffers."
  *(microphones.php)*
- **Resynthesis:** branded on at least one generator ("Xenobiota — Nature,
  resynthesized"). The pattern (record real material, then loop/resynthesize into
  seamless layers) is stated; the DSP details are **not public**. **Gap.**
- **Tech:** "The myNoise audio player does not rely on any proprietary technology,
  but requires a browser compatible with the Web Audio API." *(faq.php)* So: **Web
  Audio, buffer/sample playback of pre-recorded loops through gain nodes, mixed in
  real time** — essentially many looping buffer sources → gain nodes. No worklet
  detail stated. This is already the house stack.

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

1. **Exact per-slider band centre frequencies** — only "10 octave-ish bands,
   20 Hz–20 kHz." May not be published (sliders are layers, not fixed filters).
2. **The loop-recombination scheme** — loops per layer, individual lengths, coprime
   choice. Only the *result* (188,027,101 yr, 193 d for Waterfall) is public.
3. **Pigeon's exact "why pink" wording** — on calibration.php; search returned
   generic theory.
4. **Resynthesis DSP** — what "resynthesized" concretely means (granular? spectral?
   loop-morph?) is not disclosed.
5. **AudioWorklet / graph specifics** — only "Web Audio, no proprietary tech" stated.
6. **Verbatim confirmation of every quote** — all primary pages were fetch-blocked;
   re-verify before quoting Pigeon's exact words. The four strongest anchors to
   confirm on capture: (a) sliders = frequency-ordered recorded layers, not a true
   EQ; (b) Web Audio, no proprietary tech, no AI; (c) the 188,027,101-year figure;
   (d) two-mode per-user calibration.
