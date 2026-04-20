# Bài 2: Cách Claude Code hoạt động

> Module: [Claude Code 101](./README.md) → Bài 2

---

## 🔹 Context Window

Context window = bộ nhớ ngắn hạn của Claude trong phiên làm việc:
- Chứa **mọi thứ** đã đọc/viết/chạy trong phiên
- Có **giới hạn** (khoảng 200K tokens)
- Khi đầy → Claude phải **compact** (nén) → mất chi tiết

```
Context Window:
├── System prompt (CLAUDE.md, project config)
├── User messages
├── File contents đã đọc
├── Command outputs
├── Search results
├── Tool results
└── Claude's responses
    
Tổng tất cả phải ≤ context window limit
```

## 🔹 Context Management

```bash
# Nén context — giữ summary, xóa chi tiết
/compact

# Xóa sạch context — bắt đầu lại
/clear

# Xem context hiện tại đang dùng bao nhiêu
/context
```

**Khi nào cần quản lý context:**
- Claude bắt đầu **quên** những gì đã nói trước đó
- Response chậm lại đáng kể
- Claude lặp lại câu hỏi đã hỏi

## 🔹 Tools chi tiết

### Read Tool
```
Input: file path
Output: file content
Example: Claude đọc src/api/auth.py
```

### Write/Edit Tool
```
Input: file path + changes
Output: file modified on disk
Example: Claude thêm rate_limit decorator vào auth.py
```

### Bash Tool
```
Input: command string
Output: stdout + stderr
Example: Claude chạy "npm test" → xem test results
```

### Search (Grep)
```
Input: pattern + directory
Output: matching lines + file paths
Example: Claude tìm "TODO" trong toàn bộ src/
```

## 🔹 Approval Flow

```
1. Claude muốn chạy: "git commit -m 'fix: rate limit'"
   ┌─────────────────────────────────────┐
   │ Claude wants to run:                │
   │ > git commit -m 'fix: rate limit'   │
   │                                     │
   │ [Allow] [Deny] [Allow Always]       │
   └─────────────────────────────────────┘

2. Bạn chọn:
   - Allow → chạy 1 lần
   - Deny → không chạy, Claude thử cách khác
   - Allow Always → tự chạy commands tương tự sau này
```

## 🔹 Plan Mode

Yêu cầu Claude **lập kế hoạch** trước khi code — hữu ích cho tasks phức tạp:

```bash
# Bật plan mode
/plan

# Hoặc trong prompt
"Hãy lập kế hoạch chi tiết TRƯỚC KHI viết code. 
Liệt kê files cần sửa, thứ tự thực hiện, và rủi ro."
```

**Plan Mode workflow:**
```
1. Claude phân tích task
2. Claude đề xuất plan (files sẽ sửa, approach)
3. Bạn review plan → approve / suggest changes
4. Claude thực thi plan
```

## 🔹 Token Usage & Cost

```
Mỗi phiên Claude Code tiêu tokens cho:
├── Input tokens  → context bạn gửi (files, messages)
├── Output tokens → Claude's responses + tool calls
└── Tool results  → output từ commands

Tips tiết kiệm:
✅ Dùng /compact khi context lớn
✅ Chỉ đọc files cần thiết
✅ Dùng model phù hợp (Haiku cho tasks đơn giản)
✅ Break tasks lớn → nhiều phiên nhỏ
```

---

➡️ Tiếp theo: [Cài đặt](03-installation.md)
