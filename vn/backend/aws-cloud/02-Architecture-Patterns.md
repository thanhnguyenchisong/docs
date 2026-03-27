# AWS Architecture Patterns — Chi Tiết

## 3-Tier Web Application

> Pattern phổ biến nhất — Presentation → Application → Data.

```
                          Internet
                             │
                     ┌───────┴────────┐
                     │  CloudFront    │  CDN — cache static assets, WAF
                     └───────┬────────┘
                             │
                     ┌───────┴────────┐
                     │ Route 53       │  DNS — health check, failover
                     └───────┬────────┘
                             │
                     ┌───────┴────────┐
                     │      ALB       │  L7 Load Balancer (public subnet)
                     │ /api/* → ECS   │  Path-based routing
                     │ /*     → S3    │
                     └───────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
        │  ECS/EC2  │ │  ECS/EC2  │ │  ECS/EC2  │  Auto Scaling Group
        │  (App)    │ │  (App)    │ │  (App)    │  Private Subnet
        │  AZ-a     │ │  AZ-b    │ │  AZ-c     │  Min:2, Max:20
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
        │ RDS Aurora │ │ElastiCache│ │    S3     │  Private Subnet
        │ Primary   │ │ Redis     │ │ Assets    │  NO internet access
        │ + Standby │ │ Cluster   │ │ Uploads   │
        └───────────┘ └───────────┘ └───────────┘
```

### Chi tiết từng layer

| Layer | Service | Vai trò | Subnet |
|-------|---------|---------|--------|
| **CDN** | CloudFront | Cache static, WAF, DDoS protection | Edge |
| **DNS** | Route 53 | Domain → ALB, health check | Global |
| **Load Balancer** | ALB | Distribute traffic, SSL termination | Public |
| **Application** | ECS Fargate / EC2 ASG | Business logic, APIs | Private |
| **Cache** | ElastiCache Redis | Session, query cache, rate limit | Private |
| **Database** | RDS Aurora Multi-AZ | Primary storage, automatic failover | Private |
| **Storage** | S3 | File uploads, static assets, backups | N/A |
| **Monitoring** | CloudWatch + X-Ray | Metrics, logs, tracing | N/A |

### Spring Boot on ECS — Production Config

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://${RDS_ENDPOINT}:5432/${DB_NAME}
    username: ${DB_USERNAME}              # Từ Secrets Manager
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  data:
    redis:
      host: ${REDIS_ENDPOINT}            # ElastiCache endpoint
      port: 6379
      ssl:
        enabled: true

