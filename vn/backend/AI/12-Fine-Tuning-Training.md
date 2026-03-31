# Bài 12: Fine-Tuning & Training

## Mục lục
- [1. Pre-training vs Fine-tuning vs Prompting](#1-pre-training-vs-fine-tuning-vs-prompting)
- [2. Supervised Fine-Tuning (SFT)](#2-supervised-fine-tuning-sft)
- [3. LoRA & QLoRA](#3-lora--qlora)
- [4. RLHF](#4-rlhf)
- [5. DPO & GRPO](#5-dpo--grpo)
- [6. Distillation](#6-distillation)
- [7. Synthetic Data Generation](#7-synthetic-data-generation)
- [8. Tools & Cost Estimation](#8-tools--cost-estimation)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Pre-training vs Fine-tuning vs Prompting

### 1.1 So sánh

```
┌──────────────────────────────────────────────────────────┐
│                  MODEL ADAPTATION SPECTRUM                │
│                                                          │
│  NO CHANGE ──────────────────────────── FULL CHANGE      │
│                                                          │
│  Prompting    │   Fine-tuning    │   Pre-training        │
│  (Zero/Few)   │   (LoRA/SFT)     │   (From scratch)     │
│               │                   │                      │
│  Cost: $      │   Cost: $$        │   Cost: $$$$$$       │
│  Time: mins   │   Time: hours     │   Time: months       │
│  Data: 0-10   │   Data: 100-10K   │   Data: Trillions    │
│  Quality: ★★★ │   Quality: ★★★★   │   Quality: ★★★★★    │
│               │                   │                      │
│  80% cases    │   15% cases       │   5% cases           │
│               │                   │   (only big labs)     │
└──────────────────────────────────────────────────────────┘

Decision Framework:
1. Thử Prompting trước (zero/few-shot + RAG)
2. Nếu chưa đủ → Fine-tuning (LoRA/QLoRA)
3. Nếu vẫn chưa đủ → Full SFT
4. Pre-training từ đầu: CHỈ cho companies lớn (OpenAI, Google, Meta)
```

### 1.2 Khi nào cần Fine-tuning?

```
CẦN Fine-tuning khi:
├── Cần output FORMAT cụ thể consistently
├── Domain-specific language (medical, legal, finance)
├── Specific STYLE hoặc TONE
├── Reduce latency (fine-tuned small model > general large model)
├── Reduce cost (small fine-tuned > expensive API)
├── Data privacy (self-hosted fine-tuned model)
└── Specialized reasoning (code, math, domain logic)

KHÔNG CẦN Fine-tuning khi:
├── Prompting + RAG đủ tốt
├── Data < 100 examples
├── Task quá general
├── Quick prototype
└── Không có GPU/compute budget
```

---

## 2. Supervised Fine-Tuning (SFT)

### 2.1 SFT Process

```
SFT = Train model trên (instruction, response) pairs

Dataset format (JSON Lines):
{"messages": [
  {"role": "system", "content": "You are a medical assistant"},
  {"role": "user", "content": "What is diabetes?"},
  {"role": "assistant", "content": "Diabetes is a chronic condition..."}
]}

Process:
1. Prepare dataset (100-10,000+ examples)
2. Format data theo model template (ChatML, Llama format)
3. Fine-tune: Adjust ALL hoặc SOME weights
4. Evaluate on held-out test set
5. Deploy fine-tuned model

Data Quality > Data Quantity:
├── 500 high-quality examples > 5000 noisy examples
├── Diverse examples covering edge cases
├── Consistent format
├── Human-verified responses
└── No contradictions
```

### 2.2 OpenAI Fine-tuning API

```python
from openai import OpenAI

client = OpenAI()

# 1. Upload training data
file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# 2. Create fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini-2024-07-18",  # Base model
    hyperparameters={
        "n_epochs": 3,
        "batch_size": "auto",
        "learning_rate_multiplier": "auto"
    },
    suffix="my-custom-model"
)

# 3. Monitor training
events = client.fine_tuning.jobs.list_events(fine_tuning_job_id=job.id)
for event in events:
    print(event.message)

# 4. Use fine-tuned model
response = client.chat.completions.create(
    model="ft:gpt-4o-mini-2024-07-18:org:my-custom-model:abc123",
    messages=[{"role": "user", "content": "..."}]
)
```

---

## 3. LoRA & QLoRA

### 3.1 LoRA — Low-Rank Adaptation

```
LoRA: Fine-tune chỉ một PHẦN NHỎ của model

Full Fine-tuning:
  Model (7B params) → Update TẤT CẢ 7B params
  ❌ Cần 7 × 4 bytes = 28 GB VRAM (chỉ weights)
  ❌ Full copy of model per fine-tune task

LoRA:
  Model (7B params) → Freeze original weights
  → Thêm LOW-RANK matrices (A, B) vào attention layers
  → Chỉ train A, B (~0.1% of total params)
  
  W_original (frozen) + ΔW = W_original + A × B
  
  A: (d × r) matrix, B: (r × d) matrix
  r = rank (thường 8, 16, 32, 64)
  
  Ví dụ: d=4096, r=16
  Full: 4096 × 4096 = 16.7M params
  LoRA: 4096 × 16 + 16 × 4096 = 131K params (0.8%!)
  
  ✅ 10-100× ít parameters
  ✅ Ít VRAM hơn nhiều
  ✅ LoRA adapter file nhỏ (10-100 MB)
  ✅ Swap adapters cho different tasks
  ✅ Performance gần bằng full fine-tuning
```

### 3.2 QLoRA — Quantized LoRA

```
QLoRA = LoRA + Quantized base model

Trick: Load base model ở 4-bit (NF4 quantization)
       Train LoRA adapters ở 16-bit
       
Memory comparison (Llama 3 8B):
├── Full Fine-tuning:  ~60 GB VRAM
├── LoRA (FP16 base):  ~20 GB VRAM
├── QLoRA (4-bit base): ~6 GB VRAM  ← 1 GPU consumer!
└── → RTX 3060 12GB có thể fine-tune 7B model!

Performance:
├── QLoRA ≈ LoRA ≈ Full fine-tuning (gần bằng!)
├── QLoRA training chậm hơn LoRA ~30%
└── Kết quả: near-identical quality
```

### 3.3 Code — QLoRA Fine-tuning

```python
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    BitsAndBytesConfig, TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# 1. Load model in 4-bit
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype="float16",
    bnb_4bit_use_double_quant=True
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    quantization_config=bnb_config,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

# 2. Configure LoRA
lora_config = LoraConfig(
    r=16,                    # Rank
    lora_alpha=32,           # Scaling factor
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    task_type="CAUSAL_LM"
)

model = prepare_model_for_kbit_training(model)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# "trainable params: 13.1M || all params: 8.03B || 0.16%"

# 3. Training
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    weight_decay=0.01,
    warmup_ratio=0.03,
    lr_scheduler_type="cosine",
    fp16=True,
    logging_steps=10,
    save_strategy="epoch"
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    tokenizer=tokenizer,
    max_seq_length=2048
)

trainer.train()
model.save_pretrained("./my-lora-adapter")
```

---

## 4. RLHF

### 4.1 RLHF Pipeline

```
RLHF = Reinforcement Learning from Human Feedback
→ Align model với human preferences

Pipeline 3 steps:

Step 1: SFT (Supervised Fine-Tuning)
  [Instruction, Response] pairs → Fine-tune base model
  → Model biết follow instructions

Step 2: Reward Model Training
  Show 2 responses cho cùng prompt → Human chọn tốt hơn
  Prompt: "Explain quantum computing"
  Response A: "Quantum computing uses qubits..." ← Chosen
  Response B: "Computers are fast machines..."   ← Rejected
  
  Train Reward Model: input → score (higher = better)

Step 3: RL Optimization (PPO)
  SFT Model → generate response
  Reward Model → score response
  PPO → update model to maximize reward
  + KL penalty: đừng đi quá xa khỏi SFT model

⚠️ RLHF phức tạp:
├── Cần human annotators → đắt
├── Reward hacking: model exploit reward model weaknesses
├── Training unstable: PPO khó tune
├── 3 models cùng lúc: SFT + Reward + Policy
└── → DPO/GRPO giải quyết nhiều vấn đề
```

---

## 5. DPO & GRPO

### 5.1 DPO — Direct Preference Optimization

```
DPO: RLHF mà KHÔNG cần Reward Model + PPO

RLHF:  SFT → Train Reward Model → PPO RL training (3 steps, 3 models)
DPO:   SFT → DPO training trực tiếp (2 steps, 1 model)

DPO = "Implicit reward model"
├── Input: chosen/rejected pairs (giống RLHF step 2)
├── Trực tiếp optimize model preference
├── KHÔNG cần reward model riêng
├── KHÔNG cần PPO (simpler, more stable)
├── Significantly less compute
└── Performance comparable to RLHF

DPO Loss:
  L_DPO = -log σ(β × (log π(y_w|x) - log π(y_l|x) - log π_ref(y_w|x) + log π_ref(y_l|x)))
  
  y_w: chosen response
  y_l: rejected response  
  π: current model
  π_ref: reference model (SFT checkpoint)
```

### 5.2 GRPO — Group Relative Policy Optimization

```
GRPO (DeepSeek, 2025): Tối ưu cho REASONING

RLHF/DPO: Cần human-labeled preference data
GRPO: TỰ generate + TỰ evaluate (self-play)

Process:
1. Cho model generate N responses cho 1 prompt
2. Score responses (correct/incorrect, hoặc reward)
3. Group responses: better ones vs worse ones
4. Optimize: increase probability of better, decrease worse
5. NO separate reward model needed

Advantages:
├── Không cần human annotations
├── Self-improving loop
├── Particularly good for math & code reasoning
├── Used by DeepSeek R1 → state-of-art reasoning
└── Simpler than PPO, more effective for reasoning

GRPO = Future of LLM alignment/reasoning training
```

---

## 6. Distillation

### 6.1 Knowledge Distillation

```
Distillation: Train model NHỎ (student) bắt chước model LỚN (teacher)

Teacher (700B) → generate high-quality responses
Student (7B)  → learn from teacher's outputs

Methods:
├── Response Distillation:
│   Teacher generates answers → Student fine-tunes on them
│   Simplest, most common
│
├── Logit Distillation:
│   Student mimics teacher's output probability distribution
│   More information transfer, teacher must be accessible
│
└── Feature Distillation:
    Student mimics teacher's intermediate representations
    Most complex, highest quality transfer

Use cases:
├── Deploy smaller model (cost, latency)
├── Edge deployment (mobile, IoT)
├── Domain-specific small model
└── API cost reduction (distill GPT-4 → small local model)

⚠️ Legal/ToS: 
├── Many API providers PROHIBIT using outputs to train competing models
├── Check ToS before distilling from commercial APIs
├── OpenAI, Anthropic restrict this usage
└── Open-source models: OK to distill
```

---

## 7. Synthetic Data Generation

### 7.1 Tạo Training Data bằng AI

```
Synthetic Data: Dùng LLM lớn tạo training data cho model nhỏ

Workflow:
1. Define task & guidelines
2. LLM generates diverse examples
3. Filter & validate (human review hoặc automated)
4. Fine-tune smaller model trên synthetic data
5. Evaluate vs human-written data

Types:
├── Instruction-Response pairs
│   GPT-4 generate 10K instructions + responses
│
├── Preference pairs (cho DPO)
│   GPT-4 generate chosen + rejected responses
│
├── Chain-of-Thought data
│   GPT-4 generate step-by-step reasoning
│
└── Domain-specific Q&A
    GPT-4 read domain docs → generate Q&A pairs
```

### 7.2 Code — Synthetic Data Generation

```python
import openai
import json

def generate_synthetic_data(topic: str, n_examples: int = 100) -> list:
    """Generate synthetic instruction-response pairs"""
    
    prompt = f"""Generate {n_examples} diverse instruction-response pairs 
    about {topic} for fine-tuning an AI assistant.
    
    Requirements:
    - Diverse difficulty levels (beginner to expert)
    - Various question types (what, how, why, compare)
    - Detailed, accurate responses
    - Include code examples where relevant
    
    Format: JSON array of objects with "instruction" and "response" fields.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.8  # Diverse outputs
    )
    
    data = json.loads(response.choices[0].message.content)
    return data["examples"]

# Generate
examples = generate_synthetic_data("Python programming", n_examples=100)

# Validate & save
with open("synthetic_train.jsonl", "w") as f:
    for ex in examples:
        f.write(json.dumps({
            "messages": [
                {"role": "user", "content": ex["instruction"]},
                {"role": "assistant", "content": ex["response"]}
            ]
        }) + "\n")
```

---

## 8. Tools & Cost Estimation

### 8.1 Fine-tuning Tools

| Tool | Strengths | Best For |
|------|-----------|----------|
| **Hugging Face TRL** | Full-featured, open | LoRA, DPO, GRPO |
| **Unsloth** | 2× faster, less VRAM | QLoRA, consumer GPU |
| **Axolotl** | Config-driven, flexible | Production fine-tuning |
| **LLaMA Factory** | GUI + CLI, easy | Beginners, quick experiments |
| **OpenAI API** | Managed, no GPU needed | GPT fine-tuning |
| **Together AI** | Cloud fine-tuning | Open-source models |

### 8.2 Cost Estimation

```
Fine-tuning Cost (2026 estimates):

OpenAI API Fine-tuning:
├── GPT-4o-mini: $3.00 / 1M training tokens
├── GPT-4o: $25.00 / 1M training tokens
├── 1000 examples × 500 tokens = 500K tokens
├── GPT-4o-mini: ~$1.50 per run
├── 3 epochs = ~$4.50 total
└── Very affordable!

Self-hosted (Cloud GPU):
├── A100 80GB: ~$2/hour (AWS spot)
├── H100 80GB: ~$3/hour (AWS spot)
├── 7B model QLoRA: 2-4 hours → $4-12
├── 70B model QLoRA: 20-40 hours → $40-120
└── Consumer GPU (RTX 4090): $0/hour (own hardware)
    ├── 7B QLoRA: 2-4 hours electricity
    └── 13B QLoRA: 6-12 hours

Data Preparation Cost:
├── Human annotation: $0.50-5.00 per example
├── Synthetic data (GPT-4): $0.01-0.10 per example
└── 1000 examples: $10-100 (synthetic) vs $500-5000 (human)
```

---

## FAQ & Best Practices

### Q1: Bao nhiêu data cần cho fine-tuning?
**A:**
```
Minimum viable:
├── Format/Style change: 50-100 examples
├── Domain adaptation: 500-1,000 examples
├── New capability: 1,000-10,000 examples
├── Complex reasoning: 5,000-50,000 examples
└── Quality > Quantity — 500 tốt > 5000 kém
```

### Q2: LoRA rank r chọn bao nhiêu?
**A:**
```
r=8:  Fastest, least VRAM, OK for simple tasks
r=16: Good balance (DEFAULT recommendation)
r=32: Better for complex tasks
r=64: Near full fine-tuning quality
r=128+: Diminishing returns
→ Bắt đầu r=16, tăng nếu chưa đủ quality
```

### Q3: Full fine-tuning hay LoRA?
**A:**
```
LoRA/QLoRA (99% cases):
├── Ít VRAM, nhanh, gần bằng full
├── Swap adapters cho different tasks
└── Chỉ cần 1 GPU consumer

Full fine-tuning (1% cases):
├── Maximum quality needed
├── Rất nhiều data
├── Nhiều GPU available
└── Production model duy nhất (không cần swap)
```

### Best Practices

1. **Eval first** — Create eval set TRƯỚC khi fine-tune
2. **Start with LoRA** — Upgrade nếu cần
3. **High-quality data** — Clean, diverse, verified
4. **Small base model** — 7-13B thường đủ cho most tasks
5. **Hyperparameter sweep** — lr, epochs, rank
6. **Monitor overfitting** — Eval loss should decrease
7. **Test on edge cases** — Fine-tuned models can forget general knowledge

---

## Bài tập thực hành

### Bài 1: OpenAI Fine-tuning
1. Tạo 200 instruction-response pairs cho domain cụ thể
2. Fine-tune GPT-4o-mini qua API
3. Compare: base model vs fine-tuned model

### Bài 2: QLoRA
1. Setup QLoRA với Unsloth hoặc TRL
2. Fine-tune Llama 3.1 8B trên custom dataset
3. Test on consumer GPU (RTX 3060+)

### Bài 3: DPO
1. Generate preference pairs (chosen/rejected)
2. DPO training trên fine-tuned model
3. Compare: SFT only vs SFT + DPO

---

**Tiếp theo:** [Bài 13: MLOps & Deployment →](./13-MLOps-Deployment.md)
