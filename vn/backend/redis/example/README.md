# Example — Project minh họa Redis

Spring Boot + Spring Data Redis: set/get. Chạy được khi đã có Redis (Docker).

## 1. Chạy Redis

```bash
docker compose up -d
```

## 2. Chạy ứng dụng

```bash
mvn spring-boot:run
```

## 3. Test

```bash
curl -X POST "http://localhost:8085/api/set?key=hello&value=world"
curl "http://localhost:8085/api/get?key=hello"
```

Nếu muốn truyền ký tự đặc biệt (khoảng trắng, UTF-8), nên URL encode:

```bash
curl -X POST --get "http://localhost:8085/api/set" --data-urlencode "key=greeting" --data-urlencode "value=xin chao"
```

Đọc kèm [../README.md](../README.md) và các file trong backend/redis.
