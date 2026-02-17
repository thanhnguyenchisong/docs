# Redis Data Structures - Câu hỏi phỏng vấn

## Mục lục
1. [String](#string)
2. [List](#list)
3. [Set](#set)
4. [Sorted Set](#sorted-set)
5. [Hash](#hash)
6. [Bitmap, HyperLogLog, Streams](#bitmap-hyperloglog-streams)
7. [Khi nào dùng cấu trúc nào](#khi-nào-dùng-cấu-trúc-nào)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## String

- **Kiểu**: Key → value (string, số, binary; max 512MB).
- **Commands**: SET, GET, SETEX (set + TTL), INCR, INCRBY, DECR, MSET, MGET.
- **Use case**: Cache object (serialize JSON), counter (rate limit, view count), session, distributed lock (SET key value NX EX).

```bash
SET user:1001 '{"name":"Alice","age":30}'
GET user:1001
SETEX session:abc 3600 "userId=1001"
INCR rate:ip:192.168.1.1
```

---

## List

- **Kiểu**: Danh sách có thứ tự, cho phép trùng; head/tail insert/pop.
- **Commands**: LPUSH, RPUSH, LPOP, RPOP, LRANGE, BLPOP/BRPOP (blocking), LTRIM.
- **Use case**: Queue (LPUSH + BRPOP), recent list (LTRIM 0 99), feed.

```bash
LPUSH queue:tasks '{"id":1}'
BRPOP queue:tasks 30
LRANGE recent:users 0 9
LTRIM recent:users 0 99
```

---

## Set

- **Kiểu**: Tập hợp không thứ tự, **không trùng** phần tử.
- **Commands**: SADD, SREM, SMEMBERS, SISMEMBER, SINTER, SUNION, SCARD.
- **Use case**: Tag, danh sách unique (user IDs đã xem), intersection/union (common tags).

```bash
SADD product:100:tags "sale" "electronics"
SISMEMBER product:100:tags "sale"
SINTER user:1:tags user:2:tags
```

---

## Sorted Set

- **Kiểu**: Set có **score** (số); phần tử sắp xếp theo score, có thứ hạng.
- **Commands**: ZADD, ZRANGE, ZREVRANGE, ZRANK, ZREVRANK, ZSCORE, ZINCRBY, ZREM.
- **Use case**: Leaderboard, ranking, priority queue, time-series (score = timestamp).

```bash
ZADD leaderboard 100 "user:1" 200 "user:2" 150 "user:3"
ZREVRANGE leaderboard 0 9 WITHSCORES
ZINCRBY leaderboard 50 "user:1"
```

---

## Hash

- **Kiểu**: Key → map (field-value); nhiều field trong một key.
- **Commands**: HSET, HGET, HGETALL, HMGET, HINCRBY, HDEL.
- **Use case**: Object (user profile: field = name, email, age); giảm số key so với String từng field; partial update (HSET một field).

```bash
HSET user:1001 name "Alice" email "alice@example.com" age 30
HGET user:1001 name
HINCRBY user:1001 age 1
```

---

## Bitmap, HyperLogLog, Streams

### Bitmap

- **Thực chất**: String nhưng thao tác theo bit (SETBIT, GETBIT, BITCOUNT, BITOP).
- **Use case**: Flag theo offset (user id = offset), presence (online/offline), analytics (active user theo ngày).

### HyperLogLog

- **Commands**: PFADD, PFCOUNT, PFMERGE.
- **Use case**: Đếm **cardinality** (số phần tử unique) gần đúng, rất ít bộ nhớ; không lấy lại từng phần tử (ví dụ: unique visitor).

### Streams (Redis 5+)

- **Kiểu**: Log append-only; message có ID, field-value; consumer groups.
- **Commands**: XADD, XREAD, XREADGROUP, XACK, XRANGE.
- **Use case**: Message queue với nhiều consumer, replay, ack (thay List khi cần persistence và consumer group).

---

## Khi nào dùng cấu trúc nào

| Nhu cầu | Cấu trúc gợi ý |
|---------|-----------------|
| Cache object, session, lock | **String** (hoặc Hash nếu nhiều field cần update riêng) |
| Counter, rate limit | **String** (INCR) |
| Queue đơn giản (FIFO) | **List** (LPUSH + BRPOP) |
| Unique collection, tags | **Set** |
| Leaderboard, ranking, priority | **Sorted Set** |
| Object nhiều field, partial update | **Hash** |
| Unique count (cardinality) | **HyperLogLog** |
| Message queue có consumer group | **Streams** |
| Bit flag theo offset | **Bitmap** |

---

## Câu hỏi thường gặp

### String vs Hash khi cache object?

- **String**: Một key một value; serialize cả object (JSON); get/set cả object.
- **Hash**: Một key nhiều field; get/set từng field (HGET/HSET); tiết kiệm key, thuận lợi partial update. Object nhiều field, hay đổi từng phần → Hash.

### List vs Streams cho queue?

- **List**: Đơn giản; message pop xong không còn; một consumer (hoặc competing consumer bằng BRPOP).
- **Streams**: Consumer group, ack, pending list; có thể replay; phù hợp queue cần reliability và nhiều consumer.

### Sorted Set score trùng thì sao?

- Phần tử vẫn unique (member); score trùng thì thứ tự giữa chúng không xác định (lexicographic theo member).

---

**Tiếp theo:** [03-Persistence-Replication.md](./03-Persistence-Replication.md) — RDB, AOF và Replication.
