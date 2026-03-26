# Bài 07: Conditional Rendering - Render Có Điều Kiện

## 📚 Mục tiêu bài học
- Nắm vững tất cả kỹ thuật render có điều kiện
- Biết khi nào dùng kỹ thuật nào
- Xử lý loading, error, empty states
- Pattern guards và early return

---

## 1. If/Else Với Return Sớm (Early Return)

```jsx
function UserGreeting({ user, isLoading, error }) {
  // Guard clauses - xử lý các trường hợp đặc biệt trước
  if (isLoading) {
    return <div className="spinner">⏳ Đang tải...</div>;
  }

  if (error) {
    return <div className="error">❌ Lỗi: {error.message}</div>;
  }

  if (!user) {
    return <div className="empty">👤 Chưa đăng nhập</div>;
  }

  // Happy path - trường hợp chính
  return (
    <div className="greeting">
      <h1>Xin chào, {user.name}! 👋</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

> **💡 Best Practice:** Sử dụng **early return** cho các trường hợp ngoại lệ (loading, error, empty) ở đầu component, để code chính nằm ở cuối dễ đọc hơn.

---

## 2. Ternary Operator (Toán Tử Ba Ngôi)

Dùng khi cần **chọn giữa 2 options** ngay trong JSX.

```jsx
function AuthButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button className="btn-logout">🚪 Đăng Xuất</button>
      ) : (
        <button className="btn-login">🔑 Đăng Nhập</button>
      )}
    </div>
  );
}

// Ternary cho text đơn giản
function StatusBadge({ isActive }) {
  return (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
      {isActive ? '🟢 Hoạt động' : '🔴 Ngừng'}
    </span>
  );
}

// Ternary cho className
function Card({ variant }) {
  return (
    <div className={`card ${variant === 'featured' ? 'card-featured' : 'card-normal'}`}>
      {variant === 'featured' ? (
        <div className="card-ribbon">⭐ Nổi bật</div>
      ) : null}
    </div>
  );
}
```

### ⚠️ Tránh lồng ternary quá sâu

```jsx
// ❌ Khó đọc - Ternary lồng nhau
function Status({ status }) {
  return (
    <span>
      {status === 'active' ? '🟢' : status === 'pending' ? '🟡' : status === 'inactive' ? '🔴' : '⚪'}
    </span>
  );
}

// ✅ Dễ đọc - Dùng object mapping hoặc hàm
function Status({ status }) {
  const statusConfig = {
    active: { icon: '🟢', label: 'Hoạt động', color: 'green' },
    pending: { icon: '🟡', label: 'Chờ duyệt', color: 'orange' },
    inactive: { icon: '🔴', label: 'Ngừng', color: 'red' },
    default: { icon: '⚪', label: 'Không rõ', color: 'gray' }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <span style={{ color: config.color }}>
      {config.icon} {config.label}
    </span>
  );
}
```

---

## 3. Logical AND (&&) - Short-circuit

Dùng khi **chỉ hiển thị hoặc không**, không có else.

```jsx
function Notifications({ messages, isAdmin }) {
  return (
    <div>
      {/* Hiển thị badge nếu có tin nhắn */}
      {messages.length > 0 && (
        <span className="badge">{messages.length} tin nhắn mới</span>
      )}

      {/* Hiển thị panel admin nếu là admin */}
      {isAdmin && (
        <div className="admin-panel">
          🛡️ Bạn có quyền quản trị
        </div>
      )}

      {/* ⚠️ CHÚ Ý với falsy values */}
      {/* ❌ SAI - 0 sẽ hiển thị trên màn hình */}
      {messages.length && <p>Có tin nhắn</p>}

      {/* ✅ ĐÚNG - Chuyển thành boolean */}
      {messages.length > 0 && <p>Có tin nhắn</p>}
      {!!messages.length && <p>Có tin nhắn</p>}
      {Boolean(messages.length) && <p>Có tin nhắn</p>}
    </div>
  );
}
```

---

## 4. Logical OR (||) và Nullish Coalescing (??)

```jsx
function UserProfile({ user }) {
  return (
    <div>
      {/* || trả về giá trị đầu tiên truthy */}
      <h2>{user.displayName || user.email || 'Ẩn danh'}</h2>

      {/* ?? chỉ check null/undefined (KHÔNG check 0, '', false) */}
      <p>Điểm: {user.score ?? 'Chưa có'}</p>
      {/* Nếu score = 0, hiển thị 0 (không phải 'Chưa có') */}
      {/* Nếu dùng ||, score = 0 sẽ hiển thị 'Chưa có' - SAI! */}

      <p>Level: {user.level ?? 1}</p>
      <img src={user.avatar ?? '/default-avatar.png'} alt="Avatar" />
    </div>
  );
}
```

---

## 5. Switch Case / Object Mapping

### 5.1 Switch trong component riêng

```jsx
function AlertMessage({ type, message }) {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { bg: '#d4edda', color: '#155724', icon: '✅' };
      case 'warning':
        return { bg: '#fff3cd', color: '#856404', icon: '⚠️' };
      case 'error':
        return { bg: '#f8d7da', color: '#721c24', icon: '❌' };
      case 'info':
        return { bg: '#d1ecf1', color: '#0c5460', icon: 'ℹ️' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', icon: '📝' };
    }
  };

  const style = getAlertStyle();

  return (
    <div style={{
      backgroundColor: style.bg,
      color: style.color,
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px'
    }}>
      {style.icon} {message}
    </div>
  );
}
```

### 5.2 Object Mapping (Khuyến nghị)

```jsx
// ✅ Clean, extensible, dễ maintain
const ALERT_CONFIG = {
  success: { bg: '#d4edda', color: '#155724', icon: '✅' },
  warning: { bg: '#fff3cd', color: '#856404', icon: '⚠️' },
  error:   { bg: '#f8d7da', color: '#721c24', icon: '❌' },
  info:    { bg: '#d1ecf1', color: '#0c5460', icon: 'ℹ️' },
};

