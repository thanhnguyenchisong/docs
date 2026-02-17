# Advanced Topics - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Clustering và High Availability](#clustering-và-high-availability)
2. [Performance Tuning](#performance-tuning)
3. [Monitoring](#monitoring)
4. [Best Practices](#best-practices)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Clustering và High Availability

### Clustering

```bash
# RabbitMQ Cluster: Multiple nodes
# - Shared queues
# - High availability
# - Load distribution

# Join cluster
rabbitmqctl stop_app
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app
```

### Mirroring

```java
// Queue Mirroring: Replicate queues across nodes
// Configuration
Map<String, Object> args = new HashMap<>();
args.put("x-ha-policy", "all");  // Mirror to all nodes
Queue queue = new Queue("order-queue", true, false, false, args);
```

---

## Performance Tuning

### Connection Pooling

```java
// Connection pooling
@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setCacheMode(CachingConnectionFactory.CacheMode.CHANNEL);
    factory.setChannelCacheSize(25);  // Cache channels
    return factory;
}
```

### Batch Publishing

```java
// Batch publishing
rabbitTemplate.setBatchSize(100);  // Batch 100 messages
```

---

## Monitoring

### Management UI

```bash
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Access: http://localhost:15672
# Default: guest/guest
```

### Metrics

```java
// Key metrics:
// - Queue length
// - Message rate
// - Consumer count
// - Connection count
```

---

## Best Practices

1. **Use durable queues**: For important messages
2. **Configure DLQ**: Handle failures
3. **Set prefetch**: Based on processing time
4. **Use publisher confirms**: Ensure delivery
5. **Monitor queues**: Track metrics
6. **Cluster setup**: For HA
7. **Idempotent processing**: Handle duplicates

---

## Câu hỏi thường gặp

### Q1: RabbitMQ clustering?

```java
// Clustering:
// - Multiple nodes
// - Shared state
// - High availability
// - Queue mirroring
```

---

## Tổng kết

- **Clustering**: High availability
- **Performance Tuning**: Connection pooling, batching
- **Monitoring**: Management UI, metrics
- **Best Practices**: Durable, DLQ, monitoring
