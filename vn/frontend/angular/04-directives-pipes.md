# Directives & Pipes

Directives thay đổi cấu trúc hoặc hành vi của DOM; Pipes biến đổi giá trị hiển thị trong template.

## Mục lục
1. [Structural directives](#structural-directives)
2. [Attribute directives](#attribute-directives)
3. [Custom directive](#custom-directive)
4. [Built-in Pipes](#built-in-pipes)
5. [Custom Pipe](#custom-pipe)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Structural directives

Thay đổi cấu trúc DOM (thêm/xóa nhánh). Cú pháp có dấu `*`.

| Directive | Ý nghĩa |
|-----------|---------|
| `*ngIf` | Hiển thị element khi điều kiện true; có `else` và `as` |
| `*ngFor` | Lặp qua collection; có `trackBy`, `as`, index |
| `*ngSwitch` | Switch/case cho template |

```html
<p *ngIf="user; else noUser">Xin chào {{ user.name }}</p>
<ng-template #noUser>Chưa đăng nhập</ng-template>

<li *ngFor="let item of items; trackBy: trackById; index as i">
  {{ i + 1 }}. {{ item.name }}
</li>

<div [ngSwitch]="status">
  <span *ngSwitchCase="'loading'">Đang tải...</span>
  <span *ngSwitchCase="'error'">Lỗi</span>
  <span *ngSwitchDefault>Xong</span>
</div>
```

- **trackBy**: Hàm trả về id duy nhất để Angular tái sử dụng node, tránh re-render toàn bộ list.

```typescript
trackById(index: number, item: { id: number }) {
  return item.id;
}
```

---

## Attribute directives

Thay đổi giao diện hoặc hành vi của một element/component.

| Directive | Ví dụ |
|-----------|--------|
| `ngModel` | Two-way binding (cần `FormsModule`) |
| `ngClass` | Thêm/bớt class theo điều kiện |
| `ngStyle` | Gán style động |
| `ngModel` | `[(ngModel)]="value"` |

```html
<div [ngClass]="{ active: isActive, disabled: !enabled }">...</div>
<div [ngClass]="getClasses()">...</div>
<p [ngStyle]="{ color: colorVar, 'font-size.px': size }">...</p>
```

---

## Custom directive

Ví dụ directive highlight khi hover:

```typescript
import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  highlightColor = input<string>('yellow');
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.highlightColor();
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
```

```html
<p appHighlight [highlightColor]="'lightblue'">Hover vào đây</p>
```

---

## Built-in Pipes

| Pipe | Ví dụ |
|------|--------|
| `date` | `{{ date \| date:'dd/MM/yyyy' }}` |
| `number` | `{{ value \| number:'1.2-2' }}` |
| `currency` | `{{ price \| currency:'VND' }}` |
| `percent` | `{{ rate \| percent }}` |
| `uppercase` / `lowercase` | `{{ name \| uppercase }}` |
| `slice` | `{{ arr \| slice:0:5 }}` |
| `json` | `{{ obj \| json }}` (debug) |
| `async` | `{{ observable \| async }}` (subscribe và hiển thị giá trị) |

Chaining: `{{ value \| pipe1 \| pipe2 }}`

---

## Custom Pipe

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50, suffix = '...'): string {
    if (!value || value.length <= limit) return value;
    return value.slice(0, limit) + suffix;
  }
}
```

```html
<p>{{ longText | truncate:30 }}</p>
```

Pipe **pure** (mặc định): chỉ chạy lại khi input reference thay đổi. **Impure**: chạy mỗi change detection (dùng ít, dễ ảnh hưởng performance).

---

## Câu hỏi thường gặp

**`*ngIf` vs ẩn bằng CSS (`[hidden]`)?**  
`*ngIf` không render element trong DOM; `[hidden]` vẫn có trong DOM, chỉ ẩn. Dùng `*ngIf` khi không cần element khi điều kiện false (tiết kiệm DOM và logic).

**Khi nào cần `trackBy` với `*ngFor`?**  
Khi list thay đổi thường xuyên (thêm/xóa/sắp xếp) để Angular nhận diện item theo id, tránh re-create toàn bộ node → cải thiện performance.

**Pure vs impure pipe?**  
Pure: đầu vào không đổi thì kết quả không đổi, Angular cache. Impure: chạy mỗi lần change detection; dùng khi cần (ví dụ pipe phụ thuộc global state), nhưng cẩn thận performance.

---

## Senior / Master

- **Control flow mới (@if, @for, @switch)**: Angular 17+ — dùng trong template thay cho *ngIf, *ngFor, *ngSwitch; không cần import directive, biên dịch tối ưu hơn. Ví dụ: `@for (item of items; track item.id) { ... }`.
- **Structural directive performance**: *ngFor không trackBy → Angular tạo lại DOM node khi list thay đổi. Luôn dùng trackBy (hoặc @for với track) khi list động. Chi tiết performance: [15 - Master Angular](15-master-angular.md#performance).
- **Pipe trong expression phức tạp**: Tránh gọi pipe (hoặc hàm) nhiều lần trong template với cùng input; có thể dùng computed/signal hoặc biến trung gian.

---

→ Tiếp theo: [05 - Services & Dependency Injection](05-services-di.md)
