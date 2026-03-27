# AWS Interview & Checklist — Chi Tiết

## Master Interview Checklist

### Compute
- [ ] EC2: instance families (t3, m5, c5, r5, g4), pricing (On-Demand, Reserved, Spot, Savings Plans)
- [ ] EC2 Auto Scaling: target tracking, step scaling, scheduled, predictive
- [ ] Lambda: triggers (API GW, S3, SQS, DynamoDB Streams), limits (15 min, 10GB RAM), cold start solutions
- [ ] Lambda: SnapStart (Java), Provisioned Concurrency, ARM Graviton2
- [ ] ECS: Task Definition, Service, Fargate vs EC2, deployment strategies (rolling, blue/green)
- [ ] EKS: cluster, nodes (managed, Fargate, self-managed), IRSA, ALB Ingress, HPA

### Storage & Database
- [ ] S3: storage classes (Standard, IA, Glacier, Deep Archive, Intelligent-Tiering), lifecycle policies
- [ ] S3: pre-signed URLs, event notifications, cross-region replication, versioning
- [ ] RDS: Multi-AZ vs read replicas, Aurora (5x MySQL, Global Database, Serverless v2)
- [ ] DynamoDB: partition key, sort key, GSI/LSI, single-table design, capacity modes, DAX, Streams
- [ ] ElastiCache: Redis vs Memcached, cluster mode, replication, use cases

### Networking
- [ ] VPC: CIDR, public/private subnets, Internet Gateway, NAT Gateway
- [ ] Security Groups (stateful) vs NACLs (stateless)
- [ ] ALB vs NLB vs GLB: L7/L4, routing, use cases
- [ ] Route 53: routing policies (simple, weighted, latency, failover, geolocation), health checks
- [ ] VPC Endpoints: Gateway (S3, DynamoDB) vs Interface, cost savings

### Messaging & Integration
- [ ] SQS: Standard vs FIFO, DLQ, visibility timeout, long polling, batch
- [ ] SNS: pub/sub, fan-out, SNS→SQS pattern
- [ ] EventBridge: event bus, rules, content-based routing, schema registry
- [ ] Step Functions: workflow orchestration, Standard vs Express
- [ ] API Gateway: REST vs HTTP API, authorizers, throttling, stages

### Security
- [ ] IAM: users/groups/roles/policies, least privilege, conditions, cross-account
- [ ] IAM: IRSA (EKS), instance profiles (EC2), execution roles (Lambda/ECS)
- [ ] KMS: encryption at rest, envelope encryption, key types
- [ ] Secrets Manager: auto-rotation, vs Parameter Store
- [ ] WAF: rules, rate limiting, IP blocking, SQL injection/XSS protection
- [ ] CloudTrail: audit log, multi-region, S3 storage

### Architecture
- [ ] 3-tier web, serverless, event-driven patterns
- [ ] Multi-AZ vs Multi-Region (DR strategies: backup/restore, pilot light, warm standby, active-active)
- [ ] Well-Architected: 6 pillars
- [ ] Microservices: service mesh (App Mesh), service discovery (Cloud Map)

### Cost
- [ ] Reserved vs Savings Plans vs Spot
- [ ] VPC Endpoints giảm NAT cost
- [ ] S3 Lifecycle, right-sizing, Graviton (ARM)
- [ ] Cost Explorer, Budgets, cost allocation tags

### Observability
- [ ] CloudWatch: metrics, logs, alarms, dashboards
- [ ] X-Ray: distributed tracing, service map
- [ ] Container Insights / Lambda Insights

---

## Top 20 Câu Hỏi Phỏng Vấn

### Compute

**Q1: EC2 On-Demand vs Reserved vs Spot?**
> On-Demand: linh hoạt, trả theo giờ, đắt nhất → dev/test, spike. Reserved: cam kết 1-3 năm, giảm 40-72% → production steady-state. Spot: dùng capacity dư, giảm 60-90%, bị thu hồi 2 phút warning → batch, stateless workers, CI/CD.

