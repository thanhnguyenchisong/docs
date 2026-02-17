# Example — Express REST API hoàn chỉnh

Project minh họa tài liệu Node.js: Express, JWT auth, validation, error handling, testing.

## Chạy

```bash
npm install
npm start         # http://localhost:3000
# hoặc dev mode (auto-reload):
npm run dev
```

## Test

```bash
npm test
npm run test:coverage
```

## API Endpoints

| Method | URL | Mô tả | Auth |
|--------|-----|--------|------|
| GET | `/health` | Health check | Không |
| POST | `/api/auth/register` | Đăng ký | Không |
| POST | `/api/auth/login` | Đăng nhập → JWT token | Không |
| GET | `/api/users` | Danh sách users (pagination) | Không |
| GET | `/api/users/:id` | User theo ID | Không |
| GET | `/api/users/me/profile` | Profile user hiện tại | **Bearer Token** |
| DELETE | `/api/users/:id` | Xóa user (admin only) | **Bearer Token** |

## Test nhanh bằng curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"An","email":"an@test.com","password":"pass1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
# → copy token

# List users
curl http://localhost:3000/api/users

# Profile (thay TOKEN)
curl http://localhost:3000/api/users/me/profile \
  -H "Authorization: Bearer TOKEN"
```

## Cấu trúc

```
example/
├── src/
│   ├── index.js          ← start server
│   ├── app.js            ← Express app
│   ├── store.js          ← in-memory data
│   ├── routes/
│   │   ├── auth.js       ← register, login
│   │   └── users.js      ← CRUD users
│   └── middleware/
│       ├── auth.js       ← JWT middleware
│       ├── validate.js   ← validation
│       └── errorHandler.js
├── tests/
│   └── api.test.js       ← Jest + supertest
└── package.json
```

Account mặc định: `admin@example.com` / `admin123`

Đọc kèm [../README.md](../README.md) và các bài 01-14 trong backend/nodejs.
