# Authentication & Authorization

## Mục lục
1. [Passport + JWT](#passport--jwt)
2. [Register & Login](#register--login)
3. [JWT Guard](#jwt-guard)
4. [Role-Based Access Control (RBAC)](#rbac)
5. [Refresh Token](#refresh-token)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Passport + JWT

```bash
npm install @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### AuthModule

```typescript
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, password: hash });
    return { id: user.id, name: user.name, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
```

### JwtStrategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  validate(payload: { sub: number; role: string }) {
    return { id: payload.sub, role: payload.role };
    // → req.user = { id, role }
  }
}
```

---

## Register & Login

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@Request() req) {
    return req.user;
  }
}
```

---

## JWT Guard

```typescript
// Cách 1: Dùng trực tiếp
@UseGuards(AuthGuard('jwt'))
@Get('profile')
profile(@Request() req) { return req.user; }

// Cách 2: Custom guard (reusable)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {}

// Cách 3: Global guard + @Public() decorator
// → Mặc định tất cả routes cần auth, dùng @Public() để bỏ qua
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

// app.module.ts
providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }]

// Controller
@Public()
@Post('login')
login(@Body() dto: LoginDto) {}
```

---

## RBAC

```typescript
// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Sử dụng
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
remove(@Param('id') id: string) {}
```

---

## Refresh Token

```typescript
async login(dto: LoginDto) {
  // ... validate ...
  const payload = { sub: user.id, role: user.role };
  return {
    access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    refresh_token: this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    }),
  };
}

async refresh(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return {
      access_token: this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        { expiresIn: '15m' },
      ),
    };
  } catch {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

---

## Câu hỏi phỏng vấn

**Q: Cách implement auth trong NestJS?**

> Dùng `@nestjs/passport` + `@nestjs/jwt`. Tạo JwtStrategy (validate token), AuthGuard (protect routes). Login → sign JWT. Protected routes dùng `@UseGuards(AuthGuard('jwt'))`.

**Q: Global guard + @Public() decorator hoạt động thế nào?**

> Register JwtAuthGuard như APP_GUARD → mọi route mặc định cần auth. Guard kiểm tra metadata `isPublic` trên handler/class → nếu có thì skip auth. Dùng `@Public()` decorator cho login, register, health check.

---

**Tiếp theo**: [06 - GraphQL](./06-GraphQL.md)
