// Chương 17: Performance Optimization
import { useState, useTransition, useDeferredValue, memo, useMemo } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Virtualization Trực Quan (Tối Giản Hóa - Ko cần Cài react-window) ═══
function VirtualListDemo() {
  const [data] = useState(() => Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item Siêu Dài Dòng Thứ ${i}` })));
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="card">
       <h4 className="mb-16">Rendering +10,000 Dòng DOM cùng lúc Lỗi App Cỡ Nào?</h4>
       <button className={`btn btn-${showAll ? 'error' : 'secondary'} w-full mb-16`} onClick={() => setShowAll(!showAll)}>
          {showAll ? '💣 [WARNING] Ẩn Đi (RAM đơ)' : '🔥 Hiển Thị Cố Chết 10000 Nodes'}
       </button>
       
       {showAll && (
           <div style={{ height: 300, overflowY: 'auto', border: '1px solid var(--error)', padding: 16 }}>
              {data.map(item => (
                 <div key={item.id} className="text-sm p-8 border-b border-gray-100">{item.text}</div>
              ))}
           </div>
       )}
       {!showAll && (
          <div className="alert alert-info">Thực tế: Người ta sẽ Cài Gói <code className="code-inline">react-window</code> Để chỉ Vẽ Đúng 20 Dòng Vào Màn Hình (Những Dòng Cuộn Quất Thì Xóa Đi Gấp). Kĩ Thuật Này Gọi Là Virtualization (Thắp Tảo DOM).</div>
       )}
    </div>
  );
}

// ═══ 2. Transition (React 18) - Không Giam Giữ Input Gõ Phím Của User ═══
// Hàm cản trở siêu nặng (Simulate Heavy Work)
function NonPerformantList({ query }) {
   const items = useMemo(() => {
       console.log("Vào vòng lặp nát máy...");
       const arr = [];
       for(let i=0; i < 20000; i++) {
          arr.push(`Khủng long Gõ phím ${query} lần ${i}`);
       }
       return arr;
   }, [query]);

   return (
      <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 16 }}>
         {items.slice(0, 100).map((t, idx) => (
            <div key={idx} style={{ opacity: 0.5, fontSize: 12 }}>{t}</div>
         ))}
      </div>
   );
}


function TransitionDemo() {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 1. Việc Này Nhẹ Gấp: Input phải nháy ngay! (Sync)
    setText(e.target.value);
    
    // 2. Việc Nặng Dài Hạn: Render list 20000 phần tử (Để Sang Chế Độ Rảnh Rỗi Chạy Sau - Non-Urgent)
    startTransition(() => {
        setQuery(e.target.value);
    });
  };

  return (
    <div className="card" style={{ background: 'var(--bg-secondary)'}}>
       <h4 className="mb-16">React 18: useTransition (Gõ Không Giật)</h4>
       
       <div className="input-group">
          <label>Nhập Lẹ Liên Tục Xem Giật K?</label>
          <input className="input" value={text} onChange={handleChange} />
       </div>

       {isPending && <span className="badge badge-warning mt-16 p-8">Đang tải Dưới Nền 10 Phút... (Loading Kèm Chữ)</span>}

       {/* Thằng Load Query Nặng Sẽ Tụt Lại Phía Sau Chờ Input Gõ Xong Mới Dịch */}
       <NonPerformantList query={query} />
    </div>
  );
}

// ═══ 3. Lazy Loading Ảnh & Component Chia Code Chunks ═══
function ComponentSplit() {
   return (
       <div className="card p-16 text-center">
            <h4 className="mb-16">Tách Nhỏ File (Code Splitting)</h4>
            <p className="text-sm text-muted">React.lazy() bẻ component ra nén File .js riêng lẻ. Client vào Trang Nào mới Tải JS TRANG ĐÓ về Trình Duyệt. Tránh File bundle.js Nặng 5 Lít.</p>
            <pre className="code-inline" style={{ display: 'block', padding: 16, marginTop: 16, textAlign: 'left' }}>
{`// Ở trên cùng File:
const LazyChart = React.lazy(
  () => import('./BigChart.jsx')
);

// Dưới JSX lồng vào Suspense (chặn lỗi tải mạng)
<Suspense fallback={<Spin/>}>
  <LazyChart />
</Suspense>`}
            </pre>
       </div>
   )
}

export default function Ch17_Performance() {
  return (
    <div>
      <h1 className="page-title">⚡ Bài 17: Tối Ưu Năng Suất (Performance)</h1>
      <p className="page-subtitle">Cứu Vãn Các Pha Lag Gãy Cổ Với React 18 Transition, List, Memo Khét Lẹt</p>

      <h2>1. DOM Khổng Lồ Là Khách Dữ (Viêm Màng Túi)</h2>
      <DemoSection title="Đừng Cố Vẽ > 1000 DIV Xuống HTML" badge="Đơ Trình Duyệt">
         <VirtualListDemo />
      </DemoSection>

      <h2>2. Thả Tự Do User (Đừng Chặn Luồng Nhập Chữ Của Họ Vì 1 Cái Gì Đó Đang Tính Tốn)</h2>
      <DemoSection title="Chế Độ Luân Phiên (Concurrent - StartTransition)" badge="useTransition / useDeferredValue">
         <InfoBox type="success">Đây là điểm Đỉnh Nhất Của Công Nghệ React 18 Sợi Chỉ (Fiber). Nó Nhét Cái việc Dễ Thở (Gõ Chữ Trắng) Ưu Tiên Thét Gào Lên Vẽ Màn Hình Trước Giây Số 1. Ai làm việc nặng Bị đá sang Mảng Background Nền và Bị Huỷ Đi Nếu Người Dùng Đổi Ý Chưa Báo Xong!!</InfoBox>
         <TransitionDemo />
      </DemoSection>

      <h2>3. Tại Sao Phải Chia Code Khi Đóng Gói Build?</h2>
      <DemoSection title="Lấy Đúng Món Ăn - Không Cân Mâm Đi Lên Tàu" badge="React.Lazy / Suspense">
         <InfoBox>
             Nếu Web App Của Bạn Có Chứa Cả Ngàn Tool: Soạn Thảo (1MB JS), Biểu Đồ (2MB JS). Ai Đăng Nhập Trang Chủ Hiện Chữ MÀ PHẢI ĐỢI Xong Cái Chóp Tải Biểu Đồ. Lỗi Chết Trôi (Bundle Lớn)!
         </InfoBox>
         <ComponentSplit />
      </DemoSection>

    </div>
  );
}
