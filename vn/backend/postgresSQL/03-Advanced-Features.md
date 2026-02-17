# Advanced Features - Câu hỏi phỏng vấn

## Mục lục
1. [CTEs (Common Table Expressions)](#ctes-common-table-expressions)
2. [Window Functions](#window-functions)
3. [Full-Text Search](#full-text-search)
4. [Stored Procedures và Functions](#stored-procedures-và-functions)
5. [Triggers](#triggers)
6. [Partitioning](#partitioning)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## CTEs (Common Table Expressions)

### CTE là gì?

**Định nghĩa:**
- Named temporary result set
- Exists for single query
- Improves readability
- Can be recursive

### Basic CTE

```sql
-- Simple CTE
WITH high_value_orders AS (
    SELECT * FROM orders WHERE total > 1000
)
SELECT 
    u.username,
    hvo.total
FROM users u
INNER JOIN high_value_orders hvo ON u.id = hvo.user_id;
```

### Multiple CTEs

```sql
WITH 
    active_users AS (
        SELECT * FROM users WHERE status = 'active'
    ),
    user_orders AS (
        SELECT 
            au.id,
            COUNT(o.id) AS order_count
        FROM active_users au
        LEFT JOIN orders o ON au.id = o.user_id
        GROUP BY au.id
    )
SELECT 
    au.username,
    uo.order_count
FROM active_users au
INNER JOIN user_orders uo ON au.id = uo.id;
```

### Recursive CTE

```sql
-- Hierarchical data
WITH RECURSIVE employee_hierarchy AS (
    -- Base case
    SELECT 
        id,
        name,
        manager_id,
        0 AS level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        e.id,
        e.name,
        e.manager_id,
        eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM employee_hierarchy ORDER BY level, name;
```

---

## Window Functions

### Window Functions là gì?

**Định nghĩa:**
- Perform calculations across set of rows
- Don't group rows like GROUP BY
- Return value for each row

### Common Window Functions

```sql
-- ROW_NUMBER
SELECT 
    username,
    total_spent,
    ROW_NUMBER() OVER (ORDER BY total_spent DESC) AS rank
FROM user_totals;

-- RANK và DENSE_RANK
SELECT 
    username,
    total_spent,
    RANK() OVER (ORDER BY total_spent DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY total_spent DESC) AS dense_rank
FROM user_totals;

-- LAG và LEAD
SELECT 
    order_date,
    total,
    LAG(total) OVER (ORDER BY order_date) AS previous_total,
    LEAD(total) OVER (ORDER BY order_date) AS next_total
FROM orders;

-- Aggregate window functions
SELECT 
    order_date,
    total,
    SUM(total) OVER (ORDER BY order_date) AS running_total,
    AVG(total) OVER (PARTITION BY user_id) AS avg_user_order
FROM orders;
```

### Window Frame

```sql
-- ROWS BETWEEN
SELECT 
    order_date,
    total,
    SUM(total) OVER (
        ORDER BY order_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS three_day_total
FROM orders;

-- RANGE BETWEEN
SELECT 
    order_date,
    total,
    SUM(total) OVER (
        ORDER BY order_date
        RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW
    ) AS seven_day_total
FROM orders;
```

---

## Full-Text Search

### Full-Text Search là gì?

**Định nghĩa:**
- Search text documents
- Ranked results
- Language-aware
- Built-in PostgreSQL feature

### Setup Full-Text Search

```sql
-- Create table với text column
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content TEXT
);

-- Create GIN index
CREATE INDEX idx_articles_content_gin ON articles 
USING GIN (to_tsvector('english', content));

-- Or use tsvector column
ALTER TABLE articles ADD COLUMN content_tsvector tsvector;
CREATE INDEX idx_articles_tsvector ON articles USING GIN (content_tsvector);

-- Update tsvector
UPDATE articles 
SET content_tsvector = to_tsvector('english', content);
```

### Full-Text Search Queries

```sql
-- Basic search
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'postgresql');

-- With ranking
SELECT 
    title,
    content,
    ts_rank(to_tsvector('english', content), to_tsquery('english', 'postgresql')) AS rank
FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'postgresql')
ORDER BY rank DESC;

-- Phrase search
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ phraseto_tsquery('english', 'postgresql database');

-- Multiple words
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'postgresql & database');
```

### Full-Text Search Functions

```sql
-- to_tsvector: Convert text to searchable vector
SELECT to_tsvector('english', 'PostgreSQL is a powerful database');

-- to_tsquery: Convert query string to query
SELECT to_tsquery('english', 'postgresql & database');

-- ts_rank: Rank results
SELECT ts_rank(
    to_tsvector('english', 'PostgreSQL is great'),
    to_tsquery('english', 'postgresql')
);

-- highlight: Highlight matches
SELECT ts_headline(
    'english',
    content,
    to_tsquery('english', 'postgresql')
) FROM articles;
```

---

## Stored Procedures và Functions

### Functions

**Định nghĩa:**
- Reusable SQL code
- Can return values
- Can accept parameters
- Written in SQL, PL/pgSQL, or other languages

### SQL Function

```sql
-- Simple SQL function
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id INTEGER)
RETURNS TABLE (
    order_id INTEGER,
    order_date DATE,
    total DECIMAL
) AS $$
    SELECT id, order_date, total
    FROM orders
    WHERE user_id = p_user_id;
$$ LANGUAGE SQL;

-- Call function
SELECT * FROM get_user_orders(1);
```

### PL/pgSQL Function

```sql
-- PL/pgSQL function
CREATE OR REPLACE FUNCTION calculate_total(p_user_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    v_total DECIMAL;
BEGIN
    SELECT SUM(total) INTO v_total
    FROM orders
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_total, 0);
END;
$$ LANGUAGE plpgsql;

-- Call function
SELECT calculate_total(1);
```

### Function với Transactions

```sql
-- Function với error handling
CREATE OR REPLACE FUNCTION transfer_money(
    p_from_account INTEGER,
    p_to_account INTEGER,
    p_amount DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
    v_from_balance DECIMAL;
BEGIN
    -- Check balance
    SELECT balance INTO v_from_balance
    FROM accounts
    WHERE id = p_from_account;
    
    IF v_from_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Transfer
    BEGIN
        UPDATE accounts SET balance = balance - p_amount 
        WHERE id = p_from_account;
        
        UPDATE accounts SET balance = balance + p_amount 
        WHERE id = p_to_account;
        
        RETURN TRUE;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql;
```

---

## Triggers

### Trigger là gì?

**Định nghĩa:**
- Automatic code execution on events
- BEFORE hoặc AFTER INSERT/UPDATE/DELETE
- Enforce business rules
- Audit logging

### BEFORE Trigger

```sql
-- Validate before insert
CREATE OR REPLACE FUNCTION validate_user_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email NOT LIKE '%@%' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_email_before_insert
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION validate_user_email();
```

### AFTER Trigger

```sql
-- Audit log trigger
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    action VARCHAR(10),
    record_id INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, action, record_id)
        VALUES ('users', 'INSERT', NEW.id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, action, record_id)
        VALUES ('users', 'UPDATE', NEW.id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, action, record_id)
        VALUES ('users', 'DELETE', OLD.id);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION log_user_changes();
```

---

## Partitioning

### Partitioning là gì?

**Định nghĩa:**
- Split large table into smaller tables
- Improve performance
- Easier maintenance
- Types: Range, List, Hash

### Range Partitioning

```sql
-- Partition by date
CREATE TABLE orders (
    id SERIAL,
    user_id INTEGER,
    order_date DATE,
    total DECIMAL(10, 2)
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE orders_2023 PARTITION OF orders
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Insert (automatically routed to correct partition)
INSERT INTO orders (user_id, order_date, total)
VALUES (1, '2023-06-15', 100.00);
-- Goes to orders_2023 partition
```

### List Partitioning

```sql
-- Partition by category
CREATE TABLE products (
    id SERIAL,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2)
) PARTITION BY LIST (category);

-- Create partitions
CREATE TABLE products_electronics PARTITION OF products
FOR VALUES IN ('laptop', 'phone', 'tablet');

CREATE TABLE products_clothing PARTITION OF products
FOR VALUES IN ('shirt', 'pants', 'shoes');
```

---

## Câu hỏi thường gặp

### Q1: CTE vs Subquery?

**CTE:**
- More readable
- Can be referenced multiple times
- Can be recursive
- Better for complex queries

**Subquery:**
- Inline, less readable
- Can't be recursive
- Good for simple cases

### Q2: Window Functions vs GROUP BY?

**GROUP BY:**
- Groups rows, returns one row per group
- Reduces number of rows

**Window Functions:**
- Keeps all rows, adds calculated column
- Returns same number of rows

### Q3: Full-Text Search setup?

**Steps:**
1. Create GIN index on tsvector column
2. Use to_tsvector() to convert text
3. Use to_tsquery() for queries
4. Use @@ operator for matching

### Q4: Function vs Trigger?

**Function:**
- Reusable code
- Called explicitly
- Returns values

**Trigger:**
- Automatic execution
- Triggered by events
- No return value (except trigger function)

### Q5: Partitioning benefits?

**Benefits:**
- Better performance
- Easier maintenance
- Faster queries (partition pruning)
- Easier to drop old data

### Q6: Khi nào dùng partitioning?

**Use partitioning when:**
- Table very large (> millions of rows)
- Queries filter by partition key
- Need to drop old data easily
- Improve query performance

---

## Best Practices

1. **Use CTEs**: For complex queries
2. **Use Window Functions**: For rankings, running totals
3. **Index Full-Text**: Create GIN indexes
4. **Use Functions**: For reusable logic
5. **Use Triggers Sparingly**: Can be hard to debug
6. **Partition Large Tables**: Improve performance

---

## Bài tập thực hành

### Bài 1: CTEs

```sql
-- Yêu cầu:
-- 1. Create recursive CTE for hierarchy
-- 2. Create multiple CTEs
-- 3. Use CTEs in complex queries
```

### Bài 2: Window Functions

```sql
-- Yêu cầu:
-- 1. Use ROW_NUMBER, RANK, DENSE_RANK
-- 2. Use LAG, LEAD
-- 3. Use aggregate window functions
-- 4. Use window frames
```

### Bài 3: Full-Text Search

```sql
-- Yêu cầu:
-- 1. Setup full-text search
-- 2. Create GIN index
-- 3. Perform searches
-- 4. Rank results
```

---

## Tổng kết

- **CTEs**: Named temporary result sets, can be recursive
- **Window Functions**: Calculations across rows
- **Full-Text Search**: Built-in text search với ranking
- **Functions**: Reusable SQL code
- **Triggers**: Automatic code execution
- **Partitioning**: Split large tables for performance
