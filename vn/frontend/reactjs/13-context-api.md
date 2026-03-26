# Bài 13: Context API - Chia Sẻ Dữ Liệu Toàn Cục

## 📚 Mục tiêu bài học
- Hiểu Context API và khi nào nên dùng
- Tạo và sử dụng Context
- Advanced patterns: multiple contexts, composition
- Performance considerations

---

## 1. Tại Sao Cần Context?

### Vấn đề Props Drilling

```
App (theme="dark")
 └── Layout (theme="dark")        ← Không cần theme
      └── Sidebar (theme="dark")   ← Không cần theme
           └── Menu (theme="dark") ← Không cần theme
                └── MenuItem (theme="dark") ← MỚI CẦN theme!
```

### Giải pháp: Context

```
App (ThemeProvider value="dark")
 └── Layout                       ← Không biết về theme
      └── Sidebar                  ← Không biết về theme
           └── Menu                ← Không biết về theme
                └── MenuItem       ← useContext(ThemeContext) → "dark"
```

---

## 2. Tạo và Sử Dụng Context

### 3 bước cơ bản:

```jsx
import { createContext, useContext, useState } from 'react';

// ═══ Bước 1: Tạo Context ═══
const ThemeContext = createContext(null);

// ═══ Bước 2: Tạo Provider (bọc component tree) ═══
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Value chứa data và functions cần chia sẻ
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ═══ Bước 3: Consume ở bất kỳ component con ═══
function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}

function ThemedCard({ title, children }) {
  const { isDark } = useContext(ThemeContext);

  return (
    <div style={{
      background: isDark ? '#1a1a2e' : '#ffffff',
      color: isDark ? '#eee' : '#333',
      padding: 20,
      borderRadius: 12,
      boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.1)',
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// ═══ App: Bọc bằng Provider ═══
function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: 20 }}>
        <ThemeToggle />
        <ThemedCard title="Thẻ 1">
          <p>Nội dung thẻ 1</p>
        </ThemedCard>
      </div>
    </ThemeProvider>
  );
}
```

---

## 3. Custom Hook Cho Context

```jsx
// ═══ contexts/AuthContext.jsx ═══
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Custom hook với error checking
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const userData = await res.json();
      setUser(userData);
      localStorage.setItem('token', userData.token);
      return userData;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══ Sử dụng ═══
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>👋 Xin chào, {user.name}</span>
          <button onClick={logout}>Đăng xuất</button>
        </>
      ) : (
        <a href="/login">Đăng nhập</a>
      )}
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p>⏳ Đang kiểm tra...</p>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
```

---

## 4. Multiple Contexts

```jsx
// ═══ Nhiều contexts cho các concerns khác nhau ═══
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ═══ Helper: Compose Providers ═══
function ComposeProviders({ providers, children }) {
  return providers.reduceRight(
    (child, Provider) => <Provider>{child}</Provider>,
    children
  );
}

// Sử dụng ComposeProviders
function App() {
  return (
    <ComposeProviders providers={[
      AuthProvider,
      ThemeProvider,
      LanguageProvider,
      NotificationProvider,
    ]}>
      <AppContent />
    </ComposeProviders>
  );
}
```

---

## 5. Context + useReducer (Mini Redux)

```jsx
// ═══ Kết hợp Context + Reducer cho state management ═══
const TodoContext = createContext(null);

const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.payload, done: false }];
    case 'TOGGLE':
      return state.map(t => t.id === action.payload ? { ...t, done: !t.done } : t);
    case 'DELETE':
      return state.filter(t => t.id !== action.payload);
    case 'CLEAR_DONE':
      return state.filter(t => !t.done);
    default:
      return state;
  }
};

function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  const value = useMemo(() => ({
    todos,
    dispatch,
    remaining: todos.filter(t => !t.done).length,
    total: todos.length,
  }), [todos]);

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be inside TodoProvider');
  return context;
}

// Components sử dụng
function AddTodo() {
  const [text, setText] = useState('');
  const { dispatch } = useTodos();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch({ type: 'ADD', payload: text.trim() });
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button type="submit">Thêm</button>
    </form>
  );
}

function TodoList() {
  const { todos, dispatch, remaining, total } = useTodos();

  return (
    <div>
      <p>Còn {remaining}/{total} việc</p>
      {todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => dispatch({ type: 'TOGGLE', payload: todo.id })}
          />
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => dispatch({ type: 'DELETE', payload: todo.id })}>🗑️</button>
        </div>
      ))}
      <button onClick={() => dispatch({ type: 'CLEAR_DONE' })}>Xóa đã hoàn thành</button>
    </div>
  );
}
```

---

## 6. Performance: Tách Context

```jsx
// ❌ Tất cả consumers re-render khi BẤT KỲ value nào thay đổi
const AppContext = createContext();

function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [locale, setLocale] = useState('vi');

  // Object mới MỖI render → TẤT CẢ consumers re-render
  return (
    <AppContext.Provider value={{ theme, setTheme, user, setUser, locale, setLocale }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ Tách thành contexts riêng biệt
// Thay đổi theme → chỉ theme consumers re-render
// Thay đổi user → chỉ auth consumers re-render

function App() {
  return (
    <ThemeProvider>    {/* Chỉ re-render khi theme đổi */}
      <AuthProvider>   {/* Chỉ re-render khi auth đổi */}
        <LocaleProvider> {/* Chỉ re-render khi locale đổi */}
          <AppContent />
        </LocaleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

---

## 7. Khi Nào Dùng Context vs Không

```
✅ NÊN dùng Context cho:
├── Theme (dark/light mode)
├── Authentication (user, login/logout)
├── Locale/Language (i18n)
├── UI state toàn cục (modal, sidebar, notifications)
└── Feature flags

❌ KHÔNG NÊN dùng Context cho:
├── State thay đổi thường xuyên (mỗi keystroke)
├── State chỉ 1-2 component dùng (props là đủ)
├── Complex state management (dùng Redux/Zustand)
└── Server state (dùng React Query/TanStack Query)
```

---

## 📝 Bài Tập

### Bài 1: Theme Context với nhiều themes
### Bài 2: Auth Context system đầy đủ (login, logout, register, profile)
### Bài 3: Language Context (đa ngôn ngữ vi/en/ja)
### Bài 4: Notification Context (toast notifications)

---

> **Bài trước:** [12 - Lifecycle ←](./12-lifecycle.md)  
> **Bài tiếp theo:** [14 - React Router →](./14-react-router.md)
