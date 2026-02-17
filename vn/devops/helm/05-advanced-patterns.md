## Phần 5: Patterns Helm nâng cao

### Subcharts vs library charts
- **Subcharts**: dependencies đã đóng gói (ví dụ: redis). Values sống dưới subchart key. Disable với `enabled: false`.
- **Library charts**: chia sẻ templates/helpers mà không tạo resources. Đặt `type: library` trong Chart.yaml; chart consumer `dependencies` imports helpers.

### Global values
- Sử dụng tiết kiệm; truy cập dưới dạng `.Values.global.*` across subcharts. Giúp chia sẻ domain, image registry, hoặc labels.

### JSON schema cho values (validation mạnh)
- Thêm `values.schema.json` để validate inputs; CI nên chạy `helm lint` để enforce.

### Bảo mật và supply chain
- Ký charts: `helm package --sign ...` và phân phối files provenance.
- Verify trước install: `helm verify <chart.tgz>`
- Pin dependencies đến exact versions; tránh `latest`.

### Patterns production phổ biến
- **Immutable tags**: deploy với image tags gắn với commits.
- **Config layering**: base `values.yaml` + env overrides (`values-prod.yaml`) + per-release tweaks.
- **Secrets management**: sử dụng external secret stores (ví dụ: External Secrets Operator) hoặc SOPS/helm-secrets plugin để encrypt values.
- **CRDs**: cài đặt CRDs riêng biệt hoặc mark chúng với `crd-install` hook; tránh xóa trong uninstall trừ khi an toàn.

### Templating tips
- Sử dụng `tpl` để render templated strings từ values:
```gotmpl
{{ tpl .Values.extraConfig . | nindent 2 }}
```
- Quote defensively: `{{ .Values.someString | quote }}`.
- Tránh logic bombs: giữ templates đơn giản; di chuyển logic phức tạp đến values và helpers.

### Helm + GitOps
- Flux/ArgoCD có thể sync Helm charts declaratively. Key flags:
  - `--values`/`--set` trong Application/HelmRelease spec.
  - Bật drift detection và health checks.
- Lưu trữ rendered manifests cho auditing khi có thể.

### Testing và QA
- Unit test templates: plugin [helm-unittest](https://github.com/helm-unittest/helm-unittest).
- Smoke tests: `helm test` hook Jobs hoặc external scripts.
- Render diffs trong CI với `helm diff` đối với live release.

### Performance và size
- Giữ chart nhỏ; prune vendored charts từ git nếu sử dụng dependency update.
- Sử dụng `.helmignore` để drop files không thiết yếu (docs, assets lớn) khỏi package.

### Troubleshooting quickies
- Render cái gì? `helm get manifest <release> | less`
- Values nào được sử dụng? `helm get values <release> -o yaml`
- Tại sao failed? `helm status <release>` + Pod events/logs.

Bạn giờ đã có full path từ basics đến advanced Helm usage được điều chỉnh cho project này.