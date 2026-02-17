# Kubernetes Security

## 1. Tổng quan về Kubernetes Security

Security trong Kubernetes là một chủ đề rộng bao gồm nhiều lớp bảo vệ:

- **Authentication**: Xác định ai đang truy cập cluster
- **Authorization**: Xác định những gì họ có thể làm (RBAC)
- **Network Security**: Kiểm soát traffic giữa pods (NetworkPolicy)
- **Pod Security**: Security context, capabilities, seccomp
- **Secrets Management**: Bảo vệ sensitive data
- **Image Security**: Scan và verify container images
- **Admission Control**: Validate và mutate resources trước khi tạo

### 1.1. Security Model

Kubernetes security dựa trên **defense in depth** (nhiều lớp bảo vệ):

```
┌─────────────────────────────────────┐
│  External Access Control            │
│  (Network Policies, Firewalls)      │
├─────────────────────────────────────┤
│  API Server Authentication          │
│  (Certificates, Tokens, OIDC)       │
├─────────────────────────────────────┤
│  Authorization (RBAC)               │
│  (Roles, RoleBindings)              │
├─────────────────────────────────────┤
│  Admission Controllers              │
│  (Validation, Mutation)             │
├─────────────────────────────────────┤
│  Pod Security                       │
│  (Security Context, Capabilities)    │
├─────────────────────────────────────┤
│  Runtime Security                   │
│  (Seccomp, AppArmor, SELinux)       │
└─────────────────────────────────────┘
```

## 2. RBAC (Role-Based Access Control)

RBAC là hệ thống authorization trong Kubernetes, cho phép kiểm soát ai có thể làm gì.

### 2.1. Các thành phần RBAC

- **ServiceAccount**: Identity cho pods
- **Role**: Permissions trong namespace
- **ClusterRole**: Permissions cluster-wide
- **RoleBinding**: Gán Role cho subjects trong namespace
- **ClusterRoleBinding**: Gán ClusterRole cho subjects cluster-wide

### 2.2. ServiceAccount

ServiceAccount cung cấp identity cho pods:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: bottleneck-resolve
  namespace: bottleneck-resolve
  labels:
    app: bottleneck-resolve
automountServiceAccountToken: true  # Tự động mount token vào pod
```

**Sử dụng trong Pod:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  serviceAccountName: bottleneck-resolve  # Sử dụng ServiceAccount
  containers:
  - name: app
    image: my-app:latest
```

### 2.3. Role (Namespace-scoped)

Role định nghĩa permissions trong một namespace:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: bottleneck-resolve-role
  namespace: bottleneck-resolve
rules:
# Rule 1: Đọc ConfigMaps và Secrets
- apiGroups: [""]  # Core API group
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]

# Rule 2: Quản lý Pods
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]

# Rule 3: Quản lý Deployments
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
```

**Verbs phổ biến:**
- `get`: Đọc một resource cụ thể
- `list`: Liệt kê tất cả resources
- `watch`: Watch changes
- `create`: Tạo resource mới
- `update`: Update toàn bộ resource
- `patch`: Update một phần resource
- `delete`: Xóa resource
- `*`: Tất cả verbs

### 2.4. ClusterRole (Cluster-scoped)

ClusterRole định nghĩa permissions cho toàn cluster:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-admin  # Built-in role
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
```

**Built-in ClusterRoles:**
- `cluster-admin`: Full access
- `admin`: Admin trong namespace
- `edit`: Read/write trong namespace
- `view`: Read-only trong namespace

### 2.5. RoleBinding

RoleBinding gán Role cho subjects (users, groups, ServiceAccounts):

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: bottleneck-resolve-rolebinding
  namespace: bottleneck-resolve
subjects:
# Subject 1: ServiceAccount
- kind: ServiceAccount
  name: bottleneck-resolve
  namespace: bottleneck-resolve

# Subject 2: User
- kind: User
  name: developer@example.com
  apiGroup: rbac.authorization.k8s.io

# Subject 3: Group
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: bottleneck-resolve-role
  apiGroup: rbac.authorization.k8s.io
