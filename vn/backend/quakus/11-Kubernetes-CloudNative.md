# Kubernetes & Cloud Native - Quarkus

## Mục lục
1. [Kubernetes config trong code (application.properties)](#kubernetes-config-trong-code-applicationproperties)
2. [Kubernetes extension & manifests](#kubernetes-extension--manifests)
3. [Kubernetes Config – Đọc ConfigMap/Secret từ API](#kubernetes-config--đọc-configmapsecret-từ-api)
4. [Health probes (Liveness, Readiness, Startup)](#health-probes-liveness-readiness-startup)
5. [ConfigMaps & Secrets](#configmaps--secrets)
6. [Resource requests & limits](#resource-requests--limits)
7. [HPA (Horizontal Pod Autoscaler)](#hpa-horizontal-pod-autoscaler)
8. [Deploy & rollout](#deploy--rollout)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Kubernetes config trong code (application.properties)

Quarkus **hỗ trợ cấu hình Kubernetes hoàn toàn trong code** thông qua **application.properties** (và một số annotation/build-time config). Bạn **không cần viết file YAML tay**; mọi thứ (Deployment, Service, env, ConfigMap/Secret ref, probes, HPA, …) đều do Quarkus **generate lúc build** dựa trên các key `quarkus.kubernetes.*`.

### Cơ chế

- Extension **quarkus-kubernetes** dùng [Dekorate](https://github.com/dekorateio/dekorate/) để sinh manifest.
- Cấu hình trong **application.properties** (hoặc YAML) → khi build (`./mvnw package`) → file `target/kubernetes/kubernetes.yml` (và `.json`) được tạo ra.
- Có thể **deploy trực tiếp** lên cluster với `quarkus.kubernetes.deploy=true` (cần kubeconfig).

### Các nhóm cấu hình chính (trong code)

| Nhóm | Ví dụ property | Kết quả trong manifest |
| :--- | :--- | :--- |
| **Deployment cơ bản** | `quarkus.kubernetes.name`, `replicas`, `namespace` | Deployment name, replicas, namespace |
| **Env variables** | `quarkus.kubernetes.env.vars.*`, `env.secrets`, `env.configmaps`, `env.mapping.*` | `env` / `envFrom` trong container |
| **ConfigMap/Secret** | `quarkus.kubernetes.config-maps`, `secrets`, `app-config-map`, `app-secret` | Mount hoặc env từ ConfigMap/Secret |
| **Probes** | `quarkus.kubernetes.liveness-probe.*`, `readiness-probe.*`, `startup-probe.*` | Liveness/Readiness/Startup probe |
| **Resources** | `quarkus.kubernetes.resources.requests.*`, `limits.*` | CPU/Memory requests & limits |
| **HPA** | `quarkus.kubernetes.autoscaling.*` | HorizontalPodAutoscaler |
| **Labels/Annotations** | `quarkus.kubernetes.labels.*`, `annotations.*` | metadata.labels, metadata.annotations |
| **Ingress** | `quarkus.kubernetes.ingress.expose`, `host`, `path` | Ingress resource |

### Ví dụ tổng hợp (toàn bộ trong application.properties)

```properties
# === Deployment ===
quarkus.kubernetes.name=my-app
quarkus.kubernetes.namespace=production
quarkus.kubernetes.replicas=2

# === Env: key/value ===
quarkus.kubernetes.env.vars.app-env=prod

# === Env: lấy từ Secret (từng key) ===
quarkus.kubernetes.env.mapping.database-username.from-secret=db-secret
quarkus.kubernetes.env.mapping.database-username.with-key=username
quarkus.kubernetes.env.mapping.database-password.from-secret=db-secret
quarkus.kubernetes.env.mapping.database-password.with-key=password

# === Env: lấy từ ConfigMap (từng key) ===
quarkus.kubernetes.env.mapping.app-host.from-configmap=app-config
quarkus.kubernetes.env.mapping.app-host.with-key=host

# === Dùng ConfigMap/Secret làm application config (mount volume + SMALLRYE_CONFIG_LOCATIONS) ===
quarkus.kubernetes.app-config-map=app-config
quarkus.kubernetes.app-secret=db-secret

# === Probes, Resources, HPA (xem các section bên dưới) ===
quarkus.kubernetes.liveness-probe.http-action-path=/q/health/live
quarkus.kubernetes.readiness-probe.http-action-path=/q/health/ready
quarkus.kubernetes.resources.requests.memory=128Mi
quarkus.kubernetes.resources.limits.memory=256Mi
quarkus.kubernetes.autoscaling.max-replicas=10
quarkus.kubernetes.autoscaling.min-replicas=2
quarkus.kubernetes.autoscaling.cpu-target-utilization=70

# === Labels / Annotations (tùy chỉnh) ===
quarkus.kubernetes.labels.team=backend
quarkus.kubernetes.annotations."app.quarkus.io/owner"=platform

# === GitOps: manifest không đổi mỗi lần build (bỏ commit-id, build-timestamp) ===
quarkus.kubernetes.idempotent=true
```

**Kết luận**: Toàn bộ cấu hình K8s có thể nằm trong **application.properties** (trong code/project); manifest chỉ là output được generate.

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

## Kubernetes Config – Đọc ConfigMap/Secret từ API

Ngoài việc **generate** manifest, Quarkus còn có extension **quarkus-kubernetes-config** cho phép ứng dụng **đọc ConfigMap và Secret trực tiếp từ Kubernetes API** lúc runtime và dùng làm **config source** (override `application.properties`). **Không cần mount** ConfigMap/Secret vào Pod; app gọi API server để lấy nội dung.

### Khi nào dùng

- ConfigMap/Secret đã có sẵn trên cluster (ví dụ do operator hoặc Helm tạo).
- Muốn app **tự lấy config từ K8s** mà không đổi Deployment (không thêm env/volume).
- Ưu tiên config từ K8s cao hơn `application.properties` (nhưng thấp hơn env vars và system properties).

### Dependency

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-kubernetes-config</artifactId>
</dependency>
```

Extension này dùng **Kubernetes Client** (gọi API server). Khi dùng cùng **quarkus-kubernetes**, Quarkus tự generate RBAC (Role/RoleBinding) để Pod đọc ConfigMap; nếu cần đọc **Secret** thì phải bật thêm (xem bên dưới).

### Cấu hình cơ bản

```properties
# Bật extension (mặc định tắt để tránh gọi API khi không chạy trong K8s)
%prod.quarkus.kubernetes-config.enabled=true

# ConfigMap/Secret dùng làm config source (theo thứ tự ưu tiên: sau cao hơn trước)
quarkus.kubernetes-config.config-maps=app-config,feature-flags
quarkus.kubernetes-config.secrets=postgresql

# Namespace (mặc định: namespace của Pod)
quarkus.kubernetes-config.namespace=production

# Đọc Secret cần bật và generate Role/RoleBinding
%prod.quarkus.kubernetes-config.secrets.enabled=true
```

### Định dạng ConfigMap/Secret

- **Literal**: key/value thường (mỗi key → một config property).
- **File**: ConfigMap/Secret tạo từ file `application.properties` hoặc `application.yaml` → nội dung file được parse làm config.

### Thứ tự ưu tiên config

1. Env vars / System properties (cao nhất)
2. ConfigMap/Secret từ **kubernetes-config** (override application.properties)
3. application.properties / application.yaml (thấp nhất trong số này)

Giữa nhiều ConfigMap (hoặc nhiều Secret): cái khai báo **sau** trong list có ưu tiên cao hơn. Secret luôn override ConfigMap.

### Ví dụ: Datasource từ Secret trên K8s

PostgreSQL được deploy trên K8s và tạo Secret `postgresql` với các key `database-name`, `database-user`, `database-password`. Ứng dụng Quarkus đọc Secret này làm config:

```properties
%prod.quarkus.kubernetes-config.enabled=true
%prod.quarkus.kubernetes-config.secrets.enabled=true
quarkus.kubernetes-config.secrets=postgresql

%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://postgres-svc:5432/${database-name}
%prod.quarkus.datasource.username=${database-user}
%prod.quarkus.datasource.password=${database-password}
```

`${database-name}`, `${database-user}`, `${database-password}` sẽ được thay bằng giá trị lấy từ Secret `postgresql` qua Kubernetes API.

### Lưu ý

- **RBAC**: ServiceAccount của Pod cần quyền đọc ConfigMap/Secret. Dùng chung với extension **quarkus-kubernetes** thì Role/RoleBinding được generate sẵn; nếu chỉ dùng **kubernetes-config** thì phải tự tạo Role/RoleBinding.
- **Namespace**: ConfigMap/Secret phải ở cùng namespace với app (hoặc set `quarkus.kubernetes-config.namespace`).
- **Fail on missing**: Mặc định app không start nếu không tìm thấy ConfigMap/Secret đã khai báo. Có thể tắt: `quarkus.kubernetes-config.fail-on-missing-config=false`.

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

Quarkus cho phép **khai báo trong application.properties** cách inject ConfigMap/Secret vào Pod (env hoặc volume). Manifest được **generate tự động** khi build.

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
  APP_ENV: prod
```

### Cách 1: Toàn bộ ConfigMap/Secret làm env (envFrom)

Mọi key trong ConfigMap (hoặc Secret) thành biến môi trường trong container. Tên key giữ nguyên (thường uppercase khi dùng env).

```properties
# Tất cả key trong ConfigMap → env
quarkus.kubernetes.env.configmaps=app-config,feature-flags

# Tất cả key trong Secret → env
quarkus.kubernetes.env.secrets=db-secret
```

Manifest generate sẽ có:

```yaml
envFrom:
  - configMapRef:
      name: app-config
  - secretRef:
      name: db-secret
```

### Cách 2: Map từng key từ Secret/ConfigMap sang env (env.mapping)

Chỉ lấy một số key cụ thể, đặt tên env tùy ý (Quarkus chuyển thành UPPER_SNAKE_CASE).

```properties
# Lấy key "username" từ Secret "db-secret" → env DATABASE_USER
quarkus.kubernetes.env.mapping.database-user.from-secret=db-secret
quarkus.kubernetes.env.mapping.database-user.with-key=username

quarkus.kubernetes.env.mapping.database-password.from-secret=db-secret
quarkus.kubernetes.env.mapping.database-password.with-key=password

# Lấy key "host" từ ConfigMap "app-config" → env APP_HOST
quarkus.kubernetes.env.mapping.app-host.from-configmap=app-config
quarkus.kubernetes.env.mapping.app-host.with-key=host
```

Manifest generate sẽ có:

```yaml
env:
  - name: DATABASE_USER
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: username
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
  - name: APP_HOST
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: host
```

Trong app, dùng `@ConfigProperty("database-user")` hoặc biến môi trường `DATABASE_USER` (tùy convention).

### Cách 3: Dùng ConfigMap/Secret làm application config (mount + SMALLRYE_CONFIG_LOCATIONS)

Khi ConfigMap/Secret chứa file dạng **application.properties** (hoặc YAML), có thể mount vào Pod và cho Quarkus đọc như một **config source**. Quarkus cung cấp cấu hình một bước:

```properties
# ConfigMap "app-config" chứa application.properties → mount vào /mnt/app-config-map
# và set SMALLRYE_CONFIG_LOCATIONS tương ứng
quarkus.kubernetes.app-config-map=app-config

# Secret "db-secret" chứa config nhạy cảm → mount vào /mnt/app-secret
quarkus.kubernetes.app-secret=db-secret
```

Khi build, manifest sẽ có volume + volumeMount + env `SMALLRYE_CONFIG_LOCATIONS` trỏ tới đường dẫn mount. App đọc config từ đó như từ file.

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

Trong Quarkus, dùng một trong các cách trên (env.secrets, env.mapping.*.from-secret, app-secret). Ứng dụng tham chiếu qua biến môi trường hoặc `@ConfigProperty`:

```properties
# Ví dụ app dùng env từ Secret (đã map qua env.mapping)
quarkus.datasource.username=${DATABASE_USER}
quarkus.datasource.password=${DATABASE_PASSWORD}
```

### Tóm tắt: Config trong code cho ConfigMap/Secret

| Mục đích | Property | Kết quả |
| :--- | :--- | :--- |
| Toàn bộ ConfigMap → env | `quarkus.kubernetes.env.configmaps=name1,name2` | envFrom.configMapRef |
| Toàn bộ Secret → env | `quarkus.kubernetes.env.secrets=name1,name2` | envFrom.secretRef |
| Từng key Secret → env | `env.mapping.xyz.from-secret=name` + `with-key=key` | env[].valueFrom.secretKeyRef |
| Từng key ConfigMap → env | `env.mapping.xyz.from-configmap=name` + `with-key=key` | env[].valueFrom.configMapKeyRef |
| ConfigMap làm app config | `quarkus.kubernetes.app-config-map=name` | Volume + SMALLRYE_CONFIG_LOCATIONS |
| Secret làm app config | `quarkus.kubernetes.app-secret=name` | Volume + SMALLRYE_CONFIG_LOCATIONS |

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

### Q4: Cấu hình K8s trong code là gì? Có cần viết YAML không?

- **Trong code** ở đây nghĩa là cấu hình trong **application.properties** (và build-time config) của project. Bạn không cần viết file `deployment.yaml` tay.
- Mọi thứ (tên Deployment, replicas, env, ref tới ConfigMap/Secret, probes, resources, HPA, …) khai báo qua `quarkus.kubernetes.*` → khi build, Quarkus generate file `target/kubernetes/kubernetes.yml`. Có thể dùng file đó để `kubectl apply` hoặc dùng `quarkus.kubernetes.deploy=true` để deploy thẳng.

### Q5: quarkus-kubernetes-config khác gì quarkus-kubernetes?

- **quarkus-kubernetes**: Generate manifest (Deployment, Service, env, volume, …) và có thể deploy. ConfigMap/Secret được **tham chiếu** trong manifest (mount hoặc env).
- **quarkus-kubernetes-config**: Ứng dụng **gọi Kubernetes API** lúc runtime để **đọc nội dung** ConfigMap/Secret và dùng làm config source (override application.properties). Không cần mount; hữu ích khi config đã nằm sẵn trên cluster.

---

## Tổng kết

- **K8s config trong code**: Toàn bộ cấu hình Kubernetes (Deployment, env, ConfigMap/Secret, probes, HPA, …) có thể đặt trong **application.properties** qua `quarkus.kubernetes.*`; manifest được generate lúc build.
- **Manifests**: Quarkus Kubernetes extension (Dekorate) sinh Deployment, Service, env, volumes, (ConfigMap/Secret ref, HPA) theo config.
- **Kubernetes Config**: Extension **quarkus-kubernetes-config** cho phép app **đọc ConfigMap/Secret từ Kubernetes API** làm config source (không cần mount).
- **Probes**: Liveness / Readiness / Startup trỏ tới `/q/health/*`; cấu hình initial-delay, period, failure-threshold.
- **ConfigMaps & Secrets**: envFrom, env.mapping (from-secret / from-configmap, with-key), hoặc app-config-map / app-secret (mount làm application config).
- **Resources**: Set requests/limits CPU và memory phù hợp JVM/Native.
- **HPA**: Min/max replicas và target CPU utilization; cần metrics-server.
