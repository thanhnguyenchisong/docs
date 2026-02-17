## Hướng dẫn điều tra hiệu suất từ đầu đến cuối

Hướng dẫn này cho thấy cách:

1. Tái tạo một vấn đề hiệu suất.
2. Đo lường nó với JMeter.
3. Tìm điểm nghẽn với Async Profiler.
4. Giám sát trong môi trường giống production với Micrometer → Prometheus → Grafana.
5. Khắc phục vấn đề và xác minh cải thiện.

### Bước 1: Chạy ứng dụng cơ bản

```bash
mvn spring-boot:run
```

Gọi [http://localhost:8080/work?n=20000](http://localhost:8080/work?n=20000) thủ công để thấy nó chậm.

### Bước 2: Đo lường với JMeter

- Cấu hình kế hoạch JMeter từ [03-jmeter-load-test.md](03-jmeter-load-test.md).
- Ghi lại số liệu cơ bản: thông lượng, phần trăm độ trễ.

### Bước 3: Phân tích hiệu suất với Async Profiler

- Khởi động Async Profiler đối với tiến trình Java đang chạy.
- Chạy tải JMeter.
- Kiểm tra biểu đồ flame graph và xác định `WorkController.doWork` là nóng.

### Bước 4: Giám sát với Prometheus + Grafana

- Xây dựng và khởi động ngăn xếp Docker ([02-prometheus-grafana-setup.md](02-prometheus-grafana-setup.md)).
- Gửi tải đến [http://localhost:8080/work?n=20000](http://localhost:8080/work?n=20000).
- Theo dõi độ trễ HTTP và số liệu JVM trong Grafana.

### Bước 5: Tối ưu hóa và xác minh

- Thay thế thuật toán danh sách + `contains` không hiệu quả bằng cấu trúc dữ liệu tốt hơn.
- Xây dựng lại, chạy lại JMeter, phân tích lại và so sánh:
  - Thời gian CPU thấp hơn trong biểu đồ flame graph.
  - Độ trễ cải thiện và thông lượng cao hơn trong JMeter.
  - Số liệu khỏe mạnh hơn trong Grafana.