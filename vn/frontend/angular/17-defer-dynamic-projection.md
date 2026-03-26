# @defer, Content Projection & Dynamic Components

Ba chủ đề quan trọng giúp xây dựng UI linh hoạt, tối ưu performance: **@defer** (lazy load phần template), **Content Projection** (truyền nội dung từ cha vào con), **Dynamic Components** (tạo component lúc runtime).

## Mục lục
1. [@defer — Deferrable Views (Angular 17+)](#defer--deferrable-views-angular-17)
2. [Content Projection (ng-content)](#content-projection-ng-content)
3. [Dynamic Components](#dynamic-components)
4. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## @defer — Deferrable Views (Angular 17+)

### @defer là gì? (Cho người mới)

- **@defer** cho phép bạn **lazy load một phần template** — không phải toàn bộ route (như `loadComponent`) mà chỉ một khối HTML/component trong cùng template. Component bên trong `@defer` chỉ được tải (download JS) khi **điều kiện kích hoạt** xảy ra (ví dụ: element xuất hiện trên viewport, user hover, hoặc sau khi trang idle).
- **Lợi ích**: Giảm **initial bundle** rất nhiều — những phần nặng (biểu đồ, editor, bảng lớn) chỉ tải khi user thật sự cần. Khác với lazy load route (tải cả trang), `@defer` granular hơn — tải từng **khối UI**.
- **Ví dụ thực tế**: Một trang product có tab "Đánh giá" chứa component nặng (rich text editor, chart). Với `@defer (on viewport)`, component chỉ tải khi user scroll xuống đến tab đó.

### Cú pháp cơ bản

```html
@defer {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <p>Biểu đồ sẽ hiển thị ở đây</p>
} @loading {
  <p>Đang tải biểu đồ...</p>
} @error {
  <p>Lỗi khi tải component.</p>
}
```

| Block | Ý nghĩa |
|-------|---------|
| `@defer` | Nội dung chính — component/template cần lazy load |
| `@placeholder` | Hiển thị **trước khi** trigger xảy ra (nội dung tĩnh, nhẹ) |
| `@loading` | Hiển thị **đang tải** (sau trigger, chưa xong download) |
| `@error` | Hiển thị khi **tải thất bại** (network error) |

### Trigger — khi nào tải?

| Trigger | Cú pháp | Ý nghĩa |
|---------|---------|---------|
| **on idle** | `@defer (on idle)` | Tải khi browser idle (requestIdleCallback) — **mặc định** |
| **on viewport** | `@defer (on viewport)` | Tải khi element xuất hiện trong viewport (IntersectionObserver) |
| **on interaction** | `@defer (on interaction)` | Tải khi user click/focus/input vào placeholder |
| **on hover** | `@defer (on hover)` | Tải khi user hover vào placeholder |
| **on immediate** | `@defer (on immediate)` | Tải ngay sau render (không đợi idle) |
| **on timer** | `@defer (on timer(3s))` | Tải sau khoảng thời gian |
| **when** | `@defer (when condition)` | Tải khi biểu thức = true |

### Ví dụ trực quan

**1. Lazy load biểu đồ khi scroll xuống:**

```html
<h2>Thống kê sản phẩm</h2>
<p>Thông tin tổng quan...</p>

@defer (on viewport) {
  <app-sales-chart [data]="salesData" />
} @placeholder {
  <div style="height: 300px; background: #f0f0f0; display: grid; place-items: center;">
    📊 Biểu đồ doanh thu — scroll xuống để xem
  </div>
} @loading (minimum 500ms) {
  <div class="skeleton" style="height: 300px;"></div>
}
```

- `(minimum 500ms)`: Loading block hiển thị **ít nhất** 500ms — tránh flash nhanh quá.
- `SalesChartComponent` và dependency (chart library) **không nằm trong initial bundle** — chỉ tải khi user scroll tới.

**2. Tab chỉ tải khi click:**

```html
<div class="tabs">
  <button (click)="activeTab = 'info'">Thông tin</button>
  <button (click)="activeTab = 'reviews'">Đánh giá</button>
</div>

@if (activeTab === 'info') {
  <app-product-info [product]="product" />
}

@defer (when activeTab === 'reviews') {
  <app-review-list [productId]="product.id" />
} @placeholder {
  <p>Chọn tab "Đánh giá" để xem</p>
}
```

**3. Prefetch — tải trước nhưng chưa render:**

```html
@defer (on interaction; prefetch on idle) {
  <app-advanced-editor />
} @placeholder {
  <button>Mở editor nâng cao</button>
}
```

- `prefetch on idle`: Browser idle → **tải sẵn** JS chunk. Khi user click → render ngay (không phải chờ download).

### @defer vs Lazy load route

| | @defer | Lazy load route |
|---|--------|-----------------|
| **Đơn vị** | Một phần template (component, khối HTML) | Toàn bộ route (trang) |
| **Trigger** | viewport, hover, click, timer, when... | Khi user navigate tới route |
| **Cấu hình** | Trong template (`@defer`) | Trong `app.routes.ts` (`loadComponent`) |
| **Dùng khi** | Component nặng trong trang (chart, editor, list lớn) | Trang riêng biệt (admin, settings) |

**Kết hợp cả hai**: Lazy load route cho trang admin; trong trang admin, `@defer` cho bảng báo cáo nặng.

---

## Content Projection (ng-content)

### Content Projection là gì? (Cho người mới)

- **Content Projection** = cơ chế truyền **HTML/component** từ **component cha** vào **vị trí xác định** trong template component con. Component con dùng `<ng-content>` để đánh dấu "chỗ này sẽ hiện nội dung từ cha".
- **Ví dụ quen thuộc**: Bạn có `CardComponent` — mọi card có cùng khung (viền, shadow), nhưng nội dung bên trong khác nhau. Cha truyền nội dung vào giữa thẻ `<app-card>...</app-card>`, con nhận qua `<ng-content>`.
- Content projection giúp tạo **component layout tái sử dụng**: card, dialog, tab, accordion, layout page.

### Single-slot projection

Component con:

```typescript
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
  styles: ['.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }'],
})
export class CardComponent {}
```

Component cha:

```html
<app-card>
  <h3>Tiêu đề sản phẩm</h3>
  <p>Mô tả sản phẩm ở đây</p>
  <button>Mua ngay</button>
</app-card>
```

→ Nội dung bên trong `<app-card>...</app-card>` (h3, p, button) được **project** vào vị trí `<ng-content />` trong template con.

### Multi-slot projection (select)

Khi component con có **nhiều vùng** nhận nội dung khác nhau:

```typescript
@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <div class="dialog-overlay">
      <div class="dialog">
        <header class="dialog-header">
          <ng-content select="[dialog-title]" />
          <button (click)="close()">&times;</button>
        </header>
        <div class="dialog-body">
          <ng-content />
        </div>
        <footer class="dialog-footer">
          <ng-content select="[dialog-actions]" />
        </footer>
      </div>
    </div>
  `,
})
export class DialogComponent {
  close = output();
}
```

Component cha:

```html
<app-dialog (close)="onClose()">
  <h2 dialog-title>Xác nhận xóa</h2>

  <p>Bạn có chắc muốn xóa sản phẩm này?</p>

  <div dialog-actions>
    <button (click)="onClose()">Hủy</button>
    <button (click)="onDelete()">Xóa</button>
  </div>
</app-dialog>
```

| Cú pháp select | Match |
|-----------------|-------|
| `select="[dialog-title]"` | Element có attribute `dialog-title` |
| `select=".my-class"` | Element có class `my-class` |
| `select="app-icon"` | Element là component `<app-icon>` |
| Không có `select` | Mọi nội dung **chưa match** slot nào → slot mặc định |

### ngProjectAs — giả mạo selector

Khi cần project `<ng-container>` (không tạo DOM element) vào slot có selector:

```html
<app-dialog>
  <ng-container ngProjectAs="[dialog-title]">
    <h2>Tiêu đề</h2>
  </ng-container>
  <p>Nội dung...</p>
</app-dialog>
```

`ngProjectAs="[dialog-title]"` khiến Angular match `<ng-container>` vào slot `select="[dialog-title]"` dù `ng-container` không có attribute thật.

### Conditional content — kiểm tra có content không

Dùng `@ContentChild` hoặc CSS `:empty` để ẩn wrapper khi cha không truyền nội dung:

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      @if (hasHeader) {
        <header class="card-header">
          <ng-content select="[card-header]" />
        </header>
      }
      <div class="card-body">
        <ng-content />
      </div>
    </div>
  `,
})
export class CardComponent {
  @ContentChild('cardHeader') headerRef?: ElementRef;
  get hasHeader() { return !!this.headerRef; }
}
```

### ngTemplateOutlet — truyền template từ cha

Khi cần cha truyền **template** (không chỉ HTML tĩnh):

```typescript
// Component con
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ul>
      @for (item of items; track item.id) {
        <li>
          <ng-container
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="{ $implicit: item, index: $index }"
          />
        </li>
      }
    </ul>
  `,
})
export class ListComponent<T> {
  items = input.required<T[]>();
  @ContentChild('itemTpl') itemTemplate!: TemplateRef<any>;
}
```

