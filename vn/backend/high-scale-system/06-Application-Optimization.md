# Application Optimization — JVM, Thread Pool, Non-Blocking

## Mục lục
1. [Thread Pool Sizing](#thread-pool-sizing)
2. [Non-Blocking I/O](#non-blocking-io)
3. [JVM Tuning](#jvm-tuning)
4. [Object Pooling & Reuse](#object-pooling--reuse)
5. [Serialization Performance](#serialization-performance)
6. [Virtual Threads (Java 21+)](#virtual-threads-java-21)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Thread Pool Sizing

### Tính toán thread pool

```
CPU-bound tasks (tính toán, serialization):
  Threads = CPU cores + 1
  Ví dụ: 8 cores → 9 threads

I/O-bound tasks (DB query, HTTP call, file I/O):
  Threads = CPU cores × (1 + wait_time / compute_time)
  Ví dụ: 8 cores, 50ms wait, 5ms compute → 8 × (1 + 50/5) = 88 threads

Mixed:
  Tách thành 2 pools: CPU pool + I/O pool
```

### Spring Boot thread pool config

```yaml
server:
  tomcat:
    threads:
      max: 200          # Max worker threads
      min-spare: 50     # Min idle threads
    max-connections: 10000
    accept-count: 1000  # Queue khi threads hết

# Custom async executor
spring:
  task:
    execution:
      pool:
        core-size: 20
        max-size: 100
        queue-capacity: 500
```

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("ioExecutor")
    public Executor ioExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(50);
        executor.setMaxPoolSize(200);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("io-");
        executor.setRejectedExecutionHandler(new CallerRunsPolicy());
        return executor;
    }

    @Bean("cpuExecutor")
    public Executor cpuExecutor() {
        int cores = Runtime.getRuntime().availableProcessors();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(cores);
        executor.setMaxPoolSize(cores + 1);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("cpu-");
        return executor;
    }
}

@Service
public class ReportService {
    @Async("ioExecutor")
    public CompletableFuture<Report> generateReport(Long userId) {
        // I/O heavy: nhiều DB queries
        return CompletableFuture.completedFuture(buildReport(userId));
    }
}
```

---

## Non-Blocking I/O

### WebFlux (Reactive) cho high concurrency

```java
// Spring WebFlux: non-blocking, event-loop
// 1 thread xử lý hàng nghìn connections (không block chờ I/O)

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/{id}")
    public Mono<Product> getProduct(@PathVariable Long id) {
        return cache.get(id)                    // Redis (non-blocking)
            .switchIfEmpty(
                productRepository.findById(id)  // R2DBC (non-blocking DB)
                    .flatMap(product ->
                        cache.set(id, product)  // Cache populate
                            .thenReturn(product)
                    )
            );
    }

    @GetMapping
    public Flux<Product> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return productRepository.findAll(PageRequest.of(page, size));
    }
}
```

### Khi nào WebFlux vs Spring MVC?

| Tiêu chí | Spring MVC (blocking) | WebFlux (non-blocking) |
|----------|----------------------|----------------------|
| **Thread model** | 1 thread per request | Event loop (ít threads) |
| **Concurrent connections** | ~200-500 (thread limit) | **10K-100K+** |
| **CPU overhead per request** | Cao (thread context switch) | Thấp |
| **Code complexity** | Đơn giản (imperative) | Phức tạp (reactive) |
| **Debugging** | Dễ (stack trace rõ) | Khó (async stack) |
| **Use case** | CRUD, business logic | Gateway, proxy, high IO |

---

## JVM Tuning

### Garbage Collection cho low-latency

```bash
# ZGC (Java 15+) — tốt nhất cho low-latency, high-scale
java -XX:+UseZGC \
     -XX:MaxRAMPercentage=75.0 \
     -XX:+ZGenerational \
     -Xms4g -Xmx4g \
     -jar app.jar

# G1GC — default, tốt cho general purpose
java -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=100 \
     -XX:G1HeapRegionSize=16m \
     -Xms4g -Xmx4g \
     -jar app.jar
```

### JVM flags quan trọng

```bash
# Memory
-Xms4g -Xmx4g              # Min = Max → tránh resize
-XX:MaxRAMPercentage=75.0   # Dùng trong container (K8s)
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# GC Logging (production)
-Xlog:gc*:file=/var/log/gc.log:time,uptime:filecount=5,filesize=10m

# Thread
-XX:+UseThreadPriorities
-XX:ThreadStackSize=256k    # Giảm stack size → fit nhiều threads hơn

# Container awareness
-XX:+UseContainerSupport    # Default on từ Java 10+
-XX:ActiveProcessorCount=4  # Override nếu cần
```

---

## Object Pooling & Reuse

### Connection Pooling (đã cover ở bài Database)

### Object Reuse — giảm GC pressure

```java
// ❌ Tạo object mới mỗi request → GC pressure
public byte[] serialize(Object obj) {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectMapper mapper = new ObjectMapper();  // Tạo mới mỗi lần!
    mapper.writeValue(baos, obj);
    return baos.toByteArray();
}

// ✅ Reuse expensive objects
private static final ObjectMapper MAPPER = new ObjectMapper();

public byte[] serialize(Object obj) {
    return MAPPER.writeValueAsBytes(obj);  // Thread-safe, reuse
}

// ✅ ThreadLocal cho non-thread-safe objects
private static final ThreadLocal<SimpleDateFormat> DATE_FORMAT =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
```

---

## Serialization Performance

| Format | Speed | Size | Human-readable |
|--------|-------|------|---------------|
| **Protobuf** | ⚡ Rất nhanh | Nhỏ nhất | ❌ |
| **Avro** | ⚡ Nhanh | Nhỏ | ❌ |
| **MessagePack** | ⚡ Nhanh | Nhỏ | ❌ |
| **Jackson JSON** | 🔵 Trung bình | Trung bình | ✅ |
| **Gson** | 🔴 Chậm | Trung bình | ✅ |
| **Java Serialization** | 🔴 Rất chậm | Lớn | ❌ |

```java
// Protobuf: 5-10x nhanh hơn JSON, 3-5x nhỏ hơn
// Dùng cho service-to-service (gRPC)

// Jackson optimize
ObjectMapper mapper = new ObjectMapper();
mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, true);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // Bỏ null fields
mapper.registerModule(new AfterburnerModule()); // Bytecode generation → 20% faster
```

---

## Virtual Threads (Java 21+)

### Game changer cho I/O-bound applications

```java
// Trước: 200 platform threads → 200 concurrent requests
// Sau: 1,000,000 virtual threads → 1,000,000 concurrent requests

// Spring Boot 3.2+ — bật virtual threads
spring:
  threads:
    virtual:
      enabled: true

// Tomcat sẽ tạo virtual thread cho mỗi request
// Không cần WebFlux — code vẫn viết imperative (blocking style)
// Nhưng virtual thread tự yield khi waiting I/O → không block OS thread
```

```java
// Manual virtual threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Product>> futures = productIds.stream()
        .map(id -> executor.submit(() -> fetchProduct(id)))  // Virtual thread
        .toList();

    List<Product> products = futures.stream()
        .map(f -> f.get())  // Blocking call OK — virtual thread tự yield
        .toList();
}
```

### Virtual Threads vs WebFlux

| | Virtual Threads | WebFlux |
|---|----------------|---------|
| **Code style** | Imperative (blocking) | Reactive (Mono/Flux) |
| **Learning curve** | Thấp (như code bình thường) | Cao (reactive programming) |
| **Debugging** | Stack trace bình thường | Async stack trace khó |
| **Libraries** | Tất cả blocking libraries | Cần reactive drivers (R2DBC) |
| **Performance** | Rất tốt cho I/O-bound | Tốt hơn cho CPU-bound reactive |

---

## Câu Hỏi Phỏng Vấn

### Thread pool sizing tính thế nào?
> CPU-bound: `cores + 1`. I/O-bound: `cores × (1 + wait/compute)`. Tách CPU pool và I/O pool. Benchmark thực tế để fine-tune.

### Virtual Threads có thay thế WebFlux không?
> Cho I/O-bound apps: **gần như có**. Virtual threads cho phép viết code blocking nhưng không block OS thread. WebFlux vẫn tốt hơn cho streaming, backpressure, và CPU-bound reactive. Nhưng hầu hết web apps → virtual threads đủ.

### ZGC vs G1GC?
> **G1GC**: general purpose, pause ~100-200ms. **ZGC**: sub-millisecond pauses, tốt cho latency-sensitive (< 10ms p99 target). ZGC tốn thêm ~15% CPU. Ở high-scale cho user-facing API → ZGC.

---

**Tiếp theo:** [07-Infrastructure-Autoscaling.md](./07-Infrastructure-Autoscaling.md)
