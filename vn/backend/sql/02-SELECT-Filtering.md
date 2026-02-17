# SELECT & Filtering - Câu hỏi phỏng vấn SQL

## Mục lục
1. [SELECT cơ bản](#select-cơ-bản)
2. [WHERE và operators](#where-và-operators)
3. [ORDER BY, LIMIT, DISTINCT](#order-by-limit-distinct)
4. [NULL và xử lý](#null-và-xử-lý)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SELECT cơ bản

```sql
SELECT * FROM users;
SELECT id, email, name FROM users;
SELECT id, email AS user_email FROM users;
SELECT id, UPPER(name) AS name_upper FROM users;
```

- **SELECT** cột (hoặc *); **FROM** bảng.
- **Alias**: AS để đặt tên cột/kết quả.
- Có thể dùng expression, hàm (UPPER, LOWER, CONCAT, ...).

---

## WHERE và operators

```sql
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE age >= 18 AND status = 'active';
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE id IN (1, 2, 3);
SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM users WHERE name IS NOT NULL;
```

- **So sánh**: =, <>, !=, <, <=, >, >=.
- **Logic**: AND, OR, NOT.
- **LIKE**: % (nhiều ký tự), _ (một ký tự); có thể dùng ILIKE (không phân biệt hoa thường, PostgreSQL).
- **IN**: Thuộc tập giá trị.
- **BETWEEN**: Trong khoảng (bao gồm biên).
- **IS NULL / IS NOT NULL**: Kiểm tra NULL (không dùng = NULL).

---

## ORDER BY, LIMIT, DISTINCT

```sql
SELECT * FROM users ORDER BY created_at DESC, name ASC;
SELECT * FROM users ORDER BY 2;  -- sort theo cột thứ 2
SELECT * FROM users LIMIT 10 OFFSET 20;  -- phân trang
SELECT DISTINCT country FROM users;
SELECT DISTINCT ON (country) * FROM users ORDER BY country, created_at DESC;  -- PostgreSQL
```

- **ORDER BY**: ASC (mặc định) / DESC; nhiều cột được phép.
- **LIMIT / OFFSET**: Giới hạn số dòng và bỏ qua (phân trang); OFFSET lớn chậm (full scan đến offset).
- **DISTINCT**: Loại bỏ dòng trùng; DISTINCT ON (PostgreSQL): giữ một dòng cho mỗi nhóm (cần ORDER BY tương ứng).

---

## NULL và xử lý

- So sánh với NULL cho kết quả **UNKNOWN** (không TRUE/FALSE) → WHERE col = NULL không match; dùng **IS NULL**.
- **COALESCE(a, b, ...)**: Trả về giá trị đầu tiên khác NULL.
- **NULLIF(a, b)**: Trả về NULL nếu a = b, không thì a.

```sql
SELECT COALESCE(phone, 'N/A') FROM users;
```

---

## Câu hỏi thường gặp

### Thứ tự thực thi (logical)?

- FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. (Thực tế optimizer có thể đổi thứ tự vật lý.)

### LIMIT có chuẩn SQL không?

- **LIMIT n** có trong MySQL, PostgreSQL, SQLite. Chuẩn SQL dùng **FETCH FIRST n ROWS ONLY** (SQL:2008). SQL Server dùng **TOP n**.

---

**Tiếp theo:** [03-Joins.md](./03-Joins.md)
