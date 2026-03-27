# Anti-Patterns — Những Sai Lầm Thiết Kế

## Mục lục
1. [God Class / God Object](#god-class--god-object)
2. [Spaghetti Code](#spaghetti-code)
3. [Premature Optimization](#premature-optimization)
4. [Cargo Cult Programming](#cargo-cult-programming)
5. [Golden Hammer](#golden-hammer)
6. [Lava Flow](#lava-flow)
7. [Còn nhiều anti-patterns khác](#còn-nhiều-anti-patterns-khác)

---

## God Class / God Object

> Một class **làm quá nhiều việc**, biết quá nhiều, kiểm soát quá nhiều.

```java
// ❌ God Class: 2000+ dòng, 50+ methods, biết tất cả
public class ApplicationManager {
    public void createUser(...) { ... }
    public void deleteUser(...) { ... }
    public void sendEmail(...) { ... }
    public void generateReport(...) { ... }
    public void processPayment(...) { ... }
    public void updateInventory(...) { ... }
    public void calculateTax(...) { ... }
    public void exportToCsv(...) { ... }
    // ... 42 methods nữa
}

// ✅ Fix: tách thành nhiều class, mỗi class 1 trách nhiệm (SRP)
public class UserService { ... }
public class EmailService { ... }
public class ReportService { ... }
public class PaymentService { ... }
```

**Dấu hiệu**: File > 500 dòng, class inject > 7 dependencies, tên class chung chung ("Manager", "Processor", "Helper").

---

## Spaghetti Code

> Code **không cấu trúc**, logic rối, if-else lồng nhau sâu, không tách function.

```java
// ❌ Spaghetti
public void processOrder(Order order) {
    if (order != null) {
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            double total = 0;
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    if (item.getProduct().getStock() >= item.getQty()) {
                        if (item.getProduct().getPrice() > 0) {
                            total += item.getProduct().getPrice() * item.getQty();
                            if (order.getUser().isVip()) {
                                total *= 0.9;
                                // ... thêm 50 dòng nữa
                            }
                        }
                    }
                }
            }
        }
    }
}

// ✅ Fix: Guard clauses + extract methods + early return
public void processOrder(Order order) {
    validateOrder(order);
    BigDecimal total = calculateTotal(order);
    BigDecimal finalPrice = applyDiscount(total, order.getUser());
    chargePayment(order.getUser(), finalPrice);
}

private void validateOrder(Order order) {
    Objects.requireNonNull(order, "Order cannot be null");
    if (order.getItems().isEmpty()) throw new EmptyOrderException();
    order.getItems().forEach(this::validateItem);
}
```

---

## Premature Optimization

> Tối ưu **quá sớm**, trước khi biết bottleneck ở đâu.

```java
// ❌ Premature: optimize khi chưa cần, code khó đọc
public class UserService {
    // "Cache cho nhanh" — nhưng chỉ có 100 users, DB query 2ms
    private final Map<Long, User> userCache = new ConcurrentHashMap<>();
    private final Map<Long, AtomicLong> accessCounter = new ConcurrentHashMap<>();
    // ... 200 dòng cache logic cho feature chưa ai dùng

    // "Bit manipulation cho nhanh" — nhưng chỉ chạy 10 lần/ngày
    public int calculateDiscount(int price, int tier) {
        return price - (price >> tier); // Khó hiểu, save 0.001ms
    }
}

// ✅ Nguyên tắc: "Make it work, make it right, make it fast"
public class UserService {
    public User getUser(Long id) {
        return userRepository.findById(id) // Đơn giản, đúng
            .orElseThrow(() -> new UserNotFoundException(id));
    }
    // Tối ưu SAU khi có EVIDENCE (profiling, metrics) cho thấy bottleneck
}
```

> *"Premature optimization is the root of all evil"* — Donald Knuth

---

## Cargo Cult Programming

> Copy code/pattern mà **không hiểu tại sao** dùng.

```java
// ❌ Cargo Cult: dùng microservices cho app CRUD đơn giản
// "Netflix dùng microservices nên mình cũng phải dùng"
// Kết quả: 20 services cho app quản lý nhân sự 50 users

// ❌ Dùng Kafka cho 10 messages/phút
// "Shopee dùng Kafka nên mình cũng dùng"

// ❌ Copy-paste design pattern mà không hiểu context
// Dùng Abstract Factory cho 1 loại product duy nhất
```

**Fix**: Hiểu **bài toán trước**, chọn tool/pattern PHÙ HỢP. Simple problems → simple solutions.

---

## Golden Hammer

> Có một tool yêu thích → **dùng cho mọi thứ**.

```
"Tôi biết Redis → cache mọi thứ bằng Redis"
  - Session → Redis ✅
  - Queue → Redis (nên dùng Kafka/RabbitMQ) ❌
  - Search → Redis (nên dùng Elasticsearch) ❌
  - Database → Redis (nên dùng PostgreSQL) ❌

"Tôi biết microservices → mọi project đều microservices"
  - Startup 3 người → monolith đủ rồi
```

---

## Lava Flow

> Code cũ **không ai dám xóa** vì không ai biết nó làm gì, "sợ xóa sẽ hỏng".

```java
// ❌ Lava Flow: dead code tồn tại years
public class OrderService {
    // TODO: remove after migration (written 2019)
    @Deprecated
    public void processOrderLegacy_v1(Order order) { ... }

    // Old implementation, keeping just in case
    // public void processOrder_backup(Order order) { ... }

    // FIXME: not sure if this is still used
    public void syncInventoryOld() { ... }
}
```

**Fix**: Delete dead code (git giữ history). Viết tests trước khi xóa → nếu tests pass → safe to delete.

---

## Còn Nhiều Anti-Patterns Khác

| Anti-pattern | Mô tả |
|-------------|--------|
| **Magic Numbers** | Dùng số không tên: `if (status == 3)` → dùng enum/constant |
| **Copy-Paste** | Copy code thay vì extract method/class → DRY violation |
| **Boat Anchor** | Code tồn tại "phòng khi cần" nhưng không bao giờ dùng |
| **Inner-platform Effect** | Build lại framework trong framework (custom ORM trong Spring) |
| **Analysis Paralysis** | Phân tích quá nhiều, không bao giờ code |

---

**Tiếp theo:** [08-Interview-Checklist.md](./08-Interview-Checklist.md)
