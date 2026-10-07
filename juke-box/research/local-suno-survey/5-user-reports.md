# First-Hand User Reports on Local Open-Weight Song Generators vs Suno v5

## Findings

### ACE-Step 1.5
- User anecdote: "IMHO This is SUNO 3.5 or 4 but OPENSOURCE" — suggests competitive vocal and song quality with Suno v3-v4 — https://huggingface.co/ACE-Step/Ace-Step1.5/discussions (2026, date specific not provided)
- User report: Inference getting stuck mid-process on certain GPUs — https://huggingface.co/ACE-Step/Ace-Step1.5/discussions
- User report: Character dropping during generation — https://huggingface.co/ACE-Step/Ace-Step1.5/discussions  
- User report: "Field report" on running XL-Turbo variant on 8 GB AMD card (hardware accessibility) — https://huggingface.co/ACE-Step/Ace-Step1.5/discussions
- Anecdote (ComfyUI community): @hellorob stated "Music 3 is currently the strongest open-source music generation model, and once the community starts training LoRAs, this model will only get better" — this compares MiniMax Music 3 favorably to other open-source options, not direct Suno comparison — date unknown, 2026 context from search results

### MiniMax Music 3
- No direct first-hand user reports found with specific quality assessments, complaints, or Suno comparisons in searched sources
- Note: MiniMax published weights August 13, 2026 on HuggingFace, potentially limiting user feedback window

### YuE2-3B
- No specific first-hand user reports found in searched sources
- General information: Runs on 4.5GB VRAM, supports Nvidia and AMD (from aggregator, not user forum)

### HeartMuLa-oss-3B, DiffRhythm 2
- No information found in searched sources

## Sources
- https://huggingface.co/ACE-Step/Ace-Step1.5/discussions — User discussions on ACE-Step performance, artifacts, hardware compatibility (2026)

## Gaps
- Reddit searches (r/SunoAI, r/aimusic, r/LocalLLaMA, r/StableDiffusion) returned no direct threads; Reddit site search may be rate-limited or discussions archived. Tried standard Reddit URLs and .json approach but no specific results.
- GitHub issues/discussions on ryan4yin/ACE-Step-1.5 returned 404; may require authentication or be restricted.
- No concrete user reports found for: YuE2 vocal realism, pronunciation quality; MiniMax Music 3 specific quality comparisons; HeartMuLa or DiffRhythm user experiences
- No threads directly comparing two or more of these models with each other or quantified comparisons with Suno v5 quality metrics
- Searches returned mostly aggregator blog posts and benchmarks (SongEval, WildSongBench) which per constraints should not be included
- Specific quality complaints (lyric skipping/repetition, mix clarity, genre range, seed variance) not found in first-hand sources

## Blocked URLs
- https://github.com/ryan4yin/ACE-Step-1.5/discussions — HTTP 404 Not Found
