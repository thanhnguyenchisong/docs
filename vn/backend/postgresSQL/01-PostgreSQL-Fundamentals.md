# PostgreSQL Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [PostgreSQL là gì?](#postgresql-là-gì)
2. [Installation và Setup](#installation-và-setup)
3. [Configuration](#configuration)
4. [psql Command Line](#psql-command-line)
5. [Database và Schema](#database-và-schema)
6. [Basic Operations](#basic-operations)
7. [MVCC (Multi-Version Concurrency Control)](#mvcc-multi-version-concurrency-control)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## PostgreSQL là gì?

### PostgreSQL

**Định nghĩa:**
- PostgreSQL là **open-source relational database management system** (RDBMS)
- Object-relational database
- ACID-compliant
- Extensible với custom functions, types, operators

### Key Features

1. **ACID Compliance**: Full ACID support
2. **MVCC**: Multi-Version Concurrency Control
3. **Extensibility**: Custom types, functions, operators
4. **Advanced Types**: JSON, JSONB, Arrays, UUID, etc.
5. **Full-Text Search**: Built-in full-text search
6. **Extensible**: Extensions ecosystem
7. **Open Source**: Free và open-source

### PostgreSQL vs Other Databases

| Feature | PostgreSQL | MySQL | SQL Server |
|---------|------------|-------|------------|
| **Type** | Object-relational | Relational | Relational |
| **License** | Open-source | Open-source | Commercial |
| **JSON Support** | Native JSONB | JSON (5.7+) | JSON (2016+) |
| **Full-Text Search** | Built-in | Basic | Full-text |
| **Extensibility** | High | Medium | Medium |
| **ACID** | Full | InnoDB only | Full |
| **MVCC** | Yes | InnoDB only | Yes |

### Version History

- **PostgreSQL 15**: Latest stable (2022)
- **PostgreSQL 14**: LTS
- **PostgreSQL 13**: Previous LTS
- **PostgreSQL 12**: Previous version

---

## Installation và Setup

### Installation

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

#### Linux (CentOS/RHEL)

```bash
# Install PostgreSQL repository
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL
sudo yum install -y postgresql14-server postgresql14

# Initialize database
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb

# Start service
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14
```

#### macOS

```bash
# Using Homebrew
brew install postgresql@14

# Start service
brew services start postgresql@14
```

#### Windows

- Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer
- Follow installation wizard

### Initial Setup

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database
createdb mydb

# Create user
createuser myuser

# Set password
psql -c "ALTER USER myuser WITH PASSWORD 'mypassword';"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;"
```

---

## Configuration

### Configuration Files

**Main config file:**
- Location: `postgresql.conf`
- Path: `/etc/postgresql/14/main/postgresql.conf` (Linux)
- Path: `/usr/local/var/postgresql.conf` (macOS)

**Authentication config:**
- Location: `pg_hba.conf`
- Controls client authentication

### Important Settings

```conf
# postgresql.conf

# Connection settings
listen_addresses = 'localhost'          # Listen on localhost
port = 5432                             # Default port
max_connections = 100                   # Max concurrent connections

# Memory settings
shared_buffers = 128MB                  # Shared memory
work_mem = 4MB                          # Memory for operations
maintenance_work_mem = 64MB             # Memory for maintenance

# WAL settings
wal_level = replica                     # WAL level
max_wal_size = 1GB                     # Max WAL size
min_wal_size = 80MB                     # Min WAL size

# Checkpoint settings
checkpoint_timeout = 5min               # Checkpoint interval
checkpoint_completion_target = 0.9      # Checkpoint completion target

# Logging
logging_collector = on                  # Enable logging
log_directory = 'log'                   # Log directory
log_filename = 'postgresql-%Y-%m-%d.log'
log_statement = 'all'                   # Log all statements
```

### Reload Configuration

```bash
# Reload configuration (no restart needed)
sudo systemctl reload postgresql

# Or using psql
psql -c "SELECT pg_reload_conf();"

# Restart PostgreSQL (if needed)
sudo systemctl restart postgresql
```

---

## psql Command Line

### psql là gì?

**Định nghĩa:**
- PostgreSQL interactive terminal
- Command-line interface
- Execute SQL commands
- Manage databases

### Connect to Database

```bash
# Connect to default database
psql

# Connect to specific database
psql -d mydb

# Connect as specific user
psql -U myuser -d mydb

# Connect to remote database
psql -h localhost -p 5432 -U myuser -d mydb

# Connect với password prompt
psql -U myuser -d mydb -W
```

### psql Commands

```sql
-- List databases
\l
\list

-- Connect to database
\c database_name
\connect database_name

-- List tables
\dt

-- Describe table
\d table_name

-- List schemas
\dn

-- List functions
\df

-- List users/roles
\du

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Show version
SELECT version();

-- Exit psql
\q
\quit
```

### psql Meta-Commands

```sql
-- Show help
\?

-- SQL help
\h SELECT
\h CREATE TABLE

-- Timing
\timing          -- Toggle query timing
\timing on       -- Enable timing
\timing off      -- Disable timing

-- Output format
\x              -- Toggle expanded display
\pset format aligned  -- Aligned format
\pset format wrapped  -- Wrapped format

-- Copy output
\o filename.txt  -- Output to file
\o               -- Reset output

-- Execute file
\i script.sql    -- Execute SQL file
```

---

## Database và Schema

### Database

**Định nghĩa:**
- Database là collection of schemas
- Isolated namespace
- Can't cross-database queries (without dblink)

```sql
-- Create database
CREATE DATABASE mydb;

-- Create database với options
CREATE DATABASE mydb
    WITH OWNER = myuser
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- List databases
SELECT datname FROM pg_database;

-- Drop database
DROP DATABASE mydb;
```

### Schema

**Định nghĩa:**
- Schema là namespace trong database
- Contains tables, views, functions, etc.
- Default schema: `public`

```sql
-- Create schema
CREATE SCHEMA myschema;

-- Create table in schema
CREATE TABLE myschema.mytable (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- Set search path
SET search_path TO myschema, public;

-- List schemas
SELECT schema_name FROM information_schema.schemata;

-- Drop schema
DROP SCHEMA myschema CASCADE;
```

### Default Schemas

- **public**: Default schema for user objects
- **information_schema**: Metadata about database
- **pg_catalog**: System catalogs
- **pg_toast**: Large object storage

---

## Basic Operations

### Create Table

```sql
-- Basic table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table với constraints
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Insert Data

```sql
-- Single row
INSERT INTO users (username, email)
VALUES ('john_doe', 'john@example.com');

-- Multiple rows
INSERT INTO users (username, email)
VALUES 
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com'),
    ('bob_wilson', 'bob@example.com');

-- Insert với RETURNING
INSERT INTO users (username, email)
VALUES ('alice', 'alice@example.com')
RETURNING id, username;
```

### Select Data

```sql
-- Select all
SELECT * FROM users;

-- Select specific columns
SELECT id, username, email FROM users;

-- Select với conditions
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE email LIKE '%@example.com';

-- Select với ordering
SELECT * FROM users ORDER BY created_at DESC;

-- Select với limit
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;
```

### Update Data

```sql
-- Update single row
UPDATE users 
SET email = 'newemail@example.com'
WHERE id = 1;

-- Update multiple rows
UPDATE users 
SET status = 'active'
WHERE created_at < '2023-01-01';

-- Update với RETURNING
UPDATE users 
SET email = 'newemail@example.com'
WHERE id = 1
RETURNING id, username, email;
```

### Delete Data

```sql
-- Delete single row
DELETE FROM users WHERE id = 1;

-- Delete multiple rows
DELETE FROM users WHERE status = 'inactive';

-- Delete all rows
DELETE FROM users;

-- Truncate (faster, no rollback)
TRUNCATE TABLE users;
TRUNCATE TABLE users RESTART IDENTITY;  -- Reset sequence
```

---

## MVCC (Multi-Version Concurrency Control)

### MVCC là gì?

**Định nghĩa:**
- MVCC là concurrency control method
- Multiple versions of data
- Readers don't block writers
- Writers don't block readers
- Provides snapshot isolation

### How MVCC Works

**Key Concepts:**

1. **Transaction ID (XID)**: Each transaction gets unique ID
2. **Tuple Versions**: Multiple versions of same row
3. **Visibility**: Transactions see consistent snapshot
4. **Vacuum**: Removes old versions

**Example:**
```
Transaction 1 (XID: 100) reads row
Transaction 2 (XID: 101) updates row
Transaction 1 still sees old version
Transaction 2 sees new version
```

### Benefits

1. **No Read Locks**: Readers don't block
2. **Concurrent Access**: Multiple readers/writers
3. **Snapshot Isolation**: Consistent view
4. **Better Performance**: Less locking

### Trade-offs

1. **Storage**: Multiple versions consume space
2. **Vacuum Required**: Need VACUUM to reclaim space
3. **Complexity**: More complex than locking

---

## Câu hỏi thường gặp

### Q1: PostgreSQL là gì?

**PostgreSQL:**
- Open-source relational database
- Object-relational database
- ACID-compliant
- Extensible với custom types, functions

### Q2: PostgreSQL vs MySQL?

| Feature | PostgreSQL | MySQL |
|---------|------------|-------|
| **ACID** | Full | InnoDB only |
| **JSON** | Native JSONB | JSON (5.7+) |
| **Full-Text** | Built-in | Basic |
| **Extensibility** | High | Medium |
| **MVCC** | Yes | InnoDB only |

### Q3: MVCC là gì?

**MVCC (Multi-Version Concurrency Control):**
- Concurrency control method
- Multiple versions of data
- Readers don't block writers
- Provides snapshot isolation
- Better performance than locking

### Q4: Làm sao connect to PostgreSQL?

```bash
# Local connection
psql -d mydb

# Remote connection
psql -h localhost -p 5432 -U myuser -d mydb

# Connection string
psql "postgresql://myuser:mypassword@localhost:5432/mydb"
```

### Q5: Schema vs Database?

**Database:**
- Collection of schemas
- Isolated namespace
- Can't cross-database queries

**Schema:**
- Namespace trong database
- Contains tables, views, functions
- Default: `public`

### Q6: Làm sao reload configuration?

```bash
# Reload (no restart)
sudo systemctl reload postgresql

# Or using psql
psql -c "SELECT pg_reload_conf();"

# Restart (if needed)
sudo systemctl restart postgresql
```

### Q7: psql commands?

**Common commands:**
- `\l`: List databases
- `\dt`: List tables
- `\d table_name`: Describe table
- `\c dbname`: Connect to database
- `\du`: List users
- `\q`: Quit

### Q8: VACUUM là gì?

**VACUUM:**
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
```

---

## Best Practices

1. **Use Appropriate Data Types**: Choose right types
2. **Index Strategically**: Index foreign keys, frequently queried columns
3. **Regular VACUUM**: Keep database healthy
4. **Monitor Connections**: Don't exceed max_connections
5. **Use Schemas**: Organize objects
6. **Backup Regularly**: Protect your data
7. **Tune Configuration**: Optimize for workload

---

## Bài tập thực hành

### Bài 1: Installation và Setup

```bash
# Yêu cầu:
# 1. Install PostgreSQL
# 2. Start service
# 3. Create database
# 4. Create user
# 5. Grant privileges
# 6. Connect và test
```

### Bài 2: Basic Operations

```sql
-- Yêu cầu:
-- 1. Create table với constraints
-- 2. Insert data
-- 3. Select data với conditions
-- 4. Update data
-- 5. Delete data
-- 6. Practice với different data types
```

### Bài 3: Schema Management

```sql
-- Yêu cầu:
-- 1. Create schema
-- 2. Create tables in schema
-- 3. Set search path
-- 4. Query across schemas
-- 5. Drop schema
```

---

## Tổng kết

- **PostgreSQL**: Open-source object-relational database
- **Installation**: Multiple methods (package manager, installer)
- **Configuration**: postgresql.conf, pg_hba.conf
- **psql**: Command-line interface
- **Database**: Collection of schemas
- **Schema**: Namespace for objects
- **MVCC**: Multi-Version Concurrency Control
- **VACUUM**: Reclaim storage, update statistics
