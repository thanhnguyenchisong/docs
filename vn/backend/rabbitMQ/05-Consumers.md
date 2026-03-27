# Consumers - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Consumer Model](#consumer-model)
2. [Consuming Messages](#consuming-messages)
3. [Acknowledgment chuyên sâu](#acknowledgment-chuyên-sâu)
4. [Consumer Prefetch](#consumer-prefetch)
5. [Concurrency & Scaling](#concurrency--scaling)
6. [Error Handling chuyên sâu](#error-handling-chuyên-sâu)
7. [Consumer Lifecycle](#consumer-lifecycle)
8. [Consumer Patterns](#consumer-patterns)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Consumer Model

### Push vs Pull

```
RabbitMQ mặc định dùng PUSH model:
- Broker push messages tới consumer
- Controlled bằng prefetch count
- Phù hợp hầu hết use cases

Pull (basic.get):
- Consumer tự lấy message khi cần
- Không hiệu quả (polling overhead)
- Chỉ dùng khi cần kiểm soát tuyệt đối timing

Spring AMQP: Luôn dùng Push (MessageListenerContainer)
```

### Consumer Registration

```
Khi consumer đăng ký:
1. Client mở Channel
2. Channel gửi basic.consume(queue, consumer_tag)
3. Broker bắt đầu push messages qua channel
4. Mỗi message: Method(Basic.Deliver) + Header + Body frames
5. Consumer xử lý → gửi ACK/NACK
6. Broker xóa message (nếu ACK) hoặc requeue (nếu NACK+requeue)
```

---

## Consuming Messages

### @RabbitListener cơ bản

```java
@Component
public class OrderConsumer {

    // Basic consumer
    @RabbitListener(queues = "order-queue")
    public void processOrder(Order order) {
        orderService.process(order);
    }

    // Nhận raw Message
    @RabbitListener(queues = "order-queue")
    public void processRaw(Message message) {
        byte[] body = message.getBody();
        String contentType = message.getMessageProperties().getContentType();
        // ...
    }

    // Nhận với headers
    @RabbitListener(queues = "order-queue")
    public void processWithHeaders(
            Order order,
            @Header("amqp_messageId") String messageId,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag,
            @Header(AmqpHeaders.CONSUMER_TAG) String consumerTag,
            @Header(value = "source", required = false) String source) {
        log.info("Processing order {} from {} (tag: {})", 
                 messageId, source, deliveryTag);
        orderService.process(order);
    }
}
```

### @RabbitListener nâng cao

```java
// Khai báo queue + binding NGAY trong listener
@RabbitListener(bindings = @QueueBinding(
    value = @Queue(value = "order-events", durable = "true", 
                   arguments = @Argument(name = "x-queue-type", value = "quorum")),
    exchange = @Exchange(value = "events", type = ExchangeTypes.TOPIC),
    key = "order.*"
))
public void handleOrderEvent(OrderEvent event) {
    // Queue, Exchange, Binding được tự động khai báo
}

// Nhiều queues
@RabbitListener(queues = {"order-queue", "payment-queue", "notification-queue"})
public void handleMultipleQueues(Message message) {
    String queue = message.getMessageProperties().getConsumerQueue();
    // Xử lý theo queue
}

// Container factory tùy chỉnh
@RabbitListener(queues = "bulk-queue", containerFactory = "batchFactory")
public void processBatch(List<Order> orders) {
    // Batch consumer: nhận nhiều messages cùng lúc
    orderRepo.saveAll(orders);
}
```

---

## Acknowledgment chuyên sâu

### 3 ACK Modes

```java
// 1. NONE (Auto ACK tại broker side)
// - Broker gửi message → NGAY LẬP TỨC xóa khỏi queue
// - Consumer chưa xử lý xong mà crash → MESSAGE MẤT
// ❌ KHÔNG dùng cho production

// 2. AUTO (Spring AMQP default)
// - Method return thành công → Spring tự gửi ACK
// - Method throw exception → Spring tự gửi NACK/REJECT
// ✅ Phù hợp hầu hết cases

// 3. MANUAL
// - Developer tự gọi channel.basicAck() / basicNack()
// - Kiểm soát tuyệt đối
// ✅ Phù hợp khi cần logic phức tạp (batch ACK, selective requeue)
```

### Manual ACK chi tiết

```java
@RabbitListener(queues = "order-queue", ackMode = "MANUAL")
public void processOrder(Order order, Channel channel,
                          @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    try {
        // Xử lý business logic
        orderService.process(order);
        
        // ACK: Xác nhận đã xử lý thành công
        channel.basicAck(
            tag,      // delivery tag
            false     // multiple: false = chỉ ACK message này
                      //           true = ACK tất cả messages <= tag
        );
        
    } catch (RecoverableException e) {
        // NACK + Requeue: Lỗi tạm thời, thử lại
        channel.basicNack(
            tag,
            false,    // multiple
            true      // requeue = true → message quay lại queue
        );
        
    } catch (PermanentException e) {
        // NACK + No Requeue: Lỗi vĩnh viễn → chuyển DLQ
        channel.basicNack(
            tag,
            false,
            false     // requeue = false → message tới DLQ
        );
        
    } catch (Exception e) {
        // REJECT: Từ chối message (tương tự NACK(multiple=false))
        channel.basicReject(
            tag,
            false     // requeue = false → DLQ
        );
    }
}
```

### Batch ACK (Performance)

```java
// ACK nhiều messages cùng lúc → giảm network roundtrips
private final AtomicInteger counter = new AtomicInteger(0);
private long lastTag;

@RabbitListener(queues = "events", ackMode = "MANUAL")
public void processBatchAck(Event event, Channel channel,
                             @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    eventService.process(event);
    lastTag = tag;
    
    if (counter.incrementAndGet() % 50 == 0) {
        // ACK tất cả messages <= lastTag
        channel.basicAck(lastTag, true);  // multiple = true
    }
}
```

### Unacked Message Timeout

```
⚠️ QUAN TRỌNG: Nếu consumer nhận message nhưng KHÔNG ACK/NACK:
- Message ở trạng thái "unacked" trên broker
- Chiếm memory trên broker
- KHÔNG được giao cho consumer khác
- Khi consumer disconnect → message tự động requeue

Dấu hiệu: unacked count tăng liên tục trên Management UI
Fix: Kiểm tra consumer code (thiếu ACK, deadlock, infinite loop)
```

---

## Consumer Prefetch

### Prefetch là gì?

```
Prefetch = Số messages RabbitMQ gửi trước cho consumer CHƯA CẦN ACK
         = "Buffer size" trên consumer side

Prefetch = 1:
  Broker → [msg1] → Consumer  (chờ ACK)
  Consumer ACK msg1
  Broker → [msg2] → Consumer  (chờ ACK)
  
Prefetch = 10:
  Broker → [msg1, msg2, ... msg10] → Consumer
  Consumer xử lý song song (hoặc tuần tự)
  Consumer ACK msg1 → Broker gửi msg11
  Consumer ACK msg2 → Broker gửi msg12
```

### Chọn Prefetch Count

```properties
# Spring AMQP
spring.rabbitmq.listener.simple.prefetch=25

# Per queue / per channel?
# - Per channel (mặc định): prefetch áp dụng cho channel
# - Per consumer: spring.rabbitmq.listener.simple.prefetch áp dụng per consumer
```

| Processing Time | Recommended Prefetch | Lý do |
| :--- | :--- | :--- |
| < 1ms (fast) | 50-100 | Consumer cần buffer lớn để không idle |
| 1-10ms (normal) | 10-25 | Balance giữa throughput và fairness |
| 10-100ms (slow) | 5-10 | Tránh message tồn đọng ở 1 consumer |
| > 100ms (very slow) | 1-3 | Fair dispatch, tránh starvation |
| Variable | 1 | Fair nhất, nhưng throughput thấp nhất |

### Prefetch vs Throughput

```
Prefetch quá thấp (1):
  ✅ Fair dispatch giữa consumers
  ❌ Low throughput (consumer idle chờ message)
  ❌ Nhiều network roundtrips

Prefetch quá cao (1000):
  ✅ High throughput (consumer luôn có sẵn message)
  ❌ Unfair: 1 consumer "ôm" nhiều messages
  ❌ Memory trên consumer side cao
  ❌ Nếu consumer crash → 1000 messages requeue

→ Sweet spot: 10-25 cho hầu hết cases
```

---

## Concurrency & Scaling

### Concurrency trong Spring AMQP

```properties
# Số consumer threads cho mỗi @RabbitListener
spring.rabbitmq.listener.simple.concurrency=5        # Khởi động 5 consumers
spring.rabbitmq.listener.simple.max-concurrency=10   # Max 10 consumers
# Auto-scale: 5 → 10 dựa trên queue load
```

```java
// Override per listener
@RabbitListener(queues = "heavy-queue", concurrency = "3-15")
public void processHeavyTask(Task task) {
    // 3 consumer threads, scale lên tối đa 15
}

@RabbitListener(queues = "light-queue", concurrency = "1")
public void processLightTask(Task task) {
    // Chỉ 1 consumer (ordered processing)
}
```

### Scaling Strategies

```
1. Vertical: Tăng concurrency (threads trong 1 instance)
   spring.rabbitmq.listener.simple.concurrency=20
   Giới hạn: CPU cores, memory của instance
   
2. Horizontal: Thêm instances (nhiều pods/containers)
   Deploy 5 pods → mỗi pod 5 consumers → 25 consumers tổng
   ✅ Scale tốt hơn, HA hơn
   
3. Queue sharding: Nhiều queues + consistent hash exchange
   Mỗi consumer group xử lý 1 queue shard
   ✅ Throughput cao nhất

Rule:
- < 10K msg/s: Tăng concurrency là đủ
- 10K-50K msg/s: Horizontal scaling (thêm instances)
- > 50K msg/s: Queue sharding + horizontal scaling
```

### DirectMessageListenerContainer (DMLC) vs SimpleMessageListenerContainer (SMLC)

```java
// SMLC (mặc định): 1 thread per consumer, blocking
// Dùng khi: Đơn giản, hầu hết cases
spring.rabbitmq.listener.type=simple

// DMLC: 1 thread per queue (chia sẻ giữa consumers)
// Dùng khi: Rất nhiều queues, cần tiết kiệm threads
spring.rabbitmq.listener.type=direct

// DMLC:
// ✅ Ít threads hơn (1 thread per queue, không per consumer)
// ✅ Tốt cho hàng trăm queues
// ❌ consumer tag là phía client (manual manage)
// ❌ Không hỗ trợ auto-scale concurrency
```

---

## Error Handling chuyên sâu

### Default Error Handling

```java
// Spring AMQP mặc định:
// 1. Method throw exception → message REJECTED
// 2. Nếu có retry → retry theo config
// 3. Hết retry → AmqpRejectAndDontRequeueException → DLQ

// Config retry
@Bean
public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
        ConnectionFactory cf) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(cf);
    
    // Retry
    RetryTemplate retryTemplate = new RetryTemplate();
    retryTemplate.setRetryPolicy(new SimpleRetryPolicy(3));  // 3 attempts
    retryTemplate.setBackOffPolicy(new ExponentialBackOffPolicy() {{
        setInitialInterval(1000);    // 1s
        setMultiplier(2.0);          // 1s → 2s → 4s
        setMaxInterval(10_000);       // Cap 10s
    }});
    factory.setRetryTemplate(retryTemplate);
    
    // Recovery: Sau khi hết retry
    factory.setRejectAndDontRequeueRecoverer(
        new RejectAndDontRequeueRecoverer()  // → DLQ
    );
    
    return factory;
}
```

### Custom Error Handler

```java
@Bean
public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
        ConnectionFactory cf) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(cf);
    
    factory.setErrorHandler(new ConditionalRejectingErrorHandler(cause -> {
        // Return true nếu lỗi FATAL (không retry)
        return cause instanceof MessageConversionException  // JSON parse lỗi
            || cause instanceof MethodArgumentNotValidException  // Validation fail
            || cause instanceof MethodArgumentTypeMismatchException;
    }));
    
    return factory;
}
```

### Exception Classification

```java
// Phân loại exception để quyết định retry hay reject

@RabbitListener(queues = "order-queue")
public void processOrder(Order order) {
    try {
        orderService.process(order);
    } catch (TransientException e) {
        // Lỗi tạm thời: DB connection, timeout, 503
        // → Throw để Spring retry
        throw e;
    } catch (BusinessException e) {
        // Lỗi business: invalid input, duplicate, insufficient funds
        // → KHÔNG retry (sẽ fail mãi) → DLQ
        throw new AmqpRejectAndDontRequeueException("Business error: " + e.getMessage(), e);
    } catch (Exception e) {
        // Lỗi không xác định → NACK, tùy config sẽ retry hoặc DLQ
        throw e;
    }
}
```

---

## Consumer Lifecycle

### Container Lifecycle

```java
@Component
public class ConsumerLifecycleManager {

    @Autowired
    private RabbitListenerEndpointRegistry registry;

    // Pause consumer (graceful — chờ message đang xử lý xong)
    public void pauseConsumer(String listenerId) {
        MessageListenerContainer container = registry.getListenerContainer(listenerId);
        if (container != null) {
            container.stop();  // Stop consuming, chờ in-flight messages
        }
    }

    // Resume consumer
    public void resumeConsumer(String listenerId) {
        MessageListenerContainer container = registry.getListenerContainer(listenerId);
        if (container != null) {
            container.start();
        }
    }

    // Check trạng thái
    public boolean isRunning(String listenerId) {
        MessageListenerContainer container = registry.getListenerContainer(listenerId);
        return container != null && container.isRunning();
    }
}

// Sử dụng id để identify listener
@RabbitListener(id = "orderConsumer", queues = "order-queue")
public void processOrder(Order order) { ... }
```

### Graceful Shutdown

```properties
# Spring Boot graceful shutdown
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# Khi shutdown:
# 1. Stop container (ngừng nhận message mới)
# 2. Chờ in-flight messages xử lý xong (max 30s)
# 3. ACK messages đã xử lý
# 4. Close channels, connections
# 5. Unprocessed messages tự requeue (broker auto-requeue khi connection close)
```

---

## Consumer Patterns

### Idempotent Consumer

```java
@RabbitListener(queues = "order-queue")
@Transactional
public void processOrder(Order order,
                          @Header("amqp_messageId") String messageId) {
    // 1. Dedup check
    if (processedRepo.existsByMessageId(messageId)) {
        return; // Already processed, skip
    }
    
    // 2. Process
    orderService.process(order);
    
    // 3. Mark as processed (cùng transaction)
    processedRepo.save(new ProcessedMessage(messageId));
}
```

### Single Active Consumer

```java
// Chỉ 1 consumer active tại 1 thời điểm (ordering guarantee)
@Bean
public Queue orderedQueue() {
    return QueueBuilder.durable("ordered-events")
        .withArgument("x-single-active-consumer", true)
        .build();
}

// Khi active consumer fail → RabbitMQ failover sang consumer backup
// Use case: Sequential processing where ORDER MATTERS
```

### Competing Consumers

```java
// Nhiều consumers cùng queue → parallel processing
@RabbitListener(queues = "task-queue", concurrency = "5")
public void processTask(Task task) {
    // 5 consumer threads song song
    taskService.execute(task);
}

// + Prefetch = 1 cho fair dispatch
// Kết quả: Tasks phân bổ đều giữa consumers
```

---

## Câu hỏi thường gặp

### Q1: Prefetch nên là bao nhiêu?

Phụ thuộc processing time. Fast tasks (< 1ms): 50-100. Normal (1-10ms): 10-25. Slow (> 100ms): 1-5. Bắt đầu với 25, monitor consumer utilization và queue length, điều chỉnh.

### Q2: Tăng concurrency hay thêm instances?

Tăng concurrency trước (đơn giản hơn). Khi hết CPU/memory trên instance → thêm instances (horizontal scaling). Kubernetes: HPA dựa trên queue length metrics.

### Q3: Consumer crash khi đang xử lý message?

Connection bị đóng → RabbitMQ tự **requeue** tất cả unacked messages (trừ AUTO ACK mode → message mất). Đây là lý do **PHẢI dùng manual ACK** hoặc Spring **AUTO mode** (ACK sau khi method return).

### Q4: Có thể pause/resume consumer không?

Có. Dùng `RabbitListenerEndpointRegistry` để `stop()` / `start()` container. Use case: maintenance window, circuit breaker, graceful degradation.

### Q5: DMLC hay SMLC?

**SMLC** (SimpleMessageListenerContainer) cho hầu hết cases. **DMLC** (DirectMessageListenerContainer) khi có hàng trăm queues cần tiết kiệm threads. SMLC dễ dùng, hỗ trợ auto-scale concurrency.

---

## Tổng kết

- **Consumer Model**: Push-based, @RabbitListener
- **ACK Modes**: NONE (risky), AUTO (recommended), MANUAL (full control)
- **Prefetch**: 10-25 cho hầu hết cases, tune theo processing time
- **Concurrency**: `concurrency = "5-10"` cho auto-scale threads
- **Scaling**: Vertical (concurrency) → Horizontal (instances) → Sharding
- **Error Handling**: Classify exceptions (transient vs permanent), retry + DLQ
- **Lifecycle**: Graceful shutdown, pause/resume qua Registry
- **Patterns**: Idempotent consumer, Single Active Consumer, Competing Consumers
