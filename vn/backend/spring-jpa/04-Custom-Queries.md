# Custom Queries trong Spring Data JPA

## Tổng quan

Khi Query Methods không đủ, Spring Data JPA cho phép định nghĩa custom queries bằng:
- `@Query` với JPQL
- `@Query` với Native SQL
- Named Queries
- `@Modifying` cho update/delete queries

## @Query với JPQL

### Basic JPQL Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Simple query
    @Query("SELECT u FROM User u WHERE u.age > :age")
    List<User> findUsersOlderThan(@Param("age") Integer age);
    
    // Query với multiple parameters
    @Query("SELECT u FROM User u WHERE u.age > :minAge AND u.age < :maxAge")
    List<User> findUsersBetweenAges(
        @Param("minAge") Integer minAge, 
        @Param("maxAge") Integer maxAge);
    
    // Query với LIKE
    @Query("SELECT u FROM User u WHERE u.username LIKE %:keyword%")
    List<User> findUsersByKeyword(@Param("keyword") String keyword);
}
```

### JPQL với JOIN

```java
@Entity
public class User {
    @OneToMany(mappedBy = "user")
    private List<Order> orders;
}

@Entity
public class Order {
    @ManyToOne
    private User user;
    private String status;
}

// JOIN query
public interface UserRepository extends JpaRepository<User, Long> {
    
    // INNER JOIN
    @Query("SELECT u FROM User u JOIN u.orders o WHERE o.status = :status")
    List<User> findUsersWithOrdersByStatus(@Param("status") String status);
    
    // LEFT JOIN
    @Query("SELECT u FROM User u LEFT JOIN u.orders o WHERE o.status = :status")
    List<User> findUsersWithOrdersLeftJoin(@Param("status") String status);
    
    // Multiple JOINs
    @Query("SELECT u FROM User u " +
           "JOIN u.orders o " +
           "JOIN o.items i " +
           "WHERE i.price > :minPrice")
    List<User> findUsersWithExpensiveOrders(@Param("minPrice") BigDecimal minPrice);
}
```

### JOIN FETCH (Tránh N+1 Problem)

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // JOIN FETCH - Load associations trong cùng query
    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders WHERE u.active = true")
    List<User> findActiveUsersWithOrders();
    
    // Multiple JOIN FETCH
    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN FETCH u.orders o " +
           "JOIN FETCH u.profile p " +
           "WHERE u.active = true")
    List<User> findActiveUsersWithOrdersAndProfile();
}
```

### Subqueries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Subquery trong WHERE
    @Query("SELECT u FROM User u WHERE u.age > " +
           "(SELECT AVG(u2.age) FROM User u2)")
    List<User> findUsersAboveAverageAge();
    
    // Subquery với EXISTS
    @Query("SELECT u FROM User u WHERE EXISTS " +
           "(SELECT o FROM Order o WHERE o.user = u AND o.status = :status)")
    List<User> findUsersWithOrdersByStatus(@Param("status") String status);
    
    // Subquery với IN
    @Query("SELECT u FROM User u WHERE u.id IN " +
           "(SELECT o.user.id FROM Order o WHERE o.total > :minTotal)")
    List<User> findUsersWithHighValueOrders(@Param("minTotal") BigDecimal minTotal);
}
```

### Aggregation Functions

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // COUNT
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();
    
    // AVG
    @Query("SELECT AVG(u.age) FROM User u")
    Double getAverageAge();
    
    // SUM
    @Query("SELECT SUM(o.total) FROM Order o WHERE o.user.id = :userId")
    BigDecimal getTotalOrderValue(@Param("userId") Long userId);
    
    // MAX/MIN
    @Query("SELECT MAX(u.age) FROM User u")
    Integer getMaxAge();
    
    // GROUP BY
    @Query("SELECT u.city, COUNT(u) FROM User u GROUP BY u.city")
    List<Object[]> countUsersByCity();
}
```

### Projection trong @Query

