# Data Access - Từ Zero đến Master Quarkus

## Mục lục
1. [Tổng quan Data Access trong Quarkus](#tổng-quan-data-access-trong-quarkus)
2. [Hibernate ORM & Cấu hình](#hibernate-orm--cấu-hình)
3. [Entity & Relationships](#entity--relationships)
4. [Panache - Active Record vs Repository](#panache---active-record-vs-repository)
5. [Panache Queries nâng cao](#panache-queries-nâng-cao)
6. [Projections & DTOs](#projections--dtos)
7. [Pagination & Sorting](#pagination--sorting)
8. [Transactions chi tiết](#transactions-chi-tiết)
9. [Locking (Pessimistic & Optimistic)](#locking-pessimistic--optimistic)
10. [Database Migration (Flyway & Liquibase)](#database-migration-flyway--liquibase)
11. [Caching (2nd Level Cache)](#caching-2nd-level-cache)
12. [Connection Pool & Datasource](#connection-pool--datasource)
13. [Multi-tenancy](#multi-tenancy)
14. [Hibernate Reactive & Panache Reactive](#hibernate-reactive--panache-reactive)
15. [Performance Optimization](#performance-optimization)
16. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tổng quan Data Access trong Quarkus

### Các lựa chọn Data Access

| Approach | Extension | Use Case |
| :--- | :--- | :--- |
| **Hibernate ORM + Panache** | `quarkus-hibernate-orm-panache` | Blocking, truyền thống, đơn giản |
| **Hibernate Reactive + Panache** | `quarkus-hibernate-reactive-panache` | Non-blocking, reactive, high concurrency |
| **Reactive SQL Client** | `quarkus-reactive-pg-client` | Low-level reactive, raw SQL, hiệu năng tối đa |
| **JDBC trực tiếp** | `quarkus-agroal` | Raw JDBC khi cần toàn quyền kiểm soát |
| **MongoDB + Panache** | `quarkus-mongodb-panache` | NoSQL document database |

### Dependencies cơ bản

```xml
<!-- Hibernate ORM + Panache (blocking) -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>

<!-- JDBC Driver (chọn 1) -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-postgresql</artifactId>  <!-- PostgreSQL -->
</dependency>

<!-- Hoặc Hibernate Reactive + Panache (non-blocking) -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-reactive-panache</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-reactive-pg-client</artifactId>
</dependency>
```

---

## Hibernate ORM & Cấu hình

### application.properties đầy đủ

```properties
# ===== Datasource =====
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=quarkus_user
quarkus.datasource.password=quarkus_pass
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/quarkus_db

# Connection Pool (Agroal)
quarkus.datasource.jdbc.min-size=5
quarkus.datasource.jdbc.max-size=20
quarkus.datasource.jdbc.initial-size=5
quarkus.datasource.jdbc.idle-removal-interval=PT2M
quarkus.datasource.jdbc.max-lifetime=PT10M
quarkus.datasource.jdbc.acquisition-timeout=PT30S

# ===== Hibernate ORM =====
# Schema generation
quarkus.hibernate-orm.database.generation=none          # none | drop-and-create | update | validate
quarkus.hibernate-orm.database.generation.create-schemas=true

# SQL logging (dev mode)
quarkus.hibernate-orm.log.sql=true
quarkus.hibernate-orm.log.bind-parameters=true
quarkus.hibernate-orm.log.format-sql=true

# Batch operations (cực kỳ quan trọng cho performance)
quarkus.hibernate-orm.jdbc.statement-batch-size=50
quarkus.hibernate-orm.order-inserts=true
quarkus.hibernate-orm.order-updates=true

# Fetch size
quarkus.hibernate-orm.jdbc.fetch-size=100

# Statistics
quarkus.hibernate-orm.statistics=true

# 2nd level cache
quarkus.hibernate-orm.cache."com.example.entity.User".expiration.max-idle=PT1H

# ===== Profile-specific =====
%dev.quarkus.hibernate-orm.database.generation=drop-and-create
%dev.quarkus.hibernate-orm.log.sql=true
%test.quarkus.hibernate-orm.database.generation=drop-and-create
%prod.quarkus.hibernate-orm.database.generation=none
%prod.quarkus.hibernate-orm.log.sql=false
```

### Named Datasources (Nhiều database)

```properties
# Default datasource
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/main_db

# Named datasource: "reporting"
quarkus.datasource.reporting.db-kind=postgresql
quarkus.datasource.reporting.jdbc.url=jdbc:postgresql://localhost:5432/reporting_db
quarkus.datasource.reporting.username=report_user
quarkus.datasource.reporting.password=report_pass
```

```java
// Sử dụng named datasource
@PersistenceUnit("reporting")
EntityManager reportingEm;

// Hoặc với Repository
@ApplicationScoped
@PersistenceUnit("reporting")  // Quarkus-specific annotation
public class ReportingRepository implements PanacheRepository<Report> {
}
```

---

## Entity & Relationships

### Entity cơ bản

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_status", columnList = "status")
})
@Cacheable  // Enable 2nd level cache cho entity này
public class User extends PanacheEntity {
    // PanacheEntity cung cấp field 'id' (Long, auto-generated)

    @Column(nullable = false, length = 100)
    public String name;

    @Column(nullable = false, unique = true, length = 255)
    public String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt;

    // ===== Lifecycle Callbacks =====
    @PrePersist
    void onPrePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

public enum UserStatus {
    ACTIVE, INACTIVE, BANNED
}
```

### One-to-Many / Many-to-One

```java
// ===== Parent: User =====
@Entity
@Table(name = "users")
public class User extends PanacheEntity {
    public String name;

    // Một User có nhiều Order
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Order> orders = new ArrayList<>();

    // ===== Helper methods (quan trọng để đồng bộ 2 chiều) =====
    public void addOrder(Order order) {
        orders.add(order);
        order.user = this;
    }

    public void removeOrder(Order order) {
        orders.remove(order);
        order.user = null;
    }
}

// ===== Child: Order =====
@Entity
@Table(name = "orders")
public class Order extends PanacheEntity {
    @Column(name = "total_amount", nullable = false)
    public BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    public OrderStatus status = OrderStatus.PENDING;

    // Nhiều Order thuộc về một User
    @ManyToOne(fetch = FetchType.LAZY)  // LAZY: không load User khi query Order
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "created_at")
    public LocalDateTime createdAt;
}
```

### Many-to-Many

```java
// ===== Student =====
@Entity
public class Student extends PanacheEntity {
    public String name;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "student_course",  // Tên bảng trung gian
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    public Set<Course> courses = new HashSet<>();

    // Helper method
    public void enroll(Course course) {
        courses.add(course);
        course.students.add(this);
    }
}

// ===== Course =====
@Entity
public class Course extends PanacheEntity {
    public String title;

    @ManyToMany(mappedBy = "courses")
    public Set<Student> students = new HashSet<>();
}
```

### One-to-One

```java
@Entity
public class User extends PanacheEntity {
    public String name;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", unique = true)
    public UserProfile profile;
}

@Entity
public class UserProfile extends PanacheEntity {
    public String bio;
    public String avatarUrl;

    @OneToOne(mappedBy = "profile")
    public User user;
}
```

### Embedded Types

```java
@Embeddable
public class Address {
    public String street;
    public String city;
    public String zipCode;
    public String country;
}

@Entity
public class User extends PanacheEntity {
    public String name;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "home_street")),
        @AttributeOverride(name = "city", column = @Column(name = "home_city"))
    })
    public Address homeAddress;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "work_street")),
        @AttributeOverride(name = "city", column = @Column(name = "work_city"))
    })
    public Address workAddress;
}
```

### Inheritance Strategies

```java
// ===== Strategy 1: SINGLE_TABLE (Performance tốt nhất, 1 bảng cho tất cả) =====
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payment_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Payment extends PanacheEntity {
    public BigDecimal amount;
    public LocalDateTime paidAt;
}

@Entity
@DiscriminatorValue("CREDIT_CARD")
public class CreditCardPayment extends Payment {
    public String cardNumber;
    public String expiryDate;
}

@Entity
@DiscriminatorValue("BANK_TRANSFER")
public class BankTransferPayment extends Payment {
    public String bankName;
    public String accountNumber;
}

// ===== Strategy 2: JOINED (Normalized, performance trung bình) =====
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Vehicle extends PanacheEntity {
    public String brand;
}

@Entity
public class Car extends Vehicle {
    public int numberOfDoors;
}

// ===== Strategy 3: TABLE_PER_CLASS (Mỗi class 1 bảng, polymorphic query chậm) =====
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Notification extends PanacheEntity {
    public String message;
}
```

---

## Panache - Active Record vs Repository

### Active Record Pattern (Entity chứa logic)

```java
@Entity
@Table(name = "products")
public class Product extends PanacheEntity {
    // PanacheEntity cung cấp sẵn:
    // - public Long id (auto-generated)
    // - persist(), delete(), isPersistent()
    // - findById(), findAll(), find(), list(), stream()
    // - count(), deleteAll(), deleteById()
    // - update(), flush(), getEntityManager()

    public String name;
    public String description;
    public BigDecimal price;
    public int stockQuantity;

    @Enumerated(EnumType.STRING)
    public ProductCategory category;

    @Column(name = "is_active")
    public boolean active = true;

    // ===== Custom Finder Methods (Static) =====

    // Tìm theo tên (case insensitive)
    public static Product findByName(String name) {
        return find("LOWER(name) = LOWER(?1)", name).firstResult();
    }

    // Tìm tất cả sản phẩm đang active
    public static List<Product> findActive() {
        return list("active", true);
    }

    // Tìm theo category và giá
    public static List<Product> findByCategoryAndMaxPrice(ProductCategory cat, BigDecimal maxPrice) {
        return list("category = ?1 and price <= ?2 and active = true", cat, maxPrice);
    }

    // Tìm sản phẩm sắp hết hàng
    public static List<Product> findLowStock(int threshold) {
        return list("stockQuantity <= ?1 and active = true", Sort.by("stockQuantity"), threshold);
    }

    // Đếm sản phẩm theo category
    public static long countByCategory(ProductCategory category) {
        return count("category", category);
    }

    // Xóa sản phẩm inactive
    public static long deleteInactive() {
        return delete("active", false);
    }

    // Update hàng loạt
    public static int deactivateOutOfStock() {
        return update("active = false where stockQuantity = 0");
    }

    // ===== Business Logic =====

    public void reduceStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new IllegalStateException("Not enough stock for product: " + this.name);
        }
        this.stockQuantity -= quantity;
    }

    public boolean isInStock() {
        return this.stockQuantity > 0 && this.active;
    }
}
```

**Sử dụng Active Record:**
```java
@Path("/products")
@ApplicationScoped
public class ProductResource {

    @GET
    public List<Product> listAll() {
        return Product.findActive();
    }

    @GET
    @Path("/{id}")
    public Product getById(@PathParam("id") Long id) {
        Product p = Product.findById(id);
        if (p == null) throw new NotFoundException("Product not found: " + id);
        return p;
    }

    @POST
    @Transactional
    public Response create(Product product) {
        product.persist();  // Gọi trực tiếp trên entity
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Product update(@PathParam("id") Long id, Product updated) {
        Product existing = Product.findById(id);
        if (existing == null) throw new NotFoundException();
        existing.name = updated.name;
        existing.price = updated.price;
        // Panache auto-flush khi transaction commit (không cần gọi persist())
        return existing;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public void delete(@PathParam("id") Long id) {
        Product.deleteById(id);
    }
}
```

### Repository Pattern (Tách biệt logic)

```java
// ===== Entity (POJO thuần túy) =====
@Entity
@Table(name = "products")
public class Product extends PanacheEntityBase {
    // Dùng PanacheEntityBase nếu muốn custom ID type
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String name;
    public BigDecimal price;
    public int stockQuantity;

    @Enumerated(EnumType.STRING)
    public ProductCategory category;

    public boolean active = true;
}

// ===== Repository =====
@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {
    // PanacheRepository<Product> cung cấp sẵn:
    // - persist(), delete(), isPersistent()
    // - findById(), findAll(), find(), list(), stream()
    // - count(), deleteAll(), deleteById()
    // - update(), flush(), getEntityManager()

    // Custom finder methods
    public Product findByName(String name) {
        return find("LOWER(name) = LOWER(?1)", name).firstResult();
    }

    public List<Product> findActive() {
        return list("active", true);
    }

    public List<Product> findByCategoryAndMaxPrice(ProductCategory cat, BigDecimal maxPrice) {
        return list("category = ?1 and price <= ?2 and active = true", cat, maxPrice);
    }

    public List<Product> findLowStock(int threshold) {
        return list("stockQuantity <= ?1 and active = true",
                     Sort.by("stockQuantity"), threshold);
    }

    public long countByCategory(ProductCategory category) {
        return count("category", category);
    }

    public int deactivateOutOfStock() {
        return update("active = false where stockQuantity = 0");
    }
}

// ===== Service =====
@ApplicationScoped
public class ProductService {
    @Inject
    ProductRepository productRepository;

    @Transactional
    public Product create(Product product) {
        productRepository.persist(product);
        return product;
    }

    @Transactional
    public Product update(Long id, ProductUpdateDTO dto) {
        Product existing = productRepository.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        existing.name = dto.name();
        existing.price = dto.price();
        return existing;
    }

    @Transactional
    public void reduceStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId);
        if (product.stockQuantity < quantity) {
            throw new InsufficientStockException(productId, quantity, product.stockQuantity);
        }
        product.stockQuantity -= quantity;
    }
}
```

### So sánh Active Record vs Repository

| Tiêu chí | Active Record | Repository |
| :--- | :--- | :--- |
| **Boilerplate** | Ít (query trên Entity) | Nhiều hơn (cần class Repository) |
| **Testability** | Khó mock (static methods) | Dễ mock (inject interface) |
| **Separation** | Entity chứa logic -> Coupled | Tách rõ Entity/Repository/Service |
| **Clean Architecture** | Không phù hợp | Phù hợp |
| **Khi nào dùng** | CRUD đơn giản, prototype nhanh | Dự án lớn, logic phức tạp |
| **Team convention** | Nhỏ, startup | Lớn, enterprise |

**Khuyến nghị**: Dùng **Repository Pattern** cho production projects.

---

## Panache Queries nâng cao

### 1. HQL / JPQL Shorthand

```java
// Panache tự động thêm "FROM Entity WHERE" nếu query bắt đầu bằng tên field
// Đầy đủ: find("FROM Product WHERE name = ?1", name)
// Shorthand: find("name", name)  --> Quarkus tự expand

// Ví dụ shorthand
Product.find("name", "iPhone");               // WHERE name = 'iPhone'
Product.find("active", true);                 // WHERE active = true
Product.find("price > ?1", 1000);             // WHERE price > 1000
Product.find("category = ?1 and active", cat, true);  // WHERE category = ? AND active = true
```

### 2. Named Parameters

```java
// Dùng Map
Product.find("name = :name and price <= :maxPrice",
    Parameters.with("name", "iPhone").and("maxPrice", 2000));

// Hoặc java.util.Map
Product.find("name = :name", Map.of("name", "iPhone"));
```

### 3. Native SQL

```java
// Khi cần tối ưu hoặc function đặc biệt của DB
@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {

    // Native query
    public List<Product> findWithNativeQuery(String keyword) {
        return getEntityManager()
            .createNativeQuery(
                "SELECT * FROM products WHERE name ILIKE :keyword AND is_active = true",
                Product.class)
            .setParameter("keyword", "%" + keyword + "%")
            .getResultList();
    }

    // Native query với @NamedNativeQuery
    // Khai báo trên Entity: @NamedNativeQuery(name = "Product.search", query = "SELECT ...")
}
```

### 4. Sort

```java
// Single field
Product.findAll(Sort.by("name"));
Product.findAll(Sort.by("name").descending());

// Multiple fields
Product.findAll(Sort.by("category").and("price", Sort.Direction.Descending));

// Kết hợp query + sort
Product.find("active", Sort.by("price").descending(), true);
```

### 5. Stream (Xử lý lượng lớn)

```java
@Transactional
public void processAllProducts() {
    // stream() trả về Stream<Product>, xử lý từng batch
    // Phải chạy trong @Transactional
    try (Stream<Product> stream = Product.streamAll()) {
        stream.filter(p -> p.price.compareTo(BigDecimal.ZERO) > 0)
              .forEach(p -> {
                  p.price = p.price.multiply(new BigDecimal("1.1")); // Tăng giá 10%
              });
    }
}
```

---

## Projections & DTOs

### Projection với Panache

```java
// ===== DTO (Record hoặc Class) =====
public record ProductSummary(String name, BigDecimal price) {}

// ===== Query projection =====
// Chỉ SELECT name, price (không load toàn bộ entity -> tiết kiệm memory)
List<ProductSummary> summaries = Product.find("active", true)
    .project(ProductSummary.class)
    .list();

// SQL generated: SELECT p.name, p.price FROM products p WHERE p.active = true

// Kết hợp Sort
List<ProductSummary> sorted = Product.find("active", true)
    .project(ProductSummary.class)
    .page(Page.of(0, 10))
    .list();
```

### Projection với Custom HQL

```java
// Khi cần computed fields
public record ProductReport(String name, BigDecimal price, long orderCount) {}

List<ProductReport> reports = Product.getEntityManager()
    .createQuery("""
        SELECT new com.example.dto.ProductReport(p.name, p.price, COUNT(o))
        FROM Product p LEFT JOIN p.orders o
        WHERE p.active = true
        GROUP BY p.name, p.price
        ORDER BY COUNT(o) DESC
        """, ProductReport.class)
    .getResultList();
```

---

## Pagination & Sorting

### Pagination với PanacheQuery

```java
@Path("/products")
@ApplicationScoped
public class ProductResource {

    @GET
    public Response listProducts(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("sort") @DefaultValue("name") String sortField,
            @QueryParam("dir") @DefaultValue("asc") String sortDir) {

        Sort sort = Sort.by(sortField);
        if ("desc".equalsIgnoreCase(sortDir)) {
            sort = sort.descending();
        }

        PanacheQuery<Product> query = Product.find("active", sort, true);

        // Pagination
        query.page(Page.of(page, size));

        // Lấy dữ liệu
        List<Product> products = query.list();

        // Metadata
        long totalCount = query.count();
        int totalPages = query.pageCount();
        boolean hasNext = query.hasNextPage();
        boolean hasPrev = query.hasPreviousPage();

        // Response với metadata
        PageResponse<Product> response = new PageResponse<>(
            products, page, size, totalCount, totalPages, hasNext, hasPrev
        );
        return Response.ok(response).build();
    }
}

// ===== Page Response DTO =====
public record PageResponse<T>(
    List<T> data,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {}
```

### Range-based Pagination

```java
// Không dùng page, dùng range (offset + limit)
List<Product> products = Product.findAll(Sort.by("id"))
    .range(0, 9)   // Lấy 10 items đầu (index 0..9)
    .list();

List<Product> nextBatch = Product.findAll(Sort.by("id"))
    .range(10, 19)  // Lấy 10 items tiếp theo
    .list();
```

### Keyset Pagination (Cursor-based - Performance tốt nhất)

```java
// Thay vì OFFSET (chậm khi page lớn), dùng cursor
@GET
public List<Product> listAfter(
        @QueryParam("afterId") Long afterId,
        @QueryParam("size") @DefaultValue("20") int size) {

    if (afterId == null) {
        return Product.find("active = true", Sort.by("id"))
            .page(Page.ofSize(size)).list();
    }
    return Product.find("id > ?1 and active = true", Sort.by("id"), afterId)
        .page(Page.ofSize(size)).list();
}
// SQL: WHERE id > :afterId ORDER BY id LIMIT 20
// Luôn nhanh, không phụ thuộc vào số page
```

---

## Transactions chi tiết

### @Transactional (Declarative)

```java
@ApplicationScoped
public class OrderService {
    @Inject OrderRepository orderRepo;
    @Inject ProductRepository productRepo;
    @Inject PaymentService paymentService;

    // ===== Propagation Types =====

    // REQUIRED (default): Join existing transaction hoặc tạo mới
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.items = request.items();
        orderRepo.persist(order);
        return order;
    }

    // REQUIRES_NEW: Luôn tạo transaction MỚI (suspend transaction hiện tại)
    // Use case: Audit log phải lưu dù business logic rollback
    @Transactional(value = Transactional.TxType.REQUIRES_NEW)
    public void auditLog(String action, String detail) {
        AuditLog log = new AuditLog(action, detail, LocalDateTime.now());
        log.persist();
        // Transaction này COMMIT ĐỘC LẬP với transaction bên ngoài
    }

    // NOT_SUPPORTED: Chạy ngoài transaction (suspend nếu có)
    @Transactional(Transactional.TxType.NOT_SUPPORTED)
    public ProductReport generateReport() {
        // Read-only operation, không cần transaction
        return productRepo.generateReport();
    }

    // MANDATORY: Bắt buộc phải có transaction sẵn, nếu không -> Exception
    @Transactional(Transactional.TxType.MANDATORY)
    public void deductStock(Long productId, int qty) {
        // Phải được gọi từ trong 1 transaction khác
        Product p = productRepo.findById(productId);
        p.stockQuantity -= qty;
    }

    // ===== Rollback Control =====
    @Transactional(rollbackOn = BusinessException.class)
    public void processPayment(Order order) {
        // Rollback nếu BusinessException xảy ra
        paymentService.charge(order);
    }

    @Transactional(dontRollbackOn = WarningException.class)
    public void processWithWarning(Order order) {
        // KHÔNG rollback nếu WarningException xảy ra
    }
}
```

### Programmatic Transaction (QuarkusTransaction)

```java
@ApplicationScoped
public class BatchService {

    // ===== Cách 1: begin/commit/rollback thủ công =====
    public void manualTransaction() {
        QuarkusTransaction.begin();
        try {
            Product p = Product.findById(1L);
            p.price = new BigDecimal("999");
            QuarkusTransaction.commit();
        } catch (Exception e) {
            QuarkusTransaction.rollback();
            throw e;
        }
    }

    // ===== Cách 2: Lambda (khuyến nghị - tự cleanup) =====
    public void lambdaTransaction() {
        QuarkusTransaction.requiringNew().run(() -> {
            Product p = Product.findById(1L);
            p.price = new BigDecimal("999");
            // Auto-commit khi lambda kết thúc bình thường
            // Auto-rollback nếu throw exception
        });
    }

    // Với return value
    public Product lambdaWithReturn() {
        return QuarkusTransaction.requiringNew().call(() -> {
            Product p = new Product();
            p.name = "New Product";
            p.persist();
            return p;
        });
    }

    // ===== Cách 3: Joiner (join existing or create new) =====
    public void joinerTransaction() {
        QuarkusTransaction.joiningExisting().run(() -> {
            // Join transaction hiện tại nếu có, nếu không tạo mới
        });
    }
}
```

### Transaction Timeout

```java
@Transactional
@TransactionConfiguration(timeout = 30)  // Timeout 30 giây
public void longRunningOperation() {
    // Nếu chạy quá 30s -> RollbackException
}
```

---

## Locking (Pessimistic & Optimistic)

### Optimistic Locking (Khuyến nghị)

Kiểm tra conflict **khi commit** bằng version number.

```java
@Entity
public class Account extends PanacheEntity {
    public String name;
    public BigDecimal balance;

    @Version  // Tự động tăng version mỗi khi update
    public int version;
    // Hibernate sẽ thêm "WHERE version = ?" vào UPDATE statement
    // Nếu version không khớp -> OptimisticLockException
}

// Sử dụng
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Account from = Account.findById(fromId);
    Account to = Account.findById(toId);

    from.balance = from.balance.subtract(amount);
    to.balance = to.balance.add(amount);
    // Khi flush:
    // UPDATE accounts SET balance=?, version=version+1 WHERE id=? AND version=?
    // Nếu ai đó đã update trước -> version mismatch -> OptimisticLockException
}

// Xử lý lỗi
@Provider
public class OptimisticLockExceptionMapper implements ExceptionMapper<OptimisticLockException> {
    @Override
    public Response toResponse(OptimisticLockException e) {
        return Response.status(Response.Status.CONFLICT)
            .entity(new ErrorResponse("Data was modified by another user. Please retry."))
            .build();
    }
}
```

### Pessimistic Locking

Khóa record ngay khi đọc (SELECT ... FOR UPDATE).

```java
@Transactional
public void transferSafe(Long fromId, Long toId, BigDecimal amount) {
    // ===== PESSIMISTIC_WRITE: SELECT ... FOR UPDATE =====
    // Block thread khác đọc/ghi record này cho đến khi transaction kết thúc
    Account from = Account.getEntityManager()
        .find(Account.class, fromId, LockModeType.PESSIMISTIC_WRITE);
    Account to = Account.getEntityManager()
        .find(Account.class, toId, LockModeType.PESSIMISTIC_WRITE);

    from.balance = from.balance.subtract(amount);
    to.balance = to.balance.add(amount);
}

// Với Panache shorthand
Account from = Account.findById(fromId, LockModeType.PESSIMISTIC_WRITE);

// Timeout cho Pessimistic Lock
Map<String, Object> hints = Map.of("jakarta.persistence.lock.timeout", 5000); // 5 giây
Account a = em.find(Account.class, id, LockModeType.PESSIMISTIC_WRITE, hints);
```

### So sánh Locking

| Tiêu chí | Optimistic | Pessimistic |
| :--- | :--- | :--- |
| **Cơ chế** | Kiểm tra version khi commit | Lock record khi đọc |
| **Performance** | Cao (không lock) | Thấp (lock DB rows) |
| **Conflict** | Detect khi commit (OptimisticLockException) | Prevent ngay khi đọc |
| **Phù hợp** | Read-heavy, conflict ít | Write-heavy, conflict nhiều |
| **Deadlock** | Không có | Có thể xảy ra |
| **Khi nào dùng** | Hầu hết trường hợp | Transfer tiền, booking |

---

## Database Migration (Flyway & Liquibase)

### Flyway (Khuyến nghị)

```xml
<!-- Dependency -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-flyway</artifactId>
</dependency>
```

```properties
# application.properties
quarkus.flyway.migrate-at-start=true
quarkus.flyway.baseline-on-migrate=true
quarkus.flyway.locations=db/migration
quarkus.flyway.schemas=public
```

```sql
-- src/main/resources/db/migration/V1__create_users.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(status);
```

```sql
-- src/main/resources/db/migration/V2__create_orders.sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
```

```sql
-- src/main/resources/db/migration/V3__add_phone_to_users.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

**Quy tắc đặt tên Flyway:**
- `V{version}__{description}.sql` (2 dấu gạch dưới)
- `V1__`, `V2__`, `V3__` ... (version tăng dần)
- Migration đã chạy **KHÔNG ĐƯỢC SỬA**

### Flyway với Repeatable Migrations

```sql
-- src/main/resources/db/migration/R__create_views.sql
-- R__ prefix: Repeatable migration (chạy lại khi file thay đổi)
CREATE OR REPLACE VIEW active_users AS
SELECT id, name, email FROM users WHERE status = 'ACTIVE';
```

### Liquibase (Thay thế)

```xml
<!-- Dependency -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-liquibase</artifactId>
</dependency>
```

```yaml
# src/main/resources/db/changeLog.yaml
databaseChangeLog:
  - changeSet:
      id: 1
      author: dev
      changes:
        - createTable:
            tableName: users
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
              - column:
                  name: name
                  type: VARCHAR(100)
                  constraints:
                    nullable: false
```

---

## Caching (2nd Level Cache)

### Cấu hình Hibernate 2nd Level Cache

```xml
<!-- Dependency -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cache</artifactId>
</dependency>
```

```properties
# application.properties
# Enable 2nd level cache
quarkus.hibernate-orm.cache."com.example.entity.Product".expiration.max-idle=PT1H
quarkus.hibernate-orm.cache."com.example.entity.Product".memory.object-count=1000
```

```java
// Đánh dấu Entity cacheable
@Entity
@Cacheable  // Enable 2nd level cache cho entity này
public class Product extends PanacheEntity {
    public String name;
    public BigDecimal price;

    // Collection cache
    @OneToMany(mappedBy = "product")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    public List<Review> reviews;
}
```

### Application-level Cache

```java
@ApplicationScoped
public class ProductService {

    @Inject ProductRepository productRepo;

    // Cache result
    @CacheResult(cacheName = "product-by-id")
    public Product getById(@CacheKey Long id) {
        return productRepo.findById(id);
    }

    // Invalidate cache
    @CacheInvalidate(cacheName = "product-by-id")
    @Transactional
    public void update(@CacheKey Long id, ProductUpdateDTO dto) {
        Product p = productRepo.findById(id);
        p.name = dto.name();
        p.price = dto.price();
    }

    // Invalidate all
    @CacheInvalidateAll(cacheName = "product-by-id")
    @Transactional
    public void clearCache() {
        // Xóa toàn bộ cache
    }
}
```

```properties
# Cache configuration
quarkus.cache.caffeine."product-by-id".expire-after-write=PT10M
quarkus.cache.caffeine."product-by-id".maximum-size=500
```

---

## Connection Pool & Datasource

### Agroal Connection Pool

Quarkus sử dụng **Agroal** làm connection pool mặc định.

```properties
# ===== Connection Pool tuning =====
# Số connection tối thiểu (giữ sẵn)
quarkus.datasource.jdbc.min-size=5

# Số connection tối đa
quarkus.datasource.jdbc.max-size=20

# Số connection khởi tạo ban đầu
quarkus.datasource.jdbc.initial-size=5

# Thời gian chờ lấy connection (nếu pool full)
quarkus.datasource.jdbc.acquisition-timeout=PT30S

# Thời gian xóa idle connection
quarkus.datasource.jdbc.idle-removal-interval=PT2M

# Thời gian sống tối đa của connection (tránh stale connection)
quarkus.datasource.jdbc.max-lifetime=PT10M

# Background validation (check connection còn sống không)
quarkus.datasource.jdbc.background-validation-interval=PT2M
quarkus.datasource.jdbc.validate-on-acquisition=true

# ===== Health check =====
quarkus.datasource.health.enabled=true
```

### Sizing Guide

```
Công thức tham khảo:
max-size = (core_count * 2) + effective_spindle_count

Ví dụ: Server 4 cores, SSD (1 spindle)
max-size = (4 * 2) + 1 = 9 ~ 10

Nguyên tắc:
- Bắt đầu nhỏ (10-20), tăng dần khi cần
- Quá nhiều connection = context switch overhead
- Monitor pool utilization qua metrics
```

---

## Multi-tenancy

### Strategy 1: Schema per Tenant

```properties
# application.properties
quarkus.hibernate-orm.multitenant=SCHEMA
```

```java
// Tenant Resolver: Xác định tenant từ request
@PersistenceUnitExtension
@RequestScoped
public class SchemaTenantResolver implements TenantResolver {

    @Inject
    HttpHeaders headers;

    @Override
    public String getDefaultTenantId() {
        return "public";  // Schema mặc định
    }

    @Override
    public String resolveTenantId() {
        String tenantId = headers.getHeaderString("X-Tenant-ID");
        if (tenantId == null || tenantId.isBlank()) {
            return getDefaultTenantId();
        }
        return "tenant_" + tenantId;  // Schema: tenant_acme, tenant_globex...
    }
}
```

### Strategy 2: Database per Tenant

```properties
quarkus.hibernate-orm.multitenant=DATABASE
```

```java
@PersistenceUnitExtension
@RequestScoped
public class DatabaseTenantConnectionResolver implements TenantConnectionResolver {

    @Inject
    HttpHeaders headers;

    @Override
    public ConnectionProvider resolve(String tenantId) {
        // Trả về connection provider cho mỗi tenant
        // Có thể lấy từ config hoặc database
        return new TenantConnectionProvider(tenantId);
    }
}
```

### Strategy 3: Discriminator (Row-level)

```java
// Không dùng Hibernate multi-tenancy, tự quản lý bằng filter
@Entity
public class Product extends PanacheEntity {
    public String name;

    @Column(name = "tenant_id", nullable = false)
    public String tenantId;
}

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {

    @Inject
    TenantContext tenantContext;

    // Tự động filter theo tenant
    public List<Product> findAllForTenant() {
        return list("tenantId", tenantContext.getTenantId());
    }

    @Transactional
    public void persistForTenant(Product p) {
        p.tenantId = tenantContext.getTenantId();
        persist(p);
    }
}
```

---

## Hibernate Reactive & Panache Reactive

### Entity Reactive

```java
// Import từ package reactive
import io.quarkus.hibernate.reactive.panache.PanacheEntity;

@Entity
public class Product extends PanacheEntity {
    public String name;
    public BigDecimal price;
    public boolean active = true;

    // Static methods trả về Uni/Multi thay vì Object/List
    public static Uni<Product> findByName(String name) {
        return find("name", name).firstResult();
    }

    public static Uni<List<Product>> findActive() {
        return list("active", true);
    }
}
```

### Reactive REST Resource

```java
@Path("/products")
@ApplicationScoped
public class ProductResource {

    @GET
    public Uni<List<Product>> listAll() {
        return Product.listAll();
    }

    @GET
    @Path("/{id}")
    public Uni<Product> getById(@PathParam("id") Long id) {
        return Product.<Product>findById(id)
            .onItem().ifNull().failWith(() -> new NotFoundException("Product not found"));
    }

    @POST
    public Uni<Response> create(Product product) {
        // Reactive transaction
        return Panache.withTransaction(product::persist)
            .replaceWith(() -> Response.status(Response.Status.CREATED)
                .entity(product).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<Product> update(@PathParam("id") Long id, Product updated) {
        return Panache.withTransaction(() ->
            Product.<Product>findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException())
                .invoke(existing -> {
                    existing.name = updated.name;
                    existing.price = updated.price;
                })
        );
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> delete(@PathParam("id") Long id) {
        return Panache.withTransaction(() -> Product.deleteById(id))
            .map(deleted -> deleted
                ? Response.noContent().build()
                : Response.status(Response.Status.NOT_FOUND).build());
    }
}
```

### So sánh Blocking vs Reactive

| | Blocking (Hibernate ORM) | Reactive (Hibernate Reactive) |
| :--- | :--- | :--- |
| **Thread model** | Worker thread pool | Event loop (Vert.x) |
| **Return type** | `T`, `List<T>` | `Uni<T>`, `Multi<T>` |
| **Transaction** | `@Transactional` | `Panache.withTransaction()` |
| **Connection** | JDBC (blocking) | Vert.x Reactive Driver |
| **Throughput** | Tốt | Rất tốt (ít thread hơn) |
| **Complexity** | Đơn giản | Phức tạp hơn |
| **Khi nào dùng** | Hầu hết ứng dụng | High concurrency, nhiều I/O |

---

## Performance Optimization

### 1. N+1 Query Problem

```java
// ===== Vấn đề N+1 =====
// Khi load User + Orders: 1 query cho users + N query cho mỗi user's orders
List<User> users = User.listAll();  // 1 query
for (User u : users) {
    u.orders.size();  // N queries (1 per user!)
}

// ===== Giải pháp 1: JOIN FETCH =====
List<User> users = User.find(
    "FROM User u LEFT JOIN FETCH u.orders WHERE u.active = true"
).list();
// Chỉ 1 query!

// ===== Giải pháp 2: @NamedEntityGraph =====
@Entity
@NamedEntityGraph(
    name = "User.withOrders",
    attributeNodes = @NamedAttributeNode("orders")
)
public class User extends PanacheEntity { ... }

// Sử dụng
EntityGraph<?> graph = em.getEntityGraph("User.withOrders");
List<User> users = em.createQuery("FROM User u WHERE u.active = true", User.class)
    .setHint("jakarta.persistence.fetchgraph", graph)
    .getResultList();

// ===== Giải pháp 3: @BatchSize =====
@OneToMany(mappedBy = "user")
@BatchSize(size = 50)  // Load orders theo batch 50 thay vì 1
public List<Order> orders;
```

### 2. Batch Insert/Update

```java
@Transactional
public void batchInsert(List<Product> products) {
    // Hibernate batch insert (cần config statement-batch-size)
    for (int i = 0; i < products.size(); i++) {
        products.get(i).persist();
        if (i > 0 && i % 50 == 0) {
            // Flush batch + clear persistence context (tránh OutOfMemory)
            Product.flush();
            Product.getEntityManager().clear();
        }
    }
}
```

```properties
# Bật batch operations
quarkus.hibernate-orm.jdbc.statement-batch-size=50
quarkus.hibernate-orm.order-inserts=true
quarkus.hibernate-orm.order-updates=true
```

### 3. Read-Only Queries

```java
// Với query chỉ đọc, hint Hibernate không cần track dirty state
@Transactional
public List<Product> getProductsReadOnly() {
    return Product.getEntityManager()
        .createQuery("FROM Product p WHERE p.active = true", Product.class)
        .setHint("org.hibernate.readOnly", true)  // Không track changes
        .getResultList();
}
```

### 4. Statistics & Monitoring

```properties
quarkus.hibernate-orm.statistics=true
quarkus.hibernate-orm.metrics.enabled=true
```

### Performance Checklist

| # | Item | Priority |
| :--- | :--- | :--- |
| 1 | FetchType.LAZY cho tất cả relationships | Critical |
| 2 | Giải quyết N+1 (JOIN FETCH / @BatchSize) | Critical |
| 3 | Bật batch insert/update | High |
| 4 | Dùng Projection thay vì load full entity | High |
| 5 | Pagination cho list queries | High |
| 6 | Index cho các column WHERE/JOIN | High |
| 7 | 2nd Level Cache cho read-heavy entities | Medium |
| 8 | Connection pool sizing phù hợp | Medium |
| 9 | Read-only hints cho query chỉ đọc | Medium |
| 10 | Monitor với Hibernate Statistics | Medium |

---

## Câu hỏi thường gặp

### Q1: Panache Active Record vs Repository - Khi nào dùng cái nào?

| Tiêu chí | Active Record | Repository |
| :--- | :--- | :--- |
| **Phù hợp** | CRUD đơn giản, prototype, microservice nhỏ | Dự án lớn, clean architecture, enterprise |
| **Testability** | Khó mock static methods | Dễ mock interface |
| **Clean Architecture** | Không (entity chứa logic data access) | Có (tách rõ ràng) |
| **Kết luận** | Dev nhanh | Production-grade |

### Q2: @Transactional hoạt động thế nào trong Quarkus?

- Quarkus dùng **Narayana Transaction Manager** (JTA).
- `@Transactional` là **CDI interceptor** (ArC xử lý lúc build-time).
- Transaction scope: Từ khi method được gọi đến khi return (commit) hoặc throw exception (rollback).
- **Chú ý**: `@Transactional` chỉ hoạt động khi gọi từ **bên ngoài** bean (qua CDI proxy). Gọi internal (this.method()) sẽ KHÔNG trigger transaction.

### Q3: Flyway vs Liquibase?

| | Flyway | Liquibase |
| :--- | :--- | :--- |
| **Format** | SQL thuần | XML, YAML, JSON, SQL |
| **Learning curve** | Dễ hơn | Phức tạp hơn |
| **Rollback** | Chỉ bản Pro | Miễn phí |
| **Database agnostic** | Ít (SQL thuần) | Nhiều (abstract format) |
| **Khuyến nghị** | Hầu hết dự án | Cần multi-DB, rollback |

### Q4: Hibernate Reactive có cần @Transactional không?

- **KHÔNG**. Hibernate Reactive KHÔNG dùng `@Transactional` (annotation này là blocking/JTA).
- Thay vào đó dùng `Panache.withTransaction(() -> ...)` hoặc `Mutiny.Session.withTransaction()`.

### Q5: Khi nào dùng Native SQL thay vì HQL?

- Database-specific functions (PostgreSQL `ILIKE`, `jsonb`, full-text search).
- Complex queries mà HQL không hỗ trợ.
- Performance critical queries cần tối ưu execution plan.
- **Cảnh báo**: Native SQL không portable giữa các database.

### Q6: Connection pool quá nhỏ/quá lớn thì sao?

- **Quá nhỏ**: Thread phải chờ connection -> timeout, response chậm.
- **Quá lớn**: Database bị quá tải connections, context switch overhead, memory wasted.
- **Dấu hiệu cần tăng**: `AgroalConnectionPoolMetrics.acquireCount` cao + `acquisitionTimeout` xảy ra.
- **Dấu hiệu cần giảm**: Database CPU cao, connection idle nhiều.

---

## Best Practices

1. **Repository Pattern** cho production projects
2. **FetchType.LAZY** cho tất cả relationships (đừng bao giờ EAGER)
3. **Flyway** cho database migrations (không dùng `drop-and-create` ở prod)
4. **Batch operations** cho bulk insert/update
5. **Projections** khi chỉ cần một phần dữ liệu
6. **Pagination** cho mọi list query (không bao giờ `findAll()` không giới hạn)
7. **Optimistic locking** mặc định, Pessimistic cho critical sections
8. **Monitor** Hibernate statistics và connection pool metrics
9. **Index** cho tất cả column trong WHERE, JOIN, ORDER BY
10. **@Transactional** chỉ ở Service layer, không ở Repository

---

## Tổng kết

- **Panache**: Simplified data access (Active Record hoặc Repository)
- **Hibernate ORM**: Full JPA support với build-time optimization
- **Hibernate Reactive**: Non-blocking database access cho high concurrency
- **Transactions**: @Transactional (blocking) hoặc Panache.withTransaction (reactive)
- **Flyway**: Database migration best choice
- **Caching**: 2nd Level Cache + Application Cache
- **Performance**: N+1 fix, batch ops, projections, pagination, connection pool tuning
