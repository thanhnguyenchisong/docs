# Accessibility (a11y)

Web accessibility: mọi người (kể cả dùng screen reader, chỉ bàn phím, thị lực kém) đều dùng được sản phẩm. Senior cần nắm chuẩn và cách implement để pass phỏng vấn và audit thực tế.

## Mục lục
1. [Tại sao a11y quan trọng](#tại-sao-a11y-quan-trọng)
2. [Semantic HTML](#semantic-html)
3. [Keyboard navigation](#keyboard-navigation)
4. [ARIA khi cần](#aria-khi-cần)
5. [Màu sắc và contrast](#màu-sắc-và-contrast)
6. [Focus và focus visible](#focus-và-focus-visible)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

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
