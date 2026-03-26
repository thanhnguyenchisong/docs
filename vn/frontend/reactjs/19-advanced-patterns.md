# Bài 19: Advanced Patterns - Các Mẫu Thiết Kế Nâng Cao

## 📚 Mục tiêu bài học
- Higher-Order Components (HOC)
- Render Props Pattern
- Compound Components Pattern
- Headless Components
- State Machines

---

## 1. Higher-Order Components (HOC)

HOC là hàm nhận một component và trả về component mới với chức năng bổ sung.

```jsx
// ═══ HOC: withAuth ═══
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <Spinner />;
    if (!isAuthenticated) return <Navigate to="/login" />;

    return <WrappedComponent {...props} />;
  };
}

// Sử dụng
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedSettings = withAuth(Settings);

// ═══ HOC: withLoading ═══
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Skeleton />;
    return <WrappedComponent {...props} />;
  };
}

// ═══ HOC: withErrorBoundary ═══
function withErrorBoundary(WrappedComponent, FallbackComponent) {
  return function BoundedComponent(props) {
    return (
      <ErrorBoundary fallback={<FallbackComponent />}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Compose HOCs
const EnhancedDashboard = withErrorBoundary(
  withAuth(
    withLoading(Dashboard)
  ),
  DashboardError
);
```

> **Lưu ý:** HOC là pattern cũ. Custom Hooks được ưu tiên hơn trong React hiện đại. Tuy nhiên, HOC vẫn hữu ích cho cross-cutting concerns.

---

## 2. Render Props

Component nhận function prop và gọi nó để render UI.

```jsx
// ═══ Mouse Tracker ═══
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Sử dụng
function App() {
  return (
    <MouseTracker render={({ x, y }) => (
      <div>
        <p>Chuột ở vị trí: ({x}, {y})</p>
        <div style={{
          position: 'fixed',
          left: x - 10,
          top: y - 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'red',
          pointerEvents: 'none',
        }} />
      </div>
    )} />
  );
}

// ═══ Hoặc dùng children as a function ═══
function Toggle({ children }) {
  const [isOn, setIsOn] = useState(false);
  return children({ isOn, toggle: () => setIsOn(v => !v) });
}

<Toggle>
  {({ isOn, toggle }) => (
    <button onClick={toggle}>{isOn ? 'ON' : 'OFF'}</button>
  )}
</Toggle>
```

> **Hiện đại hơn:** Custom Hooks thay thế phần lớn render props patterns.

---

## 3. Compound Components ⭐

Pattern cho phép components cha-con chia sẻ state ngầm, tạo API declarative đẹp.

```jsx
import { createContext, useContext, useState HEA} from 'react';

// ═══ Context nội bộ ═══
const AccordionContext = createContext();

// ═══ Parent Component ═══
function Accordion({ children, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = (id) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// ═══ Child Components ═══
function AccordionItem({ children, id }) {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.has(id);

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
}

function AccordionHeader({ children, id }) {
  const { toggle, openItems } = useContext(AccordionContext);
  const isOpen = openItems.has(id);

  return (
    <button className="accordion-header" onClick={() => toggle(id)}>
      {children}
      <span>{isOpen ? '▼' : '▶'}</span>
    </button>
  );
}

function AccordionPanel({ children, id }) {
  const { openItems } = useContext(AccordionContext);
  if (!openItems.has(id)) return null;

  return <div className="accordion-panel">{children}</div>;
}

// Gắn sub-components
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

// ═══ API Declarative & Đẹp ═══
function FAQ() {
  return (
    <Accordion allowMultiple>
      <Accordion.Item id="1">
        <Accordion.Header id="1">React là gì?</Accordion.Header>
        <Accordion.Panel id="1">
          React là thư viện JavaScript để xây dựng UI.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="2">
        <Accordion.Header id="2">Tại sao dùng React?</Accordion.Header>
        <Accordion.Panel id="2">
          Nhanh, linh hoạt, cộng đồng lớn.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="3">
        <Accordion.Header id="3">Học React mất bao lâu?</Accordion.Header>
        <Accordion.Panel id="3">
          Cơ bản: 1-3 tháng. Thành thạo: 1-2 năm.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
```

