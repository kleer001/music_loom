# Engram model bending — technique digest

Engram is a hardware sampler and groovebox by Thoughtful Things (Evan King). It generates audio with small on-device models and passes recordings through them. This digest covers only those model parts: generation, the neural stretch and meld processes, and the "model bending" controls. It covers the sampler, sequencer and effects only where they frame the model pages.

Sources, all read 2026-10-02:

- **Kickstarter campaign page** — <https://www.kickstarter.com/projects/evmaki/engram-generative-audio-sampler-and-groovebox>. Story text read in full. The campaign video (5 min 22 s) was transcribed locally with Whisper large-v3 (`transcripts/`), and its frames were read.
- **Maker's blog post**, "Engram: Generative audio sampler", dated 2026-02-10 — <https://evanking.io/posts/engram/>. Five demo videos read frame by frame: `overview`, `unconditioned`, `conditioned`, `bending_1`, `bending_2`, under `/images/mirage/`.
- **Product page** — <https://engram.audio>, which redirects to <https://thoughtfulthings.ai/things/engram/>.
- **YouTube channel** — <https://www.youtube.com/@thoughtful.things>: one unedited 7 min 50 s session and twelve Shorts, dated 2026-03-31 to 2026-09-28. Descriptions read. Speech transcribed with Whisper. The OLED screen was cropped and enlarged from frames every 2–5 s.
- **Press** — The Verge, 2026-09-27; Gearnews; MusicRadar. None of them adds a technical detail beyond the sources above.

`screens/` holds the screen frames that show each control named below. `screens/README.md` lists where each one comes from.

Three builds appear in the sources. The February 2026 blog unit carries a "mirage" badge on its panel, and the blog calls it "the second revision of the Engram hardware". The March–April 2026 units carry the "engram" badge. The campaign describes a retail build still to come. Controls changed between builds, so each control below carries the date of the build that shows it.

## 1. The numbers

### 1.1 The panel (April 2026 build)

| Panel item | What the panel shows |
|---|---|
| Top row of knobs | `MAIN`, `TEMPO`, `GAIN`, `PAN` |
| Bottom row of knobs | `A`, `B`, `C`, `D`. These have no fixed job. The screen labels them per page |
| Encoder | `MENU` |
| Buttons, top row | `GEN`, `←`, `→`, `TAP` |
| Buttons, bottom row | `SHIFT`, `MODE`, record (●), play (▶) |
| Pads | 16, in two rows of eight |
| Screen | Monochrome OLED, a four-character label above each value |
| Rear panel | USB, CV sync in and out, MIDI in and out, `LINE-IN`, headphones. An on-board microphone sits behind a grille beside the screen |

The screen header gives the tempo, the page name, and a channel id. Channel ids `1A` to `7A` and `1B` were seen. The page names seen are `Play`, `Step`, `Gen`, `Stretch`, `Meld`, and, in the March build only, `Arrange`.

### 1.2 The model pages

Each row is one screen page. "A" to "D" are the four context knobs, left to right.

| Build | Page | Knob A | Knob B | Knob C | Knob D | Where it appears |
|---|---|---|---|---|---|---|
| Feb 2026 | Generate (prompt text at the top) | `Len` 50 → 109 | `G1` 0 → 79 | `G2` 0 | `–` (unused) | blog `bending_2.mp4` 0:06–0:15; `bending_1.mp4` 0:08–0:16 |
| Apr 2026 | `Gen` | `Rand` 0 | `Dron` 0 | `Guid` 50 → 61 | `Lens` 50 | session `Wpco4jWXGzI` 2:15–2:20; Short `WZdWujDQnuY` 0:00 |
| Sep 2026 | `Gen`, prompt "Coral Reef." | `Rand` 0 | `Dron` 0 | `Guid` (value not legible) | `Lens` 50 | campaign video, about 2:06 |
| Apr 2026 | `Stretch` | `Mult` 1.2x | `Fram` 2 → 10 | `Swir` 0 → 24 | — | session 0:30–0:35 |
| Apr 2026 | `Stretch` | `Mult` 2.0x | `Fram` 5 (partly hidden) | `Swir` 0 | — | Short `gcDJevgaFqM` 0:18 |
| Apr 2026 | `Meld` | `Bala` 50 | — | — | — | Short `uFLsgROB9qE` 0:30 |
| Apr 2026 | `Meld` | `Bala` 52 (partly hidden) | — | — | — | Short `dAkvECl7QMw` 0:30 |

