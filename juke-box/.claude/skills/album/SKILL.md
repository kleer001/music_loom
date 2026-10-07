---
name: album
description: Make a full album, EP or song set with MiniMax Music 3 from one prompt, over a few back-and-forth sessions — brief, tracklist, captions and lyrics, renders, picks, master. Use when the user asks for an album, an EP or a set of songs in juke-box, or wants to continue an album under juke-box/albums/.
---

# Album

Turn one prompt into a finished album in juke-box. The user decides; you draft, render and report. Paths are relative to the juke-box directory.

## Before you start

- Read `library/README.md`, then the pages it names for each step.
- Check that `config.toml` exists and that ComfyUI answers: `curl -s <comfyui_url>/queue`. If the queue is busy, say so and wait.
- Check that the caption skill is installed: `.claude/skills/music-caption-rewriter/SKILL.md`. If it is missing, run `scripts/fetch_caption_skill.sh`.

## Session 1 — brief and tracklist

1. Draft the brief from the user's prompt and put it in front of them as a short list:
   - title, artist name, format and size (`library/album-formats.md`)
   - genre family and palette: lead instruments, drums or none, production character
   - arc (`library/album-craft.md`), in one line
   - the voice: one Vocal Details block in the template form `Vocal Gender & Timbre: Singer A (Female). …` (`library/minimax-prompting.md`)
2. After the user answers, draft the tracklist as a table: number, title, role (opener, single, interlude, closer), energy 1–5, tempo, key or mode, seconds, one-line idea.
   - Check it against the rules in `library/album-craft.md`: a strong track 1; opener and closer slower than the middle; fastest songs in the middle third; energy that rises and falls; no three similar songs in a row; a resolving closer.
   - Take tempo bands from `library/genres.md` and `library/genre-stats.md`.
   - Keep each `seconds` at or below 360. Plan interludes at 30–90 s with a short lyric, because the model always sings.
3. When the user agrees, create `albums/<slug>/album.toml` in the format of `albums/example/album.toml`. Put the voice block in `voice`.

## Session 2 — captions and lyrics

For each track, write `tracks/<NN>-<slug>/caption.md` and `lyrics.txt`:

- Draft the caption with the `music-caption-rewriter` skill from the track's one-line idea plus the album palette. Then replace the whole Vocal Details body with one line, `{{voice}}`, so every track shares the album's voice. Add a track-specific vocal note after it only when the track needs one, for example a harmony that only this track has.
- Keep the album palette words identical across captions; change tempo, key, emotional progression and arrangement per track.
- Write lyrics with one tag per line (`library/genres.md`). Check the fit: a section lasts `bars × 4 × 60 / BPM` seconds in 4/4.
- Show the user the lyrics and a two-line summary of each caption. Revise until they agree. Do not render before they agree: each 3-minute take costs about 4.5 minutes of GPU time on an RTX 3090.

## Session 3 — render and pick

1. Tell the user the estimate: tracks × takes × about 1.5 × `seconds`.
2. Run `python3 scripts/render_album.py albums/<slug>` in the background. It adds takes and never overwrites one.
3. When it finishes, run `python3 scripts/album_page.py albums/<slug>`, serve the juke-box directory's parent over a local http server (reuse a running one), and open `albums/<slug>/` in Firefox.
4. The user presses "keep" on takes and pastes the "Copy picks" text. Write `pick = <k>` into each track in `album.toml`.
5. For a track with no good take, either render more takes (`--tracks N --takes 2`) or change the caption or lyrics first. Keep `seconds` unchanged while trying new seeds: with a new `seconds`, the same seed gives a different song.
6. Rebuild the page after each render pass.

## Session 4 — master

1. Ask whether any track should sit quieter in the album (`gain_db`, for example −2 for an interlude).
2. Run `python3 scripts/master_album.py albums/<slug>`.
3. Open `master/album.flac` in Firefox and report `master/notes.txt`: loudness and true peak per track, and the loudnorm mode.
4. Remind the user of the disclosure duty in `library/finishing.md` before anything is published.

## Rules

- One heavy GPU job at a time. Do not start a render while another ComfyUI job runs.
- Never overwrite or delete a take.
- Keep every decision in the album's files, not only in the chat, so a later session can continue from `album.toml`.
