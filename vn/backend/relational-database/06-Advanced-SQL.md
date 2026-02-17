# Advanced SQL - Câu hỏi phỏng vấn

## Mục lục
1. [Window Functions](#window-functions)
2. [CTEs (Common Table Expressions)](#ctes-common-table-expressions)
3. [Stored Procedures](#stored-procedures)
4. [Triggers](#triggers)
5. [Views và Materialized Views](#views-và-materialized-views)
6. [Advanced JOINs](#advanced-joins)
7. [Recursive Queries](#recursive-queries)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Window Functions

### Window Functions là gì?

**Định nghĩa:**
- Window functions perform calculations across set of rows
- Không group rows như GROUP BY
- Return value for each row
- Use OVER() clause

### Basic Syntax

```sql
SELECT 
    column1,
    column2,
    WINDOW_FUNCTION() OVER (
        PARTITION BY column
        ORDER BY column
        ROWS BETWEEN ... AND ...
    ) AS alias
FROM table_name;
```

### Common Window Functions

#### 1. ROW_NUMBER()

```sql
-- Assign sequential number to each row
SELECT 
    username,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at) AS row_num
FROM users;

-- Partition by category
SELECT 
    product_name,
    category_id,
    price,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_in_category
FROM products;
```

#### 2. RANK() và DENSE_RANK()

```sql
-- RANK: Gaps in ranking (1, 2, 2, 4)
SELECT 
    username,
    total_spent,
    RANK() OVER (ORDER BY total_spent DESC) AS rank
FROM user_totals;

-- DENSE_RANK: No gaps (1, 2, 2, 3)
SELECT 
    username,
    total_spent,
    DENSE_RANK() OVER (ORDER BY total_spent DESC) AS dense_rank
FROM user_totals;
```

**Difference:**
- **RANK()**: 1, 2, 2, 4 (skips 3)
- **DENSE_RANK()**: 1, 2, 2, 3 (no gaps)

#### 3. LAG() và LEAD()

```sql
-- LAG: Previous row value
SELECT 
    order_date,
    total,
    LAG(total) OVER (ORDER BY order_date) AS previous_total,
    total - LAG(total) OVER (ORDER BY order_date) AS difference
FROM orders;

-- LEAD: Next row value
SELECT 
    order_date,
    total,
    LEAD(total) OVER (ORDER BY order_date) AS next_total
FROM orders;
```

#### 4. Aggregate Window Functions

```sql
-- Running total
SELECT 
    order_date,
    total,
    SUM(total) OVER (ORDER BY order_date) AS running_total
FROM orders;

-- Average in partition
SELECT 
    username,
    order_date,
    total,
    AVG(total) OVER (PARTITION BY username) AS avg_user_order
FROM orders;

-- First and last values
SELECT 
    order_date,
    total,
    FIRST_VALUE(total) OVER (ORDER BY order_date) AS first_order,
    LAST_VALUE(total) OVER (ORDER BY order_date) AS last_order
FROM orders;
```

### Window Frame

```sql
-- ROWS BETWEEN: Physical rows
SELECT 
    order_date,
    total,
    SUM(total) OVER (
        ORDER BY order_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS three_day_total
FROM orders;

-- RANGE BETWEEN: Logical range
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

## CTEs (Common Table Expressions)

### CTE là gì?

**Định nghĩa:**
- CTE là temporary named result set
- Tồn tại trong scope của single statement
- Improve readability
- Có thể recursive

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
-- Hierarchical data: Employee-Manager
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: Top-level managers
    SELECT 
        id,
        name,
        manager_id,
        0 AS level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: Subordinates
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

### CTE vs Subquery

```sql
-- Subquery (nested, harder to read)
SELECT u.username
FROM users u
WHERE u.id IN (
    SELECT user_id FROM orders 
    WHERE total > (
        SELECT AVG(total) FROM orders
    )
);

-- CTE (clearer, more readable)
WITH avg_order AS (
    SELECT AVG(total) AS avg_total FROM orders
),
high_value_orders AS (
    SELECT user_id FROM orders
    WHERE total > (SELECT avg_total FROM avg_order)
)
SELECT u.username
FROM users u
WHERE u.id IN (SELECT user_id FROM high_value_orders);
```

---

## Stored Procedures

### Stored Procedure là gì?

**Định nghĩa:**
- Precompiled SQL code stored in database
- Can accept parameters
- Can return results
- Improve performance và security

### Basic Stored Procedure

```sql
-- PostgreSQL
CREATE OR REPLACE FUNCTION get_user_orders(p_user_id INT)
RETURNS TABLE (
    order_id INT,
    order_date DATE,
    total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.order_date, o.total
    FROM orders o
    WHERE o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Call procedure
SELECT * FROM get_user_orders(1);
```

### Stored Procedure với Parameters

```sql
-- MySQL
DELIMITER //
CREATE PROCEDURE get_user_orders(
    IN p_user_id INT,
    IN p_min_total DECIMAL(10, 2)
)
BEGIN
    SELECT 
        o.id,
        o.order_date,
        o.total
    FROM orders o
    WHERE o.user_id = p_user_id
      AND o.total >= p_min_total
    ORDER BY o.order_date DESC;
END //
DELIMITER ;

-- Call procedure
CALL get_user_orders(1, 100.00);
```

### Stored Procedure với Transactions

```sql
-- PostgreSQL: Money transfer
CREATE OR REPLACE FUNCTION transfer_money(
    p_from_account INT,
    p_to_account INT,
    p_amount DECIMAL(10, 2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_from_balance DECIMAL(10, 2);
BEGIN
    -- Check balance
    SELECT balance INTO v_from_balance
    FROM accounts
    WHERE id = p_from_account;
    
    IF v_from_balance < p_amount THEN
        RETURN FALSE;  -- Insufficient funds
    END IF;
    
    -- Transfer
    BEGIN
        UPDATE accounts SET balance = balance - p_amount WHERE id = p_from_account;
        UPDATE accounts SET balance = balance + p_amount WHERE id = p_to_account;
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
-- PostgreSQL: Validate before insert
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
    record_id INT,
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

### MySQL Triggers

```sql
-- MySQL: Before insert
DELIMITER //
CREATE TRIGGER validate_email_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.email NOT LIKE '%@%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END //
DELIMITER ;
```

---

## Views và Materialized Views

### Views

**Định nghĩa:**
- Virtual table based on query
- No data stored, computed on access
- Simplify complex queries
- Security (hide columns)

```sql
-- Simple view
CREATE VIEW active_user_orders AS
SELECT 
    u.username,
    o.id AS order_id,
    o.order_date,
    o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active';

-- Use view
SELECT * FROM active_user_orders WHERE total > 1000;
```

### Updatable Views

```sql
-- View that can be updated
CREATE VIEW user_emails AS
SELECT id, username, email
FROM users
WHERE status = 'active';

-- Update through view
UPDATE user_emails SET email = 'new@example.com' WHERE id = 1;
```

### Materialized Views

**Định nghĩa:**
- View với data stored physically
- Faster queries (precomputed)
- Need refresh
- Trade-off: Storage vs Performance

```sql
-- PostgreSQL: Materialized view
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    SUM(total) AS total_sales,
    COUNT(*) AS order_count
FROM orders
GROUP BY DATE_TRUNC('month', order_date);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW monthly_sales;

-- Query materialized view
SELECT * FROM monthly_sales;
```

---

## Advanced JOINs

### Self JOIN

```sql
-- Employee-Manager relationship
SELECT 
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

### Cross JOIN (Cartesian Product)

```sql
-- All combinations
SELECT 
    u.username,
    p.product_name
FROM users u
CROSS JOIN products p;
-- Returns: users × products rows
```

### Natural JOIN

```sql
-- Join on columns with same name
SELECT *
FROM users
NATURAL JOIN orders;
-- Automatically joins on common column names
```

### Lateral JOIN (PostgreSQL)

```sql
-- Reference previous tables in FROM clause
SELECT 
    u.username,
    recent_orders.order_id,
    recent_orders.total
FROM users u
CROSS JOIN LATERAL (
    SELECT id AS order_id, total
    FROM orders
    WHERE user_id = u.id
    ORDER BY order_date DESC
    LIMIT 3
) recent_orders;
```

---

## Recursive Queries

### Recursive CTE

```sql
-- Hierarchical categories
WITH RECURSIVE category_tree AS (
    -- Base case: Root categories
    SELECT 
        id,
        name,
        parent_id,
        0 AS level,
        CAST(name AS VARCHAR(1000)) AS path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: Subcategories
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1,
        CAST(ct.path || ' > ' || c.name AS VARCHAR(1000))
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;
```

### Fibonacci Sequence

```sql
-- PostgreSQL: Generate Fibonacci
WITH RECURSIVE fibonacci(n, fib_n, next_fib_n) AS (
    -- Base case
    SELECT 1, 0::BIGINT, 1::BIGINT
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        n + 1,
        next_fib_n,
        fib_n + next_fib_n
    FROM fibonacci
    WHERE n < 10
)
SELECT n, fib_n AS fibonacci_number
FROM fibonacci;
```

---

## Câu hỏi thường gặp

### Q1: Window Functions vs GROUP BY?

**GROUP BY:**
- Groups rows, returns one row per group
- Reduces number of rows
- Use for aggregations

**Window Functions:**
- Keeps all rows, adds calculated column
- Returns same number of rows
- Use for rankings, running totals

**Ví dụ:**
```sql
-- GROUP BY: One row per category
SELECT category_id, AVG(price) 
FROM products 
GROUP BY category_id;

-- Window Function: All rows with average
SELECT 
    product_name,
    category_id,
    price,
    AVG(price) OVER (PARTITION BY category_id) AS avg_category_price
FROM products;
```

### Q2: RANK() vs DENSE_RANK() vs ROW_NUMBER()?

**ROW_NUMBER():**
- Sequential numbers: 1, 2, 3, 4
- No ties

**RANK():**
- Ranking with gaps: 1, 2, 2, 4
- Ties get same rank, next rank skipped

**DENSE_RANK():**
- Ranking without gaps: 1, 2, 2, 3
- Ties get same rank, no gaps

### Q3: CTE vs Subquery?

**CTE:**
- More readable
- Can be referenced multiple times
- Can be recursive
- Better for complex queries

**Subquery:**
- Inline, less readable
- Can't be recursive
- Good for simple cases

### Q4: View vs Materialized View?

**View:**
- Virtual, computed on access
- Always up-to-date
- Slower for complex queries

**Materialized View:**
- Physical storage
- Faster queries
- Need refresh
- May have stale data

### Q5: Stored Procedure vs Function?

**Stored Procedure:**
- Can modify data
- Can return multiple result sets
- Called with CALL

**Function:**
- Should not modify data (usually)
- Returns single value or table
- Used in SELECT

### Q6: Trigger best practices?

1. **Keep triggers simple**: Don't put complex logic
2. **Avoid recursive triggers**: Can cause infinite loops
3. **Document triggers**: Document what they do
4. **Test thoroughly**: Triggers affect all operations
5. **Consider performance**: Triggers execute on every operation

---

## Best Practices

1. **Use Window Functions**: For rankings, running totals
2. **Use CTEs**: Improve readability
3. **Use Views**: Simplify complex queries
4. **Use Materialized Views**: For expensive aggregations
5. **Use Stored Procedures**: For complex business logic
6. **Use Triggers Sparingly**: Can be hard to debug
7. **Document Everything**: Complex SQL needs documentation

---

## Bài tập thực hành

### Bài 1: Window Functions

```sql
-- Yêu cầu:
-- 1. Rank products by price within each category
-- 2. Calculate running total of sales
-- 3. Find previous and next order dates
-- 4. Calculate moving average
```

### Bài 2: Recursive CTE

```sql
-- Yêu cầu:
-- 1. Build category hierarchy tree
-- 2. Find all ancestors of a category
-- 3. Find all descendants of a category
-- 4. Calculate depth of each category
```

### Bài 3: Stored Procedures

```sql
-- Yêu cầu:
-- 1. Create procedure to transfer money between accounts
-- 2. Create procedure to calculate user statistics
-- 3. Create procedure with error handling
-- 4. Test procedures with various inputs
```

---

## Tổng kết

- **Window Functions**: Calculations across rows (ROW_NUMBER, RANK, LAG, LEAD)
- **CTEs**: Named temporary result sets, can be recursive
- **Stored Procedures**: Precompiled SQL code with parameters
- **Triggers**: Automatic code execution on events
- **Views**: Virtual tables, Materialized Views store data
- **Advanced JOINs**: Self JOIN, CROSS JOIN, LATERAL JOIN
- **Recursive Queries**: Hierarchical data, tree structures
