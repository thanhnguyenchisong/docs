# Bài 20: TypeScript + React

## 📚 Mục tiêu bài học
- Setup TypeScript trong React project
- Typing components, props, state
- Typing hooks
- Generic components
- Utility types cho React

---

## 1. Setup

```bash
# Vite + React + TypeScript
npm create vite@latest my-app -- --template react-ts

# Thêm TypeScript vào project hiện có
npm install -D typescript @types/react @types/react-dom
npx tsc --init
```

---

## 2. Typing Components & Props

### 2.1 Cơ bản

```tsx
// ═══ Inline type ═══
function Greeting({ name, age }: { name: string; age: number }) {
  return <h1>Xin chào {name}, {age} tuổi</h1>;
}

// ═══ Interface (phổ biến nhất) ═══
interface UserCardProps {
  name: string;
  email: string;
  age: number;
  avatar?: string;          // Optional
  isActive?: boolean;        // Optional
  role: 'admin' | 'user' | 'editor';  // Union type
  onEdit: (id: number) => void;        // Function
  onClick?: () => void;                // Optional function
}

function UserCard({ name, email, age, avatar, isActive = true, role, onEdit }: UserCardProps) {
  return (
    <div className={`card ${isActive ? 'active' : ''}`}>
      {avatar && <img src={avatar} alt={name} />}
      <h3>{name}</h3>
      <p>{email}</p>
      <span>Role: {role}</span>
      <button onClick={() => onEdit(1)}>Edit</button>
    </div>
  );
}

// ═══ Type alias (cũng OK) ═══
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

function Button({ variant, size, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### 2.2 Children Types

```tsx
interface ContainerProps {
  children: React.ReactNode;        // Bất kỳ: string, number, JSX, null...
}

interface StrictContainerProps {
  children: React.ReactElement;     // Chỉ JSX element
}

interface TextOnlyProps {
  children: string;                  // Chỉ text
}

interface FunctionChildProps {
  children: (data: string) => React.ReactNode;  // Render prop
}

// React.PropsWithChildren helper
type CardProps = React.PropsWithChildren<{
  title: string;
}>;
// Tương đương: { title: string; children?: React.ReactNode }
```

### 2.3 Extending HTML Element Props

```tsx
// Kế thừa props của HTML button
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

function CustomButton({ variant = 'primary', isLoading, children, ...rest }: CustomButtonProps) {
  return (
    <button className={`btn-${variant}`} disabled={isLoading} {...rest}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

// Kế thừa props của HTML input
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Kế thừa props của HTML div
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  variant?: 'default' | 'elevated';
}
```

---

## 3. Typing Hooks

### 3.1 useState

```tsx
// TypeScript tự suy luận kiểu từ initial value
const [count, setCount] = useState(0);          // number
const [name, setName] = useState('');            // string
const [isOpen, setIsOpen] = useState(false);     // boolean

// Khai báo kiểu rõ ràng khi cần
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Product[]>([]);
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
// user?.name  (cần optional chaining vì có thể null)
```

### 3.2 useRef

```tsx
// DOM ref
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

// inputRef.current?.focus();
// inputRef.current?.value;

// Mutable ref (giá trị persist)
const timerRef = useRef<number | null>(null);
const countRef = useRef<number>(0);

timerRef.current = window.setInterval(() => {}, 1000);
countRef.current += 1;
```

### 3.3 useReducer

```tsx
interface State {
  count: number;
  error: string | null;
  loading: boolean;
}

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET'; payload: number }
  | { type: 'ERROR'; payload: string }
  | { type: 'LOADING' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'SET':
      return { ...state, count: action.payload };  // TS biết payload là number
    case 'ERROR':
      return { ...state, error: action.payload };   // TS biết payload là string
    case 'LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, {
  count: 0,
  error: null,
  loading: false,
});

dispatch({ type: 'SET', payload: 42 });     // ✅
dispatch({ type: 'SET', payload: 'abc' });  // ❌ Type error!
dispatch({ type: 'UNKNOWN' });              // ❌ Type error!
```

### 3.4 useContext

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context; // TS biết context không null
}
```

---

## 4. Generic Components

```tsx
// ═══ Generic List Component ═══
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage }: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage || 'Không có dữ liệu'}</p>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// TS tự suy luận T = User
<List
  items={users}
  keyExtractor={(user) => user.id}       // user: User ✅
  renderItem={(user) => <span>{user.name}</span>}  // user: User ✅
/>

// ═══ Generic Select Component ═══
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (item: T) => string;
  getValue: (item: T) => string | number;
}

function Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {
  return (
    <select
      value={value ? String(getValue(value)) : ''}
      onChange={(e) => {
        const selected = options.find(o => String(getValue(o)) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      <option value="">Chọn...</option>
      {options.map(option => (
        <option key={String(getValue(option))} value={String(getValue(option))}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
```

---

## 5. Utility Types Cho React

```tsx
// ═══ Common utility types ═══

// Lấy props type từ component
type ButtonProps = React.ComponentProps<typeof Button>;
type InputProps = React.ComponentProps<'input'>;
type DivProps = React.ComponentProps<'div'>;

// Event types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {};

// Style type
const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

// Ref types
const ref: React.RefObject<HTMLDivElement> = useRef(null);

// Partial (tất cả optional)
type PartialUser = Partial<User>;

// Required (tất cả required)
type RequiredUser = Required<User>;

// Pick (chọn một số fields)
type UserPreview = Pick<User, 'name' | 'avatar'>;

// Omit (bỏ một số fields)
type UserWithoutId = Omit<User, 'id'>;

// Record
type UserMap = Record<string, User>;
```

---

## 6. Discriminated Unions (Advanced)

```tsx
// ═══ API Response Types ═══
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function UserProfile() {
  const [response, setResponse] = useState<ApiResponse<User>>({ status: 'loading' });

  // TypeScript thu hẹp type tự động
  switch (response.status) {
    case 'loading':
      return <Spinner />;
    case 'error':
      return <p>{response.error}</p>;    // TS biết có `error`
    case 'success':
      return <p>{response.data.name}</p>; // TS biết có `data`
  }
}
```

---

## 📝 Bài Tập

### Bài 1: Convert JavaScript React app sang TypeScript
### Bài 2: Generic Table component với sorting, filtering
### Bài 3: Type-safe form hook
### Bài 4: API client với typed responses

---

> **Bài trước:** [19 - Advanced Patterns ←](./19-advanced-patterns.md)  
> **Bài tiếp theo:** [21 - Server-Side Rendering →](./21-server-side-rendering.md)
