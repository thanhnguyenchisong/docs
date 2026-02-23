# Routing & Navigation

Router Angular quản lý điều hướng theo URL: map URL → component, hỗ trợ lazy load, guards, resolvers.

## Mục lục
1. [Routing là gì? (Cho người mới)](#routing-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Đổi URL → đổi nội dung trên màn hình](#ví-dụ-trực-quan-đổi-url--đổi-nội-dung-trên-màn-hình)
3. [Cấu hình routes](#cấu-hình-routes)
4. [RouterOutlet và links](#routeroutlet-và-links)
5. [Lazy loading](#lazy-loading)
6. [Guards](#guards)
7. [Resolvers](#resolvers)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Routing là gì? (Cho người mới)

- **Routing** = điều hướng theo **URL**: mỗi đường dẫn (vd `/home`, `/products`, `/products/1`) tương ứng với một “trang” (component). User click link hoặc gõ URL → Angular Router đổi nội dung hiển thị (thường là vùng `<router-outlet>`) **không tải lại cả trang** — đây là **SPA** (Single Page Application). Trình duyệt dùng History API nên nút Back/Forward vẫn hoạt động.
- **Route** = một cấu hình: **path** (đường dẫn) + **component** (hoặc `loadComponent` lazy). **RouterOutlet** = vị trí trong template mà component của route hiện tại được vẽ. **routerLink** = link không reload trang, chỉ đổi route.
- Khi mở `/products`, Router load component gắn với route `products`; khi chuyển sang `/products/1`, component có thể đổi (product-detail) và nhận **param** `id = 1`. Toàn bộ do `app.routes.ts` (hoặc file tương đương) định nghĩa.

**Tóm tắt khái niệm:**

| Khái niệm | Ý nghĩa |
|-----------|---------|
| **path** | Chuỗi URL (vd `'products'`, `'products/:id'`). `:id` là **route param**. |
| **component** / **loadComponent** | Component hiển thị khi URL khớp route. |
| **RouterOutlet** | Thẻ `<router-outlet />` — component của route hiện tại render **thay thế** vùng này. |
| **routerLink** | Directive gắn lên `<a>` để điều hướng bằng Router (không reload). |
| **Guard** | Hàm kiểm tra trước khi vào/ra route (vd đã đăng nhập chưa). |
| **Resolver** | Hàm load dữ liệu trước khi route kích hoạt; component nhận qua `route.data`. |

---

## Ví dụ trực quan: Đổi URL → đổi nội dung trên màn hình

**Bước 1 — Cấu hình route:** Trong `app.routes.ts` thêm hai route (hoặc dùng component có sẵn):

```typescript
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'page-a' },
  { path: 'page-a', loadComponent: () => import('./page-a/page-a.component').then(m => m.PageAComponent) },
  { path: 'page-b', loadComponent: () => import('./page-b/page-b.component').then(m => m.PageBComponent) },
];
```

Tạo hai component đơn giản: `PageAComponent` template `<p>Trang A</p>`, `PageBComponent` template `<p>Trang B</p>` (có thể dùng `ng generate component page-a`).

**Bước 2 — Outlet và link:** Trong `app.component.html`:

```html
<nav>
  <a routerLink="/page-a">Trang A</a> | <a routerLink="/page-b">Trang B</a>
</nav>
<router-outlet></router-outlet>
```

**Bước 3 — Chạy:** `ng serve`, mở `/page-a` — thấy “Trang A”. Đổi URL thành `/page-b` (hoặc click link Trang B) — nội dung chuyển thành “Trang B”, **không reload trang**. Đó là routing trực quan: URL thay đổi → component trong outlet thay đổi.

---

## Cấu hình routes

Thường đặt trong `app.routes.ts` (standalone) hoặc file riêng. Đăng ký trong `app.config.ts` bằng `provideRouter(routes)`.

### Cấu trúc một route

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:id', loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: '**', loadComponent: () => import('./shared/not-found.component').then(m => m.NotFoundComponent) },
];
```

**Đăng ký trong `app.config.ts`:**

```typescript
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
});
```

### Các thuộc tính route thường dùng

| Thuộc tính | Ý nghĩa |
|------------|---------|
| `path` | Chuỗi URL. `''` = rỗng; `:id` = **route param** (bắt buộc); `**` = wildcard (bắt mọi URL chưa match). |
| `pathMatch` | Với `path: ''`: `'full'` = chỉ match khi URL **hoàn toàn** trùng (vd redirect `''` → `'home'`). `'prefix'` = match mọi URL (tránh dùng với `''`). |
| `component` | Component cần load (eager — có trong bundle chính). |
| `loadComponent` | Hàm trả về `Promise` component — **lazy load**: chỉ tải khi vào route. |
| `redirectTo` | Chuyển hướng sang path khác (thường kèm `pathMatch: 'full'`). |
| `children` | Mảng route con — URL = path cha + path con; cần **outlet** trong template component cha. |
| `canActivate`, `canDeactivate`, `canMatch`, `resolve` | Guards và resolvers (xem phần sau). |
| `title` | Chuỗi hoặc `ResolveFn` để set `<title>` trang (Angular 14+). |

### Thứ tự route

Router **match theo thứ tự** từ trên xuống. Route **cụ thể** nên đặt trước, **wildcard** `**` luôn đặt **cuối** (nếu không nó sẽ bắt hết).

- Đúng: `products/:id` rồi mới `products` (hoặc ngược tùy ý đồ) — quan trọng là `**` ở cuối.
- Sai: `**` đặt trước → mọi URL đều vào NotFound.

### Route params (`:id`) và query params

- **Route param**: Nằm trong path, vd `products/:id` → URL `/products/5` cho `id = '5'`. Đọc trong component bằng `ActivatedRoute`: `route.params`, `route.paramMap`.
- **Query params**: Sau `?`, vd `/search?q=angular` → `q=angular`. Đọc bằng `route.queryParams`, `route.queryParamMap`. Không nằm trong `path`, dùng khi tham số tùy chọn (filter, page).

### Redirect và pathMatch

```typescript
{ path: '', pathMatch: 'full', redirectTo: 'home' }
```

- `pathMatch: 'full'`: Chỉ match khi **toàn bộ** URL còn lại (sau prefix) là rỗng. Nếu dùng `'prefix'` với `path: ''`, mọi URL đều match route rỗng → redirect liên tục sai.
- Redirect có thể trỏ sang path có param: `redirectTo: 'products/1'` hoặc dùng hàm (advanced).

### Children — route con (nested routes)

Route có thể có **children**: danh sách route con. URL khi vào route con = **path cha + path con**. Component của route cha phải có `<router-outlet />` để Router render component của route con vào đó.

Ví dụ: `/products` hiển thị ProductListComponent; `/products/1` hiển thị ProductDetailComponent. Có hai cách: khai báo hai route ngang hàng `products` và `products/:id` (như ví dụ đầu), hoặc dùng children:

```typescript
{
  path: 'products',
  component: ProductListComponent,  // hoặc loadComponent
  children: [
    { path: ':id', loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent) },
  ],
}
```

Lúc này ProductListComponent cần có `<router-outlet />` trong template; khi vào `/products/1`, ProductDetailComponent render **bên trong** outlet đó (thường layout: list bên trái, detail bên phải). Nếu không cần layout cha chung, dùng hai route ngang hàng đơn giản hơn.

---

## RouterOutlet và links

### RouterOutlet

**RouterOutlet** = vị trí component của route hiện tại được **render**. Chỉ cần một (hoặc nhiều nếu dùng named outlets) trong template.

```html
<app-header />
<router-outlet />
<app-footer />
```

Khi URL thay đổi, Router **thay thế** nội dung bên trong outlet bằng component của route mới; header/footer giữ nguyên (trừ khi chúng cũng phụ thuộc route).

**Named outlet** (nâng cao): Có thể có nhiều outlet với tên khác nhau, route khai báo `outlet: 'tên'` để render vào outlet đó. Dùng cho layout có sidebar + main content riêng.

### routerLink — link điều hướng

Directive `routerLink` gắn lên thẻ `<a>` (hoặc element có role link) để điều hướng qua Router — **không reload trang**, chỉ đổi URL và component trong outlet.

**Cú pháp:**

```html
<a routerLink="/home">Trang chủ</a>
<a [routerLink]="['/products', product.id]">Chi tiết sản phẩm</a>
<a routerLink="/search" [queryParams]="{ q: keyword, page: 1 }">Tìm kiếm</a>
<a routerLink="/section" fragment="part2">Phần 2</a>
```

- **Chuỗi**: `routerLink="/home"` — path cố định.
- **Mảng**: `[routerLink]="['/products', product.id]"` — path động, phần tử sau nối vào URL (vd `/products/5`).
- **queryParams**: Object hoặc `Observable` — tạo query string `?q=...&page=1`. Có thể dùng `queryParamsHandling: 'merge'` để giữ query hiện tại và merge thêm.
- **fragment**: Hash trong URL (vd `#part2`).

**routerLinkActive** — gán class khi link trùng route hiện tại (dùng cho menu active):

```html
<a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Trang chủ</a>
```

- `routerLinkActive="active"` → thêm class `active` khi URL khớp.
- `routerLinkActiveOptions="{ exact: true }"` → chỉ active khi URL **khớp chính xác** (tránh `/home` làm active cả link `/`).

### Router service — điều hướng bằng code

Khi cần navigate sau khi xử lý (submit form, sau khi login):

```typescript
constructor(private router: Router) {}

goToProduct(id: number) {
  this.router.navigate(['/products', id]);
}
goToSearch(query: string) {
  this.router.navigate(['/search'], { queryParams: { q: query } });
}
```

- **navigate(commands, extras)**: `commands` là mảng path (vd `['/products', id]`). `extras` có thể có `queryParams`, `fragment`, `replaceUrl: true` (thay history thay vì push).
- **navigateByUrl(url)**: Nhận chuỗi URL đầy đủ — ít dùng hơn trừ khi build URL phức tạp.

**Relative path:** Trong component có `ActivatedRoute`, có thể navigate **tương đối** so với route hiện tại:

```typescript
this.router.navigate(['../edit'], { relativeTo: this.route });
```

### ActivatedRoute — đọc params, queryParams, data

Component cần đọc **route param** (vd `id` trong `products/:id`) hoặc **data** từ resolver:

```typescript
constructor(private route: ActivatedRoute) {}

// Observable — cập nhật khi param đổi (vd cùng component, chỉ đổi id)
this.route.params.subscribe(p => console.log(p['id']));
this.route.paramMap.subscribe(m => console.log(m.get('id')));

// Snapshot — giá trị tại thời điểm vào route (đủ dùng nếu component bị destroy khi đổi route)
const id = this.route.snapshot.paramMap.get('id');

// Query params
this.route.queryParams.subscribe(q => console.log(q['page']));
this.route.snapshot.queryParamMap.get('page');

// Data từ resolver
this.route.data.subscribe(({ product }) => this.product = product);
this.product = this.route.snapshot.data['product'];
```

**Tóm tắt:**

| Thuộc tính | Ý nghĩa |
|------------|---------|
| `params` / `paramMap` | Route params (vd `:id`). `paramMap` trả về `Map`-like (`.get('id')`). |
| `queryParams` / `queryParamMap` | Query string (`?page=1`). |
| `data` | Dữ liệu từ **resolver** (và `data` tĩnh trong route config). |
| `fragment` | Hash (`#section`). |
| `snapshot` | Giá trị tại một thời điểm; dùng khi không cần subscribe (component luôn mới khi param đổi). |

---

## Lazy loading

**Lazy loading** = chỉ **tải** component (hoặc module) khi user **vào** route đó. Bundle ban đầu nhỏ hơn → thời gian load trang đầu (FCP, TTI) tốt hơn; các route ít dùng (vd admin) chỉ tải khi cần.

### Cấu hình (standalone)

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
},
```

- **loadComponent** nhận hàm trả về `Promise<Component>`. Angular gọi khi lần đầu navigate tới `admin`; file chunk (vd `admin-xxx.js`) được tải, sau đó component render.
- Có thể đặt tên chunk: `import(/* webpackChunkName: "admin" */ './admin/admin.component')` (tùy build tool).

### Với NgModule (code cũ)

Nếu feature dùng NgModule (declarations, imports, providers):

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
}
```

Trong `AdminModule` khai báo `RouterModule.forChild(routes)` với routes con của `admin`.

### Lưu ý

- Route lazy **không** có component trong bundle chính; dependency của component đó cũng vào chunk (tree-shaking theo route).
- **Preloading** (xem Senior/Master): Có thể tải trước lazy route sau khi app ổn định để lần click vào không phải chờ tải chunk.

---

## Guards

**Guards** = hàm (hoặc class) kiểm tra **điều kiện** trước khi Router cho phép vào/ra route hoặc match route. Dùng cho: kiểm tra đăng nhập, quyền, form chưa lưu khi rời trang, v.v.

### Các loại guard

| Guard | Functional API | Khi nào chạy |
|-------|-----------------|--------------|
| **CanActivate** | `canActivate` | Trước khi **kích hoạt** route — có cho vào trang không. |
| **CanActivateChild** | `canActivateChild` | Trước khi kích hoạt **bất kỳ** route con nào (khai báo trên route cha). |
| **CanDeactivate** | `canDeactivate` | Trước khi **rời** route hiện tại — có cho rời trang không (vd form dirty). |
| **CanMatch** | `canMatch` | Quyết định route có **được match** không; không match thì thử route tiếp theo. Dùng cho cùng path khác điều kiện (vd role). |
| **Resolve** | `resolve` | Không phải guard; load dữ liệu trước khi kích hoạt (xem Resolvers). |

Tất cả guard **functional** (Angular 15+) đều dùng `inject()` để lấy service; trả về `boolean`, `UrlTree`, hoặc `Observable<boolean | UrlTree>`.

### canActivate — bảo vệ route (vd đã đăng nhập)

Ví dụ: Chỉ cho vào `/dashboard` khi đã login; nếu chưa thì redirect về `/login`.

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

- **return true** → cho phép vào route.
- **return UrlTree** → redirect (khuyến nghị hơn `router.navigate()` trong guard vì Router xử lý thống nhất). `createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })` để sau khi login có thể quay lại trang vừa vào.
- **return false** → hủy navigation, URL không đổi.

Khai báo route:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [authGuard],
}
```

### canActivateChild

Áp dụng cho **mọi route con**. Khai báo trên route cha:

```typescript
{
  path: 'admin',
  canActivateChild: [adminGuard],
  children: [
    { path: 'users', loadComponent: () => ... },
    { path: 'settings', loadComponent: () => ... },
  ],
}
```

Chỉ cần một lần guard cho toàn bộ `admin/*`.

### canDeactivate — xác nhận rời trang (vd form chưa lưu)

Guard cần **tham chiếu component** hiện tại để hỏi “form có dirty không?”. Functional API nhận component qua tham số thứ ba:

```typescript
export const canDeactivateForm: CanDeactivateFn<FormComponent> = (component, currentRoute, currentState, nextState) => {
  if (!component.form.dirty) return true;
  return confirm('Bạn có chắc muốn rời trang? Thay đổi chưa được lưu.');
};
```

Component cần implement interface (hoặc type) có method/property tương ứng; guard gọi `component.form.dirty`.

Khai báo route:

```typescript
{
  path: 'edit/:id',
  loadComponent: () => import('./edit.component').then(m => m.EditComponent),
  canDeactivate: [canDeactivateForm],
}
```

### canMatch — quyết định có match route không

Dùng khi **cùng path** nhưng tùy điều kiện (vd role) mà load route khác nhau. Router thử từng route theo thứ tự; `canMatch` return `false` → route đó không match, thử route tiếp theo.

Ví dụ: `/dashboard` cho user thường, `/dashboard` cho admin (component khác):

```typescript
export const adminMatchGuard: CanMatchFn = (route, segments) => {
  return inject(AuthService).hasRole('admin');
};

// routes:
{ path: 'dashboard', canMatch: [adminMatchGuard], loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent) },
{ path: 'dashboard', loadComponent: () => import('./user-dashboard.component').then(m => m.UserDashboardComponent) },
```

Admin → match route đầu; user → guard false, match route thứ hai.

---

## Resolvers

**Resolver** = hàm (hoặc class) **load dữ liệu** trước khi Router **kích hoạt** route. Component khi vào route sẽ nhận dữ liệu sẵn qua `ActivatedRoute.data` — tránh trạng thái “đang tải” trong component và tách logic load ra khỏi component.

### Khi nào dùng

- Trang **chi tiết** (vd product/:id): Cần product trước khi render; nếu không có resolver, component phải gọi API trong ngOnInit và xử lý loading/error. Resolver load xong → Router mới render component → component chỉ việc đọc `route.data`.
- Trang cần **dữ liệu bắt buộc** để hiển thị: Tránh flash “empty” rồi mới có data.

### Ví dụ resolver

```typescript
import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { ProductService } from './product.service';
import { Product } from './product';

export const productResolver: ResolveFn<Product> = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id')!;
  return inject(ProductService).getById(+id);
};
```

- **ResolveFn<T>**: Kiểu trả về `T` (hoặc `Observable<T>`, `Promise<T>`). Router **đợi** Observable/Promise resolve xong mới kích hoạt route; nếu lỗi có thể dùng router config hoặc guard để redirect.
- `route.paramMap.get('id')`: Lấy param từ URL (vd `products/5` → `id = '5'`).

Khai báo route:

```typescript
{
  path: 'products/:id',
  loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  resolve: { product: productResolver },
}
```

Key `product` là tên dùng trong component để đọc từ `data`.

### Component đọc dữ liệu

```typescript
// Observable — cập nhật khi navigate trong cùng component (vd đổi id)
this.route.data.subscribe(({ product }) => this.product = product);

// Snapshot — giá trị lúc vào route
this.product = this.route.snapshot.data['product'];
```

Nếu resolver trả về Observable/Promise và bị **lỗi**, Router không kích hoạt route (navigation fail). Có thể bọc resolver trong pipe `catchError` và return `of(null)` hoặc redirect bằng `router.navigate(['/not-found'])` tùy nghiệp vụ.

---

## Câu hỏi thường gặp

**`pathMatch: 'full'` dùng khi nào?**  
Chỉ cần khi **path rỗng** (`path: ''`). `'full'` = chỉ match khi URL còn lại **hoàn toàn** trống (vd `/` sau base). Nếu dùng `pathMatch: 'prefix'` với `path: ''`, mọi URL đều match route rỗng → redirect loop hoặc sai route.

**Lazy load có lợi gì?**  
Bundle ban đầu **nhỏ hơn** → load trang nhanh hơn (FCP, TTI tốt hơn). Chunk của từng feature chỉ tải khi user vào route đó. Đặc biệt hữu ích cho route nặng hoặc ít dùng (admin, báo cáo).

**Guard có thể inject service không?**  
Có. Guard functional dùng `inject(Service)` trong body. Angular injector có sẵn khi guard chạy.

**navigate() vs navigateByUrl()?**  
`navigate(commands, extras)` nhận **mảng** path (vd `['/products', id]`) và options (queryParams, replaceUrl…). `navigateByUrl(url)` nhận **chuỗi URL** đầy đủ. Ưu tiên `navigate` khi build path từ biến; `navigateByUrl` khi đã có sẵn URL.

**Khi nào dùng resolver thay vì load trong component?**  
Khi bạn muốn **dữ liệu sẵn** trước khi component render (tránh flash loading/empty), và muốn tách logic load ra khỏi component. Nếu trang có thể hiển thị skeleton rồi load sau thì load trong component (ngOnInit) cũng được.

**RouterOutlet có thể có nhiều không?**  
Có. Một outlet **không tên** (primary) và nhiều **named outlet** (vd `<router-outlet name="sidebar">`). Route con khai báo `outlet: 'sidebar'` sẽ render vào outlet đó. Dùng cho layout phức tạp (sidebar + main).

---

## Senior / Master

- **Preloading**: Mặc định lazy route chỉ tải khi user vào. Có thể **preload** sau khi app ổn định: `provideRouter(routes, withPreloading(PreloadAllModules))` — tải hết chunk lazy trong nền. Hoặc custom strategy (vd chỉ preload route có `data: { preload: true }`) để cân bằng giữa bundle đầu và trải nghiệm click.
- **CanMatch**: Guard quyết định route có **được match** không (vd theo role). Dùng kèm **hai route cùng path**: một có `canMatch: [adminGuard]` load component admin, một không guard load component user — Router thử lần lượt, guard return false thì thử route tiếp.
- **Router events**: Subscribe `Router.events` (Observable): `NavigationStart`, `NavigationEnd`, `NavigationCancel`, `NavigationError`, `ResolveStart`, `ResolveEnd`… Dùng cho loading indicator (hiện từ Start, ẩn ở End/Error/Cancel), analytics, breadcrumb, log.
- **Title strategy**: Angular 14+ hỗ trợ `title` trong route (chuỗi hoặc `ResolveFn`). Có thể set `Title` service hoặc dùng `RouteTitleStrategy` tùy chỉnh (vd prefix app name).
- **Child routes & nested outlet**: Route có `children`; component của route cha phải có `<router-outlet />` để render route con. URL = path cha + path con (vd `products` + `:id` → `products/1`). Có thể kết hợp với named outlet cho layout nhiều cột.

---

→ Tiếp theo: [07 - Forms](07-forms.md)
