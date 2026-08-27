# RESEARCH — how a musical claim earns its place

Read this before researching an inspiration. It is the gate between "I have a
vibe in mind" and a technique digest that code can cite.

The output of research is a **technique digest** in `research/` — a sourced,
sectioned document that a spec sheet draws from and that code cites at the point
of use. A digest is not a summary of what a genre feels like. It is the
measurable layer: parameters, ranges, structures, and the sources they came
from.

## Never fabricate

No invented gear spec, release date, chart position, personnel credit,
instrument range, tuning system, or quote. No plausible-sounding parameter with
no origin. If a number cannot be traced, it does not go in the digest — write
the gap down instead.

This reaches the spec sheet, the README, and any page describing the finished
instrument.

## Triage first

Before searching, decide which kind of question this is. It changes what counts
as a good source.

**Technique and craft** — how a sound is made, how a form is built, what a
player actually does. Quality gate only, no recency bound. Older sources are
often *better*: a 1978 synthesis text, a production interview from the era, a
conservatory method book. These predate both the SEO era and the AI-content
flood.

**Gear and product reality** — what a specific machine does, its parameter
ranges, its firmware behaviour. Manuals and service documentation, not forum
recall. Bound to the version, not the year.

**Rights and provenance** — is this tune public domain, is this sample library
actually CC0, who holds the recording. Bound to jurisdiction and to *today*;
copyright terms differ by country and a work free in one place is not free in
another. Goes to `RIGHTS.md`.

**Discography and history** — who played what, when, on which record. Primary
credits over aggregator summaries.

## Search method

- **Right-size the effort.** A fan-out of agents is for a genuine research
  question. A quick lookup is a quick lookup. Do not deploy apparatus by
  default.
- **Decompose.** "Make it sound like dub" is four questions: what is the echo
  doing, what is the rhythm section doing, what is the mix doing, what is the
  arrangement doing. Track them separately.
- **Reformulate into several queries before searching.** Vary the vocabulary —
  players, engineers, academics and manufacturers name the same thing
  differently. "Lowpass gate" and "Buchla 292" and "vactrol" reach different
  corners. So do "one drop", "riddim", and the drummer's own name.
- **Search the medium that holds the answer.** Some of this is not on web pages.
  Patents and manuals hold parameter ranges. Theses and conference papers hold
  measurements. Interviews and studio-teardown videos hold method. Transcriptions
  and scores hold the notes. A single forum thread from someone who owned the
  machine can beat ten articles about it.
- **Gather wide, then rank.** Collect candidates, score them against the gates
  below, then read the best few closely. Do not answer off the first hits.

## Source gates

Prefer sources that show:

- A named author or accountable institution, and a visible date.
- **Primary evidence** — the manual, the patent, the score, the multitrack, the
  measurement, the interview with the person who did it, the thesis with its
  method stated.
- Specific, falsifiable claims. A cutoff in Hz beats "warm". A tempo range beats
  "midtempo". A decay in seconds beats "long".

Discard or down-weight:

- No author, no date, no sources. Auto-updating publication dates.
- Content farms and listicles restating each other. A claim that appears only on
  pages citing each other is one source, not five.
- Vendor and affiliate copy describing what a product does. Follow the money;
  a plugin maker's page is marketing, its manual is documentation.
- Genre descriptions written by people who have not made the music. Adjective
  stacks with no mechanism.

**Triangulate.** A claim that a design decision will rest on should appear in at
least two independent sources, or come from one genuinely primary one. One
source citing another is one source.

## Reaching past the obvious corner

Default search skews toward English-language, recent, and commercially
optimised. For a lot of music that is the wrong corner.

- Traditions documented in their own language first — the ethnomusicology, the
  method books, the regional archives. An English blog post about an instrument
  is downstream of someone's fieldwork; find the fieldwork.
- Scenes documented in fanzines, liner notes, radio sessions and label
  histories rather than on the open web.
- Academic work is often where the *measurements* are, and it is often
  paywalled. The best evidence is frequently the hardest to reach; note when a
  source you could not read probably held the answer.

## The digest format

```markdown
# <Subject> — technique digest

Source: <full citation of the primary source or sources, with access status>

## §1 <The numbers>
Tempo, register, duration, spectral balance — whatever is measurable, with
the measurement's origin.

## §2 <The mechanism>
How the characteristic sound is actually produced. Signal path, parameters,
ranges. This is what code will cite.

## §3 <The grammar>
How parts relate. What the rhythm section does under it, what changes at a
section boundary, what is left out.

## §4 <Analyses>
Specific records or performances, what was measured in each, what generalises.

## §5 <Lineage>
Who did it first, who changed it, what it descends from. Named, dated, sourced.

## Gaps
What could not be verified, what was paywalled, what conflicts between sources.
```

Number the sections. Code cites them: `// §2 — feedback rides on a 4.26 Hz
random-waveshape LFO`. A digest whose sections are unnumbered cannot be cited,
and an uncited number is a number nobody can defend.

## Reporting research back

Lead with the answer. Then the findings, each with its source attached to the
claim it supports rather than parked in a list at the bottom. Then what is solid
versus thin versus unverified. Then the sources.

State conflicts rather than quietly picking a side. Distinguish what a source
says from what you concluded. "I could not find this" is a real result and
belongs in the Gaps section.
