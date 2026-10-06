#!/usr/bin/env bash
# Download the ComfyUI repack of MiniMax Music 3 (about 14.3 GB) into models_dir.
# Usage: download_models.sh
set -euo pipefail
source "$(dirname "$0")/config.sh"
if [ ! -d "$JUKE_MODELS_DIR" ]; then
  echo "models_dir does not exist: $JUKE_MODELS_DIR" >&2
  exit 1
fi
hf download Comfy-Org/MiniMax-Music-3 \
  diffusion_models/minimax_music3_dit_fp16.safetensors \
  text_encoders/minimax_music3_text_encoder_pruned_int8_convrot.safetensors \
  vae/minimax_music3_dav.safetensors \
  --local-dir "$JUKE_MODELS_DIR"
