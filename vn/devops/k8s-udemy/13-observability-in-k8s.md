# Observability trong Kubernetes

## 1. Tổng quan về Observability

Observability trong Kubernetes bao gồm 3 trụ cột chính:

- **Logging**: Thu thập và phân tích logs từ applications và infrastructure
- **Monitoring**: Thu thập metrics và alerts về performance và health
- **Tracing**: Theo dõi requests qua các services (distributed tracing)

### 1.1. Tại sao Observability quan trọng?

- **Debugging**: Nhanh chóng tìm và fix issues
- **Performance**: Identify bottlenecks và optimize
- **Reliability**: Proactive monitoring để prevent failures
- **Compliance**: Audit logs và compliance requirements
- **Cost optimization**: Monitor resource usage

### 1.2. Observability Stack trong Kubernetes

```
┌─────────────────────────────────────────┐
│         Visualization Layer             │
│  (Grafana, Kibana, Jaeger UI)          │
├─────────────────────────────────────────┤
│         Collection Layer                │
│  (Prometheus, Fluentd, Jaeger)         │
├─────────────────────────────────────────┤
│         Application Layer               │
│  (Metrics, Logs, Traces)                │
└─────────────────────────────────────────┘
```

## 2. Health Checks và Probes

Kubernetes cung cấp 3 loại probes để monitor container health:

- **Liveness Probe**: Container có đang chạy không?
- **Readiness Probe**: Container có sẵn sàng nhận traffic không?
- **Startup Probe**: Container đã start chưa?

### 2.1. Liveness Probe

Liveness probe kiểm tra container có đang chạy không. Nếu fail, container sẽ bị restart.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-example
spec:
  containers:
  - name: app
    image: my-app:latest
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 60  # Đợi 60s trước khi check lần đầu
      periodSeconds: 10        # Check mỗi 10s
      timeoutSeconds: 5        # Timeout 5s
      failureThreshold: 3      # Restart sau 3 lần fail liên tiếp
      successThreshold: 1       # Coi là healthy sau 1 lần success
```

**Probe types:**

- **httpGet**: HTTP GET request
- **tcpSocket**: TCP connection check
- **exec**: Execute command

**Ví dụ các loại probes:**

```yaml
# HTTP GET probe
livenessProbe:
  httpGet:
    path: /health
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: value

# TCP Socket probe
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

# Exec probe
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 2.2. Readiness Probe

Readiness probe kiểm tra container có sẵn sàng nhận traffic không. Nếu fail, pod sẽ bị remove khỏi Service endpoints.

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30  # Đợi 30s trước khi check
  periodSeconds: 5          # Check mỗi 5s
  timeoutSeconds: 3         # Timeout 3s
  failureThreshold: 3        # Mark unready sau 3 lần fail
  successThreshold: 1       # Mark ready sau 1 lần success
```

**Use cases:**
- Database connections chưa ready
- External dependencies chưa available
- Application đang loading data

### 2.3. Startup Probe

Startup probe cho phép slow-starting containers có thêm thời gian. Ngăn liveness probe kill container trong quá trình startup.

```yaml
startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 10   # Đợi 10s trước khi check
  periodSeconds: 10         # Check mỗi 10s
  timeoutSeconds: 3         # Timeout 3s
  failureThreshold: 30      # Cho phép 30 lần fail (5 phút total)
  successThreshold: 1       # Coi là started sau 1 lần success
```

**Use cases:**
- Applications có startup time dài
- Database migrations trong startup
- Loading large datasets

### 2.4. Best Practices cho Probes

- **Liveness**: Check core functionality, không check dependencies
- **Readiness**: Check dependencies và external services
- **Startup**: Sử dụng cho slow-starting apps
- **Timeouts**: Set timeout phù hợp với response time
- **Periods**: Balance giữa responsiveness và load
- **Failure thresholds**: Tránh false positives

## 3. Logging trong Kubernetes

### 3.1. Kubernetes Logging Architecture

```
┌─────────────┐
│   Pods      │
│  (stdout)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Kubelet    │
│  (log files)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Log Agent   │
│ (Fluentd)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Log Storage │
│ (Elastic)   │
└─────────────┘
```

### 3.2. Xem Logs với kubectl

```bash
# Xem logs của pod
kubectl logs my-pod

# Xem logs của container cụ thể trong pod
kubectl logs my-pod -c container-name

