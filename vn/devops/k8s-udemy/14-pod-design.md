# Pod Design trong Kubernetes

## 1. Tổng quan về Pod Design

Pod Design là quá trình thiết kế Pod specifications để đảm bảo:
- **Reliability**: Pods chạy ổn định và recover từ failures
- **Performance**: Tối ưu resource usage và performance
- **Security**: Tuân thủ security best practices
- **Maintainability**: Dễ maintain và debug
- **Scalability**: Có thể scale hiệu quả

### 1.1. Pod Design Principles

- **Single Responsibility**: Mỗi Pod nên có một responsibility rõ ràng
- **Stateless**: Ưu tiên stateless applications
- **Idempotent**: Có thể restart mà không mất data
- **Health-aware**: Có health checks để Kubernetes biết trạng thái
- **Resource-aware**: Set requests và limits phù hợp
- **Security-first**: Apply security best practices từ đầu

## 2. Resource Management

### 2.1. Resource Requests và Limits

**Requests**: Resources được guarantee cho container
**Limits**: Maximum resources container có thể sử dụng

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-managed-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    resources:
      requests:
        cpu: "500m"      # 0.5 CPU cores
        memory: "512Mi"  # 512 MiB
      limits:
        cpu: "2000m"     # 2 CPU cores max
        memory: "1Gi"    # 1 GiB max
```

**Best Practices:**

- **Set requests**: Giúp scheduler place pods đúng node
- **Set limits**: Prevent resource exhaustion
- **Requests ≈ typical usage**: Set requests gần với typical usage
- **Limits > requests**: Cho phép burst capacity
- **CPU limits**: Cẩn thận với CPU limits (có thể gây throttling)
- **Memory limits**: Set memory limits để tránh OOM kills

### 2.2. Quality of Service (QoS) Classes

Kubernetes tự động assign QoS class dựa trên resource requests và limits:

**Guaranteed** (highest priority):
- Tất cả containers có requests và limits
- Requests = Limits cho CPU và memory

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

**Burstable**:
- Ít nhất một container có requests hoặc limits
- Requests ≠ Limits

```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "2000m"
    memory: "1Gi"
```

**BestEffort** (lowest priority):
- Không có requests và limits

```yaml
# No resources specified
```

### 2.3. Resource Quotas

Namespace có thể có ResourceQuota để limit resource usage:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "10"
```

## 3. Health Checks Design

### 3.1. Liveness Probe

Liveness probe kiểm tra container có đang chạy không. Nếu fail, container sẽ restart.

**Design considerations:**

- **Check core functionality**: Không check dependencies
- **Avoid external dependencies**: Không check database, external APIs
- **Fast response**: Response nhanh (< 1s)
- **Conservative thresholds**: Tránh false positives

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60  # Đợi app start
  periodSeconds: 10         # Check mỗi 10s
  timeoutSeconds: 5         # Timeout 5s
  failureThreshold: 3       # Restart sau 3 lần fail
  successThreshold: 1
```

### 3.2. Readiness Probe

Readiness probe kiểm tra container có sẵn sàng nhận traffic không.

**Design considerations:**

- **Check dependencies**: Có thể check database, external services
- **More frequent**: Check thường xuyên hơn liveness
- **Remove from endpoints**: Pod sẽ bị remove khỏi Service nếu fail

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30  # Đợi dependencies ready
  periodSeconds: 5          # Check mỗi 5s
  timeoutSeconds: 3
  failureThreshold: 3
  successThreshold: 1
```

### 3.3. Startup Probe

Startup probe cho slow-starting applications thêm thời gian.

**Design considerations:**

- **Use for slow starters**: Applications có startup time > 30s
- **Prevent liveness kills**: Ngăn liveness probe kill container trong startup
- **Long failure threshold**: Cho phép nhiều failures

```yaml
startupProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 30      # Cho phép 5 phút startup
  successThreshold: 1
```

## 4. Security Design

### 4.1. Security Context

**Pod-level Security Context:**

```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seLinuxOptions:
      level: "s0:c123,c456"
    supplementalGroups: [1000, 2000]
```

**Container-level Security Context:**

```yaml
containers:
- name: app
  securityContext:
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: true
    capabilities:
      drop:
      - ALL
      add:
      - NET_BIND_SERVICE
    seccompProfile:
      type: RuntimeDefault
```

### 4.2. Service Account

Mỗi Pod nên có ServiceAccount riêng với least privilege:

```yaml
spec:
  serviceAccountName: my-app-sa
  automountServiceAccountToken: true  # hoặc false nếu không cần
```

