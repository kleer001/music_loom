# RIGHTS — provenance for everything that makes sound

Every sample, tune, transcription, impulse response and soundfont that ships
inside an instrument is accounted for here before that instrument is published.

Synthesis has no rights problem. Recordings, compositions and transcriptions do,
and they carry different clocks.

## The three separate questions

A recording of a folk song involves at least three rights, and they expire at
different times:

1. **The composition.** Written by someone, at some date, in some country.
2. **The recording.** Made by someone else, later, somewhere else.
3. **The transcription or arrangement.** A modern edition of an old tune can
   carry its own fresh copyright even when the tune underneath is free.

Answering one does not answer the others.

## Public domain is per-jurisdiction

There is no single public domain. A work free in one country can be under
copyright in another for decades more. Record which jurisdiction a claim applies
to, and do not restate a US determination as a global one.

When an instrument ships to the open web, it reaches every jurisdiction at once.
Say which determination it was built on.

## Licence claims get verified, not assumed

"CC0" on an aggregator page is a claim by the aggregator. Follow it to the
original release and record what that release actually says. Sample packs
relicense material they did not own; soundfonts absorb sources with different
terms; a library labelled with one licence can contain files under another.

Record the licence text location, not just its name.

## The ledger

Every instrument carries `PROVENANCE.md`, one row per asset or family:

```markdown
| Asset | What it is | Source | Licence | Verified | Notes |
|---|---|---|---|---|---|
| samples/kit/*.wav | 52 percussion one-shots | <project, URL> | CC0 | <date> | licence text at <path> |
| Greensleeves | traditional melody | <edition used> | PD (composition) | <date> | melody from a PD source; modern editions are not |
```

If an asset cannot be traced, it does not ship. Replace it with synthesis or
remove it. An untraceable file is not a small problem deferred; it is the one
thing that can force a finished instrument offline.

## Scraping

Six seconds minimum between requests to the same host. No exceptions. Applies to
sample libraries, archives, score repositories and lyric sites equally.

## Attribution actually appears

A licence requiring attribution is satisfied by attribution the listener can
reach — a `LICENSE` file beside the assets and a credit in the README. Not by a
line in a commit message.

## Release gate

Before an instrument is published:

- [ ] `PROVENANCE.md` has a row for every shipped asset.
- [ ] Every licence claim traced to the original release, not an aggregator.
- [ ] Jurisdiction stated for every public-domain determination.
- [ ] Attribution present where required, reachable by a listener.
- [ ] Nothing untraceable ships.
