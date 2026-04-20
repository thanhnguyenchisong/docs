# Bài 2: Claude trên Google Cloud Vertex AI

> Module: [Cloud Deployment](./README.md) → Bài 2

---

## 🔹 Vertex AI là gì?

Google Cloud Vertex AI là **managed ML platform** cung cấp Claude models qua Google Cloud infrastructure.

```
Lợi ích dùng Claude qua Vertex AI:
├── Billing qua GCP account
├── VPC Service Controls
├── Google Cloud IAM
├── Data stays trong GCP region
├── Kết hợp với BigQuery, Cloud Functions
└── EU data residency options
```

## 🔹 Setup

### 1. Enable API

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Cài SDK

```bash
pip install anthropic[vertex]
# hoặc
pip install google-cloud-aiplatform
```

### 3. Authentication

```bash
# Application Default Credentials
gcloud auth application-default login
```

## 🔹 Sử dụng với Anthropic SDK

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(
    project_id="your-gcp-project-id",
    region="us-east5",  # hoặc europe-west1
)

response = client.messages.create(
    model="claude-sonnet-4@20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "Xin chào từ Google Cloud!"
    }]
)

print(response.content[0].text)
```

## 🔹 Model IDs trên Vertex AI

| Model | Vertex Model ID |
|-------|----------------|
| Claude Sonnet 4 | `claude-sonnet-4@20250514` |
| Claude Opus 4 | `claude-opus-4@20250514` |
| Claude Haiku 3.5 | `claude-3-5-haiku@20241022` |

## 🔹 Regions

| Region | Location |
|--------|----------|
| `us-east5` | US (Ohio) |
| `europe-west1` | EU (Belgium) |
| `asia-southeast1` | Asia (Singapore) |

## 🔹 Features trên Vertex AI

- ✅ Messages API (full compatibility)
- ✅ Tool use
- ✅ Vision
- ✅ Streaming
- ✅ System prompts
- ✅ Vertex AI Model Garden
- ✅ Cloud Logging & Monitoring

## 🔹 So sánh: API trực tiếp vs Bedrock vs Vertex

| | Anthropic API | AWS Bedrock | GCP Vertex |
|-|--------------|-------------|------------|
| **Auth** | API key | IAM | IAM |
| **Billing** | Anthropic | AWS | GCP |
| **Data** | Anthropic servers | AWS region | GCP region |
| **SDK** | `anthropic` | `anthropic[bedrock]` | `anthropic[vertex]` |
| **Compliance** | SOC2 | FedRAMP, HIPAA | ISO, SOC2 |
| **Best for** | Startups, quick start | AWS-native teams | GCP-native teams |

---

## ➡️ Hoàn thành Module!

Tiếp theo:
- [AI Fluency](../09-ai-fluency/) — hiểu framework AI tổng quát
- [Building with API](../02-building-with-api/) — nếu chưa học API
