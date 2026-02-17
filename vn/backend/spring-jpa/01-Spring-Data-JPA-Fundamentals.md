# Spring Data JPA Fundamentals

## Giới thiệu

Spring Data JPA là một module của Spring Data project, cung cấp abstraction layer cho JPA để:
- Giảm boilerplate code
- Đơn giản hóa data access layer
- Cung cấp repository pattern implementation
- Hỗ trợ query methods, custom queries, và specifications

## Spring Data JPA là gì?

Spring Data JPA là một abstraction layer trên JPA, cho phép:
- Tự động tạo repository implementations
- Tạo queries từ method names
- Hỗ trợ pagination, sorting, và specifications
- Tích hợp với Spring Framework

### So sánh: JPA vs Spring Data JPA

```java
// ❌ Pure JPA - Nhiều boilerplate code
@Repository
public class UserRepositoryImpl {
    @PersistenceContext
    private EntityManager em;
    
    public User findById(Long id) {
        return em.find(User.class, id);
    }
    
    public List<User> findAll() {
        return em.createQuery("SELECT u FROM User u", User.class)
            .getResultList();
    }
    
    public User save(User user) {
        if (user.getId() == null) {
            em.persist(user);
        } else {
            em.merge(user);
        }
        return user;
    }
    
    public void delete(Long id) {
        User user = em.find(User.class, id);
        if (user != null) {
            em.remove(user);
        }
    }
}

// ✅ Spring Data JPA - Đơn giản hơn nhiều
public interface UserRepository extends JpaRepository<User, Long> {
    // Tất cả methods trên đã được implement tự động!
}
```

## Dependencies

### Maven

```xml
<dependencies>
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-jpa</artifactId>
        <version>3.1.0</version>
    </dependency>
    
    <!-- Hibernate (JPA Implementation) -->
    <dependency>
        <groupId>org.hibernate.orm</groupId>
        <artifactId>hibernate-core</artifactId>
        <version>6.2.0.Final</version>
    </dependency>
    
    <!-- Database Driver -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- Connection Pool -->
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
        <version>5.0.1</version>
    </dependency>
</dependencies>
```

### Gradle

```gradle
dependencies {
    implementation 'org.springframework.data:spring-data-jpa:3.1.0'
    implementation 'org.hibernate.orm:hibernate-core:6.2.0.Final'
    implementation 'com.mysql:mysql-connector-j:8.0.33'
    implementation 'com.zaxxer:HikariCP:5.0.1'
}
```

### Spring Boot Starter (Recommended)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

## Configuration

### Java Configuration

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
@EnableTransactionManagement
public class JpaConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("root");
        config.setPassword("password");
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return new HikariDataSource(config);
    }
    
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.entity");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setJpaProperties(jpaProperties());
        return em;
    }
    
    private Properties jpaProperties() {
        Properties props = new Properties();
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        props.setProperty("hibernate.hbm2ddl.auto", "update");
        props.setProperty("hibernate.show_sql", "true");
        props.setProperty("hibernate.format_sql", "true");
        return props;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
```

### Spring Boot Configuration (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    format-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true
        use_sql_comments: true
```

### Spring Boot Configuration (application.properties)

```properties
# DataSource
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.format-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

## Basic Entity

```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "full_name")
    private String fullName;
    
    private Integer age;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors, getters, setters
    public User() {}
    
    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }
    
    // Getters and setters
}

enum UserStatus {
    ACTIVE, INACTIVE, SUSPENDED
}
```

## Basic Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository cung cấp:
    // - save(entity)
    // - findById(id)
    // - findAll()
    // - delete(entity)
    // - count()
    // - existsById(id)
    // - findAll(Pageable)
    // - findAll(Sort)
    // - saveAll(entities)
    // - deleteAll()
    // - flush()
    // - saveAndFlush(entity)
    // - deleteInBatch(entities)
    // - deleteAllInBatch()
}
```

## Basic Usage

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);  // Save cũng dùng để update
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public boolean userExists(Long id) {
        return userRepository.existsById(id);
    }
    
    public long countUsers() {
        return userRepository.count();
    }
}
```

## Repository Interfaces Hierarchy

```
Repository<T, ID>
    ├── CrudRepository<T, ID>
    │   └── PagingAndSortingRepository<T, ID>
    │       └── JpaRepository<T, ID>
    │           └── Custom Repository Interfaces
