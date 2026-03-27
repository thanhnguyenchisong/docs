# GraphQL vs REST

## So sánh

| Tiêu chí | REST | GraphQL |
|----------|------|---------|
| **Endpoint** | Nhiều endpoints (`/users`, `/orders`) | 1 endpoint (`/graphql`) |
| **Data format** | Server quyết định response shape | Client quyết định cần fields nào |
| **Over-fetching** | Trả cả object dù client chỉ cần 2 fields | ✅ Chỉ trả fields được request |
| **Under-fetching** | Cần gọi nhiều endpoints | ✅ 1 query lấy nested data |
| **Versioning** | URL versioning (`/v1`, `/v2`) | Schema evolution (deprecate fields) |
| **Caching** | HTTP cache (GET, ETag) | Khó cache hơn (POST + custom) |
| **Learning curve** | Thấp | Trung bình |
| **Tooling** | Mature (Swagger/OpenAPI) | GraphQL Playground, Apollo DevTools |

## Over-fetching vs Under-fetching

```
REST: GET /api/users/123
→ Trả { id, name, email, phone, address, avatar, bio, ... } (20 fields)
→ Client chỉ cần { name, avatar } → OVER-FETCHING

REST: Trang profile cần user + orders + reviews
→ GET /users/123
→ GET /users/123/orders
→ GET /users/123/reviews
→ 3 API calls → UNDER-FETCHING

GraphQL: 1 query
query {
  user(id: 123) {
    name
    avatar
    orders(last: 5) { id, total, status }
    reviews(last: 3) { id, rating, comment }
  }
}
→ 1 call, đúng data cần
```

## Khi Nào Dùng GraphQL?

| GraphQL ✅ | REST ✅ |
|-----------|--------|
| Mobile apps (bandwidth limited) | Simple CRUD APIs |
| Dashboard/aggregation (nhiều data sources) | Public APIs (caching tốt) |
| Rapid frontend iteration | File upload/download |
| Multiple client types (web, mobile, watch) | Real-time streaming (SSE/WebSocket) |
| Complex nested data | Simple microservices |
