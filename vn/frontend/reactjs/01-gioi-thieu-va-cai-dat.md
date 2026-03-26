# Bài 01: Giới Thiệu React & Cài Đặt Môi Trường

## 📚 Mục tiêu bài học
- Hiểu React là gì và tại sao nên dùng React
- Cài đặt môi trường phát triển
- Tạo project React đầu tiên
- Hiểu cấu trúc project React

---

## 1. React Là Gì?

**React** (hay ReactJS) là một **thư viện JavaScript** mã nguồn mở được phát triển bởi **Facebook** (nay là Meta) vào năm 2013. React được sử dụng để xây dựng giao diện người dùng (UI), đặc biệt là các ứng dụng web đơn trang (Single Page Application - SPA).

### Đặc điểm chính của React:

```
React
├── Component-Based    → Xây dựng UI từ các thành phần nhỏ, tái sử dụng
├── Declarative        → Mô tả UI muốn hiển thị, React lo phần còn lại
├── Virtual DOM        → Cập nhật UI hiệu quả thông qua DOM ảo
├── Unidirectional     → Luồng dữ liệu một chiều (one-way data flow)
├── JSX               → Cú pháp mở rộng cho phép viết HTML trong JS
└── React Native      → Có thể phát triển mobile app
```

### Tại sao chọn React?

| Tiêu chí | React | Vanilla JS | jQuery |
|----------|-------|------------|--------|
| Hiệu suất | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Tái sử dụng code | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Cộng đồng | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Học tập | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Scale lớn | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Job market | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 2. Virtual DOM - Khái Niệm Quan Trọng Nhất

### DOM (Document Object Model) là gì?

DOM là cấu trúc cây đại diện cho trang HTML trong bộ nhớ trình duyệt:

```
document
└── html
    ├── head
    │   └── title
    └── body
        ├── header
        │   └── h1
        ├── main
        │   ├── p
        │   └── ul
        │       ├── li
        │       └── li
        └── footer
```

### Vấn đề với Real DOM

Khi thay đổi DOM trực tiếp:
1. Trình duyệt phải **tính toán lại layout** (reflow)
2. **Vẽ lại** các pixel trên màn hình (repaint)  
3. Với ứng dụng phức tạp, việc này **rất chậm**

### Virtual DOM giải quyết như thế nào?

```
State thay đổi
       │
       ▼
┌─────────────────┐
│  React tạo      │
│  Virtual DOM mới│ ← Cây đối tượng JS nhẹ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   So sánh với   │
│ Virtual DOM cũ  │ ← Diffing Algorithm
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chỉ cập nhật   │
│  phần thay đổi  │ ← Reconciliation
│  trên Real DOM  │
└─────────────────┘
```

**Ví dụ minh họa:**

```javascript
// Giả sử bạn có 1000 item trong danh sách
// Chỉ item thứ 5 thay đổi

// ❌ Vanilla JS - Cập nhật toàn bộ danh sách
document.getElementById('list').innerHTML = generateAllItems();

// ✅ React - Chỉ cập nhật item thứ 5
// React tự động phát hiện và chỉ thay đổi phần cần thiết
setItems(prev => prev.map((item, i) => i === 4 ? newItem : item));
```

---

## 3. Cài Đặt Môi Trường

### 3.1 Cài đặt Node.js

```bash
# Kiểm tra Node.js đã cài chưa
node --version    # Cần v18.0.0 trở lên
npm --version     # Đi kèm Node.js

# Nếu chưa có, tải từ: https://nodejs.org/
# Chọn phiên bản LTS (Long Term Support)
```

### 3.2 Cài đặt Code Editor

Khuyến nghị sử dụng **Visual Studio Code** với các extension:
- **ES7+ React/Redux/React-Native snippets** - Snippets hữu ích
- **Prettier** - Format code tự động
- **ESLint** - Kiểm tra lỗi code
- **Auto Rename Tag** - Tự đổi tên tag đóng/mở
- **Bracket Pair Colorizer** - Tô màu ngoặc

### 3.3 Cài đặt React Developer Tools

- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- Firefox: Tương tự trên Firefox Add-ons

---

## 4. Tạo Project React Đầu Tiên

### 4.1 Sử dụng Vite (Khuyến nghị - 2025+)

```bash
# Tạo project mới với Vite
npm create vite@latest my-first-react -- --template react

# Di chuyển vào thư mục project
cd my-first-react

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

> **Tại sao Vite thay vì Create React App?**
> - Create React App (CRA) đã **không còn được maintain** từ 2023
> - Vite nhanh hơn **10-20x** khi dev server startup
> - Hot Module Replacement (HMR) gần như tức thì
> - Build production nhanh hơn nhiều

### 4.2 Sử dụng Next.js (Cho ứng dụng production)

```bash
# Tạo project Next.js
npx create-next-app@latest my-next-app

# Chạy development server
cd my-next-app
npm run dev
```

---

## 5. Cấu Trúc Project React (Vite)

```
my-first-react/
├── node_modules/          # Thư viện bên thứ 3
├── public/                # File tĩnh (không qua bundler)
│   └── vite.svg          # Logo Vite
├── src/                   # Source code chính
│   ├── assets/           # Hình ảnh, fonts, etc.
│   │   └── react.svg
│   ├── App.css           # Style cho component App
│   ├── App.jsx           # Component chính
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point - nơi React mount vào DOM
├── .eslintrc.cjs         # Cấu hình ESLint
├── .gitignore            # Files Git bỏ qua
├── index.html            # File HTML chính
├── package.json          # Thông tin project & dependencies
├── package-lock.json     # Lock file cho dependencies
└── vite.config.js        # Cấu hình Vite
```

### Giải thích các file quan trọng:

#### `index.html`
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ứng Dụng React Đầu Tiên</title>
  </head>
  <body>
    <!-- 👇 React sẽ render toàn bộ ứng dụng vào đây -->
    <div id="root"></div>
    <!-- 👇 Entry point JavaScript -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### `src/main.jsx` - Entry Point
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tạo root và render component App vào element có id="root"
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* StrictMode giúp phát hiện lỗi tiềm ẩn trong development */}
    <App />
  </React.StrictMode>,
)
```

