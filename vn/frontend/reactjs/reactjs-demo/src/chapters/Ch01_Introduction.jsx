// Chương 1: Giới thiệu React & Cài đặt
import { DemoSection, InfoBox } from '../components/DemoSection.jsx';

export default function Ch01_Introduction() {
  return (
    <div>
      <h1 className="page-title">🚀 Bài 01: Giới Thiệu React</h1>
      <p className="page-subtitle">React là gì, Virtual DOM, và cấu trúc dự án</p>

      <InfoBox type="info">
        💡 Bạn đang xem một ứng dụng React thực tế! Mọi thứ trên trang này đều được render bởi React.
      </InfoBox>

      <DemoSection title="React Application đang chạy" badge="Live">
        <p>Dự án này sử dụng:</p>
        <div className="grid-2 mt-16">
          <div className="card">
            <h4>⚡ Vite</h4>
            <p className="text-sm text-muted">Build tool siêu nhanh, Hot Module Replacement (HMR)</p>
          </div>
          <div className="card">
            <h4>⚛️ React 19</h4>
            <p className="text-sm text-muted">Thư viện UI hiện đại, component-based</p>
          </div>
          <div className="card">
            <h4>🗂️ React Router</h4>
            <p className="text-sm text-muted">Điều hướng SPA, lazy loading routes</p>
          </div>
          <div className="card">
            <h4>🎨 CSS Custom Properties</h4>
            <p className="text-sm text-muted">Design system với CSS variables</p>
          </div>
        </div>
      </DemoSection>

      <h2>Virtual DOM</h2>
      <DemoSection title="So sánh Real DOM vs Virtual DOM" badge="Concept">
        <div className="grid-2">
          <div>
            <h4 style={{ color: 'var(--error)' }}>❌ Real DOM</h4>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li className="text-sm text-muted">Cập nhật toàn bộ cây DOM</li>
              <li className="text-sm text-muted">Thao tác DOM chậm</li>
              <li className="text-sm text-muted">Gây layout thrashing</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--success)' }}>✅ Virtual DOM</h4>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li className="text-sm text-muted">So sánh (diff) trước khi update</li>
              <li className="text-sm text-muted">Batch updates hiệu quả</li>
              <li className="text-sm text-muted">Chỉ update phần thay đổi</li>
            </ul>
          </div>
        </div>
      </DemoSection>

      <h2>Cấu trúc dự án này</h2>
      <DemoSection title="Project Structure" badge="Vite + React">
        <pre style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.8
        }}>
{`reactjs-demo/
├── index.html          ← Entry HTML
├── package.json        ← Dependencies
├── vite.config.js      ← Vite config
└── src/
    ├── main.jsx        ← React entry point
    ├── App.jsx         ← Root component + Router
    ├── index.css       ← Global styles
    ├── components/     ← Reusable components
    └── chapters/       ← Demo cho mỗi chương`}
        </pre>
      </DemoSection>
    </div>
  );
}
