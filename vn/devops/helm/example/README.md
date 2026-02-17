# Example — Helm chart mẫu

Chart đơn giản: Deployment dùng values (replicaCount, image). Chạy được với cluster Kubernetes.

## Chạy

```bash
helm install demo . --dry-run --debug   # xem manifest
helm install demo .                     # cài lên cluster
helm list
helm uninstall demo
```

Đọc kèm [../README.md](../README.md) và các file trong devops/helm.
