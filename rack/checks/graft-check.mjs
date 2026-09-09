// Grafts R2 + R5 + R6 into the layout an instrument gets, then proves the result
// resolves, plays, and reports its determinism. Run from this directory:
//
//   npm install && npm run check
//
// The graft is built under .graft/ so what is checked is the copy an instrument
// would receive, not the rack read in place — the rungs resolve `../core/` and
// `../dsp/`, which only point anywhere once they are side by side.

import { cpSync, rmSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RACK = join(HERE, "..");
const ROOT = join(RACK, "..");
const G = join(HERE, ".graft");

rmSync(G, { recursive: true, force: true });
mkdirSync(G, { recursive: true });
cpSync(join(RACK, "R2-core/core"), join(G, "core"), { recursive: true });
cpSync(join(RACK, "R5-fx/dsp"), join(G, "dsp"), { recursive: true });
cpSync(join(RACK, "R6-voices/voices"), join(G, "voices"), { recursive: true });

const { OfflineAudioContext, AudioBuffer, AudioWorkletNode } = await import("node-web-audio-api");
globalThis.AudioBuffer = AudioBuffer;
// The effects construct AudioWorkletNode as a global, the way a page would.
globalThis.AudioWorkletNode = AudioWorkletNode;
const g = (p) => import(join(G, p));

let failed = 0;
const say = (ok, line) => { if (!ok) failed++; console.log(`${ok ? "ok  " : "FAIL"} ${line}`); };

// ---- 1. every module resolves, with the exports the READMEs promise ----------
console.log("\n# module graph");
const expected = [
  ["core/audio.js", ["decodeAudio", "resample", "toAudioBuffer"]],
  ["core/scales.js", ["MODES", "midiOf", "nameOf", "pitches", "dronePitches"]],
  ["core/math.js", ["round", "mod", "clamp01"]],
  ["dsp/fx-common.js", ["ramp", "dipAndRewire", "makeWorkletLoader"]],
  ["dsp/reverb.js", ["makeReverb"]],
  ["dsp/bitcrush.js", ["makeBitcrush"]],
  ["dsp/chorus.js", ["makeChorus"]],
  ["dsp/modmatrix.js", ["makeModMatrix"]],
  ["dsp/filter.js", ["makeFilter"]],
  ["dsp/sat.js", ["makeDrive", "makeFuzz", "makeAsymSat", "makeFold"]],
  ["dsp/delay.js", ["makeDelay"]],
  ["dsp/pitch.js", ["makePitchShifter", "makeBestPitchShifter"]],
  ["dsp/eq.js", ["makeEq", "makeChannelEq"]],
  ["dsp/multiband.js", ["makeMultiband"]],
  ["dsp/comp.js", ["makeComp", "loadComp"]],
  ["dsp/sidechain.js", ["makeSidechain", "makePump"]],
  ["dsp/phaser.js", ["makePhaser"]],
  ["dsp/flanger.js", ["makeFlanger"]],
  ["dsp/tape.js", ["makeTape"]],
  ["dsp/ringmod.js", ["makeRingmod"]],
  ["dsp/noise.js", ["makeNoiseBed"]],
  ["dsp/echo.js", ["makeDubEcho", "makeFilterDelay"]],
  ["dsp/space.js", ["makeSpring", "makePlate", "makeShimmer"]],
  ["dsp/mixer.js", ["makeDubMixer"]],
  ["dsp/masterbus.js", ["makeMasterBus", "MASTER_DEFAULTS"]],
  ["dsp/lfo.js", ["attachLfo", "rollLfos", "divToHz"]],
  ["dsp/knob.js", ["ride", "randomWalk", "sineLfo"]],
  ["dsp/master.js", ["truePeak", "glue", "limit", "normalize", "masterChain"]],
  ["voices/fire.js", ["kick", "supersaw", "acidLead", "flute", "engineVoice", "SYNTHS", "pickVoice"]],
  ["voices/persistent.js", ["makeVoices", "armVoiceWalks"]],
  ["voices/buffer.js", ["slicer", "granular", "oneShotKit", "loopEnsemble"]],
  ["voices/wavetables.js", ["registerWavetable", "getWavetable"]],
  ["voices/patches.js", ["mergePatch", "loadPatch", "ENGINES"]],
  ["voices/samples.js", ["SampleSet", "StrokeSet", "parseManifest", "readLoopPoints"]],
  ["voices/sampler.js", ["Sampler"]],
];
for (const [path, names] of expected) {
  try {
    const m = await g(path);
    const missing = names.filter((n) => m[n] === undefined);
    say(!missing.length, `${path}${missing.length ? " — missing " + missing.join(", ") : ""}`);
  } catch (e) { say(false, `${path} — ${e.message}`); }
}

// ---- 2. it plays: both voice contracts, through effects, into a master -------
console.log("\n# it plays");
const { makeRng } = await g("core/rng.js");
const { stats, spectrum } = await g("core/metrics.js");
const V = await g("voices/fire.js");
const { makeVoices } = await g("voices/persistent.js");
const { makeDubEcho } = await g("dsp/echo.js");
const { makePlate } = await g("dsp/space.js");
const { makeDubMixer } = await g("dsp/mixer.js");
const { makeMasterBus } = await g("dsp/masterbus.js");
const { makeChorus } = await g("dsp/chorus.js");
const { makeComp, loadComp } = await g("dsp/comp.js");
const { masterChain } = await g("dsp/master.js");

const SR = 48000, SECS = 4, BEAT = 0.48;
const ctx = new OfflineAudioContext(2, SR * SECS, SR);
const rng = makeRng(1);
const mix = makeDubMixer(ctx, { channels: ["drums", "stab"], buses: ["echo", "plate"] });
const master = makeMasterBus(ctx);
mix.output.connect(master.input);
master.output.connect(ctx.destination);
mix.insert("echo", makeDubEcho(ctx, { beat: BEAT, random: rng.next }));   // rng.next, not rng
mix.insert("plate", makePlate(ctx, { decay: 2.4, random: rng.next }));
mix.send("drums", "echo", 0.15);
mix.send("stab", "echo", 0.5);
mix.send("stab", "plate", 0.35);

const voices = makeVoices(ctx, { rng, seconds: SECS, beat: BEAT });        // rng, not rng.next
const drums = mix.channel("drums").input;
const kick = voices.kick(drums), hat = voices.hat(drums);
const chorus = makeChorus(ctx);
chorus.output.connect(mix.channel("stab").input);
for (let i = 0; i < SECS / BEAT; i++) {
  const t = i * BEAT;
  kick.at(t);
  hat.at(t + BEAT / 2);
  if (i % 2) V.stab(ctx, t + BEAT / 2, chorus.input, {}, { freqs: [220, 262, 330] });
  if (i % 4 === 2) V.acidLead(ctx, t, chorus.input, {}, { freq: 110, accent: true });
}
mix.mute("stab", true, SECS * 0.75, 0.02);

const buf = await ctx.startRendering();
const L = buf.getChannelData(0), R = buf.getChannelData(1);
const dbfs = (v) => 20 * Math.log10(Math.max(1e-9, v));
const s = stats({ L, R }), sp = spectrum({ L }, SR), tot = sp.lo + sp.md + sp.hi;
console.log("     raw       peak %s dBFS  rms %s dB  dc %s  width %s dB",
  dbfs(s.peak).toFixed(2), s.rmsDb.toFixed(2), s.dc.toExponential(1), s.widthDb.toFixed(1));
console.log("               centroid %d Hz  lo %d%%  mid %d%%  hi %d%%",
  Math.round(sp.centroid), Math.round(sp.lo / tot * 100), Math.round(sp.md / tot * 100), Math.round(sp.hi / tot * 100));
const mch = [Float32Array.from(L), Float32Array.from(R)];
const rep = masterChain(mch, { sampleRate: SR });   // mutates mch, returns a report
const ms = stats({ L: mch[0], R: mch[1] });
console.log("     mastered  peak %s dBFS  rms %s dB  true peak %s dBFS  crest %s dB",
  dbfs(ms.peak).toFixed(2), ms.rmsDb.toFixed(2), rep.truePeakDb.toFixed(2), rep.after.crest.toFixed(1));
say(dbfs(s.peak) > -60, "the graph is audible");
say(rep.truePeakDb <= -0.99, "the master lands under the ceiling");

// ---- 3. determinism, per contract -------------------------------------------
console.log("\n# determinism (same graph rendered twice, bytes compared)");
async function twice(build) {
  const run = async () => {
    const c = new OfflineAudioContext(2, SR * 2, SR);
    await build(c, makeRng(1));   // comp loads a worklet, so a case may be async
    return Buffer.from((await c.startRendering()).getChannelData(0).buffer.slice(0));
  };
  return (await run()).equals(await run());
}
const cases = [
  ["voices/persistent.js", true, (c, r) => {
    const v = makeVoices(c, { rng: r, seconds: 2, beat: BEAT });
    const k = v.kick(c.destination);
    for (let i = 0; i < 4; i++) k.at(i * BEAT);
  }],
  ["voices/fire.js", false, (c) => {
    for (let i = 0; i < 4; i++) V.kick(c, i * BEAT, c.destination, {});
  }],
  ["dsp/space.js makePlate", true, (c, r) => {
    const p = makePlate(c, { decay: 1.5, random: r.next });
    const o = c.createOscillator(); const gn = c.createGain(); gn.gain.value = 0.2;
    o.connect(gn).connect(p.input); p.output.connect(c.destination); o.start(0); o.stop(0.1);
  }],
  ["dsp/chorus.js makeChorus", true, (c) => {
    const ch = makeChorus(c);
    const o = c.createOscillator(); const gn = c.createGain(); gn.gain.value = 0.2;
    o.connect(gn).connect(ch.input); ch.output.connect(c.destination); o.start(0); o.stop(1.5);
  }],
  // Also proves an AudioWorklet renders under an OfflineAudioContext at all,
  // which node-web-audio-api gained in 2.x.
  ["dsp/comp.js makeComp (worklet, offline)", true, async (c) => {
    await loadComp(c);
    const cp = makeComp(c, { thresholdDb: -24, ratio: 6, attackMs: 5, releaseMs: 120 });
    const o = c.createOscillator(); const gn = c.createGain(); gn.gain.value = 0.6;
    o.connect(gn).connect(cp.input); cp.output.connect(c.destination); o.start(0); o.stop(1.8);
  }],
];
for (const [name, expectStable, build] of cases) {
  const stable = await twice(build);
  say(stable === expectStable, `${name} — ${stable ? "byte-identical" : "differs per render"}` +
    (expectStable ? "" : " (documented: Math.random humanisation)"));
}

// ---- 4. the pantry loads through the shelved readers -------------------------
console.log("\n# pantry");
const P = join(ROOT, "pantry");
const { parseManifest, SampleSet, readLoopPoints } = await g("voices/samples.js");
const { midiOf, nameOf } = await g("core/scales.js");
const { decodeAudio, resample, toAudioBuffer } = await g("core/audio.js");
const man = parseManifest(JSON.parse(readFileSync(join(P, "acoustic/manifest.json"), "utf8")));
const set = new SampleSet(man.loops.files, 0);
console.log("     %d pitched loops (%s..%s), %d percussion pools",
  man.loops.files.length, nameOf(set.pitches[0]), nameOf(set.pitches.at(-1)), Object.keys(man.percussion).length);
const lname = man.loops.files[3];
const lbytes = readFileSync(join(P, "acoustic/loops", lname));
const lp = readLoopPoints(lbytes.buffer.slice(lbytes.byteOffset, lbytes.byteOffset + lbytes.byteLength), lname);
say(lp.loopEndS > lp.loopStartS, `loop points read from ${lname} (${lp.loopStartS.toFixed(3)}s..${lp.loopEndS.toFixed(3)}s)`);
const [file, cents] = set.voiceFor(midiOf("A4"));
say(Math.abs(cents) <= 100, `voiceFor(A4) -> ${file} ${cents >= 0 ? "+" : ""}${cents} cents`);

const mbytes = readFileSync(join(P, "machine/synth_techno_loop.wav"));
const dec = decodeAudio(mbytes.buffer.slice(mbytes.byteOffset, mbytes.byteOffset + mbytes.byteLength));
const up = resample(dec.channels, dec.sampleRate, SR);
say(dec.sampleRate !== SR && up[0].length !== dec.channels[0].length,
  `machine loop decoded at ${dec.sampleRate} Hz and resampled to ${SR} (${dec.channels[0].length} -> ${up[0].length} samples)`);
const pc = new OfflineAudioContext(2, SR * 2, SR);
const pbuf = toAudioBuffer(pc, { sampleRate: SR, channels: up });
const psrc = pc.createBufferSource(); psrc.buffer = pbuf; psrc.connect(pc.destination); psrc.start(0);
const prend = await pc.startRendering();
say(dbfs(stats({ L: prend.getChannelData(0), R: prend.getChannelData(1) }).peak) > -60, "the resampled buffer plays");

rmSync(G, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
