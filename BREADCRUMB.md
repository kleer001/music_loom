fresh

## Summary

Session went from finishing an old todo list into a deep run on R5. Two threads:

1. **Public copy.** README corrected, run through the four copy skills, and
   given a collapsed fold listing what a new instrument starts with.
2. **R5 made to render as it plays.** `fx.js` split per effect, a compressor
   built, and a measured campaign to make offline renders match a browser.
   14 of 24 effects agree now, up from 9.

The README fold is spliced and live. `BREADCRUMB.md` is tracked now, so this
file travels with the code and is readable from the repo page.

All work is committed and pushed. `main` is level with origin at `699081e`.

## Todos

### Parallel

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

- [ ] #3 (needs: #2) **Promote the A/B harness out of `tmp/ab-all/`** into
      `rack/checks/` as a standing runtime-agreement check. It is the evidence
      behind every number in #2 and is currently disposable scratch. How it
      works: a python server serves `dsp/` and takes POSTed raw audio straight
      to disk; a page renders every effect and POSTs a `Float32Array`; node
      renders the same; the two files are compared as bytes. Headless chrome at
      `~/.cache/ms-playwright/chromium-1194/chrome-linux/chrome --headless=new`.
      Poll for the POSTed file — `--dump-dom` does **not** wait for async work,
      and `--virtual-time-budget` does not advance audio rendering.

- [ ] #5 **`tmp/` has stale directories** from this and earlier sessions:
      `ab-all` (keep until #3), plus `fold`, `dry`, `sh`, `review`, `midi`,
      `links.txt`, `linkcheck.out`, `checklinks.sh`.

## Context

**The finding that unlocked everything.** `node-web-audio-api` 2.2.0 **does**
run an `AudioWorklet` under an `OfflineAudioContext`. The rack said in five
places it could not. Two differences from a browser: `addModule` wants a
filesystem path, not a `URL`; and its loader reaches for
`Promise.withResolvers`, which needs Node 22 or a four-line polyfill.
`fx-common.js` `addWorkletModule()` carries both. This was corrected in
`CLAUDE.md`, `template/CLAUDE.md`, `rack/R3-measure/README.md`,
`rack/R5-fx/README.md` and `research/web_audio_toolchain.md`.

**Measured cross-runtime divergences, node-web-audio-api 2.2.0 vs Chrome 151.**
All recorded in `CLAUDE.md` under "what has tended to break".

- `WaveShaperNode.oversample`: `"none"` agrees to -150 dB, `"2x"` to -88 dB,
  `"4x"` not at all (+5.4 dB — bigger than the signal). Fixed by
  `shaper-worklet.js`.
- `BiquadFilterNode` by corner: -128 dB at 1 kHz, -69 at 10 Hz, -46 at 5 Hz,
  -0.1 at 1.06 Hz. Unfixed; it is why `phaser` and `channelEq` still diverge.
- `DelayNode` in a feedback cycle: Chrome carries about a quantum more implicit
  latency, so identical coefficients give different time constants. Asking for
  512 samples instead of 128 shrinks the error without closing it.
- `OscillatorNode` band-limiting: sine agrees to the digit; triangle and
  sawtooth do not, and **which runtime reaches higher changes with pitch**, so
  it is accuracy of the upper harmonics rather than how many are kept. **Never
  use an oscillator as the source in a cross-runtime test** — a buffer filled
  by the test itself is the only clean input.

**Decisions made this session — do not relitigate.**

- **A library is allowed to have many similar things.** Variation between
  sibling effects (three tone defaults, two ramping styles across the
  saturators) is voicing, not drift. Do not consolidate it. `sat.js` holds four
  waveshapers because they are one topology in four voicings; `bitcrush.js` is
  separate because it is worklet-backed with a fallback, a different contract.
  `chorus`/`flanger` stay separate.
- **The R5 split was a pure move**, verified by rendering all 22 builders
  through the old and new module graphs and comparing bytes. Nothing was
  renamed, unified or tuned.
- **`comp.js` throws if its worklet will not load** rather than passing audio
  through. A compressor silently doing nothing is worse than an absent one.
  `makeShaper()` takes the opposite line and falls back to a native
  `WaveShaperNode` pinned to `"none"` — harsher, never different.
- **`comp.js` runs the same algorithm as `master.js glue()`**, so an instrument
  can compress live and master offline without the two disagreeing about what a
  threshold means. Static curve verified exact: slope 1.000 below threshold,
  0.250 at ratio 4.

**Traps this session actually fell into.**

- **A bypassed effect matches trivially.** Several effects ship `wet=0, dry=1`;
  the first agreement map was wrong until every effect was engaged via `set()`.
- **Do not drive a visible browser.** Everything must run headless, and audio
  must come back as bytes — reading numbers off a page and retyping them is
  transcription-prone and puts windows on the user's desktop.
- **`pkill -f` matching a pattern that appears in your own shell's command line
  kills the shell.** Get the PID with `pgrep` and kill that.
- Background servers started in a plain subshell get killed by unrelated
  cleanup; `setsid` them.

**The copy skills were reorganised** into a `copy` plugin: `copy:desk`,
`copy:honest`, `copy:humanize`, `copy:plain`. The chain is plain → humanize →
honest, with honest last because a rewrite can turn a careful claim into a
confident one. `desk` wraps a role chain and spawns three isolated readers.
Project overrides live at `.claude/skills/copy/plain/terms.md` (11 decisions
recorded) and `.claude/skills/copy/humanize/banned.md` (one exception: `harness`).

**`bench/` is still empty.** No instrument has been built here and nothing has
budded. Everything in R5 is exercised only by `rack/checks/graft-check.mjs`.

## Next Step

#1 — cut 0.4.0. Four commits of convention change are sitting in `main` with no
directive telling a daughter any of it happened, and two of them are
CONTRACT-tier. Nothing else should land before the channel back is honest.

/home/menser/Dropbox/ai/code/music_loom
