# Redis Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Redis là gì?](#redis-là-gì)
2. [In-Memory Data Store](#in-memory-data-store)
3. [Redis vs Memcached vs Database](#redis-vs-memcached-vs-database)
4. [Use Cases](#use-cases)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Redis là gì?

### Định nghĩa

**Redis** (REmote DIctionary Server) là **in-memory data structure store**, dùng làm **database, cache, message broker**. Redis lưu data trong RAM nên tốc độ đọc/ghi rất cao (microsecond latency).

### Key Features

1. **In-Memory**: Data chủ yếu trong RAM → latency thấp
2. **Data Structures**: Không chỉ key-value; hỗ trợ String, List, Set, Sorted Set, Hash, Bitmap, Streams...
3. **Persistence**: RDB snapshot và/hoặc AOF (append-only file) để không mất data khi restart
4. **Replication**: Master-replica, hỗ trợ đọc scale (read replica)
5. **High Availability**: Redis Sentinel (auto failover), Redis Cluster (sharding)
6. **Pub/Sub**: Message broker đơn giản
7. **Single-threaded**: Command xử lý đơn luồng (tránh lock), I/O đa luồng (Redis 6+)

### Kiến trúc đơn giản

```
Client ──► Redis Server (single-threaded command execution)
              │
              ├── In-Memory Data Structures
              ├── Optional: RDB / AOF (persistence)
              └── Optional: Replica(s)
```

---

## In-Memory Data Store

### Ưu điểm

- **Latency cực thấp**: Microsecond (RAM) so với millisecond (disk/network DB)
- **Throughput cao**: Hàng trăm nghìn ops/s trên single instance
- **Đơn giản**: Không cần schema, dễ mở rộng key-value và các structure

### Hạn chế

- **RAM giới hạn**: Data lớn → tốn RAM, chi phí cao
- **Durability**: Mặc định in-memory; cần RDB/AOF nếu không muốn mất data khi crash
- **Single point**: Một instance = một luồng xử lý lệnh (Redis 6+ có I/O threads)

### Khi nào dùng in-memory

- **Cache**: Giảm tải DB, tăng tốc đọc
- **Session store**: Session web, token
- **Rate limiting**: Đếm request theo key (user/IP)
- **Real-time**: Leaderboard, ranking (Sorted Set), real-time analytics
- **Pub/Sub**: Notification, real-time message đơn giản

---

## Redis vs Memcached vs Database

### Redis vs Memcached

| Feature | Redis | Memcached |
|--------|--------|-----------|
| **Data structures** | String, List, Set, Hash, Sorted Set, Streams... | Chỉ key-value (string/blob) |
| **Persistence** | RDB, AOF | Không (chỉ in-memory) |
| **Replication** | Có (master-replica) | Không |
| **Pub/Sub** | Có | Không |
| **Lua scripting** | Có | Không |
| **Use case** | Cache + session + ranking + broker... | Cache đơn thuần |
| **Thread model** | Single-threaded (command) | Multi-threaded |

→ **Redis** linh hoạt hơn; **Memcached** đơn giản, throughput cao cho cache thuần key-value.

### Redis vs Database (MySQL, PostgreSQL)

| Feature | Redis | DB (SQL) |
|--------|--------|----------|
| **Storage** | In-memory (có thể persist) | Disk (có buffer/cache) |
| **Latency** | Microsecond | Millisecond |
| **Data model** | Key-structure (no schema) | Table, schema, relations |
| **Query** | Key/pattern, structure ops | SQL, join, index |
| **Durability** | Tùy cấu hình (RDB/AOF) | ACID, durable |
| **Use case** | Cache, session, real-time, queue | Source of truth, transactional |

→ Redis **không thay thế** DB cho data cần durability và query phức tạp; dùng **kèm** DB (cache, session, real-time).

---

## Use Cases

### 1. Cache (Cache-aside)

- Lưu kết quả query DB vào Redis; lần sau đọc từ Redis, miss thì đọc DB rồi set lại cache.
- Giảm tải DB, giảm latency.

### 2. Session Store

- Lưu session (user login, cart) trong Redis; stateless app server đọc session từ Redis.
- Shared session khi scale nhiều app server.

### 3. Rate Limiting

- Key = user/id hoặc IP, value = counter; INCR + EXPIRE (sliding window hoặc fixed window).
- Chống abuse, giới hạn request/giây.

### 4. Leaderboard / Ranking

- Sorted Set: member = user/product, score = điểm; ZRANGE/ZREVRANGE để lấy top N.

### 5. Pub/Sub

- PUBLISH/SUBSCRIBE cho notification, real-time message đơn giản (không lưu message, không replay).

### 6. Distributed Lock

- SET key value NX EX timeout → chỉ một client giữ lock; release bằng DEL hoặc Lua script.

### 7. Message Queue (đơn giản)

- List: LPUSH/RPOP hoặc BRPOP (blocking); Streams (Redis 5+) cho consumer group, ack.

---

## Câu hỏi thường gặp

### Redis single-threaded có chậm không?

- **Command execution** là single-threaded → không lock, đơn giản, latency ổn định.
- **I/O** (network, disk) có thể dùng multiple I/O threads (Redis 6+).
- Với workload điển hình (cache, session), single thread đủ; scale bằng **nhiều instance** (Cluster) hoặc **replica** (đọc).

### Redis có phải database không?

- Có persistence (RDB, AOF) nên có thể dùng như **store**; nhưng thường dùng làm **cache/session/real-time** bên cạnh DB chính.
- Không thay DB khi cần ACID, query phức tạp, schema.

### Redis dùng port mặc định?

- **6379** (TCP).

### Redis có hỗ trợ SSL/TLS không?

- Có (Redis 6+); cấu hình `tls-port` và certificates. Production nên dùng TLS + auth.

---

**Tiếp theo:** [02-Data-Structures.md](./02-Data-Structures.md) — Các cấu trúc dữ liệu Redis và khi nào dùng.