# Follow logs (tail -f)
kubectl logs -f my-pod

# Xem logs của tất cả pods với label
kubectl logs -l app=my-app

# Xem logs với timestamp
kubectl logs my-pod --timestamps

# Xem logs từ thời điểm cụ thể
kubectl logs my-pod --since=1h
kubectl logs my-pod --since-time=2024-01-01T00:00:00Z

# Xem logs của previous container (nếu container đã restart)
kubectl logs my-pod --previous

# Xem logs của deployment
kubectl logs deployment/my-app

# Xem logs của tất cả pods trong namespace
kubectl logs --all-namespaces -l app=my-app
```

### 3.3. Logging với Sidecar Pattern

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging-sidecar
spec:
  containers:
  # Main application
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
  
  # Logging sidecar
  - name: log-collector
    image: fluent/fluent-bit:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
    env:
    - name: FLUENT_BIT_OUTPUT
      value: "elasticsearch"
    - name: ELASTICSEARCH_HOST
      value: "elasticsearch-service:9200"
  
  volumes:
  - name: logs
    emptyDir: {}
```

### 3.4. Centralized Logging với Fluentd/Fluent Bit

**Fluentd DaemonSet:**

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch-service:9200"
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### 3.5. Log Aggregation với ELK Stack

**Elasticsearch:**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  serviceName: elasticsearch
  replicas: 3
  template:
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
        env:
        - name: discovery.type
          value: "single-node"
        ports:
        - containerPort: 9200
```

**Kibana:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: kibana
        image: docker.elastic.co/kibana/kibana:8.11.0
        env:
        - name: ELASTICSEARCH_HOSTS
          value: "http://elasticsearch-service:9200"
        ports:
        - containerPort: 5601
```

## 4. Monitoring với Prometheus

### 4.1. Prometheus Architecture

```
┌─────────────┐
│ Applications│
│  (Metrics)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Prometheus  │
│  (Scrape)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Grafana    │
│(Visualize)  │
└─────────────┘
```

### 4.2. Expose Metrics từ Application

**Spring Boot Actuator:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-metrics
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/actuator/prometheus"
spec:
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
    env:
    - name: MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
      value: "health,info,prometheus"
```

### 4.3. Prometheus Configuration

**Prometheus ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
    # Kubernetes API server
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: default;kubernetes;https
    
    # Kubernetes pods
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

### 4.4. ServiceMonitor (Prometheus Operator)

ServiceMonitor là CRD của Prometheus Operator để tự động discover và scrape metrics:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: bottleneck-resolve
  namespace: bottleneck-resolve
  labels:
    app: bottleneck-resolve
    release: prometheus
spec:
  selector:
    matchLabels:
      app: bottleneck-resolve
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
    scrapeTimeout: 10s
    relabelings:
    - sourceLabels: [__meta_kubernetes_pod_name]
      targetLabel: pod
    - sourceLabels: [__meta_kubernetes_namespace]
      targetLabel: namespace
```

### 4.5. Prometheus Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
        - '--storage.tsdb.path=/prometheus'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

## 5. Metrics và Instrumentation

### 5.1. Types of Metrics

- **Counter**: Tăng dần (requests, errors)
- **Gauge**: Giá trị có thể tăng/giảm (memory, CPU)
- **Histogram**: Phân phối giá trị (response time)
- **Summary**: Tương tự histogram nhưng với quantiles

### 5.2. Application Metrics

**Spring Boot Metrics:**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: "health,info,prometheus,metrics"
  metrics:
    tags:
      application: bottleneck-resolve
    export:
      prometheus:
        enabled: true
```

**Custom Metrics:**

```java
// Counter
Counter.builder("http_requests_total")
    .tag("method", "GET")
    .tag("status", "200")
    .register(meterRegistry)
    .increment();

// Gauge
Gauge.builder("memory_usage_bytes", this, obj -> obj.getMemoryUsage())
    .register(meterRegistry);

// Timer
Timer.Sample sample = Timer.start(meterRegistry);
// ... do work ...
sample.stop(Timer.builder("request_duration_seconds").register(meterRegistry));
```

### 5.3. Kubernetes Metrics

**Node Metrics:**

```bash
# Xem node metrics
kubectl top nodes

# Xem pod metrics
kubectl top pods

