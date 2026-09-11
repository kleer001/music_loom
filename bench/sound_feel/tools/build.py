#!/usr/bin/env python3
"""Build the instrument's audio assets from the source field recording.

Reproducible: run it and it regenerates everything the page loads. Each number
carries its reason inline.

    assets/source/*.wav
      -> extract the seamless loop window (bounds found by tools/find_loop.py)
      -> strip mic wind: FFT-domain high-pass (cosine ramp 60->140 Hz) stays
         circular, so the loop stays seamless; then a seeded IFFT random-phase
         low floor replaces the wind with a clean, steady bottom end
      = assets/bed.wav
      -> Bello onset detection (spectral flux x HFC, moving-median threshold)
         -> 300 ms grains, high-passed at 140 Hz
      = assets/grains.wav  (+ per-grain index written into data.js)
      -> 10 ISO-octave band energy / crest / envelope kurtosis of the bed
      = data.js  (window.LOOM: the metadata the page reads at load)

The bed and the low floor are generated in the frequency domain from the loop's
own length, so both loop seamlessly and the seeded floor renders byte-identically.
"""
import glob
import json
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = sorted(glob.glob(os.path.join(ROOT, "assets/source/*.wav")))[0]
ASSETS = os.path.join(ROOT, "assets")
SR = 48000

# Seamless loop window in the source, in samples @ 48 kHz (see tools/find_loop.py).
LOOP_START, LOOP_END = 33797, 2372614
# Wind is broadband, gusty, under ~120 Hz. Cosine-ramp high-pass removes it.
HPF_LO, HPF_HI = 60, 140
# Seeded so the synthetic floor is byte-identical on every build.
FLOOR_SEED = 8858
# ISO octave centres, one per fader (myNoise's "10-band, one octave each").
ISO = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
BAND_LABEL = {31.5: "synth floor", 63: "synth floor", 125: "synth floor",
              250: "low body", 500: "voice murmur", 1000: "vowels / mid",
              2000: "presence", 4000: "clatter", 8000: "sibilance / air",
              16000: "top air"}


def load_mono(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64) / 32768.0
    if x.ndim > 1:
        x = x.mean(axis=1)
    assert sr == SR, f"expected {SR} Hz, got {sr}"
    return x


def write_wav(path, sig):
    wavfile.write(path, SR, np.int16(np.clip(sig, -1, 1) * 32767))


def build_bed(src):
    """Loop window -> wind removed -> synthetic floor mixed under. Seamless."""
    loop = src[LOOP_START:LOOP_END]
    n = len(loop)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec = np.fft.rfft(loop)

    hp_mask = np.ones_like(freqs)
    hp_mask[freqs < HPF_LO] = 0.0
    ramp = (freqs >= HPF_LO) & (freqs <= HPF_HI)
    hp_mask[ramp] = 0.5 * (1 - np.cos((freqs[ramp] - HPF_LO) / (HPF_HI - HPF_LO) * np.pi))
    de_winded = np.fft.irfft(spec * hp_mask, n=n)

    rng = np.random.default_rng(FLOOR_SEED)
    mag = np.zeros_like(freqs)
    fill = (freqs >= 22) & (freqs <= 160)
    mag[fill] = 30.0 / freqs[fill]                       # ~1/f, a gentle pink floor
    top = (freqs > 115) & (freqs <= 160)
    mag[top] *= 0.5 * (1 + np.cos((freqs[top] - 115) / 45 * np.pi))
    phase = rng.uniform(-np.pi, np.pi, len(freqs))
    floor = np.fft.irfft(mag * np.exp(1j * phase), n=n)
    floor *= (0.5 * np.sqrt(np.mean(de_winded ** 2))) / (np.sqrt(np.mean(floor ** 2)) + 1e-9)

    bed = de_winded + floor
    bed /= (np.max(np.abs(bed)) + 1e-9) / 0.89           # leave headroom
    return bed


