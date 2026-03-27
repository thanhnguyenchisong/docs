# Virtual Threads (Project Loom) - Từ Zero đến Master Quarkus

## Mục lục
1. [Tại sao cần Virtual Threads?](#tại-sao-cần-virtual-threads)
2. [Virtual Thread là gì?](#virtual-thread-là-gì)
3. [So sánh: Platform Thread vs Virtual Thread vs Reactive](#so-sánh-platform-thread-vs-virtual-thread-vs-reactive)
4. [@RunOnVirtualThread trong Quarkus](#runonvirtualthread-trong-quarkus)
5. [REST API với Virtual Threads](#rest-api-với-virtual-threads)
6. [Messaging & Scheduler với Virtual Threads](#messaging--scheduler-với-virtual-threads)
7. [gRPC và WebSocket](#grpc-và-websocket)
8. [Pinning — Vấn đề nghiêm trọng nhất](#pinning--vấn-đề-nghiêm-trọng-nhất)
9. [ThreadLocal, ScopedValue & Context](#threadlocal-scopedvalue--context)
10. [Performance Benchmark: VT vs Reactive vs Platform](#performance-benchmark-vt-vs-reactive-vs-platform)
11. [Migration Guide: Blocking → Virtual Threads](#migration-guide-blocking--virtual-threads)
12. [Migration Guide: Reactive → Virtual Threads](#migration-guide-reactive--virtual-threads)
13. [Best Practices & Pitfalls](#best-practices--pitfalls)
14. [Native Image & Virtual Threads](#native-image--virtual-threads)
15. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tại sao cần Virtual Threads?

### Vấn đề kinh điển: Thread-per-request

```
Mô hình truyền thống (Blocking / Platform Threads):

Request 1 → Platform Thread 1 → DB query (50ms BLOCK) → Response
Request 2 → Platform Thread 2 → HTTP call (200ms BLOCK) → Response
Request 3 → Platform Thread 3 → File I/O (30ms BLOCK) → Response
...
Request 201 → ??? → Thread pool exhausted → 503 Service Unavailable

Mỗi thread = ~1MB stack → 200 threads = 200MB RAM chỉ cho stacks
```

### Hai giải pháp trước Java 21

| Giải pháp | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- |
| **Reactive (Mutiny/RxJava)** | Non-blocking, throughput cao | Code phức tạp, learning curve cao, debug khó |
| **Thread Pool tuning** | Đơn giản | Giới hạn bởi OS threads, memory tốn |

### Java 21+ Virtual Threads: "Best of both worlds"

```
Virtual Threads:
- Viết code BLOCKING BÌNH THƯỜNG (như thread-per-request)
- Nhưng mỗi Virtual Thread KHÔNG chiếm OS thread khi bị block
- JVM tự quản lý: suspend VT khi block, resume khi I/O sẵn sàng
- 1 triệu VT = vẫn chỉ dùng vài chục OS threads
```

---

## Virtual Thread là gì?

### Kiến trúc

```
┌──────────────────────────────────────────────────────┐
│                  User Code (Blocking)                  │
│                                                        │
│  var result = db.query("SELECT...");  // BLOCKING OK   │
│  var data = httpClient.get(url);      // BLOCKING OK   │
│                                                        │
├──────────────────────────────────────────────────────┤
│                Virtual Thread (VT)                      │
│  - Lightweight (~KB, không phải ~MB)                   │
│  - JVM-managed (không phải OS-managed)                 │
│  - Khi block I/O → JVM "unmount" VT khỏi carrier      │
│  - Khi I/O xong → JVM "mount" lại VT lên carrier      │
├──────────────────────────────────────────────────────┤
│              Carrier Thread (Platform Thread)           │
│  - Số lượng = CPU cores (hoặc ForkJoinPool size)      │
│  - OS thread thật                                      │
│  - Khi VT bị unmount → carrier thread chạy VT khác    │
├──────────────────────────────────────────────────────┤
│                    OS / Hardware                        │
└──────────────────────────────────────────────────────┘
```

### Mount / Unmount

```java
// Khi Virtual Thread gặp blocking I/O:
var result = db.query("SELECT * FROM users WHERE id = 1");

// JVM nội bộ:
// 1. VT-1 đang chạy trên Carrier-Thread-3
// 2. db.query() → socket read (blocking)
// 3. JVM unmount VT-1 khỏi Carrier-Thread-3
// 4. Carrier-Thread-3 mount VT-2 (request khác) → xử lý tiếp
// 5. DB trả kết quả → JVM mount lại VT-1 lên Carrier-Thread (bất kỳ)
// 6. VT-1 tiếp tục var result = ...

// → Carrier Thread KHÔNG BAO GIỜ bị idle
// → 10,000 Virtual Threads, chỉ 8 Carrier Threads (8 cores)
```

### Tạo Virtual Thread thuần Java

```java
// Java 21+
// Cách 1: Thread.ofVirtual()
Thread.ofVirtual().start(() -> {
    System.out.println("Running on: " + Thread.currentThread());
    // Thread[#21,VirtualThread-1]
});

// Cách 2: Executors
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // Mỗi task = 1 Virtual Thread
    Future<String> f1 = executor.submit(() -> callServiceA());
    Future<String> f2 = executor.submit(() -> callServiceB());
    System.out.println(f1.get() + " " + f2.get());
}

// Cách 3: StructuredTaskScope (Preview trong Java 21)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<User> user = scope.fork(() -> fetchUser(id));
    Future<List<Order>> orders = scope.fork(() -> fetchOrders(id));
    scope.join();
    scope.throwIfFailed();
    return new UserDashboard(user.resultNow(), orders.resultNow());
}
```

---

## So sánh: Platform Thread vs Virtual Thread vs Reactive

| Tiêu chí | Platform Thread | Virtual Thread | Reactive (Mutiny) |
| :--- | :--- | :--- | :--- |
| **Code style** | Blocking (imperative) | Blocking (imperative) | Non-blocking (functional) |
| **Memory per task** | ~1 MB (thread stack) | ~KB (continuation) | ~KB (state machine) |
| **Max concurrent** | Hundreds | **Millions** | **Millions** |
| **Learning curve** | Thấp | **Thấp** | Cao |
| **Debugging** | Dễ (stack trace rõ) | **Dễ** (stack trace rõ) | Khó (lambda chains) |
| **Backpressure** | Không | Không built-in | **Có** (Reactive Streams) |
| **Streaming** | Khó | Khó | **Tốt** (Multi, SSE) |
| **CPU-bound tasks** | Tốt | Tốt | Tốt |
| **I/O-bound tasks** | Kém (thread exhaustion) | **Tốt** | **Tốt** |
| **Quarkus support** | ✅ (mặc định) | ✅ (Java 21+) | ✅ (Mutiny) |
| **Native Image** | ✅ | ✅ (từ GraalVM 23+) | ✅ |

### Khi nào dùng cái nào?

```
                    ┌─────────────────────────┐
                    │    Yêu cầu của bạn?     │
                    └────────┬────────────────┘
                             │
                    ┌────────▼────────────────┐
                    │ Cần streaming/backpressure│
                    │ (SSE, Kafka, WebSocket)?  │
                    └──┬─────────────────┬─────┘
                       │ Có              │ Không
                  ┌────▼─────┐     ┌────▼────────────────┐
                  │ Reactive  │     │ Code chủ yếu I/O?    │
                  │ (Mutiny)  │     │ (DB, HTTP, file)     │
                  └──────────┘     └──┬────────────┬──────┘
                                     │ Có         │ Không
                                ┌────▼─────┐  ┌──▼──────────┐
                                │ Virtual   │  │ Platform     │
                                │ Threads   │  │ Threads      │
                                └──────────┘  │ (traditional)│
                                              └──────────────┘
```

---

## @RunOnVirtualThread trong Quarkus

### Setup

```xml
<!-- Yêu cầu Java 21+ -->
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
</properties>
```

```properties
# Không cần config đặc biệt — chỉ cần Java 21+
# Quarkus tự phát hiện và hỗ trợ VT
```

### Cách dùng cơ bản

```java
@Path("/api/users")
@ApplicationScoped
public class UserResource {

    @Inject
    UserRepository userRepository;  // Blocking JDBC/Panache

    // ===== Chạy trên Virtual Thread =====
    @GET
    @RunOnVirtualThread  // ← Chỉ cần annotation này!
    public List<User> getAll() {
        // Code blocking bình thường — JDBC, file I/O, Thread.sleep
        // Nhưng KHÔNG chiếm Platform Thread khi block
        return userRepository.listAll();  // Blocking OK!
    }

    @GET
    @Path("/{id}")
    @RunOnVirtualThread
    public User getById(@PathParam("id") Long id) {
        User user = userRepository.findById(id);  // Blocking OK
        if (user == null) throw new NotFoundException();
        return user;
    }

    @POST
    @RunOnVirtualThread
    @Transactional
    public Response create(UserCreateDTO dto) {
        User user = new User();
        user.name = dto.name();
        user.email = dto.email();
        userRepository.persist(user);  // Blocking OK
        return Response.status(201).entity(user).build();
    }
}
```

### So sánh 3 cách viết cùng 1 endpoint

```java
// ===== Cách 1: Blocking truyền thống (Worker Thread) =====
// RESTEasy Reactive tự dispatch sang Worker pool vì return type là sync
@GET
@Path("/v1/dashboard")
public Dashboard getDashboardBlocking() {
    User user = userService.getUser(userId);        // Block worker thread
    List<Order> orders = orderService.getOrders(userId); // Block worker thread
    return new Dashboard(user, orders);
}
// Nhược điểm: Giới hạn bởi worker pool size (200 threads)

// ===== Cách 2: Reactive (Event Loop) =====
@GET
@Path("/v2/dashboard")
public Uni<Dashboard> getDashboardReactive() {
    Uni<User> userUni = userService.getUserReactive(userId);
    Uni<List<Order>> ordersUni = orderService.getOrdersReactive(userId);
    return Uni.combine().all().unis(userUni, ordersUni)
        .with((user, orders) -> new Dashboard(user, orders));
}
// Nhược điểm: Code phức tạp, debug khó, phải dùng Reactive API khắp nơi

// ===== Cách 3: Virtual Thread ← ĐƠN GIẢN NHẤT =====
@GET
@Path("/v3/dashboard")
@RunOnVirtualThread
public Dashboard getDashboardVT() {
    User user = userService.getUser(userId);         // Block VT (OK!)
    List<Order> orders = orderService.getOrders(userId); // Block VT (OK!)
    return new Dashboard(user, orders);
}
// Ưu điểm: Code đơn giản như blocking, performance như reactive
```

---

## Messaging & Scheduler với Virtual Threads

### Kafka Consumer

```java
@ApplicationScoped
public class OrderEventConsumer {

    @Inject
    OrderRepository orderRepository;

    @Inject
    NotificationService notificationService;

    // ===== Kafka consumer chạy trên Virtual Thread =====
    @Incoming("orders")
    @RunOnVirtualThread
    public void processOrder(OrderEvent event) {
        // Blocking operations đều OK trên Virtual Thread
        Order order = orderRepository.findById(event.orderId());

        // Gọi REST API bên ngoài (blocking HTTP client)
        notificationService.sendEmail(order.customerEmail(), order);

        // Ghi log audit (blocking DB write)
        auditService.log("ORDER_PROCESSED", order.id());
    }
}
```

### Scheduler

```java
@ApplicationScoped
public class ScheduledTasks {

    // ===== Scheduled task trên Virtual Thread =====
    @Scheduled(every = "1m")
    @RunOnVirtualThread
    void cleanupExpiredSessions() {
        // Blocking OK
        List<Session> expired = sessionRepo.findExpired();
        expired.forEach(s -> sessionRepo.delete(s));
        log.info("Cleaned {} expired sessions", expired.size());
    }

    @Scheduled(cron = "0 0 2 * * ?")  // 2:00 AM daily
    @RunOnVirtualThread
    void generateDailyReport() {
        // Heavy blocking I/O
        List<Order> orders = orderRepo.findByDate(LocalDate.now().minusDays(1));
        byte[] pdf = reportGenerator.generatePDF(orders);  // CPU + I/O
        emailService.send("admin@company.com", "Daily Report", pdf);
    }
}
```

---

## gRPC và WebSocket

### gRPC với Virtual Threads

```java
@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    @Inject
    UserRepository userRepository;

    @Override
    @RunOnVirtualThread  // gRPC handler trên Virtual Thread
    public void getUser(GetUserRequest request, StreamObserver<UserResponse> observer) {
        User user = userRepository.findById(request.getId());  // Blocking OK
        if (user == null) {
            observer.onError(Status.NOT_FOUND.asException());
            return;
        }
        observer.onNext(UserResponse.newBuilder()
            .setId(user.id)
            .setName(user.name)
            .build());
        observer.onCompleted();
    }
}
```

### WebSocket

```java
@WebSocket(path = "/chat/{room}")
public class ChatWebSocket {

    @Inject
    MessageRepository messageRepository;

    @OnTextMessage
    @RunOnVirtualThread  // WebSocket handler trên VT
    public String onMessage(String message, @PathParam String room) {
        // Blocking DB persist OK
        messageRepository.save(new Message(room, message));
        return "Received: " + message;
    }
}
```

---

## Pinning — Vấn đề nghiêm trọng nhất

### Pinning là gì?

**Pinning** xảy ra khi Virtual Thread **KHÔNG thể unmount** khỏi Carrier Thread khi bị block → Carrier Thread bị giữ cứng → giảm throughput.

```
Bình thường:
  VT-1 block I/O → unmount → Carrier-Thread xử lý VT-2 → tốt ✅

Pinning:
  VT-1 block I/O → KHÔNG unmount → Carrier-Thread bị giữ → xấu ❌
  VT-2 phải chờ Carrier-Thread khác → throughput giảm
```

### Khi nào xảy ra Pinning?

#### 1. synchronized block/method (NGUY HIỂM NHẤT)

```java
// ❌ SẼ BỊ PINNING — Carrier Thread bị giữ khi chờ DB
public synchronized Result processOrder(Order order) {
    return db.query("INSERT INTO orders...");  // Blocking I/O trong synchronized
}

// ✅ FIX: Dùng ReentrantLock thay synchronized
private final ReentrantLock lock = new ReentrantLock();

public Result processOrder(Order order) {
    lock.lock();
    try {
        return db.query("INSERT INTO orders...");  // VT unmount được
    } finally {
        lock.unlock();
    }
}
```

#### 2. Native method / JNI blocking

```java
// ❌ Native method không thể unmount VT
// Ví dụ: một số thư viện encryption dùng JNI
// → Phải chấp nhận hoặc wrap trong dedicated thread pool
```

### Phát hiện Pinning

```properties
# Java flag để logging pinning events
-Djdk.tracePinnedThreads=short
# hoặc
-Djdk.tracePinnedThreads=full

# Output khi pinning xảy ra:
# Thread[#25,VirtualThread-1,5,CarrierThreads] 
#     pinned while waiting on monitor
#     at com.example.MyService.processOrder(MyService.java:42)
```

```properties
# Quarkus config (application.properties)
quarkus.virtual-threads.pinned-thread-detection=true
```

### Thư viện gây Pinning phổ biến

| Thư viện | Vấn đề | Fix |
| :--- | :--- | :--- |
| **JDBC (cũ)** | Một số driver dùng `synchronized` | Update driver mới nhất |
| **Hibernate** | Session synchronization | Quarkus tự xử lý |
| **Jackson** | Một số path dùng `synchronized` | Update version mới |
| **Bouncy Castle** | JNI crypto | Cân nhắc JDK crypto |
| **Netty** | `synchronized` trong channel handlers | Không ảnh hưởng nếu dùng Quarkus |

### Quarkus giải quyết Pinning

Quarkus team đã audit và fix pinning trong hầu hết extensions:
- **quarkus-jdbc-***: JDBC drivers updated
- **quarkus-hibernate-orm**: Session handling patched
- **quarkus-rest-client**: Non-pinning HTTP layer
- **quarkus-smallrye-reactive-messaging**: Kafka consumer fixed

**Luôn cập nhật Quarkus và driver lên version mới nhất!**

---

## ThreadLocal, ScopedValue & Context

### ThreadLocal và Virtual Threads

```java
// ThreadLocal VẪN hoạt động với VT, nhưng có vấn đề:
// 1. Mỗi VT có ThreadLocal riêng → 1 triệu VT = 1 triệu copy → MEMORY
// 2. ThreadLocal được kế thừa (InheritableThreadLocal) tốn memory hơn nữa

private static final ThreadLocal<String> userId = new ThreadLocal<>();

// ❌ Không nên dùng ThreadLocal nặng với VT
// ✅ Quarkus CDI RequestScope tự động vẫn hoạt động (propagate qua VT)
```

### ScopedValue (Preview, Java 21+)

```java
// ScopedValue: Thay thế ThreadLocal cho VT
// - Immutable (không set lại được trong scope)
// - Tự clean up khi scope kết thúc
// - Kế thừa hiệu quả (child scope thấy parent)

private static final ScopedValue<String> CURRENT_USER = ScopedValue.newInstance();

public void handleRequest(String username) {
    ScopedValue.runWhere(CURRENT_USER, username, () -> {
        // Trong scope này, CURRENT_USER.get() = username
        processOrder();
    });
}

private void processOrder() {
    String user = CURRENT_USER.get();  // "john"
    // ...
}
```

### Context Propagation trong Quarkus

```java
// Quarkus TỰ ĐỘNG propagate các context qua Virtual Threads:
// ✅ CDI Request Context
// ✅ SecurityIdentity (JWT, OIDC)
// ✅ MDC (logging)
// ✅ OpenTelemetry Span

@GET
@Path("/secure-data")
@RunOnVirtualThread
@RolesAllowed("user")
public String getSecureData() {
    // SecurityContext tự động có sẵn dù ở Virtual Thread
    String user = securityIdentity.getPrincipal().getName();  // ✅ Works
    log.info("User {} accessing data", user);  // MDC propagated ✅
    return dataService.getData(user);
}
```

---

## Performance Benchmark: VT vs Reactive vs Platform

### Test setup

```
- Quarkus 3.x + Java 21
- REST API → PostgreSQL (Panache)
- wrk: 4 threads, 500 concurrent connections, 60 seconds
- Machine: 8 cores, 16GB RAM
```

### Kết quả

| Metric | Platform Thread (200 pool) | Virtual Thread | Reactive (Mutiny) |
| :--- | :--- | :--- | :--- |
| **Throughput (req/s)** | 8,000-12,000 | **18,000-25,000** | **20,000-28,000** |
| **Latency p50** | 15-30ms | **5-10ms** | **4-8ms** |
| **Latency p99** | 200-500ms | **20-50ms** | **15-40ms** |
| **Memory (RSS)** | 350-500 MB | **200-350 MB** | **150-300 MB** |
| **Max concurrent** | ~200 (pool size) | **50,000+** | **50,000+** |
| **Error rate (503)** | 5-15% (exhaustion) | **0%** | **0%** |

### Nhận xét

- **VT vs Platform**: Throughput tăng 2-3x, latency giảm 5-10x, không bao giờ 503
- **VT vs Reactive**: Performance gần bằng (Reactive nhỉnh 10-15%), nhưng VT code đơn giản hơn rất nhiều
- **Memory**: VT ít hơn Platform 30-40%, nhiều hơn Reactive 20-30%

### Kết luận Performance

```
Nếu performance là ưu tiên tuyệt đối → Reactive
Nếu cần balance giữa performance + simplicity → Virtual Threads ← RECOMMENDED
Nếu code legacy blocking + team nhỏ → Virtual Threads (dễ migrate nhất)
```

---

## Migration Guide: Blocking → Virtual Threads

### Bước 1: Upgrade Java 21+

```xml
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
</properties>
```

### Bước 2: Thêm @RunOnVirtualThread

```java
// TRƯỚC: Blocking trên Worker Thread
@GET
public List<User> getUsers() {
    return userRepo.listAll();
}

// SAU: Thêm @RunOnVirtualThread
@GET
@RunOnVirtualThread  // ← Chỉ thêm 1 dòng!
public List<User> getUsers() {
    return userRepo.listAll();  // Không đổi code
}
```

### Bước 3: Audit synchronized

```bash
# Tìm tất cả synchronized trong project
grep -rn "synchronized" src/main/java/
```

```java
// Thay synchronized bằng ReentrantLock nếu có blocking I/O bên trong
// TRƯỚC:
public synchronized void process() {
    db.query(...);  // Pinning!
}

// SAU:
private final ReentrantLock lock = new ReentrantLock();
public void process() {
    lock.lock();
    try { db.query(...); } 
    finally { lock.unlock(); }
}
```

### Bước 4: Test Pinning

```properties
# application.properties
quarkus.virtual-threads.pinned-thread-detection=true
```

```bash
# Run tests với pinning detection
./mvnw test -Djdk.tracePinnedThreads=short
```

---

## Migration Guide: Reactive → Virtual Threads

### Khi nào chuyển?

| Nên chuyển | Không nên chuyển |
| :--- | :--- |
| Team khó maintain code Reactive | Đang dùng streaming (SSE, Multi) |
| Endpoint chủ yếu request-response | Cần backpressure (Kafka consumer) |
| Muốn simplify debugging | Performance tối ưu (Reactive nhỉnh) |
| Legacy JDBC/imperative libraries | Đã hoạt động ổn định, không cần đổi |

### Ví dụ migration

```java
// ===== TRƯỚC: Reactive =====
@GET
@Path("/{id}")
public Uni<Response> getUser(@PathParam("id") Long id) {
    return userRepo.findById(id)
        .onItem().ifNull().failWith(() -> new NotFoundException("Not found"))
        .onItem().ifNotNull().transform(user -> {
            UserDTO dto = mapper.toDTO(user);
            return Response.ok(dto).build();
        });
}

// ===== SAU: Virtual Thread =====
@GET
@Path("/{id}")
@RunOnVirtualThread
public Response getUser(@PathParam("id") Long id) {
    User user = userRepo.findById(id);  // Blocking JDBC
    if (user == null) throw new NotFoundException("Not found");
    UserDTO dto = mapper.toDTO(user);
    return Response.ok(dto).build();
}
```

```java
// ===== TRƯỚC: Combine Unis (parallel calls) =====
@GET
@Path("/dashboard")
public Uni<Dashboard> getDashboard() {
    return Uni.combine().all()
        .unis(userService.getUser(id), orderService.getOrders(id))
        .with((user, orders) -> new Dashboard(user, orders));
}

// ===== SAU: StructuredTaskScope (parallel calls trên VT) =====
@GET
@Path("/dashboard")
@RunOnVirtualThread
public Dashboard getDashboard() {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var userTask = scope.fork(() -> userService.getUser(id));
        var ordersTask = scope.fork(() -> orderService.getOrders(id));
        scope.join();
        scope.throwIfFailed();
        return new Dashboard(userTask.resultNow(), ordersTask.resultNow());
    }
}
```

### Các endpoint NÊN giữ Reactive

```java
// ===== SSE streaming → GIỮ REACTIVE =====
@GET
@Path("/stream")
@Produces(MediaType.SERVER_SENT_EVENTS)
@RestStreamElementType(MediaType.APPLICATION_JSON)
public Multi<StockPrice> streamPrices() {
    return Multi.createFrom().ticks().every(Duration.ofSeconds(1))
        .map(tick -> stockService.getCurrentPrice());
}

// ===== Kafka producer with backpressure → GIỮ REACTIVE =====
@Outgoing("prices")
public Multi<Message<StockPrice>> publishPrices() {
    return Multi.createFrom().ticks().every(Duration.ofMillis(100))
        .map(tick -> Message.of(getPrice()));
}
```

---

## Best Practices & Pitfalls

### ✅ DO

```java
// 1. Dùng @RunOnVirtualThread cho I/O-bound endpoints
@GET @RunOnVirtualThread
public List<Product> search(@QueryParam("q") String query) {
    return productRepo.search(query);  // Blocking DB OK
}

// 2. Dùng ReentrantLock thay synchronized khi có blocking I/O
private final ReentrantLock lock = new ReentrantLock();

// 3. Dùng try-with-resources cho StructuredTaskScope
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // parallel tasks
}

// 4. Bật pinning detection trong dev/test
// quarkus.virtual-threads.pinned-thread-detection=true

// 5. Giữ Reactive cho streaming use cases
@Produces(MediaType.SERVER_SENT_EVENTS)
public Multi<Event> stream() { ... }
```

### ❌ DON'T

```java
// 1. KHÔNG dùng synchronized với blocking I/O
// ❌
public synchronized Data getData() {
    return db.query(...);  // PINNING!
}

// 2. KHÔNG dùng VT cho CPU-bound tasks (không có lợi)
// ❌ Tính toán nặng không block I/O → VT không giúp gì
@RunOnVirtualThread
public BigDecimal calculatePi(int precision) {
    // Pure CPU computation → Platform Thread tốt hơn
}

// 3. KHÔNG pool Virtual Threads (tạo mới cho mỗi task)
// ❌
ExecutorService pool = Executors.newFixedThreadPool(100);
// ✅
ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor();

// 4. KHÔNG dùng ThreadLocal nặng
// ❌ Mỗi VT copy ThreadLocal → 1 triệu VT = OOM
private static final ThreadLocal<HeavyObject> cache = 
    ThreadLocal.withInitial(() -> new HeavyObject(/*10MB*/));

// 5. KHÔNG trộn @RunOnVirtualThread với Uni return type
// ❌ VT + Reactive = overhead không cần thiết
@RunOnVirtualThread
public Uni<String> getData() { ... }  // Chọn 1 trong 2!
```

---

## Native Image & Virtual Threads

### Hỗ trợ

- **GraalVM 23+**: Hỗ trợ Virtual Threads trong Native Image
- **Mandrel 23+**: Tương tự
- **Quarkus 3.7+**: Tích hợp VT + Native

```properties
# Không cần config đặc biệt — Quarkus tự detect
# Chỉ cần Java 21+ và GraalVM 23+
```

### Lưu ý

- `StructuredTaskScope` vẫn là **Preview** → có thể cần flag `--enable-preview` khi build native
- Stack traces trong native image VT có thể ngắn hơn JVM mode
- Pinning detection (`-Djdk.tracePinnedThreads`) hoạt động tốt trong native

---

## Câu hỏi thường gặp

### Q1: Virtual Thread có thay thế Reactive hoàn toàn không?

**Không hoàn toàn.** VT thay thế reactive cho **request-response** (REST API, gRPC). Nhưng Reactive vẫn cần cho:
- **Streaming** (SSE, Kafka Multi)
- **Backpressure** (consumer chậm hơn producer)
- **Complex async coordination** (merge, debounce, window)

→ **Hybrid** là cách tiếp cận tốt nhất: VT cho endpoints, Reactive cho streams.

### Q2: VT có ảnh hưởng GC không?

Virtual Threads rất nhẹ (~KB), nhưng:
- Số lượng object tạm (request DTO, response) vẫn như cũ → GC giống nhau
- Stack frames của VT nằm trên heap (không phải native stack) → GC phải scan
- **Thực tế**: Ít memory hơn platform threads vì stack nhỏ hơn

### Q3: Database connection pool có cần thay đổi?

**Có!** Đây là điểm quan trọng:

```properties
# TRƯỚC (Platform Threads): pool size ≈ thread count
quarkus.datasource.jdbc.max-size=20  # 20 threads → 20 connections

# SAU (Virtual Threads): pool size << VT count
# 10,000 VT nhưng chỉ cần 20-50 DB connections
# Vì VT unmount khi chờ connection → không block carrier
quarkus.datasource.jdbc.max-size=50  # 50 connections cho hàng nghìn VT
```

VT giải quyết "thread exhaustion" nhưng **KHÔNG** giải quyết "connection exhaustion". Connection pool vẫn là bottleneck → size hợp lý.

### Q4: @RunOnVirtualThread có hoạt động với @Transactional?

**Có.** Quarkus propagate transaction context qua Virtual Threads:

```java
@POST
@RunOnVirtualThread
@Transactional  // ✅ Hoạt động bình thường
public Response createOrder(OrderDTO dto) {
    orderRepo.persist(dto.toEntity());
    paymentService.charge(dto.amount());  // Cùng transaction
    return Response.status(201).build();
}
```

### Q5: Performance overhead của VT so với Reactive?

- **VT overhead**: ~1-5μs per mount/unmount (rất nhỏ)
- **Reactive overhead**: ~0.1-1μs per operator callback
- **Thực tế**: Reactive nhanh hơn VT khoảng 10-15% cho throughput thuần
- **Nhưng**: VT code đơn giản hơn, debug dễ hơn, onboarding nhanh hơn

---

## Tổng kết

- **Virtual Threads**: Lightweight threads (Java 21+) — viết code blocking nhưng performance như reactive
- **@RunOnVirtualThread**: Annotation duy nhất cần thêm trong Quarkus
- **Pinning**: Vấn đề lớn nhất — tránh `synchronized` với blocking I/O, dùng `ReentrantLock`
- **Hybrid approach**: VT cho request-response, Reactive cho streaming/backpressure
- **Migration**: Từ blocking → VT: thêm annotation. Từ Reactive → VT: viết lại imperative
- **Performance**: Gần bằng Reactive, vượt trội Platform Threads
- **Native Image**: Hỗ trợ từ GraalVM 23+ / Quarkus 3.7+
