# Testing

Angular hỗ trợ **unit test** (Jasmine + Karma, hoặc Jest) và **e2e** (trước đây Protractor, hiện Cypress/Playwright phổ biến). Bài tóm tắt cách test component, service và e2e cơ bản.

## Mục lục
1. [Testing trong Angular là gì? (Cho người mới)](#testing-trong-angular-là-gì-cho-người-mới)
2. [Ví dụ trực quan: Chạy ng test và xem một test pass](#ví-dụ-trực-quan-chạy-ng-test-và-xem-một-test-pass)
3. [Unit test với Jasmine/Karma](#unit-test-với-jasminekarma)
4. [Test component](#test-component)
5. [Test service](#test-service)
6. [E2E (Cypress / Playwright)](#e2e-cypress--playwright)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Testing trong Angular là gì? (Cho người mới)

- **Unit test** = kiểm tra từng phần code (service, component) **tách riêng**: giả lập dependency (mock), gọi hàm hoặc render component, so sánh kết quả mong đợi. Angular dùng **Jasmine** (cú pháp describe/it/expect) và **Karma** (chạy test trong browser) hoặc **Jest**. File test thường đặt cạnh file nguồn, tên `*.spec.ts`.
- **E2E (end-to-end)** = kiểm tra toàn bộ luồng như user thật: mở trang, click, nhập liệu, kiểm tra nội dung hiển thị. Công cụ phổ biến: **Cypress**, **Playwright**. Chạy riêng với `npm run e2e` hoặc tương đương.
- **TestBed** = môi trường test Angular: cấu hình module, inject service, tạo component. **HttpTestingController** = giả lập HTTP: expect request nào được gửi và trả response giả — không cần server thật.

---

## Ví dụ trực quan: Chạy ng test và xem một test pass

1. Trong project Angular chạy `ng test` (hoặc `npm test`). Trình duyệt mở, Karma chạy các file `*.spec.ts`.
2. Mặc định `app.component.spec.ts` có sẵn: test đơn giản như “should create”, “should have title”. Bạn sẽ thấy trong tab terminal hoặc browser: **X tests, Y passed** (hoặc danh sách describe/it với dấu tick xanh).
3. **Thử sửa:** Mở `app.component.spec.ts`, trong một `it('...')` đổi `expect(component.title).toBe('...')` thành một giá trị sai — chạy lại `ng test`, test đó **fail** (màu đỏ, thông báo expected vs actual). Đổi lại đúng → pass. Đó là “viết test → chạy → thấy kết quả” trực quan.

---

## Unit test với Jasmine/Karma

Chạy test: `ng test`. File test cùng tên với file nguồn, hậu tố `.spec.ts`.

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get products', () => {
    const mock = [{ id: 1, name: 'A' }];
    service.getAll().subscribe(list => expect(list).toEqual(mock));
    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
```

- **TestBed**: Cấu hình module test, inject service.
- **HttpTestingController**: Giả lập HTTP, expect request và flush response.

---

## Test component

Dùng **TestBed** + **ComponentFixture**; có thể dùng **standalone** component.

```typescript
describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show title', () => {
    component.title = 'Sản phẩm';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sản phẩm');
  });
});
```

- **detectChanges()**: Chạy change detection (cập nhật DOM).
- **DebugElement**: Query DOM bằng `fixture.debugElement.query(By.css('button'))`.
- **Mock service**: `useValue` hoặc `useClass` với stub.

---

## Test service

Inject service trong TestBed, gọi method và assert. Nếu service gọi HTTP thì dùng **HttpTestingController** như ví dụ trên. Nếu service dùng service khác thì mock service đó trong `providers`.

```typescript
it('should add item to cart', () => {
  const cart = TestBed.inject(CartService);
  cart.add({ id: 1, name: 'A', price: 10 });
  expect(cart.items().length).toBe(1);
});
```

---

## E2E (Cypress / Playwright)

E2E test chạy trên browser thật (hoặc headless), tương tác như user.

**Cypress** (có thể thêm vào Angular): `ng e2e` hoặc cấu hình Cypress riêng.

```typescript
// cypress/e2e/home.cy.ts
describe('Home', () => {
  it('should show title', () => {
    cy.visit('/');
    cy.contains('Trang chủ').should('be.visible');
  });
});
```

**Playwright**: Cài và cấu hình theo docs; chạy song song nhiều browser. Angular có thể tích hợp qua script và config riêng.

E2E nên tập trung vào luồng chính (login, tạo đơn, …), ít case, chạy trước khi release.

---

## Câu hỏi thường gặp

**Test component có cần compile template không?**  
Có. `TestBed.createComponent()` sẽ compile (trừ khi dùng NO_ERRORS_SCHEMA và bỏ qua component con). Có thể mock child component bằng override để test nhanh hơn.

**Stub service như thế nào?**  
`providers: [{ provide: ProductService, useValue: { getAll: () => of([]) } }]`. Hoặc tạo class stub implement interface và dùng `useClass`.

**Unit test vs E2E?**  
Unit test nhanh, test từng class/function/component. E2E test toàn bộ luồng trên browser, chậm hơn, dùng ít case quan trọng. Nên có cả hai: unit cho logic và component, E2E cho critical path.

---

## Senior / Master

- **Component OnPush**: Khi test component có OnPush, thay đổi input phải là reference mới (hoặc trigger event từ template) thì `detectChanges()` mới cập nhật view; có thể gọi `fixture.autoDetectChanges()` hoặc trigger event để CD chạy.
- **fakeAsync / tick**: `fakeAsync(() => { ...; tick(1000); expect(...).toBe(...); })` — điều khiển thời gian ảo, test timer/ debounce mà không cần chờ thật.
- **TestBed.inject** vs **TestBed.get**: Dùng `TestBed.inject(Service)` (typed); `get` deprecated.
- **Override component**: `TestBed.overrideComponent(MyComponent, { set: { providers: [...] } })` để thay provider cho một component trong test.
- **NgRx**: Test reducer với state + action → assert state mới; test effect với `provideMockActions` và mock service. Chi tiết: [15 - Master Angular](15-master-angular.md#checklist-phỏng-vấn-senior-angular).

---

→ Tiếp theo: [13 - Build & Deploy](13-build-deploy.md)
