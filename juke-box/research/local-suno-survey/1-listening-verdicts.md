# Community Listening Verdicts and Independent Benchmarks (2026)

## Findings

**Model Closest to Suno v5/v5.5:**
- YuE2 (best-of-8) achieves highest SongBench average at 6.9632 vs Suno v5's 6.8721, competitive with Suno v5/v6 quality — https://lilting.ch/en/articles/ace-step-music-generation-mac and community consensus; also performs well on SongEval per comparison blog
- ACE-Step 1.5 (especially XL released April 2026) outperforms Suno v5 on SongEval benchmark; described as "open community's closest thing to Suno" — https://lilting.ch/en/articles/ace-step-music-generation (February 2026) and https://learn.traeai.com/t/ai-engineering/phases/06-speech-and-audio/09-music-generation (2026 landscape overview)
- MiniMax Music 3 (August 2026) wins on production quality: "cleaner instrument separation, more realistic mixing and mastering, better-sounding drums and bass" with stronger lyric adherence and song structure; vocals perceived as "smoother, less synthetic" but "emotionally flatter" — https://blog.sogni.ai/blogs/minimax-music3-vs-ace-step-15-xl/ (blog comparison using identical test cases)

**ACE-Step 1.5 Failure Modes:**
- Vocal synthesis quality acknowledged as area for future improvement; community feedback: "sounds granular" — https://rits.shanghai.nyu.edu/ai/ace-step-1-5-open-source-music-generation-that-rivals-commercial-ai/ (September 2026)
- Output quality varies with random seed and duration settings; certain genres (notably Chinese rap) underperform; repainting transitions sound unnatural; fine-grained parameter control coarse — https://studio.aifilms.ai/blog/ace-step-1-5-music-generation-open-source (2026)
- Weird overlapping music and low quality reported in specific workflow configurations — https://www.goodfirstissue.org/hacksider/ACE-Step-1.5 (GitHub issues, date unknown)

**YuE2 Failure Modes:**
- Does not fully match Suno V6's polish; "Suno produced richer instrumental variety and more dramatic, layered arrangements in direct comparisons" — https://lilting.ch/en/articles/ace-step-music-generation-mac (blog comparison, 2026)

**MiniMax Music 3 Failure Modes:**
- Weak performance on EDM, metal, rock, and experimental genres; community identifies these as "challenging territory" — https://blog.sogni.ai/blogs/minimax-music3-vs-ace-step-15-xl/ (blog includes test cases in these genres, August 2026)
- Vocals locked to rhythm grid may reduce emotional expressiveness per some listeners — https://blog.sogni.ai/blogs/minimax-music3-vs-ace-step-15-xl/ (August 2026)

**HeartMuLa Reported Issues:**
- Pinned dependencies had conflicts with newer packages as of February 2026 — https://www.goodfirstissue.org/hacksider/ACE-Step-1.5 (reference to HeartMuLa dependency issues, Feb 2026)
- No detailed community listening verdicts or failure mode reports found in 2026 sources

**ACE-Step 1.5 vs MiniMax Music 3 Trade-offs:**
- ACE-Step: 3-5× faster, ~23× cheaper per minute, broader language support, flexible via LoRA — https://blog.sogni.ai/blogs/minimax-music3-vs-ace-step-15-xl/ (August 2026)
- MiniMax Music 3: Superior mix clarity and lyric adherence at cost of speed

**Independent Benchmark (Not Self-Published):**
- ICASSP 2025 paper "Benchmarking Music Generation Models and Metrics via Human Preference Studies" — https://arxiv.org/abs/2506.19085 (submitted June 23, 2025)
  - Authors: Florian Grötschla, Ahmet Solak, Luca A. Lanzendörfer, Roger Wattenhofer
  - Methodology: 6,000 songs from 12 state-of-the-art models, 15,000 pairwise audio comparisons, 2,500 human participants
  - Examined correlation between human preferences and audio metrics
  - Dataset committed to public release (not yet verified in search)
  - Did not retrieve specific model rankings from abstract

**SongBench / SongEval Benchmark Results (Source-Published, Not Self-Reported):**
- YuE2 (best-of-8): 6.9632 vs Suno v5: 6.8721 — https://lilting.ch/en/articles/ace-step-music-generation-mac (2026, cited in blog post)
- ACE-Step 1.5 outperforms Suno v5 on SongEval — https://rits.shanghai.nyu.edu/ai/ace-step-1-5-open-source-music-generation-that-rivals-commercial-ai/ (September 2026)

## Sources
- https://blog.sogni.ai/blogs/minimax-music3-vs-ace-step-15-xl/ — MiniMax Music 3 vs ACE-Step 1.5 XL detailed comparison with audio examples, August 2026
- https://lilting.ch/en/articles/ace-step-music-generation-mac — ACE-Step music generation overview and YuE2 SongBench comparison, February 2026
- https://rits.shanghai.nyu.edu/ai/ace-step-1-5-open-source-music-generation-that-rivals-commercial-ai/ — ACE-Step 1.5 vs Suno benchmarks and limitations, September 2026
- https://studio.aifilms.ai/blog/ace-step-1-5-music-generation-open-source — ACE-Step 1.5 architecture and acknowledged failure modes, 2026
- https://arxiv.org/abs/2506.19085 — Benchmarking Music Generation Models and Metrics via Human Preference Studies (ICASSP 2025), submitted June 23, 2025
- https://learn.traeai.com/t/ai-engineering/phases/06-speech-and-audio/09-music-generation — 2026 landscape overview with community consensus on models
- https://www.goodfirstissue.org/hacksider/ACE-Step-1.5 — GitHub issues repository (various dates)

## Gaps
- YouTube comparison videos: search returned article links and reviews but no direct YouTube video titles or top comments analyzed
- JAM-0.5 and SongGeneration/LeVo 2: no community listening verdicts or failure modes found in 2026 sources; these models appear absent from user discussions
- Detailed model rankings from ICASSP 2025 benchmark: abstract retrieved but specific model comparison results and rankings not extracted
- Single-user anecdotes: many findings are aggregated community observations; individual Reddit post links not retrieved due to search limitations
- HeartMuLa detailed user feedback: scarce community listening verdicts; only technical dependency issues documented
- ACE-Step 1.5 (base 2B) vs ACE-Step 1.5 XL comparative feedback from users; most discussion focuses on XL variant from April 2026 onward

## Blocked URLs
- None (all fetched pages returned content)
