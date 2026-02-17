# Exchanges và Routing - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Exchange Types](#exchange-types)
2. [Direct Exchange](#direct-exchange)
3. [Topic Exchange](#topic-exchange)
4. [Fanout Exchange](#fanout-exchange)
5. [Headers Exchange](#headers-exchange)
6. [Routing Keys](#routing-keys)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Exchange Types

### Exchange Types Overview

```java
// 4 Exchange Types:
// 1. Direct: Exact routing key match
// 2. Topic: Pattern-based routing
// 3. Fanout: Broadcast to all queues
// 4. Headers: Header-based routing
```

---

## Direct Exchange

### How it works

```java
// Direct Exchange: Routes message to queue với exact routing key match
// Routing Key: "order.created" → Queue với binding key "order.created"

Exchange: order-exchange (Direct)
├── Queue: order-queue (binding key: "order.created")
├── Queue: payment-queue (binding key: "payment.processed")
└── Queue: notification-queue (binding key: "notification.send")
```

### Implementation

```java
// Create Direct Exchange
@Configuration
public class RabbitMQConfig {
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order-exchange");
    }
    
    @Bean
    public Queue orderQueue() {
        return new Queue("order-queue", true);
    }
    
    @Bean
    public Binding orderBinding() {
        return BindingBuilder
            .bind(orderQueue())
            .to(orderExchange())
            .with("order.created");
    }
}

// Publish message
rabbitTemplate.convertAndSend("order-exchange", "order.created", orderEvent);

// Consumer receives message với routing key "order.created"
```

### Use Cases

```java
// Use Direct Exchange khi:
// - Simple routing (one-to-one)
// - Exact routing key match
// - Task queues
// - RPC pattern
```

---

## Topic Exchange

### How it works

```java
// Topic Exchange: Routes based on pattern matching
// Routing Key: "order.created.vip" matches "order.created.*"

Exchange: events-exchange (Topic)
├── Queue: order-queue (binding key: "order.*")
├── Queue: payment-queue (binding key: "payment.*")
└── Queue: all-queue (binding key: "#")
```

### Pattern Matching

```java
// Patterns:
// * (star): Matches one word
// # (hash): Matches zero or more words

// Examples:
"order.created" matches "order.*"
"order.created.vip" matches "order.*.*"
"order.created.vip.urgent" matches "order.#"
"payment.processed" matches "*.processed"
```

### Implementation

```java
// Create Topic Exchange
@Bean
public TopicExchange eventsExchange() {
    return new TopicExchange("events-exchange");
}

@Bean
public Binding orderBinding() {
    return BindingBuilder
        .bind(orderQueue())
        .to(eventsExchange())
        .with("order.*");  // Pattern
}

// Publish
rabbitTemplate.convertAndSend("events-exchange", "order.created", event);
rabbitTemplate.convertAndSend("events-exchange", "order.updated", event);
rabbitTemplate.convertAndSend("events-exchange", "order.cancelled", event);
// All match "order.*"
```

### Use Cases

```java
// Use Topic Exchange khi:
// - Pattern-based routing
// - Multiple consumers với different patterns
// - Event categorization
// - Log levels (info.*, error.*)
```

---

## Fanout Exchange

### How it works

```java
// Fanout Exchange: Broadcasts to all bound queues
// Ignores routing key

Exchange: notifications-exchange (Fanout)
├── Queue: email-queue
├── Queue: sms-queue
└── Queue: push-queue

// Message published → All queues receive
```

### Implementation

```java
// Create Fanout Exchange
@Bean
public FanoutExchange notificationsExchange() {
    return new FanoutExchange("notifications-exchange");
}

@Bean
public Binding emailBinding() {
    return BindingBuilder
        .bind(emailQueue())
        .to(notificationsExchange());
    // No routing key needed
}

@Bean
public Binding smsBinding() {
    return BindingBuilder
        .bind(smsQueue())
        .to(notificationsExchange());
}

// Publish (routing key ignored)
rabbitTemplate.convertAndSend("notifications-exchange", "", notification);
// All queues receive message
```

### Use Cases

```java
// Use Fanout Exchange khi:
// - Broadcast messages
// - Multiple consumers need same message
// - Notifications (email, SMS, push)
// - Cache invalidation
```

---

## Headers Exchange

### How it works

```java
// Headers Exchange: Routes based on message headers
// Ignores routing key
// Uses x-match: all (all headers match) or any (any header matches)

Exchange: headers-exchange (Headers)
Queue: queue1 (headers: {"type": "order", "priority": "high"})
Queue: queue2 (headers: {"type": "payment"})
```

### Implementation

```java
// Create Headers Exchange
@Bean
public HeadersExchange headersExchange() {
    return new HeadersExchange("headers-exchange");
}

@Bean
public Binding queue1Binding() {
    Map<String, Object> headers = new HashMap<>();
    headers.put("type", "order");
    headers.put("priority", "high");
    return BindingBuilder
        .bind(queue1())
        .to(headersExchange())
        .whereAll(headers).match();  // All headers must match
}

// Publish với headers
MessageProperties props = new MessageProperties();
props.setHeader("type", "order");
props.setHeader("priority", "high");
Message message = new Message("order data".getBytes(), props);
rabbitTemplate.send("headers-exchange", "", message);
```

---

## Routing Keys

### Routing Key Format

```java
// Routing Key: String used for routing
// Format: words separated by dots
// Examples:
"order.created"
"order.created.vip"
"payment.processed"
"notification.email.sent"
```

### Best Practices

```java
// ✅ Good: Hierarchical structure
"order.created"
"order.updated"
"order.cancelled"

// ✅ Good: Include context
"user.created"
"user.updated"
"product.created"

// ❌ Bad: Flat structure
"order1"
"order2"
"order3"
```

---

## Câu hỏi thường gặp

### Q1: Khi nào dùng Exchange nào?

```java
// Direct Exchange:
// - Simple routing (one-to-one)
// - Exact match needed
// - Task queues

// Topic Exchange:
// - Pattern-based routing
// - Multiple patterns
// - Event categorization

// Fanout Exchange:
// - Broadcast
// - All queues need message
// - Notifications

// Headers Exchange:
// - Complex routing logic
// - Header-based routing
// - Rarely used
```

### Q2: Routing key vs Binding key?

```java
// Routing Key: Set by producer when publishing
rabbitTemplate.convertAndSend("exchange", "routing.key", message);

// Binding Key: Set when binding queue to exchange
BindingBuilder.bind(queue()).to(exchange()).with("binding.key");

// Match: Routing key matches binding key (based on exchange type)
```

### Q3: Multiple bindings?

```java
// Queue can have multiple bindings
Queue: order-queue
├── Binding 1: order-exchange, "order.created"
├── Binding 2: order-exchange, "order.updated"
└── Binding 3: events-exchange, "order.*"

// Message matches any binding → Delivered to queue
```

---

## Best Practices

1. **Choose right exchange**: Based on routing needs
2. **Use hierarchical routing keys**: Easier to manage
3. **Topic for patterns**: When pattern matching needed
4. **Fanout for broadcast**: When all queues need message
5. **Direct for simple**: When exact match sufficient

---

## Bài tập thực hành

### Bài 1: Exchange Types

```java
// Yêu cầu: Implement routing với different exchange types
// 1. Direct: Route orders to order queue
// 2. Topic: Route events by pattern
// 3. Fanout: Broadcast notifications
```

---

## Tổng kết

- **Exchange Types**: Direct, Topic, Fanout, Headers
- **Direct**: Exact routing key match
- **Topic**: Pattern-based routing
- **Fanout**: Broadcast to all queues
- **Headers**: Header-based routing
- **Routing Keys**: Hierarchical structure
- **Best Practices**: Choose right exchange type
