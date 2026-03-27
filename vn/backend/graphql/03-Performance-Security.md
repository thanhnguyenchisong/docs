# Performance & Security

## Pagination

```graphql
# Cursor-based (recommended)
query {
    products(first: 20, after: "cursor123") {
        edges { node { id, name, price } cursor }
        pageInfo { hasNextPage, endCursor }
    }
}
```

## Query Complexity Limiting

```java
// Ngăn query quá phức tạp (DDoS qua nested queries)
@Bean
public GraphQL graphQL(GraphQLSchema schema) {
    return GraphQL.newGraphQL(schema)
        .instrumentation(new MaxQueryComplexityInstrumentation(100))
        .instrumentation(new MaxQueryDepthInstrumentation(10))
        .build();
}
```

## Auth trong GraphQL

```java
@Controller
public class OrderController {
    @QueryMapping
    @PreAuthorize("hasRole('USER')")
    public List<Order> myOrders(@AuthenticationPrincipal UserDetails user) {
        return orderService.findByUserId(user.getId());
    }

    @MutationMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean deleteOrder(@Argument Long id) {
        return orderService.delete(id);
    }
}
```

## Câu Hỏi Phỏng Vấn

### N+1 trong GraphQL?
> Nested resolvers: query 20 users → mỗi user resolve orders → 20 queries. Fix: **DataLoader** — batch user IDs → 1 query cho tất cả orders.

### GraphQL có thay thế REST không?
> Không hoàn toàn. GraphQL tốt cho complex queries, multiple clients. REST tốt cho simple APIs, caching, file handling. Nhiều company dùng cả hai: GraphQL cho client-facing, REST cho service-to-service.
