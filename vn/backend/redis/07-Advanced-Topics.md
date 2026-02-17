# Advanced Topics - Câu hỏi phỏng vấn Redis

## Mục lục
1. [Pub/Sub](#pubsub)
2. [Lua Scripting](#lua-scripting)
3. [Transactions](#transactions)
4. [Pipeline](#pipeline)
5. [Performance và Best Practices](#performance-và-best-practices)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Pub/Sub

### Cơ chế

- **Publisher**: PUBLISH channel message.
- **Subscriber**: SUBSCRIBE channel (có thể nhiều channel); nhận mọi message publish vào channel đó.
- **Pattern**: PSUBSCRIBE pattern (ví dụ `news:*`) để subscribe nhiều channel match pattern.

### Đặc điểm

- **Fire-and-forget**: Message không được lưu; subscriber offline thì mất.
- **Không phải queue**: Nhiều subscriber = mỗi subscriber nhận bản copy (broadcast), không chia tải.
- **Use case**: Notification real-time, broadcast config/event; không dùng khi cần persistence hay queue (dùng Streams/List).

```bash
# Terminal 1
SUBSCRIBE orders

# Terminal 2
PUBLISH orders "order-123 created"
```

---

## Lua Scripting

### Mục đích

- Chạy **nhiều lệnh** trên Redis **nguyên tử** (script chạy như một đơn vị, không bị chen lệnh từ client khác).
- Logic phức tạp (if/else, loop) gần data, giảm round-trip.

### EVAL / EVALSHA

- **EVAL script numkeys key [key ...] arg [arg ...]**: Chạy script; key và arg truyền vào.
- **EVALSHA sha1**: Chạy script đã load (SCRIPT LOAD) bằng hash — giảm bandwidth.

### Ví dụ: Rate limit (sliding window ý tưởng)

```lua
-- KEYS[1] = rate:user:123, ARGV[1] = window (seconds), ARGV[2] = limit
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
  return 0
end
return 1
```

### Lưu ý

- Script nên **ngắn**, không block lâu (Redis single-threaded).
- Không nên gọi key không liên quan (nếu dùng Cluster, key phải cùng slot).

---

## Transactions

### MULTI / EXEC

- **MULTI**: Bắt đầu transaction; các lệnh sau được queue.
- **EXEC**: Thực thi tất cả lệnh đã queue theo thứ tự; nguyên tử (không có lệnh client khác chen vào giữa).
- **DISCARD**: Hủy queue, không chạy.

### Không rollback

- Redis **không rollback** khi một lệnh trong transaction lỗi (ví dụ sai type); các lệnh khác vẫn chạy. Phải kiểm tra từng reply sau EXEC.
- **WATCH key**: Optimistic lock; nếu key bị đổi trước EXEC thì EXEC thất bại; client retry.

```bash
WATCH balance:1
MULTI
DECRBY balance:1 100
INCRBY balance:2 100
EXEC
```

---

## Pipeline

### Mục đích

- Gửi **nhiều lệnh** liên tiếp **không đợi** reply từng lệnh; Redis xử lý và trả reply theo batch → giảm round-trip (RTT).

### Cách dùng

- Client: gửi nhiều command; nhận nhiều reply (thứ tự tương ứng).
- **Không nguyên tử**: Khác transaction; lệnh của client khác có thể chen vào giữa.

### Khi nào dùng

- Cần throughput cao (ví dụ load data, batch get/set); chấp nhận không nguyên tử.
- Transaction khi cần nguyên tử (và có thể dùng WATCH).

```java
// Spring: executePipelined
redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
    for (String key : keys) {
        connection.get(key.getBytes());
    }
    return null;
});
```

---

## Performance và Best Practices

### Key design

- Key ngắn nhưng đủ nghĩa (tiết kiệm memory); naming nhất quán (ví dụ `type:id`).
- **Hash tag** trong Cluster khi cần multi-key cùng slot.

### TTL

- Luôn set **TTL** cho key cache để tránh memory tăng vô hạn.

### Tránh key lớn

- Value quá lớn (big string, big list) → block Redis (single-threaded); nên chia nhỏ hoặc nén.

### Tránh KEYS *

- **KEYS *** scan toàn bộ → block. Dùng **SCAN** (cursor) để iterate key trong production.

### Connection

- Dùng **connection pool** (Lettuce pool); tránh mở connection mới mỗi request.

### Monitoring

- **INFO**, **SLOWLOG**: Theo dõi memory, hit rate, slow command.
- **Latency**: PING, monitor latency từ client.

### Security

- **AUTH** (password); **TLS** (Redis 6+); bind IP, disable lệnh nguy hiểm (CONFIG, FLUSHALL) nếu cần.

---

## Câu hỏi thường gặp

### Pub/Sub vs Streams?

- **Pub/Sub**: Không lưu message; subscriber offline mất; broadcast. **Streams**: Lưu message, consumer group, ack, replay — dùng khi cần queue có persistence và nhiều consumer.

### Lua script có block Redis không?

- Có. Script chạy đến hết mới xử lý lệnh khác. Script chậm hoặc vòng lặp lớn → block toàn bộ. Nên viết script ngắn gọn.

### Pipeline có đảm bảo nguyên tử không?

- Không. Chỉ gộp gửi/nhận để giảm RTT; các lệnh vẫn có thể xen với lệnh client khác. Cần nguyên tử thì dùng MULTI/EXEC (và WATCH nếu cần optimistic lock).

---

**Kết thúc bộ Redis.** Quay lại [README](./README.md) hoặc [MASTER-BACKEND-CHECKLIST](../MASTER-BACKEND-CHECKLIST.md).
