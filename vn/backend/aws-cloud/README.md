# AWS & Cloud Services — Chi Tiết

> Tài liệu AWS toàn diện cho backend developer: từ core services đến production architecture, security, cost optimization — kiến thức đám mây cho master dev.

## 📋 Mục Lục

| # | File | Nội dung | Lines |
|---|------|----------|-------|
| 01 | [Core Services](./01-Core-Services.md) | EC2 (instances, pricing, ASG), Lambda (triggers, cold start, SAM), S3 (classes, lifecycle, pre-signed), RDS/Aurora, DynamoDB (design, DAX, Streams), ElastiCache, VPC, SQS/SNS/EventBridge, CloudFront, CloudWatch/X-Ray | ~350 |
| 02 | [Architecture Patterns](./02-Architecture-Patterns.md) | 3-tier (ECS + Aurora + Redis), Serverless (API GW + Lambda + DynamoDB), Event-Driven (SNS→SQS fan-out, EventBridge), Multi-Region (Active-Passive, Active-Active, DR strategies), Microservices trên AWS | ~250 |
| 03 | [EKS & Container](./03-EKS-Container.md) | ECS vs EKS, ECS Task Definition + Service + Auto Scaling + Blue/Green, EKS manifests (Deployment, Service, Ingress, HPA), IRSA, ECR security, Fargate vs EC2, CI/CD (GitHub Actions → ECR → ECS, GitOps ArgoCD) | ~300 |
| 04 | [Security & Cost](./04-Security-Cost.md) | IAM deep dive (12 best practices, policy examples, cross-account), Secrets Manager vs Parameter Store, KMS encryption, Cost breakdown example, 9 optimization strategies, VPC Endpoints, Well-Architected 6 pillars | ~280 |
| 05 | [Interview & Checklist](./05-Interview-Checklist.md) | Master checklist (7 categories), Top 20 câu hỏi phỏng vấn chi tiết, System Design template trên AWS | ~200 |

## Lộ Trình Đọc

```
Bắt đầu:  01-Core-Services     ← Hiểu từng service
    ↓
Kiến trúc: 02-Architecture      ← Ghép services thành system
    ↓
Container: 03-EKS-Container     ← Deploy lên production
    ↓
Security:  04-Security-Cost     ← Bảo mật + tối ưu chi phí
    ↓
Interview: 05-Interview         ← Ôn thi, system design
```
