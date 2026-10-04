#!/usr/bin/env python3
"""latent_waves live — four recordings mixed inside a RAVE model while it plays.

    .venv/bin/python live.py serve [--port 8001]
    .venv/bin/python live.py render SCRIPT.json OUT.wav
    .venv/bin/python live.py proof MODEL [--seconds 300]
    .venv/bin/python live.py check MODEL [--seconds 30]

serve plays through pw-cat and serves this directory: live.html is the instrument,
index.html the audition page. render runs the same block loop with no sound card,
from a script of timed control changes:

    {"seconds": 20, "controls": {"model": "ircam_isis", "x": 0, "y": 0},
     "events": [[5.0, {"freeze": true}], [8.0, {"x": 1}]]}

Control names are the keys of DEFAULTS. proof checks the spec sheet's live
predictions offline. check plays into a temporary null sink, so nothing reaches
the speakers, and measures underruns and control delay.
"""

import argparse
import bisect
import collections
import fcntl
import json
import os
import signal
import subprocess
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
import soundfile as sf
import torch

from latent import HERE, MODELS, Model, load_audio, overall_rms_db

PANTRY = HERE.parent.parent / "pantry"

# Samples per decode call. One latent step per call costs 35–144% of real time on
# this CPU, mostly per-call overhead; four steps of a 2048-ratio model (8192
# samples, 0.17–0.19 s) cost 12–45%. Models with a smaller ratio take more steps.
BLOCK_SAMPLES = 8192
TORCH_THREADS = 4

# The pipe to pw-cat. The Linux default of 64 KiB holds 0.34 s of mono float audio,
# all of it between a control change and the speaker; one page is the minimum.
PW_LATENCY = "40ms"
PIPE_BYTES = 4096
WRITE_FRAMES = 512

# A block is decoded when the audio still waiting to be written falls to this:
# the slowest recent decode times the factor, plus the margin.
LEAD_FACTOR = 1.25
LEAD_MARGIN_S = 0.02

DEFAULTS = {
    "playing": False,
    "model": "iil_humpbacks_pondbrain_b2048_r48000_z20",
    "sources": ["machine/loop_compus.flac", "field/field_2026-09-11_0858.wav",
                "acoustic/loops/C4_loop.wav", "machine/synth_machine_loop.wav"],
    "x": 0.5, "y": 0.5,
    "speed": 1.0, "freeze": False,
    "window": 0, "swirl": 0.0, "seed": 1,
    "drift": 0.0, "bend": 1.0, "trim": 0.0,
    "trail": [], "trail_on": False,
}
RANGES = {"x": (0, 1), "y": (0, 1), "speed": (-2, 4), "window": (0, 64), "swirl": (0, 1),
          "seed": (1, 999), "drift": (0, 2), "bend": (0.8, 1.2), "trim": (-12, 12)}
INTS = {"window", "seed"}
FLAGS = {"playing", "freeze", "trail_on"}

PROBE_SINK = "latent_waves_probe"
# The engine writes exact zeros while stopped; any decoded block is far above this.
SILENT_DB = -100


def list_models():
    return sorted(p.stem for p in MODELS.glob("*.ts"))


def list_sources():
    return sorted(str(p.relative_to(PANTRY)) for p in PANTRY.rglob("*")
                  if p.suffix.lower() in (".wav", ".flac") and "tools" not in p.relative_to(PANTRY).parts)


def resolve_model(name):
    names = list_models()
    hits = [n for n in names if n.lower() == name.lower()] or [n for n in names if name.lower() in n.lower()]
    if len(hits) != 1:
        raise SystemExit(f"model {name!r} matches {len(hits)} of: {', '.join(names)}")
    return hits[0]


def bilinear(x, y):
    """Corner weights: A top left, B top right, C bottom left, D bottom right."""
    return np.array([(1 - x) * (1 - y), x * (1 - y), (1 - x) * y, x * y])


