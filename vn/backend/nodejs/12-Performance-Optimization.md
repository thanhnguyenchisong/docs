# Performance & Optimization

## Mục lục
1. [Cluster Module](#cluster-module)
2. [Worker Threads](#worker-threads)
3. [Caching Strategies](#caching-strategies)
4. [Memory Management](#memory-management)
5. [Profiling & Benchmarking](#profiling--benchmarking)
6. [Production Checklist](#production-checklist)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Cluster Module

Tạo **nhiều process** Node.js, mỗi process dùng 1 CPU core → tận dụng multi-core.

```javascript
const cluster = require('cluster');
const os = require('os');
const express = require('express');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} — forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died (${code})`);
    cluster.fork(); // restart
  });
} else {
  const app = express();
  app.get('/', (req, res) => res.json({ pid: process.pid }));
  app.listen(3000, () => console.log(`Worker ${process.pid} listening`));
}
```

### Hoặc dùng PM2 (production)

```bash
npm install -g pm2

# Cluster mode (tự động fork theo CPU)
pm2 start app.js -i max

pm2 list
pm2 monit
pm2 logs
pm2 restart all
pm2 reload all   # zero-downtime restart
pm2 stop all
```

---

## Worker Threads

Chạy **CPU-intensive tasks** trên thread riêng, không block Event Loop.

```javascript
// main.js
const { Worker } = require('worker_threads');

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./heavy-task.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

app.get('/compute', async (req, res) => {
  const result = await runWorker({ n: parseInt(req.query.n) || 1000000 });
  res.json({ result });
});

// heavy-task.js
const { workerData, parentPort } = require('worker_threads');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData.n);
parentPort.postMessage(result);
```

### Worker Pool

```javascript
// Tái sử dụng workers thay vì tạo mới mỗi lần
const { StaticPool } = require('node-worker-threads-pool');

const pool = new StaticPool({
  size: 4,
  task: './heavy-task.js',
});

const result = await pool.exec({ n: 40 });
```

---

## Caching Strategies

### In-memory cache (node-cache)

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 phút TTL

async function getUser(id) {
  const cached = cache.get(`user:${id}`);
  if (cached) return cached;

  const user = await db.findUser(id);
  cache.set(`user:${id}`, user);
  return user;
}
```

### Redis cache (distributed)

```javascript
const redis = require('ioredis');
const client = new redis();

// Cache-aside pattern
async function getCachedData(key, fetchFn, ttl = 300) {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await client.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}

// Cache middleware
function cacheMiddleware(ttl = 60) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      client.set(key, JSON.stringify(data), 'EX', ttl);
      return originalJson(data);
    };
    next();
  };
}

app.get('/api/products', cacheMiddleware(120), productController);
```

### HTTP Caching

```javascript
// ETag
app.get('/api/data', (req, res) => {
  const data = getData();
  const etag = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.set('ETag', etag);
  res.set('Cache-Control', 'public, max-age=60');
  res.json(data);
});
```

---

## Memory Management

### Phát hiện memory leak

```javascript
// Theo dõi memory
setInterval(() => {
  const { heapUsed, heapTotal, rss } = process.memoryUsage();
  console.log({
    heapUsed: `${(heapUsed / 1024 / 1024).toFixed(1)}MB`,
    heapTotal: `${(heapTotal / 1024 / 1024).toFixed(1)}MB`,
    rss: `${(rss / 1024 / 1024).toFixed(1)}MB`,
  });
}, 10000);
```

### Nguyên nhân phổ biến

```javascript
// ❌ Global array tăng mãi
const logs = [];
app.use((req, res, next) => {
  logs.push({ url: req.url, time: Date.now() }); // leak!
  next();
});

// ❌ Event listeners tích tụ
setInterval(() => {
  emitter.on('data', handler); // thêm listener mỗi lần → leak
}, 1000);

// ❌ Closure giữ reference
function createHandler() {
  const bigData = Buffer.alloc(100 * 1024 * 1024); // 100MB
  return (req, res) => {
    res.json({ size: bigData.length }); // bigData không bao giờ được GC
  };
}
```

### Tăng heap size

```bash
node --max-old-space-size=4096 app.js   # 4GB heap
```

---

## Profiling & Benchmarking

### Node.js built-in profiler

```bash
node --prof app.js
# Tạo load → Ctrl+C
node --prof-process isolate-*.log > profile.txt
```

### Clinic.js

```bash
npm install -g clinic
clinic doctor -- node app.js
clinic flame -- node app.js    # flame graph
clinic bubbleprof -- node app.js
```

### Benchmarking

```bash
# autocannon — HTTP benchmarking
npm install -g autocannon
autocannon -c 100 -d 10 http://localhost:3000/api/users
# 100 connections, 10 seconds

# ab (Apache Bench)
ab -n 1000 -c 50 http://localhost:3000/api/users
```

---

## Production Checklist

| # | Item | Công cụ |
|---|------|---------|
| 1 | Cluster / PM2 | `pm2 start -i max` |
| 2 | Environment variables | dotenv, .env (KHÔNG commit) |
| 3 | Gzip compression | `compression` middleware |
| 4 | HTTPS | nginx reverse proxy, Let's Encrypt |
| 5 | Rate limiting | `express-rate-limit` |
| 6 | Security headers | `helmet` |
| 7 | Logging | Winston + log rotation |
| 8 | Health check | `GET /health` endpoint |
| 9 | Graceful shutdown | SIGTERM handler |
| 10 | Monitoring | Prometheus + Grafana, PM2 |
| 11 | Error tracking | Sentry |
| 12 | Docker | Multi-stage build, non-root user |

### Docker production

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
```

---

## Câu hỏi phỏng vấn

**Q: Cluster vs Worker Threads?**

> Cluster: tạo nhiều **process** (mỗi process có memory riêng, dùng cho HTTP server multi-core). Worker Threads: tạo **thread** trong cùng process (shared memory, dùng cho CPU-intensive tasks). Cluster cho scale HTTP, Worker Threads cho tính toán nặng.

**Q: Cách phát hiện memory leak?**

> Theo dõi `process.memoryUsage()` theo thời gian → heap tăng liên tục = leak. Dùng `--inspect` + Chrome DevTools Memory tab. Clinic.js heapprofiler. Nguyên nhân phổ biến: global arrays, event listener tích tụ, closures giữ reference.

**Q: Caching ở đâu?**

> In-memory (node-cache): đơn giản, mất khi restart, không share giữa instances. Redis: distributed, persistent, share giữa instances → dùng cho production. HTTP Cache (Cache-Control, ETag): client-side.

---

**Tiếp theo**: [13 - Microservices với Node.js](./13-Microservices-Nodejs.md)
