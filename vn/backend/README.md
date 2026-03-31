# Tài liệu Backend

Tài liệu luyện phỏng vấn và tham khảo cho lập trình backend: Java, framework, database, message queue, SSO. Mỗi folder có README riêng với mục lục và thứ tự đọc.

## 🎯 Mục tiêu Master Backend

**Học thuộc hết** nội dung trong toàn bộ folder backend và trả lời được **Checklist Master Backend** → **hoàn toàn tự tin pass phỏng vấn master backend**.

→ **[MASTER-BACKEND-CHECKLIST.md](./MASTER-BACKEND-CHECKLIST.md)** — tổng hợp câu hỏi phỏng vấn theo chủ đề (Java, JVM, Concurrency, Spring, JPA/DB, REST, Microservices, Kafka, Security, System Design) và cách ôn. Làm xong checklist = sẵn sàng master.

---

## Cấu trúc

| Folder | Mô tả |
|--------|--------|
| [**java**](./java/) | Java 8–21, OOP, Collections, Concurrency, JVM, Spring, REST API |
| [**jpa**](./jpa/) | JPA, Entity, Queries, Spring Data JPA, Transactions |
| [**spring-jpa**](./spring-jpa/) | Spring Data JPA: Repository, query methods, custom queries |
| [**relational-database**](./relational-database/) | SQL, thiết kế DB, index, ACID, administration |
| [**postgresSQL**](./postgresSQL/) | PostgreSQL: types, performance, backup, security |
| [**kafka**](./kafka/) | Kafka: topics, producers, consumers, Streams |
| [**rabbitMQ**](./rabbitMQ/) | RabbitMQ: exchanges, queues, Spring AMQP |
| [**redis**](./redis/) | Redis: data structures, cache patterns, Spring Data Redis, Cluster, Sentinel |
| [**mongodb**](./mongodb/) | MongoDB: document model, queries, aggregation, Spring Data, replica set, sharding |
| [**sql**](./sql/) | SQL: SELECT, JOIN, subquery, CTE, aggregation, optimization, index |
| [**jfrog**](./jfrog/) | JFrog Artifactory: artifact repository, Maven/npm/Docker, CI/CD, Xray |
| [**harbor**](./harbor/) | Harbor: container registry, replication, scan CVE, RBAC, CI/CD |
| [**microservices**](./microservices/) | Microservices: communication, discovery, gateway, patterns |
| [**quarkus**](./quarkus/) | Quarkus: REST, DI, reactive, native image, Virtual Threads |
| [**maven**](./maven/) | Maven: POM, lifecycle, dependencies, multi-module |
| [**nodejs**](./nodejs/) | **Node.js**: 17 bài từ cơ bản đến master (Express, REST, JWT, DB, Testing, WebSocket, GraphQL, Swagger) |
| [**nestjs**](./nestjs/) | **NestJS**: 11 bài — framework enterprise (Modules, DI, Prisma, TypeORM, Auth, GraphQL, WebSocket, Microservices, Swagger) |
| [**prisma**](./prisma/) | **Prisma**: 7 bài — ORM hiện đại (Schema, Relations, CRUD, Migrations, Advanced, Performance) |
| [**sso**](./sso/) | SSO: SAML, OAuth2, OIDC, JWT |
| [**high-scale-system**](./high-scale-system/) | 🔥 **Xử lý 5-10 triệu request đồng thời**: kiến trúc, cache, DB sharding, Kafka, rate limiting, case studies (10 bài) |
| [**design-patterns**](./design-patterns/) | 🎨 **Design Patterns & Architecture**: SOLID, GoF (23 patterns), Clean Architecture, DDD, Anti-patterns (8 bài) |
| [**testing**](./testing/) | 🧪 **Testing**: JUnit 5, Mockito, Testcontainers, Contract Testing, Performance Testing (6 bài) |
| [**software-engineering**](./software-engineering/) | 📐 **Software Engineering**: Code Review, Tech Debt, ADR/RFC, Estimation, Leadership (5 bài) |
| [**graphql**](./graphql/) | GraphQL: Schema, Resolvers, DataLoader, Federation (4 bài) |
| [**elasticsearch**](./elasticsearch/) | Elasticsearch: Full-text search, Query DSL, Aggregations, Spring Data (3 bài) |
| [**grpc**](./grpc/) | gRPC: Protobuf, Streaming, Spring Boot integration (3 bài) |
| [**aws-cloud**](./aws-cloud/) | ☁️ **AWS/Cloud**: EC2, S3, RDS, Lambda, EKS, Architecture Patterns, Security (5 bài) |
| [**AI**](./AI/) | 🤖 **AI**: ML Fundamentals, Deep Learning, NLP, Transformer, LLMs, Prompt Engineering, RAG, Agentic AI, Generative AI, Computer Vision, Vector DB, Fine-tuning, MLOps, Safety, Interview (15 bài) |

