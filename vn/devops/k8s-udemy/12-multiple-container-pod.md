# Multiple Container Pods trong Kubernetes

## 1. Tổng quan

Một Pod trong Kubernetes có thể chứa nhiều containers. Các containers trong cùng một Pod:

- **Chia sẻ network namespace**: Cùng IP address và ports
- **Chia sẻ storage volumes**: Có thể mount cùng volumes
- **Chia sẻ process namespace** (optional): Có thể thấy processes của nhau
- **Cùng lifecycle**: Start và stop cùng nhau
- **Cùng node**: Luôn được schedule trên cùng một node

### 1.1. Khi nào sử dụng Multiple Containers?

**Use cases phổ biến:**

- **Init Containers**: Chạy trước main containers để setup/prepare
- **Sidecar Containers**: Hỗ trợ main container (logging, monitoring, proxy)
- **Adapter Containers**: Transform output của main container
- **Ambassador Containers**: Proxy network requests
- **Helper Containers**: Utilities hỗ trợ main container

### 1.2. Pod với Multiple Containers

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  # Sidecar container
  - name: sidecar
    image: sidecar:latest
  
  # Helper container
  - name: helper
    image: helper:latest
```

## 2. Init Containers

Init Containers chạy và hoàn thành trước khi main containers start. Nếu init container fail, Pod sẽ không start.

### 2.1. Đặc điểm Init Containers

- **Chạy tuần tự**: Mỗi init container chạy đến khi hoàn thành trước khi chạy tiếp
- **Chạy trước main containers**: Main containers chỉ start sau khi tất cả init containers thành công
- **Có thể có nhiều init containers**: Chạy theo thứ tự định nghĩa
- **Restart policy**: Luôn restart nếu fail (không phụ thuộc vào restartPolicy của Pod)

### 2.2. Use Cases

- **Setup database schema**: Chạy migrations trước khi app start
- **Download dependencies**: Download files/config trước khi app cần
- **Wait for external services**: Đợi database, API services sẵn sàng
- **Setup permissions**: Tạo directories, set permissions
- **Generate config files**: Tạo config từ templates

### 2.3. Ví dụ Init Container

**Ví dụ 1: Setup database schema**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  initContainers:
  # Init container 1: Wait for database
  - name: wait-for-db
    image: busybox:1.35
    command: ['sh', '-c']
    args:
    - |
      until nc -z database-service 5432; do
        echo "Waiting for database..."
        sleep 2
      done
      echo "Database is ready!"
  
  # Init container 2: Run migrations
  - name: run-migrations
    image: my-app:migrate
    command: ['sh', '-c', 'npm run migrate']
    env:
    - name: DATABASE_URL
      value: "postgresql://db:5432/mydb"
  
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
```

**Ví dụ 2: Download config files**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config-init
spec:
  initContainers:
  - name: download-config
    image: curlimages/curl:latest
    command: ['sh', '-c']
    args:
    - |
      curl -o /shared/config.json https://config-server.example.com/config.json
      echo "Config downloaded"
    volumeMounts:
    - name: shared-data
      mountPath: /shared
  
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: shared-data
      mountPath: /app/config
    command: ['sh', '-c', 'cat /app/config/config.json && node app.js']
```

**Ví dụ 3: Setup permissions**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-permissions
spec:
  initContainers:
  - name: setup-permissions
    image: busybox:1.35
    command: ['sh', '-c']
    args:
    - |
      mkdir -p /shared/logs /shared/data
      chown -R 1000:1000 /shared
      chmod -R 755 /shared
      echo "Permissions set"
    volumeMounts:
    - name: shared-storage
      mountPath: /shared
  
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: shared-storage
      mountPath: /app/data
```

