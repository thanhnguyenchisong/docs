# Micro-frontends & Monorepo (Nx)

Kiến trúc ứng dụng Angular lớn: **Monorepo** (quản lý nhiều app/library trong một repository với Nx) và **Micro-frontends** (chia app thành các phần deploy độc lập bằng Module Federation).

## Mục lục
1. [Monorepo và Micro-frontends là gì? (Cho người mới)](#monorepo-và-micro-frontends-là-gì-cho-người-mới)
2. [Nx Monorepo](#nx-monorepo)
3. [Cấu trúc Nx workspace](#cấu-trúc-nx-workspace)
4. [Shared libraries](#shared-libraries)
5. [Micro-frontends với Module Federation](#micro-frontends-với-module-federation)
6. [Best practices](#best-practices)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Monorepo và Micro-frontends là gì? (Cho người mới)

- **Monorepo** = **một repository** chứa **nhiều ứng dụng** (app web, app admin, app mobile) và **libraries** (shared UI, utils, models). Thay vì mỗi app một repo riêng → gom lại một chỗ, dễ chia sẻ code, đồng bộ version, và chạy build/test thông minh (chỉ build phần thay đổi).
- **Nx** = công cụ phổ biến nhất cho monorepo Angular (và React, Node, …). Cung cấp: generators (tạo app/lib), **affected** (chỉ build/test code bị ảnh hưởng bởi thay đổi), **dependency graph** (biểu đồ phụ thuộc), caching (build nhanh hơn), enforce module boundaries.
- **Micro-frontends (MFE)** = chia ứng dụng lớn thành **nhiều app nhỏ** (remote), deploy **độc lập**, kết hợp lại tại runtime. Ví dụ: team A làm trang Products, team B làm trang Admin — mỗi team deploy riêng, app shell load chúng khi cần. Dùng **Webpack Module Federation** (hoặc Native Federation) để chia sẻ dependencies (Angular, RxJS) và load remote module.
- **Khi nào dùng**: Monorepo hữu ích khi có **nhiều app hoặc library** cần chia sẻ code. Micro-frontends phù hợp **team lớn** (>= 3 teams), các phần deploy **độc lập**, hoặc migrate dần từ app cũ.

---

## Nx Monorepo

### Tạo workspace

```bash
npx create-nx-workspace@latest my-org --preset=angular-monorepo
```

Hoặc thêm Nx vào Angular workspace hiện có:

```bash
npx nx@latest init
```

### Lệnh Nx thường dùng

| Lệnh | Mô tả |
|-------|--------|
| `npx nx serve my-app` | Chạy dev server cho app |
| `npx nx build my-app` | Build app |
| `npx nx test my-lib` | Chạy test cho library |
| `npx nx affected -t build` | Chỉ build app/lib **bị ảnh hưởng** bởi thay đổi |
| `npx nx affected -t test` | Chỉ test phần thay đổi |
| `npx nx graph` | Mở dependency graph (trực quan) |
| `npx nx generate @nx/angular:library shared-ui` | Tạo library mới |
| `npx nx generate @nx/angular:component button --project=shared-ui` | Tạo component trong library |

### Tạo app và library

```bash
# Tạo app Angular
npx nx generate @nx/angular:application admin-app

# Tạo library (shared)
npx nx generate @nx/angular:library shared/ui
npx nx generate @nx/angular:library shared/data-access
npx nx generate @nx/angular:library shared/utils
npx nx generate @nx/angular:library feature/products
```

---

## Cấu trúc Nx workspace

```
my-org/
├── apps/
│   ├── web-app/                 # App chính
│   │   └── src/app/
│   └── admin-app/               # App admin
│       └── src/app/
├── libs/
│   ├── shared/
│   │   ├── ui/                  # Shared UI components (button, card, modal)
│   │   ├── data-access/         # Shared services, models, API clients
│   │   └── utils/               # Pure functions, helpers
│   ├── feature/
│   │   ├── products/            # Feature library: products
│   │   └── orders/              # Feature library: orders
│   └── auth/                    # Auth library (service, guards, interceptor)
├── nx.json                      # Nx config
├── tsconfig.base.json           # TypeScript paths
└── package.json
```

| Thư mục | Mục đích |
|---------|----------|
| `apps/` | Ứng dụng (build & deploy) — chỉ chứa shell, routing, bootstrap |
| `libs/shared/ui/` | Component dùng chung (button, dialog, table wrapper) |
| `libs/shared/data-access/` | Service, model, API client dùng chung |
| `libs/shared/utils/` | Hàm helper thuần, không Angular |
| `libs/feature/xxx/` | Feature module (components, services, state cho một domain) |
| `libs/auth/` | Authentication (service, guard, interceptor) |

### Import library

Trong `tsconfig.base.json`, Nx tự tạo path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@my-org/shared/ui": ["libs/shared/ui/src/index.ts"],
      "@my-org/shared/data-access": ["libs/shared/data-access/src/index.ts"],
      "@my-org/feature/products": ["libs/feature/products/src/index.ts"]
    }
  }
}
```

Trong app import:

```typescript
import { ButtonComponent } from '@my-org/shared/ui';
import { ProductService } from '@my-org/shared/data-access';
```

---

## Shared libraries

### Module Boundary — enforce rules

Nx cho phép định nghĩa **tag** cho mỗi library và **rule** ai được import ai:

```json
// project.json (hoặc nx.json)
{
  "tags": ["scope:shared", "type:ui"]
}
```

```json
// .eslintrc.json (enforce boundaries)
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:ui", "type:data-access", "type:utils"] },
        { "sourceTag": "type:ui", "onlyDependOnLibsWithTags": ["type:utils"] },
        { "sourceTag": "type:data-access", "onlyDependOnLibsWithTags": ["type:utils"] }
      ]
    }]
  }
}
```

→ Feature có thể import UI, data-access, utils. UI chỉ import utils. Tránh circular dependency.

### Affected — build/test thông minh

```bash
# Chỉ build những app/lib bị ảnh hưởng bởi commit mới
npx nx affected -t build

