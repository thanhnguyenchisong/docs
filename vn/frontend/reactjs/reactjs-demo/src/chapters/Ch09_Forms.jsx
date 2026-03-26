// Chương 9: Forms
import { useState, useRef } from 'react';
import { DemoSection, InfoBox, DemoResult } from '../components/DemoSection.jsx';

// ═══ Controlled Components ═══
function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    gender: 'male',
    skills: ['react'],
    agreeTerms: false,
    bio: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: checked 
          ? [...prev.skills, value]
          : prev.skills.filter(s => s !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Submit thành công!\n${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <div className="grid-2">
      <form onSubmit={handleSubmit} className="card">
        {/* Text Input */}
        <div className="input-group">
          <label>Tên đăng nhập (Chỉ chữ thường)</label>
          <input 
            className="input" 
            name="username" 
            value={formData.username}
            onChange={(e) => {
              // Ép kiểu ngay khi gõ
              e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
              handleChange(e);
            }} 
            required 
          />
        </div>

        {/* Radio Buttons */}
        <div className="input-group">
          <label>Giới tính</label>
          <div className="flex gap-16 mt-8">
            <label className="flex items-center gap-8">
              <input type="radio" name="gender" value="male" 
                checked={formData.gender === 'male'} onChange={handleChange} /> Nam
            </label>
            <label className="flex items-center gap-8">
              <input type="radio" name="gender" value="female" 
                checked={formData.gender === 'female'} onChange={handleChange} /> Nữ
            </label>
          </div>
        </div>

        {/* Select Dropdown */}
        <div className="input-group">
          <label>Quốc gia</label>
          <select className="input" name="country" value={formData.country} onChange={handleChange}>
            <option value="vn">Việt Nam</option>
            <option value="us">Hoa Kỳ</option>
            <option value="jp">Nhật Bản</option>
          </select>
        </div>

        {/* Checkbox Group (Array Map) */}
        <div className="input-group">
          <label>Kỹ năng (Cho phép chọn nhiều)</label>
          <div className="flex flex-wrap gap-16 mt-8">
            {['React', 'Vue', 'Angular'].map(skill => (
              <label key={skill} className="flex items-center gap-8">
                <input 
                  type="checkbox" 
                  name="skills" 
                  value={skill.toLowerCase()}
                  checked={formData.skills.includes(skill.toLowerCase())}
                  onChange={handleChange}
                /> {skill}
              </label>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="input-group">
          <label>Giới thiệu bản thân ({formData.bio.length}/200 ký tự)</label>
          <textarea 
            className="input" 
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            maxLength={200}
          />
        </div>

        {/* Single Checkbox */}
        <div className="input-group mt-16 pb-16" style={{ borderBottom: '1px solid var(--border)' }}>
          <label className="flex items-center gap-8">
            <input 
              type="checkbox" 
              name="agreeTerms" 
              checked={formData.agreeTerms} 
              onChange={handleChange} 
              required
            /> Đồng ý với điều khoản
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-16" disabled={!formData.agreeTerms}>
          Đăng Ký
        </button>
      </form>

      <DemoResult label="State Thực Tế (Real-time)">
        <pre className="code-inline" style={{ display: 'block', padding: 16 }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </DemoResult>
    </div>
  );
}

// ═══ Uncontrolled Components ═══
function UncontrolledForm() {
  const nameRef = useRef(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const file = fileRef.current.files[0];
    
    alert(`Submit Uncontrolled Form:\nTên file: ${file ? file.name : 'Chưa chọn file'}\nĐổi tên thành: ${name}`);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="input-group">
        <label>Tên hiển thị (useRef)</label>
        <input 
          className="input" 
          ref={nameRef} 
          defaultValue="Anonymous" 
          placeholder="Nhập tên..."
        />
        <span className="text-sm text-muted mt-8 block">Thay đổi input này KHÔNG làm React re-render.</span>
      </div>

      <div className="input-group mt-16">
        <label>Chọn File (Bắt buộc dùng Uncontrolled)</label>
        <input 
          type="file" 
          ref={fileRef}
          className="input"
          style={{ padding: '8px' }}
        />
      </div>

      <button type="submit" className="btn btn-secondary w-full mt-16">
        Tải lên (Dùng Ref lấy giá trị)
      </button>
    </form>
  );
}

// ═══ Form Validation Thực Tế ═══
function ValidationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Compute errors (Derived state)
  const errors = {};
  if (!email) errors.email = 'Vui lòng nhập Email.';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email không hợp lệ (có dạng @).';
  
  if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (password.length < 6) errors.password = 'Mật khẩu phải lớn hơn 6 ký tự.';

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true }); // Chạm tất cả
    if (isFormValid) {
      alert('Đăng nhập thành công!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h4 className="mb-16 text-center">Đăng Nhập Khắt Khe</h4>
      
      <div className="input-group">
        <label>Email</label>
        <input 
          className="input" 
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(prev => ({...prev, email: true}))}
          style={touched.email && errors.email ? { borderColor: 'var(--error)' } : {}}
        />
        {touched.email && errors.email && (
          <span className="text-sm mt-8 block" style={{ color: 'var(--error)' }}>{errors.email}</span>
        )}
      </div>

      <div className="input-group mt-16">
        <label>Mật Khẩu</label>
        <input 
          className="input" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched(prev => ({...prev, password: true}))}
          style={touched.password && errors.password ? { borderColor: 'var(--error)' } : {}}
        />
        {touched.password && errors.password && (
          <span className="text-sm mt-8 block" style={{ color: 'var(--error)' }}>{errors.password}</span>
        )}
      </div>

      <button 
        type="submit" 
        className="btn btn-primary w-full mt-16"
        disabled={touched.email && touched.password && !isFormValid}
      >
        Vào Hệ Thống
      </button>
    </form>
  );
}

export default function Ch09_Forms() {
  return (
    <div>
      <h1 className="page-title">📑 Bài 09: Forms Cơ Bản Đến Nâng Cao</h1>
      <p className="page-subtitle">Controlled vs Uncontrolled, File Input, và Client-side Validation</p>

      <h2>1. Controlled Components (Form Chuẩn React)</h2>
      <DemoSection title="Tất cả Field Types" badge="Quy tắc: State (value) + Event (onChange)">
        <InfoBox>Trong react, input được "đồng bộ" chặt chẽ với <code className="code-inline">state</code>. React trở thành "Single Source of Truth" chứ ko phải DOM.</InfoBox>
        <ControlledForm />
      </DemoSection>

      <h2>2. Uncontrolled Components và File Upload</h2>
      <DemoSection title="Trường hợp dùng Uncontrolled (useRef)" badge="Ref Value">
        <InfoBox type="warning">Input File ({"<input type='file'>"}) <strong>bắt buộc</strong> phải dùng Uncontrolled / Ref. Bạn không thể truyền State (chứa chuỗi String) xuống <code className="code-inline">value</code> của HTML File.</InfoBox>
        <div style={{ maxWidth: 500 }}>
          <UncontrolledForm />
        </div>
      </DemoSection>
      
      <h2>3. Form Validation Đơn Giản</h2>
      <DemoSection title="Validation OnBlur (Chạm vào mới báo lỗi)" badge="Derived Errors">
        <ValidationForm />
      </DemoSection>

    </div>
  );
}
