# Queues - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Queue Declaration](#queue-declaration)
2. [Queue Properties](#queue-properties)
3. [Dead Letter Queues](#dead-letter-queues)
4. [Priority Queues](#priority-queues)
5. [Queue Arguments](#queue-arguments)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Queue Declaration

### Basic Queue

```java
// Declare queue
@Bean
public Queue orderQueue() {
    return new Queue("order-queue", true);  // durable
}

// Or with arguments
@Bean
public Queue orderQueue() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-message-ttl", 60000);  // 60 seconds
    return new Queue("order-queue", true, false, false, args);
}
```

### Queue Parameters

```java
// Queue(name, durable, exclusive, autoDelete, arguments)
Queue queue = new Queue(
    "order-queue",    // name
    true,            // durable (survive broker restart)
    false,           // exclusive (only this connection)
    false,           // autoDelete (delete when unused)
    arguments         // additional arguments
);
```

---

## Queue Properties

### Durable

```java
// Durable: Queue survives broker restart
@Bean
public Queue durableQueue() {
    return new Queue("durable-queue", true);  // durable = true
}

// Non-durable: Lost on broker restart
@Bean
public Queue nonDurableQueue() {
    return new Queue("non-durable-queue", false);  // durable = false
}
```

### Exclusive

```java
// Exclusive: Only accessible by declaring connection
@Bean
public Queue exclusiveQueue() {
    return new Queue("exclusive-queue", false, true, false);
    // exclusive = true
}

// Use case: Temporary queues
// Auto-deleted when connection closes
```

### Auto-Delete

```java
// Auto-Delete: Deleted when last consumer unsubscribes
@Bean
public Queue autoDeleteQueue() {
    return new Queue("auto-delete-queue", false, false, true);
    // autoDelete = true
}

// Use case: Temporary queues
// Cleaned up automatically
```

---

## Dead Letter Queues

### What is DLQ?

**Dead Letter Queue (DLQ)** là queue chứa messages không thể được processed.

### When messages go to DLQ?

```java
// Messages go to DLQ khi:
// 1. Message rejected (NACK) và requeue = false
// 2. Message TTL expired
// 3. Queue length limit exceeded
// 4. Message rejected multiple times
```

### DLQ Configuration

```java
// Configure DLQ
@Bean
public Queue orderQueue() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-dead-letter-exchange", "dlx");  // Dead letter exchange
    args.put("x-dead-letter-routing-key", "order.failed");  // Routing key
    return new Queue("order-queue", true, false, false, args);
}

@Bean
public DirectExchange dlx() {
    return new DirectExchange("dlx");
}

@Bean
public Queue dlq() {
    return new Queue("order-dlq", true);
}

@Bean
public Binding dlqBinding() {
    return BindingBuilder
        .bind(dlq())
        .to(dlx())
        .with("order.failed");
}
```

### DLQ Usage

```java
// Consumer rejects message
@RabbitListener(queues = "order-queue")
public void processOrder(Order order) {
    try {
        // Process order
        process(order);
    } catch (Exception e) {
        // Reject và don't requeue → Goes to DLQ
        throw new AmqpRejectAndDontRequeueException("Processing failed");
    }
}

// DLQ Consumer
@RabbitListener(queues = "order-dlq")
public void handleFailedOrder(Order order) {
    // Handle failed messages
    log.error("Failed order: " + order);
    // Manual processing, alert, etc.
}
```

---

## Priority Queues

### Priority Queue

```java
// Priority Queue: Messages với higher priority processed first
@Bean
public Queue priorityQueue() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-max-priority", 10);  // Max priority level
    return new Queue("priority-queue", true, false, false, args);
}

// Publish với priority
MessageProperties props = new MessageProperties();
props.setPriority(5);  // Higher priority
Message message = new Message("data".getBytes(), props);
rabbitTemplate.send("exchange", "routing.key", message);
```

---

## Queue Arguments

### Common Arguments

```java
// x-message-ttl: Message TTL (time to live)
args.put("x-message-ttl", 60000);  // 60 seconds

// x-expires: Queue TTL (queue deleted after idle time)
args.put("x-expires", 3600000);  // 1 hour

// x-max-length: Max queue length
args.put("x-max-length", 1000);

// x-max-length-bytes: Max queue size in bytes
args.put("x-max-length-bytes", 10485760);  // 10 MB

// x-dead-letter-exchange: Dead letter exchange
args.put("x-dead-letter-exchange", "dlx");

// x-dead-letter-routing-key: Dead letter routing key
args.put("x-dead-letter-routing-key", "failed");

// x-max-priority: Max priority level
args.put("x-max-priority", 10);

// x-single-active-consumer: Only one active consumer
args.put("x-single-active-consumer", true);
```

---

## Câu hỏi thường gặp

### Q1: Durable vs Non-durable?

```java
// Durable:
// - Survives broker restart
// - Messages persisted
// - Use for: Important messages

// Non-durable:
// - Lost on broker restart
// - Faster (no disk I/O)
// - Use for: Temporary messages
```

### Q2: Khi nào dùng DLQ?

```java
// Use DLQ khi:
// - Messages fail processing
// - Need to inspect failed messages
// - Manual retry needed
// - Alerting on failures
```

### Q3: Priority Queue use cases?

```java
// Use Priority Queue khi:
// - Different message priorities
// - VIP customers
// - Urgent orders
// - Different processing speeds needed
```

---

## Best Practices

1. **Use durable queues**: For important messages
2. **Configure DLQ**: Handle failed messages
3. **Set TTL**: Prevent message accumulation
4. **Monitor queue length**: Prevent memory issues
5. **Use priority**: When priorities matter

---

## Tổng kết

- **Queue Declaration**: Durable, exclusive, autoDelete
- **Queue Properties**: Configure based on needs
- **Dead Letter Queue**: Handle failed messages
- **Priority Queue**: Process by priority
- **Queue Arguments**: TTL, length limits, etc.
- **Best Practices**: Durable, DLQ, monitoring
