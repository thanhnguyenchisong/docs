# Bài 03: Components - Nền Tảng Của React

## 📚 Mục tiêu bài học
- Hiểu Component là gì và tại sao nó quan trọng
- Phân biệt Function Component và Class Component
- Biết cách tạo, export/import component
- Hiểu cách tổ chức và phân chia component

---

## 1. Component Là Gì?

**Component** là khối xây dựng cơ bản nhất của React. Mỗi component là một **phần UI độc lập, có thể tái sử dụng**, nó nhận đầu vào (props) và trả về React elements mô tả giao diện.

### Ví dụ trực quan:

```
┌──────────────────────────────────────────────┐
│  <App>                                       │
│  ┌──────────────────────────────────────┐    │
│  │  <Header>                             │    │
│  │  ┌─────────┐ ┌─────────────────────┐ │    │
│  │  │ <Logo>  │ │ <Navigation>        │ │    │
│  │  │         │ │ ┌────┐┌────┐┌────┐  │ │    │
│  │  │         │ │ │Link││Link││Link│  │ │    │
│  │  └─────────┘ │ └────┘└────┘└────┘  │ │    │
│  │              └─────────────────────┘ │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  <Main>                               │    │
│  │  ┌──────────────┐┌──────────────┐    │    │
│  │  │ <ProductCard> ││ <ProductCard>│    │    │
│  │  │  ┌────────┐  ││  ┌────────┐  │    │    │
│  │  │  │<Image> │  ││  │<Image> │  │    │    │
│  │  │  └────────┘  ││  └────────┘  │    │    │
│  │  │  <Title>     ││  <Title>     │    │    │
│  │  │  <Price>     ││  <Price>     │    │    │
│  │  │  <Button>    ││  <Button>    │    │    │
│  │  └──────────────┘└──────────────┘    │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │  <Footer>                             │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 2. Function Component (Chuẩn Hiện Đại)

### 2.1 Cú pháp cơ bản

```jsx
// ═══════════════════════════════════════
// Cách 1: Function Declaration
// ═══════════════════════════════════════
function Greeting() {
  return <h1>Xin Chào! 👋</h1>;
}

// ═══════════════════════════════════════
// Cách 2: Arrow Function (phổ biến)
// ═══════════════════════════════════════
const Greeting = () => {
  return <h1>Xin Chào! 👋</h1>;
};

// ═══════════════════════════════════════
// Cách 3: Arrow Function với implicit return
// (khi JSX chỉ có một biểu thức)
// ═══════════════════════════════════════
const Greeting = () => <h1>Xin Chào! 👋</h1>;

// ═══════════════════════════════════════
// Cách 4: Arrow Function với nhiều dòng JSX
// (dùng dấu ngoặc tròn)
// ═══════════════════════════════════════
const Greeting = () => (
  <div>
    <h1>Xin Chào! 👋</h1>
    <p>Chào mừng đến với React</p>
  </div>
);
```

### 2.2 Quy tắc đặt tên

```jsx
// ✅ ĐÚNG - PascalCase (viết hoa chữ cái đầu mỗi từ)
function UserProfile() { ... }
function NavigationBar() { ... }
function ProductCard() { ... }

// ❌ SAI - camelCase hoặc lowercase
function userProfile() { ... }   // React sẽ coi là HTML element
function navigation_bar() { ... } // Không theo convention

