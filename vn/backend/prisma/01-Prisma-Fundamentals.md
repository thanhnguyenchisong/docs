# Prisma Fundamentals

## Mục lục
1. [Prisma là gì?](#prisma-là-gì)
2. [Kiến trúc Prisma](#kiến-trúc)
3. [Cài đặt & Setup](#setup)
4. [Prisma Client](#prisma-client)
5. [Prisma Studio](#prisma-studio)
6. [Prisma vs Sequelize vs TypeORM](#so-sánh)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Prisma là gì?

**Prisma** = next-generation ORM cho Node.js & TypeScript:

- **Schema-first** — khai báo schema bằng Prisma Schema Language (PSL).
- **Auto-generated Client** — TypeScript types tự sinh từ schema.
- **Type-safe** — compiler bắt lỗi query, không cần chạy mới biết sai.
- **Prisma Migrate** — migration tool.
- **Prisma Studio** — GUI để xem/chỉnh sửa data.

### Prisma gồm 3 phần

1. **Prisma Client** — Query builder type-safe (auto-generated).
2. **Prisma Migrate** — Migration system.
3. **Prisma Studio** — GUI cho database.

---

## Kiến trúc

```
┌─────────────┐
│  Your App    │  TypeScript / JavaScript
│  (Node.js)   │
└──────┬───────┘
       │ Prisma Client (auto-generated)
       │
┌──────▼───────┐
│ Query Engine  │  Rust binary (hiệu năng cao)
└──────┬───────┘
       │ SQL
       │
┌──────▼───────┐
│   Database    │  PostgreSQL, MySQL, SQLite, MongoDB, SQL Server, CockroachDB
└──────────────┘
```

**Query Engine** = Rust binary → nhanh hơn JS-based ORMs.

---

## Setup

```bash
# Tạo project
mkdir my-prisma-app && cd my-prisma-app
npm init -y
npm install prisma --save-dev
npm install @prisma/client

# Init prisma (tạo prisma/schema.prisma + .env)
npx prisma init

# Hoặc chọn database
npx prisma init --datasource-provider postgresql
npx prisma init --datasource-provider sqlite
```

### .env

```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
# Hoặc SQLite:
# DATABASE_URL="file:./dev.db"
```

### schema.prisma

```prisma
datasource db {
  provider = "postgresql"   // postgresql | mysql | sqlite | mongodb | sqlserver
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

### Workflow

```bash
# 1. Sửa schema.prisma
# 2. Tạo migration
npx prisma migrate dev --name add_users

# 3. Generate client (tự chạy sau migrate dev)
npx prisma generate

# 4. Dùng trong code
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

---

## Prisma Client

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// CRUD cơ bản
const user = await prisma.user.create({ data: { name: 'An', email: 'an@x.com' } });
const users = await prisma.user.findMany();
const one = await prisma.user.findUnique({ where: { id: 1 } });
await prisma.user.update({ where: { id: 1 }, data: { name: 'Updated' } });
await prisma.user.delete({ where: { id: 1 } });

// Đóng connection khi app shutdown
await prisma.$disconnect();
```

### Singleton pattern (production)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Prisma Studio

```bash
npx prisma studio
# Mở browser → http://localhost:5555
# → Xem data, thêm/sửa/xoá records
```

---

## So sánh

| | Prisma | Sequelize | TypeORM |
|---|--------|-----------|---------|
| Approach | **Schema-first** | Code-first | Code-first (decorators) |
| Language | PSL + TS | JS/TS | TS (decorators) |
| Type safety | **Auto-generated** | Manual | Manual |
| Query Engine | **Rust** | JS | JS |
| Migrations | `prisma migrate` | `sequelize db:migrate` | `migration:generate` |
| Relations | Schema DSL | `.belongsTo()` | `@ManyToOne()` |
| Raw SQL | `$queryRaw` | `sequelize.query()` | `query()` |
| Learning | Thấp | Trung bình | Cao |

---

## Câu hỏi phỏng vấn

**Q: Prisma là gì? Khác gì Sequelize?**

> Prisma = ORM schema-first, auto-generate TypeScript client từ schema. Rust query engine → nhanh hơn. So với Sequelize: type-safe hơn, DX tốt hơn, migration rõ ràng hơn.

**Q: prisma generate vs prisma migrate?**

> `generate`: đọc schema → sinh TypeScript client (node_modules/@prisma/client). `migrate dev`: tạo SQL migration file + chạy migration + auto generate.

---

**Tiếp theo**: [02 - Schema & Relations](./02-Schema-Relations.md)
