# Taint, Tolerations và Node Affinity trong Kubernetes

## 1. Tổng quan

Kubernetes cung cấp nhiều cách để kiểm soát pod scheduling:

- **Taint và Tolerations**: Ngăn pods được schedule lên một node (trừ khi pod có toleration)
- **Node Affinity**: Ưu tiên hoặc yêu cầu pods được schedule lên nodes cụ thể
- **Node Selector**: Cách đơn giản để chọn nodes dựa trên labels

### 1.1. Khi nào sử dụng?

**Taint và Tolerations:**
- Dành riêng nodes cho workloads cụ thể (ví dụ: GPU nodes cho ML workloads)
- Mark nodes là "unavailable" (maintenance, draining)
- Tách biệt workloads (production vs development)

**Node Affinity:**
- Yêu cầu pods chạy trên nodes có đặc điểm cụ thể (zone, instance type, etc.)
- Ưu tiên nodes cụ thể nhưng vẫn cho phép fallback
- Tối ưu performance (ví dụ: pods cần SSD chạy trên nodes có SSD)

## 2. Taint và Tolerations

### 2.1. Taint là gì?

Taint là một "marker" trên node để ngăn pods được schedule lên node đó, trừ khi pod có **toleration** tương ứng.

**Cấu trúc Taint:**
```
key=value:effect
```

**Effects:**
- **NoSchedule**: Pods không có toleration sẽ không được schedule
- **PreferNoSchedule**: Scheduler sẽ cố gắng tránh schedule, nhưng không bắt buộc
- **NoExecute**: Pods không có toleration sẽ bị evict (đã chạy sẽ bị terminate)

### 2.2. Tạo và quản lý Taint

**Thêm Taint:**

```bash
# Taint với NoSchedule
kubectl taint nodes node1 key1=value1:NoSchedule

# Taint với PreferNoSchedule
kubectl taint nodes node1 key1=value1:PreferNoSchedule

# Taint với NoExecute
kubectl taint nodes node1 key1=value1:NoExecute

# Taint master node (thường có sẵn)
kubectl taint nodes master node-role.kubernetes.io/master:NoSchedule
```

**Xem Taints:**

```bash
# Xem tất cả taints trên node
kubectl describe node node1 | grep Taint

# Hoặc
kubectl get node node1 -o jsonpath='{.spec.taints}'
```

**Xóa Taint:**

```bash
# Xóa taint
kubectl taint nodes node1 key1=value1:NoSchedule-

# Xóa tất cả taints
kubectl taint nodes node1 key1-  # Xóa tất cả taints với key "key1"
```

### 2.3. Tolerations

Toleration cho phép pod được schedule lên node có taint tương ứng.

**Cấu trúc Toleration:**

```yaml
tolerations:
- key: "key1"
  operator: "Equal"  # hoặc "Exists"
  value: "value1"
  effect: "NoSchedule"
  tolerationSeconds: 3600  # Chỉ cho NoExecute
```

**Operators:**
- **Equal**: Key và value phải match chính xác
- **Exists**: Chỉ cần key tồn tại (bỏ qua value)

### 2.4. Ví dụ Tolerations

**Toleration cho NoSchedule:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
  tolerations:
  - key: "key1"
    operator: "Equal"
    value: "value1"
    effect: "NoSchedule"
```

**Toleration cho NoExecute:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: my-app:latest
  tolerations:
  - key: "key1"
    operator: "Equal"
    value: "value1"
    effect: "NoExecute"
    tolerationSeconds: 3600  # Cho phép chạy 1 giờ sau khi taint được thêm
```

**Toleration với Exists (match bất kỳ value nào):**

```yaml
tolerations:
- key: "node-type"
  operator: "Exists"
  effect: "NoSchedule"
```

**Toleration cho tất cả taints:**

```yaml
tolerations:
- operator: "Exists"  # Match tất cả keys và effects
```

### 2.5. Use Cases

**1. Dành riêng nodes cho GPU workloads:**

```bash
# Taint GPU nodes
kubectl taint nodes gpu-node-1 gpu=true:NoSchedule
kubectl taint nodes gpu-node-2 gpu=true:NoSchedule

# Pod với toleration
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  containers:
  - name: training
    image: ml-training:latest
  tolerations:
  - key: "gpu"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
```

**2. Maintenance mode:**

