/**
 * ===================================================================
 * DashboardComponent — RxJS Advanced + State Management
 * 📖 Lý thuyết:
 *   - 09-rxjs-angular.md (combineLatest, forkJoin, withLatestFrom, shareReplay)
 *   - 10-state-architecture.md (Service-based state)
 *   - 15-master-angular.md (Signals, toSignal)
 * ===================================================================
 *
 * Component này demo các RxJS patterns quan trọng:
 *   1. forkJoin — load song song nhiều API
 *   2. combineLatest — kết hợp nhiều stream
 *   3. toSignal — chuyển Observable → Signal
 *   4. Service-based state — đọc signals từ CartService
 *
 * Pattern: Smart Component — lấy data, xử lý logic
 */
import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, interval, of, timer } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { VndPipe } from '@shared/pipes/truncate.pipe';
import { CartService } from '@core/services/cart.service';
import { AuthService } from '@core/services/auth.service';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule, MatListModule,
    MatProgressSpinnerModule, VndPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>Dashboard — RxJS & State Demo</h1>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 1. SERVICE STATE (Signals) — 📖 Bài 10, 15           -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="stats-grid">
        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>person</mat-icon>
              <!--
                📖 Bài 15: Đọc signal từ service trực tiếp trong template
                auth.userName() — computed signal
              -->
              <h3>{{ auth.userName() }}</h3>
              <p>{{ auth.isAdmin() ? 'Admin' : 'User' }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>shopping_cart</mat-icon>
              <!-- 📖 Bài 10: Signals từ CartService -->
              <h3>{{ cart.itemCount() }} sản phẩm</h3>
              <p>{{ cart.totalPrice() | vnd }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>inventory</mat-icon>
              <!-- 📖 Bài 15: toSignal() — Observable → Signal -->
              <h3>{{ productCount() }} sản phẩm</h3>
              <p>Trong kho</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>schedule</mat-icon>
              <!-- 📖 Bài 15: toSignal + interval → live clock -->
              <h3>{{ currentTime() }}</h3>
              <p>Giờ hiện tại (RxJS interval)</p>
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 2. FORKJOIN RESULT — 📖 Bài 09                       -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <h2>forkJoin — Load song song (Bài 09)</h2>
        @if (dashboardLoading()) {
          <mat-spinner diameter="30" />
        } @else {
          <div class="stats-grid">
            @for (stat of dashboardStats(); track stat.label) {
              <mat-card>
                <mat-card-content>
                  <div class="stat">
                    <mat-icon>{{ stat.icon }}</mat-icon>
                    <h3>{{ stat.value }}</h3>
                    <p>{{ stat.label }}</p>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- 3. CART ITEMS (State) — 📖 Bài 10                    -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <h2>Giỏ hàng — Service State (Bài 10)</h2>
        @if (cart.isEmpty()) {
          <p>Giỏ hàng trống. Thêm sản phẩm từ trang chủ.</p>
        } @else {
          <mat-list>
            @for (item of cart.items(); track item.product.id) {
              <mat-list-item>
                <span matListItemTitle>{{ item.product.name }}</span>
                <span matListItemLine>
                  {{ item.quantity }} x {{ item.product.price | vnd }}
                </span>
                <button matListItemMeta mat-icon-button color="warn"
                        (click)="cart.remove(item.product.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-list-item>
            }
          </mat-list>
          <p><strong>Tổng: {{ cart.totalPriceFormatted() }}</strong></p>
          <button mat-button color="warn" (click)="cart.clear()">Xóa giỏ hàng</button>
        }
      </section>
    </div>
  `,
  styles: [`
    section { margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .stat { text-align: center; padding: 8px; }
    .stat mat-icon { font-size: 36px; height: 36px; width: 36px; color: var(--color-primary); }
    .stat h3 { margin: 4px 0; }
    .stat p { color: var(--color-text-secondary); margin: 0; }
    h2 { color: var(--color-primary); margin-bottom: 12px; }
  `],
})
export class DashboardComponent implements OnInit {

  // ─── Injected services ─────────────────────────────────────────
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── State ─────────────────────────────────────────────────────
  readonly dashboardLoading = signal(true);
  readonly dashboardStats = signal<{ icon: string; label: string; value: string }[]>([]);

  // ─── toSignal: Observable → Signal ─────────────────────────────
  /**
   * 📖 Bài 15: toSignal() — chuyển Observable thành Signal
   * Không cần async pipe, không cần subscribe/unsubscribe
   * Signal luôn có giá trị (initialValue dùng khi chưa emit)
   */
  readonly productCount = toSignal(
    of(this.productService.getMockProducts().length),
    { initialValue: 0 },
  );

  /**
   * 📖 Bài 09: interval(1000) — emit mỗi giây
   * 📖 Bài 15: toSignal — convert thành signal để template đọc
   */
  readonly currentTime = toSignal(
    interval(1000).pipe(
      startWith(0),
      map(() => new Date().toLocaleTimeString('vi-VN')),
    ),
    { initialValue: new Date().toLocaleTimeString('vi-VN') },
  );

  // ─── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * forkJoin — Load song song nhiều nguồn dữ liệu
   * 📖 Bài 09: forkJoin chờ TẤT CẢ source complete rồi emit kết quả
   * Giống Promise.all — dùng khi cần load nhiều API cùng lúc
   * ═══════════════════════════════════════════════════════════════
   */
  private loadDashboardData(): void {
    // Giả lập nhiều API calls song song
    const products$ = of(this.productService.getMockProducts());
    const categories$ = of(['Laptop', 'Phone', 'Audio']);
    const revenue$ = timer(500).pipe(map(() => 125000000));  // Giả lập API chậm 500ms

    // 📖 Bài 09: forkJoin — object syntax, typed result
    forkJoin({
      products: products$,
      categories: categories$,
      revenue: revenue$,
    }).pipe(
      // 📖 Bài 09: takeUntilDestroyed — tự unsubscribe khi component destroy
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ products, categories, revenue }) => {
        // Tính stats từ kết quả forkJoin
        const stats = [
          { icon: 'category', label: 'Danh mục', value: categories.length.toString() },
          { icon: 'trending_up', label: 'Doanh thu tháng', value: this.formatVnd(revenue) },
          { icon: 'star', label: 'Rating TB', value: this.avgRating(products).toFixed(1) },
          { icon: 'warning', label: 'Sắp hết hàng', value: products.filter(p => p.stock < 10).length.toString() },
        ];
        this.dashboardStats.set(stats);
        this.dashboardLoading.set(false);
      },
      error: (err) => {
        console.error('[Dashboard] forkJoin error:', err);
        this.dashboardLoading.set(false);
      },
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────
  private avgRating(products: Product[]): number {
    if (!products.length) return 0;
    return products.reduce((sum, p) => sum + p.rating, 0) / products.length;
  }

  private formatVnd(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
