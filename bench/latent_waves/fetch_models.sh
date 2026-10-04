#!/usr/bin/env bash
# Download pretrained RAVE models (TorchScript, streaming exports) into the model cache.
#
# The files are large (70–160 MB each) and can always be fetched again, so they
# live outside Dropbox in ~/.cache, and models/ is a symlink to that directory.
#
#   ./fetch_models.sh            the IRCAM set and a starter set from the
#                                Intelligent Instruments Lab
#   ./fetch_models.sh all        every IIL model as well
#
# Sources and terms:
#   IRCAM  https://acids-ircam.github.io/rave_models_download  (no licence stated)
#   IIL    https://huggingface.co/Intelligent-Instruments-Lab/rave-models  (CC BY-NC 4.0)
# Six seconds between requests to the same host.
set -euo pipefail
cd "$(dirname "$0")"

CACHE="${LATENT_WAVES_MODELS:-$HOME/.cache/music_loom/rave_models}"
mkdir -p "$CACHE"
[ -e models ] || ln -s "$CACHE" models

IRCAM=(percussion vintage nasa darbouka_onnx VCTK isis musicnet sol_ordinario sol_full sol_ordinario_fast)
IIL_STARTER=(
  guitar_iil_b2048_r48000_z16
  organ_bach_b2048_r48000_z16
  birds_dawnchorus_b2048_r48000_z8
  water_pondbrain_b2048_r48000_z16
  magnets_b2048_r48000_z8
  humpbacks_pondbrain_b2048_r48000_z20
)
IIL_REST=(
  birds_motherbird_b2048_r48000_z16
  birds_pluma_b2048_r48000_z12
  crozzoli_bigensemblesmusic_18d
  marinemammals_pondbrain_b2048_r48000_z20
  mrp_strengjavera_b2048_r44100_z16
  organ_archive_b2048_r48000_z16
  sax_soprano_franziskaschroeder_b2048_r48000_z20
  voice-multi-b2048-r48000-z11
  voice_hifitts_b2048_r48000_z16
  voice_jvs_b2048_r44100_z16
  voice_vctk_b2048_r44100_z22
  voice_vocalset_b2048_r48000_z16
)

get() {  # url, destination
  if [ -s "$2" ]; then echo "have  $(basename "$2")"; return; fi
  curl -sSfL -A 'Mozilla/5.0' -o "$2.part" "$1" && mv "$2.part" "$2"
  echo "got   $(basename "$2")  $(du -h "$2" | cut -f1)"
  sleep 6
}

for m in "${IRCAM[@]}"; do
  get "https://play.forum.ircam.fr/rave-vst-api/get_model/$m" "$CACHE/ircam_$m.ts"
done

iil=("${IIL_STARTER[@]}")
[ "${1:-}" = all ] && iil+=("${IIL_REST[@]}")
for m in "${iil[@]}"; do
  get "https://huggingface.co/Intelligent-Instruments-Lab/rave-models/resolve/main/$m.ts" "$CACHE/iil_$m.ts"
done
