// Chương 11: Hooks Nâng Cao (useReducer, useMemo, useCallback)
import { useState, useReducer, useMemo, useCallback } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ 1. useReducer ═══
// State phức tạp cần quản lý logic ở 1 nơi
const initialState = {
  count: 0,
  step: 1,
  history: []
};

// Reducer function (Pure function)
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, `+${state.step}`]
      };
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, `-${state.step}`]
      };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function ReducerDemo() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div className="grid-2">
      <div className="card text-center">
        <h4 className="mb-16">Giá trị: {state.count}</h4>
        
        <div className="flex items-center gap-8 justify-center mb-16">
          <label>Mức nhảy (Step):</label>
          <select 
            className="input" 
            style={{ width: 'auto' }}
            value={state.step}
            onChange={(e) => dispatch({ type: 'SET_STEP', payload: Number(e.target.value) })}
          >
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        <div className="flex justify-center gap-8 mb-16">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'DECREMENT' })}>- Trừ</button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'INCREMENT' })}>+ Cộng</button>
        </div>
        
        <button className="btn btn-danger btn-sm" onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      </div>

      <DemoResult label="Lịch sử hành động">
        <div className="text-sm text-muted" style={{ maxHeight: 150, overflowY: 'auto' }}>
          {state.history.length === 0 ? 'Chưa có thao tác' : (
            <div className="flex flex-wrap gap-8">
              {state.history.map((h, i) => (
                <span key={i} className="badge badge-info">{h}</span>
              ))}
            </div>
          )}
        </div>
      </DemoResult>
    </div>
  );
}

// ═══ 2. useMemo & useCallback ═══
// Hàm tính toán nặng (Giả lập)
const expensiveCalculation = (num) => {
  console.log('🔄 Đang tính toán nặng...');
  for (let i = 0; i < 10000000; i++) {
    num += 1;
  }
  return num;
};

// Child Component (Chỉ re-render khi props ĐỔI THỰC SỰ - thanks to React.memo)
import { memo } from 'react';
const ChildButton = memo(({ onAction, name }) => {
  console.log(`🎨 Render Child: ${name}`);
  return (
    <button className="btn btn-secondary btn-sm" onClick={onAction}>
      Click me ({name})
    </button>
  );
});

function MemoCallbackDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 1. useMemo: Cache GIÁ TRỊ TÍNH TOÁN
  // Chỉ tính lại khi 'count' thay đổi, gõ 'text' thì KHÔNG tính lại
  const calculatedValue = useMemo(() => expensiveCalculation(count), [count]);

  // 2. useCallback: Cache FUNCTION REFERENCE
  // Đảm bảo ChildButton không bị re-render vô ích khi 'text' thay đổi
  const handleAction = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Dependencies rỗng vì không dùng state bên ngoài

  // Hàm KHÔNG cache (Tạo mới mỗi lần render)
  const handleBadAction = () => {
    setCount(c => c + 1);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h4 className="mb-16">Expensive Calculation (useMemo)</h4>
        <div className="flex items-center justify-between mb-16">
          <span>Count gốc: <strong>{count}</strong></span>
          <button className="btn btn-primary btn-sm" onClick={() => setCount(c => c + 1)}>Tăng Count</button>
        </div>
        <p className="text-sm">Kết quả tính nặng: <span className="badge badge-accent">{calculatedValue}</span></p>
        
        <hr className="divider" />
        
        <h4 className="mb-8">Gõ text để test Re-render</h4>
        <input 
          className="input" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Thử gõ (Xem F12 log)" 
        />
        <p className="text-sm mt-8 text-muted">Gõ vào đây không làm tính toán hay re-render lại component con bên phải.</p>
      </div>

      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
        <h4 className="mb-16">Child Components (useCallback)</h4>
        
        <div className="mb-16">
          <p className="text-sm mb-8">✅ Kèm useCallback (Không render khi gõ chữ)</p>
          <ChildButton name="Optimized" onAction={handleAction} />
        </div>

        <div>
           <p className="text-sm mb-8">❌ KHÔNG useCallback (Bị render lại liên tục khi gõ chữ)</p>
           {/* Component này sẽ re-render vô ích vì handleBadAction tạo reference MỚI mỗi lần gõ */}
           <ChildButton name="Un-optimized" onAction={handleBadAction} />
        </div>
      </div>
    </div>
  );
}


// ═══ 3. Custom Hook (useDebounce) ═══
function useCustomHook() {
  // Logic tự định nghĩa
  const [value, setValue] = useState(false);
  const toggle = () => setValue(!value);
  return [value, toggle];
}

function ToggleCard() {
  const [isOpen, toggle] = useCustomHook();
  return (
     <div className="card text-center p-16">
         <h4 className="mb-16 text-muted">Test React Custom Hook (useToggle)</h4>
         <button className={`btn btn-${isOpen ? 'success' : 'secondary'}`} onClick={toggle} style={{ background: isOpen ? 'var(--success)' : ''}}>
             Trạng Thái Hiện Tại: {isOpen ? 'BẬT' : 'TẮT'}
         </button>
     </div>
  );
}

export default function Ch11_HooksAdvanced() {
  return (
    <div>
      <h1 className="page-title">🔧 Bài 11: Hooks Nâng Cao</h1>
      <p className="page-subtitle">Quản lý state phức tạp, tối ưu hiệu suất với useMemo và useCallback</p>

      <h2>1. Khi State Khó Kiểm Soát (useReducer)</h2>
      <DemoSection title="Máy Trạng Thái - Gộp chung Logic" badge="dispatch({type})">
         <InfoBox>
           State được update dựa theo "Hành Động" (Action). Thích hợp với Object khổng lồ. Code gọn gàng, test dễ hơn. (Đây là trái tim của Redux).
         </InfoBox>
         <ReducerDemo />
      </DemoSection>

      <h2>2. Tối Ưu Hiệu Suất (Performance)</h2>
      <DemoSection title="useMemo & useCallback" badge="Cache Memory">
        <InfoBox type="warning">
           Mỗi khi Component mẹ <code className="code-inline">setState</code>, VÀ Component con chứa Props, Toàn bộ chúng bị tạo mới. Cache (Trí Đệm) giúp React bỏ qua công đoạn này để UI Nhanh hơn.
        </InfoBox>
        <MemoCallbackDemo />
      </DemoSection>

      <h2>3. Tạo Hook Mang Hình Đóng Gói Riêng (Custom Hook)</h2>
      <DemoSection title="Tính Kế Thừa Gọn Gàng" badge="useToggle">
         <ToggleCard />
      </DemoSection>

    </div>
  );
}
