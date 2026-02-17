# Transactions và ACID - Câu hỏi phỏng vấn

## Mục lục
1. [Transaction là gì?](#transaction-là-gì)
2. [ACID Properties](#acid-properties)
3. [Transaction Isolation Levels](#transaction-isolation-levels)
4. [Locking](#locking)
5. [Deadlocks](#deadlocks)
6. [Concurrency Control](#concurrency-control)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Transaction là gì?

### Transaction (Giao dịch)

**Định nghĩa:**
- Transaction là một sequence of database operations
- Được thực thi như một single unit of work
- Tất cả operations phải succeed hoặc tất cả phải fail (all or nothing)

### Characteristics

1. **Atomicity**: Tất cả hoặc không có gì
2. **Consistency**: Database ở valid state
3. **Isolation**: Transactions không ảnh hưởng lẫn nhau
4. **Durability**: Changes persist sau khi commit

### Transaction Syntax

```sql
-- Begin transaction
BEGIN;  -- hoặc START TRANSACTION

-- Operations
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- Commit (save changes)
COMMIT;

-- Rollback (undo changes)
ROLLBACK;
```

### Example: Money Transfer

```sql
-- Transfer $100 from account 1 to account 2
BEGIN;

-- Deduct from sender
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- Add to receiver
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If both succeed, commit
COMMIT;

-- If any fails, rollback
-- ROLLBACK;
```

**Without Transaction:**
```sql
-- ❌ Bad: Not atomic
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- If this fails, account 1 already deducted but account 2 not credited
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
```

---

## ACID Properties

### ACID là gì?

**ACID** là 4 properties đảm bảo database transactions reliable:

- **A**tomicity
- **C**onsistency
- **I**solation
- **D**urability

### 1. Atomicity (Tính nguyên tử)

**Định nghĩa:**
- Transaction là atomic unit
- Tất cả operations trong transaction phải succeed hoặc tất cả fail
- Không có partial execution

**Ví dụ:**
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- If second UPDATE fails, first UPDATE is rolled back
COMMIT;
```

**Implementation:**
- Database logs all changes
- On failure, rollback using logs
- On success, commit all changes

### 2. Consistency (Tính nhất quán)

**Định nghĩa:**
- Database chuyển từ một consistent state sang consistent state khác
- Constraints và rules được maintain
- No data corruption

**Ví dụ:**
```sql
-- Constraint: balance >= 0
BEGIN;
UPDATE accounts SET balance = balance - 150 WHERE id = 1;
-- If balance becomes negative, transaction fails (constraint violation)
COMMIT;
```

**Consistency Rules:**
- Primary keys unique
- Foreign keys valid
- Check constraints satisfied
- Business rules enforced

### 3. Isolation (Tính cô lập)

**Định nghĩa:**
- Concurrent transactions không ảnh hưởng lẫn nhau
- Each transaction sees consistent snapshot
- Controlled by isolation levels

**Ví dụ:**
```sql
-- Transaction 1
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Reads 1000
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- Not yet committed

-- Transaction 2 (concurrent)
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Still sees 1000 (isolation)
-- Transaction 2 doesn't see uncommitted changes from Transaction 1
```

**Isolation Levels:**
- READ UNCOMMITTED
- READ COMMITTED
- REPEATABLE READ
- SERIALIZABLE

### 4. Durability (Tính bền vững)

**Định nghĩa:**
- Committed changes persist
- Survive system crashes
- Written to non-volatile storage

**Ví dụ:**
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;  -- Changes written to disk, survive crash
```

**Implementation:**
- Write-Ahead Logging (WAL)
- Changes logged before commit
- On recovery, replay logs

---

## Transaction Isolation Levels

### Isolation Levels Overview

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|------------|---------------------|--------------|
| **READ UNCOMMITTED** | ✅ Possible | ✅ Possible | ✅ Possible |
| **READ COMMITTED** | ❌ No | ✅ Possible | ✅ Possible |
| **REPEATABLE READ** | ❌ No | ❌ No | ✅ Possible |
| **SERIALIZABLE** | ❌ No | ❌ No | ❌ No |

### 1. READ UNCOMMITTED

**Đặc điểm:**
- Lowest isolation level
- Allows dirty reads
- No locks on reads
- Fastest but least safe

**Ví dụ:**
```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Not yet committed

-- Transaction 2 (READ UNCOMMITTED)
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Reads 1000 (dirty read)
-- Sees uncommitted data from Transaction 1
```

**Problems:**
- Dirty reads: Read uncommitted data
- Data inconsistency

### 2. READ COMMITTED

**Đặc điểm:**
- Default level trong nhiều databases
- Prevents dirty reads
- Allows non-repeatable reads
- Locks rows during write

**Ví dụ:**
```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Not yet committed

-- Transaction 2 (READ COMMITTED)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Waits or reads old value
-- Cannot see uncommitted data

-- Transaction 1 commits
COMMIT;

-- Transaction 2 reads again
SELECT balance FROM accounts WHERE id = 1;  -- Now sees 1000 (non-repeatable read)
```

**Problems:**
- Non-repeatable reads: Same query returns different results

### 3. REPEATABLE READ

**Đặc điểm:**
- Prevents dirty reads và non-repeatable reads
- Maintains snapshot throughout transaction
- Allows phantom reads
- Uses row-level locks

**Ví dụ:**
```sql
-- Transaction 1
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Reads 500

-- Transaction 2 (concurrent)
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction 1 reads again
SELECT balance FROM accounts WHERE id = 1;  -- Still reads 500 (repeatable)
-- Sees same snapshot
```

**Problems:**
- Phantom reads: New rows appear in range queries

### 4. SERIALIZABLE

**Đặc điểm:**
- Highest isolation level
- Prevents all anomalies
- Transactions execute serially
- Slowest but safest

**Ví dụ:**
```sql
-- Transaction 1
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT * FROM accounts WHERE balance > 1000;
-- Locks range

-- Transaction 2 (concurrent)
BEGIN;
INSERT INTO accounts (id, balance) VALUES (3, 1500);
-- Waits for Transaction 1 to complete
```

**Benefits:**
- No anomalies
- Complete isolation

**Drawbacks:**
- Slowest performance
- More deadlocks

### Setting Isolation Level

```sql
-- PostgreSQL
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
-- Transaction operations
COMMIT;

-- MySQL
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
-- Transaction operations
COMMIT;
```

---

## Locking

### Locks (Khóa)

**Định nghĩa:**
- Locks prevent concurrent access conflicts
- Ensure data consistency
- Types: Shared (read) và Exclusive (write)

### Lock Types

#### 1. Shared Lock (Read Lock)

**Đặc điểm:**
- Multiple transactions can hold
- Allows reads, prevents writes
- Released after read

```sql
-- Shared lock on read
SELECT * FROM accounts WHERE id = 1;
-- Other transactions can also read
```

#### 2. Exclusive Lock (Write Lock)

**Đặc điểm:**
- Only one transaction can hold
- Prevents reads and writes
- Released after commit/rollback

```sql
-- Exclusive lock on write
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Other transactions cannot read or write
```

### Lock Granularity

#### Row-Level Locks

```sql
-- Lock specific row
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Only row with id = 1 is locked
```

#### Table-Level Locks

```sql
-- Lock entire table
LOCK TABLE accounts;
-- All rows locked
```

### Lock Modes

```sql
-- PostgreSQL: Explicit locking
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;  -- Exclusive lock
-- Other transactions cannot modify this row
COMMIT;

-- FOR SHARE: Shared lock
SELECT * FROM accounts WHERE id = 1 FOR SHARE;
```

### Deadlocks

**Định nghĩa:**
- Two transactions waiting for each other
- Circular dependency
- Database detects và resolves

**Ví dụ:**
```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- Locks row 1
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- Waits for lock on row 2

-- Transaction 2 (concurrent)
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 2;  -- Locks row 2
UPDATE accounts SET balance = balance + 100 WHERE id = 1;  -- Waits for lock on row 1

-- Deadlock! Both waiting for each other
-- Database kills one transaction
```

**Prevention:**
- Acquire locks in same order
- Keep transactions short
- Use lower isolation levels when possible

---

## Deadlocks

### Deadlock Detection

**Database automatically detects deadlocks:**
- Monitors lock waits
- Detects circular dependencies
- Kills one transaction (victim)
- Other transaction proceeds

### Deadlock Prevention

#### 1. Lock Ordering

```sql
-- ✅ Good: Always lock in same order
-- Transaction 1
UPDATE accounts SET ... WHERE id = 1;
UPDATE accounts SET ... WHERE id = 2;

-- Transaction 2
UPDATE accounts SET ... WHERE id = 1;  -- Same order
UPDATE accounts SET ... WHERE id = 2;
```

#### 2. Short Transactions

```sql
-- ✅ Good: Short transaction
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- ❌ Bad: Long transaction
BEGIN;
-- Many operations
-- Long wait time increases deadlock risk
COMMIT;
```

#### 3. Lower Isolation Level

```sql
-- Use lower isolation when possible
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- Fewer locks = fewer deadlocks
```

### Handling Deadlocks

```sql
-- Application should retry on deadlock
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- If deadlock error, retry transaction
COMMIT;
```

---

## Concurrency Control

### Concurrency Problems

#### 1. Dirty Read

**Định nghĩa:**
- Read uncommitted data
- Data may be rolled back

```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = 1000 WHERE id = 1;
-- Not committed

-- Transaction 2 (READ UNCOMMITTED)
SELECT balance FROM accounts WHERE id = 1;  -- Reads 1000
-- Transaction 1 rolls back
-- Transaction 2 has wrong data
```

**Solution:** READ COMMITTED or higher

#### 2. Non-Repeatable Read

**Định nghĩa:**
- Same query returns different results
- Data changed between reads

```sql
-- Transaction 1
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- Reads 500

-- Transaction 2
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;

-- Transaction 1
SELECT balance FROM accounts WHERE id = 1;  -- Reads 1000 (different!)
```

**Solution:** REPEATABLE READ or higher

#### 3. Phantom Read

**Định nghĩa:**
- New rows appear in range query
- Same query returns more rows

```sql
-- Transaction 1
BEGIN;
SELECT * FROM accounts WHERE balance > 1000;  -- Returns 2 rows

-- Transaction 2
INSERT INTO accounts (id, balance) VALUES (3, 1500);
COMMIT;

-- Transaction 1
SELECT * FROM accounts WHERE balance > 1000;  -- Returns 3 rows (phantom!)
```

**Solution:** SERIALIZABLE

### Optimistic vs Pessimistic Locking

#### Optimistic Locking

**Đặc điểm:**
- Assume no conflicts
- Check version/timestamp on update
- Rollback if conflict detected

```sql
-- Add version column
ALTER TABLE accounts ADD version INT DEFAULT 0;

-- Update with version check
UPDATE accounts 
SET balance = 1000, version = version + 1
WHERE id = 1 AND version = 0;
-- If version changed, update fails (conflict detected)
```

#### Pessimistic Locking

**Đặc điểm:**
- Lock data before access
- Prevent conflicts
- Slower but safer

```sql
-- Lock row
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- Other transactions cannot modify
UPDATE accounts SET balance = 1000 WHERE id = 1;
COMMIT;
```

---

## Câu hỏi thường gặp

### Q1: ACID properties là gì?

**ACID:**
- **Atomicity**: All or nothing
- **Consistency**: Valid state transitions
- **Isolation**: Transactions don't interfere
- **Durability**: Committed changes persist

### Q2: Isolation levels khác nhau như thế nào?

| Level | Dirty Read | Non-Repeatable | Phantom |
|-------|------------|----------------|---------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ | ❌ | ❌ | ✅ |
| SERIALIZABLE | ❌ | ❌ | ❌ |

### Q3: Khi nào dùng isolation level nào?

**READ COMMITTED:**
- Default, good balance
- Most applications

**REPEATABLE READ:**
- Need consistent reads
- Financial transactions

**SERIALIZABLE:**
- Critical data
- Can't tolerate anomalies

**READ UNCOMMITTED:**
- Rarely used
- Reporting only

### Q4: Deadlock là gì và làm sao tránh?

**Deadlock:**
- Two transactions waiting for each other
- Circular dependency

**Prevention:**
- Lock in same order
- Keep transactions short
- Use lower isolation when possible

### Q5: Optimistic vs Pessimistic locking?

**Optimistic:**
- Assume no conflicts
- Check version on update
- Good for low contention

**Pessimistic:**
- Lock before access
- Prevent conflicts
- Good for high contention

### Q6: Transaction rollback làm gì?

**ROLLBACK:**
- Undo all changes in transaction
- Restore database to state before BEGIN
- Release all locks

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
ROLLBACK;  -- Changes undone, balance restored
```

---

## Best Practices

1. **Keep Transactions Short**: Reduce lock time
2. **Use Appropriate Isolation**: Balance safety vs performance
3. **Lock in Same Order**: Prevent deadlocks
4. **Handle Deadlocks**: Retry on deadlock errors
5. **Use Indexes**: Faster queries = shorter locks
6. **Avoid Long-Running Queries**: In transactions
7. **Commit Early**: Release locks quickly

---

## Bài tập thực hành

### Bài 1: Transaction Implementation

```sql
-- Yêu cầu: Implement money transfer với proper transaction
-- 1. Begin transaction
-- 2. Deduct from sender
-- 3. Add to receiver
-- 4. Check constraints
-- 5. Commit or rollback
```

### Bài 2: Isolation Levels

```sql
-- Yêu cầu: Test các isolation levels
-- 1. Create concurrent transactions
-- 2. Test dirty reads, non-repeatable reads, phantom reads
-- 3. Observe behavior at different isolation levels
```

### Bài 3: Deadlock Prevention

```sql
-- Yêu cầu: Implement deadlock prevention
-- 1. Design lock ordering strategy
-- 2. Implement retry logic
-- 3. Test with concurrent transactions
```

---

## Tổng kết

- **Transactions**: Atomic units of work
- **ACID**: Atomicity, Consistency, Isolation, Durability
- **Isolation Levels**: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE
- **Locking**: Shared và Exclusive locks
- **Deadlocks**: Circular dependencies, prevent with lock ordering
- **Concurrency Control**: Optimistic vs Pessimistic locking
