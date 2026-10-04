# Generative audio models on Hugging Face — survey

Which open-weight audio generators on the Hugging Face Hub are worth the studio's attention, what each one makes, and what each needs to run. The studio's work is non-commercial research, and every model below may be used for it.

Sources: model cards, licence files and Hub listings read on 2026-10-02, and the primary GitHub repositories where a card is silent. Gated Stability AI cards were read from their public model pages. Licences were read in the licence file, not taken from the Hub's `license` field, because re-uploads relabel (section 2.7). The listing data behind every count and share here is in `snapshot/`. Nothing here was rendered, listened to or measured; every quality claim below is the publisher's own.

## Short answer

| Want | Best fit | Why this one |
|---|---|---|
| Loops, one-shots, playable sampler instruments | **Foundation-1** (Stable Audio Open fine-tune) | Takes BPM, bar count and key in the prompt; its Keybeds checkpoint builds pitched multi-sample instruments |
| Instrumental beds and textures, up to six minutes | **Stable Audio 3** small-music (CPU) or medium (GPU) | Small runs without a GPU; medium reaches 380 s |
| Full songs with vocals, highest claimed quality | **YuE2** | Plans each song as an editable ABC score before it renders; 48 kHz stereo on a 24 GB GPU |
| Full songs with vocals, plus stem tools | **ACE-Step 1.5** | Pulls one stem out of a mix, or generates a new stem against existing audio |
| Full songs, a second voice | **MiniMax Music 3** | Long, structured songs up to 5 min. Output published publicly must be labelled machine-generated |
| Live, playable generation | **Magenta RealTime 2** | Steered by text, audio and MIDI at about 200 ms latency; real time only on Apple Silicon |
| Sound effects | **Stable Audio 3 small-sfx**, **MOSS-SoundEffect v2.0** | Runs on a CPU; 48 kHz up to 30 s |
| Restyle an existing song | **MuLaCover**, YuE2 cover mode | Keep a song's melody and lyrics, change its style |
| Audio to MIDI | **basic-pitch** | Polyphonic, with pitch bends, and an npm package |

None of them runs on the house stack. All are Python on PyTorch, JAX or MLX, and most want a GPU. Their place in the studio is upstream of an instrument: they make audio offline, and the audio enters `pantry/` with a provenance row like any other recording. Section 5 covers the routes.

## 1. What the five tags hold

The five tags were `sample-generation`, `music-generation`, `stable-audio`, `audio` and `Audio-to-Audio`.

| Tag | Models | Ports and quantisations | Downloads, last 30 days | What fills it |
|---|---|---|---|---|
| `sample-generation` | 5 | 0 | 10 | Five Stable Audio Open 1.0 fine-tunes, Foundation-1 among them |
| `stable-audio` | 44 | 24 | 868 | ONNX, CoreML, MLX and ExecuTorch ports of Stable Audio 3 and Stable Audio Open; research steering vectors |
| `music-generation` | 362 | 123 | 2,506,192 | GGUF re-uploads of three base models |
| `Audio-to-Audio` | 14 | 0 | 1,624 | RVC voice-conversion models and Xiaomi MiMo-Audio |
| `audio` | more than 1,000 | — | — | Speech. Of the top 1,000 by downloads, 490 are speech recognition, 72 text-to-speech, 58 audio classification, and 26 text-to-audio |

Four things the listings show:

**The tags miss the base models.** Tags are applied by whoever uploads. No `stabilityai/` model carries the `stable-audio` tag. ACE-Step 1.5, MusicGen, Stable Audio 3, Magenta RealTime 2 and HeartMuLa are all absent from `music-generation`. The survey therefore also read the `text-to-audio` pipeline (top 400 by likes and by downloads) and the `audio-to-audio` pipeline (top 400 by likes). Most of the models below were found there, not in the five tags.

**Downloads count re-uploads.** In `music-generation`, ports and quantisations take 98% of 30-day downloads. YuE2, MiniMax Music 3 and ACE-Step, with their re-uploads, take 99.4%. The single most-downloaded entry is a GGUF bundle of YuE2 with 1.1 million downloads in 30 days; the original repository has 31,618.

