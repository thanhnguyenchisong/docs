/**
 * ===================================================================
 * AuthService — Quản lý authentication
 * 📖 Lý thuyết:
 *   - 05-services-di.md (Service, providedIn, inject())
 *   - 10-state-architecture.md (Service-based state với signals)
 *   - 15-master-angular.md (Signals — reactive primitive)
 * ===================================================================
 *
 * AuthService là singleton (providedIn: 'root') — một instance cho toàn app.
 * Dùng signals để quản lý state: currentUser, isLoggedIn.
 *
 * Pattern:
 *   - Private writable signal (_user) — chỉ service thay đổi được
 *   - Public readonly signal (user) — component chỉ đọc
 *   - computed() cho derived state (isLoggedIn, isAdmin)
 */
import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '@core/models';

@Injectable({
  // 📖 Bài 05: providedIn: 'root' → singleton, không cần khai báo trong providers
  // Angular tree-shake nếu không inject ở đâu → không tăng bundle
  providedIn: 'root',
})
export class AuthService {

  // ─── State: signals ────────────────────────────────────────────
  // 📖 Bài 15: signal() — reactive primitive, đồng bộ, luôn có giá trị
  // Private: chỉ service này thay đổi được
  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  // Public: readonly cho component đọc
  // 📖 Bài 15: .asReadonly() ngăn component gọi .set() / .update()
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();

  // 📖 Bài 15: computed() — derived state, chỉ tính lại khi signal phụ thuộc đổi
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly userName = computed(() => this._user()?.name ?? 'Guest');

  // ─── Methods ───────────────────────────────────────────────────

  /**
   * Login: giả lập gọi API, set user state
   * Thực tế: gọi HTTP POST → nhận token → decode → set user
   */
  login(email: string, _password: string): boolean {
    // Giả lập response
    const mockUser: User = {
      id: 1,
      name: 'Nguyễn Văn A',
      email,
      role: email.includes('admin') ? 'admin' : 'viewer',
      createdAt: new Date().toISOString(),
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token';

    // 📖 Bài 15: .set() — gán giá trị mới cho signal
    this._user.set(mockUser);
    this._token.set(mockToken);
    return true;
  }

  /**
   * Logout: xóa state
   */
  logout(): void {
    this._user.set(null);
    this._token.set(null);
  }

  /**
   * Kiểm tra role — dùng trong guards
   */
  hasRole(role: UserRole): boolean {
    return this._user()?.role === role;
  }

  /**
   * Lấy token hiện tại — dùng trong interceptor
   */
  getToken(): string | null {
    return this._token();
  }
}
