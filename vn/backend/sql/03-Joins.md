# Joins - Câu hỏi phỏng vấn SQL

## Mục lục
1. [INNER JOIN](#inner-join)
2. [LEFT / RIGHT / FULL OUTER JOIN](#left--right--full-outer-join)
3. [Self-join và nhiều bảng](#self-join-và-nhiều-bảng)
4. [CROSS JOIN](#cross-join)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## INNER JOIN

- Chỉ giữ các dòng **khớp** ở cả hai bảng (intersection).

```sql
SELECT u.name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

- **ON**: Điều kiện join. **WHERE** dùng để lọc thêm (sau khi join).
- Alias bảng (u, o) để viết ngắn.

---

## LEFT / RIGHT / FULL OUTER JOIN

- **LEFT JOIN**: Giữ toàn bộ bảng trái; bảng phải không khớp thì NULL.
- **RIGHT JOIN**: Giữ toàn bộ bảng phải; bảng trái không khớp thì NULL.
- **FULL OUTER JOIN**: Hợp cả hai; chỗ không khớp thì NULL.

```sql
SELECT u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- User không có order vẫn xuất hiện, order_id = NULL
```

- Dùng **LEFT JOIN** khi cần “tất cả bên trái, có hoặc không có bên phải” (ví dụ: user và order gần nhất).

---

## Self-join và nhiều bảng

### Self-join

- Join bảng với chính nó (alias khác nhau).

```sql
SELECT a.name AS employee, b.name AS manager
FROM employees a
LEFT JOIN employees b ON a.manager_id = b.id;
```

### Nhiều bảng

```sql
SELECT u.name, o.amount, p.product_name
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;
```

- Thứ tự join ảnh hưởng plan; optimizer thường chọn thứ tự tốt nếu có index và thống kê.

---

## CROSS JOIN

- Tích Đề-các: mỗi dòng bảng A kết hợp với mọi dòng bảng B. Dùng khi cần tổ hợp (ví dụ: mỗi ngày × mỗi sản phẩm). Cẩn thận khi bảng lớn.

```sql
SELECT * FROM a CROSS JOIN b;
```

---

## Câu hỏi thường gặp

### INNER JOIN vs WHERE (cú pháp cũ)?

- `FROM a, b WHERE a.id = b.a_id` tương đương INNER JOIN. Nên dùng **JOIN ... ON** rõ ràng, tách điều kiện join và điều kiện lọc (WHERE).

### Khi nào dùng LEFT thay vì INNER?

- Khi cần **giữ toàn bộ** bảng bên trái dù bên phải không có bản ghi khớp (ví dụ: tất cả user kèm số order; user không có order vẫn có dòng, cột order là NULL).

---

**Tiếp theo:** [04-Subqueries-CTE.md](./04-Subqueries-CTE.md)
