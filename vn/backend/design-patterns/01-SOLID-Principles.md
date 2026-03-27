# SOLID Principles — 5 Nguyên Tắc Thiết Kế

## Mục lục
1. [Single Responsibility (SRP)](#single-responsibility-srp)
2. [Open/Closed (OCP)](#openclosed-ocp)
3. [Liskov Substitution (LSP)](#liskov-substitution-lsp)
4. [Interface Segregation (ISP)](#interface-segregation-isp)
5. [Dependency Inversion (DIP)](#dependency-inversion-dip)
6. [SOLID trong Spring Boot](#solid-trong-spring-boot)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Single Responsibility (SRP)

> Mỗi class chỉ có **một lý do để thay đổi** — một trách nhiệm duy nhất.

```java
// ❌ Vi phạm SRP: class làm quá nhiều việc
public class OrderService {
    public Order createOrder(OrderRequest req) { ... }
    public void sendEmail(Order order) { ... }          // Email logic
    public void generatePDF(Order order) { ... }        // PDF logic
    public void saveToDatabase(Order order) { ... }     // DB logic
}

// ✅ Tuân thủ SRP: tách trách nhiệm
public class OrderService {
    private final OrderRepository orderRepo;
    private final OrderEventPublisher eventPublisher;

    public Order createOrder(OrderRequest req) {
        Order order = OrderMapper.toEntity(req);
        Order saved = orderRepo.save(order);
        eventPublisher.publish(new OrderCreatedEvent(saved));
        return saved;
    }
}

public class OrderNotificationService {
    public void sendConfirmation(Order order) { ... }
}

public class OrderPDFService {
    public byte[] generateInvoice(Order order) { ... }
}
```

**Dấu hiệu vi phạm**: class có method không liên quan (email + PDF + DB), class quá 300 dòng, tên class quá chung ("Manager", "Processor", "Handler").

---

## Open/Closed (OCP)

> **Mở** để mở rộng, **đóng** để sửa đổi — thêm tính năng mới mà không sửa code cũ.

```java
// ❌ Vi phạm OCP: mỗi lần thêm loại mới phải sửa if-else
public class DiscountCalculator {
    public double calculate(Order order) {
        if (order.getType().equals("VIP")) {
            return order.getTotal() * 0.2;
        } else if (order.getType().equals("EMPLOYEE")) {
            return order.getTotal() * 0.3;
        } else if (order.getType().equals("STUDENT")) {  // Thêm loại → sửa class
            return order.getTotal() * 0.1;
        }
        return 0;
    }
}

// ✅ Tuân thủ OCP: Strategy pattern — thêm loại mới = thêm class mới
public interface DiscountStrategy {
    double calculate(Order order);
    boolean supports(String type);
}

@Component
public class VipDiscount implements DiscountStrategy {
    public double calculate(Order order) { return order.getTotal() * 0.2; }
    public boolean supports(String type) { return "VIP".equals(type); }
}

@Component
public class StudentDiscount implements DiscountStrategy {
    public double calculate(Order order) { return order.getTotal() * 0.1; }
    public boolean supports(String type) { return "STUDENT".equals(type); }
}

// Thêm loại mới → tạo class mới, KHÔNG sửa code cũ
@Service
public class DiscountService {
    private final List<DiscountStrategy> strategies;

    public double calculate(Order order) {
        return strategies.stream()
            .filter(s -> s.supports(order.getType()))
            .findFirst()
            .map(s -> s.calculate(order))
            .orElse(0.0);
    }
}
```

---

## Liskov Substitution (LSP)

> Subclass phải **thay thế** được parent class mà không làm sai logic chương trình.

```java
// ❌ Vi phạm LSP: Square không thay thế được Rectangle
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int area() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; } // Sửa cả height!
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
}

// Test: rect.setWidth(5); rect.setHeight(3); assert rect.area() == 15
// Square: setWidth(5) → setHeight(3) → width=3,height=3 → area=9 ← SAI!

// ✅ Tuân thủ LSP: dùng composition hoặc interface
public interface Shape {
    int area();
}

public record Rectangle(int width, int height) implements Shape {
    public int area() { return width * height; }
}

public record Square(int side) implements Shape {
    public int area() { return side * side; }
}
```

---

## Interface Segregation (ISP)

> Client không nên bị bắt phụ thuộc vào interface mà nó **không dùng**.

```java
// ❌ Vi phạm ISP: interface quá lớn
public interface Worker {
    void work();
    void eat();       // Robot không ăn
    void sleep();     // Robot không ngủ
}

public class Robot implements Worker {
    public void work() { ... }
    public void eat() { throw new UnsupportedOperationException(); }  // ❌
    public void sleep() { throw new UnsupportedOperationException(); } // ❌
}

// ✅ Tuân thủ ISP: tách interface nhỏ
public interface Workable { void work(); }
public interface Eatable  { void eat(); }
public interface Sleepable { void sleep(); }

public class Human implements Workable, Eatable, Sleepable { ... }
public class Robot implements Workable { ... }  // Chỉ implement cần thiết
```

---

## Dependency Inversion (DIP)

> Module cấp cao không phụ thuộc module cấp thấp. Cả hai **phụ thuộc abstraction**.

```java
// ❌ Vi phạm DIP: phụ thuộc trực tiếp implementation
public class OrderService {
    private MySQLOrderRepository repo = new MySQLOrderRepository();  // Coupling!
    private SmtpEmailSender email = new SmtpEmailSender();           // Coupling!
}

// ✅ Tuân thủ DIP: phụ thuộc abstraction (interface)
public class OrderService {
    private final OrderRepository repo;     // Interface
    private final EmailSender emailSender;  // Interface

    public OrderService(OrderRepository repo, EmailSender emailSender) {
        this.repo = repo;
        this.emailSender = emailSender;
    }
}

// Spring DI tự inject implementation
@Repository
public class JpaOrderRepository implements OrderRepository { ... }

@Component
public class SmtpEmailSender implements EmailSender { ... }
```

---

## SOLID Trong Spring Boot

Spring Boot tuân thủ SOLID by design:

| Nguyên tắc | Spring Boot implementation |
|-----------|---------------------------|
| **SRP** | `@Service`, `@Repository`, `@Controller` — tách layer |
| **OCP** | `@ConditionalOnProperty`, auto-configuration, Strategy beans |
| **LSP** | Interface-based programming, `@Primary`, `@Qualifier` |
| **ISP** | Nhiều interface nhỏ: `JpaRepository`, `CrudRepository` |
| **DIP** | Constructor injection, `@Autowired` interface (không impl) |

---

## Câu Hỏi Phỏng Vấn

### SOLID quan trọng vì sao?
> Giúp code **dễ maintain, test, extend**. Vi phạm SOLID → code cứng, khó test (mock khó), thêm feature phải sửa nhiều chỗ → bug.

### SRP "một lý do thay đổi" hiểu thế nào?
> Nếu thay đổi business logic email → phải sửa OrderService → vi phạm SRP. OrderService chỉ nên thay đổi khi logic **order** thay đổi.

### OCP áp dụng thực tế thế nào?
> Strategy pattern, plugin architecture, event-driven. Thêm tính năng = thêm class mới implement interface, KHÔNG sửa code cũ.

---

**Tiếp theo:** [02-Creational-Patterns.md](./02-Creational-Patterns.md)
