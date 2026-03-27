# Production Operations & Performance - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Performance Tuning](#performance-tuning)
2. [Memory Management](#memory-management)
3. [Connection & Channel Management](#connection--channel-management)
4. [Queue Performance](#queue-performance)
5. [Monitoring chuyên sâu](#monitoring-chuyên-sâu)
6. [Troubleshooting](#troubleshooting)
7. [Capacity Planning](#capacity-planning)
8. [Upgrade Strategies](#upgrade-strategies)
9. [Docker & Kubernetes Production](#docker--kubernetes-production)
10. [Production Checklist](#production-checklist)
11. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Performance Tuning

### Tổng quan Throughput Factors

```
Throughput = f(Network, Disk, CPU, Memory, Config)

Bottleneck thường gặp (theo thứ tự):
1. Disk I/O (persistent messages, quorum queues)
2. Network (cross-node, cross-DC)
3. Memory (backlog, large messages)
4. CPU (routing, serialization, TLS)
5. Config (prefetch, batch, concurrency)
```

### Publisher Performance

```properties
# 1. Batch Confirm (QUAN TRỌNG NHẤT)
# Thay vì confirm từng message → batch confirm

# Spring AMQP: Correlated confirms
spring.rabbitmq.publisher-confirm-type=correlated
spring.rabbitmq.publisher-returns=true
```

```java
// Batch confirm: Gửi N messages → confirm 1 lần
public void publishBatch(List<Order> orders) {
    orders.forEach(order -> {
        CorrelationData cd = new CorrelationData(order.getId().toString());
        rabbitTemplate.convertAndSend("order-exchange", "order.created", order, cd);
    });
    // Confirms sẽ arrive async
}

// Hoặc dùng Channel trực tiếp (performance tối đa)
channel.confirmSelect();
for (Order order : orders) {
    channel.basicPublish("order-exchange", "order.created", null, serialize(order));
}
// Confirm tất cả messages đã gửi
channel.waitForConfirmsOrDie(5000);  // Batch confirm
```

```properties
# 2. Channel caching (tránh tạo channel mới cho mỗi publish)
spring.rabbitmq.cache.channel.size=25        # Cache 25 channels
spring.rabbitmq.cache.channel.checkout-timeout=1000  # Chờ 1s nếu hết channel

# 3. Disable persistence cho messages không quan trọng
# DeliveryMode.NON_PERSISTENT → không ghi disk → nhanh hơn 10-50x
```

### Consumer Performance

```properties
# 1. Prefetch count (QUAN TRỌNG NHẤT)
# Quá thấp: consumer idle chờ message
# Quá cao: uneven distribution, memory tốn
spring.rabbitmq.listener.simple.prefetch=25

# Rule of thumb:
# - Fast processing (< 1ms): prefetch = 50-100
# - Normal processing (1-10ms): prefetch = 10-25
# - Slow processing (> 100ms): prefetch = 1-5

# 2. Concurrency (parallel consumers)
spring.rabbitmq.listener.simple.concurrency=5        # Min 5 consumers
spring.rabbitmq.listener.simple.max-concurrency=10   # Max 10

# 3. Batch consumer (RabbitMQ 3.x + Spring Boot 3.x)
spring.rabbitmq.listener.simple.consumer-batch-enabled=true
spring.rabbitmq.listener.simple.batch-size=50
```

```java
// Batch consumer: Nhận 50 messages cùng lúc
@RabbitListener(queues = "events", containerFactory = "batchFactory")
public void processBatch(List<Event> events) {
    // Xử lý batch → giảm overhead per-message
    eventRepo.saveAll(events);  // Batch insert
}
```

### Message Size

```
Message size ảnh hưởng lớn đến throughput:
- < 1 KB: 50,000-100,000 msg/s
- 1-10 KB: 20,000-50,000 msg/s
- 10-100 KB: 5,000-20,000 msg/s
- > 100 KB: 1,000-5,000 msg/s

Best practices:
- Giữ message nhỏ (< 1 KB nếu có thể)
- Gửi reference (ID, URL) thay vì full payload
- Compress nếu message lớn
```

---

## Memory Management

### Memory Watermark

```properties
# rabbitmq.conf
# Memory alarm: Block publishers khi memory > watermark
vm_memory_high_watermark.relative = 0.4         # 40% system RAM (default)
# Hoặc absolute:
vm_memory_high_watermark.absolute = 2GB

# Paging ratio: Khi memory đạt watermark × paging_ratio → page messages to disk
vm_memory_high_watermark_paging_ratio = 0.5      # 50% of watermark
# Ví dụ: watermark=0.4, paging_ratio=0.5
# Paging starts: 0.4 × 0.5 = 20% system RAM
# Block publishers: 40% system RAM
```

### Memory Breakdown

```bash
# Xem memory usage chi tiết
rabbitmqctl status
# Hoặc qua Management API:
# GET /api/nodes/rabbit@hostname

# Memory components:
# - Connection readers/writers: Mỗi connection ~100KB
# - Channels: Mỗi channel ~20KB
# - Queue process: Mỗi queue ~30KB (empty)
# - Message bodies: Actual message data
# - Mnesia: Metadata tables
# - Binary references: Erlang binary heap
```

### Giảm Memory Usage

```properties
# 1. Lazy Queues cho Classic Queues (messages trên disk)
# x-queue-mode: lazy

# 2. Quorum Queues tự quản lý (wal + segments)

# 3. Message TTL (tránh backlog vô hạn)  
# x-message-ttl: 86400000  (24 giờ)

# 4. Queue length limits
# x-max-length: 100000         (max 100K messages)
# x-overflow: reject-publish   (reject nếu full, thay vì drop oldest)

# 5. Giảm channel cache
spring.rabbitmq.cache.channel.size=10
```

---

## Connection & Channel Management

### Connection vs Channel

```
Connection = TCP connection (expensive: TLS handshake, socket)
Channel = Virtual connection bên trong Connection (cheap)

Rule:
- 1 Connection per application instance (hoặc 2: 1 publish, 1 consume)
- Nhiều Channels per Connection
- KHÔNG tạo connection per message (performance disaster)
```

### Connection Pooling (Spring AMQP)

```java
@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setHost("rabbitmq");
    factory.setPort(5672);
    
    // Connection cache
    factory.setCacheMode(CachingConnectionFactory.CacheMode.CONNECTION);
    factory.setConnectionCacheSize(5);        // 5 connections
    
    // Channel cache (mặc định, khuyến nghị)
    factory.setCacheMode(CachingConnectionFactory.CacheMode.CHANNEL);
    factory.setChannelCacheSize(25);          // 25 channels cached
    factory.setChannelCheckoutTimeout(1000);  // Timeout nếu hết channel
    
    return factory;
}
```

### Heartbeat

```properties
# rabbitmq.conf
heartbeat = 60  # Giây (0 = disable)

# Spring AMQP
spring.rabbitmq.requested-heartbeat=60

# Heartbeat quá ngắn: Network overhead
# Heartbeat quá dài: Chậm phát hiện dead connections
# Khuyến nghị: 60 giây
```

### Connection Recovery

```properties
# Spring AMQP tự recovery connections
spring.rabbitmq.connection-timeout=5000       # Connect timeout
spring.rabbitmq.channel-rpc-timeout=10000     # Channel timeout

# Automatic recovery (mặc định ON)
# Khi connection drop:
# 1. Reconnect automatically
# 2. Re-declare queues, exchanges, bindings
# 3. Re-register consumers
```

---

## Queue Performance

### Quorum Queue Tuning

```properties
# rabbitmq.conf
# Raft WAL (Write-Ahead Log) settings
raft.wal_max_size_bytes = 536870912           # 512 MB per WAL segment
raft.wal_max_batch_size = 4096                # Batch WAL writes

# Delivery limit (poison message protection)
# Qua queue argument: x-delivery-limit = 5
```

### Queue Length Impact

```
Queue length ảnh hưởng performance:
- 0-10K messages: ✅ Không ảnh hưởng
- 10K-100K: ⚠️ Memory tăng, consume latency tăng nhẹ
- 100K-1M: ⚠️ Memory pressure, paging bắt đầu
- > 1M: ❌ Memory alarm possible, throughput giảm đáng kể

LUÔN monitor queue length!
Nếu queue tăng liên tục → consumer không kịp → SCALE consumer
```

### Single Active Consumer

```java
// Chỉ 1 consumer active cho queue (ordering guarantee)
@Bean
public Queue orderedQueue() {
    return QueueBuilder.durable("ordered-events")
        .withArgument("x-single-active-consumer", true)
        .build();
}

// Khi active consumer down → RabbitMQ tự chuyển sang consumer backup
// Use case: Sequential processing, ordered events
// Trade-off: Không parallel → throughput thấp hơn
```

---

## Monitoring chuyên sâu

### Prometheus Metrics (quan trọng nhất)

```properties
# rabbitmq.conf
# RabbitMQ 3.8+ tự expose Prometheus metrics
prometheus.return_per_object_metrics = true
# Endpoint: http://rabbitmq:15692/metrics
```

### Key Alerts

```yaml
# prometheus/alerts.yml
groups:
  - name: rabbitmq
    rules:
      # Queue backlog
      - alert: QueueBacklog
        expr: rabbitmq_queue_messages > 100000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Queue {{ $labels.queue }} has backlog: {{ $value }}"

      # No consumers
      - alert: QueueNoConsumers
        expr: rabbitmq_queue_consumers == 0 
              and rabbitmq_queue_messages > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Queue {{ $labels.queue }} has no consumers"

      # Memory alarm
      - alert: MemoryAlarm
        expr: rabbitmq_node_mem_alarm == 1
        labels:
          severity: critical
        annotations:
          summary: "RabbitMQ memory alarm on {{ $labels.node }}"

      # Disk alarm
      - alert: DiskAlarm
        expr: rabbitmq_node_disk_free_alarm == 1
        labels:
          severity: critical
        annotations:
          summary: "RabbitMQ disk alarm on {{ $labels.node }}"

      # Unacked messages tồn đọng
      - alert: HighUnacked
        expr: rabbitmq_queue_messages_unacked > 10000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High unacked messages on {{ $labels.queue }}"

      # Connection churn (quá nhiều connect/disconnect)
      - alert: ConnectionChurn
        expr: rate(rabbitmq_connections_opened_total[5m]) > 100
        labels:
          severity: warning
        annotations:
          summary: "High connection churn on {{ $labels.node }}"
```

### Management API

```bash
# Queue stats
curl -u admin:admin http://rabbitmq:15672/api/queues/%2f/order-queue | jq '{
    messages: .messages,
    messages_unacked: .messages_unacknowledged,
    publish_rate: .message_stats.publish_details.rate,
    deliver_rate: .message_stats.deliver_get_details.rate,
    consumers: .consumers,
    memory: .memory
}'

# Node health
curl -u admin:admin http://rabbitmq:15672/api/nodes | jq '.[0] | {
    name: .name,
    running: .running,
    mem_used: .mem_used,
    mem_limit: .mem_limit,
    disk_free: .disk_free,
    disk_free_limit: .disk_free_limit,
    fd_used: .fd_used,
    fd_total: .fd_total,
    proc_used: .proc_used
}'
```

---

## Troubleshooting

### 1. Queue messages tăng liên tục

```
Nguyên nhân:
- Consumer chậm hơn producer
- Consumer bị crash / disconnect
- Consumer reject (NACK) quá nhiều → requeue loop

Fix:
1. Check consumer count: rabbitmqctl list_consumers
2. Scale consumers (tăng concurrency hoặc instances)
3. Check consumer logs (exceptions?)
4. Check prefetch (quá thấp → consumer idle)
5. Tạo alert khi queue > threshold
```

### 2. Memory alarm (publishers blocked)

```
Nguyên nhân:
- Queue backlog quá lớn (messages trong RAM)
- Connection/channel leak
- Large messages

Fix:
1. Drain queues (thêm consumers)
2. Set message TTL + max-length
3. Dùng Lazy Queue hoặc Quorum Queue
4. Tăng memory watermark (tạm thời)
5. Check connection count: rabbitmqctl list_connections
```

### 3. Connection refused / timeout

```
Nguyên nhân:
- RabbitMQ node down
- File descriptor limit
- Network firewall

Fix:
1. Check node status: rabbitmqctl status
2. Check fd limits: ulimit -n (khuyến nghị 65535)
3. Check ports: 5672 (AMQP), 15672 (Management), 25672 (Clustering)
4. Check TLS cert validity
```

### 4. Cluster split-brain

```
Dấu hiệu:
- Management UI hiện "Network partitions detected"
- Messages bị duplicate (cả 2 partitions nhận)

Fix:
1. Xác định partition nào là "đúng" (có nhiều data hơn)
2. Restart nodes ở partition nhỏ: rabbitmqctl stop_app && rabbitmqctl start_app
3. Hoặc restart toàn bộ cluster (last resort)
4. Prevention: Dùng pause_minority + Quorum Queues
```

### 5. Slow consumer (Prefetch full)

```
Dấu hiệu:
- unacked messages cao
- deliver rate < publish rate
- Consumer CPU/memory cao

Fix:
1. Giảm prefetch (nếu consumer không xử lý kịp)
2. Scale consumers (concurrency/instances)
3. Optimize processing logic
4. Kiểm tra downstream (DB connection pool, external API)
```

---

## Capacity Planning

### Sizing Guide

```
Tính toán cho 10,000 messages/giây:

1. Network:
   - Msg size 1KB × 10,000 msg/s = 10 MB/s = 80 Mbps
   - Cần: Gigabit network (minimum)

2. Disk (persistent messages):
   - Write: 10 MB/s (messages) + WAL overhead
   - Cần: SSD (IOPS > 5,000)
   - KHÔNG dùng NFS/network storage

3. Memory:
   - Per connection: ~100 KB
   - Per channel: ~20 KB
   - Per queue (empty): ~30 KB
   - Message buffer: prefetch × msg_size × consumers
   - Rule: 4-8 GB RAM cho moderate workload

4. CPU:
   - Routing: 1 core per ~50,000 msg/s (simple routing)
   - TLS: +30-50% CPU overhead
   - Rule: 4-8 cores cho moderate workload

5. Cluster:
   - 3 nodes cho HA (minimum)
   - 5 nodes cho high throughput + HA
```

### File Descriptors

```bash
# RabbitMQ cần NHIỀU file descriptors
# Mỗi connection + mỗi queue + mỗi file = 1 FD

# Check current
rabbitmqctl status | grep -A 3 "File Descriptors"

# Set limit
# /etc/security/limits.conf
rabbitmq   soft   nofile   65536
rabbitmq   hard   nofile   65536

# Hoặc systemd
# /etc/systemd/system/rabbitmq-server.service.d/limits.conf
[Service]
LimitNOFILE=65536
```

---

## Docker & Kubernetes Production

### Docker

```yaml
# docker-compose.yml (Production-ready cluster)
version: '3.8'
services:
  rabbitmq-1:
    image: rabbitmq:3.13-management-alpine
    hostname: rabbit1
    environment:
      RABBITMQ_ERLANG_COOKIE: 'secret-cookie'
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: strong-password
      RABBITMQ_VM_MEMORY_HIGH_WATERMARK: 0.6
    volumes:
      - rabbitmq1_data:/var/lib/rabbitmq
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
      - ./enabled_plugins:/etc/rabbitmq/enabled_plugins:ro
    ports:
      - "5672:5672"
      - "15672:15672"
      - "15692:15692"  # Prometheus
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'
        reservations:
          memory: 2G
          cpus: '1'

volumes:
  rabbitmq1_data:
    driver: local
```

### Kubernetes (RabbitMQ Cluster Operator)

```yaml
# Khuyến nghị dùng RabbitMQ Cluster Operator
# https://www.rabbitmq.com/kubernetes/operator/quickstart-operator

apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: production-rabbit
spec:
  replicas: 3
  
  resources:
    requests:
      cpu: '1'
      memory: 2Gi
    limits:
      cpu: '2'
      memory: 4Gi
  
  persistence:
    storageClassName: ssd-storage
    storage: 50Gi
  
  rabbitmq:
    additionalConfig: |
      cluster_partition_handling = pause_minority
      vm_memory_high_watermark.relative = 0.6
      disk_free_limit.relative = 1.5
      default_user = admin
      default_pass = production-password
      log.console.level = warning
      
    advancedConfig: |
      [
        {rabbit, [
          {tcp_listen_options, [
            {backlog, 128},
            {nodelay, true},
            {linger, {true, 0}},
            {exit_on_close, false}
          ]}
        ]}
      ].
      
    additionalPlugins:
      - rabbitmq_management
      - rabbitmq_prometheus
      - rabbitmq_peer_discovery_k8s
  
  override:
    statefulSet:
      spec:
        template:
          spec:
            containers:
              - name: rabbitmq
                env:
                  - name: RABBITMQ_ERLANG_COOKIE
                    valueFrom:
                      secretKeyRef:
                        name: rabbit-cookie
                        key: cookie
```

---

## Production Checklist

### Deployment

- [ ] **Cluster**: 3+ nodes, tất cả disk nodes
- [ ] **Partition handling**: `pause_minority`
- [ ] **Quorum Queues**: Thay thế Classic Mirrored Queues
- [ ] **File descriptors**: ≥ 65,536
- [ ] **Disk**: SSD, đủ dung lượng (> 2× RAM minimum)
- [ ] **Erlang cookie**: Unique, secure, shared giữa nodes

### Configuration

- [ ] **Memory watermark**: 40-60% system RAM
- [ ] **Disk free limit**: 1.5× RAM
- [ ] **Heartbeat**: 60 giây
- [ ] **Channel cache**: 25-50 channels
- [ ] **Prefetch**: Tune theo processing time
- [ ] **Message TTL**: Set cho tất cả queues (tránh backlog vô hạn)
- [ ] **Queue max-length**: Set limits hợp lý

### Security

- [ ] **Default user**: Đổi/xóa guest account
- [ ] **TLS**: Bật cho client connections + inter-node
- [ ] **Virtual hosts**: Tách theo tenant/environment
- [ ] **Permissions**: Least privilege per user per vhost

### Monitoring

- [ ] **Prometheus**: Cài plugin, scrape metrics
- [ ] **Grafana**: Dashboard cho queue length, publish/consume rate, memory
- [ ] **Alerts**: Memory alarm, disk alarm, queue backlog, no consumers
- [ ] **Logs**: Structured logging, rotate, centralize

### Application

- [ ] **Publisher Confirms**: Bật cho messages quan trọng
- [ ] **DLQ**: Mọi queue production đều có DLQ
- [ ] **Idempotent consumers**: Handle duplicate messages
- [ ] **Retry**: Exponential backoff (delay queues hoặc Spring Retry)
- [ ] **Connection recovery**: Spring AMQP tự động
- [ ] **Outbox pattern**: Nếu cần DB + Message consistency

### Testing

- [ ] **Testcontainers**: `RabbitMQContainer` cho integration tests
- [ ] **Load test**: Đo throughput, latency dưới expected load
- [ ] **Failure test**: Kill node, test failover
- [ ] **Partition test**: Simulate network partition

---

## Câu hỏi thường gặp

### Q1: RabbitMQ có thể xử lý bao nhiêu messages/giây?

Tùy thuộc message size, persistence, routing:
- **Non-persistent, simple routing**: 50,000-100,000 msg/s per node
- **Persistent, quorum queue**: 10,000-30,000 msg/s per node
- **With TLS**: Giảm 30-50% so với plain

### Q2: Khi nào cần scale cluster?

- Queue backlog tăng liên tục
- CPU > 80% sustained
- Memory alarm trigger thường xuyên
- Throughput không đủ dù đã tune config

### Q3: SSD hay HDD?

**SSD luôn.** Persistent messages + Quorum Queue WAL cần random I/O. HDD sẽ thành bottleneck ngay. NFS/network storage → **KHÔNG BAO GIỜ** dùng cho RabbitMQ data.

### Q4: Container hay bare metal?

**Container (K8s) với RabbitMQ Cluster Operator** cho hầu hết cases. Bare metal chỉ khi cần absolute maximum performance hoặc compliance requirements.

### Q5: RabbitMQ 3.x hay 4.x?

RabbitMQ 4.x (nếu đã stable): Quorum Queues cải thiện, Classic Mirrored Queues bị xóa hoàn toàn, AMQP 1.0 default. Nếu mới deploy → 4.x. Nếu upgrade → kiểm tra migration guide.

---

## Tổng kết

- **Performance**: Prefetch, batch confirm, channel caching, message size nhỏ
- **Memory**: Watermark 40-60%, TTL + max-length cho queues, Lazy/Quorum Queue
- **Connections**: 1 connection per app, channel cache, heartbeat 60s
- **Monitoring**: Prometheus + Grafana, alerts cho memory/disk/backlog
- **Troubleshooting**: Queue backlog → scale consumers, Memory alarm → drain + TTL
- **K8s**: RabbitMQ Cluster Operator, SSD storage, pauseminority
- **Always**: Quorum Queues, Publisher Confirms, DLQ, Idempotent consumers
