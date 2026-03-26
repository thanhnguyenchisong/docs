# Authentication & Authorization

Xác thực (Authentication) và phân quyền (Authorization) là phần quan trọng của mọi ứng dụng Angular thực tế. Bài này trình bày các pattern phổ biến: JWT, OAuth2, guards, interceptors, và bảo vệ route/UI theo role.

## Mục lục
1. [Auth là gì? (Cho người mới)](#auth-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Login → nhận token → truy cập trang bảo mật](#ví-dụ-trực-quan-login--nhận-token--truy-cập-trang-bảo-mật)
3. [JWT Authentication](#jwt-authentication)
4. [Auth Service](#auth-service)
5. [Auth Interceptor](#auth-interceptor)
6. [Route Guards cho Auth](#route-guards-cho-auth)
7. [Role-based Authorization](#role-based-authorization)
8. [Refresh Token](#refresh-token)
9. [OAuth2 / OIDC](#oauth2--oidc)
10. [Best practices](#best-practices)
11. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Auth là gì? (Cho người mới)

- **Authentication (Xác thực)** = xác định **"bạn là ai"**: user nhập email + password, server kiểm tra đúng → trả về **token** (giấy thông hành). Từ đó mọi request gửi kèm token để server biết request đến từ user nào.
- **Authorization (Phân quyền)** = xác định **"bạn được làm gì"**: sau khi biết bạn là ai, server (và client) kiểm tra role/permission để cho phép hoặc từ chối hành động (ví dụ: chỉ admin được xóa user).
- **Token (JWT)** = chuỗi mã hóa chứa thông tin user (id, role, hạn dùng). Client lưu token và gửi trong header `Authorization: Bearer <token>` mỗi request. Server verify token mà không cần kiểm tra database mỗi lần.
- Trong Angular: **Auth Service** quản lý login/logout/token; **Interceptor** tự gắn token vào mọi request; **Guard** bảo vệ route (chưa login → redirect `/login`); **Directive/pipe** ẩn hiện UI theo role.

---

## Ví dụ trực quan: Login → nhận token → truy cập trang bảo mật

1. Mở app, vào `/dashboard` → Guard chặn (chưa login) → redirect `/login`.
2. Nhập email + password → component gọi `authService.login(email, password)`. Service gọi `POST /api/auth/login` và nhận `{ accessToken, refreshToken }`.
3. AuthService lưu token (memory hoặc cookie) và navigate tới `/dashboard`.
4. Ở `/dashboard`, component gọi API `GET /api/products` → Interceptor tự thêm header `Authorization: Bearer <token>` → server trả dữ liệu → hiển thị.
5. User bấm "Đăng xuất" → xóa token → redirect `/login`.

---

## JWT Authentication

### JWT là gì?

**JWT (JSON Web Token)** gồm 3 phần: `header.payload.signature` (mã hóa base64).

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzE...}.signature
```

- **Header**: Thuật toán (HS256, RS256).
- **Payload**: Chứa claims (sub, role, exp, iat). Không lưu dữ liệu nhạy cảm (password).
- **Signature**: Server dùng secret/key để ký; client không sửa được.

### Access Token vs Refresh Token

| | Access Token | Refresh Token |
|---|-------------|---------------|
| **Thời hạn** | Ngắn (5–15 phút) | Dài (7–30 ngày) |
| **Nơi lưu** | Memory (biến JS) | HttpOnly cookie (an toàn nhất) |
| **Dùng để** | Gửi kèm mọi API request | Xin access token mới khi hết hạn |
| **Bị đánh cắp** | Rủi ro thấp (hết hạn nhanh) | Rủi ro cao → dùng HttpOnly cookie, rotation |

---

## Auth Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; name: string; role: string };
}

interface AuthUser {
  id: number;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // State
  private _user = signal<AuthUser | null>(null);
  private _token = signal<string | null>(null);

  // Public (readonly)
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly role = computed(() => this._user()?.role ?? null);

  // Login
  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        this._token.set(res.accessToken);
        this._user.set(res.user);
        // Refresh token nên lưu trong HttpOnly cookie (server set)
      }),
    );
  }

  // Logout
  logout() {
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  // Lấy token cho interceptor
  getToken(): string | null {
    return this._token();
  }

  // Refresh token
  refreshAccessToken() {
    return this.http.post<{ accessToken: string }>('/api/auth/refresh', {}).pipe(
      tap(res => this._token.set(res.accessToken)),
    );
  }

  // Kiểm tra role
  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }
}
```

**Lưu ý**: Ví dụ lưu token trong `signal` (memory) — mất khi reload. Trong thực tế:
- **Access token**: Lưu trong memory (an toàn nhất, chấp nhận mất khi reload).
- **Refresh token**: Server set trong HttpOnly cookie → không bị JS đọc (chống XSS).
- Khi reload, app gọi `/api/auth/refresh` với cookie → nhận access token mới.

---

## Auth Interceptor

Tự gắn token vào mọi API request; xử lý 401 (token hết hạn):

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Không gắn token vào request auth (login, refresh)
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Gắn token
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token hết hạn → thử refresh
        return auth.refreshAccessToken().pipe(
          switchMap(() => {
            // Retry request với token mới
            const newToken = auth.getToken();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
          catchError(() => {
            // Refresh cũng thất bại → logout
            auth.logout();
            return throwError(() => err);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
```

Đăng ký trong `app.config.ts`:

```typescript
providers: [
  provideHttpClient(
    withFetch(),
    withInterceptors([authInterceptor]),
  ),
],
```

---

## Route Guards cho Auth

### Guard cơ bản — kiểm tra đăng nhập

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;

  // Chưa login → redirect với returnUrl
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

### Guard theo role

```typescript
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const requiredRoles = route.data['roles'] as string[];

  if (!auth.isLoggedIn()) {
    return inject(Router).createUrlTree(['/login']);
  }

  if (requiredRoles && !auth.hasAnyRole(requiredRoles)) {
    return inject(Router).createUrlTree(['/forbidden']);
  }

  return true;
};
```

Khai báo route:

```typescript
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./forbidden/forbidden.component').then(m => m.ForbiddenComponent),
  },
];
```

---

## Role-based Authorization

### Ẩn hiện UI theo role — Structural Directive

```typescript
import { Directive, input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  appHasRole = input.required<string | string[]>();
  private auth = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private rendered = false;

  constructor() {
    effect(() => {
      const roles = Array.isArray(this.appHasRole()) ? this.appHasRole() : [this.appHasRole()];
      const hasRole = this.auth.hasAnyRole(roles as string[]);
      if (hasRole && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!hasRole && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
```

Template:

```html
<button *appHasRole="'admin'" (click)="deleteUser()">Xóa user</button>

<!-- Hoặc nhiều role -->
<section *appHasRole="['admin', 'manager']">
  Quản lý đơn hàng
</section>
```

---

## Refresh Token

### Flow refresh token

```
1. Client gửi request + access token (hết hạn)
2. Server trả 401
3. Interceptor bắt 401 → gọi POST /api/auth/refresh (gửi refresh token qua cookie)
4. Server verify refresh token → trả access token mới
5. Interceptor retry request ban đầu với token mới
6. Nếu refresh cũng fail → logout
```

### Xử lý concurrent requests

Khi nhiều request cùng nhận 401, cần **queue** chúng và chỉ gọi refresh **một lần**:

```typescript
@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  refreshToken(): Observable<string> {
    if (this.refreshing) {
      // Đang refresh → chờ kết quả
      return this.refreshSubject.pipe(
        filter(token => token !== null),
        take(1),
      );
    }

    this.refreshing = true;
    this.refreshSubject.next(null);

    return this.http.post<{ accessToken: string }>('/api/auth/refresh', {}).pipe(
      tap(res => {
        this.refreshing = false;
        this.refreshSubject.next(res.accessToken);
      }),
      map(res => res.accessToken),
      catchError(err => {
        this.refreshing = false;
        this.refreshSubject.next(null);
        return throwError(() => err);
      }),
    );
  }
}
```

---

## OAuth2 / OIDC

Khi dùng **đăng nhập qua Google, Facebook, Azure AD**… (không quản lý password):

- **OAuth2** = giao thức ủy quyền: app redirect user tới provider → user đăng nhập → provider redirect lại app với `authorization code` → app đổi code lấy token.
- **OIDC (OpenID Connect)** = OAuth2 + thông tin user (id_token).

### Thư viện phổ biến

| Thư viện | Ghi chú |
|----------|---------|
| **angular-oauth2-oidc** | Phổ biến, PKCE, auto refresh |
| **@azure/msal-angular** | Microsoft/Azure AD |
| **angular-auth-oidc-client** | Certified OIDC, nhiều provider |

### Ví dụ cơ bản (angular-oauth2-oidc)

```typescript
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

const authConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  clientId: 'your-client-id',
  redirectUri: window.location.origin,
  scope: 'openid profile email',
  responseType: 'code',
};

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  constructor(private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login() { this.oauthService.initLoginFlow(); }
  logout() { this.oauthService.logOut(); }
  get isLoggedIn() { return this.oauthService.hasValidAccessToken(); }
  get userProfile() { return this.oauthService.getIdentityClaims(); }
}
```

---

## Best practices

| Nội dung | Gợi ý |
|----------|-------|
| **Lưu trữ token** | Access token trong **memory** (signal/biến); refresh token trong **HttpOnly cookie** (server set). Tránh localStorage cho access token (XSS risk). |
| **Token expiry** | Kiểm tra `exp` claim trong JWT trước khi gửi request; proactive refresh trước khi hết hạn. |
| **Interceptor order** | Auth interceptor gắn token **trước** error interceptor để error interceptor nhận response đúng. |
| **Guard + returnUrl** | Redirect về trang ban đầu sau khi login thành công. |
| **Role check** | Luôn verify role **cả server lẫn client**. Client chỉ ẩn UI (UX); server phải từ chối request nếu không đủ quyền. |
| **CSRF** | Nếu dùng cookie-based auth, cần CSRF token. JWT trong header không cần CSRF. |
| **Logout** | Xóa token memory, xóa cookie (gọi API `/logout`), redirect; clear state (signal, NgRx). |

---

## Câu hỏi thường gặp

**Lưu JWT ở đâu an toàn nhất?**  
Access token trong **memory** (signal, biến class). Refresh token trong **HttpOnly cookie** (server set, JS không đọc được → chống XSS). localStorage/sessionStorage dễ bị XSS đọc.

**Tại sao cần refresh token?**  
Access token hạn ngắn → nếu bị đánh cắp, rủi ro thời gian ngắn. Refresh token cho phép lấy access mới mà user không cần nhập lại password. Khi reload trang (access token mất), app dùng refresh token (trong cookie) để xin lại.

**Guard có đủ bảo mật không?**  
Guard chỉ **ẩn route ở client** (UX). Bảo mật thật nằm ở **server** — mọi API phải verify token và kiểm tra quyền. Guard giúp UX tốt (không hiện trang trắng rồi mới redirect), không phải bảo mật thật sự.

**Khi nào dùng OAuth2 thay JWT tự quản lý?**  
Khi cần đăng nhập qua **third-party** (Google, Microsoft, GitHub) hoặc tổ chức có **Identity Provider** sẵn (Keycloak, Auth0, Azure AD). Nếu chỉ có email/password đơn giản, JWT tự quản lý (backend issue token) là đủ.

---

## Senior / Master

- **PKCE (Proof Key for Code Exchange)**: SPA không có client secret → dùng PKCE (authorization code + code_verifier/challenge) thay Implicit flow (đã lỗi thời). Mọi OAuth2 library hiện đại đều hỗ trợ PKCE.
- **Token rotation**: Server cấp refresh token mới mỗi lần refresh (invalidate token cũ). Nếu refresh token bị dùng lại (replay) → server biết bị đánh cắp → revoke toàn bộ.
- **Multi-tab sync**: Khi logout ở tab A, tab B cũng phải logout. Dùng `BroadcastChannel` hoặc `storage` event để sync state giữa tabs.
- **SSR + Auth**: Server cần đọc cookie (không đọc memory token) → nếu dùng SSR, auth flow cần cookie-based hoặc server-side session.
- **Fine-grained permissions**: Thay vì role (admin/user), dùng **permission** (can_delete_product, can_view_report). Store permissions trong JWT claims hoặc load từ API; directive `*appHasPermission="'can_delete_product'"`.

---

→ Xem thêm: [06 - Routing (Guards)](06-routing-navigation.md#guards) | [08 - HTTP (Interceptors)](08-http-client.md#interceptors)  
→ Tiếp theo: [19 - PWA & Real-time](19-pwa-realtime.md)
