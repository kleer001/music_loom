#!/usr/bin/env bash
# Re-pull the nine Hugging Face listings behind listings_<date>.csv.
# Six seconds between requests to the same host. Output is raw JSON, one file per listing.
# Download counts move daily, so a re-pull is a new snapshot, not a check of this one.
set -euo pipefail
out=${1:-.}
EXP='expand[]=downloads&expand[]=likes&expand[]=tags&expand[]=pipeline_tag&expand[]=createdAt&expand[]=library_name&expand[]=gated&expand[]=downloadsAllTime&expand[]=cardData'
API=https://huggingface.co/api/models
while read -r name query; do
  curl -sf -o "$out/$name.json" "$API?$query&direction=-1&$EXP"
  echo "$name"
  sleep 6
done <<'LIST'
tag_sample-generation  filter=sample-generation&sort=downloads&limit=1000
tag_stable-audio       filter=stable-audio&sort=downloads&limit=1000
tag_music-generation   filter=music-generation&sort=downloads&limit=1000
tag_Audio-to-Audio     filter=Audio-to-Audio&sort=downloads&limit=1000
tag_audio              filter=audio&sort=downloads&limit=1000
tag_audio_bylikes      filter=audio&sort=likes&limit=1000
pipe_t2a_likes         pipeline_tag=text-to-audio&sort=likes&limit=400
pipe_t2a_dl            pipeline_tag=text-to-audio&sort=downloads&limit=400
pipe_a2a_likes         pipeline_tag=audio-to-audio&sort=likes&limit=400
LIST
