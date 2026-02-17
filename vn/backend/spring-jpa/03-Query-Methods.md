# Query Methods trong Spring Data JPA

## Tổng quan

Spring Data JPA tự động tạo queries từ method names theo naming conventions. Đây là cách đơn giản nhất để tạo queries mà không cần viết SQL/JPQL.

## Method Naming Conventions

### Cấu trúc Method Name

```
[find|read|get|query|stream|count|exists|delete|remove][Distinct][By...]
```

**Pattern:**
- **Prefix**: find, read, get, query, stream, count, exists, delete, remove
- **Distinct** (optional): Loại bỏ duplicates
- **By**: Bắt đầu điều kiện
- **Conditions**: Field names + keywords

## Query Keywords

### Comparison Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Equals
    User findByUsername(String username);
    User findByUsernameIs(String username);
    User findByUsernameEquals(String username);
    
    // Greater than
    List<User> findByAgeGreaterThan(Integer age);
    List<User> findByAgeGreaterThanEqual(Integer age);
    
    // Less than
    List<User> findByAgeLessThan(Integer age);
    List<User> findByAgeLessThanEqual(Integer age);
    
    // Between
    List<User> findByAgeBetween(Integer min, Integer max);
    
    // After/Before (cho Date/Time)
    List<User> findByCreatedAtAfter(LocalDateTime date);
    List<User> findByCreatedAtBefore(LocalDateTime date);
}
```

### Logical Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // AND
    User findByUsernameAndEmail(String username, String email);
    
    // OR
    List<User> findByUsernameOrEmail(String username, String email);
    
    // NOT
    List<User> findByUsernameNot(String username);
    List<User> findByUsernameIsNot(String username);
}
```

### String Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Like
    List<User> findByUsernameLike(String pattern);  // %pattern%
    List<User> findByUsernameNotLike(String pattern);
    
    // Starting with
    List<User> findByUsernameStartingWith(String prefix);
    
    // Ending with
    List<User> findByUsernameEndingWith(String suffix);
    
    // Containing
    List<User> findByUsernameContaining(String keyword);
    
    // Ignore case
    List<User> findByUsernameIgnoreCase(String username);
    List<User> findByUsernameContainingIgnoreCase(String keyword);
}
```

### Collection Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // In
    List<User> findByAgeIn(List<Integer> ages);
    List<User> findByAgeNotIn(List<Integer> ages);
    
    // Empty
    List<User> findByOrdersIsEmpty();
    List<User> findByOrdersIsNotEmpty();
}
```

### Null Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Null checks
    List<User> findByEmailIsNull();
    List<User> findByEmailIsNotNull();
    List<User> findByEmailNotNull();  // Alias
}
```

### Boolean Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // True/False
    List<User> findByActiveTrue();
    List<User> findByActiveFalse();
    List<User> findByActiveIsTrue();
    List<User> findByActiveIsFalse();
}
```

### Sorting Keywords

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Order by
    List<User> findByAgeOrderByUsernameAsc(Integer age);
    List<User> findByAgeOrderByUsernameDesc(Integer age);
    
    // Multiple sorting
    List<User> findByAgeOrderByUsernameAscAgeDesc(Integer age);
}
```

## Return Types

### Single Result

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Returns entity (throws exception nếu không tìm thấy hoặc nhiều hơn 1)
    User findByUsername(String username);
    
    // Returns Optional (recommended)
    Optional<User> findByUsername(String username);
    
    // Returns first result
    User findFirstByAge(Integer age);
    User findTopByAge(Integer age);
    
    // Returns first N results
    List<User> findFirst3ByAge(Integer age);
    List<User> findTop5ByAge(Integer age);
}
```

### Multiple Results

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // List
    List<User> findByAge(Integer age);
    
    // Set
    Set<User> findByAge(Integer age);
    
    // Stream (cần @Transactional)
    @Transactional(readOnly = true)
    Stream<User> findByAge(Integer age);
    
    // Page
    Page<User> findByAge(Integer age, Pageable pageable);
    
    // Slice
    Slice<User> findByAge(Integer age, Pageable pageable);
}
```

### Count và Exists

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Count
    long countByAge(Integer age);
    long countByAgeGreaterThan(Integer age);
    
    // Exists
    boolean existsByEmail(String email);
    boolean existsByUsernameAndEmail(String username, String email);
}
```

