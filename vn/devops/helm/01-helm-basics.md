## Phần 1: Cơ bản về Helm

### Helm là gì
- Package manager cho Kubernetes: đóng gói manifests thành **charts** với releases có phiên bản.
- Tách riêng **templates** (manifests) khỏi **values** (config), cho phép deploys lặp lại.

### Cài đặt
- macOS: `brew install helm`
- Linux (script): `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash`
- Xác minh: `helm version`

### Lệnh cốt lõi (muscle memory)
```bash
helm repo add stable https://charts.helm.sh/stable   # thêm repo
helm repo update                                     # làm mới indexes
helm search repo nginx                               # tìm charts
helm pull bitnami/nginx --untar                       # tải chart
helm install myapp ./chart                            # cài đặt từ dir local
helm upgrade myapp ./chart -f values-prod.yaml        # nâng cấp với values
helm uninstall myapp                                  # xóa release
helm list                                             # liệt kê releases
helm status myapp                                     # trạng thái release
helm get values myapp -o yaml                         # hiển thị values đã render
helm template ./chart -f values.yaml                  # render cục bộ (không cluster)
```

### Cấu trúc chart (được tạo bởi `helm create mychart`)
```
mychart/
  Chart.yaml        # name, version, description, dependencies
  values.yaml       # default values
  templates/        # yaml templates (.tpl)
  charts/           # subcharts
  .helmignore       # files để ignore
```

### Thói quen render-first
- Sử dụng `helm template` để render manifests cục bộ trước khi cài đặt.
- Kết hợp với `kubectl apply -f -` cho dry-run trong pipelines: `helm template ... | kubectl apply --dry-run=client -f -`

### Repos và provenance
- Charts sống trong repos HTTP(S) (index.yaml). Thêm/xóa với `helm repo add|remove`.
- Cho nguồn đáng tin cậy, sử dụng ký chart (`helm show chart` để kiểm tra, `helm verify` với provenance).

### Bài tập sandbox nhanh
```bash
helm create demo
cd demo
helm template . | head -40            # kiểm tra manifests đã render
helm install demo .                   # cài đặt vào kube-context hiện tại
helm uninstall demo
```

Tiếp tục đến Phần 2 để tạo và cấu trúc charts cho ứng dụng thực.