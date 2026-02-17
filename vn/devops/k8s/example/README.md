# Example — Kubernetes manifest mẫu

Deployment + Service dùng image `nginx:alpine`. Chạy được với cluster cục bộ (minikube, kind, k3s).

## Chạy

```bash
# Cần cluster đã start, ví dụ: minikube start
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get svc
kubectl port-forward svc/demo-svc 8080:80
# Mở http://localhost:8080
```

Đọc kèm [../README.md](../README.md) và các file trong devops/k8s.
