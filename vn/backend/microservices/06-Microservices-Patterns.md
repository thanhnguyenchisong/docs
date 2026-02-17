# Microservices Patterns - Câu hỏi phỏng vấn

## Mục lục
1. [Database per Service](#database-per-service)
2. [Circuit Breaker](#circuit-breaker)
3. [Bulkhead Pattern](#bulkhead-pattern)
4. [Strangler Fig Pattern](#strangler-fig-pattern)
5. [API Gateway Pattern](#api-gateway-pattern)
6. [Backend for Frontend (BFF)](#backend-for-frontend-bff)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Database per Service

### Pattern

```java
// Each service has its own database
// No shared database

User Service → User Database
Order Service → Order Database
Payment Service → Payment Database

// Benefits:
// - Loose coupling
// - Independent scaling
// - Technology diversity
```

### Implementation

```java
// User Service
@Entity
public class User {
    @Id
    private Long id;
    private String username;
    // User Service owns user data
}

// Order Service
@Entity
public class Order {
    @Id
    private Long id;
    private Long userId;  // Reference, not foreign key
    // Order Service owns order data
    // No direct database join with User
}
```

---

## Circuit Breaker

### Pattern

```java
// Circuit Breaker: Prevent cascading failures
// States: Closed, Open, Half-Open

Closed → Failures exceed threshold → Open → Timeout → Half-Open → Success → Closed
```

### Implementation với Resilience4j

```java
// Circuit Breaker configuration
@Configuration
public class CircuitBreakerConfig {
    @Bean
    public CircuitBreaker userServiceCircuitBreaker() {
        return CircuitBreaker.of("user-service", CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .slidingWindowSize(10)
            .build());
    }
}

// Usage
@Service
public class OrderService {
    @Autowired
    private CircuitBreaker circuitBreaker;
    @Autowired
    private UserServiceClient userServiceClient;
    
    public User getUser(Long userId) {
        return circuitBreaker.executeSupplier(() -> {
            return userServiceClient.getUser(userId);
        });
    }
}
```

### Circuit Breaker States

```java
// Closed: Normal operation
// - Requests pass through
// - Track failures

// Open: Service failing
// - Requests fail fast
// - No calls to failing service
// - After timeout → Half-Open

// Half-Open: Testing recovery
// - Allow limited requests
// - If success → Closed
// - If failure → Open
```

---

## Bulkhead Pattern

### Pattern

```java
// Bulkhead: Isolate resources
// Prevent failure of one service from affecting others

// Thread pool isolation
ExecutorService userServicePool = Executors.newFixedThreadPool(10);
ExecutorService orderServicePool = Executors.newFixedThreadPool(10);

// Connection pool isolation
HikariConfig userServiceConfig = new HikariConfig();
userServiceConfig.setMaximumPoolSize(10);

HikariConfig orderServiceConfig = new HikariConfig();
orderServiceConfig.setMaximumPoolSize(10);
```

---

## Strangler Fig Pattern

### Migration Strategy

```java
// Strangler Fig: Gradually replace monolith
// 1. Start with monolith
// 2. Extract services gradually
// 3. Route traffic to new services
// 4. Eventually replace monolith

Monolith → Extract Service 1 → Extract Service 2 → ... → Full Microservices
```

### Implementation

```java
// API Gateway routes traffic
// New requests → New services
// Old requests → Monolith (until migrated)

spring:
  cloud:
    gateway:
      routes:
        - id: user-service-new
          uri: lb://user-service
          predicates:
            - Path=/api/v2/users/**
        - id: user-service-old
          uri: http://monolith:8080
          predicates:
            - Path=/api/v1/users/**
```

---

## API Gateway Pattern

```java
// API Gateway: Single entry point
// - Routing
// - Authentication
// - Rate limiting
// - Load balancing
```

---

## Backend for Frontend (BFF)

### Pattern

```java
// BFF: Different backend for different frontends
// Mobile BFF vs Web BFF

Mobile App → Mobile BFF → Microservices
Web App → Web BFF → Microservices

// Benefits:
// - Optimized for each client
// - Different data formats
// - Different authentication
```

---

## Câu hỏi thường gặp

### Q1: Khi nào dùng Circuit Breaker?

```java
// Use Circuit Breaker khi:
// - Calling external services
// - Services can fail
// - Need to prevent cascading failures
// - Want fail-fast behavior
```

---

## Best Practices

1. **Database per Service**: No shared database
2. **Circuit Breaker**: Prevent cascading failures
3. **Bulkhead**: Isolate resources
4. **Strangler Fig**: Gradual migration
5. **API Gateway**: Single entry point

---

## Tổng kết

- **Database per Service**: Each service owns its data
- **Circuit Breaker**: Prevent cascading failures
- **Bulkhead**: Resource isolation
- **Strangler Fig**: Migration strategy
- **BFF**: Client-specific backends
