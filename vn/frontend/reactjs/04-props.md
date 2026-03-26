# Bài 04: Props - Truyền Dữ Liệu Giữa Components

## 📚 Mục tiêu bài học
- Hiểu Props là gì và cách hoạt động
- Truyền các loại dữ liệu khác nhau qua props
- Destructuring props
- Default props và PropTypes
- Children prop và Render Props pattern

---

## 1. Props Là Gì?

**Props** (Properties) là cách để truyền dữ liệu từ **component cha** xuống **component con**. Props hoạt động giống như **tham số của hàm** - component nhận props và sử dụng chúng để render UI.

### Quy tắc vàng:
> **Props là READ-ONLY (chỉ đọc)**. Component **KHÔNG BAO GIỜ** được thay đổi props mà nó nhận được.

```
      ┌──────────────┐
      │   App (Cha)   │
      │               │
      │  name="An"    │──── Props truyền xuống (one-way)
      │  age={25}     │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │  UserCard     │
      │   (Con)       │
      │               │
      │  Nhận:        │
      │  props.name   │
      │  props.age    │
      └──────────────┘
```

---

## 2. Cách Truyền và Nhận Props

### 2.1 Cú pháp cơ bản

```jsx
// ═══════════════════════════════════════
// Component CON - Nhận props
// ═══════════════════════════════════════

// Cách 1: Nhận qua parameter
function Greeting(props) {
  return <h1>Xin chào, {props.name}!</h1>;
}

// Cách 2: Destructuring (phổ biến hơn)
function Greeting({ name }) {
  return <h1>Xin chào, {name}!</h1>;
}

// ═══════════════════════════════════════
// Component CHA - Truyền props
// ═══════════════════════════════════════
function App() {
  return (
    <div>
      <Greeting name="Nguyễn Văn A" />
      <Greeting name="Trần Thị B" />
      <Greeting name="Lê Văn C" />
    </div>
  );
}
```

### 2.2 Truyền nhiều props

```jsx
function UserCard({ name, age, email, avatar, isVerified }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name} {isVerified && '✅'}</h3>
      <p>Tuổi: {age}</p>
      <p>Email: {email}</p>
    </div>
  );
}

function App() {
  return (
    <UserCard 
      name="Nguyễn Văn A"
      age={25}
      email="nguyenvana@email.com"
      avatar="https://i.pravatar.cc/150"
      isVerified={true}
    />
  );
}
```

---

## 3. Các Loại Dữ Liệu Props

### 3.1 String

```jsx
// String - dùng dấu ngoặc kép
<Greeting name="Nguyễn Văn A" />
<Greeting name={'Nguyễn Văn A'} />  // Cũng OK
```

### 3.2 Number

```jsx
// Number - dùng dấu ngoặc nhọn
<UserCard age={25} />
<ProductCard price={1500000} />
```

### 3.3 Boolean

```jsx
// Boolean true - có thể viết tắt
<Button disabled={true} />
<Button disabled />          // Tương đương disabled={true}

// Boolean false
<Button disabled={false} />
// KHÔNG THỂ viết: <Button disabled={false} /> bằng cách bỏ qua
// Vì bỏ qua = undefined, KHÔNG phải false
```

### 3.4 Array

```jsx
function SkillList({ skills }) {
  return (
    <ul>
      {skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>
  );
}

<SkillList skills={['React', 'Node.js', 'TypeScript']} />
```

### 3.5 Object

```jsx
function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

<UserCard user={{ name: 'An', email: 'an@email.com' }} />

// Hoặc từ biến
const userData = { name: 'An', email: 'an@email.com' };
<UserCard user={userData} />
```

### 3.6 Function (Callback Props)

```jsx
function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
}

function App() {
  const handleClick = () => {
    alert('Đã click!');
  };

  return (
    <div>
      {/* Truyền function đã khai báo */}
      <Button onClick={handleClick}>Click Me</Button>

      {/* Truyền arrow function inline */}
      <Button onClick={() => console.log('Logged!')}>
        Log
      </Button>
    </div>
  );
}
```

