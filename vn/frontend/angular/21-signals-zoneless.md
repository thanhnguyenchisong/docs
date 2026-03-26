# Angular Signals Deep-dive & Zoneless

Signals là **hướng đi chính** của Angular từ v16+: reactive primitive thay thế dần Zone.js và RxJS cho state management trong component/service. Bài này đi sâu vào Signal ecosystem: **Signal Store (NgRx)**, **linkedSignal**, **resource()**, và **Zoneless Angular**.

## Mục lục
1. [Tổng quan Signal ecosystem](#tổng-quan-signal-ecosystem)
2. [signal, computed, effect — nâng cao](#signal-computed-effect--nâng-cao)
3. [linkedSignal — two-way derived state](#linkedsignal--two-way-derived-state)
4. [resource() — async data loading](#resource--async-data-loading)
5. [NgRx Signal Store](#ngrx-signal-store)
6. [Zoneless Angular](#zoneless-angular)
7. [Migration: Zone.js → Signals → Zoneless](#migration-zonejs--signals--zoneless)
8. [Best practices](#best-practices)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tổng quan Signal ecosystem

### Signal là gì? (Tóm tắt nhanh)

Signal = **giá trị reactive đồng bộ**: luôn có giá trị hiện tại, Angular theo dõi dependency và cập nhật template khi signal đổi — **không cần Zone.js** trigger change detection.

```typescript
const count = signal(0);           // WritableSignal<number>
const double = computed(() => count() * 2);  // Signal<number> (readonly)
effect(() => console.log(count())); // Side effect khi count đổi
```

### Timeline Angular Signals

| Version | Feature |
|---------|---------|
| Angular 16 | `signal()`, `computed()`, `effect()`, `toSignal()`, `toObservable()` |
| Angular 17 | `input()`, `output()`, `model()`, `viewChild()`, `contentChild()` signal queries |
| Angular 17.1 | Signal-based `input.required()` |
| Angular 17.2 | Experimental `linkedSignal()` |
| Angular 18 | `resource()` (experimental), Zoneless (experimental) |
| Angular 19 | `linkedSignal()` stable, `resource()` stable, Zoneless developer preview |

---

## signal, computed, effect — nâng cao

### signal() — WritableSignal

```typescript
// Tạo signal
const user = signal<User | null>(null);

// Đọc
const name = user()?.name;

// Set — thay thế hoàn toàn
user.set({ id: 1, name: 'Admin', role: 'admin' });

// Update — dựa trên giá trị hiện tại
const items = signal<Item[]>([]);
items.update(list => [...list, newItem]);       // Immutable update
items.update(list => list.filter(i => i.id !== id)); // Remove

// asReadonly — expose read-only cho bên ngoài
private _count = signal(0);
readonly count = this._count.asReadonly(); // Signal<number>, không set/update được
```

### computed() — derived state (memoized)

```typescript
const firstName = signal('Nguyễn');
const lastName = signal('Văn A');
const fullName = computed(() => `${firstName()} ${lastName()}`);

// computed chỉ tính lại khi dependency (firstName hoặc lastName) thực sự đổi
// Nếu gọi fullName() nhiều lần mà input không đổi → trả kết quả cache

// Computed phức tạp
const filteredProducts = computed(() => {
  const products = this.allProducts();
  const search = this.searchTerm().toLowerCase();
  const category = this.selectedCategory();

  return products
    .filter(p => category === 'all' || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search));
});
```

**Lưu ý:**
- computed **không có side effect** — không gọi API, không set signal khác bên trong.
- computed **lazy**: chỉ tính khi được đọc (và dependency đổi).

### effect() — side effects

```typescript
// Chạy mỗi khi bất kỳ signal bên trong đổi
effect(() => {
  console.log('User changed:', this.user());
  localStorage.setItem('user', JSON.stringify(this.user()));
});

// effect chỉ chạy trong injection context (constructor, field init)
// Nếu cần tạo effect ngoài constructor:
constructor() {
  // OK
  effect(() => this.syncToLocalStorage());
}

// Hoặc dùng Injector:
private injector = inject(Injector);
ngOnInit() {
  effect(() => this.doSomething(), { injector: this.injector });
}
```

**Cleanup trong effect:**

```typescript
effect((onCleanup) => {
  const id = this.userId();
  const controller = new AbortController();

  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => this.userData.set(data));

  onCleanup(() => controller.abort()); // Hủy request cũ khi userId đổi
});
```

### toSignal() và toObservable() — bridge

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
const products = toSignal(this.productService.getAll(), {
  initialValue: [],           // Giá trị ban đầu (trước khi Observable emit)
});
// Dùng trong template: products() — không cần async pipe

// Với requireSync: true (cho BehaviorSubject — đã có giá trị)
const user = toSignal(this.authService.user$, { requireSync: true });

// Signal → Observable
const search = signal('');
const search$ = toObservable(this.search);
// search$ emit mỗi khi search signal đổi
```

---

## linkedSignal — two-way derived state

### linkedSignal là gì?

**linkedSignal** (Angular 17.2+, stable từ v19) = signal **writable** mà giá trị **tự reset** khi source signal đổi. Khác computed (readonly), linkedSignal cho phép ghi đè tạm thời nhưng reset khi dependency đổi.

### Ví dụ: Selected item reset khi list đổi

```typescript
// Khi products đổi (filter, search), selectedProduct tự reset về item đầu tiên
// Nhưng user vẫn có thể chọn product khác (set thủ công)

const products = signal<Product[]>([]);
const selectedProduct = linkedSignal<Product[], Product | null>({
  source: products,
  computation: (products) => products[0] ?? null,  // Reset: chọn item đầu
});

// User chọn item khác
selectedProduct.set(products()[2]); // OK — writable

// Khi products thay đổi (ví dụ API trả list mới)
products.set(newList);
// → selectedProduct tự động reset về newList[0]
```

### Shorthand

```typescript
// Khi chỉ cần map đơn giản
const selectedIndex = linkedSignal(() => 0); // Reset về 0 mỗi khi... không có source cụ thể

// Với source rõ ràng
const page = signal(1);
const offset = linkedSignal({
  source: page,
  computation: (page) => (page - 1) * 20,
});
// offset writable: có thể set thủ công, nhưng khi page đổi → re-compute
```

### Ví dụ thực tế: Tab + form reset

```typescript
@Component({ ... })
export class ProductEditComponent {
  // Khi đổi tab (product), form values tự reset
  activeProduct = input.required<Product>();

  formValues = linkedSignal({
    source: this.activeProduct,
    computation: (product) => ({
      name: product.name,
      price: product.price,
      description: product.description,
    }),
  });

  updateField(field: string, value: any) {
    this.formValues.update(v => ({ ...v, [field]: value }));
  }

  // Khi activeProduct đổi (cha truyền product mới) → formValues reset
  // User edit form → formValues cập nhật nhưng không ảnh hưởng gì
}
```

### linkedSignal vs computed

| | computed | linkedSignal |
|---|---------|-------------|
| **Writable** | ❌ Readonly | ✅ Writable (set/update) |
| **Reset khi source đổi** | Luôn tính lại | ✅ Tính lại, nhưng có thể ghi đè tạm |
| **Use case** | Derived data thuần (fullName, filtered list) | State cần auto-reset nhưng vẫn cho phép override (selected item, form defaults, pagination) |

---

## resource() — async data loading

### resource() là gì?

**resource()** (Angular 18+, stable v19) = cách **declarative** để load dữ liệu async trong component, **dựa trên signal**. Khi signal dependency đổi → resource tự động re-fetch.

### Cú pháp

```typescript
import { resource, Signal } from '@angular/core';

@Component({ ... })
export class ProductDetailComponent {
  productId = input.required<number>();

  // resource tự gọi lại khi productId đổi
  productResource = resource({
    request: () => ({ id: this.productId() }),  // Signal dependency
    loader: async ({ request, abortSignal }) => {
      const res = await fetch(`/api/products/${request.id}`, {
        signal: abortSignal,  // Tự abort khi re-fetch
      });
      if (!res.ok) throw new Error('Failed to load');
      return res.json() as Promise<Product>;
    },
  });
}
```

### Sử dụng trong template

```html
@switch (productResource.status()) {
  @case ('loading') {
    <div class="skeleton">Đang tải sản phẩm...</div>
  }
  @case ('resolved') {
    <app-product-card [product]="productResource.value()!" />
  }
  @case ('error') {
    <div class="error">
      Lỗi: {{ productResource.error() }}
      <button (click)="productResource.reload()">Thử lại</button>
    </div>
  }
  @case ('idle') {
    <p>Chưa có dữ liệu</p>
  }
}
```

### Resource status

| Status | Ý nghĩa |
|--------|---------|
| `'idle'` | Chưa bắt đầu load |
| `'loading'` | Đang fetch |
| `'reloading'` | Đang re-fetch (đã có data cũ) |
| `'resolved'` | Thành công — `.value()` có dữ liệu |
| `'error'` | Thất bại — `.error()` có Error |
| `'local'` | Đã set giá trị cục bộ (không qua loader) |

### rxResource — dùng với Observable (HttpClient)

```typescript
import { rxResource } from '@angular/core/rxjs-interop';

@Component({ ... })
export class ProductListComponent {
  private productService = inject(ProductService);
  category = signal('all');

  productsResource = rxResource({
    request: () => ({ category: this.category() }),
    loader: ({ request }) => this.productService.getByCategory(request.category),
    // loader trả về Observable — rxResource tự subscribe/unsubscribe
  });
}
```

### resource vs service + ngOnInit

| | resource() | Service + ngOnInit |
|---|-----------|-------------------|
| **Re-fetch khi input đổi** | Tự động (signal dependency) | Phải tự subscribe route.params hoặc ngOnChanges |
| **Abort request cũ** | Tự động (abortSignal) | Phải tự switchMap hoặc unsubscribe |
| **Loading/Error state** | Built-in (status, value, error) | Phải tự quản lý biến loading, error |
| **Template** | Truy cập trực tiếp: resource.value() | Cần biến riêng hoặc async pipe |

---

## NgRx Signal Store

### Signal Store là gì?

**@ngrx/signals** (NgRx Signal Store) = state management **nhẹ**, dùng **signals** thay vì Redux boilerplate (actions, reducers, effects). Ít code hơn NgRx Store truyền thống, phù hợp cho feature state hoặc app trung bình.

### Cài đặt

```bash
npm install @ngrx/signals
```

### Ví dụ cơ bản: Product Store

```typescript
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { ProductService } from './product.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

// 1. Định nghĩa state
interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  filter: string;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  filter: '',
};

// 2. Tạo store
export const ProductStore = signalStore(
  { providedIn: 'root' },  // hoặc provide trong component/route

  withState(initialState),

  withComputed((store) => ({
    filteredProducts: computed(() => {
      const filter = store.filter().toLowerCase();
      return store.products().filter(p =>
        p.name.toLowerCase().includes(filter)
      );
    }),
    productCount: computed(() => store.products().length),
    hasProducts: computed(() => store.products().length > 0),
  })),

  withMethods((store) => {
    const productService = inject(ProductService);

    return {
      // Method đồng bộ — patchState cập nhật state
      setFilter(filter: string) {
        patchState(store, { filter });
      },

      // Method async — gọi API
      async loadProducts() {
        patchState(store, { loading: true, error: null });
        try {
          const products = await firstValueFrom(productService.getAll());
          patchState(store, { products, loading: false });
        } catch (err) {
          patchState(store, { error: 'Không tải được', loading: false });
        }
      },

      addProduct(product: Product) {
        patchState(store, (state) => ({
          products: [...state.products, product],
        }));
      },

      removeProduct(id: number) {
        patchState(store, (state) => ({
          products: state.products.filter(p => p.id !== id),
        }));
      },
    };
  }),

  // Lifecycle hooks
  withHooks({
    onInit(store) {
      store.loadProducts(); // Tự load khi store khởi tạo
    },
  }),
);
```

### Dùng trong Component

```typescript
@Component({
  providers: [ProductStore],  // hoặc inject nếu providedIn: 'root'
  template: `
    <input
      [value]="store.filter()"
      (input)="store.setFilter($any($event.target).value)"
      placeholder="Tìm sản phẩm..."
    />

    @if (store.loading()) {
      <p>Đang tải...</p>
    } @else {
      @for (p of store.filteredProducts(); track p.id) {
        <div class="product-card">
          {{ p.name }} - {{ p.price | currency:'VND' }}
          <button (click)="store.removeProduct(p.id)">Xóa</button>
        </div>
      }

      @empty {
        <p>Không tìm thấy sản phẩm</p>
      }
    }

    @if (store.error()) {
      <p class="error">{{ store.error() }}</p>
    }
  `,
})
export class ProductListComponent {
  readonly store = inject(ProductStore);
}
```

### rxMethod — reactive methods với Observable

```typescript
withMethods((store) => {
  const productService = inject(ProductService);

  return {
    loadByCategory: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((category) =>
          productService.getByCategory(category).pipe(
            tap({
              next: (products) => patchState(store, { products, loading: false }),
              error: (err) => patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),
  };
}),
```

### Custom Store Features (DRY)

```typescript
// Tạo feature tái sử dụng
import { signalStoreFeature, withState, withComputed } from '@ngrx/signals';

// Feature: loading + error state
export function withLoadingState() {
  return signalStoreFeature(
    withState({ loading: false, error: null as string | null }),
    withMethods((store) => ({
      setLoading() { patchState(store, { loading: true, error: null }); },
      setLoaded() { patchState(store, { loading: false }); },
      setError(error: string) { patchState(store, { loading: false, error }); },
    })),
  );
}

// Dùng trong store
export const OrderStore = signalStore(
  withState({ orders: [] as Order[] }),
  withLoadingState(),  // Reuse!
  withMethods((store) => ({
    async loadOrders() {
      store.setLoading();
      try {
        const orders = await fetchOrders();
        patchState(store, { orders });
        store.setLoaded();
      } catch {
        store.setError('Lỗi tải đơn hàng');
      }
    },
  })),
);
```

### NgRx Signal Store vs NgRx Store (truyền thống)

| | Signal Store | NgRx Store |
|---|-------------|-----------|
| **Boilerplate** | Ít — không cần actions, reducers riêng | Nhiều — actions, reducers, effects, selectors files |
| **API** | `signalStore`, `withState`, `withMethods` | `createAction`, `createReducer`, `createEffect`, `createSelector` |
| **State access** | Signal (đồng bộ): `store.products()` | Observable: `store.select(...)` hoặc `selectSignal` |
| **Side effects** | `async/await` hoặc `rxMethod` trong `withMethods` | `@ngrx/effects` (class riêng) |
| **DevTools** | Hỗ trợ (cần plugin) | ✅ Đầy đủ (Redux DevTools) |
| **Phù hợp** | Feature state, app vừa, prototype nhanh | App lớn, team quen Redux, cần strict pattern |

---

## Zoneless Angular

### Zone.js là gì và tại sao bỏ?

**Zone.js** = thư viện monkey-patch mọi API async (setTimeout, Promise, addEventListener, XHR...) để Angular biết khi nào cần chạy change detection. Nhược điểm:
- **Overhead**: Patch mọi event dù không liên quan Angular.
- **Bundle size**: ~13KB gzipped.
- **Server compatibility**: Khó dùng trong SSR/edge.
- **Debugging**: Call stack phức tạp vì Zone wrapper.

### Zoneless Angular — Signal-based Change Detection

Angular 18+ (experimental), Angular 19 (developer preview): chạy Angular **không có Zone.js**. Change detection dựa trên **signal notifications** thay vì Zone patches.

### Bật Zoneless

```typescript
// app.config.ts
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // Bỏ provideZoneChangeDetection() nếu có
  ],
});
```

```json
// angular.json — bỏ zone.js khỏi polyfills
{
  "polyfills": []  // Xóa "zone.js"
}
```

### Khi nào Change Detection chạy (Zoneless)?

| Trigger | CD chạy? |
|---------|----------|
| Signal value đổi | ✅ Có |
| `input()` signal đổi | ✅ Có |
| `async` pipe emit | ✅ Có |
| Event binding `(click)="..."` | ✅ Có (Angular tự schedule) |
| `setTimeout` / `setInterval` | ❌ KHÔNG (Zone không patch) |
| `fetch()` / `XMLHttpRequest` callback | ❌ KHÔNG |
| `ChangeDetectorRef.markForCheck()` | ✅ Có |

### Cách viết code cho Zoneless

```typescript
@Component({
  template: `
    <p>Count: {{ count() }}</p>
    <p>Time: {{ currentTime() }}</p>
    <button (click)="increment()">+1</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  currentTime = signal(new Date());

  constructor() {
    // ❌ SAI trong zoneless — setTimeout không trigger CD
    // setInterval(() => this.currentTime = new Date(), 1000);

    // ✅ ĐÚNG — dùng signal
    setInterval(() => this.currentTime.set(new Date()), 1000);

    // ✅ HOẶC dùng effect (nếu logic phức tạp)
  }

  increment() {
    this.count.update(c => c + 1); // Signal → CD tự chạy
  }
}
```

### Checklist Zoneless-ready

- [ ] Mọi state trong component dùng **signal** (không dùng plain property + Zone trigger)
- [ ] Dùng `input()`, `output()`, `model()` thay `@Input()`, `@Output()`
- [ ] Dùng `viewChild()`, `contentChild()` signal queries thay `@ViewChild()`
- [ ] Không dựa vào `setTimeout`/`setInterval` để trigger CD — dùng signal.set/update
- [ ] Dùng `async` pipe hoặc `toSignal()` cho Observable
- [ ] Tránh `ChangeDetectorRef.detectChanges()` — dùng `markForCheck()` hoặc signal

---

## Migration: Zone.js → Signals → Zoneless

### Bước 1: Chuyển component property sang Signal

```typescript
// Trước
export class MyComponent {
  title = 'Hello';
  items: Item[] = [];
  loading = false;
}

// Sau
export class MyComponent {
  title = signal('Hello');
  items = signal<Item[]>([]);
  loading = signal(false);
}
```

### Bước 2: Chuyển @Input/@Output sang signal API

```typescript
// Trước
@Input() product!: Product;
@Output() deleted = new EventEmitter<number>();

// Sau
product = input.required<Product>();
deleted = output<number>();
```

### Bước 3: Chuyển getter sang computed

```typescript
// Trước
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

// Sau
fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
```

### Bước 4: Chuyển subscribe sang toSignal

```typescript
// Trước
ngOnInit() {
  this.route.params.subscribe(p => this.productId = p['id']);
}

// Sau
productId = toSignal(
  this.route.params.pipe(map(p => p['id'])),
  { initialValue: '' }
);
```

### Bước 5: Bật Zoneless (khi toàn bộ app đã signal-ready)

---

## Best practices

| Nội dung | Gợi ý |
|----------|-------|
| **Signal vs Observable** | Signal cho state đồng bộ (UI state, form state). Observable cho stream async (HTTP, WebSocket, timer phức tạp) |
| **computed vs method** | computed: cached, reactive. Method: chạy mỗi lần gọi. Ưu tiên computed cho derived state |
| **effect** | Chỉ cho side effect (log, localStorage, analytics). **Không** set signal trong effect nếu có thể dùng computed |
| **Signal Store scope** | `providedIn: 'root'` cho global state. Provide trong component cho scoped state (mỗi instance riêng) |
| **Immutable update** | Luôn dùng `update()` với spread/map/filter — không mutate trực tiếp |
| **resource()** | Dùng cho API call phụ thuộc input signal. Dùng `rxResource` khi cần HttpClient/Observable |

---

## Câu hỏi thường gặp

**linkedSignal vs computed?**
computed = readonly, luôn tính từ source. linkedSignal = writable, tự reset khi source đổi nhưng cho phép ghi đè tạm. Dùng linkedSignal khi có "default value" cần reset (selected item, form defaults).

**resource() có thay thế HttpClient không?**
Không hoàn toàn. resource/rxResource là **cách khai báo** data loading trong component. HttpClient vẫn dùng trong service — rxResource gọi service method. resource() dùng fetch() trực tiếp nếu muốn.

**Có bắt buộc chuyển sang Zoneless không?**
Chưa. Zone.js vẫn là mặc định. Nhưng Angular team đang hướng tới Zoneless là default trong tương lai (v20+). Bắt đầu dùng signals trong code mới là bước chuẩn bị tốt.

**Signal Store có thay NgRx Store không?**
Tùy. Signal Store đủ cho hầu hết app. NgRx Store truyền thống vẫn mạnh hơn về DevTools, strict pattern, và team convention. Có thể dùng cả hai trong cùng app (Signal Store cho feature nhỏ, NgRx Store cho core state).

**effect() có chạy trên server (SSR) không?**
Mặc định có. Nếu effect dùng browser API (localStorage, window), cần guard bằng `isPlatformBrowser()` hoặc dùng `afterNextRender()`.

---

→ Xem thêm: [03 - Components (Signals cơ bản)](03-components-templates.md) | [14 - NgRx](14-ngrx.md) | [15 - Master Angular](15-master-angular.md)
→ Tiếp theo: [22 - SSR & Hydration](22-ssr-hydration.md)
