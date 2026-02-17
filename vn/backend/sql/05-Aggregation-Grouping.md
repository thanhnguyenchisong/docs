# Aggregation & Grouping - Câu hỏi phỏng vấn SQL

## Mục lục
1. [Hàm tập hợp (aggregate)](#hàm-tập-hợp-aggregate)
2. [GROUP BY](#group-by)
3. [HAVING](#having)
4. [Window functions](#window-functions)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Hàm tập hợp (aggregate)

- **COUNT(*)**: Đếm số dòng (kể cả NULL).
- **COUNT(col)**: Đếm dòng mà col NOT NULL.
- **SUM(col), AVG(col)**: Tổng, trung bình (bỏ qua NULL).
- **MIN(col), MAX(col)**: Giá trị nhỏ nhất, lớn nhất.
- **STRING_AGG** (PostgreSQL) / **GROUP_CONCAT** (MySQL): Gộp chuỗi theo nhóm.

```sql
SELECT COUNT(*), AVG(amount), SUM(amount) FROM orders;
```

---

## GROUP BY

- Gom các dòng có **cùng giá trị** ở cột (hoặc expression) trong GROUP BY; mỗi nhóm cho một dòng kết quả; cột không trong GROUP BY phải nằm trong hàm tập hợp.

```sql
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total
FROM orders
GROUP BY user_id;
```

- **GROUP BY nhiều cột**: Nhóm theo tổ hợp (cột1, cột2).
- **GROUP BY expression**: Ví dụ GROUP BY DATE(created_at).

---

## HAVING

- **HAVING** lọc **sau khi** gộp nhóm (chỉ áp dụng cho kết quả aggregate). **WHERE** lọc **trước khi** gộp.

```sql
SELECT user_id, SUM(amount) AS total
FROM orders
GROUP BY user_id
HAVING SUM(amount) > 1000;
```

- Điều kiện HAVING thường dùng aggregate (SUM, COUNT, ...).

---

## Window functions

- **Window function**: Tính toán trên “cửa sổ” (tập con dòng liên quan) **không gộp** dòng thành một — mỗi dòng vẫn giữ nguyên, thêm cột kết quả (rank, tổng tích lũy, ...).

```sql
SELECT id, user_id, amount,
       SUM(amount) OVER (PARTITION BY user_id ORDER BY id) AS running_total,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn
FROM orders;
```

- **PARTITION BY**: Chia nhóm (như GROUP BY nhưng không collapse).
- **ORDER BY trong OVER**: Thứ tự trong cửa sổ (cho ROW_NUMBER, running sum, ...).
- **ROW_NUMBER(), RANK(), DENSE_RANK()**: Đánh số thứ tự; RANK nhảy số khi cùng hạng, DENSE_RANK không nhảy.
- **LAG/LEAD**: Lấy giá trị dòng trước/sau.

---

## Câu hỏi thường gặp

### WHERE vs HAVING?

- **WHERE**: Lọc dòng **trước** GROUP BY; không dùng aggregate (trừ subquery).
- **HAVING**: Lọc **sau** GROUP BY; thường dùng với aggregate.

### COUNT(*) vs COUNT(col)?

- **COUNT(*)**: Đếm mọi dòng.
- **COUNT(col)**: Đếm dòng mà col IS NOT NULL. COUNT(DISTINCT col): đếm số giá trị khác nhau.

---

**Tiếp theo:** [06-Optimization-Index.md](./06-Optimization-Index.md)
