# ConfigMap và Secret trong Kubernetes

## 1. Tổng quan

ConfigMap và Secret là hai resource trong Kubernetes dùng để quản lý configuration data:

- **ConfigMap**: Lưu trữ non-sensitive configuration data (key-value pairs, files)
- **Secret**: Lưu trữ sensitive data (passwords, tokens, keys) - được encode base64

### 1.1. Khi nào sử dụng?

**ConfigMap:**
- Application configuration files (application.yml, config.properties)
- Environment variables không nhạy cảm
- Command-line arguments
- Configuration data cần thay đổi mà không rebuild image

**Secret:**
- Passwords, API keys, tokens
- TLS certificates
- Docker registry credentials
- Bất kỳ data nhạy cảm nào

### 1.2. Lợi ích

- **Decouple configuration từ container images**: Thay đổi config mà không cần rebuild
- **Reusability**: Dùng chung config cho nhiều pods
- **Environment-specific**: Dễ dàng switch giữa dev/staging/prod
- **Security**: Secret được encode và có thể encrypt

## 2. ConfigMap

### 2.1. Tạo ConfigMap

**Cách 1: Từ literal values**

```bash
kubectl create configmap my-config \
  --from-literal=key1=value1 \
  --from-literal=key2=value2 \
  --namespace my-namespace
```

**Cách 2: Từ file**

```bash
# Từ single file
kubectl create configmap my-config \
  --from-file=application.yml \
  --namespace my-namespace

# Từ multiple files
kubectl create configmap my-config \
  --from-file=application.yml \
  --from-file=logback.xml \
  --namespace my-namespace

# Từ directory
kubectl create configmap my-config \
  --from-file=./config/ \
  --namespace my-namespace
```

**Cách 3: Từ YAML manifest**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bottleneck-resolve-config
  namespace: bottleneck-resolve
  labels:
    app: bottleneck-resolve
data:
  # Key-value pairs
  database.host: "db.example.com"
  database.port: "5432"
  app.name: "bottleneck-resolve"
  
  # Multi-line value (file content)
  application.yml: |
    server:
      port: 8080
    
    management:
      endpoints:
        web:
          exposure:
            include: "health,info,prometheus"
      endpoint:
        prometheus:
          enabled: true
      metrics:
        tags:
          application: bottleneck-resolve
      health:
        probes:
          enabled: true
    
    spring:
      application:
        name: bottleneck-resolve
      profiles:
        active: production
```

**Cách 4: Từ env file**

```bash
kubectl create configmap my-config \
  --from-env-file=.env \
  --namespace my-namespace
```

### 2.2. Sử dụng ConfigMap trong Pod

**Cách 1: Environment Variables**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    # Single key
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: my-config
          key: database.host
    # Multiple keys từ ConfigMap
    - name: DATABASE_PORT
      valueFrom:
        configMapKeyRef:
          name: my-config
          key: database.port
```

**Cách 2: envFrom (Tất cả keys)**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    envFrom:
    - configMapRef:
        name: my-config
    # Có thể prefix keys
    - prefix: CONFIG_
      configMapRef:
        name: my-config
```

**Cách 3: Volume Mount (File)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
        volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        env:
        - name: SPRING_CONFIG_LOCATION
          value: "file:/etc/config/application.yml"
      volumes:
      - name: config
        configMap:
          name: bottleneck-resolve-config
```

**Cách 4: Mount specific keys**

```yaml
volumes:
- name: config
  configMap:
    name: bottleneck-resolve-config
    items:
    - key: application.yml
      path: application.yml
    - key: logback.xml
      path: logback.xml
```

**Cách 5: Command-line arguments**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    command: ["/bin/sh"]
    args:
    - -c
    - echo $(DATABASE_HOST):$(DATABASE_PORT)
    envFrom:
    - configMapRef:
        name: my-config
