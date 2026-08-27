#!/bin/bash
# Record where music_loom lives, so a budded instrument can find the studio
# without a machine path baked into it.
#
# Re-run after moving the repo; it fixes every instrument at once.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
config="$HOME/.config/music_loom"
mkdir -p "$config"
printf '%s\n' "$here" > "$config/home"

echo "music_loom home recorded: $here"
echo
echo "From any budded instrument:"
echo '  python3 "$(cat ~/.config/music_loom/home)/scripts/check_updates.py" .'