```java
// Interface projection
public interface UserSummary {
    String getUsername();
    String getEmail();
    Integer getAge();
}

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Projection với interface
    @Query("SELECT u.username as username, u.email as email, u.age as age " +
           "FROM User u WHERE u.age > :age")
    List<UserSummary> findUserSummaries(@Param("age") Integer age);
    
    // Projection với DTO constructor
    @Query("SELECT new com.example.dto.UserDTO(u.username, u.email, u.age) " +
           "FROM User u WHERE u.age > :age")
    List<UserDTO> findUserDTOs(@Param("age") Integer age);
}
```

## @Query với Native SQL

### Basic Native Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Native SQL query
    @Query(value = "SELECT * FROM users WHERE age > :age", nativeQuery = true)
    List<User> findUsersOlderThanNative(@Param("age") Integer age);
    
    // Native query với JOIN
    @Query(value = "SELECT u.* FROM users u " +
                   "INNER JOIN orders o ON u.id = o.user_id " +
                   "WHERE o.status = :status", 
           nativeQuery = true)
    List<User> findUsersWithOrdersNative(@Param("status") String status);
}
```

### Native Query với Pagination

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Native query với pagination (cần countQuery)
    @Query(value = "SELECT * FROM users WHERE city = :city",
           countQuery = "SELECT COUNT(*) FROM users WHERE city = :city",
           nativeQuery = true)
    Page<User> findUsersByCity(@Param("city") String city, Pageable pageable);
    
    // Native query với sorting
    @Query(value = "SELECT * FROM users WHERE age > :age ORDER BY username ASC",
           nativeQuery = true)
    List<User> findUsersOlderThanSorted(@Param("age") Integer age);
}
```

### Native Query với Projection

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Native query với interface projection
    @Query(value = "SELECT username, email, age FROM users WHERE age > :age",
           nativeQuery = true)
    List<UserSummary> findUserSummariesNative(@Param("age") Integer age);
    
    // Native query với DTO
    @Query(value = "SELECT username, email, age FROM users WHERE age > :age",
           nativeQuery = true)
    List<Object[]> findUserDataNative(@Param("age") Integer age);
}
```

## @Modifying Queries

### Update Queries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Update query
    @Modifying
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmail(@Param("id") Long id, @Param("email") String email);
    
    // Update với return count
    @Modifying
    @Query("UPDATE User u SET u.active = :active WHERE u.id IN :ids")
    int updateActiveStatus(@Param("ids") List<Long> ids, @Param("active") Boolean active);
    
    // Update multiple fields
    @Modifying
    @Query("UPDATE User u SET u.email = :email, u.fullName = :fullName WHERE u.id = :id")
    void updateUserInfo(@Param("id") Long id, 
                        @Param("email") String email, 
                        @Param("fullName") String fullName);
    
    // Update với conditions
    @Modifying
    @Query("UPDATE User u SET u.active = false WHERE u.lastLoginDate < :date")
    int deactivateInactiveUsers(@Param("date") LocalDateTime date);
}
```

### Delete Queries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Delete query
    @Modifying
    @Query("DELETE FROM User u WHERE u.age < :age")
    void deleteUsersYoungerThan(@Param("age") Integer age);
    
    // Delete với return count
    @Modifying
    @Query("DELETE FROM User u WHERE u.active = false AND u.createdAt < :date")
    int deleteInactiveUsers(@Param("date") LocalDateTime date);
    
    // Delete với conditions
    @Modifying
    @Query("DELETE FROM User u WHERE u.id IN :ids")
    void deleteUsersByIds(@Param("ids") List<Long> ids);
}
```

### @Modifying với clearAutomatically và flushAutomatically

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // clearAutomatically: Clear persistence context sau query
    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmail(@Param("id") Long id, @Param("email") String email);
    
    // flushAutomatically: Flush changes trước khi execute query
    @Modifying(flushAutomatically = true)
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmailWithFlush(@Param("id") Long id, @Param("email") String email);
    
    // Cả hai
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmailWithBoth(@Param("id") Long id, @Param("email") String email);
}
```

