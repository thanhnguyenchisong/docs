# RabbitMQ Fundamentals - Từ Zero đến Master

## Mục lục
1. [RabbitMQ là gì?](#rabbitmq-là-gì)
2. [AMQP Protocol chuyên sâu](#amqp-protocol-chuyên-sâu)
3. [Connection & Channel Model](#connection--channel-model)
4. [RabbitMQ Architecture](#rabbitmq-architecture)
5. [Message Lifecycle](#message-lifecycle)
6. [Delivery Guarantees](#delivery-guarantees)
7. [RabbitMQ vs Other Brokers](#rabbitmq-vs-other-brokers)
8. [Erlang & OTP Foundation](#erlang--otp-foundation)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## RabbitMQ là gì?

### Định nghĩa

**RabbitMQ** là open-source message broker implement **AMQP 0-9-1** (Advanced Message Queuing Protocol), viết bằng **Erlang/OTP**. RabbitMQ hoạt động như trung gian giữa producers và consumers, cung cấp:

- **Reliable Message Delivery**: Publisher Confirms, Consumer ACK, Persistence
- **Flexible Routing**: 4 exchange types + custom plugins
- **High Availability**: Clustering, Quorum Queues (Raft consensus)
- **Multi-protocol**: AMQP 0-9-1, AMQP 1.0, MQTT, STOMP, WebSocket
- **Management UI**: Web dashboard, HTTP API, CLI tools

### Tại sao cần Message Broker?

```
❌ KHÔNG CÓ BROKER (Coupled):
  Service A ──HTTP──► Service B
  - A phải biết B ở đâu (host, port)
  - Nếu B down → A fail hoặc phải retry
  - Nếu B chậm → A bị block
  - Nếu cần gửi cho C nữa → sửa code A

✅ CÓ BROKER (Decoupled):
  Service A → [RabbitMQ] → Service B
                         → Service C
  - A chỉ cần biết RabbitMQ
  - Nếu B down → messages đợi trong queue
  - A gửi xong → tiếp tục xử lý (async)
  - Thêm C = thêm binding, không sửa A
```

### Key Features

| Feature | Mô tả |
| :--- | :--- |
| **AMQP Protocol** | Chuẩn giao thức messaging, interoperable |
| **Exchange-based routing** | 4 exchange types: Direct, Topic, Fanout, Headers |
| **Message Persistence** | Messages + Queues durable → survive broker restart |
| **Publisher Confirms** | Broker xác nhận đã nhận message |
| **Consumer ACK** | Consumer xác nhận đã xử lý xong |
| **Dead Letter** | Tự động chuyển messages thất bại sang DLQ |
| **Quorum Queues** | Raft consensus-based replication (RabbitMQ 3.8+) |
| **Streams** | Kafka-like append-only log (RabbitMQ 3.9+) |
| **Clustering** | Multi-node cluster cho HA |
| **Management UI** | Web dashboard tại port 15672 |
| **Plugins** | Modular: Delayed Message, Shovel, Federation, MQTT |

---

## AMQP Protocol chuyên sâu

### AMQP 0-9-1 Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        AMQP 0-9-1 Model                         │
│                                                                   │
│  ┌──────────┐    ┌──────────┐   Binding   ┌─────────┐           │
│  │ Producer │───►│ Exchange │─────────────►│  Queue  │──── ►Consumer│
│  └──────────┘    └──────────┘  (routing   └─────────┘           │
│       │               │         key)           │                 │
│       │               │                        │                 │
│  publish(exchange,    │ Route by type:         │  deliver +      │
│   routing_key,        │ - direct: exact match  │  ACK/NACK       │
│   message)            │ - topic: pattern match │                 │
│                       │ - fanout: broadcast    │                 │
│                       │ - headers: header match│                 │
└─────────────────────────────────────────────────────────────────┘

Các thành phần:
1. Producer:  Gửi message tới Exchange (KHÔNG gửi trực tiếp tới Queue)
2. Exchange:  Nhận message, route tới queue(s) dựa trên bindings
3. Binding:   Liên kết Exchange → Queue với routing key / headers
4. Queue:     Buffer lưu trữ messages, FIFO delivery
5. Consumer:  Nhận message từ Queue, xử lý, gửi ACK
```

### AMQP Frame Structure

```
┌────────────────────────────────────────────────┐
│                 AMQP Frame                       │
├──────┬──────┬───────────────┬──────┬───────────┤
│ Type │ Chan │ Size          │ Body │ Frame-end  │
│ 1B   │ 2B   │ 4B            │ ...  │ 1B (0xCE) │
├──────┼──────┼───────────────┼──────┼───────────┤
│      │      │               │      │           │
│ 1=   │ Ch#  │ Payload size  │ Data │ Sentinel  │
│ Method│     │               │      │           │
│ 2=Header    │               │      │           │
│ 3=Body│     │               │      │           │
└──────┴──────┴───────────────┴──────┴───────────┘

Message gửi qua AMQP = 3 frames:
1. Method frame:  Basic.Publish (exchange, routing_key)
2. Header frame:  Content-Type, Delivery-Mode, Priority, Message-ID...
3. Body frame(s): Actual message payload (có thể nhiều frames nếu message lớn)
```

### Default Exchange

```java
// Default Exchange (nameless exchange, "")
// - Tự động binding: mỗi queue bind với routing_key = tên queue
// - Publish trực tiếp tới queue bằng tên

rabbitTemplate.convertAndSend("", "order-queue", message);
// ≡ Gửi tới default exchange, routing_key = "order-queue"
// ≡ Message tới queue tên "order-queue"

// Use case: Simple point-to-point, work queues
```

---

## Connection & Channel Model

### Connection

```
Connection = TCP connection giữa application ↔ RabbitMQ
- Heavy: TLS handshake, authentication, socket allocation
- Mỗi connection = 1 TCP socket
- Mỗi connection có multiple channels
- KHÔNG nên tạo connection per message (rất tốn)
```

### Channel

```
Channel = Virtual connection MỞ TRÊN Connection
- Lightweight: Không cần TCP handshake mới
- Mỗi channel = 1 session
- Operations (publish, consume, declare) chạy trên channel
- Channels KHÔNG thread-safe → mỗi thread nên dùng riêng channel

┌──────────────────────────────────────┐
│           TCP Connection              │
│  ┌───────────┐  ┌───────────┐       │
│  │ Channel 1 │  │ Channel 2 │       │
│  │ (publish) │  │ (consume) │       │
│  └───────────┘  └───────────┘       │
│  ┌───────────┐  ┌───────────┐       │
│  │ Channel 3 │  │ Channel N │       │
│  │ (declare) │  │ (...)     │       │
│  └───────────┘  └───────────┘       │
└──────────────────────────────────────┘
```

### Best Practice: Connection Pattern

```java
// ✅ ĐÚNG: 1 Connection, nhiều Channels
// Spring AMQP CachingConnectionFactory tự quản lý

@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory("rabbitmq", 5672);
    factory.setUsername("admin");
    factory.setPassword("password");
    
    // Channel caching (mặc định)
    factory.setCacheMode(CachingConnectionFactory.CacheMode.CHANNEL);
    factory.setChannelCacheSize(25);  // Cache 25 channels
    
    return factory;
}

// ❌ SAI: Tạo connection mới cho mỗi message
// connection = factory.newConnection();
// channel = connection.createChannel();
// channel.basicPublish(...);
// connection.close();  // Rất tốn!
```

---

## RabbitMQ Architecture

### Internal Architecture

```
┌────────────────────── RabbitMQ Node ──────────────────────┐
│                                                            │
│  ┌──────────────────┐                                     │
│  │   TCP Listener    │← Connections từ clients             │
│  │   (port 5672)     │                                     │
│  └────────┬─────────┘                                     │
│           │                                                │
│  ┌────────▼─────────┐                                     │
│  │  Connection       │                                     │
│  │  Manager          │                                     │
│  │  ┌─────────────┐ │                                     │
│  │  │ Channel 1   │ │                                     │
│  │  │ Channel 2   │ │                                     │
│  │  └─────────────┘ │                                     │
│  └────────┬─────────┘                                     │
│           │                                                │
│  ┌────────▼─────────┐    ┌──────────────┐                │
│  │   Exchange        │───►│   Queue      │→ Consumer      │
│  │   Router          │    │   Process    │                │
│  │                   │    │   (Erlang)   │                │
│  │   - direct match  │    │              │                │
│  │   - topic match   │    │  ┌────────┐ │                │
│  │   - fanout        │    │  │ Message │ │                │
│  │   - headers       │    │  │ Store   │ │                │
│  └───────────────────┘    │  │(RAM/Disk)│ │                │
│                           │  └────────┘ │                │
│                           └──────────────┘                │
│                                                            │
│  ┌──────────────────┐    ┌──────────────┐                │
│  │   Mnesia DB       │    │  Management  │                │
│  │   (Metadata)      │    │  Plugin      │                │
│  │   - Exchanges     │    │  (port 15672)│                │
│  │   - Bindings      │    └──────────────┘                │
│  │   - Users/Perms   │                                     │
│  └──────────────────┘                                     │
└────────────────────────────────────────────────────────────┘
```

### Virtual Hosts

```bash
# VHost = namespace / multi-tenant isolation
# Mỗi vhost có exchanges, queues, bindings, users RIÊNG BIỆT

# Default vhost: /
# Tạo vhost:
rabbitmqctl add_vhost /production
rabbitmqctl add_vhost /staging

# Permissions theo vhost:
rabbitmqctl set_permissions -p /production user1 ".*" ".*" ".*"
#                                           configure write read

# Spring AMQP:
spring.rabbitmq.virtual-host=/production
```

### Ports

| Port | Protocol | Dùng cho |
| :--- | :--- | :--- |
| **5672** | AMQP | Client connections |
| **5671** | AMQPS | Client connections (TLS) |
| **15672** | HTTP | Management UI / API |
| **15692** | HTTP | Prometheus metrics |
| **25672** | Erlang | Inter-node clustering |
| **4369** | EPMD | Erlang Port Mapper Daemon |
| **1883** | MQTT | MQTT protocol (plugin) |
| **61613** | STOMP | STOMP protocol (plugin) |

---

## Message Lifecycle

### Chi tiết flow

```
1. PUBLISH
   Producer → Channel.basicPublish(exchange, routingKey, props, body)
   
2. ROUTING
   Exchange nhận message → check bindings:
   - Direct: routingKey == bindingKey?
   - Topic: routingKey matches bindingPattern?
   - Fanout: forward tất cả
   - Headers: headers match?
   
   Nếu KHÔNG match binding nào:
   - Có Alternate Exchange → forward
   - Có mandatory=true → return to publisher (ReturnCallback)
   - Không → message bị DROP (mất)

3. QUEUING
   Message vào queue:
   - Persistent (delivery_mode=2) → ghi disk
   - Non-persistent (delivery_mode=1) → chỉ RAM (mất khi restart)
   
4. DELIVERY
   Queue → Consumer:
   - Push model: RabbitMQ push message tới consumer
   - Controlled by prefetch count
   
5. ACKNOWLEDGMENT
   Consumer xử lý xong:
   - ACK (basic.ack) → message xóa khỏi queue
   - NACK + requeue=true → message quay lại queue
   - NACK + requeue=false → message tới DLQ (nếu configured)
   - Consumer disconnect trước khi ACK → message requeue tự động
   
6. END
   Message đã ACK → xóa khỏi queue → lifecycle kết thúc
```

### Message Properties

```java
// MessageProperties (AMQP Header)
MessageProperties props = new MessageProperties();

// Quan trọng:
props.setMessageId("unique-id-123");          // Idempotency
props.setDeliveryMode(MessageDeliveryMode.PERSISTENT);  // Survive restart
props.setContentType("application/json");
props.setTimestamp(new Date());
props.setExpiration("60000");                 // TTL: 60 giây
props.setPriority(5);                         // 0-255
props.setCorrelationId("request-123");        // RPC pattern
props.setReplyTo("reply-queue");              // RPC reply queue

// Headers (custom metadata):
props.setHeader("source", "order-service");
props.setHeader("version", "2.0");
props.setHeader("tenant", "company-a");
```

---

## Delivery Guarantees

### 3 mức đảm bảo

| Level | Cách đạt được | Trade-off |
| :--- | :--- | :--- |
| **At-most-once** | Auto ACK, no confirms | Nhanh nhất, có thể mất message |
| **At-least-once** | Manual ACK + Publisher Confirms + Persistence | Chậm hơn, có thể duplicate |
| **Effectively-once** | At-least-once + Idempotent consumer | Chậm nhất, phức tạp nhất, đúng nhất |

### At-least-once (Production standard)

```
Để KHÔNG mất message, cần TẤT CẢ:

1. Publisher Confirms    → Broker xác nhận đã nhận
2. Persistent messages   → delivery_mode = PERSISTENT
3. Durable exchange      → Exchange survive restart
4. Durable queue         → Queue survive restart
5. Manual ACK            → Consumer ACK SAU KHI xử lý xong
6. HA (Quorum Queue)     → Replicate qua nhiều nodes

Thiếu BẤT KỲ điều nào → có thể mất message!
```

```java
// ===== Complete At-least-once setup =====

// 1. Publisher Confirms
@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
    factory.setPublisherReturns(true);
    return factory;
}

// 2. Durable Exchange
@Bean
public DirectExchange orderExchange() {
    return new DirectExchange("order-exchange", true, false);  // durable=true
}

// 3. Durable Queue + Quorum (HA)
@Bean
public Queue orderQueue() {
    return QueueBuilder.durable("order-queue")
        .quorum()
        .deliveryLimit(5)
        .build();
}

// 4. Persistent message
rabbitTemplate.convertAndSend("order-exchange", "order.created", order, msg -> {
    msg.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
    msg.getMessageProperties().setMessageId(UUID.randomUUID().toString());
    return msg;
});

// 5. Manual ACK (consumer)
@RabbitListener(queues = "order-queue", ackMode = "MANUAL")
public void processOrder(Order order, Channel channel,
                          @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    try {
        orderService.process(order);
        channel.basicAck(tag, false);      // ACK sau khi xử lý THÀNH CÔNG
    } catch (Exception e) {
        channel.basicNack(tag, false, false);  // NACK → DLQ
    }
}
```

---

## RabbitMQ vs Other Brokers

### RabbitMQ vs Kafka (Chi tiết)

| Tiêu chí | RabbitMQ | Apache Kafka |
| :--- | :--- | :--- |
| **Mục đích chính** | Message Broker (routing, task queues) | Event Streaming Platform |
| **Protocol** | AMQP 0-9-1 (standard) | Custom protocol |
| **Message Model** | Queue-based (message consumed = deleted) | Log-based (message persisted, replay) |
| **Routing** | Exchange → Binding → Queue (rất flexible) | Topic → Partition (đơn giản) |
| **Consumer Model** | Smart broker, dumb consumer | Dumb broker, smart consumer |
| **Message Retention** | Xóa sau khi ACK | Configurable retention (time/size) |
| **Replay** | Không (trừ Streams) | ✅ Offset-based replay |
| **Ordering** | Per queue (FIFO) | Per partition |
| **Throughput** | 10K-50K msg/s per node | 100K-1M+ msg/s per node |
| **Latency** | Rất thấp (sub-ms) | Thấp (1-10ms) |
| **Delivery** | At-most-once / At-least-once | At-least-once / Exactly-once (Kafka Transactions) |
| **Clustering** | Quorum Queues (Raft) | ZooKeeper/KRaft |
| **Learning curve** | Trung bình | Cao |
| **Operations** | Erlang ecosystem | JVM ecosystem |

### Khi nào dùng cái nào?

```
RabbitMQ:
✅ Task queues (background jobs, email sending)
✅ RPC (request/reply)
✅ Complex routing (topic, headers)
✅ Low latency, immediate delivery
✅ Small-medium throughput (< 50K msg/s)
✅ Transient messages (process and forget)

Kafka:
✅ Event streaming (clickstream, logs)
✅ Event sourcing (rebuild state from events)
✅ High throughput (> 100K msg/s)
✅ Message replay (reprocess events)
✅ Long-term storage (days/weeks/months)
✅ Multiple consumer groups (same data, different processing)
```

### RabbitMQ vs ActiveMQ vs Redis Pub/Sub

| Tiêu chí | RabbitMQ | ActiveMQ | Redis Pub/Sub |
| :--- | :--- | :--- | :--- |
| **Language** | Erlang | Java | C |
| **Protocol** | AMQP | JMS, AMQP, MQTT | Custom |
| **Persistence** | ✅ Durable | ✅ KahaDB/JDBC | ❌ No persistence |
| **Clustering** | Quorum Queues | Master-Slave | Redis Cluster |
| **Performance** | Cao | Trung bình | Rất cao (in-memory) |
| **Message guarantee** | At-least-once | At-least-once | At-most-once |
| **Use case** | General messaging | Java/JMS ecosystem | Simple pub/sub, cache invalidation |

---

## Erlang & OTP Foundation

### Tại sao Erlang?

RabbitMQ được viết bằng **Erlang/OTP** vì:

1. **Concurrency**: Erlang processes rất nhẹ (~2KB), có thể tạo hàng triệu → phù hợp cho message handling
2. **Fault tolerance**: "Let it crash" philosophy — process crash không ảnh hưởng hệ thống
3. **Distributed**: Built-in distribution, nodes dễ kết nối (Erlang distribution protocol)
4. **Hot code swap**: Upgrade code mà không cần restart (rolling upgrade)
5. **Pattern matching**: Erlang pattern matching phù hợp cho message routing

### Ảnh hưởng tới Operations

```
Cần biết khi vận hành RabbitMQ:

1. Erlang Cookie: Tất cả cluster nodes phải cùng cookie
   File: /var/lib/rabbitmq/.erlang.cookie
   
2. Erlang Version: RabbitMQ yêu cầu Erlang version cụ thể
   Check: rabbitmqctl eval 'erlang:system_info(otp_release).'

3. EPMD (Erlang Port Mapper Daemon): Port 4369
   Cần mở cho clustering

4. Node naming: rabbit@hostname
   Phải resolve DNS giữa cluster nodes
```

---

## Câu hỏi thường gặp

### Q1: Tại sao cần Exchange? Sao không gửi thẳng Queue?

Exchange **tách biệt** producer khỏi queue topology. Producer chỉ cần biết exchange name + routing key. Queue có thể thêm/xóa mà producer không cần sửa code. Một message có thể route tới nhiều queues (pub/sub). Đây là nguyên tắc **loose coupling** cốt lõi của AMQP.

### Q2: Message bị mất khi nào?

1. Non-persistent message + broker restart → **mất**
2. Non-durable queue + broker restart → **mất** (queue bị xóa)
3. Publish tới exchange không có binding match + không có mandatory/AE → **mất**
4. Auto ACK + consumer crash trước khi xử lý → **mất** (đã ACK)
5. Queue max-length + overflow=drop-head → message cũ bị **drop**

### Q3: Connection hay Channel cho multi-threading?

**1 Connection + N Channels.** Connection tốn TCP socket. Channel lightweight. Mỗi thread dùng 1 channel riêng. Spring AMQP `CachingConnectionFactory` tự cache channels.

### Q4: RabbitMQ handle bao nhiêu messages/giây?

Tùy config, message size, persistence, routing:
- Non-persistent, simple routing: **50K-100K** msg/s per node
- Persistent, quorum queue: **10K-30K** msg/s per node
- With TLS: giảm 30-50%

### Q5: Quorum Queue hay Classic Queue?

**Quorum Queue** cho tất cả production queues cần reliability. Classic chỉ dùng khi cần exclusive queue (temporary) hoặc priority queue. Classic Mirrored Queue bị **deprecated từ RabbitMQ 3.13**.

---

## Tổng kết

- **RabbitMQ**: AMQP 0-9-1 message broker, Erlang/OTP, multi-protocol
- **AMQP Model**: Producer → Exchange → Binding → Queue → Consumer
- **Connection/Channel**: 1 Connection nhiều Channels, channel không thread-safe
- **Delivery Guarantees**: At-most-once / At-least-once / Effectively-once
- **At-least-once**: Publisher Confirms + Persistent + Durable + Manual ACK + Quorum Queue
- **vs Kafka**: RabbitMQ = routing + task queues; Kafka = streaming + replay
- **Erlang**: Lightweight processes, fault-tolerant, distributed
