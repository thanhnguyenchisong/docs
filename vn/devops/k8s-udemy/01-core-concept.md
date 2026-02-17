# Khái niệm cốt lõi về Kubernetes

## Node
Node là máy worker chạy container. Nếu chỉ có một node và node đó sập, ứng dụng sẽ sập — cần nhiều node để chia tải và đảm bảo tính khả dụng cao.

## Cluster
Cluster là một tập hợp các node cùng phối hợp để chạy workloads.

## Control Plane (Master Node) Bao gồm API Server, etcd, Scheduler, Controller Manager.
Control Plane là node (hoặc nhiều node) chạy các thành phần quản lý của Kubernetes, theo dõi cluster và thực hiện orchestration. Nên triển khai multi-master HA để tránh điểm lỗi đơn.

## API Server
API Server cung cấp API của Kubernetes. Các client như `kubectl`, dashboard hoặc công cụ bên ngoài tương tác với cluster thông qua API Server.

## etcd
etcd là cơ sở dữ liệu key-value phân tán và tin cậy lưu toàn bộ trạng thái của cluster. etcd lưu thông tin về nodes, pods, cấu hình, v.v. và cung cấp cơ chế bầu leader/khóa để tránh xung đột giữa các master.

## Scheduler
Scheduler chịu trách nhiệm phân phối Pods lên các node phù hợp dựa trên yêu cầu tài nguyên, ràng buộc và chính sách.

## Controller Manager
- Controller Manager chạy các controller chịu trách nhiệm đối chiếu trạng thái mong muốn và thực tế (ví dụ ReplicaSet controller, Node controller, Endpoint controller). Nó phát hiện lỗi (node, Pod, endpoint) và thực hiện hành động khôi phục.
- Nó liên tục theo dõi trạng thái cluster thông qua API Server, so sánh với trạng thái mong muốn, rồi đưa ra hành động (tạo/xóa/cập nhật đối tượng).
## Container Runtime
Container Runtime là phần mềm nền tảng để chạy container, ví dụ containerd, Docker, CRI-O.

## Kubelet
Kubelet là agent chạy trên mỗi node, đảm bảo các container trong Pod được khởi động và duy trì trạng thái sức khỏe, đồng thời báo cáo trạng thái về control plane.


### 📌 Kịch bản: Pod bị crash
- Trạng thái mong muốn
    
    Bạn khai báo trong Deployment là cần 3 Pod chạy ứng dụng web.

- Thực tế xảy ra

    Một Pod trên Node A bị crash do container lỗi.

    Kubelet xử lý tại chỗ

    Kubelet trên Node A phát hiện container trong Pod đó chết.

    Nó thử restart container theo PodSpec (ví dụ: restartPolicy = Always).

    Nếu restart thành công → Pod tiếp tục chạy, cluster vẫn đủ 3 Pod.

    Nếu restart thất bại nhiều lần → Pod vẫn ở trạng thái lỗi, Kubelet báo cáo về API Server.

- Controller Manager vào cuộc

    Controller Manager nhận thông tin từ API Server rằng hiện tại chỉ có 2 Pod khỏe mạnh.

    Nó so sánh với trạng thái mong muốn (3 Pod).

    Thấy thiếu 1 Pod → Controller Manager ra quyết định tạo Pod mới trên một Node khác (Node B chẳng hạn).

    Pod mới được lên lịch, Kubelet trên Node B sẽ khởi động container.