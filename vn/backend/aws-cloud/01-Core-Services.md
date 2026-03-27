# AWS Core Services

## Compute

### EC2 (Elastic Compute Cloud)
```
Virtual machines on demand.
Instance types:
  t3.micro  — 2 vCPU, 1GB RAM (dev, small apps)
  m5.large  — 2 vCPU, 8GB RAM (general purpose)
  c5.2xlarge — 8 vCPU, 16GB RAM (CPU-intensive)
  r5.xlarge  — 4 vCPU, 32GB RAM (memory-intensive)

Pricing:
  On-Demand: trả theo giờ
  Reserved:  cam kết 1-3 năm, giảm 40-70%
  Spot:      bid price, giảm đến 90%, có thể bị thu hồi
```

### Lambda (Serverless)
```
Chạy code không cần server.
  - Triggers: API Gateway, S3, SQS, DynamoDB Stream, CloudWatch
  - Runtime: Java, Node.js, Python, Go, .NET
  - Limits: 15 phút max, 10GB RAM, 512MB /tmp
  - Pricing: trả theo invocation + duration

Use case: API endpoints, event processing, scheduled jobs
NOT for: long-running tasks, stateful apps
```

## Storage

### S3 (Simple Storage Service)
```
Object storage — unlimited, durable (99.999999999% — 11 nines).

Storage classes:
  Standard     — frequently accessed
  IA           — infrequently accessed (cheaper, retrieval cost)
  Glacier      — archive (minutes to hours retrieval)
  
Features:
  - Versioning, lifecycle policies
  - Static website hosting
  - Pre-signed URLs (temporary access)
  - Event notifications (S3 → Lambda/SQS)
```

## Database

### RDS (Relational Database Service)
```
Managed DB: PostgreSQL, MySQL, Oracle, SQL Server
  - Auto backup, multi-AZ (HA), read replicas
  - Point-in-time recovery
  - Auto scaling storage

Aurora:
  - MySQL/PostgreSQL compatible
  - 5x faster than MySQL, 3x faster than PostgreSQL
  - Auto-scaling up to 128TB
  - Multi-region (Global Database)
```

### DynamoDB
```
NoSQL, key-value + document. Serverless, auto-scale.
  - Single-digit ms latency at any scale
  - DAX (in-memory cache) for microsecond reads
  - Streams (CDC) → Lambda/Kinesis

Use case: session store, user profiles, IoT, gaming leaderboard
NOT for: complex queries, JOINs, transactions across tables
```

## Networking

### VPC (Virtual Private Cloud)
```
Private network trong AWS.
  - Subnets: public (internet-facing) + private (internal)
  - Security Groups: instance-level firewall
  - NACLs: subnet-level firewall
  - NAT Gateway: private subnets → internet (outbound)

Best practice:
  - Web servers: public subnet
  - App servers: private subnet
  - Databases: private subnet (no internet)
```

## Messaging

### SQS (Simple Queue Service)
```
Managed message queue.
  Standard: unlimited throughput, at-least-once, best-effort ordering
  FIFO: 300 TPS (batch: 3000), exactly-once, strict ordering

Use case: async processing, decouple services, buffer traffic
```

### SNS (Simple Notification Service)
```
Pub/Sub messaging.
  - Topics → subscribers (SQS, Lambda, email, SMS, HTTP)
  - Fan-out: 1 message → many consumers

Pattern: SNS → SQS (fan-out + queue durability)
```

## CDN

### CloudFront
```
Global CDN — cache content at edge locations.
  - Static files (S3), APIs (ALB, API Gateway)
  - Lambda@Edge: run code at edge
  - 450+ edge locations globally
```
