# Indexes và Performance - Câu hỏi phỏng vấn

## Mục lục
1. [Indexes là gì?](#indexes-là-gì)
2. [Types of Indexes](#types-of-indexes)
3. [Index Strategy](#index-strategy)
4. [Query Optimization](#query-optimization)
5. [Execution Plans](#execution-plans)
6. [Performance Tuning](#performance-tuning)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Indexes là gì?

### Index (Chỉ mục)

**Định nghĩa:**
- Index là data structure giúp tăng tốc độ truy vấn
- Tương tự như index trong sách
- Cho phép database tìm data nhanh hơn mà không cần scan toàn bộ table

### Cách hoạt động

**Without Index:**
```sql
-- Full table scan: O(n) - phải scan tất cả rows
SELECT * FROM users WHERE email = 'john@example.com';
-- Database phải đọc từng row để tìm match
```

**With Index:**
```sql
-- Index scan: O(log n) - binary search
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'john@example.com';
-- Database dùng index để tìm nhanh
```

### Benefits

1. **Faster Queries**: Tăng tốc SELECT queries
2. **Efficient Sorting**: ORDER BY nhanh hơn
3. **Unique Constraints**: Enforce uniqueness
4. **Foreign Keys**: Improve JOIN performance

### Trade-offs

1. **Storage**: Indexes chiếm disk space
2. **Write Performance**: INSERT/UPDATE/DELETE chậm hơn
3. **Maintenance**: Indexes cần được maintain

---

## Types of Indexes

### 1. B-Tree Index (Balanced Tree)

**Đặc điểm:**
- Default index type trong hầu hết databases
- Tốt cho range queries và equality
- Maintained automatically

**Ví dụ:**
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
```

**Use Cases:**
- Equality queries: `WHERE email = '...'`
- Range queries: `WHERE age BETWEEN 18 AND 65`
- Sorting: `ORDER BY created_at`
- JOINs: Foreign key columns

### 2. Hash Index

**Đặc điểm:**
- Chỉ tốt cho equality queries (=)
- Không hỗ trợ range queries
- Faster cho exact matches

**Ví dụ:**
```sql
-- PostgreSQL
CREATE INDEX idx_users_email_hash ON users USING HASH (email);

-- MySQL (MEMORY engine)
CREATE INDEX idx_users_email_hash ON users(email) USING HASH;
```

**Use Cases:**
- Exact matches only
- High-cardinality columns
- No range queries needed

### 3. Composite Index (Multi-column)

**Đặc điểm:**
- Index trên nhiều columns
- Order matters: Leftmost prefix rule
- Tốt cho queries với multiple WHERE conditions

**Ví dụ:**
```sql
-- Composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- Queries that can use this index:
SELECT * FROM orders WHERE user_id = 1;  -- ✅ Uses index
SELECT * FROM orders WHERE user_id = 1 AND order_date > '2023-01-01';  -- ✅ Uses index
SELECT * FROM orders WHERE order_date > '2023-01-01';  -- ❌ Cannot use index (no user_id)
```

**Leftmost Prefix Rule:**
- Index (A, B, C) có thể dùng cho:
  - WHERE A = ...
  - WHERE A = ... AND B = ...
  - WHERE A = ... AND B = ... AND C = ...
- Không thể dùng cho:
  - WHERE B = ...
  - WHERE C = ...
  - WHERE B = ... AND C = ...

### 4. Unique Index

**Đặc điểm:**
- Đảm bảo uniqueness
- Tự động tạo khi define UNIQUE constraint
- Faster lookups

**Ví dụ:**
```sql
-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Equivalent to:
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
```

### 5. Partial Index

**Đặc điểm:**
- Index chỉ trên subset của rows
- Tiết kiệm space
- Faster cho filtered queries

**Ví dụ:**
```sql
-- PostgreSQL: Index only active users
CREATE INDEX idx_users_active_email ON users(email) 
WHERE status = 'active';

-- Query sử dụng index:
SELECT * FROM users WHERE status = 'active' AND email = '...';
```

### 6. Covering Index

**Đặc điểm:**
- Index chứa tất cả columns cần cho query
- Không cần access table data
- Very fast

**Ví dụ:**
```sql
-- Covering index
CREATE INDEX idx_orders_covering ON orders(user_id, order_date, total);

-- Query chỉ cần index, không cần table:
SELECT user_id, order_date, total 
FROM orders 
WHERE user_id = 1;
-- Database chỉ đọc từ index, không đọc table
```

---

## Index Strategy

### Khi nào nên tạo Index?

**Nên index:**
1. **Primary Keys**: Tự động indexed
2. **Foreign Keys**: Improve JOIN performance
3. **Frequently queried columns**: WHERE, JOIN
4. **Columns in ORDER BY**: Sorting
5. **Columns in GROUP BY**: Aggregation
6. **High-cardinality columns**: Many unique values

**Không nên index:**
1. **Low-cardinality columns**: Few unique values (status, gender)
2. **Rarely queried columns**: Not used in queries
3. **Frequently updated columns**: Slow down writes
4. **Small tables**: Full scan may be faster

### Index Best Practices

#### 1. Index Foreign Keys

```sql
-- Always index foreign keys
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index if not automatic
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

#### 2. Composite Index Order

```sql
-- Order matters: Most selective first
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
-- user_id is more selective than order_date

-- Wrong order:
CREATE INDEX idx_orders_date_user ON orders(order_date, user_id);
-- Less efficient
```

#### 3. Avoid Over-Indexing

```sql
-- ❌ Too many indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_country ON users(country);
-- Each index slows down INSERT/UPDATE

-- ✅ Index only what's needed
CREATE INDEX idx_users_email ON users(email);  -- Most queried
```

#### 4. Monitor Index Usage

```sql
-- PostgreSQL: Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan  -- Number of times index used
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- MySQL: Check unused indexes
SELECT * FROM sys.schema_unused_indexes;
```

---

## Query Optimization

### 1. Use Indexes Effectively

```sql
-- ✅ Good: Uses index
SELECT * FROM users WHERE email = 'john@example.com';
-- Index: idx_users_email

-- ❌ Bad: Cannot use index
SELECT * FROM users WHERE UPPER(email) = 'JOHN@EXAMPLE.COM';
-- Function on column prevents index usage

-- ✅ Good: Rewrite query
SELECT * FROM users WHERE email = UPPER('john@example.com');
```

### 2. Avoid Functions on Indexed Columns

```sql
-- ❌ Bad: Function prevents index usage
SELECT * FROM users WHERE YEAR(created_at) = 2023;

-- ✅ Good: Range query uses index
SELECT * FROM users 
WHERE created_at >= '2023-01-01' 
  AND created_at < '2024-01-01';
```

### 3. Use LIMIT

```sql
-- ✅ Good: Limit results
SELECT * FROM users 
WHERE country = 'USA' 
ORDER BY created_at DESC 
LIMIT 10;

-- ❌ Bad: Returns all rows
SELECT * FROM users WHERE country = 'USA';
```

### 4. Select Only Needed Columns

```sql
-- ✅ Good: Select specific columns
SELECT id, username, email FROM users;

-- ❌ Bad: SELECT * (unless all columns needed)
SELECT * FROM users;
```

### 5. Avoid SELECT DISTINCT When Possible

```sql
-- ❌ Bad: DISTINCT is expensive
SELECT DISTINCT country FROM users;

-- ✅ Good: Use GROUP BY if possible
SELECT country FROM users GROUP BY country;
```

### 6. Use EXISTS Instead of IN for Large Subqueries

```sql
-- ❌ Bad: IN with large subquery
SELECT * FROM users 
WHERE id IN (
    SELECT user_id FROM orders WHERE total > 1000
);

-- ✅ Good: EXISTS is more efficient
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.total > 1000
);
```

### 7. Optimize JOINs

```sql
-- ✅ Good: Index foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);
SELECT u.username, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- ✅ Good: Join on indexed columns
-- Both user_id and id should be indexed
```

---

## Execution Plans

### EXPLAIN Statement

**Định nghĩa:**
- EXPLAIN shows how database executes query
- Helps identify performance bottlenecks
- Shows index usage, join types, row estimates

### PostgreSQL EXPLAIN

```sql
-- Basic EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- With actual execution time
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
```

**Output Example:**
```
Seq Scan on users  (cost=0.00..1000.00 rows=1 width=64)
  Filter: (email = 'john@example.com'::text)
```

**With Index:**
```
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=64)
  Index Cond: (email = 'john@example.com'::text)
```

### MySQL EXPLAIN

```sql
-- Basic EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- Extended format
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE email = 'john@example.com';
```

**Output Columns:**
- **type**: Join type (ALL, index, range, ref, eq_ref)
- **key**: Index used
- **rows**: Estimated rows examined
- **Extra**: Additional information

### Understanding Execution Plans

**Scan Types:**
- **Seq Scan (Full Table Scan)**: Scan all rows - slow
- **Index Scan**: Use index to find rows - fast
- **Index Only Scan**: Read only from index - very fast
- **Bitmap Index Scan**: Multiple index scans combined

**Join Types:**
- **Nested Loop**: Small tables
- **Hash Join**: Larger tables, equality joins
- **Merge Join**: Sorted data

**Red Flags:**
- Full table scans on large tables
- Missing index usage
- High row estimates
- Temporary tables
- Filesort operations

---

## Performance Tuning

### 1. Identify Slow Queries

```sql
-- PostgreSQL: Enable query logging
SET log_min_duration_statement = 1000;  -- Log queries > 1 second

-- MySQL: Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries > 1 second
```

### 2. Analyze Query Performance

```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE 
SELECT u.username, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

### 3. Add Missing Indexes

```sql
-- Identify missing indexes from EXPLAIN
-- If you see "Seq Scan", consider adding index

-- Add index
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 4. Update Statistics

```sql
-- PostgreSQL: Update table statistics
ANALYZE users;

-- MySQL: Update statistics
ANALYZE TABLE users;
```

### 5. Monitor Index Usage

```sql
-- PostgreSQL: Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Unused indexes
ORDER BY tablename;
```

### 6. Remove Unused Indexes

```sql
-- Drop unused indexes
DROP INDEX idx_users_unused_column;
```

### 7. Partition Large Tables

```sql
-- PostgreSQL: Partition by date
CREATE TABLE orders (
    id INT,
    user_id INT,
    order_date DATE,
    total DECIMAL(10, 2)
) PARTITION BY RANGE (order_date);

CREATE TABLE orders_2023 PARTITION OF orders
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
```

---

## Câu hỏi thường gặp

### Q1: Khi nào nên tạo index?

**Nên tạo index khi:**
- Column được dùng trong WHERE clause
- Column được dùng trong JOIN
- Column được dùng trong ORDER BY
- Column có high cardinality
- Foreign key columns

**Không nên tạo index khi:**
- Column có low cardinality (few unique values)
- Column ít được query
- Column được update thường xuyên
- Table nhỏ (full scan nhanh hơn)

### Q2: Composite index order quan trọng như thế nào?

**Rất quan trọng!** Leftmost prefix rule:

```sql
-- Index (A, B, C) có thể dùng cho:
WHERE A = ...                    -- ✅
WHERE A = ... AND B = ...        -- ✅
WHERE A = ... AND B = ... AND C = ...  -- ✅

-- Không thể dùng cho:
WHERE B = ...                    -- ❌
WHERE C = ...                    -- ❌
WHERE B = ... AND C = ...        -- ❌
```

**Best Practice:** Đặt most selective column first.

### Q3: Index có làm chậm INSERT/UPDATE/DELETE không?

**Có!** Mỗi index cần được update khi data thay đổi:
- **INSERT**: Thêm entry vào mỗi index
- **UPDATE**: Update index nếu indexed column thay đổi
- **DELETE**: Xóa entry từ mỗi index

**Trade-off:**
- Nhiều indexes = Faster SELECT, Slower INSERT/UPDATE/DELETE
- Ít indexes = Slower SELECT, Faster INSERT/UPDATE/DELETE

### Q4: Covering index là gì?

**Covering index** chứa tất cả columns cần cho query:

```sql
-- Covering index
CREATE INDEX idx_orders_covering ON orders(user_id, order_date, total);

-- Query chỉ cần index, không cần table
SELECT user_id, order_date, total 
FROM orders 
WHERE user_id = 1;
-- Database chỉ đọc từ index, không đọc table → Very fast
```

### Q5: Làm sao biết query có dùng index không?

**Dùng EXPLAIN:**

```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- Look for:
-- "Index Scan" = Using index ✅
-- "Seq Scan" = Full table scan ❌
```

### Q6: Partial index là gì?

**Partial index** chỉ index subset của rows:

```sql
-- Index only active users
CREATE INDEX idx_users_active_email ON users(email) 
WHERE status = 'active';

-- Benefits:
-- - Smaller index size
-- - Faster for filtered queries
-- - Less maintenance overhead
```

---

## Best Practices

1. **Index Primary Keys**: Automatic, but ensure it exists
2. **Index Foreign Keys**: Improve JOIN performance
3. **Index Frequently Queried Columns**: WHERE, JOIN, ORDER BY
4. **Monitor Index Usage**: Remove unused indexes
5. **Use Composite Indexes Wisely**: Consider leftmost prefix
6. **Avoid Over-Indexing**: Balance read vs write performance
7. **Update Statistics**: Keep statistics current
8. **Use EXPLAIN**: Analyze query execution plans

---

## Bài tập thực hành

### Bài 1: Index Strategy

```sql
-- Yêu cầu: Design index strategy cho e-commerce database
-- Tables: users, products, orders, order_items
-- Queries:
-- - Find user by email
-- - Find orders by user and date range
-- - Find products by category
-- - Calculate total sales per user
```

### Bài 2: Query Optimization

```sql
-- Yêu cầu: Optimize các queries sau
-- 1. Slow query với full table scan
-- 2. Query với function on indexed column
-- 3. Query với inefficient JOIN
-- 4. Query với unnecessary DISTINCT
```

### Bài 3: Execution Plan Analysis

```sql
-- Yêu cầu:
-- 1. Run EXPLAIN trên queries
-- 2. Identify performance issues
-- 3. Add indexes to fix issues
-- 4. Compare execution plans before/after
```

---

## Tổng kết

- **Indexes**: Data structures để tăng query performance
- **Types**: B-Tree, Hash, Composite, Unique, Partial, Covering
- **Strategy**: Index foreign keys, frequently queried columns
- **Optimization**: Use EXPLAIN, avoid functions on columns, use LIMIT
- **Trade-offs**: Faster reads vs slower writes