function AlertMessage({ type = 'info', message }) {
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.info;

  return (
    <div style={{
      backgroundColor: config.bg,
      color: config.color,
      padding: '16px',
      borderRadius: '8px'
    }}>
      {config.icon} {message}
    </div>
  );
}
```

### 5.3 Component Mapping

```jsx
// Map component dựa trên type
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const FORM_COMPONENTS = {
  login: LoginForm,
  register: RegisterForm,
  forgot: ForgotPasswordForm,
};

function AuthPage({ formType }) {
  const FormComponent = FORM_COMPONENTS[formType];

  if (!FormComponent) {
    return <p>Form không hợp lệ</p>;
  }

  return (
    <div className="auth-page">
      <FormComponent />
    </div>
  );
}
```

---

## 6. IIFE Pattern (Immediately Invoked Function Expression)

Dùng khi cần logic phức tạp ngay trong JSX (nhưng hãy ưu tiên tách hàm riêng):

```jsx
function Dashboard({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* IIFE cho logic phức tạp trong JSX */}
      {(() => {
        if (!user) return <p>Vui lòng đăng nhập</p>;
        if (user.role === 'admin') return <AdminPanel />;
        if (user.role === 'moderator') return <ModeratorPanel />;
        if (user.isPremium) return <PremiumDashboard />;
        return <BasicDashboard />;
      })()}
    </div>
  );
}

