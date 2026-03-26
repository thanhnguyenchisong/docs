# Bài 11: Hooks Nâng Cao - useReducer, useMemo, useCallback, Custom Hooks

## 📚 Mục tiêu bài học
- `useReducer` - quản lý state phức tạp
- `useMemo` - cache giá trị tính toán tốn kém
- `useCallback` - cache function references
- Custom Hooks - tái sử dụng logic

---

## 1. useReducer

### Khi nào dùng useReducer thay vì useState?

```
useState  → State đơn giản (boolean, string, number)
useReducer → State phức tạp (object nhiều fields, logic cập nhật phức tạp)
```

### 1.1 Cú pháp

```jsx
import { useReducer } from 'react';

// Reducer function: (state, action) => newState
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'RESET':
      return { ...state, count: 0 };
    case 'SET':
      return { ...state, count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

const initialState = { count: 0 };

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <h2>Count: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-1</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET', payload: 100 })}>Set 100</button>
    </div>
  );
}
```

### 1.2 Ví dụ thực tế: Shopping Cart

```jsx
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: Math.max(0, action.payload.quantity) }
            : i
        ).filter(i => i.quantity > 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'APPLY_DISCOUNT':
      return { ...state, discount: action.payload };
    default:
      return state;
  }
};

function ShoppingCart() {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    discount: 0
  });

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = total * (1 - cart.discount / 100);

  return (
    <div>
      <h2>🛒 Giỏ Hàng ({cart.items.length} sản phẩm)</h2>

      {cart.items.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <span>{item.price.toLocaleString('vi-VN')}đ</span>
          <button onClick={() => dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: item.id, quantity: item.quantity - 1 }
          })}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: item.id, quantity: item.quantity + 1 }
          })}>+</button>
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}>
            🗑️
          </button>
        </div>
      ))}

      <p>Tổng: {total.toLocaleString('vi-VN')}đ</p>
      {cart.discount > 0 && (
        <p>Sau giảm giá ({cart.discount}%): {discountedTotal.toLocaleString('vi-VN')}đ</p>
      )}

      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        Xóa giỏ hàng
      </button>
    </div>
  );
}
```

### 1.3 Ví dụ: Fetch Data Reducer

```jsx
const fetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function useFetch(url) {
  const [state, dispatch] = useReducer(fetchReducer, {
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'FETCH_START' });

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(err => {
        if (err.name !== 'AbortError') {
          dispatch({ type: 'FETCH_ERROR', payload: err.message });
        }
      });

    return () => controller.abort();
  }, [url]);

  return state;
}
```

---

## 2. useMemo - Cache Giá Trị Tính Toán

```jsx
import { useMemo, useState } from 'react';

function ExpensiveList({ items, searchTerm }) {
  // ❌ Tính toán lại MỖI render (kể cả khi items không đổi)
  // const filteredItems = items.filter(...)  .sort(...);

  // ✅ Chỉ tính lại khi items hoặc searchTerm thay đổi
  const filteredItems = useMemo(() => {
    console.log('Tính toán lại filteredItems...');
    return items
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

  // useMemo cho giá trị từ tính toán phức tạp
  const statistics = useMemo(() => {
    console.log('Tính toán statistics...');
    return {
      total: filteredItems.length,
      avgPrice: filteredItems.reduce((sum, i) => sum + i.price, 0) / filteredItems.length || 0,
      maxPrice: Math.max(...filteredItems.map(i => i.price), 0),
      minPrice: Math.min(...filteredItems.map(i => i.price), Infinity),
    };
  }, [filteredItems]);

  return (
    <div>
      <p>Tổng: {statistics.total} | TB: {statistics.avgPrice.toLocaleString()}đ</p>
      {filteredItems.map(item => (
        <div key={item.id}>{item.name} - {item.price.toLocaleString()}đ</div>
      ))}
    </div>
  );
}
```

### Khi nào dùng useMemo?

```jsx
// ✅ NÊN dùng khi:
// 1. Tính toán tốn kém (sort, filter large arrays, complex math)
const sorted = useMemo(() => [...bigArray].sort(), [bigArray]);

// 2. Tạo object/array truyền xuống memo'd child
const config = useMemo(() => ({ theme, locale }), [theme, locale]);

// ❌ KHÔNG cần dùng khi:
// 1. Tính toán đơn giản
const fullName = `${firstName} ${lastName}`; // Không cần useMemo

// 2. Primitive values đã ổn định
const isAdult = age >= 18; // Không cần useMemo
```

---

## 3. useCallback - Cache Function Reference

