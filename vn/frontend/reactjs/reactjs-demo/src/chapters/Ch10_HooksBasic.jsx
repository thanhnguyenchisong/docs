// Chương 10: Hooks Cơ Bản (useEffect, useRef)
import { useState, useEffect, useRef } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ useEffect Cơ Bản & Chạy Lại Khi Nào? ═══
function EffectDependencies() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 4));

  // 1. Chạy MỌI render (Thiếu Dependency Array)
  useEffect(() => {
    console.log('Mọi render: Cả Count lẫn Text');
  }); 

  // 2. Chạy 1 LẦN DUY NHẤT khi component bắt đầu chạy (Mount)
  useEffect(() => {
    addLog('🟢 Component Mounted (Chạy 1 lần)');
    return () => console.log('🔴 Component Unmounted');
  }, []);

  // 3. Chỉ chạy khi Count đổi (Bỏ qua Text)
  useEffect(() => {
    if (count > 0) addLog(`🔄 Effect: Count đã tăng lên ${count}`);
    // Cleanup Effect sẽ dọn trước khi set effect mới
    return () => console.log(`Dọn dẹp count ${count}`);
  }, [count]);

  return (
    <div className="grid-2">
      <div className="card text-center pb-8 p-16">
        <h4 className="mb-16">Click Tăng Số đếm sẽ kích hoạt Effect</h4>
        <div className="flex justify-center items-center gap-16 mb-16">
          <span style={{ fontSize: 32 }}>{count}</span>
          <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>Tăng Count +1</button>
        </div>
        <hr className="divider" />
        <h4 className="mb-16">Gõ Chữ Này KHÔNG kích hoạt Effect</h4>
        <input className="input" placeholder="Thử gõ vào..." value={text} onChange={e => setText(e.target.value)} />
      </div>

      <DemoResult label="Log Theo Dõi Effect [count]:">
        <ul style={{ paddingLeft: 20 }}>
          {logs.map((L, i) => (
             <li className="text-sm mb-8" key={i}>{L}</li>
          ))}
        </ul>
      </DemoResult>
    </div>
  );
}

// ═══ useEffect: Lấy Data (Fetch API) ═══
function EffectFetch() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const abortCtrl = new AbortController();

    const fetchPosts = async () => {
      setLoading(true); setErr('');
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3', { signal: abortCtrl.signal });
        if (!res.ok) throw new Error('API Lỗi!');
        const json = await res.json();
        setData(json);
      } catch (error) {
        if (error.name !== 'AbortError') setErr(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // CLEANUP CAUTIONS
    return () => abortCtrl.abort();
  }, []); // rỗng: chạy khi component được show lần đầu tiên

  return (
    <div className="card">
      <h4 className="mb-16 text-center">Gọi Mock API (JSON Placeholder)</h4>
      {loading && <p className="text-muted text-center animate-pulse">Đang tải data...</p>}
      {err && <p style={{ color: 'var(--error)' }}>Lỗi: {err}</p>}

      {!loading && !err && data.map(post => (
        <div key={post.id} style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
          <strong>Post #{post.id}: {post.title}</strong>
        </div>
      ))}
    </div>
  );
}

// ═══ useRef Cơ Bản & So với useState ═══
function RefVsState() {
  const [renderCount, setRenderCount] = useState(0); // Làm re-render UI
  const hiddenCount = useRef(0); // Update NGẦM, KHÔNG Re-render

  const DOMElementRef = useRef(null);

  const forceRender = () => {
    setRenderCount(renderCount + 1);
  };

  const handleFocus = () => {
    // Thao tác DOM KHÔNG qua React
    DOMElementRef.current.focus();
    DOMElementRef.current.style.border = '2px solid var(--success)';
  };

  const incrementRef = () => {
    hiddenCount.current += 1; // Giá trị mới ngay lập tức
    console.log('Ref Hiện Tại: ', hiddenCount.current);
  };

  return (
    <div className="grid-2">
      <div className="card text-center pb-16">
        <h4 className="mb-16">useState (Re-render: {renderCount})</h4>
        <button className="btn btn-secondary" onClick={forceRender}>Tăng State & Render Lại (Màn hình chớp)</button>
        
        <h4 className="mb-8 mt-16 text-muted">useRef (Bí_Mật: {hiddenCount.current})</h4>
        <button className="btn btn-primary" onClick={incrementRef}>Tăng Value Của Ref Ngầm (Log F12)</button>
        <p className="text-sm text-muted mt-8">Bấm nút trên rồi bấm Ref, giá trị Ref sẽ tăng nhưng ko show cho đến lần Render tới.</p>
      </div>

      <div className="card p-16">
        <h4 className="mb-16 text-center">DOM Truy Cập Trực Tiếp (Ref)</h4>
        <input 
           ref={DOMElementRef} 
           className="input mb-16" 
           placeholder="Con trỏ chuột chớp ở đây" 
        />
        <button className="btn btn-success" onClick={handleFocus} style={{ background: 'var(--success)', color: '#000', borderRadius: 8, padding: '8px 16px', display: 'block', margin: '0 auto', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
           Auto Focus DOM
        </button>
      </div>
    </div>
  );
}

export default function Ch10_HooksBasic() {
  return (
    <div>
      <h1 className="page-title">🪝 Bài 10: Hooks Cơ Bản</h1>
      <p className="page-subtitle">Quản lý hiệu ứng phụ (useEffect) và truy xuất bộ nhớ/DOM (useRef)</p>

      <h2>1. Hiểu Rõ Vòng Đời Của Array Phụ Thuộc (Dependency)</h2>
      <DemoSection title="useEffect - Cách chọn Dependency" badge="[deps]">
        <InfoBox>
           <code className="code-inline">useEffect(()=&gt;&#123;&#125;, [biến])</code>: Chạy khi React phát hiện <strong>Biến</strong> đã mang giá trị khác từ lần trước.
        </InfoBox>
        <EffectDependencies />
      </DemoSection>

      <h2>2. Gọi API Vào Lần Render Đầu Tiên</h2>
      <DemoSection title="Fetch Data (Dọn Dẹp Rác Request)" badge="useEffect">
         <InfoBox type="warning">Luôn return 1 hàm dọn dẹp khi Effect setup một thứ gì đó kéo dài: (Event Listener, setTimeout, Fetch...). Nếu Component biến mất nhưng Request đã gọi xong (gọi <code className="code-inline">setState</code>) {`=>`} Lỗi Memory Leak.</InfoBox>
         <EffectFetch />
      </DemoSection>

      <h2>3. Khi Nào Dùng "useRef"?</h2>
      <DemoSection title="Thao Tác Component / Nhớ Value" badge="useRef">
        <InfoBox>State để hiển thị ra UI. Ref để "tính toán nháp" bên dưới mà ko làm hỏng UI, hoặc túm lấy 1 DOM HTML cụ thể.</InfoBox>
        <RefVsState />
      </DemoSection>
    </div>
  );
}
