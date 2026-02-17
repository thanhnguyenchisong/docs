## Async Profiler trên Kubernetes — công thức thực thi

Tệp này cung cấp các lệnh từng bước cho mỗi cách chạy Async Profiler trong K8s, để bạn có thể chọn dựa trên quyền truy cập và ràng buộc kiểm soát thay đổi.

### Các bước chuẩn bị chung
- Chọn namespace: `NS=perf`
- Chọn nhãn ứng dụng: `APP_LABEL=perf-app`
- Lấy tên pod: `POD=$(kubectl -n "$NS" get pod -l app="$APP_LABEL" -o jsonpath='{.items[0].metadata.name}')`
- Tìm PID: `kubectl -n "$NS" exec -it "$POD" -- jcmd | grep performance-improve`
- Thay thế `<PID>` trong các lệnh bên dưới.

---

## A) Sao chép profiler vào pod đang chạy (không thay đổi ảnh)
Sử dụng khi bạn không thể thay đổi ảnh nhưng có thể exec vào pods.

1) Sao chép bundle (một lần mỗi rollout):
```bash
kubectl -n "$NS" cp /path/to/async-profiler "$POD":/tmp/async-profiler
```
2) Chụp profile CPU 30s:
```bash
kubectl -n "$NS" exec "$POD" -- /tmp/async-profiler/profiler.sh \
  -d 30 -e cpu -f /tmp/flame.svg <PID>
```
3) Lấy và dọn dẹp:
```bash
kubectl -n "$NS" cp "$POD":/tmp/flame.svg ./flame.svg
kubectl -n "$NS" exec "$POD" -- rm /tmp/flame.svg
```

Ghi chú: Sử dụng `-e wall` cho blocking, `-e alloc` cho hotspots allocation (chạy ngắn).

---

## B) Bake profiler vào ảnh ứng dụng
Sử dụng khi bạn có thể cập nhật ảnh và muốn khả năng lặp lại.

- Thêm `/opt/async-profiler` vào ảnh trong `Dockerfile`.
- Profile mà không cần sao chép:
```bash
kubectl -n "$NS" exec "$POD" -- /opt/async-profiler/profiler.sh \
  -d 30 -e cpu -f /tmp/flame.svg <PID>
kubectl -n "$NS" cp "$POD":/tmp/flame.svg ./flame.svg
kubectl -n "$NS" exec "$POD" -- rm /tmp/flame.svg
```

---

## C) Container tạm thời (để container chính không bị chạm; K8s ≥1.23)
Sử dụng khi exec được cho phép nhưng bạn muốn không sửa đổi container chính.

1) Thêm container tạm thời với công cụ profiler:
```bash
kubectl -n "$NS" debug pod/"$POD" -c ap \
  --image=your-profiler-image --target="$APP_LABEL"
```
2) Bên trong container tạm thời (tự động gắn shell):
```bash
jcmd | grep performance-improve
/opt/async-profiler/profiler.sh -d 30 -e cpu -f /tmp/flame.svg <PID>
```
3) Sao chép artifact từ tên pod chính:
```bash
kubectl -n "$NS" cp "$POD":/tmp/flame.svg ./flame.svg
kubectl -n "$NS" exec "$POD" -- rm /tmp/flame.svg
```

---

## D) Sidecar với chia sẻ namespace tiến trình
Sử dụng khi bạn muốn profiling luôn có sẵn mà không chạm vào container chính.

- Pod spec: đặt `shareProcessNamespace: true` và thêm ảnh sidecar chứa Async Profiler.
- Từ sidecar:
```bash
jcmd | grep performance-improve
/opt/async-profiler/profiler.sh -d 30 -e cpu -f /tmp/flame.svg <PID>
```
- Sao chép và dọn dẹp qua `kubectl cp`/`exec` như trên.

---

## E) Pod helper/toolbox + kubectl cp/exec
Sử dụng khi laptop của bạn thiếu tooling hoặc bạn muốn hành động trong cluster mà không thay đổi ảnh ứng dụng.

