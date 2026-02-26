# Dependency Injection - Câu hỏi phỏng vấn Quarkus

## Mục lục
1. [CDI (Contexts and Dependency Injection)](#cdi)
2. [Bean Scopes](#bean-scopes)
3. [Qualifiers](#qualifiers)
4. [Programmatic Lookup: Instance&lt;T&gt; và Provider&lt;T&gt;](#programmatic-lookup)
5. [Producers và Disposers](#producers-và-disposers)
6. [Lifecycle callbacks](#lifecycle-callbacks)
7. [Advanced CDI Features](#advanced-cdi-features)
8. [Events](#events)
9. [Interceptors](#interceptors)
10. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## CDI (Contexts and Dependency Injection)

### CDI Basics & ArC (Quarkus)

Quarkus sử dụng **ArC** - một implement CDI build-time optimization.
- **Build-time**: Phân tích metadata lúc build, không dùng reflection lúc runtime (trừ khi cần thiết), giúp startup cực nhanh.
- **Unused beans**: Mặc định Quarkus xóa các bean không được dùng (`quarkus.arc.remove-unused-beans=true`) để giảm memory.

```java
// CDI: Jakarta Contexts and Dependency Injection
// Standard dependency injection

// Service
@ApplicationScoped
public class UserService {
    public User findById(Long id) {
        return userRepository.findById(id);
    }
}

// Resource
@Path("/users")
public class UserResource {
    @Inject
    UserService userService;  // Injected by CDI
    
    @GET
    @Path("/{id}")
    public User getUser(@PathParam("id") Long id) {
        return userService.findById(id);
    }
}
```

### Constructor Injection

```java
// Constructor injection (recommended)
@ApplicationScoped
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

---

## Bean Scopes

### Application Scoped

```java
// ApplicationScoped: One instance per application
@ApplicationScoped
public class UserService {
    // Shared across all requests
    // Thread-safe required
}
```

### Request Scoped

```java
// RequestScoped: One instance per HTTP request
@RequestScoped
public class RequestContext {
    // New instance per request
    // Request-specific data
}
```

### Singleton

```java
// Singleton: One instance (like ApplicationScoped)
@Singleton
public class ConfigService {
    // One instance
}
```

### Dependent (mặc định)

```java
// @Dependent: Một instance mới cho mỗi injection point (default nếu không khai báo scope)
// Pseudo-scope: không có context riêng, sống theo bean chứa nó
@Dependent
public class HelperService {
    // Mỗi bean inject HelperService sẽ có 1 instance HelperService riêng
}
```

### Normal Scope vs Pseudo Scope (Client Proxy)

#### Bảng so sánh

| Đặc điểm | Normal Scope | Pseudo Scope |
| :--- | :--- | :--- |
| **Annotations** | `@ApplicationScoped`, `@RequestScoped`, `@SessionScoped` | `@Dependent` (default), `@Singleton` |
| **Cơ chế Inject** | **Client Proxy** (Vỏ bọc) | **Direct Reference** (Instance thật) |
| **Lifecycle** | Có điểm bắt đầu/kết thúc rõ ràng do Context quản lý. | Phụ thuộc vào bean chứa nó (`@Dependent`) hoặc sống mãi (`@Singleton`). |
| **Lazy Init** | **Có**. Bean thật chỉ được tạo khi gọi hàm đầu tiên. | **Không**. Tạo ngay khi được inject. |

#### Client Proxy là gì?

**Client Proxy** là một object giả mà CDI inject vào thay vì object thật.
- **Giải quyết Scope Mismatch**: Khi inject bean scope ngắn (Request) vào bean scope dài (Application), Proxy đảm bảo gọi đúng instance của request hiện tại.
- **Lazy Initialization**: Tăng tốc startup vì chưa cần tạo instance thật ngay.
- **Circular Dependency**: Giúp phá vỡ vòng lặp dependency trong một số trường hợp.

#### Khi nào dùng cái nào?

1. **@ApplicationScoped** (Normal):
   - **Dùng cho**: Service, Repository, Component stateless hoặc shared state.
   - **Lợi ích**: Tiết kiệm RAM (1 instance), Lazy Init, Thread-safe.

2. **@RequestScoped** (Normal):
   - **Dùng cho**: User context, Transaction info, Request logging.
   - **Lợi ích**: Cô lập dữ liệu giữa các request.

3. **@Dependent** (Pseudo - Default):
   - **Dùng cho**: Helper object, object dùng 1 lần, hoặc cần nhiều instance riêng biệt cho từng cha.
   - **Cảnh báo**: Nếu inject vào `@ApplicationScoped`, bean Dependent sẽ **sống mãi** (Memory Leak tiềm ẩn).

4. **@Singleton** (Pseudo):
   - **Dùng cho**: Utility đơn giản không cần Proxy.
   - **Lưu ý**: Không Lazy Init, startup chậm hơn nếu init nặng. Ưu tiên `@ApplicationScoped` trong Quarkus.

#### Vấn đề thường gặp (Pitfalls)

- **Gọi field trực tiếp**: `proxy.field` có thể null hoặc sai giá trị (vì không qua method delegate). -> **Luôn dùng Getter/Setter**.
- **Private Methods**: Proxy chuẩn không gọi được private method (Quarkus fix được bằng bytecode transformation nhưng nên hạn chế).

---

## Qualifiers

### @Named

```java
// @Named: Qualifier có sẵn, dùng name (string)
@Named("postgres")
@ApplicationScoped
public class PostgresRepo implements UserRepository { }

@Inject
@Named("postgres")
UserRepository repo;
```

### Custom Qualifiers

```java
// Qualifier annotation
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
public @interface Database {
    DatabaseType value();
    
    enum DatabaseType {
        POSTGRES, MYSQL
    }
}

// Implementation
@Database(DatabaseType.POSTGRES)
@ApplicationScoped
public class PostgresUserRepository implements UserRepository {
    // PostgreSQL implementation
}

@Database(DatabaseType.MYSQL)
@ApplicationScoped
public class MySQLUserRepository implements UserRepository {
    // MySQL implementation
}

// Usage
@ApplicationScoped
public class UserService {
    @Inject
    @Database(DatabaseType.POSTGRES)
    UserRepository userRepository;
}
```

---

## Programmatic Lookup

### Tại sao cần Programmatic Lookup?

Bình thường `@Inject` resolve bean lúc **build-time** (cố định). Nhưng có những lúc bạn cần:
- Chọn bean **lúc runtime** (theo config, input user).
- Dependency **optional** (có thể không tồn tại).
- **Lazy**: Chỉ tạo bean khi thật sự cần.
- Lấy **nhiều bean** cùng interface (Strategy/Plugin pattern).

-> Dùng `Instance<T>` hoặc `Provider<T>`.

---

### Instance&lt;T&gt;

`jakarta.enterprise.inject.Instance<T>` — CDI API, mạnh mẽ nhất.

#### Khi nào NÊN dùng Instance&lt;T&gt;

**1. Strategy / Plugin Pattern — Nhiều bean cùng interface, chọn lúc runtime**

```java
// Có nhiều PaymentHandler: Momo, VNPay, Stripe...
// Không biết trước dùng cái nào -> chọn lúc runtime
@ApplicationScoped
public class PaymentRouter {
    @Inject
    Instance<PaymentHandler> handlers;  // Inject TẤT CẢ implementations

    public void pay(Order order) {
        for (PaymentHandler h : handlers) {
            if (h.supports(order.getPaymentMethod())) {
                h.handle(order);
                return;
            }
        }
        throw new UnsupportedPaymentException(order.getPaymentMethod());
    }
}
```

**2. Optional Dependency — Bean có thể không tồn tại**

```java
// Feature toggle: module analytics có thể không được cài
@ApplicationScoped
public class DashboardService {
    @Inject
    Instance<AnalyticsService> analytics;

    public Dashboard load() {
        Dashboard d = buildBasicDashboard();
        if (analytics.isResolvable()) {          // Có bean không?
            d.setStats(analytics.get().getStats());
        }
        // Nếu không có AnalyticsService -> App vẫn chạy bình thường
        return d;
    }
}
```

**3. Chọn bean bằng Qualifier lúc runtime**

```java
@Inject
@Any  // Inject tất cả, kể cả bean có qualifier khác nhau
Instance<NotificationSender> senders;

public void send(String channel, String msg) {
    // Select theo qualifier lúc runtime
    Instance<NotificationSender> selected = senders
        .select(new ChannelLiteral(channel));  // VD: "email", "sms", "push"
    
    if (selected.isResolvable()) {
        selected.get().send(msg);
    }
}
```

**4. Destroy @Dependent bean thủ công (tránh Memory Leak)**

```java
@Inject
Instance<HeavyWorker> workerInstance;  // HeavyWorker là @Dependent

public void process() {
    Instance.Handle<HeavyWorker> handle = workerInstance.getHandle();
    HeavyWorker worker = handle.get();
    try {
        worker.doWork();
    } finally {
        handle.destroy();  // Giải phóng ngay, không chờ bean cha chết
    }
}
```

#### API chính của Instance&lt;T&gt;

| Method | Mô tả |
| :--- | :--- |
| `get()` | Lấy 1 instance (ném `AmbiguousResolutionException` nếu > 1 bean) |
| `isResolvable()` | `true` nếu có đúng 1 bean match |
| `isUnsatisfied()` | `true` nếu không có bean nào |
| `isAmbiguous()` | `true` nếu có nhiều bean (cần qualifier để chọn) |
| `iterator()` / `stream()` | Duyệt tất cả beans |
| `select(Qualifier...)` | Lọc bean theo qualifier lúc runtime |
| `getHandle()` | Trả về Handle để quản lý lifecycle (`destroy()`) |

---

### Provider&lt;T&gt;

`jakarta.inject.Provider<T>` — JSR-330, đơn giản hơn, chỉ có `get()`.

#### Khi nào NÊN dùng Provider&lt;T&gt;

**1. Lazy Init đơn giản — Trì hoãn tạo bean nặng**

```java
@ApplicationScoped
public class ReportService {
    @Inject
    Provider<PdfEngine> pdfEngineProvider;  // PdfEngine init rất nặng (load font, template...)

    public void export(Report report) {
        if (report.needsPdf()) {
            PdfEngine engine = pdfEngineProvider.get();  // Chỉ init khi thật sự cần xuất PDF
            engine.render(report);
        }
        // Nếu không cần PDF -> PdfEngine KHÔNG BAO GIỜ được tạo -> tiết kiệm tài nguyên
    }
}
```

**2. Lấy đúng instance theo Scope hiện tại — Request-scoped bean trong Application-scoped bean**

```java
@ApplicationScoped
public class AuditService {
    @Inject
    Provider<SecurityContext> securityCtxProvider;  // @RequestScoped

    public void log(String action) {
        // Mỗi lần gọi get() -> lấy SecurityContext của REQUEST HIỆN TẠI
        String user = securityCtxProvider.get().getCurrentUser();
        auditRepo.save(new AuditLog(user, action));
    }
}
```

**3. Tạo nhiều instance @Dependent mới**

```java
@ApplicationScoped
public class TaskManager {
    @Inject
    Provider<TaskWorker> workerProvider;  // TaskWorker là @Dependent

    public void runBatch(List<Task> tasks) {
        for (Task t : tasks) {
            TaskWorker worker = workerProvider.get();  // Mỗi lần get() -> instance MỚI
            worker.execute(t);
        }
    }
}
```

---

### So sánh Instance&lt;T&gt; vs Provider&lt;T&gt;

| | Instance&lt;T&gt; | Provider&lt;T&gt; |
| :--- | :--- | :--- |
| **Spec** | CDI (Jakarta EE) | JSR-330 (javax/jakarta.inject) |
| **API** | `get()`, `isUnsatisfied()`, `isAmbiguous()`, `select()`, `stream()`, `getHandle()` | Chỉ `get()` |
| **Nhiều bean** | Iterate / select lúc runtime | Không hỗ trợ |
| **Optional check** | `isResolvable()`, `isUnsatisfied()` | Không (ném exception nếu không có) |
| **Destroy thủ công** | `getHandle().destroy()` | Không |
| **Khi nào dùng** | Nhiều bean, optional, strategy pattern, plugin | Lazy đơn giản, lấy instance theo scope |

#### Quy tắc chọn nhanh

- **Chỉ cần lazy 1 bean** -> `Provider<T>` (đơn giản, đủ dùng).
- **Nhiều bean, optional, select runtime** -> `Instance<T>`.
- **Cần destroy @Dependent thủ công** -> `Instance<T>` (bắt buộc).

#### Khi nào KHÔNG nên dùng

- Bean đã là **Normal Scope** (`@ApplicationScoped`, `@RequestScoped`): CDI đã tự Lazy Init qua Client Proxy rồi -> dùng `@Inject` thẳng là đủ, không cần Provider.
- Chỉ có **1 bean duy nhất** và nó **luôn tồn tại** -> `@Inject` trực tiếp đơn giản hơn.

---

## Producers và Disposers

### @Produces

```java
// Tạo bean theo điều kiện (config, factory)
@ApplicationScoped
public class DataSourceProducer {
    @Produces
    @ApplicationScoped
    public DataSource createDataSource(
            @ConfigProperty(name = "db.url") String url,
            @ConfigProperty(name = "db.user") String user) {
        return DataSources.create(url, user);
    }

    void dispose(@Disposes DataSource ds) {
        // Cleanup khi context kết thúc
        ds.close();
    }
}
```

---

## Lifecycle callbacks

```java
@ApplicationScoped
public class StartupService {
    @PostConstruct
    void init() {
        // Chạy sau khi bean được tạo và inject xong
    }

    @PreDestroy
    void shutdown() {
        // Chạy trước khi context bị destroy
    }
}
```

---

## Advanced CDI Features

### Alternatives & Priority

#### Vấn đề

Khi có **nhiều bean cùng implement 1 interface**, CDI không biết chọn cái nào -> `AmbiguousResolutionException`.
`@Alternative` cho phép **thay thế** bean mặc định mà **không cần sửa code gốc**.

#### Cách dùng

```java
// ===== BƯỚC 1: Bean mặc định =====
@ApplicationScoped
public class RealPaymentService implements PaymentService {
    @Override
    public void pay(Order order) {
        // Gọi API thanh toán thật (Stripe, VNPay...)
        stripeClient.charge(order.getAmount());
    }
}

// ===== BƯỚC 2: Bean thay thế (cho test/dev) =====
@Alternative                 // Đánh dấu: "Tôi là bản thay thế"
@Priority(1)                 // Bật và set priority (cao hơn = ưu tiên hơn)
@ApplicationScoped
public class MockPaymentService implements PaymentService {
    @Override
    public void pay(Order order) {
        // KHÔNG gọi API thật, chỉ log
        log.info("MOCK payment: {}", order.getAmount());
    }
}

// ===== BƯỚC 3: Code inject KHÔNG CẦN THAY ĐỔI =====
@ApplicationScoped
public class OrderService {
    @Inject
    PaymentService paymentService;  // CDI tự chọn MockPaymentService vì có @Alternative + @Priority
}
```

#### Khi nào dùng

| Dùng | Không dùng |
| :--- | :--- |
| Thay bean cho **test** / **dev profile** | Khi cần **cả 2 bean cùng lúc** (dùng Qualifier thay thế) |
| Override bean từ **thư viện bên thứ 3** | Khi chỉ cần thêm logic bọc ngoài (dùng Decorator) |
| A/B testing: swap implementation | |

#### Bật/Tắt Alternative (Config vs Priority)

1. **Dùng @Priority**: Alternative **luôn active** nếu priority cao hơn.
2. **Dùng Config (`application.properties`)**: Linh hoạt hơn, bật/tắt theo môi trường mà không cần sửa code.

```java
// KHÔNG dùng @Priority trên class này
@Alternative
@ApplicationScoped
public class MockPaymentService implements PaymentService { ... }
```

```properties
# application.properties (hoặc application-dev.properties)
# Chỉ định rõ class nào được chọn làm Alternative
quarkus.arc.selected-alternatives=com.example.MockPaymentService
```

#### Quarkus-specific: `@IfBuildProfile`

Quarkus cho phép kích hoạt Alternative theo **build profile** mà không cần `@Priority`:

```java
@Alternative
@IfBuildProfile("dev")       // Chỉ active khi chạy profile "dev"
@ApplicationScoped
public class MockPaymentService implements PaymentService { ... }

@Alternative
@IfBuildProfile("prod")
@ApplicationScoped
public class RealPaymentService implements PaymentService { ... }
```

---

### Stereotypes

#### Vấn đề

Nhiều class cần **cùng tổ hợp annotation** lặp đi lặp lại: `@ApplicationScoped` + `@Transactional` + `@Logged`...
-> Copy-paste, dễ quên, khó maintain.

#### Cách dùng

```java
// ===== BƯỚC 1: Tạo Stereotype =====
@Stereotype                          // Đánh dấu: "Tôi là stereotype"
@ApplicationScoped                   // Gom scope
@Transactional                       // Gom transaction
@Logged                              // Gom interceptor logging
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Service {
    // Annotation này = @ApplicationScoped + @Transactional + @Logged
}

// ===== BƯỚC 2: Sử dụng =====
// TRƯỚC (verbose):
@ApplicationScoped
@Transactional
@Logged
public class UserService { ... }

@ApplicationScoped
@Transactional
@Logged
public class OrderService { ... }

// SAU (clean):
@Service
public class UserService { ... }

@Service
public class OrderService { ... }
```

#### Khi nào dùng

| Dùng | Không dùng |
| :--- | :--- |
| **3+ class** cùng tổ hợp annotation | Chỉ 1-2 class dùng tổ hợp đó (overhead tạo annotation) |
| Muốn **chuẩn hóa** convention cho team | Tổ hợp annotation thay đổi thường xuyên giữa các class |
| Thay đổi 1 chỗ -> tất cả class áp dụng | |

---

### Decorators

#### Vấn đề

Cần **thêm logic business** vào bean có sẵn (logging giá, thêm discount, validate...) mà **không sửa code gốc**.

#### So sánh: Decorator vs Interceptor

| | Decorator | Interceptor |
| :--- | :--- | :--- |
| **Loại logic** | **Business** (giảm giá, cache, validate) | **Technical** (logging, timing, security) |
| **Biết kiểu dữ liệu?** | **Có** (implement cùng interface, thấy method signatures) | **Không** (chỉ thấy `InvocationContext`, generic) |
| **Truy cập tham số?** | Trực tiếp qua method params | Qua `context.getParameters()` (Object[]) |

#### Cách dùng

```java
// ===== Interface gốc =====
public interface PriceCalculator {
    double calculate(Product product);
}

// ===== Bean gốc =====
@ApplicationScoped
public class StandardPriceCalculator implements PriceCalculator {
    @Override
    public double calculate(Product product) {
        return product.getBasePrice();  // Giá gốc
    }
}

// ===== Decorator 1: Thêm thuế =====
@Decorator
@Priority(10)  // Chạy trước (số nhỏ = ưu tiên cao)
public class TaxDecorator implements PriceCalculator {
    @Inject
    @Delegate       // Inject bean gốc (hoặc decorator tiếp theo trong chain)
    @Any
    PriceCalculator delegate;

    @Override
    public double calculate(Product product) {
        double price = delegate.calculate(product);  // Gọi bean gốc
        return price * 1.1;                          // Cộng thuế 10%
    }
}

// ===== Decorator 2: Giảm giá VIP =====
@Decorator
@Priority(20)  // Chạy sau TaxDecorator
public class VipDiscountDecorator implements PriceCalculator {
    @Inject @Delegate @Any
    PriceCalculator delegate;

    @Inject
    SecurityContext securityContext;  // Có thể inject bean khác bình thường

    @Override
    public double calculate(Product product) {
        double price = delegate.calculate(product);  // Gọi TaxDecorator
        if (securityContext.isVip()) {
            return price * 0.85;  // Giảm 15% cho VIP
        }
        return price;
    }
}

// ===== Thứ tự thực thi (chain) =====
// Client gọi calculate()
//   -> VipDiscountDecorator (Priority 20)
//     -> TaxDecorator (Priority 10)
//       -> StandardPriceCalculator (bean gốc)
//     <- return giá gốc * 1.1
//   <- return giá sau thuế * 0.85 (nếu VIP)
// <- return kết quả cuối
```

#### Khi nào dùng

| Dùng | Không dùng |
| :--- | :--- |
| Thêm **business logic** bọc ngoài (giá, validate, transform) | Logic **kỹ thuật** chung (logging, timing) -> dùng Interceptor |
| Cần **truy cập typed params** (biết rõ Product, Order...) | Chỉ cần **thay thế hoàn toàn** bean -> dùng Alternative |
| **Chain** nhiều decorator (giống middleware pipeline) | Logic quá đơn giản (1 dòng if/else) -> sửa thẳng bean gốc |
| Không muốn **sửa source** bean gốc (bean từ thư viện) | |

#### Lưu ý quan trọng

- Decorator **phải implement** cùng interface với bean gốc.
- Decorator **không phải** bean bình thường (không có scope annotation).
- `@Delegate` chỉ có **1 field** trong mỗi decorator.
- Thứ tự chain: `@Priority` **số lớn chạy trước** (bọc ngoài cùng), số nhỏ chạy sau (gần bean gốc nhất).

---

## Events

### Events là gì?

**CDI Events** là cơ chế **Observer Pattern** (Publish-Subscribe) được tích hợp sẵn trong CDI.
- **Publisher** (Người phát): Gửi sự kiện mà không cần biết ai sẽ nhận.
- **Observer** (Người nghe): Đăng ký lắng nghe sự kiện mà không cần biết ai gửi.
- **Decoupling**: Publisher và Observer không biết nhau, không phụ thuộc nhau.

#### Vấn đề Events giải quyết

**Không có Events (Tight Coupling):**
```java
@ApplicationScoped
public class OrderService {
    @Inject EmailService emailService;      // Phụ thuộc trực tiếp
    @Inject InventoryService inventoryService;
    @Inject LoyaltyService loyaltyService;
    @Inject AnalyticsService analyticsService;

    public void createOrder(Order order) {
        orderRepo.save(order);
        
        // OrderService phải BIẾT tất cả service liên quan
        emailService.sendConfirmation(order);      // Gửi mail
        inventoryService.reduceStock(order);       // Giảm kho
        loyaltyService.addPoints(order);           // Cộng điểm
        analyticsService.track(order);             // Tracking
        // Thêm tính năng mới? -> Phải SỬA OrderService
    }
}
```

**Có Events (Loose Coupling):**
```java
@ApplicationScoped
public class OrderService {
    @Inject Event<OrderCreatedEvent> orderCreated;

    public void createOrder(Order order) {
        orderRepo.save(order);
        orderCreated.fire(new OrderCreatedEvent(order));  // Chỉ fire, không cần biết ai nghe
        // Thêm tính năng mới? -> Tạo Observer mới, KHÔNG SỬA OrderService
    }
}
```

---

### Full Example: Từ Zero đến Master

#### Bước 1: Tạo Event Class

Event là một POJO đơn giản chứa dữ liệu cần truyền.

```java
// Event class - chứa thông tin về sự kiện
public class OrderCreatedEvent {
    private final Long orderId;
    private final String customerEmail;
    private final BigDecimal totalAmount;
    private final LocalDateTime createdAt;

    public OrderCreatedEvent(Order order) {
        this.orderId = order.getId();
        this.customerEmail = order.getCustomerEmail();
        this.totalAmount = order.getTotalAmount();
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public Long getOrderId() { return orderId; }
    public String getCustomerEmail() { return customerEmail; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
```

#### Bước 2: Publisher - Nơi phát sự kiện

```java
@ApplicationScoped
public class OrderService {
    @Inject
    OrderRepository orderRepo;

    @Inject
    Event<OrderCreatedEvent> orderCreatedEvent;  // Inject Event<T>

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. Business logic
        Order order = new Order();
        order.setCustomerEmail(request.getEmail());
        order.setTotalAmount(request.getTotal());
        orderRepo.persist(order);

        // 2. Fire event - thông báo "Đơn hàng đã được tạo"
        orderCreatedEvent.fire(new OrderCreatedEvent(order));

        return order;
    }
}
```

#### Bước 3: Observers - Nơi lắng nghe sự kiện

```java
// Observer 1: Gửi Email
@ApplicationScoped
public class EmailNotificationService {

    void onOrderCreated(@Observes OrderCreatedEvent event) {
        // Tự động được gọi khi có OrderCreatedEvent
        String email = event.getCustomerEmail();
        sendEmail(email, "Đơn hàng #" + event.getOrderId() + " đã được tạo!");
    }

    private void sendEmail(String to, String message) {
        System.out.println("Sending email to " + to + ": " + message);
    }
}

// Observer 2: Cập nhật kho
@ApplicationScoped
public class InventoryService {

    void onOrderCreated(@Observes OrderCreatedEvent event) {
        System.out.println("Reducing stock for order #" + event.getOrderId());
        // Logic giảm số lượng tồn kho
    }
}

// Observer 3: Cộng điểm thưởng
@ApplicationScoped
public class LoyaltyService {

    void onOrderCreated(@Observes OrderCreatedEvent event) {
        int points = event.getTotalAmount().intValue() / 1000;  // 1 điểm / 1000đ
        System.out.println("Adding " + points + " points for order #" + event.getOrderId());
    }
}

// Observer 4: Analytics
@ApplicationScoped
public class AnalyticsService {

    void onOrderCreated(@Observes OrderCreatedEvent event) {
        System.out.println("Tracking order #" + event.getOrderId() + " at " + event.getCreatedAt());
    }
}
```

**Kết quả**: Khi `orderService.createOrder()` được gọi:
1. Order được lưu vào DB.
2. Event được fire.
3. **Tất cả 4 observer tự động chạy** (cùng thread, theo thứ tự không xác định).

---

### Synchronous vs Asynchronous Events

#### Sync (`fire`) - Mặc định

```java
orderCreatedEvent.fire(event);
```

| Đặc điểm | Giá trị |
| :--- | :--- |
| **Thread** | Cùng thread với Publisher |
| **Blocking** | Có - Publisher chờ tất cả Observer xong |
| **Transaction** | Chung transaction với Publisher |
| **Exception** | 1 Observer throw -> Rollback cả transaction |

**Dùng khi**: Logic PHẢI hoàn thành trước khi tiếp tục (VD: giảm kho trước khi trả response).

#### Async (`fireAsync`) - Bất đồng bộ

```java
orderCreatedEvent.fireAsync(event)
    .thenAccept(e -> System.out.println("All async observers done"))
    .exceptionally(e -> {
        System.out.println("Error: " + e.getMessage());
        return null;
    });
```

```java
// Observer phải dùng @ObservesAsync
void onOrderCreatedAsync(@ObservesAsync OrderCreatedEvent event) {
    // Chạy trên thread khác
    sendEmailSlow(event);  // Có thể mất 5 giây, không block main thread
}
```

| Đặc điểm | Giá trị |
| :--- | :--- |
| **Thread** | Thread pool riêng (mặc định: ForkJoinPool) |
| **Blocking** | Không - Publisher tiếp tục ngay |
| **Transaction** | KHÔNG chung transaction |
| **Exception** | Không ảnh hưởng Publisher |

**Dùng khi**: Task nặng/chậm không cần chờ (VD: gửi email, push notification).

---

### Advanced: Transaction Phase

**Vấn đề**: Bạn fire event trong transaction, nhưng transaction có thể **ROLLBACK**.
-> Nếu đã gửi email rồi mà DB rollback -> Sai logic!

**Giải pháp**: Chờ transaction kết thúc rồi mới xử lý.

```java
@ApplicationScoped
public class EmailService {

    // CHỈ gửi email khi DB COMMIT THÀNH CÔNG
    void sendOnSuccess(@Observes(during = TransactionPhase.AFTER_SUCCESS) OrderCreatedEvent e) {
        sendConfirmationEmail(e.getCustomerEmail(), e.getOrderId());
    }

    // Gửi cảnh báo nếu transaction THẤT BẠI
    void alertOnFailure(@Observes(during = TransactionPhase.AFTER_FAILURE) OrderCreatedEvent e) {
        alertAdmin("Order " + e.getOrderId() + " failed!");
    }
}
```

| TransactionPhase | Khi nào chạy |
| :--- | :--- |
| `IN_PROGRESS` | (Default) Ngay lập tức, trong transaction |
| `BEFORE_COMPLETION` | Trước khi commit, có thể gọi `setRollbackOnly()` |
| `AFTER_SUCCESS` | **Sau khi commit thành công** |
| `AFTER_FAILURE` | Sau khi rollback |
| `AFTER_COMPLETION` | Sau khi kết thúc (dù success hay fail) |

---

### Advanced: Conditional Observer

Mặc định, CDI tạo bean nếu chưa tồn tại để nhận event.
Nếu chỉ muốn nhận khi bean **ĐÃ TỒN TẠI** (tiết kiệm resource):

```java
void onEvent(@Observes(notifyObserver = Reception.IF_EXISTS) SomeEvent e) {
    // Chỉ chạy nếu bean này đang active
}
```

---

### Advanced: Ordering với @Priority

Kiểm soát thứ tự chạy của observers (số nhỏ chạy trước).

```java
// Chạy đầu tiên
void step1(@Observes @Priority(100) OrderCreatedEvent e) {
    System.out.println("1. Validate order");
}

// Chạy thứ hai
void step2(@Observes @Priority(200) OrderCreatedEvent e) {
    System.out.println("2. Process payment");
}

// Chạy cuối cùng
void step3(@Observes @Priority(300) OrderCreatedEvent e) {
    System.out.println("3. Send notification");
}
```

---

### Advanced: Event Qualifiers

Phân biệt các event cùng type nhưng khác ngữ cảnh.

```java
// Định nghĩa Qualifier
@Qualifier
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
public @interface Premium {}

// Publisher
@Inject @Premium
Event<OrderCreatedEvent> premiumOrderEvent;

premiumOrderEvent.fire(event);  // Fire với qualifier

// Observer
void onPremiumOrder(@Observes @Premium OrderCreatedEvent e) {
    // Chỉ nhận event có @Premium
    sendVIPGift(e.getOrderId());
}
```

---

### Khi nào NÊN dùng Events?

#### 1. Decoupling (Giảm phụ thuộc)
Khi bạn muốn Module A thông báo cái gì đó đã xảy ra, nhưng **không cần biết** (và không nên biết) ai sẽ xử lý nó.
- **Ví dụ**: `OrderService` (A) tạo đơn hàng xong. `InventoryService` (B), `EmailService` (C), `AnalyticsService` (D) cần biết để làm việc riêng của họ.
- **Lợi ích**: A không phụ thuộc vào B, C, D. Khi thêm E, không cần sửa A.

#### 2. Side Effects (Tác vụ phụ)
Các tác vụ không ảnh hưởng trực tiếp đến luồng chính (Main Flow).
- **Ví dụ**: Gửi email, ghi log audit, bắn metrics, push notification.
- **Lợi ích**: Tách biệt logic chính và phụ, code gọn hơn.

#### 3. Asynchronous Processing (Xử lý bất đồng bộ)
Muốn thực hiện task nặng mà không block user.
- **Ví dụ**: Tạo report PDF, gửi email qua network chậm, gọi API bên thứ 3.
- **Lợi ích**: User nhận phản hồi ngay, task chạy ngầm.

#### 4. Extension Points (Điểm mở rộng)
Thiết kế hệ thống dạng Plugin, cho phép module khác "hook" vào quy trình.
- **Ví dụ**: CMS cho phép plugin lắng nghe sự kiện `PostPublishedEvent` để SEO, auto-share lên Facebook.

---

### Khi nào KHÔNG nên dùng Events?

#### 1. Core Business Flow (Luồng nghiệp vụ chính)
Khi các bước phụ thuộc chặt chẽ vào nhau và cần rõ ràng về thứ tự.
- **Ví dụ**: `Validate Order` -> `Payment` -> `Save DB`.
- **Tại sao**: Dùng Event ở đây làm code trở nên "Magic", khó debug (không biết flow chạy đi đâu), khó control thứ tự và error handling. -> **Nên gọi method trực tiếp**.

#### 2. Cần Return Value (Giá trị trả về)
Observer pattern là "fire and forget" (bắn và quên).
- **Ví dụ**: Gọi `calculateTax(order)` và cần nhận về số tiền thuế để tính tổng.
- **Tại sao**: Event không thiết kế để trả về dữ liệu. (Dù có thể dùng object mutable trong event để hứng dữ liệu, nhưng đó là anti-pattern). -> **Nên gọi method trực tiếp**.

#### 3. Communication trong cùng Module nhỏ
Khi class A và class B nằm cạnh nhau, cùng package, cùng nghiệp vụ.
- **Tại sao**: Over-engineering. Gọi hàm trực tiếp đơn giản và dễ hiểu hơn.

---

### Pitfalls (Lỗi thường gặp)

1. **Quên `@ObservesAsync`**: Fire async nhưng observer dùng `@Observes` -> Không nhận được.
2. **Exception trong Sync Observer**: 1 observer throw -> Cả transaction rollback, các observer khác không chạy.
3. **Circular Events**: A fire event -> B observe -> B fire event -> A observe -> Loop vô hạn.
4. **Heavy logic trong Sync**: Block main thread, response chậm -> Chuyển sang Async.
5. **Async mà cần Transaction**: Async observer KHÔNG có transaction context của publisher -> Tự quản lý transaction nếu cần.

---

## Interceptors

**Interceptor** được dùng cho các "Cross-cutting concerns" (logic cắt ngang) như Logging, Transaction, Security, Cache... tách biệt khỏi business logic.

### 1. Định nghĩa Interceptor Binding

Tạo annotation để đánh dấu nơi cần intercept.

```java
@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD}) // Có thể dùng cho Class hoặc Method
public @interface Logged {
    // Có thể thêm parameter, ví dụ: boolean detail() default false;
}
```

### 2. Implement Interceptor

```java
@Logged // Liên kết với annotation binding
@Interceptor
@Priority(Interceptor.Priority.APPLICATION) // Thứ tự chạy (quan trọng nếu có nhiều interceptor)
public class LoggingInterceptor {

    @AroundInvoke
    public Object log(InvocationContext context) throws Exception {
        // 1. Trước khi gọi method thật
        String methodName = context.getMethod().getName();
        Object[] params = context.getParameters();
        
        System.out.println(">>> Calling " + methodName + " with " + Arrays.toString(params));

        try {
            // 2. Gọi method thật (hoặc interceptor tiếp theo)
            Object result = context.proceed();
            
            // 3. Sau khi gọi thành công
            System.out.println("<<< Return: " + result);
            return result;
        } catch (Exception e) {
            // 4. Khi có lỗi
            System.out.println("!!! Error: " + e.getMessage());
            throw e; // Ném tiếp lỗi hoặc nuốt lỗi (tùy logic)
        }
    }
}
```

### 3. Sử dụng

```java
// Cách 1: Áp dụng cho toàn bộ class (tất cả method public)
@Logged
@ApplicationScoped
public class UserService {
    public void createUser(String name) { ... } // Sẽ bị intercept
    public void deleteUser(int id) { ... }      // Sẽ bị intercept
}

// Cách 2: Áp dụng cho từng method
@ApplicationScoped
public class OrderService {
    
    @Logged // Chỉ intercept method này
    public void createOrder(Order order) { ... }

    public void checkStatus(int id) { ... } // Không bị intercept
}
```

### Lưu ý quan trọng

1.  **Scope**: Interceptor bean thường là dependent (mặc định), instance được tạo mỗi khi bean bị intercept được tạo.
2.  **Modifiers**: Không intercept được `private`, `final` methods (trừ khi Quarkus transform bytecode, nhưng nên tránh).
3.  **Order**: Nếu 1 method có nhiều interceptor (VD: `@Transactional`, `@Logged`, `@Security`), thứ tự dựa vào `@Priority`.
    - Priority nhỏ chạy trước (ngoài cùng).
    - Priority lớn chạy sau (gần method gốc nhất).
4.  **Constructor**: Dùng `@AroundConstruct` để intercept quá trình khởi tạo bean.

```java
@AroundConstruct
void init(InvocationContext ctx) {
    // Chạy trước/sau khi constructor được gọi
    ctx.proceed();
}
```

---

## Câu hỏi thường gặp

### Q1: CDI vs Spring DI?

```java
// CDI:
// - Jakarta EE standard
// - More powerful (events, interceptors)
// - Build-time optimization

// Spring DI:
// - Spring-specific
// - Simpler
// - Runtime processing
```

### Q2: Instance&lt;T&gt; vs Provider&lt;T&gt;?

- **Provider&lt;T&gt;**: Lazy đơn giản (chỉ `get()`). Dùng khi trì hoãn init 1 bean nặng hoặc lấy instance theo scope hiện tại.
- **Instance&lt;T&gt;**: Nhiều bean (Strategy/Plugin), optional dependency, select qualifier lúc runtime, destroy @Dependent thủ công.
- **Không cần cả hai**: Khi bean là Normal Scope (đã Lazy qua Proxy) và chỉ có 1 implementation -> `@Inject` thẳng.

### Q3: @Dependent khác gì ApplicationScoped?

- **@Dependent**: mỗi injection point một instance riêng, lifecycle gắn với bean chứa nó (pseudo-scope).
- **@ApplicationScoped**: một instance dùng chung toàn app (normal scope), inject qua **Client Proxy**.

### Q4: Client Proxy là gì?

- Là object trung gian mà CDI inject vào thay vì instance thật (với Normal Scope).
- Giúp lazy initialization và xử lý scope mismatch (VD: inject RequestScoped vào ApplicationScoped).
- Khi gọi method trên proxy, nó mới tìm instance thật trong context hiện tại để delegate.

---

## Best Practices

1. **Use CDI**: Standard, powerful
2. **Constructor injection**: Recommended
3. **Proper scopes**: Hiểu rõ Client Proxy vs Direct Reference.
4. **Package-private**: Trong Quarkus, nên để field/method injection là package-private (bỏ `private`) để tối ưu reflection.
5. **Use qualifiers**: For multiple implementations
6. **Instance/Provider**: Optional hoặc programmatic lookup khi cần
7. **Events**: Decoupled communication (dùng Async nếu task nặng)

---

## Tổng kết

- **CDI/ArC**: Build-time dependency injection.
- **Bean Scopes**: Normal (@ApplicationScoped) vs Pseudo (@Dependent).
- **Client Proxy**: Cơ chế inject của Normal scopes.
- **Advanced**: Alternatives, Stereotypes, Decorators.
- **Events**: Sync vs Async observers.
