# Tooling Stack for Open-Weight Music Generation (October 2026)

## Findings

### Front-ends and UIs

- **ACE-Step 1.5**: Gradio Web UI is the primary interface; last update 2026-04-02; actively maintained (1,410 commits, 13.1k stars, 1.7k forks); includes REST API with optional routes and VST3 plugin support — https://github.com/ace-step/ACE-Step-1.5
- **ACE-Step ComfyUI**: Repackaged ComfyUI version available at https://huggingface.co/Comfy-Org/ACE-Step_ComfyUI_repackaged/tree/main
- **YuE-UI**: Gitee repository (https://gitee.com/wslrj/YuE-UI) with 19 commits; minimally maintained (no stars/forks on Gitee); supports low VRAM (6-8 GB) with batch/select/continue workflow
- **YuE2 ComfyUI support**: Documented on ComfyUI Wiki (https://comfyui-wiki.com/en/models/yue2) as an editable scores model for ComfyUI
- **MiniMax Music 3**: No dedicated UI found; referenced as separate project but without maintained front-end
- **HeartMuLa**: Available on OnWorks for Linux (https://www.onworks.net/software/linux/app-heartmula); integrated into Hermes agent framework; no independent dedicated UI
- **All-in-one local Suno alternative**: ace-step-ui (GitHub https://gittrend.io/repo/fspecii/ace-step-ui) with 4.2k stars as of June 2026; free, local, unlimited alternative marketed as replacement for Suno

### Post-processing Chain Tools

- **Stem Separation**: BS-RoFormer and Demucs models are standard; tools include: StemDeck (free open-source for Linux/Mac/Windows, 2026), UVR5 UI (supports BS-RoFormer, Demucs v4, Mel-Band RoFormer, MDX models, Linux/Windows), PolUVR (Python-based with Gradio interface, Hugging Face Spaces), audio-separator (multiple implementations on Hugging Face Spaces)
- **Voice Conversion for Vocals**: Seed-VC (Gitee: https://gitee.com/LeeBaye/seed-vc; zero-shot singing voice conversion; actively maintained 2025-2026; Pinokio one-click installer available at https://pinokio.co/apps/github-com-hoodtronik-seed-vc-pinokio); RVC (Real-time Voice Cloning) also mentioned but less detail on 2026 status
- **Audio Upsampling/Restoration**: AudioSR not found as open-source tool in 2026 context; Apollo refers to Universal Audio hardware interface, not upsampling software; Matchering mentioned in constraints but no current 2026 repository found
- **Mastering tools**: Limited information; traditional DAW-based workflows appear standard

### LoRA and Fine-tuning Tools

- **ACE-Step 1.5**: Official LoRA fine-tuning pipeline available with 815M parameter Diffusion Transformer; ControlNet-LoRA architecture supported; specialized LoRA modules exist for Lyric-to-Vocal, Text-to-Sample, and Rap Machine use cases; serverless GPU training infrastructure available via dashboard at https://dashboard-dev-7klv.onrender.com/ace-step-pipeline-docs.html
- **YuE2**: No official fine-tuning/LoRA tools found in 2026 repositories
- **MiniMax Music 3**: No fine-tuning documentation found
- **HeartMuLa**: No LoRA/fine-tuning tools documented; library offers HeartCodec, HeartTranscriptor, HeartCLAP components but not training pipelines

### End-to-End Workflows

- **Documented workflow**: Generate in ACE-Step (Gradio UI or ace-step-ui), extract stems with UVR5/StemDeck, apply voice conversion with Seed-VC if needed, remix in DAW, master with traditional tools
- **YuE2-specific**: Use YuE-UI or ComfyUI node for generation with editable score control, then stem separation and vocal repair
- **Typical stack**: Music generation model → stem separation (BS-RoFormer/UVR5) → vocal repair (Seed-VC/RVC) → DAW mixing → mastering

## Sources

- https://github.com/ace-step/ACE-Step-1.5 — ACE-Step 1.5 official repository, actively maintained
- https://gitee.com/wslrj/YuE-UI — YuE-UI repository on Gitee, minimally maintained
- https://comfyui-wiki.com/en/models/yue2 — YuE2 ComfyUI model documentation
- https://www.onworks.net/software/linux/app-heartmula — HeartMuLa Linux availability
- https://gittrend.io/repo/fspecii/ace-step-ui — ace-step-ui GitHub stats and trending
- https://synthtopia.com/content/2026/08/27/free-open-source-stemdeck-stem-separator-for-linux-mac-windows/ — StemDeck 2026 announcement
- https://huggingface.co/Eddycrack864/UVR5-UI — UVR5 UI Space
- https://gitee.com/LeeBaye/seed-vc — Seed-VC repository
- https://pinokio.co/apps/github-com-hoodtronik-seed-vc-pinokio — Seed-VC Pinokio installer
- https://dashboard-dev-7klv.onrender.com/ace-step-pipeline-docs.html — ACE-Step LoRA fine-tuning documentation
- https://huggingface.co/Comfy-Org/ACE-Step_ComfyUI_repackaged/tree/main — ACE-Step ComfyUI repackaged

## Gaps

- **MiniMax Music 3 front-end**: No maintained UI or integration found; unclear if community UIs exist
- **YuE2 fine-tuning**: No official or community LoRA/fine-tuning tools documented for YuE2 model
- **HeartMuLa dedicated UI**: No independent front-end found; only component-level libraries available
- **VRAM requirements for fine-tuning**: ACE-Step LoRA training VRAM budget not documented; unclear scaling for 2B vs 4B XL variants
- **Pinokio installers**: Found only for ace-step-ui and Seed-VC; YuE2/MiniMax Music 3/HeartMuLa Pinokio availability not confirmed
- **Matchering and advanced mastering tools**: Not found in active 2026 repositories; status unknown
- **CommonWorkflow documentation**: No comprehensive end-to-end workflow published; inferred from tool capabilities rather than documented by community
