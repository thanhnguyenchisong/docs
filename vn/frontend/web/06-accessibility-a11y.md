# Accessibility (a11y)

Web accessibility: mọi người (kể cả dùng screen reader, chỉ bàn phím, thị lực kém) đều dùng được sản phẩm. Senior cần nắm chuẩn và cách implement để pass phỏng vấn và audit thực tế.

## Mục lục
1. [A11y là gì? (Cho người mới)](#a11y-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Semantic vs div + click](#ví-dụ-trực-quan-semantic-vs-div--click)
3. [Tại sao a11y quan trọng](#tại-sao-a11y-quan-trọng)
4. [Semantic HTML](#semantic-html)
5. [Keyboard navigation](#keyboard-navigation)
6. [ARIA khi cần](#aria-khi-cần)
7. [Màu sắc và contrast](#màu-sắc-và-contrast)
8. [Focus và focus visible](#focus-và-focus-visible)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## A11y là gì? (Cho người mới)

- **Accessibility (a11y)** = “Khả năng tiếp cận”: trang web có thể dùng được bởi **mọi người**, kể cả người khiếm thị (dùng screen reader đọc nội dung), người chỉ dùng bàn phím (không dùng chuột), người thị lực kém (cần contrast cao, chữ to), người nhạy cảm với animation (cần tắt chuyển động).
- **Tại sao cần:** Đạo đức, pháp lý (nhiều nước yêu cầu WCAG), SEO và UX cho tất cả user. Senior thường được hỏi: dùng thẻ gì cho nút bấm, làm sao để keyboard điều hướng được, ARIA dùng khi nào.
- **Cách làm cơ bản:** Dùng đúng thẻ HTML có nghĩa (button, nav, main, label…), đảm bảo Tab/Enter/Space hoạt động, có focus rõ ràng, ảnh có alt, contrast đủ. Chỉ thêm ARIA khi HTML chưa đủ (component custom).

---

## Ví dụ trực quan: Semantic vs div + click

**Cách kém a11y:** Dùng `<div onclick="...">Gửi</div>`. Screen reader không biết đây là nút; user chỉ bàn phím không focus được bằng Tab; không nhấn Enter/Space để kích hoạt.

**Cách đúng:** Dùng `<button type="button">Gửi</button>`. Trình duyệt tự: có role button, focus được bằng Tab, Enter/Space kích hoạt, screen reader đọc “Gửi, button”.

**Thử ngay:** Lưu file HTML dưới, mở bằng trình duyệt. Chỉ dùng **phím Tab** và **Enter** (không dùng chuột): “Nút đúng” focus và nhấn được; “Giả nút” (div) không xuất hiện trong thứ tự Tab. Bật **VoiceOver (Mac)** hoặc **NVDA (Windows)** để nghe screen reader đọc — nút đúng được đọc rõ, div không.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Demo A11y</title>
  <style>
    button, .fake-btn { padding: 8px 16px; margin: 4px; cursor: pointer; }
    .fake-btn { background: #ddd; border: 1px solid #999; }
  </style>
</head>
<body>
  <p>Chỉ dùng Tab và Enter (không chuột):</p>
  <button type="button">Nút đúng (button) — Tab tới được, Enter bấm được</button>
  <div class="fake-btn" onclick="alert('click')">Giả nút (div) — Tab không tới</div>
</body>
</html>
```

---

## Tại sao a11y quan trọng

- **Đạo đức & pháp lý**: Nhiều nơi yêu cầu WCAG (Web Content Accessibility Guidelines). Thiếu a11y có thể bị kiện.
- **SEO và UX**: Semantic, heading, alt text giúp cả bot và người. Focus rõ, contrast tốt giúp mọi user.
- **Senior**: Biết dùng đúng thẻ, ARIA, keyboard, test với screen reader là điểm cộng lớn.

---

## Semantic HTML

Dùng đúng thẻ theo **ý nghĩa** (không chỉ style):

| Thẻ | Ý nghĩa |
|-----|---------|
| `<header>`, `<footer>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<article>` | Cấu trúc trang / nội dung |
| `<h1>`–`<h6>` | Heading, **một h1** mỗi trang, thứ bậc không nhảy |
| `<button>` | Hành động (submit, toggle). Dùng cho click không dẫn đến URL mới |
| `<a>` | Điều hướng (href). Không dùng `<div onclick>` thay cho link/button |
| `<label>` | Gắn với input qua `for` + `id` hoặc bọc input |
| `<input type="...">` | Đúng type (email, number, search...) để keyboard và a11y |
| `<img alt="...">` | Mô tả ảnh (để trống alt nếu ảnh trang trí) |

Tránh: div/span cho mọi thứ; thẻ chỉ để style (dùng class). Screen reader dựa vào semantic để đọc cấu trúc.

---

## Keyboard navigation

- Mọi tương tác có thể dùng **chỉ bàn phím**: Tab, Shift+Tab, Enter, Space, mũi tên (menu, tab).
- **Tab order**: Thứ tự focus theo thứ tự DOM (có thể dùng `tabindex` nhưng ưu tiên thứ tự DOM hợp lý).
- **Focus không bị kẹt**: Modal mở lên cần trap focus trong modal; đóng thì trả focus về element mở.
- **Skip link**: Link “Skip to main content” ở đầu trang để nhảy qua nav.
- Tránh `tabindex="-1"` để ẩn khỏi tab trừ khi có điều khiển focus bằng code (modal).

---

## ARIA khi cần

ARIA bổ sung ý nghĩa khi HTML chưa đủ (component custom, dynamic content).

- **role**: Vai trò (button, dialog, tablist, tab, menu...).
- **aria-label / aria-labelledby**: Tên cho element (icon button, region).
- **aria-expanded**, **aria-pressed**, **aria-selected**: Trạng thái.
- **aria-hidden="true"**: Ẩn khỏi accessibility tree (ví dụ icon trang trí cạnh text đã mô tả).
- **aria-live**: Vùng thông báo thay đổi (polite/assertive) cho screen reader.

**Nguyên tắc**: Ưu tiên semantic HTML. Chỉ dùng ARIA khi không có thẻ phù hợp (ví dụ div làm tab, custom dropdown). Không dùng ARIA thay cho hành vi (ví dụ phải xử lý keyboard cho tab panel).

---

## Màu sắc và contrast

- **Contrast**: Văn bản và nền đạt tỉ lệ tối thiểu (WCAG AA: 4.5:1 chữ thường, 3:1 chữ lớn). Dùng tool (e.g. Contrast Checker) để kiểm tra.
- **Không chỉ dựa vào màu**: Thông tin quan trọng không truyền duy nhất bằng màu (ví dụ lỗi: icon + text “Lỗi”, không chỉ đổi màu đỏ).
- **prefers-reduced-motion**: Tôn trọng `@media (prefers-reduced-motion: reduce)` — giảm hoặc tắt animation.

---

## Focus và focus visible

- **:focus-visible**: Chỉ hiện outline khi focus bằng bàn phím (tránh outline khi click chuột nếu design không muốn). Dùng thay cho bỏ outline hẳn.
- **Visible focus**: Luôn có chỉ báo focus rõ (outline, border, shadow) để user biết đang ở đâu.
- Tránh `outline: none` mà không thay bằng style focus khác.

```css
:focus { outline: 2px solid blue; outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }
:focus-visible { outline: 2px solid blue; outline-offset: 2px; }
```

---

## Câu hỏi thường gặp

**Khi nào dùng role vs thẻ HTML?**  
Dùng thẻ đúng nghĩa trước (button, nav, main...). Dùng role khi làm component custom từ div/span (ví dụ div có role="button" và xử lý Enter/Space).

**aria-label vs aria-labelledby?**  
aria-label: chuỗi trực tiếp. aria-labelledby: id của element chứa text làm label. labelledby tốt khi đã có text trên trang có thể dùng làm tên.

**Test a11y thế nào?**  
Keyboard: chỉ dùng Tab/Enter/Space. Screen reader: NVDA (Windows), VoiceOver (Mac). Tool: axe DevTools, Lighthouse a11y. Automated chỉ bắt một phần; test tay quan trọng.

**Modal a11y cần gì?**  
Focus trap trong modal; đóng bằng Esc; khi đóng trả focus về element mở; aria-modal="true" và role="dialog"; label (aria-label hoặc aria-labelledby).

---

→ Tiếp theo: [07 - Web Performance](07-web-performance.md)
