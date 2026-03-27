# AWS Architecture Patterns

## 3-Tier Web Application

```
                    ┌──────────────┐
                    │ CloudFront   │  CDN
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │     ALB      │  Application Load Balancer
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴───┐ ┌─────┴─────┐
        │ EC2/ECS   │ │ EC2   │ │ EC2/ECS   │  Auto Scaling Group
        │ (App)     │ │ (App) │ │ (App)     │  (Private Subnet)
        └─────┬─────┘ └───┬───┘ └─────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────┴───────┐
                    │ RDS Aurora   │  (Multi-AZ, Private Subnet)
                    │ + ElastiCache│
                    └──────────────┘
```

## Serverless Architecture

```
API Gateway → Lambda → DynamoDB
           → Lambda → S3
           → Lambda → SQS → Lambda → RDS

Benefits: no servers, auto-scale, pay-per-use
Limits: cold start (Java 1-5s), 15 min timeout
```

## Event-Driven Architecture

```
Producer → SNS Topic → SQS Queue 1 → Consumer A (Lambda/ECS)
                     → SQS Queue 2 → Consumer B
                     → SQS Queue 3 → Consumer C

Or: Producer → EventBridge → Rule → Target (Lambda, SQS, Step Functions)
```

## Multi-Region Active-Active

```
Route 53 (GeoDNS)
  ├── Region: ap-southeast-1 (Singapore)
  │   ├── CloudFront → ALB → ECS → Aurora (Primary)
  │   └── ElastiCache, S3
  │
  └── Region: us-east-1 (Virginia)
      ├── CloudFront → ALB → ECS → Aurora (Read Replica / Global DB)
      └── ElastiCache, S3

DynamoDB Global Tables: auto-replicate across regions
S3 Cross-Region Replication
```
