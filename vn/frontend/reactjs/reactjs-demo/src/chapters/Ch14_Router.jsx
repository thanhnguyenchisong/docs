// Chương 14: React Router
import { useState } from 'react';
import { MemoryRouter, Routes, Route, Link, NavLink, useNavigate, useParams, Navigate, Outlet } from 'react-router-dom';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ MemoryRouter Mô Phỏng Trình Duyệt Nội Bộ ═══
// (Sử dụng MemoryRouter để không làm hỏng Router của App chính)

// 1. Pages Đơn Giản
function TrangChu() {
  return <div className="p-16 text-center"><h3>Trang Chủ Chính Giữa Màn Hình</h3>Mừng bạn đến với Demo React Router. Nhấn NavLink để xem tác dụng.</div>;
}

function About() {
  const nav = useNavigate();
  return (
    <div className="p-16 card" style={{ border: '2px solid var(--info)' }}>
       <h3 style={{ color: 'var(--info)' }}>Về Chúng Tôi</h3>
       <p className="mb-16 mt-8">Công Ty Xin Xò. Chúng tôi nhận học viên React. Click nút dưới để Back lại bằng Code, thay vì Nút Mũi Tên Trình Lướt Web.</p>
       <button className="btn btn-secondary btn-sm" onClick={() => nav(-1)}> Quay Về (-) </button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-16 card text-center" style={{ border: '2px dashed var(--error)', background: 'rgba(239, 68, 68, 0.1)' }}>
      <h3 style={{ color: 'var(--error)' }} className="mb-16">🚫 404 Không Tồn Tại Đường Dẫn</h3>
      <Link to="/" className="btn btn-primary mt-16">Bấm Quay Về Gốc ( / )</Link>
    </div>
  );
}

// 2. Dynamic Route & Link Param Dữ Liệu
function ChiTietSanPham() {
  const { monHangID } = useParams(); // Lấy giá trị biến nằm ngay trên Thanh Địa Chỉ ( URL )
  
  // Dữ Liệu Fake Database Mock
  const products = {
    'iphone': { ten: 'Điện Thoại Mỹ - Táo Khuyết', gia: '1900$' },
    'samsung': { ten: 'Gấp Dẻo - Hàn Quốc', gia: '2200$' },
  };

  const dbData = products[monHangID];

  return (
    <div className="card text-center pb-16">
       <h4 className="mb-16">Chi Tiết Của Link Đang Chạy</h4>
       {dbData ? (
         <div>
            <h1 className="mb-8">{dbData.ten} {monHangID === 'iphone' ? '🍏' : '📱'}</h1>
            <span className="badge badge-success mb-16">{dbData.gia}</span>
         </div>
       ) : (
         <div className="alert alert-error">Không còn bán mã SP: {monHangID}</div>
       )}

       <div className="mt-16 text-sm text-muted">
           <code className="code-inline">useParams()</code> Đọc được <strong>{monHangID}</strong> Tại vì Cấu Trúc Khai Báo Là: <span style={{ color: 'var(--accent)'}}>/sanpham/<strong>:monHangID</strong></span>
       </div>
    </div>
  );
}

// 3. Nested Routes (Mở Rộng Trang Trong Trang) & Bảo vệ
function TrangQuanTriLoi() {
   // Outlet: Cái Vòng Để Gắn Lòi Con Nằm Vào!
   return (
      <div className="card p-16" style={{ border: '2px solid var(--warning)' }}>
          <h4 className="mb-16" style={{ color: 'var(--warning)' }}>👑 Khu Vực Quan Trọng (Layout Chung Admin)</h4>
          <p className="mb-16 text-sm">Hiển thị cái menu Dọc Của Admin Ở Đây.</p>
          <div className="flex gap-8 mb-16">
             <Link className="btn btn-secondary btn-sm" to="/admin/doanhso">Doanh Số</Link>
             <Link className="btn btn-secondary btn-sm" to="/admin/nhanvien">Nhân Viên Bị Phạt</Link>
          </div>
          
          <hr className="divider" />
          <h4 className="mb-8">Thẻ Outlet (Nội dung thay đổi bên dưới⬇️):</h4>
          {/* NỘI DUNG THỰC SỰ SẼ CHÈN TẠI DÒNG NÀY: */}
          <Outlet /> 
      </div>
   );
}


