# SQL Basics - Câu hỏi phỏng vấn

## Mục lục
1. [SELECT Statement](#select-statement)
2. [INSERT Statement](#insert-statement)
3. [UPDATE Statement](#update-statement)
4. [DELETE Statement](#delete-statement)
5. [WHERE Clause](#where-clause)
6. [ORDER BY](#order-by)
7. [GROUP BY và Aggregate Functions](#group-by-và-aggregate-functions)
8. [JOINs](#joins)
9. [Subqueries](#subqueries)
10. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SELECT Statement

### Basic SELECT

**Cú pháp:**
```sql
SELECT column1, column2, ...
FROM table_name;
```

**Ví dụ:**
```sql
-- Select all columns
SELECT * FROM users;

-- Select specific columns
SELECT id, username, email FROM users;

-- Select with alias
SELECT 
    id AS user_id,
    username AS name,
    email
FROM users;
```

### SELECT DISTINCT

```sql
-- Remove duplicates
SELECT DISTINCT country FROM users;

-- Multiple columns
SELECT DISTINCT country, city FROM users;
```

### SELECT với Expressions

```sql
-- Calculations
SELECT 
    product_name,
    price,
    quantity,
    price * quantity AS total
FROM order_items;

-- String functions
SELECT 
    CONCAT(first_name, ' ', last_name) AS full_name
FROM users;

-- Date functions
SELECT 
    username,
    YEAR(created_at) AS year_joined
FROM users;
```

### LIMIT và OFFSET

```sql
-- Limit results
SELECT * FROM users LIMIT 10;

-- Pagination
SELECT * FROM users 
LIMIT 10 OFFSET 20;  -- Skip 20, get next 10

-- MySQL syntax
SELECT * FROM users LIMIT 20, 10;  -- Same as above
```

---

## INSERT Statement

### Basic INSERT

**Cú pháp:**
```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

**Ví dụ:**
```sql
-- Single row
INSERT INTO users (username, email, age)
VALUES ('john_doe', 'john@example.com', 25);

-- Multiple rows
INSERT INTO users (username, email, age)
VALUES 
    ('john_doe', 'john@example.com', 25),
    ('jane_smith', 'jane@example.com', 30),
    ('bob_wilson', 'bob@example.com', 28);

-- Insert with default values
INSERT INTO users (username, email)
VALUES ('john_doe', 'john@example.com');
-- age sẽ dùng DEFAULT value nếu có
```

### INSERT SELECT

```sql
-- Insert from another table
INSERT INTO users_backup (username, email)
SELECT username, email
FROM users
WHERE created_at < '2020-01-01';
```

### INSERT với ON DUPLICATE KEY UPDATE

```sql
-- MySQL: Update if exists, insert if not
INSERT INTO users (id, username, email)
VALUES (1, 'john_doe', 'john@example.com')
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email);

-- PostgreSQL: INSERT ... ON CONFLICT
INSERT INTO users (id, username, email)
VALUES (1, 'john_doe', 'john@example.com')
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username,
    email = EXCLUDED.email;
```

---

## UPDATE Statement

### Basic UPDATE

**Cú pháp:**
```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

**Ví dụ:**
```sql
-- Update single row
UPDATE users
SET email = 'newemail@example.com'
WHERE id = 1;

-- Update multiple columns
UPDATE users
SET 
    email = 'newemail@example.com',
    age = 26,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Update multiple rows
UPDATE users
SET status = 'inactive'
WHERE last_login < '2023-01-01';

-- Update with calculation
UPDATE products
SET price = price * 1.1  -- Increase price by 10%
WHERE category_id = 5;
```

### UPDATE với JOIN

```sql
-- MySQL
UPDATE orders o
JOIN users u ON o.user_id = u.id
SET o.status = 'cancelled'
WHERE u.status = 'inactive';

-- PostgreSQL
UPDATE orders
SET status = 'cancelled'
FROM users
WHERE orders.user_id = users.id
AND users.status = 'inactive';
```

### UPDATE với Subquery

```sql
UPDATE products
SET price = (
    SELECT AVG(price) 
    FROM products 
    WHERE category_id = products.category_id
)
WHERE category_id = 5;
```

**⚠️ Lưu ý:** Luôn dùng WHERE clause, nếu không sẽ update tất cả rows!

---

## DELETE Statement

### Basic DELETE

**Cú pháp:**
```sql
DELETE FROM table_name
WHERE condition;
```

**Ví dụ:**
```sql
-- Delete specific row
DELETE FROM users WHERE id = 1;

-- Delete multiple rows
DELETE FROM users WHERE status = 'inactive';

-- Delete with condition
DELETE FROM orders 
WHERE created_at < '2020-01-01'
AND status = 'cancelled';
```

### DELETE với JOIN

```sql
-- MySQL
DELETE o FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.status = 'inactive';

-- PostgreSQL
DELETE FROM orders
USING users
WHERE orders.user_id = users.id
AND users.status = 'inactive';
```

### TRUNCATE vs DELETE

| Feature | DELETE | TRUNCATE |
|---------|--------|----------|
| **Speed** | Slower | Faster |
| **WHERE** | Có thể dùng | Không thể dùng |
| **Rollback** | Có thể rollback | Không thể rollback (thường) |
| **Auto-increment** | Không reset | Reset counter |
| **Triggers** | Fires triggers | Không fire triggers |

```sql
-- DELETE: Xóa từng row, có thể rollback
DELETE FROM users WHERE status = 'inactive';

-- TRUNCATE: Xóa tất cả, nhanh hơn, reset auto-increment
TRUNCATE TABLE users;
```

**⚠️ Lưu ý:** Luôn dùng WHERE clause với DELETE, nếu không sẽ xóa tất cả rows!

---

## WHERE Clause

### Basic WHERE

```sql
SELECT * FROM users
WHERE age > 18;

SELECT * FROM products
WHERE price BETWEEN 10 AND 100;

SELECT * FROM users
WHERE country IN ('USA', 'Canada', 'Mexico');
```

### Comparison Operators

```sql
-- Equal
WHERE age = 25

-- Not equal
WHERE age != 25
WHERE age <> 25

-- Greater than / Less than
WHERE age > 18
WHERE age < 65
WHERE age >= 18
WHERE age <= 65

-- BETWEEN
WHERE age BETWEEN 18 AND 65

-- IN
WHERE country IN ('USA', 'Canada')

-- NOT IN
WHERE country NOT IN ('USA', 'Canada')

-- LIKE (pattern matching)
WHERE username LIKE 'john%'      -- Starts with 'john'
WHERE username LIKE '%doe'        -- Ends with 'doe'
WHERE username LIKE '%john%'     -- Contains 'john'
WHERE username LIKE 'j_n'        -- 'j' + any char + 'n'

-- IS NULL / IS NOT NULL
WHERE email IS NULL
WHERE email IS NOT NULL
```

### Logical Operators

```sql
-- AND
WHERE age > 18 AND status = 'active'

-- OR
WHERE country = 'USA' OR country = 'Canada'

-- NOT
WHERE NOT age < 18

-- Combined
WHERE (age > 18 AND status = 'active') 
   OR (age > 65 AND status = 'senior')
```

---

## ORDER BY

### Basic ORDER BY

```sql
-- Ascending (default)
SELECT * FROM users ORDER BY username;

-- Descending
SELECT * FROM users ORDER BY created_at DESC;

-- Multiple columns
SELECT * FROM users 
ORDER BY country ASC, age DESC;

-- With expressions
SELECT * FROM products
ORDER BY price * quantity DESC;
```

### ORDER BY với LIMIT

```sql
-- Top 10
SELECT * FROM products
ORDER BY price DESC
LIMIT 10;

-- Top N per group (advanced)
SELECT * FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as rn
    FROM products
) ranked
WHERE rn <= 5;
```

---

## GROUP BY và Aggregate Functions

### Aggregate Functions

```sql
-- COUNT
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT country) FROM users;

-- SUM
SELECT SUM(price) FROM order_items;

-- AVG
SELECT AVG(age) FROM users;

-- MIN / MAX
SELECT MIN(price), MAX(price) FROM products;

-- GROUP_CONCAT (MySQL) / STRING_AGG (PostgreSQL)
SELECT country, GROUP_CONCAT(username) 
FROM users 
GROUP BY country;
```

### GROUP BY

```sql
-- Basic GROUP BY
SELECT country, COUNT(*) as user_count
FROM users
GROUP BY country;

-- Multiple columns
SELECT country, city, COUNT(*) as user_count
FROM users
GROUP BY country, city;

-- With aggregate functions
SELECT 
    category_id,
    COUNT(*) as product_count,
    AVG(price) as avg_price,
    MAX(price) as max_price,
    MIN(price) as min_price
FROM products
GROUP BY category_id;
```

### HAVING Clause

```sql
-- HAVING filters groups (WHERE filters rows)
SELECT country, COUNT(*) as user_count
FROM users
GROUP BY country
HAVING COUNT(*) > 100;

-- Compare with WHERE
SELECT country, COUNT(*) as user_count
FROM users
WHERE age > 18              -- Filter rows before grouping
GROUP BY country
HAVING COUNT(*) > 100;       -- Filter groups after grouping
```

### WHERE vs HAVING

| Feature | WHERE | HAVING |
|---------|-------|--------|
| **Applied to** | Rows | Groups |
| **Used with** | SELECT, UPDATE, DELETE | SELECT with GROUP BY |
| **Aggregate functions** | Không thể dùng | Có thể dùng |
| **Execution order** | Before GROUP BY | After GROUP BY |

---

## JOINs

### INNER JOIN

```sql
-- Returns only matching rows
SELECT u.username, o.order_id, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Equivalent syntax
SELECT u.username, o.order_id, o.total
FROM users u, orders o
WHERE u.id = o.user_id;
```

### LEFT JOIN (LEFT OUTER JOIN)

```sql
-- Returns all rows from left table + matching from right
SELECT u.username, o.order_id, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Users without orders will have NULL for order columns
```

### RIGHT JOIN (RIGHT OUTER JOIN)

```sql
-- Returns all rows from right table + matching from left
SELECT u.username, o.order_id, o.total
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
-- Orders without users will have NULL for user columns
```

### FULL OUTER JOIN

```sql
-- Returns all rows from both tables
SELECT u.username, o.order_id, o.total
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;
-- Available in PostgreSQL, not in MySQL
```

### Multiple JOINs

```sql
SELECT 
    u.username,
    o.order_id,
    p.product_name,
    oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;
```

### Self JOIN

```sql
-- Join table with itself
SELECT 
    e1.name AS employee,
    e2.name AS manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;
```

---

## Subqueries

### Scalar Subquery

```sql
-- Returns single value
SELECT 
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
FROM users;

-- In WHERE clause
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

### Subquery với IN

```sql
-- Returns multiple values
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders 
    WHERE total > 1000
);
```

### Subquery với EXISTS

```sql
-- More efficient than IN for large datasets
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id AND o.total > 1000
);
```

### Correlated Subquery

```sql
-- Subquery references outer query
SELECT 
    p1.product_name,
    p1.price
FROM products p1
WHERE p1.price > (
    SELECT AVG(p2.price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);
```

### Subquery trong FROM

```sql
-- Derived table
SELECT 
    category_id,
    AVG(avg_price) as overall_avg
FROM (
    SELECT 
        category_id,
        AVG(price) as avg_price
    FROM products
    GROUP BY category_id
) category_avg
GROUP BY category_id;
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa WHERE và HAVING?

**WHERE:**
- Filters rows **before** grouping
- Không thể dùng aggregate functions
- Dùng với SELECT, UPDATE, DELETE

**HAVING:**
- Filters groups **after** grouping
- Có thể dùng aggregate functions
- Chỉ dùng với SELECT và GROUP BY

**Ví dụ:**
```sql
-- WHERE: Filter rows
SELECT country, COUNT(*) 
FROM users 
WHERE age > 18           -- Filter rows first
GROUP BY country;

-- HAVING: Filter groups
SELECT country, COUNT(*) 
FROM users 
GROUP BY country
HAVING COUNT(*) > 100;   -- Filter groups after
```

### Q2: INNER JOIN vs LEFT JOIN?

**INNER JOIN:**
- Chỉ trả về rows có match ở cả hai tables
- Loại bỏ rows không có match

**LEFT JOIN:**
- Trả về tất cả rows từ left table
- Rows không có match sẽ có NULL cho right table columns

**Ví dụ:**
```sql
-- INNER JOIN: Chỉ users có orders
SELECT u.username, o.order_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN: Tất cả users, kể cả không có orders
SELECT u.username, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

### Q3: DELETE vs TRUNCATE?

| Feature | DELETE | TRUNCATE |
|---------|--------|----------|
| **Speed** | Slower | Faster |
| **WHERE** | Có thể dùng | Không thể dùng |
| **Rollback** | Có thể | Không thể (thường) |
| **Auto-increment** | Không reset | Reset |
| **Triggers** | Fires | Không fire |

### Q4: Subquery vs JOIN?

**Subquery:**
- Dễ đọc cho simple cases
- Có thể chậm hơn với large datasets
- Tốt cho correlated queries

**JOIN:**
- Thường nhanh hơn
- Tốt cho complex relationships
- Có thể return nhiều columns từ joined table

**Ví dụ:**
```sql
-- Subquery
SELECT username
FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- JOIN (thường nhanh hơn)
SELECT DISTINCT u.username
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total > 1000;
```

### Q5: COUNT(*) vs COUNT(column)?

**COUNT(*):**
- Đếm tất cả rows, kể cả NULL
- Nhanh hơn

**COUNT(column):**
- Đếm non-NULL values trong column
- Chậm hơn một chút

**Ví dụ:**
```sql
-- COUNT(*): Đếm tất cả rows
SELECT COUNT(*) FROM users;  -- 100 rows

-- COUNT(column): Đếm non-NULL values
SELECT COUNT(email) FROM users;  -- 95 (5 NULL emails)
```

### Q6: LIKE với Wildcards?

```sql
-- %: Zero or more characters
WHERE username LIKE 'john%'    -- Starts with 'john'
WHERE username LIKE '%doe'      -- Ends with 'doe'
WHERE username LIKE '%john%'   -- Contains 'john'

-- _: Single character
WHERE username LIKE 'j_n'      -- 'j' + any char + 'n'
WHERE username LIKE 'j__n'     -- 'j' + 2 chars + 'n'

-- Escape special characters
WHERE description LIKE '50\% off'  -- Literal %
```

---

## Best Practices

1. **Always use WHERE**: Tránh update/delete tất cả rows
2. **Use JOINs**: Thường nhanh hơn subqueries
3. **Index columns**: Index columns trong WHERE và JOIN
4. **Limit results**: Dùng LIMIT cho large datasets
5. **Use EXISTS**: Thay vì IN cho large subqueries
6. **Avoid SELECT ***: Chỉ select columns cần thiết
7. **Use transactions**: Cho multiple related operations

---

## Bài tập thực hành

### Bài 1: Basic Queries

```sql
-- Yêu cầu:
-- 1. Select all users from 'USA'
-- 2. Count users per country
-- 3. Find top 10 most expensive products
-- 4. Calculate total sales per month
```

### Bài 2: JOINs

```sql
-- Yêu cầu:
-- 1. List all users with their order counts
-- 2. Find products never ordered
-- 3. List orders with user and product details
-- 4. Find users who ordered in last 30 days
```

### Bài 3: Aggregations

```sql
-- Yêu cầu:
-- 1. Average order value per user
-- 2. Total revenue per category
-- 3. Top 5 customers by total spent
-- 4. Products with sales above average
```

---

## Tổng kết

- **SELECT**: Retrieve data từ tables
- **INSERT**: Add new rows
- **UPDATE**: Modify existing rows
- **DELETE**: Remove rows
- **WHERE**: Filter rows
- **GROUP BY**: Group rows và aggregate
- **HAVING**: Filter groups
- **JOINs**: Combine data từ multiple tables
- **Subqueries**: Nested queries
