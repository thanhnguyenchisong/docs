/**
 * ===================================================================
 * HomeComponent — Trang chủ: Demo Components & Templates
 * 📖 Lý thuyết:
 *   - 02-angular-fundamentals.md (Lifecycle hooks)
 *   - 03-components-templates.md (Data binding, Input/Output, ViewChild, signals)
 *   - 04-directives-pipes.md (Control flow @if/@for/@switch, ngClass, pipes)
 *   - 15-master-angular.md (ChangeDetectionStrategy.OnPush, signals)
 * ===================================================================
 *
 * Component này là "playground" minh họa hầu hết concepts cơ bản:
 *   1. Tất cả loại data binding
 *   2. Control flow mới (Angular 17+): @if, @for, @switch
 *   3. Signals: signal(), computed(), effect()
 *   4. Lifecycle hooks: ngOnInit, ngOnDestroy
 *   5. ViewChild
 *   6. Custom directive & pipe
 *   7. OnPush change detection
 *   8. Content projection (ng-content)
 */
import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  signal, computed, effect, ChangeDetectionStrategy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { HighlightDirective } from '@shared/directives/highlight.directive';
import { TruncatePipe, VndPipe } from '@shared/pipes/truncate.pipe';
import { fadeInOut, listAnimation, expandCollapse } from '@shared/animations/route.animations';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatDividerModule,
    HighlightDirective,     // 📖 Bài 04: Custom directive
    TruncatePipe, VndPipe,  // 📖 Bài 04: Custom pipes
  ],
  // 📖 Bài 15: OnPush — CD chỉ chạy khi input đổi, event, async pipe, markForCheck
  // Với signals: template đọc signal() → Angular tự track dependency
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut, listAnimation, expandCollapse],
  template: `
    <div class="container">
      <h1>Angular Demo — Trang chủ</h1>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 1. DATA BINDING — 📖 Bài 03                           -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>1. Data Binding (Bài 03)</h2>

        <!-- 📖 Bài 03: {{ expression }} — Interpolation: Component → DOM -->
        <p>Tên app: {{ appName }}</p>

        <!-- 📖 Bài 03: [property]="expr" — Property binding: Component → DOM -->
        <img [src]="logoUrl" [alt]="appName" width="50" />

        <!-- 📖 Bài 03: (event)="handler()" — Event binding: DOM → Component -->
        <button mat-raised-button color="primary" (click)="onGreet()">
          Click để chào ({{ clickCount() }} lần)
        </button>

        <!-- 📖 Bài 03: [class.active]="expr" — class binding -->
        <p [class.highlight]="clickCount() > 3">
          Click hơn 3 lần sẽ highlight dòng này
        </p>

        <!-- 📖 Bài 04: [ngClass] — attribute directive thêm/bớt nhiều class -->
        <p [ngClass]="{ 'text-success': clickCount() > 5, 'text-danger': clickCount() <= 5 }">
          ngClass demo: {{ clickCount() > 5 ? 'Nhiều click!' : 'Click thêm...' }}
        </p>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 2. SIGNALS — 📖 Bài 15                                -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>2. Signals (Bài 15)</h2>

        <!-- 📖 Bài 15: Đọc signal trong template bằng count() -->
        <p>Counter: <strong>{{ count() }}</strong></p>
        <p>Double (computed): <strong>{{ doubleCount() }}</strong></p>
        <p>Message (computed): {{ countMessage() }}</p>

        <div class="flex gap-sm">
          <button mat-raised-button (click)="increment()">+1</button>
          <button mat-raised-button (click)="decrement()">-1</button>
          <button mat-button (click)="reset()">Reset</button>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 3. CONTROL FLOW MỚI — 📖 Bài 03, 04                  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>3. Control Flow &#64;if / &#64;for / &#64;switch (Bài 03, 04)</h2>

        <!-- 📖 Bài 03: @if — thay thế *ngIf, không cần import NgIf -->
        @if (showProducts()) {
          <p>Đang hiển thị {{ products.length }} sản phẩm</p>
        } @else {
          <p>Sản phẩm đã ẩn. <button mat-button (click)="toggleProducts()">Hiển thị</button></p>
        }
        @if (showProducts()) {
          <button mat-button (click)="toggleProducts()">Ẩn sản phẩm</button>
        }

        <!-- 📖 Bài 03: @for — thay thế *ngFor -->
        <!-- 📖 Bài 04: track — bắt buộc, giúp Angular tái sử dụng DOM node -->
        @if (showProducts()) {
          <div @listAnimation class="product-grid">
            @for (product of products; track product.id; let i = $index, last = $last) {
              <mat-card class="product-card" @fadeInOut>
                <mat-card-header>
                  <mat-card-title>
                    {{ i + 1 }}. {{ product.name }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <!-- 📖 Bài 04: Pipe chaining — truncate rồi hiển thị -->
                  <p>{{ product.description | truncate:40 }}</p>
                  <!-- 📖 Bài 04: Custom pipe vnd — format tiền VND -->
                  <p class="price">{{ product.price | vnd }}</p>
                  <!-- 📖 Bài 04: [appHighlight] — custom attribute directive -->
                  <p appHighlight [highlightColor]="'#e3f2fd'">
                    Hover vào đây (directive demo)
                  </p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="addToCart(product)">
                    <mat-icon>add_shopping_cart</mat-icon> Thêm vào giỏ
                  </button>
                </mat-card-actions>
                <!-- 📖 Bài 03: @for có biến $last — check phần tử cuối -->
                @if (!last) {
                  <mat-divider />
                }
              </mat-card>
            } @empty {
              <!-- 📖 Bài 03: @empty — hiển thị khi list rỗng -->
              <p>Không có sản phẩm nào.</p>
            }
          </div>
        }

        <!-- 📖 Bài 03: @switch — thay thế *ngSwitch -->
        <h3>Switch demo:</h3>
        @switch (currentTab()) {
          @case ('info') {
            <p>Tab thông tin</p>
          }
          @case ('specs') {
            <p>Tab thông số kỹ thuật</p>
          }
          @default {
            <p>Tab mặc định</p>
          }
        }
        <div class="flex gap-sm">
          <button mat-button (click)="currentTab.set('info')">Info</button>
          <button mat-button (click)="currentTab.set('specs')">Specs</button>
          <button mat-button (click)="currentTab.set('other')">Other</button>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 4. EXPAND / COLLAPSE ANIMATION — 📖 Bài 11            -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>4. Animation: Expand / Collapse (Bài 11)</h2>
        <button mat-raised-button (click)="expanded.set(!expanded())">
          {{ expanded() ? 'Thu gọn' : 'Mở rộng' }}
        </button>
        <!-- 📖 Bài 11: state-based animation — 'expanded' | 'collapsed' -->
        <div [@expandCollapse]="expanded() ? 'expanded' : 'collapsed'">
          <div class="card" style="margin-top: 8px; background: #e8f5e9;">
            <p>Nội dung ẩn — hiển thị với animation mượt mà.</p>
            <p>Đây là ví dụ dùng state() + transition() trong Angular Animations.</p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 5. VIEWCHILD — 📖 Bài 03                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>5. ViewChild & Template Reference (Bài 03)</h2>
        <!-- 📖 Bài 03: #searchInput — template reference variable -->
        <input #searchInput placeholder="Gõ gì đó..." />
        <!-- 📖 Bài 03: Dùng template ref trực tiếp trong template -->
        <button mat-button (click)="searchInput.focus()">Focus input</button>
        <button mat-button (click)="focusAndLog()">Focus + Log (ViewChild)</button>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 6. NAVIGATION LINKS — 📖 Bài 06                       -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="card">
        <h2>6. Navigation (Bài 06)</h2>
        <div class="flex gap-sm wrap">
          <a mat-raised-button routerLink="/products">Danh sách sản phẩm</a>
          <a mat-raised-button routerLink="/products/grid">AG-Grid Demo</a>
          <a mat-raised-button routerLink="/products/new" color="primary">Tạo sản phẩm (cần login)</a>
          <a mat-raised-button routerLink="/dashboard" color="accent">Dashboard (cần login)</a>
          <a mat-raised-button routerLink="/auth/login">Đăng nhập</a>
          <a mat-raised-button routerLink="/auth/register">Đăng ký</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    section { margin-bottom: 16px; }
    .product-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
    .product-card { width: 280px; }
    .price { color: var(--color-primary); font-weight: bold; font-size: 1.1em; }
    .highlight { background-color: #fff3e0; padding: 4px 8px; border-radius: 4px; }
    .text-success { color: #4caf50; }
    .text-danger { color: #f44336; }
    h2 { margin-bottom: 8px; color: var(--color-primary); }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {

  // ─── Injected services ─────────────────────────────────────────
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);

  // ─── Simple properties (data binding) ──────────────────────────
  readonly appName = 'Angular Demo';
  readonly logoUrl = 'https://angular.dev/assets/images/press-kit/angular_icon_gradient.gif';

  // ─── Signals ───────────────────────────────────────────────────
  // 📖 Bài 15: signal() — writable reactive state
  readonly count = signal(0);
  readonly clickCount = signal(0);
  readonly showProducts = signal(true);
  readonly currentTab = signal<string>('info');
  readonly expanded = signal(false);

  // 📖 Bài 15: computed() — derived state, memoized
  readonly doubleCount = computed(() => this.count() * 2);
  readonly countMessage = computed(() => {
    const c = this.count();
    if (c === 0) return 'Chưa click lần nào';
    if (c > 10) return 'Bạn click nhiều quá!';
    return `Đã click ${c} lần`;
  });

  // Mock products
  products: Product[] = [];

  // 📖 Bài 03: @ViewChild — tham chiếu đến element trong template
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor() {
    // 📖 Bài 15: effect() — side effect khi signal đổi
    effect(() => {
      console.log(`[HomeComponent] count = ${this.count()}, double = ${this.doubleCount()}`);
    });
  }

  // ─── Lifecycle ─────────────────────────────────────────────────
  // 📖 Bài 02: ngOnInit — gọi sau constructor, input đã có giá trị
  ngOnInit(): void {
    console.log('[HomeComponent] ngOnInit');
    this.products = this.productService.getMockProducts();
  }

  // 📖 Bài 02: ngOnDestroy — cleanup, unsubscribe
  ngOnDestroy(): void {
    console.log('[HomeComponent] ngOnDestroy — cleanup');
  }

  // ─── Event handlers ────────────────────────────────────────────

  increment(): void { this.count.update(v => v + 1); }
  decrement(): void { this.count.update(v => v - 1); }
  reset(): void { this.count.set(0); }

  onGreet(): void {
    this.clickCount.update(v => v + 1);
  }

  toggleProducts(): void {
    this.showProducts.update(v => !v);
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }

  // 📖 Bài 03: ViewChild — truy cập DOM element từ code
  focusAndLog(): void {
    this.searchInputRef.nativeElement.focus();
    console.log('[ViewChild] Input value:', this.searchInputRef.nativeElement.value);
  }
}