```

### Repository (Base Interface)

```java
// Base interface - không có methods
public interface Repository<T, ID> {
}
```

### CrudRepository

```java
// Basic CRUD operations
public interface CrudRepository<T, ID> extends Repository<T, ID> {
    <S extends T> S save(S entity);
    <S extends T> Iterable<S> saveAll(Iterable<S> entities);
    Optional<T> findById(ID id);
    boolean existsById(ID id);
    Iterable<T> findAll();
    Iterable<T> findAllById(Iterable<ID> ids);
    long count();
    void deleteById(ID id);
    void delete(T entity);
    void deleteAll(Iterable<? extends T> entities);
    void deleteAll();
}
```

### PagingAndSortingRepository

```java
// CrudRepository + Pagination + Sorting
public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {
    Iterable<T> findAll(Sort sort);
    Page<T> findAll(Pageable pageable);
}
```

### JpaRepository

```java
// Full-featured repository với JPA-specific methods
public interface JpaRepository<T, ID> extends PagingAndSortingRepository<T, ID>, QueryByExampleExecutor<T> {
    List<T> findAll();
    List<T> findAll(Sort sort);
    List<T> findAllById(Iterable<ID> ids);
    <S extends T> List<S> saveAll(Iterable<S> entities);
    void flush();
    <S extends T> S saveAndFlush(S entity);
    void deleteInBatch(Iterable<T> entities);
    void deleteAllInBatch();
    T getOne(ID id);  // Deprecated, use getReferenceById
    T getReferenceById(ID id);
    <S extends T> List<S> saveAllAndFlush(Iterable<S> entities);
    <S extends T> S saveAndFlush(S entity);
}
```

## @EnableJpaRepositories

```java
@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.repository",  // Package chứa repositories
    basePackageClasses = UserRepository.class,  // Hoặc dùng class
    entityManagerFactoryRef = "entityManagerFactory",  // Custom EntityManagerFactory
    transactionManagerRef = "transactionManager",  // Custom TransactionManager
    includeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Repository.class),
    excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Service.class)
)
public class JpaConfig {
    // Configuration
}
```

## Key Concepts

### 1. Repository Pattern

Repository pattern tách biệt business logic khỏi data access logic:
- **Interface**: Định nghĩa operations
- **Implementation**: Spring Data JPA tự động tạo
- **Usage**: Inject repository vào service layer

### 2. Query Methods

Spring Data JPA tự động tạo queries từ method names:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Tự động tạo: SELECT * FROM users WHERE username = ?
    User findByUsername(String username);
    
    // Tự động tạo: SELECT * FROM users WHERE age > ?
    List<User> findByAgeGreaterThan(Integer age);
}
```

### 3. Custom Queries

Sử dụng `@Query` annotation cho complex queries:

```java
@Query("SELECT u FROM User u WHERE u.age > :age")
List<User> findUsersOlderThan(@Param("age") Integer age);
```

### 4. Specifications

Dynamic queries với Specification API:

```java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
}

Specification<User> spec = (root, query, cb) -> 
    cb.greaterThan(root.get("age"), 18);
List<User> users = userRepository.findAll(spec);
```

## Best Practices

1. **Sử dụng Spring Boot Starter** cho setup nhanh
2. **Đặt repositories trong package riêng** (com.example.repository)
3. **Sử dụng @Transactional** ở service layer
4. **Sử dụng Optional** cho find methods
5. **Sử dụng Pageable** cho pagination
6. **Tránh N+1 queries** với EntityGraph hoặc JOIN FETCH
7. **Sử dụng @Query** cho complex queries
8. **Test repositories** với @DataJpaTest

## Common Issues và Solutions

### Issue 1: Repository không được scan

**Solution:**
```java
@EnableJpaRepositories(basePackages = "com.example.repository")
```

### Issue 2: Entity không được scan

**Solution:**
```java
em.setPackagesToScan("com.example.entity");
```

### Issue 3: Transaction không hoạt động

**Solution:**
```java
@EnableTransactionManagement
@Transactional  // Ở service method hoặc class
```

### Issue 4: LazyInitializationException

**Solution:**
- Sử dụng EntityGraph
- Sử dụng JOIN FETCH trong @Query
- Sử dụng @Transactional ở service layer

## Tổng kết

- Spring Data JPA giảm boilerplate code đáng kể
- Repository pattern đơn giản hóa data access
- Query methods tự động tạo queries từ method names
- Custom queries cho complex scenarios
- Specifications cho dynamic queries
- Tích hợp tốt với Spring Framework và Spring Boot
