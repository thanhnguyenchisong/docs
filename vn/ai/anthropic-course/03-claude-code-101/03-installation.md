# Bài 3: Cài đặt Claude Code

> Module: [Claude Code 101](./README.md) → Bài 3

---

## 🔹 Prerequisites

- **Node.js** ≥ 18

## 🔹 1. Cài đặt trên Terminal

```bash
# Install globally
npm install -g @anthropic-ai/claude-code

# Verify
claude --version

# Khởi động trong project
cd my-project
claude
```

## 🔹 2. VS Code Extension

1. Mở VS Code
2. Extensions (Ctrl+Shift+X)
3. Tìm "Claude Code"
4. Install
5. Mở panel: `Ctrl+Shift+P` → "Claude Code: Open"

## 🔹 3. JetBrains Plugin

1. Settings → Plugins → Marketplace
2. Tìm "Claude Code"
3. Install → Restart IDE

## 🔹 4. Claude Desktop

Claude Code có sẵn trong **Claude Desktop app** (macOS, Windows):
1. Download từ [claude.ai/download](https://claude.ai/download)
2. Mở app → chọn project folder
3. Claude Code tích hợp sẵn

## 🔹 5. Authentication

```bash
# Lần đầu chạy claude, sẽ mở browser để login
claude

# Hoặc dùng API key
export ANTHROPIC_API_KEY="sk-ant-..."
claude
```

**Subscription cần thiết:**
- Claude Pro ($20/tháng)
- Claude Max ($100-200/tháng) — unlimited usage
- Enterprise — team plan
- Hoặc API key với credits

## 🔹 6. Cấu hình cơ bản

```bash
# Xem config hiện tại
claude config list

# Đổi model mặc định
claude config set model claude-sonnet-4-20250514

# Bật auto-accept cho read-only tools
claude config set autoAcceptReadOnly true

# Thiết lập permission mode
claude config set approvalMode auto  # manual | auto | yolo
```

## 🔹 7. Lệnh hay dùng

| Lệnh | Mô tả |
|-------|-------|
| `claude` | Khởi động interactive mode |
| `claude "prompt"` | Chạy single prompt |
| `claude -p "prompt"` | Print mode (chỉ output) |
| `claude commit` | Tạo commit message từ changes |
| `/compact` | Nén context |
| `/clear` | Xóa context |
| `/context` | Xem context usage |
| `/cost` | Xem token usage/cost |
| `/help` | Danh sách lệnh |

---

➡️ Tiếp theo: [Prompt đầu tiên](04-first-prompt.md)
