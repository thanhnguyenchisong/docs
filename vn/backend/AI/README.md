# 🤖 AI — Trí tuệ Nhân tạo từ Zero đến Production (15 bài)

Tài liệu toàn diện về **Trí tuệ Nhân tạo (AI)** cập nhật Q1/2026 — từ nền tảng Machine Learning đến triển khai production, bao gồm LLMs, RAG, Agentic AI, Generative AI, MLOps, và AI Safety.

---

## 📋 Mục lục

| # | Bài | Nội dung chính |
|---|-----|----------------|
| 01 | [AI & ML Fundamentals](./01-AI-ML-Fundamentals.md) | AI là gì, ML paradigms, thuật toán cổ điển, evaluation metrics |
| 02 | [Deep Learning & Neural Networks](./02-Deep-Learning-Neural-Networks.md) | Neural Networks, CNN, RNN, activation, backpropagation, PyTorch vs TF |
| 03 | [NLP Fundamentals](./03-NLP-Fundamentals.md) | Tokenization, embeddings, attention mechanism, NLP tasks |
| 04 | [Transformer Architecture](./04-Transformer-Architecture.md) | Self-Attention, positional encoding, BERT vs GPT, MoE, scaling laws |
| 05 | [Large Language Models](./05-Large-Language-Models.md) | GPT, Claude, Gemini, Llama — tokenization, inference, benchmarks |
| 06 | [Prompt Engineering](./06-Prompt-Engineering.md) | Zero/Few-shot, CoT, Context Engineering, DSPy, prompt security |
| 07 | [RAG](./07-RAG-Retrieval-Augmented-Generation.md) | Chunking, embedding, vector search, GraphRAG, hybrid search |
| 08 | [Agentic AI](./08-Agentic-AI.md) | Agent loop, tool use, MCP, multi-agent, LangChain, orchestration |
| 09 | [Generative AI](./09-Generative-AI.md) | Diffusion, image/video/audio generation, code generation |
| 10 | [Computer Vision & Multimodal](./10-Computer-Vision.md) | YOLO, SAM, VLMs, OCR, multimodal embeddings |
| 11 | [Vector Databases & Embeddings](./11-Vector-Databases-Embeddings.md) | Pinecone, Milvus, pgvector, HNSW, hybrid search |
| 12 | [Fine-Tuning & Training](./12-Fine-Tuning-Training.md) | SFT, LoRA, QLoRA, RLHF, DPO, GRPO, distillation |
| 13 | [MLOps & Deployment](./13-MLOps-Deployment.md) | vLLM, TensorRT, quantization, monitoring, CI/CD cho ML |
| 14 | [AI Safety & Ethics](./14-AI-Safety-Ethics-Governance.md) | Alignment, EU AI Act, guardrails, red teaming, responsible AI |
| 15 | [AI cho Developer — Interview](./15-AI-For-Developers-Interview.md) | Lộ trình học, checklist, câu hỏi phỏng vấn, career paths |

---

## 🗺️ Lộ trình đọc đề xuất

```
Giai đoạn 1: NỀN TẢNG (Bài 01–04)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI/ML cơ bản → Deep Learning → NLP → Transformer
  ↓
Giai đoạn 2: LLM & ỨNG DỤNG (Bài 05–09)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LLMs → Prompt Engineering → RAG → Agentic AI → Generative AI
  ↓
Giai đoạn 3: CHUYÊN SÂU (Bài 10–12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Computer Vision → Vector DB → Fine-tuning
  ↓
Giai đoạn 4: PRODUCTION & CAREER (Bài 13–15)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MLOps → AI Safety → Interview Prep
```

---

## 🎯 Ai nên đọc?

| Đối tượng | Bài nên đọc |
|-----------|-------------|
| **Developer muốn hiểu AI** | 01, 05, 06, 07, 08, 15 |
| **Backend Engineer tích hợp AI** | 05, 06, 07, 08, 11, 13 |
| **AI/ML Engineer** | Tất cả 01–15 |
| **Tech Lead / Architect** | 01, 05, 08, 13, 14 |
| **Chuẩn bị phỏng vấn AI** | 01, 04, 05, 06, 07, 08, 15 |

---

## 📊 Landscape AI tại Q1/2026

```
                    ┌─────────────────────────────────┐
                    │      FOUNDATION MODELS           │
                    │  GPT-4.5/5 │ Claude 4 │ Gemini 2.5│
                    │  Llama 4   │ Mistral  │ Qwen 3   │
                    └──────────────┬──────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
    ┌──────▼──────┐      ┌────────▼────────┐     ┌───────▼───────┐
    │  RAG Systems │      │  Agentic AI     │     │ Generative AI │
    │  GraphRAG    │      │  MCP Protocol   │     │ Image/Video   │
    │  Hybrid      │      │  Multi-Agent    │     │ Audio/Code    │
    └──────┬──────┘      └────────┬────────┘     └───────┬───────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │      INFRASTRUCTURE              │
                    │  Vector DB │ MLOps │ Guardrails  │
                    │  vLLM │ Kubernetes │ Monitoring  │
                    └─────────────────────────────────┘
```

---

**Cập nhật lần cuối:** Q1/2026
