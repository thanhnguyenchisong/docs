# Example — Ứng dụng minh họa bottleneck-resolve

**Project minh họa** nằm tại **root của repo** (cùng cấp với thư mục `docs/`): ứng dụng Spring Boot dùng để test tải và phân tích điểm nghẽn.

## Chạy ứng dụng

Từ **root repo** (không phải từ thư mục này):

```bash
cd /path/to/bottleneck-resolve   # root repo
mvn spring-boot:run
```

- Endpoint mẫu: `GET http://localhost:8080/work?n=10000`
- Actuator/Prometheus: `http://localhost:8080/actuator/prometheus`

## Học kèm tài liệu

Đọc các file trong [../](..): JMeter, Async Profiler, Prometheus/Grafana, hướng dẫn tìm bottleneck. Tài liệu hướng dẫn từng bước dùng chính ứng dụng tại root repo.
