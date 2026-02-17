/**
 * ===================================================================
 * RegisterComponent — Template-driven Form demo
 * 📖 Lý thuyết: 07-forms.md (Template-driven forms)
 * ===================================================================
 *
 * So sánh với LoginComponent (Reactive Forms):
 *   - Template-driven: Logic form trong template (ngModel, #form="ngForm")
 *   - Reactive: Logic form trong class (FormGroup, FormControl)
 *
 * Template-driven phù hợp form đơn giản, ít logic.
 * Reactive phù hợp form phức tạp, test dễ.
 *
 * Cần import FormsModule (cho ngModel, ngForm).
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,    // 📖 Bài 07: FormsModule cho ngModel, ngForm
    RouterLink, CommonModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatIconModule, MatCheckboxModule,
  ],
  template: `
    <div class="container" style="max-width: 400px; margin-top: 40px">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Đăng ký tài khoản</mat-card-title>
        </mat-card-header>

        <!--
          📖 Bài 07: Template-driven form
          #f="ngForm" — tham chiếu đến NgForm directive
          (ngSubmit) — handle submit, truyền form reference
        -->
        <form #f="ngForm" (ngSubmit)="onSubmit(f)">
          <mat-card-content>

            <!-- 📖 Bài 07: ngModel + name — two-way binding + đăng ký vào form -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Họ tên</mat-label>
              <input matInput name="name" ngModel required minlength="2"
                     #nameInput="ngModel" />
              <!--
                📖 Bài 07: #nameInput="ngModel" — tham chiếu đến NgModel directive
                Kiểm tra .invalid và .touched để hiển thị lỗi
              -->
              @if (nameInput.invalid && nameInput.touched) {
                <mat-error>Họ tên ít nhất 2 ký tự</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <!-- 📖 Bài 07: required, email — validation directives -->
              <input matInput name="email" ngModel required email type="email" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mật khẩu</mat-label>
              <input matInput name="password" ngModel required minlength="6"
                     [type]="showPassword() ? 'text' : 'password'" />
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <!-- 📖 Bài 07: [(ngModel)] — two-way binding -->
            <mat-checkbox name="terms" ngModel required>
              Tôi đồng ý với điều khoản sử dụng
            </mat-checkbox>

          </mat-card-content>

          <mat-card-actions>
            <!--
              📖 Bài 07: f.invalid — kiểm tra form hợp lệ từ template ref
            -->
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="f.invalid" class="full-width">
              <mat-icon>person_add</mat-icon> Đăng ký
            </button>
          </mat-card-actions>
        </form>

        <div style="text-align: center; margin-top: 8px">
          <a mat-button routerLink="/auth/login">Đã có tài khoản? Đăng nhập</a>
        </div>

        <!--
          Debug: Hiển thị form value (development)
          📖 Bài 07: f.value — giá trị form hiện tại
        -->
        <pre style="font-size: 11px; margin-top: 8px; background: #f5f5f5; padding: 8px;">
Form valid: {{ f.valid }}
Form value: {{ f.value | json }}
        </pre>
      </mat-card>
    </div>
  `,
  styles: [`.full-width { width: 100%; }`],
})
export class RegisterComponent {

  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly showPassword = signal(false);

  /**
   * 📖 Bài 07: Template-driven submit
   * Nhận NgForm reference, đọc .value và .valid
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    console.log('[Register] Form value:', form.value);
    this.notify.success('Đăng ký thành công! Hãy đăng nhập.');
    this.router.navigate(['/auth/login']);
  }
}