export default function Ch14_Router() {
  const [isAdminToggled, setAdminSwitch] = useState(false);

  return (
    <div>
      <h1 className="page-title">🗂️ Bài 14: Router V6</h1>
      <p className="page-subtitle">Thanh đổi link Không Load Lại - Điều Hướng Tuyến Đường Page Web Chuyên Biệt.</p>

      <h2>Mô Phỏng Trang Web - Nằm Lồng Vào React Mẹ Bằng Mở "MemoryRouter"</h2>
      <DemoSection title="Nút Bấm và Trả Về Kết Quả Tuyến Đường" badge="<Routes> + <Route>">
         <InfoBox type="info">Đây là Mini App Ảo Bằng React Memory Router! Click link sẽ k làm trang web tải lại - mà Nhảy Chớp Nhoáng (SPA).</InfoBox>
         
         <MemoryRouter initialEntries={['/']}>
             <div className="grid-2 mt-16 gap-16">
                
                {/* Khu Vực Nút Navigation */}
                <div className="card">
                     <h4 className="mb-16">Thanh Điều Hướng Nhấn (Nav)</h4>
                     <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         {/* Link cơ bản với NavLink bắt màu tự động (active element) */}
                         <NavLink to="/" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} w-full`}>🏡 Trang Chủ (Root)</NavLink>
                         <NavLink to="/ve-c-ty" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} w-full`}>🏢 Về Chung Tôi</NavLink>
                         <NavLink to="/sanpham/iphone" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} w-full`}>📱 Sản Phẩm Iphone (Params)</NavLink>
                         
                         {/* Link Rác - Phát sinh màn hình lỗi 404 */}
                         <Link to="/link-rac-không-khai-bao" className="btn btn-danger w-full mt-16">🔗 Nhấn Link Rỗng Sinh Lỗi Mất Tích 404</Link>

                         {/* Khu Vực Nâng Cao */}
                         <div className="mt-24 p-16" style={{ background: 'var(--bg-secondary)', borderRadius: 8 }}>
                             <label style={{ display: 'flex', gap: 8, cursor: 'pointer', marginBottom: 16 }}>
                               <input type="checkbox" checked={isAdminToggled} onChange={() => setAdminSwitch(!isAdminToggled)} />
                               [Cửa Trạng Thái] Trở Thành Admin
                             </label>
                             <Link to="/admin" className={`btn ${isAdminToggled ? 'btn-warning' : 'btn-secondary'} w-full`} style={{ background: isAdminToggled ? 'var(--warning)' : '', color: isAdminToggled ? '#000' : ''}}>Truy Cập Quản Trị Hệ Thống (Lồng Layout / Bảo Mật Thẻ)</Link>
                         </div>
                     </nav>
                </div>

                {/* Khu Vực Chiếu - (Thẻ Route) Nối với Link Ở Bên Trái. Bấm là thay đổi khúc Gỗ này */}
                <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', minHeight: '400px' }}>
                    
                    <h4 className="text-center mb-16 text-muted" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)'}}>Màn Hình Hiện Kết Quả Router Link</h4>
                    
                    {/* Danh Sách Mọi Ngã Đường Đăng Kí (Sổ Thẻ Route) */}
                    <Routes>
                       {/* Đường Gốc */}
                       <Route path="/" element={<TrangChu />} />
                       <Route path="/ve-c-ty" element={<About />} />
                       
                       {/* Đường Tham Số Params (Có Số Thay Đổi Được Như Đọc Bài Viết ID: 1 2 3 )*/}
                       <Route path="/sanpham/:monHangID" element={<ChiTietSanPham />} />

                       {/* Đường Đào Lồng / Khóa Phụ Kho Đồ (Protected & Nested Routes) 
                           - Nếu CheckBox Tắt (Admin False): Đá về Trang Tôn Không ! 
                       */}
                       <Route path="/admin/*" element={isAdminToggled ? <TrangQuanTriLoi /> : <Navigate to="/ve-c-ty" replace />}>
                             <Route path="doanhso" element={<div className="badge badge-success p-16">Doanh Số: 10 Tỷ Hôm Nay</div>} />
                             <Route path="nhanvien" element={<div className="badge badge-error p-16">Chưa Ai Bị Phạt. Đang Hạnh Phúc!!</div>} />
                             <Route index element={<div className="text-muted p-16">Bấm Các Nhánh Đường Phụ Đi Ông Già Của Admin!</div>} />
                       </Route>
                       
                       {/* Sao Dấu Chấm Hỏi - Túm Trọn Lỗi Link Chết Không Khai Báo (Sao)*/}
                       <Route path="*" element={<NotFound />} />

                    </Routes>
                </div>

             </div>
         </MemoryRouter>
      </DemoSection>

    </div>
  );
}
