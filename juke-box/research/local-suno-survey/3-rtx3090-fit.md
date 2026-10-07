# RTX 3090 and Ampere Hardware Specifics

## Findings

### VRAM Usage and Generation Speed

- **ACE-Step 1.5**: <4GB VRAM for generation; generates full song in under 10 seconds on RTX 3090 — [ACE-Step 1.5 HuggingFace commit](https://huggingface.co/ACE-Step/Ace-Step1.5/commit/066d57904366d65ef77848d43eca198d3753aea9)
- **ACE-Step 1.5 (LoRA training)**: 12GB VRAM required for LoRA fine-tuning — [Search result](https://www.patreon.com/posts/157516177)
- **MiniMax Music 3**: Recommended configuration 24GB+; ~22GB with CPU offloading; 8GB minimum with layer-by-layer streaming — [oflight.co.jp](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)
- **MiniMax Music 3**: No official speed benchmarks published for layer streaming mode; layer-streaming on 8GB assumed slower but not measured — [oflight.co.jp](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)
- **HeartMuLa-oss-3B**: ~6.2GB VRAM peak with `lazy_load` flag; 8GB minimum with `--lazy_load true` for sequential model loading — [Search result mentioning HeartMuLa specs]
- **YuE2-3B**: No search results found

### Hardware-Specific Requirements (FP8, FlashAttention 3, Hopper/Ada features)

- **FlashAttention-3 with FP8**: Hopper-only (H100, H200); Ampere uses FlashAttention-2 without FP8 support — [spheron.network blog](https://www.spheron.network/blog/flashattention-2-vs-flashattention-3-h100-h200-guide)
- **ACE-Step 1.5**: No FP8 requirement specified in official documentation — [ACE-Step 1.5 HuggingFace commit](https://huggingface.co/ACE-Step/Ace-Step1.5/commit/066d57904366d65ef77848d43eca198d3753aea9)
- **MiniMax Music 3**: FP8 optimized variant exists (Turbo version) but not required for standard inference; base model runs on standard precision — [modulsx/MiniMax-Music-3-Turbo-FP8 HuggingFace](https://huggingface.co/modulsx/MiniMax-Music-3-Turbo-FP8)
- **HeartMuLa-oss-3B**: Uses CUDA by default; torch==2.4.1 includes CUDA 12.1 support out of box — [Search result for HeartMuLa specs]

### MiniMax Music 3 and 24GB Fit

- **MiniMax Music 3 on 24GB RTX 3090**: Fits at recommended configuration 24GB+ with reference setup; layer streaming reaches 8GB but no speed measurements published — [oflight.co.jp](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)
- **Layer streaming performance**: No public benchmarks available; article notes "It's reasonable to assume lower-VRAM setups run slower, but that is a general inference, not a measured figure for this specific model" — [oflight.co.jp](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)

### Quantized Variants

- **ACE-Step 1.5 GGUF**: Available at `amandabenson/ACE-Step-1.5-GGUF-fork` on HuggingFace; supports Q4_K_M quantization with llama.cpp; Q4_K_M retains ~92% of FP16 quality with 3-4x size reduction and minimal loss — [amandabenson ACE-Step-1.5-GGUF-fork](https://huggingface.co/amandabenson/ACE-Step-1.5-GGUF-fork)
- **MiniMax Music 3 GGUF**: Available at `audio-cpp/minimax-music3-gguf` on HuggingFace — [audio-cpp minimax-music3-gguf](https://huggingface.co/audio-cpp/minimax-music3-gguf)
- **MiniMax Music 3 int8**: ComfyUI supports int8 quantization with tiled decoding but specific VRAM savings not documented — [oflight.co.jp](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)
- **No AWQ or NF4 variants found** for ACE-Step 1.5, MiniMax Music 3, or HeartMuLa-oss-3B in public searches

## Sources

- [ACE-Step 1.5 HuggingFace - Commit 066d57904366d65ef77848d43eca198d3753aea9](https://huggingface.co/ACE-Step/Ace-Step1.5/commit/066d57904366d65ef77848d43eca198d3753aea9)
- [oflight.co.jp - MiniMax-Music3 Requirements 2026](https://www.oflight.co.jp/en/columns/minimax-music3-requirements-local-2026)
- [Spheron Network - FlashAttention 2 vs 3 Guide](https://www.spheron.network/blog/flashattention-2-vs-flashattention-3-h100-h200-guide)
- [modulsx - MiniMax-Music-3-Turbo-FP8 HuggingFace](https://huggingface.co/modulsx/MiniMax-Music-3-Turbo-FP8)
- [audio-cpp - minimax-music3-gguf HuggingFace](https://huggingface.co/audio-cpp/minimax-music3-gguf)
- [amandabenson - ACE-Step-1.5-GGUF-fork HuggingFace](https://huggingface.co/amandabenson/ACE-Step-1.5-GGUF-fork)
- [Patreon post mentioning ACE-Step 1.5 LoRA requirements](https://www.patreon.com/posts/157516177)

## Gaps

- **YuE2-3B**: No search results found; cannot verify model existence, VRAM requirements, or compatibility
- **MiniMax Music 3 layer streaming speed**: No published benchmarks; layer-streaming mode performance on 8GB unknown
- **HeartMuLa-oss-3B RTX 3090 speed**: Found VRAM numbers but no actual generation time benchmarks
- **Quantized variant quality loss**: No user reports found comparing quality of GGUF vs full-precision for these music models
- **Reddit/GitHub user reports dated 2026**: Limited discussion threads found; most sources are official documentation or blog posts

## Blocked URLs

- None encountered
