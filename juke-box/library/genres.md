# Genres: song norms and lyric craft

Per-genre tempo, form and delivery, for writing captions and lyrics. Two sources sit side by side:

- **Published norms** below, from teaching texts and blogs, each with its weight.
- **Model norms** in `genre-stats.md`: tempo, key, mode and singer counts over the 1,000 captions of MiniMax's `music-caption-rewriter` skill. These show how the model's own training captions describe each style family. When the two disagree, the model norms are closer to what MiniMax Music 3 expects.

## Published norms

| Genre | Tempo (BPM) | Form and delivery | Source and weight |
|---|---|---|---|
| Boom bap | 85–95 | Intro 4 bars, verse 16, chorus 8, verse 16, chorus 8, outro | emastered.com (blog) |
| Trap | 130–150 | Intro 8, verse 16, chorus 8, verse 16, chorus 8, outro | emastered.com (blog) |
| Drill | 140–145 | Intro 8, chorus 8, verse 16, chorus 8, verse 16, chorus 8, outro | emastered.com (blog) |
| Rap verse | — | 16 bars standard; also 8, 24 or 32 | emastered.com (blog) |
| Blues | 70–120, shuffle | 12-bar AAB most common; also 8, 16, 24 bars | Dummies reference |
| R&B and soul | 70–100 | Intro, verse, pre-chorus, chorus, verse, pre-chorus, chorus, bridge, chorus, outro; long outros as a vocal showcase | Open Music Theory (open textbook) |
| Country | 100–130 | Narrative verses, simple choruses, steady pulse | Open Music Theory |
| Folk | — | Narrative verses, simple choruses | Open Music Theory |
| Funk | 110–130 | One groove for minutes, syncopation, instrumental interplay | Open Music Theory |
| Pop and rock | — | Verse-chorus with a bridge, built on repetition | Open Music Theory |
| Metal | 120–180 | Intense, double-kick drums | Dummies reference |
| Punk | 160–200 | Fast, few breaks | Dummies reference |
| Pop, streaming era | — | First chorus by 30 s, often 15 s; intro 0–5 s; bridge rare | WeRaveYou (blog, single source) |
| Soul | 60–130 | Ad-libs that rise to a belted last chorus, call and response, Hammond organ | blogs only |
| Reggaeton | 90–105 pop, 115–130 dembow, 130–160 trap Latino | Chorus (coro) over the dembow rhythm; rhymes across Spanish and English | blogs only |
| Lo-fi, chillhop | 60–90 (one source says 85–110) | Intro, main loop with a small build, optional breakdown; 3–5 layers | blogs only, sources disagree |
| Bossa nova | — | Swaying samba-based groove; intimate, conversational vocal | single source |
| Vocal jazz | — | 32-bar AABA; intro, chorus, second chorus, solos, last chorus, ending | single source |

Open Music Theory: https://human.libretexts.org/Bookshelves/Music/Music_Theory/Open_Music_Theory_2e_(Gotham_et_al.)/07%3A_Popular_Music

The model norms in `genre-stats.md` show some tempos at double or half these values, for example a 90th percentile of 176 BPM in country. Those are probably half-time and double-time readings of the same feel. Keep the caption tempo inside the published band unless the song needs the other reading.

## Section length in seconds

A section lasts `bars × beats per bar × 60 / BPM` seconds. At 90 BPM in 4/4, 4 bars take 10.7 s and a 16-bar verse takes 43 s. Use this to check that the lyrics fit the `seconds` of a track before rendering.

## Lyric craft

- Show a feeling through action, object or setting; do not name it. Vary rhyme and use near rhymes. (Pat Pattison, *Writing Better Lyrics*, through a summary.)
- Put stressed syllables on strong beats, and place rhymes where the melody lands. (Berklee Online, Lyric Writing course page.)
- The chorus states the main message in a few lines and differs from the verses in melody, words and intensity. Keep the hook simple and repeat it. (blogs)
- Modern verses carry their own small hooks: a repeated rhythm, internal rhyme, a repeated phrase. (Songtown, blog)
- A bridge lifts intensity beyond the verses. Where the title sits changes the chorus's impact. (Berklee Online, Writing Hit Songs course page)

## Lyrics for MiniMax Music 3

- Put each section tag on its own line: `[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`.
- The tags set the structure; the words set the mood. (ComfyUI docs)
- ComfyUI lowercases the tags and turns ` ^ ` into a line break.
- Caption and lyrics together have a limit of 5,000 tokens.
- The open weights have no reliable instrumental mode. Users report vocals in songs meant to be instrumental (see `minimax-prompting.md`).
