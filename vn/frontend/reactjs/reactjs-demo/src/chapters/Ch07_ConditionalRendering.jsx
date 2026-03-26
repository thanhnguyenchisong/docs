// Chương 7: Conditional Rendering
import { useState } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Lệnh if / Early Return ═══
function ProfileCard({ isLoggedIn, onLogin, onLogout }) {
  if (!isLoggedIn) {
    return (
      <div className="card text-center" style={{ border: '1px solid var(--warning)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h4 className="mb-16">Bạn chưa đăng nhập</h4>
        <button className="btn btn-primary" onClick={onLogin}>Đăng nhập ngay</button>
      </div>
    );
  }

  // Đây là luồng khi ĐÃ đăng nhập (Early return đã chặn phần trên)
  return (
    <div className="card" style={{ border: '1px solid var(--success)' }}>
      <div className="flex items-center gap-16 mb-16">
        <div style={{ width: 48, height: 48, background: 'var(--success)', borderRadius: '50%', color: '#fff', fontSize: 24, textAlign: 'center', lineHeight: '48px' }}>👤</div>
        <div>
          <h4>Người dùng VIP</h4>
          <span className="badge badge-success">Đang hoạt động</span>
        </div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={onLogout}>Thoát</button>
    </div>
  );
}

// ═══ 2. Toán tử Ternary ( condition ? true : false ) ═══
function StatusBadge({ status }) {
  // Thay đổi className và text dựa trên status
  return (
    <div style={{ display: 'inline-block' }}>
      <span className={`badge ${status === 'online' ? 'badge-success' : status === 'busy' ? 'badge-error' : 'badge-warning'}`}>
        {status === 'online' ? '🟢 Trực tuyến' : status === 'busy' ? '🔴 Bận' : '🟡 Vắng mặt'}
      </span>
    </div>
  );
}

// ═══ 3. Toán tử && ( Logical AND ) ═══
function NotificationBell({ unreadCount }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: 8 }}>
      <span style={{ fontSize: 24 }}>🔔</span>
      
      {/* CHỈ hiển thị badge khi unreadCount > 0 */}
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'var(--error)',
          color: 'white',
          fontSize: 10,
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: 10,
          transform: 'translate(25%, -25%)'
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}

// ═══ 4. Object Mapping (Tránh dùng quá nhiều if/else) ═══
const STEP_COMPONENTS = {
  1: <div className="p-16 text-center">Bước 1: Nhập thông tin cá nhân</div>,
  2: <div className="p-16 text-center">Bước 2: Chọn gói dịch vụ</div>,
  3: <div className="p-16 text-center">Bước 3: Hoàn tất thanh toán</div>,
};

function MultiStepForm() {
  const [step, setStep] = useState(1);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-16" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={step === 1} 
          onClick={() => setStep(s => s - 1)}
        >
          Trở lại
        </button>
        <span className="badge badge-accent">Tiến trình: {step} / 3</span>
        <button 
          className="btn btn-primary btn-sm" 
          disabled={step === 3} 
          onClick={() => setStep(s => s + 1)}
        >
          Tiếp theo
        </button>
      </div>

      {/* Lookup object dựa trên step hiện tại */}
      {STEP_COMPONENTS[step] || <div>Bước không xác định</div>}
    </div>
  );
}

// ═══ 5. Tránh Lỗi Falsy Values (Ví dụ: số 0) ═══
function FalsyValueWarning() {
  const count = 0; // Giá trị falsy

  return (
    <div className="grid-2">
      <div className="card" style={{ border: '1px dashed var(--error)' }}>
        <h4 className="mb-8">❌ SAI: Dùng {'count && <UI/>'} khi count là số 0</h4>
        {/* Lỗi: Sẽ in ra số 0 ra màn hình thay vì ẩn đi! */}
        <div>Kết quả: {count && <span className="badge badge-info">Có tin nhắn</span>}</div>
      </div>
      
      <div className="card" style={{ border: '1px solid var(--success)' }}>
        <h4 className="mb-8">✅ ĐÚNG: Ép kiểu boolean</h4>
        {/* Sửa: So sánh rõ ràng hoặc dùng !! */}
        <div>Kết quả: {count > 0 && <span className="badge badge-info">Có tin nhắn</span>}</div>
        <div className="text-sm text-muted mt-8">Gợi ý: Dùng `count {'>'} 0` hoặc `!!count`</div>
      </div>
    </div>
  );
}

export default function Ch07_ConditionalRendering() {
  const [isAuth, setIsAuth] = useState(false);
  const [messages, setMessages] = useState(5);

  return (
    <div>
      <h1 className="page-title">🔀 Bài 07: Kỹ Thuật Render Có Điều Kiện</h1>
      <p className="page-subtitle">if/else, Ternary Operator, Logical AND, và Object Mapping</p>

      <h2>1. Câu Lệnh if (Early Return)</h2>
      <DemoSection title="Profile Component" badge="if / return">
        <InfoBox>Thường dùng cho toàn bộ component (ví dụ: màn hình loading, chưa đăng nhập).</InfoBox>
        <ProfileCard 
          isLoggedIn={isAuth} 
          onLogin={() => setIsAuth(true)} 
          onLogout={() => setIsAuth(false)} 
        />
      </DemoSection>

      <h2>2. Toán Tử Ternary (Ba Ngôi)</h2>
      <DemoSection title="Trạng Thái Người Dùng" badge="condition ? A : B">
        <div className="flex gap-16 items-center">
          <StatusBadge status="online" />
          <StatusBadge status="busy" />
          <StatusBadge status="away" />
        </div>
      </DemoSection>

      <h2>3. Toán Tử && (Logical AND)</h2>
      <DemoSection title="Thông báo góc phải" badge="condition && <UI/>">
        <InfoBox type="warning">Dùng khi chỉ muốn hiện UI nếu đ/kiện đúng, và KHÔNG LÀM GÌ CẢ nếu đ/kiện sai.</InfoBox>
        <div className="flex items-center gap-16">
          <NotificationBell unreadCount={messages} />
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => setMessages(0)}>Đọc tất cả</button>
            <button className="btn btn-primary btn-sm ml-8" onClick={() => setMessages(m => m + 3)}>+3 Tin nhắn</button>
          </div>
        </div>
      </DemoSection>

      <h2>4. Lưu ý về giá trị Falsy trong React</h2>
      <DemoSection title="Cẩn thận với số 0" badge="Gotcha!">
        <FalsyValueWarning />
      </DemoSection>

      <h2>5. Object Mapping (Pattern Nâng Cao)</h2>
      <DemoSection title="Form Nhiều Bước" badge="Object[key]">
        <InfoBox>Thay vi dùng chuỗi if/else dài dòng, dùng Object Mapping để code sạch hơn khi render thay đổi dựa trên state cụ thể.</InfoBox>
        <MultiStepForm />
      </DemoSection>

    </div>
  );
}
