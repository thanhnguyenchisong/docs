# Spring Data Redis - Câu hỏi phỏng vấn

## Mục lục
1. [Dependency và cấu hình](#dependency-và-cấu-hình)
2. [RedisTemplate và StringRedisTemplate](#redistemplate-và-stringredistemplate)
3. [Spring Cache với Redis](#spring-cache-với-redis)
4. [Serialization](#serialization)
5. [Connection Pool](#connection-pool)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Dependency và cấu hình

### Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### application.yml

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD:}
      database: 0
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
```

- **Lettuce** (mặc định Spring Boot 2.x): async, connection pool, phù hợp production.
- **Jedis**: Cũ hơn, có thể dùng; cần exclude Lettuce và thêm Jedis nếu muốn.

---

## RedisTemplate và StringRedisTemplate

### RedisTemplate&lt;K, V&gt;

- Generic: key và value có thể serialize (Object); mặc định dùng JDK serialization (value thường là byte[]).
- Dùng khi key/value là object (ví dụ entity); cần cấu hình serializer (JSON) để dễ đọc và tương thích.

```java
@Autowired
private RedisTemplate<String, User> userRedisTemplate;

userRedisTemplate.opsForValue().set("user:1", user, 1, TimeUnit.HOURS);
User u = userRedisTemplate.opsForValue().get("user:1");
userRedisTemplate.opsForHash().put("user:1:meta", "lastLogin", Instant.now().toString());
```

### StringRedisTemplate

- Key và value đều **String**; encoding UTF-8.
- Dùng khi key/value là string (session id, token, JSON string); không cần serializer object, dễ debug (redis-cli thấy rõ).

```java
@Autowired
private StringRedisTemplate stringRedisTemplate;

stringRedisTemplate.opsForValue().set("session:" + token, userId, 30, TimeUnit.MINUTES);
stringRedisTemplate.opsForValue().increment("rate:user:" + userId);
String json = stringRedisTemplate.opsForValue().get("user:1");
```

### Các ops

- **opsForValue()**: String (get/set/increment).
- **opsForList()**: List (leftPush, rightPop, range).
- **opsForSet()**: Set (add, members, intersect).
- **opsForZSet()**: Sorted Set (add, range, incrementScore).
- **opsForHash()**: Hash (put, get, entries).
- **opsForStream()**: Streams (Redis 5+).

---

## Spring Cache với Redis

### Bật cache

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
        return RedisCacheManager.builder(factory).cacheDefaults(config).build();
    }
}
```

### Dùng @Cacheable, @CacheEvict

```java
@Cacheable(value = "users", key = "#id")
public User getUser(Long id) {
    return userRepository.findById(id).orElseThrow();
}

@CacheEvict(value = "users", key = "#user.id")
public User updateUser(User user) {
    return userRepository.save(user);
}
```

- **value**: Tên cache (Redis dùng làm prefix key).
- **key**: SpEL expression → key cache (ví dụ `#id`, `#user.id`).
- **@CachePut**: Luôn gọi method và put vào cache (update cache).
- **@Caching**: Gộp nhiều @Cacheable/@CacheEvict.

---

## Serialization

### Vấn đề JDK default

- RedisTemplate mặc định dùng **JdkSerializationRedisSerializer** → value là byte[], không đọc được trong redis-cli; đổi JVM/class có thể không tương thích.

### Nên dùng

- **Key**: **StringRedisSerializer** — key luôn string, dễ đọc.
- **Value**: **GenericJackson2JsonRedisSerializer** (hoặc Jackson2JsonRedisSerializer cho từng type) — JSON, đọc được, đa ngôn ngữ.

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
    RedisTemplate<String, Object> t = new RedisTemplate<>();
    t.setConnectionFactory(factory);
    t.setKeySerializer(new StringRedisSerializer());
    t.setValueSerializer(new GenericJackson2JsonRedisSerializer());
    t.setHashKeySerializer(new StringRedisSerializer());
    t.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
    t.afterPropertiesSet();
    return t;
}
```

---

## Connection Pool

- **Lettuce** (mặc định): dùng **pool** qua `spring.data.redis.lettuce.pool`; max-active, max-idle, min-idle.
- Tránh mở quá nhiều connection (max-active vừa đủ với số thread/số instance).
- Cluster/Sentinel: cấu hình `spring.data.redis.cluster.nodes` hoặc `sentinel`; Lettuce hỗ trợ sẵn.

---

## Câu hỏi thường gặp

### RedisTemplate vs StringRedisTemplate?

- **RedisTemplate**: Key/value generic, cần cấu hình serializer (nên dùng String + JSON).
- **StringRedisTemplate**: Key/value đều String; đơn giản, dễ debug; phù hợp khi value là string/JSON string.

### Spring Cache với Redis — key format?

- Mặc định: `cacheName::key` (ví dụ `users::1`). Có thể tùy chỉnh qua `RedisCacheConfiguration` (key prefix, serializer).

### Lỗi serialization khi get từ Redis?

- Thường do đổi class (thêm/xóa field) hoặc dùng JDK serializer; chuyển sang **JSON serializer** và version type trong key hoặc namespace cache khi đổi cấu trúc.

---

**Tiếp theo:** [06-Clustering-Sentinel.md](./06-Clustering-Sentinel.md) — Redis Cluster và Sentinel.
