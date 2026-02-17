# TypeScript cơ bản cho Angular

TypeScript là ngôn ngữ chính khi viết ứng dụng Angular. Bài này tóm tắt các phần cần dùng thường xuyên trong Angular.

## Mục lục
1. [TypeScript là gì? (Cho người mới)](#typescript-là-gì-cho-người-mới)
2. [Types cơ bản](#types-cơ-bản)
3. [Interface và Type](#interface-và-type)
4. [Class và inheritance](#class-và-inheritance)
5. [Decorators](#decorators)
6. [Module và import/export](#module-và-importexport)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## TypeScript là gì? (Cho người mới)

- **JavaScript** là ngôn ngữ chạy trên trình duyệt (và Node.js), linh hoạt nhưng không bắt buộc khai báo “kiểu” biến — dễ gây lỗi khi project lớn (gõ nhầm tên thuộc tính, gán nhầm kiểu dữ liệu).
- **TypeScript** là JavaScript **cộng thêm hệ thống kiểu (types)**: bạn khai báo biến là `string`, `number`, object có thuộc tính nào… Trình biên dịch (compiler) sẽ kiểm tra giúp và báo lỗi trước khi chạy. Angular được viết bằng TypeScript và khuyến nghị bạn cũng dùng TypeScript.
- **Thực tế:** Bạn viết file `.ts`, sau đó build (biên dịch) thành `.js` để trình duyệt chạy. Angular CLI đã lo việc build, bạn chỉ cần viết code TypeScript.
- Nếu bạn đã biết JavaScript, TypeScript sẽ quen nhanh — coi như thêm chú thích kiểu và một số cú pháp mới (interface, enum, generic…). Nếu chưa biết JS, nên học JS cơ bản trước (biến, hàm, array, object) rồi quay lại bài này.

### Ví dụ trực quan 1: Chạy TypeScript và xem kết quả trong console

Bạn có thể chạy đoạn sau trong [TypeScript Playground](https://www.typescriptlang.org/play) (mở link → dán code → xem bên phải): TypeScript báo lỗi nếu gán sai kiểu. Hoặc trong project Angular: tạo file `src/app/demo-ts.ts` tạm, dán code rồi gọi từ `app.component.ts` trong `ngOnInit()` với `console.log(...)` — mở F12 → Console để xem.

```typescript
interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: 'Minh' };
console.log('User:', user.name);           // In ra: User: Minh

// Nếu bạn gõ: user.email → editor/compiler báo lỗi vì User không có thuộc tính email
// Nếu bạn gõ: user.id = 'abc' → lỗi vì id phải là number
```

**Kết quả trên màn hình (Console):** `User: Minh`. Ý nghĩa: interface `User` bắt buộc object có `id` (số) và `name` (chuỗi); TypeScript kiểm tra giúp bạn trước khi chạy.

### Ví dụ trực quan 2: Component Angular — từ code đến màn hình

Trong Angular, bạn viết **template** (HTML nhỏ) và **class** (dữ liệu + logic). Trình duyệt hiển thị đúng nội dung bạn gắn vào template. Ví dụ:

- **Code (trong component):**
  - Template: `template: '<p>Xin chào, {{ name }}!</p>'`
  - Class: `name = 'Nguyễn Văn A';`
- **Trên màn hình bạn thấy:** `Xin chào, Nguyễn Văn A!`

Khi bạn đổi `name = 'Nguyễn Văn B'` và lưu file, trang tự reload (trong chế độ `ng serve`) và chữ trên màn hình đổi thành "Nguyễn Văn B". Đó là **data binding** — một phần của bài 03; ở đây chỉ cần cảm nhận: TypeScript (biến `name`) và template ({{ name }}) kết nối trực tiếp với giao diện.

---

## Types cơ bản

Trong TypeScript bạn thường khai báo **kiểu** cho biến và tham số. Điều này giúp editor gợi ý đúng và bắt lỗi sớm.

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

**Thử trong Console:** Gọi `log('Hello')` → in ra `Hello`. Gọi `log(123)` → TypeScript báo lỗi (đòi hỏi `string`). Đó là “trực quan” của type checking.

---

## Interface và Type

**Cho người mới:** Khi làm việc với **object** (ví dụ dữ liệu user: id, name, email), bạn cần một cách “mô tả” object đó có những thuộc tính gì, kiểu gì. **Interface** và **Type** dùng để làm điều đó. Ví dụ: “User phải có `id` (số), `name` (chuỗi), còn `email` thì tùy chọn”. Sau đó mọi nơi dùng `User` đều phải theo đúng hình dạng đó — sai sẽ bị báo lỗi. Trong Angular bạn sẽ dùng interface/type cho model dữ liệu, cho input/output của component, và cho response API.

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

**Cho người mới:** Trong Angular, bạn không “đăng ký” component hay service bằng tay — bạn **đánh dấu** class bằng một hàm đặc biệt gọi là **decorator** (cú pháp `@TênDecorator` ngay trên class). Ví dụ: `@Component({...})` báo cho Angular biết class này là một component với selector, template, v.v.; `@Injectable()` báo class này là service có thể inject. Lúc build/chạy, Angular đọc các decorator và biết cách xử lý từng class. Bạn chỉ cần nhớ: Component thì dùng `@Component`, Service thì dùng `@Injectable`, và cấu hình bên trong dấu ngoặc `{}`.

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

**Cho người mới:** Một ứng dụng có rất nhiều file (component, service, model…). Để dùng code ở file A trong file B, bạn **export** ở A và **import** ở B. Đây gọi là **module** (ES modules). Ví dụ: file `user.model.ts` export `interface User`, file `user.service.ts` import `User` từ `user.model.ts`. Angular không bắt buộc phải gom từng file vào “NgModule” nữa — với **standalone component** (Angular 14+), mỗi component có thể import trực tiếp những gì nó cần. Bạn chỉ cần quen: viết code trong file, export những thứ cho file khác dùng, và import khi cần.

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
