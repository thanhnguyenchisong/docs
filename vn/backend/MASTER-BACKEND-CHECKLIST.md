# Checklist Master Backend — Tự tin pass phỏng vấn Master Backend

Sau khi **học thuộc hết** nội dung trong toàn bộ folder backend (Java, JPA, Spring, DB, Kafka, RabbitMQ, Redis, MongoDB, SQL, JFrog, Harbor, Microservices, SSO, Maven, PostgreSQL, Relational DB, Quarkus), dùng checklist này để **tự kiểm tra**. Trả lời rõ ràng hầu hết các mục = **hoàn toàn tự tin pass phỏng vấn master backend**.

---

## 1. Tổng quan nội dung Backend (đã có trong folder)

| Folder | Chủ đề chính | Dùng để trả lời |
|--------|--------------|------------------|
| **java** | Java 8–21, OOP, Collections, Concurrency, JVM, Stream, Design Patterns, Spring, JPA, REST | Core Java, Spring, REST |
| **jpa** | JPA, Entity, Queries, Transactions, Performance (N+1, cache), Advanced | ORM, performance DB |
| **spring-jpa** | Spring Data JPA, Repository, Query methods, Custom queries | Spring Data |
| **relational-database** | SQL, Design, Index, ACID, Isolation, Advanced SQL, Admin | DB design, SQL |
| **postgresSQL** | PostgreSQL: types, tuning, backup, security | PostgreSQL cụ thể |
| **kafka** | Kafka: topics, partitions, producers, consumers, Streams, performance | Message broker, event streaming |
| **rabbitMQ** | RabbitMQ: exchanges, queues, Spring AMQP | Message queue |
| **microservices** | Communication, Discovery, Gateway, Distributed TX, Patterns, Observability, Security, DevOps | Kiến trúc microservices |
| **sso** | SSO, SAML, OAuth2, OIDC, JWT, Security | Auth/AuthZ |
| **maven** | POM, lifecycle, dependencies, multi-module | Build, dependency |
| **quakus** | Quarkus: REST, DI, reactive, native image | Alternative stack |
| **redis** | Redis: data structures, persistence, cache patterns, Spring Data Redis, Cluster, Sentinel | Cache, session, rate limit, real-time |
| **mongodb** | MongoDB: document model, queries, index, aggregation, Spring Data, replica set, sharding | NoSQL, document DB |
| **sql** | SQL: DDL/DML, SELECT, JOIN, subquery, CTE, aggregation, optimization, index | Truy vấn SQL, tối ưu |
| **jfrog** | JFrog Artifactory: artifact repository, local/remote/virtual repo, Maven/npm/Docker, CI/CD, Xray | Build artifact, CI/CD |
| **harbor** | Harbor: container registry, project, replication, scan CVE, RBAC, CI/CD | Container image, DevOps |

---

## 2. Checklist phỏng vấn Master Backend

### Java Core & OOP

- [ ] **4 pillars of OOP** (Encapsulation, Inheritance, Polymorphism, Abstraction) — giải thích và ví dụ.
- [ ] **Abstract class vs Interface** — khi nào dùng gì? Java 8+ default/static trong interface.
- [ ] **equals/hashCode** contract — tại sao phải override cả hai? Dùng trong HashMap thế nào?
- [ ] **ArrayList vs LinkedList** — cấu trúc, độ phức tạp thao tác, khi nào chọn.
- [ ] **HashMap internal**: hash, bucket, linked list/red-black tree (Java 8), load factor, resize.
- [ ] **ConcurrentHashMap** vs synchronized Map — concurrency thế nào?
- [ ] **Stream API**: intermediate vs terminal, lazy evaluation, parallel stream khi nào dùng.
- [ ] **Optional** — tránh null, khi nào dùng, tránh get() khi chưa check.

### JVM & Memory

- [ ] **JVM architecture**: Class loader, runtime data areas (Heap, Stack, Metaspace, PC).
- [ ] **Heap**: Young (Eden, Survivor), Old; object allocation, promotion.
- [ ] **Garbage collection**: Minor GC vs Full GC; G1, ZGC (ưu điểm).
- [ ] **Memory leak** trong Java — ví dụ (static collection, listener không remove, thread local).
- [ ] **OutOfMemoryError**: Heap, Metaspace, Stack — nguyên nhân và hướng xử lý.
- [ ] **JVM flags** thường dùng: -Xmx, -Xms, -XX:MaxMetaspaceSize.

### Concurrency

- [ ] **synchronized** vs **ReentrantLock** — ưu nhược điểm.
- [ ] **volatile**: visibility, không đảm bảo atomicity; khi nào đủ.
- [ ] **Deadlock** — điều kiện xảy ra, cách phòng (order lock, tryLock, timeout).
- [ ] **ExecutorService**: fixed thread pool, cached, scheduled; shutdown đúng cách.
- [ ] **CompletableFuture**: async, combine, exception handling.
- [ ] **Virtual Threads (Java 21)**: mô hình, lợi ích so với platform thread.
- [ ] **Concurrent collections**: CopyOnWriteArrayList, BlockingQueue — use case.

