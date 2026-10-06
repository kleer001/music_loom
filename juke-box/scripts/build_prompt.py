"""Build a ComfyUI API prompt for MiniMax Music 3 from the official template.

Usage: python3 -I build_prompt.py <out.json> [--seconds N] [--seed N] [--prefix P]

The template comes from the ComfyUI named by comfyui_url in config.toml. The
graph mirrors the subgraph in the `audio_minimax_music_3` template, with the
non-tiled VAE decode. Caption and lyrics are the template's own example.
"""
import argparse
import json
import tomllib
import urllib.request
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "config.toml"

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--seconds", type=float, default=60.0)
ap.add_argument("--seed", type=int, default=7)
ap.add_argument("--prefix", default="audio/juke_box")
a = ap.parse_args()

url = tomllib.load(open(CONFIG, "rb"))["comfyui_url"]
tpl = json.load(urllib.request.urlopen(f"{url}/templates/audio_minimax_music_3.json"))
top = next(n for n in tpl["nodes"] if n["id"] == 37)
caption, lyrics = top["widgets_values"][0], top["widgets_values"][1]

prompt = {
    "3": {"class_type": "CLIPLoader", "inputs": {
        "clip_name": "minimax_music3_text_encoder_pruned_int8_convrot.safetensors",
        "type": "minimax", "device": "default"}},
    "6": {"class_type": "UNETLoader", "inputs": {
        "unet_name": "minimax_music3_dit_fp16.safetensors", "weight_dtype": "default"}},
    "7": {"class_type": "VAELoader", "inputs": {"vae_name": "minimax_music3_dav.safetensors"}},
    "13": {"class_type": "MiniMaxMusic3TextEncode", "inputs": {
        "clip": ["3", 0], "caption": caption, "lyrics": lyrics, "seed": a.seed,
        "max_duration": a.seconds, "cfg_scale": 1.7, "top_k": 50}},
    "10": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["13", 0]}},
    "15": {"class_type": "EmptyMiniMaxMusic3LatentAudio", "inputs": {
        "seconds": ["13", 1], "batch_size": 1}},
    "9": {"class_type": "KSampler", "inputs": {
        "model": ["6", 0], "positive": ["13", 0], "negative": ["10", 0],
        "latent_image": ["15", 0], "seed": a.seed, "steps": 30, "cfg": 1.7,
        "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
    "12": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["9", 0], "vae": ["7", 0]}},
    "35": {"class_type": "SaveAudioAdvanced", "inputs": {
        "audio": ["12", 0], "filename_prefix": a.prefix, "format": "flac"}},
}
json.dump({"prompt": prompt}, open(a.out, "w"), indent=1)
print(a.out)
