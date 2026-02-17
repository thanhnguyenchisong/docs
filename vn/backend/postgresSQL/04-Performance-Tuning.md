# Performance Tuning - Câu hỏi phỏng vấn

## Mục lục
1. [Indexes](#indexes)
2. [Query Optimization](#query-optimization)
3. [EXPLAIN và EXPLAIN ANALYZE](#explain-và-explain-analyze)
4. [VACUUM và ANALYZE](#vacuum-và-analyze)
5. [Connection Pooling](#connection-pooling)
6. [Configuration Tuning](#configuration-tuning)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Indexes

### Index Types

#### 1. B-Tree Index (Default)

```sql
-- B-Tree index (default)
CREATE INDEX idx_users_email ON users(email);

-- Use cases:
-- - Equality queries
-- - Range queries
-- - Sorting
-- - Foreign keys
```

#### 2. Hash Index

```sql
-- Hash index (equality only)
CREATE INDEX idx_users_username_hash ON users USING HASH (username);

-- Use cases:
-- - Equality queries only
-- - No range queries
-- - No sorting
```

#### 3. GIN Index (Generalized Inverted Index)

```sql
-- GIN index for arrays, JSONB, full-text
CREATE INDEX idx_products_tags_gin ON products USING GIN (tags);
CREATE INDEX idx_products_attributes_gin ON products USING GIN (attributes);

-- Use cases:
-- - Arrays
-- - JSONB
-- - Full-text search
```

#### 4. GiST Index (Generalized Search Tree)

```sql
-- GiST index for geometric, full-text
CREATE INDEX idx_locations_coords_gist ON locations USING GiST (coordinates);

-- Use cases:
-- - Geometric data
-- - Full-text search
-- - Range types
```

### Index Strategy

```sql
-- Index foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Index frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category_id ON products(category_id);

-- Composite indexes
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);

-- Partial index
CREATE INDEX idx_users_active_email ON users(email) 
WHERE status = 'active';

-- Covering index
CREATE INDEX idx_orders_covering ON orders(user_id, order_date, total);
```

---

## Query Optimization

### Optimization Techniques

#### 1. Use Indexes Effectively

```sql
-- ✅ Good: Uses index
SELECT * FROM users WHERE email = 'john@example.com';

-- ❌ Bad: Cannot use index
SELECT * FROM users WHERE UPPER(email) = 'JOHN@EXAMPLE.COM';

-- ✅ Good: Rewrite query
SELECT * FROM users WHERE email = UPPER('john@example.com');
```

#### 2. Avoid Functions on Indexed Columns

```sql
-- ❌ Bad: Function prevents index usage
SELECT * FROM users WHERE YEAR(created_at) = 2023;

-- ✅ Good: Range query uses index
SELECT * FROM users 
WHERE created_at >= '2023-01-01' 
  AND created_at < '2024-01-01';
```

#### 3. Use LIMIT

```sql
-- ✅ Good: Limit results
SELECT * FROM users 
WHERE country = 'USA' 
ORDER BY created_at DESC 
LIMIT 10;
```

#### 4. Select Only Needed Columns

```sql
-- ✅ Good: Select specific columns
SELECT id, username, email FROM users;

-- ❌ Bad: SELECT * (unless all columns needed)
SELECT * FROM users;
```

#### 5. Use EXISTS Instead of IN

```sql
-- ❌ Bad: IN with large subquery
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- ✅ Good: EXISTS is more efficient
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.total > 1000
);
```

---

## EXPLAIN và EXPLAIN ANALYZE

### EXPLAIN

**Định nghĩa:**
- Shows query execution plan
- Doesn't execute query
- Shows how PostgreSQL will execute

```sql
-- Basic EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';

-- Output:
-- Seq Scan on users  (cost=0.00..1000.00 rows=1 width=64)
--   Filter: (email = 'john@example.com'::text)

-- With index:
-- Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=64)
--   Index Cond: (email = 'john@example.com'::text)
```

### EXPLAIN ANALYZE

**Định nghĩa:**
- Actually executes query
- Shows actual execution time
- Shows actual rows

```sql
-- EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';

-- Output includes:
-- - Planning time
-- - Execution time
-- - Actual rows
-- - Actual loops
```

### Understanding Execution Plans

**Scan Types:**
- **Seq Scan**: Full table scan - slow
- **Index Scan**: Use index - fast
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

## VACUUM và ANALYZE

### VACUUM

**Định nghĩa:**
- Reclaims storage from dead tuples
- Updates statistics
- Required for MVCC
- Can run automatically (autovacuum)

```sql
-- Manual vacuum
VACUUM;

-- Vacuum specific table
VACUUM users;

-- Vacuum và analyze
VACUUM ANALYZE;

-- Vacuum full (locks table)
VACUUM FULL users;
```

### ANALYZE

**Định nghĩa:**
- Updates table statistics
- Used by query planner
- Should run regularly

```sql
-- Analyze table
ANALYZE users;

-- Analyze specific columns
ANALYZE users (username, email);
```

### Autovacuum

**Configuration:**
```conf
# postgresql.conf
autovacuum = on
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

---

## Connection Pooling

### Connection Pooling là gì?

**Định nghĩa:**
- Reuse database connections
- Reduce connection overhead
- Improve performance
- Tools: pgBouncer, Pgpool-II

### pgBouncer

**Configuration:**
```ini
[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_port = 6432
listen_addr = localhost
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

---

## Configuration Tuning

### Memory Settings

```conf
# postgresql.conf

# Shared memory
shared_buffers = 128MB          # 25% of RAM for dedicated server

# Work memory
work_mem = 4MB                  # Memory for operations

# Maintenance memory
maintenance_work_mem = 64MB     # Memory for maintenance
```

### Connection Settings

```conf
# Max connections
max_connections = 100

# Connection timeout
connection_timeout = 60
```

### WAL Settings

```conf
# WAL level
wal_level = replica

# WAL size
max_wal_size = 1GB
min_wal_size = 80MB
```

---

## Câu hỏi thường gặp

### Q1: Index types khác nhau?

**B-Tree:**
- Default index
- Good for equality, range, sorting

**Hash:**
- Equality only
- Faster for exact matches

**GIN:**
- Arrays, JSONB, full-text
- Larger index size

**GiST:**
- Geometric, full-text
- Flexible

### Q2: Khi nào dùng VACUUM?

**Use VACUUM:**
- Regularly (autovacuum)
- After large deletes
- Before performance issues
- To update statistics

**VACUUM FULL:**
- Only when needed
- Locks table
- Reclaims more space

### Q3: EXPLAIN vs EXPLAIN ANALYZE?

**EXPLAIN:**
- Shows plan
- Doesn't execute
- Faster

**EXPLAIN ANALYZE:**
- Executes query
- Shows actual time
- More accurate

### Q4: Query optimization tips?

**Tips:**
1. Use indexes
2. Avoid functions on columns
3. Use LIMIT
4. Select only needed columns
5. Use EXISTS instead of IN
6. Analyze execution plans

### Q5: Connection pooling?

**Benefits:**
- Reuse connections
- Reduce overhead
- Better performance

**Tools:**
- pgBouncer
- Pgpool-II

---

## Best Practices

1. **Index Strategically**: Foreign keys, frequently queried columns
2. **Use EXPLAIN**: Analyze query plans
3. **Regular VACUUM**: Keep database healthy
4. **Monitor Performance**: Track slow queries
5. **Tune Configuration**: Optimize for workload
6. **Use Connection Pooling**: For applications

---

## Bài tập thực hành

### Bài 1: Indexes

```sql
-- Yêu cầu:
-- 1. Create different index types
-- 2. Test query performance
-- 3. Compare with/without indexes
```

### Bài 2: Query Optimization

```sql
-- Yêu cầu:
-- 1. Write slow query
-- 2. Use EXPLAIN ANALYZE
-- 3. Optimize query
-- 4. Compare performance
```

### Bài 3: VACUUM

```sql
-- Yêu cầu:
-- 1. Create table với data
-- 2. Delete data
-- 3. Run VACUUM
-- 4. Check statistics
```

---

## Tổng kết

- **Indexes**: B-Tree, Hash, GIN, GiST
- **Query Optimization**: Use indexes, avoid functions
- **EXPLAIN**: Analyze query plans
- **VACUUM**: Reclaim storage, update statistics
- **Connection Pooling**: Reuse connections
- **Configuration**: Tune for workload
