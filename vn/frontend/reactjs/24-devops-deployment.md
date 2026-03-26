# Bài 24: DevOps & Deployment

## 📚 Mục tiêu bài học
- Build & optimize production bundle
- Deployment platforms (Vercel, Netlify, AWS)
- CI/CD pipelines
- Docker containerization
- Monitoring & error tracking

---

## 1. Production Build

```bash
# Vite
npm run build        # Output: dist/
npm run preview      # Preview production build locally

# Next.js
npm run build        # Output: .next/
npm start            # Start production server
```

### Bundle Analysis

```bash
# Vite
npm install -D rollup-plugin-visualizer
# Thêm vào vite.config.js → tạo stats.html

# Next.js
npm install -D @next/bundle-analyzer
```

### Optimization Checklist

```
Production Build Checklist:
□ Code splitting (lazy load routes)
□ Tree shaking (remove unused code)
□ Image optimization (next/image, WebP)
□ Font optimization (next/font, font-display: swap)
□ Minification (tự động với Vite/Next.js)
□ Gzip/Brotli compression
□ Cache headers cho static assets
□ Environment variables (VITE_*, NEXT_PUBLIC_*)
□ Source maps (disabled in production)
□ Bundle size < 200KB (initial load)
```

---

## 2. Deployment Platforms

### 2.1 Vercel (Best for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 2.2 Docker

```dockerfile
# Dockerfile (Multi-stage build)
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf (SPA routing)
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

```bash
docker build -t my-react-app .
docker run -p 3000:80 my-react-app
```

---

## 3. CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 4. Environment Variables

```bash
# .env.local (không commit)
VITE_API_URL=http://localhost:3001
VITE_GA_ID=UA-XXXXX

# .env.production
VITE_API_URL=https://api.myapp.com
VITE_GA_ID=UA-YYYYY
```

```tsx
// Sử dụng
const apiUrl = import.meta.env.VITE_API_URL;

// Next.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Client
const secret = process.env.DATABASE_URL;         // Server only
```

---

## 5. Monitoring & Error Tracking

### Sentry (Error Tracking)

```bash
npm install @sentry/react
```

```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});

// Error Boundary tự động
const App = Sentry.withProfiler(function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <Router>
        <Routes />
      </Router>
    </Sentry.ErrorBoundary>
  );
});
```

### Web Vitals

```tsx
// Theo dõi Core Web Vitals
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function reportWebVitals(metric) {
  // Gửi lên analytics
  console.log(metric.name, metric.value);
}

onCLS(reportWebVitals);   // Cumulative Layout Shift
onFID(reportWebVitals);   // First Input Delay
onLCP(reportWebVitals);   // Largest Contentful Paint
onFCP(reportWebVitals);   // First Contentful Paint
onTTFB(reportWebVitals);  // Time to First Byte
```

---

## 6. Performance Budget

```
Target Metrics:
├── LCP (Largest Contentful Paint) < 2.5s
├── FID (First Input Delay) < 100ms
├── CLS (Cumulative Layout Shift) < 0.1
├── Initial JS bundle < 200KB (gzipped)
├── Time to Interactive < 3.5s
└── Lighthouse score > 90
```

---

## 📝 Bài Tập

### Bài 1: Deploy Vite app lên Vercel
### Bài 2: Dockerize React app
### Bài 3: Setup GitHub Actions CI/CD pipeline
### Bài 4: Add Sentry error tracking + Web Vitals monitoring

---

> **Bài trước:** [23 - Architecture ←](./23-architecture-design.md)  
> **Bài tiếp theo:** [25 - React Internals →](./25-react-internals.md)
