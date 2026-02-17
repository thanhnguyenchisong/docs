# Tài liệu Frontend — Angular và ứng dụng web hoàn chỉnh

Bộ tài liệu này bao gồm **Angular** và các thành phần xung quanh cần thiết để xây dựng một **ứng dụng web Angular hoàn chỉnh**: TypeScript, components, routing, forms, HTTP, RxJS, UI, testing và build/deploy.

---

## 🌱 Dành cho người mới hoàn toàn

Phần này giúp bạn **chưa từng làm web** hoặc **mới chuyển sang frontend** có thể bắt đầu mà không bị lạc.

### Frontend là gì? Tại sao cần học?

- **Frontend** (phía trước) là phần **người dùng nhìn thấy và tương tác** trên trình duyệt: giao diện, nút bấm, form đăng nhập, danh sách sản phẩm, v.v.
- **Backend** (phía sau) là phần chạy trên máy chủ: lưu dữ liệu, xử lý logic, trả dữ liệu cho frontend qua **API**.
- Khi bạn mở một trang web (Facebook, Shopee, ngân hàng…), mọi thứ bạn thấy và click đều do **frontend** tạo ra. Học frontend = học cách xây dựng những thứ đó.

### Bạn cần chuẩn bị gì trước khi đọc?

| Yêu cầu | Giải thích ngắn |
|--------|-------------------|
| **HTML cơ bản** | Biết thẻ `<div>`, `<p>`, `<a>`, `<form>`, `<input>`. Nếu chưa, hãy học qua [MDN HTML](https://developer.mozilla.org/vi/docs/Web/HTML) (vài giờ). |
| **JavaScript cơ bản** | Biết biến, hàm, `if/else`, vòng lặp, array, object. Chưa cần async/class sâu. |
| **Terminal / CMD** | Biết mở terminal (hoặc Command Prompt), `cd` vào thư mục, chạy lệnh như `npm install`, `ng serve`. |
| **Trình duyệt** | Chrome hoặc Edge (để mở DevTools: F12 — dùng rất nhiều khi debug). |
| **Node.js** | Cài [Node.js](https://nodejs.org/) (bản LTS). Angular và npm cần Node để chạy. |

Nếu bạn **chưa biết HTML/JS**, hãy dành 1–2 tuần học nền tảng trước (MDN, freeCodeCamp, hoặc khóa nhập môn bất kỳ), rồi quay lại đây — tài liệu sẽ dễ hiểu hơn rất nhiều.

### Một số thuật ngữ sẽ gặp (glossary)

| Thuật ngữ | Ý nghĩa đơn giản |
|-----------|-------------------|
| **SPA** | Single Page Application — trang web chỉ load một lần, sau đó chuyển “trang” bằng JavaScript, không tải lại cả trang. |
| **Component** | Một “khối” giao diện tái sử dụng được (ví dụ: một nút, một card sản phẩm, một form đăng nhập). |
| **API** | Cách frontend “xin” hoặc “gửi” dữ liệu với backend (thường qua URL như `/api/users`). |
| **Routing** | Điều hướng giữa các “trang” trong app (ví dụ: `/home`, `/products`, `/login`). |
| **State** | Trạng thái dữ liệu của ứng dụng (user đã đăng nhập chưa, danh sách sản phẩm đang hiển thị là gì, v.v.). |
| **npm** | Công cụ cài đặt thư viện (package) cho dự án Node/Angular. Lệnh hay dùng: `npm install`, `npm start`. |
| **Build** | Biến code TypeScript/Angular thành file JavaScript và HTML để trình duyệt chạy được. |

Khi gặp từ mới trong bài, có thể quay lại bảng này hoặc tra Google: “tên thuật ngữ + frontend”.

### Nên bắt đầu từ đâu?

- **Nếu bạn chưa biết CSS, layout, responsive:**  
  Nên đọc trước **[web/README.md](web/README.md)** và ít nhất **01–04** (CSS, Layout, SCSS, Responsive). Như vậy khi làm Angular bạn sẽ hiểu cách style và bố cục trang.

- **Nếu đã biết HTML/CSS/JS cơ bản và muốn làm app Angular ngay:**  
  Bắt đầu từ **Angular**: đọc **01 TypeScript** → **02 Angular căn bản** → **03 Components & Templates**, rồi làm theo thứ tự trong [Lộ trình học](#-lộ-trình-học) bên dưới.

- **Gợi ý:** Đọc song song **web** (nền CSS, responsive, a11y) và **Angular** (framework) — áp dụng ngay vào project sẽ nhớ lâu hơn.

### Cách đọc tài liệu và thực hành

1. **Đọc theo số thứ tự** (01, 02, 03…) — mỗi bài dựa trên bài trước.
2. **Chạy code** trong khi đọc: tạo project bằng `ng new`, copy ví dụ từ bài vào project và xem kết quả trên trình duyệt.
3. **Mở DevTools (F12)** khi chạy app: tab Elements để xem HTML/CSS, Console để xem lỗi và `console.log`.
4. **Làm project nhỏ** sau mỗi vài bài (ví dụ: trang danh sách sản phẩm, form đăng ký) để gắn kiến thức lại.
5. **Đừng cố nhớ hết** — khi cần dùng đến (ví dụ: routing, form) hãy mở lại bài tương ứng và tra cứu.

Khi bạn đã nắm phần “Dành cho người mới” ở trên, hãy bắt đầu từ **[Mục lục](#-mục-lục)** và **[Lộ trình học](#-lộ-trình-học)** bên dưới.

---

## 📚 Mục lục

Đọc theo thứ tự số để đi từ nền tảng đến ứng dụng hoàn chỉnh.

| # | File | Nội dung |
|---|------|----------|
| 01 | [TypeScript cơ bản](angular/01-typescript-basics.md) | TypeScript cho Angular: types, class, interface, decorators, module |
| 02 | [Angular căn bản](angular/02-angular-fundamentals.md) | Angular là gì, CLI, cấu trúc project, lifecycle |
| 03 | [Components & Templates](angular/03-components-templates.md) | Component, template, data binding, input/output, ViewChild |
| 04 | [Directives & Pipes](angular/04-directives-pipes.md) | Structural/attribute directives, built-in & custom pipes |
| 05 | [Services & Dependency Injection](angular/05-services-di.md) | Service, DI, inject(), providedIn, singleton |
| 06 | [Routing & Navigation](angular/06-routing-navigation.md) | Router, lazy loading, guards, resolvers |
| 07 | [Forms](angular/07-forms.md) | Template-driven forms, Reactive Forms, validation |
| 08 | [HTTP Client](angular/08-http-client.md) | HttpClient, interceptors, error handling, global ErrorHandler |
| 09 | [RxJS trong Angular](angular/09-rxjs-angular.md) | Observable, operators, async pipe, Subject, combineLatest, forkJoin |
| 10 | [State & Kiến trúc](angular/10-state-architecture.md) | Quản lý state, service-based, khi nào dùng NgRx |
| 11 | [UI & Styling](angular/11-ui-styling.md) | Angular Material, SCSS, theming, responsive, animations |
| 12 | [Testing](angular/12-testing.md) | Unit test (Jasmine/Karma), e2e (Cypress/Playwright) |
| 13 | [Build & Deploy](angular/13-build-deploy.md) | Environments, build, SSR, i18n, deploy (static, Docker) |
| 14 | [**NgRx**](angular/14-ngrx.md) | Store, Actions, Reducers, Effects, Selectors, feature state |
| 15 | [**Master Angular**](angular/15-master-angular.md) | Change Detection, Signals, Performance, Security, Kiến trúc, **Checklist phỏng vấn Senior** |
| 16 | [**AG-Grid**](angular/16-ag-grid.md) | Data grid: columnDefs, sort/filter, virtual scroll, cell editor/renderer, tích hợp Angular |

## 🎯 Lộ trình học

### Bắt đầu (ứng dụng đơn giản)
1. **01** TypeScript → **02** Angular căn bản → **03** Components & Templates → **05** Services & DI → **06** Routing

### Ứng dụng đầy đủ (CRUD, form, API)
2. **07** Forms → **08** HTTP Client → **09** RxJS trong Angular

### Nâng cao (state, UI, chất lượng)
3. **10** State & Kiến trúc → **14** NgRx (chi tiết) → **11** UI & Styling → **16** AG-Grid (data grid) → **12** Testing → **13** Build & Deploy

### Senior / Master (phỏng vấn, kiến trúc, performance)
4. **15** Master Angular — Change Detection, Signals, Performance, Security, **checklist câu hỏi phỏng vấn Senior**

## 📝 Cấu trúc mỗi bài

- **Khái niệm**: Giải thích ngắn gọn
- **Ví dụ code**: Angular/TypeScript minh họa
- **Best practices**: Gợi ý khi dùng trong dự án thật
- **Câu hỏi thường gặp**: FAQ và gợi ý trả lời phỏng vấn

## 🔗 Công cụ & tài liệu chính thức

- [Angular Documentation](https://angular.dev)
- [Angular CLI](https://angular.dev/tools/cli)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS](https://rxjs.dev)
- [Angular Material](https://material.angular.io)
- [AG-Grid Angular](https://www.ag-grid.com/angular-data-grid/)

---

**Mục tiêu**: Sau khi học xong bộ tài liệu (01–16), bạn có thể thiết kế và build một **ứng dụng web Angular hoàn chỉnh** (UI, form, gọi API, routing, state, **data grid AG-Grid**, test, build và deploy).

**Mục tiêu Senior / Master — Đọc xong = Master Angular & Lập trình web bằng Angular:**

- Học đủ **01 → 16** (gồm **16 - AG-Grid** cho bảng dữ liệu enterprise) và **15 - Master Angular** (Change Detection, Signals, Performance, Security, kiến trúc).
- Trả lời được **checklist phỏng vấn Senior** trong bài 15 (và thực hành AG-Grid trong project).
- Kết quả: Bạn đủ nền để **làm master Angular** và **lập trình web bằng Angular** ở mức senior — thiết kế kiến trúc, chọn công nghệ (Material, AG-Grid, NgRx), tối ưu performance, bảo mật, test và deploy.

---

## 📁 Project minh họa (example)

- **[web/example](web/example/)** — Trang tĩnh HTML/CSS/JS (CSS, Flexbox, Grid, Responsive, A11y). Xem [web/example/README.md](web/example/README.md).
- **[angular/example](angular/example/)** — Ứng dụng Angular chạy được: `cd angular/example && npm install && npm start`. Xem [angular/example/README.md](angular/example/README.md).