```

### 2.3. Xem và quản lý ConfigMap

```bash
# List ConfigMaps
kubectl get configmaps
kubectl get cm  # Short form

# Xem chi tiết
kubectl describe configmap my-config
kubectl get configmap my-config -o yaml

# Xem data
kubectl get configmap my-config -o jsonpath='{.data.application\.yml}'

# Edit ConfigMap
kubectl edit configmap my-config

# Delete ConfigMap
kubectl delete configmap my-config
```

### 2.4. Update ConfigMap

**Cách 1: Edit trực tiếp**

```bash
kubectl edit configmap my-config
```

**Cách 2: Replace**

```bash
kubectl create configmap my-config \
  --from-file=application.yml \
  --dry-run=client -o yaml | kubectl replace -f -
```

**Cách 3: Patch**

```bash
kubectl patch configmap my-config \
  --type merge \
  -p '{"data":{"new-key":"new-value"}}'
```

**Lưu ý**: Khi update ConfigMap, pods không tự động reload. Cần:
- Restart pods: `kubectl rollout restart deployment/my-app`
- Hoặc sử dụng tools như Reloader để tự động reload

## 3. Secret

### 3.1. Tạo Secret

**Cách 1: Từ literal values**

```bash
kubectl create secret generic my-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123 \
  --namespace my-namespace
```

**Cách 2: Từ file**

```bash
# Từ file
kubectl create secret generic my-secret \
  --from-file=username.txt \
  --from-file=password.txt \
  --namespace my-namespace

# Từ file với key name cụ thể
kubectl create secret generic my-secret \
  --from-file=db-password=./password.txt \
  --namespace my-namespace
```

**Cách 3: Từ YAML manifest (stringData)**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bottleneck-resolve-secret
  namespace: bottleneck-resolve
  labels:
    app: bottleneck-resolve
type: Opaque
stringData:
  # stringData: values được tự động base64 encode
  # Dễ đọc và edit hơn data
  database-password: "my-secret-password"
  api-key: "sk-1234567890abcdef"
  jwt-secret: "my-jwt-secret-key"
```

**Cách 4: Từ YAML manifest (data - đã encode)**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
data:
  # data: values phải là base64 encoded
  username: YWRtaW4=  # base64 của "admin"
  password: c2VjcmV0MTIz  # base64 của "secret123"
```

**Encode base64:**

```bash
# Encode
echo -n "my-secret-password" | base64
# Output: bXktc2VjcmV0LXBhc3N3b3Jk

# Decode
echo "bXktc2VjcmV0LXBhc3N3b3Jk" | base64 -d
# Output: my-secret-password
```

**Cách 5: TLS Secret**

```bash
# Tạo TLS secret từ certificate files
kubectl create secret tls my-tls-secret \
  --cert=tls.crt \
  --key=tls.key \
  --namespace my-namespace
```

**Cách 6: Docker Registry Secret**

```bash
# Tạo secret cho Docker registry
kubectl create secret docker-registry my-registry-secret \
  --docker-server=docker.io \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=myuser@example.com \
  --namespace my-namespace
```

### 3.2. Secret Types

Kubernetes có các built-in secret types:

- **Opaque**: User-defined data (default)
- **kubernetes.io/tls**: TLS certificate và key
- **kubernetes.io/dockerconfigjson**: Docker registry credentials
- **kubernetes.io/basic-auth**: Basic authentication
- **kubernetes.io/ssh-auth**: SSH keys

### 3.3. Sử dụng Secret trong Pod

**Cách 1: Environment Variables**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    env:
    - name: DATABASE_PASSWORD
      valueFrom:
        secretKeyRef:
          name: my-secret
          key: database-password
    - name: API_KEY
      valueFrom:
        secretKeyRef:
          name: my-secret
          key: api-key
```

**Cách 2: envFrom**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    envFrom:
    - secretRef:
        name: my-secret
    # Có thể prefix
    - prefix: SECRET_
      secretRef:
        name: my-secret
