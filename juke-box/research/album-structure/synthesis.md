# Album structure and the prompt-to-album workflow for MiniMax Music 3

## 1. Answer

Professional albums follow measurable sequencing patterns. Strong openers, alternating energy, and a quieter close appear in a study of 51,010 albums. Length norms differ by genre and have shifted toward shorter songs. For MiniMax Music 3 open weights, the workable method is: fix one album brief, write one structured caption (Global Metadata, Vocal Details, Arrangement) plus tagged lyrics per song, and keep a seed fixed while you refine each caption. The open weights take no reference audio, so voice and style consistency must come from repeated caption wording and seeds. The notes found no source on finishing, metadata or disclosure for AI albums beyond a loudness target.

Source weight used below: academic papers and official documentation rank above blogs. "Single source" marks a claim that rests on one page. "Blog only" marks a claim from a blog, SEO page or service-selling site.

## 2. Findings

### 2.1 Album sequencing rules

| Rule | Evidence | Weight |
|---|---|---|
| The opener teaches the listener the sound palette. The closer resolves tension or leaves a deliberate afterimage. | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ (Toiviainen et al. 2024) | Academic |
| Put songs with high valence, energy and loudness near the start. Professional musicians agree on this. | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ | Academic |
| Alternate rises and falls of valence and energy between consecutive tracks. Louder, more energetic tracks usually precede quieter ones. | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ | Academic (51,010 albums) |
| Avoid long runs of similar tempo, key or arrangement, unless monotony is the goal. | https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/ | Blog (DJBooth article) |
| Adjacent tracks create contrast, callback, irony or continuity that neither track carries alone. | https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/ | Blog |
| Common errors: no logical progression, too many interludes, a weak ending, poor dynamic balance, long runs of slow or fast songs, treating the album as isolated tracks. | https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/ | Blog |
| Front-load energy, and wind down toward the end of a side (vinyl logic). The last track of a side is often a slower, sparse ballad. | https://www.nicklandis.com/blog/sequence-story | Blog |
| Early tracks matter most in streaming, because skips decide whether later tracks are reached. | https://www.nicklandis.com/blog/sequence-story | Blog |
| Tori Amos: the fluidity from one track to the next is "really essential". The listener should be able to "put the album on and have an experience". | https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/ | Interview quote, relayed by a blog |

Skip data (Spotify, Paul Lamere analysis relayed by HypeBot): 24.14% skip in the first 5 s, 28.97% in 10 s, 35.05% in 30 s, and 48.6% skip before the song ends. Desktop skip rate is 40.1% and mobile is 51.1%. Source: https://www.hypebot.com/what-spotify-song-skip-rates-tell-us-about-our-attention-span/ (data analysis, reported by a trade blog).

Gaps between tracks:
- Red Book CD requires a 2 s pre-gap before track 1. https://support.discmakers.com/hc/en-us/articles/209223248
- Mastering engineers add 100-300 ms after a track index point, because CD player unmute circuits vary from 0 to 200 ms. https://csr.hdsupply.com/best-pause-time-between-tracks-on-a-cd/ (single source, a non-specialist site)
- Between-track gaps are not standardised. One approach is a 1-2 s gap between the index flag and the audio. https://support.discmakers.com/hc/en-us/articles/209223248
- Bob Katz's "Mastering Audio" covers gap length and how to join stylistically different tracks. The notes only confirm that the book covers this. They do not give its advice. https://www.soundonsound.com/node/4916079

### 2.2 Album norms by genre, with numbers

Format definitions (use these to pick "EP" or "album"):

