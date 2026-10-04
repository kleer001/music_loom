#!/usr/bin/env python3
"""latent_waves bench — encode a recording with a RAVE model, change its latent, decode.

    .venv/bin/python latent.py info percussion
    .venv/bin/python latent.py tour percussion IN.wav [--dims 4] [--depth 2]
    .venv/bin/python latent.py meld percussion A.wav B.wav [--bala 0.5 | --sweep]
    .venv/bin/python latent.py stretch percussion IN.wav [--mult 2] [--fram 1] [--swir 0]
    .venv/bin/python latent.py bend percussion IN.wav [--layer 0] [--op scale] [--amount 1.5]
    .venv/bin/python latent.py proof percussion IN.wav B.wav

A model is named by any unique part of its file name in models/ (see fetch_models.sh).
Renders go to tmp/renders/<model>/ with a manifest the audition page reads.
"""

import argparse
import json
import re
import sys
import warnings
from pathlib import Path

import numpy as np
import soundfile as sf
import soxr
import torch

HERE = Path(__file__).resolve().parent
MODELS = HERE / "models"
RENDERS = HERE / "tmp" / "renders"

# torch marks jit.load deprecated in favour of torch.export, but RAVE models ship
# only as TorchScript.
warnings.filterwarnings("ignore", message=".*torch.jit.load.*")

# Descriptor window. Half a second holds ~11 latent frames — long enough for a
# stable centroid, short enough to follow a sweep.
WINDOW_S = 0.5

# The one export that stores no sample rate anywhere. IRCAM lists it as
# "RAVE v2 - onnx"; that configuration (rave/configs/onnx.gin) includes v1.gin,
# whose SAMPLING_RATE is 44100. An assumption from the config, not a stored value.
CONFIG_SR = {"ircam_darbouka_onnx": 44100}


# ---------------------------------------------------------------- model and audio

class Model:
    """A RAVE TorchScript export, with the shapes its encode/decode expect."""

    def __init__(self, name):
        paths = sorted(MODELS.glob("*.ts"))
        hits = [p for p in paths if p.stem.lower() == name.lower()] or \
               [p for p in paths if name.lower() in p.stem.lower()]
        if len(hits) != 1:
            names = [p.stem for p in sorted(MODELS.glob("*.ts"))]
            raise SystemExit(f"model {name!r} matches {len(hits)} of: {', '.join(names)}")
        self.path = hits[0]
        self.name = self.path.stem
        self.m = torch.jit.load(str(self.path), map_location="cpu").eval()
        # encode_params = [in channels, in ratio, latent channels, frames ratio];
        # decode_params = [latent channels, ratio, out channels, out ratio].
        enc = self.m.encode_params.tolist()
        dec = self.m.decode_params.tolist()
        self.in_channels, self.latent_dims = enc[0], enc[2]
        self.out_channels = dec[2]
        self.sr = self._sample_rate()
        # Streaming exports keep state between calls so that consecutive audio
        # buffers join without clicks: convolution caches (`*.cache.pad`),
        # upsampling caches (`*.cache`), and in some exports the last latent
        # (`last_z`). Between whole-file calls that state leaks — the same latent
        # decoded twice differed by up to 0.77 in amplitude. Every buffer is
        # snapshotted at load and rebound by name before each call: older exports
        # replace some buffers with larger tensors on their first call, so
        # copying into the original tensor objects would miss them.
        self.cold = []
        for name, buf in self.m.named_buffers():
            *path, leaf = name.split(".")
            owner = self.m
            for part in path:
                owner = getattr(owner, part)
            self.cold.append((owner, leaf, buf.detach().clone()))
        self.ratio = self._measured_ratio()

    def _sample_rate(self):
        # Older exports wrap the model in a `_rave` submodule and store the rate there.
        for mod in (self.m, getattr(self.m, "_rave", None)):
            for attr in ("sampling_rate", "sr"):
                if mod is not None and hasattr(mod, attr):
                    return int(getattr(mod, attr))
        tag = re.search(r"_r(\d{5})", self.name)
        if tag:
            return int(tag.group(1))
        if self.name in CONFIG_SR:
            return CONFIG_SR[self.name]
        raise SystemExit(f"{self.name}: no sample rate stored in the export or its file name")

    @torch.no_grad()
    def _measured_ratio(self):
        """Samples per latent frame, counted from a decode. The stored frames ratio
        can be wrong: ircam_darbouka_onnx stores 128 and decodes 2048."""
        self.reset()
        return self.m.decode(torch.zeros(1, self.latent_dims, 4))[0].shape[-1] // 4

    def reset(self):
        for owner, leaf, saved in self.cold:
            setattr(owner, leaf, saved.clone())

    @torch.no_grad()
    def encode(self, x, seed=1):
        """x: float32 [samples] mono → latent [latent_dims, frames].

        Seeded: the encoder samples its posterior, so two unseeded encodes of the
        same input differ — in some models by more than the latent's own spread.
        """
        t = torch.from_numpy(x).float()[None, None, :].repeat(1, self.in_channels, 1)
        torch.manual_seed(seed)
        self.reset()
        return self.m.encode(t)[0].numpy()

    @torch.no_grad()
    def decode(self, z, seed=1):
        """latent [latent_dims, frames] → audio [channels, samples].

        Seeded: RAVE decoders carry a noise synthesizer, so two decodes of the
        same latent differ unless the generator is reset first.
        """
        torch.manual_seed(seed)
        self.reset()
        return self.m.decode(torch.from_numpy(np.ascontiguousarray(z)).float()[None])[0].numpy()

    def decoder_layers(self):
        """Weight tensors of the decoder's convolutions, in graph order."""
        decoder = self.m._rave.decoder if hasattr(self.m, "_rave") else self.m.decoder
        return [(n, p) for n, p in decoder.named_parameters() if p.dim() >= 2]


