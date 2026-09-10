# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This repo implements the `/bud` Claude Code skill — splitting a subdirectory out of its
parent repo into a standalone GitHub repo with history, scaffolding it, and pruning the
parent. The product is the skill plus two bash scripts; there is no application code.

## Architecture

```
SKILL.md                        # The skill definition — the model-facing spec
scripts/bud_split.sh            # Phase 1: split, create, push, clone, verify (non-destructive)
scripts/bud_prune.sh            # Phase 2: re-verify, tag, bundle, remove, push (destructive)
references/offline-transfer.md  # Loaded only when there is no network between the two repos
README.md                       # User-facing docs
LICENSE                         # MIT
```

The plugin manifest and the marketing assets are not in this copy. They belong
to distributing the skill, not to running it, and live upstream at
<https://github.com/kleer001/claude-slash-bud>.

`SKILL.md` is authoritative for the flow; the scripts are authoritative for the mechanics.
Keep them in step — a flag added to a script that `SKILL.md` never mentions will not get used.

## The safety contract — do not weaken it

The whole design rests on one rule: **nothing destructive runs until a fresh clone of the new
remote is proven to contain every tracked file of the subdirectory.** That check exists twice
on purpose — once at the end of `bud_split.sh`, again at the start of `bud_prune.sh` — because
the scaffolding step sits between them and can be interrupted.

Before removing anything, `bud_prune.sh` tags the parent `pre-bud/<name>-<stamp>` and bundles
the entire repo to `~/.claude/bud-backups/`. Both are cheap. Neither is optional.

Failures abort. Do not add fallbacks that "try another way" — a half-completed bud that reports
success is the one outcome worse than an error message.

## Conventions

- Bash with `set -euo pipefail`; every failure path goes through `die()`.
- Preflight before mutation: clean tree, tracked subdir, `gh` authenticated, repo name free,
  destination free. Cheap checks first.
- All output is prefixed `bud: ` so it's greppable in a transcript.
- `banner.jpg` is generated, not drawn. Change the wordmark or tagline in `make_banner.py` and
  re-run it; never retouch the JPEG. The tagline auto-fits the gutter to the left of the branch,
  so new wording re-flows instead of colliding with the artwork.
- `mark.svg` is the opposite — hand-authored, edit it directly, then
  `inkscape mark.svg --export-type=png --export-width=512`. Its round buds are oversized relative
  to the twig on purpose: solid shapes survive shrinking to favicon size, thin strokes do not.
  It shares `/bob`'s disc, colour, and stroke weight; keep it that way.
- Paths in `SKILL.md` are written as `<skill-dir>/scripts/...` because the skill can be
  installed as a plugin or symlinked into `~/.claude/skills/` — never hardcode either.

## Verifying a change

There is no test suite; the scripts talk to GitHub. Test them against a shimmed `gh` and a
local bare repo instead — create a throwaway parent repo with a subdirectory, put a fake `gh`
on `PATH` that serves a local bare repo as its URL, and run both scripts end to end. Check
both the success path and the refusal path (a file present in the parent but missing on the
remote must abort the prune with the subdirectory intact).

```
bash -n scripts/*.sh    # syntax check after any edit
```