| Authority | Single | EP | Album | URL |
|---|---|---|---|---|
| Spotify (via CD Baby) | 1-3 tracks, under 30 min | 4-6 tracks, under 30 min | 7+ tracks or over 30 min | https://support.cdbaby.com/hc/en-us/articles/360008275672 |
| Apple Music (via AWAL) | 1-3 tracks, each under 10 min, under 30 min total | 4-6 tracks under 30 min, or 1-3 tracks with at least one over 10 min | 7+ tracks or over 30 min | https://help.awal.com/hc/en-us/articles/7882058990867 |
| Grammy (Recording Academy) | not given | 3-5 tracks | 5+ tracks and 15+ min, or any length with 30+ min | https://grammy.com/news/whats-difference-grammy-album-vs-record-year-explained and https://jamaica-gleaner.com/article/entertainment/20191121/koffee-cops-grammy-nomination-ep-academy-defines-5-track-rapture |
| Official Charts Company (UK) | max 4 tracks, max 25 min | not given | more than 4 tracks or over 25 min | https://newindustryfocus.com/tags/occ-chart-eligibility and https://mail.45worlds.com/topic/102293 (a forum) |

Platform and award-body definitions differ. Choose the target first. A set of 7 or more tracks, or over 30 minutes, counts as an album on both streaming platforms in the notes.

Length and track-count norms:

| Genre or format | Norm | URL | Weight |
|---|---|---|---|
| Hip-hop song | 3.2 min average by 2022, down 30% from 4.5 min in 1995 | https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ | Data analysis |
| Pop song | 3.36 min average by 2022, down 18% from 4 min | https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ | Data analysis |
| Country song | 3.35 min in 2022, down from 3.48 min in 2019 | https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ | Data analysis |
| Hot 100 median | 4:10 (2000), 3:30 (2018), 3:07 (2021), about 3:00 (2024). Songs under 3 min were 4% of the Top 10 in 2016 and 38% by 2022. | https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ | Blog (cites research) |
| Pop album | 10-15 tracks, 35-45 min | https://blog.groover.co/en/tips/how-long-is-an-album-en/ | Blog |
| Hip-hop album | Over 15 tracks per album by 2022 (up 16%). It was 10-12 tracks historically. | https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ and https://blog.groover.co/en/tips/how-long-is-an-album-en/ | Data analysis plus blog |
| Any genre | 30-45 min and about 11 tracks give higher completion | https://blog.groover.co/en/tips/how-long-is-an-album-en/ | Blog only |
| R&B album | 8-12 tracks, 35-45 min | no primary source (the notes call it implicit) | Unsupported |
| K-pop mini-album | 5-7 tracks, now the most common format. One new title song. Intro or outro may be instrumental or narration. | https://seoulbeats.com/?p=249873 and https://seoulbeats.com/?p=73595 and https://nckpophive.substack.com/p/a-guide-to-k-pop-albums | Fan blogs |
| K-pop full album | 8+ tracks | same K-pop sources | Fan blogs |
| EP, general | 3-7 tracks, 10-30 min. Contemporary: 4-9 tracks, 15-30 min. | https://www.usemogul.com/post/what-is-an-ep-in-music-a-comprehensive-guide | Blog (service site) |
| Lo-fi or chillhop track | 1-3 min. The album is made to loop. | Music production blogs listed in the notes, no single URL | Single source |
| Ambient album | Continuous or looping. Example: Music for Airports, four pieces built from tape loops of different lengths. | Wikipedia, per the notes (no URL given) | Single source |

Streaming mechanics. A Spotify stream counts after 30 s. This rewards more and shorter tracks. https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/. One blog gives the revenue effect: a 2:15 track earns 26 payable streams per hour and a 4:15 track earns 14. https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ (single source). For a local album this pressure does not apply. It does explain why modern pop is short.

Interludes and skits:
- Hip-hop skits were standard after 1988. They serve as continuity devices and palette cleansers, and they are declining now. https://popmatters.com/how-to-begin-end-album and https://www.complex.com/music/a/gabriel-alvarez/the-50-greatest-hip-hop-skits
- Intros, interludes and outros in hip-hop show album intent and continuity. https://popmatters.com/how-to-begin-end-album
- Overuse of interludes is a listed sequencing error. https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/
- The notes hold no count of interludes per album by genre.

### 2.3 Arc shapes and how to describe feel

