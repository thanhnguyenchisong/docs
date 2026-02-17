# Database và JPA/Hibernate - Câu hỏi phỏng vấn Java

## Mục lục
1. [JPA Overview](#jpa-overview)
2. [Entity và Annotations](#entity-và-annotations)
3. [Entity Relationships](#entity-relationships)
4. [JPA Repository](#jpa-repository)
5. [Query Methods](#query-methods)
6. [Transactions](#transactions)
7. [Performance Optimization](#performance-optimization)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## JPA Overview

### JPA (Java Persistence API)

JPA là specification cho ORM (Object-Relational Mapping) trong Java.

### Hibernate

Hibernate là implementation phổ biến nhất của JPA.

### Benefits

- **Object-oriented**: Làm việc với objects thay vì SQL
- **Database agnostic**: Dễ dàng switch database
- **Automatic SQL generation**
- **Caching**: First-level và second-level cache

---

## Entity và Annotations

### Basic Entity

```java
@Entity
@Table(name = "users")
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
    
    // Getters and setters
}
```

### @Entity

```java
@Entity
public class User {
    // Entity class
}

// Custom table name
@Entity(name = "UserEntity")
@Table(name = "users")
public class User {
    // ...
}
```

### @Id và @GeneratedValue

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;
    
    // Other strategies:
    // GenerationType.AUTO: Let JPA choose
    // GenerationType.SEQUENCE: Use database sequence
    // GenerationType.TABLE: Use table for ID generation
}

// Custom sequence
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(name = "user_seq", sequenceName = "user_sequence", allocationSize = 1)
private Long id;
```

### @Column

```java
@Column(
    name = "user_name",           // Column name in DB
    nullable = false,              // NOT NULL
    unique = true,                 // UNIQUE constraint
    length = 100,                  // VARCHAR(100)
    precision = 10,                // For decimal
    scale = 2,                     // For decimal
    insertable = true,             // Include in INSERT
    updatable = true               // Include in UPDATE
)
private String userName;
```

### @Temporal

```java
@Temporal(TemporalType.DATE)       // java.sql.Date
private Date birthDate;

@Temporal(TemporalType.TIME)       // java.sql.Time
private Date startTime;

@Temporal(TemporalType.TIMESTAMP)  // java.sql.Timestamp
private Date createdAt;

// Java 8+
@Column(name = "created_at")
private LocalDateTime createdAt;  // No @Temporal needed
```

### @Enumerated

```java
public enum UserRole {
    ADMIN, USER, GUEST
}

@Entity
public class User {
    @Enumerated(EnumType.STRING)  // Store as "ADMIN", "USER"
    private UserRole role;
    
    // Or EnumType.ORDINAL: Store as 0, 1, 2
}
```

### @Lob

```java
@Lob
@Column(name = "description", columnDefinition = "TEXT")
private String description;  // Large text

@Lob
@Column(name = "photo", columnDefinition = "BLOB")
private byte[] photo;  // Binary data
```

---

## Entity Relationships

### @OneToMany

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
}

@Entity
public class Order {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

### @ManyToOne

```java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
```

### @ManyToMany

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
}

@Entity
public class Course {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}
```

### @OneToOne

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

@Entity
public class UserProfile {
    @Id
    @GeneratedValue
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
```

### Cascade Types

```java
@OneToMany(cascade = {
    CascadeType.PERSIST,   // Save child when save parent
    CascadeType.MERGE,     // Merge child when merge parent
    CascadeType.REMOVE,    // Delete child when delete parent
    CascadeType.REFRESH,   // Refresh child when refresh parent
    CascadeType.ALL        // All of the above
})
private List<Order> orders;
```

### Fetch Types

```java
// EAGER: Load immediately
@ManyToOne(fetch = FetchType.EAGER)
private User user;

// LAZY: Load when accessed
@ManyToOne(fetch = FetchType.LAZY)
private User user;
```

**Best Practice:** 
- `@ManyToOne`, `@OneToOne`: Default EAGER, nên dùng LAZY
- `@OneToMany`, `@ManyToMany`: Default LAZY

---

## JPA Repository

### Spring Data JPA

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Inherits: save, findById, findAll, delete, etc.
}
```

### Custom Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom methods
    List<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}

// Implementation
@Repository
public class UserRepositoryImpl implements UserRepository {
    @PersistenceContext
    private EntityManager entityManager;
    
    // Custom implementation
}
```

---

## Query Methods

### Method Naming

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Find by field
    User findByUsername(String username);
    List<User> findByEmail(String email);
    
    // Find by multiple fields
    User findByUsernameAndEmail(String username, String email);
    
    // Find with conditions
    List<User> findByAgeGreaterThan(int age);
    List<User> findByAgeBetween(int min, int max);
    List<User> findByUsernameContaining(String keyword);
    List<User> findByUsernameLike(String pattern);
    
    // Find with sorting
    List<User> findByAgeOrderByUsernameAsc(int age);
    
    // Find with pagination
    Page<User> findByAge(int age, Pageable pageable);
    
    // Count
    long countByAge(int age);
    
    // Exists
    boolean existsByEmail(String email);
    
    // Delete
    void deleteByAge(int age);
}
```

### @Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // JPQL
    @Query("SELECT u FROM User u WHERE u.age > :age")
    List<User> findUsersOlderThan(@Param("age") int age);
    
    // Native SQL
    @Query(value = "SELECT * FROM users WHERE age > :age", nativeQuery = true)
    List<User> findUsersOlderThanNative(@Param("age") int age);
    
    // Update
    @Modifying
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmail(@Param("id") Long id, @Param("email") String email);
    
    // Delete
    @Modifying
    @Query("DELETE FROM User u WHERE u.age < :age")
    void deleteUsersYoungerThan(@Param("age") int age);
}
```

### Projection

```java
// Interface projection
public interface UserSummary {
    String getUsername();
    String getEmail();
}

@Query("SELECT u.username as username, u.email as email FROM User u")
List<UserSummary> findUserSummaries();

// Class projection
public class UserDTO {
    private String username;
    private String email;
    
    public UserDTO(String username, String email) {
        this.username = username;
        this.email = email;
    }
}

@Query("SELECT new com.example.dto.UserDTO(u.username, u.email) FROM User u")
List<UserDTO> findUserDTOs();
```

---

## Transactions

### @Transactional

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @Transactional(rollbackFor = Exception.class)
    public User save(User user) {
        return userRepository.save(user);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(String activity) {
        // New transaction
    }
}
```

### Propagation Types

```java
@Transactional(propagation = Propagation.REQUIRED)      // Default: Join existing or create new
@Transactional(propagation = Propagation.REQUIRES_NEW)   // Always create new
@Transactional(propagation = Propagation.SUPPORTS)       // Join if exists, no transaction if not
@Transactional(propagation = Propagation.MANDATORY)      // Must have existing transaction
@Transactional(propagation = Propagation.NOT_SUPPORTED) // Suspend existing transaction
@Transactional(propagation = Propagation.NEVER)         // Must not have transaction
@Transactional(propagation = Propagation.NESTED)       // Nested transaction
```

### Isolation Levels

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED)  // Dirty reads possible
@Transactional(isolation = Isolation.READ_COMMITTED)    // Default: No dirty reads
@Transactional(isolation = Isolation.REPEATABLE_READ)   // No non-repeatable reads
@Transactional(isolation = Isolation.SERIALIZABLE)      // Highest isolation
```

---

## Performance Optimization

### N+1 Problem

```java
// ❌ Bad: N+1 queries
List<User> users = userRepository.findAll();
for (User user : users) {
    List<Order> orders = user.getOrders();  // Query for each user
}

// ✅ Good: Use JOIN FETCH
@Query("SELECT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();

// Or use EntityGraph
@EntityGraph(attributePaths = {"orders"})
List<User> findAll();
```

### Batch Operations

```java
// ❌ Bad: Multiple inserts
for (User user : users) {
    userRepository.save(user);  // One query per user
}

// ✅ Good: Batch insert
@Modifying
@Query(value = "INSERT INTO users (username, email) VALUES (:username, :email)", nativeQuery = true)
void batchInsert(@Param("username") String username, @Param("email") String email);

// Or configure batch size
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
```

### Lazy Loading

```java
// Use LAZY fetch
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;

// Load when needed
@Transactional(readOnly = true)
public User getUserWithOrders(Long id) {
    User user = userRepository.findById(id).orElse(null);
    if (user != null) {
        user.getOrders().size();  // Trigger lazy load
    }
    return user;
}
```

### Caching

```java
// Enable second-level cache
@Cacheable("users")
public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
}

@CacheEvict(value = "users", key = "#id")
public void delete(Long id) {
    userRepository.deleteById(id);
}
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa JPA và Hibernate?

- **JPA**: Specification (interface)
- **Hibernate**: Implementation của JPA
- Có thể dùng JPA với implementations khác (EclipseLink, OpenJPA)

### Q2: EntityManager vs Session?

- **EntityManager**: JPA interface
- **Session**: Hibernate-specific
- Spring Data JPA sử dụng EntityManager

### Q3: Sự khác biệt giữa save() và saveAndFlush()?

```java
// save(): Queue for insert/update, flush at transaction end
userRepository.save(user);

// saveAndFlush(): Immediately execute SQL
userRepository.saveAndFlush(user);
```

### Q4: Detached, Transient, Persistent states?

- **Transient**: Object mới tạo, chưa có ID, không trong persistence context
- **Persistent**: Object có ID, trong persistence context, tracked by JPA
- **Detached**: Object có ID nhưng không còn trong persistence context

### Q5: Làm sao update entity?

```java
// Method 1: Find và modify
User user = userRepository.findById(id).orElse(null);
user.setEmail("new@email.com");
userRepository.save(user);  // Update

// Method 2: @Modifying query
@Modifying
@Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
void updateEmail(@Param("id") Long id, @Param("email") String email);
```

### Q6: Pagination và Sorting?

```java
// Pagination
Pageable pageable = PageRequest.of(0, 10);  // Page 0, size 10
Page<User> page = userRepository.findAll(pageable);

// Sorting
Sort sort = Sort.by("username").ascending();
List<User> users = userRepository.findAll(sort);

// Combined
Pageable pageable = PageRequest.of(0, 10, Sort.by("username").descending());
Page<User> page = userRepository.findAll(pageable);
```

---

## Best Practices

1. **Use LAZY fetching** cho relationships
2. **Avoid N+1 problem** với JOIN FETCH hoặc EntityGraph
3. **Use @Transactional** appropriately
4. **Use DTOs** cho data transfer
5. **Batch operations** cho bulk inserts/updates
6. **Index important columns**
7. **Use pagination** cho large datasets
8. **Monitor query performance**
9. **Use second-level cache** cho read-heavy data
10. **Validate entities** với Bean Validation

---

## Bài tập thực hành

### Bài 1: Entity Relationships

```java
// Yêu cầu: Tạo entities với relationships
// - User (One) -> Orders (Many)
// - Order (Many) -> Products (Many)
// - Product (Many) -> Category (Many)
// Implement proper cascading và fetching
```

### Bài 2: Custom Queries

```java
// Yêu cầu: Implement complex queries
// - Find users with orders in date range
// - Calculate total order value per user
// - Find top 10 products by sales
```

### Bài 3: Performance Optimization

```java
// Yêu cầu: Optimize queries
// - Fix N+1 problem
// - Implement batch operations
// - Add caching
```

---

## Tổng kết

- **JPA**: Java Persistence API specification
- **Hibernate**: JPA implementation
- **Entities**: @Entity, @Id, @Column, @Table
- **Relationships**: @OneToMany, @ManyToOne, @ManyToMany, @OneToOne
- **Repository**: Spring Data JPA, custom queries
- **Transactions**: @Transactional, propagation, isolation
- **Performance**: Lazy loading, batch operations, caching
