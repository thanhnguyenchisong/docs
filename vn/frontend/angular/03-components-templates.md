# Components & Templates

Component là đơn vị UI cơ bản trong Angular: class (logic) + template (HTML) + style.

## Mục lục
1. [Tạo component](#tạo-component)
2. [Data binding](#data-binding)
3. [Input và Output](#input-và-output)
4. [ViewChild và ContentChild](#viewchild-và-contentchild)
5. [Template reference variable](#template-reference-variable)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

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
