# AWS Interview & Checklist

## Checklist

### Compute
- [ ] EC2: instance types, pricing (On-Demand, Reserved, Spot)
- [ ] Lambda: triggers, limits (15 min, cold start), use cases
- [ ] ECS/EKS: container orchestration, Fargate vs EC2

### Storage & DB
- [ ] S3: storage classes, lifecycle, pre-signed URLs
- [ ] RDS: Multi-AZ, read replicas, Aurora
- [ ] DynamoDB: partition key, sort key, GSI, streams

### Networking
- [ ] VPC: public/private subnets, Security Groups, NACLs
- [ ] ALB vs NLB: L7 vs L4, routing
- [ ] Route 53: DNS, health checks, routing policies

### Messaging
- [ ] SQS: Standard vs FIFO, dead-letter queue
- [ ] SNS: pub/sub, fan-out pattern
- [ ] EventBridge: event-driven, rules, targets

### Security
- [ ] IAM: users, roles, policies, least privilege
- [ ] Secrets Manager / Parameter Store
- [ ] KMS: encryption at rest

### Architecture
- [ ] 3-tier, serverless, event-driven patterns
- [ ] Multi-AZ vs Multi-Region
- [ ] Well-Architected: 5 pillars

## Top Câu Hỏi

**Q: SQS vs Kafka?**
> SQS: managed, auto-scale, simple queue. Kafka: self-managed (hoặc MSK), replay, high throughput, event streaming. SQS cho simple async. Kafka cho event-driven architecture, log processing.

**Q: Lambda cold start giải quyết thế nào?**
> (1) Provisioned concurrency (pre-warm), (2) Smaller deployment package, (3) SnapStart (Java), (4) Choose faster runtime (Node.js, Python < Java).

**Q: Multi-AZ vs Multi-Region?**
> Multi-AZ: HA trong 1 region (failover ms-seconds). Multi-Region: disaster recovery, <100ms latency globally, phức tạp hơn, đắt hơn. Hầu hết apps: Multi-AZ đủ.

**Quay lại:** [README.md](./README.md)
