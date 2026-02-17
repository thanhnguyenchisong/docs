# Caching Patterns - Câu hỏi phỏng vấn Redis

## Mục lục
1. [Cache-aside (Lazy Loading)](#cache-aside-lazy-loading)
2. [Write-through và Write-behind](#write-through-và-write-behind)
3. [Cache Invalidation và TTL](#cache-invalidation-và-ttl)
4. [Thundering Herd / Cache Stampede](#thundering-herd--cache-stampede)
5. [Best Practices](#best-practices)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Cache-aside (Lazy Loading)

### Cách hoạt động

- **Đọc**: Đọc cache trước; **cache hit** → trả về; **cache miss** → đọc DB, ghi vào cache, trả về.
- **Ghi**: Ghi vào DB, sau đó **xóa** (hoặc cập nhật) cache tương ứng để lần đọc sau sẽ load lại từ DB.

### Ưu điểm

- Cache chỉ chứa data thực sự được đọc (không cần preload toàn bộ).
- DB là source of truth; cache có thể xóa bất kỳ lúc nào.

### Nhược điểm

- Cache miss → latency tăng (phải đọc DB); nhiều miss đồng thời → **thundering herd** (xem dưới).

### Code mẫu (ý tưởng)

```java
public User getUser(Long id) {
    String key = "user:" + id;
    User cached = redis.get(key);
    if (cached != null) return cached;
    User user = db.findById(id);
    if (user != null) redis.setex(key, 3600, user);
    return user;
}
public void updateUser(User user) {
    db.save(user);
    redis.del("user:" + user.getId());  // invalidate
}
```

---

## Write-through và Write-behind

### Write-through

- Mỗi lần ghi: ghi vào **cache + DB** (hoặc ghi DB rồi cập nhật cache). Đọc luôn từ cache khi hit.
- **Ưu**: Cache luôn đồng bộ với DB cho phần đã ghi. **Nhược**: Mỗi write phải ghi DB → latency write cao.

### Write-behind (Write-back)

- Ghi vào cache trước, trả lời client; sau đó **async** ghi xuống DB.
- **Ưu**: Write latency thấp. **Nhược**: Có thể mất data nếu cache chết trước khi flush; phức tạp (batch, retry, order).

→ **Cache-aside** là pattern phổ biến nhất; write-through/write-behind thường dùng khi có layer cache riêng (e.g. application cache với queue flush).

---

## Cache Invalidation và TTL

### Invalidation

- **Invalidate (xóa)** key khi data thay đổi ở DB → lần đọc sau sẽ miss và load lại từ DB (cache-aside).
- **Update cache** thay vì xóa: có thể dùng khi logic đơn giản, tránh race (nhiều request cùng update có thể gây inconsistency).

### TTL (Time To Live)

- Mỗi key có **TTL** (ví dụ SETEX, EXPIRE) → sau thời gian tự xóa. Giảm data “cũ” tồn tại mãi, giới hạn memory.
- **Trade-off**: TTL ngắn → miss nhiều, DB tải cao; TTL dài → data cũ lâu mới hết hạn. Cân bằng theo use case.

### Kết hợp

- Invalidate khi có write (hoặc event); TTL là “safety net” cho key quên invalidate hoặc khi DB thay đổi từ nguồn khác.

---

## Thundering Herd / Cache Stampede

### Vấn đề

- Một key **hết hạn** hoặc bị xóa; **nhiều request** cùng lúc miss → **cùng lúc** gọi DB và cùng ghi lại cache → DB và CPU spike.

### Giảm thiểu

1. **Lock (distributed lock)**: Chỉ một request được phép load từ DB và set cache; request khác chờ hoặc retry đọc cache.
2. **Probabilistic early expiration**: Gần hết TTL thì một phần request (xác suất) refresh cache trước thay vì đợi hết hạn rồi tất cả cùng load.
3. **Background refresh**: Worker/job định kỳ refresh key quan trọng trước khi hết TTL.
4. **TTL jitter**: Thêm random vào TTL để các key không hết hạn cùng lúc.

### Ví dụ lock (ý tưởng)

```java
String key = "user:" + id;
if (redis.set(key + ":lock", "1", "NX", "EX", 10)) {
    try {
        User user = db.findById(id);
        redis.setex(key, 3600, user);
        return user;
    } finally {
        redis.del(key + ":lock");
    }
}
Thread.sleep(50);
return getUser(id);  // retry read cache
```

---

## Best Practices

- **Key naming**: Thống nhất (ví dụ `resource:id`, `session:token`), tránh conflict.
- **TTL**: Luôn set TTL cho key cache để tránh memory leak.
- **Serialization**: Chọn format (JSON, MessagePack, ...) và size hợp lý; tránh cache object quá lớn không cần thiết.
- **Monitoring**: Hit rate, latency, memory; cảnh báo khi hit rate giảm hoặc latency tăng.
- **Không cache mọi thứ**: Chỉ cache data đọc nhiều, ít thay đổi; data real-time hoặc luôn mới có thể không cần cache.

---

## Câu hỏi thường gặp

### Khi nào invalidate, khi nào update cache?

- **Invalidate**: Đơn giản, ít lỗi logic; data lần đọc sau luôn từ DB. Nên dùng khi không chắc logic update phức tạp (nhiều nguồn ghi).
- **Update cache**: Giảm miss ngay sau write; cần đảm bảo thứ tự và consistency (race condition).

### Cache-aside vs Write-through trong phỏng vấn?

- **Cache-aside**: App chủ động đọc cache/DB và ghi cache; DB là source of truth; phổ biến.
- **Write-through**: Mỗi write cập nhật cả cache và DB; cache luôn đồng bộ với DB cho phần đã ghi; thường do cache layer (e.g. Coherence) đảm nhiệm.

### Thundering herd xử lý thế nào?

- Dùng **lock** (distributed lock) để chỉ một request load DB và set cache; các request khác đợi hoặc retry đọc cache. Có thể kết hợp **TTL jitter** và **early refresh** để giảm spike.

---

**Tiếp theo:** [05-Spring-Data-Redis.md](./05-Spring-Data-Redis.md) — RedisTemplate, Spring Cache.
