/* Reusable demo wrapper component */
export function DemoSection({ title, badge, children }) {
  return (
    <div className="demo-section animate-fadeIn">
      <div className="demo-header">
        <h4>🔬 {title}</h4>
        {badge && <span className="demo-badge">{badge}</span>}
      </div>
      <div className="demo-body">{children}</div>
    </div>
  );
}

export function DemoResult({ label = 'Kết quả', children }) {
  return (
    <div className="demo-result">
      <div className="demo-result-label">▶ {label}</div>
      {children}
    </div>
  );
}

export function InfoBox({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}