def trail_at(trail, times, t):
    """Puck position at time t on a recorded trail of [t, x, y] points, looped."""
    t = t % times[-1] if times[-1] > 0 else 0.0
    i = min(max(bisect.bisect_right(times, t), 1), len(trail) - 1)
    (t0, x0, y0), (t1, x1, y1) = trail[i - 1], trail[i]
    a = min(max((t - t0) / (t1 - t0), 0.0), 1.0) if t1 > t0 else 1.0
    return x0 + a * (x1 - x0), y0 + a * (y1 - y0)


def lerp(a, b, t):
    return a + (b - a) * t


# ---------------------------------------------------------------- voices

class Voice:
    """A model and the four sources encoded through it: what each block decodes from."""

    def __init__(self, model, sources, latents, gains_db, bend_saved=None):
        self.model, self.sources, self.latents, self.gains_db = model, sources, latents, gains_db
        self.steps = max(1, BLOCK_SAMPLES // model.ratio)
        loaded = [z for z in latents if z is not None]
        self.sigma = (np.concatenate(loaded, axis=1).std(axis=1) if loaded
                      else np.zeros(model.latent_dims, np.float32))
        self.bend_param = model.decoder_layers()[0][1]
        # A voice that keeps the playing model must keep its unbent weights too:
        # the live tensor may already be bent.
        self.bend_saved = bend_saved if bend_saved is not None else self.bend_param.detach().clone()


class Library:
    """Encodes sources with a worker copy of the model, never the copy that is
    playing: an encode or a whole-file decode resets the streaming state."""

    def __init__(self):
        self.worker = None
        self.encoded = {}

    def encode(self, model_name, source):
        key = (model_name, source)
        if key not in self.encoded:
            if self.worker is None or self.worker.name != model_name:
                self.worker = Model(model_name)
            m = self.worker
            x = load_audio(PANTRY / source, m.sr)
            z = m.encode(x)
            # Each model renders at its training data's loudness, from −25.5 to
            # +22.1 dB against its input (RESULTS.md). This gain puts the round
            # trip back at the input's level.
            gain_db = overall_rms_db(x) - overall_rms_db(m.decode(z))
            self.encoded[key] = (z, gain_db)
        return self.encoded[key]

    def voice(self, model_name, sources, current=None):
        same = current is not None and current.model.name == model_name
        model = current.model if same else Model(model_name)
        enc = [self.encode(model_name, s) if s else (None, 0.0) for s in sources]
        return Voice(model, list(sources), [e[0] for e in enc], [e[1] for e in enc],
                     current.bend_saved if same else None)


# ---------------------------------------------------------------- the block loop

class Engine:
    """Reads the controls, steps four playheads, mixes their latent frames by the
    puck and decodes one block. serve, render, proof and check all run this."""

    def __init__(self, library, background=True):
        self.lib = library
        self.background = background
        self.models_ok = set(list_models())
        self.sources_ok = set(list_sources())
        self.lock = threading.Lock()
        self.c = json.loads(json.dumps(DEFAULTS))
        self.voice = None
        self.pending = None
        self.builder = None
        self.build_again = False
        self.error = ""
        self.heads = [0.0] * 4      # playhead per slot, in latent frames
        self.anchor = [None] * 4    # last frame of the window, per slot
        self.q = [0.0] * 4          # position inside the window, in steps
        self.window_was = 0
        self.perm_key = self.perm = None
        self.dir_key = self.direction = None
        self.prev = None            # values at the end of the last block, for ramps
        self.puck = (self.c["x"], self.c["y"])
        self.trail_t = 0.0
        self.trail_times = []
        self.bend_now = 1.0
        self.gain_prev = None
        self.loads = collections.deque(maxlen=20)
        self.level_db = None

    # -- controls

    def set(self, partial):
        with self.lock:
            before = (self.c["model"], list(self.c["sources"]))
            for k, v in partial.items():
                if k not in DEFAULTS:
                    continue
                if k in RANGES:
                    lo, hi = RANGES[k]
                    v = min(max(float(v), lo), hi)
                    v = int(round(v)) if k in INTS else v
                elif k in FLAGS:
                    v = bool(v)
                elif k == "model" and v not in self.models_ok:
                    continue
                elif k == "sources":
                    v = [s if s in self.sources_ok else "" for s in list(v)[:4]]
                    v += [""] * (4 - len(v))
                elif k == "trail":
                    v = sorted([float(t), min(max(float(x), 0), 1), min(max(float(y), 0), 1)] for t, x, y in v)
                    self.trail_times = [p[0] for p in v]
                    self.trail_t = 0.0
                if k == "trail_on" and v and not self.c["trail_on"]:
                    self.trail_t = 0.0
                if k == "trail_on" and not v and self.c["trail_on"] and "x" not in partial:
                    # Stopping a trail leaves the puck where the trail had it.
                    self.c["x"], self.c["y"] = self.puck
                self.c[k] = v
            changed = (self.c["model"], self.c["sources"]) != before
            idle = self.voice is None and self.pending is None and self.builder is None
        if changed or idle:
            self.build()

    def build(self):
        """Encode the current model and sources. The new voice goes in at the next block."""
        if not self.background:
            self._build()
            return
        with self.lock:
            if self.builder is not None:
                self.build_again = True
                return
            self.builder = threading.Thread(target=self._build_loop, daemon=True)
            self.builder.start()

    def _build_loop(self):
        while True:
            self._build()
            with self.lock:
                if not self.build_again:
                    self.builder = None
                    return
                self.build_again = False

    def _build(self):
        with self.lock:
            name, sources = self.c["model"], list(self.c["sources"])
            current = self.pending or self.voice
        try:
            v = self.lib.voice(name, sources, current)
        except Exception as e:  # a source that will not decode is reported on the page, not fatal
            with self.lock:
                self.error = f"{type(e).__name__}: {e}"
            return
        with self.lock:
            self.pending, self.error = v, ""

    def _swap(self, new):
        old = self.voice
        if old is None or old.model is not new.model:
            new.model.reset()
            torch.manual_seed(1)    # the decoder's noise synthesizer, for repeatable renders
            self.bend_now = 1.0
            self.gain_prev = None
            if old is not None:
                # Keep the playheads at the same time in seconds; frame rates differ.
                r = (old.model.ratio / old.model.sr) / (new.model.ratio / new.model.sr)
                self.heads = [h * r for h in self.heads]
            self.anchor = [None] * 4
        for i in range(4):
            if old is None or old.sources[i] != new.sources[i]:
                self.heads[i], self.anchor[i] = 0.0, None
            if new.latents[i] is not None:
                self.heads[i] %= new.latents[i].shape[1]
        self.voice = new

    # -- latent playheads

    def _perm(self, w, swirl, seed):
        """Step order inside the window: each step displaced by a seeded normal draw
        of swirl·W/2 steps, then sorted. Swirl 0 keeps the order."""
        key = (w, swirl, seed)
        if key != self.perm_key:
            rng = np.random.default_rng([seed, 2])
            keys = np.arange(w) + rng.normal(0, swirl * w / 2, w)
            self.perm_key, self.perm = key, np.argsort(keys, kind="stable")
        return self.perm

    def _direction(self, seed, dims):
        key = (seed, dims)
        if key != self.dir_key:
            self.dir_key, self.direction = key, np.random.default_rng([seed, 1]).normal(size=dims)
        return self.direction

    def _frames(self, i, w, perm):
        """The two latent frames slot i sits between, and how far between them."""
        n = self.voice.latents[i].shape[1]
        if w:
            if self.anchor[i] is None:
                self.anchor[i] = int(np.floor(self.heads[i])) % n
                self.q[i] = float(w - 1)
            j = int(np.floor(self.q[i])) % w
            base = self.anchor[i] - w + 1
            return (base + perm[j]) % n, (base + perm[(j + 1) % w]) % n, self.q[i] - np.floor(self.q[i])
        j = int(np.floor(self.heads[i]))
        return j % n, (j + 1) % n, self.heads[i] - j

    def _read(self, i, w, perm):
        f0, f1, frac = self._frames(i, w, perm)
        z = self.voice.latents[i]
        return z[:, f0] if frac == 0 else (1 - frac) * z[:, f0] + frac * z[:, f1]

    def _advance(self, i, w, speed):
        if w:
            self.q[i] = (self.q[i] + speed) % w
        else:
            self.heads[i] = (self.heads[i] + speed) % self.voice.latents[i].shape[1]

    def _window_change(self, w, loaded):
        if w == self.window_was:
            return
        for i in loaded:
            if w == 0 and self.anchor[i] is not None:
                # Leave the window at the frame it was playing.
                f0, _, frac = self._frames(i, self.window_was, self.perm)
                self.heads[i], self.anchor[i] = f0 + frac, None
            elif w and self.window_was == 0:
                self.anchor[i] = None
            elif w:
                self.q[i] %= w
        self.window_was = w

    # -- one block

    @torch.no_grad()
    def next_block(self):
        """One block of audio, float32 [channels, samples], or None when stopped or still encoding."""
        t_start = time.perf_counter()
        with self.lock:
            if self.pending is not None:
                self._swap(self.pending)
                self.pending = None
            c = {k: (list(v) if isinstance(v, list) else v) for k, v in self.c.items()}
            trail_t, times = self.trail_t, list(self.trail_times)
        v = self.voice
        if v is None or not c["playing"]:
            return None
        m, n = v.model, v.steps
        dt = m.ratio / m.sr
        loaded = [i for i in range(4) if v.latents[i] is not None]
        if not loaded:
            return None

        speed_to = 0.0 if c["freeze"] else c["speed"]
        prev = self.prev or {"x": c["x"], "y": c["y"], "speed": speed_to, "drift": c["drift"]}
        trail = c["trail"] if c["trail_on"] and len(c["trail"]) >= 2 else None
        w_len = c["window"]
        self._window_change(w_len, loaded)
        perm = self._perm(w_len, c["swirl"], c["seed"]) if w_len else None
        direction = self._direction(c["seed"], m.latent_dims)

        z = np.zeros((m.latent_dims, n), np.float32)
        for k in range(n):
            a = (k + 1) / n
            if trail:
                x, y = trail_at(trail, times, trail_t + k * dt)
            else:
                x, y = lerp(prev["x"], c["x"], a), lerp(prev["y"], c["y"], a)
            speed = lerp(prev["speed"], speed_to, a)
            drift = lerp(prev["drift"], c["drift"], a)
            w = bilinear(x, y)[loaded]
            w = w / w.sum() if w.sum() > 0 else np.full(len(loaded), 1 / len(loaded))
            for wi, i in zip(w, loaded):
                if wi:
                    z[:, k] += wi * self._read(i, w_len, perm)
                self._advance(i, w_len, speed)
            if drift:
                z[:, k] += drift * v.sigma * direction

        if c["bend"] != self.bend_now:
            v.bend_param.copy_(v.bend_saved * c["bend"])
            self.bend_now = c["bend"]
        y_out = m.m.decode(torch.from_numpy(z)[None])[0].numpy()

        g = 10 ** ((float(np.dot(w, [v.gains_db[i] for i in loaded])) + c["trim"]) / 20)
        g0 = g if self.gain_prev is None else self.gain_prev
        ramp = np.linspace(g0, g, y_out.shape[1] + 1)[1:]
        out = np.clip(y_out * ramp, -1, 1).astype(np.float32)

        self.gain_prev = g
        self.prev = {"x": x, "y": y, "speed": speed, "drift": drift}
        rms = np.sqrt(np.mean(out ** 2))
        with self.lock:
            self.puck = (x, y)
            if trail:
                self.trail_t += n * dt
            self.level_db = float(20 * np.log10(rms)) if rms > 0 else None
            self.loads.append((time.perf_counter() - t_start) / (out.shape[1] / m.sr))
        return out

    # -- status for the page

    def state(self):
        with self.lock:
            v = self.voice
            heads = []
            for i in range(4):
                if v is None or v.latents[i] is None:
                    heads.append(None)
                    continue
                n = v.latents[i].shape[1]
                w = self.window_was
                if w and self.anchor[i] is not None and self.perm is not None and len(self.perm) == w:
                    f0, _, _ = self._frames(i, w, self.perm)
                    heads.append({"pos": f0 / n, "window": [((self.anchor[i] - w + 1) % n) / n, min(w, n) / n]})
                else:
                    heads.append({"pos": self.heads[i] / n, "window": None})
            return {
                "controls": {k: val for k, val in self.c.items() if k != "trail"},
                "puck": self.puck,
                "heads": heads,
                "model": v.model.name if v else None,
                "sr": v.model.sr if v else None,
                "dims": v.model.latent_dims if v else None,
                "building": self.builder is not None or self.pending is not None,
                "error": self.error,
                "load": max(self.loads) if self.loads else None,
                "level_db": self.level_db,
            }


# ---------------------------------------------------------------- sound out

class Player:
    """Feeds the engine's blocks to pw-cat just in time. A block is decoded only
    when the audio still waiting to be written has fallen to the slowest recent
    decode plus a margin, so a control change waits as little as the decoder allows."""

    def __init__(self, engine, target=None):
        self.engine, self.target = engine, target
        self.cv = threading.Condition()
        self.queue = collections.deque()    # (rate, channels, interleaved float32 bytes)
        self.pending_s = 0.0
        self.decode_s = collections.deque(maxlen=20)
        self.decode_log = []                # every decode while playing: (seconds taken, block seconds)
        self.underruns = 0
        self.started = False
        self.running = True
        self.proc = None
        self.fmt = None

    def start(self):
        self.threads = [threading.Thread(target=f, daemon=True) for f in (self._decode_loop, self._write_loop)]
        for t in self.threads:
            t.start()

    def stop(self):
        self.running = False
        with self.cv:
            self.cv.notify_all()
        for t in self.threads:
            t.join(timeout=2)
        if self.proc:
            self.proc.stdin.close()
            self.proc.wait(timeout=5)

    def _decode_loop(self):
        while self.running:
            with self.cv:
                lead = max(self.decode_s, default=0.1) * LEAD_FACTOR + LEAD_MARGIN_S
                while self.running and self.pending_s > lead:
                    self.cv.wait(0.005)
            t0 = time.perf_counter()
            y = self.engine.next_block()
            took = time.perf_counter() - t0
            if y is None:
                # Silence while stopped or encoding keeps pw-cat fed on one timing path.
                sr, ch = self.fmt or (48000, 1)
                y = np.zeros((ch, BLOCK_SAMPLES), np.float32)
            else:
                sr = self.engine.voice.model.sr
                self.decode_s.append(took)
                self.decode_log.append((took, y.shape[1] / sr))
            with self.cv:
                self.queue.append((sr, y.shape[0], np.ascontiguousarray(y.T).tobytes()))
                self.pending_s += y.shape[1] / sr
                self.cv.notify_all()

    def _open(self, sr, ch):
        if self.proc:
            self.proc.stdin.close()
            self.proc.wait(timeout=5)
        args = ["pw-cat", "--playback", "--rate", str(sr), "--channels", str(ch),
                "--format", "f32", "--latency", PW_LATENCY]
        if self.target:
            args += ["--target", self.target]
        self.proc = subprocess.Popen(args + ["-"], stdin=subprocess.PIPE, bufsize=0)
        fcntl.fcntl(self.proc.stdin.fileno(), fcntl.F_SETPIPE_SZ, PIPE_BYTES)
        self.fmt = (sr, ch)

    def _write_loop(self):
        while self.running:
            with self.cv:
                if not self.queue and self.started:
                    self.underruns += 1
                while self.running and not self.queue:
                    self.cv.wait()
                if not self.running:
                    return
                sr, ch, data = self.queue[0]
            if (sr, ch) != self.fmt:
                self._open(sr, ch)
            fd, view, step = self.proc.stdin.fileno(), memoryview(data), WRITE_FRAMES * ch * 4
            for off in range(0, len(data), step):
                if not self.running:
                    return
                chunk = view[off:off + step]
                while chunk:
                    chunk = chunk[os.write(fd, chunk):]
                with self.cv:
                    self.pending_s -= len(view[off:off + step]) / (4 * ch * sr)
                    self.cv.notify_all()
            with self.cv:
                self.queue.popleft()
                self.started = True


# ---------------------------------------------------------------- serve

def cmd_serve(a):
    torch.set_num_threads(TORCH_THREADS)
    engine = Engine(Library())
    player = Player(engine)
    player.start()
    engine.set({})
    options = json.dumps({"models": list_models(), "sources": list_sources()}).encode()

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kw):
            super().__init__(*args, directory=str(HERE), **kw)

        def log_message(self, *args):
            pass

        def end_headers(self):
            # Pages and modules change between reloads while the bench is worked on.
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

        def reply(self, body):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path == "/api/options":
                return self.reply(options)
            if self.path == "/api/state":
                s = engine.state()
                s["underruns"] = player.underruns
                return self.reply(json.dumps(s).encode())
            return super().do_GET()

        def do_POST(self):
            if self.path != "/api/control":
                return self.send_error(404)
            engine.set(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
            self.reply(b"{}")

    server = ThreadingHTTPServer(("127.0.0.1", a.port), Handler)
    print(f"http://127.0.0.1:{a.port}/live.html", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        player.stop()


# ---------------------------------------------------------------- render

def render(engine, seconds, events=()):
    """Run the block loop for `seconds` of audio, applying [t, controls] events as
    their time comes. Returns the audio and each block's decode time in seconds."""
    events = sorted(events, key=lambda e: e[0])
    out, took, t, ei, sr = [], [], 0.0, 0, None
    while t < seconds:
        while ei < len(events) and events[ei][0] <= t:
            engine.set(events[ei][1])
            ei += 1
        t0 = time.perf_counter()
        y = engine.next_block()
        took.append(time.perf_counter() - t0)
        if y is None:
            raise SystemExit(f"nothing to render: {engine.error or 'set playing and at least one source'}")
        if sr is not None and engine.voice.model.sr != sr:
            raise SystemExit("a model change mid-render changed the sample rate")
        sr = engine.voice.model.sr
        out.append(y)
        t += y.shape[1] / sr
    return np.concatenate(out, axis=1), took


def cmd_render(a):
    torch.set_num_threads(TORCH_THREADS)
    script = json.loads(open(a.script).read())
    engine = Engine(Library(), background=False)
    controls = dict(script.get("controls", {}), playing=True)
    if "model" in controls:
        controls["model"] = resolve_model(controls["model"])
    engine.set(controls)
    y, _ = render(engine, float(script["seconds"]), script.get("events", []))
    sf.write(a.out, y.T, engine.voice.model.sr, subtype="FLOAT")
    print(f"wrote {a.out}: {y.shape[1] / engine.voice.model.sr:.2f} s, {engine.voice.model.name}")


# ---------------------------------------------------------------- proof

def circle_trail(period_s=8.0, points=80):
    """A test trail: one circle around the pad's centre per period."""
    return [[period_s * k / points, 0.5 + 0.4 * np.cos(2 * np.pi * k / points),
             0.5 + 0.4 * np.sin(2 * np.pi * k / points)] for k in range(points + 1)]


def cmd_proof(a):
    """The spec sheet's live predictions that need no sound card."""
    torch.set_num_threads(TORCH_THREADS)
    name = resolve_model(a.model)
    lib = Library()
    sources = DEFAULTS["sources"]
    results = []

    def check(n, ok, text):
        results.append(ok)
        print(f"  {n}. {'PASS' if ok else 'FAIL'}  {text}", flush=True)

    # Corner: the puck on A plays A's latent untouched, so the engine's output must
    # equal a direct block-wise decode of that latent, sample for sample.
    engine = Engine(lib, background=False)
    engine.set({"model": name, "sources": sources, "playing": True, "x": 0, "y": 0})
    v = engine.pending
    m = v.model
    print(f"{name}: {m.latent_dims} dims, {v.steps} steps per block of {v.steps * m.ratio} samples", flush=True)
    za, gain_a = v.latents[0], v.gains_db[0]
    blocks = za.shape[1] // v.steps
    y, _ = render(engine, blocks * v.steps * m.ratio / m.sr - 1e-9)
    ref_model = lib.worker
    torch.manual_seed(1)
    ref_model.reset()
    with torch.no_grad():
        ref = np.concatenate([ref_model.m.decode(torch.from_numpy(np.ascontiguousarray(za[:, i:i + v.steps]))[None])[0].numpy()
                              for i in range(0, blocks * v.steps, v.steps)], axis=1)
    # The engine applies its gain in float64; so does the reference.
    ref = np.clip(ref.astype(np.float64) * 10 ** (gain_a / 20), -1, 1).astype(np.float32)
    diff = float(np.max(np.abs(y - ref)))
    # Joins: the step across every other block join, against the step at the same
    # sample of a decode in blocks twice as long, which has no join there. A step
    # from the music shows in both; a click from the join shows only in the first.
    # Comparing with the steps inside the blocks instead is fooled by a source whose
    # beats fall on the block grid.
    block = v.steps * m.ratio
    torch.manual_seed(1)
    ref_model.reset()
    with torch.no_grad():
        long = np.concatenate([ref_model.m.decode(torch.from_numpy(np.ascontiguousarray(za[:, i:i + 2 * v.steps]))[None])[0].numpy()
                               for i in range(0, blocks * v.steps, 2 * v.steps)], axis=1)
    long = np.clip(long.astype(np.float64) * 10 ** (gain_a / 20), -1, 1)
    odd = np.arange(block, min(y.shape[1], long.shape[1]), 2 * block) - 1
    join_ratio = float(np.median(np.abs(np.diff(y.mean(axis=0)))[odd]) /
                       np.median(np.abs(np.diff(long.mean(axis=0)))[odd]))
    whole = np.clip(ref_model.decode(za) * 10 ** (gain_a / 20), -1, 1)[:, :y.shape[1]]
    corr = float(np.corrcoef(whole.mean(axis=0), y.mean(axis=0))[0, 1])
    check(1, diff == 0 and join_ratio <= 2,
          f"corner A: max difference {diff:g} from a direct block decode; median step at block joins "
          f"{join_ratio:.2f}× the step there with no join; correlation with a whole-file decode {corr:.3f}")

    # Level: at the pad's centre the four gains are mixed by the same weights.
    engine = Engine(lib, background=False)
    engine.set({"model": name, "sources": sources, "playing": True, "x": 0.5, "y": 0.5})
    y, _ = render(engine, 30.0)
    inputs = [overall_rms_db(load_audio(PANTRY / s, m.sr)) for s in sources]
    d = overall_rms_db(y) - float(np.mean(inputs))
    check(2, abs(d) <= 3, f"pad centre: output RMS {d:+.1f} dB against the mean of the four inputs")

    # Compute: a moving puck with drift and a bend, timed block by block.
    engine = Engine(lib, background=False)
    engine.set({"model": name, "sources": sources, "playing": True,
                "trail": circle_trail(), "trail_on": True, "drift": 0.5, "bend": 1.05})
    _, took = render(engine, a.seconds)
    block_s = v.steps * m.ratio / m.sr
    p99 = float(np.percentile(took[1:], 99)) / block_s
    check(3, p99 <= 0.6, f"{a.seconds:g} s with a moving puck: 99th-percentile decode "
          f"{p99:.0%} of the block length ({np.median(took[1:]) / block_s:.0%} median)")
    print(f"  {sum(results)} of {len(results)} predictions hold", flush=True)


# ---------------------------------------------------------------- check

def pactl(*args):
    return subprocess.run(["pactl", *args], check=True, capture_output=True, text=True).stdout.strip()


def cmd_check(a):
    """Live run into a null sink: underruns under a moving puck, then control delay."""
    # A stop by signal still runs the cleanup below, so no null sink is left loaded.
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))
    torch.set_num_threads(TORCH_THREADS)
    name = resolve_model(a.model)
    default_sink = pactl("get-default-sink")
    module = pactl("load-module", "module-null-sink", f"sink_name={PROBE_SINK}",
                   f"sink_properties=device.description={PROBE_SINK}")
    capture = player = None
    try:
        if pactl("get-default-sink") != default_sink:
            pactl("set-default-sink", default_sink)
        engine = Engine(Library())
        player = Player(engine, target=PROBE_SINK)
        player.start()
        engine.set({"model": name, "playing": True, "trail": circle_trail(), "trail_on": True, "drift": 0.5})
        while engine.voice is None and not engine.error:
            time.sleep(0.05)
        if engine.error:
            raise SystemExit(engine.error)
        time.sleep(1.0)
        u0, n0 = player.underruns, len(player.decode_log)
        time.sleep(a.seconds)
        soak = player.decode_log[n0:]
        underruns = player.underruns - u0
        loads = [t / b for t, b in soak]
        print(f"{name}: {a.seconds:g} s live with a moving puck: {underruns} underruns, "
              f"decode 99th percentile {np.percentile(loads, 99):.0%} of the block length", flush=True)

        # Delay: from stopped, when the engine writes digital silence, to playing.
        # The time runs from the control call to the first 10 ms chunk of the probe
        # sink's monitor above SILENT_DB, so it includes the capture path and is an
        # upper bound on the delay to the sink. Every control waits in the same
        # queue; play is the one whose onset cannot be mistaken for the music.
        engine.set({"playing": False})
        chunk = 480
        capture = subprocess.Popen(["parec", "-d", f"{PROBE_SINK}.monitor", "--raw", "--format=float32le",
                                    "--rate=48000", "--channels=1", "--latency-msec=10"], stdout=subprocess.PIPE)
        heard = []

        def listen():
            while True:
                b = capture.stdout.read(chunk * 4)
                if len(b) < chunk * 4:
                    return
                x = np.frombuffer(b, "<f4")
                heard.append((time.monotonic(), 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)))

        threading.Thread(target=listen, daemon=True).start()
        delays = []
        for _ in range(10):
            time.sleep(1.5)
            now = time.monotonic()
            if any(db > SILENT_DB for t, db in heard if now - 0.3 <= t <= now):
                continue
            t_c = time.monotonic()
            engine.set({"playing": True})
            time.sleep(1.0)
            hit = next((t for t, db in heard if t > t_c and db > SILENT_DB), None)
            if hit is not None:
                delays.append(hit - t_c)
            engine.set({"playing": False})
        print(f"  control delay over {len(delays)} of 10 starts: median {np.median(delays) * 1e3:.0f} ms, "
              f"max {np.max(delays) * 1e3:.0f} ms (upper bound, includes capture)", flush=True)
    finally:
        if capture:
            capture.terminate()
        if player:
            player.stop()
        pactl("unload-module", module)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("serve"); p.add_argument("--port", type=int, default=8001); p.set_defaults(fn=cmd_serve)
    p = sub.add_parser("render"); p.add_argument("script"); p.add_argument("out"); p.set_defaults(fn=cmd_render)
    p = sub.add_parser("proof"); p.add_argument("model"); p.add_argument("--seconds", type=float, default=300)
    p.set_defaults(fn=cmd_proof)
    p = sub.add_parser("check"); p.add_argument("model"); p.add_argument("--seconds", type=float, default=30)
    p.set_defaults(fn=cmd_check)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
