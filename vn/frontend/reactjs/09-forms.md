# Bài 09: Forms - Biểu Mẫu Trong React

## 📚 Mục tiêu bài học
- Controlled vs Uncontrolled Components
- Xử lý tất cả loại form input
- Form validation patterns
- Multi-step forms
- Form libraries giới thiệu

---

## 1. Controlled Components

**Controlled Component**: React state là "nguồn sự thật duy nhất" (single source of truth) của input.

```jsx
function ControlledForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // React KIỂM SOÁT giá trị input
  // Input hiển thị gì = state quyết định
  return (
    <form>
      <input
        value={name}              // Giá trị từ state
        onChange={e => setName(e.target.value)}  // Cập nhật state
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <p>Xin chào: {name} ({email})</p>
    </form>
  );
}
```

```
Controlled Flow:

User gõ "A" → onChange → setName("A") → re-render → input hiển thị "A"
                 ↑                                         ↓
              Browser                                   React state
              event                                    là source of truth
```

## 2. Uncontrolled Components

**Uncontrolled Component**: DOM tự quản lý giá trị, React dùng `ref` để đọc khi cần.

```jsx
import { useRef } from 'react';

function UncontrolledForm() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Đọc giá trị từ DOM khi cần
    console.log('Name:', nameRef.current.value);
    console.log('Email:', emailRef.current.value);
    console.log('File:', fileRef.current.files[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* defaultValue thay vì value */}
      <input ref={nameRef} defaultValue="Giá trị mặc định" />
      <input ref={emailRef} type="email" />
      {/* File input LUÔN là uncontrolled */}
      <input ref={fileRef} type="file" />
      <button type="submit">Gửi</button>
    </form>
  );
}
```

### Khi nào dùng cái nào?

| Tính năng | Controlled | Uncontrolled |
|----------|-----------|-------------|
| Validate realtime | ✅ | ❌ |
| Format input (mask) | ✅ | ❌ |
| Conditional disable | ✅ | ❌ |
| Enforce format | ✅ | ❌ |
| Dynamic inputs | ✅ | ❌ |
| File input | ❌ | ✅ |
| Đơn giản, ít logic | Overkill | ✅ |
| Kết hợp non-React code | ❌ | ✅ |

> **Khuyến nghị:** Dùng **Controlled** cho hầu hết trường hợp. Chỉ dùng **Uncontrolled** cho file input và form rất đơn giản.

---

## 3. Xử Lý Tất Cả Loại Input

### 3.1 Generic Change Handler

```jsx
function CompleteForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    bio: '',
    gender: '',
    country: '',
    skills: [],
    agreeTerms: false,
    newsletter: false,
    priority: 'medium',
  });

  // ✅ Một handler cho tất cả inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handler đặc biệt cho multiple checkboxes (skills)
  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      skills: checked
        ? [...prev.skills, value]
        : prev.skills.filter(s => s !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Text Input */}
      <div>
        <label htmlFor="name">Họ tên:</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập họ tên..."
        />
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Number Input */}
      <div>
        <label htmlFor="age">Tuổi:</label>
        <input
          id="age"
          name="age"
          type="number"
          min="0"
          max="120"
          value={formData.age}
          onChange={handleChange}
        />
      </div>

      {/* Textarea */}
      <div>
        <label htmlFor="bio">Giới thiệu:</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          maxLength={500}
        />
        <small>{formData.bio.length}/500</small>
      </div>

      {/* Radio Buttons */}
      <fieldset>
        <legend>Giới tính:</legend>
        {['male', 'female', 'other'].map(g => (
          <label key={g}>
            <input
              type="radio"
              name="gender"
              value={g}
              checked={formData.gender === g}
              onChange={handleChange}
            />
            {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
          </label>
        ))}
      </fieldset>

      {/* Select / Dropdown */}
      <div>
        <label htmlFor="country">Quốc gia:</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
        >
          <option value="">-- Chọn quốc gia --</option>
          <option value="vn">🇻🇳 Việt Nam</option>
          <option value="us">🇺🇸 Mỹ</option>
          <option value="jp">🇯🇵 Nhật Bản</option>
          <option value="kr">🇰🇷 Hàn Quốc</option>
        </select>
      </div>

      {/* Multiple Checkboxes */}
      <fieldset>
        <legend>Kỹ năng:</legend>
        {['React', 'Vue', 'Angular', 'Svelte', 'Node.js'].map(skill => (
          <label key={skill}>
            <input
              type="checkbox"
              value={skill}
              checked={formData.skills.includes(skill)}
              onChange={handleSkillChange}
            />
            {skill}
          </label>
        ))}
      </fieldset>

      {/* Single Checkbox */}
      <label>
        <input
          type="checkbox"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
        />
        Đồng ý điều khoản sử dụng
      </label>

      {/* Range / Slider */}
      <div>
        <label>Mức ưu tiên: {formData.priority}</label>
        <input
          type="range"
          name="priority"
          min="1"
          max="10"
          value={formData.priority}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={!formData.agreeTerms}>
        Gửi
      </button>
    </form>
  );
}
```

