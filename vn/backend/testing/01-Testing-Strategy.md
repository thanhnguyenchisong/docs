# Testing Strategy — Chiến Lược Test

## Test Pyramid

```
        ╱ ╲
       ╱ E2E╲          5-10%   — Chậm, đắt, ít
      ╱───────╲
     ╱Integratn╲       20-30%  — Trung bình
    ╱───────────╲
   ╱  Unit Tests ╲     60-70%  — Nhanh, rẻ, nhiều
  ╱───────────────╲
```

| Loại | Scope | Tốc độ | Dependency | Khi nào dùng |
|------|-------|--------|------------|-------------|
| **Unit** | 1 class/method | ms | Mock tất cả | Business logic, calculations |
| **Integration** | Nhiều layers | giây | Real DB (Testcontainers) | API endpoints, DB queries |
| **Contract** | API boundary | giây | Mock/stub | Microservices communication |
| **E2E** | Full system | phút | Real services | Critical user flows |
| **Performance** | System | phút-giờ | Real hoặc staging | Load, stress, soak |

## TDD — Test-Driven Development

```
1. RED    — Viết test TRƯỚC (test fail vì chưa có code)
2. GREEN  — Viết code TỐI THIỂU để test pass
3. REFACTOR — Cải thiện code, test vẫn pass
→ Lặp lại
```

```java
// 1. RED: viết test trước
@Test
void shouldCalculateOrderTotal() {
    Order order = new Order();
    order.addItem(new OrderItem("A", 2, Money.of(50000)));
    order.addItem(new OrderItem("B", 1, Money.of(30000)));
    assertThat(order.getTotal()).isEqualTo(Money.of(130000)); // 2×50K + 1×30K
}

// 2. GREEN: implement tối thiểu
public Money getTotal() {
    return items.stream()
        .map(item -> item.getPrice().multiply(item.getQuantity()))
        .reduce(Money.ZERO, Money::add);
}

// 3. REFACTOR: extract, rename, optimize nếu cần
```

## What To Test vs What NOT To Test

```
✅ Test:
- Business logic, calculations, validations
- Edge cases, error handling
- State transitions
- API contracts (input/output)
- Database queries (complex ones)

❌ Don't test:
- Getters/setters
- Framework code (Spring, JPA — đã được test)
- Private methods (test qua public API)
- Configuration
- Trivial code
```

## Câu Hỏi Phỏng Vấn

### Unit test vs Integration test?
> Unit: test 1 class, mock dependencies, nhanh (ms), chạy mọi lúc. Integration: test nhiều layers (Controller+Service+DB), chậm hơn (giây), dùng real dependencies.

### TDD có bắt buộc không?
> Không bắt buộc mọi lúc. TDD tốt nhất khi: domain logic phức tạp, refactoring, bug fix (viết test reproduce bug trước). Không cần cho: CRUD, UI, prototype.
