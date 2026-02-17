# Kafka Producers - Câu hỏi phỏng vấn

## Mục lục
1. [Producer API](#producer-api)
2. [Producer Configuration](#producer-configuration)
3. [Serialization](#serialization)
4. [Partitioning](#partitioning)
5. [Idempotence và Transactions](#idempotence-và-transactions)
6. [Error Handling](#error-handling)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Producer API

### Basic Producer

```java
// Producer properties
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// Create producer
KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// Send message
ProducerRecord<String, String> record = 
    new ProducerRecord<>("user-events", "user-123", "User created");
producer.send(record);

// Close producer
producer.close();
```

### Async Send

```java
// Async send với callback
ProducerRecord<String, String> record = 
    new ProducerRecord<>("user-events", "user-123", "User created");

producer.send(record, new Callback() {
    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {
        if (exception == null) {
            System.out.println("Sent: " + metadata.topic() + 
                             " partition: " + metadata.partition() + 
                             " offset: " + metadata.offset());
        } else {
            exception.printStackTrace();
        }
    }
});
```

### Sync Send

```java
// Sync send (blocking)
try {
    RecordMetadata metadata = producer.send(record).get();
    System.out.println("Sent: " + metadata.topic());
} catch (Exception e) {
    e.printStackTrace();
}
```

---

## Producer Configuration

### Important Properties

```java
Properties props = new Properties();

// Bootstrap servers
props.put("bootstrap.servers", "localhost:9092,localhost:9093,localhost:9094");

// Serializers
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// Acks (acknowledgment)
// 0: No acknowledgment (fastest, can lose messages)
// 1: Leader acknowledgment (medium, can lose if leader fails)
// all: All replicas acknowledgment (safest, slowest)
props.put("acks", "all");

// Retries
props.put("retries", 3);
props.put("retry.backoff.ms", 100);

// Batch settings
props.put("batch.size", 16384);  // 16 KB
props.put("linger.ms", 10);  // Wait 10ms to batch

// Buffer settings
props.put("buffer.memory", 33554432);  // 32 MB

// Compression
props.put("compression.type", "snappy");  // or gzip, lz4, zstd

// Idempotence
props.put("enable.idempotence", "true");

// Max in-flight requests
props.put("max.in.flight.requests.per.connection", 5);
```

### Acks Configuration

```java
// acks=0: Fire and forget
props.put("acks", "0");
// - Fastest
// - No acknowledgment
// - Can lose messages
// - Use case: Logs, metrics

// acks=1: Leader acknowledgment
props.put("acks", "1");
// - Medium speed
// - Leader acknowledges
// - Can lose if leader fails before replication
// - Use case: Most applications

// acks=all: All replicas acknowledgment
props.put("acks", "all");
// - Slowest
// - All replicas acknowledge
// - Most durable
// - Use case: Critical data
```

---

## Serialization

### Built-in Serializers

```java
// String serializer
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// Integer serializer
props.put("key.serializer", "org.apache.kafka.common.serialization.IntegerSerializer");

// Byte array serializer
props.put("value.serializer", "org.apache.kafka.common.serialization.ByteArraySerializer");
```

### Custom Serializer

```java
// Custom serializer
public class UserSerializer implements Serializer<User> {
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        // Configuration
    }
    
    @Override
    public byte[] serialize(String topic, User user) {
        try {
            return objectMapper.writeValueAsBytes(user);
        } catch (Exception e) {
            throw new SerializationException("Error serializing User", e);
        }
    }
    
    @Override
    public void close() {
        // Cleanup
    }
}

// Usage
props.put("value.serializer", UserSerializer.class.getName());
```

### Avro Serialization

```java
// Avro serializer (with Schema Registry)
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("schema.registry.url", "http://localhost:8081");

// Send Avro record
GenericRecord user = new GenericData.Record(schema);
user.put("id", 123);
user.put("name", "John");

ProducerRecord<String, GenericRecord> record = 
    new ProducerRecord<>("users", "user-123", user);
producer.send(record);
```

---

## Partitioning

### Default Partitioner

```java
// No key: Round-robin
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "value");
// Distributed round-robin across partitions

// With key: Hash-based
ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "user-123", "value");
// Hash(key) % numPartitions → Same key → Same partition
```

### Custom Partitioner

```java
// Custom partitioner
public class UserPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        List<PartitionInfo> partitions = cluster.partitionsForTopic(topic);
        int numPartitions = partitions.size();
        
        if (key == null) {
            return 0;
        }
        
        // Partition by user ID
        String userId = (String) key;
        return Math.abs(userId.hashCode()) % numPartitions;
    }
    
    @Override
    public void close() {
        // Cleanup
    }
    
    @Override
    public void configure(Map<String, ?> configs) {
        // Configuration
    }
}

// Usage
props.put("partitioner.class", UserPartitioner.class.getName());
```

---

## Idempotence và Transactions

### Idempotent Producer

```java
// Enable idempotence
props.put("enable.idempotence", "true");
// Requires: acks=all, retries > 0, max.in.flight.requests.per.connection <= 5

// Benefits:
// - No duplicate messages
// - Exactly-once semantics per partition
// - Automatic retries don't create duplicates
```

### Transactional Producer

```java
// Transactional producer
props.put("transactional.id", "my-transactional-id");
props.put("enable.idempotence", "true");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
producer.initTransactions();

try {
    producer.beginTransaction();
    
    // Send multiple messages
    producer.send(new ProducerRecord<>("topic1", "key1", "value1"));
    producer.send(new ProducerRecord<>("topic2", "key2", "value2"));
    
    // Commit transaction
    producer.commitTransaction();
} catch (Exception e) {
    // Abort transaction
    producer.abortTransaction();
    throw e;
}
```

### Exactly-Once Semantics

```java
// Exactly-once semantics với transactions
// - All messages in transaction are committed or none
// - No duplicates
// - No lost messages

// Configuration
props.put("transactional.id", "unique-id");
props.put("enable.idempotence", "true");
props.put("acks", "all");
props.put("max.in.flight.requests.per.connection", 5);
```

---

## Error Handling

### Retryable Errors

```java
// Retryable errors (automatically retried)
// - LeaderNotAvailableException
// - NotLeaderForPartitionException
// - NetworkException
// - TimeoutException

props.put("retries", 3);
props.put("retry.backoff.ms", 100);
```

### Non-Retryable Errors

```java
// Non-retryable errors (not retried)
// - InvalidTopicException
// - RecordTooLargeException
// - SerializationException

// Handle in callback
producer.send(record, new Callback() {
    @Override
    public void onCompletion(RecordMetadata metadata, Exception exception) {
        if (exception != null) {
            if (exception instanceof RetriableException) {
                // Retryable - will be retried automatically
            } else {
                // Non-retryable - handle manually
                log.error("Failed to send: " + exception.getMessage());
            }
        }
    }
});
```

### Error Handling Best Practices

```java
// 1. Use callback để handle errors
producer.send(record, callback);

// 2. Log errors
catch (Exception e) {
    log.error("Error sending message", e);
}

// 3. Dead letter queue
if (nonRetryableError) {
    sendToDeadLetterQueue(record);
}

// 4. Monitor producer metrics
// - record-error-rate
// - record-retry-rate
// - request-latency-avg
```

---

## Câu hỏi thường gặp

### Q1: acks=0, 1, all khác nhau như thế nào?

```java
// acks=0: No acknowledgment
// - Fastest
// - Can lose messages
// - Use for: Logs, metrics

// acks=1: Leader acknowledgment
// - Medium speed
// - Can lose if leader fails before replication
// - Use for: Most applications

// acks=all: All replicas acknowledgment
// - Slowest
// - Most durable
// - Requires min.insync.replicas
// - Use for: Critical data
```

### Q2: Tại sao cần batching?

```java
// Batching benefits:
// 1. Higher throughput: Send multiple messages in one request
// 2. Better compression: Compress multiple messages together
// 3. Fewer network round trips

// Configuration
props.put("batch.size", 16384);  // 16 KB
props.put("linger.ms", 10);  // Wait 10ms to batch

// Trade-off: Latency vs Throughput
// - Larger batch: Higher throughput, higher latency
// - Smaller batch: Lower latency, lower throughput
```

### Q3: Idempotence hoạt động như thế nào?

```java
// Idempotence: Same message sent multiple times = same result

// How it works:
// 1. Producer assigns unique ID (PID) và sequence number
// 2. Broker tracks (PID, partition, sequence)
// 3. Duplicate requests ignored

// Configuration
props.put("enable.idempotence", "true");
// Requires: acks=all, retries > 0, max.in.flight.requests.per.connection <= 5
```

### Q4: Transactions vs Idempotence?

```java
// Idempotence:
// - Prevents duplicates within partition
// - Per-partition exactly-once
// - Simpler

// Transactions:
// - Prevents duplicates across partitions/topics
// - All-or-nothing semantics
// - More complex, requires transactional.id

// Use idempotence: Single partition writes
// Use transactions: Multiple partition/topic writes
```

### Q5: Compression types?

```java
// Compression types:
// - none: No compression
// - gzip: Good compression, slower
// - snappy: Fast, good compression (recommended)
// - lz4: Fastest, less compression
// - zstd: Best compression, slower

props.put("compression.type", "snappy");

// Benefits:
// - Reduce network bandwidth
// - Reduce storage
// - Trade-off: CPU usage
```

---

## Best Practices

1. **Use appropriate acks**: all for critical data, 1 for most cases
2. **Enable idempotence**: Prevent duplicates
3. **Use batching**: Improve throughput
4. **Handle errors**: Use callbacks, log errors
5. **Use compression**: snappy recommended
6. **Monitor metrics**: Track error rates, latency
7. **Use transactions**: For multi-partition writes
8. **Close producer**: Always close when done

---

## Bài tập thực hành

### Bài 1: Producer Implementation

```java
// Yêu cầu:
// 1. Create producer với proper configuration
// 2. Send messages với callback
// 3. Handle errors appropriately
// 4. Enable idempotence
```

### Bài 2: Custom Serializer

```java
// Yêu cầu: Implement custom serializer cho User object
// Serialize to JSON
// Handle serialization errors
```

---

## Tổng kết

- **Producer API**: KafkaProducer, ProducerRecord
- **Configuration**: acks, retries, batching, compression
- **Serialization**: Built-in và custom serializers
- **Partitioning**: Default và custom partitioners
- **Idempotence**: Prevent duplicates
- **Transactions**: Exactly-once semantics
- **Error Handling**: Retryable vs non-retryable errors
- **Best Practices**: Proper configuration, error handling, monitoring
