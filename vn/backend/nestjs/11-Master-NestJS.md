# Master NestJS — Architecture, CQRS & Checklist Phỏng vấn

## Mục lục
1. [Architecture Patterns](#architecture-patterns)
2. [CQRS](#cqrs)
3. [Event Sourcing](#event-sourcing)
4. [Configuration](#configuration)
5. [Performance Tips](#performance-tips)
6. [Checklist Phỏng vấn](#checklist-phỏng-vấn)

---

## Architecture Patterns

### Monorepo (Nx / Turborepo)

```
apps/
├── api-gateway/          ← NestJS HTTP app
├── user-service/         ← NestJS microservice
├── order-service/        ← NestJS microservice
libs/
├── shared/               ← DTOs, interfaces
├── prisma-client/        ← Shared Prisma
└── auth/                 ← Shared auth logic
```

### Clean Architecture

```typescript
// Domain layer (không phụ thuộc framework)
export class User {
  constructor(public id: number, public name: string, public email: string) {}
}

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
}

// Application layer (use cases)
@Injectable()
export class CreateUserUseCase {
  constructor(@Inject('IUserRepository') private userRepo: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // business rules...
    return this.userRepo.create(new User(0, dto.name, dto.email));
  }
}

// Infrastructure layer (Prisma implementation)
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}
  findById(id: number) { return this.prisma.user.findUnique({ where: { id } }); }
  create(user: User) { return this.prisma.user.create({ data: user }); }
}

// Module wiring
@Module({
  providers: [
    CreateUserUseCase,
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
  ],
})
```

---

## CQRS

**Command Query Responsibility Segregation** — tách read và write.

```bash
npm install @nestjs/cqrs
```

```typescript
// Command
export class CreateUserCommand {
  constructor(public readonly name: string, public readonly email: string) {}
}

// Command Handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private prisma: PrismaService) {}

  async execute(command: CreateUserCommand) {
    return this.prisma.user.create({ data: { name: command.name, email: command.email } });
  }
}

// Query
export class GetUsersQuery {
  constructor(public readonly page: number, public readonly limit: number) {}
}

// Query Handler
@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private prisma: PrismaService) {}

  async execute(query: GetUsersQuery) {
    return this.prisma.user.findMany({ skip: (query.page - 1) * query.limit, take: query.limit });
  }
}

// Controller
@Controller('users')
export class UsersController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto.name, dto.email));
  }

  @Get()
  findAll(@Query('page') page = 1) {
    return this.queryBus.execute(new GetUsersQuery(+page, 10));
  }
}
```

---

## Event Sourcing

Lưu **mọi event** thay vì lưu state hiện tại.

```typescript
// Event
export class UserCreatedEvent {
  constructor(public readonly userId: number, public readonly email: string) {}
}

// Saga (event → command)
@Injectable()
export class UsersSaga {
  @Saga()
  userCreated = (events$: Observable<any>) =>
    events$.pipe(
      ofType(UserCreatedEvent),
      map(event => new SendWelcomeEmailCommand(event.email)),
    );
}
```

---

## Configuration

```bash
npm install @nestjs/config
```

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})

// Sử dụng
@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  getPort(): number {
    return this.config.get<number>('PORT');
  }
}
```

---

## Performance Tips

1. **Fastify** thay Express: `NestFactory.create(AppModule, new FastifyAdapter())` — 2-3x nhanh hơn.
2. **Caching**: `@nestjs/cache-manager` + Redis cho response caching.
3. **Compression**: `app.use(compression())`.
4. **Lazy-loading modules**: `LazyModuleLoader`.
5. **Pagination**: Luôn paginate DB queries.
6. **DataLoader**: Cho GraphQL N+1.

---

## Checklist Phỏng vấn

### Junior
- [ ] NestJS là gì? Tại sao dùng NestJS?
- [ ] Module, Controller, Provider (Service)?
- [ ] Decorator là gì? Kể tên decorators phổ biến?
- [ ] Dependency Injection trong NestJS?
- [ ] ValidationPipe + class-validator?
- [ ] DTO là gì? PartialType, PickType?

### Mid
- [ ] Request lifecycle (Middleware → Guard → Interceptor → Pipe → Handler)?
- [ ] Guard vs Pipe vs Interceptor — khác gì?
- [ ] Custom provider: useValue, useClass, useFactory?
- [ ] Scope: DEFAULT, REQUEST, TRANSIENT?
- [ ] Prisma vs TypeORM integration?
- [ ] JWT authentication flow?
- [ ] RBAC (Role-Based Access Control)?
- [ ] Exception Filters?
- [ ] Unit test với Testing module?

### Senior / Master
- [ ] Dynamic modules (forRoot, forRootAsync)?
- [ ] Global guard + @Public() pattern?
- [ ] CQRS pattern (CommandBus, QueryBus)?
- [ ] Event Sourcing + Sagas?
- [ ] Microservices transports (TCP, Kafka, RMQ, gRPC)?
- [ ] Hybrid app (HTTP + microservice)?
- [ ] GraphQL: code-first, DataLoader, Subscriptions?
- [ ] WebSocket Gateway?
- [ ] Swagger auto-generation?
- [ ] Clean Architecture / Hexagonal với NestJS?
- [ ] Monorepo (Nx) strategy?
- [ ] Performance: Fastify, caching, lazy modules?
- [ ] E2E testing strategy?

---

**Quay lại**: [README — Mục lục tổng](./README.md)
