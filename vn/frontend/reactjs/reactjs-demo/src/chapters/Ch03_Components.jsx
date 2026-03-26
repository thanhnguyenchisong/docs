// Chương 3: Components
import { useState } from 'react';
import { DemoSection, InfoBox } from '../components/DemoSection.jsx';

// ═══ Function Component đơn giản ═══
function Greeting({ name = 'World' }) {
  return <h3 style={{ color: 'var(--accent)' }}>👋 Xin chào, {name}!</h3>;
}

// ═══ Component với logic ═══
function UserProfile({ name, role, avatar }) {
  const roleColors = {
    admin: 'var(--error)',
    developer: 'var(--info)',
    designer: 'var(--warning)',
  };

  return (
    <div className="card flex items-center gap-16">
      <div style={{
        width: 50, height: 50, borderRadius: '50%',
        background: `linear-gradient(135deg, ${roleColors[role]}, var(--accent))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24
      }}>
        {avatar}
      </div>
      <div>
        <h4>{name}</h4>
        <span className={`badge badge-${role === 'admin' ? 'error' : role === 'developer' ? 'info' : 'warning'}`}>
          {role}
        </span>
      </div>
    </div>
  );
}

// ═══ Composition Pattern ═══
function Card({ children, title }) {
  return (
    <div className="card">
      {title && <h4 className="mb-8">{title}</h4>}
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>{children}</div>;
}

function CardBody({ children }) {
  return <div>{children}</div>;
}

function CardFooter({ children }) {
  return <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{children}</div>;
}

// ═══ Component Reusable: Badge List ═══
function BadgeList({ items, type = 'accent' }) {
  return (
    <div className="flex flex-wrap gap-8">
      {items.map((item, i) => (
        <span key={i} className={`badge badge-${type}`}>{item}</span>
      ))}
    </div>
  );
}

export default function Ch03_Components() {
  return (
    <div>
      <h1 className="page-title">🧩 Bài 03: Components</h1>
      <p className="page-subtitle">Function components, composition, và tổ chức code</p>

      <h2>Function Component</h2>
      <DemoSection title="Component đơn giản" badge="Function">
        <Greeting />
        <Greeting name="React Developer" />
        <Greeting name="Em yêu code" />
      </DemoSection>

      <h2>Component với Props & Logic</h2>
      <DemoSection title="UserProfile Component" badge="Props + Style">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <UserProfile name="Nguyễn Văn Admin" role="admin" avatar="👨‍💼" />
          <UserProfile name="Trần Thị Developer" role="developer" avatar="👩‍💻" />
          <UserProfile name="Lê Văn Designer" role="designer" avatar="🎨" />
        </div>
      </DemoSection>

      <h2>Composition (Kết Hợp Components)</h2>
      <DemoSection title="Card Composition Pattern" badge="children">
        <Card>
          <CardHeader>
            <h4>📧 Thông báo mới</h4>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-muted">Bạn có 5 tin nhắn chưa đọc và 2 lời mời kết bạn đang chờ xác nhận.</p>
          </CardBody>
          <CardFooter>
            <button className="btn btn-secondary btn-sm">Bỏ qua</button>
            <button className="btn btn-primary btn-sm">Xem ngay</button>
          </CardFooter>
        </Card>
      </DemoSection>

      <h2>Reusable Components</h2>
      <DemoSection title="BadgeList - Tái sử dụng" badge="Reusable">
        <h4 className="mb-8">Frontend Skills:</h4>
        <BadgeList items={['React', 'Vue', 'Angular', 'TypeScript', 'Next.js']} type="info" />
        <h4 className="mb-8 mt-16">Backend Skills:</h4>
        <BadgeList items={['Node.js', 'Python', 'Go', 'PostgreSQL']} type="success" />
        <h4 className="mb-8 mt-16">Soft Skills:</h4>
        <BadgeList items={['Teamwork', 'Problem Solving', 'Communication']} type="warning" />
      </DemoSection>

      <h2>Nguyên tắc thiết kế Component</h2>
      <DemoSection title="Best Practices" badge="Tips">
        <div className="grid-2">
          <div className="card"><strong>🎯 Single Responsibility</strong><p className="text-sm text-muted mt-8">Mỗi component làm 1 việc</p></div>
          <div className="card"><strong>♻️ Reusable</strong><p className="text-sm text-muted mt-8">Thiết kế để tái sử dụng</p></div>
          <div className="card"><strong>📦 Composable</strong><p className="text-sm text-muted mt-8">Kết hợp thay vì kế thừa</p></div>
          <div className="card"><strong>📝 Descriptive Names</strong><p className="text-sm text-muted mt-8">Đặt tên rõ ràng, PascalCase</p></div>
        </div>
      </DemoSection>
    </div>
  );
}
