// Chương 15: API Integration
import { useState, useEffect, useCallback } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Fetch Trực Tiếp (Basic) ═══
function ManualFetch() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // API Delay 1 giây (Mô phỏng mạng chậm) + Lấy bảng User
      const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3');
      
      if (!res.ok) throw new Error('API sập hoặc chặn! ' + res.status);
      
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      // Cuối cùng kiểu gì thì cũng Tắt Load
      setLoading(false); 
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-16">
         <h4 className="mb-8">Bấm Nút Để Lấy Dữ Liệu</h4>
         <button className="btn btn-primary btn-sm" onClick={loadData} disabled={loading}>
           {loading ? 'Đang Tải ⏳' : 'Tải Xuống ⬇️'}
         </button>
      </div>

      {error ? (
        <div className="alert alert-error">Lỗi cmnr: {error}</div>
      ) : (
        <ul className="text-sm" style={{ listStyle: 'none', padding: 0 }}>
          {!loading && users.length === 0 && <li className="text-muted text-center p-16">Bảng Giao Dịch Đang Trống</li>}
          {users.map(u => (
            <li key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{u.name}</strong> <span className="text-muted">({u.email})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ═══ 2. Tái Sử Dụng Giao Thức Gọi Mạng (Custom Hook: useFetch) ═══
// Tưởng tượng file này nằm ở utils/hooks.js
function useFetch(url, options) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Mặc định Load ngay khi Khởi To
  const [error, setError] = useState(null);

  // Gói Call Mạng vào useCallback Để Nó Chỉ sinh ra 1 lần
  const execute = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Cổng Kết Nối Đã Chặn! ' + response.statusText);
      const jData = await response.json();
      setData(jData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url, options]); // Phụ Thuộc Vào URL và Options

  // Chạy ngay lần đầu khi component Gắn (Mount)
  useEffect(() => {
    execute();
  }, [execute]); 

  // Trả về Dữ Liệu VÀ Hàm Refresh Cho Phép Component Cập nhật lại
  return { data, isLoading, error, refetch: execute };
}

function CustomHookFetch() {
   // Không cần lo lắng Lỗi Catch - Load Các Thứ - Chỉ Gọi Và Bú Data
   const { data: posts, isLoading, error, refetch } = useFetch('https://jsonplaceholder.typicode.com/posts?_limit=2');

   return (
      <div className="card" style={{ background: 'var(--bg-secondary)'}}>
         <div className="flex justify-between items-center mb-16">
            <h4>Bảng Feed Tin Tức (Load Tự Động)</h4>
            <button className="btn btn-secondary btn-sm" onClick={refetch}>Vòng Quay Lại🔄</button>
         </div>

         {isLoading && <div className="text-center text-muted p-16">Chờ Hệ thống...</div>}
         {error && <div className="badge badge-error p-16">{error}</div>}

         {!isLoading && posts && (
             <div className="flex flex-col gap-16">
                 {posts.map(p => (
                    <div key={p.id} style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8 }}>
                       <strong>{p.title}</strong>
                       <p className="text-sm mt-8 text-muted">{p.body}</p>
                    </div>
                 ))}
             </div>
         )}
      </div>
   );
}


export default function Ch15_API() {
  return (
    <div>
      <h1 className="page-title">🔌 Bài 15: Gọi Thần Giao Cách Cảm (API)</h1>
      <p className="page-subtitle">Fetch Gốc, Quản Lý Trạng Thái Asynchronous và Custom Hooks Hút Chân Không</p>

      <h2>1. Các Bước Đi Nhập Môn Gọi API (Fetch JS)</h2>
      <DemoSection title="Bộ Sậu: Loading + Error + Response Bắt Buộc Có Cả Ba" badge="async / await">
         <InfoBox>
           Luôn nhớ <code className="code-inline">Try .. Catch</code> để đề phòng Đứt mạng/Sập server. Component Phải có cờ <code className="code-inline">loading</code> để Bọc nút bấm ngăn User Click spam Gây Nổ Nút.
         </InfoBox>
         <div className="grid-2">
            <ManualFetch />
            
            <div className="card p-16 hidden">
               <h4 className="mb-16 text-muted">Bí Kiếp API Axios (Mở Mở Rộng)</h4>
               <p className="text-sm text-muted mb-16">Trong Thực chiến, Không Cần Khổ Với Fetch! Dev Nước Ngoài Toàn xài Thư Viện Thần Thánh <strong>Axios</strong> thay Vì Fetch vì nó Tự Chuyển <code className="code-inline">.json()</code> và Bắt Lỗi <code className="code-inline">401 Auth</code> gọn Lỏn.</p>
               <pre className="code-inline" style={{ display: 'block', padding: 12 }}>
                 {`// Thay vì Fetch mông lung:
const r = await axios.get('/v1/users');
// Sẵn Data Ngọt Lịm luôn:
setUsers(r.data);`}
               </pre>
            </div>
         </div>
      </DemoSection>

      <h2>2. Nhét Mớ Hỗn Độn Trên Sang Thư Viện Tái Chế</h2>
      <DemoSection title="Sức Mạnh Biến Hình Component Custom (UseFetch)" badge="Gọn Sạch Mịn">
         <InfoBox type="info">Dùng đi Dùng lại mà Mã Của Page Cực Kỳ Lì Kì. Khi làm thật, chúng ta CÒN Tiến Hóa Nữa Bằng Thư viện Rồng Thần <strong>TanStack Query (React Query)</strong> giúp Cache Và Update Thông Minh.</InfoBox>
         <CustomHookFetch />
      </DemoSection>

    </div>
  );
}
