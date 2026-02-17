# NgRx — State management cho Angular

NgRx là thư viện quản lý state cho Angular, dựa trên mô hình **Redux**: state tập trung, thay đổi qua **actions** và **reducers**, side effect qua **effects**. Bài này trình bày cách dùng NgRx từ cài đặt đến pattern thực tế.

## Mục lục
1. [NgRx là gì?](#ngrx-là-gì)
2. [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
3. [Actions](#actions)
4. [Reducers](#reducers)
5. [Selectors](#selectors)
6. [Effects](#effects)
7. [Feature state và Store](#feature-state-và-store)
8. [Dùng trong Component](#dùng-trong-component)
9. [Best practices và Testing](#best-practices-và-testing)
10. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## NgRx là gì?

- **Store**: Một nguồn sự thật (single source of truth) — state toàn app (hoặc từng feature) nằm trong object read-only.
- **Action**: Sự kiện mô tả “điều gì xảy ra” (ví dụ `[Products] Load`, `[Cart] Add Item`). Component hoặc Effect **dispatch** action.
- **Reducer**: Hàm **pure** `(state, action) => state mới`. Không gọi API, không mutate state; trả về state mới (immutable).
- **Effect**: Xử lý **side effect** (HTTP, router, localStorage). Lắng nghe action, gọi API/async, sau đó dispatch action thành công/thất bại.
- **Selector**: Hàm đọc state (hoặc derived data) từ store. Có thể memoize (createSelector) để tránh tính lại không cần thiết.

Luồng điển hình: **Component dispatch action** → **Reducer cập nhật state** → **Selector cung cấp data cho component**. Nếu cần gọi API: **Effect** lắng action → gọi API → dispatch action load success/error → **Reducer** cập nhật state.

---

## Cài đặt và cấu hình

```bash
ng add @ngrx/store
ng add @ngrx/effects
```

Hoặc cài thủ công:

```bash
npm install @ngrx/store @ngrx/effects
```

Đăng ký Store và Effects trong `app.config.ts` (standalone):

```typescript
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { reducers } from './store/reducers';  // tổng hợp reducers
import { AppEffects } from './store/effects/app.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(reducers),
    provideEffects(AppEffects),
  ],
});
```

---

## Actions

Dùng **createAction** với payload (optional). Convention: `[Feature] Action Type`.

```typescript
// product.actions.ts
import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product';

export const loadProducts = createAction('[Products] Load');
export const loadProductsSuccess = createAction(
  '[Products] Load Success',
  props<{ products: Product[] }>(),
);
export const loadProductsFailure = createAction(
  '[Products] Load Failure',
  props<{ error: string }>(),
);

export const addToCart = createAction(
  '[Cart] Add Item',
  props<{ product: Product; quantity?: number }>(),
);
export const removeFromCart = createAction(
  '[Cart] Remove Item',
  props<{ productId: number }>(),
);
```

- Không payload: `createAction('[Products] Load')`.
- Có payload: `props<{ ... }>()`. TypeScript sẽ infer type khi dispatch.

---

## Reducers

Reducer là hàm nhận **state hiện tại** và **action**, trả về **state mới** (immutable). Dùng **createReducer** và **on** để map action → cập nhật state.

```typescript
// product.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.actions';
import { ProductState, initialProductState } from './product.state';

export const productReducer = createReducer(
  initialProductState,
  on(ProductActions.loadProducts, state => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false,
    error: null,
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
```

**State interface và initial:**

```typescript
// product.state.ts
import { Product } from '../models/product';

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const initialProductState: ProductState = {
  products: [],
  loading: false,
  error: null,
};
```

**Gộp reducers (global state):**

```typescript
// store/reducers/index.ts
import { ActionReducerMap } from '@ngrx/store';
import { productReducer } from '../features/products/store/product.reducer';
import { cartReducer } from '../features/cart/store/cart.reducer';

export interface AppState {
  products: ProductState;
  cart: CartState;
}

export const reducers: ActionReducerMap<AppState> = {
  products: productReducer,
  cart: cartReducer,
};
```

---

## Selectors

Selector đọc state (hoặc derived data). **createFeatureSelector** lấy slice feature; **createSelector** để memoize và kết hợp nhiều selector.

```typescript
// product.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.state';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
  selectProductState,
  state => state.products,
);

export const selectProductsLoading = createSelector(
  selectProductState,
  state => state.loading,
);

export const selectProductError = createSelector(
  selectProductState,
  state => state.error,
);

// Derived: sản phẩm có số lượng > 0
export const selectInStockProducts = createSelector(
  selectAllProducts,
  products => products.filter(p => p.stock > 0),
);
```

- **createSelector**: Chỉ tính lại khi tham số (các selector con) thay đổi → tránh re-compute không cần thiết.

---

## Effects

Effect lắng nghe action, thực hiện side effect (HTTP, router), rồi dispatch action mới. Dùng **createEffect** và **ofType**, trả về Observable action (hoặc `{ dispatch: false }` nếu không dispatch).

```typescript
// product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap } from 'rxjs/operators';
import { ProductService } from '../product.service';
import * as ProductActions from './product.actions';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      exhaustMap(() =>
        this.productService.getAll().pipe(
          map(products => ProductActions.loadProductsSuccess({ products })),
          catchError(err => of(ProductActions.loadProductsFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}
```

- **ofType(loadProducts)**: Chỉ xử lý khi action là `loadProducts`.
- **exhaustMap**: Bỏ qua request mới nếu request cũ chưa xong; dùng **switchMap** nếu muốn hủy request cũ khi có action mới.
- Effect **phải** trả về Observable; dùng **of()** hoặc **map** để dispatch action. Không dispatch: `createEffect(..., { dispatch: false })`.

**Đăng ký Effects:**

```typescript
// app.config.ts
import { ProductEffects } from './features/products/store/product.effects';

provideEffects([ProductEffects]),
```

Feature state (lazy): đăng ký effects trong route hoặc feature provider.

---

## Feature state và Store

Để tách state theo feature (và lazy load), dùng **StoreModule.forFeature** (NgModule) hoặc **provideState** (standalone).

**Standalone (Angular 16+):**

```typescript
// app.config.ts
import { provideState } from '@ngrx/store';
import { productReducer } from './features/products/store/product.reducer';
import { ProductEffects } from './features/products/store/product.effects';

providers: [
  provideStore(),  // root store có thể rỗng
  provideState('products', productReducer),
  provideEffects([ProductEffects]),
],
```

Hoặc đăng ký feature state trong route (lazy):

```typescript
// products.routes.ts
import { provideState } from '@ngrx/store';
import { productReducer } from './store/product.reducer';
import { ProductEffects } from './store/product.effects';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list.component').then(m => m.ProductListComponent),
    providers: [
      provideState('products', productReducer),
      provideEffects([ProductEffects]),
    ],
  },
];
```

---

## Dùng trong Component

**Dispatch action:** inject **Store**, gọi `store.dispatch(action())`.

**Đọc state:** inject **Store**, dùng **select** với selector (trả về Observable) hoặc **selectSignal** (Angular 16+, trả về Signal).

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadProducts } from './store/product.actions';
import { selectAllProducts, selectProductsLoading } from './store/product.selectors';

@Component({ ... })
export class ProductListComponent {
  private store = inject(Store);

  products = this.store.selectSignal(selectAllProducts);
  loading = this.store.selectSignal(selectProductsLoading);

  ngOnInit() {
    this.store.dispatch(loadProducts());
  }

  addToCart(product: Product) {
    this.store.dispatch(addToCart({ product }));
  }
}
```

Template:

```html
@if (loading()) {
  <p>Đang tải...</p>
} @else {
  @for (p of products(); track p.id) {
    <app-product-card [product]="p" (addToCart)="addToCart(p)" />
  }
}
```

Với Observable (cách cũ): `this.store.select(selectAllProducts).subscribe(...)` hoặc dùng `| async` trong template.

---

## Best practices và Testing

- **Action naming**: `[Feature] Verb` (e.g. `[Products] Load Success`).
- **Immutable state**: Luôn trả về object/array mới trong reducer; không mutate.
- **One level slice**: State shape phẳng theo feature; tránh lồng sâu.
- **Selector memoization**: Dùng createSelector cho derived data.
- **Effect error**: Luôn catchError và dispatch action failure để reducer ghi error.
- **Testing reducer**: Gọi reducer với state + action, assert state mới. Testing effect: mock Actions và service, assert dispatch action.

```typescript
// product.reducer.spec.ts
describe('productReducer', () => {
  it('should set loading on loadProducts', () => {
    const state = productReducer(initialProductState, loadProducts());
    expect(state.loading).toBe(true);
  });
});
```

---

## Câu hỏi thường gặp

**Khi nào nên dùng NgRx?**  
State phức tạp, nhiều nơi đọc/ghi, cần trace action (debug, log), team quen Redux. Form đơn giản hoặc CRUD nhỏ có thể chỉ cần service + signal.

**Reducer có được gọi API không?**  
Không. Reducer phải pure. Gọi API đặt trong Effect; Effect dispatch action success/failure, reducer chỉ cập nhật state.

**selectSignal vs store.select?**  
selectSignal (Angular 16+) trả về Signal, dùng trong template trực tiếp (không cần async pipe). store.select trả về Observable, dùng với async pipe hoặc subscribe.

**Feature state có bắt buộc lazy load không?**  
Không. Có thể provideState ở root. Lazy load feature state giúp giảm bundle và load state chỉ khi vào feature.

**So sánh NgRx với Akita / NgRx Signal Store?**  
Akita ít boilerplate hơn. **NgRx Signal Store** (Angular 16+) là API mới của NgRx, dùng signal, ít boilerplate hơn Store + Actions/Reducers/Effects truyền thống; có thể dùng kết hợp hoặc thay thế cho use case đơn giản hơn.

---

→ Chi tiết state tổng quan: [10 - State & Kiến trúc](10-state-architecture.md)  
→ **Checklist phỏng vấn Senior** (gồm NgRx): [15 - Master Angular](15-master-angular.md#checklist-phỏng-vấn-senior-angular)  
→ Tiếp theo UI: [11 - UI & Styling](11-ui-styling.md)
