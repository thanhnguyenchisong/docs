# Subagent là gì?

> Bài 1 trong khóa [Introduction to Subagents](https://anthropic.skilljar.com/introduction-to-subagents)

---

## 🔹 1. Vấn đề: Context Window bị "ô nhiễm"

Khi làm việc với Claude Code trong phiên dài, context window tích lũy rất nhiều thông tin:
- Lịch sử các lệnh đã chạy
- Nội dung file đã đọc
- Kết quả tìm kiếm
- Output từ các tool

**Vấn đề:** Context window có giới hạn. Khi đầy, Claude phải nén (compact) thông tin → mất chi tiết quan trọng. Hơn nữa, thông tin không liên quan từ các bước trung gian làm **loãng context**, gây khó cho Claude khi phân tích.

```
Main Thread (ví dụ):
├── User: "Review code cho PR #123"
├── Claude: đọc 15 files...          ← loãng context
├── Claude: chạy grep tìm patterns... ← loãng context  
├── Claude: so sánh với conventions... ← loãng context
└── Claude: "Đây là review của tôi"   ← chỉ cần phần này!
```

## 🔹 2. Giải pháp: Subagent

Subagent là một **instance Claude riêng biệt** chạy trong context window độc lập.

```
┌─────────────────────────────────────────┐
│             MAIN THREAD                  │
│                                          │
│  User: "Review code cho PR #123"         │
│  Claude: → Khởi tạo subagent            │
│                                          │
│  ┌─────────────────────────────────┐     │
│  │        SUBAGENT                  │     │
│  │  (context window riêng)          │     │
│  │                                  │     │
│  │  • Đọc 15 files                  │     │
│  │  • Grep patterns                 │     │
│  │  • So sánh conventions           │     │
│  │  • Tổng hợp kết quả              │     │
│  │                                  │     │
│  │  → Trả summary cho main thread   │     │
│  └─────────────────────────────────┘     │
│                                          │
│  Claude: nhận summary, trả kết quả       │
│  (main context vẫn sạch!)               │
└─────────────────────────────────────────┘
```

### Đặc điểm chính:

| Thuộc tính | Main Thread | Subagent |
|-----------|-------------|----------|
| Context window | Chia sẻ với user | Riêng biệt, độc lập |
| Lịch sử | Giữ toàn bộ | Bắt đầu từ đầu |
| Kết quả | Hiện chi tiết | Chỉ trả summary |
| Tốc độ | Nhanh (ít context) | Có thể chậm hơn |
| Token cost | Tích lũy | Tách riêng |

## 🔹 3. Built-in Subagents vs Custom Subagents

### Built-in Subagents
Claude Code đã có sẵn một số subagent tự động. Khi bạn yêu cầu Claude làm task phức tạp, nó có thể **tự quyết định** spawn subagent.

Ví dụ: Khi bạn nói "tìm tất cả nơi dùng function X trong codebase", Claude có thể tự chạy subagent để quét files thay vì làm ở main thread.

### Custom Subagents
Bạn có thể tạo **subagent riêng** với:
- System prompt chuyên biệt
- Bộ tools giới hạn (chỉ đọc, hoặc chỉ edit)
- Model Claude cụ thể (Haiku cho nhanh, Opus cho phân tích sâu)
- Tên và mô tả rõ ràng để Claude biết khi nào nên sử dụng

```
Custom Subagent hữu ích cho:
├── Code reviewer     → đọc code, đánh giá, trả report
├── Documentation gen → đọc code, sinh tài liệu  
├── Test writer       → đọc code, viết unit tests
├── Security auditor  → quét vulnerabilities
└── Style checker     → kiểm tra coding conventions
```

## 🔹 4. Subagent hoạt động như thế nào?

**Quy trình:**

```
1. User gửi request cho main thread
2. Claude (main) nhận request
3. Claude quyết định cần delegate → khởi tạo subagent
4. Claude gửi "prompt" cho subagent (bao gồm chỉ dẫn cụ thể)
5. Subagent thực hiện công việc trong context riêng
6. Subagent trả về summary/kết quả
7. Claude (main) nhận summary và tổng hợp cho user
```

**Quan trọng:**
- Subagent **không thấy** lịch sử của main thread
- Subagent **không thể** giao tiếp trực tiếp với user
- Main thread **chỉ nhận** output cuối cùng (summary) từ subagent
- Khi subagent kết thúc, context window của nó **bị hủy**

## 🔹 5. Khi nào dùng Subagent?

### ✅ Dùng khi:
- Bạn chỉ cần **kết quả cuối**, không cần theo dõi từng bước
- Công việc trung gian sẽ **làm loãng context** của main thread
- Cần **góc nhìn độc lập** (ví dụ: review code vừa viết)
- Task cần **system prompt khác** với main thread

### ❌ Không nên dùng khi:
- Bạn cần theo dõi **từng bước chi tiết**
- Output trung gian **quan trọng** để debug
- Task **đơn giản**, không đáng chi phí khởi tạo subagent

---

## 📎 Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| Subagent | Instance Claude riêng, context window độc lập |
| Mục đích | Delegate task, giữ main context sạch |
| Input | Prompt từ main thread |
| Output | Summary trả về main thread |
| Built-in | Claude tự quyết định khi nào cần |
| Custom | Bạn tạo với system prompt, tools, model riêng |

---

➡️ Tiếp theo: [Tạo Subagent](02-tao-subagent.md)