```bash
# Taint node để maintenance
kubectl taint nodes node1 maintenance=true:NoExecute

# Pods không có toleration sẽ bị evict
# Pods có toleration sẽ tiếp tục chạy
```

**3. Tách biệt production và development:**

```bash
# Taint dev nodes
kubectl taint nodes dev-node-1 environment=dev:NoSchedule

# Dev pods có toleration
tolerations:
- key: "environment"
  operator: "Equal"
  value: "dev"
  effect: "NoSchedule"
```

## 3. Node Affinity

Node Affinity cho phép bạn điều khiển pod được schedule lên nodes dựa trên node labels.

### 3.1. Node Selector (Simple)

Node Selector là cách đơn giản nhất để chọn nodes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  nodeSelector:
    disktype: ssd
    zone: us-west-1a
  containers:
  - name: app
    image: my-app:latest
```

**Label nodes:**

```bash
# Label node
kubectl label nodes node1 disktype=ssd
kubectl label nodes node1 zone=us-west-1a

# Xem labels
kubectl get nodes --show-labels
```

### 3.2. Node Affinity Types

Có 2 loại Node Affinity:

- **requiredDuringSchedulingIgnoredDuringExecution** (Hard requirement): Pod phải được schedule lên node match, nếu không sẽ pending
- **preferredDuringSchedulingIgnoredDuringExecution** (Soft preference): Ưu tiên nodes match, nhưng vẫn có thể schedule lên nodes khác

### 3.3. Required Node Affinity

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
          - key: zone
            operator: In
            values:
            - us-west-1a
            - us-west-1b
  containers:
  - name: app
    image: my-app:latest
```

**Operators:**
- **In**: Value phải trong danh sách
- **NotIn**: Value không được trong danh sách
- **Exists**: Key phải tồn tại
- **DoesNotExist**: Key không được tồn tại
- **Gt**: Value lớn hơn (cho số)
- **Lt**: Value nhỏ hơn (cho số)

### 3.4. Preferred Node Affinity

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
      - weight: 50
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values:
            - us-west-1a
  containers:
  - name: app
    image: my-app:latest
```

**Weight**: 1-100, càng cao càng ưu tiên

### 3.5. Kết hợp Required và Preferred

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
  containers:
  - name: app
    image: my-app:latest
```

### 3.6. Use Cases

**1. Yêu cầu nodes có SSD:**

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: disktype
          operator: In
          values:
          - ssd
```

**2. Ưu tiên nodes trong zone cụ thể:**

```yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      preference:
        matchExpressions:
        - key: topology.kubernetes.io/zone
          operator: In
          values:
          - us-west-1a
```

**3. Tránh nodes có label cụ thể:**

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: node-type
          operator: NotIn
          values:
          - maintenance
```

## 4. Pod Affinity và Anti-Affinity

Pod Affinity cho phép bạn điều khiển pod được schedule dựa trên pods khác.

### 4.1. Pod Affinity

**Required Pod Affinity:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: frontend
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - backend
        topologyKey: kubernetes.io/hostname  # Cùng node
  containers:
  - name: app
    image: frontend:latest
```

**Preferred Pod Affinity:**

```yaml
affinity:
  podAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - cache
        topologyKey: topology.kubernetes.io/zone  # Cùng zone
```

### 4.2. Pod Anti-Affinity

Pod Anti-Affinity ngăn pods được schedule gần nhau.

**Required Pod Anti-Affinity:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - my-app
            topologyKey: kubernetes.io/hostname  # Khác node
      containers:
      - name: app
        image: my-app:latest
```

**Preferred Pod Anti-Affinity:**

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - my-app
        topologyKey: topology.kubernetes.io/zone  # Khác zone
```

### 4.3. Topology Keys

Topology keys xác định "gần nhau" nghĩa là gì:

- **kubernetes.io/hostname**: Cùng node
- **topology.kubernetes.io/zone**: Cùng availability zone
- **topology.kubernetes.io/region**: Cùng region
- **beta.kubernetes.io/instance-type**: Cùng instance type

### 4.4. Use Cases

**1. High Availability (pods khác node):**

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - my-app
      topologyKey: kubernetes.io/hostname
```

**2. Multi-AZ deployment (pods khác zone):**

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - my-app
        topologyKey: topology.kubernetes.io/zone
```

**3. Co-locate pods (cùng node):**

```yaml
affinity:
  podAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - cache
      topologyKey: kubernetes.io/hostname
