# Performance Optimization - Câu hỏi phỏng vấn JPA

## Mục lục
1. [N+1 Problem](#n1-problem)
2. [Lazy vs Eager Loading](#lazy-vs-eager-loading)
3. [Batch Operations](#batch-operations)
4. [Caching](#caching)
5. [Query Optimization](#query-optimization)
6. [Connection Pooling](#connection-pooling)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## N+1 Problem

### Problem Definition

**N+1 Problem:** Khi load N entities, Hibernate thực hiện **1 query** cho parent entities và **N queries** riêng biệt cho child entities. Tổng cộng **(1 + N) queries** thay vì chỉ 1-2 queries.

### Data Model

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue
    private Long id;
    private String product;
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

### Dữ liệu mẫu (Sample Data)

```sql
-- users table (3 records)
| id | username |
|----|----------|
| 1  | alice    |
| 2  | bob      |
| 3  | charlie  |

-- orders table (5 records)
| id | product   | amount | user_id |
|----|-----------|--------|---------|
| 1  | Laptop    | 1500   | 1       |
| 2  | Phone     | 800    | 1       |
| 3  | Tablet    | 600    | 2       |
| 4  | Monitor   | 400    | 2       |
| 5  | Keyboard  | 100    | 3       |
```

### Problem Example

```java
// ❌ Code gây N+1
List<User> users = userRepository.findAll();
for (User user : users) {
    System.out.println(user.getUsername() + " has " + user.getOrders().size() + " orders");
}
```

**ĐẦU VÀO (Input):**
- Gọi `findAll()` → load tất cả users
- Trong vòng lặp, truy cập `user.getOrders()` → trigger lazy loading cho mỗi user

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- Query 1: Load tất cả users
SELECT u.id, u.username FROM users u;
-- Kết quả: 3 rows (alice, bob, charlie)

-- Query 2: Load orders cho user_id = 1 (alice)
SELECT o.id, o.product, o.amount, o.user_id FROM orders o WHERE o.user_id = 1;
-- Kết quả: 2 rows (Laptop, Phone)

-- Query 3: Load orders cho user_id = 2 (bob)
SELECT o.id, o.product, o.amount, o.user_id FROM orders o WHERE o.user_id = 2;
-- Kết quả: 2 rows (Tablet, Monitor)

-- Query 4: Load orders cho user_id = 3 (charlie)
SELECT o.id, o.product, o.amount, o.user_id FROM orders o WHERE o.user_id = 3;
-- Kết quả: 1 row (Keyboard)
```

**Tổng: 1 + 3 = 4 queries** (với 1000 users sẽ là **1001 queries!**)

**Console output:**

```
alice has 2 orders
bob has 2 orders
charlie has 1 orders
```

---

### Solution 1: JOIN FETCH (JPQL)

> Giải pháp phổ biến nhất — dùng `JOIN FETCH` trong JPQL để load parent và child trong **1 query duy nhất**.

```java
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders")
    List<User> findAllWithOrders();
}
```

**ĐẦU VÀO (Input):**
- JPQL: `SELECT DISTINCT u FROM User u JOIN FETCH u.orders`
- `JOIN FETCH` chỉ thị Hibernate load luôn collection `orders` cùng lúc
- `DISTINCT` để loại bỏ duplicate rows do JOIN

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- Chỉ 1 query duy nhất
SELECT DISTINCT
    u.id       AS u_id,
    u.username AS u_username,
    o.id       AS o_id,
    o.product  AS o_product,
    o.amount   AS o_amount,
    o.user_id  AS o_user_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

**Result set trả về từ DB:**

```
| u_id | u_username | o_id | o_product | o_amount | o_user_id |
|------|------------|------|-----------|----------|-----------|
| 1    | alice      | 1    | Laptop    | 1500     | 1         |
| 1    | alice      | 2    | Phone     | 800      | 1         |
| 2    | bob        | 3    | Tablet    | 600      | 2         |
| 2    | bob        | 4    | Monitor   | 400      | 2         |
| 3    | charlie    | 5    | Keyboard  | 100      | 3         |
```

**Hibernate mapping:** 5 rows → 3 User objects (mỗi User chứa sẵn List\<Order\>)

**Tổng: 1 query** (giảm từ 4 xuống 1)

**Lưu ý:**
- `INNER JOIN FETCH` → users không có orders sẽ **bị loại** (charlie sẽ bị mất nếu không có order)
- Dùng `LEFT JOIN FETCH` nếu muốn giữ cả users không có orders:

```java
@Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

```sql
-- LEFT JOIN giữ lại tất cả users
SELECT DISTINCT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Kết quả: Users không có orders vẫn xuất hiện (orders columns = NULL)
```

**Hạn chế:**
- Không dùng được với **Pagination** (`Page`/`Pageable`) — Hibernate sẽ load **toàn bộ** rồi phân trang trong memory → `HHH000104: firstResult/maxResults specified with collection fetch; applying in memory!`
- Chỉ `JOIN FETCH` được **1 collection** cùng lúc (2 collections → `MultipleBagFetchException`)

---

### Solution 2: EntityGraph

> Khai báo graph các attributes cần load, Hibernate tự sinh JOIN query.

#### 2a. Named EntityGraph

```java
@Entity
@NamedEntityGraph(
    name = "User.withOrders",
    attributeNodes = @NamedAttributeNode("orders")
)
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph("User.withOrders")
    @Override
    List<User> findAll();
}
```

**ĐẦU VÀO (Input):**
- `@NamedEntityGraph` định nghĩa graph tên `"User.withOrders"` với attribute `orders`
- `@EntityGraph("User.withOrders")` áp dụng lên method `findAll()`

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- 1 query với LEFT JOIN (EntityGraph mặc định dùng LEFT JOIN)
SELECT
    u.id, u.username,
    o.id, o.product, o.amount, o.user_id
FROM users u
LEFT OUTER JOIN orders o ON u.id = o.user_id;
```

**Tổng: 1 query**

#### 2b. Ad-hoc EntityGraph (Inline)

```java
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"orders"})
    List<User> findByUsernameContaining(String keyword);

    // Nhiều attributes cùng lúc
    @EntityGraph(attributePaths = {"orders", "profile", "roles"})
    Optional<User> findById(Long id);
}
```

**ĐẦU VÀO (Input):**
- `attributePaths = {"orders"}` — không cần định nghĩa `@NamedEntityGraph` trên entity
- Có thể kết hợp nhiều attributes

**ĐẦU RA (Output) — SQL cho `findByUsernameContaining("ali")`:**

```sql
SELECT u.*, o.*
FROM users u
LEFT OUTER JOIN orders o ON u.id = o.user_id
WHERE u.username LIKE '%ali%';

-- Kết quả:
| u_id | u_username | o_id | o_product | o_amount |
|------|------------|------|-----------|----------|
| 1    | alice      | 1    | Laptop    | 1500     |
| 1    | alice      | 2    | Phone     | 800      |
```

**Tổng: 1 query**

**So sánh với JOIN FETCH:**
| Tiêu chí | JOIN FETCH | EntityGraph |
|-----------|-----------|-------------|
| Cú pháp | JPQL string | Annotation |
| JOIN type mặc định | INNER JOIN | LEFT OUTER JOIN |
| Reusability | Hardcoded trong query | Tái sử dụng graph |
| Dynamic control | Khó thay đổi | Dễ thay đổi per-method |

---

### Solution 3: @BatchSize

> Thay vì N queries riêng lẻ, Hibernate gom nhiều IDs vào **1 query với IN clause**. Giảm N queries xuống còn **⌈N/batchSize⌉ queries**.

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @BatchSize(size = 5)  // Load orders cho 5 users mỗi lần
    private List<Order> orders = new ArrayList<>();
}
```

**ĐẦU VÀO (Input):**
- `@BatchSize(size = 5)` trên collection `orders`
- Code vẫn giữ nguyên vòng lặp bình thường (không cần thay đổi Repository/Service):

```java
List<User> users = userRepository.findAll();  // 10 users
for (User user : users) {
    user.getOrders().size();  // trigger lazy load
}
```

**ĐẦU RA (Output) — SQL được sinh ra (giả sử 10 users):**

```sql
-- Query 1: Load tất cả users
SELECT u.id, u.username FROM users u;
-- Kết quả: 10 users (id = 1..10)

-- Query 2: Khi access orders lần đầu → batch load cho 5 users đầu tiên
SELECT o.id, o.product, o.amount, o.user_id
FROM orders o
WHERE o.user_id IN (1, 2, 3, 4, 5);

-- Query 3: Khi access orders user thứ 6 → batch load cho 5 users tiếp theo
SELECT o.id, o.product, o.amount, o.user_id
FROM orders o
WHERE o.user_id IN (6, 7, 8, 9, 10);
```

**Tổng: 1 + ⌈10/5⌉ = 3 queries** (thay vì 1 + 10 = 11 queries)

**Có thể đặt global trong `application.yml`:**

```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 20  # Áp dụng cho tất cả lazy collections
```

**ĐẦU RA (Output) với `default_batch_fetch_size=20` và 50 users:**

```sql
-- Query 1: Load users
SELECT u.id, u.username FROM users u;

-- Query 2: Batch 1 (user 1-20)
SELECT o.* FROM orders o WHERE o.user_id IN (1,2,3,...,20);

-- Query 3: Batch 2 (user 21-40)
SELECT o.* FROM orders o WHERE o.user_id IN (21,22,23,...,40);

-- Query 4: Batch 3 (user 41-50)
SELECT o.* FROM orders o WHERE o.user_id IN (41,42,43,...,50);
```

**Tổng: 1 + ⌈50/20⌉ = 4 queries** (thay vì 51)

**Ưu điểm so với JOIN FETCH:**
- Hoạt động tốt với **Pagination**
- Không gây `MultipleBagFetchException`
- Không cần thay đổi query

**Nhược điểm:**
- Vẫn nhiều hơn 1 query (nhưng chấp nhận được)
- Cần chọn batch size phù hợp (quá lớn → IN clause quá dài)

---

### Solution 4: @Fetch(FetchMode.SUBSELECT)

> Hibernate load **tất cả** child entities bằng **1 subselect query** dựa trên query gốc. Luôn giảm xuống đúng **2 queries** bất kể số lượng parents.

```java
@Entity
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    private List<Order> orders = new ArrayList<>();
}
```

**ĐẦU VÀO (Input):**
- `@Fetch(FetchMode.SUBSELECT)` trên collection
- Code không cần thay đổi:

```java
List<User> users = userRepository.findAll();  // 100 users
for (User user : users) {
    user.getOrders().size();
}
```

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- Query 1: Load tất cả users
SELECT u.id, u.username FROM users u;

-- Query 2: Khi access orders lần đầu → load TẤT CẢ orders bằng subselect
SELECT o.id, o.product, o.amount, o.user_id
FROM orders o
WHERE o.user_id IN (
    SELECT u.id FROM users u   -- Lặp lại query gốc làm subselect
);
```

**Tổng: luôn là 2 queries** (bất kể 10, 100 hay 1000 users)

**So sánh:**
| Số users | N+1 (không fix) | @BatchSize(20) | SUBSELECT | JOIN FETCH |
|----------|-----------------|----------------|-----------|------------|
| 10       | 11 queries      | 2 queries      | 2 queries | 1 query    |
| 100      | 101 queries     | 6 queries      | 2 queries | 1 query    |
| 1000     | 1001 queries    | 51 queries     | 2 queries | 1 query    |

---

### Solution 5: Fetch Join trong Criteria API

> Sử dụng programmatic Criteria API thay vì JPQL string — phù hợp cho dynamic queries.

```java
@Service
public class UserService {

    @PersistenceContext
    private EntityManager em;

    public List<User> findAllWithOrders() {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> user = query.from(User.class);
        user.fetch("orders", JoinType.LEFT);
        query.distinct(true);
        return em.createQuery(query).getResultList();
    }

    // Dynamic: chỉ fetch khi cần
    public List<User> findUsers(boolean includeOrders, String usernameFilter) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> user = query.from(User.class);

        if (includeOrders) {
            user.fetch("orders", JoinType.LEFT);
        }

        if (usernameFilter != null) {
            query.where(cb.like(user.get("username"), "%" + usernameFilter + "%"));
        }

        query.distinct(true);
        return em.createQuery(query).getResultList();
    }
}
```

**ĐẦU VÀO (Input):**
- `user.fetch("orders", JoinType.LEFT)` → tương đương `LEFT JOIN FETCH` trong JPQL
- `includeOrders = true`, `usernameFilter = "ali"`

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- Khi includeOrders=true, usernameFilter="ali"
SELECT DISTINCT u.*, o.*
FROM users u
LEFT OUTER JOIN orders o ON u.id = o.user_id
WHERE u.username LIKE '%ali%';

-- Kết quả:
| u_id | u_username | o_id | o_product | o_amount |
|------|------------|------|-----------|----------|
| 1    | alice      | 1    | Laptop    | 1500     |
| 1    | alice      | 2    | Phone     | 800      |
```

```sql
-- Khi includeOrders=false, usernameFilter=null
SELECT u.id, u.username
FROM users u;
-- Orders KHÔNG được load → không có JOIN
```

**Tổng: 1 query**

---

### Solution 6: DTO Projection (Tránh N+1 hoàn toàn)

> Thay vì load entities, query trực tiếp các columns cần thiết vào DTO — **không trigger lazy loading**, không có N+1.

```java
// DTO
public record UserOrderDTO(
    Long userId,
    String username,
    Long orderId,
    String product,
    BigDecimal amount
) {}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("""
        SELECT new com.example.dto.UserOrderDTO(
            u.id, u.username, o.id, o.product, o.amount
        )
        FROM User u LEFT JOIN u.orders o
        """)
    List<UserOrderDTO> findAllUserOrders();
}
```

**ĐẦU VÀO (Input):**
- JPQL `SELECT new ... FROM User u LEFT JOIN u.orders o`
- Kết quả trả về là DTO, **không phải** managed entity → không có lazy proxy

**ĐẦU RA (Output) — SQL được sinh ra:**

```sql
-- 1 query, chỉ select columns cần thiết
SELECT u.id, u.username, o.id, o.product, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

**Result set:**

```
| userId | username | orderId | product  | amount |
|--------|----------|---------|----------|--------|
| 1      | alice    | 1       | Laptop   | 1500   |
| 1      | alice    | 2       | Phone    | 800    |
| 2      | bob      | 3       | Tablet   | 600    |
| 2      | bob      | 4       | Monitor  | 400    |
| 3      | charlie  | 5       | Keyboard | 100    |
```

**Java objects trả về:** 5 `UserOrderDTO` objects (flat, không nested)

**Tổng: 1 query, không có N+1 vì không dùng entity**

**Ưu điểm:**
- Hiệu năng tốt nhất (chỉ select columns cần)
- Hoạt động tốt với Pagination
- Không lo `MultipleBagFetchException`

**Nhược điểm:**
- Kết quả flat (cần group lại nếu muốn nested structure)
- Không thể modify và save lại (read-only)

---

### Tổng hợp so sánh các Solutions

| Solution | Số queries | Pagination | Multi-collection | Thay đổi code |
|----------|-----------|------------|------------------|---------------|
| ❌ Không fix (N+1) | 1 + N | ✅ | ✅ | Không |
| ① JOIN FETCH | **1** | ❌ (in-memory) | ❌ MultipleBagFetch | Thay đổi query |
| ② EntityGraph | **1** | ❌ (in-memory) | ❌ MultipleBagFetch | Thêm annotation |
| ③ @BatchSize | 1 + ⌈N/size⌉ | ✅ | ✅ | Thêm annotation |
| ④ SUBSELECT | **2** | ✅ | ✅ | Thêm annotation |
| ⑤ Criteria Fetch | **1** | ❌ (in-memory) | ❌ MultipleBagFetch | Viết Criteria |
| ⑥ DTO Projection | **1** | ✅ | ✅ | Viết DTO + query |

### Khuyến nghị chọn Solution

```
Cần Pagination?
├── Không → JOIN FETCH hoặc EntityGraph (đơn giản nhất, 1 query)
└── Có
    ├── Cần modify entity? 
    │   ├── Có → @BatchSize hoặc SUBSELECT
    │   └── Không → DTO Projection (hiệu năng tốt nhất)
    └── Nhiều collections?
        ├── Có → @BatchSize / SUBSELECT / DTO Projection
        └── Không → Tất cả đều được

Fetch 1 collection, không pagination → JOIN FETCH ✅
Fetch nhiều collections, có pagination → @BatchSize + DTO Projection ✅
Read-only report/API → DTO Projection ✅
```

---

## Lazy vs Eager Loading

### Lazy Loading

```java
@Entity
public class User {
    @OneToMany(fetch = FetchType.LAZY)
    private List<Order> orders;  // Loaded when accessed
}

// Usage
User user = userRepository.findById(1L).orElse(null);
// Orders not loaded yet

List<Order> orders = user.getOrders();  // Loaded here (if in transaction)
```

**Pros:**
- Load only what you need
- Better initial performance
- Less memory usage

**Cons:**
- LazyInitializationException if outside transaction
- Multiple queries if not using JOIN FETCH

### Eager Loading

```java
@Entity
public class User {
    @OneToMany(fetch = FetchType.EAGER)
    private List<Order> orders;  // Loaded immediately
}

// Usage
User user = userRepository.findById(1L).orElse(null);
// Orders already loaded
List<Order> orders = user.getOrders();  // No additional query
```

**Pros:**
- No LazyInitializationException
- Data available immediately

**Cons:**
- Loads data you might not need
- Can cause N+1 problem
- Slower initial load

### Best Practices

```java
// ✅ Good: LAZY for @OneToMany
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;

// ✅ Good: LAZY for @ManyToMany
@ManyToMany(fetch = FetchType.LAZY)
private Set<Course> courses;

// ✅ Good: LAZY for @ManyToOne (usually)
@ManyToOne(fetch = FetchType.LAZY)
private User user;

// ⚠️ Consider: EAGER for @OneToOne (if always needed)
@OneToOne(fetch = FetchType.EAGER)
private UserProfile profile;
```

---

## Batch Operations

### Batch Insert

```java
// ❌ Bad: Multiple inserts
for (User user : users) {
    userRepository.save(user);  // One INSERT per user
}
// 1000 users = 1000 INSERT statements

// ✅ Good: Batch insert
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public void saveUsersBatch(List<User> users) {
        int batchSize = 50;
        for (int i = 0; i < users.size(); i++) {
            em.persist(users.get(i));
            if (i % batchSize == 0 && i > 0) {
                em.flush();
                em.clear();
            }
        }
    }
}

