# Repository Pattern trong Spring Data JPA

## Tổng quan

Repository Pattern là một design pattern tách biệt business logic khỏi data access logic. Spring Data JPA cung cấp implementation tự động cho repository pattern.

## Repository Interfaces

### 1. Repository (Base Interface)

```java
// Base interface - không có methods
public interface Repository<T, ID> {
    // Marker interface
}

// Usage: Tự định nghĩa tất cả methods
public interface UserRepository extends Repository<User, Long> {
    User findById(Long id);
    List<User> findAll();
    User save(User user);
    void deleteById(Long id);
}
```

### 2. CrudRepository

```java
// Basic CRUD operations
public interface CrudRepository<T, ID> extends Repository<T, ID> {
    
    // Save operations
    <S extends T> S save(S entity);
    <S extends T> Iterable<S> saveAll(Iterable<S> entities);
    
    // Find operations
    Optional<T> findById(ID id);
    boolean existsById(ID id);
    Iterable<T> findAll();
    Iterable<T> findAllById(Iterable<ID> ids);
    long count();
    
    // Delete operations
    void deleteById(ID id);
    void delete(T entity);
    void deleteAll(Iterable<? extends T> entities);
    void deleteAll();
}

// Example
public interface UserRepository extends CrudRepository<User, Long> {
    // Inherits all CRUD methods
}
```

### 3. PagingAndSortingRepository

```java
// CrudRepository + Pagination + Sorting
public interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {
    Iterable<T> findAll(Sort sort);
    Page<T> findAll(Pageable pageable);
}

// Example
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    // Inherits CRUD + pagination + sorting
}

// Usage
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getUsersSorted() {
        Sort sort = Sort.by("username").ascending();
        return userRepository.findAll(sort);
    }
    
    public Page<User> getUsersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }
}
```

### 4. JpaRepository (Recommended)

```java
// Full-featured repository với JPA-specific methods
public interface JpaRepository<T, ID> extends PagingAndSortingRepository<T, ID>, QueryByExampleExecutor<T> {
    
    // List versions (thay vì Iterable)
    List<T> findAll();
    List<T> findAll(Sort sort);
    List<T> findAllById(Iterable<ID> ids);
    
    // Batch operations
    <S extends T> List<S> saveAll(Iterable<S> entities);
    void deleteAllInBatch();
    void deleteAllByIdInBatch(Iterable<ID> ids);
    
    // Flush operations
    void flush();
    <S extends T> S saveAndFlush(S entity);
    <S extends T> List<S> saveAllAndFlush(Iterable<S> entities);
    
    // Get reference (lazy loading)
    T getReferenceById(ID id);  // Thay thế getOne() (deprecated)
    
    // Delete by ID
    void deleteById(ID id);
}

// Example
public interface UserRepository extends JpaRepository<User, Long> {
    // Full CRUD + pagination + sorting + batch operations
}
```

## So sánh các Repository Interfaces

| Feature | Repository | CrudRepository | PagingAndSortingRepository | JpaRepository |
|---------|-----------|----------------|---------------------------|---------------|
| **Basic CRUD** | ❌ | ✅ | ✅ | ✅ |
| **Pagination** | ❌ | ❌ | ✅ | ✅ |
| **Sorting** | ❌ | ❌ | ✅ | ✅ |
| **Batch Operations** | ❌ | ❌ | ❌ | ✅ |
| **Flush Operations** | ❌ | ❌ | ❌ | ✅ |
| **List Return Types** | ❌ | ❌ | ❌ | ✅ |
| **QueryByExample** | ❌ | ❌ | ❌ | ✅ |

## Repository Methods

### Save Operations

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Save single entity
    public User createUser(User user) {
        return userRepository.save(user);  // Insert hoặc Update
    }
    
    // Save multiple entities
    public List<User> createUsers(List<User> users) {
        return userRepository.saveAll(users);
    }
    
    // Save and flush immediately
    public User createUserAndFlush(User user) {
        return userRepository.saveAndFlush(user);
    }
    
    // Save all and flush
    public List<User> createUsersAndFlush(List<User> users) {
        return userRepository.saveAllAndFlush(users);
    }
}
```

### Find Operations

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Find by ID
    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }
    
    // Find all
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Find all by IDs
    public List<User> getUsersByIds(List<Long> ids) {
        return userRepository.findAllById(ids);
    }
    
    // Get reference (lazy, không query database ngay)
    public User getUserReference(Long id) {
        return userRepository.getReferenceById(id);
    }
    
    // Check existence
    public boolean userExists(Long id) {
        return userRepository.existsById(id);
    }
    
    // Count
    public long countUsers() {
        return userRepository.count();
    }
}
```

### Delete Operations

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Delete by ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // Delete entity
    public void deleteUser(User user) {
        userRepository.delete(user);
    }
    
    // Delete all by IDs
    public void deleteUsers(List<Long> ids) {
        List<User> users = userRepository.findAllById(ids);
        userRepository.deleteAll(users);
    }
    
    // Delete all
    public void deleteAllUsers() {
        userRepository.deleteAll();
    }
    
    // Delete all in batch (efficient)
    public void deleteAllUsersInBatch() {
        userRepository.deleteAllInBatch();
    }
    
    // Delete by IDs in batch
    public void deleteUsersByIdsInBatch(List<Long> ids) {
        userRepository.deleteAllByIdInBatch(ids);
    }
}
```

## Custom Repository Implementation

### 1. Custom Interface

```java
// Custom interface
public interface UserRepositoryCustom {
    List<User> findActiveUsers();
    void updateUserStatus(Long id, UserStatus status);
}

