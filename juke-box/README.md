# juke-box

Full songs with vocals, made locally with MiniMax Music 3 (`MiniMaxAI/MiniMax-Music3`) through ComfyUI. A song starts from two texts: a caption that describes the style, and lyrics with section tags such as `[Verse]` and `[Chorus]`.

## Requirements

- A running ComfyUI with native MiniMax Music 3 support. ComfyUI v0.35.0 is tested.
- An NVIDIA GPU. The model needs CUDA.
- Python 3.11 or later, for `tomllib`.
- The `hf` command from `huggingface_hub`, for the download.
- `curl` and `nvidia-smi`.

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

## Make a song

In the browser: open ComfyUI, then Template Library → Audio → MiniMax Music 3.

From the shell, with the template's own example caption and lyrics:

```bash
mkdir -p run3
python3 -I scripts/build_prompt.py run3/prompt.json --seconds 60 --seed 7
scripts/run_prompt.sh run3/prompt.json run3
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

The model renders at 32 kHz. ComfyUI writes the file at 44.1 kHz, so the file holds no real content above 16 kHz.

Times and VRAM for songs longer than 60 s are not measured. The model accepts up to about 300 s.

## VRAM safety

On a 24 GB card that also drives the desktop, an idle ComfyUI keeps models cached up to the card's limit. A spike in desktop VRAM then fills the card. Launch ComfyUI with `--vram-headroom 2`. ComfyUI then keeps 2 GB free and counts the VRAM of other applications.

## Rights

The weights are under the MiniMax-Music3 Community Licence. Its acceptable-use policy, item 11, requires a clear machine-generated label on any output published in public.

## Layout

- `scripts/` — `download_models.sh`, `build_prompt.py`, `run_prompt.sh`, and `config.sh`, which the shell scripts source to read `config.toml`.
- `run1/`, `run2/` — renders with their prompts, VRAM logs and job histories. Git ignores the audio files.
- `card/` — an unmodified copy of the MiniMax Music 3 model card (<https://huggingface.co/MiniMaxAI/MiniMax-Music3>) and its Hugging Face file listing, read 2026-10-06. `card/LICENSE` is the MiniMax-Music3 Community Licence that covers it.
- `comfy_doc/` — an unmodified copy of the ComfyUI tutorial "MiniMax Music 3 in ComfyUI" (<https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3>, source <https://github.com/Comfy-Org/docs>) and the Hugging Face file listing of `Comfy-Org/MiniMax-Music-3`, read 2026-10-06. `comfy_doc/LICENSE` is the GPL-3.0 text of the docs repository.
