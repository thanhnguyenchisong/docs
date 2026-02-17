# Reactive Programming

Reactive programming là mô hình lập trình dựa trên **stream dữ liệu** và **phản ứng với thay đổi** (propagation of change). Trên web/front-end, nó gắn với Observable (RxJS), signals, và tư duy “data flow một chiều” — rất hay gặp khi phỏng vấn senior.

## Mục lục
1. [Khái niệm reactive](#khái-niệm-reactive)
2. [Observer pattern](#observer-pattern)
3. [Streams và Observable](#streams-và-observable)
4. [Áp dụng vào UI (state → view)](#áp-dụng-vào-ui-state--view)
5. [So sánh với imperative](#so-sánh-với-imperative)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Khái niệm reactive

- **Reactive**: Hệ thống **phản ứng** với sự kiện (event), thay đổi dữ liệu (data change) hoặc stream (async). Thay vì “gọi hàm để lấy giá trị”, ta “đăng ký” và nhận giá trị mỗi khi có thay đổi.
- **Declarative**: Mô tả “cái gì” (quan hệ dữ liệu → view) hơn là “làm từng bước” (imperative). Ví dụ: “list = stream của products” thay vì “gọi API rồi set list”.
- Trong front-end: **RxJS** (Observable), **Signals** (Angular, Vue, Solid), **state management** (Redux/NgRx) đều có tư duy reactive: một nguồn sự thật, thay đổi lan truyền, view tự cập nhật.

---

## Observer pattern

Mô hình cơ bản: **Subject** (nguồn dữ liệu/sự kiện) và **Observer** (người đăng ký). Khi subject thay đổi, nó thông báo cho tất cả observer.

```
Subject ──(notify)──> Observer 1
     └──(notify)──> Observer 2
     └──(notify)──> Observer 3
```

Trong JS: event listener (addEventListener), Promise (then), RxJS Observable (subscribe) đều là dạng observer. Subject trong RxJS vừa là Observable vừa là Observer (multicast).

---

## Streams và Observable

- **Stream**: Chuỗi sự kiện/giá trị theo thời gian (click, HTTP response, input value...). Có thể map, filter, merge, debounce.
- **Observable** (RxJS): Đại diện stream lazy; chỉ chạy khi **subscribe**. Emit 0, 1 hoặc nhiều giá trị; có thể complete hoặc error. Operators: map, filter, switchMap, debounceTime, catchError...

```typescript
// Tư duy: stream của input → debounce → gọi API → stream kết quả
input$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => api.search(q)),
).subscribe(results => setState(results));
```

Senior cần hiểu: **cold vs hot** (cold: mỗi subscribe chạy lại; hot: nhiều subscriber dùng chung), **unsubscribe** để tránh leak, **operator** phù hợp (switchMap cho “chỉ cần mới nhất”, mergeMap cho song song).

---

## Áp dụng vào UI (state → view)

- **State là nguồn sự thật**: Một nguồn state (store, service, signal). View **đọc** state và render; không giữ bản copy logic.
- **Thay đổi state → view tự cập nhật**: Framework (Angular, React, Vue) hoặc cơ chế reactive (signal, Observable + async pipe) đảm bảo khi state đổi thì view đổi.
- **One-way data flow**: User action → dispatch/event → cập nhật state → view re-render. Tránh hai chiều rối (two-way binding không kiểm soát).
- **Side effect tách riêng**: Gọi API, log, analytics nên nằm trong effect/interceptor/service, không nhét trong view hoặc reducer thuần.

---

## So sánh với imperative

| Imperative | Reactive |
|------------|----------|
| Gọi hàm, set biến, if/else từng bước | Khai báo stream + operator, subscribe |
| Khó compose async (callback hell) | Compose bằng pipe/operator |
| Tự quản lý listener (add/remove) | Subscribe/unsubscribe rõ ràng |
| State rải rác | State tập trung, flow rõ |

Ví dụ: “khi user gõ, đợi 300ms rồi gọi API và hiển thị”. Imperative: setTimeout, clearTimeout, flag. Reactive: stream valueChanges → debounceTime → switchMap(api) → subscribe.

---

## Câu hỏi thường gặp

**Reactive programming và RxJS có phải một không?**  
Reactive là mô hình; RxJS là thư viện implement (Observable + operators). Có thể reactive bằng Signal, Redux, hoặc event bus — không bắt buộc RxJS, nhưng RxJS rất phổ biến trên web.

**Cold vs hot Observable?**  
Cold: mỗi subscribe tạo “chạy” mới (ví dụ Observable từ HTTP). Hot: một nguồn, nhiều subscriber dùng chung (ví dụ Subject, event từ DOM). Share hot bằng share(), shareReplay().

**Khi nào dùng reactive (Observable) thay vì Promise?**  
Khi cần: hủy được (cancel), nhiều giá trị (stream), compose phức tạp (merge, debounce, retry). Một request đơn giản có thể dùng Promise; form search, router params, realtime → Observable phù hợp hơn.

**Signal và Observable khác nhau thế nào?**  
Signal: đồng bộ, luôn có “giá trị hiện tại”, không cần subscribe. Observable: bất đồng bộ, stream, cần subscribe. Cả hai đều reactive; Signal gọn cho state UI, Observable cho I/O và event.

---

→ Tiếp theo: [06 - Accessibility (a11y)](06-accessibility-a11y.md)
