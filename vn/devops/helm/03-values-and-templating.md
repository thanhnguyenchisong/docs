## Phần 3: Values và templating

### Luồng values
- Ưu tiên: built-in defaults < chart `values.yaml` < `-f custom.yaml` < `--set key=val` < `--set-file`.
- Kiểm tra merged values của một release: `helm get values <release> -o yaml`.

### Templating essentials (Go template + Sprig)
- Tham chiếu:
  - `.Values` (user config), `.Chart`, `.Release`, `.Capabilities`.
  - Include helper templates từ `_helpers.tpl` với `{{ include "name" . }}`.
- Điều kiện:
```gotmpl
{{- if .Values.ingress.enabled }}
...ingress manifest...
{{- end }}
```
- Vòng lặp:
```gotmpl
{{- range .Values.extraEnv }}
- name: {{ .name }}
  value: {{ .value | quote }}
{{- end }}
```
- Defaults và required:
```gotmpl
imagePullPolicy: {{ .Values.image.pullPolicy | default "IfNotPresent" }}
{{ required "image.repository is required" .Values.image.repository }}
```

### Patterns phổ biến
- Block image:
```gotmpl
image: {{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}
imagePullPolicy: {{ .Values.image.pullPolicy | default "IfNotPresent" }}
```
- Probes:
```gotmpl
livenessProbe:
  httpGet: {path: /actuator/health, port: http}
  initialDelaySeconds: {{ .Values.probes.livenessDelay | default 10 }}
```
- Resources với defaults:
```gotmpl
resources:
{{- toYaml .Values.resources | nindent 2 }}
```
- Service/Ingress có điều kiện:
```gotmpl
{{- if eq .Values.service.type "LoadBalancer" }}
  type: LoadBalancer
{{- end }}
```

### Helpers và reuse
- Định nghĩa một lần trong `_helpers.tpl`:
```gotmpl
{{- define "perf-app.labels" -}}
app.kubernetes.io/name: {{ include "perf-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}
```
- Sau đó reuse:
```gotmpl
metadata:
  labels:
{{ include "perf-app.labels" . | nindent 4 }}
```

### Tổ chức values (ví dụ)
```yaml
replicaCount: 3
image:
  repository: thanhncs/perf-app
  tag: "latest"
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: false
  className: nginx
  host: perf.example.com
resources:
  requests: {cpu: 500m, memory: 512Mi}
  limits:   {cpu: "1",   memory: 1Gi}
```

### Debug template
- Render cục bộ: `helm template ./chart -f values.yaml`
- Với values cụ thể: `helm template ./chart --set image.tag=test`
- Kiểm tra một template duy nhất: sử dụng function `tpl` hoặc extract một snippet để test.

Tiếp theo: Phần 4 bao gồm release operations (install/upgrade/diff/rollback/testing).