### 3.7 JSX / React Element

```jsx
function Layout({ header, sidebar, children }) {
  return (
    <div className="layout">
      <div className="layout-header">{header}</div>
      <div className="layout-body">
        <aside className="layout-sidebar">{sidebar}</aside>
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Layout
      header={<h1>My Website</h1>}
      sidebar={
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      }
    >
      <p>Nội dung chính ở đây</p>
    </Layout>
  );
}
```

---

## 4. Destructuring Props Nâng Cao

### 4.1 Destructuring với default values

```jsx
function Button({ 
  variant = 'primary',    // Default: 'primary'
  size = 'medium',        // Default: 'medium'
  disabled = false,       // Default: false
  children 
}) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Sử dụng - không truyền variant và size → dùng giá trị mặc định
<Button>Click Me</Button>                    // primary, medium
<Button variant="danger" size="large">       // danger, large
  Xóa
</Button>
```

### 4.2 Rest Props (Spread Operator)

```jsx
function Input({ label, error, ...rest }) {
  // `rest` chứa tất cả props còn lại
  // Ví dụ: type, placeholder, value, onChange, etc.
  
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input 
        className={`input ${error ? 'input-error' : ''}`}
        {...rest}  // Spread tất cả props còn lại vào <input>
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// Sử dụng
<Input 
  label="Email"
  type="email"
  placeholder="Nhập email..."
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  required
  autoFocus
/>
// label, error → component xử lý
// type, placeholder, value, onChange, required, autoFocus → truyền vào <input>
```

### 4.3 Nested Destructuring

```jsx
function UserProfile({ 
  user: { name, email, address: { city, country } },
  isActive 
}) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      <p>{city}, {country}</p>
      <p>{isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}

<UserProfile 
  user={{
    name: 'An',
    email: 'an@email.com',
    address: { city: 'Hà Nội', country: 'Việt Nam' }
  }}
  isActive={true}
/>
```

---

## 5. Children Prop

`children` là prop đặc biệt chứa nội dung bên trong tag component.

### 5.1 Cơ bản

```jsx
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

// children = <p>Nội dung 1</p><p>Nội dung 2</p>
<Card title="Thẻ 1">
  <p>Nội dung 1</p>
  <p>Nội dung 2</p>
</Card>

// children = "Chỉ text thôi"
<Card title="Thẻ 2">
  Chỉ text thôi
</Card>

// Không có children
<Card title="Thẻ trống" />
// children = undefined
```

### 5.2 Layout Components với Children

```jsx
// Container component
function Container({ maxWidth = '1200px', children }) {
  return (
    <div style={{ 
      maxWidth, 
      margin: '0 auto', 
      padding: '0 20px' 
    }}>
      {children}
    </div>
  );
}

// Section component
function Section({ title, subtitle, children, background = '#fff' }) {
  return (
    <section style={{ backgroundColor: background, padding: '60px 0' }}>
      <Container>
        {title && <h2 className="section-title">{title}</h2>}
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}

// Sử dụng - Composition rất linh hoạt
function App() {
  return (
    <div>
      <Section 
        title="Sản Phẩm" 
        subtitle="Những sản phẩm tốt nhất cho bạn"
        background="#f5f5f5"
      >
        <div className="product-grid">
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>
      </Section>

      <Section title="Liên Hệ">
        <ContactForm />
      </Section>
    </div>
  );
}
```

### 5.3 Multiple Slots (Named Children)

```jsx
// Khi cần nhiều "slots" cho children khác nhau
function Dialog({ title, footer, children }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="dialog-close">✕</button>
        </div>
        <div className="dialog-body">
          {children}   {/* Slot chính */}
        </div>
        {footer && (
          <div className="dialog-footer">
            {footer}   {/* Slot footer */}
          </div>
        )}
      </div>
    </div>
  );
}

// Sử dụng
<Dialog 
  title="Xác nhận xóa"
  footer={
    <>
      <button className="btn-cancel">Hủy</button>
      <button className="btn-danger">Xóa</button>
    </>
  }
>
  <p>Bạn có chắc chắn muốn xóa mục này?</p>
  <p>Hành động này không thể hoàn tác.</p>
</Dialog>
```

