# CSS Fundamentals

Nền tảng CSS: selectors, specificity, cascade, kế thừa, box model và units. Senior cần nắm chắc để debug style và override đúng cách.

## Mục lục
1. [Selectors](#selectors)
2. [Specificity và Cascade](#specificity-và-cascade)
3. [Kế thừa (inheritance)](#kế-thừa-inheritance)
4. [Box model](#box-model)
5. [Units: px, em, rem, %, vw/vh](#units-px-em-rem--vwvh)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Selectors

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

---

## Units: px, em, rem, %, vw/vh

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
