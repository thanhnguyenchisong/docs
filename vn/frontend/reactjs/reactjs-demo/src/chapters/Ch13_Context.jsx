// Chương 13: Context API
import { useState, useContext, createContext, useMemo } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Khởi tạo Context ═══
// Tách file State Management (Thường tạo riêng 1 file context/ThemeContext.jsx)
const ThemeContext = createContext({
  theme: 'dark', // Giá trị mặc định (Fallback khi thiếu Provider)
  toggleTheme: () => {}
});

// Context thứ 2 để chứng minh có thể nest nhiều Provider
const UserContext = createContext();

// ═══ 2. Tạo Provider Bọc Toàn Bộ (Wrapper) ═══
function AppProviders({ children }) {
  // Quản lý state tập trung tại "Ông Nội"
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState({ name: 'Khách', role: 'guest' });

  // Tối ưu hóa Context Value để không làm Child tự động Re-render Vô Hình
  const themeValue = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }), [theme]);

  // Provider 2
  const userValue = useMemo(() => ({
    user,
    login: (name, role) => setUser({ name, role }),
    logout: () => setUser({ name: 'Khách', role: 'guest' })
  }), [user]);

  // Lồng nhau (Provider Hell là 1 nhược điểm)
  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
         <div style={{
           padding: 24,
           borderRadius: 12,
           border: '2px solid var(--border)',
           background: theme === 'dark' ? 'var(--bg-primary)' : '#f0f4f8',
           color: theme === 'dark' ? 'var(--text-primary)' : '#1e293b',
           transition: 'all 0.3s'
         }}>
            <h4 className="mb-16 text-center">Biên Giới Provider Bắt Đầu Từ Vùng Xám/Trắng</h4>
            <hr className="divider" style={{ borderColor: theme === 'dark' ? '#333' : '#ccc'}}/>
            {children}
         </div>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// ═══ 3. Dùng Context Ở Tận Sâu Bên Trong Component (Cháu Chắt) ═══
function TopNavigationBar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(UserContext);

  return (
    <div className="flex justify-between items-center mb-16 p-16" style={{ background: theme === 'dark' ? 'var(--bg-card)' : '#fff', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
       <strong>React Logo</strong>
       
       <div className="flex gap-16 items-center">
          <span className={`badge ${user.role === 'admin' ? 'badge-error' : 'badge-info'}`}>Xin chào: {user.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}> {theme === 'dark' ? '☀️ Sáng' : '🌙 Tối'} </button>
          
          {user.role !== 'guest' ? (
             <button className="btn btn-danger btn-sm" onClick={logout}>Đăng Xuất</button>
          ) : null}
       </div>
    </div>
  );
}

function DeepContentArea() {
  const { user, login } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  return (
    <div className="card text-center pb-16" style={{ background: theme === 'dark' ? 'var(--bg-card)' : '#fff', borderColor: theme === 'dark' ? '#333' : '#ccc' }}>
       <h4 className="mb-16" style={{ color: theme === 'dark' ? '' : '#000' }}>Vùng Nội Dung (Deep Component)</h4>
       <p className="text-sm mb-16" style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
          Tôi là một component chắt ở sâu bên dưới. Không cần Props Drilling, tôi lấy mọi thứ từ Không Gian bằng <code className="code-inline" style={{ background: theme === 'dark' ? '' : '#e2e8f0', color: theme==='dark' ? '' : '#dc2626'}}>useContext</code>
       </p>
       
       {user.role === 'guest' ? (
           <div className="flex justify-center gap-16 mt-16">
              <button className="btn btn-primary" onClick={() => login('Nguyễn Văn B/A', 'user')}>Đăng Nhập Khách</button>
              <button className="btn btn-danger" onClick={() => login('Boss Lớn', 'admin')}>Đăng Nhập Boss</button>
           </div>
       ) : (
           <div className="p-16 mt-16" style={{ background: theme === 'dark' ? 'var(--bg-secondary)' : '#e2e8f0', borderRadius: 8 }}>
               <h3 style={{ color: theme === 'dark' ? '' : '#000' }}>Dữ liệu Bí Mật</h3>
               <p style={{ color: theme === 'dark' ? '' : '#334155' }}>Chỉ thành viên mới nhìn thấy dòng này! Quyền của bạn: {user.role.toUpperCase()}</p>
           </div>
       )}
    </div>
  );
}

export default function Ch13_Context() {
  return (
    <div>
      <h1 className="page-title">🌐 Bài 13: Context API</h1>
      <p className="page-subtitle">Thay thế Props Drilling bằng Trạm Phát Dữ Liệu Toàn Cục</p>

      <h2>1. Props Đâm Thủ Nửa App (Drilling) Vấn Đề Và Giải Pháp</h2>
      <DemoSection title="Context & Provider" badge="useContext + createContext">
         <InfoBox type="warning">
            Chỉ nhét vào Context những dữ liệu <strong>Rất Rất Hiếm Khi Thay Đổi Từng Giây</strong> (như Thông tin Đăng Nhập, Cài Đặt Theme Sáng Tối, Ngôn Ngữ). Đừng bỏ Biến Gõ Phím, Danh Sách Cuộn Nhỏ lẻ của 1 trang. Mỗi lần Value của Context Đổi, TẤT CẢ CHILD Móc Vào SẼ BỊ Render Lại!!!
         </InfoBox>
         
         {/* Demo Gộp Của Provider */}
         <AppProviders>
             <TopNavigationBar />
             <div className="grid-2 mt-24">
                 <div>
                    <h4 className="text-center text-muted mb-8 text-sm">Sidebar (Không dùng Context)</h4>
                    <div style={{ height: '100%', border: '2px dashed var(--border)', borderRadius: 8 }} />
                 </div>
                 {/*  Component lồng Rất Sâu Nhận Data Từ Mây (Context) */}
                 <DeepContentArea />
             </div>
         </AppProviders>
      </DemoSection>

    </div>
  );
}
