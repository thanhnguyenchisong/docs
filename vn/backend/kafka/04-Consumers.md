# Kafka Consumers - Câu hỏi phỏng vấn

## Mục lục
1. [Consumer API](#consumer-api)
2. [Consumer Groups](#consumer-groups)
3. [Offset Management](#offset-management)
4. [Rebalancing](#rebalancing)
5. [Consumer Configuration](#consumer-configuration)
6. [Commit Strategies](#commit-strategies)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Consumer API

### Basic Consumer

```java
// Consumer properties
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "user-processors");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

// Create consumer
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

// Subscribe to topics
consumer.subscribe(Arrays.asList("user-events"));

// Poll for messages
try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            System.out.println("Received: " + record.value());
        }
    }
} finally {
    consumer.close();
}
```

### Consumer Record

```java
// ConsumerRecord structure
ConsumerRecord<String, String> record = ...;

String topic = record.topic();
int partition = record.partition();
long offset = record.offset();
String key = record.key();
String value = record.value();
long timestamp = record.timestamp();
Headers headers = record.headers();
```

---

## Consumer Groups

### Consumer Group Concept

```java
// Consumer Group: Group of consumers working together
// Each partition consumed by only one consumer in group

Topic: user-events (6 partitions)
Consumer Group: user-processors (3 consumers)

Consumer 1 → Partitions 0, 1
Consumer 2 → Partitions 2, 3
Consumer 3 → Partitions 4, 5

// Benefits:
// - Parallel processing
// - Load balancing
// - Fault tolerance
```

### Consumer Group Configuration

```java
Properties props = new Properties();
props.put("group.id", "user-processors");  // Consumer group ID
props.put("auto.offset.reset", "earliest");  // or "latest", "none"

// Create consumer
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("user-events"));
```

### Multiple Consumer Groups

```java
// Multiple consumer groups can consume same topic

Topic: user-events
├── Consumer Group 1: user-processors
│   ├── Consumer 1 → Partition 0
│   └── Consumer 2 → Partition 1
└── Consumer Group 2: user-analytics
    ├── Consumer 1 → Partition 0
    └── Consumer 2 → Partition 1

// Each group processes independently
// Messages delivered to all groups
```

---

## Offset Management

### Offset Concept

```java
// Offset: Position in partition
// Consumer tracks offset to know where to resume

Partition 0:
Offset 0: Message 1
Offset 1: Message 2
Offset 2: Message 3  ← Consumer last read
Offset 3: Message 4  ← Next to read
Offset 4: Message 5

// Consumer commits offset after processing
```

### Auto Commit

```java
// Auto commit (default)
props.put("enable.auto.commit", "true");
props.put("auto.commit.interval.ms", "5000");  // Commit every 5 seconds

// Pros: Simple
// Cons: Can lose messages if consumer crashes before commit
```

### Manual Commit

```java
// Manual commit
props.put("enable.auto.commit", "false");

// Commit after processing
try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            processRecord(record);
        }
        consumer.commitSync();  // Commit after processing
    }
} catch (Exception e) {
    // Handle error
}
```

### Commit Strategies

```java
// Strategy 1: Commit after each record
for (ConsumerRecord<String, String> record : records) {
    processRecord(record);
    consumer.commitSync(Collections.singletonMap(
        new TopicPartition(record.topic(), record.partition()),
        new OffsetAndMetadata(record.offset() + 1)
    ));
}

// Strategy 2: Commit after batch
List<ConsumerRecord<String, String>> batch = new ArrayList<>();
for (ConsumerRecord<String, String> record : records) {
    batch.add(record);
    processRecord(record);
}
consumer.commitSync();  // Commit entire batch

// Strategy 3: Async commit
consumer.commitAsync(new OffsetCommitCallback() {
    @Override
    public void onComplete(Map<TopicPartition, OffsetAndMetadata> offsets, Exception exception) {
        if (exception != null) {
            log.error("Commit failed", exception);
        }
    }
});
```

---

## Rebalancing

### Rebalancing Concept

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

### Rebalancing Listeners

```java
// Rebalance listener
consumer.subscribe(Arrays.asList("user-events"), new ConsumerRebalanceListener() {
    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
        // Save state, commit offsets
        commitOffsets();
        saveState();
    }
    
    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        // Restore state, seek to saved offset
        restoreState();
        for (TopicPartition partition : partitions) {
            consumer.seek(partition, getSavedOffset(partition));
        }
    }
});
```

### Rebalancing Strategies

```java
// Strategy 1: Range (default)
// Assigns consecutive partitions to consumers
// Example: 6 partitions, 2 consumers
// Consumer 1: [0,1,2]
// Consumer 2: [3,4,5]

// Strategy 2: Round-robin
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.RoundRobinAssignor");

// Strategy 3: Sticky
props.put("partition.assignment.strategy", 
    "org.apache.kafka.clients.consumer.StickyAssignor");
// Minimizes partition movement during rebalancing
```

---

## Consumer Configuration

### Important Properties

```java
Properties props = new Properties();

// Bootstrap servers
props.put("bootstrap.servers", "localhost:9092");

// Consumer group
props.put("group.id", "user-processors");

// Deserializers
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

// Auto offset reset
props.put("auto.offset.reset", "earliest");  // or "latest", "none"

// Enable auto commit
props.put("enable.auto.commit", "true");
props.put("auto.commit.interval.ms", "5000");

// Session timeout
props.put("session.timeout.ms", "30000");  // 30 seconds

// Heartbeat interval
props.put("heartbeat.interval.ms", "3000");  // 3 seconds

// Max poll records
props.put("max.poll.records", "500");

// Fetch settings
props.put("fetch.min.bytes", "1");
props.put("fetch.max.wait.ms", "500");
```

### Auto Offset Reset

```java
// auto.offset.reset options:

// earliest: Read from beginning if no offset
props.put("auto.offset.reset", "earliest");
// Use case: Process all messages

// latest: Read from end if no offset
props.put("auto.offset.reset", "latest");
// Use case: Only new messages

// none: Throw exception if no offset
props.put("auto.offset.reset", "none");
// Use case: Strict offset management
```

---

## Commit Strategies

### Synchronous Commit

```java
// Synchronous commit (blocking)
try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            processRecord(record);
        }
        consumer.commitSync();  // Blocks until commit completes
    }
} catch (CommitFailedException e) {
    // Handle commit failure
}
```

### Asynchronous Commit

```java
// Asynchronous commit (non-blocking)
try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            processRecord(record);
        }
        consumer.commitAsync();  // Non-blocking
    }
} finally {
    try {
        consumer.commitSync();  // Final sync commit
    } finally {
        consumer.close();
    }
}
```

### Commit Specific Offsets

```java
// Commit specific offsets
Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
for (ConsumerRecord<String, String> record : records) {
    processRecord(record);
    offsets.put(
        new TopicPartition(record.topic(), record.partition()),
        new OffsetAndMetadata(record.offset() + 1)
    );
}
consumer.commitSync(offsets);
```

---

## Câu hỏi thường gặp

### Q1: Consumer lag là gì?

```java
// Consumer Lag: Difference between latest offset và consumer offset

Partition 0:
Latest Offset: 1000
Consumer Offset: 950
Consumer Lag: 50 messages

// High lag indicates:
// - Consumer is slow
// - Consumer is down
// - Throughput mismatch

// Monitor lag:
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group user-processors --describe
```

### Q2: Tại sao cần commit offsets?

```java
// Commit offsets để:
// 1. Resume from last position after restart
// 2. Avoid reprocessing messages
// 3. Track consumer progress

// Without commit:
// Consumer crashes → Restarts from beginning → Reprocesses all messages

// With commit:
// Consumer crashes → Restarts from last commit → Processes new messages only
```

### Q3: Khi nào dùng sync vs async commit?

```java
// Synchronous commit:
// - Blocks until commit completes
// - Knows if commit succeeded
// - Slower
// - Use: Critical data, before shutdown

// Asynchronous commit:
// - Non-blocking
// - Doesn't know if commit succeeded
// - Faster
// - Use: High throughput, non-critical data
```

### Q4: Rebalancing có thể tránh được không?

```java
// Rebalancing occurs when:
// - Consumer joins group
// - Consumer leaves group
// - Topic partitions change
// - Consumer group coordinator changes

// Cannot avoid, but can minimize:
// 1. Use sticky assignor
// 2. Keep consumers stable
// 3. Handle rebalancing gracefully
```

### Q5: Làm sao xử lý duplicate messages?

```java
// Duplicate messages possible when:
// - Consumer crashes after processing but before commit
// - Rebalancing occurs

// Solutions:
// 1. Idempotent processing
public void processRecord(ConsumerRecord<String, String> record) {
    String id = extractId(record);
    if (!alreadyProcessed(id)) {
        process(record);
        markAsProcessed(id);
    }
}

// 2. Use idempotent keys
// 3. Use transactions (exactly-once semantics)
```

---

## Best Practices

1. **Commit after processing**: Ensure messages processed before commit
2. **Handle rebalancing**: Save state, commit offsets
3. **Monitor consumer lag**: Ensure consumers keep up
4. **Use appropriate poll timeout**: Balance latency và throughput
5. **Handle errors gracefully**: Don't commit on error
6. **Use idempotent processing**: Handle duplicates
7. **Close consumer properly**: Final commit before close
8. **Monitor metrics**: Track lag, throughput, errors

---

## Bài tập thực hành

### Bài 1: Consumer Implementation

```java
// Yêu cầu:
// 1. Create consumer với proper configuration
// 2. Handle rebalancing
// 3. Commit offsets appropriately
// 4. Handle errors
```

### Bài 2: Consumer Group

```java
// Yêu cầu:
// 1. Create multiple consumers in same group
// 2. Observe partition assignment
// 3. Add/remove consumers
// 4. Observe rebalancing
```

---

## Tổng kết

- **Consumer API**: KafkaConsumer, ConsumerRecord
- **Consumer Groups**: Parallel processing, load balancing
- **Offset Management**: Auto commit vs manual commit
- **Rebalancing**: Partition redistribution
- **Commit Strategies**: Sync vs async
- **Configuration**: Group ID, auto offset reset, session timeout
- **Best Practices**: Proper commit, handle rebalancing, monitor lag
