# Reactive Programming

Reactive programming là mô hình lập trình dựa trên **stream dữ liệu** và **phản ứng với thay đổi** (propagation of change). Trên web/front-end, nó gắn với Observable (RxJS), signals, và tư duy “data flow một chiều” — rất hay gặp khi phỏng vấn senior.

## Mục lục
1. [Reactive là gì? (Cho người mới)](#reactive-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Event listener vs stream](#ví-dụ-trực-quan-event-listener-vs-stream)
3. [Khái niệm reactive](#khái-niệm-reactive)
4. [Observer pattern](#observer-pattern)
5. [Streams và Observable](#streams-và-observable)
6. [Áp dụng vào UI (state → view)](#áp-dụng-vào-ui-state--view)
7. [So sánh với imperative](#so-sánh-với-imperative)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Reactive là gì? (Cho người mới)

- **Lập trình "bình thường" (imperative):** Bạn gọi hàm, gán biến, if/else từng bước. Ví dụ: "khi user gõ vào ô search, đợi 300ms rồi gọi API" — bạn tự viết setTimeout, clearTimeout, flag "đang gõ".
- **Reactive:** Bạn mô tả **luồng dữ liệu** (stream): "mỗi lần user gõ → đợi 300ms → gọi API → hiển thị kết quả". Bạn **đăng ký** (subscribe) vào luồng đó; khi có dữ liệu mới, code tự chạy. Không cần tự quản lý từng bước.
- Trên frontend: **RxJS Observable** (Angular dùng nhiều), **Signals** (Angular/Vue), **state một chiều** (Redux/NgRx) đều mang tư duy reactive: một nguồn sự thật, thay đổi lan truyền, giao diện tự cập nhật. Học reactive giúp bạn xử lý form, HTTP, event gọn và ít bug hơn.

---

## Ví dụ trực quan: Event listener vs stream

**Cách cũ (imperative):** Mỗi lần input đổi, set timeout; nếu gõ tiếp thì clear timeout cũ. Code dài, dễ quên clear.

**Cách reactive (RxJS):** Coi "mỗi lần input đổi" là một stream, dùng `debounceTime(300)` rồi `subscribe`. Một đoạn ngắn, dễ đọc.

Mở [StackBlitz Angular](https://stackblitz.com/edit/angular-ng) hoặc project Angular, trong component thêm (cần import từ `rxjs` và `@angular/forms`):

```typescript
// Trong component: formControlName hoặc FormControl
this.searchControl.valueChanges
  .pipe(debounceTime(300))
  .subscribe(value => console.log('Search:', value));
```

Khi bạn gõ vào ô search, **Console (F12)** sẽ in ra giá trị sau khi bạn **ngừng gõ 300ms** — không in từng ký tự liên tục. Đó là "stream + debounce" trực quan: nhiều sự kiện → chỉ phản ứng với giá trị ổn định.

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
