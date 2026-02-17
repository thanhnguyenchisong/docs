# CSS Layout: Flexbox & Grid

Flexbox và Grid là hai công cụ layout chính. Senior cần biết khi nào dùng từng cái và thuộc tính quan trọng.

## Mục lục
1. [Flexbox](#flexbox)
2. [Grid](#grid)
3. [Positioning](#positioning)
4. [Khi nào dùng Flexbox vs Grid](#khi-nào-dùng-flexbox-vs-grid)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Flexbox

**Một chiều** (row hoặc column). Container: `display: flex` (hoặc `inline-flex`).

### Container (parent)

| Property | Ý nghĩa |
|----------|---------|
| `flex-direction` | `row` \| `row-reverse` \| `column` \| `column-reverse` |
| `flex-wrap` | `nowrap` \| `wrap` \| `wrap-reverse` |
| `justify-content` | Căn theo trục chính: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly` |
| `align-items` | Căn theo trục vuông góc: `stretch`, `flex-start`, `flex-end`, `center`, `baseline` |
| `align-content` | Khi có nhiều dòng (wrap): căn các dòng với nhau |
| `gap` | Khoảng cách giữa các item |

### Item (children)

| Property | Ý nghĩa |
|----------|---------|
| `flex-grow` | Tỉ lệ không gian còn lại chia cho item (0 = không lớn) |
| `flex-shrink` | Tỉ lệ co lại khi thiếu chỗ (0 = không co) |
| `flex-basis` | Kích thước gốc trước khi grow/shrink |
| `flex` | Shorthand: `flex-grow flex-shrink flex-basis` (ví dụ `1 1 auto`) |
| `align-self` | Override align-items cho item đó |
| `order` | Thứ tự hiển thị (số nhỏ trước) |

```css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.flex-item {
  flex: 1 1 200px; /* grow shrink basis */
}
```

---

## Grid

**Hai chiều** (hàng + cột). Container: `display: grid`.

### Container

| Property | Ví dụ |
|----------|--------|
| `grid-template-columns` | `1fr 1fr 1fr`, `repeat(3, 1fr)`, `200px 1fr auto` |
| `grid-template-rows` | Tương tự |
| `gap` / `row-gap`, `column-gap` | Khoảng cách ô |
| `justify-items`, `align-items` | Căn nội dung trong ô |
| `justify-content`, `align-content` | Căn grid trong container khi grid nhỏ hơn vùng chứa |
| `grid-template-areas` | Đặt tên vùng, item dùng `grid-area` |

### Item

| Property | Ví dụ |
|----------|--------|
| `grid-column` | `1 / 3`, `span 2` |
| `grid-row` | Tương tự |
| `grid-area` | Tên vùng (template-areas) hoặc row-start / col-start / row-end / col-end |

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.item-wide {
  grid-column: span 2;
}
```

- **minmax(200px, 1fr)**: Cột tối thiểu 200px, tối đa 1fr — responsive không cần nhiều breakpoint.
- **auto-fill / auto-fit**: Tự tạo cột theo kích thước; auto-fit gộp cột trống.

---

## Positioning

| Value | Ý nghĩa |
|-------|---------|
| `static` | Mặc định, theo flow. |
| `relative` | Giữ chỗ trong flow; dùng top/left/right/bottom để dịch so với vị trí gốc. |
| `absolute` | Lấy khỏi flow; vị trí so với **containing block** (ancestor có position khác static). |
| `fixed` | So với viewport; không scroll. |
| `sticky` | Hybrid: trong flow cho đến khi scroll tới ngưỡng (top/left...) rồi “dính” như fixed. |

**z-index**: Chỉ có hiệu lực khi element có `position` khác `static`. Stacking context: mỗi layer (opacity, transform, position...) tạo context riêng.

---

## Khi nào dùng Flexbox vs Grid

- **Flexbox**: Layout **một chiều** — nav ngang, card list căn đều, form một hàng, căn giữa theo chiều dọc/ngang. Component nhỏ (button group, header).
- **Grid**: Layout **hai chiều** — trang có header/sidebar/main/footer, gallery đều ô, form nhiều cột. Layout tổng thể trang.
- **Kết hợp**: Container dùng Grid chia vùng; bên trong từng vùng dùng Flexbox cho nội dung.

---

## Câu hỏi thường gặp

**flex: 1 nghĩa là gì?**  
Shorthand cho `flex: 1 1 0%` — grow=1, shrink=1, basis=0 → các item chia đều không gian còn lại.

**1fr trong Grid?**  
Đơn vị phân số: phần còn lại của grid. `1fr 2fr` = 1 phần và 2 phần.

**sticky không hoạt động?**  
Cha không được overflow: hidden; sticky cần có top/left/right/bottom; containing block phải đủ cao để có chỗ “scroll” rồi mới dính.

**Căn giữa tuyệt đối (vertical + horizontal)?**  
Flex: `display: flex; justify-content: center; align-items: center;` trên container. Hoặc Grid: `display: grid; place-items: center;`. Hoặc absolute + transform (cách cũ).

---

→ Tiếp theo: [03 - SCSS / Sass](03-scss-sass.md)
