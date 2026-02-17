# Deployment Strategies trong Kubernetes

## 1. Tổng quan về Deployment Strategies

Deployment Strategy là cách bạn deploy new version của application lên production. Mỗi strategy có trade-offs khác nhau về risk, downtime, và complexity.

### 1.1. Các Deployment Strategies

- **Rolling Update**: Thay thế pods từng cái một (built-in Kubernetes)
- **Recreate**: Terminate tất cả pods cũ rồi tạo mới (built-in Kubernetes)
- **Blue-Green**: Chạy 2 versions song song, switch traffic
- **Canary**: Deploy một phần traffic đến version mới
- **A/B Testing**: Route traffic dựa trên user attributes
- **Feature Flags**: Enable/disable features dynamically

### 1.2. Khi nào dùng strategy nào?

| Strategy | Downtime | Risk | Complexity | Use Case |
|----------|----------|------|------------|----------|
| **Rolling Update** | Zero | Medium | Low | Most applications |
| **Recreate** | Yes | Low | Low | Non-critical apps |
| **Blue-Green** | Zero | Low | Medium | Critical apps |
| **Canary** | Zero | Very Low | High | High-risk changes |
| **A/B Testing** | Zero | Low | High | Feature validation |

## 2. Rolling Update (Built-in)

Rolling Update là strategy mặc định của Kubernetes Deployment.

### 2.1. Cách hoạt động

```
Old Pods:  [Pod1-v1] [Pod2-v1] [Pod3-v1]
           ↓
           [Pod1-v2] [Pod2-v1] [Pod3-v1]
           ↓
           [Pod1-v2] [Pod2-v2] [Pod3-v1]
           ↓
           [Pod1-v2] [Pod2-v2] [Pod3-v2]
```

### 2.2. Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Có thể có 4 pods (3 + 1)
      maxUnavailable: 0     # Zero downtime
  template:
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
```

### 2.3. Ưu và nhược điểm

**Ưu điểm:**
- Zero downtime
- Built-in Kubernetes
- Automatic rollback nếu health check fail
- Gradual rollout

**Nhược điểm:**
- Có thể có 2 versions chạy cùng lúc
- Khó control traffic distribution
- Không hỗ trợ advanced features (canary, A/B)

## 3. Recreate Strategy

Recreate terminate tất cả pods cũ trước khi tạo pods mới.

### 3.1. Cách hoạt động

```
Old Pods:  [Pod1-v1] [Pod2-v1] [Pod3-v1]
           ↓
           [Terminate all]
           ↓
           [Pod1-v2] [Pod2-v2] [Pod3-v2]
```

### 3.2. Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  strategy:
    type: Recreate  # Terminate all old pods first
  template:
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
```

### 3.3. Ưu và nhược điểm

**Ưu điểm:**
- Đơn giản
- Không có version conflict
- Phù hợp cho stateful applications cần migration

**Nhược điểm:**
- Có downtime
- Không phù hợp cho high-availability applications

## 4. Blue-Green Deployment

Blue-Green deployment chạy 2 versions song song (blue = old, green = new), sau đó switch traffic từ blue sang green.

### 4.1. Cách hoạt động

```
Blue (v1):  [Pod1-v1] [Pod2-v1] [Pod3-v1]  ← Current traffic
Green (v2): [Pod1-v2] [Pod2-v2] [Pod3-v2]  ← New version

Switch traffic → Green becomes active
```

### 4.2. Implementation với 2 Deployments

```yaml
# Blue Deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: blue
  template:
    metadata:
      labels:
        app: my-app
        version: blue
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
---
# Green Deployment (new)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: green
  template:
    metadata:
      labels:
        app: my-app
        version: green
    spec:
      containers:
      - name: app
        image: my-app:v2.0.0
---
# Service (switch between blue/green)
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
    version: blue  # Switch to 'green' to activate new version
  ports:
  - port: 80
    targetPort: 8080
```

### 4.3. Switch Traffic

```bash
# Deploy green version
kubectl apply -f green-deployment.yaml

# Verify green is ready
kubectl get pods -l version=green
kubectl rollout status deployment/my-app-green

# Switch traffic to green
kubectl patch service my-app-service -p '{"spec":{"selector":{"version":"green"}}}'

# Verify traffic
kubectl get endpoints my-app-service

# If issues, rollback to blue
kubectl patch service my-app-service -p '{"spec":{"selector":{"version":"blue"}}}'
```

