"""Render takes for the tracks of an album with MiniMax Music 3.

Usage: python3 -I render_album.py <album_dir> [--tracks 1,4] [--takes N]

Each run adds new takes and never overwrites one. Take k of track n uses seed
seed_base + 100 * n + k. takes/take-<k>.json keeps the exact graph that was sent,
so a take can be reproduced after its caption or lyrics change.
"""
import argparse
import json
import tomllib
from pathlib import Path

import jukebox

MAX_SECONDS = 360  # 9,000 frames at 25 frames per second, the MiniMax Music 3 limit

ap = argparse.ArgumentParser()
ap.add_argument("album_dir", type=Path)
ap.add_argument("--tracks", help="comma-separated track numbers; default all")
ap.add_argument("--takes", type=int, help="takes per track; default `takes` in album.toml")
a = ap.parse_args()

album_dir = a.album_dir.resolve()
album = tomllib.load(open(album_dir / "album.toml", "rb"))
tracks = album["track"]
if a.tracks:
    wanted = {int(n) for n in a.tracks.split(",")}
    tracks = [t for t in tracks if t["n"] in wanted]
takes = a.takes or album["takes"]

jobs = []
for t in tracks:
    if t["seconds"] > MAX_SECONDS:
        raise SystemExit(f"track {t['n']}: seconds {t['seconds']} is over the {MAX_SECONDS} s limit")
    track_dir = album_dir / "tracks" / f"{t['n']:02d}-{t['slug']}"
    caption = (track_dir / "caption.md").read_text().replace("{{voice}}", album["voice"].strip())
    lyrics = (track_dir / "lyrics.txt").read_text()
    takes_dir = track_dir / "takes"
    takes_dir.mkdir(exist_ok=True)
    first = len(list(takes_dir.glob("take-*.json"))) + 1
    for k in range(first, first + takes):
        seed = album["seed_base"] + 100 * t["n"] + k
        prefix = f"juke-box/{album_dir.name}/{track_dir.name}_take-{k}"
        graph = jukebox.song_graph(caption, lyrics, t["seconds"], seed, prefix)
        jobs.append((t["n"], takes_dir, k, seed, graph, jukebox.queue(graph)))
        print(f"queued track {t['n']} take {k} (seed {seed})", flush=True)

for n, takes_dir, k, seed, graph, prompt_id in jobs:
    entry = jukebox.wait(prompt_id)
    jukebox.download_audio(entry, takes_dir / f"take-{k}.flac")
    stamps = {m[0]: m[1]["timestamp"] for m in entry["status"]["messages"]}
    render_seconds = (stamps["execution_success"] - stamps["execution_start"]) / 1000
    json.dump({"seed": seed, "prompt_id": prompt_id, "render_seconds": render_seconds, "graph": graph},
              open(takes_dir / f"take-{k}.json", "w"), indent=1)
    print(f"done track {n} take {k} in {render_seconds:.0f} s", flush=True)
