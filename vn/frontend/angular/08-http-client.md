# HTTP Client

Angular cung cấp `HttpClient` (từ `@angular/common/http`) để gọi API REST. Hỗ trợ Observable, interceptors, typed response.

## Mục lục
1. [Cấu hình và dùng cơ bản](#cấu-hình-và-dùng-cơ-bản)
2. [Các phương thức và options](#các-phương-thức-và-options)
3. [Interceptors](#interceptors)
4. [Error handling](#error-handling)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Cấu hình và dùng cơ bản

Trong `app.config.ts` (standalone):

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),  // withFetch() dùng fetch API (mặc định từ Angular 18)
  ],
});
```

Service gọi API:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(HttpClient);
  private url = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>(this.url);
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`${this.url}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>(this.url, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(`${this.url}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.url}/${id}`);
  }
}
```

Component subscribe hoặc dùng async pipe:

```typescript
this.productService.getAll().subscribe(list => this.products = list);
// Hoặc giữ Observable và dùng | async trong template
```

---

## Các phương thức và options

- **get&lt;T&gt;(url, options?)**: GET.
- **post&lt;T&gt;(url, body?, options?)**: POST.
- **put&lt;T&gt;(url, body?, options?)**: PUT.
- **patch&lt;T&gt;(url, body?, options?)**: PATCH.
- **delete&lt;T&gt;(url, options?)**: DELETE.

**options** thường dùng: `headers`, `params`, `responseType`, `observe: 'response'` (lấy full HttpResponse).

```typescript
this.api.get<Product[]>(this.url, {
  params: { page: 1, size: 10 },
  headers: { 'X-Custom': 'value' },
}).subscribe(...);

// Lấy full response (status, headers)
this.api.get<Product[]>(this.url, { observe: 'response' })
  .subscribe(res => {
    console.log(res.status, res.headers.get('X-Total-Count'));
    this.list = res.body ?? [];
  });
```

---

## Interceptors

Interceptor xử lý request/response toàn cục: thêm header (token), log, chuyển lỗi.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
```

Đăng ký trong `app.config.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

providers: [
  provideHttpClient(
    withFetch(),
    withInterceptors([authInterceptor]),
  ),
],
```

Nhiều interceptor: thứ tự trong mảng = thứ tự xử lý request (và ngược lại cho response).

---

## Error handling

HTTP lỗi (4xx, 5xx) trả về **error** trong Observable, không vào callback `next`. Nên dùng `catchError` hoặc `retry` trong service.

```typescript
import { catchError, retry } from 'rxjs/operators';
import { of } from 'rxjs';

getAll(): Observable<Product[]> {
  return this.api.get<Product[]>(this.url).pipe(
    retry(2),
    catchError(err => {
      console.error(err);
      this.notify.error('Không tải được dữ liệu');
      return of([]);
    }),
  );
}
```

Interceptor xử lý lỗi toàn cục (ví dụ 401 → redirect login):

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        inject(Router).navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
```

---

## Câu hỏi thường gặp

**HttpClient trả về Observable, tại sao không dùng Promise?**  
Observable hỗ trợ cancel (unsubscribe), retry, kết hợp nhiều request (switchMap, combineLatest), và tích hợp với async pipe. Có thể chuyển sang Promise bằng `firstValueFrom`/`lastValueFrom` nếu cần.

**Khi nào dùng interceptors?**  
Thêm token, header chung, log, xử lý lỗi chung (401/403), transform request/response.

**Có cần unsubscribe khi subscribe trong component?**  
Có. Trước khi component destroy nên unsubscribe để tránh memory leak. Cách an toàn: dùng `async` pipe trong template (tự unsubscribe) hoặc takeUntilDestroyed.

---

## Senior / Master

- **Global ErrorHandler**: Angular cung cấp class `ErrorHandler` để bắt mọi error chưa được xử lý (throw trong component, service, v.v.). Override để log lên server (Sentry, Datadog) hoặc hiển thị thông báo toàn cục:

```typescript
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Unhandled error:', error);
    // Gửi lên monitoring service (Sentry, Datadog, ...)
    // this.monitoringService.logError(error);
  }
}

// Đăng ký trong app.config.ts
providers: [
  { provide: ErrorHandler, useClass: GlobalErrorHandler },
],
```

- **Retry strategy**: Dùng `retry({ count: 3, delay: 1000 })` (RxJS 7+) hoặc custom `retryWhen` với exponential backoff cho API không ổn định.
- **Request cancellation**: Unsubscribe Observable HTTP sẽ **abort** request (XHR hoặc fetch). Kết hợp `switchMap` (search) hoặc `takeUntilDestroyed` (component destroy) để tự hủy request không cần nữa.
- **Typed interceptor vs functional**: Angular 15+ khuyến nghị **functional interceptor** (`HttpInterceptorFn`); class-based (`HttpInterceptor`) vẫn dùng được nhưng không phải mặc định cho standalone.

---

→ Tiếp theo: [09 - RxJS trong Angular](09-rxjs-angular.md)
