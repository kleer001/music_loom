#!/usr/bin/env bash
# Phase 1 of budding: split a subdirectory into its own repo, push it, clone it, verify it.
# Non-destructive to the mother repo. See bud_prune.sh for phase 2.
set -euo pipefail

usage() {
    echo "usage: bud_split.sh <subdir> [--name REPO_NAME] [--public] [--dest DIR] [--owner OWNER]" >&2
    exit 2
}

[ $# -ge 1 ] || usage
subdir="${1%/}"
shift
repo_name=""
visibility="--private"
dest=""
owner=""

while [ $# -gt 0 ]; do
    case "$1" in
        --name)   repo_name="$2"; shift 2 ;;
        --dest)   dest="$2"; shift 2 ;;
        --owner)  owner="$2"; shift 2 ;;
        --public) visibility="--public"; shift ;;
        *) usage ;;
    esac
done

die() { echo "bud: $*" >&2; exit 1; }

# --- preflight ------------------------------------------------------------
root=$(git rev-parse --show-toplevel) || die "not inside a git repository"
cd "$root"

[ -d "$subdir" ] || die "no such directory: $subdir (paths are relative to repo root $root)"
git ls-files --error-unmatch "$subdir" >/dev/null 2>&1 || die "$subdir has no tracked files; commit it first"
[ -z "$(git status --porcelain)" ] || die "working tree is dirty; commit or stash first"
command -v gh >/dev/null || die "gh CLI not found"
gh auth status >/dev/null 2>&1 || die "gh not authenticated; run: gh auth login"

[ -n "$repo_name" ] || repo_name=$(basename "$subdir")
[ -n "$owner" ] || owner=$(gh api user --jq .login)
[ -n "$dest" ] || dest="$(dirname "$root")/$repo_name"
[ -e "$dest" ] && die "destination already exists: $dest"
gh repo view "$owner/$repo_name" >/dev/null 2>&1 && die "repo $owner/$repo_name already exists"

branch="bud-export-$repo_name"
git show-ref --verify --quiet "refs/heads/$branch" && git branch -D "$branch" >/dev/null

echo "bud: mother=$root subdir=$subdir -> $owner/$repo_name  clone=$dest"

# --- split ----------------------------------------------------------------
git subtree split --prefix="$subdir" -b "$branch" >/dev/null
commits=$(git rev-list --count "$branch")
[ "$commits" -gt 0 ] || die "split produced no commits"
echo "bud: split $commits commit(s) onto $branch"

# --- create + push --------------------------------------------------------
gh repo create "$owner/$repo_name" $visibility >/dev/null
echo "bud: created $owner/$repo_name ($visibility)"

remote=$(gh repo view "$owner/$repo_name" --json sshUrl --jq .sshUrl)
if ! git push "$remote" "$branch:main" >/dev/null 2>&1; then
    remote=$(gh repo view "$owner/$repo_name" --json url --jq .url).git
    git push "$remote" "$branch:main" >/dev/null || die "push failed to $owner/$repo_name"
fi
gh repo edit "$owner/$repo_name" --default-branch main >/dev/null 2>&1 || true
echo "bud: pushed $branch -> main"

# --- verify by fresh clone ------------------------------------------------
git clone "$remote" "$dest" >/dev/null 2>&1 || die "clone-back failed from $remote"
cloned=$(git -C "$dest" rev-list --count HEAD)
[ "$cloned" = "$commits" ] || die "clone has $cloned commits, expected $commits"

# every tracked file in the mother's subdir must exist in the clone
missing=0
while IFS= read -r f; do
    [ -e "$dest/${f#"$subdir"/}" ] || { echo "bud: MISSING in clone: $f" >&2; missing=1; }
done < <(git ls-files "$subdir")
[ "$missing" -eq 0 ] || die "clone is incomplete; leaving mother untouched"

git branch -D "$branch" >/dev/null
echo "bud: verified $cloned commit(s) and all files at $dest"
echo "bud: OK. next -> scaffold $dest, then bud_prune.sh $subdir --name $repo_name"
