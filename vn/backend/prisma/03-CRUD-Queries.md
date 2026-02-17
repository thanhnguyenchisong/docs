# CRUD & Queries

## Mục lục
1. [Create](#create)
2. [Read](#read)
3. [Update](#update)
4. [Delete](#delete)
5. [Filtering & Ordering](#filtering)
6. [Pagination](#pagination)
7. [Transactions](#transactions)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Create

```typescript
// Create one
const user = await prisma.user.create({
  data: { name: 'An', email: 'an@x.com', password: 'hashed' },
});

// Create with relation
const userWithPosts = await prisma.user.create({
  data: {
    name: 'An',
    email: 'an@x.com',
    password: 'hashed',
    posts: {
      create: [
        { title: 'Post 1', content: 'Hello' },
        { title: 'Post 2', content: 'World' },
      ],
    },
  },
  include: { posts: true },
});

// Create many
const result = await prisma.user.createMany({
  data: [
    { name: 'A', email: 'a@x.com', password: 'h1' },
    { name: 'B', email: 'b@x.com', password: 'h2' },
  ],
  skipDuplicates: true,
});
// result.count = 2

// Upsert (create or update)
const user = await prisma.user.upsert({
  where: { email: 'an@x.com' },
  update: { name: 'Updated An' },
  create: { name: 'An', email: 'an@x.com', password: 'h' },
});
```

---

## Read

```typescript
// Find many
const users = await prisma.user.findMany();

// Find unique (by @id hoặc @unique)
const user = await prisma.user.findUnique({ where: { id: 1 } });
const user = await prisma.user.findUnique({ where: { email: 'an@x.com' } });

// Find first (lấy record đầu tiên)
const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

// Find or throw
const user = await prisma.user.findUniqueOrThrow({ where: { id: 1 } });

// Select (chỉ lấy fields cần)
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, email: true },
  // → chỉ trả { id, name, email }
});

// Include (eager loading relations)
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true, profile: true },
});

// Nested select
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true },
    },
  },
});

// Count
const count = await prisma.user.count({ where: { role: 'USER' } });

// Aggregate
const stats = await prisma.post.aggregate({
  _count: true,
  _avg: { views: true },
  _max: { views: true },
});

// Group by
const byRole = await prisma.user.groupBy({
  by: ['role'],
  _count: true,
});
```

---

## Update

```typescript
// Update one
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'New Name' },
});

// Update many
await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { role: 'MEMBER' },
});

// Increment/Decrement
await prisma.post.update({
  where: { id: 1 },
  data: { views: { increment: 1 } }, // decrement, multiply, divide, set
});

// Update relation
await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: 'New Post' },       // tạo mới
      connect: { id: 5 },                  // link existing
      disconnect: { id: 3 },               // unlink
      delete: { id: 2 },                   // xoá
    },
  },
});
```

---

## Delete

```typescript
// Delete one
await prisma.user.delete({ where: { id: 1 } });

// Delete many
const result = await prisma.user.deleteMany({ where: { role: 'TEMP' } });
// result.count

// Delete all
await prisma.user.deleteMany();
```

---

## Filtering

```typescript
const users = await prisma.user.findMany({
  where: {
    // Equals
    role: 'ADMIN',

    // Not
    name: { not: 'Test' },

    // String filters
    email: { contains: 'gmail.com' },
    name: { startsWith: 'Nguyễn' },
    name: { endsWith: 'An' },

    // Comparison
    age: { gt: 18 },          // greater than
    age: { gte: 18 },         // greater than or equal
    age: { lt: 65 },          // less than
    age: { lte: 65 },         // less than or equal

    // In / notIn
    role: { in: ['ADMIN', 'MODERATOR'] },

    // AND / OR / NOT
    AND: [{ age: { gte: 18 } }, { role: 'USER' }],
    OR: [{ email: { contains: 'gmail' } }, { email: { contains: 'yahoo' } }],
    NOT: { name: 'Banned User' },

    // Relation filter
    posts: { some: { published: true } },     // có ít nhất 1 post published
    posts: { every: { published: true } },    // tất cả posts đều published
    posts: { none: { published: false } },    // không có post nào unpublished
  },
});
```

### Ordering

```typescript
const posts = await prisma.post.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { title: 'asc' },
  ],
});

// Order by relation count
const users = await prisma.user.findMany({
  orderBy: { posts: { _count: 'desc' } },
});
```

---

## Pagination

### Offset-based

```typescript
async function paginate(page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

### Cursor-based (hiệu quả hơn cho dataset lớn)

```typescript
async function paginateCursor(cursor?: number, take = 10) {
  const args: any = { take, orderBy: { id: 'asc' } };
  if (cursor) {
    args.cursor = { id: cursor };
    args.skip = 1; // skip cursor record
  }
  const data = await prisma.user.findMany(args);
  return {
    data,
    nextCursor: data.length === take ? data[data.length - 1].id : null,
  };
}
```

---

## Transactions

```typescript
// Sequential (auto-retry)
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { name: 'An', email: 'an@x.com', password: 'h' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } }),
]);

// Interactive
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { name: 'An', email: 'an@x.com', password: 'h' } });
  const post = await tx.post.create({ data: { title: 'Hello', authorId: user.id } });
  if (!post) throw new Error('Failed'); // → rollback
  return { user, post };
});
```

---

## Câu hỏi phỏng vấn

**Q: `select` vs `include`?**

> `select`: chỉ lấy fields cần (whitelist). `include`: lấy tất cả fields + thêm relations. Không dùng cùng lúc.

**Q: Offset vs Cursor pagination?**

> Offset (`skip/take`): đơn giản, nhưng chậm khi offset lớn (DB phải scan qua offset rows). Cursor: hiệu quả hơn cho dataset lớn (dùng indexed field), nhưng không nhảy trang được.

---

**Tiếp theo**: [04 - Migrations](./04-Migrations.md)
