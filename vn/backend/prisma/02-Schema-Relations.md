# Schema & Relations

## Mục lục
1. [Model](#model)
2. [Field Types](#field-types)
3. [Attributes](#attributes)
4. [Relations](#relations)
5. [Enums](#enums)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Model

Mỗi `model` = 1 bảng trong database.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  profile   Profile?          // 1-1
  posts     Post[]            // 1-N
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")              // tên bảng trong DB
  @@index([email])            // index
}
```

---

## Field Types

| Prisma Type | PostgreSQL | MySQL | SQLite |
|-------------|-----------|-------|--------|
| String | text / varchar | varchar | TEXT |
| Int | integer | int | INTEGER |
| BigInt | bigint | bigint | INTEGER |
| Float | double precision | double | REAL |
| Decimal | decimal | decimal | REAL |
| Boolean | boolean | boolean | INTEGER |
| DateTime | timestamp | datetime | TEXT |
| Json | jsonb | json | TEXT |
| Bytes | bytea | longblob | BLOB |

### Modifiers

```prisma
email String                // required
bio   String?               // optional (nullable)
tags  String[]              // array (PostgreSQL only)
```

---

## Attributes

### Field attributes

```prisma
model User {
  id     Int    @id                    // primary key
  id     Int    @id @default(autoincrement())  // auto-increment
  id     String @id @default(uuid())   // UUID
  id     String @id @default(cuid())   // CUID
  email  String @unique                // unique constraint
  name   String @db.VarChar(100)       // native DB type
  role   String @default("user")       // default value
  updatedAt DateTime @updatedAt        // auto-update timestamp
}
```

### Block attributes

```prisma
model Post {
  authorId Int
  tagId    Int

  @@id([authorId, tagId])              // composite primary key
  @@unique([authorId, tagId])          // composite unique
  @@index([authorId, createdAt])       // composite index
  @@map("blog_posts")                  // table name
}
```

---

## Relations

### One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique   // FK + unique = 1-1
}
```

### One-to-Many

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Many-to-Many (implicit)

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
// Prisma tự tạo bảng trung gian _CategoryToPost
```

### Many-to-Many (explicit)

```prisma
model Post {
  id   Int            @id @default(autoincrement())
  tags PostTag[]
}

model Tag {
  id    Int      @id @default(autoincrement())
  name  String   @unique
  posts PostTag[]
}

model PostTag {
  post   Post @relation(fields: [postId], references: [id])
  postId Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  Int

  @@id([postId, tagId])
}
```

### Self-relation

```prisma
model Employee {
  id        Int        @id @default(autoincrement())
  name      String
  managerId Int?
  manager   Employee?  @relation("Management", fields: [managerId], references: [id])
  reports   Employee[] @relation("Management")
}
```

### Referential actions

```prisma
model Post {
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}
// onDelete: Cascade | SetNull | Restrict | NoAction | SetDefault
```

---

## Enums

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  role Role @default(USER)
}
```

---

## Câu hỏi phỏng vấn

**Q: 1-1 vs 1-N relation trong Prisma?**

> 1-1: FK có `@unique` → đảm bảo chỉ 1 record. 1-N: FK không unique → 1 user có nhiều posts. Cả hai đều dùng `@relation(fields, references)`.

**Q: Implicit vs Explicit many-to-many?**

> Implicit: Prisma tự tạo join table (đơn giản, không lưu thêm data). Explicit: tự tạo model trung gian (khi cần thêm fields như `createdAt` vào join table).

**Q: Referential actions trong Prisma?**

> `onDelete: Cascade`: xoá parent → xoá children. `SetNull`: set FK = null. `Restrict`: chặn xoá nếu có children. Mặc định phụ thuộc provider.

---

**Tiếp theo**: [03 - CRUD & Queries](./03-CRUD-Queries.md)