// Configuration
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### Batch Update

```java
// ❌ Bad: Multiple updates
for (User user : users) {
    user.setActive(true);
    userRepository.save(user);  // One UPDATE per user
}

// ✅ Good: Batch update với @Query
@Modifying
@Query("UPDATE User u SET u.active = :active WHERE u.id IN :ids")
void updateActiveStatus(@Param("ids") List<Long> ids, @Param("active") Boolean active);

// ✅ Good: Batch update với EntityManager
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public void updateUsersBatch(List<User> users) {
        int batchSize = 50;
        for (int i = 0; i < users.size(); i++) {
            em.merge(users.get(i));
            if (i % batchSize == 0 && i > 0) {
                em.flush();
                em.clear();
            }
        }
    }
}
```

### Batch Delete

```java
// ❌ Bad: Multiple deletes
for (User user : users) {
    userRepository.delete(user);  // One DELETE per user
}

// ✅ Good: Batch delete với @Query
@Modifying
@Query("DELETE FROM User u WHERE u.id IN :ids")
void deleteByIds(@Param("ids") List<Long> ids);

// ✅ Good: Delete in batch
@Service
@Transactional
public class UserService {
    @PersistenceContext
    private EntityManager em;
    
    public void deleteUsersBatch(List<Long> ids) {
        int batchSize = 50;
        for (int i = 0; i < ids.size(); i++) {
            User user = em.getReference(User.class, ids.get(i));
            em.remove(user);
            if (i % batchSize == 0 && i > 0) {
                em.flush();
                em.clear();
            }
        }
    }
}
```

