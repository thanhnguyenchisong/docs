# Clean Architecture & Hexagonal Architecture

## Mục lục
1. [Tại sao cần Clean Architecture?](#tại-sao-cần-clean-architecture)
2. [Clean Architecture layers](#clean-architecture-layers)
3. [Hexagonal Architecture](#hexagonal-architecture)
4. [Project Structure thực tế](#project-structure-thực-tế)
5. [Code ví dụ Spring Boot](#code-ví-dụ-spring-boot)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại Sao Cần Clean Architecture?

```
Layered Architecture truyền thống:
  Controller → Service → Repository → Database
  
Vấn đề: Service phụ thuộc Repository (JPA) → business logic BỊ TRÓI vào framework.
  - Đổi DB → sửa service
  - Test service → cần mock JPA → phức tạp
  - Business logic trộn lẫn infrastructure code
```

Clean Architecture: **Business logic KHÔNG phụ thuộc framework, DB, UI**.

---

## Clean Architecture Layers

```
┌────────────────────────────────────────────┐
│            Frameworks & Drivers            │  ← Spring, JPA, REST, Kafka
│  ┌──────────────────────────────────────┐  │
│  │       Interface Adapters             │  │  ← Controllers, Repositories impl
│  │  ┌────────────────────────────────┐  │  │
│  │  │       Use Cases                │  │  │  ← Application services
│  │  │  ┌──────────────────────────┐  │  │  │
│  │  │  │     Entities             │  │  │  │  ← Domain models, business rules
│  │  │  └──────────────────────────┘  │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘

Dependency Rule: dependencies chỉ hướng VÀO TRONG
  Frameworks → Adapters → Use Cases → Entities
  (ngoài → trong, KHÔNG ngược lại)
```

| Layer | Chứa gì | Phụ thuộc |
|-------|---------|-----------|
| **Entities** | Domain models, business rules | KHÔNG phụ thuộc gì |
| **Use Cases** | Application logic, orchestration | Chỉ phụ thuộc Entities |
| **Adapters** | Controllers, Repository impl, Mappers | Phụ thuộc Use Cases |
| **Frameworks** | Spring, JPA, REST, Kafka | Phụ thuộc Adapters |

---

## Hexagonal Architecture (Ports & Adapters)

```
                 ┌────────────────────────┐
     HTTP ──────►│   Port: OrderAPI       │
     gRPC ──────►│   (Input/Driving)      │
     Kafka ─────►│                        │
                 │   ┌──────────────┐     │
                 │   │   Domain     │     │
                 │   │  (Business   │     │
                 │   │   Logic)     │     │
                 │   └──────────────┘     │
                 │                        │
                 │   Port: OrderRepo      │──────► PostgreSQL
                 │   Port: PaymentGW      │──────► Stripe API
                 │   Port: Notification   │──────► SendGrid
                 │   (Output/Driven)      │──────► Kafka
                 └────────────────────────┘
```

- **Port** = Interface (input hoặc output)
- **Adapter** = Implementation cụ thể (Spring Controller, JPA Repository, Kafka Producer)
- **Domain** = Business logic — KHÔNG biết adapter nào sẽ implement ports

---

## Project Structure Thực Tế

```
src/main/java/com/example/order/
├── domain/                          ← CORE: entities + business rules
│   ├── model/
│   │   ├── Order.java              ← Domain entity (POJO, no Spring annotations)
│   │   ├── OrderItem.java
│   │   ├── OrderStatus.java        ← Enum
│   │   └── Money.java              ← Value Object
│   ├── exception/
│   │   └── InsufficientStockException.java
│   └── service/
│       └── OrderDomainService.java  ← Domain logic (validation, calculation)
│
├── application/                     ← USE CASES: orchestration
│   ├── port/
│   │   ├── in/                     ← Input ports (use cases)
│   │   │   ├── CreateOrderUseCase.java
│   │   │   └── GetOrderUseCase.java
│   │   └── out/                    ← Output ports (driven)
│   │       ├── OrderRepository.java     ← Interface (NOT Spring)
│   │       ├── PaymentGateway.java
│   │       └── EventPublisher.java
│   ├── service/
│   │   └── OrderApplicationService.java ← Implements use cases
│   └── dto/
│       ├── CreateOrderCommand.java
│       └── OrderResponse.java
│
├── adapter/                         ← ADAPTERS: infrastructure
│   ├── in/                         ← Input adapters (driving)
│   │   ├── rest/
│   │   │   ├── OrderController.java     ← Spring @RestController
│   │   │   └── OrderRequestDto.java
│   │   └── kafka/
│   │       └── OrderEventListener.java
│   └── out/                        ← Output adapters (driven)
│       ├── persistence/
│       │   ├── JpaOrderRepository.java  ← Implements OrderRepository
│       │   ├── OrderJpaEntity.java      ← JPA Entity
│       │   └── OrderMapper.java
│       ├── payment/
│       │   └── StripePaymentAdapter.java
│       └── messaging/
│           └── KafkaEventPublisher.java
│
└── config/                          ← Spring configuration
    └── BeanConfig.java
```

---

## Code Ví Dụ Spring Boot

### Domain Layer (KHÔNG có Spring annotations)

```java
// domain/model/Order.java — POJO thuần
public class Order {
    private Long id;
    private String userId;
    private List<OrderItem> items;
    private OrderStatus status;
    private Money totalAmount;

    // Business logic TRONG domain
    public void addItem(OrderItem item) {
        items.add(item);
        recalculateTotal();
    }

    public void confirm() {
        if (items.isEmpty()) throw new IllegalStateException("Cannot confirm empty order");
        this.status = OrderStatus.CONFIRMED;
    }

    private void recalculateTotal() {
        this.totalAmount = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}
```

### Application Layer (Use Cases)

```java
// application/port/in/CreateOrderUseCase.java
public interface CreateOrderUseCase {
    OrderResponse execute(CreateOrderCommand command);
}

// application/port/out/OrderRepository.java — OUTPUT PORT (interface)
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
}

// application/service/OrderApplicationService.java
public class OrderApplicationService implements CreateOrderUseCase {
    private final OrderRepository orderRepo;       // Port (interface)
    private final PaymentGateway paymentGateway;   // Port (interface)
    private final EventPublisher eventPublisher;    // Port (interface)

    @Override
    public OrderResponse execute(CreateOrderCommand cmd) {
        Order order = new Order(cmd.getUserId());
        cmd.getItems().forEach(item -> order.addItem(toDomainItem(item)));
        order.confirm();

        paymentGateway.charge(order.getUserId(), order.getTotalAmount());
        Order saved = orderRepo.save(order);
        eventPublisher.publish(new OrderCreatedEvent(saved));

        return OrderMapper.toResponse(saved);
    }
}
```

### Adapter Layer (Infrastructure)

```java
// adapter/in/rest/OrderController.java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final CreateOrderUseCase createOrder;  // Inject USE CASE, not service impl

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequestDto dto) {
        CreateOrderCommand cmd = OrderRequestMapper.toCommand(dto);
        OrderResponse response = createOrder.execute(cmd);
        return ResponseEntity.status(201).body(response);
    }
}

// adapter/out/persistence/JpaOrderRepository.java
@Repository
public class JpaOrderRepository implements OrderRepository {  // Implements PORT
    private final SpringDataOrderRepo jpaRepo;

    @Override
    public Order save(Order domain) {
        OrderJpaEntity entity = OrderPersistenceMapper.toEntity(domain);
        OrderJpaEntity saved = jpaRepo.save(entity);
        return OrderPersistenceMapper.toDomain(saved);
    }
}
```

---

## Câu Hỏi Phỏng Vấn

### Clean Architecture vs Layered Architecture?
> Layered: Controller → Service → Repository (dependencies hướng xuống). Clean: dependencies hướng VÀO (domain ở trung tâm, không phụ thuộc framework). Domain thuần Java POJO, dễ test, đổi DB/framework không ảnh hưởng business logic.

### Khi nào nên áp dụng?
> Project lớn, domain phức tạp, team lớn, thay đổi infrastructure thường xuyên. Startup MVP nhỏ → layered đủ. Khi domain logic > CRUD → cân nhắc clean/hexagonal.

### Hexagonal vs Clean?
> Gần giống nhau. Hexagonal nhấn mạnh **ports & adapters** (input/output ports). Clean nhấn mạnh **concentric rings** (dependency rule). Thực tế dùng lẫn lộn, cùng mục đích: isolate domain.

---

**Tiếp theo:** [06-DDD.md](./06-DDD.md)
