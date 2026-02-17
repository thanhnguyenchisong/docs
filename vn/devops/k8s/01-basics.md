## Phần 1: Cơ bản Kubernetes (crash start)

### Mental model
- **Node** chạy **Pods**; mỗi Pod có 1+ containers chia sẻ network + volumes.
- **Deployment** sở hữu ReplicaSets, giữ desired replica count.
- **Service** cung cấp stable virtual IP/DNS cho Pods; **ClusterIP** cho internal, **LoadBalancer/Ingress** cho external.
- **Requests/Limits** kiểm soát scheduling và throttling; right-sizing quan trọng cho performance tests.
- **ConfigMap/Secret** inject config; **Namespace** phân vùng resources.

### Tooling
- `kubectl` (CLI), `kubectx`/`kubens` optional, `kubectl krew top` cho plugins.
- Truy cập kubeconfig; đặt default namespace: `kubectl config set-context --current --namespace=perf`.

### Quickstart commands
```bash
# Lấy cluster + node info
kubectl cluster-info
kubectl get nodes -o wide

# Kiểm tra workloads
kubectl get ns
kubectl get pods -n perf -o wide
kubectl describe pod <pod> -n perf
kubectl logs <pod> -n perf

# Port-forward đến pod hoặc service
kubectl -n perf port-forward pod/<pod> 18080:8080
kubectl -n perf port-forward svc/perf-app 18080:80

# Exec vào container
kubectl -n perf exec -it <pod> -- /bin/sh

# Apply/delete manifests
kubectl apply -f k8s/app.yaml
kubectl delete -f k8s/app.yaml

# Top (yêu cầu metrics-server)
kubectl top pods -n perf
kubectl top nodes
```

### Minimal local loop
1) Build & push image: xem `02-deploy-app.md`.
2) Deploy: `kubectl apply -f k8s/app.yaml`.
3) Smoke test: `kubectl -n perf port-forward svc/perf-app 18080:80 && curl "http://localhost:18080/work?n=20000"`.
4) Kiểm tra logs + describe pod nếu failing.

### Anatomy của app manifest (k8s/app.yaml)
- Namespace `perf`
- Deployment `perf-app` (3 replicas, probes, requests/limits)
- Service `perf-app` (port 80 → pod 8080) với Prometheus scrape annotations

Di chuyển đến Phần 2 để build, push, và roll out images an toàn.