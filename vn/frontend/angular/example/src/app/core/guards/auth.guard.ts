/**
 * ===================================================================
 * Auth Guard — Bảo vệ route yêu cầu đăng nhập
 * 📖 Lý thuyết: 06-routing-navigation.md (Guards)
 * ===================================================================
 *
 * Guard kiểm tra điều kiện trước khi vào route.
 * Angular 14+ khuyến nghị functional guard (CanActivateFn).
 *
 * Các loại guard:
 *   - canActivate: Có được vào route không?
 *   - canActivateChild: Áp dụng cho child routes
 *   - canDeactivate: Có được rời trang không? (form dirty)
 *   - canMatch: Route có được match không? (theo role)
 *
 * 📖 Bài 06: Guard dùng inject() để lấy service
 */
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * authGuard — Kiểm tra đã login chưa
 * 📖 Bài 06: CanActivateFn nhận (route, state), return boolean | UrlTree
 *
 * Trả về:
 *   - true: cho phép vào route
 *   - false: không cho vào (Angular không điều hướng)
 *   - UrlTree: redirect sang route khác (tốt hơn navigate + return false)
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // 📖 Bài 06: UrlTree — redirect về login, kèm returnUrl để quay lại
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * adminGuard — Kiểm tra role admin
 * 📖 Bài 06: CanMatch — quyết định route có được match không
 * Dùng khi cùng path nhưng khác role (admin vs user)
 */
export const adminGuard: CanMatchFn = (_route, _segments) => {
  const auth = inject(AuthService);

  if (auth.isAdmin()) {
    return true;
  }

  // Không match route này → Angular thử route tiếp theo
  return false;
};

/**
 * unsavedChangesGuard — Cảnh báo khi rời trang có form chưa lưu
 * 📖 Bài 06: CanDeactivate — kiểm tra trước khi rời component
 *
 * Component cần implement interface HasUnsavedChanges
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard = (component: HasUnsavedChanges) => {
  if (component.hasUnsavedChanges()) {
    return window.confirm('Bạn có thay đổi chưa lưu. Bạn muốn rời trang?');
  }
  return true;
};