The fourth `Gen` label reads `Lens` in the pixel font, but the last glyph may be a `g`. The February build put a control named `Len` in the same slot, and its value rose from 50 to 109 while the maker generated.

While a generate, stretch or meld runs, the screen shows a cloud of moving dots (`screens/2026-04_processing_dots.png`). The session video is unedited, so it bounds two run times. A stretch of a field recording of at least 13.3 s ran between 10 and 20 s: the stretch page was on screen at 0:35, the dots at 0:40–0:50, and the result at 0:55. A generate ran for at most about 10 s: the page at 2:20, the dots at 2:25, and the result at 2:30.

The `Gen` page sometimes shows a line of scrambled glyphs where the prompt text appears, for example `Te f° fs t`. This happened in the session, where the description says the maker "generate[s] an abstract audio clip". What the glyphs mean is not stated.

### 1.3 The other pages

These pages are not model controls. They are listed because a generated sample lands on them next.

| Page | Knob A | Knob B | Knob C | Knob D |
|---|---|---|---|---|
| Sample (`Play` or `Step`, waveform view) | `Star` 0–100 | `End` 0–100 | `Pitc`, −10 to +24 seen | — |
| Amplitude envelope | `Atta` | `Deca` | `Sust` | `Rele` |
| `Filter` | `Cuto` | `Reso` | `Type` (`LP`) | — |
| Reverb | `Wet` | `Size` | `Damp` | `Deca` |
| `Delay` | `Wet` | `Time` | `Feed` | — |

`Star` and `End` are percentages of the sample. `Pitc` is in semitones: values −10, −7, 12, 13 and 24 all appear.

## 2. The mechanism

### 2.1 What the maker states

From the blog post (2026-02-10), about the February build:

> Users prompt the Engram via a voice interface, powered by Moonshine.

> I've accomplished this tweakability – and high performance despite resource constraints – by hand-rolling embedded inference code for the MusicGen models that the Engram uses for sample generation.

> I developed some interesting ways to glitch the model's audio decoder while building the Engram's embedded audio generation. Each of these model bending parameters has a knob attached.

The blog names three generation modes: "blank-slate generation" from a prompt into an empty channel; "guided generation", which "build[s] off of existing sounds using your text prompt as a guide"; and model bending.

From the campaign video (Whisper transcript; Whisper writes "Engram" as "Ngram"):

> [Engram]'s model bending algorithms lets you glitch and manipulate audio as it moves into and out of latent space.

From the YouTube descriptions and speech:

- Session `Wpco4jWXGzI`: "use the embedded neural audio codec to warp and stretch it into an ambient pad".
- Short `uFLsgROB9qE`: "Neural melding swirls your samples together in latent space, then turns them back into audio." Spoken: "use the models on the [Engram] to interleave and warp them and like blend them into each other".
- Short `u9oWEkl9jfE`: "filter recordings through the latent space of audio models".

From the campaign page:

- "It uses our hand-designed tiny AI runtime to generate sound from our own custom-trained embedded audio models." No connection, app or subscription is needed.
- "These models generate short bursts of sound that you can sample."
- Models are pluggable, "just like old-school ROMpler cartridges", and users can train their own.
- Training data: "open datasets that only contain audio licensed for commercial use (CC-BY or similar)".
- The product page adds that the models are small enough to train "on computers like gaming PCs".

### 2.2 The signal path, as inferred

The maker does not draw a diagram. The statements above fit two paths through one neural audio codec:

```
voice ──► speech-to-text (Moonshine) ──► text ──► token model ──► codec decoder ──► sample
                                                   (MusicGen-type)   ▲ bending (G1, G2)

recording ──► codec encoder ──► latent frames ──► Stretch / Meld ──► codec decoder ──► sample
```

This is an inference, not a stated design. Its supports:

