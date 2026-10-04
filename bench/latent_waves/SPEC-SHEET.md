# latent_waves — spec sheet

A sketch to get from an idea to the first thing that plays. An afternoon's thinking, not a design document.

**This file has a lifespan.** A running instrument answers everything the page asks, so a copy kept past that point becomes a second description of the code with nothing checking it against the first.

## The sound

Recordings passed through a neural audio model and changed on the way through. Two sounds swirl into one. A phrase stretches into a pad. The decoder is glitched until it breaks. The reference is Thoughtful Things' Engram sampler, which does all three with its own small models but renders each one to a fixed sample. The addition here is what Engram does not show: dials that move a sound through the model's latent space while it plays — "surfing" the latent rather than rendering from it.

## The digest it rests on

- `research/engram/DIGEST.md` §1.2 and §2.3 — Engram's controls (`Bala`, `Mult`, `Fram`, `Swir`, `G1`, `G2`) and what each probably does. §3 — the workflow they sit in.
- `research/rave.md` §1–§3 — RAVE's latent: 8–24 ordered dimensions at about 23 frames per second, decoded about 20× faster than real time on a CPU. §7 — how each Engram process maps onto it.

## The mechanism

Input recording → RAVE encoder → latent (one row of numbers per ~43 ms frame) → operations → RAVE decoder → audio.

- **Voices:** pretrained RAVE models, the IRCAM set and the Intelligent Instruments Lab set (`fetch_models.sh`). Each model is a timbre: percussion, organ, birds, water, voice, and so on.
- **Operations on the latent:**
  - **Dials** — add an offset to latent dimension k. Swept over time, this is a tour of one axis.
  - **Meld** (`Bala`) — mix two sources' latents frame by frame, by a balance from 0 to 1.
  - **Stretch** (`Mult`) — resample the latent in time, then decode.
  - **Windows** (`Fram`, `Swir`) — cut the latent into windows of N frames, then shuffle them by an amount.
  - **Bend** (`G1`, `G2`) — scale, add noise to or zero part of a decoder layer's weights before decoding.
- **Sequencing:** none at first. The bench renders files.

## The smallest thing that proves it

A Python CLI, `latent.py`, that renders four files from one pantry recording and one model:

1. a tour of each of the first four latent dimensions;
2. a meld of two recordings with the balance swept from 0 to 1;
3. a 2× stretch;
4. one decoder bend.

An audition page plays them side by side. No live control yet; that comes after the renders show which dials are worth having.

## What it is made of

- **Scales, modes, tuning:** none. The model carries pitch inside the latent.
- **Tempo and meter:** none.
- **Structure:** one render per operation.
- **Samples needed:** `pantry/field/` (own recording), `pantry/acoustic/loops/` and `pantry/acoustic/strokes/` (VCSL, CC0), `pantry/machine/` (Sonic Pi, CC0). All are already in `pantry/PROVENANCE.md`.
- **Sample rate:** each model's own (44.1 or 48 kHz). Inputs are resampled on the way in.

## How you will know it worked

Predictions, written before building. "Descriptors" means RMS level in dB and spectral centroid in Hz, each read in 0.5 s windows.

1. **Round trip.** Encoding and decoding an input with no operation keeps the overall RMS level within 6 dB of the input.
2. **Dials.** Across a sweep of ±2 on one dimension, at least three of the first four dimensions each move a descriptor: more than 3 dB of RMS swing, or more than 20% of centroid swing between the sweep's ends.
3. **Stretch.** A 2× stretch gives exactly twice the latent frames, so twice the duration. The median spectral centroid stays within 15% of the unstretched decode — pitch lives in the latent, not in the frame rate.
4. **Meld.** Balance 0 and balance 1 reproduce the two single-source decodes exactly, so a null test leaves silence. At balance 0.5 the median centroid lies between the two sources'.
5. **Bend.** Bending a decoder layer changes the output and stays finite: no NaN, and a peak no more than 6 dB above the unbent decode. *Revised after the first run:* the first version measured against 0 dBFS, but unbent decodes already peak above full scale (+15 dBFS for the percussion model).

