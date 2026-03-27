# Bài 02: Setup ReactTS & Conventions

## 📚 Mục tiêu bài học

- Tạo project React + TypeScript với **Vite** và **Next.js**
- Cấu hình `tsconfig.json` phù hợp cho React
- Quy ước đặt tên, tổ chức folder, quản lý types

---

## 1. Tạo Project với Vite

```bash
# Tạo project mới
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

### Cấu trúc project Vite + ReactTS

```
my-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts          # re-export
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Login.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/                    # Shared types
│   │   ├── user.ts
│   │   └── product.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 2. Tạo Project với Next.js

```bash
npx create-next-app@latest my-app --typescript --app --eslint
cd my-app
npm run dev
```

### Cấu trúc project Next.js + TypeScript

```
my-app/
├── src/
│   ├── app/                      # App Router (Next 13+)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/                      # Utilities, API clients
│   ├── types/
│   └── styles/
├── tsconfig.json
└── next.config.ts
```

---

## 3. Cấu hình tsconfig.json tối ưu cho React

```json
{
  "compilerOptions": {
    // === Target & Module ===
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    // === JSX — bắt buộc cho React ===
    "jsx": "react-jsx",           // React 17+ (không cần import React)

    // === Strict — BẬT HẾT ===
    "strict": true,               // Bật tất cả strict checks
    "noUncheckedIndexedAccess": true, // arr[0] có thể undefined
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // === Path aliases ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"]
    },

    // === Interop ===
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### Giải thích các flag quan trọng

| Flag | Tác dụng |
|------|----------|
| `strict: true` | Bật toàn bộ type checking nghiêm ngặt |
| `jsx: "react-jsx"` | Dùng JSX transform mới (React 17+), không cần `import React` |
| `noUncheckedIndexedAccess` | `array[0]` trả `T | undefined` thay vì `T` — an toàn hơn |
| `paths` | Import alias: `import { Button } from '@components/Button'` |
| `isolatedModules` | Bắt buộc cho Vite/bundler — mỗi file là một module |

---

## 4. Quy Ước Đặt Tên & Tổ Chức File

### File naming

```
# Components — PascalCase
Button.tsx
UserProfile.tsx
ProductCard.tsx

# Hooks — camelCase, bắt đầu bằng "use"
useAuth.ts
useProducts.ts
useDebounce.ts

# Types — camelCase hoặc PascalCase
user.ts          # chứa type User, UserRole, ...
product.ts       # chứa type Product, ProductCategory, ...

# Utils/Services — camelCase
api.ts
formatters.ts
validators.ts
```

### Type/Interface naming

```typescript
// ✅ Dùng PascalCase cho type/interface
type User = { id: number; name: string };
interface Product { id: number; name: string; price: number }

// ✅ Props type = ComponentName + "Props"
type ButtonProps = { label: string; onClick: () => void };
type UserCardProps = { user: User; onSelect?: (user: User) => void };

// ✅ API response type = EntityName + "Response" / "Dto"
type UserResponse = { data: User; meta: PaginationMeta };
type ProductListResponse = { products: Product[]; total: number };

// ❌ KHÔNG prefix "I" cho interface (quy ước React/TS hiện đại)
// interface IUser { ... }  // Không nên
// type TUser = { ... };    // Không nên
```

### Barrel exports (index.ts)

```typescript
// src/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Import gọn:
import { Button } from '@components/Button';
```

---

## 5. Quản Lý Types

### Chiến lược tổ chức types

```
src/types/
├── user.ts           # Domain types: User, UserRole, UserStatus
├── product.ts        # Domain types: Product, Category, CartItem
├── api.ts            # API types: ApiResponse<T>, PaginationMeta, ApiError
├── common.ts         # Utility: Nullable<T>, Optional fields
└── index.ts          # Re-export tất cả
```

### Ví dụ file types

```typescript
// src/types/api.ts
export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiError = {
  message: string;
  code: string;
  details?: Record<string, string[]>;
};
```

```typescript
// src/types/user.ts
export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'banned';

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
};

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;
```

---

## 6. ESLint & Prettier cho ReactTS

### ESLint config

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks
```

```javascript
// eslint.config.js (flat config)
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### consistent-type-imports — Tại sao quan trọng?

```typescript
// ✅ Type import — bị loại bỏ khi compile (không tăng bundle)
import type { User } from '@/types/user';
import type { ButtonProps } from './Button';

// ✅ Mixed import
import { useState } from 'react';
import type { FC } from 'react';

// ❌ Import type như value — có thể tăng bundle nếu tree-shaking không hoàn hảo
import { User } from '@/types/user'; // Nếu User chỉ là type
```

---

## 7. Checklist Setup Project ReactTS

- [ ] Tạo project: `npm create vite@latest -- --template react-ts` hoặc `create-next-app --typescript`
- [ ] Bật `strict: true` trong tsconfig.json
- [ ] Cấu hình path aliases (`@/*`)
- [ ] Tạo folder `types/` cho shared domain types
- [ ] Cài ESLint + TypeScript plugin
- [ ] Bật `consistent-type-imports`
- [ ] Tạo barrel exports (index.ts) cho components
- [ ] Cấu hình Prettier (nếu team dùng)

---

## 🔑 Tóm tắt

| Quyết định | Khuyến nghị |
|------------|-------------|
| **Bundler** | Vite (SPA) hoặc Next.js (SSR/SEO) |
| **strict** | Luôn bật `strict: true` |
| **Path alias** | `@/*` → `./src/*` |
| **Types folder** | `src/types/` cho domain types shared |
| **Naming** | PascalCase cho component/type, camelCase cho hook/util |
| **Import types** | `import type { X }` — giảm bundle |

---

> **Bài trước:** [01 - ReactTS khác gì ReactJS? ←](./01-reactts-khac-gi-reactjs.md)  
> **Bài tiếp theo:** [03 - Typing Props & Events →](./03-typing-props-events.md)
