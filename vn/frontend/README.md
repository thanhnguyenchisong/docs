# Tài liệu Frontend — Angular, ReactJS, React+TypeScript, JavaScript & Web

Bộ tài liệu frontend từ **zero đến master** bao gồm: **JavaScript Master**, **AngularJS (1.x) Master**, **Angular** (23 bài), **ReactJS** (28 bài), **React + TypeScript** (8 bài), cùng với **Web fundamentals** (10 bài CSS/SCSS/Responsive/A11y/Performance/Security).

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
| **Terminal / CMD** | Biết mở terminal (hoặc Command Prompt), `cd` vào thư mục, chạy lệnh như `npm install`. |
| **Trình duyệt** | Chrome hoặc Edge (để mở DevTools: F12 — dùng rất nhiều khi debug). |
| **Node.js** | Cài [Node.js](https://nodejs.org/) (bản LTS). Angular/React và npm cần Node để chạy. |

### Nên bắt đầu từ đâu?

- **Nếu bạn chưa biết CSS, layout, responsive:**  
  Nên đọc trước **[web/README.md](web/README.md)** và ít nhất **01–04** (CSS, Layout, SCSS, Responsive).

- **Nếu muốn học Angular:**  
  Đọc **01 TypeScript** → **02 Angular căn bản** → tiếp tục theo thứ tự trong [Angular section](#-angular-23-bài).

- **Nếu muốn học React:**  
  Đọc **[reactjs/01-gioi-thieu-va-cai-dat](reactjs/01-gioi-thieu-va-cai-dat.md)** → tiếp theo thứ tự trong [ReactJS section](#-reactjs-28-bài--từ-zero-đến-master).

- **Nếu đã biết React JS, muốn chuyển sang TypeScript:**  
  Đọc **[reactts/01-reactts-khac-gi-reactjs](reactts/01-reactts-khac-gi-reactjs.md)** → tiếp tục trong [ReactTS section](#-reactts--react--typescript-8-bài).

---

## 🎯 Mục tiêu Master Frontend

**Học thuộc hết** nội dung trong toàn bộ folder frontend và trả lời được **Checklist Master Frontend** → **hoàn toàn tự tin pass phỏng vấn master frontend**.

→ **[MASTER-FRONTEND-CHECKLIST.md](./MASTER-FRONTEND-CHECKLIST.md)** — tổng hợp câu hỏi phỏng vấn theo chủ đề (Web, CSS, Angular, React, TypeScript, Performance, Architecture, Testing). Làm xong checklist = sẵn sàng master.

---

## 📚 Mục lục

### 📜 JavaScript & AngularJS Master

| File | Nội dung |
|------|----------|
| [**JavaScript Master**](./javascript-master.md) | 🔥 Engine, Types, Closures, Prototypes, Async, ES6+, DOM, Patterns, Performance, Interview (16 sections) |
| [**AngularJS (1.x) Master**](./angularjs-master.md) | 🔧 Modules, Controllers, $scope, Directives, Services, Routing, Forms, Digest Cycle, Custom Directives, Components, ServiceNow, Interview (18 sections) |

---

### 🌐 Web Fundamentals (10 bài)

| # | File | Nội dung |
|---|------|----------|
| 01 | [CSS Fundamentals](web/01-css-fundamentals.md) | Selectors, Box model, Colors, Typography |
| 02 | [CSS Layout](web/02-css-layout-flexbox-grid.md) | Flexbox, Grid, Positioning |
| 03 | [SCSS/Sass](web/03-scss-sass.md) | Variables, Nesting, Mixins, Functions |
| 04 | [Responsive Web Design](web/04-responsive-web-design.md) | Media queries, Mobile-first, Breakpoints |
| 05 | [Reactive Programming](web/05-reactive-programming.md) | Observable, Operators, RxJS basics |
| 06 | [Accessibility (A11y)](web/06-accessibility-a11y.md) | ARIA, Keyboard navigation, Screen readers |
| 07 | [Web Performance](web/07-web-performance.md) | Core Web Vitals, Lazy loading, Caching |
| 08 | [Browser/DOM/Event Loop](web/08-browser-dom-event-loop.md) | Rendering pipeline, Event loop, DOM API |
| 09 | [Web Security](web/09-web-security.md) | XSS, CSRF, CSP, CORS, HTTPS |
| 10 | [**Senior Web Checklist**](web/10-senior-web-checklist.md) | Câu hỏi phỏng vấn senior web |

---

### 🅰️ Angular (23 bài)

| # | File | Nội dung |
|---|------|----------|
| 01 | [TypeScript cơ bản](angular/01-typescript-basics.md) | Types, class, interface, decorators, module |
| 02 | [Angular căn bản](angular/02-angular-fundamentals.md) | CLI, cấu trúc project, lifecycle |
| 03 | [Components & Templates](angular/03-components-templates.md) | Data binding, input/output, ViewChild |
| 04 | [Directives & Pipes](angular/04-directives-pipes.md) | Structural/attribute directives, custom pipes |
| 05 | [Services & DI](angular/05-services-di.md) | Service, DI, inject(), providedIn |
| 06 | [Routing & Navigation](angular/06-routing-navigation.md) | Router, lazy loading, guards, resolvers |
| 07 | [Forms](angular/07-forms.md) | Template-driven, Reactive Forms, validation |
| 08 | [HTTP Client](angular/08-http-client.md) | HttpClient, interceptors, error handling |
| 09 | [RxJS trong Angular](angular/09-rxjs-angular.md) | Observable, operators, async pipe, Subject |
| 10 | [State & Kiến trúc](angular/10-state-architecture.md) | State management, service-based, NgRx |
| 11 | [UI & Styling](angular/11-ui-styling.md) | Angular Material, SCSS, theming, animations |
| 12 | [Testing](angular/12-testing.md) | Unit test (Jasmine/Karma), e2e (Cypress) |
| 13 | [Build & Deploy](angular/13-build-deploy.md) | Environments, build, SSR, i18n, deploy |
| 14 | [NgRx](angular/14-ngrx.md) | Store, Actions, Reducers, Effects, Selectors |
| 15 | [Master Angular](angular/15-master-angular.md) | Change Detection, Performance, Security |
| 16 | [AG-Grid](angular/16-ag-grid.md) | Data grid enterprise |
| 17 | [@defer & Projection](angular/17-defer-dynamic-projection.md) | Deferrable views, ng-content, dynamic |
| 18 | [Authentication](angular/18-authentication.md) | Auth guards, JWT, interceptors |
| 19 | [PWA & Realtime](angular/19-pwa-realtime.md) | Progressive web app, WebSocket |
| 20 | [Micro-frontend](angular/20-microfrontend-monorepo.md) | Module Federation, Nx monorepo |
| 21 | [Signals & Zoneless](angular/21-signals-zoneless.md) | Signal Store, linkedSignal, resource(), Zoneless |
| 22 | [SSR & Hydration](angular/22-ssr-hydration.md) | Angular Universal, hydration |
| 23 | [Design Patterns](angular/23-design-patterns.md) | Facade, Strategy, Adapter, Repository, Enterprise |

---

### ⚛️ ReactJS (28 bài — từ zero đến master)

| # | File | Nội dung |
|---|------|----------|
| 01 | [Giới thiệu & Cài đặt](reactjs/01-gioi-thieu-va-cai-dat.md) | React là gì, setup, project đầu tiên |
| 02 | [JSX Cơ Bản](reactjs/02-jsx-co-ban.md) | Cú pháp JSX, biểu thức, fragments |
| 03 | [Components](reactjs/03-components.md) | Function/Class Components, tổ chức |
| 04 | [Props](reactjs/04-props.md) | Truyền dữ liệu, PropTypes, children |
| 05 | [State](reactjs/05-state.md) | useState, quản lý state, immutability |
| 06 | [Event Handling](reactjs/06-event-handling.md) | Synthetic events, event delegation |
| 07 | [Conditional Rendering](reactjs/07-conditional-rendering.md) | If/else, ternary, short-circuit |
| 08 | [Lists & Keys](reactjs/08-lists-va-keys.md) | Render danh sách, keys |
| 09 | [Forms](reactjs/09-forms.md) | Controlled/Uncontrolled, validation |
| 10 | [Hooks Cơ Bản](reactjs/10-hooks-co-ban.md) | useState, useEffect, useContext, useRef |
| 11 | [Hooks Nâng Cao](reactjs/11-hooks-nang-cao.md) | useReducer, useMemo, useCallback, Custom |
| 12 | [Lifecycle](reactjs/12-lifecycle.md) | Mounting, Updating, Unmounting |
| 13 | [Context API](reactjs/13-context-api.md) | createContext, Provider, patterns |
| 14 | [React Router](reactjs/14-react-router.md) | Routing, nested routes, guards |
| 15 | [API Integration](reactjs/15-api-integration.md) | fetch, axios, error handling |
| 16 | [State Management](reactjs/16-state-management.md) | Redux, Zustand, Recoil, Jotai |
| 17 | [Performance](reactjs/17-performance-optimization.md) | Memoization, code splitting, profiling |
| 18 | [Testing](reactjs/18-testing.md) | Unit, integration, E2E, TDD |
| 19 | [Advanced Patterns](reactjs/19-advanced-patterns.md) | HOC, Render Props, Compound Components |
| 20 | [TypeScript + React](reactjs/20-typescript-react.md) | Typing components, hooks, generics |
| 21 | [SSR](reactjs/21-server-side-rendering.md) | Next.js, SSR, SSG, ISR |
| 22 | [React Server Components](reactjs/22-react-server-components.md) | RSC, Server Actions, Streaming |
| 23 | [Architecture](reactjs/23-architecture-design.md) | Kiến trúc, monorepo, micro-frontends |
| 24 | [DevOps & Deployment](reactjs/24-devops-deployment.md) | CI/CD, Docker, cloud |
| 25 | [React Internals](reactjs/25-react-internals.md) | Fiber, Reconciliation, Virtual DOM |
| 26 | [Best Practices](reactjs/26-best-practices.md) | SOLID, DRY, code review |
| 27 | [Dự Án Thực Tế](reactjs/27-du-an-thuc-te.md) | 5 dự án từ đơn giản đến phức tạp |
| 28 | [Interview Preparation](reactjs/28-interview-preparation.md) | 200+ câu hỏi phỏng vấn |

---

### 🔷 ReactTS — React + TypeScript (8 bài)

| # | File | Nội dung |
|---|------|----------|
| 01 | [ReactTS khác gì ReactJS?](reactts/01-reactts-khac-gi-reactjs.md) | So sánh, ưu/nhược, khi nào dùng TS |
| 02 | [Setup & Conventions](reactts/02-setup-va-conventions.md) | Vite/Next.js setup, tsconfig, folder structure |
| 03 | [Typing Props & Events](reactts/03-typing-props-events.md) | FC, ComponentProps, Event types, children |
| 04 | [Typing Hooks](reactts/04-typing-hooks.md) | useState, useRef, useReducer, generic hooks |
| 05 | [Forms & API](reactts/05-typing-forms-api.md) | Form events, API response typing, Zod |
| 06 | [Generic Components](reactts/06-generic-components.md) | Table\<T\>, Select\<T\>, type-safe patterns |
| 07 | [Advanced Patterns](reactts/07-advanced-patterns.md) | Discriminated unions, utility types |
| 08 | [Migration & Interview](reactts/08-migration-interview.md) | JS→TS checklist, câu hỏi phỏng vấn |

---

## 🎯 Lộ trình học

### Người mới → Junior (0-6 tháng)
1. **Web**: 01–04 (CSS, Layout, SCSS, Responsive)
2. **Angular** hoặc **ReactJS**: Bài 01–09 (nền tảng)

### Junior → Mid (6-18 tháng)
3. **Web**: 05–09 (Reactive, A11y, Performance, Security)
4. **Angular** 10–16 hoặc **ReactJS** 10–16 (hooks, state, testing)

### Mid → Senior (18-36 tháng)
5. **Angular** 17–23 hoặc **ReactJS** 17–24 (advanced, SSR, architecture)
6. **ReactTS** (nếu dùng React)
7. **Web** bài 10 — Senior Checklist

### Senior → Master (3-10 năm)
8. **ReactJS** 25–28 hoặc **Angular** 15, 21–23
9. **MASTER-FRONTEND-CHECKLIST** — ôn phỏng vấn master

---

## 📝 Cấu trúc mỗi bài

- **Khái niệm**: Giải thích ngắn gọn
- **Ví dụ code**: Angular/React/TypeScript minh họa
- **Best practices**: Gợi ý khi dùng trong dự án thật
- **Câu hỏi thường gặp**: FAQ và gợi ý trả lời phỏng vấn

## 🔗 Công cụ & tài liệu chính thức

- [Angular Documentation](https://angular.dev)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS](https://rxjs.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📁 Project minh họa (example)

- **[web/example](web/example/)** — Trang tĩnh HTML/CSS/JS
- **[angular/example](angular/example/)** — Ứng dụng Angular chạy được
- **[reactjs/reactjs-demo](reactjs/reactjs-demo/)** — Ứng dụng ReactJS demo
