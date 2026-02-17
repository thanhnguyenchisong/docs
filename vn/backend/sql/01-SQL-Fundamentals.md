# SQL Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [SQL là gì?](#sql-là-gì)
2. [DDL - Định nghĩa dữ liệu](#ddl---định-nghĩa-dữ-liệu)
3. [DML - Thao tác dữ liệu](#dml---thao-tác-dữ-liệu)
4. [Kiểu dữ liệu và ràng buộc](#kiểu-dữ-liệu-và-ràng-buộc)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SQL là gì?

**SQL** (Structured Query Language) là ngôn ngữ chuẩn để làm việc với **relational database**: định nghĩa schema (DDL), thao tác dữ liệu (DML), truy vấn (SELECT), quản lý quyền (DCL), transaction (TCL).

### Phân loại câu lệnh

- **DDL**: CREATE, ALTER, DROP (table, index, schema).
- **DML**: SELECT, INSERT, UPDATE, DELETE.
- **DCL**: GRANT, REVOKE.
- **TCL**: COMMIT, ROLLBACK, SAVEPOINT.

---

## DDL - Định nghĩa dữ liệu

```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created ON users(created_at);

ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

DROP INDEX idx_users_created;
DROP TABLE users;
```

- **CREATE TABLE**: Định nghĩa cột, kiểu, ràng buộc (PRIMARY KEY, UNIQUE, NOT NULL, FOREIGN KEY).
- **ALTER TABLE**: Thêm/sửa/xóa cột, ràng buộc.
- **CREATE/DROP INDEX**: Tạo/xóa index.

---

## DML - Thao tác dữ liệu

```sql
INSERT INTO users (email, name) VALUES ('a@b.com', 'Alice');
INSERT INTO users (email, name) VALUES ('b@b.com', 'Bob'), ('c@b.com', 'Carol');

UPDATE users SET name = 'Alice Updated' WHERE id = 1;

DELETE FROM users WHERE status = 'inactive';
```

- **INSERT**: Thêm hàng; có thể chỉ định cột; RETURNING (PostgreSQL) để lấy giá trị vừa insert.
- **UPDATE**: Set giá trị mới theo điều kiện WHERE; luôn dùng WHERE tránh cập nhật cả bảng.
- **DELETE**: Xóa hàng theo WHERE; không có WHERE = xóa toàn bộ (truncate nhanh hơn nếu cần xóa hết).

---

## Kiểu dữ liệu và ràng buộc

### Kiểu thường dùng

- **Số**: INT, BIGINT, SMALLINT, DECIMAL(p,s), NUMERIC, FLOAT, DOUBLE.
- **Chuỗi**: VARCHAR(n), CHAR(n), TEXT.
- **Ngày giờ**: DATE, TIME, TIMESTAMP, INTERVAL.
- **Boolean**: BOOLEAN.
- **Binary**: BYTEA, BLOB (tùy DB).

### Ràng buộc

- **PRIMARY KEY**: Khóa chính, unique + not null.
- **UNIQUE**: Giá trị không trùng.
- **NOT NULL**: Bắt buộc có giá trị.
- **FOREIGN KEY**: Tham chiếu bảng khác; đảm bảo referential integrity.
- **CHECK**: Điều kiện trên giá trị (e.g. age > 0).
- **DEFAULT**: Giá trị mặc định khi insert không chỉ định.

---

## Câu hỏi thường gặp

### DML có cần COMMIT không?

- Tùy chế độ **autocommit**. Nếu tắt autocommit thì INSERT/UPDATE/DELETE nằm trong transaction đến khi COMMIT hoặc ROLLBACK.

### TRUNCATE vs DELETE?

- **DELETE**: Xóa từng hàng, có thể WHERE, trigger chạy, rollback được.
- **TRUNCATE**: Xóa toàn bộ bảng, nhanh (thường không scan từng row), reset identity; không có WHERE; hành vi rollback tùy DB.

---

**Tiếp theo:** [02-SELECT-Filtering.md](./02-SELECT-Filtering.md)