### 4.3. Network Policies

Apply NetworkPolicy để restrict network access:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-app-network-policy
spec:
  podSelector:
    matchLabels:
      app: my-app
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
```

## 5. Networking Design

### 5.1. Port Configuration

```yaml
containers:
- name: app
  ports:
  - name: http
    containerPort: 8080
    protocol: TCP
  - name: metrics
    containerPort: 9090
    protocol: TCP
```

**Best Practices:**

- **Named ports**: Sử dụng named ports để reference trong Service
- **Document ports**: Ghi chú rõ ràng về mục đích của mỗi port
- **Minimize ports**: Chỉ expose ports cần thiết

### 5.2. DNS Configuration

```yaml
spec:
  dnsPolicy: ClusterFirst  # Default, use cluster DNS
  dnsConfig:
    nameservers:
    - 8.8.8.8
    searches:
    - default.svc.cluster.local
    - svc.cluster.local
    options:
    - name: ndots
      value: "2"
```

## 6. Storage Design

### 6.1. Volume Mounts

```yaml
containers:
- name: app
  volumeMounts:
  - name: config
    mountPath: /etc/config
    readOnly: true
  - name: data
    mountPath: /var/data
  - name: tmp
    mountPath: /tmp

volumes:
- name: config
  configMap:
    name: app-config
- name: data
  persistentVolumeClaim:
    claimName: app-data
- name: tmp
  emptyDir: {}
```

**Best Practices:**

- **Read-only mounts**: Mount config files as read-only
- **Persistent volumes**: Sử dụng PVC cho data cần persist
- **EmptyDir**: Sử dụng cho temporary data
- **Avoid hostPath**: Tránh hostPath trong production

### 6.2. Read-only Root Filesystem

```yaml
securityContext:
  readOnlyRootFilesystem: true

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

## 7. Pod Patterns

### 7.1. Single Container Pod

Đơn giản nhất, một container per pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: single-container-pod
spec:
  containers:
  - name: app
    image: my-app:latest
```

**Use cases:**
- Simple applications
- Stateless services
- Microservices

### 7.2. Sidecar Pattern

Sidecar container hỗ trợ main container:

```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
  - name: sidecar
    image: sidecar:latest
```

**Use cases:**
- Logging
- Monitoring
- Proxy
- Profiling

### 7.3. Init Container Pattern

Init containers chạy trước main containers:

```yaml
spec:
  initContainers:
  - name: init-setup
    image: init-image:latest
  containers:
  - name: app
    image: my-app:latest
```

**Use cases:**
- Database migrations
- Download dependencies
- Setup permissions
- Wait for services

### 7.4. Ambassador Pattern

Ambassador container proxy requests:

```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
  - name: ambassador
    image: envoy:latest
```

**Use cases:**
- Service mesh
- Load balancing
- Request routing

## 8. Anti-patterns

### 8.1. Anti-patterns cần tránh

**1. Không set resource requests/limits:**

```yaml
# ❌ Bad
containers:
- name: app
  image: my-app:latest
  # No resources specified

# ✅ Good
containers:
- name: app
  image: my-app:latest
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"
    limits:
      cpu: "2000m"
      memory: "1Gi"
```

**2. Không có health checks:**

```yaml
# ❌ Bad
containers:
- name: app
  image: my-app:latest
  # No probes

# ✅ Good
containers:
- name: app
  image: my-app:latest
  livenessProbe:
    httpGet:
      path: /health
      port: 8080
  readinessProbe:
    httpGet:
      path: /ready
      port: 8080
```

**3. Chạy as root:**

```yaml
# ❌ Bad
spec:
  securityContext:
    runAsUser: 0  # root

# ✅ Good
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
```

**4. Không có security context:**

```yaml
# ❌ Bad
containers:
- name: app
  image: my-app:latest
  # No security context

# ✅ Good
containers:
- name: app
  image: my-app:latest
  securityContext:
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: true
    capabilities:
      drop:
      - ALL
```

**5. Hardcode configuration:**

```yaml
# ❌ Bad
containers:
- name: app
  image: my-app:latest
  env:
  - name: DATABASE_URL
    value: "postgresql://db:5432/mydb"  # Hardcoded

# ✅ Good
containers:
- name: app
  image: my-app:latest
  env:
  - name: DATABASE_URL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: database-url
```

**6. Sử dụng latest tag:**

```yaml
# ❌ Bad
containers:
- name: app
  image: my-app:latest  # Unpredictable

# ✅ Good
containers:
- name: app
  image: my-app:v1.2.3  # Specific version
