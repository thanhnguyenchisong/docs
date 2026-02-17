# Performance Optimization - Câu hỏi phỏng vấn Kafka

## Mục lục
1. [Producer Tuning](#producer-tuning)
2. [Consumer Tuning](#consumer-tuning)
3. [Broker Configuration](#broker-configuration)
4. [Monitoring và Metrics](#monitoring-và-metrics)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Producer Tuning

### Batching

```java
// Increase batch size
props.put("batch.size", 32768);  // 32 KB

// Increase linger time
props.put("linger.ms", 10);  // Wait 10ms to batch

// Benefits:
// - Higher throughput
// - Better compression
// - Fewer network round trips
```

### Compression

```java
// Enable compression
props.put("compression.type", "snappy");  // or gzip, lz4, zstd

// Benefits:
// - Reduce network bandwidth
// - Reduce storage
// - Trade-off: CPU usage
```

### Acks Configuration

```java
// For high throughput (less durability)
props.put("acks", "1");

// For durability (lower throughput)
props.put("acks", "all");
props.put("min.insync.replicas", "2");
```

---

## Consumer Tuning

### Fetch Settings

```java
// Increase fetch size
props.put("fetch.min.bytes", "1048576");  // 1 MB
props.put("fetch.max.wait.ms", "500");

// Increase max poll records
props.put("max.poll.records", "1000");
```

### Consumer Parallelism

```java
// Increase consumers in group
// More consumers = more parallelism
// But: Limited by number of partitions
```

---

## Broker Configuration

### Replication

```properties
# Replication factor
default.replication.factor=3

# Min in-sync replicas
min.insync.replicas=2
```

### Log Retention

```properties
# Retention time
log.retention.hours=168  # 7 days

# Retention size
log.retention.bytes=1073741824  # 1 GB
```

---

## Monitoring và Metrics

### Key Metrics

```java
// Producer metrics
// - record-send-rate
// - record-error-rate
// - request-latency-avg

// Consumer metrics
// - records-consumed-rate
// - records-lag-max
// - fetch-latency-avg

// Broker metrics
// - messages-in-per-sec
// - bytes-in-per-sec
// - bytes-out-per-sec
```

---

## Câu hỏi thường gặp

### Q1: Làm sao tăng throughput?

```java
// Producer:
// 1. Increase batch size
// 2. Enable compression
// 3. Use async sends
// 4. Increase partitions

// Consumer:
// 1. Increase fetch size
// 2. Increase consumers
// 3. Process in parallel
```

---

## Best Practices

1. **Tune batching**: Balance latency và throughput
2. **Use compression**: Reduce bandwidth
3. **Monitor metrics**: Track performance
4. **Scale horizontally**: Add partitions, consumers
5. **Optimize serialization**: Use efficient formats

---

## Tổng kết

- **Producer Tuning**: Batching, compression, acks
- **Consumer Tuning**: Fetch settings, parallelism
- **Broker Configuration**: Replication, retention
- **Monitoring**: Track key metrics
- **Best Practices**: Balance trade-offs