```

**Cách 3: Volume Mount**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: my-app:latest
        volumeMounts:
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true
      volumes:
      - name: secrets
        secret:
          secretName: my-secret
```

**Cách 4: Mount specific keys**

```yaml
volumes:
- name: secrets
  secret:
    secretName: my-secret
    items:
    - key: database-password
      path: db-password
      mode: 0400  # File permissions (octal)
    - key: api-key
      path: api-key
      mode: 0400
```

**Cách 5: Docker Registry Secret (imagePullSecrets)**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  imagePullSecrets:
  - name: my-registry-secret
  containers:
  - name: app
    image: private-registry.io/my-app:latest
```

### 3.4. Xem và quản lý Secret

```bash
# List Secrets
kubectl get secrets
kubectl get secret  # Short form

# Xem chi tiết (không hiển thị values)
kubectl describe secret my-secret

# Xem YAML (values là base64 encoded)
kubectl get secret my-secret -o yaml

# Decode secret value
kubectl get secret my-secret -o jsonpath='{.data.database-password}' | base64 -d

# Edit Secret
kubectl edit secret my-secret

# Delete Secret
kubectl delete secret my-secret
```

### 3.5. Update Secret

**Cách 1: Edit trực tiếp**

```bash
kubectl edit secret my-secret
```

**Cách 2: Replace**

```bash
kubectl create secret generic my-secret \
  --from-literal=password=newpassword \
  --dry-run=client -o yaml | kubectl replace -f -
```

**Cách 3: Patch**

```bash
# Encode value trước
NEW_VALUE=$(echo -n "newpassword" | base64)
kubectl patch secret my-secret \
  --type merge \
  -p "{\"data\":{\"password\":\"$NEW_VALUE\"}}"
```

**Lưu ý**: Tương tự ConfigMap, cần restart pods sau khi update Secret.

## 4. Best Practices

### 4.1. ConfigMap Best Practices

- **Tách biệt theo environment**: Tạo ConfigMap riêng cho dev/staging/prod
- **Sử dụng labels**: Dễ quản lý và filter
- **Versioning**: Sử dụng labels để version config
- **Immutable ConfigMaps**: Set `immutable: true` để tránh accidental updates
- **Size limits**: ConfigMap có giới hạn 1MB, nếu lớn hơn nên dùng volume

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  labels:
    app: my-app
    version: v1
    environment: production
data:
  config: "..."
immutable: true  # Không thể update, phải tạo mới
```

### 4.2. Secret Best Practices

- **Không commit secrets vào Git**: Sử dụng Sealed Secrets, External Secrets, hoặc Vault
- **Enable encryption at rest**: Encrypt etcd để bảo vệ secrets
- **Rotate secrets thường xuyên**: Thay đổi passwords/keys định kỳ
- **Sử dụng least privilege**: Chỉ pods cần thiết mới access secrets
- **Immutable Secrets**: Set `immutable: true` cho production
- **Sử dụng external secret managers**: AWS Secrets Manager, HashiCorp Vault, etc.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
  labels:
    app: my-app
    environment: production
type: Opaque
stringData:
  password: "secret"
immutable: true  # Không thể update
```

### 4.3. Security Best Practices

- **RBAC**: Giới hạn quyền truy cập ConfigMap/Secret
- **Network policies**: Hạn chế network access
- **Encryption**: Enable encryption at rest và in transit
- **Audit logging**: Log tất cả access đến secrets
- **Secret rotation**: Tự động rotate secrets

## 5. Thực hành: Sử dụng ConfigMap và Secret

### 5.1. Tạo và sử dụng ConfigMap

**Bước 1: Tạo ConfigMap**

```bash
# Tạo namespace
kubectl create namespace config-test

# Tạo ConfigMap từ file
cat > application.yml <<EOF
server:
  port: 8080
spring:
  application:
    name: test-app
  datasource:
    url: jdbc:postgresql://db:5432/mydb
