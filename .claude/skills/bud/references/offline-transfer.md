# Budding without a shared network

The scripted flow assumes both sides reach GitHub. When they can't — air gap,
a channel that only accepts text, an archive medium — serialize the split branch
to a file, move the file, rebuild on the far side.

Start the same way, in the mother repo:

```bash
git subtree split --prefix=<subdir> -b bud-export
git log --oneline bud-export | head    # commits present
git ls-tree bud-export                 # files at top level, no <subdir>/ prefix
```

Then pick a transfer, cheapest-suitable first.

## bundle — one file, lossless, cloneable (default)

Binary, self-contained, clone directly from it. Use this unless the channel
literally rejects binary.

```bash
git bundle create bud.bundle bud-export     # or --all for every ref
# ... move bud.bundle ...
git clone bud.bundle new-repo && cd new-repo
git log --oneline | head
```

## fast-export — actual plain text

A human-readable stream. Only when the channel is text-only: binary blobs get
inlined and the file balloons.

```bash
git fast-export bud-export > history.txt
# ... move history.txt ...
git init new-repo && cd new-repo
git fast-import < ../history.txt
git switch -c main $(git for-each-ref --format='%(refname:short)' | head -1)
```

## format-patch — readable per-commit patches

One email-formatted `.patch` per commit; easy to read and cherry-pick. Weakest
on merge commits and binary files — those don't apply cleanly.

```bash
git format-patch --root bud-export -o patches/
# ... move patches/ ...
git init new-repo && cd new-repo
git am ../patches/*.patch
```

## No history at all

When the subdir's past genuinely doesn't matter, skip the split:

```bash
mkdir ../new-repo && cp -r <subdir>/. ../new-repo/
cd ../new-repo && git init && git add -A && git commit -m "Initial commit from <subdir>"
```

The mother's history still holds the full record; the new repo starts clean.

After any of these, verify the rebuilt repo's log, then push it to a permanent
home if a network becomes available — and only then prune the mother.

## What the GitHub website can and can't do

It can create the empty repo and delete the folder from the mother. It **cannot**
do the subtree split: there is no UI for extracting a subfolder with history.
"Use this template" and "Import repository" copy whole repos, not subfolders.
The extraction needs a git client either way.
