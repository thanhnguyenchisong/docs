# Kiến Trúc Tổng Quan — Xử Lý Triệu Request Đồng Thời

## Mục lục
1. [Mindset thiết kế high-scale](#mindset-thiết-kế-high-scale)
2. [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
3. [Capacity Planning](#capacity-planning)
4. [Các nguyên tắc cốt lõi](#các-nguyên-tắc-cốt-lõi)
5. [Từ 1,000 đến 10,000,000 RPS](#từ-1000-đến-10000000-rps)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Mindset Thiết Kế High-Scale

### Tư duy "Mỗi request tốn bao nhiêu?"

Mỗi request đến hệ thống sẽ **tiêu tốn tài nguyên**. Ở quy mô triệu request, mọi lãng phí nhỏ đều **nhân lên thành thảm họa**.

```
1 request = 1ms CPU + 1 DB query + 1KB memory + 1KB network

Ở 1,000 RPS:  → 1s CPU/s + 1,000 queries/s + 1MB/s memory + 1MB/s network
Ở 1,000,000 RPS: → 1,000s CPU/s + 1M queries/s + 1GB/s memory + 1GB/s network
                   → Cần 1,000 CPU cores, 1M DB connections (KHÔNG THỂ)
```

→ **Kết luận**: Không thể scale bằng cách thêm server. Phải **giảm chi phí mỗi request** và **tránh bottleneck**.

### 3 câu hỏi trước khi thiết kế

1. **Request nào nhiều nhất?** → READ hay WRITE? (Thường 90% READ, 10% WRITE)
2. **Request nào đắt nhất?** → DB query nào chậm? API nào tốn CPU?
3. **Request nào có thể trì hoãn?** → Cái nào phải real-time, cái nào async được?

---

## Kiến Trúc Tổng Quan

### Kiến trúc 7 tầng cho 5-10M RPS

```
                              ┌─────────┐
                              │   CDN   │ ← Static content, edge cache
                              └────┬────┘
                                   │
                         ┌─────────┴──────────┐
                         │  DNS Load Balancer  │ ← GeoDNS, round-robin DNS
                         └─────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
              │  L4/L7 LB │ │  L4/L7 LB │ │  L4/L7 LB │  ← Nginx/HAProxy cluster
              └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                    │              │              │
           ┌────── ┼ ─────────── ┼ ─────────── ┼ ───────┐
           │  API Gateway Cluster (Kong, Envoy)          │  ← Auth, rate limit, routing
           └────────────────────┬─────────────────────── ┘
                                │
           ┌────────────────────┼────────────────────────┐
           │                    │                        │
    ┌──────┴──────┐     ┌──────┴──────┐     ┌──────────┴──┐
    │ Service A   │     │ Service B   │     │ Service C    │  ← K8s pods (auto-scale)
    │ (50 pods)   │     │ (30 pods)   │     │ (20 pods)    │
    └──────┬──────┘     └──────┬──────┘     └──────┬───────┘
           │                    │                    │
    ┌──────┴───────────────────┴────────────────────┴──────┐
    │                    Cache Layer                        │
    │            Redis Cluster (128GB+)                     │  ← Cache 80-90% reads
    └──────────────────────┬───────────────────────────────┘
                           │ (cache miss ~10%)
    ┌──────────────────────┼───────────────────────────────┐
    │               Database Layer                         │
    │  Primary (write) → Read Replicas (10+)               │  ← Sharding nếu cần
    └──────────────────────┬───────────────────────────────┘
                           │
    ┌──────────────────────┴───────────────────────────────┐
    │              Message Queue (Kafka)                    │  ← Async processing
    │       Event-driven cho write-heavy operations        │
    └──────────────────────────────────────────────────────┘
```

### Mỗi tầng xử lý bao nhiêu?

| Tầng | Xử lý | % Traffic giảm |
|------|--------|---------------|
| **CDN** | Static files, cached API responses | **60-70%** requests không đến server |
| **Load Balancer** | Distribute traffic, health check | Phân phối đều |
| **API Gateway** | Rate limit, auth, reject bad requests | **5-10%** bị reject |
| **Cache (Redis)** | Trả kết quả cached cho reads | **80-90%** reads từ cache |
| **Application** | Business logic | Chỉ ~5% tổng traffic cần xử lý |
| **Database** | Persist data, complex queries | Chỉ nhận **cache miss** + writes |
| **Message Queue** | Async writes, event processing | Writes không block response |

**Ví dụ 10M RPS:**
- CDN xử lý: 6M (static)
- Đến server: 4M
- Rate limited: 200K
- Cache hit: 3.4M (90% của 3.8M reads)
- DB queries: ~380K reads + 200K writes
- Async (Kafka): 150K events

→ Database chỉ nhận **~580K queries/s** thay vì 10M. **Đây là cốt lõi.**

---

## Capacity Planning

### Cách tính tài nguyên

```
Bước 1: Xác định peak traffic
  - 10M RPS = 10,000,000 request/giây
  - Thường peak = 3-5x average → average ~2-3M RPS

Bước 2: Tính CPU cần
  - Mỗi request tốn ~1ms CPU (optimized)
  - 1 CPU core xử lý ~1,000 RPS (đơn giản hóa)
  - 10M RPS → 10,000 CPU cores (lý thuyết, trước cache)
  - Sau cache (90% hit): ~1,000 CPU cores cho app logic

Bước 3: Tính Memory
  - Mỗi request tốn ~1KB memory (working)
  - 10M concurrent → ~10GB working memory
  - Redis cache: 50-200GB (tùy data)
  - JVM heap: 2-4GB per pod × 100 pods = 200-400GB

Bước 4: Tính Network
  - Mỗi response ~5KB
  - 10M × 5KB = 50GB/s outbound → CDN xử lý phần lớn
  - Internal: ~5GB/s

Bước 5: Tính Database
  - Read: 500K queries/s → cần ~50 read replicas (10K QPS/replica)
  - Write: 200K writes/s → 20 shards (10K WPS/shard)
  - Hoặc: CQRS + event sourcing + materialized views
```

### Bảng tham chiếu nhanh

| Tài nguyên | 100K RPS | 1M RPS | 10M RPS |
|-----------|---------|--------|---------|
| **App pods** | 20-50 | 100-300 | 500-2000 |
| **CPU cores** | 100 | 500-1000 | 2000-5000 |
| **Memory** | 50GB | 200GB | 1TB+ |
| **Redis nodes** | 3-6 | 10-20 | 30-100 |
| **DB read replicas** | 2-5 | 10-20 | 30-100 |
| **Kafka brokers** | 3 | 5-10 | 20-50 |
| **Load balancers** | 2 | 4-8 | 10-30 |

---

## Các Nguyên Tắc Cốt Lõi

### 1. Cache Everything — "Fastest request is no request"

```
Tầng cache:
1. Browser cache (Cache-Control headers)
2. CDN cache (Cloudflare, CloudFront)
3. API Gateway cache
4. Application cache (local, in-memory)
5. Distributed cache (Redis)
6. Database query cache

→ Mục tiêu: 90%+ cache hit ratio
```

### 2. Async Everything — "Don't wait for what you don't need"

```
Synchronous (phải đợi):
- Đọc data cần hiển thị ngay
- Validate input
- Auth/AuthZ

Asynchronous (không cần đợi):
- Ghi log, audit
- Gửi notification (email, push)
- Update analytics, counters
- Sync data giữa services
- Generate report, export
```

### 3. Scale Horizontally — "Add more machines, not bigger machines"

```
Vertical scaling (scale up):
  4 CPU → 64 CPU → giới hạn phần cứng
  Đắt, single point of failure

Horizontal scaling (scale out):
  1 pod → 100 pods → 1000 pods
  Rẻ (commodity hardware), HA, auto-scale
```

### 4. Fail Gracefully — "Hệ thống PHẢI lỗi, nhưng không CHẾT"

```
- Circuit Breaker: service B chết → không gọi B, trả cache/default
- Bulkhead: isolate failures, không để 1 service kéo chết hệ thống
- Graceful Degradation: tắt feature không critical khi overload
- Rate Limiting: chặn traffic vượt ngưỡng
```

### 5. Measure Everything — "Can't optimize what you can't measure"

```
Metrics cần monitor:
- Request rate (RPS)
- Error rate (%)
- Latency (p50, p95, p99)
- Cache hit ratio
- DB connection pool utilization
- Queue depth
- CPU, Memory, Network I/O
```

---

## Từ 1,000 Đến 10,000,000 RPS

### Stage 1: 1,000 → 10,000 RPS

```diff
+ Thêm Redis cache cho hot data
+ Database read replicas (2-3)
+ Basic load balancer (Nginx)
+ Connection pooling
```

### Stage 2: 10,000 → 100,000 RPS

```diff
+ CDN cho static content
+ Redis Cluster (6-10 nodes)
+ Database sharding hoặc nhiều replicas
+ Message queue cho async operations
+ Horizontal pod autoscaling (K8s)
+ APM & monitoring (Prometheus, Grafana)
```

### Stage 3: 100,000 → 1,000,000 RPS

```diff
+ Multi-region deployment
+ CQRS pattern (tách read/write models)
+ Event sourcing cho write-heavy operations
+ Edge computing (CDN Workers)
+ Connection multiplexing (HTTP/2, gRPC)
+ Service mesh (Istio) cho inter-service
+ Database: nghiêm túc sharding + materialized views
```

### Stage 4: 1,000,000 → 10,000,000 RPS

```diff
+ Custom load balancer (DPDK, kernel bypass)
+ Multi-layer caching (L1 local + L2 Redis + L3 CDN)
+ Database: Vitess/CockroachDB/TiDB cho distributed SQL
+ Kafka: hàng trăm partitions, lossless compression
+ Pre-computed responses (materialized APIs)
+ Edge-side logic (Cloudflare Workers, Lambda@Edge)
+ Zero-copy, ring buffer, custom protocol
+ Nhóm chuyên trách performance engineering
```

---

## Câu Hỏi Phỏng Vấn

### Q1: Thiết kế hệ thống chịu 10M RPS?

> **Framework trả lời:**
> 1. **Clarify**: Read hay Write? Data size? Latency requirement? Consistency?
> 2. **Estimate**: Capacity planning (CPU, memory, network, storage)
> 3. **High-level design**: CDN → LB → Gateway → Service → Cache → DB → Queue
> 4. **Deep dive**: Cache strategy, DB sharding, async processing
> 5. **Trade-offs**: Consistency vs Availability, latency vs throughput

### Q2: Tại sao cache là quan trọng nhất ở scale lớn?

> Database là bottleneck lớn nhất. Mỗi DB query tốn 1-100ms. Ở 10M RPS, nếu mỗi request query DB → cần 10M queries/s → **không DB nào chịu nổi**. Cache (Redis) trả kết quả trong 0.1-0.5ms, giảm DB load 90%+.

### Q3: Khi nào dùng sharding vs read replicas?

> **Read replicas**: khi traffic chủ yếu READ (90%+). Replicate data sang nhiều node, LB phân phối đọc. **Sharding**: khi data quá lớn cho 1 server hoặc WRITE heavy. Chia data theo shard key (user_id, region). Sharding phức tạp hơn (cross-shard queries, rebalancing).

---

**Tiếp theo:** [02-Load-Balancing.md](./02-Load-Balancing.md)
