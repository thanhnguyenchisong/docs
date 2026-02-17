# RxJS trong Angular

Angular dùng RxJS (Observable) cho HTTP, Router, Forms, EventEmitter. Hiểu cơ bản Observable và operators giúp xử lý async và data flow đúng cách.

## Mục lục
1. [Observable cơ bản](#observable-cơ-bản)
2. [Operators thường dùng](#operators-thường-dùng)
3. [Subject và multicast](#subject-và-multicast)
4. [async pipe và unsubscribe](#async-pipe-và-unsubscribe)
5. [Kết hợp nhiều Observable](#kết-hợp-nhiều-observable)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Observable cơ bản

Observable là stream giá trị theo thời gian: emit 0, 1 hoặc nhiều giá trị, có thể complete hoặc error. Subscribe để nhận.

```typescript
import { Observable, of, from } from 'rxjs';

const obs$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});
obs$.subscribe({
  next: v => console.log(v),
  complete: () => console.log('done'),
});

of(1, 2, 3).subscribe(v => console.log(v));
from([1, 2, 3]).subscribe(v => console.log(v));
```

- **of**: Emit lần lượt các tham số rồi complete.
- **from**: Từ array, Promise, hoặc iterable → Observable.

---

## Operators thường dùng

Dùng trong `.pipe(...)`.

| Operator | Mục đích |
|----------|----------|
| `map` | Biến đổi từng giá trị |
| `filter` | Chỉ emit khi điều kiện true |
| `tap` | Side effect (log, không đổi value) |
| `catchError` | Bắt lỗi, trả về Observable mới |
| `switchMap` | Chuyển sang Observable khác, hủy Observable cũ (dùng cho search, route params) |
| `mergeMap` / `concatMap` | Map sang Observable, merge/concat kết quả |
| `debounceTime` | Chờ một khoảng không emit mới → dùng cho search input |
| `distinctUntilChanged` | Chỉ emit khi giá trị thay đổi |
| `takeUntilDestroyed` | Unsubscribe khi component destroy (Angular 16+) |

```typescript
this.route.params.pipe(
  switchMap(p => this.productService.getById(+p['id'])),
  catchError(() => of(null)),
).subscribe(product => this.product = product);
```

```typescript
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q)),
).subscribe(results => this.results = results);
```

---

## Subject và multicast

- **Subject**: Vừa Observable vừa Observer; nhiều subscriber dùng chung, emit qua `.next(value)`.
- **BehaviorSubject**: Có giá trị khởi tạo, subscriber mới nhận ngay giá trị hiện tại.
- **ReplaySubject**: Replay n giá trị gần nhất cho subscriber mới.

```typescript
private search$ = new BehaviorSubject<string>('');

setSearch(v: string) {
  this.search$.next(v);
}

getSearch(): Observable<string> {
  return this.search$.asObservable();
}
```

Dùng BehaviorSubject khi cần "giá trị hiện tại" (ví dụ user đã login, theme).

---

## async pipe và unsubscribe

**async pipe**: Subscribe Observable trong template và tự unsubscribe khi component destroy.

```html
@if (products$ | async; as products) {
  <ul>
    @for (p of products; track p.id) {
      <li>{{ p.name }}</li>
    }
  </ul>
}
```

Trong component chỉ cần:

```typescript
products$ = this.productService.getAll();
```

Tránh quên unsubscribe khi subscribe trong class:

```typescript
private destroyRef = inject(DestroyRef);
ngOnInit() {
  this.productService.getAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(list => this.products = list);
}
```

---

## Kết hợp nhiều Observable

Trong ứng dụng thực tế thường cần **kết hợp nhiều nguồn dữ liệu** (load song song, phụ thuộc chéo). Các operator sau rất quan trọng:

| Operator | Mục đích |
|----------|----------|
| `combineLatest` | Emit khi **bất kỳ** source nào emit; giá trị = mảng giá trị mới nhất của mỗi source. Dùng khi UI phụ thuộc nhiều nguồn (filter + data). |
| `forkJoin` | Chờ **tất cả** source complete rồi emit mảng kết quả cuối cùng. Dùng cho load song song nhiều API (như `Promise.all`). |
| `withLatestFrom` | Khi source chính emit, lấy giá trị mới nhất của source phụ. Dùng khi action cần kèm context (ví dụ submit + user hiện tại). |
| `shareReplay` | Chia sẻ subscription và replay n giá trị cho subscriber mới. Tránh gọi API trùng khi nhiều component subscribe cùng Observable. |

```typescript
// combineLatest: UI cập nhật khi filter hoặc data đổi
combineLatest([this.filter$, this.products$]).pipe(
  map(([filter, products]) => products.filter(p => p.name.includes(filter))),
).subscribe(filtered => this.filtered = filtered);

// forkJoin: load song song nhiều API
forkJoin({
  users: this.userService.getAll(),
  roles: this.roleService.getAll(),
}).subscribe(({ users, roles }) => {
  this.users = users;
  this.roles = roles;
});

// withLatestFrom: khi click submit, lấy user hiện tại
this.submit$.pipe(
  withLatestFrom(this.authService.currentUser$),
  switchMap(([formData, user]) => this.api.save({ ...formData, createdBy: user.id })),
).subscribe();

// shareReplay: tránh gọi API trùng
@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly config$ = this.http.get<AppConfig>('/api/config').pipe(
    shareReplay(1),  // cache 1 giá trị, nhiều subscriber dùng chung
  );
}
```

---

## Câu hỏi thường gặp

**switchMap vs mergeMap vs concatMap vs exhaustMap?**

| Operator | Hành vi | Ví dụ dùng |
|----------|---------|------------|
| `switchMap` | Hủy Observable cũ khi có emit mới | Search input, route params |
| `mergeMap` | Chạy song song, không hủy | Upload nhiều file cùng lúc |
| `concatMap` | Chạy tuần tự, chờ xong rồi mới chạy tiếp | Queue request đảm bảo thứ tự |
| `exhaustMap` | Bỏ qua emit mới nếu đang xử lý | Submit form (tránh double click) |

**combineLatest vs forkJoin?**  
`combineLatest` emit liên tục khi bất kỳ source đổi; dùng cho stream liên tục (filter, state). `forkJoin` chỉ emit **một lần** khi tất cả complete; dùng cho load dữ liệu xong rồi hiển thị.

**Khi nào dùng shareReplay?**  
Khi nhiều component subscribe cùng một HTTP call hoặc computed Observable; `shareReplay(1)` cache giá trị cuối, tránh gọi API lặp. Cẩn thận: nếu source là HTTP (complete ngay), `shareReplay(1)` cache mãi — dùng `{ refCount: true }` nếu muốn reset khi không còn subscriber.

**Khi nào dùng Subject?**  
Khi cần phát sự kiện/state từ service cho nhiều component (event bus, shared state đơn giản) hoặc khi chuyển từ event/callback sang Observable.

**Memory leak do không unsubscribe?**  
Có. Subscribe trong component mà không unsubscribe khi destroy sẽ giữ reference. Cách an toàn: async pipe hoặc takeUntilDestroyed.

---

## Senior / Master

- **Higher-order mapping**: Hiểu rõ sự khác nhau switchMap/mergeMap/concatMap/exhaustMap là **bắt buộc** cho senior. Chọn sai operator = bug (duplicate request, mất data, race condition).
- **Custom operator**: Tạo operator riêng bằng `pipe()` hoặc hàm trả về `OperatorFunction<T, R>` — dùng cho logic dùng chung (ví dụ retry with backoff, error transform).
- **toSignal / toObservable**: Angular 16+ bridge giữa signal và Observable; `toSignal(obs$)` chuyển Observable thành signal để dùng trong template không cần async pipe; `toObservable(signal)` chiều ngược lại.
- **Error handling strategy**: Trong pipe, `catchError` phải trả về Observable mới (không throw lại) nếu muốn stream tiếp tục; nếu không, stream terminates và subscriber không nhận giá trị nữa.

---

→ Tiếp theo: [10 - State & Kiến trúc](10-state-architecture.md)
