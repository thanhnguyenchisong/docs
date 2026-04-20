# Claude 101 — Giới thiệu cơ bản về Claude

> 🔗 Khóa chính thức: [Claude 101 trên Anthropic Academy](https://anthropic.skilljar.com/claude-101)
> 📌 Level: Beginner | Dành cho tất cả mọi người | Miễn phí

---

## 📖 Giới thiệu

Claude 101 là khóa học nhập môn dành cho **tất cả mọi người** — không yêu cầu kiến thức lập trình. Khóa giúp bạn hiểu Claude là gì, cách sử dụng giao diện Claude.ai, và những nguyên tắc cơ bản khi làm việc cùng AI.

---

## 🎯 Sau khóa học, bạn sẽ biết

- Claude là gì và khác gì so với các AI chatbot khác
- Cách đăng ký và sử dụng Claude.ai
- Viết prompt hiệu quả ngay từ lần đầu
- Các tính năng chính: trò chuyện, upload file, tạo artifact
- Hiểu giới hạn và cách dùng Claude an toàn, có trách nhiệm

---

## 🧠 Nội dung chi tiết

### 1. Claude là gì?

Claude là một AI assistant được phát triển bởi **Anthropic** — công ty AI chuyên về an toàn (AI safety).

| Đặc điểm | Mô tả |
|-----------|-------|
| **Tên đầy đủ** | Claude (đặt theo nhà toán học Claude Shannon) |
| **Nhà phát triển** | Anthropic |
| **Loại** | Large Language Model (LLM) — AI dựa trên ngôn ngữ |
| **Truy cập** | claude.ai (web), ứng dụng desktop, API |

**Các phiên bản Claude:**

```
Claude Model Family (tính đến 2026):
├── Claude Haiku    → Nhanh, nhẹ, chi phí thấp
├── Claude Sonnet   → Cân bằng tốc độ và chất lượng
├── Claude Opus     → Mạnh nhất, phân tích sâu
└── Claude Mythos   → Preview — thế hệ tiếp theo
```

### 2. Bắt đầu sử dụng Claude

**Đăng ký:**
1. Truy cập [claude.ai](https://claude.ai)
2. Đăng ký bằng email hoặc Google account
3. Chọn plan: Free, Pro ($20/tháng), Max, Team, Enterprise

**Giao diện chính:**
```
┌──────────────────────────────────────┐
│  Claude.ai                           │
├──────────────────────────────────────┤
│  [Sidebar]        │  [Chat Area]     │
│  - New chat       │                  │
│  - Recents        │  "How can I      │
│  - Projects       │   help you?"     │
│  - Starred        │                  │
│                   │  [Input box]     │
│                   │  📎 Upload files │
└──────────────────────────────────────┘
```

### 3. Viết prompt hiệu quả

**Nguyên tắc vàng:** Hãy nghĩ Claude như một đồng nghiệp mới — thông minh nhưng chưa biết ngữ cảnh của bạn. Càng cung cấp rõ ràng, kết quả càng tốt.

**Prompt kém:**
```
Viết email
```

**Prompt tốt:**
```
Viết email chuyên nghiệp cho khách hàng để thông báo 
lịch bảo trì hệ thống vào ngày 25/04. Giọng văn lịch sự, 
ngắn gọn, dưới 150 từ. Include thời gian downtime dự kiến 
là 2 tiếng (8:00-10:00 sáng).
```

**5 yếu tố giúp prompt tốt hơn:**

| # | Yếu tố | Ví dụ |
|---|--------|-------|
| 1 | **Ngữ cảnh** | "Tôi là PM trong team phần mềm..." |
| 2 | **Nhiệm vụ cụ thể** | "Viết user story cho tính năng login" |
| 3 | **Định dạng output** | "Trả lời dạng bảng / JSON / bullet points" |
| 4 | **Giới hạn** | "Dưới 200 từ, dùng tiếng Việt" |
| 5 | **Ví dụ** | "Giống phong cách email này: ..." |

### 4. Tính năng chính của Claude

#### 📄 Upload file
- Hỗ trợ: PDF, hình ảnh, CSV, code files
- Claude có thể đọc, phân tích, tóm tắt nội dung file
- Kéo thả file vào ô chat hoặc click 📎

#### 🎨 Artifacts
- Claude có thể tạo "artifact" — nội dung có thể preview trực tiếp
- Ví dụ: code, bảng, HTML, SVG, biểu đồ Mermaid
- Artifact hiển thị bên phải, bạn có thể copy/edit/download

#### 💬 Projects
- Tạo project để nhóm các cuộc trò chuyện liên quan
- Thêm "Project Knowledge" — tài liệu Claude luôn nhớ trong project đó
- Custom instructions cho project

### 5. Giới hạn và sử dụng có trách nhiệm

**Claude KHÔNG thể:**
- Truy cập internet real-time (trừ khi dùng web search tool)
- Nhớ các cuộc trò chuyện trước đó (mỗi chat là độc lập)
- Đảm bảo 100% chính xác — luôn kiểm tra thông tin quan trọng

**Nguyên tắc sử dụng:**
- ✅ Dùng Claude để hỗ trợ tư duy, không thay thế tư duy
- ✅ Kiểm tra lại output quan trọng (số liệu, code, pháp lý)
- ✅ Cung cấp context đầy đủ để tránh hallucination
- ❌ Không chia sẻ thông tin nhạy cảm/bí mật qua Claude

---

## 📎 Tài nguyên

| Tài nguyên | Link |
|------------|------|
| Đăng ký Claude | [claude.ai](https://claude.ai) |
| Khóa học chính thức | [Anthropic Academy](https://anthropic.skilljar.com/claude-101) |
| Prompt Library | [docs.anthropic.com/prompt-library](https://docs.anthropic.com/en/docs/build-with-claude/prompt-library) |
| Hỗ trợ | [support.claude.com](https://support.claude.com) |

---

## ➡️ Tiếp theo

Sau khi nắm cơ bản về Claude, hãy chuyển sang:
- [Building with the Claude API](../02-building-with-api/) — nếu bạn là developer
- [Claude Code 101](../03-claude-code-101/) — nếu bạn muốn dùng Claude cho coding
- [AI Fluency](../09-ai-fluency/) — nếu bạn muốn hiểu sâu hơn về AI framework
