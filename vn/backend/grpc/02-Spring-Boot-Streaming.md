# Spring Boot gRPC & Streaming

## Spring Boot Integration

```xml
<!-- pom.xml -->
<dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-spring-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

```java
// Server implementation
@GrpcService
public class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {

    @Autowired private OrderService orderService;

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<Order> responseObserver) {
        try {
            var order = orderService.create(toCommand(request));
            responseObserver.onNext(toProto(order));
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                .withDescription(e.getMessage())
                .asRuntimeException());
        }
    }

    // Server streaming
    @Override
    public void getOrderUpdates(GetOrderRequest request,
                                 StreamObserver<OrderUpdate> responseObserver) {
        orderService.streamUpdates(request.getOrderId())
            .forEach(update -> responseObserver.onNext(toProto(update)));
        responseObserver.onCompleted();
    }
}
```

```java
// Client
@Service
public class OrderGrpcClient {

    @GrpcClient("order-service")
    private OrderServiceGrpc.OrderServiceBlockingStub orderStub;

    public Order createOrder(String userId, List<Item> items) {
        CreateOrderRequest request = CreateOrderRequest.newBuilder()
            .setUserId(userId)
            .addAllItems(items.stream().map(this::toProto).toList())
            .build();

        return orderStub
            .withDeadlineAfter(5, TimeUnit.SECONDS)  // Timeout
            .createOrder(request);
    }
}
```

## Error Handling

```java
// gRPC Status codes (tương tự HTTP status)
Status.OK              // 200
Status.INVALID_ARGUMENT // 400
Status.NOT_FOUND       // 404
Status.ALREADY_EXISTS  // 409
Status.PERMISSION_DENIED // 403
Status.INTERNAL        // 500
Status.UNAVAILABLE     // 503
Status.DEADLINE_EXCEEDED // 504 (timeout)

// Throw error
responseObserver.onError(
    Status.NOT_FOUND
        .withDescription("Order not found: " + orderId)
        .asRuntimeException()
);
```
