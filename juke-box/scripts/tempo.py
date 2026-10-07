"""Estimate tempo from an audio file: spectral-flux onset envelope, then autocorrelation.

Usage: python3 -I tempo.py <audio> [<audio> ...]
Prints the three strongest tempi between 50 and 200 BPM, as the file's header rate reads it.
"""
import subprocess
import sys

import numpy as np

SR, HOP, N = 11025, 128, 1024


def onset_envelope(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP] * np.hanning(N)
    mag = np.log1p(np.abs(np.fft.rfft(frames, axis=1)))
    flux = np.maximum(np.diff(mag, axis=0), 0).sum(axis=1)
    return flux - flux.mean()


for path in sys.argv[1:]:
    env = onset_envelope(path)
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    fps = SR / HOP
    lags = np.arange(int(fps * 60 / 200), int(fps * 60 / 50) + 1)
    best = lags[np.argsort(ac[lags])[::-1]]
    picks = []
    for lag in best:
        if all(abs(lag - p) > 2 for p in picks):
            picks.append(lag)
        if len(picks) == 3:
            break
    print(path.split("/")[-1], " ".join(f"{60 * fps / p:.1f}" for p in picks), "BPM")
