# Security - Câu hỏi phỏng vấn

## Mục lục
1. [Authentication](#authentication)
2. [Authorization và Roles](#authorization-và-roles)
3. [Row-Level Security](#row-level-security)
4. [Encryption](#encryption)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Best Practices](#best-practices)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Authentication

### Authentication Methods

**pg_hba.conf** controls authentication:

```conf
# TYPE  DATABASE  USER  ADDRESS  METHOD

# Local connections
local   all       all             peer

# IPv4 connections
host    all       all   127.0.0.1/32  md5
host    all       all   0.0.0.0/0     md5

# IPv6 connections
host    all       all   ::1/128       md5
```

### Authentication Methods

#### 1. trust

```conf
# No password required
host    all    all    127.0.0.1/32  trust
```

#### 2. md5

```conf
# MD5 password
host    all    all    127.0.0.1/32  md5
```

#### 3. scram-sha-256

```conf
# SCRAM-SHA-256 (recommended)
host    all    all    127.0.0.1/32  scram-sha-256
```

#### 4. peer

```conf
# Unix socket, OS user = DB user
local   all    all                  peer
```

#### 5. cert

```conf
# SSL certificate
hostssl all    all    0.0.0.0/0     cert
```

---

## Authorization và Roles

### Roles

```sql
-- Create role
CREATE ROLE myuser WITH LOGIN PASSWORD 'mypassword';

-- Create role với privileges
CREATE ROLE admin WITH
    LOGIN
    PASSWORD 'adminpass'
    CREATEDB
    CREATEROLE
    SUPERUSER;
```

### Grant Privileges

```sql
-- Grant on database
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;

-- Grant on schema
GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;

-- Grant on table
GRANT SELECT, INSERT, UPDATE ON users TO myuser;

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

---

## Row-Level Security

### Enable Row-Level Security

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_orders_policy ON orders
FOR SELECT
USING (user_id = current_user_id());

-- Policy for INSERT
CREATE POLICY user_orders_insert_policy ON orders
FOR INSERT
WITH CHECK (user_id = current_user_id());

-- Policy for UPDATE
CREATE POLICY user_orders_update_policy ON orders
FOR UPDATE
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- Policy for DELETE
CREATE POLICY user_orders_delete_policy ON orders
FOR DELETE
USING (user_id = current_user_id());
```

### Bypass RLS

```sql
-- Bypass RLS (superuser or table owner)
SET row_security = off;
```

---

## Encryption

### Encryption at Rest

```sql
-- Encrypt sensitive columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password_hash BYTEA  -- Encrypted
);

-- Use pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt data
UPDATE users 
SET password_hash = crypt('password', gen_salt('bf'));
```

### Encryption in Transit

- SSL/TLS connections
- Encrypts data between client and server
- Configured in postgresql.conf và pg_hba.conf

---

## SSL/TLS Configuration

### Enable SSL

```conf
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'
```

### Require SSL

```conf
# pg_hba.conf
# Require SSL for remote connections
hostssl all    all    0.0.0.0/0    scram-sha-256
```

### Client SSL

```bash
# Connect với SSL
psql "postgresql://user:pass@host:5432/db?sslmode=require"

# SSL modes:
# disable  - No SSL
# allow    - Try SSL, fallback if fails
# prefer   - Try SSL, fallback if fails (default)
# require  - Require SSL
# verify-ca - Require SSL, verify CA
# verify-full - Require SSL, verify CA and hostname
```

---

## Best Practices

### Security Best Practices

1. **Strong Passwords**: Use strong passwords
2. **Least Privilege**: Grant minimum required privileges
3. **Use SSL/TLS**: Encrypt connections
4. **Row-Level Security**: For multi-tenant applications
5. **Regular Updates**: Keep PostgreSQL updated
6. **Audit Logging**: Log security events
7. **Backup Encryption**: Encrypt backups

### Configuration Security

```conf
# postgresql.conf

# Disable unsafe features
shared_preload_libraries = ''

# Limit connections
max_connections = 100

# Connection timeout
connection_timeout = 60

# SSL
ssl = on
```

---

## Câu hỏi thường gặp

### Q1: Authentication methods?

**Methods:**
- `trust`: No password
- `md5`: MD5 password
- `scram-sha-256`: SCRAM (recommended)
- `peer`: OS user = DB user
- `cert`: SSL certificate

### Q2: Row-level security?

**RLS:**
- Restrict rows based on policies
- Enable với `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Create policies với `CREATE POLICY`

### Q3: SSL/TLS setup?

**Steps:**
1. Generate certificates
2. Configure postgresql.conf
3. Configure pg_hba.conf
4. Restart PostgreSQL

### Q4: Encryption options?

**At Rest:**
- pgcrypto extension
- Encrypt sensitive columns

**In Transit:**
- SSL/TLS
- Encrypts connections

---

## Best Practices

1. **Strong Authentication**: Use scram-sha-256
2. **Least Privilege**: Grant minimum required
3. **Use SSL/TLS**: Encrypt connections
4. **Row-Level Security**: For multi-tenant
5. **Regular Updates**: Keep PostgreSQL updated
6. **Audit Logging**: Monitor security events

---

## Bài tập thực hành

### Bài 1: Authentication

```sql
-- Yêu cầu:
-- 1. Configure pg_hba.conf
-- 2. Test different auth methods
-- 3. Create users với passwords
```

### Bài 2: Row-Level Security

```sql
-- Yêu cầu:
-- 1. Enable RLS
-- 2. Create policies
-- 3. Test access control
```

---

## Tổng kết

- **Authentication**: pg_hba.conf, various methods
- **Authorization**: Roles, privileges
- **Row-Level Security**: Row-level access control
- **Encryption**: At rest, in transit
- **SSL/TLS**: Encrypt connections
- **Best Practices**: Security guidelines
