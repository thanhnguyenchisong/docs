# State Persistence trong Kubernetes

## 1. Tổng quan về State Persistence

Kubernetes cung cấp nhiều cách để persist data:

- **Volumes**: Mount storage vào pods
- **PersistentVolumes (PV)**: Cluster-level storage resources
- **PersistentVolumeClaims (PVC)**: User requests cho storage
- **StorageClasses**: Dynamic provisioning của storage
- **StatefulSets**: Workloads cần stable storage và identity

### 1.1. Tại sao cần State Persistence?

- **Data durability**: Data không bị mất khi pod restart
- **Stateful applications**: Databases, message queues cần persistent storage
- **Shared storage**: Multiple pods có thể share data
- **Backup và restore**: Dễ dàng backup và restore data

### 1.2. Volume Lifecycle

```
┌─────────────┐
│   Pod       │
│  (Volume)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   PVC       │
│ (Claim)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     PV      │
│  (Volume)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Storage   │
│  (Backend)  │
└─────────────┘
```

## 2. Volume Types

### 2.1. emptyDir

emptyDir là temporary storage được tạo khi pod start và xóa khi pod terminate.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-pod
spec:
  containers:
  - name: app
    image: nginx:latest
    volumeMounts:
    - name: temp-storage
      mountPath: /tmp
  volumes:
  - name: temp-storage
    emptyDir: {}
```

**Use cases:**
- Temporary files
- Cache
- Scratch space
- Shared memory giữa containers trong cùng pod

**Size limit:**

```yaml
volumes:
- name: temp-storage
  emptyDir:
    sizeLimit: 1Gi  # Optional size limit
```

### 2.2. hostPath

hostPath mount file hoặc directory từ node vào pod.

```yaml
volumes:
- name: host-storage
  hostPath:
    path: /data
    type: Directory  # Directory, DirectoryOrCreate, File, FileOrCreate, Socket, CharDevice, BlockDevice
```

**Use cases:**
- Development và testing
- System-level access (logs, monitoring)
- Node-specific data

**⚠️ Warning**: Không nên dùng trong production vì:
- Pod-specific: Không portable giữa nodes
- Security: Có thể access sensitive data trên node
- Scheduling: Pods bị bind vào specific node

### 2.3. ConfigMap và Secret Volumes

Mount ConfigMap và Secret như files:

```yaml
volumes:
- name: config
  configMap:
    name: app-config
- name: secrets
  secret:
    secretName: app-secret
```

**Mount specific keys:**

```yaml
volumes:
- name: config
  configMap:
    name: app-config
    items:
    - key: application.yml
      path: application.yml
    - key: logback.xml
      path: logback.xml
    defaultMode: 0644  # File permissions
```

### 2.4. PersistentVolumeClaim (PVC)

PVC là request cho storage từ user. Kubernetes sẽ bind PVC với PV phù hợp.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce  # RWO: Single node read-write
    # - ReadOnlyMany  # ROX: Multiple nodes read-only
    # - ReadWriteMany # RWX: Multiple nodes read-write
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd  # Optional: specify storage class
```

**Access Modes:**

- **ReadWriteOnce (RWO)**: Single node read-write (most common)
- **ReadOnlyMany (ROX)**: Multiple nodes read-only
- **ReadWriteMany (RWX)**: Multiple nodes read-write (NFS, GlusterFS)

**Sử dụng PVC trong Pod:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-pvc
spec:
  containers:
  - name: app
    image: my-app:latest
    volumeMounts:
    - name: data
      mountPath: /var/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
```

### 2.5. PersistentVolume (PV)

PV là cluster-level storage resource được provisioned bởi admin.

**Static Provisioning:**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain  # Retain, Delete, Recycle
  storageClassName: fast-ssd
  hostPath:
    path: /mnt/data
```

**Reclaim Policies:**

- **Retain**: Manual cleanup (admin phải xóa PV manually)
- **Delete**: Tự động xóa PV và storage khi PVC bị xóa
- **Recycle**: Deprecated, không nên dùng

**PV Status:**

- **Available**: Chưa được bind với PVC
- **Bound**: Đã bind với PVC
- **Released**: PVC đã bị xóa nhưng PV chưa được reclaim
- **Failed**: PV có lỗi

