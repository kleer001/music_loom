"""Shared pieces of the juke-box tools: config, the MiniMax Music 3 graph, a ComfyUI client."""
import json
import time
import tomllib
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = tomllib.load(open(ROOT / "config.toml", "rb"))
URL = CONFIG["comfyui_url"]

TEXT_ENCODER = "minimax_music3_text_encoder_pruned_int8_convrot.safetensors"
DIT = "minimax_music3_dit_fp16.safetensors"
VAE = "minimax_music3_dav.safetensors"
# The non-tiled VAE decode adds a VRAM spike that grows with song length
# (4.5 GB for 60 s on an RTX 3090); tiled decode keeps it flat.
TILED_ABOVE_SECONDS = 60


def song_graph(caption, lyrics, seconds, seed, prefix, cfg_scale=1.7, top_k=50, steps=30):
    """ComfyUI API graph for one song, matching the official `audio_minimax_music_3` template."""
    if seconds > TILED_ABOVE_SECONDS:
        decode = {"class_type": "VAEDecodeAudioTiled", "inputs": {
            "samples": ["9", 0], "vae": ["7", 0], "tile_size": 1536, "overlap": 64}}
    else:
        decode = {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["9", 0], "vae": ["7", 0]}}
    return {
        "3": {"class_type": "CLIPLoader", "inputs": {
            "clip_name": TEXT_ENCODER, "type": "minimax", "device": "default"}},
        "6": {"class_type": "UNETLoader", "inputs": {"unet_name": DIT, "weight_dtype": "default"}},
        "7": {"class_type": "VAELoader", "inputs": {"vae_name": VAE}},
        "13": {"class_type": "MiniMaxMusic3TextEncode", "inputs": {
            "clip": ["3", 0], "caption": caption, "lyrics": lyrics, "seed": seed,
            "max_duration": float(seconds), "cfg_scale": cfg_scale, "top_k": top_k}},
        "10": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["13", 0]}},
        "15": {"class_type": "EmptyMiniMaxMusic3LatentAudio", "inputs": {
            "seconds": ["13", 1], "batch_size": 1}},
        "9": {"class_type": "KSampler", "inputs": {
            "model": ["6", 0], "positive": ["13", 0], "negative": ["10", 0],
            "latent_image": ["15", 0], "seed": seed, "steps": steps, "cfg": cfg_scale,
            "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
        "12": decode,
        "35": {"class_type": "SaveAudioAdvanced", "inputs": {
            "audio": ["12", 0], "filename_prefix": prefix, "format": "flac"}},
    }


def get_json(path):
    return json.load(urllib.request.urlopen(URL + path))


def queue(graph):
    req = urllib.request.Request(URL + "/prompt", data=json.dumps({"prompt": graph}).encode(),
                                 headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))["prompt_id"]


def wait(prompt_id, poll_seconds=5):
    """Block until ComfyUI has a history entry for the prompt; return that entry."""
    while not (entry := get_json(f"/history/{prompt_id}")):
        time.sleep(poll_seconds)
    entry = entry[prompt_id]
    if entry["status"]["status_str"] != "success":
        raise RuntimeError(f"prompt {prompt_id} failed: {entry['status']}")
    return entry


def download_audio(entry, dest):
    """Copy the one audio output of a finished prompt from ComfyUI to dest."""
    (audio,) = [a for node in entry["outputs"].values() for a in node.get("audio", [])]
    query = urllib.parse.urlencode({"filename": audio["filename"], "subfolder": audio["subfolder"],
                                    "type": audio["type"]})
    dest.write_bytes(urllib.request.urlopen(f"{URL}/view?{query}").read())
