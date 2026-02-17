# Advanced Features

## Mục lục
1. [Middleware](#middleware)
2. [Raw SQL](#raw-sql)
3. [Soft Delete](#soft-delete)
4. [Multiple Schemas](#multiple-schemas)
5. [Prisma Extensions](#prisma-extensions)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Middleware

Prisma middleware = hook chạy trước/sau query.

```typescript
const prisma = new PrismaClient();

// Logging middleware
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`${params.model}.${params.action} took ${after - before}ms`);
  return result;
});

// Soft delete middleware
prisma.$use(async (params, next) => {
  // findMany → filter deleted
  if (params.action === 'findMany') {
    if (!params.args) params.args = {};
    if (!params.args.where) params.args.where = {};
    params.args.where.deletedAt = null;
  }

  // delete → update deletedAt
  if (params.action === 'delete') {
    params.action = 'update';
    params.args.data = { deletedAt: new Date() };
  }

  return next(params);
});
```

---

## Raw SQL

```typescript
// Tagged template (parameterized → safe)
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email = ${email}
`;

// Raw string (CẢNH BÁO: SQL injection nếu dùng string concat)
const result = await prisma.$queryRawUnsafe('SELECT * FROM "User" WHERE id = $1', 42);

// Execute (INSERT, UPDATE, DELETE)
const affected = await prisma.$executeRaw`
  UPDATE "User" SET role = 'ADMIN' WHERE email = ${email}
`;

// Complex queries
const stats = await prisma.$queryRaw`
  SELECT
    u.id,
    u.name,
    COUNT(p.id)::int as post_count,
    COALESCE(SUM(p.views), 0)::int as total_views
  FROM "User" u
  LEFT JOIN "Post" p ON p."authorId" = u.id
  GROUP BY u.id
  ORDER BY post_count DESC
  LIMIT ${limit}
`;
```

---

## Soft Delete

### Schema

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  deletedAt DateTime?             // null = active
  createdAt DateTime  @default(now())
}
```

### Extension-based (Prisma 4.16+)

```typescript
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ model, operation, args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async delete({ args, query }) {
        // Thay delete → soft delete
        return prisma.user.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
});
```

---

## Multiple Schemas

```prisma
// PostgreSQL multi-schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth", "billing"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  @@schema("auth")
}

model Invoice {
  id     Int    @id @default(autoincrement())
  amount Float
  @@schema("billing")
}
```

---

## Prisma Extensions

Từ Prisma 4.16+, thay thế middleware:

```typescript
const prisma = new PrismaClient().$extends({
  // Custom model method
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
      },
      async signUp(data: { name: string; email: string; password: string }) {
        const hash = await bcrypt.hash(data.password, 12);
        return prisma.user.create({ data: { ...data, password: hash } });
      },
    },
  },

  // Computed fields
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },

  // Query hooks
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const time = performance.now() - start;
        console.log(`${model}.${operation} → ${time.toFixed(1)}ms`);
        return result;
      },
    },
  },
});

// Sử dụng
const user = await prisma.user.findByEmail('an@x.com');
console.log(user.fullName); // computed field
```

---

## Câu hỏi phỏng vấn

**Q: Middleware vs Extensions trong Prisma?**

> Middleware: cũ, dùng `$use()`, chạy trước/sau mọi query. Extensions (mới): type-safe, có thể thêm custom methods, computed fields, query hooks. Nên dùng Extensions.

**Q: Prisma có hỗ trợ raw SQL không?**

> Có. `$queryRaw` (tagged template, safe), `$queryRawUnsafe` (string, cẩn thận SQL injection), `$executeRaw` (INSERT/UPDATE/DELETE).

---

**Tiếp theo**: [06 - Performance & Optimization](./06-Performance-Optimization.md)
