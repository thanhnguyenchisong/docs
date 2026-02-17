/**
 * ===================================================================
 * Product State — Interface và initial state
 * 📖 Lý thuyết: 14-ngrx.md (State interface, Reducers)
 * ===================================================================
 *
 * State interface định nghĩa "hình dạng" của state slice.
 * Initial state là giá trị ban đầu khi app khởi động.
 *
 * Best practices:
 *   - Typed interface cho state (không any)
 *   - Flat shape (không lồng sâu)
 *   - Loading/error flags cho async operations
 */
import { Product } from '@core/models';

export interface ProductState {
  products: Product[];       // Danh sách sản phẩm
  loading: boolean;          // Đang gọi API?
  error: string | null;      // Lỗi (nếu có)
  selectedId: number | null; // ID sản phẩm đang chọn
}

/**
 * 📖 Bài 14: Initial state — giá trị ban đầu
 * Reducer dùng làm default khi state chưa có
 */
export const initialProductState: ProductState = {
  products: [],
  loading: false,
  error: null,
  selectedId: null,
};
