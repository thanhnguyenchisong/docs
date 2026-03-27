# Advanced Topics - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Quorum Queues (RabbitMQ 3.8+)](#quorum-queues)
2. [Streams (RabbitMQ 3.9+)](#streams)
3. [Lazy Queues](#lazy-queues)
4. [Delayed Messages](#delayed-messages)
5. [Shovel & Federation](#shovel--federation)
6. [Alternate Exchange](#alternate-exchange)
7. [Consistent Hash Exchange](#consistent-hash-exchange)
8. [Security chuyên sâu](#security-chuyên-sâu)
9. [Virtual Hosts & Multi-tenancy](#virtual-hosts--multi-tenancy)
10. [Exactly-once & Idempotency](#exactly-once--idempotency)
11. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Quorum Queues

### Tại sao Quorum Queue?

**Classic Mirrored Queues** (cũ) có nhiều vấn đề:
- Synchronization blocking — khi mirror node rejoins, queue bị block
- Split-brain dễ xảy ra
- Không đảm bảo data safety tốt
- **Deprecated từ RabbitMQ 3.13, sẽ bị xóa**

**Quorum Queues** (RabbitMQ 3.8+) dựa trên **Raft consensus protocol**:
- Strong consistency — leader-based replication
- Automatic leader election khi node down
- Không block khi replica rejoins
- **Khuyến nghị cho production**

### Architecture

```
┌──────────────────────────────────────────────────┐
│                Quorum Queue "orders"               │
│                                                    │
│  Node 1 (LEADER)    Node 2 (FOLLOWER)    Node 3  │
│  ┌──────────┐       ┌──────────┐       ┌────────┐│
│  │ msg 1    │  ──►  │ msg 1    │  ──►  │ msg 1  ││
│  │ msg 2    │  ──►  │ msg 2    │  ──►  │ msg 2  ││
│  │ msg 3    │       │ msg 3    │       │ msg 3  ││
│  └──────────┘       └──────────┘       └────────┘│
│                                                    │
│  Write: Chỉ ghi vào Leader                        │
│  Commit: Khi majority (2/3) nodes xác nhận        │
│  Read: Từ Leader (hoặc follower nếu allow)        │
└──────────────────────────────────────────────────┘
```

### Khai báo Quorum Queue

```java
// Spring AMQP
@Bean
public Queue orderQueue() {
    return QueueBuilder.durable("order-queue")
        .quorum()                          // ← Quorum Queue
        .deliveryLimit(5)                  // Max delivery attempts trước khi DLQ
        .build();
}

// Hoặc với arguments
@Bean
public Queue orderQueue() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-queue-type", "quorum");                // Quorum type
    args.put("x-delivery-limit", 5);                   // Max retries
    args.put("x-dead-letter-exchange", "dlx");         // DLQ
    args.put("x-dead-letter-routing-key", "order.failed");
    args.put("x-quorum-initial-group-size", 3);        // Số replicas ban đầu
    return new Queue("order-queue", true, false, false, args);
}
```

### Quorum vs Classic Queue

| Tiêu chí | Classic (Mirrored) | Quorum Queue |
| :--- | :--- | :--- |
| **Replication** | Mirroring (async, có thể mất data) | Raft consensus (strong consistency) |
| **Leader Election** | Thủ công / chậm | Tự động, nhanh (Raft) |
| **Data Safety** | Có thể mất messages khi failover | Messages **không bao giờ** mất (majority ack) |
| **Sync khi rejoin** | Blocking (queue bị pause) | Non-blocking (Raft log replay) |
| **Memory** | Tất cả messages trong RAM | Có thể overflow sang disk |
| **Non-durable** | Hỗ trợ | **Không** — luôn durable |
| **Priority** | Hỗ trợ | **Không** hỗ trợ |
| **Exclusive** | Hỗ trợ | **Không** hỗ trợ |
| **Poison Message** | Không có delivery limit | **Có** x-delivery-limit |
| **Status** | Deprecated (3.13+) | **Recommended** |

### Delivery Limit (Poison Message Handling)

```java
// Quorum Queue tự động đếm số lần delivery
// Sau x-delivery-limit lần → gửi sang DLQ (nếu configured)
// KHÔNG cần code retry logic trong consumer!

// Ví dụ: delivery-limit = 3
// Lần 1: Consumer nhận → throw exception → NACK(requeue=true) → message quay lại
// Lần 2: Consumer nhận → throw exception → NACK(requeue=true) → message quay lại  
// Lần 3: Consumer nhận → throw exception → NACK(requeue=true) → ĐẠT LIMIT
// → RabbitMQ tự động gửi sang DLQ (dead-letter-exchange)
```

---

## Streams

### RabbitMQ Streams là gì?

**Streams** (RabbitMQ 3.9+) là kiểu queue mới, lấy cảm hứng từ **Kafka**:
- **Append-only log** — messages không bị xóa sau khi consume
- **Multiple consumers** có thể đọc cùng stream từ vị trí khác nhau (offset)
- **Time-based/Offset-based** replay — đọc lại messages từ quá khứ
- **Throughput rất cao** — optimized cho sequential write/read

### Khi nào dùng Stream vs Queue?

| Tiêu chí | Queue (Classic/Quorum) | Stream |
| :--- | :--- | :--- |
| **Message delivery** | Mỗi message giao 1 consumer | Nhiều consumers đọc cùng message |
| **Sau khi consume** | Message bị xóa khỏi queue | Message **vẫn còn** trong log |
| **Replay** | Không | **Có** — đọc lại từ offset/timestamp |
| **Use case** | Task queue, RPC | Event sourcing, audit log, analytics |
| **Ordering** | FIFO per queue | FIFO per partition |
| **Throughput** | Tốt | **Rất cao** (append-only) |

### Khai báo Stream

```java
// Spring AMQP (RabbitMQ 3.9+)
@Bean
public Queue eventStream() {
    return QueueBuilder.durable("events")
        .stream()                                     // ← Stream type
        .withArgument("x-max-length-bytes", 20_000_000_000L)  // 20 GB retention
        .withArgument("x-max-age", "7D")              // Giữ 7 ngày
        .withArgument("x-stream-max-segment-size-bytes", 500_000_000)  // 500 MB/segment
        .build();
}
```

### Consumer đọc từ offset

```java
// Đọc từ đầu stream (replay toàn bộ)
@RabbitListener(queues = "events", containerFactory = "streamListenerContainerFactory")
public void processEvent(OrderEvent event) {
    // Process...
}

// Factory cho stream consumer
@Bean
public RabbitListenerContainerFactory<?> streamListenerContainerFactory(
        ConnectionFactory cf) {
    StreamRabbitListenerContainerFactory factory = 
        new StreamRabbitListenerContainerFactory(
            Environment.builder().lazyInitialization(true).build());
    factory.setNativeListener(true);
    return factory;
}

// Đọc từ offset cụ thể
// x-stream-offset: "first" | "last" | "next" | timestamp | offset number
@RabbitListener(queues = "events", 
    containerFactory = "streamListenerContainerFactory",
    arguments = @Argument(name = "x-stream-offset", value = "first"))
public void replayAllEvents(OrderEvent event) {
    // Replay từ message đầu tiên
}
```

### Super Streams (Partitioned Streams)

```java
// Super Stream: Stream được chia thành nhiều partitions
// Giống Kafka topic với nhiều partitions
// → Nhiều consumers xử lý song song

// Tạo Super Stream (qua Management UI hoặc CLI)
// rabbitmqctl add_super_stream invoices --partitions 5

// Consumer tự động được gán partitions (SAC - Single Active Consumer per partition)
```

---

## Lazy Queues

### Khi nào dùng?

**Lazy Queues** lưu messages trực tiếp trên **disk** thay vì RAM:
- Queue có **hàng triệu messages** tồn đọng
- Consumer chậm hơn producer nhiều
- Cần **tiết kiệm RAM** cho RabbitMQ node
- Chấp nhận **latency cao hơn** khi consume (đọc từ disk)

```java
// Khai báo Lazy Queue
@Bean
public Queue lazyQueue() {
    return QueueBuilder.durable("bulk-processing")
        .lazy()  // x-queue-mode: lazy
        .build();
}

// Hoặc
args.put("x-queue-mode", "lazy");
```

### So sánh

| | Default Queue | Lazy Queue |
| :--- | :--- | :--- |
| **Storage** | RAM (overflow disk) | Disk (luôn) |
| **Consume latency** | Rất thấp | Cao hơn (disk read) |
| **Memory usage** | Cao khi backlog lớn | **Rất thấp** |
| **Use case** | Realtime processing | Bulk/batch, backlog tolerance |

> **Lưu ý:** Từ RabbitMQ 3.12+, Quorum Queues tự động quản lý memory/disk, nên Lazy Queue chủ yếu dùng cho Classic Queues.

---

## Delayed Messages

### Plugin: rabbitmq-delayed-message-exchange

Có nhu cầu gửi message nhưng **delay N giây/phút** trước khi deliver (ví dụ: retry sau 30s, scheduled email).

```bash
# Cài plugin
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

```java
// Khai báo Delayed Exchange
@Bean
public CustomExchange delayedExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "direct");  // Underlying exchange type
    return new CustomExchange("delayed-exchange", "x-delayed-message", true, false, args);
}

// Gửi message với delay
public void sendDelayed(String routingKey, Object message, long delayMs) {
    rabbitTemplate.convertAndSend("delayed-exchange", routingKey, message, msg -> {
        msg.getMessageProperties().setHeader("x-delay", delayMs);  // Delay in ms
        return msg;
    });
}

// Ví dụ: Retry sau 30 giây
sendDelayed("order.retry", failedOrder, 30_000);
```

### Alternative: TTL + DLX (không cần plugin)

```java
// Workaround: Parking queue với TTL → message expire → forward qua DLX → target queue

// 1. Parking queue (messages chờ ở đây)
@Bean
public Queue parkingQueue() {
    return QueueBuilder.durable("parking-30s")
        .withArgument("x-message-ttl", 30_000)          // TTL 30 giây
        .withArgument("x-dead-letter-exchange", "")      // Default exchange
        .withArgument("x-dead-letter-routing-key", "target-queue")  // Forward tới target
        .build();
}

// 2. Gửi vào parking queue → chờ 30s → tự chuyển sang target-queue
rabbitTemplate.convertAndSend("", "parking-30s", message);

// Nhược điểm: Cần tạo nhiều parking queues cho từng delay time
```

---

## Shovel & Federation

### Shovel — Cross-cluster message moving

**Shovel** di chuyển messages từ queue/exchange **cluster A** sang queue/exchange **cluster B**:
- **Reliable**: Tự reconnect khi mất kết nối
- **One-directional**: A → B (hoặc bi-directional nếu setup 2 shovels)
- **Use case**: Multi-datacenter replication, migration, bridging

```bash
# Enable plugin
rabbitmq-plugins enable rabbitmq_shovel
rabbitmq-plugins enable rabbitmq_shovel_management

# Tạo Shovel qua CLI
rabbitmqctl set_parameter shovel my-shovel \
    '{"src-protocol": "amqp091", 
      "src-uri": "amqp://user:pass@cluster-a:5672",
      "src-queue": "orders", 
      "dest-protocol": "amqp091",
      "dest-uri": "amqp://user:pass@cluster-b:5672",
      "dest-queue": "orders"}'
```

### Federation — Exchange/Queue linking

**Federation** link exchanges hoặc queues giữa các brokers/clusters:
- **Loose coupling**: Mỗi broker independent, chỉ forward messages matching
- **Multi-datacenter**: Publish ở DC-A, consume ở DC-B
- **Use case**: Geographically distributed systems

```bash
# Enable
rabbitmq-plugins enable rabbitmq_federation
rabbitmq-plugins enable rabbitmq_federation_management

# Tạo upstream (cluster nguồn)
rabbitmqctl set_parameter federation-upstream my-upstream \
    '{"uri": "amqp://user:pass@upstream-broker:5672"}'

# Tạo policy: federate exchange "events"
rabbitmqctl set_policy federate-events "^events$" \
    '{"federation-upstream-set": "all"}' --apply-to exchanges
```

### Shovel vs Federation

| | Shovel | Federation |
| :--- | :--- | :--- |
| **Granularity** | Queue → Queue hoặc Exchange → Exchange | Exchange → Exchange hoặc Queue → Queue |
| **Direction** | Uni-directional (1 shovel = 1 hướng) | Bi-directional tự nhiên (link) |
| **Coupling** | Tight (move all messages) | Loose (chỉ messages matching bindings) |
| **Use case** | Migration, replication, bridging | Multi-site, geo-distribution |

---

## Alternate Exchange

Messages **không match** binding nào sẽ bị mất. **Alternate Exchange** (AE) bắt các "unroutable messages":

```java
// Exchange chính: nếu không match → chuyển sang AE
@Bean
public DirectExchange mainExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("alternate-exchange", "unrouted-exchange");  // AE
    return new DirectExchange("main-exchange", true, false, args);
}

// AE: Fanout → bắt tất cả unroutable messages
@Bean
public FanoutExchange unroutedExchange() {
    return new FanoutExchange("unrouted-exchange");
}

@Bean
public Queue unroutedQueue() {
    return new Queue("unrouted-messages", true);
}

@Bean
public Binding unroutedBinding() {
    return BindingBuilder.bind(unroutedQueue()).to(unroutedExchange());
}

// Bây giờ: publish với routing key không match → message vào unrouted-messages queue
// → Dùng để debug, audit, hoặc re-route
```

---

## Consistent Hash Exchange

**Plugin** cho phép distribute messages **đều** qua nhiều queues dựa trên hash của routing key hoặc message header:

```bash
rabbitmq-plugins enable rabbitmq_consistent_hash_exchange
```

```java
// Mỗi queue bind với "weight" (số bucket)
@Bean
public CustomExchange hashExchange() {
    return new CustomExchange("order-hash", "x-consistent-hash", true, false);
}

// Queue 1: weight 1 (nhận ~33% messages)
@Bean
public Binding q1Binding() {
    return BindingBuilder.bind(queue1()).to(hashExchange()).with("1").noargs();
}

// Queue 2: weight 2 (nhận ~67% messages)  
@Bean
public Binding q2Binding() {
    return BindingBuilder.bind(queue2()).to(hashExchange()).with("2").noargs();
}

// Messages với cùng routing key LUÔN đi vào cùng queue → ordering guaranteed per key
// Use case: Sharding, ordered processing per entity (all orders of user X → same queue)
```

---

## Security chuyên sâu

### TLS/SSL

```properties
# rabbitmq.conf
listeners.ssl.default = 5671
ssl_options.cacertfile = /etc/rabbitmq/ca_certificate.pem
ssl_options.certfile   = /etc/rabbitmq/server_certificate.pem
ssl_options.keyfile    = /etc/rabbitmq/server_key.pem
ssl_options.verify     = verify_peer              # Yêu cầu client cert
ssl_options.fail_if_no_peer_cert = true           # Reject nếu không có cert
```

```java
// Spring AMQP TLS
@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setHost("rabbitmq-server");
    factory.setPort(5671);
    factory.getRabbitConnectionFactory()
        .useSslProtocol("TLSv1.3", trustManager);
    return factory;
}
```

### Permissions (per vhost)

```bash
# Set permissions: configure, write, read (regex)
rabbitmqctl set_permissions -p /production user1 "^order-.*" "^order-.*" "^order-.*"
# user1 chỉ được configure/write/read queues bắt đầu bằng "order-"

# Topic-based authorization
rabbitmqctl set_topic_permissions -p /production user1 "events-exchange" "^order\..*" "^order\..*"
# user1 chỉ publish/consume messages với routing key bắt đầu bằng "order."
```

### OAuth 2.0

```properties
# rabbitmq.conf (RabbitMQ 3.11+)
auth_backends.1 = rabbit_auth_backend_oauth2
auth_oauth2.resource_server_id = rabbitmq
auth_oauth2.issuer = https://keycloak:8080/realms/my-realm
```

---

## Virtual Hosts & Multi-tenancy

### Virtual Host = Namespace

```bash
# Tạo vhost
rabbitmqctl add_vhost /tenant-a
rabbitmqctl add_vhost /tenant-b

# Mỗi vhost có exchanges, queues, bindings, permissions riêng biệt
# Hoàn toàn isolated — tenant A không thấy gì của tenant B

# Set permissions
rabbitmqctl set_permissions -p /tenant-a user-a ".*" ".*" ".*"
rabbitmqctl set_permissions -p /tenant-b user-b ".*" ".*" ".*"
```

```java
// Spring AMQP: kết nối tới vhost cụ thể
@Bean
public CachingConnectionFactory tenantAFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setVirtualHost("/tenant-a");
    return factory;
}

// Hoặc application.properties
spring.rabbitmq.virtual-host=/tenant-a
```

---

## Exactly-once & Idempotency

### RabbitMQ KHÔNG đảm bảo exactly-once delivery

```
RabbitMQ guarantees:
- At-most-once: Không ACK, message có thể mất
- At-least-once: ACK sau khi xử lý, message có thể duplicate

KHÔNG CÓ exactly-once ở mức broker!
→ Application phải tự đảm bảo idempotency
```

### Idempotent Consumer Pattern

```java
@Component
public class IdempotentOrderConsumer {

    @Inject
    private ProcessedMessageRepository processedRepo;

    @RabbitListener(queues = "order-queue")
    @Transactional
    public void processOrder(Order order, 
                              @Header("amqp_messageId") String messageId) {
        // 1. Check đã xử lý chưa
        if (processedRepo.existsByMessageId(messageId)) {
            log.warn("Duplicate message: {}, skipping", messageId);
            return;  // ACK và bỏ qua
        }

        // 2. Xử lý business logic
        orderService.process(order);

        // 3. Ghi nhận đã xử lý (trong cùng transaction)
        processedRepo.save(new ProcessedMessage(messageId, Instant.now()));
    }
}

// Entity lưu message đã xử lý
@Entity
@Table(name = "processed_messages", indexes = {
    @Index(name = "idx_message_id", columnList = "messageId", unique = true)
})
public class ProcessedMessage {
    @Id @GeneratedValue
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String messageId;
    
    private Instant processedAt;
}
```

### Deduplication qua Database Unique Constraint

```java
// Alternative: Dùng business key làm unique constraint
// Ví dụ: orderId là unique → insert duplicate sẽ fail → skip

@Transactional
public void processOrder(Order order) {
    try {
        orderRepo.persist(order);  // orderId unique constraint
    } catch (ConstraintViolationException e) {
        log.warn("Duplicate order: {}", order.getId());
        // Bỏ qua — đã xử lý rồi
    }
}
```

---

## Câu hỏi thường gặp

### Q1: Quorum Queue hay Classic Queue?

**Quorum Queue** cho mọi trường hợp production cần reliability. Classic Queue chỉ dùng khi:
- Cần exclusive queue (temporary)
- Cần priority queue
- Non-critical data (có thể mất)

### Q2: Stream hay Queue?

**Stream** khi cần: replay, multiple consumers đọc cùng data, audit log, event sourcing.
**Queue** khi cần: task distribution, RPC, one-time processing.

### Q3: Shovel hay Federation?

**Shovel**: Move toàn bộ messages, migration, simple replication.
**Federation**: Loose coupling, multi-datacenter, chỉ forward matching messages.

### Q4: Làm sao exactly-once?

RabbitMQ KHÔNG hỗ trợ exactly-once. Dùng **at-least-once** + **idempotent consumer** (message ID + dedup table).

---

## Tổng kết

- **Quorum Queues**: Raft-based, strong consistency, thay thế Mirrored Queues → **production standard**
- **Streams**: Kafka-like append-only log, replay, high throughput
- **Lazy Queues**: Disk-first, tiết kiệm RAM cho backlog lớn
- **Delayed Messages**: Plugin hoặc TTL+DLX workaround
- **Shovel/Federation**: Cross-cluster replication
- **Security**: TLS, OAuth2, per-vhost permissions
- **Idempotency**: Application-level dedup (message ID + database)
