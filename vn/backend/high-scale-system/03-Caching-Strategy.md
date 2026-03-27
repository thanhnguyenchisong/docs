# Caching Strategy — Chìa Khóa Xử Lý Triệu Request

## Mục lục
1. [Tại sao Cache quyết định tất cả?](#tại-sao-cache-quyết-định-tất-cả)
2. [Multi-layer Caching](#multi-layer-caching)
3. [Redis Cluster cho High Scale](#redis-cluster-cho-high-scale)
4. [Cache Patterns](#cache-patterns)
5. [Cache Invalidation](#cache-invalidation)
6. [Hot Key & Thundering Herd](#hot-key--thundering-herd)
7. [Local Cache (L1)](#local-cache-l1)
8. [Kinh nghiệm thực tế](#kinh-nghiệm-thực-tế)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại Sao Cache Quyết Định Tất Cả?

```
Latency so sánh:
  L1 cache (CPU)   : 0.5ns
  L2 cache          : 7ns
  RAM               : 100ns
  Redis (network)   : 100-500μs (0.1-0.5ms)
  SSD               : 100μs
  HDD               : 10ms
  Database query    : 1-100ms
  API call (network): 50-500ms

→ Redis nhanh hơn DB 100-1000x
→ Local cache nhanh hơn Redis 100-1000x
```

### Ví dụ tác động cache

```
Không cache:
  10M RPS × 5ms/DB query = 50,000 CPU-seconds/s ← KHÔNG THỂ

Cache 90% hit ratio:
  1M cache miss × 5ms = 5,000 CPU-seconds/s ← Khả thi (500 DB connections)

Cache 99% hit ratio:
  100K cache miss × 5ms = 500 CPU-seconds/s ← Thoải mái
```

---

## Multi-Layer Caching

```
┌──────────────────────────────────────────────┐
│  L0: Browser/Client Cache                    │  Cache-Control headers
│  Hit ratio: 30-50%                           │  Giảm request đến server
├──────────────────────────────────────────────┤
│  L1: CDN Edge Cache                          │  Cloudflare, CloudFront
│  Hit ratio: 50-70% (static+cacheable API)    │  Giảm traffic đến origin
├──────────────────────────────────────────────┤
│  L2: Local In-Memory Cache                   │  Caffeine, Guava (JVM)
│  Hit ratio: 60-80% (hot data)                │  Không network call
│  TTL ngắn (5-30s), size nhỏ (100MB-1GB)      │
├──────────────────────────────────────────────┤
│  L3: Distributed Cache (Redis Cluster)       │  Redis, Memcached
│  Hit ratio: 85-95%                           │  Shared across pods
│  TTL vừa (1-60 phút), size lớn (50-200GB)    │
├──────────────────────────────────────────────┤
│  L4: Database                                │  PostgreSQL, MySQL
│  Chỉ nhận cache miss (~5-15% requests)       │  Query cache nội bộ
└──────────────────────────────────────────────┘
```

### Flow xử lý request

```java
public Product getProduct(Long id) {
    // L2: Local cache (Caffeine)
    Product cached = localCache.getIfPresent(id);
    if (cached != null) return cached;  // ~0.001ms

    // L3: Redis
    String json = redis.get("product:" + id);
    if (json != null) {
        Product product = deserialize(json);
        localCache.put(id, product);   // Populate L2
        return product;                 // ~0.3ms
    }

    // L4: Database
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new NotFoundException(id));

    // Populate caches
    redis.set("product:" + id, serialize(product), Duration.ofMinutes(10));
    localCache.put(id, product);

    return product;  // ~5-50ms
}
```

---

## Redis Cluster cho High Scale

### Sizing Redis Cluster

```
Yêu cầu: 10M RPS, cache hit 90% → Redis nhận ~9M reads/s + invalidation writes

Redis single node: ~100K-300K ops/s
→ Cần: 9M / 200K = ~45 Redis nodes (master)
→ Với replicas: ~90-135 nodes tổng

Memory:
  50M cached entries × 1KB avg = 50GB
  Overhead + fragmentation: ~80-100GB tổng
  → Mỗi node: 2-3GB (nếu 45 masters)
```

### Redis Cluster Setup

```yaml
# docker-compose (dev) — 6 nodes (3 master, 3 replica)
services:
  redis-1: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
  redis-2: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
  redis-3: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
  redis-4: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
  redis-5: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
  redis-6: { image: redis:7-alpine, command: "redis-server --cluster-enabled yes --cluster-config-file nodes.conf --port 6379" }
```

### Redis tuning cho production

```conf
# redis.conf
maxmemory 8gb
maxmemory-policy allkeys-lfu     # LFU (Least Frequently Used) — tốt cho hot data
save ""                           # Tắt RDB snapshot (performance)
appendonly no                     # Tắt AOF (dùng cho cache, không cần persist)
tcp-keepalive 60
timeout 300
tcp-backlog 65535

# Connection
maxclients 65535
hz 100                            # Server background tasks frequency
```

---

## Cache Patterns

### 1. Cache-Aside (Lazy Loading) — phổ biến nhất

```java
// Read: check cache → miss → query DB → populate cache
// Write: update DB → invalidate cache

public Product getProduct(Long id) {
    String key = "product:" + id;
    Product cached = redis.get(key, Product.class);
    if (cached != null) return cached;

    Product product = db.findById(id);
    redis.set(key, product, Duration.ofMinutes(10));
    return product;
}

public void updateProduct(Long id, ProductUpdate update) {
    db.update(id, update);
    redis.delete("product:" + id);  // Invalidate, không set
}
```

### 2. Write-Through — ghi cache + DB đồng thời

```java
// Ghi vào cả cache và DB
public void updateProduct(Long id, ProductUpdate update) {
    Product updated = db.update(id, update);
    redis.set("product:" + id, updated, Duration.ofMinutes(10));
}
// Pro: Cache luôn fresh
// Con: Write chậm hơn (ghi 2 nơi), có thể inconsistent nếu 1 fail
```

### 3. Write-Behind (Write-Back) — ghi cache trước, DB sau

```java
// Ghi vào cache ngay, batch ghi DB sau
public void incrementViewCount(Long productId) {
    redis.incr("views:" + productId);  // Ghi cache ngay (0.1ms)
    // Background job: mỗi 5 phút flush views vào DB
}

// Scheduled job
@Scheduled(fixedRate = 300_000)
public void flushViewsToDB() {
    Set<String> keys = redis.keys("views:*");
    for (String key : keys) {
        Long views = redis.getAndDelete(key);
        Long productId = extractId(key);
        db.incrementViews(productId, views);
    }
}
// Pro: Write cực nhanh, batch reduces DB load
// Con: Data loss nếu Redis crash trước flush
```

### 4. Read-Through — cache tự load

```java
// Cache tự gọi DB khi miss (dùng CacheLoader)
LoadingCache<Long, Product> cache = Caffeine.newBuilder()
    .maximumSize(100_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .build(id -> productRepository.findById(id).orElse(null));

Product product = cache.get(productId);  // Tự load nếu miss
```

---

## Cache Invalidation

### "There are only two hard things in CS: cache invalidation and naming things"

| Strategy | Mô tả | Use case |
|---------|--------|----------|
| **TTL (Time-To-Live)** | Cache tự hết hạn sau N giây | Dữ liệu ít thay đổi |
| **Event-based** | Kafka/RabbitMQ event → invalidate | Realtime consistency |
| **Write-through** | Ghi DB + update cache cùng lúc | Simple, nhưng expensive |
| **Delete on write** | Ghi DB → delete cache key | Phổ biến nhất (Cache-Aside) |
| **Versioned keys** | `product:123:v5` → đổi version khi update | Tránh race condition |

### Event-based invalidation (Kafka)

```java
// Service A: update product → publish event
public void updateProduct(Long id, ProductUpdate update) {
    db.update(id, update);
    kafka.send("product-events", new ProductUpdatedEvent(id));
}

// Cache Invalidation Consumer: listen event → delete cache
@KafkaListener(topics = "product-events")
public void onProductChanged(ProductUpdatedEvent event) {
    redis.delete("product:" + event.getProductId());
    redis.delete("product-list:*");  // Invalidate related caches
}
```

---

## Hot Key & Thundering Herd

### Hot Key Problem

```
Sản phẩm viral: product:12345 được query 100,000 lần/giây
→ Tất cả đổ vào 1 Redis node (hash slot chứa key này)
→ Node đó bị overload → cascade failure

Giải pháp:
1. Local cache (L2): mỗi pod cache local → không cần gọi Redis
2. Key replication: product:12345:r1, product:12345:r2, ... random chọn replica
3. Read replicas: Redis node đó có thêm read replicas
```

```java
// Hot key solution: random suffix
public Product getHotProduct(Long id) {
    // Phân tán đọc qua nhiều Redis keys
    int replica = ThreadLocalRandom.current().nextInt(10);
    String key = "product:" + id + ":r" + replica;
    
    Product cached = redis.get(key, Product.class);
    if (cached != null) return cached;
    
    // Fallback: key gốc hoặc DB
    cached = redis.get("product:" + id, Product.class);
    if (cached != null) {
        redis.set(key, cached, Duration.ofSeconds(30));
        return cached;
    }
    
    return loadFromDB(id);
}
```

### Thundering Herd (Cache Stampede)

```
Cache key hết hạn → 10,000 requests đồng thời gọi DB → DB chết

Giải pháp 1: Distributed Lock (setnx)
  → Chỉ 1 request load DB, còn lại đợi

Giải pháp 2: Stale-while-revalidate
  → Trả cache cũ, background refresh

Giải pháp 3: Probabilistic early expiration
  → Mỗi request có xác suất nhỏ refresh trước TTL
```

```java
// Solution 1: Distributed Lock
public Product getProductWithLock(Long id) {
    String key = "product:" + id;
    Product cached = redis.get(key, Product.class);
    if (cached != null) return cached;

    String lockKey = "lock:" + key;
    boolean locked = redis.setnx(lockKey, "1", Duration.ofSeconds(5));

    if (locked) {
        try {
            Product product = db.findById(id);
            redis.set(key, product, Duration.ofMinutes(10));
            return product;
        } finally {
            redis.delete(lockKey);
        }
    } else {
        // Đợi rồi retry
        Thread.sleep(50);
        return getProductWithLock(id);
    }
}
```

---

## Local Cache (L1)

### Caffeine (Java — nhanh nhất)

```java
@Configuration
public class CacheConfig {

    @Bean
    public Cache<Long, Product> productCache() {
        return Caffeine.newBuilder()
            .maximumSize(50_000)             // Max entries
            .expireAfterWrite(Duration.ofSeconds(30))  // TTL ngắn (stale OK 30s)
            .recordStats()                   // Enable metrics
            .build();
    }
}

// Sử dụng
@Service
public class ProductService {
    private final Cache<Long, Product> localCache;
    private final RedisTemplate<String, Product> redis;

    public Product getProduct(Long id) {
        // L1: Local (0.001ms)
        Product local = localCache.getIfPresent(id);
        if (local != null) return local;

        // L2: Redis (0.3ms)
        Product remote = redis.opsForValue().get("product:" + id);
        if (remote != null) {
            localCache.put(id, remote);
            return remote;
        }

        // L3: DB (5-50ms)
        Product db = productRepo.findById(id).orElseThrow();
        redis.opsForValue().set("product:" + id, db, Duration.ofMinutes(10));
        localCache.put(id, db);
        return db;
    }
}
```

### Vấn đề: Local cache inconsistency

```
Pod A có localCache["product:123"] = version 1
Pod B cập nhật product:123, invalidate Redis
Pod A vẫn trả version 1 từ local cache (stale 30s)

Giải pháp:
1. TTL ngắn (5-30s) — chấp nhận stale trong khoảng ngắn
2. Pub/Sub invalidation: Redis Pub/Sub → thông báo tất cả pods clear local cache
3. Versioned data: check version trong response, client biết stale
```

---

## Kinh Nghiệm Thực Tế

### 1. Cache hit ratio < 80% → có vấn đề

```
Nguyên nhân:
- Key space quá lớn (long tail): mỗi user có cache riêng → triệu keys, ít repeat
- TTL quá ngắn
- Cache eviction do size limit

Giải pháp:
- Cache popular items (top 10% items = 80% traffic — Pareto)
- Tăng TTL cho data ít thay đổi
- Tăng cache size (more memory)
```

### 2. Đừng cache mọi thứ

```
✅ Nên cache:
- Product details, category listing (ít thay đổi)
- User profile, permissions (đọc nhiều)
- Search results (expensive query)
- Configuration, feature flags
- Aggregated data (counts, stats)

❌ Không nên cache:
- Real-time balance (payment, stock). Nếu cache phải vô cùng cẩn thận.
- Data thay đổi liên tục (chat messages, real-time locations)
- Very large objects (videos, files) — dùng CDN/object storage
```

### 3. Monitor cache metrics

```
Cần monitor:
- Hit ratio: > 85% (target > 95%)
- Evictions/s: cao = cache quá nhỏ
- Memory usage: gần limit = cần expand
- Latency: p99 < 1ms (Redis), < 0.01ms (local)
- Connection count: gần maxclients = cần pool
```

---

## Câu Hỏi Phỏng Vấn

### Cache-Aside vs Write-Through?
> **Cache-Aside**: app quản lý cache thủ công, DB là source of truth. Phổ biến nhất, flexible. **Write-Through**: cache tự ghi DB, đảm bảo consistency nhưng write chậm hơn. Dùng Cache-Aside cho hầu hết case.

### Thundering Herd giải quyết thế nào?
> 3 cách: (1) **Distributed lock** — chỉ 1 request load DB. (2) **Stale-while-revalidate** — trả cache cũ, background refresh. (3) **Probabilistic early expiration** — random refresh trước TTL.

### Local cache có vấn đề gì?
> **Inconsistency** giữa pods (pod A có data cũ, pod B đã update). Giải quyết bằng TTL ngắn (5-30s) hoặc Pub/Sub invalidation. Chấp nhận eventual consistency.

### Redis Cluster vs Redis Sentinel?
> **Sentinel**: HA cho single master (failover). **Cluster**: data sharding + HA. Ở triệu RPS → phải dùng **Cluster** (phân tán data qua nhiều nodes). Sentinel chỉ đủ cho traffic vừa.

---

**Tiếp theo:** [04-Database-at-Scale.md](./04-Database-at-Scale.md)
