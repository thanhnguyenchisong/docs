# Entity Relationships - Câu hỏi phỏng vấn JPA

## Mục lục
1. [@OneToMany và @ManyToOne](#onetomany-và-manytoone)
2. [@ManyToMany](#manytomany)
3. [@OneToOne](#onetoone)
4. [Cascade Types](#cascade-types)
5. [Fetch Types](#fetch-types)
6. [Bidirectional vs Unidirectional](#bidirectional-vs-unidirectional)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## @OneToMany và @ManyToOne

### Unidirectional @ManyToOne

```java
@Entity
public class Order {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Getters and setters
}

@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    // No reference to orders
}
```

### Bidirectional @OneToMany và @ManyToOne

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
    
    // Helper methods
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }
    
    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);
    }
}

@Entity
public class Order {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Getters and setters
}
```

### @JoinColumn Options

```java
@ManyToOne
@JoinColumn(
    name = "user_id",              // Foreign key column name
    referencedColumnName = "id",   // Referenced column (default: primary key)
    nullable = false,              // NOT NULL constraint
    unique = false,                // UNIQUE constraint
    updatable = true,              // Can update foreign key
    insertable = true              // Can insert foreign key
)
private User user;
```

### @JoinTable (OneToMany với Join Table)

```java
@Entity
public class User {
    @OneToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "user_orders",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "order_id")
    )
    private List<Order> orders = new ArrayList<>();
}
```

---

## @ManyToMany

### Bidirectional @ManyToMany

```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();
    
    // Helper methods
    public void addCourse(Course course) {
        courses.add(course);
        course.getStudents().add(this);
    }
    
    public void removeCourse(Course course) {
        courses.remove(course);
        course.getStudents().remove(this);
    }
}

@Entity
public class Course {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}
```

### Unidirectional @ManyToMany

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
    
    // No reference to students
}
```

### @ManyToMany với Additional Columns

```java
// Use @Embeddable cho composite key
@Embeddable
public class StudentCourseId implements Serializable {
    private Long studentId;
    private Long courseId;
    
    // equals() and hashCode()
}

@Entity
public class StudentCourse {
    @EmbeddedId
    private StudentCourseId id;
    
    @ManyToOne
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;
    
    @ManyToOne
    @MapsId("courseId")
    @JoinColumn(name = "course_id")
    private Course course;
    
    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;
    
    @Column(name = "grade")
    private String grade;
}
```

---

## @OneToOne

### Unidirectional @OneToOne

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id", unique = true)
    private UserProfile profile;
}

@Entity
public class UserProfile {
    @Id
    @GeneratedValue
    private Long id;
    
    private String bio;
    // No reference to user
}
```

### Bidirectional @OneToOne

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

@Entity
public class UserProfile {
    @Id
    @GeneratedValue
    private Long id;
    
    private String bio;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
```

### @OneToOne với Shared Primary Key

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

@Entity
public class UserProfile {
    @Id
    private Long id;  // Same as User.id
    
    private String bio;
    
    @OneToOne
    @MapsId  // Use User.id as primary key
    @JoinColumn(name = "id")
    private User user;
}
```

---

## Cascade Types

### Cascade Operations

```java
@Entity
public class User {
    @OneToMany(
        mappedBy = "user",
        cascade = {
            CascadeType.PERSIST,   // Save child when save parent
            CascadeType.MERGE,      // Merge child when merge parent
            CascadeType.REMOVE,     // Delete child when delete parent
            CascadeType.REFRESH,    // Refresh child when refresh parent
            CascadeType.DETACH,     // Detach child when detach parent
            CascadeType.ALL         // All of the above
        }
    )
    private List<Order> orders = new ArrayList<>();
}
```

### Ví dụ Cascade

```java
// PERSIST: Save child automatically
User user = new User();
Order order = new Order();
user.addOrder(order);
em.persist(user);  // Order also persisted automatically

// REMOVE: Delete child automatically
User user = em.find(User.class, 1L);
em.remove(user);  // All orders also deleted

// MERGE: Merge child automatically
User detached = ...;
detached.getOrders().get(0).setStatus("CANCELLED");
User merged = em.merge(detached);  // Order changes also merged
```

### orphanRemoval

```java
@Entity
public class User {
    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true  // Delete child when removed from collection
    )
    private List<Order> orders = new ArrayList<>();
}

// Usage
User user = em.find(User.class, 1L);
Order order = user.getOrders().get(0);
user.getOrders().remove(order);  // Order deleted from database
// No need to call em.remove(order)
```

---

## Fetch Types

### EAGER vs LAZY

```java
// EAGER: Load immediately
@ManyToOne(fetch = FetchType.EAGER)
private User user;  // Loaded with parent

// LAZY: Load when accessed
@ManyToOne(fetch = FetchType.LAZY)
private User user;  // Proxy, loaded when accessed
```

### Default Fetch Types

| Relationship | Default Fetch Type |
|--------------|-------------------|
| @ManyToOne | EAGER |
| @OneToOne | EAGER |
| @OneToMany | LAZY |
| @ManyToMany | LAZY |

### Best Practices

```java
// ✅ Good: LAZY for @ManyToOne (usually)
@ManyToOne(fetch = FetchType.LAZY)
private User user;

// ✅ Good: LAZY for @OneToMany (default, good)
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;

// ❌ Bad: EAGER for collections (N+1 problem)
@OneToMany(fetch = FetchType.EAGER)
private List<Order> orders;  // Loads all orders immediately
```

### EAGER Loading Issues

```java
// Problem: N+1 queries với EAGER
List<User> users = em.createQuery("SELECT u FROM User u", User.class)
    .getResultList();
// Query 1: SELECT * FROM users
// Query 2: SELECT * FROM orders WHERE user_id = 1
// Query 3: SELECT * FROM orders WHERE user_id = 2
// ... (N+1 queries)

