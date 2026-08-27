# Release checklist

Worked once, at the gate. Every box either ticked or answered with a written limitation on the page. Nothing dropped because it was inconvenient.

## It works

- [ ] Fresh clone, `./run.sh`, plays without touching anything else.
- [ ] `npm test` passes.
- [ ] `npm run render` bounces a WAV and the measurements are in range.
- [ ] Determinism holds: same seed, byte-identical output.
- [ ] Runs in a browser that is not the one it was developed in.
- [ ] Console is clean. Web Audio fails quietly; a broken node shows up as silence, not an error.

## It sounds right

- [ ] Listened end to end, at least twice, on two different playback systems.
- [ ] Checked in mono. A wide mix that collapses is a broken mix.
- [ ] No clipping, no DC offset, no rumble below the intended range.
- [ ] Left running long enough to find what only appears after ten minutes — drift, level creep, a pattern that turns out to repeat.
- [ ] Someone else has heard it without being told what to listen for.

## The claims are true

- [ ] Every claim on the page about what it does is accurate.
- [ ] Every claim about how it is built is accurate — synthesised is not sampled, modelled is not approximated.
- [ ] Every historical or attribution claim is sourced.
- [ ] The README describes the instrument as it is now, not as designed.
- [ ] Known limitations are stated rather than omitted.

## The rights are clear

- [ ] `PROVENANCE.md` has a row for every shipped asset.
- [ ] Every licence traced to the original release, not an aggregator.
- [ ] Jurisdiction stated for every public-domain determination.
- [ ] Required attribution present and reachable by a listener.
- [ ] Nothing untraceable ships.

## It is findable and honest

- [ ] Repo description says what it is in concrete terms — no adjective stacks.
- [ ] `LICENSE` present and correct.
- [ ] `.music_loom.toml` carries the studio version it descends from.
- [ ] A listener can tell within thirty seconds whether this is for them.

## Sign-off

Release gate cleared — DATE. Ship it.
