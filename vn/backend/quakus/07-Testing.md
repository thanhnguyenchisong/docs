# Testing - Từ Zero đến Master Quarkus

## Mục lục
1. [Tổng quan Testing trong Quarkus](#tổng-quan-testing-trong-quarkus)
2. [Dependencies & Setup](#dependencies--setup)
3. [@QuarkusTest chi tiết](#quarkustest-chi-tiết)
4. [REST-Assured (HTTP Testing)](#rest-assured-http-testing)
5. [Mocking (@InjectMock, QuarkusMock)](#mocking-injectmock-quarkusmock)
6. [Dev Services (Zero-Config Testcontainers)](#dev-services-zero-config-testcontainers)
7. [Test Profiles](#test-profiles)
8. [@QuarkusIntegrationTest](#quarkusintegrationtest)
9. [Native Image Testing](#native-image-testing)
10. [Continuous Testing](#continuous-testing)
11. [Testing Security](#testing-security)
12. [Testing Reactive Endpoints](#testing-reactive-endpoints)
13. [Testing Kafka/Messaging](#testing-kafkamessaging)
14. [Database Testing Strategies](#database-testing-strategies)
15. [Test Organization & Best Practices](#test-organization--best-practices)
16. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

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

## Test Organization & Best Practices

### Cấu trúc thư mục

```
src/test/
├── java/com/example/
│   ├── resource/                     # REST endpoint tests
│   │   ├── UserResourceTest.java     # @QuarkusTest
│   │   └── ProductResourceTest.java
│   ├── service/                      # Service layer tests
│   │   ├── UserServiceTest.java      # @QuarkusTest + @InjectMock
│   │   └── OrderServiceTest.java
│   ├── repository/                   # Repository tests
│   │   └── UserRepositoryTest.java   # @QuarkusTest + Dev Services
│   ├── integration/                  # Integration tests
│   │   └── UserResourceIT.java       # @QuarkusIntegrationTest
│   ├── unit/                         # Pure unit tests (no Quarkus)
│   │   ├── UserMapperTest.java
│   │   └── PriceCalculatorTest.java
│   └── util/                         # Test utilities
│       ├── TestDataFactory.java
│       └── TestProfiles.java
└── resources/
    ├── application.properties        # Test config
    ├── test-data.sql                 # Init data
    └── import.sql                    # Hibernate import
```

### Naming Convention

```java
// Pattern: test{Method}_{Scenario}_{ExpectedResult}
@Test
void testCreateUser_ValidInput_ReturnsCreated() { }

@Test
void testCreateUser_DuplicateEmail_Returns409() { }

@Test
void testGetUser_NonExistentId_Returns404() { }

@Test
void testDeleteUser_AdminRole_ReturnsNoContent() { }

@Test
void testDeleteUser_UserRole_Returns403() { }
```

### Test Isolation

```java
@QuarkusTest
class IsolatedTest {

    @Inject
    UserRepository userRepo;

    // ===== Cleanup trước mỗi test =====
    @BeforeEach
    @Transactional
    void cleanup() {
        userRepo.deleteAll();
    }

    // ===== Hoặc dùng @TestTransaction =====
    // Auto-rollback sau mỗi test
    @Test
    @TestTransaction  // Quarkus-specific: rollback sau test
    void testWithAutoRollback() {
        User user = new User("Test", "test@test.com");
        userRepo.persist(user);
        // Sau test → tự động rollback, DB trở về trạng thái ban đầu
    }
}
```

---

## Câu hỏi thường gặp

### Q1: @QuarkusTest vs @QuarkusIntegrationTest?

| | @QuarkusTest | @QuarkusIntegrationTest |
| :--- | :--- | :--- |
| **App** | In-process | Separate process |
| **CDI** | Có (inject, mock) | Không |
| **Tốc độ** | Nhanh | Chậm |
| **Dùng cho** | Component/API test | Smoke test, native test |
| **Test gì** | Logic, CDI, REST API | Binary đã build hoạt động đúng |

### Q2: Dev Services vs Manual Testcontainers?

- **Dev Services**: Zero-config, tự động, đủ cho 90% trường hợp
- **Manual Testcontainers**: Khi cần custom config (init script phức tạp, nhiều containers, network)
- **Khuyến nghị**: Bắt đầu với Dev Services, chuyển sang manual khi cần

### Q3: Tại sao test chậm?

1. **Nhiều TestProfile khác nhau** → Quarkus restart mỗi profile → Nhóm tests cùng profile
2. **Dev Services start/stop** → Bật `shared=true` cho dev mode
3. **Quá nhiều @QuarkusTest** → Chuyển logic thuần sang Unit Test (không cần Quarkus)
4. **Database reset nặng** → Dùng `@TestTransaction` thay vì truncate

### Q4: Mock vs Dev Services - Khi nào dùng cái nào?

- **Mock**: Khi test logic isolated (service A gọi service B → mock B)
- **Dev Services**: Khi test integration thật (API → Service → DB → kiểm tra data)
- **Best practice**: Mock external services, dùng real DB (Dev Services)

### Q5: @TestTransaction vs @Transactional trong test?

- **@TestTransaction**: Auto-rollback sau test → DB clean cho test tiếp theo
- **@Transactional**: Commit thật → Data persist → Cần cleanup thủ công
- **Khuyến nghị**: Dùng `@TestTransaction` khi có thể, `@Transactional` + `@BeforeEach` cleanup khi cần data committed (VD: test qua HTTP endpoint)

### Q6: Continuous Testing có chạy @QuarkusIntegrationTest không?

- Không. Continuous Testing chỉ chạy `@QuarkusTest` (in-process tests)
- `@QuarkusIntegrationTest` chỉ chạy với `mvn verify`

---

## Best Practices

1. **Unit Test nhiều nhất**: Logic thuần, không cần Quarkus container
2. **@QuarkusTest cho API testing**: Test REST endpoints với REST-Assured
3. **Dev Services mặc định**: Dùng DB thật (PostgreSQL container) thay vì H2
4. **@InjectMock cho external services**: Không test external APIs thật
5. **@TestTransaction**: Auto-rollback để đảm bảo test isolation
6. **Minimize TestProfile**: Giảm số lần Quarkus restart
7. **TestDataFactory**: Tạo test data consistent
8. **Continuous Testing**: Bật trong dev mode để feedback nhanh
9. **@QuarkusIntegrationTest**: Ít, chỉ smoke test
10. **Native test**: Chỉ chạy trong CI/CD, không cần chạy local thường xuyên

---

## Tổng kết

- **@QuarkusTest**: Component test in-process, CDI injection, mocking
- **@QuarkusIntegrationTest**: Test binary đã build (JAR/native)
- **REST-Assured**: HTTP testing framework tích hợp
- **@InjectMock / @InjectSpy**: Mockito integration cho CDI beans
- **Dev Services**: Zero-config testcontainers (DB, Kafka, Redis...)
- **Test Profiles**: Custom configuration per test group
- **@TestSecurity**: Mock authentication/authorization
- **Continuous Testing**: Auto-run tests khi code thay đổi
- **@TestTransaction**: Auto-rollback cho test isolation
