/**
 * ===================================================================
 * HighlightDirective — Custom Attribute Directive
 * 📖 Lý thuyết: 04-directives-pipes.md (Custom directive)
 * ===================================================================
 *
 * Directive thay đổi hành vi/giao diện của element.
 * KHÔNG có template (khác với Component).
 *
 * Ví dụ: Highlight background khi hover, có thể tùy chỉnh màu.
 *
 * Dùng:
 *   <p appHighlight>Highlight mặc định (vàng)</p>
 *   <p appHighlight [highlightColor]="'lightblue'">Highlight xanh</p>
 *   <p appHighlight [highlightColor]="'pink'" [textColor]="'white'">Tùy chỉnh</p>
 *
 * Concepts:
 *   - @Directive với selector (attribute selector)
 *   - ElementRef để truy cập DOM element
 *   - @HostListener để lắng nghe DOM events
 *   - input() signal-based input (Angular 17+)
 */
import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  // 📖 Bài 04: selector dùng [] cho attribute directive
  // Dùng trong template: <p appHighlight>
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {

  // 📖 Bài 03: input() — signal-based input (Angular 17+), type-safe
  highlightColor = input<string>('yellow');   // Mặc định vàng
  textColor = input<string>('');              // Mặc định giữ nguyên

  // 📖 Bài 04: ElementRef — tham chiếu đến DOM element
  // CHÚ Ý: Truy cập nativeElement trực tiếp không an toàn cho SSR
  // Dùng Renderer2 nếu cần SSR support
  constructor(private readonly el: ElementRef<HTMLElement>) {}

  // 📖 Bài 04: @HostListener — lắng nghe event trên host element
  // Khi mouse vào → đổi màu nền
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.highlight(this.highlightColor(), this.textColor());
  }

  // Khi mouse ra → xóa highlight
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.highlight('', '');
  }

  private highlight(bgColor: string, txtColor: string): void {
    this.el.nativeElement.style.backgroundColor = bgColor;
    this.el.nativeElement.style.transition = 'background-color 0.3s ease';
    if (txtColor) {
      this.el.nativeElement.style.color = txtColor;
    }
  }
}
