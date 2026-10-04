# latent_waves

**Parked.** The engine meets its timing and accuracy checks (`RESULTS.md`), but by ear the output is atonal, squishy noise, so the bench is not developed further. The facts about RAVE exports in `CLAUDE.md` hold for any later work with these models.

Recordings pushed through pretrained RAVE models and changed on the way: latent dials, melds, stretches and decoder bends, after the Engram sampler — plus the latent-space surfing Engram does not show.

```sh
./fetch_models.sh                       # pretrained RAVE models into ~/.cache (about 2.3 GB)
uv venv .venv && uv pip install --python .venv/bin/python \
    torch --index-url https://download.pytorch.org/whl/cpu
uv pip install --python .venv/bin/python numpy soundfile soxr
.venv/bin/python latent.py info percussion
.venv/bin/python latent.py proof percussion A.wav B.wav    # render and check the spec's predictions
./run.sh                                # audition page for everything rendered
.venv/bin/python live.py serve          # the live instrument, and the audition page too
```

Live, as an instrument:

```sh
.venv/bin/python live.py serve          # then open http://127.0.0.1:8001/live.html
```

Four pantry recordings sit at the corners of an XY pad and are mixed inside the model's latent space while it plays: drag the puck, or record a trail and loop it. Speed, freeze, window and swirl move through the recordings' latent frames; drift pushes the mix off in a seeded direction; bend scales the decoder's first layer. Sound goes out through `pw-cat` (PipeWire). A control change is heard after 0.18–0.30 s (median, by model; 0.39 s at most), which suits slow surfing better than playing rhythm.

`latent.py` renders into `tmp/renders/` and logs each file in a manifest; the page served by `run.sh` plays them side by side. Opening `index.html` directly gets a blank page — `fetch` and ES modules do not work over `file://`.

The bench is Python, not the house's Web Audio: the RAVE models are TorchScript, and the CPU build of PyTorch runs them faster than real time.

## Credits

Pretrained models: IRCAM ACIDS team ([RAVE](https://github.com/acids-ircam/RAVE), [model list](https://acids-ircam.github.io/rave_models_download)) and the Intelligent Instruments Lab ([rave-models](https://huggingface.co/Intelligent-Instruments-Lab/rave-models), CC BY-NC 4.0). Method: Caillon & Esling, "RAVE: A variational autoencoder for fast and high-quality neural audio synthesis", 2021.

```sh
npm test
```

Pure logic only. Audio is verified by rendering it offline and measuring the output, not by asserting on the shape of the graph.

## Lineage

Built from [music_loom](https://github.com/kleer001/music_loom), a workbench for procedural instruments. The version this descends from is stamped in `.music_loom.toml`; `check_updates.py` in the studio reports what has changed since. Apparatus this instrument has not needed yet — a render-and-measure harness, an effects rack, a library of voices — is waiting there.
