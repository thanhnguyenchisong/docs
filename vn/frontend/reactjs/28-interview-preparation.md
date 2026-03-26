# Bài 28: Interview Preparation - Chuẩn Bị Phỏng Vấn React

## 📚 Mục tiêu bài học
- 200+ câu hỏi phỏng vấn phân theo level
- Đáp án chi tiết
- Coding challenges thường gặp
- System design cho frontend
- Tips phỏng vấn

---

## 🟢 Junior Level (0-2 năm)

### Câu hỏi lý thuyết

**1. React là gì? Tại sao dùng React?**
> React là thư viện JavaScript để xây dựng UI, phát triển bởi Meta. Ưu điểm: component-based, virtual DOM hiệu quả, ecosystem lớn, one-way data flow dễ debug, có thể phát triển mobile (React Native).

**2. JSX là gì?**
> JSX là phần mở rộng cú pháp JavaScript cho phép viết HTML-like trong JS. Nó được biên dịch thành `React.createElement()` calls. JSX không bắt buộc nhưng giúp code dễ đọc hơn.

**3. Virtual DOM hoạt động như thế nào?**
> 1) React tạo bản sao nhẹ của Real DOM (Virtual DOM). 2) Khi state thay đổi, React tạo Virtual DOM mới. 3) So sánh (diffing) cũ vs mới. 4) Chỉ cập nhật phần thay đổi trên Real DOM (reconciliation). Hiệu quả hơn thao tác Real DOM trực tiếp.

**4. Props vs State?**
> - **Props**: Dữ liệu từ cha → con, read-only, component con không thể thay đổi.
> - **State**: Dữ liệu nội bộ component, có thể thay đổi bằng setState, trigger re-render.

**5. Tại sao cần key khi render list?**
> Key giúp React identify từng element trong list. Khi thêm/xóa/sắp xếp, React so sánh theo key thay vì index → chỉ update phần thay đổi, tăng performance. Không dùng index cho dynamic lists vì index thay đổi khi list thay đổi.

**6. Controlled vs Uncontrolled Components?**
> - **Controlled**: React state kiểm soát giá trị (value + onChange). Single source of truth.
> - **Uncontrolled**: DOM tự quản lý, dùng ref để đọc. Phù hợp file input và form đơn giản.

**7. useEffect là gì? Giải thích dependency array.**
> useEffect xử lý side effects (API calls, timers, DOM manipulation). Dependencies array:
> - Không có `[]`: chạy mỗi render
> - `[]` rỗng: chạy 1 lần khi mount
> - `[a, b]`: chạy khi a hoặc b thay đổi

**8. useState vs useRef?**
> - `useState`: thay đổi → trigger re-render, dùng cho data hiển thị.
> - `useRef`: thay đổi → KHÔNG re-render, dùng cho DOM refs và giá trị persist.

**9. Fragment là gì?**
> `<>...</>` hoặc `<Fragment>` nhóm elements mà không tạo thêm DOM node. Cần `<Fragment key={}>` khi dùng trong map().

**10. Conditional rendering có những cách nào?**
> - `if/else` + early return
> - Ternary `condition ? A : B`
> - Logical AND `condition && <A />`
> - Object mapping `config[type]`

### Coding Challenges

```jsx
// Challenge 1: Counter với min/max
function Counter({ min = 0, max = 100, step = 1 }) {
  const [count, setCount] = useState(min);

  return (
    <div>
      <button
        onClick={() => setCount(c => Math.max(min, c - step))}
        disabled={count <= min}
      >
        -
      </button>
      <span>{count}</span>
      <button
        onClick={() => setCount(c => Math.min(max, c + step))}
        disabled={count >= max}
      >
        +
      </button>
    </div>
  );
}

// Challenge 2: Toggle Visibility
function ToggleContent({ title, children }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? '▼' : '▶'} {title}
      </button>
      {isVisible && <div>{children}</div>}
    </div>
  );
}

// Challenge 3: Search Filter
function SearchList({ items }) {
  const [query, setQuery] = useState('');

  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />
      <ul>
        {filtered.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <p>{filtered.length} results</p>
    </div>
  );
}
```

---

## 🟡 Mid-Level (2-4 năm)

### Câu hỏi lý thuyết

**11. useCallback vs useMemo?**
> - `useMemo(() => value, [deps])` cache **giá trị** tính toán.
> - `useCallback(fn, [deps])` cache **function reference**.
> - Dùng khi truyền callbacks/values cho memo'd children.

**12. React.memo là gì?**
> HOC ngăn component re-render nếu props không đổi. So sánh shallow. Tùy chỉnh bằng custom comparison function.

