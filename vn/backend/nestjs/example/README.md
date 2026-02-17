# NestJS Example — REST API + Prisma + JWT + Swagger

Project minh họa **NestJS** hoàn chỉnh:
- **Prisma** (SQLite) — User & Post models
- **JWT Authentication** — Register / Login / Protected routes
- **Validation** — class-validator + ValidationPipe
- **Swagger** — Auto-generated API docs
- **Modular architecture** — Auth, Users, Posts modules

## Cài đặt & Chạy

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client + migrate DB
npx prisma generate
npx prisma migrate dev --name init

# 3. Run dev server
npm run start:dev

# 4. Mở browser
# API:     http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
```

## API Endpoints

### Auth
| Method | URL | Mô tả |
|--------|-----|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập → JWT |
| GET | `/api/auth/profile` | Profile (Bearer token) |

### Users
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/users` | Danh sách users |
| GET | `/api/users/:id` | Chi tiết user |
| PATCH | `/api/users/:id` | Cập nhật (auth) |
| DELETE | `/api/users/:id` | Xoá (auth) |

### Posts
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/posts` | Danh sách posts |
| GET | `/api/posts/:id` | Chi tiết post |
| POST | `/api/posts` | Tạo post (auth) |
| DELETE | `/api/posts/:id` | Xoá post (auth) |

## Test nhanh

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"An","email":"an@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"an@example.com","password":"password123"}'

# Copy access_token rồi:
curl http://localhost:3000/api/auth/profile \
  -H 'Authorization: Bearer <token>'

# Tạo post
curl -X POST http://localhost:3000/api/posts \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"title":"Hello NestJS","content":"First post!"}'
```

## Cấu trúc

```
src/
├── main.ts              ← Bootstrap + Swagger
├── app.module.ts        ← Root module
├── prisma/              ← PrismaService (global)
├── auth/                ← Register, Login, JWT
├── users/               ← CRUD Users
└── posts/               ← CRUD Posts
prisma/
└── schema.prisma        ← Database schema (SQLite)
```