### 2.4. Init Container với Shared Volumes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-shared-volume
spec:
  initContainers:
  - name: init-setup
    image: busybox:1.35
    command: ['sh', '-c', 'echo "Init data" > /shared/init.txt']
    volumeMounts:
    - name: shared-volume
      mountPath: /shared
  
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: shared-volume
      mountPath: /app/data
    command: ['sh', '-c', 'cat /app/data/init.txt && node app.js']
  
  volumes:
  - name: shared-volume
    emptyDir: {}
```

## 3. Sidecar Containers

Sidecar containers chạy song song với main container để hỗ trợ các chức năng như logging, monitoring, proxying.

### 3.1. Đặc điểm Sidecar

- **Chạy song song**: Chạy cùng lúc với main container
- **Chia sẻ network**: Cùng IP và có thể communicate qua localhost
- **Chia sẻ volumes**: Có thể đọc/ghi cùng files
- **Independent lifecycle**: Có thể restart độc lập
- **Hỗ trợ main container**: Không thay thế main container

### 3.2. Use Cases

- **Logging**: Collect và ship logs
- **Monitoring**: Collect metrics
- **Proxy**: Forward requests
- **Profiling**: Profile main application
- **File sync**: Sync files với external storage
- **Service mesh**: Istio, Linkerd sidecars

### 3.3. Ví dụ Sidecar

**Ví dụ 1: Logging Sidecar**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-logging-sidecar
spec:
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/app
  
  # Logging sidecar
  - name: log-collector
    image: fluent/fluent-bit:latest
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/app
    command: ['fluent-bit']
    args:
    - -c
    - /fluent-bit/etc/fluent-bit.conf
  
  volumes:
  - name: shared-logs
    emptyDir: {}
```

**Ví dụ 2: Monitoring Sidecar**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-monitoring-sidecar
spec:
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  # Monitoring sidecar
  - name: prometheus-exporter
    image: prom/node-exporter:latest
    ports:
    - containerPort: 9100
    command: ['node_exporter']
    args:
    - '--path.procfs=/host/proc'
    - '--path.sysfs=/host/sys'
    volumeMounts:
    - name: proc
      mountPath: /host/proc
      readOnly: true
    - name: sys
      mountPath: /host/sys
      readOnly: true
  
  volumes:
  - name: proc
    hostPath:
      path: /proc
  - name: sys
    hostPath:
      path: /sys
```

**Ví dụ 3: Profiling Sidecar**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-profiler-sidecar
spec:
  # Share process namespace để sidecar có thể profile main container
  shareProcessNamespace: true
  
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  # Profiling sidecar
  - name: profiler
    image: async-profiler:latest
    command: ['sh', '-c']
    args:
    - |
      # Tìm PID của main app
      APP_PID=$(pgrep -f "node app.js")
      # Profile app
      java -jar async-profiler.jar -e cpu -d 60 -f /tmp/profile.html $APP_PID
    volumeMounts:
    - name: profile-output
      mountPath: /tmp
  
  volumes:
  - name: profile-output
    emptyDir: {}
```

**Ví dụ 4: Proxy Sidecar**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-proxy-sidecar
spec:
  containers:
  # Main container
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  # Proxy sidecar
  - name: nginx-proxy
    image: nginx:latest
    ports:
    - containerPort: 80
    volumeMounts:
    - name: nginx-config
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf
    command: ['nginx', '-g', 'daemon off;']
  
  volumes:
  - name: nginx-config
    configMap:
      name: nginx-proxy-config
```

## 4. Shared Resources

### 4.1. Shared Network

Containers trong cùng Pod chia sẻ network namespace:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-network
spec:
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  - name: sidecar
    image: sidecar:latest
    # Có thể access app qua localhost:8080
    command: ['sh', '-c', 'curl http://localhost:8080/health']
```

**Test:**

```bash
# Exec vào sidecar container
kubectl exec -it multi-container-network -c sidecar -- curl http://localhost:8080/health
```

### 4.2. Shared Volumes

