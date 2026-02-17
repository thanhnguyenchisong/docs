# CSS Fundamentals

Nền tảng CSS: selectors, specificity, cascade, kế thừa, box model và units. Senior cần nắm chắc để debug style và override đúng cách.

## Mục lục
1. [CSS là gì? (Cho người mới)](#css-là-gì-cho-người-mới)
2. [Selectors](#selectors)
3. [Specificity và Cascade](#specificity-và-cascade)
4. [Kế thừa (inheritance)](#kế-thừa-inheritance)
5. [Box model](#box-model)
6. [Units: px, em, rem, %, vw/vh](#units-px-em-rem--vwvh)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## CSS là gì? (Cho người mới)

- **HTML** mô tả **nội dung và cấu trúc** trang (tiêu đề, đoạn văn, danh sách, form…). Nó không quyết định màu chữ, cỡ chữ hay cách sắp xếp trên màn hình.
- **CSS** (Cascading Style Sheets) là ngôn ngữ dùng để **trang trí và bố cục** những nội dung đó: màu chữ, font, khoảng cách, viền, nền, vị trí phần tử…
- Ví dụ: cùng một thẻ `<p>Hello</p>`, bạn có thể dùng CSS để làm chữ màu xanh, cỡ 18px, hoặc màu đỏ, in đậm — tùy bạn viết rule CSS nào.
- **Tại sao cần học kỹ CSS?** Trong thực tế, rất nhiều bug giao diện (chữ bị đè, layout vỡ, không đúng design) đến từ việc không nắm specificity, box model hay đơn vị. Nắm chắc bài này giúp bạn debug nhanh và viết style đúng ý từ đầu.

**Cách CSS gắn với HTML:** Trong file HTML bạn có thể dùng thẻ `<link href="style.css" rel="stylesheet">` để nối file CSS, hoặc viết CSS trong thẻ `<style>` — trình duyệt sẽ đọc và áp dụng các rule lên từng phần tử HTML tương ứng.

### Ví dụ trực quan: Một trang HTML + CSS chạy được

Copy toàn bộ đoạn dưới vào một file đặt tên `demo-css.html`, lưu lại rồi **mở bằng trình duyệt** (double-click file hoặc kéo thả vào Chrome). Bạn sẽ thấy:

- **Tiêu đề** màu xanh dương (selector `h1`).
- **Đoạn có class `highlight`** nền vàng, chữ đậm (selector `.highlight`).
- **Hộp có viền** với padding bên trong, tổng width cố định 200px (box model + `box-sizing: border-box`).
- **Chữ dùng đơn vị rem** — thử đổi `html { font-size: 20px; }` thành `10px` rồi F5, toàn bộ chữ sẽ nhỏ lại (rem phụ thuộc root).

Mở **F12 → tab Elements**, click vào từng thẻ và xem bên phải các thuộc tính CSS đang áp dụng — đây là cách trực quan nhất để hiểu selector và box model.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Demo CSS</title>
  <style>
    * { box-sizing: border-box; }
    html { font-size: 16px; }

    /* Selector theo thẻ */
    h1 { color: #1976d2; font-size: 1.5rem; }

    /* Selector theo class */
    .highlight { background: #fff3cd; font-weight: bold; padding: 0.25rem 0.5rem; }

    /* Box model: content + padding + border, tổng width = 200px */
    .box {
      width: 200px;
      padding: 16px;
      border: 2px solid #ccc;
      margin: 1rem 0;
      font-size: 0.875rem;
    }

    /* Specificity: .box.note (0,2,0) thắng .box (0,1,0) */
    .box.note { border-color: #28a745; background: #f0f9f0; }
  </style>
</head>
<body>
  <h1>Ví dụ CSS trực quan</h1>
  <p>Đoạn thường.</p>
  <p class="highlight">Đoạn có class highlight — nền vàng, chữ đậm.</p>
  <div class="box">Hộp 200px (đã gồm padding + border).</div>
  <div class="box note">Hộp cùng kích thước, viền xanh (specificity cao hơn).</div>
</body>
</html>
```

**Bạn thử:** Đổi `h1 { color: #1976d2; }` thành `h1 { color: red; }` rồi lưu và F5 — tiêu đề đổi màu ngay. Đổi `.highlight` thành `p.highlight` rồi F5 — chỉ đoạn `<p class="highlight">` bị ảnh hưởng, không ảnh hưởng thẻ khác có class `highlight` (nếu sau này bạn thêm).

---

## Selectors

**Selector** là cách bạn “chỉ định” trình duyệt: “áp dụng style này cho những phần tử nào”. Nếu không có selector đúng, CSS sẽ không áp dụng vào đúng chỗ.

| Loại | Ví dụ | Mô tả |
|------|--------|--------|
| Element | `p`, `div` | Theo tên thẻ |
| Class | `.btn`, `.card` | Theo class |
| ID | `#header` | Theo id (tránh dùng cho style) |
| Attribute | `[href]`, `[type="text"]` | Theo thuộc tính |
| Pseudo-class | `:hover`, `:focus`, `:nth-child(2)` | Trạng thái / vị trí |
| Pseudo-element | `::before`, `::after`, `::first-line` | Phần giả của element |
| Combinator | `div p`, `div > p`, `div + p`, `div ~ p` | Con, con trực tiếp, anh em kế, anh em |

```css
/* Con (descendant) */
nav a { color: blue; }

/* Con trực tiếp */
ul > li { list-style: none; }

/* Anh em kế cận */
h2 + p { margin-top: 0; }

/* Pseudo */
a:hover { text-decoration: underline; }
input:focus { outline: 2px solid blue; }
li:nth-child(odd) { background: #f5f5f5; }
p::first-letter { font-size: 2em; }
```

---

## Specificity và Cascade

**Cho người mới:** Trong một trang có rất nhiều CSS (từ file của bạn, từ thư viện, từ trình duyệt). Khi hai rule cùng “nhắm” vào một phần tử và cùng thuộc tính (ví dụ cùng `color`), trình duyệt phải chọn một. **Specificity** là quy tắc để biết “rule nào thắng”.

**Specificity** (độ ưu tiên): Quyết định rule nào thắng khi cùng property.

Thứ tự (cao → thấo): **inline style** > **#id** > **.class, [attr], :pseudo-class** > **element, ::pseudo-element**.

Tính theo (a, b, c): a = inline/id, b = class/attribute/pseudo-class, c = element/pseudo-element. So sánh từ a → b → c.

```css
/* (0,0,1) */
p { color: black; }

/* (0,1,0) */
.text { color: blue; }

/* (0,1,1) */
p.text { color: green; }

/* (0,2,0) */
.btn.primary { color: red; }
```

- **!important**: Đè mọi thứ (tránh lạm dụng; dùng cho utility override).
- **Cascade**: Cùng specificity thì rule **sau** (trong file hoặc thứ tự load) thắng.

---

## Kế thừa (inheritance)

Một số property **kế thừa** xuống con: `color`, `font-*`, `line-height`, `text-align`, `visibility`...  
Không kế thừa: `margin`, `padding`, `border`, `background`, `width`, `height`...

Dùng `inherit` để bắt con dùng giá trị của cha:

```css
* { box-sizing: border-box; }
a { color: inherit; }
```

---

## Box model

**Cho người mới:** Trên trang web, mỗi thẻ HTML (div, p, button…) được trình duyệt coi như một **hộp chữ nhật**. Hộp đó gồm: phần **nội dung** (content), rồi **padding** (khoảng trống bên trong giữa nội dung và viền), **border** (viền), và **margin** (khoảng trống bên ngoài viền, đẩy các hộp khác ra). Hiểu box model giúp bạn biết tại sao khi set `width: 200px` rồi thêm `padding` thì tổng chiều rộng có thể lớn hơn 200px — và cách dùng `box-sizing` để kiểm soát.

Mỗi element là một hộp: **content** → **padding** → **border** → **margin**.

- **box-sizing**: `content-box` (mặc định) — width/height chỉ tính content; padding/border cộng thêm. `border-box` — width/height đã gồm padding + border.
- Senior thường set toàn cục: `*, *::before, *::after { box-sizing: border-box; }` để dễ tính layout.

```css
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid #ccc;
  box-sizing: border-box; /* tổng width = 200px */
}
```

**Trực quan:** Cùng `width: 200px` + `padding: 20px` + `border: 2px`:

| box-sizing    | Chiều rộng thực tế trên màn hình |
|---------------|-----------------------------------|
| `content-box` | 200 + 20×2 + 2×2 = **244px**     |
| `border-box`  | **200px** (đã gồm padding + border) |

Trong file `demo-css.html` ở trên, hai hộp `.box` dùng `border-box` nên tổng width luôn 200px; nếu bạn đổi thành `box-sizing: content-box` và F5, hộp sẽ rộng hơn.

---

## Units: px, em, rem, %, vw/vh

**Cho người mới:** Khi bạn viết `width: 200` thì 200 **cái gì**? CSS cần **đơn vị**. `px` là pixel (chấm trên màn hình). `em` và `rem` là đơn vị tương đối theo cỡ chữ — dùng chúng giúp trang dễ scale khi user phóng to chữ hoặc khi bạn đổi font-size gốc. `%` thường là phần trăm so với phần tử cha. `vw`/`vh` là phần trăm so với kích thước cửa sổ trình duyệt. Biết sự khác nhau giúp bạn chọn đơn vị phù hợp cho từng trường hợp (font, spacing, layout).

| Unit | Ý nghĩa |
|------|---------|
| **px** | Pixel, cố định (không scale theo font root). |
| **em** | Tương đối **font-size của element** (hoặc cha). 1.5em = 1.5 lần font-size hiện tại. |
| **rem** | Tương đối **font-size của root** (html). Dùng cho spacing, font để dễ scale toàn site. |
| **%** | % của property tương ứng (width % của cha, font-size % của cha). |
| **vw / vh** | 1vw = 1% viewport width; 1vh = 1% viewport height. |
| **ch** | Số ký tự (font monospace). **fr** (trong Grid). |

Responsive: ưu tiên **rem** cho font và spacing; **%** hoặc **vw/vh** cho layout; **em** cho padding/margin cần tỉ lệ với font local.

---

## Câu hỏi thường gặp

**Làm sao override style có specificity cao?**  
Tăng specificity (thêm class hoặc selector), hoặc dùng cùng specificity nhưng viết sau, hoặc `!important` (hạn chế).

**div p và div > p khác nhau thế nào?**  
`div p`: mọi thẻ `p` là con cháu (descendant). `div > p`: chỉ `p` là con trực tiếp (direct child).

**Tại sao nên dùng border-box?**  
Width/height bao gồm padding và border → tính layout đơn giản, tránh overflow không mong muốn khi thêm padding.

**rem vs em?**  
rem dựa trên root → dễ kiểm soát toàn cục. em dựa trên font-size của chính element/cha → hữu ích cho component cần scale theo context (ví dụ button bên trong .small).

---

→ Tiếp theo: [02 - CSS Layout: Flexbox & Grid](02-css-layout-flexbox-grid.md)