// ✅ Tốt hơn: Tách thành hàm hoặc component riêng
function Dashboard({ user }) {
  const renderDashboardContent = () => {
    if (!user) return <p>Vui lòng đăng nhập</p>;
    if (user.role === 'admin') return <AdminPanel />;
    if (user.role === 'moderator') return <ModeratorPanel />;
    if (user.isPremium) return <PremiumDashboard />;
    return <BasicDashboard />;
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {renderDashboardContent()}
    </div>
  );
}
```

---

## 7. Conditional Rendering Patterns Thực Tế

### 7.1 Loading / Error / Empty / Data States

```jsx
function DataDisplay({ data, isLoading, error }) {
  // Loading state
  if (isLoading) {
    return (
      <div className="loading-skeleton">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-state">
        <h3>😵 Đã xảy ra lỗi</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          🔄 Thử lại
        </button>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <h3>📭 Không có dữ liệu</h3>
        <p>Hãy thêm mục mới để bắt đầu</p>
        <button>➕ Thêm mới</button>
      </div>
    );
  }

  // Success state - Có dữ liệu
  return (
    <div className="data-list">
      {data.map(item => (
        <div key={item.id} className="data-item">
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 7.2 Show/Hide với CSS vs Conditional Render

```jsx
function Tabs() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div>
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
        <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
        <button onClick={() => setActiveTab('tab3')}>Tab 3</button>
      </div>

      {/* Cách 1: Conditional Render - Unmount/Mount lại component */}
      {/* Ưu: Tiết kiệm memory. Nhược: Mất state khi chuyển tab */}
      {activeTab === 'tab1' && <Tab1Content />}
      {activeTab === 'tab2' && <Tab2Content />}
      {activeTab === 'tab3' && <Tab3Content />}

      {/* Cách 2: CSS Display - Ẩn/Hiện bằng CSS */}
      {/* Ưu: Giữ state, nhanh hơn. Nhược: Tốn memory hơn */}
      <div style={{ display: activeTab === 'tab1' ? 'block' : 'none' }}>
        <Tab1Content />
      </div>
      <div style={{ display: activeTab === 'tab2' ? 'block' : 'none' }}>
        <Tab2Content />
      </div>
      <div style={{ display: activeTab === 'tab3' ? 'block' : 'none' }}>
        <Tab3Content />
      </div>
    </div>
  );
}
```

### 7.3 Permission-based Rendering

```jsx
function PermissionGate({ user, requiredRole, children, fallback = null }) {
  const ROLE_HIERARCHY = {
    admin: 3,
    moderator: 2,
    user: 1,
    guest: 0
  };

  const userLevel = ROLE_HIERARCHY[user?.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  if (userLevel >= requiredLevel) {
    return children;
  }

  return fallback;
}

// Sử dụng
function AdminPage({ user }) {
  return (
    <div>
      <h1>Trang quản trị</h1>

      {/* Chỉ admin thấy */}
      <PermissionGate user={user} requiredRole="admin">
        <button>🗑️ Xóa tất cả dữ liệu</button>
      </PermissionGate>

      {/* Moderator trở lên thấy */}
      <PermissionGate
        user={user}
        requiredRole="moderator"
        fallback={<p>Bạn cần quyền moderator</p>}
      >
        <button>📝 Duyệt bài viết</button>
      </PermissionGate>

      {/* Tất cả user thấy */}
      <PermissionGate user={user} requiredRole="user">
        <button>👤 Xem hồ sơ</button>
      </PermissionGate>
    </div>
  );
}
```

---

## 8. Bảng Tóm Tắt: Khi Nào Dùng Gì?

| Kỹ thuật | Khi nào dùng | Ví dụ |
|----------|-------------|-------|
| `if/else` + early return | Loading, error, empty states | Guard clauses |
| Ternary `? :` | Chọn giữa 2 options | Login/Logout button |
| `&&` | Hiển thị hoặc không | Badge notification |
| `\|\|` / `??` | Giá trị fallback | Default avatar |
| Object mapping | Nhiều options dựa trên key | Status badges, tabs |
| Component mapping | Render component khác nhau theo type | Form types |
| IIFE | Logic phức tạp inline (hiếm dùng) | Nhiều điều kiện |
| CSS display | Giữ state khi show/hide | Tabs, accordions |

---

## 📝 Bài Tập Thực Hành

### Bài 1: Multi-step Form
Form nhiều bước: Step 1 (Thông tin), Step 2 (Địa chỉ), Step 3 (Xác nhận). Render form tương ứng với step hiện tại.

### Bài 2: User Dashboard
Dashboard hiển thị khác nhau theo role: Admin (full controls), Editor (edit only), Viewer (read only).

### Bài 3: Weather Display
Hiển thị icon và background khác nhau theo thời tiết: sunny, rainy, cloudy, snowy, stormy.

### Bài 4: Data Table với States
Bảng dữ liệu với đầy đủ states: loading skeleton, error retry, empty state, và hiển thị data.

---

> **Bài trước:** [06 - Event Handling ←](./06-event-handling.md)  
> **Bài tiếp theo:** [08 - Lists & Keys →](./08-lists-va-keys.md)
