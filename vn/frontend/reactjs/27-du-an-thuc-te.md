# Bài 27: Dự Án Thực Tế - Từ Ý Tưởng Đến Production

## 📚 Mục tiêu bài học
- 5 dự án từ đơn giản đến phức tạp
- Mỗi dự án áp dụng kiến thức cụ thể
- Hướng dẫn thiết kế, coding, deploy
- Portfolio-ready projects

---

## 🎯 Dự Án 1: Personal Portfolio (Beginner)

### Mục tiêu học:
Components, Props, CSS, Responsive Design

### Features:
- Hero section với animation
- About me section
- Skills với progress bars
- Projects showcase (grid layout)
- Contact form
- Dark/Light mode toggle
- Smooth scroll navigation

### Tech Stack:
```
Vite + React + CSS Modules
```

### Cấu trúc:
```
src/
├── components/
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Skills.jsx
│   ├── Projects.jsx
│   ├── Contact.jsx
│   └── ThemeToggle.jsx
├── data/
│   ├── projects.json
│   └── skills.json
├── styles/
│   └── globals.css
├── App.jsx
└── main.jsx
```

### Hướng dẫn từng bước:
1. Thiết kế UI trên Figma hoặc trên giấy
2. Setup Vite project
3. Tạo layout components (Header, Footer)
4. Xây dựng từng section
5. Thêm responsive CSS (mobile-first)
6. Thêm dark mode (Context API)
7. Deploy lên Vercel/Netlify

---

## 🎯 Dự Án 2: Todo App Nâng Cao (Intermediate)

### Mục tiêu học:
State, Hooks, localStorage, CRUD, Filtering

### Features:
- Thêm, sửa, xóa, toggle todo
- Drag & drop sắp xếp lại
- Filter: All / Active / Completed
- Search real-time
- Categories / Tags
- Due dates
- Priority levels (High, Medium, Low)
- Persist với localStorage
- Statistics dashboard (% hoàn thành)
- Keyboard shortcuts

### Tech Stack:
```
Vite + React + TypeScript + CSS Modules
```

### State Design:
```typescript
interface Todo {
  id: string;
  text: string;
  done: boolean;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  createdAt: string;
}

interface AppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'date' | 'priority' | 'name';
}
```

### Custom Hooks cần tạo:
```
useLocalStorage   - Persist state
useTodos          - CRUD operations
useFilter         - Filter & search logic
useKeyboardShortcuts - Keyboard shortcuts
```

---

## 🎯 Dự Án 3: E-Commerce Store (Advanced)

### Mục tiêu học:
Router, State Management, API, Auth, Context

### Features:
- Product listing với filters (category, price range, rating)
- Product detail page
- Shopping cart (add, remove, update quantity)
- User authentication (login/register)
- Checkout flow (multi-step form)
- Order history
- Search với autocomplete
- Wishlist / Favorites
- Product reviews & ratings
- Responsive design

### Tech Stack:
```
Vite + React + TypeScript + React Router
+ Zustand (state) + TanStack Query (data fetching)
+ React Hook Form (forms)
```

### Cấu trúc Feature-based:
```
src/
├── features/
│   ├── auth/
│   │   ├── components/ (LoginForm, RegisterForm, AuthGuard)
│   │   ├── hooks/ (useAuth)
│   │   └── store/ (authStore)
│   ├── products/
│   │   ├── components/ (ProductCard, ProductGrid, ProductFilters)
│   │   ├── hooks/ (useProducts, useProductDetail)
│   │   └── services/ (productService)
│   ├── cart/
│   │   ├── components/ (CartItem, CartSummary, CartDrawer)
│   │   ├── hooks/ (useCart)
│   │   └── store/ (cartStore)
│   └── checkout/
│       ├── components/ (ShippingForm, PaymentForm, OrderSummary)
│       └── hooks/ (useCheckout)
├── shared/
│   ├── components/ (Button, Input, Modal, Rating, Spinner)
│   ├── hooks/ (useFetch, useDebounce, useLocalStorage)
│   └── utils/ (formatPrice, validators)
├── pages/
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── Profile.tsx
└── app/
    ├── App.tsx
    ├── routes.tsx
    └── providers.tsx
```

