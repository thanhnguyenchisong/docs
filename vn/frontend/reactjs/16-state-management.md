# Bài 16: State Management - Quản Lý State Toàn Cục

## 📚 Mục tiêu bài học
- Hiểu khi nào cần state management library
- Redux Toolkit (chuẩn công nghiệp)
- Zustand (lightweight, hiện đại)
- So sánh các giải pháp

---

## 1. Khi Nào Cần State Management?

```
Không cần (dùng useState + Context):
├── App nhỏ (< 10 components)
├── State đơn giản
├── Ít chia sẻ state giữa components
└── Prototype / MVP

Cần state management library:
├── App lớn, nhiều features
├── State phức tạp, nhiều actions
├── Nhiều components cần cùng data
├── Cần time-travel debugging
├── Team lớn, cần conventions
└── Cần middleware (logging, async)
```

---

## 2. Redux Toolkit (RTK)

```bash
npm install @reduxjs/toolkit react-redux
```

### 2.1 Tạo Slice

```jsx
// ═══ features/todos/todosSlice.js ═══
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk cho API calls
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    filter: 'all', // 'all' | 'active' | 'completed'
  },

  // Synchronous reducers
  reducers: {
    addTodo: (state, action) => {
      // RTK sử dụng Immer → có thể "mutate" trực tiếp!
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearCompleted: (state) => {
      state.items = state.items.filter(t => !t.completed);
    },
  },

  // Async reducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { addTodo, toggleTodo, deleteTodo, setFilter, clearCompleted } = todosSlice.actions;

// Selectors
export const selectAllTodos = (state) => state.todos.items;
export const selectTodoFilter = (state) => state.todos.filter;
export const selectFilteredTodos = (state) => {
  const { items, filter } = state.todos;
  switch (filter) {
    case 'active': return items.filter(t => !t.completed);
    case 'completed': return items.filter(t => t.completed);
    default: return items;
  }
};
export const selectRemainingCount = (state) =>
  state.todos.items.filter(t => !t.completed).length;

export default todosSlice.reducer;
```

### 2.2 Tạo Store

```jsx
// ═══ app/store.js ═══
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from '../features/todos/todosSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    auth: authReducer,
  },
});
```

### 2.3 Provider

```jsx
// ═══ main.jsx ═══
import { Provider } from 'react-redux';
import { store } from './app/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### 2.4 Sử dụng trong Components

```jsx
import { useSelector, useDispatch } from 'react-redux';
import {
  addTodo, toggleTodo, deleteTodo, setFilter,
  selectFilteredTodos, selectRemainingCount,
  fetchTodos
} from './todosSlice';

function TodoApp() {
  const dispatch = useDispatch();
  const todos = useSelector(selectFilteredTodos);
  const remaining = useSelector(selectRemainingCount);
  const status = useSelector(state => state.todos.status);
  const [text, setText] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos());
    }
  }, [status, dispatch]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch(addTodo(text.trim()));
      setText('');
    }
  };

  return (
    <div>
      <h1>Todo ({remaining} còn lại)</h1>

      <form onSubmit={handleAdd}>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button type="submit">Thêm</button>
      </form>

      {status === 'loading' && <p>⏳ Loading...</p>}

      {todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch(toggleTodo(todo.id))}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => dispatch(deleteTodo(todo.id))}>🗑️</button>
        </div>
      ))}

      <div>
        {['all', 'active', 'completed'].map(f => (
          <button key={f} onClick={() => dispatch(setFilter(f))}>
            {f === 'all' ? 'Tất cả' : f === 'active' ? 'Đang làm' : 'Hoàn thành'}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2.5 RTK Query (Data fetching)

```jsx
// ═══ services/api.js ═══
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Post', 'User'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    addPost: builder.mutation({
      query: (newPost) => ({
        url: '/posts',
        method: 'POST',
        body: newPost,
      }),
      invalidatesTags: ['Post'], // Tự refetch posts
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddPostMutation,
  useDeletePostMutation,
} = apiSlice;

// Sử dụng
function PostList() {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const [addPost, { isLoading: isAdding }] = useAddPostMutation();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={() => addPost({ title: 'New', body: 'Content' })}>
        {isAdding ? 'Adding...' : '➕ Add'}
      </button>
      {posts?.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

---

## 3. Zustand (Lightweight Alternative)

```bash
npm install zustand
```

```jsx
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ═══ Tạo Store (đơn giản hơn Redux rất nhiều!) ═══
const useTodoStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        todos: [],
        filter: 'all',

        // Actions
        addTodo: (text) => set((state) => ({
          todos: [...state.todos, { id: Date.now(), text, completed: false }]
        })),

        toggleTodo: (id) => set((state) => ({
          todos: state.todos.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        })),

        deleteTodo: (id) => set((state) => ({
          todos: state.todos.filter(t => t.id !== id)
        })),

        setFilter: (filter) => set({ filter }),

        // Computed (derived state)
        getFilteredTodos: () => {
          const { todos, filter } = get();
          switch (filter) {
            case 'active': return todos.filter(t => !t.completed);
            case 'completed': return todos.filter(t => t.completed);
            default: return todos;
          }
        },

        getRemainingCount: () =>
          get().todos.filter(t => !t.completed).length,

        // Async actions
        fetchTodos: async () => {
          const res = await fetch('/api/todos');
          const data = await res.json();
          set({ todos: data });
        },
      }),
      { name: 'todo-storage' } // localStorage key
    )
  )
);

// ═══ Sử dụng (không cần Provider!) ═══
function TodoApp() {
  const todos = useTodoStore(s => s.getFilteredTodos());
  const remaining = useTodoStore(s => s.getRemainingCount());
  const { addTodo, toggleTodo, deleteTodo, setFilter } = useTodoStore();

  return (
    <div>
      <h1>Todo ({remaining} còn lại)</h1>
      {/* Giống như trên nhưng gọi trực tiếp, không cần dispatch */}
    </div>
  );
}
```

---

## 4. So Sánh Các Giải Pháp

| Feature | Context + useReducer | Redux Toolkit | Zustand | Jotai |
|---------|---------------------|---------------|---------|-------|
| Boilerplate | Ít | Trung bình | Rất ít | Rất ít |
| Learning curve | Thấp | Cao | Thấp | Thấp |
| DevTools | ❌ | ✅ Tuyệt vời | ✅ | ✅ |
| Middleware | ❌ | ✅ | ✅ | ❌ |
| Performance | ⚠️ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| Bundle size | 0kb | ~11kb | ~1kb | ~2kb |
| Async | Manual | createAsyncThunk | Built-in | Atoms |
| Persist | Manual | Manual | ✅ Middleware | Plugin |
| Use case | Nhỏ-Vừa | Lớn, Enterprise | Vừa-Lớn | Vừa |

### Khuyến nghị:

```
App nhỏ (< 20 components)  → useState + Context
App vừa (20-100 components) → Zustand hoặc Jotai
App lớn (> 100, team > 5)  → Redux Toolkit
Server state               → TanStack Query
```

---

## 📝 Bài Tập

### Bài 1: Todo App với Redux Toolkit (full CRUD + filter + async)
### Bài 2: Shopping Cart với Zustand (add, remove, update qty, persist)
### Bài 3: Auth system với Redux (login, logout, auto-login from token)
### Bài 4: So sánh: implement cùng feature bằng Context, Redux, Zustand

---

> **Bài trước:** [15 - API Integration ←](./15-api-integration.md)  
> **Bài tiếp theo:** [17 - Performance Optimization →](./17-performance-optimization.md)
