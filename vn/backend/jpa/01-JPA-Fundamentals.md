# JPA Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [JPA vs Hibernate](#jpa-vs-hibernate)
2. [Entity và Annotations](#entity-và-annotations)
3. [Entity Lifecycle](#entity-lifecycle)
4. [Persistence Context](#persistence-context)
5. [EntityManager](#entitymanager)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## JPA vs Hibernate

### JPA (Java Persistence API)

**Định nghĩa:**
- JPA là **specification** (interface) cho ORM trong Java
- Part of Jakarta EE (trước đây là Java EE)
- Định nghĩa standard APIs cho persistence

**Implementations:**
- Hibernate (phổ biến nhất)
- EclipseLink
- OpenJPA
- DataNucleus

### Hibernate

**Định nghĩa:**
- Hibernate là **implementation** của JPA
- Có thể dùng standalone hoặc như JPA provider
- Cung cấp thêm features ngoài JPA spec

### So sánh

| Feature | JPA | Hibernate |
|---------|-----|-----------|
| **Type** | Specification | Implementation |
| **Portability** | High (switch providers) | Low (vendor-specific) |
| **Features** | Standard only | Extended features |
| **Learning** | Easier (standard) | More complex |

### Khi nào dùng gì?

**Dùng JPA:**
- Cần portability giữa providers
- Chỉ cần standard features
- Team mới với JPA

**Dùng Hibernate:**
- Cần advanced features (caching, filters, etc.)
- Đã quen với Hibernate
- Performance-critical applications

---

## Entity và Annotations

### Basic Entity

```java
@Entity
@Table(name = "users", schema = "public")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    // Default constructor (required)
    public User() {}
    
    // Getters and setters
}
```

### @Entity

```java
@Entity(name = "UserEntity")  // Entity name (default: class name)
@Table(name = "users")         // Table name
public class User {
    // ...
}

// Usage in JPQL
// SELECT u FROM UserEntity u  (uses entity name)
// SELECT u FROM User u        (uses class name if no entity name)
```

### @Id và @GeneratedValue

```java
@Entity
public class User {
    // Strategy 1: IDENTITY (Auto-increment)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Strategy 2: SEQUENCE
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "user_sequence", allocationSize = 1)
    private Long id;
    
    // Strategy 3: TABLE
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE, generator = "user_gen")
    @TableGenerator(name = "user_gen", table = "id_generator", pkColumnName = "gen_name", valueColumnName = "gen_value")
    private Long id;
    
    // Strategy 4: AUTO (Let JPA choose)
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
}
```

**So sánh Strategies:**

| Strategy | Database Support | Performance | Use Case |
|----------|----------------|--------------|----------|
| **IDENTITY** | MySQL, SQL Server, PostgreSQL | Good | Simple, auto-increment |
| **SEQUENCE** | Oracle, PostgreSQL | Best | High performance |
| **TABLE** | All databases | Worst | Portability |
| **AUTO** | All databases | Varies | Let JPA decide |

### @Column

```java
@Entity
public class User {
    @Column(
        name = "user_name",           // Column name in DB
        nullable = false,              // NOT NULL constraint
        unique = true,                 // UNIQUE constraint
        length = 100,                  // VARCHAR(100)
        precision = 10,                // For DECIMAL
        scale = 2,                     // For DECIMAL
        insertable = true,             // Include in INSERT
        updatable = true,              // Include in UPDATE
        columnDefinition = "VARCHAR(100) DEFAULT 'unknown'"  // Custom SQL
    )
    private String userName;
    
    // @Column không cần thiết nếu tên giống nhau
    private String email;  // Maps to "email" column
}
```

### @Temporal

```java
@Entity
public class User {
    @Temporal(TemporalType.DATE)       // java.sql.Date
    private Date birthDate;
    
    @Temporal(TemporalType.TIME)       // java.sql.Time
    private Date startTime;
    
    @Temporal(TemporalType.TIMESTAMP)  // java.sql.Timestamp
    private Date createdAt;
    
    // Java 8+: Không cần @Temporal
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "start_time")
    private LocalTime startTime;
}
```

### @Enumerated

```java
public enum UserRole {
    ADMIN, USER, GUEST
}

@Entity
public class User {
    // Store as string: "ADMIN", "USER", "GUEST"
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    // Store as ordinal: 0, 1, 2
    @Enumerated(EnumType.ORDINAL)
    private UserRole role2;
}

// Best Practice: Use STRING (safer, readable)
// ORDINAL: Breaks if enum order changes
```

### @Lob

```java
@Entity
public class Article {
    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;  // Large text
    
    @Lob
    @Column(name = "image", columnDefinition = "BLOB")
    private byte[] image;  // Binary data
}
```

### @Transient

```java
@Entity
public class User {
    @Id
    private Long id;
    
    private String firstName;
    private String lastName;
    
    @Transient  // Not persisted to database
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
```

---

## Entity Lifecycle

### States

```java
// 1. NEW (Transient)
User user = new User();
user.setUsername("john");
// Not in persistence context
// No database representation

// 2. MANAGED (Persistent)
EntityManager em = entityManagerFactory.createEntityManager();
em.getTransaction().begin();
em.persist(user);  // Becomes MANAGED
// In persistence context
// Tracked by JPA
// Changes automatically synced to DB

// 3. DETACHED
em.detach(user);  // Or em.close(), em.clear()
// Has database representation
// Not in persistence context
// Changes NOT synced

// 4. REMOVED
em.remove(user);  // Marked for deletion
// Will be deleted on flush/commit
```

### State Transitions

```
NEW (Transient)
  ↓ persist()
MANAGED (Persistent)
  ↓ detach() / close() / clear()
DETACHED
  ↓ merge()
MANAGED (Persistent)
  ↓ remove()
REMOVED
  ↓ flush() / commit()
DELETED from DB
```

### Methods

```java
EntityManager em = entityManagerFactory.createEntityManager();
em.getTransaction().begin();

// persist(): Make entity MANAGED
User user = new User();
user.setUsername("john");
em.persist(user);  // NEW → MANAGED

// find(): Load entity (MANAGED)
User found = em.find(User.class, 1L);  // Returns MANAGED entity

// merge(): DETACHED → MANAGED
User detached = ...;  // DETACHED
User merged = em.merge(detached);  // Returns new MANAGED entity

// remove(): MANAGED → REMOVED
em.remove(user);  // Marked for deletion

// detach(): MANAGED → DETACHED
em.detach(user);  // Remove from persistence context

// refresh(): Reload from database
em.refresh(user);  // Sync with database

// flush(): Sync changes to database (but don't commit)
em.flush();  // Execute SQL immediately

em.getTransaction().commit();
```

---

## Persistence Context

### Định nghĩa

**Persistence Context** là set của managed entity instances trong EntityManager.

### Characteristics

1. **Identity**: Mỗi entity instance có unique identity trong context
2. **Tracking**: JPA tracks changes to managed entities
3. **Automatic Sync**: Changes synced to database on flush/commit
4. **Scope**: Tied to EntityManager lifecycle

### First-Level Cache

```java
EntityManager em = entityManagerFactory.createEntityManager();

// First call: Query database
User user1 = em.find(User.class, 1L);

// Second call: Return from cache (no query)
User user2 = em.find(User.class, 1L);

// user1 == user2 (same instance)
assert user1 == user2;  // true
```

### Dirty Checking

```java
EntityManager em = entityManagerFactory.createEntityManager();
em.getTransaction().begin();

User user = em.find(User.class, 1L);
user.setUsername("newName");  // Modify entity

// No explicit update() call needed!
// JPA automatically detects changes (dirty checking)
em.getTransaction().commit();  // UPDATE executed automatically
```

---

## EntityManager

### Operations

```java
EntityManager em = entityManagerFactory.createEntityManager();

try {
    em.getTransaction().begin();
    
    // CRUD Operations
    // Create
    User user = new User();
    user.setUsername("john");
    em.persist(user);
    
    // Read
    User found = em.find(User.class, 1L);
    
    // Update (automatic with dirty checking)
    found.setUsername("newName");
    
    // Delete
    em.remove(found);
    
    // Query
    List<User> users = em.createQuery("SELECT u FROM User u", User.class)
        .getResultList();
    
    em.getTransaction().commit();
} catch (Exception e) {
    em.getTransaction().rollback();
} finally {
    em.close();
}
```

### EntityManagerFactory vs EntityManager

```java
// EntityManagerFactory: Heavyweight, thread-safe, expensive to create
EntityManagerFactory emf = Persistence.createEntityManagerFactory("myPU");

// EntityManager: Lightweight, NOT thread-safe, cheap to create
EntityManager em1 = emf.createEntityManager();
EntityManager em2 = emf.createEntityManager();

// Each EntityManager has its own Persistence Context
// Close when done
em1.close();
em2.close();
emf.close();
```

### Container-Managed vs Application-Managed

**Container-Managed (Spring):**
```java
@Service
public class UserService {
    @PersistenceContext
    private EntityManager em;  // Injected by container
    
    public void saveUser(User user) {
        em.persist(user);  // Transaction managed by container
    }
}
```

**Application-Managed:**
```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("myPU");
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
// ... operations
em.getTransaction().commit();
em.close();
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa persist() và merge()?

```java
// persist(): For NEW entities
User newUser = new User();
newUser.setUsername("john");
em.persist(newUser);  // NEW → MANAGED
// Throws exception if entity already exists

// merge(): For DETACHED entities
User detached = ...;  // DETACHED
User merged = em.merge(detached);  // DETACHED → MANAGED
// Returns new MANAGED instance
// Original detached entity remains DETACHED
```

### Q2: Khi nào dùng find() vs getReference()?

```java
// find(): Eager loading
User user = em.find(User.class, 1L);  // Executes SELECT immediately
// Returns null if not found

// getReference(): Lazy loading (proxy)
User user = em.getReference(User.class, 1L);  // Returns proxy, no SELECT
// Throws EntityNotFoundException when accessed if not found
String name = user.getUsername();  // SELECT executed here
```

### Q3: flush() vs commit()?

```java
// flush(): Sync changes to database, but don't commit transaction
em.flush();  // Executes SQL, but transaction still open
// Can rollback after flush

// commit(): Commit transaction (includes flush)
em.getTransaction().commit();  // Flush + commit
// Cannot rollback after commit
```

### Q4: clear() vs detach() vs close()?

```java
// clear(): Detach ALL entities in persistence context
em.clear();  // All entities become DETACHED
// EntityManager still open

// detach(): Detach specific entity
em.detach(user);  // Only this entity becomes DETACHED

// close(): Close EntityManager
em.close();  // All entities become DETACHED, EntityManager closed
```

### Q5: Entity Lifecycle trong Spring?

```java
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public User createUser() {
        User user = new User();  // NEW
        user.setUsername("john");
        em.persist(user);  // NEW → MANAGED
        return user;  // Still MANAGED (transaction not committed yet)
    }
    
    public User updateUser(Long id) {
        User user = em.find(User.class, id);  // MANAGED
        user.setUsername("newName");  // Dirty checking
        return user;  // Changes synced on commit
    }
    
    public void deleteUser(Long id) {
        User user = em.find(User.class, id);  // MANAGED
        em.remove(user);  // MANAGED → REMOVED
        // Deleted on commit
    }
}
```

### Q6: LazyInitializationException?

```java
// Problem: Accessing lazy relationship outside transaction
@Transactional
public User getUser(Long id) {
    User user = em.find(User.class, id);
    return user;  // Transaction ends here
}

// Later, outside transaction:
User user = getUser(1L);
List<Order> orders = user.getOrders();  // LazyInitializationException!

// Solution 1: Eager fetch
@OneToMany(fetch = FetchType.EAGER)
private List<Order> orders;

// Solution 2: JOIN FETCH
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
User getUserWithOrders(Long id);

// Solution 3: Keep transaction open
@Transactional(readOnly = true)
public User getUserWithOrders(Long id) {
    User user = em.find(User.class, id);
    user.getOrders().size();  // Force load
    return user;
}
```

---

## Best Practices

1. **Use @Entity correctly**: Default constructor, proper annotations
2. **Choose right @GeneratedValue strategy**: IDENTITY for simple, SEQUENCE for performance
3. **Understand Entity Lifecycle**: Know when entity is MANAGED, DETACHED, etc.
4. **Use Persistence Context wisely**: One EntityManager per transaction
5. **Handle LazyInitializationException**: Use JOIN FETCH or keep transaction open
6. **Use @Transactional**: Let Spring manage transactions
7. **Close EntityManager**: Always close in finally block (application-managed)

---

## Bài tập thực hành

### Bài 1: Entity Lifecycle

```java
// Yêu cầu: Implement methods để demonstrate entity lifecycle
// 1. Create new entity (NEW → MANAGED)
// 2. Find entity (MANAGED)
// 3. Update entity (dirty checking)
// 4. Detach entity (MANAGED → DETACHED)
// 5. Merge entity (DETACHED → MANAGED)
// 6. Remove entity (MANAGED → REMOVED)
```

### Bài 2: Persistence Context

```java
// Yêu cầu: Demonstrate persistence context behavior
// 1. Find same entity twice - verify same instance
// 2. Modify entity - verify automatic update
// 3. Clear persistence context - verify detached state
```

---

## Tổng kết

- **JPA**: Specification, Hibernate: Implementation
- **Entity**: @Entity, @Table, @Id, @GeneratedValue, @Column
- **Entity Lifecycle**: NEW, MANAGED, DETACHED, REMOVED
- **Persistence Context**: First-level cache, dirty checking
- **EntityManager**: persist(), find(), merge(), remove()
- **Best Practices**: Proper lifecycle management, transaction handling