---

## 6. PropTypes (Type Checking)

### 6.1 Cài đặt

```bash
npm install prop-types
```

### 6.2 Sử dụng PropTypes

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, email, role, skills, onEdit }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>Tuổi: {age}</p>
      <p>Email: {email}</p>
      <p>Vai trò: {role}</p>
      <ul>
        {skills.map((skill, i) => <li key={i}>{skill}</li>)}
      </ul>
      <button onClick={onEdit}>Sửa</button>
    </div>
  );
}

// Định nghĩa kiểu dữ liệu cho props
UserCard.propTypes = {
  name: PropTypes.string.isRequired,          // Bắt buộc, kiểu string
  age: PropTypes.number,                       // Tùy chọn, kiểu number
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['admin', 'user', 'editor']),  // Một trong các giá trị
  skills: PropTypes.arrayOf(PropTypes.string), // Mảng string
  onEdit: PropTypes.func,                      // Function
};

// Giá trị mặc định
UserCard.defaultProps = {
  age: 18,
  role: 'user',
  skills: [],
  onEdit: () => {},
};
```

### 6.3 Các kiểu PropTypes phổ biến

```jsx
import PropTypes from 'prop-types';

Component.propTypes = {
  // ═══ Kiểu cơ bản ═══
  optionalString: PropTypes.string,
  optionalNumber: PropTypes.number,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalArray: PropTypes.array,
  optionalObject: PropTypes.object,
  optionalSymbol: PropTypes.symbol,

  // ═══ Bắt buộc ═══
  requiredString: PropTypes.string.isRequired,
  requiredNumber: PropTypes.number.isRequired,

  // ═══ Một trong các kiểu ═══
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  // ═══ Một trong các giá trị ═══
  optionalEnum: PropTypes.oneOf(['success', 'warning', 'error']),

  // ═══ Mảng với kiểu cụ thể ═══
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),   // [1, 2, 3]
  optionalArrayOfObjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),

  // ═══ Object với cấu trúc cụ thể ═══
  optionalObjectWithShape: PropTypes.shape({
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    email: PropTypes.string,
  }),

  // ═══ Exact shape (không cho phép props thừa) ═══
  optionalExactObject: PropTypes.exact({
    name: PropTypes.string,
    age: PropTypes.number,
  }),

  // ═══ React elements ═══
  optionalNode: PropTypes.node,             // Bất cứ gì render được
  optionalElement: PropTypes.element,       // React element
  optionalElementType: PropTypes.elementType, // Component type

  // ═══ Instance of class ═══
  optionalInstance: PropTypes.instanceOf(Date),

  // ═══ Custom validator ═══
  customProp: function(props, propName, componentName) {
    if (!/^[A-Z]/.test(props[propName])) {
      return new Error(
        `${propName} in ${componentName} phải bắt đầu bằng chữ hoa`
      );
    }
  },
};
```

> **💡 Lưu ý:** Trong dự án thực tế, hầu hết sử dụng **TypeScript** thay vì PropTypes để type-checking (xem Bài 20). PropTypes chỉ check runtime, TypeScript check compile-time.

---

## 7. Props Drilling & Giải Pháp

### Vấn đề: Props Drilling

```jsx
// Props phải truyền qua nhiều lớp component không cần thiết

function App() {
  const [user, setUser] = useState({ name: 'An', theme: 'dark' });
  
  return <Layout user={user} />;  // Truyền xuống
}

function Layout({ user }) {
  // Layout không cần user, chỉ truyền xuống tiếp
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  // Sidebar cũng không cần user, chỉ truyền tiếp
  return <UserInfo user={user} />;
}

function UserInfo({ user }) {
  // UserInfo MỚI THẬT SỰ cần user
  return <p>{user.name}</p>;
}
```

```
App (user) ──→ Layout (user) ──→ Sidebar (user) ──→ UserInfo (user)
                  ↑                    ↑
           Không cần user        Không cần user
           Chỉ truyền qua       Chỉ truyền qua
