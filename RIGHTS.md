# RIGHTS — provenance for everything that makes sound

What a sample, tune, transcription, impulse response or soundfont carries with it when an instrument ships.

Synthesis has no rights problem. Recordings, compositions and transcriptions do, and they run on different clocks.

## The three separate questions

A recording of a folk song involves at least three rights, and they expire at different times:

1. **The composition.** Written by someone, at some date, in some country.
2. **The recording.** Made by someone else, later, somewhere else.
3. **The transcription or arrangement.** A modern edition of an old tune can carry its own fresh copyright even when the tune underneath is free.

Answering one does not answer the others.

## Public domain is per-jurisdiction

There is no single public domain. A work free in one country can be under copyright in another for decades more. A US determination restated as a global one is a different claim than the one that was actually checked.

An instrument on the open web reaches every jurisdiction at once, which is why the determination it was built on is worth stating.

## Licence claims

"CC0" on an aggregator page is a claim by the aggregator. Sample packs relicense material they did not own; soundfonts absorb sources with different terms; a library labelled with one licence can contain files under another. Following the claim to the original release is what turns it into a fact, and recording where the licence text lives makes it checkable later.

## The ledger

Instruments carry `PROVENANCE.md`, one row per asset or family:

```markdown
| Asset | What it is | Source | Licence | Verified | Notes |
|---|---|---|---|---|---|
| samples/kit/*.wav | 52 percussion one-shots | <project, URL> | CC0 | <date> | licence text at <path> |
| Greensleeves | traditional melody | <edition used> | PD (composition) | <date> | melody from a PD source; modern editions are not |
```

An asset that cannot be traced is the one thing that can force a finished instrument offline. Synthesis or removal both solve it; deferring it moves it to a worse moment.

## Scraping

Six seconds between requests to the same host — sample libraries, archives, score repositories and lyric sites alike.

## Attribution

A licence requiring attribution is satisfied by attribution a listener can reach: a `LICENSE` file beside the assets, a credit in the README. A commit message is not somewhere a listener looks.

## Release gate

`rack/R4-release/RELEASE-CHECKLIST.md` carries this as a section:

- [ ] `PROVENANCE.md` has a row for every shipped asset.
- [ ] Every licence claim traced to the original release, not an aggregator.
- [ ] Jurisdiction stated for every public-domain determination.
- [ ] Attribution present where required, reachable by a listener.
- [ ] Nothing untraceable ships.
