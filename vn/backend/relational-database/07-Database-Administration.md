# Database Administration - Câu hỏi phỏng vấn

## Mục lục
1. [Backup và Recovery](#backup-và-recovery)
2. [Security và Authorization](#security-và-authorization)
3. [Monitoring và Performance](#monitoring-và-performance)
4. [Database Maintenance](#database-maintenance)
5. [Scaling Strategies](#scaling-strategies)
6. [Disaster Recovery](#disaster-recovery)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Backup và Recovery

### Backup Types

#### 1. Full Backup

**Định nghĩa:**
- Backup toàn bộ database
- Complete snapshot tại một thời điểm
- Foundation cho recovery strategy

```sql
-- PostgreSQL: pg_dump
pg_dump -U username -d database_name -F c -f backup.dump

-- MySQL: mysqldump
mysqldump -u username -p database_name > backup.sql

-- SQL Server: BACKUP DATABASE
BACKUP DATABASE database_name 
TO DISK = 'C:\backup\database_name.bak';
```

#### 2. Incremental Backup

**Định nghĩa:**
- Backup chỉ changes since last backup
- Smaller, faster
- Requires full backup first

```sql
-- PostgreSQL: WAL archiving (continuous)
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

-- MySQL: Binary log backup
mysqlbinlog binlog.000001 > incremental_backup.sql
```

#### 3. Differential Backup

**Định nghĩa:**
- Backup changes since last full backup
- Faster restore than incremental
- Larger than incremental

```sql
-- SQL Server: Differential backup
BACKUP DATABASE database_name 
TO DISK = 'C:\backup\database_name_diff.bak'
WITH DIFFERENTIAL;
```

### Backup Strategies

#### Strategy 1: Full Daily

```sql
-- Daily full backup
-- Simple but uses more storage
-- Fast restore (only one backup needed)
```

#### Strategy 2: Full Weekly + Daily Incremental

```sql
-- Weekly full backup
-- Daily incremental backups
-- Balance between storage and restore time
```

#### Strategy 3: Full + Continuous WAL

```sql
-- PostgreSQL: Full backup + WAL archiving
-- Point-in-time recovery
-- Most flexible
```

### Recovery

#### Point-in-Time Recovery (PITR)

```sql
-- PostgreSQL: Restore to specific time
-- 1. Restore full backup
pg_restore -U username -d database_name backup.dump

-- 2. Replay WAL files to target time
recovery_target_time = '2023-12-01 14:30:00'
```

#### Full Recovery

```sql
-- PostgreSQL: Restore full backup
pg_restore -U username -d database_name backup.dump

-- MySQL: Restore from dump
mysql -u username -p database_name < backup.sql
```

---

## Security và Authorization

### User Management

#### Create User

```sql
-- PostgreSQL
CREATE USER app_user WITH PASSWORD 'secure_password';

-- MySQL
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';

-- SQL Server
CREATE LOGIN app_user WITH PASSWORD = 'secure_password';
```

#### Grant Privileges

```sql
-- PostgreSQL: Grant SELECT, INSERT, UPDATE
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT USAGE ON SEQUENCE users_id_seq TO app_user;

-- MySQL: Grant all privileges on database
GRANT ALL PRIVILEGES ON database_name.* TO 'app_user'@'localhost';

-- Grant specific privileges
GRANT SELECT, INSERT, UPDATE ON database_name.users TO 'app_user'@'localhost';
```

#### Revoke Privileges

```sql
-- Revoke privileges
REVOKE INSERT ON users FROM app_user;

-- Remove all privileges
REVOKE ALL PRIVILEGES ON users FROM app_user;
```

### Roles

```sql
-- PostgreSQL: Create role
CREATE ROLE read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;

-- Assign role to user
GRANT read_only TO app_user;

-- MySQL: Create role (MySQL 8.0+)
CREATE ROLE 'read_only';
GRANT SELECT ON database_name.* TO 'read_only';
GRANT 'read_only' TO 'app_user'@'localhost';
```

### Row-Level Security

```sql
-- PostgreSQL: Row-level security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY user_orders_policy ON orders
FOR SELECT
USING (user_id = current_user_id());

-- Policy: Users can only update their own orders
CREATE POLICY user_orders_update_policy ON orders
FOR UPDATE
USING (user_id = current_user_id());
```

### Encryption

#### Data at Rest

```sql
-- PostgreSQL: Encrypt sensitive columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    password_hash BYTEA  -- Encrypted
);

-- Use pgcrypto extension
CREATE EXTENSION pgcrypto;
UPDATE users SET password_hash = crypt('password', gen_salt('bf'));
```

#### Data in Transit

```sql
-- SSL/TLS connections
-- PostgreSQL: sslmode=require in connection string
-- MySQL: --ssl-mode=REQUIRED
```

---

## Monitoring và Performance

### Query Performance

#### Slow Query Log

```sql
-- PostgreSQL: Enable slow query logging
log_min_duration_statement = 1000  -- Log queries > 1 second
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

-- MySQL: Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries > 1 second
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
```

#### Query Statistics

```sql
-- PostgreSQL: Query statistics
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Enable pg_stat_statements
CREATE EXTENSION pg_stat_statements;
```

### Database Statistics

```sql
-- PostgreSQL: Table statistics
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

-- Index statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

### Connection Monitoring

```sql
-- PostgreSQL: Active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE state = 'active';

-- Kill long-running query
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid = 12345;
```

### Disk Usage

```sql
-- PostgreSQL: Database size
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

## Database Maintenance

### Vacuum (PostgreSQL)

```sql
-- VACUUM: Reclaim storage, update statistics
VACUUM;

-- VACUUM FULL: Reclaim more storage, locks table
VACUUM FULL;

-- VACUUM ANALYZE: Vacuum + update statistics
VACUUM ANALYZE;

-- Auto-vacuum configuration
autovacuum = on
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
```

### Analyze

```sql
-- Update table statistics for query planner
ANALYZE users;

-- Analyze specific columns
ANALYZE users (username, email);

-- Auto-analyze configuration
autovacuum = on
autovacuum_analyze_threshold = 50
```

### Index Maintenance

```sql
-- Rebuild index
-- PostgreSQL
REINDEX INDEX idx_users_email;

-- Rebuild all indexes on table
REINDEX TABLE users;

-- MySQL: Optimize table (rebuilds indexes)
OPTIMIZE TABLE users;
```

### Update Statistics

```sql
-- PostgreSQL: Update statistics
ANALYZE;

-- SQL Server: Update statistics
UPDATE STATISTICS users;
```

---

## Scaling Strategies

### Vertical Scaling (Scale Up)

**Định nghĩa:**
- Tăng resources của single server
- More CPU, RAM, Storage
- Simpler but limited

**Khi nào dùng:**
- Small to medium workloads
- Single server sufficient
- Budget for better hardware

### Horizontal Scaling (Scale Out)

**Định nghĩa:**
- Thêm nhiều servers
- Distribute load
- More complex but scalable

**Khi nào dùng:**
- Large workloads
- Need high availability
- Cost-effective scaling

### Read Replicas

```sql
-- Master-Slave replication
-- Master: Handles writes
-- Slaves: Handle reads

-- PostgreSQL: Streaming replication
-- 1. Configure master
wal_level = replica
max_wal_senders = 3

-- 2. Configure replica
primary_conninfo = 'host=master_host port=5432 user=replicator'
```

### Sharding

**Định nghĩa:**
- Partition data across multiple databases
- Each shard independent
- Distribute load

**Sharding Strategies:**

#### 1. Range Sharding

```sql
-- Shard by user_id range
-- Shard 1: user_id 1-1000000
-- Shard 2: user_id 1000001-2000000
-- Shard 3: user_id 2000001-3000000
```

#### 2. Hash Sharding

```sql
-- Shard by hash of user_id
-- user_id % 3 determines shard
-- Shard 1: user_id % 3 = 0
-- Shard 2: user_id % 3 = 1
-- Shard 3: user_id % 3 = 2
```

#### 3. Directory-Based Sharding

```sql
-- Shard mapping table
CREATE TABLE shard_mapping (
    user_id INT PRIMARY KEY,
    shard_id INT
);

-- Lookup shard for user
SELECT shard_id FROM shard_mapping WHERE user_id = 123;
```

### Partitioning

```sql
-- PostgreSQL: Table partitioning
-- Partition by date
CREATE TABLE orders (
    id INT,
    user_id INT,
    order_date DATE,
    total DECIMAL(10, 2)
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE orders_2023 PARTITION OF orders
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## Disaster Recovery

### Recovery Time Objective (RTO)

**Định nghĩa:**
- Maximum acceptable downtime
- Time to restore service
- Business requirement

### Recovery Point Objective (RPO)

**Định nghĩa:**
- Maximum acceptable data loss
- How much data can be lost
- Determines backup frequency

### Disaster Recovery Plan

#### 1. Backup Strategy

```sql
-- Regular backups
-- Full backup: Weekly
-- Incremental backup: Daily
-- WAL archiving: Continuous
```

#### 2. Test Restores

```sql
-- Regularly test restore procedures
-- Verify backup integrity
-- Document restore steps
```

#### 3. Monitoring

```sql
-- Monitor backup success
-- Alert on backup failures
-- Monitor disk space
```

#### 4. Documentation

```sql
-- Document recovery procedures
-- Keep runbooks updated
-- Train team on recovery
```

---

## Câu hỏi thường gặp

### Q1: Backup types khác nhau như thế nào?

**Full Backup:**
- Complete database snapshot
- Foundation for recovery
- Largest, slowest

**Incremental Backup:**
- Changes since last backup
- Smaller, faster
- Requires full backup first

**Differential Backup:**
- Changes since last full backup
- Medium size
- Faster restore than incremental

### Q2: Khi nào dùng VACUUM FULL?

**VACUUM FULL:**
- Reclaims more storage
- Locks table (blocks operations)
- Use when:
  - Significant dead rows
  - Low traffic period
  - Need maximum storage reclaim

**Regular VACUUM:**
- Non-blocking
- Regular maintenance
- Use for routine cleanup

### Q3: Read Replicas vs Sharding?

**Read Replicas:**
- Same data on multiple servers
- Distribute read load
- Easier to implement
- Write to master only

**Sharding:**
- Different data on different servers
- Distribute both read and write load
- More complex
- Need shard routing logic

### Q4: Làm sao monitor database performance?

**Methods:**
1. **Slow query log**: Identify slow queries
2. **pg_stat_statements**: Query statistics
3. **pg_stat_activity**: Active connections
4. **Table/index statistics**: Usage patterns
5. **Disk usage**: Storage monitoring
6. **Connection monitoring**: Active sessions

### Q5: RTO vs RPO?

**RTO (Recovery Time Objective):**
- Maximum downtime acceptable
- Time to restore service
- Example: 4 hours

**RPO (Recovery Point Objective):**
- Maximum data loss acceptable
- How much data can be lost
- Example: 1 hour (need hourly backups)

### Q6: Khi nào nên partition tables?

**Nên partition khi:**
- Table very large (> millions of rows)
- Queries filter by partition key
- Need to drop old data easily
- Improve query performance

**Partition by:**
- Date (time-series data)
- Range (user_id ranges)
- List (categories)

---

## Best Practices

1. **Regular Backups**: Full + incremental strategy
2. **Test Restores**: Verify backup integrity
3. **Monitor Performance**: Slow queries, connections
4. **Maintain Statistics**: Keep statistics updated
5. **Security**: Least privilege principle
6. **Documentation**: Document procedures
7. **Automation**: Automate backups và maintenance
8. **Monitoring**: Alert on issues

---

## Bài tập thực hành

### Bài 1: Backup Strategy

```sql
-- Yêu cầu: Design backup strategy
-- 1. Full backup schedule
-- 2. Incremental backup schedule
-- 3. Retention policy
-- 4. Recovery procedures
```

### Bài 2: Security Setup

```sql
-- Yêu cầu: Setup database security
-- 1. Create users với appropriate roles
-- 2. Grant minimal privileges
-- 3. Setup row-level security
-- 4. Test access controls
```

### Bài 3: Performance Monitoring

```sql
-- Yêu cầu: Setup monitoring
-- 1. Enable slow query log
-- 2. Setup query statistics
-- 3. Monitor connections
-- 4. Create alerts
```

---

## Tổng kết

- **Backup**: Full, incremental, differential backups
- **Recovery**: Point-in-time recovery, full recovery
- **Security**: User management, roles, encryption
- **Monitoring**: Query performance, statistics, connections
- **Maintenance**: VACUUM, ANALYZE, index maintenance
- **Scaling**: Vertical, horizontal, read replicas, sharding
- **Disaster Recovery**: RTO, RPO, recovery plans
