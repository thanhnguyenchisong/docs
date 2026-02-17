# Kafka Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Kafka là gì?](#kafka-là-gì)
2. [Kafka Architecture](#kafka-architecture)
3. [Core Concepts](#core-concepts)
4. [Use Cases](#use-cases)
5. [Kafka vs Other Systems](#kafka-vs-other-systems)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Kafka là gì?

### Định nghĩa

**Apache Kafka** là distributed streaming platform được thiết kế để:
- **Publish và Subscribe** streams of records
- **Store** streams of records durably
- **Process** streams of records in real-time

### Key Features

1. **High Throughput**: Hàng triệu messages per second
2. **Scalability**: Horizontal scaling
3. **Durability**: Persistent storage
4. **Fault Tolerance**: Replication và distributed architecture
5. **Real-time Processing**: Low latency

---

## Kafka Architecture

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Producer   │────▶│   Broker   │◀────│  Consumer   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │
                    ┌──────┴──────┐
                    │   Topic      │
                    │  Partition 1 │
                    │  Partition 2 │
                    │  Partition 3 │
                    └──────────────┘
```

### Components

**1. Broker:**
- Kafka server instance
- Stores và serves data
- Part of Kafka cluster

**2. Producer:**
- Publishes messages to topics
- Chooses partition for message

**3. Consumer:**
- Reads messages from topics
- Part of consumer group

**4. Topic:**
- Category/feed name
- Divided into partitions

**5. Partition:**
- Ordered sequence of records
- Allows parallelism

**6. Consumer Group:**
- Group of consumers
- Share work of consuming messages

---

## Core Concepts

### Topics

```java
// Topic: Category/feed name
// Example: "user-events", "order-events", "payment-events"

// Create topic
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 2
```

### Partitions

```java
// Partition: Ordered sequence of records
// Benefits:
// - Parallelism: Multiple consumers can read from different partitions
// - Scalability: Can add more partitions
// - Ordering: Messages within partition are ordered

// Topic với 3 partitions
Topic: user-events
├── Partition 0: [msg1, msg4, msg7, ...]
├── Partition 1: [msg2, msg5, msg8, ...]
└── Partition 2: [msg3, msg6, msg9, ...]
```

### Offsets

```java
// Offset: Unique identifier for each message in partition
// Consumer tracks offset to know where to resume reading

Partition 0:
Offset 0: Message 1
Offset 1: Message 2
Offset 2: Message 3
Offset 3: Message 4
...

// Consumer reads from offset 2
// Next read: offset 3, 4, 5, ...
```

### Replication

```java
// Replication: Copies of partitions across brokers
// Replication Factor = 3 means 3 copies

Broker 1: Partition 0 (Leader), Partition 1 (Follower)
Broker 2: Partition 0 (Follower), Partition 1 (Leader)
Broker 3: Partition 0 (Follower), Partition 1 (Follower)

// Leader: Handles all reads and writes
// Followers: Replicate data from leader
```

### Consumer Groups

```java
// Consumer Group: Group of consumers sharing work
// Each partition consumed by only one consumer in group

Topic: user-events (3 partitions)
Consumer Group: user-processors (3 consumers)

Consumer 1 → Partition 0
Consumer 2 → Partition 1
Consumer 3 → Partition 2

// If consumer 4 joins:
// Rebalancing occurs
// Partitions redistributed
```

---

## Use Cases

### 1. Messaging System

```java
// Replace traditional message queues
// - Higher throughput
// - Better scalability
// - Message persistence

Producer → Kafka Topic → Consumer
```

### 2. Event Sourcing

```java
// Store all events as they happen
// Replay events to rebuild state

User Created Event
User Updated Event
User Deleted Event
→ Stored in Kafka
→ Can replay to rebuild user state
```

### 3. Log Aggregation

```java
// Collect logs from multiple services
// Centralized log storage

Service 1 Logs → Kafka
Service 2 Logs → Kafka
Service 3 Logs → Kafka
→ Centralized log storage
```

### 4. Stream Processing

```java
// Real-time processing of data streams
// Kafka Streams for processing

Input Stream → Kafka Streams → Output Stream
```

### 5. Metrics Collection

```java
// Collect metrics from applications
// Real-time monitoring

Application Metrics → Kafka → Monitoring System
```

---

## Kafka vs Other Systems

### Kafka vs RabbitMQ

| Feature | Kafka | RabbitMQ |
|---------|-------|----------|
| **Message Ordering** | Per partition | Per queue |
| **Throughput** | Very High | High |
| **Message Retention** | Configurable (days) | After consumption |
| **Use Case** | Event streaming | Message queuing |
| **Complexity** | Higher | Lower |

### Kafka vs ActiveMQ

| Feature | Kafka | ActiveMQ |
|---------|-------|----------|
| **Protocol** | Custom | JMS, AMQP, MQTT |
| **Persistence** | Log-based | Database/File |
| **Throughput** | Very High | Medium |
| **Scalability** | Excellent | Good |

### Kafka vs Redis Pub/Sub

| Feature | Kafka | Redis Pub/Sub |
|---------|-------|---------------|
| **Persistence** | Yes | No (in-memory) |
| **Message Retention** | Yes | No |
| **Throughput** | Very High | High |
| **Use Case** | Event streaming | Real-time notifications |

---

## Câu hỏi thường gặp

### Q1: Tại sao Kafka nhanh?

**Reasons:**
1. **Sequential I/O**: Writes to disk sequentially (faster than random)
2. **Zero Copy**: Direct transfer from disk to network
3. **Batching**: Batch multiple messages together
4. **Partitioning**: Parallel processing
5. **No Random Disk Access**: Append-only log

### Q2: Kafka có đảm bảo message ordering không?

```java
// Kafka đảm bảo ordering:
// ✅ Within a partition: Messages are ordered
// ❌ Across partitions: No ordering guarantee

// Example:
Topic: user-events (3 partitions)

Partition 0: [msg1, msg2, msg3]  // Ordered
Partition 1: [msg4, msg5, msg6]  // Ordered
Partition 2: [msg7, msg8, msg9]  // Ordered

// But msg1, msg4, msg7 order is not guaranteed
```

### Q3: Kafka có mất message không?

```java
// Kafka đảm bảo durability:
// ✅ Replication: Multiple copies
// ✅ Acknowledgment: Producer waits for acknowledgment
// ✅ Persistence: Messages stored on disk

// Configuration:
acks=all  // Wait for all replicas to acknowledge
replication.factor=3  // 3 copies
min.insync.replicas=2  // At least 2 replicas must be in sync
```

### Q4: Kafka có thể scale như thế nào?

```java
// Horizontal Scaling:
// 1. Add more brokers
// 2. Add more partitions
// 3. Add more consumers

// Example:
// Start: 1 broker, 1 partition, 1 consumer
// Scale: 3 brokers, 10 partitions, 10 consumers
// → 10x throughput
```

### Q5: Consumer Group là gì?

```java
// Consumer Group: Group of consumers working together
// Each partition consumed by only one consumer in group

Topic: orders (6 partitions)
Consumer Group: order-processors (3 consumers)

Consumer 1: Partitions 0, 1
Consumer 2: Partitions 2, 3
Consumer 3: Partitions 4, 5

// Benefits:
// - Parallel processing
// - Load balancing
// - Fault tolerance
```

### Q6: Rebalancing là gì?

```java
// Rebalancing: Redistribute partitions when consumers join/leave

// Scenario 1: Consumer joins
Before: Consumer 1 → [0,1,2,3,4,5]
After:  Consumer 1 → [0,1,2]
        Consumer 2 → [3,4,5]

// Scenario 2: Consumer leaves
Before: Consumer 1 → [0,1,2]
        Consumer 2 → [3,4,5]
After:  Consumer 1 → [0,1,2,3,4,5]

// Rebalancing causes:
// - Temporary unavailability
// - Duplicate processing possible
```

### Q7: Kafka có thể replace database không?

```java
// ❌ No: Kafka is not a database
// ✅ But: Can be used for:
// - Event sourcing
// - Change data capture (CDC)
// - Log storage

// Differences:
// - Kafka: Append-only log, no random access
// - Database: CRUD operations, random access
```

### Q8: Kafka có support transactions không?

```java
// ✅ Yes: Kafka supports transactions (since 0.11.0)

// Producer transactions:
Properties props = new Properties();
props.put("transactional.id", "my-transactional-id");
props.put("enable.idempotence", "true");

KafkaProducer producer = new KafkaProducer(props);
producer.initTransactions();

try {
    producer.beginTransaction();
    producer.send(record1);
    producer.send(record2);
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
}
```

---

## Best Practices

1. **Choose right number of partitions**: Based on throughput needs
2. **Set appropriate replication factor**: At least 3 for production
3. **Use idempotent producers**: Prevent duplicates
4. **Configure proper retention**: Based on use case
5. **Monitor consumer lag**: Ensure consumers keep up
6. **Use compression**: Reduce network bandwidth
7. **Batch messages**: Improve throughput
8. **Handle rebalancing**: Minimize impact

---

## Bài tập thực hành

### Bài 1: Setup Kafka Cluster

```bash
# Yêu cầu:
# 1. Setup Kafka cluster với 3 brokers
# 2. Create topic với 6 partitions, replication factor 3
# 3. Verify replication
```

### Bài 2: Producer và Consumer

```java
// Yêu cầu:
// 1. Create producer gửi messages
// 2. Create consumer đọc messages
// 3. Verify message ordering trong partition
```

---

## Tổng kết

- **Kafka**: Distributed streaming platform
- **Architecture**: Brokers, Producers, Consumers, Topics, Partitions
- **Core Concepts**: Topics, Partitions, Offsets, Replication, Consumer Groups
- **Use Cases**: Messaging, Event Sourcing, Log Aggregation, Stream Processing
- **Key Features**: High throughput, Scalability, Durability, Fault tolerance
- **Best Practices**: Proper configuration, monitoring, optimization
