# Bài 1: Truy cập API — API Key, Request, Multi-turn, System Prompts

> Module: [Building with the Claude API](./README.md) → Bài 1

---

## 🔹 1. Tổng quan Claude Models

| Model | Đặc điểm | Dùng khi |
|-------|----------|----------|
| **Claude Haiku** | Nhanh nhất, chi phí thấp nhất | Phân loại, trích xuất dữ liệu đơn giản |
| **Claude Sonnet** | Cân bằng tốc độ & chất lượng | Phần lớn use cases hàng ngày |
| **Claude Opus** | Mạnh nhất, phân tích sâu | Coding phức tạp, agents, long-horizon tasks |

## 🔹 2. Lấy API Key

1. Truy cập [Anthropic Console](https://console.anthropic.com/)
2. Đăng ký/đăng nhập
3. Vào **Settings → API Keys → Create Key**
4. Copy key (bắt đầu bằng `sk-ant-...`)

**Lưu ý bảo mật:**
- ❌ KHÔNG commit API key vào git
- ✅ Dùng environment variable

```bash
# Thiết lập environment variable
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Hoặc tạo file .env
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." > .env
```

## 🔹 3. Cài đặt SDK

```bash
# Python SDK
pip install anthropic

# Kiểm tra
python -c "import anthropic; print(anthropic.__version__)"
```

## 🔹 4. Request đầu tiên

```python
import anthropic

client = anthropic.Anthropic()  # tự đọc ANTHROPIC_API_KEY từ env

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Xin chào Claude! Bạn là ai?"}
    ]
)

print(message.content[0].text)
```

**Response structure:**
```python
# message object chứa:
message.id          # "msg_01XFDUDYJgAACzvnptvVoYEL"
message.type        # "message"
message.role        # "assistant"
message.content     # [ContentBlock(type='text', text='...')]
message.model       # "claude-sonnet-4-20250514"
message.stop_reason # "end_turn"
message.usage       # Usage(input_tokens=14, output_tokens=85)
```

## 🔹 5. Multi-turn Conversations (Đa lượt)

Claude **không nhớ** cuộc trò chuyện trước. Mỗi API call là **stateless**. Để tạo cuộc trò chuyện đa lượt, bạn phải gửi lại toàn bộ lịch sử.

```python
import anthropic

client = anthropic.Anthropic()

# Lưu lịch sử hội thoại
conversation = []

def chat(user_message):
    conversation.append({
        "role": "user",
        "content": user_message
    })
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=conversation  # gửi TOÀN BỘ lịch sử
    )
    
    assistant_message = response.content[0].text
    conversation.append({
        "role": "assistant",
        "content": assistant_message
    })
    
    return assistant_message

# Sử dụng
print(chat("Tôi tên là Thành"))
print(chat("Tôi tên là gì?"))  # Claude nhớ vì có lịch sử
```

**Quy tắc messages:**
```
1. Messages phải xen kẽ: user → assistant → user → assistant
2. Message đầu tiên PHẢI là "user"
3. Message cuối cùng PHẢI là "user" (câu hỏi cần trả lời)
```

## 🔹 6. System Prompts

System prompt đặt **ngữ cảnh và hành vi** cho Claude trước khi conversation bắt đầu.

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="Bạn là một chuyên gia Python. Trả lời ngắn gọn, "
           "luôn kèm code example. Dùng tiếng Việt.",
    messages=[
        {"role": "user", "content": "Cách sort dictionary theo value?"}
    ]
)
```

**Best practices cho System Prompt:**

```python
# System prompt tốt — cụ thể, có cấu trúc
system_prompt = """
Bạn là trợ lý kỹ thuật cho team backend. 

## Quy tắc:
1. Trả lời bằng tiếng Việt
2. Luôn kèm code example (Python)
3. Giải thích ngắn gọn, tối đa 200 từ
4. Nếu không chắc, nói rõ "Tôi không chắc chắn"

## Không được:
- Bịa thông tin
- Viết code không có error handling
"""
```

## 🔹 7. Model Parameters

| Parameter | Mô tả | Giá trị |
|-----------|--------|---------|
| `model` | Model Claude sử dụng | `claude-sonnet-4-20250514`, `claude-opus-4-20250514` |
| `max_tokens` | Số token tối đa trong response | 1 → 128000 |
| `messages` | Lịch sử hội thoại | Array [{role, content}] |
| `system` | System prompt | String |
| `temperature` | Độ "sáng tạo" | 0.0 → 1.0 (mặc định 1.0) |
| `top_p` | Nucleus sampling | 0.0 → 1.0 |
| `top_k` | Giới hạn token candidates | Integer |
| `stop_sequences` | Chuỗi dừng sinh text | Array of strings |

## 🔹 8. Xử lý lỗi

```python
import anthropic

client = anthropic.Anthropic()

try:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.AuthenticationError:
    print("❌ API key không hợp lệ")
except anthropic.RateLimitError:
    print("⏳ Rate limit — đợi rồi thử lại")
except anthropic.APIError as e:
    print(f"❌ API error: {e.status_code} - {e.message}")
```

**Các lỗi phổ biến:**

| Error | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| 401 Authentication | API key sai/hết hạn | Kiểm tra key |
| 429 Rate Limit | Quá nhiều request | Retry với exponential backoff |
| 400 Bad Request | Sai format messages | Kiểm tra xen kẽ user/assistant |
| 529 Overloaded | Server quá tải | Retry sau vài giây |

---

➡️ Tiếp theo: [Temperature & Streaming](02-temperature-streaming.md)
