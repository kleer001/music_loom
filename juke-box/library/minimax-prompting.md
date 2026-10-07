# MiniMax Music 3: prompting, limits and quirks

What the model takes, what it does with it, and what is measured. "Measured" marks a number from renders on an RTX 3090 in this directory (`run1/` to `run3/`).

## The caption

Write three sections in this order: **Global Metadata**, **Vocal Details**, **Arrangement**. Aim for 250–450 English words. (MiniMax `music-caption-rewriter` skill.)

The skill's 1,000 templates use these field labels inside the sections:

```
Global Metadata
Basic Attributes: bpm is 92. key is G, and scale is minor. Hip-Hop / Boom Bap.
Global Emotional Progression: <how the mood moves from intro to end>
Application Scenarios & Imagery: <where and when this music plays>
Sonics & Production Profile: <stereo width, frequency balance, dynamics>
Vocal Details
Vocal Gender & Timbre: Singer A (Male). <timbre, register>
Vocal Style: <delivery, and how it changes across sections>
Harmony/Backing Vocals: <or "none">
Vocal FX: <reverb, delay, doubling>
Arrangement
Instrument Lifecycle Description (Primary/Secondary Layering): <what enters, changes, exits>
Groove & Foundation Progression: <drums and bass across sections>
Embellishments, Textures & Spatial FX: <fills, risers, ambience>
```

Rules from the skill:

- Give an exact BPM or key only when it matters; otherwise give a range or a word ("mid-tempo").
- Describe the arrangement as a timeline: for each section, what enters, exits or intensifies.
- Do not copy lyrics into the caption.
- Priority when instructions conflict: the user's explicit requirement, then a section tag, then the caption's implication, then a reference, then a default.

ComfyUI strips Markdown from the caption (headings, bullets, bold) before encoding, so `caption.md` files can use Markdown freely.

## The lyrics

See `genres.md`: one tag per line, nine tags, ` ^ ` for a line break, 5,000 tokens for caption and lyrics together.

## Controls

| Control | Default | Note |
|---|---|---|
| seed | — | Changing `seconds` changes the song even with the same seed (community report; `run1/` and `run3/` share seed 7 and differ). Keep a track's `seconds` fixed while you try seeds. |
| seconds (`max_duration`) | 60 in the template, 120 in the node | Up to 360 s. The model may stop early: a 180 s request ended at 165.5 s (measured). |
| cfg_scale (language model) | 1.5 in the node, 1.7 in the template | |
| top_k | 50 | |
| steps, cfg (diffusion) | 30, 1.7, euler, simple | |
| tiled decode | off in the template | juke-box turns it on above 60 s to keep VRAM flat. |

## What the open weights cannot do

- **No reference audio, voice reference, cover, repaint, extend or stems.** The ComfyUI nodes take only caption, lyrics, seed, duration, `cfg_scale` and `top_k`. MiniMax's hosted API has more modes; the open weights do not.
- **No instrumental mode.** None of the 1,000 template captions is instrumental (`genre-stats.md`). Users report vocals in tracks asked to be instrumental: https://huggingface.co/MiniMaxAI/MiniMax-Music3/discussions/23 and https://github.com/MiniMax-AI/MiniMax-Music3/issues/7.
- **Loose tempo and key.** The model card says tempo, key, instrumentation, lyrics and structure "may not always match". Measured: two songs asked for 78 BPM came out at 86–88 BPM.

## Output

| Item | Value |
|---|---|
| File | 44.1 kHz stereo FLAC, at the correct speed (measured: duration matches the request, and tempo rules out a 32 kHz file labelled 44.1 kHz). The model card's "32 kHz" does not describe ComfyUI's output. |
| Bandwidth | Energy above 16 kHz is about 41 dB below the full signal (measured) |
| Loudness | −15.3 and −14.9 LUFS integrated (measured, 60 s and 165 s songs) |
| True peak | +0.2 and +0.1 dBTP (measured). The raw output clips a little; master it before release. |

## One voice across an album

The model has no voice input. Keep the voice steady through words:

- Write one Vocal Details block for the album and reuse it word for word in every caption. juke-box does this with a `{{voice}}` line.
- Use the templates' convention: `Singer A (Female)` or `Singer A (Male)`, then timbre and register.
- Keep the genre family steady. A voice described the same way still changes with the style around it.

This method is not tested for stability. Listen for drift between tracks.

## Community workarounds

`../research/minimax-workarounds.md` has the sources. In short:

- **Seed stability:** `fixed_kv_cache` in https://github.com/threegee409/ComfyUI-MiniMaxMusic3-Advanced keeps a seed's song when `seconds` changes. The node also splits sampling settings for semantic and acoustic codes.
- **Reference audio:** an open RVQ encoder (https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3) with https://github.com/user0506kjg/minimax-music3-rvq-reference-audio. Its author says adherence is inconsistent.
- **Inpainting and continuation:** mostly failed in Music3Lab (https://huggingface.co/coolpoodle/music3lab).
- **Mastering:** https://github.com/jplenio/ComfyUI-MiniMax-Music-Production-Toolkit has declip, FlashSR bandwidth extension, EQ and loudness nodes.
- **Style LoRA:** a LoRA on the language model only is reported to work (https://huggingface.co/terminusresearch/minimax-music3-lm-lora-fiona-crapple).
- **Speed:** slow autoregressive sampling (1–7 frames/s instead of about 40) was fixed with `--cuda-device 0` and `--disable-pinned-memory` (https://huggingface.co/Comfy-Org/MiniMax-Music-3/discussions/9). Measured here: 39–44 frames/s.

None of these is tested in juke-box.
