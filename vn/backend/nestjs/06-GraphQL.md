# GraphQL

## Mục lục
1. [GraphQL là gì?](#graphql-là-gì)
2. [NestJS + GraphQL Setup](#setup)
3. [Code-first Approach](#code-first)
4. [Resolvers](#resolvers)
5. [Relations & DataLoader](#relations)
6. [Subscriptions](#subscriptions)
7. [GraphQL vs REST](#graphql-vs-rest)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## GraphQL là gì?

**GraphQL** = Query language cho API. Client yêu cầu **chính xác** dữ liệu cần, không thừa không thiếu.

```graphql
# Client request
query {
  user(id: 1) {
    name
    email
    posts {
      title
    }
  }
}

# Server response — chỉ trả đúng fields yêu cầu
{
  "data": {
    "user": {
      "name": "An",
      "email": "an@example.com",
      "posts": [{ "title": "Hello World" }]
    }
  }
}
```

---

## Setup

```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

```typescript
// app.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // code-first
      playground: true, // GraphQL Playground tại /graphql
      sortSchema: true,
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

---

## Code-first

Dùng TypeScript classes + decorators → NestJS tự sinh schema `.gql`.

### Object Type (Model)

```typescript
import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum Role { USER = 'USER', ADMIN = 'ADMIN' }
registerEnumType(Role, { name: 'Role' });

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field()
  createdAt: Date;
}
```

### Input Type (DTO)

```typescript
@InputType()
export class CreateUserInput {
  @Field()
  @IsString() @MinLength(2)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;
}
```

---

## Resolvers

```typescript
@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }

  // Resolve relation
  @ResolveField(() => [Post])
  posts(@Parent() user: User) {
    return this.postsService.findByUserId(user.id);
  }
}
```

---

## Relations

### N+1 Problem → DataLoader

```bash
npm install dataloader
```

```typescript
@Injectable({ scope: Scope.REQUEST })
export class PostsLoader {
  constructor(private prisma: PrismaService) {}

  readonly batchByUserId = new DataLoader<number, Post[]>(async (userIds) => {
    const posts = await this.prisma.post.findMany({
      where: { authorId: { in: [...userIds] } },
    });
    const map = new Map<number, Post[]>();
    posts.forEach(p => {
      if (!map.has(p.authorId)) map.set(p.authorId, []);
      map.get(p.authorId)!.push(p);
    });
    return userIds.map(id => map.get(id) || []);
  });
}

// Resolver
@ResolveField(() => [Post])
posts(@Parent() user: User) {
  return this.postsLoader.batchByUserId.load(user.id);
}
```

---

## Subscriptions

Real-time updates qua WebSocket.

```typescript
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  subscriptions: { 'graphql-ws': true },
})

// Resolver
@Resolver(() => Post)
export class PostsResolver {
  constructor(private pubSub: PubSub) {} // hoặc RedisPubSub

  @Mutation(() => Post)
  async createPost(@Args('input') input: CreatePostInput) {
    const post = await this.postsService.create(input);
    this.pubSub.publish('postCreated', { postCreated: post });
    return post;
  }

  @Subscription(() => Post)
  postCreated() {
    return this.pubSub.asyncIterableIterator('postCreated');
  }
}
```

---

## GraphQL vs REST

| | REST | GraphQL |
|---|------|---------|
| Endpoints | Nhiều (`/users`, `/posts`) | 1 (`/graphql`) |
| Over-fetching | Có | **Không** (client chọn fields) |
| Under-fetching | Có (cần nhiều requests) | **Không** (nested query) |
| Versioning | URL hoặc header | **Không cần** (deprecate fields) |
| Caching | HTTP cache dễ | Phức tạp hơn |
| File upload | Dễ | Cần thêm lib |
| Phù hợp | CRUD đơn giản, public API | Complex data, mobile, dashboard |

---

## Câu hỏi phỏng vấn

**Q: GraphQL giải quyết vấn đề gì của REST?**

> Over-fetching (trả quá nhiều fields) và Under-fetching (cần nhiều requests cho related data). Client request chính xác fields cần trong 1 query.

**Q: N+1 problem trong GraphQL?**

> Khi resolve nested relation (users → posts), mỗi user gọi 1 query DB → N+1 queries. Giải pháp: **DataLoader** — batch + cache queries trong 1 request.

---

**Tiếp theo**: [07 - WebSocket & Real-time](./07-WebSocket-Realtime.md)
