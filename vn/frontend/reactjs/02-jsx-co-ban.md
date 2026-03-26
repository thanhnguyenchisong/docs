# Bài 02: JSX Cơ Bản

## 📚 Mục tiêu bài học
- Hiểu JSX là gì và tại sao React sử dụng JSX
- Nắm vững cú pháp JSX
- Biết cách nhúng biểu thức JavaScript trong JSX
- Hiểu Fragments và cách sử dụng

---

## 1. JSX Là Gì?

**JSX** (JavaScript XML) là một phần mở rộng cú pháp cho JavaScript, cho phép viết code trông giống HTML bên trong JavaScript.

```jsx
// Đây là JSX
const element = <h1>Xin Chào React!</h1>;

// React chuyển đổi thành (bằng Babel/SWC)
const element = React.createElement('h1', null, 'Xin Chào React!');

// Kết quả là một JavaScript Object
// {
//   type: 'h1',
//   props: {
//     children: 'Xin Chào React!'
//   }
// }
```

> **Lưu ý:** JSX **không phải HTML**, nó là JavaScript! Trình biên dịch (compiler) sẽ chuyển JSX thành các lời gọi `React.createElement()`.

---

## 2. Quy Tắc Cơ Bản Của JSX

### 2.1 Phải có một element gốc bao bọc

```jsx
// ❌ SAI - Nhiều element gốc
function App() {
  return (
    <h1>Tiêu đề</h1>
    <p>Nội dung</p>
  );
}

// ✅ ĐÚNG - Một element gốc
function App() {
  return (
    <div>
      <h1>Tiêu đề</h1>
      <p>Nội dung</p>
    </div>
  );
}

// ✅ ĐÚNG - Sử dụng Fragment (không tạo thêm DOM node)
function App() {
  return (
    <>
      <h1>Tiêu đề</h1>
      <p>Nội dung</p>
    </>
  );
}
```

### 2.2 Tất cả tag phải được đóng

```jsx
// ❌ SAI - Tag không đóng
<img src="photo.jpg">
<br>
<input type="text">

// ✅ ĐÚNG - Self-closing tags
<img src="photo.jpg" />
<br />
<input type="text" />
```

### 2.3 Sử dụng `className` thay vì `class`

```jsx
// ❌ SAI - `class` là từ khóa JavaScript
<div class="container">

// ✅ ĐÚNG - Sử dụng `className`
<div className="container">
```

### 2.4 Sử dụng `htmlFor` thay vì `for`

```jsx
// ❌ SAI
<label for="email">Email:</label>

// ✅ ĐÚNG
<label htmlFor="email">Email:</label>
```

### 2.5 Style inline sử dụng object

```jsx
// ❌ SAI - Style như HTML
<div style="color: red; font-size: 16px;">

// ✅ ĐÚNG - Style là object, thuộc tính dùng camelCase
<div style={{ color: 'red', fontSize: '16px' }}>

// Có thể tách ra biến
const myStyle = {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#f0f0f0',  // background-color → backgroundColor
  marginTop: '20px',           // margin-top → marginTop
  borderRadius: '8px'          // border-radius → borderRadius
};
<div style={myStyle}>Nội dung</div>
```

---

## 3. Nhúng Biểu Thức JavaScript Trong JSX

Sử dụng dấu ngoặc nhọn `{}` để nhúng **bất kỳ biểu thức JavaScript hợp lệ** nào:

### 3.1 Biến và Giá Trị

```jsx
function UserProfile() {
  const name = 'Nguyễn Văn A';
  const age = 25;
  const isStudent = true;
  const avatar = 'https://example.com/avatar.jpg';

  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>Tuổi: {age}</p>
      <p>Sinh viên: {isStudent ? 'Có' : 'Không'}</p>
    </div>
  );
}
```

### 3.2 Biểu Thức Tính Toán

