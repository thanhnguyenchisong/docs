# Behavioral Patterns — Patterns Hành Vi

## Mục lục
1. [Strategy](#strategy)
2. [Observer](#observer)
3. [Template Method](#template-method)
4. [Command](#command)
5. [State](#state)
6. [Chain of Responsibility](#chain-of-responsibility)
7. [Tổng hợp](#tổng-hợp)

---

## Strategy

> Định nghĩa **family of algorithms**, đóng gói mỗi cái, và cho phép hoán đổi lẫn nhau.

```java
public interface PricingStrategy {
    BigDecimal calculatePrice(Product product, User user);
}

@Component("regular")
public class RegularPricing implements PricingStrategy {
    public BigDecimal calculatePrice(Product product, User user) {
        return product.getBasePrice();
    }
}

@Component("vip")
public class VipPricing implements PricingStrategy {
    public BigDecimal calculatePrice(Product product, User user) {
        return product.getBasePrice().multiply(new BigDecimal("0.8")); // 20% off
    }
}

@Component("employee")
public class EmployeePricing implements PricingStrategy {
    public BigDecimal calculatePrice(Product product, User user) {
        return product.getBasePrice().multiply(new BigDecimal("0.5")); // 50% off
    }
}

@Service
public class PricingService {
    private final Map<String, PricingStrategy> strategies;

    public BigDecimal getPrice(Product product, User user) {
        PricingStrategy strategy = strategies.getOrDefault(user.getTier(), strategies.get("regular"));
        return strategy.calculatePrice(product, user);
    }
}
```

**Spring application**: `List<Interface>` hoặc `Map<String, Interface>` injection = Strategy pattern tự động.

---

## Observer

> Object (subject) **thông báo** danh sách observers khi state thay đổi.

```java
// Spring: ApplicationEventPublisher = Observer pattern built-in

// Event
public record OrderCreatedEvent(Order order) {}

// Publisher (Subject)
@Service
public class OrderService {
    @Autowired
    private ApplicationEventPublisher publisher;

    public Order createOrder(OrderRequest req) {
        Order order = orderRepo.save(toEntity(req));
        publisher.publishEvent(new OrderCreatedEvent(order));  // Notify observers
        return order;
    }
}

// Observers (Listeners)
@Component
public class EmailListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emailService.sendConfirmation(event.order());
    }
}

@Component
public class InventoryListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        inventoryService.reserve(event.order().getItems());
    }
}

@Component
public class AnalyticsListener {
    @EventListener
    @Async  // Non-blocking
    public void onOrderCreated(OrderCreatedEvent event) {
        analyticsService.trackOrder(event.order());
    }
}
```

---

## Template Method

> Định nghĩa **skeleton** của algorithm trong base class, subclass **override** các bước cụ thể.

```java
// Template
public abstract class DataExporter {

    // Template method — không override
    public final void export(ExportRequest request) {
        List<Map<String, Object>> data = fetchData(request);
        List<Map<String, Object>> transformed = transformData(data);
        byte[] output = formatOutput(transformed);
        writeOutput(output, request.getDestination());
        notifyComplete(request);
    }

    // Steps — subclass implement
    protected abstract List<Map<String, Object>> fetchData(ExportRequest request);
    protected abstract byte[] formatOutput(List<Map<String, Object>> data);

    // Optional hook — có default, có thể override
    protected List<Map<String, Object>> transformData(List<Map<String, Object>> data) {
        return data; // Default: không transform
    }

    protected void notifyComplete(ExportRequest request) {
        log.info("Export completed: {}", request.getId());
    }

    private void writeOutput(byte[] output, String destination) {
        // Ghi file — shared logic
    }
}

public class CsvExporter extends DataExporter {
    protected List<Map<String, Object>> fetchData(ExportRequest req) { /* SQL query */ }
    protected byte[] formatOutput(List<Map<String, Object>> data) { /* CSV format */ }
}

public class ExcelExporter extends DataExporter {
    protected List<Map<String, Object>> fetchData(ExportRequest req) { /* SQL query */ }
    protected byte[] formatOutput(List<Map<String, Object>> data) { /* Excel format */ }
}
```

---

## Command

> Đóng gói request thành **object** — cho phép queue, undo, log.

```java
public interface Command {
    void execute();
    void undo();
}

public class AddToCartCommand implements Command {
    private final Cart cart;
    private final Product product;

    public void execute() { cart.add(product); }
    public void undo()    { cart.remove(product); }
}

// Command History — undo/redo
public class CommandHistory {
    private final Deque<Command> history = new ArrayDeque<>();
    private final Deque<Command> redoStack = new ArrayDeque<>();

    public void execute(Command cmd) {
        cmd.execute();
        history.push(cmd);
        redoStack.clear();
    }

    public void undo() {
        if (!history.isEmpty()) {
            Command cmd = history.pop();
            cmd.undo();
            redoStack.push(cmd);
        }
    }

    public void redo() {
        if (!redoStack.isEmpty()) {
            Command cmd = redoStack.pop();
            cmd.execute();
            history.push(cmd);
        }
    }
}
```

---

## State

> Object thay đổi **behavior khi state thay đổi** — giống như đổi class.

```java
public interface OrderState {
    void next(OrderContext context);
    void cancel(OrderContext context);
    String getStatus();
}

public class PendingState implements OrderState {
    public void next(OrderContext ctx) { ctx.setState(new ProcessingState()); }
    public void cancel(OrderContext ctx) { ctx.setState(new CancelledState()); }
    public String getStatus() { return "PENDING"; }
}

public class ProcessingState implements OrderState {
    public void next(OrderContext ctx) { ctx.setState(new ShippedState()); }
    public void cancel(OrderContext ctx) { throw new IllegalStateException("Cannot cancel processing order"); }
    public String getStatus() { return "PROCESSING"; }
}

public class ShippedState implements OrderState {
    public void next(OrderContext ctx) { ctx.setState(new DeliveredState()); }
    public void cancel(OrderContext ctx) { throw new IllegalStateException("Cannot cancel shipped order"); }
    public String getStatus() { return "SHIPPED"; }
}

public class OrderContext {
    private OrderState state = new PendingState();
    public void setState(OrderState state) { this.state = state; }
    public void next() { state.next(this); }
    public void cancel() { state.cancel(this); }
    public String getStatus() { return state.getStatus(); }
}
```

---

## Chain of Responsibility

> Chuyển request qua **chuỗi handlers** — mỗi handler quyết định xử lý hoặc chuyển tiếp.

```java
// Spring: Filter chain, Interceptor chain

public abstract class ValidationHandler {
    private ValidationHandler next;

    public ValidationHandler setNext(ValidationHandler next) {
        this.next = next;
        return next;
    }

    public ValidationResult handle(OrderRequest request) {
        ValidationResult result = validate(request);
        if (!result.isValid()) return result;
        if (next != null) return next.handle(request);
        return ValidationResult.valid();
    }

    protected abstract ValidationResult validate(OrderRequest request);
}

public class StockValidation extends ValidationHandler {
    protected ValidationResult validate(OrderRequest req) {
        return inventoryService.hasStock(req.getProductId())
            ? ValidationResult.valid()
            : ValidationResult.invalid("Out of stock");
    }
}

public class PaymentValidation extends ValidationHandler {
    protected ValidationResult validate(OrderRequest req) {
        return paymentService.hasBalance(req.getUserId(), req.getTotal())
            ? ValidationResult.valid()
            : ValidationResult.invalid("Insufficient balance");
    }
}

// Build chain
ValidationHandler chain = new StockValidation();
chain.setNext(new PaymentValidation())
     .setNext(new FraudDetection());

ValidationResult result = chain.handle(orderRequest);
```

---

## Tổng Hợp

| Pattern | Khi nào | Spring equivalent |
|---------|---------|-------------------|
| **Strategy** | Chọn algorithm runtime | `Map<String, Interface>` beans |
| **Observer** | Event notification, decouple | `@EventListener`, `ApplicationEvent` |
| **Template Method** | Algorithm skeleton + custom steps | `JdbcTemplate`, `RestTemplate` |
| **Command** | Queue, undo, macro | Task queue, CQRS commands |
| **State** | Object behavior phụ thuộc state | Order state machine |
| **Chain of Resp.** | Pipeline xử lý tuần tự | `Filter`, `HandlerInterceptor` |

---

**Tiếp theo:** [05-Clean-Architecture.md](./05-Clean-Architecture.md)
