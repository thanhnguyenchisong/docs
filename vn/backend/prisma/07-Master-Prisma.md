# Master Prisma — Testing, Multi-DB & Checklist Phỏng vấn

## Mục lục
1. [Testing với Prisma](#testing)
2. [Multi-database](#multi-database)
3. [Prisma + NestJS Best Practices](#nestjs-best-practices)
4. [Prisma Accelerate & Edge](#edge)
5. [Checklist Phỏng vấn](#checklist-phỏng-vấn)

---

## Testing

### Mock Prisma Client

```typescript
// __mocks__/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => mockReset(prismaMock));
```

```typescript
// users.service.spec.ts
import { prismaMock } from '../__mocks__/prisma';

describe('UsersService', () => {
  it('should create user', async () => {
    const user = { id: 1, name: 'An', email: 'an@x.com' };
    prismaMock.user.create.mockResolvedValue(user as any);

    const result = await service.create({ name: 'An', email: 'an@x.com', password: 'h' });
    expect(result.name).toBe('An');
  });
});
```

### Integration test (test DB)

```bash
# Dùng SQLite in-memory cho test
DATABASE_URL="file:./test.db" npx prisma migrate deploy
DATABASE_URL="file:./test.db" jest --runInBand
```

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

beforeEach(async () => {
  // Truncate tables
  await prisma.$executeRaw`DELETE FROM "Post"`;
  await prisma.$executeRaw`DELETE FROM "User"`;
});

afterAll(async () => { await prisma.$disconnect(); });
```

---

## Multi-database

```prisma
// prisma/schema1.prisma — PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
}

// prisma/schema2.prisma — MongoDB
datasource db {
  provider = "mongodb"
  url      = env("MONGO_URL")
}
```

```bash
npx prisma generate --schema=prisma/schema1.prisma
npx prisma generate --schema=prisma/schema2.prisma
```

```typescript
import { PrismaClient as PgClient } from './generated/pg';
import { PrismaClient as MongoClient } from './generated/mongo';

const pg = new PgClient();
const mongo = new MongoClient();
```

---

## NestJS Best Practices

```typescript
// 1. Global PrismaModule
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// 2. Graceful shutdown
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}

// 3. Health check
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private prisma: PrismaService) {}

  @Get()
  check() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { prisma: { status: 'up' } };
      },
    ]);
  }
}
```

---

## Edge

### Prisma Accelerate

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // Accelerate connection string
  directUrl = env("DIRECT_URL")         // Direct DB URL (for migrations)
}
```

Tính năng:
- **Global connection pooling** (edge-ready).
- **Query caching** (configurable TTL).
- **Serverless-friendly** (Vercel, Cloudflare Workers).

---

## Checklist Phỏng vấn

### Junior
- [ ] Prisma là gì? So sánh với Sequelize/TypeORM?
- [ ] Schema.prisma structure (datasource, generator, model)?
- [ ] CRUD operations (create, findMany, update, delete)?
- [ ] Relations (1-1, 1-N, N-N)?
- [ ] `prisma migrate dev` vs `prisma generate`?

### Mid
- [ ] Filtering (where, AND, OR, relation filters)?
- [ ] Pagination (offset vs cursor)?
- [ ] Transactions ($transaction sequential vs interactive)?
- [ ] Select vs Include?
- [ ] Raw SQL ($queryRaw)?
- [ ] Seeding?
- [ ] Prisma + NestJS integration (PrismaModule, PrismaService)?

### Senior / Master
- [ ] N+1 problem và cách giải quyết?
- [ ] Connection pooling (config, PgBouncer, Accelerate)?
- [ ] Middleware vs Extensions?
- [ ] Soft delete implementation?
- [ ] Multi-schema (PostgreSQL)?
- [ ] Testing (mock, integration test)?
- [ ] Prisma Accelerate / Edge?
- [ ] Migration strategy (baseline, rollback, data migration)?
- [ ] Performance optimization checklist?

---

**Quay lại**: [README — Mục lục tổng](./README.md)
