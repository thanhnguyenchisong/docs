# UI & Styling

Để build giao diện Angular hoàn chỉnh cần chọn cách styling (SCSS, component styles), thư viện UI (Angular Material, PrimeNG, …) và cách làm responsive, theme.

## Mục lục
1. [UI & Styling trong Angular là gì? (Cho người mới)](#ui--styling-trong-angular-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Style component và Material button](#ví-dụ-trực-quan-style-component-và-material-button)
3. [Component styles và SCSS](#component-styles-và-scss)
4. [Angular Material](#angular-material)
5. [Angular Animations](#angular-animations)
6. [Theming và responsive](#theming-và-responsive)
7. [Best practices](#best-practices)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## UI & Styling trong Angular là gì? (Cho người mới)

- **Styling** = cách bạn làm giao diện đẹp và nhất quán: CSS/SCSS cho từng component (file `.scss` gắn với component), style toàn cục (`styles.scss`), và có thể dùng **thư viện UI** (Angular Material, PrimeNG…) để có sẵn nút, form, bảng, theme.
- **Component styles** mặc định có **encapsulation**: style trong component chỉ áp dụng cho view của component đó, không “rò rỉ” ra ngoài — tránh conflict với component khác. Dùng `:host` để style chính thẻ host (selector của component).
- **Angular Material** = bộ component theo Material Design (button, input, dialog, table…), có theming (đổi màu chủ đạo). Cài bằng `ng add @angular/material`; sau đó dùng thẻ như `<button mat-button>`, `<mat-form-field>` trong template.

---

## Ví dụ trực quan: Style component và Material button

**Style component:** Tạo component `ng g c demo-box`, trong `demo-box.component.scss` đặt `.box { padding: 1rem; border: 2px solid #1976d2; border-radius: 8px; }`, template `<div class="box">Nội dung</div>`. Trên màn hình bạn thấy hộp có viền xanh. Mở DevTools: class `.box` được Angular thêm suffix (ví dụ `_ngcontent-xxx`) nên chỉ áp cho element trong component này — đó là **view encapsulation**.

**Material button:** Chạy `ng add @angular/material` (chọn theme, typography tùy ý). Trong template bất kỳ thêm `<button mat-raised-button color="primary">Nút Material</button>`. Trên màn hình xuất hiện nút theo Material Design (màu chủ đạo, ripple khi click). Đổi `color="accent"` hoặc `color="warn"` — nút đổi màu theo theme. Đó là UI library trực quan.

---

## Component styles và SCSS

- **styleUrls** / **styleUrl**: File SCSS/CSS riêng cho component; mặc định **encapsulation** (Emulated) nên style chỉ áp cho view của component.
- **styles**: Inline CSS/SCSS trong `@Component({ styles: ['...'] })`.
- **Global**: `src/styles.scss` (được import trong `angular.json`), ảnh hưởng toàn app.

SCSS thường dùng: biến, nested, mixin, import.

```scss
// styles.scss (global)
$primary: #1976d2;
@import 'theme/mixins';

// component
.container {
  padding: 1rem;
  .title {
    color: $primary;
  }
}
```

`:host` và `:host-context` để style host element hoặc theo context (ví dụ theme).

```scss
:host {
  display: block;
}
:host-context(.dark) {
  .card { background: #333; }
}
```

---

## Angular Material

Component library chính thức (Material Design). Cài và cấu hình:

```bash
ng add @angular/material
```

Chọn theme (Indigo/Pink, …), typography, animations. Sẽ thêm vào `angular.json` và `app.config.ts`.

Dùng component trong template (import standalone):

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

@Component({
  imports: [MatButtonModule, MatTableModule],
  ...
})
```

```html
<button mat-raised-button color="primary">Lưu</button>
<table mat-table [dataSource]="dataSource">...</table>
```

- **Cdk (Component Dev Kit)**: Một số primitive (overlay, a11y) dùng mà không bắt buộc Material theme.
- **Icons**: `MatIconModule` + font hoặc SVG; **Material Icons** font.

---

## Angular Animations

Angular có module animation riêng (`@angular/animations`) cho phép khai báo animation **trong metadata component**, gắn với state/trigger, tích hợp với route transition.

**Cài đặt** (standalone):

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [provideAnimationsAsync()],
});
```

**Ví dụ: fade in/out khi ẩn hiện element**

```typescript
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    @if (visible) {
      <div @fadeInOut>Nội dung hiển thị mượt mà</div>
    }
  `,
})
```

**Các khái niệm chính:**

| Khái niệm | Mô tả |
|------------|--------|
| `trigger` | Tên animation, gắn vào template bằng `@triggerName` |
| `state` | Định nghĩa style cho một trạng thái (ví dụ `open`, `closed`) |
| `transition` | Chuyển đổi giữa các state (`:enter`, `:leave`, `open => closed`) |
| `animate` | Thời gian và easing (`'300ms ease-in'`) |
| `style` | CSS properties áp dụng |
| `query` / `stagger` | Animation cho danh sách (stagger = hiệu ứng lần lượt từng item) |

**Route animation**: Dùng `trigger` trên `<router-outlet>` kết hợp `route.data` để tạo hiệu ứng chuyển trang (slide, fade).

```typescript
trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(':leave', [animate('200ms', style({ opacity: 0 }))], { optional: true }),
    query(':enter', [animate('300ms', style({ opacity: 1 }))], { optional: true }),
  ]),
])
```

---

## Theming và responsive

- **Material Theming**: Dùng Sass variables và mixins (`@include angular-material-theme($theme)`); tạo theme sáng/tối bằng cách đổi palette.
- **CSS variables**: Có thể dùng biến CSS (custom properties) cho màu, spacing; đổi giá trị theo class (ví dụ `.dark`) để switch theme.
- **Responsive**: Media queries trong SCSS hoặc dùng **BreakpointObserver** (CDK) trong class để hiển thị/ẩn, đổi layout.

```typescript
import { BreakpointObserver } from '@angular/cdk/layout';