# Chỉ test
npx nx affected -t test

# Xem app/lib nào bị ảnh hưởng
npx nx affected --graph
```

Nx phân tích **dependency graph** → nếu `shared/ui` thay đổi → build lại `web-app` và `admin-app` (đều import `shared/ui`), nhưng **không** build `feature/orders` nếu nó không dùng `shared/ui`.

---

## Micro-frontends với Module Federation

### Khái niệm

| Thuật ngữ | Ý nghĩa |
|-----------|---------|
| **Host (Shell)** | App chính, load các remote module |
| **Remote** | App con, expose module/component cho host |
| **Shared dependencies** | Angular, RxJS, … — dùng chung, chỉ tải 1 lần |
| **Module Federation** | Webpack plugin cho phép load JS bundle từ remote URL |

### Tạo với Nx

```bash
# Tạo host
npx nx generate @nx/angular:host shell --remotes=products,admin

# Tạo remote
npx nx generate @nx/angular:remote products --host=shell
npx nx generate @nx/angular:remote admin --host=shell
```

### Cấu hình Host (shell)

```typescript
// shell/module-federation.config.ts
import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: ['products', 'admin'],
  shared: (libraryName, sharedConfig) => {
    // Chia sẻ Angular core
    if (libraryName === '@angular/core' || libraryName === '@angular/common') {
      return { ...sharedConfig, singleton: true, strictVersion: true };
    }
    return sharedConfig;
  },
};
export default config;
```

### Cấu hình Remote (products)

```typescript
// products/module-federation.config.ts
const config: ModuleFederationConfig = {
  name: 'products',
  exposes: {
    './Routes': 'apps/products/src/app/remote-entry/entry.routes.ts',
  },
};
export default config;
```

### Route trong Shell

```typescript
// shell/src/app/app.routes.ts
export const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.routes').then(m => m.routes) },
  {
    path: 'products',
    loadChildren: () => import('products/Routes').then(m => m.remoteRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('admin/Routes').then(m => m.remoteRoutes),
  },
];
```

### Chạy

```bash
# Chạy tất cả (shell + remotes)
npx nx serve shell --devRemotes=products,admin

# Deploy riêng
npx nx build products   # Deploy products remote
npx nx build shell      # Deploy shell
```

---

## Best practices

| Nội dung | Gợi ý |
|----------|-------|
| **Library granularity** | Tách library theo **type** (ui, data-access, utils, feature) và **scope** (shared, domain). Tránh library quá lớn. |
| **Barrel exports** | Mỗi library có `index.ts` export public API. Component/service internal không export → tránh coupling. |
| **Affected CI** | Trong CI pipeline, dùng `nx affected` thay `nx run-many --all` → build/test nhanh hơn rất nhiều. |
| **MFE shared deps** | Singleton shared cho `@angular/core`, `@angular/router`, `rxjs`. Không shared library thay đổi thường xuyên. |
| **Version alignment** | Trong MFE, tất cả remotes và host nên dùng **cùng major version** Angular. Khác version = runtime error. |
| **Independent deploy** | Mỗi remote deploy riêng; host chỉ biết URL remote. CI/CD cho mỗi remote riêng khi team khác nhau. |

---

## Câu hỏi thường gặp

**Monorepo có bắt buộc dùng Nx không?**  
Không. Angular workspace (`ng new --create-application=false`) + libraries cũng được. Nhưng Nx bổ sung nhiều tính năng (affected, cache, generators, graph, enforce boundaries) giúp quản lý monorepo hiệu quả hơn nhiều.

**Micro-frontends có phù hợp mọi project không?**  
Không. MFE thêm **complexity** (shared deps, versioning, deployment). Dùng khi: team lớn (>= 3), cần deploy độc lập, hoặc migrate dần. Project nhỏ → monorepo + lazy load route là đủ.

**Module Federation có support Angular standalone?**  
Có. Nx generators hỗ trợ standalone. Remote expose `Routes` (mảng route), host load bằng `loadChildren`.

**Nx affected hoạt động thế nào?**  
Nx xây dựng **dependency graph** (app → lib → lib). Khi có commit mới, Nx so sánh với base (main branch) → xác định file nào thay đổi → tìm tất cả project phụ thuộc → chỉ build/test những project đó.

---

## Senior / Master

- **Native Federation**: Thay vì Webpack Module Federation, dùng **@angular-architects/native-federation** — không phụ thuộc webpack, hỗ trợ esbuild (Angular 17+), tương thích ESM import maps. Phù hợp khi Angular chuyển sang esbuild.
- **Dynamic remotes**: Thay vì hardcode remote URL, load config từ API:
  ```typescript
  loadRemoteModule({ type: 'module', remoteEntry: config.productsUrl, exposedModule: './Routes' })
  ```
  Cho phép deploy remote ở bất kỳ URL nào mà không cần rebuild shell.
- **Nx Cloud**: Distributed caching và CI. Build trên máy developer A → cache lên cloud → developer B (hoặc CI) reuse kết quả → giảm build time vài phút thành vài giây.
- **Custom generators**: Tạo Nx generator riêng cho team: `nx generate @my-org/generators:feature products` → tự tạo component, service, state, route, test chuẩn cấu trúc team.

---

→ Xem thêm: [15 - Master Angular (Kiến trúc)](15-master-angular.md#kiến-trúc-ứng-dụng-lớn) | [13 - Build & Deploy](13-build-deploy.md)
