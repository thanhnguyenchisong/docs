# REST API Design

## Mục lục
1. [REST là gì?](#rest-là-gì)
2. [URL Design](#url-design)
3. [HTTP Methods & Status Codes](#http-methods--status-codes)
4. [Request Validation (Joi / Zod)](#request-validation)
5. [Pagination, Filtering, Sorting](#pagination-filtering-sorting)
6. [API Versioning](#api-versioning)
7. [HATEOAS](#hateoas)
8. [Response Format chuẩn](#response-format-chuẩn)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## REST là gì?

**REST** (Representational State Transfer) là kiến trúc thiết kế API dựa trên HTTP. Nguyên tắc:

1. **Client-Server** — tách biệt client và server.
2. **Stateless** — mỗi request chứa đủ thông tin, server không giữ session.
3. **Uniform Interface** — URL đại diện resource, HTTP method đại diện action.
4. **Cacheable** — response có thể cache.
5. **Layered System** — client không cần biết có proxy/gateway ở giữa.

---

## URL Design

### Quy tắc

```
✅ Dùng danh từ số nhiều
GET    /api/users          → list users
GET    /api/users/42       → get user 42
POST   /api/users          → create user
PUT    /api/users/42       → update user 42
DELETE /api/users/42       → delete user 42

❌ Không dùng động từ trong URL
GET /api/getUsers          → sai
POST /api/createUser       → sai
POST /api/deleteUser/42    → sai
```

### Nested resources

```
GET  /api/users/42/posts        → posts của user 42
GET  /api/users/42/posts/7      → post 7 của user 42
POST /api/users/42/posts        → tạo post cho user 42
```

### Quy ước

- Lowercase, dùng hyphen: `/api/order-items` (không dùng camelCase, underscore).
- Không có trailing slash: `/api/users` (không phải `/api/users/`).
- Không dùng file extension: `/api/users` (không phải `/api/users.json`).

---

## HTTP Methods & Status Codes

### Methods

| Method | Ý nghĩa | Idempotent | Body |
|--------|----------|------------|------|
| GET | Lấy resource | Có | Không |
| POST | Tạo resource | Không | Có |
| PUT | Thay thế toàn bộ | Có | Có |
| PATCH | Cập nhật một phần | Có | Có |
| DELETE | Xóa resource | Có | Không |

### Status Codes thường dùng

```javascript
// 2xx — Thành công
200 OK                  // GET, PUT, PATCH thành công
201 Created             // POST tạo thành công
204 No Content          // DELETE thành công

// 3xx — Redirect
301 Moved Permanently
304 Not Modified

// 4xx — Client error
400 Bad Request          // validation fail, body sai
401 Unauthorized         // chưa đăng nhập
403 Forbidden            // không có quyền
404 Not Found            // resource không tồn tại
409 Conflict             // duplicate, conflict
422 Unprocessable Entity // dữ liệu hợp lệ cú pháp nhưng sai nghiệp vụ
429 Too Many Requests    // rate limit

// 5xx — Server error
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

---

## Request Validation

### Dùng Joi

```bash
npm install joi
```

```javascript
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120),
  role: Joi.string().valid('user', 'admin').default('user'),
});

// Middleware validate
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    req.body = value; // dùng value đã sanitize
    next();
  };
}

app.post('/api/users', validate(createUserSchema), createUser);
```

### Dùng Zod (TypeScript-friendly)

```bash
npm install zod
```

```javascript
const { z } = require('zod');

const CreateUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(18).optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

function validateZod(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}
```

---

## Pagination, Filtering, Sorting

### Pagination

```javascript
// GET /api/users?page=2&limit=20

app.get('/api/users', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});
```

### Filtering & Sorting

```javascript
// GET /api/products?category=books&minPrice=10&sort=-price,name

app.get('/api/products', async (req, res) => {
  const { category, minPrice, maxPrice, sort } = req.query;

  // Filter
  const filter = {};
  if (category) filter.category = category;
  if (minPrice) filter.price = { $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

  // Sort: "-price" → { price: -1 }, "name" → { name: 1 }
  const sortObj = {};
  if (sort) {
    sort.split(',').forEach(field => {
      if (field.startsWith('-')) {
        sortObj[field.slice(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });
  }

  const products = await Product.find(filter).sort(sortObj);
  res.json({ data: products });
});
```

---

## API Versioning

```javascript
// 1. URL path (phổ biến nhất)
app.use('/api/v1/users', usersV1Router);
app.use('/api/v2/users', usersV2Router);

// 2. Header
app.use('/api/users', (req, res, next) => {
  const version = req.headers['api-version'] || '1';
  if (version === '2') return usersV2Router(req, res, next);
  return usersV1Router(req, res, next);
});

// 3. Query param
// GET /api/users?version=2
```

---

## HATEOAS

**H**ypermedia **A**s **T**he **E**ngine **O**f **A**pplication **S**tate — response chứa links để client biết action tiếp theo.

```json
{
  "data": {
    "id": 42,
    "name": "An",
    "email": "an@example.com"
  },
  "links": {
    "self": "/api/users/42",
    "posts": "/api/users/42/posts",
    "update": "/api/users/42",
    "delete": "/api/users/42"
  }
}
```

---

## Response Format chuẩn

```javascript
// Thành công
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "total": 100 }
}

// Lỗi
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [...]
  }
}
```

---

## Câu hỏi phỏng vấn

**Q: PUT vs PATCH khác gì?**

> PUT thay thế **toàn bộ** resource (phải gửi đầy đủ fields). PATCH cập nhật **một phần** (chỉ gửi fields cần thay đổi). PUT idempotent, PATCH cũng thường idempotent.

**Q: Idempotent nghĩa là gì?**

> Gọi 1 lần hay nhiều lần cho cùng kết quả. GET, PUT, DELETE là idempotent. POST không idempotent (mỗi lần gọi tạo resource mới).

**Q: 401 vs 403?**

> 401 Unauthorized: chưa xác thực (chưa đăng nhập). 403 Forbidden: đã xác thực nhưng không có quyền.

**Q: Cách thiết kế pagination tốt?**

> Offset-based (`page/limit`): đơn giản, nhưng chậm khi offset lớn. Cursor-based (`after=lastId`): hiệu suất tốt hơn, phù hợp real-time feeds. Luôn trả metadata (total, hasNext).

---

**Tiếp theo**: [07 - Database Integration](./07-Database-Integration.md)
