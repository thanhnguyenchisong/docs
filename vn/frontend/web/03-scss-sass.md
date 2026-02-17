# SCSS / Sass

Sass (SCSS) bổ sung biến, nesting, mixins, functions, module — giúp CSS dễ bảo trì và tái sử dụng. Senior cần dùng thành thạo trong project thật.

## Mục lục
1. [SCSS/Sass là gì? (Cho người mới)](#scsssass-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Trước và sau khi dùng SCSS](#ví-dụ-trực-quan-trước-và-sau-khi-dùng-scss)
3. [Biến (variables)](#biến-variables)
4. [Nesting](#nesting)
5. [Mixins](#mixins)
6. [Functions](#functions)
7. [Partials và import](#partials-và-import)
8. [Best practices](#best-practices)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SCSS/Sass là gì? (Cho người mới)

- **CSS thuần** không có biến (màu, cỡ chữ lặp đi lặp lại), không có “hàm” hay “đoạn code dùng lại” — file lớn rất khó sửa (đổi một màu chủ đạo phải tìm thay từng chỗ).
- **Sass** là ngôn ngữ mở rộng CSS: viết file `.scss`, sau đó **biên dịch** (compile) ra file `.css` để trình duyệt đọc. **SCSS** là cú pháp Sass giống CSS nhất (dùng dấu `{}` và `;`), nên thường gọi “SCSS” khi nói đến file.
- Bạn được thêm: **biến** (màu, spacing, breakpoint), **nesting** (lồng selector theo cấu trúc HTML), **mixins** (đoạn CSS tái sử dụng, có tham số), **functions** (tính toán giá trị như rem, làm tối/sáng màu). Angular CLI đã hỗ trợ SCSS: khi tạo project hoặc component chọn style SCSS là xong.

---

## Ví dụ trực quan: Trước và sau khi dùng SCSS

**Trước (CSS thuần):** Màu `#1976d2` và padding `8px` lặp nhiều chỗ. Đổi theme = sửa rất nhiều dòng.

```css
.btn { background: #1976d2; padding: 8px 16px; }
.card { border: 1px solid #1976d2; }
.link { color: #1976d2; }
```

**Sau (SCSS):** Một biến `$primary`, đổi một dòng là đổi toàn bộ. Nesting giúp nhóm style của `.card` và con `.card__title` trong một khối.

```scss
$primary: #1976d2;
$spacing: 8px;

.btn { background: $primary; padding: $spacing $spacing * 2; }
.card {
  border: 1px solid $primary;
  &__title { font-size: 1.25rem; }
}
.link { color: $primary; }
```

**Thử:** Trong project Angular, tạo component với `ng g c demo-scss --style=scss`. Trong file `demo-scss.component.scss` đặt `$color: #28a745;` rồi dùng trong `.demo { color: $color; }` — bạn sẽ thấy SCSS biên dịch ra CSS khi `ng serve`. Đổi `$color` và lưu → giao diện đổi theo.

---

## Biến (variables)

Dùng `$tên: giá trị;`. Dùng cho màu, font, spacing, breakpoint.

```scss
$primary: #1976d2;
$font-base: 16px;
$spacing-unit: 8px;
$breakpoint-md: 768px;

.button {
  background: $primary;
  padding: $spacing-unit $spacing-unit * 2;
}
```

---

## Nesting

Lồng selector theo cấu trúc HTML. Dùng **&** để tham chiếu parent (pseudo-class, modifier, BEM).

```scss
.card {
  padding: 1rem;
  &__title {
    font-size: 1.25rem;
  }
  &--featured {
    border: 2px solid $primary;
  }
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}
```

Tránh nest quá sâu (tối đa 3–4 cấp) → specificity cao, khó override.

---

## Mixins

Đoạn CSS tái sử dụng, có thể nhận tham số. Dùng cho clearfix, responsive, truncate, flex center...

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

.wrapper {
  @include flex-center;
}
.sidebar {
  width: 100%;
  @include respond-to($breakpoint-md) {
    width: 280px;
  }
}
```

`@content`: chỗ chèn block CSS khi include mixin.

---

## Functions

Hàm trả về **một giá trị** (màu, số). Dùng cho tính toán, darken/lighten, rem()...

```scss
@use 'sass:color';
@use 'sass:math';

@function rem($px, $base: 16) {
  @return math.div($px, $base) * 1rem;
}

.button {
  font-size: rem(14);
  background: $primary;
  &:hover {
    background: color.scale($primary, $lightness: 10%);
  }
}
```

Sass module: `@use 'sass:color'` thay cho `@import` (cách cũ).

---

## Partials và import

- **Partial**: File SCSS bắt đầu bằng `_` (ví dụ `_variables.scss`) — không compile ra file CSS riêng.
- **@use** (khuyến nghị): Load module một lần, dùng namespace. `@use 'variables'` → `variables.$primary`.
- **@forward**: Re-export biến/mixin/function từ file khác (dùng trong file “index” của theme).

```scss
// _variables.scss
$primary: #1976d2;

// main.scss
@use 'variables';
.btn {
  background: variables.$primary;
}
```

---

## Best practices

- Đặt tên biến rõ ràng (màu, spacing, breakpoint). Tránh tên chung chung.
- Nest vừa phải; ưu tiên class phẳng khi có thể.
- Mixin cho **pattern** (responsive, center); function cho **giá trị** (rem, màu).
- Dùng **@use** thay @import để tránh global và trùng tên.
- Tách file: _variables, _mixins, _base, components.

---

## Câu hỏi thường gặp

**@use và @import khác nhau thế nào?**  
@use load module, có namespace, chỉ load một lần. @import copy nội dung vào file, global, dễ trùng tên. Sass khuyến nghị @use.

**Mixin vs function?**  
Mixin output nhiều rule CSS (có thể chứa selector). Function trả về một giá trị (dùng trong property).

**& trong nesting?**  
Tham chiếu selector cha. Ví dụ `.card { &:hover { } }` → `.card:hover`.

**Khi nào dùng @forward?**  
Khi có file tổng (ví dụ _theme.scss) muốn “re-export” nhiều partial để app chỉ cần @use 'theme' và dùng theme.$primary, theme.mixin...

---

→ Tiếp theo: [04 - Responsive Web Design](04-responsive-web-design.md)
