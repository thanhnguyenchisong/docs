/**
 * ===================================================================
 * ProductListComponent — Danh sách sản phẩm (NgRx + OnPush + async pipe)
 * 📖 Lý thuyết:
 *   - 03-components-templates.md (Input, Output, content projection)
 *   - 09-rxjs-angular.md (async pipe, takeUntilDestroyed)
 *   - 14-ngrx.md (Store, dispatch, selectSignal)
 *   - 15-master-angular.md (OnPush, signals)
 * ===================================================================
 *
 * Pattern: Smart (Container) Component
 * 📖 Bài 15: Smart component lấy data từ store, xử lý logic
 * Presentational component chỉ nhận @Input và phát @Output
 *
 * Dùng NgRx:
 *   - Dispatch loadProducts() action
 *   - Select state qua selectSignal (trả về Signal)
 *   - Template đọc signal trực tiếp (không cần async pipe)
 */
import {
  Component, OnInit, inject, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TruncatePipe, VndPipe } from '@shared/pipes/truncate.pipe';
import { HighlightDirective } from '@shared/directives/highlight.directive';
import { fadeInOut, listAnimation } from '@shared/animations/route.animations';
import {
  selectAllProducts, selectProductsLoading, selectProductError,
} from '@features/products/store/product.selectors';
import { loadProducts } from '@features/products/store/product.actions';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    TruncatePipe, VndPipe, HighlightDirective,
  ],
  // 📖 Bài 15: OnPush — cải thiện performance
  // Signal-based selectors tự trigger CD khi state đổi
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut, listAnimation],
  template: `
    <div class="container">
      <div class="flex between center">
        <h1>Sản phẩm</h1>
        <div class="flex gap-sm">
          <a mat-raised-button routerLink="/products/grid" color="accent">
            <mat-icon>grid_on</mat-icon> AG-Grid View
          </a>
          <a mat-raised-button routerLink="/products/new" color="primary">
            <mat-icon>add</mat-icon> Thêm mới
          </a>
        </div>
      </div>

      <!--
        📖 Bài 14: selectSignal — trả về Signal, đọc bằng products()
        📖 Bài 15: OnPush + Signal → Angular tự track, CD tự chạy khi signal đổi
      -->
      @if (loading()) {
        <div class="flex center" style="padding: 32px">
          <mat-spinner diameter="40" />
        </div>
      }

      @if (error(); as err) {
        <p style="color: red">Lỗi: {{ err }}</p>
      }

      <div @listAnimation class="product-grid">
        <!--
          📖 Bài 03: @for với track — bắt buộc Angular 17+
          track product.id để Angular tái sử dụng DOM khi list đổi
        -->
        @for (product of products(); track product.id) {
          <mat-card class="product-card" @fadeInOut>
            <mat-card-header>
              <mat-card-title>{{ product.name }}</mat-card-title>
              <mat-card-subtitle>{{ product.category }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <!-- 📖 Bài 04: Custom pipe truncate -->
              <p>{{ product.description | truncate:60 }}</p>
              <!-- 📖 Bài 04: Custom pipe vnd -->
              <p class="price">{{ product.price | vnd }}</p>
              <p>Kho: {{ product.stock }} | Rating: {{ product.rating }}/5</p>
            </mat-card-content>
            <mat-card-actions>
              <!-- 📖 Bài 06: routerLink với parameter -->
              <a mat-button [routerLink]="['/products', product.id]">
                Chi tiết
              </a>
              <button mat-button color="primary" (click)="onAddToCart(product)">
                <mat-icon>add_shopping_cart</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        } @empty {
          @if (!loading()) {
            <p>Không có sản phẩm nào.</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .product-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
    .product-card { width: 300px; }
    .price { color: var(--color-primary); font-weight: bold; font-size: 1.1em; }
  `],
})
export class ProductListComponent implements OnInit {

  private readonly store = inject(Store);
  private readonly cartService = inject(CartService);

  // ─── NgRx: Select state ────────────────────────────────────────
  // 📖 Bài 14: store.selectSignal — trả về Signal (Angular 16+)
  // Không cần async pipe, không cần unsubscribe
  readonly products = this.store.selectSignal(selectAllProducts);
  readonly loading = this.store.selectSignal(selectProductsLoading);
  readonly error = this.store.selectSignal(selectProductError);

  // ─── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    // 📖 Bài 14: Dispatch action → Effect gọi API → Reducer cập nhật state
    this.store.dispatch(loadProducts());
  }

  // ─── Event handlers ────────────────────────────────────────────
  onAddToCart(product: Product): void {
    this.cartService.add(product);
  }
}