```jsx
function Calculator() {
  const a = 10;
  const b = 20;

  return (
    <div>
      <p>Tổng: {a + b}</p>
      <p>Tích: {a * b}</p>
      <p>Trung bình: {(a + b) / 2}</p>
      <p>Ngày hiện tại: {new Date().toLocaleDateString('vi-VN')}</p>
      <p>Random: {Math.floor(Math.random() * 100)}</p>
      <p>Viết hoa: {'hello react'.toUpperCase()}</p>
    </div>
  );
}
```

### 3.3 Gọi Hàm

```jsx
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

function getGreeting(hour) {
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function ProductCard() {
  const price = 1500000;
  const hour = new Date().getHours();

  return (
    <div>
      <p>{getGreeting(hour)}! 👋</p>
      <p>Giá sản phẩm: {formatPrice(price)}</p>
    </div>
  );
}
```

### 3.4 Template Literals (Template Strings)

```jsx
function UserCard() {
  const firstName = 'Nguyễn';
  const lastName = 'Văn A';
  const age = 25;

  return (
    <div>
      <h2>{`${firstName} ${lastName}`}</h2>
      <p>{`Tuổi: ${age}, Năm sinh: ${2026 - age}`}</p>
      <p className={`status ${age >= 18 ? 'adult' : 'minor'}`}>
        {age >= 18 ? 'Người lớn' : 'Trẻ em'}
      </p>
    </div>
  );
}
```

---

## 4. Những Gì KHÔNG THỂ Nhúng Trong JSX

### 4.1 Object không thể render trực tiếp

```jsx
function App() {
  const user = { name: 'Nguyễn Văn A', age: 25 };

  return (
    <div>
      {/* ❌ SAI - Object không thể render */}
      {/* <p>{user}</p> */}
      {/* Error: Objects are not valid as a React child */}

      {/* ✅ ĐÚNG - Truy cập thuộc tính cụ thể */}
      <p>{user.name}</p>
      <p>{user.age}</p>

      {/* ✅ ĐÚNG - Chuyển thành string */}
      <p>{JSON.stringify(user)}</p>
    </div>
  );
}
```

### 4.2 Statement không phải expression

```jsx
function App() {
  const score = 85;

  return (
    <div>
      {/* ❌ SAI - if/else là statement, không phải expression */}
      {/* {if (score > 80) { return 'Giỏi' }} */}

      {/* ✅ ĐÚNG - Dùng ternary operator (expression) */}
      <p>{score > 80 ? 'Giỏi' : 'Trung bình'}</p>

      {/* ✅ ĐÚNG - Dùng logical AND (expression) */}
      <p>{score > 90 && '🏆 Xuất sắc!'}</p>

      {/* ✅ ĐÚNG - Dùng IIFE (Immediately Invoked Function Expression) */}
      <p>
        {(() => {
          if (score >= 90) return 'Xuất sắc';
          if (score >= 80) return 'Giỏi';
          if (score >= 60) return 'Trung bình';
          return 'Yếu';
        })()}
      </p>
    </div>
  );
}
```

### 4.3 Giá trị `boolean`, `null`, `undefined` không hiển thị

```jsx
function App() {
  return (
    <div>
      {true}        {/* Không hiển thị gì */}
      {false}       {/* Không hiển thị gì */}
      {null}        {/* Không hiển thị gì */}
      {undefined}   {/* Không hiển thị gì */}
      
      {/* Nhưng số 0 SẼ hiển thị! Cẩn thận */}
      {0}           {/* Hiển thị: 0 */}
      
      {/* Sai lầm phổ biến */}
      {/* ❌ Khi array rỗng, 0 sẽ hiển thị */}
      {items.length && <List items={items} />}
      
      {/* ✅ Sử dụng Boolean() hoặc !! hoặc > 0 */}
      {items.length > 0 && <List items={items} />}
      {Boolean(items.length) && <List items={items} />}
      {!!items.length && <List items={items} />}
    </div>
  );
}
```

---

## 5. React Fragments

### Vì sao cần Fragment?

