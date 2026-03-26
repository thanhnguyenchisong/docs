// Chương 6: Event Handling
import { useState } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ Sự kiện cơ bản ═══
function BasicEvents() {
  const [lastAction, setLastAction] = useState('Chưa có hành động');

  const handleClick = (e) => {
    setLastAction(`Click vào Button tại x:${e.clientX}, y:${e.clientY}`);
  };

  const handleDoubleClick = () => {
    setLastAction('Double Click!');
  };

  const handleMouseEnter = () => {
    setLastAction('Chuột di chuyển vào vùng xanh');
  };

  const handleMouseLeave = () => {
    setLastAction('Chuột rời khỏi vùng xanh');
  };

  return (
    <div className="grid-2">
      <div className="flex flex-wrap gap-16">
        <button className="btn btn-primary" onClick={handleClick}>Click Me</button>
        <button className="btn btn-danger" onDoubleClick={handleDoubleClick}>Double Click Me</button>
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            padding: '24px',
            background: 'var(--success)',
            color: 'white',
            borderRadius: 'var(--radius)',
            cursor: 'crosshair',
            width: '100%',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Hover over me
        </div>
      </div>
      <DemoResult label="Lần hành động cuối cùng">
        <p className="code-inline" style={{ padding: 12 }}>{lastAction}</p>
      </DemoResult>
    </div>
  );
}

// ═══ Form Events & Prevent Default ═══
function FormEvents() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); // THIẾT YẾU: Ngăn tải lại trang
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid-2">
      <form onSubmit={handleSubmit} className="card">
        <div className="input-group">
          <label>Tên</label>
          <input 
            className="input" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input 
            className="input" 
            type="email"
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full mt-16">Đăng Ký</button>
      </form>
      
      <div className="card">
        <h4 className="mb-16">Trạng thái Form</h4>
        {submitted && (
          <div className="alert alert-success animate-fadeIn mb-16">
            Gửi thành công! Giao diện không bị tải lại.
          </div>
        )}
        <p className="text-sm">Đang nhập:</p>
        <ul className="text-muted text-sm mt-8" style={{ paddingLeft: 20 }}>
          <li>Tên: {formData.name || '...'}</li>
          <li>Email: {formData.email || '...'}</li>
        </ul>
      </div>
    </div>
  );
}

// ═══ Keyboard Events ═══
function KeyboardEvents() {
  const [logs, setLogs] = useState([]);

  const handleKeyDown = (e) => {
    setLogs(prev => [
      { key: e.key, code: e.code, modifiers: []
          .concat(e.ctrlKey ? 'Ctrl' : [])
          .concat(e.shiftKey ? 'Shift' : [])
          .concat(e.altKey ? 'Alt' : [])
          .join('+') 
      },
      ...prev
    ].slice(0, 5)); // Lưu tối đa 5 logs

    if (e.key === 'Enter') {
      alert('Bạn vừa nhấn Enter!');
    }
  };

  return (
    <div>
      <input 
        className="input" 
        placeholder="Gõ gì đó vào đây (thử nhấn Enter)..." 
        onKeyDown={handleKeyDown}
      />
      <div className="mt-16">
        <h4 className="mb-8">Log bàn phím (5 phím cuối):</h4>
        {logs.map((log, i) => (
          <div key={i} className="flex justify-between items-center" style={{
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: 13
          }}>
            <span>Phím: <strong style={{ color: 'var(--accent)' }}>{log.key}</strong></span>
            <span className="text-muted">Mã: {log.code}</span>
            {log.modifiers && <span className="badge badge-warning">{log.modifiers}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ Event Delegation / Propagation ═══
function EventPropagation() {
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 4));

  const handleContainerClick = () => addLog('Div Bọc Ngoài bị click (Sự kiện lan ra)');
  const handleInnerClick = () => addLog('Nút BÊN TRONG bị click');
  const handleStopClick = (e) => {
    e.stopPropagation(); // Ngăn sự kiện nổi bọt (bubbling) ra ngoài
    addLog('Nút NGĂN CẢN bị click (Sự kiện DỪNG LẠI tại đây)');
  };

  return (
    <div className="grid-2">
      <div 
        className="card" 
        style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: '2px dashed var(--border)' }}
        onClick={handleContainerClick}
      >
        <h4 className="mb-16">Vùng có thể Click</h4>
        <div className="flex gap-16">
          <button className="btn btn-primary" onClick={handleInnerClick}>
            Nút Thường
          </button>
          <button className="btn btn-danger" onClick={handleStopClick}>
            Nút Ngăn Lan Truyền
          </button>
        </div>
      </div>
      
      <DemoResult label="Log Lan Truyền (Bubbling)">
        <ul style={{ paddingLeft: 20 }}>
          {logs.map((log, i) => (
            <li key={i} className="text-sm mb-8">{log}</li>
          ))}
        </ul>
        <button className="btn btn-secondary btn-sm mt-8" onClick={() => setLogs([])}>Xóa Log</button>
      </DemoResult>
    </div>
  );
}

export default function Ch06_Events() {
  return (
    <div>
      <h1 className="page-title">🖱️ Bài 06: Event Handling</h1>
      <p className="page-subtitle">Synthetic Events, xử lý sự kiện form, chuột, bàn phím và ngăn lan truyền.</p>

      <h2>1. Các Sự Kiện Chuột Cơ Bản</h2>
      <DemoSection title="Click, Hover, Double Click" badge="onClick">
        <InfoBox>Trong React, sự kiện dùng cú pháp camelCase (ví dụ: onClick thay vì onclick) và nhận một hàm làm callback.</InfoBox>
        <BasicEvents />
      </DemoSection>

      <h2>2. Xử Lý Form và Default Behavior</h2>
      <DemoSection title="Form Submit & Input Change" badge="e.preventDefault()">
        <InfoBox type="warning">Luôn gọi <code className="code-inline">e.preventDefault()</code> trong <code className="code-inline">onSubmit</code> của thẻ form để ngăn trình duyệt tải lại trang.</InfoBox>
        <FormEvents />
      </DemoSection>

      <h2>3. Sự Kiện Bàn Phím</h2>
      <DemoSection title="Key Down/Up" badge="onKeyDown">
        <KeyboardEvents />
      </DemoSection>

      <h2>4. Lan Truyền Sự Kiện (Event Bubbling)</h2>
      <DemoSection title="Stop Propagation" badge="e.stopPropagation()">
        <InfoBox>
          Mặc định, sự kiện ở phần tử con sẽ "nổi bọt" (lan truyền) lên các phần tử cha. Dùng <code className="code-inline">e.stopPropagation()</code> để chặn điều này.
        </InfoBox>
        <EventPropagation />
      </DemoSection>

    </div>
  );
}
