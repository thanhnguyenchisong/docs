# Bài 25: React Internals - Cơ Chế Hoạt Động Bên Trong

## 📚 Mục tiêu bài học
- Fiber Architecture
- Reconciliation Algorithm (Diffing)
- Concurrent Rendering
- React Scheduler
- Hiểu sâu re-rendering

---

## 1. Fiber Architecture

### Trước Fiber (React < 16): Stack Reconciler

```
Vấn đề: Render ĐỒNG BỘ toàn bộ cây component
         → Blocking main thread → UI freeze

Render bắt đầu ─────────────────────────────── Render xong
         │  Không thể bị gián đoạn!  │
         │  User input bị block      │
         └──────────── 300ms ────────┘
```

### Sau Fiber (React 16+): Fiber Reconciler

```
Render chia thành nhiều UNITS OF WORK nhỏ
Có thể PAUSE, RESUME, ABORT

Render ─── Pause (handle user input) ─── Resume ─── Done
  │5ms│      │  Responsive!  │           │5ms│
  └───┘      └───────────────┘           └───┘
```

### Fiber Node Structure

```
Mỗi React element → 1 Fiber node (JS object)

Fiber Node:
{
  type: 'div' | FunctionComponent,
  key: null | string,
  
  // Cây Fiber (linked list, KHÔNG phải tree)
  child: Fiber | null,      // Con đầu tiên
  sibling: Fiber | null,    // Anh em bên cạnh
  return: Fiber | null,     // Cha
  
  // State & Props
  pendingProps: object,
  memoizedProps: object,
  memoizedState: any,
  
  // Effect
  flags: number,            // Cần update, insert, delete?
  subtreeFlags: number,
  
  // Scheduling
  lanes: number,            // Priority
  
  // Double buffering
  alternate: Fiber | null,  // Work-in-progress copy
}
```

### Fiber Tree (Linked List traversal)

```
              App
              │ child
              ▼
           Header ──sibling──► Main ──sibling──► Footer
              │ child           │ child
              ▼                 ▼
            Logo           Sidebar ──sibling──► Content
                               │ child
                               ▼
                            MenuItem

Traversal: App → Header → Logo → (up) → Main → Sidebar → MenuItem → (up) → Content → (up) → Footer
```

---

## 2. Reconciliation (Diffing Algorithm)

### Hai giả định quan trọng:

```
1. Hai elements khác TYPE → tạo cây mới hoàn toàn
   <div> → <span>  → Unmount div, mount span (và tất cả children)

2. Key giúp identify elements giữa các lần render
   <li key="1"> vẫn là <li key="1"> dù thay đổi vị trí
```

### Diffing Process

```jsx
// ═══ Cùng type → Update props ═══
// Trước:
<div className="old" style={{ color: 'red' }}>Hello</div>
// Sau:
<div className="new" style={{ color: 'blue' }}>Hello</div>
// React: Chỉ update className và style.color, KHÔNG tạo mới DOM node

// ═══ Khác type → Remount ═══
// Trước:
<div><Counter /></div>
// Sau:
<span><Counter /></span>
// React: Unmount <div> + <Counter>, Mount <span> + <Counter> MỚI
// Counter MẤT toàn bộ state!

// ═══ Lists & Keys ═══
// Không key - React so sánh theo INDEX
// Trước: [A, B, C]
// Sau:   [D, A, B, C]
// React nghĩ: A→D, B→A, C→B, thêm C
// → RE-RENDER TẤT CẢ! (sai semantic)

// Có key - React so sánh theo KEY
// Trước: [A:1, B:2, C:3]
// Sau:   [D:4, A:1, B:2, C:3]
// React biết: Thêm D:4, A,B,C không đổi
// → Chỉ INSERT D, hiệu quả hơn nhiều!
```

---

## 3. Concurrent Rendering (React 18+)

### Khái niệm

```
Synchronous Rendering (React 17-):
├── Bắt đầu render → PHẢI hoàn thành
├── Không thể bị gián đoạn
└── Heavy update → UI freeze

Concurrent Rendering (React 18+):
├── Render có thể bị GIÁN ĐOẠN
├── Ưu tiên urgent updates (user input)
├── Defer non-urgent updates (data fetching)
└── UI luôn responsive
```

### Priority Lanes