```jsx
// Khi bạn muốn nhóm elements mà không tạo thêm node trong DOM

// ❌ Tạo thêm div không cần thiết
function TableRow() {
  return (
    <div>  {/* div này làm hỏng cấu trúc table */}
      <td>Tên</td>
      <td>Tuổi</td>
    </div>
  );
}

// ✅ Fragment không tạo thêm DOM node
function TableRow() {
  return (
    <>
      <td>Tên</td>
      <td>Tuổi</td>
    </>
  );
}
```

### Cú pháp Fragment

```jsx
import { Fragment } from 'react';

// Cách 1: Cú pháp ngắn (phổ biến nhất)
function App() {
  return (
    <>
      <h1>Tiêu đề</h1>
      <p>Nội dung</p>
    </>
  );
}

// Cách 2: React.Fragment (khi cần key)
function ItemList({ items }) {
  return (
    <dl>
      {items.map(item => (
        // Cú pháp ngắn <></> KHÔNG hỗ trợ key
        // Phải dùng <Fragment> khi cần key
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

---

## 6. Comments Trong JSX

```jsx
function App() {
  return (
    <div>
      {/* Đây là comment trong JSX */}
      {/* 
        Comment
        nhiều dòng
        trong JSX 
      */}
      <h1>Hello</h1>
      
      {/* Comment trên cùng dòng */}
      <p>Nội dung</p> {/* Comment cuối dòng */}
    </div>
  );
}

// Comment JavaScript bình thường (ngoài JSX)
// Đây là comment một dòng

/* Đây là comment
   nhiều dòng */
```

---

## 7. JSX Spread Attributes

```jsx
// Truyền tất cả props bằng spread operator
function Button({ children, ...rest }) {
  return <button {...rest}>{children}</button>;
}

// Sử dụng
function App() {
  const buttonProps = {
    className: 'btn-primary',
    onClick: () => alert('Clicked!'),
    disabled: false,
    type: 'button'
  };

  return (
    <div>
      {/* Truyền từng prop */}
      <Button 
        className="btn-primary" 
        onClick={() => alert('Clicked!')}
      >
        Cách 1
      </Button>

      {/* Spread tất cả props */}
      <Button {...buttonProps}>Cách 2</Button>
    </div>
  );
}
```

---

## 8. JSX Biên Dịch Như Thế Nào?

### Quá trình biên dịch (compilation):

```jsx
// ════════════════════════════════════════
// Code bạn viết (JSX)
// ════════════════════════════════════════
function App() {
  return (
    <div className="app">
      <h1>Hello</h1>
      <p>Welcome to React</p>
    </div>
  );
}

// ════════════════════════════════════════
// React 17+ (Automatic JSX Transform)
// Compiler chuyển thành:
// ════════════════════════════════════════
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

function App() {
  return _jsxs('div', {
    className: 'app',
    children: [
      _jsx('h1', { children: 'Hello' }),
      _jsx('p', { children: 'Welcome to React' })
    ]
  });
}

// ════════════════════════════════════════
// Kết quả là React Element (JS Object)
// ════════════════════════════════════════
{
  type: 'div',
  props: {
    className: 'app',
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'Welcome to React' } }
    ]
  }
}
```

> **Từ React 17+**, bạn **không cần** `import React from 'react'` ở đầu mỗi file nữa nhờ Automatic JSX Transform.

---

## 9. Bảng So Sánh HTML vs JSX

| HTML | JSX | Lý do |
|------|-----|-------|
| `class` | `className` | `class` là từ khóa JS |
| `for` | `htmlFor` | `for` là từ khóa JS |
| `tabindex` | `tabIndex` | camelCase convention |
| `onclick` | `onClick` | camelCase convention |
| `style="color: red"` | `style={{ color: 'red' }}` | Style là object |
| `<br>` | `<br />` | Phải self-closing |
| `<img>` | `<img />` | Phải self-closing |
| `<!-- comment -->` | `{/* comment */}` | Sử dụng JS comment |
| `checked` | `checked={true}` | Boolean attributes rõ ràng |
| `value` | `defaultValue` | Controlled vs Uncontrolled |

---

## 10. Ví Dụ Tổng Hợp

```jsx
import { Fragment } from 'react';

