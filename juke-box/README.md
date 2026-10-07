# juke-box

Full songs and albums with vocals, made locally with MiniMax Music 3 (`MiniMaxAI/MiniMax-Music3`) through ComfyUI. A song starts from two texts: a caption that describes the style, and lyrics with section tags such as `[Verse]` and `[Chorus]`. An album starts from one prompt and grows over a few sessions with Claude Code: brief, tracklist, captions and lyrics, renders, picks, master.

## Requirements

- A running ComfyUI with native MiniMax Music 3 support. ComfyUI v0.35.0 is tested.
- An NVIDIA GPU. The model needs CUDA.
- Python 3.11 or later, for `tomllib`.
- The `hf` command from `huggingface_hub`, for the download.
- `curl`, `nvidia-smi`, `ffmpeg` and `ffprobe`.
- `git` 2.25 or later, for the sparse fetch of the caption skill.

## Set up

1. Copy `config.example.toml` to `config.toml` and edit the copy. `config.toml` is not tracked.
   - `comfyui_url` — the running ComfyUI.
   - `models_dir` — where the model files go: your ComfyUI's `models` directory, or a base path that your `extra_model_paths.yaml` maps.
   - `comfyui_log` — optional. ComfyUI's log file, so that each run keeps its log lines.
2. Download the model files, about 14.3 GB:

   ```bash
   scripts/download_models.sh
   ```

   The script puts three files from `Comfy-Org/MiniMax-Music-3` under `models_dir`:

   | File | Directory | Size |
   |---|---|---|
   | `minimax_music3_text_encoder_pruned_int8_convrot.safetensors` | `text_encoders/` | 9.2 GB |
   | `minimax_music3_dit_fp16.safetensors` | `diffusion_models/` | 4.9 GB |
   | `minimax_music3_dav.safetensors` | `vae/` | 0.2 GB |

3. Fetch MiniMax's `music-caption-rewriter` skill, about 6 MB with 1,000 caption templates, at a pinned commit:

   ```bash
   scripts/fetch_caption_skill.sh
   ```

   It goes to `.claude/skills/music-caption-rewriter/`, where Claude Code finds it. Git ignores it.

## Make an album

With Claude Code in this directory, ask for an album, an EP or a set of songs. The `album` skill (`.claude/skills/album/SKILL.md`) leads the sessions and reads `library/` at each step.

By hand, an album is a directory under `albums/`. `albums/example/` shows the layout:

```
albums/<slug>/
  album.toml                    title, arc, shared voice block, render and master settings, tracklist
  tracks/<NN>-<slug>/caption.md a {{voice}} line takes the album's voice block
  tracks/<NN>-<slug>/lyrics.txt
  tracks/<NN>-<slug>/takes/     take-<k>.flac and take-<k>.json (seed and exact graph)
  master/                       mastered tracks, album.flac, notes.txt
```

```bash
python3 scripts/render_album.py albums/<slug>               # takes for every track
python3 scripts/render_album.py albums/<slug> --tracks 3,5 --takes 2
python3 scripts/album_page.py albums/<slug>                 # index.html with players
python3 scripts/master_album.py albums/<slug>               # after `pick = k` per track
```

Take k of track n uses seed `seed_base + 100 * n + k`. A render pass adds takes and never overwrites one. `album_page.py` writes a page that plays every take; its "keep" buttons and "Copy picks" give text for setting `pick` in `album.toml`. `master_album.py` normalises the picked takes to −14 LUFS and −1 dBTP, writes tags and the machine-generated disclosure, and joins the masters into `master/album.flac` (`library/finishing.md`).

## Make a song

In the browser: open ComfyUI, then Template Library → Audio → MiniMax Music 3.

From the shell, with the template's own example caption and lyrics:

```bash
mkdir -p run4
python3 scripts/build_prompt.py run4/prompt.json --seconds 60 --seed 7
scripts/run_prompt.sh run4/prompt.json run4
```

