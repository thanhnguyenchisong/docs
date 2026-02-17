/**
 * ===================================================================
 * Product Selectors — Đọc state từ Store
 * 📖 Lý thuyết: 14-ngrx.md (Selectors)
 * ===================================================================
 *
 * Selector = hàm (state) => data
 *
 * createFeatureSelector: Lấy slice feature từ global state
 * createSelector: Tạo selector memoized từ các selector khác
 *   → Chỉ tính lại khi input (selector con) thay đổi
 *   → Tránh re-compute không cần thiết → tốt cho performance
 *
 * Component dùng:
 *   store.selectSignal(selector) → Signal (Angular 16+)
 *   store.select(selector) → Observable
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.state';

// ─── Feature selector ────────────────────────────────────────────
// 📖 Bài 14: Tên 'products' phải khớp với key trong provideStore({ products: ... })
export const selectProductState = createFeatureSelector<ProductState>('products');

// ─── Basic selectors ─────────────────────────────────────────────
// 📖 Bài 14: createSelector — memoized, chỉ tính lại khi state đổi

export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products,
);

export const selectProductsLoading = createSelector(
  selectProductState,
  (state) => state.loading,
);

export const selectProductError = createSelector(
  selectProductState,
  (state) => state.error,
);

export const selectSelectedProductId = createSelector(
  selectProductState,
  (state) => state.selectedId,
);

// ─── Derived selectors ───────────────────────────────────────────
// 📖 Bài 14: Kết hợp nhiều selector → derived data

/** Sản phẩm đang chọn (theo selectedId) */
export const selectSelectedProduct = createSelector(
  selectAllProducts,
  selectSelectedProductId,
  (products, id) => products.find(p => p.id === id) ?? null,
);

/** Tổng số sản phẩm */
export const selectProductCount = createSelector(
  selectAllProducts,
  (products) => products.length,
);

/** Sản phẩm còn hàng (stock > 0) */
export const selectInStockProducts = createSelector(
  selectAllProducts,
  (products) => products.filter(p => p.stock > 0),
);

/** Sản phẩm nhóm theo category */
export const selectProductsByCategory = createSelector(
  selectAllProducts,
  (products) => {
    // 📖 Bài 01: Record<string, Product[]> — TypeScript utility type
    const grouped: Record<string, typeof products> = {};
    for (const p of products) {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    }
    return grouped;
  },
);
