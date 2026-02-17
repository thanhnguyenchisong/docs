/**
 * ===================================================================
 * StarRatingComponent — Custom Form Control (ControlValueAccessor)
 * 📖 Lý thuyết: 07-forms.md (Senior/Master → ControlValueAccessor)
 * ===================================================================
 *
 * ControlValueAccessor (CVA) là interface để tạo custom form control
 * tích hợp với Angular Reactive Forms.
 *
 * Sau khi implement CVA, component có thể dùng:
 *   - [formControlName]="'rating'"
 *   - [(ngModel)]="rating"
 *
 * Interface cần implement:
 *   1. writeValue(value): Angular gọi khi form set giá trị (setValue, patchValue)
 *   2. registerOnChange(fn): Đăng ký callback — gọi fn khi giá trị thay đổi
 *   3. registerOnTouched(fn): Đăng ký callback — gọi fn khi control touched
 *   4. setDisabledState(disabled): Optional — toggle disabled
 *
 * Đăng ký: providers → NG_VALUE_ACCESSOR (multi: true)
 */
import {
  Component, forwardRef, signal, input,
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [MatIconModule],
  // 📖 Bài 07: Đăng ký component làm form control
  // NG_VALUE_ACCESSOR với multi: true — nhiều component cùng token
  // forwardRef vì class chưa khai báo tại thời điểm này
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true,
    },
  ],
  template: `
    <!--
      📖 Bài 03: @for — control flow mới (Angular 17+)
      track $index vì [1,2,3,4,5] là primitive
    -->
    @for (star of stars; track $index) {
      <mat-icon
        class="star"
        [class.filled]="star <= value()"
        [class.disabled]="disabled()"
        (click)="onStarClick(star)"
        (mouseenter)="onHover(star)"
        (mouseleave)="onHover(0)">
        {{ star <= (hoverValue() || value()) ? 'star' : 'star_border' }}
      </mat-icon>
    }
  `,
  styles: [`
    :host { display: inline-flex; gap: 2px; cursor: pointer; }
    .star { color: #ccc; transition: color 0.2s; user-select: none; }
    .star.filled, .star:hover { color: #ffc107; }
    .star.disabled { cursor: not-allowed; opacity: 0.5; }
  `],
})
export class StarRatingComponent implements ControlValueAccessor {

  // Input: số sao tối đa
  maxStars = input<number>(5);

  // Internal state dùng signals
  readonly value = signal(0);
  readonly hoverValue = signal(0);
  readonly disabled = signal(false);

  // Computed: mảng [1, 2, 3, 4, 5]
  get stars(): number[] {
    return Array.from({ length: this.maxStars() }, (_, i) => i + 1);
  }

  // ─── CVA callbacks (Angular set) ───────────────────────────────
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // ─── CVA Interface ─────────────────────────────────────────────

  /** 📖 Bài 07: Angular gọi khi form set giá trị */
  writeValue(value: number): void {
    this.value.set(value ?? 0);
  }

  /** 📖 Bài 07: Đăng ký callback — gọi khi giá trị thay đổi */
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  /** 📖 Bài 07: Đăng ký callback — gọi khi control touched */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** 📖 Bài 07: Toggle disabled state */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ─── User interaction ──────────────────────────────────────────

  onStarClick(star: number): void {
    if (this.disabled()) return;
    this.value.set(star);
    this.onChange(star);     // Thông báo cho form: giá trị đổi
    this.onTouched();        // Thông báo cho form: đã touched
  }

  onHover(star: number): void {
    if (this.disabled()) return;
    this.hoverValue.set(star);
  }
}
