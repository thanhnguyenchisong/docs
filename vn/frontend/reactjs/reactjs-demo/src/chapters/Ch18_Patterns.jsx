// Chương 18: Advanced Patterns 
import React, { useState, createContext, useContext } from 'react';
import { DemoSection, InfoBox } from '../components/DemoSection.jsx';

// ═══ 1. Higher-Order Component (HOC) ═══
// HOC là 1 Function nhận vào 1 Component và trả ra 1 Component "Mới Hơn" (có xăm trổ tính năng lạ)
function withAuthChecking(WrappedComponent) {
  return function EnhancedComponent(props) {
    // Logic Authentication giả định
    const isAuthenticated = props.isLoggedIn;
    
    if (!isAuthenticated) {
       return <div className="card text-center p-16" style={{ border: '1px dashed var(--error)' }}>
           <h4 className="mb-8" style={{ color: 'var(--error)'}}>🔒 Component Bị Khóa Bởi HOC Authentication</h4>
           <p className="text-sm">Hãy kích hoạt quyền bên dưới để xem tệp Cấm.</p>
       </div>;
    }

    // Nếu Ok => Lòi Component cũ ra & Gán nguyên Props vào lại (Đứng làm cò mồi)
    return <WrappedComponent {...props} extraInfo="Phê duyệt Bằng HOC Role Admin" />;
  };
}

// Component Thường Bị Bọc Lại (HOC Enhanced)
function SecretDashboard({ extraInfo }) {
  return (
    <div className="card text-center p-16" style={{ background: 'var(--success)', color: '#000' }}>
       <h4>Tài Khoản Cao Cấp Đã Được Chạy HOC</h4>
       <p className="mt-8">Dữ liệu tuyệt mật. <br /> Tin nhắn HOC Vĩ Đại Bơm Vào: {extraInfo}</p>
    </div>
  );
}

const ProtectedDashboard = withAuthChecking(SecretDashboard);

