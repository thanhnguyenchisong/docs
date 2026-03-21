/**
 * ===================================================================
 * app.config.ts — Application Configuration (Providers)
 * 📖 Lý thuyết:
 *   - 02-angular-fundamentals.md (Bootstrap, app.config)
 *   - 05-services-di.md (InjectionToken, providers)
 *   - 06-routing-navigation.md (provideRouter, preloading)
 *   - 08-http-client.md (provideHttpClient, interceptors)
 *   - 11-ui-styling.md (provideAnimationsAsync)
 *   - 14-ngrx.md (provideStore, provideEffects)
 * ===================================================================
 *
 * Đây là nơi đăng ký TẤT CẢ providers toàn app:
 *   - Router
 *   - HttpClient + Interceptors
 *   - Animations
 *   - NgRx Store + Effects
 *   - Custom providers (ErrorHandler, InjectionToken)
 */
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { GlobalErrorHandler } from '@core/error-handler/global-error-handler';
import { APP_CONFIG } from '@core/tokens/app-config.token';
import { environment } from '@env/environment';

// NgRx
import { productReducer } from '@features/products/store/product.reducer';
import { ProductEffects } from '@features/products/store/product.effects';
import { counterReducer } from '@features/ngrx-demo/store/counter.reducer';
import { CounterEffects } from '@features/ngrx-demo/store/counter.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // ─── Routing ───────────────────────────────────────────────
    // 📖 Bài 06: provideRouter — đăng ký routes
    // 📖 Bài 06 Senior: withPreloading — load lazy route sau khi app ổn định
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Preload tất cả lazy routes
    ),

    // ─── HTTP Client ───────────────────────────────────────────
    // 📖 Bài 08: provideHttpClient — kích hoạt HttpClient
    // withFetch() — dùng Fetch API thay XMLHttpRequest (Angular 18+)
    // withInterceptors() — đăng ký interceptors (thứ tự quan trọng!)
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,    // Thêm token → chạy TRƯỚC
        errorInterceptor,   // Bắt lỗi → chạy SAU (nhận response trước)
      ]),
    ),

    // ─── Animations ────────────────────────────────────────────
    // 📖 Bài 11: provideAnimationsAsync — lazy load animation module
    provideAnimationsAsync(),

    // ─── NgRx Store ────────────────────────────────────────────
    // 📖 Bài 14: provideStore — đăng ký root reducers
    // 📖 Bài 14: provideEffects — đăng ký effects classes
    provideStore({
      products: productReducer,
      counter: counterReducer,
    }),
    provideEffects([ProductEffects, CounterEffects]),

    // ─── Global Error Handler ──────────────────────────────────
    // 📖 Bài 08 Senior: Override ErrorHandler mặc định
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // ─── InjectionToken ────────────────────────────────────────
    // 📖 Bài 05 Senior: Inject giá trị không phải class
    { provide: APP_CONFIG, useValue: environment },
  ],
};
