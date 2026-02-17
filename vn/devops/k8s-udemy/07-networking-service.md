# Networking trong Kubernetes

## 1. Tổng quan về Networking trong Kubernetes

Kubernetes networking giải quyết các vấn đề:
- **Pod-to-Pod communication**: Pods có thể giao tiếp với nhau trong cluster
- **Service discovery**: Tìm và kết nối đến services
- **External access**: Expose services ra ngoài cluster
- **Network policies**: Kiểm soát traffic giữa các pods

### 1.1. Networking Model của Kubernetes

Kubernetes có các nguyên tắc networking cơ bản:

1. **Mỗi Pod có IP riêng**: Mọi pod có IP address duy nhất trong cluster
2. **Pods có thể giao tiếp trực tiếp**: Không cần NAT giữa các pods
3. **Agents trên node có thể giao tiếp với pods**: Node có thể giao tiếp với tất cả pods trên node đó

### 1.2. CNI (Container Network Interface)

CNI là plugin cung cấp networking cho pods. Các CNI phổ biến:

- **Calico**: Policy-driven networking, hỗ trợ NetworkPolicy tốt
- **Flannel**: Đơn giản, overlay network
- **Cilium**: eBPF-based, hiệu năng cao
- **Weave**: Tự động mesh networking
- **Antrea**: VMware, hỗ trợ tốt NetworkPolicy

## 2. Service

Service là abstraction cung cấp stable network endpoint để truy cập pods. Service giải quyết vấn đề:
- Pods có IP động (thay đổi khi restart)
- Load balancing giữa nhiều pods
- Service discovery

### 2.1. Các loại Service

#### ClusterIP (Mặc định)
- Chỉ accessible trong cluster
- Có virtual IP được assign bởi Kubernetes
- DNS name: `<service-name>.<namespace>.svc.cluster.local`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: bottleneck-resolve
  namespace: bottleneck-resolve
spec:
  type: ClusterIP  # Mặc định, có thể bỏ qua
  selector:
    app: bottleneck-resolve
  ports:
  - port: 80        # Port của service
    targetPort: 8080 # Port của pod
    protocol: TCP
```

#### NodePort
- Expose service trên mỗi node tại một port cố định (30000-32767)
- Accessible từ bên ngoài cluster qua `<node-ip>:<nodeport>`
- Tự động tạo ClusterIP

```yaml
apiVersion: v1
kind: Service
metadata:
  name: bottleneck-resolve-nodeport
  namespace: bottleneck-resolve
spec:
  type: NodePort
  selector:
    app: bottleneck-resolve
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # Optional, nếu không chỉ định sẽ random
    protocol: TCP
```

#### LoadBalancer
- Tạo external load balancer (cloud provider)
- Tự động tạo NodePort và ClusterIP
- Chỉ hoạt động với cloud providers (AWS, GCP, Azure)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: bottleneck-resolve-lb
  namespace: bottleneck-resolve
spec:
  type: LoadBalancer
  selector:
    app: bottleneck-resolve
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
```

#### ExternalName
- Map service đến external DNS name
- Không có selector, không tạo endpoints
- Trả về CNAME record

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
  namespace: bottleneck-resolve
spec:
  type: ExternalName
  externalName: database.example.com
```

### 2.2. Service Selector và Endpoints

Service sử dụng selector để tìm pods. Kubernetes tự động tạo Endpoints object:

```bash
# Xem service
kubectl get svc bottleneck-resolve -n bottleneck-resolve

# Xem endpoints (pods mà service route đến)
kubectl get endpoints bottleneck-resolve -n bottleneck-resolve

# Xem chi tiết endpoints
kubectl describe endpoints bottleneck-resolve -n bottleneck-resolve
```

### 2.3. Session Affinity

Đảm bảo requests từ cùng client đi đến cùng pod:

```yaml
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 hours
```

### 2.4. Headless Service

Service không có ClusterIP (clusterIP: None), trả về IPs của pods trực tiếp:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-service
spec:
  clusterIP: None  # Headless service
  selector:
    app: bottleneck-resolve
  ports:
  - port: 80
    targetPort: 8080
```

