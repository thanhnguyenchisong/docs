# Rate Limiting & Protection — Bảo Vệ Hệ Thống

## Mục lục
1. [Rate Limiting](#rate-limiting)
2. [Circuit Breaker](#circuit-breaker)
3. [Bulkhead Pattern](#bulkhead-pattern)
4. [Graceful Degradation](#graceful-degradation)
5. [DDoS Protection](#ddos-protection)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Rate Limiting

### Tại sao cần?

```
Không rate limit:
  1 user gửi 100K requests/s → DB overload → tất cả users ảnh hưởng

Có rate limit:
  User bình thường: 100 req/s → OK
  User spam: > 100 req/s → 429 Too Many Requests → bảo vệ hệ thống
```

### Thuật toán Rate Limiting

**1. Token Bucket** (phổ biến nhất)
```
- Bucket chứa tokens (max capacity)
- Tokens bổ sung đều đặn (rate)
- Mỗi request tiêu 1 token
- Hết token → reject

Ví dụ: capacity=100, rate=10 tokens/s
  - Burst: 100 requests ngay lập tức
  - Sustained: 10 requests/s
  - Sau burst: phải đợi tokens refill
```

**2. Sliding Window Log**
```
- Lưu timestamp mỗi request
- Đếm trong window (ví dụ 60s)
- Quá limit → reject

Pro: Chính xác
Con: Tốn memory (lưu tất cả timestamps)
```

**3. Sliding Window Counter**
```
- Chia window thành sub-windows
- Đếm trong mỗi sub-window
- Kết hợp: accurate + memory-efficient
```

### Redis Rate Limiting Implementation

```java
@Component
public class RateLimiter {
    @Autowired
    private StringRedisTemplate redis;

    // Sliding Window Counter
    public boolean isAllowed(String key, int limit, Duration window) {
        String redisKey = "rate:" + key;
        long now = System.currentTimeMillis();
        long windowMs = window.toMillis();

        // Lua script: atomic check + increment
        String luaScript = """
            local key = KEYS[1]
            local window = tonumber(ARGV[1])
            local limit = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            
            -- Remove expired entries
            redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
            
            -- Count current window
            local count = redis.call('ZCARD', key)
            
            if count < limit then
                redis.call('ZADD', key, now, now .. ':' .. math.random())
                redis.call('EXPIRE', key, math.ceil(window / 1000))
                return 1
            end
            return 0
        """;

        Long result = redis.execute(
            new DefaultRedisScript<>(luaScript, Long.class),
            List.of(redisKey),
            String.valueOf(windowMs),
            String.valueOf(limit),
            String.valueOf(now)
        );

        return result != null && result == 1;
    }
}

// Usage
@RestController
public class ApiController {
    @Autowired
    private RateLimiter rateLimiter;

    @GetMapping("/api/products")
    public ResponseEntity<?> getProducts(@RequestHeader("X-User-Id") String userId) {
        if (!rateLimiter.isAllowed("user:" + userId, 100, Duration.ofMinutes(1))) {
            return ResponseEntity.status(429)
                .header("Retry-After", "60")
                .body("Rate limit exceeded. Try again later.");
        }
        return ResponseEntity.ok(productService.findAll());
    }
}
```

### Rate Limit tại nhiều tầng

```
1. CDN/WAF: Global rate limit (IP-based, 10K req/s)
2. API Gateway: Per-user rate limit (100 req/s)
3. Service: Per-endpoint rate limit (50 req/s cho expensive endpoints)
4. Database: Connection pool limit (implicit rate limit)
```

---

## Circuit Breaker

### Pattern

```
┌────────┐     ┌────────────┐     ┌──────────┐
│ CLOSED │────→│ OPEN       │────→│ HALF-OPEN│
│(normal)│     │(reject all)│     │(test few)│
└────────┘     └────────────┘     └──────────┘
     ↑              │                   │
     │    timeout    │    success        │
     └───────────────┤    ↓             │
                     │  → CLOSED ←──────┘
                     │    fail
                     │    ↓
                     └─→ OPEN (lại)
```

### Resilience4j Implementation

```java
@Configuration
public class CircuitBreakerConfig {
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50)           // 50% failures → OPEN
            .slowCallRateThreshold(80)          // 80% slow calls → OPEN
            .slowCallDurationThreshold(Duration.ofSeconds(2))
            .waitDurationInOpenState(Duration.ofSeconds(30))  // OPEN → HALF-OPEN sau 30s
            .slidingWindowSize(100)             // 100 requests window
            .minimumNumberOfCalls(20)           // Min calls trước khi evaluate
            .permittedNumberOfCallsInHalfOpenState(5) // 5 test calls
            .build();

        return CircuitBreakerRegistry.of(config);
    }
}

@Service
public class PaymentService {
    private final CircuitBreaker circuitBreaker;
    private final PaymentClient paymentClient;

    public PaymentResponse charge(PaymentRequest request) {
        return CircuitBreaker.decorateSupplier(circuitBreaker,
            () -> paymentClient.charge(request)
        ).recover(throwable -> {
            // Fallback khi circuit OPEN
            log.warn("Payment service unavailable, queuing for retry");
            paymentQueue.enqueue(request);  // Gửi vào queue, retry sau
            return PaymentResponse.pending();
        }).get();
    }
}
```

---

## Bulkhead Pattern

### Isolate failures

```
Không bulkhead:
  Thread pool chung (200 threads)
  Payment API chậm → chiếm hết 200 threads → Order API cũng chết

Có bulkhead:
  Order API pool: 100 threads
  Payment API pool: 50 threads
  Search API pool: 50 threads
  Payment chậm → chỉ ảnh hưởng 50 threads Payment → Order vẫn OK
```

```java
@Service
public class OrderService {
    // Mỗi external call có bulkhead riêng
    @Bulkhead(name = "paymentService", fallbackMethod = "paymentFallback",
              type = Bulkhead.Type.THREADPOOL)
    public PaymentResponse processPayment(PaymentRequest request) {
        return paymentClient.charge(request);
    }

    private PaymentResponse paymentFallback(PaymentRequest request, Throwable t) {
        return PaymentResponse.queued("Payment service busy, will process later");
    }
}
```

```yaml
# application.yml
resilience4j:
  bulkhead:
    instances:
      paymentService:
        maxConcurrentCalls: 50       # Max 50 concurrent calls
        maxWaitDuration: 500ms       # Đợi tối đa 500ms
  thread-pool-bulkhead:
    instances:
      paymentService:
        maxThreadPoolSize: 50
        coreThreadPoolSize: 25
        queueCapacity: 100
```

---

## Graceful Degradation

### Tắt features khi overload

```java
@Service
public class ProductService {
    @Autowired
    private FeatureFlagService featureFlags;

    public ProductResponse getProduct(Long id) {
        Product product = productRepo.findById(id);
        ProductResponse response = new ProductResponse(product);

        // Feature flag: tắt recommendations khi overload
        if (featureFlags.isEnabled("product.recommendations")) {
            response.setRecommendations(recommendationService.get(id));
        }

        // Feature flag: tắt real-time reviews count
        if (featureFlags.isEnabled("product.reviewCount")) {
            response.setReviewCount(reviewService.count(id));
        } else {
            response.setReviewCount(product.getCachedReviewCount()); // Cached value
        }

        return response;
    }
}

// Auto-degrade khi system overloaded
@Scheduled(fixedRate = 10_000)
public void checkSystemHealth() {
    double cpuUsage = systemMetrics.getCpuUsage();
    if (cpuUsage > 0.85) {
        featureFlags.disable("product.recommendations");
        featureFlags.disable("product.reviewCount");
        log.warn("High CPU ({}%) — disabled non-essential features", cpuUsage * 100);
    } else if (cpuUsage < 0.60) {
        featureFlags.enable("product.recommendations");
        featureFlags.enable("product.reviewCount");
    }
}
```

---

## DDoS Protection

### Multi-layer defense

```
Layer 1: ISP/CDN (Cloudflare, AWS Shield)
  - Absorb volumetric attacks (>100 Gbps)
  - Geo-blocking
  - Bot detection (CAPTCHA, JS challenge)

Layer 2: WAF (Web Application Firewall)
  - SQL injection, XSS blocking
  - Rate limiting (IP-based)
  - Request size limits

Layer 3: API Gateway
  - Per-user rate limiting
  - JWT validation → reject unauthenticated
  - Request validation (schema check)

Layer 4: Application
  - Circuit breaker
  - Bulkhead
  - Graceful degradation
```

---

## Câu Hỏi Phỏng Vấn

### Rate limit ở đâu?
> Multi-layer: (1) CDN/WAF global, (2) Gateway per-user, (3) Service per-endpoint. Dùng Redis cho distributed rate limiting (tất cả pods share counter).

### Circuit breaker vs retry?
> **Retry**: thử lại khi fail (transient error). **Circuit breaker**: NGỪNG thử khi fail rate cao (service chết). Kết hợp: retry 2-3 lần → fail → circuit open → fallback.

### Graceful degradation ví dụ thực tế?
> Flash sale: tắt recommendations, search suggestions, real-time analytics. Chỉ giữ core: browse → add cart → checkout → payment. Giảm 60% load nhưng user vẫn mua hàng được.

---

**Tiếp theo:** [09-Case-Studies.md](./09-Case-Studies.md)
