# Rack checks

Grafts R2, R5 and R6 into the layout an instrument receives, then proves the result resolves, plays, and behaves the way the rung READMEs say it does.

```sh
cd rack/checks && npm install && npm run check
```

The graft is built under `.graft/` and removed afterwards. Checking the copy rather than the rack in place is the point: `R5-fx/dsp/` resolves `../core/`, and `R6-voices/voices/persistent.js` resolves `../core/` and `../dsp/`. Those paths only point anywhere once the units are side by side, so reading the rack where it sits would not exercise them.

## What it covers

**The module graph.** Every module imports, and exports the names the READMEs promise. A rename upstream shows up here rather than in a daughter.

**It plays.** Both voice contracts fire into a mixer, through a dub echo and a plate on sends, into a master bus, with a mute at three-quarter length so the echo tail carries past the drop-out. The render is measured, then passed through the offline master chain.

**Determinism, per contract.** The same graph rendered twice, bytes compared. `persistent.js`, `makePlate` and `makeChorus` come back byte-identical; `fire.js` does not, because of the `Math.random` humanisation its own header describes. The check asserts each *expected* result, so `fire.js` becoming deterministic would fail here too — that is a change worth noticing rather than absorbing.

**The pantry loads.** The manifest parses, loop points come out of a real RIFF chunk, `voiceFor` picks a neighbouring recording within 100 cents, and the 22050 Hz machine loop decodes and resamples to 48000 before it plays.

## Numbers it prints

The measurements are read rather than asserted, apart from "audible" and "under the ceiling". A raw peak above 0 dBFS is expected: the rig has no trim set, and the master chain is what brings it to −1.00 dBFS. The centroid sits high because the check is hat- and stab-heavy; it is a wiring exercise, not a mix.

`node-web-audio-api` is the one dependency, and it is local to this directory so the studio root stays dependency-free.
