# Relational Database Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [RDBMS là gì?](#rdbms-là-gì)
2. [Tables, Rows, Columns](#tables-rows-columns)
3. [Primary Keys](#primary-keys)
4. [Foreign Keys](#foreign-keys)
5. [Constraints](#constraints)
6. [Normalization cơ bản](#normalization-cơ-bản)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## RDBMS là gì?

### RDBMS (Relational Database Management System)

**Định nghĩa:**
- RDBMS là hệ thống quản lý cơ sở dữ liệu quan hệ
- Dữ liệu được lưu trữ dưới dạng **tables** (bảng)
- Tables có **relationships** (quan hệ) với nhau thông qua keys
- Tuân theo mô hình dữ liệu quan hệ của E.F. Codd

### Đặc điểm chính

1. **Tables (Bảng)**: Dữ liệu được tổ chức thành các bảng
2. **Rows (Hàng)**: Mỗi hàng đại diện cho một record
3. **Columns (Cột)**: Mỗi cột đại diện cho một attribute
4. **Relationships**: Tables liên kết với nhau qua keys
5. **ACID Properties**: Đảm bảo tính nhất quán dữ liệu

### Ví dụ RDBMS

- **PostgreSQL**: Open-source, powerful
- **MySQL**: Phổ biến nhất, open-source
- **Oracle Database**: Enterprise-grade
- **SQL Server**: Microsoft
- **SQLite**: Lightweight, embedded

### So sánh với NoSQL

| Feature | RDBMS | NoSQL |
|---------|-------|-------|
| **Data Model** | Tables với fixed schema | Flexible schema |
| **ACID** | Full ACID support | Eventual consistency |
| **Scalability** | Vertical scaling | Horizontal scaling |
| **Query Language** | SQL | Varies (NoSQL query) |
| **Use Case** | Structured data, transactions | Unstructured data, big data |

---

## Tables, Rows, Columns

### Table (Bảng)

**Định nghĩa:**
- Table là collection của rows và columns
- Mỗi table có tên duy nhất trong database
- Table định nghĩa structure của dữ liệu

**Ví dụ:**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Row (Hàng/Record)

**Định nghĩa:**
- Row là một record trong table
- Mỗi row chứa data cho tất cả columns
- Rows được xác định bởi Primary Key

**Ví dụ:**

```sql
INSERT INTO users (id, username, email) 
VALUES (1, 'john_doe', 'john@example.com');
```

### Column (Cột/Field)

**Định nghĩa:**
- Column là một attribute trong table
- Mỗi column có data type
- Column có thể có constraints (NOT NULL, UNIQUE, etc.)

**Ví dụ:**

```sql
-- Column với các constraints
username VARCHAR(50) NOT NULL UNIQUE
age INT CHECK (age >= 0 AND age <= 150)
email VARCHAR(100) UNIQUE
```

### Data Types

**Common Data Types:**

```sql
-- Numeric
INT, BIGINT, SMALLINT
DECIMAL(10, 2), NUMERIC(10, 2)
FLOAT, DOUBLE

-- String
VARCHAR(255)      -- Variable length
CHAR(10)          -- Fixed length
TEXT              -- Large text

-- Date/Time
DATE              -- YYYY-MM-DD
TIME              -- HH:MM:SS
TIMESTAMP         -- YYYY-MM-DD HH:MM:SS
DATETIME          -- MySQL specific

-- Boolean
BOOLEAN           -- TRUE/FALSE
TINYINT(1)        -- MySQL boolean

-- Binary
BLOB              -- Binary Large Object
BYTEA             -- PostgreSQL binary
```

---

## Primary Keys

### Primary Key (Khóa chính)

**Định nghĩa:**
- Primary Key là column(s) xác định duy nhất mỗi row
- Mỗi table chỉ có một Primary Key
- Primary Key không thể NULL
- Primary Key tự động tạo UNIQUE constraint

### Đặc điểm

1. **Unique**: Mỗi giá trị phải unique
2. **NOT NULL**: Không thể NULL
3. **Immutable**: Không nên thay đổi giá trị
4. **Indexed**: Tự động tạo index

### Ví dụ

```sql
-- Single column Primary Key
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
);

-- Composite Primary Key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- Auto-increment Primary Key
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    username VARCHAR(50)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- PostgreSQL
    username VARCHAR(50)
);
```

### Primary Key vs Unique Key

| Feature | Primary Key | Unique Key |
|---------|-------------|------------|
| **NULL** | Không cho phép | Cho phép một NULL |
| **Count** | Một per table | Nhiều per table |
| **Index** | Tự động clustered | Non-clustered |
| **Purpose** | Identify row | Ensure uniqueness |

---

## Foreign Keys

### Foreign Key (Khóa ngoại)

**Định nghĩa:**
- Foreign Key là column(s) tham chiếu đến Primary Key của table khác
- Tạo relationship giữa tables
- Đảm bảo **Referential Integrity**

### Đặc điểm

1. **References**: Tham chiếu đến Primary Key hoặc Unique Key
2. **Referential Integrity**: Đảm bảo data consistency
3. **Cascade Actions**: ON DELETE, ON UPDATE

### Ví dụ

```sql
-- Parent table
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50)
);

-- Child table với Foreign Key
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Foreign Key với Cascade
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE      -- Xóa orders khi user bị xóa
        ON UPDATE CASCADE      -- Update orders khi user.id thay đổi
);
```

### Cascade Actions

```sql
-- ON DELETE CASCADE: Xóa child records khi parent bị xóa
ON DELETE CASCADE

-- ON DELETE SET NULL: Set foreign key = NULL khi parent bị xóa
ON DELETE SET NULL

-- ON DELETE RESTRICT: Không cho phép xóa parent nếu có child
ON DELETE RESTRICT

-- ON DELETE NO ACTION: Tương tự RESTRICT
ON DELETE NO ACTION

-- ON UPDATE: Tương tự ON DELETE
ON UPDATE CASCADE
ON UPDATE SET NULL
ON UPDATE RESTRICT
```

### Foreign Key Benefits

1. **Data Integrity**: Đảm bảo data consistency
2. **Relationships**: Tạo relationships rõ ràng
3. **Cascade Operations**: Tự động xử lý related data
4. **Documentation**: Self-documenting schema

---

## Constraints

### Constraints (Ràng buộc)

**Định nghĩa:**
- Constraints là rules áp dụng cho columns
- Đảm bảo data integrity
- Enforced bởi database engine

### Types of Constraints

#### 1. NOT NULL

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,  -- Bắt buộc phải có giá trị
    email VARCHAR(100)
);
```

#### 2. UNIQUE

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,  -- Giá trị phải unique
    email VARCHAR(100) UNIQUE
);

-- Composite UNIQUE
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    UNIQUE (user_id, role_id)  -- Combination phải unique
);
```

#### 3. CHECK

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    age INT CHECK (age >= 0 AND age <= 150),  -- Age phải trong range
    email VARCHAR(100) CHECK (email LIKE '%@%')  -- Email phải có @
);

-- Named CHECK constraint
CREATE TABLE products (
    id INT PRIMARY KEY,
    price DECIMAL(10, 2),
    CONSTRAINT positive_price CHECK (price > 0)
);
```

#### 4. DEFAULT

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Default value
    status VARCHAR(20) DEFAULT 'active'
);
```

#### 5. PRIMARY KEY

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,  -- Single column
    username VARCHAR(50)
);

-- Composite Primary Key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    PRIMARY KEY (order_id, product_id)
);
```

#### 6. FOREIGN KEY

```sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Adding Constraints

```sql
-- Add constraint to existing table
ALTER TABLE users 
ADD CONSTRAINT unique_email UNIQUE (email);

ALTER TABLE users 
ADD CONSTRAINT check_age CHECK (age >= 0);

-- Remove constraint
ALTER TABLE users 
DROP CONSTRAINT unique_email;
```

---

## Normalization cơ bản

### Normalization (Chuẩn hóa)

**Định nghĩa:**
- Normalization là quá trình tổ chức data trong database
- Mục đích: Giảm redundancy, tăng data integrity
- Các dạng chuẩn: 1NF, 2NF, 3NF, BCNF, 4NF, 5NF

### 1NF (First Normal Form)

**Quy tắc:**
- Mỗi column chỉ chứa atomic values (không có arrays, lists)
- Không có duplicate rows
- Mỗi row phải unique

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
- Phải ở 1NF
- Tất cả non-key columns phải phụ thuộc hoàn toàn vào Primary Key
- Không có partial dependencies

**Ví dụ:**

```sql
-- ❌ Violates 2NF (partial dependency)
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- Depends only on product_id
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
- Phải ở 2NF
- Không có transitive dependencies
- Non-key columns không phụ thuộc vào non-key columns khác

**Ví dụ:**

```sql
-- ❌ Violates 3NF (transitive dependency)
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    dept_name VARCHAR(100),  -- Depends on dept_id, not emp_id
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

### Benefits of Normalization

1. **Reduced Redundancy**: Giảm duplicate data
2. **Data Integrity**: Dễ maintain consistency
3. **Easier Updates**: Update một nơi, áp dụng everywhere
4. **Better Design**: Schema rõ ràng, dễ hiểu

### Trade-offs

1. **Performance**: Nhiều JOINs có thể chậm hơn
2. **Complexity**: Schema phức tạp hơn
3. **Denormalization**: Đôi khi cần denormalize cho performance

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa RDBMS và DBMS?

**DBMS (Database Management System):**
- General term cho bất kỳ hệ thống quản lý database nào
- Có thể là relational, hierarchical, network, object-oriented

**RDBMS (Relational Database Management System):**
- Subset của DBMS
- Tuân theo relational model
- Sử dụng SQL

### Q2: Primary Key vs Unique Key?

| Feature | Primary Key | Unique Key |
|---------|-------------|------------|
| **NULL** | Không cho phép | Cho phép một NULL |
| **Count** | Một per table | Nhiều per table |
| **Purpose** | Identify row | Ensure uniqueness |
| **Index** | Clustered | Non-clustered |

### Q3: Foreign Key có bắt buộc không?

**Không bắt buộc:**
- Foreign Key là optional constraint
- Có thể có relationships mà không có Foreign Key
- Nhưng nên dùng để đảm bảo referential integrity

**Ví dụ:**

```sql
-- Without Foreign Key (not recommended)
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT  -- No FK constraint
);

-- With Foreign Key (recommended)
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Q4: Khi nào nên denormalize?

**Nên denormalize khi:**
- Read performance quan trọng hơn write performance
- Cần giảm số lượng JOINs
- Data ít thay đổi (read-heavy)
- Có thể chấp nhận một chút redundancy

**Ví dụ:**

```sql
-- Denormalized for performance
CREATE TABLE order_summary (
    order_id INT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),  -- Denormalized from users table
    total DECIMAL(10, 2),
    order_date DATE
);
```

### Q5: Composite Primary Key vs Surrogate Key?

**Composite Primary Key:**
- Sử dụng nhiều columns làm Primary Key
- Phản ánh business logic
- Ví dụ: (order_id, product_id)

**Surrogate Key:**
- Artificial key (thường là auto-increment ID)
- Không có business meaning
- Dễ sử dụng, consistent

**Ví dụ:**

```sql
-- Composite Key
CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- Surrogate Key
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    UNIQUE (order_id, product_id)
);
```

### Q6: CHECK constraint vs Application-level validation?

**CHECK Constraint:**
- Enforced bởi database
- Đảm bảo data integrity ở database level
- Không thể bypass
- Performance tốt hơn

**Application-level:**
- Enforced bởi application code
- Dễ thay đổi
- Có thể bypass nếu có direct database access

**Best Practice:** Dùng cả hai - CHECK constraint cho critical rules, application validation cho UX.

---

## Best Practices

1. **Use Primary Keys**: Mọi table nên có Primary Key
2. **Use Foreign Keys**: Đảm bảo referential integrity
3. **Normalize**: Normalize đến 3NF trước, sau đó denormalize nếu cần
4. **Constraints**: Sử dụng constraints để đảm bảo data integrity
5. **Naming**: Consistent naming convention
6. **Indexes**: Index Primary Keys và Foreign Keys
7. **Data Types**: Chọn data types phù hợp

---

## Bài tập thực hành

### Bài 1: Tạo Schema

```sql
-- Yêu cầu: Tạo database schema cho e-commerce
-- Tables: users, products, categories, orders, order_items
-- Implement proper Primary Keys, Foreign Keys, và Constraints
```

### Bài 2: Normalization

```sql
-- Yêu cầu: 
-- 1. Tạo unnormalized table
-- 2. Normalize đến 3NF
-- 3. Giải thích từng bước normalization
```

### Bài 3: Constraints

```sql
-- Yêu cầu: Tạo table với tất cả types of constraints
-- - NOT NULL
-- - UNIQUE
-- - CHECK
-- - DEFAULT
-- - PRIMARY KEY
-- - FOREIGN KEY
```

---

## Tổng kết

- **RDBMS**: Relational Database Management System
- **Tables**: Collection of rows and columns
- **Primary Key**: Uniquely identifies each row
- **Foreign Key**: References Primary Key of another table
- **Constraints**: Rules to ensure data integrity
- **Normalization**: Process to organize data efficiently (1NF, 2NF, 3NF)
