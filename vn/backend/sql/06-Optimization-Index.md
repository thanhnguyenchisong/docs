# Optimization & Index - Câu hỏi phỏng vấn SQL

## Mục lục
1. [EXPLAIN và execution plan](#explain-và-execution-plan)
2. [Index: khi nào dùng](#index-khi-nào-dùng)
3. [Composite index](#composite-index)
4. [Anti-pattern cần tránh](#anti-pattern-cần-tránh)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## EXPLAIN và execution plan

- **EXPLAIN** (hoặc EXPLAIN ANALYZE): Hiển thị **execution plan** — cách DB thực thi query (index scan, seq scan, join type, cost).

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'a@b.com';
```

- Cần xem: **Seq Scan** (full table) vs **Index Scan** (dùng index); **cost**, **rows**; **Nested Loop** vs **Hash Join** vs **Merge Join**.
- **EXPLAIN ANALYZE** chạy thật query và cho thời gian thực; **EXPLAIN** không chạy.

---

## Index: khi nào dùng

- **Nên index**: Cột trong WHERE, JOIN ON, ORDER BY, GROUP BY; cột unique (UNIQUE constraint thường tạo index).
- **Cân nhắc**: Bảng nhỏ (seq scan có thể nhanh hơn); bảng write nhiều (index tốn thêm chi phí ghi).
- **Không hiệu quả**: Cột ít giá trị (low cardinality, e.g. boolean); dùng hàm/expression trên cột mà index không cover (e.g. WHERE UPPER(name) = 'X' không dùng index name). Có thể dùng **expression index** (e.g. index trên UPPER(name)) nếu DB hỗ trợ.

---

## Composite index

- Index trên **nhiều cột** (thứ tự cột quan trọng). Thường dùng được khi điều kiện/sort dùng **prefix** của index (left-prefix).
- Ví dụ: index (a, b, c) dùng cho WHERE a = ? AND b = ?, ORDER BY a, b; có thể không dùng cho chỉ WHERE b = ? hoặc ORDER BY c.

```sql
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
-- Tốt: WHERE user_id = ? ORDER BY created_at DESC
```

---

## Anti-pattern cần tránh

- **SELECT *** khi chỉ cần vài cột: Tăng I/O, mất cơ hội “index only scan” nếu có covering index.
- **Function trên cột trong WHERE**: WHERE YEAR(date_col) = 2024 → không dùng index trên date_col; nên range: date_col >= '2024-01-01' AND date_col < '2025-01-01'.
- **OR nhiều điều kiện** có thể dẫn tới nhiều index scan rồi merge; IN hoặc UNION đôi khi tối ưu hơn.
- **OFFSET lớn**: LIMIT n OFFSET m khi m lớn → scan m+n dòng. Nên dùng **cursor** (WHERE id > last_seen_id ORDER BY id LIMIT n).
- **N+1 query**: Ở app, tránh vòng lặp query theo từng id; dùng JOIN hoặc IN (batch) trong một query.

---

## Câu hỏi thường gặp

### Covering index là gì?

- Index chứa **đủ** cột mà query cần (SELECT + WHERE/ORDER BY) → DB có thể chỉ đọc index, không cần đọc bảng (index-only scan). Ví dụ: SELECT a, b FROM t WHERE a = 1 và index (a, b).

### Khi nào full table scan chấp nhận được?

- Bảng rất nhỏ; hoặc phần lớn bảng được đọc (filter không chọn lọc) → sequential scan đôi khi rẻ hơn random access qua index.

---

**Kết thúc SQL.** Quay lại [README](./README.md).