// ⚠️ Tại sao phải PascalCase?
// React phân biệt:
<div>       // → HTML element (lowercase)
<UserCard>  // → React Component (PascalCase)
```

### 2.3 Component với logic

```jsx
function WelcomeMessage() {
  // Logic JavaScript
  const currentHour = new Date().getHours();
  
  let greeting;
  let emoji;
  
  if (currentHour < 12) {
    greeting = 'Chào buổi sáng';
    emoji = '🌅';
  } else if (currentHour < 18) {
    greeting = 'Chào buổi chiều';
    emoji = '☀️';
  } else {
    greeting = 'Chào buổi tối';
    emoji = '🌙';
  }

  const date = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // JSX được return
  return (
    <div className="welcome">
      <h1>{emoji} {greeting}!</h1>
      <p>Hôm nay là {date}</p>
      <p>Bây giờ là {currentHour}:00</p>
    </div>
  );
}
```

---

## 3. Class Component (Legacy - Cần Biết)

> **⚠️ Lưu ý:** Class Components là cách viết cũ. React team khuyến nghị sử dụng **Function Components + Hooks** cho tất cả code mới. Tuy nhiên, bạn cần hiểu Class Components vì nhiều codebase cũ vẫn sử dụng.

### 3.1 Cú pháp cơ bản

```jsx
import React, { Component } from 'react';

class Greeting extends Component {
  render() {
    return <h1>Xin Chào! 👋</h1>;
  }
}

export default Greeting;
```

### 3.2 Class Component với state

```jsx
import React, { Component } from 'react';

class Counter extends Component {
  constructor(props) {
    super(props); // BẮT BUỘC gọi super(props)
    this.state = {
      count: 0
    };
  }

  // Method phải bind `this` hoặc dùng arrow function
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };

  render() {
    return (
      <div>
        <h2>Đếm: {this.state.count}</h2>
        <button onClick={this.increment}>+1</button>
        <button onClick={this.decrement}>-1</button>
      </div>
    );
  }
}
```

### 3.3 So sánh Function vs Class Component

```jsx
// ════════════════════════════════════
// CÙNG MỘT COMPONENT - 2 cách viết
// ════════════════════════════════════

// 🟢 Function Component (Hiện đại - NÊN DÙNG)
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Đếm: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  );
}

// 🔴 Class Component (Cũ - CHỈ ĐỌC HIỂU)
import { Component } from 'react';

class Counter extends Component {
  state = { count: 0 };

  render() {
    return (
      <div>
        <h2>Đếm: {this.state.count}</h2>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>+1</button>
        <button onClick={() => this.setState({ count: this.state.count - 1 })}>-1</button>
      </div>
    );
  }
}
```

| Tiêu chí | Function Component | Class Component |
|----------|-------------------|-----------------|
| Cú pháp | Đơn giản, ngắn gọn | Phức tạp, dài dòng |
| State | `useState` hook | `this.state` + `this.setState` |
| Lifecycle | `useEffect` hook | Nhiều methods riêng biệt |
| `this` | Không cần | Phải hiểu và bind |
| Performance | Tốt hơn (nhẹ hơn) | Nặng hơn |
| React team | ✅ Khuyến nghị | ⚠️ Legacy |
| Hooks | ✅ Hỗ trợ | ❌ Không hỗ trợ |

---

## 4. Export & Import Components

### 4.1 Default Export

```jsx
// ═══ File: components/Header.jsx ═══
function Header() {
  return (
    <header>
      <h1>My Website</h1>
    </header>
  );
}

// Default export - Mỗi file chỉ có 1 default export
export default Header;

// ═══ File: App.jsx ═══
// Import default - Tên có thể tùy ý
import Header from './components/Header';
import MyHeader from './components/Header'; // Cũng OK, tên tùy ý
```

### 4.2 Named Export

```jsx
// ═══ File: components/UI.jsx ═══
// Named export - Có thể nhiều trong 1 file
export function Button({ children }) {
  return <button className="btn">{children}</button>;
}

export function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Badge({ text, color }) {
  return <span className={`badge badge-${color}`}>{text}</span>;
}

// ═══ File: App.jsx ═══
// Import named - Tên PHẢI giống hệt
import { Button, Card, Badge } from './components/UI';

// Import tất cả named exports
import * as UI from './components/UI';
// Sử dụng: <UI.Button>, <UI.Card>, <UI.Badge>

