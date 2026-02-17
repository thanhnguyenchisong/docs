# HTTP & Express.js

## Mục lục
1. [HTTP cơ bản](#http-cơ-bản)
2. [Express.js là gì?](#expressjs-là-gì)
3. [Routing](#routing)
4. [Middleware](#middleware)
5. [Request & Response](#request--response)
6. [Static Files](#static-files)
7. [Template Engine](#template-engine)
8. [Error Handling trong Express](#error-handling-trong-express)
9. [Cấu trúc Project](#cấu-trúc-project)
10. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## HTTP cơ bản

### HTTP Server thuần (không framework)

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url, headers } = req;

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello World</h1>');
  } else if (method === 'GET' && url === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'An' }]));
  } else if (method === 'POST' && url === '/api/users') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const user = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 2, ...user }));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => console.log('Server on :3000'));
```

**Nhược điểm**: Phải tự xử lý routing, body parsing, static files, error handling. → Dùng **Express.js**.

---

## Express.js là gì?

Framework **minimal, unopinionated** cho Node.js web applications. Phổ biến nhất, ecosystem lớn.

### Cài đặt & Hello World

```bash
npm init -y
npm install express
```

```javascript
// app.js
const express = require('express');
const app = express();

// Middleware: parse JSON body
app.use(express.json());

// Route
app.get('/', (req, res) => {
  res.json({ message: 'Hello Express!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Routing

### Cơ bản

```javascript
// HTTP methods
app.get('/users', handler);       // GET
app.post('/users', handler);      // POST
app.put('/users/:id', handler);   // PUT (toàn bộ)
app.patch('/users/:id', handler); // PATCH (một phần)
app.delete('/users/:id', handler);// DELETE
app.all('/secret', handler);      // Tất cả methods
```

### Route parameters

```javascript
// URL: /users/42
app.get('/users/:id', (req, res) => {
  console.log(req.params.id); // '42'
});

// Nhiều params: /users/42/posts/7
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
});

// Optional param: /users hoặc /users/42
app.get('/users/:id?', handler);
```

### Query string

```javascript
// URL: /search?q=nodejs&page=2&limit=10
app.get('/search', (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  // q = 'nodejs', page = '2', limit = '10'
});
```

### Router (modular routes)

```javascript
// routes/users.js
const router = require('express').Router();

router.get('/', (req, res) => { /* list */ });
router.get('/:id', (req, res) => { /* get by id */ });
router.post('/', (req, res) => { /* create */ });
router.put('/:id', (req, res) => { /* update */ });
router.delete('/:id', (req, res) => { /* delete */ });

module.exports = router;

// app.js
const userRouter = require('./routes/users');
app.use('/api/users', userRouter);
// → GET /api/users, POST /api/users, GET /api/users/:id, ...
```

### Route chaining

```javascript
app.route('/users')
  .get((req, res) => { /* list */ })
  .post((req, res) => { /* create */ });

app.route('/users/:id')
  .get((req, res) => { /* get */ })
  .put((req, res) => { /* update */ })
  .delete((req, res) => { /* delete */ });
```

---

## Middleware

**Middleware** = function chạy **giữa** request và response. Nhận `(req, res, next)`.

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

### Loại middleware

```javascript
// 1. Application-level
app.use(express.json());                    // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form data

// 2. Router-level
router.use(authMiddleware);

// 3. Tự viết middleware
function logger(req, res, next) {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // QUAN TRỌNG: gọi next() để tiếp tục
}
app.use(logger);

// 4. Chỉ cho route cụ thể
app.get('/admin', authMiddleware, adminController);

// 5. Nhiều middleware
app.post('/users', validateBody, checkDuplicate, createUser);

// 6. Third-party
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// 7. Error-handling middleware (4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
```

### Thứ tự middleware (RẤT QUAN TRỌNG)

```javascript
// ✅ Đúng thứ tự
app.use(express.json());      // 1. Parse body trước
app.use(cors());              // 2. CORS
app.use(helmet());            // 3. Security headers
app.use(morgan('dev'));       // 4. Logging

app.use('/api', apiRouter);   // 5. Routes

app.use(notFoundHandler);     // 6. 404 (sau tất cả routes)
app.use(errorHandler);        // 7. Error handler (luôn cuối cùng)
```

### Ví dụ middleware thực tế

```javascript
// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Request timing
function timing(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} - ${Date.now() - start}ms`);
  });
  next();
}