---

## Caching

### First-Level Cache (Persistence Context)

```java
// Automatic first-level cache
EntityManager em = emf.createEntityManager();

User user1 = em.find(User.class, 1L);  // Query database
User user2 = em.find(User.class, 1L);  // Return from cache (no query)

assert user1 == user2;  // Same instance
```

### Second-Level Cache

```java
// Enable second-level cache
@Entity
@Cacheable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class User {
    // ...
}

// Configuration
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory

// Usage
@Cacheable("users")
public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
}

@CacheEvict(value = "users", key = "#id")
public void deleteUser(Long id) {
    userRepository.deleteById(id);
}

@CachePut(value = "users", key = "#user.id")
public User updateUser(User user) {
    return userRepository.save(user);
}
```

### Query Cache

```java
// Enable query cache
@QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
@Query("SELECT u FROM User u WHERE u.active = true")
List<User> findActiveUsers();

// Configuration
spring.jpa.properties.hibernate.cache.use_query_cache=true
```

---

## Query Optimization

### Select Only Needed Columns

```java
// ❌ Bad: Select all columns
@Query("SELECT u FROM User u")
List<User> findAll();

// ✅ Good: Select only needed columns
@Query("SELECT u.id, u.username, u.email FROM User u")
List<Object[]> findUserSummaries();

// ✅ Good: Use projection
public interface UserSummary {
    String getUsername();
    String getEmail();
}

@Query("SELECT u.username as username, u.email as email FROM User u")
List<UserSummary> findUserSummaries();
```

