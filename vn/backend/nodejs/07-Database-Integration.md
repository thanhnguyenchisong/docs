# Database Integration

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [MongoDB + Mongoose](#mongodb--mongoose)
3. [PostgreSQL + Sequelize](#postgresql--sequelize)
4. [Prisma (ORM hiện đại)](#prisma)
5. [Redis (cache)](#redis)
6. [Migration & Seeding](#migration--seeding)
7. [Connection Pooling](#connection-pooling)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tổng quan

| Database | Loại | Khi nào dùng | ORM/ODM |
|----------|------|-------------|---------|
| MongoDB | NoSQL (Document) | Schema linh hoạt, prototype nhanh | Mongoose |
| PostgreSQL | SQL (Relational) | Dữ liệu có quan hệ, ACID | Sequelize, Prisma |
| MySQL | SQL | Phổ biến, đơn giản | Sequelize, Prisma |
| Redis | In-memory (Key-Value) | Cache, session, rate limit | ioredis |

---

## MongoDB + Mongoose

### Kết nối

```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
  console.log('MongoDB connected');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

### Schema & Model

```javascript
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  age:      { type: Number, min: 0 },
  posts:    [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, {
  timestamps: true, // createdAt, updatedAt
  toJSON: { virtuals: true },
});

// Virtual (computed field)
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Instance method
userSchema.methods.comparePassword = async function(candidate) {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(candidate, this.password);
};

// Static method
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// Pre-save hook
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Index
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' }); // text search

const User = model('User', userSchema);
module.exports = User;
```

### CRUD

```javascript
// Create
const user = await User.create({ name: 'An', email: 'an@example.com', password: 'secret123' });

// Read
const users = await User.find({ role: 'user' }).select('name email').limit(20);
const user = await User.findById(id);
const user = await User.findOne({ email: 'an@example.com' }).select('+password');

// Update
await User.findByIdAndUpdate(id, { name: 'Bình' }, { new: true, runValidators: true });

// Delete
await User.findByIdAndDelete(id);

// Population (join)
const user = await User.findById(id).populate('posts');

// Aggregation
const stats = await User.aggregate([
  { $match: { role: 'user' } },
  { $group: { _id: '$role', count: { $sum: 1 }, avgAge: { $avg: '$age' } } },
]);
```

---

## PostgreSQL + Sequelize

```bash
npm install sequelize pg pg-hstore
```

```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://app:app@localhost:5432/appdb', {
  logging: false,
});

// Model
const User = sequelize.define('User', {
  name:  { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role:  { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, { timestamps: true });

const Post = sequelize.define('Post', {
  title:   { type: DataTypes.STRING, allowNull: false },
  content: DataTypes.TEXT,
});

// Relations
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Sync
await sequelize.sync({ alter: true }); // dev only

// CRUD
const user = await User.create({ name: 'An', email: 'an@example.com' });
const users = await User.findAll({ where: { role: 'user' }, limit: 20 });
const user = await User.findByPk(1, { include: Post });
await User.update({ name: 'Bình' }, { where: { id: 1 } });
await User.destroy({ where: { id: 1 } });

// Transaction
const t = await sequelize.transaction();
try {
  const user = await User.create({ name: 'An', email: 'an@example.com' }, { transaction: t });
  await Post.create({ title: 'Hello', userId: user.id }, { transaction: t });
  await t.commit();
} catch (err) {
  await t.rollback();
}
```

---

## Prisma

ORM hiện đại: schema-first, auto-generate client, TypeScript-friendly.

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  posts Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

```bash
npx prisma migrate dev --name init   # tạo migration
npx prisma generate                   # generate client
```

### Sử dụng

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: { name: 'An', email: 'an@example.com' },
});

// Read với relation
const users = await prisma.user.findMany({
  where: { name: { contains: 'An' } },
  include: { posts: true },
  take: 20,
});

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Bình' },
});

// Delete
await prisma.user.delete({ where: { id: 1 } });

// Transaction
await prisma.$transaction([
  prisma.user.create({ data: { name: 'A', email: 'a@x.com' } }),
  prisma.post.create({ data: { title: 'Hi', authorId: 1 } }),
]);

// Cleanup
await prisma.$disconnect();
```

---

## Redis

```bash
npm install ioredis
```

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Set / Get
await redis.set('user:1', JSON.stringify({ name: 'An' }));
await redis.set('session:abc', 'userId:1', 'EX', 3600); // TTL 1 giờ

const user = JSON.parse(await redis.get('user:1'));

// Cache pattern
async function getCachedUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await User.findById(id);
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 300); // cache 5 phút
  return user;
}

// Pub/Sub
redis.subscribe('notifications');
redis.on('message', (channel, message) => {
  console.log(`${channel}: ${message}`);
});
```

---

## Migration & Seeding

### Sequelize migration

```bash
npx sequelize-cli migration:generate --name add-users
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
```

### Prisma migration

```bash
npx prisma migrate dev --name add-age-field
npx prisma migrate deploy          # production
npx prisma db seed                 # seed data
```

### Seed (Prisma)

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: 'An', email: 'an@example.com' },
      { name: 'Bình', email: 'binh@example.com' },
    ],
  });
}
main().finally(() => prisma.$disconnect());
```

---

## Connection Pooling

```javascript
// Sequelize — pool config
const sequelize = new Sequelize(url, {
  pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
});

// Prisma — connection limit trong URL
// DATABASE_URL="postgresql://user:pass@host/db?connection_limit=10"

// Mongoose
mongoose.connect(url, { maxPoolSize: 10, minPoolSize: 2 });
```

---

## Câu hỏi phỏng vấn

**Q: SQL vs NoSQL — khi nào dùng gì?**

> SQL (PostgreSQL): dữ liệu có quan hệ rõ ràng, cần ACID, complex queries. NoSQL (MongoDB): schema linh hoạt, horizontal scaling, document-oriented data. Thường dùng cả hai (polyglot persistence).

**Q: Mongoose vs Prisma?**

> Mongoose: ODM cho MongoDB, schema-based, hooks, population. Prisma: ORM cho SQL (+ MongoDB), schema-first, auto-generate types, migration built-in, TypeScript-first. Prisma hiện đại hơn và đang phổ biến.

**Q: Connection pooling là gì, tại sao cần?**

> Pool giữ sẵn N connections mở → không tốn thời gian mở/đóng connection mỗi request. Giới hạn max connections tránh overload database.

---

**Tiếp theo**: [08 - Authentication & Security](./08-Authentication-Security.md)
