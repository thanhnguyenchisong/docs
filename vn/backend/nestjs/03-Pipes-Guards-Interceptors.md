# Pipes, Guards & Interceptors

## Mục lục
1. [Pipes](#pipes)
2. [Guards](#guards)
3. [Interceptors](#interceptors)
4. [Exception Filters](#exception-filters)
5. [Execution Order](#execution-order)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Pipes

**Pipe** = transform/validate input trước khi đến handler.

### Built-in Pipes

```typescript
import { ParseIntPipe, ParseBoolPipe, ParseUUIDPipe, DefaultValuePipe, ValidationPipe } from '@nestjs/common';

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}  // '42' → 42, 'abc' → 400

@Get()
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean,
) {}
```

### ValidationPipe (class-validator)

```bash
npm install class-validator class-transformer
```

```typescript
// Global (main.ts)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // strip properties không có trong DTO
  forbidNonWhitelisted: true, // throw nếu có property lạ
  transform: true,            // auto-transform ('1' → 1)
  transformOptions: { enableImplicitConversion: true },
}));

// DTO
import { IsString, IsEmail, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString() @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(8)
  password: string;

  @IsOptional() @IsInt() @Min(0) @Max(120)
  age?: number;
}
```

### Custom Pipe

```typescript
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof value[key] === 'string') value[key] = value[key].trim();
      }
    }
    return value;
  }
}
```

---

## Guards

**Guard** = quyết định request có được xử lý hay không (authentication, authorization).

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      request.user = this.jwtService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

### Role Guard

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // no roles = public
    const { user } = context.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}

// Sử dụng
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
remove(@Param('id') id: string) {}
```

---

## Interceptors

**Interceptor** = logic trước/sau handler (logging, transform, caching, timeout).

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    console.log(`→ ${req.method} ${req.url}`);

    return next.handle().pipe(
      tap(() => console.log(`← ${req.method} ${req.url} ${Date.now() - now}ms`)),
    );
  }
}

// Transform response
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { data: T }> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<{ data: T }> {
    return next.handle().pipe(
      map(data => ({ success: true, data })),
    );
  }
}

// Timeout
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException();
        }
        throw err;
      }),
    );
  }
}
```

---

## Exception Filters

```typescript
// Built-in exceptions
throw new BadRequestException('Invalid data');
throw new UnauthorizedException();
throw new ForbiddenException();
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new InternalServerErrorException();

// Custom filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

// Apply globally
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## Execution Order

```
Middleware → Guards → Interceptors (pre) → Pipes → Handler → Interceptors (post) → Filters
```

### Apply levels

```typescript
// Global
app.useGlobalPipes(new ValidationPipe());
app.useGlobalGuards(new AuthGuard());
app.useGlobalInterceptors(new LoggingInterceptor());

// Controller
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {}

// Method
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe())
@Post()
create(@Body() dto: CreateUserDto) {}
```

---

## Câu hỏi phỏng vấn

**Q: Pipe vs Guard vs Interceptor — khác gì?**

> **Pipe**: transform/validate input (chạy trước handler). **Guard**: yes/no cho request (authentication/authorization). **Interceptor**: logic trước + sau handler (logging, transform response, caching). Execution order: Guard → Interceptor (pre) → Pipe → Handler → Interceptor (post).

**Q: Cách validate request body trong NestJS?**

> Dùng `ValidationPipe` + `class-validator` decorators trên DTO class. Global: `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`. DTO dùng `@IsString()`, `@IsEmail()`, `@MinLength()`, v.v.

---

**Tiếp theo**: [04 - Database: Prisma & TypeORM](./04-Database-Prisma-TypeORM.md)
