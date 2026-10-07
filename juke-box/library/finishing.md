# Finishing an album

Loudness, gaps, tags and disclosure. `scripts/master_album.py` applies the defaults below.

## Loudness

Spotify's loudness page (https://support.spotify.com/us/artists/article/loudness-normalization/):

- Spotify plays tracks at −14 LUFS integrated (ITU-R BS.1770), and turns louder masters down and quieter masters up.
- It lifts a quiet master only as far as its true peak allows.
- Its advice: master at −14 LUFS integrated with the true peak below −1 dBTP. A master louder than −14 LUFS should keep the true peak below −2 dBTP.
- It normalises an entire album with one gain, so the level differences between its tracks stay as mastered. Single tracks are normalised one by one in shuffle and in playlists.

So the juke-box defaults are `lufs = -14.0` and `true_peak = -1.0`. Keep deliberate differences inside the album with a track's `gain_db`: for example −2 for an interlude or a quiet closer.

Raw MiniMax Music 3 output measures about −15 LUFS with a true peak just above or just below 0 dBTP (`minimax-prompting.md`). A linear lift to −14 LUFS would push those peaks over −1 dBTP, so ffmpeg's `loudnorm` switches to its dynamic mode, which adjusts gain over time. `master/notes.txt` records the mode for each track. For a fully linear master, set `lufs` lower (about −16) or limit the peaks first with another tool.

## Gaps

- A CD (Red Book) needs a 2 s pre-gap before track 1. Between tracks there is no standard; 1–2 s between the index point and the audio is one common choice (Disc Makers help).
- For files, the gap is the silence inside each file. `master_album.py` adds none to the track files.
- `master/album.flac` joins the masters with `gap_seconds` of silence (default 2) as a listening preview of the running order.
- Gap length for streamed albums has no source; choose it by ear.

## Tags

`master_album.py` writes these tags into each FLAC: `title`, `artist`, `album`, `track` (as `n/total`) and `comment`. It removes every tag that the source carries, including the `prompt` tag in which ComfyUI stores the whole job with its caption and lyrics. The take's `.json` file keeps that record.

## Disclosure

The MiniMax-Music3 Community Licence, Acceptable Use Policy item 11, forbids publishing generated content "in or to any public environment … without clearly and prominently disclosing that such information and/or content is machine-generated". `master_album.py` writes the disclosure into each file's `comment` tag and into `master/notes.txt`. Also put it where people see it: the release page, the description, the cover text.

No source covers platform rules for AI music, ISRC or credit practice. Check the current terms of the platform before a public release.
