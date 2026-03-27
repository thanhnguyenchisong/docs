# Structural Patterns — Patterns Cấu Trúc

## Mục lục
1. [Adapter](#adapter)
2. [Decorator](#decorator)
3. [Facade](#facade)
4. [Proxy](#proxy)
5. [Composite](#composite)
6. [Tổng hợp khi nào dùng](#tổng-hợp-khi-nào-dùng)

---

## Adapter

> Chuyển đổi interface của class **không tương thích** sang interface mà client mong đợi.

```java
// Legacy payment system (không đổi được)
public class LegacyPaymentGateway {
    public boolean makePayment(String account, double amount, String currency) { ... }
}

// Interface mong muốn
public interface PaymentProcessor {
    PaymentResult process(PaymentRequest request);
}

// Adapter: wrap legacy → new interface
public class LegacyPaymentAdapter implements PaymentProcessor {
    private final LegacyPaymentGateway legacy;

    public LegacyPaymentAdapter(LegacyPaymentGateway legacy) {
        this.legacy = legacy;
    }

    @Override
    public PaymentResult process(PaymentRequest request) {
        boolean success = legacy.makePayment(
            request.getAccountId(),
            request.getAmount().doubleValue(),
            request.getCurrency()
        );
        return success ? PaymentResult.success() : PaymentResult.failed("Legacy error");
    }
}
```

**Dùng khi**: Tích hợp third-party library, legacy system, API version migration.

---

## Decorator

> Thêm behavior cho object **dynamically** mà không sửa code gốc.

```java
// Base interface
public interface DataSource {
    void writeData(String data);
    String readData();
}

// Base implementation
public class FileDataSource implements DataSource {
    private final String filename;
    public void writeData(String data) { /* ghi file */ }
    public String readData() { /* đọc file */ }
}

// Decorator: thêm encryption
public class EncryptionDecorator implements DataSource {
    private final DataSource source;
    public EncryptionDecorator(DataSource source) { this.source = source; }

    public void writeData(String data) {
        source.writeData(encrypt(data));  // Encrypt trước khi ghi
    }
    public String readData() {
        return decrypt(source.readData());  // Decrypt sau khi đọc
    }
}

// Decorator: thêm compression
public class CompressionDecorator implements DataSource {
    private final DataSource source;
    public CompressionDecorator(DataSource source) { this.source = source; }

    public void writeData(String data) { source.writeData(compress(data)); }
    public String readData() { return decompress(source.readData()); }
}

// Sử dụng: stack decorators
DataSource source = new CompressionDecorator(
    new EncryptionDecorator(
        new FileDataSource("data.txt")
    )
);
source.writeData("secret data");
// Flow: compress → encrypt → write file
```

**Spring**: `@Transactional`, `@Cacheable`, `@Async` = AOP decorators.

---

## Facade

> Cung cấp **interface đơn giản** cho subsystem phức tạp.

```java
// Subsystems phức tạp
public class InventoryService { boolean checkStock(Long productId, int qty) { ... } }
public class PaymentService   { PaymentResult charge(String userId, BigDecimal amount) { ... } }
public class ShippingService  { String createShipment(Order order) { ... } }
public class NotificationService { void sendOrderConfirmation(Order order) { ... } }

// Facade: 1 method đơn giản che giấu 4 subsystems
@Service
public class OrderFacade {
    private final InventoryService inventory;
    private final PaymentService payment;
    private final ShippingService shipping;
    private final NotificationService notification;

    public OrderResult placeOrder(OrderRequest request) {
        // 1. Check stock
        if (!inventory.checkStock(request.getProductId(), request.getQty())) {
            return OrderResult.outOfStock();
        }
        // 2. Charge payment
        PaymentResult payResult = payment.charge(request.getUserId(), request.getTotal());
        if (!payResult.isSuccess()) return OrderResult.paymentFailed();
        // 3. Create shipment
        String trackingId = shipping.createShipment(request.toOrder());
        // 4. Notify
        notification.sendOrderConfirmation(request.toOrder());

        return OrderResult.success(trackingId);
    }
}
// Client chỉ gọi: orderFacade.placeOrder(request) — không cần biết subsystems
```

---

## Proxy

> Cung cấp **đại diện** cho object khác để kiểm soát truy cập.

```java
// Types of Proxy:
// 1. Protection Proxy — kiểm tra quyền
// 2. Virtual Proxy — lazy loading (load khi cần)
// 3. Caching Proxy — cache kết quả

// Caching Proxy
public interface ProductService {
    Product getProduct(Long id);
}

public class ProductServiceImpl implements ProductService {
    public Product getProduct(Long id) {
        return database.query("SELECT * FROM products WHERE id = ?", id);
    }
}

public class CachingProductProxy implements ProductService {
    private final ProductService real;
    private final Cache<Long, Product> cache;

    public Product getProduct(Long id) {
        Product cached = cache.get(id);
        if (cached != null) return cached;

        Product product = real.getProduct(id);  // Delegate
        cache.put(id, product);
        return product;
    }
}

// Spring: @Transactional, @Cacheable, @Async = JDK Dynamic Proxy / CGLIB Proxy
```

---

## Composite

> Tổ chức objects thành **cấu trúc cây** — xử lý từng object và nhóm objects giống nhau.

```java
// Component
public interface MenuItem {
    String getName();
    BigDecimal getPrice();
    void print(String indent);
}

// Leaf
public class Dish implements MenuItem {
    private final String name;
    private final BigDecimal price;
    public void print(String indent) {
        System.out.println(indent + name + " - " + price + "₫");
    }
}

// Composite
public class MenuCategory implements MenuItem {
    private final String name;
    private final List<MenuItem> items = new ArrayList<>();

    public void add(MenuItem item) { items.add(item); }

    public BigDecimal getPrice() {
        return items.stream().map(MenuItem::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void print(String indent) {
        System.out.println(indent + "📁 " + name);
        items.forEach(item -> item.print(indent + "  "));
    }
}

// Sử dụng
MenuCategory menu = new MenuCategory("Main Menu");
MenuCategory drinks = new MenuCategory("Đồ uống");
drinks.add(new Dish("Cà phê", new BigDecimal("35000")));
drinks.add(new Dish("Trà đá", new BigDecimal("10000")));
menu.add(drinks);
menu.add(new Dish("Phở", new BigDecimal("55000")));
menu.print("");
```

**Dùng khi**: File system, menu, organizational chart, UI component tree.

---

## Tổng Hợp Khi Nào Dùng

| Pattern | Khi nào | Ví dụ thực tế |
|---------|---------|---------------|
| **Adapter** | Tích hợp legacy/third-party | Payment adapter, API version adapter |
| **Decorator** | Thêm behavior dynamically | Logging, encryption, compression |
| **Facade** | Đơn giản hóa subsystem phức tạp | OrderFacade, CheckoutFacade |
| **Proxy** | Kiểm soát truy cập, cache, lazy load | Spring AOP, @Cacheable, @Transactional |
| **Composite** | Cấu trúc cây, xử lý đồng nhất | Menu, file system, org chart |

---

**Tiếp theo:** [04-Behavioral-Patterns.md](./04-Behavioral-Patterns.md)
