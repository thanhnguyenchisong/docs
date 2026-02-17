# Core Workload Manifests

- **Pod**
  Đơn vị nhỏ nhất chạy container; một Pod có thể chứa một hoặc nhiều container, chia sẻ network và storage. Quản lý bằng `kubectl`.

- **ReplicaSet**
  Đảm bảo số lượng Pod khớp cấu hình (ví dụ: luôn giữ 3 replicas).

- **Deployment**
  Quản lý ReplicaSet; hỗ trợ rolling updates và rollback.

- **StatefulSet**
  Dành cho ứng dụng có trạng thái (ví dụ: cơ sở dữ liệu); đảm bảo tên Pod và volume ổn định.

- **DaemonSet**
  Đảm bảo mỗi node chạy một Pod (ví dụ: log collector, monitoring agent).

- **Job**
  Chạy một tác vụ cho đến khi hoàn thành.

- **CronJob**
  Lên lịch chạy Job theo cron (định kỳ).

# Networking Manifests

- **Service**
  Cách expose Pod (ClusterIP, NodePort, LoadBalancer).

- **Ingress**
  Quản lý routing HTTP/HTTPS từ bên ngoài vào cluster.

- **NetworkPolicy**
  Kiểm soát traffic giữa các Pod (ingress/egress rules).

# Configuration & Secrets

- **ConfigMap**
  Lưu trữ cấu hình dạng key-value và inject vào Pod.

- **Secret**
  Lưu trữ dữ liệu nhạy cảm (password, token) và inject vào Pod.

- **ResourceQuota**
  Giới hạn tổng tài nguyên (CPU, RAM, storage) cho namespace.

- **LimitRange**
  Đặt giới hạn mặc định cho Pod/Container (min/max CPU, RAM).

# Security & Access

- **ServiceAccount**
  Tài khoản dành cho Pod để truy cập API Server.

- **Role / ClusterRole**
  Định nghĩa quyền truy cập trong namespace hoặc toàn cluster.

- **RoleBinding / ClusterRoleBinding**
  Gán Role/ClusterRole cho user hoặc service account.

- **Pod Security Admission**
  Thay thế cho PodSecurityPolicy (PSP deprecated) để kiểm soát security context của Pod.

# Storage Manifests

- **PersistentVolume (PV)**
  Định nghĩa storage trong cluster.

- **PersistentVolumeClaim (PVC)**
  Pod yêu cầu và sử dụng storage từ PV.

- **StorageClass**
  Định nghĩa cách provision PV động.

- **Volume**
  Khai báo storage gắn vào Pod.

# Cluster & Node Management

- **Namespace**
  Phân chia tài nguyên thành không gian logic.

- **Node**
  Đại diện cho máy worker trong cluster.

- **CustomResourceDefinition (CRD)**
  Mở rộng Kubernetes bằng custom resources.

- **HorizontalPodAutoscaler (HPA)**
  Tự động scale số lượng Pod theo CPU/memory.

- **VerticalPodAutoscaler (VPA)**
  Tự động điều chỉnh resource requests/limits của Pod.

- **PodDisruptionBudget (PDB)**
  Đảm bảo số lượng Pod tối thiểu khi bảo trì.

# Observability & Others

- **Event**
  Ghi lại sự kiện trong cluster (Pod pending, node not ready…).

- **Metrics Server**
  Thu thập chỉ số CPU/RAM của Pod/Node.

- **Endpoint / EndpointSlice**
  Liên kết Service với IP của Pod.🧩 Core Workload Manifests 
Pod: Đơn vị nhỏ nhất, chứa một hoặc nhiều container, chia sẻ network và storage.
kubectl
ReplicaSet: Đảm bảo số lượng Pod chạy đúng với cấu hình (ví dụ: luôn có 3 replicas).
Deployment: Quản lý ReplicaSet, hỗ trợ rolling update, rollback.
StatefulSet: Quản lý Pod có trạng thái (ví dụ: database), đảm bảo tên và volume ổn định.
DaemonSet: Đảm bảo mỗi node chạy một Pod (ví dụ: log collector, monitoring agent).
Job: Chạy một tác vụ cho đến khi hoàn thành.
CronJob: Chạy Job theo lịch định kỳ (giống cron trong Linux).


## Kubectl short names

- Pod: `po`
- ReplicaSet: `rs`
- Deployment: `deploy`
- StatefulSet: `sts`
- DaemonSet: `ds`
- Job: `job`
- CronJob: `cj`
- Service: `svc`
- Ingress: `ing`
- NetworkPolicy: `netpol`
- ConfigMap: `cm`
- Secret: `secret`
- PersistentVolume: `pv`
- PersistentVolumeClaim: `pvc`
- StorageClass: `sc`
- Namespace: `ns`
- CustomResourceDefinition: `crd`
- HorizontalPodAutoscaler: `hpa`
- VerticalPodAutoscaler: `vpa`
- PodDisruptionBudget: `pdb`
- ServiceAccount: `sa`
- Role: `role`
- ClusterRole: `cr`
- RoleBinding: `rb`
- ClusterRoleBinding: `crb`
- Event: `event`
- Endpoint: `ep`
- EndpointSlice: `eps`
