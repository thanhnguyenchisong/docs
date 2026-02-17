# Web Performance

Tối ưu tốc độ load và cảm nhận mượt: critical path, Core Web Vitals, lazy load, caching, đo lường. Senior cần biết cách đo, ưu tiên và implement.

## Mục lục
1. [Performance web là gì? (Cho người mới)](#performance-web-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Đo bằng Lighthouse](#ví-dụ-trực-quan-đo-bằng-lighthouse)
3. [Critical Rendering Path](#critical-rendering-path)
4. [Core Web Vitals](#core-web-vitals)
5. [Tối ưu loading](#tối-ưu-loading)
6. [Tối ưu rendering](#tối-ưu-rendering)
6. [Đo lường và tool](#đo-lường-và-tool)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Performance web là gì? (Cho người mới)

- **Web performance** = trang load **nhanh** và **mượt**: mở trang không phải đợi lâu, scroll/click không giật. Ảnh hưởng trực tiếp đến trải nghiệm và SEO (Google dùng tốc độ làm tín hiệu xếp hạng).
- **Các khái niệm thường gặp:** **Critical path** = chuỗi bước (HTML → CSS → render) để hiển thị lần đầu. **Core Web Vitals** = các chỉ số Google quan tâm: LCP (nội dung chính xuất hiện nhanh), FID/INP (tương tác phản hồi nhanh), CLS (layout không nhảy). **Lazy load** = chỉ tải ảnh/JS khi cần (ví dụ khi scroll tới).
- **Cách bắt đầu:** Dùng **Lighthouse** (F12 → tab Lighthouse) chạy audit Performance; xem điểm và gợi ý (giảm JS không dùng, thêm width/height cho ảnh, preload font…). Từ đó ưu tiên sửa từng mục.

---

## Ví dụ trực quan: Đo bằng Lighthouse

1. Mở bất kỳ trang web nào (ví dụ trang bạn đang làm).
2. **F12** → chọn tab **Lighthouse**.
3. Chọn **Performance** (và có thể Accessibility, Best practices), **Desktop** hoặc **Mobile** → **Analyze page load**.
4. Sau vài giây bạn sẽ thấy **điểm số** (0–100) và **Core Web Vitals**: LCP, INP, CLS. Màu đỏ/cam/xanh tương ứng mức kém/trung bình/tốt.
5. Phần **Opportunities** và **Diagnostics** liệt kê cụ thể: “Properly size images”, “Reduce unused JavaScript”, “Ensure text remains visible during webfont load”… — mỗi mục có thể mở ra xem element/file nào và cách sửa.

**Thử:** Với trang có nhiều ảnh, thêm `loading="lazy"` và `width`/`height` (hoặc aspect-ratio) cho ảnh dưới fold, build lại rồi chạy Lighthouse lần nữa — điểm và CLS thường cải thiện. Đó là “ví dụ trực quan” của tối ưu performance.

---

## Critical Rendering Path

Các bước browser dùng để hiển thị trang lần đầu:

1. **DOM**: Parse HTML → DOM tree.
2. **CSSOM**: Parse CSS → CSSOM.
3. **Render tree**: DOM + CSSOM → cây render (chỉ node hiển thị).
4. **Layout**: Tính vị trí, kích thước (layout/reflow).
5. **Paint**: Vẽ pixel (paint).
6. **Composite**: Ghép layer (nếu có) lên màn hình.

**Blocking**: CSS mặc định block render (tránh FOUC); JS mặc định block parse HTML (có thể defer/async). **Optimize**: Giảm CSS/JS blocking above-the-fold; inline critical CSS; defer JS không cần ngay.

---

## Core Web Vitals

Chỉ số Google dùng cho UX và SEO:

| Metric | Ý nghĩa | Mục tiêu (tương đối) |
|--------|---------|----------------------|
| **LCP** (Largest Contentful Paint) | Thời điểm nội dung chính hiển thị | &lt; 2.5s |
| **FID** / **INP** (First Input Delay / Interaction to Next Paint) | Độ trễ từ tương tác đầu đến phản hồi | &lt; 100ms |
| **CLS** (Cumulative Layout Shift) | Độ “nhảy” layout (ảnh/font load trễ, ad chèn) | &lt; 0.1 |

- **LCP**: Tối ưu server, CDN, critical path; lazy load ảnh dưới fold; preload font/LCP image.
- **FID/INP**: Giảm JS chính thread (code split, defer); tránh long task.
- **CLS**: Đặt kích thước cho ảnh/iframe (width/height hoặc aspect-ratio); tránh chèn nội dung phía trên nội dung đã hiển thị; font với font-display: optional/swap và tránh FOIT/FOUT gây nhảy.

---

## Tối ưu loading

- **Minify & compress**: JS/CSS minify; gzip/brotli trên server.
- **Code splitting & lazy load**: Chỉ load route/component khi cần; dynamic import().
- **Caching**: Cache-Control (max-age, stale-while-revalidate); service worker cho offline/precache.
- **Resource hint**: `<link rel="preload">` cho font, ảnh LCP; `preconnect` cho origin API/CDN.
- **Image**: Định dạng (WebP/AVIF); srcset/sizes; lazy loading (loading="lazy"); dimensions để tránh CLS.
- **Third-party**: Giảm script bên thứ ba; load async/defer; đặt sau nội dung quan trọng.

---

## Tối ưu rendering

- **Layout thrashing**: Tránh đọc layout (offsetHeight, getBoundingClientRect) rồi ghi style trong vòng lặp; batch đọc rồi batch ghi; hoặc dùng requestAnimationFrame.
- **Repaint vs reflow**: Reflow (layout) tốn hơn repaint. Giảm thay đổi thuộc tính gây reflow (width, top, font-size...); ưu tiên transform, opacity (composite).
- **Virtual list**: List dài chỉ render item trong viewport + buffer.
- **Debounce/throttle**: Scroll, resize, input — giảm số lần xử lý.

---

## Đo lường và tool

- **Lighthouse** (Chrome DevTools): Performance, Best practices, SEO, a11y; có Core Web Vitals.
- **Chrome DevTools**: Performance tab (record, tìm long task, layout); Network (waterfall, size).
- **Real User Monitoring (RUM)**: Core Web Vitals từ user thật (e.g. Google Search Console, analytics).
- **Lab vs field**: Lab (Lighthouse) ổn định; field (RUM) phản ánh mạng/thiết bị thật. Cần cả hai.

---

## Câu hỏi thường gặp

**Repaint và reflow khác nhau thế nào?**  
Reflow (layout): tính lại vị trí/kích thước. Repaint: vẽ lại pixel. Reflow thường kéo repaint; thay đổi chỉ transform/opacity có thể chỉ composite (không reflow).

**Làm sao giảm LCP?**  
Server/CDN nhanh; preload resource LCP; tối ưu ảnh (format, size); giảm JS blocking; SSR hoặc pre-render nội dung above-the-fold.

**loading="lazy" dùng thế nào?**  
Trên img/iframe: browser load khi gần viewport. Nên dùng cho ảnh dưới fold; không dùng cho ảnh LCP.

**Long task là gì?**  
Task JS chạy &gt; 50ms, block main thread. User có thể thấy giật. Giải pháp: chunk nhỏ, requestIdleCallback, web worker cho tính toán nặng.

---

→ Tiếp theo: [08 - Browser, DOM & Event Loop](08-browser-dom-event-loop.md)
