# Error Handling & Logging

## Mục lục
1. [Error Types trong Node.js](#error-types)
2. [Custom Error Classes](#custom-error-classes)
3. [Centralized Error Handler](#centralized-error-handler)
4. [Logging với Winston](#logging-với-winston)
5. [HTTP Request Logging (Morgan)](#morgan)
6. [Unhandled Errors](#unhandled-errors)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Error Types

```javascript
// 1. Operational errors — lỗi dự đoán được (invalid input, DB down, timeout)
// → Xử lý gracefully, trả về message rõ ràng cho client

// 2. Programming errors — bug (TypeError, undefined, wrong logic)
// → Fix code, không catch chung chung
```

---

## Custom Error Classes

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // đánh dấu lỗi dự đoán được
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };
```

### Sử dụng

```javascript
const { NotFoundError } = require('./utils/AppError');

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

---

## Centralized Error Handler

```javascript
// middleware/errorHandler.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Operational error → trả message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details: messages },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: { message: `${field} already exists` },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: { message: 'Token expired' } });
  }

  // Programming error → generic message (không lộ stack cho client)
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
```

---

## Logging với Winston

```bash
npm install winston
```

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'my-app' },
  transports: [
    // Console (dev)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // File (production)
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
```

```javascript
const logger = require('./utils/logger');

logger.info('Server started', { port: 3000 });
logger.warn('Slow query', { query: 'SELECT...', duration: 5000 });
logger.error('Database connection failed', { error: err.message });
```

---

## Morgan

HTTP request logging — phối hợp với Winston.

```bash
npm install morgan
```

```javascript
const morgan = require('morgan');

// Dev: colored, concise
app.use(morgan('dev'));
// Output: GET /api/users 200 12ms

// Production: combined format → ghi vào Winston
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));
```

---

## Unhandled Errors

```javascript
// Unhandled Promise Rejection (Node 15+ sẽ crash)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  // Graceful shutdown
  server.close(() => process.exit(1));
});

// Uncaught Exception (luôn crash sau khi log)
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1); // PHẢI exit — state không đáng tin
});

// SIGTERM (Docker/K8s gửi trước khi kill)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
```

---

## Câu hỏi phỏng vấn

**Q: Operational error vs Programming error?**

> Operational: lỗi dự đoán được (validation, timeout, 404) → xử lý gracefully. Programming: bug (TypeError, logic sai) → fix code, không nên catch để ẩn đi.

**Q: Tại sao cần centralized error handler?**

> Tránh lặp try/catch ở mọi route. Chuẩn hóa response format. Dễ log, monitor. Một chỗ duy nhất quyết định trả error gì cho client.

**Q: `uncaughtException` có nên restart process không?**

> Có. Sau uncaught exception, state của process không đáng tin → PHẢI exit. Dùng process manager (PM2, Docker) để tự restart.

---

**Tiếp theo**: [10 - Testing](./10-Testing.md)
