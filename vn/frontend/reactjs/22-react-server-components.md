# Bài 22: React Server Components (RSC) Deep Dive

## 📚 Mục tiêu bài học
- Hiểu sâu React Server Components
- Server Actions và Mutations
- Streaming & Suspense
- Patterns thực tế

---

## 1. RSC Architecture

```
Browser Request
      │
      ▼
┌─────────────────────────────────────────┐
│ SERVER                                   │
│                                          │
│  Server Component Tree                   │
│  ┌──────────────────────┐               │
│  │ <Layout>              │ ← Server     │
│  │  ┌──────────────────┐│               │
│  │  │ <Navbar>          ││ ← Server     │
│  │  │ (fetch user data) ││   (DB query) │
│  │  └──────────────────┘│               │
│  │  ┌──────────────────┐│               │
│  │  │ <Main>            ││ ← Server     │
│  │  │  <PostList>       ││ ← Server     │
│  │  │   <PostCard />    ││ ← Server     │
│  │  │   <LikeButton />  ││ ← CLIENT ⚡ │
│  │  └──────────────────┘│               │
│  └──────────────────────┘               │
│                                          │
│  Output: RSC Payload (serialized)        │
│  - HTML for server components            │
│  - Placeholders for client components    │
│  - JS bundles for client components only │
└─────────────────────────────────────────┘
      │
      ▼
┌────────────────┐
│    BROWSER     │
│                │
│ Hydrate only   │
│ client parts   │
│ (LikeButton)   │
│                │
│ Server parts   │
│ = static HTML  │
│ (zero JS!)     │
└────────────────┘
```

### Lợi ích RSC:
- **Zero bundle size** cho server components
- **Truy cập trực tiếp** database, file system
- **Streaming** - hiển thị nhanh hơn
- **Bảo mật** - API keys, DB queries ở server

---

## 2. Streaming với Suspense

```tsx
import { Suspense } from 'react';

// Server Component
async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Mỗi section stream độc lập */}
      <Suspense fallback={<SkeletonStats />}>
        <StatsSection />  {/* Fetch nhanh → hiển thị trước */}
      </Suspense>

      <Suspense fallback={<SkeletonChart />}>
        <ChartSection />  {/* Fetch chậm → stream sau */}
      </Suspense>

      <Suspense fallback={<SkeletonTable />}>
        <RecentOrders />  {/* Fetch rất chậm → stream cuối */}
      </Suspense>
    </div>
  );
}

// Mỗi component fetch data độc lập
async function StatsSection() {
  const stats = await fetchStats(); // 200ms
  return <div>{/* render stats */}</div>;
}

async function ChartSection() {
  const data = await fetchChartData(); // 1000ms
  return <div>{/* render chart */}</div>;
}

async function RecentOrders() {
  const orders = await fetchOrders(); // 2000ms
  return <div>{/* render orders */}</div>;
}

// Kết quả: Stats hiển thị ngay, Chart sau 1s, Orders sau 2s
// KHÔNG phải chờ tất cả 2s mới hiển thị gì!
```

---

## 3. Server Actions Nâng Cao

```tsx
// ═══ app/actions.ts ═══
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schema validation
const PostSchema = z.object({
  title: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự'),
  content: z.string().min(10, 'Nội dung ít nhất 10 ký tự'),
  category: z.enum(['tech', 'life', 'travel']),
});

// Server Action với validation
export async function createPost(prevState: any, formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category'),
  };

  // Validate
  const validated = PostSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Dữ liệu không hợp lệ',
    };
  }

  try {
    await db.post.create({ data: validated.data });
    revalidatePath('/posts');
  } catch (error) {
    return { message: 'Lỗi tạo bài viết' };
  }

  redirect('/posts');
}

// ═══ Client Component sử dụng ═══
'use client';

import { useActionState } from 'react';
import { createPost } from '@/app/actions';

export default function CreatePostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" placeholder="Tiêu đề" />
      {state?.errors?.title && <span className="error">{state.errors.title}</span>}

      <textarea name="content" placeholder="Nội dung" />
      {state?.errors?.content && <span className="error">{state.errors.content}</span>}

      <select name="category">
        <option value="tech">Công nghệ</option>
        <option value="life">Cuộc sống</option>
        <option value="travel">Du lịch</option>
      </select>

      <button type="submit" disabled={isPending}>
        {isPending ? '⏳ Đang tạo...' : '📝 Đăng bài'}
      </button>

      {state?.message && <p className="error">{state.message}</p>}
    </form>
  );
}
```

---

## 4. Composition Patterns

```tsx
// ═══ Pattern: Server Component bọc Client Component ═══
// Server component fetch data → truyền xuống client component

// Server Component
async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch trên server (nhanh, bảo mật)
  const product = await db.product.findUnique({ where: { id: params.id } });
  const reviews = await db.review.findMany({ where: { productId: params.id } });

  return (
    <div>
      {/* Static content - Server rendered, zero JS */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />

      {/* Interactive content - Client component */}
      <AddToCartButton productId={product.id} price={product.price} />
      <ReviewSection initialReviews={reviews} productId={product.id} />
    </div>
  );
}

// ═══ Pattern: Interleaving Server & Client ═══
// Server → Client → Server (truyền qua children)

// Server Component
async function CommentSection({ postId }: { postId: string }) {
  const comments = await fetchComments(postId);

  return (
    <div>
      <h3>Bình luận ({comments.length})</h3>
      {/* Client component cho form */}
      <CommentForm postId={postId}>
        {/* Server component chỉ render list */}
        <CommentList comments={comments} />
      </CommentForm>
    </div>
  );
}
```

---

## 5. React 19 Hooks Mới

```tsx
// ═══ useActionState (React 19) ═══
'use client';
import { useActionState } from 'react';

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  // state: kết quả từ server action
  // formAction: function gắn vào form action
  // isPending: loading state
}

// ═══ useOptimistic (React 19) ═══
'use client';
import { useOptimistic } from 'react';

function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );

  const handleAdd = async (formData: FormData) => {
    const newTodo = { id: Date.now(), text: formData.get('text') as string };
    addOptimisticTodo(newTodo); // Hiển thị NGAY (optimistic)
    await createTodo(formData); // Gọi server action
  };

  return (
    <div>
      {optimisticTodos.map(todo => (
        <div key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
          {todo.text}
        </div>
      ))}
      <form action={handleAdd}>
        <input name="text" />
        <button type="submit">Thêm</button>
      </form>
    </div>
  );
}

// ═══ use() hook (React 19) ═══
import { use } from 'react';

// Có thể dùng trong conditional!
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise); // Unwrap promise
  return (
    <ul>
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

---

## 📝 Bài Tập

### Bài 1: Blog platform với RSC + Streaming
### Bài 2: Real-time dashboard với Server/Client component mix
### Bài 3: CRUD app với Server Actions + optimistic updates
### Bài 4: E-commerce product page (RSC data + Client interactivity)

---

> **Bài trước:** [21 - SSR ←](./21-server-side-rendering.md)  
> **Bài tiếp theo:** [23 - Architecture & Design →](./23-architecture-design.md)
