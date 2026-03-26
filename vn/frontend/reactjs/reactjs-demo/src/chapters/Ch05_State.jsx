// Chương 5: State
import { useState } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ State Cơ Bản ═══
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-16">
      <button className="btn btn-secondary" onClick={() => setCount(c => c - 1)}>-</button>
      <span style={{ fontSize: 24, fontWeight: 'bold', width: 40, textAlign: 'center' }}>{count}</span>
      <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
      <button className="btn btn-danger btn-sm" onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// ═══ State là Object ═══
function UserForm() {
  const [user, setUser] = useState({
    firstName: 'React',
    lastName: 'Developer',
    email: 'react@example.com'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // THIẾT YẾU: Phải copy object cũ (...user) trước khi update
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  return (
    <div className="grid-2">
      <div className="card">
        <div className="input-group">
          <label>Họ</label>
          <input className="input" name="firstName" value={user.firstName} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Tên</label>
          <input className="input" name="lastName" value={user.lastName} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input className="input" name="email" value={user.email} onChange={handleChange} />
        </div>
      </div>
      
      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
        <h4 className="mb-16 text-muted">Trạng thái State:</h4>
        <pre className="code-inline" style={{ display: 'block', padding: 16 }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ═══ State là Array ═══
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học React' },
    { id: 2, text: 'Làm Demo' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputValue
    };
    // THIẾT YẾU: Tạo array mới kết hợp array cũ
    setTodos(prev => [...prev, newTodo]);
    setInputValue('');
  };

  const handleRemove = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="flex gap-8 mb-16">
        <input 
          className="input" 
          placeholder="Thêm việc mới..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd}>Thêm</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} className="flex justify-between items-center" style={{ 
            padding: '12px 16px', 
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 8
          }}>
            <span>{todo.text}</span>
            <button className="btn btn-danger btn-sm" onClick={() => handleRemove(todo.id)}>Xóa</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p className="text-muted text-center mt-16">Chưa có công việc nào</p>}
    </div>
  );
}

// ═══ Lifting State Up ═══
// Cha chứa state
function ParentComponent() {
  const [sharedText, setSharedText] = useState('Dữ liệu chia sẻ');

  return (
    <div className="card" style={{ border: '2px solid var(--accent)' }}>
      <h4 className="mb-16">Parent Component (Nâng State Lên Đây)</h4>
      <p className="mb-16">Giá trị: <strong>{sharedText}</strong></p>
      
      <div className="grid-2">
        <ChildInput value={sharedText} onChange={setSharedText} title="Child 1 (Cập nhật)" />
        <ChildDisplay value={sharedText} title="Child 2 (Hiển thị)" />
      </div>
    </div>
  );
}

function ChildInput({ value, onChange, title }) {
  return (
    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
      <h4 className="mb-8 text-sm">{title}</h4>
      <input className="input" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ChildDisplay({ value, title }) {
  return (
    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
      <h4 className="mb-8 text-sm">{title}</h4>
      <div className="code-inline">{value}</div>
    </div>
  );
}

export default function Ch05_State() {
  return (
    <div>
      <h1 className="page-title">⚡ Bài 05: State</h1>
      <p className="page-subtitle">Quản lý state, immutability, và nâng state lên (Lifting State Up)</p>

      <h2>1. useState Hook Cơ Bản</h2>
      <DemoSection title="Counter - State cơ bản" badge="useState">
        <InfoBox>State là bộ nhớ của component. Khi state thay đổi, component sẽ tự động re-render (cập nhật giao diện).</InfoBox>
        <Counter />
      </DemoSection>

      <h2>2. Logic Bất Biến (Immutability) với Object & Array</h2>
      <DemoSection title="User Form - State là Object" badge="...spread">
        <InfoBox type="warning">KHÔNG BAO GIỜ thay đổi state trực tiếp (ví dụ: <code className="code-inline">user.name = 'A'</code>). Luôn tạo bản sao mới.</InfoBox>
        <UserForm />
      </DemoSection>

      <DemoSection title="Todo List - State là Array" badge="filter/map/...">
        <TodoList />
      </DemoSection>

      <h2>3. Nâng state lên (Lifting State Up)</h2>
      <DemoSection title="Giao tiếp giữa 2 anh em" badge="Shared State">
        <InfoBox>
          Khi nhiều component cần chung một dữ liệu, hãy "nâng" state đó lên component cha chung gần nhất của chúng.
        </InfoBox>
        <ParentComponent />
      </DemoSection>
    </div>
  );
}
