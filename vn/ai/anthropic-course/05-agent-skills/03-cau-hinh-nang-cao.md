# Bài 3: Cấu hình nâng cao

> Module: [Agent Skills](./README.md) → Bài 3

---

## 🔹 1. allowed-tools — Giới hạn Tools

```yaml
---
name: doc-writer
description: "Generate documentation from code"
allowed-tools:
  - read_file     # chỉ đọc
  - write_file    # chỉ viết
  - search        # tìm kiếm
  # KHÔNG có bash → skill không thể chạy commands
  # KHÔNG có edit  → skill chỉ tạo file mới, không sửa existing
---
```

**Tại sao giới hạn tools?**
- 🔒 **An toàn** — skill doc-writer không cần chạy shell commands
- 🎯 **Tập trung** — Claude không bị distract bởi tools không liên quan
- ⚡ **Nhanh hơn** — ít tool options → quyết định nhanh hơn

## 🔹 2. Scripts — Chạy không tiêu context

```yaml
---
name: formatter
description: "Format and lint code files"
scripts:
  - command: "prettier --write {file}"
    description: "Format file with Prettier"
    trigger: "after_edit"
  - command: "eslint --fix {file}"
    description: "Fix lint issues"
    trigger: "after_edit"
---
```

Scripts khác hooks:
- **Scripts trong skill** → chỉ chạy khi skill active
- **Hooks** → luôn chạy bất kể skill nào

## 🔹 3. Multi-file Skills

```
.claude/skills/migration-writer/
├── SKILL.md
├── checklist.md        ← checklist trước khi tạo migration
├── naming-convention.md ← quy tắc đặt tên
├── rollback-guide.md   ← hướng dẫn rollback
└── templates/
    ├── add_column.py   ← template migration thêm cột
    └── create_table.py ← template migration tạo bảng
```

```markdown
<!-- SKILL.md -->
---
name: migration-writer
description: "Create database migrations with Alembic"
---

# Migration Writer

## Before creating migration:
1. Review [checklist](./checklist.md)
2. Follow [naming convention](./naming-convention.md)

## Templates
- Add column: see [add_column.py](./templates/add_column.py)
- Create table: see [create_table.py](./templates/create_table.py)

## After creating migration:
- Test rollback: see [rollback-guide](./rollback-guide.md)
```

## 🔹 4. Skill + Subagent

Wire skill vào subagent cho **isolated expert delegation**:

```yaml
# .claude/agents/security-auditor.yml
name: security-auditor
description: "Audit code for security vulnerabilities"
model: claude-sonnet-4-20250514
skills:
  - security-checker       # ← load skill này vào subagent
tools:
  - read_file
  - search
```

```
Main thread: "Audit security cho module auth"
    │
    ▼
Subagent (security-auditor)
    ├── Load skill: security-checker
    ├── Context riêng
    ├── Chỉ có read + search
    └── Trả report → main thread
```

---

➡️ Tiếp theo: [Chia sẻ Skills](04-chia-se-skills.md)
