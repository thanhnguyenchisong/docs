# Bài 21: Server-Side Rendering (SSR) với Next.js

## 📚 Mục tiêu bài học
- SSR vs CSR vs SSG vs ISR
- Next.js App Router cơ bản
- Server Components vs Client Components
- Data fetching patterns trong Next.js
- Metadata & SEO

---

## 1. Rendering Strategies

```
┌────────────────────────────────────────────────────────────┐
│                    RENDERING STRATEGIES                     │
├────────────┬───────────┬────────────┬──────────────────────┤
│    CSR     │    SSR    │    SSG     │        ISR           │
│  (Vite)   │ (Next.js) │ (Next.js)  │    (Next.js)         │
├────────────┼───────────┼────────────┼──────────────────────┤
│ Client     │ Server    │ Build time │ Build + Revalidate   │
│ renders    │ renders   │ generates  │ on interval          │
│ everything │ on each   │ static     │                      │
│            │ request   │ HTML       │                      │
├────────────┼───────────┼────────────┼──────────────────────┤
│ ❌ SEO    │ ✅ SEO    │ ✅ SEO    │ ✅ SEO               │
│ ❌ Slow   │ ⚠️ TTFB  │ ⚡ Fastest │ ⚡ Fast + Fresh      │
│   initial │   mỗi req │            │                      │
│ ✅ Rich   │ ✅ Fresh  │ ❌ Stale  │ ✅ Fresh enough      │
│   interac │   data    │    data    │                      │
├────────────┼───────────┼────────────┼──────────────────────┤
│ SPA, Apps  │ Dynamic   │ Blog,     │ E-commerce,          │
│ Dashboard  │ pages     │ Docs,     │ News,                │
│            │           │ Landing   │ FAQ                   │
└────────────┴───────────┴────────────┴──────────────────────┘
```

---

## 2. Next.js App Router

```bash
npx create-next-app@latest my-app
```

### Cấu trúc thư mục (App Router)

```
my-app/
├── app/
│   ├── layout.tsx          # Root layout (bọc tất cả pages)
│   ├── page.tsx            # Home page (/)
│   ├── loading.tsx         # Loading UI
│   ├── error.tsx           # Error UI
│   ├── not-found.tsx       # 404 page
│   ├── about/
│   │   └── page.tsx        # /about
│   ├── blog/
│   │   ├── page.tsx        # /blog (list)
│   │   └── [slug]/
│   │       └── page.tsx    # /blog/:slug (detail)
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout
│   │   ├── page.tsx        # /dashboard
│   │   └── settings/
│   │       └── page.tsx    # /dashboard/settings
│   └── api/
│       └── users/
│           └── route.ts    # API route: /api/users
├── components/
├── lib/
└── public/
```

---

## 3. Server Components vs Client Components

```tsx
// ═══ Server Component (MẶC ĐỊNH trong App Router) ═══
// Chạy trên SERVER, không ship JS xuống client
// Có thể: fetch data, truy cập DB, đọc file
// KHÔNG thể: useState, useEffect, onClick, browser APIs

// app/page.tsx (Server Component)
async function HomePage() {
  // Fetch trực tiếp trên server
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <main>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
      {/* Client component cho phần interactive */}
      <LikeButton />
    </main>
  );
}

export default HomePage;


// ═══ Client Component ═══
// Thêm "use client" ở đầu file
// Chạy trên CLIENT (browser)
// Có thể: useState, useEffect, onClick, browser APIs

// components/LikeButton.tsx
'use client';

import { useState } from 'react';

export default function LikeButton() {
  const [likes, setLikes] = useState(0);

  return (
    <button onClick={() => setLikes(l => l + 1)}>
      ❤️ {likes}
    </button>
  );
}
```

### Quyết định Server vs Client

```
Server Component khi:           Client Component khi:
├── Fetch data                  ├── useState, useEffect
├── Truy cập backend            ├── Event handlers (onClick)
├── Sensitive data (API keys)   ├── Browser APIs (localStorage)
├── Heavy dependencies          ├── Custom hooks với state
├── Không cần interactivity     ├── Real-time updates
└── SEO content                 └── User interactions
```

---

## 4. Data Fetching

### 4.1 Server Component (khuyến nghị)

```tsx
// app/products/page.tsx
async function ProductsPage() {
  // Fetch trên server, không cần useEffect!
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // ISR: revalidate mỗi 1 giờ
  }).then(r => r.json());

  return (
    <div>
      <h1>Sản phẩm</h1>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// Static (SSG) - cache forever
const data = await fetch(url, { cache: 'force-cache' });

// Dynamic (SSR) - fetch mỗi request
const data = await fetch(url, { cache: 'no-store' });

// ISR - revalidate interval
const data = await fetch(url, { next: { revalidate: 60 } });
```

### 4.2 Dynamic Routes

```tsx
// app/products/[id]/page.tsx
interface Props {
  params: { id: string };
}

async function ProductPage({ params }: Props) {
  const product = await fetch(`https://api.example.com/products/${params.id}`).then(r => r.json());

  if (!product) {
    notFound(); // Hiển thị 404
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

// Generate static paths (SSG cho dynamic routes)
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products').then(r => r.json());
  return products.map((p: any) => ({ id: String(p.id) }));
}
```

---

## 5. Layouts & Metadata

```tsx
// app/layout.tsx - Root Layout
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',
  },
  description: 'Ứng dụng React hiện đại',
  openGraph: {
    title: 'My App',
    description: 'Ứng dụng React hiện đại',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header><Navbar /></header>
        <main>{children}</main>
        <footer><Footer /></footer>
      </body>
    </html>
  );
}

// app/blog/[slug]/page.tsx - Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetch(`/api/posts/${params.slug}`).then(r => r.json());
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

---

## 6. Server Actions

```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // Trực tiếp gọi DB, không cần API route
  await db.post.create({ data: { title, content } });
  revalidatePath('/posts'); // Refresh cached data
}

// Component sử dụng Server Action
// components/CreatePostForm.tsx
'use client';

import { createPost } from '@/app/actions';

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Đăng bài</button>
    </form>
  );
}
```

---

## 📝 Bài Tập

### Bài 1: Blog với Next.js (SSG + ISR)
### Bài 2: E-commerce product pages (dynamic routes + SEO)
### Bài 3: Dashboard với layouts + loading states
### Bài 4: Form với Server Actions + validation

---

> **Bài trước:** [20 - TypeScript + React ←](./20-typescript-react.md)  
> **Bài tiếp theo:** [22 - React Server Components →](./22-react-server-components.md)
