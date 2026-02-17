# CSS Layout: Flexbox & Grid

Flexbox và Grid là hai công cụ layout chính. Senior cần biết khi nào dùng từng cái và thuộc tính quan trọng.

## Mục lục
1. [Ví dụ trực quan: Flexbox + Grid trong một trang](#ví-dụ-trực-quan-flexbox--grid-trong-một-trang)
2. [Flexbox](#flexbox)
3. [Grid](#grid)
4. [Positioning](#positioning)
5. [Khi nào dùng Flexbox vs Grid](#khi-nào-dùng-flexbox-vs-grid)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Ví dụ trực quan: Flexbox + Grid trong một trang

Copy toàn bộ đoạn dưới vào file `demo-layout.html` và mở bằng trình duyệt. Bạn sẽ thấy:

- **Thanh nav ngang** (Flexbox): ba link nằm trên một hàng, cách đều nhau (`justify-content: space-between`), căn giữa theo chiều dọc (`align-items: center`).
- **Khối nội dung dạng lưới** (Grid): 4 ô chia đều 2 cột x 2 hàng, có khoảng cách (`gap`). Ô “Nội dung rộng” chiếm 2 cột (`grid-column: span 2`).

**Thử:** Đổi `justify-content: space-between` thành `center` hoặc `flex-end` rồi F5 — vị trí các link thay đổi. Đổi `grid-template-columns: 1fr 1fr` thành `1fr 2fr 1fr` (và thêm ô nếu cần) để thấy tỉ lệ cột thay đổi.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Demo Flexbox & Grid</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: sans-serif; margin: 0; padding: 1rem; }

    /* Flexbox: thanh nav một hàng, căn đều */
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #f0f0f0;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .nav a { color: #1976d2; text-decoration: none; }

    /* Grid: lưới 2 cột, có gap */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .grid > div {
      padding: 1rem;
      background: #e3f2fd;
      border-radius: 8px;
      border: 1px solid #90caf9;
    }
    .wide { grid-column: span 2; background: #bbdefb !important; }
  </style>
</head>
<body>
  <nav class="nav">
    <span>Logo</span>
    <a href="#">Trang chủ</a>
    <a href="#">Sản phẩm</a>
    <a href="#">Liên hệ</a>
  </nav>
  <div class="grid">
    <div>Ô 1</div>
    <div>Ô 2</div>
    <div class="wide">Nội dung rộng (span 2 cột)</div>
    <div>Ô 4</div>
  </div>
</body>
</html>
```

Mở **F12 → Elements**, click vào `.nav` hoặc `.grid` và xem bên phải giá trị `display: flex` / `display: grid` và các thuộc tính con — giúp bạn liên hệ trực tiếp giữa code và giao diện.

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
