# Bài 10: Hooks Cơ Bản - useState, useEffect, useContext, useRef

## 📚 Mục tiêu bài học
- Hiểu Hooks là gì và quy tắc sử dụng
- Nắm vững `useEffect` - side effects
- `useRef` - tham chiếu DOM và giá trị persistent
- `useContext` - chia sẻ dữ liệu toàn cục
- Hiểu dependencies array

---

## 1. Hooks Là Gì?

**Hooks** là các hàm đặc biệt cho phép function components sử dụng state và các tính năng React khác mà trước đây chỉ class components mới có.

### Quy tắc sử dụng Hooks (Rules of Hooks)

```jsx
// ✅ ĐÚNG - Gọi ở top level của component
function MyComponent() {
  const [count, setCount] = useState(0);   // ✅
  const ref = useRef(null);                // ✅
  useEffect(() => {}, []);                 // ✅
  
  return <div>{count}</div>;
}

// ❌ SAI - Không gọi trong điều kiện
function BadComponent({ show }) {
  if (show) {
    const [name, setName] = useState('');  // ❌ Trong if
  }

  for (let i = 0; i < 5; i++) {
    useEffect(() => {});                   // ❌ Trong loop
  }

  const handleClick = () => {
    const [data, setData] = useState([]);  // ❌ Trong event handler
  };
}

// ❌ SAI - Không gọi trong hàm JavaScript thường
function notAComponent() {
  const [x, setX] = useState(0);          // ❌ Không phải component
}
```

```
QUY TẮC HOOKS:
1. Chỉ gọi ở TOP LEVEL (không trong if, for, nested function)
2. Chỉ gọi trong React FUNCTION COMPONENTS hoặc CUSTOM HOOKS
3. Thứ tự gọi phải GIỐNG NHAU mỗi lần render
```

---

## 2. useEffect - Xử Lý Side Effects

### Side Effect là gì?

Side effects là những thao tác **ngoài việc render UI**: gọi API, thao tác DOM, timer, subscription, logging...

### 2.1 Cú pháp cơ bản

```jsx
import { useState, useEffect } from 'react';

useEffect(() => {
  // Side effect code ở đây
  
  return () => {
    // Cleanup function (optional)
    // Chạy khi component unmount hoặc trước khi effect chạy lại
  };
}, [dependencies]); // Dependencies array
```

### 2.2 Ba dạng useEffect

```jsx
function EffectExamples() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ════════════════════════════════════════
  // Dạng 1: Không có dependency array
  // → Chạy SAU MỖI LẦN render (mount + mỗi update)
  // → HIẾM KHI dùng, thường là bug!
  // ════════════════════════════════════════
  useEffect(() => {
    console.log('Chạy sau MỖI render');
  });

  // ════════════════════════════════════════
  // Dạng 2: Dependency array rỗng []
  // → Chỉ chạy MỘT LẦN sau mount đầu tiên
  // → Tương đương componentDidMount
  // ════════════════════════════════════════
  useEffect(() => {
    console.log('Chạy MỘT LẦN khi mount');
    // Fetch data, setup subscriptions, etc.
  }, []);

  // ════════════════════════════════════════
  // Dạng 3: Có dependencies
  // → Chạy khi mount VÀ khi dependency thay đổi
  // ════════════════════════════════════════
  useEffect(() => {
    console.log('count thay đổi:', count);
    document.title = `Đếm: ${count}`;
  }, [count]);  // Chỉ chạy khi count thay đổi

  useEffect(() => {
    console.log('name hoặc count thay đổi');
  }, [name, count]);  // Chạy khi name HOẶC count thay đổi

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  );
}
```

