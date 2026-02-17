 #### Giai đoạn phân tích chi tiết:

    Chỉ đẩy workload vào 1 Pod → attach profiler → tìm bottleneck trong code.
 #### Giai đoạn mô phỏng production:
    Đẩy workload qua service (load balancer) để phân phối đều cho nhiều Pod.

    Dùng metrics/tracing để phát hiện Pod nào nóng → attach profiler vào Pod đó.
## Giải quyết bottleneck theo phong cách production trên Kubernetes

Hướng dẫn này mở rộng workflow cục bộ (JMeter + Async Profiler + Prometheus/Grafana) sang môi trường Kubernetes để bạn có thể tái tạo, phát hiện và giảm nhẹ bottleneck trong production hoặc cluster giống production.

### 1) Điều kiện tiên quyết

- Một container registry bạn có thể push đến (thay thế `REGISTRY` bên dưới).
- `kubectl` được cấu hình cho cluster đích; cluster có load-generator egress đến ứng dụng.
- Helm (cho Prometheus/Grafana) và JMeter được cài đặt cục bộ, hoặc sử dụng pod chạy JMeter.
- Bundle Async Profiler có sẵn cục bộ (sẽ được sao chép vào pod khi cần).

### 2) Xây dựng và publish ảnh

```bash
export REGISTRY=my-registry.example.com/myteam
export APP_IMG=$REGISTRY/performance-improve:$(git rev-parse --short HEAD)

docker build -t "$APP_IMG" .
docker push "$APP_IMG"
```

### 3) Manifests Kubernetes (Deployment + Service)

Lưu dưới dạng `k8s/app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: perf-app
  namespace: perf
spec:
  replicas: 3
  selector:
    matchLabels:
      app: perf-app
  template:
    metadata:
      labels:
        app: perf-app
    spec:
      containers:
        - name: perf-app
          image: REGISTRY/performance-improve:TAG
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: JAVA_TOOL_OPTIONS
              value: "-XX:+UseG1GC"
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1"
              memory: "1Gi"
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: perf-app
  namespace: perf
spec:
  selector:
    app: perf-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
```

Triển khai:

```bash
kubectl create namespace perf
kubectl apply -f k8s/app.yaml
```

Thay thế `REGISTRY/performance-improve:TAG` trước khi apply, hoặc template với kustomize/Helm.

### 4) Ngăn xếp quan sát (Prometheus + Grafana)

Tùy chọn A: cài đặt biểu đồ cộng đồng trong cùng cluster (phù hợp cho staging/prod-like):

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

Expose Grafana cục bộ:

```bash
kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80
# Grafana: http://localhost:3000 (admin/prom-operator mặc định; thay đổi nó)
```

Prometheus sẽ scrape `/actuator/prometheus` nếu `Service` có annotations đúng. Thêm vào service `perf-app` nếu cần:

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/path: "/actuator/prometheus"
    prometheus.io/port: "8080"
```

### 5) Tạo tải với JMeter trong cluster (headless)

Tạo pod runner đơn giản để traffic ở trong cluster/VPC (độ trễ thấp hơn và mạng thực tế hơn):

```bash
kubectl -n perf run jmeter --image=justb4/jmeter:5.6.3 --restart=Never --command -- sleep 3600
kubectl -n perf cp work-load.jmx jmeter:/tmp/work-load.jmx
kubectl -n perf exec -it jmeter -- jmeter -n -t /tmp/work-load.jmx \
  -JserverHost=perf-app.perf.svc.cluster.local \
  -JserverPort=80 \
  -Jn=20000 \
  -l /tmp/result.jtl -e -o /tmp/report
kubectl -n perf cp jmeter:/tmp/report ./report
```

Bạn cũng có thể chạy JMeter cục bộ đối với cluster ingress nếu độ trễ cross-VPC chấp nhận được.

### 6) Async Profiler trong Kubernetes (tùy chọn và lệnh)

Chọn tùy chọn phù hợp nhất với mô hình truy cập và quy tắc kiểm soát thay đổi của bạn.

**A) Sao chép profiler vào pod đang chạy (không thay đổi ảnh)**

- Một lần mỗi rollout:

```bash
POD=$(kubectl -n perf get pod -l app=perf-app -o jsonpath='{.items[0].metadata.name}')
kubectl -n perf cp /path/to/async-profiler "$POD":/tmp/async-profiler
```

- Tìm PID và profile (30s CPU):

```bash
kubectl -n perf exec -it "$POD" -- jcmd | grep performance-improve
kubectl -n perf exec "$POD" -- /tmp/async-profiler/profiler.sh \
  -d 30 -e cpu -f /tmp/flame.svg <PID>
