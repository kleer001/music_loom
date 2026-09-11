#!/usr/bin/env python3
"""Find a seamless loop window in the source recording, and print its bounds.

This is where build.py's LOOP_START / LOOP_END come from. Ambient field material
has no beat grid, so this matches on spectral self-similarity (not PyMusicLooper's
beat-relative window): it looks for a start and an end whose surrounding spectra
continue smoothly into each other, over a window of at least 0.35x the recording
(PyMusicLooper's own default), then snaps both to zero crossings to kill the click.

Re-run it if the source changes; paste the printed sample bounds into build.py.
"""
import glob
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.spatial.distance import cdist

SR = 48000
SRC = sorted(glob.glob(os.path.join(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))), "assets/source/*.wav")))[0]


def main():
    sr, x = wavfile.read(SRC)
    x = x.astype(np.float64) / 32768.0
    if x.ndim > 1:
        x = x.mean(axis=1)
    dur = len(x) / sr

    nfft, hop = 2048, 1024
    f, _, z = signal.stft(x, sr, nperseg=nfft, noverlap=nfft - hop,
                          boundary=None, padded=False)
    power = np.abs(z) ** 2
    edges = np.logspace(np.log10(40), np.log10(sr / 2), 21)
    feat = np.array([power[(f >= edges[i]) & (f < edges[i + 1])].sum(0) for i in range(20)])
    feat = np.log(feat + 1e-9)
    feat = (feat - feat.mean(1, keepdims=True)) / (feat.std(1, keepdims=True) + 1e-9)
    frames = feat.T
    frame_dt = hop / sr
    min_len = int(round(0.35 * dur / frame_dt))

    dist = cdist(frames, frames)
    best = None
    for s in range(len(frames) - min_len):
        e0 = s + min_len
        e = e0 + int(np.argmin(dist[s, e0:]))
        if best is None or dist[s, e] < best[0]:
            best = (dist[s, e], s, e)
    _, s, e = best

    def snap(n):
        lo, hi = max(0, n - hop), min(len(x) - 1, n + hop)
        zc = [i for i in range(lo, hi) if x[i] <= 0 < x[i + 1]]
        return min(zc, key=lambda i: abs(i - n)) if zc else n

    ls, le = snap(s * hop), snap(e * hop)
    loop = x[ls:le]
    wrap = abs(loop[0] - loop[-1]) / (np.median(np.abs(np.diff(loop))) + 1e-12)
    print(f"LOOP_START, LOOP_END = {ls}, {le}")
    print(f"# {ls/sr:.2f}s -> {le/sr:.2f}s  ({(le-ls)/sr:.2f}s)  seam wrap {wrap:.2f}")


if __name__ == "__main__":
    main()
