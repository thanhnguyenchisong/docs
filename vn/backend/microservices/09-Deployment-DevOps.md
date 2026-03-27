# Deployment & DevOps cho Microservices - Câu hỏi phỏng vấn

## Mục lục
1. [Containerization](#containerization)
2. [Kubernetes Deployment](#kubernetes-deployment)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Deployment Strategies](#deployment-strategies)
5. [Helm Charts cho Microservices](#helm-charts-cho-microservices)
6. [GitOps](#gitops)
7. [Best Practices & Checklist](#best-practices--checklist)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Containerization

### Dockerfile cho Microservice (Spring Boot)

```dockerfile
# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:resolve
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -g 1001 app && adduser -u 1001 -G app -D app
COPY --from=builder --chown=app:app /app/target/*.jar app.jar

EXPOSE 8080
USER app

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --spider -q http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### Docker Compose cho Dev Environment

```yaml
services:
  order-service:
    build: ./order-service
    ports: ["8081:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_URL: jdbc:postgresql://db:5432/orders
      KAFKA_BOOTSTRAP: kafka:9092
    depends_on:
      db: { condition: service_healthy }
      kafka: { condition: service_started }

  payment-service:
    build: ./payment-service
    ports: ["8082:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_URL: jdbc:postgresql://db:5432/payments

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: dev-password
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk

volumes:
  pgdata:
```

---

## Kubernetes Deployment

### Deployment manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v1
    spec:
      containers:
        - name: order-service
          image: registry.example.com/order-service:1.2.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "production"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: order-service-secrets
                  key: db-password
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: "1"
              memory: 1Gi
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            failureThreshold: 30
            periodSeconds: 10
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: order-service
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 8080
  selector:
    app: order-service
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
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
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## CI/CD Pipeline

### GitLab CI cho Microservices

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - scan
  - deploy

variables:
  REGISTRY: registry.example.com
  IMAGE_NAME: $REGISTRY/$CI_PROJECT_PATH

test:
  stage: test
  image: eclipse-temurin:21-jdk-alpine
  script:
    - ./mvnw verify
  artifacts:
    reports:
      junit: target/surefire-reports/*.xml

build:
  stage: build
  image: docker:24-dind
  services: [docker:24-dind]
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest
    - docker push $IMAGE_NAME:latest

scan:
  stage: scan
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $IMAGE_NAME:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/order-service order-service=$IMAGE_NAME:$CI_COMMIT_SHA -n staging
    - kubectl rollout status deployment/order-service -n staging --timeout=300s
  environment:
    name: staging

deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/order-service order-service=$IMAGE_NAME:$CI_COMMIT_SHA -n production
    - kubectl rollout status deployment/order-service -n production --timeout=300s
  environment:
    name: production
  when: manual  # Phải approve thủ công
```

---

## Deployment Strategies

| Strategy | Mô tả | Use case |
|----------|--------|----------|
| **Rolling Update** | Thay thế pod cũ bằng pod mới từng cái | Default, ít downtime |
| **Blue-Green** | Hai environment; switch traffic | Zero downtime, rollback nhanh |
| **Canary** | Deploy cho % nhỏ user trước | Test production, phát hiện lỗi sớm |
| **A/B Testing** | Route user theo feature flag | Test tính năng mới |

### Rolling Update (K8s default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Tối đa 1 pod mới thêm
      maxUnavailable: 0  # Không cho pod nào unavailable → zero downtime
```

### Canary với Istio

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service
spec:
  hosts: [order-service]
  http:
    - route:
        - destination:
            host: order-service
            subset: stable
          weight: 90         # 90% traffic → version cũ
        - destination:
            host: order-service
            subset: canary
          weight: 10         # 10% traffic → version mới
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: order-service
spec:
  host: order-service
  subsets:
    - name: stable
      labels:
        version: v1
    - name: canary
      labels:
        version: v2
```

---

## Helm Charts cho Microservices

### Chart structure

```
charts/order-service/
├── Chart.yaml
├── values.yaml
├── values-staging.yaml
├── values-production.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── hpa.yaml
    ├── configmap.yaml
    └── secret.yaml
```

### values.yaml

```yaml
replicaCount: 3
image:
  repository: registry.example.com/order-service
  tag: "1.2.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: "1"
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilization: 70

env:
  SPRING_PROFILES_ACTIVE: production
```

```bash
# Deploy
helm install order-service ./charts/order-service -f values-production.yaml -n production
helm upgrade order-service ./charts/order-service --set image.tag=1.3.0 -n production
helm rollback order-service 1 -n production  # Rollback
```

---

## GitOps

### ArgoCD — Continuous Delivery

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service
spec:
  project: default
  source:
    repoURL: https://gitlab.example.com/k8s-manifests.git
    targetRevision: main
    path: services/order-service
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**GitOps workflow**:
1. Developer merge code → CI build image + push registry
2. CI update image tag trong Git manifest repo
3. ArgoCD detect change → auto sync K8s cluster
4. Rollback = revert Git commit

---

## Best Practices & Checklist

- [ ] Mỗi service có **Dockerfile** riêng, multi-stage build
- [ ] **Immutable image tags** (commit SHA hoặc semver, không `:latest`)
- [ ] **CI pipeline**: test → build → scan → deploy
- [ ] **Helm charts** cho mỗi service (hoặc Kustomize)
- [ ] **HPA** (Horizontal Pod Autoscaler) cho auto-scaling
- [ ] **Readiness + Liveness probes** cho mỗi service
- [ ] **Resource requests/limits** cho mỗi container
- [ ] **Rolling update** hoặc **Canary** cho zero-downtime deploy
- [ ] **GitOps** (ArgoCD/FluxCD) cho production
- [ ] **Rollback plan** rõ ràng (helm rollback, kubectl rollout undo)

---

## Câu hỏi thường gặp

### Deploy microservices nên dùng K8s hay Docker Compose?
> **Docker Compose**: development, small deployments. **Kubernetes**: production, scaling, HA, rolling updates. Nếu > 5 services và cần production-ready → K8s.

### Canary deployment hoạt động thế nào?
> Deploy version mới cho **% nhỏ traffic** (5-10%). Monitor metrics (error rate, latency). Nếu OK → tăng dần. Nếu lỗi → rollback ngay. Dùng Istio VirtualService hoặc Flagger.

### GitOps khác CI/CD truyền thống thế nào?
> CI/CD truyền thống: pipeline **push** changes vào cluster. GitOps: Git là **single source of truth**, controller (ArgoCD) **pull** changes từ Git. GitOps an toàn hơn (audit trail, rollback = git revert).

### Mỗi service một repo hay monorepo?
> **Poly-repo**: mỗi service repo riêng, team tự quản, CI/CD riêng. **Monorepo**: dễ chia sẻ code, atomic changes; nhưng cần tooling (Nx, Bazel). Cả hai đều phổ biến — phụ thuộc team size và culture.

---

**Quay lại:** [README.md](./README.md)