// ═══ 2. Render Props (Trò Chơi Truyền Function) ═══
// Thằng Bọc Xử lý State Hoạt Động Cục Bộ
function MouseTracker({ renderUI }) {
  const [mousePos, setMouse] = useState({ x: 0, y: 0 });

  return (
    <div 
       style={{ height: '200px', background: 'var(--bg-card)', border: '2px solid var(--border)', cursor: 'crosshair', position: 'relative' }} 
       onMouseMove={e => setMouse({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
    >
       <h4 className="text-muted p-16">Rê Chuột Nhanh Qua Vùng Chữ Tự Kỷ (Render Props Này)</h4>
       
       {/* ĐÓNG VAI TRÒ GÕ CỬA RenderUI LÀ MỘT FUNCTION TRUYỀN VÀO */}
       {renderUI(mousePos)}
    </div>
  );
}


// ═══ 3. Compound Components (Lắp Ghép Combo Context + Sub Components) ═══
// VÍ DỤ: Component Thanh Xổ (Accordion)
const AccordionContext = createContext();

function Accordion({ children }) {
  const [openId, setOpen] = useState(null);
  const toggle = (id) => setOpen(openId === id ? null : id); // Bấm Lại Thu Gọn Lại Nhau

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
       <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {children}
       </div>
    </AccordionContext.Provider>
  );
}

// Sub components đi kèm Thằng Mẹ - Chấm Chấm (.)
Accordion.Item = function ({ id, label, children }) {
   const { openId, toggle } = useContext(AccordionContext);
   const isOpen = openId === id;

   return (
      <div style={{ borderBottom: '1px solid var(--border)' }}>
         {/* Đầu Item Cắm Hàm Bật/Tắt Của Mẹ Ở Trên Xám Tối */}
         <button 
            className="w-full text-left"
            style={{ padding: 16, background: isOpen ? 'var(--bg-hover)' : 'var(--bg-card)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}
            onClick={() => toggle(id)}
         >
            {isOpen ? '🔽' : '▶️'} {label}
         </button>

         {/* Đáy Xổ Data Nếu Hợp Lệ Trạng Thái */}
         {isOpen && (
            <div style={{ padding: 16, background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
               {children}
            </div>
         )}
      </div>
   );
};

export default function Ch18_Patterns() {
  const [userLogged, setUserLog] = useState(false);

  return (
    <div>
      <h1 className="page-title">🏗️ Bài 18: Kiến Trúc Bậc Thầy (Advanced Patterns)</h1>
      <p className="page-subtitle">Nhét Render Vào Props, HOC Bọc Khí Quản, Khớp Component Compound Combo Menu Đẳng Cấp</p>

      <h2>1. Thợ Gói (Higher-Order Component)</h2>
      <DemoSection title="Tặng Thêm Đồ Cho Component Rỗng Qua HOC" badge="withRouter / withAuth">
         <InfoBox>
           HOC là mẫu cũ nhưng vô cùng mạnh thời chưa có Hook. Hiện tại Router V5 hay dùng <code className="code-inline">withRouter(Cmp)</code> để Nhét Đối tượng History (Lưu Mạng) Vào Cho Đời 1 Component Bất Kỳ Đứng Rìa Rìa.
         </InfoBox>
         
         <div className="flex gap-16 items-center mb-16">
            <span style={{color: userLogged ? 'var(--success)': 'var(--error)'}}>
                {userLogged ? '🟢 Đã Gắn Key VIP' : '🔴 Khách Không Mời'}
            </span>
            <button className={`btn btn-${userLogged ? 'danger' : 'primary'}`} onClick={() => setUserLog(!userLogged)}>
                {userLogged ? 'Gỡ Key' : 'Truyền Role Props Để Bẻ HOC'}
            </button>
         </div>

         {/* Call Con Nhưng Kèm Biến Mồi */}
         <ProtectedDashboard isLoggedIn={userLogged} />
      </DemoSection>


      <h2>2. Truyền Render Như Một Hàm Bắn Props</h2>
      <DemoSection title="Mouse Tracker / List Đi Kèm Năng Lực" badge="render={ () => UI }">
         <InfoBox type="info">Component không trả về <code className="code-inline">UI Thường</code> mà trả về <code className="code-inline">Một Lời Mời Function(Data Trả Ra Khỏi Máy)</code> ➨ Nó Cắt Trụ Trạng Thái Và Vứt Việc Sơn UI Cho Bạn Chọn!</InfoBox>
         

         <MouseTracker renderUI={(pos) => (
             <h4 style={{ position: 'absolute', top: pos.y + 10, left: pos.x + 10, pointerEvents: 'none' }}>
                X: {pos.x} | Y: {pos.y}
             </h4>
         )} />

         <br />
         
         {/* Cung Cứng Dữ Liệu Lại Lần Nữa Phía Dưới Mà K Làm Gì Khác */}
         <MouseTracker renderUI={(pos) => (
             <div style={{ position: 'absolute', transform: \`translate(\${pos.x}px, \${pos.y - 40}px)\`, fontSize: 30, pointerEvents: 'none' }}>
                🦅
             </div>
         )} />
      </DemoSection>


      <h2>3. Compound Components (Lắp Ghép Linh Liện Tĩnh)</h2>
      <DemoSection title="Accordion Xổ Chớp Tắt Tự Quản Lí Form Nội Bộ Quanh Box Nhỏ" badge="<Cmp.Sub> / Context">
         <InfoBox type="success">
            React Router đang xài Hàng Này Để Vẽ Ra <code className="code-inline">{'<Routes><Route /></Routes>'}</code>. Bạn sẽ làm Giấu State Để Khách Hàng App Này Của Bạn Chỉ cần Gọi Element Đẹp.
         </InfoBox>
         
         {/* Tương Lai Viết React Component Rất Sạch Bằng Compound */}
         <Accordion>
             <Accordion.Item id="tab1" label="Công Nghệ React 19 Có Gì?">
                 React Compiler - Quên Đi useMemo, useCallback vì Code Dịch Siêu Nhạy Tự Động Gắn Cache.
             </Accordion.Item>
             <Accordion.Item id="tab2" label="Có Nên Học Context hay Zustand?">
                 Dùng Context khi Nó ít khi nào bị Sửa (Đổi Theme Sáng). Dùng Zustand cho Giỏ Hàng Hay State Thay Liên Tiếp Lớn Lên Lút.
             </Accordion.Item>
             <Accordion.Item id="tab3" label="Bí Kíp Sống Tồn Lâu Năm">
                 Luyện Code Thằng React Sẽ Học Lây Qua React-Native Đi Gõ App Điệm Toại Lâu Không Lương Cao.
             </Accordion.Item>
         </Accordion>
      </DemoSection>

    </div>
  );
}
