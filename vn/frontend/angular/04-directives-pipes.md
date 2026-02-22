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

### Directive

**Directive** = chỉ thị “làm gì đó” với một element hoặc component. Angular có hai nhóm chính:

| Loại | Dấu hiệu | Tác dụng | Ví dụ |
|------|----------|----------|--------|
| **Structural** | Cú pháp có dấu `*` | Thay đổi **cấu trúc** DOM: thêm, xóa, lặp nhánh | `*ngIf`, `*ngFor`, `*ngSwitch` |
| **Attribute** | Gắn như attribute `[ngClass]`, `ngModel` | Thay đổi **giao diện** hoặc **hành vi** của element | `ngClass`, `ngStyle`, `ngModel` |

- **Structural directive** viết với `*` (syntax sugar cho `<ng-template>`): Angular thêm/xóa node trong DOM hoặc lặp nhiều bản copy.
- **Attribute directive** không thêm/xóa node, chỉ sửa property, class, style hoặc lắng nghe event trên element đó.

**Component** thực chất là một directive có **template** (view); directive thuần không có template, chỉ bám vào host element.

### Pipe

**Pipe** = biến đổi **giá trị hiển thị** trong template trước khi in ra. Pipe **không** sửa dữ liệu gốc trong class, chỉ dùng cho output.

- Ví dụ: `{{ date | date:'dd/MM/yyyy' }}` in ngày theo định dạng; `{{ price | currency:'VND' }}` in tiền tệ.
- Có thể **chain** nhiều pipe: `{{ text | uppercase | slice:0:10 }}`.

### Kết hợp

Một template thường dùng cả directive và pipe: ví dụ `*ngFor` lặp list, mỗi item qua pipe `date` hoặc `currency` để hiển thị. Directive điều khiển “có gì / lặp gì”, pipe điều khiển “hiển thị như thế nào”.

---

## Ví dụ trực quan: ngIf, ngFor và pipe date

Trong bất kỳ component nào (standalone), thêm **CommonModule** vào `imports` (để dùng `*ngIf`, `*ngFor`) và đoạn sau vào template:

```html
<p *ngIf="showMessage">Bạn đang thấy dòng này.</p>
<button (click)="showMessage = !showMessage">Bật/Tắt</button>

<ul>
  <li *ngFor="let item of items">{{ item.name }} - {{ item.date | date:'dd/MM/yyyy' }}</li>
</ul>
```

Trong class component:

```typescript
showMessage = true;
items = [
  { name: 'A', date: new Date() },
  { name: 'B', date: new Date() },
];
```

**Trên màn hình:** Một đoạn text và nút; bấm nút thì đoạn text biến mất/xuất hiện (`*ngIf`). Bên dưới là list hai dòng, mỗi dòng có tên và ngày định dạng dd/MM/yyyy (`*ngFor` + pipe `date`). Đổi `items` trong class (thêm/xóa phần tử) và lưu → list trên trang thay đổi. Đó là directive + pipe trực quan.

---

## Structural directives

Thay đổi **cấu trúc** DOM (thêm/xóa/lặp nhánh). Cú pháp có dấu `*` — Angular biên dịch thành `<ng-template>` bên trong.

| Directive | Ý nghĩa |
|-----------|---------|
| `*ngIf` | Hiển thị nhánh khi điều kiện true; hỗ trợ `else`, `as`, `then` |
| `*ngFor` | Lặp qua collection; có `trackBy`, `as`, `index`, `first`, `last`, `even`, `odd` |
| `*ngSwitch` | Chọn một trong nhiều nhánh theo giá trị (switch/case) |

### *ngIf

- **Cơ bản**: Chỉ render element khi biểu thức truthy. Khi false, element **không có trong DOM** (khác với ẩn bằng CSS).

```html
<p *ngIf="isLoggedIn">Xin chào, bạn đã đăng nhập.</p>
```

- **else**: Khi điều kiện false, hiển thị template khác. Cần tham chiếu `#tên` trỏ tới `<ng-template>`.

```html
<p *ngIf="user; else noUser">Xin chào {{ user.name }}</p>
<ng-template #noUser>Chưa đăng nhập.</ng-template>
```

- **as**: Gán kết quả biểu thức vào biến (tiện khi dùng async pipe).