### Use Indexes

```java
@Entity
@Table(indexes = {
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_age_city", columnList = "age, city")
})
public class User {
    private String username;
    private String email;
    private Integer age;
    private String city;
}
```

### Avoid SELECT N+1

```java
// ❌ Bad: N+1 queries
List<User> users = userRepository.findAll();
users.forEach(user -> user.getOrders().size());

// ✅ Good: JOIN FETCH
@Query("SELECT DISTINCT u FROM User u JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

### Use Pagination

```java
// ❌ Bad: Load all records
List<User> users = userRepository.findAll();  // Loads all

// ✅ Good: Pagination
Page<User> users = userRepository.findAll(PageRequest.of(0, 20));
```

---

## Connection Pooling

### HikariCP Configuration

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### Connection Pool Sizing

```java
// Formula:
// connections = ((core_count * 2) + effective_spindle_count)

// Example:
// 4 cores, 1 database
// connections = (4 * 2) + 1 = 9

// For read replicas:
// connections = (4 * 2) + 1 = 9 per database
// Total = 9 * 2 = 18 (if 2 databases)
```

---

## Câu hỏi thường gặp

### Q1: Làm sao detect N+1 problem?

```yaml
# application.yml — Bật SQL logging
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        generate_statistics: true   # Hiển thị statistics sau mỗi session
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE  # Log bind parameters
```

**ĐẦU VÀO (Input):** Cấu hình trên + gọi API `GET /users`

**ĐẦU RA (Output) — Console log khi bị N+1:**

```
Hibernate: select u1_0.id, u1_0.username from users u1_0
Hibernate: select o1_0.id, o1_0.product, o1_0.amount from orders o1_0 where o1_0.user_id=?
Hibernate: select o1_0.id, o1_0.product, o1_0.amount from orders o1_0 where o1_0.user_id=?
Hibernate: select o1_0.id, o1_0.product, o1_0.amount from orders o1_0 where o1_0.user_id=?

