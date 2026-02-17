# Data Types và Features - Câu hỏi phỏng vấn

## Mục lục
1. [Standard Data Types](#standard-data-types)
2. [Advanced Data Types](#advanced-data-types)
3. [JSON và JSONB](#json-và-jsonb)
4. [Arrays](#arrays)
5. [Custom Types](#custom-types)
6. [Extensions](#extensions)
7. [Sequences](#sequences)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Standard Data Types

### Numeric Types

```sql
-- Integer types
SMALLINT      -- 2 bytes, -32,768 to 32,767
INTEGER       -- 4 bytes, -2,147,483,648 to 2,147,483,647
BIGINT        -- 8 bytes, large range

-- Auto-increment
SERIAL        -- INTEGER with auto-increment
BIGSERIAL     -- BIGINT with auto-increment

-- Decimal types
DECIMAL(p, s) -- Exact numeric, p = precision, s = scale
NUMERIC(p, s) -- Same as DECIMAL
REAL          -- 4 bytes, approximate
DOUBLE PRECISION -- 8 bytes, approximate

-- Example
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price DECIMAL(10, 2),
    quantity INTEGER
);
```

### Character Types

```sql
-- Fixed length
CHAR(n)       -- Fixed length, n characters
CHARACTER(n)  -- Same as CHAR

-- Variable length
VARCHAR(n)    -- Variable length, max n characters
CHARACTER VARYING(n) -- Same as VARCHAR

-- Unlimited length
TEXT          -- Unlimited length

-- Example
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    bio TEXT
);
```

### Date/Time Types

```sql
-- Date and time
DATE          -- Date only (YYYY-MM-DD)
TIME          -- Time only (HH:MM:SS)
TIMESTAMP     -- Date and time (YYYY-MM-DD HH:MM:SS)
TIMESTAMPTZ   -- Timestamp with timezone

-- Intervals
INTERVAL      -- Time interval

-- Example
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_date DATE,
    start_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration INTERVAL
);
```

### Boolean Type

```sql
-- Boolean
BOOLEAN       -- TRUE, FALSE, or NULL

-- Example
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE
);
```

### Binary Types

```sql
-- Binary data
BYTEA         -- Variable-length binary string

-- Example
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    content BYTEA
);
```

---

## Advanced Data Types

### UUID

```sql
-- UUID (Universally Unique Identifier)
-- Requires uuid-ossp extension

-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table với UUID
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50),
    email VARCHAR(100)
);

-- Generate UUID
SELECT uuid_generate_v4();
```

### Network Address Types

```sql
-- IP addresses
INET          -- IPv4 or IPv6 address
CIDR          -- IPv4 or IPv6 network address
MACADDR       -- MAC address

-- Example
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(100),
    ip_address INET,
    network CIDR,
    mac_address MACADDR
);
```

### Geometric Types

```sql
-- Geometric types
POINT         -- (x, y)
LINE          -- Infinite line
LSEG          -- Line segment
BOX           -- Rectangular box
PATH          -- Open or closed path
POLYGON       -- Closed path
CIRCLE        -- Circle

-- Example
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    coordinates POINT
);
```

### Range Types

```sql
-- Range types
INT4RANGE     -- Range of INTEGER
INT8RANGE     -- Range of BIGINT
NUMRANGE      -- Range of NUMERIC
TSRANGE       -- Range of TIMESTAMP
TSTZRANGE     -- Range of TIMESTAMPTZ
DATERANGE     -- Range of DATE

-- Example
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    booking_period TSRANGE
);

-- Query với range
SELECT * FROM bookings 
WHERE booking_period @> CURRENT_TIMESTAMP;
```

---

## JSON và JSONB

### JSON vs JSONB

| Feature | JSON | JSONB |
|---------|------|-------|
| **Storage** | Text | Binary |
| **Indexing** | No | Yes (GIN) |
| **Performance** | Slower | Faster |
| **Ordering** | Preserved | Not preserved |
| **Duplicates** | Preserved | Removed |

### JSON Type

```sql
-- JSON type (text storage)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSON
);

-- Insert JSON
INSERT INTO products (name, attributes)
VALUES (
    'Laptop',
    '{"color": "black", "weight": "2.5kg", "screen": "15.6inch"}'::JSON
);

-- Query JSON
SELECT 
    name,
    attributes->>'color' AS color,
    attributes->>'weight' AS weight
FROM products;
```

### JSONB Type

```sql
-- JSONB type (binary storage, indexed)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);

-- Insert JSONB
INSERT INTO products (name, attributes)
VALUES (
    'Laptop',
    '{"color": "black", "weight": "2.5kg", "screen": "15.6inch"}'::JSONB
);

-- Query JSONB
SELECT 
    name,
    attributes->>'color' AS color,
    attributes->>'weight' AS weight
FROM products
WHERE attributes @> '{"color": "black"}'::JSONB;
```

### JSON/JSONB Operators

```sql
-- Access operators
->           -- Get JSON object field as JSON
->>          -- Get JSON object field as text
#>           -- Get JSON object at path as JSON
#>>          -- Get JSON object at path as text

-- Example
SELECT 
    attributes->'color' AS color_json,
    attributes->>'color' AS color_text,
    attributes#>'{screen}' AS screen_json,
    attributes#>>'{screen}' AS screen_text
FROM products;

-- Containment operators
@>           -- Left contains right
<@           -- Left contained in right
?            -- Key exists (JSONB only)
?|           -- Any key exists (JSONB only)
?&           -- All keys exist (JSONB only)

-- Example
SELECT * FROM products 
WHERE attributes @> '{"color": "black"}'::JSONB;

SELECT * FROM products 
WHERE attributes ? 'color';
```

### JSONB Indexing

```sql
-- GIN index on JSONB
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);

-- Query with index
SELECT * FROM products 
WHERE attributes @> '{"color": "black"}'::JSONB;
-- Uses GIN index
```

---

## Arrays

### Array Types

```sql
-- Array of any type
INTEGER[]     -- Array of integers
TEXT[]        -- Array of text
VARCHAR(50)[] -- Array of varchar

-- Example
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    tags TEXT[],
    scores INTEGER[]
);

-- Insert arrays
INSERT INTO users (username, tags, scores)
VALUES (
    'john_doe',
    ARRAY['developer', 'postgresql', 'python'],
    ARRAY[95, 87, 92]
);
```

### Array Operations

```sql
-- Access array elements
SELECT 
    username,
    tags[1] AS first_tag,        -- First element (1-indexed)
    tags[2:3] AS middle_tags,     -- Slice
    array_length(tags, 1) AS tag_count
FROM users;

-- Array functions
SELECT 
    username,
    array_append(tags, 'newtag') AS new_tags,
    array_prepend('first', tags) AS prepended_tags,
    array_remove(tags, 'postgresql') AS filtered_tags
FROM users;

-- Check if element exists
SELECT * FROM users 
WHERE 'postgresql' = ANY(tags);

-- Check if array contains
SELECT * FROM users 
WHERE tags @> ARRAY['postgresql'];
```

### Array Indexing

```sql
-- GIN index on arrays
CREATE INDEX idx_users_tags ON users USING GIN (tags);

-- Query with index
SELECT * FROM users 
WHERE tags @> ARRAY['postgresql'];
-- Uses GIN index
```

---

## Custom Types

### CREATE TYPE

```sql
-- Create ENUM type
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Use ENUM
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    status user_status DEFAULT 'active'
);

-- Insert với ENUM
INSERT INTO users (username, status)
VALUES ('john_doe', 'active');

-- Query ENUM
SELECT * FROM users WHERE status = 'active';
```

### Composite Types

```sql
-- Create composite type
CREATE TYPE address AS (
    street VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

-- Use composite type
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    user_address address
);

-- Insert composite
INSERT INTO users (username, user_address)
VALUES (
    'john_doe',
    ROW('123 Main St', 'New York', 'USA')::address
);

-- Query composite
SELECT 
    username,
    (user_address).street,
    (user_address).city
FROM users;
```

---

## Extensions

### What are Extensions?

**Định nghĩa:**
- Extensions add functionality to PostgreSQL
- Can be enabled/disabled
- Many available extensions

### Common Extensions

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS extension_name;

-- List installed extensions
SELECT * FROM pg_extension;

-- List available extensions
SELECT * FROM pg_available_extensions;
```

### Popular Extensions

#### 1. uuid-ossp

```sql
-- Generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT uuid_generate_v4();
```

#### 2. pg_trgm (Trigram)

```sql
-- Full-text search với trigrams
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_users_username_trgm ON users USING GIN (username gin_trgm_ops);

SELECT * FROM users WHERE username % 'john';
```

#### 3. PostGIS

```sql
-- Geographic objects
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location GEOGRAPHY(POINT, 4326)
);
```

#### 4. hstore

```sql
-- Key-value store
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes HSTORE
);

INSERT INTO products (name, attributes)
VALUES ('Laptop', 'color=>black, weight=>2.5kg'::HSTORE);
```

---

## Sequences

### Sequences là gì?

**Định nghĩa:**
- Generate unique sequential numbers
- Used by SERIAL types
- Can be created manually

### Create Sequence

```sql
-- Create sequence
CREATE SEQUENCE user_id_seq;

-- Use sequence
CREATE TABLE users (
    id INTEGER DEFAULT nextval('user_id_seq') PRIMARY KEY,
    username VARCHAR(50)
);

-- Or use SERIAL (auto-creates sequence)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- Auto-creates sequence users_id_seq
    username VARCHAR(50)
);
```

### Sequence Operations

```sql
-- Get next value
SELECT nextval('user_id_seq');

-- Get current value
SELECT currval('user_id_seq');

-- Set sequence value
SELECT setval('user_id_seq', 100);

-- Reset sequence
ALTER SEQUENCE user_id_seq RESTART WITH 1;
```

---

## Câu hỏi thường gặp

### Q1: JSON vs JSONB?

**JSON:**
- Text storage
- Preserves ordering
- No indexing
- Slower queries

**JSONB:**
- Binary storage
- No ordering
- Can be indexed (GIN)
- Faster queries

**Use JSONB** for most cases.

### Q2: Khi nào dùng Arrays?

**Use arrays when:**
- Multiple values of same type
- Order matters
- Need array operations
- Small, fixed-size collections

**Don't use arrays when:**
- Need to query individual elements frequently
- Large collections
- Need foreign keys
- Better to normalize

### Q3: UUID vs SERIAL?

**SERIAL:**
- Sequential numbers
- Smaller storage
- Faster for joins
- Predictable

**UUID:**
- Globally unique
- Larger storage
- Non-sequential
- Good for distributed systems

### Q4: Extensions là gì?

**Extensions:**
- Add functionality to PostgreSQL
- Can be enabled/disabled
- Examples: uuid-ossp, pg_trgm, PostGIS

**Enable extension:**
```sql
CREATE EXTENSION IF NOT EXISTS extension_name;
```

### Q5: Sequence là gì?

**Sequence:**
- Generate unique sequential numbers
- Used by SERIAL types
- Can be created manually

**Operations:**
- `nextval()`: Get next value
- `currval()`: Get current value
- `setval()`: Set value

### Q6: Làm sao query JSONB?

**Operators:**
- `->`: Get field as JSON
- `->>`: Get field as text
- `@>`: Contains
- `?`: Key exists

**Example:**
```sql
SELECT * FROM products 
WHERE attributes @> '{"color": "black"}'::JSONB;
```

---

## Best Practices

1. **Choose Right Types**: Use appropriate data types
2. **Use JSONB**: For JSON data, use JSONB
3. **Index JSONB**: Create GIN indexes on JSONB columns
4. **Use Arrays Wisely**: Don't overuse arrays
5. **Use Extensions**: Leverage PostgreSQL extensions
6. **Understand Sequences**: Know how SERIAL works

---

## Bài tập thực hành

### Bài 1: Data Types

```sql
-- Yêu cầu:
-- 1. Create table với various data types
-- 2. Insert data
-- 3. Query với different operators
-- 4. Practice với numeric, text, date types
```

### Bài 2: JSON/JSONB

```sql
-- Yêu cầu:
-- 1. Create table với JSONB column
-- 2. Insert JSON data
-- 3. Query JSONB với operators
-- 4. Create GIN index
-- 5. Query với index
```

### Bài 3: Arrays

```sql
-- Yêu cầu:
-- 1. Create table với array columns
-- 2. Insert array data
-- 3. Query array elements
-- 4. Use array functions
-- 5. Create GIN index
```

---

## Tổng kết

- **Standard Types**: Numeric, character, date/time, boolean
- **Advanced Types**: UUID, network, geometric, range
- **JSON/JSONB**: JSONB preferred, can be indexed
- **Arrays**: Array of any type, GIN indexing
- **Custom Types**: ENUM, composite types
- **Extensions**: Add functionality
- **Sequences**: Generate unique numbers
