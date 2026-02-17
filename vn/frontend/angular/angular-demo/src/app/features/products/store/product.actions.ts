/**
 * ===================================================================
 * NgRx Actions — Mô tả "điều gì xảy ra"
 * 📖 Lý thuyết: 14-ngrx.md (Actions)
 * ===================================================================
 *
 * Action = event. Component hoặc Effect DISPATCH action.
 * Convention: '[Feature] Verb' — ví dụ '[Products] Load'
 *
 * createAction(type): Action không có payload
 * createAction(type, props<{...}>()): Action có payload (typed)
 *
 * Pattern: Mỗi thao tác có 3 actions:
 *   1. Load (trigger)
 *   2. Load Success (thành công)
 *   3. Load Failure (thất bại)
 */
import { createAction, props } from '@ngrx/store';
import { Product } from '@core/models';

// ─── Load Products ───────────────────────────────────────────────
// 📖 Bài 14: Action không payload — chỉ là signal "hãy load dữ liệu"
export const loadProducts = createAction(
  '[Products] Load',
);

// 📖 Bài 14: Action có payload — props<{...}>() define type cho payload
export const loadProductsSuccess = createAction(
  '[Products] Load Success',
  props<{ products: Product[] }>(),
);

export const loadProductsFailure = createAction(
  '[Products] Load Failure',
  props<{ error: string }>(),
);

// ─── CRUD Actions ────────────────────────────────────────────────

export const addProduct = createAction(
  '[Products] Add',
  props<{ product: Partial<Product> }>(),
);

export const addProductSuccess = createAction(
  '[Products] Add Success',
  props<{ product: Product }>(),
);

export const deleteProduct = createAction(
  '[Products] Delete',
  props<{ id: number }>(),
);

export const deleteProductSuccess = createAction(
  '[Products] Delete Success',
  props<{ id: number }>(),
);

// ─── Select Product ──────────────────────────────────────────────
export const selectProduct = createAction(
  '[Products] Select',
  props<{ id: number }>(),
);
