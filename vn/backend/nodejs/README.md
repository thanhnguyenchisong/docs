# Tài liệu Node.js — Từ người mới đến Master

Bộ tài liệu **Node.js tiếng Việt** hoàn chỉnh: từ **zero** (chưa biết gì) đến **master** (kiến trúc, performance, microservices, pass phỏng vấn senior/master). Mỗi bài có lý thuyết + code mẫu + câu hỏi phỏng vấn.

---

## 📚 Mục lục

### Nền tảng (Beginner)

| # | File | Nội dung |
|---|------|----------|
| 01 | [Node.js Fundamentals](./01-Nodejs-Fundamentals.md) | Node.js là gì, V8, Event Loop, module system, REPL |
| 02 | [Core Modules](./02-Core-Modules.md) | fs, path, http, os, events, url, crypto, child_process |
| 03 | [NPM & Package Management](./03-NPM-Package-Management.md) | npm/yarn/pnpm, package.json, semver, scripts, publish |
| 04 | [Async Programming](./04-Async-Programming.md) | Callback, Promise, async/await, Event Loop chi tiết, microtask/macrotask |

### Xây dựng ứng dụng (Intermediate)

| # | File | Nội dung |
|---|------|----------|
| 05 | [HTTP & Express.js](./05-HTTP-Express.md) | http module, Express, middleware, routing, template engine |
| 06 | [REST API Design](./06-REST-API-Design.md) | RESTful conventions, validation (Joi/Zod), pagination, versioning, HATEOAS |
| 07 | [Database Integration](./07-Database-Integration.md) | MongoDB (Mongoose), PostgreSQL (Sequelize, Prisma), Redis, migration |
| 08 | [Authentication & Security](./08-Authentication-Security.md) | JWT, bcrypt, Passport, OAuth2, helmet, CORS, rate limiting, OWASP |

### Chất lượng & vận hành (Advanced)

| # | File | Nội dung |
|---|------|----------|
| 09 | [Error Handling & Logging](./09-Error-Handling-Logging.md) | Error patterns, custom errors, Winston, Morgan, centralized logging |
| 10 | [Testing](./10-Testing.md) | Jest, Mocha, supertest, mocking, coverage, TDD/BDD, CI integration |
| 11 | [Streams & Buffers](./11-Streams-Buffers.md) | Readable, Writable, Transform, Duplex, piping, backpressure |
| 12 | [Performance & Optimization](./12-Performance-Optimization.md) | Cluster, Worker Threads, caching, profiling, memory leak, benchmarking |

### Kiến trúc & Master

| # | File | Nội dung |
|---|------|----------|
| 13 | [Microservices với Node.js](./13-Microservices-Nodejs.md) | Patterns, gRPC, message queue (Kafka/RabbitMQ), API Gateway, Docker |
| 14 | [**Master Node.js**](./14-Master-Nodejs.md) | Architecture patterns, design patterns, scalability, **checklist phỏng vấn Senior/Master** |

### Chuyên sâu bổ sung

| # | File | Nội dung |
|---|------|----------|
| 15 | [WebSocket & Real-time](./15-WebSocket-Realtime.md) | ws, Socket.io, rooms, broadcasting, scaling |
| 16 | [GraphQL](./16-GraphQL.md) | Apollo Server, schema, resolvers, mutations, subscriptions, DataLoader |
| 17 | [Swagger & OpenAPI](./17-Swagger-OpenAPI.md) | swagger-jsdoc, swagger-ui-express, annotations, schemas |

---

## 🎯 Lộ trình học

### Level 1: Beginner (1–2 tuần)
1. **01** Node.js Fundamentals → **02** Core Modules → **03** NPM → **04** Async Programming

### Level 2: Intermediate (2–3 tuần)
2. **05** HTTP & Express → **06** REST API → **07** Database → **08** Auth & Security

### Level 3: Advanced (2–3 tuần)
3. **09** Error Handling → **10** Testing → **11** Streams & Buffers → **12** Performance

### Level 4: Master (1–2 tuần)
4. **13** Microservices → **14** Master Node.js (checklist phỏng vấn)

### Level 5: Chuyên sâu (tuỳ chọn)
5. **15** WebSocket → **16** GraphQL → **17** Swagger

**Tổng thời gian gợi ý**: 6–10 tuần (mỗi ngày 1–2 giờ).

---

## 📁 Project minh họa

→ **[example/](./example/)** — Express.js REST API hoàn chỉnh: CRUD, JWT auth, validation, error handling, testing. Xem [example/README.md](./example/README.md) để chạy.

---

## 📝 Mục tiêu

- **Beginner**: Hiểu Node.js runtime, viết script, dùng npm.
- **Intermediate**: Build REST API hoàn chỉnh, kết nối database, authentication.
- **Advanced**: Viết test, xử lý lỗi production-grade, tối ưu performance.
- **Master**: Thiết kế kiến trúc microservices, pass phỏng vấn senior Node.js.

---

**Gợi ý**: Kết hợp với tài liệu [NestJS](../nestjs/), [Prisma](../prisma/), [MongoDB](../mongodb/), [PostgreSQL](../postgresSQL/), [Redis](../redis/), [Kafka](../kafka/), [Docker/K8s](../../devops/) để có bức tranh toàn diện backend.
