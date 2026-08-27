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

## [0.1.0] — 2026-08-26

### CONTRACT — the house stack
**Rung:** —
**Trigger:** always, for any instrument budded from music_loom.
**Read:** `CLAUDE.md` § House stack, § Load-bearing constraints.
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