-- Hibernate Statistics:
-- Session Metrics:
--     12345 nanoseconds spent acquiring 1 JDBC connections;
--     6789 nanoseconds spent executing 4 JDBC statements;     ← 4 statements = N+1!
--     0 nanoseconds spent executing 0 JDBC batches;
```

**Dấu hiệu nhận biết:**
- Nhiều queries có cùng pattern chỉ khác parameter (`WHERE user_id=?`)
- `JDBC statements` count >> expected (4 thay vì 1)
- Có thể dùng thêm library **datasource-proxy** hoặc **p6spy** để đếm queries tự động

### Q2: Khi nào dùng EAGER vs LAZY?

**Use LAZY:**
- Collections (@OneToMany, @ManyToMany)
- Optional relationships
- Large datasets

**Use EAGER:**
- Always needed data
- Small datasets
- @OneToOne (sometimes)

### Q3: Batch size optimization?

```java
// Too small: Many round trips
batch_size = 10  // 1000 records = 100 batches

// Too large: Memory issues
batch_size = 10000  // May cause OutOfMemoryError

// Optimal: 20-50
batch_size = 50  // Good balance
```

### Q4: Caching strategy?

```java
// READ_ONLY: Immutable data
@Cache(usage = CacheConcurrencyStrategy.READ_ONLY)

