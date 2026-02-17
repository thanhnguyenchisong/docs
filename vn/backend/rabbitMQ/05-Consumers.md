# Consumers - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Consuming Messages](#consuming-messages)
2. [Acknowledgment](#acknowledgment)
3. [Consumer Prefetch](#consumer-prefetch)
4. [Consumer Tags](#consumer-tags)
5. [Error Handling](#error-handling)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Consuming Messages

### @RabbitListener

```java
// Consumer với @RabbitListener
@Component
public class OrderConsumer {
    @RabbitListener(queues = "order-queue")
    public void processOrder(Order order) {
        // Process order
        orderService.process(order);
    }
}
```

### Multiple Queues

```java
// Listen to multiple queues
@RabbitListener(queues = {"order-queue", "payment-queue"})
public void processMessage(Message message) {
    // Process message
}
```

---

## Acknowledgment

### Auto Acknowledgment

```java
// Auto ACK: Automatic acknowledgment
@RabbitListener(queues = "order-queue", ackMode = "AUTO")
public void processOrder(Order order) {
    // Automatically ACKed after method returns
    orderService.process(order);
}
```

### Manual Acknowledgment

```java
// Manual ACK: Manual acknowledgment
@RabbitListener(queues = "order-queue", ackMode = "MANUAL")
public void processOrder(Order order, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    try {
        orderService.process(order);
        // ACK: Message processed successfully
        channel.basicAck(tag, false);
    } catch (Exception e) {
        // NACK: Message processing failed
        channel.basicNack(tag, false, true);  // requeue = true
    }
}
```

### Acknowledgment Modes

```java
// NONE: No acknowledgment (not recommended)
ackMode = "NONE"

// AUTO: Automatic (default)
ackMode = "AUTO"

// MANUAL: Manual acknowledgment
ackMode = "MANUAL"
```

---

## Consumer Prefetch

### Prefetch Count

```java
// Prefetch: Number of unacknowledged messages per consumer
// Configuration
@Configuration
public class RabbitMQConfig {
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory() {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory());
        factory.setPrefetchCount(10);  // Max 10 unacknowledged messages
        return factory;
    }
}

// Or in application.properties
spring.rabbitmq.listener.simple.prefetch=10
```

### Prefetch Impact

```java
// Low prefetch (1):
// - Fair distribution
// - Slower processing
// - Use for: Long-running tasks

// High prefetch (100+):
// - Faster processing
// - Uneven distribution
// - Use for: Fast tasks
```

---

## Consumer Tags

### Consumer Tag

```java
// Consumer Tag: Unique identifier for consumer
@RabbitListener(queues = "order-queue")
public void processOrder(Order order, @Header(AmqpHeaders.CONSUMER_TAG) String consumerTag) {
    System.out.println("Consumer tag: " + consumerTag);
    orderService.process(order);
}
```

---

## Error Handling

### Exception Handling

```java
// Handle exceptions
@RabbitListener(queues = "order-queue")
public void processOrder(Order order) {
    try {
        orderService.process(order);
    } catch (Exception e) {
        // Handle error
        log.error("Failed to process order", e);
        // Retry, DLQ, etc.
        throw new AmqpRejectAndDontRequeueException("Processing failed");
    }
}
```

### Retry

```java
// Retry configuration
@Configuration
public class RabbitMQConfig {
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory() {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory());
        
        // Retry
        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(new SimpleRetryPolicy(3));  // 3 retries
        factory.setRetryTemplate(retryTemplate);
        
        return factory;
    }
}
```

---

## Câu hỏi thường gặp

### Q1: ACK vs NACK?

```java
// ACK: Message processed successfully
// - Message removed from queue
// - Processing complete

// NACK: Message processing failed
// - requeue = true: Message back to queue
// - requeue = false: Message to DLQ (if configured)
```

### Q2: Prefetch count nên là bao nhiêu?

```java
// Depends on:
// - Processing time
// - Number of consumers
// - Fairness requirements

// Rule of thumb:
// - Fast processing: Higher prefetch (50-100)
// - Slow processing: Lower prefetch (1-10)
// - Fair distribution: Prefetch = 1
```

---

## Best Practices

1. **Acknowledge properly**: ACK on success, NACK on failure
2. **Set prefetch**: Based on processing time
3. **Handle errors**: Retry, DLQ
4. **Idempotent processing**: Handle duplicates
5. **Monitor consumers**: Track processing rates

---

## Tổng kết

- **Consuming**: @RabbitListener
- **Acknowledgment**: AUTO, MANUAL, NONE
- **Prefetch**: Control message flow
- **Error Handling**: Retry, DLQ
- **Best Practices**: Proper ACK, prefetch, error handling