Component cha:

```html
<app-list [items]="products">
  <ng-template #itemTpl let-product let-i="index">
    <span>{{ i + 1 }}. {{ product.name }} - {{ product.price | currency:'VND' }}</span>
  </ng-template>
</app-list>
```

- `let-product` = `$implicit` (item hiện tại).
- `let-i="index"` = biến `index` từ context.
- Cha quyết định cách **render từng item**; con chỉ lo logic lặp.

---

## Dynamic Components

### Dynamic Components là gì? (Cho người mới)

- **Dynamic Component** = tạo và render component **lúc runtime** (không viết cứng `<app-xxx>` trong template). Dùng khi: nội dung tùy thuộc vào dữ liệu (dashboard widget, form builder, plugin), dialog/modal content thay đổi, hoặc danh sách component từ config.
- Angular cung cấp `ViewContainerRef.createComponent()` và directive `NgComponentOutlet` để render component động.

### NgComponentOutlet — cách đơn giản nhất

```typescript
@Component({
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="currentComponent" />
  `,
})
export class DashboardComponent {
  currentComponent: Type<any> = ChartWidgetComponent;

  switchWidget(type: string) {
    switch (type) {
      case 'chart': this.currentComponent = ChartWidgetComponent; break;
      case 'table': this.currentComponent = TableWidgetComponent; break;
      case 'stats': this.currentComponent = StatsWidgetComponent; break;
    }
  }
}
```

- `[ngComponentOutlet]` nhận **class component**; Angular tự tạo instance và render.
- Khi `currentComponent` đổi → component cũ bị destroy, component mới được tạo.

**Truyền inputs (Angular 16.2+):**

```html
<ng-container
  [ngComponentOutlet]="currentComponent"
  [ngComponentOutletInputs]="{ data: widgetData, title: 'Thống kê' }"
