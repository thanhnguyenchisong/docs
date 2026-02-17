## Phần 2: Build, push, và deploy app

Mục tiêu: build ảnh service Java, push đến registry, cấu hình manifests, và roll out an toàn.

### 1) Build và push ảnh
```bash
export REGISTRY=thanhncs              # thay thế bằng của bạn
export IMAGE=$REGISTRY/thanhdev:latest  # hoặc sử dụng commit tag

docker build -t "$IMAGE" .
docker push "$IMAGE"
```

### 2) Cập nhật manifests
- Edit `k8s/app.yaml` → đặt `image: $IMAGE`.
- Giữ probes, requests/limits, và Prometheus annotations.
- Apply:
```bash
kubectl apply -f k8s/app.yaml
```

### 3) Image pull secrets (nếu private registry)
```bash
kubectl -n perf create secret docker-registry regcred \
  --docker-server=$REGISTRY --docker-username=<user> --docker-password=<pwd>
# Patch deployment để sử dụng nó:
kubectl -n perf patch deploy perf-app -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"regcred"}]}}}}'
```

### 4) Config và secrets
- Sử dụng ConfigMap cho non-sensitive settings, Secret cho credentials.
- Ví dụ (optional):
```yaml
apiVersion: v1
kind: ConfigMap
metadata: {name: perf-app-config, namespace: perf}
data:
  APP_PROFILE: "prod"
---
apiVersion: v1
kind: Secret
metadata: {name: perf-app-secret, namespace: perf}
type: Opaque
stringData:
  DB_PASSWORD: "change-me"
```
- Mount dưới dạng env:
```yaml
        envFrom:
          - configMapRef: {name: perf-app-config}
          - secretRef: {name: perf-app-secret}
```

### 5) Expose service
- Đã là ClusterIP (`perf-app`). Để reach externally, chọn một:
  - Port-forward: `kubectl -n perf port-forward svc/perf-app 18080:80`
  - LoadBalancer Service:
    ```yaml
    kind: Service
    apiVersion: v1
    metadata: {name: perf-app-lb, namespace: perf}
    spec:
      type: LoadBalancer
      selector: {app: perf-app}
      ports:
        - port: 80
          targetPort: 8080
    ```
  - Ingress (cần ingress controller):
    ```yaml
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata: {name: perf-app, namespace: perf}
    spec:
      rules:
        - host: perf.example.com
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: perf-app
                    port: {number: 80}
    ```

### 6) Rollouts và verification
- Bắt đầu rollout: `kubectl -n perf rollout restart deploy/perf-app`
- Status: `kubectl -n perf rollout status deploy/perf-app`
- Describe: `kubectl -n perf describe deploy/perf-app`
- Pods: `kubectl -n perf get pods -l app=perf-app -o wide`
- Logs (pod mới nhất): `kubectl -n perf logs -l app=perf-app --max-log-requests=1`
- Quick check: `kubectl -n perf port-forward svc/perf-app 18080:80 && curl "http://localhost:18080/work?n=20000"`

### 7) Rollback
```bash
kubectl -n perf rollout undo deploy/perf-app
```

### 8) Promote với tags
- Build với commit tag: `IMAGE=$REGISTRY/thanhdev:$(git rev-parse --short HEAD)`
- Cập nhật manifest qua kustomize/Helm hoặc `kubectl set image deploy/perf-app perf-app=$IMAGE`
- Giữ `latest` chỉ cho dev; sử dụng immutable tags cho staging/prod.

Tiếp theo: xem Phần 3 cho observability (Prometheus/Grafana/logs/traces).