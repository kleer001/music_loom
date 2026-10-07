"""Build a ComfyUI API prompt for MiniMax Music 3 with the official template's example song.

Usage: python3 build_prompt.py <out.json> [--seconds N] [--seed N] [--prefix P]

The template comes from the ComfyUI named by comfyui_url in config.toml.
"""
import argparse
import json

import jukebox

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--seconds", type=float, default=60.0)
ap.add_argument("--seed", type=int, default=7)
ap.add_argument("--prefix", default="audio/juke_box")
a = ap.parse_args()

tpl = jukebox.get_json("/templates/audio_minimax_music_3.json")
top = next(n for n in tpl["nodes"] if n["id"] == 37)
caption, lyrics = top["widgets_values"][0], top["widgets_values"][1]

graph = jukebox.song_graph(caption, lyrics, a.seconds, a.seed, a.prefix)
json.dump({"prompt": graph}, open(a.out, "w"), indent=1)
print(a.out)