### Spring & Spring Boot

- [ ] **IoC và DI** — inversion of control, dependency injection; Spring quản lý bean thế nào?
- [ ] **Bean scope**: singleton, prototype, request, session — lifecycle.
- [ ] **@Transactional**: propagation (REQUIRED, REQUIRES_NEW, NESTED), isolation, rollback.
- [ ] **AOP**: use case (logging, security, transaction); proxy-based.
- [ ] **Spring Boot auto-configuration**: điều kiện @Conditional, custom starter.
- [ ] **Spring Boot Actuator**: health, metrics, endpoints bảo mật.

### JPA & Database

- [ ] **N+1 problem** — nguyên nhân, giải pháp (JOIN FETCH, EntityGraph, batch size).
- [ ] **Lazy vs Eager** — khi nào dùng, LazyInitializationException và cách tránh.
- [ ] **Transaction isolation levels**: Read Uncommitted, Read Committed, Repeatable Read, Serializable — dirty read, phantom read.
- [ ] **First-level cache (Persistence Context)** vs **Second-level cache** (session factory).
- [ ] **Optimistic vs Pessimistic locking** — version field, LockMode.
- [ ] **Normalization** (1NF, 2NF, 3NF, BCNF) — khi nào denormalize.
- [ ] **Index**: B-Tree, composite index, covering index; khi nào index không dùng (function, type cast).
- [ ] **EXPLAIN / execution plan** — đọc và tối ưu query.

### REST & API

- [ ] **REST principles**: stateless, resource-based URL, HTTP methods đúng nghĩa.
- [ ] **GET vs POST** — idempotent, safe; khi nào dùng PUT vs PATCH.
- [ ] **HTTP status codes**: 200, 201, 204, 400, 401, 403, 404, 409, 500.
- [ ] **API versioning**: URL vs header vs query; backward compatibility.
- [ ] **Idempotency** — POST tạo resource: idempotency key, khi nào cần.
- [ ] **Pagination**: offset vs cursor; sort, filter chuẩn hóa.
- [ ] **Global exception handler** (@ControllerAdvice) — trả về format lỗi thống nhất.
- [ ] **Validation** (@Valid, Bean Validation) — custom validator.

### Microservices

- [ ] **Microservices vs Monolith** — ưu nhược điểm, khi nào chọn microservices.
- [ ] **Sync (REST/gRPC) vs Async (message queue)** — khi nào dùng gì.
- [ ] **Service Discovery**: client-side vs server-side; Consul, Eureka.
- [ ] **API Gateway**: routing, auth, rate limit, aggregation.
- [ ] **Distributed transaction**: Saga (choreography vs orchestration), 2PC — ưu nhược.
- [ ] **Circuit Breaker**: trạng thái (closed, open, half-open), tránh cascade failure.
- [ ] **Database per service** — consistency eventual; event-driven để đồng bộ.
- [ ] **Observability**: distributed tracing (trace id), centralized log, metrics (latency, throughput, error rate).

### Kafka & Message Queue

- [ ] **Kafka**: topic, partition, offset; producer ack, consumer group, rebalance.
- [ ] **Kafka vs RabbitMQ** — use case (throughput, ordering, pattern pub/sub vs queue).
- [ ] **At-least-once vs exactly-once** — producer idempotent, consumer commit offset.
- [ ] **Dead letter queue (DLQ)** — xử lý message lỗi.
- [ ] **Idempotent consumer** — tránh xử lý trùng khi retry.

### Redis & Caching

- [ ] **Redis vs Memcached vs DB** — in-memory, data structures, persistence, use case (cache, session, ranking).
- [ ] **Redis data structures**: String, Hash, List, Set, Sorted Set — khi nào dùng (cache object, queue, leaderboard, unique set).
- [ ] **RDB vs AOF** — snapshot vs append-only; durability, restore; có thể dùng cả hai.
- [ ] **Cache-aside**: read through cache, miss thì DB rồi set cache; write thì invalidate cache.
- [ ] **Cache invalidation** — khi nào xóa vs cập nhật cache; TTL.
- [ ] **Thundering herd / cache stampede** — nhiều request cùng load DB khi key hết hạn; giảm bằng lock, TTL jitter, early refresh.
- [ ] **Spring Data Redis**: RedisTemplate vs StringRedisTemplate; Spring Cache với Redis (serializer, TTL).
- [ ] **Redis Cluster**: hash slot (16384), sharding; hash tag để multi-key cùng slot.
- [ ] **Redis Sentinel**: HA cho single master; auto failover; khi nào dùng Cluster vs Sentinel.

### MongoDB & NoSQL

- [ ] **MongoDB vs SQL** — document model, schema flexible, khi nào dùng NoSQL.
- [ ] **Embedding vs reference** — thiết kế schema document; khi nào embed, khi nào reference.
- [ ] **Index**: single, compound, multikey; left-prefix; explain.
- [ ] **Aggregation pipeline**: $match, $group, $lookup; thứ tự stage.
- [ ] **Replica set**: primary, secondary; read preference.
- [ ] **Sharding**: shard key, chunk; hashed vs range.

