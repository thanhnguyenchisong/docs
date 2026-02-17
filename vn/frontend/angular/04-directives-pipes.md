# Directives & Pipes

Directives thay đổi cấu trúc hoặc hành vi của DOM; Pipes biến đổi giá trị hiển thị trong template.

## Mục lục
1. [Directive và Pipe là gì? (Cho người mới)](#directive-và-pipe-là-gì-cho-người-mới)
2. [Ví dụ trực quan: ngIf, ngFor và pipe date](#ví-dụ-trực-quan-ngif-ngfor-và-pipe-date)
3. [Structural directives](#structural-directives)
4. [Attribute directives](#attribute-directives)
5. [Custom directive](#custom-directive)
6. [Built-in Pipes](#built-in-pipes)
7. [Custom Pipe](#custom-pipe)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Directive và Pipe là gì? (Cho người mới)

- **Directive** = chỉ thị “làm gì đó” với một element hoặc component. **Structural directive** (có dấu `*`) thay đổi **cấu trúc** DOM: thêm/xóa nhánh (ví dụ `*ngIf` = chỉ hiển thị khi điều kiện đúng; `*ngFor` = lặp danh sách). **Attribute directive** thay đổi giao diện hoặc hành vi (ví dụ `ngClass` thêm/bớt class, `ngModel` two-way binding).
- **Pipe** = biến đổi **giá trị hiển thị** trong template trước khi in ra: ví dụ `{{ date | date:'dd/MM/yyyy' }}` in ngày theo định dạng; `{{ price | currency:'VND' }}` in tiền tệ. Pipe không thay đổi dữ liệu gốc trong class, chỉ thay đổi cách hiển thị.
- Kết hợp: một template có thể dùng nhiều directive và pipe — ví dụ `*ngFor` lặp list, mỗi item qua pipe `date` hoặc `currency` để hiển thị đẹp.

---

## Ví dụ trực quan: ngIf, ngFor và pipe date

Trong bất kỳ component nào, thêm vào template:

```html
<p *ngIf="showMessage">Bạn đang thấy dòng này.</p>
<button (click)="showMessage = !showMessage">Bật/Tắt</button>

<ul>
  <li *ngFor="let item of items">{{ item.name }} - {{ item.date | date:'dd/MM/yyyy' }}</li>
</ul>
```

Trong class: `showMessage = true;` và `items = [{ name: 'A', date: new Date() }, { name: 'B', date: new Date() }];` (cần `CommonModule` trong imports). **Trên màn hình:** Một đoạn text và nút; bấm nút thì đoạn text biến mất/xuất hiện (ngIf). Bên dưới là list hai dòng, mỗi dòng có tên và ngày định dạng dd/MM/yyyy (ngFor + pipe date). Đổi `items` trong class (thêm/xóa phần tử) và lưu → list trên trang thay đổi. Đó là directive + pipe trực quan.

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
