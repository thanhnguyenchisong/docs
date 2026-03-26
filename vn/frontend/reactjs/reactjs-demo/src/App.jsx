import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load chapters
const Ch01 = lazy(() => import('./chapters/Ch01_Introduction.jsx'));
const Ch02 = lazy(() => import('./chapters/Ch02_JSX.jsx'));
const Ch03 = lazy(() => import('./chapters/Ch03_Components.jsx'));
const Ch04 = lazy(() => import('./chapters/Ch04_Props.jsx'));
const Ch05 = lazy(() => import('./chapters/Ch05_State.jsx'));
const Ch06 = lazy(() => import('./chapters/Ch06_Events.jsx'));
const Ch07 = lazy(() => import('./chapters/Ch07_ConditionalRendering.jsx'));
const Ch08 = lazy(() => import('./chapters/Ch08_ListsKeys.jsx'));
const Ch09 = lazy(() => import('./chapters/Ch09_Forms.jsx'));
const Ch10 = lazy(() => import('./chapters/Ch10_HooksBasic.jsx'));
const Ch11 = lazy(() => import('./chapters/Ch11_HooksAdvanced.jsx'));
const Ch12 = lazy(() => import('./chapters/Ch12_Lifecycle.jsx'));
const Ch13 = lazy(() => import('./chapters/Ch13_Context.jsx'));
const Ch14 = lazy(() => import('./chapters/Ch14_Router.jsx'));
const Ch15 = lazy(() => import('./chapters/Ch15_API.jsx'));
const Ch16 = lazy(() => import('./chapters/Ch16_StateManagement.jsx'));
const Ch17 = lazy(() => import('./chapters/Ch17_Performance.jsx'));
const Ch18 = lazy(() => import('./chapters/Ch18_Patterns.jsx'));

const chapters = [
  { path: '01', title: 'Giới thiệu & Cài đặt', emoji: '🚀', component: Ch01, section: 'Nền Tảng' },
  { path: '02', title: 'JSX Cơ bản', emoji: '📝', component: Ch02, section: 'Nền Tảng' },
  { path: '03', title: 'Components', emoji: '🧩', component: Ch03, section: 'Nền Tảng' },
  { path: '04', title: 'Props', emoji: '📦', component: Ch04, section: 'Nền Tảng' },
  { path: '05', title: 'State', emoji: '⚡', component: Ch05, section: 'Nền Tảng' },
  { path: '06', title: 'Event Handling', emoji: '🖱️', component: Ch06, section: 'Nền Tảng' },
  { path: '07', title: 'Conditional Rendering', emoji: '🔀', component: Ch07, section: 'Nền Tảng' },
  { path: '08', title: 'Lists & Keys', emoji: '📋', component: Ch08, section: 'Nền Tảng' },
  { path: '09', title: 'Forms', emoji: '📑', component: Ch09, section: 'Nền Tảng' },
  { path: '10', title: 'Hooks Cơ bản', emoji: '🪝', component: Ch10, section: 'Trung Cấp' },
  { path: '11', title: 'Hooks Nâng cao', emoji: '🔧', component: Ch11, section: 'Trung Cấp' },
  { path: '12', title: 'Lifecycle', emoji: '🔄', component: Ch12, section: 'Trung Cấp' },
  { path: '13', title: 'Context API', emoji: '🌐', component: Ch13, section: 'Trung Cấp' },
  { path: '14', title: 'React Router', emoji: '🗂️', component: Ch14, section: 'Trung Cấp' },
  { path: '15', title: 'API Integration', emoji: '🔌', component: Ch15, section: 'Trung Cấp' },
  { path: '16', title: 'State Management', emoji: '🏪', component: Ch16, section: 'Nâng Cao' },
  { path: '17', title: 'Performance', emoji: '⚡', component: Ch17, section: 'Nâng Cao' },
  { path: '18', title: 'Advanced Patterns', emoji: '🏗️', component: Ch18, section: 'Nâng Cao' },
];

function Loading() {
  return (
    <div className="text-center" style={{ padding: 60 }}>
      <div className="animate-pulse" style={{ fontSize: 40 }}>⏳</div>
      <p className="text-muted mt-8">Đang tải...</p>
    </div>
  );
}

export default function App() {
  let lastSection = '';

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>⚛️ ReactJS Demo</h1>
          <p>Từ Zero đến Master</p>
        </div>
        <nav>
          {chapters.map((ch) => {
            const showSection = ch.section !== lastSection;
            lastSection = ch.section;
            return (
              <div key={ch.path}>
                {showSection && (
                  <div className="sidebar-section-title">{ch.section}</div>
                )}
                <NavLink
                  to={`/${ch.path}`}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  <span className="num">{ch.path}</span>
                  <span>{ch.emoji} {ch.title}</span>
                </NavLink>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-container">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/01" replace />} />
              {chapters.map((ch) => (
                <Route key={ch.path} path={`/${ch.path}`} element={<ch.component />} />
              ))}
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
