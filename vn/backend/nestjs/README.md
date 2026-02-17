# Tài liệu NestJS — Từ cơ bản đến Master

Bộ tài liệu **NestJS tiếng Việt** hoàn chỉnh: framework enterprise cho Node.js, xây dựng trên Express/Fastify, sử dụng TypeScript, kiến trúc module-based lấy cảm hứng từ Angular.

---

## 📚 Mục lục

### Nền tảng

| # | File | Nội dung |
|---|------|----------|
| 01 | [NestJS Fundamentals](./01-NestJS-Fundamentals.md) | NestJS là gì, CLI, project structure, lifecycle, decorators |
| 02 | [Modules, Controllers & Providers](./02-Modules-Controllers-Providers.md) | Module system, controllers, services, DI, scope |

### Xây dựng ứng dụng

| # | File | Nội dung |
|---|------|----------|
| 03 | [Pipes, Guards & Interceptors](./03-Pipes-Guards-Interceptors.md) | Validation (class-validator), authorization, logging, transform |
| 04 | [Database: Prisma & TypeORM](./04-Database-Prisma-TypeORM.md) | Prisma integration, TypeORM, Repository pattern, migrations |
| 05 | [Authentication & Authorization](./05-Authentication-Authorization.md) | Passport, JWT, Guards, RBAC, CASL |

### Nâng cao

| # | File | Nội dung |
|---|------|----------|
| 06 | [GraphQL](./06-GraphQL.md) | Code-first, Schema-first, Resolvers, Subscriptions |
| 07 | [WebSocket & Real-time](./07-WebSocket-Realtime.md) | Gateway, Socket.io, rooms, broadcasting |
| 08 | [Testing](./08-Testing.md) | Unit test, e2e test, mocking, Test module |
| 09 | [Microservices](./09-Microservices.md) | TCP, Redis, Kafka, RabbitMQ, gRPC transport |
| 10 | [Swagger & OpenAPI](./10-Swagger-OpenAPI.md) | Auto-generate docs, decorators, DTO |

### Master

| # | File | Nội dung |
|---|------|----------|
| 11 | [**Master NestJS**](./11-Master-NestJS.md) | Architecture, CQRS, Event Sourcing, Performance, **Checklist phỏng vấn** |

---

## 🎯 Lộ trình học

1. **01** Fundamentals → **02** Modules/Controllers/Providers → **03** Pipes/Guards
2. **04** Database → **05** Auth → **10** Swagger
3. **06** GraphQL → **07** WebSocket → **08** Testing
4. **09** Microservices → **11** Master NestJS

---

## 📁 Project minh họa

→ **[example/](./example/)** — NestJS + Prisma REST API hoàn chỉnh. Xem [example/README.md](./example/README.md).

---

**Kết hợp với**: [Node.js](../nodejs/), [Prisma](../prisma/), [Kafka](../kafka/), [Redis](../redis/), [Docker/K8s](../../devops/).
