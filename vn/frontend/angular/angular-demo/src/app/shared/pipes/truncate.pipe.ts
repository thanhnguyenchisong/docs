/**
 * ===================================================================
 * TruncatePipe — Custom Pure Pipe
 * 📖 Lý thuyết: 04-directives-pipes.md (Custom Pipe, Pure vs Impure)
 * ===================================================================
 *
 * Pipe biến đổi giá trị hiển thị trong template.
 * Không thay đổi dữ liệu gốc — chỉ transform cho display.
 *
 * Dùng:
 *   {{ longText | truncate }}           → cắt tại 50 ký tự + '...'
 *   {{ longText | truncate:30 }}        → cắt tại 30 ký tự
 *   {{ longText | truncate:30:'---' }}  → cắt tại 30 ký tự + '---'
 *
 * Pure vs Impure:
 *   📖 Bài 04: Pure (mặc định) — chỉ chạy lại khi input REFERENCE đổi
 *   Impure (pure: false) — chạy mỗi change detection (tránh dùng)
 *
 * Chaining:
 *   {{ name | uppercase | truncate:20 }}
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  // pure: true  ← mặc định, không cần khai báo
  // 📖 Bài 04: Pure pipe — Angular cache kết quả theo input reference
  // Nếu input không đổi → không gọi lại transform() → tốt cho performance
})
export class TruncatePipe implements PipeTransform {

  /**
   * 📖 Bài 04: PipeTransform interface — bắt buộc implement transform()
   *
   * @param value - Giá trị đầu vào (từ template, bên trái dấu |)
   * @param limit - Số ký tự tối đa (tham số 1, sau dấu :)
   * @param suffix - Ký tự thay thế phần bị cắt (tham số 2)
   */
  transform(value: string | null | undefined, limit = 50, suffix = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.slice(0, limit).trimEnd() + suffix;
  }
}

/**
 * ===================================================================
 * VndPipe — Format tiền VND
 * ===================================================================
 * Ví dụ pipe format tiền tệ Việt Nam
 * Dùng: {{ 1500000 | vnd }} → "1.500.000 ₫"
 */
@Pipe({ name: 'vnd', standalone: true })
export class VndPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
}

/**
 * ===================================================================
 * TimeAgoPipe — Hiển thị "X phút trước"
 * ===================================================================
 * Ví dụ impure pipe — chạy mỗi change detection
 * CHÚ Ý: Impure pipe ảnh hưởng performance, dùng cẩn thận
 *
 * Dùng: {{ dateString | timeAgo }} → "5 phút trước"
 */
@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false,  // 📖 Bài 04: Impure — chạy mỗi CD để cập nhật thời gian
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
  }
}
