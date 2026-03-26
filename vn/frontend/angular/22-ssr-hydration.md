# SSR, Hydration & Streaming

Server-Side Rendering (SSR) là kỹ thuật render HTML trên server trước khi gửi về client — cải thiện SEO, First Contentful Paint (FCP), và trải nghiệm người dùng. Angular hỗ trợ SSR với **@angular/ssr**, **hydration** (Angular 16+), và **streaming** (Angular 18+).

## Mục lục
1. [SSR là gì? (Cho người mới)](#ssr-là-gì-cho-người-mới)
2. [Cài đặt SSR](#cài-đặt-ssr)
3. [Hydration — client takeover](#hydration--client-takeover)
4. [TransferState — tránh gọi API hai lần](#transferstate--tránh-gọi-api-hai-lần)
5. [SSR Caveats — window, document, localStorage](#ssr-caveats--window-document-localstorage)
6. [Streaming SSR (Angular 18+)](#streaming-ssr-angular-18)
7. [Prerendering (SSG)](#prerendering-ssg)
8. [SEO Optimization](#seo-optimization)
9. [Deploy SSR](#deploy-ssr)
10. [Best practices](#best-practices)
11. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## SSR là gì? (Cho người mới)

- **SPA (Client-Side Rendering)**: Browser tải JS → Angular render HTML trên client. Lần đầu user thấy trang trắng cho đến khi JS load xong. Crawler (Google) có thể không đọc được nội dung.
- **SSR (Server-Side Rendering)**: Server chạy Angular → render HTML hoàn chỉnh → gửi về browser. User thấy nội dung **ngay lập tức** (trước khi JS load). Sau đó Angular "tiếp quản" (hydration) → trang trở thành SPA bình thường.
- **Hydration**: Quá trình Angular trên client **nhận lại** DOM đã render trên server — không xóa rồi render lại mà **gắn event listeners** và **đồng bộ state** lên DOM có sẵn.

### So sánh

| | CSR (SPA) | SSR | SSG (Prerender) |
|---|---------|-----|-----------------|
| **Render ở đâu** | Browser | Server (mỗi request) | Build time |
| **FCP** | Chậm (chờ JS) | Nhanh | Rất nhanh |
| **SEO** | Yếu (cần crawler JS) | Tốt | Rất tốt |
| **Dynamic content** | Có | Có | Hạn chế (static) |
| **Server** | Không cần | Cần Node.js | Không cần (static host) |
| **Phù hợp** | Dashboard, admin | E-commerce, blog, landing | Docs, blog tĩnh |

---

## Cài đặt SSR

### Thêm SSR vào project Angular

```bash
ng add @angular/ssr
```

Lệnh này tự động:
- Tạo `server.ts` (Express server)
- Tạo `src/app/app.config.server.ts`
- Cập nhật `angular.json` (thêm server builder)
- Thêm script `build:ssr` và `serve:ssr`

### Cấu trúc file

```
src/
├── app/
│   ├── app.config.ts          # Client config
│   ├── app.config.server.ts   # Server config (thêm providers cho server)
│   └── app.component.ts
├── main.ts                    # Client entry
└── main.server.ts             # Server entry
server.ts                      # Express server
```

### app.config.server.ts

```typescript
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(),
    provideServerRoutesConfig(serverRoutes),
  ],
});

export default serverConfig;
```

### Server routes config

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },          // SSR
  { path: 'about', renderMode: RenderMode.Prerender },  // SSG
  { path: 'dashboard', renderMode: RenderMode.Client },  // CSR (không SSR)
  { path: '**', renderMode: RenderMode.Server },
];
```

### Build và chạy

```bash
# Build SSR
ng build

# Chạy SSR server
node dist/my-app/server/server.mjs

# Development
ng serve  # Mặc định đã hỗ trợ SSR nếu đã cài
```

---

## Hydration — client takeover

### Hydration là gì?

Từ Angular 16+, **hydration** mặc định bật. Trước đây (Angular Universal), client-side Angular **xóa toàn bộ DOM** từ server rồi **render lại** — gây "flash" (nhấp nháy). Hydration thay vào đó:

1. Server render HTML + serialize state vào `<script>` tag
2. Client nhận HTML (user thấy nội dung ngay)
3. Angular trên client **gắn event listeners** lên DOM có sẵn
4. Angular **đồng bộ internal state** với DOM
5. Trang trở thành SPA hoàn chỉnh — **không flash**

### Bật hydration (mặc định từ Angular 17+)

```typescript
// app.config.ts
import { provideClientHydration } from '@angular/platform-browser';

providers: [
  provideClientHydration(),
],
```

### Hydration options

```typescript
provideClientHydration(
  withEventReplay(),           // Replay event trước khi hydration xong (Angular 18+)
  withI18nSupport(),           // Hỗ trợ i18n với hydration
  withIncrementalHydration(),  // Incremental hydration (Angular 19+)
),
```

### Incremental Hydration (Angular 19+)

Hydrate **từng phần** template thay vì toàn bộ. Kết hợp với `@defer`:

```html
@defer (hydrate on viewport) {
  <app-product-reviews [productId]="product.id" />
}
```

- Server render HTML cho `<app-product-reviews>`
- Client **không hydrate** cho đến khi user scroll xuống viewport
- Giảm JavaScript execution trên client

### ngSkipHydration

Bỏ qua hydration cho component cụ thể (khi DOM client khác server):

```html
<app-clock ngSkipHydration />
```

```typescript
@Component({
  host: { ngSkipHydration: 'true' },
  ...
})
export class ClockComponent {}
```

---

## TransferState — tránh gọi API hai lần

### Vấn đề

Không có TransferState:
1. **Server**: gọi API → render HTML
2. **Client**: Angular khởi tạo → gọi **lại** API (lần 2) → flash/loading

### Giải pháp: TransferState

Angular tự động transfer HTTP cache từ server sang client khi dùng `HttpClient` + `provideClientHydration(withHttpTransferCacheOptions(...))`.

```typescript
// app.config.ts
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

providers: [
  provideClientHydration(
    withHttpTransferCacheOptions({
      includePostRequests: false,  // Mặc định chỉ cache GET
    }),
  ),
],
```

**Flow:**
1. Server gọi `http.get('/api/products')` → nhận data → render HTML
2. Angular serialize response vào `<script type="application/json" id="ng-state">`
3. Client Angular khởi tạo → `http.get('/api/products')` → **đọc từ TransferState** (không gọi API)
4. → Không flash, không request thừa

### Custom TransferState (khi cần ngoài HttpClient)

```typescript
import { TransferState, makeStateKey } from '@angular/core';

const CONFIG_KEY = makeStateKey<AppConfig>('appConfig');

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  getConfig(): AppConfig {
    // Trên client: đọc từ TransferState nếu có
    if (isPlatformBrowser(this.platformId)) {
      const cached = this.transferState.get(CONFIG_KEY, null);
      if (cached) {
        this.transferState.remove(CONFIG_KEY); // Dùng xong thì xóa
        return cached;
      }
    }

    // Trên server: load config và lưu vào TransferState
    const config = loadConfig();
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(CONFIG_KEY, config);
    }
    return config;
  }
}
```

---

## SSR Caveats — window, document, localStorage

### Vấn đề

Server (Node.js) **không có** `window`, `document`, `localStorage`, `navigator`, `sessionStorage`. Code truy cập trực tiếp sẽ **lỗi** trên server.

### Giải pháp 1: isPlatformBrowser Guard

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }
}
```

### Giải pháp 2: afterNextRender / afterRender

```typescript
import { afterNextRender, afterRender } from '@angular/core';

@Component({ ... })
export class ChartComponent {
  constructor() {
    // Chỉ chạy trên client (sau khi render đầu tiên)
    afterNextRender(() => {
      // An toàn truy cập window, document, DOM
      const canvas = document.getElementById('chart');
      this.initChart(canvas);
    });

    // afterRender chạy sau MỖI render cycle (cẩn thận performance)
    afterRender(() => {
      // Resize logic
    });
  }
}
```

### Giải pháp 3: DOCUMENT token

```typescript
import { DOCUMENT } from '@angular/common';

@Component({ ... })
export class MyComponent {
  private document = inject(DOCUMENT);

  scrollToTop() {
    this.document.defaultView?.scrollTo(0, 0);
    // defaultView = window, null trên server
  }
}
```

### Bảng API và SSR safety

| API | Server? | Giải pháp |
|-----|---------|-----------|
| `window` | ❌ | `isPlatformBrowser`, `DOCUMENT.defaultView` |
| `document` | ⚠️ Domino (hạn chế) | Inject `DOCUMENT`, dùng `Renderer2` |
| `localStorage` / `sessionStorage` | ❌ | `isPlatformBrowser` guard |
| `navigator` | ❌ | `isPlatformBrowser` guard |
| `setTimeout` / `setInterval` | ✅ | OK nhưng cẩn thận chạy trên server |
| `fetch` / `HttpClient` | ✅ | OK — Angular HttpClient hoạt động trên cả server |
| `ElementRef.nativeElement` | ⚠️ | Tránh truy cập DOM trực tiếp, dùng `Renderer2` |

---

## Streaming SSR (Angular 18+)

### Streaming là gì?

Thay vì chờ toàn bộ HTML render xong rồi gửi, server **gửi từng chunk HTML** ngay khi sẵn sàng. Browser bắt đầu hiển thị **sớm hơn**.

### Event Replay

Khi SSR, user có thể **click** trước khi Angular hydrate xong. `withEventReplay()` ghi lại sự kiện và **replay** sau khi hydration hoàn tất:

```typescript
provideClientHydration(
  withEventReplay(),  // Angular 18+
),
```

→ User click button trên HTML server → event được queue → Angular hydrate → event được replay → handler chạy.

---

## Prerendering (SSG)

### Prerendering là gì?

Render HTML **tại build time** (không phải mỗi request). Output là file HTML tĩnh → deploy lên static host.

### Cấu hình prerender

```typescript
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'products/:id', renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const productIds = await fetchAllProductIds();
      return productIds.map(id => ({ id: String(id) }));
    },
  },
  { path: '**', renderMode: RenderMode.Server },
];
```

### Khi nào dùng Prerender vs SSR

| | Prerender (SSG) | SSR |
|---|----------------|-----|
| Nội dung | Tĩnh hoặc ít thay đổi | Dynamic (theo user, theo thời gian) |
| Build | Render lúc build → file HTML | Render mỗi request |
| Server | Không cần Node.js runtime | Cần Node.js running |
| Ví dụ | /about, /docs, /blog/slug | /dashboard, /products (filter), /profile |

---

## SEO Optimization

### Meta tags động

```typescript
import { Meta, Title } from '@angular/platform-browser';

@Component({ ... })
export class ProductDetailComponent {
  private meta = inject(Meta);
  private title = inject(Title);
  product = input.required<Product>();

  constructor() {
    effect(() => {
      const p = this.product();
      this.title.setTitle(`${p.name} | My Store`);
      this.meta.updateTag({ name: 'description', content: p.description });
      this.meta.updateTag({ property: 'og:title', content: p.name });
      this.meta.updateTag({ property: 'og:image', content: p.imageUrl });
      this.meta.updateTag({ property: 'og:type', content: 'product' });
    });
  }
}
```

### Route title

```typescript
// app.routes.ts
{
  path: 'about',
  loadComponent: () => import('./about.component').then(m => m.AboutComponent),
  title: 'Giới thiệu | My Store',
},
{
  path: 'products/:id',
  loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent),
  title: productTitleResolver,  // Dynamic title
},

// Resolver
export const productTitleResolver: ResolveFn<string> = (route) => {
  return inject(ProductService).getById(+route.params['id']).pipe(
    map(p => `${p.name} | My Store`),
  );
};
```

### Structured Data (JSON-LD)

```typescript
@Component({
  template: `
    <script type="application/ld+json">
      {{ structuredData() }}
    </script>
    ...
  `,
})
export class ProductDetailComponent {
  product = input.required<Product>();

  structuredData = computed(() => JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: this.product().name,
    description: this.product().description,
    image: this.product().imageUrl,
    offers: {
      '@type': 'Offer',
      price: this.product().price,
      priceCurrency: 'VND',
    },
  }));
}
```

---

## Deploy SSR

### Node.js Server

```bash
ng build           # Build cả client + server
node dist/my-app/server/server.mjs
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/my-app/server/server.mjs"]
```

### Serverless (Vercel, Netlify)

Angular CLI tự detect platform và tạo adapter phù hợp. Với Vercel:

```bash
ng add @angular/ssr --server-routing
# Vercel tự detect Angular SSR
```

---

## Best practices

| Nội dung | Gợi ý |
|----------|-------|
| **Cẩn thận Browser API** | Luôn dùng `isPlatformBrowser` hoặc `afterNextRender` trước khi truy cập window/document/localStorage |
| **TransferState** | Bật HTTP transfer cache để tránh gọi API hai lần |
| **RenderMode** | Prerender cho trang tĩnh (about, blog), SSR cho dynamic, Client cho authenticated pages |
| **Meta tags** | Dùng `Meta` và `Title` service để set SEO tags động — chỉ hiệu quả với SSR |
| **Avoid memory leak** | Server process chạy lâu — subscription, interval, global state phải cleanup |
| **Performance** | Cache SSR response (Redis, CDN) cho trang không cá nhân hóa; prerender khi có thể |

---

## Câu hỏi thường gặp

**SSR có bắt buộc cho SEO không?**
Không hoàn toàn. Google crawler có thể render JavaScript, nhưng chậm và không đảm bảo 100%. SSR đảm bảo crawler nhận HTML đầy đủ ngay lập tức. Nếu SEO quan trọng (e-commerce, blog, landing page) → nên dùng SSR/prerender.

**Hydration có gây lỗi không?**
Nếu HTML trên server khác client (ví dụ dùng `Date.now()` hoặc random) → hydration mismatch warning. Giải pháp: dùng `ngSkipHydration` cho component có DOM khác nhau, hoặc đảm bảo render giống nhau.

**SSR có chậm server không?**
Mỗi request cần render Angular trên server → tốn CPU. Giải pháp: cache response (CDN, Redis), prerender trang tĩnh, dùng streaming để gửi sớm. Với traffic cao, cân nhắc auto-scaling.

**Khi nào nên dùng CSR (không SSR)?**
Dashboard đã authenticate, admin panel, app nội bộ — không cần SEO, không cần FCP nhanh. Dùng `renderMode: RenderMode.Client` cho route này.

---

## Senior / Master

- **Hydration profiling**: Dùng Angular DevTools để đo hydration time; tối ưu bằng incremental hydration cho component nặng.
- **Edge SSR**: Deploy Angular SSR trên edge runtime (Cloudflare Workers, Vercel Edge) — render gần user hơn, latency thấp.
- **Cache strategy**: Full-page cache (CDN) cho trang public; fragment cache cho phần không cá nhân hóa; no-cache cho authenticated content.
- **Streaming + Suspense**: Kết hợp streaming SSR với `@defer` để gửi shell ngay, lazy stream phần nặng — tương tự React Suspense.

---

→ Xem thêm: [13 - Build & Deploy](13-build-deploy.md) | [15 - Master Angular](15-master-angular.md)
→ Tiếp theo: [23 - Design Patterns](23-design-patterns.md)
