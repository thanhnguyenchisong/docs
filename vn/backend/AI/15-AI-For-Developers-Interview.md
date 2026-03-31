# Bài 15: AI cho Developer — Checklist & Phỏng vấn

## Mục lục
- [1. Lộ trình học AI cho Developer](#1-lộ-trình-học-ai-cho-developer)
- [2. Checklist kiến thức AI](#2-checklist-kiến-thức-ai)
- [3. Câu hỏi phỏng vấn — Concepts](#3-câu-hỏi-phỏng-vấn--concepts)
- [4. Câu hỏi phỏng vấn — Hands-on](#4-câu-hỏi-phỏng-vấn--hands-on)
- [5. Câu hỏi phỏng vấn — System Design](#5-câu-hỏi-phỏng-vấn--system-design)
- [6. Tools & Frameworks 2026](#6-tools--frameworks-2026)
- [7. Best Practices & Anti-patterns](#7-best-practices--anti-patterns)
- [8. Career Paths trong AI](#8-career-paths-trong-ai)

---

## 1. Lộ trình học AI cho Developer

### 1.1 Learning Path

```
PHASE 1: FOUNDATION (2-4 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Python proficient (pandas, numpy)
□ Statistics basics (mean, std, distributions)
□ Linear algebra basics (vectors, matrices, dot product)
□ ML concepts: supervised, unsupervised, overfitting
□ Scikit-learn: train/test split, cross-validation
→ Đọc: Bài 01-02

PHASE 2: NLP & TRANSFORMERS (2-3 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ NLP basics: tokenization, embeddings
□ Transformer architecture: attention, MHA
□ BERT vs GPT paradigm
□ Hugging Face Transformers library
→ Đọc: Bài 03-04

PHASE 3: LLMs & PROMPTING (2-3 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ LLM landscape 2026: GPT, Claude, Gemini, Llama
□ API integration (OpenAI, Anthropic API)
□ Prompt engineering: zero/few-shot, CoT
□ Context engineering
□ Structured output & Function Calling
→ Đọc: Bài 05-06

PHASE 4: RAG & AGENTS (3-4 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ RAG pipeline: chunk → embed → store → retrieve
□ Vector databases: pgvector, Qdrant
□ Hybrid search (BM25 + Vector)
□ Agent concepts: tool use, reasoning loop
□ MCP protocol
□ LangChain / LlamaIndex
→ Đọc: Bài 07-08, 11

PHASE 5: PRODUCTION (3-4 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Fine-tuning: LoRA, QLoRA
□ Model serving: vLLM, Ollama
□ Quantization: INT4, INT8
□ Monitoring & observability
□ Cost optimization
□ AI safety & guardrails
→ Đọc: Bài 12-14

TOTAL: ~3-4 tháng (full-time study)
       ~6-8 tháng (part-time / working)
```

---

## 2. Checklist kiến thức AI

### 2.1 Core Knowledge

```
ML FUNDAMENTALS
□ Supervised vs Unsupervised vs Reinforcement Learning
□ Bias-Variance tradeoff
□ Cross-validation
□ Evaluation metrics (Precision, Recall, F1, AUC)
□ Feature engineering basics
□ Common algorithms (Random Forest, XGBoost, SVM)

DEEP LEARNING
□ Neural network basics (layers, activations, backprop)
□ CNN cho images
□ Optimizer selection (Adam, AdamW)
□ Regularization (Dropout, BatchNorm)
□ Transfer Learning

NLP & TRANSFORMERS
□ Tokenization (BPE, SentencePiece)
□ Word Embeddings (Word2Vec → Contextual)
□ Attention mechanism
□ Transformer architecture (self-attention, MHA, FFN)
□ Encoder (BERT) vs Decoder (GPT)
□ Positional encoding (RoPE)

LLMs
□ LLM training pipeline (pre-train → SFT → RLHF)
□ Context windows & KV Cache
□ Inference parameters (temperature, top-p)
□ Tokenization & token counting
□ Benchmarks (MMLU, HumanEval, Arena)
□ Open vs Closed source tradeoffs
□ Cost estimation & optimization

PROMPT ENGINEERING
□ Zero/Few-shot prompting
□ Chain-of-Thought (CoT)
□ System prompt design
□ Structured output (JSON, Function Calling)
□ Prompt security (injection prevention)
□ Context engineering
```

### 2.2 Application Knowledge

```
RAG
□ RAG architecture: index → retrieve → generate
□ Chunking strategies
□ Embedding models selection
□ Vector search (cosine, HNSW)
□ Hybrid search (BM25 + Vector)
□ Re-ranking
□ Evaluation (RAGAS framework)

AGENTIC AI
□ Agent loop: Think → Act → Observe
□ Tool use & Function Calling  
□ MCP protocol
□ Multi-Agent patterns
□ Orchestration (LangGraph, CrewAI)
□ Memory (short-term, long-term)
□ Human-in-the-Loop

VECTOR DATABASES
□ Embedding generation & management
□ Vector DB options (pgvector, Qdrant, Pinecone)
□ Indexing (HNSW, IVF)
□ Metadata filtering
□ Polystore architecture

FINE-TUNING
□ SFT (Supervised Fine-Tuning)
□ LoRA & QLoRA
□ DPO / GRPO
□ Data preparation
□ Evaluation

MLOps & PRODUCTION
□ Model serving (vLLM, Triton)
□ Quantization (INT4, INT8)
□ Monitoring (latency, quality, drift)
□ CI/CD for ML
□ Cost optimization

AI SAFETY
□ Hallucination mitigation
□ Guardrails implementation
□ Bias awareness
□ EU AI Act basics
□ Red teaming concepts
```

---

## 3. Câu hỏi phỏng vấn — Concepts

### 3.1 ML Fundamentals

```
Q: Supervised vs Unsupervised Learning khác gì?
A: Supervised dùng labeled data (có answer) — classification, regression.
   Unsupervised tìm patterns trong unlabeled data — clustering, dimensionality reduction.

Q: Overfitting là gì? Cách giải quyết?
A: Model "học thuộc" training data, không generalize tốt trên new data.
   Giải quyết: More data, regularization (dropout, L2), cross-validation,
   early stopping, simpler model, data augmentation.

Q: Precision vs Recall — khi nào ưu tiên cái nào?
A: Precision (chính xác khi predict positive): ưu tiên khi FP costly 
   (spam filter → đừng đánh dấu email quan trọng là spam).
   Recall (bắt hết positives): ưu tiên khi FN costly 
   (cancer detection → đừng bỏ sót bệnh nhân).
```

### 3.2 Transformers & LLMs

```
Q: Self-Attention hoạt động như thế nào?
A: Mỗi token tạo Q, K, V vectors. Score = QKᵀ/√d → softmax → weights.
   Output = weights × V. Mọi token "attend" trực tiếp tới mọi token khác,
   capture dependencies bất kể khoảng cách.

Q: Tại sao Transformer nhanh hơn RNN?
A: Transformer xử lý mọi tokens PARALLEL (attention matrix computation).
   RNN phải sequential: x₁ → x₂ → x₃ → ... 
   Transformer tận dụng GPU parallelism, RNN không thể.

Q: GPT vs BERT — khi nào dùng cái nào?
A: GPT (decoder-only, left-to-right): Generation tasks — chatbot, coding, reasoning.
   BERT (encoder-only, bidirectional): Understanding tasks — classification, NER, embeddings.
   2026: GPT-style dominant. BERT cho lightweight classification/embedding.

Q: MoE (Mixture of Experts) hoạt động thế nào?
A: Thay 1 FFN lớn bằng N FFN nhỏ (experts) + Router.
   Mỗi token chỉ activate top-K experts (thường K=2).
   → Model lớn hơn (capacity) nhưng inference chỉ tốn cost K experts.
   Ví dụ: Mixtral 8×7B = 56B params, 14B active.

Q: KV Cache là gì? Tại sao quan trọng?
A: Cache K, V tensors từ previous tokens. Khi sinh token mới, 
   chỉ cần tính K,V cho token mới, không phải recompute all.
   Giảm computation O(n²) → O(n) per step.
   Tradeoff: tốn VRAM cho cache.
```

### 3.3 RAG & Agents

```
Q: Giải thích RAG pipeline?
A: 1) Indexing: Split docs → chunks → embed → store in vector DB
   2) Query: User query → embed → vector search → retrieve top-K chunks
   3) Generation: Chunks + query → LLM → answer grounded in retrieved data
   Giảm hallucination, access private/updated knowledge.

Q: Hybrid Search tốt hơn Vector Search thế nào?
A: Vector (dense): Capture semantic meaning — "weather" ↔ "climate conditions"
   BM25 (sparse): Exact keyword matching — "ERR_403" ↔ documents containing "ERR_403"
   Hybrid combines both → better recall cho cả semantic + keyword queries.
   Fusion: Reciprocal Rank Fusion (RRF).

Q: AI Agent vs Chatbot khác gì?
A: Chatbot: Passive — chỉ respond, no actions, stateless.
   Agent: Active — reasons, uses tools, takes actions, maintains state.
   Agent loop: Think (reason) → Act (call tool) → Observe (get result) → Repeat.

Q: MCP (Model Context Protocol) là gì?
A: Universal standard kết nối AI với external tools/data sources.
   "USB-C for AI" — bất kỳ MCP client ↔ MCP server.
   Thay vì custom integration per tool, 1 protocol cho all.
   Cung cấp: Tools (actions), Resources (data), Prompts (templates).
```

---

## 4. Câu hỏi phỏng vấn — Hands-on

### 4.1 Coding Questions

```
Q: Implement cosine similarity
A:
def cosine_similarity(a, b):
    dot = sum(ai*bi for ai, bi in zip(a, b))
    norm_a = sum(ai**2 for ai in a) ** 0.5
    norm_b = sum(bi**2 for bi in b) ** 0.5
    return dot / (norm_a * norm_b)

Q: Viết RAG pipeline đơn giản
A: (Xem code chi tiết trong Bài 07)
   1. Load & chunk documents
   2. Embed với OpenAI API
   3. Store trong vector DB (Chroma/Qdrant)
   4. Retrieve top-K cho user query
   5. Inject vào LLM prompt → generate answer

Q: Implement agent loop với tool calling
A: (Xem code chi tiết trong Bài 08)
   1. Send user query + tools definition to LLM
   2. If LLM returns tool_call → execute tool → add result
   3. Send updated messages to LLM
   4. Repeat until LLM returns text (no tool call)

Q: Fine-tune model với LoRA
A: (Xem code chi tiết trong Bài 12)
   1. Load base model in 4-bit (QLoRA)
   2. Configure LoRA (r=16, target attention layers)
   3. Prepare dataset (instruction/response pairs)
   4. Train with SFTTrainer
   5. Save & merge adapter
```

---

## 5. Câu hỏi phỏng vấn — System Design

### 5.1 Design Questions

```
Q: Thiết kế hệ thống AI Customer Support chatbot
A:
Architecture:
├── Frontend: Chat UI (React/Next.js)
├── Backend: API Service (FastAPI/Spring Boot)
├── AI Layer:
│   ├── Query Router: Classify intent → route to right handler
│   ├── RAG Pipeline: Search knowledge base for product/policy info
│   ├── Agent: For actions (create ticket, check order status)
│   └── LLM: Generate response grounded in context
├── Data Layer:
│   ├── Vector DB (Qdrant): Product docs, FAQs, policies
│   ├── SQL DB: Customer data, orders, tickets
│   └── Cache (Redis): Response caching
├── Safety:
│   ├── Input guardrails (PII, injection)
│   ├── Output guardrails (toxicity, accuracy)
│   └── Human escalation for complex issues
├── Monitoring:
│   ├── Latency, throughput
│   ├── Quality (user satisfaction, resolution rate)
│   └── Cost per conversation
└── Scale:
    ├── LLM: API (Claude/GPT) or self-hosted (vLLM + Llama)
    ├── Queue: Handle traffic spikes
    └── Caching: Reduce LLM calls

Q: Design an AI-powered code review system
A:
├── Git Integration: Webhook on PR creation
├── Diff Analysis: Extract changed files/lines
├── Multi-Agent Review:
│   ├── Security Agent: Check for vulnerabilities
│   ├── Style Agent: Check conventions, formatting
│   ├── Logic Agent: Review business logic
│   └── Test Agent: Suggest missing tests
├── Context: RAG with codebase docs, previous reviews
├── Output: Inline comments on PR
├── Human Override: Developer can dismiss AI suggestions
├── Learning: Feedback loop (accepted/rejected → improve)
└── Cost: Route simple reviews to small model, complex to large
```

---

## 6. Tools & Frameworks 2026

### 6.1 Essential Tools

```
LLM APIs:
├── OpenAI API (GPT-4o, o3)
├── Anthropic API (Claude 4)
├── Google AI (Gemini 2.5)
└── Local: Ollama, vLLM

Frameworks:
├── LangChain — General LLM application framework
├── LlamaIndex — Data-centric LLM framework
├── LangGraph — Agent orchestration with state machines
├── CrewAI — Multi-agent teams
├── DSPy — Programmatic prompt optimization
├── Haystack — Search + QA pipelines
└── Semantic Kernel — Microsoft ecosystem

Vector Databases:
├── pgvector (PostgreSQL extension)
├── Qdrant (Rust, self-hosted)
├── Pinecone (managed cloud)
├── Chroma (development/prototype)
└── Milvus (large-scale)

ML/DL:
├── PyTorch — Deep Learning framework
├── Hugging Face Transformers — Pre-trained models
├── Scikit-learn — Traditional ML
├── PEFT/TRL — Fine-tuning (LoRA, DPO)
├── Unsloth — Fast fine-tuning
└── MLflow — Experiment tracking

Serving:
├── vLLM — LLM inference server
├── Ollama — Local LLM running
├── TensorRT-LLM — NVIDIA optimized
├── BentoML — ML model packaging
└── FastAPI — Custom API serving

Monitoring:
├── LangSmith — LangChain observability
├── Weights & Biases — Experiment tracking
├── Evidently — Data/model monitoring
├── Prometheus + Grafana — Infrastructure
└── Helicone — LLM cost tracking
```

---

## 7. Best Practices & Anti-patterns

### 7.1 Best Practices

```
✅ DO:
├── Start simple → iterate (prompting → RAG → fine-tuning)
├── Evaluate on YOUR data (not just benchmarks)
├── Version control prompts like code
├── Cache LLM responses aggressively
├── Monitor quality AND cost continuously
├── Implement guardrails from day 1
├── Use model routing (cheap for simple, expensive for complex)
├── Document AI decisions (model cards, ADRs)
├── Test adversarially before launch
└── Human oversight for critical decisions
```

### 7.2 Anti-patterns

```
❌ DON'T:
├── Jump to fine-tuning before trying prompting + RAG
├── Trust benchmarks blindly (test on YOUR data)
├── Ignore costs (LLM bills can explode)
├── Skip guardrails ("we'll add safety later")
├── Use AI for everything (some tasks don't need AI)
├── Ignore latency (users won't wait 30 seconds)
├── Deploy without monitoring
├── Copy prompts from internet without testing
├── Assume model quality stays constant (drift exists)
└── Vendor lock-in (always have fallback models)
```

---

## 8. Career Paths trong AI

### 8.1 AI-related Roles

```
AI ENGINEER
├── Build AI-powered applications
├── Integrate LLMs, RAG, Agents into products
├── Skills: Python, LangChain, APIs, system design
├── Salary: $100K-200K (US) / $30K-70K (VN)
└── Demand: ★★★★★ (highest 2026)

ML ENGINEER
├── Train, optimize, deploy ML models
├── Focus on model performance & infrastructure
├── Skills: PyTorch, MLOps, distributed training, cloud
├── Salary: $120K-250K (US) / $35K-80K (VN)
└── Demand: ★★★★

DATA SCIENTIST
├── Analyze data, build predictive models
├── Business insights, experimentation
├── Skills: Statistics, Python, SQL, ML, communication
├── Salary: $100K-180K (US) / $25K-60K (VN)
└── Demand: ★★★

ML RESEARCH SCIENTIST
├── Push boundaries of ML/AI
├── Publish papers, develop new techniques
├── Skills: PhD (usually), deep math, PyTorch, research
├── Salary: $150K-400K (US)
└── Demand: ★★ (very specialized)

AI PRODUCT MANAGER
├── Define AI product strategy
├── Bridge between tech team and business
├── Skills: AI understanding, product management, communication
├── Salary: $120K-250K (US)
└── Demand: ★★★★

AI SOLUTIONS ARCHITECT
├── Design AI systems for enterprises
├── Technical consulting, architecture
├── Skills: Cloud, system design, AI knowledge
├── Salary: $130K-250K (US)
└── Demand: ★★★★
```

### 8.2 Transition Path cho Developers

```
Backend Developer → AI Engineer:
  Phase 1: Learn Python + ML basics (1-2 months)
  Phase 2: LLM APIs + Prompt Engineering (1 month)
  Phase 3: Build RAG system + Agents (2 months)
  Phase 4: Learn MLOps basics (1 month)
  Phase 5: Build portfolio project (1-2 months)

Frontend Developer → AI Engineer:
  Phase 1: Learn Python (2 months)
  Phase 2: LLM APIs integration (1 month)
  Phase 3: Build AI-powered UIs (2 months)
  Phase 4: Learn RAG + Vector DB (2 months)

DevOps → MLOps Engineer:
  Phase 1: ML basics (1-2 months)
  Phase 2: Model serving (vLLM, Triton) (1 month)
  Phase 3: ML pipelines (MLflow, Kubeflow) (2 months)
  Phase 4: GPU infrastructure (1 month)

💡 Key Insight 2026:
  AI Engineer ≠ knowing everything about ML
  AI Engineer = knowing how to BUILD PRODUCTS with AI
  Focus on: Integration, System Design, Production Quality
  NOT: Training models from scratch (only big labs do this)
```

---

## Tổng kết

```
AI Knowledge Stack cho Developer 2026:

MUST KNOW (Essential):
├── LLM APIs (OpenAI, Anthropic, Google)
├── Prompt Engineering / Context Engineering
├── RAG Fundamentals (chunk, embed, retrieve)
├── Basic Agent concepts (tool use, MCP)
├── Vector databases basics
├── AI safety awareness (guardrails, hallucination)
└── Cost optimization basics

SHOULD KNOW (Competitive advantage):
├── Fine-tuning (LoRA/QLoRA)
├── Transformer architecture
├── Advanced RAG (hybrid search, re-ranking, GraphRAG)
├── Multi-Agent systems
├── MLOps basics (serving, monitoring)
├── Quantization basics
└── EU AI Act compliance basics

NICE TO KNOW (Deep expertise):
├── Training LLMs from scratch
├── RLHF / DPO / GRPO
├── Model architecture design
├── Distributed training
├── Computer Vision
└── Research frontiers
```

---

**🎉 Hoàn thành bộ tài liệu AI! Quay lại [README →](./README.md)**
