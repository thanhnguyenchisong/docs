# Example — Project minh họa SQL

Script SQL chạy được với PostgreSQL. Cần PostgreSQL đã chạy và có bảng `users` (từ [postgresSQL/example](../postgresSQL/example) hoặc [relational-database/example](../relational-database/example)).

```bash
# Từ thư mục này (sql/example), sau khi postgres đã up:
PGPASSWORD=app psql -h localhost -U app -d appdb -f selects.sql
```

Đọc kèm [../README.md](../README.md).
