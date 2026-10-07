"""Write index.html for an album: every take of every track, with players and the picks.

Usage: python3 -I album_page.py <album_dir>

The page marks the take named by `pick` in album.toml. "Keep" buttons store a
choice in the browser; "Copy picks" puts the choices on the clipboard as text.
"""
import argparse
import html
import json
import subprocess
import tomllib
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("album_dir", type=Path)
album_dir = ap.parse_args().album_dir.resolve()
album = tomllib.load(open(album_dir / "album.toml", "rb"))


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                          str(path)], capture_output=True, text=True, check=True).stdout
    s = round(float(out))
    return f"{s // 60}:{s % 60:02d}"


cards = []
for t in album["track"]:
    track_dir = album_dir / "tracks" / f"{t['n']:02d}-{t['slug']}"
    rows = []
    for flac in sorted((track_dir / "takes").glob("take-*.flac"), key=lambda p: int(p.stem[5:])):
        k = int(flac.stem[5:])
        seed = json.load(open(flac.with_suffix(".json")))["seed"]
        picked = " picked" if t.get("pick") == k else ""
        rows.append(
            f'<li class="take{picked}" data-track="{t["n"]}" data-take="{k}">'
            f'<span class="label">take {k}</span><span class="meta">seed {seed} · {duration(flac)}</span>'
            f'<audio controls preload="none" src="{flac.relative_to(album_dir)}"></audio>'
            f'<button class="keep">keep</button></li>')
    lyrics = html.escape((track_dir / "lyrics.txt").read_text())
    cards.append(
        f'<section><h2><span class="n">{t["n"]:02d}</span> {html.escape(t["title"])}</h2>'
        f'<p class="meta">{html.escape(t.get("role", ""))} · {t["seconds"]} s requested</p>'
        f'<ul>{"".join(rows) or "<li class=empty>no takes yet</li>"}</ul>'
        f'<details><summary>lyrics</summary><pre>{lyrics}</pre></details></section>')

page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(album["title"])}</title>
<style>
body {{ font: 15px/1.45 system-ui, sans-serif; background: #fafafa; color: #1a1a1a; margin: 0 auto;
       max-width: 860px; padding: 24px 16px; }}
h1 {{ margin: 0 0 4px; }} h2 {{ font-size: 18px; margin: 0 0 2px; }}
.n {{ color: #888; font-variant-numeric: tabular-nums; }}
.meta {{ color: #666; font-size: 13px; margin: 0 8px 0 0; }}
section {{ background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 14px 16px; margin: 14px 0; }}
ul {{ list-style: none; padding: 0; margin: 10px 0; }}
li.take {{ display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 6px 8px;
          border-radius: 6px; }}
li.take audio {{ flex: 1 1 280px; height: 32px; }}
li.picked {{ background: #e8f3e8; }} li.kept {{ outline: 2px solid #2e7d32; }}
.label {{ font-weight: 600; min-width: 52px; }}
button {{ font: inherit; padding: 4px 10px; border: 1px solid #bbb; border-radius: 6px; background: #fff;
         cursor: pointer; }}
li.kept button.keep {{ background: #2e7d32; color: #fff; border-color: #2e7d32; }}
pre {{ white-space: pre-wrap; font-size: 13px; color: #333; }}
#bar {{ position: sticky; top: 0; background: #fafafa; padding: 8px 0; display: flex; gap: 8px;
        align-items: center; }}
</style></head><body>
<h1>{html.escape(album["title"])}</h1>
<p class="meta">{html.escape(album.get("artist", ""))} · green = pick in album.toml · outline = kept in this browser</p>
<div id="bar"><button id="copy">Copy picks</button><span id="status" class="meta"></span></div>
{"".join(cards)}
<script>
const KEY = "juke-box:" + {json.dumps(album_dir.name)} + ":kept";
let kept = {{}};
try {{ kept = JSON.parse(localStorage.getItem(KEY)) || {{}}; }} catch (e) {{}}
function save() {{ try {{ localStorage.setItem(KEY, JSON.stringify(kept)); }} catch (e) {{}} }}
function paint() {{
  document.querySelectorAll("li.take").forEach(li =>
    li.classList.toggle("kept", kept[li.dataset.track] === li.dataset.take));
}}
document.querySelectorAll("button.keep").forEach(b => b.addEventListener("click", () => {{
  const li = b.closest("li");
  kept[li.dataset.track] = kept[li.dataset.track] === li.dataset.take ? undefined : li.dataset.take;
  save(); paint();
}}));
document.getElementById("copy").addEventListener("click", () => {{
  const text = "picks: " + Object.entries(kept).filter(([, k]) => k)
    .map(([n, k]) => "track " + n + " = take " + k).join(", ");
  navigator.clipboard.writeText(text).then(
    () => document.getElementById("status").textContent = "copied: " + text,
    () => document.getElementById("status").textContent = text);
}});
paint();
</script></body></html>
"""
(album_dir / "index.html").write_text(page)
print(album_dir / "index.html")