# ECS Task Definition
{
  "containerDefinitions": [{
    "name": "my-app",
    "image": "123456789.dkr.ecr.ap-southeast-1.amazonaws.com/my-app:v2.1",
    "cpu": 512,
    "memory": 1024,
    "portMappings": [{ "containerPort": 8080 }],
    "secrets": [
      { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:...:db-password" },
      { "name": "DB_USERNAME", "valueFrom": "arn:aws:secretsmanager:...:db-username" }
    ],
    "environment": [
      { "name": "SPRING_PROFILES_ACTIVE", "value": "prod" },
      { "name": "RDS_ENDPOINT", "value": "mydb.cluster-xxx.ap-southeast-1.rds.amazonaws.com" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/my-app",
        "awslogs-region": "ap-southeast-1"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"],
      "interval": 30,
      "retries": 3
    }
  }]
}
```

---

## Serverless Architecture

> Không quản lý server. Auto-scale. Pay per request.

```
                     ┌──────────────┐
     Client ────────→│ API Gateway  │  REST / HTTP API / WebSocket
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────┴─────┐ ┌────┴────┐ ┌─────┴─────┐
        │  Lambda   │ │ Lambda  │ │  Lambda   │
        │ GET /users│ │POST /ord│ │GET /search│
        └─────┬─────┘ └────┬────┘ └─────┬─────┘
              │             │             │
              ▼             ▼             ▼
         DynamoDB     SQS → Lambda   ElasticSearch
                           ↓
                      DynamoDB + SNS (notify)
```

### API Gateway — Chi tiết

```
REST API vs HTTP API:
  REST API:  Full features (caching, API keys, WAF, usage plans)
             → Public APIs, monetized APIs
  HTTP API:  Cheaper (70% less), faster, simpler
             → Internal APIs, microservices, Lambda proxy
  
Authorizers:
  Lambda Authorizer:  Custom auth logic (JWT, API key, etc.)
  Cognito Authorizer: AWS Cognito User Pool integration
  IAM:                AWS IAM roles/policies (service-to-service)

Rate Limiting:
  10,000 RPS per region (default, có thể tăng)
  Throttling per API key: Usage Plans + API Keys

Stages: dev → staging → prod (mỗi stage config riêng)
```

### Serverless Cost Calculation

```
Ví dụ: 10 triệu requests/tháng, mỗi request 200ms, 256MB memory

Lambda:
  10M requests × $0.0000002  = $2.00
  10M × 200ms × 256MB / 1024 = 500,000 GB-seconds
  500,000 × $0.0000166667   = $8.33
  Total: ~$10/tháng

vs EC2 t3.medium (2 vCPU, 4GB):
  On-Demand: $0.0416/h × 730h = $30.37/tháng
  + ALB: $16.20 + Reserved: ~$22

→ Serverless rẻ hơn khi traffic < 50M requests/tháng
→ EC2 rẻ hơn khi traffic cao và constant
```

---

## Event-Driven Architecture

```
                    ┌──────────────┐
   Order Service ──→│  EventBridge │
                    │  Event Bus   │
                    └──────┬───────┘
                           │
              Rules:       │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────┴───┐  ┌────┴────┐  ┌───┴─────────┐
     │ SQS Queue  │  │  Lambda │  │ SQS Queue   │
     │ → Payment  │  │ Send    │  │ → Inventory  │
     │   Service  │  │ Email   │  │   Service    │
     └────────────┘  └─────────┘  └──────────────┘

Patterns:
  Fan-out:        1 event → nhiều consumers
  Choreography:   Services react to events (no central orchestrator)
  Saga:           Distributed transaction qua events

Event Contract:
{
  "source": "order-service",
  "detail-type": "OrderCreated",
  "detail": {
    "orderId": "ORD-123",
    "userId": "USR-456",
    "total": 1500000,
    "items": [...]
  }
}
```

### SNS + SQS Fan-out Pattern (Production)

```
                    ┌──────────────┐
   Producer ──────→ │  SNS Topic   │
                    │ "order-events"│
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────┴───┐  ┌────┴────┐  ┌───┴─────────┐
     │ SQS: email │  │SQS: inv.│  │SQS: analytics│
     │            │  │         │  │              │
     │ → Lambda   │  │ → ECS   │  │ → Kinesis    │
     │ Send Email │  │ Update  │  │ → S3         │
     └────────────┘  │ Stock   │  │ → Athena     │
                     └─────────┘  └──────────────┘

Tại sao SNS → SQS (không SNS → Lambda trực tiếp)?
  - SQS có retry: message failed → retry, DLQ
  - SQS có buffering: spike traffic không mất message
  - SQS có visibility timeout: consumer xử lý xong mới delete
  - Lambda từ SQS: batch processing, tự scale theo queue depth
```

---

## Multi-Region Architecture

### Active-Passive (DR)

```
Route 53 (Failover routing)
  │
  ├── Primary: ap-southeast-1 (Singapore) ← Active
  │   ├── ALB → ECS → Aurora Primary
  │   └── ElastiCache, S3
  │
  └── Secondary: ap-northeast-1 (Tokyo) ← Standby
      ├── ALB → ECS (scaled down) → Aurora Read Replica
      └── ElastiCache, S3 (cross-region replication)

RPO: minutes (async replication lag)
RTO: minutes (promote Aurora, scale ECS, DNS failover)
Cost: ~40% thêm (standby resources)
```

### Active-Active (Global)

```
Route 53 (Latency-based routing)
  │
  ├── ap-southeast-1 (Singapore) ← Serve Asia users
  │   ├── CloudFront → ALB → ECS → Aurora Global DB (Primary)
  │   ├── DynamoDB Global Table
  │   └── ElastiCache Redis
  │
  └── us-east-1 (Virginia) ← Serve US/EU users
      ├── CloudFront → ALB → ECS → Aurora Global DB (Secondary)
      ├── DynamoDB Global Table
      └── ElastiCache Redis

RPO: ~1 giây (Aurora Global DB)
RTO: < 1 phút (promote secondary)
Cost: ~100% thêm (full infrastructure x2)

Challenges:
  - Data consistency (eventual consistency across regions)
  - Conflict resolution (last-writer-wins vs merge)
  - Session management (sticky sessions or global session store)
```

### Disaster Recovery Strategies

| Strategy | RTO | RPO | Cost | Mô tả |
|---------|-----|-----|------|-------|
| **Backup & Restore** | Giờ | Giờ | $ | S3 backup, restore khi cần |
| **Pilot Light** | 10-30 phút | Phút | $$ | DB replicated, compute tắt → bật khi DR |
| **Warm Standby** | Phút | Giây | $$$ | Scaled-down copy chạy sẵn |
| **Active-Active** | ~0 | ~0 | $$$$ | Full copy cả 2 regions |

---

## Microservices trên AWS

```
                         ┌──────────────┐
       Client ──────────→│ API Gateway  │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────┴─────┐ ┌──┴──┐ ┌─────┴─────┐
              │ User Svc  │ │Order│ │Product Svc│
              │ (ECS)     │ │Svc  │ │ (ECS)     │
              └─────┬─────┘ │(ECS)│ └─────┬─────┘
                    │       └──┬──┘       │
                    │          │           │
              ┌─────┴───┐  ┌──┴──┐  ┌────┴────┐
              │ Aurora  │  │Dynamo│  │ Aurora  │   ← Database per service
              │ (User)  │  │DB    │  │(Product)│
              └─────────┘  └──┬──┘  └─────────┘
                              │
                         ┌────┴────┐
                         │EventBr. │  Cross-service communication
                         │ / SQS   │  via events (not HTTP)
                         └─────────┘

Service mesh: AWS App Mesh (Envoy sidecar) for:
  - Service discovery (Cloud Map)
  - Load balancing, retries, circuit breaker
  - mTLS between services
  - Observability (X-Ray integration)
```

**Quay lại:** [README.md](./README.md)
