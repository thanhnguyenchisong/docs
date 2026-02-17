## Phần 4: Release operations (install, upgrade, diff, rollback)

### Install / upgrade / rollback
```bash
# Install với values
helm install perf ./chart -f values.yaml

# Upgrade với overrides
helm upgrade perf ./chart -f values-prod.yaml --set image.tag=1.2.3

# Rollback về revision trước
helm rollback perf 1
```
- Kiểm tra history: `helm history perf`
- Status: `helm status perf`

### Diff trước khi apply (khuyến nghị)
- Plugin: `helm plugin install https://github.com/databus23/helm-diff`
```bash
helm diff upgrade perf ./chart -f values-prod.yaml
```

### Dry runs và kiểm tra render
```bash
helm upgrade --install perf ./chart -f values.yaml --dry-run
helm template ./chart -f values.yaml | kubeconform -strict   # validation schema
```

### Testing charts
- Helm test hooks (Job được tạo bởi chart):
```yaml
annotations:
  "helm.sh/hook": test
```
Chạy: `helm test perf`
- Cho app-level tests, ưu tiên external smoke tests (curl, scripts integration) sau install.

### Quản lý values per environment
- Giữ `values-dev.yaml`, `values-staging.yaml`, `values-prod.yaml`.
- Sử dụng `--set` chỉ cho small one-offs; ưu tiên files cho repeatability.
- Render để kiểm tra: `helm template ./chart -f values-prod.yaml | less`

### Gợi ý CI
- Các bước: lint → template → kubeconform → diff (đến cluster) → deploy on merge.
- Sử dụng immutable image tags; tránh `latest` trong CI/CD.
- Fail pipeline trên `helm lint` hoặc diff changes không an toàn (policy qua OPA/Gatekeeper/Kyverno nếu có sẵn).

### Cleanup
```bash
helm uninstall perf
# Xóa CRDs thủ công nếu chart đã cài đặt chúng và không dọn dẹp
```

Tiếp theo: Phần 5 bao gồm advanced patterns (subcharts, library charts, schema, security).