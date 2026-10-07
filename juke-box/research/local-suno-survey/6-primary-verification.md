# Primary-source verification of hardware numbers and release status

## Findings

### YuE2
- Minimum VRAM: 24 GB (explicitly required with BF16 support) — https://github.com/multimodal-art-projection/YuE (README, accessed 2026-10-06)
- Ampere compatibility: Ampere has BF16 support, but no explicit 24GB Ampere (3090/A5000/A10) confirmation in README — https://github.com/multimodal-art-projection/YuE (README, accessed 2026-10-06)
- Flash-attn requirement: not found in README or primary sources checked
- Peak VRAM: not found
- Time per song: not found

### MiniMax Music 3
- Full precision VRAM: fits under 24GB, with generation taking ~22 GB on single GPU — https://huggingface.co/MiniMaxAI/MiniMax-Music3 (accessed 2026-10-06)
- Layer-streaming mode: described as "slower, but fits in 8 GB" with no specific speed numbers provided — https://huggingface.co/MiniMaxAI/MiniMax-Music3 (accessed 2026-10-06)
- Ampere support: not mentioned in primary sources
- Attention kernels: not mentioned in primary sources
- Weights downloadable: Yes, via `hf download MiniMaxAI/MiniMax-Music3` — https://huggingface.co/MiniMaxAI/MiniMax-Music3 (accessed 2026-10-06)
- GGUF quantised variant (community): molbal/MiniMax-Music3-GGUF on HuggingFace (not from official publisher) — https://huggingface.co/molbal/MiniMax-Music3-GGUF

### ACE-Step 1.5 XL (4B)
- VRAM on RTX 3090 (24GB): ≥12 GB with CPU offload + INT8 quantization; ≥16 GB with CPU offload; ≥20 GB without offload; ≥24 GB for full quality (XL + 4B LM) — https://github.com/ACE-Step/ACE-Step-1.5 (README, accessed 2026-10-06)
- Speed on RTX 3090: under 10 seconds per full song — https://github.com/ACE-Step/ACE-Step-1.5 (README, accessed 2026-10-06)
- Model size (bf16): ~18.8 GB — https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Release date: 2026-04-02 — https://github.com/ACE-Step/ACE-Step-1.5

### DiffRhythm 2
- Official GitHub repo: https://github.com/ASLP-lab/DiffRhythm (primary source, accessed 2026-10-06)
- Weights: available on HuggingFace (ASLP-lab/DiffRhythm-1_2, ASLP-lab/DiffRhythm-1_2-full, etc.) — https://github.com/ASLP-lab/DiffRhythm (README, accessed 2026-10-06)
- Release date: March 4, 2025 (v1), May 9, 2025 (v1.2) — https://github.com/ASLP-lab/DiffRhythm (README, accessed 2026-10-06)
- License: Apache License 2.0 — https://github.com/ASLP-lab/DiffRhythm (README, accessed 2026-10-06)
- VRAM: minimum 8 GB (DiffRhythm-base); higher VRAM may be needed without chunked decoding — https://github.com/ASLP-lab/DiffRhythm (README, accessed 2026-10-06)
- Full-length songs with vocals: Yes, up to ~4 minutes 45 seconds with vocal generation support — https://github.com/ASLP-lab/DiffRhythm (README, accessed 2026-10-06)

### Tencent SongGeneration / LeVo 2
- HuggingFace page (https://huggingface.co/tencent/SongGeneration): HTTP 401 Unauthorized (accessed 2026-10-06)
- GitHub status: not verified (access attempt not made within budget)

### HeartMuLa-oss-3B
- Official GitHub repo: https://github.com/HeartMuLa/heartlib — https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- VRAM requirement: not found in primary sources checked
- Speed: not found
- Full songs with vocals: not found

### YuE2 GGUF variant
- No GGUF quantised build with official publisher (YuE2 or multimodal-art-projection) found

## Sources
- https://github.com/multimodal-art-projection/YuE — YuE2 official README, accessed 2026-10-06
- https://huggingface.co/MiniMaxAI/MiniMax-Music3 — MiniMax Music 3 official HF card, accessed 2026-10-06
- https://github.com/ACE-Step/ACE-Step-1.5 — ACE-Step 1.5 official GitHub README, accessed 2026-10-06
- https://huggingface.co/ACE-Step/acestep-v15-xl-base — ACE-Step 1.5 XL HF card
- https://github.com/ASLP-lab/DiffRhythm — DiffRhythm official GitHub README, accessed 2026-10-06
- https://huggingface.co/ASLP-lab/DiffRhythm-1_2 — DiffRhythm v1.2 weights on HF
- https://huggingface.co/molbal/MiniMax-Music3-GGUF — Community GGUF quantisation (not official)
- https://github.com/HeartMuLa/heartlib — HeartMuLa GitHub repo
- https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B — HeartMuLa official HF card

## Gaps
- YuE2: peak VRAM usage and generation time per song not stated in README or primary sources checked — attempted GitHub README and HF searches
- MiniMax Music 3: layer-streaming mode speed numbers not found (only "slower") — checked official HF card
- MiniMax Music 3: Ampere GPU and attention kernel requirements not mentioned in primary sources
- Tencent SongGeneration / LeVo 2: both GitHub and HF pages return error status (401, not verified further due to budget) — attempted HF fetch
- HeartMuLa-oss-3B: VRAM, speed, and full-song capability not found in primary sources checked
- YuE2 GGUF variant: no official quantised build found

## Blocked URLs
- https://huggingface.co/tencent/SongGeneration — HTTP 401 Unauthorized (attempted 2026-10-06)
