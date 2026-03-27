# DDD — Domain-Driven Design

## Mục lục
1. [Tổng quan DDD](#tổng-quan-ddd)
2. [Strategic Design](#strategic-design)
3. [Tactical Design](#tactical-design)
4. [Ví dụ E-commerce](#ví-dụ-e-commerce)
5. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tổng Quan DDD

> DDD = thiết kế phần mềm **xoay quanh domain** (nghiệp vụ), không xoay quanh database hay framework.

| Khái niệm | Mô tả |
|-----------|--------|
| **Domain** | Lĩnh vực nghiệp vụ (e-commerce, banking, logistics) |
| **Ubiquitous Language** | Ngôn ngữ chung giữa dev và business — code phản ánh ngôn ngữ này |
| **Bounded Context** | Ranh giới rõ ràng nơi một model có ý nghĩa cụ thể |
| **Context Map** | Mối quan hệ giữa các Bounded Contexts |

---

## Strategic Design

### Bounded Context

```
E-commerce Domain:
┌────────────────┐  ┌───────────────┐  ┌────────────────┐
│  Order Context │  │ Payment Ctx   │  │ Shipping Ctx   │
│                │  │               │  │                │
│ Order          │  │ Payment       │  │ Shipment       │
│ OrderItem      │  │ Transaction   │  │ TrackingInfo   │
│ OrderStatus    │  │ Refund        │  │ Carrier        │
│                │  │               │  │                │
│ "Order" ở đây  │  │ "Order" ở đây│  │ "Order" ở đây  │
│ = full entity  │  │ = chỉ là ID  │  │ = address+items│
└────────────────┘  └───────────────┘  └────────────────┘

Cùng từ "Order" — KHÁC nghĩa ở mỗi context!
→ Mỗi context có MODEL RIÊNG cho "Order"
```

### Context Map — Quan hệ giữa contexts

```
┌──────────┐  Upstream     ┌───────────┐
│  Order   │──────────────→│  Payment  │  Conformist: Payment tuân theo Order model
│  Context │               │  Context  │
└──────────┘               └───────────┘
      │
      │ Published Language (events)
      ↓
┌──────────┐   Anti-Corruption Layer
│ Shipping │◄─────────────── External Carrier API
│ Context  │   (ACL dịch model bên ngoài)
└──────────┘
```

---

## Tactical Design

### Entity

> Có **identity** (ID). Hai entities cùng thuộc tính nhưng khác ID = khác nhau.

```java
public class Order {
    private final OrderId id;          // Identity
    private CustomerId customerId;
    private List<OrderItem> items;
    private OrderStatus status;
    private Money total;

    // Business methods — logic TRONG entity
    public void addItem(Product product, int quantity) {
        if (status != OrderStatus.DRAFT)
            throw new IllegalStateException("Cannot modify confirmed order");
        items.add(new OrderItem(product.getId(), product.getPrice(), quantity));
        recalculate();
    }

    public void confirm() {
        if (items.isEmpty()) throw new DomainException("Order must have items");
        if (total.isLessThan(Money.of(10000)))
            throw new DomainException("Minimum order: 10,000₫");
        this.status = OrderStatus.CONFIRMED;
    }
}
```

### Value Object

> **Không có identity**. So sánh bằng giá trị. Immutable.

```java
// Value Object — immutable, equality by value
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("Amount cannot be negative");
    }

    public Money add(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Cannot add different currencies");
        return new Money(amount.add(other.amount), currency);
    }

    public boolean isLessThan(Money other) {
        return amount.compareTo(other.amount) < 0;
    }

    public static Money of(long amount) {
        return new Money(BigDecimal.valueOf(amount), Currency.VND);
    }

    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.VND);
}

public record Address(String street, String city, String zipCode, String country) {
    // 2 Address cùng street, city, zip, country = BẰNG NHAU (value equality)
}
```

### Aggregate & Aggregate Root

> **Aggregate** = nhóm entities và value objects có consistency boundary. **Aggregate Root** = entry point duy nhất.

```java
// Order là Aggregate Root
// OrderItem là entity trong aggregate — chỉ truy cập qua Order
public class Order {  // AGGREGATE ROOT
    private OrderId id;
    private List<OrderItem> items;  // Internal entity
    private Address shippingAddress; // Value Object

    // Tất cả thay đổi items ĐI QUA Order (aggregate root)
    public void addItem(...) { ... }
    public void removeItem(OrderItemId itemId) { ... }

    // KHÔNG expose internal list → bảo vệ invariants
    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }
}

// Rule: tham chiếu giữa aggregates = bằng ID, KHÔNG object reference
public class Order {
    private CustomerId customerId;  // ✅ ID reference
    // private Customer customer;   // ❌ Object reference → coupling
}
```

### Repository

> Interface ở domain layer, implementation ở infrastructure. Mỗi aggregate root có 1 repository.

```java
// Domain layer — interface
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(OrderId id);
    List<Order> findByCustomerId(CustomerId customerId);
}

// Infrastructure layer — implementation
@Repository
public class JpaOrderRepository implements OrderRepository {
    // ... JPA implementation
}
```

### Domain Event

```java
public record OrderConfirmedEvent(
    OrderId orderId,
    CustomerId customerId,
    Money total,
    Instant occurredAt
) {
    public OrderConfirmedEvent(OrderId orderId, CustomerId customerId, Money total) {
        this(orderId, customerId, total, Instant.now());
    }
}

// Aggregate raises events
public class Order {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public void confirm() {
        // ... validation
        this.status = OrderStatus.CONFIRMED;
        domainEvents.add(new OrderConfirmedEvent(id, customerId, total));
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
}
```

### Domain Service

> Logic không thuộc về entity cụ thể nào.

```java
public class PricingDomainService {
    // Tính giá liên quan đến nhiều aggregates
    public Money calculateOrderTotal(Order order, DiscountPolicy policy, TaxPolicy tax) {
        Money subtotal = order.getSubtotal();
        Money discount = policy.apply(subtotal, order.getCustomerId());
        Money afterDiscount = subtotal.subtract(discount);
        Money taxAmount = tax.calculate(afterDiscount);
        return afterDiscount.add(taxAmount);
    }
}
```

---

## Ví Dụ E-Commerce

```
Bounded Contexts:
┌─────────────────────────────────────────────┐
│ CATALOG CONTEXT                             │
│  Product (AggRoot), Category, Price         │
│  → CRUD sản phẩm, search, browse           │
├─────────────────────────────────────────────┤
│ ORDER CONTEXT                               │
│  Order (AggRoot) → OrderItem                │
│  → Đặt hàng, confirm, cancel               │
├─────────────────────────────────────────────┤
│ PAYMENT CONTEXT                             │
│  Payment (AggRoot) → Transaction            │
│  → Thanh toán, refund                       │
├─────────────────────────────────────────────┤
│ SHIPPING CONTEXT                            │
│  Shipment (AggRoot) → TrackingInfo          │
│  → Tạo vận đơn, tracking                   │
├─────────────────────────────────────────────┤
│ CUSTOMER CONTEXT                            │
│  Customer (AggRoot) → Address               │
│  → Profile, addresses                       │
└─────────────────────────────────────────────┘

Communication: Domain Events qua Kafka
  OrderConfirmed → Payment processes
  PaymentCompleted → Shipping creates shipment
```

---

## Câu Hỏi Phỏng Vấn

### Entity vs Value Object?
> Entity: có identity (ID), mutable, lifecycle. Value Object: không có ID, equal by value, immutable. Ví dụ: Order (entity), Money (VO), Address (VO).

### Aggregate Root quan trọng thế nào?
> Bảo vệ **consistency boundary**. Mọi thay đổi trong aggregate ĐI QUA root. Tránh inconsistent state (ví dụ: add item nhưng không update total).

### Bounded Context vs Microservice?
> 1 Bounded Context = 1 Microservice (lý tưởng). Nhưng 1 BC có thể là 1 module trong monolith. BC là **logical boundary**, microservice là **physical boundary**.

---

**Tiếp theo:** [07-Anti-Patterns.md](./07-Anti-Patterns.md)
