# MiniMax Music 3 Prompting Craft

## Findings

### Official Skill: music-caption-rewriter

- **Core Purpose**: Transforms brief music descriptions and optional tagged lyrics into "Music 3.0 Structured Captions" for generation control using natural-language reasoning and local text files only (no external APIs). — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

- **Input Requirements**: Caption (required natural-language music description), Lyrics (optional text with bracketed section/control tags treated as executable directives, not for literal reproduction), Constraints (optional length, format, exclusions, creative direction). — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

- **Output Structure**: Three required headings in order: (1) Global Metadata (genre, tempo range, emotional arc, sonic profile), (2) Vocal Details (lead configuration, timbre, effects, or instrumental identification), (3) Arrangement (section-by-section timeline with instrument lifecycles and transitions). Target length: 250–450 English words unless specified otherwise. — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

- **Workflow Stages**: Eight ordered steps: (1) build private Music Brief, (2) resolve constraints, (3) read genre router, (4) select one or two family indexes, (5) compare up to three reference cards with distinct roles (Foundation, Modifier, Arrangement), (6) read chosen template files, (7) design section-by-section timeline, (8) render and validate caption. — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

- **Section Tags**: Support `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`. Tags must be placed on separate lines for proper parsing. Treat lyric tags as musical directives only; use lyric text to infer broad emotional context, never reproduce actual lyrics verbatim. — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md and https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/README.md

- **Key Constraints**: Never invent precise BPM, key, or vocal gender without explicit justification. Preserve all hard user exclusions and explicit instrumental requirements. Apply precedence: explicit user requirements > section tags > caption implications > reference characteristics > defaults. Return JSON/JSONL only when explicitly requested. — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

- **Technical Architecture**: System uses progressive disclosure with ~1,000 static text templates across 18 style families. 100% text-based (no scripts, embeddings, or external services). Genre router maps inputs to style families, then selects up to three reference templates with distinct roles to synthesize original caption. — https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/README.md

### Demo Page Analysis (11 genres, 26 tracks)

- **Consistent Caption Structure Across All Genres**: (1) Genre tag/visual indicator, (2) Genre name (repeated), (3) Global Metadata (BPM, key, scale, style descriptors), (4) Global Emotional Progression (narrative arc description), (5) Application Scenarios & Imagery (use cases and visual evocation), (6) Sonics & Production Profile (technical audio characteristics), (7) Vocal Details (Gender/Timbre, Style, Harmony/Backing Vocals, Effects), (8) Arrangement (Instrument Lifecycle, Groove & Foundation, Embellishments). — https://minimax-ai.github.io/music3-demo/ (read 2026-10-06)

- **Example Caption 1 (Pop)**: "bpm is 88. key is Bb, and scale is major. Pop Rock / Soul." Emotional progression: "reflective, maternal intimacy" evolving into "empowering anthem." Production: "intimate but expands into a wide, cinematic stereo field." — https://minimax-ai.github.io/music3-demo/

- **Example Caption 2 (Rock)**: "bpm is 154. key is E, and scale is major. Pop Funk / Pop Punk." Imagery: "sun-drenched art studios, vibrant splashes of paint across a canvas." Vocal: mezzo-soprano shifts from "bright, pop-focused clarity to a gritty, punk-inspired edge." — https://minimax-ai.github.io/music3-demo/

- **Example Caption 3 (R&B)**: "bpm is 74. key is Ab, and scale is minor. R&B / Neo-Soul." Atmosphere: "hollow, ethereal isolation" and "bittersweet tension between love and secrecy." Production: "deep, immersive soundstage." — https://minimax-ai.github.io/music3-demo/

### HuggingFace Model Card & MiniMax Platform Docs

- **Lyric Tags (Supported)**: `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`. Tags should be placed on their own lines for correct parsing. — https://huggingface.co/MiniMaxAI/MiniMax-Music3

- **Line-Break Convention**: Section tags must appear on separate lines from lyric content to ensure correct structural recognition during generation. — https://huggingface.co/MiniMaxAI/MiniMax-Music3

- **Lyric Length**: System accepts lyrics up to approximately 5,000 tokens when tokenized as text prompts. — https://huggingface.co/MiniMaxAI/MiniMax-Music3

- **Supported Languages**: Documentation does not explicitly specify which languages are supported beyond English examples provided. — https://huggingface.co/MiniMaxAI/MiniMax-Music3

- **Instrumental Tracks**: The model generates complete mixed audio with both vocal and instrumental components. Users specify instrumentation through the music description (e.g., "fingerpicked guitar and soft piano"), but cannot request isolated instrumental stems separately. — https://huggingface.co/MiniMaxAI/MiniMax-Music3

- **Prompt Length & Max Duration**: Music descriptions customizable extensively. Structured captions contain three sections (Global Metadata, Vocal Details, Arrangement). Maximum audio generation is limited to 9,000 acoustic frames at 25 fps, supporting songs up to five minutes long. ComfyUI implementation defaults max_duration to 120 seconds. — https://huggingface.co/MiniMaxAI/MiniMax-Music3 and https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

- **Advanced Settings**: cfg_scale and top_k parameters available for fine-tuning generation behavior. Seed control enables reproducibility when iterating on captions. — https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

### ComfyUI Best Practices

- **Caption Organization**: Structure captions following three-section format consistently (Global Metadata, Vocal Details, Arrangement). "The more specific, the closer the result." — https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

- **Lyric Tagging Principle**: "The tags are executable; the lyric text itself conveys mood, not structure." Section tags control form; lyrics inform vibe and phonetics. — https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

- **BPM and Key Control**: BPM and key specifications belong in the Global Metadata section of caption. These are foundational parameters for coherent musical generation. — https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

- **Iterative Refinement**: Set a seed and keep it fixed while refining caption text to iterate on same arrangement. Adjust caption specificity to steer style without overconstraining creativity. — https://blog.comfy.org/p/minimax-music-3-state-of-the-art and https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3

## Sources

- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md (read 2026-10-06)
- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/README.md (read 2026-10-06)
- https://minimax-ai.github.io/music3-demo/ (read 2026-10-06)
- https://huggingface.co/MiniMaxAI/MiniMax-Music3 (read 2026-10-06)
- https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3 (read 2026-10-06)
- https://blog.comfy.org/p/minimax-music-3-state-of-the-art
- https://api.github.com/repos/MiniMax-AI/MiniMax-Music3/contents/skills/music-caption-rewriter (read 2026-10-06)

## Gaps

- **Repository License**: Could not retrieve LICENSE file from repo root (HTTP 404). Unknown if MIT, Apache 2.0, or proprietary. — Attempted https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/LICENSE

- **Template and Reference Files**: GitHub API showed music-caption-rewriter folders (agents, references, templates) as empty; actual template files not accessed. Unable to verify if 1,000 templates exist or document their structure. — https://api.github.com/repos/MiniMax-AI/MiniMax-Music3/contents/skills/music-caption-rewriter (read 2026-10-06)

- **Community Prompt Tips from GitHub Issues and HF Discussions**: Could not access specific GitHub issues or HuggingFace discussions threads for prompting best practices, BPM/key/structure/lyric adherence tips. Search results did not return issue links from official repo or discussions threads.

- **Vocabulary Lists**: SKILL.md mentions reference files with vocabulary but did not provide explicit word lists or style descriptors. Unknown if specific genre vocabularies are prescribed.

- **Supported Languages**: Model card and docs do not enumerate language support beyond English examples.

## Blocked URLs

- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/LICENSE — HTTP 404 Not Found
