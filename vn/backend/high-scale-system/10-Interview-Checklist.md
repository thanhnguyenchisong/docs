# Interview & Checklist — System Design High Scale

## Mục lục
1. [Framework trả lời System Design](#framework-trả-lời-system-design)
2. [Checklist High Scale](#checklist-high-scale)
3. [Top 20 Câu Hỏi Phỏng Vấn](#top-20-câu-hỏi-phỏng-vấn)
4. [Cheat Sheet — Số Liệu Cần Nhớ](#cheat-sheet--số-liệu-cần-nhớ)

---

## Framework Trả Lời System Design

### STAR-D Framework (5 bước, 35-45 phút)

```
S — Scope & Requirements (5 phút)
    Hỏi clarifying questions:
    - Users: bao nhiêu? DAU/MAU?
    - Scale: requests/s? data volume?
    - Latency: p99 target?
    - Consistency: strong hay eventual?
    - Features: core requirements?

T — Traffic Estimation (5 phút)
    Tính capacity:
    - RPS (peak vs average)
    - Storage (per day, per year)
    - Bandwidth (ingress, egress)
    - Memory (cache size)

A — Architecture Design (10-15 phút)
    High-level components:
    - Client → CDN → LB → Gateway → Services → Cache → DB → Queue
    - Draw diagram, explain flow

R — Refined Deep Dive (10-15 phút)
    Deep dive bottlenecks:
    - Database design & scaling
    - Caching strategy
    - Message queue usage
    - Failure handling

D — Discussion & Trade-offs (5 phút)
    - Trade-offs (CAP, latency vs consistency)
    - Monitoring & alerting
    - Future scaling
```

---

## Checklist High Scale

### Architecture
- [ ] CDN cho static content và cacheable API responses
- [ ] Multi-layer load balancing (L4 + L7)
- [ ] API Gateway: auth, rate limiting, routing
- [ ] Horizontal scaling (stateless services, K8s pods)
- [ ] Multi-region deployment (nếu global users)

### Caching
- [ ] Multi-layer: Browser → CDN → Local (Caffeine) → Redis → DB
- [ ] Cache hit ratio monitoring (target > 90%)
- [ ] Cache invalidation strategy (TTL + event-based)
- [ ] Hot key protection (local cache, key replication)
- [ ] Thundering herd prevention (distributed lock / stale-while-revalidate)

### Database
- [ ] Read replicas (tách read/write)
- [ ] Connection pooling (PgBouncer, HikariCP)
- [ ] Sharding strategy (nếu single primary không đủ)
- [ ] Index optimization (compound, covering, partial)
- [ ] CQRS (nếu read/write model khác nhau)
- [ ] Batch operations (tránh N+1)

### Message Queue
- [ ] Async processing cho non-critical operations
- [ ] Kafka cho high throughput, RabbitMQ cho routing
- [ ] Dead Letter Queue cho failed messages
- [ ] Idempotent consumers (dedup)
- [ ] Outbox pattern (atomic event publish)
- [ ] Monitor consumer lag

### Application
- [ ] Thread pool sizing (CPU-bound vs I/O-bound)
- [ ] Connection reuse (keepalive, pool)
- [ ] Virtual Threads (Java 21+) hoặc WebFlux
- [ ] JVM tuning (GC, heap, thread stack)
- [ ] Serialization (Protobuf cho inter-service, JSON cho client)

### Protection
- [ ] Rate limiting (multi-layer: CDN + Gateway + Service)
- [ ] Circuit breaker (Resilience4j)
- [ ] Bulkhead (isolate thread pools)
- [ ] Graceful degradation (feature flags)
- [ ] DDoS protection (CDN/WAF)

### Infrastructure
- [ ] K8s HPA (CPU + custom metrics)
- [ ] Pre-scaling cho planned events (flash sale)
- [ ] Spot instances cho non-critical workloads
- [ ] Resource requests/limits cho mỗi pod
- [ ] Monitoring: RED metrics (Rate, Error, Duration)
- [ ] Alerting: trước khi user phàn nàn

---

## Top 20 Câu Hỏi Phỏng Vấn

### Architecture & Design

**1. Thiết kế hệ thống chịu 10M RPS?**
> CDN (60% traffic) → Multi-layer LB → Gateway (rate limit) → Stateless services (K8s auto-scale) → Cache (Redis Cluster, 90% hit) → DB (read replicas + sharding) → Kafka (async writes). Database chỉ nhận ~5% tổng traffic.

**2. CAP Theorem ảnh hưởng high-scale thế nào?**
> Ở distributed system, chỉ chọn được 2/3: Consistency, Availability, Partition tolerance. Ở triệu RPS (luôn có partition) → chọn AP (available + partition tolerant) + eventual consistency cho hầu hết data. Strong consistency chỉ cho critical data (payment, stock).

**3. Horizontal vs Vertical scaling?**
> Vertical: máy lớn hơn (giới hạn phần cứng, expensive, SPOF). Horizontal: thêm máy (unlimited, commodity, HA). Ở triệu RPS → horizontal là BẮT BUỘC.

**4. Stateless vs Stateful services?**
> Stateless: không lưu state trong memory → scale dễ (thêm pod bất kỳ). Stateful: lưu state (session, in-memory cache) → cần sticky session, shard. Web services nên stateless (state ở Redis/DB).

### Caching

**5. Cache invalidation strategy?**
> (1) TTL: simple, stale trong TTL window. (2) Event-based: Kafka event → delete cache. (3) Write-through: ghi DB + cache đồng thời. Phổ biến nhất: TTL + event-based (hybrid).

**6. Multi-layer cache hoạt động thế nào?**
> L1 (local, Caffeine, 0.001ms) → L2 (Redis, 0.3ms) → L3 (DB, 5-50ms). Mỗi layer có TTL khác nhau. Local cache TTL ngắn (30s), Redis TTL dài hơn (10 phút). Trade-off: freshness vs performance.

**7. Hot key trong Redis?**
> Key được query quá nhiều → 1 Redis node overload. Giải pháp: (1) Local cache (tránh gọi Redis), (2) Key replication (product:123:r0 đến r9, random chọn), (3) Redis read replicas.

### Database

**8. Sharding key chọn thế nào?**
> High cardinality + even distribution + match query pattern. user_id (tốt cho user-centric apps). Tránh: date (hot recent shard), status (ít giá trị).

**9. Connection pooling tại sao quan trọng?**
> Mỗi DB connection = 1 process + 10MB RAM. 500 pods × 50 conn = 25K connections → DB chết. Connection pool: 500 pods × 10 conn → PgBouncer → 200 connections đến DB.

**10. N+1 query problem ở scale lớn?**
> Ở 100K RPS, N+1 (mỗi request thêm N queries) → 100K × N queries → DB chết. Giải pháp: batch queries (IN clause), JOIN, DataLoader pattern, preload.

### Message Queue

**11. Kafka vs RabbitMQ choice?**
> Kafka: throughput (1M+ msg/s), log retention, replay, event streaming. RabbitMQ: routing flexibility, simple task queue. Ở triệu events → Kafka.

**12. Exactly-once processing?**
> Kafka: idempotent producer + transactional producer. Consumer: idempotency key (check đã xử lý chưa trước khi process). Outbox pattern cho atomic event publish.

**13. Consumer lag xử lý thế nào?**
> Scale consumers (max = partition count). Batch processing. Priority queues. Monitor lag metric → alert khi tăng liên tục.

### Application

**14. Thread pool sizing?**
> CPU-bound: cores + 1. I/O-bound: cores × (1 + wait/compute). Tách CPU pool và I/O pool. Benchmark để fine-tune.

**15. Virtual Threads thay thế WebFlux?**
> Cho I/O-bound web apps: gần như có. Code blocking nhưng không block OS thread. WebFlux vẫn tốt cho streaming, backpressure.

### Protection

**16. Rate limiting algorithm?**
> Token Bucket (burst + sustained rate). Sliding Window Counter (accurate + efficient). Implement bằng Redis Lua script (atomic).

**17. Circuit breaker khi nào mở?**
> Failure rate > threshold (ví dụ 50%) trong sliding window. OPEN → reject all → timeout → HALF-OPEN → test → success → CLOSED.

**18. Graceful degradation example?**
> Flash sale: tắt recommendations, search suggestions, analytics. Giữ core: browse + cart + checkout. Giảm 60% load, user vẫn mua được.

### General

**19. Monitor metrics nào quan trọng nhất?**
> RED: **R**ate (request/s), **E**rror (% errors), **D**uration (latency p50, p95, p99). Plus: cache hit ratio, DB connection pool util, consumer lag, CPU/memory.

**20. Chuẩn bị flash sale thế nào?**
> (1) Estimate peak, (2) Load test, (3) Pre-scale 30 phút trước, (4) Warm cache, (5) Rate limit, (6) Feature flags (tắt non-essential), (7) War room, (8) Runbook sẵn.

---

## Cheat Sheet — Số Liệu Cần Nhớ

### Latency

| Operation | Latency |
|-----------|---------|
| L1 cache | 0.5 ns |
| RAM | 100 ns |
| Redis (network) | 0.1-0.5 ms |
| SSD random read | 0.1 ms |
| DB simple query | 1-10 ms |
| DB complex query | 10-100 ms |
| API call (same region) | 1-10 ms |
| API call (cross region) | 50-200 ms |

### Throughput

| Component | Capacity |
|-----------|----------|
| Nginx (proxy) | 100K-500K RPS/server |
| Redis | 100K-300K ops/s/node |
| PostgreSQL | 10K-50K QPS/server |
| Kafka broker | 1M+ msg/s |
| RabbitMQ | 50K msg/s/node |
| Application pod | 500-5000 RPS |

### Capacity

| Metric | Value |
|--------|-------|
| PostgreSQL max connections | 200-1000 practical |
| Redis max memory (single) | 25GB recommended |
| Kafka partition count | 1-thousands |
| K8s pods per node | 30-110 |
| TCP connections per server | 50K-1M+ |

---

**Quay lại:** [README.md](./README.md)

---

🎉 **Chúc mừng bạn đã hoàn thành bộ tài liệu High-Scale System!**

Áp dụng: thiết kế hệ thống trên giấy (system design interview) + áp dụng patterns vào project thực tế. Start simple → measure → optimize bottleneck → scale.
