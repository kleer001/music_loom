# RESEARCH — sourcing a musical claim

What sits between "I have a vibe in mind" and a technique digest that code can cite.

The output of research is a **technique digest** in `research/` — a sourced, sectioned document a spec sheet draws from and code cites at the point of use. A digest is not a summary of what a genre feels like. It is the measurable layer: parameters, ranges, structures, and the sources they came from.

## Fabrication

An invented gear spec, release date, chart position, personnel credit, instrument range, tuning system or quote is indistinguishable from a real one until someone checks — and the person checking is usually a listener who knows the subject better than the page does. A plausible-sounding parameter with no origin behaves the same way in code as a measured one, right up until it is questioned.

A number that cannot be traced is a gap. Written down as a gap it stays findable; written down as a fact it does not.

The same holds for the spec sheet, the README, and any page describing the finished instrument.

## Kinds of question

Which kind this is changes what counts as a good source.

**Technique and craft** — how a sound is made, how a form is built, what a player actually does. Quality gate, no recency bound. Older sources are often *better*: a 1978 synthesis text, a production interview from the era, a conservatory method book. These predate both the SEO era and the AI-content flood.

**Gear and product reality** — what a specific machine does, its parameter ranges, its firmware behaviour. Manuals and service documentation hold this; forum recall holds a version of it. Bound to the version, not the year.

**Rights and provenance** — is this tune public domain, is this sample library actually CC0, who holds the recording. Bound to jurisdiction and to *today*; copyright terms differ by country and a work free in one place is not free in another. `RIGHTS.md` covers it.

**Discography and history** — who played what, when, on which record. Primary credits and aggregator summaries disagree more often than they look like they would.

## Search method

- **Right-size the effort.** A fan-out of agents suits a genuine research question. A quick lookup is a quick lookup.
- **Decompose.** "Make it sound like dub" is four questions: what is the echo doing, what is the rhythm section doing, what is the mix doing, what is the arrangement doing. Tracked separately they each have an answer.
- **Reformulate into several queries before searching.** Players, engineers, academics and manufacturers name the same thing differently. "Lowpass gate", "Buchla 292" and "vactrol" reach different corners. So do "one drop", "riddim", and the drummer's own name.
- **Search the medium that holds the answer.** Some of this is not on web pages. Patents and manuals hold parameter ranges. Theses and conference papers hold measurements. Interviews and studio-teardown videos hold method. Transcriptions and scores hold the notes. A single forum thread from someone who owned the machine can beat ten articles about it.
- **Gather wide, then rank.** Candidates scored against the gauges below, then the best few read closely, beats answering off the first hits.

## Gauging a source

Sources that tend to hold up show:

- A named author or accountable institution, and a visible date.
- **Primary evidence** — the manual, the patent, the score, the multitrack, the measurement, the interview with the person who did it, the thesis with its method stated.
- Specific, falsifiable claims. A cutoff in Hz beats "warm". A tempo range beats "midtempo". A decay in seconds beats "long".

Sources that tend not to:

- No author, no date, no sources. Auto-updating publication dates.
- Content farms and listicles restating each other. A claim that appears only on pages citing each other is one source, not five.
- Vendor and affiliate copy describing what a product does. A plugin maker's page is marketing; its manual is documentation.
- Genre descriptions written by people who have not made the music. Adjective stacks with no mechanism.

**Triangulation.** A claim a design decision will rest on holds better with two independent sources behind it, or one genuinely primary one. One source citing another is one source.

## Reaching past the obvious corner

Default search skews toward English-language, recent, and commercially optimised. For a lot of music that is the wrong corner.

- Traditions documented in their own language first — the ethnomusicology, the method books, the regional archives. An English blog post about an instrument is downstream of someone's fieldwork; the fieldwork is findable.
- Scenes documented in fanzines, liner notes, radio sessions and label histories rather than on the open web.
- Academic work is often where the *measurements* are, and it is often paywalled. The best evidence is frequently the hardest to reach; a source that could not be read but probably held the answer is worth noting as such.

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

Numbered sections are what makes a digest citable: `// §2 — feedback rides on a 4.26 Hz random-waveshape LFO`. An unnumbered digest still reads fine; it just cannot be pointed at from a line of code.

## Reporting research back

Answer first. Then the findings, each with its source attached to the claim it supports rather than parked in a list at the bottom. Then what is solid versus thin versus unverified. Then the sources.

A conflict between sources is a finding; quietly picking a side loses it. What a source says and what you concluded from it are different things. "I could not find this" is a real result, and the Gaps section is where it lives.