```html
<div *ngIf="user$ | async as user">Xin chào {{ user.name }}</div>
```

- **then / else**: Tách template “đúng” và “sai” ra hai `<ng-template>`.

```html
<ng-container *ngIf="hasData; then content; else loading"></ng-container>
<ng-template #content>Nội dung...</ng-template>
<ng-template #loading>Đang tải...</ng-template>
```

### *ngFor

- **Cú pháp**: `*ngFor="let item of items"`. Có thể thêm `index as i`, `first as isFirst`, `last`, `even`, `odd`.

```html
<li *ngFor="let item of items; index as i; first as isFirst">
  {{ i + 1 }}. {{ item.name }} <span *ngIf="isFirst">(đầu tiên)</span>
</li>
```

- **trackBy** (quan trọng với list động): Hàm trả về **id duy nhất** cho mỗi item. Angular dùng nó để so sánh item cũ/mới và **tái sử dụng** DOM node thay vì xóa rồi tạo lại → cải thiện performance và giữ state (vd focus, animation).

```html
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
```

```typescript
trackById(index: number, item: { id: number }) {
  return item.id;
}
```

Nếu không dùng trackBy, mỗi lần `items` thay đổi (reference mới) Angular có thể re-create toàn bộ node.

### *ngSwitch

So sánh **một giá trị** với nhiều case; chỉ một nhánh được render. `ngSwitchDefault` dùng khi không khớp case nào.

```html
<div [ngSwitch]="status">
  <span *ngSwitchCase="'loading'">Đang tải...</span>
  <span *ngSwitchCase="'error'">Có lỗi.</span>
  <span *ngSwitchCase="'empty'">Không có dữ liệu.</span>
  <span *ngSwitchDefault>Hoàn tất.</span>
</div>
```

**Lưu ý**: `[ngSwitch]` là property binding trên container; `*ngSwitchCase` và `*ngSwitchDefault` là structural directive trên từng nhánh.

---

## Attribute directives

Thay đổi **giao diện** hoặc **hành vi** của một element/component (class, style, attribute, two-way binding). Không thêm/xóa node DOM.

| Directive | Mục đích | Ghi chú |
|-----------|----------|--------|
| `ngClass` | Thêm/bớt class theo điều kiện | Nhận object, array, hoặc string |
| `ngStyle` | Gán style động | Object với key là tên style (camelCase hoặc 'font-size.px') |
| `ngModel` | Two-way binding cho form control | Cần `FormsModule`; dùng với `<input>`, `<select>`, `<textarea>` |

### ngClass

- **Object**: key = tên class, value = điều kiện (truthy thì class được thêm).

```html
<div [ngClass]="{ active: isActive, disabled: !enabled, 'text-bold': isBold }">...</div>
```

- **Array**: danh sách class (string hoặc biểu thức trả về string). Class nào falsy sẽ bị bỏ qua.

```html
<div [ngClass]="['box', isActive && 'active', role]">...</div>
```

- **String**: một chuỗi class giống `class="a b c"`.

```html
<div [ngClass]="'box highlight'">...</div>
```

Có thể trả về object/array từ method: `[ngClass]="getClasses()"`.

### ngStyle

Gán inline style từ object. Key dùng **camelCase** (vd `fontSize`) hoặc **kebab với unit** (vd `'font-size.px'`, `'width.%'`).

```html
<p [ngStyle]="{ color: colorVar, 'font-size.px': size, 'font-weight': weight }">...</p>
<p [ngStyle]="getStyles()">...</p>
```

Dùng ít; ưu tiên class + CSS khi có thể để tách style khỏi logic.

### ngModel

Two-way binding: vừa hiển thị giá trị vừa cập nhật property khi user nhập. Cần `FormsModule` (hoặc `ReactiveFormsModule` tùy cách dùng).

```html
<input [(ngModel)]="username" name="username" />
```

`name` thường cần khi dùng trong `<form>` (NgForm). Với standalone component, import `FormsModule` trong `imports` của component.

---

## Custom directive

Custom directive dùng khi cần **tái sử dụng** hành vi hoặc giao diện trên nhiều element/component mà không cần thêm template (khác component). Tạo bằng `ng generate directive tên` hoặc viết tay.

