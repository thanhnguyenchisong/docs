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

**Cho người mới:** Angular là một **framework** (bộ khung) để xây dựng **ứng dụng web** chạy trên trình duyệt. Thay vì bạn tự viết từng thứ (điều hướng trang, gọi API, quản lý form, cấu trúc code), Angular cung cấp sẵn: **components** (khối giao diện), **routing** (chuyển trang), **forms** (form + validation), **HTTP client** (gọi API), **dependency injection** (đưa service vào component), v.v. Bạn học cách dùng các phần đó và lắp ghép thành app. Ứng dụng kiểu “một trang load một lần, sau đó mọi thao tác đều không tải lại cả trang” gọi là **SPA** (Single Page Application) — Angular là một lựa chọn phổ biến để làm SPA. Phiên bản hiện tại là Angular 2 trở đi (viết bằng TypeScript); không nhầm với AngularJS (1.x), đã lỗi thời.

- **Framework** phía client để xây dựng SPA (Single Page Application).
- Viết bằng **TypeScript**, build ra JavaScript chạy trên browser.
- Cung cấp: components, routing, forms, HTTP client, DI, reactive (RxJS), testing, CLI.
- **Phiên bản**: Angular (2+) — không nhầm với AngularJS (1.x).

---

## Angular CLI

**Cho người mới:** **CLI** (Command Line Interface) là công cụ chạy bằng lệnh trong terminal để tạo project, tạo component/service, chạy dev server, build. Bạn không cần tự cấu hình webpack hay TypeScript — CLI đã làm sẵn. Các lệnh thường bắt đầu bằng `ng` (viết tắt Angular). Đảm bảo đã cài **Node.js** (để có `npm`) trước khi chạy các lệnh dưới.

Cài đặt và tạo project:

```bash
npm install -g @angular/cli
ng new my-app
cd my-app
ng serve
```

- `npm install -g @angular/cli`: cài Angular CLI toàn cục (lần đầu).
- `ng new my-app`: tạo thư mục `my-app` với toàn bộ cấu trúc project Angular.
- `cd my-app`: vào thư mục project.
- `ng serve`: chạy máy chủ phát triển; mở trình duyệt tại `http://localhost:4200` để xem app.

**Ví dụ trực quan: Bạn sẽ thấy gì khi chạy `ng serve`?**

Sau khi chạy `ng serve`, terminal in dòng dạng: `✔ Compiled successfully` và URL `http://localhost:4200`. Mở trình duyệt vào địa chỉ đó, bạn sẽ thấy trang mặc định của Angular:

- **Trên màn hình:** Logo Angular xoay, tiêu đề "Hello" (hoặc tên app), và vài link (Documentation, Tutorial…). Toàn bộ giao diện đó do **một component gốc** (`app.component`) render ra.

- **Thử sửa một dòng để thấy thay đổi ngay:** Mở `src/app/app.component.ts`, tìm dòng có `title = '...'` (hoặc trong template có chữ "Hello"). Đổi thành `title = 'Xin chào Angular'` và lưu file. Trình duyệt sẽ **tự reload** (hot reload) và chữ trên trang đổi theo. Đó là cách bạn “nhìn thấy” code và giao diện gắn với nhau.

- **Thử tạo component mới:** Chạy `ng g c hello --standalone`. CLI tạo thư mục `src/app/hello/` với file `hello.component.ts` và template. Mở `app.component.ts`, import `HelloComponent` và thêm `<app-hello></app-hello>` vào template — lưu lại, trang sẽ xuất hiện thêm nội dung của component `hello`. Như vậy bạn đã thấy **cấu trúc project** (component nằm trong thư mục, được gọi trong template) bằng mắt.

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

**Cho người mới:** Sau khi chạy `ng new my-app`, bạn có một cây thư mục chuẩn. Phần quan trọng nhất là **src/app/** — đây là nơi bạn viết phần lớn code. **app.component.ts** là component gốc (trang chính), **app.routes.ts** định nghĩa các “trang” (route). Thư mục **core/** thường chứa thứ dùng chung cho cả app (service đăng nhập, service gọi API, guard, interceptor). **shared/** chứa component/pipe dùng lại nhiều nơi (nút bấm, modal, pipe định dạng ngày). **features/** (hoặc tên tương tự) tổ chức theo từng tính năng (user, product, order) — mỗi feature có thể có component, service riêng. **main.ts** là điểm vào: nó “khởi động” ứng dụng Angular. **index.html** là file HTML duy nhất được load lúc đầu; Angular sau đó “chiếm” một thẻ (thường `<app-root>`) để render toàn bộ giao diện. Bạn không cần nhớ hết ngay — khi tạo component mới bằng `ng g c tên`, CLI sẽ tạo file đúng chỗ.

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

**Ví dụ trực quan: File nào tương ứng với cái gì trên màn hình**

| Bạn thấy trên trang | File / vị trí thường gặp |
|---------------------|--------------------------|
| Toàn bộ nội dung trang (logo, chữ, menu) | `app.component.ts` + template (hoặc `app.component.html`) |
| Đường dẫn URL (ví dụ `/home`, `/products`) | `app.routes.ts` — mỗi route map tới một component |
| Một khối lặp lại (card, nút, form) | Component trong `shared/` hoặc `features/.../` |
| Trang chủ, trang login, trang danh sách | Mỗi route load một component khác nhau |

Mở `src/app/app.component.ts` và so sánh với những gì đang hiển thị trên trình duyệt — bạn sẽ thấy template (HTML) và dữ liệu trong class quyết định nội dung hiển thị.

---

## Lifecycle hooks

**Cho người mới:** Mỗi component có một “vòng đời”: được tạo → hiển thị lên màn hình → có thể cập nhật nhiều lần → cuối cùng bị hủy khi rời khỏi màn hình. **Lifecycle hooks** là các hàm mà Angular gọi **đúng thời điểm** trong vòng đời đó. Ví dụ: `ngOnInit()` được gọi **một lần** sau khi component được tạo và input đã có giá trị — đây là chỗ thích hợp để gọi API hoặc khởi tạo dữ liệu. `ngOnDestroy()` được gọi **trước khi** component bị hủy — đây là chỗ để hủy subscription (Observable), clear timer, tránh rò rỉ bộ nhớ. Bạn không cần implement tất cả hooks — chỉ cần dùng những cái cần (thường là `ngOnInit` và `ngOnDestroy`).

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

**Cho người mới:** Trước đây Angular bắt buộc phải gom component vào **NgModule** (một “module” khai báo declarations, imports…). Từ Angular 14+, có kiểu **standalone component**: mỗi component tự khai báo `standalone: true` và tự import những component/pipe/directive nó cần, không cần tạo NgModule cho từng tính năng. Dự án mới tạo bằng `ng new` mặc định đã dùng standalone. Bạn chỉ cần nhớ: dùng **standalone** là cách hiện đại, đơn giản hơn; NgModule vẫn tồn tại khi lazy load theo module hoặc khi bảo trì code cũ.

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
