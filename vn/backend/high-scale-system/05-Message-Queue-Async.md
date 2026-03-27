# Message Queue & Async Processing — Xử Lý Write Heavy

## Mục lục
1. [Tại sao Async là bắt buộc?](#tại-sao-async-là-bắt-buộc)
2. [Kafka cho High Scale](#kafka-cho-high-scale)
3. [Backpressure & Flow Control](#backpressure--flow-control)
4. [Event-Driven Architecture](#event-driven-architecture)
5. [Exactly-Once Processing](#exactly-once-processing)
6. [Kinh nghiệm thực tế](#kinh-nghiệm-thực-tế)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại Sao Async Là Bắt Buộc?

```
Synchronous request flow (500ms total):
  Client → API → Validate(10ms) → DB Write(50ms) → Send Email(200ms)
         → Update Analytics(100ms) → Sync Inventory(150ms) → Response

Async request flow (60ms total):
  Client → API → Validate(10ms) → DB Write(50ms) → Response(60ms)
                  ↓
              Kafka Event
              ├──→ Email Worker (async)
              ├──→ Analytics Worker (async)
              └──→ Inventory Worker (async)
```

**Lợi ích ở scale lớn:**
- **Response time**: 500ms → 60ms (8x nhanh hơn)
- **Throughput**: gấp 5-10x (không block waiting)
- **Resilience**: email service chết ≠ order API chết
- **Retry**: failed events retry tự động

---

## Kafka cho High Scale

### Tại sao Kafka?

| Tiêu chí | Kafka | RabbitMQ |
|----------|-------|----------|
| **Throughput** | **1M+ msg/s per broker** | ~50K msg/s per node |
| **Persistence** | Giữ data trên disk (days/weeks) | Xóa sau consume |
| **Consumer model** | Pull (consumer chủ động) | Push (broker đẩy) |
| **Ordering** | Guaranteed per partition | Per queue |
| **Replay** | ✅ Đọc lại messages cũ | ❌ Không (đã xóa) |
| **Use case** | Event streaming, log, high throughput | Task queue, RPC |

### Kafka Cluster cho 1M+ events/s

```yaml
# 10 brokers, 3 ZooKeeper (hoặc KRaft)
# Mỗi broker: 32GB RAM, 12 CPU cores, SSD RAID 10

# Topic config cho high throughput
kafka-topics.sh --create \
  --topic order-events \
  --partitions 120 \       # Nhiều partitions = nhiều parallelism
  --replication-factor 3 \ # 3 copies cho durability
  --config retention.ms=604800000 \        # 7 ngày
  --config min.insync.replicas=2 \         # 2/3 replicas ACK
  --config compression.type=lz4            # Nén: giảm network + disk
```

### Producer tối ưu

```java
@Configuration
public class KafkaProducerConfig {
    @Bean
    public ProducerFactory<String, Event> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-1:9092,kafka-2:9092,kafka-3:9092");

        // === Throughput optimization ===
        config.put(ProducerConfig.BATCH_SIZE_CONFIG, 65536);        // 64KB batch
        config.put(ProducerConfig.LINGER_MS_CONFIG, 5);             // Đợi 5ms gom batch
        config.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864);  // 64MB buffer
        config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");  // Nén

        // === Durability ===
        config.put(ProducerConfig.ACKS_CONFIG, "all");              // Đợi tất cả ISR ACK
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Exactly-once

        return new DefaultKafkaProducerFactory<>(config);
    }
}
```

### Consumer tối ưu

```java
@Configuration
public class KafkaConsumerConfig {
    @Bean
    public ConsumerFactory<String, Event> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-1:9092,kafka-2:9092");

        // === Performance ===
        config.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1024 * 100);  // 100KB min fetch
        config.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);       // Max wait 500ms
        config.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);        // 500 records/poll

        // === Offset management ===
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);    // Manual commit
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(config);
    }
}

@KafkaListener(topics = "order-events", groupId = "email-service",
               concurrency = "10")  // 10 consumer threads
public void processOrderEvent(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {
    try {
        emailService.sendOrderConfirmation(record.value());
        ack.acknowledge();  // Commit offset sau khi xử lý thành công
    } catch (TransientException e) {
        // Không ACK → retry tự động (Kafka re-deliver)
        throw e;
    } catch (PermanentException e) {
        // Ghi vào Dead Letter Topic
        deadLetterProducer.send("order-events-dlt", record.value());
        ack.acknowledge();  // ACK để không retry mãi
    }
}
```

---

## Backpressure & Flow Control

### Vấn đề: Producer nhanh hơn Consumer

```
Flash sale: 1M orders/s → Kafka → Email consumer: 10K emails/s
→ Queue depth tăng liên tục → consumer lag hours → user nhận email trễ

Giải pháp:
1. Scale consumer: thêm consumer instances (max = số partitions)
2. Batch processing: gom 100 emails → 1 batch API call
3. Priority queue: VIP orders xử lý trước
4. Drop/throttle: bỏ qua non-critical events khi overload
5. Backpressure upstream: trả 429 Too Many Requests
```

### Consumer scaling

```
Topic: order-events với 120 partitions

Consumer Group "email-service":
  - 10 consumers → mỗi consumer đọc 12 partitions
  - Scale lên 30 consumers → mỗi consumer đọc 4 partitions
  - Scale lên 120 consumers → mỗi consumer đọc 1 partition (MAX)
  - > 120 consumers → consumer thừa (idle)

→ Số partitions = max parallel consumers
→ Tạo đủ partitions từ đầu (khó thêm sau)
```

---

## Event-Driven Architecture

### Event Sourcing + CQRS

```
┌─────────┐   Command    ┌──────────┐   Event    ┌──────────┐
│ Client  │ ───────────→ │ Command  │ ─────────→ │  Kafka   │
│         │              │ Service  │            │  Topics  │
└─────────┘              └────┬─────┘            └────┬─────┘
                              │                       │
                         Event Store               Consumers
                         (append-only)           ┌────┴────┐
                              │                  │         │
                         ┌────┴────┐      ┌──────┴──┐ ┌────┴────┐
                         │ Events  │      │ Read    │ │Analytics│
                         │ Table   │      │ Model   │ │ Service │
                         └─────────┘      └─────────┘ └─────────┘
```

```java
// Event Store: mọi thay đổi = event (append-only, không UPDATE/DELETE)
@Entity
@Table(name = "events")
public class DomainEvent {
    @Id
    private UUID id;
    private String aggregateId;     // "order:123"
    private String eventType;       // "OrderCreated", "OrderPaid", "OrderShipped"
    private String payload;         // JSON data
    private Instant timestamp;
    private int version;            // Sequence number
}

// Rebuild state từ events
public Order reconstruct(String orderId) {
    List<DomainEvent> events = eventStore.findByAggregateId(orderId);
    Order order = new Order();
    for (DomainEvent event : events) {
        order.apply(event);  // Replay each event
    }
    return order;
}
```

---

## Exactly-Once Processing

### Vấn đề: Message được xử lý 2 lần

```
Consumer nhận message → xử lý → crash trước khi ACK
→ Kafka re-deliver → xử lý LẦN NỮA → duplicate

Ví dụ: trừ tiền 2 lần, gửi email 2 lần
```

### Giải pháp: Idempotent Consumer

```java
@Service
public class PaymentConsumer {
    @Autowired
    private ProcessedEventRepository processedRepo;

    @KafkaListener(topics = "payment-events")
    @Transactional
    public void processPayment(PaymentEvent event, Acknowledgment ack) {
        // Check đã xử lý chưa (idempotency key)
        String idempotencyKey = event.getEventId();
        if (processedRepo.existsById(idempotencyKey)) {
            ack.acknowledge();  // Đã xử lý → skip
            return;
        }

        // Xử lý business logic
        paymentService.charge(event.getUserId(), event.getAmount());

        // Lưu idempotency key (cùng transaction)
        processedRepo.save(new ProcessedEvent(idempotencyKey, Instant.now()));

        ack.acknowledge();
    }
}
```

### Outbox Pattern — Đảm bảo event publish

```java
// Vấn đề: DB commit thành công nhưng Kafka publish thất bại → data inconsistency

// Giải pháp: Outbox table + CDC (Change Data Capture)
@Transactional
public Order createOrder(OrderInput input) {
    // 1. Save order (cùng transaction)
    Order order = orderRepository.save(toEntity(input));

    // 2. Save event vào outbox table (CÙNG transaction)
    outboxRepository.save(new OutboxEvent(
        "order-events",
        order.getId().toString(),
        "OrderCreated",
        serialize(order)
    ));

    return order;
    // 3. Debezium CDC đọc outbox table → publish lên Kafka
    // → Atomic: cả order + event đều commit hoặc đều rollback
}
```

---

## Kinh Nghiệm Thực Tế

### 1. Partition key quyết định ordering và distribution

```
// ❌ Random key → không đảm bảo ordering
producer.send("orders", randomKey, event);

// ✅ User ID → events cùng user luôn đúng thứ tự
producer.send("orders", userId.toString(), event);

// ⚠️ Nhưng: hot user → hot partition
// Giải pháp: user_id + month → chia đều hơn
```

### 2. Dead Letter Queue (DLQ) là PHẢI CÓ

```
Message lỗi → retry 3 lần → vẫn lỗi → gửi vào DLT (Dead Letter Topic)
→ Alert team → fix bug → replay từ DLT

// Không có DLQ → message lỗi block consumer → lag tăng → hệ thống chết
```

### 3. Monitor consumer lag

```
Consumer lag = latest offset - consumer offset
Lag tăng liên tục → consumer không đủ nhanh
Lag > threshold → alert → scale consumer

# Prometheus metric
kafka_consumer_group_lag{group="email-service", topic="order-events"}
```

---

## Câu Hỏi Phỏng Vấn

### Kafka vs RabbitMQ cho 1M events/s?
> **Kafka**: thiết kế cho throughput cao (1M+/broker), dữ liệu persist, replay được. **RabbitMQ**: routing phức tạp, nhưng throughput thấp hơn (~50K/node). Ở triệu events → Kafka.

### Exactly-once trong Kafka hoạt động thế nào?
> Kafka hỗ trợ idempotent producer (dedup ở broker) + transactional producer (atomic ghi nhiều partitions). Consumer cần thêm idempotency key trong application logic.

### Backpressure xử lý thế nào?
> (1) Scale consumer, (2) Batch processing, (3) Drop non-critical, (4) Rate limit producer. Quan trọng: **monitor consumer lag** — lag tăng = warning sign.

---

**Tiếp theo:** [06-Application-Optimization.md](./06-Application-Optimization.md)
