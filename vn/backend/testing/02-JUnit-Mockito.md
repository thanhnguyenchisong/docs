# JUnit 5 & Mockito — Unit Testing

## JUnit 5 Annotations

```java
@Test                    // Test method
@DisplayName("...")      // Tên test dễ đọc
@BeforeEach / @AfterEach // Setup/teardown mỗi test
@BeforeAll / @AfterAll   // Setup/teardown 1 lần cho class
@Disabled("reason")      // Skip test
@Nested                  // Group tests
@Tag("integration")      // Tag để filter
@ParameterizedTest       // Test với nhiều inputs
```

## Viết Unit Test Chuẩn

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepo;
    @Mock private PaymentGateway paymentGateway;
    @Mock private EventPublisher eventPublisher;
    @InjectMocks private OrderService orderService;

    @Test
    @DisplayName("Should create order and charge payment")
    void createOrder_success() {
        // Given (Arrange)
        CreateOrderCommand cmd = CreateOrderCommand.builder()
            .userId("user-1")
            .items(List.of(new OrderItemDto("prod-1", 2, 50000)))
            .build();

        Order savedOrder = Order.builder().id(1L).status(CONFIRMED).build();
        when(orderRepo.save(any(Order.class))).thenReturn(savedOrder);
        when(paymentGateway.charge(anyString(), any())).thenReturn(PaymentResult.success());

        // When (Act)
        OrderResponse result = orderService.createOrder(cmd);

        // Then (Assert)
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");

        verify(orderRepo).save(any(Order.class));
        verify(paymentGateway).charge(eq("user-1"), any(Money.class));
        verify(eventPublisher).publish(any(OrderCreatedEvent.class));
    }

    @Test
    @DisplayName("Should throw when payment fails")
    void createOrder_paymentFails() {
        when(paymentGateway.charge(anyString(), any()))
            .thenReturn(PaymentResult.failed("Insufficient funds"));

        assertThrows(PaymentException.class, () ->
            orderService.createOrder(validCommand()));

        verify(orderRepo, never()).save(any()); // Order không được save
    }
}
```

## Parameterized Tests

```java
@ParameterizedTest
@CsvSource({
    "100000, REGULAR, 100000",   // No discount
    "100000, VIP,     80000",    // 20% off
    "100000, EMPLOYEE, 50000"    // 50% off
})
void calculateDiscount(long price, String tier, long expected) {
    Money result = pricingService.calculate(Money.of(price), UserTier.valueOf(tier));
    assertThat(result).isEqualTo(Money.of(expected));
}

@ParameterizedTest
@MethodSource("invalidEmails")
void shouldRejectInvalidEmail(String email) {
    assertThrows(ValidationException.class, () -> userService.validateEmail(email));
}

static Stream<String> invalidEmails() {
    return Stream.of("", "invalid", "@no-local", "no-at.com", null);
}
```

## Mockito Cheat Sheet

```java
// Stubbing
when(repo.findById(1L)).thenReturn(Optional.of(user));
when(service.process(any())).thenThrow(new RuntimeException("fail"));
doNothing().when(emailService).send(any());

// Verification
verify(repo).save(any());              // Gọi 1 lần
verify(repo, times(2)).save(any());    // Gọi 2 lần
verify(repo, never()).delete(any());   // Không gọi
verify(repo, atLeastOnce()).findAll(); // Ít nhất 1 lần

// Argument Capture
ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
verify(repo).save(captor.capture());
Order saved = captor.getValue();
assertThat(saved.getStatus()).isEqualTo(CONFIRMED);

// Answer (dynamic response)
when(repo.save(any())).thenAnswer(invocation -> {
    Order order = invocation.getArgument(0);
    order.setId(1L);
    return order;
});
```

## AssertJ — Fluent Assertions

```java
// Collections
assertThat(users).hasSize(3)
    .extracting(User::getName)
    .containsExactly("Alice", "Bob", "Charlie");

// Exceptions
assertThatThrownBy(() -> service.getUser(999L))
    .isInstanceOf(UserNotFoundException.class)
    .hasMessageContaining("999");

// Objects
assertThat(order)
    .satisfies(o -> {
        assertThat(o.getStatus()).isEqualTo(CONFIRMED);
        assertThat(o.getTotal()).isGreaterThan(Money.ZERO);
    });
```