### 2.3 Cleanup Function

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return; // Không tạo interval nếu chưa chạy

    const intervalId = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // 🧹 Cleanup: Dọn dẹp interval khi:
    // 1. Component unmount
    // 2. isRunning thay đổi (effect chạy lại)
    return () => {
      clearInterval(intervalId);
      console.log('Đã dọn dẹp interval');
    };
  }, [isRunning]);

  return (
    <div>
      <h2>⏱️ {seconds}s</h2>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '⏸️ Dừng' : '▶️ Bắt đầu'}
      </button>
      <button onClick={() => { setIsRunning(false); setSeconds(0); }}>
        🔄 Reset
      </button>
    </div>
  );
}
```

### 2.4 Fetch Data với useEffect

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Flag để tránh update state sau khi unmount
    let isCancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) throw new Error('Không tìm thấy user');
        const data = await response.json();

        if (!isCancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup: Đánh dấu cancelled nếu userId thay đổi hoặc unmount
    return () => {
      isCancelled = true;
    };
  }, [userId]); // Fetch lại khi userId thay đổi

  if (loading) return <p>⏳ Đang tải...</p>;
  if (error) return <p>❌ Lỗi: {error}</p>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>📧 {user.email}</p>
      <p>📞 {user.phone}</p>
    </div>
  );
}
```

### 2.5 AbortController (Cách hiện đại để cancel request)

