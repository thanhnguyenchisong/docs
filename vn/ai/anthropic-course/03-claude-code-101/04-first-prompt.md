# Bài 4: Prompt đầu tiên

> Module: [Claude Code 101](./README.md) → Bài 4

---

## 🔹 1. Prompt đầu tiên

```bash
cd my-project
claude

# Trong Claude Code:
> Giải thích cấu trúc project này. Liệt kê các folder chính, 
> tech stack, và entry point.
```

Claude sẽ:
1. Đọc `package.json`, `README.md`, cấu trúc thư mục
2. Tổng hợp và giải thích cho bạn

## 🔹 2. Các loại prompt tốt cho Claude Code

### Khám phá (Explore)
```
"Tìm tất cả API endpoints trong project"
"Giải thích flow authentication"
"Function nào gọi database nhiều nhất?"
```

### Lập kế hoạch (Plan)
```
"Lập kế hoạch thêm tính năng rate limiting. 
Liệt kê files cần sửa, approach, và rủi ro."
```

### Code
```
"Thêm rate limiting middleware cho Express API.
Giới hạn 100 requests/phút/IP. Dùng Redis."
```

### Commit
```
"Review changes tôi vừa làm và tạo commit message"
# Hoặc shortcut:
claude commit
```

## 🔹 3. Explore → Plan → Code → Commit

Workflow khuyến nghị cho mọi feature:

```
Bước 1: EXPLORE
> "Tìm hiểu hệ thống auth hiện tại. Đang dùng gì? Ở đâu?"
Claude: đọc code, trả lời

Bước 2: PLAN
> "Tôi muốn thêm OAuth2 Google login. Lập kế hoạch."
Claude: đề xuất plan

Bước 3: CODE
> "OK, implement plan trên"
Claude: viết code, sửa files

Bước 4: COMMIT
> "Chạy tests, fix nếu cần, rồi commit"
Claude: npm test → fix → git commit
```

## 🔹 4. Tips viết prompt cho Claude Code

**Cụ thể file/function:**
```
✅ "Sửa function `calculateTotal` trong src/utils/pricing.ts"
❌ "Sửa function tính giá"
```

**Nêu acceptance criteria:**
```
✅ "Thêm endpoint POST /api/users. 
    - Validate email format 
    - Check duplicate email
    - Hash password với bcrypt
    - Return 201 + user object (không password)
    - Viết unit tests"
    
❌ "Thêm endpoint tạo user"
```

**Chỉ định constraints:**
```
✅ "Không thay đổi interface UserDTO. Chỉ sửa implementation."
❌ "Thêm field mới" (Claude có thể sửa cả nơi không nên)
```

## 🔹 5. Context Management trong thực tế

```bash
# Phiên dài → context đầy → cần compact
> /compact
# Claude nén context, giữ summary

# Chuyển sang task mới hoàn toàn
> /clear
# Bắt đầu lại sạch

# Kiểm tra usage
> /context
# Context: 45,000 / 200,000 tokens (22%)

# Kiểm tra chi phí
> /cost
# Session cost: $0.45 (input: $0.30, output: $0.15)
```

## 🔹 6. Code Review với Claude Code

```bash
# Review staged changes
claude "Review git diff --staged. Tìm bugs, 
security issues, và code quality problems."

# Review PR
claude "Checkout PR #123 và review. 
Focus: security, performance, test coverage."

# Auto-commit sau review
claude commit
```

---

➡️ Tiếp theo: [Daily Workflows](05-daily-workflows.md)