**Use cases:**
- StatefulSets (mỗi pod có stable identity)
- Service discovery khi cần IP của từng pod
- Database clusters

## 3. DNS và Service Discovery

Kubernetes có built-in DNS server (CoreDNS) cung cấp service discovery.

### 3.1. DNS Records

**Service DNS:**
- Format: `<service-name>.<namespace>.svc.cluster.local`
- Short form: `<service-name>.<namespace>` hoặc `<service-name>` (trong cùng namespace)

**Ví dụ:**
```bash
# Trong namespace bottleneck-resolve
curl http://bottleneck-resolve/  # Short form
curl http://bottleneck-resolve.bottleneck-resolve.svc.cluster.local/  # FQDN

# Từ namespace khác
curl http://bottleneck-resolve.bottleneck-resolve.svc.cluster.local/
```

**Pod DNS:**
- Headless service: `<pod-name>.<service-name>.<namespace>.svc.cluster.local`
- StatefulSet: `<pod-name>.<headless-service-name>.<namespace>.svc.cluster.local`

### 3.2. CoreDNS Configuration

CoreDNS config map:

```bash
# Xem CoreDNS config
kubectl get configmap coredns -n kube-system -o yaml
```

## 4. Ingress

Ingress cung cấp HTTP/HTTPS routing từ bên ngoài cluster vào services. Cần Ingress Controller để hoạt động.

### 4.1. Ingress Controller

Các Ingress Controller phổ biến:
- **NGINX Ingress Controller**: Phổ biến nhất
- **Traefik**: Tự động discovery
- **HAProxy**: Hiệu năng cao
- **Istio Gateway**: Service mesh
- **AWS ALB Ingress Controller**: Tích hợp với AWS

### 4.2. Ingress Resource

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bottleneck-resolve-ingress
  namespace: bottleneck-resolve
  annotations:
    # NGINX Ingress Controller annotations
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    # cert-manager annotation
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - bottleneck-resolve.example.com
    secretName: bottleneck-resolve-tls
  rules:
  - host: bottleneck-resolve.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bottleneck-resolve
            port:
              number: 80
```

### 4.3. Path Types

- **Prefix**: Match path prefix (ví dụ: `/api` match `/api/v1`, `/api/users`)
- **Exact**: Exact match (ví dụ: `/api` chỉ match `/api`)
- **ImplementationSpecific**: Phụ thuộc vào Ingress Controller

### 4.4. Multiple Paths và Hosts

```yaml
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## 5. NetworkPolicy

NetworkPolicy là firewall rules cho pods, kiểm soát ingress và egress traffic.

NetworkPolicy không kiểm soát traffic từ Internet vào cluster (đó là việc của Ingress Controller, LoadBalancer, firewall).

NetworkPolicy kiểm soát luồng mạng giữa các Pod trong cluster.

Ingress/Egress trong NetworkPolicy

Đây là khái niệm luồng mạng nội bộ giữa các Pod:

Ingress: traffic đi vào Pod (ai được phép gọi đến Pod này).

Egress: traffic đi ra từ Pod (Pod này được phép gọi đến đâu).

**Lưu ý**: Cần CNI plugin hỗ trợ NetworkPolicy (Calico, Cilium, Antrea, etc.)

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
  
  # Policy types
  policyTypes:
  - Ingress  # Incoming traffic rules
  - Egress   # Outgoing traffic rules
  
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
    - namespaceSelector: {}  # All namespaces
    ports:
    - protocol: UDP
      port: 53  # DNS
  - to: []  # Allow all egress
    ports:
    - protocol: TCP
      port: 443  # HTTPS
```

### 5.2. Selectors trong NetworkPolicy

**Pod Selector:**
```yaml
ingress:
- from:
  - podSelector:
      matchLabels:
        app: frontend
```

**Namespace Selector:**
```yaml
ingress:
- from:
  - namespaceSelector:
      matchLabels:
        name: monitoring
```

**IP Block:**
```yaml
ingress:
- from:
  - ipBlock:
      cidr: 10.0.0.0/8
      except:
      - 10.0.0.0/24
```

**Kết hợp nhiều selectors:**
```yaml
ingress:
- from:
  - podSelector:
      matchLabels:
        app: frontend
    namespaceSelector:
      matchLabels:
        name: production