- **MusicGen's structure.** MusicGen is an autoregressive transformer over the tokens of an EnCodec codec: 32 kHz, 4 codebooks, 50 frames per second (`facebook/musicgen-large` model card). Its audio comes out of the codec's decoder, which is the part the maker says he glitches.
- **The codec phrases.** "Into and out of latent space" and "embedded neural audio codec" both describe an encoder and decoder around a manipulation.
- **The shared animation.** Stretch, Meld and Gen all show the same processing animation, which fits one model doing all three.

The February build used MusicGen. The public MusicGen weights are licensed CC BY-NC 4.0 (same model card). The campaign states that the shipping models are custom-trained on data cleared for commercial use. The shipping model therefore cannot be the public MusicGen checkpoint. Whether it keeps MusicGen's architecture is not stated.

### 2.3 What each control probably does

Every row is a hypothesis. "Basis" says what supports it. Strength is a judgement: strong means the name and a documented mechanism agree, and weak means only the name points that way.

| Control | Probable function | Basis | Strength |
|---|---|---|---|
| `Guid` | Classifier-free guidance scale | MusicGen samples with classifier-free guidance. Hugging Face's MusicGen docs: "Higher guidance scale encourages the model to generate samples that are more closely linked to the input prompt, usually at the expense of poorer audio quality … use guidance_scale=3 (default)." Engram shows 50 → 61 on a 0–100 knob, so the knob is scaled | Strong |
| `Len`, `Lens` | Generation length | The name; the February value moved 50 → 109 | Strong |
| `Rand` | Sampling randomness, such as temperature or top-k | The name; MusicGen samples tokens with `do_sample=True` | Moderate |
| `Dron` | Unknown. One reading: holds or repeats a stretch of frames into a drone | The name only | Weak |
| `G1`, `G2` | Two decoder glitches | The maker: "glitch the model's audio decoder … each of these model bending parameters has a knob attached". Which operation each applies is not stated | Function strong; operation unknown |
| `Mult` | Stretch factor | Displayed with an "x" suffix: 1.2x, 2.0x | Strong |
| `Fram` | Window size in latent frames — how many frames move as one unit, like a grain | The name; integer values 2, 5, 10; the maker's earlier Mishearings project used grain size and playback rate as its two controls (section 5) | Moderate |
| `Swir` | Disorder: how far frames or windows are shuffled or jittered | The name; the Meld description uses "swirls" for the same latent-space mixing | Weak |
| `Bala` | Mix balance between the two meld sources | The name; default 50 | Strong for the meaning; the mix method is not stated, though the maker says "interleave" |

Two observed behaviours shape the design. **Stretch writes in place:** the screen asks "This will overwrite the sample in channel 4. Continue?" before it runs (Short `gcDJevgaFqM`, 0:20). **Meld writes elsewhere:** in Shorts `uFLsgROB9qE` and `dAkvECl7QMw`, the two sources sat in channels 1A and 4A and the result landed in 5A.

## 3. The grammar

The model pages feed an ordinary sampler. The maker's own summary of the unedited session:

> I take a field recording, use the embedded neural audio codec to warp and stretch it into an ambient pad, then generate an abstract audio clip to slice and arrange into a four bar pattern.

The session shows this order on screen:

1. Record a field recording of at least 13.3 s into a channel (`Play` page, length counter).
2. `Stretch` it: `Mult` 1.2x, `Fram` 2 → 10, `Swir` 0 → 24.
3. Trim with `Star`/`End`, shape with the envelope, lower the tempo from 120 to 55–65.
4. `Gen` into a new channel: `Guid` 50 → 61.
5. Detune with `Pitc` (−2 to −10), then sequence the result on the `Step` page.
6. Add reverb and delay.

The Shorts repeat two patterns:

- **Meld two sources.** Generate or record two sounds, then meld them into a third channel. Pairs seen: a one-shot with a recorded Deluge chord, birds with woodwinds, "Deep House" with "Ambient Drone".
- **Stretch one source.** Record a short instrumental phrase, then stretch it 2x into a pad.

Every model output is a fixed sample, not a live stream. The bending happens at render time, and the knobs are set before a run. No video shows a knob that changes the model output during playback.

## 4. Analyses

