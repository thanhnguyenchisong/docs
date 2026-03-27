# AWS Core Services — Chi Tiết

## Compute

### EC2 (Elastic Compute Cloud)

> Virtual machines on demand — nền tảng compute đầu tiên và quan trọng nhất của AWS.

#### Instance Families

| Family | Tối ưu cho | Ví dụ instance | Use case |
|--------|-----------|---------------|----------|
| **t3/t4g** | General (burstable) | t3.micro, t3.medium | Dev/test, small apps, microservices |
| **m5/m6i** | General (fixed) | m5.large, m6i.xlarge | Web servers, app servers, backend APIs |
| **c5/c6i** | CPU-intensive | c5.2xlarge | Batch processing, ML inference, video encoding |
| **r5/r6i** | Memory-intensive | r5.xlarge (32GB RAM) | In-memory caching, real-time analytics |
| **i3/i4i** | Storage-intensive | i3.xlarge | Databases, data warehousing |
| **g4/p4** | GPU | p4d.24xlarge | ML training, graphics rendering |
| **t4g/m6g** | ARM (Graviton) | t4g.medium | **20% rẻ hơn** x86, same performance |

#### Pricing Models

```
On-Demand:    Trả theo giờ/giây. Linh hoạt, không cam kết.
              → Dev/test, spike traffic, short-term workloads

Reserved:     Cam kết 1-3 năm. Giảm 40-72%.
              → Production steady-state (web servers, databases)
              → 3 loại: No Upfront, Partial Upfront, All Upfront

Savings Plans: Cam kết $/giờ (linh hoạt hơn Reserved).
              → Có thể thay đổi instance type/region
              → Compute Savings Plan: áp dụng EC2 + Fargate + Lambda

Spot:         Bid trên capacity dư. Giảm 60-90%.
              → ⚠️ Có thể bị thu hồi (2 phút warning)
              → Batch jobs, CI/CD, data processing, stateless workers

Dedicated:    Physical server riêng. Compliance (HIPAA, licensing).
              → Enterprise, regulated industries
```

#### EC2 Best Practices

```
1. Security Group: mở CHỈ ports cần (22, 80, 443), CHỈ từ IP/CIDR cần
2. Key pair: dùng ED25519, KHÔNG chia sẻ private key
3. AMI: tạo Golden AMI (pre-baked) → launch nhanh, consistent
4. User Data: bootstrap script chạy lúc launch (install, config)
5. Instance Profile: gán IAM Role → EC2 có quyền truy cập AWS services
                     KHÔNG dùng access key trên EC2!
6. EBS: gp3 (default), io2 (high IOPS cho DB), encrypted
7. Placement Group: cluster (low latency), spread (HA)
```

#### Auto Scaling Group (ASG)

```
                   ┌─── CloudWatch Alarm ───┐
                   │  CPU > 70% → Scale OUT │
                   │  CPU < 30% → Scale IN  │
                   └────────┬───────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
         │  EC2-1  │  │  EC2-2  │  │  EC2-3  │  ← Auto Scaling Group
         │ (AZ-a)  │  │ (AZ-b)  │  │ (AZ-c)  │     Min:2, Max:10, Desired:3
         └─────────┘  └─────────┘  └─────────┘

Scaling Policies:
  Target Tracking: "Giữ CPU trung bình 60%"    ← Khuyến khích
  Step Scaling:    "CPU > 70% → +2, > 90% → +4"
  Scheduled:       "Mỗi tối 22h scale về 2"
  Predictive:      ML dự đoán traffic → scale trước
```

---

### Lambda (Serverless)

> Chạy code mà KHÔNG cần quản lý server. Pay per invocation.

#### Configuration & Limits