## 3. Storage Classes

StorageClass cho phép dynamic provisioning của PVs.

### 3.1. StorageClass Definition

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs  # Cloud provider provisioner
parameters:
  type: gp3
  fsType: ext4
  encrypted: "true"
volumeBindingMode: WaitForFirstConsumer  # Immediate hoặc WaitForFirstConsumer
allowVolumeExpansion: true  # Cho phép expand volume
reclaimPolicy: Delete
```

**Provisioners:**

- **Cloud**: `kubernetes.io/aws-ebs`, `kubernetes.io/gce-pd`, `kubernetes.io/azure-disk`
- **Local**: `kubernetes.io/no-provisioner`
- **NFS**: `nfs-client`
- **Others**: Ceph, GlusterFS, etc.

**Volume Binding Modes:**

- **Immediate**: Bind ngay khi PVC được tạo
- **WaitForFirstConsumer**: Bind khi pod sử dụng PVC (cho local storage)

### 3.2. Default StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
```

**Sử dụng default StorageClass:**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  # Không cần chỉ định storageClassName nếu dùng default
```

## 4. StatefulSets

StatefulSets cung cấp stable identity và storage cho stateful applications.

### 4.1. StatefulSet Characteristics

- **Stable network identity**: Mỗi pod có stable hostname
- **Ordered deployment**: Pods được tạo và xóa theo thứ tự
- **Stable storage**: Mỗi pod có persistent volume riêng
- **Headless Service**: Cần headless service để discovery

### 4.2. StatefulSet Example

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None  # Headless service
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: "postgres"  # Must match Service name
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
  volumeClaimTemplates:  # Template cho PVCs
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
      storageClassName: fast-ssd
```

**Pod Naming:**

- Pods được đặt tên: `<statefulset-name>-<ordinal>`
- Ví dụ: `postgres-0`, `postgres-1`, `postgres-2`

**Stable Network Identity:**

- Hostname: `postgres-0.postgres.default.svc.cluster.local`
- Short name: `postgres-0.postgres`

### 4.3. StatefulSet Updates

**Update Strategy:**

```yaml
spec:
  updateStrategy:
    type: RollingUpdate  # RollingUpdate hoặc OnDelete
    rollingUpdate:
      partition: 0  # Update từ pod index này trở đi
```

**Ordered Updates:**

- Pods được update theo thứ tự ngược lại (từ cao xuống thấp)
- Mỗi pod phải ready trước khi update pod tiếp theo

### 4.4. StatefulSet Scaling

```bash
# Scale up
kubectl scale statefulset postgres --replicas=5

# Scale down
kubectl scale statefulset postgres --replicas=2
```

**⚠️ Warning**: Scale down có thể mất data nếu không backup trước.

## 5. Volume Provisioning

### 5.1. Static Provisioning

Admin tạo PVs trước, sau đó users tạo PVCs để claim:

```bash
# Admin tạo PV
kubectl apply -f pv.yaml

# User tạo PVC
kubectl apply -f pvc.yaml

# Kubernetes bind PVC với PV phù hợp
```

### 5.2. Dynamic Provisioning

StorageClass tự động tạo PV khi PVC được tạo:

```bash
# User tạo PVC với StorageClass
kubectl apply -f pvc.yaml

# StorageClass provisioner tự động tạo PV
# PVC được bind với PV mới tạo
```

### 5.3. Volume Expansion

Expand PVC (nếu StorageClass hỗ trợ):

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi  # Tăng từ 10Gi lên 20Gi
```

```bash
# Patch PVC để expand
kubectl patch pvc my-pvc -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# Xem status
kubectl get pvc my-pvc
```

## 6. Backup và Restore

### 6.1. Backup Strategy

**1. Volume Snapshots:**

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgres-snapshot
spec:
  source:
    persistentVolumeClaimName: postgres-data-postgres-0
  volumeSnapshotClassName: csi-snapshotter
```

