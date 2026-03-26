# Bài 26: Best Practices & Principles - Nguyên Tắc Và Thực Hành Tốt

## 📚 Mục tiêu bài học
- Nguyên tắc thiết kế component
- Code quality standards
- Accessibility (a11y)
- Security best practices
- Team conventions & code review

---

## 1. Component Design Principles

### 1.1 Single Responsibility Principle (SRP)

```jsx
// ❌ Component làm quá nhiều việc
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');

  useEffect(() => { fetchUser() }, []);
  useEffect(() => { fetchPosts() }, []);
  useEffect(() => { fetchNotifications() }, []);

  return (
    <div>
      {/* Header, sidebar, content, modals... tất cả trong 1 component */}
      {/* 500+ dòng code */}
    </div>
  );
}

// ✅ Tách thành components nhỏ, mỗi cái 1 nhiệm vụ
function UserDashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardSidebar />
      <DashboardContent>
        <StatsOverview />
        <RecentPosts />
        <NotificationPanel />
      </DashboardContent>
    </DashboardLayout>
  );
}
```

### 1.2 DRY (Don't Repeat Yourself)

```jsx
// ❌ Lặp lại logic
function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  // ... lặp lại ở 10 pages khác
}

// ✅ Custom hook tái sử dụng
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

function AdminPage() {
  const { data, loading, error } = useFetch('/api/admin');
  // Clean! Reusable!
}
```

### 1.3 Composition Over Inheritance

```jsx
// ❌ Inheritance (React không khuyến khích)
class SpecialButton extends Button { ... }

// ✅ Composition
function IconButton({ icon, children, ...props }) {
  return (
    <Button {...props}>
      <Icon name={icon} />
      <span>{children}</span>
    </Button>
  );
}

function LoadingButton({ isLoading, children, ...props }) {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? <Spinner size="sm" /> : children}
    </Button>
  );
}
```

---

## 2. Naming Conventions

```
Files & Folders:
├── Components:   PascalCase.tsx     (UserCard.tsx, ProductList.tsx)
├── Hooks:        camelCase.ts       (useAuth.ts, useFetch.ts)
├── Utils:        camelCase.ts       (formatDate.ts, validators.ts)
├── Constants:    UPPER_CASE.ts      (API_ENDPOINTS.ts)
├── Types:        PascalCase.ts      (User.types.ts)
├── Styles:       PascalCase.css     (UserCard.css) hoặc module
├── Tests:        PascalCase.test.tsx (UserCard.test.tsx)
└── Stories:      PascalCase.stories.tsx

Variables & Functions:
├── Components:   PascalCase         function UserCard()
├── Hooks:        use prefix         function useAuth()
├── Handlers:     handle prefix      function handleClick()
├── Callbacks:    on prefix (props)  onSubmit, onChange
├── Booleans:     is/has/can/should  isLoading, hasError, canEdit
├── Constants:    UPPER_SNAKE        MAX_ITEMS, API_URL
├── Enums:        PascalCase         enum UserRole { Admin, User }
└── Types:        PascalCase + suffix UserProps, AuthState, ApiResponse
```

---

## 3. Code Quality Rules

### 3.1 Component Size

```
Quy tắc ngón tay cái:
├── Component < 200 dòng (lý tưởng < 100)
├── Hooks < 100 dòng
├── File < 300 dòng
├── JSX return < 50 dòng
├── Props < 7 (tách thành object nếu nhiều hơn)
└── useEffect < 20 dòng (tách logic vào function)
```

### 3.2 Tránh Pitfalls Phổ Biến

```jsx
// ═══ 1. Tránh unnecessary state ═══
// ❌
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Derived state - tính toán trực tiếp
const fullName = `${firstName} ${lastName}`;


// ═══ 2. Tránh useEffect cho event handling ═══
// ❌ 
const [query, setQuery] = useState('');
useEffect(() => {
  if (query) search(query);
}, [query]);

// ✅ Gọi trong event handler
const handleSearch = (e) => {
  const value = e.target.value;
  setQuery(value);
  if (value) search(value);
};


// ═══ 3. Tránh object/array mới trong JSX ═══
// ❌ Tạo mới mỗi render
<Component style={{ marginTop: 20 }} data={[1, 2, 3]} />

// ✅ Tách ra ngoài hoặc useMemo
const style = { marginTop: 20 };
const data = [1, 2, 3];
<Component style={style} data={data} />


// ═══ 4. Cleanup effects ═══
// ❌ Memory leak
useEffect(() => {
  const interval = setInterval(tick, 1000);
  // Quên cleanup!
}, []);

// ✅
useEffect(() => {
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}, []);


// ═══ 5. Tránh index as key cho dynamic lists ═══
// ❌ Bug khi thêm/xóa/sắp xếp
{items.map((item, index) => <Item key={index} item={item} />)}

// ✅ Unique ID
{items.map(item => <Item key={item.id} item={item} />)}


// ═══ 6. Tránh setState trong render ═══
// ❌ Infinite loop
function Bad() {
  const [count, setCount] = useState(0);
  setCount(1); // 💥 Loop!
  return <div>{count}</div>;
}

// ✅ Trong event handler hoặc useEffect
function Good() {
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(1); }, []);
  return <div>{count}</div>;
}
```

