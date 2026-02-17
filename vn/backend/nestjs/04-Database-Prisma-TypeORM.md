# Database: Prisma & TypeORM

## Mục lục
1. [Prisma với NestJS](#prisma-với-nestjs)
2. [TypeORM với NestJS](#typeorm-với-nestjs)
3. [Repository Pattern](#repository-pattern)
4. [Prisma vs TypeORM](#prisma-vs-typeorm)
5. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Prisma với NestJS

### Setup

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### PrismaService

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// prisma/prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

### Service dùng Prisma

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (e) {
      if (e.code === 'P2025') throw new NotFoundException(`User #${id} not found`);
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (e.code === 'P2025') throw new NotFoundException(`User #${id} not found`);
      throw e;
    }
  }
}
```

---

## TypeORM với NestJS

```bash
npm install @nestjs/typeorm typeorm pg
```

### Config

```typescript
// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'app',
      password: 'app',
      database: 'appdb',
      autoLoadEntities: true,
      synchronize: true, // chỉ dev!
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

### Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @CreateDateColumn()
  createdAt: Date;
}
```

### Service + Repository

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepo.find({ relations: ['posts'] });
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    return user;
  }

  create(dto: CreateUserDto) {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.usersRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException();
  }
}
```

---

## Repository Pattern

```typescript
// Abstract repository
export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}
  abstract findAll(): Promise<T[]>;
  abstract findById(id: number): Promise<T | null>;
  abstract create(data: any): Promise<T>;
}

// Concrete
@Injectable()
export class UsersRepository extends BaseRepository<User> {
  findAll() { return this.prisma.user.findMany(); }
  findById(id: number) { return this.prisma.user.findUnique({ where: { id } }); }
  create(data: CreateUserDto) { return this.prisma.user.create({ data }); }
}

// Service chỉ dùng repository, không biết Prisma hay TypeORM
@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}
}
```

---

## Prisma vs TypeORM

| | Prisma | TypeORM |
|---|--------|---------|
| Approach | **Schema-first** | **Code-first** (decorators) |
| Language | Schema DSL + TS | TypeScript decorators |
| Type safety | **Auto-generated** (rất tốt) | Manual types |
| Migrations | `prisma migrate` | `typeorm migration:generate` |
| Relations | Schema-defined | Decorator-defined |
| Raw SQL | `$queryRaw` | `query()` |
| Performance | Tốt, Rust engine | Trung bình |
| NestJS support | Module tự viết | **@nestjs/typeorm** official |
| Learning curve | Thấp | Trung bình |

**Khuyến nghị**: **Prisma** cho project mới (type-safe, DX tốt). **TypeORM** nếu team quen decorator-based ORM hoặc cần NestJS official integration.

---

## Câu hỏi phỏng vấn

**Q: Prisma vs TypeORM trong NestJS?**

> Prisma: schema-first, auto-generated types, Rust query engine, migration tốt, DX cao. TypeORM: code-first decorators, NestJS official module, mature. Prisma phổ biến hơn cho project mới.

**Q: Prisma error code P2025 là gì?**

> Record not found. Khi `update`/`delete` mà ID không tồn tại. Cần catch và throw NotFoundException.

---

**Tiếp theo**: [05 - Authentication & Authorization](./05-Authentication-Authorization.md)
