# Bài 4: Transformer Architecture

## Mục lục
- [1. Tại sao Transformer?](#1-tại-sao-transformer)
- [2. Self-Attention chi tiết](#2-self-attention-chi-tiết)
- [3. Multi-Head Attention](#3-multi-head-attention)
- [4. Positional Encoding](#4-positional-encoding)
- [5. Encoder-Decoder Full Architecture](#5-encoder-decoder-full-architecture)
- [6. BERT vs GPT — Encoder vs Decoder](#6-bert-vs-gpt--encoder-vs-decoder)
- [7. Scaling Laws & Emergent Abilities](#7-scaling-laws--emergent-abilities)
- [8. Mixture of Experts (MoE)](#8-mixture-of-experts-moe)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Tại sao Transformer?

### 1.1 Vấn đề của RNN/LSTM

```
RNN/LSTM — Hạn chế:
├── Sequential processing: x₁ → x₂ → x₃ → ... → xₙ
│   ❌ KHÔNG thể parallelize → chậm trên GPU
│   ❌ Training time tỷ lệ với sequence length
│
├── Long-range dependencies:
│   "The cat, which was sitting on the mat and playing 
│    with a ball of yarn, was hungry."
│   ❌ "cat" ↔ "hungry" quá xa → gradient vanish
│
└── Information bottleneck:
    ❌ Mọi thông tin phải qua hidden state → mất info

Transformer giải quyết TẤT CẢ:
├── ✅ Parallel processing — mọi token xử lý đồng thời
├── ✅ Direct connections — mọi token attend trực tiếp lẫn nhau
├── ✅ No bottleneck — Self-Attention capture global dependencies
└── ✅ Scalable — thêm GPU = nhanh hơn
```

### 1.2 Paper gốc "Attention Is All You Need" (2017)

```
Authors: Vaswani et al. (Google Brain/Research)
Key insight: Bỏ hoàn toàn RNN, CHỈ dùng Attention

Kết quả:
├── BLEU score: vượt mọi model trước đó (EN→DE, EN→FR)
├── Training time: 3.5 ngày trên 8 GPUs
├── Model size: 65M params (base), 213M (big)
└── Impact: Thay đổi TOÀN BỘ NLP, Vision, Audio, Protein, ...

Transformer mở ra:
GPT-1 (2018) → GPT-2 (2019) → GPT-3 (2020) → GPT-4 (2023)
BERT (2018) → RoBERTa (2019) → DeBERTa (2020)
ViT (2020) → DALL-E (2021) → Stable Diffusion (2022)
AlphaFold2 (2020) → Protein structure prediction
```

---

## 2. Self-Attention chi tiết

### 2.1 Intuition

```
Self-Attention: Mỗi token "nhìn" tất cả tokens khác để hiểu context

Ví dụ: "The animal didn't cross the street because it was too tired"

Khi xét từ "it":
  "it" attend to:
  ├── "animal" → score: 0.7  ← HIGH! "it" = "animal"
  ├── "street" → score: 0.05
  ├── "cross"  → score: 0.03
  ├── "tired"  → score: 0.12
  └── ... (attend to ALL tokens)

→ Model hiểu "it" = "animal" (không phải "street")
→ Mà KHÔNG cần explicit rules!
```

### 2.2 Tính toán Self-Attention

```
Input: Sequence of embeddings X = [x₁, x₂, ..., xₙ]  (n tokens, d dimensions)

Bước 1: Tạo Q, K, V matrices bằng learned linear projections
  Q = X × Wq    (Query: "Tôi muốn tìm gì?")
  K = X × Wk    (Key: "Tôi mang thông tin gì?")
  V = X × Wv    (Value: "Thông tin thực tế")
  
  Wq, Wk, Wv: Learnable weight matrices (d × dₖ)

Bước 2: Tính Attention Scores
  Scores = Q × Kᵀ
  
  Ví dụ 3 tokens:
  Scores = ┌─────────────────────┐
           │ q₁·k₁  q₁·k₂  q₁·k₃ │  ← token 1 attend to all
           │ q₂·k₁  q₂·k₂  q₂·k₃ │  ← token 2 attend to all
           │ q₃·k₁  q₃·k₂  q₃·k₃ │  ← token 3 attend to all
           └─────────────────────┘

Bước 3: Scale
  Scaled_Scores = Scores / √dₖ
  (Tránh softmax quá sharp khi dₖ lớn)

Bước 4: Softmax — normalize thành weights
  Attention_Weights = softmax(Scaled_Scores)
  (Mỗi hàng sum = 1)

Bước 5: Weighted Sum
  Output = Attention_Weights × V
  
  → Mỗi token nhận thông tin WEIGHTED từ tất cả tokens khác
```

### 2.3 Code — Self-Attention

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SelfAttention(nn.Module):
    def __init__(self, d_model, d_k):
        super().__init__()
        self.d_k = d_k
        self.W_q = nn.Linear(d_model, d_k)
        self.W_k = nn.Linear(d_model, d_k)
        self.W_v = nn.Linear(d_model, d_k)
    
    def forward(self, x):
        # x: (batch, seq_len, d_model)
        Q = self.W_q(x)    # (batch, seq_len, d_k)
        K = self.W_k(x)    # (batch, seq_len, d_k)
        V = self.W_v(x)    # (batch, seq_len, d_k)
        
        # Attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        # scores: (batch, seq_len, seq_len)
        
        # Softmax
        weights = F.softmax(scores, dim=-1)
        
        # Weighted sum
        output = torch.matmul(weights, V)
        # output: (batch, seq_len, d_k)
        
        return output, weights
```

---

## 3. Multi-Head Attention

### 3.1 Tại sao Multi-Head?

```
Single-Head Attention:
  ❌ Chỉ 1 "cách nhìn" — có thể miss relationships
  Ví dụ: "The cat sat on the mat and it purred"
  Single head có thể chỉ capture "syntactic" relationship

Multi-Head Attention (h heads):
  ✅ h "cách nhìn" song song — capture nhiều relationships
  
  Head 1: Capture syntactic (grammar) relationships
    "cat" ← "The" (determiner)
  
  Head 2: Capture semantic (meaning) relationships  
    "it" ← "cat" (coreference)
  
  Head 3: Capture positional relationships
    "sat" ← "on the mat" (location)
  
  ...

MultiHead(Q, K, V) = Concat(head₁, head₂, ..., headₕ) × Wₒ
  where headᵢ = Attention(Q × Wᵢq, K × Wᵢk, V × Wᵢv)

Thường: h = 8 (BERT base), h = 12 (BERT large), h = 96 (GPT-4)
```

### 3.2 Code — Multi-Head Attention

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # Linear projections + reshape to (batch, heads, seq_len, d_k)
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # Scaled Dot-Product Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        weights = F.softmax(scores, dim=-1)
        context = torch.matmul(weights, V)
        
        # Concat heads + final projection
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_o(context)
        
        return output
```

---

## 4. Positional Encoding

### 4.1 Tại sao cần Positional Encoding?

```
Vấn đề: Self-Attention KHÔNG có khái niệm "vị trí"
  
  "Dog bites man" vs "Man bites dog"
  → Attention scores GIỐNG NHAU nếu không có positional info!
  → Cần inject thông tin vị trí vào input

Giải pháp: Thêm Positional Encoding vào Input Embeddings
  Input = Token Embedding + Positional Encoding
```

### 4.2 Sinusoidal Positional Encoding (Original)

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))

pos: vị trí token (0, 1, 2, ...)
i: dimension index
d: model dimension

Đặc điểm:
├── Mỗi vị trí có encoding UNIQUE
├── Encode relative positions (PE[pos+k] có thể biểu diễn bằng PE[pos])
├── Extend được cho sequence dài hơn training
└── Deterministic (không cần learn)
```

### 4.3 Rotary Position Embedding (RoPE) — Chuẩn 2026

```
RoPE (Rotary Position Embedding):
├── Dùng bởi: Llama, Mistral, Qwen, hầu hết LLMs mới
├── Apply rotation matrix vào Q, K vectors
├── Relative position tự nhiên encode trong dot product
├── Better interpolation cho longer sequences
└── Better performance vs sinusoidal

ALiBi (Attention with Linear Biases):
├── Dùng bởi: BLOOM, MPT
├── Thay positional encoding = linear bias trong attention
├── Extrapolate tốt cho longer sequences
└── Đơn giản, hiệu quả
```

---

## 5. Encoder-Decoder Full Architecture

### 5.1 Transformer Block

```
Transformer Encoder Block:
  Input
    │
    ▼
  ┌─Multi-Head Self-Attention─┐
  │                            │
  └─────────┬─────────────────┘
            │
    ├───Add & Layer Norm──────┤ ← Residual Connection
            │
  ┌─Feed-Forward Network (FFN)─┐
  │   Linear(d, 4d) → GELU     │
  │   Linear(4d, d)             │
  └─────────┬──────────────────┘
            │
    ├───Add & Layer Norm──────┤ ← Residual Connection
            │
          Output

FFN (Position-wise Feed-Forward):
  FFN(x) = GELU(xW₁ + b₁)W₂ + b₂
  
  d_model = 768, d_ff = 3072 (4× expansion)
  → Mỗi token qua cùng FFN nhưng INDEPENDENT

Residual Connection:
  output = LayerNorm(x + SubLayer(x))
  → Giúp gradient flow qua deep networks
  → Giống ResNet nhưng cho Transformer
```

### 5.2 Full Transformer Architecture

```
ENCODER (N layers stacked):                DECODER (N layers stacked):
┌─────────────────────────┐              ┌─────────────────────────┐
│ Input Embedding         │              │ Output Embedding        │
│ + Positional Encoding   │              │ + Positional Encoding   │
├─────────────────────────┤              ├─────────────────────────┤
│ Self-Attention          │              │ Masked Self-Attention   │
│ Add & Norm              │              │ Add & Norm              │
├─────────────────────────┤              ├─────────────────────────┤
│ Feed-Forward            │              │ Cross-Attention         │
│ Add & Norm              │      ──K,V──→│ (Q from Decoder,        │
├─────────────────────────┤              │  K,V from Encoder)      │
│        × N              │              │ Add & Norm              │
└─────────────────────────┘              ├─────────────────────────┤
                                         │ Feed-Forward            │
Encoder output:                          │ Add & Norm              │
Context representations                 ├─────────────────────────┤
                                         │        × N              │
                                         ├─────────────────────────┤
                                         │ Linear + Softmax        │
                                         │ → Next token prediction │
                                         └─────────────────────────┘

Masked Self-Attention (Decoder):
  ⚠️ Decoder chỉ được nhìn tokens TRƯỚC nó (causal masking)
  Token tại position t KHÔNG thể attend to positions > t
  → Autoregressive generation: sinh từng token, trái → phải
```

### 5.3 Specs — BERT vs GPT (Original)

| Spec | BERT Base | BERT Large | GPT-2 | GPT-3 |
|------|-----------|------------|-------|-------|
| Layers (N) | 12 | 24 | 48 | 96 |
| Hidden (d_model) | 768 | 1024 | 1600 | 12,288 |
| Heads (h) | 12 | 16 | 25 | 96 |
| FFN (d_ff) | 3072 | 4096 | 6400 | 49,152 |
| Parameters | 110M | 340M | 1.5B | 175B |

---

## 6. BERT vs GPT — Encoder vs Decoder

### 6.1 Ba kiến trúc Transformer

```
1. ENCODER-ONLY (BERT family)
   ├── Bidirectional: nhìn CẢ trái lẫn phải
   ├── Pre-training: Masked Language Model (MLM)
   │   "The [MASK] sat on the mat" → predict "cat"
   ├── Tasks: Classification, NER, Sentence Embedding
   ├── Models: BERT, RoBERTa, DeBERTa, ELECTRA
   └── ⚠️ KHÔNG sinh text mới

2. DECODER-ONLY (GPT family) ← DOMINANT 2026
   ├── Unidirectional: chỉ nhìn trái (causal)
   ├── Pre-training: Next Token Prediction
   │   "The cat sat on the" → predict "mat"
   ├── Tasks: Text Generation, Conversation, Reasoning
   ├── Models: GPT-4, Claude, Llama, Mistral, Gemini
   └── ✅ SINH text, reasoning, coding, ...

3. ENCODER-DECODER (T5 family)
   ├── Full architecture (encoder + decoder)
   ├── Pre-training: Span Corruption
   │   "The <X> sat <Y> mat" → "<X> cat <Y> on the"
   ├── Tasks: Translation, Summarization
   ├── Models: T5, BART, mBART, FLAN-T5
   └── Tốt cho seq2seq tasks

⚠️ TREND 2026:
  Decoder-only (GPT-style) THỐNG TRỊ
  Lý do: in-context learning, versatile, scales better
  BERT-style: vẫn dùng cho embedding, classification (nhẹ, nhanh)
```

### 6.2 So sánh chi tiết

| Tiêu chí | BERT (Encoder) | GPT (Decoder) | T5 (Enc-Dec) |
|----------|----------------|---------------|--------------|
| **Direction** | Bidirectional | Left-to-right | Both |
| **Pre-training** | MLM + NSP | Next Token | Span Corruption |
| **Generation** | ❌ | ✅ | ✅ |
| **Understanding** | ✅✅ | ✅ | ✅ |
| **Fine-tuning** | Task-specific | In-context / SFT | Task-specific |
| **Phổ biến 2026** | Embeddings | ✅✅ Dominant | Ít dùng |

---

## 7. Scaling Laws & Emergent Abilities

### 7.1 Scaling Laws (Kaplan et al., 2020)

```
Scaling Laws:
  Model performance cải thiện PREDICTABLE khi tăng:
  
  1. Parameters (N): Số lượng weights
  2. Data (D): Tokens dùng training  
  3. Compute (C): FLOPs training

  L(N) ∝ N^(-0.076)  ← Loss giảm theo power law khi tăng params
  L(D) ∝ D^(-0.095)  ← Loss giảm theo power law khi tăng data
  L(C) ∝ C^(-0.050)  ← Loss giảm theo power law khi tăng compute

Chinchilla Scaling (2022):
  "Compute-optimal": Train model NHỎ hơn trên NHIỀU data hơn
  Optimal: tokens ≈ 20 × parameters
  
  GPT-3: 175B params, 300B tokens ← undertrained!
  Chinchilla: 70B params, 1.4T tokens ← better performance!
  
  → LLMs 2024+ follow Chinchilla: train nhiều data hơn
     Llama 3: 8B params → 15T tokens (1,875× ratio!)
```

### 7.2 Emergent Abilities

```
Emergent Abilities:
  Khả năng XUẤT HIỆN ĐỘT NGỘT khi model đủ lớn
  
  Model nhỏ (< 10B):
  ├── Không thể multi-step reasoning
  ├── Không thể in-context learning
  └── Không thể self-correct
  
  Model lớn (> 100B):
  ├── ✅ Chain-of-Thought reasoning
  ├── ✅ In-context learning (few-shot)
  ├── ✅ Code generation
  ├── ✅ Tool use
  └── ✅ Self-correction

  ⚠️ Debate 2025-2026:
  Có phải "emergent" thật hay chỉ là artifact of metrics?
  Một số researcher cho rằng abilities GRADUALLY improve,
  nhưng metric JUMPS tại threshold
```

---

## 8. Mixture of Experts (MoE)

### 8.1 MoE Architecture

```
MoE: Thay vì 1 FFN lớn → nhiều FFN nhỏ ("experts")
     + 1 Router chọn experts phù hợp

Standard Transformer FFN:
  Input → [FFN: 768→3072→768] → Output
  EVERY input qua CÙNG FFN → 100% params activated

MoE Transformer:
  Input → Router → chọn top-K experts
                    ├── Expert 1 (FFN)  ← activated nếu được chọn
                    ├── Expert 2 (FFN)  ← activated nếu được chọn
                    ├── Expert 3 (FFN)
                    ├── Expert 4 (FFN)
                    ├── ...
                    └── Expert N (FFN)
         Output ← weighted sum of selected experts

  Ví dụ: 8 experts, top-2 routing
  → Chỉ 2/8 = 25% params activated per token
  → Model 8× lớn hơn nhưng inference cost chỉ ≈2× 

Thực tế:
├── Mixtral 8×7B: 8 experts × 7B = "56B params", nhưng activate 2 = "14B cost"
├── GPT-4 (rumored): MoE architecture
├── DBRX: 132B total, 36B active
└── Llama 4 (Maverick): MoE architecture
```

### 8.2 Lợi ích & Thách thức MoE

```
✅ Lợi ích:
├── More capacity (params) với ít compute hơn
├── Specialization: mỗi expert chuyên 1 domain/task
├── Training efficient: scale model mà không scale cost linearly
└── Inference efficient: chỉ activate subset of params

❌ Thách thức:
├── Memory: vẫn cần load ALL experts vào memory
├── Load balancing: router phải distribute đều
├── Communication overhead: trong distributed training
└── Routing instability: router training không ổn định
```

---

## FAQ & Best Practices

### Q1: Tại sao Transformer tốt hơn RNN?
**A:**
```
1. Parallelization: Attention tính song song O(1) depth vs RNN O(n)
2. Long-range: Direct connection giữa mọi cặp tokens
3. Scalability: Thêm GPU → nhanh hơn
4. Transfer learning: Pre-train 1 lần → fine-tune nhiều tasks
```

### Q2: Attention complexity O(n²) — sao vẫn nhanh?
**A:**
```
O(n²) là với sequence length n (attention matrix n×n)
- GPU parallel: n×n matrix multiply rất nhanh trên GPU
- RNN: O(n) nhưng SEQUENTIAL → không parallelize → chậm hơn
- Nếu n quá lớn (>100K): dùng Flash Attention, Ring Attention
  → Optimize memory access patterns → gần linear
  
Flash Attention (Tri Dao):
├── IO-aware exact attention algorithm
├── 2-4× speedup, 5-20× memory reduction
└── Chuẩn cho mọi LLM inference 2026
```

### Q3: KV Cache là gì?
**A:**
```
KV Cache: Optimization cho autoregressive generation

Khi sinh token mới (position t):
├── KHÔNG cần tính lại K, V cho positions 0→t-1
├── Cache K, V từ steps trước → chỉ tính cho token mới
├── Giảm compute từ O(n²) → O(n) per step
└── Tradeoff: tốn memory (VRAM) cho cache

⚠️ KV Cache là LÝ DO chính tốn VRAM khi inference
   Llama 2 70B, context 4K: KV Cache ≈ 10GB
   → Quantized KV cache: FP8, INT4 → giảm 2-4×
```

### Best Practices

1. **Hiểu Attention trước** — nền tảng của mọi thứ LLM
2. **Flash Attention** — luôn dùng cho training & inference
3. **RoPE** — positional encoding chuẩn hiện tại
4. **Pre-/Post-LayerNorm** — Pre-LN stable hơn cho deep models
5. **MoE** — khi cần scale model mà giữ inference cost

---

## Bài tập thực hành

### Bài 1: Implement Self-Attention
1. Code Self-Attention from scratch (PyTorch)
2. Visualize attention weights cho câu "The cat sat on the mat"
3. So sánh single-head vs multi-head attention

### Bài 2: Transformer Block
1. Implement 1 Transformer Encoder Block (MHA + FFN + LayerNorm)
2. Stack 6 blocks → train trên toy task (sort numbers)
3. Visualize attention patterns ở mỗi layer

### Bài 3: Tìm hiểu models
1. Load BERT (bert-base-uncased) → visualize attention
2. So sánh BERT vs GPT-2: masked prediction vs next token
3. Thử MoE model nhỏ (Switch Transformer) trên Hugging Face

---

**Tiếp theo:** [Bài 5: Large Language Models →](./05-Large-Language-Models.md)