| Video | Date | Build | What it shows |
|---|---|---|---|
| blog `bending_2.mp4` | 2026-02 | mirage | Voice prompt "Delicate piano music." `Len` set to 109 and `G1` swept 0 → 79 before the run |
| blog `bending_1.mp4` | 2026-02 | mirage | Voice prompt "Choir music." Generated, then sliced and played at 117–124 BPM. An unlabelled value box, probably pitch, ranges from −32 to +29 |
| `rStpfekW9So` | 2026-03-31 | engram (March UI) | "Turning an audio hallucination into a beat": the `Step` and `Arrange` pages, filter, reverb, delay. No model page appears in the frames read |
| `u9oWEkl9jfE` | 2026-04-02 | engram | "Filter recordings through the latent space": a processed recording, then delay |
| `Wpco4jWXGzI` | 2026-04-03 | engram | The unedited session in section 3. The only source for run times |
| `uFLsgROB9qE` | 2026-04-04 | engram | `Meld`, `Bala` 50, sources 1A and 4A into 5A |
| `dAkvECl7QMw` | 2026-04-08 | engram | `Meld`, `Bala` 52: field-recorded birds with Deluge woodwind chords |
| `gcDJevgaFqM` | 2026-04-13 | engram | `Stretch` 2.0x on a 3.9 s flute phrase; overwrite dialog |
| `WZdWujDQnuY` | 2026-04-15 | engram | `Gen` page: `Rand` 0, `Dron` 0, `Guid` 50, `Lens` 50 |
| `NFeSwz7FsFw` | 2026-04-17 | engram | "Speak to generate" prompt screen; the maker says "Deep House" and then "Ambient Drone", and blends the two |
| campaign video | 2026-09 | engram | Voice prompt "piano"; `Gen` page with "Coral Reef."; a slide reading "model bending — like circuit bending for neural networks" |

What generalises:

- The bend is a **render-time setting**, not a live modulation.
- Every model process **writes a sample** that the sampler then treats like any recording.
- Each page has **at most four knobs**. Generate has four, stretch three, meld one.

## 5. Lineage

