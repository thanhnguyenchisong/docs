# Federation & Interview

## Apollo Federation — GraphQL cho Microservices

```
                    ┌──────────────┐
     Client ──────→│  Gateway     │  (Apollo Router / Spring Gateway)
                    │  (Supergraph)│
                    └──────┬───────┘
                    ┌──────┼───────┐
                    │      │       │
              ┌─────┴──┐ ┌┴────┐ ┌┴───────┐
              │ User   │ │Order│ │Product  │  Mỗi service own schema riêng
              │Service │ │Svc  │ │Service  │
              └────────┘ └─────┘ └─────────┘
```

```graphql
# User Service schema
type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
}

# Order Service extends User
extend type User @key(fields: "id") {
    id: ID! @external
    orders: [Order!]!
}

type Order @key(fields: "id") {
    id: ID!
    total: Float!
}
```

## Interview Checklist

- [ ] GraphQL vs REST: over-fetching, under-fetching
- [ ] Schema: types, queries, mutations, subscriptions
- [ ] Resolvers: field resolvers, nested resolvers
- [ ] N+1: DataLoader pattern
- [ ] Pagination: cursor-based vs offset
- [ ] Security: complexity limit, depth limit, auth
- [ ] Federation: supergraph, subgraph, @key directive
- [ ] Caching: persisted queries, CDN, in-memory

**Quay lại:** [README.md](./README.md)