```

### 5.3. Default Deny và Allow All

**Default Deny (Deny tất cả, chỉ allow những gì được chỉ định):**
```yaml
spec:
  podSelector: {}  # Áp dụng cho tất cả pods trong namespace
  policyTypes:
  - Ingress
  - Egress
  # Không có ingress/egress rules = deny all
```

**Allow All:**
```yaml
spec:
  podSelector:
    matchLabels:
      app: bottleneck-resolve
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - {}  # Allow all ingress
  egress:
  - {}  # Allow all egress
```

## 6. Thực hành: Test Networking

### 6.1. Test Service Discovery

**Bước 1: Tạo deployment và service**

```bash
# Tạo namespace
kubectl create namespace networking-test

# Tạo deployment
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-test
  namespace: networking-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-test
  template:
    metadata:
      labels:
        app: nginx-test
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
EOF

# Tạo service
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: nginx-test
  namespace: networking-test
spec:
  selector:
    app: nginx-test
  ports:
  - port: 80
    targetPort: 80
EOF
```

**Bước 2: Test DNS resolution**

```bash
# Tạo test pod
kubectl run test-pod --image=busybox:1.35 --rm -it --restart=Never \
  -n networking-test -- sh

# Trong test pod, test DNS
nslookup nginx-test
nslookup nginx-test.networking-test.svc.cluster.local

# Test HTTP request
wget -O- http://nginx-test/
```

**Bước 3: Test từ namespace khác**

```bash
# Tạo pod trong namespace khác
kubectl run test-pod-2 --image=curlimages/curl --rm -it --restart=Never \
  -- sh

# Test DNS (phải dùng FQDN)
nslookup nginx-test.networking-test.svc.cluster.local

# Test HTTP
curl http://nginx-test.networking-test.svc.cluster.local/
```

### 6.2. Test Service Types

**Test ClusterIP:**
```bash
# Tạo ClusterIP service
kubectl expose deployment nginx-test \
  --type=ClusterIP \
  --port=80 \
  --name=nginx-clusterip \
  -n networking-test

# Test từ trong cluster
kubectl run test --image=curlimages/curl --rm -it --restart=Never \
  -n networking-test -- curl http://nginx-clusterip/
```

**Test NodePort:**
```bash
# Tạo NodePort service
kubectl expose deployment nginx-test \
  --type=NodePort \
  --port=80 \
  --name=nginx-nodeport \
  -n networking-test

# Lấy nodeport
NODEPORT=$(kubectl get svc nginx-nodeport -n networking-test -o jsonpath='{.spec.ports[0].nodePort}')
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

# Test từ bên ngoài (nếu có quyền truy cập node)
curl http://$NODE_IP:$NODEPORT/
```

**Test LoadBalancer:**
```bash
# Tạo LoadBalancer service (chỉ hoạt động với cloud provider)
kubectl expose deployment nginx-test \
  --type=LoadBalancer \
  --port=80 \
  --name=nginx-lb \
  -n networking-test

# Xem external IP
kubectl get svc nginx-lb -n networking-test -w
```

### 6.3. Test Headless Service

```bash
# Tạo headless service
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
  namespace: networking-test
spec:
  clusterIP: None
  selector:
    app: nginx-test
  ports:
  - port: 80
    targetPort: 80
EOF

# Test DNS resolution (trả về IPs của tất cả pods)
kubectl run test --image=busybox:1.35 --rm -it --restart=Never \
  -n networking-test -- nslookup nginx-headless

# Xem endpoints
kubectl get endpoints nginx-headless -n networking-test
```

### 6.4. Test Ingress

**Bước 1: Cài đặt NGINX Ingress Controller (nếu chưa có)**

```bash
# Sử dụng Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Hoặc sử dụng kubectl
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

**Bước 2: Tạo Ingress**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: networking-test
spec:
  ingressClassName: nginx
  rules:
  - host: nginx-test.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-test
            port:
              number: 80
EOF
```

**Bước 3: Test Ingress**

```bash
# Lấy Ingress Controller IP
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test với Host header
curl -H "Host: nginx-test.local" http://$INGRESS_IP/