**13. useReducer khi nào nên dùng?**
> Khi state phức tạp, nhiều actions liên quan, next state phụ thuộc previous state, hoặc muốn tách logic khỏi component.

**14. Context API limitations?**
> - Mọi consumer re-render khi context value đổi (kể cả phần không dùng).
> - Không phù hợp cho state thay đổi thường xuyên.
> - Giải pháp: tách thành nhiều contexts, hoặc dùng state management library.

**15. Error Boundary là gì?**
> Class component bắt lỗi JS trong render tree con. Sử dụng `getDerivedStateFromError` và `componentDidCatch`. Không bắt được lỗi trong event handlers, async code, SSR.

**16. Custom Hooks rules?**
> - Tên bắt đầu bằng `use`
> - Có thể gọi hooks khác bên trong
> - Tuân thủ Rules of Hooks (top level, React functions only)
> - Mỗi instance có state riêng biệt

**17. Code splitting và lazy loading?**
> `React.lazy(() => import('./Component'))` + `<Suspense>` tải component khi cần, giảm initial bundle size. Thường áp dụng cho routes.

**18. React Router v6 có gì mới?**
> - `<Routes>` thay `<Switch>`
> - `element` thay `component/render`
> - Nested routes với `<Outlet />`
> - `useNavigate()` thay `useHistory()`
> - Relative links, `useSearchParams()`

**19. Giải thích one-way data flow.**
> Data chảy từ parent → child qua props. Child không thể thay đổi props. Muốn child thông báo cha → callback props. Luồng dữ liệu dễ debug, predictable.

**20. Reconciliation algorithm hoạt động thế nào?**
> 1) Khác type → unmount cũ, mount mới. 2) Cùng type → update props. 3) Lists dùng key để identity. O(n) complexity thay vì O(n³) của tree diff thông thường.

### Coding Challenges

```jsx
// Challenge 4: useDebounce hook
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Challenge 5: useFetch hook
function useFetch(url) {
  const [state, setState] = useState({
    data: null, loading: true, error: null
  });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();

    setState(s => ({ ...s, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        if (err.name !== 'AbortError')
          setState({ data: null, loading: false, error: err.message });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// Challenge 6: useLocalStorage hook
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Challenge 7: Implement Tabs component
function Tabs({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="tab-headers" role="tablist">
        {items.map((item, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            className={activeIndex === index ? 'active' : ''}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="tab-content">
        {items[activeIndex].content}
      </div>
    </div>
  );
}

// Challenge 8: Pagination hook
function usePagination(totalItems, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    currentPage,
    totalPages,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems),
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
```

---

## 🔴 Senior Level (4-7 năm)

### Câu hỏi lý thuyết

**21. Fiber architecture giải quyết vấn đề gì?**
> Stack reconciler cũ render đồng bộ, block main thread. Fiber chia render thành units of work nhỏ, có thể pause/resume, cho phép concurrent rendering. priority-based scheduling.

**22. Concurrent features trong React 18?**
> - `useTransition`: đánh dấu state update là non-urgent
> - `useDeferredValue`: defer expensive computation
> - Automatic batching: batch updates ở mọi nơi (setTimeout, promises)
> - `<Suspense>` cho data fetching
> - Streaming SSR

**23. React Server Components là gì?**
> Components chạy trên server, zero JS bundle cho client. Truy cập DB/filesystem trực tiếp. Mix Server + Client components. Client components dùng `'use client'` directive.

**24. Micro-frontends với React?**
> Module Federation (Webpack 5) chia app thành independent deployable units. Mỗi team own một domain. Share dependencies (react, react-dom). Challenges: routing, shared state, CSS isolation.

**25. Performance optimization strategy?**
> 1) Measure first (Profiler, Lighthouse). 2) Code split routes. 3) Virtualize long lists. 4) Memo expensive components. 5) Debounce inputs. 6) Optimize images. 7) Prefetch critical resources.

### Coding Challenges

```jsx
// Challenge 9: Implement useReducer + Context (mini Redux)
const StateContext = createContext();
const DispatchContext = createContext();

function AppProvider({ reducer, initialState, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const useAppState = () => useContext(StateContext);
const useAppDispatch = () => useContext(DispatchContext);

// Challenge 10: Compound Select component
function Select({ children, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onChange, isOpen, setIsOpen }}>
      <div ref={ref} className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Trigger = function Trigger({ children }) {
  const { isOpen, setIsOpen, value } = useContext(SelectContext);
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {value || children} {isOpen ? '▲' : '▼'}
    </button>
  );
};

Select.Options = function Options({ children }) {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;
  return <ul className="select-options">{children}</ul>;
};

Select.Option = function Option({ value, children }) {
  const ctx = useContext(SelectContext);
  return (
    <li
      onClick={() => { ctx.onChange(value); ctx.setIsOpen(false); }}
      className={ctx.value === value ? 'selected' : ''}
    >
      {children}
    </li>
  );
};
```

