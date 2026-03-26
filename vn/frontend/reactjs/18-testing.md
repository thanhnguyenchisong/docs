# Bài 18: Testing - Kiểm Thử Ứng Dụng React

## 📚 Mục tiêu bài học
- Unit testing với Vitest/Jest
- Component testing với React Testing Library
- Integration testing patterns
- E2E testing giới thiệu (Playwright/Cypress)
- TDD workflow

---

## 1. Setup Testing

```bash
# Vitest (cho Vite projects - khuyến nghị)
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Jest (cho CRA hoặc Next.js)
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

```js
// vite.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});

// src/test/setup.js
import '@testing-library/jest-dom';
```

---

## 2. Unit Testing Components

### 2.1 Component đơn giản

```jsx
// ═══ Button.jsx ═══
function Button({ children, variant = 'primary', onClick, disabled }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ═══ Button.test.jsx ═══
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant className', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(); // vi.fn() cho Vitest, jest.fn() cho Jest

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Send</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick} disabled>Send</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 2.2 Testing Forms

```jsx
// ═══ LoginForm.test.jsx ═══
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders email and password fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByText(/email là bắt buộc/i)).toBeInTheDocument();
    expect(await screen.findByText(/mật khẩu là bắt buộc/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'password123');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.tab(); // Trigger onBlur

    expect(await screen.findByText(/email không hợp lệ/i)).toBeInTheDocument();
  });
});
```

### 2.3 Testing async components (API calls)

```jsx
// ═══ UserProfile.test.jsx ═══
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

// Mock fetch
global.fetch = vi.fn();

describe('UserProfile', () => {
  const mockUser = { id: 1, name: 'Nguyễn Văn A', email: 'a@test.com' };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<UserProfile userId={1} />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('displays user data after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    render(<UserProfile userId={1} />);

    expect(await screen.findByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('a@test.com')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UserProfile userId={1} />);

    expect(await screen.findByText(/lỗi/i)).toBeInTheDocument();
  });
});
```

---

## 3. Testing Custom Hooks

```jsx
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments correctly', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });
});
```

---

## 4. Queries Cheat Sheet

```jsx
// ═══ Tìm element (ưu tiên theo accessibility) ═══

// 1. getByRole (ƯU TIÊN 1 - Accessible)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { level: 1 });
screen.getByRole('checkbox');
screen.getByRole('link', { name: /about/i });

// 2. getByLabelText (Forms)
screen.getByLabelText(/email/i);

// 3. getByPlaceholderText
screen.getByPlaceholderText(/tìm kiếm/i);

// 4. getByText (Content)
screen.getByText(/xin chào/i);

// 5. getByTestId (Cuối cùng khi không có cách khác)
screen.getByTestId('custom-element');

// ═══ Variants ═══
// getBy...    → Throws nếu không tìm thấy (synchronous)
// queryBy...  → Return null nếu không tìm thấy
// findBy...   → Return Promise (async, chờ element xuất hiện)
// getAllBy... → Return array tất cả matches
```

---

## 5. Testing Best Practices

```
✅ NÊN:
├── Test behavior, KHÔNG test implementation
├── Test từ góc nhìn user (click, type, see text)
├── Dùng accessible queries (role, label)
├── Test edge cases (empty, error, loading)
├── Mỗi test case độc lập

❌ KHÔNG NÊN:
├── Test internal state trực tiếp
├── Test implementation details (function calls, state shape)
├── Snapshot testing quá nhiều
├── Test styles/CSS
└── Test thư viện bên thứ 3
```

---

## 6. E2E Testing (Giới Thiệu)

```bash
# Playwright (khuyến nghị)
npm install -D @playwright/test

# Cypress
npm install -D cypress
```

```js
// Playwright example: e2e/login.spec.js
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Xin chào')).toBeVisible();
});
```

---

## 📝 Bài Tập

### Bài 1: Test Todo component (add, toggle, delete, filter)
### Bài 2: Test form validation (required, format, match)
### Bài 3: Test async component (loading, success, error states)
### Bài 4: Test custom hook useLocalStorage

---

> **Bài trước:** [17 - Performance ←](./17-performance-optimization.md)  
> **Bài tiếp theo:** [19 - Advanced Patterns →](./19-advanced-patterns.md)
