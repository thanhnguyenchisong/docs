# Tài liệu Luyện Phỏng vấn RabbitMQ

Chào mừng đến với bộ tài liệu luyện phỏng vấn RabbitMQ! Bộ tài liệu này bao gồm các chủ đề từ cơ bản đến master level (10+ năm kinh nghiệm) về RabbitMQ Message Broker.

## 📚 Mục lục

### Core RabbitMQ

1. **[RabbitMQ Fundamentals](./01-RabbitMQ-Fundamentals.md)**
   - RabbitMQ là gì?
   - AMQP Protocol
   - RabbitMQ Architecture
   - RabbitMQ vs Kafka vs ActiveMQ

2. **[Exchanges và Routing](./02-Exchanges-Routing.md)**
   - Exchange Types (Direct, Topic, Fanout, Headers)
   - Routing Keys & Bindings
   - Routing Patterns

3. **[Queues](./03-Queues.md)**
   - Queue Declaration & Properties
   - Dead Letter Queues (DLQ)
   - Priority Queues
   - Queue Arguments (TTL, Max-length)

4. **[Producers](./04-Producers.md)**
   - Publishing Messages
   - Message Properties
   - Publisher Confirms
   - Message Persistence

5. **[Consumers](./05-Consumers.md)**
   - @RabbitListener
   - Acknowledgment (ACK/NACK)
   - Consumer Prefetch
   - Error Handling & Retry

6. **[Spring AMQP](./06-Spring-AMQP.md)**
   - Configuration
   - RabbitTemplate
   - Message Converters
   - Transaction Support

### Advanced & Master-Level

7. **[Advanced Topics](./07-Advanced-Topics.md)**
   - Quorum Queues (Raft consensus, thay thế Mirrored Queues)
   - Streams (Kafka-like append-only log)
   - Lazy Queues
   - Delayed Messages (Plugin + TTL+DLX workaround)
   - Shovel & Federation (cross-cluster replication)
   - Alternate Exchange, Consistent Hash Exchange
   - Security (TLS, OAuth2, Permissions)
   - Exactly-once & Idempotency

8. **[Clustering & High Availability](./08-Clustering-HA.md)**
   - Cluster Formation & Peer Discovery (K8s, DNS, Consul)
   - Network Partitions & Split-Brain (pause_minority)
   - Quorum Queues replication (Raft)
   - Load Balancing (HAProxy, K8s Service)
   - Rolling Upgrades, Disaster Recovery
   - Monitoring cluster

9. **[Message Patterns & Architecture](./09-Patterns-Architecture.md)**
   - Work Queue (Competing Consumers)
   - Publish/Subscribe
   - Request/Reply (RPC)
   - Saga Pattern (Choreography vs Orchestrator)
   - Retry với Exponential Backoff
   - Event Sourcing & CQRS
   - Outbox Pattern (DB + message consistency)
   - Message Deduplication

10. **[Production Operations & Performance](./10-Production-Operations.md)**
    - Performance Tuning (Publisher/Consumer/Queue)
    - Memory & Disk Management
    - Connection & Channel Management
    - Monitoring (Prometheus + Grafana, Alerts)
    - Troubleshooting (5 scenarios phổ biến)
    - Capacity Planning
    - Docker & Kubernetes Production (Cluster Operator)
    - Production Checklist

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Nắm vững AMQP và architecture
2. **Thực hành code**: Mỗi file có code examples
3. **Ôn tập theo chủ đề**: Tập trung vào các chủ đề bạn còn yếu
4. **Làm bài tập**: Hoàn thành các bài tập ở cuối mỗi file

## 📝 Cấu trúc mỗi file

Mỗi file tài liệu bao gồm:

- **Lý thuyết**: Giải thích chi tiết các khái niệm
- **Ví dụ code**: Code examples minh họa (Spring AMQP)
- **So sánh**: So sánh các approaches khác nhau
- **Best Practices**: Các thực hành tốt nhất
- **Câu hỏi thường gặp**: FAQ với câu trả lời chi tiết

## 🔥 Chủ đề Hot trong Phỏng vấn

### Core RabbitMQ
- ✅ AMQP Protocol và Architecture
- ✅ Exchange Types và Routing
- ✅ Message Acknowledgment, Persistence, Confirms
- ✅ Dead Letter Queues

### Advanced
- ✅ Quorum Queues vs Classic Mirrored Queues
- ✅ Saga Pattern (Distributed Transactions)
- ✅ Exactly-once delivery vs At-least-once + Idempotency
- ✅ Outbox Pattern (Dual Write Problem)

### Production
- ✅ Clustering & Network Partitions
- ✅ Performance Tuning
- ✅ Monitoring & Troubleshooting
- ✅ Kubernetes Deployment

## 🚀 Lộ trình học

### Beginner → Intermediate
1. RabbitMQ Fundamentals
2. Exchanges và Routing
3. Queues
4. Producers và Consumers

### Intermediate → Advanced
5. Spring AMQP
6. Advanced Topics (Quorum Queues, Streams, Security)
7. Clustering & HA

### Advanced → Master
8. Message Patterns & Architecture (Saga, RPC, Outbox, Event Sourcing)
9. Production Operations & Performance (Tuning, Monitoring, K8s)

## ✅ Checklist trước Phỏng vấn

### Core
- [ ] AMQP Protocol (Exchange → Binding → Queue → Consumer)
- [ ] Exchange Types (Direct, Topic, Fanout, Headers — khi nào dùng)
- [ ] Message Acknowledgment (AUTO, MANUAL, NACK + requeue)
- [ ] Publisher Confirms (ConfirmCallback, ReturnCallback)
- [ ] Message Persistence (DeliveryMode + Durable Queue + Durable Exchange)

### Reliability
- [ ] Dead Letter Queues (x-dead-letter-exchange, x-dead-letter-routing-key)
- [ ] Quorum Queues (Raft, delivery-limit, vs Classic Mirrowed)
- [ ] Idempotent Consumer (message ID + dedup table)
- [ ] Outbox Pattern (DB + message trong cùng transaction)

### Architecture
- [ ] Work Queue vs Pub/Sub vs RPC patterns
- [ ] Saga Pattern (Choreography vs Orchestrator)
- [ ] Retry với Exponential Backoff (delay queues)
- [ ] Event Sourcing / CQRS qua RabbitMQ

### Production
- [ ] Clustering (Quorum, pause_minority, peer discovery)
- [ ] Network Partitions (split-brain, handling strategies)
- [ ] Performance Tuning (prefetch, batch confirm, channel cache)
- [ ] Memory & Disk Management (watermarks, alarms)
- [ ] Monitoring (Prometheus metrics, alerting rules)
- [ ] Kubernetes (RabbitMQ Cluster Operator, SSD, resource limits)

## 📖 Tài liệu tham khảo

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [AMQP Specification](https://www.rabbitmq.com/amqp-0-9-1-reference.html)
- [Spring AMQP Documentation](https://spring.io/projects/spring-amqp)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [RabbitMQ Cluster Operator](https://www.rabbitmq.com/kubernetes/operator/quickstart-operator)

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc pull request.

---

**Chúc bạn thành công trong các cuộc phỏng vấn! 🎉**
