## Phần 2: Tạo chart

### Metadata chart (Chart.yaml)
- Bắt buộc: `apiVersion: v2`, `name`, `version` (chart), `description`.
- App version: `appVersion` (string) → phản ánh phiên bản ứng dụng container.
- Dependencies: liệt kê subcharts với `name`, `version`, `repository`.

### Files cần biết
- `values.yaml`: default values (giữ tối thiểu, defaults hợp lý).
- `templates/`: Kubernetes manifests với cú pháp Go template.
- `.helmignore`: loại trừ junk khỏi chart đã đóng gói.
- `charts/`: subcharts đã đóng gói (sau `helm dependency build`).

### Tạo một chart
```bash
helm create perf-app
rm -rf perf-app/templates/tests   # optional: xóa test job
```

### Templates phổ biến
- `deployment.yaml`, `service.yaml`, `_helpers.tpl` (định nghĩa template helpers), `ingress.yaml`, `hpa.yaml` (nếu enabled).
- Sử dụng helper templates cho names/labels:
```gotmpl
{{- define "perf-app.fullname" -}}
{{ include "perf-app.name" . }}-{{ .Release.Name }}
{{- end }}
```

### Naming/labels
- Tuân theo labels được khuyến nghị của Kubernetes:
```yaml
metadata:
  labels:
    app.kubernetes.io/name: {{ include "perf-app.name" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/version: {{ .Chart.AppVersion }}
    helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
```

### Conventions values
- Giữ defaults đơn giản; đặt overrides env-specific trong `values-<env>.yaml`.
- Nhóm logic:
```yaml
image:
  repository: thanhncs/perf-app
  tag: "latest"
  pullPolicy: IfNotPresent
resources:
  requests: {cpu: 500m, memory: 512Mi}
  limits:   {cpu: "1",   memory: 1Gi}
service:
  type: ClusterIP
  port: 80
```

### Dependencies (subcharts)
- Khai báo trong Chart.yaml, sau đó:
```bash
helm dependency update
```
- Disable/enable qua values: subchart `enabled: false`.

### Hooks (sử dụng tiết kiệm)
- Cho migrations hoặc jobs one-off:
```yaml
annotations:
  "helm.sh/hook": pre-install,pre-upgrade
  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```
- Giữ hooks idempotent; chúng chạy bên ngoài rollout bình thường.

### Schema cho values (validation)
- Thêm `values.schema.json` để validate user values.
- Snippet ví dụ:
```json
{
  "type": "object",
  "properties": {
    "replicaCount": {"type": "integer", "minimum": 1},
    "image": {
      "type": "object",
      "properties": {
        "repository": {"type": "string"},
        "tag": {"type": "string"}
      },
      "required": ["repository"]
    }
  }
}
```

### Lint sớm
```bash
helm lint ./perf-app
helm template ./perf-app -f values.yaml | kubeconform -strict   # optional schema check
```

Tiếp theo: Phần 3 đi sâu vào templating và patterns values.