| Parameter | Giá trị |
|-----------|---------|
| **Max memory** | 128MB – 10,240MB (10GB) |
| **Max timeout** | 15 phút |
| **Max package size** | 50MB (zip), 250MB (unzipped), 10GB (container image) |
| **Tmp storage** | 512MB – 10GB (`/tmp`) |
| **Concurrent executions** | 1,000 (default, có thể tăng) |
| **Environment variables** | 4KB total |

#### Triggers & Integrations

```
Synchronous:
  API Gateway → Lambda → Response (REST API, WebSocket)
  ALB → Lambda → Response
  CloudFront (Lambda@Edge)

Asynchronous:
  S3 Event (object created) → Lambda
  SNS → Lambda
  EventBridge → Lambda
  CloudWatch Events (cron) → Lambda

Stream-based:
  DynamoDB Streams → Lambda (process changes)
  Kinesis Data Streams → Lambda (real-time processing)
  SQS → Lambda (queue processing)
```

#### Cold Start & Performance

```
Cold Start (thời gian khởi tạo lần đầu):
  Node.js/Python: 100-500ms     ← Nhanh nhất
  Java:           1-5 giây      ← Chậm nhất
  .NET:           500ms-2s

Giải pháp Cold Start:
  1. Provisioned Concurrency: pre-warm N instances (tốn tiền)
  2. SnapStart (Java only): snapshot sau init → restore nhanh (~200ms)
  3. Giảm package size: Chỉ include dependencies cần thiết
  4. Chọn runtime nhanh: Node.js / Python cho latency-sensitive
  5. ARM (Graviton2): nhanh hơn 19%, rẻ hơn 20%
```

#### Lambda Code Example (Java / Spring Cloud Function)

```java
// Handler style
public class OrderHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    
    private final OrderService orderService;
    
    public OrderHandler() {
        // Cold start: khởi tạo dependencies
        this.orderService = new OrderService(new DynamoDbClient());
    }
    
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
        var orderId = event.getPathParameters().get("id");
        var order = orderService.findById(orderId);
        
        return new APIGatewayProxyResponseEvent()
            .withStatusCode(200)
            .withBody(new Gson().toJson(order));
    }
}
```

```yaml
# SAM template (Infrastructure as Code)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  OrderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: com.example.OrderHandler::handleRequest
      Runtime: java21
      MemorySize: 512
      Timeout: 30
      SnapStart:
        ApplyOn: PublishedVersions    # Java SnapStart
      Environment:
        Variables:
          TABLE_NAME: !Ref OrdersTable
      Events:
        GetOrder:
          Type: Api
          Properties:
            Path: /orders/{id}
            Method: get
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref OrdersTable
```

---

## Storage

### S3 (Simple Storage Service)

> Object storage vô hạn. Durability 99.999999999% (11 nines). Backbone của hầu hết kiến trúc AWS.

#### Storage Classes

| Class | Cost/GB/tháng | Retrieval | Use case |
|-------|-------------|-----------|---------|
| **S3 Standard** | $0.023 | Instant | Truy cập thường xuyên (static assets, logs gần) |
| **S3 Standard-IA** | $0.0125 | Instant (+ phí retrieval) | Backup, disaster recovery, dữ liệu truy cập < 1 lần/tháng |
| **S3 One Zone-IA** | $0.01 | Instant | Non-critical data, secondary backup |
| **S3 Glacier Instant** | $0.004 | Milliseconds | Archive cần truy cập nhanh (medical records) |
| **S3 Glacier Flexible** | $0.0036 | 1-12 giờ | Long-term archive |
| **S3 Glacier Deep Archive** | $0.00099 | 12-48 giờ | Compliance archive (giữ 7-10 năm) |
| **S3 Intelligent-Tiering** | Auto | Auto | Không biết access pattern → AWS tự chuyển tier |

#### Lifecycle Policy

