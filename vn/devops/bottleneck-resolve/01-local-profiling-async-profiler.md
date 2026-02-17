## Phân tích hiệu suất cục bộ với Async Profiler

### 1. Xây dựng và chạy ứng dụng với docker compose

```bash
# Xây dựng ứng dụng mvn
mvn clean package -DskipTests
# Xây dựng ảnh docker
docker compose build app
# Khởi động ứng dụng và tất cả các ứng dụng liên quan
docker compose up -d
```

Gọi endpoint chậm trong một terminal khác:

```bash
curl "http://localhost:8080/work?n=20000"
```

### 2. Khởi động Async Profiler

Truy cập trực tiếp vào container ứng dụng của bạn.
Giả sử `async-profiler` đã được cài đặt và `asprof.sh` có trong PATH của bạn:
```bash
# Tìm PID của tiến trình Java
jps -l

# Trong phiên bản 4.2 và mới hơn, bạn có thể sử dụng:
./asprof -d 60 -f flamegraph.html 4236

# Nếu lệnh không tìm thấy thì sử dụng lệnh này trước khi chạy asprof
chmod +x asprof

# một số tùy chọn khác bạn có thể sử dụng với asprof
# lấy profile CPU
./asprof -e cpu -d 60 -f result.html 4236
# lấy thông tin cho phương thức java cụ thể
./asprof -e 'com.example.perf.controller.WorkController.doWork' -d 60 -f result.html 4236
# lấy profile phân bổ heap
./asprof -e alloc -d 60 -f result.html 4236
```

- **`-d 60`**: phân tích trong 60 giây trong khi bạn gửi tải (ví dụ: với JMeter).
- **`-f`**: tệp đầu ra ở định dạng SVG.

Mở SVG trong trình duyệt và tìm các phương thức nóng xung quanh `WorkController.doWork` và `List.contains`.

### 3. Tối ưu hóa và so sánh

Sau đó, bạn có thể thay thế pattern list + `contains` bằng cấu trúc hiệu quả hơn (ví dụ: `HashSet`) và chạy lại phiên phân tích tương tự để so sánh biểu đồ flame graph.