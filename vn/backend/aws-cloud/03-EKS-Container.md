# EKS & Container Services — Chi Tiết

## ECS vs EKS — Chọn Nào?

| Tiêu chí | ECS | EKS |
|---------|-----|-----|
| **Complexity** | Simpler (AWS proprietary) | Complex (Kubernetes standard) |
| **Learning curve** | Thấp | Cao (K8s knowledge required) |
| **Portability** | Lock-in AWS | ✅ Multi-cloud, on-premise |
| **Ecosystem** | AWS tools only | ✅ K8s ecosystem (Helm, Istio, ArgoCD) |
| **Cost** | Free control plane | $73/tháng per cluster |
| **Fargate** | ✅ | ✅ |
| **Khi nào chọn** | Team nhỏ, AWS-only | Team có K8s kinh nghiệm, multi-cloud |

---

## ECS (Elastic Container Service)

### Task Definition

```json
{
  "family": "order-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::role/orderServiceRole",
  "containerDefinitions": [{
    "name": "order-service",
    "image": "123456789.dkr.ecr.ap-southeast-1.amazonaws.com/order-service:v2.1",
    "cpu": 512,
    "memory": 1024,
    "portMappings": [{
      "containerPort": 8080,
      "protocol": "tcp"
    }],
    "environment": [
      { "name": "SPRING_PROFILES_ACTIVE", "value": "prod" },
      { "name": "SERVER_PORT", "value": "8080" }
    ],
    "secrets": [
      {
        "name": "DB_PASSWORD",
        "valueFrom": "arn:aws:secretsmanager:ap-southeast-1:123456789:secret:prod/db-password"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/order-service",
        "awslogs-region": "ap-southeast-1",
        "awslogs-stream-prefix": "ecs"
      }
    },
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"],
      "interval": 30,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 60
    }
  }]
}
```

### ECS Service & Auto Scaling

```
ECS Service:
  - Maintains desired count of tasks
  - Integrates with ALB (target group)
  - Handles rolling deployment
  - Circuit breaker: rollback if health check fails

Auto Scaling (Application Auto Scaling):
  Target Tracking:
    - CPU utilization = 60%  (scale out/in tự động)
    - Memory utilization = 70%
    - ALB request count per target = 1000

  Step Scaling:
    - CPU > 80% → +2 tasks
    - CPU > 95% → +5 tasks
    - CPU < 30% → -1 task

  Scheduled:
    - Weekday 8AM → desired = 10
    - Weekend → desired = 3
```

### ECS Deployment Strategies

```
Rolling Update (default):
  - Replace tasks gradually
  - minimumHealthyPercent: 50%
  - maximumPercent: 200%

Blue/Green (CodeDeploy):
  - Deploy new version → test → switch traffic
  - Instant rollback nếu có lỗi
  - Canary: 10% traffic → new, 90% → old → gradual shift

  ALB Listener Rules:
    Prod Listener (443) → Target Group Blue (v1)
    Test Listener (8443) → Target Group Green (v2)
    ↓ After testing
    Prod Listener (443) → Target Group Green (v2)  ← Traffic shift
```

---

## EKS (Elastic Kubernetes Service)

### Cluster Setup

```bash
# eksctl — tạo production cluster
eksctl create cluster \
  --name production \
  --region ap-southeast-1 \
  --version 1.29 \
  --nodegroup-name workers \
  --node-type m5.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed \
  --with-oidc \              # OIDC cho IAM Roles for Service Accounts
  --alb-ingress-access \     # Permissions cho ALB Ingress Controller
  --full-ecr-access           # Pull images từ ECR
```

### Kubernetes Manifests trên EKS

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      serviceAccountName: order-service-sa   # IAM Role mapping
      containers:
      - name: order-service
        image: 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/order-service:v2.1
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "500m"
            memory: "1Gi"
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 15
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
# ingress.yaml (AWS ALB Ingress Controller)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: order-service
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
    alb.ingress.kubernetes.io/healthcheck-path: /actuator/health
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
---
# hpa.yaml (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
```

### IAM Roles for Service Accounts (IRSA)

```bash
# Tạo IAM Role cho pod (thay vì EC2 Instance Profile)
eksctl create iamserviceaccount \
  --name order-service-sa \
  --namespace production \
  --cluster production \
  --attach-policy-arn arn:aws:iam::policy/OrderServicePolicy \
  --approve

# Pod dùng ServiceAccount → assume IAM Role
# → Truy cập DynamoDB, SQS, S3 mà KHÔNG cần access key
```

---

## ECR (Elastic Container Registry)

```bash
# Login
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-southeast-1.amazonaws.com

# Build & Push
docker build -t order-service:v2.1 .
docker tag order-service:v2.1 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/order-service:v2.1
docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/order-service:v2.1

# Lifecycle policy (auto-clean old images)
aws ecr put-lifecycle-policy --repository-name order-service --lifecycle-policy-text '{
  "rules": [{
    "rulePriority": 1,
    "description": "Keep last 10 images",
    "selection": {
      "tagStatus": "any",
      "countType": "imageCountMoreThan",
      "countNumber": 10
    },
    "action": { "type": "expire" }
  }]
}'
```

### ECR Security

```
Image Scanning:
  - Basic scanning: CVE check on push (free)
  - Enhanced scanning (Inspector): continuous scanning
  
Encryption: AES-256 (default) hoặc KMS

Replication:
  - Cross-region: images tự replicate sang region khác
  - Cross-account: share images giữa AWS accounts
```

---

## Fargate vs EC2 Node

| Tiêu chí | Fargate | EC2 Nodes |
|---------|---------|-----------|
| **Quản lý** | Serverless (AWS quản lý) | Bạn quản lý nodes |
| **Pricing** | Per vCPU + memory per second | Per EC2 instance |
| **DaemonSet** | ❌ | ✅ |
| **GPU** | ❌ | ✅ |
| **Spot** | ✅ Fargate Spot (70% cheaper) | ✅ EC2 Spot |
| **Startup time** | 30-60s | Instant (node ready) |
| **Max resources** | 4 vCPU, 30GB per task | Unlimited (instance size) |
| **Khi nào** | Microservices, batch, dev/test | GPU, high performance, daemonsets |

---

## CI/CD Pipeline

### GitHub Actions → ECR → ECS

```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::role/GitHubActionsRole
        aws-region: ap-southeast-1
    
    - name: Login to ECR
      id: ecr-login
      uses: aws-actions/amazon-ecr-login@v2
    
    - name: Build & Push
      env:
        ECR_REGISTRY: ${{ steps.ecr-login.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/order-service:$IMAGE_TAG .
        docker push $ECR_REGISTRY/order-service:$IMAGE_TAG
    
    - name: Deploy to ECS
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: task-definition.json
        service: order-service
        cluster: production
        wait-for-service-stability: true
```

### GitOps with ArgoCD → EKS

```
Git Repository (source of truth)
     │
     ├── k8s/
     │   ├── deployment.yaml
     │   ├── service.yaml
     │   └── ingress.yaml
     │
     └── Push changes → ArgoCD detects diff
                              │
                         ┌────┴────┐
                         │ ArgoCD  │  Sync Git → EKS cluster
                         │ kubectl │  Auto-sync or manual approve
                         └────┬────┘
                              │
                         ┌────┴────┐
                         │  EKS    │  Cluster updated
                         └─────────┘

Benefits:
  - Git as single source of truth
  - Rollback = git revert
  - Audit trail (git log)
  - No kubectl access needed for developers
```

**Quay lại:** [README.md](./README.md)
