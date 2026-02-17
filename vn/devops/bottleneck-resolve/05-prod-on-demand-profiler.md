## Phân tích hiệu suất production theo yêu cầu với Async Profiler (kích hoạt bởi số liệu)

Sử dụng điều này khi Grafana hiển thị độ trễ/CPU/thông lượng bất thường. Mục tiêu là chụp một profile ngắn, chi phí thấp từ production để định vị điểm nghẽn giống như cách chúng ta làm cục bộ.

### Danh sách kiểm tra an toàn

- Giữ cửa sổ phân tích ngắn (15–60s) và nhắm đến khoảng thời gian quan tâm được thấy trong Grafana.
- Chi phí lấy mẫu Async Profiler thấp (thường <2% CPU), nhưng tránh chạy trong các sự cố đỉnh điểm trừ khi cần thiết.
- Đảm bảo bạn có quyền SSH/`docker exec` vào host/container và gắn vào JVM.
- Ưu tiên mẫu CPU trước; chỉ sử dụng lấy mẫu wall-clock (`-e wall`) nếu bạn cần thấy thời gian chặn/đợi.

### Các bước (VM hoặc bare-metal)

1) Định vị tiến trình JVM:

```bash
jcmd | grep performance-improve  # hoặc jps -l
```

2) Chụp profile CPU trong 30s và ghi vào biểu đồ flame graph SVG:

```bash
profiler.sh -d 30 -e cpu -f /tmp/flame-prod.svg <PID>
```

- `-d 30`: thời lượng tính bằng giây.
- `-e cpu`: sự kiện mẫu CPU (mặc định). Sử dụng `-e wall` cho wall-clock nếu bạn nghi ngờ bị chặn.
- Tệp đầu ra ở lại trên host; xóa chúng sau khi tải xuống.

3) Tải biểu đồ flame graph về workstation của bạn và xem:

```bash
scp user@prod-host:/tmp/flame-prod.svg ./
xdg-open flame-prod.svg  # hoặc mở trong trình duyệt
```

4) Dọn dẹp trên host:

```bash
rm /tmp/flame-prod.svg
```

### Các bước (Docker/K8s)

1) Xác định container/pod và PID (bên trong container):

```bash
docker exec -it <container> jcmd | grep performance-improve
# hoặc trong k8s: kubectl exec -it <pod> -- jcmd | grep performance-improve
```

2) Chạy profiler bên trong container (giả sử `profiler.sh` được cài đặt ở đó hoặc được mount):

```bash
docker exec <container> profiler.sh -d 30 -e cpu -f /tmp/flame-prod.svg <PID>
```

Nếu `profiler.sh` không có trong ảnh, sao chép vào tạm thời:

```bash
docker cp /path/to/async-profiler <container>:/tmp/async-profiler
```

3) Sao chép biểu đồ flame graph ra và dọn dẹp:

```bash
docker cp <container>:/tmp/flame-prod.svg ./
docker exec <container> rm /tmp/flame-prod.svg
```

### Liên kết với Micrometer/Prometheus/Grafana

- Ghi chú cửa sổ thời gian chính xác khi độ trễ/CPU tăng đột biến trong Grafana.
- Bắt đầu phân tích để cửa sổ của nó chồng lên với đỉnh (ví dụ: 30s xung quanh đỉnh).
- Trong biểu đồ flame graph, tìm các phương thức nóng phù hợp với tỷ lệ yêu cầu cao hoặc độ trễ được thấy trong Grafana.
- Lặp lại sau khi giảm nhẹ (tweak cấu hình hoặc thay đổi code) để xác minh cải thiện.

### Mẹo

- Để giảm nhiễu, kích hoạt tải khớp với đường dẫn có vấn đề trong khi phân tích (nếu an toàn).
- Đối với I/O hoặc tranh chấp khóa, thử `-e wall` và tùy chọn `-t` để bao gồm trạng thái luồng.
- Đối với vấn đề bộ nhớ/phân bổ, sử dụng `-e alloc` với thời lượng ngắn, nhưng lưu ý chi phí cao hơn.
- Nếu `perf_event_open` bị hạn chế, chạy với quyền/capacities phù hợp hoặc bật perf cho người dùng (phụ thuộc vào môi trường của bạn).