# Bài 1: Claude Code là gì?

> Module: [Claude Code 101](./README.md) → Bài 1

---

## 🔹 AI Coding Agent vs Chat-based AI

| | Chat AI (ChatGPT, Claude.ai) | Coding Agent (Claude Code) |
|-|------|------|
| **Input** | Bạn paste code vào chat | Agent tự đọc codebase |
| **Output** | Trả code block để bạn copy | Tự sửa files trực tiếp |
| **Context** | Chỉ biết những gì bạn gửi | Duyệt toàn bộ project |
| **Tools** | Không có | Bash, file edit, search, git |
| **Workflow** | Hỏi → copy → paste → hỏi lại | Giao task → agent hoàn thành |

## 🔹 Claude Code hoạt động ở đâu?

```
Claude Code chạy trên:
├── Terminal        → `claude` command
├── VS Code         → Extension
├── JetBrains       → Plugin  
├── Claude Desktop  → Tích hợp sẵn
└── Web             → claude.com (Claude Code for Web)
```

## 🔹 Agentic Loop

Claude Code chạy trong một **vòng lặp agentic**:

```
┌─────────────────────────────────────────┐
│                                          │
│   User: "Add rate limiting to API"       │
│          │                               │
│          ▼                               │
│   ┌──────────────┐                       │
│   │ Claude suy   │                       │
│   │ nghĩ cần     │                       │
│   │ làm gì       │                       │
│   └──────┬───────┘                       │
│          │                               │
│          ▼                               │
│   ┌──────────────┐  ┌───────────────┐    │
│   │ Chọn tool:   │→ │ Execute tool  │    │
│   │ Read file?   │  │ → xem kết quả │    │
│   │ Search?      │  │               │    │
│   │ Edit?        │  └───────┬───────┘    │
│   │ Run command? │          │            │
│   └──────────────┘          │            │
│          ▲                  │            │
│          └──────────────────┘            │
│          (lặp cho đến khi xong)          │
│                                          │
│   Claude: "Done! Đã thêm rate limiting"  │
│                                          │
└─────────────────────────────────────────┘
```

## 🔹 Tools có sẵn

| Tool | Mô tả | Ví dụ |
|------|-------|-------|
| **Read** | Đọc file content | Đọc source code |
| **Write/Edit** | Sửa file | Thêm function mới |
| **Bash** | Chạy shell commands | `npm test`, `git diff` |
| **Search** | Tìm kiếm trong code | Grep patterns |
| **List files** | Xem cấu trúc thư mục | `ls -la` |

## 🔹 Permissions — An toàn

Claude Code có **hệ thống permissions** để protect:

```
Permission Modes:
├── Approval Mode (mặc định)
│   └── Hỏi bạn trước khi: edit file, run command
│
├── Auto-accept
│   └── Tự chạy read-only tools
│   └── Vẫn hỏi cho write/execute
│
└── YOLO Mode (cẩn thận!)
    └── Tự chạy mọi thứ không hỏi
```

---

➡️ Tiếp theo: [Cách hoạt động](02-how-it-works.md)
