# Bài 07: Advanced TypeScript Patterns cho React

## 📚 Mục tiêu bài học

- Discriminated unions cho state machines
- Template literal types
- Utility types hữu ích cho React
- Conditional types, mapped types

---

## 1. Discriminated Unions cho State Machines

### Pattern: Async state

```tsx
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function ProductPage() {
  const [state, setState] = useState<AsyncState<Product[]>>({ status: 'idle' });

  // Render dựa trên status — TS biết đúng fields cho mỗi case
  switch (state.status) {
    case 'idle':
      return <p>Chưa tải</p>;
    case 'loading':
      return <p>Đang tải...</p>;
    case 'success':
      return <ProductList products={state.data} />;  // state.data: Product[]
    case 'error':
      return <p>Lỗi: {state.error}</p>;              // state.error: string
  }
}
```

### Pattern: Modal states

```tsx
type ModalState =
  | { type: 'closed' }
  | { type: 'confirm'; title: string; message: string; onConfirm: () => void }
  | { type: 'form'; title: string; initialData: FormData }
  | { type: 'alert'; message: string; severity: 'info' | 'warning' | 'error' };

function ModalManager() {
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });

  if (modal.type === 'closed') return null;

  return (
    <div className="modal-overlay">
      {modal.type === 'confirm' && (
        <ConfirmDialog title={modal.title} message={modal.message} onConfirm={modal.onConfirm} />
      )}
      {modal.type === 'form' && (
        <FormDialog title={modal.title} initialData={modal.initialData} />
      )}
      {modal.type === 'alert' && (
        <AlertBanner message={modal.message} severity={modal.severity} />
      )}
    </div>
  );
}
```

---

## 2. Template Literal Types

```tsx
// CSS spacing utilities
type Size = 'sm' | 'md' | 'lg' | 'xl';
type Direction = 'top' | 'right' | 'bottom' | 'left';
type SpacingProp = `margin-${Direction}` | `padding-${Direction}`;
// = 'margin-top' | 'margin-right' | ... | 'padding-left'

// Event handler naming
type EventName = 'click' | 'hover' | 'focus';
type HandlerName = `on${Capitalize<EventName>}`;
// = 'onClick' | 'onHover' | 'onFocus'

// API routes
type Entity = 'user' | 'product' | 'order';
type ApiRoute = `/api/${Entity}` | `/api/${Entity}/${number}`;

// Color tokens
type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type ColorName = 'gray' | 'blue' | 'green' | 'red';
type ColorToken = `${ColorName}-${ColorShade}`;
// = 'gray-100' | 'gray-200' | ... | 'red-900'
```

---

## 3. Utility Types Hữu Ích

### Built-in utility types

```tsx
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
};

// Partial — tất cả optional
type UpdateUserInput = Partial<User>;
// { id?: number; name?: string; ... }

// Required — tất cả bắt buộc
type StrictUser = Required<User>;

// Pick — chọn fields
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

// Omit — bỏ fields
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; role: ... }

// Record — object với key/value type
type UserMap = Record<number, User>;
// { [key: number]: User }

type FormErrors = Record<keyof CreateUserInput, string | undefined>;
// { name: string | undefined; email: string | undefined; role: string | undefined }

// Extract — lấy từ union
type AdminRole = Extract<User['role'], 'admin'>;
// 'admin'

// Exclude — loại từ union
type NonAdminRole = Exclude<User['role'], 'admin'>;
// 'editor' | 'viewer'
```

### Custom utility types cho React

```tsx
// Nullable — T hoặc null
type Nullable<T> = T | null;

// NonNullableFields — loại bỏ null/undefined từ tất cả fields
type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// DeepPartial — nested partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// ReadonlyDeep
type ReadonlyDeep<T> = {
  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];
};

// ValueOf — lấy union của tất cả value types
type ValueOf<T> = T[keyof T];
```

---

## 4. Conditional Types

```tsx
// Nếu T là array, trả element type; ngược lại trả T
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type A = UnwrapArray<string[]>;   // string
type B = UnwrapArray<number>;     // number

// Nếu T là Promise, trả resolved type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type C = UnwrapPromise<Promise<User>>;  // User
type D = UnwrapPromise<string>;          // string

// Practical: Extract props type from a component
type PropsOf<C extends React.ElementType> = React.ComponentProps<C>;

type ButtonHTMLProps = PropsOf<'button'>;
// = React.ButtonHTMLAttributes<HTMLButtonElement>
```

---

## 5. Mapped Types cho Config

```tsx
// Tạo form field config từ type
type FieldConfig<T> = {
  [K in keyof T]: {
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'checkbox';
    required?: boolean;
    validate?: (value: T[K]) => string | undefined;
  };
};

type ProductForm = {
  name: string;
  price: number;
  category: string;
};

const productFormConfig: FieldConfig<ProductForm> = {
  name: {
    label: 'Tên sản phẩm',
    type: 'text',
    required: true,
    validate: (value) => value.length < 3 ? 'Tối thiểu 3 ký tự' : undefined,
  },
  price: {
    label: 'Giá',
    type: 'number',
    required: true,
    validate: (value) => value <= 0 ? 'Giá phải > 0' : undefined,
  },
  category: {
    label: 'Danh mục',
    type: 'select',
  },
};
```

---

## 6. Type Guards

```tsx
// Type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

// Sử dụng:
const data: unknown = await fetchData();
if (isUser(data)) {
  console.log(data.name);  // TS biết data là User
}

// Type guard cho API error
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

try {
  await api.createUser(input);
} catch (err) {
  if (isApiError(err)) {
    showToast(err.message);  // err: ApiError
  } else {
    showToast('Lỗi không xác định');
  }
}
```

---

## 🔑 Tóm tắt

| Pattern | Use case |
|---------|---------|
| Discriminated Union | State machines, modal states, async states |
| Template Literal | CSS utilities, event names, API routes |
| Utility Types | Transform types (Partial, Pick, Omit, Record) |
| Conditional Types | Unwrap arrays/promises, infer types |
| Type Guards | Runtime validation + type narrowing |

---

> **Bài trước:** [06 - Generic Components ←](./06-generic-components.md)  
> **Bài tiếp theo:** [08 - Migration & Interview →](./08-migration-interview.md)