# Xem metrics với labels
kubectl top pods -l app=my-app
```

**Custom Resource Metrics:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
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

## 6. Tracing (Distributed Tracing)

### 6.1. OpenTelemetry

OpenTelemetry là standard cho distributed tracing:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-tracing
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: OTEL_SERVICE_NAME
      value: "my-app"
    - name: OTEL_EXPORTER_OTLP_ENDPOINT
      value: "http://jaeger-collector:4317"
    - name: OTEL_RESOURCE_ATTRIBUTES
      value: "service.name=my-app,service.version=1.0.0"
```

### 6.2. Jaeger Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:latest
        ports:
        - containerPort: 16686  # UI
        - containerPort: 4317   # OTLP gRPC
        - containerPort: 4318   # OTLP HTTP
        env:
        - name: COLLECTOR_OTLP_ENABLED
          value: "true"
```

### 6.3. Service Mesh Tracing

**Istio Tracing:**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-app
spec:
  hosts:
  - my-app
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: my-app
        subset: v1
    fault:
      delay:
        percentage:
          value: 10
        fixedDelay: 5s
```

## 7. Visualization với Grafana

### 7.1. Grafana Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secret
              key: admin-password
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
      volumes:
      - name: grafana-storage
        persistentVolumeClaim:
          claimName: grafana-storage
```

### 7.2. Grafana Data Sources

**Prometheus Data Source:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
data:
  prometheus.yaml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      access: proxy
      url: http://prometheus-service:9090
      isDefault: true
```

### 7.3. Grafana Dashboards

**Kubernetes Dashboard:**

```json
{
  "dashboard": {
    "title": "Kubernetes Pod Metrics",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total[5m])",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "container_memory_usage_bytes",
            "legendFormat": "{{pod}}"
          }
        ]
      }
    ]
  }
}
```

## 8. Alerting

### 8.1. Prometheus Alerting Rules

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-alerts
data:
  alerts.yml: |
    groups:
    - name: kubernetes
      rules:
      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "Pod {{ $labels.pod }} has high CPU usage"
      
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Pod {{ $labels.pod }} is using {{ $value | humanizePercentage }} memory"
```

### 8.2. Alertmanager

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: alertmanager
spec:
  replicas: 1
  selector:
    matchLabels:
      app: alertmanager
  template:
    metadata:
      labels:
        app: alertmanager
    spec:
      containers:
      - name: alertmanager
        image: prom/alertmanager:latest
        ports:
        - containerPort: 9093
        volumeMounts:
        - name: config
          mountPath: /etc/alertmanager
      volumes:
      - name: config
        configMap:
          name: alertmanager-config
```

## 9. Thực hành

### 9.1. Setup Health Checks

```bash
# Tạo namespace
kubectl create namespace observability-test

# Tạo Pod với health checks
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: app-with-probes
  namespace: observability-test
spec:
  containers:
  - name: app
    image: nginx:latest
    ports:
    - containerPort: 80
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    startupProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 10
      periodSeconds: 10
      failureThreshold: 30
EOF

# Kiểm tra probes
kubectl describe pod app-with-probes -n observability-test | grep -A 10 "Liveness\|Readiness\|Startup"
```

### 9.2. Xem và Export Logs

```bash
# Xem logs
kubectl logs app-with-probes -n observability-test

# Follow logs
kubectl logs -f app-with-probes -n observability-test

# Export logs to file
kubectl logs app-with-probes -n observability-test > app.log

# Xem logs với timestamp
kubectl logs app-with-probes -n observability-test --timestamps

# Xem logs từ thời điểm cụ thể
kubectl logs app-with-probes -n observability-test --since=1h
```

### 9.3. Setup Prometheus

```bash
# Tạo Prometheus ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
EOF

# Tạo Prometheus Deployment
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        args:
        - '--config.file=/etc/prometheus/prometheus.yml'
      volumes:
      - name: config
        configMap:
          name: prometheus-config
EOF

# Expose Prometheus
kubectl expose deployment prometheus --port=9090 --type=NodePort
```

### 9.4. Setup Grafana

```bash
# Tạo Grafana Deployment
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          value: "admin"
EOF

# Expose Grafana
kubectl expose deployment grafana --port=3000 --type=NodePort

# Access Grafana
# Username: admin
# Password: admin
```

## 10. Best Practices

### 10.1. Logging Best Practices