## Lộ trình gợi ý

- **Bắt đầu**: [java](./java/) → [maven](./maven/) → [relational-database](./relational-database/) hoặc [postgresSQL](./postgresSQL/)
- **Spring**: [java](./java/) (Spring phần) → [spring-jpa](./spring-jpa/) → [jpa](./jpa/)
- **Message & scale**: [kafka](./kafka/) hoặc [rabbitMQ](./rabbitMQ/) → [microservices](./microservices/)
- **Cache**: [redis](./redis/) — cache, session, rate limit, Spring Data Redis
- **NoSQL**: [mongodb](./mongodb/) — document DB, aggregation, Spring Data MongoDB
- **SQL**: [sql](./sql/) — truy vấn, JOIN, CTE, optimization (bổ sung [relational-database](./relational-database/))
- **Artifact & Registry**: [jfrog](./jfrog/) (Artifactory), [harbor](./harbor/) (container registry) — CI/CD, build, deploy
- **Node.js**: [nodejs](./nodejs/) — từ zero đến master (17 bài + example project chạy được)
- **NestJS**: [nestjs](./nestjs/) — enterprise framework (11 bài + example NestJS + Prisma + JWT + Swagger)
- **Prisma**: [prisma](./prisma/) — ORM hiện đại (7 bài + example Prisma + Express)
- **Auth**: [sso](./sso/)
- **High-Scale**: [high-scale-system](./high-scale-system/) — 🔥 xử lý 5-10 triệu request đồng thời
- **Design & Architecture**: [design-patterns](./design-patterns/) — SOLID, GoF, Clean Architecture, DDD. **Bắt buộc cho mọi level.**
- **Testing**: [testing](./testing/) — JUnit, Mockito, Testcontainers, Contract Testing
- **Software Engineering**: [software-engineering](./software-engineering/) — Code Review, Tech Debt, ADR, Leadership
- **API alternatives**: [graphql](./graphql/) + [grpc](./grpc/) + [elasticsearch](./elasticsearch/)
- **Cloud**: [aws-cloud](./aws-cloud/) — AWS core services, EKS, architecture patterns
- **AI**: [AI](./AI/) — 🤖 ML, Deep Learning, LLMs, RAG, Agents, Fine-tuning, MLOps (15 bài chuyên sâu)
- **Master**: Học hết các folder trên → làm **[MASTER-BACKEND-CHECKLIST.md](./MASTER-BACKEND-CHECKLIST.md)** để tự kiểm tra và ôn system design/scalability.

Đọc README trong từng folder để xem mục lục chi tiết và bài tập.

---

## 📁 Project minh họa (example)

Mỗi folder backend có thư mục **`example/`** với project **chạy được** (Maven/Spring Boot, Docker, script): [java/example](./java/example), [jpa/example](./jpa/example), [spring-jpa/example](./spring-jpa/example), [maven/example](./maven/example), [kafka/example](./kafka/example), [rabbitMQ/example](./rabbitMQ/example), [redis/example](./redis/example), [quarkus/example](./quarkus/example), [postgresSQL/example](./postgresSQL/example), [microservices/example](./microservices/example), [nodejs/example](./nodejs/example), [nestjs/example](./nestjs/example), [prisma/example](./prisma/example). Vào từng `example/` và đọc README để biết cách chạy.
