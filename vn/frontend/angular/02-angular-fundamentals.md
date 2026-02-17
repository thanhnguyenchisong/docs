# Angular căn bản

## Mục lục
1. [Angular là gì?](#angular-là-gì)
2. [Angular CLI](#angular-cli)
3. [Cấu trúc project](#cấu-trúc-project)
4. [Lifecycle hooks](#lifecycle-hooks)
5. [Standalone vs NgModule](#standalone-vs-ngmodule)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Angular là gì?

- **Framework** phía client để xây dựng SPA (Single Page Application).
- Viết bằng **TypeScript**, build ra JavaScript chạy trên browser.
- Cung cấp: components, routing, forms, HTTP client, DI, reactive (RxJS), testing, CLI.
- **Phiên bản**: Angular (2+) — không nhầm với AngularJS (1.x).

---

## Angular CLI

Cài đặt và tạo project:

```bash
npm install -g @angular/cli
ng new my-app
cd my-app
ng serve
```

Lệnh thường dùng:

| Lệnh | Mô tả |
|------|--------|
| `ng generate component <name>` | Tạo component (có thể dùng `ng g c <name>`) |
| `ng generate service <name>` | Tạo service |
| `ng generate guard <name>` | Tạo guard |
| `ng build` | Build (production: `ng build --configuration=production`) |
| `ng test` | Chạy unit test |
| `ng add @angular/material` | Thêm Angular Material |

---

## Cấu trúc project

```
my-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # Application config (providers, routes)
│   │   ├── app.routes.ts         # Routing
│   │   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── shared/               # Shared components, pipes, directives
│   │   └── features/             # Feature modules (theo domain)
│   ├── assets/
│   ├── index.html
│   ├── main.ts                   # Bootstrap application
│   └── styles.scss               # Global styles
├── angular.json                  # CLI config
└── package.json
```

- **core/**: Service dùng toàn app (AuthService, ApiService), HTTP interceptors, guards.
- **shared/**: Component/pipe/directive dùng lại nhiều nơi (button, modal, format pipe).
- **features/**: Tổ chức theo tính năng (user, product, order).

---

## Lifecycle hooks

Thứ tự chạy chính (theo thứ tự):

| Hook | Khi nào chạy |
|------|----------------|
| `constructor` | Khởi tạo class (chưa có DOM) |
| `ngOnChanges` | Input thay đổi (lần đầu và mỗi lần sau) |
| `ngOnInit` | Khởi tạo xong, đã có input lần đầu — **nên gọi API, init logic ở đây** |
| `ngDoCheck` | Mỗi change detection |
| `ngAfterViewInit` | View (và child views) đã init xong |
| `ngOnDestroy` | Trước khi component bị hủy — **nên unsubscribe, cleanup** |

```typescript
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    // Gọi API, subscribe
  }
  ngOnDestroy() {
    // Unsubscribe, clear interval
  }
}
```

---

## Standalone vs NgModule

- **Standalone component** (Angular 14+): Component tự khai báo `standalone: true`, import trực tiếp component/pipe/directive cần dùng, không bắt buộc phải có `NgModule`.
- **NgModule**: Nhóm declarations, imports, exports; dùng cho lazy load theo module hoặc khi migrate từ code cũ.

Dự án mới nên dùng **standalone**; cấu hình mặc định của `ng new` đã là standalone.

---

## Câu hỏi thường gặp

**Angular vs React/Vue?**  
Angular là framework “all-in-one” (routing, form, HTTP, DI có sẵn). React/Vue linh hoạt hơn, nhiều thư viện do cộng đồng chọn.

**`ngOnInit` vs `constructor`?**  
Constructor dùng để inject dependency. Logic khởi tạo (gọi API, đọc input) nên đặt trong `ngOnInit` vì lúc đó input đã có giá trị và view chưa render.

**Khi nào dùng NgModule?**  
Khi lazy load theo module, hoặc khi bảo trì code cũ dùng NgModule. Dự án mới ưu tiên standalone.

---

## Senior / Master

- **Change Detection**: Mặc định Angular dùng Zone.js — mỗi event/async có thể trigger CD toàn cây. **OnPush** chỉ chạy CD khi input reference đổi, event trong template, hoặc async pipe / markForCheck. Giảm CD → tăng performance. Chi tiết: [15 - Master Angular](15-master-angular.md#change-detection-sâu).
- **Ivy**: Từ Angular 9+, Ivy là engine compile mặc định (AOT, tree-shake tốt hơn, debugging tốt hơn). Không cần cấu hình thêm.
- **Lazy load standalone**: `loadComponent: () => import('...').then(m => m.XComponent)`; có thể kèm `providers` cho feature.

---

→ Tiếp theo: [03 - Components & Templates](03-components-templates.md)