constructor(private bp: BreakpointObserver) {}
isSmall$ = this.bp.observe('(max-width: 600px)').pipe(
  map(s => s.matches),
);
```

---

## Best practices

- Ưu tiên **component-scoped** style; global chỉ cho reset, typography, theme biến.
- Dùng **Angular Material** (hoặc một lib nhất quán) để UI đồng bộ và a11y.
- **Responsive**: Mobile-first, test nhiều kích thước.
- **Accessibility**: Semantic HTML, label, focus, contrast; Material component đã hỗ trợ nhiều.

---

## Câu hỏi thường gặp

**Angular Material vs PrimeNG / other?**  
Material tích hợp tốt với Angular, design chuẩn. PrimeNG có nhiều component (table, chart), theme riêng. Chọn theo yêu cầu design và component cần dùng.

**Style component ảnh hưởng child?**  
Mặc định encapsulation Emulated: style component chỉ ảnh hưởng view của nó (Angular thêm attribute). Style không “xuyên” vào child component. Để style child có thể dùng `::ng-deep` (deprecated) hoặc đưa style lên global có scope class cha.

**Làm theme tối/sáng?**  
Material: tạo 2 theme (light/dark), đổi class trên body hoặc dùng `@media (prefers-color-scheme)`. Hoặc dùng CSS variables và đổi giá trị theo class.

**Bảng dữ liệu lớn (sort, filter, virtual scroll)?**  
Dùng **AG-Grid**: [16 - AG-Grid](16-ag-grid.md). Material Table đủ cho list đơn giản; AG-Grid cho màn admin/report.

---

## Senior / Master

- **Angular CDK (Component Dev Kit)**: Bộ primitive không gắn với Material Design: `DragDropModule` (kéo thả), `ScrollingModule` (virtual scroll cho list lớn), `OverlayModule` (popup, tooltip, dialog tùy chỉnh), `A11yModule` (focus trap, live announcer). Dùng CDK khi cần behavior nhưng không muốn style Material.
- **Animation performance**: Dùng `transform` và `opacity` thay vì `width`/`height`/`top`/`left` để animation chạy trên GPU (composite layer). Tránh animation trên list lớn không có stagger/limit.
- **CSS containment**: `contain: content` hoặc `contain: layout` trên component host để browser giới hạn repaint/reflow scope.
- **Design system**: Với app lớn, xây dựng shared component library (button, input, card, modal) với consistent API (Input/Output), theme variables, và Storybook để document UI.

---

→ Tiếp theo: [12 - Testing](12-testing.md)
