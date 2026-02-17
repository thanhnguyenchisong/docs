/**
 * ===================================================================
 * Error Interceptor — Xử lý lỗi HTTP toàn cục
 * 📖 Lý thuyết: 08-http-client.md (Error handling, Interceptors)
 * ===================================================================
 *
 * Interceptor này bắt lỗi HTTP (4xx, 5xx) trước khi đến component:
 *   - 401 Unauthorized → redirect về login
 *   - 403 Forbidden → thông báo không có quyền
 *   - 500+ → thông báo lỗi server
 *   - Network error → thông báo mất kết nối
 *
 * 📖 Bài 08: HTTP lỗi trả về error trong Observable (không vào next)
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notify = inject(NotificationService);

  return next(req).pipe(
    // 📖 Bài 08: catchError trong interceptor → xử lý mọi HTTP error
    catchError((error: HttpErrorResponse) => {

      // Xử lý theo status code
      switch (error.status) {
        case 0:
          // Network error — không kết nối được server
          notify.error('Không thể kết nối server. Kiểm tra mạng.');
          break;

        case 401:
          // 📖 Bài 08: 401 → token hết hạn hoặc chưa login
          auth.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
          notify.warning('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
          break;

        case 403:
          notify.error('Bạn không có quyền truy cập tài nguyên này.');
          break;

        case 404:
          notify.error('Không tìm thấy dữ liệu.');
          break;

        case 422:
          // Validation error — hiển thị lỗi chi tiết từ API
          const message = error.error?.message ?? 'Dữ liệu không hợp lệ.';
          notify.error(message);
          break;

        default:
          if (error.status >= 500) {
            notify.error('Lỗi server. Vui lòng thử lại sau.');
          }
          break;
      }

      // 📖 Bài 08: Re-throw error để component vẫn có thể xử lý thêm
      return throwError(() => error);
    }),
  );
};