// Solution: Use JOIN FETCH
List<User> users = em.createQuery(
    "SELECT u FROM User u JOIN FETCH u.orders", User.class
).getResultList();
// Single query with JOIN
```

---

## Bidirectional vs Unidirectional

### Unidirectional

```java
// Only one side has reference
@Entity
public class Order {
    @ManyToOne
    private User user;  // Order knows User
}

@Entity
public class User {
    // No reference to orders
}
```

**Pros:**
- Simpler
- Less code
- No synchronization needed

**Cons:**
- Can't navigate from User to Orders
- Need query to get orders

### Bidirectional

```java
// Both sides have references
@Entity
public class User {
    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}

@Entity
public class Order {
    @ManyToOne
    private User user;
}
```

**Pros:**
- Can navigate both ways
- More flexible

**Cons:**
- More complex
- Need to maintain both sides
- Risk of inconsistency

### Maintaining Bidirectional Relationships

```java
@Entity
public class User {
    @OneToMany(mappedBy = "user")
    private List<Order> orders = new ArrayList<>();
    
    // Helper methods to maintain consistency
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);  // Set both sides
    }
    
    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);  // Clear both sides
    }
}
```

---

## Câu hỏi thường gặp

### Q1: mappedBy là gì?

```java
// mappedBy: Indicates this side is the "inverse" side
// The relationship is owned by the other side

@Entity
public class User {
    @OneToMany(mappedBy = "user")  // "user" is the field name in Order
    private List<Order> orders;
}

@Entity
public class Order {
    @ManyToOne
    @JoinColumn(name = "user_id")  // This side owns the relationship
    private User user;  // Field name matches mappedBy value
}
```

### Q2: Khi nào dùng @JoinTable?

```java
// Use @JoinTable for:
// 1. @ManyToMany (always needs join table)
@ManyToMany
@JoinTable(name = "student_course", ...)
private Set<Course> courses;

// 2. @OneToMany when you want join table instead of foreign key
@OneToMany
@JoinTable(name = "user_orders", ...)
private List<Order> orders;
```

### Q3: orphanRemoval vs CascadeType.REMOVE?

```java
// CascadeType.REMOVE: Delete child when parent is deleted
@OneToMany(cascade = CascadeType.REMOVE)
private List<Order> orders;
// Only works when parent is deleted

// orphanRemoval: Delete child when removed from collection
@OneToMany(orphanRemoval = true)
private List<Order> orders;
// Works when parent is deleted OR when child is removed from collection
```

### Q4: LazyInitializationException với Relationships?

```java
// Problem: Accessing lazy relationship outside transaction
@Transactional
public User getUser(Long id) {
    return em.find(User.class, id);
}

// Later:
User user = getUser(1L);
List<Order> orders = user.getOrders();  // LazyInitializationException!

// Solution 1: JOIN FETCH
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
User getUserWithOrders(Long id);

// Solution 2: EntityGraph
@EntityGraph(attributePaths = {"orders"})
User findById(Long id);

// Solution 3: Force load in transaction
@Transactional
public User getUserWithOrders(Long id) {
    User user = em.find(User.class, id);
    user.getOrders().size();  // Force load
    return user;
}
```

### Q5: Bidirectional Relationship Best Practices?

```java
// ✅ Good: Use helper methods
@Entity
public class User {
    @OneToMany(mappedBy = "user")
    private List<Order> orders = new ArrayList<>();
    
    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }
    
    public void removeOrder(Order order) {
        orders.remove(order);
        order.setUser(null);
    }
}

// ❌ Bad: Direct manipulation
User user = ...;
Order order = new Order();
user.getOrders().add(order);  // Missing: order.setUser(user)
// Inconsistent state!
```

### Q6: @ManyToMany với Additional Attributes?

```java
// Solution: Use intermediate entity
@Entity
public class StudentCourse {
    @EmbeddedId
    private StudentCourseId id;
    
    @ManyToOne
    @MapsId("studentId")
    private Student student;
    
    @ManyToOne
    @MapsId("courseId")
    private Course course;
    
    // Additional attributes
    private LocalDate enrollmentDate;
    private String grade;
}
```

---

## Best Practices

1. **Use LAZY fetching** cho relationships (trừ khi chắc chắn cần EAGER)
2. **Maintain bidirectional relationships** với helper methods
3. **Use JOIN FETCH** để tránh N+1 problem
4. **Choose appropriate cascade types** (thường là ALL cho parent-child)
5. **Use orphanRemoval** cho composition relationships
6. **Avoid EAGER on collections** (gây N+1 problem)
7. **Use @JoinTable** cho @ManyToMany
8. **Use mappedBy** correctly trong bidirectional relationships

---

## Bài tập thực hành

### Bài 1: Implement Relationships

```java
// Yêu cầu: Tạo entities với relationships
// - User (One) -> Orders (Many)
// - Order (Many) -> Products (Many)
// - Product (Many) -> Category (Many)
// Implement proper cascading và fetching
```

### Bài 2: Fix N+1 Problem

```java
// Yêu cầu: 
// 1. Identify N+1 problem trong code
// 2. Fix bằng JOIN FETCH
// 3. Fix bằng EntityGraph
// 4. Compare performance
```

---

## Tổng kết

- **@OneToMany/@ManyToOne**: One-to-many relationship
- **@ManyToMany**: Many-to-many relationship (needs join table)
- **@OneToOne**: One-to-one relationship
- **Cascade Types**: Control automatic operations
- **Fetch Types**: EAGER (immediate) vs LAZY (on-demand)
- **Bidirectional vs Unidirectional**: Choose based on needs
- **Best Practices**: LAZY fetching, JOIN FETCH, helper methods
