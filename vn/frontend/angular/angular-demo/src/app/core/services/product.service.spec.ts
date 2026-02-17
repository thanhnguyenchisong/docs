/**
 * ===================================================================
 * ProductService Tests — Unit test cho HTTP service
 * 📖 Lý thuyết: 12-testing.md (Test service, HttpTestingController)
 * ===================================================================
 *
 * Test service gọi HTTP:
 *   1. Cấu hình TestBed với provideHttpClient + provideHttpClientTesting
 *   2. Inject service và HttpTestingController
 *   3. Gọi method → expectOne(url) → flush(mockData)
 *   4. Assert kết quả
 *   5. afterEach: httpMock.verify() — đảm bảo không có request thừa
 *
 * 📖 Bài 12: HttpTestingController giả lập HTTP, không gọi server thật
 */
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '@core/models';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  // 📖 Bài 12: beforeEach — cấu hình test module trước mỗi test
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),   // 📖 Bài 12: Mock HTTP
      ],
    });

    // 📖 Bài 12: TestBed.inject — lấy instance service
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // 📖 Bài 12: afterEach — verify không có request chưa xử lý
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── Test getAll() ─────────────────────────────────────────────
  it('should GET products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Test', description: '', price: 100, stock: 5, category: 'A', rating: 4, tags: [] },
    ];

    // 1. Gọi method (subscribe để trigger HTTP)
    service.getAll().subscribe(products => {
      // 4. Assert kết quả
      expect(products).toEqual(mockProducts);
      expect(products.length).toBe(1);
    });

    // 2. Expect request
    // 📖 Bài 12: expectOne — kiểm tra có đúng 1 request đến URL này
    const req = httpMock.expectOne(r => r.url.includes('/products'));

    // 3. Kiểm tra method
    expect(req.request.method).toBe('GET');

    // 4. Trả về mock data
    // 📖 Bài 12: flush() — giả lập server trả về response
    req.flush(mockProducts);
  });

  // ─── Test getById() ────────────────────────────────────────────
  it('should GET product by id', () => {
    const mockProduct: Product = {
      id: 1, name: 'Test', description: 'Desc', price: 100,
      stock: 5, category: 'A', rating: 4, tags: ['test'],
    };

    service.getById(1).subscribe(product => {
      expect(product).toEqual(mockProduct);
      expect(product.id).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url.includes('/products/1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  // ─── Test create() ─────────────────────────────────────────────
  it('should POST new product', () => {
    const newProduct: Partial<Product> = { name: 'New', price: 500, category: 'B' };
    const created: Product = {
      id: 99, name: 'New', description: '', price: 500,
      stock: 0, category: 'B', rating: 0, tags: [],
    };

    service.create(newProduct).subscribe(product => {
      expect(product.id).toBe(99);
      expect(product.name).toBe('New');
    });

    const req = httpMock.expectOne(r => r.url.includes('/products'));
    expect(req.request.method).toBe('POST');
    // 📖 Bài 12: Kiểm tra request body
    expect(req.request.body).toEqual(newProduct);
    req.flush(created);
  });

  // ─── Test error handling ───────────────────────────────────────
  it('should handle HTTP error và trả về mảng rỗng', () => {
    service.getAll().subscribe(products => {
      // 📖 Bài 08: catchError trả về of([]) khi lỗi
      expect(products).toEqual([]);
    });

    const req = httpMock.expectOne(r => r.url.includes('/products'));

    // 📖 Bài 12: flush error — giả lập server trả lỗi
    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });

  // ─── Test getMockProducts() ────────────────────────────────────
  it('should return mock products', () => {
    const products = service.getMockProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
  });
});
