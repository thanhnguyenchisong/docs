# Database at Scale — Xử Lý Hàng Triệu Queries/Giây

## Mục lục
1. [Database là bottleneck số 1](#database-là-bottleneck-số-1)
2. [Read Replicas](#read-replicas)
3. [Database Sharding](#database-sharding)
4. [Connection Pooling](#connection-pooling)
5. [Query Optimization](#query-optimization)
6. [CQRS Pattern](#cqrs-pattern)
7. [Distributed SQL](#distributed-sql)
8. [Kinh nghiệm thực tế](#kinh-nghiệm-thực-tế)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Database Là Bottleneck Số 1

```
PostgreSQL single server:
  - Max connections: ~500-1000 (practical)
  - Throughput: ~10,000-50,000 QPS (simple queries)
  - Throughput: ~1,000-5,000 QPS (complex queries)

Ở 10M RPS (sau cache 90%):
  - 1M queries/s → cần 20-100 DB instances
  - 200K writes/s → cần sharding
```

### Connection = Tài nguyên đắt

```
1 PostgreSQL connection = 1 process = ~10MB RAM
500 connections = 5GB RAM chỉ cho connections

→ KHÔNG THỂ: 1M connections đến 1 DB
→ PHẢI: connection pooling + read replicas + sharding
```

---

## Read Replicas

### Kiến trúc Primary-Replica

```
                    ┌─────────────────┐
                    │   Application   │
                    └────┬───────┬────┘
                         │       │
               Write     │       │  Read
                    ┌────┴──┐  ┌─┴──────────────────┐
                    │Primary│  │  Load Balancer      │
                    │(Write)│  │  (Read Replicas)    │
                    └───┬───┘  └──┬─────┬─────┬─────┘
                        │         │     │     │
                   Replication    │     │     │
                    ┌───┴───┐  ┌──┴─┐ ┌┴──┐ ┌┴──┐
                    │       │  │Rep1│ │Rep2│ │Rep3│ ... │Rep20│
                    │       │  └────┘ └───┘ └───┘
                    │ WAL   │
                    │ ship  │
                    └───────┘
```

### Spring Boot cấu hình Read/Write Split

```java
// DataSource routing
public class ReadWriteRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineLookupKey() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
            ? "read"
            : "write";
    }
}

@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource routingDataSource() {
        ReadWriteRoutingDataSource routing = new ReadWriteRoutingDataSource();
        Map<Object, Object> targets = new HashMap<>();
        targets.put("write", primaryDataSource());
        targets.put("read", replicaDataSource());
        routing.setTargetDataSources(targets);
        routing.setDefaultTargetDataSource(primaryDataSource());
        return routing;
    }

    private DataSource replicaDataSource() {
        HikariConfig config = new HikariConfig();
        // Multiple replicas behind pgBouncer hoặc HAProxy
        config.setJdbcUrl("jdbc:postgresql://replica-lb:5432/mydb");
        config.setMaximumPoolSize(100);
        config.setReadOnly(true);
        return new HikariDataSource(config);
    }
}

// Service
@Service
@Transactional(readOnly = true)  // → route to replica
public class ProductQueryService {
    public List<Product> findAll() { ... }
    public Product findById(Long id) { ... }
}

@Service
@Transactional  // → route to primary
public class ProductCommandService {
    public Product create(ProductInput input) { ... }
    public void update(Long id, ProductInput input) { ... }
}
```

### Replication Lag

```
Primary ghi → WAL ship → Replica apply (delay 10ms - 5s)

Vấn đề:
  User update profile → redirect → đọc từ replica → thấy data CŨ

Giải pháp:
  1. Read-your-writes: sau write → đọc từ PRIMARY (1-2s)
  2. Session consistency: route user cụ thể đến cùng replica
  3. Causal consistency: version check trong response
```

---

## Database Sharding

### Khi nào cần Sharding?

```
Read-heavy → Read Replicas đủ
Write-heavy → Sharding (chia data ra nhiều DB)
Data quá lớn → Sharding (mỗi shard chứa phần data)

Thường: khi single primary không chịu nổi writes (>10K WPS)
       hoặc data > 1TB trên single server
```

### Sharding Strategies

**1. Range-based Sharding**
```
User ID 1-1M      → Shard 1
User ID 1M-2M     → Shard 2
User ID 2M-3M     → Shard 3

Pro: Simple, range queries easy
Con: Hotspots (shard mới ít data, shard cũ nhiều)
```

**2. Hash-based Sharding**
```
Shard = hash(user_id) % num_shards

User 123 → hash(123) % 4 = 3 → Shard 3
User 456 → hash(456) % 4 = 0 → Shard 0

Pro: Phân bố đều
Con: Range queries khó, rebalancing khi thêm shard
```

**3. Directory-based Sharding**
```
Lookup table:
  User 123 → Shard 2
  User 456 → Shard 1

Pro: Flexible
Con: Lookup table = single point of failure, latency thêm
```

### Sharding trong thực tế

```java
// Application-level sharding
@Service
public class ShardRouter {
    private final List<DataSource> shards; // 4 shards

    public DataSource getShardForUser(Long userId) {
        int shardIndex = (int) (userId.hashCode() & 0x7FFFFFFF) % shards.size();
        return shards.get(shardIndex);
    }

    public <T> T executeOnShard(Long userId, Function<JdbcTemplate, T> operation) {
        DataSource shard = getShardForUser(userId);
        JdbcTemplate jdbc = new JdbcTemplate(shard);
        return operation.apply(jdbc);
    }
}

// Usage
public Order getOrder(Long userId, Long orderId) {
    return shardRouter.executeOnShard(userId, jdbc ->
        jdbc.queryForObject(
            "SELECT * FROM orders WHERE user_id = ? AND id = ?",
            orderRowMapper, userId, orderId
        )
    );
}
```

### Cross-shard Queries — Khó nhất

```
// "Tìm tất cả orders có total > 1M" → phải query TẤT CẢ shards
public List<Order> findLargeOrders(BigDecimal minTotal) {
    return shards.parallelStream()
        .flatMap(shard -> {
            JdbcTemplate jdbc = new JdbcTemplate(shard);
            return jdbc.query(
                "SELECT * FROM orders WHERE total > ?",
                orderRowMapper, minTotal
            ).stream();
        })
        .sorted(Comparator.comparing(Order::getTotal).reversed())
        .limit(100)
        .collect(Collectors.toList());
}
// Chậm, expensive → dùng CQRS + materialized views cho analytics
```

---

## Connection Pooling

### PgBouncer — Connection Multiplexer

```
Không PgBouncer:
  100 pods × 50 connections = 5,000 connections → PostgreSQL chết

Có PgBouncer:
  100 pods × 50 connections → PgBouncer → 200 connections đến PostgreSQL
  PgBouncer multiplex: nhiều client connections share ít server connections
```

```ini
# pgbouncer.ini
[databases]
mydb = host=primary.db port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction          # Tốt nhất cho web apps
max_client_conn = 10000          # Clients: nhiều
default_pool_size = 100          # DB connections: ít
reserve_pool_size = 20
reserve_pool_timeout = 3
server_idle_timeout = 60
```

### HikariCP (Java Connection Pool)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 50       # Max connections per pod
      minimum-idle: 10
      idle-timeout: 30000         # 30s
      connection-timeout: 5000    # 5s
      max-lifetime: 600000        # 10 phút
      leak-detection-threshold: 30000
```

**Rule of thumb cho pool size:**
```
Pool size = (core_count * 2) + effective_spindle_count
         ≈ (CPU cores * 2) + 1
         ≈ 10-50 cho web app (tùy load)

Ví dụ: pod 4 CPU → pool size = 4 * 2 + 1 = 9 → dùng 10-20
```

---

## Query Optimization

### Index Strategy cho High Scale

```sql
-- Compound index cho query phổ biến
CREATE INDEX idx_orders_user_status_date
ON orders (user_id, status, created_at DESC);

-- Covering index (include columns để tránh table lookup)
CREATE INDEX idx_products_category_covering
ON products (category_id)
INCLUDE (name, price, stock);

-- Partial index (chỉ index data cần)
CREATE INDEX idx_orders_pending
ON orders (created_at) WHERE status = 'PENDING';
-- Nhỏ hơn full index, nhanh hơn

-- BRIN index cho time-series (nhỏ gọn)
CREATE INDEX idx_logs_created USING BRIN ON logs (created_at);
```

### Batch Operations

```java
// ❌ N+1: 1000 user → 1000 queries
for (Long userId : userIds) {
    orders.add(orderRepo.findByUserId(userId));
}

// ✅ Batch: 1 query
List<Order> orders = orderRepo.findByUserIdIn(userIds);

// ✅ Batch insert
@Modifying
@Query(nativeQuery = true, value =
    "INSERT INTO events (user_id, type, data, created_at) " +
    "VALUES (:userId, :type, :data::jsonb, NOW())")
void batchInsert(@Param("userId") Long userId, ...);
```

---

## CQRS Pattern

### Command Query Responsibility Segregation

```
┌──────────┐     Command (Write)     ┌──────────────┐
│          │ ───────────────────────→ │   Primary    │
│  Client  │                         │   Database   │
│          │     Query (Read)        └──────┬───────┘
│          │ ←────────────────────┐         │ Event
└──────────┘                      │         ↓
                            ┌─────┴─────────────────┐
                            │   Read-optimized      │
                            │   Materialized Views  │
                            │   (MongoDB/Elasticsearch/Redis) │
                            └───────────────────────┘
```

```java
// Command side: ghi vào PostgreSQL + publish event
@Service
public class OrderCommandService {
    public Order createOrder(OrderInput input) {
        Order order = orderRepository.save(toEntity(input));
        eventPublisher.publish(new OrderCreatedEvent(order));
        return order;
    }
}

// Query side: đọc từ materialized view (Elasticsearch/MongoDB)
@Service
public class OrderQueryService {
    @Autowired
    private ElasticsearchOperations esOps;

    public Page<OrderView> search(OrderSearchCriteria criteria) {
        // Elasticsearch: full-text search, aggregation, nhanh hơn SQL JOIN
        return esOps.search(buildQuery(criteria), OrderView.class);
    }
}

// Event handler: sync data từ PostgreSQL → Elasticsearch
@KafkaListener(topics = "order-events")
public void onOrderEvent(OrderCreatedEvent event) {
    OrderView view = buildView(event);
    elasticsearchRepository.save(view);
}
```

---

## Distributed SQL

### Khi PostgreSQL/MySQL không đủ

| Tool | Mô tả | Use case |
|------|--------|----------|
| **Vitess** | MySQL sharding middleware (YouTube dùng) | MySQL + sharding tự động |
| **CockroachDB** | Distributed SQL, ACID, auto-sharding | Global deployment |
| **TiDB** | MySQL-compatible, distributed | MySQL replacement at scale |
| **YugabyteDB** | PostgreSQL-compatible, distributed | PostgreSQL replacement |

---

## Kinh Nghiệm Thực Tế

### 1. Database connection là tài nguyên QUÝ NHẤT

```
Mỗi DB connection tốn:
  - 10MB RAM trên DB server
  - 1 process/thread trên DB server
  - Giới hạn: 200-1000 connections thực tế

→ NẾU 500 pods × 50 conn/pod = 25,000 connections → DB chết
→ BẮT BUỘC: PgBouncer/ProxySQL + pool size nhỏ (10-20/pod)
```

### 2. EXPLAIN ANALYZE mọi query chậm

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.*, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'COMPLETED' AND o.created_at > '2026-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- Tìm: Seq Scan (cần index), Nested Loop (cần JOIN optimization), Sort (cần index sort)
```

### 3. Tránh distributed transactions

```
❌ 2PC across shards: chậm, complex, failure-prone
✅ Saga pattern: each service local transaction + compensating
✅ Eventual consistency: accept 1-5s delay for non-critical data
✅ Idempotent operations: retry-safe
```

---

## Câu Hỏi Phỏng Vấn

### Sharding key chọn thế nào?
> Chọn key có **cardinality cao** (nhiều giá trị), **phân bố đều**, và **query thường filter theo key đó**. Ví dụ: user_id (reads/writes per user), tenant_id (multi-tenant). Tránh: date (hotspot shard mới), status (ít giá trị).

### Read replicas có bao nhiêu là đủ?
> Tùy read throughput. Mỗi replica xử lý ~10-30K QPS. Cần 500K QPS → 20-50 replicas. Nhưng replication lag tăng theo số replicas. Thường 3-20 replicas + heavy caching.

### CQRS có phức tạp không?
> Có. Thêm eventual consistency, event handling, dual write. Chỉ dùng khi read/write mô hình khác nhau rõ rệt (search vs CRUD) hoặc read scale cần riêng.

---

**Tiếp theo:** [05-Message-Queue-Async.md](./05-Message-Queue-Async.md)
