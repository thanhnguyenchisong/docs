# gRPC Fundamentals

## gRPC vs REST

| Tiêu chí | REST | gRPC |
|----------|------|------|
| **Protocol** | HTTP/1.1 (text JSON) | HTTP/2 (binary Protobuf) |
| **Speed** | Chậm hơn | **2-10x nhanh hơn** |
| **Payload size** | Lớn (JSON text) | **Nhỏ hơn 5-10x** (binary) |
| **Type safety** | Không (JSON dynamic) | **Có** (Protobuf schema) |
| **Streaming** | Hạn chế (SSE, WebSocket) | **Native** (4 types) |
| **Browser** | ✅ Native | ⚠️ Cần proxy (gRPC-Web) |
| **Code gen** | OpenAPI (optional) | **Auto-generated** client/server |
| **Use case** | Client-facing API | **Service-to-service** |

## Protocol Buffers (Protobuf)

```protobuf
// order_service.proto
syntax = "proto3";
package com.example.order;

option java_multiple_files = true;
option java_package = "com.example.order.grpc";

// Service definition
service OrderService {
    // Unary: request → response
    rpc CreateOrder(CreateOrderRequest) returns (Order);
    rpc GetOrder(GetOrderRequest) returns (Order);

    // Server streaming: 1 request → N responses
    rpc GetOrderUpdates(GetOrderRequest) returns (stream OrderUpdate);

    // Client streaming: N requests → 1 response
    rpc BatchCreateOrders(stream CreateOrderRequest) returns (BatchOrderResponse);

    // Bidirectional streaming
    rpc OrderChat(stream ChatMessage) returns (stream ChatMessage);
}

// Messages
message Order {
    int64 id = 1;
    string user_id = 2;
    repeated OrderItem items = 3;
    OrderStatus status = 4;
    double total = 5;
    google.protobuf.Timestamp created_at = 6;
}

message OrderItem {
    string product_id = 1;
    int32 quantity = 2;
    double price = 3;
}

message CreateOrderRequest {
    string user_id = 1;
    repeated OrderItem items = 2;
}

enum OrderStatus {
    PENDING = 0;
    CONFIRMED = 1;
    SHIPPED = 2;
    DELIVERED = 3;
}
```

## 4 Communication Patterns

```
1. Unary:           Client ──→ Server ──→ Response
2. Server Streaming: Client ──→ Server ══→ Response1, Response2, ...
3. Client Streaming: Client ══→ Request1, Request2, ... ──→ Server ──→ Response
4. Bidirectional:    Client ←══→ Server (cả hai gửi/nhận stream)
```

## Khi Nào Dùng gRPC?

```
✅ Service-to-service communication (microservices)
✅ Low latency requirements (< 10ms)
✅ High throughput (1M+ RPS)
✅ Streaming data (real-time updates, file transfer)
✅ Polyglot services (Java ↔ Go ↔ Python — auto-generated clients)

❌ Browser-facing API (dùng REST hoặc GraphQL)
❌ Simple CRUD (REST đủ)
❌ Human-readable debugging (Protobuf is binary)
```
