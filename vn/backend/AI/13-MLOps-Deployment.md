# Bài 13: MLOps & Production Deployment

## Mục lục
- [1. ML Lifecycle](#1-ml-lifecycle)
- [2. Model Registry & Experiment Tracking](#2-model-registry--experiment-tracking)
- [3. CI/CD cho ML](#3-cicd-cho-ml)
- [4. Model Serving](#4-model-serving)
- [5. Quantization & Optimization](#5-quantization--optimization)
- [6. Monitoring & Observability](#6-monitoring--observability)
- [7. Scaling & Infrastructure](#7-scaling--infrastructure)
- [8. Cost Optimization](#8-cost-optimization)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. ML Lifecycle

### 1.1 ML Lifecycle Overview

```
┌─────────────────────────────────────────────────────┐
│                   ML LIFECYCLE                       │
│                                                     │
│  ┌──────┐   ┌──────┐   ┌─────┐   ┌──────┐         │
│  │ DATA │──→│TRAIN │──→│EVAL │──→│DEPLOY│         │
│  └──┬───┘   └──────┘   └──┬──┘   └──┬───┘         │
│     │                      │         │              │
│     │    ┌─────────────────┘         │              │
│     │    │ Not good enough           │              │
│     │    ▼                           │              │
│     │  ┌───────┐                     │              │
│     └──│ITERATE│                     │              │
│        └───────┘                     │              │
│                              ┌───────▼────────┐    │
│                              │    MONITOR      │    │
│                              │  (Production)   │    │
│                              └───────┬────────┘    │
│                                      │              │
│                              ┌───────▼────────┐    │
│                              │   RETRAIN      │    │
│                              │  (if degraded) │    │
│                              └────────────────┘    │
└─────────────────────────────────────────────────────┘

MLOps = DevOps + Data Engineering + ML
├── Version control: code + data + models + config
├── Automation: training pipelines, evaluation, deployment
├── Monitoring: performance, drift, costs
├── Reproducibility: same code + data → same results
└── Governance: audit trails, compliance
```

---

## 2. Model Registry & Experiment Tracking

### 2.1 MLflow — Standard Tool

```python
import mlflow
from mlflow.tracking import MlflowClient

# Start experiment
mlflow.set_experiment("sentiment-classification")

with mlflow.start_run(run_name="bert-base-v1"):
    # Log parameters
    mlflow.log_params({
        "model": "bert-base-uncased",
        "learning_rate": 2e-5,
        "epochs": 3,
        "batch_size": 32,
        "max_length": 512
    })
    
    # Train model...
    
    # Log metrics
    mlflow.log_metrics({
        "accuracy": 0.92,
        "f1": 0.91,
        "precision": 0.93,
        "recall": 0.89,
        "loss": 0.24
    })
    
    # Log model
    mlflow.pytorch.log_model(model, "model")
    
    # Log artifacts
    mlflow.log_artifact("confusion_matrix.png")

# Register model for deployment
client = MlflowClient()
client.create_registered_model("sentiment-classifier")
client.create_model_version(
    name="sentiment-classifier",
    source="runs:/abc123/model",
    run_id="abc123"
)

# Transition to production
client.transition_model_version_stage(
    name="sentiment-classifier",
    version=1,
    stage="Production"
)
```

---

## 3. CI/CD cho ML

### 3.1 ML Pipeline

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    paths:
      - 'models/**'
      - 'data/**'
      - 'training/**'

jobs:
  data-validation:
    runs-on: ubuntu-latest
    steps:
      - name: Validate data quality
        run: python scripts/validate_data.py
      - name: Check for data drift
        run: python scripts/check_drift.py

  train:
    needs: data-validation
    runs-on: [self-hosted, gpu]
    steps:
      - name: Train model
        run: python training/train.py --config configs/prod.yaml
      - name: Evaluate
        run: python training/evaluate.py

  quality-gates:
    needs: train
    steps:
      - name: Check accuracy threshold
        run: |
          ACCURACY=$(cat metrics.json | jq '.accuracy')
          if (( $(echo "$ACCURACY < 0.90" | bc -l) )); then
            echo "Accuracy below threshold: $ACCURACY < 0.90"
            exit 1
          fi
      - name: Bias/Fairness check
        run: python scripts/fairness_check.py
      - name: Security scan
        run: python scripts/security_scan.py

  deploy:
    needs: quality-gates
    steps:
      - name: Push to model registry
        run: python scripts/register_model.py
      - name: Canary deployment (5% traffic)  
        run: kubectl apply -f k8s/canary.yaml
      - name: Monitor canary (30 min)
        run: python scripts/monitor_canary.py --duration 30m
      - name: Full rollout
        run: kubectl apply -f k8s/production.yaml
```

---

## 4. Model Serving

### 4.1 LLM Serving — vLLM

```python
# vLLM — High-performance LLM serving
# Features: PagedAttention, continuous batching, tensor parallelism

# Install
# pip install vllm

# Start server
# python -m vllm.entrypoints.openai.api_server \
#   --model meta-llama/Llama-3.1-8B-Instruct \
#   --tensor-parallel-size 1 \
#   --max-model-len 8192 \
#   --gpu-memory-utilization 0.9

# Client (OpenAI-compatible API)
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=100
)

# vLLM Benefits:
# ├── PagedAttention: 24× higher throughput vs HF
# ├── Continuous Batching: dynamic request grouping
# ├── Tensor Parallelism: multi-GPU serving
# ├── Speculative Decoding: faster generation
# ├── OpenAI-compatible API: drop-in replacement
# └── Production-proven at scale
```

### 4.2 Serving Options Comparison

```
┌──────────────────┬──────────┬──────────┬──────────┐
│ Tool              │ Speed    │ Features │ Best For │
├──────────────────┼──────────┼──────────┼──────────┤
│ vLLM              │ ✅✅     │ ✅✅     │ LLM serve│
│ TensorRT-LLM      │ ✅✅✅   │ ✅       │ NVIDIA   │
│ Triton Server     │ ✅✅     │ ✅✅✅   │ Multi-fw │
│ TorchServe        │ ✅       │ ✅       │ PyTorch  │
│ TF Serving        │ ✅       │ ✅       │ TF models│
│ Ollama            │ ✅       │ ⚡       │ Local dev│
│ BentoML           │ ✅       │ ✅✅     │ ML apps  │
└──────────────────┴──────────┴──────────┴──────────┘

Recommendation:
├── LLM inference: vLLM (default) or TensorRT-LLM (NVIDIA)
├── Multi-framework: NVIDIA Triton
├── Local development: Ollama
├── Custom ML models: BentoML or FastAPI
└── Serverless: AWS SageMaker, Google Vertex AI
```

---

## 5. Quantization & Optimization

### 5.1 Quantization

```
Quantization: Giảm precision of weights → less memory, faster

Data Types:
├── FP32 (Full precision):   32 bits → 4 bytes/param
├── FP16 / BF16:             16 bits → 2 bytes/param → 2× savings
├── FP8:                     8 bits  → 1 byte/param  → 4× savings
├── INT8:                    8 bits  → 1 byte/param  → 4× savings
├── INT4 (GPTQ, AWQ):        4 bits  → 0.5 byte/param→ 8× savings
└── INT2-3:                  2-3 bits→ experimental

Memory Impact (Llama 3 70B):
├── FP32: 280 GB  ← not practical
├── FP16: 140 GB  ← 2× A100 80GB
├── INT8:  70 GB  ← 1× A100 80GB
├── INT4:  35 GB  ← 1× A100 40GB hoặc RTX 4090
└── GGUF Q4: ~40 GB  ← Consumer hardware possible

Quality Impact:
├── FP16: ~0% quality loss (baseline)
├── INT8: ~0.5% quality loss (negligible)
├── INT4 (GPTQ): ~1-2% quality loss (acceptable)
├── INT4 (AWQ): ~0.5-1% quality loss (better than GPTQ)
└── INT2: ~5-10% quality loss (significant)
```

### 5.2 Speculative Decoding

```
Speculative Decoding: Faster generation without quality loss

Standard: 
  Large Model generates 1 token at a time → SLOW
  Token 1 → Token 2 → Token 3 → ... → Token N

Speculative:
  1. Small "draft" model proposes K tokens quickly
  2. Large "target" model VERIFIES all K in ONE forward pass
  3. Accept valid tokens, reject from first wrong one
  4. Repeat
  
  Draft (1B): "The cat sat on the" → proposes "mat ." (2 tokens)
  Target (70B): Verifies "mat ." → Both correct! → Accept both
  → 2× tokens per step → ~1.5-2× speedup

No quality loss: Output identical to target model only
```

---

## 6. Monitoring & Observability

### 6.1 LLM Monitoring

```
LLM-Specific Metrics:

Performance:
├── TTFT (Time To First Token): Latency until first token appears
├── TPS (Tokens Per Second): Generation throughput
├── E2E Latency: Total request time
├── P95/P99 Latency: Tail latency
└── Requests Per Second: Throughput

Quality:
├── Hallucination Rate: % of responses with false info
├── Guardrail Trigger Rate: % blocked by safety filters
├── User Satisfaction: Thumbs up/down ratio
├── Task Success Rate: % of tasks completed correctly
└── Retrieval Quality (RAG): Precision, recall

Cost:
├── Cost per Request: Input + output tokens × price
├── Cost per User: Monthly AI spend per user
├── GPU Utilization: % of GPU capacity used
└── Cache Hit Rate: % of requests served from cache

Drift:
├── Input Drift: User query distribution changing
├── Output Drift: Model response quality changing
├── Data Drift: RAG knowledge base staleness
└── Concept Drift: Task requirements evolving
```

### 6.2 Monitoring Stack

```
┌─────────────────────────────────────────────┐
│              Monitoring Stack                │
├─────────────────────────────────────────────┤
│                                             │
│  Metrics Collection:                        │
│  ├── Prometheus (metrics)                   │
│  ├── OpenTelemetry (traces)                │
│  └── Custom LLM metrics                    │
│                                             │
│  Visualization:                             │
│  ├── Grafana (dashboards)                  │
│  └── Custom UI                             │
│                                             │
│  LLM-Specific:                              │
│  ├── LangSmith (LangChain monitoring)      │
│  ├── Weights & Biases (experiment tracking)│
│  ├── Evidently AI (data/prediction drift)  │
│  ├── WhyLabs (monitoring + guardrails)     │
│  └── Helicone (LLM observability)          │
│                                             │
│  Alerting:                                  │
│  ├── PagerDuty / OpsGenie                  │
│  ├── Cost alerts (billing threshold)       │
│  └── Quality alerts (accuracy drop)        │
└─────────────────────────────────────────────┘
```

---

## 7. Scaling & Infrastructure

### 7.1 Infrastructure Patterns

```
Single GPU:
├── Ollama / vLLM trên 1 GPU
├── Tốt cho: development, small traffic
└── Max: ~100 requests/min (7B model)

Multi-GPU (Tensor Parallelism):
├── Chia model across GPUs
├── vLLM --tensor-parallel-size 4
├── Tốt cho: large models (70B+)
└── Max: ~500 requests/min

Kubernetes + Auto-scaling:
├── Multiple replicas
├── HPA (Horizontal Pod Autoscaler) based on GPU/queue
├── Tốt cho: production, variable traffic
└── Max: Unlimited (add more pods)

Serverless:
├── AWS SageMaker Endpoints
├── Google Vertex AI
├── Azure ML
├── Scale to zero when no traffic → cost efficient
└── Trade-off: Cold start latency
```

### 7.2 GPU Options 2026

```
Consumer GPUs (Self-hosted):
├── RTX 4060 (8GB):    Small models (7B Q4)
├── RTX 4070Ti (12GB): Medium models (7B-13B)
├── RTX 4090 (24GB):   Large models (13B-34B Q4)
├── RTX 5090 (32GB):   Very large (34B-70B Q4)
└── 2× RTX 4090:       70B Q4 with tensor parallel

Cloud GPUs:
├── A10G (24GB): ~$1/hr — Good for 7-13B inference
├── A100 (80GB): ~$2-4/hr — 70B inference, fine-tuning
├── H100 (80GB): ~$3-8/hr — Fastest, large-scale
├── H200 (141GB): ~$5-12/hr — Largest memory
└── Spot/Preemptible: 60-80% discount

Cost-effective patterns:
├── Spot instances for training (OK to interrupt)
├── Reserved instances for serving (need uptime)
├── Multi-region for availability
└── On-demand for burst traffic
```

---

## 8. Cost Optimization

### 8.1 Strategies

```
LLM Cost Optimization:

1. Model Routing
   Simple query → small model ($0.001)
   Complex query → large model ($0.01)
   → 50-80% cost reduction

2. Caching
   ├── Exact cache: identical prompts → same response
   ├── Semantic cache: similar prompts → cached response
   ├── Prefix cache: reuse KV cache for shared prefixes
   └── → 20-40% cost reduction

3. Prompt Optimization
   ├── Shorter system prompts
   ├── Compression of retrieved context
   └── → 10-30% cost reduction

4. Batching
   ├── Batch API (50% discount, 24hr window)
   ├── Good for: analytics, embeddings, classifications
   └── → 50% cost reduction

5. Self-hosting
   ├── Break-even: typically 10K-50K requests/day
   ├── Open-source models (Llama, Qwen)
   ├── Quantized models (INT4) on consumer GPUs
   └── → 60-90% cost reduction at scale
```

---

## FAQ & Best Practices

### Q1: vLLM hay TensorRT-LLM?
**A:**
```
vLLM: Easier setup, more model support, community-driven
TensorRT-LLM: Maximum performance on NVIDIA GPUs, more complex

Recommendation: Start with vLLM → optimize with TensorRT if needed
```

### Q2: Quantization nào chọn?
**A:**
```
Production serving: AWQ INT4 hoặc GPTQ INT4
Development: GGUF Q4_K_M (Ollama compatible)
Maximum quality: FP8
Maximum speed: INT4 with TensorRT
```

### Best Practices

1. **Version everything** — Code, data, model, config
2. **Automated pipelines** — CI/CD cho train, eval, deploy
3. **Canary deployment** — Always test với small traffic first
4. **Monitor quality** — Not just uptime, but OUTPUT quality
5. **Cost tracking** — Per-request cost visibility
6. **Quantize for production** — INT4/INT8 gần lossless
7. **Cache aggressively** — Semantic + exact caching
8. **Plan for failure** — Fallback models, graceful degradation

---

## Bài tập thực hành

### Bài 1: Model Serving
1. Deploy Llama 3.1 8B với vLLM
2. Benchmark: TPS, TTFT, P99 latency
3. Compare FP16 vs INT4 performance

### Bài 2: MLOps Pipeline
1. Setup MLflow experiment tracking
2. Build training pipeline (train → eval → register)
3. Implement model versioning

### Bài 3: Production Deployment
1. Setup Kubernetes + vLLM
2. Implement auto-scaling based on GPU utilization
3. Add monitoring: Prometheus + Grafana
4. Implement canary deployment

---

**Tiếp theo:** [Bài 14: AI Safety, Ethics & Governance →](./14-AI-Safety-Ethics-Governance.md)