### Ví dụ 1: Highlight khi hover (dùng Renderer2)

**Luôn dùng `Renderer2` thay vì `nativeElement.style`** — tránh lỗi bảo mật (XSS khi giá trị động), tương thích SSR và môi trường không có DOM (worker, testing).

```typescript
import { Directive, ElementRef, HostListener, Renderer2, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  highlightColor = input<string>('yellow');
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.highlightColor());
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
  }
}
```

```html
<p appHighlight [highlightColor]="'lightblue'">Hover vào đây</p>
```

### Renderer2 — API thường dùng

| Method | Mục đích |
|--------|----------|
| `setStyle(el, name, value)` | Gán style (name: camelCase, vd `backgroundColor`) |
| `removeStyle(el, name)` | Xóa style |
| `addClass(el, class)` / `removeClass(el, class)` | Thêm/xóa class |
| `setAttribute(el, name, value)` | Gán attribute (vd `aria-expanded`, `role`) |
| `removeAttribute(el, name)` | Xóa attribute |
| `setProperty(el, name, value)` | Gán property DOM (vd `value`, `checked`) |

Tất cả đều qua abstraction của Angular → an toàn với SSR và sanitization.

### Ví dụ 2: HostBinding — bind property trực tiếp

Khi chỉ cần gán **attribute / class / style** của host theo state, dùng `@HostBinding` cho gọn và declarative; Angular tự cập nhật host element.

```typescript
import { Directive, HostBinding, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  highlightColor = input<string>('yellow');
  @HostBinding('style.backgroundColor') bgColor = '';

  @HostListener('mouseenter') onMouseEnter() {
    this.bgColor = this.highlightColor();
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.bgColor = '';
  }
}
```

**Các dạng HostBinding thường gặp:**

- `@HostBinding('style.backgroundColor')` — style
- `@HostBinding('class.active')` — class (true/false)
- `@HostBinding('attr.aria-expanded')` — attribute (string)
- `@HostBinding('attr.role')` — accessibility

### Ví dụ 3: Directive với HostBinding cho class và attribute

Directive “disabled” tùy biến: thêm class và `aria-disabled`, không dùng DOM trực tiếp.

```typescript
import { Directive, HostBinding, input } from '@angular/core';

@Directive({
  selector: '[appDisabled]',
  standalone: true,
})
export class AppDisabledDirective {
  disabled = input<boolean>(false);

  @HostBinding('class.disabled') get isDisabled() {
    return this.disabled();
  }
  @HostBinding('attr.aria-disabled') get ariaDisabled() {
    return this.disabled() ? 'true' : null;
  }
}
```

```html
<button [appDisabled]="isLoading">Gửi</button>
```

### HostListener — lắng nghe event trên host

- `@HostListener('tênEvent')` lắng nghe event trên element gắn directive.
- Có thể truyền tham số: `@HostListener('document:keydown.escape')` hoặc `@HostListener('click', ['$event'])`.

```typescript
@HostListener('click', ['$event']) onClick(e: MouseEvent) {
  e.stopPropagation();
}
```

### Cấu hình host trong @Directive (tùy chọn)

Có thể khai báo **host bindings và listeners** ngay trong metadata thay vì dùng decorator:

```typescript
@Directive({
  selector: '[appFocus]',
  host: {
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '[class.focused]': 'focused',
  },
})
export class AppFocusDirective {
  focused = false;
  onFocus() { this.focused = true; }
  onBlur() { this.focused = false; }
}
```

Dùng decorator `@HostListener` / `@HostBinding` thường rõ ràng hơn khi logic phức tạp.

### Vòng đời (lifecycle)

Directive có cùng lifecycle cơ bản như component: `ngOnInit`, `ngOnDestroy`, `ngOnChanges` (khi có `@Input`), v.v. Dùng `ngOnDestroy` để dọn dẹp (unsubscribe, remove listener) nếu directive tự đăng ký event hoặc subscription.

### Best practices khi viết directive

