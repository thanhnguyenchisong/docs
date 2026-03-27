# Bài 04: Typing Hooks

## 📚 Mục tiêu bài học

- Type đúng cho các hooks: `useState`, `useRef`, `useReducer`, `useContext`
- Viết Custom Hooks type-safe với generics
- Patterns: overloaded hooks, conditional types

---

## 1. useState

### Type inference (tự suy luận)

```tsx
// TS tự suy luận type từ giá trị khởi tạo
const [count, setCount] = useState(0);           // number
const [name, setName] = useState('');             // string
const [isOpen, setIsOpen] = useState(false);      // boolean
const [items, setItems] = useState(['a', 'b']);   // string[]
```

### Explicit type (khi cần)

```tsx
// Khi initial value không đủ để suy luận (null, union)
const [user, setUser] = useState<User | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
const [items, setItems] = useState<Product[]>([]);

// ⚠️ Phải xử lý null trước khi dùng
if (user) {
  console.log(user.name);  // OK — TypeScript biết user !== null
}
```

### setState với callback

```tsx
const [items, setItems] = useState<string[]>([]);

// Callback nhận prevState, trả về new state — cùng type
setItems(prev => [...prev, 'new item']);
setItems(prev => prev.filter(item => item !== 'remove'));
```

---

## 2. useRef

### DOM ref

```tsx
// Ref cho DOM element — initial null, truyền vào JSX
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();  // ?.  vì current có thể null
  };

  return <input ref={inputRef} />;
}
```

### Mutable ref (lưu giá trị, không render)

```tsx
// Ref để lưu giá trị persist qua render — không null
const timerRef = useRef<number>(0);
const prevValueRef = useRef<string>('');
const renderCountRef = useRef(0);

function Timer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    intervalRef.current = setInterval(() => {/* ... */}, 1000);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return <button onClick={start}>Start</button>;
}
```

### Phân biệt: `useRef<T>(null)` vs `useRef<T>(value)`

| Cú pháp | Type | current |
|---------|------|---------|
| `useRef<HTMLInputElement>(null)` | `RefObject<HTMLInputElement>` | `T | null` (readonly) |
| `useRef<number>(0)` | `MutableRefObject<number>` | `T` (mutable) |

---

## 3. useReducer

```tsx
// === State type ===
type State = {
  items: Product[];
  loading: boolean;
  error: string | null;
  filter: string;
};

// === Action types (discriminated union) ===
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number };

// === Reducer — TS kiểm tra mọi case ===
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
  }
}

// === Sử dụng ===
const initialState: State = { items: [], loading: false, error: null, filter: '' };

function ProductList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch type-safe:
  dispatch({ type: 'FETCH_START' });
  dispatch({ type: 'FETCH_SUCCESS', payload: products });
  dispatch({ type: 'SET_FILTER', payload: 'electronics' });

  // ❌ Type error:
  // dispatch({ type: 'FETCH_SUCCESS' });           // thiếu payload
  // dispatch({ type: 'SET_FILTER', payload: 42 }); // payload phải string
}
```

---

## 4. useContext

```tsx
// === Context type ===
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// === Tạo context với default value ===
const AuthContext = createContext<AuthContextType | null>(null);

// === Custom hook để consume (tránh check null mỗi lần) ===
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// === Provider ===
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const logout = () => setUser(null);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// === Sử dụng — type-safe ===
function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  // user: User | null — phải check trước khi dùng
  // logout: () => void — TS biết đúng signature
}
```

---

## 5. Custom Hooks Type-Safe

### Hook đơn giản

```tsx
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// Sử dụng:
const [isOpen, toggleOpen] = useToggle();
// isOpen: boolean, toggleOpen: () => void
```

### Hook với Generic

```tsx
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// Sử dụng — T được suy luận:
const [theme, setTheme] = useLocalStorage('theme', 'dark');
// theme: string, setTheme: (value: string | ((prev: string) => string)) => void

const [user, setUser] = useLocalStorage<User | null>('user', null);
// user: User | null
```

### Hook trả về object (khuyến nghị cho > 2 giá trị)

```tsx
type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Sử dụng:
const { data: products, loading, error } = useFetch<Product[]>('/api/products');
// products: Product[] | null
```

---

## 📝 Bài Tập

1. Viết `useDebounce<T>(value: T, delay: number): T` — trả về giá trị debounced.
2. Viết `useReducer` cho shopping cart: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR.
3. Viết `useMediaQuery(query: string): boolean` — trả về true khi media query match.

---

## 🔑 Tóm tắt

| Hook | Type cần chú ý |
|------|---------------|
| `useState` | `useState<T>()` khi T là union hoặc null |
| `useRef` | `useRef<HTMLElement>(null)` cho DOM, `useRef<T>(value)` cho mutable |
| `useReducer` | Discriminated union cho Action types |
| `useContext` | Custom hook + null check → consumer không cần check |
| Custom Hook | Generic `<T>` cho hook tái sử dụng, return object cho > 2 values |

---

> **Bài trước:** [03 - Typing Props & Events ←](./03-typing-props-events.md)  
> **Bài tiếp theo:** [05 - Forms & API →](./05-typing-forms-api.md)
