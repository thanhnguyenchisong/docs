# Case Studies Thực Tế — Kinh Nghiệm Xử Lý Triệu Request

## Mục lục
1. [Flash Sale (E-commerce)](#flash-sale-e-commerce)
2. [Live Streaming Platform](#live-streaming-platform)
3. [Payment System](#payment-system)
4. [Social Media Feed](#social-media-feed)
5. [Bài Học Rút Ra](#bài-học-rút-ra)

---

## Flash Sale (E-commerce)

### Bối cảnh
- **Sản phẩm**: 1,000 items giảm giá 90%
- **Users online**: 5 triệu
- **Peak RPS**: 3-5M (đúng giây mở sale)
- **Window**: 2 phút (items hết trong 30 giây - 2 phút)

### Kiến trúc xử lý

```
                        CDN (cache product pages)
                               │
                    ┌──────────┴──────────┐
                    │   API Gateway       │  Rate limit: 50 req/s/user
                    │   (Kong + Redis)    │  Block bots (CAPTCHA)
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        Product API         Cart API        Order API
        (cache-heavy)      (Redis atomic)   (queue-based)
              │                │                │
              │           ┌────┴────┐     ┌─────┴─────┐
              │           │ Redis   │     │   Kafka   │
              │           │ Stock   │     │ Order     │
              │           │ Counter │     │ Queue     │
              │           └─────────┘     └─────┬─────┘
              │                                  │
              │                           Order Processor
              │                           (async, batch)
              │                                  │
              └──────────────────────────────────┘
                                │
                           PostgreSQL
                      (write-behind, batch)
```

### Xử lý stock (tồn kho)

```java
// Redis atomic decrement — KHÔNG dùng DB cho stock check
@Service
public class StockService {
    // Trước sale: LOAD stock vào Redis
    // SET stock:product:123 1000

    public boolean reserveStock(Long productId, int quantity) {
        String key = "stock:product:" + productId;

        // Lua script: atomic check + decrement
        String luaScript = """
            local stock = tonumber(redis.call('GET', KEYS[1]))
            if stock == nil then return -1 end
            if stock >= tonumber(ARGV[1]) then
                redis.call('DECRBY', KEYS[1], ARGV[1])
                return 1
            end
            return 0
        """;

        Long result = redis.execute(
            new DefaultRedisScript<>(luaScript, Long.class),
            List.of(key), String.valueOf(quantity)
        );

        if (result == 1) {
            // Stock reserved → gửi event để ghi DB async
            kafka.send("stock-events", new StockReservedEvent(productId, quantity));
            return true;
        }
        return false;  // Hết hàng
    }
}
```

### Kết quả

```
- Peak 3.2M RPS xử lý thành công
- 99.9% requests < 100ms response time
- 0 overselling (Redis atomic guarantee)
- Stock hết trong 47 giây
- DB writes: batch 5,000/s (async) thay vì 3.2M/s
```

### Bài học

1. **Pre-load** tất cả hot data vào Redis TRƯỚC sale
2. **Stock check ở Redis** (atomic), KHÔNG ở DB
3. **Order processing async** (Kafka) — response ngay "Đang xử lý"
4. **Rate limit chặt** — 50 req/s/user, CAPTCHA cho bot
5. **Pre-scale** K8s 30 phút trước, scale DOWN chậm 1 giờ sau

---

## Live Streaming Platform

### Bối cảnh
- **Viewers**: 2 triệu đồng thời trên 1 stream
- **Chat messages**: 50,000 msg/s
- **Reactions (like/heart)**: 200,000/s
- **Concurrent streams**: 5,000

### Kiến trúc

```
Viewers → CDN Edge (video segments HLS/DASH)
       → WebSocket Gateway → Chat Service → Redis Pub/Sub
       → HTTP API → Reaction Aggregator → Redis (batch write DB)
```

### Chat at scale

```java
// Redis Pub/Sub + WebSocket
// Mỗi stream = 1 Redis channel
// Viewers subscribe qua WebSocket

@Component
public class ChatService {
    // Không lưu TỪNG message vào DB real-time
    // Buffer trong Redis List → batch write mỗi 5s

    public void sendMessage(String streamId, ChatMessage msg) {
        String channel = "chat:" + streamId;
        String buffer = "chatbuf:" + streamId;

        // Publish cho real-time delivery
        redis.convertAndSend(channel, serialize(msg));

        // Buffer cho persistence (async)
        redis.opsForList().rightPush(buffer, serialize(msg));
    }

    // Mỗi 5 giây: flush buffer → DB (batch insert)
    @Scheduled(fixedRate = 5000)
    public void flushChatToDB() {
        // Pop all buffered messages → batch insert MongoDB
    }
}
```

### Reactions aggregation

```java
// 200K reactions/s → KHÔNG ghi DB mỗi reaction
// Aggregate trong Redis → flush mỗi 10s

public void addReaction(String streamId, String type) {
    // Redis HINCRBY: atomic increment
    redis.opsForHash().increment("reactions:" + streamId, type, 1);
    // type = "like", "heart", "wow"
}

// Broadcast aggregated counts mỗi 2s
@Scheduled(fixedRate = 2000)
public void broadcastReactions() {
    // Đọc counters từ Redis → gửi qua WebSocket cho viewers
}
```

---

## Payment System

### Bối cảnh
- **Transactions**: 100K TPS (transactions per second)
- **Requirement**: ZERO data loss, exactly-once processing
- **Latency**: p99 < 500ms

### Kiến trúc

```
Client → API Gateway → Payment Service → DB (PostgreSQL, ACID)
                                       → Kafka (event log)
                                       → Payment Gateway (Visa, MasterCard)
```

### Idempotency — tối quan trọng

```java
@Service
public class PaymentService {

    @Transactional
    public PaymentResult processPayment(PaymentRequest request) {
        // 1. Idempotency check — tránh charge 2 lần
        String idempotencyKey = request.getIdempotencyKey();
        Optional<Payment> existing = paymentRepo.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return existing.get().toResult();  // Đã xử lý → trả kết quả cũ
        }

        // 2. Create payment record (PENDING)
        Payment payment = new Payment();
        payment.setIdempotencyKey(idempotencyKey);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(request.getAmount());
        paymentRepo.save(payment);

        try {
            // 3. Gọi payment gateway
            GatewayResponse response = paymentGateway.charge(request);

            // 4. Update status
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setGatewayRef(response.getRef());
            paymentRepo.save(payment);

            // 5. Publish event (Outbox pattern)
            outboxRepo.save(new OutboxEvent("payment-events",
                payment.getId().toString(),
                "PaymentCompleted",
                serialize(payment)));

            return payment.toResult();
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailReason(e.getMessage());
            paymentRepo.save(payment);
            throw e;
        }
    }
}
```

### Database cho Payment

```sql
-- Idempotency key UNIQUE → tránh duplicate
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    gateway_ref VARCHAR(255),
    fail_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index cho query phổ biến
CREATE INDEX idx_payments_user_status ON payments (user_id, status);
CREATE INDEX idx_payments_created ON payments (created_at DESC);
```

---

## Social Media Feed

### Bối cảnh
- **Users**: 100M registered, 10M DAU
- **Posts**: 500K new posts/day
- **Feed reads**: 50M feeds/day (peak 10K feeds/s)
- **Requirement**: Feed load < 200ms

### Fan-out approaches

**Fan-out on Write (Push model)**
```
User A post → push vào timeline của TẤT CẢ followers
  A có 1000 followers → 1000 writes vào timeline cache

Pro: Feed read cực nhanh (pre-computed)
Con: Celebrity problem (10M followers → 10M writes/post)
```

**Fan-out on Read (Pull model)**  
```
User B mở feed → query posts từ tất cả followees
  B follow 500 users → merge + sort 500 timelines

Pro: Write nhanh, simple
Con: Feed read chậm (500 queries + merge)
```

**Hybrid (thực tế)**
```
Normal users (< 10K followers): Fan-out on Write
Celebrities (> 10K followers): Fan-out on Read

Feed = Pre-computed timeline + Merge celebrity posts on-read
```

---

## Bài Học Rút Ra

### 1. "Mọi thứ đều sẽ hỏng" (Everything fails)
- Server crash, network partition, disk full, dependency timeout
- **Design for failure**: circuit breaker, retry, fallback, graceful degradation

### 2. "Peak traffic gấp 3-10x average"
- Đừng design cho average → design cho peak
- Pre-scale trước events, auto-scale cho unexpected spikes

### 3. "Database là cổ chai cuối cùng"
- Cache giảm 90% reads
- Async + message queue giảm writes
- Sharding khi single node không đủ

### 4. "Simple > Perfect"
- Simple solution chạy được > perfect solution chưa build xong
- Start simple → measure → optimize bottleneck

### 5. "Monitor first, optimize second"
- Không monitor = không biết bottleneck ở đâu
- **RED** (Rate, Error, Duration) cho mọi service
- Alert TRƯỚC khi user phàn nàn

---

**Tiếp theo:** [10-Interview-Checklist.md](./10-Interview-Checklist.md)
