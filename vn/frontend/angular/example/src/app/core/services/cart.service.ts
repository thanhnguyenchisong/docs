/**
 * ===================================================================
 * CartService — Quản lý giỏ hàng bằng Signals
 * 📖 Lý thuyết:
 *   - 10-state-architecture.md (Service-based state)
 *   - 15-master-angular.md (Signals: signal, computed, effect)
 *   - 05-services-di.md (Singleton service)
 * ===================================================================
 *
 * Minh họa pattern: Service + Signal cho state management
 * Đây là cách phổ biến nhất khi KHÔNG dùng NgRx.
 *
 * Pattern:
 *   1. Private writable signal (_items) — chỉ service thay đổi
 *   2. Public readonly signal (items) — component đọc
 *   3. computed() cho derived state (totalPrice, itemCount)
 *   4. update() với immutable update (spread, filter, map)
 *
 * 📖 Bài 10: Ưu điểm — đơn giản, ít boilerplate, đủ cho nhiều app
 * 📖 Bài 10: Nhược — không có pattern chuẩn cho side effect, khó debug
 */
import { Injectable, signal, computed, effect } from '@angular/core';
import { Product, CartItem } from '@core/models';

@Injectable({ providedIn: 'root' })
export class CartService {

  // ─── State: Private writable signals ───────────────────────────
  // 📖 Bài 15: signal<T>(initialValue) — tạo writable signal
  private readonly _items = signal<CartItem[]>([]);

  // ─── Public API: Readonly signals ──────────────────────────────
  // 📖 Bài 10: .asReadonly() — component không thể .set() / .update()
  readonly items = this._items.asReadonly();

  // ─── Derived state: computed() ─────────────────────────────────
  // 📖 Bài 15: computed() — chỉ tính lại khi signal phụ thuộc đổi
  // Memoized: nếu _items không đổi, không tính lại

  /** Tổng số lượng sản phẩm trong giỏ */
  readonly itemCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  /** Tổng tiền */
  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  /** Giỏ hàng trống? */
  readonly isEmpty = computed(() => this._items().length === 0);

  /** Tổng tiền format VND */
  readonly totalPriceFormatted = computed(() =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(this.totalPrice())
  );

  // ─── Side effect: effect() ─────────────────────────────────────
  // 📖 Bài 15: effect() — chạy side effect khi signal đổi
  // Chạy trong injection context (constructor/field init)
  // CẢNH BÁO: Tránh thay đổi signal khác trong effect (dễ gây vòng lặp)
  constructor() {
    // 📖 Bài 15: effect() — side effect khi signal đổi
    // Chạy trong injection context (constructor/field init)
    // CẢNH BÁO: Tránh thay đổi signal khác trong effect (dễ gây vòng lặp)
    effect(() => {
      const count = this.itemCount();
      console.log(`[CartService] Giỏ hàng: ${count} sản phẩm`);
      // Thực tế: có thể persist vào localStorage
      // localStorage.setItem('cart', JSON.stringify(this._items()));
    });
  }

  // ─── Methods: Immutable updates ────────────────────────────────
  // 📖 Bài 10: Best practice — dùng spread, map, filter (immutable)
  // KHÔNG mutate array trực tiếp (push, splice, ...)

  /**
   * Thêm sản phẩm vào giỏ
   * 📖 Bài 15: .update(fn) — nhận giá trị hiện tại, trả về giá trị mới
   */
  add(product: Product, quantity = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        // Cập nhật số lượng — tạo array MỚI với item MỚI (immutable)
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      // Thêm mới — spread tạo array mới
      return [...items, { product, quantity }];
    });
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   * 📖 Bài 10: filter() tạo array mới, không mutate
   */
  remove(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  /**
   * Cập nhật số lượng
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._items.update(items =>
      items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  /**
   * Xóa toàn bộ giỏ hàng
   * 📖 Bài 15: .set() — gán giá trị mới
   */
  clear(): void {
    this._items.set([]);
  }
}
