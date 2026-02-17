/**
 * ===================================================================
 * Auth Interceptor — Tự động thêm token vào mọi HTTP request
 * 📖 Lý thuyết: 08-http-client.md (Interceptors)
 * ===================================================================
 *
 * Interceptor xử lý request/response toàn cục.
 * Angular 15+ khuyến nghị functional interceptor (HttpInterceptorFn).
 *
 * Luồng: Request → auth interceptor → error interceptor → server
 *         Response ← error interceptor ← auth interceptor ← server
 *
 * Thứ tự trong mảng = thứ tự xử lý request (ngược lại cho response)
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/**
 * 📖 Bài 08: Functional interceptor (Angular 15+)
 *
 * Nhận (req, next):
 *   - req: HttpRequest — clone để thay đổi (immutable)
 *   - next: HttpHandlerFn — gọi tiếp interceptor tiếp theo
 *
 * Dùng inject() để lấy service trong function context
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Nếu có token → clone request và thêm Authorization header
  // 📖 Bài 08: req.clone() vì HttpRequest là immutable
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // Không có token → forward request gốc
  return next(req);
};