```

### 2.6. ClusterRoleBinding

ClusterRoleBinding gán ClusterRole cho subjects:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cluster-admin-binding
subjects:
- kind: User
  name: admin@example.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

### 2.7. Best Practices cho RBAC

- **Principle of Least Privilege**: Chỉ cấp quyền tối thiểu cần thiết
- **Sử dụng ServiceAccount**: Mỗi application có ServiceAccount riêng
- **Tách biệt roles**: Tạo roles cụ thể cho từng use case
- **Regular audit**: Review permissions định kỳ
- **Avoid cluster-admin**: Chỉ dùng khi thực sự cần thiết

## 3. Pod Security Standards

Pod Security Standards là các policy levels để enforce pod security:

- **Privileged**: Không có restrictions (không khuyến nghị)
- **Baseline**: Minimal restrictions, phù hợp cho hầu hết workloads
- **Restricted**: Strictest, phù hợp cho security-critical workloads

### 3.1. Pod Security Admission

Pod Security Admission (PSA) là built-in admission controller trong Kubernetes 1.23+:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

**Modes:**
- `enforce`: Reject pods vi phạm policy
- `audit`: Log violations nhưng không reject
- `warn`: Warning messages

### 3.2. Baseline Policy

Baseline policy yêu cầu:
- Không chạy privileged containers
- Không sử dụng host namespaces
- Không sử dụng hostPath volumes
- Không chạy as root (nếu có thể)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: baseline-ns
  labels:
    pod-security.kubernetes.io/enforce: baseline
```

### 3.3. Restricted Policy

Restricted policy yêu cầu:
- Tất cả requirements của Baseline
- Chạy non-root
- Read-only root filesystem
- Drop ALL capabilities
- Không allow privilege escalation

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: restricted-ns
  labels:
    pod-security.kubernetes.io/enforce: restricted
```

## 4. Security Context

Security Context định nghĩa security settings cho pods và containers.

### 4.1. Pod-level Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    # Chạy non-root
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    
    # SELinux context
    seLinuxOptions:
      level: "s0:c123,c456"
    
    # Supplemental groups
    supplementalGroups: [1000, 2000]
    
    # Sysctls
    sysctls:
    - name: net.ipv4.ip_forward
      value: "0"
  containers:
  - name: app
    image: my-app:latest
```

### 4.2. Container-level Security Context

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    securityContext:
      # Chạy non-root
      runAsNonRoot: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
      
      # Read-only root filesystem
      readOnlyRootFilesystem: true
      
      # Capabilities
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE  # Chỉ cần bind ports < 1024
      
      # Seccomp profile
      seccompProfile:
        type: RuntimeDefault
```

### 4.3. Capabilities

Linux capabilities cung cấp fine-grained permissions:

```yaml
securityContext:
  capabilities:
    # Drop tất cả capabilities trước
    drop:
    - ALL
    # Sau đó add chỉ những gì cần
    add:
    - NET_BIND_SERVICE  # Bind ports < 1024
    - CHOWN              # Change ownership
```

**Common capabilities:**
- `NET_BIND_SERVICE`: Bind ports < 1024
- `SYS_ADMIN`: Admin operations (cần cho một số tools)
- `CHOWN`: Change file ownership
- `DAC_OVERRIDE`: Bypass file permissions

### 4.4. Seccomp

Seccomp (Secure Computing Mode) giới hạn system calls:

```yaml
securityContext:
  seccompProfile:
    type: RuntimeDefault  # Sử dụng default profile
    # Hoặc custom profile
    # localhostProfile: profiles/deny.json
```

**Seccomp types:**
- `Unconfined`: Cho phép tất cả syscalls (không khuyến nghị)
- `RuntimeDefault`: Sử dụng default profile của container runtime
- `Localhost`: Sử dụng custom profile

## 5. Network Policies

Network Policies là firewall rules cho pods, kiểm soát ingress và egress traffic.

### 5.1. NetworkPolicy Basics

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: bottleneck-resolve-network-policy
  namespace: bottleneck-resolve
spec:
  # Pods mà policy này áp dụng
  podSelector:
    matchLabels:
      app: bottleneck-resolve
  
  policyTypes:
  - Ingress
  - Egress
  
  # Ingress rules
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  
  # Egress rules
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53  # DNS
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS
```

### 5.2. Default Deny Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # Áp dụng cho tất cả pods
  policyTypes:
  - Ingress
  - Egress
  # Không có rules = deny all
```

### 5.3. Best Practices

- **Default deny**: Bắt đầu với deny all, sau đó allow từng rule
- **Namespace isolation**: Sử dụng namespaceSelector
- **Least privilege**: Chỉ allow những gì cần thiết
- **Test thoroughly**: Test NetworkPolicy trước khi deploy production

## 6. Secrets Management

### 6.1. Encryption at Rest

Enable encryption cho etcd:

```yaml
# EncryptionConfiguration
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources:
  - secrets
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <base64-encoded-secret>
  - identity: {}  # Fallback
