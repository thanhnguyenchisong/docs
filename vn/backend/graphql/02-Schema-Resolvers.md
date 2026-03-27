# Schema & Resolvers

## GraphQL Schema (SDL)

```graphql
type Query {
    user(id: ID!): User
    users(page: Int = 0, size: Int = 20): UserConnection!
    searchProducts(query: String!, filter: ProductFilter): [Product!]!
}

type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    createOrder(input: CreateOrderInput!): Order!
}

type Subscription {
    orderStatusChanged(orderId: ID!): Order!
}

type User {
    id: ID!
    name: String!
    email: String!
    orders(status: OrderStatus): [Order!]!
    createdAt: DateTime!
}

type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    total: Float!
    status: OrderStatus!
}

input CreateOrderInput {
    userId: ID!
    items: [OrderItemInput!]!
}

enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
}
```

## Spring for GraphQL (Java Implementation)

```java
// Controller style
@Controller
public class UserGraphQLController {

    @QueryMapping
    public User user(@Argument Long id) {
        return userService.findById(id);
    }

    @QueryMapping
    public Connection<User> users(@Argument int page, @Argument int size) {
        return userService.findAll(PageRequest.of(page, size));
    }

    @MutationMapping
    public User createUser(@Argument CreateUserInput input) {
        return userService.create(input);
    }

    // Nested resolver: User.orders
    @SchemaMapping(typeName = "User")
    public List<Order> orders(User user, @Argument OrderStatus status) {
        return orderService.findByUser(user.getId(), status);
    }
}
```

## DataLoader — Giải Quyết N+1

```java
// Không DataLoader: 20 users → 20 queries cho orders (N+1!)
// Có DataLoader: 20 users → 1 batch query cho orders

@Configuration
public class DataLoaderConfig {

    @Bean
    public BatchLoaderRegistry batchLoaderRegistry(OrderService orderService) {
        return registry -> {
            registry.forTypePair(Long.class, List.class)
                .registerMappedBatchLoader((userIds, env) -> {
                    Map<Long, List<Order>> ordersByUser = orderService.findByUserIds(userIds);
                    return Mono.just(ordersByUser);
                });
        };
    }
}
```
