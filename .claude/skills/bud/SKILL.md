---
name: bud
description: Graduate a subdirectory of the current ("mother") repo into its own standalone GitHub repo — history intact — scaffold it (README, CLAUDE.md, LICENSE, .gitignore), then prune the directory from the mother. Use when the user types /bud, or asks to "spin off", "extract", "graduate", "split out", or "bud" a subfolder into its own repo.
---

# /bud — graduate a subfolder into its own repo

A bud grows on the parent plant, then separates and roots on its own. Same here:
an MVP sketched inside a subdirectory becomes a standalone repo carrying its own
commit history, gets a starter kit, and is pruned from the mother.

Runs end to end without check-ins. The safety is structural, not conversational:
nothing destructive happens until a fresh clone of the new remote is proven to
contain every tracked file, and the mother is tagged + bundled before the cut.

## Invocation

`/bud <subdir>` — path relative to the mother repo root. Optional: a repo name
(defaults to the subdir's basename), `--public` (default private), `--dest DIR`
(default: sibling of the mother repo).

If no subdir is given, list the mother's top-level tracked directories and ask
which one. That's the only question worth asking.

## The flow

### 1. Split, create, push, verify (non-destructive)

The two scripts live in `scripts/`, beside this SKILL.md — invoke them by absolute path,
since the working directory is the mother repo, not the skill directory.

```bash
<skill-dir>/scripts/bud_split.sh <subdir> [--name NAME] [--public] [--dest DIR]
```

Does: preflight (clean tree, tracked subdir, `gh` auth, name not taken, dest
free) → `git subtree split` → `gh repo create --private` → push `bud-export-*`
to `main` → clone back to `<dest>` → assert commit count and every tracked file
survived → delete the scratch branch.

Any failure aborts with the mother untouched. Fix the cause and re-run; if the
remote repo was created before the failure, delete it (`gh repo delete`) or pass
a different `--name`.

### 2. Scaffold the new repo (the pat on the butt)

Work in `<dest>`. Read the budded code first — the scaffolding must describe what
is actually there, not a template.

- **README.md** — what it is, what it does, how to run it, what state it's in.
  Written from the code, not from the conversation that produced it. If the
  subdir already had a README, extend it rather than replacing it.
- **CLAUDE.md** — instructions for a future session in this repo: purpose,
  layout, conventions, how to run and test. Inherit anything repo-specific from
  the mother's CLAUDE.md that still applies; drop what doesn't.
- **LICENSE** — MIT, current year, the GitHub account's name. Skip if one exists.
- **.gitignore** — matched to the languages actually present. Skip if one exists.

Commit and push:

```bash
git -C <dest> add -A
git -C <dest> commit -m "docs: add README, CLAUDE.md, LICENSE, .gitignore"
git -C <dest> push
```

Also set the repo description from the README's first line:
`gh repo edit OWNER/NAME --description "..."`.

### 3. Prune the mother (destructive)

```bash
<skill-dir>/scripts/bud_prune.sh <subdir> --name NAME
```

Does: re-clone the remote and re-check every tracked file → tag
`pre-bud/<name>-<stamp>` → `git bundle` the whole mother into
`~/.claude/bud-backups/` → `git rm -r` → commit → push (setting the upstream to
`origin/<branch>` if the branch didn't have one; local-only if there's no remote).

Refuses to cut if the remote is incomplete. Undo is `git reset --hard <tag>`.

### 4. Report

Four lines, no ceremony: new repo URL, commits carried, local clone path, and
the mother's prune commit + undo tag. Then check whether anything left in the
mother still references the pruned path (`git grep -n <subdir>`) and say what
you found — don't fix it unless asked.

## Caveats worth stating out loud

- `git rm` prunes the tip, not the past. The subdir's blobs stay reachable in
  the mother's history. Expunging them entirely is `git filter-repo` plus a
  force-push — a different operation with different consequences. Flag it, never
  do it silently.
- `git subtree split` follows only the prefix. Files the subdir depended on from
  elsewhere in the mother do not come along; the new repo may not build until
  they're vendored. Check imports before declaring victory.
- If the subdir's history is huge or was itself moved/renamed across the
  mother's past, `git filter-repo --subdirectory-filter` tracks it better than
  `subtree split`. Reach for it only when the split output looks wrong.

## No network between the two sides?

Air gap, text-only channel, no GitHub — the history still travels, as a file.
See `references/offline-transfer.md` for `git bundle`, `git fast-export`, and
`git format-patch`, and for the no-history shortcut.
