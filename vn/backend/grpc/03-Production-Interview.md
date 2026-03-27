# gRPC Production & Interview

## Production Best Practices

### Deadline (Timeout)

```java
// Client PHẢI set deadline — tránh request treo mãi
stub.withDeadlineAfter(5, TimeUnit.SECONDS).getOrder(request);

// Server check deadline còn không
if (Context.current().isCancelled()) {
    responseObserver.onError(Status.CANCELLED.asRuntimeException());
    return;
}
```

### Health Check

```protobuf
// gRPC health check protocol (standard)
service Health {
    rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
    rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

### Load Balancing

```
gRPC dùng HTTP/2 → 1 TCP connection, multiplexed streams
→ L4 LB (TCP) chỉ thấy 1 connection → không cân bằng được

Giải pháp:
1. Client-side LB: client biết tất cả servers, round-robin
2. L7 LB: Envoy, Nginx (HTTP/2 aware), Istio
3. Look-aside LB: client → name resolver → load balancer
```

## Interview Checklist

- [ ] gRPC vs REST: HTTP/2, binary, streaming, type safety
- [ ] Protobuf: schema, backward compatibility, field numbers
- [ ] 4 types: unary, server stream, client stream, bidirectional
- [ ] gRPC status codes vs HTTP status codes
- [ ] Deadline/timeout: client PHẢI set, server PHẢI check
- [ ] Load balancing: L7 (Envoy), client-side, issues with L4
- [ ] Service mesh: Istio, Linkerd cho gRPC load balancing
- [ ] When to use: service-to-service, NOT browser-facing

**Quay lại:** [README.md](./README.md)
