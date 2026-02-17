# Example — Project minh họa PostgreSQL

PostgreSQL trong Docker + script SQL khởi tạo. Có thể dùng với bất kỳ client nào (psql, DBeaver, Spring Boot).

## 1. Chạy PostgreSQL

```bash
docker compose up -d
```

## 2. Kết nối

- Host: localhost, Port: 5432  
- User: app, Password: app, Database: appdb  

Ví dụ với `psql`:

```bash
PGPASSWORD=app psql -h localhost -U app -d appdb -c "SELECT * FROM users;"
```

Hoặc dùng file `init.sql` để xem cấu trúc bảng và index. Đọc kèm [../README.md](../README.md) và các file trong backend/postgresSQL.
