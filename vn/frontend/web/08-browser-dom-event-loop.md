# Browser, DOM & Event Loop

Hiểu cách browser xử lý DOM, event và event loop giúp debug, tối ưu và trả lời phỏng vấn senior về runtime.

## Mục lục
1. [Event loop](#event-loop)
2. [Microtask vs Macrotask](#microtask-vs-macrotask)
3. [DOM APIs cơ bản](#dom-apis-cơ-bản)
4. [Event delegation](#event-delegation)
5. [Bubbling và capturing](#bubbling-và-capturing)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Event loop

JavaScript **single-threaded**: Một luồng chạy. Event loop đảm bảo chạy code, xử lý event và task từ hàng đợi mà không block.

**Luồng cơ bản:**
1. Chạy code đồng bộ (call stack).
2. Khi stack rỗng, lấy **task** (macrotask) từ **task queue** (ví dụ callback setTimeout, I/O) và chạy.
3. Sau mỗi task (hoặc khi stack rỗng), chạy hết **microtask queue** (Promise.then, queueMicrotask, MutationObserver).
4. Render (nếu cần) rồi lặp lại.

**setTimeout(fn, 0)** không chạy ngay: đưa fn vào task queue; chạy sau khi code hiện tại và toàn bộ microtask chạy xong.

---

## Microtask vs Macrotask

| Loại | Ví dụ |
|------|--------|
| **Macrotask** | setTimeout, setInterval, I/O, UI event (click, load) |
| **Microtask** | Promise.then/catch/finally, queueMicrotask(), MutationObserver |

Thứ tự trong một “vòng”: **sync code** → **hết microtask** → **một macrotask** → **hết microtask** → render (nếu cần) → lặp. Microtask được ưu tiên sau mỗi task; nhiều Promise.then liên tiếp chạy hết trước khi chuyển sang setTimeout.

```javascript
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1, 4, 3, 2
```

---

## DOM APIs cơ bản

- **Query**: `getElementById`, `querySelector`, `querySelectorAll`, `getElementsByClassName` (live collection).
- **Tạo/sửa**: `createElement`, `createTextNode`, `appendChild`, `removeChild`, `insertBefore`, `replaceChild`.
- **Thuộc tính**: `textContent`, `innerHTML` (cẩn thận XSS), `setAttribute`, `getAttribute`, `classList.add/remove/toggle`.
- **Style**: `element.style.prop` hoặc `classList` (ưu tiên class).
- **Kích thước/vị trí**: `getBoundingClientRect()`, `offsetWidth`, `clientHeight`, `scrollTop` — đọc nhiều trong một frame có thể gây layout thrashing.

Dùng **DocumentFragment** khi thêm nhiều node một lần để giảm reflow.

---

## Event delegation

Thay vì gắn listener cho từng element con, gắn **một listener trên cha**, dùng **event.target** (hoặc closest) để xác định element thực sự được click. Lợi ích: ít listener, hoạt động với element động (thêm sau).

```javascript
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]');
  if (!item) return;
  console.log(item.dataset.id);
});
```

---

## Bubbling và capturing

- **Capturing**: Event đi từ root → target (ít dùng).
- **Target**: Trên chính element.
- **Bubbling**: Từ target → root (mặc định). `e.stopPropagation()` dừng bubble (dùng thận trọng).

`addEventListener(type, handler, options)`: `capture: true` để bắt ở phase capturing. `once: true` để tự remove sau lần chạy.

---

## Câu hỏi thường gặp

**setTimeout(fn, 0) và Promise.then(fn) thứ tự thế nào?**  
Promise.then là microtask, chạy trước setTimeout (macrotask). Ví dụ trên in 1, 4, 3, 2.

**requestAnimationFrame thuộc task nào?**  
Chạy trước paint; thường sau microtask. Dùng cho animation; browser có thể gộp nhiều frame.

**Event delegation lợi gì?**  
Một listener cho nhiều con; tiết kiệm memory; element thêm động vẫn nhận event. Cần kiểm tra target (closest, tagName) để tránh xử lý nhầm.

**getBoundingClientRect() có gây reflow không?**  
Có thể trigger layout (reflow) nếu layout dirty. Đọc liên tiếp nhiều thuộc tính layout (offsetTop, scrollHeight...) rồi ghi style trong vòng lặp → layout thrashing. Nên đọc một lần, lưu biến, rồi ghi.

---

→ Tiếp theo: [09 - Web Security](09-web-security.md)