---

## 🟣 Principal/Staff Level (7+ năm)

### Câu hỏi

**26. Thiết kế Design System từ đầu?**
> Tokens (colors, spacing, typography) → Primitives (Box, Text) → Atoms (Button, Input) → Molecules (FormField, Card) → Organisms (Header, DataTable). Storybook documentation. Theme provider. Accessibility built-in.

**27. Khi nào chọn SSR/SSG/CSR/ISR?**
> CSR: Apps không cần SEO (dashboards). SSR: Dynamic SEO pages (social, user profiles). SSG: Static content (blog, docs). ISR: Mostly static nhưng cần freshness (e-commerce).

**28. Chiến lược testing cho large app?**
> Testing pyramid: Unit (70% - hooks, utils) → Integration (20% - component interactions) → E2E (10% - critical flows). Test behavior not implementation. Coverage > 80%.

**29. Migration strategy (class → hooks, JS → TS)?**
> Incremental: 1) New code in target. 2) Shared utilities first. 3) Leaf components. 4) Complex components last. Codemods: jscodeshift. Feature flags for rollback.

**30. System design: Real-time collaboration editor?**
> CRDT/OT algorithms, WebSocket, presence awareness, cursor positions, conflict resolution, undo/redo, operational transform. Like Google Docs.

---

## 🎙️ Frontend System Design

### Thiết kế Instagram Feed

```
Requirements:
├── Infinite scroll feed
├── Image lazy loading
├── Like/Comment interactions
├── Stories carousel
├── Real-time updates

Architecture:
├── Data Layer
│   ├── TanStack Query (feed data, caching, pagination)
│   ├── WebSocket (real-time likes, comments)
│   └── Optimistic updates
├── UI Layer
│   ├── Virtualized list (react-window)
│   ├── Intersection Observer (lazy load images)
│   ├── Skeleton loading
│   └── Progressive image loading (blur → full)
├── State Management
│   ├── Server state: TanStack Query
│   ├── UI state: Zustand (modal, sidebar)
│   └── Auth state: Context
└── Performance
    ├── Code splitting per route
    ├── Image CDN + WebP
    ├── Service Worker caching
    └── Web Vitals monitoring
```

---

## 💡 Tips Phỏng Vấn

```
Trước phỏng vấn:
□ Ôn lại 30 câu hỏi trên
□ Code 5-10 challenges không nhìn đáp án
□ Đọc React docs chính thức (react.dev)
□ Review dự án cá nhân, giải thích được mọi quyết định
□ Chuẩn bị câu hỏi cho interviewer

Trong phỏng vấn:
□ Hỏi lại nếu chưa hiểu đề
□ Think out loud - nói ý tưởng trước khi code
□ Bắt đầu từ giải pháp đơn giản, optimize sau
□ Đề cập edge cases (null, empty, error)
□ Nói về trade-offs của giải pháp

Sau phỏng vấn:
□ Gửi thank you email
□ Note lại câu hỏi không trả lời được
□ Học từ feedback
```

---

## 📚 Tài Nguyên Học Thêm

### Official
- [react.dev](https://react.dev) - React docs chính thức (rất tốt!)
- [nextjs.org/docs](https://nextjs.org/docs) - Next.js docs

### Courses
- Epic React by Kent C. Dodds
- Joy of React by Josh Comeau
- Total TypeScript by Matt Pocock

### Blogs
- [overreacted.io](https://overreacted.io) - Dan Abramov (React core team)
- [kentcdodds.com/blog](https://kentcdodds.com/blog)
- [joshwcomeau.com](https://joshwcomeau.com)

### Practice
- [react.gg](https://react.gg)
- [frontendmentor.io](https://frontendmentor.io)
- [greatfrontend.com](https://greatfrontend.com)

---

> **Bài trước:** [27 - Dự Án Thực Tế ←](./27-du-an-thuc-te.md)  
> **Quay về:** [README - Mục Lục ←](./README.md)

---

🎉 **Chúc mừng bạn đã hoàn thành toàn bộ khóa học ReactJS!**

Hãy nhớ: *Cách tốt nhất để học là THỰC HÀNH. Build, build, build!* 🚀