function ProfileCard() {
  // Dữ liệu
  const user = {
    name: 'Trần Thị B',
    age: 28,
    occupation: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
    isAvailable: true,
    avatar: 'https://i.pravatar.cc/150?img=5'
  };

  // Hàm helper
  const getExperienceLevel = (age) => {
    if (age > 30) return '🔴 Senior';
    if (age > 25) return '🟡 Mid-level';
    return '🟢 Junior';
  };

  // Styles
  const cardStyle = {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Segoe UI', sans-serif"
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    margin: '4px',
    borderRadius: '20px',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    fontSize: '14px'
  };

  return (
    <div style={cardStyle}>
      {/* Avatar */}
      <img 
        src={user.avatar} 
        alt={`Avatar của ${user.name}`}
        style={{ borderRadius: '50%', width: '100px', height: '100px' }}
      />
      
      {/* Thông tin cơ bản */}
      <h2 style={{ marginBottom: '8px' }}>{user.name}</h2>
      <p style={{ color: '#666' }}>{user.occupation}</p>
      <p>Level: {getExperienceLevel(user.age)}</p>
      
      {/* Trạng thái */}
      {user.isAvailable && (
        <p style={{ color: '#4caf50' }}>
          ✅ Sẵn sàng nhận việc
        </p>
      )}
      
      {/* Skills */}
      <div>
        <h3>Kỹ năng:</h3>
        {user.skills.map((skill, index) => (
          <span key={index} style={badgeStyle}>
            {skill}
          </span>
        ))}
      </div>
      
      {/* Tuổi với conditional styling */}
      <p style={{ 
        color: user.age > 25 ? '#ff9800' : '#4caf50',
        fontWeight: 'bold'
      }}>
        {`${user.age} tuổi - ${user.age > 25 ? 'Kinh nghiệm' : 'Nhiệt huyết'}`}
      </p>
    </div>
  );
}

export default ProfileCard;
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Thẻ Sản Phẩm
Tạo component hiển thị thẻ sản phẩm với: tên, giá (format VND), mô tả, badge "hot" nếu giá > 1 triệu.

### Bài 2: Bảng Điểm
Tạo component hiển thị bảng điểm học sinh với danh sách các môn học và xếp loại tự động (dùng hàm helper).

### Bài 3: Profile Card
Tạo component profile card với đầy đủ thông tin cá nhân, sử dụng:
- Biến JavaScript
- Biểu thức ternary
- Template literals
- Inline styles dạng object
- Fragment

### Bài 4: Chuyển Đổi HTML Sang JSX
Chuyển đoạn HTML sau sang JSX:
```html
<div class="card">
  <label for="name">Tên:</label>
  <input type="text" id="name" tabindex="1" autofocus>
  <br>
  <img src="avatar.jpg" alt="Avatar">
  <p style="color: blue; font-size: 14px;" onclick="handleClick()">
    Click me
  </p>
  <!-- Đây là comment -->
</div>
```

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| JSX | Cú pháp mở rộng JS, giống HTML trong code |
| `{}` | Nhúng biểu thức JavaScript trong JSX |
| `className` | Thay thế `class` của HTML |
| `htmlFor` | Thay thế `for` của HTML |
| `style={{}}` | Inline style dùng object với thuộc tính camelCase |
| Fragment `<></>` | Nhóm elements mà không tạo thêm DOM node |
| Self-closing | Tất cả tag phải đóng: `<br />`, `<img />` |

---

> **Bài trước:** [01 - Giới Thiệu & Cài Đặt ←](./01-gioi-thieu-va-cai-dat.md)  
> **Bài tiếp theo:** [03 - Components →](./03-components.md)