```

## 5. Thực hành: Taint và Tolerations

### 5.1. Tạo và quản lý Taints

**Bước 1: Label nodes**

```bash
# Tạo namespace
kubectl create namespace taint-test

# Label nodes
kubectl label nodes node1 node-type=gpu
kubectl label nodes node2 node-type=cpu
kubectl label nodes node3 node-type=cpu

# Xem labels
kubectl get nodes --show-labels
```

**Bước 2: Taint GPU node**

```bash
# Taint GPU node
kubectl taint nodes node1 node-type=gpu:NoSchedule

# Xem taint
kubectl describe node node1 | grep Taint
```

**Bước 3: Tạo pod không có toleration**

```yaml
# pod-no-toleration.yaml
apiVersion: v1
kind: Pod
metadata:
  name: normal-pod
  namespace: taint-test
spec:
  containers:
  - name: app
    image: nginx:latest
```

```bash
# Apply
kubectl apply -f pod-no-toleration.yaml

# Kiểm tra (sẽ pending vì không có toleration)
kubectl get pods -n taint-test
kubectl describe pod normal-pod -n taint-test
```

**Bước 4: Tạo pod có toleration**

```yaml
# pod-with-toleration.yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
  namespace: taint-test
spec:
  containers:
  - name: app
    image: nginx:latest
  tolerations:
  - key: "node-type"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
```

```bash
# Apply
kubectl apply -f pod-with-toleration.yaml

# Kiểm tra (sẽ chạy trên GPU node)
kubectl get pods -n taint-test -o wide
```

**Bước 5: Test NoExecute**

```bash
# Thêm NoExecute taint
kubectl taint nodes node1 node-type=gpu:NoExecute

# Pods không có toleration sẽ bị evict
kubectl get pods -n taint-test

# Pods có toleration sẽ tiếp tục chạy
```

**Bước 6: Xóa taint**

```bash
# Xóa taint
kubectl taint nodes node1 node-type=gpu:NoSchedule-
kubectl taint nodes node1 node-type=gpu:NoExecute-

# Pods bây giờ có thể schedule bình thường
```

### 5.2. Thực hành Node Affinity

**Bước 1: Label nodes với đặc điểm**

```bash
# Label nodes
kubectl label nodes node1 disktype=ssd zone=us-west-1a
kubectl label nodes node2 disktype=hdd zone=us-west-1b
kubectl label nodes node3 disktype=ssd zone=us-west-1b

# Xem labels
kubectl get nodes --show-labels
```

**Bước 2: Pod với Node Selector**

```yaml
# pod-node-selector.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-ssd
  namespace: taint-test
spec:
  nodeSelector:
    disktype: ssd
  containers:
  - name: app
    image: nginx:latest
```

```bash
# Apply
kubectl apply -f pod-node-selector.yaml

# Kiểm tra (sẽ chạy trên node có disktype=ssd)
kubectl get pods -n taint-test -o wide
```

**Bước 3: Pod với Required Node Affinity**

```yaml
# pod-required-affinity.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-required-affinity
  namespace: taint-test
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
          - key: zone
            operator: In
            values:
            - us-west-1a
            - us-west-1b
  containers:
  - name: app
    image: nginx:latest
```

```bash
# Apply
kubectl apply -f pod-required-affinity.yaml

# Kiểm tra
kubectl get pods -n taint-test -o wide
```

**Bước 4: Pod với Preferred Node Affinity**

```yaml
# pod-preferred-affinity.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-preferred-affinity
  namespace: taint-test
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
      - weight: 50
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values:
            - us-west-1a
  containers:
  - name: app
    image: nginx:latest
```

```bash
# Apply
kubectl apply -f pod-preferred-affinity.yaml

# Kiểm tra (ưu tiên ssd và us-west-1a, nhưng vẫn có thể schedule nơi khác)
kubectl get pods -n taint-test -o wide
```

### 5.3. Thực hành Pod Anti-Affinity

**Bước 1: Deployment với Pod Anti-Affinity**

```yaml
# deployment-anti-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: taint-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - my-app
            topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: nginx:latest
```

```bash
# Apply
kubectl apply -f deployment-anti-affinity.yaml

# Kiểm tra (mỗi pod trên node khác nhau)
kubectl get pods -n taint-test -o wide
```

**Bước 2: Preferred Anti-Affinity**

```yaml
# deployment-preferred-anti-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-preferred
  namespace: taint-test