---

## 4. Accessibility (a11y)

### Checklist A11y

```jsx
// ═══ Semantic HTML ═══
// ❌
<div onClick={handleClick}>Click me</div>
<div className="header">...</div>

// ✅
<button onClick={handleClick}>Click me</button>
<header>...</header>
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>


// ═══ ARIA labels ═══
<button aria-label="Đóng modal">✕</button>
<input aria-describedby="email-error" />
<div role="alert">{errorMessage}</div>
<nav aria-label="Main navigation">...</nav>


// ═══ Keyboard Navigation ═══
function Modal({ isOpen, onClose, children }) {
  // Trap focus trong modal
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();

      // Tab trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}>
      <h2 id="modal-title">Tiêu đề Modal</h2>
      {children}
      <button onClick={onClose}>Đóng</button>
    </div>
  );
}


// ═══ Alt text cho images ═══
// ❌
<img src="logo.png" />

// ✅ Decorative
<img src="decorative-border.png" alt="" role="presentation" />

// ✅ Informative
<img src="chart.png" alt="Biểu đồ doanh thu quý 3 tăng 25%" />


// ═══ Form labels ═══
// ❌
<input type="email" placeholder="Email" />

// ✅
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="example@email.com" />

// ✅ Visually hidden label
<label htmlFor="search" className="sr-only">Tìm kiếm</label>
<input id="search" type="search" placeholder="Tìm kiếm..." />
```

### CSS cho sr-only (screen reader only)

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 5. Security Best Practices

```jsx
// ═══ 1. XSS Prevention ═══
// React tự escape JSX content (an toàn mặc định)
const userInput = '<script>alert("XSS")</script>';
<p>{userInput}</p>  // Hiển thị text, KHÔNG chạy script

// ⚠️ NGUY HIỂM: dangerouslySetInnerHTML
// Chỉ dùng khi THẬT SỰ cần, và sanitize trước
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />


// ═══ 2. Không lưu sensitive data trong state/localStorage ═══
// ❌
localStorage.setItem('password', password);
const [creditCard, setCreditCard] = useState('');

// ✅ Chỉ lưu token, backend xử lý sensitive data
localStorage.setItem('token', jwtToken);


// ═══ 3. Environment variables ═══
// ❌ API key trong code
const API_KEY = 'sk-12345';  // 💥 Exposed trên client!

// ✅ Server-side hoặc env variables
const apiUrl = import.meta.env.VITE_API_URL;
// Sensitive keys: chỉ trên server (Next.js server components)


// ═══ 4. Validate input ═══
// Luôn validate cả client VÀ server
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};


// ═══ 5. HTTPS everywhere ═══
// ═══ 6. CSP headers ═══
// ═══ 7. Dependency audit ═══
// npm audit
// npx npm-check-updates
```

---

## 6. Code Review Checklist

```
React Code Review Checklist:

Functionality:
□ Component hoạt động đúng yêu cầu
□ Edge cases được xử lý (null, undefined, empty, error)
□ Loading states hiển thị đúng
□ Error handling đầy đủ

Code Quality:
□ Tên biến/function mô tả rõ ràng
□ Component < 200 dòng
□ Không lặp lại code (DRY)
□ Không có console.log trong production
□ TypeScript types đầy đủ (nếu dùng TS)

React Patterns:
□ Hooks tuân thủ Rules of Hooks
□ useEffect có đầy đủ dependencies
□ useEffect có cleanup khi cần
□ Key đúng cho lists (không dùng index cho dynamic lists)
□ Không có unnecessary state (derived values)
□ Không có unnecessary re-renders

Performance:
□ Memo cho expensive child components (khi cần)
□ Large lists virtualized
□ Images optimized
□ Lazy loading cho routes

Accessibility:
□ Semantic HTML (button, nav, main, etc.)
□ Form labels
□ Alt text cho images
□ Keyboard navigable
□ Color contrast đủ

Security:
□ Không có dangerouslySetInnerHTML không sanitize
□ Không lưu sensitive data trên client
□ Input validation
□ API keys không expose trên client
```

---

## 7. ESLint & Prettier Config

```bash
npm install -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks prettier
```

```js
// eslint.config.js (Flat config - ESLint 9+)
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
  {
    plugins: { 'react-hooks': reactHooks, react },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'warn',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "jsxSingleQuote": false,
  "bracketSpacing": true
}
```

---

## 📝 Bài Tập

### Bài 1: Refactor một component > 300 dòng thành components nhỏ
### Bài 2: Accessibility audit (chạy axe-core trên ứng dụng)
### Bài 3: Viết custom ESLint rule cho project conventions
### Bài 4: Code review checklist cho team

---

> **Bài trước:** [25 - React Internals ←](./25-react-internals.md)  
> **Bài tiếp theo:** [27 - Dự Án Thực Tế →](./27-du-an-thuc-te.md)
