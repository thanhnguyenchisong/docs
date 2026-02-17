/**
 * ===================================================================
 * app.routes.ts — Routing Configuration
 * 📖 Lý thuyết: 06-routing-navigation.md
 *   - Cấu hình routes, path params
 *   - Lazy loading (loadComponent)
 *   - Guards (canActivate, canDeactivate, canMatch)
 *   - Resolvers (resolve)
 *   - Wildcard route (**)
 * ===================================================================
 *
 * Tổ chức routes:
 *   / → redirect → /home
 *   /home → HomeComponent (eager)
 *   /products → ProductListComponent (lazy)
 *   /products/:id → ProductDetailComponent (lazy + resolver)
 *   /products/new → ProductFormComponent (lazy + guard)
 *   /products/grid → ProductGridComponent (lazy, AG-Grid)
 *   /auth/login → LoginComponent (lazy)
 *   /auth/register → RegisterComponent (lazy)
 *   /dashboard → DashboardComponent (lazy + guard)
 *   ** → NotFound (wildcard)
 *
 * 📖 Bài 06: Lazy load giảm bundle ban đầu — chỉ load khi vào route
 */
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { productResolver } from '@core/resolvers/product.resolver';

export const routes: Routes = [
  // ─── Redirect root → home ─────────────────────────────────────
  // 📖 Bài 06: pathMatch: 'full' — chỉ match khi URL trống hoàn toàn
  // Không có 'full' → path '' match MỌI URL (vì mọi URL bắt đầu bằng '')
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },

  // ─── Home — Eager load (nhỏ, luôn cần) ────────────────────────
  // 📖 Bài 06: loadComponent — lazy load standalone component
  {
    path: 'home',
    loadComponent: () => import('@features/home/home.component')
      .then(m => m.HomeComponent),
    data: { animation: 'home' },  // Dùng cho route animation
  },

  // ─── Products — Lazy loaded ────────────────────────────────────
  {
    path: 'products',
    children: [
      // Danh sách sản phẩm
      {
        path: '',
        loadComponent: () => import('@features/products/product-list/product-list.component')
          .then(m => m.ProductListComponent),
        data: { animation: 'products' },
      },

      // AG-Grid demo
      // 📖 Bài 16: AG-Grid component lazy loaded
      {
        path: 'grid',
        loadComponent: () => import('@features/products/product-grid/product-grid.component')
          .then(m => m.ProductGridComponent),
        data: { animation: 'grid' },
      },

      // Tạo sản phẩm mới — cần đăng nhập
      // 📖 Bài 06: canActivate — kiểm tra trước khi vào route
      {
        path: 'new',
        loadComponent: () => import('@features/products/product-form/product-form.component')
          .then(m => m.ProductFormComponent),
        canActivate: [authGuard],
        data: { animation: 'productForm' },
      },

      // Chi tiết sản phẩm — có resolver load data trước
      // 📖 Bài 06: :id — path parameter (đọc qua ActivatedRoute)
      // 📖 Bài 06: resolve — load data trước khi render component
      {
        path: ':id',
        loadComponent: () => import('@features/products/product-detail/product-detail.component')
          .then(m => m.ProductDetailComponent),
        resolve: {
          product: productResolver,
        },
        data: { animation: 'productDetail' },
      },
    ],
  },

  // ─── Auth ──────────────────────────────────────────────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('@features/auth/login/login.component')
          .then(m => m.LoginComponent),
        data: { animation: 'login' },
      },
      {
        path: 'register',
        loadComponent: () => import('@features/auth/register/register.component')
          .then(m => m.RegisterComponent),
        data: { animation: 'register' },
      },
    ],
  },

  // ─── Dashboard — Cần đăng nhập ────────────────────────────────
  {
    path: 'dashboard',
    loadComponent: () => import('@features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { animation: 'dashboard' },
  },

  // ─── Wildcard — 404 Not Found ──────────────────────────────────
  // 📖 Bài 06: ** match mọi URL không khớp route nào ở trên
  // PHẢI đặt cuối cùng vì Angular match theo thứ tự
  {
    path: '**',
    loadComponent: () => import('@features/home/home.component')
      .then(m => m.HomeComponent),
  },
];
