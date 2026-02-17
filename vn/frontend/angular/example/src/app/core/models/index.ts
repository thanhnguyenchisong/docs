/**
 * ===================================================================
 * core/models/index.ts — Typed models cho toàn app
 * 📖 Lý thuyết: 01-typescript-basics.md
 *   - Interface và Type
 *   - Generics
 *   - Utility types (Partial, Pick, Omit, Record)
 *   - Union types, Literal types
 * ===================================================================
 */

// ─── Interface: Mô tả hình dạng object ──────────────────────────
// Dùng interface khi cần extend hoặc declaration merging.
// Angular models thường dùng interface cho entity từ API.

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;            // Union type (xem bên dưới)
  avatar?: string;           // Optional property — có thể undefined
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  rating: number;
  tags: string[];            // Array type
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Type alias: Union types, Literal types ──────────────────────
// Dùng type cho union, intersection, mapped types.
// Không merge được như interface.

export type UserRole = 'admin' | 'editor' | 'viewer';  // Literal union type

export type Status = 'idle' | 'loading' | 'success' | 'error';

// ─── Type cho API response ───────────────────────────────────────
// Generic type — tái sử dụng cho mọi entity
export interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Utility types — dùng rất nhiều trong Angular ────────────────

/**
 * Partial<Product> — tất cả fields thành optional
 * Dùng khi update (chỉ gửi fields thay đổi)
 */
export type ProductUpdate = Partial<Product>;

/**
 * Pick<T, K> — chỉ lấy một số fields
 * Dùng cho form tạo mới (không cần id, rating)
 */
export type ProductCreate = Pick<Product, 'name' | 'description' | 'price' | 'stock' | 'category'>;

/**
 * Omit<T, K> — bỏ bớt fields
 * Dùng khi API trả về object không có field nào đó
 */
export type ProductSummary = Omit<Product, 'description' | 'tags'>;

/**
 * Record<K, V> — object với key type K và value type V
 * Dùng cho lookup map, config, dictionary
 */
export type CategoryMap = Record<string, Product[]>;

// ─── Intersection type ───────────────────────────────────────────
// Kết hợp nhiều type
export type ProductWithCartInfo = Product & { inCart: boolean; cartQuantity: number };

// ─── Enum — dùng ít trong Angular, ưu tiên union type ───────────
export enum OrderStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
}

// ─── Generic constraint — dùng cho service/component tổng quát ──
/**
 * HasId: constraint cho generic — entity phải có field id
 * Dùng trong: GenericListComponent<T extends HasId>
 */
export interface HasId {
  id: number;
}

/**
 * Column definition cho bảng tổng quát
 * Generics giúp type-safe khi định nghĩa cột cho từng entity
 */
export interface ColumnDef<T> {
  field: keyof T;           // keyof — chỉ cho phép field có trong T
  header: string;
  width?: number;
  sortable?: boolean;
  formatter?: (value: T[keyof T]) => string;  // Hàm format giá trị
}

// ─── State interfaces (dùng cho NgRx — Bài 14) ──────────────────
export interface EntityState<T> {
  entities: T[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
}

// ─── App config type (dùng cho InjectionToken — Bài 05) ─────────
export interface AppConfig {
  apiUrl: string;
  appName: string;
  features: {
    enableDarkMode: boolean;
    enableAnalytics: boolean;
  };
}
