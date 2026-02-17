## Kiểm thử tải JMeter cho `/work`
Là cách được JMeter khuyến nghị để kiểm thử tải các ứng dụng Java.

> **Ghi chú:** Có thể chèn ảnh chụp màn hình kế hoạch JMeter tại đây (ví dụ: đặt file trong `assets/` và dùng `![Mô tả](assets/ten-file.png)`).

### 1. Ý tưởng kế hoạch kiểm thử

Tạo một kế hoạch kiểm thử JMeter đơn giản:

- **Nhóm luồng**:
  - Luồng (người dùng): 50–200
  - Thời gian tăng dần: 10–30 giây
  - Số lần lặp: mãi mãi (hoặc một số lớn)
- **Yêu cầu HTTP**:
  - Phương thức: GET
  - Đường dẫn: `/work`
  - Tham số: `n=20000`
  - Tên máy chủ hoặc IP: `localhost`
  - Cổng: `8080`
- **Người nghe**:
  - Báo cáo tóm tắt
  - Báo cáo tổng hợp

### 2. Chạy kiểm thử

1. Khởi động ứng dụng Spring Boot cục bộ.
2. Mở GUI JMeter, cấu hình kế hoạch như trên (hoặc sử dụng tệp `.jmx` nếu bạn tạo một cái).
3. Khởi động kiểm thử và theo dõi:
   - Thời gian phản hồi (P90, P95, P99).
   - Thông lượng.
   - Tỷ lệ lỗi.

#### Chạy cùng một kế hoạch từ dòng lệnh

`work-load.jmx` là kế hoạch kiểm thử đã được cấu hình và lưu với GUI JMeter.
Nếu bạn muốn thực thi không đầu (tốt hơn cho tự động hóa/CI), lưu kế hoạch dưới dạng `work-load.jmx` và chạy:

```bash
# Chạy JMeter không GUI, ghi kết quả thô và tạo báo cáo HTML
# Result.jtl bị ghi đè mỗi lần
jmeter -n -t work-load.jmx -l result.jtl -e -o report
```

- Các cờ `-J` ánh xạ đến các biến do người dùng định nghĩa của JMeter; tham chiếu chúng trong kế hoạch dưới dạng `${serverHost}`, `${serverPort}`, `${n}`.
- `results/work-load.jtl` lưu trữ dữ liệu mẫu thô; `results/report/` sẽ chứa bảng điều khiển HTML được tạo.
- Để chạy nhiều lần lặp với tải khác nhau, ghi đè biến: `jmeter -n -t work-load.jmx -Jthreads=100 -Jramp=20 ...`.
- Sau khi chạy, mở `results/report/index.html` trong trình duyệt để xem lại số liệu mà không cần GUI.

### 3. Kết hợp với phân tích hiệu suất và số liệu

- Trong khi JMeter đang chạy, chụp profile CPU với Async Profiler.
- Nếu chạy qua ngăn xếp Docker, quan sát bảng điều khiển Prometheus / Grafana cùng lúc.