# Example — Project minh họa Microservices

Hai service REST: **api** (8086) gọi **worker** (8087) qua HTTP. Minh họa giao tiếp service-to-service.

## Chạy

```bash
# Terminal 1 — worker trước
cd worker && mvn spring-boot:run

# Terminal 2 — api
cd api && mvn spring-boot:run
```

## Test

```bash
curl http://localhost:8086/api/hello
# Trả về: "API received from worker: Hello from Worker"
```

Đọc kèm [../README.md](../README.md) và các file trong backend/microservices.
