# Components & Templates

Component là đơn vị UI cơ bản trong Angular: class (logic) + template (HTML) + style.

## Mục lục
1. [Component là gì? (Cho người mới)](#component-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Từ class + template đến màn hình](#ví-dụ-trực-quan-từ-class--template-đến-màn-hình)
3. [Tạo component](#tạo-component)
4. [Data binding](#data-binding)
5. [Input và Output](#input-và-output)
6. [ViewChild và ContentChild](#viewchild-và-contentchild)
7. [Template reference variable](#template-reference-variable)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Component là gì? (Cho người mới)

- **Component** = một “khối” giao diện có **logic** (class TypeScript) và **giao diện** (template HTML, có thể kèm CSS). Ví dụ: nút “Thêm vào giỏ”, card sản phẩm, form đăng nhập — mỗi thứ có thể là một component. Angular render trang bằng cách ghép nhiều component: component gốc chứa component con, tạo thành cây component.
- **Selector** = tên thẻ HTML để đặt component vào template (ví dụ `<app-product-list>`). **Template** = HTML có thể chèn biến và biểu thức (`{{ title }}`, `(click)="..."`). **Data binding** = kết nối dữ liệu từ class ra template và ngược lại (sự kiện từ template vào class).
- Khi bạn đổi dữ liệu trong class (ví dụ `title = 'Xin chào'`), template tự cập nhật; khi user click, class nhận sự kiện và xử lý. Đây là nền tảng của mọi màn hình Angular.

---

## Ví dụ trực quan: Từ class + template đến màn hình

Chạy `ng g c demo-hello --standalone`. Trong `demo-hello.component.ts` đặt `name = 'Nguyễn Văn A'`; trong template đặt `<p>Xin chào, {{ name }}!</p>`. Ở `app.component.html` thêm `<app-demo-hello></app-demo-hello>`. Chạy `ng serve` — trên màn hình bạn thấy **“Xin chào, Nguyễn Văn A!”**. Đổi `name` thành `'Trần Thị B'` và lưu → chữ trên trang đổi theo. Đó là **one-way binding** (class → template).

**Thử two-way:** Thêm trong template `<input [(ngModel)]="name" />` (cần import `FormsModule`). Khi bạn gõ vào ô input, chữ “Xin chào, ...” cập nhật theo từng ký tự — dữ liệu đi cả hai chiều: input → class → template.

---

## Tạo component

```bash
ng g c features/product/product-list --standalone
```

Cấu trúc một component standalone:

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  title = 'Sản phẩm';
}
```

- **selector**: Tên thẻ HTML dùng trong template (ví dụ `<app-product-list>`).
- **templateUrl** / **template**: HTML.
- **styleUrl** / **styles**: CSS/SCSS (có thể scope theo component).

---

## Data binding

| Cú pháp | Hướng | Ví dụ |
|--------|--------|--------|
| `{{ expr }}` | Component → DOM | `{{ title }}` |
| `[property]="expr"` | Component → DOM (property) | `[disabled]="isLoading"` |
| `(event)="handler()"` | DOM → Component | `(click)="onSubmit()"` |
| `[(ngModel)]="prop"` | Two-way (cần FormsModule) | `[(ngModel)]="username"` |

```html
<p>{{ product.name }}</p>
<button [disabled]="!isValid" (click)="save()">Lưu</button>
<input [(ngModel)]="searchText" />
```

---

## Input và Output

- **Input**: Nhận dữ liệu từ component cha (signal hoặc decorator).
- **Output**: Gửi sự kiện lên cha (EventEmitter hoặc output signal).

Cách hiện đại (Angular 17+):

```typescript
import { Component, input, output } from '@angular/core';

@Component({ ... })
export class ProductCardComponent {
  product = input.required<Product>();
  deleted = output<Product>();

  onDelete() {
    this.deleted.emit(this.product());
  }
}
```

Template cha:

```html
<app-product-card
  [product]="selectedProduct()"
  (deleted)="handleDelete($event)"
/>
```

Cách cũ (vẫn dùng được):

```typescript
@Input() product!: Product;
@Output() deleted = new EventEmitter<Product>();
```

---

## ViewChild và ContentChild

- **ViewChild**: Tham chiếu đến element/component **trong template của chính component**.
- **ContentChild**: Tham chiếu đến content **được project từ cha** (ng-content).

```typescript
@ViewChild('formRef') formRef!: ElementRef<HTMLFormElement>;
@ViewChild(ChildComponent) child!: ChildComponent;

ngAfterViewInit() {
  this.formRef.nativeElement.focus();
}
```

```html
<input #formRef />
<app-child />
```

---

## Template reference variable

Dùng `#tên` để lấy tham chiếu đến element/component/directive trong template.

```html
<input #searchInput />
<button (click)="searchInput.focus()">Focus</button>
```

---

## Câu hỏi thường gặp

**Khi nào dùng `input()`/`output()` thay vì `@Input()`/`@Output()`?**  
Signal-based API (Angular 17+) giúp reactive và type-safe hơn; dự án mới nên ưu tiên. `@Input()`/`@Output()` vẫn hợp lệ.

**Component vs Directive?**  
Component có template (view); directive chỉ thay đổi hành vi/appearance của element (ví dụ `ngIf`, `ngFor`). Component là directive có template.

**Encapsulation (ViewEncapsulation)?**  
Mặc định `Emulated`: style component chỉ ảnh hưởng view của component. Có thể đổi `None` (global) hoặc `ShadowDom`.

---

## Senior / Master

- **ChangeDetectionStrategy.OnPush**: Đặt `changeDetection: ChangeDetectionStrategy.OnPush` để CD chỉ chạy khi input đổi (reference), event từ template, hoặc async pipe / markForCheck. **Bắt buộc** truyền data immutable hoặc reference mới khi cập nhật.
- **Content projection nhiều slot**: `<ng-content select="[header]">`, `<ng-content select="[body]">` — cha truyền nhiều vùng nội dung, component con định nghĩa vị trí hiển thị.
- **Control flow mới (Angular 17+)**: `@if (condition) { ... } @else { ... }`, `@for (item of items; track item.id) { ... }`, `@switch (value) { @case (a) { ... } }` — biên dịch tốt hơn, không cần import NgIf/NgFor trong standalone.
- **Signals**: `signal()`, `computed()`, `effect()` — dùng cho state nội bộ; template đọc bằng `count()`. Chi tiết: [15 - Master Angular](15-master-angular.md#signals--reactive-primitive).

---

→ Tiếp theo: [04 - Directives & Pipes](04-directives-pipes.md)
