# Tài liệu Web — CSS, SCSS, Responsive, Reactive & Senior Foundation

Bộ tài liệu **nền tảng web** không phụ thuộc framework: **CSS**, **SCSS/Sass**, **Responsive Web Design**, **Reactive Programming**, **Accessibility**, **Performance**, **Browser/DOM**, **Security**. Học xong kết hợp với [frontend (Angular)](../README.md) để **đi phỏng vấn senior front-end pass ngay**.

---

## 🌱 Cho người mới bắt đầu (chưa từng làm web)

Nếu bạn **chưa biết HTML/CSS** hoặc mới chỉ biết sơ sơ, đọc phần này trước để không bị ngỡ.

### Tài liệu Web này dạy gì?

- Trang web được tạo từ **HTML** (nội dung, cấu trúc), **CSS** (màu sắc, bố cục, font chữ) và **JavaScript** (tương tác, xử lý).
- Bộ tài liệu **Web** này tập trung vào **CSS và những kỹ năng xung quanh**: cách làm giao diện đẹp, bố cục linh hoạt (Flexbox, Grid), responsive (hiển thị tốt trên mobile/tablet/desktop), SCSS (viết CSS dễ bảo trì hơn), accessibility (người dùng khuyết tật vẫn dùng được), performance và bảo mật.
- **Không cần** biết Angular hay React để học phần Web — chỉ cần biết HTML cơ bản (thẻ `div`, `p`, `a`, `class`, `id`) và có trình duyệt + editor (VS Code khuyến nghị).

### Bạn cần có trước khi đọc

| Cần biết | Mức độ |
|----------|--------|
| **HTML** | Biết thẻ cơ bản: `<div>`, `<p>`, `<span>`, `<a>`, `<img>`, `<ul>/<li>`, thuộc tính `class` và `id`. |
| **Trình duyệt** | Chrome hoặc Edge; biết mở **DevTools** (F12) — tab Elements để xem HTML/CSS. |
| **Editor** | VS Code (hoặc bất kỳ editor nào) để gõ và lưu file `.html`, `.css`. |

Chưa cần JavaScript nhiều cho các bài **01–04** (CSS, Layout, SCSS, Responsive). Bài **05** (Reactive) trở đi sẽ đụng tới tư duy lập trình hơn.

### Học theo thứ tự nào?

- **Bài 01 (CSS Fundamentals)** là nền: selectors, box model, đơn vị (px, rem, em). Nếu bỏ qua, các bài sau sẽ khó hiểu.
- Sau đó **02** Layout (Flexbox, Grid) → **03** SCSS → **04** Responsive. Bốn bài này đủ để bạn tự làm giao diện tĩnh đẹp và responsive.
- **05–09** (Reactive, A11y, Performance, Browser/DOM, Security) giúp bạn hiểu sâu hơn và chuẩn bị cho level senior; có thể đọc sau khi đã làm được vài trang với 01–04.

### Thực hành ngay

- Mỗi bài có **ví dụ code** — hãy copy vào file `.html` hoặc `.css` và mở bằng trình duyệt để xem kết quả.
- Trong thư mục **[example/](example/)** có project mẫu: mở `index.html` hoặc chạy `npx serve example` để xem trang mẫu và chỉnh sửa thử.
- Dùng **F12 → Elements** để click vào từng thẻ, xem CSS áp dụng ở bên phải — đây là cách nhanh nhất để hiểu “style này đang áp dụng cho cái gì”.

Khi đã thoải mái với 01–04, bạn có thể chuyển sang [Frontend (Angular)](../README.md) và áp dụng CSS/SCSS/Responsive ngay trong project Angular.

---

## 📚 Mục lục

| # | File | Nội dung |
|---|------|----------|
| 01 | [CSS Fundamentals](01-css-fundamentals.md) | Selectors, specificity, cascade, box model, units |
| 02 | [CSS Layout: Flexbox & Grid](02-css-layout-flexbox-grid.md) | Flexbox, Grid, positioning, khi nào dùng gì |
| 03 | [SCSS / Sass](03-scss-sass.md) | Variables, nesting, mixins, functions, partials |
| 04 | [Responsive Web Design](04-responsive-web-design.md) | Breakpoints, mobile-first, media queries, viewport |
| 05 | [Reactive Programming](05-reactive-programming.md) | Streams, observer pattern, RxJS concepts, UI reactive |
| 06 | [Accessibility (a11y)](06-accessibility-a11y.md) | ARIA, semantic HTML, keyboard, screen reader |
| 07 | [Web Performance](07-web-performance.md) | Critical path, Core Web Vitals, lazy load, optimize |
| 08 | [Browser, DOM & Event Loop](08-browser-dom-event-loop.md) | Event loop, DOM APIs, event delegation |
| 09 | [Web Security](09-web-security.md) | XSS, CSP, CORS, HTTPS, cookies |
| 10 | [**Checklist Senior Web**](10-senior-web-checklist.md) | Câu hỏi phỏng vấn senior — tự kiểm tra pass |

## 🎯 Lộ trình học (để phỏng vấn senior pass)

### Nền tảng bắt buộc
1. **01** CSS → **02** Layout → **03** SCSS → **04** Responsive

### Tư duy & chất lượng
2. **05** Reactive Programming → **06** Accessibility → **07** Performance

### Hiểu sâu runtime & bảo mật
3. **08** Browser/DOM/Event loop → **09** Security

### Tự kiểm tra trước phỏng vấn
4. **10** Checklist Senior Web — trả lời hết checklist = sẵn sàng senior.

## 📝 Mục tiêu

- **Sau khi đọc xong**: Nắm vững CSS/SCSS, responsive, reactive thinking, a11y, performance, security.
- **Kết hợp với frontend (Angular)**: Đủ nền để thiết kế và build ứng dụng web cấp senior, trả lời câu hỏi kỹ thuật web (CSS, layout, responsive, reactive, a11y, performance, security) và **pass phỏng vấn senior**.

---

**Gợi ý**: Đọc song song **web** (nền) và **frontend** (Angular) — áp dụng SCSS, responsive, reactive, a11y ngay trong project Angular.

---

## 📁 Project minh họa

→ **[example/](example/)** — Project tĩnh (HTML/CSS/JS) chạy được: mở `index.html` hoặc `npx serve example`. Xem [example/README.md](example/README.md) để chạy và test.