// Rename khi import
import { Button as PrimaryButton } from './components/UI';
```

### 4.3 Kết hợp Default và Named Export

```jsx
// ═══ File: components/Form.jsx ═══
// Default export
export default function Form({ children }) {
  return <form className="form">{children}</form>;
}

// Named exports
export function Input({ label, ...props }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

export function Select({ label, options, ...props }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select {...props}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ═══ File: App.jsx ═══
import Form, { Input, Select } from './components/Form';
```

---

## 5. Tổ Chức Component

### 5.1 Cấu trúc thư mục cơ bản

```
src/
├── components/          # Components tái sử dụng
│   ├── common/         # Components dùng chung (Button, Modal, etc.)
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── Input.jsx
│   ├── layout/         # Components layout (Header, Footer, etc.)
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   └── features/       # Components theo tính năng
│       ├── auth/
│       │   ├── LoginForm.jsx
│       │   └── RegisterForm.jsx
│       └── products/
│           ├── ProductCard.jsx
│           └── ProductList.jsx
├── pages/              # Components trang (route-level)
│   ├── Home.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── App.jsx
└── main.jsx
```

### 5.2 Cấu trúc thư mục nâng cao (Feature-based)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── LoginForm.css
│   │   │   └── LoginForm.test.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── authService.js
│   │   └── index.js        # Barrel file (re-export)
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.js
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── constants/
├── App.jsx
└── main.jsx
```

### 5.3 Barrel File Pattern

```jsx
// ═══ File: components/common/index.js ═══
// Re-export tất cả components, giúp import gọn hơn
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Input } from './Input';
export { default as Card } from './Card';

// ═══ File: App.jsx ═══
// Thay vì import từng file
// import Button from './components/common/Button';
// import Modal from './components/common/Modal';

// Import gọn gàng từ một nơi
import { Button, Modal, Input, Card } from './components/common';
```

---

## 6. Component Composition (Kết Hợp Component)

### 6.1 Nesting Components

```jsx
// Components nhỏ, chuyên biệt
function Avatar({ src, alt }) {
  return <img src={src} alt={alt} className="avatar" />;
}

function UserName({ name }) {
  return <span className="username">{name}</span>;
}

function UserStatus({ isOnline }) {
  return (
    <span className={`status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </span>
  );
}

// Component kết hợp
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatar} alt={user.name} />
      <div className="user-info">
        <UserName name={user.name} />
        <UserStatus isOnline={user.isOnline} />
      </div>
    </div>
  );
}

