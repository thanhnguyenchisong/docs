/**
 * ===================================================================
 * HeaderComponent — Navigation header
 * 📖 Lý thuyết:
 *   - 03-components-templates.md (Data binding, Input/Output)
 *   - 06-routing-navigation.md (routerLink, routerLinkActive)
 *   - 11-ui-styling.md (Angular Material)
 * ===================================================================
 *
 * Minh họa:
 *   - Standalone component với imports
 *   - Data binding: {{ }}, [property], (event)
 *   - routerLink: điều hướng không reload trang
 *   - Signal-based state từ service (AuthService, CartService)
 *   - Angular Material components (MatToolbar, MatButton, MatIcon, MatBadge)
 */
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  // 📖 Bài 02: standalone component import trực tiếp những gì cần dùng
  imports: [
    RouterLink,          // Directive cho [routerLink]
    RouterLinkActive,    // Directive cho routerLinkActive (thêm class khi active)
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  template: `
    <!-- 📖 Bài 11: Angular Material — mat-toolbar, mat-icon, mat-button -->
    <mat-toolbar color="primary" class="flex between">
      <div class="flex center gap-sm">
        <mat-icon>store</mat-icon>
        <!-- 📖 Bài 03: {{ expression }} — Interpolation binding -->
        <span>Angular Demo</span>
      </div>

      <nav class="flex gap-sm">
        <!--
          📖 Bài 06: routerLink — điều hướng SPA (không reload)
          routerLinkActive — thêm CSS class khi route active
        -->
        <a mat-button routerLink="/home" routerLinkActive="active-link">
          <mat-icon>home</mat-icon> Trang chủ
        </a>
        <a mat-button routerLink="/products" routerLinkActive="active-link">
          <mat-icon>inventory</mat-icon> Sản phẩm
        </a>
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>

        <!-- 📖 Bài 03: [matBadge] — property binding, đọc signal cartService.itemCount() -->
        <a mat-icon-button routerLink="/cart"
           [matBadge]="cartService.itemCount()"
           [matBadgeHidden]="cartService.isEmpty()"
           matBadgeColor="accent"
           matBadgeSize="small">
          <mat-icon>shopping_cart</mat-icon>
        </a>

        <!--
          📖 Bài 03: @if — Control flow mới (Angular 17+)
          Đọc signal auth.isLoggedIn() trực tiếp trong template
        -->
        @if (auth.isLoggedIn()) {
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>person</mat-icon>
            <!-- 📖 Bài 15: computed signal userName() — derived state -->
            {{ auth.userName() }}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon> Đăng xuất
            </button>
          </mat-menu>
        } @else {
          <a mat-button routerLink="/auth/login" routerLinkActive="active-link">
            <mat-icon>login</mat-icon> Đăng nhập
          </a>
        }
      </nav>
    </mat-toolbar>
  `,
  styles: [`
    /* 📖 Bài 11: Component-scoped styles — chỉ ảnh hưởng component này */
    :host { display: block; }
    nav a, nav button { text-transform: none; }
    .active-link { background: rgba(255,255,255,0.15); }
  `],
})
export class HeaderComponent {
  // 📖 Bài 05: inject() — Angular 14+, gọn hơn constructor injection
  readonly auth = inject(AuthService);
  readonly cartService = inject(CartService);
}