Containers có thể chia sẻ volumes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-volume
spec:
  containers:
  - name: writer
    image: busybox:1.35
    command: ['sh', '-c', 'echo "Hello from writer" > /shared/data.txt && sleep 3600']
    volumeMounts:
    - name: shared-volume
      mountPath: /shared
  
  - name: reader
    image: busybox:1.35
    command: ['sh', '-c', 'cat /shared/data.txt && sleep 3600']
    volumeMounts:
    - name: shared-volume
      mountPath: /shared
  
  volumes:
  - name: shared-volume
    emptyDir: {}
```

### 4.3. Shared Process Namespace

Với `shareProcessNamespace: true`, containers có thể thấy processes của nhau:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-process-namespace
spec:
  shareProcessNamespace: true  # Share process namespace
  
  containers:
  - name: app
    image: my-app:latest
    # PID 1 trong container này
  
  - name: debugger
    image: busybox:1.35
    command: ['sh', '-c']
    args:
    - |
      # Có thể thấy processes của app container
      ps aux
      # Có thể send signal đến app process
      kill -USR1 1
```

**Use cases:**
- **Debugging**: Debug main container từ sidecar
- **Profiling**: Profile main container
- **Signal handling**: Send signals giữa containers

## 5. Container Communication

### 5.1. Localhost Communication

Containers trong cùng Pod communicate qua localhost:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: container-communication
spec:
  containers:
  - name: server
    image: nginx:latest
    ports:
    - containerPort: 80
  
  - name: client
    image: curlimages/curl:latest
    command: ['sh', '-c', 'curl http://localhost:80 && sleep 3600']
```

### 5.2. Shared Files

Containers communicate qua shared files:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: file-based-communication
spec:
  containers:
  - name: producer
    image: busybox:1.35
    command: ['sh', '-c']
    args:
    - |
      while true; do
        echo "$(date): Message" >> /shared/messages.txt
        sleep 5
      done
    volumeMounts:
    - name: shared
      mountPath: /shared
  
  - name: consumer
    image: busybox:1.35
    command: ['sh', '-c', 'tail -f /shared/messages.txt']
    volumeMounts:
    - name: shared
      mountPath: /shared
  
  volumes:
  - name: shared
    emptyDir: {}
```

### 5.3. Environment Variables

Containers có thể share environment variables qua ConfigMap/Secret:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-env
spec:
  containers:
  - name: app
    image: my-app:latest
    envFrom:
    - configMapRef:
        name: shared-config
  
  - name: sidecar
    image: sidecar:latest
    envFrom:
    - configMapRef:
        name: shared-config
```

## 6. Use Cases Chi tiết

### 6.1. Log Aggregation Pattern

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-log-aggregation
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
  
  - name: log-aggregator
    image: fluent/fluent-bit:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
    env:
    - name: FLUENT_BIT_OUTPUT
      value: "elasticsearch"
    - name: ELASTICSEARCH_HOST
      value: "elasticsearch-service:9200"
  
  volumes:
  - name: logs
    emptyDir: {}
```

### 6.2. Service Mesh Pattern

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-istio-sidecar
  labels:
    app: my-app
spec:
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
  
  # Istio sidecar (thường được inject tự động)
  - name: istio-proxy
    image: istio/proxyv2:latest
    ports:
    - containerPort: 15090
```

### 6.3. Database Migration Pattern

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-migration
spec:
  initContainers:
  - name: migrate
    image: my-app:migrate
    command: ['sh', '-c', 'npm run migrate']
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: url
  
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 8080
```

### 6.4. Config Reload Pattern

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config-reloader
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: config
      mountPath: /app/config
  
  - name: config-reloader
    image: jimmidyson/configmap-reload:latest
    args:
    - '--volume-dir=/config'
    - '--webhook-url=http://localhost:8080/reload'
    volumeMounts:
    - name: config
      mountPath: /config
  
  volumes:
  - name: config
    configMap:
      name: app-config
