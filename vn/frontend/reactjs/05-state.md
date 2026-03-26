# Bài 05: State - Quản Lý Trạng Thái Component

## 📚 Mục tiêu bài học
- Hiểu State là gì và khác Props như thế nào
- Sử dụng `useState` hook
- Hiểu nguyên tắc immutability
- Cập nhật state với objects và arrays
- State lifting (nâng state lên)

---

## 1. State Là Gì?

**State** là dữ liệu nội bộ của component, có thể **thay đổi theo thời gian** và khi thay đổi sẽ khiến component **re-render** (hiển thị lại).

### So sánh Props vs State

| Đặc điểm | Props | State |
|----------|-------|-------|
| Nguồn gốc | Từ component cha | Trong chính component |
| Thay đổi được? | ❌ Read-only | ✅ Có thể thay đổi |
| Ai kiểm soát? | Component cha | Component hiện tại |
| Trigger re-render? | Có (khi cha re-render) | Có (khi setState) |
| Mục đích | Cấu hình component | Dữ liệu động, tương tác |

```
Props = Tham số hàm (do bên ngoài quyết định)
State = Biến cục bộ (do component tự quản lý)
```

---

## 2. useState Hook

### 2.1 Cú pháp cơ bản

```jsx
import { useState } from 'react';

function Counter() {
  // useState trả về mảng [giá_trị_hiện_tại, hàm_cập_nhật]
  const [count, setCount] = useState(0);
  //     ↑        ↑                  ↑
  //   state   setter           giá trị khởi tạo

  return (
    <div>
      <p>Đếm: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### 2.2 Nhiều state variables

```jsx
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(18);
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <form>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Tên"
      />
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />
      <input 
        value={age} 
        onChange={(e) => setAge(Number(e.target.value))}
        type="number"
      />
      <label>
        <input 
          type="checkbox"
          checked={isSubscribed}
          onChange={(e) => setIsSubscribed(e.target.checked)}
        />
        Đăng ký nhận tin
      </label>
    </form>
  );
}
```

### 2.3 Lazy Initialization

```jsx
// ❌ Hàm tốn tài nguyên chạy MỖI LẦN render
const [data, setData] = useState(expensiveComputation());

// ✅ Truyền hàm - chỉ chạy MỘT LẦN khi mount
const [data, setData] = useState(() => expensiveComputation());

// Ví dụ thực tế: đọc từ localStorage
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('theme');
  return saved ? JSON.parse(saved) : 'light';
});
```

---

## 3. Cập Nhật State Đúng Cách

### 3.1 Functional Updates (Cập nhật dựa trên state trước)

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ SAI - Có thể bị bug do batching
  const handleTripleIncrement = () => {
    setCount(count + 1);  // count = 0, set 1
    setCount(count + 1);  // count vẫn = 0 (chưa re-render), set 1 
    setCount(count + 1);  // count vẫn = 0, set 1
    // Kết quả: count = 1 (không phải 3!)
  };

  // ✅ ĐÚNG - Sử dụng functional update
  const handleTripleIncrement = () => {
    setCount(prev => prev + 1);  // prev = 0, return 1
    setCount(prev => prev + 1);  // prev = 1, return 2
    setCount(prev => prev + 1);  // prev = 2, return 3
    // Kết quả: count = 3 ✅
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleTripleIncrement}>+3</button>
    </div>
  );
}
```

> **Quy tắc:** Luôn sử dụng **functional update** (`prev => ...`) khi giá trị mới **phụ thuộc vào giá trị cũ**.

### 3.2 State Batching (React 18+)

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // React 18+ tự động batch tất cả state updates
    // Chỉ RE-RENDER MỘT LẦN (không phải 2 lần)
    setCount(c => c + 1);
    setFlag(f => !f);
    // → 1 lần re-render
  };

  // Nếu MUỐN re-render ngay lập tức (hiếm khi cần)
  // import { flushSync } from 'react-dom';
  // flushSync(() => setCount(c => c + 1)); // Re-render ngay
  // flushSync(() => setFlag(f => !f));      // Re-render ngay
}
```

---

## 4. State Với Object

### 4.1 Nguyên tắc Immutability

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    age: 25,
    email: 'a@email.com'
  });

  // ❌ SAI - Mutate trực tiếp (React KHÔNG phát hiện thay đổi)
  const handleBadUpdate = () => {
    user.name = 'Trần Thị B';  // Thay đổi trực tiếp object
    setUser(user);              // Cùng reference → không re-render!
  };

  // ✅ ĐÚNG - Tạo object mới với spread operator
  const handleGoodUpdate = () => {
    setUser({
      ...user,           // Copy tất cả properties cũ
      name: 'Trần Thị B' // Ghi đè property cần thay đổi
    });
  };

  // ✅ ĐÚNG - Functional update
  const handleNameChange = (newName) => {
    setUser(prev => ({
      ...prev,
      name: newName
    }));
  };

  return (
    <div>
      <p>Tên: {user.name}</p>
      <p>Tuổi: {user.age}</p>
      <p>Email: {user.email}</p>
      <button onClick={() => handleNameChange('Lê Văn C')}>
        Đổi tên
      </button>
    </div>
  );
}
```