| Nội dung | Gợi ý |
|----------|--------|
| **Style / DOM** | Dùng **Renderer2** (`setStyle`, `addClass`, `removeClass`, `setAttribute`) thay vì `nativeElement.style` hoặc `nativeElement.setAttribute` trực tiếp — an toàn hơn, tránh XSS và tương thích SSR. |
| **Selector** | Đặt tên rõ ràng, có **prefix** (vd: `app`, hoặc prefix theo project như `acmeButton`) để tránh trùng với HTML/component khác: `selector: '[appHighlight]'`, `'[appDisabled]'`. |
| **Tái sử dụng** | Directive nên **nhỏ gọn**, một trách nhiệm (vd: chỉ highlight, chỉ focus, chỉ lazy load). Tách logic phức tạp sang service hoặc component để dễ test và dùng lại. |
| **HostBinding** | Khi chỉ cần bind property/class/style của host theo state → dùng **@HostBinding** thay vì Renderer2 cho code ngắn và dễ đọc. |

---

## Built-in Pipes

Pipe nhận **một giá trị** (và tùy chọn tham số), trả về giá trị đã biến đổi cho template. Cú pháp: `{{ value | pipeName:param1:param2 }}`. Có thể **chain**: `{{ value | pipe1 | pipe2 }}`.

| Pipe | Mục đích | Ví dụ / tham số |
|------|----------|------------------|
| `date` | Định dạng ngày/giờ | `date:'dd/MM/yyyy'`, `'short'`, `'medium'`, timezone |
| `number` | Số (số chữ số, locale) | `'1.2-2'` (minInteger.minFrac-maxFrac) |
| `currency` | Tiền tệ | `currency:'VND':'symbol':'1.0-0'` |
| `percent` | Phần trăm | `percent:'1.2-2'` |
| `uppercase` / `lowercase` | Chữ hoa / thường | Không tham số |
| `titlecase` | Chữ đầu mỗi từ hoa | Không tham số |
| `slice` | Cắt array hoặc string | `slice:start:end` (chỉ hiển thị, không đổi list) |
| `json` | In object dạng JSON (debug) | Không nên dùng với data user (XSS) |
| `async` | Subscribe Observable/Promise, hiển thị giá trị | Thường kết hợp `*ngIf="x$ \| async as x"` |
| `keyvalue` | Lặp object theo key/value | `*ngFor="let item of obj \| keyvalue"` |
| `decimal` | Số thập phân (i18n) | Angular 5+ |
| `i18nPlural` / `i18nSelect` | Số nhiều / chọn chuỗi theo giá trị | Dùng cho đa ngôn ngữ |

### Một số ví dụ chi tiết

```html
{{ createdAt | date:'dd/MM/yyyy HH:mm' }}
{{ amount | number:'1.2-2':'vi' }}
{{ price | currency:'VND':'symbol':'1.0-0' }}
{{ ratio | percent:'1.2-2' }}
{{ fullName | titlecase }}
{{ items | slice:0:10 }}
{{ user$ | async }}
```

- **date**: Tham số thứ hai có thể là timezone (vd `'UTC'`). Format string: `y`, `M`, `d`, `h`, `m`, `s`, v.v.
- **number**: `'1.2-2'` = ít nhất 1 chữ số phần nguyên, từ 2 đến 2 chữ số thập phân. Tham số thứ hai là locale.
- **currency**: Tham số: code (VND, USD), display (symbol, code, symbol-narrow), digitsInfo.
- **async**: Trả về giá trị cuối từ Observable hoặc Promise; template tự unsubscribe khi component destroy. Dùng với `*ngIf="obs$ | async as value"` để tránh null trong template.

---

## Custom Pipe

Tạo pipe khi cần **biến đổi giá trị hiển thị** lặp lại nhiều nơi mà built-in pipe không đủ. Tạo bằng `ng generate pipe tên` hoặc viết tay.

