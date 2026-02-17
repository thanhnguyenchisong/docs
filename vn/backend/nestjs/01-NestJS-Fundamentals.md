# NestJS Fundamentals

## Mục lục
1. [NestJS là gì?](#nestjs-là-gì)
2. [Tại sao NestJS?](#tại-sao-nestjs)
3. [Cài đặt & CLI](#cài-đặt--cli)
4. [Project Structure](#project-structure)
5. [Decorators](#decorators)
6. [Request Lifecycle](#request-lifecycle)
7. [NestJS vs Express](#nestjs-vs-express)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## NestJS là gì?

**NestJS** là framework Node.js progressive, xây dựng trên **TypeScript**, dùng kiến trúc **module-based** lấy cảm hứng từ Angular. Bên dưới dùng **Express** (mặc định) hoặc **Fastify**.

### Đặc điểm chính

- **TypeScript-first** — type safety, decorators, metadata.
- **Module-based architecture** — chia app thành modules độc lập.
- **Dependency Injection** — IoC container built-in.
- **Decorator-driven** — `@Controller`, `@Get`, `@Injectable`, `@Module`.
- **Opinionated** — quy ước rõ ràng, dễ maintain, team lớn.
- **Ecosystem phong phú** — GraphQL, WebSocket, Microservices, CQRS, Swagger built-in.

---

## Tại sao NestJS?

| Vấn đề với Express thuần | NestJS giải quyết |
|--------------------------|-------------------|
| Không có cấu trúc chuẩn | Module/Controller/Service pattern |
| DI phải tự implement | IoC container built-in |
| TypeScript phải config | TypeScript by default |
| Testing khó mock | Testing module, DI dễ mock |
| Microservices phải tự viết | Transport layers built-in |
| Swagger phải tự config | `@nestjs/swagger` tự generate |

---

## Cài đặt & CLI

```bash
npm install -g @nestjs/cli
nest new my-project
cd my-project
npm run start:dev    # http://localhost:3000
```

### CLI Commands

```bash
nest new <name>                  # tạo project
nest generate module users       # tạo module (nest g mo users)
nest generate controller users   # tạo controller (nest g co users)
nest generate service users      # tạo service (nest g s users)
nest generate resource users     # tạo CRUD resource (module + controller + service + DTO)
nest build                       # build production
```

---

## Project Structure

```
src/
├── main.ts                  ← Entry point (bootstrap)
├── app.module.ts            ← Root module
├── app.controller.ts        ← Root controller
├── app.service.ts           ← Root service
└── users/
    ├── users.module.ts      ← Feature module
    ├── users.controller.ts  ← HTTP handlers
    ├── users.service.ts     ← Business logic
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    └── entities/
        └── user.entity.ts
```

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,        // auto-transform types
  }));

  app.enableCors();
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
```

---

## Decorators

NestJS sử dụng **decorators** (TypeScript experimental feature) để khai báo metadata.

### Controller Decorators

```typescript
@Controller('users')          // base path: /users
export class UsersController {
  @Get()                       // GET /users
  findAll() {}

  @Get(':id')                  // GET /users/:id
  findOne(@Param('id') id: string) {}

  @Post()                      // POST /users
  create(@Body() dto: CreateUserDto) {}

  @Put(':id')                  // PUT /users/:id
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {}

  @Patch(':id')                // PATCH /users/:id
  partialUpdate(@Param('id') id: string, @Body() dto: UpdateUserDto) {}

  @Delete(':id')               // DELETE /users/:id
  remove(@Param('id') id: string) {}

  @HttpCode(204)               // custom status code
  @Header('Cache-Control', 'none')
  @Redirect('https://example.com', 301)
}
```

### Parameter Decorators

```typescript
@Get('search')
search(
  @Query('q') query: string,             // query param
  @Query() allQuery: any,                 // all query params
  @Param('id') id: string,               // route param
  @Body() body: CreateUserDto,            // request body
  @Body('name') name: string,            // specific body field
  @Headers('authorization') auth: string, // header
  @Ip() ip: string,                       // client IP
  @Req() req: Request,                    // full request (Express)
  @Res() res: Response,                   // full response (Express)
) {}
```

### Other Decorators

```typescript
@Injectable()              // service, provider
@Module({})                // module definition
@Inject('TOKEN')           // inject by token
@Optional()                // optional dependency
@UseGuards(AuthGuard)      // apply guard
@UsePipes(ValidationPipe)  // apply pipe
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
@SetMetadata('roles', ['admin'])
```

---

## Request Lifecycle

```
Incoming Request
       │
       ▼
   Middleware        (Express-style, app.use())
       │
       ▼
    Guards           (canActivate? → 403 Forbidden)
       │
       ▼
  Interceptors       (before handler — logging, transform)
       │
       ▼
    Pipes            (validation, transformation)
       │
       ▼
  Route Handler      (controller method)
       │
       ▼
  Interceptors       (after handler — transform response)
       │
       ▼
 Exception Filters   (catch errors → format response)
       │
       ▼
   Response
```

---

## NestJS vs Express

| | Express | NestJS |
|---|---------|--------|
| Language | JS/TS (optional) | **TypeScript** (default) |
| Architecture | Không quy ước | **Module/Controller/Service** |
| DI | Không có | **Built-in IoC container** |
| Decorators | Không | **Decorator-driven** |
| Testing | Tự config | **Testing module built-in** |
| Microservices | Tự viết | **Transport layers built-in** |
| GraphQL | Tự config | **@nestjs/graphql** |
| WebSocket | Tự config | **@nestjs/websockets** |
| Swagger | Tự config | **@nestjs/swagger** auto-generate |
| Learning curve | Thấp | Trung bình–cao |
| Phù hợp | Small–medium, prototype | **Medium–large, enterprise** |

---

## Câu hỏi phỏng vấn

**Q: NestJS là gì? Tại sao dùng NestJS thay vì Express?**

> NestJS là framework Node.js TypeScript-first với kiến trúc module-based, DI built-in, decorator-driven. So với Express: có cấu trúc rõ ràng, DI container, testing module, hỗ trợ microservices/GraphQL/WebSocket/Swagger built-in. Phù hợp enterprise, team lớn.

**Q: Request lifecycle trong NestJS?**

> Middleware → Guards → Interceptors (before) → Pipes → Route Handler → Interceptors (after) → Exception Filters.

**Q: NestJS dùng Express hay Fastify?**

> Mặc định dùng Express. Có thể chuyển sang Fastify (`@nestjs/platform-fastify`) để performance cao hơn 2-3x. API giống nhau nhờ adapter pattern.

---

**Tiếp theo**: [02 - Modules, Controllers & Providers](./02-Modules-Controllers-Providers.md)
