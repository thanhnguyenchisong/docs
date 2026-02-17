# Example — Project minh họa MongoDB

MongoDB chạy bằng Docker. Ứng dụng bất kỳ (Node, Spring Data MongoDB) có thể kết nối tới `localhost:27017`.

## Chạy MongoDB

```bash
docker compose up -d
```

## Test bằng mongosh

```bash
docker exec -it $(docker ps -qf "ancestor=mongo:7") mongosh --eval "db.runCommand({ping:1})"
```

Đọc kèm [../README.md](../README.md) và các file trong backend/mongodb.
