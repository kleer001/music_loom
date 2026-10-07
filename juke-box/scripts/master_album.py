"""Master the picked takes of an album: loudness, true peak, tags, and a gapped preview file.

Usage: python3 -I master_album.py <album_dir>

Every track with a `pick` in album.toml is normalised with ffmpeg's two-pass loudnorm
to `lufs` (default -14, Spotify's reference level) plus the track's `gain_db`
(default 0; a negative value keeps an interlude or ballad quieter), with the true
peak held at `true_peak` (default -1 dBTP, Spotify's recommendation). Output goes
to master/: one tagged FLAC per track, album.flac with `gap_seconds` of silence
between tracks (default 2), and notes.txt with the tracklist and the
machine-generated disclosure that the MiniMax-Music3 licence requires.
"""
import argparse
import json
import subprocess
import tomllib
from pathlib import Path

DISCLOSURE = "Machine-generated with MiniMax Music 3 (MiniMax-Music3 Community Licence)."

ap = argparse.ArgumentParser()
ap.add_argument("album_dir", type=Path)
album_dir = ap.parse_args().album_dir.resolve()
album = tomllib.load(open(album_dir / "album.toml", "rb"))
lufs, true_peak = album.get("lufs", -14.0), album.get("true_peak", -1.0)
gap = album.get("gap_seconds", 2.0)
picked = [t for t in album["track"] if "pick" in t]
if not picked:
    raise SystemExit("no track has a `pick` in album.toml")
out_dir = album_dir / "master"
out_dir.mkdir(exist_ok=True)


def ffmpeg(*args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args],
                          capture_output=True, text=True, check=True).stderr


def loudnorm_json(stderr):
    return json.loads(stderr[stderr.rindex("{"):stderr.rindex("}") + 1])


masters, notes = [], [f"{album['title']} — {album.get('artist', '')}", DISCLOSURE, ""]
for i, t in enumerate(picked, start=1):
    src = album_dir / "tracks" / f"{t['n']:02d}-{t['slug']}" / "takes" / f"take-{t['pick']}.flac"
    target = lufs + t.get("gain_db", 0.0)
    spec = f"loudnorm=I={target}:TP={true_peak}:LRA=11"
    m = loudnorm_json(ffmpeg("-i", str(src), "-af", spec + ":print_format=json", "-f", "null", "-"))
    second = (f"{spec}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
              f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
    dest = out_dir / f"{i:02d} {t['title']}.flac"
    result = loudnorm_json(ffmpeg(
        "-y", "-i", str(src), "-af", f"{second},aresample=44100", "-sample_fmt", "s32",
        "-map_metadata", "-1", "-metadata", f"title={t['title']}", "-metadata", f"artist={album.get('artist', '')}",
        "-metadata", f"album={album['title']}", "-metadata", f"track={i}/{len(picked)}",
        "-metadata", f"comment={DISCLOSURE}", str(dest)))
    masters.append(dest)
    notes.append(f"{i:02d}. {t['title']} (track {t['n']}, take {t['pick']}): {m['input_i']} -> "
                 f"{result['output_i']} LUFS, true peak {m['input_tp']} -> {result['output_tp']} dBTP, "
                 f"{result['normalization_type']}")
    print(notes[-1], flush=True)

silence = out_dir / "gap.flac"
ffmpeg("-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo:d={gap}", "-sample_fmt", "s32", str(silence))
playlist = out_dir / "concat.txt"
playlist.write_text("".join(f"file '{p.name}'\n" + (f"file '{silence.name}'\n" if p != masters[-1] else "")
                            for p in masters))
ffmpeg("-y", "-f", "concat", "-safe", "0", "-i", str(playlist), "-c:a", "flac", "-sample_fmt", "s32",
       "-metadata", f"title={album['title']}", "-metadata", f"comment={DISCLOSURE}", str(out_dir / "album.flac"))
silence.unlink()
playlist.unlink()
(out_dir / "notes.txt").write_text("\n".join(notes) + "\n")
print(out_dir)
