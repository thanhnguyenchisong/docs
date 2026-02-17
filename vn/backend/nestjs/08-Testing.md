# Testing

## Mục lục
1. [Testing Module](#testing-module)
2. [Unit Test (Service)](#unit-test)
3. [Unit Test (Controller)](#unit-test-controller)
4. [E2E Test](#e2e-test)
5. [Mocking Prisma](#mocking-prisma)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Testing Module

NestJS có `@nestjs/testing` giúp tạo module test với DI container.

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });
});
```

---

## Unit Test

```typescript
describe('UsersService', () => {
  // ... setup above ...

  describe('findOne', () => {
    it('should return user', async () => {
      const user = { id: 1, name: 'An', email: 'an@x.com' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: { posts: true } });
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = { name: 'Bình', email: 'binh@x.com', password: 'pass' };
      const created = { id: 2, ...dto };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(created as any);

      const result = await service.create(dto);
      expect(result.id).toBe(2);
    });
  });
});
```

---

## Unit Test Controller

```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
            findOne: jest.fn().mockResolvedValue({ id: 1, name: 'An' }),
            create: jest.fn().mockResolvedValue({ id: 1, name: 'An' }),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it('should return users', async () => {
    const result = await controller.findAll(1, 10);
    expect(result).toEqual({ data: [], total: 0 });
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });
});
```

---

## E2E Test

```typescript
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('GET /api/users', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
      });
  });

  it('POST /api/auth/register', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' })
      .expect(201);
  });

  it('POST /api/auth/register — validation error', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: '' })
      .expect(400);
  });
});
```

---

## Mocking Prisma

```typescript
// Tạo mock factory
export const mockPrismaService = () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
});

// Trong test module
providers: [
  UsersService,
  { provide: PrismaService, useFactory: mockPrismaService },
],
```

---

## Câu hỏi phỏng vấn

**Q: Testing module trong NestJS khác gì Jest thường?**

> NestJS Testing module tạo IoC container giống app thật → có thể mock providers bằng DI. Dễ swap implementation, không cần manual mock imports.

**Q: Unit test vs E2E test trong NestJS?**

> Unit: test 1 service/controller, mock dependencies, nhanh. E2E: tạo full app, gọi HTTP thật qua supertest, test toàn bộ pipeline (middleware → guard → pipe → handler).

---

**Tiếp theo**: [09 - Microservices](./09-Microservices.md)
