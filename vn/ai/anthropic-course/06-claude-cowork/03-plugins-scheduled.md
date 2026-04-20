# Bài 3: Plugins & Scheduled Tasks

> Module: [Claude Cowork](./README.md) → Bài 3

---

## 🔹 Plugins — Biến Cowork thành chuyên gia

Plugins mở rộng khả năng Cowork bằng cách kết nối với **tools bên ngoài**.

```
Cowork + Plugin = Specialist

Ví dụ:
├── Google Drive plugin → đọc/viết Google Docs
├── Notion plugin       → sync với workspace
├── Figma plugin        → phân tích designs
├── GitHub plugin       → quản lý issues/PRs
└── Slack plugin        → đọc channels, gửi messages
```

### Cài Plugin

```
Claude Desktop → Settings → Plugins → Browse/Install
```

### Dùng Plugin trong task

```
User: "Tạo meeting notes từ Slack channel #engineering 
       tuần này và lưu vào Google Docs"

Claude dùng:
├── Slack plugin → đọc messages
├── Processing  → tổng hợp, format
└── Drive plugin → tạo Google Doc

Result: Link Google Doc với meeting notes formatted
```

## 🔹 Scheduled Tasks — Tự động hóa

Cowork có thể chạy **task định kỳ** tự động:

```
Ví dụ scheduled tasks:
├── Mỗi sáng thứ 2: tạo weekly report
├── Mỗi ngày 6 PM: summarize emails chưa đọc
├── Mỗi thứ 6: review và dọn Downloads folder
└── Mỗi tháng: aggregate data + tạo monthly report
```

### Setup Scheduled Task

```
Claude Cowork → Schedule → New Task
├── Task: "Tạo daily standup summary từ Slack"
├── Schedule: Mỗi ngày 8:30 AM
├── Input: Slack #dev-team (24h gần nhất)
├── Output: Lưu vào ~/Documents/Standups/
└── Notify: Desktop notification khi xong
```

### Quản lý

```
Scheduled Tasks:
├── ✅ Daily standup (8:30 AM) — running
├── ✅ Weekly report (Mon 9 AM) — running  
├── ⏸️ Data cleanup (Fri 5 PM) — paused
└── ❌ Email digest (6 PM) — disabled
```

---

➡️ Tiếp theo: [File & Research Tasks](04-file-research.md)
