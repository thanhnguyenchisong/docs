# Advanced Topics - Từ Zero đến Master Quarkus

## Mục lục
1. [Security chi tiết (OIDC, JWT, RBAC)](#security-chi-tiết-oidc-jwt-rbac)
2. [Messaging chi tiết (Kafka, AMQP)](#messaging-chi-tiết-kafka-amqp)
3. [Fault Tolerance & Resilience](#fault-tolerance--resilience)
4. [Observability (Metrics, Health, Tracing)](#observability-metrics-health-tracing)
5. [Configuration nâng cao](#configuration-nâng-cao)
6. [Scheduler & Cron Jobs](#scheduler--cron-jobs)
7. [WebSocket](#websocket)
8. [gRPC](#grpc)
9. [GraphQL](#graphql)
10. [OpenAPI & Swagger](#openapi--swagger)
11. [Caching](#caching)
12. [LangChain4j & Panache Next (Jakarta Data)](#langchain4j--panache-next-jakarta-data)
13. [Writing Custom Extensions](#writing-custom-extensions)
14. [Deployment Strategies](#deployment-strategies)
15. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## ===== ENHANCEMENTS =====

### Mục bổ sung trước "Security chi tiết": Rate Limiting & Quota

```xml
<!-- Dependency -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rate-limiter</artifactId>
</dependency>
```

```java
@ApplicationScoped
@Path("/api")
public class RateLimitedResource {

    // ===== Rate Limit per endpoint =====
    @GET
    @Path("/public/search")
    @RateLimiter(value = 100)  // 100 requests
    public Response search(@QueryParam("q") String query) {
        return Response.ok("Results for: " + query).build();
    }

    // ===== Rate Limit with time window =====
    @GET
    @Path("/data")
    @RateLimiter(value = 1000, window = 1, windowUnit = ChronoUnit.MINUTES)
    // 1000 requests per minute
    public Response getData() {
        return Response.ok("Data").build();
    }

    // ===== Custom Rate Limit Key (per user, IP, API key...) =====
    @POST
    @Path("/submit")
    public Response submit(@Context SecurityContext context) {
        // Rate limit per user
        String userId = context.getUserPrincipal().getName();
        return submitWithRateLimit(userId);
    }

    private Response submitWithRateLimit(String userId) {
        // Would use RateLimitKeyProvider to track per user
        return Response.ok("Submitted").build();
    }
}

// ===== Advanced: Token Bucket Limiter =====
@ApplicationScoped
public class TokenBucketRateLimiter {
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();
    private final int capacity = 100;
    private final long refillRatePerSecond = 10;

    public boolean allowRequest(String userId) {
        TokenBucket bucket = buckets.computeIfAbsent(userId, 
            k -> new TokenBucket(capacity, refillRatePerSecond));
        return bucket.tryConsume();
    }

    private static class TokenBucket {
        private double tokens;
        private final double capacity;
        private final double refillRatePerSecond;
        private long lastRefillTime = System.currentTimeMillis();

        TokenBucket(int capacity, long refillRate) {
            this.tokens = capacity;
            this.capacity = capacity;
            this.refillRatePerSecond = refillRate;
        }

        synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefillTime;
            tokens = Math.min(capacity, tokens + (elapsed / 1000.0) * refillRatePerSecond);
            lastRefillTime = now;
        }
    }
}

// ===== API Quota (Usage tracking) =====
@ApplicationScoped
public class ApiQuotaService {

    @Inject
    DataSource dataSource;

    // Track API usage per user/plan
    public record UserQuota(String userId, String plan, int monthlyLimit, int used) {}

    public boolean checkQuota(String userId) {
        UserQuota quota = getQuota(userId);
        return quota.used < quota.monthlyLimit;
    }

    public void incrementUsage(String userId) {
        // Increment usage counter
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute(
                "UPDATE user_quotas SET used = used + 1 WHERE user_id = '" + userId + "'");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private UserQuota getQuota(String userId) {
        // Query từ database
        return new UserQuota(userId, "pro", 1000, 500);
    }
}
```

### Mục bổ sung sau "Security": Extended Security Examples

```java
// ===== Role-based Access with Dynamic Permissions =====
@ApplicationScoped
public class DynamicPermissionCheck {

    @Inject
    PermissionService permissionService;

    @Inject
    SecurityIdentity identity;

    // Check permission thay vì role cứng
    public boolean hasPermission(String resource, String action) {
        String userId = identity.getPrincipal().getName();
        return permissionService.hasPermission(userId, resource, action);
    }
}

@Path("/api/documents")
public class DocumentResource {

    @Inject
    DynamicPermissionCheck permCheck;

    @GET
    @Path("/{id}")
    public Document getDocument(@PathParam("id") Long id) {
        if (!permCheck.hasPermission("document:" + id, "read")) {
            throw new ForbiddenException("No read permission");
        }
        return documentService.findById(id);
    }

    @PUT
    @Path("/{id}")
    public Document updateDocument(@PathParam("id") Long id, DocumentUpdateDTO dto) {
        if (!permCheck.hasPermission("document:" + id, "write")) {
            throw new ForbiddenException("No write permission");
        }
        return documentService.update(id, dto);
    }
}

// ===== Attribute-based Access Control (ABAC) =====
@ApplicationScoped
public class AttributeBasedAccessControl {

    public boolean isAllowed(String action, Map<String, Object> attributes) {
        // Complex policy evaluation
        boolean isAdmin = (boolean) attributes.getOrDefault("isAdmin", false);
        String department = (String) attributes.get("department");
        LocalDateTime createdDate = (LocalDateTime) attributes.get("createdDate");
        int daysSinceCreation = ChronoUnit.DAYS.between(createdDate, LocalDateTime.now());

        return switch(action) {
            case "view" -> !isAdmin || department.equals("internal");
            case "edit" -> isAdmin && daysSinceCreation < 30;
            case "delete" -> isAdmin;
            default -> false;
        };
    }
}
```

### Mục bổ sung sau Observability: Enhanced Metrics Examples

```java
@ApplicationScoped
public class EnhancedMetricsExamples {

    @Inject
    MeterRegistry registry;

    // ===== Business Metrics (khác technical metrics) =====
    public void trackOrderMetrics(Order order) {
        // Revenue metric
        registry.gauge("orders.revenue.total",
            Tags.of("currency", "VND"),
            order.totalAmount, Number::doubleValue);

        // Order status breakdown
        registry.counter("orders.created",
            "status", order.status.toString()).increment();

        // Customer lifetime value (LTV)
        registry.gauge("customer.ltv",
            Tags.of("customerId", order.customerId.toString()),
            calculateLTV(order.customerId), Number::doubleValue);
    }

    // ===== System Health Metrics =====
    public void registerHealthMetrics() {
        // Queue depth (message queue size)
        Gauge.builder("queue.depth", this::getQueueDepth)
            .description("Pending messages in queue")
            .tag("queue", "payment-processing")
            .register(registry);

        // Cache hit rate
        Gauge.builder("cache.hitrate", this::getCacheHitRate)
            .description("Cache hit percentage")
            .tag("cache", "product-cache")
            .register(registry);

        // External API response time
        Timer.builder("external.api.latency")
            .publishPercentiles(0.5, 0.95, 0.99)
            .tag("api", "payment-gateway")
            .register(registry);
    }

    private double getQueueDepth() {
        // Query queue depth
        return 0;
    }

    private double getCacheHitRate() {
        // Calculate cache hit ratio
        return 0.85;
    }
}
```

### Mục bổ sung: Caching Strategies Detailed

```java
@ApplicationScoped
public class CachingStrategies {

    // ===== Strategy 1: Cache-Aside (Manual) =====
    // Check cache → if miss → load from source → update cache
    public record CachedProduct(Product product, long timestamp) {}

    private final Map<Long, CachedProduct> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

    public Product getProductCacheAside(Long id) {
        CachedProduct cached = cache.get(id);

        // Check if valid
        if (cached != null && System.currentTimeMillis() - cached.timestamp < CACHE_TTL_MS) {
            return cached.product;  // ← Cache HIT
        }

        // Cache MISS: Load from DB
        Product product = productRepository.findById(id);

        // Update cache
        cache.put(id, new CachedProduct(product, System.currentTimeMillis()));

        return product;
    }

    // ===== Strategy 2: Write-Through =====
    // Khi update: update cache + update DB
    // Lúc read: từ cache (guaranteed fresh)
    @Transactional
    public void updateProductWriteThrough(Long id, ProductUpdateDTO dto) {
        // Update source
        Product product = productRepository.findById(id);
        product.name = dto.name();
        product.price = dto.price();
        productRepository.update("name = ?1, price = ?2 WHERE id = ?3",
            dto.name(), dto.price(), id);

        // Update cache
        cache.put(id, new CachedProduct(product, System.currentTimeMillis()));
    }

    // ===== Strategy 3: Write-Behind (Async) =====
    // Khi update: update cache SAJA → queue update DB async
    // Trade-off: Cache up-to-date, but DB might lag
    private final Queue<Update> updateQueue = new ConcurrentLinkedQueue<>();

    public void updateProductWriteBehind(Long id, ProductUpdateDTO dto) {
        // Update cache immediately
        Product product = new Product();
        product.id = id;
        product.name = dto.name();
        product.price = dto.price();
        cache.put(id, new CachedProduct(product, System.currentTimeMillis()));

        // Queue untuk update DB async
        updateQueue.offer(new Update(id, dto));
    }

    // Background worker
    @Scheduled(every = "5s")
    @Transactional
    void flushCacheUpdates() {
        while (!updateQueue.isEmpty()) {
            Update update = updateQueue.poll();
            productRepository.update("name = ?1, price = ?2 WHERE id = ?3",
                update.dto.name(), update.dto.price(), update.id);
        }
    }

    private record Update(Long id, ProductUpdateDTO dto) {}

    // ===== Strategy 4: Cache Invalidation Pattern =====
    public void invalidateDependentCaches(Long productId) {
        // Cascading invalidation
        cache.remove(productId);  // Product cache

        // Invalidate related caches
        List<Long> cartIds = getCartsContaining(productId);
        cartIds.forEach(cartId -> invalidateCartCache(cartId));

        List<Long> orderIds = getOrdersContaining(productId);
        orderIds.forEach(orderId -> invalidateOrderCache(orderId));
    }

    // ===== Strategy 5: Refresh-ahead (Proactive) =====
    // Sebelum cache expire → refresh dari source
    @Scheduled(every = "1m")
    void refreshAheadCache() {
        long now = System.currentTimeMillis();
        cache.forEach((id, cached) -> {
            long age = now - cached.timestamp;
            if (age > CACHE_TTL_MS * 0.8) {  // Refresh at 80% TTL
                Product fresh = productRepository.findById(id);
                cache.put(id, new CachedProduct(fresh, now));
                log.debug("Refreshed cache for product " + id);
            }
        });
    }
}
```

### Mục bổ sung: Distributed Caching (Redis)

```properties
# Redis Configuration
quarkus.redis.hosts=redis://localhost:6379
quarkus.redis.password=
quarkus.redis.max-pool-size=8
```

```java
@ApplicationScoped
public class DistributedCachingWithRedis {

    @Inject
    ReactiveRedisClient redis;  // Quarkus reactive Redis client

    // ===== Cache-Aside with Redis =====
    public Uni<Product> getProductWithRedis(Long id) {
        String cacheKey = "product:" + id;

        return redis.get(cacheKey)
            .onItem().ifNotNull()
            .transform(cached -> {
                // Cache HIT: Deserialize từ Redis
                return JsonUtil.parse(cached, Product.class);
            })
            .onItem().ifNull()
            .switchTo(() -> {
                // Cache MISS: Load từ DB
                return productRepository.findById(id)
                    .invoke(product -> {
                        // Update Redis async
                        redis.setex(cacheKey, 300, JsonUtil.serialize(product))
                            .subscribe().with(ignore -> {}, log::error);
                    });
            });
    }

    // ===== Invalidate cache (FIFO queue) =====
    public Uni<Void> invalidateProductCache(Long id) {
        String cacheKey = "product:" + id;
        return redis.del(List.of(cacheKey))
            .replaceWithVoid();
    }

    // ===== Cache warming (preload frequently accessed data) =====
    @Scheduled(every = "30m")
    public void warmupCaches() {
        topProductService.getTopProducts(100)
            .subscribe().with(products -> {
                products.forEach(product -> {
                    String cacheKey = "product:" + product.id;
                    redis.setex(cacheKey, 3600, JsonUtil.serialize(product))
                        .subscribe().with(ignore -> {}, log::error);
                });
                log.info("Warmed up " + products.size() + " products in Redis");
            });
    }
}
```

---

## Security chi tiết (OIDC, JWT, RBAC)

### Tổng quan Security trong Quarkus

```
┌──────────────────────────────────────────────────────┐
│               Quarkus Security Architecture           │
│                                                       │
│  Request → [Authentication] → [Authorization] → App   │
│                                                       │
│  Authentication:                                      │
│  ├── OIDC (Keycloak, Auth0, Okta)                    │
│  ├── JWT (MicroProfile JWT)                          │
│  ├── Basic Auth                                       │
│  ├── Form Auth                                        │
│  └── mTLS (Mutual TLS)                              │
│                                                       │
│  Authorization:                                       │
│  ├── @RolesAllowed                                   │
│  ├── @Authenticated                                  │
│  ├── @PermitAll / @DenyAll                          │
│  └── Custom SecurityIdentityAugmentor               │
└──────────────────────────────────────────────────────┘
```

### OIDC (OpenID Connect) với Keycloak

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc</artifactId>
</dependency>
```

```properties
# application.properties

# ===== OIDC Configuration =====
quarkus.oidc.auth-server-url=http://keycloak:8080/realms/my-realm
quarkus.oidc.client-id=my-quarkus-app
quarkus.oidc.credentials.secret=my-client-secret
quarkus.oidc.application-type=service  # service (backend API) | web-app (UI)

# Token validation
quarkus.oidc.token.issuer=http://keycloak:8080/realms/my-realm
quarkus.oidc.token.audience=my-quarkus-app

# Roles mapping
quarkus.oidc.roles.role-claim-path=realm_access/roles
# Hoặc cho client roles:
# quarkus.oidc.roles.role-claim-path=resource_access/my-quarkus-app/roles

# ===== Dev Services (auto-start Keycloak cho dev/test) =====
%dev.quarkus.oidc.devservices.enabled=true
%dev.quarkus.oidc.devservices.realm-path=dev-realm.json
```

```java
// ===== Secure REST Resource =====
@Path("/api")
@Authenticated  // Tất cả endpoints yêu cầu authentication
public class SecureResource {

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    JsonWebToken jwt;  // Access JWT claims

    // ===== Role-based Access =====
    @GET
    @Path("/admin/users")
    @RolesAllowed("admin")  // Chỉ admin
    public List<User> getUsers() {
        return userService.findAll();
    }

    @GET
    @Path("/profile")
    @RolesAllowed({"user", "admin"})  // user HOẶC admin
    public UserProfile getProfile() {
        String userId = securityIdentity.getPrincipal().getName();
        String email = jwt.getClaim("email");
        Set<String> roles = securityIdentity.getRoles();

        return userService.getProfile(userId);
    }

    @GET
    @Path("/public/health")
    @PermitAll  // Không cần authentication
    public String health() {
        return "OK";
    }

    @DELETE
    @Path("/users/{id}")
    @RolesAllowed("admin")
    public void deleteUser(@PathParam("id") Long id) {
        // Chỉ admin mới xóa được
        userService.delete(id);
    }
}
```

### JWT (MicroProfile JWT)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt-build</artifactId>
</dependency>
```

```properties
# Verify JWT
mp.jwt.verify.publickey.location=https://auth.example.com/.well-known/jwks.json
mp.jwt.verify.issuer=https://auth.example.com
smallrye.jwt.always-check-authorization=true

# Generate JWT (cho test/internal)
smallrye.jwt.sign.key.location=privateKey.pem
```

```java
// ===== JWT Claims Access =====
@Path("/api/users")
@Authenticated
public class UserResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/me")
    public UserInfo getCurrentUser() {
        String sub = jwt.getSubject();                    // subject
        String name = jwt.getClaim("preferred_username");  // custom claim
        String email = jwt.getClaim("email");
        Set<String> groups = jwt.getGroups();             // roles/groups
        long exp = jwt.getExpirationTime();               // expiration

        return new UserInfo(sub, name, email, groups);
    }
}

// ===== Generate JWT Token =====
@Path("/auth")
public class AuthResource {

    @POST
    @Path("/login")
    @PermitAll
    public Response login(LoginRequest request) {
        // Validate credentials...
        if (!authService.validate(request)) {
            return Response.status(401).build();
        }

        // Generate JWT
        String token = Jwt.issuer("https://my-app.com")
            .subject(request.username())
            .groups(Set.of("user", "premium"))
            .claim("email", request.email())
            .expiresIn(Duration.ofHours(1))
            .sign();

        return Response.ok(new TokenResponse(token)).build();
    }
}
```

### Custom Security (SecurityIdentityAugmentor)

```java
// Thêm custom roles/permissions vào SecurityIdentity
@ApplicationScoped
public class CustomSecurityAugmentor implements SecurityIdentityAugmentor {

    @Inject
    PermissionService permissionService;

    @Override
    public Uni<SecurityIdentity> augment(SecurityIdentity identity,
                                          AuthenticationRequestContext context) {
        if (identity.isAnonymous()) {
            return Uni.createFrom().item(identity);
        }

        // Lấy permissions từ DB
        String userId = identity.getPrincipal().getName();
        return permissionService.getPermissions(userId)
            .map(permissions -> {
                QuarkusSecurityIdentity.Builder builder =
                    QuarkusSecurityIdentity.builder(identity);

                // Thêm roles custom
                permissions.forEach(p -> builder.addRole(p.getName()));

                // Thêm attributes
                builder.addAttribute("tenant", getTenant(identity));

                return (SecurityIdentity) builder.build();
            });
    }
}
```

### Programmatic Security Check

```java
@ApplicationScoped
public class OrderService {

    @Inject
    SecurityIdentity identity;

    public Order getOrder(Long orderId) {
        Order order = orderRepo.findById(orderId);

        // Check thủ công: user chỉ xem order của mình (trừ admin)
        if (!identity.hasRole("admin") &&
            !order.getUserId().equals(identity.getPrincipal().getName())) {
            throw new ForbiddenException("Cannot access other user's order");
        }

        return order;
    }
}
```

### Token propagation (REST Client)

Khi gọi downstream API từ Quarkus (REST Client), cần **truyền JWT/access token** từ request hiện tại sang service kia (OAuth2 token propagation).

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc-client</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client-reactive</artifactId>
</dependency>
```

```properties
# REST Client gọi service B, dùng token của user hiện tại
quarkus.oidc-client.client-id=quarkus-app
quarkus.oidc-client.credentials.secret=secret
# Propagate token từ SecurityIdentity sang outgoing request
quarkus.rest-client."com.example.DownstreamClient".header-provider=io.quarkus.oidc.client.reactive.filter.OidcClientRequestReactiveFilter
```

```java
@RegisterRestClient(configKey = "downstream-api")
@Path("/api")
public interface DownstreamClient {
    @GET
    @Path("/data")
    Uni<Data> getData();
}

// OidcClientRequestReactiveFilter tự gắn Bearer token (từ context) vào header
// Hoặc thủ công:
@ApplicationScoped
public class TokenPropagationFilter implements ClientRequestFilter {
    @Inject SecurityIdentity identity;
    @Override
    public void filter(ClientRequestContext ctx) {
        if (identity.getCredential(AccessTokenCredential.class) != null) {
            String token = identity.getCredential(AccessTokenCredential.class).getToken();
            ctx.getHeaders().putSingle("Authorization", "Bearer " + token);
        }
    }
}
```

**Security testing**: Test endpoint có token propagation với `@TestSecurity` và mock REST Client — xem [07-Testing.md - Testing Security](./07-Testing.md#testing-security).

---

## Messaging chi tiết (Kafka, AMQP)

### SmallRye Reactive Messaging Architecture

```
┌────────────────────────────────────────────────────┐
│              SmallRye Reactive Messaging             │
│                                                      │
│  @Incoming ← [Connector] ← External (Kafka/AMQP)   │
│  @Outgoing → [Connector] → External (Kafka/AMQP)   │
│                                                      │
│  Connectors:                                         │
│  ├── smallrye-kafka       → Apache Kafka             │
│  ├── smallrye-amqp        → RabbitMQ, ActiveMQ       │
│  ├── smallrye-mqtt        → MQTT (IoT)               │
│  └── smallrye-in-memory   → In-memory (testing)      │
└────────────────────────────────────────────────────┘
```

### Kafka Full Example

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-reactive-messaging-kafka</artifactId>
</dependency>
```

```properties
# ===== Kafka Configuration =====
kafka.bootstrap.servers=localhost:9092

# ===== Outgoing (Producer) =====
mp.messaging.outgoing.order-events.connector=smallrye-kafka
mp.messaging.outgoing.order-events.topic=orders
mp.messaging.outgoing.order-events.value.serializer=io.quarkus.kafka.client.serialization.ObjectMapperSerializer
mp.messaging.outgoing.order-events.acks=all                    # Durability
mp.messaging.outgoing.order-events.retries=3                   # Retry on failure
mp.messaging.outgoing.order-events.enable.idempotence=true     # Exactly-once

# ===== Incoming (Consumer) =====
mp.messaging.incoming.order-events-in.connector=smallrye-kafka
mp.messaging.incoming.order-events-in.topic=orders
mp.messaging.incoming.order-events-in.group.id=order-processor
mp.messaging.incoming.order-events-in.auto.offset.reset=earliest
mp.messaging.incoming.order-events-in.value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
mp.messaging.incoming.order-events-in.failure-strategy=dead-letter-queue
mp.messaging.incoming.order-events-in.dead-letter-queue.topic=orders-dlq
mp.messaging.incoming.order-events-in.commit-strategy=throttled
```

```java
// ===== Producer =====
@ApplicationScoped
public class OrderEventProducer {

    @Inject
    @Channel("order-events")
    Emitter<OrderEvent> emitter;

    // Cách 1: Fire and forget
    public void sendEvent(OrderEvent event) {
        emitter.send(event);
    }

    // Cách 2: Với acknowledgment
    public CompletionStage<Void> sendEventAck(OrderEvent event) {
        return emitter.send(event).toCompletableFuture();
    }

    // Cách 3: Với metadata (key, headers)
    public void sendWithKey(OrderEvent event) {
        OutgoingKafkaRecordMetadata<String> metadata =
            OutgoingKafkaRecordMetadata.<String>builder()
                .withKey(event.getOrderId().toString())
                .withHeaders(new RecordHeaders().add("source", "order-service".getBytes()))
                .withPartition(0)
                .build();

        Message<OrderEvent> message = Message.of(event)
            .addMetadata(metadata);

        emitter.send(message);
    }
}

// ===== Consumer =====
@ApplicationScoped
public class OrderEventConsumer {

    private static final Logger log = Logger.getLogger(OrderEventConsumer.class);

    // Cách 1: Simple consumer
    @Incoming("order-events-in")
    public void process(String payload) {
        OrderEvent event = JsonUtil.parse(payload, OrderEvent.class);
        log.info("Processing order: " + event.getOrderId());
    }

    // Cách 2: Với Message (access metadata, manual ack)
    @Incoming("order-events-in")
    public CompletionStage<Void> processWithMessage(Message<String> message) {
        try {
            // Access Kafka metadata
            IncomingKafkaRecordMetadata<String, String> metadata =
                message.getMetadata(IncomingKafkaRecordMetadata.class).orElse(null);

            if (metadata != null) {
                String key = metadata.getKey();
                int partition = metadata.getPartition();
                long offset = metadata.getOffset();
                log.infof("Key=%s, Partition=%d, Offset=%d", key, partition, offset);
            }

            processOrder(message.getPayload());

            return message.ack();  // Manual acknowledge
        } catch (Exception e) {
            return message.nack(e);  // Negative acknowledge → retry hoặc DLQ
        }
    }

    // Cách 3: Reactive consumer
    @Incoming("order-events-in")
    public Uni<Void> processReactive(String payload) {
        return orderService.processAsync(payload)
            .replaceWithVoid();
    }

    // Cách 4: Processor (consume + produce)
    @Incoming("raw-orders")
    @Outgoing("enriched-orders")
    public OrderEvent enrich(OrderEvent event) {
        event.enrichedAt = Instant.now();
        event.region = resolveRegion(event);
        return event;
    }

    // Cách 5: Stream processor
    @Incoming("raw-events")
    @Outgoing("filtered-events")
    public Multi<OrderEvent> filterStream(Multi<OrderEvent> events) {
        return events
            .filter(e -> e.getAmount() > 100)
            .onItem().transform(e -> {
                e.setHighValue(true);
                return e;
            });
    }
}
```

### Dead Letter Queue (DLQ)

```java
// Khi message processing thất bại sau tất cả retry
// → Message tự động gửi vào DLQ topic

// Custom DLQ handler
@ApplicationScoped
public class DlqProcessor {

    @Incoming("orders-dlq")
    public void processDlq(String payload) {
        log.error("Failed to process order, moved to DLQ: " + payload);
        alertService.notifyAdmin("DLQ message: " + payload);
    }
}
```

### RabbitMQ (AMQP)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-reactive-messaging-amqp</artifactId>
</dependency>
```

```properties
amqp-host=localhost
amqp-port=5672
amqp-username=guest
amqp-password=guest

mp.messaging.outgoing.notifications.connector=smallrye-amqp
mp.messaging.outgoing.notifications.address=notifications
mp.messaging.outgoing.notifications.durable=true

mp.messaging.incoming.notifications-in.connector=smallrye-amqp
mp.messaging.incoming.notifications-in.address=notifications
mp.messaging.incoming.notifications-in.durable=true
```

---

## Fault Tolerance & Resilience

### SmallRye Fault Tolerance

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-fault-tolerance</artifactId>
</dependency>
```

### @Retry (Thử lại)

```java
@ApplicationScoped
public class ExternalApiClient {

    // ===== Basic Retry =====
    @Retry(maxRetries = 3)
    public String callApi() {
        return httpClient.get("https://api.example.com/data");
    }

    // ===== Retry với Backoff =====
    @Retry(
        maxRetries = 5,
        delay = 200,           // Delay ban đầu: 200ms
        maxDuration = 10000,   // Tổng thời gian retry tối đa: 10s
        jitter = 100,          // Random jitter ±100ms
        retryOn = {IOException.class, TimeoutException.class},  // Chỉ retry cho exception này
        abortOn = {AuthenticationException.class}  // KHÔNG retry cho exception này
    )
    public String callApiWithBackoff() {
        return httpClient.get("https://api.example.com/data");
    }

    // ===== Exponential Backoff =====
    @Retry(maxRetries = 5)
    @ExponentialBackoff(
        factor = 2,        // Mỗi retry × 2 delay
        maxDelay = 5000    // Tối đa 5 giây giữa các retry
    )
    // Delays: 200ms → 400ms → 800ms → 1600ms → 3200ms (cap at 5000ms)
    public String callWithExponentialBackoff() {
        return httpClient.get("https://api.example.com/data");
    }
}
```

### @Timeout

```java
@ApplicationScoped
public class SlowService {

    // Timeout sau 2 giây → TimeoutException
    @Timeout(2000)
    public String callSlowEndpoint() {
        return httpClient.get("https://slow-api.example.com/data");
    }

    // Kết hợp Timeout + Retry
    @Timeout(1000)
    @Retry(maxRetries = 3, delay = 500)
    // Mỗi lần gọi timeout 1s, retry 3 lần, delay 500ms giữa các lần
    public String callWithTimeoutAndRetry() {
        return httpClient.get("https://api.example.com/data");
    }
}
```

### @CircuitBreaker (Ngắt mạch)

```java
@ApplicationScoped
public class PaymentGateway {

    // ===== Circuit Breaker =====
    @CircuitBreaker(
        requestVolumeThreshold = 10,  // Đánh giá sau 10 requests
        failureRatio = 0.5,           // Mở circuit nếu 50% fail
        delay = 10000,                // Chờ 10s trước khi thử lại (half-open)
        successThreshold = 3          // Đóng circuit sau 3 success liên tiếp
    )
    public PaymentResult charge(Order order) {
        return paymentApi.charge(order.getAmount());
    }

    // Kết hợp đầy đủ
    @CircuitBreaker(requestVolumeThreshold = 10, failureRatio = 0.5, delay = 10000)
    @Timeout(3000)
    @Retry(maxRetries = 2, delay = 500)
    @Fallback(fallbackMethod = "chargeFallback")
    public PaymentResult chargeResilient(Order order) {
        return paymentApi.charge(order.getAmount());
    }

    // Fallback method (cùng signature)
    public PaymentResult chargeFallback(Order order) {
        log.warn("Payment service unavailable, queuing order: " + order.getId());
        paymentQueue.enqueue(order);  // Xử lý sau
        return new PaymentResult("QUEUED", "Will retry later");
    }
}
```

**Circuit Breaker States:**
```
CLOSED (bình thường)
  ↓ failure ratio > threshold
OPEN (ngắt mạch, tất cả request fail ngay)
  ↓ sau delay time
HALF-OPEN (thử vài request)
  ↓ success → CLOSED
  ↓ fail → OPEN
```

### @Bulkhead (Giới hạn đồng thời)

```java
@ApplicationScoped
public class ResourceIntensiveService {

    // Thread-pool Bulkhead
    @Bulkhead(value = 10)  // Tối đa 10 concurrent calls
    public String heavyComputation() {
        return doHeavyWork();
    }

    // Semaphore Bulkhead (non-blocking)
    @Bulkhead(value = 20, waitingTaskQueue = 50)
    // 20 concurrent + 50 in queue = tối đa 70 requests
    // Request thứ 71 → BulkheadException
    @Asynchronous
    public CompletionStage<String> asyncHeavyWork() {
        return CompletableFuture.supplyAsync(() -> doHeavyWork());
    }
}
```

### @Fallback

```java
@ApplicationScoped
public class ProductService {

    // ===== Fallback Method =====
    @Fallback(fallbackMethod = "getDefaultProducts")
    @Timeout(2000)
    public List<Product> getProducts() {
        return catalogApi.getProducts();
    }

    List<Product> getDefaultProducts() {
        return cachedProducts;  // Trả về cache khi service down
    }

    // ===== Fallback Handler Class =====
    @Fallback(ProductFallbackHandler.class)
    public Product getProduct(Long id) {
        return catalogApi.getProduct(id);
    }
}

// Fallback Handler
public class ProductFallbackHandler implements FallbackHandler<Product> {
    @Override
    public Product handle(ExecutionContext context) {
        Long id = (Long) context.getParameters()[0];
        return Product.cached(id);
    }
}
```

### Thứ tự thực thi Fault Tolerance

```
Request
  ↓
@Bulkhead (check concurrent limit)
  ↓
@CircuitBreaker (check circuit state)
  ↓
@Timeout (set timer)
  ↓
@Retry (retry loop)
  ↓
Actual method call
  ↓
@Fallback (nếu tất cả fail)
  ↓
Response
```

---

## Observability (Metrics, Health, Tracing)

### Health Checks

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-health</artifactId>
</dependency>
```

```java
// ===== Liveness: App còn sống không? =====
// Endpoint: /q/health/live
@Liveness
@ApplicationScoped
public class AppLivenessCheck implements HealthCheck {
    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.up("Application is alive");
    }
}

// ===== Readiness: App sẵn sàng nhận request không? =====
// Endpoint: /q/health/ready
@Readiness
@ApplicationScoped
public class DatabaseReadinessCheck implements HealthCheck {

    @Inject
    DataSource dataSource;

    @Override
    public HealthCheckResponse call() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            return HealthCheckResponse.named("Database")
                .up()
                .withData("database", "PostgreSQL")
                .withData("connectionPool", "healthy")
                .build();
        } catch (Exception e) {
            return HealthCheckResponse.named("Database")
                .down()
                .withData("error", e.getMessage())
                .build();
        }
    }
}

// ===== Startup: App đã khởi động xong chưa? =====
// Endpoint: /q/health/started
@Startup
@ApplicationScoped
public class WarmupCheck implements HealthCheck {

    private volatile boolean warmedUp = false;

    void onStart(@Observes StartupEvent event) {
        // Warm up caches, connections...
        warmedUp = true;
    }

    @Override
    public HealthCheckResponse call() {
        return warmedUp
            ? HealthCheckResponse.up("Warm-up complete")
            : HealthCheckResponse.down("Still warming up");
    }
}

// ===== Custom Health Group =====
@HealthGroup("external-services")
@ApplicationScoped
public class ExternalApiHealthCheck implements HealthCheck {
    @Override
    public HealthCheckResponse call() {
        // Check external API availability
        boolean available = httpClient.ping("https://api.example.com/health");
        return HealthCheckResponse.named("External API")
            .status(available)
            .build();
    }
}
// Endpoint: /q/health/group/external-services
```

### Metrics (Micrometer)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-micrometer-registry-prometheus</artifactId>
</dependency>
```

```java
@ApplicationScoped
public class OrderService {

    @Inject
    MeterRegistry registry;

    // ===== Counter (đếm) =====
    @Counted(value = "orders.created", description = "Number of orders created")
    public Order createOrder(CreateOrderRequest request) {
        // Tự động tăng counter mỗi khi method được gọi
        return orderRepo.save(new Order(request));
    }

    // ===== Timer (đo thời gian) =====
    @Timed(value = "orders.processing.time", description = "Time to process order")
    public void processOrder(Long orderId) {
        // Tự động measure execution time
        doProcessing(orderId);
    }

    // ===== Gauge (giá trị hiện tại) =====
    void init(@Observes StartupEvent event) {
        Gauge.builder("orders.pending.count", orderRepo, repo -> repo.countByStatus("PENDING"))
            .description("Number of pending orders")
            .register(registry);
    }

    // ===== Programmatic metrics =====
    public void processPayment(Order order) {
        Timer.Sample sample = Timer.start(registry);

        try {
            paymentGateway.charge(order);

            registry.counter("payments.success",
                "method", order.getPaymentMethod(),
                "region", order.getRegion()
            ).increment();
        } catch (Exception e) {
            registry.counter("payments.failure",
                "method", order.getPaymentMethod(),
                "error", e.getClass().getSimpleName()
            ).increment();
            throw e;
        } finally {
            sample.stop(registry.timer("payments.duration",
                "method", order.getPaymentMethod()));
        }
    }

    // ===== Distribution Summary (histogram) =====
    public void recordOrderAmount(Order order) {
        DistributionSummary.builder("orders.amount")
            .description("Order amount distribution")
            .baseUnit("VND")
            .publishPercentiles(0.5, 0.95, 0.99)  // p50, p95, p99
            .register(registry)
            .record(order.getAmount().doubleValue());
    }
}
```

```properties
# Prometheus endpoint: /q/metrics
quarkus.micrometer.export.prometheus.path=/q/metrics
quarkus.micrometer.binder.http-server.enabled=true
quarkus.micrometer.binder.jvm=true
quarkus.micrometer.binder.system=true
```

### Distributed Tracing (OpenTelemetry)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

```properties
# OpenTelemetry config
quarkus.otel.exporter.otlp.endpoint=http://jaeger:4317
quarkus.otel.service.name=order-service
quarkus.otel.traces.enabled=true

# Sampling
quarkus.otel.traces.sampler=parentbased_traceidratio
quarkus.otel.traces.sampler.arg=0.1  # Sample 10% requests
```

```java
@ApplicationScoped
public class OrderService {

    @Inject
    Tracer tracer;  // OpenTelemetry Tracer

    // Quarkus TỰ ĐỘNG trace:
    // - HTTP requests/responses
    // - REST Client calls
    // - Database queries
    // - Kafka messages

    // Custom span cho business logic
    @WithSpan("processOrder")  // Tạo span tự động
    public void processOrder(
            @SpanAttribute("orderId") Long orderId) {  // Thêm attribute
        // Logic...
    }

    // Manual span
    public void complexProcess(Order order) {
        Span span = tracer.spanBuilder("validateOrder")
            .setAttribute("orderId", order.getId())
            .startSpan();

        try (Scope scope = span.makeCurrent()) {
            validateOrder(order);
            span.addEvent("Validation passed");

            processPayment(order);
            span.addEvent("Payment processed");
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(StatusCode.ERROR, e.getMessage());
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### Structured Logging

```properties
# JSON logging (cho Elasticsearch/Loki)
quarkus.log.console.json=true
quarkus.log.console.json.additional-field."service".value=order-service
quarkus.log.console.json.additional-field."environment".value=${ENVIRONMENT:dev}
```

```java
@ApplicationScoped
public class OrderService {

    private static final Logger log = Logger.getLogger(OrderService.class);

    public void processOrder(Order order) {
        // MDC (Mapped Diagnostic Context) - thêm context vào log
        MDC.put("orderId", order.getId().toString());
        MDC.put("userId", order.getUserId());

        log.infof("Processing order #%d, amount=%s", order.getId(), order.getAmount());
        // JSON output: {"message":"Processing order #123...","orderId":"123","userId":"U001",...}

        MDC.clear();
    }
}
```

---

## Configuration nâng cao

### @ConfigMapping (Type-safe Config)

```java
// ===== Interface-based Config =====
@ConfigMapping(prefix = "app")
public interface AppConfig {
    String name();           // app.name
    int version();           // app.version
    boolean debug();         // app.debug

    DatabaseConfig database();  // Nested config

    interface DatabaseConfig {
        String url();            // app.database.url
        String username();       // app.database.username
        Optional<String> schema();  // app.database.schema (optional)

        @WithDefault("10")
        int maxPoolSize();       // app.database.max-pool-size (default: 10)
    }

    Map<String, String> features();  // app.features.xxx

    List<String> cors();  // app.cors[0], app.cors[1]...
}

// Sử dụng
@ApplicationScoped
public class AppService {
    @Inject
    AppConfig config;

    public void init() {
        String dbUrl = config.database().url();
        int pool = config.database().maxPoolSize();
        boolean featureX = Boolean.parseBoolean(
            config.features().getOrDefault("feature-x", "false"));
    }
}
```

```properties
# application.properties
app.name=My Quarkus App
app.version=1
app.debug=false
app.database.url=jdbc:postgresql://localhost:5432/mydb
app.database.username=admin
app.database.max-pool-size=20
app.features.feature-x=true
app.features.feature-y=false
app.cors[0]=http://localhost:3000
app.cors[1]=https://myapp.com
```

### Config Sources & Priority

```
Priority (cao → thấp):
1. System properties (-Dkey=value)
2. Environment variables (KEY_VALUE)
3. .env file
4. application.properties (in config/ directory)
5. application.properties (in classpath)
6. MicroProfile Config sources
7. Default values (@WithDefault)
```

### Custom Config Source

```java
// Đọc config từ database, Consul, Vault...
public class DatabaseConfigSource implements ConfigSource {

    @Override
    public Map<String, String> getProperties() {
        // Load từ database
        return configRepo.findAll().stream()
            .collect(Collectors.toMap(Config::getKey, Config::getValue));
    }

    @Override
    public String getValue(String propertyName) {
        return getProperties().get(propertyName);
    }

    @Override
    public String getName() {
        return "database-config";
    }

    @Override
    public int getOrdinal() {
        return 275;  // Priority (default sources = 100-400)
    }
}

// Đăng ký: META-INF/services/org.eclipse.microprofile.config.spi.ConfigSource
```

### Runtime vs Build-time Config

```properties
# BUILD-TIME config (chỉ đọc lúc build, KHÔNG thay đổi runtime)
# Ví dụ: datasource type, extensions config
quarkus.datasource.db-kind=postgresql         # Build-time
quarkus.hibernate-orm.database.generation=none # Build-time

# RUNTIME config (có thể thay đổi khi deploy)
quarkus.datasource.jdbc.url=jdbc:postgresql://prod-db:5432/mydb  # Runtime
quarkus.datasource.username=${DB_USER}                            # Runtime
quarkus.http.port=8080                                            # Runtime

# ⚠️ Native Image: Build-time config "bake" vào binary
# → Không thể thay đổi sau khi build native
```

---

## Scheduler & Cron Jobs

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-scheduler</artifactId>
</dependency>
```

```java
@ApplicationScoped
public class ScheduledJobs {

    // ===== Fixed interval =====
    @Scheduled(every = "10s")  // Mỗi 10 giây
    void cleanupExpiredSessions() {
        sessionRepo.deleteExpired();
        log.info("Cleaned up expired sessions");
    }

    // ===== Cron expression =====
    @Scheduled(cron = "0 0 2 * * ?")  // 2:00 AM mỗi ngày
    void generateDailyReport() {
        reportService.generateDaily();
    }

    // ===== Cron từ config =====
    @Scheduled(cron = "{app.report.cron}")
    void configuredCron() {
        // Cron expression lấy từ application.properties
    }

    // ===== Delayed start =====
    @Scheduled(every = "1h", delayed = "30m")
    // Chạy mỗi giờ, bắt đầu sau 30 phút kể từ khi app start
    void periodicSync() {
        syncService.sync();
    }

    // ===== Concurrent execution control =====
    @Scheduled(every = "30s", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    // Nếu job trước chưa xong → SKIP lần này (không chạy chồng)
    void longRunningJob() {
        heavyProcessing();
    }

    // ===== Conditional =====
    @Scheduled(every = "1m", skipExecutionIf = ProdOnlySkipper.class)
    void prodOnlyJob() {
        // Chỉ chạy ở production
    }

    // ===== Programmatic scheduling =====
    @Inject
    Scheduler scheduler;

    void scheduleCustom() {
        scheduler.newJob("dynamic-job")
            .setCron("0 */5 * * * ?")
            .setTask(executionContext -> {
                log.info("Dynamic job executed at " + Instant.now());
            })
            .schedule();

        // Pause/Resume
        scheduler.pause("dynamic-job");
        scheduler.resume("dynamic-job");
    }
}

// Skip condition
public class ProdOnlySkipper implements Scheduled.SkipPredicate {
    @ConfigProperty(name = "quarkus.profile")
    String profile;

    @Override
    public boolean test(ScheduledExecution execution) {
        return !"prod".equals(profile);  // Skip nếu KHÔNG phải prod
    }
}
```

### Cron Expression Reference

```
┌──────────── second (0-59)
│ ┌────────── minute (0-59)
│ │ ┌──────── hour (0-23)
│ │ │ ┌────── day of month (1-31)
│ │ │ │ ┌──── month (1-12 hoặc JAN-DEC)
│ │ │ │ │ ┌── day of week (0-7 hoặc SUN-SAT, 0=7=Sunday)
│ │ │ │ │ │
* * * * * *

Ví dụ:
"0 0 * * * ?"     → Mỗi giờ (đầu giờ)
"0 */15 * * * ?"  → Mỗi 15 phút
"0 0 2 * * ?"     → 2:00 AM mỗi ngày
"0 0 9 * * MON"   → 9:00 AM mỗi thứ Hai
"0 0 0 1 * ?"     → Đầu mỗi tháng
```

---

## WebSocket

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-websockets-next</artifactId>
</dependency>
```

```java
@WebSocket(path = "/chat/{room}")
public class ChatWebSocket {

    // Concurrent map quản lý connections
    private static final Map<String, Set<WebSocketConnection>> rooms = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(WebSocketConnection connection, @PathParam String room) {
        rooms.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(connection);
        broadcast(room, "User joined: " + connection.id());
    }

    @OnTextMessage
    public void onMessage(WebSocketConnection connection, @PathParam String room, String message) {
        broadcast(room, connection.id() + ": " + message);
    }

    @OnClose
    public void onClose(WebSocketConnection connection, @PathParam String room) {
        Set<String> roomConns = rooms.get(room);
        if (roomConns != null) {
            roomConns.remove(connection);
        }
        broadcast(room, "User left: " + connection.id());
    }

    @OnError
    public void onError(WebSocketConnection connection, @PathParam String room, Throwable error) {
        log.error("WebSocket error in room " + room, error);
    }

    private void broadcast(String room, String message) {
        Set<WebSocketConnection> conns = rooms.get(room);
        if (conns != null) {
            conns.forEach(conn -> conn.sendTextAndAwait(message));
        }
    }
}
```

---

## gRPC

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-grpc</artifactId>
</dependency>
```

```protobuf
// src/main/proto/user.proto
syntax = "proto3";

option java_package = "com.example.grpc";

service UserService {
    rpc GetUser (GetUserRequest) returns (UserResponse) {}
    rpc ListUsers (Empty) returns (stream UserResponse) {}  // Server streaming
}

message GetUserRequest {
    int64 id = 1;
}

message UserResponse {
    int64 id = 1;
    string name = 2;
    string email = 3;
}

message Empty {}
```

```java
// ===== gRPC Service Implementation =====
@GrpcService
public class UserGrpcService implements UserService {

    @Inject
    UserRepository userRepo;

    @Override
    public Uni<UserResponse> getUser(GetUserRequest request) {
        return userRepo.findById(request.getId())
            .map(user -> UserResponse.newBuilder()
                .setId(user.id)
                .setName(user.name)
                .setEmail(user.email)
                .build());
    }

    @Override
    public Multi<UserResponse> listUsers(Empty request) {
        return userRepo.streamAll()
            .map(user -> UserResponse.newBuilder()
                .setId(user.id)
                .setName(user.name)
                .setEmail(user.email)
                .build());
    }
}
```

```properties
quarkus.grpc.server.port=9000
quarkus.grpc.server.use-separate-server=true
```

---

## GraphQL

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-graphql</artifactId>
</dependency>
```

```java
@GraphQLApi
public class UserGraphQL {

    @Inject
    UserService userService;

    // Query
    @Query("users")
    @Description("Get all users")
    public List<User> getUsers() {
        return userService.findAll();
    }

    @Query("user")
    public User getUser(@Name("id") Long id) {
        return userService.findById(id);
    }

    // Mutation
    @Mutation("createUser")
    public User createUser(UserInput input) {
        return userService.create(input.toEntity());
    }

    @Mutation("deleteUser")
    public boolean deleteUser(@Name("id") Long id) {
        return userService.delete(id);
    }

    // Subscription (real-time)
    @Subscription("orderCreated")
    public Multi<Order> onOrderCreated() {
        return orderService.streamNewOrders();
    }
}

// Input type
@Input("UserInput")
public class UserInput {
    public String name;
    public String email;
}
```

```
# GraphQL endpoint: /graphql
# GraphQL UI: /q/graphql-ui (dev mode)

# Example query:
query {
  users {
    id
    name
    email
  }
}

mutation {
  createUser(input: { name: "John", email: "john@example.com" }) {
    id
    name
  }
}
```

---

## OpenAPI & Swagger

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-openapi</artifactId>
</dependency>
```

```java
@Path("/api/users")
@Tag(name = "Users", description = "User management APIs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @GET
    @Operation(summary = "List all users", description = "Returns paginated list of users")
    @APIResponse(responseCode = "200", description = "Success",
        content = @Content(schema = @Schema(implementation = User.class)))
    public List<User> listUsers(
            @QueryParam("page") @DefaultValue("0")
            @Parameter(description = "Page number") int page,
            @QueryParam("size") @DefaultValue("20")
            @Parameter(description = "Page size") int size) {
        return userService.findAll(page, size);
    }

    @POST
    @Operation(summary = "Create a new user")
    @APIResponse(responseCode = "201", description = "User created")
    @APIResponse(responseCode = "400", description = "Invalid input")
    @APIResponse(responseCode = "409", description = "Email already exists")
    public Response createUser(
            @RequestBody(required = true,
                content = @Content(schema = @Schema(implementation = CreateUserRequest.class)))
            CreateUserRequest request) {
        User user = userService.create(request);
        return Response.status(201).entity(user).build();
    }
}
```

```properties
# OpenAPI config
quarkus.smallrye-openapi.path=/q/openapi
quarkus.swagger-ui.path=/q/swagger-ui
quarkus.swagger-ui.always-include=true  # Include in production

mp.openapi.extensions.smallrye.info.title=My Quarkus API
mp.openapi.extensions.smallrye.info.version=1.0.0
mp.openapi.extensions.smallrye.info.description=API documentation
```

---

## Caching

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cache</artifactId>
</dependency>
```

```java
@ApplicationScoped
public class ProductService {

    // ===== Cache result =====
    @CacheResult(cacheName = "products")
    public Product findById(@CacheKey Long id) {
        log.info("Cache MISS for product " + id);
        return productRepo.findById(id);
    }

    // ===== Invalidate single entry =====
    @CacheInvalidate(cacheName = "products")
    @Transactional
    public void update(@CacheKey Long id, ProductUpdateDTO dto) {
        Product p = productRepo.findById(id);
        p.name = dto.name();
    }

    // ===== Invalidate all entries =====
    @CacheInvalidateAll(cacheName = "products")
    public void clearProductCache() {
        log.info("Product cache cleared");
    }

    // ===== Programmatic cache =====
    @Inject
    @CacheName("products")
    Cache cache;

    public Uni<Product> findByIdProgrammatic(Long id) {
        return cache.getAsync(id, key -> productRepo.findById(key));
    }
}
```

```properties
# Caffeine cache config
quarkus.cache.caffeine."products".expire-after-write=PT10M
quarkus.cache.caffeine."products".maximum-size=1000
quarkus.cache.caffeine."products".metrics-enabled=true
```

### Redis Cache

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-redis-cache</artifactId>
</dependency>
```

```properties
quarkus.redis.hosts=redis://localhost:6379
quarkus.cache.redis."products".expire-after-write=PT10M
quarkus.cache.redis."products".prefix=product-cache
```

---

## LangChain4j & Panache Next (Jakarta Data)

### LangChain4j (AI integration)

**LangChain4j** tích hợp LLM/AI vào ứng dụng Java (chat, RAG, embeddings). Quarkus có extension `quarkus-langchain4j` (community/experimental).

- **Use case**: Chatbot, semantic search, document Q&A, tool-calling.
- **Khái niệm**: Embedding store, tools, chat memory, model (OpenAI, Azure, local).
- **Ví dụ**: REST endpoint nhận câu hỏi → gọi LLM với context từ vector DB → trả về câu trả lời.

```xml
<!-- Experimental / community -->
<dependency>
    <groupId>io.quarkiverse.langchain4j</groupId>
    <artifactId>quarkus-langchain4j</artifactId>
</dependency>
```

Cấu hình: API key (OpenAI/Azure), model name, embedding dimension. Tham khảo [LangChain4j](https://docs.langchain4j.dev/) và Quarkus guide tương ứng.

### Panache Next (Jakarta Data)

**Jakarta Data** là spec mới (Jakarta EE 10+) cho repository pattern chuẩn. **Panache Next** trong Quarkus là implementation Jakarta Data, thay thế dần Panache "classic".

- **Repository**: Interface kế thừa `DataRepository<Entity, ID>`, method query derive từ tên (giống Spring Data).
- **So với Panache classic**: Chuẩn Jakarta, không còn Active Record bắt buộc, tách biệt entity và repository rõ hơn.

```java
// Jakarta Data repository (Panache Next)
@Entity
public class Product {
    @Id
    public Long id;
    public String name;
    public BigDecimal price;
}

@Repository
public interface ProductRepository extends DataRepository<Product, Long> {
    List<Product> findByName(String name);
    List<Product> findByPriceLessThan(BigDecimal max);
    long countByActiveTrue();
}
```

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>
<!-- Panache Next / Jakarta Data (khi đã stable) -->
```

Hiện tại Panache classic vẫn là lựa chọn chính; Panache Next dùng khi dự án mới theo chuẩn Jakarta Data.

---

## Writing Custom Extensions

### Cấu trúc Extension

```
my-extension/
├── deployment/          # Build-time code
│   ├── pom.xml
│   └── src/main/java/
│       └── MyExtensionProcessor.java  # Build Steps
├── runtime/             # Runtime code
│   ├── pom.xml
│   └── src/main/java/
│       ├── MyExtensionRecorder.java   # Runtime init
│       └── MyService.java             # Runtime service
└── pom.xml
```

### Build Step Example

```java
// deployment module
public class MyExtensionProcessor {

    @BuildStep
    FeatureBuildItem feature() {
        return new FeatureBuildItem("my-extension");
    }

    @BuildStep
    void registerBeans(BuildProducer<AdditionalBeanBuildItem> beans) {
        beans.produce(AdditionalBeanBuildItem.builder()
            .addBeanClass(MyService.class)
            .setUnremovable()
            .build());
    }

    @BuildStep
    @Record(ExecutionTime.RUNTIME_INIT)
    void initAtRuntime(MyExtensionRecorder recorder, MyExtensionConfig config) {
        recorder.initialize(config.apiKey());
    }
}
```

```java
// runtime module
@Recorder
public class MyExtensionRecorder {
    public void initialize(String apiKey) {
        MyService.setApiKey(apiKey);
    }
}
```

---

## Deployment Strategies

### Kubernetes

```properties
# Quarkus Kubernetes extension
quarkus.kubernetes.deploy=true
quarkus.kubernetes.deployment-target=kubernetes  # hoặc openshift, knative

# Resources
quarkus.kubernetes.resources.requests.cpu=100m
quarkus.kubernetes.resources.requests.memory=128Mi
quarkus.kubernetes.resources.limits.cpu=500m
quarkus.kubernetes.resources.limits.memory=256Mi

# Replicas
quarkus.kubernetes.replicas=3

# Health probes
quarkus.kubernetes.liveness-probe.http-action-path=/q/health/live
quarkus.kubernetes.readiness-probe.http-action-path=/q/health/ready
quarkus.kubernetes.startup-probe.http-action-path=/q/health/started
quarkus.kubernetes.liveness-probe.initial-delay=10
quarkus.kubernetes.readiness-probe.initial-delay=5

# ConfigMaps & Secrets (mount vào app)
quarkus.kubernetes.config-maps=app-config
quarkus.kubernetes.secrets=db-secret
# Hoặc generate ConfigMap từ application.properties:
quarkus.kubernetes.config-env-vars.app.host=config.app.host
quarkus.kubernetes.config-env-vars.app.port=config.app.port

# HPA (Horizontal Pod Autoscaler)
quarkus.kubernetes.autoscaling.max-replicas=10
quarkus.kubernetes.autoscaling.min-replicas=2
quarkus.kubernetes.autoscaling.cpu-target-utilization=70

# Service
quarkus.kubernetes.service-type=ClusterIP
quarkus.kubernetes.ports.http.container-port=8080
```

**ConfigMaps/Secrets**: Tạo ConfigMap/Secret trên cluster, sau đó khai báo `quarkus.kubernetes.config-maps` / `quarkus.kubernetes.secrets` để Quarkus gắn vào Deployment (env hoặc volume). Chi tiết K8s manifests, probes, HPA — xem [11-Kubernetes-CloudNative.md](./11-Kubernetes-CloudNative.md).

```bash
# Generate K8s manifests
./mvnw package -Dquarkus.kubernetes.deploy=false
# → target/kubernetes/kubernetes.yml

# Deploy
./mvnw package -Dquarkus.kubernetes.deploy=true
```

### Serverless (AWS Lambda)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-amazon-lambda-http</artifactId>
</dependency>
```

```bash
# Build native for Lambda
./mvnw package -Pnative -Dquarkus.native.container-build=true

# Deploy với SAM
sam deploy --template-file target/sam.jvm.yaml --guided
# Hoặc native:
sam deploy --template-file target/sam.native.yaml --guided
```

### Knative (Serverless on K8s)

```properties
quarkus.kubernetes.deployment-target=knative
quarkus.knative.min-scale=0     # Scale to zero
quarkus.knative.max-scale=10    # Max instances
quarkus.knative.revision-auto-scaling.target=100  # Requests per instance
```

---

## Câu hỏi thường gặp

### Q1: Quarkus Security vs Spring Security?

| | Quarkus | Spring Security |
| :--- | :--- | :--- |
| **Config** | Đơn giản (properties) | Phức tạp (SecurityFilterChain) |
| **OIDC** | Built-in, zero-code | Cần config nhiều |
| **JWT** | MicroProfile JWT, simple | Spring Security OAuth2 |
| **Performance** | Nhanh (build-time) | Chậm hơn (runtime) |
| **Flexibility** | Đủ cho hầu hết cases | Cực kỳ flexible |
| **Learning curve** | Thấp | Cao |

### Q2: Khi nào dùng @Retry vs @CircuitBreaker?

- **@Retry**: Lỗi tạm thời, service sẽ recovery nhanh (network glitch, transient error)
- **@CircuitBreaker**: Service down kéo dài, cần protect resources (ngắt mạch để không gửi request vô ích)
- **Kết hợp**: `@CircuitBreaker` bao ngoài `@Retry` → Retry cho lỗi nhỏ, ngắt mạch khi retry quá nhiều lần thất bại

### Q3: Metrics nào nên monitor?

| Category | Metrics | Alert When |
| :--- | :--- | :--- |
| **HTTP** | Request rate, latency p99, error rate | Latency > 500ms, Error > 5% |
| **JVM** | Heap used, GC pause, threads | Heap > 80%, GC > 1s |
| **DB** | Connection pool, query time | Pool exhausted, query > 1s |
| **Business** | Orders/min, payment failures | Orders drop 50%, payment fail > 10% |
| **Custom** | Circuit breaker state, retry count | CB open, retry > 3x normal |

### Q4: @ConfigMapping vs @ConfigProperty?

- **@ConfigProperty**: Inject từng property riêng lẻ, đơn giản
- **@ConfigMapping**: Type-safe, nhóm properties, nested config, validation
- **Khuyến nghị**: `@ConfigMapping` cho config phức tạp (5+ properties), `@ConfigProperty` cho 1-2 properties

### Q5: Quarkus có hỗ trợ WebSocket không?

- **Có**: `quarkus-websockets-next` (mới, reactive, khuyến nghị) hoặc `quarkus-websockets` (legacy)
- Hỗ trợ: Binary/Text messages, Path params, Interceptors, CDI injection
- Scaling: WebSocket connections là stateful → Cần sticky sessions hoặc shared state (Redis pub/sub)

### Q6: So sánh REST vs gRPC vs GraphQL trong Quarkus?

| | REST | gRPC | GraphQL |
| :--- | :--- | :--- | :--- |
| **Protocol** | HTTP/JSON | HTTP/2 + Protobuf | HTTP/JSON |
| **Performance** | Tốt | Rất tốt (binary) | Tùy query |
| **Use case** | Public API, CRUD | Service-to-service | Frontend flexible |
| **Schema** | OpenAPI (optional) | .proto (required) | SDL (required) |
| **Streaming** | SSE | Bidirectional | Subscription |
| **Quarkus ext** | `resteasy-reactive` | `quarkus-grpc` | `smallrye-graphql` |

---

## Best Practices

### Security
1. **Dùng OIDC** cho production (Keycloak, Auth0)
2. **@RolesAllowed** ở Resource layer, business check ở Service layer
3. **JWT validation**: Luôn verify issuer, audience, expiration
4. **CORS**: Config chặt chẽ, chỉ allow domains cần thiết

### Messaging
5. **Idempotent consumers**: Message có thể delivered nhiều lần
6. **Dead Letter Queue**: Không bỏ sót message lỗi
7. **Schema evolution**: Dùng Avro/Protobuf thay vì JSON cho long-term

### Resilience
8. **Circuit Breaker** cho tất cả external calls
9. **Timeout** cho mọi I/O operation
10. **Bulkhead** cho shared resources

### Observability
11. **Health checks**: Liveness + Readiness + Startup cho K8s
12. **Metrics**: HTTP latency p99, error rate, business metrics
13. **Tracing**: Distributed tracing cho microservices
14. **Structured logging**: JSON format cho log aggregation

### Configuration
15. **@ConfigMapping**: Type-safe configuration
16. **Profiles**: Separate config per environment
17. **Secrets**: Dùng Vault/K8s Secrets, KHÔNG hardcode

---

## Tổng kết

- **Security**: OIDC (Keycloak) + JWT + @RolesAllowed → Simple, powerful
- **Messaging**: SmallRye Reactive Messaging → Kafka, AMQP, in-memory
- **Fault Tolerance**: @Retry, @Timeout, @CircuitBreaker, @Bulkhead, @Fallback
- **Observability**: Health + Metrics (Micrometer) + Tracing (OpenTelemetry)
- **Configuration**: @ConfigMapping (type-safe) + Profiles + Custom Sources
- **Scheduler**: @Scheduled với cron hoặc fixed interval
- **WebSocket**: quarkus-websockets-next (reactive)
- **gRPC**: Protobuf + HTTP/2 cho service-to-service
- **GraphQL**: SmallRye GraphQL cho flexible frontend queries
- **OpenAPI**: Tự động generate documentation
- **Deployment**: Kubernetes, Knative (serverless), AWS Lambda