### Delete

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Delete (void)
    void deleteByAge(Integer age);
    
    // Delete và return count
    long deleteByAgeLessThan(Integer age);
    
    // Remove (alias)
    void removeByAge(Integer age);
    long removeByAgeLessThan(Integer age);
}
```

## Nested Properties

```java
@Entity
public class User {
    @OneToOne
    private Address address;
}

@Entity
public class Address {
    private String city;
    private String country;
}

// Query nested properties
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Nested property access
    List<User> findByAddressCity(String city);
    List<User> findByAddressCountry(String country);
    
    // Multiple nested properties
    List<User> findByAddressCityAndAddressCountry(String city, String country);
}
```

## Distinct

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Distinct results
    List<User> findDistinctByAge(Integer age);
    List<User> findDistinctByUsernameContaining(String keyword);
    
    // Distinct với multiple fields
    List<User> findDistinctByAgeAndCity(Integer age, String city);
}
```

## Limiting Results

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // First result
    User findFirstByAge(Integer age);
    Optional<User> findFirstByAge(Integer age);
    
    // Top N results
    List<User> findTop3ByAge(Integer age);
    List<User> findTop5ByAgeOrderByUsernameDesc(Integer age);
    
    // First N with sorting
    List<User> findFirst10ByAgeOrderByCreatedAtDesc(Integer age);
}
```

## Complex Examples

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Multiple conditions
    List<User> findByAgeGreaterThanAndActiveTrueAndEmailContaining(
        Integer age, String emailKeyword);
    
    // Nested properties với conditions
    List<User> findByAddressCityAndAgeBetween(
        String city, Integer minAge, Integer maxAge);
    
    // Complex với sorting
    List<User> findByActiveTrueAndAgeGreaterThanOrderByUsernameAscAgeDesc(
        Integer age);
    
    // Count với conditions
    long countByAgeGreaterThanAndActiveTrue(Integer age);
    
    // Exists với multiple conditions
    boolean existsByUsernameAndEmailAndActiveTrue(
        String username, String email);
}
```

## Best Practices

### 1. Sử dụng Optional cho single result

```java
// ✅ Good
Optional<User> findByUsername(String username);

// ❌ Bad
User findByUsername(String username);  // Throws exception nếu không tìm thấy
```

### 2. Đặt tên method rõ ràng

```java
// ✅ Good
List<User> findActiveUsersByAgeGreaterThan(Integer age);

// ❌ Bad
List<User> find(Integer age);
```

### 3. Sử dụng Pageable cho large results

```java
// ✅ Good
Page<User> findByAge(Integer age, Pageable pageable);

// ❌ Bad
List<User> findByAge(Integer age);  // Có thể trả về hàng nghìn records
```

### 4. Sử dụng Stream cho large datasets

```java
// ✅ Good - Memory efficient
@Transactional(readOnly = true)
Stream<User> findByAge(Integer age);

// ❌ Bad - Load tất cả vào memory
List<User> findByAge(Integer age);
```

### 5. Tránh quá nhiều conditions

```java
// ✅ Good - Sử dụng @Query hoặc Specifications
@Query("SELECT u FROM User u WHERE ...")
List<User> findComplexUsers(...);

// ❌ Bad - Method name quá dài
List<User> findByAgeGreaterThanAndActiveTrueAndEmailContainingAndCityEqualsAndCountryIn(...);
```

## Common Issues

### Issue 1: Method không được tìm thấy

**Solution:**
- Kiểm tra naming convention
- Đảm bảo field names đúng
- Kiểm tra return type

### Issue 2: Ambiguous method

**Solution:**
- Đảm bảo method names unique
- Sử dụng @Query nếu cần

### Issue 3: Property không tồn tại

**Solution:**
- Kiểm tra entity class
- Đảm bảo field names đúng (case-sensitive)

## Tổng kết

- **Query Methods** tự động tạo queries từ method names
- **Naming conventions** rất quan trọng
- **Return types** linh hoạt (Optional, List, Page, Stream)
- **Nested properties** được hỗ trợ
- **Best practices** để code clean và maintainable