kubectl -n perf cp "$POD":/tmp/flame.svg ./flame.svg
kubectl -n perf exec "$POD" -- rm /tmp/flame.svg
```

**B) Bake profiler vào ảnh ứng dụng**

- Thêm bundle dưới `/opt/async-profiler` trong `Dockerfile`.
- Chạy mà không cần sao chép:

```bash
kubectl -n perf exec "$POD" -- /opt/async-profiler/profiler.sh \
  -d 30 -e cpu -f /tmp/flame.svg <PID>
```

**C) Container tạm thời (giữ container chính không bị chạm; K8s ≥1.23)**

```bash
kubectl -n perf debug pod/"$POD" -c ap \
  --image=your-profiler-image --target=perf-app
# Bên trong container tạm thời:
jcmd | grep performance-improve
/opt/async-profiler/profiler.sh -d 30 -e cpu -f /tmp/flame.svg <PID>
# Sao chép ra từ tên pod chính:
kubectl -n perf cp "$POD":/tmp/flame.svg ./flame.svg
```

**D) Sidecar với chia sẻ namespace tiến trình (lặp lại được)**

- Đặt `shareProcessNamespace: true` trên pod spec.
- Chạy profiler từ sidecar đối với PID ứng dụng (cùng lệnh như trên).
- Tốt cho profiling định kỳ mà không chạm vào container chính.

**E) Pod helper + kubectl cp/exec**

- Chạy pod toolbox (ví dụ: `busybox`/`ubuntu`) trong cùng namespace.
- Sử dụng nó để sao chép profiler vào pod đích và exec các lệnh (giống tùy chọn A) mà không cài đặt tooling cục bộ.

**F) Attach cấp host (privileged/ops-only)**

- Từ node (SSH hoặc DaemonSet privileged), tìm PID container qua `crictl ps` hoặc `docker ps` + `nsenter`.
- Chạy `profiler.sh` từ host vào PID container. Chỉ sử dụng nếu `kubectl exec` bị hạn chế.

**Các loại event và nút điều khiển**

- `-e cpu` (mặc định, chi phí thấp nhất), `-e wall` (blocking/locks/I/O), `-e alloc` (hotspots alloc; chi phí cao hơn).
- Thời lượng: 15–60s điển hình; ngắn hơn trong prod.
- Trạng thái luồng: thêm `-t` với `-e wall` cho chi tiết blocking.
- Đầu ra: `-f /tmp/flame.svg` (SVG), hoặc `-o collapsed` cho stacks text.

**Liên kết với số liệu và tải**

- Căn chỉnh cửa sổ profile với thời gian spike Grafana.
- Nếu an toàn, kích hoạt tải (JMeter trong cluster) trong cửa sổ để có tín hiệu sạch.
- Profile một pod tại một thời điểm để giảm tác động.

### 7) Workflow điều tra bottleneck (theo phong cách prod)

1. **Phát hiện:** Theo dõi bảng điều khiển Grafana (độ trễ HTTP, thông lượng, CPU JVM, GC). Ghi chú cửa sổ spike chính xác.
2. **Tái tạo với tải:** Chạy JMeter đối với service/ingress với cùng tham số đã kích hoạt vấn đề.
3. **Chụp profile:** Kích hoạt Async Profiler trong cửa sổ spike; export `flame.svg`.
4. **Phân tích:** Xác định phương thức nóng hoặc stacks blocking; liên kết với thời gian Prometheus.
5. **Giảm nhẹ:** Áp dụng sửa code, cờ JVM, hoặc thay đổi K8s (ví dụ: tăng replicas, tune requests/limits, tăng heap nếu GC bound).
6. **Xác minh:** Triển khai ảnh mới, chạy lại JMeter, và so sánh cải thiện Grafana + flame graph.
7. **Ghi lại:** Giữ số liệu và flame graphs trước/sau trong runbook sự cố của bạn.

### 8) Mẹo vận hành

- Giữ requests/limits thực tế; phân bổ CPU thấp có thể ẩn regression code đằng sau throttling.
- Sử dụng HPA (CPU hoặc số liệu tùy chỉnh) sau khi bạn hiểu baseline steady-state.
- Ưu tiên profiling một pod tại một thời điểm để giảm thiểu tác động; tránh trong peak trừ khi cần thiết.
- Dọn dẹp artifacts profiler từ pods: `kubectl -n perf exec "$POD" -- rm /tmp/flame.svg`.
- Lưu trữ JTL và báo cáo được tạo trong bucket artifact để audit.