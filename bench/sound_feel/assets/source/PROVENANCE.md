# Source provenance

| File | What it is | Origin | Licence |
|---|---|---|---|
| `field_2026-09-11_0858.wav` | 60.6 s ambient field recording — a low murmur with ~21 sparse vocal/impact events | Own recording, captured on a handheld recorder | Own work |

Captured as a stereo AAC that was **dual-mono** (both channels bit-identical), folded
to true mono here without loss. It carries mic **wind** — broadband, gusty, under
~120 Hz — which `tools/build.py` strips before use.

Everything else in `assets/` is **derived** from this file by `tools/build.py`, and
regenerates from it:

- `bed.wav` — the seamless loop window, wind removed, with a seeded synthetic low
  floor mixed under it.
- `grains.wav` — the extracted events, concatenated (indexed in `../../data.js`).

Regenerate: `python3 tools/build.py`. The loop bounds live in `build.py`; re-derive
them with `python3 tools/find_loop.py` if the source is replaced.