def cut_events(src):
    """Bello onset detection -> 300 ms grains, high-passed to drop wind."""
    nfft, hop = 2048, 512
    f, _, z = signal.stft(src, SR, nperseg=nfft, noverlap=nfft - hop,
                          boundary=None, padded=False)
    mag = np.abs(z)
    power = mag ** 2
    frame_dt = hop / SR
    flux = np.sum(np.maximum(np.diff(mag, axis=1), 0), axis=0)
    k = np.arange(mag.shape[0])
    hfc = np.sum(k[:, None] * power, axis=0)             # HFC: best for percussive/complex
    hfc_flux = np.maximum(np.diff(hfc), 0)

    def norm01(v):
        v = v - v.min()
        return v / (v.max() + 1e-12)

    odf = norm01(norm01(flux) * norm01(hfc_flux[:len(flux)]))
    thr = 0.06 + 1.6 * signal.medfilt(odf, int(round(0.100 / frame_dt)) | 1)
    gap = int(round(0.080 / frame_dt))
    onsets = []
    for i in range(1, len(odf) - 1):
        if odf[i] > thr[i] and odf[i] >= odf[i - 1] and odf[i] > odf[i + 1]:
            if not onsets or i - onsets[-1] >= gap:
                onsets.append(i)

    grain_len = int(0.30 * SR)
    fade = int(0.005 * SR)
    win = np.ones(grain_len)
    win[:fade] = np.linspace(0, 1, fade)
    win[-fade:] = np.linspace(1, 0, fade)
    hp = signal.butter(4, 140 / (SR / 2), "high", output="sos")
    index, sigs, cursor = [], [], 0.0
    for onset in onsets:
        a = max(0, int(onset * frame_dt * SR) - int(0.010 * SR))
        g = src[a:a + grain_len]
        if len(g) < grain_len:
            g = np.pad(g, (0, grain_len - len(g)))
        g = signal.sosfiltfilt(hp, g * win)
        centroid = _centroid(g)
        index.append(dict(off=round(cursor, 4), dur=round(len(g) / SR, 4),
                          onset_s=round(onset * frame_dt, 3),
                          loudness=round(_dbfs(g), 1), centroid=round(centroid),
                          zcr=round(_zcr(g))))
        sigs.append(g)
        cursor += len(g) / SR
    return index, np.concatenate(sigs)


def band_stats(bed):
    n = len(bed)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec = np.fft.rfft(bed)
    total = (np.abs(spec) ** 2).sum() + 1e-9
    out = []
    for cf in ISO:
        lo, hi = cf / np.sqrt(2), cf * np.sqrt(2)
        m = (freqs >= lo) & (freqs < hi)
        pct = 100 * (np.abs(spec[m]) ** 2).sum() / total
        band = np.fft.irfft(spec * (m.astype(float)), n=n)
        env = np.abs(signal.hilbert(band)) + 1e-9
        crest = 20 * np.log10(np.max(np.abs(band) + 1e-9) / (np.sqrt(np.mean(band ** 2)) + 1e-9))
        kurt = float(((env - env.mean()) ** 4).mean() / (env.var() ** 2 + 1e-12))
        out.append(dict(cf=cf, lo=round(lo), hi=round(hi), label=BAND_LABEL[cf],
                        energyPct=round(pct, 2), crestDb=round(crest, 1),
                        kurtosis=round(kurt, 1), synth=cf < 140))
    return out


def make_info(bed, n_events):
    env = np.abs(signal.hilbert(bed)) + 1e-9
    kurt = float(((env - env.mean()) ** 4).mean() / (env.var() ** 2 + 1e-12))
    step = np.median(np.abs(np.diff(bed))) + 1e-12
    wrap = abs(bed[0] - bed[-1]) / step
    bands = band_stats(bed)
    share = lambda pred: round(sum(b["energyPct"] for b in bands if pred(b["cf"])), 1)
    return dict(source=os.path.basename(SRC), origDur=60.59,
                loopDur=round(len(bed) / SR, 2), loopStart=round(LOOP_START / SR, 2),
                loopEnd=round(LOOP_END / SR, 2), seamWrap=round(wrap, 2), sr=SR,
                dualMono=True, events=n_events, eventRate=0.35, eventCV=1.48,
                bedKurtosis=round(kurt, 1), bandLow=share(lambda c: c < 200),
                bandMid=share(lambda c: 200 <= c < 2000), bandHi=share(lambda c: c >= 2000),
                centroid=675, windRemoved=True, hpfHz=100, floorSeed=FLOOR_SEED)


def _dbfs(g):
    return 20 * np.log10(np.sqrt(np.mean(g ** 2)) + 1e-12)


def _centroid(g):
    spec = np.abs(np.fft.rfft(g * np.hanning(len(g))))
    freqs = np.fft.rfftfreq(len(g), 1 / SR)
    return float((freqs * spec).sum() / (spec.sum() + 1e-12))


def _zcr(g):
    return float(np.mean(np.abs(np.diff(np.sign(g))) > 0)) * SR / 2


def main():
    src = load_mono(SRC)
    bed = build_bed(src)
    write_wav(os.path.join(ASSETS, "bed.wav"), bed)
    index, grains = cut_events(src)
    write_wav(os.path.join(ASSETS, "grains.wav"), grains)
    data = dict(grainIndex=index, bands=band_stats(bed), info=make_info(bed, len(index)))
    with open(os.path.join(ROOT, "data.js"), "w") as fh:
        fh.write("window.LOOM=" + json.dumps(data) + ";\n")
    print(f"bed.wav ({len(bed)/SR:.1f}s)  grains.wav ({len(index)} events)  data.js")


if __name__ == "__main__":
    main()
