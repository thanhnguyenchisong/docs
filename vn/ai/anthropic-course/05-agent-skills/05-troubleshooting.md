# Bài 5: Troubleshooting Skills

> Module: [Agent Skills](./README.md) → Bài 5

---

## 🔹 Vấn đề phổ biến

### 1. Skill không trigger

**Triệu chứng:** Bạn nói "review code" nhưng Claude không load skill code-reviewer.

**Nguyên nhân & Fix:**

| Nguyên nhân | Fix |
|-------------|-----|
| Description quá mơ hồ | Viết description cụ thể hơn, chứa keywords |
| SKILL.md không đúng vị trí | Phải ở `.claude/skills/{name}/SKILL.md` |
| Frontmatter syntax sai | Check YAML format (dashes, indentation) |
| Skill bị override | Check priority: enterprise > project > user |

```markdown
<!-- ❌ Description kém -->
---
description: "code stuff"
---

<!-- ✅ Description tốt -->
---
description: "Review code for security vulnerabilities, 
performance bottlenecks, and team coding standards compliance. 
Includes SQL injection, XSS, CSRF checks."
---
```

### 2. Skill trigger sai lúc

**Triệu chứng:** Skill format-checker trigger khi bạn chỉ muốn viết code mới.

**Fix:** Thêm **negative keywords** trong description:

```yaml
---
description: "Format and lint existing code files. 
DO NOT trigger when creating new files or writing new code."
---
```

### 3. Priority Conflicts

Khi 2 skills match cùng một request:

```
Request: "Viết unit test cho API endpoint"
├── Skill A: "unit-test-writer" → match "unit test"
└── Skill B: "api-generator"   → match "API endpoint"

Claude sẽ chọn skill match TỐT NHẤT dựa trên description.
```

**Fix:** Làm descriptions khác biệt rõ ràng:
```yaml
# Skill A
description: "Write unit tests, integration tests, test suites"

# Skill B  
description: "Generate new API endpoints, routes, controllers"
```

### 4. Runtime Errors trong Scripts

```bash
# Debug: chạy script thủ công
cd project
prettier --write src/api/users.ts

# Nếu lỗi → fix script command trước
# Common issues:
# - Tool chưa cài (npm i -D prettier)
# - Path sai
# - Permission denied
```

### 5. Context Window quá lớn

Skill với nhiều files reference → Claude đọc hết → context đầy.

**Fix:** Dùng progressive disclosure:

```markdown
<!-- SKILL.md ngắn gọn -->
## Quick Reference
- Naming: snake_case cho files, PascalCase cho classes

## Details (chỉ đọc khi cần)
- See [detailed-guide.md](./detailed-guide.md)
```

## 🔹 Checklist Debug

```
□ SKILL.md ở đúng path: .claude/skills/{name}/SKILL.md
□ Frontmatter YAML valid (name, description required)
□ Description chứa keywords liên quan đến task
□ allowed-tools (nếu có) bao gồm tools cần thiết
□ Scripts (nếu có) chạy được thủ công
□ Không conflict với skills khác
□ File permissions OK
```

---

## ➡️ Hoàn thành Module!

Tiếp theo:
- [Claude Cowork](../06-claude-cowork/) — làm việc cùng Claude trên files thực
- [Subagents](../04-subagents/) — delegate tasks chuyên biệt