**2. Application-level Backup:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: postgres-backup
spec:
  template:
    spec:
      containers:
      - name: backup
        image: postgres:16
        command:
        - pg_dump
        - -U
        - postgres
        - -F
        - c
        - -f
        - /backup/backup.dump
        - mydb
        volumeMounts:
        - name: backup-storage
          mountPath: /backup
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
          readOnly: true
      volumes:
      - name: backup-storage
        persistentVolumeClaim:
          claimName: backup-pvc
      restartPolicy: OnFailure
```

**3. Velero Backup:**

```bash
# Install Velero
velero install --provider aws --bucket my-backup-bucket

# Backup namespace
velero backup create my-backup --include-namespaces production

# Restore
velero restore create --from-backup my-backup
```

### 6.2. Restore Strategy

**1. Restore từ Snapshot:**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-restored
spec:
  dataSource:
    name: postgres-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

**2. Restore từ Application Backup:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: postgres-restore
spec:
  template:
    spec:
      containers:
      - name: restore
        image: postgres:16
        command:
        - pg_restore
        - -U
        - postgres
        - -d
        - mydb
        - /backup/backup.dump
        volumeMounts:
        - name: backup-storage
          mountPath: /backup
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: backup-storage
        persistentVolumeClaim:
          claimName: backup-pvc
      - name: postgres-data
        persistentVolumeClaim:
          claimName: postgres-data-postgres-0
      restartPolicy: OnFailure
```

## 7. Best Practices

### 7.1. Volume Best Practices

- **Use PVCs**: Luôn dùng PVCs thay vì direct PVs
- **StorageClasses**: Sử dụng StorageClasses cho dynamic provisioning
- **Access modes**: Chọn access mode phù hợp với use case
- **Size**: Set size phù hợp, có thể expand sau
- **Backup**: Backup data thường xuyên
- **Avoid hostPath**: Tránh hostPath trong production

### 7.2. StatefulSet Best Practices

- **Headless Service**: Luôn tạo headless service cho StatefulSet
- **VolumeClaimTemplates**: Sử dụng volumeClaimTemplates cho persistent storage
- **Ordered updates**: Hiểu về ordered updates
- **Scaling**: Cẩn thận khi scale down
- **Backup**: Backup trước khi scale down hoặc update

### 7.3. Storage Best Practices

- **Right-sizing**: Start với size nhỏ, expand khi cần
- **Performance**: Chọn storage class phù hợp với performance requirements
- **Encryption**: Enable encryption cho sensitive data
- **Monitoring**: Monitor storage usage và performance
- **Retention**: Set retention policies cho backups

## 8. Thực hành

### 8.1. Tạo PVC và sử dụng trong Pod

```bash
# Tạo namespace
kubectl create namespace storage-test

# Tạo StorageClass (nếu chưa có default)
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
EOF

# Tạo PVC
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
  namespace: storage-test
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

# Kiểm tra PVC
kubectl get pvc -n storage-test

# Tạo Pod sử dụng PVC
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-pvc
  namespace: storage-test
spec:
  containers:
  - name: app
    image: nginx:latest
    volumeMounts:
    - name: data
      mountPath: /var/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
EOF

# Test persistence
kubectl exec -it pod-with-pvc -n storage-test -- sh -c "echo 'test data' > /var/data/test.txt"
kubectl delete pod pod-with-pvc -n storage-test
kubectl apply -f pod-with-pvc.yaml
kubectl exec -it pod-with-pvc -n storage-test -- cat /var/data/test.txt
```

### 8.2. Tạo StatefulSet

```bash
# Tạo Headless Service
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: storage-test
spec:
  clusterIP: None
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
EOF

# Tạo StatefulSet
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
  namespace: storage-test
spec:
  serviceName: "web"
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
EOF

# Kiểm tra StatefulSet
kubectl get statefulset -n storage-test
kubectl get pods -n storage-test

# Kiểm tra PVCs
kubectl get pvc -n storage-test

# Test stable identity
kubectl exec -it web-0 -n storage-test -- hostname
kubectl exec -it web-1 -n storage-test -- hostname
```

### 8.3. Test Volume Persistence

```bash
# Write data vào pod
kubectl exec -it web-0 -n storage-test -- sh -c "echo 'Hello from web-0' > /usr/share/nginx/html/index.html"

# Delete pod
kubectl delete pod web-0 -n storage-test

# StatefulSet sẽ recreate pod
kubectl get pods -n storage-test -w

# Verify data vẫn còn
kubectl exec -it web-0 -n storage-test -- cat /usr/share/nginx/html/index.html
```