`build_prompt.py` gets the template from ComfyUI. `run_prompt.sh` queues the prompt, waits, and writes `vram.log` (one sample every 0.5 s) and `history.json` into the output directory, plus `comfy.log` when `comfyui_log` is set. The audio file stays in ComfyUI's `output/audio/` directory.

## Measured on an RTX 3090

A 60 s song, `run1/`:

| Item | Value |
|---|---|
| Total time, model load included | 107 s |
| Autoregressive stage (8B + 0.6B LMs) | 38 s for 1,501 frames |
| Diffusion stage | 30 steps at about 2 s per step |
| Peak VRAM, whole card with the desktop | 18.9 GB |
| Loudness | −15.3 LUFS integrated, +0.2 dBFS true peak |

A 10 s song, `run2/`, took 20 s of wall time and 15.8 s of execution, in the same ComfyUI session after `run1/`.

A 180 s request, `run3/`, with tiled VAE decode (tile 1536, overlap 64): 272 s of wall time, 20.1 GB peak VRAM. The model ended the song at 165.5 s.

The non-tiled VAE decode adds a VRAM spike that grows with song length: 4.5 GB for 60 s. The scripts switch to tiled decode for songs longer than 60 s.

The model card states 32 kHz output, but ComfyUI's decoder writes 44.1 kHz audio at the correct speed: a 60 s request gives 60.0 s, and the measured tempo (86–88 BPM against a requested 78) rules out 32 kHz audio labelled as 44.1 kHz, which would read about 107 BPM. Content above 16 kHz is about 41 dB below the full signal.

The node accepts up to 360 s (9,000 frames at 25 frames per second); the card names 5 minutes. Songs longer than 180 s are not measured.

## VRAM safety

On a 24 GB card that also drives the desktop, an idle ComfyUI keeps models cached up to the card's limit. A spike in desktop VRAM then fills the card. Launch ComfyUI with `--vram-headroom 2`. ComfyUI then keeps 2 GB free and counts the VRAM of other applications.

## Rights

The weights are under the MiniMax-Music3 Community Licence. Its acceptable-use policy, item 11, requires a clear machine-generated label on any output published in public.

## Layout

- `scripts/` — the toolbox:
  - `download_models.sh`, `fetch_caption_skill.sh` — set-up.
  - `render_album.py`, `album_page.py`, `master_album.py` — the album tools.
  - `build_prompt.py`, `run_prompt.sh` — one song with VRAM logging.
  - `jukebox.py` — config, the MiniMax Music 3 graph and the ComfyUI client that the Python tools share. `config.sh` reads `config.toml` for the shell scripts.
  - `template_stats.py` — writes `library/genre-stats.md` from the caption templates.
  - `tempo.py` — tempo estimate of an audio file, by onset autocorrelation.
- `library/` — album craft, formats, genres, MiniMax prompting and finishing, with sources (`library/README.md`).
- `research/` — the raw research notes behind the library, and `research/sources/` for primary sources kept as evidence.
- `tmp/` — scratch: raw downloads and test files. Git ignores it.
- `albums/` — albums; `albums/example/` is a two-track example.
- `.claude/skills/album/` — the album workflow for Claude Code.
- `run1/`, `run2/`, `run3/` — single-song measurements with their prompts, VRAM logs and job histories.
- `card/` — an unmodified copy of the MiniMax Music 3 model card (<https://huggingface.co/MiniMaxAI/MiniMax-Music3>) and its Hugging Face file listing, read 2026-10-06. `card/LICENSE` is the MiniMax-Music3 Community Licence that covers it.
- `comfy_doc/` — an unmodified copy of the ComfyUI tutorial "MiniMax Music 3 in ComfyUI" (<https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3>, source <https://github.com/Comfy-Org/docs>) and the Hugging Face file listing of `Comfy-Org/MiniMax-Music-3`, read 2026-10-06. `comfy_doc/LICENSE` is the GPL-3.0 text of the docs repository.
