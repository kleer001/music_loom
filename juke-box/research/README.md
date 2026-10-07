# research

Web research notes behind juke-box. Each file is raw notes from a research agent, with a URL and a date on each claim. The notes are not verified line by line. Where a claim here conflicts with a primary source, the primary source wins.

## Files

- `local-suno-survey/` — open-weight replacements for Suno on a 24 GB RTX 3090, gathered 2026-10-06:
  - `1-listening-verdicts.md` — quality comparisons. Most of the numbers are benchmarks that the publishers ran on their own models, not independent listening.
  - `2-tooling-stack.md` — front-ends, LoRA tools, and post-processing (stem separation, voice conversion, mastering).
  - `3-rtx3090-fit.md` — VRAM and speed on 24 GB cards.
  - `4-bleeding-edge.md` — releases from August to October 2026.
  - `5-user-reports.md` — first-hand reports from model-card discussions.
  - `6-primary-verification.md` — hardware numbers and release status, checked against official READMEs and model cards.
- `album-structure/` — how albums are built and how AI-music makers make them, gathered 2026-10-06. Notes 1–8 cover sequencing, album norms by genre, arcs and feel, song norms and lyric craft, AI-album workflows, MiniMax prompting, and genre cards; `synthesis.md` joins them. `../library/` is the checked version of this material.
- `sources/neto-2025-plos-one.xml` — full text (JATS XML from Europe PMC) of Neto, Hartmann, Luck and Toiviainen, "An album is a story: Feature arcs in sequences of tracks", *PLOS One* (2025), doi:10.1371/journal.pone.0316963, under CC BY 4.0. `../library/album-craft.md` quotes its results from this file.
- `minimax-workarounds.md` — community workarounds for the limits of MiniMax Music 3: reference audio, inpainting, instrumental-only, seed stability, mastering, LoRA, speed. Gathered 2026-10-06 from GitHub issues and Hugging Face discussions.

## Known errors

- `4-bleeding-edge.md` says the MiniMax Music 3 weights were not confirmed. They are on Hugging Face (`MiniMaxAI/MiniMax-Music3`), last modified 2026-08-14.
- `4-bleeding-edge.md` says Tencent SongGeneration / LeVo 2 is accessible. Its Hugging Face page returned HTTP 401 on 2026-10-02 and on 2026-10-06.
- `3-rtx3090-fit.md` and `2-tooling-stack.md` cite some aggregator and blog sites, and give a quality figure for GGUF quantisation ("~92%") with no primary source. Treat those claims as unverified.
- For MiniMax Music 3 on an RTX 3090, the measured numbers in `../README.md` replace the estimates in these notes.
- `album-structure/synthesis.md` and notes 1 and 3 merge two studies into one "study of 51,010 albums". The 51,010-album study is Neto et al. 2024 (*Journal of New Music Research*). The tempo and valence arcs come from Neto et al. 2025 (*PLOS One*, doi:10.1371/journal.pone.0316963), in which 130 professionals ordered five-track sets. That paper finds a U shape for valence and loudness, highest at the first and last tracks, not a fall from start to end. `../library/album-craft.md` has the corrected account, read from the paper's full text.
- `album-structure/5-ai-album-workflows.md` says MiniMax Music 3 uses reference tracks. Only MiniMax's hosted API does; the open weights take no audio input.
- `album-structure/synthesis.md` cites arXiv 2609.15675 for a study of 100 Chinese pop songs. That paper was not checked.
