# Distributed Transactions - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Distributed Transactions Problem](#distributed-transactions-problem)
2. [Saga Pattern](#saga-pattern)
3. [Two-Phase Commit (2PC)](#two-phase-commit-2pc)
4. [Event Sourcing](#event-sourcing)
5. [CQRS](#cqrs)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Distributed Transactions Problem

### ACID trong Monolith

```java
// Monolith: Single database, ACID transactions
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    inventoryService.reduceStock(order.getProductId(), order.getQuantity());
    paymentService.processPayment(order.getAmount());
    // All or nothing - ACID guarantee
}
```

### Problem trong Microservices

```java
// Microservices: Multiple databases, no ACID
// Problem: How to ensure consistency?

Order Service → Order Database
Inventory Service → Inventory Database
Payment Service → Payment Database

// No single transaction across services
```

---

## Saga Pattern

### Choreography-based Saga

```java
// Choreography: Services coordinate via events
// No central coordinator

// Order Service
@Service
public class OrderService {
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;
    
    public void createOrder(Order order) {
        orderRepository.save(order);
        
        // Publish event
        OrderCreatedEvent event = new OrderCreatedEvent(order.getId(), order.getProductId(), order.getQuantity());
        kafkaTemplate.send("order-events", event);
    }
}

// Inventory Service
@Component
public class InventoryService {
    @KafkaListener(topics = "order-events")
    public void handleOrderCreated(OrderCreatedEvent event) {
        try {
            reduceStock(event.getProductId(), event.getQuantity());
            kafkaTemplate.send("inventory-events", new StockReducedEvent(event.getOrderId()));
        } catch (Exception e) {
            kafkaTemplate.send("inventory-events", new StockReductionFailedEvent(event.getOrderId()));
        }
    }
}

// Payment Service
@Component
public class PaymentService {
    @KafkaListener(topics = "order-events")
    public void handleOrderCreated(OrderCreatedEvent event) {
        try {
            processPayment(event.getOrderId(), event.getAmount());
            kafkaTemplate.send("payment-events", new PaymentProcessedEvent(event.getOrderId()));
        } catch (Exception e) {
            kafkaTemplate.send("payment-events", new PaymentFailedEvent(event.getOrderId()));
        }
    }
}

// Order Service - Compensation
@Component
public class OrderService {
    @KafkaListener(topics = "inventory-events")
    public void handleInventoryEvent(InventoryEvent event) {
        if (event instanceof StockReductionFailedEvent) {
            cancelOrder(event.getOrderId());  // Compensate
        }
    }
    
    @KafkaListener(topics = "payment-events")
    public void handlePaymentEvent(PaymentEvent event) {
        if (event instanceof PaymentFailedEvent) {
            cancelOrder(event.getOrderId());  // Compensate
            refundStock(event.getOrderId());  // Compensate inventory
        }
    }
}
```

### Orchestration-based Saga

```java
// Orchestration: Central coordinator
// Saga orchestrator coordinates steps

@Service
public class OrderSagaOrchestrator {
    @Autowired
    private OrderService orderService;
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private PaymentService paymentService;
    
    public void createOrder(Order order) {
        SagaTransaction saga = new SagaTransaction();
        
        try {
            // Step 1: Create order
            Order createdOrder = orderService.createOrder(order);
            saga.addStep(new SagaStep("create-order", createdOrder));
            
            // Step 2: Reduce stock
            inventoryService.reduceStock(order.getProductId(), order.getQuantity());
            saga.addStep(new SagaStep("reduce-stock", order));
            
            // Step 3: Process payment
            paymentService.processPayment(order.getAmount());
            saga.addStep(new SagaStep("process-payment", order));
            
            saga.commit();
        } catch (Exception e) {
            saga.compensate();  // Rollback all steps
            throw e;
        }
    }
    
    private void compensate(SagaTransaction saga) {
        // Execute compensating actions in reverse order
        for (SagaStep step : saga.getSteps().reversed()) {
            switch (step.getName()) {
                case "process-payment":
                    paymentService.refund(step.getData());
                    break;
                case "reduce-stock":
                    inventoryService.restoreStock(step.getData());
                    break;
                case "create-order":
                    orderService.cancelOrder(step.getData());
                    break;
            }
        }
    }
}
```

### Saga Pattern Comparison

| Aspect | Choreography | Orchestration |
|--------|--------------|---------------|
| **Complexity** | Lower | Higher |
| **Coupling** | Loose | Tighter |
| **Control** | Distributed | Centralized |
| **Use Case** | Simple flows | Complex flows |

---

## Two-Phase Commit (2PC)

### How it works

```java
// 2PC: Two-phase commit protocol
// Phase 1: Prepare (vote)
// Phase 2: Commit or Abort

// Coordinator
public class TwoPhaseCommitCoordinator {
    public void executeTransaction(Transaction transaction) {
        // Phase 1: Prepare
        List<Participant> participants = transaction.getParticipants();
        boolean allPrepared = true;
        
        for (Participant participant : participants) {
            if (!participant.prepare(transaction)) {
                allPrepared = false;
                break;
            }
        }
        
        // Phase 2: Commit or Abort
        if (allPrepared) {
            for (Participant participant : participants) {
                participant.commit(transaction);
            }
        } else {
            for (Participant participant : participants) {
                participant.abort(transaction);
            }
        }
    }
}
```

### 2PC Problems

```java
// Problems với 2PC:
// 1. Blocking: Participants block during prepare
// 2. Single point of failure: Coordinator failure
// 3. Performance: Two network round trips
// 4. Not suitable for microservices
```

---

## Event Sourcing

### Event Sourcing Concept

```java
// Event Sourcing: Store events as source of truth
// Replay events to rebuild state

// Event Store
public interface EventStore {
    void saveEvents(String aggregateId, List<DomainEvent> events);
    List<DomainEvent> getEvents(String aggregateId);
}

// Aggregate
public class Order {
    private Long id;
    private OrderStatus status;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    public void createOrder(OrderData data) {
        OrderCreatedEvent event = new OrderCreatedEvent(data);
        apply(event);
        uncommittedEvents.add(event);
    }
    
    public void apply(OrderCreatedEvent event) {
        this.id = event.getOrderId();
        this.status = OrderStatus.CREATED;
    }
    
    public void apply(OrderPaidEvent event) {
        this.status = OrderStatus.PAID;
    }
    
    public void apply(OrderCancelledEvent event) {
        this.status = OrderStatus.CANCELLED;
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

## CQRS

### CQRS Concept

**CQRS (Command Query Responsibility Segregation)** tách biệt read và write operations.

```java
// Command Side (Write)
@Service
public class OrderCommandService {
    public void createOrder(OrderCommand command) {
        Order order = new Order();
        order.create(command);
        orderRepository.save(order);
        
        // Publish event
        eventPublisher.publish(new OrderCreatedEvent(order));
    }
}

// Query Side (Read)
@Service
public class OrderQueryService {
    public OrderDTO getOrder(Long id) {
        // Read from read model (optimized for queries)
        return orderReadRepository.findById(id);
    }
    
    public List<OrderDTO> getOrders(OrderQuery query) {
        // Optimized queries
        return orderReadRepository.findByQuery(query);
    }
}

// Event Handler updates read model
@Component
public class OrderEventHandler {
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Update read model
        OrderReadModel readModel = new OrderReadModel(event.getOrder());
        orderReadRepository.save(readModel);
    }
}
```

---

## Câu hỏi thường gặp

### Q1: Saga vs 2PC?

```java
// Saga:
// - Non-blocking
// - Eventual consistency
// - Compensating actions
// - Suitable for microservices

// 2PC:
// - Blocking
// - Strong consistency
// - Not suitable for microservices
```

### Q2: Choreography vs Orchestration?

```java
// Choreography:
// - Decentralized
// - Services coordinate via events
// - Loose coupling
// - Use for: Simple flows

// Orchestration:
// - Centralized
// - Orchestrator coordinates
// - More control
// - Use for: Complex flows
```

---

## Best Practices

1. **Use Saga Pattern**: For distributed transactions
2. **Avoid 2PC**: Not suitable for microservices
3. **Event Sourcing**: For audit trail, replay
4. **CQRS**: Separate read/write models
5. **Compensating Actions**: Handle failures

---

## Tổng kết

- **Distributed Transactions**: Challenge trong microservices
- **Saga Pattern**: Choreography vs Orchestration
- **2PC**: Not recommended for microservices
- **Event Sourcing**: Events as source of truth
- **CQRS**: Separate read/write models