```jsx
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/data`, {
        signal: controller.signal  // Gắn signal vào fetch
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      // AbortError = request bị cancel, bỏ qua
    }
  };

  fetchData();

  return () => controller.abort(); // Cancel request khi cleanup
}, []);
```

### 2.6 Event Listeners & Window Events

```jsx
function WindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: GỠ event listener khi unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Chỉ mount/unmount

  return (
    <p>Kích thước: {windowSize.width} × {windowSize.height}</p>
  );
}
```

### 2.7 localStorage Sync

```jsx
function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Sử dụng
function Settings() {
  const [theme, setTheme] = usePersistentState('theme', 'light');
  const [fontSize, setFontSize] = usePersistentState('fontSize', 16);

  return (
    <div>
      <select value={theme} onChange={e => setTheme(e.target.value)}>
        <option value="light">🌞 Sáng</option>
        <option value="dark">🌙 Tối</option>
      </select>
      <input
        type="range"
        min="12"
        max="24"
        value={fontSize}
        onChange={e => setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

---

## 3. useRef

### 3.1 Tham chiếu DOM elements

```jsx
function FocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto focus khi mount
    inputRef.current.focus();
  }, []);

  const handleButtonClick = () => {
    inputRef.current.focus();
    inputRef.current.select(); // Chọn toàn bộ text
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Tự động focus" />
      <button onClick={handleButtonClick}>Focus Input</button>
    </div>
  );
}
```

### 3.2 Lưu giá trị persistent (không trigger re-render)

```jsx
function StopWatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);     // Lưu interval ID
  const startTimeRef = useRef(null);    // Lưu thời điểm bắt đầu

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now() - time;

    intervalRef.current = setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10);
  };

  const stop = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    stop();
    setTime(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'monospace', fontSize: 48 }}>
        {formatTime(time)}
      </h1>
      <button onClick={start} disabled={isRunning}>▶️</button>
      <button onClick={stop} disabled={!isRunning}>⏸️</button>
      <button onClick={reset}>🔄</button>
    </div>
  );
}
```

### 3.3 Theo dõi giá trị trước đó (Previous Value)

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current; // Trả về giá trị render TRƯỚC
}

// Sử dụng
function PriceDisplay({ price }) {
  const prevPrice = usePrevious(price);

  const priceChange = prevPrice !== undefined ? price - prevPrice : 0;

  return (
    <div>
      <h2>{price.toLocaleString('vi-VN')}đ</h2>
      {priceChange !== 0 && (
        <span style={{ color: priceChange > 0 ? 'red' : 'green' }}>
          {priceChange > 0 ? '📈' : '📉'} {Math.abs(priceChange).toLocaleString('vi-VN')}đ
        </span>
      )}
    </div>
  );
}
```

### 3.4 Render Count (Debug)

```jsx
function RenderCounter() {
  const renderCount = useRef(0);

  // useRef KHÔNG trigger re-render khi thay đổi
  renderCount.current += 1;

  return <p>Render lần thứ: {renderCount.current}</p>;
}
```

### useState vs useRef

```
useState:  Thay đổi → trigger re-render → UI cập nhật
useRef:    Thay đổi → KHÔNG re-render → UI giữ nguyên

useState = dữ liệu HIỂN THỊ trên UI
useRef   = dữ liệu NỘI BỘ (timer IDs, DOM refs, previous values)
```

---

## 4. useContext (Giới Thiệu)

> Chi tiết xem [Bài 13 - Context API](./13-context-api.md)

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Tạo Context
const ThemeContext = createContext('light');

// 2. Provider bọc app
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  );
}

// 3. Consume ở bất kỳ component con nào (không cần props drilling)
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header style={{
      background: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#fff' : '#333'
    }}>
      <h1>My App</h1>
      <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
    </header>
  );
}

function Main() {
  const { theme } = useContext(ThemeContext);
  return <main className={`theme-${theme}`}>Nội dung</main>;
}
```

---

## 5. Dependency Array Deep Dive

### Quy tắc dependencies

```jsx
function SearchComponent({ query, filters }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Mọi giá trị reactive SỬ DỤNG bên trong effect
    // PHẢI nằm trong dependency array
    fetchResults(query, filters).then(setResults);
  }, [query, filters]); // ✅ Liệt kê ĐẦY ĐỦ

  // ❌ SAI - thiếu dependency
  useEffect(() => {
    fetchResults(query, filters).then(setResults);
  }, [query]); // Thiếu `filters`!

  // ❌ SAI - không cần thiết
  useEffect(() => {
    console.log('mounted');
  }, [query]); // `query` không được sử dụng trong effect
}
```

### Object/Array trong dependencies

```jsx
function App() {
  const [user, setUser] = useState({ name: 'An', age: 25 });

  // ❌ Effect chạy MỖI render vì object reference mới
  useEffect(() => {
    console.log('User changed');
  }, [user]); // { name: 'An', age: 25 } !== { name: 'An', age: 25 }

  // ✅ Dùng primitive values
  useEffect(() => {
    console.log('Name changed:', user.name);
  }, [user.name]); // String comparison, ổn định

  // ✅ Hoặc dùng JSON.stringify (cẩn thận performance)
  useEffect(() => {
    console.log('User changed');
  }, [JSON.stringify(user)]);
}
```

---

## 6. Common useEffect Mistakes

```jsx
// ❌ Mistake 1: Infinite loop
function Bad1() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    setData([1, 2, 3]); // setData → re-render → effect chạy lại → loop!
  }); // Thiếu dependency array!
}

// ❌ Mistake 2: Object dependency gây loop
function Bad2() {
  const [count, setCount] = useState(0);
  const options = { min: 0, max: count }; // Object MỚI mỗi render

  useEffect(() => {
    console.log(options);
  }, [options]); // Loop! Reference mới mỗi lần

  // ✅ Fix: useMemo hoặc dùng primitive
  // const options = useMemo(() => ({ min: 0, max: count }), [count]);
}

// ❌ Mistake 3: Quên cleanup
function Bad3() {
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    // Quên clearInterval → memory leak!
  }, []);
  
  // ✅ Fix
  useEffect(() => {
    const id = setInterval(() => console.log('tick'), 1000);
    return () => clearInterval(id); // Cleanup!
  }, []);
}
```

---

## 📝 Bài Tập Thực Hành

### Bài 1: Digital Clock
Hiển thị đồng hồ realtime (giờ:phút:giây), cập nhật mỗi giây. Nhớ cleanup interval.

### Bài 2: Fetch & Display
Fetch danh sách users từ JSONPlaceholder API, hiển thị với loading/error states.

### Bài 3: Window Scroll Tracker
Theo dõi scroll position, hiển thị "Back to top" button khi scroll xuống > 300px.

### Bài 4: Local Storage Notes
Ứng dụng ghi chú đồng bộ với localStorage. Notes persist khi refresh trang.

---

## 🔑 Tóm Tắt

| Hook | Mục đích | Ví dụ |
|------|---------|-------|
| `useState` | Quản lý state | Counter, form values |
| `useEffect` | Side effects | API calls, timers, DOM manipulation |
| `useRef` | DOM ref & persistent values | Focus input, timer IDs |
| `useContext` | Truy cập context | Theme, auth, locale |

| Dependencies | Khi nào chạy |
|-------------|-------------|
| Không có `[]` | Mỗi render |
| `[]` rỗng | Chỉ khi mount |
| `[a, b]` | Khi mount + khi a hoặc b thay đổi |

---

> **Bài trước:** [09 - Forms ←](./09-forms.md)  
> **Bài tiếp theo:** [11 - Hooks Nâng Cao →](./11-hooks-nang-cao.md)
