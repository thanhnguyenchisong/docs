# GraphQL với Node.js

## Mục lục
1. [GraphQL là gì?](#graphql-là-gì)
2. [Apollo Server Setup](#apollo-server)
3. [Schema & Types](#schema)
4. [Resolvers](#resolvers)
5. [Mutations](#mutations)
6. [Subscriptions](#subscriptions)
7. [DataLoader (N+1)](#dataloader)
8. [GraphQL vs REST](#graphql-vs-rest)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## GraphQL là gì?

**GraphQL** = query language cho API (Facebook, 2015). Client request **chính xác** data cần.

```graphql
# Query — client chọn fields
query {
  user(id: 1) {
    name
    email
    posts {
      title
    }
  }
}

# Response — không thừa, không thiếu
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

## Apollo Server

```bash
npm install @apollo/server graphql
```

```javascript
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Schema (SDL)
const typeDefs = `
  type User {
    id: Int!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String
    published: Boolean!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts(published: Boolean): [Post!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(title: String!, content: String, authorId: Int!): Post!
    publishPost(id: Int!): Post!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: () => db.users,
    user: (_, { id }) => db.users.find(u => u.id === id),
    posts: (_, { published }) =>
      published !== undefined
        ? db.posts.filter(p => p.published === published)
        : db.posts,
  },
  Mutation: {
    createUser: (_, { name, email }) => {
      const user = { id: db.users.length + 1, name, email };
      db.users.push(user);
      return user;
    },
    createPost: (_, { title, content, authorId }) => {
      const post = { id: db.posts.length + 1, title, content, published: false, authorId };
      db.posts.push(post);
      return post;
    },
    publishPost: (_, { id }) => {
      const post = db.posts.find(p => p.id === id);
      if (!post) throw new Error('Post not found');
      post.published = true;
      return post;
    },
  },
  User: {
    posts: (parent) => db.posts.filter(p => p.authorId === parent.id),
  },
  Post: {
    author: (parent) => db.users.find(u => u.id === parent.authorId),
  },
};

// In-memory data
const db = {
  users: [{ id: 1, name: 'An', email: 'an@x.com' }],
  posts: [{ id: 1, title: 'Hello', content: 'World', published: true, authorId: 1 }],
};

// Start
const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`GraphQL server: ${url}`);
});
```

---

## Schema

### Scalar types

```graphql
Int, Float, String, Boolean, ID
```

### Custom types

```graphql
type User {
  id: ID!              # non-null
  name: String!
  email: String!
  age: Int             # nullable
  posts: [Post!]!      # non-null array of non-null posts
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

enum Role { USER ADMIN MODERATOR }
```

---

## Resolvers

```javascript
const resolvers = {
  Query: {
    // Root query
    users: async (parent, args, context, info) => {
      return context.prisma.user.findMany();
    },
  },

  Mutation: {
    createUser: async (_, { input }, { prisma }) => {
      return prisma.user.create({ data: input });
    },
  },

  // Field resolver
  User: {
    posts: (user, _, { prisma }) => {
      return prisma.post.findMany({ where: { authorId: user.id } });
    },
    fullName: (user) => `${user.firstName} ${user.lastName}`,
  },
};

// Context — pass DB, auth info
const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, {
  context: async ({ req }) => ({
    prisma,
    user: getUserFromToken(req.headers.authorization),
  }),
});
```

---

## Mutations

```graphql
# Schema
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: Int!, input: UpdateUserInput!): User!
  deleteUser(id: Int!): Boolean!
}

input CreateUserInput { name: String!  email: String!  password: String! }
input UpdateUserInput { name: String   email: String }
```

```javascript
// Resolver
Mutation: {
  createUser: async (_, { input }, { prisma }) => {
    const hash = await bcrypt.hash(input.password, 12);
    return prisma.user.create({ data: { ...input, password: hash } });
  },
  updateUser: async (_, { id, input }, { prisma }) => {
    return prisma.user.update({ where: { id }, data: input });
  },
  deleteUser: async (_, { id }, { prisma }) => {
    await prisma.user.delete({ where: { id } });
    return true;
  },
}
```

---

## Subscriptions

Real-time updates qua WebSocket.

```bash
npm install graphql-ws ws
```

```javascript
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServer } = require('@apollo/server');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

const typeDefs = `
  type Subscription {
    postCreated: Post!
  }
`;

const resolvers = {
  Mutation: {
    createPost: async (_, args, { prisma }) => {
      const post = await prisma.post.create({ data: args });
      pubsub.publish('POST_CREATED', { postCreated: post });
      return post;
    },
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterableIterator(['POST_CREATED']),
    },
  },
};
```

---

## DataLoader

Giải quyết **N+1 problem**: batch + cache queries.

```bash
npm install dataloader
```

```javascript
const DataLoader = require('dataloader');

// Tạo mới mỗi request (context)
const createLoaders = (prisma) => ({
  userLoader: new DataLoader(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
    });
    const map = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => map.get(id));
  }),
});

// Context
context: async ({ req }) => ({
  prisma,
  loaders: createLoaders(prisma),
});

// Resolver
Post: {
  author: (post, _, { loaders }) => loaders.userLoader.load(post.authorId),
}
// → Thay vì N queries → 1 batch query WHERE id IN (...)
```

---

## GraphQL vs REST

| | REST | GraphQL |
|---|------|---------|
| Endpoints | Nhiều (`/users`, `/posts`) | 1 (`/graphql`) |
| Over-fetching | Có (trả hết fields) | **Không** |
| Under-fetching | Có (cần nhiều requests) | **Không** |
| Versioning | URL (`/v2/`) | **Không cần** (deprecate fields) |
| File upload | Dễ (multipart) | Phức tạp |
| Caching | HTTP cache | Persisted queries |
| Learning | Thấp | Trung bình |

---

## Câu hỏi phỏng vấn

**Q: GraphQL giải quyết vấn đề gì?**

> Over-fetching (trả quá nhiều fields) và Under-fetching (cần nhiều requests). Client chọn chính xác fields cần → 1 request, đúng data.

**Q: N+1 problem trong GraphQL?**

> Khi resolve nested relations (users → posts), mỗi user trigger 1 DB query → N+1 queries. Giải pháp: **DataLoader** — batch userIds → 1 query `WHERE id IN (...)`.

---

**Tiếp theo**: [17 - Swagger & OpenAPI](./17-Swagger-OpenAPI.md)
