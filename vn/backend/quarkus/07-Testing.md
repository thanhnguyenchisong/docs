# Testing - Từ Zero đến Master Quarkus

## Mục lục
1. [Tổng quan Testing trong Quarkus](#tổng-quan-testing-trong-quarkus)
2. [Dependencies & Setup](#dependencies--setup)
3. [@QuarkusTest chi tiết](#quarkustest-chi-tiết)
4. [REST-Assured (HTTP Testing)](#rest-assured-http-testing)
5. [Mocking (@InjectMock, QuarkusMock)](#mocking-injectmock-quarkusmock)
6. [Dev Services (Zero-Config Testcontainers)](#dev-services-zero-config-testcontainers)
7. [Test Resources (QuarkusTestResource)](#test-resources-quarkustestresource)
8. [Testcontainers cơ bản](#testcontainers-cơ-bản)
9. [Contract Testing](#contract-testing)
10. [Test Profiles](#test-profiles)
11. [@QuarkusIntegrationTest](#quarkusintegrationtest)
12. [Native Image Testing](#native-image-testing)
13. [Continuous Testing](#continuous-testing)
14. [Testing Security](#testing-security)
15. [Testing Reactive Endpoints](#testing-reactive-endpoints)
16. [Testing Kafka/Messaging](#testing-kafkamessaging)
17. [Database Testing Strategies](#database-testing-strategies)
18. [Test Organization & Best Practices](#test-organization--best-practices)
19. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tổng quan Testing trong Quarkus

### Các loại Test trong Quarkus

| Loại | Annotation | Đặc điểm | Tốc độ |
| :--- | :--- | :--- | :--- |
| **Unit Test** | Không cần annotation đặc biệt | Test logic thuần, không cần container | Rất nhanh |
| **@QuarkusTest** | `@QuarkusTest` | Start Quarkus container, CDI, injection | Nhanh |
| **@QuarkusIntegrationTest** | `@QuarkusIntegrationTest` | Test binary đã build (JAR/native) | Chậm |
| **Native Test** | `@QuarkusIntegrationTest` + native profile | Test native executable | Rất chậm |

### Test Pyramid

```
          /‾‾‾‾‾‾‾\
         / Native   \          ← Ít nhất, chỉ smoke test
        /  Tests     \
       /‾‾‾‾‾‾‾‾‾‾‾‾‾\
      / Integration    \        ← Vừa phải, test luồng chính
     /  Tests           \
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   / @QuarkusTest          \    ← Nhiều, test API + CDI + DB
  /  (Component Tests)      \
 /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
/ Unit Tests                   \  ← Nhiều nhất, test logic thuần
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

---

## Dependencies & Setup

### Maven Dependencies

```xml
<!-- ===== Core Testing ===== -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-junit5</artifactId>
    <scope>test</scope>
</dependency>

<!-- REST-Assured (HTTP testing) -->
<dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <scope>test</scope>
</dependency>

<!-- ===== Mocking ===== -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-junit5-mockito</artifactId>
    <scope>test</scope>
</dependency>

<!-- ===== Testcontainers (nếu cần manual control) ===== -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-test-common</artifactId>
    <scope>test</scope>
</dependency>

<!-- ===== Security Testing ===== -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-test-security</artifactId>
    <scope>test</scope>
</dependency>

<!-- ===== Kafka Testing ===== -->
<dependency>
    <groupId>io.smallrye.reactive</groupId>
    <artifactId>smallrye-reactive-messaging-in-memory</artifactId>
    <scope>test</scope>
</dependency>
```

### application.properties cho test

```properties
# src/test/resources/application.properties

# Quarkus tự động dùng profile "test" khi chạy test
%test.quarkus.log.level=INFO
%test.quarkus.log.category."com.example".level=DEBUG

# Database (Dev Services sẽ tự config nếu không khai báo URL)
# Nếu muốn dùng H2 thay vì Testcontainers:
# %test.quarkus.datasource.db-kind=h2
# %test.quarkus.datasource.jdbc.url=jdbc:h2:mem:test

%test.quarkus.hibernate-orm.database.generation=drop-and-create
%test.quarkus.hibernate-orm.log.sql=true
```

---

## @QuarkusTest chi tiết

### Cơ chế hoạt động

```java
@QuarkusTest  // ← Start FULL Quarkus application (CDI, Hibernate, REST, etc.)
class UserResourceTest {
    // Quarkus start ĐỘC LẬP cho mỗi test class (hoặc chia sẻ nếu cùng profile)
    // Application chạy trên random port (default)
    // CDI container hoạt động → @Inject hoạt động
    // Dev Services tự start DB/Kafka/Redis nếu cần
}
```

### Vòng đời @QuarkusTest

```
1. Start Quarkus application (1 lần per test class/profile)
   ↓
2. Start Dev Services (DB, Kafka...) nếu cần
   ↓
3. Inject dependencies cho test instance
   ↓
4. Chạy @BeforeEach
   ↓
5. Chạy @Test method
   ↓
6. Chạy @AfterEach
   ↓
7. Lặp lại 4-6 cho mỗi @Test
   ↓
8. Chạy @AfterAll
   ↓
9. Shutdown (nếu test class cuối cùng với profile này)
```

### Basic Test

```java
@QuarkusTest
class UserResourceTest {

    @Test
    void testListUsers() {
        given()
            .when().get("/api/users")
            .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("$.size()", greaterThan(0));
    }

    @Test
    void testGetUserById() {
        given()
            .pathParam("id", 1)
            .when().get("/api/users/{id}")
            .then()
            .statusCode(200)
            .body("id", equalTo(1))
            .body("name", notNullValue())
            .body("email", containsString("@"));
    }

    @Test
    void testCreateUser() {
        User user = new User();
        user.name = "John Doe";
        user.email = "john@example.com";

        given()
            .contentType(ContentType.JSON)
            .body(user)
            .when().post("/api/users")
            .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("John Doe"))
            .body("email", equalTo("john@example.com"));
    }

    @Test
    void testUserNotFound() {
        given()
            .pathParam("id", 99999)
            .when().get("/api/users/{id}")
            .then()
            .statusCode(404);
    }
}
```

### Inject Dependencies trong Test

```java
@QuarkusTest
class UserServiceTest {

    @Inject
    UserService userService;  // CDI injection hoạt động

    @Inject
    UserRepository userRepository;

    @Test
    void testFindByEmail() {
        User user = userService.findByEmail("admin@example.com");
        assertNotNull(user);
        assertEquals("admin", user.name);
    }

    @Test
    @Transactional  // Cần @Transactional nếu test trực tiếp thao tác DB
    void testCreateUser() {
        User user = new User();
        user.name = "Test User";
        user.email = "test@example.com";

        userRepository.persist(user);
        assertNotNull(user.id);

        User found = userRepository.findById(user.id);
        assertEquals("Test User", found.name);
    }
}
```

### Test HTTP Port

```java
@QuarkusTest
class PortTest {

    @TestHTTPResource  // Inject base URL
    URL baseUrl;

    @TestHTTPResource("/api/users")  // Inject specific URL
    URL usersUrl;

    @ConfigProperty(name = "quarkus.http.test-port")
    int testPort;

    @Test
    void testPort() {
        System.out.println("Test running on port: " + testPort);
        System.out.println("Base URL: " + baseUrl);
    }
}
```

---

## REST-Assured (HTTP Testing)

### Anatomy of REST-Assured

```java
given()                                    // Thiết lập request
    .contentType(ContentType.JSON)         //   Content-Type header
    .header("Authorization", "Bearer " + token)  //   Custom header
    .queryParam("page", 0)                 //   Query parameter
    .queryParam("size", 10)                //   Query parameter
    .pathParam("id", 123)                  //   Path parameter
    .body(requestBody)                     //   Request body (auto-serialized)
.when()                                    // Thực hiện request
    .post("/api/users/{id}/orders")        //   HTTP method + path
.then()                                    // Kiểm tra response
    .statusCode(201)                       //   HTTP status code
    .contentType(ContentType.JSON)         //   Response content type
    .header("Location", containsString("/orders/"))  //   Response header
    .body("id", notNullValue())            //   JSON body assertion
    .body("status", equalTo("CREATED"))    //   Exact match
    .body("items.size()", equalTo(3))      //   Array size
    .body("totalAmount", greaterThan(0.0f)); //  Numeric comparison
```

### JSON Path Assertions

```java
// ===== Response JSON: =====
// {
//   "id": 1,
//   "name": "John",
//   "address": {
//     "city": "Hanoi",
//     "zipCode": "100000"
//   },
//   "orders": [
//     { "id": 101, "amount": 50.0, "status": "COMPLETED" },
//     { "id": 102, "amount": 30.0, "status": "PENDING" }
//   ]
// }

@Test
void testJsonPath() {
    given()
        .when().get("/api/users/1")
        .then()
        .statusCode(200)
        // Nested object
        .body("address.city", equalTo("Hanoi"))
        .body("address.zipCode", equalTo("100000"))
        // Array
        .body("orders.size()", equalTo(2))
        .body("orders[0].id", equalTo(101))
        .body("orders[0].status", equalTo("COMPLETED"))
        // Array filtering (GPath)
        .body("orders.findAll { it.status == 'COMPLETED' }.size()", equalTo(1))
        .body("orders.find { it.amount > 40 }.id", equalTo(101))
        // Sum
        .body("orders.sum { it.amount }", equalTo(80.0f))
        // Collect
        .body("orders.collect { it.status }", hasItems("COMPLETED", "PENDING"));
}
```

### Extract Response

```java
@Test
void testExtractAndChain() {
    // Tạo user → Lấy ID → Get user
    int userId = given()
        .contentType(ContentType.JSON)
        .body(new User("John", "john@example.com"))
        .when().post("/api/users")
        .then()
        .statusCode(201)
        .extract().path("id");  // Extract field từ response

    // Sử dụng userId cho request tiếp theo
    given()
        .pathParam("id", userId)
        .when().get("/api/users/{id}")
        .then()
        .statusCode(200)
        .body("name", equalTo("John"));
}

// Extract full response
@Test
void testExtractFull() {
    Response response = given()
        .when().get("/api/users")
        .then()
        .statusCode(200)
        .extract().response();

    List<User> users = response.jsonPath().getList(".", User.class);
    String firstUserName = response.jsonPath().getString("[0].name");
    int totalCount = response.header("X-Total-Count") != null
        ? Integer.parseInt(response.header("X-Total-Count")) : users.size();
}
```

### File Upload/Download

```java
@Test
void testFileUpload() {
    given()
        .multiPart("file", new File("test-data/avatar.png"))
        .multiPart("description", "User avatar")
        .when().post("/api/upload")
        .then()
        .statusCode(200)
        .body("fileId", notNullValue());
}

@Test
void testFileDownload() {
    byte[] content = given()
        .when().get("/api/files/report.pdf")
        .then()
        .statusCode(200)
        .contentType("application/pdf")
        .extract().asByteArray();

    assertTrue(content.length > 0);
}
```

---

## Mocking (@InjectMock, QuarkusMock)

### @InjectMock (Khuyến nghị)

```java
@QuarkusTest
class OrderServiceTest {

    @InjectMock  // Tạo Mockito mock VÀ inject vào CDI container
    PaymentService paymentService;

    @InjectMock
    EmailService emailService;

    @Inject
    OrderService orderService;  // Bean thật, nhưng dependencies bị mock

    @Test
    void testCreateOrder_PaymentSuccess() {
        // Arrange: Định nghĩa behavior cho mock
        Mockito.when(paymentService.charge(any(Order.class)))
            .thenReturn(new PaymentResult(true, "TXN-001"));
        Mockito.doNothing().when(emailService).sendConfirmation(anyString(), any());

        // Act
        Order order = orderService.createOrder(new CreateOrderRequest("item1", 100.0));

        // Assert
        assertNotNull(order);
        assertEquals(OrderStatus.PAID, order.status);

        // Verify interactions
        Mockito.verify(paymentService).charge(any(Order.class));
        Mockito.verify(emailService).sendConfirmation(eq("customer@example.com"), any());
    }

    @Test
    void testCreateOrder_PaymentFailed() {
        // Arrange: Payment fails
        Mockito.when(paymentService.charge(any()))
            .thenReturn(new PaymentResult(false, null));

        // Act & Assert
        assertThrows(PaymentFailedException.class, () ->
            orderService.createOrder(new CreateOrderRequest("item1", 100.0))
        );

        // Verify email NOT sent
        Mockito.verify(emailService, Mockito.never()).sendConfirmation(anyString(), any());
    }

    @Test
    void testCreateOrder_PaymentThrows() {
        // Arrange: Payment throws exception
        Mockito.when(paymentService.charge(any()))
            .thenThrow(new RuntimeException("Service unavailable"));

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            orderService.createOrder(new CreateOrderRequest("item1", 100.0))
        );
    }
}
```

### @InjectMock với Reactive (Uni/Multi)

```java
@QuarkusTest
class ReactiveServiceTest {

    @InjectMock
    ReactiveUserRepository userRepo;

    @Inject
    ReactiveUserService userService;

    @Test
    void testFindById() {
        User user = new User(1L, "John");

        // Mock reactive method
        Mockito.when(userRepo.findById(1L))
            .thenReturn(Uni.createFrom().item(user));

        // Subscribe và assert
        User result = userService.getUser(1L)
            .await().atMost(Duration.ofSeconds(5));

        assertEquals("John", result.name);
    }

    @Test
    void testFindAll() {
        Mockito.when(userRepo.listAll())
            .thenReturn(Uni.createFrom().item(List.of(
                new User(1L, "John"),
                new User(2L, "Jane")
            )));

        List<User> users = userService.getAllUsers()
            .await().atMost(Duration.ofSeconds(5));

        assertEquals(2, users.size());
    }
}
```

### @InjectSpy (Partial Mock)

```java
@QuarkusTest
class SpyTest {

    @InjectSpy  // Bean thật, nhưng có thể verify và override một số method
    UserRepository userRepository;

    @Inject
    UserService userService;

    @Test
    void testWithSpy() {
        // UserRepository là bean THẬT (gọi DB thật qua Dev Services)
        User user = userService.createUser("John", "john@example.com");

        // Verify method thật được gọi
        Mockito.verify(userRepository).persist(any(User.class));
    }

    @Test
    void testOverrideOneMethod() {
        // Override 1 method, còn lại vẫn gọi thật
        Mockito.doReturn(999L).when(userRepository).count();

        long count = userService.getUserCount();
        assertEquals(999L, count);
    }
}
```

### QuarkusMock (Programmatic)

```java
@QuarkusTest
class ProgrammaticMockTest {

    @Inject
    ExternalApiClient externalApi;

    @BeforeEach
    void setup() {
        // Thay thế bean bằng mock lúc runtime
        ExternalApiClient mock = Mockito.mock(ExternalApiClient.class);
        Mockito.when(mock.getData()).thenReturn("mocked data");

        QuarkusMock.installMockForType(mock, ExternalApiClient.class);
    }

    @Test
    void testWithMock() {
        assertEquals("mocked data", externalApi.getData());
    }
}
```

### So sánh @InjectMock vs QuarkusMock vs @InjectSpy

| | @InjectMock | QuarkusMock | @InjectSpy |
| :--- | :--- | :--- | :--- |
| **Cách dùng** | Annotation trên field | Programmatic `installMock` | Annotation trên field |
| **Mock type** | Full mock (tất cả method stubbed) | Full mock | Partial mock (method thật) |
| **Scope** | Per test class | Per test method (installMock) | Per test class |
| **Khi nào dùng** | Hầu hết trường hợp | Cần mock dynamically | Cần verify gọi method thật |

---

## Dev Services (Zero-Config Testcontainers)

### Cách hoạt động

```
Khi chạy test (hoặc dev mode):
1. Quarkus phát hiện dependency (VD: quarkus-jdbc-postgresql)
2. Không có config URL → Tự động start container PostgreSQL
3. Tự động inject connection URL vào application
4. Test chạy với DB THẬT (không phải H2 in-memory)
5. Container tự shutdown khi test xong
```

### Supported Dev Services

| Service | Extension | Container |
| :--- | :--- | :--- |
| **PostgreSQL** | `quarkus-jdbc-postgresql` | PostgreSQL |
| **MySQL** | `quarkus-jdbc-mysql` | MySQL |
| **MariaDB** | `quarkus-jdbc-mariadb` | MariaDB |
| **MongoDB** | `quarkus-mongodb-client` | MongoDB |
| **Kafka** | `quarkus-smallrye-reactive-messaging-kafka` | Redpanda |
| **Redis** | `quarkus-redis-client` | Redis |
| **RabbitMQ** | `quarkus-smallrye-reactive-messaging-amqp` | RabbitMQ |
| **Keycloak** | `quarkus-oidc` | Keycloak |
| **Elasticsearch** | `quarkus-elasticsearch-rest-client` | Elasticsearch |

### Cấu hình Dev Services

```properties
# ===== Bật/Tắt Dev Services =====
# Mặc định: true nếu không có config URL
quarkus.datasource.devservices.enabled=true

# ===== Custom image =====
quarkus.datasource.devservices.image-name=postgres:16-alpine

# ===== Custom properties =====
quarkus.datasource.devservices.properties.max_connections=100

# ===== Init script =====
quarkus.datasource.devservices.init-script-path=init-test-data.sql

# ===== Shared (dev mode) =====
# Giữ container running giữa các restart
quarkus.datasource.devservices.shared=true
quarkus.datasource.devservices.service-name=my-postgres

# ===== Kafka Dev Services =====
quarkus.kafka.devservices.enabled=true
quarkus.kafka.devservices.image-name=docker.io/vectorized/redpanda:latest

# ===== Redis Dev Services =====
quarkus.redis.devservices.enabled=true
quarkus.redis.devservices.image-name=redis:7-alpine
```

### Custom Testcontainers (khi Dev Services không đủ)

```java
// Tạo QuarkusTestResourceLifecycleManager custom
public class CustomPostgresResource implements QuarkusTestResourceLifecycleManager {

    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test")
        .withInitScript("init.sql");

    @Override
    public Map<String, String> start() {
        POSTGRES.start();
        return Map.of(
            "quarkus.datasource.jdbc.url", POSTGRES.getJdbcUrl(),
            "quarkus.datasource.username", POSTGRES.getUsername(),
            "quarkus.datasource.password", POSTGRES.getPassword()
        );
    }

    @Override
    public void stop() {
        POSTGRES.stop();
    }
}

// Sử dụng
@QuarkusTest
@QuarkusTestResource(CustomPostgresResource.class)
class DatabaseTest {
    // Test với custom PostgreSQL container
}
```

---

## Test Resources (QuarkusTestResource)

**Test Resources** là cơ chế Quarkus để khởi động/teardown tài nguyên cho test (DB, Kafka, WireMock, ...) qua `QuarkusTestResourceLifecycleManager`.

### Khi nào cần

- Dev Services **không** đủ (VD: cần Oracle, custom init script, nhiều DB).
- Cần **nhiều container** (Postgres + Redis + Kafka) với thứ tự khởi động xác định.
- Cần **inject config** từ resource (URL, port) vào `application.properties` cho test.

### API chính

```java
public interface QuarkusTestResourceLifecycleManager {
    Map<String, String> start();  // Start container/service, return config overrides
    void stop();                  // Cleanup
}
```

- `start()`: Start container, trả về `Map<String, String>` — Quarkus inject các key này như config (VD: `quarkus.datasource.jdbc.url`).
- `stop()`: Gọi khi test class kết thúc.

### Nhiều test resources

```java
@QuarkusTest
@QuarkusTestResource(PostgresResource.class)
@QuarkusTestResource(RedisResource.class)
class MultiResourceTest { }
```

Thứ tự: start theo thứ tự khai báo, stop ngược lại.

---

## Testcontainers cơ bản

**Testcontainers** (Java library) dùng Docker để chạy DB/message broker thật trong test. Quarkus tích hợp qua **Dev Services** (tự start container khi thiếu config) hoặc **QuarkusTestResource** (tự kiểm soát).

### Dev Services vs Testcontainers thủ công

| | Dev Services | Testcontainers (QuarkusTestResource) |
| :--- | :--- | :--- |
| **Config** | Zero config (Quarkus tự inject URL) | Tự khai báo container, tự inject config trong `start()` |
| **Image** | Quarkus chọn mặc định | Tự chọn image, version |
| **Init script** | `quarkus.datasource.devservices.init-script-path` | `withInitScript("init.sql")` |
| **Khi nào dùng** | 1 DB/1 Kafka, đơn giản | Nhiều service, custom port, shared container |

### Dependency Testcontainers

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.19.3</version>
    <scope>test</scope>
</dependency>
```

### Ví dụ cơ bản (không Quarkus)

```java
// Standalone Testcontainers (JUnit)
@Testcontainers
class MyTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @BeforeAll
    static void setup() {
        postgres.start();
        // System.setProperty("quarkus.datasource.jdbc.url", postgres.getJdbcUrl());
    }
}
```

Trong Quarkus: nên bọc trong `QuarkusTestResourceLifecycleManager` và dùng `@QuarkusTestResource` để Quarkus inject config đúng profile test.

---

## Contract Testing

**Contract testing** đảm bảo Consumer và Provider API tương thích (request/response) mà không cần chạy toàn bộ hệ thống.

### Consumer-driven (Pact)

- **Consumer** (client) định nghĩa "tôi mong đợi request/response thế này".
- **Provider** (server) chạy test xác minh có thỏa contract không.

```xml
<!-- Pact JUnit 5 -->
<dependency>
    <groupId>au.com.dius.pact.consumer</groupId>
    <artifactId>junit5</artifactId>
    <version>4.6.9</version>
    <scope>test</scope>
</dependency>
```

```java
// Consumer test: định nghĩa contract
@PactTestFor(providerName = "user-service")
class UserClientContractTest {
    @Pact(consumer = "order-service", provider = "user-service")
    RequestResponsePact userByIdPact(PactDslWithProvider builder) {
        return builder
            .given("user 1 exists")
            .uponReceiving("get user 1")
            .path("/users/1")
            .method("GET")
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody().numberType("id", 1L).stringType("name", "John"))
            .toPact();
    }

    @Test
    @PactTestFor(pactMethod = "userByIdPact")
    void getUser(MockServer mockServer) {
        // Gọi UserClient với baseUrl = mockServer.getUrl()
        // Assert response khớp contract
    }
}
```

### Provider verification (Quarkus)

- Provider (Quarkus app) chạy `@QuarkusTest` + Pact verify: nhận request từ Pact file (do consumer tạo), gọi endpoint thật, so sánh response.
- Giúp phát hiện breaking change trước khi deploy.

### Tóm tắt

- **Contract test** thay thế một phần integration test end-to-end: nhanh hơn, ổn định hơn.
- **Security testing** (OIDC, JWT): dùng `@TestSecurity`, `quarkus-test-security`, hoặc Keycloak Dev Services — xem mục [Testing Security](#testing-security).

---

## Test Profiles

### Tạo Test Profile

```java
public class MockExternalServiceProfile implements QuarkusTestProfile {

    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
            "quarkus.hibernate-orm.database.generation", "drop-and-create",
            "app.external-api.url", "http://localhost:8089/mock",
            "app.feature.email-enabled", "false"
        );
    }

    @Override
    public Set<Class<?>> getEnabledAlternatives() {
        // Kích hoạt CDI Alternative beans cho test
        return Set.of(MockPaymentService.class, MockEmailService.class);
    }

    @Override
    public String getConfigProfile() {
        return "mock-external";  // Profile name (dùng %mock-external.xxx trong properties)
    }

    @Override
    public List<TestResourceEntry> testResources() {
        // Thêm custom test resources
        return List.of(new TestResourceEntry(WireMockResource.class));
    }

    @Override
    public Set<String> tags() {
        return Set.of("mock");  // Tag để filter tests
    }
}

// Sử dụng
@QuarkusTest
@TestProfile(MockExternalServiceProfile.class)
class ExternalServiceTest {
    // Quarkus restart với profile "mock-external"
    // MockPaymentService và MockEmailService được kích hoạt
}
```

### Lưu ý về Test Profile

```java
// ⚠️ QUAN TRỌNG: Mỗi TestProfile khác nhau → Quarkus RESTART ứng dụng
// → Tests chung profile chia sẻ cùng Quarkus instance (nhanh)
// → Tests khác profile → Restart (chậm)
// → Tối thiểu số profile khác nhau để tăng tốc test suite

// Test KHÔNG có @TestProfile → Dùng default profile
@QuarkusTest
class DefaultProfileTest { }  // Profile: "test"

// Test CÓ @TestProfile → Dùng profile khác
@QuarkusTest
@TestProfile(MockProfile.class)
class MockProfileTest { }  // Profile: "mock" (Quarkus restart)

// Thứ tự chạy: JUnit chạy cùng profile trước, khác profile sau
// → Giảm số lần restart
```

---

## @QuarkusIntegrationTest

### Khác biệt với @QuarkusTest

| | @QuarkusTest | @QuarkusIntegrationTest |
| :--- | :--- | :--- |
| **Chạy app** | In-process (cùng JVM) | Out-of-process (binary riêng) |
| **CDI Injection** | Có | **KHÔNG** |
| **@InjectMock** | Có | **KHÔNG** |
| **Test target** | Source code + runtime | JAR hoặc Native binary |
| **Tốc độ** | Nhanh | Chậm |
| **Use case** | Unit/Component test | Smoke test, native test |

### Sử dụng

```java
@QuarkusIntegrationTest  // Test binary đã build
class UserResourceIT {

    // KHÔNG có @Inject, @InjectMock (app chạy process riêng)
    // Chỉ dùng REST-Assured để test HTTP

    @Test
    void testListUsers() {
        given()
            .when().get("/api/users")
            .then()
            .statusCode(200);
    }

    @Test
    void testCreateAndGet() {
        int id = given()
            .contentType(ContentType.JSON)
            .body("{\"name\": \"IT Test\", \"email\": \"it@test.com\"}")
            .when().post("/api/users")
            .then()
            .statusCode(201)
            .extract().path("id");

        given()
            .when().get("/api/users/" + id)
            .then()
            .statusCode(200)
            .body("name", equalTo("IT Test"));
    }
}
```

### Chạy Integration Test

```bash
# Build JAR + chạy integration test
./mvnw verify

# Build Native + chạy integration test
./mvnw verify -Pnative

# Chỉ chạy integration test (skip unit test)
./mvnw failsafe:integration-test
```

---

## Native Image Testing

### @QuarkusIntegrationTest với Native

```java
// Cùng test class, chạy với -Pnative sẽ test native binary
@QuarkusIntegrationTest
class NativeSmokeTestIT {

    @Test
    void testHealthCheck() {
        given()
            .when().get("/q/health")
            .then()
            .statusCode(200)
            .body("status", equalTo("UP"));
    }

    @Test
    void testMainEndpoints() {
        // Smoke test các endpoint chính
        given().when().get("/api/users").then().statusCode(200);
        given().when().get("/api/products").then().statusCode(200);
    }
}
```

```bash
# Build native + run native integration tests
./mvnw verify -Pnative

# Hoặc dùng container build (không cần GraalVM local)
./mvnw verify -Pnative -Dquarkus.native.container-build=true
```

### @NativeImageTest (Deprecated)

```java
// ⚠️ @NativeImageTest đã deprecated
// Dùng @QuarkusIntegrationTest thay thế
```

---

## Continuous Testing

### Cách sử dụng

```bash
# Start dev mode
./mvnw quarkus:dev

# Trong terminal dev mode:
# r → Run all tests
# f → Run failed tests only
# o → Toggle test output
# h → Help

# Tests tự động chạy lại khi:
# 1. Source code thay đổi
# 2. Test code thay đổi
# 3. Config thay đổi
```

### Cấu hình Continuous Testing

```properties
# application.properties
quarkus.test.continuous-testing=enabled    # enabled | disabled | paused

# Chỉ chạy lại test bị ảnh hưởng (nhanh hơn)
quarkus.test.only-test-changes=true

# Test tags
quarkus.test.include-tags=fast
quarkus.test.exclude-tags=slow,integration

# Console output
quarkus.test.display-test-output=true
```

### Test Tags

```java
@QuarkusTest
@Tag("fast")
class FastTest {
    @Test
    void quickTest() { }
}

@QuarkusTest
@Tag("slow")
class SlowIntegrationTest {
    @Test
    void longRunningTest() { }
}
```

---

## Testing Security

### @TestSecurity

```java
@QuarkusTest
class SecureResourceTest {

    // ===== Test với authenticated user =====
    @Test
    @TestSecurity(user = "john", roles = {"user"})
    void testUserAccess() {
        given()
            .when().get("/api/profile")
            .then()
            .statusCode(200)
            .body("username", equalTo("john"));
    }

    // ===== Test với admin role =====
    @Test
    @TestSecurity(user = "admin", roles = {"admin", "user"})
    void testAdminAccess() {
        given()
            .when().get("/api/admin/users")
            .then()
            .statusCode(200);
    }

    // ===== Test unauthorized (không có @TestSecurity) =====
    @Test
    void testUnauthorized() {
        given()
            .when().get("/api/profile")
            .then()
            .statusCode(401);  // Unauthorized
    }

    // ===== Test forbidden (role không đủ) =====
    @Test
    @TestSecurity(user = "john", roles = {"user"})
    void testForbidden() {
        given()
            .when().get("/api/admin/users")
            .then()
            .statusCode(403);  // Forbidden
    }
}
```

### @TestSecurity với JWT Claims

```java
@Test
@TestSecurity(user = "john", roles = {"user"})
@JwtSecurity(claims = {
    @Claim(key = "email", value = "john@example.com"),
    @Claim(key = "groups", value = "[\"user\", \"premium\"]"),
    @Claim(key = "iss", value = "https://auth.example.com")
})
void testWithClaims() {
    given()
        .when().get("/api/profile")
        .then()
        .statusCode(200)
        .body("email", equalTo("john@example.com"));
}
```

### @TestSecurity ở Class Level

```java
@QuarkusTest
@TestSecurity(user = "testuser", roles = {"user"})  // Áp dụng cho TẤT CẢ test methods
class AuthenticatedTest {

    @Test
    void test1() {
        // Đã authenticated với user "testuser"
    }

    @Test
    void test2() {
        // Cũng authenticated
    }

    @Test
    @TestSecurity  // Override: KHÔNG authenticated
    void testAnonymous() {
        // Anonymous request
    }
}
```

---

## Testing Reactive Endpoints

### Test Uni/Multi endpoints

```java
@QuarkusTest
class ReactiveResourceTest {

    // REST-Assured tự xử lý reactive response
    @Test
    void testReactiveGet() {
        given()
            .when().get("/api/reactive/users/1")
            .then()
            .statusCode(200)
            .body("name", equalTo("John"));
        // Không khác gì test blocking endpoint
    }

    // Test SSE (Server-Sent Events)
    @Test
    void testSSE() {
        given()
            .accept("text/event-stream")
            .when().get("/api/events/stream")
            .then()
            .statusCode(200)
            .contentType("text/event-stream");
    }
}
```

### Test Reactive Service trực tiếp

```java
@QuarkusTest
class ReactiveServiceTest {

    @Inject
    ReactiveUserService userService;

    @Test
    void testFindById() {
        User user = userService.findById(1L)
            .await().atMost(Duration.ofSeconds(5));  // Block trong test

        assertNotNull(user);
        assertEquals("John", user.name);
    }

    @Test
    void testFindAll() {
        List<User> users = userService.findAll()
            .collect().asList()
            .await().atMost(Duration.ofSeconds(5));

        assertFalse(users.isEmpty());
    }

    @Test
    void testCreateUser() {
        User user = userService.create(new User("Test", "test@test.com"))
            .await().atMost(Duration.ofSeconds(5));

        assertNotNull(user.id);
    }

    @Test
    void testFailure() {
        assertThrows(NotFoundException.class, () ->
            userService.findById(99999L)
                .await().atMost(Duration.ofSeconds(5))
        );
    }
}
```

---

## Testing Kafka/Messaging

### In-Memory Connector

```java
// Thay Kafka bằng in-memory connector cho test
// Dependency: smallrye-reactive-messaging-in-memory

@QuarkusTest
@TestProfile(KafkaTestProfile.class)
class OrderEventTest {

    @Inject
    @Any
    InMemoryConnector connector;

    @Inject
    OrderService orderService;

    @Test
    void testOrderCreatedEvent() {
        // Get sink (outgoing channel)
        InMemorySink<OrderEvent> sink = connector.sink("order-events");

        // Trigger action
        orderService.createOrder(new CreateOrderRequest("item1", 100.0));

        // Verify message sent
        await().atMost(Duration.ofSeconds(5)).until(() -> sink.received().size() == 1);

        OrderEvent event = sink.received().get(0).getPayload();
        assertEquals("CREATED", event.getType());
        assertEquals(100.0, event.getAmount());
    }

    @Test
    void testProcessIncomingEvent() {
        // Get source (incoming channel)
        InMemorySource<OrderEvent> source = connector.source("order-events-in");

        // Send message
        source.send(new OrderEvent(1L, "SHIPPED", 50.0));

        // Verify processing (check side effects)
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            // Verify notification sent, DB updated, etc.
        });
    }

    @BeforeEach
    void cleanup() {
        connector.sink("order-events").clear();
    }
}
```

### Kafka Test Profile

```java
public class KafkaTestProfile implements QuarkusTestProfile {
    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
            // Thay Kafka connector bằng in-memory
            "mp.messaging.outgoing.order-events.connector", "smallrye-in-memory",
            "mp.messaging.incoming.order-events-in.connector", "smallrye-in-memory"
        );
    }
}
```

---

## Database Testing Strategies

### Strategy 1: Dev Services (Khuyến nghị)

```java
// Không cần config gì cả!
// Quarkus tự start PostgreSQL container
@QuarkusTest
class DatabaseTest {

    @Inject
    UserRepository userRepo;

    @Test
    @Transactional
    void testCRUD() {
        User user = new User("Test", "test@test.com");
        userRepo.persist(user);

        assertNotNull(user.id);

        User found = userRepo.findById(user.id);
        assertEquals("Test", found.name);

        userRepo.delete(found);
        assertNull(userRepo.findById(user.id));
    }
}
```

### Strategy 2: Test Data Setup

```java
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OrderedDatabaseTest {

    @Inject
    UserRepository userRepo;

    // ===== Cách 1: @BeforeEach (mỗi test method) =====
    @BeforeEach
    @Transactional
    void setupData() {
        userRepo.deleteAll();
        userRepo.persist(new User("Admin", "admin@test.com"));
        userRepo.persist(new User("User1", "user1@test.com"));
    }

    @Test
    void testCountUsers() {
        assertEquals(2, userRepo.count());
    }

    @Test
    void testFindByEmail() {
        assertNotNull(userRepo.find("email", "admin@test.com").firstResult());
    }
}
```

### Strategy 3: SQL Init Script

```properties
# Load test data từ SQL file
%test.quarkus.datasource.devservices.init-script-path=test-data.sql
```

```sql
-- src/test/resources/test-data.sql
INSERT INTO users (id, name, email, status) VALUES
(1, 'Admin', 'admin@test.com', 'ACTIVE'),
(2, 'User1', 'user1@test.com', 'ACTIVE'),
(3, 'Banned', 'banned@test.com', 'BANNED');
```

### Strategy 4: Test Data Builder

```java
// Builder pattern cho test data
public class TestDataFactory {

    public static User createUser() {
        return createUser("Default User", "default@test.com");
    }

    public static User createUser(String name, String email) {
        User user = new User();
        user.name = name;
        user.email = email;
        user.status = UserStatus.ACTIVE;
        user.createdAt = LocalDateTime.now();
        return user;
    }

    public static Order createOrder(User user, BigDecimal amount) {
        Order order = new Order();
        order.user = user;
        order.totalAmount = amount;
        order.status = OrderStatus.PENDING;
        return order;
    }
}

// Sử dụng trong test
@Test
@Transactional
void testWithFactory() {
    User user = TestDataFactory.createUser("John", "john@test.com");
    user.persist();

    Order order = TestDataFactory.createOrder(user, new BigDecimal("99.99"));
    order.persist();

    assertEquals(1, Order.count("user", user));
}
```

---

## ===== ENHANCEMENTS =====

### Mục bổ sung sau "Database Testing Strategies": Advanced TestData Builders

```java
// ===== TestDataBuilder Pattern - Complete Example =====
public abstract class TestDataBuilder<T> {
    protected T instance;

    public abstract T build();

    public T buildAndPersist() {
        T obj = build();
        if (obj instanceof PanacheEntity) {
            ((PanacheEntity) obj).persist();
        }
        return obj;
    }
}

// ===== User Builder =====
public class UserTestBuilder extends TestDataBuilder<User> {
    private String name = "Default User";
    private String email = "default@test.com";
    private UserStatus status = UserStatus.ACTIVE;
    private List<Order> orders = new ArrayList<>();

    public UserTestBuilder() {
        instance = new User();
    }

    public UserTestBuilder withName(String name) {
        this.name = name;
        return this;
    }

    public UserTestBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserTestBuilder withStatus(UserStatus status) {
        this.status = status;
        return this;
    }

    public UserTestBuilder withOrders(Order... orders) {
        this.orders.addAll(Arrays.asList(orders));
        return this;
    }

    public UserTestBuilder admin() {
        this.name = "Admin User";
        this.email = "admin@test.com";
        return this;
    }

    public UserTestBuilder banned() {
        this.status = UserStatus.BANNED;
        return this;
    }

    @Override
    public User build() {
        User user = instance;
        user.name = this.name;
        user.email = this.email;
        user.status = this.status;
        user.createdAt = LocalDateTime.now();
        user.orders.addAll(this.orders);
        return user;
    }
}

// ===== Order Builder =====
public class OrderTestBuilder extends TestDataBuilder<Order> {
    private User user;
    private BigDecimal totalAmount = BigDecimal.valueOf(100);
    private OrderStatus status = OrderStatus.PENDING;
    private List<OrderItem> items = new ArrayList<>();

    public OrderTestBuilder() {
        instance = new Order();
    }

    public OrderTestBuilder forUser(User user) {
        this.user = user;
        return this;
    }

    public OrderTestBuilder withAmount(BigDecimal amount) {
        this.totalAmount = amount;
        return this;
    }

    public OrderTestBuilder withStatus(OrderStatus status) {
        this.status = status;
        return this;
    }

    public OrderTestBuilder withItems(OrderItem... items) {
        this.items.addAll(Arrays.asList(items));
        return this;
    }

    public OrderTestBuilder completed() {
        this.status = OrderStatus.COMPLETED;
        return this;
    }

    @Override
    public Order build() {
        Order order = instance;
        order.user = this.user;
        order.totalAmount = this.totalAmount;
        order.status = this.status;
        order.items.addAll(this.items);
        order.createdAt = LocalDateTime.now();
        return order;
    }
}

// ===== Usage in Tests =====
@QuarkusTest
public class OrderServiceTest {

    @Inject
    OrderService orderService;

    @Inject
    UserRepository userRepo;

    @Test
    @Transactional
    public void testOrderTotalCalculation() {
        // Build test data fluently
        User user = new UserTestBuilder()
            .admin()
            .withEmail("admin@company.com")
            .buildAndPersist();

        Order order = new OrderTestBuilder()
            .forUser(user)
            .withAmount(BigDecimal.valueOf(500))
            .completed()
            .buildAndPersist();

        BigDecimal total = orderService.calculateTotal(order.id);
        assertEquals(BigDecimal.valueOf(500), total);
    }

    @Test
    @Transactional
    public void testMultipleOrdersPerUser() {
        User user = new UserTestBuilder()
            .withName("John Bulk")
            .buildAndPersist();

        // Create multiple orders
        for (int i = 0; i < 5; i++) {
            new OrderTestBuilder()
                .forUser(user)
                .withAmount(BigDecimal.valueOf(100 + i * 10))
                .buildAndPersist();
        }

        List<Order> orders = orderService.findByUser(user.id);
        assertEquals(5, orders.size());
    }
}
```

### Mục bổ sung: TestProfile Composition

```java
// ===== Base Test Profile =====
public class BaseTestProfile implements QuarkusTestProfile {
    @Override
    public Map<String, String> getConfigOverrides() {
        return Map.of(
            "quarkus.hibernate-orm.database.generation", "drop-and-create",
            "quarkus.log.level", "INFO"
        );
    }
}

// ===== Inheritance-based profiles =====
public class MobileApiTestProfile extends BaseTestProfile {
    @Override
    public Map<String, String> getConfigOverrides() {
        Map<String, String> base = super.getConfigOverrides();
        Map<String, String> mobile = new HashMap<>(base);
        mobile.put("app.api.version", "mobile-v1");
        mobile.put("app.auth.token-ttl", "1h");
        return mobile;
    }

    @Override
    public Set<Class<?>> getEnabledAlternatives() {
        return Set.of(MobileAuthenticationProvider.class);
    }
}

// ===== Composition using Profiles =====
@QuarkusTest
@TestProfile(MobileApiTestProfile.class)
public class MobileApiTest {
    // App configs: Base + Mobile overrides
}

@QuarkusTest
@TestProfile(WebApiTestProfile.class)
public class WebApiTest {
    // App configs: Base + Web overrides
}

// ===== Dynamic TestProfile =====
public class DynamicTestProfile implements QuarkusTestProfile {
    private final String environment;

    public DynamicTestProfile(String environment) {
        this.environment = environment;
    }

    @Override
    public Map<String, String> getConfigOverrides() {
        return switch(environment) {
            case "e2e" -> getE2eConfig();
            case "performance" -> getPerformanceConfig();
            case "security" -> getSecurityConfig();
            default -> getDefaultConfig();
        };
    }

    private Map<String, String> getE2eConfig() {
        return Map.of(
            "app.feature.slow-endpoint", "true",
            "app.cache.enabled", "false"
        );
    }

    private Map<String, String> getPerformanceConfig() {
        return Map.of(
            "app.cache.enabled", "true",
            "quarkus.hibernate-orm.batch.enabled", "true"
        );
    }

    private Map<String, String> getSecurityConfig() {
        return Map.of(
            "quarkus.oidc.enabled", "true",
            "app.security.strict-validation", "true"
        );
    }

    private Map<String, String> getDefaultConfig() {
        return new HashMap<>();
    }
}
```

### Mục bổ sung: Performance Testing

```java
@QuarkusTest
public class PerformanceTests {

    @Inject
    UserRepository userRepo;

    @Inject
    OrderService orderService;

    // ===== Warm-up (important for measurements) =====
    @BeforeEach
    public void warmup() {
        // JIT compilation warm-up
        for (int i = 0; i < 100; i++) {
            userRepo.count();
        }
    }

    // ===== Latency Test =====
    @Test
    public void testGetUserLatency() {
        long totalTime = 0;
        int iterations = 1000;

        for (int i = 0; i < iterations; i++) {
            long start = System.nanoTime();
            userRepo.findById(1L);
            long end = System.nanoTime();
            totalTime += (end - start);
        }

        long avgLatencyUs = (totalTime / iterations) / 1000;  // Convert to microseconds
        System.out.println("Average latency: " + avgLatencyUs + " µs");

        // Assert latency SLA
        assertTrue(avgLatencyUs < 1000, "Latency must be < 1ms");  // 1000 µs
    }

    // ===== Throughput Test =====
    @Test
    public void testInsertThroughput() {
        int batchSize = 1000;
        long start = System.currentTimeMillis();

        for (int i = 0; i < batchSize; i++) {
            User user = new User();
            user.name = "User " + i;
            user.email = "user" + i + "@test.com";
            userRepo.persist(user);

            if ((i + 1) % 100 == 0) {
                userRepo.flush();
            }
        }

        long duration = System.currentTimeMillis() - start;
        long throughput = (batchSize * 1000) / duration;  // items per second
        System.out.println("Throughput: " + throughput + " items/sec");

        assertTrue(throughput > 5000, "Should insert > 5000 items/sec");
    }

    // ===== Memory Test =====
    @Test
    public void testMemoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        long before = runtime.totalMemory() - runtime.freeMemory();

        // Operation that uses memory
        List<User> users = userRepo.findAll().list();

        long after = runtime.totalMemory() - runtime.freeMemory();
        long memoryUsed = (after - before) / 1024 / 1024;  // MB

        System.out.println("Memory used: " + memoryUsed + " MB");
        assertTrue(memoryUsed < 50, "Should use < 50 MB");
    }

    // ===== Concurrency Test (Load simulation) =====
    @Test
    public void testConcurrentRequests() throws InterruptedException {
        int threadCount = 10;
        int requestsPerThread = 100;

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount * requestsPerThread);

        long start = System.currentTimeMillis();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                for (int j = 0; j < requestsPerThread; j++) {
                    try {
                        userRepo.findById(1L);
                        latch.countDown();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        latch.await(30, TimeUnit.SECONDS);
        long duration = System.currentTimeMillis() - start;

        long throughput = (threadCount * requestsPerThread * 1000) / duration;
        System.out.println("Concurrent throughput: " + throughput + " req/sec");
    }

    // ===== Stress Test (Resource limits) =====
    @Test
    @Transactional
    public void testConnectionPoolUnderLoad() throws InterruptedException {
        int connections = 50;
        ExecutorService executor = Executors.newFixedThreadPool(connections);

        for (int i = 0; i < connections; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 10; j++) {
                    userRepo.find("active", true).list();
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            });
        }

        executor.shutdown();
        assertTrue(executor.awaitTermination(2, TimeUnit.MINUTES), "Load test completed");
        System.out.println("Connection pool held 50 concurrent connections");
    }
}
```

### Mục bổ sung: Test Organization Best Practices

```java
// ===== Test Naming Convention =====
/*
Pattern: test{ComponentUnderTest}_{ScenarioOrInput}_{ExpectedResult}

Examples:
*/
@QuarkusTest
class OrderServiceTest {

    @Test
    void testCreateOrder_ValidInput_ReturnsOrderWithId() { }

    @Test
    void testCreateOrder_InvalidUser_ThrowsNotFoundException() { }

    @Test
    void testGetOrder_UnauthorizedUser_ThrowsForbiddenException() { }

    @Test
    void testCancelOrder_ActiveOrder_UpdatesStatusToCancelled() { }

    @Test
    void testCancelOrder_AlreadyCancelled_ThrowsIllegalStateException() { }
}

// ===== Organize by Feature (BDD-style) =====
@QuarkusTest
@DisplayName("Order Management Features")
class OrderManagementFeatureTest {

    @Nested
    @DisplayName("Creating Orders")
    class CreatingOrders {
        @Test
        @DisplayName("should create order with valid items")
        void createValidOrder() { }

        @Test
        @DisplayName("should fail with duplicate items")
        void createWithDuplicates() { }
    }

    @Nested
    @DisplayName("Cancelling Orders")
    class CancellingOrders {
        @Test
        @DisplayName("should cancel pending order")
        void cancelPending() { }

        @Test
        @DisplayName("should fail cancelling completed order")
        void cancelCompleted() { }
    }
}
```