**Downloads miss checkpoint-only repositories.** Foundation-1 reports 0 downloads, 30-day and all-time, against 374 likes. Its two siblings by the same author also read 0. Likes ranked the field better than downloads did.

**`Audio-to-Audio` is not the `audio-to-audio` pipeline.** The capitalised tag is free text and holds 14 models. The pipeline is a separate field and holds speech codecs, speech enhancement and speech-to-speech chat models, with music a small minority.

## 2. Licence classes

This section is reference. Every licence below permits personal and research use. Three terms still ask something of that use:

- **Attribution.** CC BY and CC BY-NC weights ask for credit, which a README line gives.
- **MiniMax Music 3.** Output published in public must carry a machine-generated label (2.3).
- **HunyuanVideo-Foley.** The licence excludes the EU, the UK and South Korea (2.5).

### 2.1 Permissive

MIT, Apache 2.0, or CC BY 4.0. Commercial use permitted. CC BY 4.0 asks for attribution of the licensed material.

- **MIT:** ACE-Step 1.5 (weights and code), SNAC, BigVGAN v2, KVAE-Audio. Stable Audio 3's inference code is MIT; its weights are not (2.2).
- **Apache 2.0:** HeartMuLa-oss-3B, MOSS-SoundEffect v2.0, SonicMaster, TIGER, basic-pitch.
- **CC BY 4.0:** Magenta RealTime 2 weights (code Apache 2.0), AnyAccomp. Magenta's card adds: "Google claims no rights in outputs you generate using Magenta RealTime 2."

### 2.2 Stability AI Community Licence

Text last updated 2024-07-05, read from the licence file in `stabilityai/SAME-L`. It covers Stable Audio Open 1.0 and Small, Stable Audio 3 small and medium, the SAME autoencoders, and every fine-tune of them — Foundation-1, RC_Infinite_Pianos and Audialab EDM Elements among them.

- Research and non-commercial use: free.
- Commercial use: free while the user and affiliates earn under US $1,000,000 a year. Commercial use requires registration at <https://stability.ai/community-license>. Above the threshold, an enterprise licence.
- Outputs: "You own any outputs generated from the Models or Derivative Works to the extent permitted by applicable law." The definition of Derivative Work ends: "but do not include the output of any Model."
- Attribution: distributing the model, a derivative, "or a product or service that uses any portion of them" requires a `Notice` file with the stated line and a prominent "Powered by Stability AI". Because outputs are not Derivative Works, shipping a generated sample is not distributing the model. A tool that runs the model is.
- No use of the model or its outputs "to create or improve any foundational generative AI model".

### 2.3 MiniMax-Music3 Community Licence

Read from the `LICENSE` file in `MiniMaxAI/MiniMax-Music3`. The grant is MIT-shaped, with conditions:

- A commercial product or service that uses the model must "prominently display 'MiniMax-Music3' on the user interface".
- Above US $20 million aggregate yearly revenue, prior written authorisation from MiniMax.
- A service that lets third parties generate with the model must maintain safeguards against infringing use.
- The acceptable-use policy, item 11, forbids publishing generated content "in or to any public environment … without clearly and prominently disclosing that such information and/or content is machine-generated". The policy is dated August 2026, and MiniMax reserves the right to revise it.
- The licence does not address who owns outputs.

### 2.4 Non-commercial

CC BY-NC 4.0 defines NonCommercial as "not primarily intended for or directed towards commercial advantage or monetary compensation" (Section 1).

- **CC BY-NC 4.0 weights:** YuE2, every MusicGen and MAGNeT checkpoint (code MIT), AudioX, Woosh, MIDI-GPT.
- **MuLaCover:** CC BY-NC 4.0 plus a model licence that extends the restriction to outputs: "Outputs generated using the official weights are restricted to noncommercial" use.
- **JAM-0.5:** "Commercial use of JAM or its outputs is strictly prohibited", stacked on the Stability licence.
- **TangoFlux:** "for non-commercial research use only", stacked on the Stability licence and on its training sets' licences.

The studio's use is non-commercial, so these models are usable here on the same footing as the rest.

### 2.5 Tencent Hunyuan Community Licence

