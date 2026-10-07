#!/usr/bin/env bash
# Fetch MiniMax's music-caption-rewriter skill (1,000 caption templates) into
# .claude/skills/, where Claude Code loads it as a skill for this directory.
# The checkout is sparse, so only the skill folder downloads, at a pinned commit.
# Usage: fetch_caption_skill.sh
set -euo pipefail
repo=https://github.com/MiniMax-AI/MiniMax-Music3.git
rev=945655064d59b98004dd70002e7eb5c8c6e11373
dest="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/music-caption-rewriter"
if [ -e "$dest" ]; then
  echo "already present: $dest" >&2
  exit 1
fi
tmp=$(mktemp -d)
git clone -q --filter=blob:none --no-checkout "$repo" "$tmp"
git -C "$tmp" sparse-checkout set skills/music-caption-rewriter
git -C "$tmp" checkout -q "$rev"
mkdir -p "$(dirname "$dest")"
mv "$tmp/skills/music-caption-rewriter" "$dest"
rm -rf "$tmp"
echo "installed: $dest"
