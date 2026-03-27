# Technical Debt — Nợ Kỹ Thuật

## Technical Debt Là Gì?

> Những shortcut trong code tạo ra **chi phí bảo trì dài hạn**. Như vay tiền — phải trả lãi.

| Loại | Ví dụ | Lãi suất |
|------|-------|---------|
| **Deliberate** | "Ship nhanh, refactor sau" — biết trước | Có kế hoạch trả |
| **Accidental** | Code không tốt do thiếu kinh nghiệm | Phát hiện muộn |
| **Bit rot** | Code cũ, dependency outdated, patterns lỗi thời | Tích lũy dần |

## Identify Tech Debt

```
Dấu hiệu:
- Build time tăng liên tục
- Bug fix mất ngày thay vì giờ
- "Sợ" sửa code vùng này (fragile code)
- Onboard dev mới mất tuần chỉ để hiểu code
- Duplicate code khắp nơi
- Tests chạy hàng giờ
- "Workaround" comments khắp nơi
```

## Quadrant Model

```
           Deliberate            Accidental
         ┌────────────────────┬────────────────────┐
Prudent  │ "Biết đây là       │ "Giờ mới biết      │
         │  shortcut, sẽ      │  cách tốt hơn"     │
         │  refactor sprint   │                     │
         │  sau"              │                     │
         ├────────────────────┼────────────────────┤
Reckless │ "Không có thời     │ "Clean Architecture│
         │  gian cho design"  │  là gì?"            │
         │                    │                     │
         └────────────────────┴────────────────────┘
```

## Quản Lý Tech Debt

### 1. Track

```
// Trong code: TODO/FIXME tag
// TECH-DEBT-123: Extract này thành service riêng khi refactor user module
// Ref: https://jira.example.com/TECH-123

// Trong Jira/Linear: label "tech-debt", estimate effort
```

### 2. Prioritize

```
Impact × Frequency = Priority

High Impact + High Frequency → FIX NOW (sprint này)
High Impact + Low Frequency → PLAN (next sprint)
Low Impact + High Frequency → BATCH (tech debt sprint)
Low Impact + Low Frequency → BACKLOG (khi rảnh)
```

### 3. Pay Down

```
- 20% rule: mỗi sprint dành 20% capacity cho tech debt
- Boy Scout rule: "Leave the code better than you found it"
- Strangler pattern: gradually replace old code
- Big rewrite: AVOID — thường fail. Incremental tốt hơn.
```

## Câu Hỏi Phỏng Vấn

### Quản lý tech debt thế nào?
> (1) Track bằng Jira labels / TODO tags, (2) Ưu tiên theo impact × frequency, (3) Dành 20% mỗi sprint, (4) Boy Scout rule cho small improvements. KHÔNG để tích lũy quá lâu.
