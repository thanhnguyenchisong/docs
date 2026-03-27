# Bài 08: Migration JS→TS & Interview Preparation

## 📚 Mục tiêu bài học

- Chiến lược chuyển đổi ReactJS → ReactTS
- Checklist migration từng bước
- 50+ câu hỏi phỏng vấn React + TypeScript

---

## 1. Chiến Lược Migration JS → TS

### Nguyên tắc: Incremental, không Big Bang

```
Bước 1: Setup TypeScript (tsconfig, dependencies)
Bước 2: Đổi file extension .js/.jsx → .ts/.tsx (cho phép any)
Bước 3: Type shared types trước (domain models, API)
Bước 4: Type leaf components (presentational, không deps)
Bước 5: Type hooks và services
Bước 6: Type container components
Bước 7: Bật strict, loại bỏ any
```

### Bước 1: Setup

```bash
# Thêm TypeScript vào project hiện có
npm install -D typescript @types/react @types/react-dom

# Tạo tsconfig.json
npx tsc --init
```

```json
// tsconfig.json — bắt đầu lỏng, siết dần
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,           // Ban đầu false, bật sau
    "noImplicitAny": false,    // Cho phép any lúc đầu
    "allowJs": true,           // Cho phép mix JS + TS
    "skipLibCheck": true
  }
}
```

### Bước 2-3: Đổi file và type domain models

```tsx
// src/types/user.ts — Type domain models TRƯỚC
export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
};

// Đổi file: UserCard.jsx → UserCard.tsx
// Thêm type cho props
type UserCardProps = {
  user: User;
  onSelect: (user: User) => void;
};

function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user)}>{user.name}</div>;
}
```

### Bước 7: Bật strict mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 2. Xử Lý Các Trường Hợp Phổ Biến Khi Migration

### any → unknown + narrowing

```tsx
// ❌ Trước (JS mindset)
function processData(data: any) {
  return data.name.toUpperCase();
}

// ✅ Sau (TS mindset)
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return String((data as { name: string }).name).toUpperCase();
  }
  throw new Error('Invalid data');
}
```

### Third-party library không có types

```bash
# Cách 1: Cài @types package
npm install -D @types/lodash

# Cách 2: Tự khai báo (nếu không có @types)
```

```typescript
// src/types/untyped-lib.d.ts
declare module 'untyped-lib' {
  export function doSomething(input: string): number;
  export default function main(): void;
}
```

### Event handlers từ JS

