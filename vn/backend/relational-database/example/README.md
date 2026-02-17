# Example — Project minh họa Relational Database

PostgreSQL + SQL: bảng, khóa chính, khóa ngoại, index. Chạy được để test và học.

## Chạy

```bash
docker compose up -d
```

Kết nối: localhost:5432, user `app`, password `app`, database `appdb`. Ví dụ: `PGPASSWORD=app psql -h localhost -U app -d appdb -c "SELECT * FROM users;"`. Đọc kèm [../README.md](../README.md).