## Open questions

- Does a latent between two sources decode cleanly, or as mush? Prediction 4 measures this; listening judges it.
- How many dimensions per model actually do something audible? Prediction 2 sorts that.
- Live control: answered below, under *Live: the vector surfer* — Python decodes and plays, the page sends controls.
- Which decoder layers bend musically, and which only make noise?

## Live: the vector surfer

The renders show that the raw latent dimensions are the weakest control: they mostly move loudness and brightness. The large changes are the model (the voice), a latent mix of sources (half way between two sounds is a new sound, not a crossfade), and time (latent steps of about 45 ms that decode without clicks). The live instrument is built on those.

**The sound.** Four recordings sit at the corners of an XY pad, as on a Prophet VS or Wavestation joystick, but the mix happens in the model's latent space, not in amplitude. The puck surfs between them while the model plays the result.

**The mechanism.** `live.py` decodes blocks of 8192 samples (4 latent steps for most models) and pipes them to `pw-cat`. Per step it moves four playheads, mixes their latent frames by the puck and adds drift; per block it applies the bend and the level. `live.html` is the control surface; it posts control changes to `live.py` and polls its state.

| Control | Range | What it does in latent space | Nearest Engram control |
|---|---|---|---|
| Model | the downloaded models | the voice; the sources are encoded once per model | — |
| Sources A–D | pantry recordings | one recording per pad corner | — |
| XY puck | the pad | bilinear mix of the four sources' latent frames | `Bala` |
| Speed | −2× to 4× | playhead steps per latent step; below 0 plays backwards | `Mult` |
| Freeze | on / off | holds the current step | `Dron` |
| Window | off, 1 to 64 steps | loops the steps behind the playhead | `Fram` |
| Swirl | 0 to 1 | shuffles the steps inside the window, from the seed | `Swir` |
| Drift | 0 to 2 | offset along a seeded random direction, scaled by each dimension's spread in the sources | `Rand` |
| Seed | 1 to 999 | the drift direction and the swirl order | — |
| Bend | 0.8 to 1.2 | scale on the first decoder layer's weights | model bending |
| Trail | record / loop | the puck's recorded path, replayed by the engine | — |
| Level trim | ±12 dB | after a per-source gain that puts each round trip at its input's level | — |

The Engram column uses the meanings inferred in `research/engram/DIGEST.md` §2.3; Engram's own documentation does not define them.

**What it would count as working.** Predictions written before building, with the revisions the first runs forced.

1. **Corner.** With the puck on corner A, the engine's output equals a direct block-wise decode of A's latent, sample for sample. At every other block join, the median sample step is no more than twice the median step at the same samples of a decode in blocks twice as long, which has no join there. *Revised after the first run:* the join step was first compared with the steps inside the blocks. A drum loop whose hits fall on the 0.19 s block grid then reads as clicks (ircam_vintage, 3.0×), although the same samples of the longer-block decode step just as far (0.99×). *Revised during building:* the first form compared against `latent.py`'s whole-file decode at −40 dB. That cannot hold: the decoder's noise synthesizer draws a different random sequence for a different call size. Block-wise and whole-file decodes of one latent agree in timing (lag 0, correlation 0.985–0.999) and differ by as much as two whole-file decodes with different noise seeds.
2. **Level.** With the puck at the pad's centre and the trim at 0 dB, the output RMS is within ±3 dB of the mean RMS of the four inputs. At a corner the per-source gain makes this exact, so the centre is where it is tested.
3. **Real time.** Over 5 minutes with a moving puck, the 99th-percentile decode takes no more than 60% of the block length, on every model (`live.py proof`). A live run into a null sink has no underruns (`live.py check`).
4. **Control delay.** A control change reaches the sink within 0.4 s, measured from the control call to the first louder 10 ms of the sink's monitor (`live.py check`).
