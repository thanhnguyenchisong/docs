# Bài 17: Performance Optimization - Tối Ưu Hiệu Suất

## 📚 Mục tiêu bài học
- Hiểu khi nào React re-render và tại sao
- React.memo, useMemo, useCallback
- Code splitting và lazy loading
- Virtualization cho danh sách lớn
- React Profiler và DevTools

---

## 1. Hiểu React Re-rendering

```
Component re-render khi:
1. State thay đổi (setState)
2. Props thay đổi (parent re-render)
3. Context value thay đổi
4. Parent re-render (MẶC ĐỊNH tất cả children re-render)

Re-render ≠ DOM update
React chỉ update DOM khi output JSX khác nhau (diffing)
```

### Minh họa re-render không cần thiết

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      {/* ❌ ExpensiveChild re-render MỖI LẦN count đổi 
          dù nó KHÔNG dùng count */}
      <ExpensiveChild />
    </div>
  );
}

function ExpensiveChild() {
  console.log('ExpensiveChild rendered!'); // Log mỗi lần parent re-render
  // ... heavy computation
  return <div>Heavy Component</div>;
}
```

---

## 2. React.memo

Ngăn component re-render nếu props **không thay đổi**.

```jsx
import { memo } from 'react';

// ✅ Chỉ re-render khi name hoặc email thay đổi
const UserCard = memo(function UserCard({ name, email }) {
  console.log('UserCard rendered');
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
});

// Custom comparison function
const ProductCard = memo(
  function ProductCard({ product }) {
    return <div>{product.name} - {product.price}</div>;
  },
  // arePropsEqual: return true → KHÔNG re-render
  (prevProps, nextProps) => {
    return prevProps.product.id === nextProps.product.id
      && prevProps.product.price === nextProps.product.price;
  }
);
```

### Kết hợp memo + useCallback + useMemo

```jsx
const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log('TodoItem rendered:', todo.id);
  return (
    <div>
      <input type="checkbox" checked={todo.done}
        onChange={() => onToggle(todo.id)} />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>🗑️</button>
    </div>
  );
});

function TodoList() {
  const [todos, setTodos] = useState(generateTodos(1000));
  const [filter, setFilter] = useState('');

  // ✅ useCallback: function reference ổn định
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  // ✅ useMemo: tính toán tốn kém chỉ khi cần
  const filteredTodos = useMemo(() =>
    todos.filter(t => t.text.toLowerCase().includes(filter.toLowerCase())),
    [todos, filter]
  );

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}   // ✅ Reference ổn định
          onDelete={handleDelete}   // ✅ Reference ổn định
        />
      ))}
    </div>
  );
}
```

---

## 3. Code Splitting & Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Lazy load on interaction
function LazyModal() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Mở Editor</button>
      {showEditor && (
        <Suspense fallback={<p>Đang tải editor...</p>}>
          <RichTextEditor />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 4. Virtualization (Danh Sách Lớn)

```bash
npm install @tanstack/react-virtual
```

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Ước tính chiều cao mỗi item
    overscan: 5,            // Render thêm 5 items ngoài viewport
  });

  return (
    <div
      ref={parentRef}
      style={{ height: '500px', overflow: 'auto' }}
    >
      <div style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemCard item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
// 10,000 items → chỉ render ~20 visible items!
```

---

## 5. Các Kỹ Thuật Khác

### 5.1 Debounce Input

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

### 5.2 Tránh Inline Objects/Arrays

```jsx
// ❌ Tạo object/array MỚI mỗi render
<MemoizedChild style={{ color: 'red' }} items={[1, 2, 3]} />

// ✅ Định nghĩa ngoài hoặc dùng useMemo
const style = useMemo(() => ({ color: 'red' }), []);
const items = useMemo(() => [1, 2, 3], []);
<MemoizedChild style={style} items={items} />
```

### 5.3 Key cho Reset Component

```jsx
// Dùng key để force remount (reset state)
function App() {
  const [userId, setUserId] = useState(1);
  return (
    // Khi userId đổi → EditForm unmount → mount MỚI (state reset)
    <EditForm key={userId} userId={userId} />
  );
}
```

---

## 6. React Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} ${phase}: ${actualDuration.toFixed(1)}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Main />
      <Footer />
    </Profiler>
  );
}
```

### Checklist Performance

```
□ Dùng React.memo cho heavy child components
□ Dùng useCallback cho callback props truyền vào memo'd children
□ Dùng useMemo cho tính toán tốn kém
□ Lazy load routes và heavy components
□ Virtualize danh sách > 100 items
□ Debounce search inputs
□ Tránh inline objects/arrays trong JSX
□ Tách context thành pieces nhỏ
□ Dùng React DevTools Profiler để đo
□ Không over-optimize!
```

---

## 📝 Bài Tập

### Bài 1: Optimize danh sách 10,000 items với memo + virtualization
### Bài 2: Lazy load dashboard sections
### Bài 3: Profile và tối ưu app có nhiều re-render
### Bài 4: Image lazy loading với Intersection Observer

---

> **Bài trước:** [16 - State Management ←](./16-state-management.md)  
> **Bài tiếp theo:** [18 - Testing →](./18-testing.md)