# Hoặc thêm vào /etc/hosts
echo "$INGRESS_IP nginx-test.local" | sudo tee -a /etc/hosts
curl http://nginx-test.local/
```

### 6.5. Test NetworkPolicy

**Bước 1: Kiểm tra CNI hỗ trợ NetworkPolicy**

```bash
# Xem CNI plugin
kubectl get pods -n kube-system | grep -E 'calico|cilium|antrea'

# Test tạo NetworkPolicy
kubectl create namespace networkpolicy-test
```

**Bước 2: Tạo pods và services**

```bash
# Tạo server pod
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server
  namespace: networkpolicy-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
EOF

# Tạo client pod
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client
  namespace: networkpolicy-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
      - name: curl
        image: curlimages/curl
        command: ["sleep", "3600"]
EOF

# Tạo service
kubectl expose deployment server --port=80 -n networkpolicy-test
```

**Bước 3: Test không có NetworkPolicy (allow all)**

```bash
# Test từ client đến server
CLIENT_POD=$(kubectl get pod -l app=client -n networkpolicy-test -o name)
kubectl exec -it $CLIENT_POD -n networkpolicy-test -- \
  curl http://server/

# Kết quả: Thành công (vì chưa có NetworkPolicy)
```

**Bước 4: Tạo NetworkPolicy (default deny)**

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: server-network-policy
  namespace: networkpolicy-test
spec:
  podSelector:
    matchLabels:
      app: server
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: client
    ports:
    - protocol: TCP
      port: 80
EOF
```

**Bước 5: Test với NetworkPolicy**

```bash
# Test từ client (có label app=client) - Should work
CLIENT_POD=$(kubectl get pod -l app=client -n networkpolicy-test -o name)
kubectl exec -it $CLIENT_POD -n networkpolicy-test -- \
  curl http://server/

# Tạo pod khác không có label app=client
kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never \
  -n networkpolicy-test -- curl http://server/

# Kết quả: Timeout hoặc connection refused (bị block bởi NetworkPolicy)
```

**Bước 6: Test Egress Policy**

```bash
# Tạo NetworkPolicy cho client (chỉ allow egress đến server)
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: client-network-policy
  namespace: networkpolicy-test
spec:
  podSelector:
    matchLabels:
      app: client
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: server
    ports:
    - protocol: TCP
      port: 80
  - to: []  # Allow DNS
    ports:
    - protocol: UDP
      port: 53
EOF

# Test từ client
CLIENT_POD=$(kubectl get pod -l app=client -n networkpolicy-test -o name)
kubectl exec -it $CLIENT_POD -n networkpolicy-test -- \
  curl http://server/  # Should work

# Test đến external (should fail)
kubectl exec -it $CLIENT_POD -n networkpolicy-test -- \
  curl http://google.com/  # Should timeout
```

### 6.6. Debugging Networking Issues

**Kiểm tra Service và Endpoints:**
```bash
# Xem service
kubectl get svc -n networking-test

# Xem endpoints
kubectl get endpoints -n networking-test

# Xem chi tiết
kubectl describe svc nginx-test -n networking-test
kubectl describe endpoints nginx-test -n networking-test
```

**Kiểm tra DNS:**
```bash
# Test DNS từ pod
kubectl run test --image=busybox:1.35 --rm -it --restart=Never \
  -n networking-test -- nslookup nginx-test

# Xem CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns
```

**Kiểm tra NetworkPolicy:**
```bash
# Xem NetworkPolicy
kubectl get networkpolicy -n networkpolicy-test
kubectl describe networkpolicy server-network-policy -n networkpolicy-test

# Test connectivity
kubectl run test --image=curlimages/curl --rm -it --restart=Never \
  -n networkpolicy-test -- curl -v http://server/
```

