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

- **Routing** = điều hướng theo **URL**: mỗi đường dẫn (ví dụ `/home`, `/products`, `/products/1`) tương ứng với một “trang” (component). User click link hoặc gõ URL → Angular Router đổi nội dung hiển thị (thường là vùng `<router-outlet>`) **không tải lại cả trang** — đây là SPA (Single Page Application).
- **Route** = một cấu hình: path (đường dẫn) + component (hoặc `loadComponent` lazy). **RouterOutlet** = vị trí trong template mà component của route hiện tại được vẽ. **routerLink** = link không reload trang, chỉ đổi route.
- Khi bạn mở `/products`, Router load component gắn với route `products`; khi chuyển sang `/products/1`, component có thể đổi (product-detail) và nhận param `id = 1`. Toàn bộ do `app.routes.ts` (hoặc file tương đương) định nghĩa.

---

## Ví dụ trực quan: Đổi URL → đổi nội dung trên màn hình

1. Trong `app.routes.ts` thêm hai route: `{ path: 'page-a', loadComponent: () => import('./page-a.component').then(m => m.PageAComponent) }` và tương tự `page-b` (tạo hai component đơn giản: mỗi cái template chỉ có `<p>Trang A</p>` và `<p>Trang B</p>`).
2. Trong `app.component.html` đặt `<router-outlet></router-outlet>` và hai link: `<a routerLink="/page-a">Trang A</a>`, `<a routerLink="/page-b">Trang B</a>`.
3. Chạy `ng serve`, mở `/page-a` — bạn thấy “Trang A”. Đổi URL thành `/page-b` (hoặc click link Trang B) — nội dung chuyển thành “Trang B”, **không reload trang**. Đó là routing trực quan: URL thay đổi → component trong outlet thay đổi.

---

## Cấu hình routes

Thường đặt trong `app.routes.ts` (standalone) hoặc file riêng:

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

Đăng ký trong `app.config.ts`:

```typescript
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
});
```

---

## RouterOutlet và links

**RouterOutlet**: Vị trí component của route hiện tại được render.

```html
<app-header />
<router-outlet />
<app-footer />
```

**routerLink**: Điều hướng không reload trang.

```html
<a routerLink="/home">Trang chủ</a>
<a [routerLink]="['/products', product.id]">Chi tiết</a>
<a routerLink="/edit" [queryParams]="{ id: 1 }">Sửa</a>
```

**Router service**: Điều hướng bằng code, đọc params.

```typescript
constructor(private router: Router, private route: ActivatedRoute) {}

goToProduct(id: number) {
  this.router.navigate(['/products', id]);
}

// Đọc params
this.route.params.subscribe(p => console.log(p['id']));
// Hoặc signal (Angular 16+)
this.route.paramMap  // hoặc params
```

---

## Lazy loading

Load component (hoặc module) chỉ khi vào route đó → giảm bundle ban đầu.

```typescript
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
},
```

Với NgModule (code cũ):

```typescript
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
}
```

---

## Guards

Kiểm tra điều kiện trước khi vào/ra route hoặc load component.

| Guard | Mục đích |
|-------|----------|
| `CanActivate` (functional: `canActivate`) | Có được vào route không (ví dụ đã login) |
| `CanActivateChild` | Áp dụng cho child routes |
| `CanDeactivate` | Có được rời trang không (ví dụ form dirty) |
| `CanMatch` | Có match route này không (dùng cho điều kiện load route) |
| `Resolve` | Load dữ liệu trước khi vào route |

Ví dụ guard bảo vệ route:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  inject(Router).navigate(['/login']);
  return false;
};
```

Khai báo route:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  canActivate: [authGuard],
}
```

---

## Resolvers

Load dữ liệu trước khi route kích hoạt; component nhận qua `ActivatedRoute.data`.

```typescript
export const productResolver: ResolveFn<Product> = (route, state) => {
  const id = route.paramMap.get('id')!;
  return inject(ProductService).getById(+id);
};
```

```typescript
{
  path: 'products/:id',
  loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent),
  resolve: { product: productResolver },
}
```

Component:

```typescript
this.route.data.subscribe(({ product }) => this.product = product);
// Hoặc snapshot
this.product = this.route.snapshot.data['product'];
```

---

## Câu hỏi thường gặp

**`pathMatch: 'full'` dùng khi nào?**  
Với route `path: ''`, để tránh match mọi URL. `'full'` nghĩa là chỉ match khi URL còn lại trống (sau prefix).

**Lazy load có lợi gì?**  
Bundle ban đầu nhỏ hơn, load từng phần khi user vào route → First Contentful Paint tốt hơn.

**Guard có thể inject service không?**  
Có. Guard là function nhận `route`, `state`; dùng `inject(Service)` trong body để lấy service.

---

## Senior / Master

- **Preloading**: `provideRouter(routes, withPreloading(PreloadAllModules))` hoặc custom strategy — load lazy route sau khi app ổn định để giảm click chờ. `NoPreloading` (mặc định) chỉ load khi vào route.
- **CanMatch**: Guard quyết định route có được match không (ví dụ theo role) — không load component nếu không match; dùng kèm route trùng path (một cho admin, một cho user).
- **Router events**: Subscribe `Router.events` (NavigationStart, NavigationEnd, ResolveStart...) để loading indicator, analytics, breadcrumb.

---

→ Tiếp theo: [07 - Forms](07-forms.md)
