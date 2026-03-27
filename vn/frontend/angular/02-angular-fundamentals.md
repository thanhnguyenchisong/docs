# Angular căn bản

## Mục lục
1. [Angular là gì?](#angular-là-gì)
2. [Angular CLI](#angular-cli)
3. [Cấu trúc project](#cấu-trúc-project)
4. [Lifecycle hooks](#lifecycle-hooks)
5. [Standalone vs NgModule](#standalone-vs-ngmodule)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Angular là gì?

**Cho người mới:** Angular là một **framework** (bộ khung) để xây dựng **ứng dụng web** chạy trên trình duyệt. Thay vì bạn tự viết từng thứ (điều hướng trang, gọi API, quản lý form, cấu trúc code), Angular cung cấp sẵn: **components** (khối giao diện), **routing** (chuyển trang), **forms** (form + validation), **HTTP client** (gọi API), **dependency injection** (đưa service vào component), v.v. Bạn học cách dùng các phần đó và lắp ghép thành app. Ứng dụng kiểu “một trang load một lần, sau đó mọi thao tác đều không tải lại cả trang” gọi là **SPA** (Single Page Application) — Angular là một lựa chọn phổ biến để làm SPA. Phiên bản hiện tại là Angular 2 trở đi (viết bằng TypeScript); không nhầm với AngularJS (1.x), đã lỗi thời.

- **Framework** phía client để xây dựng SPA (Single Page Application).
- Viết bằng **TypeScript**, build ra JavaScript chạy trên browser.
- Cung cấp: components, routing, forms, HTTP client, DI, reactive (RxJS), testing, CLI.
- **Phiên bản**: Angular (2+) — không nhầm với AngularJS (1.x).

---

## Angular CLI

**Cho người mới:** **CLI** (Command Line Interface) là công cụ chạy bằng lệnh trong terminal để tạo project, tạo component/service, chạy dev server, build. Bạn không cần tự cấu hình webpack hay TypeScript — CLI đã làm sẵn. Các lệnh thường bắt đầu bằng `ng` (viết tắt Angular). Đảm bảo đã cài **Node.js** (để có `npm`) trước khi chạy các lệnh dưới.

Cài đặt và tạo project:

```bash
npm install -g @angular/cli
ng new my-app
cd my-app
ng serve
```

- `npm install -g @angular/cli`: cài Angular CLI toàn cục (lần đầu).
- `ng new my-app`: tạo thư mục `my-app` với toàn bộ cấu trúc project Angular.
- `cd my-app`: vào thư mục project.
- `ng serve`: chạy máy chủ phát triển; mở trình duyệt tại `http://localhost:4200` để xem app.

**Ví dụ trực quan: Bạn sẽ thấy gì khi chạy `ng serve`?**

Sau khi chạy `ng serve`, terminal in dòng dạng: `✔ Compiled successfully` và URL `http://localhost:4200`. Mở trình duyệt vào địa chỉ đó, bạn sẽ thấy trang mặc định của Angular:

- **Trên màn hình:** Logo Angular xoay, tiêu đề "Hello" (hoặc tên app), và vài link (Documentation, Tutorial…). Toàn bộ giao diện đó do **một component gốc** (`app.component`) render ra.

- **Thử sửa một dòng để thấy thay đổi ngay:** Mở `src/app/app.component.ts`, tìm dòng có `title = '...'` (hoặc trong template có chữ "Hello"). Đổi thành `title = 'Xin chào Angular'` và lưu file. Trình duyệt sẽ **tự reload** (hot reload) và chữ trên trang đổi theo. Đó là cách bạn “nhìn thấy” code và giao diện gắn với nhau.

- **Thử tạo component mới:** Chạy `ng g c hello --standalone`. CLI tạo thư mục `src/app/hello/` với file `hello.component.ts` và template. Mở `app.component.ts`, import `HelloComponent` và thêm `<app-hello></app-hello>` vào template — lưu lại, trang sẽ xuất hiện thêm nội dung của component `hello`. Như vậy bạn đã thấy **cấu trúc project** (component nằm trong thư mục, được gọi trong template) bằng mắt.

Lệnh thường dùng:

| Lệnh | Mô tả |
|------|--------|
| `ng generate component <name>` | Tạo component (có thể dùng `ng g c <name>`) |
| `ng generate service <name>` | Tạo service |
| `ng generate guard <name>` | Tạo guard |
| `ng build` | Build (production: `ng build --configuration=production`) |
| `ng test` | Chạy unit test |
| `ng add @angular/material` | Thêm Angular Material |

---

## Cấu trúc project

**Cho người mới:** Sau khi chạy `ng new my-app`, bạn có một cây thư mục chuẩn. Phần quan trọng nhất là **src/app/** — đây là nơi bạn viết phần lớn code. **app.component.ts** là component gốc (trang chính), **app.routes.ts** định nghĩa các “trang” (route). Thư mục **core/** thường chứa thứ dùng chung cho cả app (service đăng nhập, service gọi API, guard, interceptor). **shared/** chứa component/pipe dùng lại nhiều nơi (nút bấm, modal, pipe định dạng ngày). **features/** (hoặc tên tương tự) tổ chức theo từng tính năng (user, product, order) — mỗi feature có thể có component, service riêng. **main.ts** là điểm vào: nó “khởi động” ứng dụng Angular. **index.html** là file HTML duy nhất được load lúc đầu; Angular sau đó “chiếm” một thẻ (thường `<app-root>`) để render toàn bộ giao diện. Bạn không cần nhớ hết ngay — khi tạo component mới bằng `ng g c tên`, CLI sẽ tạo file đúng chỗ.

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # Application config (providers, routes)
│   │   ├── app.routes.ts         # Routing
│   │   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── shared/               # Shared components, pipes, directives
│   │   └── features/             # Feature modules (theo domain)
│   ├── assets/
│   ├── index.html
│   ├── main.ts                   # Bootstrap application
│   └── styles.scss               # Global styles
├── angular.json                  # CLI config
└── package.json
```

- **core/**: Service dùng toàn app (AuthService, ApiService), HTTP interceptors, guards.
- **shared/**: Component/pipe/directive dùng lại nhiều nơi (button, modal, format pipe).
- **features/**: Tổ chức theo tính năng (user, product, order).

**Ví dụ trực quan: File nào tương ứng với cái gì trên màn hình**

| Bạn thấy trên trang | File / vị trí thường gặp |
|---------------------|--------------------------|
| Toàn bộ nội dung trang (logo, chữ, menu) | `app.component.ts` + template (hoặc `app.component.html`) |
| Đường dẫn URL (ví dụ `/home`, `/products`) | `app.routes.ts` — mỗi route map tới một component |
| Một khối lặp lại (card, nút, form) | Component trong `shared/` hoặc `features/.../` |
| Trang chủ, trang login, trang danh sách | Mỗi route load một component khác nhau |

Mở `src/app/app.component.ts` và so sánh với những gì đang hiển thị trên trình duyệt — bạn sẽ thấy template (HTML) và dữ liệu trong class quyết định nội dung hiển thị.

---

## Lifecycle hooks

**Cho người mới:** Mỗi component có một "vòng đời": được tạo → hiển thị lên màn hình → có thể cập nhật nhiều lần → cuối cùng bị hủy khi rời khỏi màn hình. **Lifecycle hooks** là các hàm mà Angular gọi **đúng thời điểm** trong vòng đời đó. Ví dụ: `ngOnInit()` được gọi **một lần** sau khi component được tạo và input đã có giá trị — đây là chỗ thích hợp để gọi API hoặc khởi tạo dữ liệu. `ngOnDestroy()` được gọi **trước khi** component bị hủy — đây là chỗ để hủy subscription (Observable), clear timer, tránh rò rỉ bộ nhớ. Bạn không cần implement tất cả hooks — chỉ cần dùng những cái cần (thường là `ngOnInit` và `ngOnDestroy`).

### Thứ Tự Gọi — Toàn Bộ Lifecycle

```
 Component được tạo
        │
        ▼
 ① constructor()          ← Tạo instance, inject dependencies
        │
        ▼
 ② ngOnChanges()          ← @Input() có giá trị lần đầu (và mỗi lần thay đổi sau)
        │
        ▼
 ③ ngOnInit()             ← ★ QUAN TRỌNG NHẤT — init logic, gọi API, setup
        │
        ▼
 ④ ngDoCheck()            ← Mỗi change detection cycle
        │
        ▼
 ⑤ ngAfterContentInit()  ← ng-content đã được project vào (1 lần)
        │
        ▼
 ⑥ ngAfterContentChecked() ← ng-content đã được check (mỗi CD cycle)
        │
        ▼
 ⑦ ngAfterViewInit()     ← ★ View + child views đã render xong (1 lần)
        │
        ▼
 ⑧ ngAfterViewChecked()  ← View đã được check (mỗi CD cycle)
        │
        │  ← ── ── ── ── ── ── ── ── ── ── ──
        │  │  Input thay đổi? → ngOnChanges() │
        │  │  CD cycle?       → ngDoCheck()   │
        │  │                  → ngAfterContentChecked()
        │  │                  → ngAfterViewChecked()
        │  ── ── ── ── ── ── ── ── ── ── ── ──
        │
        ▼
 ⑨ ngOnDestroy()          ← ★ Component bị hủy — cleanup!
```

### Tất Cả 8 Hooks Chi Tiết

| # | Hook | Chạy khi | Bao nhiêu lần | Dùng làm gì |
|---|------|----------|---------------|------------|
| ① | `constructor` | Class được new | 1 lần | Inject deps. **KHÔNG** gọi API, KHÔNG dùng @Input |
| ② | `ngOnChanges` | @Input thay đổi | Mỗi lần input đổi | React to input changes, transform data |
| ③ | `ngOnInit` | Sau constructor + inputs lần đầu | 1 lần | ★ Gọi API, init logic, subscribe |
| ④ | `ngDoCheck` | Mỗi change detection | Rất nhiều lần | Custom change detection (hiếm dùng) |
| ⑤ | `ngAfterContentInit` | Sau khi ng-content projected | 1 lần | Truy xuất @ContentChild |
| ⑥ | `ngAfterContentChecked` | Sau mỗi CD check content | Rất nhiều lần | Hiếm dùng |
| ⑦ | `ngAfterViewInit` | Sau khi view + children render | 1 lần | ★ Truy xuất @ViewChild, init chart/DOM |
| ⑧ | `ngAfterViewChecked` | Sau mỗi CD check view | Rất nhiều lần | Hiếm dùng |
| ⑨ | `ngOnDestroy` | Trước khi component destroyed | 1 lần | ★ Unsubscribe, clearInterval, cleanup |

### ① constructor

```typescript
// constructor: CHỈ dùng để inject dependency, KHÔNG init logic
export class ProductListComponent {
  private productService = inject(ProductService);  // ✅ Inject
  private route = inject(ActivatedRoute);           // ✅ Inject

  // ❌ KHÔNG gọi API ở đây — @Input chưa có giá trị, view chưa ready
  // constructor() { this.loadProducts(); } // ❌ SAI
}
```

### ② ngOnChanges — React khi @Input thay đổi

```typescript
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-product-card',
  template: `<h3>{{ product.name }} - {{ formattedPrice }}</h3>`,
})
export class ProductCardComponent implements OnChanges {
  @Input() product!: Product;
  @Input() currency: string = 'VND';
  formattedPrice = '';

  ngOnChanges(changes: SimpleChanges) {
    // changes chứa TẤT CẢ inputs đã thay đổi
    console.log('Changes:', changes);

    // Kiểm tra input cụ thể
    if (changes['product']) {
      const prev = changes['product'].previousValue;
      const curr = changes['product'].currentValue;
      const isFirst = changes['product'].firstChange;  // true lần đầu

      console.log(`Product changed: ${prev?.name} → ${curr.name} (first: ${isFirst})`);
      this.formattedPrice = this.formatPrice(curr.price, this.currency);
    }

    if (changes['currency']) {
      this.formattedPrice = this.formatPrice(this.product.price, this.currency);
    }
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price);
  }
}
```

**SimpleChanges object:**

```typescript
// changes['product'] = {
//   previousValue: { name: 'Old', price: 100 },  // undefined nếu lần đầu
//   currentValue:  { name: 'New', price: 200 },
//   firstChange:   false,                          // true nếu lần đầu
//   isFirstChange(): boolean                       // method alternative
// }
```

> **Lưu ý**: `ngOnChanges` KHÔNG chạy nếu object reference không đổi (mutate property bên trong object → không trigger). Phải tạo object mới: `this.product = { ...this.product, name: 'New' }`.

### ③ ngOnInit — ★ Quan Trọng Nhất

```typescript
@Component({ ... })
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // ✅ Gọi API — đây là chỗ đúng nhất
    this.loading = true;
    this.productService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))  // Auto unsubscribe
      .subscribe(data => {
        this.products = data;
        this.loading = false;
      });

    // ✅ Đọc route params
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.categoryId = params['categoryId'];
        this.loadByCategory(this.categoryId);
      });
  }
}
```

**ngOnInit vs constructor:**

| | constructor | ngOnInit |
|---|-----------|----------|
| **@Input** | ❌ Chưa có giá trị | ✅ Đã có giá trị |
| **View** | ❌ Chưa render | ❌ Chưa render (nhưng sắp) |
| **Mục đích** | Inject dependencies | Init logic, gọi API |
| **Test** | Khó mock | Dễ test (gọi manual) |

### ④ ngDoCheck — Custom Change Detection

```typescript
// ⚠️ Chỉ dùng khi cần detect thay đổi mà Angular không tự phát hiện
// Ví dụ: detect thay đổi bên trong array/object mà reference không đổi

@Component({ ... })
export class DataGridComponent implements DoCheck {
  @Input() data: any[] = [];
  private previousLength = 0;

  ngDoCheck() {
    // ⚠️ Chạy RẤT NHIỀU lần — phải đảm bảo logic NHANH
    if (this.data.length !== this.previousLength) {
      console.log(`Data length changed: ${this.previousLength} → ${this.data.length}`);
      this.previousLength = this.data.length;
      this.refreshGrid();
    }
  }
}
```

> **⚠️ Cảnh báo**: `ngDoCheck` chạy mỗi change detection cycle (click, keypress, timer, HTTP...). Logic nặng ở đây → app lag. Thường dùng `ngOnChanges` hoặc `OnPush` tốt hơn.

### ⑤⑥ ngAfterContentInit / ngAfterContentChecked — Content Projection

```typescript
// Parent template:
// <app-card>
//   <h3 #title>Title từ parent</h3>    ← Đây là projected content (ng-content)
//   <p>Content từ parent</p>
// </app-card>

// CardComponent template:
// <div class="card">
//   <ng-content select="h3"></ng-content>      ← project h3 vào đây
//   <ng-content></ng-content>                  ← project phần còn lại
// </div>

@Component({ selector: 'app-card', ... })
export class CardComponent implements AfterContentInit, AfterContentChecked {
  @ContentChild('title') titleEl!: ElementRef;  // Truy xuất projected content

  ngAfterContentInit() {
    // ✅ Chạy 1 lần — projected content đã sẵn sàng
    console.log('Projected title:', this.titleEl?.nativeElement.textContent);
  }

  ngAfterContentChecked() {
    // Chạy mỗi CD cycle — hiếm cần dùng
  }
}
```

### ⑦ ngAfterViewInit — ★ Truy Xuất DOM / ViewChild

```typescript
@Component({
  template: `
    <canvas #chartCanvas width="400" height="200"></canvas>
    <app-data-table #dataTable [data]="products"></app-data-table>
  `,
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dataTable') dataTable!: DataTableComponent;

  ngAfterViewInit() {
    // ✅ DOM đã render → an toàn truy xuất DOM elements
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    this.initChart(ctx);

    // ✅ Child component đã init → có thể gọi methods
    this.dataTable.refresh();

    // ⚠️ Nếu cần thay đổi state ở đây → dùng setTimeout hoặc sẽ bị
    // ExpressionChangedAfterItHasBeenCheckedError
    // setTimeout(() => { this.isReady = true; });
  }
}
```

**Lỗi thường gặp — ExpressionChangedAfterItHasBeenCheckedError:**

```typescript
// ❌ SAI: thay đổi state trong ngAfterViewInit → lỗi dev mode
ngAfterViewInit() {
  this.title = 'Ready';  // ❌ ExpressionChangedAfterItHasBeenCheckedError
}

// ✅ ĐÚNG: dùng setTimeout, ChangeDetectorRef, hoặc signal
ngAfterViewInit() {
  setTimeout(() => { this.title = 'Ready'; });     // Option 1
  // hoặc
  this.cdr.detectChanges();                         // Option 2
  // hoặc dùng signal (Angular 17+)
}
```

### ⑧ ngAfterViewChecked

```typescript
// Chạy mỗi CD cycle sau khi view đã check
// ⚠️ Hiếm dùng — tương tự ngDoCheck, phải nhanh

ngAfterViewChecked() {
  // Use case: scroll to bottom khi có messages mới
  if (this.shouldScrollToBottom) {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = false;
  }
}
```

### ⑨ ngOnDestroy — ★ Cleanup

```typescript
@Component({ ... })
export class ChatComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  private intervalId: any;
  private ws!: WebSocket;

  ngOnInit() {
    // Subscribe Observable
    this.subscription = this.chatService.messages$.subscribe(msg => {
      this.messages.push(msg);
    });

    // Timer
    this.intervalId = setInterval(() => this.checkNewMessages(), 5000);

    // WebSocket
    this.ws = new WebSocket('wss://chat.example.com');
  }

  ngOnDestroy() {
    // ✅ BẮT BUỘC cleanup — tránh memory leak
    this.subscription.unsubscribe();          // Hủy subscription
    clearInterval(this.intervalId);            // Hủy timer
    this.ws.close();                           // Đóng WebSocket

    console.log('ChatComponent destroyed — all resources cleaned up');
  }
}
```

**Cách hiện đại (Angular 16+) — `DestroyRef` + `takeUntilDestroyed`:**

```typescript
@Component({ ... })
export class ChatComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // ✅ Auto unsubscribe khi component bị destroy — KHÔNG cần ngOnDestroy
    this.chatService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(msg => this.messages.push(msg));

    // ✅ Manual cleanup vẫn dùng được
    this.destroyRef.onDestroy(() => {
      clearInterval(this.intervalId);
      this.ws.close();
    });
  }
}
```

### Tóm Tắt — Bạn Thực Sự Cần Nhớ Hooks Nào?

| Hook | Mức độ dùng | Ghi nhớ |
|------|------------|---------|
| `ngOnInit` | ★★★★★ | **Luôn dùng** — gọi API, init logic |
| `ngOnDestroy` | ★★★★★ | **Luôn dùng** — unsubscribe, cleanup (hoặc `takeUntilDestroyed`) |
| `ngOnChanges` | ★★★★ | Khi cần react to @Input changes |
| `ngAfterViewInit` | ★★★ | Khi cần truy xuất DOM (@ViewChild) |
| `ngAfterContentInit` | ★★ | Khi dùng ng-content + @ContentChild |
| `ngDoCheck` | ★ | Hiếm — custom change detection |
| `ngAfterViewChecked` | ★ | Hiếm — check sau mỗi CD cycle |
| `ngAfterContentChecked` | ★ | Hiếm — check content sau mỗi CD cycle |

### Câu Hỏi Phỏng Vấn Lifecycle

**Q: `ngOnInit` vs `constructor`?**
> Constructor: inject dependencies, chạy trước mọi hook, @Input chưa có giá trị. ngOnInit: chạy sau constructor + ngOnChanges lần đầu, @Input đã có giá trị → đây là nơi init logic.

**Q: Khi nào cần `ngOnDestroy`?**
> Khi component có subscription (Observable), timer (setInterval/setTimeout), WebSocket, event listener manual (addEventListener), hoặc bất kỳ resource nào cần giải phóng. Không cleanup → **memory leak**.

**Q: `ngOnChanges` có chạy khi object property thay đổi không?**
> **Không**, nếu reference không đổi. Angular check bằng `===`. Phải tạo object mới: `{ ...old, prop: newValue }`. Hoặc dùng `ngDoCheck` để detect deep changes (nhưng không khuyến khích).

**Q: `ExpressionChangedAfterItHasBeenCheckedError` là gì?**
> Xảy ra khi thay đổi state trong `ngAfterViewInit`/`ngAfterViewChecked` (sau khi Angular đã check view). Fix: `setTimeout()`, `ChangeDetectorRef.detectChanges()`, hoặc dùng signal.

---

## Standalone vs NgModule

**Cho người mới:** Trước đây Angular bắt buộc phải gom component vào **NgModule** (một “module” khai báo declarations, imports…). Từ Angular 14+, có kiểu **standalone component**: mỗi component tự khai báo `standalone: true` và tự import những component/pipe/directive nó cần, không cần tạo NgModule cho từng tính năng. Dự án mới tạo bằng `ng new` mặc định đã dùng standalone. Bạn chỉ cần nhớ: dùng **standalone** là cách hiện đại, đơn giản hơn; NgModule vẫn tồn tại khi lazy load theo module hoặc khi bảo trì code cũ.

- **Standalone component** (Angular 14+): Component tự khai báo `standalone: true`, import trực tiếp component/pipe/directive cần dùng, không bắt buộc phải có `NgModule`.
- **NgModule**: Nhóm declarations, imports, exports; dùng cho lazy load theo module hoặc khi migrate từ code cũ.

Dự án mới nên dùng **standalone**; cấu hình mặc định của `ng new` đã là standalone.

### Tại Sao Angular Hướng Tới Standalone? (Từ Angular 17)

#### Vấn đề của NgModule

```typescript
// ❌ NgModule: phải khai báo MỌI component/pipe/directive
@NgModule({
  declarations: [
    ProductListComponent,      // Khai báo ở đây...
    ProductCardComponent,
    ProductFilterPipe,
    HighlightDirective,
  ],
  imports: [
    CommonModule,              // ...import module Angular...
    FormsModule,
    HttpClientModule,
    SharedModule,              // ...import shared module...
    RouterModule.forChild(routes),
  ],
  exports: [ProductListComponent],
  providers: [ProductService],
})
export class ProductModule { }     // Class RỖNG, chỉ để config!
```

**5 vấn đề chính:**

| # | Vấn đề | Giải thích |
|---|--------|-----------|
| 1 | **Boilerplate** | Mỗi feature cần tạo 1 NgModule class rỗng, khai báo dài dòng |
| 2 | **Khó hiểu cho người mới** | declarations vs imports vs exports vs providers — confusing |
| 3 | **Scope không rõ ràng** | Component A dùng Pipe B — Pipe B phải khai báo trong cùng module hoặc import module chứa nó. Developer không biết dependency từ đâu |
| 4 | **Tree-shaking kém** | Import `SharedModule` → 50 components vào bundle dù chỉ dùng 1 |
| 5 | **Lazy loading phức tạp** | Phải tạo module riêng + `loadChildren` → nhiều file chỉ để lazy load |

#### Standalone Giải Quyết Thế Nào

```typescript
// ✅ Standalone: component TỰ khai báo dependency
@Component({
  selector: 'app-product-list',
  standalone: true,              // Tự đứng, không cần NgModule
  imports: [                     // Import TRỰC TIẾP những gì CẦN
    ProductCardComponent,        // Component khác
    ProductFilterPipe,           // Pipe
    RouterLink,                  // Chỉ RouterLink, không cả RouterModule
  ],
  template: `
    @for (p of products; track p.id) {
      <app-product-card [product]="p" />
    }
  `,
})
export class ProductListComponent { }
// Không cần NgModule wrapper!
```

| Vấn đề NgModule | Standalone giải quyết |
|-----------------|----------------------|
| Boilerplate module class | Không cần tạo module class |
| Khó hiểu scope | Component tự khai báo imports → nhìn là biết dependency |
| Tree-shaking kém | Import component cụ thể → chỉ bundle cái thực sự dùng |
| Lazy loading phức tạp | `loadComponent` trực tiếp, không cần module |

### Timeline — Lộ Trình Chuyển Sang Standalone

```
Angular 14 (06/2022):  Standalone ra mắt — developer preview, opt-in
                        → standalone: true trong @Component

Angular 15 (11/2022):  Standalone APIs stable
                        → provideRouter(), provideHttpClient()
                        → Thay thế RouterModule.forRoot(), HttpClientModule

Angular 16 (05/2023):  Standalone là "recommended"
                        → Signals ra mắt (developer preview)
                        → DestroyRef, takeUntilDestroyed

Angular 17 (11/2023):  ★ STANDALONE LÀ DEFAULT
                        → ng new tạo project KHÔNG CÓ app.module.ts
                        → New control flow: @if, @for, @switch
                        → ng generate tạo standalone component mặc định

Angular 18 (05/2024):  Zoneless experimental
                        → standalone: true là mặc định trong schematic

Angular 19 (11/2024):  standalone: true là NGẦM ĐỊNH
                        → Không cần viết standalone: true nữa!
                        → NgModule chỉ còn dùng cho legacy code
```

### So Sánh Code Cụ Thể

#### Bootstrap App

```typescript
// ❌ CŨ (NgModule style)
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule { }

// main.ts
platformBrowserDynamic().bootstrapModule(AppModule);
```

```typescript
// ✅ MỚI (Standalone style)
// app.config.ts — chỉ config, không cần class
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),           // Thay RouterModule.forRoot()
    provideHttpClient(),             // Thay HttpClientModule
    provideAnimations(),             // Thay BrowserAnimationsModule
  ],
};

// main.ts
bootstrapApplication(AppComponent, appConfig);
```

#### Lazy Loading

```typescript
// ❌ CŨ: phải tạo NgModule RIÊNG chỉ để lazy load
@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ProductModule { }

// routing
{ path: 'products', loadChildren: () =>
    import('./product/product.module').then(m => m.ProductModule) }
```

```typescript
// ✅ MỚI: lazy load TRỰC TIẾP component, KHÔNG CẦN module
export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./product/product-list.component')
      .then(m => m.ProductListComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.adminRoutes),  // Lazy load nhóm routes
    providers: [AdminService],     // Scoped providers
  },
];
```

#### Template — @if/@for thay CommonModule

```html
<!-- ❌ CŨ: phải import CommonModule để dùng *ngIf, *ngFor -->
<div *ngIf="loading">Loading...</div>
<div *ngFor="let p of products; trackBy: trackById">{{ p.name }}</div>

<!-- ✅ MỚI (Angular 17+): built-in syntax, KHÔNG CẦN import -->
@if (loading) {
  <div>Loading...</div>
} @else {
  @for (p of products; track p.id) {
    <app-product-card [product]="p" />
  } @empty {
    <div>Không có sản phẩm</div>
  }
}
```

### Migration — Chuyển Từ NgModule Sang Standalone

```bash
# Angular CLI tự động migrate (3 bước)
ng generate @angular/core:standalone

# Bước 1: Convert components/directives/pipes to standalone
# Bước 2: Remove unnecessary NgModule classes
# Bước 3: Bootstrap with standalone APIs
```

### Khi Nào Vẫn Dùng NgModule?

| Dùng Standalone | Vẫn dùng NgModule |
|----------------|-------------------|
| Dự án mới (Angular 17+) | Bảo trì dự án cũ chưa migrate |
| Tất cả components, pipes, directives | Third-party library chưa hỗ trợ standalone |
| Lazy loading (loadComponent) | Cần tương thích Angular < 14 |

### Câu Hỏi Phỏng Vấn

**Q: Tại sao Angular bỏ NgModule, chuyển sang standalone?**
> NgModule tạo quá nhiều boilerplate, scope dependency không rõ ràng, tree-shaking kém (import SharedModule → bundle 50 components dù chỉ dùng 1), lazy loading phải tạo module riêng. Standalone cho phép component tự khai báo dependency → đơn giản, tree-shake tốt, dễ học. Angular 17 đặt standalone làm default, Angular 19 ngầm hiểu `standalone: true`.

**Q: Standalone có thay đổi DI system không?**
> Không. DI vẫn hoạt động giống hệt — `providedIn: 'root'` cho singleton, `providers` trong component/route cho scoped. Chỉ thay đổi cách **khai báo** component, không thay đổi cách **inject**.

**Q: Project cũ có bắt buộc đổi sang standalone không?**
> Không. NgModule vẫn hoạt động. Nhưng khuyến khích migrate dần bằng `ng generate @angular/core:standalone`. Standalone và NgModule có thể **chung sống** trong cùng project — migrate từng phần.

---

## Câu hỏi thường gặp

**Angular vs React/Vue?**  
Angular là framework “all-in-one” (routing, form, HTTP, DI có sẵn). React/Vue linh hoạt hơn, nhiều thư viện do cộng đồng chọn.

**`ngOnInit` vs `constructor`?**  
Constructor dùng để inject dependency. Logic khởi tạo (gọi API, đọc input) nên đặt trong `ngOnInit` vì lúc đó input đã có giá trị và view chưa render.

**Khi nào dùng NgModule?**  
Khi lazy load theo module, hoặc khi bảo trì code cũ dùng NgModule. Dự án mới ưu tiên standalone.

---

## Senior / Master

- **Change Detection**: Mặc định Angular dùng Zone.js — mỗi event/async có thể trigger CD toàn cây. **OnPush** chỉ chạy CD khi input reference đổi, event trong template, hoặc async pipe / markForCheck. Giảm CD → tăng performance. Chi tiết: [15 - Master Angular](15-master-angular.md#change-detection-sâu).
- **Ivy**: Từ Angular 9+, Ivy là engine compile mặc định (AOT, tree-shake tốt hơn, debugging tốt hơn). Không cần cấu hình thêm.
- **Lazy load standalone**: `loadComponent: () => import('...').then(m => m.XComponent)`; có thể kèm `providers` cho feature.

---

→ Tiếp theo: [03 - Components & Templates](03-components-templates.md)
