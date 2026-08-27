// 16th-note lookahead step clock. Mirrors web/audio.js `_jazzTick`: a 25 ms setInterval
// polls and schedules every step whose time falls inside a ~120 ms lookahead window,
// so note timing is sample-accurate (set on AudioParams) while the JS timer stays loose.

export const TICK_MS = 25;
export const LOOKAHEAD = 0.12;

export class StepScheduler {
  constructor(ctx, { steps = 16, bpm = 128, onStep = null } = {}) {
    this.ctx = ctx;
    this.steps = steps;
    this.bpm = bpm;
    this.onStep = onStep;
    this._timer = null;
    this._next = 0;
    this._step = 0;
    this._bar = 0;
  }

  // seconds per 16th step: a beat (quarter) = 4 sixteenths.
  get sps() {
    return 60 / this.bpm / 4;
  }

  get running() { return !!this._timer; }

  start() {
    if (this._timer) return;
    this._next = this.ctx.currentTime + 0.1;
    this._timer = setInterval(() => this._tick(), TICK_MS);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  setBpm(b) {
    this.bpm = b;
  }

  // swing: delay odd 16ths by up to `swing * sps * 0.5`.
  _stepTime(base, step, sps, swing) {
    return step % 2 === 1 ? base + swing * sps * 0.5 : base;
  }

  _tick() {
    const swing = this._swing || 0;
    while (this._next < this.ctx.currentTime + LOOKAHEAD) {
      const sps = this.sps;
      const t = this._stepTime(this._next, this._step, sps, swing);
      // A per-step fault must NOT stop the clock — smooth output is the priority. Log
      // once (guarded) and skip the step; the advance below still runs so the lookahead
      // never gaps or wedges. (The engine also wraps onStep in its own _safeStep.)
      try {
        if (this.onStep) this.onStep(t, this._step, this._bar, sps);
      } catch (e) {
        if (!this._faulted) { console.error("[scheduler] step error (continuing):", e); this._faulted = true; }
      }
      this._next += sps;
      this._step = (this._step + 1) % this.steps;
      if (this._step === 0) this._bar++;
    }
  }

  setSwing(s) {
    this._swing = s;
  }
}