```jsx
import { useCallback, useState, memo } from 'react';

// memo() ngăn re-render nếu props không đổi
const ExpensiveChild = memo(function ExpensiveChild({ onClick, label }) {
  console.log(`Rendering: ${label}`);
  return <button onClick={onClick}>{label}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ❌ Tạo function MỚI mỗi render → ExpensiveChild re-render
  // const handleClick = () => console.log('Clicked!');

  // ✅ Cache function → ExpensiveChild KHÔNG re-render khi count thay đổi
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []);

  // useCallback với dependencies
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1); // Dùng functional update để không cần `count` dependency
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <input value={name} onChange={e => setName(e.target.value)} />
      
      {/* Button này KHÔNG re-render khi name thay đổi */}
      <ExpensiveChild onClick={handleClick} label="Click me" />
      <ExpensiveChild onClick={handleIncrement} label="Increment" />
    </div>
  );
}
```

### useMemo vs useCallback

```jsx
// useCallback(fn, deps) ≡ useMemo(() => fn, deps)

// useMemo → cache GIÁ TRỊ
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);

// useCallback → cache FUNCTION
const memoizedFn = useCallback(() => doSomething(a, b), [a, b]);

// Tương đương:
const memoizedFn = useMemo(() => () => doSomething(a, b), [a, b]);
```

---

## 4. Custom Hooks

Custom Hook là hàm JavaScript bắt đầu bằng `use` và có thể gọi các Hooks khác.

### 4.1 useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Sử dụng
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  // Tự động persist vào localStorage!
}
```

### 4.2 useDebounce

```jsx
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng: Search với debounce
function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, loading } = useFetch(
    debouncedQuery ? `/api/search?q=${debouncedQuery}` : null
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {loading && <p>Đang tìm...</p>}
      {data?.map(item => <p key={item.id}>{item.title}</p>)}
    </div>
  );
}
```

### 4.3 useToggle

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// Sử dụng
function App() {
  const modal = useToggle(false);
  const sidebar = useToggle(true);

  return (
    <div>
      <button onClick={modal.toggle}>
        {modal.value ? 'Đóng' : 'Mở'} Modal
      </button>
      {modal.value && <Modal onClose={modal.setFalse} />}

      <button onClick={sidebar.toggle}>Toggle Sidebar</button>
      {sidebar.value && <Sidebar />}
    </div>
  );
}
```

### 4.4 useWindowSize

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Sử dụng
function ResponsiveComponent() {
  const { width } = useWindowSize();

  if (width < 768) return <MobileLayout />;
  if (width < 1024) return <TabletLayout />;
  return <DesktopLayout />;
}
```

### 4.5 useOnClickOutside

```jsx
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Sử dụng: Dropdown tự đóng khi click outside
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Menu ▾</button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li>Tùy chọn 1</li>
          <li>Tùy chọn 2</li>
          <li>Tùy chọn 3</li>
        </ul>
      )}
    </div>
  );
}
```

### 4.6 useAsync

```jsx
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, error, status, execute, isLoading: status === 'pending' };
}

// Sử dụng
function UserPage({ userId }) {
  const { data: user, isLoading, error } = useAsync(
    () => fetch(`/api/users/${userId}`).then(r => r.json()),
    true
  );

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <UserProfile user={user} />;
}
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: useReducer Todo App
Xây dựng Todo app sử dụng useReducer với actions: ADD, DELETE, TOGGLE, EDIT, FILTER, CLEAR_COMPLETED.

### Bài 2: Custom Hook - useMediaQuery
Tạo hook `useMediaQuery(query)` trả về boolean, ví dụ: `useMediaQuery('(min-width: 768px)')`.

### Bài 3: Custom Hook - useFetch
Tạo hook `useFetch(url)` với: loading, error, data, refetch, caching.

### Bài 4: Performance Challenge
Tạo danh sách 10,000 items, sử dụng useMemo để filter/sort, useCallback cho handlers, React.memo cho items.

---

## 🔑 Tóm Tắt

| Hook | Mục đích | Khi nào dùng |
|------|---------|-------------|
| `useReducer` | State phức tạp | Nhiều actions, state liên quan |
| `useMemo` | Cache giá trị | Tính toán tốn kém |
| `useCallback` | Cache function | Truyền callback cho memo'd child |
| Custom Hook | Tái sử dụng logic | Logic lặp lại ở nhiều components |

---

> **Bài trước:** [10 - Hooks Cơ Bản ←](./10-hooks-co-ban.md)  
> **Bài tiếp theo:** [12 - Component Lifecycle →](./12-lifecycle.md)
