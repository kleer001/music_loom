# RAVE — technique digest

RAVE (Realtime Audio Variational autoEncoder) is IRCAM's neural audio model built for live use. It encodes audio into a few slow-moving latent signals and decodes them back to sound faster than real time on a CPU. This digest records what the papers and tools specify, what the licences permit, and what RAVE adds to the Engram-style instrument in `engram/DIGEST.md`.

Sources, read 2026-10-02, all free to read:

- Caillon, A. & Esling, P., "RAVE: A variational autoencoder for fast and high-quality neural audio synthesis", arXiv:2111.05011v2, 2021 (<https://arxiv.org/abs/2111.05011>). Read in full.
- Caillon, A. & Esling, P., "Streamable neural audio synthesis with non-causal convolutions", arXiv:2204.07064, 2022 (<https://arxiv.org/abs/2204.07064>). The paper is CC BY 4.0. Its abstract and method were read.
- The `acids-ircam/RAVE` repository README, version 2.3 (<https://github.com/acids-ircam/RAVE>), and its `LICENSE` file.
- `torchbend` (<https://github.com/acids-ircam/torchbend>), `nn_tilde` (<https://github.com/acids-ircam/nn_tilde>) and `cached_conv` (<https://github.com/acids-ircam/cached_conv>): READMEs and `LICENSE` files.
- BRAVE: Caspe, Shier, Sandler, Saitis & McPherson, "Designing Neural Synthesizers for Low-Latency Interaction", *Journal of the Audio Engineering Society* (arXiv:2503.11562). The project page and repository README were read, not the paper.
- IRCAM's model list (<https://acids-ircam.github.io/rave_models_download>), the Intelligent Instruments Lab model card (<https://huggingface.co/Intelligent-Instruments-Lab/rave-models>), and the RAVE.js demo page (<https://caillonantoine.github.io/ravejs/>).

## 1. The numbers

Values from the 2021 paper unless another source is named.

| Quantity | Value |
|---|---|
| Sample rate | 48 kHz |
| Multiband split | 16-band PQMF filter bank |
| Encoder | Four strided 1-D convolution blocks; hidden sizes 64, 128, 256, 512; strides 4, 4, 4, 2 |
| Total time compression | 2048 (16 bands × 4 × 4 × 4 × 2) |
| Latent frame rate | About 23 Hz (48,000 / 2048 = 23.4) |
| Full latent width | 128 dimensions |
| Informative latent width | 24 dimensions for the strings model, 16 for the VCTK speech model, at fidelity f = 0.99 |
| Latents with KL divergence above 0.1 | 16 (strings) and 9 (VCTK) |
| Parameters | 17.6 M |
| Training | 3 M steps, 1.5 M per stage; batch 8; Adam, learning rate 10⁻⁴, β = (0.5, 0.9); about 6–7 days on one TITAN V |
| Training data | About 30 h of string recordings (internal), and VCTK speech (about 44 h) |
| Augmentation | Dequantization, random crop, all-pass filters with random coefficients |
| Speed, CPU | 985,000 samples/s, about 20× real time at 48 kHz on "a standard laptop CPU". Without the multiband split, 38,000 samples/s |
| Speed, GPU | 11.7 M samples/s, about 240× real time |
| Listening test, mean opinion score (1–5) | RAVE 3.01, NSynth 2.68, SING 1.15, original recordings 4.21; 33 listeners, mostly audio professionals |
| Latent prior | A WaveNet-style model over the latent: 9 M parameters, 3 s receptive field, 5× real time with the decoder |

The fidelity parameter f sets how many latent dimensions are kept: the smallest number whose singular values sum to at least the fraction f of the total. Lower f gives fewer dimensions and a less exact reconstruction. At f = 0.80 a speech model loses "phonemes or speaker identity".

From the RAVE 2.3 README, the training configurations and the minimum GPU memory each needs:

| Configuration | What it is | Minimum GPU memory |
|---|---|---|
| `v1` | Original continuous model | 8 GB |
| `v2` | "Improved continuous model (faster, higher quality)" | 16 GB |
| `v2_small` | Smaller receptive field, for timbre transfer of stationary signals | 8 GB |
| `v2_nopqmf` | "(experimental) v2 without pqmf in generator (more efficient for bending purposes)" | 16 GB |
| `v3` | Snake activation, Descript discriminator, Adaptive Instance Normalization "for real style transfer" | 32 GB |
| `discrete` | Quantized latent, "similar to SoundStream or EnCodec" | 18 GB |
| `onnx` | "Noiseless v1 configuration for onnx usage" | 6 GB |
| `raspberry` | "Lightweight configuration compatible with realtime RaspberryPi 4 inference" | 5 GB |

`causal` (lower latency) and augmentations (`mute`, `compress`, `gain`, "to improve the model's generalization in low data regimes") combine with any of these.

BRAVE (Caspe et al.) is a low-latency redesign. It removes the noise generator, uses a smaller compression ratio, and trains causally. The project page gives "< 10 ms" latency, "< 3 ms" jitter and 4.9 M parameters.

## 2. The mechanism

**Two-stage training** (paper §3.1):

1. **Representation learning.** Train encoder and decoder as a VAE. The loss is a multiscale spectral distance (STFT magnitudes at several window sizes, hop = window/4) plus β times the KL divergence from a unit Gaussian prior. Magnitude-only loss ignores phase, so the latent does not spend capacity on inaudible phase detail.
2. **Adversarial fine-tuning.** Freeze the encoder. Train only the decoder against a multiscale discriminator with a hinge loss, keeping the spectral distance and adding feature matching. A frozen encoder keeps the latent compact; training it in this stage "results in a dramatically increased estimated latent space dimensionality" (appendix E).

**The decoder** (§4.1, appendix C.2) follows MelGAN: upsampling layers alternate with residual stacks. Three heads read the last hidden layer:

- a multiband waveform (tanh),
- multiplied by a loudness envelope (sigmoid),
- plus filtered noise from a noise synthesizer in the manner of DDSP.

The explicit envelope reduces artefacts in silences, and the noise branch helps noisy material.

**Ordering the latent** (§3.2). Encode a set of examples and take each posterior's mean. Subtract the average, so that collapsed dimensions become zero. Run a singular value decomposition. The right singular vectors give a new basis whose axes are ordered by how much they vary with the input. Keep the first r_f axes, fill the rest with prior noise, and rotate back before decoding. This is principal component analysis on the latent (appendix A). Its result is a short, ordered list of dimensions, each a candidate for one knob.

**Streaming** (2022 paper). A convolutional network trained without causal constraints is made causal after training. Cached padding carries the last frames of each audio buffer into the next, and added delays keep parallel branches aligned. The README warns: export with `--streaming`, or "you will hear clicking artifacts".

**Timbre transfer** (§5.4, appendix F). Feed a model audio unlike its training data, and it re-voices that audio in its own sound. "High-level attributes such as the overall loudness and the fundamental frequency of the harmonic components are kept." Out-of-domain input roughly doubles the KL divergence of the latent from the prior, so there is "no guarantee" that the input lands in a region the model knows.

## 3. The grammar — what a player does with it

- **Encode, change the latent, decode.** In Max/MSP and Pure Data, the `nn~` external exposes `encode` and `decode` separately. The latent arrives as a set of control-rate signals, one per dimension, that "signal processing tools" can work on (RAVE README, "High-level manipulation").
- **One dimension, one control signal.** At about 23 frames per second, each ordered dimension can be offset, scaled, frozen, reversed, driven by an LFO or envelope, or crossfaded with the same dimension from another source.
- **Generate without input.** A prior trained over the latent produces new latent trajectories for the decoder to voice. `nn~` exposes "generation temperature" as an attribute.
- **Transfer style.** `v3` models accept source and target styles through Adaptive Instance Normalization, set as `nn~` attributes.
- **Process files offline.** `rave generate model_path path_1 path_2 --out out_path` batch-processes audio files.

## 4. Analyses — the model sets that exist

| Model set | Models | Licence stated | Notes |
|---|---|---|---|
| IRCAM download page | 10: three trained on the IRCAM Studio OnLine instrument database, MusicNet, ISiS voice, "80h of vintage music", "8h of various percussion recordings", Apollo 11 mission audio, 8 h of darbouka, VCTK | None on the page | Released 2022–2023. Some include a prior. `Darbouka_onnx` is the ONNX build |
| Intelligent Instruments Lab (Hugging Face) | 18: electric guitar, soprano sax, organ, magnetic resonator piano, several voice sets, birds, whales, marine mammals, water, magnets | CC BY-NC 4.0 | Modified RAVE v1 or v3, block size 2048, 44.1 or 48 kHz, 8–22 latent dimensions, causal and exported for streaming |

What generalises: a model's name lists its latent width, such as `_z16`. Community models settle at 8–22 dimensions, close to the paper's 16 and 24.

## 5. Lineage

- **NSynth** (Engel et al., 2017): a WaveNet autoencoder. It is slow, and without a prior its latent cannot be sampled.
- **SING** (Défossez et al., 2018): a fast feed-forward autoencoder with a spectral loss, at lower quality.
- **MelGAN** (Kumar et al., 2019) and **multi-band MelGAN** (Yang et al., 2020): adversarial vocoders. RAVE's decoder and discriminator come from MelGAN, and its PQMF split follows multi-band MelGAN.
- **DDSP** (Engel et al., 2019): the noise synthesizer and multiscale spectral loss. DDSP needs pitch and loudness descriptors; RAVE does not, so it can model polyphonic and unpitched sound.
- **RAVE** (2021), then **streaming RAVE** (2022), then the **RAVE 2.x** configurations, documented in the README, not in a paper.
- **BRAVE** (Caspe et al., JAES): low latency for live instruments.
- **Hosts:** `nn~` for Max/MSP and Pure Data, RAVE VST (IRCAM Forum, beta), rave-supercollider, RAVE.js in the browser, and the Minifusion plugin for BRAVE.
- **Bending:** `torchbend` (Chemla--Romeu-Santos, 2024) traces a PyTorch model with `torch.fx`. It can mask or transform named weights and activations, with worked examples for RAVE and for audiocraft (MusicGen). Its README marks several features unfinished: real-time panels, model-specific interfaces, and scripting for `nn~`.

## 6. Licences

| Item | Licence | Source |
|---|---|---|
| RAVE code (`acids-rave`) | CC BY-NC 4.0 | repository `LICENSE` |
| `nn_tilde` | CC BY-NC 4.0 | repository `LICENSE` |
| `cached_conv` | CC BY-NC 4.0 | repository `LICENSE` |
| BRAVE code | CC BY-NC 4.0 | repository `LICENSE` |
| `torchbend` | MIT | repository `LICENSE` |
| IRCAM pretrained models | Not stated | download page |
| Intelligent Instruments Lab models | CC BY-NC 4.0 | Hugging Face model card |
| The RAVE method | Published in full: architecture in appendix C, losses in §3 | arXiv |

Everything above is free for personal and research use. The CC BY-NC items ask for credit, which a README line gives. `torchbend` is MIT and can be vendored.

## 7. What RAVE adds to the Engram simulacrum

Engram's screen shows no latent-space dials (`engram/DIGEST.md` §2.3). RAVE is built around them. Each row maps an Engram process to a RAVE equivalent. Rows marked "to test" are expectations from the method, not results anyone has published.

| Engram process | RAVE equivalent | Basis |
|---|---|---|
| (none) latent dials | Knobs or an XY pad on the first 2–8 ordered latent dimensions, as offsets on a running latent | Paper §3.2 orders the dimensions; `nn~` shows live latent manipulation |
| `Meld`, `Bala` | Interpolate two sources' latent trajectories frame by frame, then decode | The VAE prior is meant to keep in-between points decodable. To test |
| `Stretch`, `Mult` | Resample the latent trajectory in time — 23 frames per second become 23 / `Mult` — then decode. Pitch lives in the latent, not in the frame rate, so it should hold | To test |
| `Fram`, `Swir` | Cut the latent into windows of N frames, then shuffle or jitter them | Array operations on a 23 Hz signal |
| `G1`, `G2` decoder glitches | Network-bending operations on decoder activations (Broad et al.: ablation, inversion, scaling, threshold, shift, erosion, dilation), through `torchbend` or forward hooks | `v2_nopqmf` exists "for bending purposes" |
| `Gen` from text | A latent prior generates trajectories with a temperature. There is no text input | Paper §5.5; README "Prior" |
| Recording "through latent space" | Timbre transfer: encode any input, decode with a model trained on other material | Paper §5.4 |

**Speed favours live use.** Engram renders every process to a fixed sample. RAVE decodes about 20× faster than real time on a laptop CPU, so the dials can move while the sound plays. That is the "surfing" Engram lacks.

**The models already exist.** IRCAM's 10 and the Intelligent Instruments Lab's 18 cover instruments, voices, percussion, birds, whales, water and more. `acids-rave` loads them in Python, so the processes in the table above can be built and heard without training anything.

**Training a model is optional.** It earns its place only for a sound none of the existing models covers. The paper trained on 30–44 h; IRCAM's percussion model used 8 h, and RAVE 2.3 adds augmentation for small datasets.

**Where it runs.** `acids-rave` and its exported TorchScript models run in Python on a CPU or GPU, which suits a bench tool that renders and measures. In the browser, an ONNX export runs under `onnxruntime-web`, as RAVE.js shows; the `onnx` configuration and the `Darbouka_onnx` model exist for this.

**How it sounded.** `bench/latent_waves` built these processes on 16 pretrained models, offline and live from an XY pad. The engineering held (`bench/latent_waves/RESULTS.md`); by ear, pantry recordings mixed and played through the models came out as atonal, squishy noise, and the bench is parked.

## Gaps

- **RAVE 2.x** (`v2`, `v3`, `discrete`, `raspberry`) is documented only in the README, with no paper. Its speed and quality numbers are not published there.
- **Latency of standard RAVE** in streaming mode was not found as a number. BRAVE's "< 10 ms" comes from its project page; the BRAVE paper was not read.
- **The IRCAM pretrained models** state no licence, and some training sets (for example "80h of vintage music") state no provenance.
- **RAVE.js** does not say which runtime it uses, at what sample rate, or whether it runs in real time.
- **No model was run, heard or measured** for this digest.
