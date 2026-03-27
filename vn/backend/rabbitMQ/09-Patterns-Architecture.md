# Message Patterns & Architecture - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Work Queue (Competing Consumers)](#work-queue-competing-consumers)
2. [Publish/Subscribe](#publishsubscribe)
3. [Request/Reply (RPC)](#requestreply-rpc)
4. [Saga Pattern (Distributed Transactions)](#saga-pattern)
5. [Retry với Exponential Backoff](#retry-với-exponential-backoff)
6. [Event Sourcing & CQRS](#event-sourcing--cqrs)
7. [Priority Processing](#priority-processing)
8. [Outbox Pattern](#outbox-pattern)
9. [Rate Limiting (Consumer Throttling)](#rate-limiting)
10. [Message Deduplication](#message-deduplication)
11. [Tổng hợp Patterns](#tổng-hợp-patterns)
12. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Work Queue (Competing Consumers)

### Pattern

Nhiều consumers xử lý song song messages từ cùng 1 queue → **tăng throughput**:

```
Producer → [Queue] → Consumer 1 (msg 1, 3, 5...)
                   → Consumer 2 (msg 2, 4, 6...)
                   → Consumer 3 (msg 7, 8...)

Mỗi message chỉ giao cho 1 consumer (round-robin mặc định)
```

### Implementation

```java
// Producer
@Service
public class TaskProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void submitTask(Task task) {
        rabbitTemplate.convertAndSend("", "task-queue", task, msg -> {
            msg.getMessageProperties().setMessageId(UUID.randomUUID().toString());
            msg.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            return msg;
        });
    }
}

// Consumers (nhiều instances)
@Component
public class TaskWorker {

    @RabbitListener(queues = "task-queue", concurrency = "5-10")
    public void processTask(Task task) {
        // Xử lý task
        taskService.execute(task);
    }
}
```

### Fair Dispatch

```properties
# Mặc định RabbitMQ round-robin → consumer nhanh chờ consumer chậm
# Fix: prefetch = 1 → chỉ giao 1 message, đợi ACK mới giao tiếp
spring.rabbitmq.listener.simple.prefetch=1
```

```
Không prefetch (Round-robin, unfair):
  Consumer 1 (nhanh):  msg1 ✓  msg2 . . . msg3 ✓  msg4 . . . (chờ)
  Consumer 2 (chậm):   msg5 ───────────✓  msg6 ───────────✓

Với prefetch=1 (Fair dispatch):
  Consumer 1 (nhanh):  msg1 ✓ msg3 ✓ msg5 ✓ msg7 ✓ msg9 ✓
  Consumer 2 (chậm):   msg2 ─────────✓ msg4 ─────────✓
```

---

## Publish/Subscribe

### Broadcast — Fanout Exchange

```java
// Mọi subscriber nhận TẤT CẢ messages

// Config
@Bean
public FanoutExchange notificationExchange() {
    return new FanoutExchange("notifications");
}

@Bean
public Queue emailQueue() { return new Queue("notification.email", true); }

@Bean
public Queue smsQueue() { return new Queue("notification.sms", true); }

@Bean
public Queue pushQueue() { return new Queue("notification.push", true); }

@Bean
public Binding emailBinding() {
    return BindingBuilder.bind(emailQueue()).to(notificationExchange());
}
// ... bindings cho sms, push tương tự

// Producer: Gửi 1 message → 3 queues nhận
rabbitTemplate.convertAndSend("notifications", "", event);

// Consumers: Mỗi queue có consumer riêng
@RabbitListener(queues = "notification.email")
public void sendEmail(NotificationEvent event) { emailService.send(event); }

@RabbitListener(queues = "notification.sms")
public void sendSms(NotificationEvent event) { smsService.send(event); }
```

### Selective — Topic Exchange

```java
// Subscriber chỉ nhận messages matching pattern

@Bean
public TopicExchange eventExchange() { return new TopicExchange("events"); }

// Queue chỉ nhận order events
@Bean
public Binding orderBinding() {
    return BindingBuilder.bind(orderQueue()).to(eventExchange()).with("order.*");
}

// Queue nhận TẤT CẢ events
@Bean
public Binding auditBinding() {
    return BindingBuilder.bind(auditQueue()).to(eventExchange()).with("#");
}
```

---

## Request/Reply (RPC)

### Pattern

Client gửi request qua RabbitMQ → Server xử lý → gửi reply qua reply queue:

```
Client → [Request Queue] → Server
Client ← [Reply Queue]   ← Server

Properties:
- reply_to: Tên reply queue
- correlation_id: ID để match request ↔ response
```

### Implementation

```java
// ===== Client (Request) =====
@Service
public class PricingClient {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public PricingResponse getPrice(PricingRequest request) {
        // convertSendAndReceive: gửi + chờ response
        PricingResponse response = (PricingResponse) rabbitTemplate
            .convertSendAndReceive("pricing-exchange", "pricing.request", request);

        if (response == null) {
            throw new TimeoutException("Pricing service did not respond");
        }
        return response;
    }
}

// ===== Server (Reply) =====
@Component
public class PricingServer {

    @RabbitListener(queues = "pricing-request-queue")
    public PricingResponse handlePricing(PricingRequest request) {
        // Return value tự động gửi về reply queue
        BigDecimal price = calculatePrice(request);
        return new PricingResponse(request.productId(), price);
    }
}
```

### Async RPC

```java
// Client gửi request, không block
// Dùng AsyncRabbitTemplate
@Bean
public AsyncRabbitTemplate asyncRabbitTemplate(RabbitTemplate template,
        SimpleRabbitListenerContainerFactory factory) {
    return new AsyncRabbitTemplate(template, factory.createListenerContainer());
}

// Sử dụng
public CompletableFuture<PricingResponse> getPriceAsync(PricingRequest request) {
    RabbitConverterFuture<PricingResponse> future = asyncTemplate
        .convertSendAndReceive("pricing-exchange", "pricing.request", request);

    return future.toCompletableFuture();
}
```

### Timeout & Error Handling

```properties
# Reply timeout
spring.rabbitmq.template.reply-timeout=5000  # 5 giây

# Direct Reply-to (không cần khai báo reply queue)
# RabbitMQ tự tạo pseudo-queue → nhanh hơn
spring.rabbitmq.template.mandatory=true
```

---

## Saga Pattern

### Distributed Transaction Problem

```
Order Service → Payment Service → Inventory Service → Shipping Service
    ↓                 ↓                  ↓                  ↓
  createOrder    chargePayment     reserveStock        scheduleShip

Nếu Payment thành công nhưng Inventory fail?
→ Cần rollback Payment → SAGA PATTERN
```

### Choreography Saga (Event-driven)

```java
// Mỗi service publish events, service khác react

// ===== Order Service =====
@Service
public class OrderService {
    public void createOrder(OrderDTO dto) {
        Order order = orderRepo.save(dto.toEntity());
        // Publish event
        rabbitTemplate.convertAndSend("saga-exchange", "order.created",
            new OrderCreatedEvent(order.getId(), dto.amount()));
    }

    // Compensating: rollback nếu payment fail
    @RabbitListener(queues = "order.payment-failed")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        Order order = orderRepo.findById(event.orderId());
        order.setStatus("CANCELLED");
        orderRepo.save(order);
    }
}

// ===== Payment Service =====
@Component
public class PaymentSagaHandler {
    
    @RabbitListener(queues = "payment.order-created")
    public void handleOrderCreated(OrderCreatedEvent event) {
        try {
            paymentService.charge(event.orderId(), event.amount());
            // Thành công → publish event tiếp
            rabbitTemplate.convertAndSend("saga-exchange", "payment.completed",
                new PaymentCompletedEvent(event.orderId()));
        } catch (PaymentException e) {
            // Thất bại → publish compensation event
            rabbitTemplate.convertAndSend("saga-exchange", "payment.failed",
                new PaymentFailedEvent(event.orderId(), e.getMessage()));
        }
    }
}

// ===== Inventory Service =====
@Component
public class InventorySagaHandler {
    
    @RabbitListener(queues = "inventory.payment-completed")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        try {
            inventoryService.reserve(event.orderId());
            rabbitTemplate.convertAndSend("saga-exchange", "inventory.reserved",
                new InventoryReservedEvent(event.orderId()));
        } catch (InsufficientStockException e) {
            // Thất bại → compensate (refund payment + cancel order)
            rabbitTemplate.convertAndSend("saga-exchange", "inventory.failed",
                new InventoryFailedEvent(event.orderId()));
        }
    }
}
```

### Orchestrator Saga (Centralized)

```java
// Orchestrator quản lý luồng saga

@Component
public class OrderSagaOrchestrator {

    @RabbitListener(queues = "saga.start")
    public void startSaga(CreateOrderCommand cmd) {
        String sagaId = UUID.randomUUID().toString();
        
        // Step 1: Create order
        rabbitTemplate.convertAndSend("saga-exchange", "saga.create-order",
            new SagaStep(sagaId, "CREATE_ORDER", cmd));
    }

    @RabbitListener(queues = "saga.order-created")
    public void onOrderCreated(SagaStepResult result) {
        if (result.isSuccess()) {
            // Step 2: Charge payment
            rabbitTemplate.convertAndSend("saga-exchange", "saga.charge-payment",
                new SagaStep(result.sagaId(), "CHARGE_PAYMENT", result.data()));
        } else {
            // Compensate
            compensate(result.sagaId(), "CREATE_ORDER");
        }
    }

    @RabbitListener(queues = "saga.payment-charged") 
    public void onPaymentCharged(SagaStepResult result) {
        if (result.isSuccess()) {
            // Step 3: Reserve inventory
            rabbitTemplate.convertAndSend("saga-exchange", "saga.reserve-inventory",
                new SagaStep(result.sagaId(), "RESERVE_INVENTORY", result.data()));
        } else {
            // Compensate step 1
            compensate(result.sagaId(), "CHARGE_PAYMENT");
        }
    }

    private void compensate(String sagaId, String failedStep) {
        // Gửi compensating commands theo thứ tự ngược
        log.error("Saga {} failed at step {}, compensating...", sagaId, failedStep);
        rabbitTemplate.convertAndSend("saga-exchange", "saga.compensate",
            new CompensateCommand(sagaId, failedStep));
    }
}
```

---

## Retry với Exponential Backoff

### Vấn đề: Retry ngay lập tức

```
❌ Message fail → NACK(requeue=true) → Consumer nhận lại NGAY → fail lại → loop vô tận
→ CPU 100%, log spam, service downstream overwhelmed
```

### Giải pháp: Delay Retry Queues

```java
// Tạo 3 retry queues với delay tăng dần
// Main Queue → Retry-1 (5s) → Retry-2 (30s) → Retry-3 (5m) → DLQ

@Configuration
public class RetryConfig {

    // Main Queue
    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable("order-queue")
            .withArgument("x-dead-letter-exchange", "retry-exchange")
            .withArgument("x-dead-letter-routing-key", "retry.order.1")
            .build();
    }

    // Retry Queue Level 1: 5 seconds
    @Bean
    public Queue retryQueue1() {
        return QueueBuilder.durable("retry.order.1")
            .withArgument("x-message-ttl", 5_000)              // 5s delay
            .withArgument("x-dead-letter-exchange", "")         // Default exchange
            .withArgument("x-dead-letter-routing-key", "order-queue")  // Back to main
            .build();
    }

    // Retry Queue Level 2: 30 seconds
    @Bean
    public Queue retryQueue2() {
        return QueueBuilder.durable("retry.order.2")
            .withArgument("x-message-ttl", 30_000)
            .withArgument("x-dead-letter-exchange", "")
            .withArgument("x-dead-letter-routing-key", "order-queue")
            .build();
    }

    // Retry Queue Level 3: 5 minutes → sau đó DLQ
    @Bean
    public Queue retryQueue3() {
        return QueueBuilder.durable("retry.order.3")
            .withArgument("x-message-ttl", 300_000)
            .withArgument("x-dead-letter-exchange", "dlx")
            .withArgument("x-dead-letter-routing-key", "order.dead")
            .build();
    }
}

// Consumer: Track retry count qua header
@RabbitListener(queues = "order-queue")
public void processOrder(Order order, @Header("x-death") List<Map<String, Object>> deaths) {
    int retryCount = getRetryCount(deaths);
    
    try {
        orderService.process(order);
    } catch (TransientException e) {
        // Lỗi tạm thời → retry
        String nextRetryQueue = switch (retryCount) {
            case 0 -> "retry.order.1";   // 5s
            case 1 -> "retry.order.2";   // 30s
            case 2 -> "retry.order.3";   // 5m → DLQ
            default -> null;             // Đã hết retry
        };
        
        if (nextRetryQueue != null) {
            rabbitTemplate.convertAndSend("retry-exchange", nextRetryQueue, order);
        }
        throw new AmqpRejectAndDontRequeueException("Retry scheduled");
    }
}

private int getRetryCount(List<Map<String, Object>> deaths) {
    if (deaths == null) return 0;
    return deaths.stream()
        .mapToInt(d -> ((Number) d.get("count")).intValue())
        .sum();
}
```

### Spring Retry (đơn giản hơn, nhưng in-process)

```properties
spring.rabbitmq.listener.simple.retry.enabled=true
spring.rabbitmq.listener.simple.retry.initial-interval=1000
spring.rabbitmq.listener.simple.retry.max-attempts=3
spring.rabbitmq.listener.simple.retry.multiplier=2.0
spring.rabbitmq.listener.simple.retry.max-interval=10000
# Retry: 1s → 2s → 4s (capped 10s) → DLQ

# Nhược điểm: Retry block thread → ảnh hưởng throughput
# Ưu điểm: Đơn giản, không cần tạo retry queues
```

---

## Event Sourcing & CQRS

### Event Sourcing qua RabbitMQ

```java
// Mọi thay đổi state được lưu dưới dạng EVENT
// RabbitMQ broadcast events → các service build read models

// Event Store (DB) - source of truth
@Entity
public class DomainEvent {
    @Id @GeneratedValue
    private Long id;
    private String aggregateId;      // e.g. orderId
    private String eventType;        // e.g. "ORDER_CREATED"
    private String eventData;        // JSON payload
    private Instant occurredAt;
    private int version;             // Optimistic locking
}

// Service: Save event + Publish
@Service
public class OrderService {
    
    @Transactional
    public void createOrder(CreateOrderCommand cmd) {
        // 1. Save event (source of truth)
        DomainEvent event = new DomainEvent(
            cmd.orderId(), "ORDER_CREATED", toJson(cmd), Instant.now(), 1);
        eventStore.save(event);

        // 2. Publish event (cho read models / other services)
        rabbitTemplate.convertAndSend("events", "order.created", event);
    }
}

// CQRS Read Side: Build read model từ events
@Component
public class OrderReadModelUpdater {

    @RabbitListener(queues = "order-read-model-updates")
    public void updateReadModel(DomainEvent event) {
        switch (event.getEventType()) {
            case "ORDER_CREATED" -> orderViewRepo.create(event);
            case "ORDER_UPDATED" -> orderViewRepo.update(event);
            case "ORDER_CANCELLED" -> orderViewRepo.cancel(event);
        }
    }
}
```

---

## Priority Processing

```java
// Quorum Queues KHÔNG hỗ trợ priority
// Giải pháp: Multiple queues + weighted consumers

@Configuration
public class PriorityConfig {
    @Bean public Queue highPriorityQueue() { return new Queue("orders.high", true); }
    @Bean public Queue normalPriorityQueue() { return new Queue("orders.normal", true); }
    @Bean public Queue lowPriorityQueue() { return new Queue("orders.low", true); }
}

// Producer: Route theo priority
public void submit(Order order) {
    String routingKey = switch (order.priority()) {
        case HIGH -> "orders.high";
        case LOW -> "orders.low";
        default -> "orders.normal";
    };
    rabbitTemplate.convertAndSend("", routingKey, order);
}

// Consumer: Nhiều consumers hơn cho high priority
@RabbitListener(queues = "orders.high", concurrency = "5")    // 5 consumers
public void processHigh(Order order) { process(order); }

@RabbitListener(queues = "orders.normal", concurrency = "3")  // 3 consumers
public void processNormal(Order order) { process(order); }

@RabbitListener(queues = "orders.low", concurrency = "1")     // 1 consumer
public void processLow(Order order) { process(order); }
```

---

## Outbox Pattern

### Vấn đề: Dual Write

```
❌ DUAL WRITE PROBLEM:
  1. Save to DB  ✅ (committed)
  2. Publish to RabbitMQ  ❌ (fails — network error)
  → DB có data nhưng event mất → INCONSISTENCY

❌ REVERSE:
  1. Publish to RabbitMQ  ✅ 
  2. Save to DB  ❌ (fails)
  → Event published nhưng data chưa save → INCONSISTENCY
```

### Giải pháp: Outbox Table

```java
// Bước 1: Save entity + outbox event trong CÙNG 1 DB TRANSACTION

@Entity
@Table(name = "outbox_events")
public class OutboxEvent {
    @Id @GeneratedValue
    private Long id;
    private String aggregateType;    // "Order"
    private String aggregateId;      // orderId
    private String eventType;        // "ORDER_CREATED" 
    private String payload;          // JSON
    private Instant createdAt;
    private boolean sent;            // false = chưa publish
}

@Service
public class OrderService {
    
    @Transactional  // ← CÙNG 1 TRANSACTION
    public Order createOrder(OrderDTO dto) {
        // Save entity
        Order order = orderRepo.save(dto.toEntity());
        
        // Save outbox event (SAME transaction → atomic)
        OutboxEvent event = new OutboxEvent(
            "Order", order.getId().toString(), "ORDER_CREATED",
            toJson(order), Instant.now(), false);
        outboxRepo.save(event);
        
        return order;
    }
}

// Bước 2: Background job poll outbox table → publish tới RabbitMQ

@Scheduled(fixedDelay = 1000)  // Mỗi 1 giây
@Transactional
public void publishOutboxEvents() {
    List<OutboxEvent> pending = outboxRepo.findBysentFalseOrderByCreatedAt();
    
    for (OutboxEvent event : pending) {
        try {
            rabbitTemplate.convertAndSend(
                "events", 
                event.getAggregateType().toLowerCase() + "." + 
                    event.getEventType().toLowerCase(),
                event.getPayload());
            
            event.setSent(true);
            outboxRepo.save(event);
        } catch (Exception e) {
            log.error("Failed to publish outbox event {}", event.getId(), e);
            break;  // Retry next cycle
        }
    }
}

// Bước 3: Consumer phải IDEMPOTENT (vì outbox có thể publish duplicate)
```

---

## Rate Limiting

### Consumer Throttling

```java
// Giới hạn consumer xử lý N messages/giây
// Dùng Semaphore hoặc RateLimiter

@Component
public class RateLimitedConsumer {

    // Guava RateLimiter: max 100 messages/giây
    private final RateLimiter rateLimiter = RateLimiter.create(100.0);

    @RabbitListener(queues = "api-requests")
    public void processRequest(ApiRequest request) {
        rateLimiter.acquire();  // Block nếu vượt rate
        apiService.handle(request);
    }
}

// Hoặc dùng prefetch để giới hạn
// prefetch = 1 + slow processing = natural rate limiting
```

---

## Message Deduplication

```java
// RabbitMQ KHÔNG dedup tự động
// Application phải tự xử lý

// Strategy 1: In-memory cache (đơn giản, không share giữa instances)
@Component
public class DeduplicatingConsumer {
    
    private final Cache<String, Boolean> processedIds = CacheBuilder.newBuilder()
        .maximumSize(100_000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build();

    @RabbitListener(queues = "events")
    public void processEvent(Event event, 
                              @Header("amqp_messageId") String messageId) {
        if (processedIds.getIfPresent(messageId) != null) {
            return; // Duplicate → skip
        }
        
        eventService.process(event);
        processedIds.put(messageId, true);
    }
}

// Strategy 2: Database unique constraint (distributed, reliable)
// Xem phần Idempotent Consumer ở bài 07
```

---

## Tổng hợp Patterns

| Pattern | Use Case | Exchange Type |
| :--- | :--- | :--- |
| **Work Queue** | Task distribution, parallel processing | Default ("") |
| **Pub/Sub** | Broadcast notifications | Fanout |
| **Selective Pub/Sub** | Category-based routing | Topic |
| **RPC** | Synchronous request/reply | Direct |
| **Saga** | Distributed transactions | Topic |
| **Retry + Backoff** | Transient failure handling | Direct (retry queues) |
| **Outbox** | DB + Message consistency | Any |
| **Event Sourcing** | Audit trail, read model sync | Topic |
| **Priority** | VIP / urgent processing | Multiple queues |
| **Deduplication** | At-least-once → effectively-once | Any |

---

## Câu hỏi thường gặp

### Q1: Choreography vs Orchestrator Saga?

**Choreography**: Services tự react events → đơn giản, loose coupling, nhưng khó debug flow phức tạp.
**Orchestrator**: Central orchestrator điều phối → dễ theo dõi, nhưng orchestrator là single point.
→ Dùng **Choreography** cho flows đơn giản (2-3 steps), **Orchestrator** cho flows phức tạp (4+ steps).

### Q2: Outbox pattern có cần Change Data Capture?

Có 2 cách implement outbox:
1. **Polling** (đơn giản): Scheduled job poll outbox table → publish
2. **CDC** (Debezium): Monitor DB transaction log → publish tự động → latency thấp hơn, không cần polling

### Q3: Spring Retry vs Retry Queues?

**Spring Retry**: In-process retry, block thread, đơn giản. Dùng cho lỗi ngắn (network blip).
**Retry Queues**: Out-of-process, không block, delay configurable. Dùng cho lỗi cần chờ (service down 5 phút).

---

## Tổng kết

- **Work Queue**: Round-robin + prefetch=1 cho fair dispatch
- **RPC**: `convertSendAndReceive()` + correlation ID
- **Saga**: Choreography (event-driven) hoặc Orchestrator (centralized)
- **Retry**: Delay queues (5s → 30s → 5m → DLQ) cho exponential backoff
- **Outbox**: Save event + entity trong cùng transaction → poll + publish
- **Idempotency**: Message ID + dedup table/cache → handle duplicates
- **Priority**: Multiple queues + weighted consumers (Quorum Queue không hỗ trợ priority)