```

## 7. Best Practices

### 7.1. Khi nào dùng Multiple Containers?

**Nên dùng khi:**
- Containers cần chia sẻ network namespace (localhost communication)
- Containers cần chia sẻ storage (shared files)
- Containers có lifecycle gắn liền nhau
- Sidecar pattern (logging, monitoring, proxy)

**Không nên dùng khi:**
- Containers có thể scale độc lập
- Containers không cần chia sẻ resources
- Containers có lifecycle khác nhau
- Có thể tách thành separate Pods

### 7.2. Init Container Best Practices

- **Chạy nhanh**: Init containers nên hoàn thành nhanh
- **Idempotent**: Có thể chạy lại nhiều lần an toàn
- **Error handling**: Handle errors rõ ràng
- **Resource limits**: Set resource limits cho init containers
- **Logging**: Log rõ ràng để debug

### 7.3. Sidecar Best Practices

- **Independent**: Sidecar không nên phụ thuộc vào main container
- **Resource limits**: Set resource limits riêng
- **Health checks**: Có health checks cho sidecar
- **Graceful shutdown**: Handle shutdown gracefully
- **Documentation**: Document rõ mục đích của sidecar

### 7.4. Resource Management

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
        cpu: "500m"
        memory: "512Mi"
      limits:
        cpu: "1000m"
        memory: "1Gi"
  
  - name: sidecar
    image: sidecar:latest
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
```

## 8. Thực hành

### 8.1. Tạo Pod với Init Container

```bash
# Tạo namespace
kubectl create namespace multi-container-test

# Tạo Pod với init container
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
  namespace: multi-container-test
spec:
  initContainers:
  - name: init-setup
    image: busybox:1.35
    command: ['sh', '-c', 'echo "Init complete" && sleep 2']
  
  containers:
  - name: app
    image: nginx:latest
    ports:
    - containerPort: 80
EOF

# Xem logs của init container
kubectl logs app-with-init -c init-setup -n multi-container-test

# Xem status
kubectl get pod app-with-init -n multi-container-test
```

### 8.2. Tạo Pod với Sidecar

```bash
# Tạo Pod với logging sidecar
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
  namespace: multi-container-test
spec:
  containers:
  - name: app
    image: nginx:latest
    ports:
    - containerPort: 80
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  - name: log-reader
    image: busybox:1.35
    command: ['sh', '-c', 'tail -f /var/log/nginx/access.log']
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  volumes:
  - name: logs
    emptyDir: {}
EOF

# Xem logs của từng container
kubectl logs app-with-sidecar -c app -n multi-container-test
kubectl logs app-with-sidecar -c log-reader -n multi-container-test
```

### 8.3. Test Container Communication

```bash
# Tạo Pod với 2 containers communicate
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: communication-test
  namespace: multi-container-test
spec:
  containers:
  - name: server
    image: nginx:latest
    ports:
    - containerPort: 80
  
  - name: client
    image: curlimages/curl:latest
    command: ['sh', '-c', 'sleep 5 && curl http://localhost:80 && sleep 3600']
EOF

# Test communication
kubectl exec -it communication-test -c client -n multi-container-test -- curl http://localhost:80
```

### 8.4. Test Shared Volumes

```bash
# Tạo Pod với shared volume
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-test
  namespace: multi-container-test
spec:
  containers:
  - name: writer
    image: busybox:1.35
    command: ['sh', '-c', 'echo "Hello from writer" > /shared/data.txt && sleep 3600']
    volumeMounts:
    - name: shared
      mountPath: /shared
  
  - name: reader
    image: busybox:1.35
    command: ['sh', '-c', 'cat /shared/data.txt && sleep 3600']
    volumeMounts:
    - name: shared
      mountPath: /shared
  
  volumes:
  - name: shared
    emptyDir: {}
EOF

# Kiểm tra shared data
kubectl exec -it shared-volume-test -c reader -n multi-container-test -- cat /shared/data.txt
```

