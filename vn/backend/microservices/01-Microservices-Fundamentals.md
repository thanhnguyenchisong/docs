# Microservices Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Microservices là gì?](#microservices-là-gì)
2. [Microservices vs Monolith](#microservices-vs-monolith)
3. [Microservices Architecture](#microservices-architecture)
4. [Benefits và Challenges](#benefits-và-challenges)
5. [When to use Microservices](#when-to-use-microservices)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Microservices là gì?

### Định nghĩa

**Microservices** là architectural style để build applications như một suite của small, independent services, mỗi service chạy trong process riêng và communicate qua lightweight mechanisms (thường là HTTP REST APIs).

### Key Characteristics

1. **Small và Focused**: Mỗi service có single responsibility
2. **Independent**: Services có thể develop, deploy, scale independently
3. **Decentralized**: No shared database, decentralized data management
4. **Technology Diversity**: Mỗi service có thể dùng technology stack khác nhau
5. **Fault Isolation**: Failure của một service không ảnh hưởng toàn bộ system

---

## Microservices vs Monolith

### Monolithic Architecture

```java
// Monolith: Single deployable unit
┌─────────────────────────────────┐
│      Monolithic Application      │
│  ┌─────────┐  ┌─────────┐       │
│  │  User   │  │  Order  │       │
│  │ Service │  │ Service │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │ Payment │  │ Product │       │
│  │ Service │  │ Service │       │
│  └─────────┘  └─────────┘       │
│         Shared Database         │
└─────────────────────────────────┘
```

**Characteristics:**
- Single codebase
- Single deployment unit
- Shared database
- Tightly coupled
- Single technology stack

### Microservices Architecture

```java
// Microservices: Multiple independent services
┌──────────┐  ┌──────────┐  ┌──────────┐
│  User    │  │  Order   │  │ Payment │
│ Service  │  │ Service  │  │ Service │
│          │  │          │  │         │
│  DB 1    │  │  DB 2    │  │  DB 3   │
└──────────┘  └──────────┘  └──────────┘
     │             │             │
     └─────────────┴─────────────┘
            API Gateway
```

**Characteristics:**
- Multiple codebases
- Independent deployments
- Database per service
- Loosely coupled
- Technology diversity

### So sánh

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Deployment** | Single unit | Independent |
| **Scaling** | Scale entire app | Scale individual services |
| **Technology** | Single stack | Multiple stacks |
| **Database** | Shared | Database per service |
| **Complexity** | Lower initially | Higher |
| **Development** | Easier initially | More complex |
| **Testing** | Simpler | More complex |
| **Fault Isolation** | Poor | Good |

---

## Microservices Architecture

### High-Level Architecture

```
┌─────────────┐
│   Clients   │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│     API Gateway         │
└──────┬──────────────────┘
       │
   ┌───┴───┬────────┬────────┐
   │       │        │        │
┌──▼──┐ ┌─▼──┐  ┌──▼──┐  ┌──▼──┐
│User │ │Order│ │Pay  │ │Prod │
│Svc  │ │Svc  │ │Svc  │ │Svc  │
└──┬──┘ └─┬──┘  └──┬──┘  └──┬──┘
   │      │        │        │
┌──▼──┐ ┌─▼──┐  ┌──▼──┐  ┌──▼──┐
│ DB1 │ │DB2 │  │DB3 │  │DB4 │
└─────┘ └────┘  └────┘  └────┘
```

### Components

**1. API Gateway:**
- Single entry point
- Routing requests
- Authentication/Authorization
- Rate limiting

**2. Services:**
- Independent services
- Own database
- Own deployment

**3. Service Discovery:**
- Services register themselves
- Clients discover services

**4. Message Broker:**
- Asynchronous communication
- Event-driven architecture

---

## Benefits và Challenges

### Benefits

**1. Independent Deployment:**
```java
// Deploy services independently
// Update User Service without affecting Order Service
```

**2. Technology Diversity:**
```java
// User Service: Java/Spring Boot
// Order Service: Node.js
// Payment Service: Python/Django
```

**3. Scalability:**
```java
// Scale only services that need scaling
// Order Service: 10 instances
// User Service: 2 instances
```

**4. Fault Isolation:**
```java
// If Order Service fails, other services continue working
```

**5. Team Autonomy:**
```java
// Teams can work independently
// Faster development
```

### Challenges

**1. Complexity:**
```java
// More services = more complexity
// Network latency
// Distributed transactions
```

**2. Data Consistency:**
```java
// No shared database
// Eventual consistency
// Distributed transactions
```

**3. Testing:**
```java
// Integration testing more complex
// Need to test service interactions
```

**4. Deployment:**
```java
// More deployment units
// Need orchestration (Kubernetes)
```

**5. Monitoring:**
```java
// Need distributed tracing
// Log aggregation
// Service health monitoring
```

---

## When to use Microservices

### Use Microservices khi:

1. **Large Team**: Multiple teams working on different features
2. **Complex Domain**: Complex business domain với multiple bounded contexts
3. **Scalability Requirements**: Different services need different scaling
4. **Technology Diversity**: Need different technologies
5. **Independent Deployment**: Need to deploy independently

### Don't use Microservices khi:

1. **Small Team**: Small team, simple application
2. **Simple Domain**: Simple business logic
3. **Tight Coupling**: Services need to be tightly coupled
4. **No DevOps**: No infrastructure for microservices
5. **Just Starting**: Start with monolith, extract later

### Migration Strategy

```java
// Strategy: Strangler Fig Pattern
// 1. Start with monolith
// 2. Extract services gradually
// 3. Replace monolith piece by piece

Monolith → Extract Service 1 → Extract Service 2 → ... → Full Microservices
```

---

## Câu hỏi thường gặp

### Q1: Microservices vs SOA?

```java
// SOA (Service-Oriented Architecture):
// - Enterprise services
// - ESB (Enterprise Service Bus)
// - Shared database
// - Heavy protocols (SOAP)

// Microservices:
// - Small services
// - API Gateway
// - Database per service
// - Lightweight protocols (REST)
```

### Q2: Làm sao chia services?

```java
// Strategies:

// 1. Domain-Driven Design (DDD)
// - Bounded contexts
// - Aggregate roots
// - One service per bounded context

// 2. Business Capabilities
// - User Management Service
// - Order Management Service
// - Payment Service

// 3. Data Ownership
// - Services own their data
// - No shared database
```

### Q3: Database per Service?

```java
// ✅ Good: Each service has own database
User Service → User Database
Order Service → Order Database

// ❌ Bad: Shared database
User Service ──┐
Order Service ─┼──→ Shared Database
Payment Service ┘

// Benefits:
// - Loose coupling
// - Independent scaling
// - Technology diversity
```

### Q4: Làm sao handle transactions across services?

```java
// Solutions:

// 1. Saga Pattern
// - Distributed transaction
// - Compensating actions

// 2. Event Sourcing
// - Events as source of truth
// - Replay events

// 3. Two-Phase Commit (2PC)
// - Not recommended (blocking)
```

### Q5: Service size - bao nhiêu là đủ?

```java
// Rule of thumb:
// - Small enough: Can be developed by small team (2-3 developers)
// - Large enough: Has meaningful business capability
// - Typical: 100-1000 lines of code per service

// Not too small:
// - Too many services = complexity
// - Network overhead

// Not too large:
// - Defeats purpose of microservices
// - Hard to maintain
```

---

## Best Practices

1. **Start with Monolith**: Extract services when needed
2. **Database per Service**: No shared database
3. **API First**: Design APIs before implementation
4. **Fail Fast**: Handle failures gracefully
5. **Monitor Everything**: Distributed tracing, logging
6. **Automate Everything**: CI/CD, deployment
7. **Security First**: Authentication, authorization
8. **Document APIs**: API documentation

---

## Bài tập thực hành

### Bài 1: Design Microservices

```java
// Yêu cầu: Design microservices cho e-commerce system
// Services: User, Product, Order, Payment, Inventory
// Define: APIs, databases, communication patterns
```

### Bài 2: Migration Strategy

```java
// Yêu cầu: Plan migration từ monolith to microservices
// Identify: Services to extract
// Strategy: Strangler Fig Pattern
```

---

## Tổng kết

- **Microservices**: Small, independent services
- **vs Monolith**: Independent deployment, scalability, complexity
- **Architecture**: API Gateway, Services, Service Discovery
- **Benefits**: Independent deployment, scalability, fault isolation
- **Challenges**: Complexity, data consistency, testing
- **When to use**: Large teams, complex domain, scalability needs
- **Best Practices**: Database per service, API first, monitor everything