### SQL (truy vấn & tối ưu)

- [ ] **JOIN**: INNER, LEFT, khi nào dùng; self-join.
- [ ] **Subquery vs CTE vs JOIN** — khi nào dùng.
- [ ] **GROUP BY, HAVING**; hàm tập hợp (COUNT, SUM, AVG).
- [ ] **Window function**: ROW_NUMBER, RANK, PARTITION BY.
- [ ] **EXPLAIN**, execution plan; index khi nào dùng; covering index.
- [ ] **Phân trang**: tránh OFFSET lớn; cursor-based.

### JFrog & Artifactory

- [ ] **Artifact repository** — vai trò (storage, proxy, single source of truth).
- [ ] **Local vs remote vs virtual** repository.
- [ ] **Maven/npm/Docker** với Artifactory: resolution, deploy (push).
- [ ] **CI/CD**: build → push artifact → deploy từ Artifactory.
- [ ] **Xray**: scan CVE, license; retention policy.

### Harbor (Container Registry)

- [ ] **Harbor vs Docker Registry** — UI, scan, replication, RBAC.
- [ ] **Project, repository, tag**; push/pull với Harbor.
- [ ] **Replication**: pull từ Docker Hub, push sang Harbor khác.
- [ ] **Vulnerability scanning**, image signing (Notary); RBAC.
- [ ] **Kubernetes**: imagePullSecrets; CI push image lên Harbor.

### Security & SSO

- [ ] **Authentication vs Authorization**.
- [ ] **OAuth2**: grant types (authorization code, client credentials, refresh token); role resource owner, client, authorization server, resource server.
- [ ] **JWT**: structure (header.payload.signature), signed vs encrypted; storage (memory vs cookie vs localStorage — rủi ro XSS).
- [ ] **HTTPS, secure cookie** (HttpOnly, Secure, SameSite).
- [ ] **SQL Injection, XSS** — cách phòng (parameterized query, escape output).
- [ ] **Rate limiting** — token bucket, sliding window; mục đích.

### System Design & Scalability (Master level)

- [ ] **CAP theorem**: Consistency, Availability, Partition tolerance — chọn CP vs AP trong thực tế.
- [ ] **Vertical vs horizontal scaling**; stateless service để scale ngang.
- [ ] **Caching strategy**: cache-aside, write-through, TTL; cache invalidation.
- [ ] **Database replication**: read replica, lag; khi nào đọc từ replica.
- [ ] **Sharding**: partition key, hot partition; consistent hashing (ý tưởng).
- [ ] **Event-driven**: event sourcing, CQRS — khi nào dùng.
- [ ] **Design một API hoặc service** từ yêu cầu (ví dụ: design hệ thống đặt hàng, notification) — components, data flow, trade-off.

---

## 3. Chủ đề Master thường gặp (đảm bảo ôn)

- **Consistency**: strong vs eventual; khi nào chấp nhận eventual (cache, replica, message).
- **Idempotency**: POST create với idempotency key; consumer message idempotent.
- **Resilience**: retry (backoff), circuit breaker, timeout; không cascade failure.
- **Observability**: logs (structured), metrics (Prometheus), traces (trace id qua service); alert.
- **Performance**: connection pool, async I/O, batch, N+1 tránh; DB index và query plan.
- **Security**: least privilege, secret management, OWASP top (injection, broken auth, XSS).

---

## 4. Cách dùng checklist

1. **Học đủ** toàn bộ tài liệu trong từng folder (java, jpa, spring-jpa, relational-database, postgresSQL, sql, kafka, rabbitMQ, redis, mongodb, jfrog, harbor, microservices, sso, maven, quakus).
2. **Tự hỏi từng mục** trong checklist; nếu chưa trả lời được thì quay lại bài tương ứng (xem bảng mục 1).
3. **Thực hành**: viết code (Spring Boot, JPA, REST, Kafka consumer/producer), thiết kế schema, vẽ kiến trúc microservices.
4. **Ôn System Design**: đọc thêm sách/blog (Designing Data-Intensive Applications, system design interview) để bổ sung mục 2 “System Design & Scalability”.

---

## 5. Kết luận

**Học thuộc hết** nội dung backend trong folder + **trả lời được rõ ràng** đa số câu trong checklist trên = bạn có đủ nền **master backend** để **tự tin pass phỏng vấn master backend**. Các chủ đề Java, JVM, Concurrency, Spring, JPA, DB, SQL, Redis, MongoDB, JFrog, Harbor, Microservices, Kafka, Security, và System Design cơ bản đều được phủ bởi tài liệu hiện có; checklist giúp bạn không bỏ sót và biết cách “nối” từng chủ đề khi trả lời phỏng vấn.

→ Quay lại [README](./README.md) để xem lộ trình và mục lục từng folder.
