// Chương 12: Vòng Đời Component (Lifecycle)
import { useState, useEffect, Component, ErrorBoundary } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Class Component Lifecycle ═══
// Để hiểu cơ bản vì sao Hooks lại thuận tiện hơn
class LegacyCounter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('[Legacy] constructor: Khởi tạo state');
  }

  componentDidMount() {
    console.log('[Legacy] componentDidMount: Render lần đầu xong (Gọi API ở đây)');
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.count !== this.state.count) {
      console.log(`[Legacy] componentDidUpdate: Count đổi từ ${prevState.count} sang ${this.state.count}`);
    }
  }

  componentWillUnmount() {
    console.log('[Legacy] componentWillUnmount: Component bị xóa (Dọn dẹp RAM)');
  }

  render() {
    console.log('[Legacy] render: Đang vẽ UI...');
    return (
      <div className="card text-center pb-8 p-16">
        <h4 className="mb-16">Class Component Lifecycle (Cũ)</h4>
        <button className="btn btn-secondary" onClick={() => this.setState({ count: this.state.count + 1 })}>
          Count: {this.state.count}
        </button>
        <p className="text-sm mt-8 text-muted">Mở Console (F12) để xem thứ tự các hàm chạy.</p>
      </div>
    );
  }
}

// ═══ 2. Modern Functional Lifecycle (useEffect) ═══
function ModernCounter() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 4));

  // componentDidMount (Chỉ chạy 1 lần)
  useEffect(() => {
    addLog('🟢 Mounted (Render lần đầu)');
    
    // componentWillUnmount (Chạy khi component bị hủy)
    return () => console.log('🔴 Unmounted (Component bị xóa khỏi DOM)');
  }, []);

  // componentDidUpdate (Chạy khi count thay đổi)
  useEffect(() => {
    if (count > 0) {
      addLog(`🔄 Updated: Count = ${count}`);
    }
    
    // Cleanup Effect TRƯỚC khi update lần tiếp theo
    return () => {
      if (count > 0) console.log(`🧹 Cleanup Effect cũ của Count = ${count}`);
    };
  }, [count]);

  return (
    <div className="grid-2">
       <div className="card text-center pb-8 p-16">
        <h4 className="mb-16">Functional Component (Mới)</h4>
        <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        <p className="text-sm mt-8 text-muted">useEffect thay thế hoàn toàn các hàm Lifecycle cũ.</p>
      </div>

      <DemoResult label="Vòng đời (Log)">
        <ul style={{ paddingLeft: 20 }}>
          {logs.map((L, i) => (
             <li className="text-sm mb-8" key={i}>{L}</li>
          ))}
        </ul>
      </DemoResult>
    </div>
  );
}

// ═══ Component Điều Khiển Việc Hiện/Ẩn ═══
function ParentController() {
  const [showLegacy, setShowLegacy] = useState(false);
  const [showModern, setShowModern] = useState(true);

  return (
    <div>
      <div className="flex gap-16 mb-24 justify-center">
        <button 
          className={`btn ${showLegacy ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setShowLegacy(!showLegacy)}
        >
          {showLegacy ? 'Xóa Class Component' : 'Mount Class Component'}
        </button>
        <button 
          className={`btn ${showModern ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setShowModern(!showModern)}
        >
          {showModern ? 'Xóa Function Component' : 'Mount Function Component'}
        </button>
      </div>

      <div className="flex flex-col gap-16">
        {showLegacy && <LegacyCounter />}
        {showModern && <ModernCounter />}
      </div>
      
      {(!showLegacy && !showModern) && (
        <p className="text-center text-muted p-16 card">Không có component nào được mount. Hãy bật lên để xem vòng đời!</p>
      )}
    </div>
  );
}

// ═══ 3. Error Boundary (Ranh giới bắt lỗi) ═══
// LƯU Ý: Error Boundaries HIỆN TẠI VẪN PHẢI DÙNG CLASS COMPONENT!
class ErrorCatcher extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  // Cập nhật state nếu có lỗi để render UI fallback
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Log lỗi lên server (Sentry, v...v...)
  componentDidCatch(error, errorInfo) {
    console.error("Component UI bị sập:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center p-16" style={{ border: '2px solid var(--error)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <h4 style={{ color: 'var(--error)' }} className="mb-8">💥 Có Lỗi Xảy Ra! Không Thể Render.</h4>
          <p className="text-sm text-muted">Nhưng toàn bộ App Web không bị màn hình trắng.</p>
          <button className="btn btn-secondary btn-sm mt-16" onClick={() => this.setState({ hasError: false })}>
            Thử Lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component Cố tình gây lỗi (Buggy Component)
function BuggyComponent() {
  const [boom, setBoom] = useState(false);

  if (boom) {
    // Tung ra 1 cái lỗi (Exception)
    throw new Error('Đã bắt được Lỗi UI (Bởi Error Boundary)!');
  }

  return (
    <div className="card text-center p-16">
      <h4 className="mb-16">Component Hoạt Động Cực Kỳ Tốt</h4>
      <button className="btn btn-danger" onClick={() => setBoom(true)}>
        👉 Gây Lỗi Render (Sập Component)
      </button>
    </div>
  );
}


export default function Ch12_Lifecycle() {
  return (
    <div>
      <h1 className="page-title">🔄 Bài 12: Lifecycle (Vòng Đời)</h1>
      <p className="page-subtitle">Mounting, Updating, Unmounting và Error Boundaries</p>

      <h2>1. Mount - Update - Unmount Của Function (Mới)</h2>
      <DemoSection title="useEffect Đóng Vài Trò Bao Trọn" badge="Vòng đời Gắn/Tháo">
        <InfoBox>Thử Bật và Tắt (Mount / Unmount) Component. Đây là lý do tại sao phải xóa event/timers/fetch ở Hook <code className="code-inline">return () =&gt; &#123;&#125;</code> (Cleanup function).</InfoBox>
        <ParentController />
      </DemoSection>

      <h2>2. Dùng Class Để Bắt Lỗi Render Cục Bộ (Error Boundary)</h2>
      <DemoSection title="Gây Lỗi UI Để Bắt (Tránh Màn Hình Trắng)" badge="Lá Chắn">
        <InfoBox type="warning">
           Trong React Functional, nếu 1 Component bị Throw Lỗi, TOÀN BỘ CÂY DOM SẼ BỊ XÓA = MÀN HÌNH TRẮNG. Error Boundary (Chỉ Class Component mới có) giúp khoanh vùng vụ nổ lại giống <code className="code-inline">try...catch</code> của Render.
        </InfoBox>
        
        <div className="grid-2 mt-16">
            <div>
               <h4 className="mb-8 text-center text-muted">Có Error Boundary Bọc Quanh</h4>
               {/* Lỗi được bọc gọn trong này */}
               <ErrorCatcher>
                  <BuggyComponent />
               </ErrorCatcher>
            </div>

            <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
               <h4 className="mb-8 text-center text-muted">Không Có Bọc Quanh (Sập App)</h4>
               <div className="card text-center p-16">
                   <p className="text-sm">Nếu bấm vào tôi thì App của bạn sẽ Nổ (Trắng xóa). Tôi đã bị làm mờ để an toàn cho bài học.</p>
               </div>
            </div>
        </div>
      </DemoSection>

    </div>
  );
}
