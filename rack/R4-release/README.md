# R4 — publishing and the release gate

Graft this when the instrument is content-complete and heading for a page someone else will read.

## Copy

```sh
cp <music_loom>/rack/R4-release/RELEASE-CHECKLIST.md <instrument>/
cp <music_loom>/rack/R4-release/PROVENANCE.md        <instrument>/
```

## The one hard stop

Every other rung is advice. This one is a gate.

It opens only when the instrument plays end to end, has no known blockers, and somebody other than you has listened to it without being told what to listen for. Until then there is nothing to gate.

Work `RELEASE-CHECKLIST.md`. Every unresolved concern is either fixed or written down as a known limitation on the page. Nothing gets quietly dropped because it was inconvenient.

## Copy is held to the research standard

`RESEARCH.md`'s no-fabrication rule reaches the store page, the README, the release post, and anything else describing the instrument. Every claim about what it does, what it is built from, and what it descends from is checked before it goes out.

Two failure modes, both common:

**Overselling the mechanism.** "Physically modelled" when it is sample playback. "Analogue-modelled filter" when it is a biquad. Describe what it is; the real thing is usually more interesting than the borrowed word.

**Inherited history.** A claim about who invented a technique, picked up from a blog post and repeated. If the page says it, the page can source it.

## Rights clear before publishing, not after

`PROVENANCE.md` has a row for every shipped asset, every licence traced to its original release rather than an aggregator, and a jurisdiction stated for every public-domain determination. `RIGHTS.md` in the studio covers why.

An untraceable asset is the one problem that can force a finished instrument offline. It does not get deferred past this gate.

## If it is budding, bud first

An instrument moving to its own repo buds *before* it releases, and releases from the new repo. Releasing from `bench/` and then splitting means the release artifacts point at a path that stops existing.