def load_audio(path, sr):
    """Mono float32 at the model's rate. Resampled on the way in, never assumed."""
    x, file_sr = sf.read(str(path), dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if file_sr != sr:
        x = soxr.resample(x, file_sr, sr)
    return x


def save(model, op, y, extra=None):
    """Write a render, normalised to −1 dBFS for audition, and log it in the manifest."""
    out_dir = RENDERS / model.name
    out_dir.mkdir(parents=True, exist_ok=True)
    peak = float(np.max(np.abs(y))) if y.size else 0.0
    gain = 10 ** (-1 / 20) / peak if peak > 0 else 1.0
    path = out_dir / f"{op}.wav"
    sf.write(str(path), (y * gain).T, model.sr, subtype="PCM_16")
    entry = {"model": model.name, "op": op, "file": str(path.relative_to(HERE)),
             "seconds": round(y.shape[-1] / model.sr, 2),
             "peak_dbfs_raw": round(20 * np.log10(peak), 2) if peak > 0 else None}
    entry.update(extra or {})
    manifest_path = RENDERS / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    manifest = [e for e in manifest if e["file"] != entry["file"]] + [entry]
    manifest_path.write_text(json.dumps(manifest, indent=1))
    print(f"  wrote {entry['file']}  {entry['seconds']} s  raw peak {entry['peak_dbfs_raw']} dBFS")
    return entry


def save_source(path):
    """Copy an input into the renders, at its own rate, so the page can play it beside the results."""
    x, sr = sf.read(str(path), dtype="float32", always_2d=True)
    out = RENDERS / "sources" / f"{Path(path).stem}.wav"
    if out.exists():
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out), x, sr, subtype="PCM_16")
    entry = {"model": "sources", "op": Path(path).stem, "file": str(out.relative_to(HERE)),
             "seconds": round(len(x) / sr, 2),
             "peak_dbfs_raw": round(float(20 * np.log10(np.max(np.abs(x)) + 1e-12)), 2)}
    manifest_path = RENDERS / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    manifest_path.write_text(json.dumps(manifest + [entry], indent=1))


# ---------------------------------------------------------------- descriptors

def descriptors(y, sr):
    """Per-window RMS (dB) and spectral centroid (Hz) of the channel mean."""
    mono = y.mean(axis=0) if y.ndim == 2 else y
    n = int(WINDOW_S * sr)
    rms, cen = [], []
    win = np.hanning(n)
    freqs = np.fft.rfftfreq(n, 1 / sr)
    for i in range(0, len(mono) - n + 1, n):
        seg = mono[i:i + n]
        r = np.sqrt(np.mean(seg ** 2))
        rms.append(20 * np.log10(r + 1e-9))
        mag = np.abs(np.fft.rfft(seg * win))
        cen.append(float((freqs * mag).sum() / (mag.sum() + 1e-12)))
    return np.array(rms), np.array(cen)