### 4.4. Ưu và nhược điểm

**Ưu điểm:**
- Zero downtime
- Instant rollback
- Easy testing của new version
- No version conflicts

**Nhược điểm:**
- Cần 2x resources trong quá trình deployment
- Manual switch (có thể automate)
- Database migrations cần careful planning

## 5. Canary Deployment

Canary deployment deploy new version cho một phần nhỏ traffic trước, sau đó gradually increase.

### 5.1. Cách hoạt động

```
v1 (90%):  [Pod1-v1] [Pod2-v1] [Pod3-v1] [Pod4-v1] [Pod5-v1]
v2 (10%):  [Pod1-v2]  ← Canary pod
```

### 5.2. Implementation với 2 Deployments

```yaml
# Stable Deployment (v1)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: my-app
      track: stable
  template:
    metadata:
      labels:
        app: my-app
        track: stable
        version: v1.0.0
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
---
# Canary Deployment (v2)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-canary
spec:
  replicas: 1  # 10% of traffic
  selector:
    matchLabels:
      app: my-app
      track: canary
  template:
    metadata:
      labels:
        app: my-app
        track: canary
        version: v2.0.0
    spec:
      containers:
      - name: app
        image: my-app:v2.0.0
---
# Service (routes to both)
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app  # Routes to both stable and canary
  ports:
  - port: 80
    targetPort: 8080
```

### 5.3. Gradual Rollout

```bash
# Deploy canary (10%)
kubectl scale deployment my-app-canary --replicas=1

# Monitor metrics
kubectl get pods -l app=my-app
# Check error rates, latency, etc.

# If successful, increase to 25%
kubectl scale deployment my-app-canary --replicas=3
kubectl scale deployment my-app-stable --replicas=9

# Continue to 50%
kubectl scale deployment my-app-canary --replicas=5
kubectl scale deployment my-app-stable --replicas=5

# Full rollout: scale canary to 10, delete stable
kubectl scale deployment my-app-canary --replicas=10
kubectl delete deployment my-app-stable

# Rename canary to stable
kubectl patch deployment my-app-canary -p '{"metadata":{"labels":{"track":"stable"}}}'
```

### 5.4. Canary với Ingress (NGINX)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% traffic
spec:
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-canary
            port:
              number: 80
---
# Main Ingress (90% traffic)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress-main
spec:
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-stable
            port:
              number: 80
```

### 5.5. Ưu và nhược điểm

**Ưu điểm:**
- Low risk
- Gradual rollout
- Easy rollback
- Real-world testing với production traffic

**Nhược điểm:**
- Phức tạp hơn
- Cần monitoring tốt
- Có thể có 2 versions chạy lâu

## 6. A/B Testing

A/B Testing route traffic dựa trên user attributes (headers, cookies, etc.).

### 6.1. Implementation với Ingress

```yaml
# Version A (Control)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-version-a
spec:
  replicas: 5
  selector:
    matchLabels:
      app: my-app
      version: a
  template:
    metadata:
      labels:
        app: my-app
        version: a
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
---
# Version B (Test)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-version-b
spec:
  replicas: 5
  selector:
    matchLabels:
      app: my-app
      version: b
  template:
    metadata:
      labels:
        app: my-app
        version: b
    spec:
      containers:
      - name: app
        image: my-app:v2.0.0
---
# Ingress với header-based routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: my-app.example.com
    http:
      paths:
      # Route to version B if header X-Test-Version=B
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-version-b
            port:
              number: 80
        # Can use canary annotations for percentage-based
```

### 6.2. Cookie-based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "test-version"
    nginx.ingress.kubernetes.io/canary-by-cookie-value: "enabled"
spec:
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-version-b
            port:
              number: 80
```

## 7. Argo Rollouts (Advanced)

Argo Rollouts cung cấp advanced deployment strategies với canary và blue-green support.

### 7.1. Installation

