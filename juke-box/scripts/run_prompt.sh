#!/usr/bin/env bash
# Queue an API prompt on the running ComfyUI, wait for it, and report peak VRAM,
# wall time and the output file. Usage: run_prompt.sh <prompt.json> <out_dir>
set -euo pipefail
source "$(dirname "$0")/config.sh"
prompt=$1; out_dir=$2
host=$JUKE_COMFYUI_URL
log=${JUKE_COMFYUI_LOG:-}
mkdir -p "$out_dir"

[ -n "$log" ] && log_start=$(wc -l < "$log")
nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits -lms 500 > "$out_dir/vram.log" &
smi=$!
t0=$(date +%s)
id=$(curl -sf -X POST -H 'Content-Type: application/json' --data @"$prompt" "$host/prompt" \
  | python3 -I -c "import json,sys; print(json.load(sys.stdin)['prompt_id'])")
echo "queued $id"

until curl -sf "$host/history/$id" | python3 -I -c "import json,sys; sys.exit(0 if json.load(sys.stdin) else 1)"; do
  timeout 5 tail -f /dev/null || true
done
t1=$(date +%s)
kill $smi

curl -sf "$host/history/$id" > "$out_dir/history.json"
[ -n "$log" ] && tail -n +"$((log_start + 1))" "$log" > "$out_dir/comfy.log"
echo "wall time: $((t1 - t0)) s"
echo "peak VRAM: $(sort -n "$out_dir/vram.log" | tail -1) MiB"
python3 -I - "$out_dir/history.json" <<'EOF'
import json, sys
h = next(iter(json.load(open(sys.argv[1])).values()))
print("status:", h["status"]["status_str"])
for node in h["outputs"].values():
    for a in node.get("audio", []):
        print("output:", a["subfolder"] + "/" + a["filename"])
EOF