def overall_rms_db(y):
    mono = y.mean(axis=0) if y.ndim == 2 else y
    return float(20 * np.log10(np.sqrt(np.mean(mono ** 2)) + 1e-9))


# ---------------------------------------------------------------- latent operations

def sweep(frames, lo, hi):
    return np.linspace(lo, hi, frames, dtype=np.float32)


def tour(z, dim, depth):
    """Offset one latent dimension by a linear sweep from −depth to +depth."""
    out = z.copy()
    out[dim] += sweep(z.shape[1], -depth, depth)
    return out


def meld(za, zb, bala):
    """Frame-by-frame mix of two latents. bala is a number or a per-frame array."""
    f = min(za.shape[1], zb.shape[1])
    return (1 - bala) * za[:, :f] + bala * zb[:, :f]


def stretch(z, mult):
    """Resample the latent in time by linear interpolation between frames."""
    f_in = z.shape[1]
    f_out = int(round(f_in * mult))
    src = np.linspace(0, f_in - 1, f_out)
    i0 = np.floor(src).astype(int)
    i1 = np.minimum(i0 + 1, f_in - 1)
    w = (src - i0)[None, :]
    return ((1 - w) * z[:, i0] + w * z[:, i1]).astype(np.float32)


def windows(z, fram, swir, seed):
    """Cut into windows of `fram` frames; displace each window's position by a
    seeded normal draw of size `swir` windows, then reassemble in the new order."""
    if fram < 1 or swir <= 0:
        return z
    rng = np.random.default_rng(seed)
    starts = list(range(0, z.shape[1], fram))
    keys = np.arange(len(starts)) + rng.normal(0, swir, len(starts))
    order = np.argsort(keys, kind="stable")
    return np.concatenate([z[:, starts[k]:starts[k] + fram] for k in order], axis=1)


class bent:
    """Context manager: bend one decoder weight tensor in place, restore on exit.

    ops — scale: w·amount; noise: w + amount·std(w)·N(0,1); ablate: zero a
    fraction `amount` of output channels; invert: −w. After Broad et al. 2021,
    applied to weights rather than activations because a TorchScript module
    cannot run Python hooks.
    """

    def __init__(self, model, layer, op, amount, seed=1):
        self.name, self.p = model.decoder_layers()[layer]
        self.op, self.amount, self.seed = op, amount, seed

    def __enter__(self):
        self.saved = self.p.detach().clone()
        g = torch.Generator().manual_seed(self.seed)
        with torch.no_grad():
            w = self.p
            if self.op == "scale":
                w.mul_(self.amount)
            elif self.op == "noise":
                w.add_(self.amount * w.std() * torch.randn(w.shape, generator=g))
            elif self.op == "ablate":
                k = int(round(self.amount * w.shape[0]))
                idx = torch.randperm(w.shape[0], generator=g)[:k]
                w[idx] = 0
            elif self.op == "invert":
                w.neg_()
            else:
                raise SystemExit(f"unknown bend op {self.op!r}")
        return self

    def __exit__(self, *exc):
        with torch.no_grad():
            self.p.copy_(self.saved)


# ---------------------------------------------------------------- commands

def cmd_info(a):
    m = Model(a.model)
    print(f"{m.name}\n  sample rate {m.sr} Hz, input channels {m.in_channels}, "
          f"output channels {m.out_channels}\n  latent dims {m.latent_dims}, "
          f"one frame per {m.ratio} samples = {m.sr / m.ratio:.2f} frames/s")
    layers = m.decoder_layers()
    print(f"  decoder weight tensors: {len(layers)}")
    for i, (n, p) in enumerate(layers):
        print(f"    {i:>2}  {n}  {tuple(p.shape)}")


