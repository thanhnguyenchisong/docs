/**
 * ===================================================================
 * NotificationService — Event bus dùng Subject
 * 📖 Lý thuyết:
 *   - 09-rxjs-angular.md (Subject, BehaviorSubject, ReplaySubject)
 *   - 05-services-di.md (Singleton service phát sự kiện)
 * ===================================================================
 *
 * Subject pattern: Service phát sự kiện cho nhiều component subscribe.
 * Dùng khi: thông báo toàn cục, event bus đơn giản.
 *
 * So sánh:
 *   - Subject: Không có giá trị khởi tạo, subscriber mới không nhận giá trị cũ
 *   - BehaviorSubject: Có giá trị khởi tạo, subscriber mới nhận giá trị hiện tại
 *   - ReplaySubject(n): Replay n giá trị gần nhất cho subscriber mới
 */
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // 📖 Bài 09: Subject — vừa Observable vừa Observer
  // Private: chỉ service gọi .next()
  private readonly _notifications$ = new Subject<Notification>();

  // 📖 Bài 09: .asObservable() — ẩn .next(), chỉ expose Observable
  // Component subscribe nhưng không thể emit
  readonly notifications$: Observable<Notification> = this._notifications$.asObservable();

  // ─── Methods: Emit thông báo ───────────────────────────────────

  success(message: string): void {
    this._notifications$.next({ type: 'success', message, duration: 3000 });
  }

  error(message: string): void {
    this._notifications$.next({ type: 'error', message, duration: 5000 });
  }

  info(message: string): void {
    this._notifications$.next({ type: 'info', message, duration: 3000 });
  }

  warning(message: string): void {
    this._notifications$.next({ type: 'warning', message, duration: 4000 });
  }
}