1) Khởi động pod toolbox:
```bash
kubectl -n "$NS" run toolbox --image=ubuntu --restart=Never --command -- sleep 3600
kubectl -n "$NS" cp /path/to/async-profiler toolbox:/tmp/async-profiler
```
2) Từ toolbox, sao chép profiler vào pod đích và chạy (giống tùy chọn A):
```bash
kubectl -n "$NS" cp /tmp/async-profiler "$POD":/tmp/async-profiler
kubectl -n "$NS" exec "$POD" -- /tmp/async-profiler/profiler.sh -d 30 -e cpu -f /tmp/flame.svg <PID>
kubectl -n "$NS" cp "$POD":/tmp/flame.svg ./flame.svg
```
3) Dọn dẹp toolbox sau khi sử dụng: `kubectl -n "$NS" delete pod toolbox`

---

## F) Attach cấp host (privileged/ops-only)
Sử dụng khi `kubectl exec` bị hạn chế nhưng bạn có truy cập node và perf được cho phép.

1) Trên node (SSH hoặc DaemonSet privileged):
```bash
crictl ps | grep perf-app   # hoặc docker ps
CONTAINER_ID=...
PID=$(crictl inspect "$CONTAINER_ID" | jq -r '.info.pid')  # hoặc docker inspect
nsenter -t "$PID" -n -m -p -- /path/to/async-profiler/profiler.sh \
  -d 30 -e cpu -f /tmp/flame.svg <PID_INSIDE_CONTAINER>
```
2) Sao chép artifact từ container FS theo phù hợp; xóa nó sau đó.

---

## Tùy chọn event và patterns
- CPU (mặc định): `-e cpu` — chi phí thấp nhất, lựa chọn đầu tiên.
- Wall-clock: `-e wall` — xem blocking/locks/I/O; thêm `-t` cho trạng thái luồng.
- Allocations: `-e alloc` — cho hotspots allocation; giữ ngắn.
- Thời lượng: 15–60s điển hình trong prod; giữ cửa sổ chặt chẽ.
- Đầu ra: SVG `-f /tmp/flame.svg`; stacks text `-o collapsed`.

## Liên kết với tín hiệu
- Căn chỉnh cửa sổ profile với thời gian spike Grafana (độ trễ/CPU/GC).
- Nếu an toàn, điều khiển tải nhắm mục tiêu (JMeter trong cluster) trong cửa sổ.
- Profile một pod tại một thời điểm để giảm thiểu tác động.

---

## Nhắm mục tiêu một pod duy nhất với tải (để cô lập một instance)
Sử dụng điều này khi bạn muốn tái tạo và profile bottleneck chỉ trên một pod thay vì toàn bộ deployment.

- Lấy tên pod và tạo service tạm thời chỉ trỏ đến nó:
```bash
POD=$(kubectl -n "$NS" get pod -l app="$APP_LABEL" -o jsonpath='{.items[0].metadata.name}')
kubectl -n "$NS" expose pod "$POD" --port=8080 --target-port=8080 --name "${APP_LABEL}-direct" --type=ClusterIP
```
- Gửi traffic JMeter hoặc curl đến service đó:
```bash
kubectl -n "$NS" port-forward svc/${APP_LABEL}-direct 18080:8080
# Trong shell khác:
curl "http://localhost:18080/work?n=20000"
# Hoặc đặt host JMeter=localhost port=18080
```
- Profile cùng pod trong khi tải nhắm mục tiêu chạy (chọn bất kỳ công thức nào ở trên).
- Dọn dẹp khi xong:
```bash
kubectl -n "$NS" delete svc/${APP_LABEL}-direct
```

Ghi chú:
- Giữ service này tồn tại ngắn để tránh bypass load balancing lâu hơn cần thiết.
- Nếu Pod thay đổi, tạo lại service cho tên Pod mới.