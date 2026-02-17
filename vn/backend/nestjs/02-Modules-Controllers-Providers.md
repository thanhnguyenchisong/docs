# Modules, Controllers & Providers

## Mục lục
1. [Modules](#modules)
2. [Controllers](#controllers)
3. [Providers & Services](#providers--services)
4. [Dependency Injection](#dependency-injection)
5. [Custom Providers](#custom-providers)
6. [Scope](#scope)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Modules

Module = nhóm các thành phần liên quan (controllers, services, entities).

```typescript
@Module({
  imports: [DatabaseModule, AuthModule],   // modules khác cần dùng
  controllers: [UsersController],          // controllers trong module này
  providers: [UsersService],               // services / providers
  exports: [UsersService],                 // cho modules khác import
})
export class UsersModule {}
```

### Root Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

### Global Module

```typescript
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
// → ConfigService có thể inject ở BẤT KỲ module nào mà không cần import
```

### Dynamic Module

```typescript
@Module({})
export class DatabaseModule {
  static forRoot(options: DbOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        { provide: 'DB_OPTIONS', useValue: options },
        DatabaseService,
      ],
      exports: [DatabaseService],
      global: true,
    };
  }
}

// Sử dụng
@Module({
  imports: [DatabaseModule.forRoot({ host: 'localhost', port: 5432 })],
})
export class AppModule {}
```

---

## Controllers

Controller = xử lý HTTP request, trả response.

```typescript
import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  // DI: inject UsersService
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
```

### DTO (Data Transfer Object)

```typescript
// dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string = 'user';
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
export class UpdateUserDto extends PartialType(CreateUserDto) {}
// → tất cả fields trở thành optional
```

---

## Providers & Services

Provider = class có `@Injectable()`, được quản lý bởi IoC container.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [{ id: 1, name: 'Admin', email: 'admin@example.com' }];

  findAll(page: number, limit: number) {
    const start = (page - 1) * limit;
    return {
      data: this.users.slice(start, start + limit),
      total: this.users.length,
    };
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  create(dto: CreateUserDto) {
    const user = { id: this.users.length + 1, ...dto };
    this.users.push(user);
    return user;
  }

  update(id: number, dto: UpdateUserDto) {
    const user = this.findOne(id);
    Object.assign(user, dto);
    return user;
  }

  remove(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new NotFoundException(`User #${id} not found`);
    this.users.splice(index, 1);
  }
}
```

---

## Dependency Injection

### Constructor injection (phổ biến nhất)

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}
}
```

### Property injection

```typescript
@Injectable()
export class UsersService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
}
```

### Token injection

```typescript
@Injectable()
export class UsersService {
  constructor(@Inject('CONFIG') private config: AppConfig) {}
}
```

---

## Custom Providers

```typescript
@Module({
  providers: [
    // 1. Standard (class)
    UsersService,

    // 2. Value provider
    { provide: 'API_KEY', useValue: 'my-secret-key' },

    // 3. Class provider (swap implementation)
    { provide: UsersService, useClass: MockUsersService },

    // 4. Factory provider (async, dependencies)
    {
      provide: 'DATABASE',
      useFactory: async (config: ConfigService) => {
        return new Database(config.get('DB_URL'));
      },
      inject: [ConfigService],
    },

    // 5. Existing provider (alias)
    { provide: 'ALIAS', useExisting: UsersService },
  ],
})
export class UsersModule {}
```

---

## Scope

```typescript
// DEFAULT (singleton) — 1 instance cho toàn app (mặc định)
@Injectable()
export class UsersService {}

// REQUEST — 1 instance mới cho mỗi request
@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

// TRANSIENT — 1 instance mới mỗi khi inject
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {}
```

| Scope | Instance | Use case |
|-------|----------|----------|
| DEFAULT | 1 (singleton) | Hầu hết services |
| REQUEST | 1 per request | Multi-tenancy, request context |
| TRANSIENT | 1 per injection | Stateful helpers |

---

## Câu hỏi phỏng vấn

**Q: Module trong NestJS là gì?**

> Module nhóm controllers, services liên quan. Mỗi app có 1 root module. Feature modules tách biệt business domains. Module có thể import/export providers cho modules khác.

**Q: Provider scope DEFAULT vs REQUEST vs TRANSIENT?**

> DEFAULT (singleton): 1 instance shared toàn app — dùng cho hầu hết services. REQUEST: 1 instance per HTTP request — dùng cho multi-tenancy, request-scoped data. TRANSIENT: instance mới mỗi lần inject — dùng cho stateful utilities.

**Q: `useClass` vs `useFactory` vs `useValue`?**

> `useValue`: giá trị tĩnh (config, constants). `useClass`: swap class implementation (testing, environment). `useFactory`: tạo provider bằng function, có thể async, inject dependencies.

---

**Tiếp theo**: [03 - Pipes, Guards & Interceptors](./03-Pipes-Guards-Interceptors.md)
