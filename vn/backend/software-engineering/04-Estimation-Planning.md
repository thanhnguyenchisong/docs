# Estimation & Planning

## Story Points

| Points | Complexity | Ví dụ |
|--------|-----------|-------|
| **1** | Trivial | Đổi text, fix typo |
| **2** | Simple | Thêm field, simple validation |
| **3** | Medium | Implement CRUD endpoint |
| **5** | Complex | New feature with business logic |
| **8** | Very complex | Integration with external service |
| **13** | Huge | Refactor module, new architecture component |
| **21** | Epic | → Chia nhỏ! Quá lớn để estimate |

## Estimation Techniques

### Planning Poker
Team vote story points đồng thời → discuss nếu khác xa → vote lại.

### T-shirt Sizing
XS, S, M, L, XL → map sang story points (XS=1, S=2, M=3-5, L=8, XL=13+).

### 3-Point Estimation
```
Estimate = (Optimistic + 4×MostLikely + Pessimistic) / 6
Ví dụ: (2 + 4×5 + 12) / 6 = 5.67 ≈ 6 ngày
```

## Velocity & Capacity

```
Sprint 1: 35 points completed
Sprint 2: 32 points completed
Sprint 3: 38 points completed
Average velocity: 35 points/sprint

Next sprint capacity:
- 5 devs × 10 days = 50 person-days
- Minus meetings, reviews, support: ~60% = 30 person-days
- Commit ~35 points
```

## Câu Hỏi Phỏng Vấn

### Estimate task lớn thế nào?
> Chia nhỏ thành tasks < 5 points. Estimate từng task. Tổng + buffer 20-30% cho unknown. Dùng 3-point estimation nếu uncertainty cao. Track velocity để cải thiện.
