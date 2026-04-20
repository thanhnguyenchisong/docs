# Bài 1: Claude trên Amazon Bedrock

> Module: [Cloud Deployment](./README.md) → Bài 1

---

## 🔹 Amazon Bedrock là gì?

AWS Bedrock là **managed service** cho phép dùng foundation models (Claude, Llama, Mistral...) qua AWS infrastructure — không cần quản lý servers.

```
Lợi ích dùng Claude qua Bedrock:
├── Billing qua AWS account (đã có)
├── VPC / PrivateLink support
├── AWS IAM authentication
├── Data stays trong AWS region
├── Guardrails & logging tích hợp
└── Kết hợp với Lambda, S3, SageMaker
```

## 🔹 Setup

### 1. Enable Claude trong Bedrock

```
AWS Console → Amazon Bedrock → Model access → Request access
→ Chọn Anthropic Claude models → Submit
```

### 2. Cài SDK

```bash
pip install anthropic[bedrock]
# hoặc
pip install boto3
```

### 3. Authentication

```bash
# Dùng AWS credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"
```

## 🔹 Sử dụng với Anthropic SDK

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(
    aws_region="us-east-1",
    # tự đọc AWS credentials từ env hoặc ~/.aws/credentials
)

response = client.messages.create(
    model="anthropic.claude-sonnet-4-20250514-v1:0",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "Xin chào từ AWS Bedrock!"
    }]
)

print(response.content[0].text)
```

## 🔹 Sử dụng với Boto3

```python
import boto3
import json

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [{
        "role": "user",
        "content": "Hello from Bedrock!"
    }]
})

response = bedrock.invoke_model(
    modelId="anthropic.claude-sonnet-4-20250514-v1:0",
    body=body
)

result = json.loads(response["body"].read())
print(result["content"][0]["text"])
```

## 🔹 Model IDs trên Bedrock

| Model | Bedrock Model ID |
|-------|-----------------|
| Claude Sonnet 4 | `anthropic.claude-sonnet-4-20250514-v1:0` |
| Claude Opus 4 | `anthropic.claude-opus-4-20250514-v1:0` |
| Claude Haiku 3.5 | `anthropic.claude-3-5-haiku-20241022-v1:0` |

## 🔹 Features trên Bedrock

- ✅ Messages API (full compatibility)
- ✅ Tool use
- ✅ Vision (images)
- ✅ Streaming
- ✅ System prompts
- ✅ Guardrails (AWS content filtering)
- ✅ CloudWatch monitoring

---

➡️ Tiếp theo: [Google Vertex AI](02-google-vertex-ai.md)