```

### 6.2. External Secret Management

**Sealed Secrets:**

```bash
# Cài đặt kubeseal
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# Tạo SealedSecret
kubectl create secret generic my-secret \
  --from-literal=password=secret123 \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml
```

**External Secrets Operator:**

```yaml
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
  data:
  - secretKey: password
    remoteRef:
      key: my-app/database-password
```

### 6.3. Secret Rotation

Rotate secrets định kỳ để giảm risk:

```bash
# Update secret
kubectl create secret generic my-secret \
  --from-literal=password=newpassword \
  --dry-run=client -o yaml | kubectl replace -f -

# Restart pods để load secret mới
kubectl rollout restart deployment/my-app
```

## 7. Image Security

### 7.1. Image Scanning

Scan container images để tìm vulnerabilities:

```bash
# Sử dụng Trivy
trivy image my-app:latest

# Sử dụng Docker Scout
docker scout cves my-app:latest

# Sử dụng Snyk
snyk test --docker my-app:latest
```

### 7.2. Image Signing và Verification

**Cosign (Sigstore):**

```bash
# Sign image
cosign sign --key cosign.key my-app:latest

# Verify image
cosign verify --key cosign.pub my-app:latest
```

**Notary v2:**

```bash
# Sign image
notary sign my-app:latest

# Verify image
notary verify my-app:latest
```

### 7.3. Image Policies

Sử dụng admission controllers để enforce image policies:

**OPA Gatekeeper:**

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: must-have-approved-registry
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    labels: ["approved-registry"]
```

## 8. Admission Controllers

Admission Controllers validate và mutate resources trước khi tạo.

### 8.1. Built-in Admission Controllers

- **ResourceQuota**: Enforce resource quotas
- **LimitRanger**: Set default limits
- **PodSecurityPolicy**: Enforce pod security (deprecated, dùng Pod Security Standards)
- **ValidatingAdmissionWebhook**: Custom validation
- **MutatingAdmissionWebhook**: Custom mutation

### 8.2. ValidatingAdmissionWebhook

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionWebhook
metadata:
  name: validate-pods
webhooks:
- name: validate-pods.example.com
  clientConfig:
    service:
      name: webhook-service
      namespace: default
      path: "/validate"
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1"]
  sideEffects: None
```

### 8.3. MutatingAdmissionWebhook

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingAdmissionWebhook
metadata:
  name: mutate-pods
webhooks:
- name: mutate-pods.example.com
  clientConfig:
    service:
      name: webhook-service
      namespace: default
      path: "/mutate"
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1"]
  sideEffects: None
```

## 9. Thực hành: Security Hardening

### 9.1. Tạo Secure Namespace

```bash
# Tạo namespace với Pod Security Standards
kubectl create namespace secure-ns

# Label namespace với restricted policy
kubectl label namespace secure-ns \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted
```

### 9.2. Tạo Secure Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
  namespace: secure-ns
spec:
  replicas: 2
  selector:
    matchLabels:
      app: secure-app
  template:
    metadata:
      labels:
        app: secure-app
    spec:
      serviceAccountName: secure-app-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: app
        image: my-app:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1000
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: var-run
          mountPath: /var/run
      volumes:
      - name: tmp
        emptyDir: {}
      - name: var-run
        emptyDir: {}
```

### 9.3. Tạo RBAC với Least Privilege

```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: secure-app-sa
  namespace: secure-ns

---
# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secure-app-role
  namespace: secure-ns
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]

---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: secure-app-rolebinding
  namespace: secure-ns
subjects:
- kind: ServiceAccount
  name: secure-app-sa
  namespace: secure-ns
roleRef:
  kind: Role
  name: secure-app-role
  apiGroup: rbac.authorization.k8s.io
```

### 9.4. Tạo NetworkPolicy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: secure-app-network-policy
  namespace: secure-ns
spec:
  podSelector:
    matchLabels:
      app: secure-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53
  - to: []
    ports:
    - protocol: TCP
      port: 443
```

### 9.5. Test Security

```bash
# Test RBAC
kubectl auth can-i create pods --namespace secure-ns --as=system:serviceaccount:secure-ns:secure-app-sa

# Test NetworkPolicy
kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never \
  --namespace secure-ns -- curl http://secure-app-service/

# Test Pod Security
kubectl run test-pod --image=nginx --namespace secure-ns
# Should fail nếu vi phạm restricted policy
```

## 10. Security Best Practices

### 10.1. General Best Practices

