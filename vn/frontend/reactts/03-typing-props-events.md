# Bài 03: Typing Props & Events

## 📚 Mục tiêu bài học

- Type props cho Function Component: `type Props`, `FC<Props>`, `ComponentProps`
- Type children: `ReactNode`, `ReactElement`, slot patterns
- Type events: `ChangeEvent`, `MouseEvent`, `FormEvent`
- Patterns: optional props, default values, discriminated unions

---

## 1. Typing Props Cơ Bản

### Cách 1: Type/Interface riêng (khuyến nghị)

```tsx
type GreetingProps = {
  name: string;
  age: number;
  isAdmin?: boolean;  // optional
};

function Greeting({ name, age, isAdmin = false }: GreetingProps) {
  return (
    <div>
      <h1>Xin chào {name}, {age} tuổi</h1>
      {isAdmin && <span>👑 Admin</span>}
    </div>
  );
}
```

### Cách 2: Dùng FC<Props> (ít dùng hơn)

```tsx
import type { FC } from 'react';

const Greeting: FC<GreetingProps> = ({ name, age, isAdmin = false }) => {
  return <h1>Xin chào {name}</h1>;
};

// FC<Props> tự thêm children?: ReactNode (React 18 đã bỏ)
// → Khuyến nghị: dùng Cách 1 (destructure trực tiếp)
```

---

## 2. Các Loại Props Thường Gặp

```tsx
type ComponentProps = {
  // === Primitive ===
  title: string;
  count: number;
  isActive: boolean;

  // === Object ===
  user: { id: number; name: string };
  style?: React.CSSProperties;

  // === Array ===
  items: string[];
  users: User[];

  // === Function (callback) ===
  onClick: () => void;
  onChange: (value: string) => void;
  onSubmit: (data: FormData) => Promise<void>;

  // === Union (nhiều giá trị cho phép) ===
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  status: 'idle' | 'loading' | 'success' | 'error';

  // === Optional ===
  subtitle?: string;          // string | undefined
  maxItems?: number;
  disabled?: boolean;

  // === Children ===
  children: React.ReactNode;  // Bất kỳ nội dung render được
};
```

---

## 3. Typing Children

### ReactNode — chấp nhận mọi thứ render được

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;  // string, number, JSX, null, undefined, array
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Sử dụng — tất cả đều OK:
<Card title="Test">
  <p>Paragraph</p>
  <button>Click</button>
</Card>

<Card title="Test">Plain text</Card>
<Card title="Test">{42}</Card>
<Card title="Test">{null}</Card>
```

### ReactElement — chỉ chấp nhận JSX element

```tsx
type ModalProps = {
  trigger: React.ReactElement;  // Phải là JSX element, không phải string/number
};

function Modal({ trigger }: ModalProps) {
  return <div>{trigger}</div>;
}

// ✅ OK
<Modal trigger={<button>Open</button>} />

// ❌ Type error
<Modal trigger="Open" />  // string không phải ReactElement
```

### Render Props pattern

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item, i)}</li>)}</ul>;
}

// Sử dụng — TypeScript suy luận T = User
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

---

## 4. Typing Events

### Các event type phổ biến

```tsx
function FormExample() {
  // === Input/Textarea ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);  // string
    console.log(e.target.name);   // string
  };

  // === Select ===
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
  };

  // === Form submit ===
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  };

  // === Button click ===
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);
  };

  // === Keyboard ===
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { /* submit */ }
  };

  // === Focus/Blur ===
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} onFocus={handleFocus} />
      <select onChange={handleSelect}>
        <option value="a">A</option>
      </select>
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### Bảng tham chiếu Event Types

| Event | Type | Element |
|-------|------|---------|
| `onChange` | `React.ChangeEvent<HTMLInputElement>` | input, textarea |
| `onChange` | `React.ChangeEvent<HTMLSelectElement>` | select |
| `onClick` | `React.MouseEvent<HTMLButtonElement>` | button, div |
| `onSubmit` | `React.FormEvent<HTMLFormElement>` | form |
| `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` | input, div |
| `onFocus` | `React.FocusEvent<HTMLInputElement>` | input |
| `onDragStart` | `React.DragEvent<HTMLDivElement>` | div |

---

## 5. Extending HTML Element Props

### ComponentProps — kế thừa toàn bộ props HTML

```tsx
// Button kế thừa toàn bộ props của <button> HTML
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
};

function Button({ variant = 'primary', isLoading, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

// Sử dụng — tất cả props HTML button đều valid:
<Button variant="primary" onClick={() => {}} type="submit" aria-label="Save">
  Save
</Button>
```

### ComponentPropsWithoutRef vs ComponentPropsWithRef

```tsx
// Không cần ref
type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  label: string;
  error?: string;
};

// Cần forward ref
type InputProps = React.ComponentPropsWithRef<'input'> & {
  label: string;
};
```

---

## 6. Discriminated Union Props

Khi component có **nhiều variant** với props khác nhau:

```tsx
// ❌ Không tốt — khó biết props nào đi với variant nào
type ButtonProps = {
  variant: 'link' | 'button';
  href?: string;     // chỉ dùng khi variant = 'link'
  onClick?: () => void; // chỉ dùng khi variant = 'button'
};

// ✅ Discriminated Union — TS enforce đúng combination
type ButtonProps =
  | { variant: 'button'; onClick: () => void }
  | { variant: 'link'; href: string; target?: string };

function Button(props: ButtonProps) {
  if (props.variant === 'link') {
    // TS biết props có href, target
    return <a href={props.href} target={props.target}>Link</a>;
  }
  // TS biết props có onClick
  return <button onClick={props.onClick}>Button</button>;
}

// ✅ Type-safe:
<Button variant="link" href="/about" />
<Button variant="button" onClick={() => {}} />

// ❌ Type error:
<Button variant="link" onClick={() => {}} />  // link không có onClick
<Button variant="button" href="/about" />     // button không có href
```

---

## 7. Callback Props — Truyền Data Lên Cha

```tsx
type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  onRemove: (productId: number) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
};

function ProductCard({ product, onAddToCart, onRemove, onQuantityChange }: ProductCardProps) {
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product)}>Thêm vào giỏ</button>
      <button onClick={() => onRemove(product.id)}>Xóa</button>
      <input
        type="number"
        onChange={(e) => onQuantityChange(product.id, Number(e.target.value))}
      />
    </div>
  );
}
```

---

## 📝 Bài Tập

1. Tạo `Alert` component với props: `type: 'success' | 'warning' | 'error'`, `message: string`, `onClose?: () => void`, `children: ReactNode`.
2. Tạo `Input` component extends `<input>` HTML props, thêm `label`, `error?`, `helperText?`.
3. Tạo discriminated union cho `Notification`: `type: 'toast'` (có `duration`) vs `type: 'banner'` (có `dismissible`).

---

## 🔑 Tóm tắt

| Pattern | Khi nào dùng |
|---------|-------------|
| `type XProps = { ... }` | Props component thông thường |
| `React.ReactNode` | Children chấp nhận mọi thứ |
| `React.ReactElement` | Children chỉ nhận JSX element |
| `React.ChangeEvent<HTMLInputElement>` | Event từ input |
| `React.ComponentProps<'button'>` | Kế thừa HTML element props |
| Discriminated Union | Component có nhiều variant với props khác nhau |

---

> **Bài trước:** [02 - Setup & Conventions ←](./02-setup-va-conventions.md)  
> **Bài tiếp theo:** [04 - Typing Hooks →](./04-typing-hooks.md)
