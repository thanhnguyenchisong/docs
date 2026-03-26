# Bài 06: Event Handling - Xử Lý Sự Kiện

## 📚 Mục tiêu bài học
- Hiểu cách React xử lý sự kiện (Synthetic Events)
- Xử lý các loại sự kiện phổ biến
- Truyền tham số vào event handler
- Event delegation và performance
- Patterns thường dùng

---

## 1. Synthetic Events

React bao bọc browser events gốc bên trong **SyntheticEvent** - một wrapper chuẩn hoá hoạt động giống nhau trên mọi trình duyệt.

```jsx
function App() {
  const handleClick = (event) => {
    // event là SyntheticEvent, KHÔNG phải native DOM event
    console.log(event);                  // SyntheticEvent
    console.log(event.nativeEvent);      // Native DOM event gốc
    console.log(event.target);           // Element được click
    console.log(event.currentTarget);    // Element gắn handler
    console.log(event.type);             // 'click'
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### So sánh HTML vs React Events

```jsx
// ═══ HTML (viết thường, string) ═══
<button onclick="handleClick()">Click</button>
<input onchange="handleChange()" />

// ═══ React (camelCase, function reference) ═══
<button onClick={handleClick}>Click</button>
<input onChange={handleChange} />
```

| HTML | React | Lưu ý |
|------|-------|-------|
| `onclick` | `onClick` | camelCase |
| `onchange` | `onChange` | camelCase |
| `onsubmit` | `onSubmit` | camelCase |
| `onmouseover` | `onMouseOver` | camelCase |
| `"handleClick()"` | `{handleClick}` | Function reference, KHÔNG gọi |

---

## 2. Các Loại Event Handler

### 2.1 Mouse Events

```jsx
function MouseEventDemo() {
  return (
    <div>
      <button onClick={() => console.log('Click!')}>
        onClick
      </button>
      
      <button onDoubleClick={() => console.log('Double Click!')}>
        onDoubleClick
      </button>
      
      <div
        onMouseEnter={() => console.log('Mouse Enter')}
        onMouseLeave={() => console.log('Mouse Leave')}
        onMouseMove={(e) => console.log(`x: ${e.clientX}, y: ${e.clientY}`)}
        onContextMenu={(e) => {
          e.preventDefault(); // Ngăn menu chuột phải
          console.log('Right Click!');
        }}
        style={{ width: 200, height: 200, background: '#eee' }}
      >
        Di chuột vào đây
      </div>
    </div>
  );
}
```

### 2.2 Keyboard Events

```jsx
function KeyboardEventDemo() {
  const handleKeyDown = (e) => {
    console.log('Key:', e.key);         // 'Enter', 'a', 'Escape'
    console.log('Code:', e.code);       // 'Enter', 'KeyA', 'Escape'
    console.log('Ctrl:', e.ctrlKey);    // true/false
    console.log('Shift:', e.shiftKey);
    console.log('Alt:', e.altKey);
    console.log('Meta:', e.metaKey);    // Cmd (Mac) / Win key

    // Phím tắt Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('Lưu!');
    }

    // Enter để submit
    if (e.key === 'Enter') {
      console.log('Submit!');
    }

    // Escape để đóng
    if (e.key === 'Escape') {
      console.log('Đóng!');
    }
  };

  return (
    <input
      onKeyDown={handleKeyDown}
      onKeyUp={(e) => console.log('Key Up:', e.key)}
      placeholder="Nhấn phím bất kỳ..."
    />
  );
}
```

### 2.3 Form Events

```jsx
function FormEventDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: 'general'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn reload trang
    console.log('Form data:', formData);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '', category: 'general' });
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
      <select name="category" value={formData.category} onChange={handleChange}>
        <option value="general">Chung</option>
        <option value="support">Hỗ trợ</option>
        <option value="feedback">Góp ý</option>
      </select>
      <button type="submit">Gửi</button>
      <button type="reset">Xóa trắng</button>
    </form>
  );
}
```

### 2.4 Focus Events

```jsx
function FocusEventDemo() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <input
        onFocus={() => {
          setIsFocused(true);
          console.log('Input được focus');
        }}
        onBlur={() => {
          setIsFocused(false);
          console.log('Input mất focus');
        }}
        style={{
          border: `2px solid ${isFocused ? '#2196F3' : '#ccc'}`,
          outline: 'none',
          padding: '8px',
          borderRadius: '4px',
          transition: 'border-color 0.3s'
        }}
        placeholder="Click vào đây..."
      />
      {isFocused && <p style={{ color: '#2196F3' }}>Đang nhập liệu...</p>}
    </div>
  );
}
```

### 2.5 Scroll & Touch Events

```jsx
function ScrollDemo() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = (e) => {
    setScrollY(e.target.scrollTop);
  };

  return (
    <div
      onScroll={handleScroll}
      style={{ height: 200, overflow: 'auto' }}
    >
      <div style={{ height: 1000 }}>
        <p style={{ position: 'sticky', top: 0, background: '#fff' }}>
          Scroll: {scrollY}px
        </p>
        {/* Nội dung dài */}
      </div>
    </div>
  );
}