spec:
  replicas: 5
  selector:
    matchLabels:
      app: my-app-preferred
  template:
    metadata:
      labels:
        app: my-app-preferred
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - my-app-preferred
              topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: nginx:latest
```

```bash
# Apply
kubectl apply -f deployment-preferred-anti-affinity.yaml

# Kiểm tra (ưu tiên khác node, nhưng có thể có nhiều pods trên cùng node)
kubectl get pods -n taint-test -o wide
```

## 6. Best Practices

### 6.1. Taint và Tolerations

- **Sử dụng taints cho dedicated nodes**: GPU nodes, special hardware
- **Maintenance mode**: Sử dụng NoExecute để drain nodes
- **Environment separation**: Tách biệt dev/staging/prod
- **Avoid over-toleration**: Chỉ thêm tolerations khi thực sự cần
- **Document taints**: Ghi chú rõ ràng về mục đích của mỗi taint

### 6.2. Node Affinity

- **Use nodeSelector cho simple cases**: Đơn giản và dễ hiểu
- **Required cho critical requirements**: Khi bắt buộc phải có đặc điểm cụ thể
- **Preferred cho optimization**: Khi muốn tối ưu nhưng không bắt buộc
- **Combine với pod anti-affinity**: Đảm bảo high availability
- **Test thoroughly**: Test affinity rules trước khi deploy production

### 6.3. Pod Affinity và Anti-Affinity

- **Required anti-affinity cho HA**: Đảm bảo pods khác node/zone
- **Preferred anti-affinity cho optimization**: Ưu tiên spread nhưng không bắt buộc
- **Topology keys**: Chọn topology key phù hợp (hostname, zone, region)
- **Performance impact**: Anti-affinity có thể làm chậm scheduling
- **Balance**: Cân bằng giữa HA và resource utilization

## 7. Troubleshooting

### 7.1. Pod bị Pending

```bash
# Xem lý do pending
kubectl describe pod my-pod

# Kiểm tra taints
kubectl describe node node1 | grep Taint

# Kiểm tra node affinity
kubectl get pod my-pod -o yaml | grep -A 10 affinity

# Kiểm tra node labels
kubectl get nodes --show-labels
```

### 7.2. Pod không schedule đúng node

```bash
# Xem pod events
kubectl describe pod my-pod

# Xem node labels
kubectl get nodes --show-labels

# Xem node capacity
kubectl describe node node1

# Test node selector
kubectl get nodes -l disktype=ssd
```

### 7.3. Pods không spread đúng

```bash
# Xem pod distribution
kubectl get pods -o wide

# Kiểm tra anti-affinity rules
kubectl get deployment my-app -o yaml | grep -A 20 affinity

# Kiểm tra topology keys
kubectl get nodes -o custom-columns=NAME:.metadata.name,ZONE:.metadata.labels.topology\.kubernetes\.io/zone
```

## 8. Cleanup

```bash
# Xóa namespace
kubectl delete namespace taint-test

# Xóa taints
kubectl taint nodes node1 node-type=gpu:NoSchedule-
kubectl taint nodes node1 node-type=gpu:NoExecute-

# Xóa labels
kubectl label nodes node1 disktype-
kubectl label nodes node1 zone-
```

## 9. Tóm tắt

- **Taint và Tolerations**: Kiểm soát pods được schedule lên nodes
  - NoSchedule: Ngăn schedule
  - PreferNoSchedule: Ưu tiên tránh
  - NoExecute: Evict pods không có toleration
  - Use cases: Dedicated nodes, maintenance, environment separation

- **Node Affinity**: Điều khiển pod scheduling dựa trên node labels
  - Node Selector: Cách đơn giản
  - Required: Hard requirement
  - Preferred: Soft preference
  - Operators: In, NotIn, Exists, DoesNotExist, Gt, Lt

- **Pod Affinity và Anti-Affinity**: Điều khiển scheduling dựa trên pods khác
  - Pod Affinity: Co-locate pods
  - Pod Anti-Affinity: Spread pods
  - Topology keys: hostname, zone, region
  - Use cases: HA, performance optimization

- **Best Practices**:
  - Sử dụng taints cho dedicated nodes
  - Required affinity cho critical requirements
  - Preferred affinity cho optimization
  - Anti-affinity cho high availability
  - Test thoroughly trước khi deploy production