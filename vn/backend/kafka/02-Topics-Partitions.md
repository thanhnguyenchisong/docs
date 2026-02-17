# Topics và Partitions - Câu hỏi phỏng vấn Kafka

## Mục lục
1. [Topics](#topics)
2. [Partitions](#partitions)
3. [Replication](#replication)
4. [Leader và Followers](#leader-và-followers)
5. [Partitioning Strategy](#partitioning-strategy)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Topics

### Topic Definition

**Topic** là category/feed name mà messages được published và consumed.

```java
// Topic structure
Topic: user-events
├── Partition 0
├── Partition 1
└── Partition 2
```

### Creating Topics

```bash
# Create topic với partitions và replication
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 2

# List topics
kafka-topics.sh --list \
  --bootstrap-server localhost:9092

# Describe topic
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --topic user-events
```

### Topic Configuration

```bash
# Create topic với custom configuration
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 2 \
  --config retention.ms=604800000 \
  --config max.message.bytes=1048576

# Alter topic configuration
kafka-configs.sh --alter \
  --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name user-events \
  --add-config retention.ms=86400000
```

### Important Topic Settings

```properties
# Retention: How long messages are kept
retention.ms=604800000  # 7 days
retention.bytes=1073741824  # 1 GB

# Segment: Log segment size
segment.ms=604800000
segment.bytes=1073741824

# Compression
compression.type=snappy  # or gzip, lz4, zstd

# Max message size
max.message.bytes=1048576  # 1 MB
```

---

## Partitions

### Partition Concept

**Partition** là ordered sequence of records trong một topic.

```java
// Topic với multiple partitions
Topic: user-events
├── Partition 0: [msg1, msg4, msg7, ...]  // Ordered
├── Partition 1: [msg2, msg5, msg8, ...]  // Ordered
└── Partition 2: [msg3, msg6, msg9, ...]  // Ordered

// Messages within partition are ordered
// Messages across partitions are NOT ordered
```

### Partition Benefits

1. **Parallelism**: Multiple consumers can read from different partitions
2. **Scalability**: Can add more partitions to increase throughput
3. **Ordering**: Messages within partition maintain order
4. **Distribution**: Spread data across brokers

### Partition Assignment

```java
// Producer decides which partition to send message to

// Strategy 1: Round-robin (no key)
Producer → Partition 0
Producer → Partition 1
Producer → Partition 2
Producer → Partition 0 (cycle)

// Strategy 2: Key-based (with key)
Key "user-1" → Hash → Partition 0
Key "user-2" → Hash → Partition 1
Key "user-3" → Hash → Partition 2
// Same key always goes to same partition
```

### Choosing Number of Partitions

```java
// Factors to consider:

// 1. Throughput
// More partitions = more parallelism = higher throughput
// But: Too many partitions can cause overhead

// 2. Consumer parallelism
// Number of partitions = max consumers in group
// Example: 6 partitions → max 6 consumers

// 3. Cluster size
// More brokers = can have more partitions

// Rule of thumb:
// Start with: Number of brokers × 2
// Scale up if needed
```

---

## Replication

### Replication Concept

**Replication** là copies của partitions across multiple brokers để đảm bảo fault tolerance.

```java
// Replication Factor = 3
Topic: user-events, Partition 0

Broker 1: Partition 0 (Leader)    ← Handles reads/writes
Broker 2: Partition 0 (Follower)   ← Replicates from leader
Broker 3: Partition 0 (Follower)   ← Replicates from leader

// If Broker 1 fails:
// Broker 2 or 3 becomes new leader
```

### Replication Factor

```bash
# Replication Factor = 3 means 3 copies
# Minimum: 1 (no replication)
# Recommended: 3 (for production)

# Create topic với replication factor 3
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 3
```

### In-Sync Replicas (ISR)

```java
// ISR: In-Sync Replicas
// Replicas that are up-to-date with leader

Partition 0:
- Leader: Broker 1 (in-sync)
- Follower: Broker 2 (in-sync)
- Follower: Broker 3 (out-of-sync)  // Lagging behind

ISR = [Broker 1, Broker 2]

// Producer acks=all requires:
// min.insync.replicas replicas to be in-sync
```

### Replication Configuration

```properties
# Minimum in-sync replicas
min.insync.replicas=2

# Replication factor
default.replication.factor=3

# Unclean leader election
unclean.leader.election.enable=false  # Don't allow out-of-sync replica to become leader
```

---

## Leader và Followers

### Leader

```java
// Leader: Handles all reads and writes for partition

Partition 0 Leader (Broker 1):
- Receives writes from producers
- Serves reads from consumers
- Replicates data to followers

// Only leader handles client requests
```

### Followers

```java
// Followers: Replicate data from leader

Partition 0 Followers (Broker 2, 3):
- Replicate data from leader
- Don't serve client requests
- Can become leader if current leader fails

// Follower lag: How far behind follower is
```

### Leader Election

```java
// Leader Election: Choose new leader when current leader fails

// Scenario: Leader (Broker 1) fails
Before:
- Leader: Broker 1
- Followers: Broker 2, 3

After:
- New Leader: Broker 2 (from ISR)
- Followers: Broker 3

// Process:
// 1. Detect leader failure
// 2. Choose new leader from ISR
// 3. Update metadata
// 4. Clients reconnect to new leader
```

### Preferred Leader

```java
// Preferred Leader: Original leader assignment

// After leader election, preferred leader might be different
// Can rebalance to use preferred leader

# Rebalance to preferred leader
kafka-preferred-replica-election.sh \
  --bootstrap-server localhost:9092 \
  --path-to-json-file partitions.json
```

---

## Partitioning Strategy

### No Key (Round-Robin)

```java
// No key: Round-robin distribution

ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "value");

// Distribution:
// Message 1 → Partition 0
// Message 2 → Partition 1
// Message 3 → Partition 2
// Message 4 → Partition 0 (cycle)
```

### With Key (Hash-based)

```java
// With key: Hash-based distribution

ProducerRecord<String, String> record = 
    new ProducerRecord<>("topic", "user-123", "value");

// Distribution:
// Hash("user-123") % numPartitions → Partition
// Same key always goes to same partition
```

### Custom Partitioner

```java
// Custom partitioner
public class CustomPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        List<PartitionInfo> partitions = cluster.partitionsForTopic(topic);
        int numPartitions = partitions.size();
        
        // Custom logic
        if (key == null) {
            return 0;  // Default partition
        }
        
        // Example: Partition by user ID
        String userId = (String) key;
        return Math.abs(userId.hashCode()) % numPartitions;
    }
}

// Configuration
props.put("partitioner.class", CustomPartitioner.class.getName());
```

### Partitioning Best Practices

```java
// ✅ Good: Use keys for related messages
// Messages with same key go to same partition
// Maintains ordering for related messages

ProducerRecord<String, String> record = 
    new ProducerRecord<>("orders", order.getUserId(), orderJson);

// ✅ Good: Choose partition count carefully
// Too few: Limited parallelism
// Too many: Overhead, more file handles

// ✅ Good: Monitor partition distribution
// Ensure even distribution of messages
```

---

## Câu hỏi thường gặp

### Q1: Có thể thay đổi số partitions sau khi tạo topic không?

```bash
# ✅ Yes: Can increase partitions (but not decrease)

# Increase partitions
kafka-topics.sh --alter \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 6

# ❌ Cannot decrease partitions
# Solution: Create new topic với fewer partitions
```

### Q2: Tại sao không thể giảm số partitions?

```java
// Reasons:
// 1. Data loss: Messages in removed partitions would be lost
// 2. Offset mapping: Consumer offsets tied to partitions
// 3. Ordering: Would break ordering guarantees

// Workaround:
// 1. Create new topic với fewer partitions
// 2. Migrate data
// 3. Update producers/consumers
```

### Q3: Replication factor nên là bao nhiêu?

```java
// Recommendations:
// - Development: 1 (no replication)
// - Production: 3 (good balance)
// - Critical: 5 (extra safety)

// Trade-offs:
// - Higher replication: More safety, more storage
// - Lower replication: Less safety, less storage
```

### Q4: Có thể thay đổi replication factor không?

```bash
# ✅ Yes: Can increase replication factor

# Increase replication factor
kafka-reassign-partitions.sh \
  --bootstrap-server localhost:9092 \
  --reassignment-json-file reassignment.json \
  --execute

# ❌ Cannot decrease replication factor
# (Not directly supported)
```

### Q5: Làm sao đảm bảo messages không mất?

```java
// Configuration for durability:

// 1. Replication
replication.factor=3

// 2. Producer acks
acks=all  // Wait for all replicas

// 3. Min in-sync replicas
min.insync.replicas=2

// 4. Unclean leader election
unclean.leader.election.enable=false

// 5. Producer idempotence
enable.idempotence=true
```

### Q6: Partition key selection strategy?

```java
// Strategy 1: No key (round-robin)
// Use when: No ordering requirement
ProducerRecord<>("topic", "value");

// Strategy 2: Business key
// Use when: Need ordering for related messages
ProducerRecord<>("topic", userId, orderJson);

// Strategy 3: Composite key
// Use when: Need multi-level partitioning
String compositeKey = userId + "-" + orderType;
ProducerRecord<>("topic", compositeKey, orderJson);
```

### Q7: Làm sao monitor partition health?

```bash
# Describe topic
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --topic user-events

# Output shows:
# - Partition ID
# - Leader
# - Replicas
# - ISR (In-Sync Replicas)

# Check under-replicated partitions
kafka-topics.sh --describe \
  --under-replicated-partitions \
  --bootstrap-server localhost:9092
```

---

## Best Practices

1. **Choose right partition count**: Based on throughput và consumer parallelism
2. **Use replication factor 3**: Good balance cho production
3. **Set min.insync.replicas**: At least 2
4. **Use keys appropriately**: For ordering related messages
5. **Monitor ISR**: Ensure replicas stay in-sync
6. **Avoid too many partitions**: Can cause overhead
7. **Plan partition count**: Hard to decrease later
8. **Use preferred leader**: Rebalance when needed

---

## Bài tập thực hành

### Bài 1: Topic Management

```bash
# Yêu cầu:
# 1. Create topic với 6 partitions, replication factor 3
# 2. Increase partitions to 12
# 3. Monitor partition distribution
# 4. Check ISR status
```

### Bài 2: Partitioning Strategy

```java
// Yêu cầu: Implement custom partitioner
// Partition messages by user region
// Ensure users from same region go to same partition
```

---

## Tổng kết

- **Topics**: Category/feed name cho messages
- **Partitions**: Ordered sequence of records, enables parallelism
- **Replication**: Copies across brokers, ensures fault tolerance
- **Leader**: Handles reads/writes
- **Followers**: Replicate from leader
- **Partitioning Strategy**: Round-robin (no key) vs Hash-based (with key)
- **Best Practices**: Right partition count, replication factor 3, monitor ISR
