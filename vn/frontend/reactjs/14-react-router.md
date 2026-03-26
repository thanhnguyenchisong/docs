# Bài 14: React Router - Điều Hướng Trong SPA

## 📚 Mục tiêu bài học
- Cài đặt và cấu hình React Router v6+
- Route definitions, nested routes, dynamic routes
- Navigation (Link, NavLink, useNavigate)
- Route guards và protected routes
- Data loading patterns

---

## 1. Cài Đặt

```bash
npm install react-router-dom
```

## 2. Cấu Hình Cơ Bản

```jsx
// ═══ main.jsx ═══
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// ═══ App.jsx ═══
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div>
      {/* Navigation */}
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          🏠 Trang chủ
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
          ℹ️ Giới thiệu
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
          📦 Sản phẩm
        </NavLink>
      </nav>

      {/* Route Definitions */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
```

---

## 3. Dynamic Routes (Params)

```jsx
import { useParams, useSearchParams } from 'react-router-dom';

// URL: /products/42
function ProductDetail() {
  const { id } = useParams(); // { id: '42' }
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Giá: {product.price.toLocaleString('vi-VN')}đ</p>
    </div>
  );
}

// URL: /products?category=phone&sort=price&page=2
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  const updateFilters = (key, value) => {
    setSearchParams(prev => {
      prev.set(key, value);
      return prev;
    });
  };

  return (
    <div>
      <select value={category} onChange={e => updateFilters('category', e.target.value)}>
        <option value="all">Tất cả</option>
        <option value="phone">Điện thoại</option>
        <option value="laptop">Laptop</option>
      </select>

      <select value={sort} onChange={e => updateFilters('sort', e.target.value)}>
        <option value="name">Tên</option>
        <option value="price">Giá</option>
      </select>

      <p>Trang: {page}</p>
      <button onClick={() => updateFilters('page', page + 1)}>Trang sau</button>
    </div>
  );
}
```

---

## 4. Nested Routes

```jsx
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />

        {/* Nested Routes cho Dashboard */}
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// Layout chung - Outlet render route con
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <header><Navbar /></header>
      <main>
        <Outlet /> {/* Route con render ở đây */}
      </main>
      <footer><Footer /></footer>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <DashboardSidebar />
      </aside>
      <section className="dashboard-content">
        <Outlet /> {/* Dashboard route con render ở đây */}
      </section>
    </div>
  );
}
```

---

## 5. Programmatic Navigation

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect sau khi login
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (data) => {
    await login(data);
    navigate(from, { replace: true }); // replace: không lưu trong history
  };

  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
      <button type="submit">Đăng nhập</button>
    </form>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/products/${product.id}`)}>
      <h3>{product.name}</h3>
    </div>
  );
}

// Navigate options
navigate('/dashboard');           // Push mới
navigate('/dashboard', { replace: true }); // Replace hiện tại
navigate(-1);                     // Quay lại (back)
navigate(-2);                     // Quay lại 2 trang
navigate(1);                      // Tiến tới (forward)
navigate('/login', {
  state: { from: location }       // Truyền state
});
```

---

## 6. Protected Routes

```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">⏳ Đang kiểm tra đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login, lưu lại trang hiện tại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Sử dụng
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Overview />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin only */}
        <Route path="admin" element={
          <RoleGuard allowedRoles={['admin']}>
            <AdminPanel />
          </RoleGuard>
        } />
      </Route>
    </Routes>
  );
}
```

---

## 7. Lazy Loading Routes

```jsx
import { lazy, Suspense } from 'react';

// Lazy load - tải code khi cần
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<div className="loading">⏳ Đang tải trang...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 8. Hooks Tóm Tắt

| Hook | Mục đích | Ví dụ |
|------|---------|-------|
| `useParams()` | Lấy URL params | `/products/:id` → `{ id: '42' }` |
| `useSearchParams()` | Lấy/set query params | `?page=2&sort=name` |
| `useNavigate()` | Navigate programmatically | `navigate('/home')` |
| `useLocation()` | Lấy location object | `{ pathname, search, state }` |
| `useMatch()` | Kiểm tra route match | `useMatch('/about')` |

---

## 📝 Bài Tập

### Bài 1: Blog app với nested routes (posts, post detail, categories)
### Bài 2: E-commerce với: products list, detail, cart, checkout (protected)
### Bài 3: Admin dashboard với role-based access control
### Bài 4: Implement breadcrumbs tự động từ route hierarchy

---

> **Bài trước:** [13 - Context API ←](./13-context-api.md)  
> **Bài tiếp theo:** [15 - API Integration →](./15-api-integration.md)