### 8.5. Test Shared Process Namespace

```bash
# Tạo Pod với shared process namespace
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: shared-process-test
  namespace: multi-container-test
spec:
  shareProcessNamespace: true
  
  containers:
  - name: app
    image: nginx:latest
  
  - name: debugger
    image: busybox:1.35
    command: ['sh', '-c', 'ps aux && sleep 3600']
EOF

# Xem processes từ debugger container
kubectl exec -it shared-process-test -c debugger -n multi-container-test -- ps aux
```

## 9. Debugging Multiple Container Pods

### 9.1. Xem Logs

```bash
# Xem logs của tất cả containers
kubectl logs multi-container-pod

# Xem logs của container cụ thể
kubectl logs multi-container-pod -c container-name

# Xem logs của init container
kubectl logs multi-container-pod -c init-container-name

# Follow logs
kubectl logs -f multi-container-pod -c container-name
```

### 9.2. Exec vào Container

```bash
# Exec vào container cụ thể
kubectl exec -it multi-container-pod -c container-name -- /bin/sh

# List containers trong pod
kubectl get pod multi-container-pod -o jsonpath='{.spec.containers[*].name}'

# Xem status của từng container
kubectl describe pod multi-container-pod
```

### 9.3. Debug Init Container Issues

```bash
# Xem init container status
kubectl describe pod my-pod | grep -A 10 "Init Containers"

# Xem init container logs
kubectl logs my-pod -c init-container-name

# Xem events
kubectl get events --field-selector involvedObject.name=my-pod
```

## 10. Troubleshooting

### 10.1. Init Container không hoàn thành

```bash
# Xem logs
kubectl logs my-pod -c init-container-name

# Xem events
kubectl describe pod my-pod

# Kiểm tra resource limits
kubectl get pod my-pod -o jsonpath='{.spec.initContainers[*].resources}'

# Test init container image riêng
kubectl run test-init --image=init-image:latest --rm -it --restart=Never -- /bin/sh
```

### 10.2. Sidecar không hoạt động

```bash
# Xem logs
kubectl logs my-pod -c sidecar-name

# Kiểm tra network connectivity
kubectl exec -it my-pod -c sidecar -- curl http://localhost:8080

# Kiểm tra volumes
kubectl describe pod my-pod | grep -A 5 "Volumes"
```

### 10.3. Containers không communicate được

```bash
# Test localhost connectivity
kubectl exec -it my-pod -c client -- curl http://localhost:8080

# Kiểm tra ports
kubectl get pod my-pod -o jsonpath='{.spec.containers[*].ports}'

# Kiểm tra network namespace
kubectl exec -it my-pod -c container1 -- netstat -tuln
```

## 11. Cleanup

```bash
# Xóa namespace
kubectl delete namespace multi-container-test

# Hoặc xóa từng pod
kubectl delete pod app-with-init -n multi-container-test
kubectl delete pod app-with-sidecar -n multi-container-test
```

## 12. Tóm tắt

- **Multiple Containers trong Pod**: Chia sẻ network, storage, và có thể chia sẻ process namespace
  - Init Containers: Chạy trước main containers
  - Sidecar Containers: Hỗ trợ main container
  - Shared resources: Network, volumes, process namespace

- **Init Containers**:
  - Chạy tuần tự trước main containers
  - Use cases: Setup, migrations, wait for services
  - Luôn restart nếu fail

- **Sidecar Containers**:
  - Chạy song song với main container
  - Use cases: Logging, monitoring, proxy, profiling
  - Independent lifecycle

- **Shared Resources**:
  - Network: localhost communication
  - Volumes: Shared files
  - Process namespace: See each other's processes

- **Best Practices**:
  - Chỉ dùng khi cần chia sẻ resources
  - Set resource limits cho từng container
  - Health checks cho sidecars
  - Document rõ mục đích của mỗi container
  - Test thoroughly trước khi deploy production