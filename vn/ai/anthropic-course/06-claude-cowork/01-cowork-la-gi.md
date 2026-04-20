# Bài 1: Cowork là gì?

> Module: [Claude Cowork](./README.md) → Bài 1

---

## 🔹 Chat vs Cowork

| | Chat | Cowork |
|-|------|--------|
| **Mô hình** | Hội thoại | Working session |
| **Input** | Bạn paste text/files | Claude truy cập files trực tiếp |
| **Output** | Text response | Sửa files, tạo documents thực |
| **Workflow** | Hỏi → trả lời | Giao task → plan → execute → steer |
| **Phù hợp** | Brainstorm, hỏi đáp | Document editing, research, data tasks |

```
Chat: "Tóm tắt nội dung file này" → (bạn paste nội dung)
Cowork: "Tóm tắt file report.pdf trên Desktop" → (Claude tự đọc file)
```

## 🔹 Task Loop

Cowork hoạt động theo vòng lặp:

```
┌─────────────────────────────────────┐
│ 1. Bạn giao task                     │
│    "Tổ chức lại folder Downloads"    │
│                                      │
│ 2. Claude lập kế hoạch              │
│    "Tôi sẽ: scan files, phân loại,  │
│     tạo folders, di chuyển files"    │
│                                      │
│ 3. Bạn approve / steer              │
│    "OK, nhưng giữ nguyên folder     │
│     Projects, chỉ dọn Documents"     │
│                                      │
│ 4. Claude thực thi                   │
│    Đọc files → phân loại → di chuyển │
│                                      │
│ 5. Claude báo cáo                    │
│    "Xong! Đã di chuyển 45 files     │
│     vào 6 categories"                │
│                                      │
│ 6. Bạn review → feedback → iterate  │
└─────────────────────────────────────┘
```

## 🔹 Khi nào dùng Cowork?

| ✅ Dùng Cowork | ❌ Dùng Chat |
|----------------|-------------|
| Edit nhiều files cùng lúc | Hỏi đáp nhanh |
| Research từ nhiều nguồn | Brainstorm ý tưởng |
| Data processing lớn | Giải thích concept |
| Document generation | Code snippet nhỏ |
| File organization | Casual conversation |

## 🔹 Ví dụ tasks Cowork

```
📄 Document tasks:
"Tạo báo cáo tổng hợp từ 5 file CSV trong folder Data"
"Dịch file manual.md sang tiếng Việt"
"Format lại tất cả markdown files theo style guide"

🔍 Research tasks:
"Research top 10 competitors và tạo comparison table"
"Tổng hợp papers về RAG từ folder Research"

📊 Data tasks:
"Phân tích sales data Q1-Q3 từ spreadsheet"
"Clean và merge 3 CSV files thành 1"
```

---

➡️ Tiếp theo: [Setup & Context](02-setup-context.md)
