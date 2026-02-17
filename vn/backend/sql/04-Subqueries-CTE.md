# Subqueries & CTE - Câu hỏi phỏng vấn SQL

## Mục lục
1. [Subquery (truy vấn con)](#subquery-truy-vấn-con)
2. [IN, EXISTS](#in-exists)
3. [Scalar subquery](#scalar-subquery)
4. [CTE (WITH)](#cte-with)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Subquery (truy vấn con)

- **Subquery** = truy vấn nằm trong truy vấn khác (trong SELECT, FROM, WHERE, HAVING).
- Có thể trả về: **một giá trị** (scalar), **một cột** (danh sách), hoặc **bảng** (nhiều cột, dùng trong FROM).

```sql
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);
```

---

## IN, EXISTS

### IN

- **WHERE col IN (subquery)**: col nằm trong tập kết quả (một cột) của subquery.
- Subquery trả về một cột; NULL trong subquery có thể làm logic IN phức tạp (NOT IN với NULL cần cẩn thận).

### EXISTS

- **WHERE EXISTS (subquery)**: Đúng nếu subquery trả về **ít nhất một dòng**; thường dùng correlated subquery (liên quan bảng ngoài).
- Optimizer thường dừng ngay khi tìm thấy 1 dòng → phù hợp “có tồn tại không”.

```sql
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.amount > 1000
);
```

- **NOT EXISTS**: Không có dòng nào thỏa subquery.

---

## Scalar subquery

- Subquery trả về **đúng một ô** (một cột, một dòng). Dùng trong SELECT, WHERE.

```sql
SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
FROM users u;
```

- Nếu subquery trả về 0 hoặc >1 dòng, một số DB báo lỗi (scalar phải đúng 1 giá trị).

---

## CTE (WITH)

- **CTE** (Common Table Expression): Định nghĩa “bảng tạm” trong truy vấn; dùng **WITH ... AS (subquery)**.

```sql
WITH active_orders AS (
    SELECT * FROM orders WHERE status = 'completed'
),
user_totals AS (
    SELECT user_id, SUM(amount) AS total
    FROM active_orders
    GROUP BY user_id
)
SELECT u.name, ut.total
FROM users u
JOIN user_totals ut ON u.id = ut.user_id
ORDER BY ut.total DESC;
```

- **Recursive CTE**: WITH RECURSIVE để duyệt cây/đồ thị (ví dụ cấp bậc nhân sự).

```sql
WITH RECURSIVE tree AS (
    SELECT id, name, parent_id, 1 AS level FROM nodes WHERE parent_id IS NULL
    UNION ALL
    SELECT n.id, n.name, n.parent_id, t.level + 1
    FROM nodes n JOIN tree t ON n.parent_id = t.id
)
SELECT * FROM tree;
```

---

## Câu hỏi thường gặp

### IN vs EXISTS?

- **IN**: Dễ đọc khi cần “nằm trong tập”; subquery độc lập (không phụ thuộc từng dòng ngoài).
- **EXISTS**: Tốt khi “kiểm tra tồn tại”, correlated; có thể tối ưu (dừng sớm). Chọn theo ngữ nghĩa và plan thực tế (EXPLAIN).

### Subquery vs JOIN vs CTE?

- **JOIN**: Khi quan hệ trực tiếp giữa bảng; thường nhanh, dễ dùng index.
- **Subquery**: Khi logic “tập con” (IN, EXISTS) hoặc scalar; có thể khó đọc.
- **CTE**: Tách bước trung gian, dễ đọc và tái sử dụng trong cùng query; recursive khi cần.

---

**Tiếp theo:** [05-Aggregation-Grouping.md](./05-Aggregation-Grouping.md)