// Repository extends custom interface
public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {
    // Standard methods + custom methods
}
```

### 2. Custom Implementation

```java
// Implementation class (phải kết thúc bằng "Impl")
@Repository
public class UserRepositoryImpl implements UserRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public List<User> findActiveUsers() {
        return entityManager.createQuery(
            "SELECT u FROM User u WHERE u.status = :status", User.class)
            .setParameter("status", UserStatus.ACTIVE)
            .getResultList();
    }
    
    @Override
    public void updateUserStatus(Long id, UserStatus status) {
        User user = entityManager.find(User.class, id);
        if (user != null) {
            user.setStatus(status);
            entityManager.merge(user);
        }
    }
}
```

### 3. Custom Postfix (Optional)

```java
// Nếu muốn dùng postfix khác "Impl"
@EnableJpaRepositories(
    basePackages = "com.example.repository",
    repositoryImplementationPostfix = "Custom"  // Thay vì "Impl"
)
public class JpaConfig {
}

// Implementation class
@Repository
public class UserRepositoryCustom implements UserRepositoryCustom {
    // Implementation
}
```

## Repository Composition

### Multiple Repository Interfaces

```java
// Repository extends multiple interfaces
public interface UserRepository extends 
    JpaRepository<User, Long>,
    JpaSpecificationExecutor<User>,  // Specifications
    QueryByExampleExecutor<User> {    // Query by Example
    
    // Custom methods
    List<User> findByUsername(String username);
}
```

### JpaSpecificationExecutor

```java
public interface JpaSpecificationExecutor<T> {
    Optional<T> findOne(Specification<T> spec);
    List<T> findAll(Specification<T> spec);
    Page<T> findAll(Specification<T> spec, Pageable pageable);
    List<T> findAll(Specification<T> spec, Sort sort);
    long count(Specification<T> spec);
}

// Usage
public interface UserRepository extends 
    JpaRepository<User, Long>,
    JpaSpecificationExecutor<User> {
}

// Service
Specification<User> spec = (root, query, cb) -> 
    cb.equal(root.get("status"), UserStatus.ACTIVE);
List<User> activeUsers = userRepository.findAll(spec);
```

### QueryByExampleExecutor

```java
public interface QueryByExampleExecutor<T> {
    <S extends T> Optional<S> findOne(Example<S> example);
    <S extends T> Iterable<S> findAll(Example<S> example);
    <S extends T> Iterable<S> findAll(Example<S> example, Sort sort);
    <S extends T> Page<S> findAll(Example<S> example, Pageable pageable);
    <S extends T> long count(Example<S> example);
    <S extends T> boolean exists(Example<S> example);
}

// Usage
User probe = new User();
probe.setStatus(UserStatus.ACTIVE);
Example<User> example = Example.of(probe);
List<User> activeUsers = userRepository.findAll(example);
```

## Repository Lifecycle

### Repository Creation

```java
// Spring tự động tạo proxy implementation
@EnableJpaRepositories(basePackages = "com.example.repository")
public class JpaConfig {
    // Spring scan và tạo implementations
}

// Repository interface
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring tạo implementation tự động
}

// Usage - Spring inject proxy
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Proxy được inject
}
```

### Transaction Management

```java
// Repository methods mặc định là transactional
// Nhưng nên đặt @Transactional ở service layer

@Service
@Transactional  // Class level
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional(readOnly = true)  // Method level
    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @Transactional  // Write operation
    public User createUser(User user) {
        return userRepository.save(user);
    }
}
```

## Best Practices

### 1. Chọn đúng Repository Interface

```java
// ✅ Nếu chỉ cần CRUD
public interface UserRepository extends CrudRepository<User, Long> {
}

// ✅ Nếu cần pagination/sorting
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
}

// ✅ Nếu cần đầy đủ features (recommended)
public interface UserRepository extends JpaRepository<User, Long> {
}
```

### 2. Đặt tên Repository rõ ràng

```java
// ✅ Good
public interface UserRepository extends JpaRepository<User, Long> {
}

// ❌ Bad
public interface UserRepo extends JpaRepository<User, Long> {
}
```

### 3. Sử dụng Optional cho find methods

```java
// ✅ Good
public Optional<User> getUser(Long id) {
    return userRepository.findById(id);
}

// ❌ Bad
public User getUser(Long id) {
    return userRepository.findById(id).orElse(null);
}
```

### 4. Sử dụng batch operations cho multiple entities

```java
// ✅ Good - Efficient
public void deleteUsers(List<Long> ids) {
    userRepository.deleteAllByIdInBatch(ids);
}

// ❌ Bad - N queries
public void deleteUsers(List<Long> ids) {
    ids.forEach(userRepository::deleteById);
}
```

### 5. Sử dụng flush khi cần

```java
// ✅ Khi cần data ngay lập tức
public User createUserAndGetId(User user) {
    User saved = userRepository.saveAndFlush(user);
    Long id = saved.getId();  // ID đã có sau flush
    return saved;
}
```

## Common Issues

### Issue 1: Repository không được inject

**Solution:**
```java
@EnableJpaRepositories(basePackages = "com.example.repository")
```

### Issue 2: Custom implementation không được tìm thấy

**Solution:**
- Class name phải kết thúc bằng "Impl"
- Hoặc config custom postfix

### Issue 3: Transaction không hoạt động

**Solution:**
```java
@EnableTransactionManagement
@Transactional  // Ở service layer
```

## Tổng kết

- **Repository Pattern** tách biệt business logic và data access
- **JpaRepository** là lựa chọn tốt nhất cho hầu hết cases
- **Custom implementations** cho logic phức tạp
- **Composition** với JpaSpecificationExecutor và QueryByExampleExecutor
- **Best practices** để code clean và efficient
