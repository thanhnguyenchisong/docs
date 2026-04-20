# Bài 5: Tool Use — Gọi Function từ Claude

> Module: [Building with the Claude API](./README.md) → Bài 5

---

## 🔹 1. Tool Use là gì?

Tool use cho phép Claude **gọi functions** mà bạn define. Claude quyết định khi nào cần dùng tool dựa trên request của user và mô tả của tool.

```
Có 2 loại tools:
├── Client Tools → chạy trên MÁY BẠN (bạn execute)
│   ├── Custom functions (bạn viết)
│   ├── Bash tool
│   └── Text editor tool
│
└── Server Tools → chạy trên SERVER ANTHROPIC (tự execute)
    ├── Web Search
    ├── Web Fetch
    ├── Code Execution
    └── Tool Search
```

## 🔹 2. Agentic Loop — Vòng lặp Tool Use

```
┌────────────┐     ┌──────────┐     ┌────────────┐
│ User sends │ →   │ Claude   │ →   │ Claude     │
│ message    │     │ analyzes │     │ responds   │
└────────────┘     └──────────┘     └────────────┘
                        │                    ▲
                        │ needs tool?        │
                        ▼                    │
                   ┌──────────┐     ┌────────────┐
                   │ Returns  │ →   │ Your code  │
                   │ tool_use │     │ executes   │
                   │ block    │     │ the tool   │
                   └──────────┘     └────────────┘
                                         │
                                    ┌────▼───────┐
                                    │ Send       │
                                    │ tool_result│
                                    │ back       │
                                    └────────────┘
```

## 🔹 3. Định nghĩa Tools

```python
import anthropic
import json

client = anthropic.Anthropic()

# Định nghĩa tool bằng JSON Schema
tools = [
    {
        "name": "get_weather",
        "description": "Lấy thông tin thời tiết hiện tại của một thành phố",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "Tên thành phố (ví dụ: 'Hà Nội', 'TP HCM')"
                },
                "unit": {
                    "type": "string", 
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Đơn vị nhiệt độ"
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "calculate",
        "description": "Thực hiện phép tính toán học",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Biểu thức toán học (ví dụ: '2 + 3 * 4')"
                }
            },
            "required": ["expression"]
        }
    }
]
```

## 🔹 4. Xử lý Tool Calls

```python
def get_weather(city, unit="celsius"):
    """Mock function — thay bằng API thật"""
    weather_data = {
        "Hà Nội": {"temp": 28, "condition": "Nắng"},
        "TP HCM": {"temp": 33, "condition": "Mưa rào"},
    }
    data = weather_data.get(city, {"temp": 25, "condition": "Unknown"})
    return json.dumps(data, ensure_ascii=False)

def calculate(expression):
    """Evaluate math expression"""
    try:
        result = eval(expression)  # ⚠️ Demo only — dùng safe eval trong production
        return json.dumps({"result": result})
    except Exception as e:
        return json.dumps({"error": str(e)})

# Map tool names → functions
tool_functions = {
    "get_weather": get_weather,
    "calculate": calculate,
}

# Gửi request
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{
        "role": "user",
        "content": "Thời tiết Hà Nội thế nào? Và tính 15% của 2,500,000"
    }]
)

# Kiểm tra stop_reason
print(f"Stop reason: {response.stop_reason}")  # "tool_use"
```

## 🔹 5. Agentic Loop đầy đủ

```python
def run_agent(user_message):
    """Chạy full agentic loop với tool use"""
    
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )
        
        # Nếu Claude không cần tool → trả kết quả
        if response.stop_reason == "end_turn":
            final_text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    final_text += block.text
            return final_text
        
        # Nếu Claude cần tool → execute và gửi kết quả
        if response.stop_reason == "tool_use":
            # Thêm response của Claude vào messages
            messages.append({
                "role": "assistant",
                "content": response.content
            })
            
            # Xử lý từng tool call
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    func = tool_functions.get(block.name)
                    if func:
                        result = func(**block.input)
                    else:
                        result = json.dumps({"error": f"Unknown tool: {block.name}"})
                    
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })
            
            # Gửi tool results cho Claude
            messages.append({
                "role": "user",
                "content": tool_results
            })

# Sử dụng
answer = run_agent("Thời tiết Hà Nội? Và 15% của 2.5 triệu là bao nhiêu?")
print(answer)
```

## 🔹 6. Tool Choice — Kiểm soát khi nào dùng tool

```python
# auto (mặc định) — Claude tự quyết định
response = client.messages.create(
    tool_choice={"type": "auto"},  # hoặc bỏ qua
    ...
)

# any — bắt buộc dùng ít nhất 1 tool
response = client.messages.create(
    tool_choice={"type": "any"},
    ...
)

# specific tool — bắt buộc dùng tool cụ thể
response = client.messages.create(
    tool_choice={"type": "tool", "name": "get_weather"},
    ...
)
```

## 🔹 7. Server Tools — Tools chạy trên Anthropic

```python
# Web Search — không cần execute tự, Anthropic chạy
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=[{
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5
    }],
    messages=[{
        "role": "user",
        "content": "Tin tức mới nhất về AI regulations ở Việt Nam?"
    }]
)

# Response đã bao gồm search results — không cần loop!
for block in response.content:
    if hasattr(block, "text"):
        print(block.text)
```

## 🔹 8. Strict Tool Use

Đảm bảo Claude **luôn** trả đúng schema:

```python
tools = [{
    "name": "extract_info",
    "description": "Trích xuất thông tin từ văn bản",
    "strict": True,  # ← bảo đảm schema conformance
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "email": {"type": "string", "format": "email"},
            "phone": {"type": "string"}
        },
        "required": ["name", "email"]
    }
}]
```

---

## 📝 Tổng kết

| Khái niệm | Mô tả |
|-----------|-------|
| **Client tools** | Bạn define + execute, Claude chỉ gọi |
| **Server tools** | Anthropic define + execute (web search, code exec) |
| **Agentic loop** | Vòng lặp: Claude → tool_use → execute → tool_result → Claude |
| **Tool choice** | auto / any / specific tool |
| **Strict mode** | Đảm bảo output luôn match schema |

---

➡️ Tiếp theo: [RAG](06-rag.md)
