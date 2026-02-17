# Migrations

## Mục lục
1. [prisma migrate dev](#migrate-dev)
2. [prisma migrate deploy](#migrate-deploy)
3. [Migration files](#migration-files)
4. [Seeding](#seeding)
5. [Baseline](#baseline)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## migrate dev

Dùng trong **development**:

```bash
# Tạo migration từ schema changes
npx prisma migrate dev --name add_posts_table

# Chạy:
# 1. Tạo SQL migration file
# 2. Chạy migration trên DB
# 3. Generate Prisma Client
```

### Workflow

```
Sửa schema.prisma → prisma migrate dev → migration SQL → apply → generate client
```

---

## migrate deploy

Dùng trong **production / CI/CD**:

```bash
npx prisma migrate deploy
# Chạy tất cả pending migrations
# KHÔNG tạo migration mới
# KHÔNG generate client
```

### Trong Docker / CI

```dockerfile
# Dockerfile
COPY prisma ./prisma
RUN npx prisma generate
# ...
CMD npx prisma migrate deploy && node dist/main.js
```

---

## Migration files

```
prisma/
├── schema.prisma
└── migrations/
    ├── 20240101000000_init/
    │   └── migration.sql        ← SQL gốc
    ├── 20240102000000_add_posts/
    │   └── migration.sql
    └── migration_lock.toml      ← lock file (provider)
```

### Ví dụ migration.sql

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### Sửa migration trước khi apply

```bash
npx prisma migrate dev --create-only --name add_column
# → Chỉ tạo file SQL, KHÔNG apply
# → Sửa SQL thủ công (add data migration, custom SQL)
# → npx prisma migrate dev (apply)
```

---

## Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: '$2b$12$...hashed',
      role: 'ADMIN',
    },
  });

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

```bash
npx prisma db seed
# Tự chạy khi: prisma migrate dev, prisma migrate reset
```

---

## Baseline

Khi project đã có DB nhưng chưa dùng Prisma migrate:

```bash
# 1. Tạo migration từ schema hiện tại
npx prisma migrate dev --name baseline --create-only

# 2. Mark migration là đã applied (DB đã có tables)
npx prisma migrate resolve --applied 20240101000000_baseline
```

---

## Câu hỏi phỏng vấn

**Q: `prisma migrate dev` vs `prisma migrate deploy`?**

> `dev`: development — tạo migration + apply + generate client. `deploy`: production — chỉ apply pending migrations, không tạo mới. Dùng `deploy` trong CI/CD.

**Q: Cách rollback migration trong Prisma?**

> Prisma không có rollback command trực tiếp. Cách: sửa schema → tạo migration mới để undo. Hoặc `prisma migrate reset` (xoá DB + re-apply tất cả migrations — chỉ dev).

---

**Tiếp theo**: [05 - Advanced Features](./05-Advanced-Features.md)
