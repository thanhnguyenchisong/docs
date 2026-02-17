## Phần 3: Observability (metrics, logs, traces)

Mục tiêu: instrument và xem app trong Prometheus/Grafana, thu thập logs, và (optional) traces.

### 1) Metrics (Prometheus/Grafana)
- App đã expose Micrometer tại `/actuator/prometheus`.
- Service annotation trong `k8s/app.yaml`:
```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/path: "/actuator/prometheus"
    prometheus.io/port: "8080"
```
- Cài đặt kube-prometheus-stack (staging/prod-like):
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80
# Grafana: http://localhost:3000 (default admin/prom-operator, thay đổi nó)
```
- Useful dashboards:
  - Kubernetes / Compute Resources / Pod
  - JVM (Micrometer) dashboards
  - HTTP server metrics (Micrometer)

### 2) Logs
- Quick: `kubectl -n perf logs -l app=perf-app --tail=200`
- Centralized options:
  - Loki stack: `helm upgrade --install loki grafana/loki-stack -n monitoring`
  - EFK: fluent-bit → Elasticsearch/OpenSearch → Kibana
- Thêm correlation IDs trong app logs nếu có thể (qua servlet filter hoặc WebMvc config).

### 3) Traces (optional nhưng khuyến nghị)
- Chọn Otel Collector hoặc Tempo/Jaeger.
- Minimal Otel Collector example (values để adjust):
```yaml
receivers:
  otlp:
    protocols: {http: {}, grpc: {}}
exporters:
  logging: {}
  tempo: {endpoint: http://tempo:4317}  # ví dụ
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [tempo, logging]
```
- Instrument app với OpenTelemetry Java agent:
  - Thêm vào image và start với `-javaagent:/otel/javaagent.jar`
  - Đặt env: `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`

### 4) Alert seeds (điểm khởi đầu)
- Availability: `http_server_requests_seconds_count{status!~"5.."} < threshold`
- Latency: P95 `http_server_requests_seconds_bucket{}` hoặc `histogram_quantile`
- Error rate: tỷ lệ 5xx qua 5m
- JVM: CPU cao, heap > 85%, GC pause > threshold
- Pod health: restarts > 3 trong 10m, readiness failures

### 5) Fast checks trong debugging
```bash
kubectl -n perf top pods
kubectl -n perf describe pod <pod>
kubectl -n perf logs <pod>
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80
```

Tiếp theo: Phần 4 bao gồm scaling và resilience (HPA, rollouts, disruption budgets).