---

## 4. Headless Components (Logic only, no UI)

```jsx
// ═══ Headless Select Hook ═══
function useSelect({ items, initialSelected = null, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialSelected);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);

  const select = (item) => {
    setSelected(item);
    setIsOpen(false);
    onChange?.(item);
  };

  const getToggleProps = () => ({
    onClick: () => setIsOpen(!isOpen),
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox',
  });

  const getMenuProps = () => ({
    role: 'listbox',
    'aria-activedescendant': items[highlightedIndex]?.id,
  });

  const getItemProps = (item, index) => ({
    role: 'option',
    'aria-selected': selected?.id === item.id,
    onClick: () => select(item),
    onMouseEnter: () => setHighlightedIndex(index),
  });

  return {
    isOpen, selected, highlightedIndex,
    getToggleProps, getMenuProps, getItemProps,
    containerRef,
  };
}

// ═══ Bạn tự style hoàn toàn ═══
function CustomSelect({ items, onChange }) {
  const {
    isOpen, selected,
    getToggleProps, getMenuProps, getItemProps,
  } = useSelect({ items, onChange });

  return (
    <div className="my-custom-select">
      <button {...getToggleProps()} className="select-trigger">
        {selected?.label || 'Chọn...'}
      </button>
      {isOpen && (
        <ul {...getMenuProps()} className="select-menu">
          {items.map((item, index) => (
            <li key={item.id} {...getItemProps(item, index)} className="select-item">
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 5. Polymorphic Components

```jsx
// Component có thể render thành bất kỳ HTML element nào
function Box({ as: Component = 'div', children, ...props }) {
  return <Component {...props}>{children}</Component>;
}

// Sử dụng
<Box as="section" className="hero">Hero content</Box>
<Box as="article">Article content</Box>
<Box as="a" href="/about">Link</Box>
<Box as={Link} to="/about">React Router Link</Box>
<Box as="button" onClick={handleClick}>Button</Box>
```

---

## 6. Container/Presentational Pattern

```jsx
// ═══ Container: Logic only ═══
function UserListContainer() {
  const { data: users, isLoading, error } = useFetch('/api/users');
  const [sortBy, setSortBy] = useState('name');

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return [...users].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [users, sortBy]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <UserList
      users={sortedUsers}
      sortBy={sortBy}
      onSortChange={setSortBy}
    />
  );
}

// ═══ Presentational: UI only ═══
function UserList({ users, sortBy, onSortChange }) {
  return (
    <div>
      <select value={sortBy} onChange={e => onSortChange(e.target.value)}>
        <option value="name">Tên</option>
        <option value="email">Email</option>
      </select>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## 7. Bảng Tóm Tắt Patterns

| Pattern | Mục đích | Hiện đại? |
|---------|---------|-----------|
| HOC | Thêm behavior cho component | ⚠️ Legacy, dùng hooks |
| Render Props | Chia sẻ logic, flexible rendering | ⚠️ Dùng hooks thay |
| Compound Components | API declarative, parent-child state | ✅ Rất phổ biến |
| Headless Components | Logic only, user tự style | ✅ Trend mới |
| Polymorphic | Render as any element | ✅ |
| Container/Presentational | Tách logic và UI | ✅ Custom hooks |

---

## 📝 Bài Tập

### Bài 1: Compound Tabs component
### Bài 2: Headless useDropdown hook
### Bài 3: Polymorphic Button component (button, a, Link)
### Bài 4: withLogger HOC (log mount, unmount, re-render)

---

> **Bài trước:** [18 - Testing ←](./18-testing.md)  
> **Bài tiếp theo:** [20 - TypeScript + React →](./20-typescript-react.md)