// READ_WRITE: Read and write
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)

// NONSTRICT_READ_WRITE: Loose consistency
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)

// TRANSACTIONAL: Full ACID
@Cache(usage = CacheConcurrencyStrategy.TRANSACTIONAL)
```

---

## Best Practices

1. **Always use JOIN FETCH** để tránh N+1
2. **Use LAZY fetching** cho collections
3. **Enable batch operations** cho bulk inserts/updates
4. **Use pagination** cho large result sets
5. **Select only needed columns** với projections
6. **Enable second-level cache** cho read-heavy data
7. **Configure connection pool** appropriately
8. **Monitor query performance** với statistics
9. **Use indexes** trên frequently queried columns
10. **Avoid EAGER on collections** (causes N+1)

---

## Bài tập thực hành

### Bài 1: Fix N+1 Problem

```java
// Yêu cầu:
// 1. Identify N+1 problem trong code
// 2. Fix bằng JOIN FETCH
// 3. Fix bằng EntityGraph
// 4. Compare performance
```

### Bài 2: Batch Operations

```java
// Yêu cầu: Implement batch insert/update/delete
// 1. Insert 10,000 users efficiently
// 2. Update 10,000 users efficiently
// 3. Delete 10,000 users efficiently
```

---

## Tổng kết

- **N+1 Problem**: 1 query parent + N queries child → fix bằng 6 solutions
  - **JOIN FETCH / EntityGraph**: 1 query, tốt nhất cho single collection không pagination
  - **@BatchSize**: ⌈N/size⌉ queries, tốt cho pagination + multi-collection
  - **SUBSELECT**: 2 queries, tốt cho large datasets
  - **DTO Projection**: 1 query, hiệu năng tốt nhất cho read-only
- **Lazy vs Eager**: LAZY for collections, EAGER when needed
- **Batch Operations**: Configure batch size, use flush/clear
- **Caching**: First-level, second-level, query cache
- **Query Optimization**: Select needed columns, use indexes, pagination
- **Connection Pooling**: Proper sizing and configuration
- **Best Practices**: Monitor, optimize, test performance
