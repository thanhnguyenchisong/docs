# Integration Examples - Spring Boot và Quarkus với Redis

## Mục lục
1. [Spring Boot + Redis (Spring Data Redis)](#spring-boot--redis-spring-data-redis)
2. [Quarkus + Redis (Redis Client)](#quarkus--redis-redis-client)
3. [So sánh nhanh Spring vs Quarkus](#so-sánh-nhanh-spring-vs-quarkus)
4. [Test nhanh bằng curl](#test-nhanh-bằng-curl)
5. [Lưu ý production](#lưu-ý-production)

---

## Spring Boot + Redis (Spring Data Redis)

### 1) Dependency (Maven)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

### 2) Cấu hình `application.yml`

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 2s
      lettuce:
        pool:
          max-active: 16
          max-idle: 8
          min-idle: 2
  cache:
    type: redis
```

### 3) Config RedisTemplate + CacheManager

```java
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
            );
        return RedisCacheManager.builder(factory).cacheDefaults(config).build();
    }
}
```

### 4) Service + API mẫu

```java
@Service
public class ProductService {

    private final StringRedisTemplate redis;

    public ProductService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void put(String key, String value) {
        redis.opsForValue().set("product:" + key, value, Duration.ofMinutes(30));
    }

    public String get(String key) {
        return redis.opsForValue().get("product:" + key);
    }

    @Cacheable(cacheNames = "productById", key = "#id")
    public String getFromDbAndCache(Long id) {
        // Giả lập truy vấn DB
        return "product-" + id;
    }
}
```

```java
@RestController
@RequestMapping("/spring")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping("/set")
    public String set(@RequestParam String key, @RequestParam String value) {
        service.put(key, value);
        return "OK";
    }

    @GetMapping("/get")
    public String get(@RequestParam String key) {
        String value = service.get(key);
        return value != null ? value : "(null)";
    }

    @GetMapping("/cache")
    public String cache(@RequestParam Long id) {
        return service.getFromDbAndCache(id);
    }
}
```

---

## Quarkus + Redis (Redis Client)

### 1) Dependency (Maven)

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-redis-client</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-jackson</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cache</artifactId>
</dependency>
```

### 2) Cấu hình `application.properties`

```properties
quarkus.redis.hosts=redis://localhost:6379
quarkus.redis.timeout=2S
quarkus.http.port=8086
```

### 3) Service Redis với API đồng bộ

```java
@ApplicationScoped
public class ProductRedisService {

    @Inject
    RedisDataSource redisDataSource;

    private ValueCommands<String, String> value;

    void onStart(@Observes StartupEvent ev) {
        value = redisDataSource.value(String.class);
    }

    public void put(String key, String val) {
        value.setex("product:" + key, 1800, val); // 1800s = 30 phút
    }

    public String get(String key) {
        return value.get("product:" + key);
    }

    @CacheResult(cacheName = "productById")
    public String getFromDbAndCache(Long id) {
        // Giả lập truy vấn DB
        return "product-" + id;
    }
}
```

### 4) REST Resource mẫu

```java
@Path("/quarkus")
@Produces(MediaType.TEXT_PLAIN)
public class ProductResource {

    @Inject
    ProductRedisService service;

    @POST
    @Path("/set")
    public String set(@QueryParam("key") String key, @QueryParam("value") String value) {
        service.put(key, value);
        return "OK";
    }

    @GET
    @Path("/get")
    public String get(@QueryParam("key") String key) {
        String value = service.get(key);
        return value != null ? value : "(null)";
    }

    @GET
    @Path("/cache")
    public String cache(@QueryParam("id") Long id) {
        return service.getFromDbAndCache(id);
    }
}
```

---

## So sánh nhanh Spring vs Quarkus

| Tiêu chí | Spring Boot | Quarkus |
|----------|-------------|---------|
| Redis integration | `spring-boot-starter-data-redis` | `quarkus-redis-client` |
| Abstraction cache | `@Cacheable`, `@CacheEvict` | `@CacheResult`, `@CacheInvalidate` |
| Client chính | Lettuce (mặc định) | Vert.x Redis client |
| Hệ sinh thái | Rất rộng, enterprise phổ biến | Nhẹ, startup nhanh, native-friendly |

---

## Test nhanh bằng curl

### Spring

```bash
curl -X POST "http://localhost:8080/spring/set?key=hello&value=world"
curl "http://localhost:8080/spring/get?key=hello"
curl "http://localhost:8080/spring/cache?id=1001"
```

### Quarkus

```bash
curl -X POST "http://localhost:8086/quarkus/set?key=hello&value=world"
curl "http://localhost:8086/quarkus/get?key=hello"
curl "http://localhost:8086/quarkus/cache?id=1001"
```

---

## Lưu ý production

- Chuẩn hóa prefix key theo service/module.
- Bật TTL cho cache key, tránh memory phình.
- Thiết lập timeout + retry backoff ở client.
- Theo dõi hit ratio, latency, evicted keys.
- Với cluster, nếu có multi-key operation thì dùng hash tag `{}` để ép cùng slot.

---

**Liên quan:** [05-Spring-Data-Redis.md](./05-Spring-Data-Redis.md), [08-Operational-Checklist-Troubleshooting.md](./08-Operational-Checklist-Troubleshooting.md).