```json
{
  "Rules": [{
    "ID": "ArchiveOldLogs",
    "Status": "Enabled",
    "Transitions": [
      { "Days": 30,  "StorageClass": "STANDARD_IA" },
      { "Days": 90,  "StorageClass": "GLACIER" },
      { "Days": 365, "StorageClass": "DEEP_ARCHIVE" }
    ],
    "Expiration": { "Days": 2555 }
  }]
}
```

#### Pre-signed URLs

```java
// Tạo URL upload/download tạm thời (không cần IAM credentials)
S3Presigner presigner = S3Presigner.create();

PresignedGetObjectRequest presignedUrl = presigner.presignGetObject(b -> b
    .signatureDuration(Duration.ofMinutes(15))   // URL hết hạn sau 15 phút
    .getObjectRequest(r -> r
        .bucket("my-bucket")
        .key("reports/q1-2026.pdf"))
);

String url = presignedUrl.url().toString();
// → https://my-bucket.s3.amazonaws.com/reports/q1-2026.pdf?X-Amz-Security...
// Client download qua URL này, không cần AWS credentials
```

#### S3 Event → Lambda (Tự động xử lý file upload)

```
User upload ảnh → S3 bucket → S3 Event Notification
                                    ↓
                              Lambda function
                                    ↓
                            Resize ảnh → S3 (thumbnails/)
                            Extract metadata → DynamoDB
                            Scan virus → SNS alert
```

---

## Database

### RDS (Relational Database Service)

| Feature | Mô tả |
|---------|--------|
| **Engines** | PostgreSQL, MySQL, MariaDB, Oracle, SQL Server |
| **Multi-AZ** | Standby replica ở AZ khác, automatic failover (< 60s) |
| **Read Replicas** | Tối đa 5 replicas, async replication, cross-region |
| **Backup** | Automated daily backup, point-in-time recovery (35 ngày) |
| **Storage** | gp3 (default), io2 (high IOPS), auto-scaling storage |
| **Encryption** | At rest (KMS), in transit (SSL/TLS) |

#### Aurora — Flagship Database

```
Aurora vs Standard RDS:
  - 5x throughput MySQL, 3x throughput PostgreSQL
  - Storage auto-scale 10GB → 128TB
  - 6 copies data across 3 AZs (self-healing storage)
  - Failover < 30 giây (vs RDS: 60-120s)
  - Aurora Serverless v2: auto-scale 0.5 → 256 ACU (Aurora Capacity Units)

Aurora Global Database:
  - Primary region: read/write
  - Secondary regions: read-only, < 1 giây replication lag
  - Promote secondary thành primary khi disaster (< 1 phút)
```

### DynamoDB — NoSQL Serverless

```
Table Design:
  Partition Key (PK): phân phối data đều → avoid hot partition
  Sort Key (SK):      range queries, hierarchical data
  
  Design pattern: Single-table design
    PK = "USER#123"     SK = "PROFILE"        → User info
    PK = "USER#123"     SK = "ORDER#456"      → User's order
    PK = "USER#123"     SK = "ORDER#456#ITEM" → Order item
    PK = "PRODUCT#789"  SK = "PRODUCT#789"    → Product info
```

```
Capacity modes:
  Provisioned: set RCU/WCU manually (+ auto-scaling)
    1 RCU = 1 strongly consistent read (4KB) / giây
    1 WCU = 1 write (1KB) / giây
    
  On-Demand: trả theo request (không cần plan capacity)
    → Bắt đầu với On-Demand, chuyển Provisioned khi traffic ổn định

DAX (DynamoDB Accelerator):
  In-memory cache phía trước DynamoDB
  Microsecond reads (vs millisecond)
  Drop-in replacement (cùng API)

DynamoDB Streams:
  CDC (Change Data Capture) — mỗi write tạo event
  → Lambda consume → sync tới Elasticsearch, S3, analytics
```

### ElastiCache