- **Circuit bending.** The maker cites it by name and links its Wikipedia article (<https://en.wikipedia.org/wiki/Circuit_bending>). It means rewiring consumer electronics for sounds the designers did not intend.
- **Network bending.** Broad, Leymarie and Grierson, "Network Bending: Expressive Manipulation of Deep Generative Models", EvoMUSART 2021 (<https://arxiv.org/abs/2005.12420>). They insert transformation layers into a trained generator's computational graph at inference time. Each layer acts on activation maps, which the paper treats as 1-channel images in the range −1 to 1:
  - numerical — "ablation … f(x) = x · 0", "inversion … f(x) = 1 − x", "multiplication by a scalar p", and "binary thresholding … with threshold t";
  - affine — horizontal and vertical reflection, translation by (px, py), scaling by (kx, ky), rotation by θ;
  - morphological — "erosion and dilation" with a circular kernel of radius r.

  A layer applies to all features in a layer, to a random percentage of them, or to clusters found by grouping similar activation maps. The examples are image GANs. The authors name audio synthesis as a target and cite the next entry.
- **Network bending of neural vocoders.** McCallum and Yee-King, NeurIPS 2020 Workshop on Machine Learning for Creativity and Design (<https://research.gold.ac.uk/id/eprint/29652/>). They apply network bending to DDSP synthesis networks. The public record does not list the transformations used.
- **Network bending with audio-driven parameters.** Dzwonczyk, Cella and Ban, DAFx 2024 (<https://arxiv.org/abs/2406.19589>), extended in JAES, June 2025. They bend Stable Diffusion with audio features as operator parameters. The bent model makes images, not sound.
- **The maker's background.** His CV (<https://evanking.io/cv/>, dated 2026-08-19) lists a PhD in Electrical and Computer Engineering from UT Austin, 2021–2024, advised by Christine Julien. The dissertation is "Continuous discovery and goal-oriented control of smart devices in mobile environments" (Texas ScholarWorks, 2024-12). It covers neighbour discovery and language-model control of smart devices, not audio. His papers follow the same line. From 2023 to 2026 he was an applied scientist at Moonshine AI and a core contributor to the Moonshine speech-recognition models — the models that take Engram's voice prompts.
- **Mishearings, 2025** (<https://evanking.io/posts/mishearings/>). His nearest earlier project bends a model through its input. A synthesised formant voice failed to make the Moonshine model transcribe anything. Granular synthesis on recorded speech succeeded, with the cursor setting "the grain size" and "the playback rate". These are the same two dimensions as Engram's `Fram` and `Mult`.
- **Engram, 2026.** The maker's blog says that his earlier work drew sounds from audio models by mangling their inputs. The campaign calls Engram "the first musical device to run generative audio models directly on the hardware". That is the maker's own claim and was not checked.

## 6. What a simulacrum would rest on

This section moves from Engram to the studio. It names open parts that can do each job. It does not claim that Engram uses them. `rave.md` adds a second route: a model built for live latent control.

**A codec with an encoder and a decoder.** Stretch, Meld and decoder bending all need one. Candidates:

| Codec | Sample rate | Notes | Source |
|---|---|---|---|
| Descript Audio Codec (DAC) | 44.1 kHz; 24 and 16 kHz variants | "Weights are released as part of this repo under MIT license" | <https://github.com/descriptinc/descript-audio-codec> |
| SNAC | 44 kHz | Mono; "primarily trained on music data"; 2.6 kbps | `research/hf_audio_models/SURVEY.md` §4.5 |
| KVAE-Audio | 48 kHz | Continuous latents rather than tokens | `research/hf_audio_models/SURVEY.md` §4.5 |

**Latent-frame operations for Stretch and Meld.** These are array operations on a frames × channels latent and need no new model:

- repeat or interpolate frames to stretch;
- move windows of `Fram` frames as one unit;
- shuffle or jitter windows by an amount (`Swir`);
- interpolate or interleave two latents (`Bala`).

**Decoder bending for G1 and G2.** Broad et al.'s catalogue gives operations on a 1-D convolutional decoder's activations: ablation, inversion, scalar multiplication, thresholding, translation along time, scaling along time, and erosion or dilation. Each is set by one number — a knob.

**Generation from text** needs a token model. The open MusicGen checkpoints do this, which reproduces the February build's path, and its decoder is the part to bend. Stretch, Meld and the "filter through latent space" demo need no generator at all: they bend the decoding of recordings.

**Where it runs.** All three codecs are PyTorch models. The house stack has no neural runtime. Three routes exist:

- a Python bench tool that renders bent samples offline, which keeps instruments at zero runtime dependencies;
- an ONNX export run in the browser through `onnxruntime-web`, which adds a runtime dependency;
- hand-written decoder inference in JavaScript, which is the route Engram's maker took on embedded hardware.

## Gaps

- **Kickstarter FAQ and the Gearspace thread** were read on 2026-10-02 and add no technical detail. The FAQ's four answers cover "tiny AI", training data and an intent to open the firmware and allow user-trained models later. The Gearspace thread reposts the product page and holds no reply from the maker. The campaign's comments tab (7 comments) was not read.
- **Instagram** (`@thoughtful.audio`) was not read.
- **The processor.** No source names the hardware platform, processor or memory. The maker's GitHub account holds a fork of Circle, a bare-metal C++ environment for the Raspberry Pi, created 2026-08-25. The fork has no commits of its own, so it is a hint at most.
- **The EE Times "Silicon Grapevine" appearance** (February 2026) is listed on the CV. Its listing describes edge models at Moonshine AI. It was not found in the EE Times podcast feed and was not heard.
- **The shipping models.** Architecture, codec, sample rate, latent frame rate and the longest generation are not stated. The MusicGen statement covers the February build only.
- **The exact operations** behind `Rand`, `Dron`, `Fram`, `Swir`, `G1` and `G2` are not stated. Section 2.3 is inference.
- **Whether `G1` and `G2` survive** in the April build is unclear. The April `Gen` page has `Rand` and `Dron` where `G1` and `G2` sat. They may be the renamed bending controls, or the bending may have moved to a page that no video shows.
- **The scrambled `Gen` text.** Its meaning is unknown.
- **Run times** come from frames sampled 5 s apart, so they are bounds, not measurements.
- **The training datasets** are described only as "open datasets … CC-BY or similar". None is named.
- **The Whisper transcripts** are machine output. Quoted lines were checked against the audio only where the screen or a caption confirmed them.
