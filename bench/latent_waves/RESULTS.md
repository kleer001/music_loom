# Results — the five predictions across 16 models

Run on 2026-10-02 with

```sh
.venv/bin/python latent.py proof MODEL ../../pantry/machine/loop_compus.flac ../../pantry/field/field_2026-09-11_0858.wav
```

A is a 6.5 s drum loop (Sonic Pi, CC0). B is a 60.6 s field recording (own work). The predictions are the ones in `SPEC-SHEET.md`. Encodes and decodes are seeded and start from the model's load-time state, so each run gives the same numbers.

| Model | Latent dims | Frames/s | Round-trip level | Dims that move (of 4) | Centroid after 2× stretch | Predictions 1–5 |
|---|---|---|---|---|---|---|
| iil_birds_dawnchorus | 8 | 93.75 | −5.0 dB | 3 | −1% | ✓✓✓✗✓ |
| iil_guitar | 16 | 23.44 | +0.4 dB | 3 | +29% | ✓✓✗✓✓ |
| iil_humpbacks_pondbrain | 20 | 23.44 | −2.7 dB | 4 | −7% | ✓✓✓✓✓ |
| iil_magnets | 8 | 23.44 | −11.3 dB | 3 | −13% | ✗✓✓✓✗ |
| iil_organ_bach | 16 | 23.44 | −2.9 dB | 4 | −1% | ✓✓✓✓✗ |
| iil_water_pondbrain | 16 | 23.44 | −1.3 dB | 4 | +9% | ✓✓✓✓✓ |
| ircam_darbouka_onnx | 4 | 21.53 | −3.4 dB | 4 | +38% | ✓✓✗✓✓ |
| ircam_isis | 8 | 21.53 | −4.0 dB | 4 | −7% | ✓✓✓✗✓ |
| ircam_musicnet | 16 | 21.53 | −12.4 dB | 4 | −7% | ✗✓✓✓✓ |
| ircam_nasa | 8 | 23.44 | +18.9 dB | 1 | +46% | ✗✗✗✓✓ |
| ircam_percussion | 4 | 21.53 | +8.4 dB | 4 | −19% | ✗✓✗✓✗ |
| ircam_sol_full | 8 | 21.53 | −0.7 dB | 3 | −5% | ✓✓✓✓✓ |
| ircam_sol_ordinario_fast | 8 | 86.13 | −26.0 dB | 4 | −21% | ✗✓✗✓✓ |
| ircam_sol_ordinario | 4 | 21.53 | +22.0 dB | 4 | −7% | ✗✓✓✓✓ |
| ircam_VCTK | 8 | 23.44 | −4.7 dB | 4 | −4% | ✓✓✓✓✗ |
| ircam_vintage | 16 | 21.53 | +7.4 dB | 4 | +2% | ✗✓✓✓✓ |

61 of 80 predictions hold. Three models pass all five: humpbacks, water and sol_full.

## What the failures say

- **Prediction 1, round trip (7 fail).** A model renders at the loudness of its training data, not of its input: from −26.0 dB (sol_ordinario_fast) to +22.0 dB (sol_ordinario). Level matching belongs after the decoder.
- **Prediction 2, dials (1 fails).** 15 of 16 models have at least three of their first four dimensions acting as audible knobs. Nasa moves one of four.
- **Prediction 3, stretch (5 fail).** Pitch and brightness mostly hold under a 2× latent stretch; in 11 models the centroid stays within 15%. Nasa (+46%), darbouka (+38%) and guitar (+29%) brighten; sol_ordinario_fast (−21%) and percussion (−19%) darken.
- **Prediction 4, meld (2 fail).** The balance ends null exactly in all 16 models, so the mixing is correct. In birds and isis the half-way meld is darker than both sources: a mix in latent space is a new sound, not a crossfade of the two spectra.
- **Prediction 5, bend (4 fail).** Scaling the first decoder layer's weights by 1.5 raises the peak by 6.6–10.5 dB in four models, past the 6 dB bound. The bend is strong at that layer; the amount needs a smaller range there.

## How much the seed matters

Seed 1 is one draw from each encoder's posterior. Results near a threshold move with the draw: between an unseeded run and this one, the dimensions that move in nasa went from four of four to one, and darbouka's meld went from failing to passing. A count in this table says what one draw does, not what every draw does.

# Live — the vector surfer's four predictions across 16 models

Run on 2026-10-02 with

