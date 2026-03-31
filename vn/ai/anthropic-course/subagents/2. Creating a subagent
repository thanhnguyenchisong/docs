Trang này giải thích cách tạo subagent tùy chỉnh trong Claude để thực hiện các nhiệm vụ chuyên biệt như: review code, viết test, kiểm tra tài liệu,…

# 🔹 1. Subagent là gì?

Claude có sẵn subagent, nhưng người dùng có thể tạo subagent riêng.
Subagent là các “tác nhân phụ” chuyên xử lý từng loại nhiệm vụ cụ thể.
Mỗi subagent được định nghĩa bằng file markdown chứa YAML frontmatter mô tả cách hoạt động.


# 🔹 2. Cách tạo subagent
Tạo bằng lệnh /agents, mở giao diện quản lý subagent.
Khi tạo, bạn chọn:

Scope (phạm vi):

 - Project-level: chỉ dùng trong project hiện tại
 - User-level: dùng cho tất cả project trên máy


Cách tạo:

 - Viết cấu hình thủ công
 - Hoặc để Claude tự sinh subagent dựa trên mô tả nhiệm vụ (được khuyến nghị)




# 🔹 3. Tùy chỉnh công cụ (Tools)
Bạn có thể chọn những loại tool mà subagent được phép dùng, như:

 - Read-only tools
 - Edit tools
 - Execution tools
 - MCP tools
 - Other tools

Ví dụ: subagent review code chỉ cần đọc code, không cần quyền edit.

# 🔹 4. Chọn mô hình và màu
Bạn có thể chọn mô hình Claude cho subagent:

 - Haiku – nhanh, nhẹ
 - Sonnet – cân bằng
 - Opus – phân tích sâu
 - Inherit – theo model của cuộc chat chính

Ngoài ra còn chọn màu để phân biệt subagent trong giao diện.

#🔹 5. File cấu hình subagent
Sau khi tạo, file sẽ nằm trong thư mục:
.claude/agents/your-agent-name.md

File gồm:

 - name – tên agent
 - description – mô tả khi nào Claude nên dùng subagent
 - tools – danh sách công cụ được phép
 - model – model Claude dùng
 - color – màu phân biệt
 - system prompt – phần nội dung hướng dẫn cách subagent hoạt động


```
---
name: code-quality-reviewer
description: Use this agent when you need to review recently written or modified code for quality, security, and best practice compliance.
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch
model: sonnet
color: purple
---

You are an expert code reviewer specializing in quality assurance, security best practices, and
adherence to project standards. Your role is to thoroughly examine recently written or modified code
and identify issues that could impact reliability, security, maintainability, or performance.
```

# 🔹 6. System prompt
Phần nội dung chính bên dưới YAML.

Bạn mô tả chi tiết:

 - Subagent nên phân tích gì
 - Cách trả kết quả
 - Tiêu chí đánh giá code / dữ liệu

System prompt càng rõ → subagent càng thông minh và chính xác.

# 🔹 7. Cho Claude tự động chọn subagent
Muốn Claude tự kích hoạt subagent, hãy thêm từ:
“proactively”
trong phần description, hoặc cung cấp ví dụ rõ ràng để Claude biết khi nào cần delegate.

``
description: Proactively suggest running this agent after major code changes...
``

# 🔹 8. Kiểm thử subagent
Sau khi tạo:

Thay đổi code → nhờ Claude review
Nếu subagent không chạy → cải thiện phần mô tả, đặc biệt là trigger scenarios