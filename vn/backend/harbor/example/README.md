# Example — Project minh họa Harbor

Harbor là registry cho container images. Project minh họa: dùng Docker để build image và đẩy lên Harbor (khi đã cài Harbor).

## Chạy Harbor (Docker)

Xem tài liệu [../README.md](../README.md). Có thể dùng Helm hoặc docker-compose từ trang chủ Harbor. Sau khi Harbor chạy:

```bash
docker tag myapp:latest localhost:5000/library/myapp:latest
docker push localhost:5000/library/myapp:latest
```

## File mẫu

Thư mục này có thể chứa `Dockerfile` mẫu và script push. Tạo Dockerfile đơn giản:

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

Build: `docker build -t myapp:latest .` (sau khi đã `mvn package` ở project Java). Đọc kèm các file trong backend/harbor.