EOF

kubectl create configmap app-config \
  --from-file=application.yml \
  --namespace config-test

# Xem ConfigMap
kubectl get configmap app-config -n config-test -o yaml
```

**Bước 2: Sử dụng ConfigMap trong Pod**

```yaml
# pod-with-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: config-test
spec:
  containers:
  - name: app
    image: busybox:1.35
    command: ["sleep", "3600"]
    volumeMounts:
    - name: config
      mountPath: /etc/config
    env:
    - name: CONFIG_FILE
      value: "/etc/config/application.yml"
  volumes:
  - name: config
    configMap:
      name: app-config
```

```bash
# Apply
kubectl apply -f pod-with-configmap.yaml

# Kiểm tra
kubectl exec -it test-pod -n config-test -- cat /etc/config/application.yml
```

**Bước 3: Sử dụng ConfigMap như Environment Variables**

```yaml
# pod-with-env.yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod-env
  namespace: config-test
spec:
  containers:
  - name: app
    image: busybox:1.35
    command: ["sh", "-c", "env | grep CONFIG"]
    envFrom:
    - configMapRef:
        name: app-config
```

### 5.2. Tạo và sử dụng Secret

**Bước 1: Tạo Secret**

```bash
# Tạo Secret từ literal
kubectl create secret generic app-secret \
  --from-literal=db-password=mysecretpassword \
  --from-literal=api-key=sk-1234567890 \
  --namespace config-test

# Xem Secret (values là base64)
kubectl get secret app-secret -n config-test -o yaml

# Decode value
kubectl get secret app-secret -n config-test \
  -o jsonpath='{.data.db-password}' | base64 -d
```

**Bước 2: Sử dụng Secret trong Pod**

```yaml
# pod-with-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod-secret
  namespace: config-test
spec:
  containers:
  - name: app
    image: busybox:1.35
    command: ["sh", "-c", "echo $DB_PASSWORD && sleep 3600"]
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: db-password
    - name: API_KEY
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: api-key
```

```bash
# Apply
kubectl apply -f pod-with-secret.yaml

# Kiểm tra (không hiển thị secret trong logs)
kubectl logs test-pod-secret -n config-test
```

**Bước 3: Mount Secret như file**

```yaml
# pod-with-secret-file.yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-pod-secret-file
  namespace: config-test
spec:
  containers:
  - name: app
    image: busybox:1.35
    command: ["sleep", "3600"]
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secrets
    secret:
      secretName: app-secret
      items:
      - key: db-password
        path: database-password
        mode: 0400
```

### 5.3. Update và Reload

**Bước 1: Update ConfigMap**

```bash
# Update ConfigMap
kubectl patch configmap app-config -n config-test \
  --type merge \
  -p '{"data":{"application.yml":"server:\n  port: 9090\n"}}'

# Restart pod để load config mới
kubectl rollout restart deployment/my-app -n config-test
```

**Bước 2: Sử dụng Reloader để auto-reload**

```bash
# Cài đặt Reloader
helm repo add stakater https://stakater.github.io/stakater-charts
helm install stakater-reloader stakater/reloader

# Thêm annotation vào Deployment
kubectl annotate deployment my-app \
  reloader.stakater.com/auto="true" \
  -n config-test
```

### 5.4. Sử dụng với Deployment

```yaml
# deployment-with-configmap-secret.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: config-test
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
        image: my-app:latest
        ports:
        - containerPort: 8080
        # Environment variables từ ConfigMap
        env:
        - name: SPRING_CONFIG_LOCATION
          value: "file:/etc/config/application.yml"
        # Environment variables từ Secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db-password
        # Volume mounts
        volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        - name: secrets
          mountPath: /etc/secrets
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: app-config
      - name: secrets
        secret:
          secretName: app-secret
```

## 6. Advanced Topics

### 6.1. Immutable ConfigMaps và Secrets

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  config: "..."
immutable: true  # Không thể update, phải xóa và tạo lại
```