```

## 9. Production-Ready Pod Template

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: production-ready-pod
  labels:
    app: my-app
    version: v1.2.3
    environment: production
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/actuator/prometheus"
spec:
  # Service Account
  serviceAccountName: my-app-sa
  
  # Security Context (Pod-level)
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
  
  # Init Containers (if needed)
  initContainers:
  - name: init-setup
    image: init-image:v1.0.0
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
  
  # Containers
  containers:
  - name: app
    image: my-app:v1.2.3
    imagePullPolicy: IfNotPresent
    
    # Ports
    ports:
    - name: http
      containerPort: 8080
      protocol: TCP
    
    # Environment Variables
    env:
    - name: SPRING_PROFILES_ACTIVE
      value: "production"
    - name: CONFIG_FILE
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: config-file
    
    # Environment Variables from Secret
    envFrom:
    - secretRef:
        name: app-secret
    
    # Resource Requests and Limits
    resources:
      requests:
        cpu: "500m"
        memory: "512Mi"
      limits:
        cpu: "2000m"
        memory: "1Gi"
    
    # Health Checks
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 60
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
      successThreshold: 1
    
    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
      successThreshold: 1
    
    startupProbe:
      httpGet:
        path: /actuator/health
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 10
      timeoutSeconds: 3
      failureThreshold: 30
      successThreshold: 1
    
    # Security Context (Container-level)
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
      seccompProfile:
        type: RuntimeDefault
    
    # Volume Mounts
    volumeMounts:
    - name: config
      mountPath: /etc/config
      readOnly: true
    - name: tmp
      mountPath: /tmp
    - name: var-run
      mountPath: /var/run
  
  # Volumes
  volumes:
  - name: config
    configMap:
      name: app-config
  - name: tmp
    emptyDir: {}
  - name: var-run
    emptyDir: {}
  
  # Termination Grace Period
  terminationGracePeriodSeconds: 30
  
  # DNS Policy
  dnsPolicy: ClusterFirst
  
  # Restart Policy
  restartPolicy: Always
```

## 10. Best Practices

### 10.1. General Best Practices

- **Use Deployments**: Không tạo Pods trực tiếp, dùng Deployments
- **Labels**: Sử dụng consistent labels
- **Annotations**: Sử dụng annotations cho metadata
- **Versioning**: Tag images với specific versions
- **Documentation**: Document rõ ràng về Pod design

### 10.2. Resource Best Practices

- **Always set requests**: Giúp scheduler place pods
- **Set limits**: Prevent resource exhaustion
- **Right-sizing**: Monitor và adjust resources
- **QoS classes**: Understand và use appropriately
- **Resource quotas**: Set quotas ở namespace level

### 10.3. Health Check Best Practices

- **Liveness**: Check core functionality
- **Readiness**: Check dependencies
- **Startup**: Use for slow starters
- **Timeouts**: Set appropriate timeouts
- **Periods**: Balance responsiveness và load
- **Thresholds**: Avoid false positives

### 10.4. Security Best Practices

- **Run as non-root**: Always run as non-root user
- **Read-only root**: Use read-only root filesystem
- **Drop capabilities**: Drop all, add only needed
- **Service accounts**: Use dedicated service accounts
- **Network policies**: Apply network policies
- **Secrets**: Use secrets, không hardcode

### 10.5. Storage Best Practices

- **Read-only mounts**: Mount config as read-only
- **Persistent volumes**: Use PVCs for persistent data
- **EmptyDir**: Use for temporary data
- **Avoid hostPath**: Don't use hostPath in production
- **Volume permissions**: Set appropriate permissions

## 11. Thực hành

### 11.1. Tạo Production-Ready Pod

```bash
# Tạo namespace
kubectl create namespace pod-design-test

# Tạo ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: pod-design-test
data:
  config-file: "application.yml"
  log-level: "info"
EOF

# Tạo Secret
kubectl create secret generic app-secret \
  --from-literal=database-password=secret123 \
  --namespace pod-design-test

# Tạo ServiceAccount
kubectl create serviceaccount my-app-sa -n pod-design-test

# Tạo Pod
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: production-ready-pod
  namespace: pod-design-test
  labels:
    app: my-app
    version: v1.0.0
spec:
  serviceAccountName: my-app-sa
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: app
    image: nginx:latest
    ports:
    - name: http
      containerPort: 80
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "500m"
        memory: "256Mi"
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
EOF

# Kiểm tra Pod
kubectl get pod production-ready-pod -n pod-design-test
kubectl describe pod production-ready-pod -n pod-design-test
```

