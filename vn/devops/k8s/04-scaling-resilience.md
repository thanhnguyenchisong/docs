## Phần 4: Scaling và resilience

Mục tiêu: giữ service responsive dưới load và resilient đối với failures/maintenance.

### 1) Requests/limits (tránh throttling, đảm bảo placement)
- Bắt đầu với: requests `cpu: 500m`, `memory: 512Mi`; limits `cpu: 1`, `memory: 1Gi` (xem `k8s/app.yaml`).
- Tune sử dụng `kubectl top pods` và Grafana CPU/memory panels.
- Tránh đặt CPU limits quá thấp (có thể gây throttling); giữ request ≈ typical steady-state.

### 2) Readiness/Liveness probes
- Đã có sẵn trên `/actuator/health`.
- Giữ readiness conservative để Pods enter endpoints chỉ khi ready; liveness cho stuck states.

### 3) Horizontal Pod Autoscaler (HPA)
Ví dụ (CPU-based):
```bash
kubectl -n perf autoscale deploy perf-app --cpu-percent=70 --min=3 --max=10
```
YAML version:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: perf-app, namespace: perf}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: perf-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```
- Cho RPS/latency-based HPA, expose custom metrics qua Prometheus Adapter.

### 4) Rollout strategy
- Sử dụng rolling update với small surge và zero unavailable, ví dụ:
```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
```
- Cho risky releases, làm canary (ví dụ: Argo Rollouts) hoặc manual staged rollout bằng cách scaling second Deployment.

### 5) Disruption và availability
- PodDisruptionBudget:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: {name: perf-app-pdb, namespace: perf}
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: perf-app
```
- Topology spread (giữ replicas across nodes/Zones):
```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: perf-app
```
- Anti-affinity để tránh same-node packing (optional):
```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values: [perf-app]
        topologyKey: kubernetes.io/hostname
```

### 6) Ingress/traffic patterns
- Ưu tiên Ingress/LoadBalancer cho user traffic; port-forward chỉ cho debugging.
- Common patterns:
  - **ClusterIP + Ingress**: Ingress terminates TLS và routes đến `perf-app` service (khuyến nghị).
  - **LoadBalancer service**: simplest external exposure khi ingress controller vắng mặt.
  - **Internal-only**: giữ ClusterIP và sử dụng port-forward hoặc private ingress class.
- NGINX Ingress example với TLS và path prefix:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: perf-app
  namespace: perf
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [perf.example.com]
      secretName: perf-tls
  rules:
    - host: perf.example.com
      http:
        paths:
          - path: /(.*)
            pathType: Prefix
            backend:
              service:
                name: perf-app
                port:
                  number: 80
```
- Canary via Ingress (concepts):
  - Duplicate service (ví dụ: `perf-app-canary`) và sử dụng weighted routing (available trong some ingress controllers như NGINX với annotations hoặc Istio/Traefik/NGINX Plus).
  - Alternatively, chạy hai Deployments đằng sau một Service và kiểm soát traffic với pod weights (service meshes) hoặc bằng cách scaling canary replicas nhỏ.
- Sticky sessions: tránh cho stateless services; nếu cần, NGINX cookie affinity: `nginx.ingress.kubernetes.io/affinity: "cookie"`.
- Rate limiting (edge protection): `nginx.ingress.kubernetes.io/limit-rps: "100"` (per client IP). Sử dụng WAF/edge cho stronger controls.
- Headers để preserve client info: đảm bảo ingress đặt `X-Forwarded-For`, `X-Forwarded-Proto`; Spring Boot có thể honor những cái này cho correct scheme/redirects.

### 7) Chaos và failure drills (optional nhưng valuable)
- Pod kill: `kubectl -n perf delete pod -l app=perf-app` (rollout nên heal).
- Node drain simulation: `kubectl drain <node> --ignore-daemonsets --delete-emptydir-data` (đảm bảo PDB được tôn trọng).
- Kiểm tra HPA scale back down và Prometheus/Grafana stay healthy.

Tiếp theo: Phần 5 tập trung vào performance testing và profiling trên K8s.