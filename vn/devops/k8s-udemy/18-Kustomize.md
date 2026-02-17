# Kustomize trong Kubernetes

## 1. Tổng quan về Kustomize

Kustomize là công cụ template-free để customize Kubernetes manifests. Kustomize cho phép bạn:

- **Quản lý multiple environments**: Dev, staging, production với overlays
- **Customize mà không fork**: Không cần duplicate manifests
- **Compose resources**: Kết hợp nhiều manifests
- **Transform resources**: Thay đổi images, labels, namespaces, etc.
- **Built-in kubectl**: Tích hợp sẵn trong kubectl từ version 1.14+

### 1.1. Tại sao sử dụng Kustomize?

**Vấn đề với raw manifests:**
- Duplicate code cho mỗi environment
- Khó maintain khi có nhiều environments
- Dễ sai sót khi copy-paste
- Không có version control tốt

**Giải pháp với Kustomize:**
- Base manifests + overlays cho từng environment
- DRY (Don't Repeat Yourself)
- Dễ maintain và update
- Template-free (không cần templating engine)

### 1.2. Kustomize vs Helm vs Other Tools

| Feature | Kustomize | Helm | Kustomize + Helm |
|---------|-----------|------|------------------|
| **Template Engine** | No | Yes | Yes |
| **Learning Curve** | Low | Medium | Medium |
| **Built-in kubectl** | Yes | No | Yes |
| **Package Management** | No | Yes | Yes |
| **Best for** | Multi-env, simple | Complex apps, charts | Enterprise |

## 2. Cài đặt Kustomize

### 2.1. Built-in kubectl (Recommended)

Kustomize đã tích hợp sẵn trong kubectl từ version 1.14+:

```bash
# Kiểm tra kubectl version
kubectl version --client

# Sử dụng kustomize qua kubectl
kubectl apply -k .
kubectl kustomize .
```

### 2.2. Standalone Installation

```bash
# Linux
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/

# macOS
brew install kustomize

# Windows
choco install kustomize

# Verify
kustomize version
```

## 3. Kustomization File

### 3.1. Basic kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Namespace cho tất cả resources
namespace: my-app

# Resources to include
resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

# Common labels (thêm vào tất cả resources)
commonLabels:
  app: my-app
  managed-by: kustomize

# Common annotations
commonAnnotations:
  description: "My application"
```

### 3.2. Kustomization Structure

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 1. Resources
resources:
  - deployment.yaml
  - service.yaml

# 2. Namespace
namespace: my-app

# 3. Name prefix/suffix
namePrefix: prod-
nameSuffix: -v1

# 4. Common labels và annotations
commonLabels:
  app: my-app
  environment: production
commonAnnotations:
  version: "1.0.0"

# 5. Images
images:
  - name: my-app
    newName: my-registry/my-app
    newTag: v2.0.0

# 6. Replicas
replicas:
  - name: my-app
    count: 5

# 7. Patches
patches:
  - path: patch.yaml
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 3

# 8. ConfigMap và Secret generators
configMapGenerator:
  - name: app-config
    files:
      - config.properties
secretGenerator:
  - name: app-secret
    literals:
      - password=secret123
```

## 4. Resources

### 4.1. Including Resources

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  # Local files
  - deployment.yaml
  - service.yaml
  
  # Remote URLs
  - https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/application/deployment.yaml
  
  # Directories (recursive)
  - ./manifests/
  
  # Other kustomizations
  - ../base/
```

### 4.2. Resource Ordering

Kustomize xử lý resources theo thứ tự định nghĩa. Quan trọng cho dependencies:

```yaml
resources:
  - namespace.yaml      # Phải có trước
  - configmap.yaml      # Cần cho deployment
  - secret.yaml         # Cần cho deployment
  - deployment.yaml     # Sử dụng configmap và secret
  - service.yaml        # Expose deployment
  - ingress.yaml        # Route traffic đến service
```

## 5. Transformers

### 5.1. Namespace

Set namespace cho tất cả resources:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production
resources:
  - deployment.yaml
  - service.yaml
```

### 5.2. Name Prefix và Suffix

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namePrefix: prod-
nameSuffix: -v1

resources:
  - deployment.yaml  # → prod-deployment-v1
```

### 5.3. Common Labels

Thêm labels vào tất cả resources:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

commonLabels:
  app: my-app
  environment: production
  team: backend

resources:
  - deployment.yaml
```

### 5.4. Common Annotations

Thêm annotations vào tất cả resources:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

commonAnnotations:
  version: "1.0.0"
  description: "Production deployment"
  contact: "team@example.com"

resources:
  - deployment.yaml
```

### 5.5. Images

Thay đổi image name và tag:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

images:
  # Thay đổi image name và tag
  - name: my-app
    newName: my-registry/my-app
    newTag: v2.0.0
  
  # Chỉ thay đổi tag
  - name: nginx
    newTag: 1.22
  
  # Chỉ thay đổi name
  - name: postgres
    newName: postgresql

resources:
  - deployment.yaml
```

### 5.6. Replicas

Thay đổi số replicas:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

replicas:
  - name: my-app
    count: 5
  - name: worker
    count: 10

resources:
  - deployment.yaml
```

## 6. Generators

### 6.1. ConfigMap Generator

Tự động tạo ConfigMap từ files hoặc literals:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

configMapGenerator:
  # Từ files
  - name: app-config
    files:
      - config.properties
      - application.yml
    options:
      labels:
        app: my-app
  
  # Từ literals
  - name: env-config
    literals:
      - LOG_LEVEL=info
      - DEBUG=false
    options:
      annotations:
        description: "Environment configuration"

resources:
  - deployment.yaml
```

### 6.2. Secret Generator

Tự động tạo Secret từ files hoặc literals:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

secretGenerator:
  # Từ files
  - name: app-secret
    files:
      - username.txt
      - password.txt
    type: Opaque
  
  # Từ literals
  - name: db-secret
    literals:
      - username=admin
      - password=secret123
    type: Opaque
    options:
      labels:
        app: my-app

resources:
  - deployment.yaml
```

### 6.3. Generator Options

```yaml
configMapGenerator:
  - name: app-config
    files:
      - config.properties
    options:
      labels:
        app: my-app
        environment: production
      annotations:
        description: "Application configuration"
      disableNameSuffixHash: true  # Không thêm hash vào name
```

## 7. Patches

### 7.1. Strategic Merge Patch

Patch file để merge changes:

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

patchesStrategicMerge:
  - patch-replicas.yaml
```

```yaml
# patch-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 5
```

### 7.2. JSON Patch

Sử dụng JSON Patch format:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

patches:
  - target:
      kind: Deployment
      name: my-app
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
      - op: add
        path: /spec/template/spec/containers/0/env/-
        value:
          name: NEW_ENV_VAR
          value: "new-value"
```

### 7.3. Inline Patches

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 3
    target:
      kind: Deployment
      name: my-app
```

## 8. Overlays (Base và Environments)

### 8.1. Base Structure

```
project/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── overlays/
│   ├── dev/
│   │   └── kustomization.yaml
│   ├── staging/
│   │   └── kustomization.yaml
│   └── production/
│       └── kustomization.yaml
```

### 8.2. Base kustomization.yaml

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

commonLabels:
  app: my-app
```

### 8.3. Dev Overlay

```yaml
# overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: dev

resources:
  - ../../base

namePrefix: dev-

commonLabels:
  environment: development

images:
  - name: my-app
    newTag: latest

replicas:
  - name: my-app
    count: 1

patches:
  - patch: |-
      - op: add
        path: /spec/template/spec/containers/0/env/-
        value:
          name: ENV
          value: "development"
    target:
      kind: Deployment
      name: my-app
```

### 8.4. Production Overlay

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

resources:
  - ../../base

namePrefix: prod-

commonLabels:
  environment: production

images:
  - name: my-app
    newName: my-registry/my-app
    newTag: v1.0.0

replicas:
  - name: my-app
    count: 5

patches:
  - patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources
        value:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "1Gi"
    target:
      kind: Deployment
      name: my-app

configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=warn
      - DEBUG=false
```

## 9. Multi-Environment Setup

### 9.1. Complete Example

```
my-app/
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patch-replicas.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── patch-replicas.yaml
    └── production/
        ├── kustomization.yaml
        ├── patch-replicas.yaml
        └── patch-resources.yaml
```

### 9.2. Deploy to Different Environments

```bash
# Build và preview
kubectl kustomize overlays/dev
kubectl kustomize overlays/staging
kubectl kustomize overlays/production

# Apply
kubectl apply -k overlays/dev
kubectl apply -k overlays/staging
kubectl apply -k overlays/production
```

## 10. Best Practices

### 10.1. Structure Best Practices

- **Base**: Chứa common manifests
- **Overlays**: Environment-specific customizations
- **One base, many overlays**: Tránh duplicate code
- **Clear naming**: Tên rõ ràng cho resources
- **Documentation**: Comment trong kustomization.yaml

### 10.2. Resource Management

- **Order matters**: Đặt resources theo dependency order
- **Use generators**: Cho ConfigMaps và Secrets
- **Avoid hardcoding**: Sử dụng transformers
- **Version control**: Track changes trong Git

### 10.3. Overlay Best Practices

- **Minimal changes**: Chỉ override những gì cần thiết
- **Use patches**: Cho specific changes
- **Environment-specific**: Separate overlays cho mỗi environment
- **Test overlays**: Preview trước khi apply

### 10.4. Security Best Practices

- **Secrets**: Không commit secrets vào Git
- **Use secretGenerator**: Generate secrets từ external sources
- **RBAC**: Apply appropriate RBAC
- **Network policies**: Include trong base

## 11. Thực hành

### 11.1. Setup Base

```bash
# Tạo directory structure
mkdir -p kustomize-demo/base overlays/{dev,staging,production}

# Tạo base deployment
cat <<EOF > base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF

# Tạo base service
cat <<EOF > base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
EOF

# Tạo base kustomization
cat <<EOF > base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

commonLabels:
  app: my-app
EOF
```

### 11.2. Create Dev Overlay

```bash
# Tạo dev kustomization
cat <<EOF > overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: dev

resources:
  - ../../base

namePrefix: dev-

commonLabels:
  environment: development

images:
  - name: nginx
    newTag: latest

replicas:
  - name: my-app
    count: 1
EOF

# Preview
kubectl kustomize overlays/dev

# Apply
kubectl apply -k overlays/dev
```

### 11.3. Create Production Overlay

```bash
# Tạo production kustomization
cat <<EOF > overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

resources:
  - ../../base

namePrefix: prod-

commonLabels:
  environment: production

images:
  - name: nginx
    newName: my-registry/nginx
    newTag: 1.22

replicas:
  - name: my-app
    count: 5

patches:
  - patch: |-
      - op: add
        path: /spec/template/spec/containers/0/resources
        value:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
    target:
      kind: Deployment
      name: my-app
EOF

# Preview
kubectl kustomize overlays/production

# Apply
kubectl apply -k overlays/production
```

### 11.4. Test với ConfigMap Generator

```bash
# Tạo config file
cat <<EOF > base/config.properties
server.port=8080
log.level=info
EOF

# Update base kustomization
cat <<EOF >> base/kustomization.yaml

configMapGenerator:
  - name: app-config
    files:
      - config.properties
EOF

# Preview
kubectl kustomize base
```

### 11.5. Test với Patches

```bash
# Tạo patch file
cat <<EOF > overlays/production/patch-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 10
EOF

# Update production kustomization
cat <<EOF >> overlays/production/kustomization.yaml

patchesStrategicMerge:
  - patch-replicas.yaml
EOF

# Preview
kubectl kustomize overlays/production
```

## 12. Advanced Features

### 12.1. Variables (Kustomize v4+)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

replicas:
  - name: my-app
    count: 5

# Variables (experimental)
vars:
  - name: IMAGE_TAG
    objref:
      kind: ConfigMap
      name: app-config
    fieldref:
      fieldpath: data.imageTag
```

### 12.2. Helm Integration

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

# Helm chart as resource
helmCharts:
  - name: postgresql
    repo: https://charts.bitnami.com/bitnami
    version: 12.0.0
    releaseName: postgresql
    namespace: default
```

### 12.3. Remote Bases

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - https://github.com/kubernetes-sigs/kustomize/examples/helloWorld?ref=v1.0.6
  - deployment.yaml
```

## 13. Troubleshooting

### 13.1. Build Errors

```bash
# Validate kustomization file
kubectl kustomize . --dry-run

# Debug với verbose output
kubectl kustomize . --load-restrictor LoadRestrictionsNone

# Check resource order
kubectl kustomize . | kubectl apply --dry-run=client -f -
```

### 13.2. Patch không apply

```bash
# Verify patch target
kubectl kustomize . | grep -A 5 "name: my-app"

# Check patch format
kubectl kustomize . --enable-alpha-plugins

# Test patch riêng
kubectl kustomize base
kubectl kustomize overlays/dev
```

### 13.3. Image không được replace

```bash
# Verify image name trong base
kubectl kustomize base | grep image:

# Check image transformer
kubectl kustomize overlays/dev | grep image:

# Ensure image name matches exactly
```

## 14. Cleanup

```bash
# Xóa resources
kubectl delete -k overlays/dev
kubectl delete -k overlays/production

# Hoặc xóa namespace
kubectl delete namespace dev
kubectl delete namespace production
```

## 15. Tóm tắt

- **Kustomize**: Template-free customization tool cho Kubernetes manifests
  - Built-in kubectl từ version 1.14+
  - DRY principle với base và overlays
  - Multi-environment support

- **Kustomization File**: Configuration file định nghĩa resources và transformers
  - resources: List manifests
  - namespace: Set namespace
  - commonLabels/annotations: Add metadata
  - images: Replace images
  - replicas: Change replica count

- **Generators**: Tự động tạo ConfigMaps và Secrets
  - configMapGenerator: Từ files hoặc literals
  - secretGenerator: Từ files hoặc literals

- **Patches**: Modify resources
  - patchesStrategicMerge: Strategic merge patches
  - patches: JSON patches

- **Overlays**: Environment-specific customizations
  - Base: Common manifests
  - Overlays: Dev, staging, production
  - Minimal changes per environment

- **Best Practices**:
  - One base, many overlays
  - Order resources by dependencies
  - Use generators cho ConfigMaps/Secrets
  - Preview trước khi apply
  - Don't commit secrets