**Q2: Lambda cold start giải quyết thế nào?**
> (1) Provisioned Concurrency: pre-warm N instances (tốn $), (2) SnapStart (Java 11/17/21): snapshot init phase → restore ~200ms, (3) Giảm package size, (4) Runtime nhanh (Node.js/Python < Java), (5) ARM Graviton2: nhanh 19%, rẻ 20%.

**Q3: ECS vs EKS?**
> ECS: simpler, AWS-native, free control plane, tốt cho team nhỏ AWS-only. EKS: standard K8s, portable multi-cloud, rich ecosystem (Helm, Istio, ArgoCD), tốt cho team có K8s experience. Cả hai đều support Fargate.

**Q4: Fargate vs EC2 nodes?**
> Fargate: serverless, no node management, pay per task, tốt cho microservices. EC2: cần GPU, DaemonSets, host-level access, cost-effective khi traffic ổn định (Reserved). Fargate Spot: 70% cheaper cho non-critical tasks.

### Storage & Database

**Q5: S3 storage classes nào, khi nào dùng?**
> Standard: frequently accessed. Standard-IA: < 1 lần/tháng truy cập, backup. Glacier Instant: archive cần ms retrieval. Glacier Flexible: 1-12h retrieval. Deep Archive: compliance giữ 7-10 năm, 12-48h retrieval. Intelligent-Tiering: không biết access pattern → AWS tự chuyển.

**Q6: RDS Multi-AZ vs Read Replica?**
> Multi-AZ: HA — standby ở AZ khác, synchronous replication, automatic failover < 60s. Dùng cho production. Read Replica: scale reads — async replication, có thể cross-region. Dùng cho read-heavy workloads, reporting.

**Q7: DynamoDB partition key design?**
> Partition key phải phân phối data đều (avoid hot partition). Bad: date (mọi write cùng partition). Good: userId, orderId. High-cardinality key. Composite key pattern: PK = "USER#123", SK = "ORDER#456" (single-table design).

**Q8: Aurora vs RDS standard?**
> Aurora: 5x throughput MySQL, 3x PostgreSQL. 6 copies data across 3 AZs. Failover < 30s (vs RDS 60-120s). Auto-scale storage 10GB→128TB. Global Database (cross-region < 1s lag). Serverless v2 (scale 0.5→256 ACU). Đắt hơn ~20% nhưng performance + HA tốt hơn nhiều.

### Networking

**Q9: Security Group vs NACL?**
> SG: instance-level, **stateful** (return traffic auto allowed), allow-only rules. NACL: subnet-level, **stateless** (phải define inbound + outbound), allow + deny, evaluated by rule number. Best practice: SG là primary firewall, NACL là backup layer.

**Q10: VPC Endpoint tại sao quan trọng?**
> Không có VPC Endpoint: private subnet → NAT Gateway → Internet → S3. Tốn $0.045/GB NAT cost. Có Gateway Endpoint: private → VPC Endpoint → S3 (FREE). Savings: app xử lý 1TB data/tháng = tiết kiệm $45/tháng chỉ riêng NAT.

### Messaging

**Q11: SQS vs Kafka (MSK)?**
> SQS: managed, auto-scale, simple queue, at-least-once (Standard) / exactly-once (FIFO). Tốt cho task queue, async processing. Kafka (MSK): event streaming, replay (retention), high throughput, multiple consumer groups, event sourcing. Tốt cho real-time analytics, CDC, event-driven architecture.

**Q12: SNS → SQS pattern tại sao phổ biến?**
> Fan-out: 1 event → nhiều consumers qua dedicated SQS queues. Mỗi queue có retry, DLQ, buffering riêng. SNS → Lambda trực tiếp: không có retry/buffer → có thể mất message khi Lambda fail. SNS → SQS → Lambda: message bền vững, retry tự động, DLQ cho failed messages.

**Q13: EventBridge vs SNS?**
> SNS: simple pub/sub, filter by attributes. EventBridge: **content-based routing** (filter on any field in event body), schema registry, archive & replay, cross-account, SaaS integrations (Stripe, Twilio). EventBridge cho complex event routing; SNS cho simple fan-out.

### Security

