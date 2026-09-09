# Changelog

music_loom is a workbench consumed by the instruments budded from it. Entries
here are **directives a daughter's session acts on**, not release notes for a
human. When a daughter runs `scripts/check_updates.py`, every entry logged
between its stamped version and the current `VERSION` is printed into that
session.

## Severity tiers

- **CONTRACT** — a load-bearing constraint, the budding process, or the shape of
  `core/`. May invalidate a decision the daughter already made.
- **TIGHTEN** — a stricter convention, a new gate, a new rack unit. Back-apply
  where compatible.
- **CLARIFY** — wording, examples, typos. Back-application optional.

## Directive entry format

```
### TIER — short title
**Rung:** R1/R2/R3/R4, or — for studio-wide
**Trigger:** the condition under which this applies
**Read:** path(s) in music_loom to consult
**Compare to:** the corresponding thing in the daughter
**Action:** what to propose to the user
**Skip if:** explicit opt-out conditions
```

Release headings are machine-read. They must match `## [X.Y.Z]` exactly — three
numeric fields in brackets, nothing else on the line before the date. Headings
without brackets are prose and are ignored. A bracketed non-semver heading
raises for every daughter that checks. Newest release at the top, under this
prologue.

---

## [0.3.0] — 2026-09-09

### TIGHTEN — R3 ships a browser-confirm page
**Rung:** R3
**Trigger:** the instrument has R3 grafted and quotes an absolute loudness or brightness figure anywhere — a spec sheet, a release note, a README.
**Read:** `rack/R3-measure/confirm.html` and the "Confirming in a browser" section of `rack/R3-measure/README.md`
**Compare to:** the instrument's own `render.mjs` and whatever it quotes offline numbers in
**Action:** copy `confirm.html` next to `index.html`, open it on the same seed as `npm run render`, and check any absolute figure against it. The two runtimes give an oscillator measurably different upper harmonics — Chrome tracks the ideal spectrum nearly to its band limit, node-web-audio-api departs from it a third to a half of the way up — so a bare oscillator can differ by 1.4 dB of level and 15% of spectral centroid with no processing in the graph at all. A delta between two offline renders is still a figure about the change; a single absolute number is a figure about `node-web-audio-api`.
**Skip if:** the instrument only ever quotes A/B deltas, or has no absolute figure written down.

### CLARIFY — `--headroom` prints a gain, not a trim
**Rung:** R3
**Trigger:** the instrument has `render.mjs` grafted.
**Read:** `rack/R3-measure/render.mjs` — the argv.headroom branch
**Compare to:** the same branch in the instrument's copy
**Action:** the printed factor is `0.9 / p99.9`, which is above 1 whenever the graph is quiet — a boost, where "suggested master trim" named a cut. Take the new wording, which prints the factor with its dB value and says boost or cut. Any master trim set from the old label should be re-read.
**Skip if:** the instrument does not use `--headroom`.

---

## [0.2.0] — 2026-08-27

### TIGHTEN — two new rack units, R5-fx and R6-voices
**Rung:** R5, R6
**Trigger:** the daughter carries its own effect builders (a delay, reverb, mixer, master bus) or its own synthesis voices.
**Read:** `rack/R5-fx/README.md`, `rack/R6-voices/README.md`.
**Compare to:** the daughter's own `dsp/` and `voices/`, wherever they live.
**Action:** diff them. Where the daughter's copy is unchanged, note that it tracks the rack. Where it has diverged, propose folding the improvement back through `please_add_me.md` or recording why the daughter's copy differs. Both units expect the graft layout `<instrument>/core/`, `<instrument>/dsp/`, `<instrument>/voices/` — `R5-fx/dsp/` resolves `../core/`, and `R6-voices/voices/persistent.js` resolves `../core/` and `../dsp/`.
**Skip if:** the daughter synthesises nothing and processes nothing.

### TIGHTEN — the pantry, and a provenance ledger for it
**Rung:** —
**Trigger:** the daughter ships any recorded, composed or transcribed asset.
**Read:** `pantry/README.md`, `pantry/PROVENANCE.md`, `RIGHTS.md`.
**Compare to:** the daughter's own sample directories and its `PROVENANCE.md`.
**Action:** propose a row per shipped asset with source, licence, the date the licence was traced to its original release, and the jurisdiction behind any public-domain claim. Where the daughter carries material the pantry already holds under a traced licence, propose pointing at the pantry copy instead.
**Skip if:** the daughter synthesises everything and ships no audio files.

### CONTRACT — core gains audio.js and scales.js
**Rung:** R2
**Trigger:** the daughter decodes or resamples audio, or carries its own note-name parsing.
**Read:** `rack/R2-core/core/audio.js`, `rack/R2-core/core/scales.js`, `rack/R2-core/README.md`.
**Compare to:** the daughter's own decode/resample path and scale tables.
**Action:** `audio.js` (`decodeAudio`, `resample`, `toAudioBuffer`) is the seam a recording comes in through; propose adopting it where the daughter assumes a sample rate. `math.js` gained `round` (half to even) and `mod` (non-negative). Note that `music.js` and `scales.js` both export `MODES` as different sets in the same shape, so importing both under one name collides.
**Skip if:** the daughter reads no audio files and needs no note names.

---

## [0.1.0] — 2026-08-26

### CONTRACT — the house stack
**Rung:** —
**Trigger:** always, for any instrument budded from music_loom.
**Read:** `CLAUDE.md` § House stack, § What has tended to break.
**Compare to:** the daughter's own `CLAUDE.md` and `package.json`.
**Action:** confirm the instrument still holds to vanilla ES modules with no
build step, zero runtime dependencies, `node-web-audio-api` as the only audio
devDependency, and an offline-renderable graph. Propose recording any deliberate
deviation in the daughter's `CLAUDE.md` with its reason.
**Skip if:** the daughter's `CLAUDE.md` already documents the deviation.

### CONTRACT — shared core
**Rung:** R2
**Trigger:** the daughter carries its own copy of `rng`, `music`, `dsp`, `wav`,
`metrics`, `scheduler`, `math`, `merge` or `aiff`.
**Read:** `rack/R2-core/core/`.
**Compare to:** the daughter's copies.
**Action:** diff them. Where the daughter's copy is unchanged, note that it
tracks the rack. Where it has diverged, propose either folding the improvement
back upstream via `please_add_me.md` or recording why the daughter's copy
differs.
**Skip if:** the daughter uses none of these modules.
