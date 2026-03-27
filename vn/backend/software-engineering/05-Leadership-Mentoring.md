# Leadership & Mentoring — Kỹ Năng Master Dev

## Tech Lead vs Individual Contributor

| | IC (Senior/Staff) | Tech Lead |
|---|-----------------|-----------|
| **Code** | 80%+ time coding | 40-60% coding |
| **Design** | Own component/feature | Own architecture decisions |
| **People** | Pair programming | Mentoring, 1:1, conflict resolution |
| **Process** | Follow process | Define/improve process |
| **Scope** | Feature/module | System/product |

## Mentoring Junior/Mid

### 1:1 Structure
```
1. How are you? (5 phút) — well-being
2. What are you working on? (5 phút) — current tasks
3. Any blockers? (5 phút) — unblock
4. Growth topic (10 phút) — kỹ năng muốn improve
5. Action items (5 phút) — next steps cụ thể
```

### Code Review as Mentoring
```
❌ "Sửa lại đi" → Junior không biết sửa gì

✅ "Stream API ở đây sẽ gọn hơn for-loop. Ví dụ:
    items.stream().filter(i -> i.isActive()).toList()
    Bạn thử đổi xem?"
→ Giải thích WHY + gợi ý HOW + để mentee TỰ làm
```

### Growth Framework

```
Junior (0-2 năm):
  ✓ Viết code đúng, test, debug
  ✓ Hiểu codebase, follow patterns
  ✓ Hỏi khi stuck (không tự xoay quá lâu)

Mid (2-5 năm):
  ✓ Design feature end-to-end
  ✓ Code review peers
  ✓ Debug complex issues independently
  ✓ Mentor junior

Senior (5-8 năm):
  ✓ Architecture decisions
  ✓ Cross-team influence
  ✓ Improve team processes
  ✓ Raise quality bar

Master/Staff (8+ năm):
  ✓ System-wide architecture
  ✓ Technical vision & strategy
  ✓ Organizational impact
  ✓ Grow senior engineers
```

## Team Culture

### Engineering Standards
- **Definition of Done**: code + tests + review + docs + deployed
- **Code style**: linter enforced, not debated in reviews
- **On-call rotation**: share the pain, postmortem blameless
- **Knowledge sharing**: tech talks, pair programming, brown bag sessions

### Blameless Postmortem
```markdown
## Incident: Order API downtime — 2026-03-15, 14:00-14:45

### Timeline
14:00 — Alert: order API p99 > 5s
14:05 — On-call investigates, identifies DB connection pool exhaustion
14:15 — Root cause: new query missing index, full table scan
14:25 — Applied index migration
14:45 — Service recovered

### Root Cause
Missing index on orders.user_id for new query in PR #1234.

### Action Items
- [ ] Add query performance test in CI (Alice, Sprint 16)
- [ ] Add connection pool monitoring alert (Bob, this week)
- [ ] Review all queries in recent PRs (Team, retrospective)

### Lessons
- New queries MUST have EXPLAIN ANALYZE in PR description
- Connection pool threshold alert should be < 80%
```

## Câu Hỏi Phỏng Vấn

### Master dev khác senior dev thế nào?
> Senior: own feature/module, write high-quality code. Master: own system architecture, set technical direction, grow other engineers. Senior solves problems. Master **prevents** problems and builds systems that scale (code + team).

### Mentoring junior hiệu quả thế nào?
> (1) Regular 1:1 weekly, (2) Code review as teaching (explain WHY), (3) Pair programming cho tasks khó, (4) Give increasing autonomy, (5) Celebrate progress. Không làm hộ — guide và unblock.
