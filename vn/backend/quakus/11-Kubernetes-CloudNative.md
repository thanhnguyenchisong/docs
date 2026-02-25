# Kubernetes & Cloud Native - Quarkus

## Mục lục
1. [Kubernetes extension & manifests](#kubernetes-extension--manifests)
2. [Health probes (Liveness, Readiness, Startup)](#health-probes-liveness-readiness-startup)
3. [ConfigMaps & Secrets](#configmaps--secrets)
4. [Resource requests & limits](#resource-requests--limits)
5. [HPA (Horizontal Pod Autoscaler)](#hpa-horizontal-pod-autoscaler)
6. [Deploy & rollout](#deploy--rollout)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Kubernetes extension & manifests

Quarkus sinh ra Kubernetes manifests (Deployment, Service, ConfigMap, ...) khi build.

### Dependency & bật generate

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-kubernetes</artifactId>
</dependency>
```

```properties
# Generate manifests (không deploy)
quarkus.kubernetes.deploy=false
quarkus.kubernetes.deployment-target=kubernetes

# Output: target/kubernetes/kubernetes.yml (và các file khác)
```

### Cấu trúc output

```
target/kubernetes/
├── kubernetes.yml       # Deployment, Service, ...
├── kubernetes.json
└── (optional) openshift.yml, knative.yml
```

### Deployment cơ bản

```properties
quarkus.kubernetes.name=my-quarkus-app
quarkus.kubernetes.replicas=2
quarkus.kubernetes.ports.http.container-port=8080
quarkus.kubernetes.service-type=ClusterIP
```

---

## Health probes (Liveness, Readiness, Startup)

Kubernetes dùng probes để quyết định khi nào restart pod (liveness), khi nào đưa traffic (readiness), và khi nào coi app đã khởi động xong (startup).

### Quarkus Health endpoints

- **Liveness**: `/q/health/live` — App còn sống không? Fail → restart pod.
- **Readiness**: `/q/health/ready` — App sẵn sàng nhận request chưa? Fail → bỏ pod khỏi Service.
- **Startup**: `/q/health/started` — App đã khởi động xong chưa? (tránh kill pod đang startup chậm.)

### Cấu hình trong Quarkus

```properties
# Đường dẫn probe (trùng với SmallRye Health)
quarkus.kubernetes.liveness-probe.http-action-path=/q/health/live
quarkus.kubernetes.readiness-probe.http-action-path=/q/health/ready
quarkus.kubernetes.startup-probe.http-action-path=/q/health/started

# Thời gian
quarkus.kubernetes.liveness-probe.initial-delay-seconds=10
quarkus.kubernetes.liveness-probe.period-seconds=10
quarkus.kubernetes.liveness-probe.timeout-seconds=5
quarkus.kubernetes.liveness-probe.failure-threshold=3

quarkus.kubernetes.readiness-probe.initial-delay-seconds=5
quarkus.kubernetes.readiness-probe.period-seconds=5

# Startup probe: cho phép app khởi động chậm (VD native)
quarkus.kubernetes.startup-probe.initial-delay-seconds=0
quarkus.kubernetes.startup-probe.period-seconds=5
quarkus.kubernetes.startup-probe.failure-threshold=30
```

### Best practice

- **Liveness**: Chỉ check “process còn sống”, không phụ thuộc DB hay dependency ngoài (tránh restart vô tội vạ).
- **Readiness**: Check DB, cache, downstream API; nếu không dùng được thì trả down để K8s không gửi traffic.
- **Startup**: Dùng khi app khởi động lâu (native, init nặng); failure-threshold đủ lớn để không bị kill trong lúc start.

---

## ConfigMaps & Secrets

### ConfigMap — config không nhạy cảm

Tạo ConfigMap trên cluster (tay hoặc từ file):

```yaml
# app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  application.properties: |
    app.host=api.example.com
    app.port=443
  # hoặc từng key
  APP_ENV: prod
```

Inject vào Deployment dưới dạng **env** hoặc **volume**:

```properties
# Quarkus: khai báo dùng ConfigMap
quarkus.kubernetes.config-maps=app-config
# Env từ ConfigMap
quarkus.kubernetes.env-vars.app-host.value-from.config-map-key=app-config.APP_HOST
```

Hoặc trong manifest Quarkus generate (sau khi build, có thể chỉnh tay):

```yaml
spec:
  containers:
    - envFrom:
        - configMapRef:
            name: app-config
```

### Secrets — config nhạy cảm

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  username: admin
  password: secret123
```

Quarkus:

```properties
quarkus.kubernetes.secrets=db-secret
# Hoặc từng key
quarkus.datasource.username=${DB_USERNAME}
quarkus.datasource.password=${DB_PASSWORD}
```

Trong Deployment (env từ Secret):

```yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: username
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
```

Quarkus có thể generate env từ secret nếu cấu hình đúng; hoặc dùng `quarkus.kubernetes.secrets` và map key vào biến môi trường ứng dụng mong đợi.

---

## Resource requests & limits

```properties
# CPU/Memory
quarkus.kubernetes.resources.requests.cpu=100m
quarkus.kubernetes.resources.requests.memory=128Mi
quarkus.kubernetes.resources.limits.cpu=500m
quarkus.kubernetes.resources.limits.memory=256Mi
```

### Gợi ý

- **JVM**: Memory request/limit nên đủ cho heap (ví dụ 256Mi–512Mi cho microservice nhỏ). Dùng `-XX:MaxRAMPercentage=75` trong container.
- **Native**: Request có thể thấp hơn (64Mi–128Mi); limit tùy load.
- **CPU request**: 100m–200m cho service nhẹ; tăng nếu CPU-bound.

---

## HPA (Horizontal Pod Autoscaler)

Tự động tăng/giảm số replica theo CPU (hoặc metric khác).

### Cấu hình trong Quarkus

```properties
quarkus.kubernetes.autoscaling.max-replicas=10
quarkus.kubernetes.autoscaling.min-replicas=2
quarkus.kubernetes.autoscaling.cpu-target-utilization=70
```

Generate ra HPA tương tự:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-quarkus-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-quarkus-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Lưu ý

- Cần **metrics-server** trên cluster để HPA đọc CPU.
- Có thể thêm metric custom (Prometheus, etc.) nếu dùng HPA v2 với custom metrics.

---

## Deploy & rollout

### Build và generate manifests

```bash
./mvnw package -Dquarkus.kubernetes.deploy=false
# Xem/sửa: target/kubernetes/kubernetes.yml
kubectl apply -f target/kubernetes/kubernetes.yml
```

### Deploy trực tiếp (deploy=true)

```bash
./mvnw package -Dquarkus.kubernetes.deploy=true
# Quarkus apply lên cluster (cần kubeconfig)
```

### Rollout

```bash
kubectl rollout status deployment/my-quarkus-app
kubectl rollout undo deployment/my-quarkus-app
```

---

## Câu hỏi thường gặp

### Q1: Liveness vs Readiness?

- **Liveness**: “Có cần restart pod không?” — nên đơn giản (process alive).
- **Readiness**: “Có gửi traffic cho pod không?” — có thể check DB, dependency.

### Q2: ConfigMap vs Secret?

- **ConfigMap**: URL, feature flags, config không nhạy cảm.
- **Secret**: Password, token, certificate; K8s mã hóa at rest (khi bật encryption).

### Q3: HPA không scale?

- Kiểm tra metrics-server đã cài và CPU có được report không.
- Kiểm tra request/limit đã set; nếu không set request, utilization có thể không tính đúng.

---

## Tổng kết

- **Manifests**: Quarkus Kubernetes extension sinh Deployment, Service, (ConfigMap/Secret/HPA nếu cấu hình).
- **Probes**: Liveness / Readiness / Startup trỏ tới `/q/health/*`; cấu hình initial-delay, period, failure-threshold.
- **ConfigMaps & Secrets**: Mount hoặc env; app đọc qua biến môi trường tương ứng.
- **Resources**: Set requests/limits CPU và memory phù hợp JVM/Native.
- **HPA**: Min/max replicas và target CPU utilization; cần metrics-server.