### API (Mock hoặc dùng):
```
JSONPlaceholder, FakeStoreAPI, DummyJSON
Hoặc tự tạo mock server: json-server, MSW
```

---

## 🎯 Dự Án 4: Real-time Chat App (Advanced+)

### Mục tiêu học:
WebSocket, Real-time updates, Complex state

### Features:
- Real-time messaging (WebSocket)
- Multiple chat rooms / channels
- Direct messages (DM)
- User presence (online/offline/typing)
- Message reactions (emoji)
- File/Image sharing
- Message search
- Notifications (browser notifications)
- Read receipts
- User profiles & avatars

### Tech Stack:
```
Next.js + TypeScript + Socket.io
+ Zustand + TanStack Query
+ Prisma + PostgreSQL (backend)
```

### Key Concepts:
```typescript
// WebSocket connection management
function useChatSocket(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('ws://localhost:3001', {
      query: { roomId },
    });

    socket.on('message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', ({ userId, isTyping }) => {
      setTypingUsers(prev =>
        isTyping ? [...prev, userId] : prev.filter(id => id !== userId)
      );
    });

    socketRef.current = socket;

    return () => { socket.disconnect(); };
  }, [roomId]);

  const sendMessage = (text: string) => {
    socketRef.current?.emit('message', { text, roomId });
  };

  return { messages, typingUsers, sendMessage };
}
```

---

## 🎯 Dự Án 5: SaaS Dashboard (Expert)

### Mục tiêu học:
Full-stack, Performance, Testing, Deployment, Architecture

### Features:
- Authentication (JWT + OAuth Google/GitHub)
- Role-based access (Admin, Manager, User)
- Analytics dashboard với charts
- Data tables (sort, filter, pagination, export CSV)
- CRUD cho resources (projects, tasks, users)
- File upload (drag & drop)
- Email notifications
- Activity logs / Audit trail
- Settings page (profile, preferences, team)
- API rate limiting indicator
- Dark mode
- Internationalization (vi/en)
- PWA (Progressive Web App)
- Full test coverage (unit + integration + E2E)

### Tech Stack:
```
Next.js 14+ App Router + TypeScript
+ Prisma + PostgreSQL
+ NextAuth.js (auth)
+ TanStack Query + Table
+ Recharts (charts)
+ React Hook Form + Zod (validation)
+ Vitest + Playwright (testing)
+ Docker + CI/CD
```

### Architecture:
```
Project Structure:
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard group (protected)
│   │   ├── layout.tsx     # Dashboard layout + auth guard
│   │   ├── page.tsx       # Overview
│   │   ├── analytics/
│   │   ├── projects/
│   │   ├── users/
│   │   └── settings/
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Design system
│   ├── charts/            # Chart components
│   └── data-table/        # Table components
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── api.ts
├── prisma/
│   └── schema.prisma
├── __tests__/             # Tests
├── docker-compose.yml
└── .github/workflows/     # CI/CD
```

---

## 📋 Portfolio Tips

```
1. Quality > Quantity: 3-5 dự án tốt > 10 dự án sơ sài
2. Mỗi dự án PHẢI có README.md đầy đủ:
   - Screenshots/Demo GIF
   - Tech stack
   - Features list
   - Setup instructions
   - Live demo link
3. Deploy TẤT CẢ dự án lên production
4. Có tests (ít nhất unit tests cho core logic)
5. Responsive design (mobile-first)
6. Accessibility basics
7. Clean code, proper Git commits
8. Tăng dần complexity khi phỏng vấn
```

### Thứ tự khuyến nghị:

```
Beginner:    Portfolio → Todo
Intermediate: Todo → E-Commerce
Advanced:    E-Commerce → Chat App
Expert:      Chat App → SaaS Dashboard
```

---

## 📝 Bài Tập

Chọn 1 dự án phù hợp với level hiện tại và hoàn thành trong 2-4 tuần. Yêu cầu:
- ✅ Deploy lên Vercel/Netlify
- ✅ README.md đầy đủ
- ✅ Responsive design
- ✅ Có ít nhất 5 unit tests
- ✅ Clean Git history

---

> **Bài trước:** [26 - Best Practices ←](./26-best-practices.md)  
> **Bài tiếp theo:** [28 - Interview Preparation →](./28-interview-preparation.md)