### 4.2 Nested Object

```jsx
function ProfileEditor() {
  const [profile, setProfile] = useState({
    name: 'An',
    address: {
      street: '123 Nguyễn Huệ',
      city: 'Hồ Chí Minh',
      country: 'Việt Nam'
    },
    social: {
      facebook: 'an.nguyen',
      twitter: '@an'
    }
  });

  // Cập nhật nested object
  const updateCity = (newCity) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,   // Copy address cũ
        city: newCity       // Ghi đè city
      }
    }));
  };

  const updateSocial = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value   // Dynamic key
      }
    }));
  };

  return (
    <div>
      <p>Thành phố: {profile.address.city}</p>
      <button onClick={() => updateCity('Đà Nẵng')}>
        Chuyển đến Đà Nẵng
      </button>
      <button onClick={() => updateSocial('twitter', '@an_new')}>
        Cập nhật Twitter
      </button>
    </div>
  );
}
```

---

## 5. State Với Array

### 5.1 Thêm phần tử

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học React', done: false },
    { id: 2, text: 'Làm bài tập', done: false },
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Thêm vào cuối
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: newTodo, done: false }
    ]);
    setNewTodo('');
  };

  // Thêm vào đầu
  const addToTop = () => {
    setTodos(prev => [
      { id: Date.now(), text: newTodo, done: false },
      ...prev
    ]);
  };

  // Thêm vào vị trí cụ thể
  const insertAt = (index) => {
    setTodos(prev => [
      ...prev.slice(0, index),
      { id: Date.now(), text: newTodo, done: false },
      ...prev.slice(index)
    ]);
  };

  return (
    <div>
      <input 
        value={newTodo} 
        onChange={e => setNewTodo(e.target.value)}
        placeholder="Thêm việc mới..."
      />
      <button onClick={addTodo}>Thêm</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} {todo.done && '✅'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5.2 Xóa phần tử

```jsx
// Xóa theo id
const removeTodo = (id) => {
  setTodos(prev => prev.filter(todo => todo.id !== id));
};

// Xóa theo index
const removeByIndex = (index) => {
  setTodos(prev => prev.filter((_, i) => i !== index));
};
```

### 5.3 Cập nhật phần tử

```jsx
// Toggle done
const toggleTodo = (id) => {
  setTodos(prev => prev.map(todo => 
    todo.id === id 
      ? { ...todo, done: !todo.done }  // Tạo object mới
      : todo                           // Giữ nguyên
  ));
};

// Cập nhật text
const updateTodoText = (id, newText) => {
  setTodos(prev => prev.map(todo =>
    todo.id === id
      ? { ...todo, text: newText }
      : todo
  ));
};
```

### 5.4 Sắp xếp

```jsx
// ⚠️ sort() mutate array gốc → phải tạo bản sao trước
const sortByName = () => {
  setTodos(prev => [...prev].sort((a, b) => a.text.localeCompare(b.text)));
};

const sortByDone = () => {
  setTodos(prev => [...prev].sort((a, b) => Number(a.done) - Number(b.done)));
};
```

### 5.5 Bảng tóm tắt array operations

```jsx
// ═══════════════════════════════════════════════
//  IMMUTABLE ARRAY OPERATIONS CHEAT SHEET
// ═══════════════════════════════════════════════

// THÊM
setItems(prev => [...prev, newItem]);          // Thêm cuối
setItems(prev => [newItem, ...prev]);          // Thêm đầu

// XÓA
setItems(prev => prev.filter(x => x.id !== id));

// CẬP NHẬT
setItems(prev => prev.map(x => 
  x.id === id ? { ...x, name: 'new' } : x
));

// SẮP XẾP (tạo bản sao trước!)
setItems(prev => [...prev].sort(compareFn));

// ĐẢO NGƯỢCsetItems(prev => [...prev].reverse());

// THAY THẾ TOÀN BỘ
setItems(newArray);
```

---

## 6. Lifting State Up (Nâng State Lên)

Khi 2 component con cần **chia sẻ state**, hãy đưa state lên component cha gần nhất.

### Ví dụ: Bộ chuyển đổi nhiệt độ

```jsx
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleNames = { c: 'Celsius', f: 'Fahrenheit' };
  
  return (
    <div className="temperature-input">
      <label>Nhiệt độ ({scaleNames[scale]}):</label>
      <input
        type="number"
        value={temperature}
        onChange={e => onTemperatureChange(e.target.value)}
      />
    </div>
  );
}

function TemperatureConverter() {
  // State được "nâng lên" component cha
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const toCelsius = (f) => ((f - 32) * 5 / 9).toFixed(1);
  const toFahrenheit = (c) => ((c * 9 / 5) + 32).toFixed(1);

  const handleCelsiusChange = (temp) => {
    setScale('c');
    setTemperature(temp);
  };

  const handleFahrenheitChange = (temp) => {
    setScale('f');
    setTemperature(temp);
  };

  // Tính toán giá trị hiển thị
  const celsius = scale === 'f' ? toCelsius(parseFloat(temperature)) : temperature;
  const fahrenheit = scale === 'c' ? toFahrenheit(parseFloat(temperature)) : temperature;

  return (
    <div>
      <h2>🌡️ Chuyển Đổi Nhiệt Độ</h2>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      {temperature && (
        <p>
          {celsius}°C = {fahrenheit}°F
          {parseFloat(celsius) >= 100 && ' 🔥 Nước sôi!'}
          {parseFloat(celsius) <= 0 && ' 🥶 Đóng băng!'}
        </p>
      )}
    </div>
  );
}
```

```
Lifting State Up Pattern:
  
        ┌─────────────────────────┐
        │  TemperatureConverter   │
        │  state: temperature     │ ← State nằm ở đây
        │  state: scale           │
        └──────┬───────┬──────────┘
               │       │
    ┌──────────┘       └──────────┐
    │                             │
    ▼                             ▼
┌──────────────┐       ┌──────────────┐
│ CelsiusInput │       │  FahrInput   │
│ props: temp  │       │ props: temp  │
│ props: onChange │     │ props: onChange │
└──────────────┘       └──────────────┘
```

---

## 7. Khi Nào Dùng State

### ✅ NÊN dùng state cho:
- Dữ liệu form (input values)
- Toggle UI (show/hide, open/close)
- Danh sách item (thêm/xóa/sửa)
- Dữ liệu từ API
- Bộ đếm, timer
- Trạng thái loading/error

### ❌ KHÔNG NÊN dùng state cho:
- Giá trị tính toán từ state/props khác (dùng biến thường)
- Giá trị không ảnh hưởng UI (dùng useRef)
- Hằng số

```jsx
function ProductList({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // ❌ KHÔNG cần state cho giá trị tính toán được
  // const [filteredProducts, setFilteredProducts] = useState([]);

  // ✅ Tính toán trực tiếp từ state hiện có (derived state)
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);

  const totalPrice = filteredProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      <p>Tìm thấy: {filteredProducts.length} sản phẩm</p>
      <p>Tổng giá: {totalPrice.toLocaleString('vi-VN')}đ</p>
      {/* Render filteredProducts */}
    </div>
  );
}
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Todo App
Xây dựng ứng dụng Todo với: thêm, xóa, toggle done, đếm số việc còn lại.

### Bài 2: Shopping Cart
Tạo giỏ hàng với: thêm sản phẩm, thay đổi số lượng, xóa, tính tổng tiền.

### Bài 3: Form với Validation
Tạo form đăng ký với state quản lý: values, errors, touched. Validate realtime.

### Bài 4: Accordion Component
Tạo component Accordion chỉ cho phép mở 1 panel tại 1 thời điểm.

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| State | Dữ liệu nội bộ, thay đổi được, trigger re-render |
| useState | Hook để khai báo state trong function component |
| Setter function | Hàm cập nhật state (setCount, setName, ...) |
| Functional update | `setPrev(prev => prev + 1)` - dựa trên giá trị trước |
| Immutability | Không thay đổi trực tiếp, tạo bản sao mới |
| Batching | React gom nhiều setState thành 1 re-render |
| Lifting State | Đưa state lên component cha để chia sẻ |
| Derived State | Giá trị tính toán từ state, không cần state riêng |

---

> **Bài trước:** [04 - Props ←](./04-props.md)  
> **Bài tiếp theo:** [06 - Event Handling →](./06-event-handling.md)
