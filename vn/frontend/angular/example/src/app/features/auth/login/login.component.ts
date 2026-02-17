/**
 * ===================================================================
 * LoginComponent — Reactive Form demo
 * 📖 Lý thuyết: 07-forms.md (Reactive Forms, Validation)
 * ===================================================================
 *
 * Minh họa Reactive Forms:
 *   - FormBuilder tạo FormGroup
 *   - Validators (required, email, minLength)
 *   - Custom validator (forbiddenName)
 *   - Error messages hiển thị khi touched
 *   - Form submit → gọi AuthService
 *   - Redirect sau login (returnUrl)
 */
import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  AbstractControl, ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

// ─── Custom Validator ────────────────────────────────────────────
/**
 * 📖 Bài 07: Custom validator — function nhận AbstractControl
 * Trả về ValidationErrors (object) nếu lỗi, null nếu hợp lệ
 */
function forbiddenEmail(control: AbstractControl): ValidationErrors | null {
  const forbidden = ['test@test.com', 'admin@admin.com'];
  if (forbidden.includes(control.value?.toLowerCase())) {
    return { forbiddenEmail: true };  // Key dùng để check trong template
  }
  return null;  // Hợp lệ
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule,
  ],
  template: `
    <div class="container" style="max-width: 400px; margin-top: 40px">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Đăng nhập</mat-card-title>
        </mat-card-header>

        <!-- 📖 Bài 07: [formGroup] bind FormGroup, (ngSubmit) handle submit -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-card-content>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <!-- 📖 Bài 07: formControlName — bind field trong FormGroup -->
              <input matInput formControlName="email" type="email" />

              <!-- 📖 Bài 07: Hiển thị lỗi — check errors + touched -->
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email bắt buộc</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Email không đúng định dạng</mat-error>
              }
              @if (form.get('email')?.hasError('forbiddenEmail') && form.get('email')?.touched) {
                <mat-error>Email này không được phép sử dụng</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mật khẩu</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput formControlName="password"
                     [type]="showPassword() ? 'text' : 'password'" />
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Mật khẩu bắt buộc</mat-error>
              }
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Mật khẩu ít nhất 6 ký tự</mat-error>
              }
            </mat-form-field>

          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="form.invalid || loading()" class="full-width">
              <mat-icon>login</mat-icon>
              {{ loading() ? 'Đang xử lý...' : 'Đăng nhập' }}
            </button>
          </mat-card-actions>
        </form>

        <div style="text-align: center; margin-top: 8px">
          <a mat-button routerLink="/auth/register">Chưa có tài khoản? Đăng ký</a>
        </div>

        <!-- Gợi ý test -->
        <p style="font-size: 12px; color: grey; margin-top: 8px; text-align: center">
          Nhập email bất kỳ (có "admin" = role admin) + password bất kỳ
        </p>
      </mat-card>
    </div>
  `,
  styles: [`.full-width { width: 100%; }`],
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly showPassword = signal(false);
  readonly loading = signal(false);

  /**
   * 📖 Bài 07: FormBuilder tạo form
   *
   * Validators:
   *   - Validators.required: Bắt buộc
   *   - Validators.email: Kiểm tra format email
   *   - Validators.minLength(6): Ít nhất 6 ký tự
   *   - forbiddenEmail: Custom validator (xem hàm ở trên)
   */
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, forbiddenEmail]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.value;

    // Giả lập async login
    setTimeout(() => {
      const success = this.auth.login(email!, password!);
      this.loading.set(false);

      if (success) {
        this.notify.success(`Chào mừng ${this.auth.userName()}!`);
        // 📖 Bài 06: Redirect về returnUrl sau login
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.notify.error('Đăng nhập thất bại');
      }
    }, 500);
  }
}
