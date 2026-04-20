# Bài 4: File & Research Tasks

> Module: [Claude Cowork](./README.md) → Bài 4

---

## 🔹 File Tasks

### Batch Processing

```
User: "Rename tất cả ảnh trong folder Photos/2024 
       theo format: YYYY-MM-DD_description.jpg 
       Lấy date từ EXIF metadata."

Claude:
├── Scan folder → 247 images
├── Đọc EXIF data từ mỗi ảnh
├── Suggest naming scheme
├── [Approve preview] → rename all
└── Report: 247/247 renamed, 3 skipped (no EXIF)
```

### Document Generation

```
User: "Từ file interview_notes.md, tạo:
       1. Structured report (markdown)
       2. Key decisions summary
       3. Action items checklist
       4. Follow-up email draft"

Claude: tạo 4 files riêng biệt, formatted đúng cách
```

### Multi-file Editing

```
User: "Cập nhật copyright year từ 2024 → 2025 
       trong TẤT CẢ files .py trong project"

Claude:
├── Search: grep -r "2024" --include="*.py"
├── Found: 34 files, 52 occurrences
├── Preview changes → [Approve]
├── Apply changes
└── Report: 52 replacements in 34 files
```

## 🔹 Research Tasks

### Research at Scale

```
User: "Research top 10 CRM tools cho SME ở Việt Nam.
       So sánh: pricing, features, Vietnamese support.
       Output: comparison table + recommendation."

Claude:
├── Web search + read product pages
├── Compile data points
├── Tạo comparison table
├── Viết recommendation dựa trên criteria
└── Output: research_crm_2024.md
```

### Deep Analysis

```
User: "Phân tích 5 PDF papers trong folder Research/
       Tìm common themes, contradictions, gaps."

Claude:
├── Đọc từng PDF
├── Extract key findings
├── Cross-reference giữa papers
├── Tạo synthesis document
└── Output:
    ├── paper_summaries.md
    ├── theme_analysis.md
    └── research_gaps.md
```

## 🔹 Steering Multi-step Tasks

Khi task dài, bạn có thể **steer** Claude dọc đường:

```
Claude: "Đang phân tích file 3/5. 
         Cho đến giờ tìm thấy 3 themes chính:
         1. AI adoption barriers
         2. Cost-benefit analysis
         3. Implementation challenges
         
         Tiếp tục với hướng này?"

User: "Tốt, nhưng thêm focus vào 'change management' nữa"

Claude: → Cập nhật plan, tiếp tục với focus mới
```

**Tips steering:**
- ✅ Intervene **sớm** khi thấy hướng sai
- ✅ Nêu rõ muốn **thêm/bớt/đổi** gì
- ❌ Không đợi xong mới feedback

---

➡️ Tiếp theo: [Permissions & Troubleshooting](05-permissions-troubleshoot.md)