**Lợi ích:**
- Tránh accidental updates
- Tăng performance (không cần watch changes)
- Đảm bảo consistency

### 6.2. External Secret Management

**Sealed Secrets:**

```bash
# Cài đặt kubeseal
brew install kubeseal  # macOS
# hoặc download từ GitHub

# Tạo SealedSecret
kubectl create secret generic my-secret \
  --from-literal=password=secret123 \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml

# Apply SealedSecret
kubectl apply -f sealed-secret.yaml
```

**External Secrets Operator:**

```yaml
# ExternalSecret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: my-external-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: my-secret
    creationPolicy: Owner
  data:
  - secretKey: password
    remoteRef:
      key: my-app/database-password
```

### 6.3. ConfigMap và Secret với Kustomize

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml

configMapGenerator:
- name: app-config
  files:
  - application.yml
  options:
    labels:
      app: my-app

secretGenerator:
- name: app-secret
  literals:
  - db-password=secret123
  options:
    labels:
      app: my-app
```

### 6.4. ConfigMap và Secret với Helm

```yaml
# values.yaml
config:
  server:
    port: 8080

secrets:
  dbPassword: "secret123"

# templates/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  application.yml: |
    server:
      port: {{ .Values.config.server.port }}

# templates/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-secret
type: Opaque
stringData:
  db-password: {{ .Values.secrets.dbPassword | b64enc }}
```

## 7. Troubleshooting

### 7.1. ConfigMap không được mount

```bash
# Kiểm tra ConfigMap tồn tại
kubectl get configmap my-config

# Kiểm tra pod events
kubectl describe pod my-pod

# Kiểm tra volume mounts
kubectl get pod my-pod -o jsonpath='{.spec.volumes}'
```

### 7.2. Secret không được load

```bash
# Kiểm tra Secret tồn tại
kubectl get secret my-secret

# Kiểm tra permissions (RBAC)
kubectl auth can-i get secret --namespace my-namespace

# Kiểm tra pod có access secret không
kubectl exec -it my-pod -- env | grep SECRET
```

### 7.3. Config không reload sau khi update

```bash
# Kiểm tra ConfigMap đã update chưa
kubectl get configmap my-config -o yaml

# Restart pods
kubectl rollout restart deployment/my-app

# Hoặc sử dụng Reloader
kubectl get deployment my-app -o yaml | grep reloader
```

### 7.4. Secret values bị decode sai

```bash
# Decode manual để kiểm tra
kubectl get secret my-secret \
  -o jsonpath='{.data.password}' | base64 -d

# Kiểm tra encoding
echo -n "my-password" | base64
```

## 8. Cleanup

```bash
# Xóa test resources
kubectl delete namespace config-test

# Hoặc xóa từng resource
kubectl delete configmap app-config -n config-test
kubectl delete secret app-secret -n config-test
kubectl delete pod test-pod -n config-test
```

## 9. Tóm tắt

- **ConfigMap**: Lưu trữ non-sensitive configuration data
  - Tạo từ literal, file, hoặc YAML
  - Sử dụng như env vars hoặc volume mounts
  - Giới hạn 1MB, có thể immutable

- **Secret**: Lưu trữ sensitive data
  - Tự động base64 encode
  - Nhiều types: Opaque, TLS, Docker registry
  - Cần enable encryption at rest

- **Best Practices**:
  - Không commit secrets vào Git
  - Sử dụng external secret managers
  - Enable encryption
  - Rotate secrets thường xuyên
  - Sử dụng RBAC để limit access
  - Immutable cho production

- **Sử dụng**:
  - Environment variables (env/envFrom)
  - Volume mounts (files)
  - Command-line arguments
  - imagePullSecrets (Docker registry)

- **Update**: Cần restart pods sau khi update ConfigMap/Secret, hoặc sử dụng Reloader để auto-reload