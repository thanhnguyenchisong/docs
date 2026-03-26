// Chương 16: Quản Lý Trạng Thái (Zustand & Redux Tóm Tắt)
import { useState, useSyncExternalStore } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. Giả Giả Lập Mini Zustand (Giúp hiểu cốt lõi của việc State Ra Khỏi Component) ═══
// Bản chất Zustand: Một biến global (state), 1 danh sách các hàm sub (để gọi khi đổi state)
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  const getState = () => state;
  const setState = (fn) => {
    state = typeof fn === 'function' ? fn(state) : fn;
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener); // Trả về hàm hủy sub
  };

  return { getState, setState, subscribe };
}

// ═══ 2. Khởi tạo Global Store Ảo (Tương Tự Zustand Mới Nhất) ═══
// Đây là file store.js nằm tách biệt
const useCartStore = createStore({
  items: [],
  isOpen: false
});

// Helper Custom Hook Để dùng Store Trên (Giống UseStore(selector) của Zustand)
function useStore(store, selector = (state) => state) {
  // Hook chuẩn của React 18+ Để Cắm "Trạm State Bên Ngoài" vào "Component"
  const state = useSyncExternalStore(store.subscribe, () => selector(store.getState()));
  return state;
}

// ═══ 3. Component Rời Rạc (Cart Header, Thêm Hàng) Truy Cập Chung Trạm ═══
function MiniNavBarTrangBi() {
  // Chỉ lắng nghe mảng Items để Hiện Số Lượng
  const items = useStore(useCartStore, state => state.items);
  // Hàm Action (Không cần đưa vào UseStore, Gọi trực tiếp Store)
  const toggleCart = () => useCartStore.setState(s => ({ ...s, isOpen: !s.isOpen }));
  
  const totalMoney = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex justify-between items-center p-16" style={{ background: 'var(--bg-secondary)', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
       <h4 style={{ color: 'var(--accent)' }}>Cửa Hàng Ảo Nối Mạng Mây</h4>
       <div className="flex gap-16 items-center">
          <span className="badge badge-success text-sm p-8">Tổng Tiền: {totalMoney.toLocaleString('vi-VN')}đ</span>
          <button className="btn btn-primary btn-sm" onClick={toggleCart} style={{ position: 'relative' }}>
             👜 Túi Đồ
             {items.length > 0 && (
                <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error)', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>{items.length}</span>
             )}
          </button>
       </div>
    </div>
  );
}

function SanPhamKhuVuc() {
  const addToCart = (product) => {
    useCartStore.setState(state => {
      // Check trùng
      const exists = state.items.find(i => i.id === product.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }
      return { ...state, items: [...state.items, { ...product, quantity: 1 }] };
    });
  };

  const DUMMY_PRODUCTS = [
    { id: 1, name: 'Bàn Phím Cơ Nảy Từng Phím', price: 1200000, icon: '⌨️' },
    { id: 2, name: 'Chuột Máy Tính Nảy Nốt', price: 500000, icon: '🖱️' },
  ];

  return (
    <div className="grid-2 mt-16 gap-16">
       {DUMMY_PRODUCTS.map(p => (
         <div key={p.id} className="card text-center" style={{ padding: 16 }}>
             <h1 style={{ fontSize: 40, marginBottom: 16 }}>{p.icon}</h1>
             <h4 className="mb-8">{p.name}</h4>
             <span className="badge badge-warning mb-16">{p.price.toLocaleString('vi-VN')} đ</span>
             <button className="btn btn-secondary w-full" onClick={() => addToCart(p)}>Thêm Vào Giỏ (+)</button>
         </div>
       ))}
    </div>
  );
}