### 8.4. Test Volume Expansion

```bash
# Xem PVC hiện tại
kubectl get pvc www-web-0 -n storage-test

# Expand PVC (nếu StorageClass hỗ trợ)
kubectl patch pvc www-web-0 -n storage-test -p '{"spec":{"resources":{"requests":{"storage":"2Gi"}}}}'

# Kiểm tra status
kubectl get pvc www-web-0 -n storage-test
kubectl describe pvc www-web-0 -n storage-test
```

### 8.5. Backup và Restore

```bash
# Backup data từ PVC
kubectl run backup-job --image=busybox:1.35 --rm -it --restart=Never \
  --namespace=storage-test \
  -- sh -c "tar czf - /backup" | kubectl exec -i web-0 -n storage-test -- sh -c "cat > /usr/share/nginx/html/backup.tar.gz"

# Restore data
kubectl run restore-job --image=busybox:1.35 --rm -it --restart=Never \
  --namespace=storage-test \
  -- sh -c "kubectl exec web-0 -n storage-test -- cat /usr/share/nginx/html/backup.tar.gz | tar xzf - -C /restore"
```

## 9. Troubleshooting

### 9.1. PVC không được bind

```bash
# Kiểm tra PVC status
kubectl get pvc my-pvc

# Xem PVC details
kubectl describe pvc my-pvc

# Kiểm tra PVs available
kubectl get pv

# Kiểm tra StorageClass
kubectl get storageclass
kubectl describe storageclass standard
```

### 9.2. Pod không mount được volume

```bash
# Kiểm tra pod events
kubectl describe pod my-pod

# Kiểm tra volume mounts
kubectl get pod my-pod -o jsonpath='{.spec.volumes}'

# Kiểm tra PVC
kubectl get pvc
kubectl describe pvc my-pvc
```

### 9.3. StatefulSet không tạo pods

```bash
# Kiểm tra StatefulSet status
kubectl get statefulset
kubectl describe statefulset my-statefulset

# Kiểm tra events
kubectl get events --sort-by='.lastTimestamp'

# Kiểm tra PVCs
kubectl get pvc
```

### 9.4. Volume expansion không hoạt động

```bash
# Kiểm tra StorageClass có allowVolumeExpansion không
kubectl get storageclass standard -o jsonpath='{.allowVolumeExpansion}'

# Kiểm tra PVC status
kubectl describe pvc my-pvc | grep -A 5 "Conditions"

# Xem events
kubectl get events --field-selector involvedObject.name=my-pvc
```

## 10. Cleanup

```bash
# Xóa namespace (sẽ xóa tất cả resources)
kubectl delete namespace storage-test

# Hoặc xóa từng resource
kubectl delete statefulset web -n storage-test
kubectl delete pvc --all -n storage-test
kubectl delete pv my-pv  # Nếu có static PV
```

## 11. Tóm tắt

- **Volume Types**:
  - emptyDir: Temporary storage
  - hostPath: Node storage (không khuyến nghị production)
  - ConfigMap/Secret: Configuration files
  - PVC: Persistent storage

- **PersistentVolumes và PersistentVolumeClaims**:
  - PV: Cluster-level storage resource
  - PVC: User request cho storage
  - Binding: Kubernetes tự động bind PVC với PV phù hợp
  - Access Modes: RWO, ROX, RWX

- **StorageClasses**:
  - Dynamic provisioning
  - Volume binding modes: Immediate, WaitForFirstConsumer
  - Volume expansion support

- **StatefulSets**:
  - Stable network identity
  - Ordered deployment và scaling
  - Stable storage với volumeClaimTemplates
  - Headless Service required

- **Backup và Restore**:
  - Volume snapshots
  - Application-level backup
  - Velero cho cluster backup

- **Best Practices**:
  - Use PVCs thay vì direct PVs
  - Use StorageClasses cho dynamic provisioning
  - Backup data thường xuyên
  - Avoid hostPath trong production
  - Right-size storage và expand khi cần