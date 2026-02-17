# Swagger & OpenAPI

## Mục lục
1. [Setup](#setup)
2. [DTO Decorators](#dto-decorators)
3. [Controller Decorators](#controller-decorators)
4. [Authentication](#authentication)
5. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Setup

```bash
npm install @nestjs/swagger
```

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('REST API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  // → Swagger UI tại http://localhost:3000/api/docs

  await app.listen(3000);
}
```

---

## DTO Decorators

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn An', description: 'Tên người dùng', minLength: 2 })
  @IsString() @MinLength(2)
  name: string;

  @ApiProperty({ example: 'an@example.com', description: 'Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString() @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['user', 'admin'], default: 'user' })
  @IsOptional() @IsEnum(['user', 'admin'])
  role?: string;
}

// Auto-generate DTO từ Prisma schema → dùng @nestjs/swagger plugin
// tsconfig.json: "plugins": ["@nestjs/swagger"]
```

---

## Controller Decorators

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {

  @ApiOperation({ summary: 'Lấy danh sách users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Thành công', type: [UserResponseDto] })
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {}

  @ApiOperation({ summary: 'Lấy user theo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateUserDto) {}
}
```

---

## Authentication

```typescript
// DocumentBuilder
.addBearerAuth({
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Nhập JWT token',
})

// Controller hoặc method
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
```

Trên Swagger UI sẽ có nút **Authorize** để nhập token.

---

## Câu hỏi phỏng vấn

**Q: Swagger trong NestJS tự generate như thế nào?**

> NestJS đọc decorators (`@ApiProperty`, `@ApiOperation`, `@ApiResponse`) + DTO classes → sinh OpenAPI spec (JSON) → render Swagger UI. Dùng plugin `@nestjs/swagger` trong tsconfig để auto-infer types.

**Q: Tại sao cần API documentation?**

> Frontend dev biết endpoint, request/response format. QA test đúng spec. Auto-generate client SDK. Dễ onboard developer mới. Swagger UI cho phép test API trực tiếp.

---

**Tiếp theo**: [11 - Master NestJS](./11-Master-NestJS.md)
