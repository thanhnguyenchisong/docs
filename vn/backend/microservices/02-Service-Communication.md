# Service Communication - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Synchronous Communication](#synchronous-communication)
2. [Asynchronous Communication](#asynchronous-communication)
3. [REST APIs](#rest-apis)
4. [gRPC](#grpc)
5. [Message Queues](#message-queues)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Synchronous Communication

### REST (Representational State Transfer)

```java
// REST: HTTP-based communication
// Request-Response pattern

// User Service calls Order Service
@RestController
public class OrderController {
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        // Call User Service synchronously
        User user = userServiceClient.getUser(request.getUserId());
        
        Order order = orderService.createOrder(request, user);
        return ResponseEntity.ok(order);
    }
}

// User Service Client
@Service
public class UserServiceClient {
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        String url = "http://user-service/api/users/" + userId;
        return restTemplate.getForObject(url, User.class);
    }
}
```

### gRPC

```java
// gRPC: High-performance RPC framework
// Protocol Buffers for serialization

// Service definition (proto file)
service UserService {
    rpc GetUser(UserRequest) returns (UserResponse);
    rpc CreateUser(CreateUserRequest) returns (UserResponse);
}

// Server implementation
public class UserServiceImpl extends UserServiceGrpc.UserServiceImplBase {
    @Override
    public void getUser(UserRequest request, StreamObserver<UserResponse> responseObserver) {
        User user = userRepository.findById(request.getUserId());
        UserResponse response = UserResponse.newBuilder()
            .setId(user.getId())
            .setName(user.getName())
            .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}

// Client
ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 50051)
    .usePlaintext()
    .build();
UserServiceGrpc.UserServiceBlockingStub stub = UserServiceGrpc.newBlockingStub(channel);
UserResponse response = stub.getUser(UserRequest.newBuilder().setUserId(123).build());
```

### Synchronous Communication Trade-offs

**Pros:**
- Simple và familiar
- Easy to debug
- Request-response pattern

**Cons:**
- Tight coupling
- Blocking calls
- Cascading failures
- Network latency

---

## Asynchronous Communication

### Message Queues

```java
// Asynchronous: Message-based communication
// Producer → Queue → Consumer

// Producer (Order Service)
@Service
public class OrderService {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void createOrder(Order order) {
        orderRepository.save(order);
        
        // Send message asynchronously
        OrderCreatedEvent event = new OrderCreatedEvent(order.getId(), order.getUserId());
        rabbitTemplate.convertAndSend("order.exchange", "order.created", event);
    }
}

// Consumer (Notification Service)
@Component
public class OrderEventListener {
    @RabbitListener(queues = "order.created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Process asynchronously
        notificationService.sendOrderConfirmation(event.getUserId(), event.getOrderId());
    }
}
```

### Event-Driven Architecture

```java
// Event-driven: Services communicate via events
// Publisher → Event Bus → Subscribers

// Event Publisher
@Service
public class OrderService {
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void createOrder(Order order) {
        orderRepository.save(order);
        
        // Publish event
        OrderCreatedEvent event = new OrderCreatedEvent(order.getId(), order.getUserId());
        kafkaTemplate.send("order-events", event);
    }
}

// Event Subscriber
@Component
public class PaymentService {
    @KafkaListener(topics = "order-events")
    public void handleOrderEvent(OrderEvent event) {
        if (event instanceof OrderCreatedEvent) {
            processPayment(event.getOrderId());
        }
    }
}
```

---

## REST APIs

### REST Principles

```java
// RESTful API Design

// Resources
GET    /api/users           // List users
GET    /api/users/{id}      // Get user
POST   /api/users           // Create user
PUT    /api/users/{id}      // Update user
DELETE /api/users/{id}      // Delete user

// Nested resources
GET    /api/users/{id}/orders        // Get user orders
POST   /api/users/{id}/orders        // Create order for user
```

### REST Best Practices

```java
// 1. Use proper HTTP methods
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { }

@PostMapping("/users")
public User createUser(@RequestBody User user) { }

@PutMapping("/users/{id}")
public User updateUser(@PathVariable Long id, @RequestBody User user) { }

@DeleteMapping("/users/{id}")
public void deleteUser(@PathVariable Long id) { }

// 2. Use proper status codes
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody User user) {
    User created = userService.createUser(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}

// 3. Version APIs
@GetMapping("/v1/users")
public List<User> getUsersV1() { }

@GetMapping("/v2/users")
public List<UserDTO> getUsersV2() { }
```

---

## gRPC

### gRPC vs REST

| Feature | REST | gRPC |
|---------|------|------|
| **Protocol** | HTTP/1.1 | HTTP/2 |
| **Payload** | JSON | Protocol Buffers |
| **Performance** | Slower | Faster |
| **Browser Support** | Yes | Limited |
| **Streaming** | Limited | Full support |

### gRPC Use Cases

```java
// Use gRPC for:
// - High-performance requirements
// - Service-to-service communication
// - Streaming (client, server, bidirectional)
// - Strong typing

// Use REST for:
// - Public APIs
// - Browser clients
// - Simplicity
```

---

## Message Queues

### RabbitMQ

```java
// RabbitMQ: Message broker
// Direct, Topic, Fanout exchanges

// Configuration
@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue orderQueue() {
        return new Queue("order.queue", true);
    }
    
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange("order.exchange");
    }
    
    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue())
            .to(orderExchange())
            .with("order.*");
    }
}

// Producer
@Service
public class OrderService {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void publishOrderEvent(OrderEvent event) {
        rabbitTemplate.convertAndSend("order.exchange", "order.created", event);
    }
}

// Consumer
@Component
public class OrderEventListener {
    @RabbitListener(queues = "order.queue")
    public void handleOrderEvent(OrderEvent event) {
        // Process event
    }
}
```

### Kafka

```java
// Kafka: Distributed streaming platform
// Topics, partitions, consumer groups

// Producer
@Service
public class OrderService {
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void publishOrderEvent(OrderEvent event) {
        kafkaTemplate.send("order-events", event);
    }
}

// Consumer
@Component
public class OrderEventListener {
    @KafkaListener(topics = "order-events", groupId = "order-processors")
    public void handleOrderEvent(OrderEvent event) {
        // Process event
    }
}
```

---

## Event-Driven Architecture

### Event Types

```java
// 1. Domain Events
// Business events that happened
public class OrderCreatedEvent {
    private Long orderId;
    private Long userId;
    private LocalDateTime createdAt;
}

// 2. Integration Events
// Events for service integration
public class PaymentProcessedEvent {
    private Long orderId;
    private String paymentId;
    private PaymentStatus status;
}
```

### Event Sourcing

```java
// Event Sourcing: Store events as source of truth
// Replay events to rebuild state

// Event Store
public interface EventStore {
    void save(String aggregateId, List<DomainEvent> events);
    List<DomainEvent> getEvents(String aggregateId);
}

// Aggregate
public class Order {
    private Long id;
    private OrderStatus status;
    
    public void apply(OrderCreatedEvent event) {
        this.id = event.getOrderId();
        this.status = OrderStatus.CREATED;
    }
    
    public void apply(OrderPaidEvent event) {
        this.status = OrderStatus.PAID;
    }
}

// Rebuild state
public Order rebuildOrder(String orderId) {
    List<DomainEvent> events = eventStore.getEvents(orderId);
    Order order = new Order();
    events.forEach(order::apply);
    return order;
}
```

---

## Câu hỏi thường gặp

### Q1: Khi nào dùng Synchronous vs Asynchronous?

```java
// Use Synchronous (REST/gRPC) khi:
// - Need immediate response
// - Request-response pattern
// - Simple communication
// - Example: Get user details

// Use Asynchronous (Message Queue) khi:
// - Don't need immediate response
// - Event-driven
// - Decouple services
// - Example: Send notification, process payment
```

### Q2: REST vs gRPC?

```java
// REST:
// - Simple, familiar
// - JSON, human-readable
// - Browser support
// - Use for: Public APIs, web clients

// gRPC:
// - High performance
// - Protocol Buffers, binary
// - HTTP/2, streaming
// - Use for: Service-to-service, high throughput
```

### Q3: Message Queue vs Event Bus?

```java
// Message Queue (RabbitMQ):
// - Point-to-point
// - Message consumed by one consumer
// - Use for: Task distribution

// Event Bus (Kafka):
// - Publish-subscribe
// - Event consumed by multiple consumers
// - Use for: Event-driven architecture
```

### Q4: Làm sao handle failures trong async communication?

```java
// Strategies:

// 1. Retry với exponential backoff
@Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
public void processMessage(Message message) {
    // Process
}

// 2. Dead Letter Queue
// Failed messages → DLQ → Manual processing

// 3. Idempotent processing
public void processMessage(Message message) {
    if (alreadyProcessed(message.getId())) {
        return;  // Skip duplicate
    }
    process(message);
    markAsProcessed(message.getId());
}
```

---

## Best Practices

1. **Use REST for public APIs**: Simple, familiar
2. **Use gRPC for service-to-service**: High performance
3. **Use async for decoupling**: Message queues, events
4. **Handle failures gracefully**: Retry, DLQ, idempotency
5. **Version APIs**: Backward compatibility
6. **Monitor communication**: Latency, errors
7. **Use circuit breaker**: Prevent cascading failures

---

## Bài tập thực hành

### Bài 1: Service Communication

```java
// Yêu cầu: Implement communication giữa services
// 1. REST API cho synchronous
// 2. Message queue cho asynchronous
// 3. Handle failures
```

---

## Tổng kết

- **Synchronous**: REST, gRPC - Request-response
- **Asynchronous**: Message Queues, Events - Decoupled
- **REST**: Simple, JSON, browser support
- **gRPC**: High performance, Protocol Buffers
- **Message Queues**: RabbitMQ, Kafka
- **Event-Driven**: Events, Event Sourcing
- **Best Practices**: Choose right pattern, handle failures