Measured arcs (all from https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/, Toiviainen et al. 2024, academic):
- Tempo follows an inverted U across the album: lower at the start, higher mid-album, lower at the end.
- Valence, arousal and loudness show the opposite shape: higher at the start, lower at the end.
- Consecutive tracks alternate between rises and falls.
- A three-act pattern is implied: an early hook cluster, a middle that tolerates experiment, and an end region with reprises and payoffs.
- The notes call this "breathing" (alternate high and low intensity). Steady escalation builds pressure. Front-loaded intensity frames later tracks as aftermath.
- The shape of the emotional sequence matters more than single values. The sad-to-happy and happy-to-sad orders change reported feeling.

Song-level arc (inside one song). A study of 100 Chinese pop songs found verse = low activation, pre-chorus = build, chorus = high-arousal arrival. It also found local cycles with pullbacks and a late rise in valence and arousal over the whole song. https://arxiv.org/pdf/2609.15675 (2026 paper; the notes could not fetch the PMC full text, so check this paper's ID against the original before you cite it in public).

Concept and narrative albums:
- A concept album works like a cyclical symphony in several movements that present one narrative. It uses large-scale structure inside long tracks and across the album. https://etheses.durham.ac.uk/id/eprint/15594/ (Durham thesis, academic)
- Tools: narrative structure, skits, callbacks, and cause-and-effect links between tracks. Same thesis.
- Examples from the notes: Pink Floyd, The Wall (80 min; isolation and breakdown narrative, unified by lyrics and motifs) and Kendrick Lamar, good kid, m.A.A.d city (breaks continuity on purpose; ends by revealing the addressee). https://faroutmagazine.co.uk/what-makes-a-good-concept-album/ (critical blog)

Mood albums without a story. Cohesion comes from a stable sonic palette: consistent drum textures, recurring synth patches and re-used vocal stacks, with motifs at timbral, harmonic and structural levels. Lyrics reuse images and phrases in changed contexts. The notes cite https://georgetownindy.com for this. They also mark parts as "implied from corpus analysis". Treat this as weak support (vague source, no specific page).

Vocabulary for feel. The terms below come from https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/: cohesion, flow, palette, arc, peak, comedown, breathing. Use these as caption words. Pair each with a measurable cue (tempo band, loudness, valence). MiniMax captions already ask for a "Global Emotional Progression" (see section 2.6).

### 2.4 Per-genre song and lyric norms

