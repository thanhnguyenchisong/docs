# Spring Data MongoDB - Câu hỏi phỏng vấn

## Mục lục
1. [Dependency và cấu hình](#dependency-và-cấu-hình)
2. [MongoTemplate](#mongotemplate)
3. [Repository và Query methods](#repository-và-query-methods)
4. [Entity và _id](#entity-và-_id)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Dependency và cấu hình

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/mydb
      # hoặc host, port, database, username, password
```

---

## MongoTemplate

- **MongoTemplate**: API imperative — find, insert, update, remove, aggregate.
- Dùng khi logic phức tạp (aggregation, query động).

```java
@Autowired
private MongoTemplate mongoTemplate;

public User findByEmail(String email) {
    return mongoTemplate.findOne(
        Query.query(Criteria.where("email").is(email)),
        User.class
    );
}

public List<OrderStats> aggregateOrders() {
    return mongoTemplate.aggregate(
        Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is("completed")),
            Aggregation.group("userId").sum("amount").as("total"),
            Aggregation.sort(Sort.Direction.DESC, "total")
        ),
        "orders",
        OrderStats.class
    ).getMappedResults();
}
```

- **Query** + **Criteria**: build filter.
- **Aggregation**: build pipeline (match, group, sort, ...).

---

## Repository và Query methods

```java
public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByEmail(String email);
    List<User> findByAgeGreaterThan(int age);
    Optional<User> findFirstByOrderByCreatedAtDesc();
}
```

- **MongoRepository** kế thừa PagingAndSortingRepository, CrudRepository.
- **Query methods**: Tên method quy định query (findBy..., countBy..., deleteBy...).
- **@Query**: Custom query (JSON) hoặc aggregation.

```java
@Query("{ 'status' : ?0 }")
List<Order> findByStatus(String status);
```

---

## Entity và _id

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;  // ObjectId hoặc String
    private String name;
    private String email;
    @Field("created_at")
    private Instant createdAt;
    // getter/setter
}
```

- **@Document**: Map class → collection.
- **@Id**: _id; kiểu String hoặc ObjectId.
- **@Field**: Tên field trong MongoDB (nếu khác tên Java).
- **@Indexed**: Tạo index (có thể dùng trên class hoặc field).

---

## Câu hỏi thường gặp

### MongoTemplate vs MongoRepository?

- **Repository**: CRUD + query methods đơn giản, ít code.
- **MongoTemplate**: Query phức tạp, aggregation, update linh hoạt. Dùng cả hai trong cùng project được.

### Transaction với Spring Data MongoDB?

- Cần MongoDB replica set (hoặc sharded). Bật transaction trong Spring: @Transactional; MongoTemplate có startSession/withTransaction nếu cần manual.

---

**Tiếp theo:** [07-Replica-Set-Sharding.md](./07-Replica-Set-Sharding.md)
