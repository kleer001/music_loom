# Sourced by the juke-box shell scripts. Reads config.toml into JUKE_* variables:
# JUKE_COMFYUI_URL, JUKE_MODELS_DIR, and JUKE_COMFYUI_LOG when it is set.
cfg="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/config.toml"
if [ ! -f "$cfg" ]; then
  echo "missing $cfg: copy config.example.toml to config.toml and edit it" >&2
  exit 1
fi
eval "$(python3 -I - "$cfg" <<'EOF'
import os, shlex, sys, tomllib
for key, value in tomllib.load(open(sys.argv[1], "rb")).items():
    print(f"JUKE_{key.upper()}={shlex.quote(os.path.expanduser(value))}")
EOF
)"