All rows are from non-academic or teaching pages unless stated. Section lengths range from 8 to 24 bars across genres (https://emastered.com/blog/rap-song-structure).

| Genre | Tempo (BPM) | Form and delivery | URL | Weight |
|---|---|---|---|---|
| Boom bap | 85-95 | Intro 4 bars, verse 16, chorus 8, verse 16, chorus 8, outro | https://emastered.com/blog/rap-song-structure | Blog |
| Trap | 130-150 | Intro 8, verse 16, chorus 8, verse 16, chorus 8, outro | same | Blog |
| Drill | 140-145 | Intro 8, chorus 8, verse 16, chorus 8, verse 16, chorus 8, outro | same | Blog |
| Rap verse | not applicable | 16 bars standard. Also 8, 24 or 32. | same | Blog |
| Blues | 70-120, shuffle feel | 12-bar AAB most common. Also 8, 16, 24 bars. | https://www.dummies.com/article/academics-the-arts/music/music-theory/music-theory-popular-genres-and-forms-265008/ | Reference book site |
| Metal | 120-180 | Intense, double-kick drums. No form data. | same | Reference book site |
| Punk | 160-200 | Fast, aggressive, minimal breaks. No form data. | same | Reference book site |
| R&B and soul | 70-100 | Verse-chorus with extended outros as a vocal showcase. Urban pop/R&B form: intro, verse, pre-chorus, chorus, verse, pre-chorus, chorus, bridge, chorus, outro. | https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/07%3A_Popular_Music | Open textbook |
| Country | 100-130 | Narrative, steady pulse. Strong verses with simple choruses. | same | Open textbook |
| Folk | not given | Strong verses with simple choruses, narrative | same | Open textbook |
| Funk | 110-130 | Groove, syncopation, instrumental interplay | same | Open textbook |
| Pop and rock | not given | Verse-chorus with a bridge, repetition-focused | same | Open textbook |
| Hip-hop | see rap rows | Multiple verses with hooks, story-focused | same | Open textbook |
| Pop (streaming era) | not given | First chorus within 30 s, often within 15 s. Intro 0-5 s. Bridge in 15-25% of songs (75-85% in the CD era). Key changes near zero (about 30% in the 1990s). Outros are hard stops or loops. | https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ | Blog, single source |
| Funk (second source) | 90-110 | Riff-based cycles; one groove runs for minutes | Music-generator resources named in the notes | Blog only |
| Soul (second source) | 60-130 | Verse-chorus with ad-libs rising to a belted last chorus; gospel call-and-response; Hammond B-3 | same | Blog only |
| Reggaeton | Old school 90-100; pop 90-105; Dominican dembow 115-130; trap Latino 130-160 | Coro (chorus) over dembow pulse. Spanglish rhymes across both languages. | Music-generator resources named in the notes | Blog only |
| Lo-fi or chillhop | 60-90 (or 85-110) | 4/4. 2-3 drum elements, kick on 1 and 3, snare on 2 and 4. Intro, main loop with subtle build, optional breakdown. 3-5 layered sounds. | Music production blogs named in the notes | Blog only; sources disagree |
| Bossa nova | not given | Samba-based, "swaying" not swinging. Intimate, conversational vocal. | Wikipedia and Suno pages named in the notes | Single source |
| Vocal jazz | not given | AABA, 32 bars (4 x 8). Performance order: optional intro, first chorus, second chorus, optional solos, last chorus, optional ending. | Sheet music and performance guides named in the notes | Single source |

Lyric craft (applies across genres):
- Use imagery and sensory detail. Show a feeling through action or setting, not by naming it. Vary rhyme and use near rhymes. Keep one form for flow. https://a-lyric.com/ (summary of Pat Pattison, "Writing Better Lyrics"; a search summary, not the book)
- Match stressed syllables to musical stress. Place rhymes and hooks inside the melodic structure. Write for 3/4, 4/4 and swing feels. https://online.berklee.edu/courses/lyric-writing-writing-lyrics-to-music (course page, official)
- The chorus is the emotional and melodic peak. It states the main message in a few lines. It should differ from the verses in melody, lyric and intensity. https://wisseloord.org/?p=33947 (blog)
- Make a hook simple and repeat it. https://fastrhymes.com/blog/how-to-write-a-chorus-that-sticks-tips-for-crafting-memorable-hooks (blog)
- Modern verses carry hooks: repeated rhythm, internal rhyme, repeated phrases. https://songtown.com/on-songwriting/songwriters-verses-are-the-new-chorus/ and https://songtown.com/on-songwriting/songwriting-hacks-verses-need-hooks/ (blogs)
- A bridge should build intensity beyond the verses. Title placement changes chorus impact. https://online.berklee.edu/courses/songwriting-writing-hit-songs (course page)
- Indie rock traits: pop accessibility mixed with noise, irony over sensitive lyrics, concern with authenticity. https://drum.lib.umd.edu/bitstream/handle/1903/17444/Essential%20Indie.pdf (University of Maryland academic resource)

### 2.5 AI-album workflow and finishing

Most of this section rests on blogs and service sites. Official Suno or Udio documentation was not found.

Consistency:
- Hosted tools keep identity with Personas (Suno) and Voices (Suno, Udio). https://jackrighteous.com/en-gb/blogs/guides-using-suno-ai-music-creation/suno-v5-5-voices-custom-models-my-taste-beginner-guide (blog) and https://jackrighteous.com/de/blogs/ai-creator-tools/udio-edit-replace-section-lyrics-workflow (blog). These need voice or song input. The open MiniMax weights have no such input, so they do not transfer.
- Extension causes drift. Udio tone degrades over segments. Suno shows a vocal shift at 4:30 in six-minute songs. https://apipass.dev/blogs/suno-v5-common-issues-and-solutions (community-sourced blog). Practical reading for MiniMax (inference): keep each song a single generation under 5 minutes.
- Failure modes reported for Suno and Udio: "AI fingerprint" sameness, genre drift mid-song, 85% lyric adherence with dropped couplets, and about one in three Udio generations flawed. Same apipass URL. Test whether MiniMax shows the same ones.

Iteration:
- Creators run dozens to hundreds of generations per track. https://arxiv.org/pdf/2507.01022 (academic, 2025)
- Suno typically needs about three regenerations for a usable result. https://apipass.dev/blogs/suno-v5-common-issues-and-solutions (blog)
- MiniMax: keep the seed fixed while you refine the caption, to hold the same arrangement. https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3 and https://blog.comfy.org/p/minimax-music-3-state-of-the-art (official)

Local toolchain. The ComfyUI-MiniMax-Music-Production-Toolkit is a free, MIT-licensed node pack. It offers structured song prompts through a local LLM, an audio enhancement chain, automatic cover art, and reproducible JSON. https://comfyui-wiki.com/en/news/2026-09-04-minimax-music-toolkit (news page, single source; not checked against the repository).

Loudness. Spotify, YouTube and Amazon target -14 LUFS integrated, true peak -1 dBTP. Suno output sits at -8 to -12 LUFS and needs matching. https://www.makingascene.org/ai-loudness-control-for-home-releases-stop-guessing/ (blog only). The notes name iZotope Ozone, LANDR and Matchering reference matching on the same page. The notes give no MiniMax output loudness. Measure it on your own renders first.

Finishing sequence for the album (inference from sections 2.1 and 2.5): normalise every song to one loudness target, set gaps by song pair (see 2.1), then run a final listen in album order.

Disclosure and metadata. The notes found no source on disclosure, metadata or cover-art practice. See Gaps.

### 2.6 MiniMax Music 3 prompting rules

Official sources (the model card, the ComfyUI docs, the MiniMax skill repository and the demo page) carry most weight here.

Caption format:
- Use three sections in order: Global Metadata (genre, tempo range, emotional arc, sonic profile), Vocal Details (lead set-up, timbre, effects, or "instrumental"), Arrangement (section-by-section timeline with instrument lifecycles and transitions). Target 250-450 English words. https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md
- The demo page shows a longer eight-part pattern across 11 genres and 26 tracks: genre, Global Metadata (BPM, key, scale, style), Global Emotional Progression, Application Scenarios and Imagery, Sonics and Production Profile, Vocal Details (gender or timbre, style, harmony, effects), Arrangement (instrument lifecycle, groove, embellishments). https://minimax-ai.github.io/music3-demo/
- Demo caption openings use plain statements, for example "bpm is 88. key is Bb, and scale is major. Pop Rock / Soul." https://minimax-ai.github.io/music3-demo/
- Put BPM and key in Global Metadata. "The more specific, the closer the result." https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3
- Do not invent a precise BPM, key or vocal gender without cause. Keep hard exclusions and instrumental requests. Priority order: explicit user requirement, section tags, caption implications, references, defaults. https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

Lyrics:
- Supported tags: `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`. Put each tag on its own line. https://huggingface.co/MiniMaxAI/MiniMax-Music3
- "The tags are executable; the lyric text itself conveys mood, not structure." https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3
- Lyrics can be up to about 5,000 tokens. https://huggingface.co/MiniMaxAI/MiniMax-Music3
- The caption-rewriter skill uses lyric text only to infer broad emotional context in the caption it writes. This rule governs the rewriter skill. It does not say the model ignores your lyrics. https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md

Limits and controls:
- Maximum is 9,000 acoustic frames at 25 fps, so songs up to five minutes. The ComfyUI default `max_duration` is 120 s. Raise it for full songs. https://huggingface.co/MiniMaxAI/MiniMax-Music3 and https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3
- `cfg_scale`, `top_k` and a seed are available. https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3
- The output is a full mix. You cannot request isolated stems. Describe instruments in the caption. https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Language support beyond English examples is not stated. Same model card.

Album-level use (inference from the sources above): write one shared style block (palette, vocal description, production profile) and paste it into every song's caption. Vary only tempo, key, emotional progression and arrangement per song. Keep the same wording for the vocal description in every caption, because no voice reference exists. The notes do not test whether this keeps the voice stable.

The official skill uses about 1,000 static templates across 18 style families, a genre router, and up to three reference cards (Foundation, Modifier, Arrangement). https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/README.md. The notes could not open the template files, because the GitHub API listed the folders as empty. The notes did not confirm the count.

Architecture claim (single source, blog): an 8B global LLM for long-range structure plus a 0.6B local LLM for acoustic detail, using flow matching and Flow-VAE. https://wavespeed.ai/blog/ai-workflows/minimax-music-3-comfyui/

## 3. Conflicts

| Topic | Claim A | Claim B | Which to trust |
|---|---|---|---|
| Reference audio | "MiniMax Music 3 accommodates voice reference tracks" that set style and vocal tone: https://wavespeed.ai/blog/ai-workflows/minimax-music-3-comfyui/ | Open weights take no reference audio or voice reference (task brief; the model card and ComfyUI docs list caption, lyrics, seed, `cfg_scale`, `top_k` and `max_duration` only): https://huggingface.co/MiniMaxAI/MiniMax-Music3 and https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3 | Claim B. The model card and docs are official. The wavespeed page is a service-selling blog and describes the hosted API. The same blog line also led a note to say the only voice workaround is "reference tracks and seed control". That workaround is not available locally. |
| Tempo arc | Tempo is "lower at start, peaks mid-album, lower at end": note 1, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ | "high energy at beginning, descends overall": note 3, same URL | Both cite one paper. The inverted U with valence, arousal and loudness reversed is the consistent reading. The note 3 wording blends tempo with energy. Use the inverted U for tempo only. |
| Pop album track count | 10-15 tracks, 35-45 min: https://blog.groover.co/en/tips/how-long-is-an-album-en/ | 20+ tracks as "track creep": https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ | Both are blogs. The Chartmetric data (https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/) supports rising hip-hop track counts only. Use 10-15 for a coherent album and treat 20+ as a streaming tactic. |
| Pop song length | Mean 3.36 min in 2022: https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ | Hot 100 median 3:07 in 2021, about 3:00 in 2024: https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ | Different measures (mean of a catalogue against median of the Hot 100). Not a true conflict. Target 3:00-3:30. |
| Funk tempo | 110-130 BPM: https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/07%3A_Popular_Music | 90-110 BPM: music-generator resources named in the notes | Prefer the open textbook. The other is a blog. |
| Lo-fi tempo | 60-90 BPM | 85-110 BPM | Both are blogs. Overlap at 85-90. |
| EP size | 3-7 tracks: https://www.usemogul.com/post/what-is-an-ep-in-music-a-comprehensive-guide | Spotify 4-6; Grammy 3-5 (see section 2.2) | Platform and award definitions outrank a service blog, but they differ from each other. Pick the target. |

## 4. Gaps

Open questions the notes do not answer:
- Disclosure of AI music: no source on platform rules, label rules or good practice. Official Suno and Udio documentation on it was not found either.
- Metadata for AI albums (ISRC, credits, tags, embedded tags) and cover-art practice: none found beyond the toolkit's "automatic cover art" claim.
- Gap and fade length between tracks for streaming files: only CD figures were found. Katz's advice is not available in the notes.
- Voice and style consistency across songs in a model without voice input: no tested method. Fixed vocal descriptions and seeds are untested.
- Whether MiniMax Music 3 shows vocal drift, genre drift or lyric loss: the evidence covers Suno and Udio only.
- MiniMax output loudness and true peak: not measured in the notes.
- MiniMax language support, licence of the repository (LICENSE returned HTTP 404), contents of the rewriter template and reference files, and community tips from GitHub issues or Hugging Face discussions.
- Genre album norms (track count, runtime, song length) for rock, indie, metal, punk, folk, country, jazz, ambient, electronic, soundtrack and K-pop full albums.
- Per-genre lyric craft: rhyme density, themes, clichés, point of view, syllables per line. Missing for reggae, K-pop, lo-fi, bossa nova, metal, punk, folk and indie.
- K-pop song structure, language mixing and BPM; R&B and soul lyric norms; reggae in full.
- Which genres run continuously and which use gaps.
- Counts of interludes, skits and intros per album by genre, and their function from producer or artist sources.
- Skip rate by track position.
- EP versus LP versus double-album suitability.
- Specific A&R quotes on track 2 and single placement.
- Systematic study of mood albums (breakup, late-night, road-trip) and a feel vocabulary built for prompts.
- Details of the Toiviainen findings on interludes. The full text was not read.
- Rating or comparison tools for many generations, and the DAW stitching practice.

Blocked or failed URLs:
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ full PDF: too many redirects. The notes used summaries, so check quoted details against the paper.
- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/LICENSE: HTTP 404.
- GitHub API listing for skills/music-caption-rewriter showed the agents, references and templates folders as empty.

Weak sourcing in the notes, to treat with care: the Dark Side of the Moon description has no URL ("implied from search results"). The georgetownindy.com citations name only a site, and the notes use words such as "or related corpus analysis". The R&B album norm and several genre rows come from music-generator sites that the notes say may echo model training data.

## 5. Sources

Academic and data studies:
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12225790/ - "An album is a story: Feature arcs in sequences of tracks" (Toiviainen et al., 2024)
- https://arxiv.org/pdf/2609.15675 - "Sectional Structure and Emotional Dynamics in Chinese Pop Songs: An Empirical Analysis of Valence-Arousal Trajectories across 100 Songs" (2026)
- https://etheses.durham.ac.uk/id/eprint/15594/ - Durham thesis, Analysing the Structure of Progressive Rock 1973 and Beyond
- https://arxiv.org/pdf/2507.01022 - Workflow-Based Evaluation of Music Generation Systems (2025)
- https://drum.lib.umd.edu/bitstream/handle/1903/17444/Essential%20Indie.pdf - "Essential Indie" (University of Maryland library)
- https://hmc.chartmetric.com/taylor-swift-eras-tour-shorter-songs-bigger-albums/ - Chartmetric, shorter songs and bigger albums
- https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/07%3A_Popular_Music - Open Music Theory, Popular Music

Official documentation and standards:
- https://huggingface.co/MiniMaxAI/MiniMax-Music3 - MiniMax Music 3 model card
- https://docs.comfy.org/tutorials/audio/minimax/minimax-music-3 - ComfyUI docs, MiniMax Music 3
- https://blog.comfy.org/p/minimax-music-3-state-of-the-art - ComfyUI blog, MiniMax Music 3
- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/SKILL.md - music-caption-rewriter skill
- https://raw.githubusercontent.com/MiniMax-AI/MiniMax-Music3/main/skills/music-caption-rewriter/README.md - music-caption-rewriter README
- https://minimax-ai.github.io/music3-demo/ - MiniMax Music 3 demo page
- https://support.cdbaby.com/hc/en-us/articles/360008275672 - CD Baby, single, EP and album
- https://help.awal.com/hc/en-us/articles/7882058990867 - AWAL, single, EP or album
- https://grammy.com/news/whats-difference-grammy-album-vs-record-year-explained - Grammy.com, album versus record of the year
- https://jamaica-gleaner.com/article/entertainment/20191121/koffee-cops-grammy-nomination-ep-academy-defines-5-track-rapture - Jamaica Gleaner, Grammy EP definition
- https://support.discmakers.com/hc/en-us/articles/209223248 - Disc Makers, CD pre-gap and mastering
- https://online.berklee.edu/courses/lyric-writing-writing-lyrics-to-music - Berklee Online, Lyric Writing
- https://online.berklee.edu/courses/songwriting-writing-hit-songs - Berklee Online, Writing Hit Songs
- https://www.soundonsound.com/node/4916079 - Sound on Sound reference to Bob Katz, Mastering Audio

Blogs, trade press, service and community sites:
- https://djbooth.net/features/2023-02-13-album-sequencing-in-streaming-era/ - DJBooth, album sequencing in the streaming era
- https://www.nicklandis.com/blog/sequence-story - Nick Landis, Sequence Story
- https://www.hypebot.com/what-spotify-song-skip-rates-tell-us-about-our-attention-span/ - HypeBot, Spotify skip rates
- https://csr.hdsupply.com/best-pause-time-between-tracks-on-a-cd/ - Best pause time between tracks on a CD
- https://newindustryfocus.com/tags/occ-chart-eligibility - OCC chart eligibility
- https://mail.45worlds.com/topic/102293 - 45worlds forum, Official Charts Company definitions
- https://blog.groover.co/en/tips/how-long-is-an-album-en/ - Groover, how long is an album
- https://popmatters.com/how-to-begin-end-album - PopMatters, how to begin and end an album
- https://www.complex.com/music/a/gabriel-alvarez/the-50-greatest-hip-hop-skits - Complex, 50 greatest hip-hop skits
- https://www.usemogul.com/post/what-is-an-ep-in-music-a-comprehensive-guide - Use Mogul, what is an EP
- https://seoulbeats.com/?p=249873 and https://seoulbeats.com/?p=73595 - Seoul Beats, K-pop mini-albums
- https://nckpophive.substack.com/p/a-guide-to-k-pop-albums - NC K-Pop Hive, guide to K-pop albums
- https://weraveyou.com/2026/08/new-research-shows-real-reason-songs-are-getting-shorter/ - WeRaveYou, why songs are getting shorter (2026)
- https://faroutmagazine.co.uk/what-makes-a-good-concept-album/ - Far Out, what makes a good concept album
- https://georgetownindy.com - critical reception analysis (site only, as cited in the notes)
- https://emastered.com/blog/rap-song-structure - emastered, rap song structure
- https://www.dummies.com/article/academics-the-arts/music/music-theory/music-theory-popular-genres-and-forms-265008/ - Dummies, popular genres and forms
- https://a-lyric.com/ - summary of Pat Pattison, Writing Better Lyrics
- https://wisseloord.org/?p=33947 - Wisseloord, stronger hooks and choruses
- https://fastrhymes.com/blog/how-to-write-a-chorus-that-sticks-tips-for-crafting-memorable-hooks - Fast Rhymes, chorus that sticks
- https://songtown.com/on-songwriting/songwriters-verses-are-the-new-chorus/ - Songtown, verses are the new chorus
- https://songtown.com/on-songwriting/songwriting-hacks-verses-need-hooks/ - Songtown, verses need hooks
- https://jackrighteous.com/en-gb/blogs/guides-using-suno-ai-music-creation/suno-v5-5-voices-custom-models-my-taste-beginner-guide - Suno v5.5 Voices, Custom Models, My Taste guide
- https://jackrighteous.com/de/blogs/ai-creator-tools/udio-edit-replace-section-lyrics-workflow - Udio edit, replace section, lyrics workflow
- https://apipass.dev/blogs/suno-v5-common-issues-and-solutions - Suno v5 common issues and solutions
- https://wavespeed.ai/blog/ai-workflows/minimax-music-3-comfyui/ - WaveSpeed, MiniMax Music 3 in ComfyUI (service-selling; hosted-API claims)
- https://comfyui-wiki.com/en/news/2026-09-04-minimax-music-toolkit - ComfyUI Wiki, MiniMax Music Production Toolkit
- https://www.makingascene.org/ai-loudness-control-for-home-releases-stop-guessing/ - Making a Scene, AI loudness control
- https://en.wikipedia.org/wiki/Alternative_country - Wikipedia, Alternative country
