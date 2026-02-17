# Transactions và Concurrency - Câu hỏi phỏng vấn JPA

## Mục lục
1. [@Transactional](#transactional)
2. [Transaction Propagation](#transaction-propagation)
3. [Isolation Levels](#isolation-levels)
4. [Optimistic Locking](#optimistic-locking)
5. [Pessimistic Locking](#pessimistic-locking)
6. [Transaction Timeout](#transaction-timeout)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## @Transactional

### Basic Usage

```java
@Service
@Transactional  // Class-level: All methods transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    @Transactional(readOnly = true)  // Override class-level
    public User findUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

### Method-level @Transactional

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    @Transactional(readOnly = true)
    public User findUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @Transactional(rollbackFor = Exception.class)
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

### @Transactional Attributes

```java
@Transactional(
    propagation = Propagation.REQUIRED,      // Default
    isolation = Isolation.READ_COMMITTED,     // Default
    timeout = 30,                             // Seconds
    readOnly = false,                         // Default
    rollbackFor = {SQLException.class},       // Rollback on these exceptions
    noRollbackFor = {IllegalArgumentException.class}  // Don't rollback on these
)
public void method() {
    // ...
}
```

---

## Transaction Propagation

### Propagation Types

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService self;  // For self-invocation
    
    // REQUIRED (Default): Join existing or create new
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        userRepository.save(new User());
        self.method2();  // Joins existing transaction
    }
    
    // REQUIRES_NEW: Always create new transaction
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // New transaction, independent of method1
        // If method2 fails, method1 still commits
        userRepository.save(new User());
    }
    
    // SUPPORTS: Join if exists, no transaction if not
    @Transactional(propagation = Propagation.SUPPORTS)
    public void method3() {
        // Works with or without transaction
    }
    
    // MANDATORY: Must have existing transaction
    @Transactional(propagation = Propagation.MANDATORY)
    public void method4() {
        // Throws exception if no transaction
    }
    
    // NOT_SUPPORTED: Suspend existing transaction
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void method5() {
        // Runs without transaction (even if one exists)
    }
    
    // NEVER: Must not have transaction
    @Transactional(propagation = Propagation.NEVER)
    public void method6() {
        // Throws exception if transaction exists
    }
    
    // NESTED: Nested transaction (savepoint)
    @Transactional(propagation = Propagation.NESTED)
    public void method7() {
        // Creates savepoint
        // If fails, rollback to savepoint (not entire transaction)
    }
}
```

### Propagation Scenarios

```java
// Scenario 1: REQUIRED
@Transactional
public void outer() {
    inner();  // Joins outer transaction
}

@Transactional(propagation = Propagation.REQUIRED)
public void inner() {
    // Same transaction as outer
}

// Scenario 2: REQUIRES_NEW
@Transactional
public void outer() {
    inner();  // New transaction
    // If inner fails, outer still commits
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void inner() {
    // Independent transaction
}

// Scenario 3: NESTED
@Transactional
public void outer() {
    inner();  // Nested transaction (savepoint)
    // If inner fails, rollback to savepoint
}

@Transactional(propagation = Propagation.NESTED)
public void inner() {
    // Nested transaction
}
```

---

## Isolation Levels

### Isolation Level Types

```java
@Service
public class UserService {
    // READ_UNCOMMITTED: Lowest isolation, dirty reads possible
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public User readUncommitted(Long id) {
        // Can read uncommitted data from other transactions
        return userRepository.findById(id).orElse(null);
    }
    
    // READ_COMMITTED (Default): No dirty reads
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public User readCommitted(Long id) {
        // Can only read committed data
        // Non-repeatable reads possible
        return userRepository.findById(id).orElse(null);
    }
    
    // REPEATABLE_READ: No non-repeatable reads
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public User repeatableRead(Long id) {
        // Same query returns same result within transaction
        // Phantom reads possible
        return userRepository.findById(id).orElse(null);
    }
    
    // SERIALIZABLE: Highest isolation, no phantom reads
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public User serializable(Long id) {
        // Highest isolation, prevents all anomalies
        // Lowest concurrency
        return userRepository.findById(id).orElse(null);
    }
}
```

### Isolation Level Problems

**Dirty Read:**
```
Transaction 1: UPDATE users SET balance = 1000 WHERE id = 1
Transaction 2: SELECT balance FROM users WHERE id = 1  -- Reads 1000 (uncommitted)
Transaction 1: ROLLBACK
Transaction 2: Has wrong data (1000 instead of original value)
```

**Non-Repeatable Read:**
```
Transaction 1: SELECT balance FROM users WHERE id = 1  -- Returns 500
Transaction 2: UPDATE users SET balance = 1000 WHERE id = 1
Transaction 2: COMMIT
Transaction 1: SELECT balance FROM users WHERE id = 1  -- Returns 1000 (different!)
```

**Phantom Read:**
```
Transaction 1: SELECT COUNT(*) FROM users WHERE age > 18  -- Returns 10
Transaction 2: INSERT INTO users (age) VALUES (20)
Transaction 2: COMMIT
Transaction 1: SELECT COUNT(*) FROM users WHERE age > 18  -- Returns 11 (phantom row)
```

---

## Optimistic Locking

### @Version

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    
    @Version  // Optimistic locking
    private Long version;  // Auto-incremented on update
}

// Usage
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User updateUser(Long id, String newUsername) {
        User user = userRepository.findById(id).orElse(null);
        user.setUsername(newUsername);
        return userRepository.save(user);
        // If version changed, throws OptimisticLockException
    }
}
```

### Optimistic Locking Flow

```
Thread 1: Read User (version = 1)
Thread 2: Read User (version = 1)
Thread 1: Update User (version = 2) - SUCCESS
Thread 2: Update User (version = 1) - FAILS (OptimisticLockException)
```

### Handling OptimisticLockException

```java
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User updateUserWithRetry(Long id, String newUsername) {
        int maxRetries = 3;
        int retry = 0;
        
        while (retry < maxRetries) {
            try {
                User user = userRepository.findById(id).orElse(null);
                user.setUsername(newUsername);
                return userRepository.save(user);
            } catch (OptimisticLockException e) {
                retry++;
                if (retry >= maxRetries) {
                    throw new RuntimeException("Update failed after retries", e);
                }
                // Wait and retry
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        return null;
    }
}
```

---

## Pessimistic Locking

### Pessimistic Lock Types

```java
// PESSIMISTIC_READ: Shared lock (SELECT ... FOR SHARE)
@Lock(LockModeType.PESSIMISTIC_READ)
@Query("SELECT u FROM User u WHERE u.id = :id")
User findByIdForRead(@Param("id") Long id);

// PESSIMISTIC_WRITE: Exclusive lock (SELECT ... FOR UPDATE)
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT u FROM User u WHERE u.id = :id")
User findByIdForUpdate(@Param("id") Long id);

// PESSIMISTIC_FORCE_INCREMENT: Lock + increment version
@Lock(LockModeType.PESSIMISTIC_FORCE_INCREMENT)
@Query("SELECT u FROM User u WHERE u.id = :id")
User findByIdForForceIncrement(@Param("id") Long id);
```

### Pessimistic Locking với EntityManager

```java
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public User updateUserWithLock(Long id, String newUsername) {
        // Acquire pessimistic lock
        User user = em.find(User.class, id, LockModeType.PESSIMISTIC_WRITE);
        user.setUsername(newUsername);
        return user;
        // Lock released on commit
    }
    
    public User updateUserWithTimeout(Long id, String newUsername) {
        Map<String, Object> properties = new HashMap<>();
        properties.put("javax.persistence.lock.timeout", 5000);  // 5 seconds
        
        User user = em.find(User.class, id, LockModeType.PESSIMISTIC_WRITE, properties);
        user.setUsername(newUsername);
        return user;
    }
}
```

### Pessimistic Locking Flow

```
Thread 1: SELECT ... FOR UPDATE (acquires lock)
Thread 2: SELECT ... FOR UPDATE (waits for lock)
Thread 1: UPDATE, COMMIT (releases lock)
Thread 2: Gets lock, proceeds
```

---

## Transaction Timeout

### Timeout Configuration

```java
@Service
public class UserService {
    @Transactional(timeout = 30)  // 30 seconds
    public void longRunningOperation() {
        // Fails if takes more than 30 seconds
    }
    
    @Transactional(timeout = 5)
    public void quickOperation() {
        // Fails if takes more than 5 seconds
    }
}
```

### Timeout với EntityManager

```java
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public void operationWithTimeout() {
        Query query = em.createQuery("SELECT u FROM User u");
        query.setHint("javax.persistence.query.timeout", 5000);  // 5 seconds
        List<User> users = query.getResultList();
    }
}
```

---

## Câu hỏi thường gặp

### Q1: @Transactional không hoạt động?

```java
// Problem: Self-invocation
@Service
public class UserService {
    @Transactional
    public void method1() {
        method2();  // @Transactional không hoạt động!
    }
    
    @Transactional
    public void method2() {
        // Not in transaction
    }
}

// Solution 1: Use self injection
@Service
public class UserService {
    @Autowired
    private UserService self;
    
    public void method1() {
        self.method2();  // Works!
    }
    
    @Transactional
    public void method2() {
        // In transaction
    }
}

// Solution 2: Move to different class
@Service
public class UserService {
    @Autowired
    private UserTransactionService transactionService;
    
    public void method1() {
        transactionService.method2();  // Works!
    }
}
```

### Q2: readOnly = true có tác dụng gì?

```java
@Transactional(readOnly = true)
public User findUser(Long id) {
    // Benefits:
    // 1. Hints to database for optimization
    // 2. Prevents flush (no dirty checking)
    // 3. Can use read replicas
    return userRepository.findById(id).orElse(null);
}
```

### Q3: Optimistic vs Pessimistic Locking?

| Feature | Optimistic | Pessimistic |
|---------|-----------|-------------|
| **Lock Type** | Version-based | Database lock |
| **Performance** | Better (no blocking) | Worse (blocking) |
| **Conflict Detection** | On commit | On lock acquisition |
| **Use Case** | Low contention | High contention |
| **Exception** | OptimisticLockException | LockTimeoutException |

### Q4: Transaction Propagation trong nested calls?

```java
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService;
    
    @Transactional
    public void createOrder(Order order) {
        // Transaction 1 starts
        orderRepository.save(order);
        
        try {
            paymentService.processPayment(order.getAmount());
            // If REQUIRES_NEW: New transaction
            // If REQUIRED: Same transaction
        } catch (Exception e) {
            // If REQUIRES_NEW: Order still saved
            // If REQUIRED: Order rolled back
        }
        // Transaction 1 commits/rolls back
    }
}
```

### Q5: Isolation Level Selection?

**READ_COMMITTED (Default):**
- Most databases default
- Good balance
- Use for most cases

**REPEATABLE_READ:**
- When need consistent reads
- MySQL default
- Higher overhead

**SERIALIZABLE:**
- Highest consistency
- Lowest concurrency
- Use only when necessary

---

## Best Practices

1. **Use @Transactional** at service layer
2. **Use readOnly = true** for read operations
3. **Choose appropriate propagation** based on use case
4. **Use optimistic locking** for low contention
5. **Use pessimistic locking** for high contention
6. **Set timeout** for long operations
7. **Handle OptimisticLockException** with retry
8. **Avoid self-invocation** issues

---

## Bài tập thực hành

### Bài 1: Transaction Propagation

```java
// Yêu cầu: Implement nested transactions với different propagations
// Demonstrate: REQUIRED, REQUIRES_NEW, NESTED
```

### Bài 2: Optimistic Locking

```java
// Yêu cầu: Implement optimistic locking với retry mechanism
// Handle OptimisticLockException
```

---

## Tổng kết

- **@Transactional**: Declarative transaction management
- **Propagation**: REQUIRED, REQUIRES_NEW, NESTED, etc.
- **Isolation**: READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
- **Optimistic Locking**: @Version, OptimisticLockException
- **Pessimistic Locking**: @Lock, database locks
- **Timeout**: Transaction timeout configuration
- **Best Practices**: Appropriate use of each feature
