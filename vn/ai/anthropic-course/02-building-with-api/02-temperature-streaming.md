# Bài 2: Temperature, Streaming, và Structured Data

> Module: [Building with the Claude API](./README.md) → Bài 2

---

## 🔹 1. Temperature — Kiểm soát "sáng tạo"

Temperature quyết định mức độ **ngẫu nhiên** trong output của Claude.

| Temperature | Hành vi | Dùng cho |
|------------|---------|----------|
| `0.0` | Deterministic, nhất quán | Classification, extraction, code |
| `0.3-0.5` | Ít sáng tạo, vẫn ổn định | Business writing, tóm tắt |
| `0.7-0.8` | Cân bằng | Chat thông thường |
| `1.0` | Sáng tạo nhất (mặc định) | Brainstorm, creative writing |

```python
import anthropic

client = anthropic.Anthropic()

# Temperature thấp → kết quả nhất quán
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=0.0,  # deterministic
    messages=[
        {"role": "user", "content": "Phân loại email này: 'Đơn hàng #123 bị lỗi'"}
    ]
)

# Temperature cao → kết quả đa dạng
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    temperature=1.0,  # creative
    messages=[
        {"role": "user", "content": "Viết 3 slogan cho quán cà phê"}
    ]
)
```

## 🔹 2. Streaming — Nhận response từng phần

Thay vì đợi Claude xong hết mới nhận response, streaming cho phép nhận **từng token** khi được sinh ra → UX tốt hơn, giảm cảm giác chờ đợi.

```python
import anthropic

client = anthropic.Anthropic()

# Streaming response
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Giải thích Docker trong 5 câu"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

print()  # newline cuối
```

### Streaming Events

Khi dùng raw streaming, bạn nhận các event types:

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
) as stream:
    for event in stream:
        # Event types:
        # message_start    → bắt đầu message
        # content_block_start → bắt đầu content block
        # content_block_delta → từng phần text
        # content_block_stop  → kết thúc block
        # message_delta    → cập nhật message (stop_reason, usage)
        # message_stop     → kết thúc message
        pass
```

### Final message từ stream

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
) as stream:
    response = stream.get_final_message()
    
# response giống hệt response từ messages.create()
print(response.content[0].text)
print(response.usage)
```

## 🔹 3. Structured Data — Output có cấu trúc

### Cách 1: Yêu cầu JSON trong prompt

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": """Phân tích đoạn review sau và trả kết quả dạng JSON:

Review: "Sản phẩm tốt nhưng giao hàng chậm quá, đợi 5 ngày"

Format:
{
    "sentiment": "positive" | "negative" | "mixed",
    "topics": ["list of topics"],
    "score": 1-5,
    "summary": "tóm tắt 1 câu"
}

Chỉ trả JSON, không thêm text nào khác."""
    }]
)

import json
result = json.loads(response.content[0].text)
print(result)
# {'sentiment': 'mixed', 'topics': ['quality', 'delivery'], 
#  'score': 3, 'summary': 'Sản phẩm tốt nhưng giao hàng chậm'}
```

### Cách 2: Stop sequences

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    stop_sequences=["```"],  # dừng khi gặp code block end
    messages=[{
        "role": "user",
        "content": "Trả kết quả phân loại trong JSON code block:\n```json\n"
    }]
)
```

### Cách 3: Structured Outputs (khuyến nghị)

Anthropic hỗ trợ **structured outputs** đảm bảo response luôn match JSON schema:

```python
import anthropic
import json

client = anthropic.Anthropic()

# Dùng tool definition để force JSON schema
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=[{
        "name": "analyze_review",
        "description": "Phân tích nội dung review",
        "input_schema": {
            "type": "object",
            "properties": {
                "sentiment": {
                    "type": "string",
                    "enum": ["positive", "negative", "mixed"]
                },
                "topics": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "score": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 5
                }
            },
            "required": ["sentiment", "topics", "score"]
        }
    }],
    tool_choice={"type": "tool", "name": "analyze_review"},
    messages=[{
        "role": "user",
        "content": "Phân tích: 'Sản phẩm tuyệt vời, ship nhanh!'"
    }]
)

# Response luôn đúng schema
result = response.content[0].input
print(result)
# {'sentiment': 'positive', 'topics': ['quality', 'delivery'], 'score': 5}
```

---

## 📝 Tổng kết

| Tính năng | Mục đích | Khi nào dùng |
|-----------|----------|-------------|
| **Temperature** | Kiểm soát randomness | Phân loại → 0, Creative → 1.0 |
| **Streaming** | Nhận output từng phần | UI real-time, chatbot |
| **Structured Data** | Output đúng format | API pipeline, data extraction |

---

➡️ Tiếp theo: [Prompt Evaluation](03-prompt-evaluation.md)
