# TypeScript cơ bản cho Angular

TypeScript là ngôn ngữ chính khi viết ứng dụng Angular. Bài này tóm tắt các phần cần dùng thường xuyên trong Angular.

## Mục lục
1. [Types cơ bản](#types-cơ-bản)
2. [Interface và Type](#interface-và-type)
3. [Class và inheritance](#class-và-inheritance)
4. [Decorators](#decorators)
5. [Module và import/export](#module-và-importexport)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Types cơ bản

- **string, number, boolean**: Kiểu nguyên thủy.
- **array**: `string[]` hoặc `Array<number>`.
- **tuple**: `[string, number]`.
- **any**: Bỏ kiểm tra type (nên hạn chế).
- **unknown**: An toàn hơn `any`, phải narrow trước khi dùng.
- **void**: Hàm không trả về giá trị.
- **null / undefined**: Có thể bật `strictNullChecks`.

```typescript
let name: string = 'Angular';
let count: number = 0;
let items: string[] = ['a', 'b'];
let pair: [string, number] = ['id', 1];
function log(msg: string): void {
  console.log(msg);
}
```

---

## Interface và Type

Dùng để mô tả hình dạng object, dùng cho model và input/output component.

```typescript
interface User {
  id: number;
  name: string;
  email?: string;  // optional
}

type Status = 'pending' | 'success' | 'error';

const user: User = { id: 1, name: 'Admin' };
```

- **interface**: Có thể extend, merge declaration.
- **type**: Union, intersection, mapped types; không merge.

---

## Class và inheritance

Angular dùng class cho Component, Service, Directive, Pipe.

```typescript
class Product {
  constructor(
    public id: number,
    public name: string,
    private _price: number
  ) {}

  get price(): number {
    return this._price;
  }
}

class Book extends Product {
  constructor(id: number, name: string, price: number, public author: string) {
    super(id, name, price);
  }
}
```

- **public / private / protected**: Phạm vi truy cập.
- **readonly**: Chỉ gán lần đầu.

---

## Decorators

Angular dùng decorator để đánh dấu class và thuộc tính.

```typescript
@Component({
  selector: 'app-hello',
  standalone: true,
  template: `<p>Hello</p>`,
})
export class HelloComponent {}

@Injectable({ providedIn: 'root' })
export class DataService {}
```

Cần `experimentalDecorators` và `emitDecoratorMetadata` trong `tsconfig.json` (Angular CLI đã cấu hình sẵn).

---

## Module và import/export

- **ES modules**: `import` / `export`.
- Angular: **standalone components** (khuyến nghị từ Angular 14+) không cần `NgModule` cho từng component; vẫn có thể dùng `NgModule` để nhóm hoặc lazy load.

```typescript
// model/user.ts
export interface User {
  id: number;
  name: string;
}

// service/user.service.ts
import { User } from '../model/user';
```

---

## Câu hỏi thường gặp

**Sự khác nhau giữa `interface` và `type`?**  
Interface có thể kế thừa và merge. Type phù hợp cho union/intersection và utility types.

**`any` vs `unknown`?**  
`any` tắt kiểm tra type. `unknown` bắt buộc phải kiểm tra hoặc ép kiểu trước khi dùng, an toàn hơn.

**Decorator dùng để làm gì trong Angular?**  
Để framework nhận diện class (Component, Injectable, Directive, Pipe) và đăng ký metadata (selector, template, providers, v.v.).

---

## Senior / Master

- **Utility types**: `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` — dùng cho model, props component, API payload (ví dụ `Partial<Product>` cho update).
- **Generics**: Component/Service generic `ListComponent<T>`, `Repository<T>`; hàm generic `function id<T>(x: T): T`. Giúp type-safe khi làm list/table tổng quát.
- **strictNullChecks**: Bật trong tsconfig → `string` không còn gồm `null`/`undefined`; dùng optional chaining `?.` và nullish coalescing `??`.

---

→ Tiếp theo: [02 - Angular căn bản](02-angular-fundamentals.md)
