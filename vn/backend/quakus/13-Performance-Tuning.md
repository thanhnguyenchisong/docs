# Performance Tuning & Benchmarking - Từ Zero đến Master Quarkus

## Mục lục
1. [Tư duy Performance Engineering](#tư-duy-performance-engineering)
2. [JVM Tuning cho Quarkus](#jvm-tuning-cho-quarkus)
3. [GC (Garbage Collection) chuyên sâu](#gc-garbage-collection-chuyên-sâu)
4. [Connection Pool Sizing](#connection-pool-sizing)
5. [Hibernate / JPA Optimization](#hibernate--jpa-optimization)
6. [HTTP & REST Optimization](#http--rest-optimization)
7. [Caching Strategy tổng hợp](#caching-strategy-tổng-hợp)
8. [Reactive vs Blocking Performance](#reactive-vs-blocking-performance)
9. [Profiling & Diagnostics](#profiling--diagnostics)
10. [Load Testing & Benchmarking](#load-testing--benchmarking)
11. [Production Monitoring](#production-monitoring)
12. [Container & Kubernetes Tuning](#container--kubernetes-tuning)
13. [Checklist Production-Ready](#checklist-production-ready)
14. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tư duy Performance Engineering

### 3 nguyên tắc vàng

#### 1. Đo trước, tối ưu sau

```
❌ KHÔNG: "Chắc cái này chậm" → refactor mù
✅ CÓ: Đo metrics → tìm bottleneck → tối ưu → đo lại → confirm

Workflow:
1. Chạy load test (baseline)
2. Phân tích flame graph / metrics → tìm hotspot
3. Tối ưu 1 thứ duy nhất
4. Chạy lại load test → so sánh với baseline
5. Lặp lại nếu cần
```

#### 2. Amdahl's Law

```
Nếu 80% thời gian là DB query → tối ưu code Java chỉ cải thiện tối đa 20%
→ Tập trung vào bottleneck lớn nhất trước!

Thứ tự tối ưu thường gặp:
1. Database queries (N+1, missing index, full table scan)
2. External API calls (latency, timeout)
3. Connection pool (exhaustion, wait time)
4. Serialization (JSON, object mapping)
5. GC tuning (pause time, heap sizing)
6. JVM options (JIT, class loading)
```

#### 3. Keep It Simple

```
Premature optimization is the root of all evil. — Donald Knuth

Chỉ tối ưu khi:
- SLA bị vi phạm (p99 latency > threshold)
- Throughput không đủ cho expected load
- Resource cost quá cao (CPU, memory, instances)
```

---

## JVM Tuning cho Quarkus

### Heap Sizing

```properties
# application.properties hoặc Dockerfile ENV

# ===== Container-aware (khuyến nghị) =====
# JVM tự detect container memory limit
-XX:+UseContainerSupport                    # Mặc định ON từ JDK 10+
-XX:MaxRAMPercentage=75.0                   # 75% container memory cho heap
-XX:InitialRAMPercentage=50.0               # Start với 50%
# Ví dụ: Container limit 512MB → Max heap ~384MB, Initial ~256MB

# ===== Fixed size (khi biết chính xác) =====
-Xmx512m                                   # Max heap
-Xms256m                                   # Initial heap
# Tip: Xms = Xmx → tránh heap resize (ổn định hơn nhưng tốn memory)
```

### Metaspace

```properties
# Quarkus build-time optimization → ít class loading runtime → Metaspace nhỏ
-XX:MaxMetaspaceSize=128m                  # Giới hạn metaspace
-XX:MetaspaceSize=64m                      # Initial metaspace

# Quarkus thường chỉ dùng 30-60MB metaspace (ít hơn Spring)
```

### JIT Compiler

```properties
# Tiered Compilation (mặc định)
-XX:+TieredCompilation                     # C1 → C2 (warmup nhanh + peak cao)

# Nếu cần startup nhanh hơn (serverless):
-XX:TieredStopAtLevel=1                    # Chỉ dùng C1 (nhanh nhưng throughput thấp hơn)

# Nếu cần peak throughput (long-running):
-XX:-TieredCompilation                     # Chỉ dùng C2 (warmup lâu nhưng peak cao nhất)
```

### Thread Stack Size

```properties
# Mặc định: 1MB per thread (Platform Thread)
-Xss512k                                  # Giảm nếu không dùng deep recursion
# Tiết kiệm: 200 threads × 512KB = 100MB thay vì 200MB

# Virtual Threads: Stack tự resize (KB) → không cần config
```

### Quarkus JVM profile (production)

```dockerfile
# Dockerfile production
ENV JAVA_OPTS="\
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:MaxMetaspaceSize=128m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -Xss512k \
    -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/quarkus-run.jar"]
```

---

## GC (Garbage Collection) chuyên sâu

### Chọn GC cho Quarkus

| GC | Use Case | Quarkus Fit |
| :--- | :--- | :--- |
| **G1GC** | General purpose, balanced | ✅ **Mặc định, recommended** |
| **ZGC** | Ultra-low latency (<1ms pause) | ✅ Cho latency-sensitive API |
| **Shenandoah** | Low latency (OpenJDK) | ✅ Tương tự ZGC |
| **SerialGC** | Minimal memory, single core | ✅ Cho container nhỏ (<256MB) |
| **ParallelGC** | Max throughput, batch processing | 🟡 Cho batch jobs |

### G1GC Tuning (Production default)

```properties
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200              # Target pause time (ms)
-XX:G1HeapRegionSize=4m               # Region size (2-32MB, auto nếu không set)
-XX:G1NewSizePercent=20               # Min Young gen (% heap)
-XX:G1MaxNewSizePercent=40            # Max Young gen
-XX:ParallelGCThreads=4               # Threads cho parallel GC phases
-XX:ConcGCThreads=2                   # Threads cho concurrent marking
-XX:InitiatingHeapOccupancyPercent=45  # Start concurrent marking khi heap 45% đầy
-XX:+UseStringDeduplication            # Dedup String objects (tiết kiệm heap)
```

### ZGC (Ultra-low latency)

```properties
-XX:+UseZGC
-XX:+ZGenerational                     # Generational ZGC (Java 21+) — hiệu quả hơn
# ZGC tự tune — ít config cần thiết
# Pause time: < 1ms (gần như constant)
# Trade-off: Throughput thấp hơn G1 ~5-10%, CPU cao hơn ~10%
```

### Khi nào dùng ZGC vs G1?

```
P99 latency requirement:
  > 100ms  → G1GC (đơn giản, general purpose)
  10-100ms → G1GC tuned (MaxGCPauseMillis=50)
  < 10ms   → ZGC hoặc Shenandoah
  < 1ms    → ZGC (Generational)
```

### GC Logging (cần thiết cho production)

```properties
# Java 21+ unified logging
-Xlog:gc*:file=/var/log/gc.log:time,uptime,level,tags:filecount=5,filesize=50m

# Phân tích GC log:
# Tool: GCViewer, GCEasy.io, Eclipse MAT
```

---

## Connection Pool Sizing

### Công thức cơ bản

```
Pool Size = Throughput × Average Latency

Ví dụ:
- Target: 1000 req/s
- Average DB query time: 10ms = 0.01s
- Pool size = 1000 × 0.01 = 10 connections

Thêm buffer 20-50%:
- Recommended: 12-15 connections
```

### Quy tắc HikariCP "Pool Sizing"

```
connections = ((core_count * 2) + effective_spindle_count)

Ví dụ:
- 4-core CPU, SSD (1 spindle) → (4 × 2) + 1 = 9 connections
- 8-core CPU, SSD → (8 × 2) + 1 = 17 connections

→ Thường 10-20 connections là đủ cho hầu hết microservice
→ ĐỪNG set 100+ connections (DB sẽ bị overwhelm)
```

### Quarkus Agroal Configuration

```properties
# ===== Connection Pool =====
quarkus.datasource.jdbc.min-size=5                # Giữ tối thiểu 5 connections warm
quarkus.datasource.jdbc.max-size=20               # Tối đa 20 connections
quarkus.datasource.jdbc.initial-size=5             # Khi startup tạo 5

# ===== Timeouts =====
quarkus.datasource.jdbc.acquisition-timeout=5S     # Chờ tối đa 5s để lấy connection
quarkus.datasource.jdbc.idle-removal-interval=PT2M # Check idle connections mỗi 2 phút
quarkus.datasource.jdbc.max-lifetime=PT30M         # Refresh connection sau 30 phút
quarkus.datasource.jdbc.leak-detection-interval=PT1M # Phát hiện connection leak sau 1 phút

# ===== Validation =====
quarkus.datasource.jdbc.validation-query-sql=SELECT 1  # Kiểm tra connection còn sống
quarkus.datasource.jdbc.background-validation-interval=PT2M
```

### Monitoring Pool

```properties
# Bật metrics cho connection pool
quarkus.datasource.metrics.enabled=true
```

```
Metrics quan trọng:
- agroal.active.count          → Connections đang dùng
- agroal.idle.count            → Connections idle
- agroal.awaiting.count        → Threads đang chờ connection (⚠️ nếu > 0 lâu)
- agroal.max.used.count        → Peak connections
- agroal.acquire.count         → Tổng số lần lấy connection
- agroal.creation.time         → Thời gian tạo connection mới
```

### Dấu hiệu cần thay đổi pool size

| Dấu hiệu | Vấn đề | Fix |
| :--- | :--- | :--- |
| `awaiting.count` liên tục > 0 | Pool quá nhỏ | Tăng `max-size` |
| `active.count` luôn = `max-size` | Pool exhaustion | Tăng `max-size` hoặc giảm query time |
| `idle.count` luôn > 50% max | Pool quá lớn | Giảm `max-size` |
| `creation.time` cao | Connection tạo lâu | Check network, DB health |
| Leak detection warnings | Connection leak | Fix code (try-with-resources) |

---

## Hibernate / JPA Optimization

### 1. N+1 Query Problem (Phổ biến nhất)

```java
// ❌ N+1 PROBLEM: 1 query User + N queries Orders
List<User> users = User.listAll();  // SELECT * FROM users (1 query)
for (User u : users) {
    System.out.println(u.orders.size());  // SELECT * FROM orders WHERE user_id=? (N queries)
}
// Tổng: 1 + N queries (nếu 100 users → 101 queries!)

// ✅ FIX 1: JOIN FETCH (Eager loading khi cần)
List<User> users = User.find("FROM User u LEFT JOIN FETCH u.orders").list();
// 1 query duy nhất!

// ✅ FIX 2: @EntityGraph
@EntityGraph(attributePaths = {"orders", "profile"})
List<User> findAllWithOrders();

// ✅ FIX 3: @BatchSize (lazy batch loading)
@OneToMany(mappedBy = "user")
@BatchSize(size = 25)  // Load 25 collections cùng lúc
public List<Order> orders;
```

### 2. Batch Operations

```properties
# application.properties — QUAN TRỌNG cho performance
quarkus.hibernate-orm.jdbc.statement-batch-size=50    # Batch 50 statements
quarkus.hibernate-orm.order-inserts=true               # Nhóm INSERT theo entity
quarkus.hibernate-orm.order-updates=true               # Nhóm UPDATE theo entity
quarkus.hibernate-orm.fetch-size=100                   # JDBC fetch size
```

```java
// Batch insert (quan trọng cho bulk operations)
@Transactional
public void importProducts(List<ProductDTO> dtos) {
    int batchSize = 50;
    for (int i = 0; i < dtos.size(); i++) {
        Product p = dtos.get(i).toEntity();
        productRepo.persist(p);

        if (i > 0 && i % batchSize == 0) {
            productRepo.flush();   // Force flush batch
            productRepo.getEntityManager().clear();  // Clear persistence context (free memory)
        }
    }
}
```

### 3. Projection (Select only needed columns)

```java
// ❌ Load toàn bộ entity (20 columns) khi chỉ cần 2
List<Product> products = Product.listAll();

// ✅ Projection: chỉ SELECT name, price
public record ProductSummary(String name, BigDecimal price) {}

List<ProductSummary> summaries = Product.findAll()
    .project(ProductSummary.class)
    .list();
// SQL: SELECT p.name, p.price FROM products p
```

### 4. Indexing Strategy

```java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),           // FK lookup
    @Index(name = "idx_order_status", columnList = "status"),          // Filter
    @Index(name = "idx_order_date", columnList = "created_at DESC"),   // Sort
    @Index(name = "idx_order_user_status", columnList = "user_id, status")  // Composite
})
public class Order extends PanacheEntity {
    // ...
}
```

### 5. Second-Level Cache

```properties
# Bật Hibernate L2 cache
quarkus.hibernate-orm.cache."com.example.Product".expiration.max-idle=PT1H
quarkus.hibernate-orm.cache."com.example.Category".expiration.max-idle=PT6H
```

```java
@Entity
@Cacheable  // Bật L2 cache cho entity này
public class Category extends PanacheEntity {
    public String name;
    // Categories ít thay đổi → cache hiệu quả
}
```

### 6. SQL Logging (Debug)

```properties
# Development: bật SQL logging để phát hiện N+1
%dev.quarkus.hibernate-orm.log.sql=true
%dev.quarkus.hibernate-orm.log.bind-parameters=true
%dev.quarkus.hibernate-orm.log.format-sql=true

# Statistics (đếm queries)
%dev.quarkus.hibernate-orm.statistics=true
# Xem tại: /q/metrics → hibernate.queries.executed
```

---

## HTTP & REST Optimization

### 1. JSON Serialization

```properties
# Jackson optimization
quarkus.jackson.fail-on-unknown-properties=false
quarkus.jackson.write-dates-as-timestamps=false

# Nếu dùng JSON-B: Quarkus dùng qute serializer nhanh hơn Jackson mặc định
```

```java
// ✅ Dùng record thay class (serialization nhanh hơn)
public record ProductDTO(Long id, String name, BigDecimal price) {}

// ✅ @JsonView: Trả field khác nhau theo endpoint
public class Views {
    public static class Summary {}
    public static class Detail extends Summary {}
}

@Entity
public class Product {
    @JsonView(Views.Summary.class)
    public String name;

    @JsonView(Views.Summary.class)
    public BigDecimal price;

    @JsonView(Views.Detail.class)
    public String description;  // Chỉ include trong Detail view

    @JsonView(Views.Detail.class)
    public List<Review> reviews;  // Chỉ include trong Detail view
}

@GET
@JsonView(Views.Summary.class)  // Trả name, price only
public List<Product> listAll() { ... }

@GET @Path("/{id}")
@JsonView(Views.Detail.class)  // Trả tất cả
public Product getById(@PathParam("id") Long id) { ... }
```

### 2. Compression

```properties
# Bật HTTP compression
quarkus.http.enable-compression=true
quarkus.http.compress-media-types=application/json,text/html,text/plain,text/xml
# Giảm 50-80% response size cho JSON
```

### 3. HTTP/2

```properties
# HTTP/2 (mặc định trong Quarkus)
quarkus.http.http2=true
# HTTP/2: multiplexing, header compression, server push
# Giảm latency đáng kể cho nhiều concurrent requests
```

### 4. Pagination & Limit

```java
// ✅ LUÔN pagination — không bao giờ trả ALL records
@GET
public PageResponse<Product> list(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size) {
    // ...
}

// ✅ Keyset pagination cho dataset lớn (tốt hơn OFFSET)
@GET @Path("/after/{afterId}")
public List<Product> listAfter(@PathParam("afterId") Long afterId, 
                                @QueryParam("size") @DefaultValue("20") int size) {
    return Product.find("id > ?1", Sort.by("id"), afterId)
        .page(Page.ofSize(size)).list();
}
```

---

## Caching Strategy tổng hợp

### Multi-layer Caching

```
Request → [HTTP Cache] → [Application Cache] → [L2 Cache] → [DB]
             ↑                   ↑                  ↑
        ETag/304            Caffeine/Redis       Hibernate L2
     (client-side)        (server-side)        (entity-level)
```

### Layer 1: HTTP Cache Headers

```java
@GET
@Path("/{id}")
public Response getProduct(@PathParam("id") Long id,
                            @Context Request request) {
    Product product = Product.findById(id);
    
    // ETag based on last update
    EntityTag etag = new EntityTag(
        String.valueOf(product.updatedAt.hashCode()));
    
    // 304 Not Modified nếu client đã có version mới nhất
    Response.ResponseBuilder builder = request.evaluatePreconditions(etag);
    if (builder != null) return builder.build();  // 304!
    
    return Response.ok(product)
        .tag(etag)
        .cacheControl(CacheControl.valueOf("max-age=300"))  // Cache 5 phút
        .build();
}
```

### Layer 2: Application Cache (Quarkus Cache)

```java
@ApplicationScoped
public class ProductService {

    @Inject
    ProductRepository productRepo;

    // ===== Cache GET =====
    @CacheResult(cacheName = "products")
    public Product getById(Long id) {
        return productRepo.findById(id);  // Chỉ gọi DB nếu cache miss
    }

    // ===== Invalidate khi UPDATE =====
    @CacheInvalidate(cacheName = "products")
    @Transactional
    public Product update(Long id, ProductUpdateDTO dto) {
        Product p = productRepo.findById(id);
        p.name = dto.name();
        p.price = dto.price();
        return p;
    }

    // ===== Invalidate ALL =====
    @CacheInvalidateAll(cacheName = "products")
    public void clearCache() {
        // Cache cleared
    }

    // ===== Cache Key custom =====
    @CacheResult(cacheName = "product-search")
    @CacheKey  // chỉ dùng keyword + category làm key (bỏ qua pagination params)
    public List<Product> search(@CacheKey String keyword, @CacheKey String category,
                                 int page, int size) {
        return productRepo.search(keyword, category, page, size);
    }
}
```

```properties
# Cache configuration
quarkus.cache.caffeine."products".maximum-size=1000
quarkus.cache.caffeine."products".expire-after-write=PT5M
quarkus.cache.caffeine."product-search".maximum-size=500
quarkus.cache.caffeine."product-search".expire-after-write=PT2M
```

---

## Reactive vs Blocking Performance

### Khi nào Reactive nhanh hơn?

```
Scenario A: 10 concurrent users, simple CRUD
→ Blocking ≈ Reactive (không khác biệt)
→ Dùng Blocking (đơn giản hơn)

Scenario B: 1000 concurrent users, I/O-heavy (multiple DB + API calls)
→ Reactive > Blocking 3-5x throughput
→ Dùng Reactive hoặc Virtual Threads

Scenario C: 10,000 concurrent connections, streaming
→ Reactive >> Blocking (Blocking không thể xử lý)
→ Dùng Reactive (Non-blocking mandatory)
```

### Request Scoping Cost

```java
// ===== Blocking: 1 request = 1 worker thread =====
// Cost: Thread stack (~512KB-1MB), context switch
// Max: worker-pool-size (200 default)

// ===== Reactive: 1 request = event trên event loop =====
// Cost: Continuation state (~KB), no context switch
// Max: chỉ giới hạn bởi memory

// ===== Virtual Thread: 1 request = 1 VT =====
// Cost: VT stack (~KB), mount/unmount (~μs)
// Max: chỉ giới hạn bởi memory + connection pool
```

---

## Profiling & Diagnostics

### 1. async-profiler (Flame Graph)

```bash
# Cài đặt
wget https://github.com/async-profiler/async-profiler/releases/download/v3.0/async-profiler-3.0-linux-x64.tar.gz
tar xf async-profiler-*.tar.gz

# Profile CPU (30 giây)
./asprof -d 30 -f flamegraph.html <PID>

# Profile Allocations (memory)
./asprof -d 30 -e alloc -f alloc-flamegraph.html <PID>

# Profile Wall Clock (tìm blocking/waiting)
./asprof -d 30 -e wall -f wall-flamegraph.html <PID>

# Profile Lock Contention
./asprof -d 30 -e lock -f lock-flamegraph.html <PID>
```

### Đọc Flame Graph

```
Chiều rộng = % thời gian CPU
Chiều cao = depth của stack trace

Tìm kiếm:
1. "Wide tower" → method chiếm nhiều CPU → tối ưu
2. "Wide plateau" → method gọi nhiều method khác → xem có N+1 không
3. "GC frames" rộng → GC quá nhiều → tune GC hoặc giảm allocations
```

### 2. JFR (Java Flight Recorder)

```properties
# Bật JFR khi chạy
-XX:StartFlightRecording=duration=60s,filename=recording.jfr

# Hoặc attach runtime
jcmd <PID> JFR.start duration=60s filename=recording.jfr

# Phân tích:
# Tool: JDK Mission Control (JMC), IntelliJ IDEA
```

### 3. Heap Dump (Memory leak)

```bash
# Tạo heap dump
jcmd <PID> GC.heap_dump /tmp/heapdump.hprof

# Auto dump khi OOM
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heapdump.hprof

# Phân tích:
# Tool: Eclipse MAT, VisualVM, IntelliJ Profiler
```

### 4. Thread Dump

```bash
# Thread dump (tìm deadlock, contention)
jcmd <PID> Thread.print

# Hoặc
kill -3 <PID>  # Gửi signal SIGQUIT → thread dump to stderr
```

---

## Load Testing & Benchmarking

### Tool phổ biến

| Tool | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- |
| **wrk** | Nhanh, nhẹ, scripting Lua | Chỉ HTTP, ít report |
| **hey** | Đơn giản, Go-based | Ít tính năng |
| **vegeta** | Rate-based, Go-based | CLI only |
| **k6** | JavaScript scripting, dashboard | Cần Grafana cho report |
| **Gatling** | Scenario phức tạp, Scala/Java | Heavy, learning curve |
| **JMeter** | GUI, protocol support rộng | Chậm, resource-heavy |

### wrk (Khuyến nghị cho quick bench)

```bash
# Basic: 4 threads, 100 connections, 30 seconds
wrk -t4 -c100 -d30s http://localhost:8080/api/products

# Với latency distribution
wrk -t4 -c100 -d30s --latency http://localhost:8080/api/products

# Output:
# Latency     Avg      Stdev    Max    +/- Stdev
#             5.2ms    2.1ms   45ms    95%
# Req/Sec     4.8k     500     6.2k    90%
# 576000 requests in 30s, 125MB read
# Requests/sec: 19200
# Transfer/sec: 4.2MB
```

### k6 (Script phức tạp hơn)

```javascript
// k6-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // Ramp up
        { duration: '1m', target: 200 },     // Peak load
        { duration: '30s', target: 0 },      // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200', 'p(99)<500'],  // SLA
        http_req_failed: ['rate<0.01'],                   // Error rate < 1%
    },
};

export default function () {
    // GET
    let res = http.get('http://localhost:8080/api/products?page=0&size=20');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(0.1);  // Think time

    // POST
    let payload = JSON.stringify({ name: 'Product', price: 29.99 });
    res = http.post('http://localhost:8080/api/products', payload, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'created': (r) => r.status === 201 });

    sleep(0.5);
}
```

```bash
# Chạy
k6 run k6-test.js

# Với Grafana dashboard
k6 run --out influxdb=http://localhost:8086/k6 k6-test.js
```

### Benchmark checklist

```
1. ✅ Test trên environment giống production (container, DB thật)
2. ✅ Warmup trước khi đo (JIT cần 1-2 phút)
3. ✅ Đo nhiều lần, lấy average (3-5 runs)
4. ✅ Đo cả p50, p95, p99 (không chỉ average)
5. ✅ Theo dõi resource usage (CPU, memory, connection pool)
6. ✅ Test với realistic data volume (không phải empty DB)
7. ✅ Baseline → Change → Retest → Compare
```

---

## Production Monitoring

### Metrics quan trọng cần monitor

```properties
# Bật SmallRye Metrics
quarkus.smallrye-metrics.enabled=true
# Hoặc Micrometer
# quarkus.micrometer.enabled=true
```

#### Application Metrics

| Metric | Alert khi | Ý nghĩa |
| :--- | :--- | :--- |
| `http_request_duration_p99` | > SLA (200ms) | APIs chậm |
| `http_requests_total{status="5xx"}` | > 1% of total | Server errors |
| `http_server_active_requests` | > worker_pool_size × 80% | Sắp hết threads |

#### JVM Metrics

| Metric | Alert khi | Ý nghĩa |
| :--- | :--- | :--- |
| `jvm_memory_used_bytes{area="heap"}` | > 85% max | Sắp OOM |
| `jvm_gc_pause_seconds_max` | > 500ms | GC pause dài |
| `jvm_gc_pause_seconds_count` | Tăng đột biến | GC thrashing |
| `jvm_threads_live` | > 500 | Thread leak |

#### Database Metrics

| Metric | Alert khi | Ý nghĩa |
| :--- | :--- | :--- |
| `agroal_active_count` | = max_size liên tục | Pool exhaustion |
| `agroal_awaiting_count` | > 0 liên tục | Threads chờ connection |
| `hibernate_queries_executed` | Số lượng quá cao | N+1 problem |

### Prometheus + Grafana Stack

```properties
# Quarkus expose metrics tại /q/metrics (Prometheus format)
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.export.prometheus.path=/q/metrics
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'quarkus-app'
    metrics_path: '/q/metrics'
    static_configs:
      - targets: ['quarkus-app:8080']
```

---

## Container & Kubernetes Tuning

### Resource Requests/Limits

```properties
# JVM mode
quarkus.kubernetes.resources.requests.cpu=200m
quarkus.kubernetes.resources.requests.memory=256Mi
quarkus.kubernetes.resources.limits.cpu=1000m
quarkus.kubernetes.resources.limits.memory=512Mi
# Rule: limits.memory >= Xmx + Metaspace + Overhead (buffer 20%)

# Native mode
quarkus.kubernetes.resources.requests.cpu=100m
quarkus.kubernetes.resources.requests.memory=64Mi
quarkus.kubernetes.resources.limits.cpu=500m
quarkus.kubernetes.resources.limits.memory=128Mi
```

### JVM trong Container

```properties
# QUAN TRỌNG: JVM cần nhìn thấy container limits
-XX:+UseContainerSupport           # Mặc định ON
-XX:MaxRAMPercentage=75.0          # 75% container memory
# Nếu limit=512Mi → Max heap ~384Mi
# Còn lại ~128Mi cho: Metaspace + Thread stacks + Native memory + Code cache
```

### Startup Probe cho JVM

```properties
# JVM startup chậm hơn native → probe phải chờ lâu hơn
quarkus.kubernetes.startup-probe.initial-delay-seconds=5
quarkus.kubernetes.startup-probe.period-seconds=2
quarkus.kubernetes.startup-probe.failure-threshold=30
# → Chờ tối đa 5 + (2 × 30) = 65 giây

# Native startup nhanh → probe ngắn hơn
# quarkus.kubernetes.startup-probe.initial-delay-seconds=0
# quarkus.kubernetes.startup-probe.failure-threshold=5
```

---

## Checklist Production-Ready

### Performance

- [ ] **JVM tuning**: MaxRAMPercentage, GC chọn phù hợp
- [ ] **Connection Pool**: Sizing theo throughput × latency
- [ ] **Hibernate**: Batch operations, fetch size, N+1 fixed
- [ ] **Indexing**: Tất cả FK, filter columns, sort columns có index
- [ ] **Caching**: L2 cache (Hibernate), Application cache (Caffeine), HTTP cache headers
- [ ] **Compression**: HTTP compression bật
- [ ] **Pagination**: Tất cả list endpoints có pagination

### Monitoring

- [ ] **Metrics**: Prometheus endpoint expose
- [ ] **Logging**: Structured logging (JSON), correlation ID
- [ ] **Health checks**: Liveness, Readiness, Startup probes
- [ ] **Tracing**: OpenTelemetry distributed tracing
- [ ] **Alerting**: Alerts cho p99 latency, error rate, OOM

### Testing

- [ ] **Load test**: Baseline measured, SLA validated
- [ ] **Stress test**: System behavior under overload documented
- [ ] **Soak test**: Memory leak check (24h run)

### Operations

- [ ] **GC logging**: Enabled, rotated
- [ ] **Heap dump on OOM**: Enabled
- [ ] **Circuit breaker**: External dependencies có fault tolerance
- [ ] **Rate limiting**: Public APIs có rate limit
- [ ] **Graceful shutdown**: `quarkus.shutdown.timeout=30s`

---

## Câu hỏi thường gặp

**Q1: Quarkus có cần JVM tuning không?**
Quarkus build-time optimization giảm nhiều overhead, nhưng JVM tuning vẫn cần: heap sizing, GC choice, connection pool. Native image thì hầu như không cần JVM tuning.

**Q2: Connection pool nên set bao nhiêu?**
Bắt đầu với `(CPU cores × 2) + 1`. Monitor `awaiting.count` — nếu > 0 lâu thì tăng. Tối đa ~50 cho microservice (DB cũng có giới hạn connections).

**Q3: G1GC hay ZGC?**
G1 cho hầu hết usecase. ZGC khi p99 latency yêu cầu < 10ms (payment API, real-time trading). ZGC tốn thêm ~10% CPU.

**Q4: Làm sao biết có N+1 query?**
Bật `quarkus.hibernate-orm.log.sql=true` + `quarkus.hibernate-orm.statistics=true` trong dev. Hoặc dùng Hibernate Statistics metrics trong Prometheus.

**Q5: Load test kết quả ổn trên local nhưng chậm trên production?**
Kiểm tra: (1) Network latency giữa app ↔ DB, (2) Container CPU/memory limits, (3) Noisy neighbors trên K8s, (4) DB shared với team khác, (5) SSL/TLS overhead.

---

## Tổng kết

- **Đo trước, tối ưu sau**: Flame graph + load test để tìm bottleneck
- **JVM**: MaxRAMPercentage=75, G1GC (default), ZGC (low latency)
- **Connection Pool**: `CPU × 2 + 1`, monitor awaiting count
- **Hibernate**: Batch size=50, order inserts/updates, fix N+1
- **HTTP**: Compression, pagination, caching headers
- **Caching**: Multi-layer (HTTP → App → L2 → DB)
- **Profiling**: async-profiler (flame graph), JFR, heap dump
- **Load Test**: wrk (quick) hoặc k6 (complex scenarios)
- **Monitor**: Prometheus + Grafana, GC logging, heap dump on OOM
