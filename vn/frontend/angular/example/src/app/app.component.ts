/**
 * ===================================================================
 * AppComponent — Root Component
 * 📖 Lý thuyết:
 *   - 02-angular-fundamentals.md (Root component, lifecycle, standalone)
 *   - 03-components-templates.md (Component structure)
 *   - 06-routing-navigation.md (RouterOutlet)
 *   - 11-ui-styling.md (Route animation, :host)
 * ===================================================================
 *
 * Root component là component đầu tiên được render (bootstrap).
 * Thường chứa layout chung: header, router-outlet, footer.
 *
 * Cấu trúc: class (logic) + template (HTML) + style (SCSS)
 */
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { routeAnimation, fadeInOut } from '@shared/animations/route.animations';
import { NotificationService, Notification } from '@core/services/notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  // 📖 Bài 03: selector — tên thẻ HTML trong index.html: <app-root>
  selector: 'app-root',

  // 📖 Bài 02: standalone: true — không cần NgModule
  standalone: true,

  // 📖 Bài 02: imports — khai báo dependency trực tiếp (standalone)
  imports: [RouterOutlet, HeaderComponent, MatSnackBarModule],

  // 📖 Bài 11: animations — đăng ký animation triggers
  animations: [routeAnimation, fadeInOut],

  template: `
    <!-- Header component — shared across all pages -->
    <app-header />

    <!-- 📖 Bài 06: RouterOutlet — vị trí render component của route hiện tại -->
    <!-- 📖 Bài 11: [@routeAnimation] — trigger animation khi route đổi -->
    <main [@routeAnimation]="getRouteAnimationState(outlet)">
      <router-outlet #outlet="outlet" />
    </main>
  `,

  styles: [`
    /*
     * 📖 Bài 11: :host — style cho host element (<app-root>)
     * Mặc định component element không có display
     */
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
      padding: 16px;
      position: relative;
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {

  // 📖 Bài 05: inject() — Angular 14+
  private readonly notify = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private notifySub?: Subscription;

  // ─── Lifecycle hooks ───────────────────────────────────────────
  // 📖 Bài 02: ngOnInit — khởi tạo logic, gọi API, subscribe
  // Khác constructor: lúc này input đã có giá trị, view chưa render
  ngOnInit(): void {
    // Subscribe notifications → hiển thị SnackBar
    // 📖 Bài 09: subscribe Observable từ service
    this.notifySub = this.notify.notifications$.subscribe(n => {
      this.showNotification(n);
    });
  }

  // 📖 Bài 02: ngOnDestroy — cleanup trước khi component bị hủy
  // PHẢI unsubscribe để tránh memory leak
  ngOnDestroy(): void {
    this.notifySub?.unsubscribe();
  }

  // ─── Route animation helper ────────────────────────────────────
  /**
   * 📖 Bài 11: Lấy animation state từ route data
   * Khi route đổi → animation trigger chạy
   */
  getRouteAnimationState(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? 'default';
  }

  // ─── Notification display ──────────────────────────────────────
  private showNotification(n: Notification): void {
    this.snackBar.open(n.message, 'Đóng', {
      duration: n.duration ?? 3000,
      panelClass: [`snack-${n.type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
