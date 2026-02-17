## Thiết lập Prometheus + Grafana (Micrometer)

### 1. Xây dựng ảnh Docker

```bash
mvn clean package -DskipTests
docker compose build app
```

### 2. Khởi động ngăn xếp

```bash
docker compose up
```

Các dịch vụ:

- **Ứng dụng**: [http://localhost:8080](http://localhost:8080) (số liệu tại `/actuator/prometheus`)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
- **Grafana**: [http://localhost:3000](http://localhost:3000) (người dùng `admin` / `admin`)

### 3. Cấu hình Grafana

1. Thêm nguồn dữ liệu: **Prometheus** tại [http://prometheus:9090](http://prometheus:9090).
2. Tạo bảng điều khiển với các panel như:
   - `rate(http_server_requests_seconds_count[1m])` cho tỷ lệ yêu cầu.
   - `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))` cho độ trễ P95.
   - `process_cpu_usage`, `jvm_memory_used_bytes` cho sức khỏe JVM.

### 4. Tạo tải và quan sát

Sử dụng JMeter (xem [03-jmeter-load-test.md](03-jmeter-load-test.md)) để gọi `/work` với độ đồng thời cao và giám sát:

- Tăng độ trễ và tỷ lệ lỗi.
- Hành vi CPU và bộ nhớ.