# Bài 12: Component Lifecycle - Vòng Đời Component

## 📚 Mục tiêu bài học
- Hiểu vòng đời component trong React
- Map class lifecycle methods sang hooks
- Cleanup patterns
- Error Boundaries

---

## 1. Vòng Đời Component

```
┌──────────────────────────────────────────────────┐
│                COMPONENT LIFECYCLE                │
│                                                   │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐   │
│  │ MOUNT   │───→│  UPDATE  │───→│ UNMOUNT   │   │
│  │(Khởi tạo)│   │(Cập nhật)│    │(Hủy bỏ)  │   │
│  └─────────┘    └──────────┘    └───────────┘   │
│       │              │               │            │
│  Component      State/Props      Component        │
│  xuất hiện      thay đổi        biến mất          │
│  trên DOM       → re-render     khỏi DOM          │
└──────────────────────────────────────────────────┘
```

## 2. Hooks Tương Đương Lifecycle Methods

```jsx
import { useState, useEffect, useRef } from 'react';

function LifecycleDemo() {
  const [count, setCount] = useState(0);
  const isFirstRender = useRef(true);

  // ════════════════════════════════════════
  // componentDidMount (chỉ chạy 1 lần khi mount)
  // ════════════════════════════════════════
  useEffect(() => {
    console.log('🟢 Component đã mount (xuất hiện trên DOM)');
    // Fetch data, setup subscriptions, init libraries

    // componentWillUnmount (cleanup khi unmount)
    return () => {
      console.log('🔴 Component sẽ unmount (biến mất khỏi DOM)');
      // Clear timers, cancel requests, remove listeners
    };
  }, []);

  // ════════════════════════════════════════
  // componentDidUpdate (chạy khi dependency thay đổi)
  // ════════════════════════════════════════
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Bỏ qua lần mount đầu tiên
    }
    console.log('🟡 count đã thay đổi:', count);
    // Logic chỉ chạy khi UPDATE, không chạy khi MOUNT
  }, [count]);

  // ════════════════════════════════════════
  // Mỗi render (cả mount và update)
  // ════════════════════════════════════════
  useEffect(() => {
    console.log('🔵 Component đã render (mount hoặc update)');
  });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
```

### Bảng so sánh Class Lifecycle vs Hooks

| Class Lifecycle | Hook tương đương |
|----------------|------------------|
| `constructor` | `useState(initialValue)` |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return cleanup }, [])` |
| `shouldComponentUpdate` | `React.memo()` |
| `getDerivedStateFromProps` | Tính toán trong render |
| `componentDidCatch` | Chưa có hook, dùng class Error Boundary |

---

## 3. Error Boundaries

Error Boundaries bắt lỗi JavaScript trong **render**, **lifecycle methods**, và **constructors** của cây component con.

> ⚠️ Error Boundaries **chỉ có thể viết bằng Class Component** (chưa có hook tương đương).

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Được gọi khi có lỗi trong child components
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log lỗi (gửi lên error tracking service)
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Gửi lên Sentry, LogRocket, etc.
    // errorTracker.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>😵 Đã xảy ra lỗi</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            🔄 Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ═══ Sử dụng ═══
function App() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Header lỗi</p>}>
        <Header />
      </ErrorBoundary>

      <ErrorBoundary>
        <Main />
      </ErrorBoundary>

      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}

// Component có thể gây lỗi
function BuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('💥 Component bị crash!');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Gây lỗi (test Error Boundary)
    </button>
  );
}
```

### Error Boundary KHÔNG bắt được:
- Event handlers (dùng try/catch)
- Async code (dùng try/catch trong async)
- Server-side rendering
- Lỗi trong chính Error Boundary

```jsx
// Xử lý lỗi trong event handlers
function SafeButton() {
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      // Xử lý lỗi ở đây
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi');
    }
  };

  return <button onClick={handleClick}>Click</button>;
}
```

---

## 4. Cleanup Patterns Quan Trọng

```jsx
function CleanupPatterns() {
  // 1. Timer cleanup
  useEffect(() => {
    const timer = setTimeout(() => doSomething(), 1000);
    const interval = setInterval(() => tick(), 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // 2. Event listener cleanup
  useEffect(() => {
    const handler = (e) => console.log(e);
    window.addEventListener('resize', handler);
    
    return () => window.removeEventListener('resize', handler);
  }, []);

  // 3. WebSocket cleanup
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com');
    ws.onmessage = (event) => setMessages(prev => [...prev, event.data]);
    
    return () => ws.close();
  }, []);

  // 4. AbortController cleanup
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      });
    
    return () => controller.abort();
  }, []);

  // 5. Intersection Observer cleanup
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) loadMore();
      });
    });
    
    if (targetRef.current) observer.observe(targetRef.current);
    
    return () => observer.disconnect();
  }, []);
}
```

---

## 5. Thứ Tự Thực Thi

```jsx
function ExecutionOrder() {
  console.log('1. Render (mỗi lần)');

  useEffect(() => {
    console.log('3. useEffect - no deps (sau MỖI render)');
  });

  useEffect(() => {
    console.log('3. useEffect - [] (chỉ sau mount)');
    return () => console.log('Cleanup - [] (khi unmount)');
  }, []);

  useEffect(() => {
    console.log('3. useEffect - [dep] (sau mount + khi dep đổi)');
    return () => console.log('Cleanup - [dep] (trước re-run hoặc unmount)');
  }, [dep]);

  // Thứ tự:
  // MOUNT:   1.Render → 2.DOM update → 3.Effects (theo thứ tự khai báo)
  // UPDATE:  1.Render → 2.DOM update → 3.Cleanup cũ → 4.Effects mới
  // UNMOUNT: Cleanup tất cả effects
}
```

---

## 📝 Bài Tập

### Bài 1: Component với đầy đủ lifecycle logging
### Bài 2: Error Boundary bọc nhiều sections
### Bài 3: Chat component với WebSocket (mock) + cleanup
### Bài 4: Infinite scroll với Intersection Observer + cleanup

---

> **Bài trước:** [11 - Hooks Nâng Cao ←](./11-hooks-nang-cao.md)  
> **Bài tiếp theo:** [13 - Context API →](./13-context-api.md)