```

### Giải pháp:

1. **Component Composition** (đơn giản nhất)
2. **Context API** (Bài 13)
3. **State Management Libraries** (Bài 16)

```jsx
// ✅ Giải pháp: Component Composition
function App() {
  const [user, setUser] = useState({ name: 'An', theme: 'dark' });
  
  return (
    <Layout>
      <Sidebar>
        {/* UserInfo nhận user trực tiếp từ App */}
        <UserInfo user={user} />
      </Sidebar>
    </Layout>
  );
}

function Layout({ children }) {
  return <div className="layout">{children}</div>;
}

function Sidebar({ children }) {
  return <aside className="sidebar">{children}</aside>;
}

function UserInfo({ user }) {
  return <p>{user.name}</p>;
}
```

---

## 8. Props Best Practices

### 8.1 Naming Conventions

```jsx
// ✅ Tốt - Tên mô tả rõ ràng
<UserCard 
  userName="An"
  userAge={25}
  isActive={true}
  onProfileClick={handleClick}
  onDelete={handleDelete}
/>

// ❌ Tồi - Tên không rõ ràng
<UserCard 
  n="An"
  a={25}
  flag={true}
  cb1={handleClick}
  fn={handleDelete}
/>
```

```
Convention cho tên props:
├── Data props:     noun (name, title, count, items)
├── Boolean props:  is/has/can prefix (isActive, hasError, canEdit)
├── Event props:    on prefix (onClick, onChange, onSubmit)
├── Render props:   render prefix (renderItem, renderHeader)
└── CSS props:      className, style, variant, size
```

### 8.2 Tránh truyền quá nhiều props

```jsx
// ❌ Quá nhiều individual props
<UserCard 
  firstName="Nguyễn"
  lastName="Văn A"
  age={25}
  email="a@email.com"
  phone="0901234567"
  address="Hà Nội"
  avatar="/img.jpg"
  isActive={true}
  role="admin"
/>

// ✅ Nhóm thành object
<UserCard user={userData} isActive={true} />
// hoặc
<UserCard {...userData} isActive={true} />
```

### 8.3 Immutability - Không thay đổi props

```jsx
// ❌ TUYỆT ĐỐI KHÔNG thay đổi props
function BadComponent(props) {
  props.name = 'Changed';  // 💥 Error hoặc bug nghiêm trọng
  props.items.push('new');  // 💥 Mutation!
  return <div>{props.name}</div>;
}

// ✅ Tạo bản sao nếu cần thay đổi
function GoodComponent({ items }) {
  // Tạo bản sao mới
  const sortedItems = [...items].sort();
  const filteredItems = items.filter(item => item.active);
  
  return (
    <ul>
      {sortedItems.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Button Component
Tạo `Button` component nhận: variant (primary/secondary/danger), size (sm/md/lg), disabled, children, onClick.

### Bài 2: Product List
Tạo `ProductList` nhận mảng products, mỗi product truyền vào `ProductCard` qua props. ProductCard hiển thị: name, price, image, description.

### Bài 3: Dialog Component
Tạo `Dialog` component sử dụng children prop cho body content, và named props cho title và footer buttons.

### Bài 4: Form with Validation
Tạo `FormField` component nhận: label, type, value, onChange, error, required. Sử dụng rest props để truyền thêm HTML attributes.

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| Props | Dữ liệu truyền từ cha sang con |
| Read-only | Props KHÔNG được thay đổi |
| Destructuring | Trích xuất props trực tiếp `{ name, age }` |
| Default Props | Giá trị mặc định khi prop không được truyền |
| Children | Nội dung bên trong tag component |
| PropTypes | Kiểm tra kiểu dữ liệu props (runtime) |
| Props Drilling | Props truyền qua nhiều lớp không cần thiết |
| Spread Props | `{...rest}` truyền props còn lại |

---

> **Bài trước:** [03 - Components ←](./03-components.md)  
> **Bài tiếp theo:** [05 - State →](./05-state.md)
