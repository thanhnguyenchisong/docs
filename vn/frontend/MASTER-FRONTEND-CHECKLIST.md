# Checklist Master Frontend — Tự tin pass phỏng vấn Master Frontend

Sau khi **học thuộc hết** nội dung trong toàn bộ folder frontend (Web, Angular, ReactJS, ReactTS), dùng checklist này để **tự kiểm tra**. Trả lời rõ ràng hầu hết các mục = **hoàn toàn tự tin pass phỏng vấn master frontend**.

---

## 1. Web Fundamentals

### CSS & Layout
- [ ] **Box model**: content, padding, border, margin; `box-sizing: border-box`.
- [ ] **Flexbox**: main/cross axis, justify-content, align-items; khi nào dùng.
- [ ] **CSS Grid**: grid-template, fr unit, auto-fill/auto-fit; Grid vs Flexbox.
- [ ] **Positioning**: static, relative, absolute, fixed, sticky — use case.
- [ ] **Specificity**: inline > id > class > tag; cách tính, khi nào dùng `!important`.
- [ ] **CSS Variables**: `--var`, `var()`, theming, dark mode.
- [ ] **SCSS/Sass**: variables, nesting, mixins, functions, partials, @use.

### Responsive & Performance
- [ ] **Media queries**: min-width (mobile-first), breakpoints chuẩn.
- [ ] **Responsive images**: srcset, sizes, `<picture>`, lazy loading.
- [ ] **Core Web Vitals**: LCP, FID/INP, CLS — ý nghĩa, cách cải thiện.
- [ ] **Code splitting**: lazy loading routes, dynamic import, tree shaking.
- [ ] **Caching**: cache headers, service worker, CDN.

### Browser & Security
- [ ] **Event Loop**: call stack, task queue, microtask, requestAnimationFrame.
- [ ] **DOM**: reflow vs repaint; virtual DOM vs incremental DOM.
- [ ] **XSS**: types (reflected, stored, DOM), phòng: escape output, CSP.
- [ ] **CSRF**: token, SameSite cookie.
- [ ] **CORS**: preflight, simple request; cấu hình server.
- [ ] **CSP**: Content-Security-Policy header.

### Accessibility (A11y)
- [ ] **ARIA**: roles, states, properties; khi nào cần, khi nào không.
- [ ] **Keyboard navigation**: focus management, tab order, skip links.
- [ ] **Screen readers**: alt text, aria-label, live regions.
- [ ] **Color contrast**: WCAG 2.1 AA (4.5:1 text, 3:1 large).

---

## 2. Angular

### Core
- [ ] **Components**: standalone, input/output, lifecycle hooks, change detection.
- [ ] **Templates**: data binding (interpolation, property, event, two-way).
- [ ] **Directives**: structural (@if, @for, @switch), attribute, custom.
- [ ] **Pipes**: built-in (async, date, currency), custom, pure vs impure.
- [ ] **Services & DI**: providedIn, inject(), injection token, scope.
- [ ] **Routing**: lazy loading, guards (canActivate, canDeactivate), resolvers.

### Forms & HTTP
- [ ] **Reactive Forms**: FormGroup, FormControl, validators, dynamic forms.
- [ ] **Template-driven Forms**: ngModel, validation.
- [ ] **HttpClient**: interceptors (auth, error), retry, caching.
- [ ] **Error handling**: global ErrorHandler, HTTP interceptor, user feedback.

### State & Architecture
- [ ] **NgRx**: Store, Actions, Reducers, Effects, Selectors — khi nào cần.
- [ ] **NgRx Signal Store**: signalStore, withState, withMethods, patchState.
- [ ] **Signals**: signal(), computed(), effect(), linkedSignal, resource().
- [ ] **Zoneless**: provideExperimentalZonelessChangeDetection, migration.
- [ ] **Design patterns**: Smart/Presentational, Facade, Strategy, Repository.
- [ ] **Module architecture**: core, shared, feature modules; lazy loading.

### Advanced
- [ ] **Change Detection**: Default vs OnPush; markForCheck; signal-based CD.
- [ ] **SSR & Hydration**: Angular Universal, hydration, transfer state.
- [ ] **@defer**: triggers (viewport, idle, hover), prefetch, vs lazy route.
- [ ] **Micro-frontends**: Module Federation, Nx monorepo.
- [ ] **Performance**: OnPush, trackBy/@for track, bundle analysis, lazy loading.

---

## 3. React

