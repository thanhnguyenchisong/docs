# Spring Data JPA - Câu hỏi phỏng vấn

## Mục lục
1. [Repository Pattern](#repository-pattern)
2. [Query Methods](#query-methods)
3. [Custom Queries](#custom-queries)
4. [Specifications](#specifications)
5. [Projections](#projections)
6. [Pagination và Sorting](#pagination-và-sorting)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Repository Pattern

### Basic Repository

```java
// Entity
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;
    private String email;
    private Integer age;
}

// Repository interface
public interface UserRepository extends JpaRepository<User, Long> {
    // Inherits: save, findById, findAll, delete, etc.
}

// Usage
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    public Optional<User> findUser(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
}
```

### Repository Interfaces

```java
// JpaRepository: Full CRUD + pagination
public interface UserRepository extends JpaRepository<User, Long> {
    // save, findById, findAll, delete, count, exists, etc.
}

// PagingAndSortingRepository: Pagination + sorting
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    // findAll(Sort), findAll(Pageable)
}

// CrudRepository: Basic CRUD
public interface UserRepository extends CrudRepository<User, Long> {
    // save, findById, findAll, delete, count, exists
}

// Repository: Base interface (no methods)
public interface UserRepository extends Repository<User, Long> {
    // Define your own methods
}
```

---

## Query Methods

### Method Naming Conventions

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Find by field
    User findByUsername(String username);
    List<User> findByEmail(String email);
    Optional<User> findById(Long id);
    
    // Find by multiple fields
    User findByUsernameAndEmail(String username, String email);
    List<User> findByUsernameOrEmail(String username, String email);
    
    // Find with conditions
    List<User> findByAgeGreaterThan(Integer age);
    List<User> findByAgeLessThan(Integer age);
    List<User> findByAgeBetween(Integer min, Integer max);
    List<User> findByAgeIn(List<Integer> ages);
    
    // Find with string operations
    List<User> findByUsernameContaining(String keyword);
    List<User> findByUsernameLike(String pattern);
    List<User> findByUsernameStartingWith(String prefix);
    List<User> findByUsernameEndingWith(String suffix);
    List<User> findByUsernameIgnoreCase(String username);
    
    // Find with null checks
    List<User> findByEmailIsNull();
    List<User> findByEmailIsNotNull();
    
    // Find with boolean
    List<User> findByActiveTrue();
    List<User> findByActiveFalse();
    
    // Find with sorting
    List<User> findByAgeOrderByUsernameAsc(Integer age);
    List<User> findByAgeOrderByUsernameDesc(Integer age);
    
    // Find with pagination
    Page<User> findByAge(Integer age, Pageable pageable);
    Slice<User> findByAge(Integer age, Pageable pageable);
    
    // Count
    long countByAge(Integer age);
    long countByAgeGreaterThan(Integer age);
    
    // Exists
    boolean existsByEmail(String email);
    boolean existsByUsernameAndEmail(String username, String email);
    
    // Delete
    void deleteByAge(Integer age);
    long deleteByAgeLessThan(Integer age);
}
```

### Query Keywords

| Keyword | Example | JPQL |
|---------|---------|------|
| **And** | findByUsernameAndEmail | WHERE username = ? AND email = ? |
| **Or** | findByUsernameOrEmail | WHERE username = ? OR email = ? |
| **Is, Equals** | findByUsername | WHERE username = ? |
| **Between** | findByAgeBetween | WHERE age BETWEEN ? AND ? |
| **LessThan** | findByAgeLessThan | WHERE age < ? |
| **LessThanEqual** | findByAgeLessThanEqual | WHERE age <= ? |
| **GreaterThan** | findByAgeGreaterThan | WHERE age > ? |
| **GreaterThanEqual** | findByAgeGreaterThanEqual | WHERE age >= ? |
| **After** | findByCreatedAtAfter | WHERE createdAt > ? |
| **Before** | findByCreatedAtBefore | WHERE createdAt < ? |
| **IsNull** | findByEmailIsNull | WHERE email IS NULL |
| **IsNotNull** | findByEmailIsNotNull | WHERE email IS NOT NULL |
| **Like** | findByUsernameLike | WHERE username LIKE ? |
| **NotLike** | findByUsernameNotLike | WHERE username NOT LIKE ? |
| **StartingWith** | findByUsernameStartingWith | WHERE username LIKE ?% |
| **EndingWith** | findByUsernameEndingWith | WHERE username LIKE %? |
| **Containing** | findByUsernameContaining | WHERE username LIKE %?% |
| **OrderBy** | findByAgeOrderByUsernameAsc | ORDER BY username ASC |
| **True** | findByActiveTrue | WHERE active = true |
| **False** | findByActiveFalse | WHERE active = false |
| **In** | findByAgeIn | WHERE age IN (?) |
| **NotIn** | findByAgeNotIn | WHERE age NOT IN (?) |

---

## Custom Queries

### @Query với JPQL

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // JPQL query
    @Query("SELECT u FROM User u WHERE u.age > :age")
    List<User> findUsersOlderThan(@Param("age") Integer age);
    
    // JPQL với JOIN
    @Query("SELECT u FROM User u JOIN u.orders o WHERE o.status = :status")
    List<User> findUsersWithOrdersByStatus(@Param("status") String status);
    
    // JPQL với JOIN FETCH
    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders WHERE u.active = true")
    List<User> findActiveUsersWithOrders();
    
    // JPQL với subquery
    @Query("SELECT u FROM User u WHERE u.age > (SELECT AVG(u2.age) FROM User u2)")
    List<User> findUsersAboveAverageAge();
}
```

### @Query với Native SQL

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Native query
    @Query(value = "SELECT * FROM users WHERE age > :age", nativeQuery = true)
    List<User> findUsersOlderThanNative(@Param("age") Integer age);
    
    // Native query với pagination
    @Query(value = "SELECT * FROM users WHERE city = :city",
           countQuery = "SELECT COUNT(*) FROM users WHERE city = :city",
           nativeQuery = true)
    Page<User> findUsersByCity(@Param("city") String city, Pageable pageable);
}
```

### @Modifying Queries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Update query
    @Modifying
    @Query("UPDATE User u SET u.email = :email WHERE u.id = :id")
    void updateEmail(@Param("id") Long id, @Param("email") String email);
    
    // Delete query
    @Modifying
    @Query("DELETE FROM User u WHERE u.age < :age")
    void deleteUsersYoungerThan(@Param("age") Integer age);
    
    // Update với return count
    @Modifying
    @Query("UPDATE User u SET u.active = :active WHERE u.id IN :ids")
    int updateActiveStatus(@Param("ids") List<Long> ids, @Param("active") Boolean active);
}

// Usage (must be in @Transactional method)
@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public void updateUserEmail(Long id, String email) {
        userRepository.updateEmail(id, email);
    }
}
```

---

## Specifications

### Dynamic Queries với Specifications

```java
// Entity
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private String city;
    private Boolean active;
}

// Repository với JpaSpecificationExecutor
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
}

// Specification class
public class UserSpecifications {
    public static Specification<User> hasAge(Integer age) {
        return (root, query, cb) -> cb.equal(root.get("age"), age);
    }
    
    public static Specification<User> hasCity(String city) {
        return (root, query, cb) -> cb.equal(root.get("city"), city);
    }
    
    public static Specification<User> isActive(Boolean active) {
        return (root, query, cb) -> cb.equal(root.get("active"), active);
    }
    
    public static Specification<User> ageGreaterThan(Integer age) {
        return (root, query, cb) -> cb.gt(root.get("age"), age);
    }
    
    public static Specification<User> usernameContains(String keyword) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("username")), "%" + keyword.toLowerCase() + "%");
    }
}

// Usage
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public List<User> findUsers(Integer age, String city, Boolean active) {
        Specification<User> spec = Specification.where(null);
        
        if (age != null) {
            spec = spec.and(UserSpecifications.hasAge(age));
        }
        
        if (city != null) {
            spec = spec.and(UserSpecifications.hasCity(city));
        }
        
        if (active != null) {
            spec = spec.and(UserSpecifications.isActive(active));
        }
        
        return userRepository.findAll(spec);
    }
    
    public Page<User> findUsersWithPagination(Specification<User> spec, Pageable pageable) {
        return userRepository.findAll(spec, pageable);
    }
}
```

---

## Projections

### Interface Projections

```java
// Interface projection
public interface UserSummary {
    String getUsername();
    String getEmail();
    Integer getAge();
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findByAgeGreaterThan(Integer age);
    
    @Query("SELECT u.username as username, u.email as email, u.age as age FROM User u WHERE u.age > :age")
    List<UserSummary> findUserSummaries(@Param("age") Integer age);
}

// Usage
List<UserSummary> summaries = userRepository.findByAgeGreaterThan(18);
summaries.forEach(summary -> {
    System.out.println(summary.getUsername());
    System.out.println(summary.getEmail());
});
```

### Class-based Projections (DTO)

```java
// DTO class
public class UserDTO {
    private String username;
    private String email;
    private Integer age;
    
    public UserDTO(String username, String email, Integer age) {
        this.username = username;
        this.email = email;
        this.age = age;
    }
    
    // Getters
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT new com.example.dto.UserDTO(u.username, u.email, u.age) FROM User u WHERE u.age > :age")
    List<UserDTO> findUserDTOs(@Param("age") Integer age);
}
```

### Dynamic Projections

```java
public interface UserRepository extends JpaRepository<User, Long> {
    <T> List<T> findByAgeGreaterThan(Integer age, Class<T> type);
}

// Usage
List<UserSummary> summaries = userRepository.findByAgeGreaterThan(18, UserSummary.class);
List<UserDTO> dtos = userRepository.findByAgeGreaterThan(18, UserDTO.class);
List<User> users = userRepository.findByAgeGreaterThan(18, User.class);
```

---

## Pagination và Sorting

### Pagination

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByAge(Integer age, Pageable pageable);
    Slice<User> findByAge(Integer age, Pageable pageable);
}

// Usage
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public Page<User> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }
    
    public Page<User> getUsersByAge(Integer age, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findByAge(age, pageable);
    }
    
    // Page vs Slice
    public void demonstratePagination() {
        Pageable pageable = PageRequest.of(0, 10);
        
        // Page: Knows total count (expensive)
        Page<User> page = userRepository.findAll(pageable);
        System.out.println("Total: " + page.getTotalElements());
        System.out.println("Pages: " + page.getTotalPages());
        
        // Slice: Doesn't know total (cheaper)
        Slice<User> slice = userRepository.findByAge(18, pageable);
        System.out.println("Has next: " + slice.hasNext());
        System.out.println("Has previous: " + slice.hasPrevious());
    }
}
```

### Sorting

```java
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByAgeOrderByUsernameAsc(Integer age);
    List<User> findByAgeOrderByUsernameDesc(Integer age);
}

