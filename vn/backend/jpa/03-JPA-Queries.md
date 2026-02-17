# JPA Queries - Câu hỏi phỏng vấn

## Mục lục
1. [JPQL (Java Persistence Query Language)](#jpql)
2. [Native Queries](#native-queries)
3. [Criteria API](#criteria-api)
4. [Named Queries](#named-queries)
5. [Query Parameters](#query-parameters)
6. [Pagination và Sorting](#pagination-và-sorting)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## JPQL (Java Persistence Query Language)

### Basic JPQL

```java
// SELECT query
List<User> users = em.createQuery("SELECT u FROM User u", User.class)
    .getResultList();

// WHERE clause
List<User> users = em.createQuery(
    "SELECT u FROM User u WHERE u.age > :age", User.class
)
.setParameter("age", 18)
.getResultList();

// JOIN
List<Order> orders = em.createQuery(
    "SELECT o FROM Order o JOIN o.user u WHERE u.username = :username", 
    Order.class
)
.setParameter("username", "john")
.getResultList();

// JOIN FETCH (eager loading)
List<User> users = em.createQuery(
    "SELECT u FROM User u JOIN FETCH u.orders", User.class
).getResultList();
```

### JPQL Functions

```java
// String functions
SELECT u FROM User u WHERE LOWER(u.username) = :username
SELECT u FROM User u WHERE UPPER(u.email) LIKE :pattern
SELECT u FROM User u WHERE LENGTH(u.username) > 5
SELECT u FROM User u WHERE SUBSTRING(u.username, 1, 3) = 'abc'
SELECT u FROM User u WHERE TRIM(u.username) = :username
SELECT u FROM User u WHERE CONCAT(u.firstName, ' ', u.lastName) = :fullName

// Numeric functions
SELECT u FROM User u WHERE ABS(u.balance) > 1000
SELECT u FROM User u WHERE MOD(u.age, 2) = 0
SELECT u FROM User u WHERE SQRT(u.score) > 10

// Date functions
SELECT u FROM User u WHERE CURRENT_DATE > u.birthDate
SELECT u FROM User u WHERE CURRENT_TIME > u.createdAt
SELECT u FROM User u WHERE CURRENT_TIMESTAMP - u.createdAt > :duration

// Aggregate functions
SELECT COUNT(u) FROM User u
SELECT AVG(u.age) FROM User u
SELECT SUM(u.balance) FROM User u
SELECT MAX(u.createdAt) FROM User u
SELECT MIN(u.age) FROM User u
```

### JPQL Examples

```java
// Simple SELECT
String jpql = "SELECT u FROM User u";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// WHERE với multiple conditions
String jpql = "SELECT u FROM User u WHERE u.age > :minAge AND u.active = true";
List<User> users = em.createQuery(jpql, User.class)
    .setParameter("minAge", 18)
    .getResultList();

// ORDER BY
String jpql = "SELECT u FROM User u ORDER BY u.username ASC, u.age DESC";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// GROUP BY và HAVING
String jpql = "SELECT u.city, COUNT(u) FROM User u GROUP BY u.city HAVING COUNT(u) > 10";
List<Object[]> results = em.createQuery(jpql).getResultList();

// Subquery
String jpql = "SELECT u FROM User u WHERE u.age > (SELECT AVG(u2.age) FROM User u2)";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// IN clause
String jpql = "SELECT u FROM User u WHERE u.id IN :ids";
List<User> users = em.createQuery(jpql, User.class)
    .setParameter("ids", Arrays.asList(1L, 2L, 3L))
    .getResultList();

// EXISTS
String jpql = "SELECT u FROM User u WHERE EXISTS (SELECT o FROM Order o WHERE o.user = u)";
List<User> users = em.createQuery(jpql, User.class).getResultList();
```

### JOIN Types

```java
// INNER JOIN
String jpql = "SELECT u FROM User u INNER JOIN u.orders o";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// LEFT JOIN
String jpql = "SELECT u FROM User u LEFT JOIN u.orders o";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// JOIN FETCH (eager loading, no duplicates)
String jpql = "SELECT DISTINCT u FROM User u JOIN FETCH u.orders";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// Multiple JOINs
String jpql = "SELECT o FROM Order o JOIN o.user u JOIN o.items i WHERE u.city = :city";
List<Order> orders = em.createQuery(jpql, Order.class)
    .setParameter("city", "New York")
    .getResultList();
```

---

## Native Queries

### Basic Native Query

```java
// Simple native query
String sql = "SELECT * FROM users WHERE age > :age";
List<User> users = em.createNativeQuery(sql, User.class)
    .setParameter("age", 18)
    .getResultList();

// Native query với result mapping
@SqlResultSetMapping(
    name = "UserMapping",
    entities = @EntityResult(entityClass = User.class)
)
String sql = "SELECT * FROM users WHERE active = true";
List<User> users = em.createNativeQuery(sql, "UserMapping")
    .getResultList();
```

### Native Query với DTO

```java
// Interface projection
public interface UserSummary {
    String getUsername();
    String getEmail();
}

String sql = "SELECT username, email FROM users WHERE age > :age";
List<UserSummary> results = em.createNativeQuery(sql, "UserSummaryMapping")
    .setParameter("age", 18)
    .getResultList();

// Constructor expression
public class UserDTO {
    private String username;
    private String email;
    
    public UserDTO(String username, String email) {
        this.username = username;
        this.email = email;
    }
}

String sql = "SELECT username, email FROM users";
List<Object[]> rows = em.createNativeQuery(sql).getResultList();
List<UserDTO> dtos = rows.stream()
    .map(row -> new UserDTO((String) row[0], (String) row[1]))
    .collect(Collectors.toList());
```

### Stored Procedures

```java
// Call stored procedure
StoredProcedureQuery query = em.createStoredProcedureQuery("get_user_by_id");
query.registerStoredProcedureParameter(1, Long.class, ParameterMode.IN);
query.registerStoredProcedureParameter(2, String.class, ParameterMode.OUT);
query.setParameter(1, 1L);
query.execute();
String result = (String) query.getOutputParameterValue(2);
```

---

## Criteria API

### Basic Criteria Query

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> query = cb.createQuery(User.class);
Root<User> user = query.from(User.class);

// SELECT u FROM User u
query.select(user);
List<User> users = em.createQuery(query).getResultList();

// WHERE u.age > 18
Predicate agePredicate = cb.gt(user.get("age"), 18);
query.where(agePredicate);
List<User> users = em.createQuery(query).getResultList();

// Multiple conditions
Predicate agePredicate = cb.gt(user.get("age"), 18);
Predicate activePredicate = cb.equal(user.get("active"), true);
query.where(cb.and(agePredicate, activePredicate));
```

### Criteria API - Advanced

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> query = cb.createQuery(User.class);
Root<User> user = query.from(User.class);

// JOIN
Join<User, Order> orders = user.join("orders");
query.where(cb.equal(orders.get("status"), "PENDING"));

// ORDER BY
query.orderBy(cb.asc(user.get("username")));

// GROUP BY
CriteriaQuery<Object[]> groupQuery = cb.createQuery(Object[].class);
Root<User> user = groupQuery.from(User.class);
groupQuery.select(cb.array(user.get("city"), cb.count(user)));
groupQuery.groupBy(user.get("city"));

// Aggregate functions
CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
Root<User> user = countQuery.from(User.class);
countQuery.select(cb.count(user));
Long count = em.createQuery(countQuery).getSingleResult();
```

### Dynamic Queries với Criteria API

```java
public List<User> findUsers(String username, Integer minAge, String city) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<User> query = cb.createQuery(User.class);
    Root<User> user = query.from(User.class);
    
    List<Predicate> predicates = new ArrayList<>();
    
    if (username != null) {
        predicates.add(cb.equal(user.get("username"), username));
    }
    
    if (minAge != null) {
        predicates.add(cb.gt(user.get("age"), minAge));
    }
    
    if (city != null) {
        predicates.add(cb.equal(user.get("city"), city));
    }
    
    query.where(cb.and(predicates.toArray(new Predicate[0])));
    return em.createQuery(query).getResultList();
}
```

---

## Named Queries

### @NamedQuery

```java
@Entity
@NamedQuery(
    name = "User.findByAge",
    query = "SELECT u FROM User u WHERE u.age > :age"
)
@NamedQueries({
    @NamedQuery(name = "User.findByUsername", query = "SELECT u FROM User u WHERE u.username = :username"),
    @NamedQuery(name = "User.findActiveUsers", query = "SELECT u FROM User u WHERE u.active = true")
})
public class User {
    // ...
}

// Usage
List<User> users = em.createNamedQuery("User.findByAge", User.class)
    .setParameter("age", 18)
    .getResultList();
```

### @NamedNativeQuery

```java
@Entity
@NamedNativeQuery(
    name = "User.findByCity",
    query = "SELECT * FROM users WHERE city = :city",
    resultClass = User.class
)
public class User {
    // ...
}

// Usage
List<User> users = em.createNamedQuery("User.findByCity", User.class)
    .setParameter("city", "New York")
    .getResultList();
```

---

## Query Parameters

### Positional Parameters

```java
// Positional (index-based, starts from 1)
String jpql = "SELECT u FROM User u WHERE u.username = ?1 AND u.age > ?2";
List<User> users = em.createQuery(jpql, User.class)
    .setParameter(1, "john")
    .setParameter(2, 18)
    .getResultList();
```

### Named Parameters

```java
// Named parameters (recommended)
String jpql = "SELECT u FROM User u WHERE u.username = :username AND u.age > :age";
List<User> users = em.createQuery(jpql, User.class)
    .setParameter("username", "john")
    .setParameter("age", 18)
    .getResultList();
```

### Collection Parameters

```java
// IN clause với collection
String jpql = "SELECT u FROM User u WHERE u.id IN :ids";
List<User> users = em.createQuery(jpql, User.class)
    .setParameter("ids", Arrays.asList(1L, 2L, 3L))
    .getResultList();
```

---

## Pagination và Sorting

### Pagination

```java
// setFirstResult và setMaxResults
String jpql = "SELECT u FROM User u";
List<User> users = em.createQuery(jpql, User.class)
    .setFirstResult(0)   // Offset
    .setMaxResults(10)   // Limit
    .getResultList();

// Page calculation
int page = 2;
int pageSize = 10;
int offset = (page - 1) * pageSize;

List<User> users = em.createQuery(jpql, User.class)
    .setFirstResult(offset)
    .setMaxResults(pageSize)
    .getResultList();
```

### Sorting

```java
// ORDER BY trong JPQL
String jpql = "SELECT u FROM User u ORDER BY u.username ASC, u.age DESC";
List<User> users = em.createQuery(jpql, User.class).getResultList();

// Dynamic sorting với Criteria API
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> query = cb.createQuery(User.class);
Root<User> user = query.from(User.class);

// Sort by username ascending
query.orderBy(cb.asc(user.get("username")));

// Multiple sort orders
query.orderBy(
    cb.asc(user.get("username")),
    cb.desc(user.get("age"))
);
```

---

## Câu hỏi thường gặp

### Q1: JPQL vs SQL?

| Feature | JPQL | SQL |
|---------|------|-----|
| **Syntax** | Object-oriented | Table-oriented |
| **Portability** | Database agnostic | Database specific |
| **Entity names** | Uses entity names | Uses table names |
| **Relationships** | Navigate via relationships | Uses JOINs |

### Q2: Khi nào dùng Native Query?

**Use Native Query khi:**
- Need database-specific features
- Complex queries difficult in JPQL
- Performance-critical queries
- Using stored procedures
- Database-specific functions

**Avoid Native Query khi:**
- Can use JPQL (more portable)
- Need entity mapping
- Want database independence

### Q3: JOIN FETCH vs JOIN?

```java
// JOIN: Returns duplicates, lazy loading
String jpql = "SELECT u FROM User u JOIN u.orders o";
// Returns User multiple times (one per order)
// Orders not loaded

// JOIN FETCH: Eager loading, use DISTINCT
String jpql = "SELECT DISTINCT u FROM User u JOIN FETCH u.orders";
// Returns User once with orders loaded
// No additional queries needed
```

### Q4: getResultList() vs getSingleResult()?

```java
// getResultList(): Returns List (empty if no results)
List<User> users = em.createQuery(jpql, User.class).getResultList();
// Returns empty list if no results

// getSingleResult(): Returns single result
User user = em.createQuery(jpql, User.class).getSingleResult();
// Throws NoResultException if no results
// Throws NonUniqueResultException if multiple results
```

### Q5: Query Caching?

```java
// Enable query cache
@Cacheable
@Query("SELECT u FROM User u WHERE u.active = true")
List<User> findActiveUsers();

// Query hints
Query query = em.createQuery(jpql, User.class);
query.setHint("javax.persistence.cache.retrieveMode", CacheRetrieveMode.USE);
query.setHint("javax.persistence.cache.storeMode", CacheStoreMode.USE);
```

---

## Best Practices

1. **Use JPQL** khi có thể (portable, type-safe)
2. **Use Named Queries** cho queries thường dùng
3. **Use JOIN FETCH** để tránh N+1 problem
4. **Use Parameters** thay vì string concatenation (SQL injection)
5. **Use Pagination** cho large result sets
6. **Avoid Native Queries** trừ khi cần thiết
7. **Use Criteria API** cho dynamic queries
8. **Cache queries** khi appropriate

---

## Bài tập thực hành

### Bài 1: Complex JPQL Queries

```java
// Yêu cầu: Viết JPQL queries cho:
// 1. Find users with more than 10 orders
// 2. Find average order value per user
// 3. Find users who ordered in last 30 days
// 4. Find top 10 users by total order value
```

### Bài 2: Dynamic Queries

```java
// Yêu cầu: Implement dynamic query builder
// Support: filtering, sorting, pagination
// Use Criteria API
```

---

## Tổng kết

- **JPQL**: Object-oriented query language
- **Native Queries**: SQL queries for database-specific features
- **Criteria API**: Type-safe, dynamic queries
- **Named Queries**: Reusable, cached queries
- **Pagination**: setFirstResult(), setMaxResults()
- **Best Practices**: Use JPQL, parameters, JOIN FETCH, pagination
