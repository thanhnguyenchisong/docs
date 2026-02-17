# Advanced Topics trong Spring Data JPA

## Specifications

### Dynamic Queries với Specifications

```java
// Repository với JpaSpecificationExecutor
public interface UserRepository extends 
    JpaRepository<User, Long>, 
    JpaSpecificationExecutor<User> {
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
        return (root, query, cb) -> 
            cb.like(cb.lower(root.get("username")), "%" + keyword.toLowerCase() + "%");
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
    
    @Query("SELECT u.username as username, u.email as email, u.age as age " +
           "FROM User u WHERE u.age > :age")
    List<UserSummary> findUserSummaries(@Param("age") Integer age);
}

// Closed projection (chỉ các fields được định nghĩa)
public interface UserSummary {
    String getUsername();
    String getEmail();
}

// Open projection (có thể tính toán)
public interface UserProjection {
    String getUsername();
    String getEmail();
    
    @Value("#{target.username + ' - ' + target.email}")
    String getDisplayName();
}
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
    @Query("SELECT new com.example.dto.UserDTO(u.username, u.email, u.age) " +
           "FROM User u WHERE u.age > :age")
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

## Pagination và Sorting

### Pagination với Page

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByAge(Integer age, Pageable pageable);
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
    }
}
```

### Sorting

```java
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

## Entity Graphs

### N+1 Problem

```java
// ❌ N+1 Problem
List<User> users = userRepository.findAll();  // 1 query
users.forEach(user -> {
    user.getOrders().size();  // N queries (1 per user)
});

// ✅ Solution với EntityGraph
@Entity
@NamedEntityGraph(
    name = "User.withOrders",
    attributeNodes = @NamedAttributeNode("orders")
)
public class User {
    @OneToMany
    private List<Order> orders;
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph("User.withOrders")
    List<User> findAll();
    
    @EntityGraph(attributePaths = {"orders", "profile"})
    Optional<User> findById(Long id);
    
    @EntityGraph(attributePaths = "orders")
    List<User> findByAgeGreaterThan(Integer age);
}
```

### Dynamic Entity Graphs

```java
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = {"orders", "profile"})
    List<User> findAll();
    
    // EntityGraph với @Query
    @EntityGraph(attributePaths = "orders")
    @Query("SELECT u FROM User u WHERE u.age > :age")
    List<User> findUsersOlderThan(@Param("age") Integer age);
}
```

## Auditing

### Enable JPA Auditing

```java
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}

// Entity
@Entity
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
```

### Custom Auditor

```java
@Component
public class AuditorAwareImpl implements AuditorAware<String> {
    
    @Override
    public Optional<String> getCurrentAuditor() {
        // Get current user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.of("system");
        }
        return Optional.of(authentication.getName());
    }
}

// Configuration
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
public class JpaAuditingConfig {
    
    @Bean
    public AuditorAware<String> auditorAwareImpl() {
        return new AuditorAwareImpl();
    }
}
```

## Performance Optimization

### Batch Operations

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Batch insert
    public void createUsersBatch(List<User> users) {
        userRepository.saveAll(users);  // Batch insert
    }
    
    // Batch delete
    public void deleteUsersBatch(List<Long> ids) {
        userRepository.deleteAllByIdInBatch(ids);  // Batch delete
    }
}
```

### Lazy vs Eager Loading

```java
@Entity
public class User {
    // Lazy loading (default)
    @OneToMany(fetch = FetchType.LAZY)
    private List<Order> orders;
    
    // Eager loading (use carefully)
    @OneToOne(fetch = FetchType.EAGER)
    private Profile profile;
}

// Best practice: Use LAZY và fetch khi cần
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);
```

### Query Optimization

```java
// ✅ Good - Single query với JOIN FETCH
@Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();

// ❌ Bad - N+1 queries
List<User> findAll();  // 1 + N queries

// ✅ Good - Projection
@Query("SELECT u.username, u.email FROM User u")
List<UserSummary> findUserSummaries();

// ❌ Bad - Load full entities
List<User> findAll();
```

## Testing

### @DataJpaTest

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Test
    void testSaveUser() {
        User user = new User("john", "john@example.com");
        User saved = userRepository.save(user);
        
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("john");
    }
    
    @Test
    void testFindByUsername() {
        entityManager.persist(new User("john", "john@example.com"));
        
        Optional<User> user = userRepository.findByUsername("john");
        
        assertThat(user).isPresent();
        assertThat(user.get().getUsername()).isEqualTo("john");
    }
}
```

### Integration Testing

```java
@SpringBootTest
@Transactional
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testCreateUser() {
        User user = new User("john", "john@example.com");
        User created = userService.createUser(user);
        
        assertThat(created.getId()).isNotNull();
        assertThat(userRepository.existsById(created.getId())).isTrue();
    }
}
```

## Multi-tenancy

### Schema-based Multi-tenancy

```java
@Configuration
public class MultiTenancyConfig {
    
    @Bean
    public DataSource dataSource() {
        AbstractRoutingDataSource routingDataSource = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return TenantContext.getCurrentTenant();
            }
        };
        // Configure data sources
        return routingDataSource;
    }
}
```

## Best Practices Summary

1. **Sử dụng Specifications** cho dynamic queries
2. **Sử dụng Projections** để giảm data transfer
3. **Sử dụng Pagination** cho large result sets
4. **Sử dụng EntityGraph** để tránh N+1 problem
5. **Enable Auditing** cho created/updated tracking
6. **Sử dụng Batch Operations** cho multiple entities
7. **Test với @DataJpaTest** cho repository testing
8. **Optimize queries** với JOIN FETCH và projections
9. **Sử dụng Lazy loading** và fetch khi cần
10. **Monitor performance** và optimize queries

## Tổng kết

- **Specifications**: Dynamic queries
- **Projections**: Reduce data transfer
- **Pagination/Sorting**: Handle large datasets
- **Entity Graphs**: Avoid N+1 problem
- **Auditing**: Track changes
- **Performance**: Optimize queries và operations
- **Testing**: Test repositories và services
