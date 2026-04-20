# Bài 1: Skills là gì?

> Module: [Agent Skills](./README.md) → Bài 1

---

## 🔹 Skill = Reusable Instruction Set

Skill là một **thư mục** chứa file `SKILL.md` — markdown instructions mà Claude Code **tự động phát hiện** và áp dụng khi task phù hợp.

```
Ví dụ:
Bạn có skill "code-reviewer" với instructions:
"Khi review code, kiểm tra security, performance, 
và tuân thủ coding standards của team"

→ Mỗi khi bạn nói "review code", Claude tự 
  load instructions này — KHÔNG CẦN bạn nhắc lại.
```

## 🔹 Skills vs Các customization khác

| Feature | Khi nào chạy | Scope | AI-powered? |
|---------|-------------|-------|-------------|
| **CLAUDE.md** | Luôn luôn (mọi request) | Project-wide | ❌ Passive |
| **Skills** | Khi task match description | Per-task | ✅ Auto-triggered |
| **Subagents** | Khi Claude delegate | Per-delegation | ✅ Separate context |
| **Hooks** | Khi event xảy ra | Deterministic | ❌ Script-based |

```
CLAUDE.md = "Luôn dùng TypeScript strict mode"  (always on)
Skill     = "Khi viết API endpoint, follow pattern này..." (on-demand)
Subagent  = "Đây là code reviewer riêng" (separate instance)
Hook      = "Auto-format khi save file" (deterministic)
```

## 🔹 Cách Claude chọn Skill

```
1. User gửi request: "Viết unit test cho UserService"
2. Claude đọc description của tất cả skills available
3. Claude match: skill "unit-test-writer" có description 
   "Writing unit tests, test cases, test suites"
4. Claude load SKILL.md instructions
5. Claude thực hiện task theo instructions của skill
```

## 🔹 Cấu trúc Skill

```
.claude/skills/
├── code-reviewer/
│   └── SKILL.md
├── unit-test-writer/
│   ├── SKILL.md
│   └── templates/
│       └── test_template.py
└── api-endpoint/
    ├── SKILL.md
    └── examples/
        └── example_endpoint.py
```

### SKILL.md cơ bản:

```markdown
---
name: code-reviewer
description: "Review code for security vulnerabilities, performance issues, and coding standards compliance"
---

# Code Review Instructions

## Checklist
1. Check for SQL injection, XSS, CSRF
2. Verify error handling
3. Check for hardcoded secrets
4. Review performance (N+1 queries, unnecessary loops)
5. Verify test coverage

## Output Format
- Use severity levels: 🔴 Critical, 🟡 Warning, 🟢 Info
- Group by file
- Include line numbers and suggested fixes
```

---

➡️ Tiếp theo: [Tạo Skill đầu tiên](02-tao-skill-dau-tien.md)
