# Bài 5: Permissions, Model Choice & Troubleshooting

> Module: [Claude Cowork](./README.md) → Bài 5

---

## 🔹 Permissions

Cowork cần **quyền truy cập** vào files/apps:

```
Permission Levels:
├── Read-only    → chỉ đọc files
├── Read/Write   → đọc + sửa/tạo files
├── App access   → truy cập apps (Google Drive, Slack...)
└── Full access  → toàn quyền trong scope được chọn
```

### Folder-level Permissions

```
Grant access per folder:
├── ~/Documents/ → Read/Write ✅
├── ~/Photos/    → Read-only  📖
├── ~/System/    → No access  🚫
└── All plugins  → Per-plugin ⚙️
```

### Best Practices

| Practice | Lý do |
|----------|-------|
| **Least privilege** | Chỉ grant quyền cần thiết |
| **Review trước write** | Luôn preview changes trước khi apply |
| **Scope nhỏ** | Grant per-folder, không full disk |
| **Revoke khi xong** | Bỏ quyền sau project |

## 🔹 Chọn Model

| Model | Tốt cho | Cost |
|-------|---------|------|
| **Haiku** | Tasks đơn giản, nhanh | $ |
| **Sonnet** | Phần lớn tasks | $$ |
| **Opus** | Phân tích sâu, tasks phức tạp | $$$ |

```
Ví dụ chọn model:
├── Rename files          → Haiku (đơn giản, nhanh)
├── Tạo report            → Sonnet (cân bằng)
├── Research + synthesis   → Opus (phân tích sâu)
└── Multi-step project     → Opus (cần reasoning tốt)
```

## 🔹 Usage & Pricing

```
Cowork usage dựa trên:
├── Model selected (Haiku < Sonnet < Opus)
├── Input tokens (files đọc, context)
├── Output tokens (files tạo, responses)
└── Tool usage (web search, plugins)

Plans:
├── Pro ($20/mo)    → giới hạn usage
├── Max ($100/mo)   → usage cao hơn
└── Max ($200/mo)   → unlimited
```

## 🔹 Troubleshooting

### Task bị stuck

```
Nếu Cowork dừng không phản hồi:
1. Check permissions — Claude có quyền truy cập files?
2. Check file size — files quá lớn có thể timeout
3. Steer — nói rõ "bỏ qua bước này, tiếp tục"
4. Break down — chia task nhỏ hơn
```

### Output không đúng ý

```
Fix:
1. Cung cấp thêm context/examples
2. Chỉ rõ format mong muốn
3. Cho reference file "giống file này"
4. Steer sớm: feedback ngay bước đầu
```

### Permission denied

```
Error: "Cannot access ~/Documents/secret.pdf"

Fix:
├── Check folder permissions trong Settings
├── Grant Read access cho folder
└── Restart Cowork session
```

---

## ➡️ Hoàn thành Module!

Tiếp theo:
- [MCP](../07-mcp/) — kết nối Claude với external services
- [Claude Code 101](../03-claude-code-101/) — nếu bạn là developer
