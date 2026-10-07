# Album craft: sequencing, arcs and feel

How to order songs and shape an album. Each rule carries its source and the weight of that source. "Blog" marks a rule from a trade or personal blog, not from a study.

## Measured sequencing patterns

Two studies by the same group give the only measured evidence.

**Neto, Hartmann, Luck, Toiviainen (2024).** "The algorithmic nature of song-sequencing: statistical regularities in music albums", *Journal of New Music Research*. Spotify audio features for 51,010 published albums:

- Songs with high valence, energy and loudness are more likely at the start of an album.
- Consecutive tracks tend to alternate between rises and falls in valence and energy.
- Valence, energy, loudness and tempo show a falling linear trend across album positions.
- The patterns hold across genres to some extent.

**Neto, Hartmann, Luck, Toiviainen (2025).** "An album is a story: Feature arcs in sequences of tracks", *PLOS One*, doi:10.1371/journal.pone.0316963. 130 music professionals ordered three sets of five instrumental jazz and classical tracks:

- Agreement was strongest for track 1. Of the five positions, the professionals agreed least on track 2.
- Tempo follows an inverted U: the first and last tracks are the slowest, and the fastest songs sit in the middle.
- Valence and loudness follow a U: track 1 is clearly the highest, and the last track is second highest, near the average. The middle tracks are the lowest.
- Arousal is highest in track 1 and below average in the last track.
- The effects are real but small: a quadratic model explains about 2% of the variance in feature values.

Survey answers from the same 130 professionals:

| Statement | Answer |
|---|---|
| Track order is important | 84% agree |
| No 3 or more very similar songs in a row | 63% agree |
| An album should start with high-energy tracks | Most agree |
| An album should end with the most striking, energetic song | Most disagree |
| Consecutive songs should be as different as possible | Most disagree |
| No 3 or more songs in a row in the same key | Opinions split. Key similarity between neighbours was random in their orderings. |

The 2025 paper also quotes anecdotal rules from musicians: do not put two slow songs next to each other, and a slow song directly after a fast one can seem to drag (David Brewis).

## Rules for a juke-box album

The rules below follow from the studies. Use them as defaults, not laws.

1. **Track 1 is the decision people agree on most.** Make it high in energy and valence, and use it to show the album's palette.
2. **Keep the opener and closer slower than the middle.** Put the fastest songs in the middle third.
3. **End on resolution, not on a peak.** The last track is calm (slow, arousal below average) but brighter and fuller than the middle tracks: a resolving song, not the most intense one.
4. **Alternate.** Let energy and valence rise and fall from track to track instead of climbing in one line.
5. **Break up runs.** Do not place three very similar songs in a row: same tempo band, same groove, same mood.
6. **Do not force contrast.** Neighbours can share a key or a palette. Maximum difference is not the goal.

## Arc shapes

Name the arc in the album brief, then give each track an energy level (1–5) that follows it.

| Arc | Energy by position | Fits |
|---|---|---|
| Studied default | Strong opener, faster middle with rises and falls, warm slower closer | Most albums |
| Front-loaded descent | High early, falling trend, quiet end | Matches the 51,010-album trend; late-night or comedown albums |
| Slow burn | Low start, steady build, peak in the last third, short release | Concept albums, builds toward a climax |
| Bookends | Opener and closer share a motif, key or lyric; middle explores | Story albums, song cycles |
| Flat field | One tempo band and palette throughout, small changes | Ambient, lo-fi, focus music. Breaks rules 4 and 5 on purpose. |

Only the first two rows rest on measured data. The others are common descriptions, not studied patterns.

## Concept and mood albums

- **Concept albums** work like a symphony in movements: one narrative, large-scale structure, callbacks, and cause-and-effect links between tracks. Source: Durham University thesis on progressive rock structure (https://etheses.durham.ac.uk/id/eprint/15594/). Tools that MiniMax can carry: a recurring lyric line, a named character, a reprise track that reuses an earlier song's chorus words, and a palette that changes at the act breaks.
- **Mood albums** without a story hold together through a stable palette: the same drum textures, the same lead instruments, the same vocal treatment, and recurring images in the lyrics. This rests on criticism only, with no study.

## Interludes, intros, outros and skits

- In hip-hop, skits were standard from the late 1980s and work as continuity devices and palette cleansers. Their use is declining. Source: PopMatters, "How to begin and end an album" (blog).
- Too many interludes is a common sequencing error. Source: DJBooth, "Album sequencing in the streaming era", 2023 (blog).
- MiniMax Music 3 always sings (see `minimax-prompting.md`), so an interlude needs a short lyric: a hummed line, a spoken phrase, or one repeated word. Keep interludes at 30–90 s.

## Words for feel

Use these words in the album brief and in each Global Emotional Progression: cohesion, flow, palette, arc, peak, comedown, breathing (alternation of high and low intensity). Pair each word with a measurable cue that the caption can carry: a tempo band, a loudness level, a major or minor mode, a sparse or full arrangement.

## Skip behaviour

An analysis of Spotify skip data by Paul Lamere (reported by HypeBot, a trade blog): 24% of plays skip in the first 5 s, 29% by 10 s, 35% by 30 s, and 49% before the end of the song. Desktop skip rate is 40%, mobile 51%. For a streamed album, the first seconds of each track matter most. For an album heard in order, rule 1 matters more.
