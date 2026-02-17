# Angular Demo — Từ Zero đến Master

App Angular minh họa **toàn bộ lý thuyết** từ bài 01 đến 16.  
Mỗi file có comment `📖` map đến bài lý thuyết tương ứng.

## Cài đặt & Chạy

```bash
cd angular-demo
npm install
ng serve
# Mở http://localhost:4200
```

## Cấu trúc project

```
angular-demo/
├── src/
│   ├── main.ts                          # Bootstrap app (Bài 02)
│   ├── index.html                       # HTML gốc
│   ├── styles.scss                      # Global styles, CSS variables, dark mode (Bài 11)
│   ├── environments/
│   │   ├── environment.ts               # Config DEV (Bài 13)
│   │   └── environment.prod.ts          # Config PROD (Bài 13)
│   └── app/
│       ├── app.component.ts             # Root component, route animation (Bài 02, 11)
│       ├── app.config.ts                # Providers: router, HTTP, NgRx, ErrorHandler (Bài 02, 05, 06, 08, 14)
│       ├── app.routes.ts                # Routing: lazy load, guards, resolvers (Bài 06)
│       │
│       ├── core/                        # Singleton services, guards, interceptors
│       │   ├── models/index.ts          # TypeScript: interface, type, generics, utility types (Bài 01)
│       │   ├── tokens/                  # InjectionToken (Bài 05)
│       │   ├── services/
│       │   │   ├── auth.service.ts      # Auth state với signals (Bài 05, 10, 15)
│       │   │   ├── product.service.ts   # HTTP CRUD, retry, cache, search (Bài 08, 09)
│       │   │   ├── cart.service.ts      # Signal-based state management (Bài 10, 15)
│       │   │   └── notification.service.ts  # Subject event bus (Bài 09)
│       │   ├── interceptors/
│       │   │   ├── auth.interceptor.ts  # Thêm token vào request (Bài 08)
│       │   │   └── error.interceptor.ts # Xử lý lỗi HTTP toàn cục (Bài 08)
│       │   ├── guards/auth.guard.ts     # CanActivate, CanMatch, CanDeactivate (Bài 06)
│       │   ├── resolvers/product.resolver.ts  # Load data trước route (Bài 06)
│       │   └── error-handler/           # Global ErrorHandler (Bài 08)
│       │
│       ├── shared/                      # Components, directives, pipes dùng chung
│       │   ├── directives/
│       │   │   └── highlight.directive.ts    # Custom attribute directive (Bài 04)
│       │   ├── pipes/
│       │   │   └── truncate.pipe.ts          # Custom pipes: truncate, vnd, timeAgo (Bài 04)
│       │   ├── animations/
│       │   │   └── route.animations.ts       # fade, slide, expand, stagger, route (Bài 11)
│       │   └── components/
│       │       ├── header/header.component.ts     # Nav header, Material (Bài 03, 06, 11)
│       │       └── star-rating/star-rating.component.ts  # ControlValueAccessor (Bài 07)
│       │
│       └── features/
│           ├── home/home.component.ts        # Data binding, signals, @if/@for/@switch,
│           │                                   ViewChild, directives, pipes (Bài 02-04, 15)
│           ├── products/
│           │   ├── product-list/             # NgRx + OnPush + selectSignal (Bài 03, 14, 15)
│           │   ├── product-detail/           # Resolver + ActivatedRoute (Bài 06)
│           │   ├── product-form/             # Reactive Forms, FormArray, CVA (Bài 07)
│           │   ├── product-grid/             # AG-Grid: sort, filter, pagination (Bài 16)
│           │   └── store/                    # NgRx: actions, reducer, effects, selectors (Bài 14)
│           │       ├── product.actions.ts
│           │       ├── product.state.ts
│           │       ├── product.reducer.ts
│           │       ├── product.effects.ts
│           │       ├── product.selectors.ts
│           │       └── product.reducer.spec.ts  # Reducer test (Bài 12, 14)
│           ├── auth/
│           │   ├── login/login.component.ts       # Reactive Form + custom validator (Bài 07)
│           │   └── register/register.component.ts # Template-driven Form (Bài 07)
│           └── dashboard/dashboard.component.ts   # forkJoin, toSignal, service state (Bài 09, 10, 15)
```

