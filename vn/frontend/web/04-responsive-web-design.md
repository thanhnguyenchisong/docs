# Responsive Web Design

Thiết kế web thích ứng mọi kích thước màn hình: mobile-first, breakpoints, media queries, viewport, responsive images. Senior cần nắm để ship UI đa thiết bị.

## Mục lục
1. [Viewport và meta](#viewport-và-meta)
2. [Mobile-first](#mobile-first)
3. [Media queries](#media-queries)
4. [Breakpoints và chiến lược](#breakpoints-và-chiến-lược)
5. [Responsive images](#responsive-images)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Viewport và meta

Trên mobile, trình duyệt mặc định render trang như desktop rồi thu nhỏ (zoom out) nếu không có viewport. Cần meta để **viewport = thiết bị**:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- **width=device-width**: Chiều rộng layout = chiều rộng device.
- **initial-scale=1**: Tỷ lệ zoom ban đầu 1:1.
- Có thể thêm `maximum-scale=1` để chặn zoom (tránh dùng nếu ảnh hưởng a11y).

---

## Mobile-first

Viết CSS cho **màn hình nhỏ trước**, sau đó dùng **min-width** media query để nâng cấp cho màn lớn. Ưu điểm: base đơn giản, màn lớn chỉ thêm rule, tránh override rối.

```scss
// Base = mobile
.container { padding: 0 1rem; }
.grid { grid-template-columns: 1fr; }

@media (min-width: 768px) {
  .container { max-width: 720px; margin: 0 auto; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

Desktop-first (max-width) vẫn dùng được nhưng thường nhiều override hơn.

---

## Media queries

- **min-width / max-width**: Theo chiều rộng viewport.
- **min-height / max-height**: Theo chiều cao.
- **orientation: portrait | landscape**.
- **prefers-reduced-motion**: Giảm animation cho user cần (a11y).
- **prefers-color-scheme: dark**: Dark mode.

```scss
@media (min-width: 768px) and (max-width: 1023px) {
  /* tablet */
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## Breakpoints và chiến lược

Không có chuẩn cứng; thường theo framework hoặc thiết kế. Ví dụ:

| Tên | min-width | Ghi chú |
|-----|-----------|---------|
| sm  | 576px     | Phone ngang / phablet |
| md  | 768px     | Tablet |
| lg  | 992px     | Desktop nhỏ |
| xl  | 1200px    | Desktop lớn |

Dùng biến SCSS cho breakpoint:

```scss
$sm: 576px;
$md: 768px;
$lg: 992px;

@mixin up($name) {
  @if $name == sm { @media (min-width: $sm) { @content; } }
  @else if $name == md { @media (min-width: $md) { @content; } }
  // ...
}
```

**Container responsive**: max-width + margin auto; padding hai bên. Grid/Flex với gap; có thể dùng `clamp()` cho font/spacing.

---

## Responsive images

- **srcset + sizes**: Cung cấp nhiều kích thước ảnh, browser chọn theo viewport và pixel density.

```html
<img
  src="img-800.jpg"
  srcset="img-400.jpg 400w, img-800.jpg 800w, img-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
  alt="Mô tả"
/>
```

- **picture**: Chọn ảnh theo media (art direction, format WebP/AVIF).

```html
<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="Mô tả" />
</picture>
```

- **object-fit**: `cover`, `contain` khi ảnh trong khung cố định (aspect-ratio).

---

## Câu hỏi thường gặp

**Mobile-first vs desktop-first?**  
Mobile-first: base nhỏ, mở rộng dần (min-width) — dễ đọc, ít override. Desktop-first phù hợp khi design bắt đầu từ desktop.

**Breakpoint nên đặt theo thiết bị hay theo nội dung?**  
Ưu tiên **theo nội dung**: breakpoint nơi layout “gãy” hoặc cần thay đổi (container, grid cột). Tránh chỉ theo 320/768/1024 cố định nếu thiết kế không khớp.

**vw có gây scroll ngang không?**  
Có. 100vw bao gồm scrollbar; dùng 100% hoặc calc(100vw - scrollbar) nếu cần. Tránh padding/margin cộng với 100vw gây overflow.

**Responsive table?**  
Ẩn cột phụ trên mobile; hoặc đổi layout (card thay vì bảng); hoặc scroll ngang có kiểm soát (overflow-x: auto, min-width trên table).

---

→ Tiếp theo: [05 - Reactive Programming](05-reactive-programming.md)