### Core
- [ ] **JSX**: expressions, fragments, conditional rendering, lists & keys.
- [ ] **Components**: function vs class, pure components, composition vs inheritance.
- [ ] **Props**: PropTypes, default props, children patterns, prop drilling.
- [ ] **State**: useState, immutability, batching, lifting state up.
- [ ] **Event handling**: synthetic events, event delegation, preventing default.

### Hooks
- [ ] **useState**: initial value, callback form, lazy initialization.
- [ ] **useEffect**: dependencies, cleanup, sync vs async, fetch patterns.
- [ ] **useRef**: DOM refs, mutable refs, forwarding refs.
- [ ] **useMemo / useCallback**: when to use, over-optimization pitfalls.
- [ ] **useReducer**: complex state, action patterns, vs useState.
- [ ] **useContext**: creating, providing, consuming; performance gotchas.
- [ ] **Custom hooks**: rules, naming, composition, testing.

### State Management
- [ ] **Context API**: when to use vs dedicated library; re-render issues.
- [ ] **Redux / Redux Toolkit**: createSlice, configureStore, createAsyncThunk.
- [ ] **Zustand**: lightweight alternative, when to choose.
- [ ] **Server state**: TanStack Query — caching, stale, background refetch.

### Advanced
- [ ] **Patterns**: HOC, Render Props, Compound Components, hooks patterns.
- [ ] **Performance**: React.memo, code splitting, lazy(), Suspense, virtualization.
- [ ] **React 18/19**: Concurrent features, useTransition, useDeferredValue, automatic batching.
- [ ] **RSC**: React Server Components, Server Actions, streaming SSR.
- [ ] **SSR/SSG/ISR**: Next.js, when to use, hydration.
- [ ] **Fiber**: reconciliation, virtual DOM, diffing algorithm, priority scheduling.

### TypeScript + React
- [ ] **Props typing**: type vs interface, ComponentProps, discriminated unions.
- [ ] **Hooks typing**: useState<T>, useRef<T>(null), useReducer with typed actions.
- [ ] **Generic components**: List<T>, Select<T>, constrained generics.
- [ ] **Zod + React Hook Form**: runtime validation + type inference.
- [ ] **Migration**: JS → TS incremental strategy.

---

## 4. Testing

- [ ] **Unit testing**: Jest/Vitest, Testing Library — render, queries, assertions.
- [ ] **Component testing**: user events, async operations, mocking.
- [ ] **Integration testing**: multi-component flows, API mocking.
- [ ] **E2E testing**: Cypress/Playwright — critical user flows.
- [ ] **Testing strategy**: pyramid (unit 70%, integration 20%, E2E 10%).
- [ ] **What to test**: behavior not implementation; user-centric queries.

---

## 5. Architecture & System Design (Master Level)

- [ ] **Design system**: tokens, primitives, atoms, molecules, organisms; Storybook.
- [ ] **Micro-frontends**: Module Federation, routing, shared deps, CSS isolation.
- [ ] **Monorepo**: Nx, Turborepo; library sharing, build caching.
- [ ] **State architecture**: server state vs client state; when to use context vs library.
- [ ] **API design**: REST vs GraphQL; BFF pattern; error handling conventions.
- [ ] **Performance at scale**: bundle analysis, lazy loading strategy, CDN, edge rendering.
- [ ] **Accessibility at scale**: a11y audit, automated testing, ARIA patterns.
- [ ] **CI/CD for frontend**: build, test, lint, deploy; preview environments.

---

## 6. Cách Dùng Checklist

1. **Học đủ** toàn bộ tài liệu trong từng folder (web, angular, reactjs, reactts).
2. **Tự hỏi từng mục** trong checklist; chưa trả lời được thì quay lại bài tương ứng.
3. **Thực hành**: build project Angular hoặc React hoàn chỉnh (routing, forms, API, auth, test, deploy).
4. **Ôn System Design**: thiết kế Instagram feed, dashboard analytics, e-commerce — component tree, state, data flow, performance.

---

## 7. Kết Luận

**Học thuộc hết** nội dung frontend trong folder + **trả lời được rõ ràng** đa số câu trong checklist trên = bạn có đủ nền **master frontend** để **tự tin pass phỏng vấn master frontend**. Các chủ đề Web, CSS, Angular, React, TypeScript, Testing, Performance, Architecture đều được phủ bởi tài liệu hiện có; checklist giúp bạn không bỏ sót.

→ Quay lại [README](./README.md) để xem lộ trình và mục lục từng folder.
