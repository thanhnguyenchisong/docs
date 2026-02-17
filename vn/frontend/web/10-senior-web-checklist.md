# Checklist Senior Web — Tự kiểm tra trước phỏng vấn

Sau khi học xong 01–09, dùng checklist này để tự hỏi/đáp. **Trả lời rõ ràng hầu hết** = sẵn sàng đi phỏng vấn senior web/front-end và **pass** các câu kỹ thuật nền (CSS, SCSS, responsive, reactive, a11y, performance, security).

---

## CSS & Layout

- [ ] **Specificity** tính thế nào? Làm sao override rule có specificity cao (không dùng !important)?
- [ ] **Box model**: content-box vs border-box; tại sao thường set global border-box?
- [ ] **rem vs em**: Khác nhau, khi nào dùng từng cái?
- [ ] **Flexbox**: justify-content vs align-items; flex: 1 nghĩa là gì?
- [ ] **Grid**: 1fr là gì? minmax(200px, 1fr) dùng để làm gì?
- [ ] **Flexbox vs Grid**: Khi nào chọn Flexbox, khi nào Grid? Có thể kết hợp không?
- [ ] **position: sticky** không hoạt động thường do nguyên nhân gì?
- [ ] **Căn giữa** (vertical + horizontal) bằng Flexbox và Grid như thế nào?

---

## SCSS / Sass

- [ ] **Biến** SCSS dùng cho gì? Ví dụ breakpoint, màu.
- [ ] **&** trong nesting nghĩa là gì? Ví dụ BEM (block__element--modifier).
- [ ] **Mixin vs Function**: Khác nhau, ví dụ dùng từng loại?
- [ ] **@use và @import**: Tại sao nên dùng @use?
- [ ] **Mobile-first** trong SCSS: viết base cho mobile rồi dùng min-width thế nào?

---

## Responsive

- [ ] **Viewport meta** cần gì để mobile không zoom out toàn trang?
- [ ] **Mobile-first** là gì? So với desktop-first (max-width)?
- [ ] **Breakpoint** nên đặt theo thiết bị hay theo nội dung/layout?
- [ ] **srcset và sizes** dùng để làm gì? So với img src đơn thuần?
- [ ] **100vw** có thể gây scroll ngang không? Cách xử lý?

---

## Reactive Programming

- [ ] **Reactive programming** là gì? So với imperative?
- [ ] **Observer pattern**: Subject và Observer; ví dụ trong JS (event, Promise, Observable)?
- [ ] **Cold vs hot Observable** (hoặc stream): Khác nhau, ví dụ?
- [ ] **Stream** trong UI: state thay đổi → view cập nhật; one-way data flow là gì?
- [ ] Khi nào dùng **Observable** thay vì **Promise**? (hủy được, nhiều giá trị, compose)

---

## Accessibility

- [ ] **Semantic HTML**: Tại sao dùng `<button>` thay vì `<div onclick>`? `<nav>`, `<main>`, `<article>` dùng khi nào?
- [ ] **Keyboard**: Mọi tương tác có thể dùng chỉ bàn phím không? Tab order, focus trap trong modal?
- [ ] **ARIA**: Khi nào cần role, aria-label, aria-expanded? Nguyên tắc “ưu tiên HTML đúng nghĩa”?
- [ ] **Contrast**: WCAG AA yêu cầu tỉ lệ tối thiểu thế nào? Không chỉ dựa vào màu để truyền thông tin?
- [ ] **:focus-visible**: Dùng để làm gì? Tại sao không nên bỏ outline mà không thay thế?

---

## Performance

- [ ] **Critical Rendering Path**: DOM, CSSOM, layout, paint — CSS/JS blocking ảnh hưởng thế nào?
- [ ] **Core Web Vitals**: LCP, FID/INP, CLS là gì? Mục tiêu tương đối?
- [ ] **LCP** tối ưu thế nào? (server, preload, ảnh, JS)
- [ ] **CLS** giảm thế nào? (kích thước ảnh/iframe, tránh chèn nội dung đẩy layout)
- [ ] **Repaint vs reflow**: Khác nhau? Thuộc tính nào ít gây reflow (transform, opacity)?
- [ ] **Event delegation**: Lợi gì? Implement cơ bản (listener trên cha, e.target/closest)?
- [ ] **Long task** là gì? Ảnh hưởng gì? Cách giảm?

---

## Browser & Event Loop

- [ ] **Event loop**: Macrotask vs microtask; thứ tự chạy trong một vòng?
- [ ] **setTimeout(fn, 0)** và **Promise.then(fn)** — cái nào chạy trước? Ví dụ in 1,4,3,2?
- [ ] **requestAnimationFrame** dùng khi nào? So với setTimeout cho animation?
- [ ] **Layout thrashing** là gì? Cách tránh (đọc layout một lần, batch ghi)?

---

## Security

- [ ] **XSS** là gì? Reflected, Stored, DOM-based khác nhau thế nào? Cách phòng (escape, tránh innerHTML với input thô, HttpOnly cookie)?
- [ ] **CSP** dùng để làm gì? script-src, default-src ý nghĩa?
- [ ] **CORS**: Same-Origin Policy; server cấu hình thế nào? Preflight (OPTIONS) khi nào?
- [ ] **XSS vs CSRF**: Khác nhau? Phòng CSRF (SameSite, CSRF token)?
- [ ] **Cookie HttpOnly, Secure, SameSite** — từng cái dùng để làm gì?
- [ ] **Token** (JWT) nên đặt ở đâu (memory, localStorage, cookie)? Rủi ro localStorage?

---

## Tổng hợp

- [ ] Bạn có thể **thiết kế một layout responsive** (mobile-first) với Flexbox/Grid và SCSS variables không?
- [ ] Bạn có thể **giải thích** một trang load từ request đến paint (critical path, blocking) và đề xuất tối ưu không?
- [ ] Bạn có thể **liệt kê** các bước làm một form/button **accessible** (semantic, keyboard, ARIA nếu cần, focus, contrast) không?
- [ ] Bạn có thể **giải thích** reactive (stream, observer) và áp dụng vào UI (state → view, one-way flow) không?

---

Nếu bạn **trả lời được rõ ràng** đa số câu trên và **áp dụng** được vào project (CSS/SCSS, responsive, a11y, performance, security), bạn đủ nền **senior web** để pass vòng kỹ thuật. Kết hợp với [frontend (Angular)](../frontend/) và [15 - Master Angular](../frontend/15-master-angular.md) khi phỏng vấn full-stack front-end / Angular senior.

→ Quay lại [README](README.md) | [01 - CSS](01-css-fundamentals.md)