/>
```

### ViewContainerRef.createComponent() — kiểm soát nhiều hơn

Khi cần truyền input/output, giữ reference, hoặc tạo nhiều component vào cùng vị trí:

```typescript
@Component({
  template: `<div #container></div>`,
})
export class ModalHostComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;

  openModal(component: Type<any>, data: any) {
    this.container.clear(); // Xóa component cũ nếu có

    const ref = this.container.createComponent(component);
    // Truyền input
    ref.setInput('data', data);
    // Lắng nghe output (nếu component có EventEmitter/output)
    ref.instance.closed?.subscribe(() => {
      ref.destroy();
    });
  }
}
```

### Ví dụ: Dashboard widgets từ config

```typescript
interface WidgetConfig {
  type: string;
  component: Type<any>;
  inputs: Record<string, any>;
}

@Component({
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @for (widget of widgets; track widget.type) {
      <div class="widget-card">
        <ng-container
          [ngComponentOutlet]="widget.component"
          [ngComponentOutletInputs]="widget.inputs"
        />
      </div>
    }
  `,
})
export class DashboardComponent {
  widgets: WidgetConfig[] = [
    { type: 'sales', component: SalesChartComponent, inputs: { period: 'month' } },
    { type: 'users', component: UserStatsComponent, inputs: { limit: 10 } },
    { type: 'orders', component: OrderTableComponent, inputs: { status: 'pending' } },
  ];
}
```

---

## Câu hỏi thường gặp

**@defer có ảnh hưởng SEO không?**  
Content trong `@defer` không render ngay → crawler có thể không thấy. Nếu cần SEO, đặt nội dung quan trọng ngoài `@defer`, hoặc dùng SSR (Angular Universal) render trước. Nội dung phụ (chart, comment) thường không cần SEO → `@defer` phù hợp.

**@defer có hỗ trợ SSR không?**  
Có. Trên server, `@defer` render `@placeholder` (nếu không có trigger SSR). Client-side hydration sẽ xử lý trigger và lazy load.

**Content Projection vs @Input?**  
`@Input` truyền **dữ liệu** (string, number, object). Content Projection truyền **HTML/template/component** — phù hợp khi cha muốn quyết định **cấu trúc giao diện** bên trong con.

**Dynamic component có lazy load không?**  
Có. Dùng `import()` trước khi createComponent:

```typescript
async openEditor() {
  const { EditorComponent } = await import('./editor/editor.component');
  this.container.createComponent(EditorComponent);
}
```

**Khi nào dùng NgComponentOutlet vs createComponent?**  
`NgComponentOutlet`: Đơn giản, không cần reference, swap 1 component. `createComponent`: Cần kiểm soát lifecycle, truyền output, tạo nhiều instance, custom injector.

---

## Senior / Master

- **@defer prefetch strategies**: Kết hợp `prefetch on idle` với `on viewport` để tải trước trong lúc user đọc nội dung trên → khi scroll tới, render ngay. Phân tích bundle để chọn component nào cần defer (component > 50KB nên defer).
- **Template outlet pattern**: Xây dựng **generic components** (table, list, tree) với `ngTemplateOutlet` — component con cung cấp logic (sort, filter, pagination), cha cung cấp template render item. Pattern này rất mạnh cho **design system** / **shared library**.
- **Dynamic component + DI**: Truyền custom `Injector` cho `createComponent(component, { injector: customInjector })` để cung cấp data/service riêng cho mỗi instance dynamic. Dùng cho plugin system hoặc dashboard extensible.
- **cdkPortal / cdkPortalOutlet**: CDK cung cấp Portal API để "teleport" content đến vị trí khác trong DOM (dialog, tooltip, overlay) — dùng thay cho dynamic component khi cần attach vào DOM node cố định.

---

→ Xem thêm: [03 - Components & Templates](03-components-templates.md) | [11 - UI & Styling (CDK)](11-ui-styling.md)  
→ Tiếp theo: [18 - Authentication & Authorization](18-authentication.md)
