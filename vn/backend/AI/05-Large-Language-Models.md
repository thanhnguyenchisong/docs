# Bài 5: Large Language Models (LLMs)

## Mục lục
- [1. LLM là gì?](#1-llm-là-gì)
- [2. LLM Landscape 2026](#2-llm-landscape-2026)
- [3. Tokenization](#3-tokenization)
- [4. Context Window & Memory](#4-context-window--memory)
- [5. Inference Parameters](#5-inference-parameters)
- [6. Open-source vs Closed-source](#6-open-source-vs-closed-source)
- [7. Benchmarks & Evaluation](#7-benchmarks--evaluation)
- [8. Chi phí & Pricing](#8-chi-phí--pricing)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. LLM là gì?

### 1.1 Định nghĩa

```
Large Language Model (LLM):
  Model AI dựa trên Transformer (decoder-only)
  Được pre-train trên lượng text khổng lồ (terabytes)
  Có khả năng hiểu và sinh ngôn ngữ tự nhiên

Đặc điểm chính:
├── Parameters: hàng tỷ → hàng nghìn tỷ
├── Training data: hàng nghìn tỷ tokens
├── Capabilities: generation, reasoning, coding, translation, ...
├── In-context learning: học từ examples trong prompt
└── Emergent abilities: khả năng mới xuất hiện khi scale lên
```

### 1.2 Cách LLM hoạt động

```
LLM = Next Token Prediction machine

Input:  "The capital of France is"
         ↓
Model:   P("Paris" | context)  = 0.85  ← CHỌN
         P("the"   | context)  = 0.03
         P("a"     | context)  = 0.02
         ...
Output: "Paris"

Autoregressive generation:
  "The capital" → "of" → "France" → "is" → "Paris" → "." → <EOS>
  Mỗi token PHỤ THUỘC vào tất cả tokens trước
  
Pre-training:
  Predict next token trên TOÀN BỘ internet text
  → Model "hiểu" ngôn ngữ, facts, reasoning, code, ...
  
Instruction-tuning (SFT):
  Fine-tune trên (instruction, response) pairs
  → Model biết FOLLOW instructions
  
RLHF / DPO:
  Align với human preferences
  → Model an toàn, helpful, honest
```

---

## 2. LLM Landscape 2026

### 2.1 Major LLM Providers

```
┌─────────────────────────────────────────────────────┐
│                  CLOSED-SOURCE                       │
├──────────┬────────────┬───────────┬─────────────────┤
│ OpenAI   │ Anthropic  │ Google    │ Others          │
├──────────┼────────────┼───────────┼─────────────────┤
│ GPT-4.5  │ Claude 4   │ Gemini   │ Cohere          │
│ GPT-4o   │ (Opus)     │ 2.5 Pro  │ Command R+      │
│ o3       │ Claude 4   │ Gemini   │                 │
│ (reason) │ (Sonnet)   │ 2.5 Flash│ Reka            │
│          │ Claude 4   │          │ AI21            │
│          │ (Haiku)    │          │                 │
├──────────┴────────────┴───────────┴─────────────────┤
│                  OPEN-SOURCE / OPEN-WEIGHT           │
├──────────┬────────────┬───────────┬─────────────────┤
│ Meta     │ Mistral    │ Alibaba  │ Others          │
├──────────┼────────────┼───────────┼─────────────────┤
│ Llama 4  │ Mistral    │ Qwen 3   │ DeepSeek V3/R1 │
│ (Scout)  │ Large 2    │ (72B)    │ Phi-4 (MSFT)   │
│ Llama 4  │ Codestral  │ Qwen 3   │ Gemma 3 (Goog) │
│ (Maverick│ Pixtral    │ (14B)    │ Yi-Lightning   │
│  MoE)    │            │ QwQ      │ DBRX           │
└──────────┴────────────┴───────────┴─────────────────┘
```

### 2.2 So sánh Top LLMs (Q1/2026)

| Model | Provider | Params | Context | Strengths |
|-------|----------|--------|---------|-----------|
| **GPT-4.5** | OpenAI | ~1.8T (MoE) | 128K | Broad capability, creative |
| **o3** | OpenAI | ~200B | 200K | Deep reasoning, math, code |
| **Claude 4 Opus** | Anthropic | ~2T | 200K | Reasoning, safety, long docs |
| **Claude 4 Sonnet** | Anthropic | ~300B | 200K | Best cost/performance ratio |
| **Gemini 2.5 Pro** | Google | MoE | 2M | Longest context, multimodal |
| **Gemini 2.5 Flash** | Google | MoE | 1M | Speed + cost efficient |
| **Llama 4 Maverick** | Meta | MoE 400B | 1M | Open-weight, competitive |
| **DeepSeek R1** | DeepSeek | MoE 671B | 128K | Reasoning, math, open |
| **Qwen 3 72B** | Alibaba | 72B | 128K | Strong multilingual, open |
| **Mistral Large 2** | Mistral | ~123B | 128K | European, code, multilingual |

---

## 3. Tokenization

### 3.1 BPE — Byte Pair Encoding

```
BPE Process:
  1. Bắt đầu: mỗi byte/character = 1 token
  2. Đếm cặp tokens adjacent phổ biến nhất
  3. Merge cặp đó thành 1 token mới
  4. Lặp lại đến khi đạt vocab_size

Ví dụ:
  Text: "low lower lowest"
  
  Step 0: ['l', 'o', 'w', ' ', 'l', 'o', 'w', 'e', 'r', ...]
  Step 1: Merge ('l','o') → 'lo': ['lo', 'w', ' ', 'lo', 'w', 'e', 'r', ...]
  Step 2: Merge ('lo','w') → 'low': ['low', ' ', 'low', 'e', 'r', ...]
  Step 3: Merge ('low','e') → 'lowe': ['lowe', 'r', ' ', 'lowe', 's', 't']
  ...

Vocab sizes:
├── GPT-2:     50,257 tokens
├── GPT-4:    100,277 tokens (cl100k_base)
├── Llama 3:  128,256 tokens
├── Claude:   ~100K tokens
└── Gemini:   ~256K tokens (SentencePiece)
```

### 3.2 Token Counting — Tại sao quan trọng

```python
# Token counting với tiktoken (OpenAI)
import tiktoken

encoding = tiktoken.encoding_for_model("gpt-4")

text = "Hello, how are you today?"
tokens = encoding.encode(text)
print(f"Text: {text}")
print(f"Tokens: {tokens}")         # [9906, 11, 1268, 527, 499, 3432, 30]
print(f"Token count: {len(tokens)}")  # 7 tokens

# Decode back
decoded = encoding.decode(tokens)
print(f"Decoded: {decoded}")       # "Hello, how are you today?"

# ⚠️ Quan trọng vì:
# 1. Pricing = per token (input + output)
# 2. Context limit = max tokens
# 3. Tiếng Việt tốn nhiều tokens hơn English
#    "Xin chào" ≈ 3-5 tokens vs "Hello" = 1 token

# Token count rules of thumb (English):
# 1 token ≈ 4 characters
# 1 token ≈ 0.75 words  
# 100 tokens ≈ 75 words
# 1 page ≈ 500-800 tokens
```

---

## 4. Context Window & Memory

### 4.1 Context Window Evolution

```
Context Window = Tổng tokens (input + output) model xử lý được

Timeline:
├── GPT-3 (2020):        4,096 tokens     ≈ 3 pages
├── GPT-3.5 (2023):     16,384 tokens     ≈ 12 pages
├── GPT-4 (2023):      128,000 tokens     ≈ 300 pages
├── Claude 3 (2024):   200,000 tokens     ≈ 500 pages
├── Gemini 1.5 (2024): 1,000,000 tokens   ≈ 1,500 pages
├── Gemini 2.5 (2025): 2,000,000 tokens   ≈ cả quyển sách
└── Claude 4 (2026):     200K standard, extended available

⚠️ Context dài ≠ nhớ tốt:
├── "Lost in the middle" problem — info ở giữa context dễ bị miss
├── Needle-in-a-haystack test — đo khả năng tìm info trong context dài
├── Retrieval accuracy giảm khi context quá dài
└── Cost tăng (pay per token) + latency tăng
```

### 4.2 Cách tối ưu Context

```
Strategies:
├── 1. Context Compression
│   ├── Tóm tắt documents trước khi đưa vào context
│   └── Dùng LLM nhỏ để compress → LLM lớn xử lý
│
├── 2. RAG (Retrieval-Augmented Generation)
│   ├── Chỉ retrieve relevant chunks thay vì cả document
│   └── Giảm context size, tăng relevance
│
├── 3. Structured Input
│   ├── XML/JSON structure giúp model parse tốt hơn
│   ├── Đặt instructions quan trọng ĐẦU hoặc CUỐI context
│   └── Tránh đặt info quan trọng ở GIỮA
│
└── 4. Sliding Window
    ├── Chia conversation dài thành windows
    └── Summarize window cũ → nạp vào context mới
```

---

## 5. Inference Parameters

### 5.1 Decoding Strategies

```python
# Gọi LLM API — Các parameters quan trọng

# Temperature — Kiểm soát randomness
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,  # 0.0 = deterministic, 2.0 = very random
    # temperature=0: Luôn chọn token probability cao nhất (greedy)
    # temperature=0.3: Ít random, good for coding/analysis
    # temperature=0.7: Balanced, good for general use
    # temperature=1.0: Default, creative writing
    # temperature=1.5+: Very creative, có thể incoherent
)

# Top-p (Nucleus Sampling) — Probability threshold
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    top_p=0.9,  # Chỉ xét tokens chiếm 90% probability mass
    # top_p=0.1: Very focused (ít choices)
    # top_p=0.9: Balanced
    # top_p=1.0: Consider all tokens
)

# Top-k — Chỉ xét K tokens probability cao nhất
# (Không phải tất cả APIs hỗ trợ)
# top_k=10: Chỉ chọn từ 10 tokens likely nhất

# Max tokens — Giới hạn output length
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1000,  # Tối đa 1000 tokens output
)

# Frequency/Presence Penalty — Giảm repetition
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}],
    frequency_penalty=0.5,  # Penalize repeated tokens (0-2)
    presence_penalty=0.5,   # Penalize tokens đã xuất hiện (0-2)
)
```

### 5.2 Hướng dẫn chọn Parameters

```
┌────────────────────────────────────────────────────────┐
│ Use Case              │ Temperature │ Top-p │ Max Tokens│
├───────────────────────┼─────────────┼───────┼──────────┤
│ Code generation       │ 0.0-0.2     │ 0.95  │ 2000     │
│ Data analysis         │ 0.0         │ 1.0   │ 1000     │
│ Q&A / Factual         │ 0.0-0.3     │ 0.9   │ 500      │
│ General conversation  │ 0.7         │ 0.9   │ 1000     │
│ Creative writing      │ 0.8-1.2     │ 0.95  │ 2000     │
│ Brainstorming         │ 1.0-1.5     │ 0.95  │ 1000     │
│ Translation           │ 0.0-0.3     │ 0.9   │ 1000     │
└────────────────────────────────────────────────────────┘

⚠️ KHÔNG set cả temperature VÀ top_p đều thấp
   → Quá restrictive, output boring
   Thường: chỉnh 1 trong 2, giữ cái còn lại default
```

---

## 6. Open-source vs Closed-source

### 6.1 So sánh

| Tiêu chí | Closed-source | Open-source/weight |
|----------|--------------|-------------------|
| **Ví dụ** | GPT-4, Claude, Gemini | Llama 4, Mistral, Qwen 3 |
| **Performance** | ✅ Best (thường) | ⚡ Catching up nhanh |
| **Cost** | Pay per API call | Free weights, pay compute |
| **Customization** | ❌ Hạn chế | ✅ Full fine-tuning |
| **Data Privacy** | ⚠️ Data gửi tới provider | ✅ Self-hosted, data stays |
| **Latency** | ⚠️ Network dependent | ✅ On-premise, low latency |
| **Vendor lock-in** | ❌ Phụ thuộc provider | ✅ Tự chủ |
| **Maintenance** | ✅ Provider xử lý | ❌ Tự maintain |
| **Compliance** | ⚠️ Dependent on provider | ✅ Full control |

### 6.2 Khi nào dùng gì?

```
Dùng CLOSED-SOURCE khi:
├── Cần best performance (GPT-4, Claude Opus)
├── Prototype nhanh, MVP
├── Không có GPU infrastructure
├── Team nhỏ, không có ML expertise
└── Cost per query chấp nhận được

Dùng OPEN-SOURCE khi:
├── Data privacy critical (healthcare, finance, government)
├── High volume, cần giảm cost
├── Cần customization (fine-tuning, domain-specific)
├── On-premise requirement
├── Cần control latency
└── Regulatory compliance (EU AI Act)

💡 Best Practice 2026: HYBRID
├── Prototype: closed-source (GPT-4, Claude)
├── Production: evaluate open-source (Llama, Qwen)
├── Sensitive data: open-source on-premise
└── Complex reasoning: closed-source API
```

---

## 7. Benchmarks & Evaluation

### 7.1 Major Benchmarks

| Benchmark | Đo gì | Mô tả |
|-----------|-------|-------|
| **MMLU** | Knowledge | 57 subjects, multiple-choice |
| **MMLU-Pro** | Knowledge+ | Harder version, 10 choices |
| **HumanEval** | Coding | Python function completion |
| **SWE-Bench** | Real coding | Fix real GitHub issues |
| **MATH/GSM8K** | Math | Word problems, competitions |
| **ARC** | Reasoning | Science questions |
| **HellaSwag** | Common sense | Sentence completion |
| **TruthfulQA** | Truthfulness | Avoid false claims |
| **MT-Bench** | Conversation | Multi-turn quality |
| **Arena Elo** | Overall | Human preference ranking |

### 7.2 Arena Elo — Gold Standard 2026

```
Chatbot Arena (lmsys.org):
├── Live platform: users so sánh 2 models (blind)
├── Elo rating: như chess ranking
├── Hàng triệu votes
├── Được coi là gold standard evaluation

Top Elo (Q1/2026, ước tính):
1. GPT-4.5        ~1350
2. Claude 4 Opus  ~1345
3. o3              ~1340
4. Gemini 2.5 Pro ~1335
5. DeepSeek R1    ~1310
6. Llama 4 Mav.   ~1300
7. Claude 4 Sonnet ~1295
8. Qwen 3 72B    ~1280

⚠️ Benchmark ≠ Real-world performance
├── Benchmark contamination (models train trên test data)
├── Cherry-picked examples
├── Không đo: latency, cost, safety, consistency
└── Luôn TEST trên DATA CỦA BẠN
```

---

## 8. Chi phí & Pricing

### 8.1 Pricing Models

```
API Pricing (per 1M tokens, ước tính Q1/2026):

┌──────────────────┬────────────────┬────────────────┐
│ Model             │ Input ($/1M)   │ Output ($/1M)  │
├──────────────────┼────────────────┼────────────────┤
│ GPT-4.5           │ $30.00         │ $60.00         │
│ GPT-4o            │ $2.50          │ $10.00         │
│ GPT-4o-mini       │ $0.15          │ $0.60          │
│ o3                │ $10.00         │ $40.00         │
│ Claude 4 Opus     │ $15.00         │ $75.00         │
│ Claude 4 Sonnet   │ $3.00          │ $15.00         │
│ Claude 4 Haiku    │ $0.25          │ $1.25          │
│ Gemini 2.5 Pro    │ $1.25          │ $10.00         │
│ Gemini 2.5 Flash  │ $0.075         │ $0.30          │
│ DeepSeek V3       │ $0.27          │ $1.10          │
├──────────────────┼────────────────┼────────────────┤
│ Open-source self  │ GPU cost       │ GPU cost       │
│ hosted (Llama 4)  │ ~$0.10-0.50    │ ~$0.10-0.50    │
└──────────────────┴────────────────┴────────────────┘

Ước tính cost thực tế:
├── 1 câu hỏi trung bình: ~500 input + 500 output tokens
├── GPT-4o: $0.00125 + $0.005 = $0.00625/query
├── Claude Haiku: $0.000125 + $0.000625 = $0.00075/query
├── Gemini Flash: $0.0000375 + $0.00015 = $0.000188/query
└── 100K queries/day:
    ├── GPT-4o: ~$625/day
    ├── Claude Haiku: ~$75/day
    └── Gemini Flash: ~$19/day
```

### 8.2 Cost Optimization Strategies

```
1. Model Routing
   ├── Simple queries → cheap model (Haiku, Flash)
   ├── Complex queries → expensive model (Opus, GPT-4)
   └── Classify query complexity → route accordingly

2. Caching
   ├── Semantic caching: similar prompts → cached response
   ├── Prefix caching: cache system prompt + common context
   └── Exact caching: identical queries → same response

3. Prompt Optimization
   ├── Shorter prompts = less cost
   ├── Remove unnecessary context
   └── Structured output (JSON) vs natural language

4. Batching
   ├── Batch API: up to 50% discount (OpenAI, Anthropic)
   ├── Acceptable for non-real-time tasks
   └── 24-hour processing window

5. Self-hosting
   ├── Open-source models cho high-volume
   ├── Break-even: typically 10K-50K queries/day
   └── Cần ML/infra expertise
```

---

## FAQ & Best Practices

### Q1: Model nào chọn cho dự án?
**A:**
```
Decision Tree:
1. Cần best performance bất kể cost?
   → Claude 4 Opus hoặc GPT-4.5

2. Cần cân bằng performance/cost?
   → Claude 4 Sonnet hoặc GPT-4o

3. Cần rẻ nhất?
   → Gemini 2.5 Flash hoặc Claude 4 Haiku

4. Cần data privacy?
   → Llama 4 hoặc Qwen 3 (self-hosted)

5. Cần reasoning/math?
   → o3 hoặc DeepSeek R1

6. Cần long context?
   → Gemini 2.5 Pro (2M tokens)
```

### Q2: LLMs có "hiểu" ngôn ngữ không?
**A:** Câu hỏi triết học. Từ góc độ kỹ thuật:
- **Có:** LLMs capture statistical patterns phức tạp, có thể reason, translate, code
- **Không:** Chỉ predict next token, không có "consciousness" hay real understanding
- **Thực tế:** Không quan trọng — quan trọng là OUTPUT có hữu ích không

### Q3: Hallucination là gì và cách giảm?
**A:**
```
Hallucination: LLM "bịa" thông tin nghe hợp lý nhưng SAI

Cách giảm:
├── RAG: Ground responses trong verified data
├── Temperature=0: Deterministic output
├── System prompt: "Nếu không biết, nói 'tôi không biết'"
├── Citation: Yêu cầu cite sources
├── Verification: Human review cho content quan trọng
└── Guardrails: Automated fact-checking layer
```

### Best Practices

1. **Start với API** — prototype trước, optimize sau
2. **Evaluate trên data THỰC** — đừng chỉ trust benchmarks
3. **System prompt quan trọng** — invest vào crafting good system prompts
4. **Cache aggressively** — giảm cost và latency
5. **Monitor costs** — set billing alerts
6. **Model routing** — đừng dùng 1 model cho mọi thứ
7. **Versioning** — lock model version cho production
8. **Fallback strategy** — backup model khi primary down

---

## Bài tập thực hành

### Bài 1: So sánh LLMs
1. Dùng 3 LLMs (GPT-4o, Claude Sonnet, Gemini Flash)
2. Test cùng 10 prompts: coding, reasoning, creative, factual
3. Đánh giá quality, speed, cost
4. Tạo bảng so sánh

### Bài 2: Tokenization
1. Install tiktoken, đếm tokens cho 10 câu EN vs VI
2. So sánh tokenization: GPT-4 vs Llama 3 vs Gemini
3. Tính cost ước lượng cho 1 triệu queries

### Bài 3: API Integration
1. Call OpenAI API (hoặc Anthropic) bằng Python
2. Thử thay đổi temperature, top_p → observe output changes
3. Implement streaming response
4. Implement retry logic + error handling

---

**Tiếp theo:** [Bài 6: Prompt Engineering →](./06-Prompt-Engineering.md)
