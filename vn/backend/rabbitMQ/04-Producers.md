# Producers - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Publishing Messages](#publishing-messages)
2. [Message Properties](#message-properties)
3. [Publisher Confirms](#publisher-confirms)
4. [Message Persistence](#message-persistence)
5. [Error Handling](#error-handling)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Publishing Messages

### Basic Publishing

```java
// RabbitTemplate: Spring AMQP template
@Autowired
private RabbitTemplate rabbitTemplate;

// Publish message
rabbitTemplate.convertAndSend("exchange", "routing.key", message);

// Publish với exchange và routing key
rabbitTemplate.convertAndSend("order-exchange", "order.created", orderEvent);
```

### Direct Send

```java
// Send Message object directly
MessageProperties props = new MessageProperties();
props.setContentType("application/json");
Message message = new Message("data".getBytes(), props);
rabbitTemplate.send("exchange", "routing.key", message);
```

---

## Message Properties

### Basic Properties

```java
// Message Properties
MessageProperties props = new MessageProperties();

// Content type
props.setContentType("application/json");

// Message ID
props.setMessageId(UUID.randomUUID().toString());

// Timestamp
props.setTimestamp(new Date());

// Priority
props.setPriority(5);

// Headers
props.setHeader("source", "order-service");
props.setHeader("version", "1.0");

Message message = new Message("data".getBytes(), props);
rabbitTemplate.send("exchange", "routing.key", message);
```

### Delivery Mode

```java
// Delivery Mode: Persistent vs Non-persistent
MessageProperties props = new MessageProperties();

// Persistent: Survives broker restart
props.setDeliveryMode(MessageDeliveryMode.PERSISTENT);

// Non-persistent: Lost on broker restart (faster)
props.setDeliveryMode(MessageDeliveryMode.NON_PERSISTENT);
```

---

## Publisher Confirms

### Enable Publisher Confirms

```java
// Configuration
@Configuration
public class RabbitMQConfig {
    @Bean
    public CachingConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost("localhost");
        factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
        factory.setPublisherReturns(true);
        return factory;
    }
}

// ConfirmCallback
rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
    if (ack) {
        System.out.println("Message confirmed");
    } else {
        System.out.println("Message not confirmed: " + cause);
    }
});
```

### ReturnCallback

```java
// ReturnCallback: Called when message returned (no route)
rabbitTemplate.setReturnCallback((message, replyCode, replyText, exchange, routingKey) -> {
    System.out.println("Message returned: " + replyText);
});
```

---

## Message Persistence

### Persistent Messages

```java
// Persistent message
MessageProperties props = new MessageProperties();
props.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
Message message = new Message("data".getBytes(), props);
rabbitTemplate.send("exchange", "routing.key", message);

// Requirements:
// 1. Message: DeliveryMode.PERSISTENT
// 2. Exchange: Durable
// 3. Queue: Durable
```

---

## Error Handling

### Handle Publishing Errors

```java
// Try-catch
try {
    rabbitTemplate.convertAndSend("exchange", "routing.key", message);
} catch (AmqpException e) {
    // Handle error
    log.error("Failed to publish message", e);
    // Retry, DLQ, etc.
}

// With ConfirmCallback
rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
    if (!ack) {
        // Handle failure
        handlePublishFailure(correlationData, cause);
    }
});
```

---

## Câu hỏi thường gặp

### Q1: Publisher Confirms vs Transactions?

```java
// Publisher Confirms:
// - Asynchronous
// - Better performance
// - Recommended

// Transactions:
// - Synchronous
// - Slower
// - Use when: Need transactional guarantees
```

### Q2: Message Persistence?

```java
// Persistent message:
// 1. Message: DeliveryMode.PERSISTENT
// 2. Exchange: Durable
// 3. Queue: Durable

// All three required for persistence
```

---

## Best Practices

1. **Use Publisher Confirms**: Ensure message delivery
2. **Persist important messages**: DeliveryMode.PERSISTENT
3. **Handle errors**: Retry, DLQ
4. **Set message properties**: ID, timestamp, headers
5. **Monitor publishing**: Track success/failure rates

---

## Tổng kết

- **Publishing**: RabbitTemplate.convertAndSend()
- **Message Properties**: Content type, priority, headers
- **Publisher Confirms**: Ensure delivery
- **Message Persistence**: Persistent delivery mode
- **Error Handling**: Try-catch, callbacks
- **Best Practices**: Confirms, persistence, error handling