def cmd_tour(a):
    m = Model(a.model)
    z = m.encode(load_audio(a.input, m.sr))
    print(f"{m.name}: {z.shape[1]} frames, {m.latent_dims} dims")
    for d in range(min(a.dims, m.latent_dims)):
        y = m.decode(tour(z, d, a.depth))
        rms, cen = descriptors(y, m.sr)
        q = max(1, len(rms) // 5)
        drms = rms[-q:].mean() - rms[:q].mean()
        dcen = cen[-q:].mean() / cen[:q].mean() - 1
        save(m, f"tour_dim{d}", y, {"dim": d, "depth": a.depth,
             "rms_swing_db": round(float(drms), 2), "centroid_swing": round(float(dcen), 3)})
        print(f"    dim {d}: RMS {drms:+.1f} dB, centroid {dcen:+.0%} from −{a.depth} to +{a.depth}")


def cmd_meld(a):
    m = Model(a.model)
    za = m.encode(load_audio(a.a, m.sr))
    zb = m.encode(load_audio(a.b, m.sr))
    f = min(za.shape[1], zb.shape[1])
    bala = sweep(f, 0, 1) if a.sweep else a.bala
    tag = "meld_sweep" if a.sweep else f"meld_{a.bala:g}"
    save(m, tag, m.decode(meld(za, zb, bala)), {"bala": "0→1" if a.sweep else a.bala})


def cmd_stretch(a):
    m = Model(a.model)
    z = m.encode(load_audio(a.input, m.sr))
    zs = windows(stretch(z, a.mult), a.fram, a.swir, a.seed)
    save(m, f"stretch_x{a.mult:g}_f{a.fram}_s{a.swir:g}", m.decode(zs),
         {"mult": a.mult, "fram": a.fram, "swir": a.swir, "frames_in": z.shape[1], "frames_out": zs.shape[1]})


def cmd_bend(a):
    m = Model(a.model)
    z = m.encode(load_audio(a.input, m.sr))
    with bent(m, a.layer, a.op, a.amount, a.seed) as b:
        y = m.decode(z)
    save(m, f"bend_l{a.layer}_{a.op}_{a.amount:g}", y,
         {"layer": a.layer, "param": b.name, "bend_op": a.op, "amount": a.amount})


def cmd_proof(a):
    """The spec sheet's five predictions, run and checked in one pass."""
    m = Model(a.model)
    xa, xb = load_audio(a.input, m.sr), load_audio(a.b, m.sr)
    za, zb = m.encode(xa), m.encode(xb)
    results = []

    def check(n, ok, text):
        results.append(ok)
        print(f"  {n}. {'PASS' if ok else 'FAIL'}  {text}")

    print(f"{m.name}: {m.latent_dims} dims at {m.sr / m.ratio:.2f} frames/s")
    save_source(a.input)
    save_source(a.b)

    # 1. Round trip keeps the level within 6 dB.
    ya = m.decode(za)
    save(m, "roundtrip_a", ya)
    d = overall_rms_db(ya) - overall_rms_db(xa)
    check(1, abs(d) <= 6, f"round trip RMS {d:+.1f} dB against the input")

    # 2. At least three of the first four dims move a descriptor.
    moved = 0
    for dim in range(min(4, m.latent_dims)):
        y = m.decode(tour(za, dim, 2.0))
        rms, cen = descriptors(y, m.sr)
        q = max(1, len(rms) // 5)
        drms = rms[-q:].mean() - rms[:q].mean()
        dcen = cen[-q:].mean() / cen[:q].mean() - 1
        save(m, f"tour_dim{dim}", y, {"dim": dim, "depth": 2.0,
             "rms_swing_db": round(float(drms), 2), "centroid_swing": round(float(dcen), 3)})
        hit = abs(drms) > 3 or abs(dcen) > 0.20
        moved += hit
        print(f"       dim {dim}: RMS {drms:+.1f} dB, centroid {dcen:+.0%}{'  ← moves' if hit else ''}")
    check(2, moved >= min(3, m.latent_dims), f"{moved} of {min(4, m.latent_dims)} dims move a descriptor")

    # 3. 2× stretch doubles the frames; median centroid within 15%.
    zs = stretch(za, 2.0)
    ys = m.decode(zs)
    save(m, "stretch_x2", ys, {"mult": 2.0, "frames_in": za.shape[1], "frames_out": zs.shape[1]})
    c0, c1 = np.median(descriptors(ya, m.sr)[1]), np.median(descriptors(ys, m.sr)[1])
    check(3, zs.shape[1] == 2 * za.shape[1] and abs(c1 / c0 - 1) <= 0.15,
          f"frames {za.shape[1]} → {zs.shape[1]}, median centroid {c0:.0f} → {c1:.0f} Hz ({c1 / c0 - 1:+.0%})")

    # 4. Balance 0 and 1 null against the single-source decodes; 0.5 lies between.
    f = min(za.shape[1], zb.shape[1])
    y0, y1 = m.decode(meld(za, zb, 0.0)), m.decode(meld(za, zb, 1.0))
    ra, rb = m.decode(za[:, :f]), m.decode(zb[:, :f])
    null = max(float(np.max(np.abs(y0 - ra)) / np.max(np.abs(ra))),
               float(np.max(np.abs(y1 - rb)) / np.max(np.abs(rb))))
    yh = m.decode(meld(za, zb, 0.5))
    save(m, "meld_0.5", yh, {"bala": 0.5})
    save(m, "meld_sweep", m.decode(meld(za, zb, sweep(f, 0, 1))), {"bala": "0→1"})
    ca, cb, ch = (np.median(descriptors(v, m.sr)[1]) for v in (ra, rb, yh))
    between = min(ca, cb) <= ch <= max(ca, cb)
    check(4, 20 * np.log10(null + 1e-12) <= -40 and between,
          f"null residual {20 * np.log10(null + 1e-12):.0f} dB re peak; "
          f"centroids A {ca:.0f}, B {cb:.0f}, meld {ch:.0f} Hz")

    # 5. A bend changes the output, stays finite, and peaks within 6 dB of the
    # unbent decode. Unbent decodes already exceed full scale, so the reference
    # is the unbent decode, not 0 dBFS.
    with bent(m, a.layer, "scale", 1.5) as b:
        yb = m.decode(za)
    save(m, f"bend_l{a.layer}_scale_1.5", yb, {"layer": a.layer, "param": b.name, "bend_op": "scale", "amount": 1.5})
    rise = 20 * np.log10(np.max(np.abs(yb)) / np.max(np.abs(ya)))
    change = float(np.max(np.abs(yb - ya)) / np.max(np.abs(ya)))
    check(5, np.isfinite(yb).all() and rise <= 6 and change > 0.01,
          f"bent {b.name}: peak {rise:+.1f} dB against unbent, max change {change:.0%} of unbent peak")

    print(f"  {sum(results)} of {len(results)} predictions hold")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("info"); p.add_argument("model"); p.set_defaults(fn=cmd_info)

    p = sub.add_parser("tour"); p.add_argument("model"); p.add_argument("input")
    p.add_argument("--dims", type=int, default=4); p.add_argument("--depth", type=float, default=2.0)
    p.set_defaults(fn=cmd_tour)

    p = sub.add_parser("meld"); p.add_argument("model"); p.add_argument("a"); p.add_argument("b")
    p.add_argument("--bala", type=float, default=0.5); p.add_argument("--sweep", action="store_true")
    p.set_defaults(fn=cmd_meld)

    p = sub.add_parser("stretch"); p.add_argument("model"); p.add_argument("input")
    p.add_argument("--mult", type=float, default=2.0); p.add_argument("--fram", type=int, default=1)
    p.add_argument("--swir", type=float, default=0.0); p.add_argument("--seed", type=int, default=1)
    p.set_defaults(fn=cmd_stretch)

    p = sub.add_parser("bend"); p.add_argument("model"); p.add_argument("input")
    p.add_argument("--layer", type=int, default=0)
    p.add_argument("--op", choices=["scale", "noise", "ablate", "invert"], default="scale")
    p.add_argument("--amount", type=float, default=1.5); p.add_argument("--seed", type=int, default=1)
    p.set_defaults(fn=cmd_bend)

    p = sub.add_parser("proof"); p.add_argument("model"); p.add_argument("input"); p.add_argument("b")
    p.add_argument("--layer", type=int, default=0)
    p.set_defaults(fn=cmd_proof)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
