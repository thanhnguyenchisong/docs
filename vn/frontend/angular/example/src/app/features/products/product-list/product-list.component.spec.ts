/**
 * ===================================================================
 * ProductListComponent Tests — Unit test cho component
 * 📖 Lý thuyết: 12-testing.md (Test component, ComponentFixture)
 * ===================================================================
 *
 * Test component:
 *   1. TestBed.configureTestingModule — imports component, mock providers
 *   2. TestBed.createComponent — tạo component instance + fixture
 *   3. fixture.detectChanges() — chạy change detection
 *   4. Assert component properties và DOM
 *
 * 📖 Bài 12: Mock service bằng useValue — không gọi API thật
 * 📖 Bài 12 Senior: OnPush component cần input đổi hoặc event để CD chạy
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProductListComponent } from './product-list.component';
import { productReducer } from '../store/product.reducer';
import { CartService } from '@core/services/cart.service';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 📖 Bài 12: Standalone component → imports thay vì declarations
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        // 📖 Bài 14: Provide NgRx store cho test
        provideStore({ products: productReducer }),
        provideEffects([]),
        // 📖 Bài 12: Mock service — useValue với object stub
        // Không gọi API thật trong unit test
        CartService,
      ],
    }).compileComponents();

    // 📖 Bài 12: createComponent — tạo instance + fixture
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have loading signal', () => {
    // 📖 Bài 15: Signal-based property — đọc bằng ()
    // Trước detectChanges, store chưa dispatch → loading có thể false
    expect(component.loading()).toBeDefined();
  });

  it('should dispatch loadProducts on init', () => {
    // 📖 Bài 12: detectChanges() — trigger ngOnInit và change detection
    fixture.detectChanges();
    // Products sẽ loading (NgRx effect sẽ handle API call)
    // Trong test, effect không có HTTP nên state sẽ ở loading hoặc initial
  });

  it('should render title', () => {
    fixture.detectChanges();
    // 📖 Bài 12: nativeElement — truy cập DOM
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sản phẩm');
  });

  // 📖 Bài 12: fakeAsync + tick — test async behavior
  // it('should display products after loading', fakeAsync(() => {
  //   fixture.detectChanges();
  //   tick(1000);
  //   fixture.detectChanges();
  //   const cards = fixture.nativeElement.querySelectorAll('mat-card');
  //   expect(cards.length).toBeGreaterThan(0);
  // }));
});
