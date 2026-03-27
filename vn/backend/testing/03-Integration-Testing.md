# Integration Testing — @SpringBootTest & Testcontainers

## Spring Boot Integration Test

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private OrderRepository orderRepo;

    @BeforeEach
    void setup() { orderRepo.deleteAll(); }

    @Test
    void createOrder_returnsCreated() throws Exception {
        String body = """
            { "userId": "user-1", "items": [
                { "productId": "prod-1", "quantity": 2, "price": 50000 }
            ]}
            """;

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.status").value("CONFIRMED"));

        assertThat(orderRepo.count()).isEqualTo(1);
    }

    @Test
    void createOrder_invalidInput_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors").isNotEmpty());
    }
}
```

## Testcontainers — Real DB trong Test

```java
// Dùng PostgreSQL container thật thay vì H2
@SpringBootTest
@Testcontainers
class OrderRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private OrderRepository orderRepo;

    @Test
    void shouldFindOrdersByStatus() {
        orderRepo.save(Order.builder().status(PENDING).build());
        orderRepo.save(Order.builder().status(CONFIRMED).build());
        orderRepo.save(Order.builder().status(CONFIRMED).build());

        List<Order> confirmed = orderRepo.findByStatus(CONFIRMED);
        assertThat(confirmed).hasSize(2);
    }
}
```

### Testcontainers cho Kafka, Redis

```java
@Container
static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

@Container
static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
    .withExposedPorts(6379);

@DynamicPropertySource
static void configure(DynamicPropertyRegistry registry) {
    registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    registry.add("spring.redis.host", redis::getHost);
    registry.add("spring.redis.port", () -> redis.getMappedPort(6379));
}
```

## WebTestClient (WebFlux)

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class ProductControllerTest {
    @Autowired private WebTestClient client;

    @Test
    void getProducts_returnsOk() {
        client.get().uri("/api/products")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(ProductResponse.class)
            .hasSize(10);
    }
}
```

## Slice Tests — Test Layer Riêng

```java
// Chỉ load Web layer (Controller + JSON + Validation)
@WebMvcTest(OrderController.class)
class OrderControllerSliceTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private OrderService orderService;  // Mock service
    // Test chỉ controller logic: validation, serialization, HTTP codes
}

// Chỉ load JPA layer
@DataJpaTest
class OrderJpaTest {
    @Autowired private TestEntityManager em;
    @Autowired private OrderRepository repo;
    // Test chỉ DB queries, không load controllers/services
}

// Chỉ load Redis
@DataRedisTest
class CacheTest { ... }
```

## Câu Hỏi Phỏng Vấn

### Tại sao dùng Testcontainers thay vì H2?
> H2 là DB khác PostgreSQL — behavior khác (JSON type, window functions, constraints). Testcontainers chạy real PostgreSQL → test đáng tin cậy hơn. Chậm hơn một chút nhưng đáng.

### @WebMvcTest vs @SpringBootTest?
> @WebMvcTest: chỉ load web layer, nhanh, mock services. @SpringBootTest: load full context, chậm, test end-to-end. Dùng @WebMvcTest cho controller logic, @SpringBootTest cho flow xuyên suốt.