### 11.2. Test Resource Limits

```bash
# Tạo Pod với resource limits
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: resource-test-pod
  namespace: pod-design-test
spec:
  containers:
  - name: stress
    image: polinux/stress
    command: ["stress"]
    args: ["--cpu", "2", "--vm", "1", "--vm-bytes", "500M"]
    resources:
      requests:
        cpu: "500m"
        memory: "256Mi"
      limits:
        cpu: "1000m"
        memory: "512Mi"
EOF

# Monitor resource usage
kubectl top pod resource-test-pod -n pod-design-test

# Xem events
kubectl get events -n pod-design-test --sort-by='.lastTimestamp'
```

### 11.3. Test Health Checks

```bash
# Tạo Pod với health checks
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: health-check-pod
  namespace: pod-design-test
spec:
  containers:
  - name: app
    image: nginx:latest
    ports:
    - containerPort: 80
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 10
      periodSeconds: 5
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 3
EOF

# Kiểm tra probe status
kubectl describe pod health-check-pod -n pod-design-test | grep -A 10 "Liveness\|Readiness"

# Test bằng cách kill process trong container
kubectl exec -it health-check-pod -n pod-design-test -- killall nginx

# Xem Pod restart
kubectl get pod health-check-pod -n pod-design-test -w
```

### 11.4. Test Security Context

```bash
# Tạo Pod với security context
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: security-test-pod
  namespace: pod-design-test
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: nginx:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
EOF

# Kiểm tra user
kubectl exec -it security-test-pod -n pod-design-test -- id

# Kiểm tra capabilities
kubectl exec -it security-test-pod -n pod-design-test -- capsh --print
```

## 12. Troubleshooting

### 12.1. Pod không start

```bash
# Xem Pod status
kubectl get pod my-pod

# Xem events
kubectl describe pod my-pod

# Xem logs
kubectl logs my-pod

# Xem init container logs
kubectl logs my-pod -c init-container-name
```

### 12.2. Resource issues

```bash
# Xem resource usage
kubectl top pod my-pod

# Xem resource requests/limits
kubectl get pod my-pod -o jsonpath='{.spec.containers[*].resources}'

# Xem QoS class
kubectl get pod my-pod -o jsonpath='{.status.qosClass}'

# Xem OOM kills
kubectl get events --field-selector reason=OOMKilling
```

### 12.3. Health check issues

```bash
# Test health endpoint manually
kubectl exec -it my-pod -- curl http://localhost:8080/health

# Xem probe configuration
kubectl get pod my-pod -o yaml | grep -A 10 "livenessProbe\|readinessProbe"

# Xem probe status
kubectl describe pod my-pod | grep -A 5 "Liveness\|Readiness"
```

### 12.4. Security issues

```bash
# Kiểm tra security context
kubectl get pod my-pod -o jsonpath='{.spec.securityContext}'

# Kiểm tra user
kubectl exec -it my-pod -- id

# Kiểm tra capabilities
kubectl exec -it my-pod -- capsh --print
```

## 13. Cleanup

```bash
# Xóa namespace
kubectl delete namespace pod-design-test

# Hoặc xóa từng resource
kubectl delete pod production-ready-pod -n pod-design-test
kubectl delete configmap app-config -n pod-design-test
kubectl delete secret app-secret -n pod-design-test
kubectl delete serviceaccount my-app-sa -n pod-design-test
```

## 14. Tóm tắt

- **Pod Design Principles**: Single responsibility, stateless, idempotent, health-aware, resource-aware, security-first

- **Resource Management**:
  - Requests: Guaranteed resources
  - Limits: Maximum resources
  - QoS Classes: Guaranteed, Burstable, BestEffort

- **Health Checks**:
  - Liveness: Container có đang chạy không?
  - Readiness: Container có sẵn sàng nhận traffic không?
  - Startup: Container đã start chưa?

- **Security Design**:
  - Security Context: Run as non-root, read-only root, drop capabilities
  - Service Account: Dedicated service accounts
  - Network Policies: Restrict network access

- **Pod Patterns**:
  - Single Container: Simple, stateless
  - Sidecar: Logging, monitoring, proxy
  - Init Container: Setup, migrations
  - Ambassador: Service mesh, proxy

- **Anti-patterns**:
  - Không set resources
  - Không có health checks
  - Chạy as root
  - Hardcode configuration
  - Sử dụng latest tag

- **Best Practices**:
  - Use Deployments
  - Set resources
  - Health checks
  - Security context
  - Read-only mounts
  - Version tags
  - Documentation