# Bài 7: Features — Extended Thinking, Vision, PDF, Citations, Caching

> Module: [Building with the Claude API](./README.md) → Bài 7

---

## 🔹 1. Extended Thinking

Cho Claude **suy nghĩ sâu** trước khi trả lời — cải thiện chất lượng cho bài toán phức tạp.

```python
import anthropic
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 8000  # ngân sách cho thinking
    },
    messages=[{
        "role": "user",
        "content": "Thiết kế kiến trúc microservices cho hệ thống e-commerce scale 1M users"
    }]
)

for block in response.content:
    if block.type == "thinking":
        print("🧠 Thinking:", block.thinking[:200], "...")
    elif block.type == "text":
        print("💬 Answer:", block.text)
```

### Adaptive Thinking (khuyến nghị)

```python
# Claude tự quyết định khi nào cần think
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={"type": "adaptive"},  # tự điều chỉnh
    messages=[{"role": "user", "content": "..."}]
)
```

### Effort Parameter

```python
# Kiểm soát mức độ effort
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={"type": "adaptive", "effort": "xhigh"},
    # effort: low | medium | high | xhigh | max
    messages=[{"role": "user", "content": "..."}]
)
```

| Effort | Dùng cho | Token usage |
|--------|----------|-------------|
| `low` | Task đơn giản, cần nhanh | Thấp nhất |
| `medium` | Cân bằng cost/quality | Vừa phải |
| `high` | Phân tích phức tạp | Cao |
| `xhigh` | Coding, agentic tasks | Rất cao |
| `max` | Task cực khó | Cao nhất |

## 🔹 2. Vision — Phân tích hình ảnh

```python
import anthropic, base64

client = anthropic.Anthropic()

# Cách 1: Từ URL
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": "https://example.com/chart.png"
                }
            },
            {
                "type": "text",
                "text": "Phân tích biểu đồ này và tóm tắt xu hướng chính"
            }
        ]
    }]
)

# Cách 2: Từ file (Base64)
with open("screenshot.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data
                }
            },
            {
                "type": "text",
                "text": "Đây là screenshot UI. Đánh giá UX và đề xuất cải thiện."
            }
        ]
    }]
)
```

## 🔹 3. PDF Support

```python
import anthropic, base64

client = anthropic.Anthropic()

# Đọc PDF
with open("report.pdf", "rb") as f:
    pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": pdf_data
                }
            },
            {
                "type": "text",
                "text": "Tóm tắt báo cáo này thành 5 bullet points chính"
            }
        ]
    }]
)
```

## 🔹 4. Citations

Yêu cầu Claude **trích dẫn nguồn** khi trả lời:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": pdf_data
                },
                "citations": {"enabled": True}  # bật citations
            },
            {
                "type": "text",
                "text": "Doanh thu Q3 là bao nhiêu?"
            }
        ]
    }]
)

# Response chứa citations
for block in response.content:
    if block.type == "text":
        print(block.text)
    # Citations reference back to source document
```

## 🔹 5. Prompt Caching

Cache phần prompt lớn để **giảm chi phí và latency** cho các request lặp lại.

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": "Bạn là trợ lý kỹ thuật...",  # system prompt nhỏ
    }],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": long_document,  # tài liệu dài
                    "cache_control": {"type": "ephemeral"}  # ← CACHE
                },
                {
                    "type": "text",
                    "text": "Tóm tắt section 3 của tài liệu trên"
                }
            ]
        }
    ]
)

# Check cache usage
print(f"Cache created: {response.usage.cache_creation_input_tokens}")
print(f"Cache read:    {response.usage.cache_read_input_tokens}")
```

**Quy tắc Prompt Caching:**
- Phần cached phải **≥ 1024 tokens** (Haiku) hoặc **≥ 2048 tokens** (Sonnet/Opus)
- Cache tồn tại **5 phút** (TTL) — auto hết hạn
- Đọc cache **rẻ hơn 90%** so với input mới
- Tạo cache **đắt hơn 25%** lần đầu

```
Cost comparison (per 1M tokens):
├── Normal input:        $3.00
├── Cache write (1 lần): $3.75  (+25%)
├── Cache read (N lần):  $0.30  (-90%)
└── Breakeven: ~2 requests
```

## 🔹 6. Code Execution

Claude có thể **chạy code** trên server Anthropic:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    tools=[{
        "type": "code_execution_20250522",
        "name": "code_execution"
    }],
    messages=[{
        "role": "user",
        "content": "Vẽ biểu đồ doanh thu theo quý: Q1=100, Q2=150, Q3=120, Q4=200"
    }]
)
```

---

## 📝 Tổng kết Features

| Feature | Mục đích | Khi nào dùng |
|---------|----------|-------------|
| **Extended Thinking** | Suy nghĩ sâu | Math, coding, thiết kế |
| **Vision** | Phân tích ảnh | UI review, chart analysis |
| **PDF** | Đọc tài liệu | Tóm tắt, trích xuất |
| **Citations** | Trích dẫn nguồn | RAG, research |
| **Prompt Caching** | Giảm cost/latency | Prompt lặp lại |
| **Code Execution** | Chạy code | Data viz, calculations |

---

➡️ Tiếp theo: [MCP trong API](08-mcp-in-api.md)
