# Reactive Programming - Từ Zero đến Master Quarkus

## Mục lục
1. [Tại sao cần Reactive?](#tại-sao-cần-reactive)
2. [Kiến trúc Event Loop (Vert.x)](#kiến-trúc-event-loop-vertx)
3. [Mutiny - Reactive Library của Quarkus](#mutiny---reactive-library-của-quarkus)
4. [Uni - Single Value](#uni---single-value)
5. [Multi - Multiple Values](#multi---multiple-values)
6. [Error Handling chi tiết](#error-handling-chi-tiết)
7. [Combining & Coordinating](#combining--coordinating)
8. [Threading: emitOn vs runSubscriptionOn](#threading-emiton-vs-runsubscriptionon)
9. [Context Propagation](#context-propagation)
10. [Reactive REST APIs](#reactive-rest-apis)
11. [Reactive Messaging (Kafka, AMQP)](#reactive-messaging-kafka-amqp)
12. [Backpressure Strategies](#backpressure-strategies)
13. [Bridging: Blocking ↔ Reactive](#bridging-blocking--reactive)
14. [Vert.x Integration](#vertx-integration)
15. [Common Pitfalls & Anti-patterns](#common-pitfalls--anti-patterns)
16. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tại sao cần Reactive?

### Vấn đề của Blocking (Imperative)

```
Request đến → Thread bị giữ (blocked) trong khi chờ:
  - Database query (50ms)
  - HTTP call to service B (200ms)
  - File I/O (30ms)

→ Thread không làm gì cả, chỉ CHỜ
→ 200 concurrent requests = 200 threads bị block
→ Thread pool exhaustion → 503 Service Unavailable
```

### Giải pháp Reactive (Non-blocking)

```
Request đến → Thread gửi query đến DB → GIẢI PHÓNG THREAD → làm việc khác
DB trả kết quả → Event Loop pick up → Xử lý tiếp → Trả response

→ 1-2 Event Loop threads xử lý HÀNG NGHÌN concurrent connections
→ Không cần nhiều threads → Ít memory
→ Throughput cao hơn nhiều lần
```

Cơ chế non-blocking: Mỗi IO thread không bị “giữ chặt” bởi một request. Khi một request cần chờ IO (ví dụ đọc DB, gọi API), thread sẽ “nhả ra” và tiếp tục xử lý request khác. Khi dữ liệu sẵn sàng, Event Loop sẽ kích hoạt callback để tiếp tục xử lý. Nhờ vậy, một thread có thể phục vụ rất nhiều request song song.

### So sánh Performance

| Metric | Blocking (200 threads) | Reactive (2 event loops) |
| :--- | :--- | :--- |
| **Max concurrent connections** | ~200 | ~10,000+ |
| **Memory per connection** | ~1MB (thread stack) | ~KB (event state) |
| **Context switch overhead** | Cao | Gần như không |
| **CPU utilization** | Thấp (threads idle) | Cao (luôn bận) |
| **Phù hợp** | CPU-bound tasks | I/O-bound tasks |

### Khi nào KHÔNG nên dùng Reactive?

1. **CPU-bound tasks**: Tính toán nặng, encryption → blocking phù hợp hơn
2. **Simple CRUD**: Ít concurrent users → imperative đơn giản hơn
3. **Team chưa quen**: Learning curve cao → bug nhiều hơn
4. **Legacy integration**: Thư viện chỉ hỗ trợ blocking

---

## Kiến trúc Event Loop (Vert.x)

### Quarkus & Vert.x

Quarkus được xây dựng trên **Eclipse Vert.x** - một toolkit reactive, event-driven.

```
┌─────────────────────────────────────────────┐
│              Quarkus Application             │
├─────────────────────────────────────────────┤
│  RESTEasy Reactive │ Hibernate Reactive │ ...│
├─────────────────────────────────────────────┤
│              Mutiny (Reactive API)           │
├─────────────────────────────────────────────┤
│              Eclipse Vert.x                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Event Loop│  │Event Loop│  │  Worker   │  │
│  │ Thread 1 │  │ Thread 2 │  │  Pool     │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│              Netty (Network I/O)             │
└─────────────────────────────────────────────┘
```

### Hai loại Thread

#### 1. Event Loop Thread (IO Thread)
- Số lượng: `2 × CPU cores` (mặc định)
- **KHÔNG BAO GIỜ ĐƯỢC BLOCK** (Golden Rule)
- Xử lý: Network I/O, parsing, routing, reactive pipeline
- Nếu block > vài ms → `BlockingOperationException`

#### 2. Worker Thread Pool
- Số lượng: 20-256 (configurable)
- Xử lý: Blocking operations (JDBC, File I/O, CPU-heavy)
- Dùng khi: `@Blocking` annotation hoặc `emitOn(worker pool)`

```properties
# Cấu hình
quarkus.vertx.event-loops-pool-size=4        # Event loop threads
quarkus.vertx.worker-pool-size=50            # Worker pool threads

# Cảnh báo blocking trên event loop
quarkus.vertx.max-event-loop-execute-time=2s
quarkus.vertx.warning-exception-time=2s
```

### Smart Dispatching (RESTEasy Reactive)

```java
@Path("/api")
public class SmartResource {

    // ===== Chạy trên Event Loop (non-blocking) =====
    // Vì trả về Uni → RESTEasy Reactive biết đây là reactive code
    @GET
    @Path("/reactive")
    public Uni<String> reactive() {
        return Uni.createFrom().item("Hello from Event Loop!");
    }

    // ===== Tự động chuyển sang Worker Thread (blocking) =====
    // Vì trả về String (sync) → RESTEasy tự dispatch sang worker
    @GET
    @Path("/blocking")
    public String blocking() {
        // An toàn: đã ở worker thread
        return someJdbcCall();
    }

    // ===== Ép chạy trên Worker Thread dù trả về Uni =====
    @GET
    @Path("/force-blocking")
    @Blocking  // Override: chạy trên worker thread
    public Uni<String> forceBlocking() {
        return callBlockingLib();
    }

    // ===== Ép chạy trên Event Loop dù trả về sync =====
    @GET
    @Path("/force-non-blocking")
    @NonBlocking  // Override: chạy trên event loop
    public String forceNonBlocking() {
        // CẢNH BÁO: Nếu code block ở đây → BlockingOperationException
        return "fast response";
    }
}
```

---

## Mutiny - Reactive Library của Quarkus

### Tại sao Mutiny thay vì Reactor/RxJava?

| Tiêu chí | Mutiny | Project Reactor | RxJava |
| :--- | :--- | :--- | :--- |
| **API Style** | Event-driven, navigable | Operator-centric | Operator-centric |
| **Learning curve** | Thấp | Cao | Cao |
| **Quarkus integration** | Native, built-in | Cần adapter | Cần adapter |
| **Operators** | Ít hơn, đủ dùng | Rất nhiều | Rất nhiều |
| **Type** | `Uni<T>`, `Multi<T>` | `Mono<T>`, `Flux<T>` | `Single<T>`, `Observable<T>` |

### Hai kiểu Reactive

| | Uni&lt;T&gt; | Multi&lt;T&gt; |
| :--- | :--- | :--- |
| **Phát ra** | 0 hoặc 1 item | 0 đến N items |
| **Tương đương** | `Mono` (Reactor), `CompletableFuture` | `Flux` (Reactor), `Stream` |
| **Use case** | DB findById, HTTP call, single result | DB findAll, SSE stream, Kafka messages |
| **Completion** | Sau khi phát 1 item hoặc failure | Sau khi phát xong tất cả items |

### Khái niệm Lazy

```java
// Mutiny là LAZY - không thực thi cho đến khi có subscriber
Uni<String> uni = Uni.createFrom().item(() -> {
    System.out.println("Computing...");  // CHƯA IN
    return "Hello";
});
// Chưa có gì xảy ra!

// Subscribe → Bắt đầu thực thi
uni.subscribe().with(
    item -> System.out.println("Got: " + item),
    failure -> System.out.println("Error: " + failure)
);
// Output: "Computing..." rồi "Got: Hello"

// Trong REST endpoint, Quarkus tự subscribe cho bạn:
@GET
public Uni<String> hello() {
    return Uni.createFrom().item("Hello");  // Quarkus subscribe khi client request
}
```

---

## Uni - Single Value

### Tạo Uni

```java
// ===== Tạo từ giá trị có sẵn =====
Uni<String> u1 = Uni.createFrom().item("Hello");
Uni<String> u2 = Uni.createFrom().item(() -> expensiveComputation());  // Lazy

// ===== Tạo Uni rỗng (null item) =====
Uni<String> empty = Uni.createFrom().nullItem();

// ===== Tạo Uni failure =====
Uni<String> failure = Uni.createFrom().failure(new RuntimeException("Boom"));
Uni<String> failure2 = Uni.createFrom().failure(() -> new RuntimeException("Lazy boom"));

// ===== Tạo từ CompletionStage/CompletableFuture =====
CompletableFuture<String> future = callAsyncApi();
Uni<String> fromFuture = Uni.createFrom().completionStage(future);

// ===== Tạo từ Emitter (callback-based API) =====
Uni<String> fromCallback = Uni.createFrom().emitter(emitter -> {
    // Gọi legacy callback API
    legacyApi.call(new Callback() {
        @Override
        public void onSuccess(String result) {
            emitter.complete(result);
        }
        @Override
        public void onError(Exception e) {
            emitter.fail(e);
        }
    });
});

// ===== Tạo void Uni (chỉ cần biết hoàn thành) =====
Uni<Void> voidUni = Uni.createFrom().voidItem();
```

### Transform (map / flatMap)

```java
// ===== map: Transform giá trị (synchronous) =====
Uni<String> name = getUserById(1L).map(User::getName);
Uni<String> upper = name.map(String::toUpperCase);
// User → "john" → "JOHN"

// ===== flatMap: Transform thành Uni khác (asynchronous chaining) =====
Uni<Order> order = getUserById(1L)
    .flatMap(user -> getLatestOrder(user.getId()));
// getUserById → User → getLatestOrder → Order

// ===== chain: Alias cho flatMap (Quarkus convention) =====
Uni<Order> order2 = getUserById(1L)
    .chain(user -> getLatestOrder(user.getId()));

// ===== replaceWith: Bỏ qua giá trị hiện tại, thay bằng giá trị mới =====
Uni<String> msg = saveUser(user)
    .replaceWith("User saved successfully");

// ===== replaceWithVoid: Bỏ qua giá trị, trả void =====
Uni<Void> done = saveUser(user).replaceWithVoid();

// ===== invoke: Side effect (logging, metrics) nhưng giữ nguyên giá trị =====
Uni<User> logged = getUserById(1L)
    .invoke(user -> log.info("Found user: {}", user.getName()));
// invoke KHÔNG thay đổi item trong pipeline
```

### Null Handling

```java
Uni<User> maybeNull = getUserById(999L);  // Có thể trả về null

// ===== Kiểm tra null =====
Uni<User> safe = maybeNull
    .onItem().ifNull().failWith(() -> new NotFoundException("User not found"));

// ===== Default value nếu null =====
Uni<User> withDefault = maybeNull
    .onItem().ifNull().switchTo(() -> Uni.createFrom().item(User.defaultUser()));

// ===== Transform chỉ khi non-null =====
Uni<String> name = maybeNull
    .onItem().ifNotNull().transform(User::getName);
```

### Timeout

```java
Uni<String> withTimeout = callSlowService()
    .ifNoItem().after(Duration.ofSeconds(5))
    .fail();  // Throw TimeoutException sau 5 giây

Uni<String> withFallback = callSlowService()
    .ifNoItem().after(Duration.ofSeconds(5))
    .recoverWithItem("Default value");  // Trả default thay vì exception

Uni<String> withRetryAndTimeout = callSlowService()
    .ifNoItem().after(Duration.ofSeconds(2)).retry().atMost(3)
    .ifNoItem().after(Duration.ofSeconds(10)).fail();
```

### Delay

```java
// Delay trước khi emit item
Uni<String> delayed = Uni.createFrom().item("Hello")
    .onItem().delayIt().by(Duration.ofSeconds(1));

// Delay sau failure (backoff trước retry)
Uni<String> retryWithDelay = callService()
    .onFailure().retry()
    .withBackOff(Duration.ofMillis(100), Duration.ofSeconds(2))
    .atMost(5);
```

---

## Multi - Multiple Values

### Tạo Multi

```java
// ===== Từ items có sẵn =====
Multi<String> m1 = Multi.createFrom().items("a", "b", "c");
Multi<Integer> m2 = Multi.createFrom().range(1, 10);  // 1..9
Multi<String> m3 = Multi.createFrom().iterable(myList);

// ===== Empty & Failure =====
Multi<String> empty = Multi.createFrom().empty();
Multi<String> fail = Multi.createFrom().failure(new RuntimeException("Boom"));

// ===== Từ Emitter (push-based) =====
Multi<String> stream = Multi.createFrom().emitter(emitter -> {
    emitter.emit("item1");
    emitter.emit("item2");
    emitter.emit("item3");
    emitter.complete();  // Kết thúc stream
});

// ===== Periodic (định kỳ) =====
Multi<Long> ticks = Multi.createFrom().ticks().every(Duration.ofSeconds(1));
// Phát 0, 1, 2, 3... mỗi giây

// ===== Từ generator (pull-based) =====
Multi<Integer> generated = Multi.createFrom().generator(
    () -> 0,  // initial state
    (state, emitter) -> {
        emitter.emit(state);
        if (state >= 100) emitter.complete();
        return state + 1;  // next state
    }
);
```

### Transform

```java
Multi<String> names = Multi.createFrom().items("john", "jane", "bob");

// ===== map =====
Multi<String> upper = names.map(String::toUpperCase);
// "JOHN", "JANE", "BOB"

// ===== filter =====
Multi<String> jNames = names.filter(n -> n.startsWith("j"));
// "john", "jane"

// ===== flatMap (1 → N, concurrent) =====
Multi<Order> allOrders = getUsers()
    .onItem().transformToMultiAndMerge(user -> getOrders(user.getId()));
// Mỗi user → N orders → Merge tất cả vào 1 stream

// ===== concatMap (1 → N, sequential) =====
Multi<Order> allOrdersSequential = getUsers()
    .onItem().transformToMultiAndConcatenate(user -> getOrders(user.getId()));
// Giống flatMap nhưng giữ thứ tự

// ===== distinct =====
Multi<String> unique = names.select().distinct();

// ===== take / skip =====
Multi<String> first2 = names.select().first(2);    // "john", "jane"
Multi<String> skip1 = names.skip().first(1);        // "jane", "bob"

// ===== peek (side effect) =====
Multi<String> logged = names
    .invoke(name -> log.info("Processing: {}", name));
```

### Collect (Multi → Uni)

```java
Multi<String> names = Multi.createFrom().items("john", "jane", "bob");

// ===== Collect to List =====
Uni<List<String>> list = names.collect().asList();

// ===== Collect to Set =====
Uni<Set<String>> set = names.collect().asSet();

// ===== Collect to Map =====
Uni<Map<String, Integer>> map = names.collect()
    .asMap(name -> name, name -> name.length());

// ===== Collect with Collector =====
Uni<String> joined = names.collect()
    .with(Collectors.joining(", "));  // "john, jane, bob"

// ===== Count =====
Uni<Long> count = names.collect().with(Collectors.counting());

// ===== First item =====
Uni<String> first = names.collect().first();

// ===== Last item =====
Uni<String> last = names.collect().last();
```

### Grouping & Windowing

```java
// ===== Group by size =====
Multi<List<String>> batches = names.group().intoLists().of(10);
// Nhóm 10 items thành 1 List, phát Multi<List<String>>

// ===== Group by duration =====
Multi<List<String>> timedBatches = names.group().intoLists()
    .every(Duration.ofSeconds(5));
// Gom tất cả items trong 5 giây thành 1 List
```

---

## Error Handling chi tiết

### Uni Error Handling

```java
// ===== 1. Recover with item (trả default) =====
Uni<String> safe = callService()
    .onFailure().recoverWithItem("default value");

// ===== 2. Recover with Uni (fallback service) =====
Uni<String> withFallback = callPrimaryService()
    .onFailure().recoverWithUni(() -> callBackupService());

// ===== 3. Retry =====
Uni<String> retried = callService()
    .onFailure().retry().atMost(3);  // Retry tối đa 3 lần

// ===== 4. Retry with backoff (exponential) =====
Uni<String> retriedWithBackoff = callService()
    .onFailure().retry()
    .withBackOff(Duration.ofMillis(100), Duration.ofSeconds(5))
    .withJitter(0.2)      // Random jitter ±20%
    .atMost(5)             // Tối đa 5 lần
    .expireIn(30_000L);    // Hết hạn sau 30 giây

// ===== 5. Transform error =====
Uni<String> mapped = callService()
    .onFailure(IOException.class)
    .transform(e -> new ServiceUnavailableException("Service down", e));

// ===== 6. Chỉ xử lý loại exception cụ thể =====
Uni<String> specific = callService()
    .onFailure(TimeoutException.class).retry().atMost(3)
    .onFailure(AuthenticationException.class).recoverWithItem("anonymous")
    .onFailure().transform(e -> new InternalServerError(e));

// ===== 7. Invoke (side effect on failure) =====
Uni<String> logged = callService()
    .onFailure().invoke(e -> log.error("Service failed", e))
    .onFailure().retry().atMost(3);
```

### Multi Error Handling

```java
// ===== 1. Recover with completion (dừng stream khi lỗi) =====
Multi<String> safe = getItems()
    .onFailure().recoverWithCompletion();  // Dừng stream, không phát thêm

// ===== 2. Recover with items (thay bằng items khác) =====
Multi<String> withDefault = getItems()
    .onFailure().recoverWithMulti(Multi.createFrom().items("fallback1", "fallback2"));

// ===== 3. Retry =====
Multi<String> retried = getItems()
    .onFailure().retry().atMost(3);

// ===== 4. Per-item error handling =====
Multi<Result> results = getIds()
    .onItem().transformToUniAndMerge(id ->
        processItem(id)
            .onFailure().recoverWithItem(new Result(id, "FAILED"))
    );
// Mỗi item lỗi → recover riêng, không ảnh hưởng items khác
```

---

## Combining & Coordinating

### Combine Uni (Parallel Execution)

```java
// ===== Chạy song song 2 Uni, chờ cả 2 hoàn thành =====
Uni<String> nameUni = getUserName(1L);
Uni<List<Order>> ordersUni = getUserOrders(1L);

// Cách 1: Tuple
Uni<Tuple2<String, List<Order>>> combined = Uni.combine()
    .all().unis(nameUni, ordersUni)
    .asTuple();

combined.subscribe().with(tuple -> {
    String name = tuple.getItem1();
    List<Order> orders = tuple.getItem2();
});

// Cách 2: Custom combinator (khuyến nghị)
Uni<UserDashboard> dashboard = Uni.combine()
    .all().unis(nameUni, ordersUni)
    .with((name, orders) -> new UserDashboard(name, orders));

// ===== Chạy song song N Uni =====
Uni<String> u1 = callServiceA();
Uni<Integer> u2 = callServiceB();
Uni<Boolean> u3 = callServiceC();

Uni<Tuple3<String, Integer, Boolean>> all = Uni.combine()
    .all().unis(u1, u2, u3)
    .asTuple();
// Hỗ trợ đến Tuple9 (9 Uni song song)

// ===== Chạy song song List<Uni> =====
List<Uni<String>> unis = ids.stream()
    .map(id -> callService(id))
    .collect(Collectors.toList());

Uni<List<String>> allResults = Uni.combine().all().unis(unis)
    .with(results -> results.stream()
        .map(r -> (String) r)
        .collect(Collectors.toList()));
```

### First Success (Race)

```java
// ===== Lấy kết quả từ Uni nào hoàn thành trước =====
Uni<String> fastest = Uni.combine()
    .any().of(callServiceA(), callServiceB(), callServiceC());
// Trả về kết quả đầu tiên, cancel các Uni còn lại
```

### Merge Multi (Combine streams)

```java
// ===== Merge: Gộp nhiều Multi thành 1, items interleaved =====
Multi<String> merged = Multi.createBy().merging()
    .streams(getStream1(), getStream2(), getStream3());
// Items đến từ stream nào trước phát trước (interleaved)

// ===== Concatenate: Gộp tuần tự =====
Multi<String> concatenated = Multi.createBy().concatenating()
    .streams(getStream1(), getStream2(), getStream3());
// Phát hết stream1, rồi stream2, rồi stream3
```

---

## Threading: emitOn vs runSubscriptionOn

### emitOn - Chuyển thread DOWNSTREAM

```java
// emitOn: Tất cả operators SAU emitOn chạy trên thread pool chỉ định
Uni<String> result = Uni.createFrom().item("data")        // Event Loop
    .emitOn(Infrastructure.getDefaultWorkerPool())          // ← Switch point
    .map(this::heavyComputation)                            // Worker Thread
    .map(this::anotherHeavyTask);                           // Worker Thread

// Use case: Bạn có pipeline reactive nhưng 1 bước cần blocking
```

### runSubscriptionOn - Chuyển thread UPSTREAM

```java
// runSubscriptionOn: Subscription (và upstream) chạy trên thread pool chỉ định
Uni<String> result = Uni.createFrom().item(() -> {
        return blockingDatabaseCall();  // ← Chạy trên Worker Thread
    })
    .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
    .map(this::processResult);  // Vẫn trên Worker Thread

// Use case: Source (nguồn dữ liệu) là blocking
```

### So sánh

```
Pipeline:  [Source] → [map A] → [emitOn(worker)] → [map B] → [map C]
Thread:    Event Loop  Event Loop    ↓ switch       Worker    Worker

Pipeline:  [Source] → [map A] → [map B]
           runSubscriptionOn(worker)
Thread:    Worker      Worker    Worker    (toàn bộ pipeline trên worker)
```

| | emitOn | runSubscriptionOn |
| :--- | :--- | :--- |
| **Ảnh hưởng** | Downstream (phía sau) | Upstream (phía trước, subscription) |
| **Use case** | 1 bước cần blocking giữa pipeline | Source là blocking |
| **Vị trí đặt** | Trước bước blocking | Trên Uni/Multi |

### Custom Thread Pool

```java
// Tạo custom executor
@ApplicationScoped
public class CustomExecutors {

    @Produces
    @Named("db-pool")
    public ExecutorService dbPool() {
        return Executors.newFixedThreadPool(10, 
            new ThreadFactoryBuilder().setNameFormat("db-pool-%d").build());
    }
}

// Sử dụng
@Inject
@Named("db-pool")
ExecutorService dbPool;

Uni<String> result = Uni.createFrom().item(() -> blockingDbCall())
    .runSubscriptionOn(dbPool);
```

---

## Context Propagation

### Vấn đề

```java
// Khi switch thread, context (security, transaction, MDC) có thể bị mất
@GET
public Uni<String> getSecureData() {
    return Uni.createFrom().item(() -> {
            // Đang ở Worker Thread
            String user = securityContext.getUserPrincipal().getName();
            // NullPointerException nếu context không được propagate!
            return fetchData(user);
        })
        .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
}
```

### Giải pháp: SmallRye Context Propagation

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-context-propagation</artifactId>
</dependency>
```

```java
// Quarkus TỰ ĐỘNG propagate context khi dùng Mutiny API
// Các context được propagate:
// 1. CDI Request Context
// 2. Security Context (JWT, OIDC)
// 3. Transaction Context
// 4. MDC (Mapped Diagnostic Context for logging)
// 5. OpenTelemetry Span Context

// KHÔNG CẦN code gì thêm!
@GET
public Uni<String> getSecureData() {
    return Uni.createFrom().item(() -> {
            // SecurityContext tự động có sẵn dù ở thread khác
            String user = securityContext.getUserPrincipal().getName();
            return fetchData(user);
        })
        .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
}
```

### Manual Context Propagation

```java
// Khi dùng CompletableFuture hoặc raw thread
@Inject
ManagedExecutor managedExecutor;  // CDI-aware executor

CompletableFuture<String> future = managedExecutor.supplyAsync(() -> {
    // Context được propagate tự động
    return securityContext.getUserPrincipal().getName();
});
```

---

## Reactive REST APIs

### Full CRUD Reactive

```java
@Path("/products")
@ApplicationScoped
public class ProductResource {

    @Inject
    ProductRepository productRepo;

    // ===== GET all (Multi → streamed response) =====
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Multi<Product> listAll() {
        return productRepo.streamAll();
    }

    // ===== GET by ID =====
    @GET
    @Path("/{id}")
    public Uni<Response> getById(@PathParam("id") Long id) {
        return productRepo.findById(id)
            .onItem().ifNotNull().transform(p -> Response.ok(p).build())
            .onItem().ifNull().continueWith(() ->
                Response.status(Response.Status.NOT_FOUND).build());
    }

    // ===== POST (create) =====
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Uni<Response> create(@Valid ProductCreateDTO dto) {
        Product product = dto.toEntity();
        return Panache.withTransaction(product::persist)
            .replaceWith(() -> Response.status(Response.Status.CREATED)
                .entity(product).build());
    }

    // ===== PUT (update) =====
    @PUT
    @Path("/{id}")
    public Uni<Response> update(@PathParam("id") Long id, ProductUpdateDTO dto) {
        return Panache.withTransaction(() ->
            productRepo.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Not found: " + id))
                .invoke(existing -> {
                    existing.name = dto.name();
                    existing.price = dto.price();
                })
        ).map(updated -> Response.ok(updated).build());
    }

    // ===== DELETE =====
    @DELETE
    @Path("/{id}")
    public Uni<Response> delete(@PathParam("id") Long id) {
        return Panache.withTransaction(() -> productRepo.deleteById(id))
            .map(deleted -> deleted
                ? Response.noContent().build()
                : Response.status(Response.Status.NOT_FOUND).build());
    }

    // ===== Search with pagination =====
    @GET
    @Path("/search")
    public Uni<PageResponse<Product>> search(
            @QueryParam("keyword") String keyword,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {

        PanacheQuery<Product> query = productRepo.find(
            "name LIKE ?1", Sort.by("name"), "%" + keyword + "%");

        Uni<List<Product>> items = query.page(Page.of(page, size)).list();
        Uni<Long> total = query.count();

        return Uni.combine().all().unis(items, total)
            .with((list, count) -> new PageResponse<>(list, page, size, count));
    }
}
```

### Server-Sent Events (SSE)

```java
@Path("/events")
@ApplicationScoped
public class EventResource {

    // SSE Stream: Client nhận events real-time
    @GET
    @Produces(MediaType.SERVER_SENT_EVENTS)
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    public Multi<StockPrice> streamPrices() {
        return Multi.createFrom().ticks().every(Duration.ofSeconds(1))
            .map(tick -> new StockPrice("AAPL", randomPrice()));
    }

    // SSE với filter
    @GET
    @Path("/{symbol}")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    public Multi<StockPrice> streamBySymbol(@PathParam("symbol") String symbol) {
        return stockService.stream()
            .filter(price -> price.symbol().equals(symbol));
    }
}
```

---

## Reactive Messaging (Kafka, AMQP)

### Kafka Producer & Consumer

```java
// ===== Producer: Gửi message đến Kafka =====
@ApplicationScoped
public class OrderService {

    @Inject
    @Channel("order-events")  // Tên channel (config trong application.properties)
    Emitter<OrderEvent> orderEmitter;

    public Uni<Order> createOrder(Order order) {
        return Panache.withTransaction(order::persist)
            .invoke(() -> {
                OrderEvent event = new OrderEvent(order.id, "CREATED", Instant.now());
                orderEmitter.send(event);
            });
    }
}

// ===== Consumer: Nhận message từ Kafka =====
@ApplicationScoped
public class OrderEventConsumer {

    // Cách 1: Simple consumer
    @Incoming("order-events-in")
    public void process(OrderEvent event) {
        log.info("Received order event: {}", event);
        // Xử lý event
    }

    // Cách 2: Reactive consumer (trả về Uni)
    @Incoming("order-events-in")
    public Uni<Void> processReactive(OrderEvent event) {
        return notificationService.sendNotification(event)
            .replaceWithVoid();
    }

    // Cách 3: Processor (nhận từ 1 channel, gửi sang channel khác)
    @Incoming("raw-orders")
    @Outgoing("processed-orders")
    public OrderEvent enrich(OrderEvent event) {
        event.setProcessedAt(Instant.now());
        return event;
    }

    // Cách 4: Stream processor
    @Incoming("raw-events")
    @Outgoing("filtered-events")
    public Multi<OrderEvent> filterStream(Multi<OrderEvent> events) {
        return events
            .filter(e -> e.getAmount().compareTo(BigDecimal.TEN) > 0)
            .map(e -> {
                e.setFiltered(true);
                return e;
            });
    }
}
```

### Kafka Configuration

```properties
# ===== Kafka Connector =====
# Outgoing channel
mp.messaging.outgoing.order-events.connector=smallrye-kafka
mp.messaging.outgoing.order-events.topic=orders
mp.messaging.outgoing.order-events.value.serializer=io.quarkus.kafka.client.serialization.ObjectMapperSerializer

# Incoming channel
mp.messaging.incoming.order-events-in.connector=smallrye-kafka
mp.messaging.incoming.order-events-in.topic=orders
mp.messaging.incoming.order-events-in.group.id=order-processor
mp.messaging.incoming.order-events-in.value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
mp.messaging.incoming.order-events-in.auto.offset.reset=earliest

# ===== Dev Services (auto-start Kafka cho dev/test) =====
quarkus.kafka.devservices.enabled=true
```

---

## Backpressure Strategies

### Backpressure là gì?

```
Producer (nhanh) → → → → → Consumer (chậm)
                    ↑
            Tràn! Làm gì đây?

Backpressure = Cơ chế để Consumer nói với Producer:
"Chậm lại! Tôi chưa xử lý xong!"
```

### Strategies

```java
// ===== 1. Buffer (Mặc định) =====
// Giữ items trong buffer, consumer lấy khi sẵn sàng
Multi<String> buffered = fastProducer()
    .onOverflow().buffer(1000);  // Buffer tối đa 1000 items
// Nếu buffer đầy → BackPressureFailure

// ===== 2. Drop (Bỏ item mới) =====
Multi<String> dropped = fastProducer()
    .onOverflow().drop();  // Bỏ item mới nhất khi consumer bận
// Phù hợp: Sensor data, stock prices (chỉ cần giá trị mới nhất)

// ===== 3. Drop with callback =====
Multi<String> droppedWithLog = fastProducer()
    .onOverflow().drop(item -> log.warn("Dropped: {}", item));

// ===== 4. Latest (Giữ item mới nhất) =====
// Khi consumer sẵn sàng → Nhận item MỚI NHẤT (bỏ tất cả items cũ)
Multi<String> latest = fastProducer()
    .onOverflow().dropPreviousItems();

// ===== 5. Request-based (Pull model) =====
// Consumer chủ động request N items
Multi<String> controlled = producer()
    .onSubscription().invoke(sub -> sub.request(10));  // Request 10 items
```

---

## Bridging: Blocking ↔ Reactive

### Blocking → Reactive

```java
// ===== Cách 1: Wrap blocking call trong Uni + runSubscriptionOn =====
Uni<String> reactive = Uni.createFrom()
    .item(() -> jdbcTemplate.queryForObject("SELECT name FROM users WHERE id = 1", String.class))
    .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());

// ===== Cách 2: Emitter =====
Uni<String> fromLegacy = Uni.createFrom().emitter(emitter -> {
    try {
        String result = legacyBlockingService.call();
        emitter.complete(result);
    } catch (Exception e) {
        emitter.fail(e);
    }
});

// ===== Multi từ blocking Iterator =====
Multi<String> fromIterator = Multi.createFrom()
    .iterable(() -> blockingService.getAllItems())  // Blocking
    .runSubscriptionOn(Infrastructure.getDefaultWorkerPool());
```

### Reactive → Blocking

```java
// ===== Chờ kết quả (BLOCKING - chỉ dùng trong test hoặc worker thread) =====
// CẢNH BÁO: KHÔNG BAO GIỜ dùng trên Event Loop!
String result = callReactiveService()
    .await().atMost(Duration.ofSeconds(5));  // Block và chờ tối đa 5 giây

List<String> items = getReactiveStream()
    .collect().asList()
    .await().atMost(Duration.ofSeconds(10));
```

---

## Vert.x Integration

### Truy cập Vert.x trực tiếp

```java
@ApplicationScoped
public class VertxService {

    @Inject
    Vertx vertx;  // Vert.x instance (io.vertx.mutiny.core.Vertx - Mutiny version)

    // Đọc file reactive
    public Uni<String> readFile(String path) {
        return vertx.fileSystem().readFile(path)
            .map(Buffer::toString);
    }

    // HTTP Client reactive
    public Uni<String> callApi(String url) {
        WebClient client = WebClient.create(vertx);
        return client.getAbs(url)
            .send()
            .map(response -> response.bodyAsString());
    }

    // Event Bus (pub/sub trong process)
    public void publishEvent(String address, String message) {
        vertx.eventBus().publish(address, message);
    }

    // Timer
    public Uni<Long> delay(long ms) {
        return vertx.setTimer(ms);
    }
}
```

### Vert.x Event Bus

```java
// Publisher
@ApplicationScoped
public class NotificationPublisher {
    @Inject Vertx vertx;

    public void notify(String userId, String message) {
        vertx.eventBus().publish("notifications." + userId, message);
    }
}

// Consumer (annotation-based)
@ApplicationScoped
public class NotificationConsumer {

    @ConsumeEvent("notifications.admin")
    public void onAdminNotification(String message) {
        log.info("Admin notification: {}", message);
    }

    @ConsumeEvent("order.process")
    public Uni<String> processOrder(String orderId) {
        return orderService.process(orderId)
            .map(result -> "Processed: " + result);
    }
}
```

---

## Common Pitfalls & Anti-patterns

### 1. Blocking trên Event Loop

```java
// ❌ SAI: Block event loop → Toàn bộ request bị treo
@GET
public Uni<String> bad() {
    Thread.sleep(1000);  // BLOCK EVENT LOOP!
    return Uni.createFrom().item("too late");
}

// ✅ ĐÚNG: Dùng delay reactive
@GET
public Uni<String> good() {
    return Uni.createFrom().item("hello")
        .onItem().delayIt().by(Duration.ofSeconds(1));
}
```

### 2. Subscribe nhiều lần

```java
// ❌ SAI: Mỗi lần subscribe → Gọi lại API
Uni<User> user = callRemoteApi();
user.subscribe().with(u -> log.info("Name: {}", u.getName()));
user.subscribe().with(u -> log.info("Email: {}", u.getEmail()));
// → API bị gọi 2 lần!

// ✅ ĐÚNG: Dùng memoize hoặc chain
Uni<User> cached = callRemoteApi().memoize().indefinitely();
cached.subscribe().with(u -> log.info("Name: {}", u.getName()));
cached.subscribe().with(u -> log.info("Email: {}", u.getEmail()));
// → API chỉ gọi 1 lần, cache kết quả
```

### 3. Quên return Uni trong chain

```java
// ❌ SAI: Gọi reactive method nhưng không return → Không bao giờ execute
@POST
@Transactional
public Uni<Response> create(Product product) {
    productRepo.persist(product);  // KHÔNG RETURN → Không execute!
    return Uni.createFrom().item(Response.ok().build());
}

// ✅ ĐÚNG: Return và chain
@POST
public Uni<Response> create(Product product) {
    return Panache.withTransaction(product::persist)
        .replaceWith(() -> Response.ok(product).build());
}
```

### 4. Mix blocking và reactive Panache

```java
// ❌ SAI: Import sai package
import io.quarkus.hibernate.orm.panache.PanacheEntity;  // BLOCKING!
// Dùng với reactive endpoint → Error

// ✅ ĐÚNG: Import reactive package
import io.quarkus.hibernate.reactive.panache.PanacheEntity;  // REACTIVE
```

### 5. Catch exception trong reactive chain

```java
// ❌ SAI: try-catch không bắt được exception trong reactive pipeline
@GET
public Uni<String> bad() {
    try {
        return callService();  // Exception xảy ra TRONG pipeline, không tại đây
    } catch (Exception e) {
        return Uni.createFrom().item("fallback");
    }
}

// ✅ ĐÚNG: Dùng onFailure
@GET
public Uni<String> good() {
    return callService()
        .onFailure().recoverWithItem("fallback");
}
```

---

## Câu hỏi thường gặp

### Q1: Mutiny vs Reactor (Spring WebFlux)?

| | Mutiny | Reactor |
| :--- | :--- | :--- |
| **Framework** | Quarkus | Spring WebFlux |
| **API style** | Event-driven, method chaining dễ đọc | Operator-centric, cần nhớ nhiều operators |
| **Types** | `Uni<T>`, `Multi<T>` | `Mono<T>`, `Flux<T>` |
| **Operators** | ~50 (đủ dùng) | ~200+ (mạnh nhưng phức tạp) |
| **Interop** | Convert sang Reactor/RxJava | Convert sang Mutiny |
| **Best for** | Quarkus ecosystem | Spring ecosystem |

### Q2: Khi nào dùng Uni vs Multi?

- **Uni**: 1 kết quả (findById, HTTP call, create/update/delete)
- **Multi**: Nhiều kết quả (findAll stream, SSE, Kafka consumer, periodic events)
- **Quy tắc**: Nếu method trả về `List<T>` trong blocking → Trả `Uni<List<T>>` hoặc `Multi<T>` trong reactive
  - `Uni<List<T>>`: Khi cần toàn bộ list trước khi xử lý
  - `Multi<T>`: Khi muốn stream từng item (SSE, large dataset)

### Q3: emitOn vs runSubscriptionOn?

- **emitOn**: Chuyển thread cho code **phía sau** (downstream)
- **runSubscriptionOn**: Chuyển thread cho code **phía trước** (subscription/upstream)
- **Khi nào dùng emitOn**: Pipeline reactive, 1 bước giữa cần blocking
- **Khi nào dùng runSubscriptionOn**: Source (nguồn) là blocking (JDBC, file IO)

### Q4: Reactive có nhanh hơn blocking không?

- **Throughput**: Có, reactive xử lý được nhiều concurrent request hơn với ít thread hơn
- **Latency**: Không nhất thiết. Một request đơn lẻ có thể có latency tương đương hoặc hơi cao hơn (overhead event loop)
- **Kết luận**: Reactive tốt hơn khi **concurrent connections cao** và **I/O-bound**. Blocking tốt hơn khi **CPU-bound** hoặc **concurrent thấp**.

### Q5: Context Propagation hoạt động thế nào?

- Quarkus (SmallRye Context Propagation) tự động capture context tại subscribe point
- Khi switch thread (emitOn, runSubscriptionOn), context được restore trên thread mới
- Hoạt động cho: CDI Request Scope, Security Identity, Transaction, MDC, OpenTelemetry Trace
- **Chỉ cần thêm dependency** `quarkus-smallrye-context-propagation` → Tự động

---

## Best Practices

1. **Golden Rule**: KHÔNG BAO GIỜ block Event Loop thread
2. **Smart Dispatching**: Để RESTEasy Reactive tự quyết định thread (trả Uni → event loop, trả Object → worker)
3. **Error handling**: Luôn có `.onFailure()` handler trong chain
4. **Timeout**: Luôn đặt timeout cho external calls
5. **Retry with backoff**: Dùng exponential backoff + jitter
6. **Context propagation**: Thêm dependency, Quarkus tự xử lý
7. **Avoid subscribe()**: Trong Quarkus endpoint, return Uni/Multi → Framework tự subscribe
8. **emitOn chỉ khi cần**: Không cần nếu toàn bộ pipeline non-blocking
9. **Test**: Dùng `uni.await().atMost()` trong test, KHÔNG trong production code
10. **Monitor**: Track event loop blocked warnings, thread utilization

---

## Tổng kết

- **Vert.x**: Nền tảng event-driven, event loop architecture
- **Mutiny**: Reactive API của Quarkus (Uni = 1 value, Multi = N values)
- **Smart Dispatching**: RESTEasy Reactive tự chọn thread
- **emitOn / runSubscriptionOn**: Kiểm soát thread execution
- **Context Propagation**: Tự động propagate security, transaction, MDC
- **Backpressure**: Buffer, drop, latest strategies
- **Reactive Messaging**: Kafka/AMQP integration seamless
- **Golden Rule**: NEVER block the event loop

---

## ===== ENHANCEMENTS =====

### Mục bổ sung sau "Backpressure Strategies": Advanced Operators & Timeout handling

```java
// ===== Advanced Backpressure Control =====
@ApplicationScoped
public class AdvancedBackpressure {

    // ===== 1. limitRequests: Rate limiting (consumer requests gradually) =====
    public Multi<String> limitRequestsExample() {
        return fastProducer()
            .limitRequests(10);  // Consumer request tối đa 10 items
        // Khi consumer request từng chút một → producer slow down
    }

    // ===== 2. bufferWithBoundedWriteQueue =====
    public Multi<String> boundedQueueExample() {
        return fastProducer()
            .bufferWithBoundedWriteQueue(1000)
            .onOverflow()
            .dropOldest();
        // Buffer size cố định, drop oldest khi full
    }

    // ===== 3. scan (stateful map) =====
    public Multi<Long> scanExample() {
        return Multi.createFrom().range(1, 5)
            .scan(0L, (acc, item) -> acc + item);
        // Output: 0, 1, 3, 6, 10 (running sum)
    }

    // ===== 4. timeout với recover =====
    public Multi<String> timeoutWithRecover() {
        return slowProducer()
            .ifNoItem().after(Duration.ofSeconds(5))
            .recoverWithMulti(() -> Multi.createFrom().items("Fallback1", "Fallback2"));
    }

    // ===== 5. Combining timeout + retry =====
    public Multi<String> timeoutWithRetry() {
        return callRemoteApi()
            .ifNoItem().after(Duration.ofSeconds(2))
            .retry()
            .withBackOff(Duration.ofMillis(100), Duration.ofSeconds(1))
            .atMost(3)
            .ifNoItem().after(Duration.ofSeconds(10))
            .fail();
        // Timeout 2s → Retry maks 3 lần với exponential backoff
        // Total timeout tối đa 10s
    }

    // ===== 6. Race & First =====
    public Uni<String> raceMultipleUnis() {
        return Uni.combine().any()
            .of(callService1(), callService2(), callService3());
        // Return kết quả đầu tiên complete, cancel các cái khác
    }

    // ===== 7. Merge vs Concatenate vs Combine =====
    public void mergeVsConcatenate() {
        Multi<String> m1 = Multi.createFrom().items("a", "b");
        Multi<String> m2 = Multi.createFrom().items("c", "d");

        // Merge: Interleaved (phụ thuộc timing)
        Multi<String> merged = Multi.createBy().merging().streams(m1, m2);
        // Output có thể: a, c, b, d hoặc a, b, c, d (race condition)

        // Concatenate: Sequential (m1 hết → m2)
        Multi<String> concat = Multi.createBy().concatenating().streams(m1, m2);
        // Output: a, b, c, d (guaranteed order)
    }

    // ===== 8. Skip & Take =====
    public Multi<String> skipAndTake() {
        return Multi.createFrom().range(1, 100)
            .skip().first(10)    // Skip 10 items
            .select().first(20)  // Take 20 items
            .map(i -> "Item " + i);
        // Output: Item 11 → Item 30
    }

    // ===== 9. Debounce (ignore rapid emissions) =====
    public Multi<String> debounceExample() {
        return eventStream()
            .select().where(item -> Duration.ofMillis(300))
            .run(executorService);
        // Emit only items separated by > 300ms
        // Useful: Search box typing → emit search only after user stops typing
    }
}
```

### Mục bổ sung: Testing Reactive Code chi tiết

```java
@QuarkusTest
public class ReactiveTestingExamples {

    // ===== Test Uni: await() trong test =====
    @Test
    public void testUniSuccessful() {
        User result = reactiveUserService.getUser(1L)
            .await().atMost(Duration.ofSeconds(5));

        assertNotNull(result);
        assertEquals("John", result.name);
    }

    @Test
    public void testUniFailure() {
        assertThrows(NotFoundException.class, () ->
            reactiveUserService.getUser(99999L)
                .await().atMost(Duration.ofSeconds(5))
        );
    }

    @Test
    public void testUniWithRetry() {
        // Mock retry behavior
        Mockito.when(unreliableService.getData())
            .thenThrow(new RuntimeException("Fail 1"))
            .thenThrow(new RuntimeException("Fail 2"))
            .thenReturn(Uni.createFrom().item("Success"));

        String result = unreliableService.getData()
            .onFailure().retry().atMost(2)
            .await().atMost(Duration.ofSeconds(5));

        assertEquals("Success", result);
    }

    // ===== Test Multi: collect() to List =====
    @Test
    public void testMultiCollect() {
        List<String> items = reactiveService.getStream()
            .collect().asList()
            .await().atMost(Duration.ofSeconds(5));

        assertEquals(3, items.size());
        assertTrue(items.contains("item1"));
    }

    @Test
    public void testMultiWithFilter() {
        List<String> filtered = Multi.createFrom().items("apple", "banana", "apricot")
            .filter(s -> s.startsWith("a"))
            .collect().asList()
            .await().atMost(Duration.ofSeconds(5));

        assertEquals(2, filtered.size());
    }

    @Test
    public void testMultiTimeout() {
        assertThrows(TimeoutException.class, () ->
            Multi.createFrom().emitter(emitter -> {
                // Never emit or complete
            })
            .collect().asList()
            .await().atMost(Duration.ofMillis(100))
        );
    }

    // ===== Test Backpressure =====
    @Test
    public void testBackpressure() {
        List<Integer> collected = new ArrayList<>();
        CountDownLatch completed = new CountDownLatch(1);

        Multi.createFrom().range(1, 1000)
            .onItem().invoke(collected::add)
            .select().first(50)  // Chỉ lấy 50
            .subscribe().with(
                item -> {},
                failure -> fail(failure),
                () -> completed.countDown()
            );

        completed.await(5, TimeUnit.SECONDS);
        assertEquals(50, collected.size());
    }

    // ===== Test Merge/Concat Order =====
    @Test
    public void testConcatenateOrder() {
        Multi<String> m1 = Multi.createFrom().items("a", "b");
        Multi<String> m2 = Multi.createFrom().items("c", "d");

        List<String> result = Multi.createBy().concatenating()
            .streams(m1, m2)
            .collect().asList()
            .await().atMost(Duration.ofSeconds(5));

        assertEquals(List.of("a", "b", "c", "d"), result);
    }

    // ===== Test Error Handling =====
    @Test
    public void testFallback() {
        String result = failingService.getData()
            .onFailure().recoverWithItem("fallback-value")
            .await().atMost(Duration.ofSeconds(5));

        assertEquals("fallback-value", result);
    }

    // ===== Test Context Propagation =====
    @Test
    @TestSecurity(user = "testuser", roles = {"user"})
    public void testSecurityContextPropagation() {
        String user = reactiveService.getCurrentUser()
            .await().atMost(Duration.ofSeconds(5));

        assertEquals("testuser", user);
        // SecurityContext được propagate qua reactive chain
    }
}
```

### Mục bổ sung: Timeout handling chi tiết

```java
// ===== Timeout Patterns trong Reactive =====
@ApplicationScoped
public class TimeoutPatterns {

    // ===== Pattern 1: Timeout with Fallback =====
    public Uni<String> getDataWithFallback() {
        return externalService.fetchData()
            .ifNoItem().after(Duration.ofSeconds(3))
            .recoverWithItem("Cache from yesterday");  // ← Fallback
        // Nếu 3s không reply → trả cache
    }

    // ===== Pattern 2: Timeout then Fail =====
    public Uni<String> getDataOrFail() {
        return externalService.fetchData()
            .ifNoItem().after(Duration.ofSeconds(5))
            .fail();  // ← Exception thay vì hang
        // Nếu 5s không reply → TimeoutException
    }

    // ===== Pattern 3: Timeout with Circuit Breaker =====
    public Uni<String> getDataWithCircuitBreaker() {
        return externalService.fetchData()
            .ifNoItem().after(Duration.ofSeconds(2))
            .failWith(() -> new TimeoutException("Service too slow"))
            .onFailure().transform(e -> {
                // Log timeout, maybe trigger circuit breaker
                log.warn("Timeout after 2s: " + e.getMessage());
                throw new ServiceUnavailableException("Timeout");
            });
    }

    // ===== Pattern 4: Multiple timeouts (Progressive backoff) =====
    public Uni<String> getDataWithProgressiveTimeout() {
        return externalService.fetchData()
            // Timeout 1: Quick fail (100ms) → Retry
            .ifNoItem().after(Duration.ofMillis(100))
            .recoverWithUni(this::retryWithLongerTimeout)
            .ifNoItem().after(Duration.ofSeconds(1))
            .fail();
    }

    private Uni<String> retryWithLongerTimeout() {
        return externalService.fetchData()
            .ifNoItem().after(Duration.ofSeconds(2))
            .fail();
    }

    // ===== Pattern 5: Timeout per hop (Chain timeout) =====
    public Uni<UserData> getComplexData(Long userId) {
        return getUserProfile(userId)        // Timeout 1s
            .ifNoItem().after(Duration.ofSeconds(1)).failWith(() -> 
                new TimeoutException("Profile timeout"))
            .chain(profile -> getOrders(profile.id))  // Timeout 2s
            .ifNoItem().after(Duration.ofSeconds(2)).failWith(() ->
                new TimeoutException("Orders timeout"))
            .chain(orders -> getPaymentHistory(orders))  // Timeout 1.5s
            .ifNoItem().after(Duration.ofMillis(1500)).failWith(() ->
                new TimeoutException("Payment timeout"));
    }

    // ===== Pattern 6: Timeout with Retry Logic =====
    public Uni<String> getDataWithTimeoutAndRetry() {
        return externalService.fetchData()
            .ifNoItem().after(Duration.ofSeconds(2))
            .retry()  // ← Retry khi timeout
            .withBackOff(Duration.ofMillis(100), Duration.ofSeconds(1))
            .atMost(3)
            .ifNoItem().after(Duration.ofSeconds(10))  // ← Overall timeout
            .failWith(() -> new TimeoutException("All retries exhausted"));
    }
}
```

### Mục bổ sung: Reactive REST Testing

```java
@QuarkusTest
public class ReactiveRestTestingExamples {

    // ===== REST-Assured với Reactive endpoints =====
    @Test
    void testReactiveGet() {
        given()
            .when().get("/api/reactive/users/1")
            .then()
            .statusCode(200)
            .body("id", equalTo(1))
            .body("name", notNullValue());
        // REST-Assured tự xử lý Uni/Multi response
    }

    @Test
    void testReactivePost() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"name\":\"John\",\"email\":\"john@test.com\"}")
            .when().post("/api/reactive/users")
            .then()
            .statusCode(201)
            .body("id", notNullValue());
    }

    @Test
    void testReactiveDelete() {
        given()
            .when().delete("/api/reactive/users/999")
            .then()
            .statusCode(404);
    }

    // ===== SSE Streaming =====
    @Test
    void testSSEStreaming() throws Exception {
        // SSE: Server sends events in real-time
        given()
            .accept("text/event-stream")
            .when().get("/api/reactive/events/stream")
            .then()
            .statusCode(200)
            .contentType(containsString("text/event-stream"));

        // Để test actual events: dùng Awaitility
        List<String> events = new ArrayList<>();
        AtomicReference<Response> responseRef = new AtomicReference<>();

        Thread thread = new Thread(() -> {
            Response response = given()
                .accept("text/event-stream")
                .when().get("/api/reactive/events/stream");
            responseRef.set(response);

            // Parse SSE events từ streaming response
            String body = response.getBody().asString();
            Arrays.stream(body.split("\n\n"))
                .filter(event -> !event.isBlank())
                .forEach(events::add);
        });

        thread.start();
        await().timeout(Duration.ofSeconds(5)).until(() -> events.size() > 0);
    }
}
```
