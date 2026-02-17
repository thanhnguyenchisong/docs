/**
 * ===================================================================
 * Product Reducer Tests — Unit test cho reducer
 * 📖 Lý thuyết: 12-testing.md, 14-ngrx.md (Testing reducer)
 * ===================================================================
 *
 * Test reducer đơn giản nhất:
 *   1. Gọi reducer(state, action)
 *   2. Assert state mới
 *
 * Reducer là pure function → test dễ, không cần TestBed, không cần mock.
 */
import { productReducer } from './product.reducer';
import { initialProductState, ProductState } from './product.state';
import * as ProductActions from './product.actions';
import { Product } from '@core/models';

describe('productReducer', () => {

  // 📖 Bài 12: describe — nhóm test, it — từng test case

  it('should return initial state khi action không match', () => {
    // 📖 Bài 14: Reducer nhận undefined state → trả về initial
    const action = { type: 'UNKNOWN' } as any;
    const state = productReducer(undefined, action);
    expect(state).toEqual(initialProductState);
  });

  it('should set loading=true khi loadProducts', () => {
    const state = productReducer(initialProductState, ProductActions.loadProducts());

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set products và loading=false khi loadProductsSuccess', () => {
    // Arrange: State đang loading
    const loadingState: ProductState = {
      ...initialProductState,
      loading: true,
    };

    const mockProducts: Product[] = [
      { id: 1, name: 'Test', description: '', price: 100, stock: 5, category: 'A', rating: 4, tags: [] },
    ];

    // Act
    const state = productReducer(
      loadingState,
      ProductActions.loadProductsSuccess({ products: mockProducts }),
    );

    // Assert
    expect(state.products).toEqual(mockProducts);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set error khi loadProductsFailure', () => {
    const loadingState: ProductState = { ...initialProductState, loading: true };

    const state = productReducer(
      loadingState,
      ProductActions.loadProductsFailure({ error: 'Network error' }),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('should thêm product vào list khi addProductSuccess', () => {
    const existingState: ProductState = {
      ...initialProductState,
      products: [
        { id: 1, name: 'A', description: '', price: 100, stock: 5, category: 'A', rating: 4, tags: [] },
      ],
    };

    const newProduct: Product = {
      id: 2, name: 'B', description: '', price: 200, stock: 10, category: 'B', rating: 5, tags: [],
    };

    const state = productReducer(
      existingState,
      ProductActions.addProductSuccess({ product: newProduct }),
    );

    expect(state.products.length).toBe(2);
    expect(state.products[1]).toEqual(newProduct);
  });

  it('should xóa product khi deleteProductSuccess', () => {
    const existingState: ProductState = {
      ...initialProductState,
      products: [
        { id: 1, name: 'A', description: '', price: 100, stock: 5, category: 'A', rating: 4, tags: [] },
        { id: 2, name: 'B', description: '', price: 200, stock: 10, category: 'B', rating: 5, tags: [] },
      ],
    };

    const state = productReducer(
      existingState,
      ProductActions.deleteProductSuccess({ id: 1 }),
    );

    expect(state.products.length).toBe(1);
    expect(state.products[0].id).toBe(2);
  });
});
