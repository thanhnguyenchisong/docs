# Bài 4: Prompt Engineering — Kỹ thuật viết Prompt hiệu quả

> Module: [Building with the Claude API](./README.md) → Bài 4

---

## 🔹 1. Quy tắc vàng: Rõ ràng và Trực tiếp

> "Hãy nghĩ Claude như một đồng nghiệp mới — thông minh nhưng chưa có ngữ cảnh. Nếu đồng nghiệp bạn bối rối khi đọc prompt, Claude cũng vậy."

**Prompt mơ hồ:**
```
Giúp tôi với code
```

**Prompt rõ ràng:**
```
Viết function Python nhận vào list số nguyên, 
trả về list chỉ chứa số chẵn, đã sort tăng dần.
Kèm docstring và 3 test cases.
```

### Checklist cho prompt rõ ràng:
- ✅ Nêu rõ **nhiệm vụ cụ thể**
- ✅ Chỉ định **format output** mong muốn
- ✅ Nêu **giới hạn** (độ dài, ngôn ngữ, phong cách)
- ✅ Cung cấp **ngữ cảnh** nếu cần
- ✅ Dùng **numbered steps** khi thứ tự quan trọng

## 🔹 2. XML Tags — Cấu trúc Prompt

XML tags giúp Claude phân biệt rõ: đâu là hướng dẫn, đâu là dữ liệu, đâu là ví dụ.

```python
prompt = """
<instructions>
Phân tích email khách hàng và trích xuất thông tin.
Trả về JSON với các trường: subject, urgency, action_needed.
</instructions>

<context>
Bạn là chuyên viên hỗ trợ khách hàng của công ty phần mềm.
Urgency levels: low, medium, high, critical.
</context>

<email>
Chào team,
Hệ thống ERP bị crash từ sáng nay, 50 nhân viên không thể 
làm việc. Cần sửa gấp trong hôm nay.
Trân trọng, Anh Minh
</email>
"""
```

### Tags phổ biến:

| Tag | Dùng cho |
|-----|----------|
| `<instructions>` | Hướng dẫn cho Claude |
| `<context>` | Ngữ cảnh, background |
| `<input>` / `<data>` | Dữ liệu cần xử lý |
| `<examples>` | Ví dụ minh họa |
| `<output_format>` | Format mong muốn |
| `<constraints>` | Giới hạn, quy tắc |
| `<document>` | Tài liệu tham khảo |

### Nesting tags:

```xml
<documents>
  <document index="1">
    <source>báo cáo Q1</source>
    <content>Doanh thu tăng 15%...</content>
  </document>
  <document index="2">
    <source>báo cáo Q2</source>
    <content>Doanh thu giảm 5%...</content>
  </document>
</documents>
```

## 🔹 3. Few-shot Prompting — Dạy bằng ví dụ

Cung cấp 2-5 ví dụ giúp Claude hiểu **chính xác** format và phong cách bạn muốn.

```python
prompt = """Phân loại ticket hỗ trợ theo hệ thống sau:

<examples>
<example>
<input>Không đăng nhập được, quên mật khẩu</input>
<output>{"category": "authentication", "priority": "low", "action": "send_reset_link"}</output>
</example>

<example>
<input>Website bị trắng trang khi load trang chủ</input>
<output>{"category": "bug", "priority": "high", "action": "escalate_to_dev"}</output>
</example>

<example>
<input>Muốn đổi gói từ Basic lên Pro</input>
<output>{"category": "billing", "priority": "medium", "action": "transfer_to_billing"}</output>
</example>
</examples>

Bây giờ phân loại ticket này:
<input>Database timeout khi export báo cáo lớn, ảnh hưởng 30 users</input>
"""
```

### Tips cho ví dụ tốt:
1. **Đa dạng** — cover nhiều categories khác nhau
2. **Bao gồm edge cases** — trường hợp mơ hồ, khó phân loại
3. **Nhất quán format** — tất cả ví dụ cùng format
4. **Không quá nhiều** — 3-5 ví dụ thường đủ

## 🔹 4. Role Prompting — Gán vai trò

```python
import anthropic

client = anthropic.Anthropic()

# Gán vai trò qua system prompt
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="""Bạn là Senior Security Engineer với 15 năm kinh nghiệm.
    
Khi review code:
- Tập trung vào lỗ hổng bảo mật (SQL injection, XSS, CSRF)
- Chỉ ra severity level: Critical, High, Medium, Low
- Đề xuất fix cụ thể cho mỗi lỗi
- Viết ngắn gọn, đi thẳng vào vấn đề""",
    messages=[{
        "role": "user",
        "content": """Review đoạn code này:
```python
@app.route('/user/<id>')
def get_user(id):
    query = f"SELECT * FROM users WHERE id = {id}"
    result = db.execute(query)
    return jsonify(result)
```"""
    }]
)
```

## 🔹 5. Chain-of-Thought — Suy nghĩ từng bước

Yêu cầu Claude "suy nghĩ từng bước" cải thiện đáng kể chất lượng cho các bài toán phức tạp.

```python
prompt = """
<instructions>
Phân tích yêu cầu feature sau và ước lượng effort.

Hãy suy nghĩ từng bước:
1. Liệt kê các components cần thay đổi
2. Đánh giá độ phức tạp từng component
3. Xác định dependencies
4. Ước lượng thời gian (story points)
</instructions>

<feature_request>
Thêm tính năng "Scheduled Reports": user có thể cấu hình
báo cáo tự động gửi email hàng tuần/hàng tháng.
</feature_request>
"""
```

### Extended Thinking

Claude hỗ trợ **extended thinking** — suy nghĩ sâu trước khi trả lời:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # budget cho thinking
    },
    messages=[{
        "role": "user",
        "content": "Thiết kế database schema cho hệ thống e-commerce"
    }]
)

# Response có 2 phần
for block in response.content:
    if block.type == "thinking":
        print("🧠 Thinking:", block.thinking)
    elif block.type == "text":
        print("💬 Answer:", block.text)
```

## 🔹 6. Long Context Prompting

Khi làm việc với tài liệu dài (20K+ tokens):

```python
# Đặt tài liệu ở ĐẦU, câu hỏi ở CUỐI
prompt = """
<documents>
<document index="1">
<source>technical_spec.md</source>
<content>
{long_document_content_here}
</content>
</document>
</documents>

<instructions>
Dựa trên tài liệu trên, trả lời câu hỏi sau.
Trích dẫn đoạn văn liên quan trước khi trả lời.
</instructions>

<question>
Hệ thống xử lý authentication như thế nào?
</question>
"""
```

**Best practices:**
- 📄 Dữ liệu dài → đặt ở đầu prompt
- ❓ Câu hỏi → đặt ở cuối (cải thiện chất lượng ~30%)
- 📝 Yêu cầu Claude trích dẫn trước khi trả lời
- 🏷️ Dùng XML tags phân tách rõ ràng

---

## 📝 Tổng kết kỹ thuật

| Kỹ thuật | Khi nào dùng |
|----------|-------------|
| **Clear & Direct** | Luôn luôn — nền tảng |
| **XML Tags** | Prompt phức, nhiều phần |
| **Few-shot** | Cần output chính xác format |
| **Role Prompting** | Cần chuyên môn cụ thể |
| **Chain-of-Thought** | Bài toán phức, nhiều bước |
| **Long Context** | Tài liệu dài > 20K tokens |

---

➡️ Tiếp theo: [Tool Use](05-tool-use.md)
