# Performance & Optimization

## Mục lục
1. [Connection Pooling](#connection-pooling)
2. [N+1 Problem](#n1-problem)
3. [Select vs Include](#select-vs-include)
4. [Indexes](#indexes)
5. [Batch Operations](#batch)
6. [Logging & Monitoring](#logging)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Connection Pooling

```
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

### Prisma Data Proxy (serverless)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // cho migrations
}
```

### Connection tips

- **Connection limit** = database max connections / number of app instances.
- Dùng **PgBouncer** hoặc **Prisma Accelerate** cho connection pooling ở scale lớn.
- Singleton Prisma Client (không tạo `new PrismaClient()` mỗi request).

---

## N+1 Problem

```typescript
// ❌ N+1 — 1 query users + N queries posts
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// ✅ Include — 2 queries (users + posts WHERE authorId IN (...))
const users = await prisma.user.findMany({
  include: { posts: true },
});

// ✅ Hoặc batch thủ công
const users = await prisma.user.findMany();
const posts = await prisma.post.findMany({
  where: { authorId: { in: users.map(u => u.id) } },
});
```

---

## Select vs Include

```typescript
// ❌ Lấy toàn bộ fields (kể cả password!)
const users = await prisma.user.findMany();

// ✅ Chỉ lấy fields cần
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// ✅ Include chỉ fields cần của relation
const users = await prisma.user.findMany({
  include: {
    posts: { select: { id: true, title: true }, take: 5 },
  },
});
```

---

## Indexes

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  authorId  Int
  createdAt DateTime @default(now())

  @@index([authorId])                   // FK index
  @@index([createdAt])                  // ordering
  @@index([authorId, createdAt])        // composite
  @@index([title], type: Hash)          // hash index (equality only)
}

// Full-text search (PostgreSQL)
model Post {
  title   String
  content String

  @@fulltext([title, content])
}
```

### Khi nào cần index?

- Columns trong `WHERE`, `ORDER BY`, `JOIN`.
- Foreign keys.
- Unique constraints (auto-indexed).
- **Không index**: columns ít giá trị khác nhau (boolean), bảng nhỏ.

---

## Batch

```typescript
// createMany (nhanh hơn loop create)
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});

// updateMany
await prisma.post.updateMany({
  where: { published: false, createdAt: { lt: oneMonthAgo } },
  data: { published: true },
});

// deleteMany
await prisma.post.deleteMany({
  where: { authorId: deletedUserId },
});

// $transaction cho batch mixed operations
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 1 } }),
  prisma.user.delete({ where: { id: 1 } }),
]);
```

---

## Logging

```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 100) { // ms
    console.warn(`Slow query (${e.duration}ms): ${e.query}`);
  }
});
```

### Prisma Metrics (preview)

```typescript
const prisma = new PrismaClient({
  // Enable metrics
})

const metrics = await prisma.$metrics.json();
// → connection pool size, query count, durations
```

---

## Câu hỏi phỏng vấn

**Q: Cách tối ưu performance Prisma?**

> 1) Select chỉ fields cần. 2) Index columns trong WHERE/ORDER BY. 3) Dùng `include` thay vì N+1 loop. 4) Batch operations (`createMany`, `$transaction`). 5) Connection pooling (PgBouncer/Accelerate). 6) Log slow queries.

**Q: Prisma Connection Pooling hoạt động thế nào?**

> Prisma Client duy trì pool connections tới DB. Config qua `connection_limit` trong URL. Serverless: dùng Prisma Accelerate hoặc external pool (PgBouncer). Singleton Prisma Client → không tạo mới mỗi request.

---

**Tiếp theo**: [07 - Master Prisma](./07-Master-Prisma.md)