// Dynamic sorting
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getUsersSorted(String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        return userRepository.findAll(sort);
    }
    
    public List<User> getUsersSortedMultiple() {
        Sort sort = Sort.by("username").ascending()
            .and(Sort.by("age").descending());
        return userRepository.findAll(sort);
    }
    
    // Pagination + Sorting
    public Page<User> getUsersWithPaginationAndSorting(int page, int size, String sortBy) {
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findAll(pageable);
    }
}
```

---

## Câu hỏi thường gặp

### Q1: JpaRepository vs CrudRepository?

```java
// CrudRepository: Basic CRUD operations
public interface UserRepository extends CrudRepository<User, Long> {
    // save, findById, findAll, delete, count, exists
}

// JpaRepository: CrudRepository + pagination + batch operations
public interface UserRepository extends JpaRepository<User, Long> {
    // All CrudRepository methods +
    // findAll(Pageable), findAll(Sort)
    // saveAll, flush, deleteInBatch, etc.
}
```

### Q2: save() vs saveAndFlush()?

```java
// save(): Queued for insert/update, flushed at transaction end
userRepository.save(user);

// saveAndFlush(): Immediately execute SQL
userRepository.saveAndFlush(user);
```

### Q3: Custom Repository Implementation?

```java
// Custom interface
public interface UserRepositoryCustom {
    List<User> findCustomUsers(String criteria);
}

