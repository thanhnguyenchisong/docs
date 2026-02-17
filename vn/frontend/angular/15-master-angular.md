# Master Angular — Kiến trúc, Performance, Security & Phỏng vấn Senior

Tài liệu này bổ sung cho bộ 01–16 (gồm **AG-Grid**), tập trung vào **mức senior/master**: Change Detection, performance, bảo mật, kiến trúc, debugging và **checklist câu hỏi phỏng vấn** để tự kiểm tra đủ chuẩn **master Angular & lập trình web bằng Angular**.

## Mục lục
1. [Change Detection sâu](#change-detection-sâu)
2. [Signals — reactive primitive](#signals--reactive-primitive)
3. [Performance](#performance)
4. [Security](#security)
5. [Kiến trúc ứng dụng lớn](#kiến-trúc-ứng-dụng-lớn)
6. [Debugging & tooling](#debugging--tooling)
7. [Checklist phỏng vấn Senior Angular](#checklist-phỏng-vấn-senior-angular)

---

## Change Detection sâu

### Zone.js và Default strategy

- **Zone.js** (mặc định): Angular patch các API async (setTimeout, XHR, event) để sau khi chạy xong thì trigger change detection (CD) cho toàn cây component. Mỗi lần event/HTTP/timer → có thể chạy CD toàn bộ.
- **Default strategy**: Mỗi lần CD chạy, Angular so sánh binding (template) với giá trị hiện tại; nếu đổi thì cập nhật DOM. Component con cũng được check.

### OnPush strategy

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

- CD chỉ chạy khi:
  - **Input reference** thay đổi (@Input hoặc input signal),
  - **Event** phát sinh từ template của chính component (hoặc con),
  - **Observable** emit qua **async** pipe (async pipe gọi markForCheck),
  - **Manual**: `ChangeDetectorRef.markForCheck()` hoặc `detectChanges()`.
- **Lợi ích**: Giảm số lần so sánh binding → cải thiện performance, đặc biệt list lớn hoặc cây component sâu. **Bắt buộc** khi dùng OnPush: truyền data bất biến (immutable) hoặc reference mới khi state đổi.

### Chạy code ngoài Angular (runOutsideAngular)

Khi chạy logic nặng hoặc thao tác DOM nhiều (animation, canvas) không muốn trigger CD:

```typescript
constructor(private ngZone: NgZone) {}
runHeavy() {
  this.ngZone.runOutsideAngular(() => {
    // Code ở đây không trigger CD
    requestAnimationFrame(() => this.draw());
  });
}
```

Khi cần cập nhật UI từ bên trong: gọi `this.ngZone.run(() => {})` hoặc `ChangeDetectorRef.detectChanges()`.

### Detach và reattach

- **detach()**: Component (và cây con) không còn được CD tự động. Dùng khi tạm thời không cần cập nhật (ví dụ tab ẩn).
- **reattach()**: Gắn lại vào cây CD.

---

## Signals — reactive primitive

Từ Angular 16+, **signals** là primitive reactive: đọc giá trị qua `signal()`, cập nhật qua `set()`/`update()`, đọc trong template không cần pipe.

### signal, computed, effect

```typescript
count = signal(0);
double = computed(() => this.count() * 2);
effect(() => {
  console.log('count is', this.count());
});
```

- **computed**: Derived state, chỉ tính lại khi signal phụ thuộc đổi; memoized.
- **effect**: Chạy side effect khi signal đổi; chạy trong injection context (constructor/field init). Tránh thay đổi signal trong effect (dễ gây vòng lặp).

### Input/Output dạng signal (Angular 17+)

Đã nêu trong bài 03: `input()`, `output()`, `model()`. Template đọc bằng `prop()`.

### So với Observable

- **Signal**: Đồng bộ, luôn có giá trị hiện tại, không cần subscribe/unsubscribe. Phù hợp state trong component/service.
- **Observable**: Bất đồng bộ, stream theo thời gian. Phù hợp HTTP, router, event. Có thể convert Observable → signal qua `toSignal()` (Angular 16+).

---

## Performance

- **Lazy load**: Route loadComponent/loadChildren → giảm initial bundle. Preload strategy (PreloadAllModules hoặc custom) nếu muốn load thêm sau khi app ổn định.
- **OnPush**: Giảm CD; kết hợp immutable data hoặc reference mới.
- **trackBy** với **ngFor** / **@for**: Tránh re-create DOM node khi list thay đổi; luôn dùng khi list động.
- **Pure pipe**: Mặc định pipe pure → cache theo input reference. Tránh impure pipe không cần thiết (chạy mỗi CD).
- **Async pipe**: Một subscription, tự unsubscribe khi destroy → tránh leak và thường kết hợp tốt với OnPush.
- **Tránh logic nặng trong template**: Getter phức tạp gọi trong template sẽ chạy mỗi CD → nên dùng computed/signal hoặc property đã tính sẵn.
- **Bundle**: `ng build --stats-json`, phân tích chunk; tree-shake (import đúng path), kiểm tra dependency nặng; consider standalone và import trực tiếp thay vì barrel export lớn.

---

## Security

- **XSS**: Angular escape mặc định cho `{{ }}` và property binding. **Nguy cơ**: `[innerHTML]="userInput"` — chỉ dùng khi thật sự cần HTML và nội dung đã được **sanitize** (Angular sanitizer hoặc DomSanitizer). Không bind user input thô vào innerHTML.
- **Sanitization**: `DomSanitizer.sanitize(SecurityContext.HTML, value)` hoặc `bypassSecurityTrust*` chỉ khi nguồn tin cậy (ví dụ nội dung từ CMS đã kiểm tra).
- **CSRF**: Nếu dùng cookie/session, backend gửi CSRF token; Angular gửi lại trong header (có thể qua interceptor).
- **HTTP**: HTTPS; không lưu token nhạy cảm trong localStorage nếu có nguy cơ XSS; token trong memory hoặc httpOnly cookie (tùy kiến trúc).
- **CSP**: Content-Security-Policy header hạn chế script/style nguồn; tránh eval, inline script không kiểm soát.

---

## Kiến trúc ứng dụng lớn

- **Smart / Presentational**: Smart (container) component lấy data (service, store), xử lý logic; presentational (dumb) chỉ nhận @Input và phát @Output. Dễ test và tái sử dụng UI.
- **Core / Shared / Features**: Core: singleton services, guards, interceptors. Shared: component/pipe/directive dùng chung. Features: theo domain (product, order), mỗi feature có thể có routing, state, lazy load.
- **Monorepo**: Nx hoặc Angular workspace với nhiều app/library; share code qua library, build từng app.
- **State**: Đơn giản → service + signal/BehaviorSubject. Phức tạp, nhiều tương tác → NgRx (Store, Effects, Selectors). Tránh put toàn bộ state lên store nếu không cần.

---

## Debugging & tooling

- **Angular DevTools** (extension browser): Profiler (CD), component tree, injector tree, NgRx state. Dùng để xem component nào bị CD nhiều, dependency.
- **Source maps**: Production có thể dùng source map (hidden) để debug; không public map lên production nếu không cần.
- **augury** (legacy): Cũ, ưu tiên Angular DevTools.

---

## Checklist phỏng vấn Senior Angular

Sau khi học xong 01–16 (gồm AG-Grid), bạn nên trả lời rõ ràng các nhóm câu dưới đây. Đây là mức **senior / master Angular web builder**.

### Framework & tổ chức

- [ ] Giải thích **Change Detection**: Default vs OnPush, khi nào CD chạy với OnPush?
- [ ] **Zone.js** làm gì? Có thể chạy Angular không dùng Zone không (zoneless)?
- [ ] **Standalone** vs **NgModule**: Khi nào dùng từng cái? Lazy load với standalone?
- [ ] **Smart vs Presentational** component? Lợi ích cho test và scale?
- [ ] Cấu trúc **core / shared / features**; khi nào đặt service vào core vs feature?

### Components & Templates

- [ ] **Signal** vs **Observable** trong component? `toSignal()`, `computed`, `effect` dùng khi nào?
- [ ] **input()** / **output()** (signal API) vs **@Input()** / **@Output()**?
- [ ] **Content projection**: `ng-content`, single vs multi-slot (select)?
- [ ] **ViewEncapsulation**: Emulated, None, ShadowDom — khác nhau thế nào?
- [ ] **Control flow mới**: @if, @for, @switch — ưu điểm so với *ngIf, *ngFor?

### Forms & HTTP

- [ ] **Reactive Forms** vs **Template-driven**: So sánh, khi nào chọn cái nào?
- [ ] **ControlValueAccessor**: Dùng để làm gì? Ví dụ custom control tích hợp với form?
- [ ] **Interceptor** thứ tự xử lý request/response? Cách xử lý 401 toàn cục?
- [ ] **Retry**, **timeout**, **cancel** request với RxJS?

### State & RxJS

- [ ] **NgRx**: Action, Reducer, Effect, Selector — luồng dữ liệu từ dispatch đến UI?
- [ ] **switchMap** vs **mergeMap** vs **concatMap** vs **exhaustMap** — khác nhau và ví dụ dùng?
- [ ] **takeUntilDestroyed** vs **async** pipe — tránh memory leak thế nào?
- [ ] Khi nào dùng **NgRx** thay vì **service + signal**?

### UI, Animations & Data grid

- [ ] **Angular Animations**: trigger, state, transition, animate — dùng `:enter`/`:leave`, route animation? Khi nào dùng CSS animation thay vì Angular animation?
- [ ] **Angular CDK**: DragDrop, VirtualScroll, Overlay, A11y — khi nào dùng CDK thay vì viết tay?
- [ ] **AG-Grid** vs Material Table: Khi nào chọn AG-Grid? (data lớn, sort/filter/virtual scroll, export) — xem [16 - AG-Grid](16-ag-grid.md).
- [ ] Tích hợp **AG-Grid** với Angular: rowData/columnDefs binding, OnPush, Server-Side Row Model khi nào?

### Performance, Build & i18n

- [ ] Cách **giảm bundle size**? Lazy load, tree-shake, phân tích bundle?
- [ ] **AOT** vs **JIT**? Production dùng gì?
- [ ] **SSR** (Angular Universal): Lợi ích, điểm khác so với SPA khi deploy?
- [ ] **trackBy** với *ngFor/@for — tại sao quan trọng?
- [ ] **i18n**: Built-in (compile-time) vs runtime (ngx-translate/Transloco)? Khi nào chọn cái nào?

### Security & Testing

- [ ] **XSS** trong Angular: Cơ chế escape, rủi ro khi dùng innerHTML?
- [ ] **Global ErrorHandler**: Override ErrorHandler để log lỗi chưa xử lý lên monitoring service?
- [ ] Test **component** có **OnPush**: Cần gì đặc biệt? **HttpTestingController** dùng thế nào?
- [ ] **E2E** với Cypress/Playwright: Nên test những luồng nào?

### RxJS nâng cao

- [ ] **combineLatest** vs **forkJoin** vs **withLatestFrom** — khi nào dùng?
- [ ] **shareReplay**: Cache Observable, `refCount` là gì?
- [ ] **toSignal / toObservable**: Bridge giữa signal và Observable?

---

Nếu bạn trả lời được hầu hết các mục trên và áp dụng được vào thiết kế/implement một ứng dụng Angular lớn (routing, form, HTTP, state, **AG-Grid**, animations, i18n, lazy load, OnPush, test), bạn đạt mức **senior / master Angular web builder**. Ôn lại các bài tương ứng (02, 03, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, **16**) cho từng chủ đề.

→ Quay lại [README](../README.md) | [10 - State](10-state-architecture.md) | [14 - NgRx](14-ngrx.md) | [16 - AG-Grid](16-ag-grid.md)