**Q14: Secrets Manager vs Parameter Store?**
> Secrets Manager: $0.40/secret/tháng, auto-rotation (Lambda rotates DB passwords), cross-account access. Parameter Store: free (standard), manual rotation, config values. Rule: database passwords/API keys → Secrets Manager. Config values/feature flags → Parameter Store.

**Q15: Encryption at rest vs in transit?**
> At rest: data stored trên disk encrypted (S3 SSE, RDS KMS, EBS encryption, DynamoDB). In transit: data moving between services encrypted (TLS/SSL — HTTPS, mTLS). AWS: hầu hết services encrypt at rest by default. In transit: ACM certificates cho ALB/CloudFront, mTLS cho service-to-service.

### Architecture

**Q16: Multi-AZ vs Multi-Region?**
> Multi-AZ: HA trong 1 region. RDS standby ở AZ khác, ECS tasks distributed across AZs. Failover: ms-seconds. Cost: ~minimal thêm. Đủ cho hầu hết apps. Multi-Region: global users, compliance (data residency), disaster recovery cross-region. RPO: seconds-minutes. Cost: ~100% thêm. Phức tạp: data consistency, conflict resolution.

**Q17: Design high-availability system trên AWS?**
> (1) Multi-AZ: RDS Multi-AZ, ECS across 3 AZs, ElastiCache Multi-AZ. (2) Auto Scaling: ECS/EC2 ASG scale theo CPU/request count. (3) ALB: health checks loại unhealthy instances. (4) Route 53: failover routing + health checks. (5) S3: 11 nines durability cho static assets. (6) CloudFront: edge caching giảm origin load. (7) SQS: buffer traffic spikes, DLQ cho failed messages.

**Q18: Serverless vs Container?**
> Serverless (Lambda): no infra management, auto-scale to 0, pay per request. Tốt cho event-driven, API < 15 phút, < 10GB RAM. Container (ECS/EKS): full control, long-running, stateful, larger workloads. Tốt cho microservices, legacy migration, GPU. Hybrid: Lambda cho event processing, ECS cho core API.

### Cost

**Q19: Optimize AWS cost thế nào?**
> (1) Right-sizing: CloudWatch CPU/memory → downsize over-provisioned. (2) Reserved/Savings Plans cho steady-state. (3) Spot cho stateless workers. (4) VPC Endpoints thay NAT Gateway. (5) S3 Lifecycle → Glacier. (6) Graviton (ARM) → 20% cheaper. (7) Cost allocation tags → track per team/project. (8) Budget alerts.

**Q20: Estimate cost cho new project?**
> AWS Pricing Calculator → estimate mỗi service. Rule of thumb cho medium app: RDS chiếm 40-50% cost, compute 20-30%, networking 10-15%, storage 5-10%. Start với On-Demand → monitor 1-3 tháng → buy Reserved cho steady-state. Start Fargate On-Demand → chuyển Fargate Spot cho non-critical.

---

## System Design trên AWS — Template

```
Bài: "Design URL shortener (bit.ly) trên AWS"

Requirements:
  - 100M URLs/tháng created
  - 10B redirects/tháng
  - < 10ms redirect latency
  - 99.99% availability

Architecture:
  CloudFront → API Gateway → Lambda (create)
                            → Lambda (redirect) → DynamoDB
  
  DynamoDB:
    PK: shortCode (e.g., "abc123")
    Attributes: originalUrl, createdAt, userId, clickCount
    
  DAX (cache) trước DynamoDB:
    → Redirect lookup: microsecond latency
    
  CloudFront cache:
    → Popular URLs cached at edge → 0ms latency
    
  Analytics:
    DynamoDB Streams → Kinesis → S3 → Athena (query analytics)

Cost estimate (10B redirects):
  Lambda:   10B × $0.0000002 = $2,000
  DynamoDB: On-Demand → ~$5,000 (RCU heavy)
  DAX:      3 nodes → $1,000
  CloudFront: cache hit 80% → giảm Lambda/DynamoDB cost 80%
  Total:    ~$2,000-3,000/tháng (với caching)
```

**Quay lại:** [README.md](./README.md)