**Kiểm tra Ingress:**
```bash
# Xem Ingress
kubectl get ingress -n networking-test
kubectl describe ingress nginx-ingress -n networking-test

# Xem Ingress Controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## 7. Best Practices

### 7.1. Service Design

- **Sử dụng ClusterIP cho internal services**: Chỉ expose khi cần thiết
- **Sử dụng labels và selectors nhất quán**: Dễ quản lý và debug
- **Đặt tên service rõ ràng**: `<app-name>-<purpose>` (ví dụ: `backend-api`, `frontend-web`)
- **Sử dụng named ports**: Dễ maintain khi thay đổi port numbers

### 7.2. Ingress Best Practices

- **Sử dụng TLS/HTTPS**: Luôn enable TLS cho production
- **Sử dụng cert-manager**: Tự động quản lý certificates
- **Rate limiting**: Bảo vệ backend khỏi DDoS
- **Path-based routing**: Tách biệt services bằng paths
- **Host-based routing**: Sử dụng multiple hosts cho multi-tenant

### 7.3. NetworkPolicy Best Practices

- **Default deny, explicit allow**: Bắt đầu với deny all, sau đó allow từng rule
- **Namespace isolation**: Sử dụng namespaceSelector để isolate namespaces
- **Least privilege**: Chỉ allow những gì cần thiết
- **Test thoroughly**: Test NetworkPolicy trước khi deploy production
- **Document policies**: Ghi chú rõ ràng về mục đích của mỗi policy

### 7.4. DNS Best Practices

- **Sử dụng FQDN khi cross-namespace**: Tránh lỗi khi pods ở namespace khác
- **Sử dụng short names trong cùng namespace**: Code sạch hơn
- **Cache DNS queries**: Giảm load cho CoreDNS
- **Monitor CoreDNS**: Đảm bảo DNS service healthy

## 8. Troubleshooting

### 8.1. Service không route traffic

```bash
# Kiểm tra selector match với pod labels
kubectl get pods -l app=nginx-test -n networking-test
kubectl get svc nginx-test -n networking-test -o yaml

# Kiểm tra endpoints
kubectl get endpoints nginx-test -n networking-test

# Kiểm tra pod readiness
kubectl get pods -n networking-test
```

### 8.2. DNS không resolve

```bash
# Kiểm tra CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS từ pod
kubectl run test --image=busybox:1.35 --rm -it --restart=Never \
  -- nslookup kubernetes.default

# Xem CoreDNS config
kubectl get configmap coredns -n kube-system -o yaml
```

### 8.3. Ingress không hoạt động

```bash
# Kiểm tra Ingress Controller
kubectl get pods -n ingress-nginx

# Kiểm tra Ingress resource
kubectl describe ingress nginx-ingress -n networking-test

# Xem Ingress Controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

### 8.4. NetworkPolicy block traffic

```bash
# Xem NetworkPolicy
kubectl get networkpolicy -A

# Test connectivity
kubectl run test --image=curlimages/curl --rm -it --restart=Never \
  -- curl -v http://target-service/

# Kiểm tra CNI plugin
kubectl get pods -n kube-system | grep -E 'calico|cilium'
```

## 9. Cleanup

```bash
# Xóa test resources
kubectl delete namespace networking-test
kubectl delete namespace networkpolicy-test

# Hoặc xóa từng resource
kubectl delete deployment nginx-test -n networking-test
kubectl delete svc nginx-test -n networking-test
kubectl delete ingress nginx-ingress -n networking-test
```

## 10. Tóm tắt

- **Service**: Cung cấp stable endpoint và load balancing cho pods
  - ClusterIP: Internal only
  - NodePort: Expose trên node port
  - LoadBalancer: External load balancer
  - ExternalName: Map đến external DNS

- **DNS**: CoreDNS cung cấp service discovery
  - Format: `<service>.<namespace>.svc.cluster.local`
  - Short form trong cùng namespace: `<service>`

- **Ingress**: HTTP/HTTPS routing từ external vào services
  - Cần Ingress Controller
  - Hỗ trợ TLS, path-based routing, host-based routing

- **NetworkPolicy**: Firewall rules cho pods
  - Kiểm soát ingress/egress traffic
  - Cần CNI plugin hỗ trợ
  - Best practice: Default deny, explicit allow

- **Best Practices**:
  - Sử dụng ClusterIP cho internal services
  - Enable TLS cho Ingress
  - Áp dụng NetworkPolicy cho security
  - Monitor DNS và networking components
