/**
 * ===================================================================
 * Global Error Handler — Bắt mọi error chưa được xử lý
 * 📖 Lý thuyết: 08-http-client.md (Senior/Master → Global ErrorHandler)
 * ===================================================================
 *
 * Angular cung cấp class ErrorHandler. Override để:
 *   - Log error lên monitoring service (Sentry, Datadog)
 *   - Hiển thị thông báo toàn cục
 *   - Track error rate
 *
 * Đăng ký: { provide: ErrorHandler, useClass: GlobalErrorHandler }
 *
 * ErrorHandler bắt MỌI error:
 *   - Throw trong component/service
 *   - Unhandled Promise rejection
 *   - Observable error không có catchError
 */
import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  // 📖 Bài 05: inject() trong Injectable class
  private readonly notify = inject(NotificationService);
  private readonly ngZone = inject(NgZone);

  /**
   * 📖 Bài 08: handleError được Angular gọi khi có unhandled error
   */
  handleError(error: any): void {
    // Log chi tiết để debug
    console.error('[GlobalErrorHandler] Unhandled error:', error);

    // Lấy message
    const message = error?.message ?? error?.toString() ?? 'Đã xảy ra lỗi không xác định';

    // 📖 Bài 15: ngZone.run() — đảm bảo thông báo trigger change detection
    // Vì error có thể xảy ra ngoài Angular zone
    this.ngZone.run(() => {
      this.notify.error(`Lỗi: ${message}`);
    });

    // Thực tế: Gửi lên monitoring service
    // Sentry.captureException(error);
    // this.monitoringService.logError(error);
  }
}
