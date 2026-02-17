/**
 * ===================================================================
 * ProductService — CRUD service gọi API
 * 📖 Lý thuyết:
 *   - 08-http-client.md (HttpClient, get/post/put/delete, options)
 *   - 09-rxjs-angular.md (Observable, operators, shareReplay)
 *   - 05-services-di.md (inject(), providedIn)
 * ===================================================================
 *
 * Service này minh họa:
 *   - Tất cả HTTP methods (GET, POST, PUT, DELETE)
 *   - Type-safe response với generics <Product>
 *   - Error handling với catchError, retry
 *   - Cache với shareReplay
 *   - Search với debounce pattern
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import {
  catchError, retry, map, shareReplay, switchMap,
  debounceTime, distinctUntilChanged,
} from 'rxjs/operators';
import { Product, PaginatedResponse } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {

  // 📖 Bài 05: inject() — cách mới (Angular 14+), gọn hơn constructor injection
  // Dùng được trong field initializer, constructor, factory
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  // ─── Cache: shareReplay ────────────────────────────────────────
  // 📖 Bài 09: shareReplay(1) — cache giá trị cuối, nhiều subscriber dùng chung
  // refCount: true → reset cache khi không còn subscriber
  private categoriesCache$?: Observable<string[]>;

  // ─── Search: BehaviorSubject ───────────────────────────────────
  // 📖 Bài 09: BehaviorSubject có giá trị khởi tạo, subscriber mới nhận ngay
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  // ═══════════════════════════════════════════════════════════════
  // CRUD Operations — 📖 Bài 08: Các phương thức HttpClient
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET — Lấy danh sách sản phẩm
   * 📖 Bài 08: get<T>(url, options?) — trả về Observable<T>
   * 📖 Bài 08: retry(2) — thử lại 2 lần nếu lỗi
   * 📖 Bài 08: catchError — bắt lỗi, fallback sang mock data
   *
   * Pattern thực tế: Khi chưa có backend hoặc server down,
   * app vẫn hoạt động được với mock data → tốt cho demo và dev.
   */
  getAll(page = 1, pageSize = 20): Observable<Product[]> {
    // 📖 Bài 08: HttpParams — query string type-safe
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      retry(2),                     // Thử lại 2 lần nếu network error
      catchError(err => {
        // Fallback: Server không phản hồi → trả mock data để app vẫn chạy
        console.warn('[ProductService.getAll] Server unavailable, using mock data:', err.message);
        return of(this.getMockProducts());
      }),
    );
  }

  /**
   * GET by ID — Lấy chi tiết sản phẩm
   * Fallback: tìm trong mock data nếu server không phản hồi
   */
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn(`[ProductService.getById] Server unavailable, using mock data:`, err.message);
        const mock = this.getMockProducts().find(p => p.id === id);
        if (mock) return of(mock);
        throw new Error(`Product ${id} not found in mock data`);
      }),
    );
  }

  /**
   * POST — Tạo sản phẩm mới
   * 📖 Bài 08: post<T>(url, body, options?) — gửi data trong request body
   * 📖 Bài 01: Partial<Product> — chỉ cần một số fields
   */
  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError(err => {
        // Fallback: giả lập tạo product với ID ngẫu nhiên
        console.warn('[ProductService.create] Server unavailable, returning mock:', err.message);
        const mock: Product = {
          id: Date.now(),
          name: product.name ?? 'New Product',
          description: product.description ?? '',
          price: product.price ?? 0,
          stock: product.stock ?? 0,
          category: product.category ?? 'Uncategorized',
          rating: 0,
          tags: [],
        };
        return of(mock);
      }),
    );
  }

  /**
   * PUT — Cập nhật sản phẩm
   * 📖 Bài 08: put<T>(url, body)
   */
  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      catchError(err => {
        console.warn('[ProductService.update] Server unavailable, returning merged mock:', err.message);
        const existing = this.getMockProducts().find(p => p.id === id);
        return of({ ...existing, ...product, id } as Product);
      }),
    );
  }

  /**
   * DELETE — Xóa sản phẩm
   * 📖 Bài 08: delete<T>(url)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        console.warn(`[ProductService.delete] Server unavailable, mock delete id=${id}:`, err.message);
        return of(undefined as unknown as void);
      }),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Lấy full HTTP response — 📖 Bài 08: observe: 'response'
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET với pagination info từ headers
   * 📖 Bài 08: observe: 'response' — trả về HttpResponse (status, headers, body)
   */
  getAllPaginated(page: number, pageSize: number): Observable<PaginatedResponse<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Product[]>(this.apiUrl, {
      params,
      observe: 'response',    // Lấy full response thay vì chỉ body
    }).pipe(
      map(response => ({
        data: response.body ?? [],
        total: +(response.headers.get('X-Total-Count') ?? '0'),
        page,
        pageSize,
      })),
      catchError(err => {
        console.warn('[ProductService.getAllPaginated] Server unavailable, using mock:', err.message);
        const mock = this.getMockProducts();
        return of({
          data: mock.slice((page - 1) * pageSize, page * pageSize),
          total: mock.length,
          page,
          pageSize,
        });
      }),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Cache pattern — 📖 Bài 09: shareReplay
  // ═══════════════════════════════════════════════════════════════

  /**
   * Lấy danh sách categories — cache kết quả
   * 📖 Bài 09: shareReplay(1) chia sẻ subscription, cache 1 giá trị
   * Nhiều component gọi getCategories() → chỉ gọi API 1 lần
   */
  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http.get<string[]>(`${this.apiUrl}/categories`).pipe(
        catchError(err => {
          console.warn('[ProductService.getCategories] Server unavailable, using mock:', err.message);
          return of(this.getMockCategories());
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this.categoriesCache$;
  }

  /** Xóa cache khi cần (ví dụ sau khi thêm category mới) */
  clearCategoriesCache(): void {
    this.categoriesCache$ = undefined;
  }

  // ═══════════════════════════════════════════════════════════════
  // Search pattern — 📖 Bài 09: debounceTime + switchMap
  // ═══════════════════════════════════════════════════════════════

  /**
   * Stream search results — component subscribe, nhận kết quả real-time
   *
   * 📖 Bài 09: debounceTime(300) — chờ 300ms không gõ mới emit
   * 📖 Bài 09: distinctUntilChanged() — chỉ emit khi giá trị thay đổi
   * 📖 Bài 09: switchMap — hủy request cũ khi có search term mới
   */
  readonly searchResults$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => {
      if (!term.trim()) return of([]);
      return this.http.get<Product[]>(this.apiUrl, {
        params: { q: term },
      }).pipe(
        catchError(() => {
          // Fallback: search trong mock data
          const results = this.getMockProducts().filter(p =>
            p.name.toLowerCase().includes(term.toLowerCase())
          );
          return of(results);
        }),
      );
    }),
  );

  /** Component gọi method này khi user gõ search */
  setSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  // ═══════════════════════════════════════════════════════════════
  // Mock data — Fallback khi server không phản hồi
  // ═══════════════════════════════════════════════════════════════
  //
  // Pattern thực tế: Mọi method đều catchError → fallback mock data.
  // Giúp app chạy offline, demo mà không cần backend, và dev nhanh.
  // Khi có server thật, HTTP response sẽ được dùng thay mock.

  getMockCategories(): string[] {
    return ['Laptop', 'Phone', 'Audio', 'Tablet', 'Accessories'];
  }

  getMockProducts(): Product[] {
    return [
      { id: 1, name: 'Laptop Dell XPS 15', description: 'Laptop cao cấp', price: 35000000, stock: 10, category: 'Laptop', rating: 4.5, tags: ['laptop', 'dell'] },
      { id: 2, name: 'iPhone 15 Pro', description: 'Smartphone Apple', price: 28000000, stock: 25, category: 'Phone', rating: 4.8, tags: ['phone', 'apple'] },
      { id: 3, name: 'AirPods Pro', description: 'Tai nghe không dây', price: 5500000, stock: 50, category: 'Audio', rating: 4.6, tags: ['audio', 'apple'] },
      { id: 4, name: 'Samsung Galaxy S24', description: 'Smartphone Samsung', price: 22000000, stock: 30, category: 'Phone', rating: 4.3, tags: ['phone', 'samsung'] },
      { id: 5, name: 'MacBook Air M3', description: 'Laptop mỏng nhẹ', price: 32000000, stock: 15, category: 'Laptop', rating: 4.7, tags: ['laptop', 'apple'] },
    ];
  }
}
