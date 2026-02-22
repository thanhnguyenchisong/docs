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
 *   - @Directive với selector (attribute selector, prefix app)
 *   - Renderer2 thay vì nativeElement.style — bảo mật, SSR-safe
 *   - @HostListener để lắng nghe DOM events
 *   - input() signal-based input (Angular 17+)
 */
import { Directive, ElementRef, HostListener, Renderer2, input } from '@angular/core';

@Directive({
  // 📖 Bài 04: selector rõ ràng, prefix app (project convention)
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {

  highlightColor = input<string>('yellow');
  textColor = input<string>('');

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.highlight(this.highlightColor(), this.textColor());
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.highlight('', '');
  }

  private highlight(bgColor: string, txtColor: string): void {
    const native = this.el.nativeElement;
    this.renderer.setStyle(native, 'backgroundColor', bgColor);
    this.renderer.setStyle(native, 'transition', 'background-color 0.3s ease');
    if (txtColor) {
      this.renderer.setStyle(native, 'color', txtColor);
    } else {
      this.renderer.removeStyle(native, 'color');
    }
  }
}