#### `src/App.jsx` - Component Chính
```jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Xin Chào React! 🚀</h1>
      <p>Đây là ứng dụng React đầu tiên của tôi</p>
      
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          Đã bấm {count} lần
        </button>
      </div>
    </div>
  )
}

export default App
```

---

## 6. Hiểu Cách React Hoạt Động

### Luồng hoạt động cơ bản:

```
1. Trình duyệt load index.html
              │
              ▼
2. index.html load main.jsx (entry point)
              │
              ▼
3. main.jsx import App component
              │
              ▼
4. ReactDOM.createRoot() tạo React root
              │
              ▼
5. root.render(<App />) render App vào DOM
              │
              ▼
6. React chuyển JSX → React Elements (JS objects)
              │
              ▼
7. React tạo Virtual DOM từ React Elements
              │
              ▼
8. React so sánh Virtual DOM với Real DOM
              │
              ▼
9. React cập nhật Real DOM (chỉ phần thay đổi)
              │
              ▼
10. Trình duyệt hiển thị giao diện
```

### React Element vs React Component:

```jsx
// React Element - Đối tượng JS mô tả UI
const element = <h1>Hello World</h1>;
// Thực chất là:
// React.createElement('h1', null, 'Hello World')
// → { type: 'h1', props: { children: 'Hello World' } }

// React Component - Hàm trả về React Elements
function Greeting() {
  return <h1>Hello World</h1>;
}
// Sử dụng: <Greeting />
```

---

## 7. Công Cụ Phát Triển

### 7.1 React Developer Tools

Sau khi cài extension, mở Chrome DevTools sẽ thấy 2 tab mới:

- **⚛️ Components**: Xem cây component, props, state
- **⚛️ Profiler**: Đo performance rendering

### 7.2 Các lệnh npm thường dùng

```bash
# Chạy development server (có hot reload)
npm run dev

# Build production
npm run build

# Preview bản production locally
npm run preview

# Kiểm tra lỗi code
npm run lint

# Cài thêm thư viện
npm install <tên-thư-viện>

# Gỡ bỏ thư viện
npm uninstall <tên-thư-viện>
```

---

## 8. Hello World - Bước Đầu Tiên

Hãy thay đổi file `App.jsx` thành:

```jsx
function App() {
  // Khai báo biến JavaScript
  const name = 'React Developer'
  const currentYear = new Date().getFullYear()
  
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {/* Sử dụng biến trong JSX bằng {} */}
      <h1>🚀 Xin Chào, {name}!</h1>
      <p>Hôm nay là năm {currentYear}</p>
      <p>Bạn đang học React - Thư viện UI phổ biến nhất thế giới</p>
      
      {/* Biểu thức JavaScript */}
      <p>2 + 3 = {2 + 3}</p>
      <p>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
    </div>
  )
}

export default App
```

Lưu file và xem kết quả trên trình duyệt - **thay đổi sẽ hiển thị ngay lập tức** nhờ Hot Module Replacement (HMR).

---

## 9. package.json Giải Thích

```json
{
  "name": "my-first-react",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",              // Chạy dev server
    "build": "vite build",       // Build production
    "lint": "eslint .",          // Kiểm tra code
    "preview": "vite preview"    // Preview bản build
  },
  "dependencies": {
    "react": "^19.0.0",         // Thư viện React core
    "react-dom": "^19.0.0"      // React cho web (DOM)
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",  // Vite plugin cho React
    "eslint": "^9.0.0",                // Linter
    "vite": "^6.0.0"                   // Build tool
  }
}
```

> **dependencies** vs **devDependencies**:
> - `dependencies`: Cần thiết khi ứng dụng chạy (production)
> - `devDependencies`: Chỉ cần khi phát triển (development)

---

## 📝 Bài Tập Thực Hành

### Bài 1: Tạo Project
Tạo một project React mới bằng Vite, chạy thành công trên trình duyệt.

### Bài 2: Tùy Chỉnh Giao Diện
Sửa `App.jsx` để hiển thị:
- Tên của bạn
- Sở thích của bạn (dưới dạng danh sách)
- Một hình ảnh (có thể dùng URL bất kỳ)

### Bài 3: Khám Phá DevTools
- Cài React Developer Tools
- Mở tab Components và xem cây component
- Thử thay đổi state trong DevTools

### Bài 4: Tìm Hiểu Vite
- Thử thay đổi code và quan sát HMR
- Chạy `npm run build` và xem thư mục `dist/`
- So sánh kích thước file development vs production

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| React | Thư viện JS xây dựng UI, phát triển bởi Meta |
| Virtual DOM | Bản sao nhẹ của Real DOM, giúp cập nhật UI hiệu quả |
| JSX | Cú pháp cho phép viết HTML-like trong JavaScript |
| Component | Khối xây dựng cơ bản của React UI |
| Vite | Build tool hiện đại, nhanh, thay thế CRA |
| HMR | Hot Module Replacement - cập nhật code không cần reload |

---

> **Bài tiếp theo:** [02 - JSX Cơ Bản →](./02-jsx-co-ban.md)
