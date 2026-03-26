# Services & Dependency Injection

Service là class chứa logic dùng chung (gọi API, xử lý dữ liệu, state). Angular **Dependency Injection (DI)** tự tạo và inject instance vào component hoặc service khác.

## Mục lục
1. [Service và DI là gì? (Cho người mới)](#service-và-di-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Component dùng service, một instance chung](#ví-dụ-trực-quan-component-dùng-service-một-instance-chung)
3. [Tạo và đăng ký service](#tạo-và-đăng-ký-service)
4. [providedIn và scope](#providedin-và-scope)
5. [inject() và constructor](#inject-và-constructor)
6. [Singleton và scope](#singleton-và-scope)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Service và DI là gì? (Cho người mới)

- **Service** = class chứa **logic dùng chung** (gọi API, tính toán, lưu state) thay vì nhét hết vào component. Component chỉ lo hiển thị và tương tác; khi cần dữ liệu hoặc thao tác phức tạp thì gọi service. Ví dụ: `ApiService` gọi backend, `AuthService` lưu thông tin đăng nhập.
- **Dependency Injection (DI)** = Angular **tự tạo** instance service và **đưa vào** component (hoặc service khác) khi cần. Bạn không gọi `new ApiService()` trong component — bạn khai báo “tôi cần ApiService” (constructor hoặc `inject()`), Angular sẽ tạo (hoặc dùng lại) instance và truyền vào. Lợi ích: dễ test (có thể inject mock), một service có thể dùng chung nhiều component (singleton).
- **providedIn: 'root'** = service được cung cấp ở “gốc” ứng dụng → **một instance duy nhất** cho cả app. Hai component cùng inject `AuthService` sẽ dùng chung một instance.

---

## Ví dụ trực quan: Component dùng service, một instance chung

1. Tạo service: `ng g s core/counter`. Trong `counter.service.ts` thêm `count = 0;` và `increment() { this.count++; }`.
2. Đặt `providedIn: 'root'` trong `@Injectable`.
3. Tạo hai component: `ng g c comp-a` và `ng g c comp-b`. Cả hai đều `inject(CounterService)` và trong template hiển thị `{{ counter.count }}` và nút gọi `counter.increment()`.
4. Trong `app.component.html` đặt `<app-comp-a></app-comp-a>` và `<app-comp-b></app-comp-b>`.
5. Chạy app: khi bạn bấm nút ở **CompA**, số ở **cả CompA và CompB** đều tăng — vì cùng một instance `CounterService`. Đó là **singleton** và **DI** trực quan.

---

## Tạo và đăng ký service

```bash
ng g s core/services/api
```

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',  // Cung cấp ở root → singleton toàn app
})
export class ApiService {
  getData() {
    return of([1, 2, 3]);
  }
}
```

Component dùng service qua **constructor** hoặc **inject()**:

```typescript
constructor(private api: ApiService) {}

// Hoặc (Angular 14+)
private api = inject(ApiService);
```

---

## providedIn và scope

| Cách | Ý nghĩa |
|------|---------|
| `providedIn: 'root'` | Một instance cho cả app (singleton) |
| `providedIn: 'platform'` | Một instance cho cả platform (ít dùng) |
| Không dùng `providedIn`, khai báo trong `providers` của component/route | Mỗi component/route có instance riêng |

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {}  // Singleton

@Injectable()  // Không providedIn
export class FeatureStateService {}
// Trong component:
providers: [FeatureStateService]  // Mỗi component có instance riêng
```

Cung cấp ở **route** (cho lazy-loaded module):

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  providers: [AdminGuard, AdminService],
}
```

---

## inject() và constructor

Cả hai đều dùng để inject dependency. `inject()` dùng được trong **injection context** (constructor, field initializer, factory).

```typescript
export class ProductListComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
}
```

- **inject()**: Gọn, dễ dùng trong functional guard/interceptor.
- **Constructor inject**: Quen thuộc, dễ test (mock qua constructor).

---

## Singleton và scope

- **providedIn: 'root'**: Một instance duy nhất; phù hợp AuthService, ApiService, config.
- **providers trong component**: Mỗi instance component có một instance service riêng; phù hợp state chỉ dùng trong component tree đó.
- **providers trong route**: Service sống theo route; khi thoát route có thể bị destroy (tùy cấu hình).

---

## Câu hỏi thường gặp

**Service có cần `@Injectable()` không?**  
Có. Để DI biết class có thể inject và (tuỳ phiên bản) inject các dependency khác vào constructor. Nhiều service cần inject HttpClient, Router, v.v.

**Khi nào dùng `providers: [Service]` trong component?**  
Khi muốn mỗi component (hoặc mỗi cây con) có instance riêng, không dùng chung state (ví dụ form state, cache theo màn hình).

**Circular dependency giữa hai service?**  
Nên refactor: đưa phần dùng chung ra service thứ ba, hoặc dùng `forwardRef`. Tốt nhất là tránh vòng phụ thuộc qua thiết kế lại.

---

## Senior / Master

### InjectionToken — inject giá trị không phải class

Khi cần inject **giá trị** (config object, string, number) hoặc **interface** (TypeScript interface không tồn tại ở runtime), dùng `InjectionToken<T>`:

```typescript
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  debug: boolean;
  maxRetries: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
```

Provide trong `app.config.ts`:

```typescript
providers: [
  {
    provide: APP_CONFIG,
    useValue: { apiUrl: 'https://api.example.com', debug: false, maxRetries: 3 },
  },
],
```

Inject trong service/component:

```typescript
private config = inject(APP_CONFIG);
// this.config.apiUrl → 'https://api.example.com'
```

### useFactory — tạo instance bằng logic

Khi cần tính toán hoặc chọn implementation dựa trên điều kiện:

```typescript
providers: [
  {
    provide: APP_CONFIG,
    useFactory: () => {
      const isProd = !isDevMode();
      return {
        apiUrl: isProd ? 'https://api.example.com' : 'http://localhost:3000',
        debug: !isProd,
        maxRetries: isProd ? 3 : 0,
      };
    },
  },
],
```

Factory có thể inject dependency khác:

```typescript
{
  provide: LoggerService,
  useFactory: (config: AppConfig) => {
    return config.debug ? new ConsoleLogger() : new RemoteLogger();
  },
  deps: [APP_CONFIG],  // Inject APP_CONFIG vào factory
}
```

### Multi provider — nhiều implementation cho cùng token

Khi một token cần **nhiều giá trị** (danh sách interceptors, validators...):

```typescript
export const APP_INITIALIZER = new InjectionToken<(() => void)[]>('app.init');

providers: [
  { provide: APP_INITIALIZER, useValue: () => loadConfig(), multi: true },
  { provide: APP_INITIALIZER, useValue: () => loadUser(), multi: true },
  { provide: APP_INITIALIZER, useValue: () => initAnalytics(), multi: true },
],
```

Inject nhận **mảng** tất cả giá trị đã provide:

```typescript
private initializers = inject(APP_INITIALIZER); // (() => void)[]
```

### Hierarchical Injector — Element vs Environment

Angular có **hai cây injector**:

| Cây | Mô tả |
|-----|--------|
| **Environment injector** | Root → Lazy module → Route providers. `providedIn: 'root'` nằm ở đây. |
| **Element injector** | Component cha → Component con. `providers: [...]` trong `@Component` nằm ở đây. |

Khi inject, Angular tìm **từ element injector** lên root, nếu không thấy thì sang **environment injector**. Hiểu hierarchy giúp kiểm soát scope (mỗi component có instance riêng vs singleton).

```typescript
// Component A cung cấp StateService riêng
@Component({
  providers: [StateService],  // Mỗi instance ComponentA có StateService riêng
})
export class ComponentA {}

// Component B (con của A) inject StateService → nhận instance từ A
// Component C không phải con của A → nhận instance khác (hoặc từ root)
```

### Optional inject và forwardRef

```typescript
// Optional — trả về null nếu không có provider
private analytics = inject(AnalyticsService, { optional: true });

// forwardRef — tham chiếu class chưa khai báo (tránh circular)
providers: [
  { provide: ParentService, useExisting: forwardRef(() => ChildService) },
]
```

---

→ Tiếp theo: [06 - Routing & Navigation](06-routing-navigation.md)
