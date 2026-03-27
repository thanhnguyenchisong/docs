# Code Review — Best Practices

## Mục đích Code Review

| Mục đích | Mô tả |
|---------|--------|
| **Chất lượng** | Bắt bugs, thiếu edge cases, security issues |
| **Kiến thức** | Chia sẻ knowledge across team |
| **Consistency** | Đảm bảo coding standards, patterns |
| **Mentoring** | Senior review junior → học qua feedback |

## Checklist Review

### Correctness
- [ ] Logic đúng không? Edge cases?
- [ ] Error handling có đầy đủ? (null, empty, timeout)
- [ ] Thread-safe nếu concurrent?
- [ ] Idempotent nếu retry?

### Design
- [ ] Single Responsibility? Class quá lớn?
- [ ] Naming rõ ràng? (method tên nói lên nó làm gì)
- [ ] Tránh magic numbers? Dùng constants/enums?
- [ ] Interface vs implementation?

### Performance
- [ ] N+1 queries?
- [ ] Missing index cho query mới?
- [ ] Memory leak? (stream không close, listener không remove)
- [ ] Batch operations thay vì loop?

### Security
- [ ] Input validation? SQL injection? XSS?
- [ ] Sensitive data có bị log không?
- [ ] Authorization check đúng endpoint?

### Testing
- [ ] Có test cho logic mới?
- [ ] Edge cases được test?
- [ ] Test tên rõ ràng (đọc tên biết test gì)?

## Cách Viết Feedback

```
❌ "Code sai rồi"
❌ "Tại sao viết thế này?"
❌ "Code đọc không hiểu gì"

✅ "Nit: có thể dùng Optional.map() thay vì if-null check, đọc gọn hơn"
✅ "Question: pattern này có lý do cụ thể không? Mình nghĩ Strategy pattern fit hơn vì..."
✅ "Suggestion: xem xét thêm @Transactional(readOnly=true) cho query method — tối ưu connection"
✅ "Blocker: method này không thread-safe, nếu concurrent → data race. Cần synchronized hoặc ConcurrentMap"
```

### Prefix convention

| Prefix | Nghĩa | Block merge? |
|-------|--------|-------------|
| **Blocker** | Bug, security, data loss | ✅ Phải sửa |
| **Suggestion** | Cải thiện nhưng không bắt buộc | ❌ Optional |
| **Nit** | Style, formatting, nitpick | ❌ Optional |
| **Question** | Hỏi để hiểu, không phải phê bình | ❌ Discussion |

## Author Best Practices

- PR **nhỏ** (< 400 dòng). Lớn quá → chia nhỏ
- **Description** rõ ràng: what, why, how, testing
- **Self-review** trước khi request review
- Respond **mọi comment** — đó là respect