### Ví dụ: TruncatePipe

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
<p>{{ longText | truncate:20:'---' }}</p>
```

- **name**: Tên dùng trong template (`| truncate`).
- **standalone: true**: Component dùng pipe cần import pipe đó trong `imports`.
- **transform(value, ...args)**: Tham số đầu là giá trị bên trái `|`, các tham số sau là tham số truyền vào pipe (`:30`, `:'---'`).

### Pure vs Impure

| Loại | Khi nào chạy | Dùng khi |
|------|--------------|----------|
| **Pure** (mặc định) | Khi **reference** của input (value hoặc tham số) thay đổi | Đa số pipe: format, filter, map dữ liệu |
| **Impure** | Mỗi **change detection** | Pipe phụ thuộc state ngoài (vd global, time), cần cập nhật liên tục — dùng ít vì tốn performance |

```typescript
@Pipe({
  name: 'myPipe',
  standalone: true,
  pure: false,  // impure
})
export class MyPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    // Chạy mỗi lần change detection
    return value;
  }
}
```

**Khuyến nghị**: Ưu tiên pure. Nếu cần “reactive” theo state phức tạp, cân nhắc dùng **computed/signal** hoặc method trong class thay vì impure pipe.

### Pipe có nhiều tham số

Tham số truyền lần lượt sau tên pipe, cách nhau bằng `:`.

```html
{{ price | myCurrency: 'VND': true }}
```

```typescript
transform(value: number, code: string, showSymbol: boolean): string {
  // ...
}
```

### Nơi khai báo và dùng

- **Standalone**: Trong `imports` của component (hoặc route, hoặc shared NgModule nếu dùng module).
- **NgModule**: Khai báo trong `declarations` của module; export trong `exports` nếu module khác cần dùng.

---

## Câu hỏi thường gặp

**`*ngIf` vs ẩn bằng CSS (`[hidden]`)?**  
`*ngIf` **không** render element trong DOM khi điều kiện false; `[hidden]` vẫn có trong DOM, chỉ ẩn bằng `display: none`. Dùng `*ngIf` khi không cần element khi điều kiện false (tiết kiệm DOM và logic con). Dùng `[hidden]` khi cần element luôn tồn tại (vd layout, hoặc trường hợp hiếm cần đo kích thước).

**Khi nào cần `trackBy` với `*ngFor`?**  
Khi list **thay đổi thường xuyên** (thêm/xóa/sắp xếp) hoặc reference mảng thay đổi. TrackBy giúp Angular so sánh item theo id thay vì theo thứ tự → tái sử dụng DOM node, giữ state (focus, animation), cải thiện performance. Nếu list tĩnh hoặc ít đổi, vẫn nên dùng trackBy để thống nhất.

**Pure vs impure pipe?**  
**Pure** (mặc định): pipe chỉ chạy lại khi **reference** của value hoặc tham số thay đổi; Angular có thể cache. **Impure**: chạy mỗi lần change detection; dùng khi pipe phụ thuộc state ngoài (vd thời gian, locale runtime), nhưng cẩn thận performance. Ưu tiên pure; nếu cần reactive phức tạp, cân nhắc computed/signal.

**Directive vs Component?**  
Component có **template** (view); directive không có template, chỉ bám vào host element để đổi hành vi/giao diện. Dùng directive khi chỉ cần “trang trí” hoặc hành vi (highlight, focus, lazy load); dùng component khi cần một khối UI có cấu trúc riêng.

**Pipe có thay đổi dữ liệu gốc không?**  
Không. Pipe chỉ **biến đổi giá trị để hiển thị**; không nên có side effect hoặc mutate input. Nếu cần filter/map list “thật”, làm trong class (method hoặc computed).

---

## Senior / Master

- **Control flow mới (@if, @for, @switch)**: Angular 17+ — dùng trong template thay cho *ngIf, *ngFor, *ngSwitch; không cần import directive, biên dịch tối ưu hơn. Ví dụ: `@for (item of items; track item.id) { ... }`.
- **Structural directive performance**: *ngFor không trackBy → Angular tạo lại DOM node khi list thay đổi. Luôn dùng trackBy (hoặc @for với track) khi list động. Chi tiết performance: [15 - Master Angular](15-master-angular.md#performance).
- **Pipe trong expression phức tạp**: Tránh gọi pipe (hoặc hàm) nhiều lần trong template với cùng input; có thể dùng computed/signal hoặc biến trung gian.
- **Test directive/pipe**: Directive test bằng cách tạo host component (hoặc `TestBed`) và gắn directive lên element, sau đó kiểm tra DOM/event. Pipe test bằng cách gọi `transform()` với các input khác nhau.

---

→ Tiếp theo: [05 - Services & Dependency Injection](05-services-di.md)