```sh
.venv/bin/python live.py proof MODEL    # predictions 1–3, offline, 300 s for prediction 3
.venv/bin/python live.py check MODEL    # 30 s live into a null sink, then 10 timed starts
```

Sources: the four in `live.py`'s `DEFAULTS` (drum loop, field recording, VCSL C4 loop, synth loop). Predictions are the ones under *Live: the vector surfer* in `SPEC-SHEET.md`.

| Model | Join step vs no join | Centre level vs inputs | Decode, 99th percentile (offline / live) | Underruns in 30 s | Control delay, median / max | Predictions 1–4 |
|---|---|---|---|---|---|---|
| iil_birds_dawnchorus | 1.03× | −0.4 dB | 21% / 22% | 0 | 189 / 252 ms | ✓✓✓✓ |
| iil_guitar | 0.66× | −4.8 dB | 42% / 61% | 0 | 268 / 339 ms | ✓✗✓✓ |
| iil_humpbacks_pondbrain | 2.11× | +1.6 dB | 27% / 40% | 0 | 259 / 322 ms | ✗✓✓✓ |
| iil_magnets | 1.14× | +0.5 dB | 9% / 17% | 0 | 189 / 252 ms | ✓✓✓✓ |
| iil_organ_bach | 1.05× | −2.0 dB | 41% / 59% | 0 | 289 / 355 ms | ✓✓✓✓ |
| iil_water_pondbrain | 1.00× | +2.0 dB | 27% / 40% | 0 | 225 / 332 ms | ✓✓✓✓ |
| ircam_darbouka_onnx | 0.29× | −4.7 dB | 9% / 14% | 0 | 176 / 243 ms | ✓✗✓✓ |
| ircam_isis | 0.87× | −3.1 dB | 40% / 53% | 0 | 288 / 363 ms | ✓✗✓✓ |
| ircam_musicnet | 0.96× | −5.7 dB | 43% / 54% | 0 | 278 / 377 ms | ✓✗✓✓ |
| ircam_nasa | 1.03× | +12.6 dB | 50% / 45% | 0 | 245 / 306 ms | ✓✗✓✓ |
| ircam_percussion | 0.67× | +2.4 dB | 14% / 22% | 0 | 231 / 322 ms | ✓✓✓✓ |
| ircam_sol_full | 0.99× | −0.2 dB | 38% / 54% | 0 | 298 / 386 ms | ✓✓✓✓ |
| ircam_sol_ordinario_fast | 0.92× | +3.4 dB | 10% / 14% | 0 | 190 / 286 ms | ✓✗✓✓ |
| ircam_sol_ordinario | 1.09× | +16.2 dB | 41% / 53% | 0 | 289 / 388 ms | ✓✗✓✓ |
| ircam_VCTK | 0.60× | +2.3 dB | 17% / 26% | 0 | 188 / 252 ms | ✓✓✓✓ |
| ircam_vintage | 0.99× | +12.9 dB | 50% / 57% | 0 | 287 / 357 ms | ✓✗✓✓ |

55 of 64 predictions hold. Seven models pass all four.

- **Prediction 1, corner (1 fails).** In all 16 models the engine's output at corner A equals a direct block-wise decode of A's latent, sample for sample, so the playheads, mix, gain and block loop add nothing. Humpbacks fails the join half: its median step at a block join is 2.1× the step at the same sample with no join. On the drum loop that is a step of about 0.0008 against 0.0004 of full scale, at the loop's quiet points; on the field recording the two are equal. The other 15 models are within 0.3–1.1×.
- **Prediction 2, level (8 fail).** The per-source gain is exact at a corner but does not predict the loudness of a mix: at the pad's centre the output is −5.7 to +16.2 dB from the inputs' mean. The three largest misses (sol_ordinario +16.2, vintage +12.9, nasa +12.6 dB) are models whose round trip is also far above the input (+22.0, +7.4, +18.9 dB), but sol_ordinario_fast, the furthest below (−26.0 dB), misses by only +3.4 dB. The level trim covers ±12 dB.
- **Prediction 3, real time (none fail).** Offline, the 99th-percentile decode takes 9–50% of the block. Live, with the HTTP server and the writer thread running beside it, it takes 14–61%, and no model underran in 30 s.
- **Prediction 4, control delay (none fail).** From the play control to sound in the sink: median 176–298 ms, max 243–388 ms. The delay follows the decode cost: the cheapest models (darbouka, magnets, birds, VCTK, sol_ordinario_fast) answer in under 0.2 s, the dearest (sol_full, organ, isis, vintage) in about 0.3 s.