```
Redis vs Memcached:

| Feature        | Redis         | Memcached     |
|---------------|---------------|---------------|
| Data types    | String, List, Set, Hash, Sorted Set | String only |
| Persistence   | ✅ RDB + AOF  | ❌ None       |
| Replication   | ✅ Multi-AZ   | ❌ No         |
| Pub/Sub       | ✅ Yes        | ❌ No         |
| Cluster mode  | ✅ Sharding   | ✅ Multi-node |
| Use case      | Session, cache, leaderboard, queue | Simple cache |

Best practice: Redis cho hầu hết use cases. Memcached chỉ khi cần simplicity thuần.
```

---

## Networking

### VPC (Virtual Private Cloud)

```
                     Internet
                        │
                  ┌─────┴─────┐
                  │ Internet  │
                  │ Gateway   │
                  └─────┬─────┘
                        │
        VPC: 10.0.0.0/16
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────┴────┐    ┌─────┴─────┐   ┌────┴────┐
   │ Public  │    │ Private   │   │ Private │
   │ Subnet  │    │ Subnet    │   │ Subnet  │
   │ 10.0.1.0│    │ 10.0.2.0  │   │ 10.0.3.0│
   │ /24     │    │ /24       │   │ /24     │
   │         │    │           │   │         │
   │ ALB     │    │ ECS/EC2   │   │ RDS     │
   │ NAT GW  │    │ App logic │   │ ElastiC.│
   │ Bastion │    │           │   │         │
   └─────────┘    └───────┬───┘   └─────────┘
                          │
                    ┌─────┴─────┐
                    │ NAT       │  Private → Internet (outbound only)
                    │ Gateway   │  (download deps, call APIs)
                    └───────────┘
```

#### Security Groups vs NACLs

| | Security Group | NACL |
|---|---------------|------|
| **Level** | Instance (ENI) | Subnet |
| **State** | **Stateful** (return traffic auto allowed) | **Stateless** (phải define cả inbound + outbound) |
| **Rules** | Allow only | Allow + Deny |
| **Default** | Deny all inbound, Allow all outbound | Allow all |
| **Evaluation** | Tất cả rules evaluated | Rules evaluated theo thứ tự (number) |
| **Dùng** | ✅ Primary firewall | Backup layer |

### Route 53 — DNS

```
Routing policies:
  Simple:        1 record → 1 resource
  Weighted:      70% → server A, 30% → server B (A/B testing)
  Latency:       Route tới region gần nhất
  Failover:      Primary → secondary (health check)
  Geolocation:   Route theo country/continent
  Multi-value:   Health-checked simple routing

Health Checks:
  HTTP/HTTPS/TCP → endpoint
  Unhealthy → Route 53 tự loại endpoint khỏi DNS
```

### Load Balancers

| | ALB (Application) | NLB (Network) | GLB (Gateway) |
|---|-------------------|---------------|---------------|
| **Layer** | L7 (HTTP/HTTPS) | L4 (TCP/UDP) | L3 (IP) |
| **Routing** | Path, host, header, query | Port, protocol | IP |
| **Latency** | ~400ms added | ~100μs added | ~100μs |
| **Use case** | Web apps, microservices | Low latency, gRPC, gaming | Firewall, IDS/IPS |
| **WebSocket** | ✅ | ✅ | ❌ |
| **SSL termination** | ✅ | ✅ (TLS) | ❌ |

---

## Messaging & Integration

### SQS (Simple Queue Service)

```
Standard Queue:
  - Throughput: unlimited
  - Ordering: best-effort (có thể out-of-order)
  - Delivery: at-least-once (có thể duplicate)
  - → Use: notification, task queue, buffer

FIFO Queue:
  - Throughput: 300 TPS (3,000 with batching)
  - Ordering: strict FIFO
  - Delivery: exactly-once
  - → Use: financial transactions, order processing

Dead-Letter Queue (DLQ):
  Messages failed N lần → chuyển qua DLQ
  → Investigate, replay, alert
  
Visibility Timeout:
  Consumer nhận message → message "ẩn" trong X giây
  Nếu consumer không delete → message quay lại queue
  Default: 30s, Max: 12 giờ
  
Long Polling:
  WaitTimeSeconds = 20 → SQS đợi message thay vì trả empty ngay
  → Giảm API calls, giảm cost
```

