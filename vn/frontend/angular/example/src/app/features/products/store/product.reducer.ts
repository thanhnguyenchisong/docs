/**
 * ===================================================================
 * Product Reducer — (state, action) => state mới
 * 📖 Lý thuyết: 14-ngrx.md (Reducers)
 * ===================================================================
 *
 * Reducer là hàm PURE:
 *   - Nhận state hiện tại + action
 *   - Trả về state MỚI (immutable — dùng spread, không mutate)
 *   - KHÔNG gọi API, KHÔNG side effect
 *   - KHÔNG mutate state (push, splice, ...)
 *
 * createReducer + on() — map action → state update
 */
import { createReducer, on } from '@ngrx/store';
import { initialProductState } from './product.state';
import * as ProductActions from './product.actions';

export const productReducer = createReducer(
  // 📖 Bài 14: Giá trị ban đầu
  initialProductState,

  // ─── Load Products ─────────────────────────────────────────────

  // Khi dispatch loadProducts → set loading = true, xóa error
  on(ProductActions.loadProducts, (state) => ({
    ...state,                    // 📖 Bài 14: Spread — tạo object mới, giữ fields cũ
    loading: true,
    error: null,
  })),

  // Khi load thành công → cập nhật products, tắt loading
  // 📖 Bài 14: on() nhận (state, action) — action chứa payload
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,                    // Gán mảng mới
    loading: false,
    error: null,
  })),

  // Khi load thất bại → ghi error, tắt loading
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ─── Add Product ───────────────────────────────────────────────
  on(ProductActions.addProductSuccess, (state, { product }) => ({
    ...state,
    // 📖 Bài 14: [...state.products, product] — thêm phần tử mới (immutable)
    products: [...state.products, product],
  })),

  // ─── Delete Product ────────────────────────────────────────────
  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    // 📖 Bài 14: filter() tạo array mới, loại bỏ item
    products: state.products.filter(p => p.id !== id),
  })),

  // ─── Select Product ────────────────────────────────────────────
  on(ProductActions.selectProduct, (state, { id }) => ({
    ...state,
    selectedId: id,
  })),
);
