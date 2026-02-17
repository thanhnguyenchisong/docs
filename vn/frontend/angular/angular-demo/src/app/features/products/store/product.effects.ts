/**
 * ===================================================================
 * Product Effects — Side effects (HTTP, router, localStorage)
 * 📖 Lý thuyết: 14-ngrx.md (Effects)
 * ===================================================================
 *
 * Effect lắng nghe action → thực hiện side effect → dispatch action mới.
 *
 * Luồng:
 *   1. Component dispatch loadProducts()
 *   2. Effect lắng nghe loadProducts → gọi API
 *   3. API thành công → dispatch loadProductsSuccess({ products })
 *   4. API thất bại → dispatch loadProductsFailure({ error })
 *   5. Reducer cập nhật state
 *
 * Key:
 *   - ofType(action): Chỉ xử lý action cụ thể
 *   - exhaustMap: Bỏ qua request mới nếu cũ chưa xong (tránh duplicate)
 *   - switchMap: Hủy request cũ khi có action mới (search, navigation)
 *   - PHẢI trả về Observable<Action> (hoặc { dispatch: false })
 *   - PHẢI catchError để stream không terminate
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';
import * as ProductActions from './product.actions';

@Injectable()
export class ProductEffects {

  // 📖 Bài 05: inject() — lấy dependency
  private readonly actions$ = inject(Actions);
  private readonly productService = inject(ProductService);
  private readonly notify = inject(NotificationService);

  // ─── Load Products ─────────────────────────────────────────────
  /**
   * 📖 Bài 14: createEffect — tạo effect
   *
   * exhaustMap: Bỏ qua action mới nếu đang xử lý
   * → Tránh gọi API trùng khi user click nhiều lần
   *
   * Phải LUÔN catchError bên trong map operator (exhaustMap/switchMap)
   * Nếu catchError ở ngoài → error terminate effect, không lắng nghe action nữa
   */
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      // 📖 Bài 14: ofType — chỉ xử lý action loadProducts
      ofType(ProductActions.loadProducts),
      exhaustMap(() =>
        this.productService.getAll().pipe(
          // Thành công → dispatch success action
          map(products => ProductActions.loadProductsSuccess({ products })),
          // Thất bại → dispatch failure action
          // 📖 Bài 14: PHẢI catchError, trả về of(action) để stream tiếp tục
          catchError(error =>
            of(ProductActions.loadProductsFailure({ error: error.message }))
          ),
        ),
      ),
    ),
  );

  // ─── Add Product ───────────────────────────────────────────────
  addProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.addProduct),
      exhaustMap(({ product }) =>
        this.productService.create(product).pipe(
          map(created => ProductActions.addProductSuccess({ product: created })),
          catchError(error =>
            of(ProductActions.loadProductsFailure({ error: error.message }))
          ),
        ),
      ),
    ),
  );

  // ─── Notification on Success (no dispatch) ─────────────────────
  /**
   * 📖 Bài 14: { dispatch: false } — effect không dispatch action mới
   * Dùng cho side effect không cần cập nhật state (notification, log, analytics)
   */
  addProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.addProductSuccess),
      tap(({ product }) => {
        this.notify.success(`Đã thêm sản phẩm: ${product.name}`);
      }),
    ),
    { dispatch: false },  // Không dispatch action
  );
}