// Touch events (mobile)
function TouchDemo() {
  return (
    <div
      onTouchStart={(e) => console.log('Touch start', e.touches[0])}
      onTouchMove={(e) => console.log('Touch move')}
      onTouchEnd={() => console.log('Touch end')}
    >
      Chạm vào đây (mobile)
    </div>
  );
}
```

### 2.6 Drag & Drop Events

```jsx
function DragDropDemo() {
  const [draggedItem, setDraggedItem] = useState(null);
  const [items, setItems] = useState(['Item A', 'Item B', 'Item C']);

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => setDraggedItem(index)}
          onDragOver={(e) => e.preventDefault()} // Cho phép drop
          onDrop={() => {
            const newItems = [...items];
            const [removed] = newItems.splice(draggedItem, 1);
            newItems.splice(index, 0, removed);
            setItems(newItems);
            setDraggedItem(null);
          }}
          style={{
            padding: '12px',
            margin: '4px',
            background: draggedItem === index ? '#e3f2fd' : '#fff',
            border: '1px solid #ccc',
            cursor: 'grab'
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Truyền Tham Số Vào Event Handler

### 3.1 Sử dụng Arrow Function

```jsx
function ItemList() {
  const items = ['React', 'Vue', 'Angular'];

  const handleDelete = (itemName) => {
    console.log(`Xóa: ${itemName}`);
  };

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
          {/* Arrow function để truyền tham số */}
          <button onClick={() => handleDelete(item)}>Xóa</button>
        </li>
      ))}
    </ul>
  );
}
```

### 3.2 Truyền cả event và tham số

```jsx
function App() {
  const handleClick = (id, name, event) => {
    console.log('ID:', id);
    console.log('Name:', name);
    console.log('Event:', event);
    console.log('Target:', event.target);
  };

  return (
    <button onClick={(e) => handleClick(1, 'React', e)}>
      Click Me
    </button>
  );
}
```

### 3.3 Tạo handler factory (currying)

```jsx
function App() {
  // Hàm trả về hàm
  const createHandler = (action) => (event) => {
    console.log(`Action: ${action}`, event.target);
  };

  return (
    <div>
      <button onClick={createHandler('save')}>💾 Lưu</button>
      <button onClick={createHandler('delete')}>🗑️ Xóa</button>
      <button onClick={createHandler('edit')}>✏️ Sửa</button>
    </div>
  );
}
```

---

## 4. Prevent Default & Stop Propagation

### 4.1 preventDefault

```jsx
function App() {
  // Ngăn hành vi mặc định
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn form reload trang
    console.log('Form submitted!');
  };

  const handleLinkClick = (e) => {
    e.preventDefault(); // Ngăn chuyển trang
    console.log('Link clicked but not navigated');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>

      <a href="https://google.com" onClick={handleLinkClick}>
        Click me (sẽ không chuyển trang)
      </a>
    </div>
  );
}
```

### 4.2 stopPropagation

```jsx
function App() {
  return (
    <div onClick={() => console.log('Div clicked')}>
      <button onClick={(e) => {
        e.stopPropagation(); // Ngăn event bubble lên div
        console.log('Button clicked');
      }}>
        Click Button (chỉ log "Button clicked")
      </button>

      <p onClick={() => console.log('P clicked')}>
        Click P (sẽ log "P clicked" VÀ "Div clicked")
      </p>
    </div>
  );
}
```

### Event Bubbling trong React

```
Click vào Button:

              ┌─── div (onClick) ───────────────┐
              │                                   │
              │   ┌── p (onClick) ──────────┐    │
              │   │                          │    │
              │   │  ┌── button (onClick) ─┐ │    │
              │   │  │    CLICK HERE       │ │    │
              │   │  └────────────────────┘ │    │
              │   └──────────────────────────┘    │
              └───────────────────────────────────┘

Bubbling (mặc định): button → p → div → ... → document
stopPropagation(): button → STOP
```

---

## 5. Event Handler Patterns

### 5.1 Toggle Pattern

```jsx
function ToggleButton() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      onClick={() => setIsOn(prev => !prev)}
      style={{
        background: isOn ? '#4caf50' : '#ccc',
        color: '#fff',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
        transition: 'background 0.3s'
      }}
    >
      {isOn ? 'ON 🟢' : 'OFF 🔴'}
    </button>
  );
}
```

### 5.2 Debounce Pattern (tìm kiếm)

```jsx
import { useState, useCallback } from 'react';

function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounce: chỉ gọi API sau khi user ngừng gõ 300ms
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const searchAPI = async (term) => {
    if (!term) return setResults([]);
    console.log('Searching:', term);
    // const res = await fetch(`/api/search?q=${term}`);
    // setResults(await res.json());
  };

  const debouncedSearch = useCallback(debounce(searchAPI, 300), []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Tìm kiếm..."
      />
    </div>
  );
}
```

### 5.3 Confirmation Pattern

```jsx
function DeleteButton({ itemName, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="confirm-dialog">
        <p>Xóa "{itemName}"?</p>
        <button onClick={handleDelete} className="btn-danger">
          ✅ Xác nhận xóa
        </button>
        <button onClick={() => setShowConfirm(false)} className="btn-secondary">
          ❌ Hủy
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setShowConfirm(true)} className="btn-danger">
      🗑️ Xóa
    </button>
  );
}
```

### 5.4 Multi-handler Pattern

```jsx
function MultiActionCard({ item }) {
  // Tập trung xử lý actions qua switch
  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        console.log('Editing:', item.id);
        break;
      case 'delete':
        console.log('Deleting:', item.id);
        break;
      case 'share':
        console.log('Sharing:', item.id);
        break;
      case 'favorite':
        console.log('Favoriting:', item.id);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  return (
    <div className="card">
      <h3>{item.name}</h3>
      <div className="actions">
        <button onClick={() => handleAction('edit')}>✏️</button>
        <button onClick={() => handleAction('delete')}>🗑️</button>
        <button onClick={() => handleAction('share')}>📤</button>
        <button onClick={() => handleAction('favorite')}>⭐</button>
      </div>
    </div>
  );
}
```

---

## 6. Ví Dụ Tổng Hợp: Interactive Counter

```jsx
import { useState, useRef } from 'react';

function InteractiveCounter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const addToHistory = (action, value) => {
    setHistory(prev => [
      { action, value, time: new Date().toLocaleTimeString('vi-VN') },
      ...prev.slice(0, 9) // Giữ 10 bản ghi gần nhất
    ]);
  };

  const handleIncrement = () => {
    setCount(prev => prev + step);
    addToHistory('increment', step);
  };

  const handleDecrement = () => {
    setCount(prev => prev - step);
    addToHistory('decrement', step);
  };

  const handleReset = () => {
    setCount(0);
    addToHistory('reset', 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    } else if (e.key === 'r' && e.ctrlKey) {
      e.preventDefault();
      handleReset();
    }
  };

  const handleDoubleClick = () => {
    setCount(prev => prev * 2);
    addToHistory('double', count * 2);
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ padding: 20, outline: 'none' }}
    >
      <h1>Interactive Counter</h1>

      <div onDoubleClick={handleDoubleClick}>
        <h2 style={{ fontSize: 48 }}>{count}</h2>
        <p style={{ color: '#888' }}>Double-click để nhân đôi</p>
      </div>

      <div>
        <label>Step: </label>
        <input
          ref={inputRef}
          type="number"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) || 1)}
          min={1}
          style={{ width: 60 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleDecrement}>➖ Giảm</button>
        <button onClick={handleReset}>🔄 Reset</button>
        <button onClick={handleIncrement}>➕ Tăng</button>
      </div>

      <p style={{ color: '#888', fontSize: 12 }}>
        Phím tắt: ↑ Tăng | ↓ Giảm | Ctrl+R Reset
      </p>

      <h3>📜 Lịch sử:</h3>
      <ul>
        {history.map((h, i) => (
          <li key={i}>
            [{h.time}] {h.action} → {h.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InteractiveCounter;
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Color Picker
Click vào nút → đổi background thành màu ngẫu nhiên. Hiển thị mã màu hex.

### Bài 2: Character Counter
Textarea đếm số ký tự real-time. Cảnh báo khi gần đạt giới hạn (max 200). Ngăn nhập khi vượt quá.

### Bài 3: Keyboard Shortcuts
Tạo ứng dụng nghe phím tắt: Ctrl+B (bold), Ctrl+I (italic), Ctrl+S (save alert), Escape (clear).

### Bài 4: Drag & Drop Sortable List
Tạo danh sách có thể kéo thả để sắp xếp lại thứ tự.

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| SyntheticEvent | Wrapper chuẩn hoá của React cho DOM events |
| camelCase | `onClick`, `onChange` thay vì `onclick`, `onchange` |
| Function reference | `onClick={handleClick}` KHÔNG phải `onClick={handleClick()}` |
| preventDefault | Ngăn hành vi mặc định (submit, navigate) |
| stopPropagation | Ngăn event bubble lên parent |
| Arrow function | Cách truyền tham số: `onClick={() => fn(param)}` |
| Event Bubbling | Event lan truyền từ child lên parent |

---

> **Bài trước:** [05 - State ←](./05-state.md)  
> **Bài tiếp theo:** [07 - Conditional Rendering →](./07-conditional-rendering.md)