- **Structured logging**: Sử dụng JSON format
- **Log levels**: Sử dụng appropriate log levels (DEBUG, INFO, WARN, ERROR)
- **Context**: Include context (request ID, user ID, etc.)
- **Sensitive data**: Không log passwords, tokens, PII
- **Centralized**: Ship logs đến centralized system
- **Retention**: Set retention policies

### 10.2. Monitoring Best Practices

- **Key metrics**: Monitor key business và technical metrics
- **SLIs/SLOs**: Define Service Level Indicators và Objectives
- **Alerting**: Set up meaningful alerts với proper thresholds
- **Dashboards**: Create dashboards cho different audiences
- **Cardinality**: Tránh high cardinality labels
- **Sampling**: Use sampling cho high-volume metrics

### 10.3. Health Checks Best Practices

- **Liveness**: Check core functionality, không check dependencies
- **Readiness**: Check dependencies và external services
- **Startup**: Sử dụng cho slow-starting applications
- **Timeouts**: Set timeouts phù hợp
- **Periods**: Balance giữa responsiveness và load
- **Failure thresholds**: Tránh false positives

### 10.4. Tracing Best Practices

- **Sampling**: Use sampling để giảm overhead
- **Context propagation**: Propagate trace context qua services
- **Spans**: Create meaningful spans
- **Tags**: Add relevant tags để filter và search
- **Error tracking**: Track errors trong traces

## 11. Troubleshooting

### 11.1. Pod không start

```bash
# Xem pod status
kubectl get pods

# Xem events
kubectl describe pod my-pod

# Xem logs của init containers
kubectl logs my-pod -c init-container-name

# Xem previous container logs
kubectl logs my-pod --previous
```

### 11.2. Health checks fail

```bash
# Test health endpoint manually
kubectl exec -it my-pod -- curl http://localhost:8080/health

# Xem probe configuration
kubectl get pod my-pod -o yaml | grep -A 10 "livenessProbe\|readinessProbe"

# Check probe timing
kubectl describe pod my-pod | grep -A 5 "Liveness\|Readiness"
```

### 11.3. Metrics không được scrape

```bash
# Kiểm tra ServiceMonitor
kubectl get servicemonitor

# Kiểm tra Service labels
kubectl get service my-service --show-labels

# Test metrics endpoint
kubectl port-forward svc/my-service 8080:80
curl http://localhost:8080/actuator/prometheus

# Kiểm tra Prometheus targets
# Access Prometheus UI và check Targets page
```

### 11.4. Logs không được collect

```bash
# Kiểm tra Fluentd/Fluent Bit
kubectl get pods -n kube-system | grep fluent

# Xem Fluentd logs
kubectl logs -n kube-system -l app=fluentd

# Kiểm tra Elasticsearch
kubectl get pods -l app=elasticsearch

# Test log shipping
kubectl exec -it my-pod -- echo "test log" >> /var/log/app.log
```

## 12. Cleanup

```bash
# Xóa namespace
kubectl delete namespace observability-test

# Xóa Prometheus
kubectl delete deployment prometheus
kubectl delete configmap prometheus-config

# Xóa Grafana
kubectl delete deployment grafana

# Xóa ServiceMonitor
kubectl delete servicemonitor bottleneck-resolve
```

## 13. Tóm tắt

- **Observability**: 3 trụ cột chính - Logging, Monitoring, Tracing
  - Logging: Thu thập và phân tích logs
  - Monitoring: Metrics và alerts
  - Tracing: Distributed tracing

- **Health Checks**: 3 loại probes
  - Liveness: Container có đang chạy không?
  - Readiness: Container có sẵn sàng nhận traffic không?
  - Startup: Container đã start chưa?

- **Logging**:
  - kubectl logs để xem logs
  - Sidecar pattern cho log collection
  - Centralized logging với ELK stack

- **Monitoring**:
  - Prometheus để collect metrics
  - ServiceMonitor để auto-discover
  - Grafana để visualize

- **Metrics**:
  - Counter, Gauge, Histogram, Summary
  - Application metrics
  - Kubernetes metrics

- **Tracing**:
  - OpenTelemetry standard
  - Jaeger cho distributed tracing
  - Service mesh integration

- **Best Practices**:
  - Structured logging
  - Key metrics monitoring
  - Appropriate health checks
  - Sampling cho tracing
  - Meaningful alerts