## Mapping bài lý thuyết → code

| Bài | Chủ đề | Files minh họa |
|-----|--------|----------------|
| **01** | TypeScript cơ bản | `core/models/index.ts` — interface, type, generics, utility types, enum |
| **02** | Angular căn bản | `main.ts`, `app.component.ts`, `home.component.ts` — bootstrap, lifecycle, standalone |
| **03** | Components & Templates | `home.component.ts` — data binding, @if/@for/@switch, signals, ViewChild, Input/Output |
| **04** | Directives & Pipes | `highlight.directive.ts`, `truncate.pipe.ts`, `home.component.ts` — custom directive, pipes, control flow |
| **05** | Services & DI | `auth.service.ts`, `cart.service.ts`, `app-config.token.ts`, `app.config.ts` — inject(), providedIn, InjectionToken |
| **06** | Routing & Navigation | `app.routes.ts`, `auth.guard.ts`, `product.resolver.ts` — lazy load, guards, resolvers, params |
| **07** | Forms | `login.component.ts` (reactive), `register.component.ts` (template-driven), `product-form.component.ts` (FormArray), `star-rating.component.ts` (CVA) |
| **08** | HTTP Client | `product.service.ts`, `auth.interceptor.ts`, `error.interceptor.ts`, `global-error-handler.ts` — CRUD, interceptors, error handling |
| **09** | RxJS trong Angular | `product.service.ts` (search, shareReplay), `dashboard.component.ts` (forkJoin, toSignal), `notification.service.ts` (Subject) |
| **10** | State & Kiến trúc | `cart.service.ts` (signal state), `auth.service.ts` (signal state), `dashboard.component.ts` (service state) |
| **11** | UI & Styling | `styles.scss`, `route.animations.ts`, `header.component.ts`, `home.component.ts` — Material, animations, theming, CSS variables |
| **12** | Testing | `product.service.spec.ts`, `product.reducer.spec.ts`, `product-list.component.spec.ts` — service test, reducer test, component test |
| **13** | Build & Deploy | `angular.json`, `environment.ts`, `environment.prod.ts` — environments, fileReplacements, i18n config |
| **14** | NgRx | `store/product.actions.ts`, `product.state.ts`, `product.reducer.ts`, `product.effects.ts`, `product.selectors.ts`, `product-list.component.ts` |
| **15** | Master Angular | `home.component.ts` (OnPush, signals), `cart.service.ts` (signal, computed, effect), `dashboard.component.ts` (toSignal), `product-list.component.ts` (selectSignal) |
| **16** | AG-Grid | `product-grid.component.ts` — ColDef, sort, filter, pagination, valueFormatter, cellRenderer, export |

## Các trang trong app

| Route | Component | Demo |
|-------|-----------|------|
| `/home` | HomeComponent | Data binding, signals, control flow, directives, pipes, animations |
| `/products` | ProductListComponent | NgRx store, OnPush, selectSignal |
| `/products/:id` | ProductDetailComponent | Resolver, ActivatedRoute, route params |
| `/products/new` | ProductFormComponent | Reactive Forms, FormArray, CVA, guard |
| `/products/grid` | ProductGridComponent | AG-Grid: sort, filter, pagination, export |
| `/auth/login` | LoginComponent | Reactive Form, custom validator |
| `/auth/register` | RegisterComponent | Template-driven Form |
| `/dashboard` | DashboardComponent | forkJoin, toSignal, service state, cart |

## Gợi ý học

1. **Đọc bài lý thuyết** (01-16) → **tìm `📖 Bài XX` trong code** → hiểu cách áp dụng
2. Bắt đầu từ `home.component.ts` — cover basics (binding, signals, control flow)
3. Xem `product-form.component.ts` — Reactive Forms đầy đủ
4. Xem `store/` — NgRx flow hoàn chỉnh
5. Xem `dashboard.component.ts` — RxJS patterns thực tế
6. Xem `*.spec.ts` — cách viết test

## Công nghệ

- Angular 18+ (standalone, signals, control flow)
- Angular Material (UI components)
- NgRx (state management)
- AG-Grid (data grid)
- RxJS 7 (reactive programming)
- SCSS (styling)
- Jasmine/Karma (testing)
