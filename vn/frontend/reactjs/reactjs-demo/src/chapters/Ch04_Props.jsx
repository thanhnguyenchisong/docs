// Chương 4: Props
import { useState } from 'react';
import { DemoSection, InfoBox } from '../components/DemoSection.jsx';

// ═══ Props cơ bản ═══
function ProductCard({ name, price, image, inStock = true, onBuy }) {
  return (
    <div className="card" style={{ opacity: inStock ? 1 : 0.5 }}>
      <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>{image}</div>
      <h4>{name}</h4>
      <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 18 }}>
        {price.toLocaleString('vi-VN')}đ
      </p>
      <div className="flex items-center justify-between mt-8">
        <span className={`badge ${inStock ? 'badge-success' : 'badge-error'}`}>
          {inStock ? '✅ Còn hàng' : '❌ Hết hàng'}
        </span>
        <button className="btn btn-primary btn-sm" disabled={!inStock} onClick={() => onBuy?.(name)}>
          🛒 Mua
        </button>
      </div>
    </div>
  );
}

// ═══ Destructuring Props ═══
function UserBadge({ user: { name, level, xp }, showXP = false }) {
  const levelColors = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', diamond: '#b9f2ff' };
  return (
    <div className="flex items-center gap-12">
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: levelColors[level] || '#888',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, color: '#000'
      }}>
        {name[0]}
      </div>
      <div>
        <strong>{name}</strong>
        <div className="text-sm text-muted">
          Level: {level.toUpperCase()} {showXP && `• ${xp} XP`}
        </div>
      </div>
    </div>
  );
}

// ═══ Children Pattern ═══
function AlertBox({ type = 'info', title, children }) {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: 8 }}>
      <strong>{icons[type]} {title}</strong>
      <div className="text-sm mt-8" style={{ opacity: 0.9 }}>{children}</div>
    </div>
  );
}

// ═══ Spread Props ═══
function CustomInput({ label, error, ...inputProps }) {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input className="input" {...inputProps} style={error ? { borderColor: 'var(--error)' } : {}} />
      {error && <span className="text-sm" style={{ color: 'var(--error)' }}>⚠️ {error}</span>}
    </div>
  );
}

// ═══ Render Callback / Function as Props ═══
function DataRenderer({ data, renderItem, emptyMessage = 'Không có dữ liệu' }) {
  if (!data || data.length === 0) return <p className="text-muted">{emptyMessage}</p>;
  return <div>{data.map((item, i) => renderItem(item, i))}</div>;
}

export default function Ch04_Props() {
  const [bought, setBought] = useState([]);

  const products = [
    { name: 'iPhone 16 Pro', price: 32990000, image: '📱', inStock: true },
    { name: 'MacBook Air M4', price: 28990000, image: '💻', inStock: true },
    { name: 'AirPods Pro 3', price: 6990000, image: '🎧', inStock: false },
  ];

  const users = [
    { name: 'An', level: 'gold', xp: 4500 },
    { name: 'Bình', level: 'diamond', xp: 9800 },
    { name: 'Chi', level: 'silver', xp: 2100 },
  ];

  const handleBuy = (name) => setBought(prev => [...prev, name]);

  return (
    <div>
      <h1 className="page-title">📦 Bài 04: Props</h1>
      <p className="page-subtitle">Truyền dữ liệu, destructuring, children, spread props</p>

      <h2>Props Cơ Bản</h2>
      <DemoSection title="ProductCard Components" badge="Props truyền data">
        <div className="grid-3">
          {products.map(p => (
            <ProductCard key={p.name} {...p} onBuy={handleBuy} />
          ))}
        </div>
        {bought.length > 0 && (
          <div className="mt-16 alert alert-success">
            🛒 Đã mua: {bought.join(', ')}
          </div>
        )}
      </DemoSection>

      <h2>Destructuring & Nested Props</h2>
      <DemoSection title="UserBadge - Destructuring object props" badge="Destructuring">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {users.map(u => <UserBadge key={u.name} user={u} showXP={true} />)}
        </div>
      </DemoSection>

      <h2>Children Pattern</h2>
      <DemoSection title="AlertBox với children" badge="children prop">
        <AlertBox type="info" title="Thông tin">
          Props <code className="code-inline">children</code> cho phép truyền JSX bất kỳ vào component.
        </AlertBox>
        <AlertBox type="success" title="Thành công">
          Component AlertBox tái sử dụng được với bất kỳ nội dung nào!
        </AlertBox>
        <AlertBox type="warning" title="Cảnh báo">
          Nhớ validate props với PropTypes hoặc TypeScript.
        </AlertBox>
      </DemoSection>

      <h2>Spread Props (...rest)</h2>
      <DemoSection title="CustomInput - Spread HTML attributes" badge="...rest">
        <CustomInput label="Email" type="email" placeholder="name@example.com" />
        <CustomInput label="Mật khẩu" type="password" placeholder="••••••" />
        <CustomInput label="Tên (có lỗi)" error="Tên không được để trống" />
      </DemoSection>

      <h2>Render Callback Pattern</h2>
      <DemoSection title="DataRenderer - Function as Props" badge="renderItem">
        <DataRenderer
          data={users}
          renderItem={(user, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{user.name}</span>
              <span className={`badge badge-${user.level === 'diamond' ? 'info' : user.level === 'gold' ? 'warning' : 'accent'}`}>{user.level}</span>
            </div>
          )}
        />
      </DemoSection>
    </div>
  );
}
