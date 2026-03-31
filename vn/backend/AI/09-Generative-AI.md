# Bài 9: Generative AI

## Mục lục
- [1. Generative AI là gì?](#1-generative-ai-là-gì)
- [2. Diffusion Models](#2-diffusion-models)
- [3. Image Generation](#3-image-generation)
- [4. Video Generation](#4-video-generation)
- [5. Audio & Music Generation](#5-audio--music-generation)
- [6. Code Generation](#6-code-generation)
- [7. LoRA, ControlNet, IP-Adapter](#7-lora-controlnet-ip-adapter)
- [8. Content Authenticity & Ethics](#8-content-authenticity--ethics)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Generative AI là gì?

### 1.1 Định nghĩa

```
Generative AI: AI tạo ra NỘI DUNG MỚI (text, image, video, audio, code)
thay vì chỉ phân tích/phân loại dữ liệu có sẵn.

Discriminative AI:     Input → Label (phân loại)
  "Đây là ảnh mèo hay chó?" → "Mèo"

Generative AI:         Prompt → Content (tạo mới)
  "Vẽ con mèo ngồi trên mây" → [Ảnh mèo trên mây]

Các loại Generative AI:
├── Text Generation: GPT, Claude, Llama → viết text
├── Image Generation: DALL-E, Midjourney, FLUX → tạo ảnh
├── Video Generation: Sora, Veo, Kling → tạo video
├── Audio Generation: ElevenLabs, Suno → voice, music
├── Code Generation: Copilot, Cursor, Claude Code → viết code
├── 3D Generation: Point-E, Shap-E → tạo 3D models
└── Multimodal: Gemini, GPT-4o → combine multiple modalities
```

### 1.2 Generative AI Landscape 2026

```
┌─────────────────────────────────────────────┐
│              TEXT                             │
│  GPT-4.5 │ Claude 4 │ Gemini 2.5 │ Llama 4 │
├─────────────────────────────────────────────┤
│              IMAGE                           │
│  FLUX 1.1 │ Midjourney v7 │ DALL-E 3       │
│  SD 3.5   │ Imagen 3      │ Ideogram 3     │
├─────────────────────────────────────────────┤
│              VIDEO                           │
│  Sora 2  │ Veo 3.1 │ Kling 3.0 │ Wan 2.2  │
├─────────────────────────────────────────────┤
│              AUDIO / MUSIC                   │
│  ElevenLabs │ Suno v4 │ Udio │ Bark        │
├─────────────────────────────────────────────┤
│              CODE                            │
│  Copilot │ Cursor │ Claude Code │ Codestral│
└─────────────────────────────────────────────┘
```

---

## 2. Diffusion Models

### 2.1 Cách Diffusion Models hoạt động

```
Diffusion = Quá trình "thêm noise" rồi học "bỏ noise"

Forward Process (Training):
  Clean Image → Add noise → Add more noise → ... → Pure Noise
  x₀ ────────→ x₁ ──────→ x₂ ──────────→ ... → xₜ (Gaussian)
  
  Mỗi step thêm một ít Gaussian noise
  Cuối cùng: ảnh → noise hoàn toàn

Reverse Process (Generation):
  Pure Noise → Remove noise → Remove more → ... → Clean Image
  xₜ ────────→ xₜ₋₁ ──────→ xₜ₋₂ ──────→ ... → x₀ (Image!)
  
  Model ĐỌC noise predict → loại bỏ dần → tạo ảnh
  
  ⚠️ Key insight: Model học PREDICT NOISE, không phải predict image
  tᵢ: noise level → εθ(xₜ, t) → predicted noise → subtract → cleaner image
```

### 2.2 Stable Diffusion Architecture

```
Text-to-Image Pipeline:

  "A cat sitting on clouds"
         │
         ▼
  ┌──────────────┐
  │ Text Encoder  │  CLIP / T5  
  │ (Tokenize +   │  → text embeddings
  │  Encode)       │
  └──────┬───────┘
         │ text embeddings
         ▼
  ┌──────────────┐
  │ U-Net /       │  Iterative denoising
  │ Transformer   │  (20-50 steps)
  │ (Denoiser)    │  
  │               │  ← Latent Space (64×64)
  └──────┬───────┘    nhỏ hơn pixel space
         │ denoised latent
         ▼
  ┌──────────────┐
  │ VAE Decoder   │  Latent → Pixel Space
  │ (Upscale)     │  64×64 → 512×512 / 1024×1024
  └──────┬───────┘
         │
         ▼
     Final Image

Latent Diffusion = Diffusion trong LATENT SPACE (không phải pixel space)
├── VAE Encoder: Image (512×512×3) → Latent (64×64×4)
├── Diffusion trong latent space → 64× ít computation
├── VAE Decoder: Latent → Image
└── → Nhanh hơn, ít GPU hơn pure pixel diffusion
```

---

## 3. Image Generation

### 3.1 Top Image Models 2026

| Model | Provider | Strengths | Open? |
|-------|----------|-----------|-------|
| **FLUX 1.1 Pro** | Black Forest Labs | Speed, quality, commercial | ❌ |
| **Midjourney v7** | Midjourney | Artistic, aesthetic, cinematic | ❌ |
| **DALL-E 3** | OpenAI | Text rendering, safety | ❌ |
| **Imagen 3** | Google | Photorealism, spatial reasoning | ❌ |
| **Stable Diffusion 3.5** | Stability AI | Customizable, local, open | ✅ |
| **Ideogram 3** | Ideogram | Text in images, typography | ❌ |

### 3.2 Prompting cho Image Generation

```
Effective Image Prompt Structure:
  [Subject] + [Style] + [Details] + [Lighting] + [Camera] + [Quality]

Ví dụ:
  "A Vietnamese woman in áo dài, standing in a lotus pond,
   watercolor painting style, soft morning light, 
   medium shot, highly detailed, 8K resolution"

Tips:
├── Be specific: "golden retriever puppy" NOT "a dog"
├── Art style: "oil painting", "digital art", "photorealistic"
├── Lighting: "golden hour", "dramatic lighting", "studio light"
├── Camera: "wide angle", "macro", "portrait lens"
├── Quality: "highly detailed", "4K", "masterpiece"
├── Negative prompt: "blurry, distorted, ugly, low quality"
└── Aspect ratio: --ar 16:9, --ar 1:1, --ar 9:16
```

### 3.3 Code — Image Generation APIs

```python
from openai import OpenAI

client = OpenAI()

# DALL-E 3
response = client.images.generate(
    model="dall-e-3",
    prompt="A serene Japanese garden with cherry blossoms, koi pond, "
           "wooden bridge, morning mist, photorealistic, 4K",
    size="1024x1024",
    quality="hd",
    n=1
)
image_url = response.data[0].url

# Stable Diffusion (via API hoặc local)
import requests

response = requests.post(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "text_prompts": [
            {"text": "A cat astronaut in space, digital art", "weight": 1},
            {"text": "blurry, low quality", "weight": -1}  # Negative prompt
        ],
        "cfg_scale": 7,        # Prompt adherence (higher = more faithful)
        "steps": 30,           # Denoising steps (more = better but slower)
        "seed": 42,            # Reproducibility
        "width": 1024,
        "height": 1024
    }
)
```

---

## 4. Video Generation

### 4.1 Video Gen Landscape 2026

```
Video Generation — Đang phát triển NHANH nhất:

Tier 1 (Production-ready):
├── Google Veo 3.1 — Native 4K, cinematic, audio sync
├── OpenAI Sora 2 — Narrative intelligence, text-to-video
├── Kling 3.0 (Kuaishou) — Character consistency, motion quality
└── Runway Gen-4 — Creative tools, style control

Tier 2 (Growing):
├── Pika 2.0 — Simple, fast, social media
├── Luma Dream Machine — Creative effects
├── Minimax Hailuo — Asian market
└── Wan 2.2 (Open-source) — MoE architecture, free

Capabilities:
├── Text-to-Video: Prompt → 5-60 second clip
├── Image-to-Video: Still image → animated
├── Video-to-Video: Style transfer, editing
├── Video extension: Extend existing clips
├── Camera control: Pan, zoom, orbit
└── Audio-synced: Lip sync, sound effects

Limitations (2026):
├── Max 60 seconds typical (some up to 2 min)
├── Character consistency still challenging
├── Physics not always accurate
├── Expensive (GPU-intensive)
└── Ethical concerns (deepfakes)
```

### 4.2 Professional Video Workflow 2026

```
Professional AI Video Production:

1. SCRIPT → Story/Narration (LLM: GPT-4, Claude)
2. STORYBOARD → Reference Images (Image Gen: Midjourney, FLUX)
3. CHARACTER REFS → Consistent character sheets
4. IMAGE-TO-VIDEO → Animate storyboard frames (Kling, Veo)
5. AUDIO → Voice (ElevenLabs), Music (Suno)
6. COMPOSITING → Edit, transitions, effects (Runway)
7. UPSCALE → Enhance resolution (Topaz AI)

⚠️ Key Insight 2026:
  Không phải "1 prompt → perfect video"
  Mà là PIPELINE of specialized tools
  Professional quality = chaining 5-10+ specialized models
```

---

## 5. Audio & Music Generation

### 5.1 Voice & Speech

```
Text-to-Speech (TTS) 2026:
├── ElevenLabs — Best quality, voice cloning, 30+ languages
├── OpenAI TTS — GPT-4o Audio, conversational, affordable
├── Google TTS — WaveNet, high-quality, many languages
├── XTTS (Coqui) — Open-source, multi-lingual
└── Bark (Suno) — Open-source, expressive

Voice Cloning:
├── ElevenLabs: 30 seconds → clone voice
├── OpenAI: Text → natural voice (no clone yet public)
├── ⚠️ Ethical concerns: consent, deepfakes
└── ⚠️ Legal restrictions in many countries
```

### 5.2 Music Generation

```
AI Music 2026:
├── Suno v4 — Full songs, lyrics + music, multiple genres
├── Udio — High audio quality, mastering
├── AIVA — Orchestral, cinematic
├── MusicFX (Google) — Short loops, backgrounds
└── Stable Audio — Open-source base

Capabilities:
├── Text-to-Music: "Jazz piano solo, relaxing, Lo-Fi"
├── Style transfer: Apply style to existing melody
├── Stem separation: Split song → vocals, drums, bass, etc.
├── Lyric generation: AI writes lyrics
└── Remix/extend: Extend or modify existing music

⚠️ Copyright 2026:
├── AI-generated music: Copyright status UNCERTAIN
├── Training data lawsuits ongoing
├── Commercial use: Check license carefully
└── Best practice: Use for backgrounds, drafts; finalize with musicians
```

---

## 6. Code Generation

### 6.1 AI Coding Tools 2026

```
Code Generation — Đã thay đổi cách developers làm việc

Tier 1 (Production IDE Integration):
├── GitHub Copilot (GitHub/OpenAI)
│   ├── VS Code, JetBrains, Neovim integration
│   ├── Inline completion, chat, workspace agent
│   └── Most widely adopted
│
├── Cursor (Cursor AI)
│   ├── Full IDE with AI-native design
│   ├── Multi-file editing, codebase understanding
│   └── Agent mode: autonomous coding
│
├── Claude Code (Anthropic)
│   ├── Terminal-based agentic coding
│   ├── Deep codebase understanding
│   └── Long-context code reasoning
│
└── Windsurf (Codeium)
    ├── AI-native IDE
    ├── Cascade agent for multi-step tasks
    └── Free tier available

Tier 2 (Specialized):
├── Codestral (Mistral) — Open model for code
├── Amazon Q Developer — AWS integration
├── JetBrains AI — JetBrains IDE native
├── Tabnine — Enterprise, on-premise option
├── Sourcegraph Cody — Codebase search + AI
└── Replit Agent — Build apps from scratch

Impact on Developers (2026):
├── 30-50% productivity boost (measured)
├── Junior devs: biggest beneficiary
├── AI writes boilerplate, human designs architecture
├── Code review: AI assists but human decides
└── NOT replacing developers — AUGMENTING
```

### 6.2 Code Gen Best Practices

```
Effective AI Coding:

✅ DO:
├── Provide clear context (file, project structure)
├── Break large tasks into smaller ones
├── Review AI-generated code carefully
├── Use AI for boilerplate, tests, docs
├── Describe the "why" not just "what"
└── Iterate on suggestions

❌ DON'T:
├── Blindly accept generated code
├── Skip code review for AI code
├── Use AI for security-critical code without review
├── Ignore licensing issues (training data concerns)
├── Over-rely on AI for architectural decisions
└── Copy-paste without understanding
```

---

## 7. LoRA, ControlNet, IP-Adapter

### 7.1 LoRA — Customizing Image Models

```
LoRA (Low-Rank Adaptation):
├── Fine-tune image model với 20-100 images
├── Ít thay đổi weights → ít GPU, nhanh
├── File size nhỏ: 10-100 MB (vs full model 2-6 GB)
├── Stack nhiều LoRAs cùng lúc

Use cases:
├── Character LoRA: train consistent character
├── Style LoRA: specific art style
├── Concept LoRA: custom objects/products
├── Face LoRA: specific person (⚠️ consent!)
└── Architecture LoRA: specific building style

Training (Stable Diffusion):
├── 20-50 high-quality images
├── Resolution: 512×512 or 1024×1024
├── Training: 1000-5000 steps
├── GPU: 12GB+ VRAM (RTX 3060+)
├── Time: 30 min - 2 hours
└── Tools: kohya_ss, LoRA Easy Training
```

### 7.2 ControlNet — Precise Control

```
ControlNet: Điều khiển CHÍNH XÁC kết quả generation

Input types:
├── Canny Edge: Detect edges → generate matching image
├── Depth Map: 3D depth → maintain perspective
├── Pose (OpenPose): Skeleton → character pose
├── Scribble: Rough sketch → full image
├── Segmentation: Semantic map → scene composition
├── Normal Map: Surface normals → lighting
└── Line Art: Clean lines → colored output

Ví dụ:
  Canny edge of building → "Turn into cyberpunk city" → maintains structure
  OpenPose skeleton → "Ballet dancer in red dress" → exact pose
  Depth map of scene → "Convert to underwater world" → maintains layout
```

### 7.3 IP-Adapter — Style & Character Transfer

```
IP-Adapter: Image Prompt Adapter
├── Input: Reference IMAGE thay vì text prompt
├── Transfer style, face, or content từ reference
├── "Generate giống ảnh này nhưng..." 

Combinations (2026 Workflow):
  LoRA (custom character) + ControlNet (pose) + IP-Adapter (style)
  → Consistent character, exact pose, specific style
  → Production-quality output
```

---

## 8. Content Authenticity & Ethics

### 8.1 Deepfake & Content Authenticity

```
Concerns:
├── Deepfake videos: Fake political speeches, scam calls
├── AI-generated images: Fake news, misinformation
├── Voice cloning: Impersonation, fraud
├── Synthetic identities: KYC bypass

Solutions:
├── C2PA (Coalition for Content Provenance and Authenticity)
│   ├── Metadata gắn vào content: "AI-generated by [tool]"
│   ├── Adobe, Google, Microsoft, BBC tham gia
│   └── Content Credentials visible in browsers
│
├── Watermarking
│   ├── Invisible watermarks trong AI-generated images
│   ├── Google SynthID: imperceptible to humans
│   ├── Stable Diffusion: decoder-based watermark
│   └── ⚠️ Can be removed/modified
│
├── Detection Tools
│   ├── AI Image Detectors: Hive, Illuminarty
│   ├── Deepfake Detection: Microsoft Video Authenticator
│   └── ⚠️ Arms race: detectors vs generators
│
└── Regulations
    ├── EU AI Act: Mandatory disclosure AI-generated content
    ├── China: Watermarking requirements
    └── US: State-level deepfake laws
```

---

## FAQ & Best Practices

### Q1: Image Gen: Midjourney vs DALL-E vs Stable Diffusion?
**A:**
```
Midjourney v7: Best aesthetics, artistic, commercial
DALL-E 3: Best text rendering, safest, easiest
Stable Diffusion 3.5: Most customizable, free, local, open
FLUX 1.1: Best speed + quality balance, commercial API

Nếu bắt đầu: DALL-E 3 (easiest) hoặc Midjourney (best looking)
Nếu customize: Stable Diffusion + LoRA
Nếu production API: FLUX hoặc DALL-E 3
```

### Q2: AI coding tool nào tốt nhất?
**A:**
```
Có VS Code? → GitHub Copilot (mature, integrated)
Muốn AI-native IDE? → Cursor (best AI integration)
Terminal-based? → Claude Code (powerful agentic coding)
Enterprise/On-prem? → Tabnine hoặc Sourcegraph Cody
Budget? → Codeium/Windsurf (có free tier tốt)
```

### Best Practices

1. **Ethical use** — Always disclose AI-generated content
2. **Copyright check** — Verify training data licenses
3. **Human review** — AI generates, human curates
4. **Iterate** — First generation rarely perfect
5. **Combine tools** — Pipeline of specialized models
6. **Seed control** — Set seed for reproducibility
7. **Negative prompts** — Specify what you DON'T want

---

## Bài tập thực hành

### Bài 1: Image Generation
1. Generate 10 images với DALL-E 3 API
2. Thử different prompt techniques
3. Compare results: short prompt vs detailed prompt

### Bài 2: Code Generation
1. Setup GitHub Copilot hoặc Cursor
2. Build a REST API entirely with AI assistance
3. Measure productivity: with vs without AI

### Bài 3: Multi-modal Pipeline
1. Generate story script (LLM)
2. Generate illustrations (Image Gen)
3. Generate narration audio (TTS)
4. Combine into presentation/video

---

**Tiếp theo:** [Bài 10: Computer Vision & Multimodal AI →](./10-Computer-Vision.md)
