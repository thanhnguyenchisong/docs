/**
 * ===================================================================
 * ProductDetailComponent — Chi tiết sản phẩm (Resolver + ActivatedRoute)
 * 📖 Lý thuyết:
 *   - 03-components-templates.md (ViewChild, content projection)
 *   - 06-routing-navigation.md (ActivatedRoute, params, resolver data)
 *   - 09-rxjs-angular.md (switchMap, route params)
 * ===================================================================
 *
 * Component này nhận data từ:
 *   1. Resolver: route.data (product đã load sẵn)
 *   2. Route params: route.paramMap (id)
 *
 * 📖 Bài 06: Resolver load data TRƯỚC khi vào route
 * → Component nhận data ngay, không cần loading state
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { VndPipe } from '@shared/pipes/truncate.pipe';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { CartService } from '@core/services/cart.service';
import { Product } from '@core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    VndPipe, StarRatingComponent,
  ],
  template: `
    <div class="container">
      @if (product(); as p) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ p.name }}</mat-card-title>
            <mat-card-subtitle>{{ p.category }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>{{ p.description }}</p>
            <p class="price">{{ p.price | vnd }}</p>
            <p>Kho: {{ p.stock }} sản phẩm</p>

            <!-- 📖 Bài 07: StarRating — custom form control (CVA)
                 Ở đây dùng standalone (không trong form) -->
            <div class="flex center gap-sm">
              <span>Rating:</span>
              <app-star-rating [maxStars]="5" />
              <span>{{ p.rating }} / 5</span>
            </div>

            <!-- 📖 Bài 04: @for — loop qua tags array -->
            <div style="margin-top: 8px">
              @for (tag of p.tags; track tag) {
                <mat-chip>{{ tag }}</mat-chip>
              }
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="addToCart(p)">
              <mat-icon>add_shopping_cart</mat-icon> Thêm vào giỏ
            </button>
            <a mat-button routerLink="/products">
              <mat-icon>arrow_back</mat-icon> Quay lại
            </a>
          </mat-card-actions>
        </mat-card>
      } @else {
        <p>Không tìm thấy sản phẩm.</p>
      }
    </div>
  `,
  styles: [`
    .price { color: var(--color-primary); font-weight: bold; font-size: 1.3em; margin: 8px 0; }
  `],
})
export class ProductDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly cartService = inject(CartService);

  readonly product = signal<Product | null>(null);

  ngOnInit(): void {
    // ─── Cách 1: Nhận data từ Resolver ─────────────────────────
    // 📖 Bài 06: route.data chứa data từ resolve config
    // Product đã load xong trước khi component render

    // Snapshot (một lần, không reactive)
    const resolvedProduct = this.route.snapshot.data['product'] as Product;
    if (resolvedProduct) {
      this.product.set(resolvedProduct);
    }

    // ─── Cách 2: Subscribe route.data (reactive) ────────────────
    // 📖 Bài 06: Dùng khi data có thể đổi (cùng component, khác param)
    // this.route.data.subscribe(({ product }) => {
    //   this.product.set(product);
    // });

    // ─── Cách 3: Đọc params + gọi API trong component ──────────
    // 📖 Bài 09: switchMap — hủy request cũ khi param đổi
    // this.route.paramMap.pipe(
    //   switchMap(params => {
    //     const id = Number(params.get('id'));
    //     return this.productService.getById(id);
    //   }),
    // ).subscribe(product => this.product.set(product));
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }
}
