/**
 * ===================================================================
 * ProductFormComponent — Reactive Form (tạo/sửa sản phẩm)
 * 📖 Lý thuyết:
 *   - 07-forms.md (Reactive Forms, Validation, FormArray, FormBuilder)
 *   - 07-forms.md Senior (ControlValueAccessor, Async validator)
 * ===================================================================
 *
 * Minh họa Reactive Forms đầy đủ:
 *   1. FormBuilder — tạo FormGroup gọn
 *   2. Validators — built-in và custom
 *   3. FormArray — danh sách tags động (thêm/xóa)
 *   4. Error display — kiểm tra touched + errors
 *   5. Custom form control — StarRating (CVA)
 *   6. Form submit — lấy value, validate
 *   7. CanDeactivate guard — cảnh báo form dirty
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { NotificationService } from '@core/services/notification.service';
import { HasUnsavedChanges } from '@core/guards/auth.guard';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,    // 📖 Bài 07: Import ReactiveFormsModule cho [formGroup], formControlName
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule,
    StarRatingComponent,    // 📖 Bài 07: Custom CVA form control
  ],
  template: `
    <div class="container" style="max-width: 600px">
      <h1>Tạo sản phẩm mới</h1>

      <!--
        📖 Bài 07: [formGroup]="form" — bind FormGroup vào template
        (ngSubmit) — gọi handler khi submit
      -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-content>

            <!-- ═══ Tên sản phẩm ═══ -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tên sản phẩm</mat-label>
              <!-- 📖 Bài 07: formControlName — bind control trong FormGroup -->
              <input matInput formControlName="name" placeholder="Nhập tên sản phẩm" />
              <!--
                📖 Bài 07: Hiển thị lỗi — kiểm tra touched + errors
                Chỉ hiện lỗi sau khi user đã tương tác (touched)
              -->
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Tên không được để trống</mat-error>
              }
              @if (form.get('name')?.hasError('minlength') && form.get('name')?.touched) {
                <mat-error>Tên phải có ít nhất 3 ký tự</mat-error>
              }
            </mat-form-field>

            <!-- ═══ Mô tả ═══ -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mô tả</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <!-- ═══ Giá + Tồn kho (2 cột) ═══ -->
            <div class="flex gap-md">
              <mat-form-field appearance="outline" style="flex: 1">
                <mat-label>Giá (VND)</mat-label>
                <input matInput type="number" formControlName="price" />
                @if (form.get('price')?.hasError('min')) {
                  <mat-error>Giá phải lớn hơn 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" style="flex: 1">
                <mat-label>Tồn kho</mat-label>
                <input matInput type="number" formControlName="stock" />
              </mat-form-field>
            </div>

            <!-- ═══ Danh mục (select) ═══ -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Danh mục</mat-label>
              <mat-select formControlName="category">
                @for (cat of categories; track cat) {
                  <mat-option [value]="cat">{{ cat }}</mat-option>
                }
              </mat-select>
              @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
                <mat-error>Chọn danh mục</mat-error>
              }
            </mat-form-field>

            <!-- ═══ Rating — Custom Form Control (CVA) ═══ -->
            <!--
              📖 Bài 07 Senior: ControlValueAccessor cho phép dùng formControlName
              trên custom component — star-rating tích hợp Reactive Forms
            -->
            <div style="margin-bottom: 16px">
              <label>Rating:</label>
              <app-star-rating formControlName="rating" [maxStars]="5" />
            </div>

            <!-- ═══ Tags — FormArray (danh sách động) ═══ -->
            <!--
              📖 Bài 07: FormArray — quản lý danh sách field động
              Có thể thêm/xóa field tại runtime
            -->
            <div style="margin-bottom: 16px">
              <label>Tags:</label>
              <!-- 📖 Bài 07: formArrayName — bind FormArray -->
              <div formArrayName="tags">
                @for (tag of tags.controls; track $index; let i = $index) {
                  <div class="flex gap-sm" style="margin-bottom: 4px">
                    <!-- 📖 Bài 07: [formControlName]="i" — bind control theo index -->
                    <mat-form-field appearance="outline" style="flex: 1">
                      <input matInput [formControlName]="i" placeholder="Tag..." />
                    </mat-form-field>
                    <button mat-icon-button type="button" color="warn" (click)="removeTag(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-button type="button" (click)="addTag()">
                <mat-icon>add</mat-icon> Thêm tag
              </button>
            </div>

          </mat-card-content>

          <mat-card-actions>
            <!--
              📖 Bài 07: [disabled]="form.invalid" — disable khi form chưa hợp lệ
            -->
            <button mat-raised-button color="primary"
                    type="submit" [disabled]="form.invalid || submitted()">
              <mat-icon>save</mat-icon> Lưu sản phẩm
            </button>
            <button mat-button type="button" (click)="onReset()">Reset</button>
          </mat-card-actions>
        </mat-card>
      </form>

      <!-- Debug: Hiển thị form value (development) -->
      <pre style="margin-top: 16px; font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 4px;">
Form valid: {{ form.valid }}
Form dirty: {{ form.dirty }}
Form value: {{ form.value | json }}
      </pre>
    </div>
  `,
  styles: [`
    .full-width { width: 100%; }
  `],
})
export class ProductFormComponent implements HasUnsavedChanges {

  // 📖 Bài 07: FormBuilder — helper tạo FormGroup gọn hơn new FormGroup(...)
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly submitted = signal(false);
  readonly categories = ['Laptop', 'Phone', 'Audio', 'Tablet', 'Accessories'];

  // ─── Reactive Form ─────────────────────────────────────────────
  /**
   * 📖 Bài 07: fb.group({...}) — tạo FormGroup
   * Mỗi key là một FormControl: [initialValue, validators]
   *
   * Validators:
   *   - Validators.required: Bắt buộc nhập
   *   - Validators.minLength(n): Độ dài tối thiểu
   *   - Validators.min(n): Giá trị số tối thiểu
   *   - Validators.pattern(regex): Khớp regex
   *   - Custom validator: function nhận AbstractControl
   */
  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    rating: [0],

    // 📖 Bài 07: FormArray — danh sách FormControl
    tags: this.fb.array([
      this.fb.control(''),    // Tag đầu tiên (mặc định)
    ]),
  });

  // ─── FormArray getter ──────────────────────────────────────────
  // 📖 Bài 07: Cast sang FormArray để dùng .controls, .push(), .removeAt()
  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  // ─── FormArray methods ─────────────────────────────────────────
  addTag(): void {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  // ─── Submit ────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      // 📖 Bài 07: markAllAsTouched — hiển thị tất cả lỗi
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
    console.log('[ProductForm] Submit:', this.form.value);
    this.notify.success('Sản phẩm đã được tạo!');

    // Reset form sau khi submit thành công
    setTimeout(() => {
      this.form.reset();
      this.submitted.set(false);
      this.router.navigate(['/products']);
    }, 1000);
  }

  onReset(): void {
    this.form.reset();
  }

  // ─── CanDeactivate guard ───────────────────────────────────────
  // 📖 Bài 06: Cảnh báo khi rời trang có form chưa lưu
  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.submitted();
  }
}
