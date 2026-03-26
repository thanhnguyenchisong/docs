// Chương 2: JSX Cơ bản
import { DemoSection, DemoResult, InfoBox } from '../components/DemoSection.jsx';

// JSX Demo components
function JSXExpressions() {
  const name = 'React Developer';
  const age = 25;
  const isVIP = true;
  const skills = ['React', 'TypeScript', 'Node.js'];
  const today = new Date();

  return (
    <div>
      {/* Nhúng biến */}
      <p>👋 Xin chào, <strong>{name}</strong></p>

      {/* Biểu thức tính toán */}
      <p>🎂 Tuổi: {age} (sinh năm {today.getFullYear() - age})</p>

      {/* Ternary */}
      <p>⭐ Trạng thái: {isVIP ? '🌟 VIP Member' : 'Regular Member'}</p>

      {/* Method calls */}
      <p>💼 Kỹ năng: {skills.join(' • ')}</p>

      {/* Template literal */}
      <p>📅 {today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      {/* Inline styles (object) */}
      <p style={{ color: '#6366f1', fontWeight: 'bold', marginTop: 8 }}>
        ✨ Styled with inline object
      </p>
    </div>
  );
}

function JSXFragments() {
  // Fragment để nhóm elements không cần wrapper div
  return (
    <>
      <p>📌 Phần tử 1 - Không có wrapper div</p>
      <p>📌 Phần tử 2 - Cùng cấp với phần tử 1</p>
      <p>📌 Phần tử 3 - Fragment giữ DOM sạch</p>
    </>
  );
}

function JSXConditional() {
  const score = 85;
  const level = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';

  return (
    <div>
      <p>📊 Điểm: {score}/100</p>
      <span
        className={`badge ${level === 'A' ? 'badge-success' : level === 'B' ? 'badge-info' : 'badge-warning'}`}
      >
        Xếp loại: {level}
      </span>
    </div>
  );
}

function JSXMapList() {
  const frameworks = [
    { name: 'React', stars: '⭐⭐⭐⭐⭐' },
    { name: 'Vue', stars: '⭐⭐⭐⭐' },
    { name: 'Angular', stars: '⭐⭐⭐⭐' },
    { name: 'Svelte', stars: '⭐⭐⭐' },
  ];

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {frameworks.map((fw, index) => (
        <li key={index} style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{fw.name}</span>
          <span>{fw.stars}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Ch02_JSX() {
  return (
    <div>
      <h1 className="page-title">📝 Bài 02: JSX Cơ Bản</h1>
      <p className="page-subtitle">Cú pháp JSX, nhúng biểu thức, Fragments, điều kiện</p>

      <h2>Nhúng Biểu Thức JavaScript</h2>
      <DemoSection title="JSX Expressions" badge="Biểu thức JS trong {}">
        <JSXExpressions />
      </DemoSection>

      <h2>Fragments</h2>
      <DemoSection title="React Fragments" badge="<>...</>">
        <InfoBox>Fragment {"<>...</>"} nhóm elements mà KHÔNG tạo thêm DOM node</InfoBox>
        <JSXFragments />
      </DemoSection>

      <h2>Conditional trong JSX</h2>
      <DemoSection title="Ternary Operator" badge="condition ? A : B">
        <JSXConditional />
      </DemoSection>

      <h2>Render List với map()</h2>
      <DemoSection title="Array.map() trong JSX" badge="Render danh sách">
        <JSXMapList />
      </DemoSection>

      <h2>Quy tắc JSX</h2>
      <DemoSection title="JSX Rules" badge="Quan trọng">
        <div className="grid-2">
          <div className="card">
            <p className="text-sm"><strong>1. Một root element</strong></p>
            <p className="text-sm text-muted">Mỗi return chỉ 1 root (dùng {"<>"} nếu cần)</p>
          </div>
          <div className="card">
            <p className="text-sm"><strong>2. Đóng tất cả tags</strong></p>
            <p className="text-sm text-muted">{"<img />"}, {"<br />"}, {"<input />"}</p>
          </div>
          <div className="card">
            <p className="text-sm"><strong>3. className thay class</strong></p>
            <p className="text-sm text-muted">class là từ khóa JS</p>
          </div>
          <div className="card">
            <p className="text-sm"><strong>4. htmlFor thay for</strong></p>
            <p className="text-sm text-muted">for là từ khóa JS</p>
          </div>
        </div>
      </DemoSection>
    </div>
  );
}
