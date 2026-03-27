# Interview & Checklist — Design Patterns

## Checklist Tự Kiểm Tra

### SOLID
- [ ] Giải thích **5 nguyên tắc SOLID** + ví dụ vi phạm + cách fix
- [ ] Liên hệ SOLID với Spring Boot (DI, @Transactional, interface-based)

### Creational
- [ ] **Singleton**: thread-safe implementation, Spring bean scope
- [ ] **Factory Method**: switch-case → Strategy/Factory, Spring Map injection
- [ ] **Builder**: khi nào dùng, Lombok @Builder, immutable objects

### Structural
- [ ] **Adapter**: tích hợp third-party, legacy migration
- [ ] **Decorator**: AOP, Spring @Cacheable/@Transactional
- [ ] **Facade**: simplify complex subsystem (OrderFacade)
- [ ] **Proxy**: JDK dynamic proxy, Spring AOP proxies

### Behavioral
- [ ] **Strategy**: nếu-thì → interface + injection, Spring Map<String, Interface>
- [ ] **Observer**: Spring @EventListener, Kafka events
- [ ] **Template Method**: JdbcTemplate, abstract class + hook methods
- [ ] **State**: order status machine, thay thế switch-case

### Architecture
- [ ] **Clean Architecture**: dependency rule, layers, domain isolation
- [ ] **Hexagonal**: ports (interfaces) & adapters (implementations)
- [ ] **DDD**: Bounded Context, Aggregate, Entity, Value Object, Repository, Domain Event
- [ ] **When NOT to use**: CRUD apps, small team, startup MVP

### Anti-patterns
- [ ] Nhận diện: God Class, Spaghetti, Premature Optimization
- [ ] Fix: SRP, extract method, "make it work first"

---

## Top Câu Hỏi Phỏng Vấn

### Patterns cơ bản

**Q: Strategy vs State pattern?**
> Strategy: chọn algorithm (discount calculation). State: behavior thay đổi theo trạng thái (order PENDING→PROCESSING→SHIPPED). Strategy = chọn once. State = thay đổi runtime.

**Q: Decorator vs Proxy?**
> Decorator: thêm behavior (logging, encryption). Proxy: kiểm soát access (cache, auth, lazy load). Decorator stack nhiều layers. Proxy thường wrap 1 lần.

**Q: Factory Method vs Abstract Factory?**
> Factory Method: tạo **1 loại** product (NotificationFactory). Abstract Factory: tạo **family** related products (MaterialUI → Button + Input + Dialog).

### Architecture

**Q: Khi nào dùng DDD?**
> Domain phức tạp (banking, logistics, e-commerce lớn). Team > 5 devs. Code thay đổi thường xuyên theo business. KHÔNG dùng cho: CRUD app, report tool, batch job đơn giản.

**Q: Aggregate Root rule quan trọng nhất?**
> Mọi thay đổi trong aggregate **ĐI QUA** root. Không truy cập internal entity trực tiếp. Đảm bảo invariants luôn đúng (ví dụ: tổng tiền = sum items).

**Q: 3 patterns bạn hay dùng nhất?**
> (1) **Strategy** — tránh if-else, mở rộng dễ. (2) **Builder** — object phức tạp, immutable. (3) **Observer/Event** — decouple services, Spring events.

---

**Quay lại:** [README.md](./README.md)