```tsx
// ❌ JS — không type
const handleChange = (e) => { setValue(e.target.value); };

// ✅ TS
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

---

## 3. Checklist Migration

- [ ] Cài `typescript`, `@types/react`, `@types/react-dom`
- [ ] Tạo `tsconfig.json` (strict: false lúc đầu)
- [ ] Bật `allowJs: true` để mix JS/TS
- [ ] Tạo folder `src/types/` với domain models
- [ ] Đổi `.jsx` → `.tsx` cho leaf components trước
- [ ] Type props cho mỗi component đã convert
- [ ] Type custom hooks (return type, params)
- [ ] Type API services (request/response)
- [ ] Cài `@types/*` cho third-party libs
- [ ] Khai báo `.d.ts` cho libs không có types
- [ ] Bật `strict: true`
- [ ] Bật `noImplicitAny: true`
- [ ] Loại bỏ tất cả explicit `any`
- [ ] Bật `consistent-type-imports` trong ESLint
- [ ] Review: không còn `// @ts-ignore` hoặc `as any`

---

## 4. Câu Hỏi Phỏng Vấn React + TypeScript

### Cơ bản

**1. TypeScript là gì? Tại sao dùng với React?**
> TypeScript = JavaScript + static types. Giúp bắt lỗi compile-time, autocomplete tốt, refactor an toàn, API component rõ ràng (props type = documentation).

**2. `type` vs `interface` — khi nào dùng gì?**
> `type` linh hoạt hơn (union, intersection, mapped). `interface` tốt hơn cho extends/implements. Trong React: dùng `type` cho props (union-friendly), `interface` cho API contracts.

**3. Tại sao không nên dùng `any`?**
> `any` bypass toàn bộ type checking → mất hết lợi ích TS. Dùng `unknown` + narrowing thay thế. `any` chỉ chấp nhận tạm khi migration.

**4. `React.FC<Props>` vs `function Component(props: Props)` — cái nào tốt hơn?**
> Function declaration + destructured props phổ biến hơn. `FC` từng tự thêm `children` (đã bỏ React 18), và khó dùng với generics.

**5. Làm sao type children?**
> `React.ReactNode` cho mọi thứ render được. `React.ReactElement` cho chỉ JSX. `never` nếu component không nhận children.

### Trung cấp

**6. Discriminated union là gì? Ví dụ trong React?**
> Union type có common field (tag) để phân biệt. Ví dụ: `{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }`. TS narrowing tự động khi check status.

**7. Generic component là gì? Khi nào cần?**
> Component nhận type parameter `<T>` để tái sử dụng với nhiều data types: `List<T>`, `Select<T>`, `Table<T>`. Cần khi component xử lý data mà type chỉ biết lúc sử dụng.

**8. `ComponentProps<'button'>` dùng khi nào?**
> Khi tạo wrapper component cần kế thừa toàn bộ HTML props. Ví dụ Button component extends `<button>` props + thêm `variant`, `isLoading`.

**9. Zod là gì? Tại sao dùng với TypeScript?**
> Zod = runtime validation library. `z.infer<typeof schema>` tạo type từ schema → single source of truth cho cả validate và type. Thay thế validate thủ công + type riêng.

**10. `import type` khác `import` thế nào?**
> `import type { X }` bị loại bỏ khi compile → không tăng bundle. Dùng cho types/interfaces. `import { X }` giữ lại → dùng cho values (functions, classes, enums runtime).

### Nâng cao

**11. Polymorphic component ("as" prop) implement thế nào?**
> Dùng generic `<E extends React.ElementType>`, props = `{ as?: E } & ComponentPropsWithoutRef<E>`. Component render `as || defaultTag`.

**12. Conditional types dùng khi nào trong React?**
> Unwrap arrays (`T extends (infer U)[] ? U : T`), extract props từ component, tạo utility types. Ví dụ: `PropsOf<typeof MyComponent>`.

**13. Mapped types ứng dụng thế nào?**
> Tạo form config từ model type: `{ [K in keyof T]: { label: string; validate: (v: T[K]) => ... } }`. Tạo error/touched state từ form fields.

**14. Type guard là gì? Khi nào cần?**
> Function trả về `value is Type` — giúp TS narrowing. Cần khi validate data từ API (`unknown` → `User`), check discriminated unions, validate error types.

**15. Chiến lược migration JS → TS cho project lớn?**
> Incremental: (1) allowJs, (2) type domain models, (3) leaf components, (4) hooks/services, (5) containers, (6) strict mode. Không big-bang. Dùng strangler pattern.

### Expert

**16. Infer keyword dùng thế nào?**
> `T extends Promise<infer U> ? U : T` — extract type từ generic. Dùng để lấy return type của async function, element type từ array, resolved type từ Promise.

**17. Template literal types ứng dụng?**
> Tạo type-safe CSS utilities: `margin-${Direction}`, event handler names: `on${Capitalize<Event>}`, API routes: `/api/${Entity}/${number}`.

**18. Enum vs Union type?**
> Union (`'a' | 'b'`) nhẹ hơn (tree-shakable), phổ biến trong React. Enum có auto-increment, reverse mapping nhưng tạo JS runtime code. Khuyến nghị: dùng union + `as const`.

**19. `satisfies` operator (TS 4.9+)?**
> `value satisfies Type` — check type mà không widen. Giữ nguyên narrow type. Ví dụ: `const config = { ... } satisfies Config` → TS check config đúng Config nhưng giữ literal types.

**20. strictNullChecks ảnh hưởng React thế nào?**
> Mọi giá trị có thể null/undefined phải xử lý. `useRef(null)` → `ref.current` có thể null. API response có thể undefined. Optional props phải check trước khi dùng. Tốt vì bắt lỗi runtime.

---

## 🔑 Tóm tắt

| Chủ đề | Key takeaway |
|--------|-------------|
| **Migration** | Incremental, strict: false → true, type domain models trước |
| **any → unknown** | Luôn dùng unknown + narrowing thay any |
| **Generic vs Union** | Generic cho reusable, Union cho fixed variants |
| **Zod** | Single source of truth: validate + type inference |
| **Interview** | Discriminated unions, generic components, polymorphic, type guards |

---

> **Bài trước:** [07 - Advanced Patterns ←](./07-advanced-patterns.md)  
> **Quay về:** [README - Mục Lục ←](./README.md)

---

🎉 **Chúc mừng bạn đã hoàn thành bộ tài liệu ReactTS!**

Tiếp theo: Áp dụng vào project thực tế và practice với [ReactJS bài 27 - Dự án thực tế](../reactjs/27-du-an-thuc-te.md) nhưng viết bằng TypeScript! 🚀
