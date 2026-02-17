# Database Design - Câu hỏi phỏng vấn

## Mục lục
1. [ER Diagrams](#er-diagrams)
2. [Normalization](#normalization)
3. [Denormalization](#denormalization)
4. [Database Schema Design](#database-schema-design)
5. [Best Practices](#best-practices)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## ER Diagrams

### ER Diagram (Entity-Relationship Diagram)

**Định nghĩa:**
- ER Diagram là visual representation của database schema
- Mô tả entities, attributes, và relationships
- Giúp design và communicate database structure

### Components

#### 1. Entity (Thực thể)

- **Entity**: Object hoặc concept trong database
- Đại diện bởi rectangle
- Ví dụ: User, Product, Order

```
┌─────────┐
│  User   │
└─────────┘
```

#### 2. Attribute (Thuộc tính)

- **Attribute**: Property của entity
- Đại diện bởi oval hoặc trong entity box
- Ví dụ: username, email, age

```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ username     │
│ email        │
│ created_at   │
└──────────────┘
```

#### 3. Relationship (Quan hệ)

- **Relationship**: Connection giữa entities
- Đại diện bởi diamond hoặc line
- Types: One-to-One, One-to-Many, Many-to-Many

```
┌─────────┐         ┌─────────┐
│  User   │────────│  Order  │
└─────────┘         └─────────┘
    │1                  │N
    │                   │
    └───────has─────────┘
```

### Relationship Types

#### One-to-One (1:1)

```sql
-- Example: User - UserProfile
┌─────────┐ 1     1 ┌──────────────┐
│  User   │────────│ UserProfile  │
└─────────┘         └──────────────┘

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE user_profiles (
    id INT PRIMARY KEY,
    user_id INT UNIQUE,  -- One-to-One
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### One-to-Many (1:N)

```sql
-- Example: User - Orders
┌─────────┐ 1     N ┌─────────┐
│  User   │────────│  Order  │
└─────────┘         └─────────┘

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,  -- Many-to-One
    total DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Many-to-Many (N:M)

```sql
-- Example: Students - Courses
┌──────────┐ N     M ┌─────────┐
│ Student  │────────│ Course  │
└──────────┘         └─────────┘

CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE courses (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

-- Junction table
CREATE TABLE student_courses (
    student_id INT,
    course_id INT,
    enrolled_at TIMESTAMP,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Cardinality Notations

**Crow's Foot Notation:**
```
One-to-One:    │───│
One-to-Many:   │───<│
Many-to-Many:  >│───<│
```

**Chen Notation:**
```
One-to-One:    1 ─── 1
One-to-Many:   1 ─── N
Many-to-Many:  N ─── M
```

---

## Normalization

### Normalization (Chuẩn hóa)

**Định nghĩa:**
- Process tổ chức data để giảm redundancy
- Tăng data integrity
- Các dạng chuẩn: 1NF, 2NF, 3NF, BCNF, 4NF, 5NF

### 1NF (First Normal Form)

**Quy tắc:**
1. Mỗi column chỉ chứa atomic values
2. Không có duplicate rows
3. Mỗi row phải unique

**Ví dụ:**

```sql
-- ❌ Violates 1NF
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    phones VARCHAR(200)  -- "123-456, 789-012" - multiple values
);

-- ✅ 1NF Compliant
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user_phones (
    id INT PRIMARY KEY,
    user_id INT,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2NF (Second Normal Form)

**Quy tắc:**
1. Phải ở 1NF
2. Tất cả non-key columns phụ thuộc hoàn toàn vào Primary Key
3. Không có partial dependencies

**Ví dụ:**

```sql
-- ❌ Violates 2NF
-- product_name phụ thuộc vào product_id, không phải (order_id, product_id)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- Partial dependency
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- ✅ 2NF Compliant
CREATE TABLE orders (
    order_id INT PRIMARY KEY
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### 3NF (Third Normal Form)

**Quy tắc:**
1. Phải ở 2NF
2. Không có transitive dependencies
3. Non-key columns không phụ thuộc vào non-key columns khác

**Ví dụ:**

```sql
-- ❌ Violates 3NF
-- dept_name phụ thuộc vào dept_id, không phải emp_id
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    dept_name VARCHAR(100),  -- Transitive dependency
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ✅ 3NF Compliant
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100)
);
```

### BCNF (Boyce-Codd Normal Form)

**Quy tắc:**
1. Phải ở 3NF
2. Mọi determinant phải là candidate key
3. Không có overlapping candidate keys

**Ví dụ:**

```sql
-- ❌ Violates BCNF
-- instructor determines course, nhưng instructor không phải key
CREATE TABLE course_enrollments (
    student_id INT,
    course_id INT,
    instructor VARCHAR(100),  -- Determines course
    PRIMARY KEY (student_id, course_id)
);

-- ✅ BCNF Compliant
CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    instructor VARCHAR(100)
);

CREATE TABLE course_enrollments (
    student_id INT,
    course_id INT,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

### Normalization Summary

| Normal Form | Rule | Example Issue |
|-------------|------|---------------|
| **1NF** | Atomic values | Multiple values in column |
| **2NF** | No partial dependencies | Non-key depends on part of key |
| **3NF** | No transitive dependencies | Non-key depends on non-key |
| **BCNF** | Every determinant is key | Non-key determines another column |

---

## Denormalization

### Denormalization (Phi chuẩn hóa)

**Định nghĩa:**
- Process thêm redundancy vào normalized database
- Trade-off: Redundancy vs Performance
- Dùng khi read performance quan trọng hơn write performance

### Khi nào nên Denormalize?

**Nên denormalize khi:**
1. **Read-heavy workloads**: Nhiều reads, ít writes
2. **Performance critical**: JOINs quá chậm
3. **Reporting**: Complex aggregations
4. **Data warehouse**: OLAP workloads

**Không nên denormalize khi:**
1. **Write-heavy**: Nhiều updates
2. **Data consistency critical**: Cần real-time consistency
3. **Storage limited**: Limited storage space

### Ví dụ Denormalization

```sql
-- Normalized (3NF)
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100)
);

-- Denormalized (for performance)
CREATE TABLE order_summary (
    order_id INT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),      -- Denormalized
    email VARCHAR(100),         -- Denormalized
    total DECIMAL(10, 2),
    order_date DATE
);
-- Benefit: No JOIN needed for order + user info
-- Trade-off: Need to update username/email in multiple places
```

### Denormalization Strategies

#### 1. Redundant Columns

```sql
-- Add frequently accessed columns
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- Denormalized
    price DECIMAL(10, 2),        -- Denormalized
    quantity INT
);
```

#### 2. Computed Columns

```sql
-- Store computed values
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    total DECIMAL(10, 2)  -- Computed: subtotal + tax
);
```

#### 3. Summary Tables

```sql
-- Pre-aggregated data
CREATE TABLE daily_sales (
    date DATE,
    total_revenue DECIMAL(10, 2),
    order_count INT,
    avg_order_value DECIMAL(10, 2)
);
```

---

## Database Schema Design

### Schema Design Process

#### 1. Requirements Analysis

- Identify entities và relationships
- Understand business rules
- Define data requirements

#### 2. Conceptual Design

- Create ER Diagram
- Identify entities, attributes, relationships
- Define cardinalities

#### 3. Logical Design

- Convert ER Diagram to tables
- Apply normalization
- Define keys và constraints

#### 4. Physical Design

- Choose data types
- Create indexes
- Optimize for performance

### Naming Conventions

```sql
-- Tables: Plural, lowercase, snake_case
CREATE TABLE users;
CREATE TABLE order_items;
CREATE TABLE product_categories;

-- Columns: Singular, lowercase, snake_case
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50),
    created_at TIMESTAMP
);

-- Primary Keys: table_name_id
user_id, order_id, product_id

-- Foreign Keys: referenced_table_id
user_id, category_id, order_id

-- Indexes: idx_table_column
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Data Types Selection

```sql
-- IDs: INT or BIGINT
user_id INT PRIMARY KEY

-- Strings: VARCHAR với appropriate length
username VARCHAR(50)      -- Short strings
description TEXT          -- Long strings
email VARCHAR(255)        -- Standard email length

-- Numbers: Choose appropriate precision
price DECIMAL(10, 2)      -- Money: 10 digits, 2 decimal
quantity INT              -- Whole numbers
rating DECIMAL(3, 2)      -- 0.00 to 5.00

-- Dates: Use appropriate type
created_at TIMESTAMP      -- With time
birth_date DATE           -- Date only
```

### Index Strategy

```sql
-- Primary Keys: Automatic index
CREATE TABLE users (
    id INT PRIMARY KEY  -- Auto-indexed
);

-- Foreign Keys: Should be indexed
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category_id ON products(category_id);

-- Composite indexes for multi-column queries
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
```

---

## Best Practices

### 1. Design Principles

- **Normalize first**: Normalize đến 3NF trước
- **Denormalize carefully**: Chỉ khi cần performance
- **Use appropriate data types**: Không dùng VARCHAR cho numbers
- **Consistent naming**: Follow naming conventions
- **Document schema**: Comment complex relationships

### 2. Keys và Constraints

- **Every table needs Primary Key**: Identify rows uniquely
- **Use Foreign Keys**: Ensure referential integrity
- **Add constraints**: NOT NULL, UNIQUE, CHECK
- **Use surrogate keys**: Auto-increment IDs cho simplicity

### 3. Performance

- **Index strategically**: Index foreign keys và frequently queried columns
- **Avoid over-indexing**: Too many indexes slow writes
- **Consider partitioning**: For very large tables
- **Monitor query performance**: Identify slow queries

### 4. Maintenance

- **Version control**: Track schema changes
- **Migration scripts**: Use migration tools
- **Backup strategy**: Regular backups
- **Documentation**: Keep schema documentation updated

---

## Câu hỏi thường gặp

### Q1: Khi nào nên normalize, khi nào nên denormalize?

**Normalize khi:**
- Write operations nhiều
- Data consistency quan trọng
- Storage không phải vấn đề
- Schema design phase

**Denormalize khi:**
- Read operations nhiều
- Performance critical
- JOINs quá chậm
- Reporting/analytics workloads

### Q2: 1NF, 2NF, 3NF khác nhau như thế nào?

**1NF:**
- Atomic values
- No duplicate rows
- Each row unique

**2NF:**
- 1NF + No partial dependencies
- All non-key columns depend on full primary key

**3NF:**
- 2NF + No transitive dependencies
- Non-key columns don't depend on other non-key columns

### Q3: Composite Key vs Surrogate Key?

**Composite Key:**
- Multiple columns làm primary key
- Reflects business logic
- Example: (order_id, product_id)

**Surrogate Key:**
- Artificial key (auto-increment ID)
- No business meaning
- Easier to use, consistent

**Ví dụ:**
```sql
-- Composite Key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    PRIMARY KEY (order_id, product_id)
);

-- Surrogate Key
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    UNIQUE (order_id, product_id)
);
```

### Q4: Làm sao design Many-to-Many relationship?

**Solution: Junction Table**

```sql
-- Entities
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE courses (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

-- Junction table
CREATE TABLE student_courses (
    student_id INT,
    course_id INT,
    enrolled_at TIMESTAMP,
    grade DECIMAL(3, 2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Q5: ER Diagram vs Physical Schema?

**ER Diagram:**
- Conceptual/logical design
- Shows entities, relationships
- Technology-independent
- Used for communication

**Physical Schema:**
- Actual database structure
- Tables, columns, data types
- Technology-specific
- Implementation of ER Diagram

---

## Bài tập thực hành

### Bài 1: ER Diagram

```
Yêu cầu: Vẽ ER Diagram cho e-commerce system
Entities: Users, Products, Categories, Orders, OrderItems
Relationships:
- User has many Orders
- Order has many OrderItems
- OrderItem belongs to Product
- Product belongs to Category
- Category can have subcategories
```

### Bài 2: Normalization

```sql
-- Yêu cầu:
-- 1. Tạo unnormalized table với violations
-- 2. Normalize đến 1NF
-- 3. Normalize đến 2NF
-- 4. Normalize đến 3NF
-- 5. Giải thích từng bước
```

### Bài 3: Schema Design

```sql
-- Yêu cầu: Design schema cho blog system
-- Requirements:
-- - Users can write posts
-- - Posts have categories and tags
-- - Users can comment on posts
-- - Posts can have multiple authors
-- - Need to track post views
```

---

## Tổng kết

- **ER Diagrams**: Visual representation của database structure
- **Normalization**: Process tổ chức data (1NF, 2NF, 3NF, BCNF)
- **Denormalization**: Trade-off redundancy vs performance
- **Schema Design**: Process từ requirements đến implementation
- **Best Practices**: Naming, data types, indexes, constraints