```
Lane Priority (cao → thấp):
├── SyncLane           → Discrete events (click, keydown)
├── InputContinuousLane → Continuous events (scroll, mousemove)
├── DefaultLane        → Normal updates (setState)
├── TransitionLane     → Transitions (startTransition)
├── IdleLane           → Idle work (deferred updates)
└── OffscreenLane      → Offscreen rendering
```

### useTransition & useDeferredValue

```jsx
import { useTransition, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // Urgent: update input ngay lập tức
    setQuery(e.target.value);

    // Non-urgent: defer heavy filtering
    startTransition(() => {
      setSearchResults(filterHeavyData(e.target.value));
    });
    // Input vẫn responsive trong khi filtering chạy background
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <SearchResults />
    </div>
  );
}

// useDeferredValue
function AutoComplete({ query }) {
  // query thay đổi nhanh (mỗi keystroke)
  // deferredQuery thay đổi chậm hơn (debounce-like)
  const deferredQuery = useDeferredValue(query);

  // Heavy filtering dùng deferredQuery
  const results = useMemo(() =>
    heavyFilter(items, deferredQuery),
    [deferredQuery]
  );

  return (
    <div style={{ opacity: query !== deferredQuery ? 0.7 : 1 }}>
      {results.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

---

## 4. Render Phases

```
React render có 2 phases:

Phase 1: RENDER (Reconciliation)
├── Có thể bị gián đoạn (concurrent mode)
├── Tạo Fiber tree mới (work-in-progress)
├── So sánh với tree cũ (current)
├── Đánh dấu elements cần update
├── KHÔNG thao tác DOM
└── Pure, no side effects

Phase 2: COMMIT
├── KHÔNG thể bị gián đoạn
├── Thao tác DOM thật (insert, update, delete)
├── Chạy useLayoutEffect (đồng bộ)
├── Chạy useEffect (bất đồng bộ, sau paint)
└── Gọi ref callbacks

Timeline:
Render ──→ Commit ──→ Browser Paint ──→ useEffect
                  │
                  └── useLayoutEffect (trước paint)
```

---

## 5. Hooks Internals

```
React lưu Hooks dưới dạng LINKED LIST trên Fiber node

Fiber.memoizedState → Hook1 → Hook2 → Hook3 → null
                     (useState) (useEffect) (useRef)

Đó là lý do Hooks PHẢI gọi theo CÙNG THỨ TỰ mỗi render!

// ❌ Điều kiện → thứ tự hooks thay đổi → CRASH
if (condition) {
  const [a, setA] = useState(0);  // Lần 1: Hook1 = useState
}                                  // Lần 2: Hook1 bị skip!
const [b, setB] = useState(0);    // Lần 1: Hook2 = useState
                                   // Lần 2: Hook1 = useState (SAI!)
```

### useState Internal

```
useState nhận initialValue
→ Tạo Hook node: { memoizedState: initialValue, queue: [] }
→ Return [memoizedState, dispatchAction]

dispatchAction (setState):
1. Tạo Update object: { action, next }
2. Thêm vào Hook's update queue
3. Schedule re-render (với priority lane)
4. Khi render: Process queue → tính state mới
```

---

## 6. Batching & Scheduling

```jsx
// React 18 Automatic Batching
function handleClick() {
  setCount(c => c + 1);    // Không re-render
  setFlag(f => !f);        // Không re-render
  setName('new');           // Không re-render
  // → CHỈ 1 RE-RENDER cuối cùng
}

// Batching hoạt động EVERYWHERE trong React 18:
// - Event handlers ✅
// - setTimeout ✅
// - Promises ✅
// - Native event handlers ✅

// React 17: Chỉ batch trong React event handlers
setTimeout(() => {
  setCount(c => c + 1);    // Re-render! (React 17)
  setFlag(f => !f);        // Re-render! (React 17)
  // React 18: Vẫn batch → 1 re-render
}, 1000);
```

---

## 📝 Bài Tập

### Bài 1: Visualize Fiber tree traversal
### Bài 2: Demo reconciliation với key vs index
### Bài 3: useTransition cho heavy list filtering
### Bài 4: Measure render phases với React Profiler API

---

> **Bài trước:** [24 - DevOps ←](./24-devops-deployment.md)  
> **Bài tiếp theo:** [26 - Best Practices →](./26-best-practices.md)
