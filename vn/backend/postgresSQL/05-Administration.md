# Administration - Câu hỏi phỏng vấn

## Mục lục
1. [User và Role Management](#user-và-role-management)
2. [Permissions và Privileges](#permissions-và-privileges)
3. [Database Maintenance](#database-maintenance)
4. [Monitoring và Logging](#monitoring-và-logging)
5. [Configuration Tuning](#configuration-tuning)
6. [Extensions Management](#extensions-management)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## User và Role Management

### Roles

**Định nghĩa:**
- Role can be user hoặc group
- PostgreSQL uses roles instead of users
- Roles can have login privilege

### Create Role

```sql
-- Create role
CREATE ROLE myrole;

-- Create role với login
CREATE ROLE myuser WITH LOGIN;

-- Create role với password
CREATE ROLE myuser WITH LOGIN PASSWORD 'mypassword';

-- Create role với options
CREATE ROLE myuser WITH
    LOGIN
    PASSWORD 'mypassword'
    CREATEDB
    CREATEROLE
    SUPERUSER;
```

### Alter Role

```sql
-- Change password
ALTER ROLE myuser WITH PASSWORD 'newpassword';

-- Add privileges
ALTER ROLE myuser WITH CREATEDB;

-- Remove privileges
ALTER ROLE myuser WITH NOCREATEDB;

-- Rename role
ALTER ROLE oldname RENAME TO newname;
```

### Drop Role

```sql
-- Drop role
DROP ROLE myrole;

-- Drop role với dependencies
DROP ROLE myrole CASCADE;
```

### List Roles

```sql
-- List all roles
SELECT rolname FROM pg_roles;

-- List roles với details
\du

-- Or
SELECT 
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles;
```

---

## Permissions và Privileges

### Grant Privileges

```sql
-- Grant on database
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;

-- Grant on schema
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;

-- Grant on table
GRANT SELECT, INSERT, UPDATE ON users TO myuser;

-- Grant all on table
GRANT ALL PRIVILEGES ON users TO myuser;

-- Grant on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO myuser;

-- Grant on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO myuser;
```

### Revoke Privileges

```sql
-- Revoke privilege
REVOKE SELECT ON users FROM myuser;

-- Revoke all
REVOKE ALL PRIVILEGES ON users FROM myuser;
```

### Row-Level Security

```sql
-- Enable row-level security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_orders_policy ON orders
FOR SELECT
USING (user_id = current_user_id());

-- Create policy for INSERT
CREATE POLICY user_orders_insert_policy ON orders
FOR INSERT
WITH CHECK (user_id = current_user_id());
```

---

## Database Maintenance

### Database Statistics

```sql
-- Update statistics
ANALYZE;

-- Analyze specific table
ANALYZE users;

-- Analyze specific columns
ANALYZE users (username, email);
```

### Vacuum

```sql
-- Vacuum database
VACUUM;

-- Vacuum specific table
VACUUM users;

-- Vacuum và analyze
VACUUM ANALYZE;

-- Vacuum full (locks table)
VACUUM FULL users;
```

### Reindex

```sql
-- Reindex database
REINDEX DATABASE mydb;

-- Reindex table
REINDEX TABLE users;

-- Reindex index
REINDEX INDEX idx_users_email;
```

### Database Size

```sql
-- Database size
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- Table size
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Monitoring và Logging

### Enable Logging

```conf
# postgresql.conf
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_statement = 'all'              # Log all statements
log_duration = on                  # Log query duration
log_min_duration_statement = 1000  # Log queries > 1 second
```

### View Active Connections

```sql
-- Active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    query
FROM pg_stat_activity
WHERE state = 'active';
```

### View Query Statistics

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View query statistics
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### View Table Statistics

```sql
-- Table statistics
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## Configuration Tuning

### Memory Settings

```conf
# postgresql.conf

# Shared buffers (25% of RAM for dedicated server)
shared_buffers = 128MB

# Work memory (for operations)
work_mem = 4MB

# Maintenance memory
maintenance_work_mem = 64MB
```

### Connection Settings

```conf
# Max connections
max_connections = 100

# Connection timeout
connection_timeout = 60
```

### Autovacuum Settings

```conf
# Autovacuum
autovacuum = on
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

---

## Extensions Management

### List Extensions

```sql
-- List installed extensions
SELECT * FROM pg_extension;

-- List available extensions
SELECT * FROM pg_available_extensions;
```

### Install Extension

```sql
-- Install extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Install với schema
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;
```

### Remove Extension

```sql
-- Remove extension
DROP EXTENSION IF EXISTS "uuid-ossp";
```

---

## Câu hỏi thường gặp

### Q1: Role vs User?

**In PostgreSQL:**
- Role và User are same
- Role with LOGIN = User
- Use CREATE ROLE for both

### Q2: Grant privileges?

**Grant on:**
- Database: `GRANT ON DATABASE`
- Schema: `GRANT ON SCHEMA`
- Table: `GRANT ON TABLE`
- Column: `GRANT ON COLUMN`

### Q3: Row-level security?

**Row-level security:**
- Restrict rows based on policies
- Enable với `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Create policies với `CREATE POLICY`

### Q4: Monitor performance?

**Methods:**
1. Enable logging
2. Use pg_stat_statements
3. Monitor pg_stat_activity
4. Check table statistics
5. Use EXPLAIN ANALYZE

### Q5: VACUUM khi nào?

**Use VACUUM:**
- Regularly (autovacuum)
- After large deletes
- Before performance issues

---

## Best Practices

1. **Regular Maintenance**: VACUUM, ANALYZE
2. **Monitor Performance**: Track queries, connections
3. **Proper Permissions**: Least privilege
4. **Regular Backups**: Protect data
5. **Tune Configuration**: Optimize for workload

---

## Bài tập thực hành

### Bài 1: User Management

```sql
-- Yêu cầu:
-- 1. Create roles
-- 2. Grant privileges
-- 3. Test permissions
-- 4. Revoke privileges
```

### Bài 2: Monitoring

```sql
-- Yêu cầu:
-- 1. Enable logging
-- 2. Monitor connections
-- 3. Check query statistics
-- 4. Analyze performance
```

---

## Tổng kết

- **Roles**: User và group management
- **Privileges**: Grant/revoke permissions
- **Maintenance**: VACUUM, ANALYZE, REINDEX
- **Monitoring**: Logging, statistics
- **Configuration**: Tune for workload
- **Extensions**: Manage extensions