// Component cấp cao hơn
function UserList({ users }) {
  return (
    <div className="user-list">
      <h2>Danh sách thành viên</h2>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// Sử dụng trong App
function App() {
  const users = [
    { id: 1, name: 'Nguyễn Văn A', avatar: '/avatars/1.jpg', isOnline: true },
    { id: 2, name: 'Trần Thị B', avatar: '/avatars/2.jpg', isOnline: false },
    { id: 3, name: 'Lê Văn C', avatar: '/avatars/3.jpg', isOnline: true },
  ];

  return <UserList users={users} />;
}
```

### 6.2 Children Pattern

```jsx
// Component nhận children (nội dung bên trong tag)
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// Sử dụng
function App() {
  return (
    <div>
      <Card title="Thông Tin Cá Nhân">
        <p>Tên: Nguyễn Văn A</p>
        <p>Tuổi: 25</p>
        <img src="/avatar.jpg" alt="Avatar" />
      </Card>

      <Card title="Kỹ Năng">
        <ul>
          <li>React</li>
          <li>TypeScript</li>
          <li>Node.js</li>
        </ul>
      </Card>
    </div>
  );
}
```

---

## 7. Component Thuần (Pure Component)

```jsx
// ✅ Pure Component - Cùng input → Cùng output, không side effects
function PriceDisplay({ amount, currency }) {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
  
  return <span className="price">{formatted}</span>;
}

// ❌ Impure Component - Kết quả thay đổi mỗi lần gọi
function RandomGreeting() {
  // Side effect: Math.random() cho kết quả khác nhau mỗi lần
  const greetings = ['Xin chào!', 'Hello!', 'Bonjour!', 'Hola!'];
  const random = greetings[Math.floor(Math.random() * greetings.length)];
  
  return <h1>{random}</h1>;
}

// ❌ Impure Component - Mutate bên ngoài
let callCount = 0;
function TrackingComponent() {
  callCount++; // Side effect: thay đổi biến bên ngoài
  return <p>Đã render {callCount} lần</p>;
}
```

> **Quy tắc:** Giữ component **thuần** (pure) nhất có thể. Side effects nên được quản lý bằng `useEffect` hook (sẽ học ở bài sau).

---

## 8. Ví Dụ Tổng Hợp: Landing Page

```jsx
// ═══ components/Navbar.jsx ═══
export default function Navbar() {
  const navLinks = [
    { label: 'Trang chủ', href: '#home' },
    { label: 'Sản phẩm', href: '#products' },
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Liên hệ', href: '#contact' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🚀 ReactShop</h2>
      </div>
      <ul className="navbar-links">
        {navLinks.map((link, index) => (
          <li key={index}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ═══ components/Hero.jsx ═══
export default function Hero() {
  return (
    <section className="hero" id="home">
      <h1>Chào mừng đến với ReactShop</h1>
      <p>Nơi bạn tìm thấy mọi thứ cần thiết cho cuộc sống</p>
      <button className="btn-primary">Khám Phá Ngay</button>
    </section>
  );
}

// ═══ components/ProductCard.jsx ═══
export default function ProductCard({ name, price, image, rating }) {
  const formatPrice = (p) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const renderStars = (r) => '⭐'.repeat(Math.round(r));

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3>{name}</h3>
        <p className="product-rating">{renderStars(rating)} ({rating})</p>
        <p className="product-price">{formatPrice(price)}</p>
        <button className="btn-add-cart">🛒 Thêm vào giỏ</button>
      </div>
    </div>
  );
}

// ═══ components/Footer.jsx ═══
export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <p>© {year} ReactShop. Xây dựng với ❤️ và React.</p>
    </footer>
  );
}

// ═══ App.jsx ═══
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';

function App() {
  const products = [
    { id: 1, name: 'Laptop Pro X', price: 25000000, image: '/laptop.jpg', rating: 4.5 },
    { id: 2, name: 'Tai nghe Wireless', price: 1500000, image: '/headphone.jpg', rating: 4.8 },
    { id: 3, name: 'Bàn phím cơ RGB', price: 2000000, image: '/keyboard.jpg', rating: 4.2 },
  ];

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <section className="products-section" id="products">
        <h2>Sản Phẩm Nổi Bật</h2>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default App;
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Component Đơn Giản
Tạo các components: `Header`, `Footer`, `Sidebar` và kết hợp trong `App`.

### Bài 2: Component Tái Sử Dụng
Tạo component `Alert` có thể nhận type (success, warning, error) và hiển thị với style khác nhau.

### Bài 3: Component Composition
Xây dựng layout trang blog với: `BlogHeader`, `BlogPost`, `BlogSidebar`, `BlogFooter`. Mỗi `BlogPost` có `PostTitle`, `PostMeta`, `PostContent`.

### Bài 4: File Organization
Tạo cấu trúc thư mục dự án e-commerce với các component phân chia theo tính năng.

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| Component | Khối UI độc lập, tái sử dụng |
| Function Component | Hàm JS trả về JSX (chuẩn hiện đại) |
| Class Component | Class extends Component (legacy) |
| PascalCase | Quy tắc đặt tên component |
| Default Export | Một export mặc định per file |
| Named Export | Nhiều export có tên per file |
| Composition | Kết hợp components nhỏ thành lớn |
| Pure Component | Cùng input → cùng output |

---

> **Bài trước:** [02 - JSX Cơ Bản ←](./02-jsx-co-ban.md)  
> **Bài tiếp theo:** [04 - Props →](./04-props.md)
