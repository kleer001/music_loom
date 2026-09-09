// Source: cyber_synth/cyber/fx.js
// Mastering EQ and the per-channel band EQ.



// ---- Mastering EQ (per-genre pocket) -----------------------------------------

// 5-band mastering EQ: low-cut → low shelf → low-mid bell → high-mid bell → high shelf.
// `set(eqConfig)` ramps the bands; `on:false` flattens the bells/shelves and opens the
// low-cut for a clean bypass. A handle with .set(), like the rest of the FX.
export function makeEq(ctx) {
  const lowCut = ctx.createBiquadFilter(); lowCut.type = "highpass";
  const lowShelf = ctx.createBiquadFilter(); lowShelf.type = "lowshelf";
  const lowMid = ctx.createBiquadFilter(); lowMid.type = "peaking";
  const highMid = ctx.createBiquadFilter(); highMid.type = "peaking";
  const highShelf = ctx.createBiquadFilter(); highShelf.type = "highshelf";
  lowCut.connect(lowShelf).connect(lowMid).connect(highMid).connect(highShelf);
  const r = (param, v) => param.setTargetAtTime(v, ctx.currentTime, 0.08);
  const shelf = (node, b, on) => { r(node.frequency, b.freq); r(node.gain, on ? b.gain : 0); };
  const bell = (node, b, on) => { r(node.frequency, b.freq); r(node.Q, b.q); r(node.gain, on ? b.gain : 0); };
  return {
    input: lowCut, output: highShelf,
    set(e = {}) {
      const on = e.on !== false;
      r(lowCut.frequency, on ? e.lowCut : 10);
      shelf(lowShelf, e.lowShelf, on);
      bell(lowMid, e.lowMid, on);
      bell(highMid, e.highMid, on);
      shelf(highShelf, e.highShelf, on);
    },
  };
}

// Per-channel parametric EQ for a mixer strip: a 4-pole (two cascaded biquads, 24 dB/oct,
// Butterworth Q-pair → flat passband) HIGH-PASS + N fully-parametric peaking BELLS (addressable
// freq/gain/Q) + a HIGH-SHELF for air. Defaults are transparent (HPF parked at 10 Hz, all gains 0)
// so inserting it changes nothing until the mix — or the FFT balancer — dials a cut in. Subtractive
// EQ in the context of the mix. Web Audio's biquads are the RBJ-cookbook filters.
export function makeChannelEq(ctx, nBands = 3) {
  const hp1 = ctx.createBiquadFilter(); hp1.type = "highpass"; hp1.Q.value = 0.5412; // Butterworth-4
  const hp2 = ctx.createBiquadFilter(); hp2.type = "highpass"; hp2.Q.value = 1.3066; // (the pair sums flat)
  const bells = []; for (let i = 0; i < nBands; i++) { const b = ctx.createBiquadFilter(); b.type = "peaking"; bells.push(b); }
  const hs = ctx.createBiquadFilter(); hs.type = "highshelf";
  let node = hp1.connect(hp2);                    // connect() returns its destination
  for (const b of bells) node = node.connect(b);
  node.connect(hs);
  const r = (param, v) => param.setTargetAtTime(v, ctx.currentTime, 0.08);
  return {
    input: hp1, output: hs, bandCount: nBands,
    set(e = {}) {
      const on = e.on !== false;
      const hpFreq = (on && e.hp && e.hp.on !== false) ? e.hp.freq : 10; // 10 Hz = inaudible no-op
      r(hp1.frequency, hpFreq); r(hp2.frequency, hpFreq);
      const cfg = e.bands || [];
      for (let i = 0; i < bells.length; i++) {
        const b = cfg[i] || { freq: 1000, gain: 0, q: 1 };
        r(bells[i].frequency, b.freq); r(bells[i].Q, b.q ?? 1); r(bells[i].gain, on ? (b.gain || 0) : 0);
      }
      const sh = e.hs || { freq: 8000, gain: 0 };
      r(hs.frequency, sh.freq); r(hs.gain, on ? (sh.gain || 0) : 0);
    },
  };
}
