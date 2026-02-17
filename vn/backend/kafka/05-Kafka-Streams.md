# Kafka Streams - Câu hỏi phỏng vấn

## Mục lục
1. [Kafka Streams Overview](#kafka-streams-overview)
2. [KStream và KTable](#kstream-và-ktable)
3. [Windowing](#windowing)
4. [State Stores](#state-stores)
5. [Exactly-Once Semantics](#exactly-once-semantics)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Kafka Streams Overview

### What is Kafka Streams?

**Kafka Streams** là client library để build real-time streaming applications.

### Key Features

- **Lightweight**: No separate cluster needed
- **Scalable**: Horizontal scaling
- **Fault Tolerant**: Automatic recovery
- **Exactly-Once**: Processing guarantees

### Basic Stream Application

```java
// Stream properties
Properties props = new Properties();
props.put(StreamsConfig.APPLICATION_ID_CONFIG, "streams-app");
props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

// Create stream builder
StreamsBuilder builder = new StreamsBuilder();

// Build stream topology
KStream<String, String> source = builder.stream("input-topic");
source.to("output-topic");

// Create and start streams
KafkaStreams streams = new KafkaStreams(builder.build(), props);
streams.start();

// Add shutdown hook
Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
```

---

## KStream và KTable

### KStream

```java
// KStream: Sequence of key-value records
// - Append-only log
// - All records are independent events

KStream<String, String> stream = builder.stream("user-events");

// Transform
KStream<String, String> transformed = stream
    .mapValues(value -> value.toUpperCase())
    .filter((key, value) -> value.length() > 10);

// Write to output
transformed.to("output-topic");
```

### KTable

```java
// KTable: Changelog stream
// - Latest value per key
// - Updates overwrite previous values

KTable<String, String> table = builder.table("user-table");

// Transform
KTable<String, String> transformed = table
    .mapValues(value -> value.toUpperCase());

// Write to output
transformed.toStream().to("output-topic");
```

### KStream vs KTable

| Feature | KStream | KTable |
|---------|---------|--------|
| **Model** | Append-only log | Changelog |
| **Records** | All records | Latest per key |
| **Use Case** | Events | State |
| **Example** | User clicks | User profile |

---

## Windowing

### Tumbling Windows

```java
// Tumbling window: Fixed-size, non-overlapping
KStream<String, String> stream = builder.stream("input-topic");

KStream<String, Long> windowed = stream
    .groupByKey()
    .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))
    .count()
    .toStream()
    .map((key, value) -> new KeyValue<>(key.key(), value));
```

### Hopping Windows

```java
// Hopping window: Fixed-size, overlapping
KStream<String, Long> windowed = stream
    .groupByKey()
    .windowedBy(TimeWindows.of(Duration.ofMinutes(5))
        .advanceBy(Duration.ofMinutes(1)))
    .count()
    .toStream();
```

### Session Windows

```java
// Session window: Activity-based
KStream<String, Long> windowed = stream
    .groupByKey()
    .windowedBy(SessionWindows.with(Duration.ofMinutes(5)))
    .count()
    .toStream();
```

---

## State Stores

### Local State Store

```java
// Create state store
StoreBuilder<KeyValueStore<String, Long>> storeBuilder = Stores.keyValueStoreBuilder(
    Stores.persistentKeyValueStore("count-store"),
    Serdes.String(),
    Serdes.Long()
);

builder.addStateStore(storeBuilder);

// Use state store
KStream<String, String> stream = builder.stream("input-topic");

stream.transform(new TransformerSupplier<String, String, KeyValue<String, String>>() {
    @Override
    public Transformer<String, String, KeyValue<String, String>> get() {
        return new Transformer<String, String, KeyValue<String, String>>() {
            private KeyValueStore<String, Long> stateStore;
            
            @Override
            public void init(ProcessorContext context) {
                stateStore = (KeyValueStore<String, Long>) context.getStateStore("count-store");
            }
            
            @Override
            public KeyValue<String, String> transform(String key, String value) {
                Long count = stateStore.get(key);
                if (count == null) count = 0L;
                count++;
                stateStore.put(key, count);
                return new KeyValue<>(key, value + ":" + count);
            }
            
            @Override
            public void close() {
            }
        };
    }
}, "count-store");
```

---

## Exactly-Once Semantics

### Configuration

```java
// Enable exactly-once
props.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, 
    StreamsConfig.EXACTLY_ONCE);

// Benefits:
// - No duplicate processing
// - No lost messages
// - Exactly-once semantics
```

---

## Câu hỏi thường gặp

### Q1: KStream vs KTable?

```java
// KStream: All events
// Example: User click events
// [user1: click1, user1: click2, user2: click1, ...]

// KTable: Latest state
// Example: User profiles
// [user1: profile1, user1: profile2 (overwrites), user2: profile1, ...]
```

### Q2: Windowing use cases?

```java
// Tumbling: Fixed time periods
// Example: Count events per 5 minutes

// Hopping: Overlapping windows
// Example: Moving average

// Session: Activity-based
// Example: User session analysis
```

---

## Best Practices

1. **Use appropriate windowing**: Based on use case
2. **Manage state stores**: Clean up old data
3. **Enable exactly-once**: For critical applications
4. **Monitor processing**: Track lag, errors
5. **Handle errors**: Graceful error handling

---

## Tổng kết

- **Kafka Streams**: Client library for stream processing
- **KStream**: Append-only log of events
- **KTable**: Changelog with latest per key
- **Windowing**: Tumbling, hopping, session windows
- **State Stores**: Local state management
- **Exactly-Once**: Processing guarantees