// Rate limiting (đơn giản)
const requests = new Map();
function rateLimit(limit = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = requests.get(key) || { count: 0, start: now };

    if (now - record.start > windowMs) {
      record.count = 0;
      record.start = now;
    }

    record.count++;
    requests.set(key, record);

    if (record.count > limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}
app.use(rateLimit(100, 60000));
```

---

## Request & Response

### Request (req)

```javascript
app.post('/api/users', (req, res) => {
  req.body;         // JSON body (cần express.json())
  req.params;       // route params (:id)
  req.query;        // query string (?key=value)
  req.headers;      // HTTP headers
  req.method;       // 'GET', 'POST', ...
  req.url;          // '/api/users'
  req.path;         // '/api/users'
  req.ip;           // client IP
  req.cookies;      // cookies (cần cookie-parser)
  req.get('Content-Type'); // header value
});
```

### Response (res)

```javascript
app.get('/demo', (req, res) => {
  // JSON
  res.json({ data: 'hello' });

  // Status + JSON
  res.status(201).json({ id: 1 });

  // Text
  res.send('Hello');

  // HTML
  res.send('<h1>Hello</h1>');

  // File download
  res.download('/path/to/file.pdf');

  // Redirect
  res.redirect('/login');
  res.redirect(301, '/new-url');

  // Status only
  res.sendStatus(204); // No Content

  // Headers
  res.set('X-Custom', 'value');
  res.cookie('token', 'abc', { httpOnly: true });

  // Render template
  res.render('index', { title: 'Home' });
});
```

---

## Static Files

```javascript
// Serve thư mục 'public' tại URL gốc
app.use(express.static('public'));
// public/style.css → http://localhost:3000/style.css

// Với prefix
app.use('/assets', express.static('public'));
// public/style.css → http://localhost:3000/assets/style.css

// Nhiều thư mục
app.use(express.static('public'));
app.use(express.static('uploads'));
```

---

## Template Engine

Express hỗ trợ nhiều template engines (EJS, Pug, Handlebars).

```bash
npm install ejs
```

```javascript
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    users: [{ name: 'An' }, { name: 'Bình' }]
  });
});
```

```html
<!-- views/index.ejs -->
<h1><%= title %></h1>
<ul>
  <% users.forEach(user => { %>
    <li><%= user.name %></li>
  <% }); %>
</ul>
```

---

## Error Handling trong Express

```javascript
// 1. Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 2. Sử dụng
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(user);
}));

// 3. 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 4. Global error handler (LUÔN ở cuối, 4 params)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

---

## Cấu trúc Project

```
project/
├── src/
│   ├── app.js              ← Express app (middleware, routes)
│   ├── server.js           ← Start server (listen)
│   ├── config/
│   │   └── index.js        ← env variables, DB config
│   ├── routes/
│   │   ├── index.js        ← mount all routes
│   │   ├── users.js
│   │   └── products.js
│   ├── controllers/
│   │   ├── userController.js
│   │   └── productController.js
│   ├── services/
│   │   ├── userService.js
│   │   └── productService.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── utils/
│       └── helpers.js
├── tests/
├── package.json
├── .env
└── .gitignore
```

---

## Câu hỏi phỏng vấn

**Q: Middleware là gì? Thứ tự khai báo có quan trọng không?**

> Middleware là function nhận `(req, res, next)`, xử lý request trước khi đến route handler. Thứ tự **rất quan trọng** — middleware chạy theo thứ tự khai báo. Error handler phải ở cuối.

**Q: `app.use()` vs `app.get()`?**

> `app.use()` match mọi HTTP method và mọi path bắt đầu bằng prefix. `app.get()` chỉ match method GET và exact path. `app.use('/api')` match `/api`, `/api/users`, `/api/anything`.

**Q: Cách xử lý async error trong Express?**

> Express 4: wrap async handler trong try/catch hoặc dùng asyncHandler wrapper gọi `.catch(next)`. Express 5+ sẽ tự động catch async errors.

**Q: Express vs Fastify vs Koa?**

> Express: phổ biến nhất, ecosystem lớn, performance trung bình. Fastify: nhanh hơn 2-3x, schema-based validation, TypeScript-first. Koa: lightweight, dùng async/await native, ít middleware built-in.

---

**Tiếp theo**: [06 - REST API Design](./06-REST-API-Design.md)
