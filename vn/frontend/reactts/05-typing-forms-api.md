# Bài 05: Typing Forms & API

## 📚 Mục tiêu bài học

- Type form state, validation, submission
- Type API responses, error handling
- Runtime validation với **Zod** + TypeScript
- Patterns: form builder, API client type-safe

---

## 1. Typing Form State

### Controlled form cơ bản

```tsx
type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.login(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" value={form.email} onChange={handleChange} />
      <input name="password" type="password" value={form.password} onChange={handleChange} />
      <label>
        <input name="rememberMe" type="checkbox" checked={form.rememberMe} onChange={handleChange} />
        Ghi nhớ
      </label>
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

### Generic form hook

```tsx
function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return { values, errors, touched, handleChange, handleBlur, setFieldValue, setErrors, reset };
}

// Sử dụng:
const { values, handleChange, setFieldValue } = useForm({
  name: '',
  age: 0,
  role: 'viewer' as 'admin' | 'editor' | 'viewer',
});
// values.name: string, values.age: number, values.role: 'admin' | 'editor' | 'viewer'
```

---

## 2. Form Validation với Zod

### Zod — runtime validation + TypeScript type inference

```bash
npm install zod
```

```tsx
import { z } from 'zod';

// === Define schema — vừa validate vừa tạo type ===
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  rememberMe: z.boolean().default(false),
});

// Tạo type TỰ ĐỘNG từ schema
type LoginInput = z.infer<typeof loginSchema>;
// = { email: string; password: string; rememberMe: boolean }

// === Validate ===
function handleSubmit(data: unknown) {
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    // result.error.flatten() → { fieldErrors: { email: [...], password: [...] } }
    const errors = result.error.flatten().fieldErrors;
    console.log(errors.email);    // string[] | undefined
    console.log(errors.password); // string[] | undefined
    return;
  }

  // result.data đã được validate — type-safe
  const validData: LoginInput = result.data;
  api.login(validData);
}
```

### Zod schemas phức tạp

```tsx
const productSchema = z.object({
  name: z.string().min(1, 'Tên bắt buộc').max(100),
  price: z.number().positive('Giá phải lớn hơn 0'),
  category: z.enum(['electronics', 'clothing', 'food']),
  tags: z.array(z.string()).min(1, 'Cần ít nhất 1 tag'),
  metadata: z.object({
    weight: z.number().optional(),
    dimensions: z.string().optional(),
  }).optional(),
});

type ProductInput = z.infer<typeof productSchema>;
```

---

## 3. Typing API Responses

### API client type-safe

```tsx
// === Response types ===
type ApiResponse<T> = {
  data: T;
  message: string;
};

type ApiError = {
  message: string;
  code: string;
  details?: Record<string, string[]>;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

// === API client ===
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error: ApiError = await res.json();
    throw error;
  }
  return res.json() as Promise<T>;
}

async function apiPost<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error: ApiError = await res.json();
    throw error;
  }
  return res.json() as Promise<TResponse>;
}

// === Sử dụng — type-safe ===
const products = await apiGet<PaginatedResponse<Product>>('/api/products?page=1');
// products.data: Product[], products.meta: { page, pageSize, total }

const newProduct = await apiPost<ProductInput, ApiResponse<Product>>('/api/products', {
  name: 'Laptop',
  price: 25000000,
  category: 'electronics',
  tags: ['tech'],
});
// newProduct.data: Product
```

### Hook useFetch type-safe

```tsx
function useFetch<T>(url: string | null) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: ApiError | null;
  }>({ data: null, loading: !!url, error: null });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();

    setState(s => ({ ...s, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw res;
        return res.json() as Promise<T>;
      })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(async err => {
        if (err.name === 'AbortError') return;
        const error = err instanceof Response ? await err.json() : { message: String(err), code: 'UNKNOWN' };
        setState({ data: null, loading: false, error });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// Sử dụng:
const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);
// user: User | null, error: ApiError | null
```

---

## 4. React Hook Form + Zod

```bash
npm install react-hook-form @hookform/resolvers zod
```

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Tên bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  age: z.number().int().min(18, 'Phải từ 18 tuổi'),
});

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', age: 18 },
  });

  const onSubmit = async (data: FormValues) => {
    // data đã validated — type-safe
    await api.register(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
      </button>
    </form>
  );
}
```

---

## 🔑 Tóm tắt

| Pattern | Khi nào dùng |
|---------|-------------|
| `useForm<T>()` custom hook | Form nhỏ, không cần thư viện |
| Zod schema + `z.infer` | Validate runtime + tạo type tự động |
| `react-hook-form` + Zod | Form phức tạp, validation, performance |
| `apiGet<T>()` generic | API client type-safe |
| `useFetch<T>()` | Hook fetch data type-safe |

---

> **Bài trước:** [04 - Typing Hooks ←](./04-typing-hooks.md)  
> **Bài tiếp theo:** [06 - Generic Components →](./06-generic-components.md)