- **Enable RBAC**: Luôn enable RBAC
- **Use ServiceAccounts**: Mỗi app có ServiceAccount riêng
- **Least Privilege**: Chỉ cấp quyền tối thiểu
- **Network Policies**: Enforce network isolation
- **Pod Security Standards**: Sử dụng restricted policy cho production
- **Image Scanning**: Scan images trước khi deploy
- **Secrets Encryption**: Enable encryption at rest
- **Regular Updates**: Update Kubernetes và images thường xuyên
- **Audit Logging**: Enable audit logs
- **Monitor**: Monitor security events

### 10.2. Pod Security Best Practices

- **Run as non-root**: Luôn chạy non-root
- **Read-only root filesystem**: Mount writable dirs như tmpfs
- **Drop ALL capabilities**: Chỉ add những gì cần
- **No privilege escalation**: Set `allowPrivilegeEscalation: false`
- **Seccomp profiles**: Sử dụng RuntimeDefault hoặc custom profiles
- **Resource limits**: Set requests và limits

### 10.3. Network Security Best Practices

- **Default deny**: Bắt đầu với deny all
- **Namespace isolation**: Isolate namespaces
- **Least privilege**: Chỉ allow traffic cần thiết
- **Encryption**: Encrypt traffic in transit (TLS)
- **Monitor**: Monitor network traffic

### 10.4. Secrets Best Practices

- **Encryption at rest**: Enable etcd encryption
- **External secrets**: Sử dụng external secret managers
- **Rotation**: Rotate secrets định kỳ
- **Access control**: Limit access với RBAC
- **Audit**: Log secret access

## 11. Security Tools

### 11.1. Security Scanning Tools

- **Trivy**: Container image scanning
- **Snyk**: Vulnerability scanning
- **Falco**: Runtime security monitoring
- **kube-bench**: CIS Kubernetes Benchmark
- **kube-hunter**: Penetration testing

### 11.2. Policy Enforcement Tools

- **OPA Gatekeeper**: Policy enforcement
- **Kyverno**: Policy engine
- **Pod Security Standards**: Built-in policies
- **ValidatingAdmissionWebhook**: Custom validation

### 11.3. Secret Management Tools

- **Sealed Secrets**: Encrypted secrets in Git
- **External Secrets Operator**: Sync from external stores
- **HashiCorp Vault**: Enterprise secret management
- **AWS Secrets Manager**: Cloud secret management

## 12. Troubleshooting

### 12.1. RBAC Issues

```bash
# Kiểm tra permissions
kubectl auth can-i create pods --namespace my-ns

# Xem roles và bindings
kubectl get roles,rolebindings -n my-ns
kubectl get clusterroles,clusterrolebindings

# Test với ServiceAccount
kubectl auth can-i create pods \
  --namespace my-ns \
  --as=system:serviceaccount:my-ns:my-sa
```

### 12.2. Pod Security Issues

```bash
# Xem pod security context
kubectl get pod my-pod -o jsonpath='{.spec.securityContext}'

# Xem container security context
kubectl get pod my-pod -o jsonpath='{.spec.containers[0].securityContext}'

# Check namespace labels
kubectl get namespace my-ns --show-labels
```

### 12.3. NetworkPolicy Issues

```bash
# Xem NetworkPolicies
kubectl get networkpolicies -n my-ns

# Test connectivity
kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never \
  -- curl -v http://target-service/

# Check CNI plugin
kubectl get pods -n kube-system | grep -E 'calico|cilium'
```

## 13. Tóm tắt

- **RBAC**: Kiểm soát access với Roles và RoleBindings
  - ServiceAccount: Identity cho pods
  - Role: Namespace-scoped permissions
  - ClusterRole: Cluster-scoped permissions
  - Principle of Least Privilege

- **Pod Security Standards**: Enforce security policies
  - Privileged, Baseline, Restricted
  - Pod Security Admission (PSA)

- **Security Context**: Pod và container security settings
  - Run as non-root
  - Read-only root filesystem
  - Capabilities
  - Seccomp profiles

- **Network Policies**: Firewall rules cho pods
  - Default deny
  - Namespace isolation
  - Least privilege

- **Secrets Management**: Bảo vệ sensitive data
  - Encryption at rest
  - External secret managers
  - Secret rotation

- **Image Security**: Scan và verify images
  - Vulnerability scanning
  - Image signing
  - Policy enforcement

- **Admission Controllers**: Validate và mutate resources
  - ValidatingAdmissionWebhook
  - MutatingAdmissionWebhook

- **Best Practices**:
  - Enable RBAC
  - Use ServiceAccounts
  - Least Privilege
  - Network Policies
  - Pod Security Standards
  - Image Scanning
  - Secrets Encryption
  - Regular Updates
  - Audit Logging
  - Monitor security events