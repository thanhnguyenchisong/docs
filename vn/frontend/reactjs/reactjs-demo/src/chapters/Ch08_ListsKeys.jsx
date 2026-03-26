// Chương 8: Lists & Keys
import { useState } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ Dữ liệu gốc ═══
const initialTasks = [
  { id: 1, name: 'Học ReactJS', priority: 'high', checked: false },
  { id: 2, name: 'Nấu ăn tối', priority: 'low', checked: true },
  { id: 3, name: 'Tập thể dục', priority: 'medium', checked: false },
  { id: 4, name: 'Đọc sách', priority: 'low', checked: false },
];

function BasicList() {
  const [tasks, setTasks] = useState(initialTasks);
  
  const sortTasks = () => {
    // Sắp xếp theo ID giảm dần (để thấy rõ sự thay đổi vị trí)
    const sorted = [...tasks].sort((a, b) => b.id - a.id);
    setTasks(sorted);
  };
  
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, checked: !t.checked} : t));
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h4 className="mb-16">✅ List ĐÚNG (Có Key id)</h4>
        <p className="text-sm text-muted mb-8">React nhận dạng đúng item khi vị trí thay đổi</p>
        <button className="btn btn-secondary btn-sm mb-16" onClick={sortTasks}>🔀 Đảo ngược thứ tự</button>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map(task => (
             // ✅ ĐÚNG: key={task.id}
            <li key={task.id} 
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: task.checked ? 0.5 : 1
              }}
            >
              <input type="checkbox" checked={task.checked} onChange={() => toggleTask(task.id)} />
              <span style={{ textDecoration: task.checked ? 'line-through' : 'none' }}>
                {task.name}
              </span>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>ID: {task.id}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ border: '1px dashed var(--error)' }}>
        <h4 className="mb-16">❌ List SAI (Dùng Index làm Key)</h4>
        <p className="text-sm" style={{ color: 'var(--error)' }}>Thử check dòng đầu, rồi bấm đảo ngược bên trái xem lỗi nhé!</p>
        
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 45 }}>
          {/* Lỗi nghiêm trọng: Dùng index cho Array bị thay đổi vị trí */}
          {tasks.map((task, index) => (
            // ❌ SAI: key={index}
            <li key={index} 
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--error)',
                display: 'flex', alignItems: 'center', gap: 12
              }}
            >
              <input type="checkbox" /> {/* State nội bộ bị lộn xộn vì key=index */}
              <span>{task.name}</span>
              <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>IDX: {index}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ═══ Map, Filter, Reduce trong Render ═══
function FilterSortList() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'completed'
  const [search, setSearch] = useState('');

  // 1. Filter theo text và trạnh thái
  const visibleTasks = tasks.filter(task => {
    // Text search
    const matchSearch = task.name.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    if (filterMode === 'active') return matchSearch && !task.checked;
    if (filterMode === 'completed') return matchSearch && task.checked;
    return matchSearch; // 'all'
  });

  // 2. Reduce lấy thống kê
  const stats = tasks.reduce((acc, curr) => {
    if (curr.checked) acc.done++;
    else acc.pending++;
    return acc;
  }, { done: 0, pending: 0 });

  return (
    <div className="card">
      <div className="flex gap-16 mb-16 items-center">
        <input 
          className="input" 
          placeholder="🔍 Tìm kiếm..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ flex: 1 }}
        />
        <div className="flex gap-8">
          <button className={`btn ${filterMode==='all'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setFilterMode('all')}>Tất cả</button>
          <button className={`btn ${filterMode==='active'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setFilterMode('active')}>Chưa xong</button>
          <button className={`btn ${filterMode==='completed'?'btn-primary':'btn-secondary'} btn-sm`} onClick={() => setFilterMode('completed')}>Đã xong</button>
        </div>
      </div>

      <div className="flex gap-16 mb-16">
        <span className="badge badge-success">Hoàn thành: {stats.done}</span>
        <span className="badge badge-warning">Còn lại: {stats.pending}</span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleTasks.length === 0 ? (
          <li className="text-center text-muted p-16">Không có kết quả!</li>
        ) : (
          visibleTasks.map(task => (
            <li key={task.id} style={{
              padding: '12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span>{task.checked ? '✅' : '⏳'} {task.name}</span>
              <span className={`badge badge-${task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                {task.priority.toUpperCase()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function Ch08_ListsKeys() {
  return (
    <div>
      <h1 className="page-title">📋 Bài 08: Lists & Keys</h1>
      <p className="page-subtitle">Array.map() và quy tắc quan trọng về Key độc nhất.</p>

      <h2>1. Tầm Quan Trọng Của Key</h2>
      <DemoSection title="So sánh Index vs ID làm Key" badge="Quan Trọng">
        <InfoBox type="warning">
          <strong>Vì sao KHÔNG dùng index cho dynamic lists:</strong><br/>
          Nếu dùng <code className="code-inline">key=&#123;index&#125;</code>, khi list bị thay đổi vị trí, xóa phần tử ở giữa, hoặc chèn vào đầu, index của các phần tử đằng sau sẽ bị lệch. Lúc này React gán nhầm state nội bộ của component cũ (theo index) sang data mới.
        </InfoBox>
        <BasicList />
      </DemoSection>

      <h2>2. Xử Lý Danh Sách: Lọc và Rút Gọn (Filter/Reduce)</h2>
      <DemoSection title="Bảng Công Việc" badge="Map/Filter/Reduce">
        <InfoBox>
          Quy tắc chuẩn: KHÔNG bao giờ đổi mảng data gốc (<code className="code-inline">tasks</code>). Luôn tính toán (derived) mảng phụ (biên <code className="code-inline">visibleTasks</code>) bằng <code className="code-inline">filter</code> hoặc <code className="code-inline">sort</code> trong lúc render để hiển thị.
        </InfoBox>
        <FilterSortList />
      </DemoSection>

    </div>
  );
}