```bash
# Install Argo Rollouts
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/rollouts/releases/latest/download/install.yaml

# Install kubectl plugin
curl -LO https://github.com/argoproj/rollouts/releases/latest/download/kubectl-argo-rollouts-linux-amd64
chmod +x kubectl-argo-rollouts-linux-amd64
sudo mv kubectl-argo-rollouts-linux-amd64 /usr/local/bin/kubectl-argo-rollouts
```

### 7.2. Canary Rollout

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app-rollout
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 20      # 20% traffic
      - pause: {}          # Pause để monitor
      - setWeight: 40      # 40% traffic
      - pause: {duration: 10m}  # Pause 10 minutes
      - setWeight: 60      # 60% traffic
      - pause: {}
      - setWeight: 100     # 100% traffic
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
        ports:
        - containerPort: 8080
```

### 7.3. Blue-Green Rollout

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app-rollout
spec:
  replicas: 5
  strategy:
    blueGreen:
      activeService: my-app-active
      previewService: my-app-preview
      autoPromotionEnabled: false  # Manual promotion
      scaleDownDelaySeconds: 30
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v1.0.0
```

### 7.4. Argo Rollouts Commands

```bash
# View rollout status
kubectl argo rollouts get rollout my-app-rollout

# Promote canary
kubectl argo rollouts promote my-app-rollout

# Abort rollout
kubectl argo rollouts abort my-app-rollout

# Retry failed rollout
kubectl argo rollouts retry my-app-rollout
```

## 8. Feature Flags

Feature Flags cho phép enable/disable features mà không cần deploy.

### 8.1. Implementation với ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: feature-flags
data:
  new-feature-enabled: "true"
  beta-feature-enabled: "false"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
        envFrom:
        - configMapRef:
            name: feature-flags
```

### 8.2. Dynamic Feature Flags

Sử dụng external service như LaunchDarkly, Flagsmith, hoặc tự build:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: feature-flags
data:
  feature-flag-service: "http://flags-service:8080"
---
# App checks feature flags từ service
env:
- name: FEATURE_FLAG_SERVICE
  valueFrom:
    configMapKeyRef:
      name: feature-flags
      key: feature-flag-service
```

## 9. Best Practices

### 9.1. Strategy Selection

- **Rolling Update**: Default choice cho hầu hết applications
- **Recreate**: Chỉ dùng cho non-critical apps hoặc stateful apps cần migration
- **Blue-Green**: Critical applications cần instant rollback
- **Canary**: High-risk changes hoặc major version updates
- **A/B Testing**: Feature validation và user experience testing

### 9.2. Monitoring và Observability

- **Metrics**: Monitor error rates, latency, throughput
- **Logs**: Check logs của new version
- **Alerts**: Set up alerts cho anomalies
- **Dashboards**: Visualize metrics trong real-time

### 9.3. Rollback Strategy

- **Automatic rollback**: Sử dụng health checks để auto-rollback
- **Manual rollback**: Có sẵn rollback plan
- **Database migrations**: Plan carefully cho database changes
- **Feature flags**: Use feature flags để disable features nhanh

### 9.4. Testing

- **Pre-deployment**: Test trong staging environment
- **Smoke tests**: Run smoke tests sau deployment
- **Integration tests**: Verify integrations với other services
- **Load tests**: Test performance của new version

## 10. Thực hành

### 10.1. Rolling Update

```bash
# Tạo namespace
kubectl create namespace deployment-test

# Tạo Deployment với Rolling Update
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rolling-app
  namespace: deployment-test
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: rolling-app
  template:
    metadata:
      labels:
        app: rolling-app
    spec:
      containers:
      - name: app
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF

# Watch rollout
kubectl rollout status deployment/rolling-app -n deployment-test

# Update image
kubectl set image deployment/rolling-app app=nginx:1.22 -n deployment-test

# Watch pods
kubectl get pods -n deployment-test -w
```

### 10.2. Blue-Green Deployment

```bash
# Deploy Blue (v1)
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
  namespace: deployment-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: blue
  template:
    metadata:
      labels:
        app: my-app
        version: blue
    spec:
      containers:
      - name: app
        image: nginx:1.21
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: deployment-test
spec:
  selector:
    app: my-app
    version: blue
  ports:
  - port: 80
    targetPort: 80
EOF

# Deploy Green (v2)
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
  namespace: deployment-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: green
  template:
    metadata:
      labels:
        app: my-app
        version: green
    spec:
      containers:
      - name: app
        image: nginx:1.22
        ports:
        - containerPort: 80
EOF

# Verify green is ready
kubectl rollout status deployment/app-green -n deployment-test

# Switch to green
kubectl patch service app-service -n deployment-test -p '{"spec":{"selector":{"version":"green"}}}'

# Verify
kubectl get endpoints app-service -n deployment-test
```