### Usage với @Transactional

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // @Modifying queries PHẢI trong @Transactional method
    public void updateUserEmail(Long id, String email) {
        userRepository.updateEmail(id, email);
    }
    
    // Multiple @Modifying queries trong cùng transaction
    public void updateUserInfo(Long id, String email, String fullName) {
        userRepository.updateEmail(id, email);
        userRepository.updateFullName(id, fullName);
    }
}
```

## Named Queries

### Entity-level Named Queries

```java
@Entity
@NamedQueries({
    @NamedQuery(
        name = "User.findByAge",
        query = "SELECT u FROM User u WHERE u.age = :age"
    ),
    @NamedQuery(
        name = "User.findActiveUsers",
        query = "SELECT u FROM User u WHERE u.active = true"
    )
})
public class User {
    // Entity fields
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Sử dụng named query
    List<User> findByAge(@Param("age") Integer age);
    List<User> findActiveUsers();
}
```

### Repository-level Named Queries

```java
// File: UserRepository.findByCity
// Location: META-INF/jpa-named-queries.properties
UserRepository.findByCity=SELECT u FROM User u WHERE u.city = :city

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByCity(@Param("city") String city);
}
```

## SpEL Expressions trong @Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // SpEL với entity name
    @Query("SELECT u FROM #{#entityName} u WHERE u.age > :age")
    List<User> findUsersOlderThan(@Param("age") Integer age);
    
    // SpEL với entity name và custom logic
    @Query("SELECT u FROM #{#entityName} u WHERE u.active = true")
    List<User> findActiveUsers();
}
```

## Dynamic Queries với @Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Query với conditional logic (không thể, phải dùng Specifications)
    // Nhưng có thể dùng SpEL
    @Query("SELECT u FROM User u WHERE " +
           "(:#{#filter.active} IS NULL OR u.active = :#{#filter.active}) AND " +
           "(:#{#filter.age} IS NULL OR u.age = :#{#filter.age})")
    List<User> findUsersWithFilter(@Param("filter") UserFilter filter);
}
```

## Best Practices

### 1. Sử dụng JPQL thay vì Native SQL khi có thể

```java
// ✅ Good - Portable
@Query("SELECT u FROM User u WHERE u.age > :age")
List<User> findUsersOlderThan(@Param("age") Integer age);

// ⚠️ Use only when necessary - Database specific
@Query(value = "SELECT * FROM users WHERE age > :age", nativeQuery = true)
List<User> findUsersOlderThanNative(@Param("age") Integer age);
```

### 2. Sử dụng JOIN FETCH để tránh N+1

```java
// ✅ Good - Single query
@Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders")
List<User> findUsersWithOrders();

// ❌ Bad - N+1 queries
List<User> findAll();  // 1 query + N queries for orders
```

### 3. Sử dụng @Param cho parameters

```java
// ✅ Good
@Query("SELECT u FROM User u WHERE u.age > :age")
List<User> findUsersOlderThan(@Param("age") Integer age);

// ❌ Bad - Positional parameters (khó maintain)
@Query("SELECT u FROM User u WHERE u.age > ?1")
List<User> findUsersOlderThan(Integer age);
```

### 4. @Modifying phải trong @Transactional

```java
// ✅ Good
@Transactional
public void updateEmail(Long id, String email) {
    userRepository.updateEmail(id, email);
}

// ❌ Bad - Sẽ throw exception
public void updateEmail(Long id, String email) {
    userRepository.updateEmail(id, email);  // Exception!
}
```

### 5. Sử dụng countQuery cho native pagination

```java
// ✅ Good
@Query(value = "SELECT * FROM users WHERE city = :city",
       countQuery = "SELECT COUNT(*) FROM users WHERE city = :city",
       nativeQuery = true)
Page<User> findUsersByCity(@Param("city") String city, Pageable pageable);
```

## Common Issues

### Issue 1: @Modifying query không hoạt động

**Solution:**
- Đảm bảo method có @Transactional
- Kiểm tra clearAutomatically và flushAutomatically

### Issue 2: N+1 Problem

**Solution:**
- Sử dụng JOIN FETCH
- Sử dụng EntityGraph

### Issue 3: Native query pagination không hoạt động

**Solution:**
- Cung cấp countQuery
- Đảm bảo query syntax đúng

## Tổng kết

- **@Query với JPQL** cho portable queries
- **@Query với Native SQL** cho database-specific queries
- **@Modifying** cho update/delete queries
- **Named Queries** cho reusable queries
- **Best practices** để code maintainable và performant
