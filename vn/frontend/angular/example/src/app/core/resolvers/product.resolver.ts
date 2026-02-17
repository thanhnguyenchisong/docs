/**
 * ===================================================================
 * Product Resolver — Load dữ liệu trước khi vào route
 * 📖 Lý thuyết: 06-routing-navigation.md (Resolvers)
 * ===================================================================
 *
 * Resolver load dữ liệu TRƯỚC khi route kích hoạt.
 * Component nhận data qua ActivatedRoute.data — không cần gọi API trong ngOnInit.
 *
 * Lợi ích:
 *   - Component nhận data sẵn, không cần loading state
 *   - Nếu load fail, có thể redirect (không render component)
 *
 * Nhược:
 *   - Người dùng phải chờ (không thấy UI cho đến khi data xong)
 *   - Nên dùng cho data quan trọng; data phụ load trong component
 */
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { NotificationService } from '@core/services/notification.service';

/**
 * 📖 Bài 06: ResolveFn<T> — functional resolver
 * Nhận (route, state), trả về Observable<T> | Promise<T> | T
 */
export const productResolver: ResolveFn<Product> = (route, _state) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  // 📖 Bài 06: Đọc params từ route
  const id = Number(route.paramMap.get('id'));

  if (isNaN(id) || id <= 0) {
    notify.error('ID sản phẩm không hợp lệ');
    router.navigate(['/products']);
    return EMPTY;  // Không kích hoạt route
  }

  return productService.getById(id).pipe(
    catchError(_error => {
      notify.error('Không tìm thấy sản phẩm');
      router.navigate(['/products']);
      return EMPTY;  // Không kích hoạt route nếu lỗi
    }),
  );
};
