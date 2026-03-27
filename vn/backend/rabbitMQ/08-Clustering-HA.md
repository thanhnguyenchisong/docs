# Clustering & High Availability - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Clustering cơ bản](#clustering-cơ-bản)
2. [Cluster Formation & Peer Discovery](#cluster-formation--peer-discovery)
3. [Network Partitions (Split-Brain)](#network-partitions-split-brain)
4. [Quorum Queues trong Cluster](#quorum-queues-trong-cluster)
5. [Load Balancing](#load-balancing)
6. [Rolling Upgrades](#rolling-upgrades)
7. [Disaster Recovery](#disaster-recovery)
8. [Monitoring Cluster](#monitoring-cluster)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Clustering cơ bản

### Cluster là gì?

RabbitMQ cluster = nhiều nodes chạy cùng Erlang cookie, chia sẻ:
- **Metadata**: Exchanges, Bindings, Vhosts, Users, Permissions, Policies
- **Quorum Queue data**: Replicated qua Raft
- **Stream data**: Replicated qua stream protocol

**KHÔNG chia sẻ** (Classic Queues):
- Queue data chỉ nằm trên node khai báo (trừ khi mirrored/quorum)
- Connections, channels — mỗi node riêng

```
┌─────────────────────────────────────────────────┐
│              RabbitMQ Cluster                     │
│                                                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │ Node 1  │◄──►│ Node 2  │◄──►│ Node 3  │     │
│  │ rabbit@a│    │ rabbit@b│    │ rabbit@c│     │
│  │         │    │         │    │         │     │
│  │ Q1(lead)│    │ Q1(rep) │    │ Q1(rep) │     │
│  │ Q2(rep) │    │ Q2(lead)│    │ Q2(rep) │     │
│  │ Q3(rep) │    │ Q3(rep) │    │ Q3(lead)│     │
│  └─────────┘    └─────────┘    └─────────┘     │
│                                                   │
│  Metadata: Synced across all nodes                │
│  Quorum Queue: Leader + Replicas (Raft)          │
└─────────────────────────────────────────────────┘
```

### Setup Cluster (Manual)

```bash
# Node 1: Reset và start
# Erlang cookie PHẢI giống nhau trên tất cả nodes
# File: /var/lib/rabbitmq/.erlang.cookie

# Node 2: Join cluster
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# Node 3: Join cluster
rabbitmqctl stop_app
rabbitmqctl reset
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl start_app

# Verify
rabbitmqctl cluster_status
```

### Disk Node vs RAM Node

```bash
# Disk node (mặc định): Lưu metadata trên disk
rabbitmqctl join_cluster rabbit@node1

# RAM node: Lưu metadata trong RAM (nhanh hơn nhưng mất khi restart)
rabbitmqctl join_cluster rabbit@node1 --ram

# Rule: Ít nhất 1 disk node trong cluster
# Khuyến nghị: Tất cả disk nodes (RAM node hiếm khi cần)
```

---

## Cluster Formation & Peer Discovery

### Peer Discovery Backends

| Backend | Config | Use Case |
| :--- | :--- | :--- |
| **Classic config** | `cluster_formation.peer_discovery_backend = classic_config` | Static list, dev/small |
| **DNS** | `cluster_formation.peer_discovery_backend = dns` | Kubernetes Service |
| **Consul** | `cluster_formation.peer_discovery_backend = consul` | HashiCorp Consul |
| **etcd** | `cluster_formation.peer_discovery_backend = etcd` | etcd cluster |
| **K8s** | `cluster_formation.peer_discovery_backend = k8s` | Kubernetes API |
| **AWS** | `cluster_formation.peer_discovery_backend = aws` | AWS Auto Scaling |

### Kubernetes Peer Discovery

```properties
# rabbitmq.conf
cluster_formation.peer_discovery_backend = k8s
cluster_formation.k8s.host = kubernetes.default.svc.cluster.local
cluster_formation.k8s.address_type = hostname
cluster_formation.k8s.service_name = rabbitmq-headless
cluster_formation.k8s.hostname_suffix = .rabbitmq-headless.default.svc.cluster.local

# Auto-join khi pod start
cluster_formation.node_cleanup.only_log_warning = true
```

### DNS Peer Discovery

```properties
# rabbitmq.conf  
cluster_formation.peer_discovery_backend = dns
cluster_formation.dns.hostname = rabbitmq-headless.default.svc.cluster.local
```

---

## Network Partitions (Split-Brain)

### Vấn đề

Khi network giữa nodes bị đứt → cluster chia thành 2+ phần → mỗi phần nghĩ phần kia đã chết → **split-brain**: cả 2 bên nhận messages → **data divergence** → **inconsistency**.

```
TRƯỚC partition:
  [Node1] ←──► [Node2] ←──► [Node3]
           OK          OK

SAU partition:
  [Node1] ←──► [Node2]    ✗    [Node3]
  Partition A               Partition B
  Cả 2 bên hoạt động → Split-brain!
```

### Partition Handling Strategies

```properties
# rabbitmq.conf
cluster_partition_handling = pause_minority
```

| Strategy | Hành vi | Use Case |
| :--- | :--- | :--- |
| **`ignore`** | Không làm gì → split-brain | ❌ KHÔNG dùng production |
| **`pause_minority`** | Partition nhỏ tự pause → chờ network recovery | ✅ **Khuyến nghị cho 3+ nodes** |
| **`autoheal`** | Tự chọn partition "thắng", restart phía "thua" → có thể mất data | 🟡 2-node cluster |

### pause_minority chi tiết

```
3-node cluster:
  [Node1, Node2] ←✗→ [Node3]
  
  pause_minority:
  - Partition [Node1, Node2] = 2/3 = majority → TIẾP TỤC hoạt động
  - Partition [Node3] = 1/3 = minority → TỰ PAUSE (ngừng nhận connections)
  - Khi network recovery → Node3 rejoin cluster tự động

  → Không mất data, không split-brain!
```

### Quorum Queues & Network Partitions

```
Quorum Queue (Raft) tự xử lý partition:
- Leader chỉ commit khi majority nodes ACK
- Nếu leader ở minority → KHÔNG commit → messages rejected
- Nếu leader ở majority → hoạt động bình thường
- Khi recovery → followers bắt kịp leader qua Raft log

→ Quorum Queues + pause_minority = safest combination
```

---

## Quorum Queues trong Cluster

### Leader Distribution

```bash
# Xem leader distribution
rabbitmq-queues quorum_status order-queue

# Quorum Queue tự distributed leaders qua cluster
# RabbitMQ chọn leader node dựa trên:
# 1. Node có ít leaders nhất (balanced distribution)
# 2. Node mà producer/consumer connect (nếu configured)
```

### Rebalance Leaders

```bash
# Khi add/remove node → leaders có thể unbalanced
# Rebalance:
rabbitmq-queues rebalance quorum

# Hoặc chỉ rebalance queues matching pattern:
rabbitmq-queues rebalance quorum --queue-pattern "^order-.*"
```

### Growing/Shrinking Cluster

```bash
# Thêm node → Quorum Queues tự thêm member
# (nếu x-quorum-initial-group-size cho phép)

# Xóa node:
rabbitmqctl forget_cluster_node rabbit@old-node

# Quorum Queues tự loại bỏ member ở node đã xóa
# Leader election tự động nếu leader ở node bị xóa
```

---

## Load Balancing

### HAProxy (Recommended)

```
# haproxy.cfg
frontend rabbitmq_front
    bind *:5672
    default_backend rabbitmq_back

backend rabbitmq_back
    balance roundrobin
    option httpchk GET /api/health/checks/alarms
    http-check expect status 200
    
    server rabbit1 node1:5672 check port 15672 inter 5s rise 2 fall 3
    server rabbit2 node2:5672 check port 15672 inter 5s rise 2 fall 3
    server rabbit3 node3:5672 check port 15672 inter 5s rise 2 fall 3

# Management UI
frontend rabbitmq_management
    bind *:15672
    default_backend rabbitmq_management_back

backend rabbitmq_management_back
    balance roundrobin
    server rabbit1 node1:15672 check
    server rabbit2 node2:15672 check
    server rabbit3 node3:15672 check
```

### Kubernetes Service

```yaml
# Headless Service cho peer discovery
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: rabbitmq
  ports:
    - port: 5672
      name: amqp
    - port: 15672
      name: management
    - port: 4369
      name: epmd
    - port: 25672
      name: clustering

---
# ClusterIP Service cho client connections (load balanced)
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
spec:
  type: ClusterIP
  selector:
    app: rabbitmq
  ports:
    - port: 5672
      name: amqp
    - port: 15672
      name: management
```

### Spring AMQP: Multiple Hosts

```properties
# Failover: kết nối node1, nếu fail → node2 → node3
spring.rabbitmq.addresses=node1:5672,node2:5672,node3:5672

# Hoặc qua HAProxy
spring.rabbitmq.host=haproxy
spring.rabbitmq.port=5672
```

---

## Rolling Upgrades

### Upgrade Cluster không downtime

```bash
# Bước 1: Drain node (chuyển traffic sang nodes khác)
rabbitmqctl drain  # Ngừng nhận connections mới, chờ connections cũ đóng

# Bước 2: Stop RabbitMQ
rabbitmqctl stop_app

# Bước 3: Upgrade RabbitMQ binary
# (package manager, Docker image, etc.)

# Bước 4: Start lại
rabbitmqctl start_app

# Bước 5: Verify node rejoined cluster
rabbitmqctl cluster_status

# Bước 6: Lặp lại cho node tiếp theo

# QUAN TRỌNG:
# - Upgrade từng node một (rolling)
# - Kiểm tra compatibility matrix giữa versions
# - Quorum Queues: leader election tự động khi node restart
# - Monitor queue lengths trong khi upgrade
```

### Version Compatibility

```
Rule: RabbitMQ chỉ hỗ trợ mixed-version cluster trong quá trình upgrade
- 3.12.x ⟷ 3.13.x: OK (1 minor version)
- 3.12.x ⟷ 4.0.x: Có thể cần migration steps
- 3.11.x ⟷ 3.13.x: KHÔNG (skip version)
→ Luôn upgrade sequential: 3.11 → 3.12 → 3.13
```

---

## Disaster Recovery

### Backup

```bash
# Export definitions (metadata: exchanges, queues, bindings, users, policies)
rabbitmqctl export_definitions /backup/definitions.json

# Import
rabbitmqctl import_definitions /backup/definitions.json

# LƯU Ý: Definitions KHÔNG bao gồm messages!
# Messages nằm trong Mnesia DB / Quorum Queue Raft log / Stream segments
```

### Backup Messages

```bash
# Mnesia backup (Classic Queues)
rabbitmqctl force_boot  # Nếu node duy nhất
cp -r /var/lib/rabbitmq/mnesia/ /backup/mnesia/

# Quorum Queue Raft log
cp -r /var/lib/rabbitmq/quorum/ /backup/quorum/

# Streams
cp -r /var/lib/rabbitmq/stream/ /backup/stream/
```

### Multi-site DR

```
Strategy 1: Shovel
  DC-Primary ──shovel──► DC-DR
  Messages được replicate liên tục

Strategy 2: Federation
  DC-A ◄──federation──► DC-B
  Exchanges linked, messages forwarded

Strategy 3: Active-Active (Quorum Queue, 5 nodes across 2 DCs)
  DC-A: [Node1, Node2, Node3]
  DC-B: [Node4, Node5]
  Quorum: 3/5 majority → tolerant 1 DC failure
  Nhược điểm: Cross-DC latency ảnh hưởng throughput
```

---

## Monitoring Cluster

### Key Metrics

| Metric | Alert khi | Ý nghĩa |
| :--- | :--- | :--- |
| `rabbitmq_queue_messages` | > 100,000 liên tục | Queue backlog |
| `rabbitmq_queue_messages_unacked` | > prefetch × consumers | Consumer chậm |
| `rabbitmq_connections` | > 5,000 per node | Connection pressure |
| `rabbitmq_channels` | > 10,000 per node | Channel leak |
| `rabbitmq_node_mem_used` | > mem_limit × 0.8 | Sắp memory alarm |
| `rabbitmq_node_disk_free` | < disk_free_limit × 1.5 | Sắp disk alarm |
| `rabbitmq_queue_consumers` | = 0 (trên queue quan trọng) | Consumer down |

### Prometheus + Grafana

```properties
# rabbitmq.conf
# Plugin tự bật trong RabbitMQ 3.8+
prometheus.return_per_object_metrics = true
prometheus.path = /metrics
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'rabbitmq'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['rabbit1:15692', 'rabbit2:15692', 'rabbit3:15692']
    # Port 15692 = Prometheus plugin endpoint
```

### Memory & Disk Alarms

```properties
# rabbitmq.conf
# Memory alarm: RabbitMQ block publishers khi memory > limit
vm_memory_high_watermark.relative = 0.6          # 60% system RAM
# Hoặc
vm_memory_high_watermark.absolute = 2GB

# Disk alarm: Block publishers khi disk free < limit
disk_free_limit.relative = 1.5                    # 1.5x RAM
# Hoặc
disk_free_limit.absolute = 5GB

# Khi alarm trigger:
# 1. Publishers bị BLOCKED (không gửi được message)
# 2. Consumers VẪN hoạt động (để drain queue)
# 3. Khi resource về bình thường → publishers unblocked
```

---

## Câu hỏi thường gặp

### Q1: Bao nhiêu nodes trong cluster?

**3 nodes** cho hầu hết production. 5 nodes nếu cần tolerant 2 node failures. Số lẻ luôn tốt hơn (majority voting). 2 nodes = **KHÔNG khuyến nghị** (split-brain khó xử lý).

### Q2: pause_minority hay autoheal?

**pause_minority** cho cluster 3+ nodes (safe, no data loss). **autoheal** chỉ dùng 2-node cluster (chấp nhận mất data).

### Q3: Quorum Queues có cần HAProxy không?

**Có.** HAProxy load balance connections. Client connect qua HAProxy → được phân phối đều tới nodes. Quorum Queue leader có thể ở bất kỳ node nào — RabbitMQ tự proxy request nội bộ.

### Q4: Node fail thì sao?

**Quorum Queue**: Leader election tự động (Raft), messages không mất nếu majority nodes còn sống. **Classic Queue**: Messages ở node down sẽ unavailable cho đến khi node recovery.

---

## Tổng kết

- **Cluster**: 3+ nodes, disk nodes, Erlang cookie chung
- **Peer Discovery**: K8s, DNS, Consul, static config
- **Network Partitions**: `pause_minority` + Quorum Queues = safest
- **Load Balancing**: HAProxy hoặc K8s Service
- **Upgrades**: Rolling, từng node một, check version compatibility
- **DR**: Shovel/Federation cho multi-site, backup definitions
- **Monitoring**: Prometheus metrics, memory/disk alarms
