# BUDDING — moving an instrument into its own repo

An instrument leaves `bench/` when it plays, measures clean, and has nothing
left that only makes sense inside the studio. It leaves **with its history**.

Read the whole page before starting. Step 4 is destructive and depends on step 3
having actually succeeded.

## Step 1 — isolate the subfolder's history

```sh
git switch main
git subtree split --prefix=bench/my-instrument -b my-instrument-export
```

Verify before going further:

```sh
git log --oneline my-instrument-export | head
git ls-tree my-instrument-export
```

The log should show the instrument's commits and the tree should show its files
at the root, not nested under `bench/`.

## Step 2 — get the branch into a new repo

**Path A — push directly**, when both sides are networked:

```sh
git push git@github.com:OWNER/my-instrument.git my-instrument-export:main
```

**Path B — carry it across as a file**, when they are not:

```sh
git bundle create my-instrument.bundle my-instrument-export
```

A bundle is one binary file, lossless, and clones directly. `git fast-export`
produces text but balloons on binary content, which an instrument with samples
has plenty of. `git format-patch --root` is readable per commit but handles
merges and binaries poorly.

**Path C — no history**, when the history is not worth carrying:

```sh
mkdir ../my-instrument
cp -r bench/my-instrument/. ../my-instrument/
cd ../my-instrument && git init && git add -A
git commit -m "Initial commit from music_loom"
```

## Step 3 — confirm it stands alone

Clone the new repo fresh, somewhere else, and check all of:

- The log shows the history you expected.
- `./run.sh` serves it and it plays.
- The render harness bounces a WAV and prints its measurements.
- `node --test test/` passes.
- Nothing resolves a path back into music_loom.
- `.music_loom.toml` carries the studio version it descends from.
- `PROVENANCE.md` accounts for every shipped asset (`RIGHTS.md`).

Do not continue until the fresh clone passes.

## Step 4 — prune the bench

```sh
git rm -r bench/my-instrument
git commit -m "Bud my-instrument into its own repo"
git push
```

`git rm` removes the folder from the tip, not from history. The blobs are still
in this repo's past. Do not describe the instrument as gone from music_loom —
it is gone from the current tree.

## Step 5 — the tie stays live

The new repo keeps `.music_loom.toml`. When a convention here changes, the
instrument pulls it forward with `scripts/check_updates.py` as described in
`CONTRIBUTING.md`. Budding ends the shared directory, not the relationship.

## What does not travel

- Anything under `tmp/`.
- Rack units the instrument never grafted.
- Research digests it does not cite. A digest it *does* cite travels as a copy,
  because the code cites its section numbers and those must not drift.
