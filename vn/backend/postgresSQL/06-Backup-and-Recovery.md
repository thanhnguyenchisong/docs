# Backup và Recovery - Câu hỏi phỏng vấn

## Mục lục
1. [Backup Strategies](#backup-strategies)
2. [pg_dump và pg_restore](#pg_dump-và-pg_restore)
3. [Point-in-Time Recovery (PITR)](#point-in-time-recovery-pitr)
4. [WAL Archiving](#wal-archiving)
5. [Replication](#replication)
6. [Disaster Recovery](#disaster-recovery)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Backup Strategies

### Backup Types

#### 1. Full Backup

```bash
# Full database backup
pg_dump -U postgres mydb > backup.sql

# Full database backup (custom format)
pg_dump -U postgres -F c mydb > backup.dump

# Full cluster backup
pg_dumpall -U postgres > backup_all.sql
```

#### 2. Incremental Backup

- Uses WAL archiving
- Continuous backup
- Point-in-time recovery

#### 3. Differential Backup

- Not directly supported
- Use WAL archiving instead

---

## pg_dump và pg_restore

### pg_dump

**Định nghĩa:**
- Backup single database
- Can backup schema, data, or both
- Multiple output formats

```bash
# SQL format (plain text)
pg_dump -U postgres mydb > backup.sql

# Custom format (compressed, flexible)
pg_dump -U postgres -F c mydb > backup.dump

# Directory format (parallel restore)
pg_dump -U postgres -F d mydb -f backup_dir

# Tar format
pg_dump -U postgres -F t mydb > backup.tar
```

### pg_dump Options

```bash
# Schema only
pg_dump -U postgres --schema-only mydb > schema.sql

# Data only
pg_dump -U postgres --data-only mydb > data.sql

# Specific tables
pg_dump -U postgres -t users -t orders mydb > tables.sql

# Exclude tables
pg_dump -U postgres -T temp_table mydb > backup.sql

# Compress
pg_dump -U postgres -F c -Z 9 mydb > backup.dump

# Verbose
pg_dump -U postgres -v mydb > backup.sql
```

### pg_restore

**Định nghĩa:**
- Restore from custom/directory/tar format
- More flexible than psql
- Can restore selectively

```bash
# Restore from custom format
pg_restore -U postgres -d mydb backup.dump

# Restore schema only
pg_restore -U postgres --schema-only -d mydb backup.dump

# Restore data only
pg_restore -U postgres --data-only -d mydb backup.dump

# Restore specific tables
pg_restore -U postgres -t users -t orders -d mydb backup.dump

# Parallel restore
pg_restore -U postgres -j 4 -d mydb backup.dump
```

### Restore from SQL

```bash
# Restore from SQL file
psql -U postgres -d mydb < backup.sql

# Or
psql -U postgres -d mydb -f backup.sql
```

---

## Point-in-Time Recovery (PITR)

### PITR là gì?

**Định nghĩa:**
- Restore to specific point in time
- Requires WAL archiving
- Continuous backup
- Most flexible recovery

### Setup PITR

#### 1. Enable WAL Archiving

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

#### 2. Base Backup

```bash
# Create base backup
pg_basebackup -U postgres -D /backup/base -Ft -z -P

# Or using pg_start_backup
psql -c "SELECT pg_start_backup('backup_label');"
# Copy data directory
psql -c "SELECT pg_stop_backup();"
```

#### 3. Restore to Point in Time

```conf
# recovery.conf (PostgreSQL < 12)
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2023-12-01 14:30:00'

# postgresql.auto.conf (PostgreSQL 12+)
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2023-12-01 14:30:00'
```

---

## WAL Archiving

### WAL (Write-Ahead Logging)

**Định nghĩa:**
- Log of all changes
- Required for PITR
- Continuous backup

### Enable WAL Archiving

```conf
# postgresql.conf
wal_level = replica          # Or 'archive' for older versions
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# Or use custom script
archive_command = '/path/to/archive_script.sh %p %f'
```

### Archive Script Example

```bash
#!/bin/bash
# archive_script.sh

SOURCE=$1
DEST=$2
ARCHIVE_DIR="/backup/wal"

cp $SOURCE $ARCHIVE_DIR/$DEST
# Optional: compress
gzip $ARCHIVE_DIR/$DEST
```

---

## Replication

### Replication Types

#### 1. Streaming Replication

**Định nghĩa:**
- Physical replication
- Master-slave setup
- Real-time replication

**Setup:**

**Master (Primary):**
```conf
# postgresql.conf
wal_level = replica
max_wal_senders = 3
```

```conf
# pg_hba.conf
host replication replicator 192.168.1.0/24 md5
```

**Replica (Standby):**
```bash
# Create base backup
pg_basebackup -h master -U replicator -D /var/lib/postgresql/data -P -W

# Configure recovery
echo "standby_mode = 'on'" >> recovery.conf
echo "primary_conninfo = 'host=master port=5432 user=replicator'" >> recovery.conf
```

#### 2. Logical Replication

**Định nghĩa:**
- Replicate specific tables
- Can filter data
- More flexible

**Setup:**

**Publisher:**
```sql
CREATE PUBLICATION mypub FOR TABLE users, orders;
```

**Subscriber:**
```sql
CREATE SUBSCRIPTION mysub 
CONNECTION 'host=master port=5432 dbname=mydb user=replicator'
PUBLICATION mypub;
```

---

## Disaster Recovery

### Recovery Procedures

#### 1. Full Recovery

```bash
# Restore from backup
pg_restore -U postgres -d mydb backup.dump
```

#### 2. Point-in-Time Recovery

```bash
# 1. Restore base backup
pg_basebackup -D /var/lib/postgresql/data

# 2. Configure recovery
# recovery.conf or postgresql.auto.conf
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2023-12-01 14:30:00'

# 3. Start PostgreSQL
# Automatically recovers to target time
```

### Recovery Testing

```bash
# Test restore procedure
# 1. Create test database
createdb testdb

# 2. Restore backup
pg_restore -d testdb backup.dump

# 3. Verify data
psql -d testdb -c "SELECT COUNT(*) FROM users;"
```

---

## Câu hỏi thường gặp

### Q1: Backup types?

**Full Backup:**
- Complete database snapshot
- pg_dump, pg_dumpall

**Incremental:**
- WAL archiving
- Continuous backup

### Q2: pg_dump vs pg_dumpall?

**pg_dump:**
- Single database
- More flexible

**pg_dumpall:**
- All databases
- Includes roles, tablespaces

### Q3: PITR setup?

**Steps:**
1. Enable WAL archiving
2. Create base backup
3. Configure recovery
4. Restore to point in time

### Q4: Replication types?

**Streaming Replication:**
- Physical replication
- Master-slave
- Real-time

**Logical Replication:**
- Table-level
- More flexible
- Can filter

### Q5: WAL archiving?

**WAL Archiving:**
- Log of all changes
- Required for PITR
- Continuous backup

---

## Best Practices

1. **Regular Backups**: Full backups regularly
2. **WAL Archiving**: Enable for PITR
3. **Test Restores**: Verify backup integrity
4. **Monitor Backups**: Ensure backups succeed
5. **Multiple Copies**: Store backups in multiple locations

---

## Bài tập thực hành

### Bài 1: Backup và Restore

```bash
# Yêu cầu:
# 1. Create database với data
# 2. Create backup
# 3. Drop database
# 4. Restore from backup
# 5. Verify data
```

### Bài 2: PITR

```bash
# Yêu cầu:
# 1. Enable WAL archiving
# 2. Create base backup
# 3. Make changes
# 4. Restore to point in time
# 5. Verify recovery
```

---

## Tổng kết

- **Backup Types**: Full, incremental (WAL)
- **pg_dump**: Backup single database
- **pg_restore**: Restore from backup
- **PITR**: Point-in-time recovery
- **WAL Archiving**: Continuous backup
- **Replication**: Streaming, logical
- **Disaster Recovery**: Recovery procedures
