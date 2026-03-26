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
- TestBed tạo môi trường Angular giống runtime: DI container, module graph, compile template.
  - Cho phép override providers để mock/stub dependency.
  - Với component: createComponent() + compileComponents() để có template, lifecycle, change detection.
  - Còn new Service() / new Component() chỉ tạo class thuần: không DI, không template compilation, không lifecycle Angular, không change detection → chỉ hợp khi test “pure logic” (và tự mock thủ công).

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
- Các bước test với HTTP:

  - Arrange: Inject service và HttpTestingController qua TestBed.
  - Act: Gọi method trong service thực hiện HTTP.
  - Assert:
    - Dùng httpMock.expectOne(url) để xác thực đúng request.
    - Gửi response mock: req.flush(mockData) để hoàn tất flow.
    - Kiểm tra kết quả từ HTTP trả về (giá trị).
    - Cuối cùng, gọi httpMock.verify() để check không có request nào bị quên xử lý.

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

- Trigger change detection / update view

fixture.detectChanges() để chạy change detection → DOM mới cập nhật theo state.

- Truy cập DOM để assert UI

fixture.nativeElement lấy DOM thật và expect(el.textContent).toContain(...).
hoặc fixture.debugElement.query(By.css('...')) để query theo CSS/Directive.

- Tương tác event như user
Click/nhập liệu rồi detectChanges:

button.click() / input.value = 'a'; input.dispatchEvent(new Event('input'))

- (Bonus) Xử lý async rendering
fixture.whenStable() hoặc kết hợp fakeAsync/tick để chờ async tasks xong.
---

Khi test component, fixture.detectChanges() chạy change detection và các lifecycle hooks, giúp DOM sync với state bên trong. Nếu không gọi, template chưa cập nhật, dẫn tới không test được UI hoặc fail khi test binding.

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

### No ComponentFixture  vs ComponentFixture
“Không khác gì nhau” chỉ đúng nếu bạn chỉ test class logic và không quan tâm UI/lifecycle/async/OnPush.

Trong hầu hết test component thực tế, ComponentFixture là bắt buộc để:

- chạy đúng lifecycle,
- có change detection,
- tương tác DOM & event,
- xử lý async rendering,
- kiểm chứng OnPush và binding.


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
- **NgRx**: Test reducer với state + action → assert state mới; test effect với `provideMockActions` và mock service.

### Component Harness (CDK Testing)

**Component Harness** = API của Angular CDK để test component mà **không phụ thuộc vào DOM selector** (class, id). Khi component thay đổi template interno → test không bị vỡ.

```typescript
import { HarnessPredicate } from '@angular/cdk/testing';
import { ComponentHarness } from '@angular/cdk/testing';

// Tạo harness cho component custom
export class ProductCardHarness extends ComponentHarness {
  static hostSelector = 'app-product-card';

  // Locator — tìm element bên trong
  private getTitle = this.locatorFor('.product-title');
  private getPrice = this.locatorFor('.product-price');
  private getAddButton = this.locatorFor('button.add-to-cart');

  // API public
  async getProductName(): Promise<string> {
    const title = await this.getTitle();
    return title.text();
  }

  async getProductPrice(): Promise<string> {
    const price = await this.getPrice();
    return price.text();
  }

  async clickAddToCart(): Promise<void> {
    const btn = await this.getAddButton();
    return btn.click();
  }

  // Filter – tìm harness theo điều kiện
  static with(options: { name?: string }): HarnessPredicate<ProductCardHarness> {
    return new HarnessPredicate(ProductCardHarness, options)
      .addOption('name', options.name, async (harness, name) => {
        return (await harness.getProductName()) === name;
      });
  }
}
```

**Sử dụng trong test:**

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('ProductListComponent', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductListComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should display products', async () => {
    const cards = await loader.getAllHarnesses(ProductCardHarness);
    expect(cards.length).toBe(3);

    const firstName = await cards[0].getProductName();
    expect(firstName).toBe('Sản phẩm A');
  });

  it('should find product by name', async () => {
    const card = await loader.getHarness(
      ProductCardHarness.with({ name: 'Sản phẩm B' })
    );
    expect(await card.getProductPrice()).toContain('100,000');
  });
});
```

**Lợi ích**: Test không phụ thuộc CSS selector → component refactor template không vỡ test. Angular Material cung cấp harness cho mọi component (MatButtonHarness, MatInputHarness...).

### Marble Testing (RxJS)

Test Observable bằng **marble diagram** — mô tả stream bằng chuỗi ký tự:

```typescript
import { TestScheduler } from 'rxjs/testing';

describe('SearchService', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should debounce search input', () => {
    scheduler.run(({ cold, expectObservable }) => {
      // Marble: a--b--c  (mỗi - = 1 frame)
      const input$ = cold('a-b-c---|', { a: 'an', b: 'ang', c: 'angular' });

      const result$ = input$.pipe(
        debounceTime(3), // 3 frames
        distinctUntilChanged(),
      );

      // Expected: chỉ emit 'angular' sau debounce
      expectObservable(result$).toBe('------c-|', { c: 'angular' });
    });
  });

  it('should switchMap to API call', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const input$ = hot('  -a---b---|');
      const apiA$ = cold('    --x|', { x: ['resultA'] });
      const apiB$ = cold('        --y|', { y: ['resultB'] });

      const result$ = input$.pipe(
        switchMap(val => val === 'a' ? apiA$ : apiB$),
      );

      // switchMap hủy apiA khi b đến
      expectObservable(result$).toBe('-------y-|', { y: ['resultB'] });
    });
  });
});
```

**Marble syntax:**

| Ký hiệu | Ý nghĩa |
|----------|---------|
| `-` | 1 frame (10ms virtual time) |
| `a`, `b`, `c` | Emit giá trị |
| `\|` | Complete |
| `#` | Error |
| `^` | Subscription point (hot) |
| `(ab)` | Nhóm emit cùng frame |

### SpyOn Patterns

```typescript
// Spy method và trả giá trị
spyOn(productService, 'getAll').and.returnValue(of([mockProduct]));

// Spy và theo dõi gọi
const spy = spyOn(analytics, 'track');
component.onAddToCart(product);
expect(spy).toHaveBeenCalledWith('add_to_cart', { productId: 1 });
expect(spy).toHaveBeenCalledTimes(1);

// Spy property (getter)
spyOnProperty(authService, 'isLoggedIn').and.returnValue(true);

// jasmine.createSpyObj — tạo mock object với nhiều method
const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
mockRouter.navigate.and.returnValue(Promise.resolve(true));
providers: [{ provide: Router, useValue: mockRouter }],
```

---

→ Tiếp theo: [13 - Build & Deploy](13-build-deploy.md)