### 10.3. Canary Deployment

```bash
# Deploy Stable (v1)
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-stable
  namespace: deployment-test
spec:
  replicas: 9
  selector:
    matchLabels:
      app: my-app
      track: stable
  template:
    metadata:
      labels:
        app: my-app
        track: stable
    spec:
      containers:
      - name: app
        image: nginx:1.21
        ports:
        - containerPort: 80
---
# Deploy Canary (v2)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
  namespace: deployment-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
      track: canary
  template:
    metadata:
      labels:
        app: my-app
        track: canary
    spec:
      containers:
      - name: app
        image: nginx:1.22
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: deployment-test
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
EOF

# Monitor canary
kubectl get pods -n deployment-test -l app=my-app

# Increase canary to 25%
kubectl scale deployment app-canary --replicas=3 -n deployment-test
kubectl scale deployment app-stable --replicas=9 -n deployment-test

# Continue rollout...
```

### 10.4. Rollback

```bash
# Rollback Rolling Update
kubectl rollout undo deployment/rolling-app -n deployment-test

# Rollback to specific revision
kubectl rollout undo deployment/rolling-app --to-revision=2 -n deployment-test

# View rollout history
kubectl rollout history deployment/rolling-app -n deployment-test

# Rollback Blue-Green (switch back to blue)
kubectl patch service app-service -n deployment-test -p '{"spec":{"selector":{"version":"blue"}}}'

# Rollback Canary (scale down canary)
kubectl scale deployment app-canary --replicas=0 -n deployment-test
```

## 11. Troubleshooting

### 11.1. Rollout stuck

```bash
# Xem rollout status
kubectl rollout status deployment/my-app

# Xem events
kubectl get events --sort-by='.lastTimestamp'

# Xem pod status
kubectl get pods -l app=my-app

# Xem deployment details
kubectl describe deployment my-app
```

### 11.2. Health check issues

```bash
# Test health endpoint
kubectl exec -it pod-name -- curl http://localhost:8080/health

# Xem probe configuration
kubectl get deployment my-app -o yaml | grep -A 10 "livenessProbe\|readinessProbe"

# Check probe status
kubectl describe pod pod-name | grep -A 5 "Liveness\|Readiness"
```

### 11.3. Canary issues

```bash
# Xem canary metrics
kubectl get pods -l track=canary

# Compare metrics giữa stable và canary
kubectl top pods -l app=my-app

# Check logs
kubectl logs -l track=canary
kubectl logs -l track=stable
```

## 12. Cleanup

```bash
# Xóa namespace
kubectl delete namespace deployment-test

# Hoặc xóa từng resource
kubectl delete deployment rolling-app -n deployment-test
kubectl delete deployment app-blue app-green -n deployment-test
kubectl delete deployment app-stable app-canary -n deployment-test
```

## 13. Tóm tắt

- **Rolling Update**: Default strategy, zero downtime, gradual replacement
  - Built-in Kubernetes
  - maxSurge và maxUnavailable control
  - Automatic rollback với health checks

- **Recreate**: Simple strategy, có downtime
  - Terminate all old pods first
  - Phù hợp cho non-critical apps

- **Blue-Green**: Zero downtime, instant rollback
  - 2 versions song song
  - Switch traffic instantly
  - Cần 2x resources

- **Canary**: Low risk, gradual rollout
  - Deploy một phần traffic
  - Monitor và gradually increase
  - Easy rollback

- **A/B Testing**: Feature validation
  - Route traffic dựa trên attributes
  - Test user experience
  - Validate features

- **Argo Rollouts**: Advanced strategies
  - Canary và Blue-Green support
  - Automatic promotion
  - Analysis và metrics

- **Best Practices**:
  - Chọn strategy phù hợp với use case
  - Monitor metrics và logs
  - Có rollback plan
  - Test thoroughly trước khi deploy
  - Use feature flags cho quick disable