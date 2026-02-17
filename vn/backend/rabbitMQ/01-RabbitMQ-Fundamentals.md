# RabbitMQ Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [RabbitMQ là gì?](#rabbitmq-là-gì)
2. [AMQP Protocol](#amqp-protocol)
3. [RabbitMQ Architecture](#rabbitmq-architecture)
4. [RabbitMQ vs Other Brokers](#rabbitmq-vs-other-brokers)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## RabbitMQ là gì?

### Định nghĩa

**RabbitMQ** là open-source message broker implement AMQP (Advanced Message Queuing Protocol), được thiết kế để:
- **Reliable Message Delivery**: Đảm bảo messages được deliver
- **Flexible Routing**: Flexible message routing
- **Scalability**: Horizontal scaling
- **High Availability**: Clustering và HA

### Key Features

1. **AMQP Protocol**: Standard messaging protocol
2. **Multiple Exchange Types**: Direct, Topic, Fanout, Headers
3. **Message Persistence**: Durable messages
4. **Clustering**: High availability
5. **Management UI**: Web-based management

---

## AMQP Protocol

### AMQP Components

```
Producer → Exchange → Queue → Consumer
            ↓
         Binding (Routing Key)
```

### Components

**1. Producer:**
- Publishes messages to exchange
- Doesn't send directly to queue

**2. Exchange:**
- Receives messages from producers
- Routes messages to queues
- Types: Direct, Topic, Fanout, Headers

**3. Queue:**
- Stores messages
- Delivers to consumers
- FIFO order

**4. Consumer:**
- Receives messages from queue
- Processes messages
- Sends acknowledgment

**5. Binding:**
- Link between exchange và queue
- Uses routing key

---

## RabbitMQ Architecture

### Message Flow

```
Producer → Exchange → Binding → Queue → Consumer
   │         │          │         │        │
   │         │          │         │        └─→ ACK/NACK
   │         │          │         │
   │         │          │         └─→ Message stored
   │         │          └─→ Routing key match
   │         └─→ Route based on type
   └─→ Publish message
```

### Virtual Hosts

```java
// Virtual Host: Logical grouping
// - Isolated environments
// - Separate permissions
// - Separate queues/exchanges

// Default: /
// Custom: /production, /development, /testing
```

---

## RabbitMQ vs Other Brokers

### RabbitMQ vs Kafka

| Feature | RabbitMQ | Kafka |
|---------|----------|-------|
| **Protocol** | AMQP | Custom |
| **Message Model** | Point-to-point, Pub-Sub | Pub-Sub |
| **Message Retention** | After consumption | Configurable |
| **Throughput** | High | Very High |
| **Use Case** | Task queues, RPC | Event streaming |

### RabbitMQ vs ActiveMQ

| Feature | RabbitMQ | ActiveMQ |
|---------|----------|----------|
| **Protocol** | AMQP | JMS, AMQP, MQTT |
| **Language** | Erlang | Java |
| **Performance** | High | Medium |
| **Clustering** | Built-in | Available |

---

## Câu hỏi thường gặp

### Q1: Tại sao cần Exchange?

```java
// Exchange: Decouples producer from queue
// Benefits:
// 1. Flexible routing: Multiple routing strategies
// 2. Decoupling: Producer doesn't know queues
// 3. Multiple queues: One message to multiple queues
```

### Q2: Message Flow?

```java
// Flow:
// 1. Producer publishes to exchange
// 2. Exchange routes to queue(s) based on binding
// 3. Queue stores message
// 4. Consumer receives message
// 5. Consumer sends ACK
// 6. Queue removes message
```

---

## Best Practices

1. **Use appropriate exchange type**: Based on routing needs
2. **Persist messages**: For reliability
3. **Acknowledge messages**: Ensure processing
4. **Use DLQ**: Handle failed messages
5. **Monitor queues**: Track queue length

---

## Tổng kết

- **RabbitMQ**: AMQP message broker
- **AMQP**: Advanced Message Queuing Protocol
- **Architecture**: Producer → Exchange → Queue → Consumer
- **vs Other Brokers**: Different use cases
- **Best Practices**: Proper routing, persistence, acknowledgment
