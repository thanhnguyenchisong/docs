# Bài 23: Architecture & Design - Kiến Trúc Ứng Dụng

## 📚 Mục tiêu bài học
- Kiến trúc ứng dụng React scale lớn
- Design System & Component Library
- Monorepo strategy
- Micro-frontends
- Decision framework

---

## 1. Cấu Trúc Dự Án Scale Lớn

### Feature-based Architecture

```
src/
├── app/                         # App-level setup
│   ├── App.tsx
│   ├── routes.tsx
│   ├── providers.tsx            # All context providers
│   └── store.ts                 # Global store config
│
├── features/                    # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── usePermissions.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── utils/
│   │   │   └── tokenManager.ts
│   │   └── index.ts             # Public API (barrel file)
│   │
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   └── orders/
│       ├── components/
│       ├── hooks/
│       └── index.ts
│
├── shared/                      # Shared across features
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Atomic UI (Button, Input, Modal)
│   │   └── layout/              # Layout components
│   ├── hooks/                   # Shared custom hooks
│   ├── utils/                   # Utility functions
│   ├── types/                   # Shared TypeScript types
│   ├── constants/               # App constants
│   └── styles/                  # Global styles
│
├── lib/                         # Third-party integrations
│   ├── api.ts                   # API client (axios instance)
│   ├── analytics.ts             # Analytics setup
│   └── i18n.ts                  # Internationalization
│
└── assets/                      # Static assets
    ├── images/
    ├── fonts/
    └── icons/
```

### Import Rules

```
Dependency Direction:

  features/ → shared/    ✅ OK
  features/ → lib/       ✅ OK
  features/ → features/  ❌ NO (tạo circular dependency)
  shared/   → features/  ❌ NO (shared phải independent)

Feature A cần data từ Feature B?
→ Lift lên shared/ hoặc dùng event bus / global store
```

---

## 2. Design System

### Component Library Architecture

```
design-system/
├── tokens/
│   ├── colors.ts         # Color palette
│   ├── typography.ts     # Font sizes, weights
│   ├── spacing.ts        # Spacing scale
│   ├── shadows.ts        # Box shadows
│   └── breakpoints.ts    # Responsive breakpoints
│
├── components/
│   ├── primitives/       # Lowest level
│   │   ├── Box.tsx       # Layout primitive
│   │   ├── Text.tsx      # Typography primitive
│   │   └── Stack.tsx     # Flex/Grid helper
│   │
│   ├── atoms/            # Smallest UI units
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx  # Storybook
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── Avatar/
│   │
│   ├── molecules/        # Combinations of atoms
│   │   ├── SearchBar/
│   │   ├── FormField/
│   │   ├── Card/
│   │   └── MenuItem/
│   │
│   └── organisms/        # Complex UI sections
│       ├── Header/
│       ├── DataTable/
│       ├── Modal/
│       └── Sidebar/
│
└── hooks/
    ├── useTheme.ts
    └── useMediaQuery.ts
```

### Token System

```tsx
// tokens/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a5f',
  },
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    900: '#0f172a',
  },
} as const;

// tokens/spacing.ts
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;
```

---

## 3. Monorepo

```bash
# Turborepo (khuyến nghị)
npx create-turbo@latest
```

```
my-monorepo/
├── apps/
│   ├── web/             # Main web app (Next.js)
│   ├── admin/           # Admin dashboard (Vite)
│   ├── mobile/          # React Native
│   └── docs/            # Documentation site
│
├── packages/
│   ├── ui/              # Shared component library
│   ├── utils/           # Shared utilities
│   ├── config/          # Shared configs (ESLint, TS)
│   ├── types/           # Shared TypeScript types
│   └── api-client/      # Shared API client
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 4. Micro-frontends

```
┌──────────────────────────────────────────┐
│          Container App (Shell)            │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Header  │  │ Sidebar  │  │ Footer │ │
│  │ (Team A)│  │ (Team B) │  │(Team A)│ │
│  └─────────┘  └──────────┘  └────────┘ │
│  ┌──────────────────────────────────────┐│
│  │          Main Content                 ││
│  │  ┌────────────┐  ┌────────────────┐ ││
│  │  │ Product MFE│  │  Checkout MFE  │ ││
│  │  │ (Team C)   │  │  (Team D)      │ ││
│  │  │ React      │  │  React         │ ││
│  │  │ v19        │  │  v18           │ ││
│  │  └────────────┘  └────────────────┘ ││
│  └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

### Module Federation (Webpack 5 / Vite)

```js
// Product MFE - exposes components
// vite.config.ts
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'product-app',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/components/ProductList',
        './ProductDetail': './src/components/ProductDetail',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});

// Shell App - consumes MFEs
federation({
  name: 'shell-app',
  remotes: {
    productApp: 'http://localhost:3001/assets/remoteEntry.js',
    checkoutApp: 'http://localhost:3002/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
});

// Shell App usage
const ProductList = lazy(() => import('productApp/ProductList'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}
```

---

## 5. Architecture Decision Framework

```
Câu hỏi để chọn kiến trúc phù hợp:

1. Team size?
   - 1-3 devs → Single Vite/Next.js app
   - 3-10 devs → Monorepo
   - 10+ devs → Monorepo + Micro-frontends

2. App complexity?
   - Simple → Vite SPA
   - Medium → Next.js
   - Complex → Next.js + Feature-based architecture

3. SEO cần thiết?
   - Yes → Next.js (SSR/SSG)
   - No → Vite SPA

4. Multiple apps chia sẻ code?
   - Yes → Monorepo (Turborepo)
   - No → Standalone

5. Teams independent?
   - Yes → Micro-frontends
   - No → Monolith
```

---

## 📝 Bài Tập

### Bài 1: Thiết kế architecture cho e-commerce (>50 components)
### Bài 2: Tạo Design System mini (Button, Input, Card, Modal)
### Bài 3: Setup Turborepo monorepo (web + admin + shared UI)
### Bài 4: Document Architecture Decision Records (ADRs)

---

> **Bài trước:** [22 - RSC ←](./22-react-server-components.md)  
> **Bài tiếp theo:** [24 - DevOps & Deployment →](./24-devops-deployment.md)
