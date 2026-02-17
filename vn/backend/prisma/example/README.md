# Prisma Example — Express REST API + SQLite

Project minh họa **Prisma** với Express:
- **Relations**: User → Profile (1-1), User → Posts (1-N), Post ↔ Tag (N-N explicit)
- **CRUD**: Users, Posts, Tags
- **Filtering**: published, tag
- **Pagination**: offset-based
- **Seeding**: data mẫu
- **SQLite**: không cần Docker

## Cài đặt & Chạy

```bash
# 1. Install
npm install

# 2. Setup (generate client + migrate + seed)
npm run setup

# 3. Chạy server
npm run dev
# → http://localhost:3100

# 4. (Optional) Mở Prisma Studio
npm run studio
# → http://localhost:5555
```

## API Endpoints

### Users
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/users` | Danh sách users (pagination: `?page=1&limit=10`) |
| GET | `/api/users/:id` | Chi tiết user + profile + posts |
| POST | `/api/users` | Tạo user `{ name, email }` |
| PATCH | `/api/users/:id` | Cập nhật user |
| DELETE | `/api/users/:id` | Xoá user |

### Posts
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/posts` | Danh sách posts (`?published=true&tag=prisma`) |
| GET | `/api/posts/:id` | Chi tiết post |
| POST | `/api/posts` | Tạo post `{ title, content, authorId, tagIds }` |

### Tags & Stats
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | `/api/tags` | Danh sách tags + post count |
| GET | `/api/stats` | Tổng hợp (user count, post count) |

## Test nhanh

```bash
# List users
curl http://localhost:3100/api/users

# User detail (with posts)
curl http://localhost:3100/api/users/1

# Posts filtered by tag
curl "http://localhost:3100/api/posts?tag=prisma"

# Create user
curl -X POST http://localhost:3100/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@test.com"}'

# Stats
curl http://localhost:3100/api/stats
```

## Schema

```
User 1──1 Profile
User 1──N Post
Post N──N Tag (via PostTag)
```
