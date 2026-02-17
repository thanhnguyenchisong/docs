# Master Node.js — Architecture, Patterns & Checklist Phỏng vấn

## Mục lục
1. [Architecture Patterns](#architecture-patterns)
2. [Design Patterns trong Node.js](#design-patterns)
3. [TypeScript với Node.js](#typescript)
4. [Scalability](#scalability)
5. [Observability](#observability)
6. [Checklist Phỏng vấn Senior/Master Node.js](#checklist-phỏng-vấn)

---

## Architecture Patterns

### 1. Layered Architecture

```
┌──────────────────────────┐
│    Routes / Controllers  │  ← HTTP, validation
├──────────────────────────┤
│      Services / Use Cases│  ← Business logic
├──────────────────────────┤
│    Repositories / DAL    │  ← Database access
├──────────────────────────┤
│      Models / Entities   │  ← Data structure
└──────────────────────────┘
```

```javascript
// Controller — chỉ xử lý HTTP
class UserController {
  constructor(userService) { this.userService = userService; }
  
  async create(req, res, next) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) { next(err); }
  }
}

// Service — business logic
class UserService {
  constructor(userRepo, emailService) {
    this.userRepo = userRepo;
    this.emailService = emailService;
  }
  
  async createUser(data) {
    const exists = await this.userRepo.findByEmail(data.email);
    if (exists) throw new ConflictError('Email already exists');
    const user = await this.userRepo.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// Repository — chỉ thao tác DB
class UserRepository {
  async findByEmail(email) { return User.findOne({ email }); }
  async create(data) { return User.create(data); }
}
```

### 2. Clean Architecture / Hexagonal

```
                    ┌──────────────────┐
                    │   Frameworks     │  Express, Mongoose, ...
                    │   & Drivers      │
                    └────────┬─────────┘
                    ┌────────▼─────────┐
                    │   Interface      │  Controllers, Presenters
                    │   Adapters       │
                    └────────┬─────────┘
                    ┌────────▼─────────┐
                    │   Use Cases      │  Application business rules
                    └────────┬─────────┘
                    ┌────────▼─────────┐
                    │   Entities       │  Enterprise business rules
                    └──────────────────┘
```

Nguyên tắc: dependencies hướng vào trong (domain không phụ thuộc framework).

### 3. Event-Driven Architecture

```javascript
// Event bus
const EventEmitter = require('events');
const eventBus = new EventEmitter();

// Service A: publish event
async function createOrder(data) {
  const order = await orderRepo.create(data);
  eventBus.emit('order:created', order); // fire and forget
  return order;
}

// Service B: listen
eventBus.on('order:created', async (order) => {
  await inventoryService.reserveItems(order.items);
});

// Service C: listen
eventBus.on('order:created', async (order) => {
  await emailService.sendConfirmation(order.userId);
});
```

---

## Design Patterns

### Singleton

```javascript
// Database connection (chỉ tạo 1 lần)
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = null;
    Database.instance = this;
  }
  
  async connect(url) {
    if (!this.connection) {
      this.connection = await mongoose.connect(url);
    }
    return this.connection;
  }
}

module.exports = new Database(); // Node.js cache module → singleton tự nhiên
```

### Factory

```javascript
function createLogger(type) {
  switch (type) {
    case 'file': return new FileLogger();
    case 'console': return new ConsoleLogger();
    case 'remote': return new RemoteLogger();
    default: throw new Error(`Unknown logger: ${type}`);
  }
}
```

### Strategy

```javascript
// Payment strategies
const strategies = {
  creditCard: (amount) => { /* charge card */ },
  paypal: (amount) => { /* PayPal API */ },
  bankTransfer: (amount) => { /* bank API */ },
};

async function processPayment(method, amount) {
  const strategy = strategies[method];
  if (!strategy) throw new Error('Unknown payment method');
  return strategy(amount);
}
```

### Middleware Pattern (Express đã dùng)

```javascript
function compose(...middlewares) {
  return (req, res) => {
    let index = 0;
    function next() {
      if (index < middlewares.length) {
        middlewares[index++](req, res, next);
      }
    }
    next();
  };
}
```

### Repository Pattern

```javascript
// Interface (concept)
class IUserRepository {
  findById(id) { throw new Error('Not implemented'); }
  create(data) { throw new Error('Not implemented'); }
}

// MongoDB implementation
class MongoUserRepository extends IUserRepository {
  async findById(id) { return UserModel.findById(id); }
  async create(data) { return UserModel.create(data); }
}

// PostgreSQL implementation
class PgUserRepository extends IUserRepository {
  async findById(id) { return prisma.user.findUnique({ where: { id } }); }
  async create(data) { return prisma.user.create({ data }); }
}

// Service không phụ thuộc implementation
class UserService {
  constructor(userRepo) { this.userRepo = userRepo; } // inject
}
```

---

## TypeScript

### Setup

```bash
npm install -D typescript @types/node @types/express ts-node
npx tsc --init
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true
  }
}
```

### Typed Express

```typescript
import express, { Request, Response, NextFunction } from 'express';

interface CreateUserBody {
  name: string;
  email: string;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
}

app.post('/api/users', async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});
```

---

## Scalability

### Horizontal Scaling

```
                    ┌─────────────┐
                    │ Load Balancer│  (nginx, HAProxy, K8s)
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ Node 1 │  │ Node 2 │  │ Node 3 │
         └────────┘  └────────┘  └────────┘
              │            │            │
              └────────────┼────────────┘
                     ┌─────▼─────┐
                     │ Database  │  (+ Read replicas)
                     └───────────┘
```

### Checklist Scale

1. **Stateless servers** — session trong Redis, không trong memory.
2. **Database**: Connection pooling, read replicas, caching (Redis).
3. **Async processing**: Message queue cho tasks nặng.
4. **CDN**: Static assets.
5. **Container**: Docker + Kubernetes.

---

## Observability

### Health Check

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
  });
});

// Readiness check (DB connected?)
app.get('/ready', async (req, res) => {
  try {
    await db.ping();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
```

### Metrics (Prometheus)

```bash
npm install prom-client
```

```javascript
const promClient = require('prom-client');
promClient.collectDefaultMetrics();

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### Distributed Tracing

Dùng **OpenTelemetry** để trace request xuyên suốt nhiều services.

---

## Checklist Phỏng vấn

### Level: Junior

- [ ] Node.js là gì? Single-threaded nghĩa là gì?
- [ ] Event Loop hoạt động thế nào? 6 phases?
- [ ] CommonJS vs ES Modules?
- [ ] Callback, Promise, async/await?
- [ ] `process.nextTick()` vs `setImmediate()`?
- [ ] Core modules: fs, path, http, events?
- [ ] npm: dependencies vs devDependencies? package-lock.json?
- [ ] Express: middleware, routing, error handling?
- [ ] REST API: methods, status codes, URL design?

### Level: Mid

- [ ] Microtask vs Macrotask? Thứ tự thực thi?
- [ ] Stream types? Khi nào dùng stream?
- [ ] Backpressure? `pipe()` vs `pipeline()`?
- [ ] JWT: cấu trúc, access token vs refresh token?
- [ ] Password hashing: bcrypt cost factor?
- [ ] Mongoose: schema, hooks, virtual, populate?
- [ ] Prisma vs Sequelize?
- [ ] Testing: unit vs integration? Mock vs spy?
- [ ] Error handling: operational vs programming error?
- [ ] Docker: multi-stage build? layer caching?

### Level: Senior / Master

- [ ] V8: JIT compilation, Hidden Classes, GC?
- [ ] Worker Threads vs Cluster? Khi nào dùng gì?
- [ ] Memory leak: nguyên nhân, phát hiện, fix?
- [ ] Caching: in-memory vs Redis? Cache invalidation?
- [ ] Rate limiting implementation?
- [ ] Microservices: Circuit Breaker, Saga, CQRS?
- [ ] gRPC vs REST cho inter-service?
- [ ] Event-driven architecture?
- [ ] Database per service? Distributed transactions?
- [ ] Clean Architecture / Hexagonal? Dependency Injection?
- [ ] Design Patterns: Singleton, Factory, Strategy, Repository?
- [ ] Scalability: horizontal scaling, stateless, connection pooling?
- [ ] Observability: logging, metrics (Prometheus), tracing?
- [ ] Security: OWASP Top 10, CSP, XSS, CSRF, injection?
- [ ] CI/CD: Docker, Kubernetes, health checks?
- [ ] TypeScript + Node.js: generics, strict mode, type guards?
- [ ] Performance profiling: flame graph, heap snapshot?

### Câu hỏi System Design

- [ ] Thiết kế URL shortener (bit.ly)?
- [ ] Thiết kế chat real-time (WebSocket + message queue)?
- [ ] Thiết kế notification system (push, email, SMS)?
- [ ] Thiết kế rate limiter (token bucket, sliding window)?
- [ ] Thiết kế file upload service (stream, S3, CDN)?

---

**Mục tiêu cuối cùng**: Trả lời được toàn bộ checklist trên → **Master Node.js**, sẵn sàng phỏng vấn senior/lead backend.

---

**Quay lại**: [README — Mục lục tổng](./README.md)
