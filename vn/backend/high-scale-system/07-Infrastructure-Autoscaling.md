# Infrastructure & Auto-scaling

## Mục lục
1. [Kubernetes HPA](#kubernetes-hpa)
2. [Custom Metrics Scaling](#custom-metrics-scaling)
3. [Multi-region Deployment](#multi-region-deployment)
4. [Capacity Planning Workflow](#capacity-planning-workflow)
5. [Cost Optimization](#cost-optimization)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Kubernetes HPA

### CPU-based scaling cơ bản

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 10
  maxReplicas: 500
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30   # Đợi 30s trước khi scale up tiếp
      policies:
        - type: Percent
          value: 100                    # Scale tối đa 100% mỗi lần
          periodSeconds: 30
        - type: Pods
          value: 50
          periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300  # Đợi 5 phút trước khi scale down
      policies:
        - type: Percent
          value: 10                    # Scale down tối đa 10% mỗi lần
          periodSeconds: 60
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60       # Scale khi CPU > 60%
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 75
```

### Scale up NHANH, scale down CHẬM

```
Tại sao?
- Scale up chậm → traffic spike → service chết
- Scale down nhanh → traffic còn cao → lại phải scale up → thrashing

Best practice:
- Scale up: 30s stabilization, 100% increase
- Scale down: 5-10 phút stabilization, 10% decrease
```

---

## Custom Metrics Scaling

### Scale theo request rate (RPS)

```yaml
# Scale dựa trên Prometheus metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  metrics:
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"  # Scale khi mỗi pod > 1000 RPS
```

### Scale theo Kafka consumer lag

```yaml
# KEDA (Kubernetes Event-Driven Autoscaler)
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-consumer
spec:
  scaleTargetRef:
    name: order-consumer
  minReplicaCount: 5
  maxReplicaCount: 100
  triggers:
    - type: kafka
      metadata:
        bootstrapServers: kafka:9092
        consumerGroup: order-processing
        topic: order-events
        lagThreshold: "1000"        # Scale khi lag > 1000
        activationLagThreshold: "10" # Activate khi lag > 10
```

---

## Multi-Region Deployment

### Active-Active Multi-Region

```
                    ┌──────────┐
                    │ GeoDNS   │
                    └────┬─────┘
                    ┌────┴─────┐
              ┌─────┤          ├──────┐
              │     └──────────┘      │
     VN users │                       │ US users
              ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐
    │  Region: SG     │    │  Region: US-E   │
    │  ┌─────────┐    │    │  ┌─────────┐    │
    │  │ K8s     │    │    │  │ K8s     │    │
    │  │ Cluster │    │    │  │ Cluster │    │
    │  └────┬────┘    │    │  └────┬────┘    │
    │  ┌────┴────┐    │    │  ┌────┴────┐    │
    │  │ Redis   │    │    │  │ Redis   │    │
    │  │ Cluster │    │    │  │ Cluster │    │
    │  └────┬────┘    │    │  └────┬────┘    │
    │  ┌────┴────┐    │    │  ┌────┴────┐    │
    │  │ DB      │◄──►│    │◄►│ DB      │    │
    │  │ Primary │ Replication │ Primary │    │
    │  └─────────┘    │    │  └─────────┘    │
    └─────────────────┘    └─────────────────┘
```

### Challenges

| Challenge | Giải pháp |
|-----------|----------|
| **Conflict resolution** | Last-write-wins, CRDTs, application-level merge |
| **Data replication lag** | Accept eventual consistency (50-200ms cross-region) |
| **Network partition** | Each region operates independently → CAP theorem |
| **Session management** | JWT (stateless) → user request to any region |

---

## Capacity Planning Workflow

### Pre-launch Planning

```
1. Estimate peak traffic
   - Marketing: "Dự kiến 1 triệu users online cùng lúc"
   - Average actions/user/minute: 5
   - Peak RPS: 1M × 5 / 60 = ~83,000 RPS
   - Spike (3x): ~250,000 RPS

2. Load test hiện tại
   - Current capacity: 10,000 RPS (20 pods, 500 RPS/pod)
   - Target: 250,000 RPS
   - Scale factor: 25x

3. Tính resources
   - Pods: 20 × 25 = 500 pods
   - Redis: proportional scale
   - DB: read replicas + connection pool
   - Kafka: partitions = consumer count needed

4. Pre-scale
   - Scale pods TRƯỚC event 30 phút
   - Warm cache TRƯỚC (pre-load hot data)
   - Test failover scenarios
```

### Load Testing cho High Scale

```bash
# K6 — load test
k6 run --vus 10000 --duration 5m script.js

# Vegeta — HTTP load testing
echo "GET http://api/products" | vegeta attack -rate=50000/s -duration=60s | vegeta report

# wrk — HTTP benchmark
wrk -t12 -c10000 -d30s http://api/products
```

---

## Cost Optimization

### Spot/Preemptible Instances

```yaml
# K8s: mix On-Demand + Spot nodes
# Non-critical workloads (batch, consumers) → Spot (70% cheaper)
# Critical workloads (API servers) → On-Demand

apiVersion: v1
kind: Pod
spec:
  nodeSelector:
    node-type: spot        # Schedule on spot instances
  tolerations:
    - key: "spot"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"
```

### Right-sizing

```
Monitor actual resource usage:
  Pod requests: 1 CPU, 1GB RAM
  Actual usage: 0.3 CPU, 400MB RAM (70% wasted!)

→ Giảm requests: 0.5 CPU, 512MB RAM
→ Tiết kiệm 50% cost, fit nhiều pods/node hơn

Tool: VPA (Vertical Pod Autoscaler) suggest đúng resource
```

---

## Câu Hỏi Phỏng Vấn

### Auto-scaling dựa trên metric nào?
> **CPU/Memory**: đơn giản nhưng lagging indicator. **Request rate (RPS)**: tốt cho web services. **Queue depth/consumer lag**: tốt cho workers. **Custom business metrics**: tốt nhất nhưng complex.

### Chuẩn bị cho flash sale (spike traffic) thế nào?
> (1) Estimate peak từ marketing, (2) Load test trước, (3) **Pre-scale** pods/cache/DB 30 phút trước, (4) Warm cache (pre-load), (5) Rate limit non-critical APIs, (6) Feature flags tắt non-essential features, (7) War room monitoring.

---

**Tiếp theo:** [08-Rate-Limiting-Protection.md](./08-Rate-Limiting-Protection.md)