// Repository extends custom interface
public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {
}

// Implementation (must end with "Impl")
@Repository
public class UserRepositoryImpl implements UserRepositoryCustom {
    @PersistenceContext
    private EntityManager em;
    
    @Override
    public List<User> findCustomUsers(String criteria) {
        // Custom implementation
        return em.createQuery("SELECT u FROM User u WHERE ...", User.class)
            .getResultList();
    }
}
```

### Q4: @Query vs Query Methods?

```java
// Query Methods: Simple, readable, but limited
List<User> findByAgeGreaterThan(Integer age);

// @Query: More flexible, complex queries
@Query("SELECT u FROM User u WHERE u.age > :age AND u.active = true")
List<User> findActiveUsersOlderThan(@Param("age") Integer age);
```

### Q5: EntityGraph?

```java
// Define EntityGraph
@Entity
@NamedEntityGraph(
    name = "User.withOrders",
    attributeNodes = @NamedAttributeNode("orders")
)
public class User {
    @OneToMany
    private List<Order> orders;
}

// Use EntityGraph
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph("User.withOrders")
    List<User> findAll();
    
    @EntityGraph(attributePaths = {"orders", "profile"})
    Optional<User> findById(Long id);
}
```

---

## Best Practices

1. **Use Query Methods** cho simple queries
2. **Use @Query** cho complex queries
3. **Use Specifications** cho dynamic queries
4. **Use Projections** để reduce data transfer
5. **Use Pagination** cho large result sets
6. **Use EntityGraph** để tránh N+1 problem
7. **Use @Modifying** với @Transactional
8. **Avoid N+1 queries** với JOIN FETCH

---

## Bài tập thực hành

### Bài 1: Custom Repository

```java
// Yêu cầu: Implement custom repository với:
// 1. Complex search với multiple criteria
// 2. Custom pagination
// 3. Custom sorting
```

### Bài 2: Specifications

```java
// Yêu cầu: Implement dynamic query builder với Specifications
// Support: filtering, sorting, pagination
```

---

## Tổng kết

- **Repository Pattern**: JpaRepository, CrudRepository
- **Query Methods**: Method naming conventions
- **Custom Queries**: @Query với JPQL/Native SQL
- **Specifications**: Dynamic queries
- **Projections**: Interface và Class-based
- **Pagination**: Page, Slice, Pageable
- **Sorting**: Sort, dynamic sorting
- **Best Practices**: Use appropriate approach for each use case
