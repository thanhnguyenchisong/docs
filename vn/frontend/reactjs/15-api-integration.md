# Bài 15: API Integration - Tích Hợp API

## 📚 Mục tiêu bài học
- Fetch API và Axios
- Custom hooks cho data fetching
- Error handling, retry, caching patterns
- TanStack Query (React Query) giới thiệu
- Optimistic updates

---

## 1. Fetch API Cơ Bản

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, []);

  if (loading) return <p>⏳ Đang tải...</p>;
  if (error) return <p>❌ Lỗi: {error}</p>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

---

## 2. Axios

```bash
npm install axios
```

```jsx
import axios from 'axios';

// ═══ Tạo Axios Instance ═══
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ═══ API Service ═══
const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
```

---

## 3. Custom Hook: useFetch

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!url) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}

// Sử dụng
function PostList() {
  const { data: posts, loading, error, refetch } = useFetch('/api/posts');

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div>
      <button onClick={refetch}>🔄 Làm mới</button>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

---

## 4. CRUD Operations Pattern

```jsx
function useCRUD(baseUrl) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const create = async (newItem) => {
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const created = await res.json();
      setItems(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const update = async (id, updates) => {
    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setItems(prev => prev.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { items, loading, error, create, update, remove, refetch: fetchAll };
}

// Sử dụng
function TodoApp() {
  const {
    items: todos,
    loading,
    create,
    update,
    remove,
  } = useCRUD('/api/todos');

  const handleAdd = (text) => create({ text, done: false });
  const handleToggle = (id, done) => update(id, { done: !done });
  const handleDelete = (id) => remove(id);

  return (/* render todos */);
}
```

---

## 5. TanStack Query (React Query)

```bash
npm install @tanstack/react-query
```

```jsx
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  );
}

function TodoApp() {
  const queryClient = useQueryClient();

  // ═══ Query: Fetch data ═══
  const { data: todos, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json()),
    staleTime: 5 * 60 * 1000,   // Cache 5 phút
    refetchOnWindowFocus: true,  // Refetch khi focus tab
  });

  // ═══ Mutation: Create ═══
  const createMutation = useMutation({
    mutationFn: (newTodo) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] }); // Refetch
    },
  });

  // ═══ Mutation: Delete (Optimistic Update) ═══
  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/todos/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(['todos']);
      // Optimistic: xóa ngay trước khi API trả về
      queryClient.setQueryData(['todos'], old => old.filter(t => t.id !== id));
      return { previous };
    },
    onError: (err, id, context) => {
      // Rollback nếu lỗi
      queryClient.setQueryData(['todos'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  if (isLoading) return <p>⏳ Loading...</p>;
  if (error) return <p>❌ {error.message}</p>;

  return (
    <div>
      <button onClick={() => createMutation.mutate({ text: 'New todo', done: false })}>
        {createMutation.isPending ? 'Đang thêm...' : '➕ Thêm'}
      </button>
      {todos.map(todo => (
        <div key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => deleteMutation.mutate(todo.id)}>🗑️</button>
        </div>
      ))}
    </div>
  );
}
```

### Tại sao dùng TanStack Query?

| Feature | DIY (tự viết) | TanStack Query |
|---------|---------------|----------------|
| Caching | ❌ Phải tự implement | ✅ Tự động |
| Refetch on focus | ❌ | ✅ |
| Pagination | Phức tạp | ✅ Built-in |
| Optimistic updates | Rất phức tạp | ✅ Simple API |
| Retry on error | ❌ | ✅ Tự động (3 lần) |
| Deduplication | ❌ | ✅ |
| DevTools | ❌ | ✅ |

---

## 6. Error Handling Patterns

```jsx
// ═══ Centralized Error Handler ═══
class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function apiCall(url, options) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      errorData.message || `HTTP Error ${res.status}`,
      errorData
    );
  }

  return res.json();
}

// ═══ Error Display Component ═══
function ApiErrorDisplay({ error, onRetry }) {
  if (!error) return null;

  const errorMessages = {
    400: '❌ Dữ liệu không hợp lệ',
    401: '🔒 Phiên đăng nhập hết hạn',
    403: '🚫 Bạn không có quyền truy cập',
    404: '🔍 Không tìm thấy dữ liệu',
    429: '⏰ Quá nhiều yêu cầu, vui lòng thử lại sau',
    500: '🔧 Lỗi server, vui lòng thử lại',
  };

  return (
    <div className="error-container">
      <p>{errorMessages[error.status] || error.message}</p>
      {onRetry && <button onClick={onRetry}>🔄 Thử lại</button>}
    </div>
  );
}
```

---

## 📝 Bài Tập

### Bài 1: CRUD App hoàn chỉnh (Users/Posts) với fetch API
### Bài 2: Infinite scrolling list với pagination API
### Bài 3: Search autocomplete với debounce + abort
### Bài 4: Migrate từ DIY fetch sang TanStack Query

---

> **Bài trước:** [14 - React Router ←](./14-react-router.md)  
> **Bài tiếp theo:** [16 - State Management →](./16-state-management.md)