### EventBridge (CloudWatch Events v2)

```
Event Bus Pattern:
  Producer → Event Bus → Rules → Targets

  Rule:     "source = 'order-service' AND detail-type = 'OrderCreated'"
  Targets:  Lambda, SQS, SNS, Step Functions, API destinations

  Schema Registry: auto-discover event schemas
  Archive & Replay: lưu events → replay cho debugging

EventBridge vs SNS vs SQS:
  SNS:         Simple pub/sub, fan-out
  SQS:         Queue, point-to-point, retry
  EventBridge: Content-based routing, schema, cross-account, SaaS events
```

### Step Functions — Workflow Orchestration

```
State Machine cho complex workflows:

  Order Flow:
    ┌──────────┐
    │ Validate │
    │ Order    │
    └────┬─────┘
         │
    ┌────┴─────┐
    │ Payment  │
    │ Process  │──── Fail? → Notify Customer → End
    └────┬─────┘
         │ Success
    ┌────┴─────┐
    │ Reserve  │
    │ Inventory│
    └────┬─────┘
         │
    ┌────┴─────┐
    │ Ship     │
    │ Order    │
    └────┬─────┘
         │
    ┌────┴─────┐
    │ Notify   │
    │ Customer │
    └──────────┘

  Express:   Short-lived (< 5 phút), high volume, at-least-once
  Standard:  Long-running (up to 1 năm), exactly-once
```

---

## CDN & Edge

### CloudFront

```
Edge Locations: 450+ toàn cầu
  → Cache static content (S3, API responses)
  → Giảm latency: user Vietnam → edge Singapore (vs origin US)

Origins:
  S3 bucket (static files, SPA)
  ALB/EC2   (dynamic API)
  API Gateway
  Custom origin (any HTTP server)

Features:
  Origin Access Control (OAC): S3 chỉ cho phép truy cập qua CloudFront
  Lambda@Edge / CloudFront Functions: chạy code tại edge
    - URL rewrite, A/B testing, JWT validation, redirect
  Cache Behaviors: /api/* → ALB origin, /* → S3 origin
  WAF integration: chặn DDoS, SQL injection, XSS tại edge

Cache invalidation:
  aws cloudfront create-invalidation --distribution-id E1234 --paths "/*"
```

---

## Observability

### CloudWatch

```
Metrics:   CPU, memory, disk, custom metrics → dashboards, alerts
Logs:      Application logs, VPC flow logs, CloudTrail
Alarms:    CPU > 80% → SNS → PagerDuty / email / Lambda auto-remediate
Insights:  Container Insights (ECS/EKS), Lambda Insights
Dashboard: Custom dashboards cho team

Key metrics to monitor:
  EC2:    CPUUtilization, NetworkIn/Out, StatusCheckFailed
  RDS:    FreeableMemory, ReadIOPS, CPUUtilization, ReplicaLag
  Lambda: Duration, Errors, Throttles, ConcurrentExecutions
  ALB:    RequestCount, TargetResponseTime, HTTPCode_5XX
  SQS:    ApproximateNumberOfMessagesVisible, AgeOfOldestMessage
```

### X-Ray — Distributed Tracing

```
Request → API Gateway → Lambda → DynamoDB → S3
                ↓ trace
          X-Ray Service Map:
          [Frontend] → [API GW] → [Lambda A] → [DynamoDB]
                                 → [Lambda B] → [S3]
                                              → [SQS]

  → Xem bottleneck, error rate, latency breakdown per service
  → Tương tự Jaeger/Zipkin nhưng managed by AWS
```

**Quay lại:** [README.md](./README.md)
