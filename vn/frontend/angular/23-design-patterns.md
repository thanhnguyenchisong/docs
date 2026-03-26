# Design Patterns & Enterprise Architecture trong Angular

Các design pattern giúp code Angular **dễ bảo trì, mở rộng và test** — đặc biệt quan trọng trong ứng dụng enterprise. Bài này trình bày các pattern phổ biến nhất áp dụng trong Angular.

## Mục lục
1. [Design Patterns là gì? (Cho người mới)](#design-patterns-là-gì-cho-người-mới)
2. [Smart / Presentational Components](#smart--presentational-components)
3. [Facade Pattern](#facade-pattern)
4. [Strategy Pattern](#strategy-pattern)
5. [Adapter Pattern](#adapter-pattern)
6. [Mediator Pattern (Event Bus)](#mediator-pattern-event-bus)
7. [Repository Pattern](#repository-pattern)
8. [Observer Pattern (đã dùng sẵn)](#observer-pattern-đã-dùng-sẵn)
9. [Error Handling Architecture](#error-handling-architecture)
10. [Accessibility (a11y) chuyên sâu](#accessibility-a11y-chuyên-sâu)
11. [Enterprise Project Structure](#enterprise-project-structure)
12. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Design Patterns là gì? (Cho người mới)

- **Design Pattern** = giải pháp đã được chứng minh cho các vấn đề phổ biến trong thiết kế phần mềm. Không phải code copy-paste, mà là **hướng dẫn tổ chức code** để dễ đọc, dễ sửa, dễ test.
- Trong Angular, bạn **đã dùng** nhiều pattern mà không biết: Dependency Injection (DI), Observer (RxJS), Decorator (@Component), Singleton (providedIn: 'root').
- Bài này tập trung vào pattern **ở tầng kiến trúc**: cách tổ chức component, service, state cho app lớn — không phải pattern ở tầng class nhỏ.

---

## Smart / Presentational Components

### Pattern

Tách component thành hai loại:

| Loại | Còn gọi là | Trách nhiệm |
|------|-----------|-------------|
| **Smart (Container)** | Page, Feature | Lấy data (service/store), xử lý logic, dispatch action |
| **Presentational (Dumb)** | UI, Pure | Chỉ nhận @Input, phát @Output — không biết data từ đâu |

### Ví dụ

```typescript
// ========== PRESENTATIONAL — chỉ lo UI ==========
@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ product().price | currency:'VND' }}</p>
      <button (click)="addToCart.emit(product())">Thêm vào giỏ</button>
    </div>
  `,
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();
  // ❌ Không inject service
  // ❌ Không gọi API
  // ❌ Không biết store/state
}

// ========== SMART — lo logic ==========
@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    @for (p of store.filteredProducts(); track p.id) {
      <app-product-card
        [product]="p"
        (addToCart)="onAddToCart($event)"
      />
    }
  `,
})
export class ProductListPageComponent {
  readonly store = inject(ProductStore);

  onAddToCart(product: Product) {
    this.store.addToCart(product);
  }
}
```

### Lợi ích

- **Test dễ**: Presentational test bằng input/output, không mock service. Smart test logic.
- **Tái sử dụng**: ProductCard dùng ở nhiều nơi (search results, wishlist, recommendations).
- **OnPush**: Presentational component + OnPush = performance tốt nhất.

---

## Facade Pattern

### Vấn đề

Component phải inject **nhiều service** (ProductService, CartService, AuthService, AnalyticsService...) → component phình to, khó test, coupling cao.

### Giải pháp: Facade Service

Facade = **một service trung gian** gom nhiều service thành **API đơn giản** cho component.

```typescript
// ========== FACADE ==========
@Injectable({ providedIn: 'root' })
export class ProductFacade {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private analytics = inject(AnalyticsService);

  // State (signals)
  readonly products = this.productService.products;
  readonly loading = this.productService.loading;
  readonly cartCount = this.cartService.itemCount;
  readonly isLoggedIn = this.authService.isLoggedIn;

  // Actions — che giấu logic phức tạp
  async loadProducts(category?: string) {
    await this.productService.loadByCategory(category ?? 'all');
    this.analytics.track('products_viewed', { category });
  }

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      // Redirect to login
      return;
    }
    this.cartService.add(product);
    this.analytics.track('add_to_cart', { productId: product.id });
  }

  search(query: string) {
    this.productService.filterByName(query);
    this.analytics.track('search', { query });
  }
}

// ========== COMPONENT — đơn giản ==========
@Component({ ... })
export class ProductPageComponent {
  private facade = inject(ProductFacade);

  products = this.facade.products;
  loading = this.facade.loading;
  cartCount = this.facade.cartCount;

  ngOnInit() { this.facade.loadProducts(); }
  onAddToCart(p: Product) { this.facade.addToCart(p); }
  onSearch(q: string) { this.facade.search(q); }
}
```

### Khi nào dùng Facade

- Component cần **≥ 3 service** → gom vào facade.
- Logic nghiệp vụ **chéo nhiều service** (add to cart + analytics + auth check).
- **Phổ biến với NgRx**: Facade che giấu store.dispatch/select, component không biết NgRx.

---

## Strategy Pattern

### Vấn đề

Cùng một hành vi nhưng **nhiều cách thực hiện** khác nhau (validation rules, pricing, export format, notification channel...). If/else hoặc switch dài, khó mở rộng.

### Giải pháp: Strategy + DI

```typescript
// ========== Interface (strategy) ==========
export interface ExportStrategy {
  export(data: any[]): Blob;
  mimeType: string;
  extension: string;
}

// ========== Implementations ==========
@Injectable()
export class CsvExportStrategy implements ExportStrategy {
  mimeType = 'text/csv';
  extension = 'csv';

  export(data: any[]): Blob {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    return new Blob([csv], { type: this.mimeType });
  }
}

@Injectable()
export class JsonExportStrategy implements ExportStrategy {
  mimeType = 'application/json';
  extension = 'json';

  export(data: any[]): Blob {
    return new Blob([JSON.stringify(data, null, 2)], { type: this.mimeType });
  }
}

@Injectable()
export class ExcelExportStrategy implements ExportStrategy {
  mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  extension = 'xlsx';

  export(data: any[]): Blob {
    // Dùng thư viện xlsx
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([buf], { type: this.mimeType });
  }
}

// ========== Service sử dụng strategy ==========
export const EXPORT_STRATEGIES = new InjectionToken<Map<string, ExportStrategy>>('export.strategies');

@Injectable({ providedIn: 'root' })
export class ExportService {
  private strategies = inject(EXPORT_STRATEGIES);

  export(data: any[], format: string): void {
    const strategy = this.strategies.get(format);
    if (!strategy) throw new Error(`Unknown format: ${format}`);

    const blob = strategy.export(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${strategy.extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ========== Provide ==========
providers: [
  CsvExportStrategy,
  JsonExportStrategy,
  {
    provide: EXPORT_STRATEGIES,
    useFactory: () => {
      const map = new Map<string, ExportStrategy>();
      map.set('csv', inject(CsvExportStrategy));
      map.set('json', inject(JsonExportStrategy));
      return map;
    },
  },
],
```

### Dùng trong Component

```typescript
export class ReportComponent {
  private exportService = inject(ExportService);

  exportAs(format: string) {
    this.exportService.export(this.reportData, format);
  }
}
```

```html
<button (click)="exportAs('csv')">Export CSV</button>
<button (click)="exportAs('json')">Export JSON</button>
```

---

## Adapter Pattern

### Vấn đề

Backend trả dữ liệu **format khác** với format app cần (naming convention, cấu trúc nested, date format...). Hoặc đổi API version mà không muốn sửa toàn bộ component.

### Giải pháp: Adapter Service

```typescript
// ========== Backend DTO (snake_case) ==========
interface ProductApiDto {
  product_id: number;
  product_name: string;
  unit_price: number;
  created_at: string;
  category_info: {
    cat_id: number;
    cat_name: string;
  };
}

// ========== App Model (camelCase, flat) ==========
interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  categoryId: number;
  categoryName: string;
}

// ========== Adapter ==========
@Injectable({ providedIn: 'root' })
export class ProductAdapter {
  fromApi(dto: ProductApiDto): Product {
    return {
      id: dto.product_id,
      name: dto.product_name,
      price: dto.unit_price,
      createdAt: new Date(dto.created_at),
      categoryId: dto.category_info.cat_id,
      categoryName: dto.category_info.cat_name,
    };
  }

  toApi(product: Partial<Product>): Partial<ProductApiDto> {
    return {
      product_name: product.name,
      unit_price: product.price,
      category_info: product.categoryId
        ? { cat_id: product.categoryId, cat_name: product.categoryName ?? '' }
        : undefined,
    };
  }

  fromApiList(dtos: ProductApiDto[]): Product[] {
    return dtos.map(dto => this.fromApi(dto));
  }
}

// ========== Service dùng Adapter ==========
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private adapter = inject(ProductAdapter);

  getAll(): Observable<Product[]> {
    return this.http.get<ProductApiDto[]>('/api/products').pipe(
      map(dtos => this.adapter.fromApiList(dtos)),
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    const dto = this.adapter.toApi(product);
    return this.http.post<ProductApiDto>('/api/products', dto).pipe(
      map(dto => this.adapter.fromApi(dto)),
    );
  }
}
```

### Lợi ích

- Đổi API version → chỉ sửa adapter, không sửa component/service/store.
- App model consistent (camelCase, flat) — component/template không cần biết API format.
- Test dễ: test adapter riêng (input/output mapping).

---

## Mediator Pattern (Event Bus)

### Vấn đề

Nhiều component cần **thông báo lẫn nhau** mà không có quan hệ cha-con (ví dụ: toast notification, global event, cross-feature communication).

### Giải pháp: Event Bus Service

```typescript
// ========== Typed Event Bus ==========
interface AppEvent {
  type: string;
  payload?: any;
}

interface ToastEvent extends AppEvent {
  type: 'toast';
  payload: { message: string; severity: 'success' | 'error' | 'info' };
}

interface CartUpdatedEvent extends AppEvent {
  type: 'cart:updated';
  payload: { itemCount: number };
}

type AppEvents = ToastEvent | CartUpdatedEvent;

@Injectable({ providedIn: 'root' })
export class EventBus {
  private events$ = new Subject<AppEvents>();

  emit(event: AppEvents): void {
    this.events$.next(event);
  }

  on<T extends AppEvents>(type: T['type']): Observable<T> {
    return this.events$.pipe(
      filter((event): event is T => event.type === type),
    );
  }
}

// ========== Gửi event ==========
@Injectable({ providedIn: 'root' })
export class CartService {
  private eventBus = inject(EventBus);

  addItem(item: CartItem) {
    this._items.update(list => [...list, item]);
    this.eventBus.emit({
      type: 'toast',
      payload: { message: 'Đã thêm vào giỏ', severity: 'success' },
    });
    this.eventBus.emit({
      type: 'cart:updated',
      payload: { itemCount: this._items().length },
    });
  }
}

// ========== Nhận event ==========
@Component({ ... })
export class ToastComponent implements OnInit {
  private eventBus = inject(EventBus);
  private destroyRef = inject(DestroyRef);
  toasts = signal<Toast[]>([]);

  ngOnInit() {
    this.eventBus.on<ToastEvent>('toast').pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => {
      this.toasts.update(list => [...list, {
        id: Date.now(),
        ...event.payload,
      }]);
    });
  }
}
```

### Lưu ý

- **Đừng lạm dụng**: Event Bus dùng khi component **thực sự** không liên quan. Nếu có quan hệ cha-con → dùng @Input/@Output. Nếu cùng feature → dùng shared service/store.
- Dùng **typed events** để tránh lỗi runtime.

---

## Repository Pattern

### Vấn đề

Service vừa chứa logic nghiệp vụ vừa gọi API → khó test, khó đổi data source (REST → GraphQL, hoặc mock).

### Giải pháp: Tách Repository

```typescript
// ========== Repository Interface ==========
export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract getById(id: number): Observable<Product>;
  abstract create(product: Partial<Product>): Observable<Product>;
  abstract update(id: number, product: Partial<Product>): Observable<Product>;
  abstract delete(id: number): Observable<void>;
}

// ========== REST Implementation ==========
@Injectable()
export class ProductRestRepository extends ProductRepository {
  private http = inject(HttpClient);
  private adapter = inject(ProductAdapter);
  private url = '/api/products';

  getAll(): Observable<Product[]> {
    return this.http.get<ProductApiDto[]>(this.url).pipe(
      map(dtos => this.adapter.fromApiList(dtos)),
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<ProductApiDto>(`${this.url}/${id}`).pipe(
      map(dto => this.adapter.fromApi(dto)),
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<ProductApiDto>(this.url, this.adapter.toApi(product)).pipe(
      map(dto => this.adapter.fromApi(dto)),
    );
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<ProductApiDto>(`${this.url}/${id}`, this.adapter.toApi(product)).pipe(
      map(dto => this.adapter.fromApi(dto)),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

// ========== Provide ==========
providers: [
  { provide: ProductRepository, useClass: ProductRestRepository },
  // Đổi sang GraphQL? Chỉ cần:
  // { provide: ProductRepository, useClass: ProductGraphQLRepository },
],

// ========== Service dùng Repository (không biết REST hay GraphQL) ==========
@Injectable({ providedIn: 'root' })
export class ProductService {
  private repo = inject(ProductRepository);
  // ... business logic dùng this.repo.getAll(), this.repo.create(), etc.
}
```

---

## Observer Pattern (đã dùng sẵn)

Angular **đã tích hợp** Observer pattern qua:

| Cơ chế | Observer Pattern |
|--------|-----------------|
| **RxJS Observable** | Subscribe/emit/complete — toàn bộ HTTP, Router, Forms |
| **EventEmitter / output()** | Component con phát event lên cha |
| **Signal** | Reactive: computed/effect tự track dependency |
| **NgRx Store** | store.select() → subscribe state changes |

→ Bạn **không cần** implement Observer pattern thủ công — Angular đã cung cấp đầy đủ.

---

## Error Handling Architecture

### Tầng Error Handling

```
┌─────────────────────────────────────────┐
│  Component (UI error display)           │  ← Hiển thị lỗi cho user
├─────────────────────────────────────────┤
│  Facade / Store (business error logic)  │  ← Xử lý logic lỗi nghiệp vụ
├─────────────────────────────────────────┤
│  Interceptor (HTTP error)               │  ← 401/403/500 handling
├─────────────────────────────────────────┤
│  Global ErrorHandler (unhandled)        │  ← Catch-all, log to monitoring
└─────────────────────────────────────────┘
```

### 1. Global ErrorHandler — catch mọi lỗi chưa xử lý

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: any): void {
    // Lazy inject để tránh circular dependency
    const monitoring = this.injector.get(MonitoringService);
    const notifier = this.injector.get(NotificationService);

    // Log lỗi
    console.error('Unhandled error:', error);

    // Gửi lên monitoring (Sentry, Datadog)
    monitoring.captureError(error);

    // Thông báo user (nếu runtime error)
    if (error instanceof HttpErrorResponse) {
      // HTTP error đã xử lý trong interceptor
    } else {
      notifier.showError('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
}

// Đăng ký
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler },
],
```

### 2. HTTP Error Interceptor — xử lý lỗi API

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifier = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          router.navigate(['/login']);
          break;
        case 403:
          notifier.showError('Bạn không có quyền truy cập');
          break;
        case 404:
          // Có thể bỏ qua hoặc xử lý ở component
          break;
        case 422:
          // Validation error — trả về cho component xử lý
          break;
        case 500:
          notifier.showError('Lỗi hệ thống. Vui lòng thử lại sau.');
          break;
        case 0:
          notifier.showError('Không thể kết nối server. Kiểm tra mạng.');
          break;
      }
      return throwError(() => err);
    }),
  );
};
```

### 3. Notification Service — UI feedback

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _messages = signal<Notification[]>([]);
  readonly messages = this._messages.asReadonly();

  showSuccess(message: string, duration = 3000) {
    this.show({ message, type: 'success', duration });
  }

  showError(message: string, duration = 5000) {
    this.show({ message, type: 'error', duration });
  }

  showInfo(message: string, duration = 3000) {
    this.show({ message, type: 'info', duration });
  }

  private show(notification: Omit<Notification, 'id'>) {
    const id = Date.now();
    this._messages.update(list => [...list, { ...notification, id }]);

    setTimeout(() => {
      this._messages.update(list => list.filter(n => n.id !== id));
    }, notification.duration);
  }
}
```

---

## Accessibility (a11y) chuyên sâu

### Checklist a11y cho Angular

| Hạng mục | Thực hiện |
|----------|-----------|
| **Semantic HTML** | Dùng `<nav>`, `<main>`, `<article>`, `<section>`, `<button>` đúng nơi |
| **ARIA roles** | `role="dialog"`, `role="alert"`, `aria-label`, `aria-describedby` |
| **Focus management** | Focus vào dialog khi mở, quay lại trigger khi đóng |
| **Keyboard navigation** | Tab, Escape, Enter, Arrow keys cho custom component |
| **Color contrast** | Ratio ≥ 4.5:1 (text), ≥ 3:1 (large text) |
| **Screen reader** | Test với NVDA/VoiceOver — đảm bảo content đọc được |
| **Live regions** | `aria-live="polite"` cho thông báo động (toast, validation) |

### Angular CDK A11y Module

```typescript
import { A11yModule } from '@angular/cdk/a11y';

// FocusTrap — giữ focus trong dialog
@Component({
  imports: [A11yModule],
  template: `
    <div cdkTrapFocus cdkTrapFocusAutoCapture>
      <h2>Dialog</h2>
      <input />
      <button (click)="close()">Đóng</button>
    </div>
  `,
})
export class DialogComponent {}
```

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

// LiveAnnouncer — thông báo cho screen reader
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private announcer = inject(LiveAnnouncer);

  showSuccess(message: string) {
    this.announcer.announce(message, 'polite');
  }

  showError(message: string) {
    this.announcer.announce(message, 'assertive');
  }
}
```

### ARIA trong custom component

```typescript
@Component({
  selector: 'app-dropdown',
  template: `
    <button
      [attr.aria-expanded]="isOpen()"
      [attr.aria-haspopup]="true"
      aria-label="Chọn danh mục"
      (click)="toggle()"
      (keydown.escape)="close()"
      (keydown.arrowDown)="openAndFocusFirst()"
    >
      {{ selectedLabel() }}
    </button>

    @if (isOpen()) {
      <ul
        role="listbox"
        [attr.aria-activedescendant]="activeId()"
      >
        @for (option of options(); track option.id) {
          <li
            role="option"
            [id]="'option-' + option.id"
            [attr.aria-selected]="option.id === selectedId()"
            (click)="select(option)"
            (keydown.enter)="select(option)"
            tabindex="0"
          >
            {{ option.label }}
          </li>
        }
      </ul>
    }
  `,
})
export class DropdownComponent { ... }
```

---

## Enterprise Project Structure

### Cấu trúc hoàn chỉnh

```
src/app/
├── core/                           # Singleton, chạy 1 lần
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── notification.service.ts
│   │   └── monitoring.service.ts
│   ├── adapters/                   # API ↔ Model adapters
│   │   └── product.adapter.ts
│   └── error-handler.ts
├── shared/                         # Dùng lại nhiều nơi
│   ├── components/
│   │   ├── button/
│   │   ├── dialog/
│   │   ├── toast/
│   │   └── data-table/
│   ├── directives/
│   │   ├── has-role.directive.ts
│   │   └── highlight.directive.ts
│   ├── pipes/
│   │   └── truncate.pipe.ts
│   ├── models/                     # Shared interfaces/types
│   │   ├── product.model.ts
│   │   └── user.model.ts
│   └── utils/
│       └── validators.ts
├── features/                       # Tổ chức theo domain
│   ├── products/
│   │   ├── components/
│   │   │   ├── product-list/       # Smart component
│   │   │   ├── product-card/       # Presentational
│   │   │   └── product-detail/
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   ├── store/                  # Feature state (Signal Store hoặc NgRx)
│   │   │   └── product.store.ts
│   │   ├── facades/
│   │   │   └── product.facade.ts
│   │   └── products.routes.ts      # Feature routes (lazy)
│   ├── orders/
│   └── auth/
├── layouts/
│   ├── main-layout/
│   └── auth-layout/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

### Quy tắc

1. **core/**: Import một lần trong root — singleton services, interceptors, guards
2. **shared/**: Import bởi nhiều features — UI components, pipes, directives, models
3. **features/**: Theo domain — mỗi feature có routes, components, services, state riêng
4. **Feature không import feature khác** — giao tiếp qua shared service hoặc store
5. **Barrel exports** (`index.ts`): Mỗi thư mục export public API

---

## Câu hỏi thường gặp

**Facade có bắt buộc không?**
Không. Dùng khi component cần ≥ 3 service hoặc có logic chéo nhiều service. Với component đơn giản (1 service) → inject trực tiếp.

**Strategy vs if/else?**
Nếu chỉ có 2-3 case đơn giản → if/else đủ. Nếu ≥ 4 case, hoặc case có thể thêm mới mà không sửa code cũ (Open/Closed principle) → Strategy.

**Adapter có thừa không?**
Với API nhỏ, ít field → có thể map trực tiếp. Với API lớn, format khác biệt, hoặc có nguy cơ đổi API version → Adapter rất hữu ích. Trong enterprise thường bắt buộc.

**Repository trong Angular có cần abstract class không?**
Có thể dùng abstract class (như ví dụ) hoặc InjectionToken + interface. Abstract class đơn giản hơn vì TypeScript interface không tồn tại ở runtime.

**Khi nào dùng Event Bus thay vì shared service?**
Event Bus dùng cho **fire-and-forget** (toast, analytics event). Shared service/store dùng cho **state** (giỏ hàng, user). Đừng dùng Event Bus làm state management.

---

## Senior / Master

- **CQRS (Command Query Responsibility Segregation)**: Tách read (query/selector) và write (command/action) — NgRx tự nhiên follow pattern này: Selector = Query, Action + Effect = Command.
- **Plugin Architecture**: Dùng InjectionToken + multi provider + dynamic component để cho phép "cắm" feature mới mà không sửa core code. Pattern thường dùng trong CMS, dashboard builder.
- **Domain-Driven Design (DDD)**: Tổ chức code theo bounded context (product, order, payment) thay vì theo technical layer. Mỗi context có model, repository, service riêng.
- **Hexagonal Architecture**: Core business logic không phụ thuộc framework — service thuần TypeScript, Angular chỉ là "adapter" (component = UI adapter, HttpClient = infra adapter). Giúp migrate framework hoặc test business logic không cần Angular TestBed.

---

→ Xem thêm: [05 - Services & DI](05-services-di.md) | [10 - State & Architecture](10-state-architecture.md) | [15 - Master Angular](15-master-angular.md)
→ Toàn bộ bài học: [01](01-typescript-basics.md) → [23](23-design-patterns.md)