---

## 4. Form Validation

### 4.1 Validation On Submit

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data) => {
    const newErrors = {};

    // Username
    if (!data.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (data.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      newErrors.username = 'Chỉ được dùng chữ cái, số và gạch dưới';
    }

    // Email
    if (!data.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Password
    if (!data.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (data.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      newErrors.password = 'Cần có chữ hoa, chữ thường và số';
    }

    // Confirm Password
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // await api.register(formData);
        console.log('✅ Đăng ký thành công!', formData);
      } catch (err) {
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa error khi user bắt đầu sửa
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="error-banner">❌ {errors.submit}</div>
      )}

      <FormField
        label="Tên đăng nhập"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <FormField
        label="Mật khẩu"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <FormField
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '⏳ Đang xử lý...' : '📝 Đăng ký'}
      </button>
    </form>
  );
}

// Reusable Form Field Component
function FormField({ label, name, type = 'text', value, onChange, error }) {
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="error-message">⚠️ {error}</span>}
    </div>
  );
}
```

### 4.2 Real-time Validation (onChange / onBlur)

```jsx
function RealtimeValidation() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = touched && !email.includes('@') ? 'Email không hợp lệ' : '';

  // Password strength indicator
  const [password, setPassword] = useState('');

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    const levels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh', 'Rất mạnh'];
    const colors = ['', '#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];

    return { score, label: levels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(password);

  return (
    <form>
      <div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          style={{ borderColor: emailError ? 'red' : '#ccc' }}
          placeholder="Email"
        />
        {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mật khẩu"
        />
        {password && (
          <div>
            <div style={{
              height: 4,
              background: '#eee',
              borderRadius: 2,
              marginTop: 4
            }}>
              <div style={{
                height: '100%',
                width: `${(strength.score / 5) * 100}%`,
                background: strength.color,
                borderRadius: 2,
                transition: 'all 0.3s'
              }} />
            </div>
            <small style={{ color: strength.color }}>
              {strength.label}
            </small>
          </div>
        )}
      </div>
    </form>
  );
}
```

---

## 5. Custom Hook Cho Form (useForm)

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({ ...prev, [name]: newValue }));

    // Validate on change nếu field đã touched
    if (touched[name] && validate) {
      const fieldErrors = validate({ ...values, [name]: newValue });
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] || '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validate) {
      const fieldErrors = validate(values);
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] || '' }));
    }
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();

    // Touch tất cả fields
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched);

    // Validate tất cả
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return {
    values, errors, touched, isSubmitting,
    handleChange, handleBlur, handleSubmit,
    reset, getFieldProps,
  };
}

// ═══ Sử dụng useForm ═══
function LoginForm() {
  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email bắt buộc';
    if (!values.password) errors.password = 'Mật khẩu bắt buộc';
    if (values.password && values.password.length < 6)
      errors.password = 'Ít nhất 6 ký tự';
    return errors;
  };

  const form = useForm({ email: '', password: '' }, validate);

  const onSubmit = async (values) => {
    console.log('Login:', values);
    // await api.login(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <input
          type="email"
          placeholder="Email"
          {...form.getFieldProps('email')}
        />
        {form.touched.email && form.errors.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Mật khẩu"
          {...form.getFieldProps('password')}
        />
        {form.touched.password && form.errors.password && (
          <span className="error">{form.errors.password}</span>
        )}
      </div>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
```

---

## 6. Dynamic Form Fields

```jsx
function DynamicForm() {
  const [members, setMembers] = useState([
    { id: 1, name: '', email: '', role: 'member' }
  ]);

  const addMember = () => {
    setMembers(prev => [
      ...prev,
      { id: Date.now(), name: '', email: '', role: 'member' }
    ]);
  };

  const removeMember = (id) => {
    if (members.length === 1) return; // Giữ ít nhất 1
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const updateMember = (id, field, value) => {
    setMembers(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Members:', members);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Thêm Thành Viên Nhóm</h2>

      {members.map((member, index) => (
        <div key={member.id} className="member-row" style={{
          display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center'
        }}>
          <span>{index + 1}.</span>
          <input
            placeholder="Tên"
            value={member.name}
            onChange={e => updateMember(member.id, 'name', e.target.value)}
          />
          <input
            placeholder="Email"
            type="email"
            value={member.email}
            onChange={e => updateMember(member.id, 'email', e.target.value)}
          />
          <select
            value={member.role}
            onChange={e => updateMember(member.id, 'role', e.target.value)}
          >
            <option value="member">Thành viên</option>
            <option value="admin">Admin</option>
            <option value="viewer">Người xem</option>
          </select>
          <button type="button" onClick={() => removeMember(member.id)}>
            ❌
          </button>
        </div>
      ))}

      <button type="button" onClick={addMember}>➕ Thêm thành viên</button>
      <button type="submit">💾 Lưu</button>
    </form>
  );
}
```

---

## 7. Form Libraries (Giới Thiệu)

### React Hook Form (Phổ biến nhất)

```jsx
// npm install react-hook-form
import { useForm } from 'react-hook-form';

function RHFExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email bắt buộc',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email không hợp lệ'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        {...register('password', {
          required: 'Mật khẩu bắt buộc',
          minLength: { value: 6, message: 'Ít nhất 6 ký tự' }
        })}
        placeholder="Mật khẩu"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button disabled={isSubmitting}>Đăng nhập</button>
    </form>
  );
}
```

> **Khuyến nghị:** Dùng **React Hook Form** cho projects thực tế - ít re-render, hiệu suất cao, API đơn giản.

---

## 📝 Bài Tập Thực Hành

### Bài 1: Form Đăng Ký
Tạo form đăng ký đầy đủ với validation realtime: username, email, password, confirm password, giới tính, quốc gia, skills, agree terms.

### Bài 2: Multi-step Checkout
Form checkout 3 bước: Thông tin giao hàng → Phương thức thanh toán → Xác nhận & Submit.

### Bài 3: Dynamic Invoice Form
Form tạo hóa đơn: thêm/xóa dòng sản phẩm, tự tính thành tiền và tổng cộng.

### Bài 4: Search & Filter Form
Form tìm kiếm bất động sản: loại nhà, khoảng giá (range), diện tích, vị trí, tiện ích (multiple checkbox).

---

## 🔑 Tóm Tắt

| Khái niệm | Giải thích |
|-----------|------------|
| Controlled | React state kiểm soát giá trị input |
| Uncontrolled | DOM tự quản lý, dùng ref để đọc |
| `onChange` | Handler cập nhật state khi input thay đổi |
| `onSubmit` | Handler khi form submit (nhớ preventDefault) |
| `e.target.name` | Tên field, dùng cho generic handler |
| Validation | Kiểm tra dữ liệu: realtime hoặc on submit |
| Custom Hook | `useForm` tái sử dụng logic form |
| React Hook Form | Thư viện form phổ biến, hiệu suất cao |

---

> **Bài trước:** [08 - Lists & Keys ←](./08-lists-va-keys.md)  
> **Bài tiếp theo:** [10 - Hooks Cơ Bản →](./10-hooks-co-ban.md)
