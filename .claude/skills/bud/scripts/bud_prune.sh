#!/usr/bin/env bash
# Phase 2 of budding (destructive): remove the budded subdirectory from the mother repo.
# Refuses unless the new remote repo already contains every tracked file of the subdir.
set -euo pipefail

usage() {
    echo "usage: bud_prune.sh <subdir> --name REPO_NAME [--owner OWNER]" >&2
    exit 2
}

[ $# -ge 1 ] || usage
subdir="${1%/}"
shift
repo_name=""
owner=""
while [ $# -gt 0 ]; do
    case "$1" in
        --name)  repo_name="$2"; shift 2 ;;
        --owner) owner="$2"; shift 2 ;;
        *) usage ;;
    esac
done
[ -n "$repo_name" ] || usage

die() { echo "bud: $*" >&2; exit 1; }

root=$(git rev-parse --show-toplevel) || die "not inside a git repository"
cd "$root"
[ -d "$subdir" ] || die "no such directory: $subdir"
[ -z "$(git status --porcelain)" ] || die "working tree is dirty; commit or stash first"
[ -n "$owner" ] || owner=$(gh api user --jq .login)

# --- gate: the bud must be alive on the remote before we cut it -------------
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
remote=$(gh repo view "$owner/$repo_name" --json sshUrl --jq .sshUrl) || die "cannot see repo $owner/$repo_name"
git clone --quiet "$remote" "$tmp/bud" 2>/dev/null \
    || git clone --quiet "$(gh repo view "$owner/$repo_name" --json url --jq .url).git" "$tmp/bud" \
    || die "cannot clone $owner/$repo_name; refusing to prune"

missing=0
while IFS= read -r f; do
    [ -e "$tmp/bud/${f#"$subdir"/}" ] || { echo "bud: MISSING on remote: $f" >&2; missing=1; }
done < <(git ls-files "$subdir")
[ "$missing" -eq 0 ] || die "remote repo is missing files; refusing to prune"
echo "bud: remote $owner/$repo_name verified complete"

# --- insurance -------------------------------------------------------------
stamp=$(date +%Y%m%d-%H%M%S)
backup_dir="$HOME/.claude/bud-backups"
mkdir -p "$backup_dir"
tag="pre-bud/$repo_name-$stamp"
git tag "$tag"
bundle="$backup_dir/$(basename "$root")-$repo_name-$stamp.bundle"
git bundle create "$bundle" --all >/dev/null 2>&1
echo "bud: insurance -> tag $tag, bundle $bundle"

# --- prune -----------------------------------------------------------------
git rm -r --quiet "$subdir"
git commit --quiet -m "chore: bud $subdir into $owner/$repo_name

Extracted with history via git subtree split; lives on at
https://github.com/$owner/$repo_name
Prior state tagged $tag."
echo "bud: pruned $subdir from mother (commit $(git rev-parse --short HEAD))"

branch=$(git branch --show-current)
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
    git push --quiet && echo "bud: pushed mother"
elif git remote get-url origin >/dev/null 2>&1; then
    git push --quiet -u origin "$branch" && echo "bud: pushed mother, upstream set to origin/$branch"
else
    echo "bud: mother has no remote; commit is local only"
fi
echo "bud: done. undo with: git reset --hard $tag"