function GioHangTrượtSidebar() {
  const isOpen = useStore(useCartStore, state => state.isOpen);
  const items = useStore(useCartStore, state => state.items);

  const clearCart = () => useCartStore.setState(s => ({ ...s, items: [] }));
  const closeCart = () => useCartStore.setState(s => ({ ...s, isOpen: false }));

  if (!isOpen) return null; // Component render Rỗng

  return (
    <div style={{
       position: 'fixed', top: 0, right: 0, bottom: 0, width: 350,
       background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
       boxShadow: '-4px 0 16px rgba(0,0,0,0.5)', zIndex: 999,
       padding: 24, display: 'flex', flexDirection: 'column'
    }} className="animate-slideIn">
       
       <div className="flex justify-between items-center mb-24">
         <h4>👜 Giỏ Hàng Nhỏ Góc Phải ({items.length})</h4>
         <button className="btn btn-danger btn-sm" onClick={closeCart}>Đóng Cửa Sổ X</button>
       </div>

       <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.length === 0 ? <p className="text-center text-muted">Trống Rỗng! Chơi Hàng Đi Sếp.</p> : (
            <div className="flex flex-col gap-16">
               {items.map(item => (
                 <div key={item.id} className="flex justify-between items-center" style={{ borderBottom: '1px dashed var(--border)', paddingBottom: 16 }}>
                    <div>
                      <strong>{item.icon} {item.name}</strong>
                      <div className="text-sm text-muted mt-8">Đơn Giá: {item.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <span className="badge badge-info p-8">x{item.quantity}</span>
                 </div>
               ))}
            </div>
          )}
       </div>

       {items.length > 0 && (
         <div className="mt-16 pt-16" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-primary w-full" onClick={() => alert('Thanh Toán Cắt Lổ!')}>Chốt Đơn Mang Tiền Về</button>
            <button className="btn btn-secondary w-full mt-8" onClick={clearCart}>Dọn Xóa Trắng Giỏ (Reset)</button>
         </div>
       )}
    </div>
  );
}

export default function Ch16_StateManagement() {
  return (
    <div>
      <h1 className="page-title">🏪 Bài 16: Quản Lý State Tập Trung</h1>
      <p className="page-subtitle">Redux Toolkit, Zustand - Ném Biến Ra Khỏi Nồi Component Mẹ-Con</p>

      <h2>1. Thế Giới Không Hook Dùng Chung Khổ Thế Nào?</h2>
      <DemoSection title="Zustand Tự Chế Bằng Thuật Toán Observer (Core Của Global State)" badge="1 File Ảo = Mọi Nơi Dùng Được">
         <InfoBox type="info">Component <code className="code-inline">Navbar</code> và <code className="code-inline">Giỏ Hàng</code> Hoàn toàn không Cùng Component Cha Lớn Nào Quản Lý. Nếu Dùng Props Drilling là Chết Chắc. Redux, Zustand Lưu Bộ Não Ở Biến Toàn Mạng (Ngay Cấp Module Tệp Tin) Rồi Phát Tín Hiệu Xin <code className="code-inline">Render</code>.</InfoBox>
         
         <div style={{ position: 'relative' }}>
            <MiniNavBarTrangBi />
            {/* Lớp Màng Dưới Chứa Hàng */}
            <SanPhamKhuVuc />
            {/* Thanh Trượt Nổi Ở Nắp Đậy Trên Cùng  */}
            <GioHangTrượtSidebar />
         </div>

         <div className="mt-24">
             <InfoBox type="warning"><strong>Tip:</strong> Zustand (Con Gấu Nhỏ) Là Thư Viện State Lớn Nhất Bấy Giờ Của React. Dễ Hơn Redux Toolkit 10 Lần Vì Không Khai Báo Boilerplate Kồng Kềnh.</InfoBox>
             <pre className="code-inline" style={{ display: 'block', padding: 16, marginTop: 16 }}>
{`// Cài đặt npm install zustand (Siêu Nhẹ)
import { create } from 'zustand'

export const useStore = create((set) => ({
  gấu: 0,
  tangGau: () => set((state) => ({ gấu: state.gấu + 1 })),
}))

// Khi Gọi Chơi Ngay TRONG BẤT KỲ FILE NÀO:
const gauCount = useStore(state => state.gấu);
const tangNhanh = useStore(state => state.tangGau);`}
             </pre>
         </div>
      </DemoSection>

    </div>
  );
}
