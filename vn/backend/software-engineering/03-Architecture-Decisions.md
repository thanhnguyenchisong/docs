# Architecture Decision Records (ADR)

## ADR Là Gì?

> Document **quyết định kiến trúc** quan trọng: bối cảnh, options, và lý do chọn. Giúp team hiểu **tại sao** thiết kế như vậy.

## Template ADR

```markdown
# ADR-001: Chọn PostgreSQL thay vì MongoDB cho Order Service

## Status
Accepted (2026-03-15)

## Context
Order service cần lưu trữ thông tin đơn hàng với:
- Quan hệ phức tạp (order → items → products → user)
- Transaction ACID đảm bảo consistency
- Queries phức tạp (JOIN, aggregation, window functions)

## Decision
Chọn **PostgreSQL** thay vì MongoDB.

## Alternatives Considered
| Option | Pro | Con |
|--------|-----|-----|
| **PostgreSQL** | ACID, SQL, JOINs, mature | Scaling writes khó hơn |
| **MongoDB** | Flexible schema, horizontal scale | Eventual consistency, no JOINs |
| **MySQL** | Phổ biến, InnoDB ACID | Ít features hơn PostgreSQL |

## Consequences
- ✅ Strong consistency cho payment flows
- ✅ Complex queries cho reporting
- ⚠️ Cần read replicas nếu scale
- ⚠️ Schema migration cần tooling (Flyway/Liquibase)

## References
- [PostgreSQL vs MongoDB benchmark](...)
- Team discussion: Slack #architecture 2026-03-10
```

## RFC (Request for Comments)

> Proposal lớn cần review từ team / cross-team trước khi implement.

```markdown
# RFC: Migrate Order Service to Event Sourcing

## Author: Alice | Date: 2026-03-01 | Status: In Review

## Problem
Current CRUD approach causes audit trail loss and difficulties
in rebuilding state after failures.

## Proposed Solution
Adopt Event Sourcing for Order aggregate:
- All state changes recorded as immutable events
- Event store: PostgreSQL + Kafka
- Read models built via projections

## Impact
- Teams affected: Order, Payment, Shipping
- Migration: 3 sprints
- Risk: Increased complexity

## Open Questions
1. Which event store library? (Axon vs custom)
2. How to handle schema evolution?

## Timeline
Sprint 15: Prototype | Sprint 16-17: Implementation | Sprint 18: Migration
```

## Khi Nào Viết ADR/RFC?

| ADR (nhỏ) | RFC (lớn) |
|-----------|-----------|
| Chọn framework/library | Thay đổi architecture pattern |
| Chọn database | Cross-team API changes |
| Chọn messaging protocol | New infrastructure |
| Naming convention | Migration strategy |
