# Bài 5-8: Daily Workflows, CLAUDE.md, MCP, Hooks

> Module: [Claude Code 101](./README.md) → Bài 5-8

---

## 🔹 Bài 5: Daily Workflows

### Morning Workflow
```bash
# 1. Kiểm tra overnight PRs
claude "Summarize all PRs opened since yesterday. 
Highlight any that need my review."

# 2. Pick up JIRA task
claude "Read JIRA-1234. Analyze requirements and suggest approach."
```

### Development Flow
```
Explore → Plan → Code → Test → Commit
```

### End of Day
```bash
# Auto-commit WIP
claude "Review today's changes, commit with proper messages"

# Tạo summary
claude "Summarize what I accomplished today for standup"
```

---

## 🔹 Bài 6: CLAUDE.md File

CLAUDE.md là **project memory** — file markdown chứa instructions luôn được đọc bởi Claude Code.

### Tạo CLAUDE.md
```bash
# Ở root project
touch CLAUDE.md
```

### Nội dung mẫu
```markdown
# CLAUDE.md

## Project Overview
- E-commerce API built with FastAPI + PostgreSQL
- Python 3.12, Poetry for dependencies
- Microservice architecture

## Coding Standards
- Use type hints for all functions
- Docstrings follow Google style
- Max line length: 100 characters
- Use f-strings, not .format() or %

## Important Commands
- `poetry run pytest` — run tests
- `poetry run ruff check .` — lint
- `poetry run mypy .` — type check

## Architecture
- `src/api/` — FastAPI routes
- `src/services/` — business logic
- `src/models/` — SQLAlchemy models
- `src/schemas/` — Pydantic schemas

## Common Patterns
- All API responses use ResponseSchema wrapper
- Use dependency injection for services
- Database sessions via get_db() dependency

## Do NOT
- Do not modify alembic migration files directly
- Do not use `from module import *`
- Do not commit .env files
```

### Phân cấp CLAUDE.md
```
project/
├── CLAUDE.md              ← project-level (tất cả đều đọc)
├── src/
│   ├── CLAUDE.md          ← src-level (chỉ khi làm việc trong src/)
│   └── api/
│       └── CLAUDE.md      ← api-level (chỉ khi làm việc trong api/)
└── tests/
    └── CLAUDE.md          ← test-specific instructions
```

---

## 🔹 Bài 7: MCP Servers trong Claude Code

Kết nối Claude Code với external tools qua MCP.

### Cấu hình MCP
```json
// .claude/mcp.json (project-level)
{
  "servers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

### Sử dụng trong Claude Code
```bash
# Claude Code tự detect MCP tools
claude "Query database: bao nhiêu users đăng ký tháng này?"
# Claude dùng postgres MCP → run SQL → trả kết quả

claude "Tạo GitHub issue cho bug rate limiting"
# Claude dùng github MCP → tạo issue
```

---

## 🔹 Bài 8: Hooks — Deterministic Control

Hooks là scripts chạy **tự động** tại các thời điểm cụ thể — không cần Claude quyết định.

### Cấu hình Hooks
```json
// .claude/hooks.json
{
  "hooks": {
    "pre_edit": [
      {
        "command": "prettier --write",
        "description": "Format file trước khi edit",
        "pattern": "*.{ts,tsx,js,jsx}"
      }
    ],
    "post_edit": [
      {
        "command": "eslint --fix",
        "description": "Auto-fix lint sau khi edit",
        "pattern": "*.{ts,tsx}"
      }
    ],
    "pre_command": [
      {
        "command": "echo 'Blocked'",
        "description": "Block rm -rf commands",
        "pattern": "rm -rf *",
        "block": true
      }
    ],
    "post_command": [
      {
        "command": "notify-send 'Claude Code' 'Task completed'",
        "description": "Gửi notification khi xong"
      }
    ]
  }
}
```

### Loại hooks:

| Hook | Khi nào chạy | Dùng cho |
|------|-------------|----------|
| `pre_edit` | Trước khi sửa file | Format, backup |
| `post_edit` | Sau khi sửa file | Lint, format |
| `pre_command` | Trước khi chạy command | Block dangerous commands |
| `post_command` | Sau khi chạy command | Notifications, logging |

### Hook khác Subagent/Skill:

```
Hook       → Deterministic, luôn chạy, không dùng AI
Subagent   → AI-powered, context riêng, delegate task
Skill      → AI-powered, instructions tái sử dụng
```

---

## ➡️ Hoàn thành Module!

Tiếp theo:
- [Subagents](../04-subagents/) — delegate tasks chuyên biệt
- [Agent Skills](../05-agent-skills/) — reusable instructions
- [Claude Cowork](../06-claude-cowork/) — dùng Claude với files thực
