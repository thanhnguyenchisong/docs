# Bài 4: Chia sẻ Skills

> Module: [Agent Skills](./README.md) → Bài 4

---

## 🔹 1. Commit vào Repository

Cách đơn giản nhất — commit `.claude/skills/` vào git:

```bash
git add .claude/skills/
git commit -m "feat: add team coding skills"
git push
```

**Kết quả:** mọi người clone repo đều có cùng skills.

## 🔹 2. Plugins — Phân phối rộng hơn

Plugins = skills được đóng gói để **cài đặt từ bên ngoài project**.

```bash
# Cài plugin
claude plugin add @company/coding-standards

# Plugin được lưu ở
# ~/.claude/plugins/@company/coding-standards/
```

### Tạo Plugin

```
my-plugin/
├── plugin.json          ← metadata
└── skills/
    ├── api-standards/
    │   └── SKILL.md
    └── test-patterns/
        └── SKILL.md
```

```json
// plugin.json
{
  "name": "@myteam/coding-standards",
  "version": "1.0.0",
  "description": "Team coding standards for Claude Code",
  "skills": [
    "skills/api-standards",
    "skills/test-patterns"
  ]
}
```

## 🔹 3. Enterprise Managed Settings

Cho organizations — deploy skills cho **toàn bộ team**:

```
Admin Console → Claude Code Settings → Managed Skills
├── Upload skills package
├── Set as required (không thể tắt)
└── Override priority: enterprise > project > user
```

**Priority order:**
```
1. Enterprise managed (highest)
2. Project .claude/skills/
3. User ~/.claude/skills/
4. Plugins
```

## 🔹 4. Best Practices chia sẻ

| Practice | Lý do |
|----------|-------|
| **Version control** | Track changes, rollback |
| **README cho mỗi skill** | Giải thích purpose, usage |
| **Đặt tên rõ ràng** | `api-generator` > `skill1` |
| **Test trước khi share** | Đảm bảo skill trigger đúng |
| **CHANGELOG** | Track updates cho team |

---

➡️ Tiếp theo: [Troubleshooting](05-troubleshooting.md)
