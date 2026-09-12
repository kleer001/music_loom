fresh

## Summary

Two parked threads.

**Current focus — sound_feel.** Set a global STE100 rule in `~/.claude/CLAUDE.md`.
Verified the `research/sound_feel/` digest against primary sources (correcting
several figures). Budded `bench/sound_feel` into its own repo. Built a coprime
per-band synthesis engine, judged by ear that it smears delicate field audio, and
reverted to the real-audio instrument. Then built a **spectral-paint tool** (draw
circles on the spectrogram, hear what's inside) and saved it in the daughter repo.
The user will look at the tool later — **top priority on resume is reopening it in
Firefox**.

**Earlier thread — R5 / cut 0.4.0 (still open, below).** `fx.js` split per effect,
a compressor built, and a measured campaign to make offline renders match a browser
(14 of 24 effects agree). Four convention-changing commits landed with no version
directive; that release still needs cutting. Todos #1–#3, #5 and their context are
preserved unchanged.

## Todos

### Parallel

- [ ] #6 **Reopen the spectral-paint tool in Firefox** — the top priority. Run
      `~/Dropbox/ai/code/sound_feel/tools/open_paint.sh`; it serves the repo on the
      first free port and opens `tools/spectral_paint.html` in Firefox. `fetch()`
      needs the server, so `file://` will not work.

- [ ] #7 **sound_feel — next directions** (discussed, not built). The bank pipeline:
      batch-process a corpus of the user's field recordings deterministically, then an
      agent triages which recordings suit the instrument (stationary + separable) and
      curates a catalog. And the automated separator: REPET + spectral masking to pull
      distinct features as real coprime layers — the scripted version of the paint tool.

- [ ] #1 **Cut 0.4.0.** Four convention-changing commits landed without it:
      the R5 split (`cbd9283`), the compressor (`1c130ca`), the loader fix
      (`6977a58`), the saturation/multiband fix (`a35fcd0`). `CONTRIBUTING.md`
      says every convention change moves as four things — payload, `VERSION`
      bump, `CHANGELOG.md` directive, `template/.music_loom.toml` stamp. Only
      the payloads landed. Needs directives at these tiers:
        - **CONTRACT** — worklets *do* render offline, so the "must degrade to
          native nodes" rule any daughter may have designed around is void.
        - **CONTRACT** — `ladderWorkletReady()` / `pitchWorkletReady()` changed
          signature; they take a context now.
        - **TIGHTEN** — R5 is a file per effect; imports of `dsp/fx.js` break.
        - **TIGHTEN** — saturation sounds slightly different (own oversampling
          filter, not the browser's), and multiband is `comp.js` not
          `DynamicsCompressorNode`.
      `check_updates.py --validate` parses every backticked token on a
      `**Read:**` line as a path and fails on ones that are not files.

- [ ] #2 **Ten effects still render differently than they play.** Measured, in
      dB of error below the effect's own output — positive means the difference
      is bigger than the signal:
        `makePhaser` +15.5 · `makeDubEcho` -0.7 · `makeDelay` -3.0 ·
        `makeFilterDelay` -3.4 · `makeFlanger` -3.8 · `makeMasterBus` -5.4 ·
        `makeChannelEq` -8.6 · `makeBitcrush` -40.2 · `makeReverb` -43.0 ·
        `makeTape` -58.1
      Causes: five of them are a `DelayNode` inside a feedback loop (delay,
      dubEcho, filterDelay, flanger, and the wow in tape) — one shared
      feedback-delay worklet would take the cluster, comparable in size to
      `shaper-worklet.js` but with more per-effect plumbing since each has its
      own filtered-feedback topology. Two are a biquad at extreme settings
      (phaser, channelEq). `makeReverb` and `makeBitcrush` were never isolated.

- [ ] #5 **`tmp/` has stale directories** from earlier sessions:
      `ab-all` (keep until #3), plus `fold`, `dry`, `sh`, `review`, `midi`,
      `links.txt`, `linkcheck.out`, `checklinks.sh`. (This session also left
      `tmp/sound_feel_capture/` and `tmp/sound_analysis/` — scratch, disposable.)

### Sequential

- [ ] #3 (needs: #2) **Promote the A/B harness out of `tmp/ab-all/`** into
      `rack/checks/` as a standing runtime-agreement check. It is the evidence
      behind every number in #2 and is currently disposable scratch. How it
      works: a python server serves `dsp/` and takes POSTed raw audio straight
      to disk; a page renders every effect and POSTs a `Float32Array`; node
      renders the same; the two files are compared as bytes. Headless chrome at
      `~/.cache/ms-playwright/chromium-1194/chrome-linux/chrome --headless=new`.
      Poll for the POSTed file — `--dump-dom` does **not** wait for async work,
      and `--virtual-time-budget` does not advance audio rendering.

## Context

**sound_feel (current thread).** Budded from `bench/` into its own repo:
`github.com/kleer001/sound_feel`, local clone `/home/menser/Dropbox/ai/code/sound_feel`.
Mother's `bench/` is empty again (pruned); `research/sound_feel/` stays in the mother.
A myNoise-style ambient shaper from one field recording — a dual-mono 60 s "08:58"
capture, mono-folded, held in `pantry/field/` and the daughter's `assets/source/`.

- **Locked decision: no statistical synthesis of delicate field audio.** A coprime
  per-band FFT resynthesis was built and **reverted** (daughter commit `4f3d36d`) —
  it smears real recordings into colored noise. Synthesis is only allowed to fix a
  specific flaw (the low wind floor). The instrument plays the real wind-cleaned loop
  through ten bandpass faders (audio-taper) + extracted event grains. Published
  artifact: `claude.ai/code/artifact/47e6717e-5f70-4b1d-9659-46f3c50c8bc4`.
- **Measured truth about this recording** (evidence for why): dense events over a
  murmur, **no sustained tones**, **no repetition** (self-similarity mean ≈ 0). A poor
  generator source. Good sources are stationary/simple (rain, stream, fan, crickets) —
  that is the bank's triage criterion.
- **Spectral-paint tool** (last build, daughter commit `42ee5e0`):
  `tools/spectral_paint.html` — in-browser radix-2 FFT builds the spectrogram (regular
  rainbow, log freq); draw ellipses, play Inside/Outside/All via a masked inverse FFT.
  Round-trips exactly. Fetches `assets/source/*.wav` over HTTP. `tools/open_paint.sh`
  serves + opens Firefox. Published artifact:
  `claude.ai/code/artifact/270198df-8a96-4149-8e86-e667dd1c06c4`.
- **STE100** global rule added to `~/.claude/CLAUDE.md`: concise + Simplified Technical
  English for technical replies; creative/voiced prose exempt; STE100-style, not
  dictionary-certified.
- Gotcha seen twice: an inline `<script>` needs its closing `</script>` or the browser
  runs nothing; and `#id{display:grid}` overrides the UA `[hidden]{display:none}`, so a
  page needs its own `[hidden]{display:none!important}` (the artifact wrapper adds one).

---

**R5 / 0.4.0 (earlier thread) — the finding that unlocked it.** `node-web-audio-api`
2.2.0 **does** run an `AudioWorklet` under an `OfflineAudioContext`. Two differences
from a browser: `addModule` wants a filesystem path, not a `URL`; and its loader reaches
for `Promise.withResolvers` (Node 22 or a four-line polyfill). `fx-common.js`
`addWorkletModule()` carries both. Corrected in `CLAUDE.md`, `template/CLAUDE.md`,
`rack/R3-measure/README.md`, `rack/R5-fx/README.md`, `research/web_audio_toolchain.md`.

**Measured cross-runtime divergences, node-web-audio-api 2.2.0 vs Chrome 151** (in
`CLAUDE.md` under "what has tended to break"):
- `WaveShaperNode.oversample`: `"none"` −150 dB, `"2x"` −88, `"4x"` not at all
  (+5.4 dB). Fixed by `shaper-worklet.js`.
- `BiquadFilterNode` by corner: −128 dB at 1 kHz, −69 at 10 Hz, −46 at 5 Hz, −0.1 at
  1.06 Hz. Unfixed; why `phaser`/`channelEq` still diverge.
- `DelayNode` in a feedback cycle: Chrome carries ~a quantum more implicit latency;
  identical coefficients give different time constants. 512 samples shrinks, not closes.
- `OscillatorNode` band-limiting: sine agrees, triangle/saw do not, and which runtime
  reaches higher changes with pitch. **Never use an oscillator as a cross-runtime source**
  — a test-filled buffer is the only clean input.

**R5 decisions — do not relitigate.** A library may hold many similar things (sibling
voicing is not drift; `sat.js` = four voicings of one topology). The R5 split was a
pure move (byte-verified). `comp.js` throws if its worklet won't load (silence beats
wrong); `makeShaper()` falls back to native `"none"` (harsher, never different).
`comp.js` runs the same curve as `master.js glue()` (slope 1.000 below threshold,
0.250 at ratio 4).

**R5 traps.** A bypassed effect (`wet=0,dry=1`) matches trivially — engage each via
`set()`. Run headless, audio back as bytes. `pkill -f` on a pattern in your own command
line kills the shell — `pgrep` then kill the PID. `setsid` background servers.

**The copy skills** are a `copy` plugin: `copy:desk/honest/humanize/plain`; chain is
plain → humanize → honest. Overrides at `.claude/skills/copy/plain/terms.md` and
`.claude/skills/copy/humanize/banned.md`.

## Next Step

#6 — **reopen the spectral-paint tool in Firefox**: run
`~/Dropbox/ai/code/sound_feel/tools/open_paint.sh` (serves the daughter repo on a free
port, opens `tools/spectral_paint.html` in Firefox). Everything from this session is
committed and pushed; the R5 / 0.4.0 thread (#1) is the next real work after that.

/home/menser/Dropbox/ai/code/music_loom