HunyuanVideo-Foley. The licence "does not apply in the European Union, United Kingdom and South Korea". Outputs may not be used "to improve any other AI model", and may not be used or displayed outside the licensed territory.

### 2.6 CreativeML OpenRAIL-M

Riffusion (2022), a Stable Diffusion 1.5 fine-tune that paints spectrograms. Use-based restrictions; permissive otherwise.

### 2.7 Port labels are not the parent's licence

The `license` field on a re-upload is the uploader's claim. Of the MiniMax Music 3 re-uploads, `Abiray/MiniMax-Music3-GGUF` and `realrebelai/MiniMax-Music-3_GGUFs` declare `apache-2.0` and `molbal/Minimax-Music3-GGUF` declares `creativeml-openrail-m`. The parent's licence is neither. Licence terms come from the base model's own licence file.

## 3. Training data, as each card states it

| Model | What the publisher states |
|---|---|
| Stable Audio Open 1.0, Small | 486,492 recordings: 472,618 from Freesound and 13,874 from the Free Music Archive, all CC0, CC BY or CC Sampling+. Music in the Freesound set was screened through Audible Magic and flagged items removed. Per-file attribution at <https://info.stability.ai/attributions> |
| Stable Audio 3 small, medium | 1,278,902 recordings: 806,284 licensed from AudioSparx and the same 472,618-file Freesound subset |
| SAME autoencoders | About 19,500 hours of licensed AudioSparx production audio, 66% music, 25% sound effects, 9% instrument stems |
| MusicGen | 20,000 hours, licensed: Meta Music Initiative Sound Collection, Shutterstock and Pond5. Released checkpoints trained on instrumental stems after HT-Demucs separation |
| MAGNeT | 16,000 hours, the same three licensed sources |
| Magenta RealTime 2 | "~71k hours of stock music from multiple sources, mostly instrumental" |
| YuE2 | 346,000 hours, "trained primarily on CC0 music and synthetic data. Tokenwave.AI provides most of our synthetic training data under license" (project page, <https://map-yue2.github.io/>) |
| ACE-Step 1.5 | "Professionally licensed music tracks", "public domain and royalty-free music", and MIDI-rendered synthetic audio. No counts, no named sources |
| Foundation-1 | "Entirely hand-crafted and labeled audio, produced through a controlled augmentation pipeline"; 7.1 TiB after augmentation. The origin of the source audio is not named |
| RC_Infinite_Pianos | 468 minutes rendered in FL Studio from commercial instrument libraries: Native Instruments' Alicia's Keys and two Spitfire Audio electric pianos. The card does not address whether those libraries' licences permit training |
| MiniMax Music 3, HeartMuLa, MOSS-SoundEffect v2.0 | Not stated on the card. HeartMuLa's GitHub repository lists a data-collaboration contact and nothing more |

The Stability and Meta cards are the only ones that name every source and say how copyrighted material was screened out.

## 4. The models, by job

### 4.1 Loops, one-shots and sampler instruments

| Model | Size | Output | Longest | Runs on | Licence |
|---|---|---|---|---|---|
| Stable Audio 3 small-music | 433M | 44.1 kHz stereo | 120 s | CPU (TFLite, CoreML) | Stability |
| Stable Audio 3 medium | 1.4B | 44.1 kHz stereo | 380 s | CUDA | Stability |
| Stable Audio Open 1.0 | 1.2B | 44.1 kHz stereo | 47 s | CUDA | Stability |
| Stable Audio Open Small | 0.5B | 44.1 kHz stereo | 11 s | Arm CPU | Stability |
| Foundation-1 family | SAO 1.0 fine-tune | 44.1 kHz stereo | 20 s training window | about 7 GB VRAM | Stability |
| MusicGen | 300M, 1.5B, 3.3B | 32 kHz; mono, stereo variants | — | CUDA | CC BY-NC |

Stable Audio 3 sizes, lengths and hardware are from the model table in <https://github.com/Stability-AI/stable-audio-3>. The same README gives peak VRAM for medium at 380 s as 6.52 GB, measured on an H200, and names the autoencoder as "stereo, 44.1 kHz". It also supports inpainting, continuation and stackable LoRA fine-tuning. Stable Audio 3 Large (2.7B) is API-only.

**Foundation-1** is the one model on the Hub built around the way a producer asks for a sample. Prompts are tag lists: instrument family, sub-family, timbre, effects, then bar count, BPM and key — for example `Bass, FM Bass, Medium Delay, … 8 Bars, 140 BPM, E minor`. The card says it "produces perfect loops within supported BPM / bar denominations". Three checkpoints:

- **Foundation-1** — loops.
- **Foundation-1.2 Samples** — loops and one-shots.
- **Foundation-1.2 Keybeds** — pitch-consistent one-shots across a keyboard. Its companion tool, RC Stable Audio Tools, generates every note with one seed, then slices and maps them into a playable sampler instrument.

A keybed is the same kind of asset as `pantry/acoustic/loops/`: pitched samples across a range. The card gives about 7–8 s per sample on an RTX 3090 and about 50 s for a full single-layer keybed.

The earlier fine-tunes from the same lineage, RC_Infinite_Pianos and Audialab EDM Elements, take BPM only in fixed steps — 100, 110, 120, 128, 130, 140 and 150 — and key as any of the twelve tonics in major or minor. RC_Infinite_Pianos' own card reports a bias: a request for C# major tends to come back in C# minor.

### 4.2 Full songs with vocals

| Model | Size | Output | Longest | Hardware stated | Licence |
|---|---|---|---|---|---|
| MiniMax Music 3 | 8B global LM + 0.6B local LM + 2.4B flow decoder | 32 kHz stereo | 5 min | 24 GB; about 8 GB with layer streaming. CUDA only | MiniMax community |
| YuE2-3B | 3.6B | 48 kHz stereo | — | 24 GB GPU. A 3.6-minute song in 71 s on an RTX 4090 at 11.2 GiB peak | CC BY-NC |
| ACE-Step 1.5 | 2B; 4B XL | 48 kHz stereo | 10 min | Card claims under 4 GB. README: 2B at 6 GB or less with quantisation and offload; XL 12 GB with offload, 20 GB recommended | MIT |
| HeartMuLa-oss-3B | 3.9B | 48 kHz stereo | 4 min default | Not stated | Apache 2.0 |
| JAM-0.5 | 530M | — | 3 min 50 s | 8 GB recommended | Non-commercial |

**ACE-Step 1.5** has the most tools for an instrument builder. The `diffusers` pipeline documents six task types on 48 kHz audio:

- `text2music` — a song from a caption and lyrics.
- `cover` — keep a source's melody and structure, change its style.
- `repaint` — regenerate a time range.
- `extract` — pull one track, such as vocals or drums, out of a mix.
- `lego` — generate one new track against existing audio.
- `complete` — add accompaniment to a single track.

`extract`, `lego` and `complete` run only on the base checkpoints. The GitHub README gives LoRA training as 8 songs and an hour on a 3090 with 12 GB.

**YuE2** plans a song as an ABC score before it renders audio, and the score can be edited between the two steps — reharmonise, change the melody, then render again. The card's headline claim is that it beats Suno v5 and v6 on WildSongBench. WildSongBench is published by the same group (`m-a-p/WildSongBench`), so the comparison is self-reported.

**MiniMax Music 3** takes lyrics with section tags and a "structured caption": genre, BPM, key, vocal detail, arrangement by section. The card is frank that "tempo, key, instrumentation, lyrics, and song structure may not always match every requested detail exactly."

**SongGeneration / LeVo 2** (Tencent) appears as the parent of several ports. On 2026-10-02 the upstream `tencent/SongGeneration` repository answered 401 and `github.com/tencent-ailab/SongGeneration` answered 404. The MLX mirror records 48 kHz stereo output and defers its licence to the upstream release, which can no longer be read.

### 4.3 Live generation

**Magenta RealTime 2** (Google, on the Hub since 2026-05-28) is the only open-weight model here that plays as it is steered.

- Two sizes: base, 2.4B parameters; small, 230M.
- 48 kHz stereo through the SpectroStream codec.
- 40 ms frames and about 200 ms control latency.
- Conditioning by text, audio and MIDI. The MIDI input is a 128-entry vector per frame. Each entry gives one pitch's state: off, sustain, onset, or "sustain or onset, model decides".

The GitHub repository states the hardware split: the small model runs in real time "on any Apple Silicon Mac", and the base model needs a Pro or Max chip. On an NVIDIA GPU, both run "offline (non-real-time) inference" through the Python library. The repository ships a C++ engine, a standalone macOS app and an AUv3 plugin. There is no VST and no browser runtime.

### 4.4 Sound effects

- **Stable Audio 3 small-sfx** — 433M, CPU, 120 s, Stability licence.
- **MOSS-SoundEffect v2.0** — 48 kHz, up to 30 s, English and Chinese prompts, Apache 2.0. Training data not stated.
- **TangoFlux, AudioX, Woosh** (Sony Research) — non-commercial.
- **Video-to-audio** — HunyuanVideo-Foley, PrismAudio, an LTX-2.3 Foley LoRA. Conditioned on video, so outside an audio studio's use.

### 4.5 Audio in, audio out

| Job | Model | Licence | Note |
|---|---|---|---|
| Edit a recording | ACE-Step 1.5 `repaint`, `extract`, `lego`, `complete`; Stable Audio 3 inpainting and continuation | MIT; Stability | — |
| Cover a song | YuE2 cover mode, ACE-Step `cover`, MuLaCover | CC BY-NC; MIT; CC BY-NC with outputs restricted | The source recording's composition rights still run (section 6) |
| Accompany a voice or solo | AnyAccomp | CC BY 4.0 | Generates backing from a sung or solo instrumental input |
| Restore | Apollo; SonicMaster | CC BY-SA 4.0; Apache 2.0 | Apollo repairs lossy-codec damage, trained on MUSDB18-HQ and MoisesDB. SonicMaster takes text instructions for mastering and repair |
| Separate | TIGER-DnR; BS-RoFormer and Mel-band RoFormer ports | Apache 2.0; mixed | TIGER is a speech-separation network. The DnR checkpoint targets the Divide and Remaster task: one mono mix into speech, music and effects stems (<https://arxiv.org/abs/2407.07275>) |
| Encode and decode | SAME-L, SAME-S; SNAC 44 kHz; BigVGAN v2 44 kHz; KVAE-Audio | Stability; MIT; MIT; MIT | SNAC is mono, 2.6 kbps. KVAE-Audio is 48 kHz with continuous latents |

### 4.6 Symbolic

- **YuE2's score planner** writes ABC notation, which is text a person or another program can edit.
- **MIDI-LLM** — a Llama 3.2 1B fine-tune under the Llama 3.2 licence.
- **MIDI-GPT** — CC BY-NC, trained on GigaMIDI. Two of its four checkpoints are mid-training.
- **basic-pitch** (Spotify) transcribes audio to MIDI with pitch bends. It is instrument-agnostic and polyphonic, and works best on one instrument at a time. It resamples all input to 22,050 Hz mono. The npm package `@spotify/basic-pitch` 1.0.1 is Apache 2.0 and depends on `@tensorflow/tfjs` and `@tonejs/midi`.

## 5. Against the house stack

The house stack is vanilla JavaScript and Web Audio with zero runtime dependencies. Nothing in sections 4.1 to 4.5 runs inside it. Three routes connect them.

**Offline, into the pantry.** A model generates audio on a GPU or CPU. The files enter `pantry/` like any recording. A `PROVENANCE.md` row records the model id and revision, the licence, the prompt and the seed. Seeded generation keeps a re-render reproducible, the same reason `core/rng.js` exists. `rack/R3-measure` measures the result like any other file. This route keeps every instrument at zero runtime dependencies.

**In the browser, with a dependency.** `Xenova/musicgen-small` runs under `@huggingface/transformers` (Apache 2.0, 4.3.0). Community ONNX ports of Stable Audio 3 small-music exist, for example `lsb/stable-audio-3-small-music-onnx`, and need `onnxruntime-web` (MIT, 1.30.0). Both break the zero-runtime-dependency line. `@spotify/basic-pitch` is the same trade on the analysis side.

**Live, beside the browser.** Magenta RealTime 2 runs as a native app or AUv3 plugin on Apple Silicon. An instrument that wants it would talk to it from outside the page, over MIDI or audio.

Hardware, as the publishers state it: Stable Audio 3 small runs on a CPU. Stable Audio 3 medium and Foundation-1 fit an 8 GB GPU, and so does ACE-Step 2B with quantisation and offload. YuE2 and MiniMax Music 3 want 24 GB. ACE-Step XL wants 20 GB, or 12 GB with offload.

## 6. What a generated file carries

`RIGHTS.md` says synthesis has no rights problem and recordings do. Model output sits between the two.

**The model licence travels with use.** Section 2 sets what may be done with each model and, for some, with its outputs.

**Copyright in the output may not exist.** The US Copyright Office, in *Copyright and Artificial Intelligence, Part 2: Copyrightability* (2025-01-29), concluded that "the mere provision of prompts" does not make output copyrightable. It also concluded that output "can be protected by copyright only where a human author has determined sufficient expressive elements." A loop generated from a prompt and shipped unedited may have no US copyright owner. Human selection, arrangement and modification can be protected. This is a US determination; other jurisdictions were not checked.

**The training data is a fourth clock.** A sample library's licence answers for its recordings. A generated file's provenance runs back through the model to its training set, which section 3 shows ranges from fully itemised to unstated.

**Cover and edit modes take a real recording as input.** YuE2's cover mode, ACE-Step's `cover`, `repaint` and `extract`, and MuLaCover all start from existing audio. The composition behind the source recording keeps its own clock, exactly as for a transcription.

**MiniMax adds a disclosure duty.** Publishing MiniMax Music 3 output publicly without a prominent machine-generated label breaches its acceptable-use policy (section 2.3).

## 7. Verdicts

The verdicts follow the pattern of `web_audio_toolchain.md`, adapted to models rather than code.

- **Pantry source** — generate offline; the output enters `pantry/` with a provenance row.
- **Bench tool** — use while building: separation, transcription, restoration, restyling.
- **Not yet** — not available in a usable form today.
- **Not this studio.**

| Model | Verdict | Reason |
|---|---|---|
| Foundation-1.2 Keybeds, Foundation-1.2 Samples | Pantry source | Makes the studio's own asset types — key- and tempo-locked loops, pitched multi-samples |
| Stable Audio 3 small-music, medium | Pantry source | Training data itemised; small runs without a GPU |
| Stable Audio 3 small-sfx | Pantry source | The same, for effects |
| YuE2 | Pantry source and bench tool | The highest claimed song quality; the ABC score can be edited before the render; cover mode restyles an existing song |
| ACE-Step 1.5 | Pantry source and bench tool | `extract` and `lego` are stem tools as well as generators |
| MiniMax Music 3 | Pantry source | Long structured songs. Label its output as machine-generated when it is published |
| Magenta RealTime 2 | Pantry source; live use on Apple Silicon only | The one model that plays as it is steered |
| MusicGen, MAGNeT | Pantry source | Older (2023–2024) and 32 kHz, but small, well documented and easy to run. `musicgen-melody` follows the melody of a reference recording. `Xenova/musicgen-small` runs in the browser |
| JAM-0.5 | Pantry source | Word- and phoneme-level timing control over sung lyrics |
| MOSS-SoundEffect v2.0, AudioX, Woosh, TangoFlux | Pantry source | Text-to-effect generators |
| HeartMuLa-oss-3B | Pantry source | Another full-song generator at 48 kHz |
| MuLaCover | Bench tool | Restyles an existing song |
| MIDI-GPT | Pantry source (MIDI) | Symbolic generation with density, polyphony and key controls |
| basic-pitch | Bench tool | Turns pantry audio into MIDI, with a JS package |
| SonicMaster, TIGER-DnR, Apollo | Bench tool | Repair and separation |
| SongGeneration / LeVo 2 | Not yet | Both upstream repositories return errors (401 and 404); only community mirrors remain |
| HunyuanVideo-Foley | Not this studio | Conditioned on video |
| RVC voice models in `Audio-to-Audio` | Not this studio | Clones of named characters' and people's voices |
| Riffusion | Not this studio | A 2022 spectrogram-image model, superseded by everything above |

Where a model's card does not state its training data (MiniMax Music 3, HeartMuLa, MOSS-SoundEffect v2.0), the pantry's provenance row says so.

## Gaps

- **No listening and no measurement.** Every quality claim is the publisher's. YuE2's benchmark comes from its own group. No file was rendered through `rack/R3-measure`.
- **SongGeneration / LeVo 2**: both upstream repositories were unreachable on 2026-10-02, so its official card and terms could not be read.
- **Training data not stated** for MiniMax Music 3, HeartMuLa and MOSS-SoundEffect v2.0. ACE-Step 1.5 names categories but no sources. Foundation-1 does not name where its source audio came from.
- **Copyright of AI output outside the US** was not checked.
- **Coverage.** The survey read the five named tags plus the top of the `text-to-audio` and `audio-to-audio` pipelines. A model that declares neither a pipeline nor one of the tags would not appear. Downloads are a 30-day window and read 0 for some checkpoint-only repositories.

## Sources

Hugging Face model cards and licence files, read 2026-10-02:
`ACE-Step/Ace-Step1.5`, `ACE-Step/acestep-v15-xl-turbo`, `MiniMaxAI/MiniMax-Music3` (and its `LICENSE`), `m-a-p/YuE2-3B`, `HeartMuLa/HeartMuLa-oss-3B`, `HeartMuLa/MuLaCover`, `declare-lab/JAM-0.5`, `declare-lab/TangoFlux`, `stabilityai/stable-audio-open-1.0`, `stabilityai/stable-audio-open-small`, `stabilityai/stable-audio-3-medium`, `stabilityai/stable-audio-3-small-music`, `stabilityai/stable-audio-3-small-sfx`, `stabilityai/stable-audio-3-optimized`, `stabilityai/SAME-L` (and its `LICENSE.md`), `RoyalCities/Foundation-1` (and `training_dataset_info.md`), `RoyalCities/RC_Infinite_Pianos`, `adlb/Audialab_EDM_Elements`, `facebook/musicgen-large`, `facebook/musicgen-melody`, `facebook/musicgen-stereo-large`, `facebook/magnet-medium-30secs`, `google/magenta-realtime-2`, `riffusion/riffusion-model-v1`, `OpenMOSS-Team/MOSS-SoundEffect-v2.0`, `HKUSTAudio/AudioX`, `drbaph/Woosh`, `tencent/HunyuanVideo-Foley` (and its `LICENSE`), `JusperLee/Apollo`, `amaai-lab/SonicMaster`, `JusperLee/TIGER-DnR`, `spotify/basic-pitch`, `slseanwu/MIDI-LLM_Llama-3.2-1B`, `Metacreation/MIDI-GPT`, `nvidia/bigvgan_v2_44khz_128band_512x`, `hubertsiuzdak/snac_44khz`, `kandinskylab/KVAE-Audio`, `amphion/anyaccomp`, `mlx-community/SongGeneration-v2-medium`.

Other primary sources:

- Stable Audio 3 repository and model table — <https://github.com/Stability-AI/stable-audio-3>
- ACE-Step 1.5 `diffusers` pipeline documentation — <https://huggingface.co/docs/diffusers/api/pipelines/ace_step>
- ACE-Step 1.5 repository and tutorial — <https://github.com/ace-step/ACE-Step-1.5>
- HeartMuLa repository — <https://github.com/HeartMuLa/heartlib>
- YuE2 project page — <https://map-yue2.github.io/>
- Magenta RealTime 2 announcement — <https://magenta.withgoogle.com/magenta-realtime-2>; repository — <https://github.com/magenta/magenta-realtime>
- Stability AI Community Licence — <https://stability.ai/community-license-agreement>
- CC BY-NC 4.0 legal code — <https://creativecommons.org/licenses/by-nc/4.0/legalcode.en>
- US Copyright Office, *Copyright and Artificial Intelligence, Part 2* — <https://copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf>; release — <https://newsroom.loc.gov/news/copyright-office-releases-part-2-of-artificial-intelligence-report/s/f3959c36-d616-498d-b8f9-67641fd18bab>
- npm registry entries for `@spotify/basic-pitch`, `@huggingface/transformers`, `onnxruntime-web`
