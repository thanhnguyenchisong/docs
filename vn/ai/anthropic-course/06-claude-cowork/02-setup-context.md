# Bài 2: Setup & Cung cấp Context

> Module: [Claude Cowork](./README.md) → Bài 2

---

## 🔹 Getting Set Up

1. **Claude Desktop** — Cowork tích hợp sẵn
2. Mở **Claude Desktop app**
3. Chọn **Cowork** mode (thay vì Chat)
4. Grant permissions cho folder/files cần truy cập

## 🔹 Cung cấp Context hiệu quả

Context quyết định **chất lượng plan** của Claude. Càng rõ context, plan càng tốt.

### Cách 1: Drag & Drop files
```
Kéo files/folders vào Cowork → Claude đọc nội dung
```

### Cách 2: Mô tả trong prompt
```
"Trong folder ~/Documents/Q1-Report có 3 file CSV:
- sales.csv (doanh thu theo ngày)
- costs.csv (chi phí theo category)  
- targets.csv (mục tiêu theo tháng)

Tạo báo cáo so sánh actual vs target."
```

### Cách 3: Project context
```
Tạo Project trong Claude → thêm Project Knowledge:
- Company guidelines
- Brand voice documents
- Template files

→ Cowork tự đọc project knowledge cho mọi task
```

## 🔹 Tips context tốt

| Tip | Ví dụ |
|-----|-------|
| **Nêu rõ mục đích** | "Tạo deck cho board meeting thứ 6" |
| **Chỉ files cụ thể** | "Dùng data từ sales_q1.csv" |
| **Nêu constraints** | "Tối đa 10 slides, tiếng Việt" |
| **Reference style** | "Theo format của template.pptx" |
| **Nêu audience** | "Target: C-level executives" |

## 🔹 The Task Loop — Chi tiết

```
User: "Tạo weekly report từ dữ liệu trong folder Reports/"

Claude Plan:
┌─────────────────────────────────────────┐
│ 📋 Plan:                                │
│ 1. Scan folder Reports/ để hiểu data    │
│ 2. Đọc files CSV: orders, revenue, KPIs │
│ 3. Tính toán metrics chính              │
│ 4. Tạo report markdown với charts       │
│ 5. Export thành PDF                      │
│                                         │
│ Estimated: 3-5 phút                     │
│ [Approve] [Edit plan] [Cancel]          │
└─────────────────────────────────────────┘

User: "Approve, nhưng thêm section Customer Feedback"

Claude: → Thực thi plan + thêm feedback section
        → Tạo file weekly_report_w15.md
        → "Xong! Report đã lưu ở Reports/weekly_report_w15.md"
```

---

➡️ Tiếp theo: [Plugins & Scheduled Tasks](03-plugins-scheduled.md)
